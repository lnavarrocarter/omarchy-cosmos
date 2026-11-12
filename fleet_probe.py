#!/usr/bin/env python3
"""Fleet probe for Cosmos: what the agents are doing, as numbers only.

Reads, never writes anything but its own cache:
- Hub tasks through the installed local.coordination hub_client (status,
  engine, tokens, elapsed). No prompt or summary text is passed on.
- Today's token use and prompt count from local Claude Code and Codex CLI
  session logs. Only usage numbers, record types and timestamps are read;
  message content is never copied out. Codex also reports its own plan
  limits (percent used per window), which size its fuel when present.
- Optionally (--ollama UNIT, off by default; 'system:NAME' for a system unit) the local model's own token
  counts from its systemd user journal: only the numeric llama.cpp timing
  lines are matched; every other line, including any prompt text the
  server may log, is dropped unread.

Logs are parsed incrementally: the cache keeps a byte offset per file, so a
run only reads what was appended since the last one.
"""
import importlib.util
import json
import os
import re
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

HOME = Path.home()
CACHE = HOME / '.cache' / 'cosmos' / 'fleet.json'
CLAUDE_ROOT = HOME / '.claude' / 'projects'
CODEX_ROOT = HOME / '.codex' / 'sessions'
HUB_CLIENT = HOME / '.config' / 'omarchy' / 'plugins' / 'local.coordination' / 'hub_client.py'

AGENTS = ('claude', 'codex', 'copilot', 'local')
ENGINES = {'local', 'codex', 'claude', 'copilot'}
EVENT_WINDOW = 180          # seconds of recent prompts handed to the scene
MAX_EVENTS = 24
MAX_READ = 32 * 1024 * 1024  # bytes per file per run
MAX_FILES = 400
MAX_TOKENS = 10 ** 9
ALIAS = re.compile(r'[a-zA-Z0-9_-]{1,80}')
FINAL = ('completed', 'failed', 'cancelled')
TURN_STALE = 1800            # an open CLI turn older than this is a crashed session
HUB_RECENT = 120             # a task that finished since a poll this recent is news
UNIT = re.compile(r'(system:)?[a-zA-Z0-9][a-zA-Z0-9_.@-]{0,79}')
# llama.cpp slot timing lines, as Ollama's runner logs them. Numbers only.
OLLAMA_START = re.compile(r'\| processing task\b')
OLLAMA_PROMPT = re.compile(r'\| prompt eval time = +[0-9.]+ ms / +([0-9]{1,9}) tokens')
OLLAMA_EVAL = re.compile(r'\| +eval time = +[0-9.]+ ms / +([0-9]{1,9}) tokens')
OLLAMA_STOP = re.compile(r'\| stop processing\b')


def parse_ts(value):
    if not isinstance(value, str) or len(value) > 40:
        return None
    try:
        return datetime.fromisoformat(value.replace('Z', '+00:00')).timestamp()
    except ValueError:
        return None


def clamp_int(value, high=MAX_TOKENS):
    return value if type(value) is int and 0 <= value <= high else 0


def local_day(ts):
    return datetime.fromtimestamp(ts).strftime('%Y-%m-%d')


def claude_record(record):
    """(kind, tokens, ts, message_id) for one Claude Code log record, or None."""
    if not isinstance(record, dict):
        return None
    ts = parse_ts(record.get('timestamp'))
    if ts is None:
        return None
    kind = record.get('type')
    message = record.get('message')
    if not isinstance(message, dict):
        return None
    if kind == 'assistant':
        usage = message.get('usage')
        if not isinstance(usage, dict):
            return None
        tokens = (clamp_int(usage.get('input_tokens')) + clamp_int(usage.get('output_tokens'))
                  + clamp_int(usage.get('cache_creation_input_tokens')))
        mid = message.get('id') if isinstance(message.get('id'), str) else None
        return ('usage', tokens, ts, mid)
    if kind == 'user' and not record.get('isMeta') and not record.get('isSidechain'):
        content = message.get('content')
        if isinstance(content, str):
            return ('prompt', 0, ts, None)
        if isinstance(content, list) and content and all(
                isinstance(item, dict) and item.get('type') in ('text', 'image') for item in content):
            return ('prompt', 0, ts, None)
    return None


def codex_record(record):
    """(kind, tokens, ts, extra) for one Codex CLI log record, or None.

    kinds: prompt, usage, limits (extra = plan limit windows), meta (extra =
    'subagent' or 'user'), turn_start, turn_end.
    """
    if not isinstance(record, dict) or record.get('type') not in ('event_msg', 'response_item', 'session_meta'):
        return None
    ts = parse_ts(record.get('timestamp'))
    payload = record.get('payload')
    if ts is None or not isinstance(payload, dict):
        return None
    if record['type'] == 'session_meta':
        # Subagents (e.g. the approval "guardian") get prompts from Codex, not you.
        source = payload.get('source')
        return ('meta', 0, ts, 'subagent' if isinstance(source, dict) and 'subagent' in source else 'user')
    if record['type'] == 'response_item':
        # A typed prompt; context the CLI injects starts with a <tag> or is
        # the "# AGENTS.md instructions" preamble.
        if payload.get('type') != 'message' or payload.get('role') != 'user':
            return None
        content = payload.get('content')
        first = content[0] if isinstance(content, list) and content and isinstance(content[0], dict) else {}
        text = first.get('text')
        if isinstance(text, str):
            head = text.lstrip()[:24]
            if not head.startswith('<') and not head.startswith('# AGENTS.md'):
                return ('prompt', 0, ts, None)
        return None
    kind = payload.get('type')
    if kind == 'task_started':
        return ('turn_start', 0, ts, None)
    if kind in ('task_complete', 'turn_aborted'):
        return ('turn_end', 0, ts, None)
    if kind == 'token_count':
        info = payload.get('info')
        last = info.get('last_token_usage') if isinstance(info, dict) else None
        limits = codex_limits(payload.get('rate_limits'))
        if not isinstance(last, dict):
            return ('limits', 0, ts, limits) if limits else None
        fresh = max(0, clamp_int(last.get('input_tokens')) - clamp_int(last.get('cached_input_tokens')))
        return ('usage', fresh + clamp_int(last.get('output_tokens')), ts, limits)
    return None


def codex_limits(value):
    """Codex plan windows as [{used, resets, minutes}], numbers only."""
    if not isinstance(value, dict):
        return None
    out = []
    for key in ('primary', 'secondary'):
        window = value.get(key)
        if not isinstance(window, dict):
            continue
        used = window.get('used_percent')
        resets = window.get('resets_at')
        if type(used) not in (int, float) or not 0 <= used <= 100 or type(resets) not in (int, float):
            continue
        out.append({'used': round(float(used), 1), 'resets': int(resets),
                    'minutes': clamp_int(window.get('window_minutes'), 10 ** 6)})
    return out or None


def recent_files(root, since, pattern='*.jsonl'):
    if not root.is_dir():
        return []
    found = []
    for path in root.rglob(pattern):
        try:
            if path.is_file() and not path.is_symlink() and path.stat().st_mtime >= since:
                found.append(path)
        except OSError:
            continue
        if len(found) >= MAX_FILES:
            break
    return found


def agent_totals(cache, day, agent):
    return cache['days'].setdefault(day, {}).setdefault(agent, {'tokens': 0, 'prompts': 0, 'last': 0})


def add_usage(cache, agent, totals, tokens, ts, now):
    totals['tokens'] = min(MAX_TOKENS, totals['tokens'] + tokens)
    if now - ts <= EVENT_WINDOW and cache['events'] and cache['events'][-1]['agent'] == agent:
        cache['events'][-1]['tokens'] = min(MAX_TOKENS, cache['events'][-1]['tokens'] + tokens)


def add_prompt(cache, agent, totals, ts, now):
    totals['prompts'] += 1
    if now - ts <= EVENT_WINDOW:
        cache['events'].append({'agent': agent, 'at': round(ts, 3), 'tokens': 0})


def scan(cache, agent, files, parser, now):
    """Fold newly appended records of each file into today's totals."""
    today = local_day(now)
    totals = agent_totals(cache, today, agent)
    offsets = cache['offsets']
    seen_ids = cache['message_ids']
    sources = cache['sources']
    turns = cache['turns']
    for path in files:
        key = str(path)
        try:
            size = path.stat().st_size
        except OSError:
            continue
        start = offsets.get(key, 0)
        if start > size:
            start = 0
        if size - start > MAX_READ:
            start = size - MAX_READ
        if start == size:
            continue
        try:
            with open(path, 'rb') as handle:
                handle.seek(start)
                chunk = handle.read(size - start)
        except OSError:
            continue
        end = chunk.rfind(b'\n')
        if end < 0:
            continue
        offsets[key] = start + end + 1
        ids = seen_ids.setdefault(key, [])
        for line in chunk[:end].split(b'\n'):
            if not line.strip():
                continue
            try:
                record = json.loads(line)
            except (ValueError, UnicodeDecodeError):
                continue
            parsed = parser(record)
            if not parsed:
                continue
            kind, tokens, ts, extra = parsed
            if kind == 'meta':
                sources[key] = [extra, ts]
                continue
            # An open turn keeps the ship flying through long tool calls.
            if kind == 'turn_start' or key in turns:
                turns[key] = [agent, ts]
            if kind == 'turn_end':
                turns.pop(key, None)
            if kind in ('usage', 'limits') and isinstance(extra, list) and ts >= cache['limits'].get(agent, {}).get('at', 0):
                cache['limits'][agent] = {'at': ts, 'windows': extra}
            if kind == 'usage' and agent == 'codex' and key in sources and ts - sources[key][1] < 1:
                # A forked or subagent session first replays its parent's last usage.
                continue
            if local_day(ts) != today or kind in ('turn_start', 'turn_end', 'limits'):
                continue
            if kind == 'usage' and isinstance(extra, str):
                # Claude Code repeats a streamed message's usage on each chunk.
                if extra in ids:
                    continue
                ids.append(extra)
                del ids[:-64]
            if kind == 'prompt' and sources.get(key, ['user'])[0] == 'subagent':
                continue
            totals['last'] = max(totals['last'], ts)
            if kind == 'usage':
                add_usage(cache, agent, totals, tokens, ts, now)
            else:
                add_prompt(cache, agent, totals, ts, now)


def journal_lines(unit, cursor, since):
    """(lines, cursor) of a user unit's journal after cursor, or since a time."""
    # 'system:ollama' reads a system unit; a bare name is a user unit.
    system = unit.startswith('system:')
    name = unit[len('system:'):] if system else unit
    command = ['journalctl'] + ([] if system else ['--user']) + ['-u', name, '-o', 'short-unix', '--no-pager',
                                                                '--show-cursor', '-q']
    command += ['--after-cursor', cursor] if cursor else ['--since', '@%d' % int(since)]
    try:
        out = subprocess.run(command, capture_output=True, timeout=4, check=False).stdout
    except (OSError, subprocess.SubprocessError):
        return [], cursor
    lines = out[-MAX_READ:].decode('utf-8', 'replace').split('\n')
    for line in reversed(lines[-3:]):
        if line.startswith('-- cursor: '):
            cursor = line[len('-- cursor: '):].strip()[:400]
            break
    return lines, cursor


def scan_ollama(cache, unit, now, reader=journal_lines):
    """Local model use from Ollama's journal: tokens, requests and busy state.

    Only lines that match the numeric llama.cpp timing patterns are used; the
    rest (which may include prompt text) is discarded without being kept.
    """
    state = cache.setdefault('ollama', {})
    if state.get('unit') != unit:
        state.clear()
        state['unit'] = unit
    midnight = datetime.fromtimestamp(now).replace(hour=0, minute=0, second=0, microsecond=0).timestamp()
    lines, state['cursor'] = reader(unit, state.get('cursor'), midnight)
    today = local_day(now)
    totals = agent_totals(cache, today, 'local')
    for line in lines:
        head, _, rest = line.partition(' ')
        try:
            ts = float(head)
        except ValueError:
            continue
        if OLLAMA_START.search(rest):
            state['busy'] = ts
        elif OLLAMA_STOP.search(rest):
            state.pop('busy', None)
        else:
            match = OLLAMA_PROMPT.search(rest)
            if match:
                if local_day(ts) == today:
                    totals['last'] = max(totals['last'], ts)
                    add_prompt(cache, 'local', totals, ts, now)
                    add_usage(cache, 'local', totals, clamp_int(int(match.group(1))), ts, now)
                continue
            match = OLLAMA_EVAL.search(rest)
            if not match:
                continue
            if local_day(ts) == today:
                totals['last'] = max(totals['last'], ts)
                add_usage(cache, 'local', totals, clamp_int(int(match.group(1))), ts, now)


def load_hub():
    if not HUB_CLIENT.is_file():
        return None
    spec = importlib.util.spec_from_file_location('cosmos_hub_client', HUB_CLIENT)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def hub_tasks(cache, now, client=None, local_counted=False):
    """Task states without text; finished tasks add their tokens to today once.

    A task that finished since the previous poll is flagged recent, so the
    scene can still fly it when it ran in less time than one poll takes.
    With local_counted the local model's tokens already come from its own
    log, so local Hub tasks only mark activity.
    """
    try:
        client = client or load_hub()
        data = client.snapshot() if client else None
    except Exception:
        data = None
    if not isinstance(data, dict):
        return {'online': False, 'status': 'unavailable', 'tasks': [], 'workspaces': []}
    today = local_day(now)
    counted = cache['hub_counted']
    primed = bool(cache.get('hub_primed'))
    fresh = primed and now - cache.get('hub_polled', 0) <= HUB_RECENT
    tasks = []
    raw = data.get('tasks')
    for task in (raw if isinstance(raw, list) else [])[:20]:
        if not isinstance(task, dict):
            continue
        metrics = task.get('metrics') or {}
        engine = metrics.get('engine') if metrics.get('engine') in ENGINES else task.get('execution')
        if engine not in ENGINES:
            # 'auto' routes on the local model first; engine 'none' never left it.
            engine = 'local' if task.get('execution') in ('auto', None) or metrics.get('engine') == 'none' else 'codex'
        tokens = 0
        for key in ('local_tokens', 'external_tokens'):
            usage = metrics.get(key)
            if isinstance(usage, dict):
                tokens += clamp_int(usage.get('input')) + clamp_int(usage.get('output'))
        status = task.get('status')
        task_id = task.get('id')
        if not isinstance(task_id, str) or not ALIAS.fullmatch(task_id):
            continue
        recent = False
        if status in FINAL and task_id not in counted:
            # The first time a finished task is seen it counts for today.
            counted[task_id] = today
            if primed:
                totals = agent_totals(cache, today, engine)
                if not (local_counted and engine == 'local'):
                    totals['tokens'] = min(MAX_TOKENS, totals['tokens'] + tokens)
                totals['last'] = now
                recent = fresh
        workspace = task.get('workspace')
        entry = {'id': task_id, 'status': status, 'engine': engine, 'tokens': tokens,
                 'workspace': workspace if isinstance(workspace, str) and ALIAS.fullmatch(workspace) else '',
                 'elapsed_ms': clamp_int(metrics.get('elapsed_ms'), 900000)}
        if recent:
            entry['recent'] = True
        tasks.append(entry)
    # Tasks already finished before the first run are history, not today's fuel.
    cache['hub_primed'] = True
    cache['hub_polled'] = now
    if len(counted) > 200:
        for key in list(counted)[:-200]:
            counted.pop(key, None)
    workspaces = [w for w in data.get('workspaces', [])[:20] if isinstance(w, str) and ALIAS.fullmatch(w)]
    return {'online': bool(data.get('online')), 'status': str(data.get('status', ''))[:20], 'tasks': tasks,
            'workspaces': workspaces}


def load_cache():
    try:
        cache = json.loads(CACHE.read_text())
        if not isinstance(cache, dict):
            raise ValueError
    except (OSError, ValueError):
        cache = {}
    cache.setdefault('days', {})
    cache.setdefault('offsets', {})
    cache.setdefault('message_ids', {})
    cache.setdefault('events', [])
    cache.setdefault('hub_counted', {})
    cache.setdefault('sources', {})
    cache.setdefault('turns', {})
    cache.setdefault('limits', {})
    return cache


def save_cache(cache, now):
    keep = {local_day(now), local_day(now - 86400)}
    cache['days'] = {day: value for day, value in cache['days'].items() if day in keep}
    cache['events'] = [e for e in cache['events'] if now - e['at'] <= EVENT_WINDOW][-MAX_EVENTS:]
    live = {k for k in cache['offsets'] if Path(k).exists()}
    cache['offsets'] = {k: v for k, v in cache['offsets'].items() if k in live}
    cache['message_ids'] = {k: v for k, v in cache['message_ids'].items() if k in live}
    cache['sources'] = {k: v for k, v in cache['sources'].items() if k in live}
    cache['turns'] = {k: v for k, v in cache['turns'].items() if k in live and now - v[1] <= TURN_STALE}
    CACHE.parent.mkdir(parents=True, exist_ok=True)
    tmp = CACHE.with_suffix('.tmp')
    tmp.write_text(json.dumps(cache))
    os.replace(tmp, CACHE)


def limit_used(entry, now):
    """Highest percent used of the plan windows that have not reset yet."""
    windows = entry.get('windows') if isinstance(entry, dict) else None
    if not windows:
        return None
    return max([w['used'] for w in windows if w.get('resets', 0) > now] or [0.0])


def snapshot(now=None, hub_client=None, use_hub=True, ollama_unit=None, journal_reader=journal_lines):
    now = now or time.time()
    cache = load_cache()
    midnight = datetime.fromtimestamp(now).replace(hour=0, minute=0, second=0, microsecond=0).timestamp()
    scan(cache, 'claude', recent_files(CLAUDE_ROOT, midnight), claude_record, now)
    scan(cache, 'codex', recent_files(CODEX_ROOT, midnight), codex_record, now)
    if ollama_unit:
        scan_ollama(cache, ollama_unit, now, journal_reader)
    hub = (hub_tasks(cache, now, hub_client, local_counted=bool(ollama_unit)) if use_hub
           else {'online': False, 'status': 'disabled', 'tasks': [], 'workspaces': []})
    today = cache['days'].get(local_day(now), {})
    busy = {v[0] for v in cache['turns'].values() if now - v[1] <= TURN_STALE}
    ollama_busy = (cache.get('ollama') or {}).get('busy')
    if ollama_unit and ollama_busy and now - ollama_busy <= 600:
        busy.add('local')
    agents = {}
    for name in AGENTS:
        totals = today.get(name, {})
        agents[name] = {'tokens_today': clamp_int(totals.get('tokens', 0)),
                        'prompts_today': clamp_int(totals.get('prompts', 0), 100000),
                        'last_activity': totals.get('last') or None,
                        'busy': name in busy}
        used = limit_used(cache['limits'].get(name), now)
        if used is not None:
            agents[name]['limit_used'] = used
    events = [e for e in cache['events'] if now - e['at'] <= EVENT_WINDOW][-MAX_EVENTS:]
    save_cache(cache, now)
    return {'time': round(now, 3), 'agents': agents, 'hub': hub, 'events': events}


def main():
    args = sys.argv[1:]
    use_hub = '--no-hub' not in args
    unit = None
    if '--ollama' in args:
        index = args.index('--ollama')
        unit = args[index + 1] if index + 1 < len(args) else ''
        if not UNIT.fullmatch(unit):
            unit = None
    try:
        print(json.dumps(snapshot(use_hub=use_hub, ollama_unit=unit)))
    except Exception as error:  # Never break the scene; report a stable shape.
        print(json.dumps({'time': time.time(), 'agents': {}, 'hub': {'online': False, 'status': 'error', 'tasks': []},
                          'events': [], 'error': type(error).__name__}))


if __name__ == '__main__':
    main()
