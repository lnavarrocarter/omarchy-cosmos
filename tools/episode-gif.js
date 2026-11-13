// Record an episode as a GIF, the way it plays with one, two or three
// screens: the world is laid out by zones.js (with one or two screens the
// episode's own place is the hero, so it can play), every frame is drawn from
// episodes.js over the scenery, and the frames are piped into ffmpeg.
//
//   node tools/episode-gif.js <episode-id> <screens 1|2|3> <out-dir> [fps]
//
// Writes <out-dir>/<id>-<n>s.gif, a contact sheet <id>-<n>s.png (six moments,
// for review) and <id>-<n>s.json with numbers about the run (frames, actors
// seen, actors outside every screen...). Prints "unavailable" when the
// episode can't play with that many screens.
const fs = require("fs")
const path = require("path")
const zlib = require("zlib")
const { spawnSync } = require("child_process")
const { load, root } = require("../tests/load.js")

const S = load(path.join(root, "sprites.js"))
const E = load(path.join(root, "episodes.js"))
const Z = load(path.join(root, "zones.js"))
const art = E.buildArt(S)

const [id, nArg, outDir, fpsArg] = process.argv.slice(2)
const n = Number(nArg)
if (!id || !E.get(id) || ![1, 2, 3].includes(n) || !outDir) {
  console.error("usage: episode-gif.js <episode-id> <1|2|3> <out-dir> [fps]")
  process.exit(2)
}
const fps = Number(fpsArg) || 8
const ep = E.get(id)
fs.mkdirSync(outDir, { recursive: true })
const base = path.join(outDir, `${id}-${n}s`)

// ------------------------------------------------------------ the world
const H = 1080, GAP = 40
const sizes = n === 3 ? [1920, 2560, 1920] : n === 2 ? [1920, 1920] : [1920]
const ZONE_KIND = { island: "castaway", castaway: "castaway", planet: "planet", station: "station" }
const hero = ZONE_KIND[ep.zone] || "castaway"
const plan = Z.plan(sizes.map((_, i) => ({ name: "S" + i })), { hero })
const screens = []
const places = []
let offset = 0
plan.forEach((p, i) => {
  screens.push({ x: offset, w: sizes[i] })
  if (p.kind !== "void") places.push({ kind: p.kind, x: offset + sizes[i] * p.fx, y: H * p.fy, k: 1 })
  for (const c of p.companions) places.push({ kind: c.kind, x: offset + sizes[i] * c.fx, y: H * c.fy, k: c.scale })
  offset += sizes[i] + GAP
})
const W = offset
const full = (kind) => places.find((p) => p.kind === kind && p.k === 1) || null
const screenMid = screens.map((s) => s.x + s.w / 2).sort((a, b) => Math.abs(a - W / 2) - Math.abs(b - W / 2))[0]
const ctx = { W, H, mid: full("castaway") ? full("castaway").x : screenMid,
  planet: full("planet"), castaway: full("castaway"), station: full("station"),
  // The sun and moon follow the time of day; put them on a screen, not a bezel.
  sun: { x: screenMid, y: 220 }, moon: { x: screenMid, y: 220 }, bob: 0,
  vars: { agent: "codex", agentName: "Codex", agentColor: "#10a37f", time: "14:05", date: "12-11" } }
if (!E.available(id, ctx)) { console.log(`${id} ${n}s: unavailable`); process.exit(0) }

// Downscale so the GIF stays a sensible width.
const K = n === 1 ? 2 : n === 2 ? 3 : 4.5
const FW = Math.round(W / K), FH = Math.round(H / K)
let img = new Float32Array(FW * FH * 3)

function hex(c) {
  c = String(c || "#ffffff")
  if (!/^#[0-9a-f]{6}$/i.test(c)) return [255, 255, 255]
  return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)]
}
function plot(wx, wy, rgb, a) {
  const x = Math.floor((((wx % W) + W) % W) / K), y = Math.floor(wy / K)
  if (x < 0 || y < 0 || x >= FW || y >= FH || a <= 0) return
  const i = (y * FW + x) * 3
  for (let c = 0; c < 3; c++) img[i + c] = img[i + c] * (1 - a) + rgb[c] * a
}
function rect(cx, cy, w, h, rgb, a) {
  for (let y = cy - h / 2; y < cy + h / 2; y += Math.min(K, Math.max(1, h)))
    for (let x = cx - w / 2; x < cx + w / 2; x += Math.min(K, Math.max(1, w))) plot(x, y, rgb, a)
}
function disc(cx, cy, r, rgb, a) {
  for (let y = -r; y <= r; y += K) for (let x = -r; x <= r; x += K) if (x * x + y * y <= r * r) plot(cx + x, cy + y, rgb, a)
}
function sprite(s, x0, y0, px, flip, opacity, rot) {
  if (!s) return
  const cx = x0 + s.w * px / 2, cy = y0 + s.h * px / 2
  const r = (rot || 0) * Math.PI / 180, cs = Math.cos(r), sn = Math.sin(r)
  const step = Math.max(0.5, Math.min(px, K / 2))
  for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) {
    const i = (y * s.w + x) * 4, a = s.data[i + 3] / 255 * (opacity === undefined ? 1 : opacity)
    if (!a) continue
    const sx = flip ? s.w - 1 - x : x
    for (let dy = 0; dy < px; dy += step) for (let dx = 0; dx < px; dx += step) {
      const lx = x0 + sx * px + dx - cx, ly = y0 + y * px + dy - cy
      plot(cx + lx * cs - ly * sn, cy + lx * sn + ly * cs, [s.data[i], s.data[i + 1], s.data[i + 2]], a)
    }
  }
}
const centered = (s, cx, cy, px, flip, o, rot) => s && sprite(s, cx - s.w * px / 2, cy - s.h * px / 2, px, flip, o, rot)

const SCENE = { planet: S.planet(80, 0), island: S.island(4), palm: S.palm(), tent: S.tent(), fire: S.fire(0),
  dog: S.dog(), cat: S.catSit(), astronaut: S.astronaut(), wheel: S.wheel(40), habitat: S.habitat(44, 16) }

function scenery(st) {
  for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
    const i = (y * FW + x) * 3, t = y / FH
    img[i] = 6 + 10 * t; img[i + 1] = 7 + 4 * t; img[i + 2] = 22 + 14 * t
  }
  // The gaps between screens, so the layout reads.
  for (let s = 1; s < screens.length; s++) rect(screens[s].x - GAP / 2, H / 2, GAP, H, [0, 0, 0], 1)
  const hide = st.hide || {}
  for (const p of places) {
    const k = p.k
    if (p.kind === "planet") centered(SCENE.planet, p.x, p.y, 3 * k)
    else if (p.kind === "station") {
      centered(SCENE.wheel, p.x, p.y, 3 * k)
      sprite(SCENE.habitat, p.x + 140 * k, p.y - 32 * k, 4 * k)
      const lights = k === 1 && st.effects && st.effects.lights
      if (lights) rect(p.x + 228, p.y - 6, 152, 20, hex(lights === "alarm" ? "#ff3b3b" : "#ffd65a"), 0.5)
    } else {
      const iy = p.y - 72 * k
      sprite(SCENE.island, p.x - 192 * k, iy, 4 * k)
      sprite(SCENE.palm, p.x - 158 * k, iy + (32 - 64 + 6) * k, 4 * k)
      sprite(SCENE.tent, p.x + 94 * k, iy + (32 - 28 + 6) * k, 4 * k)
      sprite(SCENE.fire, p.x + 24 * k, iy + (32 - 24 + 4) * k, 4 * k)
      const h = k === 1 ? hide : {}
      if (!h.dog) sprite(SCENE.dog, p.x - 100 * k, iy + (32 - 40 + 4) * k, 4 * k)
      if (!h.cat) sprite(SCENE.cat, p.x + 48 * k, iy + (32 - 40 + 4) * k, 4 * k)
      if (!h.astronaut) sprite(SCENE.astronaut, p.x - 42 * k, iy + (32 - 60 + 4) * k, 4 * k)
    }
  }
}

// ------------------------------------------------------------ frames
const length = ep.length + 1
const count = Math.max(2, Math.round(length * fps))
const stats = { id, screens: n, hero, fps, frames: count, seconds: length, width: FW, height: FH,
  places: places.map((p) => `${p.kind}${p.k < 1 ? "(small)" : ""}`), actorsSeen: 0, actorFrames: 0,
  offscreenActorFrames: 0, inGapActorFrames: 0, emptyFrames: 0, missingSprites: [] }
const onScreen = (x) => screens.some((s) => { const lx = ((x % W) + W) % W; return lx >= s.x && lx < s.x + s.w })
const sheetAt = [0.08, 0.25, 0.42, 0.58, 0.75, 0.92].map((u) => Math.min(count - 1, Math.round(u * (count - 1))))
const sheet = []
const seen = new Set()

const ff = spawnSync("ffmpeg", ["-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", `${FW}x${FH}`,
  "-r", String(fps), "-i", "-", "-vf", "split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=none",
  "-loop", "0", base + ".gif"], { input: (() => {
  const buf = Buffer.alloc(FW * FH * 3 * count)
  for (let f = 0; f < count; f++) {
    const t = f / fps
    const st = E.state(id, t, ctx)
    img = new Float32Array(FW * FH * 3)
    scenery(st)
    for (const b of st.beams) for (let k = 0; k < 10; k++) {
      const span = (b.bottom - b.top) / 10
      rect(b.x, b.top + k * span + span / 2, b.w0 + (b.w1 - b.w0) * k / 9, span, hex(b.color), 0.18 * b.a)
    }
    for (const r of st.ropes) for (const p of r.points) rect(p.x, p.y, 3, 3, hex(r.color), 0.9)
    let visible = 0
    for (const a of st.actors) {
      if (a.o <= 0.01) continue
      visible++
      seen.add(a.sprite || a.text || "?")
      stats.actorFrames++
      if (!onScreen(a.x)) stats.offscreenActorFrames++
      if (a.sprite && !art[a.sprite] && !stats.missingSprites.includes(a.sprite)) stats.missingSprites.push(a.sprite)
      if (a.glow) disc(a.x, a.y + (a.glow.dy || 0), a.glow.r, hex(a.glow.color), (a.glow.a || 0.15) * a.o)
      if (a.sprite) centered(art[a.sprite], a.x, a.y, a.px * a.scale, a.flip, a.o, a.rot)
      else if (a.text) rect(a.x, a.y, a.size * 0.6 * a.text.length, a.size, hex(a.color), 0.8 * a.o)
    }
    if (!visible && !st.particles.length && !st.beams.length) stats.emptyFrames++
    for (const p of st.particles) {
      if (p.glyph) rect(p.x, p.y, 10 + p.w * 2, 10 + p.w * 2, hex(p.color), 0.8 * Math.max(0, p.o))
      else rect(p.x, p.y, Math.max(2, p.w), Math.max(2, p.h), hex(p.color), Math.max(0, p.o))
    }
    for (const s of st.shots) rect(s.x, s.y, s.kind === "laser" ? 26 : 10, s.kind === "laser" ? 4 : 10,
      hex(s.color || (s.kind === "laser" ? "#7df9ff" : "#ff9447")), 1)
    for (const fl of st.flashes) disc(fl.x, fl.y, fl.r, hex(fl.color), 0.6 * fl.a)
    const off = f * FW * FH * 3
    for (let i = 0; i < FW * FH * 3; i++) buf[off + i] = Math.max(0, Math.min(255, Math.round(img[i])))
    if (sheetAt.includes(f)) sheet.push(Buffer.from(buf.subarray(off, off + FW * FH * 3)))
  }
  return buf
})(), maxBuffer: 1 << 30 })
if (ff.status !== 0) { console.error(String(ff.stderr)); process.exit(1) }
stats.actorsSeen = seen.size

// Contact sheet: two columns of the six moments, at the GIF's size.
const cols = 2, rows = Math.ceil(sheet.length / cols)
const SW = FW * cols, SH = FH * rows
const raw = Buffer.alloc((SW * 3 + 1) * SH)
sheet.forEach((fr, k) => {
  const ox = (k % cols) * FW, oy = Math.floor(k / cols) * FH
  for (let y = 0; y < FH; y++) fr.copy(raw, (oy + y) * (SW * 3 + 1) + 1 + ox * 3, y * FW * 3, (y + 1) * FW * 3)
})
function crc(b) {
  let c, t = []
  for (let k = 0; k < 256; k++) { c = k; for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[k] = c >>> 0 }
  let r = 0xffffffff
  for (const x of b) r = t[(r ^ x) & 255] ^ (r >>> 8)
  return (r ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const l = Buffer.alloc(4); l.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td))
  return Buffer.concat([l, td, c])
}
const ih = Buffer.alloc(13); ih.writeUInt32BE(SW, 0); ih.writeUInt32BE(SH, 4); ih[8] = 8; ih[9] = 2
fs.writeFileSync(base + ".png", Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ih),
  chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]))
fs.writeFileSync(base + ".json", JSON.stringify(stats, null, 2) + "\n")
console.log(`${id} ${n}s: ${count} frames -> ${base}.gif`)
