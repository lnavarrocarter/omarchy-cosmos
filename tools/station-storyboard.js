// Storyboard for the station screen: every station model (or the ones
// given) at one moment, with its shuttles, spacewalkers and beacons, drawn
// from the same sprites and stationlife.js positions the live scene uses.
//
//   node tools/station-storyboard.js <out.png> [t] [model ...]
const { load, sheet } = require("./raster")
const S = load("sprites.js")
const SL = load("stationlife.js")
const P = load("physics.js")

const out = process.argv[2]
if (!out) { console.error("usage: station-storyboard.js <out.png> [t] [model ...]"); process.exit(2) }
const args = process.argv.slice(3)
const t = args.length && !isNaN(Number(args[0])) ? Number(args.shift()) : 8
const models = args.length ? args : SL.MODELS
const g = sheet(models.length)
const hex = (c) => S.hex(c)
const sp = {
  wheel: S.wheel(40), habitat: S.habitat(44, 16),
  torus: S.stationTorus(70), spindle: S.stationSpindle(210),
  spire: S.stationSpire(), citadel: S.stationCitadel(),
  shuttle: S.shuttle(), astronaut: S.astronaut()
}

function body(model, cx, cy) {
  if (model === "torus") {
    g.blit(sp.spindle, cx, cy, 3)
    g.blit(sp.torus, cx, cy, 3, t * SL.layout("torus").spin * Math.PI * 2)
  } else if (model === "spire") {
    g.blit(sp.spire, cx, cy, 4)
  } else if (model === "citadel") {
    g.blit(sp.citadel, cx, cy, 4, t * SL.layout("citadel").spin * Math.PI * 2)
  } else {
    g.rect(cx, cy - 5, 150, 10, [75, 81, 112], 1)
    g.blit(sp.wheel, cx, cy, 3, t * 0.3)
    g.blit(sp.habitat, cx + 140 + 88, cy, 4)
    g.rect(cx + 140 + 176, cy - 10, 20, 20, [107, 114, 144], 1)
  }
}

models.forEach((model, i) => {
  const [ox, oy] = g.frame(i)
  g.sky(ox, oy, P.rng(23 + i))
  const cx = ox + 960, cy = oy + 432
  g.glow(cx, cy, 260, [88, 200, 255], 0.06)
  body(model, cx, cy)
  const L = SL.layout(model)
  L.beacons.forEach((_, k) => {
    const b = SL.beacon(model, k, t)
    if (b.visible && b.on) { g.glow(cx + b.x, cy + b.y, 14, hex(b.color), 0.7); g.rect(cx + b.x - 3, cy + b.y - 3, 6, 6, hex(b.color), 1) }
  })
  for (let k = 0; k < L.eva.length; k++) {
    const e = SL.eva(model, k, t)
    g.line(cx + e.clipX, cy + e.clipY, cx + e.x, cy + e.y + 10, 2, [200, 205, 220], 0.7)
    g.blit(sp.astronaut, cx + e.x, cy + e.y, 3, e.rot)
    if (e.welding) {
      g.glow(cx + e.clipX, cy + e.clipY, 18, [125, 249, 255], 0.8)
      for (let s = 0; s < 6; s++) {
        const a = s * 1.05 + t * 7, d = 6 + ((t * 40 + s * 9) % 22)
        g.rect(cx + e.clipX + Math.cos(a) * d, cy + e.clipY + Math.sin(a) * d, 3, 3, [255, 214, 90], 1)
      }
    }
  }
  for (let k = 0; k < SL.SHUTTLES; k++) {
    const s = SL.shuttle(model, k, t)
    if (!s.visible) continue
    g.blit(sp.shuttle, cx + s.x, cy + s.y, 3, 0, s.mirrored)
    if (s.flame) g.glow(cx + s.x + (s.mirrored ? -30 : 30), cy + s.y, 14, [255, 148, 71], 0.7)
  }
  // Model name as a row of dots, so frames can be told apart: 1..4.
  for (let d = 0; d <= i; d++) g.rect(ox + 40 + d * 16, oy + 40, 8, 8, [255, 255, 255], 0.8)
})
g.write(out)
console.log(out, `${g.W}x${g.H}`, "t=" + t, models.join(","))
