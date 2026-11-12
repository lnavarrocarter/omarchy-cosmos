// Storyboard for the planet screen: draws the planet and everything that
// orbits it (orbital.js) at given times, with the same sprites and positions
// the live scene uses, so a planet can be reviewed without the desktop.
//
//   node tools/planet-storyboard.js <out.png> [preset] [t ...]
//
// Frames are laid out two per row, each a full 1920x1080 screen. preset
// defaults to "forge".
const { load, sheet } = require("./raster")
const S = load("sprites.js")
const L = load("looks.js")
const O = load("orbital.js")
const P = load("physics.js")

const out = process.argv[2]
if (!out) { console.error("usage: planet-storyboard.js <out.png> [preset] [t ...]"); process.exit(2) }
const args = process.argv.slice(3)
const preset = args.length && isNaN(Number(args[0])) ? args.shift() : "forge"
const times = args.length ? args.map(Number) : [0.2, 6, 11.6, 18]
const PX = 3
const g = sheet(times.length)
const hex = (c) => S.hex(c)
const spec = L.planet({ preset })
const planetSprite = S.planet(80, 0, spec)
const sp = {
  satellite: S.satellite(),
  wheel: S.orbStation("wheel"), cross: S.orbStation("cross"),
  mothership: [0, 1, 2].map((i) => S.mothership(i * 7 + 3, i === 1 ? "#ff9447" : "#ffd65a")),
  junk: [0, 1, 2, 3, 4].map((i) => S.junk(i)),
  chunk: [0, 1, 2].map((i) => S.crustChunk(i, spec.colors[2], spec.colors[0], spec.colors[4])),
  climber: S.climber(), turret: S.turret()
}

function frame(i, t) {
  const [ox, oy] = g.frame(i)
  g.sky(ox, oy, P.rng(11))
  const cx = ox + 960, cy = oy + 562
  const at = (p) => [cx + p.x * PX, cy + p.y * PX]
  const tech = spec.style === "tech"
  const layer = (front) => {
    if (!tech) return
    for (let k = 0; k < O.COUNTS.stations; k++) {
      const s = O.station(k, t); if (s.front !== front) continue
      const [x, y] = at(s); g.blit(sp[s.kind], x, y, PX, s.rot)
    }
    for (let k = 0; k < O.COUNTS.satellites; k++) {
      const s = O.satellite(k, t); if (s.front !== front) continue
      const [x, y] = at(s); g.blit(sp.satellite, x, y, PX, s.rot)
    }
    for (let k = 0; k < O.COUNTS.junk; k++) {
      const j = O.junk(k, t); if (j.front !== front || j.hidden) continue
      const [x, y] = at(j); g.blit(sp.junk[j.variant % sp.junk.length], x, y, PX, j.rot)
    }
  }
  layer(false)
  g.glow(cx, cy, 300, hex(spec.rim), 0.08)
  g.blit(planetSprite, cx, cy, PX)
  if (!tech) return
  const e = O.elevator(t)
  g.rect(cx - 1, cy + e.topY * PX, 3, (e.baseY - e.topY) * PX, [150, 160, 190], 0.85)
  g.blit(sp.wheel, cx, cy + e.topY * PX - 12, 2)
  g.blit(sp.climber, cx, cy + e.climberY * PX, PX)
  g.glow(cx, cy + e.climberY * PX, 16, [255, 214, 90], 0.35)
  for (let k = 0; k < O.COUNTS.turrets; k++) {
    const p = O.turret(k); if (!p.front) continue
    const [x, y] = at(p); g.blit(sp.turret, x, y, PX, p.rot)
  }
  layer(true)
  for (let k = 0; k < O.COUNTS.chunks; k++) {
    const c = O.chunk(k, t); if (!c.visible) continue
    const [x, y] = at(c)
    g.glow(x, y + 6, 26, hex(spec.colors[4]), 0.18)
    g.blit(sp.chunk[c.variant % 3], x, y, PX, c.rot)
    for (let d = 0; d < O.COUNTS.drops; d++) {
      const p = O.drop(k, d, t); if (!p.visible) continue
      const [dx, dy] = at(p)
      g.rect(dx - 1, dy - p.len * 2, 3, p.len * 3, hex(spec.colors[3]), 0.9)
    }
  }
  const s = O.shot(t)
  const [fx, fy] = at(s.from), [tx, ty] = at(s.to)
  if (s.beam) { g.line(fx, fy, tx, ty, 3, [255, 92, 138], 0.9); g.glow(fx, fy, 18, [255, 92, 138], 0.6) }
  if (s.blast) {
    const r = 18 + s.blastAge * 50
    g.glow(tx, ty, r, [255, 214, 90], 0.9 * (1 - s.blastAge))
    g.glow(tx, ty, r * 0.5, [255, 255, 255], 0.8 * (1 - s.blastAge))
    for (let k = 0; k < 10; k++) {
      const a = k * 0.628 + s.blastAge, d = 8 + s.blastAge * 70
      g.rect(tx + Math.cos(a) * d - 2, ty + Math.sin(a) * d - 2, 4, 4, k % 2 ? [255, 148, 71] : [255, 214, 90], 1 - s.blastAge)
    }
  }
  for (let k = 0; k < O.COUNTS.motherships; k++) {
    const m = O.mothership(k, t)
    const [x, y] = at(m)
    g.glow(x + (m.flip ? -104 : 104), y, 28, [88, 200, 255], 0.25)
    g.blit(sp.mothership[k], x, y, 4, 0, m.flip)
  }
}

times.forEach((t, i) => frame(i, t))
g.write(out)
console.log(out, `${g.W}x${g.H}`, preset, times.join(","))
