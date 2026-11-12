#!/usr/bin/env python3
"""Turn a short description into a Cosmos planet.

    planet_ai.py [--engine auto|ollama|claude|offline] [options] -- "a frozen blue world with pink rings"

Prints {"engine": "...", "planet": {...}}: a planet spec for looks.js
(style, colors, rings, ringColors, spot, rim, name, seed). The model never
draws pixels; it only picks those parameters, and every value is checked
here and again in looks.js.

Engines, tried in this order by "auto":
- claude: only with --claude on. Uses the official `anthropic` package
  (pip install anthropic) and a key from ANTHROPIC_API_KEY,
  ~/.config/cosmos/anthropic-key or an `ant auth login` profile. The
  description is sent to Anthropic.
- ollama: a local model through Ollama's HTTP API (default 127.0.0.1:11434).
- offline: a small keyword reader, Spanish and English. Always available.
"""
import argparse
import hashlib
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

STYLES = ['bands', 'storm', 'ice', 'lava', 'ocean', 'rocky', 'crystal', 'tech']
HEX = re.compile(r'^#[0-9a-fA-F]{6}$')
KEY_FILE = Path.home() / '.config' / 'cosmos' / 'anthropic-key'
DEFAULT_CLAUDE_MODEL = 'claude-opus-5-5'
MAX_DESCRIPTION = 300

SCHEMA = {
    'type': 'object',
    'properties': {
        'name': {'type': 'string', 'description': 'A short evocative name, 1-3 words'},
        'style': {'type': 'string', 'enum': STYLES},
        'colors': {'type': 'array', 'items': {'type': 'string', 'description': '#rrggbb'},
                   'description': '3 to 6 surface colours, #rrggbb, dark to light'},
        'rings': {'type': 'boolean'},
        'ringColors': {'type': 'array', 'items': {'type': 'string', 'description': '#rrggbb'}},
        'spot': {'type': 'string', 'description': '#rrggbb, the storm spot (storm style only)'},
        'rim': {'type': 'string', 'description': '#rrggbb, the thin atmosphere glow'},
    },
    'required': ['name', 'style', 'colors', 'rings', 'ringColors', 'spot', 'rim'],
    'additionalProperties': False,
}

INSTRUCTIONS = (
    'You design planets for a pixel-art space wallpaper. From the user\'s description, choose: '
    'style (bands = gas giant with stripes, storm = gas giant with a big storm spot, ice = frozen with cracks '
    'and polar caps, lava = dark rock with glowing cracks, ocean = water with continents and clouds, '
    'rocky = desert or barren with craters, crystal = faceted gem world, tech = machine world of metal '
    'plates, seas, glowing fissures and city lights, with an artificial ring, stations and motherships), '
    '3-6 surface colours ordered dark to light (for ocean: deep water, shallow water, land, beach, clouds; '
    'for lava: rock, dark rock, glow, bright glow; for tech exactly 6: plate, seam, ocean, shallows, '
    'fissure, city lights), rings or not, 2-3 ring colours, a storm spot colour, a rim glow colour and a short '
    'name. Colours are #rrggbb. Keep the palette harmonious and readable on a dark night-blue background.'
)

# ------------------------------------------------------------------ cleaning


def clean(p):
    """A planet spec with only valid values, or None."""
    if not isinstance(p, dict):
        return None
    style = p.get('style') if p.get('style') in STYLES else 'bands'

    def colors(v, lo, hi):
        out = [c.lower() for c in (v if isinstance(v, list) else []) if isinstance(c, str) and HEX.match(c)]
        return out[:hi] if len(out) >= lo else None

    surface = colors(p.get('colors'), 2, 8)
    if not surface:
        return None
    spec = {'style': style, 'colors': surface, 'rings': bool(p.get('rings'))}
    rings = colors(p.get('ringColors'), 1, 4)
    if rings:
        spec['ringColors'] = rings
    for k in ('spot', 'rim'):
        if isinstance(p.get(k), str) and HEX.match(p[k]):
            spec[k] = p[k].lower()
    name = p.get('name')
    if isinstance(name, str):
        name = re.sub(r'[^\w .\'-]', '', name, flags=re.UNICODE).strip()[:40]
        if name:
            spec['name'] = name
    return spec


def seed_for(text):
    return int(hashlib.sha256(text.encode('utf-8')).hexdigest()[:6], 16) % 1000


# ------------------------------------------------------------------ offline

WORDS = {
    'red': ['rojo', 'roja', 'red', 'carmesí', 'carmesi', 'crimson', 'rubí', 'ruby'],
    'orange': ['naranja', 'orange', 'anaranjado'],
    'yellow': ['amarillo', 'amarilla', 'yellow', 'dorado', 'dorada', 'gold', 'golden', 'oro'],
    'green': ['verde', 'green', 'esmeralda', 'emerald', 'jade'],
    'blue': ['azul', 'blue', 'zafiro', 'sapphire', 'marino', 'navy'],
    'cyan': ['cian', 'cyan', 'turquesa', 'turquoise', 'celeste', 'aqua'],
    'purple': ['morado', 'morada', 'violeta', 'purple', 'violet', 'lila', 'lilac', 'amatista', 'amethyst', 'púrpura', 'purpura'],
    'pink': ['rosa', 'rosado', 'rosada', 'pink', 'fucsia', 'magenta'],
    'white': ['blanco', 'blanca', 'white', 'nieve', 'snow', 'plateado', 'silver', 'plata'],
    'black': ['negro', 'negra', 'black', 'oscuro', 'oscura', 'dark', 'obsidiana', 'obsidian'],
    'brown': ['café', 'cafe', 'marrón', 'marron', 'brown', 'tierra', 'chocolate'],
    'gray': ['gris', 'grey', 'gray', 'ceniza', 'ash'],
}
RAMPS = {
    'red': ['#5a1a22', '#a8323a', '#e2524a', '#ff8a7a', '#ffc2b0'],
    'orange': ['#6a3418', '#b5653f', '#ff9447', '#ffc07a', '#ffe0b8'],
    'yellow': ['#6a5418', '#b8962e', '#ffd65a', '#ffe690', '#fff6c8'],
    'green': ['#1f4a2c', '#2a7a4a', '#3fae6a', '#9be37a', '#d6f58a'],
    'blue': ['#16295a', '#1f5fa8', '#3d6fd8', '#7fb0ff', '#c6dcff'],
    'cyan': ['#134a5a', '#1f8aa8', '#58c8ff', '#9fe3ff', '#e0f8ff'],
    'purple': ['#2e1a5a', '#4a2f9a', '#7f5ae6', '#a98bff', '#d6c6ff'],
    'pink': ['#5a1a44', '#a8327a', '#ff6ad5', '#ff9be3', '#ffd0f0'],
    'white': ['#7f8aa8', '#b7c4dd', '#dfe8ff', '#f3f6ff', '#ffffff'],
    'black': ['#0d0c18', '#1b1d2b', '#2d2f45', '#4b5170', '#6b7290'],
    'brown': ['#3a2214', '#6a4024', '#8a5a35', '#b5865a', '#e0b88a'],
    'gray': ['#2d2f45', '#4b5170', '#6b7290', '#a3a9c2', '#d6dae8'],
}
STYLE_WORDS = [
    ('tech', ['tecnológico', 'tecnologico', 'tecnológica', 'tecnologica', 'tech', 'technological', 'máquina', 'maquina',
              'machine', 'mecánico', 'mecanico', 'metálico', 'metalico', 'metal', 'cyberpunk', 'ciudad', 'city',
              'ecumenópolis', 'ecumenopolis', 'robot', 'industrial', 'fábrica', 'fabrica', 'factory', 'nave', 'naves',
              'nodriza', 'nodrizas', 'satélites', 'satelites', 'estaciones']),
    ('lava', ['lava', 'volcán', 'volcan', 'volcanic', 'volcánico', 'volcanico', 'magma', 'fuego', 'fire', 'infierno', 'hell', 'molten', 'fundido']),
    ('ice', ['hielo', 'helado', 'helada', 'ice', 'icy', 'frozen', 'congelado', 'congelada', 'glaciar', 'glacier', 'nieve', 'snow', 'frío', 'frio', 'cold']),
    ('ocean', ['océano', 'oceano', 'ocean', 'mar', 'sea', 'agua', 'water', 'tierra', 'earth', 'continentes', 'continents', 'islas', 'islands', 'habitable', 'vida', 'life', 'bosque', 'forest']),
    ('crystal', ['cristal', 'crystal', 'gema', 'gem', 'diamante', 'diamond', 'cuarzo', 'quartz', 'brillante', 'shiny']),
    ('storm', ['tormenta', 'storm', 'huracán', 'huracan', 'hurricane', 'ciclón', 'ciclon', 'cyclone', 'mancha', 'spot', 'júpiter', 'jupiter']),
    ('rocky', ['desierto', 'desert', 'roca', 'rock', 'rocoso', 'rocky', 'cráter', 'crater', 'cráteres', 'craters', 'marte', 'mars', 'árido', 'arido', 'arid', 'luna', 'moon', 'polvo', 'dust']),
    ('bands', ['gaseoso', 'gas', 'gigante', 'giant', 'bandas', 'bands', 'franjas', 'stripes', 'rayas', 'saturno', 'saturn']),
]
NO_RINGS = re.compile(r'\b(sin anillos?|no rings?|without rings?|ringless)\b')
RINGS = re.compile(r'\b(anillos?|rings?|ringed|aros?)\b')
STYLE_DEFAULT = {'lava': ['black', 'orange', 'yellow'], 'ice': ['cyan', 'white'], 'ocean': ['blue', 'green'],
                 'crystal': ['purple', 'cyan'], 'storm': ['orange', 'brown'], 'rocky': ['red', 'orange'],
                 'bands': ['orange', 'yellow'], 'tech': ['gray', 'cyan', 'orange']}


def words(text):
    """Lower-cased words, each with its singular forms too (rosados -> rosado)."""
    out = []
    for w in re.findall(r"[\wáéíóúñü]+", text.lower()):
        out.append(w)
        if len(w) > 3 and w.endswith('es'):
            out.append(w[:-2])
        if len(w) > 3 and w.endswith('s'):
            out.append(w[:-1])
    return out


def color_of(word):
    for c, keys in WORDS.items():
        if word in keys or (word.endswith('s') and word[:-1] in keys) or (word.endswith('es') and word[:-2] in keys):
            return c
    return None


def offline(text):
    t = text.lower()
    toks = words(t)
    style = None
    for s, keys in STYLE_WORDS:
        if any(k in toks for k in keys):
            style = s
            break
    style = style or 'bands'
    named = []
    for tok in re.findall(r"[\wáéíóúñü]+", t):
        c = color_of(tok)
        if c and c not in named:
            named.append(c)
    # A colour right after "anillos"/"rings" ("anillos rosados"), or right
    # before "rings" ("pink rings"), belongs to the rings.
    ring_color = None
    m = re.search(r'\b(?:anillos?|aros?|rings?)\s+(?:de\s+color\s+|color\s+|de\s+)?([\wáéíóúñü]+)', t)
    if m:
        ring_color = color_of(m.group(1))
    m = re.search(r'\b([\wáéíóúñü]+)\s+rings?\b', t)
    if m and not ring_color:
        ring_color = color_of(m.group(1))
    surface = [c for c in named if c != ring_color] or STYLE_DEFAULT[style]
    if style == 'lava':
        warm = [c for c in surface if c in ('red', 'orange', 'yellow', 'pink', 'purple', 'green', 'cyan', 'blue')]
        glow = warm[0] if warm else 'orange'
        cols = ['#2b1d24', '#4a2a2a', RAMPS[glow][2], RAMPS[glow][4]]
    elif style == 'ocean':
        waters = [c for c in surface if c in ('blue', 'cyan', 'purple', 'pink')]
        lands = [c for c in surface if c not in waters and c not in ('white', 'black', 'gray')]
        water = RAMPS[waters[0] if waters else 'blue']
        land = RAMPS[lands[0] if lands else 'green']
        cols = [water[1], water[2], land[2], '#e9cf93', '#ffffff']
    elif style == 'tech':
        # Plate and seam from the first metal-ish colour, seas from a water
        # colour, the fissures from a hot one, city lights from a bright one.
        metal = next((c for c in surface if c in ('gray', 'black', 'white', 'blue', 'purple', 'brown')), 'gray')
        water = next((c for c in surface if c in ('cyan', 'blue', 'green', 'purple')), 'cyan')
        hot = next((c for c in surface if c in ('orange', 'red', 'yellow', 'pink')), 'orange')
        light = next((c for c in surface if c in ('cyan', 'yellow', 'green', 'pink', 'white') and c != water), 'cyan')
        cols = [RAMPS[metal][2], RAMPS[metal][1], RAMPS[water][1], RAMPS[water][3], RAMPS[hot][3], RAMPS[light][4]]
    elif style in ('ice', 'rocky', 'crystal'):
        # Solid worlds read their colours dark to light.
        ramp = RAMPS[surface[0]]
        cols = [ramp[1], ramp[2], ramp[3], ramp[4]]
        if len(surface) > 1:
            cols[2] = RAMPS[surface[1]][3]
    else:
        cols = []
        for i in range(5):
            ramp = RAMPS[surface[i % len(surface)]]
            cols.append(ramp[[1, 3, 2, 4, 0][i]])
    rings = bool(RINGS.search(t)) and not NO_RINGS.search(t)
    if NO_RINGS.search(t):
        rings = False
    elif style in ('bands', 'ice', 'crystal', 'tech') and not RINGS.search(t):
        rings = style in ('bands', 'tech')
    ring_ramp = RAMPS[ring_color] if ring_color else RAMPS[surface[-1]]
    spec = {'style': style, 'colors': cols, 'rings': rings, 'ringColors': [ring_ramp[3], ring_ramp[2], ring_ramp[4]],
            'spot': RAMPS['red'][2], 'rim': cols[2] if style == 'lava' else RAMPS[surface[0]][3]}
    if style == 'tech':
        # An artificial ring: metal rails and deck, running lights like the cities.
        spec['ringColors'] = [cols[0], cols[1], cols[5]]
        spec['rim'] = cols[3]
    words_kept = [w for w in re.findall(r"[\wáéíóúñü]+", text) if len(w) > 3][:3]
    spec['name'] = ' '.join(words_kept).title()[:40] or 'Custom world'
    return spec


# ------------------------------------------------------------------ ollama


def http_json(url, payload=None, timeout=90):
    data = json.dumps(payload).encode('utf-8') if payload is not None else None
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read(2 * 1024 * 1024).decode('utf-8'))


def ollama(text, url, model, opener=http_json):
    url = url.rstrip('/')
    if not re.match(r'^https?://[\w.\-:\[\]]+$', url):
        raise ValueError('bad Ollama URL')
    if not model:
        tags = opener(url + '/api/tags', timeout=3)
        names = [m.get('name') for m in tags.get('models', []) if isinstance(m, dict) and m.get('name')]
        if not names:
            raise RuntimeError('no Ollama models')
        model = names[0]
    out = opener(url + '/api/generate', {
        'model': model, 'stream': False, 'think': False, 'format': SCHEMA,
        'system': INSTRUCTIONS, 'prompt': 'Planet description: ' + text,
        'options': {'temperature': 0.7},
    })
    return json.loads(out.get('response') or '{}')


# ------------------------------------------------------------------ claude


def claude_key():
    if os.environ.get('ANTHROPIC_API_KEY'):
        return None  # the SDK reads it itself
    try:
        if KEY_FILE.is_file():
            key = KEY_FILE.read_text().strip()
            return key or None
    except OSError:
        pass
    return None


def claude(text, model, sdk=None):
    if sdk is None:
        try:
            import anthropic as sdk
        except ImportError:
            raise RuntimeError('the anthropic package is not installed (pip install anthropic)')
    key = claude_key()
    client = sdk.Anthropic(api_key=key) if key else sdk.Anthropic()
    response = client.beta.messages.create(
        model=model or DEFAULT_CLAUDE_MODEL,
        max_tokens=16000,
        betas=['server-side-fallback-2026-07-01'],
        fallbacks='default',
        output_config={'effort': 'low', 'format': {'type': 'json_schema', 'schema': SCHEMA}},
        system=INSTRUCTIONS,
        messages=[{'role': 'user', 'content': 'Planet description: ' + text}],
    )
    if response.stop_reason == 'refusal':
        raise RuntimeError('Claude declined this description')
    body = next((b.text for b in response.content if b.type == 'text'), '')
    return json.loads(body)


# ------------------------------------------------------------------ main


def create(text, engine='auto', ollama_url='http://127.0.0.1:11434', ollama_model='', claude_on=False,
           claude_model='', ollama_fn=ollama, claude_fn=claude):
    text = ' '.join(str(text).split())[:MAX_DESCRIPTION]
    if not text:
        raise ValueError('empty description')
    order = {'auto': ['claude', 'ollama', 'offline'], 'claude': ['claude', 'ollama', 'offline'],
             'ollama': ['ollama', 'offline'], 'offline': ['offline']}.get(engine, ['offline'])
    notes = []
    for name in order:
        try:
            if name == 'claude':
                if not claude_on:
                    continue
                spec = clean(claude_fn(text, claude_model))
            elif name == 'ollama':
                spec = clean(ollama_fn(text, ollama_url, ollama_model))
            else:
                spec = clean(offline(text))
        except Exception as e:  # noqa: BLE001 - any engine failure falls through to the next
            notes.append('%s: %s' % (name, str(e)[:120]))
            continue
        if spec:
            spec['seed'] = seed_for(text)
            spec.setdefault('name', 'Custom world')
            return {'engine': name, 'planet': spec, 'notes': notes}
        notes.append('%s: unusable answer' % name)
    raise RuntimeError('; '.join(notes) or 'no engine worked')


def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument('--engine', default='auto', choices=['auto', 'ollama', 'claude', 'offline'])
    ap.add_argument('--ollama-url', default='http://127.0.0.1:11434')
    ap.add_argument('--ollama-model', default='')
    ap.add_argument('--claude', default='off', choices=['on', 'off'])
    ap.add_argument('--claude-model', default='')
    ap.add_argument('description', nargs='+')
    a = ap.parse_args(argv)
    try:
        out = create(' '.join(a.description), a.engine, a.ollama_url, a.ollama_model, a.claude == 'on', a.claude_model)
    except Exception as e:  # noqa: BLE001
        print(json.dumps({'error': str(e)[:300]}))
        return 1
    print(json.dumps(out, ensure_ascii=False))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
