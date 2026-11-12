.pragma library

// Isla 2: más historias en la isla del náufrago (zona island).
// See EPISODES.md for the format; ART names use this pack's own prefix.
// Landmarks (offsets from the middle of the sand, y = 0 is the ground):
// palm -136 (top ~-58), dog -78 (centre y -16), astronaut -18 (centre -26),
// fire +34, cat +66, star jar +76..+90, tent +116, edges ±192, dome ~-135.

var ART = {
  // ---------------------------------------------------------- octopus
  i2_octo: {
    colors: { u: "#b46ee0", v: "#7a3fa8" },
    rows: [
      "...KKKKKK...",
      "..KuuuuuuK..",
      ".KuuuuuuuuK.",
      ".KuWKuuWKuK.",
      ".KuWKuuWKuK.",
      ".KuuuuuuuuK.",
      "..KvuvvuvK..",
      ".KuKuKKuKuK.",
      "Ku.Ku..uK.uK",
      "u..u....u..u"
    ]
  },
  i2_rod: [
    "........W",
    ".......T.",
    "......T..",
    ".....T...",
    "....T....",
    "...T.....",
    "..T......",
    ".KK......",
    "KK......."
  ],

  // ---------------------------------------------------------- birthday
  i2_cake0: {
    colors: { h: "#7a4a2a" },
    rows: [
      "..Y...O..",
      "..O.Y.Y..",
      "..R.A.L..",
      "..R.A.L..",
      ".KKKKKKK.",
      "KWPWPWPWK",
      "KPPPPPPPK",
      "KhhhhhhhK",
      "KPPPPPPPK",
      ".KKKKKKK."
    ]
  },
  i2_cake1: {
    colors: { h: "#7a4a2a" },
    rows: [
      "..O.Y....",
      "..Y.O.O..",
      "..R.A.L..",
      "..R.A.L..",
      ".KKKKKKK.",
      "KWPWPWPWK",
      "KPPPPPPPK",
      "KhhhhhhhK",
      "KPPPPPPPK",
      ".KKKKKKK."
    ]
  },
  i2_cakeOut: {
    colors: { h: "#7a4a2a" },
    rows: [
      ".........",
      "..K.K.K..",
      "..R.A.L..",
      "..R.A.L..",
      ".KKKKKKK.",
      "KWPWPWPWK",
      "KPPPPPPPK",
      "KhhhhhhhK",
      "KPPPPPPPK",
      ".KKKKKKK."
    ]
  },
  i2_balloonR: {
    colors: { r: "#a8323a" },
    rows: [".RRR.", "RWRRR", "RRRRr", "RRRRr", ".rrr.", "..r..", "..G.."]
  },
  i2_balloonA: { rows: [".AAA.", "AWAAA", "AAAAa", "AAAAa", ".aaa.", "..a..", "..G.."] },
  i2_balloonY: { rows: [".YYY.", "YWYYY", "YYYYC", "YYYYC", ".CCC.", "..C..", "..G.."] },

  // ---------------------------------------------------------- campfire
  // Covers the island's fire sprite (5 x 6) with a doused, smoking heap.
  i2_ashes: {
    colors: { g: "#5c5f73", h: "#3a3b4a" },
    rows: [".hgh.", ".ghg.", ".gGg.", "hgKgh", "TTTTT", ".T.T."]
  },
  i2_sticks: ["T....T.", ".T..T..", "TTTTTTT", "..TT..T"],

  // ---------------------------------------------------------- neighbour
  i2_isle: [
    "..LLL.LL........",
    ".LL.lLl.LL......",
    "....lT..........",
    ".....T..........",
    ".....T..........",
    "SSSSSTSSSSSSSSSS",
    "sMMMMMMMMMMMMMMs",
    ".mMMMMMMMMMMMMm.",
    "...mmMMMMMMmm...",
    ".....mmMMmm.....",
    ".......mm......."
  ],
  i2_alien0: {
    colors: { g: "#7fe08a", h: "#3f9a55" },
    rows: [
      "..K...K..",
      "..g...g..",
      "..KgggK..",
      ".KgWggWK.",
      ".KgKggKK.",
      ".KggggK..",
      "..KhhK...",
      ".gKggKg..",
      "..g..g..."
    ]
  },
  i2_alien1: {
    colors: { g: "#7fe08a", h: "#3f9a55" },
    rows: [
      "..K...K.g",
      "..g...g.g",
      "..KgggKg.",
      ".KgWggWK.",
      ".KgKggKK.",
      ".KggggK..",
      "..KhhK...",
      ".gKggK...",
      "..g..g..."
    ]
  },

  // ---------------------------------------------------------- ants
  i2_ant0: { colors: { r: "#c44a3a" }, rows: ["....K", "rr.rr", "K.K.K"] },
  i2_ant1: { colors: { r: "#c44a3a" }, rows: ["....K", "rr.rr", ".K.K."] },
  i2_jar: [".KKKK.", ".KTTK.", "KBBBBK", "KBYBBK", "KBBYBK", "KYBBYK", "KBYBBK", ".KKKK."],
  i2_jarEmpty: [".KKKK.", ".K..K.", "KBBBBK", "KBBBBK", "KBBBBK", "KBBBBK", "KBBBBK", ".KKKK."],

  // ---------------------------------------------------------- guitar
  i2_guitar: {
    colors: { w: "#d9893a" },
    rows: [
      ".wC........",
      "wwCC.......",
      "wKwCNNNNNKK",
      "wwCC.......",
      ".wC........"
    ]
  },
  i2_dogHowl: [
    "........SK.",
    ".......SSS.",
    "......SSKS.",
    ".....TSSSS.",
    "..S...RRR..",
    ".S...SSSS..",
    "..SSSSSSS..",
    "..SSSSSSSS.",
    "..STSSSTSS.",
    "..SS.S.SS.."
  ],

  // ---------------------------------------------------------- fossil
  i2_bone: ["W....W", "WWWWWW", "W....W"],
  i2_fossil0: [
    ".KKKKK..................",
    "KWWWWWK.................",
    "KWKWWWWK................",
    "KWWWWWWWK.....KKKKK.....",
    ".KWKWKWWWKKKKKWWWWWKK...",
    "..K.K.KWWWWWWWWWWWWWWKK.",
    "......KWKWKWKWKWKWWKKWWK",
    ".......KWKWKWKWKWKK..KWK",
    "........K.K.KWWK.K....K.",
    "............KWK.........",
    "...........KWWK.........",
    "...........KKKK........."
  ],
  i2_fossil1: [
    ".KKKKK..................",
    "KWWWWWK.................",
    "KWKWWWWK................",
    ".KWWWWWWK.....KKKKK.....",
    "...K.KWWWKKKKKWWWWWKK...",
    "......KWWWWWWWWWWWWWWKK.",
    ".KWKWKKWKWKWKWKWKWWKKWWK",
    "KWWWWWWKKWKWKWKWKWKK.KWK",
    ".KKKKK..K.K.KWWK.K....K.",
    "............KWK.........",
    "...........KWWK.........",
    "...........KKKK........."
  ],

  // ---------------------------------------------------------- bird
  i2_bird0: {
    colors: { q: "#3aa7c4" },
    rows: [
      "..K.....",
      ".KQK....",
      "KQqQK.K.",
      ".KQQQKWK",
      "..KQQQQY",
      "...KKK.."
    ]
  },
  i2_bird1: {
    colors: { q: "#3aa7c4" },
    rows: [
      "........",
      "......K.",
      "..KKKKWK",
      ".KQQQQQY",
      "KQqQKKK.",
      ".KQK....",
      "..K....."
    ]
  },
  i2_birdSit: {
    colors: { q: "#3aa7c4" },
    rows: ["....KK..", "...KQWK.", ".KKQQQY.", "KqQQQQK.", ".KKKKK.."]
  },
  i2_twig: ["T.T..", ".TTTT"],
  i2_nest1: ["T..T...T", ".TTcT.T."],
  i2_nest2: ["TT.cT.TT", ".TTcTTT.", "..TTT..."],
  i2_nest3: ["TcT.cTcT", "TTTcTTTT", ".TcTTcT.", "..TTTT.."],
  i2_egg: [".WW.", "WWGW", "WGWW", ".WW."],
  i2_chick: ["..YY.", ".YKYO", "YYYY.", "WYYW.", ".WW.."],

  // ---------------------------------------------------------- snowman
  i2_snow1: [
    "...KKKK...",
    ".KKWWWWKK.",
    "KWWWWWWWGK",
    "KWWKWWWWGK",
    "KWWWWWWWGK",
    "KWWKWWWWGK",
    "KWWWWWWGGK",
    ".KGGWWGGK.",
    "...KKKK..."
  ],
  i2_snow2: [
    "T..KKKK..T",
    ".TKRRRRK.T",
    "..TRRRRRT.",
    ".KWWKWWWGK",
    ".KWWWWWWGK",
    ".KWWKWWGGK",
    "..KGGGGK.."
  ],
  i2_snowHead: [
    "..KKKK..",
    ".KWWWWK.",
    "KWKWWKWK",
    "KWWWWOOO",
    "KWKKKWGK",
    ".KGGGGK."
  ],
  i2_hat: ["..KKKK..", "..KNNK..", "..KRRK..", "KKKKKKKK"],

  // ---------------------------------------------------------- asado
  i2_grill: {
    colors: { h: "#7a2f2a" },
    rows: [
      "..hhh.RR.",
      ".hhhhRRR.",
      "NnNnNnNnN",
      "KNNNNNNNK",
      ".K.....K.",
      "K.......K"
    ]
  },
  i2_chori: { colors: { h: "#7a2f2a" }, rows: [".CCCC.", "ChhhhC", ".CCCC."] },
  i2_flag: ["AWAWWW", "AAAWWW", "RRRRRR", "RRRRRR"],
  i2_pole: ["W", "n", "n", "n", "n", "n", "n", "n", "n", "n", "n", "n", "n", "n", "n", "n", "n", "n", "n", "n", "n", "n"],

  // ---------------------------------------------------------- vendor
  i2_robot0: [
    "....K....",
    "....R....",
    ".KKKKKKK.",
    ".KnnnnnK.",
    ".KnQnQnK.",
    ".KnnnnnK.",
    ".KnKKKnK.",
    "..KKKKK..",
    "KNNNNNNNK",
    "n.NYNRN.n",
    "K.NNNNN.K",
    "..KNNNK..",
    "...KKK..."
  ],
  i2_robot1: [
    "....K....",
    "....Y....",
    ".KKKKKKK.",
    ".KnnnnnK.",
    ".KnQnQnK.",
    ".KnnnnnK.",
    ".KnnKnnK.",
    "..KKKKK..",
    "KNNNNNNNK",
    "n.NRNYN.n",
    "K.NNNNN.K",
    "..KNNNK..",
    "...KKK..."
  ],
  i2_duck: ["...YY.", "..YYKO", "Y.YYY.", "YYYYY.", ".YYY.."],
  i2_sock: ["RR..", "WW..", "RR..", "WW..", "RRRR", ".RRR"],
  i2_cube: ["KKKKKK", "KRYAWK", "KLRYAK", "KAWLRK", "KYALWK", "KKKKKK"],
  i2_gem: ["..Q..", ".QWQ.", "QQWQQ", ".QQQ.", "..Q.."],

  // ---------------------------------------------------------- sandstorm
  i2_tumble: {
    colors: { b: "#a07a45", d: "#6e5230" },
    rows: [".dbbd..", "db.d.bd", "b.dbd.b", "bd.b.db", "b.dbd.b", "db.d.bd", ".dbbd.."]
  },
  i2_leaf: ["...LL", ".LLl.", "LLl..", "l...."]
}

// Hops along the ground through x positions at height `y`: a keyframe
// every `step` seconds per ~40 px, facing where it goes next.
function hop(xs, t0, step, y) {
  var out = [{ t: t0, x: xs[0], y: y, flip: xs[1] < xs[0] }], t = t0
  for (var i = 1; i < xs.length; i++) {
    var from = xs[i - 1], to = xs[i], n = Math.max(1, Math.round(Math.abs(to - from) / 40))
    for (var k = 1; k <= n; k++) {
      t += step
      var left = k < n ? to < from : (i + 1 < xs.length ? xs[i + 1] < to : false)
      out.push({ t: t, x: from + (to - from) * k / n, y: y, arc: 12, ease: "linear", flip: left })
    }
  }
  return out
}

// Little jumps in place.
function bounce(x, y, t0, t1, step, h) {
  var out = [{ t: t0, x: x, y: y }]
  for (var t = t0 + step; t <= t1 + 1e-6; t += step) out.push({ t: t, x: x, y: y, arc: h, ease: "linear" })
  return out
}

// Rolling hops from x0 to the right: `n` bounces of `dx` px each.
function roll(x0, y, t0, step, n, dx, h) {
  var out = [{ t: t0, x: x0, y: y, rot: 0 }]
  for (var i = 1; i <= n; i++) out.push({ t: t0 + i * step, x: x0 + i * dx, y: y, arc: h, ease: "linear", rot: i * 300 })
  return out
}

// A glyph that pops up over someone's head.
function glyph(id, text, x, y, t0, t1, color) {
  return { id: id, text: text, size: 20, color: color || "#ffd65a", show: [t0, t1], fade: [0.2, 0.3],
    path: [{ t: t0, x: x, y: y + 6 }, { t: t0 + 0.4, x: x, y: y, ease: "out" }] }
}

// Garland from the palm top to a pole by the tent (sagging rope), and the
// flags hanging from it at fractions u along it.
var GARLAND = { x1: -132, y1: -62, x2: 166, y2: -82, sag: 6 }
function flag(i, u) {
  var g = GARLAND
  var x = g.x1 + (g.x2 - g.x1) * u, y = g.y1 + (g.y2 - g.y1) * u + Math.sin(Math.PI * u) * g.sag
  return { id: "flag" + i, sprite: "i2_flag", px: 3, fade: [1 + i * 0.25, 1.5], show: [0.5, 34],
    path: [{ t: 0, x: Math.round(x), y: Math.round(y + 7) }],
    wobble: { rot: 8, speed: 2 + i * 0.3, x: 1, phase: i } }
}

// Ants: march in from the right to the jar, carry it to the palm side and back.
function ant(i, off) {
  var arrive = 4 + i * 0.6
  return { id: "ant" + i, frames: ["i2_ant0", "i2_ant1"], fps: 6, px: 3, show: [i * 0.6, 40], fade: [0.4, 1],
    path: [
      { t: i * 0.6, x: 200, y: -5, flip: true },
      { t: arrive, x: 83 + off, y: -5, ease: "linear", flip: true },
      { t: 7, x: 83 + off, y: -5 },
      { t: 8, x: off, y: 20, on: "jar" },
      { t: 16, x: off, y: 20, on: "jar" },
      { t: 17, x: -150 + off * 1.4, y: -5, flip: off < 0 }
    ].concat(bounce(-150 + off * 1.4, -5, 17.5 + i * 0.15, 23.5, 1, 10), [
      { t: 24.5, x: off, y: 20, on: "jar", flip: false },
      { t: 33, x: off, y: 20, on: "jar" },
      { t: 34, x: 83 + off, y: -5 },
      { t: 34.6 + i * 0.3, x: 83 + off, y: -5 },
      { t: 39, x: 230, y: -5, ease: "in" }
    ]),
    wobble: { y: 1, speed: 14, phase: i } }
}

var EPISODES = [
  // 6
  {
    id: "octoRod",
    title: "Un pulpo espacial se roba la caña",
    zone: "island",
    length: 26,
    island: { scene: "idle" },
    actors: [
      { id: "rod", sprite: "i2_rod", px: 3, show: [0, 26], fade: [0.6, 0],
        path: [
          { t: 0, x: 8, y: -42 },
          { t: 7.6, x: 8, y: -42 },
          { t: 8.6, x: 70, y: -30, arc: 18, ease: "in", rot: 40 },
          { t: 10.4, x: 175, y: -6, rot: 90 },
          { t: 11.4, x: -28, y: -6, on: "octo", rot: 120 },
          { t: 13.4, x: -28, y: -6, on: "octo" },
          { t: 16.8, x: 28, y: -10, on: "octo2", rot: -30 },
          { t: 26, x: 28, y: -10, on: "octo2" }
        ],
        wobble: [{ from: 0, to: 7.4, rot: 3, speed: 1.5 }] },
      { id: "octo", sprite: "i2_octo", show: [2, 13.4], fade: [1, 0.6],
        path: [
          { t: 2, x: 222, y: 170 },
          { t: 5, x: 220, y: 22, ease: "out" },
          { t: 11.4, x: 216, y: 24 },
          { t: 13.4, x: 222, y: 170, ease: "in" }
        ],
        wobble: [{ from: 5, to: 11.4, y: 4, speed: 2.2, rot: 5 }] },
      { id: "tip", path: [
          { t: 5.4, x: 200, y: 30 },
          { t: 7.6, x: 8, y: -42, ease: "inOut", arc: 50 },
          { t: 7.7, x: 0, y: 0, on: "rod" }
        ] },
      { id: "octo2", sprite: "i2_octo", show: [15, 25], fade: [1, 1.2],
        path: [
          { t: 15, x: -222, y: 170 },
          { t: 17.5, x: -220, y: 18, ease: "out" },
          { t: 22.5, x: -220, y: 18 },
          { t: 25, x: -222, y: 170, ease: "in" }
        ],
        wobble: [{ from: 17.5, to: 22.5, rot: 10, speed: 3, y: 4, x: 3 }] },
      glyph("wow", "!", -18, -76, 8.2, 10.6),
      glyph("huh", "?", -18, -76, 13.6, 16.4, "#dfe8ff"),
      glyph("wow2", "!", -18, -76, 18, 20)
    ],
    ropes: [
      { a: "octo", b: "tip", sag: -14, color: "#b46ee0", aOffset: [-14, 14], show: [5.4, 13.4] },
      { a: "octo", b: "tip", sag: -10, color: "#7a3fa8", aOffset: [-12, 17], bOffset: [2, 3], show: [5.4, 13.4] }
    ],
    bursts: [{ at: "octo", t: 12.6, duration: 0.8, count: 3, size: 22, colors: ["#b46ee0", "#e8c8ff"], spread: 16 }],
    particles: [
      { at: "octo2", from: 18.5, to: 23, style: "rise", glyph: "♥", color: "#e08ae8", count: 3, rate: 0.6, height: 50, offset: [0, -24] },
      { at: "octo", from: 5, to: 7, style: "rise", glyph: "?", color: "#e8c8ff", count: 1, rate: 0.6, height: 30, offset: [0, -24] }
    ]
  },

  // 7
  {
    id: "islandBirthday",
    title: "Cumpleaños en la isla",
    zone: "island",
    length: 30,
    island: { scene: "wave" },
    actors: [
      { id: "cake", frames: ["i2_cake0", "i2_cake1"], fps: 5, px: 3, show: [0.5, 14], fade: [0.4, 0],
        path: [{ t: 0.5, x: 14, y: -15, scale: 0.3 }, { t: 1.3, x: 14, y: -15, scale: 1, ease: "out" }] },
      { id: "cakeOut", sprite: "i2_cakeOut", px: 3, show: [14, 30], fade: [0, 1.5], path: [{ t: 0, x: 14, y: -15 }] },
      { id: "knot", path: [{ t: 0, x: 116, y: -22 }] },
      { id: "bR", sprite: "i2_balloonR", px: 4, show: [1, 30], fade: [1, 0],
        path: [{ t: 1, x: 116, y: -30, scale: 0.4 }, { t: 3, x: 98, y: -96, ease: "out", scale: 1 },
               { t: 18, x: 98, y: -96 }, { t: 28, x: 40, y: -520, ease: "in" }],
        wobble: { x: 6, xspeed: 0.7, y: 4, speed: 1.1, rot: 8 } },
      { id: "bA", sprite: "i2_balloonA", px: 4, show: [1.6, 30], fade: [1, 0],
        path: [{ t: 1.6, x: 116, y: -30, scale: 0.4 }, { t: 3.6, x: 122, y: -110, ease: "out", scale: 1 },
               { t: 18.3, x: 122, y: -110 }, { t: 28, x: 170, y: -540, ease: "in" }],
        wobble: { x: 5, xspeed: 0.9, y: 5, speed: 0.9, rot: 8, phase: 2 } },
      { id: "bY", sprite: "i2_balloonY", px: 4, show: [2.2, 30], fade: [1, 0],
        path: [{ t: 2.2, x: 116, y: -30, scale: 0.4 }, { t: 4.2, x: 144, y: -90, ease: "out", scale: 1 },
               { t: 18.6, x: 144, y: -90 }, { t: 28, x: 260, y: -500, ease: "in" }],
        wobble: { x: 6, xspeed: 0.8, y: 4, speed: 1.3, rot: 8, phase: 4 } },
      { id: "candles", path: [{ t: 0, x: 14, y: -28 }] },
      { id: "singer", path: [{ t: 0, x: -18, y: -64 }] },
      glyph("wow", "!", -18, -80, 18.6, 21)
    ],
    ropes: [
      { a: "knot", b: "bR", sag: 6, color: "#d8e6ff", bOffset: [0, 14], show: [1, 18] },
      { a: "knot", b: "bA", sag: 6, color: "#d8e6ff", bOffset: [0, 14], show: [1.6, 18.3] },
      { a: "knot", b: "bY", sag: 6, color: "#d8e6ff", bOffset: [0, 14], show: [2.2, 18.6] }
    ],
    bursts: [
      { at: "candles", t: 14, duration: 1.2, count: 5, size: 40, colors: ["#ff8fa8", "#ffd65a", "#7df9ff"], spread: 40 }
    ],
    particles: [
      { at: "singer", from: 3, to: 13, style: "rise", glyph: "♪", color: ["#ffd65a", "#ffffff"], count: 4, rate: 0.6, height: 60 },
      { at: "candles", from: 14, to: 16.5, style: "smoke", count: 4, rate: 1.4, drift: [8, -40], size: 0.4, color: "#c8cce0" },
      { region: { x: -150, y: -200, w: 300, h: 30 }, style: "fall", from: 14, to: 19, count: 24, rate: 0.5, height: 180, size: 1.2,
        color: ["#ff8fa8", "#ffd65a", "#7df9ff", "#3fae6a"] },
      { at: "cakeOut", from: 21.5, to: 28, style: "rise", glyph: "♥", color: "#ff8fa8", count: 3, rate: 0.5, height: 60, offset: [0, -20] }
    ]
  },

  // 10
  {
    id: "fireOut",
    title: "Se apaga la fogata y el perro trae ramas",
    zone: "island",
    length: 30,
    island: { scene: "idle", hide: { dog: [5.5, 25] } },
    actors: [
      { id: "fire", path: [{ t: 0, x: 34, y: -24 }] },
      { id: "ashes", sprite: "i2_ashes", show: [2.4, 18.2], fade: [0.5, 0.2], path: [{ t: 0, x: 34, y: -8 }] },
      glyph("huh", "?", -18, -76, 3.2, 5.4, "#dfe8ff"),
      glyph("bark", "!", -78, -58, 4.4, 5.8),
      { id: "dog", sprite: "dog", show: [5.5, 25],
        path: hop([-78, -178], 5.5, 0.4, -16).concat([
          { t: 7.4, x: -232, y: 30, arc: 22, ease: "linear", o: 0, flip: true },
          { t: 11.6, x: -232, y: 30, o: 0, flip: false },
          { t: 12.4, x: -178, y: -16, arc: 22, ease: "linear", o: 1, flip: false }
        ], hop([-178, 4], 12.4, 0.4, -16).slice(1), [
          { t: 15.4, x: 4, y: -16 },
          { t: 22, x: 4, y: -16, flip: true },
          { t: 22.6, x: -37, y: -16, arc: 12, ease: "linear", flip: true },
          { t: 23.2, x: -78, y: -16, arc: 12, ease: "linear", flip: false }
        ]),
        wobble: [{ from: 16.5, to: 20.5, rot: 8, speed: 10 }] },
      { id: "sticks", sprite: "i2_sticks", px: 3, show: [12.2, 18.6], fade: [0.3, 0.4],
        path: [
          { t: 12.2, x: 16, y: -10, on: "dog" },
          { t: 15.4, x: 16, y: -10, on: "dog" },
          { t: 16.2, x: 34, y: -6, arc: 14, ease: "linear" }
        ] },
      { id: "warm", path: [{ t: 0, x: -18, y: -64 }] }
    ],
    bursts: [
      { at: "fire", t: 2.2, duration: 1, count: 3, size: 26, colors: ["#8a8ea8", "#c8cce0"], spread: 8 },
      { at: "fire", t: 18, duration: 1, count: 4, size: 34, colors: ["#ff9447", "#ffd65a"], spread: 10 }
    ],
    particles: [
      { at: "fire", from: 2.4, to: 18, style: "smoke", count: 6, rate: 0.7, drift: [10, -60], size: 0.6, color: ["#8a8ea8", "#5c5f73"] },
      { at: "fire", from: 18, to: 21, style: "sparks", count: 10, rate: 2.5, radius: 26, color: ["#ffd65a", "#ff9447"] },
      { at: "warm", from: 19, to: 24, style: "rise", glyph: "♥", color: "#ff8fa8", count: 3, rate: 0.6, height: 50 }
    ]
  },

  // 11
  {
    id: "neighbor",
    title: "Pasa un vecino en su propia isla",
    zone: "island",
    length: 34,
    island: { scene: "wave" },
    actors: [
      { id: "isle", sprite: "i2_isle", px: 4, fade: [2, 2],
        path: [
          { t: 0, x: -640, y: -200 },
          { t: 13, x: -50, y: -190, ease: "out" },
          { t: 21, x: 50, y: -190, ease: "linear" },
          { t: 34, x: 640, y: -205, ease: "in" }
        ],
        wobble: { y: 6, speed: 0.8, rot: 3 } },
      { id: "alien", frames: ["i2_alien0", "i2_alien1"], fps: 3, px: 3, fade: [2, 2],
        path: [{ t: 0, x: 16, y: -12, on: "isle" }] },
      { id: "me", path: [{ t: 0, x: -18, y: -66 }] }
    ],
    particles: [
      { at: "alien", from: 12, to: 22, style: "rise", glyph: "♥", color: "#7fe08a", count: 3, rate: 0.5, height: 50, offset: [0, -14] },
      { at: "me", from: 13, to: 23, style: "rise", glyph: "♥", color: "#ff8fa8", count: 3, rate: 0.5, height: 50 },
      { at: "isle", from: 0, to: 34, style: "twinkle", count: 5, rate: 0.6, color: ["#7df9ff", "#fff6c0"], offset: [0, 30] }
    ]
  },

  // 12
  {
    id: "antsJar",
    title: "Hormigas espaciales cargan la jarra de estrellas",
    zone: "island",
    length: 40,
    island: { scene: "idle", hide: { jar: [4, 34.6] } },
    actors: [
      { id: "jar", swap: [[0, "i2_jar"], [18, "i2_jarEmpty"]], px: 4, show: [3.5, 35], fade: [0.6, 0.8],
        path: [
          { t: 3.5, x: 83, y: -16 },
          { t: 7, x: 83, y: -16 },
          { t: 8, x: 83, y: -30, ease: "out" },
          { t: 16, x: -150, y: -30, ease: "linear" },
          { t: 17, x: -150, y: -16, ease: "in" },
          { t: 24, x: -150, y: -16 },
          { t: 24.5, x: -150, y: -30, ease: "out" },
          { t: 33, x: 83, y: -30, ease: "linear" },
          { t: 34, x: 83, y: -16, ease: "in" }
        ],
        wobble: [{ from: 8, to: 16, rot: 6, speed: 4, y: 2 }, { from: 24.5, to: 33, rot: 6, speed: 4, y: 2 }] },
      ant(0, -10), ant(1, -3), ant(2, 4), ant(3, 11),
      { id: "lid", path: [{ t: 0, x: 0, y: -18, on: "jar" }] },
      glyph("wow", "!", -18, -76, 17.6, 20),
      glyph("huh", "?", 66, -50, 3, 5.5, "#dfe8ff")
    ],
    particles: [
      { at: "lid", from: 17.5, to: 23, style: "rise", glyph: "*", color: ["#ffe680", "#fff6c0"], count: 8, rate: 0.7, height: 110 },
      { region: { x: -200, y: -150, w: 160, h: 70 }, style: "twinkle", from: 19, to: 26, count: 10, rate: 0.5, color: ["#ffe680", "#fff6c0"] },
      { at: "lid", from: 21, to: 24, style: "rise", glyph: "♥", color: "#ff8fa8", count: 2, rate: 0.6, height: 50 }
    ]
  },

  // 13
  {
    id: "astroGuitar",
    title: "El astronauta toca guitarra y el perro aúlla",
    zone: "island",
    length: 26,
    island: { scene: "idle", hide: { astronaut: [0, 26], dog: [5, 22] } },
    actors: [
      { id: "astro", sprite: "astronaut", path: [{ t: 0, x: -18, y: -26 }],
        wobble: [{ from: 1, to: 13, rot: 4, speed: 3 }, { from: 15, to: 25, rot: 4, speed: 3.4 }] },
      { id: "guitar", sprite: "i2_guitar", px: 3, show: [0, 25.5], fade: [0.8, 0.6],
        path: [{ t: 0, x: 4, y: 4, on: "astro", rot: -24 }],
        wobble: [{ from: 1, to: 13, y: 1.5, speed: 9, rot: 4 }, { from: 15, to: 25, y: 1.5, speed: 10, rot: 4 }] },
      { id: "dog", swap: [[0, "dog"], [8, "i2_dogHowl"], [12, "dog"], [16, "i2_dogHowl"], [21, "dog"]], show: [5, 22],
        path: [{ t: 0, x: -78, y: -16 }],
        wobble: [{ from: 8, to: 12, rot: 3, speed: 6 }, { from: 16, to: 21, rot: 3, speed: 6 }] },
      { id: "snout", path: [{ t: 0, x: -64, y: -40 }] },
      glyph("stop", "!", -18, -76, 12.4, 14.6),
      glyph("bark", "?", -78, -56, 12.6, 14.6, "#dfe8ff")
    ],
    particles: [
      { at: "guitar", from: 1.5, to: 12.5, style: "rise", glyph: "♪", color: ["#ffd65a", "#ffffff"], count: 4, rate: 0.7, height: 70 },
      { at: "guitar", from: 15, to: 24.5, style: "rise", glyph: "♪", color: ["#ffd65a", "#ffffff"], count: 4, rate: 0.8, height: 70 },
      { at: "snout", from: 8.3, to: 12, style: "rise", glyph: "♪", color: "#9fd8ff", count: 3, rate: 0.8, height: 60 },
      { at: "snout", from: 16.3, to: 21, style: "rise", glyph: "♪", color: "#9fd8ff", count: 3, rate: 0.8, height: 60 },
      { at: "snout", from: 21.5, to: 25, style: "rise", glyph: "♥", color: "#ff8fa8", count: 2, rate: 0.6, height: 50 }
    ]
  },

  // 14
  {
    id: "whaleBite",
    title: "Pesca épica: pica una ballena",
    zone: "island",
    length: 32,
    island: { scene: "fish", hide: { rod: [19.6, 32] } },
    effects: { wind: [8, 20, -10] },
    actors: [
      { id: "tip", path: [{ t: 0, x: 36, y: -70 }] },
      { id: "whale", sprite: "whale", px: 4, show: [0, 25], fade: [2, 1.5],
        path: [
          { t: 0, x: 620, y: -420, flip: true },
          { t: 6, x: 230, y: -260, ease: "out", flip: true },
          { t: 9, x: 310, y: -220, flip: true },
          { t: 12, x: 270, y: -290, flip: true },
          { t: 15, x: 350, y: -250, flip: true },
          { t: 18, x: 290, y: -220, flip: true },
          { t: 19.6, x: 320, y: -260, flip: false },
          { t: 25, x: 900, y: -460, ease: "in", flip: false }
        ],
        wobble: [{ from: 6.5, to: 19.5, x: 10, xspeed: 3, y: 8, speed: 4, rot: 8 }] },
      { id: "mouth", path: [{ t: 0, x: 52, y: 6, on: "whale" }] },
      glyph("wow", "!", -18, -80, 6.6, 9),
      { id: "wow2", text: "!", size: 24, color: "#ff8fa8", show: [9, 19.5], blink: { every: 1.2, dur: 0.7 },
        path: [{ t: 0, x: -18, y: -82 }] },
      glyph("huh", "?", -18, -80, 21, 24, "#dfe8ff"),
      { id: "small", sprite: "fish", px: 3, show: [25, 31.5], fade: [0.5, 1],
        path: [
          { t: 25, x: 186, y: -280 },
          { t: 27.5, x: 40, y: -70, ease: "in" },
          { t: 28.5, x: 62, y: -50, arc: 20, ease: "out" }
        ] },
      { id: "fishPt", path: [{ t: 0, x: 62, y: -60 }] }
    ],
    ropes: [{ a: "tip", b: "mouth", sag: 4, color: "#d8e6ff", show: [6, 19.6] }],
    bursts: [{ at: "mouth", t: 19.5, duration: 0.8, count: 4, size: 26, colors: ["#ffffff", "#7df9ff"], spread: 10 }],
    particles: [
      { at: "whale", from: 20, to: 24.5, style: "spout", count: 10, rate: 1.4, offset: [30, -22], color: ["#9fe3ff", "#ffffff"] },
      { at: "whale", from: 8, to: 19, style: "sparks", count: 8, rate: 1.6, radius: 40, offset: [-40, 0], color: ["#9fe3ff", "#ffffff"] },
      { at: "fishPt", from: 28.5, to: 31.5, style: "rise", glyph: "♥", color: "#ff8fa8", count: 2, rate: 0.7, height: 40 }
    ]
  },

  // 15
  {
    id: "dogFossil",
    title: "El perro desentierra un fósil de dinosaurio",
    zone: "island",
    length: 30,
    island: { scene: "idle", hide: { dog: [0, 23.5] } },
    actors: [
      { id: "dog", sprite: "dog",
        show: [0, 23.5],
        path: [
          { t: 0, x: -78, y: -16, flip: true },
          { t: 0.8, x: -86, y: -16, arc: 10, ease: "linear", flip: true },
          { t: 16.5, x: -86, y: -16, flip: true },
          { t: 17, x: -78, y: -16, flip: false },
          { t: 18.5, x: -78, y: -16, flip: false },
          { t: 18.9, x: -50, y: -16, arc: 16, ease: "linear", flip: false },
          { t: 20.5, x: -50, y: -16, flip: true },
          { t: 21.5, x: -78, y: -16, arc: 10, ease: "linear", flip: false }
        ],
        wobble: [{ from: 3, to: 5, rot: 12, speed: 16, y: 2 }, { from: 7, to: 11, rot: 14, speed: 16, y: 2 },
                 { from: 18.5, to: 20.5, x: 2, speed: 30 }] },
      { id: "bone", sprite: "i2_bone", px: 3, show: [0, 5], fade: [0, 1.4],
        path: [
          { t: 0, x: 14, y: -10, on: "dog" },
          { t: 2, x: 14, y: -10, on: "dog" },
          { t: 2.6, x: -110, y: -2, arc: 12, ease: "linear" },
          { t: 5, x: -110, y: 6 }
        ] },
      { id: "hole", path: [{ t: 0, x: -110, y: -2 }] },
      glyph("wow", "!", -86, -58, 11.2, 13.4),
      { id: "fossil", swap: [[0, "i2_fossil0"], [14.6, "i2_fossil1"], [15, "i2_fossil0"], [15.6, "i2_fossil1"], [16, "i2_fossil0"]],
        px: 4, show: [11, 23], fade: [1, 1.2], glow: { r: 56, color: "#fff6c0", a: 0.1 },
        path: [
          { t: 11, x: -110, y: 0, scale: 0.3 },
          { t: 13.5, x: -96, y: -104, ease: "out", scale: 1 },
          { t: 20, x: -96, y: -104 },
          { t: 23, x: -110, y: -20, ease: "in", scale: 0.3, o: 0 }
        ],
        wobble: [{ from: 13.5, to: 20, y: 5, speed: 1.6, rot: 3 }] },
      glyph("eek", "!", -78, -58, 15, 17.5, "#ff8fa8"),
      glyph("astro", "!", -18, -76, 13.6, 16)
    ],
    particles: [
      { at: "hole", from: 3, to: 5, style: "sparks", count: 8, rate: 2.4, radius: 24, color: ["#c9a86a", "#e9cf93"], size: 1.3 },
      { at: "hole", from: 7, to: 11.5, style: "sparks", count: 12, rate: 2.6, radius: 30, color: ["#c9a86a", "#8a5a35"], size: 1.3 },
      { at: "fossil", from: 13, to: 19, style: "twinkle", count: 6, rate: 0.7, offset: [0, -10], color: ["#fff6c0", "#ffffff"] },
      { at: "dog", from: 22, to: 27, style: "rise", glyph: "♥", color: "#ff8fa8", count: 3, rate: 0.6, height: 50, offset: [0, -20] }
    ]
  },

  // 16
  {
    id: "birdNest",
    title: "Un pájaro espacial anida en la palmera",
    zone: "island",
    when: { home: ["island"] },
    length: 32,
    island: { scene: "stargaze" },
    actors: [
      { id: "nest", swap: [[0, "i2_nest1"], [9.5, "i2_nest2"], [15.5, "i2_nest3"]], px: 3, show: [4.2, 32], fade: [0.3, 1.5],
        path: [{ t: 0, x: -136, y: -63 }] },
      { id: "bird", frames: ["i2_bird0", "i2_bird1"], fps: 7, px: 3, show: [0, 17.5],
        path: [
          { t: 0, x: -560, y: -300 },
          { t: 4, x: -132, y: -76, ease: "out", arc: 40 },
          { t: 5, x: -132, y: -76 },
          { t: 7.5, x: -420, y: -220, ease: "in", flip: true },
          { t: 9.5, x: -132, y: -76, ease: "out", arc: 30, flip: false },
          { t: 10.3, x: -132, y: -76, flip: false },
          { t: 13, x: 160, y: -230, ease: "in", flip: false },
          { t: 15.5, x: -132, y: -76, ease: "out", arc: 30, flip: true },
          { t: 17.5, x: -134, y: -72, flip: true }
        ],
        wobble: { y: 3, speed: 5 } },
      { id: "tw1", sprite: "i2_twig", px: 3, show: [0, 4.2], path: [{ t: 0, x: 8, y: 8, on: "bird" }] },
      { id: "tw2", sprite: "i2_twig", px: 3, show: [7.6, 9.6], path: [{ t: 0, x: 8, y: 8, on: "bird" }] },
      { id: "tw3", sprite: "i2_twig", px: 3, show: [13.2, 15.6], path: [{ t: 0, x: 8, y: 8, on: "bird" }] },
      { id: "sit", sprite: "i2_birdSit", px: 3, show: [17.5, 32], fade: [0, 1.5],
        path: [
          { t: 17.5, x: -134, y: -72, flip: true },
          { t: 21, x: -134, y: -72, flip: true },
          { t: 21.6, x: -118, y: -82, arc: 10, ease: "out", flip: true }
        ],
        wobble: [{ from: 17.5, to: 21, rot: 6, speed: 2 }] },
      { id: "egg", swap: [[0, "i2_egg"], [25, "i2_chick"]], px: 3, show: [21.5, 32], fade: [0, 1.5],
        path: [{ t: 21.5, x: -138, y: -70 }, { t: 25, x: -138, y: -70 }, { t: 25.4, x: -138, y: -74, arc: 6, ease: "out" }],
        wobble: [{ from: 22.5, to: 24.8, rot: 14, speed: 9 }] },
      glyph("wow", "!", -18, -82, 25, 27)
    ],
    bursts: [{ at: "egg", t: 24.9, duration: 0.8, count: 3, size: 20, colors: ["#ffffff", "#ffd65a"], spread: 8 }],
    particles: [
      { at: "egg", from: 25.5, to: 30, style: "rise", glyph: "♪", color: "#ffd65a", count: 2, rate: 0.7, height: 40 },
      { at: "sit", from: 26, to: 30.5, style: "rise", glyph: "♥", color: "#7df9ff", count: 2, rate: 0.6, height: 40 }
    ]
  },

  // 17
  {
    id: "snowman",
    title: "Muñeco de nieve en la isla",
    zone: "island",
    length: 30,
    when: { months: [12] },
    island: { scene: "idle" },
    actors: [
      { id: "base", sprite: "i2_snow1", px: 4, show: [1.5, 30], fade: [0.5, 2],
        path: [
          { t: 1.5, x: -188, y: -6, scale: 0.3, rot: 0 },
          { t: 9, x: 158, y: -18, scale: 1, ease: "inOut", rot: 900 }
        ] },
      { id: "mid", sprite: "i2_snow2", px: 4, show: [10.5, 30], fade: [0.3, 2],
        path: [{ t: 10.5, x: -4, y: -44, scale: 0.6 }, { t: 12, x: 158, y: -47, arc: 70, ease: "linear", scale: 1 }] },
      { id: "head", sprite: "i2_snowHead", px: 4, show: [13.5, 30], fade: [0.3, 2],
        path: [{ t: 13.5, x: -4, y: -44, scale: 0.6 }, { t: 15, x: 158, y: -70, arc: 70, ease: "linear", scale: 1 }] },
      { id: "hat", sprite: "i2_hat", px: 4, show: [16.5, 30], fade: [0.3, 2],
        path: [{ t: 16.5, x: -4, y: -44, rot: 0 }, { t: 18, x: 158, y: -88, arc: 80, ease: "linear", rot: 720 }] },
      glyph("yay", "!", 158, -110, 18.2, 20)
    ],
    particles: [
      { region: { x: -190, y: -150, w: 380, h: 30 }, style: "fall", count: 30, rate: 0.25, height: 160, color: ["#ffffff", "#dfe8ff"] },
      { at: "head", from: 19, to: 27, style: "rise", glyph: "♥", color: "#ff8fa8", count: 3, rate: 0.5, height: 50, offset: [0, -20] },
      { at: "base", from: 1.5, to: 9, style: "sparks", count: 6, rate: 2, radius: 14, offset: [0, 14], color: "#ffffff", size: 0.8, trail: true }
    ]
  },

  // 18
  {
    id: "asado",
    title: "Asado dieciochero",
    zone: "island",
    when: { home: ["island"] },
    length: 34,
    boost: { months: [9], weight: 6 },
    island: { scene: "idle" },
    actors: [
      { id: "palmTop", path: [{ t: 0, x: GARLAND.x1, y: GARLAND.y1 }] },
      { id: "pole", sprite: "i2_pole", px: 4, fade: [0.5, 1.5], show: [0.3, 34], path: [{ t: 0, x: GARLAND.x2, y: -40 }] },
      { id: "poleTop", path: [{ t: 0, x: GARLAND.x2, y: GARLAND.y2 }] },
      flag(0, 0.1), flag(1, 0.2), flag(2, 0.52), flag(3, 0.63), flag(4, 0.74), flag(5, 0.86),
      { id: "grill", sprite: "i2_grill", px: 4, show: [2, 34], fade: [0.6, 1.5], path: [{ t: 0, x: 34, y: -12 }] },
      { id: "chori", sprite: "i2_chori", px: 3, show: [3, 34], fade: [0.5, 1.5],
        path: [
          { t: 3, x: 30, y: -26 },
          { t: 11, x: 30, y: -26 },
          { t: 12, x: 30, y: -26, arc: 40, ease: "linear", rot: 360 },
          { t: 19, x: 30, y: -26 },
          { t: 20, x: 30, y: -26, arc: 40, ease: "linear", rot: 360 },
          { t: 25, x: 30, y: -26 },
          { t: 26.2, x: 0, y: -36, arc: 30, ease: "out", rot: 180 }
        ] },
      { id: "smokePt", path: [{ t: 0, x: 34, y: -30 }] },
      glyph("dog", "!", -78, -56, 12.2, 14),
      glyph("cat", "?", 66, -52, 20.2, 22, "#dfe8ff"),
      { id: "eater", path: [{ t: 0, x: -18, y: -66 }] }
    ],
    ropes: [{ a: "palmTop", b: "poleTop", sag: GARLAND.sag, color: "#eef0f7", show: [0.5, 34] }],
    particles: [
      { at: "smokePt", from: 2.5, to: 33, style: "smoke", count: 8, rate: 0.8, drift: [20, -70], size: 0.6, color: ["#a3a9c2", "#8a8ea8"] },
      { at: "smokePt", from: 3, to: 32, style: "sparks", count: 4, rate: 1.2, radius: 14, color: ["#ffd65a", "#ff9447"], size: 0.6 },
      { at: "eater", from: 4, to: 24, style: "rise", glyph: "♪", color: ["#ffffff", "#e2524a", "#3d6fd8"], count: 3, rate: 0.5, height: 60 },
      { at: "eater", from: 27, to: 32, style: "rise", glyph: "♥", color: "#ff8fa8", count: 3, rate: 0.6, height: 50 }
    ]
  },

  // 19
  {
    id: "robotVendor",
    title: "Un robot vendedor ofrece cosas raras",
    zone: "island",
    length: 36,
    island: { scene: "idle" },
    actors: [
      { id: "robot", frames: ["i2_robot0", "i2_robot1"], fps: 2, px: 4, fade: [1, 1],
        path: [
          { t: 0, x: 620, y: -320, flip: true },
          { t: 5, x: 70, y: -94, ease: "out", flip: true },
          { t: 30, x: 70, y: -94, flip: true },
          { t: 36, x: -700, y: -320, ease: "in", flip: true }
        ],
        wobble: { y: 4, speed: 2, rot: 3 } },
      { id: "jet", path: [{ t: 0, x: 0, y: 26, on: "robot" }] },
      { id: "duck", sprite: "i2_duck", px: 4, show: [6, 11], fade: [0.3, 0.3],
        path: [{ t: 6, x: 70, y: -86, scale: 0.3 }, { t: 6.6, x: 70, y: -132, ease: "out", scale: 1 }],
        wobble: { from: 6.6, to: 11, rot: 10, speed: 3 } },
      { id: "sock", sprite: "i2_sock", px: 4, show: [11.5, 16.5], fade: [0.3, 0.3],
        path: [{ t: 11.5, x: 70, y: -86, scale: 0.3 }, { t: 12.1, x: 70, y: -134, ease: "out", scale: 1 }],
        wobble: { from: 12.1, to: 16.5, rot: 12, speed: 4 } },
      { id: "cube", sprite: "i2_cube", px: 3, show: [17, 22], fade: [0.3, 0.3], spin: 40,
        path: [{ t: 17, x: 70, y: -86, scale: 0.3 }, { t: 17.6, x: 70, y: -132, ease: "out", scale: 1 }] },
      { id: "gem", sprite: "i2_gem", px: 4, show: [22.5, 36], fade: [0.3, 1.5], glow: { r: 40, color: "#7df9ff", a: 0.2 },
        path: [
          { t: 22.5, x: 70, y: -86, scale: 0.3 },
          { t: 23.1, x: 70, y: -132, ease: "out", scale: 1 },
          { t: 27, x: 70, y: -132 },
          { t: 28.5, x: -6, y: -40, arc: 30, ease: "inOut" }
        ],
        wobble: { y: 3, speed: 3 } },
      { id: "star", sprite: "i2_gem", px: 2, show: [27, 29], fade: [0.3, 0.3],
        path: [{ t: 27, x: 83, y: -10 }, { t: 28.8, x: 70, y: -80, arc: 20 }] },
      glyph("q1", "?", -18, -76, 7.5, 10.5, "#dfe8ff"),
      glyph("q2", "?", -18, -76, 13, 16, "#dfe8ff"),
      glyph("q3", "?", -18, -76, 18.5, 21.5, "#dfe8ff"),
      glyph("yes", "!", -18, -76, 24, 26.5),
      glyph("ok", "✓", 70, -126, 28.8, 30.5, "#7fe08a"),
      { id: "me", path: [{ t: 0, x: -18, y: -66 }] }
    ],
    particles: [
      { at: "jet", style: "smoke", count: 6, rate: 2.5, drift: [0, 14], size: 0.25, color: ["#ff9447", "#ffd65a"] },
      { at: "me", from: 29, to: 34, style: "rise", glyph: "♥", color: "#ff8fa8", count: 3, rate: 0.6, height: 50 }
    ]
  },

  // 20
  {
    id: "sandstorm",
    title: "Tormenta de arena",
    zone: "island",
    length: 30,
    island: { scene: "idle", hide: { dog: [3, 24] } },
    effects: { wind: [2, 24, 28] },
    actors: [
      { id: "dog", sprite: "dog", show: [3, 24], path: [{ t: 0, x: -78, y: -16 }],
        wobble: [{ from: 4, to: 22.5, x: 1.5, speed: 25, rot: 3 }] },
      { id: "tumble1", sprite: "i2_tumble", px: 4, show: [5, 13], fade: [0.6, 0.6], path: roll(-260, -14, 5, 1, 7, 75, 18) },
      { id: "tumble2", sprite: "i2_tumble", px: 3, show: [13, 21], fade: [0.6, 0.6], path: roll(-260, -10, 13, 0.8, 9, 62, 24) },
      { id: "leaf", sprite: "i2_leaf", px: 3, show: [8, 15], fade: [0.3, 0.8],
        path: [{ t: 8, x: -132, y: -58, rot: 0 }, { t: 15, x: 320, y: -170, ease: "in", rot: 900 }],
        wobble: { y: 14, speed: 3 } },
      glyph("wow", "!", -18, -76, 3, 5.5),
      glyph("huh", "?", 66, -50, 9, 11.5, "#dfe8ff"),
      { id: "dogPt", path: [{ t: 0, x: -78, y: -20 }] }
    ],
    particles: [
      { region: { x: -300, y: -150, w: 120, h: 150 }, style: "streak", from: 2, to: 23, angle: 4, length: 520, count: 36,
        rate: 0.9, size: 0.6, color: ["#e9cf93", "#c9a86a", "#d8b878"] },
      { region: { x: -300, y: -60, w: 120, h: 60 }, style: "streak", from: 3, to: 22, angle: 2, length: 480, count: 14,
        rate: 0.6, size: 1.4, color: ["#c9a86a", "#b08a50"] },
      { at: "dogPt", from: 24, to: 26, style: "sparks", count: 10, rate: 3, radius: 28, color: ["#e9cf93", "#c9a86a"], size: 1.1 }
    ]
  }
]

if (typeof module !== "undefined") module.exports = { ART: ART, EPISODES: EPISODES }
