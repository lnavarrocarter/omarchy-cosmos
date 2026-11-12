// A tiny software rasterizer for the storyboard tools: a grid of 1920x1080
// frames, nearest-neighbour sprite blits (the live scene's look), lines,
// glows and a PNG writer. No dependencies.
const fs = require("fs")
const path = require("path")
const zlib = require("zlib")

function load(file) {
  const src = fs.readFileSync(path.join(__dirname, "..", file), "utf8").replace(/^\.pragma library\s*/, "")
  const mod = { exports: {} }
  new Function("module", src)(mod)
  return mod.exports
}

const FW = 1920, FH = 1080

function sheet(count) {
  const cols = count > 1 ? 2 : 1
  const rows = Math.ceil(count / cols)
  const W = FW * cols, H = FH * rows
  const px = new Float32Array(W * H * 3)
  let clip = { x0: 0, y0: 0, x1: W, y1: H }

  function add(x, y, c, a) {
    if (x < 0 || y < 0 || x >= W || y >= H) return
    const i = (y * W + x) * 3
    px[i] = px[i] * (1 - a) + c[0] * a
    px[i + 1] = px[i + 1] * (1 - a) + c[1] * a
    px[i + 2] = px[i + 2] * (1 - a) + c[2] * a
  }
  function put(x, y, c, a) {
    if (x < clip.x0 || y < clip.y0 || x >= clip.x1 || y >= clip.y1) return
    add(x, y, c, a)
  }
  const g = {
    W, H, cols, rows,
    // Origin of frame i; later draws are clipped to it.
    frame(i) {
      const ox = (i % cols) * FW, oy = Math.floor(i / cols) * FH
      clip = { x0: ox, y0: oy, x1: ox + FW, y1: oy + FH }
      return [ox, oy]
    },
    put,
    blit(sprite, cx, cy, scale, rot, flip) {
      const sw = sprite.w * scale, sh = sprite.h * scale
      const cos = Math.cos(rot || 0), sin = Math.sin(rot || 0)
      const ext = Math.ceil(Math.hypot(sw, sh) / 2)
      for (let y = Math.floor(cy - ext); y < cy + ext; y++) for (let x = Math.floor(cx - ext); x < cx + ext; x++) {
        const dx = x + 0.5 - cx, dy = y + 0.5 - cy
        let u = (dx * cos + dy * sin + sw / 2) / scale
        const v = (-dx * sin + dy * cos + sh / 2) / scale
        if (flip) u = sprite.w - u
        if (u < 0 || v < 0 || u >= sprite.w || v >= sprite.h) continue
        const i = (Math.floor(v) * sprite.w + Math.floor(u)) * 4
        const a = sprite.data[i + 3] / 255
        if (a > 0) put(x, y, [sprite.data[i], sprite.data[i + 1], sprite.data[i + 2]], a)
      }
    },
    rect(x, y, w, h, c, a) {
      for (let j = Math.floor(y); j < y + h; j++) for (let i = Math.floor(x); i < x + w; i++) put(i, j, c, a)
    },
    line(x0, y0, x1, y1, width, c, a) {
      const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)))
      for (let k = 0; k <= n; k++) {
        const x = x0 + (x1 - x0) * k / n, y = y0 + (y1 - y0) * k / n
        g.rect(x - width / 2, y - width / 2, width, width, c, a)
      }
    },
    glow(cx, cy, r, c, a) {
      for (let y = Math.floor(cy - r); y < cy + r; y++) for (let x = Math.floor(cx - r); x < cx + r; x++) {
        const d = Math.hypot(x - cx, y - cy) / r
        if (d < 1) put(x, y, c, a * (1 - d) * (1 - d))
      }
    },
    // The live sky's gradient and a sprinkle of stars.
    sky(ox, oy, rng) {
      for (let y = 0; y < FH; y++) {
        const t = y / (FH - 1)
        const top = [3, 4, 12], mid = [8, 9, 32], bot = [18, 10, 36]
        const m = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]
        const c = t < 0.55 ? m(top, mid, t / 0.55) : m(mid, bot, (t - 0.55) / 0.45)
        for (let x = 0; x < FW; x++) px.set(c, ((oy + y) * W + ox + x) * 3)
      }
      for (let i = 0; i < FW * FH / 3500; i++) {
        const x = Math.floor(rng() * FW), y = Math.floor(rng() * FH)
        put(ox + x, oy + y, [230, 236, 255], 0.3 + rng() * 0.7)
      }
    },
    write(file) {
      for (let c = 1; c < cols; c++) for (let y = 0; y < H; y++) for (let k = -2; k < 2; k++) add(c * FW + k, y, [255, 255, 255], 0.6)
      for (let r = 1; r < rows; r++) for (let x = 0; x < W; x++) for (let k = -2; k < 2; k++) add(x, r * FH + k, [255, 255, 255], 0.6)
      const raw = Buffer.alloc((W * 3 + 1) * H)
      for (let y = 0; y < H; y++) {
        raw[y * (W * 3 + 1)] = 0
        for (let x = 0; x < W * 3; x++) raw[y * (W * 3 + 1) + 1 + x] = Math.max(0, Math.min(255, Math.round(px[y * W * 3 + x])))
      }
      const table = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0 })
      const crc = (b) => { let c = 0xffffffff; for (const v of b) c = table[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
      const chunk = (type, data) => {
        const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
        const td = Buffer.concat([Buffer.from(type), data])
        const c = Buffer.alloc(4); c.writeUInt32BE(crc(td))
        return Buffer.concat([len, td, c])
      }
      const ihdr = Buffer.alloc(13)
      ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2
      fs.writeFileSync(file, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
        chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw, { level: 6 })), chunk("IEND", Buffer.alloc(0))]))
    }
  }
  return g
}

module.exports = { load, sheet, FW, FH }
