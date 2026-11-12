.pragma library

// Pixel art for Cosmos. Every sprite is { w, h, data } where data is a flat
// RGBA array, painted once into a small Canvas and scaled up without
// smoothing for a retro, early-90s screensaver look.

var PALETTE = {
  "K": "#1b1d2b", "W": "#eef0f7", "G": "#a3a9c2", "V": "#58c8ff", "D": "#1f4f86",
  "O": "#ff9447", "R": "#e2524a", "Y": "#ffd65a", "C": "#f2a541", "c": "#b86d1f",
  "P": "#ff8fa8", "B": "#9fe3ff", "S": "#e9cf93", "s": "#c9a86a", "M": "#6c5b84",
  "m": "#4a3d5e", "L": "#3fae6a", "l": "#2a7a4a", "T": "#8a5a35", "N": "#2d2f45",
  "n": "#6b7290", "A": "#3d6fd8", "a": "#2a4a9a", "Q": "#7df9ff"
}

var ALPHA = { "B": 150 }

var BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5]
]

function hex(c) {
  return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)]
}

function mix(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

function blank(w, h) {
  var data = new Array(w * h * 4)
  for (var i = 0; i < data.length; i++) data[i] = 0
  return { w: w, h: h, data: data }
}

function put(s, x, y, rgb, alpha) {
  if (x < 0 || y < 0 || x >= s.w || y >= s.h) return
  var i = (y * s.w + x) * 4
  s.data[i] = Math.round(rgb[0]); s.data[i + 1] = Math.round(rgb[1])
  s.data[i + 2] = Math.round(rgb[2]); s.data[i + 3] = alpha === undefined ? 255 : alpha
}

// `over` recolours letters for one sprite ({ W: "#ffcc00" }): that is how a
// character takes the colours chosen in config (looks.js palettes).
function fromRows(rows, over) {
  var h = rows.length, w = 0
  for (var r = 0; r < h; r++) w = Math.max(w, rows[r].length)
  var s = blank(w, h)
  for (var y = 0; y < h; y++) {
    for (var x = 0; x < rows[y].length; x++) {
      var ch = rows[y][x]
      var c = over && over[ch] ? over[ch] : PALETTE[ch]
      if (!c) continue
      put(s, x, y, hex(c), ALPHA[ch] !== undefined ? ALPHA[ch] : 255)
    }
  }
  return s
}

// Art from an episode pack: a list of rows, or { rows, colors } where
// colors maps extra letters to "#rrggbb" or ["#rrggbb", alpha].
function fromArt(def) {
  var rows = Array.isArray(def) ? def : (def && def.rows) || []
  var extra = (!Array.isArray(def) && def && def.colors) || {}
  var h = rows.length, w = 0
  for (var r = 0; r < h; r++) w = Math.max(w, rows[r].length)
  var s = blank(Math.max(1, w), Math.max(1, h))
  for (var y = 0; y < h; y++) {
    for (var x = 0; x < rows[y].length; x++) {
      var ch = rows[y][x]
      if (ch === ".") continue
      var c = extra.hasOwnProperty(ch) ? extra[ch] : PALETTE[ch]
      if (!c) continue
      var alpha = 255
      if (Array.isArray(c)) { alpha = c[1]; c = c[0] }
      else if (!extra.hasOwnProperty(ch) && ALPHA[ch] !== undefined) alpha = ALPHA[ch]
      put(s, x, y, hex(c), alpha)
    }
  }
  return s
}

// Cheap value noise for procedural shapes.
function hash(n) {
  var x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}
function noise1(x, seed) {
  var i = Math.floor(x), f = x - i
  var u = f * f * (3 - 2 * f)
  return hash(i + seed * 31.7) * (1 - u) + hash(i + 1 + seed * 31.7) * u
}

// Quantize a 0..1 light value into `levels` steps with ordered dithering.
function dither(v, x, y, levels) {
  var t = (BAYER[y & 3][x & 3] + 0.5) / 16
  var scaled = v * (levels - 1)
  var base = Math.floor(scaled)
  return Math.min(levels - 1, base + (scaled - base > t ? 1 : 0)) / (levels - 1)
}

var LIGHT = (function() {
  var l = [-0.55, -0.5, 0.67]
  var n = Math.sqrt(l[0] * l[0] + l[1] * l[1] + l[2] * l[2])
  return [l[0] / n, l[1] / n, l[2] / n]
})()

function shadeSphere(dx, dy, R) {
  var d2 = (dx * dx + dy * dy) / (R * R)
  if (d2 > 1) return -1
  var nz = Math.sqrt(1 - d2)
  return Math.max(0, (dx / R) * LIGHT[0] + (dy / R) * LIGHT[1] + nz * LIGHT[2])
}

// ---------------------------------------------------------------- characters

var ASTRONAUT = [
  "....KKKK....",
  "...KWWWWK...",
  "..KWWVVWWK..",
  "..KWVDDVWK..",
  "..KWVVVVWK..",
  "...KWWWWK...",
  "...KKWWKK...",
  "..KWWOOWWK..",
  ".KWGWWWWGWK.",
  ".KWKWWWWKWK.",
  ".KK.KWWK.KK.",
  "....KWWK....",
  "...KWGGWK...",
  "...KWKKWK...",
  "...KK..KK..."
]

var ASTRONAUT_WAVE = [
  "....KKKK....",
  "...KWWWWK...",
  "..KWWVVWWK..",
  "..KWVDDVWK..",
  ".KKWVVVVWK..",
  "KWK.KWWWWK..",
  "KWK.KKWWKK..",
  "KWKKWWOOWWK.",
  ".KWWWWWWWGWK",
  "...KWWWWWKWK",
  "....KWWWK.KK",
  "....KWWK....",
  "...KWGGWK...",
  "...KWKKWK...",
  "...KK..KK..."
]

var CAT = [
  "...BBBBBBB...",
  "..B.......B..",
  ".B..C...C..B.",
  ".B..CC.CC..B.",
  ".B..CCCCC..B.",
  ".B.CKCCCKC.B.",
  ".B.CCCPCCC.B.",
  "..B.CCCCC.B..",
  "...BBWWWBB...",
  "....WWWWW..CC",
  "....W.W.W.C..",
  "...........C."
]

var CAT_SIT = [
  "..C...C..",
  "..CC.CC..",
  "..CCCCC..",
  ".CKCCCKC.",
  ".CCCPCCC.",
  "..CCCCC..",
  ".CCcCcCC.",
  ".CCCCCCCC",
  ".CC.C.CC.",
  "........C"
]

var FISH = [
  ".OOO..O",
  "OKOOOOO",
  "OOOOOOO",
  ".OOO..O"
]

var SATELLITE = [
  ".......n.......",
  "AAAAA..N..AAAAA",
  "AaAaAnNYNnAaAaA",
  "AAAAA.NNN.AAAAA",
  "AaAaA.NnN.AaAaA",
  "AAAAA..N..AAAAA",
  ".......n......."
]

var SHUTTLE = [
  "......KKKKK.......",
  "....KKWWWWWKK.....",
  "..KKWWVVWWWWWKK...",
  ".KWWWWVVWWWWWWWK..",
  "KRRWWWWWWWWWWWWWKO",
  ".KWWWWWWWWWWWWWK.Y",
  "..KKNNNNNNNNNKK...",
  "....KK.....KK....."
]

var PALM = [
  "..LL...LL..",
  ".LLLL.LLLL.",
  "LLlLLLLLlLL",
  "L..lLTLl..L",
  "....lTl....",
  ".....T.....",
  ".....T.....",
  "....T......",
  "....T......",
  "....T......",
  "....T......",
  ".....T.....",
  ".....T.....",
  ".....T.....",
  "....TTT....",
  "...TTTTT..."
]

var FIRE = [
  ["..Y..", ".YOY.", ".ORO.", "ORROR", "TTTTT", ".T.T."],
  [".Y...", "..YO.", ".OYR.", "ORROR", "TTTTT", ".T.T."],
  ["...Y.", ".OY..", ".ROO.", "ORRRO", "TTTTT", ".T.T."]
]

var TENT = [
  ".....K.....",
  "....KRK....",
  "...KRRRK...",
  "..KRRKRRK..",
  ".KRRK.KRRK.",
  "KRRRK.KRRRK",
  "KKKKKKKKKKK"
]

// Agent ships: X is the agent color, x its shade. All face left.
var SHIPS = {
  fighter: [
    ".........KK.....",
    "......KKKXXK....",
    "...KKKWWWXXXK...",
    ".KKWVVWWWWWWXKK.",
    "KXXWVVWWWWWWWXKK",
    ".KKWWWWWWWWWXKK.",
    "...KKKxxxxxxK...",
    "......KKKxxK....",
    ".........KK....."
  ],
  hauler: [
    "....KKKKKKKKKK....",
    "...KXXXXXXXXXXK...",
    ".KKWVVWWWWWWWWXKK.",
    "KXWWVVWWWNNWNNWXKK",
    "KXWWWWWWWNNWNNWXKK",
    ".KKWWWWWWWWWWWXKK.",
    "...KxxxxxxxxxxK...",
    "....KK......KK...."
  ],
  solar: [
    "....AAaAAaAA......",
    "....AaAAaAAa......",
    ".......KK.........",
    "...KKKXXXXXXKK....",
    ".KKWVVWWWWWWWXKK..",
    "KXWWVVWWWWWWWWXKKK",
    ".KKWWWWWWWWWWXKK..",
    "...KKKxxxxxxKK....",
    ".......KK.........",
    "....AAaAAaAA......",
    "....AaAAaAAa......"
  ]
}

function ship(kind, color) {
  var rows = SHIPS[kind] || SHIPS.fighter
  var main = hex(color), shade = mix(hex(color), [20, 16, 40], 0.45)
  var s = blank(rows[0].length, rows.length)
  for (var y = 0; y < rows.length; y++) {
    for (var x = 0; x < rows[y].length; x++) {
      var ch = rows[y][x]
      if (ch === "X") put(s, x, y, main)
      else if (ch === "x") put(s, x, y, shade)
      else if (PALETTE[ch]) put(s, x, y, hex(PALETTE[ch]))
    }
  }
  return s
}

function crate() {
  return fromRows(["KKKKKK", "KYsYsK", "KsYsYK", "KYsYsK", "KKKKKK"])
}

function astronaut(o) { return fromRows(ASTRONAUT, o) }
function astronautWave(o) { return fromRows(ASTRONAUT_WAVE, o) }
function cat(o) { return fromRows(CAT, o) }
function catSit(o) { return fromRows(CAT_SIT, o) }
function fish() { return fromRows(FISH) }
function satellite() { return fromRows(SATELLITE) }
function shuttle(o) { return fromRows(SHUTTLE, o) }
function palm() { return fromRows(PALM) }
function tent() { return fromRows(TENT) }
function fire(frame) { return fromRows(FIRE[((frame % 3) + 3) % 3]) }

// ---------------------------------------------------------------- procedural

function rock(seed, R) {
  var size = R * 2 + 3
  var s = blank(size, size)
  var c = size / 2
  var light = hex(PALETTE.M), dark = hex(PALETTE.m), lit = mix(hex(PALETTE.M), [200, 190, 220], 0.35)
  var craters = []
  for (var k = 0; k < 3; k++) craters.push([(hash(seed + k) - 0.5) * R, (hash(seed + k + 9) - 0.5) * R, 1 + hash(seed + k + 4) * R * 0.3])
  for (var y = 0; y < size; y++) {
    for (var x = 0; x < size; x++) {
      var dx = x + 0.5 - c, dy = y + 0.5 - c
      var ang = Math.atan2(dy, dx)
      var rr = R * (0.72 + 0.28 * noise1((ang + Math.PI) * 1.6, seed))
      var d = Math.sqrt(dx * dx + dy * dy)
      if (d > rr) continue
      var l = shadeSphere(dx, dy, rr + 0.5)
      for (var q = 0; q < craters.length; q++) {
        var cx = dx - craters[q][0], cy = dy - craters[q][1]
        if (cx * cx + cy * cy < craters[q][2] * craters[q][2]) l *= 0.55
      }
      var v = dither(Math.max(0, l), x, y, 3)
      put(s, x, y, v > 0.75 ? lit : v > 0.25 ? light : dark)
    }
  }
  return s
}

function moon(seed, R, tint) {
  var size = R * 2 + 2
  var s = blank(size, size)
  var c = size / 2
  var base = hex(tint || "#b9c3d9")
  var dark = mix(base, [20, 20, 40], 0.6)
  for (var y = 0; y < size; y++) {
    for (var x = 0; x < size; x++) {
      var l = shadeSphere(x + 0.5 - c, y + 0.5 - c, R)
      if (l < 0) continue
      var crater = hash(seed + Math.floor(x / 2) * 7 + Math.floor(y / 2) * 13) > 0.86 ? 0.6 : 1
      put(s, x, y, mix(dark, base, dither(l * crater, x, y, 4)))
    }
  }
  return s
}

// A ringed gas giant. bandShift slides the cloud bands to suggest rotation.
// Smooth 2D value noise in 0..1.
function noise2(x, y, seed) {
  var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi
  function h(i, j) { return hash(i * 374761 + j * 668265 + seed * 9176) }
  var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf)
  var a = h(xi, yi) + (h(xi + 1, yi) - h(xi, yi)) * u
  var b = h(xi, yi + 1) + (h(xi + 1, yi + 1) - h(xi, yi + 1)) * u
  return a + (b - a) * v
}
function fbm(x, y, seed) {
  return (noise2(x, y, seed) * 0.55 + noise2(x * 2.1, y * 2.1, seed + 1) * 0.3 + noise2(x * 4.3, y * 4.3, seed + 2) * 0.15)
}

// The ring plane every planet uses: tilt squashes it, rot turns it. orbital.js
// reads the same numbers so things orbiting in the ring line up with it.
var TECH_RING = { tilt: 0.3, rot: -0.2, inner: 1.36, outer: 1.62, broken: [1.95, 2.55], segment: 0.26 }

// Angle around the ring (0..2pi, front half is 0..pi) for a point in the
// untilted ring plane.
function ringAngle(rx, ryFlat) {
  var a = Math.atan2(ryFlat, rx)
  return a < 0 ? a + Math.PI * 2 : a
}

// The artificial ring: joints between segments, and a broken stretch whose
// jagged ends are torn open.
function techRingGap(rx, ryFlat, e) {
  var a = ringAngle(rx, ryFlat)
  var b = TECH_RING.broken
  var jag = (hash(Math.floor(e * 40)) - 0.5) * 0.12
  if (a > b[0] + jag && a < b[1] - jag) return true
  var seg = a / TECH_RING.segment
  return seg - Math.floor(seg) < 0.05
}

// Rails at the edges, a deck in the middle, some segments dark, and a
// running light in the middle of the lit ones.
function techRingColor(rx, ryFlat, e, ringCols, seed) {
  var a = ringAngle(rx, ryFlat)
  var segIndex = Math.floor(a / TECH_RING.segment)
  var f = (e - TECH_RING.inner) / (TECH_RING.outer - TECH_RING.inner)
  var rail = f < 0.18 || f > 0.82
  var base = rail ? ringCols[0] : (ringCols[1] || ringCols[0])
  if (hash(segIndex * 13 + seed) > 0.72) base = mix(base, [20, 16, 30], 0.55)
  var mid = a / TECH_RING.segment - segIndex
  if (!rail && Math.abs(f - 0.5) < 0.12 && Math.abs(mid - 0.5) < 0.06) base = ringCols[2] || [88, 200, 255]
  return base
}

// A mothership: a long dark hull, seen side-on, with a few rows of lit
// windows and a glowing engine block at the stern. Faces left.
function mothership(seed, light) {
  var w = 54, h = 15
  var s = blank(w, h)
  var hull = [38, 42, 60], edge = [70, 78, 104], win = hex(light || "#ffd65a"), eng = hex("#58c8ff")
  for (var x = 0; x < w; x++) {
    var u = x / (w - 1)
    // Wedge: a pointed bow on the left, a tall stern.
    var half = 2 + Math.round(5 * Math.min(1, u * 1.6))
    var top = 7 - half, bot = 7 + Math.min(half, 3 + Math.round(u * 3))
    if (u > 0.55 && u < 0.7) top = Math.max(0, top - 2) // bridge tower
    for (var y = Math.max(0, top); y <= Math.min(h - 1, bot); y++) {
      var c = (y === top || y === bot) ? edge : hull
      if (y > top + 1 && y < bot - 1 && x % 3 === 0 && (y % 3 === 1) && hash(seed * 7 + x * 3 + y) > 0.45) c = win
      if (x > w - 4) c = eng
      put(s, x, y, c)
    }
  }
  return s
}

// A small orbital station: "wheel" (a ring with a hub) or "cross" (four
// arms with solar panels).
function orbStation(kind) {
  if (kind === "cross") return fromRows([
    "AAa...K...aAA",
    "AAa..KWK..aAA",
    "AAa..KGK..aAA",
    "..KKKKVKKKK..",
    "..KGGWVWGGK..",
    "..KKKKVKKKK..",
    "AAa..KGK..aAA",
    "AAa..KWK..aAA",
    "AAa...K...aAA"
  ])
  return fromRows([
    "....KKKKK....",
    "..KKnnnnnKK..",
    ".KnK..K..KnK.",
    ".Kn...K...nK.",
    "KnK..KVK..KnK",
    "Kn.KKVYVKK.nK",
    "KnK..KVK..KnK",
    ".Kn...K...nK.",
    ".KnK..K..KnK.",
    "..KKnnnnnKK..",
    "....KKKKK...."
  ])
}

// Scrap from the broken ring: a bent panel, a strut, a hull plate.
function junk(seed) {
  var kinds = [
    ["nn..", "nGn.", ".nnG", "..Kn"],
    ["GnnnK", ".KGGn", "..Kn."],
    ["AaAa", "aAaA", "KKnK"],
    ["TT..", "TsT.", ".TTn", "..n."],
    ["nGnGn", ".KnK."]
  ]
  return fromRows(kinds[Math.abs(seed) % kinds.length])
}

// A torn-off piece of crust still holding a pool of sea: water on top,
// plate and a glowing broken edge underneath.
function crustChunk(seed, sea, plate, fissure) {
  var w = 13 + (Math.abs(seed) % 3) * 3, h = 8
  var s = blank(w, h)
  var water = hex(sea || "#1a8a9a"), foam = mix(water, [255, 255, 255], 0.45)
  var rock = hex(plate || "#5a6478"), dark = mix(rock, [20, 16, 30], 0.5), hot = hex(fissure || "#ff9447")
  for (var x = 0; x < w; x++) {
    var bottom = 3 + Math.round(4 * Math.sin((x / (w - 1)) * Math.PI)) - (hash(seed * 5 + x) > 0.7 ? 1 : 0)
    for (var y = 0; y <= bottom; y++) {
      var c = y === 0 ? (x === 0 || x === w - 1 ? rock : foam) : y === 1 ? (x === 0 || x === w - 1 ? rock : water)
        : y === bottom ? hot : (y === bottom - 1 ? dark : rock)
      put(s, x, y, c)
    }
  }
  return s
}

// The space elevator's climber and a ring turret.
function climber() { return fromRows(["KYK", "YVY", "YVY", "KYK"]) }
function turret() { return fromRows([".R.", "KnK", "nGn"]) }

// spec (looks.js planet()): style, colors, rings, ringColors, spot, rim,
// seed. Without one, the classic ringed giant.
function planet(R, bandShift, spec) {
  spec = spec || {}
  var style = spec.style || "bands"
  var hasRings = spec.rings === undefined ? true : !!spec.rings
  var techRing = style === "tech"
  var ringOuter = hasRings ? (techRing ? 1.62 : 1.85) : 1.0, ringInner = techRing ? 1.36 : 1.28
  var tilt = TECH_RING.tilt, rot = TECH_RING.rot
  var w = Math.ceil(R * 2 * Math.max(1, ringOuter)) + 6
  var h = Math.ceil(R * 2) + 10
  var s = blank(w, h)
  var cx = w / 2, cy = h / 2
  var cols = (spec.colors || ["#d98e5a", "#f1d3a1", "#b5653f", "#e8b980", "#8c4a3a", "#f0c48c"]).map(hex)
  var night = [26, 18, 40]
  var ringCols = (spec.ringColors || ["#cdbb9a", "#a8956f", "#e4d6b6"]).map(hex)
  var rim = hex(spec.rim || "#ffb27a"), spot = hex(spec.spot || "#c2453a")
  var seed = (spec.seed || 0) + 3
  var cr = Math.cos(rot), sr = Math.sin(rot)
  function pick(t) { return cols[Math.max(0, Math.min(cols.length - 1, Math.floor(t * cols.length)))] }
  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var dx = x + 0.5 - cx, dy = y + 0.5 - cy
      // Ring in the tilted plane.
      var rx = dx * cr - dy * sr, ry = dx * sr + dy * cr
      var er = Math.sqrt(rx * rx + (ry / tilt) * (ry / tilt))
      var inRing = hasRings && er > R * ringInner && er < R * ringOuter
      var gap = techRing ? techRingGap(rx, ry / tilt, er / R) : Math.abs(er - R * 1.55) < R * 0.035
      var front = ry > 0
      var l = shadeSphere(dx, dy, R)
      var sphere = l >= 0
      if (sphere && !(inRing && front && !gap)) {
        var lat = dy / R
        var lon = Math.asin(Math.max(-1, Math.min(1, dx / (R * Math.sqrt(Math.max(0.0001, 1 - lat * lat))))))
        var col, glow = 0
        var nx = lon * 2.2 + 3, ny = lat * 2.6 + 3
        if (style === "bands" || style === "storm") {
          var b = lat * 7 + 0.6 * Math.sin(lon * 3 + bandShift + lat * 4) + noise1(lon * 4 + bandShift, seed) * 0.8
          col = cols[Math.floor(((b % cols.length) + cols.length) % cols.length)]
          if (style === "storm") {
            var sx = (lon - 0.45) / 0.32, sy = (lat - 0.32) / 0.13
            var sd = sx * sx + sy * sy
            if (sd < 1) col = sd < 0.45 ? spot : mix(spot, col, 0.5)
          }
        } else if (style === "ocean") {
          var land = fbm(nx * 1.3, ny * 1.3, seed)
          var cloud = fbm(nx * 2.4 + 9, ny * 4, seed + 7)
          col = land > 0.56 ? (land > 0.6 ? cols[2] : cols[3] || cols[2]) : (land > 0.47 ? cols[1] : cols[0])
          if (cols[4] && cloud > 0.66) col = mix(col, cols[4], 0.85)
          if (Math.abs(lat) > 0.86 && cols[4]) col = cols[4]
        } else if (style === "lava") {
          var n = fbm(nx * 1.8, ny * 1.8, seed)
          col = n > 0.5 ? cols[1] : cols[0]
          var crack = Math.abs(fbm(nx * 2.6, ny * 2.6, seed + 4) - 0.5)
          if (crack < 0.035) { col = crack < 0.015 && cols[3] ? cols[3] : cols[2]; glow = 0.9 }
        } else if (style === "ice") {
          var m = fbm(nx * 1.5, ny * 1.5, seed)
          col = pick(Math.min(0.999, m * 0.95))
          if (Math.abs(fbm(nx * 3, ny * 3, seed + 5) - 0.5) < 0.018) col = cols[Math.min(2, cols.length - 1)]
          if (Math.abs(lat) > 0.8 && cols[3]) col = cols[3]
        } else if (style === "rocky") {
          col = pick(Math.min(0.999, fbm(nx * 1.6, ny * 1.6, seed)))
          for (var k = 0; k < 7; k++) {
            var clon = (hash(seed * 31 + k) - 0.5) * 2.6, clat = (hash(seed * 17 + k * 3) - 0.5) * 1.6
            var cr2 = 0.06 + hash(seed + k * 11) * 0.12
            var dd = Math.hypot(lon - clon, (lat - clat) * 1.4)
            if (dd < cr2) col = dd > cr2 * 0.7 ? cols[cols.length - 1] : cols[Math.min(2, cols.length - 1)]
          }
        } else if (style === "tech") {
          // A machine world: armour plates over drowned seas, glowing
          // fissures, and city lights on the night side.
          // colors: plate, seam, ocean, shallows, fissure, lights.
          var plateU = Math.floor(lon * 7 + 20), plateV = Math.floor(lat * 9 + 20)
          var ph = hash(plateU * 31 + plateV * 17 + seed)
          col = ph > 0.5 ? cols[0] : mix(cols[0], cols[1], 0.35)
          var fu = lon * 7 + 20 - plateU, fv = lat * 9 + 20 - plateV
          var seam = fu < 0.08 || fv < 0.1
          if (seam) col = cols[1]
          var sea = fbm(nx * 1.25, ny * 1.25, seed)
          var isSea = sea < 0.43
          if (isSea) col = sea < 0.37 ? cols[2] : (cols[3] || cols[2])
          // A few long fissures: thin where the noise crosses 0.5, only
          // where a second, slower field says the crust is breaking.
          var crack = Math.abs(fbm(nx * 1.3 + 5, ny * 1.3, seed + 9) - 0.5)
          var breaking = fbm(nx * 0.8 + 2, ny * 0.8, seed + 21) > 0.5
          if (breaking && crack < 0.016) { col = cols[4] || cols[1]; glow = crack < 0.007 ? 1 : 0.7 }
          else if (!isSea && l < 0.42 && (seam || hash(plateU * 7 + plateV * 3 + seed) > 0.8)
                   && hash(x * 7 + y * 13 + seed) > (seam ? 0.35 : 0.7)) {
            col = cols[5] || cols[0]; glow = 0.95
          }
        } else {
          // crystal: faceted, with bright sparkles.
          var f = Math.floor(fbm(nx * 2.2, ny * 2.2, seed) * 6)
          col = cols[f % cols.length]
          if (hash(Math.floor(nx * 9) * 13 + Math.floor(ny * 9) * 7 + seed) > 0.985) { col = cols[cols.length - 1]; glow = 0.7 }
        }
        var lv = dither(Math.pow(l, 0.8), x, y, 5)
        put(s, x, y, glow ? mix(mix(night, col, 0.18 + 0.82 * lv), col, glow) : mix(night, col, 0.18 + 0.82 * lv))
        continue
      }
      if (inRing && !gap) {
        var rc = techRing ? techRingColor(rx, ry / tilt, er / R, ringCols, seed)
          : ringCols[Math.floor(er / (R * 0.09)) % ringCols.length]
        // The planet's shadow falls on the far ring behind it.
        var shadow = !front && dx > 0 && Math.abs(dy) < R * 0.9 ? 0.45 : 1
        put(s, x, y, mix([20, 16, 30], rc, dither(0.85 * shadow, x, y, 4)), 230)
        continue
      }
      var d = Math.sqrt(dx * dx + dy * dy)
      if (d < R + 2.5 && d >= R) put(s, x, y, rim, 70)
    }
  }
  return s
}

function island(seed) {
  var w = 96, h = 40
  var s = blank(w, h)
  var sand = hex(PALETTE.S), sandD = hex(PALETTE.s)
  var rk = hex(PALETTE.M), rkD = hex(PALETTE.m), deep = [32, 24, 48], crystal = hex(PALETTE.Q)
  for (var x = 0; x < w; x++) {
    var u = (x - w / 2) / (w / 2 - 3)
    if (Math.abs(u) > 1) continue
    var edge = Math.sqrt(1 - u * u)
    var top = Math.round(8 - edge * 3 + noise1(x * 0.3, seed) * 2)
    var depth = Math.round(4 + 28 * Math.pow(edge, 1.6) + noise1(x * 0.22, seed + 5) * 6)
    for (var y = top; y < Math.min(h, top + depth); y++) {
      var k = y - top
      var col
      if (k < 3) col = (k === 2 && BAYER[y & 3][x & 3] > 6) ? rk : (k === 0 ? sand : (BAYER[y & 3][x & 3] > 9 ? sandD : sand))
      else {
        var shade = 1 - k / depth
        var lightSide = 0.5 - u * 0.35
        var v = dither(Math.max(0, Math.min(1, shade * 0.75 + lightSide * 0.4)), x, y, 3)
        col = v > 0.75 ? rk : v > 0.25 ? rkD : deep
        if (hash(seed * 7 + x * 13 + y * 29) > 0.985 && k > 5) col = crystal
      }
      put(s, x, y, col)
    }
  }
  return s
}

// A station wheel: rim, spokes and running lights.
function wheel(R) {
  var size = R * 2 + 3
  var s = blank(size, size)
  var c = size / 2
  var rim = hex(PALETTE.n), rimD = hex(PALETTE.N), lamp = hex(PALETTE.Y), glass = hex("#2b4f8f"), lit = hex("#ffe08a")
  for (var y = 0; y < size; y++) {
    for (var x = 0; x < size; x++) {
      var dx = x + 0.5 - c, dy = y + 0.5 - c
      var d = Math.sqrt(dx * dx + dy * dy)
      var ang = Math.atan2(dy, dx)
      if (d <= R && d > R - 6) {
        var seg = Math.floor(((ang + Math.PI) / (2 * Math.PI)) * 24)
        if (d > R - 4 && d < R - 2) put(s, x, y, (seg % 3 === 0) ? lit : glass)
        else put(s, x, y, (ang > -2.4 && ang < 0.6) ? rim : rimD)
      } else if (d < R - 6 && d > 5) {
        for (var k = 0; k < 4; k++) {
          var a = k * Math.PI / 2
          var px = Math.cos(a), py = Math.sin(a)
          var along = dx * px + dy * py
          var across = Math.abs(dx * py - dy * px)
          if (along > 0 && across < 1.3) put(s, x, y, rimD)
        }
      } else if (d <= 5) {
        put(s, x, y, d < 2.5 ? lamp : rim)
      }
    }
  }
  return s
}

// ------------------------------------------------------ station models
// Hull tones shared by the bigger stations: light from the upper left.
var HULL = { hi: [170, 178, 204], mid: [107, 114, 144], lo: [62, 66, 92], edge: [37, 39, 58] }
function hullAt(dx, dy, r) {
  var k = (-dx - dy) / (r * 1.41)
  return k > 0.35 ? HULL.hi : k > -0.25 ? HULL.mid : HULL.lo
}

// A big habitat torus seen face-on: hull rails, a band of lit windows
// (green farms and warm cabins), six spokes and a hub. It turns as a whole.
function stationTorus(R) {
  var size = R * 2 + 3
  var s = blank(size, size)
  var c = size / 2
  var farm = [93, 255, 157], cabin = [255, 224, 138], glass = [24, 36, 70], lamp = hex(PALETTE.Y)
  for (var y = 0; y < size; y++) {
    for (var x = 0; x < size; x++) {
      var dx = x + 0.5 - c, dy = y + 0.5 - c
      var d = Math.sqrt(dx * dx + dy * dy)
      var ang = Math.atan2(dy, dx)
      var seg = Math.floor(((ang + Math.PI) / (2 * Math.PI)) * 36)
      var segF = ((ang + Math.PI) / (2 * Math.PI)) * 36 - seg
      if (d <= R && d > R - 11) {
        var band = R - d
        if (band < 2.2 || band > 8.8) put(s, x, y, band < 1 || band > 10 ? HULL.edge : hullAt(dx, dy, R))
        else if (segF < 0.12) put(s, x, y, HULL.lo)
        else {
          var lit = hash(seg * 7) > 0.25
          var col = !lit ? glass : (seg % 3 === 0 ? farm : cabin)
          if (lit && band > 4 && band < 7 && hash(seg * 13 + Math.floor(segF * 4)) > 0.6) col = mix(col, [255, 255, 255], 0.4)
          put(s, x, y, mix(glass, col, lit ? 0.85 : 1))
        }
      } else if (d <= R - 11 && d > 11) {
        for (var k = 0; k < 6; k++) {
          var a = k * Math.PI / 3 + 0.26
          var along = dx * Math.cos(a) + dy * Math.sin(a)
          var across = Math.abs(dx * Math.sin(a) - dy * Math.cos(a))
          if (along > 0 && across < 1.8) put(s, x, y, across < 0.8 ? HULL.mid : HULL.lo)
        }
      } else if (d <= 11) {
        put(s, x, y, d < 3 ? lamp : d < 5 ? HULL.edge : d > 10 ? HULL.edge : hullAt(dx, dy, 11))
      }
    }
  }
  return s
}

// The torus' fixed docking spindle: a long truss with a port at each end.
function stationSpindle(len) {
  var h = 9
  var s = blank(len, h)
  for (var x = 0; x < len; x++) {
    var port = x < 7 || x >= len - 7
    for (var y = 0; y < h; y++) {
      if (port) {
        var edge = y === 0 || y === h - 1 || x === 0 || x === len - 1
        put(s, x, y, edge ? HULL.edge : (y === 4 ? [255, 214, 90] : y < 4 ? HULL.hi : HULL.mid))
      } else if (y >= 3 && y <= 5) {
        put(s, x, y, y === 4 ? HULL.lo : (x % 4 === 0 ? HULL.edge : HULL.mid))
      }
    }
  }
  return s
}

// A tall spire: an antenna, three decks with windows, two pairs of solar
// wings, and a hangar bay at the foot with its doors open.
function stationSpire() {
  var w = 76, h = 120
  var s = blank(w, h)
  var cx = 38, win = [255, 224, 138], dark = [12, 14, 28], pane = hex(PALETTE.A), paneD = hex(PALETTE.a)
  function deck(y0, half, hh) {
    for (var y = y0; y < y0 + hh; y++) for (var x = cx - half; x < cx + half; x++) {
      var edge = y === y0 || y === y0 + hh - 1 || x === cx - half || x === cx + half - 1
      var c = edge ? HULL.edge : (y - y0 < hh / 2 ? HULL.hi : HULL.mid)
      if (!edge && y === y0 + Math.floor(hh / 2) && (x - cx + half) % 3 !== 0) c = hash(x * 3 + y) > 0.3 ? win : dark
      put(s, x, y, c)
    }
  }
  function wing(y0, dir) {
    for (var x = 0; x < 30; x++) {
      var px = dir < 0 ? cx - 6 - x : cx + 5 + x
      put(s, px, y0 + 4, HULL.lo)
      if (x > 5) for (var y = y0; y < y0 + 9; y++) {
        if (y === y0 + 4) continue
        put(s, px, y, (x % 5 === 0 || y === y0 || y === y0 + 8) ? paneD : pane)
      }
    }
  }
  wing(32, -1); wing(32, 1); wing(64, -1); wing(64, 1)
  for (var y = 8; y < 104; y++) for (var x = cx - 5; x < cx + 5; x++)
    put(s, x, y, x === cx - 5 || x === cx + 4 ? HULL.edge : x < cx - 1 ? HULL.hi : HULL.mid)
  for (y = 0; y < 9; y++) put(s, cx - 1, y, HULL.mid)
  put(s, cx - 1, 0, hex(PALETTE.R)); put(s, cx - 2, 0, hex(PALETTE.R))
  deck(18, 20, 9)
  deck(46, 26, 11)
  deck(78, 22, 9)
  // Hangar: a wide block, doors open on a lit bay.
  for (y = 96; y < 118; y++) for (x = cx - 16; x < cx + 16; x++) {
    var edge = y === 96 || y === 117 || x === cx - 16 || x === cx + 15
    var bay = y > 101 && y < 114 && x > cx - 12 && x < cx + 11
    put(s, x, y, edge ? HULL.edge : bay ? (y === 113 ? win : dark) : (y < 104 ? HULL.hi : HULL.mid))
  }
  return s
}

// A citadel: a hexagonal core with a lit window ring, six pods on struts,
// a dashed docking ring with clamps, and a dish antenna.
function stationCitadel() {
  var size = 104
  var s = blank(size, size)
  var c = size / 2
  var win = [255, 224, 138], dark = [12, 14, 28]
  var podCols = [[255, 148, 71], [88, 200, 255], [155, 107, 255], [93, 255, 157], [255, 106, 213], [255, 214, 90]]
  for (var y = 0; y < size; y++) {
    for (var x = 0; x < size; x++) {
      var dx = x + 0.5 - c, dy = y + 0.5 - c
      var d = Math.sqrt(dx * dx + dy * dy)
      var ang = Math.atan2(dy, dx)
      // Docking ring, dashed, with clamps every 45 degrees.
      if (d > 45 && d < 48) {
        var seg = ((ang + Math.PI) / (Math.PI / 4)) % 1
        if (seg < 0.12 || seg > 0.88) put(s, x, y, HULL.hi)
        else if (Math.floor((ang + Math.PI) * 12) % 2 === 0) put(s, x, y, HULL.lo)
        continue
      }
      // Struts to the pods.
      for (var k = 0; k < 6; k++) {
        var a = k * Math.PI / 3
        var along = dx * Math.cos(a) + dy * Math.sin(a)
        var across = Math.abs(dx * Math.sin(a) - dy * Math.cos(a))
        if (along > 14 && along < 26 && across < 1.5) put(s, x, y, HULL.lo)
        // Pods.
        var px = Math.cos(a) * 31, py = Math.sin(a) * 31
        var pd = Math.hypot(dx - px, dy - py)
        if (pd < 8) put(s, x, y, pd > 7 ? HULL.edge : pd < 2.5 ? win : pd < 4 ? podCols[k] : hullAt(dx - px, dy - py, 8))
      }
      // Hex core.
      var q = Math.max(Math.abs(dx) * 0.866 + Math.abs(dy) * 0.5, Math.abs(dy))
      if (q < 17) {
        var col = q > 16 ? HULL.edge : hullAt(dx, dy, 17)
        if (q > 10 && q < 12.5) col = Math.floor((ang + Math.PI) * 4) % 3 === 0 ? dark : win
        if (q < 4) col = hex(PALETTE.Y)
        put(s, x, y, col)
      }
    }
  }
  // Dish antenna on the upper right, on a short mast.
  var ax = c + 22, ay = c - 30
  for (var i = 0; i < 6; i++) put(s, Math.round(c + 10 + i * 2), Math.round(c - 10 - i * 3.3), HULL.lo)
  for (y = -7; y <= 7; y++) for (x = -7; x <= 7; x++) {
    var r2 = Math.hypot(x, y)
    if (r2 < 7 && x - y > 3) put(s, ax + x, ay + y, r2 > 6 ? HULL.edge : HULL.hi)
  }
  put(s, ax - 2, ay + 2, hex(PALETTE.R))
  return s
}

// The station's habitat module, with a strip of windows people walk past.
function habitat(w, h) {
  var s = blank(w, h)
  var hull = hex("#8b93b3"), hullD = hex("#4b5170"), win = hex("#14203f"), stripe = hex(PALETTE.R)
  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var edge = x === 0 || y === 0 || x === w - 1 || y === h - 1
      var col = edge ? hullD : (y < h * 0.45 ? hull : mix(hull, hullD, dither(0.6, x, y, 2)))
      if (y >= 4 && y <= 8 && x >= 3 && x <= w - 4) col = win
      if (y === h - 4 && x > 2 && x < w - 3) col = stripe
      put(s, x, y, col)
    }
  }
  return s
}


// A pixel sun: dithered disc, hot core, and rays on a ring (two frames).
function sun(R, frame) {
  var size = R * 2 + 14
  var s = blank(size, size)
  var c = size / 2
  var core = hex("#fff6c0"), mid = hex("#ffd65a"), edge = hex("#ff9447")
  for (var y = 0; y < size; y++) {
    for (var x = 0; x < size; x++) {
      var dx = x + 0.5 - c, dy = y + 0.5 - c
      var d = Math.sqrt(dx * dx + dy * dy)
      if (d <= R) {
        var t = d / R
        var v = dither(1 - t, x, y, 4)
        put(s, x, y, v > 0.6 ? core : v > 0.3 ? mid : edge)
      } else if (d > R + 2 && d < R + 6) {
        var ang = Math.atan2(dy, dx) + (frame % 2 ? Math.PI / 12 : 0)
        var ray = Math.cos(ang * 12)
        if (ray > 0.86) put(s, x, y, mid, d < R + 4 ? 255 : 170)
      }
    }
  }
  return s
}

// The moon in its phase (0 new, 0.5 full): lit side shaded, dark side faint.
function moonPhase(R, phase) {
  var size = R * 2 + 2
  var s = blank(size, size)
  var c = size / 2
  var lit = hex("#eef0f7"), shade = hex("#b9c3d9"), dark = hex("#2a2f4a")
  var k = Math.cos(2 * Math.PI * phase)
  for (var y = 0; y < size; y++) {
    for (var x = 0; x < size; x++) {
      var dx = x + 0.5 - c, dy = y + 0.5 - c
      if (dx * dx + dy * dy > R * R) continue
      var ry = Math.sqrt(Math.max(0, R * R - dy * dy))
      var isLit = phase < 0.5 ? dx > ry * k : dx < -ry * k
      var crater = hash(Math.floor(x / 2) * 7 + Math.floor(y / 2) * 13 + 5) > 0.84
      if (isLit) put(s, x, y, crater ? shade : (dither(0.75, x, y, 2) > 0.5 ? lit : shade))
      else put(s, x, y, dark, 150)
    }
  }
  return s
}

var ROCKET = [
  "........KKK.......",
  "......KKWWWKK.....",
  "...KKKWWWWWWWKK...",
  ".KKRRWWWVVWWWWWKK.",
  "KRRRRWWWVVWWWWWWWK",
  ".KKRRWWWWWWWWWWKK.",
  "...KKKWWWWWWWKK...",
  "......KKWWWKK.....",
  "........KKK......."
]

// The hourly rocket, nose to the right.
function rocket() {
  var rows = ROCKET.map(function(r) { return r.split("").reverse().join("") })
  return fromRows(rows)
}

// ---------------------------------------------------------------- homes

// The castaway's home: the ground the astronaut, cat and dog stand on, 96
// pixels wide (or wider, centred) with its walking surface on row 8 (see looks.js HOME_LAYOUT),
// plus two landmarks that take the palm's and the tent's places.

// The island's rock with a paved stone top: the floating castle's base.
function castleRock(seed) {
  var s = island(seed)
  var stone = hex("#a3a9c2"), stoneD = hex("#6b7290"), mortar = hex("#4b5170")
  var sand = hex(PALETTE.S), sandD = hex(PALETTE.s), rk = hex(PALETTE.M)
  for (var y = 0; y < s.h; y++) for (var x = 0; x < s.w; x++) {
    var i = (y * s.w + x) * 4
    if (!s.data[i + 3]) continue
    var c = [s.data[i], s.data[i + 1], s.data[i + 2]]
    var isSand = (c[0] === sand[0] && c[1] === sand[1]) || (c[0] === sandD[0] && c[1] === sandD[1])
    if (isSand || (c[0] === rk[0] && c[1] === rk[1] && y < 12)) {
      var brick = (x + (y % 2) * 3) % 6 === 0
      put(s, x, y, brick ? mortar : (BAYER[y & 3][x & 3] > 10 ? stoneD : stone))
    }
  }
  return s
}

// A small round world of its own, grass on top: characters stand on it and
// lean with its curve (HOME_LAYOUT.planetoid.curve).
function planetoid(R) {
  R = R || 48
  var w = R * 2, h = R * 2 + 8
  var s = blank(w, h)
  var grass = hex("#3fae6a"), grassD = hex("#2a7a4a"), grassL = hex("#7dd87d")
  var soil = hex("#8a5a35"), rock = hex(PALETTE.M), rockD = hex(PALETTE.m), night = [26, 18, 40]
  var path = hex("#e9cf93"), flower = [hex("#ff8fa8"), hex("#ffd65a"), hex("#eef0f7")]
  for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
    var dx = x + 0.5 - R, dy = y + 0.5 - (R + 8)
    var l = shadeSphere(dx, dy, R)
    if (l < 0) {
      var d = Math.sqrt(dx * dx + dy * dy)
      if (d < R + 3) put(s, x, y, hex("#9fe3ff"), Math.round(60 * (1 - (d - R) / 3)))
      continue
    }
    var lat = dy / R, n = noise1(x * 0.35, 7) * 0.12
    var col
    if (lat < -0.45 + n) {
      col = BAYER[y & 3][x & 3] > 11 ? grassL : grass
      if (Math.abs(lat + 0.62 + Math.sin(x * 0.15) * 0.03) < 0.035) col = path
      else if (hash(x * 31 + y * 17) > 0.975) col = flower[(x + y) % 3]
    } else if (lat < -0.3 + n) col = BAYER[y & 3][x & 3] > 7 ? grassD : soil
    else col = hash(x * 7 + y * 13) > 0.6 ? rockD : rock
    put(s, x, y, mix(night, col, 0.25 + 0.75 * dither(Math.pow(l, 0.8), x, y, 4)))
  }
  return s
}

// A little starship: flat deck on row 8, white hull, portholes, engines.
function shipHull() {
  var w = 96, h = 40
  var s = blank(w, h)
  var hull = hex(PALETTE.W), hullD = hex(PALETTE.G), deck = hex(PALETTE.n), deckD = hex(PALETTE.N)
  var stripe = hex(PALETTE.A), glass = hex(PALETTE.V), outline = hex(PALETTE.K), glow = hex(PALETTE.O)
  for (var x = 0; x < w; x++) {
    var u = x / (w - 1)
    // Deep amidships, rising to a pointed bow on the right.
    var bottom = 8 + Math.round(u < 0.08 ? 14 + u * 60 : u > 0.78 ? 20 * Math.max(0, 1 - (u - 0.78) / 0.22) : 19 + Math.sin(u * 3) * 1.5)
    var top = u > 0.9 ? 8 + Math.round((u - 0.9) * 40) : 8
    for (var y = top; y <= bottom && y < h; y++) {
      var col
      if (y === top || y === bottom || (x === 0 && y > top)) col = outline
      else if (y < top + 2) col = BAYER[y & 3][x & 3] > 8 ? deckD : deck
      else if (y === top + 6 || y === top + 7) col = stripe
      else if (y === top + 4 && x % 8 === 4 && x > 8 && x < 80) col = glass
      else col = y > bottom - 3 ? hullD : hull
      put(s, x, y, col)
    }
  }
  // Engine nozzles at the stern, with a glow.
  for (var e = 0; e < 2; e++) for (var yy = 0; yy < 4; yy++) {
    put(s, 0, 12 + e * 7 + yy, outline)
    put(s, 1, 12 + e * 7 + yy, yy === 1 || yy === 2 ? glow : hullD)
  }
  return s
}

var DECOR = {
  tree: [
    "...LLLLL...",
    "..LLlLLLL..",
    ".LLLLLLlLL.",
    ".LlLLLLLLL.",
    ".LLLLlLLLL.",
    "..LLLLLLL..",
    "...LLTLL...",
    ".....T.....",
    ".....T.....",
    ".....T.....",
    "....TTT...."
  ],
  hut: [
    ".........KK..",
    "....KKKKKNNK.",
    "..KKRRRRRKK..",
    ".KRRRRRRRRRK.",
    "KRRRRRRRRRRRK",
    ".KWWWWWWWWWK.",
    ".KWVVWKKWVVK.",
    ".KWVVWKYWVVK.",
    ".KWWWWKKWWWK.",
    ".KKKKKKKKKKK."
  ],
  tower: [
    "....R....",
    "....RR...",
    "....RRR..",
    "....K....",
    ".K.K.K.K.",
    ".KGKGKGK.",
    ".KGGGGGK.",
    ".KGGGGGK.",
    ".KGGKGGK.",
    ".KGKYKGK.",
    ".KGGGGGK.",
    ".KGGGGGK.",
    ".KGGGGGK.",
    ".KnGGGnK.",
    ".KGGGGGK.",
    ".KGGGGGK.",
    ".KKKKKKK."
  ],
  keep: [
    "......R......",
    "......RR.....",
    "......K......",
    "K.K.KKKKK.K.K",
    "KKKKKGGGKKKKK",
    "KGGGGGGGGGGGK",
    "KGYGGGGGGGYGK",
    "KGGGGKKKGGGGK",
    "KGGGKNNNKGGGK",
    "KGGGKNNNKGGGK",
    "KKKKKKKKKKKKK"
  ],
  antenna: [
    "...R...",
    "..KRK..",
    "...K...",
    ".KKKKK.",
    "KWWWWWK",
    ".KWWWK.",
    "...K...",
    "...K...",
    "...K...",
    "...K...",
    "...K...",
    "...K...",
    "...K...",
    "..KKK..",
    ".KnnnK.",
    "KKKKKKK"
  ],
  cockpit: [
    "....KKKKK....",
    "..KKBBBBBKK..",
    ".KBBBBBBBBBK.",
    "KBBBBBBBBBBBK",
    "KBBBBBBBBBBBK",
    "KKKKKKKKKKKKK",
    "KnnnnnnnnnnnK",
    "KKKKKKKKKKKKK"
  ]
}

// The ground sprite for a home style, and its two landmarks.
function home(style, seed) {
  if (style === "castle") return castleRock(seed)
  if (style === "planetoid") return planetoid(56)
  if (style === "ship") return shipHull()
  return island(seed)
}
function decor(name) {
  if (name === "palm") return palm()
  if (name === "tent") return tent()
  return DECOR[name] ? fromRows(DECOR[name]) : null
}

// ---------------------------------------------------------------- episodes

var COW = [
  "G..G............",
  "WWWW.WWWWWWWWWW.",
  "WKWKWWWKKWWWWKKW.",
  "WWWWWWKKKWWWWKKWK",
  "PPPPWWWWWWWWWWWWK",
  ".PP.WWWWWWKKWWW.",
  "....WWP....WW...",
  "....WW.....WW...",
  "....KK.....KK..."
]

var GRASS_ROCK = [
  "..L.L....L...L.L..",
  ".LLLLLLLLLLLLLLLL.",
  "LLlLLLLlLLLLLlLLLL",
  "MMlMMMMMlMMMMMMlMM",
  ".MMMMMMMMmMMMMMMM.",
  "..MMMmMMMMMMMmMM..",
  "...mMMMMMMMMMMm...",
  ".....mMMMMMMm.....",
  ".......mmmm......."
]

// Alien in the dome; the rim lights swap every frame.
var UFO = [
  ".......BBBBBB.......",
  "......BBLLLLBB......",
  "......BLKLLKLB......",
  "......BLLLLLLB......",
  "...KKKKKKKKKKKKKK...",
  ".KnGGGGGGGGGGGGGGnK.",
  "KGYGGOGGYGGOGGYGGOGK",
  ".KnnnnnnnnnnnnnnnnK.",
  "...KKNNNNNNNNNNKK...",
  ".......KKKKKK......."
]

// The dog, sitting, facing right.
var DOG = [
  "......T.T..",
  "......SSSS.",
  "......SKSSK",
  "......SSSS.",
  "..S...RRR..",
  ".S...SSSS..",
  "..SSSSSSS..",
  "..SSSSSSSS.",
  "..STSSSTSS.",
  "..SS.S.SS.."
]

// The dog's little ship, nose right; D marks the cockpit seat.
var DOG_SHIP = [
  "......BBBB.......",
  ".....BDBBDB......",
  ".....BDDDDB......",
  "....KKKRRKKKK....",
  "..KWWWWWWWWWWKK..",
  "KRWWWAWWAWWWWWVK.",
  "..KWWWWWWWWWWKK..",
  "...KKNNNNNNKK....",
  "....K......K....."
]

// Pirate galleon, bow left, with a skull flag.
var PIRATE = [
  "..........KKKK....",
  "..........KWWK....",
  "..........KKWK....",
  "...........T......",
  "........RRRT......",
  ".......RRWRT..RR..",
  "......RRRRRT.RRRR.",
  ".....RRRRRRT.RRRR.",
  "...........T...T..",
  "KKKKKKKKKKKKKKKKKK",
  ".KTTTTYTTTTYTTTTK.",
  "..KTTTTTTTTTTTTK..",
  "...KKKKKKKKKKKK..."
]

// Space whale, facing right.
var WHALE = [
  "..............AAAAAA........",
  "...........AAAAAAAAAAAA.....",
  "a.......AAAAAAAAAAAAAAAAA...",
  "aa....AAAAAAAAAAAAAAAAAAAA..",
  ".aa.AAAAAAAAAAAAAAAAAAAWKAA.",
  "..aAAAAAAAAAAAAAAAAAAAAKKAAA",
  ".aa.aAAAAAAAAAAAAAAAAAAAAAAA",
  "aa....aAAVVVVVVVVVVVVVVVVVAA",
  "a.......aaVVVVVVVVVVVVVVVVa.",
  ".............aaaaaaVVVaaa...",
  "...............aaa.........."
]


// Gaits: the episodes swap these in while a character runs along the ground
// (episodes.js GAITS). Same height as the standing sprites, feet on the
// bottom row, facing right.
var DOG_RUN = [[
  ".........T.T..",
  ".........SSSS.",
  ".........SKSSK",
  "S........SSSS.",
  ".S......RRR...",
  "..SSSSSSSSSS..",
  "..SSSSSSSSSS..",
  "..STSSSSSTSS..",
  ".SS.......SS..",
  "SS.........SS."
], [
  "..............",
  ".........T.T..",
  ".........SSSS.",
  ".S.......SKSSK",
  "..S......SSSS.",
  "..S.....RRR...",
  "..SSSSSSSSSS..",
  "..STSSSSSTSS..",
  "....SS.SS.....",
  "...SS...SS...."
]]

// The sitting dog wagging: the tail up instead of down.
var DOG_WAG = [
  "......T.T..",
  "......SSSS.",
  "......SKSSK",
  ".S....SSSS.",
  "..S...RRR..",
  ".....SSSS..",
  "..SSSSSSS..",
  "..SSSSSSSS.",
  "..STSSSTSS.",
  "..SS.S.SS.."
]

var CAT_WALK = [[
  "............",
  "............",
  "C.......C..C",
  ".C......CCCC",
  ".C......CKCP",
  "..CCCCCCCCC.",
  "..CcCcCcCCC.",
  "..CCCCCCCC..",
  "..C.C...C.C.",
  ".C...C.C...C"
], [
  "............",
  "............",
  ".C......C..C",
  "C.......CCCC",
  ".C......CKCP",
  "..CCCCCCCCC.",
  "..CcCcCcCCC.",
  "..CCCCCCCC..",
  "...CC...CC..",
  "...C.C..C.C."
]]

function legs(rows, a, b) { return rows.slice(0, 13).concat([a, b]) }
var ASTRONAUT_WALK = [
  legs(ASTRONAUT, "..KWK..KWK..", ".KK......KK."),
  legs(ASTRONAUT, "....KWWK....", "....KKKK....")
]

function dogRun(frame, o) { return fromRows(DOG_RUN[frame % 2], o) }
function dogWag(o) { return fromRows(DOG_WAG, o) }
function catWalk(frame, o) { return fromRows(CAT_WALK[frame % 2], o) }
// The cat blinking (eyes shut) or swishing its tail up.
function catBlink(o) { return fromRows(CAT_SIT.map(function(r) { return r.replace(/K/g, "c") }), o) }
function catSwish(o) {
  var rows = CAT_SIT.slice()
  rows[5] = "..CCCCC.C"; rows[6] = ".CCcCcCCC"; rows[7] = ".CCCCCCC."; rows[9] = "........."
  return fromRows(rows, o)
}
function astronautWalk(frame, o) { return fromRows(ASTRONAUT_WALK[frame % 2], o) }

function cow() { return fromRows(COW) }
function grassRock() { return fromRows(GRASS_ROCK) }
function ufo(frame) {
  var rows = frame % 2 ? UFO.map(function(r) { return r.replace(/Y/g, "#").replace(/O/g, "Y").replace(/#/g, "O") }) : UFO
  return fromRows(rows)
}
function dog(o) { return fromRows(DOG, o) }
// withDog: the dog's head shows in the bubble.
function dogShip(withDog, o) {
  return fromRows(DOG_SHIP.map(function(r, i) {
    if (!withDog) return r.replace(/D/g, "B")
    return i === 1 ? r.replace(/D/g, "T") : r.replace("BDDDDB", "BSSKSB")
  }), withDog && o ? { S: o.S, T: o.T } : null)
}
function pirate() { return fromRows(PIRATE) }
function whale() { return fromRows(WHALE) }

if (typeof module !== "undefined") {
  module.exports = { astronaut: astronaut, astronautWave: astronautWave, cat: cat, catSit: catSit,
    fish: fish, satellite: satellite, shuttle: shuttle, palm: palm, tent: tent, fire: fire,
    rock: rock, moon: moon, planet: planet, island: island, wheel: wheel, habitat: habitat,
    ship: ship, crate: crate, sun: sun, moonPhase: moonPhase, rocket: rocket,
    fromRows: fromRows, fromArt: fromArt, cow: cow, grassRock: grassRock, ufo: ufo, dog: dog, dogShip: dogShip, pirate: pirate, whale: whale,
    home: home, decor: decor, planetoid: planetoid, shipHull: shipHull, castleRock: castleRock,
    TECH_RING: TECH_RING, mothership: mothership, orbStation: orbStation, junk: junk, crustChunk: crustChunk,
    climber: climber, turret: turret, hex: hex, stationTorus: stationTorus, stationSpindle: stationSpindle,
    stationSpire: stationSpire, stationCitadel: stationCitadel,
    dogRun: dogRun, dogWag: dogWag, catWalk: catWalk, catBlink: catBlink, catSwish: catSwish, astronautWalk: astronautWalk }
}
