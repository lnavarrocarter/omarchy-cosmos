#!/usr/bin/env python3
"""Write index.html for a folder of episode GIFs (tools/episode-gif.js output).

One row per episode with its 1, 2 and 3 screen GIFs, the vision model's
verdict from review.jsonl when there is one, and real recordings from
real/ when they exist. Open the file in a browser; everything is local.

    python3 tools/gif-index.py <gif-dir> < titles.json
"""
import html
import json
import sys
from pathlib import Path

root = Path(sys.argv[1])
titles = json.loads(sys.stdin.read()) if not sys.stdin.isatty() else {}
dirs = {1: '1-pantalla', 2: '2-pantallas', 3: '3-pantallas'}
reviews = {}
log = root / 'review.jsonl'
if log.exists():
    for line in log.read_text().splitlines():
        try:
            r = json.loads(line)
            reviews[(r['id'], r['screens'])] = r
        except (ValueError, KeyError):
            pass

ids = sorted({p.name.rsplit('-', 1)[0] for p in (root / dirs[3]).glob('*.gif')}
             | {p.name.rsplit('-', 1)[0] for p in (root / dirs[1]).glob('*.gif')})
rows = []
for eid in ids:
    info = titles.get(eid, {})
    cells = []
    for n, d in dirs.items():
        gif = root / d / f'{eid}-{n}s.gif'
        r = reviews.get((eid, n))
        badge = ''
        if r:
            sev = html.escape(str(r.get('severity')))
            issues = html.escape('; '.join(map(str, r.get('issues') or [])))
            badge = f'<p class="v {sev}">{sev}{": " + issues if issues else ""}</p>'
        img = f'<img loading="lazy" src="{d}/{gif.name}">' if gif.exists() else '<p>no disponible</p>'
        cells.append(f'<td>{img}{badge}</td>')
    real = sorted((root / 'real').glob(f'{eid}-*s-real.gif')) if (root / 'real').exists() else []
    real_html = ''.join(f'<img loading="lazy" class="real" src="real/{p.name}">' for p in real)
    rows.append(f'<tr><th>{html.escape(eid)}<br><small>{html.escape(info.get("title", ""))} · '
                f'{html.escape(info.get("zone", ""))}</small>{real_html}</th>{"".join(cells)}</tr>')

page = f"""<!doctype html><meta charset="utf-8"><title>Cosmos: episodios</title>
<style>
body{{background:#0b0a1a;color:#e6e4ff;font:14px system-ui;margin:16px}}
table{{border-collapse:collapse;width:100%}} td,th{{border-top:1px solid #2c2550;padding:8px;vertical-align:top}}
th{{text-align:left;width:14%}} img{{max-width:100%;image-rendering:pixelated}} img.real{{margin-top:6px}}
.v{{margin:4px 0;font-size:12px}} .none{{color:#7dffb0}} .minor{{color:#ffd65a}} .major,.error{{color:#ff5c8a}}
</style>
<h1>Cosmos: {len(ids)} episodios</h1>
<p>Columnas: 1, 2 y 3 pantallas (render offline). Bajo el nombre, grabaciones de la escena real cuando existen.</p>
<table><tr><th>Episodio</th><th>1 pantalla</th><th>2 pantallas</th><th>3 pantallas</th></tr>{''.join(rows)}</table>"""
(root / 'index.html').write_text(page)
print(root / 'index.html', len(ids))
