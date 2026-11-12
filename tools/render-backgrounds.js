// Render still Cosmos scenes (PNG) from the same sprites the live scene uses.
// They serve as the Cosmos theme's backgrounds: what the lock screen shows,
// and what the desktop shows when the live scene is off. Also renders
// unlock.png, the boot (Plymouth) artwork, on a transparent background.
//
//   node tools/render-backgrounds.js <out-dir> [width] [height]
//
// For 4K, render at 1920x1080 and scale up 2x without smoothing, so the
// pixels stay crisp: magick in.png -filter point -resize 200% out.webp
const fs = require("fs")
const path = require("path")
const zlib = require("zlib")

function load(file) {
  const src = fs.readFileSync(path.join(__dirname, "..", file), "utf8").replace(/^\.pragma library\s*/, "")
  const mod = { exports: {} }
  new Function("module", src)(mod)
  return mod.exports
}
const S = load("sprites.js")
const P = load("physics.js")

const out = process.argv[2]
const W = Number(process.argv[3]) || 2560
const H = Number(process.argv[4]) || 1080
if (!out) { console.error("usage: render-backgrounds.js <out-dir> [w] [h]"); process.exit(2) }
fs.mkdirSync(out, { recursive: true })

function canvas() {
  const px = new Float32Array(W * H * 3)
  for (let y = 0; y < H; y++) {
    const t = y / (H - 1)
    // Same vertical gradient as the live sky.
    const top = [3, 4, 12], mid = [8, 9, 32], bot = [18, 10, 36]
    const c = t < 0.55 ? mix(top, mid, t / 0.55) : mix(mid, bot, (t - 0.55) / 0.45)
    for (let x = 0; x < W; x++) px.set(c, (y * W + x) * 3)
  }
  return px
}
function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t] }

function nebula(px, seed) {
  const rand = P.rng(seed)
  const cols = [[155, 107, 255], [92, 41, 135], [28, 79, 138], [176, 48, 106], [26, 140, 153]]
  const n = Math.round(W / 220)
  for (let i = 0; i < n; i++) {
    const cx = rand() * W
    const band = H * (0.45 + 0.25 * Math.sin(cx / W * Math.PI * 2 + 1.3))
    const cy = band + (rand() - 0.5) * H * 0.55
    const r = 160 + rand() * 420
    const c = cols[Math.floor(rand() * cols.length)]
    const a = 0.12 + rand() * 0.12
    const x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(W, Math.ceil(cx + r))
    const y0 = Math.max(0, Math.floor(cy - r)), y1 = Math.min(H, Math.ceil(cy + r))
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const d = Math.hypot(x - cx, y - cy) / r
      if (d >= 1) continue
      const k = a * (1 - d) * (1 - d)
      const i3 = (y * W + x) * 3
      px[i3] += c[0] * k; px[i3 + 1] += c[1] * k; px[i3 + 2] += c[2] * k
    }
  }
  // Galactic band dust.
  const dust = P.rng(seed + 1)
  for (let k = 0; k < W * 1.6; k++) {
    const x = Math.floor(dust() * W)
    const by = H * (0.45 + 0.25 * Math.sin(x / W * Math.PI * 2 + 1.3))
    const y = Math.round(by + (dust() + dust() + dust() - 1.5) * H * 0.18)
    if (y < 0 || y >= H) continue
    add(px, x, y, [217, 217, 255], 0.15 + dust() * 0.5)
  }
}

function stars(px, seed) {
  const rand = P.rng(seed)
  const cols = [[255, 255, 255], [207, 224, 255], [255, 233, 196], [216, 200, 255]]
  for (let i = 0; i < W * H / 3500; i++) {
    const x = Math.floor(rand() * W), y = Math.floor(rand() * H)
    const c = cols[Math.floor(rand() * cols.length)]
    const a = 0.3 + rand() * 0.7
    const big = rand() < 0.1
    add(px, x, y, c, a)
    if (big) { add(px, x + 1, y, c, a); add(px, x, y + 1, c, a); add(px, x + 1, y + 1, c, a) }
  }
}

function add(px, x, y, c, a) {
  if (x < 0 || y < 0 || x >= W || y >= H) return
  const i = (y * W + x) * 3
  px[i] = px[i] * (1 - a) + c[0] * a
  px[i + 1] = px[i + 1] * (1 - a) + c[1] * a
  px[i + 2] = px[i + 2] * (1 - a) + c[2] * a
}

// Nearest-neighbour blit of a sprite scaled by `scale`, centred on (cx, cy).
function blit(px, sprite, cx, cy, scale, rot) {
  const sw = sprite.w * scale, sh = sprite.h * scale
  const cos = Math.cos(rot || 0), sin = Math.sin(rot || 0)
  const ext = Math.ceil(Math.hypot(sw, sh) / 2)
  for (let y = Math.floor(cy - ext); y < cy + ext; y++) for (let x = Math.floor(cx - ext); x < cx + ext; x++) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy
    const u = (dx * cos + dy * sin + sw / 2) / scale, v = (-dx * sin + dy * cos + sh / 2) / scale
    if (u < 0 || v < 0 || u >= sprite.w || v >= sprite.h) continue
    const i = (Math.floor(v) * sprite.w + Math.floor(u)) * 4
    const a = sprite.data[i + 3] / 255
    if (a > 0) add(px, x, y, [sprite.data[i], sprite.data[i + 1], sprite.data[i + 2]], a)
  }
}

function glow(px, cx, cy, r, c, a) {
  for (let y = Math.floor(cy - r); y < cy + r; y++) for (let x = Math.floor(cx - r); x < cx + r; x++) {
    const d = Math.hypot(x - cx, y - cy) / r
    if (d < 1) add(px, x, y, c, a * (1 - d) * (1 - d))
  }
}

function vignette(px) {
  for (let y = 0; y < H; y++) {
    const t = y / H
    const k = t < 0.18 ? 0.35 * (1 - t / 0.18) : t > 0.82 ? 0.4 * ((t - 0.82) / 0.18) : 0
    if (!k) continue
    for (let x = 0; x < W; x++) add(px, x, y, [0, 0, 0], k)
  }
}

function writePng(file, px) {
  const raw = Buffer.alloc((W * 3 + 1) * H)
  for (let y = 0; y < H; y++) {
    raw[y * (W * 3 + 1)] = 0
    for (let x = 0; x < W * 3; x++) raw[y * (W * 3 + 1) + 1 + x] = Math.max(0, Math.min(255, Math.round(px[y * W * 3 + x])))
  }
  const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0 })
  const crc = (b) => { let c = 0xffffffff; for (const v of b) c = crcTable[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
    const td = Buffer.concat([Buffer.from(type), data])
    const c = Buffer.alloc(4); c.writeUInt32BE(crc(td))
    return Buffer.concat([len, td, c])
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2
  fs.writeFileSync(file, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]))
}

const scenes = {
  "1-cosmos-planet": (px) => {
    nebula(px, 7719); stars(px, 11)
    const cx = W * 0.52, cy = H * 0.52
    glow(px, cx, cy, 330, [125, 255, 176], 0.08)
    blit(px, S.planet(80, 0), cx, cy, 3)
    blit(px, S.moon(2, 7, "#b9c3d9"), cx - 420, cy - 220, 3)
    blit(px, S.moon(5, 5, "#d9a7b9"), cx + 480, cy + 260, 3)
    blit(px, S.rock(3, 9), cx - 760, cy + 300, 3, 0.6)
    blit(px, S.satellite(), cx + 820, cy - 300, 3, -0.3)
  },
  "2-cosmos-castaway": (px) => {
    nebula(px, 4242); stars(px, 23)
    const cx = W * 0.5, cy = H * 0.62
    glow(px, cx, cy, 190, [128, 216, 255], 0.06)
    const ix = cx - 192, iy = cy - 72
    blit(px, S.island(4), cx, iy + 80, 4)
    blit(px, S.palm(), ix + 34 + 22, iy + 32 - 32 + 6, 4)
    blit(px, S.tent(), ix + 286 + 22, iy + 32 - 14 + 6, 4)
    glow(px, ix + 226, iy + 20, 50, [255, 148, 71], 0.25)
    blit(px, S.fire(0), ix + 226, iy + 32 - 12 + 4, 4)
    blit(px, S.catSit(), ix + 258, iy + 32 - 20 + 4, 4)
    blit(px, S.dog(), ix + 92 + 22, iy + 32 - 20 + 4, 4)
    blit(px, S.astronaut(), ix + 174, iy + 32 - 30 + 4, 4)
    blit(px, S.cat(), cx + 560, cy - 360, 3, 0.4)
    blit(px, S.shuttle(), cx - 700, cy - 380, 3)
  },
  "3-cosmos-station": (px) => {
    nebula(px, 1987); stars(px, 37)
    const cx = W * 0.45, cy = H * 0.42
    glow(px, cx, cy, 170, [88, 200, 255], 0.1)
    blit(px, S.wheel(40), cx, cy, 3, 0.3)
    for (let x = 0; x < 150; x += 1) for (let y = -5; y < 5; y++) add(px, Math.round(cx + x), Math.round(cy + y), [75, 81, 112], 1)
    blit(px, S.habitat(44, 16), cx + 140 + 88, cy, 4)
    // A shuttle on its way in to dock, and a satellite further out.
    blit(px, S.shuttle(), cx + 560, cy + 150, 4, -0.12)
    for (let k = 0; k < 14; k++) add(px, Math.round(cx + 640 + k * 9), Math.round(cy + 160 + k * 1.2), [255, 214, 90], 0.5 - k * 0.03)
    blit(px, S.satellite(), cx - 520, cy + 300, 3, 0.4)
  }
}

// The boot screen artwork: the castaway island under its dome, beside the
// ringed planet, on transparency (Plymouth draws it over the theme colour).
function writeRgba(file, w, h, draw) {
  const rgba = new Float32Array(w * h * 4)
  const put = (x, y, c, a) => {
    if (x < 0 || y < 0 || x >= w || y >= h || a <= 0) return
    const i = (y * w + x) * 4, A = rgba[i + 3] / 255, out = a + A * (1 - a)
    for (let k = 0; k < 3; k++) rgba[i + k] = out ? (c[k] * a + rgba[i + k] * A * (1 - a)) / out : 0
    rgba[i + 3] = out * 255
  }
  const sprite = (sp, cx, cy, scale) => {
    const x0 = Math.round(cx - sp.w * scale / 2), y0 = Math.round(cy - sp.h * scale / 2)
    for (let y = 0; y < sp.h * scale; y++) for (let x = 0; x < sp.w * scale; x++) {
      const i = (Math.floor(y / scale) * sp.w + Math.floor(x / scale)) * 4
      put(x0 + x, y0 + y, [sp.data[i], sp.data[i + 1], sp.data[i + 2]], sp.data[i + 3] / 255)
    }
  }
  const disc = (cx, cy, r, c, a) => {
    for (let y = Math.floor(cy - r); y < cy + r; y++) for (let x = Math.floor(cx - r); x < cx + r; x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy) / r
      if (d < 1) put(x, y, c, a * (1 - d * d))
    }
  }
  draw(sprite, disc)
  const raw = Buffer.alloc((w * 4 + 1) * h)
  for (let y = 0; y < h; y++) for (let x = 0; x < w * 4; x++)
    raw[y * (w * 4 + 1) + 1 + x] = Math.max(0, Math.min(255, Math.round(rgba[y * w * 4 + x])))
  const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0 })
  const crc = (b) => { let c = 0xffffffff; for (const v of b) c = crcTable[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
    const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td))
    return Buffer.concat([len, td, c])
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6
  fs.writeFileSync(file, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]))
}

writeRgba(path.join(out, "unlock.png"), 1100, 520, (sprite, disc) => {
  sprite(S.planet(80, 0), 330, 260, 2)
  // The island laid out as Castaway.qml does (px 4), scaled to 3/4.
  const k = 3, f = k / 4, cx = 800, cy = 300
  const left = cx - 96 * k / 2, top = cy - 20, surface = top + 32 * f
  const at = (sp, x, lift) => sprite(sp, left + x * f + sp.w * k / 2, surface - sp.h * k + lift * f + sp.h * k / 2, k)
  disc(cx, cy, 175, [128, 216, 255], 0.10)
  sprite(S.island(4), cx, top + 40 * k / 2, k)
  at(S.palm(), 34, 6)
  at(S.tent(), 286, 6)
  disc(left + 226 * f, surface - 8, 34, [255, 148, 71], 0.3)
  at(S.fire(0), 216, 4)
  at(S.dog(), 92, 4)
  at(S.catSit(), 240, 4)
  at(S.astronaut(), 150, 4)
})
console.log(path.join(out, "unlock.png"))

for (const [name, draw] of Object.entries(scenes)) {
  const px = canvas()
  draw(px)
  vignette(px)
  const file = path.join(out, name + ".png")
  writePng(file, px)
  console.log(file)
}
