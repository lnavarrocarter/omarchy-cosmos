#!/usr/bin/env python3
"""Fleet probe for Cosmos: what the agents are doing, as numbers only.

Reads, never writes anything but its own cache:
- Hub tasks through the installed local.coordination hub_client (status,
  engine, tokens, elapsed). No prompt or summary text is passed on.
- Today's token use and prompt count from local Claude Code and Codex CLI
  session logs. Only usage numbers, record types and timestamps are read;
  message content is never copied out.

Logs are parsed incrementally: the cache keeps a byte offset per file, so a
run only reads what was appended since the last one.
"""
import importlib.util
import json
import os
import re
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
    """(kind, tokens, ts, None) for one Codex CLI log record, or None."""
    if not isinstance(record, dict) or record.get('type') not in ('event_msg', 'response_item'):
        return None
    ts = parse_ts(record.get('timestamp'))
    payload = record.get('payload')
    if ts is None or not isinstance(payload, dict):
        return None
    if record['type'] == 'response_item':
        # A typed prompt; context the CLI injects starts with a <tag>.
        if payload.get('type') != 'message' or payload.get('role') != 'user':
            return None
        content = payload.get('content')
        first = content[0] if isinstance(content, list) and content and isinstance(content[0], dict) else {}
        text = first.get('text')
        if isinstance(text, str) and not text.lstrip().startswith('<'):
            return ('prompt', 0, ts, None)
        return None
    if payload.get('type') == 'token_count':
        info = payload.get('info')
        last = info.get('last_token_usage') if isinstance(info, dict) else None
        if not isinstance(last, dict):
            return None
        fresh = max(0, clamp_int(last.get('input_tokens')) - clamp_int(last.get('cached_input_tokens')))
        return ('usage', fresh + clamp_int(last.get('output_tokens')), ts, None)
    return None


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


def scan(cache, agent, files, parser, now):
    """Fold newly appended records of each file into today's totals."""
    today = local_day(now)
    totals = cache['days'].setdefault(today, {}).setdefault(agent, {'tokens': 0, 'prompts': 0, 'last': 0})
    offsets = cache['offsets']
    seen_ids = cache['message_ids']
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
            kind, tokens, ts, mid = parsed
            if local_day(ts) != today:
                continue
            if mid:
                # Claude Code repeats a streamed message's usage on each chunk.
                if mid in ids:
                    continue
                ids.append(mid)
                del ids[:-64]
            totals['last'] = max(totals['last'], ts)
            if kind == 'usage':
                totals['tokens'] = min(MAX_TOKENS, totals['tokens'] + tokens)
                if now - ts <= EVENT_WINDOW and cache['events'] and cache['events'][-1]['agent'] == agent:
                    cache['events'][-1]['tokens'] = min(MAX_TOKENS, cache['events'][-1]['tokens'] + tokens)
            else:
                totals['prompts'] += 1
                if now - ts <= EVENT_WINDOW:
                    cache['events'].append({'agent': agent, 'at': round(ts, 3), 'tokens': 0})


def load_hub():
    if not HUB_CLIENT.is_file():
        return None
    spec = importlib.util.spec_from_file_location('cosmos_hub_client', HUB_CLIENT)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def hub_tasks(cache, now, client=None):
    """Task states without text; finished tasks add their tokens to today once."""
    try:
        client = client or load_hub()
        data = client.snapshot() if client else None
    except Exception:
        data = None
    if not isinstance(data, dict):
        return {'online': False, 'status': 'unavailable', 'tasks': [], 'workspaces': []}
    today = local_day(now)
    counted = cache['hub_counted']
    tasks = []
    for task in data.get('tasks', [])[:20]:
        metrics = task.get('metrics') or {}
        engine = metrics.get('engine') if metrics.get('engine') in ENGINES else task.get('execution')
        if engine not in ENGINES:
            engine = 'local' if task.get('execution') == 'auto' else 'codex'
        tokens = 0
        for key in ('local_tokens', 'external_tokens'):
            usage = metrics.get(key)
            if isinstance(usage, dict):
                tokens += clamp_int(usage.get('input')) + clamp_int(usage.get('output'))
        status = task.get('status')
        task_id = task.get('id')
        if status in ('completed', 'failed') and task_id not in counted:
            # The first time a finished task is seen it counts for today.
            counted[task_id] = today
            if cache.get('hub_primed'):
                totals = cache['days'].setdefault(today, {}).setdefault(engine, {'tokens': 0, 'prompts': 0, 'last': 0})
                totals['tokens'] = min(MAX_TOKENS, totals['tokens'] + tokens)
                totals['last'] = now
        workspace = task.get('workspace')
        tasks.append({'id': task_id, 'status': status, 'engine': engine, 'tokens': tokens,
                      'workspace': workspace if isinstance(workspace, str) and ALIAS.fullmatch(workspace) else '',
                      'elapsed_ms': clamp_int(metrics.get('elapsed_ms'), 900000)})
    # Tasks already finished before the first run are history, not today's fuel.
    cache['hub_primed'] = True
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
    return cache


def save_cache(cache, now):
    keep = {local_day(now), local_day(now - 86400)}
    cache['days'] = {day: value for day, value in cache['days'].items() if day in keep}
    cache['events'] = [e for e in cache['events'] if now - e['at'] <= EVENT_WINDOW][-MAX_EVENTS:]
    live = {k for k in cache['offsets'] if Path(k).exists()}
    cache['offsets'] = {k: v for k, v in cache['offsets'].items() if k in live}
    cache['message_ids'] = {k: v for k, v in cache['message_ids'].items() if k in live}
    CACHE.parent.mkdir(parents=True, exist_ok=True)
    tmp = CACHE.with_suffix('.tmp')
    tmp.write_text(json.dumps(cache))
    os.replace(tmp, CACHE)


def snapshot(now=None, hub_client=None, use_hub=True):
    now = now or time.time()
    cache = load_cache()
    midnight = datetime.fromtimestamp(now).replace(hour=0, minute=0, second=0, microsecond=0).timestamp()
    scan(cache, 'claude', recent_files(CLAUDE_ROOT, midnight), claude_record, now)
    scan(cache, 'codex', recent_files(CODEX_ROOT, midnight), codex_record, now)
    hub = hub_tasks(cache, now, hub_client) if use_hub else {'online': False, 'status': 'disabled', 'tasks': [], 'workspaces': []}
    today = cache['days'].get(local_day(now), {})
    agents = {}
    for name in AGENTS:
        totals = today.get(name, {})
        agents[name] = {'tokens_today': clamp_int(totals.get('tokens', 0)),
                        'prompts_today': clamp_int(totals.get('prompts', 0), 100000),
                        'last_activity': totals.get('last') or None}
    events = [e for e in cache['events'] if now - e['at'] <= EVENT_WINDOW][-MAX_EVENTS:]
    save_cache(cache, now)
    return {'time': round(now, 3), 'agents': agents, 'hub': hub, 'events': events}


def main():
    use_hub = '--no-hub' not in sys.argv[1:]
    try:
        print(json.dumps(snapshot(use_hub=use_hub)))
    except Exception as error:  # Never break the scene; report a stable shape.
        print(json.dumps({'time': time.time(), 'agents': {}, 'hub': {'online': False, 'status': 'error', 'tasks': []},
                          'events': [], 'error': type(error).__name__}))


if __name__ == '__main__':
    main()
