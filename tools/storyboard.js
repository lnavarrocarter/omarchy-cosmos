// Storyboard: draw an episode at a few moments into one PNG, over the real
// scenery (planet, island with its characters, station), so an episode can
// be checked without watching the desktop.
//
//   node tools/storyboard.js <episode-id> <out.png> [t1 t2 ...]
//
// Frames are stacked top to bottom in the order of the times given (default:
// six moments spread over the episode). Rotations and flips are drawn.
const fs = require("fs")
const path = require("path")
const zlib = require("zlib")
const { load, root } = require("../tests/load.js")

const S = load(path.join(root, "sprites.js"))
const E = load(path.join(root, "episodes.js"))
const art = E.buildArt(S)

const id = process.argv[2], out = process.argv[3]
if (!id || !out || !E.get(id)) {
  console.error("usage: storyboard.js <episode-id> <out.png> [times...]\nids: " + E.ids().join(" "))
  process.exit(2)
}
const ep = E.get(id)
const W = 6520, H = 1080
const ctx = { W, H, planet: { x: 960, y: 562 }, castaway: { x: 3240, y: 670 }, station: { x: 5520, y: 432 },
  sun: { x: 3240, y: 220 }, moon: { x: 3240, y: 220 }, bob: 0,
  vars: { agent: "codex", agentName: "Codex", agentColor: "#10a37f", time: "14:05", date: "12-11" } }
let times = process.argv.slice(4).map(Number).filter((v) => isFinite(v))
if (!times.length) for (let i = 0; i < 6; i++) times.push(+(ep.length * (i + 0.5) / 6).toFixed(2))

// The crop: around the zone for local episodes, the whole world otherwise.
const anchor = E.anchor(ep, ctx)
const local = ["island", "castaway", "planet", "station"].includes(ep.zone)
const SIZES = { island: [1000, 600, 1.25, 330], castaway: [1000, 600, 1.25, 290], planet: [1800, 1000, 2.25, 500],
  station: [1400, 800, 1.75, 400] }
const z = SIZES[ep.zone]
const crop = local ? { x: anchor.x - z[0] / 2, y: anchor.y - z[3], w: z[0], h: z[1], k: z[2] } : { x: 0, y: 0, w: W, h: H, k: 4 }
const FW = Math.round(crop.w / crop.k), FH = Math.round(crop.h / crop.k)
const img = new Float32Array(FW * FH * times.length * 3)

function hex(c) {
  c = String(c || "#ffffff")
  if (!/^#[0-9a-f]{6}$/i.test(c)) return [255, 255, 255]
  return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)]
}

function plot(f, wx, wy, rgb, a) {
  let dx = wx - crop.x
  if (!local) dx = ((dx % W) + W) % W
  const x = Math.floor(dx / crop.k), y = Math.floor((wy - crop.y) / crop.k)
  if (x < 0 || y < 0 || x >= FW || y >= FH || a <= 0) return
  const i = ((f * FH + y) * FW + x) * 3
  for (let c = 0; c < 3; c++) img[i + c] = img[i + c] * (1 - a) + rgb[c] * a
}

function rect(f, cx, cy, w, h, rgb, a) {
  for (let y = cy - h / 2; y < cy + h / 2; y += Math.min(crop.k, Math.max(1, h)))
    for (let x = cx - w / 2; x < cx + w / 2; x += Math.min(crop.k, Math.max(1, w))) plot(f, x, y, rgb, a)
}

function disc(f, cx, cy, r, rgb, a) {
  for (let y = -r; y <= r; y += crop.k)
    for (let x = -r; x <= r; x += crop.k) if (x * x + y * y <= r * r) plot(f, cx + x, cy + y, rgb, a)
}

// rot (degrees, clockwise like QML) turns the sprite about its centre.
function sprite(f, s, x0, y0, px, flip, opacity, rot) {
  if (!s) return
  const cx = x0 + s.w * px / 2, cy = y0 + s.h * px / 2
  const r = (rot || 0) * Math.PI / 180, cs = Math.cos(r), sn = Math.sin(r)
  for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) {
    const i = (y * s.w + x) * 4, a = s.data[i + 3] / 255 * (opacity === undefined ? 1 : opacity)
    if (!a) continue
    const sx = flip ? s.w - 1 - x : x
    for (let dy = 0; dy < px; dy += crop.k / 2) for (let dx = 0; dx < px; dx += crop.k / 2) {
      const lx = x0 + sx * px + dx - cx, ly = y0 + y * px + dy - cy
      plot(f, cx + lx * cs - ly * sn, cy + lx * sn + ly * cs, [s.data[i], s.data[i + 1], s.data[i + 2]], a)
    }
  }
}
const centered = (f, s, cx, cy, px, flip, o, rot) => s && sprite(f, s, cx - s.w * px / 2, cy - s.h * px / 2, px, flip, o, rot)

function scenery(f, st) {
  for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
    const i = ((f * FH + y) * FW + x) * 3, t = y / FH
    img[i] = 6 + 10 * t; img[i + 1] = 7 + 4 * t; img[i + 2] = 22 + 14 * t
  }
  const p = ctx.planet, c = ctx.castaway, s = ctx.station
  centered(f, S.planet(80, 0), p.x, p.y, 3)
  disc(f, c.x, c.y, 175, [128, 216, 255], 0.05)
  const hide = st.hide || {}
  const iy = c.y - 72
  sprite(f, S.island(4), c.x - 192, iy, 4)
  sprite(f, S.palm(), c.x - 158, iy + 32 - 64 + 6, 4)
  sprite(f, S.tent(), c.x + 94, iy + 32 - 28 + 6, 4)
  sprite(f, S.fire(0), c.x + 24, iy + 32 - 24 + 4, 4)
  if (!hide.dog) sprite(f, S.dog(), c.x - 100, iy + 32 - 40 + 4, 4)
  if (!hide.cat) sprite(f, S.catSit(), c.x + 48, iy + 32 - 40 + 4, 4)
  if (!hide.astronaut) sprite(f, S.astronaut(), c.x - 42, iy + 32 - 60 + 4, 4)
  centered(f, S.wheel(40), s.x, s.y, 3)
  sprite(f, S.habitat(44, 16), s.x + 140, s.y - 32, 4)
  const lights = st.effects && st.effects.lights
  if (lights) rect(f, s.x + 228, s.y - 6, 152, 20, hex(lights === "alarm" ? "#ff3b3b" : "#ffd65a"), 0.5)
}

times.forEach((t, f) => {
  const st = E.state(id, t, ctx)
  scenery(f, st)
  for (const b of st.beams) for (let k = 0; k < 10; k++) {
    const span = (b.bottom - b.top) / 10
    rect(f, b.x, b.top + k * span + span / 2, b.w0 + (b.w1 - b.w0) * k / 9, span, hex(b.color), 0.18 * b.a)
  }
  for (const r of st.ropes) for (const p of r.points) rect(f, p.x, p.y, 3, 3, hex(r.color), 0.9)
  for (const a of st.actors) {
    if (a.glow) disc(f, a.x, a.y + (a.glow.dy || 0), a.glow.r, hex(a.glow.color), (a.glow.a || 0.15) * a.o)
    if (a.sprite) centered(f, art[a.sprite], a.x, a.y, a.px * a.scale, a.flip, a.o, a.rot)
    else if (a.text) rect(f, a.x, a.y, a.size * 0.6 * a.text.length, a.size, hex(a.color), 0.8 * a.o)
  }
  for (const p of st.particles) {
    if (p.glyph) rect(f, p.x, p.y, 10 + p.w * 2, 10 + p.w * 2, hex(p.color), 0.8 * Math.max(0, p.o))
    else rect(f, p.x, p.y, Math.max(2, p.w), Math.max(2, p.h), hex(p.color), Math.max(0, p.o))
  }
  for (const s of st.shots) rect(f, s.x, s.y, s.kind === "laser" ? 26 : 10, s.kind === "laser" ? 4 : 10, hex(s.color || (s.kind === "laser" ? "#7df9ff" : "#ff9447")), 1)
  for (const fl of st.flashes) disc(f, fl.x, fl.y, fl.r, hex(fl.color), 0.6 * fl.a)
  // A thin separator between frames.
  for (let x = 0; x < FW; x++) { const i = ((f * FH) * FW + x) * 3; img[i] = img[i + 1] = img[i + 2] = 90 }
})

const OW = FW, OH = FH * times.length
const raw = Buffer.alloc((OW * 3 + 1) * OH)
for (let y = 0; y < OH; y++) {
  raw[y * (OW * 3 + 1)] = 0
  for (let x = 0; x < OW * 3; x++) raw[y * (OW * 3 + 1) + 1 + x] = Math.max(0, Math.min(255, Math.round(img[y * OW * 3 + x])))
}
function crc(b) {
  let c, t = []
  for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0 }
  let r = 0xffffffff
  for (const x of b) r = t[(r ^ x) & 255] ^ (r >>> 8)
  return (r ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const l = Buffer.alloc(4); l.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td))
  return Buffer.concat([l, td, c])
}
const ih = Buffer.alloc(13); ih.writeUInt32BE(OW, 0); ih.writeUInt32BE(OH, 4); ih[8] = 8; ih[9] = 2
fs.writeFileSync(out, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ih),
  chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]))
console.log(`${id}: ${times.length} frames at t = ${times.join(", ")} -> ${out} (${OW}x${OH})`)
