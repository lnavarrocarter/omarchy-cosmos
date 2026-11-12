.pragma library

// Cielo 3: más viajeros del panorama, agujero de gusano y la hora (zona world).
// See EPISODES.md for the format; ART names use this pack's own prefix.

// Adds a one-pixel K outline around a sprite (rows or { rows, colors }).
function ol(def) {
  var rows = Array.isArray(def) ? def : def.rows
  var h = rows.length, w = 0, y, x
  for (y = 0; y < h; y++) w = Math.max(w, rows[y].length)
  function at(cx, cy) {
    if (cy < 0 || cy >= h || cx < 0 || cx >= w) return "."
    return rows[cy][cx] || "."
  }
  var out = []
  for (y = -1; y <= h; y++) {
    var line = ""
    for (x = -1; x <= w; x++) {
      var ch = at(x, y)
      if (ch !== ".") { line += ch; continue }
      var n = [at(x - 1, y), at(x + 1, y), at(x, y - 1), at(x, y + 1)]
      var edge = false
      for (var i = 0; i < 4; i++) if (n[i] !== "." && n[i] !== "K") edge = true
      line += edge ? "K" : "."
    }
    out.push(line)
  }
  return Array.isArray(def) ? out : { rows: out, colors: def.colors }
}

// The solar sail: a big curved sail whose shine sweeps across it.
function sail(phase) {
  var rows = [], H = 26, W = 30
  for (var y = 0; y < H; y++) {
    var line = ""
    for (var x = 0; x < W; x++) {
      var ch = "."
      if (y < 21) {
        var span = Math.round(21 * Math.sin(Math.PI * (y + 1) / 22))
        if (x === 6) ch = "T"
        else if (x > 6 && x <= 6 + span) {
          var band = ((x + y * 0.6 - phase * 5) % 15 + 15) % 15
          ch = band < 1.6 ? "W" : band < 3.4 ? "Q" : (x + y) % 7 === 0 ? "u" : "B"
          if (x === 6 + span) ch = "Q"
        }
      } else if (y === 21) {
        if (x === 6) ch = "T"
        else if (x >= 1 && x <= 25) ch = "N"
      } else if (y === 22) {
        if (x >= 1 && x <= 25) ch = (x % 5 === 2) ? "Y" : "n"
      } else if (y === 23) {
        if (x >= 3 && x <= 23) ch = "n"
      } else if (y === 24) {
        if (x >= 6 && x <= 20) ch = "N"
      }
      line += ch
    }
    rows.push(line)
  }
  return ol({ colors: { u: ["#fff6c0", 200] }, rows: rows })
}

// The mothership: a saucer 100 px wide with a glass dome and running lights.
function mother(frame, open) {
  var W = 100, H = 30, rows = [], cx = 49.5
  var LIGHTS = ["R", "Y", "Q", "P"]
  for (var y = 0; y < H; y++) {
    var line = ""
    for (var x = 0; x < W; x++) {
      var dx = x - cx, ch = "."
      var dome = (dx * dx) / (17 * 17) + ((y - 10) * (y - 10)) / (9 * 9)
      var hull = (dx * dx) / (50 * 50) + ((y - 16) * (y - 16)) / (6.5 * 6.5)
      var belly = (dx * dx) / (28 * 28) + ((y - 21) * (y - 21)) / (6 * 6)
      if (y <= 10 && dome <= 1) ch = (dx < -6 && dx > -11 && y > 3 && y < 8) ? "W" : (dome > 0.7 ? "V" : "B")
      else if (hull <= 1) {
        if (y === 16) ch = (x % 7 === 3) ? "Y" : "N"
        else if (y === 19 && Math.abs(dx) < 46) ch = (x % 6 === 0) ? LIGHTS[(Math.floor(x / 6) + frame) % 4] : "n"
        else if (y < 16) ch = (x % 11 === 0) ? "n" : "G"
        else ch = "n"
      } else if (y > 16 && belly <= 1) {
        if (Math.abs(dx) < 6 && y >= 23) ch = open ? "Y" : (y === 23 ? "n" : "N")
        else ch = (Math.abs(dx) < 7 && y >= 22) ? "n" : "N"
      }
      line += ch
    }
    rows.push(line)
  }
  return ol(rows)
}

// A swirling portal ring; the colours turn with the frame.
function portal(frame) {
  var N = 18, c = 8.5, rows = []
  var RING = ["p", "Q", "p", "W", "p", "Q", "v", "W"]
  for (var y = 0; y < N; y++) {
    var line = ""
    for (var x = 0; x < N; x++) {
      var dx = x - c, dy = (y - c) * 1.15, d = Math.sqrt(dx * dx + dy * dy), ch = "."
      var ang = Math.atan2(dy, dx) / (Math.PI * 2) + 0.5
      if (d < 9 && d >= 6.3) ch = RING[(Math.floor(ang * 8) + frame) % 8]
      else if (d < 6.3) ch = ((Math.floor(ang * 6 + d * 0.5) + frame) % 3 === 0 && d > 2) ? "v" : "z"
      line += ch
    }
    rows.push(line)
  }
  return ol({ colors: { p: "#b05cd8", v: "#7a3a9e", z: ["#14082a", 230] }, rows: rows })
}

var COMET = { q: ["#7df9ff", 150], z: ["#7df9ff", 70], w: ["#e8fbff", 210] }
var OCTO = { u: "#b05cd8", v: "#7a3a9e" }
var ANGLER = { x: "#2f4166", y: "#1d2944", Y: "#fff6c0" }

var ART = {
  s3_comet: ol([
    "..QWWQ..",
    ".QWWWWQ.",
    "QWWWKWKQ",
    "QWWWWWWQ",
    "QQWWKKWQ",
    ".QQWWWQ.",
    "..QQQQ.."
  ]),
  s3_cometSad: ol([
    "..QWWQ..",
    ".QWWWWQ.",
    "QWWWKWKQ",
    "QWWWWWWQ",
    "QQWWWWWQ",
    ".QQWKKQ.",
    "..QQQQ.."
  ]),
  s3_cometTail: { colors: COMET, rows: [
    "...........................zzq.",
    "................zzzzzzqqqqqqqww",
    ".......zzzzzzzzzqqqqqqqqqwwwwww",
    "zzzzzzzzqqqqqqqqqqwwwwwwwwwwwWW",
    ".......zzzzzzzzzqqqqqqqqqwwwwww",
    "................zzzzzzqqqqqqqww",
    "...........................zzq."
  ] },

  s3_rockStage: ol([
    "....MMMMMMMMMMMMMMMMM...",
    "..MMMmMMMMMMMMMMmMMMMMM.",
    ".MMMMMMMmMMMMMMMMMMMMMMM",
    "MMmMMMMMMMMMMmMMMMMMmMMM",
    ".MMMMmMMMMMMMMMMMMMMMMM.",
    "..mMMMMMMmMMMMMMMMmMMm..",
    "...mmmMMMMMMMMMMMmmm....",
    "......mmmmmmmmmmm......."
  ]),
  s3_drum0: ol([
    ".K...K...",
    "..KLK....",
    ".LLLLL...",
    ".LKLKL...",
    ".LLLLL.T.",
    "T.LLL.T..",
    ".TLLLL...",
    "RRRRRRR..",
    "RWRWRWR..",
    "RRRRRRR.."
  ]),
  s3_drum1: ol([
    ".K...K...",
    "..KLK....",
    ".LLLLL...",
    ".LKLKL...",
    ".LLLLL...",
    "..LLL....",
    "TLLLLLT..",
    "RTRRRTR..",
    "RWRWRWR..",
    "RRRRRRR.."
  ]),
  s3_horn0: ol({ colors: { L: "#5fb8ff" }, rows: [
    ".K...K.....",
    "..KLK......",
    ".LLLLL...Y.",
    ".LKLKL..YY.",
    ".LLLYYYYYY.",
    "..LLL...YY.",
    ".LLLLL...Y.",
    ".LLLLL.....",
    ".L...L....."
  ] }),
  s3_horn1: ol({ colors: { L: "#5fb8ff" }, rows: [
    ".K...K.....",
    "..KLK...Y..",
    ".LLLLL.YY..",
    ".LKLKYYYY..",
    ".LLLLL.YY..",
    "..LLL...Y..",
    ".LLLLL.....",
    ".LLLLL.....",
    ".L...L....."
  ] }),
  s3_guitar0: ol([
    ".K...K....",
    "..KPK.....",
    ".PPPPP....",
    ".PKPKP...T",
    ".PPPPP..T.",
    "..PPP..T..",
    ".CCPPPT...",
    "CCcCPP....",
    "CCCC......",
    ".P...P...."
  ]),
  s3_guitar1: ol([
    ".K...K....",
    "..KPK.....",
    ".PPPPP....",
    ".PKPKP....",
    ".PPPPP...T",
    "..PPP...T.",
    ".CCPPP.T..",
    "CCcCPPT...",
    "CCCC......",
    "P.....P..."
  ]),

  s3_octo0: ol({ colors: OCTO, rows: [
    ".......uuuuuuu.......",
    ".....uuuuuuuuuuu.....",
    "....uuuuvuuuuuuuu....",
    "...uuuWWuuuuuWWuuu...",
    "...uuuWKuuuuuWKuuu...",
    "...uuuuuuuuuuuuuuu...",
    "....uuuuuvvvuuuuu....",
    "..uuuuuuuuuuuuuuuuu..",
    ".uu..GGGGGGGGGGG..uu.",
    "uu..GGGGnGGGGGGGG..uu",
    "u..uuuuuuuuuuuuuuu..u",
    "u.GGGGGGGGGGnGGGGGG.u",
    "uuGGnGGGGGGGGGGGGnGuu",
    "..uuuuuuuuuuuuuuuuu..",
    "..GGGGGGnGGGGGGGGG...",
    "...nGGGGGGGGGGGGnn...",
    "...u.nnnnnnnnnnn.u...",
    "..u..u...u..u...u.u..",
    ".u...u..u....u..u..u.",
    "......u........u....."
  ] }),
  s3_octo1: ol({ colors: OCTO, rows: [
    ".......uuuuuuu.......",
    ".....uuuuuuuuuuu.....",
    "....uuuuvuuuuuuuu....",
    "...uuuKKuuuuuKKuuu...",
    "...uuuuuuuuuuuuuuu...",
    "...uuuuuuuuuuuuuuu...",
    "....uuuuuvvvuuuuu....",
    "..uuuuuuuuuuuuuuuuu..",
    "..uu.GGGGGGGGGGG.uu..",
    ".uu.GGGGnGGGGGGGG.uu.",
    ".u.uuuuuuuuuuuuuuu.u.",
    "u.GGGGGGGGGGnGGGGGG.u",
    "uuGGnGGGGGGGGGGGGnGuu",
    "..uuuuuuuuuuuuuuuuu..",
    "..GGGGGGnGGGGGGGGG...",
    "...nGGGGGGGGGGGGnn...",
    "...u.nnnnnnnnnnn.u...",
    "...u.u...u..u..u..u..",
    "..u...u..u...u..u.u..",
    "..u....u.......u....."
  ] }),
  s3_octoLove: ol({ colors: OCTO, rows: [
    ".......uuuuuuu.......",
    ".....uuuuuuuuuuu.....",
    "....uuuuvuuuuuuuu....",
    "...uuuKKuuuuuKKuuu...",
    "...uuuuuuuuuuuuuuu...",
    "...uuPPuuuuuuuPPuu...",
    "....uuuuuvvvuuuuu....",
    "..uuuuuuuuuuuuuuuuu..",
    "..uu.GGGGGGGGGGG.uu..",
    ".uu.GGGKGGGGGKGGG.uu.",
    ".u.uuuuuuuuuuuuuuu.u.",
    "u.GGPPGGGGGGnGGPPGG.u",
    "uuGGnGGKGGGGGKGGGnGuu",
    "..uuuuuuuKKKuuuuuuu..",
    "..GGGGGGnGGGGGGGGG...",
    "...nGGGGGGGGGGGGnn...",
    "...u.nnnnnnnnnnn.u...",
    "...u.u...u..u..u..u..",
    "..u...u..u...u..u.u..",
    "..u....u.......u....."
  ] }),

  s3_sail0: sail(0),
  s3_sail1: sail(1),
  s3_sail2: sail(2),

  s3_angler: ol({ colors: ANGLER, rows: [
    "....TTTTT.....................",
    "...T.....T....................",
    "...T......T........y..........",
    "...........xxxxxxxxyy.........",
    "........xxxxxxxxxxxxxyy.....yy",
    "......xxxxYYxxxxxxxxxxxy...yyy",
    ".....xxxxxYKxxxxxxxxxxxxyyyyy.",
    "....xxxxxxxxxxxxxxxxxxxxxyyy..",
    "...WxWxWxxxxxxxxxxxxxxxxxyyy..",
    "...xxxxxWxxxxxxxxxxxxxxxyyyyy.",
    "...xWxWxWxxxxxxxxxxxxxyy...yyy",
    "....xxxxxxxxxxxxxxxxxyy.....yy",
    ".....xxxxxxxxxxxxxxyy.........",
    "........xxxxxxxxxx............"
  ] }),
  s3_anglerOpen: ol({ colors: ANGLER, rows: [
    "....TTTTT.....................",
    "...T.....T....................",
    "...T......T........y..........",
    "...........xxxxxxxxyy.........",
    "........xxxxxxxxxxxxxyy.....yy",
    "......xxxxYYxxxxxxxxxxxy...yyy",
    "..WxWxxxxxYKxxxxxxxxxxxxyyyyy.",
    "...........xxxxxxxxxxxxxxyyy..",
    ".............xxxxxxxxxxxxyyy..",
    "...........xxxxxxxxxxxxxxyyyyy",
    "..WxWxxxxxxxxxxxxxxxxxyy...yyy",
    "....xxxxxxxxxxxxxxxxxyy.....yy",
    ".....xxxxxxxxxxxxxxyy.........",
    "........xxxxxxxxxx............"
  ] }),
  s3_lure: ol(["YWY", "WWW", "YWY"]),

  s3_mother0: mother(0, false),
  s3_mother1: mother(1, false),

  s3_bird0: ol([
    "..QQ......",
    "...QQ.....",
    "....QQ.WW.",
    ".QQQQQWWKY",
    "......QQ.."
  ]),
  s3_bird1: ol([
    "..........",
    "......WW..",
    ".QQQQQWWKY",
    "....QQ....",
    "...QQ.....",
    "..QQ......"
  ]),

  s3_portal0: portal(0),
  s3_portal1: portal(1),
  s3_portal2: portal(2),

  s3_firefly0: ol({ colors: { y: "#fff6c0", q: ["#9fe3ff", 170] }, rows: ["q.q", "qKq", ".Y.", ".y."] }),
  s3_firefly1: ol({ colors: { y: "#fff6c0", q: ["#9fe3ff", 170] }, rows: ["...", "qKq", "qYq", ".y."] })
}

// ------------------------------------------------------------------ helpers

function musician(id, frames, dx, phase) {
  return { id: id, frames: frames, fps: 3, px: 4, fade: [3, 3],
    path: [{ t: 0, x: dx, y: -58, on: "stage" }],
    wobble: [{ y: 3, speed: 6, phase: phase }, { from: 60, to: 70, y: 14, speed: 9, phase: phase }] }
}

// The octopus squeezes the rock (alternating sprites), then falls in love.
function squeeze(from, to, love) {
  var list = [[0, "s3_octo0"]]
  for (var t = from, k = 0; t < to; t += 0.5, k++) list.push([t, k % 2 ? "s3_octo0" : "s3_octo1"])
  list.push([to, love])
  return list
}

// Angler: from w0.93 to w0.05 over 64 s; the lure hangs in front of it.
var ANG_X0 = 0.93, ANG_X1 = 0.05, ANG_LEN = 64
function anglerX(t) { return ANG_X0 + (ANG_X1 - ANG_X0) * t / ANG_LEN }

var LURE_SPOTS = [[-26, -18], [24, -10], [-14, 20], [30, 18], [-40, 4], [6, -30]]
function smallFish(i) {
  var t0 = 6 + i * 4, side = i % 2 ? 1 : -1
  var spot = LURE_SPOTS[i]
  var sx = anglerX(t0) + side * (0.035 + 0.01 * (i % 3))
  var sy = 0.58 + 0.07 * ((i * 7) % 5)
  return { id: "fish" + i, sprite: "fish", facesLeft: true, px: 3, show: [t0, 50], fade: [1.5, 0],
    path: [
      { t: t0, x: "w" + sx.toFixed(4), y: "h" + sy.toFixed(3), flip: side < 0 },
      { t: t0 + 6, x: spot[0], y: spot[1], on: "lure", ease: "out", flip: false },
      { t: 44.3, x: spot[0], y: spot[1], on: "lure", flip: side > 0 },
      { t: 46.5, x: spot[0] * 14 + side * 160, y: spot[1] * 8 + side * 40, on: "lure", ease: "out" },
      { t: 49.5, x: spot[0] * 20 + side * 260, y: spot[1] * 12 + side * 60, on: "lure", o: 0 }
    ],
    wobble: { x: 6, xspeed: 1.3 + i * 0.2, y: 5, speed: 2 + i * 0.3, phase: i * 1.1, rot: 10 } }
}

function bird(i) {
  var k = Math.ceil(i / 2), side = i % 2 ? -1 : 1
  return { id: "bird" + i, frames: i % 2 ? ["s3_bird1", "s3_bird0"] : ["s3_bird0", "s3_bird1"], fps: 4, px: 4,
    fade: [3, 3], path: [{ t: 0, x: -62 * k, y: side * 38 * k, on: "bird0" }],
    wobble: { y: 4, speed: 2 + i * 0.2, phase: i } }
}

function birdTail(i) {
  return { at: "bird" + i, style: "exhaust", reach: 46, size: 0.7, count: 4, rate: 3, offset: [-22, 2],
    color: "#7df9ff", from: 2, to: 48 }
}

// Fireflies: scattered, then in a ring around the time, then gone.
var TIME_X = 0.5, TIME_Y = 0.24
function firefly(i) {
  var a = i / 12 * Math.PI * 2
  var rx = Math.cos(a) * 0.032, ry = Math.sin(a) * 0.085
  var sx = TIME_X + Math.cos(a * 3 + 1) * (0.06 + 0.03 * (i % 3)), sy = 0.5 + Math.sin(a * 2 + i) * 0.3
  var ex = TIME_X + Math.cos(a) * 0.12, ey = TIME_Y + Math.sin(a) * 0.3 + 0.1
  var hx = function(v) { return "w" + v.toFixed(4) }, hy = function(v) { return "h" + v.toFixed(3) }
  return { id: "fly" + i, frames: i % 2 ? ["s3_firefly1", "s3_firefly0"] : ["s3_firefly0", "s3_firefly1"], fps: 8,
    px: 4, fade: [2, 0], glow: { r: 18, color: "#fff27a", a: 0.3 },
    path: [
      { t: 0, x: hx(sx), y: hy(sy) },
      { t: 8 + (i % 4) * 0.6, x: hx(TIME_X + rx), y: hy(TIME_Y + ry), ease: "inOut", arc: 40 },
      { t: 30 + (i % 3) * 0.4, x: hx(TIME_X + rx), y: hy(TIME_Y + ry) },
      { t: 37, x: hx(ex), y: hy(ey), ease: "in", o: 0 }
    ],
    wobble: { x: 9, xspeed: 1.1 + (i % 5) * 0.23, y: 7, speed: 1.4 + (i % 4) * 0.3, phase: i * 0.9 } }
}

// ------------------------------------------------------------------ episodes

var EPISODES = [
  {
    id: "cometLostTail",
    title: "El cometa que perdió la cola",
    zone: "world",
    length: 60,
    actors: [
      { id: "tail", sprite: "s3_cometTail", px: 5, fade: [3, 3],
        path: [
          { t: 0, x: -95, y: 0, on: "head" },
          { t: 20, x: -95, y: 0, on: "head" },
          { t: 24, x: "w0.352", y: "h0.23", ease: "out" },
          { t: 33, x: "w0.355", y: "h0.22" },
          { t: 34, x: -95, y: 0, on: "head" }
        ],
        wobble: { from: 21, to: 33, y: 8, speed: 1.6, rot: 6 } },
      { id: "head", swap: [[0, "s3_comet"], [25.5, "s3_cometSad"], [33.5, "s3_comet"]], px: 5, fade: [3, 3],
        glow: { r: 44, color: "#7df9ff", a: 0.18 },
        path: [
          { t: 0, x: "w0.05", y: "h0.2" },
          { t: 20, x: "w0.37", y: "h0.2", ease: "linear" },
          { t: 26, x: "w0.46", y: "h0.21", ease: "out" },
          { t: 27.5, x: "w0.46", y: "h0.21", flip: true },
          { t: 33, x: "w0.3692", y: "h0.22", ease: "inOut", arc: 50 },
          { t: 34, x: "w0.3692", y: "h0.22", flip: false },
          { t: 60, x: "w0.94", y: "h0.17", ease: "in" }
        ],
        wobble: [{ y: 10, speed: 0.9 }, { from: 25.5, to: 27.5, x: 4, xspeed: 14 }] },
      { id: "oops", text: "!", color: "#ffd65a", size: 30, show: [25.5, 27.5], path: [{ t: 0, x: 0, y: -44, on: "head" }] },
      { id: "where", text: "?", color: "#7df9ff", size: 26, show: [28, 31.5], fade: [0.3, 0.3],
        path: [{ t: 0, x: 0, y: -44, on: "head" }] },
      { id: "love", text: "♥", color: "#ff8fa8", size: 30, show: [34, 38], fade: [0.3, 1],
        path: [{ t: 34, x: -40, y: -40, on: "head" }, { t: 38, x: -40, y: -90, on: "head" }] }
    ],
    particles: [
      { at: "tail", style: "twinkle", count: 10, rate: 1.5, offset: [-40, 0], trail: true, color: ["#7df9ff", "#e8fbff"] },
      { at: "head", style: "exhaust", reach: 30, size: 0.8, count: 5, rate: 3, offset: [-20, 0], color: "#7df9ff",
        from: 34, to: 58 },
      { at: "head", style: "sparks", count: 14, every: 30, dur: 1.4, from: 34, to: 36, radius: 70, color: ["#7df9ff", "#fff6c0"] }
    ]
  },

  {
    id: "asteroidBand",
    title: "Banda de música sobre un asteroide",
    zone: "world",
    length: 70,
    actors: [
      { id: "stage", sprite: "s3_rockStage", px: 7, fade: [3, 3],
        path: [{ t: 0, x: "w0.05", y: "h0.2" }, { t: 70, x: "w0.93", y: "h0.19", ease: "linear" }],
        wobble: { y: 14, speed: 0.5, rot: 3 } },
      musician("drummer", ["s3_drum0", "s3_drum1"], -54, 0),
      musician("horn", ["s3_horn0", "s3_horn1"], 2, 1.2),
      musician("guitar", ["s3_guitar0", "s3_guitar1"], 54, 2.4)
    ],
    particles: [
      { at: "horn", style: "rise", glyph: "♪", color: "#ffd65a", count: 3, rate: 0.6, offset: [20, -10], height: 70, from: 3, to: 68 },
      { at: "guitar", style: "rise", glyph: "♪", color: "#ff8fa8", count: 3, rate: 0.5, offset: [8, -20], height: 60, from: 5, to: 68,
        pulse: { every: 6, dur: 4 } },
      { at: "drummer", style: "sparks", count: 6, every: 1.5, dur: 0.5, radius: 14, offset: [0, 12], from: 4, to: 60,
        color: ["#fff6c0", "#ffd65a"], size: 0.6 },
      { at: "stage", style: "rise", glyph: "♪", color: ["#7df9ff", "#ffd65a", "#ff8fa8"], count: 10, rate: 1.2,
        offset: [0, -80], height: 160, from: 59, to: 68 }
    ],
    bursts: [
      { at: "stage", t: 60, duration: 2, count: 4, size: 50, colors: ["#ffd65a", "#ff8fa8", "#7df9ff"] },
      { at: "stage", t: 63, duration: 2, count: 4, size: 60, colors: ["#3fae6a", "#ffd65a", "#ffffff"] }
    ]
  },

  {
    id: "octopusHug",
    title: "Pulpo gigante abrazando una roca",
    zone: "world",
    length: 60,
    actors: [
      { id: "octo", swap: squeeze(12, 28, "s3_octoLove"), px: 6, fade: [3, 3],
        path: [{ t: 0, x: "w0.93", y: "h0.17" }, { t: 60, x: "w0.06", y: "h0.15", ease: "linear" }],
        wobble: [{ y: 26, speed: 0.45, rot: 7 }, { x: 4, xspeed: 3, from: 22, to: 28 }] },
      { id: "heart", text: "♥", color: "#ff8fa8", size: 44, show: [28, 36], fade: [0.4, 1.5],
        glow: { r: 40, color: "#ff8fa8", a: 0.2 },
        path: [{ t: 28, x: 0, y: -80, on: "octo", scale: 0.4 }, { t: 30, x: 0, y: -115, on: "octo", ease: "out", scale: 1 },
          { t: 36, x: 0, y: -165, on: "octo" }] }
    ],
    particles: [
      { at: "octo", style: "rise", glyph: "♥", color: ["#ff8fa8", "#e2524a"], count: 3, rate: 0.4, offset: [0, -60], height: 60,
        from: 4, to: 26 },
      { at: "octo", style: "rise", glyph: "♥", color: ["#ff8fa8", "#e2524a", "#b05cd8"], count: 8, rate: 1.2, offset: [0, -40],
        height: 120, from: 28, to: 56 },
      { at: "octo", style: "rise", count: 5, rate: 0.6, offset: [0, 20], height: 90, color: "#9fe3ff", size: 1.2 }
    ],
    bursts: [{ at: "octo", t: 28, duration: 1.6, count: 5, size: 40, colors: ["#ff8fa8", "#fff6c0"] }]
  },

  {
    id: "solarSail",
    title: "Velero solar",
    zone: "world",
    length: 70,
    actors: [
      { id: "ship", frames: ["s3_sail0", "s3_sail1", "s3_sail2"], fps: 2, px: 5, fade: [3, 3],
        glow: { r: 110, color: "#fff6c0", a: 0.08, dy: -10 },
        path: [
          { t: 0, x: "w0.04", y: "h0.2" },
          { t: 30, x: "w0.3", y: "h0.18", ease: "linear" },
          { t: 70, x: "w0.95", y: "h0.12", ease: "in" }
        ],
        wobble: { y: 12, speed: 0.5, rot: 4 } }
    ],
    particles: [
      { at: "ship", style: "twinkle", count: 8, rate: 1.4, offset: [20, -20], color: ["#fff6c0", "#7df9ff", "#ffffff"], size: 0.8 },
      { at: "ship", style: "streak", angle: 0, length: 520, count: 10, rate: 1.6, offset: [-560, -10], from: 27, to: 52,
        color: ["#fff6c0", "#ffd65a"], size: 1.2 },
      { at: "ship", style: "twinkle", count: 6, rate: 2, offset: [-60, 50], trail: true, from: 30, to: 66, color: "#ffd65a" }
    ],
    bursts: [{ at: "ship", t: 30, duration: 1.6, count: 4, size: 60, colors: ["#fff6c0", "#ffd65a"] }]
  },

  {
    id: "anglerFish",
    title: "Pez abisal con farol",
    zone: "world",
    length: 64,
    actors: [
      { id: "angler", swap: [[0, "s3_angler"], [44, "s3_anglerOpen"], [47, "s3_angler"]], facesLeft: true, px: 5, fade: [3, 3],
        path: [{ t: 0, x: "w0.93", y: "h0.83" }, { t: 64, x: "w0.05", y: "h0.85", ease: "linear" }],
        wobble: [{ y: 14, speed: 0.6, rot: 3 }, { from: 43.5, to: 46, x: 14, xspeed: 7 }] },
      { id: "lure", sprite: "s3_lure", px: 3, fade: [3, 3], glow: { r: 60, color: "#fff27a", a: 0.2 },
        path: [{ t: 0, x: -62, y: -12, on: "angler" }], wobble: { x: 3, xspeed: 1.7, y: 4, speed: 2.1 } },
      smallFish(0), smallFish(1), smallFish(2), smallFish(3), smallFish(4), smallFish(5),
      { id: "huh", text: "?", color: "#fff6c0", size: 28, show: [47, 52], fade: [0.3, 0.6],
        path: [{ t: 0, x: 10, y: -70, on: "angler" }] }
    ],
    particles: [
      { at: "lure", style: "twinkle", count: 5, rate: 1.2, offset: [0, 0], trail: true, color: "#fff27a" },
      { at: "angler", style: "rise", count: 4, rate: 0.5, offset: [-50, 10], height: 70, color: "#9fe3ff", from: 2, to: 62 }
    ],
    bursts: [{ at: "lure", t: 44.3, duration: 1, count: 3, size: 30, colors: ["#ffffff", "#fff27a"] }]
  },

  {
    id: "mothership",
    title: "Nave nodriza",
    zone: "world",
    length: 70,
    actors: [
      { id: "mother", frames: ["s3_mother0", "s3_mother1"], fps: 1.5, px: 9, show: [0, 68], fade: [5, 4],
        glow: { r: 260, color: "#7df9ff", a: 0.05, dy: 60 },
        path: [
          { t: 0, x: "w0.1", y: "h0.19" },
          { t: 30, x: "w0.497", y: "h0.21", ease: "out" },
          { t: 54, x: "w0.503", y: "h0.21", ease: "linear" },
          { t: 68, x: "w0.72", y: -160, ease: "in" }
        ],
        wobble: { y: 6, speed: 0.4, rot: 1 } },
      { id: "hatch", text: "", show: [32, 54], fade: [1, 1], glow: { r: 44, color: "#ffd65a", a: 0.25 },
        path: [{ t: 0, x: 0, y: 92, on: "mother" }] },
      { id: "ufo", frames: ["ufo0", "ufo1"], fps: 6, px: 3, show: [34, 53], fade: [1, 0.5],
        path: [
          { t: 34, x: 0, y: 92, on: "mother", scale: 0.4 },
          { t: 36, x: 0, y: 160, on: "mother", scale: 1 },
          { t: 40, x: "w0.497", y: "h0.47", ease: "inOut" },
          { t: 47, x: "w0.497", y: "h0.47" },
          { t: 51, x: 0, y: 140, on: "mother", ease: "in" },
          { t: 53, x: 0, y: 92, on: "mother", scale: 0.4, o: 0.2 }
        ],
        wobble: { from: 40, to: 47, x: 10, xspeed: 1.5, y: 5, speed: 2 } },
      { id: "spot", path: [{ t: 0, x: "w0.497", y: "h0.58" }] },
      { id: "wave", text: "♥", color: "#ff8fa8", size: 26, show: [43, 47.5], fade: [0.3, 0.5],
        path: [{ t: 0, x: 0, y: -40, on: "ufo" }] }
    ],
    beams: [{ src: "ufo", dst: "spot", show: [41, 46] }],
    particles: [
      { at: "mother", style: "twinkle", count: 8, rate: 1.4, offset: [0, 60], color: ["#ffd65a", "#e2524a", "#7df9ff"], size: 1.4 },
      { at: "mother", style: "exhaust", count: 10, rate: 2, offset: [-440, 30], reach: 120, size: 2.2, color: "#7df9ff",
        from: 54, to: 68 }
    ]
  },

  {
    id: "cometBirds",
    title: "Bandada de pájaros cometa",
    zone: "world",
    length: 50,
    actors: [
      { id: "bird0", frames: ["s3_bird0", "s3_bird1"], fps: 4, px: 4, fade: [3, 3],
        path: [
          { t: 0, x: "w0.04", y: "h0.26" },
          { t: 25, x: "w0.5", y: "h0.22", ease: "linear", arc: 40 },
          { t: 50, x: "w0.95", y: "h0.26", ease: "linear", arc: -30 }
        ],
        wobble: { y: 18, speed: 0.7 } },
      bird(1), bird(2), bird(3), bird(4), bird(5), bird(6),
      { id: "late", frames: ["s3_bird0", "s3_bird1"], fps: 8, px: 3, show: [5, 50], fade: [2, 3],
        path: [
          { t: 5, x: -700, y: 110, on: "bird0" },
          { t: 18, x: -330, y: 70, on: "bird0", ease: "linear" },
          { t: 26, x: -248, y: -152, on: "bird0", ease: "out", arc: 30 }
        ],
        wobble: [{ to: 26, y: 10, speed: 5 }, { from: 26, y: 4, speed: 2.2 }] },
      { id: "yay", text: "!", color: "#7df9ff", size: 24, show: [26, 28.5], fade: [0.2, 0.6],
        path: [{ t: 0, x: 0, y: -28, on: "late" }] }
    ],
    particles: [
      birdTail(0), birdTail(1), birdTail(2), birdTail(3), birdTail(4), birdTail(5), birdTail(6),
      { at: "late", style: "exhaust", reach: 26, size: 0.5, count: 4, rate: 4, offset: [-10, 2], color: "#7df9ff", from: 6, to: 48 },
      { at: "late", style: "sparks", count: 10, every: 30, dur: 1.2, radius: 40, from: 26, to: 28, color: ["#7df9ff", "#ffffff"] }
    ]
  },

  {
    id: "wormhole",
    title: "Agujero de gusano",
    zone: "world",
    length: 40,
    actors: [
      { id: "portalA", frames: ["s3_portal0", "s3_portal1", "s3_portal2"], fps: 6, px: 5, show: [1, 23], fade: [1, 1],
        glow: { r: 90, color: "#b05cd8", a: 0.22 }, spin: 40,
        path: [{ t: 1, x: "w0.24", y: "h0.28", scale: 0.1 }, { t: 3, x: "w0.24", y: "h0.28", scale: 1, ease: "out" },
          { t: 20, x: "w0.24", y: "h0.28" }, { t: 23, x: "w0.24", y: "h0.28", scale: 0.1, ease: "in" }] },
      { id: "portalB", frames: ["s3_portal2", "s3_portal1", "s3_portal0"], fps: 6, px: 5, show: [9, 32], fade: [1, 1],
        glow: { r: 90, color: "#7df9ff", a: 0.22 }, spin: -40,
        path: [{ t: 9, x: "w0.75", y: "h0.72", scale: 0.1 }, { t: 11, x: "w0.75", y: "h0.72", scale: 1, ease: "out" },
          { t: 28, x: "w0.75", y: "h0.72" }, { t: 32, x: "w0.75", y: "h0.72", scale: 0.1, ease: "in" }] },
      { id: "ship", sprite: "shuttle", facesLeft: true, px: 4, show: [2, 37], fade: [2, 3],
        path: [
          { t: 2, x: "w0.04", y: "h0.22", flip: true },
          { t: 12, x: "w0.235", y: "h0.28", ease: "linear" },
          { t: 13.5, x: "w0.24", y: "h0.28", scale: 0.15, o: 0, ease: "in" },
          { t: 13.6, x: "w0.75", y: "h0.72", scale: 0.15, o: 0 },
          { t: 16, x: "w0.75", y: "h0.72" },
          { t: 17.5, x: "w0.765", y: "h0.7", scale: 1, o: 1, ease: "out" },
          { t: 22, x: "w0.775", y: "h0.66", rot: 720, ease: "out" },
          { t: 37, x: "w0.96", y: "h0.62", ease: "in" }
        ],
        wobble: { from: 17.5, to: 26, y: 10, speed: 3, rot: 12 } },
      { id: "dizzy", text: "?", color: "#ffd65a", size: 26, show: [21, 26], fade: [0.3, 0.6],
        path: [{ t: 0, x: 0, y: -40, on: "ship" }] }
    ],
    particles: [
      { at: "portalA", style: "twinkle", count: 6, rate: 1.5, color: ["#b05cd8", "#7df9ff"], size: 1.2, from: 2, to: 21 },
      { at: "portalB", style: "twinkle", count: 6, rate: 1.5, color: ["#7df9ff", "#b05cd8"], size: 1.2, from: 10, to: 30 },
      { at: "portalA", style: "sparks", count: 14, every: 30, dur: 1.3, radius: 80, from: 13, to: 15, color: ["#b05cd8", "#ffffff"] },
      { at: "portalB", style: "sparks", count: 14, every: 30, dur: 1.3, radius: 80, from: 16.5, to: 18, color: ["#7df9ff", "#ffffff"] },
      { at: "ship", style: "twinkle", count: 6, rate: 2, offset: [0, -26], color: "#ffd65a", size: 1.2, from: 18, to: 26 },
      { at: "ship", style: "exhaust", count: 5, rate: 3, offset: [30, 2], reach: 30, from: 2, to: 13 },
      { at: "ship", style: "exhaust", count: 5, rate: 3, offset: [30, 2], reach: 30, from: 26, to: 36 }
    ]
  },

  {
    id: "firefliesTime",
    title: "Luciérnagas que forman la hora",
    zone: "world",
    length: 40,
    actors: [
      { id: "clock", text: "$time", color: "#fff6c0", size: 72, show: [9, 33], fade: [4, 4],
        glow: { r: 150, color: "#ffd65a", a: 0.1 },
        path: [{ t: 0, x: "w" + TIME_X, y: "h" + TIME_Y }], wobble: { y: 4, speed: 0.8 } },
      firefly(0), firefly(1), firefly(2), firefly(3), firefly(4), firefly(5),
      firefly(6), firefly(7), firefly(8), firefly(9), firefly(10), firefly(11)
    ],
    particles: [
      { region: { x: "w0.47", y: "h0.16", w: "w0.06", h: "h0.16" }, style: "twinkle", count: 12, rate: 1.4,
        color: ["#fff27a", "#fff6c0"], from: 9, to: 31 },
      { region: { x: "w0.4", y: "h0.1", w: "w0.2", h: "h0.7" }, style: "twinkle", count: 8, rate: 0.8,
        color: "#fff27a", from: 0, to: 10 }
    ]
  }
]

if (typeof module !== "undefined") module.exports = { ART: ART, EPISODES: EPISODES }
