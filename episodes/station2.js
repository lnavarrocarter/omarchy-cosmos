.pragma library

// Estación 2: más historias en la estación, incluidas reacciones a CPU y GPU.
// See EPISODES.md for the format; ART names use this pack's own prefix.
// Zone "station": offsets from the wheel's hub. Rim ~123 px; habitat from
// x +140 to +316 (y -32..+32), windows at y -16..+4, hatch at (+318..+338, 0).
// The crew is drawn small (px 2, about 24 x 30 px).

// The cargo crane: a yellow truss tower on the habitat's roof with a long jib.
// 70 columns x 40 rows at px 3: x +220..+430, y -152..-32 (centre +325, -92).
function craneArt() {
  var W = 70, H = 40, g = [], r, c
  for (r = 0; r < H; r++) { g.push([]); for (c = 0; c < W; c++) g[r].push(".") }
  function put(r, c, ch) { if (r >= 0 && r < H && c >= 0 && c < W) g[r][c] = ch }
  // Jib (rows 0..2) with a truss pattern, and a counterweight at the left.
  for (c = 0; c < W; c++) { put(0, c, "K"); put(2, c, "K"); put(1, c, c % 3 === 0 ? "K" : "Y") }
  for (r = 3; r < 7; r++) for (c = 0; c < 6; c++) put(r, c, (c === 0 || c === 5 || r === 6) ? "K" : "n")
  // Tower (columns 24..28) down to the roof.
  for (r = 3; r < H - 1; r++) {
    put(r, 24, "K"); put(r, 28, "K")
    put(r, 25, r % 4 === 2 ? "K" : "Y"); put(r, 26, r % 4 === 0 ? "K" : "Y"); put(r, 27, r % 4 === 2 ? "K" : "Y")
  }
  // Cab with a window, below the jib.
  for (r = 3; r < 8; r++) for (c = 29; c < 35; c++) put(r, c, (r === 3 || r === 7 || c === 34) ? "K" : "W")
  put(4, 30, "V"); put(4, 31, "V"); put(4, 32, "V"); put(5, 30, "D"); put(5, 31, "V"); put(5, 32, "V")
  // Base plate.
  for (c = 21; c < 32; c++) { put(H - 1, c, "K"); put(H - 2, c, c === 21 || c === 31 ? "K" : "n") }
  // Jib tip lamp.
  put(1, W - 1, "R")
  return g.map(function (row) { return row.join("") })
}

function trussArt(n) {
  var top = "", mid = "", bot = ""
  for (var i = 0; i < n; i++) { top += "K"; bot += "K"; mid += i % 3 === 0 ? "K" : "n" }
  return [top, mid, bot]
}

function boxArt(a, b) {
  return { colors: { u: a, v: b }, rows: ["KKKKKK", "KuuuvK", "KuuvuK", "KuvuuK", "KvuuuK", "KKKKKK"] }
}

var ART = {
  st2_hoop: [
    "KKKKKKKKK",
    "KWWWWWWWK",
    "KWWRRRWWK",
    "KWWRWRWWK",
    "KWWWWWWWK",
    "KKKKKKKKK",
    ".KRRRRRK.",
    "..W.W.W..",
    "..W.W.W..",
    "...W.W...",
    "....n....",
    "....n....",
    "....n....",
    "....n....",
    "...KnK..."
  ],
  st2_ball: [".KKK.", "KOcOK", "KcccK", "KOcOK", ".KKK."],
  st2_dent: ["n.K.n", ".KNK.", "n.K.n"],
  st2_leafR: { colors: { e: "#7fd35a" }, rows: ["..KK", ".KeL", "KeLK", "lLK.", "l..."] },
  st2_leafL: { colors: { e: "#7fd35a" }, rows: ["KK..", "LeK.", "KLeK", ".KLl", "...l"] },
  st2_flower: [
    "..KKK..",
    ".KPPPK.",
    "KPPYPPK",
    "KPYYYPK",
    "KPPYPPK",
    ".KPPPK.",
    "..KlK.."
  ],
  st2_vacuum: [
    "..KKKKK..",
    ".KnnnnnK.",
    "KnGGRGGnK",
    "KnnnnnnnK",
    ".KKKKKKK."
  ],
  st2_crane: craneArt(),
  st2_trolley: ["KKKK", "KnnK", ".KK."],
  st2_hook: [".nn.", "...n", "n..n", ".nn."],
  st2_freighter: [
    "......KKKKKKKKKKKK....",
    "....KKAAAAAAAAAAAAK...",
    "..KKVVAAAAWAAAAWAAKK..",
    ".KAVVVAAAAAAAAAAAAAKKO",
    "KAAAAAAAAAAAAAAAAAAAKY",
    ".KaaaaaaaaaaaaaaaaaKKO",
    "..KKKKKKKKKKKKKKKKKK.."
  ],
  st2_boxA: boxArt("#f2a541", "#b86d1f"),
  st2_boxB: boxArt("#3fae6a", "#2a7a4a"),
  st2_boxC: boxArt("#3d6fd8", "#2a4a9a"),
  st2_dish: [
    "K...Y...K",
    "KG..n..GK",
    ".KG.n.GK.",
    "..KGnGK..",
    "....K....",
    "....n....",
    "...KnK...",
    "..KnnnK.."
  ],
  st2_ringG: { colors: { g: "#9dff7a" }, rows: [
    "...ggg...",
    ".gg...gg.",
    ".g.....g.",
    "g.......g",
    "g.......g",
    "g.......g",
    ".g.....g.",
    ".gg...gg.",
    "...ggg..."
  ] },
  st2_ringQ: [
    "...QQQ...",
    ".QQ...QQ.",
    ".Q.....Q.",
    "Q.......Q",
    "Q.......Q",
    "Q.......Q",
    ".Q.....Q.",
    ".QQ...QQ.",
    "...QQQ..."
  ],
  st2_rod: [
    ".........K",
    "........K.",
    ".......T..",
    "......T...",
    ".....T....",
    "....T.....",
    "...T......",
    "..T.......",
    ".KT.......",
    "KK........"
  ],
  st2_lure: [".K.", "KRK", ".W."],
  st2_star: [
    "...K...",
    "..KYK..",
    "KKKYKKK",
    "KYYWYYK",
    ".KYYYK.",
    ".KYKYK.",
    ".KK.KK."
  ],
  st2_panel: [
    "KKKKKKKKKKKKKK",
    "KAAAnAAAnAAAAK",
    "KAQAnAQAnAQAAK",
    "KaaanaaanaaaaK",
    "KnnnnnnnnnnnnK",
    "KAAAnAAAnAAAAK",
    "KaaanaaanaaaaK",
    "KKKKKKKKKKKKKK"
  ],
  st2_dust: { colors: { d: ["#8a6f4a", 200], e: ["#5b4a35", 170] }, rows: [
    "..............",
    ".dde.d.edd.de.",
    ".edddeddd.edd.",
    ".d.edd.ede.dd.",
    "..ed.edd.d.e..",
    ".dde.ddde.edd.",
    ".e.dd.e.dd.de.",
    ".............."
  ] },
  st2_truss: trussArt(42),
  st2_sponge: ["KKKK", "KYYK", "KYYK", "KKKK"],
  st2_toastBurnt: { colors: { b: "#5a3a26" }, rows: [".KKKK.", "KTbTTK", "KbNbTK", "KTbNbK", "KbTbTK", "KKKKKK"] },
  st2_toast: [".KKKK.", "KCCCCK", "KCSSCK", "KCSSCK", "KCCCCK", "KKKKKK"],
  st2_neighbor: [
    "...KKKKK..............",
    ".KKOOOOOKK............",
    ".KO..n..OK............",
    "KO...n...OKKKKKKKKKKKK",
    "KO...n...OnBnBnBnBnBnK",
    "KOnnnYnnnOnnnnnnnnnnnK",
    "KO...n...OnBnBnBnBnBnK",
    "KO...n...OKKKKKKKKKKKK",
    ".KO..n..OK............",
    ".KKOOOOOKK............",
    "...KKKKK.............."
  ],
  st2_disco: [
    "...K...",
    "..KWK..",
    ".KWGWK.",
    "KWGWGWK",
    "KGWGWGK",
    ".KWGWK.",
    "..KKK.."
  ],
  st2_firetruck: [
    "...KWKWKWKWKWKWKWK......",
    "...KKKKKKKKKKKKKKK......",
    "..KRRRRRRRRRRRRRRRRK....",
    ".KVVRRRRRRRRRRRRRRRRK...",
    "KVVVRRRWWRRRRWWRRRRRKKO.",
    "KRRRRRRRRRRRRRRRRRRRRKY.",
    ".KRRRRYYRRRRRRYYRRRRKKO.",
    "..KKNNNNNNNNNNNNNNNKK...",
    "....KK..........KK......"
  ]
}

// ---------------------------------------------------------------- helpers

function crew(id, show, path, extra) {
  var a = { id: id, sprite: "astronaut", px: 2, show: show, fade: [0.4, 0.6], path: path }
  for (var k in (extra || {})) a[k] = extra[k]
  return a
}

function glyph(id, text, show, x, y, color, size, extra) {
  var a = { id: id, text: text, color: color || "#ffd65a", size: size || 22, show: show, fade: [0.2, 0.4],
    path: [{ t: show[0], x: x, y: y, scale: 0.5 }, { t: show[0] + 0.4, x: x, y: y - 6, ease: "out", scale: 1 }] }
  for (var k in (extra || {})) a[k] = extra[k]
  return a
}

// A glyph floating over another actor.
function over(id, text, show, on, dy, color, size, extra) {
  var a = { id: id, text: text, color: color || "#ffd65a", size: size || 20, show: show, fade: [0.2, 0.4],
    path: [{ t: show[0], x: 0, y: dy + 6, on: on, scale: 0.5 }, { t: show[0] + 0.4, x: 0, y: dy, on: on, ease: "out", scale: 1 }] }
  for (var k in (extra || {})) a[k] = extra[k]
  return a
}

function point(id, x, y) { return { id: id, path: [{ t: 0, x: x, y: y }] } }

// Hops in place: a keyframe every `step` seconds, each one a little jump;
// with `flipEvery`, the dancer turns around every that many hops.
function hops(x, y, t0, t1, step, height, flipEvery) {
  var out = [{ t: t0, x: x, y: y }], i = 0
  for (var t = t0 + step; t <= t1 + 1e-6; t += step, i++) {
    var k = { t: t, x: x, y: y, arc: height, ease: "linear" }
    if (flipEvery) k.flip = Math.floor(i / flipEvery) % 2 === 1
    out.push(k)
  }
  return out
}

// ------------------------------------------------------- vine (episode 40)

var VINE = [[196, -12], [199, -34], [210, -54], [230, -68], [254, -76], [278, -88], [294, -108], [298, -132],
  [288, -154], [270, -168]].map(function (p) { return [Math.round(196 + (p[0] - 196) * 1.5), Math.round(-12 + (p[1] + 12) * 1.5)] })
var VINE_T0 = 2, VINE_STEP = 1.8

function vineWalker(id, upto) {
  var path = [{ t: 0, x: VINE[0][0], y: VINE[0][1] }]
  for (var i = 1; i <= upto; i++) path.push({ t: VINE_T0 + i * VINE_STEP, x: VINE[i][0], y: VINE[i][1], ease: "linear" })
  return { id: id, path: path }
}

function leaf(i) {
  var t = VINE_T0 + i * VINE_STEP, right = i % 2 === 1, p = VINE[i]
  return { id: "leaf" + i, sprite: right ? "st2_leafR" : "st2_leafL", px: 4, show: [t - 0.2, 31.5], fade: [0, 1.5],
    path: [
      { t: t - 0.2, x: p[0] + (right ? 6 : -6), y: p[1] - 2, scale: 0.15 },
      { t: t + 0.8, x: p[0] + (right ? 10 : -10), y: p[1] - 5, ease: "out", scale: 1 }
    ],
    wobble: { from: t + 1, y: 1.2, speed: 1.4, phase: i } }
}

// ------------------------------------------------------ crane (episode 42)

// Trolley under the jib (y -140); the hook hangs `dy` below it; a box hangs 14
// below the hook. Pick from the ship's deck, drop on the roof.
var CARGO = [
  { box: "box0", sprite: "st2_boxA", deck: 18, x: 418, dropX: 245, dropY: -41, t0: 7 },
  { box: "box1", sprite: "st2_boxB", deck: 0, x: 400, dropX: 263, dropY: -41, t0: 16 },
  { box: "box2", sprite: "st2_boxC", deck: -18, x: 382, dropX: 254, dropY: -59, t0: 25 }
]
var TROLLEY_Y = -140, HOOK_REST = 16, HOOK_PICK = 25, HOOK_LIFT = 10

function cranePaths() {
  var trolley = [{ t: 0, x: 250, y: TROLLEY_Y }], hook = [{ t: 0, x: 0, y: HOOK_REST, on: "trolley" }]
  var boxes = []
  for (var i = 0; i < CARGO.length; i++) {
    var c = CARGO[i], t0 = c.t0, dropDy = c.dropY - 14 - TROLLEY_Y
    trolley.push({ t: t0, x: trolley[trolley.length - 1].x, y: TROLLEY_Y })
    trolley.push({ t: t0 + 2, x: c.x, y: TROLLEY_Y })
    trolley.push({ t: t0 + 4.5, x: c.x, y: TROLLEY_Y })
    trolley.push({ t: t0 + 6.5, x: c.dropX, y: TROLLEY_Y })
    hook.push({ t: t0 + 2, x: 0, y: HOOK_REST, on: "trolley" })
    hook.push({ t: t0 + 3.5, x: 0, y: HOOK_PICK, on: "trolley" })
    hook.push({ t: t0 + 4.5, x: 0, y: HOOK_LIFT, on: "trolley" })
    hook.push({ t: t0 + 6.5, x: 0, y: HOOK_LIFT, on: "trolley" })
    hook.push({ t: t0 + 8, x: 0, y: dropDy, on: "trolley" })
    hook.push({ t: t0 + 8.4, x: 0, y: dropDy, on: "trolley" })
    hook.push({ t: t0 + 9, x: 0, y: HOOK_REST, on: "trolley" })
    boxes.push({ id: c.box, sprite: c.sprite, px: 3, show: [0, 40], fade: [0, 1.5],
      path: [
        { t: 0, x: c.deck, y: -20, on: "ship" },
        { t: t0 + 3.5, x: c.deck, y: -20, on: "ship" },
        { t: t0 + 3.55, x: 0, y: 14, on: "hook" },
        { t: t0 + 8, x: 0, y: 14, on: "hook" },
        { t: t0 + 8.05, x: c.dropX, y: c.dropY }
      ] })
  }
  trolley.push({ t: 36, x: trolley[trolley.length - 1].x, y: TROLLEY_Y })
  trolley.push({ t: 38, x: 250, y: TROLLEY_Y })
  return { trolley: trolley, hook: hook, boxes: boxes }
}

var CRANE = cranePaths()

// ------------------------------------------------- signal rings (episode 43)

function ringIn(i, s) {
  return { id: "in" + i, sprite: "st2_ringG", px: 3, show: [s, s + 4],
    path: [
      { t: s, x: 690, y: -320, scale: 0.4, o: 0 },
      { t: s + 0.6, x: 620, y: -285, scale: 1, o: 1, ease: "linear" },
      { t: s + 4, x: 185, y: -64, scale: 2.2, o: 0.1, ease: "linear" }
    ] }
}

function ringOut(i, s) {
  return { id: "out" + i, sprite: "st2_ringQ", px: 3, show: [s, s + 4],
    path: [
      { t: s, x: 180, y: -64, scale: 0.4, o: 1 },
      { t: s + 4, x: 640, y: -300, scale: 2.4, o: 0.1, ease: "linear" }
    ] }
}

// ---------------------------------------------------- fire drill (episode 49)

function drillCrew(i, start, x, back) {
  return crew("drill" + i, [start, back + 2.5], [
    { t: start, x: 330, y: 0 },
    { t: start + 1.4, x: x, y: -80, ease: "out" },
    { t: back, x: x, y: -80 },
    { t: back + 2.5, x: 330, y: 0, ease: "inOut" }
  ], { wobble: [{ from: start, to: start + 1.6, rot: 18, speed: 9 }, { from: start + 1.6, to: back, y: 2, speed: 2, phase: i }] })
}

// --------------------------------------------------------- rave (episode 92)

function strobes(t0, t1) {
  var out = [], cols = [["#ff8fa8", "#ffffff"], ["#7df9ff", "#ffffff"], ["#ffd65a", "#ffffff"], ["#9dff7a", "#ffffff"]]
  var i = 0
  for (var t = t0; t < t1; t += 0.8, i++)
    out.push({ at: "strobe" + (i % 3), t: +t.toFixed(2), duration: 0.45, count: 2, size: 34, spread: 26, colors: cols[i % 4] })
  return out
}

// ---------------------------------------------------------------- episodes

var EPISODES = [
  // 38
  {
    id: "zeroGHoops",
    title: "Básquetbol en gravedad cero",
    zone: "station",
    length: 25,
    actors: [
      { id: "hoop", sprite: "st2_hoop", px: 3, show: [0, 25], fade: [1, 1.5], path: [{ t: 0, x: 250, y: -55 }] },
      point("rim", 266, -62),
      crew("shooter", [0, 25], [
        { t: 0, x: 328, y: 0 },
        { t: 2, x: 440, y: -95, ease: "out" },
        { t: 22, x: 440, y: -95 },
        { t: 24.5, x: 328, y: 0, ease: "inOut" }
      ], { wobble: [{ rot: 8, speed: 1.2 }, { from: 2, to: 22, y: 3, speed: 1.6 }] }),
      crew("buddy", [1, 24], [
        { t: 1, x: 328, y: 0 },
        { t: 3.5, x: 310, y: -128, ease: "out" },
        { t: 7, x: 310, y: -128 },
        { t: 8.5, x: 178, y: -146, ease: "inOut" },
        { t: 9, x: 178, y: -146 },
        { t: 10.8, x: 310, y: -128, ease: "inOut" },
        { t: 17.4, x: 310, y: -128 },
        { t: 18.5, x: 262, y: -98, ease: "out" },
        { t: 21, x: 262, y: -98 },
        { t: 23.5, x: 328, y: 0, ease: "inOut" }
      ], { wobble: [{ rot: 10, speed: 1 }, { from: 18.5, to: 21, rot: 20, speed: 6 }] }),
      { id: "ball", sprite: "st2_ball", px: 3, spin: 140, show: [0, 23.5], fade: [0.5, 0.3],
        path: [
          { t: 0, x: -10, y: -4, on: "shooter" },
          { t: 4, x: -10, y: -4, on: "shooter" },
          { t: 5.4, x: 268, y: -64, arc: 55 },
          { t: 8.5, x: 186, y: -158, ease: "out" },
          { t: 8.6, x: 9, y: -6, on: "buddy" },
          { t: 10.8, x: 9, y: -6, on: "buddy" },
          { t: 12, x: -10, y: -4, on: "shooter", arc: 34, ease: "linear" },
          { t: 13.5, x: -10, y: -4, on: "shooter" },
          { t: 15, x: 250, y: -64, arc: 70 },
          { t: 16.4, x: 250, y: -41, ease: "linear" },
          { t: 18.5, x: 258, y: -86, ease: "out" },
          { t: 18.6, x: -4, y: 10, on: "buddy" },
          { t: 23.5, x: -4, y: 10, on: "buddy" }
        ] },
      over("oops", "!", [5.5, 7.5], "shooter", -30, "#ff6b5a", 24),
      glyph("swish", "✓", [16, 20], 250, -110, "#9dff7a", 28, { wobble: { y: 4, speed: 3 } })
    ],
    bursts: [
      { at: "rim", t: 5.4, duration: 0.7, count: 3, size: 16, spread: 8, colors: ["#ffd65a", "#ffffff"] },
      { at: "hoop", t: 15.4, duration: 2, count: 6, size: 40, spread: 40, colors: ["#ffd65a", "#ff8fa8", "#7df9ff"] }
    ],
    particles: [
      { at: "buddy", from: 7, to: 10.8, style: "exhaust", count: 5, rate: 3, offset: [-10, 10], size: 0.7 },
      { at: "buddy", from: 17.4, to: 18.5, style: "exhaust", count: 4, rate: 3, offset: [-10, 10], size: 0.7 },
      { at: "shooter", from: 16.2, to: 21, style: "rise", glyph: "♥", color: "#ff8fa8", count: 3, rate: 0.7, height: 50, offset: [0, -16] }
    ]
  },

  // 39
  {
    id: "dockBounce",
    title: "Atraque fallido",
    zone: "station",
    length: 24,
    actors: [
      { id: "dent", sprite: "st2_dent", px: 2, show: [5, 24], fade: [0, 1], path: [{ t: 0, x: 333, y: -6 }] },
      point("impact", 340, -2),
      { id: "ship", sprite: "shuttle", px: 3, facesLeft: true, show: [0, 24], fade: [0, 1.5],
        path: [
          { t: 0, x: 820, y: -230 },
          { t: 5, x: 368, y: 0, ease: "in" },
          { t: 7.5, x: 530, y: -80, ease: "out", rot: -30 },
          { t: 10, x: 570, y: -60, rot: -12 },
          { t: 12.5, x: 540, y: -18, rot: 0 },
          { t: 18, x: 370, y: 0, ease: "inOut" }
        ],
        wobble: [{ from: 5, to: 12.5, rot: 22, speed: 6, y: 5 }] },
      glyph("bang", "!", [5, 7.5], 338, -42, "#ff6b5a", 30, { blink: { every: 0.5, dur: 0.35 } }),
      over("dizzy", "?", [8, 12], "ship", -30, "#ffd65a", 20),
      crew("crew", [18.5, 24], [{ t: 18.5, x: 330, y: 0 }, { t: 20, x: 318, y: -52, ease: "out" }],
        { swap: [[18.5, "astronaut"], [20.5, "astronautWave"]], wobble: { rot: 8, speed: 2 } }),
      over("ok", "✓", [18.6, 23], "ship", -30, "#9dff7a", 22)
    ],
    bursts: [{ at: "impact", t: 5, duration: 1.2, count: 5, size: 30, spread: 12, colors: ["#ffffff", "#ffd65a", "#ff9447"] }],
    particles: [
      { at: "ship", from: 0, to: 5, style: "exhaust", count: 5, rate: 3, offset: [30, 2] },
      { at: "impact", from: 5, to: 6.4, style: "sparks", count: 12, rate: 3, radius: 34, color: ["#ffd65a", "#fff6c0", "#ff9447"] },
      { at: "ship", from: 5.5, to: 12, style: "smoke", count: 6, rate: 1, offset: [20, -4], size: 0.6, trail: true },
      { at: "ship", from: 13, to: 18, style: "exhaust", count: 3, rate: 3, offset: [30, 2], size: 0.5 }
    ]
  },

  // 40
  {
    id: "greenhouseVine",
    title: "La planta del invernadero se escapa",
    zone: "station",
    length: 32,
    actors: [
      point("root", VINE[0][0], VINE[0][1]),
      vineWalker("m1", 3), vineWalker("m2", 6), vineWalker("tip", 9),
      leaf(1), leaf(2), leaf(3), leaf(4), leaf(5), leaf(6), leaf(7), leaf(8), leaf(9),
      { id: "flower", sprite: "st2_flower", px: 4, show: [20, 31.5], fade: [0, 1.5],
        glow: { r: 40, color: "#ff8fa8", a: 0.18 },
        path: [
          { t: 20, x: VINE[9][0] - 4, y: VINE[9][1] - 8, scale: 0.1 },
          { t: 21.6, x: VINE[9][0] - 6, y: VINE[9][1] - 14, ease: "out", scale: 1 }
        ],
        wobble: { from: 22, y: 2, speed: 1.2, rot: 6 } },
      crew("gardener", [23, 31.5], [{ t: 23, x: 330, y: 0 }, { t: 25, x: 350, y: -50, ease: "out" }],
        { swap: [[23, "astronaut"], [25.5, "astronautWave"]], wobble: { y: 3, speed: 1.5 } }),
      glyph("gasp", "!", [1.2, 3.5], 165, -42, "#ffd65a", 22)
    ],
    ropes: [
      { a: "root", b: "m1", sag: -4, color: "#3fae6a", show: [2, 31.5] },
      { a: "m1", b: "m2", sag: 5, color: "#3fae6a", show: [7.4, 31.5] },
      { a: "m2", b: "tip", sag: -5, color: "#3fae6a", show: [12.8, 31.5] }
    ],
    particles: [
      { region: { x: 230, y: -300, w: 100, h: 90 }, style: "twinkle", from: 21, to: 31, count: 6, rate: 0.7, color: ["#fff6c0", "#ff8fa8"] },
      { at: "flower", from: 22, to: 30, style: "rise", glyph: "♥", color: "#ff8fa8", count: 3, rate: 0.5, height: 60 }
    ]
  },

  // 41
  {
    id: "vacuumEscape",
    title: "La aspiradora robot se escapa",
    zone: "station",
    length: 26,
    actors: [
      { id: "sock", sprite: "sockRed", px: 3, spin: 50, show: [0, 12.8], fade: [1, 0],
        path: [
          { t: 0, x: -30, y: -182 },
          { t: 12, x: -14, y: -174, ease: "linear" },
          { t: 12.8, x: 0, y: 0, on: "vac", scale: 0.2 }
        ] },
      { id: "vac", sprite: "st2_vacuum", px: 3, show: [1, 25],
        path: [
          { t: 1, x: 330, y: 0 },
          { t: 2.5, x: 420, y: -40, ease: "out" },
          { t: 5, x: 470, y: -160 },
          { t: 7.5, x: 330, y: -222, arc: 30 },
          { t: 10, x: 140, y: -192 },
          { t: 12.5, x: 0, y: -170, arc: -20 },
          { t: 14.5, x: -150, y: -122 },
          { t: 16.2, x: -200, y: -32 },
          { t: 16.3, x: 12, y: 6, on: "chaser" },
          { t: 25, x: 12, y: 6, on: "chaser" }
        ],
        wobble: { from: 1, to: 16, rot: 30, speed: 7, y: 4 } },
      crew("chaser", [3, 25.5], [
        { t: 3, x: 330, y: 0 },
        { t: 5, x: 430, y: -64 },
        { t: 7.5, x: 480, y: -150, flip: true },
        { t: 10, x: 350, y: -212 },
        { t: 12.5, x: 160, y: -196 },
        { t: 14.5, x: 20, y: -172 },
        { t: 16.2, x: -188, y: -40, ease: "out" },
        { t: 17.5, x: -188, y: -40, flip: false },
        { t: 22, x: 130, y: -150, arc: 20 },
        { t: 25.5, x: 330, y: 0, ease: "inOut" }
      ], { wobble: [{ rot: 10, speed: 2 }, { from: 16.2, to: 17.5, rot: 25, speed: 8 }] }),
      glyph("alarm", "!", [1.4, 3.6], 338, -38, "#ff6b5a", 26, { blink: { every: 0.5, dur: 0.35 } }),
      over("got", "!", [16.2, 17.6], "chaser", -28, "#ffd65a", 20),
      { id: "dz0", text: "*", size: 14, color: "#ffd65a", show: [16.4, 21],
        orbit: { on: "vac", rx: 14, ry: 5, y: -10, from: 0, to: 900, t0: 16.4, t1: 21 } },
      { id: "dz1", text: "*", size: 14, color: "#ffd65a", show: [16.4, 21],
        orbit: { on: "vac", rx: 14, ry: 5, y: -10, from: 180, to: 1080, t0: 16.4, t1: 21 } }
    ],
    particles: [
      { at: "vac", from: 1, to: 16, style: "smoke", count: 6, rate: 1.6, size: 0.35, trail: true, color: "#8f94ad" },
      { at: "chaser", from: 3, to: 16.2, style: "exhaust", count: 5, rate: 3, offset: [-10, 10], size: 0.7 },
      { at: "chaser", from: 18, to: 25, style: "exhaust", count: 4, rate: 3, offset: [-10, 10], size: 0.6 },
      { at: "chaser", from: 18, to: 23, style: "rise", glyph: "♥", color: "#ff8fa8", count: 2, rate: 0.6, height: 40, offset: [0, -18] }
    ]
  },

  // 42
  {
    id: "cargoCrane",
    title: "Llega carga: la grúa descarga cajas",
    zone: "station",
    length: 40,
    actors: [
      { id: "crane", sprite: "st2_crane", px: 3, show: [0, 40], fade: [1.5, 1.5], path: [{ t: 0, x: 325, y: -92 }] },
      { id: "ship", sprite: "st2_freighter", px: 3, facesLeft: true, show: [0, 40],
        path: [
          { t: 0, x: 840, y: -270 },
          { t: 5.5, x: 400, y: -80, ease: "out" },
          { t: 34.5, x: 400, y: -80, flip: true },
          { t: 39.5, x: 860, y: -250, ease: "in" }
        ],
        wobble: { from: 5.5, to: 34.5, y: 1.5, speed: 1.2 } },
      { id: "trolley", sprite: "st2_trolley", px: 3, show: [0, 40], fade: [1.5, 1.5], path: CRANE.trolley },
      { id: "hook", sprite: "st2_hook", px: 3, show: [0, 40], fade: [1.5, 1.5], path: CRANE.hook },
      CRANE.boxes[0], CRANE.boxes[1], CRANE.boxes[2],
      glyph("done", "✓", [34, 38], 254, -100, "#9dff7a", 26),
      crew("crew", [32, 39.5], [{ t: 32, x: 330, y: 0 }, { t: 33.5, x: 312, y: -52, ease: "out" }],
        { swap: [[32, "astronaut"], [34, "astronautWave"]] })
    ],
    ropes: [{ a: "trolley", b: "hook", sag: 0, color: "#a3a9c2", aOffset: [0, 3], bOffset: [0, -5] }],
    particles: [
      { at: "ship", from: 0, to: 5.5, style: "exhaust", count: 5, rate: 3, offset: [36, 0] },
      { at: "ship", from: 34.5, to: 40, style: "exhaust", count: 5, rate: 3, offset: [36, 0] },
      { at: "ship", from: 35, to: 39, style: "rise", glyph: "♥", color: "#ff8fa8", count: 2, rate: 0.6, height: 40, offset: [0, -16] }
    ]
  },

  // 43
  {
    id: "alienSignal",
    title: "La antena recibe una señal alienígena",
    zone: "station",
    length: 30,
    actors: [
      { id: "dish", sprite: "st2_dish", px: 4, show: [0, 30], fade: [1, 1.5], path: [{ t: 0, x: 180, y: -48 }],
        wobble: { from: 6, to: 11, x: 1, xspeed: 30, speed: 30 } },
      ringIn(0, 2), ringIn(1, 3.4), ringIn(2, 4.8), ringIn(3, 6.2),
      ringOut(0, 12.5), ringOut(1, 13.7), ringOut(2, 14.9),
      { id: "ping", text: "*", color: "#9dff7a", size: 18, show: [5.5, 11], blink: { every: 0.5, dur: 0.3 },
        path: [{ t: 0, x: 180, y: -66 }] },
      crew("crew", [8, 29.5], [{ t: 8, x: 330, y: 0 }, { t: 9.5, x: 352, y: -46, ease: "out" }],
        { swap: [[8, "astronaut"], [21, "astronautWave"]], wobble: { y: 2, speed: 1.4 } }),
      over("q", "?", [9.6, 12.4], "crew", -28, "#dfe8ff", 22),
      { id: "ufo", frames: ["ufo0", "ufo1"], fps: 6, px: 3, show: [17, 29.5], fade: [1.2, 1],
        glow: { r: 50, color: "#9dff7a", a: 0.15, dy: 10 },
        path: [
          { t: 17, x: 640, y: -300 },
          { t: 26, x: 640, y: -300 },
          { t: 29.5, x: 900, y: -390, ease: "in" }
        ],
        wobble: { y: 6, speed: 1.4 } },
      over("wow", "!", [18, 20], "crew", -28, "#ffd65a", 22)
    ],
    shots: [
      { from: "ufo", to: "crew", start: 20, every: 1.2, count: 3, travel: 1.8, glyph: "♥", color: "#9dff7a", arc: 30,
        hit: true, hitColor: "#9dff7a", toOffset: [0, -10] }
    ],
    particles: [
      { at: "crew", from: 23, to: 28, style: "rise", glyph: "♥", color: "#ff8fa8", count: 3, rate: 0.6, height: 50, offset: [0, -16] },
      { at: "dish", from: 12, to: 16, style: "sparks", count: 6, rate: 2, radius: 14, offset: [0, -10], color: ["#7df9ff", "#ffffff"] }
    ]
  },

  // 44
  {
    id: "spaceFishing",
    title: "Pesca desde la escotilla",
    zone: "station",
    length: 32,
    actors: [
      crew("angler", [0, 32], [{ t: 0, x: 330, y: 0 }, { t: 1.5, x: 356, y: -14, ease: "out" }],
        { wobble: [{ y: 2, speed: 1 }, { from: 15, to: 23, rot: 10, speed: 7 }] }),
      { id: "rod", sprite: "st2_rod", px: 2, show: [1.5, 31.5], fade: [0.3, 0.5], path: [{ t: 0, x: 16, y: -8, on: "angler" }] },
      { id: "tip", path: [{ t: 0, x: 25, y: -17, on: "angler" }] },
      { id: "lure", sprite: "st2_lure", px: 2, show: [2.5, 23.2],
        path: [
          { t: 2.5, x: 0, y: 0, on: "tip" },
          { t: 4.6, x: 560, y: 110, arc: 90, ease: "out" },
          { t: 17, x: 560, y: 110 },
          { t: 23, x: 0, y: 4, on: "tip", ease: "inOut" }
        ],
        wobble: [{ from: 5, to: 15, y: 3, speed: 1.6 }, { from: 15, to: 17.5, x: 6, y: 6, speed: 14, xspeed: 11 }] },
      { id: "fish", sprite: "fish", px: 3, show: [6, 13], fade: [1, 1],
        path: [
          { t: 6, x: 780, y: 140 },
          { t: 9, x: 582, y: 114, ease: "out" },
          { t: 10.5, x: 582, y: 114, flip: true },
          { t: 13, x: 780, y: 50, ease: "in" }
        ],
        wobble: { y: 3, speed: 3 } },
      over("fishQ", "?", [9.2, 11.2], "fish", -18, "#dfe8ff", 18),
      { id: "star", sprite: "st2_star", px: 3, spin: 25, show: [11, 32], fade: [1, 0.8],
        glow: { r: 30, color: "#ffd65a", a: 0.2 },
        path: [
          { t: 11, x: 660, y: 300 },
          { t: 15, x: 568, y: 120, ease: "out" },
          { t: 15.1, x: 8, y: 10, on: "lure" },
          { t: 23, x: 8, y: 10, on: "lure" },
          { t: 23.6, x: -8, y: -22, on: "angler", arc: 10 }
        ] },
      over("bite", "!", [15, 17.5], "angler", -30, "#ff6b5a", 24)
    ],
    ropes: [{ a: "tip", b: "lure", sag: 30, color: "#d8e6ff", show: [2.5, 23.2] }],
    particles: [
      { at: "lure", from: 15, to: 16.5, style: "sparks", count: 8, rate: 2, radius: 18, color: ["#fff6c0", "#ffd65a"] },
      { at: "star", from: 23.6, to: 31, style: "twinkle", count: 4, rate: 1, color: ["#fff6c0", "#ffd65a"], size: 1.2 },
      { at: "angler", from: 24, to: 30, style: "rise", glyph: "♥", color: "#ff8fa8", count: 3, rate: 0.6, height: 50, offset: [6, -20] }
    ]
  },

  // 45
  {
    id: "solarWash",
    title: "Limpieza de paneles solares",
    zone: "station",
    length: 30,
    actors: [
      { id: "truss", sprite: "st2_truss", px: 3, show: [0, 30], fade: [1, 1.5], path: [{ t: 0, x: -186, y: 0 }] },
      { id: "panelA", sprite: "st2_panel", px: 3, show: [0, 30], fade: [1, 1.5], path: [{ t: 0, x: -166, y: 0 }] },
      { id: "panelB", sprite: "st2_panel", px: 3, show: [0, 30], fade: [1, 1.5], path: [{ t: 0, x: -218, y: 0 }] },
      { id: "dustA", sprite: "st2_dust", px: 3, show: [0, 14.5], fade: [1, 0],
        path: [{ t: 0, x: -166, y: 0, o: 1 }, { t: 9, x: -166, y: 0, o: 1 }, { t: 14, x: -166, y: 0, o: 0, ease: "linear" }] },
      { id: "dustB", sprite: "st2_dust", px: 3, show: [0, 20.5], fade: [1, 0],
        path: [{ t: 0, x: -218, y: 0, o: 1 }, { t: 15, x: -218, y: 0, o: 1 }, { t: 20, x: -218, y: 0, o: 0, ease: "linear" }] },
      crew("washer", [1, 28.6], [
        { t: 1, x: 330, y: 0 },
        { t: 3, x: 280, y: -80 },
        { t: 6, x: 0, y: -178, arc: 20 },
        { t: 8.5, x: -166, y: -24, ease: "out" },
        { t: 14, x: -166, y: -24, flip: true },
        { t: 15, x: -218, y: -24 },
        { t: 20.2, x: -218, y: -24, flip: false },
        { t: 23, x: -60, y: -172, arc: 10 },
        { t: 26, x: 250, y: -90 },
        { t: 28.6, x: 330, y: 0, ease: "inOut" }
      ], { wobble: [{ rot: 8, speed: 1.4 }, { from: 9, to: 14, x: 12, xspeed: 6, speed: 12, y: 2 },
        { from: 15, to: 20, x: 12, xspeed: 6, speed: 12, y: 2 }] }),
      { id: "sponge", sprite: "st2_sponge", px: 2, show: [1, 28.6], fade: [0.4, 0.6], path: [{ t: 0, x: 10, y: 10, on: "washer" }] },
      glyph("ok", "✓", [20.5, 25], -192, -66, "#9dff7a", 28, { wobble: { y: 3, speed: 3 } })
    ],
    bursts: [
      { at: "panelA", t: 14, duration: 1.6, count: 3, size: 30, spread: 18, colors: ["#fff6c0", "#7df9ff"] },
      { at: "panelB", t: 20, duration: 1.6, count: 3, size: 30, spread: 18, colors: ["#fff6c0", "#7df9ff"] }
    ],
    particles: [
      { at: "sponge", from: 9, to: 14, style: "sparks", count: 8, rate: 1.6, radius: 16, color: ["#ffffff", "#9fe3ff"] },
      { at: "sponge", from: 15, to: 20, style: "sparks", count: 8, rate: 1.6, radius: 16, color: ["#ffffff", "#9fe3ff"] },
      { at: "sponge", from: 9, to: 20, style: "smoke", count: 4, rate: 1, size: 0.4, color: "#8a6f4a" },
      { region: { x: -190, y: -12, w: 50, h: 24 }, style: "twinkle", from: 14, to: 29, count: 3, rate: 0.8, color: ["#ffffff", "#7df9ff"] },
      { region: { x: -242, y: -12, w: 50, h: 24 }, style: "twinkle", from: 20, to: 29, count: 3, rate: 0.8, color: ["#ffffff", "#7df9ff"] }
    ]
  },

  // 46
  {
    id: "burntToast",
    title: "Pan quemado en la cocina",
    zone: "station",
    length: 24,
    actors: [
      point("window", 172, -6),
      glyph("alarm", "!", [3, 7], 172, -58, "#ff6b5a", 28, { blink: { every: 0.6, dur: 0.4 } }),
      { id: "burnt", sprite: "st2_toastBurnt", px: 3, spin: 70, show: [8, 22], fade: [0, 2],
        path: [
          { t: 8, x: 176, y: -8, scale: 0.3 },
          { t: 9, x: 196, y: -72, ease: "out", scale: 1 },
          { t: 22, x: -200, y: -340, ease: "linear" }
        ] },
      crew("cook", [13, 23.5], [
        { t: 13, x: 330, y: 0 },
        { t: 15, x: 350, y: -56, ease: "out" },
        { t: 21, x: 350, y: -56 },
        { t: 23.5, x: 330, y: 0, ease: "inOut" }
      ], { wobble: { y: 2, speed: 1.6 } }),
      { id: "toast", sprite: "st2_toast", px: 3, spin: 90, show: [14, 23.5],
        path: [
          { t: 14, x: 176, y: -8, scale: 0.3 },
          { t: 15, x: 226, y: -78, ease: "out", scale: 1 },
          { t: 17.4, x: 330, y: -66, ease: "linear" },
          { t: 17.5, x: -8, y: -4, on: "cook" },
          { t: 23.5, x: -8, y: -4, on: "cook" }
        ] },
      over("yum", "♥", [17.6, 20.5], "cook", -30, "#ff8fa8", 22)
    ],
    particles: [
      { region: { x: 152, y: -16, w: 40, h: 18 }, style: "smoke", from: 1, to: 15, count: 12, rate: 0.7, size: 1.2,
        drift: [-20, -110], color: ["#55525e", "#7a7685", "#3a3842"] },
      { at: "burnt", from: 8, to: 20, style: "smoke", count: 6, rate: 1.2, size: 0.4, trail: true, color: "#55525e" },
      { at: "window", from: 2, to: 8, style: "sparks", count: 4, rate: 1.2, radius: 10, color: ["#ff9447", "#ffd65a"] }
    ]
  },

  // 47
  {
    id: "neighborWave",
    title: "Saludo con la estación vecina",
    zone: "station",
    length: 30,
    actors: [
      { id: "neighbor", sprite: "st2_neighbor", px: 3, show: [0, 30],
        path: [{ t: 0, x: 900, y: -270 }, { t: 30, x: -620, y: -230, ease: "linear" }],
        wobble: { y: 6, speed: 0.8 } },
      { id: "them", sprite: "astronautWave", px: 2, show: [4, 26], fade: [0.6, 0.6],
        path: [{ t: 0, x: 22, y: -30, on: "neighbor" }], wobble: { rot: 10, speed: 3 } },
      crew("us", [3, 28.5], [
        { t: 3, x: 330, y: 0 },
        { t: 5, x: 350, y: -52, ease: "out" },
        { t: 26, x: 330, y: -60 },
        { t: 28.5, x: 330, y: 0, ease: "inOut" }
      ], { swap: [[3, "astronaut"], [8, "astronautWave"], [23, "astronaut"]], wobble: { y: 2, speed: 1.5 } }),
      over("spot", "!", [5.4, 7.6], "us", -30, "#ffd65a", 24)
    ],
    shots: [
      { from: "us", to: "them", start: 9, every: 1.4, count: 3, travel: 1.6, glyph: "♥", color: "#ff8fa8", arc: 40, hit: true, hitColor: "#ff8fa8" },
      { from: "them", to: "us", start: 13.5, every: 1.4, count: 3, travel: 1.6, glyph: "♥", color: "#ffd65a", arc: -30, hit: true, hitColor: "#ffd65a" }
    ],
    bursts: [{ at: "neighbor", t: 18.5, duration: 1.4, count: 4, size: 30, spread: 30, colors: ["#ff9447", "#ffd65a"] }],
    particles: [
      { at: "neighbor", from: 0, to: 30, style: "twinkle", count: 3, rate: 1, offset: [12, 0], color: ["#ffd65a", "#ff9447"], size: 1.2 }
    ]
  },

  // 48
  {
    id: "stationParty",
    title: "Fiesta en la estación",
    zone: "station",
    length: 32,
    effects: { lights: [0, 32, "party"] },
    actors: [
      point("pole", 228, -33),
      { id: "disco", sprite: "st2_disco", px: 4, spin: 90, show: [0, 32], fade: [1, 1.5],
        glow: { r: 46, color: "#ff8fa8", a: 0.22 },
        path: [{ t: 0, x: 228, y: -150 }, { t: 2.5, x: 228, y: -70, ease: "out" }],
        wobble: { from: 3, y: 3, speed: 1.2 } },
      crew("d0", [1.5, 32], hops(370, -40, 3, 31, 0.5, 10, 4), { wobble: { rot: 15, speed: 4 } }),
      crew("d1", [2.5, 32], hops(410, -78, 4, 31, 0.6, 14, 3), { wobble: { rot: 15, speed: 3.4, phase: 1 } }),
      { id: "cat", sprite: "catSit", px: 2, show: [5, 32], fade: [0.6, 1.2], path: hops(300, -40, 6, 31, 0.4, 8, 5) },
      crew("d2", [4, 32], [{ t: 4, x: 330, y: 0 }, { t: 6, x: 450, y: -30, ease: "out" }],
        { swap: [[4, "astronaut"], [6, "astronautWave"]], spin: 40 })
    ],
    ropes: [{ a: "pole", b: "disco", sag: 0, color: "#a3a9c2", bOffset: [0, -10] }],
    bursts: [
      { at: "disco", t: 8, duration: 1, count: 3, size: 26, spread: 30, colors: ["#ff8fa8", "#7df9ff", "#ffd65a"], follow: true },
      { at: "disco", t: 16, duration: 1, count: 3, size: 26, spread: 30, colors: ["#9dff7a", "#ff8fa8", "#ffffff"], follow: true },
      { at: "disco", t: 24, duration: 1, count: 3, size: 26, spread: 30, colors: ["#7df9ff", "#ffd65a", "#ff8fa8"], follow: true }
    ],
    particles: [
      { region: { x: 150, y: -22, w: 160, h: 14 }, style: "rise", glyph: "♪", from: 1, to: 30, count: 8, rate: 0.8, height: 100,
        color: ["#ff8fa8", "#ffd65a", "#7df9ff", "#9dff7a"] },
      { region: { x: 120, y: -200, w: 400, h: 150 }, style: "twinkle", from: 2, to: 31, count: 10, rate: 0.9,
        color: ["#ff8fa8", "#7df9ff", "#ffd65a", "#ffffff"], size: 1.3 },
      { region: { x: 150, y: -230, w: 360, h: 30 }, style: "fall", from: 25, to: 30, count: 20, rate: 0.6, height: 220, size: 1.2,
        color: ["#ff8fa8", "#ffd65a", "#7df9ff", "#9dff7a"] }
    ]
  },

  // 49
  {
    id: "fireDrill",
    title: "Simulacro de incendio",
    zone: "station",
    length: 26,
    effects: { lights: [1, 18, "alarm"] },
    actors: [
      { id: "siren", text: "!", color: "#ff4a3d", size: 32, show: [1, 18], blink: { every: 0.8, dur: 0.5 },
        path: [{ t: 0, x: 228, y: -62 }], glow: { r: 40, color: "#ff4a3d", a: 0.2 } },
      drillCrew(0, 2.5, 400, 20),
      drillCrew(1, 3.4, 428, 20.6),
      drillCrew(2, 4.3, 456, 21.2),
      crew("late", [10, 24], [
        { t: 10, x: 330, y: 0 },
        { t: 11.8, x: 484, y: -80, ease: "out" },
        { t: 21.8, x: 484, y: -80 },
        { t: 24, x: 330, y: 0, ease: "inOut" }
      ], { wobble: [{ from: 10, to: 12, rot: 30, speed: 12 }, { from: 12, to: 21, y: 2, speed: 2, phase: 3 }] }),
      over("lateQ", "?", [10.6, 13.5], "late", -28, "#dfe8ff", 20),
      over("chief", "!", [12.2, 14], "drill0", -28, "#ffd65a", 20),
      glyph("ok", "✓", [17.5, 21], 442, -128, "#9dff7a", 28, { wobble: { y: 3, speed: 3 } })
    ],
    particles: [
      { at: "drill0", from: 2.5, to: 4, style: "exhaust", count: 4, rate: 3, offset: [-10, 10], size: 0.7 },
      { at: "drill1", from: 3.4, to: 4.9, style: "exhaust", count: 4, rate: 3, offset: [-10, 10], size: 0.7 },
      { at: "drill2", from: 4.3, to: 5.8, style: "exhaust", count: 4, rate: 3, offset: [-10, 10], size: 0.7 },
      { at: "late", from: 10, to: 11.9, style: "exhaust", count: 4, rate: 3, offset: [-10, 10], size: 0.7 },
      { at: "late", from: 12, to: 15, style: "sparks", count: 3, rate: 1, radius: 10, offset: [0, -14], color: "#9fe3ff" }
    ]
  },

  // 91
  {
    id: "fireBrigade",
    title: "CPU al 100 %: bomberos espaciales",
    on: "cpuSpike",
    zone: "station",
    length: 30,
    effects: { lights: [1, 17, "alarm"] },
    actors: [
      glyph("alarm", "!", [1.2, 6.5], 228, -64, "#ff4a3d", 30, { blink: { every: 0.6, dur: 0.4 } }),
      { id: "truck", sprite: "st2_firetruck", px: 3, facesLeft: true, show: [2, 30], fade: [0, 1.5],
        path: [
          { t: 2, x: 860, y: -330 },
          { t: 6.5, x: 240, y: -118, ease: "out" },
          { t: 21.5, x: 240, y: -118, flip: true },
          { t: 28, x: 920, y: -330, ease: "in" }
        ],
        wobble: { from: 6.5, to: 21.5, y: 2, speed: 1.2 } },
      { id: "beacon", text: "*", color: "#58c8ff", size: 18, show: [2, 28], blink: { every: 0.5, dur: 0.25 },
        path: [{ t: 0, x: -20, y: -20, on: "truck" }] },
      { id: "beacon2", text: "*", color: "#ff4a3d", size: 18, show: [2.25, 28], blink: { every: 0.5, dur: 0.25 },
        path: [{ t: 0, x: -8, y: -20, on: "truck" }] },
      crew("ff0", [7, 21.5], [
        { t: 7, x: 225, y: -112 },
        { t: 8.5, x: 182, y: -62, ease: "out" },
        { t: 19.5, x: 182, y: -62 },
        { t: 21.3, x: 225, y: -112, ease: "inOut" }
      ], { wobble: { from: 8.5, to: 19.5, rot: 6, speed: 4 } }),
      crew("ff1", [7.6, 21.8], [
        { t: 7.6, x: 255, y: -112 },
        { t: 9.1, x: 292, y: -62, ease: "out" },
        { t: 19.8, x: 292, y: -62 },
        { t: 21.6, x: 255, y: -112, ease: "inOut" }
      ], { wobble: { from: 9.1, to: 19.8, rot: 6, speed: 4, phase: 2 } }),
      { id: "hose0", path: [{ t: 0, x: 8, y: 6, on: "ff0" }] },
      { id: "hose1", path: [{ t: 0, x: -8, y: 6, on: "ff1" }] },
      glyph("ok", "✓", [18.5, 22.5], 228, -66, "#9dff7a", 28, { wobble: { y: 3, speed: 3 } }),
      point("galley", 228, -10)
    ],
    particles: [
      { region: { x: 150, y: -24, w: 150, h: 18 }, style: "smoke", from: 0, to: 15, count: 14, rate: 0.9, size: 1.4,
        drift: [-10, -120], color: ["#4a4752", "#6b6775", "#3a3842"] },
      { region: { x: 160, y: -18, w: 130, h: 16 }, style: "sparks", from: 0.5, to: 12, count: 8, rate: 1.4, radius: 14,
        color: ["#ff9447", "#ffd65a", "#e2524a"] },
      { at: "hose0", from: 9, to: 17.5, style: "streak", angle: 75, length: 60, count: 8, rate: 2.5, size: 0.4, color: ["#9fe3ff", "#ffffff"] },
      { at: "hose1", from: 9.6, to: 17.5, style: "streak", angle: 105, length: 60, count: 8, rate: 2.5, size: 0.4, color: ["#9fe3ff", "#ffffff"] },
      { region: { x: 160, y: -20, w: 130, h: 14 }, style: "smoke", from: 14, to: 20, count: 6, rate: 0.8, size: 1,
        drift: [0, -90], color: ["#dfe8ff", "#ffffff"] },
      { at: "galley", from: 22, to: 28, style: "rise", glyph: "♥", color: "#ff8fa8", count: 3, rate: 0.6, height: 70 },
      { at: "truck", from: 2, to: 6.5, style: "exhaust", count: 5, rate: 3, offset: [38, 0] },
      { at: "truck", from: 21.5, to: 28, style: "exhaust", count: 5, rate: 3, offset: [38, 0] }
    ]
  },

  // 92
  {
    id: "gpuRave",
    title: "GPU alta: rave en la estación",
    zone: "station",
    length: 36,
    when: { gpuAbove: 0.6 },
    effects: { lights: [0, 36, "party"] },
    actors: [
      point("pole", 228, -33),
      { id: "disco", sprite: "st2_disco", px: 4, spin: 180, show: [0, 36], fade: [1, 1.5],
        glow: { r: 60, color: "#7df9ff", a: 0.25 },
        path: [{ t: 0, x: 228, y: -160 }, { t: 2, x: 228, y: -76, ease: "out" }],
        wobble: { from: 2, x: 4, xspeed: 3, y: 3, speed: 2.4 } },
      point("strobe0", 150, -150), point("strobe1", 330, -170), point("strobe2", 470, -110),
      point("spotA", 120, -40), point("spotB", 470, -30),
      crew("r0", [1.5, 36], hops(370, -42, 3, 35, 0.4, 14, 2), { wobble: { rot: 20, speed: 6 } }),
      crew("r1", [2.5, 36], hops(412, -80, 4, 35, 0.45, 18, 3), { wobble: { rot: 20, speed: 5, phase: 1 } }),
      crew("r2", [3.5, 36], hops(160, -70, 5, 35, 0.5, 16, 2), { wobble: { rot: 20, speed: 5.5, phase: 2 } }),
      { id: "cat", sprite: "catSit", px: 2, show: [5, 36], fade: [0.6, 1.2], path: hops(300, -40, 6, 35, 0.35, 10, 3) },
      { id: "ufo", frames: ["ufo0", "ufo1"], fps: 10, px: 3, show: [20, 36], fade: [1, 1.5],
        glow: { r: 60, color: "#ff8fa8", a: 0.2, dy: 10 },
        path: [{ t: 20, x: 760, y: -380 }, { t: 24, x: 540, y: -190, ease: "out" }],
        wobble: { from: 24, x: 30, xspeed: 1.2, y: 10, speed: 2.4, rot: 10 } }
    ],
    ropes: [{ a: "pole", b: "disco", sag: 0, color: "#a3a9c2", bOffset: [0, -10] }],
    shots: [
      { from: "disco", to: "spotA", start: 3, every: 0.5, count: 60, travel: 0.35, kind: "laser", color: "#ff8fa8", miss: [0, 40] },
      { from: "disco", to: "spotB", start: 3.25, every: 0.5, count: 60, travel: 0.35, kind: "laser", color: "#7df9ff", miss: [0, 50] }
    ],
    bursts: strobes(2, 34).concat([
      { at: "ufo", t: 30, duration: 2.5, count: 5, size: 60, spread: 50, colors: ["#ff8fa8", "#ffd65a", "#7df9ff", "#9dff7a"] }
    ]),
    particles: [
      { region: { x: 150, y: -22, w: 160, h: 14 }, style: "rise", glyph: "♪", from: 1, to: 34, count: 10, rate: 1.1, height: 110,
        color: ["#ff8fa8", "#ffd65a", "#7df9ff", "#9dff7a"] },
      { region: { x: 60, y: -260, w: 520, h: 220 }, style: "twinkle", from: 1, to: 35, count: 14, rate: 1.4,
        color: ["#ff8fa8", "#7df9ff", "#ffd65a", "#9dff7a", "#ffffff"], size: 1.4 },
      { at: "ufo", from: 24, to: 35, style: "rise", glyph: "♪", color: ["#9dff7a", "#ffd65a"], count: 3, rate: 0.8, height: 60 }
    ]
  }
]

if (typeof module !== "undefined") module.exports = { ART: ART, EPISODES: EPISODES }
