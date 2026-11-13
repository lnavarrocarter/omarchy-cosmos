#!/usr/bin/env python3
"""Review rendered episode GIFs with a local vision model (Ollama).

For every contact sheet <id>-<n>s.png made by tools/episode-gif.js, asks the
model to check it against the episode's title and the numbers in
<id>-<n>s.json, and writes one line of JSON per sheet to <dir>/review.jsonl.
Already reviewed sheets are skipped, so a run can be resumed.

    python3 tools/review-gifs.py <gif-dir> [model] [host]

Standard library only; nothing leaves the machine (the model is local).
"""
import base64
import json
import subprocess
import sys
import tempfile
import time
import urllib.request
from pathlib import Path

ROOT = Path(sys.argv[1]) if len(sys.argv) > 1 else None
MODEL = sys.argv[2] if len(sys.argv) > 2 else 'qwen2.5vl:7b'
HOST = sys.argv[3] if len(sys.argv) > 3 else 'http://127.0.0.1:11434'

PROMPT = """You review a pixel-art space wallpaper animation. The image is a contact sheet: six moments of one
short animated episode, in time order (left to right, top to bottom). The scene spans {screens} screen(s)
side by side (black vertical bars are the gaps between screens). Places: {places} ("small" = shown smaller
at the side). Episode title (Spanish): "{title}". Its main place: {zone}.

Renderer numbers: {frames} frames; frames with nothing of the episode visible: {empty}; actor-frames
outside every screen: {offscreen} of {actor_frames}; missing sprites: {missing}.

Check for real problems only:
- the episode's characters or objects cut off at an image edge or hidden in a gap between screens
- nothing happening (all six moments look the same, or the episode's things never appear)
- things drawn in a wrong place (inside a planet, far from where the story happens)
- garbled or broken sprites, unreadable text
Answer with JSON only: {{"ok": true|false, "severity": "none"|"minor"|"major",
"issues": ["short issue", ...], "summary": "one sentence of what happens"}}"""


MAX_WIDTH = 1280


def image_bytes(path):
    """The sheet, scaled down to MAX_WIDTH when wider: a big image needs more
    GPU memory than a 12 GB card has left for the vision encoder."""
    with open(path, 'rb') as f:
        head = f.read(24)
    width = int.from_bytes(head[16:20], 'big') if head[:8] == b'\x89PNG\r\n\x1a\n' else 0
    if width <= MAX_WIDTH:
        return path.read_bytes()
    with tempfile.NamedTemporaryFile(suffix='.png') as tmp:
        subprocess.run(['magick', str(path), '-resize', f'{MAX_WIDTH}x', tmp.name], check=True)
        return Path(tmp.name).read_bytes()


def ask(image_path, meta, title, zone):
    prompt = PROMPT.format(screens=meta['screens'], places=', '.join(meta['places']), title=title, zone=zone,
                           frames=meta['frames'], empty=meta['emptyFrames'], offscreen=meta['offscreenActorFrames'],
                           actor_frames=meta['actorFrames'], missing=meta['missingSprites'] or 'none')
    body = json.dumps({'model': MODEL, 'prompt': prompt, 'stream': False, 'format': 'json',
                       'images': [base64.b64encode(image_bytes(image_path)).decode()],
                       'options': {'temperature': 0.1, 'num_ctx': 8192}}).encode()
    req = urllib.request.Request(HOST + '/api/generate', data=body, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=600) as r:
        out = json.loads(r.read())
    try:
        verdict = json.loads(out.get('response') or '{}')
    except json.JSONDecodeError:
        verdict = {'ok': None, 'severity': 'unknown', 'issues': ['unparsable answer'], 'summary': out.get('response', '')[:200]}
    return verdict


def main():
    if not ROOT or not ROOT.is_dir():
        print(__doc__)
        return 2
    titles = json.loads(sys.stdin.read()) if not sys.stdin.isatty() else {}
    log = ROOT / 'review.jsonl'
    done = set()
    if log.exists():
        for line in log.read_text().splitlines():
            try:
                row = json.loads(line)
                # Only a real verdict counts as done; errors are retried.
                if row.get('severity') in ('none', 'minor', 'major'):
                    done.add(row['sheet'])
            except (ValueError, KeyError):
                pass
    sheets = sorted(ROOT.glob('*/*s.png'))
    with log.open('a') as f:
        for k, png in enumerate(sheets):
            rel = str(png.relative_to(ROOT))
            if rel in done:
                continue
            meta = json.loads(png.with_suffix('.json').read_text())
            info = titles.get(meta['id'], {})
            t0 = time.time()
            try:
                v = ask(png, meta, info.get('title', meta['id']), info.get('zone', '?'))
            except Exception as e:  # keep going; the line records the failure
                v = {'ok': None, 'severity': 'error', 'issues': [str(e)[:200]], 'summary': ''}
            row = {'sheet': rel, 'id': meta['id'], 'screens': meta['screens'], **v,
                   'seconds': round(time.time() - t0, 1)}
            f.write(json.dumps(row, ensure_ascii=False) + '\n')
            f.flush()
            print(f"[{k + 1}/{len(sheets)}] {rel}: {v.get('severity')} {v.get('issues')}", flush=True)
    return 0


if __name__ == '__main__':
    sys.exit(main())
