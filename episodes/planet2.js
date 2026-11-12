.pragma library

// Planeta 2: más historias alrededor del gigante gaseoso (zonas planet y sun).
// See EPISODES.md for the format; ART names use this pack's own prefix (p2_).
// Planet zone: offsets from the planet's centre; disc radius 240, ring about
// 375 x 112 tilted 11.5 degrees. Sun zone: offsets from the sun's centre (its
// disc has a radius of about 66 px on screen).

// ---------------------------------------------------------------- art helpers

function racer(main, dark) {
  return {
    colors: { x: main, y: dark },
    rows: [
      "KK............",
      "KxK...KKKK....",
      "KxxKKKBBBBK...",
      "KxxxxxxxxxxKK.",
      "KyxxxWxxxxxxxK",
      ".KyyyyyyyyyyK.",
      "..KKKKKKKKKK.."
    ]
  }
}

// A filled disc of radius R (in art pixels) with a rim and a few craters.
function moonDisc(R) {
  var rows = [], size = R * 2 + 2, c = size / 2
  for (var y = 0; y < size; y++) {
    var row = ""
    for (var x = 0; x < size; x++) {
      var dx = x + 0.5 - c, dy = y + 0.5 - c, d = Math.sqrt(dx * dx + dy * dy)
      if (d > R) row += "."
      else if (d > R - 1.2) row += (dx + dy < -R * 0.6) ? "y" : "K"
      else if (((x * 7 + y * 13) % 23 === 0 || (x * 5 + y * 11) % 29 === 0) && d < R - 4) row += "z"
      else row += "x"
    }
    rows.push(row)
  }
  return { colors: { x: "#1d1f31", y: "#4a5070", z: "#272a40" }, rows: rows }
}

// A ragged ring of light just outside the moon: the solar corona.
function corona(R0) {
  var out = R0 + 9, rows = [], size = out * 2 + 2, c = size / 2
  for (var y = 0; y < size; y++) {
    var row = ""
    for (var x = 0; x < size; x++) {
      var dx = x + 0.5 - c, dy = y + 0.5 - c, d = Math.sqrt(dx * dx + dy * dy)
      var th = Math.atan2(dy, dx)
      var ray = 3 + 5 * Math.pow(Math.abs(Math.sin(th * 3 + 0.4)), 4) + 2 * Math.pow(Math.abs(Math.cos(th * 5)), 6)
      if (d < R0 - 1 || d > R0 + ray) row += "."
      else if (d < R0 + 1.5) row += "a"
      else if (d < R0 + ray * 0.6) row += "b"
      else row += "c"
    }
    rows.push(row)
  }
  return { colors: { a: ["#fffbe6", 235], b: ["#fff0b0", 150], c: ["#ffd65a", 80] }, rows: rows }
}

var WORM = { x: "#c0679a", y: "#7d3a6b", z: "#ffc2da" }
var MANTA = { x: "#3b8fb0", y: "#1f5a7a", z: "#bfefff" }
var CREAM = { x: "#f3dcae", y: "#d0a066" }

var ART = {
  p2_racerY: racer("#ffd65a", "#c08a20"),
  p2_racerR: racer("#e2524a", "#8e2a2a"),
  p2_racerB: racer("#58a8ff", "#2a4a9a"),
  p2_flag: [
    "KKKKKKK",
    "KWNWNWK",
    "KNWNWNK",
    "KWNWNWK",
    "KKKKKKK",
    "K......",
    "K......",
    "K......",
    "K......"
  ],
  p2_trophy: [
    "KKKKKKKKK",
    "KWYYYYYcK",
    "KYYYYYYcK",
    ".KYYYYcK.",
    "..KYYcK..",
    "...KcK...",
    "...KcK...",
    "..KcccK..",
    ".KKKKKKK."
  ],

  p2_wormHead: {
    colors: WORM,
    rows: [
      "..KKKKKKK...",
      ".KxxxxxxxKK.",
      "KyxxxxxWWxxK",
      "KyxxxxxWKxxK",
      "KyxxxxxxxxxK",
      "KyxxxxxxKKKK",
      "KyzzzzKWKWK.",
      "KyyzzzzKKKK.",
      ".KyyyyyyyK..",
      "..KKKKKKK..."
    ]
  },
  p2_wormSeg: {
    colors: WORM,
    rows: [
      "..KKKKK..",
      ".KxxxxxK.",
      "KxWxxxxyK",
      "KxxxxxxyK",
      "KxxxxxxyK",
      "KzzzzzyyK",
      "KyzzzzyyK",
      ".KyyyyyK.",
      "..KKKKK.."
    ]
  },

  p2_gasWhale: {
    colors: { x: "#8fb3ff", y: "#5a6fd1", z: "#e6ecff" },
    rows: [
      "KK..........................",
      "KxK.........KKKKKKKKK.......",
      "KxxK.....KKKxxxxxxxxxKKK....",
      ".KxxK..KKxxxWxxxxxWxxxxxKK..",
      "..KxxKKxxxxxxxxxxxxxxxxxxxK.",
      "..KxxxxxxxxxxxxxxxxxxxxKxxxK",
      "..KyxxxxxxxxxxxxxxxxxxxxxxxK",
      ".KyyKyyxxxxxxxxxxxxxxxxxxxyK",
      "KyyK.KzzzzzzzzzzzzzzzzzzzyK.",
      "KyK...KKzKzKzKzKzzzzzzzyKK..",
      "KK......KKKKKKKKKzzzzzKK....",
      "................KKKKKK......"
    ]
  },

  p2_truck: {
    colors: { x: "#4fa35a", y: "#2f6b3a" },
    rows: [
      "..................KKKK....",
      "KK..KK..KK........KYYK....",
      "KxKKxxKKxxK....KKKKKKKKK..",
      "KxxxxxxxxxK....KxxxxxKBBK.",
      "KxxxxxxxxxKKKKKKxxxxxKBBBK",
      "KxxYxYxYxxxxxxxxxxxxxKKKKK",
      "KxxxxxxxxxxxxxxxxxxxxxxxxK",
      "KyyyyyyyyyyyyyyyyyyyyyyyyK",
      ".KnnK..........KnnK.....K.",
      "..KK............KK........"
    ]
  },
  p2_rock: [
    "..KKKK...",
    ".KMMMMKK.",
    "KMMGMMMmK",
    "KMMMMMmmK",
    "KMMMmMmmK",
    ".KmMMmmK.",
    "..KKKKK.."
  ],
  p2_rockCrystal: [
    "....K.....",
    "...KQK....",
    "..KKQKKK..",
    ".KMMKMMmK.",
    "KMGMMMMmmK",
    "KMMMMmMmmK",
    ".KmmMmmmK.",
    "..KKKKKK.."
  ],
  p2_rockFlat: [
    "..KKKKKKK...",
    ".KMMGMMMMKK.",
    "KMMMMMMMmmmK",
    ".KmmMmmmmmK.",
    "..KKKKKKKK.."
  ],

  p2_bus: [
    "....KKKKKKKKKKKKKKKKKKKKKKKK....",
    "...KYYYYYYYYYYYYYYYYYYYYYYYYKK..",
    "..KYKKKKKKKKKKKKKKKKKKKKKKYYKBK.",
    "..KYKBPBKBWBKBPBKBWBKBPBKYYKBBK.",
    "..KYKBPBKBWBKBPBKBWBKBPBKYYKBBBK",
    "..KYKKKKKKKKKKKKKKKKKKKKKKYYYYYK",
    "..KRRRRRRRRRRRRRRRRRRRRRRRRRRRRK",
    "..KYYYYYYYYYYYYYYYYYYYYYYYYYYYYK",
    "...KKnnKKKKKKKKKKKKKKKKKKnnKKKK.",
    "....KKKK...............KKKK....."
  ],

  p2_manta0: {
    colors: MANTA,
    rows: [
      ".......KK.......",
      "......KxxK......",
      ".....KxxxxK.....",
      "....KxxxxxxKK...",
      "KKKKyxxxzxxxxKK.",
      "....KyxxxxxxxKxK",
      "KKKKyxxxzxxxxKK.",
      "....KxxxxxxKK...",
      ".....KxxxxK.....",
      "......KxxK......",
      ".......KK......."
    ]
  },
  p2_manta1: {
    colors: MANTA,
    rows: [
      "................",
      "................",
      "......KKK.......",
      ".....KxxxKKK....",
      "KKKKyxxxzxxxKK..",
      "....KyxxxxxxxKxK",
      "KKKKyxxxzxxxKK..",
      ".....KxxxKKK....",
      "......KKK.......",
      "................",
      "................"
    ]
  },

  p2_rocketV: [
    "....K....",
    "...KRK...",
    "..KRRRK..",
    "..KWWWK..",
    "..KWVWK..",
    "..KWDWK..",
    "..KWWWK..",
    "..KWWWK..",
    "..KRWRK..",
    ".KRKWKRK.",
    "KRRKWKRRK",
    "KRK.K.KRK",
    "KK.KnK.KK",
    "...KnK..."
  ],
  p2_chute: [
    "....KKKKK....",
    "..KKRWRWRKK..",
    ".KRWRWRWRWRK.",
    "KRWRWRWRWRWRK",
    "KKKKKKKKKKKKK",
    ".K....K....K.",
    "..K...K...K..",
    "...K..K..K...",
    "....K.K.K...."
  ],

  p2_tug: [
    "......KKKK..........",
    "......KYYK..........",
    ".....KKKKKKKK.......",
    "....KOOOOOKBBK......",
    "KK.KOOOOOOKBBBK.....",
    "KnKOOOOOOOOOOOOKK...",
    "KnKOOOWOOWOOOOOOOK..",
    ".KKcccccccccccccccK.",
    "...KKKKKKKKKKKKKKK.."
  ],

  p2_puff: {
    colors: CREAM,
    rows: [
      ".....KKKK.......",
      "...KKxxxxKKKK...",
      "..KxxxxxxxxxxK..",
      ".KxxWxxxxxxxxxK.",
      "KxxxxxxxxxxxxxxK",
      "KxxxxxxxxxxxxxyK",
      "KyxxxxxxxxxxxyyK",
      ".KyyyyxxxyyyyyK.",
      "..KKKKyyyyKKKK..",
      "......KKKK......"
    ]
  },
  p2_feather: {
    colors: { x: "#ff8fa8", y: "#c95577" },
    rows: [
      "......KK.",
      "..KKKKxxK",
      "KKxxxxxxK",
      ".KKyyyyK.",
      "...KKKK.."
    ]
  },

  p2_moonDark: moonDisc(24),
  p2_corona: corona(24)
}

// ---------------------------------------------------------------- episode helpers

// One piece of the giant worm: it rises out of the clouds at E, arcs high
// and dives back in at D, `delay` seconds after the head.
var WE = { x: -182, y: -90 }, WD = { x: 182, y: -60 }
function wormPart(i, delay, sprite, scale) {
  var ts = 3 + i * delay, head = i === 0
  return {
    id: "worm" + i, sprite: sprite, px: 6, show: [ts, ts + 7.6],
    path: [
      { t: ts, x: WE.x, y: WE.y + 10, scale: scale * 0.3, o: 0, rot: head ? -70 : 0 },
      { t: ts + 0.5, x: WE.x + 8, y: WE.y - 26, scale: scale, o: 1, ease: "out" },
      { t: ts + 7, x: WD.x - 8, y: WD.y - 26, arc: 300, ease: "linear", rot: head ? 70 : 0 },
      { t: ts + 7.6, x: WD.x, y: WD.y + 10, scale: scale * 0.3, o: 0, ease: "in" }
    ],
    wobble: { y: 3, speed: 3, phase: i * 0.8 }
  }
}

// The gas whale (and its calf): out of the clouds, a high arc, back in.
function whaleJump(id, t0, px, from, to, arc) {
  return {
    id: id, sprite: "p2_gasWhale", px: px, show: [t0, t0 + 8.8],
    path: [
      { t: t0, x: from[0] - 10, y: from[1] + 25, scale: 0.4, o: 0, rot: -55 },
      { t: t0 + 0.8, x: from[0], y: from[1] - 20, scale: 1, o: 1, ease: "out" },
      { t: t0 + 7.8, x: to[0] - 10, y: to[1] - 30, arc: arc, ease: "linear", rot: 50 },
      { t: t0 + 8.8, x: to[0], y: to[1] + 15, scale: 0.4, o: 0, ease: "in" }
    ]
  }
}

// The UFO's circle: one glowing point dropped every second as it goes round.
var RING_C = { x: 0, y: -30, rx: 150, ry: 55 }
function ringPoint(i) {
  var a = (-90 + 30 * i) * Math.PI / 180, t = 8 + i
  return { id: "dot" + i, text: "*", color: "#7df9ff", size: 22, show: [t, 29], fade: [0.4, 2.5],
    glow: { r: 18, color: "#7df9ff", a: 0.3 },
    path: [{ t: 0, x: Math.round(RING_C.x + Math.cos(a) * RING_C.rx), y: Math.round(RING_C.y + Math.sin(a) * RING_C.ry) }] }
}

function rock(id, sprite, x, y, pick, phase) {
  return { id: id, sprite: sprite, px: 6, show: [0, pick + 1], fade: [1.5, 0],
    path: [
      { t: 0, x: x, y: y },
      { t: pick, x: x, y: y },
      { t: pick + 1, x: -40, y: -30, on: "truck", arc: 60, scale: 0.5, rot: 200, ease: "in" }
    ],
    wobble: { to: pick, y: 5, speed: 1.1, phase: phase, rot: 6 } }
}

// Camera flashes from the bus windows.
function flash(t, w, n, size) {
  return { at: "win" + w, t: t, duration: 0.45, count: n || 1, size: size || 26, spread: n > 2 ? 40 : 6,
    colors: ["#ffffff", "#fff6c0"] }
}

// A manta of the flock: the same diagonal across the ring, in formation.
function manta(i, dx, dy, delay) {
  var t0 = 1 + delay
  return { id: "manta" + i, frames: ["p2_manta0", "p2_manta1"], fps: 2.4, px: 6, show: [t0, t0 + 20], fade: [1, 1],
    path: [
      { t: t0, x: -1060 + dx, y: -330 + dy },
      { t: t0 + 20, x: 1060 + dx, y: 190 + dy, ease: "linear" }
    ],
    wobble: { y: 22, speed: 1.2, phase: -delay * 1.2, rot: 6 } }
}

// SOS from the lost satellite: · · ·  — — —  · · · every 6 s.
var SOS = [[0, 0.22], [0.45, 0.22], [0.9, 0.22], [1.6, 0.6], [2.4, 0.6], [3.2, 0.6], [4.1, 0.22], [4.55, 0.22], [5.0, 0.22]]
function sosLight(i) {
  var s = SOS[i]
  return { id: "sos" + i, text: "*", color: "#ff3b3b", size: 20, show: [2 + s[0], 20], blink: { every: 6, dur: s[1] },
    glow: { r: 34, color: "#ff3b3b", a: 0.35 },
    path: [{ t: 0, x: 0, y: -22, on: "sat" }] }
}

// Clouds blown out by the sneeze, from the planet's upper right limb.
var LIMB = { x: 170, y: -170 }
function puff(i, to, t0, scale) {
  return { id: "puff" + i, sprite: "p2_puff", px: 6, show: [t0, t0 + 8.5], fade: [0, 3],
    path: [
      { t: t0, x: LIMB.x, y: LIMB.y, scale: 0.25 * scale },
      { t: t0 + 1.4, x: to[0], y: to[1], scale: scale, ease: "out" },
      { t: t0 + 8.5, x: to[0] + 110, y: to[1] - 10, scale: scale * 1.4, ease: "linear" }
    ],
    wobble: { y: 5, speed: 1.3, phase: i } }
}

// ---------------------------------------------------------------- episodes

var EPISODES = [
  {
    id: "ringRace",
    title: "Carrera de naves alrededor del anillo",
    zone: "planet",
    length: 28,
    actors: [
      { id: "flag", sprite: "p2_flag", px: 4, fade: [1, 2], path: [{ t: 0, x: -82, y: 52 }],
        wobble: { rot: 5, speed: 3 } },
      // The yellow ship stalls after a lap, then fires its booster.
      { id: "yellow", sprite: "p2_racerY", px: 4, show: [0, 15], fade: [1, 0],
        orbit: { rx: 392, ry: 120, tilt: 11.5, dy: 6, from: 100, to: 470, t0: 2, t1: 14, ease: "out",
                 hideBehind: 250, faceMotion: true },
        wobble: [{ from: 10.5, to: 15, x: 3, xspeed: 9, y: 2, speed: 7, rot: 10 }] },
      { id: "yellow2", sprite: "p2_racerY", px: 4, show: [15, 20.6],
        orbit: { rx: 392, ry: 120, tilt: 11.5, dy: 6, from: 470, to: 840, t0: 15, t1: 20.6, ease: "in",
                 hideBehind: 250, faceMotion: true },
        wobble: { y: 2, speed: 5 } },
      // Past the line: it brakes into a victory lap.
      { id: "yellow3", sprite: "p2_racerY", px: 4, show: [20.6, 28], fade: [0, 2],
        orbit: { rx: 392, ry: 120, tilt: 11.5, dy: 6, from: 840, to: 940, t0: 20.6, t1: 23.5, ease: "out",
                 hideBehind: 250, faceMotion: true },
        wobble: { y: 2, speed: 5 } },
      { id: "red", sprite: "p2_racerR", px: 4, fade: [1, 2],
        orbit: { rx: 375, ry: 112, tilt: 11.5, from: 100, to: 880, t0: 2, t1: 25, ease: "sine",
                 hideBehind: 250, faceMotion: true },
        wobble: { y: 2, speed: 5, phase: 1 } },
      { id: "blue", sprite: "p2_racerB", px: 4, fade: [1, 2],
        orbit: { rx: 358, ry: 104, tilt: 11.5, dy: -6, from: 95, to: 850, t0: 2, t1: 25.5, ease: "sine",
                 hideBehind: 250, faceMotion: true },
        wobble: { y: 2, speed: 5, phase: 2 } },
      { id: "oops", text: "?", color: "#ffd65a", size: 22, show: [12, 14.8], fade: [0.3, 0.3],
        path: [{ t: 0, x: 0, y: -34, on: "yellow" }] },
      { id: "trophy", sprite: "p2_trophy", px: 3, show: [21, 28], fade: [0.5, 2],
        path: [{ t: 21, x: 0, y: -20, on: "yellow3", scale: 0.3 }, { t: 22, x: 0, y: -48, on: "yellow3", scale: 1, ease: "out" }],
        wobble: { y: 3, speed: 3 } }
    ],
    bursts: [
      { at: "flag", t: 1.4, duration: 0.8, count: 2, size: 26, colors: ["#ffffff"], spread: 8 },
      { at: "yellow2", t: 15, duration: 1, count: 3, size: 40, colors: ["#fff6c0", "#ff9447"], spread: 12 },
      { at: "flag", t: 20.5, duration: 2.5, count: 6, size: 46, colors: ["#ffd65a", "#ff8fa8", "#7df9ff"], spread: 50 }
    ],
    particles: [
      { at: "yellow", from: 10.5, to: 15, style: "smoke", count: 8, rate: 1.6, offset: [-26, 0], drift: [30, -40] },
      { at: "yellow2", from: 15, to: 16.8, style: "exhaust", count: 10, rate: 4, offset: [-28, 2], trail: true, reach: 50 },
      { at: "yellow2", from: 20, to: 20.6, style: "exhaust", count: 10, rate: 5, offset: [-28, 2], reach: 60 },
      { at: "yellow3", from: 20.8, to: 27, style: "sparks", count: 12, rate: 1.5, radius: 40, offset: [0, -10],
        color: ["#ffd65a", "#fff6c0", "#ff8fa8"] }
    ]
  },

  {
    id: "cloudWorm",
    title: "Un gusano gigante sale de las nubes",
    zone: "planet",
    length: 23,
    actors: [
      { id: "holeE", path: [{ t: 0, x: WE.x, y: WE.y }] },
      { id: "holeD", path: [{ t: 0, x: WD.x, y: WD.y }] },
      wormPart(10, 0.22, "p2_wormSeg", 0.55),
      wormPart(9, 0.22, "p2_wormSeg", 0.65),
      wormPart(8, 0.22, "p2_wormSeg", 0.72),
      wormPart(7, 0.22, "p2_wormSeg", 0.8),
      wormPart(6, 0.22, "p2_wormSeg", 0.86),
      wormPart(5, 0.22, "p2_wormSeg", 0.9),
      wormPart(4, 0.22, "p2_wormSeg", 0.95),
      wormPart(3, 0.22, "p2_wormSeg", 1),
      wormPart(2, 0.22, "p2_wormSeg", 1),
      wormPart(1, 0.22, "p2_wormSeg", 1),
      wormPart(0, 0.22, "p2_wormHead", 1.1),
      // It peeks out once more where it went in.
      { id: "peek", sprite: "p2_wormHead", px: 6, show: [16, 21],
        path: [
          { t: 16, x: WD.x + 30, y: WD.y + 12, scale: 0.3, o: 0, rot: -80 },
          { t: 16.8, x: WD.x + 30, y: WD.y - 30, scale: 1.1, o: 1, ease: "out" },
          { t: 20.2, x: WD.x + 30, y: WD.y - 30 },
          { t: 21, x: WD.x + 30, y: WD.y + 12, scale: 0.3, o: 0, ease: "in" }
        ],
        wobble: { from: 17, to: 20, rot: 10, speed: 3 } },
      { id: "love", text: "♥", color: "#ff8fa8", size: 24, show: [17.4, 20.4], fade: [0.3, 0.6],
        path: [{ t: 17.4, x: WD.x + 62, y: WD.y - 60 }, { t: 20.4, x: WD.x + 80, y: WD.y - 120, ease: "out" }] }
    ],
    particles: [
      { at: "holeE", from: 2.8, to: 6, style: "spout", count: 14, rate: 1.3, color: ["#f3dcae", "#ffffff", "#d0a066"] },
      { at: "holeD", from: 9.8, to: 13.4, style: "spout", count: 14, rate: 1.3, color: ["#f3dcae", "#ffffff", "#d0a066"] },
      { at: "holeD", from: 16, to: 17.2, style: "spout", count: 8, rate: 1.4, offset: [30, 0], color: ["#f3dcae", "#ffffff"] },
      { at: "holeE", from: 6, to: 11, style: "smoke", count: 5, rate: 0.7, drift: [0, -30], color: "#d9b98a" }
    ],
    bursts: [
      { at: "holeD", t: 10, duration: 1.2, count: 3, size: 40, colors: ["#f3dcae", "#ffffff"], spread: 20 }
    ]
  },

  {
    id: "gasWhale",
    title: "Una ballena de gas salta del planeta",
    zone: "planet",
    length: 18,
    actors: [
      { id: "holeA", path: [{ t: 0, x: -170, y: -40 }] },
      { id: "holeB", path: [{ t: 0, x: 150, y: -110 }] },
      whaleJump("whale", 1.5, 6, [-170, -40], [150, -110], 340),
      whaleJump("calf", 3.2, 3, [-170, -40], [150, -110], 250),
      { id: "love", text: "♥", color: "#ff8fa8", size: 26, show: [13.2, 17], fade: [0.4, 1],
        path: [{ t: 13.2, x: 150, y: -150 }, { t: 17, x: 170, y: -260, ease: "out" }],
        wobble: { x: 8, speed: 2 } }
    ],
    particles: [
      { at: "holeA", from: 1.5, to: 4.6, style: "spout", count: 16, rate: 1.2, size: 1.3, color: ["#f3dcae", "#ffffff", "#bfe0ff"] },
      { at: "holeB", from: 9.4, to: 13, style: "spout", count: 18, rate: 1.2, size: 1.5, color: ["#f3dcae", "#ffffff", "#bfe0ff"] },
      { at: "holeB", from: 12.8, to: 15.5, style: "spout", count: 10, rate: 1.6, size: 2, offset: [10, -10], color: ["#e8fbff", "#bfe0ff"] },
      { at: "whale", from: 2.5, to: 9, style: "fall", count: 8, rate: 1.4, height: 70, trail: true, offset: [-50, 20], color: "#bfe0ff" }
    ],
    bursts: [
      { at: "holeA", t: 1.6, duration: 1, count: 3, size: 46, colors: ["#ffffff", "#f3dcae"], spread: 24 },
      { at: "holeB", t: 9.5, duration: 1.2, count: 4, size: 56, colors: ["#ffffff", "#f3dcae"], spread: 30 },
      { at: "holeB", t: 11.2, duration: 1, count: 2, size: 34, colors: ["#ffffff", "#bfe0ff"], spread: 20 }
    ]
  },

  {
    id: "ufoCircle",
    title: "Un ovni dibuja un círculo en las nubes",
    zone: "planet",
    length: 30,
    actors: [
      { id: "pen", orbit: { x: RING_C.x, y: RING_C.y, rx: RING_C.rx, ry: RING_C.ry, from: -90, to: 270, t0: 8, t1: 20 } },
      { id: "mid", path: [{ t: 0, x: RING_C.x, y: RING_C.y }] },
      ringPoint(0), ringPoint(1), ringPoint(2), ringPoint(3), ringPoint(4), ringPoint(5),
      ringPoint(6), ringPoint(7), ringPoint(8), ringPoint(9), ringPoint(10), ringPoint(11),
      { id: "ufo", frames: ["ufo0", "ufo1"], fps: 6, show: [0, 28], fade: [1, 0],
        glow: { r: 50, color: "#7df9ff", a: 0.14, dy: 12 },
        path: [
          { t: 0, x: -1000, y: -460 },
          { t: 6.5, x: 0, y: -195, ease: "out" },
          { t: 8, x: 0, y: -110, on: "pen" },
          { t: 20, x: 0, y: -110, on: "pen" },
          { t: 22, x: 0, y: -230, ease: "inOut" },
          { t: 24.5, x: 0, y: -230 },
          { t: 28, x: 1100, y: -520, ease: "in" }
        ],
        wobble: [{ y: 5, speed: 2.2 }, { from: 22, to: 24.5, rot: 8, speed: 6 }] }
    ],
    beams: [{ src: "ufo", dst: "pen", show: [7.8, 20.3], w0: 18, w1: 40, color: "#7df9ff" }],
    bursts: [
      { at: "mid", t: 22.5, duration: 2, count: 8, size: 30, colors: ["#7df9ff", "#ffffff"], spread: 150 },
      { at: "mid", t: 23.2, duration: 1.6, count: 3, size: 70, colors: ["#e8fbff"], spread: 10 }
    ],
    particles: [
      { at: "pen", from: 8, to: 20, style: "sparks", count: 10, rate: 2, radius: 16, color: ["#7df9ff", "#ffffff"] },
      { region: { x: -160, y: -90, w: 320, h: 120 }, from: 21, to: 28, style: "twinkle", count: 14, rate: 0.8, color: "#bff8ff" }
    ]
  },

  {
    id: "garbageTruck",
    title: "Camión basurero espacial recoge rocas",
    zone: "planet",
    length: 30,
    actors: [
      rock("rock1", "p2_rock", -560, 110, 5.4, 0),
      rock("rock2", "p2_rockCrystal", -90, 300, 11.9, 2),
      rock("rock3", "p2_rockFlat", 420, 240, 18.4, 4),
      { id: "truck", sprite: "p2_truck", px: 5,
        path: [
          { t: 0, x: -1050, y: 60 },
          { t: 5, x: -445, y: 124, ease: "out" },
          { t: 7, x: -445, y: 124 },
          { t: 11.5, x: 25, y: 314, ease: "inOut" },
          { t: 13.5, x: 25, y: 314 },
          { t: 18, x: 535, y: 254, ease: "inOut" },
          { t: 24, x: 535, y: 254 },
          { t: 30, x: 1120, y: 120, ease: "in" }
        ],
        wobble: [{ y: 3, speed: 2 }, { from: 20.5, to: 23, x: 4, xspeed: 30, rot: 4, speed: 25 }] },
      { id: "beacon", text: "*", color: "#ff9447", size: 16, blink: { every: 0.8, dur: 0.4 },
        glow: { r: 22, color: "#ff9447", a: 0.35 }, path: [{ t: 0, x: 32, y: -25, on: "truck" }] },
      { id: "song", text: "♪", color: "#9fe3ff", size: 22, show: [23.3, 27], fade: [0.3, 1],
        path: [{ t: 23.3, x: 20, y: -40, on: "truck" }, { t: 27, x: 40, y: -90, on: "truck", ease: "out" }] }
    ],
    particles: [
      { at: "truck", style: "exhaust", count: 8, rate: 3, offset: [-62, 18], trail: true, reach: 26 },
      { at: "truck", from: 20.6, to: 23, style: "smoke", count: 6, rate: 1.5, offset: [-30, -26], drift: [-10, -50] }
    ],
    bursts: [
      { at: "truck", t: 21.2, duration: 0.6, count: 2, size: 22, colors: ["#a3a9c2", "#ffffff"], spread: 20, follow: true },
      { at: "truck", t: 22.1, duration: 0.6, count: 2, size: 22, colors: ["#a3a9c2", "#ffffff"], spread: 20, follow: true }
    ]
  },

  {
    id: "touristBus",
    title: "Bus de turistas con flashes de cámara",
    zone: "planet",
    length: 28,
    actors: [
      { id: "bus", sprite: "p2_bus", px: 5,
        path: [
          { t: 0, x: -1100, y: -380 },
          { t: 6, x: -440, y: -320, ease: "out" },
          { t: 12, x: -440, y: -320 },
          { t: 17, x: 360, y: 330, ease: "inOut" },
          { t: 22.5, x: 360, y: 330 },
          { t: 28, x: 1150, y: 230, ease: "in" }
        ],
        wobble: { y: 4, speed: 1.8 } },
      { id: "win0", path: [{ t: 0, x: -36, y: -6, on: "bus" }] },
      { id: "win1", path: [{ t: 0, x: 4, y: -6, on: "bus" }] },
      { id: "win2", path: [{ t: 0, x: 44, y: -6, on: "bus" }] },
      { id: "wow", text: "!", color: "#ffd65a", size: 26, show: [6.2, 8.2], fade: [0.2, 0.4],
        path: [{ t: 6.2, x: 10, y: -46, on: "bus" }, { t: 8.2, x: 10, y: -72, on: "bus", ease: "out" }] },
      { id: "wow2", text: "!", color: "#ffd65a", size: 26, show: [17.2, 19], fade: [0.2, 0.4],
        path: [{ t: 17.2, x: -20, y: -40, on: "bus" }, { t: 19, x: -20, y: -64, on: "bus", ease: "out" }] }
    ],
    bursts: [
      flash(7, 0), flash(7.5, 2), flash(8.1, 1), flash(8.4, 0), flash(9.2, 2), flash(9.8, 1, 2), flash(10.3, 0),
      flash(10.9, 2, 2), flash(11.4, 1), flash(17.6, 1), flash(18.1, 0, 2), flash(18.7, 2), flash(19.3, 1, 2), flash(20, 0),
      flash(21, 1, 6, 40)
    ],
    particles: [
      { at: "bus", from: 21, to: 24, style: "rise", count: 6, rate: 0.8, glyph: "♥", height: 90, offset: [0, -30], color: "#ff8fa8" },
      { at: "bus", style: "exhaust", count: 6, rate: 3, offset: [-74, 14], trail: true }
    ]
  },

  {
    id: "mantaFlock",
    title: "Bandada de mantarrayas cruza el anillo",
    zone: "planet",
    length: 25,
    actors: [
      manta(0, 0, 0, 0),
      manta(1, -110, -70, 0.4),
      manta(2, -110, 70, 0.4),
      manta(3, -220, -140, 0.8),
      manta(4, -220, 140, 0.8),
      // The little one falls behind, looks around and hurries to catch up.
      { id: "baby", frames: ["p2_manta0", "p2_manta1"], fps: 3.5, px: 4, show: [3, 24.5], fade: [1, 1],
        path: [
          { t: 3, x: -1060, y: -330 },
          { t: 11, x: -420, y: -160, ease: "linear" },
          { t: 13, x: -390, y: -150, ease: "out" },
          { t: 22.5, x: 940, y: 190, ease: "in" }
        ],
        wobble: { y: 14, speed: 2, rot: 8 } },
      { id: "huh", text: "?", color: "#ffd65a", size: 20, show: [11.2, 13.4], fade: [0.2, 0.3],
        path: [{ t: 0, x: 0, y: -30, on: "baby" }] },
      { id: "yay", text: "♥", color: "#ff8fa8", size: 20, show: [21.5, 24], fade: [0.2, 0.8],
        path: [{ t: 21.5, x: 0, y: -26, on: "baby" }, { t: 24, x: 0, y: -60, on: "baby" }] }
    ],
    particles: [
      { at: "manta0", from: 1, to: 21, style: "twinkle", count: 10, rate: 0.7, trail: true, offset: [-30, 0], color: "#bfefff" },
      { at: "manta3", from: 2, to: 21, style: "twinkle", count: 6, rate: 0.7, trail: true, offset: [-30, 0], color: "#bfefff" },
      { at: "manta4", from: 2, to: 21, style: "twinkle", count: 6, rate: 0.7, trail: true, offset: [-30, 0], color: "#bfefff" },
      { at: "baby", from: 13, to: 22.5, style: "streak", angle: 194, length: 60, count: 6, rate: 2.5, trail: true, size: 0.5, color: "#bfefff" }
    ]
  },

  {
    id: "rocketCrash",
    title: "Un cohete aterriza mal",
    zone: "planet",
    length: 28,
    actors: [
      { id: "rocket", sprite: "p2_rocketV", px: 4,
        path: [
          { t: 0, x: 760, y: -620 },
          { t: 6, x: 430, y: -200, ease: "linear" },
          { t: 9.5, x: 226, y: 102, ease: "in", rot: 10 },
          { t: 10.4, x: 240, y: 116, rot: 95, ease: "out" }
        ],
        wobble: [{ from: 2, to: 9.5, x: 16, xspeed: 4, rot: 22, speed: 3 }] },
      { id: "pilot", swap: [[0, "astronaut"], [24, "astronautWave"]], px: 4, show: [6, 28], fade: [0, 1.5],
        path: [
          { t: 6, x: 0, y: -10, on: "rocket" },
          { t: 7.5, x: 580, y: -420, ease: "out" },
          { t: 21, x: 345, y: 78, ease: "linear" }
        ],
        wobble: { from: 8, to: 20.5, x: 28, xspeed: 1.2, rot: 10, speed: 1.2 } },
      { id: "chute", sprite: "p2_chute", px: 4, show: [7.4, 23], fade: [0, 1.5],
        path: [
          { t: 7.4, x: 0, y: -40, on: "pilot", scale: 0.3 },
          { t: 8.2, x: 0, y: -48, on: "pilot", scale: 1, ease: "out" },
          { t: 21, x: 0, y: -48, on: "pilot" },
          { t: 23, x: 40, y: -6, on: "pilot", scale: 0.7, ease: "out" }
        ] },
      { id: "eject", text: "!", color: "#ffd65a", size: 24, show: [5.4, 7], fade: [0.2, 0.3],
        path: [{ t: 0, x: 26, y: -40, on: "rocket" }] },
      { id: "huh", text: "?", color: "#ffd65a", size: 24, show: [21.6, 23.6], fade: [0.2, 0.3],
        path: [{ t: 0, x: 0, y: -46, on: "pilot" }] },
      { id: "ok", text: "✓", color: "#7dff9a", size: 24, show: [24.4, 27.5], fade: [0.3, 0.6],
        path: [{ t: 24.4, x: 22, y: -44, on: "pilot" }, { t: 27.5, x: 22, y: -70, on: "pilot", ease: "out" }] }
    ],
    particles: [
      { at: "rocket", from: 0, to: 9.5, style: "fall", count: 10, rate: 3, height: 50, offset: [0, 34], color: ["#ff9447", "#ffd65a", "#fff6c0"] },
      { at: "rocket", from: 2, to: 9.5, style: "smoke", count: 10, rate: 1.4, offset: [0, 20], trail: true, drift: [20, -20] },
      { at: "rocket", from: 9.6, to: 28, style: "smoke", count: 10, rate: 1, offset: [-10, -10], drift: [-12, -90], size: 1.2 },
      { at: "rocket", from: 9.6, to: 13, style: "sparks", count: 12, rate: 1.4, radius: 40, color: ["#ff9447", "#ffd65a"] }
    ],
    bursts: [
      { at: "rocket", t: 9.5, duration: 1.6, count: 5, size: 60, colors: ["#ff9447", "#ffd65a", "#fff6c0"], spread: 26 },
      { at: "rocket", t: 25.5, duration: 0.8, count: 2, size: 26, colors: ["#ffd65a"], spread: 12 }
    ]
  },

  {
    id: "lostSatellite",
    title: "Satélite perdido parpadea SOS",
    zone: "planet",
    length: 31,
    actors: [
      { id: "sat", sprite: "satellite", px: 5,
        path: [
          { t: 0, x: -560, y: -300 },
          { t: 20.5, x: -470, y: -250, ease: "linear" },
          { t: 22.5, x: -170, y: 24, on: "tug", ease: "inOut" },
          { t: 31, x: -170, y: 24, on: "tug" }
        ],
        wobble: [{ to: 20.5, rot: 14, speed: 0.6, y: 6 }, { from: 22.5, y: 6, speed: 1.5 }] },
      sosLight(0), sosLight(1), sosLight(2), sosLight(3), sosLight(4), sosLight(5), sosLight(6), sosLight(7), sosLight(8),
      { id: "safe", text: "*", color: "#7dff9a", size: 18, show: [21.5, 31], blink: { every: 1, dur: 0.5 },
        glow: { r: 26, color: "#7dff9a", a: 0.3 }, path: [{ t: 0, x: 0, y: -22, on: "sat" }] },
      { id: "tug", sprite: "p2_tug", px: 5,
        path: [
          { t: 0, x: 1100, y: -440, flip: true },
          { t: 11, x: 1000, y: -430, flip: true },
          { t: 19, x: -360, y: -290, ease: "out", flip: true },
          { t: 21, x: -340, y: -300, flip: false },
          { t: 22.5, x: -330, y: -300 },
          { t: 31, x: 1100, y: -400, ease: "in" }
        ],
        wobble: { y: 4, speed: 2 } },
      { id: "spot", text: "!", color: "#ffd65a", size: 24, show: [17.6, 19.6], fade: [0.2, 0.3],
        path: [{ t: 0, x: 0, y: -38, on: "tug" }] },
      { id: "thanks", text: "♥", color: "#ff8fa8", size: 22, show: [23, 26.5], fade: [0.3, 0.8],
        path: [{ t: 23, x: -20, y: -30, on: "sat" }, { t: 26.5, x: -30, y: -80, on: "sat", ease: "out" }] }
    ],
    ropes: [{ a: "tug", b: "sat", show: [20.8, 31], sag: 24, aOffset: [-48, 10], bOffset: [24, 0], color: "#d8e6ff" }],
    particles: [
      { at: "tug", from: 11, to: 31, style: "exhaust", count: 6, rate: 3, offset: [-50, 6], trail: true }
    ]
  },

  {
    id: "planetSneeze",
    title: "El planeta estornuda una nube",
    zone: "planet",
    length: 17,
    actors: [
      { id: "limb", path: [{ t: 0, x: LIMB.x, y: LIMB.y }] },
      { id: "feather", sprite: "p2_feather", px: 6, show: [0, 9.6], fade: [1.5, 1],
        path: [
          { t: 0, x: 560, y: -440 },
          { t: 4.4, x: 212, y: -206, ease: "out" },
          { t: 6.8, x: 206, y: -200 },
          { t: 8.6, x: 820, y: -520, ease: "out", rot: 720 }
        ],
        wobble: [{ to: 4.4, x: 30, xspeed: 1.4, y: 18, speed: 1.4, rot: 25 }, { from: 4.4, to: 6.8, x: 8, xspeed: 9, rot: 30, speed: 9 }] },
      { id: "itch", text: "!", color: "#ffd65a", size: 22, show: [4.8, 6.8], fade: [0.2, 0.1],
        path: [{ t: 4.8, x: 120, y: -250, scale: 0.8 }, { t: 6.7, x: 120, y: -262, scale: 1.8, ease: "in" }],
        wobble: { x: 3, xspeed: 20 } },
      puff(0, [400, -330], 6.8, 1.6),
      puff(1, [350, -230], 6.85, 1.3),
      puff(2, [300, -390], 6.9, 1.1),
      puff(3, [500, -270], 6.95, 1.4),
      puff(4, [290, -260], 12, 0.6),
      { id: "bless", text: "♥", color: "#ff8fa8", size: 22, show: [13.6, 16.5], fade: [0.3, 1],
        path: [{ t: 13.6, x: 120, y: -270 }, { t: 16.5, x: 110, y: -340, ease: "out" }] }
    ],
    bursts: [
      { at: "limb", t: 6.8, duration: 1.4, count: 5, size: 70, colors: ["#fff6e0", "#f3dcae"], spread: 40 },
      { at: "limb", t: 12, duration: 0.8, count: 2, size: 30, colors: ["#fff6e0"], spread: 10 }
    ],
    particles: [
      { at: "limb", from: 6.8, to: 8.5, every: 10, dur: 1.6, style: "smoke", count: 14, drift: [-320, -260], size: 1.4, color: "#f3dcae" },
      { at: "limb", from: 6.8, to: 8.5, every: 10, dur: 1.3, style: "sparks", count: 16, radius: 160, color: ["#ffffff", "#f3dcae"] }
    ]
  },

  {
    id: "eclipse",
    title: "Eclipse de sol",
    zone: "sun",
    length: 40,
    actors: [
      { id: "corona", sprite: "p2_corona", px: 3, show: [14.5, 25.5], fade: [2, 2],
        glow: { r: 130, color: "#fff6c0", a: 0.1 }, path: [{ t: 0, x: 0, y: 0 }], spin: 3 },
      { id: "moon", sprite: "p2_moonDark", px: 3, fade: [3, 3],
        path: [
          { t: 0, x: -340, y: 80 },
          { t: 15, x: -18, y: 4, ease: "out" },
          { t: 25, x: 18, y: -4, ease: "linear" },
          { t: 40, x: 340, y: -80, ease: "in" }
        ] },
      { id: "bead1", path: [{ t: 0, x: 64, y: -15 }] },
      { id: "bead2", path: [{ t: 0, x: -64, y: 15 }] }
    ],
    bursts: [
      { at: "bead1", t: 14, duration: 1.4, count: 3, size: 34, colors: ["#ffffff", "#fff6c0"], spread: 4 },
      { at: "bead2", t: 25.4, duration: 1.6, count: 3, size: 40, colors: ["#ffffff", "#fff6c0"], spread: 4 }
    ],
    particles: [
      { region: { x: -800, y: -180, w: 1600, h: 560 }, from: 14.5, to: 25, style: "twinkle", count: 26, rate: 0.35, color: ["#ffffff", "#fff6c0", "#bfe0ff"] }
    ]
  }
]

if (typeof module !== "undefined") module.exports = { ART: ART, EPISODES: EPISODES }
