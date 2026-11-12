.pragma library

// Fechas 2: fechas especiales, horas del día y reacciones al estado del equipo.
// See EPISODES.md for the format; ART names use this pack's own prefix (d2_).

var ART = {
  // ---------------------------------------------------------- Pascua
  d2_bunny: [
    "......KK.KK.",
    ".....KWKKWPK",
    ".....KWKKWPK",
    ".....KWKKWK.",
    "....KWWWWWK.",
    "...KWWWWKWWK",
    ".KKKWWWWWWPK",
    "KWWKWWWWWWK.",
    "KWWWWWWWWK..",
    ".KGWWWWWGK..",
    "..KGKKKGK...",
    "..KK...KK..."
  ],
  d2_bunnyHop: [
    "......KK.KK.",
    ".....KWKKWPK",
    ".....KWKKWPK",
    ".....KWKKWK.",
    "....KWWWWWK.",
    "...KWWWWKWWK",
    "KKKWWWWWWWPK",
    "KWWWWWWWWWK.",
    ".KGWWWWWWK..",
    "KGK.KGWWK...",
    "KK....KGK...",
    "......KK...."
  ],
  d2_rock: [
    "...KKKKKK....",
    ".KKMMMMMMKK..",
    "KMMMMMmMMMMK.",
    "KMmMMMMMMmMMK",
    ".KmmMMMmmmmK.",
    "..KKmmmmmKK..",
    "....KKKKK...."
  ],
  d2_eggA: [".KKK.", "KPPPK", "KWWWK", "KAAAK", "KYYYK", ".KKK."],
  d2_eggB: [".KKK.", "KLLLK", "KYWYK", "KLLLK", "KQQQK", ".KKK."],
  d2_eggC: [".KKK.", "KQQQK", "KPWPK", "KQQQK", "KPPPK", ".KKK."],
  d2_eggGold: {
    colors: { g: "#fff2a8", o: "#d9a420" },
    rows: [
      "..KKK..",
      ".KgYYK.",
      "KgYYYYK",
      "KYYRYYK",
      "KYRYRYK",
      "KYYYYoK",
      ".KYooK.",
      "..KKK.."
    ]
  },

  // ---------------------------------------------------------- Cueca
  d2_hanky: {
    colors: { w: "#ffffff", g: "#dfe6f5" },
    rows: ["KKKK..", "KwwwK.", "KwwgwK", ".KwgwK", "..KwwK", "...KK."]
  },
  d2_flagCL: {
    colors: { b: "#2a55c8", w: "#ffffff", r: "#d8343a" },
    rows: [
      "Kbbwwwwww",
      "Kbwbwwwww",
      "Kbbwwwwww",
      "Krrrrrrrr",
      "Krrrrrrrr",
      "Krrrrrrrr",
      "K........",
      "K........",
      "K........",
      "K........"
    ]
  },
  d2_guitar: [
    "........KK",
    ".......KTK",
    "......KTK.",
    "..KKKKTK..",
    ".KCCCKK...",
    "KCCKKCK...",
    "KCCKKCK...",
    "KcCCCK....",
    ".KKKK....."
  ],

  // ---------------------------------------------------------- Año Nuevo chino
  d2_dragonHead: [
    "..YY....YY....",
    "...YY..YY.....",
    "..KKKKKKKKK...",
    ".KRRRRRRRRRKK.",
    "KRRRRWWRRRRRRK",
    "KRRRRWKRRRRRRK",
    "KYRRRRRRRRRWWK",
    "KYYRRRRRRKKKKK",
    ".KYYRRRRRKWWK.",
    "..KKYYYYYYKK..",
    "....KK..KK...."
  ],
  d2_dragonBody: [
    "..YYYY..",
    ".KKKKKK.",
    "KRRRRRRK",
    "KRYRRYRK",
    "KRRRRRRK",
    "KYYYYYYK",
    ".KKKKKK.",
    "..KY.KY."
  ],
  d2_dragonBodyB: [
    "..YYYY..",
    ".KKKKKK.",
    "KYYYYYYK",
    "KYRYYRYK",
    "KYYYYYYK",
    "KRRRRRRK",
    ".KKKKKK.",
    "..KY.KY."
  ],
  d2_dragonTail: [
    "......KK",
    "YY..KKRK",
    "YYYKRRRK",
    ".YYRRRYK",
    "YYYKRRRK",
    "YY..KKRK",
    "......KK"
  ],
  d2_pearl: {
    colors: { p: "#fff6c0", q: "#ffb347" },
    rows: [".KKK.", "KpWpK", "KppqK", "KpqqK", ".KKK."]
  },
  d2_lantern: [
    "..KK..",
    ".KYYK.",
    "KRRRRK",
    "KRYRRK",
    "KRRRRK",
    ".KYYK.",
    "..Y...",
    "..Y..."
  ],

  // ---------------------------------------------------------- Navidad
  d2_tree: [
    ".......Y.......",
    "......KLK......",
    ".....KLLLK.....",
    "....KLLlLLK....",
    "....KlLLLlK....",
    "...KLLLLlLLK...",
    "..KLlLLLLLLLK..",
    "...KLLLlLLLK...",
    "..KLLLLLLlLLK..",
    ".KLLlLLLLLLLLK.",
    "..KLLLLlLLLLK..",
    ".KLLLLLLLLlLLK.",
    "KLlLLLLLLLLLLLK",
    "KLLLLlLLLLLlLLK",
    ".KKKKKKKKKKKKK.",
    "......KTK......",
    "......KTK......",
    ".....KKKKK....."
  ],
  d2_star: {
    colors: { y: "#fff6c0" },
    rows: ["...K...", "..KYK..", "KKYyYKK", "KYYyYYK", ".KYYYK.", "KYK.KYK", "KK...KK"]
  },

  // ---------------------------------------------------------- Fiesta
  d2_disco: [
    "...K...",
    "..KKK..",
    ".KWGWK.",
    "KGWQWGK",
    "KWPWYWK",
    "KGWAWGK",
    ".KWGWK.",
    "..KKK.."
  ],
  d2_boombox: [
    "..KKKKKK..",
    ".K......K.",
    "KKKKKKKKKK",
    "KnKKnnKKnK",
    "KKGKnnKGKK",
    "KKKKnnKKKK",
    "KnKKKKKKnK",
    "KKKKKKKKKK"
  ],

  // ---------------------------------------------------------- Búho
  d2_owlUp: [
    "..KK............",
    ".KTcK...........",
    ".KTccK..........",
    "..KTccK..KKKK...",
    "...KTcccKTTTTK..",
    "....KTTTTTYKTTK.",
    "...KTSSSTTTTTOOK",
    "..KTTSSSSTTTTK..",
    "..KK.KKKKKKK....",
    "......Y...Y....."
  ],
  d2_owlDown: [
    "................",
    "................",
    ".........KKKK...",
    "........KTTTTK..",
    "...KKKKKTTYKTTK.",
    "..KTTSSSTTTTTOOK",
    ".KTcccSSSTTTTK..",
    "KTcccKKSSTTTK...",
    "KTccK..KKKKK....",
    "KKK....Y...Y...."
  ],
  d2_owlPerch: {
    colors: { b: ["#9fe3ff", 90] },
    rows: [
      "...bbbbbbbb...",
      "..b........b..",
      ".b..K....K..b.",
      ".b.KTK..KTK.b.",
      ".b.KTTTTTTK.b.",
      ".bKYYYTTYYYKb.",
      ".bKYKYTTYKYKb.",
      ".bKYYYOOYYYKb.",
      "..KTTTOOTTTK..",
      ".KTcSSSSSScTK.",
      "KTTcSsSSsScTTK",
      "KTTcSSsSSScTTK",
      ".KTcSSSSSScTK.",
      "..KTcSSSScTK..",
      "...KKTTTTKK...",
      "....YY..YY...."
    ]
  },
  d2_owlBlink: {
    colors: { b: ["#9fe3ff", 90] },
    rows: [
      "...bbbbbbbb...",
      "..b........b..",
      ".b..K....K..b.",
      ".b.KTK..KTK.b.",
      ".b.KTTTTTTK.b.",
      ".bKTTTTTTTTKb.",
      ".bKKKKTTKKKKb.",
      ".bKTTTOOTTTKb.",
      "..KTTTOOTTTK..",
      ".KTcSSSSSScTK.",
      "KTTcSsSSsScTTK",
      "KTTcSSsSSScTTK",
      ".KTcSSSSSScTK.",
      "..KTcSSSScTK..",
      "...KKTTTTKK...",
      "....YY..YY...."
    ]
  },

  // ---------------------------------------------------------- Gallo
  d2_rooster: {
    colors: { b: ["#9fe3ff", 110] },
    rows: [
      "......RR.R..",
      ".....RRRRR..",
      "....bKKKKKb.",
      "...bKWWWKWKb",
      "...bKWWWWWYY",
      "...bKWWWWRKb",
      "..K.bKWWWRb.",
      ".KAK.KWWWWK.",
      "KAaLKWWWWWWK",
      "KaLAKWWWWGWK",
      ".KLaKWWGGWK.",
      "..KKWWWGWWK.",
      "....KKKKKK..",
      ".....Y...Y..",
      "....YY..YY.."
    ]
  },
  d2_roosterCrow: {
    colors: { b: ["#9fe3ff", 110] },
    rows: [
      ".....RR.R...",
      "....RRRRR...",
      "...bKKKKKb..",
      "..bKWWWKWKb.",
      "..bKWWWWWYYY",
      "..bKWWWWK...",
      "..K.bKWWWYYY",
      ".KAK.KWWWRb.",
      "KAaLKWWWWRWK",
      "KaLAKWWWWGWK",
      ".KLaKWWGGWK.",
      "..KKWWWGWWK.",
      "....KKKKKK..",
      ".....Y...Y..",
      "....YY..YY.."
    ]
  },
  d2_jetpack: ["KKK", "KnK", "KnK", "KOK"],

  // ---------------------------------------------------------- Cumpleaños
  d2_cake: {
    colors: { f: "#ffe0ec", p: "#ff8fa8", h: "#7a4a2a" },
    rows: [
      "..W..W..W..W..",
      "..A..R..Y..L..",
      "..A..R..Y..L..",
      ".KKKKKKKKKKKK.",
      "KffpffpffpffpK",
      "KpffpffpffpffK",
      "KhhhhhhhhhhhhK",
      "KffffffffffffK",
      "KhhhhhhhhhhhhK",
      "KhhhhhhhhhhhhK",
      ".KKKKKKKKKKKK."
    ]
  },
  d2_flame0: [".Y.Y.Y.Y.", "YOYOYOYOY"],
  d2_flame1: ["Y.Y.Y.Y..", "OYOYOYOY."],
  d2_balloonR: [".KKK.", "KRWRK", "KRRRK", "KRRRK", ".KRK.", "..K.."],
  d2_balloonA: [".KKK.", "KAWAK", "KAAAK", "KAAAK", ".KAK.", "..K.."],
  d2_balloonY: [".KKK.", "KYWYK", "KYYYK", "KYYYK", ".KYK.", "..K.."],
  d2_hat: [
    "...W...",
    "...K...",
    "..KAK..",
    "..KYK..",
    ".KAAAK.",
    ".KYYYK.",
    "KAAAAAK"
  ],

  // ---------------------------------------------------------- Omarchy
  d2_fireball: { colors: { y: "#fff6c0" }, rows: [".YY.", "YyyY", "YyyY", ".YY."] },
  d2_shell: { colors: { y: "#fff6c0" }, rows: [".y.", "yWy", ".Y.", ".O."] },

  // ---------------------------------------------------------- Atasco
  d2_car0: [
    "...KKKKKK...",
    ".KKMMMMMMKK.",
    "KMMMmMMMMMMK",
    "RMmmMMMMmMMY",
    "RMMMMMMmmMMY",
    "KMmMMMMMMMMK",
    ".KKmmmmmmKK.",
    "...KKKKKK..."
  ],
  d2_car1: [
    "..KKKKKKK..",
    ".KnnnnnnnK.",
    "KnnGnnnnnnK",
    "RnGGnnnnGnY",
    "KnnnnnGnnnK",
    ".KnnnnnnnK.",
    "..KKKKKKK.."
  ],
  d2_car2: [
    "..KKKKK..",
    ".KMMMMMK.",
    "RMMmMMMMY",
    "KMmmMMmMK",
    ".KMMMMMK.",
    "..KKKKK.."
  ],
  d2_copStop: {
    colors: { u: "#2a55c8", v: "#1a347c" },
    rows: [
      "...KKKKKK.......",
      "..KvvvYvvK......",
      ".KvvvvvvvvK.....",
      "..KWWWWWWK...KK.",
      "..KWDDDDWK..KWWK",
      "..KWDVDDWK..KWWK",
      "..KWWWWWWK...KuK",
      ".KuuuuuuuuK.KuK.",
      "KuuYuuuuuuuuuK..",
      "KuKuuuuuuuKKK...",
      "KuKuuuuuuuK.....",
      "KWKuuKKuuuK.....",
      ".K.KuuKKuuK.....",
      "...KuuK.KuuK....",
      "...KKKK.KKKK...."
    ]
  },
  d2_copGo: {
    colors: { u: "#2a55c8", v: "#1a347c" },
    rows: [
      "...KKKKKK.......",
      "..KvvvYvvK......",
      ".KvvvvvvvvK.....",
      "..KWWWWWWK......",
      "..KWDDDDWK......",
      "..KWDVDDWK......",
      "..KWWWWWWK......",
      ".KuuuuuuuuKKKK..",
      "KuuYuuuuuuuuuWKL",
      "KuKuuuuuuuKKKKLL",
      "KuKuuuuuuuK...KL",
      "KWKuuKKuuuK.....",
      ".K.KuuKKuuK.....",
      "...KuuK.KuuK....",
      "...KKKK.KKKK...."
    ]
  }
}

// ---------------------------------------------------------------- helpers

// A glyph (text) actor at a fixed point, or riding another actor.
function txt(id, glyph, color, size, show, x, y, on, extra) {
  var k = { t: 0, x: x, y: y }
  if (on) k.on = on
  var a = { id: id, text: glyph, color: color, size: size, show: show, fade: [0.3, 0.4], path: [k] }
  for (var key in extra || {}) a[key] = extra[key]
  return a
}

// Dancing in place: little hops around `home`, turning on every beat.
function dance(home, y, t0, t1, beat, amp, hop, startLeft) {
  var out = [{ t: t0, x: home, y: y, flip: !!startLeft }], i = 0
  for (var t = t0 + beat; t <= t1 + 1e-6; t += beat, i++) {
    var dir = (i % 2 === 0 ? 1 : -1) * (startLeft ? -1 : 1)
    out.push({ t: t, x: home + dir * amp * (i % 4 < 2 ? 1 : 0.4), y: y, arc: hop, ease: "linear", flip: dir > 0 })
  }
  return out
}

// ---------------------------------------------------------------- 78 Pascua

var ROCKS = [[2560, 360], [2880, 270], [3200, 330], [3520, 250], [3840, 320]]
var LAND = [0, 7, 12.5, 18, 23.5]

function rock(i) {
  return { id: "rock" + i, sprite: "d2_rock", px: 7, fade: [2.5, 3],
    path: [{ t: 0, x: ROCKS[i][0], y: ROCKS[i][1] }, { t: 40, x: ROCKS[i][0] + 70, y: ROCKS[i][1] - 10, ease: "linear" }],
    wobble: { y: 6, speed: 0.7 + i * 0.11, phase: i * 1.3 } }
}

function bunnyPath() {
  var out = [{ t: 0, x: 0, y: -58, on: "rock0" }]
  for (var i = 1; i < LAND.length; i++) {
    out.push({ t: LAND[i] - 1.4, x: 0, y: -58, on: "rock" + (i - 1) })
    out.push({ t: LAND[i], x: 0, y: -58, on: "rock" + i, arc: 140, ease: "linear" })
  }
  out.push({ t: 33, x: 0, y: -58, on: "rock4" })
  out.push({ t: 34.6, x: 260, y: -150, on: "rock4", arc: 80, ease: "linear" })
  out.push({ t: 36.2, x: 520, y: -120, on: "rock4", arc: 80, ease: "linear" })
  out.push({ t: 38, x: 800, y: -170, on: "rock4", arc: 80, ease: "linear" })
  return out
}

function bunnySwap() {
  var sw = [[0, "d2_bunny"]]
  for (var i = 1; i < LAND.length; i++) sw.push([LAND[i] - 1.4, "d2_bunnyHop"], [LAND[i], "d2_bunny"])
  sw.push([33, "d2_bunnyHop"])
  return sw
}

// The egg left behind on rock i when the bunny jumps off it.
function egg(i, art) {
  return { id: "egg" + i, sprite: art, px: 5, show: [LAND[i + 1] - 1.4, 40], fade: [0.3, 3],
    path: [{ t: 0, x: -20 + (i % 2) * 36, y: -38, on: "rock" + i }], wobble: { rot: 10, speed: 2 + i * 0.3 } }
}

// ---------------------------------------------------------------- 80 Cueca

// Two dancers on an ellipse around the fire, always facing each other.
function cuecaPath(phase, start, end) {
  var cx = 0, rx = 48, ry = 7, out = [{ t: 0, x: start[0], y: -26 }]
  out.push({ t: 3, x: cx + Math.cos(phase) * rx, y: -26 + Math.sin(phase) * ry, ease: "out" })
  var steps = 36, t0 = 3, t1 = 27
  for (var i = 1; i <= steps; i++) {
    var a = phase + i / steps * Math.PI * 3
    var xx = cx + Math.cos(a) * rx * (i % 12 < 6 ? 1 : 0.75)
    out.push({ t: t0 + (t1 - t0) * i / steps, x: Math.round(xx), y: Math.round(-26 + Math.sin(a) * ry),
      ease: "linear", arc: 4, flip: Math.cos(a) > 0 })
  }
  var left = start[0] < cx
  out.push({ t: 29, x: cx + (left ? -14 : 14), y: -26, flip: !left })
  out.push({ t: 31.5, x: cx + (left ? -14 : 14), y: -26, flip: left })
  out.push({ t: end, x: start[0], y: -26, flip: !left })
  return out
}

function hanky(id, on, phase) {
  return { id: id, sprite: "d2_hanky", px: 3, show: [2.5, 33], fade: [0.5, 0.5],
    path: [{ t: 0, x: 20, y: -26, on: on }],
    wobble: [{ x: 8, xspeed: 7, y: 6, speed: 5, rot: 30, phase: phase }] }
}

// ---------------------------------------------------------------- 81 Dragón

function dragonAt(t) {
  return { x: 900 + t * 112, y: 430 + Math.sin(t * 0.85) * 95 + Math.sin(t * 0.31) * 40 }
}

// The head's path, `delay` seconds late: every segment follows the head.
function dragonPath(delay) {
  var out = []
  for (var t = 0; t <= 50; t += 0.5) {
    var p = dragonAt(t - delay)
    out.push({ t: t, x: Math.round(p.x), y: Math.round(p.y), ease: "linear" })
  }
  return out
}

function dragonPart(i, n) {
  var art = i === 0 ? "d2_dragonHead" : i === n - 1 ? "d2_dragonTail" : (i % 2 ? "d2_dragonBody" : "d2_dragonBodyB")
  var a = { id: i === 0 ? "dhead" : "dseg" + i, sprite: art, px: 5, fade: [3, 3],
    path: dragonPath(i === 0 ? 0 : 0.12 + i * 0.26), wobble: { y: 5, speed: 6, phase: i * 0.9 } }
  if (i === n - 1) a.wobble = { y: 8, speed: 5, phase: i * 0.9, rot: 18 }
  return a
}

var DRAGON = []
for (var di = 0; di < 11; di++) DRAGON.push(dragonPart(di, 11))

// ---------------------------------------------------------------- 82 Árbol

function lights(x, y, w, h) {
  return { region: { x: x, y: y, w: w, h: h }, style: "twinkle", count: 7, rate: 1.2, from: 12.5, to: 37, size: 1.3,
    color: ["#ff5a5a", "#ffd65a", "#58c8ff", "#7dffb0", "#ff8fd8"] }
}

// ---------------------------------------------------------------- 89 Omarchy

// Seven shells along a big check mark; their bursts sweep left to right.
var CHECK = [[-200, -10], [-140, 50], [-80, 110], [-10, 40], [60, -30], [130, -100], [200, -170]]
var CX = 3240, CY = 330

function shellRiser(i) {
  var T = 3 + i * 1.1, p = CHECK[i]
  return { id: "riser" + i, sprite: "d2_shell", px: 4, show: [T - 1.6, T], glow: { r: 18, color: "#fff6c0", a: 0.3 },
    path: [{ t: T - 1.6, x: CX + p[0] * 0.6, y: "h0.95" }, { t: T, x: CX + p[0], y: CY + p[1], ease: "out" }] }
}

function shellPoint(i) {
  return { id: "pt" + i, path: [{ t: 0, x: CX + CHECK[i][0], y: CY + CHECK[i][1] }] }
}

function shellSparks(i) {
  var cols = [["#7dffb0", "#ffffff"], ["#7df9ff", "#ffffff"], ["#ffd65a", "#fff6c0"], ["#ff8fa8", "#ffffff"]]
  return { at: "pt" + i, style: "sparks", count: 8, every: 7.7, dur: 1.8, from: 3 + i * 1.1, to: 36, radius: 80,
    color: cols[i % cols.length], size: 2 }
}

// ---------------------------------------------------------------- 96 Atasco

var LANE1 = 300, LANE2 = 440, COP = 3250

// Lane 1 goes right, waiting left of the policeman until he waves it on.
function car1(i) {
  var art = ["d2_car0", "d2_car2", "d2_car1"][i % 3], x0 = COP - 100 - i * 80, go = 13 + i * 0.45
  return { id: "a" + i, sprite: art, px: 5, show: [0, go + 6], fade: [2.5, 1.5],
    path: [
      { t: 0, x: x0 - 70, y: LANE1 },
      { t: 4, x: x0 - 20, y: LANE1, ease: "out" },
      { t: 6, x: x0 - 20, y: LANE1 },
      { t: 8, x: x0, y: LANE1 },
      { t: go, x: x0, y: LANE1 },
      { t: go + 6, x: x0 + 1500, y: LANE1 - 20, ease: "in" }
    ],
    wobble: [{ from: 0, to: go, x: 1.5, xspeed: 14 + i, y: 2, speed: 3 + i * 0.4, phase: i }] }
}

// Lane 2 goes left and waits on the right.
function car2(j) {
  var art = ["d2_car1", "d2_car0", "d2_car2", "d2_car0"][j], x0 = COP + 100 + j * 82, go = 25 + j * 0.45
  return { id: "b" + j, sprite: art, px: 5, show: [0, go + 6], fade: [2.5, 1.5],
    path: [
      { t: 0, x: x0 + 60, y: LANE2, flip: true },
      { t: 5, x: x0, y: LANE2, ease: "out" },
      { t: go, x: x0, y: LANE2 },
      { t: go + 6, x: x0 - 1500, y: LANE2 + 10, ease: "in" }
    ],
    wobble: [{ from: 0, to: go, x: 1.5, xspeed: 12 + j, y: 2, speed: 2.6 + j * 0.5, phase: j * 2 }] }
}

var EPISODES = [
  // 78
  {
    id: "easterBunny",
    title: "Pascua: el conejo salta entre rocas",
    zone: "world",
    length: 40,
    when: { months: [4] },
    weight: 2,
    actors: [rock(0), rock(1), rock(2), rock(3), rock(4),
      { id: "bunny", swap: bunnySwap(), px: 6, fade: [2.5, 2], path: bunnyPath() },
      egg(0, "d2_eggA"), egg(1, "d2_eggB"), egg(2, "d2_eggC"), egg(3, "d2_eggA"),
      { id: "gold", sprite: "d2_eggGold", px: 7, show: [27, 40], fade: [0.6, 3], glow: { r: 46, color: "#ffd65a", a: 0.22 },
        path: [{ t: 27, x: 30, y: -50, on: "rock4" }, { t: 29, x: 30, y: -84, on: "rock4", ease: "out" },
          { t: 32.4, x: 30, y: -84, on: "rock4" }, { t: 33, x: 10, y: -30, on: "bunny" }],
        wobble: { from: 29, to: 32.4, y: 4, speed: 2.4, rot: 8 } },
      txt("wow", "!", "#ffd65a", 26, [26.6, 29], -10, -110, "rock4")
    ],
    bursts: [{ at: "gold", t: 29, duration: 1.8, count: 4, size: 40, colors: ["#ffd65a", "#fff6c0", "#ff8fa8", "#7dffb0"] }],
    particles: [
      { at: "gold", from: 29, to: 39, style: "twinkle", count: 6, rate: 1.4, offset: [0, -6], color: ["#fff6c0", "#ffd65a"], size: 1.2 },
      { at: "bunny", from: 29.5, to: 34, style: "rise", glyph: "♥", color: "#ff8fa8", count: 3, rate: 0.7, height: 50 }
    ]
  },

  // 80
  {
    id: "cueca",
    title: "Cueca de astronautas",
    zone: "island",
    length: 36,
    when: { dates: ["09-18", "09-19"] },
    weight: 6,
    island: { scene: "idle", hide: { astronaut: [0, 34] } },
    actors: [
      { id: "flag", sprite: "d2_flagCL", px: 3, fade: [1, 2], path: [{ t: 0, x: -166, y: -14 }],
        wobble: { rot: 4, speed: 2 } },
      { id: "guitar", sprite: "d2_guitar", px: 3, fade: [1, 2], path: [{ t: 0, x: 158, y: -12 }],
        wobble: { from: 3, to: 31, rot: 6, y: 1, speed: 9 } },
      { id: "dama", sprite: "astronaut", show: [0, 34], path: cuecaPath(0, [-18, -26], 34),
        wobble: { from: 3, to: 27, y: 2, speed: 14 } },
      { id: "huaso", sprite: "astronaut", show: [0, 33.5], fade: [0.8, 0.8],
        path: cuecaPath(Math.PI, [116, -26], 33.5), wobble: { from: 3, to: 27, y: 2, speed: 14, phase: 1.5 } },
      hanky("hk1", "dama", 0), hanky("hk2", "huaso", 2)
    ],
    particles: [
      { at: "guitar", from: 2, to: 31, style: "rise", glyph: "♪", color: ["#ffd65a", "#ffffff"], count: 4, rate: 0.6, height: 70,
        offset: [0, -14] },
      { region: { x: -40, y: -110, w: 80, h: 20 }, from: 29, to: 33, style: "rise", glyph: "♥", color: ["#e2524a", "#ffffff", "#3d6fd8"],
        count: 5, rate: 0.6, height: 50 }
    ],
    bursts: [{ at: "flag", t: 28.8, duration: 1.4, count: 3, size: 30, colors: ["#e2524a", "#ffffff", "#3d6fd8"] }]
  },

  // 81
  {
    id: "paperDragon",
    title: "Año Nuevo chino: dragón de papel",
    zone: "world",
    length: 50,
    when: { months: [1, 2] },
    weight: 2,
    actors: [
      { id: "pearl", sprite: "d2_pearl", px: 4, fade: [3, 3], glow: { r: 34, color: "#ffd65a", a: 0.25 },
        path: dragonPath(-0.9), wobble: { y: 12, x: 8, speed: 2.2 } },
      { id: "lant1", sprite: "d2_lantern", px: 6, fade: [3, 3], path: [{ t: 0, x: 1900, y: 220 }, { t: 50, x: 2050, y: 200, ease: "linear" }],
        wobble: { rot: 8, y: 8, speed: 1.1 }, glow: { r: 30, color: "#ff9447", a: 0.18 } },
      { id: "lant2", sprite: "d2_lantern", px: 6, fade: [3, 3], path: [{ t: 0, x: 4300, y: 260 }, { t: 50, x: 4450, y: 240, ease: "linear" }],
        wobble: { rot: 8, y: 8, speed: 1.3, phase: 2 }, glow: { r: 30, color: "#ff9447", a: 0.18 } }
    ].concat(DRAGON),
    particles: [
      { at: "dhead", style: "twinkle", count: 10, rate: 0.8, trail: true, offset: [-30, 0], color: ["#ffd65a", "#ff9447", "#fff6c0"], size: 1.2 },
      { at: "dhead", from: 20, to: 24, style: "exhaust", forward: true, reach: 70, count: 8, rate: 3, offset: [34, 10],
        color: "#ff6a3a", size: 1.6 },
      { at: "pearl", from: 24, to: 47, style: "sparks", every: 3.2, dur: 1.2, count: 12, radius: 60, size: 1.2,
        color: ["#e2524a", "#ffd65a", "#fff6c0"] }
    ]
  },

  // 82
  {
    id: "stationTree",
    title: "Árbol de Navidad en la estación",
    zone: "station",
    length: 40,
    when: { months: [12] },
    weight: 3,
    effects: { lights: [12.5, 37, "party"] },
    actors: [
      { id: "tree", sprite: "d2_tree", px: 5, fade: [2, 3], path: [{ t: 0, x: 240, y: -77 }] },
      { id: "hatch", path: [{ t: 0, x: 318, y: 0 }] },
      { id: "astro", sprite: "astronaut", px: 3, show: [2.5, 36], fade: [0.6, 0.8],
        path: [
          { t: 2.5, x: 318, y: 0 },
          { t: 4, x: 350, y: -20, ease: "out" },
          { t: 10, x: 258, y: -150, arc: 60 },
          { t: 11.5, x: 258, y: -150 },
          { t: 16, x: 360, y: -110, ease: "inOut" },
          { t: 31, x: 360, y: -110 },
          { t: 36, x: 318, y: 0, ease: "inOut" }
        ],
        wobble: [{ from: 4, to: 31, y: 6, x: 4, speed: 1.2, rot: 10 }] },
      { id: "star", sprite: "d2_star", px: 4, show: [2.5, 40], fade: [0.6, 3],
        path: [
          { t: 2.5, x: -16, y: 4, on: "astro" },
          { t: 10.8, x: -16, y: 4, on: "astro" },
          { t: 11.5, x: 240, y: -128, ease: "out" }
        ] },
      txt("yay", "♥", "#ff8fa8", 20, [13, 16], 360, -150)
    ],
    ropes: [{ a: "hatch", b: "astro", sag: 40, color: "#d8e6ff", show: [2.5, 36] }],
    particles: [
      lights(226, -112, 28, 20), lights(214, -92, 52, 24), lights(204, -68, 72, 24),
      { at: "star", from: 11.5, to: 38, style: "twinkle", count: 6, rate: 1.2, color: ["#fff6c0", "#ffd65a"], size: 1.6 },
      { at: "star", from: 11.4, to: 12.6, style: "sparks", every: 30, dur: 1.2, count: 12, radius: 50, color: ["#ffd65a", "#fff6c0"] },
      { region: { x: 150, y: -260, w: 220, h: 40 }, from: 13, to: 37, style: "fall", count: 10, rate: 0.25, height: 300, size: 1.2,
        color: "#eef0f7" }
    ]
  },

  // 83
  {
    id: "meteorShowers",
    title: "Perseidas y Gemínidas",
    zone: "world",
    length: 45,
    when: { night: true, dates: ["08-11", "08-12", "08-13", "12-13", "12-14", "12-15"] },
    weight: 8,
    actors: [
      { id: "fireball", sprite: "d2_fireball", px: 7, show: [24, 28.4], fade: [0.4, 0.4],
        glow: { r: 60, color: "#ffb347", a: 0.35 },
        path: [{ t: 24, x: 3700, y: 60 }, { t: 28.4, x: 2500, y: 640, ease: "linear" }] },
      { id: "boom", path: [{ t: 0, x: 2500, y: 640 }] }
    ],
    particles: [
      { region: { x: 0, y: 0, w: "w0.36", h: "h0.45" }, style: "streak", angle: 150, length: 420, count: 12, rate: 0.9,
        color: ["#e8fbff", "#9fe3ff", "#fff6c0"], size: 1.1 },
      { region: { x: "w0.32", y: 0, w: "w0.36", h: "h0.4" }, style: "streak", angle: 100, length: 360, count: 10, rate: 0.9,
        color: ["#e8fbff", "#c8d8ff", "#fff6c0"], size: 1 },
      { region: { x: "w0.64", y: 0, w: "w0.36", h: "h0.45" }, style: "streak", angle: 30, length: 420, count: 12, rate: 0.9,
        color: ["#e8fbff", "#9fe3ff", "#fff6c0"], size: 1.1 },
      { at: "fireball", from: 24, to: 28.4, style: "smoke", count: 12, rate: 3, trail: true, drift: [10, -10], size: 0.8,
        color: ["#ff9447", "#ffd65a"] },
      { at: "boom", from: 28.3, to: 30, style: "sparks", every: 10, dur: 1.6, count: 16, radius: 90, size: 1.5,
        color: ["#fff6c0", "#ffb347", "#ff9447"] }
    ]
  },

  // 85
  {
    id: "fridayParty",
    title: "Viernes en la tarde: fiesta en la isla",
    zone: "island",
    length: 40,
    when: { weekdays: [5], hours: [17, 23] },
    weight: 4,
    island: { scene: "wave", hide: { dog: [2, 37.5], cat: [2, 37.5] } },
    actors: [
      { id: "hook", path: [{ t: 0, x: 0, y: -134 }] },
      { id: "ball", sprite: "d2_disco", px: 5, spin: 120, glow: { r: 40, color: "#ff8fd8", a: 0.16 },
        path: [{ t: 0, x: 0, y: -150 }, { t: 2.5, x: 0, y: -104, ease: "out" }, { t: 37, x: 0, y: -104 }, { t: 40, x: 0, y: -150, ease: "in" }],
        wobble: { from: 2.5, to: 37, x: 3, speed: 1.5 } },
      { id: "box", sprite: "d2_boombox", px: 3, fade: [1, 1.5], path: [{ t: 0, x: 160, y: -12 }],
        wobble: { from: 2, to: 37, y: 1.5, speed: 16, ramp: 0.1 } },
      { id: "dog", sprite: "dog", show: [2, 37.5],
        path: dance(-78, -16, 2, 26, 0.6, 10, 10, false).concat([
          { t: 28.4, x: -60, y: -16, flip: false },
          { t: 29.4, x: -60, y: -16, arc: 70, ease: "linear" },
          { t: 31, x: -60, y: -16 },
          { t: 37.5, x: -78, y: -16, ease: "inOut" }
        ]) },
      { id: "cat", sprite: "catSit", show: [2, 37.5],
        path: dance(66, -16, 2.3, 26.3, 0.6, 8, 12, true).concat([
          { t: 28.4, x: 80, y: -16, flip: true },
          { t: 29.4, x: 80, y: -16, arc: 70, ease: "linear" },
          { t: 31, x: 80, y: -16 },
          { t: 37.5, x: 66, y: -16, ease: "inOut", flip: false }
        ]) }
    ],
    ropes: [{ a: "hook", b: "ball", sag: 0, color: "#a3a9c2", bOffset: [0, -14] }],
    bursts: [{ at: "ball", t: 29.2, duration: 2, count: 4, size: 60, colors: ["#ff8fd8", "#7df9ff", "#ffd65a", "#7dffb0"] }],
    particles: [
      { at: "box", from: 2, to: 37, style: "rise", glyph: "♪", color: ["#ffd65a", "#7df9ff", "#ff8fd8"], count: 5, rate: 0.7, height: 80,
        offset: [0, -14] },
      { at: "ball", from: 3, to: 37, style: "sparks", every: 1.2, dur: 1, count: 14, radius: 110, size: 1,
        color: ["#ff8fd8", "#7df9ff", "#ffd65a", "#7dffb0"] },
      { region: { x: -150, y: -125, w: 300, h: 110 }, from: 3, to: 37, style: "twinkle", count: 12, rate: 1.8, size: 1.3,
        color: ["#ff8fd8", "#7df9ff", "#ffd65a", "#7dffb0"] },
      { region: { x: -160, y: -170, w: 320, h: 20 }, from: 29.2, to: 34, style: "fall", count: 14, rate: 0.6, height: 160, size: 1.1,
        color: ["#ff8fd8", "#7df9ff", "#ffd65a", "#7dffb0"] }
    ]
  },

  // 86
  {
    id: "midnightOwl",
    title: "Medianoche: el búho espacial",
    zone: "world",
    length: 34,
    when: { hours: [23.5, 0.5] },
    weight: 3,
    actors: [
      { id: "owl", swap: [[0, ""], [11, "d2_owlPerch"], [14, "d2_owlBlink"], [14.25, "d2_owlPerch"], [19, "d2_owlBlink"],
                          [19.25, "d2_owlPerch"], [23, ""]],
        px: 5, fade: [2.5, 2.5], glow: { r: 50, color: "#fff6c0", a: 0.08 },
        path: [
          { t: 0, x: 1900, y: 220 },
          { t: 11, x: 3240, y: 452, ease: "out", arc: 60 },
          { t: 23, x: 3240, y: 452 },
          { t: 34, x: 4700, y: 180, ease: "in" }
        ],
        wobble: [{ from: 0, to: 11, y: 18, speed: 3.2 }, { from: 11.5, to: 22.5, rot: 4, speed: 1.4, ramp: 0.3 }, { from: 23, to: 34, y: 18, speed: 3.2 }] },
      { id: "wings", frames: ["d2_owlUp", "d2_owlDown"], fps: 3, px: 5, show: [0, 11], fade: [2.5, 0],
        path: [{ t: 0, x: 0, y: 0, on: "owl" }] },
      { id: "wings2", frames: ["d2_owlDown", "d2_owlUp"], fps: 3, px: 5, show: [23, 34], fade: [0, 2.5],
        path: [{ t: 0, x: 0, y: 0, on: "owl" }] },
      txt("q", "?", "#fff6c0", 22, [12, 13.6], 40, -56, "owl")
    ],
    particles: [
      { at: "owl", from: 15, to: 22, style: "rise", glyph: "♪", color: ["#fff6c0", "#c8d8ff"], count: 4, rate: 0.7, height: 70,
        offset: [0, -20], pulse: { every: 3.5, dur: 1.4 } },
      { at: "owl", from: 0, to: 11, style: "twinkle", count: 6, rate: 1.4, trail: true, color: "#c8d8ff", offset: [-10, 0] },
      { at: "owl", from: 23, to: 34, style: "twinkle", count: 6, rate: 1.4, trail: true, color: "#c8d8ff", offset: [-10, 0] }
    ]
  },

  // 87
  {
    id: "spaceRooster",
    title: "Amanecer: canta el gallo espacial",
    zone: "island",
    length: 32,
    when: { hours: [6, 8] },
    weight: 4,
    island: { scene: "sleep" },
    actors: [
      { id: "rooster",
        swap: [[0, "d2_rooster"], [9.5, "d2_roosterCrow"], [11.5, "d2_rooster"], [15, "d2_roosterCrow"], [18, "d2_rooster"]],
        px: 4,
        path: [
          { t: 0, x: 520, y: -300, flip: true },
          { t: 6, x: 2, y: -164, ease: "out", arc: 30 },
          { t: 25, x: 2, y: -164 },
          { t: 31.5, x: -560, y: -320, ease: "in", arc: -20 }
        ],
        wobble: [{ from: 0, to: 6, y: 10, speed: 5 }, { from: 6.5, to: 9, y: 2, speed: 12 }, { from: 9.5, to: 11.5, rot: 10, speed: 20, x: 2 },
                 { from: 15, to: 18, rot: 12, speed: 22, x: 3 }, { from: 25, to: 31.5, y: 10, speed: 5 }] },
      { id: "pack", sprite: "d2_jetpack", px: 3, show: [0, 31.5], path: [{ t: 0, x: -20, y: 4, on: "rooster" }] },
      { id: "beak", path: [{ t: 0, x: 28, y: -18, on: "rooster" }] },
      txt("dogUp", "!", "#ffd65a", 22, [16, 19], -78, -56),
      txt("astroUp", "!", "#ffd65a", 22, [16.4, 19.4], 32, -44),
      txt("catUp", "!", "#ffd65a", 22, [16.8, 19.8], 66, -50)
    ],
    particles: [
      { at: "pack", from: 0, to: 6.2, style: "exhaust", count: 6, rate: 3, offset: [-4, 8], size: 0.8 },
      { at: "pack", from: 25, to: 31.5, style: "exhaust", count: 6, rate: 3, offset: [-4, 8], size: 0.8 },
      { at: "beak", from: 9.5, to: 11.5, style: "rise", glyph: "♪", color: ["#ffd65a", "#ff9447"], count: 4, rate: 1.2, height: 60 },
      { at: "beak", from: 15, to: 18, style: "rise", glyph: "♪", color: ["#ffd65a", "#ff9447", "#fff6c0"], count: 6, rate: 1.4, height: 90,
        size: 1.5 },
      { at: "beak", from: 15, to: 18, style: "sparks", every: 1, dur: 0.9, count: 14, radius: 120, size: 1, color: ["#fff6c0", "#ffd65a"] },
      { region: { x: -190, y: -260, w: 380, h: 40 }, from: 18, to: 30, style: "twinkle", count: 8, rate: 0.6, color: ["#ffd65a", "#ff9447"],
        size: 1.2 }
    ]
  },

  // 88
  {
    id: "birthday",
    title: "Tu cumpleaños",
    zone: "island",
    length: 40,
    when: { special: "birthday" },
    weight: 10,
    island: { scene: "wave" },
    actors: [
      { id: "cake", sprite: "d2_cake", px: 3, fade: [1.5, 2.5],
        path: [{ t: 0, x: 108, y: -320 }, { t: 7, x: 108, y: -16, ease: "out" }],
        wobble: { from: 0, to: 7, x: 6, speed: 1.4 } },
      { id: "flame", frames: ["d2_flame0", "d2_flame1"], fps: 6, px: 3, show: [8, 18],
        glow: { r: 30, color: "#ffd65a", a: 0.25 }, path: [{ t: 0, x: 0, y: -19, on: "cake" }] },
      { id: "wick", path: [{ t: 0, x: 0, y: -22, on: "cake" }] },
      { id: "balR", sprite: "d2_balloonR", px: 5, show: [0, 34], fade: [1.5, 2],
        path: [{ t: 0, x: -34, y: -90, on: "cake" }, { t: 21, x: -34, y: -90, on: "cake" }, { t: 34, x: -200, y: -700, ease: "in" }],
        wobble: { x: 5, y: 4, speed: 1.3, rot: 8 } },
      { id: "balA", sprite: "d2_balloonA", px: 5, show: [0, 34], fade: [1.5, 2],
        path: [{ t: 0, x: 0, y: -110, on: "cake" }, { t: 21.3, x: 0, y: -110, on: "cake" }, { t: 34, x: 120, y: -760, ease: "in" }],
        wobble: { x: 5, y: 4, speed: 1.1, phase: 1, rot: 8 } },
      { id: "balY", sprite: "d2_balloonY", px: 5, show: [0, 34], fade: [1.5, 2],
        path: [{ t: 0, x: 34, y: -88, on: "cake" }, { t: 21.6, x: 34, y: -88, on: "cake" }, { t: 34, x: 300, y: -680, ease: "in" }],
        wobble: { x: 5, y: 4, speed: 1.5, phase: 2, rot: 8 } },
      { id: "hatA", sprite: "d2_hat", px: 3, show: [8, 38], fade: [0.8, 2], path: [{ t: 8, x: -18, y: -150 }, { t: 9.5, x: -16, y: -66, ease: "in" }] },
      { id: "hatD", sprite: "d2_hat", px: 3, show: [8.6, 38], fade: [0.8, 2], path: [{ t: 8.6, x: -60, y: -150 }, { t: 10.1, x: -62, y: -46, ease: "in" }] },
      { id: "hatC", sprite: "d2_hat", px: 3, show: [9.2, 38], fade: [0.8, 2], path: [{ t: 9.2, x: 66, y: -150 }, { t: 10.7, x: 66, y: -46, ease: "in" }] }
    ],
    ropes: [
      { a: "cake", b: "balR", sag: 6, color: "#d8e6ff", aOffset: [-14, -8], bOffset: [0, 15], show: [0, 21] },
      { a: "cake", b: "balA", sag: 6, color: "#d8e6ff", aOffset: [0, -8], bOffset: [0, 15], show: [0, 21.3] },
      { a: "cake", b: "balY", sag: 6, color: "#d8e6ff", aOffset: [14, -8], bOffset: [0, 15], show: [0, 21.6] }
    ],
    bursts: [{ at: "cake", t: 18.3, duration: 2, count: 4, size: 50, colors: ["#ff8fa8", "#ffd65a", "#7df9ff", "#7dffb0"] }],
    particles: [
      { at: "wick", from: 18, to: 21, style: "smoke", count: 6, rate: 1.5, drift: [10, -50], size: 0.4, color: "#c9cbe0" },
      { region: { x: -190, y: -250, w: 380, h: 30 }, from: 18.3, to: 30, style: "fall", count: 24, rate: 0.35, height: 260, size: 1.3,
        color: ["#ff8fa8", "#ffd65a", "#7df9ff", "#7dffb0", "#ff9447"] },
      { at: "cake", from: 19, to: 36, style: "rise", glyph: "♥", color: "#ff8fa8", count: 4, rate: 0.5, height: 70, offset: [-60, -30] },
      { at: "cake", from: 9, to: 36, style: "rise", glyph: "♪", color: "#ffd65a", count: 3, rate: 0.4, height: 70, offset: [-150, -40] }
    ]
  },

  // 89
  {
    id: "omarchyAnniversary",
    title: "Aniversario de Omarchy",
    zone: "world",
    length: 40,
    when: { special: "omarchy" },
    weight: 10,
    actors: CHECK.map(function(p, i) { return shellRiser(i) }).concat(CHECK.map(function(p, i) { return shellPoint(i) }), [
      { id: "check", text: "✓", color: "#8ff0a4", size: 240, show: [12.5, 37], fade: [2, 3],
        glow: { r: 200, color: "#7dffb0", a: 0.1 },
        path: [{ t: 12.5, x: CX + 10, y: CY - 10, scale: 0.6 }, { t: 15, x: CX + 10, y: CY - 30, ease: "out", scale: 1 }],
        wobble: { from: 15, to: 37, y: 6, speed: 1.1 } }
    ]),
    bursts: CHECK.map(function(p, i) {
      return { at: "pt" + i, t: 3 + i * 1.1, duration: 1.2, count: 1, size: 50, colors: ["#fff6c0"] }
    }).concat(CHECK.map(function(p, i) {
      return { at: "pt" + i, t: 33 + i * 0.12, duration: 1.6, count: 2, size: 60, colors: ["#7dffb0", "#fff6c0", "#7df9ff"] }
    })),
    particles: CHECK.map(function(p, i) { return shellSparks(i) }).concat([
      { region: { x: CX - 400, y: CY - 300, w: 800, h: 500 }, from: 14, to: 37, style: "twinkle", count: 8, rate: 1, size: 1.4,
        color: ["#7dffb0", "#fff6c0", "#7df9ff"] }
    ])
  },

  // 96
  {
    id: "ramJam",
    title: "RAM alta: atasco de asteroides",
    zone: "world",
    length: 45,
    when: { ramAbove: 0.8 },
    weight: 4,
    actors: [car1(0), car1(1), car1(2), car1(3), car1(4), car1(5), car1(6),
      car2(0), car2(1), car2(2), car2(3),
      { id: "cop", swap: [[0, "d2_copStop"], [13, "d2_copGo"], [23.5, "d2_copStop"], [25, "d2_copGo"], [36, "d2_copStop"]],
        px: 5, fade: [2.5, 2.5],
        path: [
          { t: 0, x: COP, y: 370, flip: true },
          { t: 13, x: COP, y: 370, flip: false },
          { t: 25, x: COP, y: 370, flip: true },
          { t: 36, x: COP, y: 370, flip: false },
          { t: 45, x: COP, y: 370 }
        ],
        wobble: { y: 5, speed: 1.2 } },
      txt("honk1", "!", "#ff5a5a", 20, [4, 12], COP - 100 - 3 * 80, LANE1 - 44, null, { blink: { every: 1.6, dur: 0.6 } }),
      txt("honk2", "!", "#ff5a5a", 20, [5, 24], COP + 100 + 2 * 82, LANE2 - 44, null, { blink: { every: 1.3, dur: 0.5 } }),
      txt("ok", "✓", "#7dffb0", 30, [36.5, 43], COP, 300, null)
    ],
    particles: [
      { region: { x: COP - 700, y: LANE1 - 14, w: 600, h: 28 }, from: 0, to: 13, style: "smoke", count: 6, rate: 0.6, size: 0.4,
        drift: [30, -20], color: "#8a8fa8" },
      { at: "cop", from: 12.4, to: 13.4, style: "rise", glyph: "♪", color: "#ffffff", count: 3, rate: 2.5, height: 40, offset: [10, -30] },
      { at: "cop", from: 24.4, to: 25.4, style: "rise", glyph: "♪", color: "#ffffff", count: 3, rate: 2.5, height: 40, offset: [-10, -30] },
      { at: "cop", from: 36.5, to: 41, style: "twinkle", count: 5, rate: 1.4, offset: [0, -20], color: "#7dffb0" }
    ]
  }
]

if (typeof module !== "undefined") module.exports = { ART: ART, EPISODES: EPISODES }
