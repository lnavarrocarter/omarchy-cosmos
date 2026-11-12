.pragma library

// Cielo 2: criaturas y viajeros que cruzan el panorama (zona world).
// See EPISODES.md for the format; ART names use this pack's own prefix.
// In zone "world" numbers are absolute world pixels (about 6520 x 1080).

function bubbleRows(n) {
  var rows = [], c = (n - 1) / 2, R = n / 2
  for (var y = 0; y < n; y++) {
    var row = ""
    for (var x = 0; x < n; x++) {
      var dx = x - c, dy = y - c, d = Math.sqrt(dx * dx + dy * dy)
      var ch = "."
      if (d <= R && d > R - 1.15) ch = dx + dy > 2 ? "p" : dx - dy > 3 ? "y" : "k"
      else if (d <= R - 1.15) ch = "f"
      if (ch === "f" && ((dx + 3.2) * (dx + 3.2) + (dy + 3.2) * (dy + 3.2) < 3.2)) ch = "W"
      row += ch
    }
    rows.push(row)
  }
  return rows
}

function glowFish(main, light) {
  return {
    colors: { x: main, z: light },
    rows: [
      "....KKKKK....",
      "KK.KxxxxxK...",
      "KxKxxxzxxxK..",
      "KxxxxxxxxKxK.",
      "KxxxzzzzxxxxK",
      "KxKzzzzzzzzK.",
      "KK.KzzzzzzK..",
      "....KKKKKK..."
    ]
  }
}

function butterfly(main, spot, open) {
  return {
    colors: { x: main, y: spot },
    rows: open ? [
      ".KK.......KK.",
      "KxxK..K..KxxK",
      "KxyxK.K.KxyxK",
      "KxxxxKKKxxxxK",
      ".KxxxxKxxxxK.",
      "..KxyxKxyxK..",
      "..KxxKKKxxK..",
      "...KK...KK..."
    ] : [
      ".............",
      "...KK...KK...",
      "..KxxK.KxxK..",
      "..KxyxKxyxK..",
      "...KxxKxxK...",
      "....KxKxK....",
      ".....KKK.....",
      "............."
    ]
  }
}

function snail(shell, dark, rocket) {
  var rows = rocket ? [
    "..........BBBBB...",
    "nRKKKKKK.BBKBKBB..",
    "NNKxxxxxKBBgBgBB..",
    "NNKzzzzxxKBgggBB..",
    "nRKzxxzzxKBgKggB..",
    ".KxzxKxzxKBBgggB..",
    ".KxzxxxzxK.BgggB..",
    ".KxxzzzxxKggggg...",
    "..KKKKKKKggggggg..",
    ".hgggggggggggggggK",
    "..hhhhhhhhhhhhhhK."
  ] : [
    "..........BBBBB...",
    "...KKKKK.BBKBKBB..",
    "..KxxxxxKBBgBgBB..",
    ".KxzzzzxxKBgggBB..",
    ".KxzxxzzxKBgKggB..",
    ".KxzxKxzxKBBgggB..",
    ".KxzxxxzxK.BgggB..",
    ".KxxzzzxxKggggg...",
    "..KKKKKKKggggggg..",
    ".hgggggggggggggggK",
    "..hhhhhhhhhhhhhhK."
  ]
  return { colors: { x: shell, z: dark, g: "#b6e07a", h: "#7fae4a" }, rows: rows }
}

var TURTLE = { E: "#7a5a2e", e: "#c69a52", f: "#e0c070", g: "#86c99a", h: "#4f8a62" }

var ART = {
  s2_catBox: {
    colors: { b: "#c99556", d: "#8e6233", t: "#e8c98a" },
    rows: [
      "..........C...C........",
      "..........CC.CC........",
      ".........CCCCCCC.......",
      ".........CVVCVVC.......",
      ".........CVKCVKC.......",
      "...d.....CCCPCCC....d..",
      "...dd...CCCCCCCCC..dd..",
      "...KKKKKKKKKKKKKKKKKKK.",
      "...KbbbbbbbbbbbbbbbbbK.",
      "...KbbbbbbtttbbbbbbbbK.",
      "..nKbbbbbbbbbbbbbbbbbK.",
      "NNNKbbbbbdbbbbbdbbbbbK.",
      "NnNKbbbbbbdbbbdbbbbbbK.",
      "NNNKbbbbbbbdddbbbbbbbK.",
      "..nKbbbbbbbbbbbbbbbbbK.",
      "...KKKKKKKKKKKKKKKKKKK."
    ]
  },
  s2_plane: {
    colors: { u: "#b9cff2" },
    rows: [
      "K.......................",
      "KK......................",
      "KWKK....................",
      "KWuWKK..................",
      "KWWWWWKK................",
      "KWuuuWWWKK..............",
      "KWWWWWWWWWKKK...........",
      "KWuuuuuuuWWWWKKK........",
      "KGGGGGGGGWWWWWWWKKK.....",
      ".KGGGGGGGGGGGGWWWWWKKK..",
      "..KKGGGGGGGGGGGGGGGGGGKK",
      "....KKKnnnnnnnnKKKKKKK..",
      ".......KKKKKKKK........."
    ]
  },
  s2_glowA: glowFish("#53e8ff", "#c8fbff"),
  s2_glowB: glowFish("#ff7fd0", "#ffd2ef"),
  s2_glowC: glowFish("#ffd65a", "#fff6c0"),
  s2_turtle0: {
    colors: TURTLE,
    rows: [
      "..........KKKKKKKKKK................",
      ".......KKKeEEEeEEEEeKKK.............",
      ".....KKeEEEEeEEEEEEeEEEKK...........",
      "....KeEEEEEeEEEEEEEEeEEEEK..........",
      "...KeeeeeeeeeeeeeeeeeeeeeeK...KKKK..",
      "..KEEEeEEEEEEeEEEEEEEeEEEEEK.KggggK.",
      "..KEEEeEEEEEEeEEEEEEEeEEEEEKKggKggK.",
      "..KffffffffffffffffffffffffKgggggggK",
      "..KhhhhhhhhhhhhhhhhhhhhhhhhhhggggKK.",
      ".KgK.KKKKKKKKKKKKKKKKKKKKgggK.KK....",
      "KggK..................KggggggK......",
      "KgK....................KKggggK......",
      "KK.......................KKKK......."
    ]
  },
  s2_turtle1: {
    colors: TURTLE,
    rows: [
      "..........KKKKKKKKKK................",
      ".......KKKeEEEeEEEEeKKK.............",
      ".....KKeEEEEeEEEEEEeEEEKK...........",
      "....KeEEEEEeEEEEEEEEeEEEEK..........",
      "...KeeeeeeeeeeeeeeeeeeeeeeK...KKKK..",
      "..KEEEeEEEEEEeEEEEEEEeEEEEEK.KggggK.",
      "..KEEEeEEEEEEeEEEEEEEeEEEEEKKggKggK.",
      "KKKffffffffffffffffffffffffKgggggggK",
      "KggKhhhhhhhhhhhhhhhhhhhhhhhhhggggKK.",
      ".KgggKKKKKKKKKKKKKKKKKKKKKKgggK.....",
      "..KKK...............KggggggggK......",
      "....................KKKKKKKK........",
      "...................................."
    ]
  },
  s2_tinyWorld: {
    colors: { y: "#ffe680" },
    rows: [
      "..KKKK.........KK.",
      ".KLLLLK......K.Kn.",
      "KLLlLLLK....KRKKn.",
      "KLLLLlLK...KRRRRK.",
      ".KLlLLK...KRRRRRRK",
      "..KKTK...KKKKKKKKK",
      "...KTK...KWWKyyWK.",
      "...KTK...KWWKWWWK.",
      ".KLLLLLLLLLLLLLLLK",
      "KlllLlllllLllllllK",
      ".KKKKKKKKKKKKKKKK."
    ]
  },
  s2_tinyRocket: [
    ".K.",
    "KRK",
    "KWK",
    "KVK",
    "KWK",
    "RWR",
    "R.R"
  ],
  s2_wand: {
    colors: { q: "#bff6ff" },
    rows: [
      ".KKK.",
      "Kq.qK",
      "K...K",
      "Kq.qK",
      ".KKK.",
      "..T..",
      "..T..",
      "..T.."
    ]
  },
  s2_bubble: {
    colors: { k: ["#c8f4ff", 230], p: ["#ff9de6", 220], y: ["#fff08a", 220], f: ["#9fe3ff", 48] },
    rows: bubbleRows(16)
  },
  s2_bflyA0: butterfly("#53e8ff", "#ffffff", true),
  s2_bflyA1: butterfly("#53e8ff", "#ffffff", false),
  s2_bflyB0: butterfly("#ff8fd8", "#ffe680", true),
  s2_bflyB1: butterfly("#ff8fd8", "#ffe680", false),
  s2_bflyC0: butterfly("#ffb347", "#1b1d2b", true),
  s2_bflyC1: butterfly("#ffb347", "#1b1d2b", false),
  s2_bflyD0: butterfly("#b48cff", "#7df9ff", true),
  s2_bflyD1: butterfly("#b48cff", "#7df9ff", false),
  s2_bigBall: [
    "..KKKK..",
    ".KWWWWK.",
    "KWWWWWGK",
    "KWWWWWGK",
    "KWWWWGGK",
    "KWGWGGGK",
    ".KGGGGK.",
    "..KKKK.."
  ],
  s2_ufoSnow: [
    ".......WWWWWW.......",
    "......WWWWWWWW......",
    "......BLKLLKLB......",
    "......BLLLLLLB......",
    "...KWWWWWWWWWWWWK...",
    ".KWWWGGWWWGGGWWGWWK.",
    "KGYGGOGGYGGOGGYGGOGK",
    ".KnnnnnnnnnnnnnnnnK.",
    "...KKNNWNNNNWNNNKK..",
    ".......KWKKKWK......",
    "........W...W......."
  ],
  s2_shuttleCrew: [
    "......KKKKK.......",
    "....KKWWWWWKK.....",
    "..KKWKWWKWWWWKK...",
    ".KWWKVDDKWWWWWWK..",
    "KRRWWKKKWWWWWWWWKO",
    ".KWWWWWWWWWWWWWK.Y",
    "..KKNNNNNNNNNKK...",
    "....KK.....KK....."
  ],
  s2_thumb: [
    "....KKKK......",
    "...KWWWWK.....",
    "..KWWVVWWK....",
    "..KWVDDVWK....",
    "..KWVVVVWK....",
    "...KWWWWK..KK.",
    "...KKWWKK.KWK.",
    "..KWWOOWWKKWWK",
    ".KWGWWWWWWWWWK",
    ".KWKWWWWKKKKK.",
    ".KK.KWWK......",
    "....KWWK......",
    "...KWGGWK.....",
    "...KWKKWK.....",
    "...KK..KK....."
  ],
  s2_snailA: snail("#ffd65a", "#c98a1f", false),
  s2_snailB: snail("#ff8fa8", "#c4506e", false),
  s2_snailC: snail("#58c8ff", "#2a5fb0", true),
  s2_flag: [
    "KK..........",
    "TKKKKKKKKKK.",
    "TKWWNNWWNNK.",
    "TKWWNNWWNNK.",
    "TKNNWWNNWWK.",
    "TKNNWWNNWWK.",
    "TKWWNNWWNNK.",
    "TKKKKKKKKKK.",
    "T...........",
    "T...........",
    "T...........",
    "T...........",
    "T...........",
    "T...........",
    "T...........",
    "T...........",
    "T...........",
    "T...........",
    "T...........",
    "T...........",
    "T...........",
    "T...........",
    "KTK.........",
    "KKKK........"
  ]
}

// ---------------------------------------------------------------- helpers

// A full loop: starts at (x0, y0) flying right, goes up and around.
function loopKeys(t0, dur, x0, y0, R, rot0) {
  var out = []
  for (var i = 1; i <= 8; i++) {
    var a = i * Math.PI / 4
    out.push({ t: t0 + dur * i / 8, x: Math.round(x0 + R * Math.sin(a)), y: Math.round(y0 - R + R * Math.cos(a)),
      rot: rot0 - i * 45, ease: "linear" })
  }
  return out
}

// Followers repeat the leader's path a moment later (same wave, delayed).
var SCHOOL = [[0.5, -34], [0.8, 30], [1.2, -4], [1.6, -46], [1.9, 40], [2.3, 8], [2.7, -28], [3.1, 26], [3.6, -6]]
function schoolFish(i) {
  var d = SCHOOL[i][0], dy = SCHOOL[i][1]
  return { id: "fish" + i, swap: [[0, "s2_glowA"], [30 + d, "s2_glowB"], [44 + d, "s2_glowC"]], px: 3, fade: [3, 3],
    glow: { r: 22, color: "#bff6ff", a: 0.13 },
    path: [{ t: d, x: 300, y: 910 + dy }, { t: 62 + d, x: 6150, y: 910 + dy, ease: "linear" }],
    wobble: [{ y: 60, speed: 0.9, phase: -0.9 * d, rot: 9 }, { y: 5, speed: 2.3, phase: i }] }
}

function bubble(i, t0, life, scale, dy) {
  return { id: "bubble" + i, sprite: "s2_bubble", px: 4, show: [t0, t0 + life], fade: [0.6, 0],
    path: [{ t: t0, x: 46, y: -24, on: "astro", scale: 0.15 },
           { t: t0 + 2.5, x: 120, y: -50, on: "astro", scale: scale, ease: "out" },
           { t: t0 + life, x: 120 + life * 75, y: -50 + dy, on: "astro", ease: "linear" }],
    wobble: { x: 10, xspeed: 0.9 + i * 0.1, y: 14, speed: 1.1 + i * 0.13, phase: i } }
}
function pop(i, t) {
  return [
    { at: "bubble" + i, t: t, duration: 0.8, count: 4, size: 26, spread: 20, colors: ["#c8f4ff", "#ff9de6", "#fff08a"] },
    { at: "bubble" + i, from: t, to: t + 1, style: "sparks", every: 5, dur: 1, count: 10, radius: 60, size: 1.2,
      color: ["#c8f4ff", "#ff9de6", "#fff08a"] }
  ]
}
// [index, blown at, life, size, drift up/down]
var POPS = [[0, 3, 9, 1, -60], [1, 8, 11, 1.3, 40], [2, 13, 8, 0.8, -110], [3, 18, 10, 1.2, 10],
  [4, 23, 9, 1, -70], [5, 28, 11, 1.4, 60], [6, 33, 8, 0.9, -100], [7, 38, 10, 1.1, 30], [8, 43, 9, 1.25, -50]]

// Butterflies gather into a heart over the island, then scatter.
var HEART = { x: 3260, y: 260 }
var HEART_POINTS = [[0, -60], [-50, -105], [-115, -105], [-150, -55], [-140, 10], [-90, 75], [-45, 120], [0, 160],
  [45, 120], [90, 75], [140, 10], [150, -55], [115, -105], [50, -105]]
function butterflyActor(i) {
  var hx = HEART.x + HEART_POINTS[i][0], hy = HEART.y + HEART_POINTS[i][1]
  var k = ["A", "B", "C", "D"][i % 4]
  var a = "s2_bfly" + k + "0", b = "s2_bfly" + k + "1"
  return { id: "fly" + i, frames: i % 2 ? [a, b] : [b, a], fps: 5 + (i % 3), px: 4, fade: [3, 3],
    glow: { r: 18, color: "#ffffff", a: 0.08 },
    path: [{ t: 0, x: 240 + i * 60, y: 190 + Math.round(110 * Math.sin(i * 1.7)) },
           { t: 16, x: 1650 + i * 50, y: 240 + ((i * 3) % 5) * 70 },
           { t: 32, x: hx, y: hy, ease: "inOut" },
           { t: 43, x: hx, y: hy },
           { t: 58, x: 4600 + i * 60, y: 130 + ((i * 2) % 5) * 45, ease: "inOut" },
           { t: 72, x: 5850 + i * 25, y: 150 + ((i * 3) % 4) * 50, ease: "linear" }],
    wobble: [{ to: 31, x: 30, xspeed: 0.7 + i * 0.11, y: 40, speed: 1.3 + i * 0.17, phase: i, rot: 15 },
             { from: 31, to: 43, y: 5, speed: 2, phase: i, rot: 6 },
             { from: 43, x: 30, xspeed: 0.8 + i * 0.09, y: 40, speed: 1.2 + i * 0.15, phase: i * 2, rot: 15 }] }
}

var LANES = [872, 932, 992]
function lane(i) {
  return { a: "trackA", b: "trackB", sag: 0, color: "#6b7290", aOffset: [0, LANES[i]], bOffset: [0, LANES[i]], show: [1.5, 88] }
}
function slime(who, to) {
  return { at: who, style: "twinkle", count: 5, rate: 0.25, trail: true, offset: [-30, 16], color: "#b6e07a", size: 0.7,
    from: 3, to: to }
}

// ---------------------------------------------------------------- episodes

var EPISODES = [
  {
    id: "boxCat",
    title: "Un gato en una caja de cartón con propulsor",
    zone: "world",
    length: 50,
    actors: [
      { id: "box", sprite: "s2_catBox", px: 5, fade: [3, 3],
        path: [{ t: 0, x: 261, y: 216 }, { t: 21, x: 2600, y: 240, ease: "linear" },
               { t: 25, x: 2850, y: 380, ease: "in" }, { t: 29, x: 3150, y: 230, ease: "out" },
               { t: 50, x: 6130, y: 190, ease: "linear" }],
        wobble: [{ y: 10, speed: 1.4, rot: 4 }, { from: 21, to: 27, x: 4, xspeed: 22, y: 3, speed: 20, rot: 8 }] },
      { id: "nozzle", path: [{ t: 0, x: -57, y: 22, on: "box" }] },
      { id: "fish", sprite: "fish", px: 4, show: [1, 47.2], fade: [2, 0.2],
        path: [{ t: 0, x: 170, y: -30, on: "box", flip: true }, { t: 21, x: 180, y: -30, on: "box" },
               { t: 27, x: 270, y: -60, on: "box" }, { t: 43, x: 130, y: -30, on: "box" },
               { t: 47.2, x: 40, y: -40, on: "box", ease: "in" }],
        wobble: { y: 10, speed: 3, rot: 12 } },
      { id: "oops", text: "!", color: "#ffd65a", size: 26, show: [21.5, 24.5], fade: [0.2, 0.4],
        path: [{ t: 0, x: 16, y: -84, on: "box" }] },
      { id: "love", text: "♥", color: "#ff8fa8", size: 28, show: [47.2, 50], fade: [0.3, 1],
        path: [{ t: 47.2, x: 16, y: -80, on: "box" }, { t: 50, x: 16, y: -120, on: "box", ease: "out" }] }
    ],
    bursts: [
      { at: "nozzle", t: 22.4, duration: 1, count: 3, size: 26, spread: 10, colors: ["#6b7290", "#a3a9c2"] },
      { at: "nozzle", t: 24, duration: 1, count: 3, size: 26, spread: 10, colors: ["#6b7290", "#a3a9c2"] },
      { at: "nozzle", t: 27.3, duration: 1.4, count: 5, size: 50, spread: 16, colors: ["#ff9447", "#ffd65a", "#fff6c0"] }
    ],
    particles: [
      { at: "box", from: 1, to: 21, style: "exhaust", count: 10, rate: 3, reach: 40, offset: [-60, 22] },
      { at: "box", from: 21, to: 27.3, style: "smoke", count: 6, rate: 1.6, offset: [-58, 22], drift: [40, -30] },
      { at: "box", from: 27.3, to: 49, style: "exhaust", count: 14, rate: 3.5, reach: 80, size: 1.5, offset: [-60, 22] },
      { at: "box", from: 47.2, to: 50, style: "rise", glyph: "♥", count: 3, rate: 1, height: 60, offset: [12, -66],
        color: "#ff8fa8" }
    ]
  },

  {
    id: "paperPlane",
    title: "Avión de papel gigante",
    zone: "world",
    length: 60,
    actors: [
      { id: "plane", sprite: "s2_plane", px: 5, fade: [3, 3],
        path: [{ t: 0, x: 261, y: 150, rot: 8 }, { t: 12, x: 1500, y: 300, rot: 8, ease: "sine" },
               { t: 13, x: 1620, y: 300, rot: 0, ease: "linear" }]
          .concat(loopKeys(13, 4.5, 1620, 300, 120, 0))
          .concat([{ t: 18.5, x: 1760, y: 300, rot: -360, ease: "linear" },
                   { t: 30, x: 3000, y: 300, rot: -366, ease: "sine" },
                   { t: 31, x: 3120, y: 300, rot: -360, ease: "linear" }])
          .concat(loopKeys(31, 4, 3120, 300, 110, -360))
          .concat(loopKeys(35, 4, 3120, 300, 110, -720))
          .concat([{ t: 40, x: 3250, y: 300, rot: -1080, ease: "linear" },
                   { t: 52, x: 4900, y: 420, rot: -1072, ease: "sine" },
                   { t: 60, x: 6100, y: 220, rot: -1090, ease: "sine" }]),
        wobble: [{ to: 12.5, y: 18, speed: 0.8, rot: 4 }, { from: 19, to: 30.5, y: 18, speed: 0.8, rot: 4 },
                 { from: 40, y: 18, speed: 0.8, rot: 4 }] }
    ],
    bursts: [
      { at: "plane", t: 17.5, duration: 1.2, count: 3, size: 30, colors: ["#ffffff", "#b9cff2"] },
      { at: "plane", t: 39, duration: 2, count: 6, size: 50, colors: ["#ffd65a", "#ffffff", "#7df9ff"] }
    ],
    particles: [
      { at: "plane", style: "twinkle", count: 18, rate: 0.6, trail: true, offset: [-56, 6], size: 1.3, color: ["#d8e6ff", "#ffffff"],
        from: 1, to: 58 },
      { at: "plane", from: 39, to: 41, style: "sparks", every: 5, dur: 1.6, count: 16, radius: 110, size: 1.3,
        color: ["#ffd65a", "#fff6c0", "#7df9ff"] }
    ]
  },

  {
    id: "glowSchool",
    title: "Cardumen de peces luminosos",
    zone: "world",
    length: 62,
    actors: [
      { id: "leader", swap: [[0, "s2_glowA"], [30, "s2_glowB"], [44, "s2_glowC"]], px: 4, fade: [3, 3],
        glow: { r: 34, color: "#bff6ff", a: 0.16 },
        path: [{ t: 0, x: 300, y: 910 }, { t: 62, x: 6150, y: 910, ease: "linear" }],
        wobble: { y: 60, speed: 0.9, rot: 9 } }
    ].concat(SCHOOL.map(function(s, i) { return schoolFish(i) })),
    bursts: [
      { at: "leader", t: 29.8, follow: true, duration: 1.6, count: 4, size: 40, spread: 20, colors: ["#ff7fd0", "#ffd2ef"] },
      { at: "leader", t: 43.8, follow: true, duration: 1.6, count: 4, size: 40, spread: 20, colors: ["#ffd65a", "#fff6c0"] }
    ],
    particles: [
      { at: "leader", style: "twinkle", count: 14, rate: 0.5, trail: true, offset: [-20, 0],
        color: ["#7df9ff", "#ffffff", "#ff7fd0"], from: 2, to: 60 },
      { at: "fish5", style: "rise", count: 6, rate: 0.4, height: 70, size: 0.8, color: "#c8fbff", offset: [20, -8],
        from: 3, to: 60 }
    ]
  },

  {
    id: "worldTurtle",
    title: "Tortuga gigante con un mundito en el caparazón",
    zone: "world",
    length: 80,
    actors: [
      { id: "turtle", frames: ["s2_turtle0", "s2_turtle1"], fps: 1.2, px: 6, fade: [4, 4],
        path: [{ t: 0, x: 330, y: 960 }, { t: 80, x: 6050, y: 945, ease: "linear" }],
        wobble: { y: 14, speed: 0.5, rot: 3 } },
      { id: "world", sprite: "s2_tinyWorld", px: 4, fade: [4, 4],
        path: [{ t: 0, x: -18, y: -56, on: "turtle" }], wobble: { y: 1, speed: 0.5 } },
      { id: "tinyRocket", sprite: "s2_tinyRocket", px: 3, show: [38, 47], fade: [0.5, 0.6],
        path: [{ t: 38, x: -42, y: -66, on: "turtle" }, { t: 40, x: -42, y: -90, on: "turtle", ease: "in" },
               { t: 47, x: 120, y: -600, on: "turtle", ease: "in" }] },
      { id: "cheer", text: "♪", color: "#ffd65a", size: 24, show: [48, 54], fade: [0.5, 1],
        path: [{ t: 48, x: 80, y: -80, on: "turtle" }, { t: 54, x: 86, y: -120, on: "turtle" }] }
    ],
    bursts: [
      { at: "tinyRocket", t: 47, duration: 1.6, count: 5, size: 40, colors: ["#ff8fa8", "#ffd65a", "#7df9ff"] }
    ],
    particles: [
      { at: "world", style: "smoke", count: 6, rate: 0.5, size: 0.35, offset: [28, -26], drift: [36, -46],
        trail: true, color: "#c9cbe0", from: 2, to: 77 },
      { at: "tinyRocket", style: "fall", count: 10, rate: 3, height: 40, size: 0.8, trail: true, offset: [0, 12],
        color: ["#ffd65a", "#ff9447"], from: 39, to: 46.5 },
      { at: "tinyRocket", style: "sparks", from: 47, to: 49, every: 5, dur: 1.8, count: 18, radius: 90, size: 1.2,
        color: ["#ff8fa8", "#ffd65a", "#7df9ff", "#ffffff"] },
      { at: "turtle", style: "rise", count: 4, rate: 0.3, height: 60, size: 0.8, color: "#c8fbff", offset: [100, -2],
        from: 4, to: 76 }
    ]
  },

  {
    id: "soapBubbles",
    title: "Burbujas de jabón gigantes que revientan",
    zone: "world",
    length: 72,
    actors: [
      { id: "astro", sprite: "astronaut", px: 4, fade: [3, 3],
        path: [{ t: 0, x: 330, y: 300 }, { t: 72, x: 3900, y: 230, ease: "linear" }],
        wobble: { y: 18, speed: 0.6, rot: 6 } },
      { id: "wand", sprite: "s2_wand", px: 3, fade: [3, 3], path: [{ t: 0, x: 30, y: -8, on: "astro" }],
        wobble: { y: 3, speed: 2.5 } },
      { id: "big", sprite: "s2_bubble", px: 4, show: [51, 64], fade: [0.6, 0],
        path: [{ t: 51, x: 46, y: -24, on: "astro", scale: 0.15 },
               { t: 55, x: 150, y: -70, on: "astro", scale: 2.1, ease: "out" },
               { t: 64, x: 760, y: -30, on: "astro", ease: "linear" }],
        wobble: { x: 8, xspeed: 0.7, y: 12, speed: 0.9 } },
      { id: "fish", sprite: "fish", px: 5, show: [53, 72], fade: [1.5, 2],
        path: [{ t: 53, x: 0, y: 6, on: "big", flip: true }, { t: 64, x: 0, y: 6, on: "big" },
               { t: 66, x: 60, y: 70, on: "big", arc: 40 }, { t: 72, x: 700, y: 20, on: "big", ease: "in" }],
        wobble: { y: 6, speed: 3, rot: 10 } },
      { id: "oops", text: "!", color: "#ffd65a", size: 24, show: [64.2, 66.5], fade: [0.2, 0.4],
        path: [{ t: 64, x: 10, y: -30, on: "fish" }] },
      { id: "laugh", text: "♪", color: "#7df9ff", size: 22, show: [65, 69], fade: [0.4, 0.8],
        path: [{ t: 65, x: 0, y: -60, on: "astro" }, { t: 69, x: 6, y: -90, on: "astro" }] }
    ].concat(POPS.map(function(p) { return bubble(p[0], p[1], p[2], p[3], p[4]) })),
    bursts: POPS.map(function(p) { return pop(p[0], p[1] + p[2])[0] })
      .concat([{ at: "big", t: 64, duration: 1.2, count: 6, size: 60, spread: 40, colors: ["#c8f4ff", "#ff9de6", "#fff08a"] }]),
    particles: POPS.map(function(p) { return pop(p[0], p[1] + p[2])[1] })
      .concat([{ at: "big", from: 64, to: 66, style: "sparks", every: 5, dur: 1.4, count: 16, radius: 130, size: 1.4,
                 color: ["#c8f4ff", "#ff9de6", "#fff08a"] }])
  },

  {
    id: "cosmicButterflies",
    title: "Mariposas cósmicas",
    zone: "world",
    length: 72,
    actors: HEART_POINTS.map(function(p, i) { return butterflyActor(i) }).concat([
      { id: "heart", text: "♥", color: "#ff8fd8", size: 54, show: [34, 43.5], fade: [1.5, 1.5],
        path: [{ t: 34, x: HEART.x, y: HEART.y + 20 }], wobble: { y: 4, speed: 2 } }
    ]),
    bursts: [{ at: "heart", t: 42.5, duration: 2, count: 6, size: 60, spread: 60, colors: ["#ff8fd8", "#7df9ff", "#ffd65a"] }],
    particles: [
      { at: "fly0", style: "twinkle", count: 10, rate: 0.6, trail: true, color: ["#7df9ff", "#ffffff"], from: 2, to: 70 },
      { at: "fly7", style: "twinkle", count: 10, rate: 0.6, trail: true, color: ["#ff8fd8", "#ffffff"], from: 2, to: 70 },
      { at: "heart", style: "rise", glyph: "♥", count: 6, rate: 0.5, height: 120, size: 0.8,
        color: ["#ff8fd8", "#ffd0f0"], from: 35, to: 42 },
      { at: "heart", style: "sparks", from: 42.5, to: 44, every: 5, dur: 1.8, count: 18, radius: 170, size: 1.2,
        color: ["#ff8fd8", "#7df9ff", "#ffd65a", "#ffffff"] }
    ]
  },

  {
    id: "snowballFight",
    title: "Pelea de bolas de nieve entre dos naves",
    zone: "world",
    length: 56,
    actors: [
      { id: "ufo", frames: ["ufo0", "ufo1"], fps: 6, px: 5, show: [0, 40.6], fade: [3, 0],
        path: [{ t: 0, x: 900, y: 220 }, { t: 56, x: 6150, y: 220, ease: "linear" }],
        wobble: { y: 30, speed: 0.8, rot: 4 } },
      { id: "ufoSnow", sprite: "s2_ufoSnow", px: 5, show: [40.6, 56], fade: [0, 3],
        path: [{ t: 0, x: 0, y: 0, on: "ufo" }], wobble: [{ from: 40.6, to: 43, x: 6, xspeed: 20, speed: 20, rot: 6 }] },
      { id: "shuttle", sprite: "shuttle", facesLeft: true, px: 5, fade: [3, 3],
        path: [{ t: 0, x: -560, y: 30, on: "ufo", flip: true }],
        wobble: { y: 22, speed: 1.1, phase: 2, rot: 5 } },
      { id: "big", sprite: "s2_bigBall", px: 5, show: [37.5, 40.6], spin: 200,
        path: [{ t: 37.5, x: -52, y: -8, on: "shuttle" }, { t: 40.6, x: -6, y: 0, on: "ufo", arc: 140, ease: "linear" }] },
      { id: "brr", text: "!", color: "#bff6ff", size: 26, show: [41.2, 44], fade: [0.2, 0.5],
        path: [{ t: 41, x: 0, y: -74, on: "ufo" }] },
      { id: "haha", text: "♪", color: "#ffd65a", size: 24, show: [41, 45], fade: [0.3, 0.6],
        path: [{ t: 41, x: 0, y: -60, on: "shuttle" }, { t: 45, x: 0, y: -94, on: "shuttle" }] },
      { id: "truce", text: "♥", color: "#ff8fa8", size: 26, show: [47, 53], fade: [0.6, 1],
        path: [{ t: 47, x: -280, y: -30, on: "ufo" }, { t: 53, x: -280, y: -80, on: "ufo" }] }
    ],
    shots: [
      { from: "shuttle", to: "ufo", start: 4, every: 6, count: 5, travel: 1.1, arc: 70, kind: "ball", color: "#ffffff",
        hit: true, hitColor: "#ffffff", fromOffset: [-42, -6] },
      { from: "ufo", to: "shuttle", start: 7, every: 6, count: 5, travel: 1.1, arc: 70, kind: "ball", color: "#ffffff",
        hit: true, hitColor: "#ffffff", fromOffset: [-36, 4] },
      { from: "shuttle", to: "ufo", start: 12.5, every: 9, count: 3, travel: 1.2, arc: 90, kind: "ball", color: "#ffffff",
        miss: [80, 70], fromOffset: [-42, -6] },
      { from: "ufo", to: "shuttle", start: 32, every: 0.6, count: 5, travel: 0.9, arc: 50, kind: "ball", color: "#ffffff",
        hit: true, hitColor: "#ffffff", fromOffset: [-36, 4] }
    ],
    bursts: [
      { at: "ufo", t: 40.6, duration: 2, count: 6, size: 60, spread: 30, colors: ["#ffffff", "#c8f4ff", "#e8fbff"] }
    ],
    particles: [
      { at: "ufoSnow", from: 41, to: 54, style: "fall", count: 8, rate: 0.7, height: 120, size: 1, color: ["#ffffff", "#c8f4ff"] },
      { at: "ufo", from: 40.6, to: 42, style: "sparks", every: 5, dur: 1.4, count: 14, radius: 80, color: "#ffffff" }
    ]
  },

  {
    id: "snailRace",
    title: "Carrera de caracoles espaciales",
    zone: "world",
    length: 90,
    actors: [
      { id: "trackA", path: [{ t: 0, x: 2440, y: 0 }] },
      { id: "trackB", path: [{ t: 0, x: 3440, y: 0 }] },
      { id: "flag", sprite: "s2_flag", px: 5, fade: [2, 3], path: [{ t: 0, x: 3466, y: 942 }],
        wobble: { from: 79, to: 86, rot: 8, speed: 6 } },
      { id: "snailA", sprite: "s2_snailA", px: 4, fade: [2, 3],
        path: [{ t: 3, x: 2490, y: LANES[0] - 20 }, { t: 40, x: 2950, y: LANES[0] - 20, ease: "linear" },
               { t: 46, x: 2990, y: LANES[0] - 20, ease: "sine" }, { t: 81, x: 3470, y: LANES[0] - 20, ease: "linear" },
               { t: 86, x: 3500, y: LANES[0] - 20, ease: "out" }],
        wobble: { y: 1.5, speed: 2.4, rot: 2 } },
      { id: "snailB", sprite: "s2_snailB", px: 4, fade: [2, 3],
        path: [{ t: 3, x: 2490, y: LANES[1] - 20 }, { t: 30, x: 2780, y: LANES[1] - 20, ease: "sine" },
               { t: 36, x: 2790, y: LANES[1] - 20, ease: "sine" }, { t: 90, x: 3360, y: LANES[1] - 20, ease: "linear" }],
        wobble: { y: 1.5, speed: 2.1, phase: 1, rot: 2 } },
      { id: "snailC", sprite: "s2_snailC", px: 4, fade: [2, 2],
        path: [{ t: 3, x: 2490, y: LANES[2] - 20 }, { t: 58, x: 2660, y: LANES[2] - 20, ease: "linear" },
               { t: 61, x: 2665, y: LANES[2] - 20, ease: "linear" },
               { t: 64.5, x: 3480, y: LANES[2] - 40, ease: "in" },
               { t: 68, x: 4500, y: 520, ease: "linear", o: 0 }],
        wobble: [{ y: 1.5, speed: 2.7, phase: 2, rot: 2 }, { from: 58.5, to: 61.2, x: 3, xspeed: 24, speed: 24, rot: 6 }] },
      { id: "go", text: "!", color: "#e2524a", size: 28, show: [2.5, 5.5], fade: [0.3, 0.6],
        path: [{ t: 0, x: 2490, y: LANES[0] - 80 }] },
      { id: "cHuh", text: "!", color: "#ffd65a", size: 24, show: [57.5, 61], fade: [0.2, 0.3],
        path: [{ t: 0, x: 10, y: -46, on: "snailC" }] },
      { id: "aHuh", text: "?", color: "#ffffff", size: 24, show: [66, 72], fade: [0.4, 0.8],
        path: [{ t: 0, x: 10, y: -50, on: "snailA" }] },
      { id: "bHuh", text: "?", color: "#ffffff", size: 24, show: [66.5, 72], fade: [0.4, 0.8],
        path: [{ t: 0, x: 10, y: -50, on: "snailB" }] },
      { id: "win", text: "✓", color: "#3fae6a", size: 30, show: [81, 89], fade: [0.4, 1],
        path: [{ t: 81, x: 10, y: -54, on: "snailA" }, { t: 89, x: 10, y: -76, on: "snailA" }] }
    ],
    ropes: [lane(0), lane(1), lane(2)],
    bursts: [
      { at: "go", t: 3, duration: 1, count: 2, size: 24, spread: 6, colors: ["#e2524a", "#ffd65a"] },
      { at: "snailC", t: 61, duration: 1.2, count: 4, size: 40, spread: 14, colors: ["#ff9447", "#ffd65a", "#fff6c0"] },
      { at: "flag", t: 81, duration: 2.5, count: 6, size: 50, spread: 50, colors: ["#3fae6a", "#ffd65a", "#ff8fa8"] }
    ],
    particles: [
      slime("snailA", 86), slime("snailB", 88), slime("snailC", 58),
      { at: "snailC", style: "smoke", count: 4, rate: 1.5, offset: [-38, -4], drift: [30, -30], size: 0.6, from: 58.5, to: 61 },
      { at: "snailC", style: "exhaust", count: 12, rate: 4, reach: 70, size: 1.4, offset: [-38, -4], from: 61, to: 67 },
      { at: "flag", style: "sparks", from: 81, to: 84, every: 1.5, dur: 1.4, count: 16, radius: 110, size: 1.2,
        color: ["#3fae6a", "#ffd65a", "#ff8fa8", "#58c8ff"] }
    ]
  },

  {
    id: "hitchhiker",
    title: "Astronauta perdido haciendo dedo",
    zone: "world",
    length: 58,
    actors: [
      { id: "astro", sprite: "s2_thumb", px: 4, show: [0, 39.6], fade: [3, 0.3],
        path: [{ t: 0, x: 3600, y: 330 }, { t: 36, x: 3780, y: 320, ease: "linear" },
               { t: 39.5, x: -10, y: -8, on: "shuttle", scale: 0.35, o: 0.3, ease: "inOut" }],
        wobble: [{ to: 36, y: 12, speed: 0.8, rot: 6 }, { from: 8.6, to: 11.5, x: 6, xspeed: 9, rot: 40, speed: 6 },
                 { from: 18.6, to: 21.5, x: 6, xspeed: 9, rot: 40, speed: 6 }] },
      { id: "ufo", frames: ["ufo0", "ufo1"], fps: 8, px: 4, show: [5, 13], fade: [1.5, 1.5],
        path: [{ t: 5, x: 2600, y: 245 }, { t: 13, x: 5000, y: 230, ease: "linear" }],
        wobble: { y: 8, speed: 3 } },
      { id: "rocket", sprite: "rocket", px: 4, show: [15, 23], fade: [1.5, 1.5],
        path: [{ t: 15, x: 4800, y: 390, flip: true }, { t: 23, x: 2300, y: 400, ease: "linear" }] },
      { id: "shuttle", sprite: "shuttle", facesLeft: true, px: 5, show: [25, 58], fade: [2, 3],
        swap: [[0, "shuttle"], [39.6, "s2_shuttleCrew"]],
        path: [{ t: 25, x: 2300, y: 356, flip: true }, { t: 36, x: 3790, y: 356, ease: "out" },
               { t: 42, x: 3790, y: 356 }, { t: 56, x: 6150, y: 290, ease: "in" }],
        wobble: { y: 6, speed: 1.2, rot: 3 } },
      { id: "engine", path: [{ t: 0, x: 42, y: 2, on: "shuttle" }] },
      { id: "huh1", text: "!", color: "#ffd65a", size: 26, show: [9, 11.5], fade: [0.2, 0.4],
        path: [{ t: 0, x: 0, y: -50, on: "astro" }] },
      { id: "huh2", text: "?", color: "#ffffff", size: 26, show: [19.5, 23], fade: [0.2, 0.5],
        path: [{ t: 0, x: 0, y: -50, on: "astro" }] },
      { id: "yay", text: "!", color: "#3fae6a", size: 26, show: [33.5, 36.5], fade: [0.2, 0.4],
        path: [{ t: 0, x: 0, y: -50, on: "astro" }] },
      { id: "thanks", text: "♥", color: "#ff8fa8", size: 28, show: [40, 45], fade: [0.4, 1],
        path: [{ t: 40, x: 0, y: -40, on: "shuttle" }, { t: 45, x: 0, y: -80, on: "shuttle" }] }
    ],
    bursts: [
      { at: "engine", t: 42, duration: 1.4, count: 4, size: 40, spread: 10, colors: ["#ff9447", "#ffd65a", "#fff6c0"] }
    ],
    particles: [
      { at: "rocket", style: "exhaust", count: 10, rate: 4, reach: 50, offset: [-38, 0], from: 15, to: 23 },
      { at: "ufo", style: "twinkle", count: 8, rate: 1.2, trail: true, color: "#7df9ff", from: 5, to: 13 },
      { at: "shuttle", style: "exhaust", count: 8, rate: 3, reach: 30, offset: [42, 2], from: 25, to: 35 },
      { at: "shuttle", style: "exhaust", count: 14, rate: 4, reach: 80, size: 1.5, offset: [42, 2], from: 42, to: 56 },
      { at: "shuttle", style: "rise", glyph: "♪", count: 3, rate: 0.4, height: 70, offset: [0, -30],
        color: "#ffd65a", from: 44, to: 54 }
    ]
  }
]

if (typeof module !== "undefined") module.exports = { ART: ART, EPISODES: EPISODES }
