.pragma library

// Planet pack: stories around the ringed gas giant. Zone "planet": offsets
// from the planet's centre. The disc has a radius of 240 px; the ring is an
// ellipse of about 375 x 112 px tilted 11.5 degrees (right side lower).

function jelly(color) {
  var c = { P: [color, 215], W: "#ffffff" }
  return [
    { colors: c, rows: ["..PPPPP..", ".PPWPPPP.", "PPPPPPPPP", "PPPPPPPPP", "P.P.P.P.P", ".P.P.P.P.", "P.P...P.P"] },
    { colors: c, rows: ["..PPPPP..", ".PPWPPPP.", "PPPPPPPPP", "PPPPPPPPP", ".P.P.P.P.", "P.P.P.P.P", ".P.P.P.P."] }
  ]
}
var JP = jelly("#ff8fa8"), JC = jelly("#7df9ff")

var ART = {
  surfer: {
    colors: { b: "#58c8ff", d: "#1f4f86" },
    rows: [
      "...KKKK....",
      "..KWWWWK...",
      "..KWVVWK...",
      "..KWVDWK...",
      "...KWWK....",
      "..KWOOWK...",
      ".KWKWWKWK..",
      "KW.KWWK.WK.",
      "...KWWK....",
      "..KW..WK...",
      ".KW....WK..",
      "bbbbbbbbbbb",
      ".ddddddddd."
    ]
  },
  jellyPink0: JP[0], jellyPink1: JP[1], jellyCyan0: JC[0], jellyCyan1: JC[1]
}

function jellyActor(i, x, start, cyan) {
  var name = cyan ? "jellyCyan" : "jellyPink"
  return {
    id: "jelly" + i, frames: [name + "0", name + "1"], fps: 1.6, px: 4, show: [start, start + 30], fade: [2, 3],
    glow: { r: 34, color: cyan ? "#7df9ff" : "#ff8fa8", a: 0.16 },
    path: [{ t: start, x: x, y: "below" }, { t: start + 30, x: x + 40, y: "above", ease: "linear" }],
    wobble: { x: 22, speed: 0.8, phase: i * 1.7, rot: 8 }
  }
}

var EPISODES = [
  {
    id: "abduction",
    title: "Abducción de la vaca",
    zone: "planet",
    length: 31,
    actors: [
      { id: "rock", sprite: "grassRock",
        path: [
          { t: 0, x: 560, y: "below" },
          { t: 6, x: 545, y: 300, ease: "out" },
          { t: 25, x: 545, y: 300 },
          { t: 31, x: 530, y: "below", ease: "in" }
        ] },
      { id: "ufo", frames: ["ufo0", "ufo1"], fps: 6, show: [3, 26], glow: { r: 55, color: "#7df9ff", a: 0.14, dy: 12 },
        path: [
          { t: 3, x: -240, y: "above" },
          { t: 9, x: 515, y: -270, ease: "out" },
          { t: 19, x: 515, y: -270 },
          { t: 26, x: 2700, y: "above", ease: "in" }
        ],
        wobble: [{ from: 9, to: 19, x: 14, xspeed: 1.3, y: 6, speed: 2.1 }, { rot: 4, speed: 2.3 }] },
      { id: "cow", sprite: "cow", px: 3, show: [0, 17],
        path: [
          { t: 0, x: 0, y: -29, on: "rock" },
          { t: 11, x: 0, y: -29, on: "rock" },
          { t: 17, x: 0, y: 18, on: "ufo", ease: "inOut", rot: 160, scale: 0.45 }
        ],
        wobble: { from: 11, to: 17, rot: 20, speed: 2 } },
      { id: "huh", text: "?", show: [9.6, 11.2], path: [{ t: 0, x: -26, y: -32, on: "cow" }] }
    ],
    beams: [{ src: "ufo", dst: "rock", show: [9.5, 18.5], dstOffset: [0, -18] }]
  },

  {
    id: "surfer",
    title: "Surf en el anillo",
    zone: "planet",
    length: 27,
    actors: [
      { id: "surfer", sprite: "surfer", px: 4, show: [0, 27], fade: [1.5, 1.5],
        orbit: { rx: 375, ry: 112, tilt: 11.5, from: 160, to: 560, t0: 1, t1: 26, dy: -22,
                 hideBehind: 250, faceMotion: true, ease: "sine" },
        wobble: { rot: 8, speed: 2.2 } }
    ],
    particles: [
      { at: "surfer", style: "sparks", count: 10, rate: 1.4, offset: [0, 24], trail: true, radius: 14,
        color: ["#9fe3ff", "#ffffff"] }
    ]
  },

  {
    id: "jellyfish",
    title: "Medusas espaciales",
    zone: "planet",
    length: 44,
    boost: { night: true, weight: 2 },
    actors: [
      jellyActor(0, 360, 0, false),
      jellyActor(1, 520, 3, true),
      jellyActor(2, 700, 6, false),
      jellyActor(3, 450, 9, true),
      jellyActor(4, 820, 12, true)
    ],
    particles: [
      { at: "jelly0", from: 0, to: 30, style: "rise", count: 4, rate: 0.6, height: 50, color: "#ff8fa8", offset: [0, 20] },
      { at: "jelly1", from: 3, to: 33, style: "rise", count: 4, rate: 0.6, height: 50, color: "#7df9ff", offset: [0, 20] }
    ]
  }
]

if (typeof module !== "undefined") module.exports = { ART: ART, EPISODES: EPISODES }
