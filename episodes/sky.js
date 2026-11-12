.pragma library

// Sky pack: creatures that cross the whole panorama. Zone "world": numbers
// are absolute world pixels; "w0.5" and "h0.3" are fractions of the world.
// The world wraps around, so travellers fade in and out instead of entering
// from off-screen.

var ART = {
  dragon0: {
    colors: { g: "#2a7a4a" },
    rows: [
      "...........gg.............",
      "..........gLLg............",
      ".........gLLLLg...........",
      "........gLLLLLg.....LLL...",
      ".......gLLLLLg.....LLKLL..",
      "LL.....LLLLLLLLLLLLLLLLLRR",
      ".LLLLLLLLLLLLLLLLLLLLLLL..",
      "..LLLLSSSSSSSSSSSSLLLL....",
      "...LL..LL.....LL..LL......",
      ".........................."
    ]
  },
  dragon1: {
    colors: { g: "#2a7a4a" },
    rows: [
      "..........................",
      "..........................",
      "....................LLL...",
      "...................LLKLL..",
      "LL.....LLLLLLLLLLLLLLLLLRR",
      ".LLLLLLLLLLLLLLLLLLLLLLL..",
      "..LLLLSSSSgLLLgSSSLLLL....",
      "...LL..LgLLLLLLg..LL......",
      ".......gLLLLLLg...........",
      "........gggggg............"
    ]
  },
  duck: [
    "........YYYY....",
    ".......YYYYYY...",
    ".....OOYYYKYY...",
    "....OOOYYYYYY...",
    ".......YYYYY....",
    "......YYYYYYY..Y",
    "...YYYYYYYYYYYYY",
    "..YYYYYCCCCYYYYY",
    "..YYYYYYYYYYYYY.",
    "...YYYYYYYYYYY..",
    "....YYYYYYYYY..."
  ],
  engine: [
    "............KK..",
    "..KKKK......NN..",
    "..KVVK.....KNNK.",
    "KKKKKKKKKKKKKKKK",
    "KRRRRRRRRRRRRRRY",
    "KRRRRRRRRRRRRRRY",
    "KKKKKKKKKKKKKKKK",
    ".KnK..KnK..KnK..",
    "..K....K....K..."
  ],
  wagonBlue: ["KKKKKKKKKKKK", "KAAAAAAAAAAK", "KAVVAAVVAAAK", "KAAAAAAAAAAK", "KKKKKKKKKKKK", ".KnK....KnK.", "..K......K.."],
  wagonGreen: { colors: { A: "#3fae6a" }, rows: ["KKKKKKKKKKKK", "KAAAAAAAAAAK", "KAVVAAVVAAAK", "KAAAAAAAAAAK", "KKKKKKKKKKKK", ".KnK....KnK.", "..K......K.."] },
  wagonPink: { colors: { A: "#d98ab0" }, rows: ["KKKKKKKKKKKK", "KAAAAAAAAAAK", "KAVVAAVVAAAK", "KAAAAAAAAAAK", "KKKKKKKKKKKK", ".KnK....KnK.", "..K......K.."] },
  balloon: [
    "...RRWWRR...",
    ".RRRWWWWRRR.",
    "RRRRWWWWRRRR",
    "RRRRWWWWRRRR",
    "RRRRWWWWRRRR",
    ".RRRWWWWRRR.",
    "..RRWWWWRR..",
    "...RWWWWR...",
    "...K....K...",
    "....K..K....",
    "....KWWK....",
    "....TTTT....",
    "....TTTT...."
  ]
}

function duckling(i) {
  return { id: "duckling" + i, sprite: "duck", px: 2, fade: [3, 3],
    path: [{ t: 0, x: 110 + i * 46, y: 22, on: "duck", flip: true }],
    wobble: { y: 5, speed: 2.4, phase: i * 1.3, rot: 8 } }
}

function wagon(i, sprite) {
  return { id: "wagon" + i, sprite: sprite, px: 4, fade: [3, 3],
    path: [{ t: 0, x: -58 - i * 52, y: 4, on: "engine" }], wobble: { y: 2, speed: 3, phase: i } }
}

var EPISODES = [
  {
    id: "whale",
    title: "Ballena espacial",
    zone: "world",
    length: 80,
    actors: [
      { id: "whale", sprite: "whale", px: 5, fade: [3, 3],
        path: [{ t: 0, x: 40, y: "h0.2" }, { t: 80, x: "w0.92", y: "h0.2", ease: "linear" }],
        wobble: { y: 40, speed: 0.35, rot: 4 } },
      { id: "fish0", sprite: "fish", px: 3, fade: [3, 3], path: [{ t: 0, x: -190, y: 30, on: "whale", flip: true }],
        wobble: { y: 14, speed: 2.2 } },
      { id: "fish1", sprite: "fish", px: 3, fade: [3, 3], path: [{ t: 0, x: -236, y: 30, on: "whale", flip: true }],
        wobble: { y: 14, speed: 2.2, phase: 1.7 } },
      { id: "fish2", sprite: "fish", px: 3, fade: [3, 3], path: [{ t: 0, x: -282, y: 30, on: "whale", flip: true }],
        wobble: { y: 14, speed: 2.2, phase: 3.4 } }
    ],
    particles: [
      { at: "whale", from: 2, to: 77, style: "spout", count: 9, every: 9, dur: 1.6, offset: [10, -30] }
    ]
  },

  {
    id: "dragon",
    title: "Dragón de las estrellas",
    zone: "world",
    length: 60,
    actors: [
      { id: "dragon", frames: ["dragon0", "dragon1"], fps: 2.5, px: 4, fade: [3, 3],
        path: [{ t: 0, x: "w0.03", y: "h0.28" }, { t: 60, x: "w0.95", y: "h0.28", ease: "linear" }],
        wobble: { y: 34, speed: 0.5, rot: 5 } }
    ],
    particles: [
      { at: "dragon", from: 4, to: 56, style: "exhaust", forward: true, reach: 90, size: 1.8, count: 12, rate: 2.5,
        pulse: { every: 8, dur: 1.6 }, offset: [56, 2], color: "#ff9447" }
    ]
  },

  {
    id: "duck",
    title: "Patito de goma gigante",
    zone: "world",
    length: 72,
    actors: [
      { id: "duck", sprite: "duck", facesLeft: true, px: 5, fade: [3, 3],
        path: [{ t: 0, x: "w0.08", y: "h0.78", flip: true }, { t: 72, x: "w0.9", y: "h0.78", ease: "linear" }],
        wobble: { y: 6, speed: 1.2, rot: 5 } },
      duckling(0), duckling(1), duckling(2)
    ],
    particles: [
      { at: "duck", from: 3, to: 69, style: "rise", glyph: "♪", color: "#ffd65a", count: 3, rate: 0.5,
        pulse: { every: 10, dur: 2.5 }, offset: [-30, -40], height: 50 }
    ]
  },

  {
    id: "train",
    title: "Tren espacial",
    zone: "world",
    length: 60,
    actors: [
      { id: "engine", sprite: "engine", px: 4, fade: [3, 3],
        path: [{ t: 0, x: "w0.04", y: "h0.9" }, { t: 60, x: "w0.94", y: "h0.9", ease: "linear" }],
        wobble: { y: 10, speed: 0.6 } },
      wagon(0, "wagonBlue"), wagon(1, "wagonGreen"), wagon(2, "wagonPink"), wagon(3, "wagonBlue")
    ],
    particles: [
      { at: "engine", style: "smoke", count: 8, rate: 0.8, offset: [22, -30], trail: true, drift: [70, -60], color: "#c9cbe0" }
    ]
  },

  {
    id: "balloon",
    title: "Globo aerostático",
    zone: "world",
    length: 80,
    actors: [
      { id: "balloon", sprite: "balloon", px: 5, fade: [4, 4],
        path: [{ t: 0, x: "w0.1", y: "h0.62" }, { t: 80, x: "w0.55", y: "h0.25", ease: "sine" }],
        wobble: { x: 12, xspeed: 0.4, y: 16, speed: 0.6, rot: 3 } },
      { id: "burner", path: [{ t: 0, x: 0, y: 10, on: "balloon" }] }
    ],
    particles: [
      { at: "burner", style: "rise", count: 6, rate: 3, height: 30, size: 1.2, color: ["#ffd65a", "#ff9447"],
        pulse: { every: 7, dur: 1.5 }, from: 3, to: 76 }
    ]
  }
]

if (typeof module !== "undefined") module.exports = { ART: ART, EPISODES: EPISODES }
