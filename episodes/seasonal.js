.pragma library

// Seasonal pack: episodes that only happen, or happen more, on some dates.
// `when` is a hard requirement; `boost` multiplies the weight when it holds.

var ART = {
  reindeer0: [
    "K.K.........",
    ".KK.........",
    ".TTT........",
    "TTKT........",
    "RTTTTTTTTTT.",
    "...TTTTTTTTT",
    "...TTTTTTTT.",
    "...T.T..T.T.",
    "...T..T.T..T"
  ],
  reindeer1: [
    "K.K.........",
    ".KK.........",
    ".TTT........",
    "TTKT........",
    "RTTTTTTTTTT.",
    "...TTTTTTTTT",
    "...TTTTTTTT.",
    "....TT...TT.",
    "....T.T..T.T"
  ],
  sleigh: [
    "........RAGL..",
    ".......RRAGGL.",
    "Y.....RRRRRRR.",
    "RY..RRRRRRRRRR",
    "RRRRRRRRRRRRR.",
    ".RRRRRRRRRRR..",
    "..Y.......Y...",
    "YYYYYYYYYYYYYY"
  ],
  ghost: {
    colors: { w: ["#eef0f7", 190] },
    rows: [".wwww.", "wwwwww", "wKwwKw", "wwwwww", "wwwwww", "w.ww.w"]
  },
  pumpkin: [
    "....L....",
    ".OOOLOOO.",
    "OOKOOOKOO",
    "OOOOOOOOO",
    "OOKKKKKOO",
    "OOOKOKOOO",
    ".OOOOOOO."
  ],
  mug: ["WWWW..", "WTTWWW", "WTTW.W", "WTTWWW", "WWWW.."]
}

function ghost(i, dx, dy) {
  return { id: "ghost" + i, sprite: "ghost", px: 4, opacity: 0.8, fade: [3, 3],
    path: [{ t: 0, x: dx, y: dy, on: "galleon" }], wobble: { x: 16, y: 20, speed: 1.1 + i * 0.3, phase: i * 2 } }
}

function shell(i, x, y, start, color) {
  return [
    { id: "shell" + i, path: [{ t: 0, x: x, y: y }] },
    { at: "shell" + i, style: "sparks", count: 16, every: 4.5, dur: 1.4, from: start, to: 40, radius: 80,
      color: color, size: 1.3 }
  ]
}

var SHELLS = [
  shell(0, "w0.12", "h0.25", 1, ["#ff8fa8", "#fff6c0"]),
  shell(1, "w0.3", "h0.18", 2.2, ["#7df9ff", "#ffffff"]),
  shell(2, "w0.5", "h0.3", 3.1, ["#ffd65a", "#ff9447"]),
  shell(3, "w0.68", "h0.2", 1.7, ["#3fae6a", "#fff6c0"]),
  shell(4, "w0.86", "h0.26", 3.8, ["#e2524a", "#ffffff", "#3d6fd8"])
]

function pumpkin(i, fx, fy) {
  return { id: "pumpkin" + i, sprite: "pumpkin", px: 4, fade: [3, 3], glow: { r: 30, color: "#ff9447", a: 0.12 },
    path: [{ t: 0, x: "w" + fx, y: "h" + fy }, { t: 50, x: "w" + (fx + 0.08), y: "h" + fy, ease: "linear" }],
    wobble: { y: 24, speed: 0.6 + i * 0.13, phase: i * 1.9, rot: 14 } }
}

var EPISODES = [
  {
    id: "sleigh",
    title: "Trineo navideño",
    zone: "world",
    length: 46,
    when: { months: [12] },
    weight: 3,
    actors: [
      { id: "lead", frames: ["reindeer0", "reindeer1"], fps: 4, px: 3, fade: [3, 3], facesLeft: true,
        path: [{ t: 0, x: "w0.05", y: "h0.15", flip: true }, { t: 46, x: "w0.95", y: "h0.15", ease: "linear" }],
        wobble: { y: 26, speed: 0.7 } },
      { id: "second", frames: ["reindeer1", "reindeer0"], fps: 4, px: 3, fade: [3, 3],
        facesLeft: true,
        path: [{ t: 0, x: 60, y: 8, on: "lead", flip: true }], wobble: { y: 4, speed: 3 } },
      { id: "sleigh", sprite: "sleigh", px: 4, fade: [3, 3],
        facesLeft: true,
        path: [{ t: 0, x: 104, y: 10, on: "second", flip: true }], wobble: { y: 5, speed: 2.2, rot: 4 } }
    ],
    ropes: [
      { a: "lead", b: "second", sag: 6, color: "#e9cf93", aOffset: [10, 6], bOffset: [-14, 6] },
      { a: "second", b: "sleigh", sag: 8, color: "#e9cf93", aOffset: [10, 6], bOffset: [-24, 0] }
    ],
    particles: [
      { at: "sleigh", from: 3, to: 43, style: "fall", count: 6, rate: 0.35, height: 420, size: 2,
        color: ["#e2524a", "#3fae6a", "#ffd65a", "#58c8ff"], offset: [0, 10] },
      { at: "sleigh", from: 3, to: 43, style: "twinkle", count: 8, rate: 1.2, color: "#ffd65a", offset: [40, -10], trail: true }
    ]
  },

  {
    id: "ghostShip",
    title: "Barco fantasma",
    zone: "world",
    length: 60,
    when: { months: [10] },
    weight: 3,
    boost: { dates: ["10-31"], weight: 4 },
    actors: [
      { id: "galleon", sprite: "pirate", facesLeft: true, px: 5, opacity: 0.45, fade: [4, 4], glow: { r: 90, color: "#7dffb0", a: 0.08 },
        path: [{ t: 0, x: "w0.95", y: "h0.36" }, { t: 60, x: "w0.05", y: "h0.36", ease: "linear" }],
        wobble: { y: 22, speed: 0.6, rot: 4 } },
      ghost(0, -40, -110), ghost(1, 60, -90), ghost(2, 10, -150)
    ],
    particles: [
      { at: "galleon", style: "smoke", count: 8, rate: 0.5, offset: [30, 20], trail: true, color: "#7dffb0", drift: [40, 20] }
    ]
  },

  {
    id: "fireworks",
    title: "Fuegos artificiales",
    zone: "world",
    length: 40,
    when: { night: true },
    weight: 0.5,
    boost: { dates: ["12-31", "01-01", "09-18", "09-19"], weight: 10 },
    actors: SHELLS.map(function(s) { return s[0] }),
    particles: SHELLS.map(function(s) { return s[1] })
  },

  {
    id: "valentine",
    title: "San Valentín",
    zone: "world",
    length: 30,
    when: { dates: ["02-14"] },
    weight: 4,
    particles: [
      { region: { x: 0, y: "h0.7", w: "w1", h: "h0.3" }, style: "rise", glyph: "\u2665", count: 40, rate: 0.12, height: 520,
        size: 1.5, color: ["#ff8fa8", "#e2524a", "#ffd0dc"] }
    ]
  },

  {
    id: "pumpkins",
    title: "Calabazas flotantes",
    zone: "world",
    length: 50,
    when: { months: [10] },
    weight: 2,
    actors: [pumpkin(0, 0.1, 0.3), pumpkin(1, 0.3, 0.7), pumpkin(2, 0.5, 0.4), pumpkin(3, 0.7, 0.75), pumpkin(4, 0.85, 0.25)]
  },

  {
    id: "mondayCoffee",
    title: "Lunes por la mañana",
    zone: "island",
    length: 25,
    when: { weekdays: [1], hours: [6, 12] },
    weight: 3,
    island: { scene: "idle" },
    actors: [{ id: "mug", sprite: "mug", px: 3, fade: [1, 1], path: [{ t: 0, x: 6, y: -28 }] }],
    particles: [
      { at: "mug", style: "rise", count: 5, rate: 0.6, height: 40, offset: [-2, -10], color: "#c9cbe0", size: 0.8 }
    ]
  }
]

if (typeof module !== "undefined") module.exports = { ART: ART, EPISODES: EPISODES }
