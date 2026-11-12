.pragma library

// Station pack: stories around the wheel and its habitat. Zone "station":
// offsets from the wheel's hub. The wheel's rim is ~123 px out; the habitat
// runs from x +140 to +316 (y -32..+32) with its windows at y -16..+4 and a
// hatch at its right end (+318, 0). The crew is drawn small (px 2).

var ART = {
  sockRed: ["WRW..", "WWW..", "RRR..", "WWW..", "WWWWW", "RRRRR", ".WWW."],
  sockBlue: ["WAW..", "WWW..", "AAA..", "WWW..", "WWWWW", "AAAAA", ".WWW."],
  sockYellow: ["YOY..", "YYY..", "OOO..", "YYY..", "YYYYY", "OOOOO", ".YYY."]
}

function sock(i, sprite, start, out, drift, catchAt, spin) {
  return {
    id: "sock" + i, sprite: sprite, px: 3, show: [start, catchAt], spin: spin,
    path: [
      { t: start, x: 230, y: -10, scale: 0.3 },
      { t: start + 3, x: out[0], y: out[1], ease: "out", scale: 1 },
      { t: catchAt - 1, x: drift[0], y: drift[1], ease: "linear" },
      { t: catchAt, x: 0, y: -12, on: "crew" }
    ]
  }
}

var EPISODES = [
  {
    id: "socks",
    title: "Calcetines a la deriva",
    zone: "station",
    length: 32,
    actors: [
      { id: "oops", text: "!", show: [1.5, 3.5], path: [{ t: 0, x: 240, y: -50 }] },
      sock(0, "sockRed", 0, [330, -150], [380, -200], 10, 90),
      sock(1, "sockBlue", 0.5, [450, -40], [540, -20], 15, -120),
      sock(2, "sockYellow", 1, [300, 150], [350, 220], 20, 60),
      { id: "crew", sprite: "astronaut", px: 2, show: [3, 28],
        path: [
          { t: 3, x: 330, y: 0 },
          { t: 10, x: 380, y: -200 },
          { t: 15, x: 540, y: -20, flip: true },
          { t: 20, x: 350, y: 220 },
          { t: 27, x: 330, y: 0, flip: false }
        ],
        wobble: { rot: 10, speed: 1.5 } }
    ],
    particles: [{ at: "crew", from: 3, to: 28, style: "exhaust", count: 5, rate: 3, offset: [-10, 10], size: 0.7 }]
  },

  {
    id: "spacewalk",
    title: "Reparación en el exterior",
    zone: "station",
    length: 26,
    actors: [
      { id: "hatch", path: [{ t: 0, x: 318, y: 0 }] },
      { id: "walker", sprite: "astronaut", px: 2, show: [1, 25],
        path: [
          { t: 1, x: 322, y: 0 },
          { t: 6, x: 80, y: -118, ease: "inOut" },
          { t: 17, x: 80, y: -118 },
          { t: 24, x: 322, y: 0, ease: "inOut" }
        ],
        wobble: [{ rot: 14, speed: 0.9 }, { from: 6, to: 17, y: 3, speed: 2 }] },
      { id: "torch", path: [{ t: 0, x: -14, y: 6, on: "walker" }] }
    ],
    ropes: [{ a: "hatch", b: "walker", sag: -34, color: "#ffd65a", show: [1, 25] }],
    particles: [
      { at: "torch", from: 7, to: 16.5, style: "sparks", count: 16, rate: 2.2, radius: 26, size: 1.4, color: ["#ffd65a", "#fff6c0", "#7df9ff"] }
    ]
  }
]

if (typeof module !== "undefined") module.exports = { ART: ART, EPISODES: EPISODES }
