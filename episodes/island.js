.pragma library

// Island pack: stories on the castaway asteroid. Zone "island": x/y are
// offsets from the middle of the island's sand (y = 0 is the ground).
// Landmarks: palm -136, dog -78, astronaut -18 (head at y -50), fire +34,
// cat +66, tent +116. The glass dome tops out around y -135.

var ART = {
  scooter: {
    rows: [
      "..SSSS........",
      "..SsSs........",
      "..SSSS..BBB...",
      ".KKKKKKKBBBK..",
      "KRRRRRRRRRRRK.",
      "KRWWRRRRRRRRVK",
      ".KKNNNNNNNNKK.",
      "...K......K..."
    ]
  },
  pizzaBox: ["SSSSSS", "SsSSsS", "ssssss"],
  kite: [
    "....K....",
    "...KAK...",
    "..KAAWK..",
    ".KAAAWWK.",
    "KAAAAWWWK",
    ".KRRRRRK.",
    "..KRRRK..",
    "...KRK...",
    "....K...."
  ],
  coconut: [".T.", "TTT", ".T."],
  bottle: ["..K.", "..G.", ".BBB", ".BWB", "BBWB", "BBBB", "BBBB", ".BB."],
  letter: ["WWWWW", "WGGGW", "WWWWW", "WGGWW", "WWWWW"]
}

// Points around a circle, for loops in a flight path.
function loop(t0, t1, x, hy, r, steps) {
  var out = []
  for (var i = 1; i < steps; i++) {
    var a = i / steps * Math.PI * 2
    var dy = Math.round(-(1 - Math.cos(a)) * r)
    out.push({ t: t0 + (t1 - t0) * i / steps, x: x + Math.round(Math.sin(a) * r),
      y: "h" + hy + (dy < 0 ? String(dy) : "+" + dy), ease: "linear" })
  }
  return out
}

// Running back and forth with little hops through x positions (relative to
// the island); `delay` lets a chaser start a moment later.
function run(xs, delay, step) {
  var out = [{ t: delay, x: xs[0], y: -16 }], t = delay
  for (var i = 1; i < xs.length; i++) {
    var from = xs[i - 1], to = xs[i], n = Math.max(1, Math.round(Math.abs(to - from) / 40))
    for (var k = 1; k <= n; k++) {
      t += step
      out.push({ t: t, x: from + (to - from) * k / n, y: -16, arc: 12, ease: "linear", flip: k < n ? to < from : (xs[i + 1] !== undefined ? xs[i + 1] < to : false) })
    }
  }
  out[0].flip = xs[1] < xs[0]
  return out
}

var EPISODES = [
  {
    id: "dogfight",
    title: "El perro contra los piratas",
    zone: "island",
    length: 41,
    island: { scene: "sleep", hide: { dog: [4, 36.5] } },
    actors: [
      { id: "alert", text: "!", show: [0.5, 3], path: [{ t: 0, x: -50, y: -66 }] },
      { id: "ship", swap: [[0, "dogShip"], [5, "dogShipCrew"], [35.5, "dogShip"]], show: [1.5, 40],
        path: [
          { t: 1.5, x: -378, y: "above" },
          { t: 4, x: -78, y: -100, ease: "out" },
          { t: 5.2, x: -78, y: -100 },
          { t: 11, x: 560, y: "h0.3" },
          { t: 25, x: 560, y: "h0.3" }
        ].concat(loop(25, 28, 560, 0.3, 70, 12), [
          { t: 28, x: 560, y: "h0.3", ease: "linear", flip: true },
          { t: 35, x: -78, y: -100, flip: false },
          { t: 36.5, x: -78, y: -100 },
          { t: 40, x: 242, y: "above", ease: "in" }
        ]),
        wobble: [{ from: 11, to: 24.5, x: 20, xspeed: 0.7, y: 50, speed: 1.6 }, { y: 3, speed: 3 }] },
      { id: "dogUp", sprite: "dog", show: [4, 5],
        path: [{ t: 4, x: -78, y: -16 }, { t: 5, x: 0, y: 0, on: "ship", arc: 40, ease: "linear" }] },
      { id: "dogDown", sprite: "dog", show: [35.5, 36.5],
        path: [{ t: 35.5, x: 0, y: 0, on: "ship" }, { t: 36.5, x: -78, y: -16, arc: 40, ease: "linear" }] },
      { id: "pirate", sprite: "pirate", facesLeft: true, show: [7, 32],
        path: [
          { t: 7, x: 1480, y: "above" },
          { t: 12, x: 980, y: "h0.3-30", ease: "out" },
          { t: 24.6, x: 980, y: "h0.3-30", flip: true },
          { t: 32, x: 1880, y: "above", ease: "in", rot: 28 }
        ],
        wobble: [{ from: 12, to: 23.6, y: 20, speed: 1.1 }, { from: 23.6, to: 24.6, x: 4, y: 3, speed: 60, ramp: 0.05 },
                 { rot: 3, speed: 1.4 }] }
    ],
    shots: [
      { from: "ship", to: "pirate", start: 12.5, every: 1.3, count: 9, travel: 0.6, kind: "laser",
        fromOffset: [34, 0], toOffset: [-30, 0], hit: true },
      { from: "pirate", to: "ship", start: 13.2, every: 1.6, count: 6, travel: 1.1, kind: "ball",
        fromOffset: [-40, 12], miss: [-260, 65] }
    ],
    bursts: [{ at: "pirate", t: 23.5, duration: 2.5, count: 4, size: 46 }],
    particles: [
      { at: "pirate", from: 23.6, to: 32, style: "smoke", count: 8, rate: 0.9, offset: [-20, -30], trail: true },
      { at: "ship", from: 1.5, to: 40, style: "exhaust", count: 6, rate: 3, offset: [-34, 4] }
    ]
  },

  {
    id: "pizza",
    title: "Pizza a domicilio",
    zone: "island",
    length: 30,
    island: { scene: "wave" },
    actors: [
      { id: "scooter", sprite: "scooter", show: [0, 17],
        path: [
          { t: 0, x: 900, y: "above", flip: true },
          { t: 6, x: 116, y: -170, ease: "out" },
          { t: 11, x: 116, y: -170 },
          { t: 17, x: -1000, y: "above", ease: "in" }
        ],
        wobble: { from: 6, to: 11, y: 4, speed: 3 } },
      { id: "box", sprite: "pizzaBox", px: 4, fade: [0, 2],
        path: [
          { t: 0, x: -14, y: -26, on: "scooter" },
          { t: 7.5, x: -14, y: -26, on: "scooter" },
          { t: 9, x: 160, y: -6, ease: "in" }
        ] },
      { id: "eater", path: [{ t: 0, x: -18, y: -70 }] }
    ],
    particles: [
      { at: "scooter", from: 0, to: 17, style: "exhaust", count: 5, rate: 3, offset: [-30, 6] },
      { at: "eater", from: 12, to: 26, style: "rise", glyph: "♥", color: "#ff8fa8", count: 4, rate: 0.5, height: 60 }
    ]
  },

  {
    id: "kite",
    title: "Volantín",
    zone: "island",
    length: 36,
    weight: 1,
    boost: { months: [9], weight: 5 },
    island: { scene: "stargaze" },
    actors: [
      { id: "hand", path: [{ t: 0, x: 4, y: -40 }] },
      { id: "kite", sprite: "kite", px: 4,
        path: [
          { t: 0, x: 4, y: -40, rot: 0 },
          { t: 5, x: 170, y: -330, ease: "out", rot: 10 },
          { t: 31, x: 170, y: -330 },
          { t: 36, x: 4, y: -40, ease: "inOut", rot: 0 }
        ],
        wobble: { from: 4, to: 32, x: 40, xspeed: 0.9, y: 25, speed: 1.3, rot: 12 } },
      { id: "tail", path: [{ t: 0, x: -24, y: 70, on: "kite" }], wobble: { x: 20, speed: 2.4, y: 8 } }
    ],
    ropes: [
      { a: "hand", b: "kite", sag: 30, color: "#d8e6ff", bOffset: [0, 14] },
      { a: "kite", b: "tail", sag: -8, color: "#e2524a", aOffset: [0, 16] }
    ]
  },

  {
    id: "meteors",
    title: "Lluvia de estrellas",
    zone: "world",
    length: 32,
    boost: { night: true, weight: 3 },
    island: { scene: "stargaze" },
    particles: [
      { region: { x: 0, y: 0, w: "w1", h: "h0.45" }, style: "streak", count: 26, rate: 0.6, length: 420 },
      { region: { x: 0, y: 0, w: "w1", h: "h0.6" }, style: "twinkle", count: 30, rate: 0.4, color: ["#fff6c0", "#bcd4ff"] }
    ]
  },

  {
    id: "catdog",
    title: "El gato y el perro se persiguen",
    zone: "island",
    length: 22,
    island: { hide: { dog: [0, 21], cat: [0, 21] } },
    actors: [
      { id: "cat", sprite: "catSit", show: [0, 21], path: run([66, 170, -170, 170, -120, 66], 0, 0.45) },
      { id: "fish", sprite: "fish", px: 2, show: [0, 21], path: [{ t: 0, x: 14, y: -12, on: "cat" }] },
      { id: "dog", sprite: "dog", show: [0, 21], path: run([-78, 150, -150, 150, -100, -78], 0.9, 0.45) },
      { id: "bark", text: "!", show: [0.5, 2.5], path: [{ t: 0, x: 0, y: -40, on: "dog" }] }
    ]
  },

  {
    id: "coconut",
    title: "Un coco en la cabeza",
    zone: "island",
    when: { home: ["island"] },
    length: 14,
    island: { scene: "idle" },
    actors: [
      { id: "nut", sprite: "coconut", px: 4, show: [0, 14], fade: [0, 2],
        path: [
          { t: 0, x: -124, y: -54 },
          { t: 2, x: -124, y: -54 },
          { t: 3, x: -20, y: -66, arc: 50, ease: "in" },
          { t: 3.8, x: 40, y: -6, arc: 30, ease: "linear", rot: 180 },
          { t: 5, x: 96, y: -6, ease: "out", rot: 540 }
        ],
        wobble: { from: 0, to: 2, rot: 10, speed: 12 } },
      { id: "head", path: [{ t: 0, x: -18, y: -66 }] },
      { id: "star0", text: "*", size: 18, show: [3, 9], orbit: { on: "head", rx: 24, ry: 7, from: 0, to: 900, t0: 3, t1: 9 } },
      { id: "star1", text: "*", size: 18, show: [3, 9], orbit: { on: "head", rx: 24, ry: 7, from: 120, to: 1020, t0: 3, t1: 9 } },
      { id: "star2", text: "*", size: 18, show: [3, 9], orbit: { on: "head", rx: 24, ry: 7, from: 240, to: 1140, t0: 3, t1: 9 } }
    ]
  },

  {
    id: "bottle",
    title: "Mensaje en una botella",
    zone: "island",
    length: 26,
    island: { scene: "idle" },
    actors: [
      { id: "bottle", sprite: "bottle", px: 4, show: [0, 26], fade: [1, 2],
        path: [{ t: 0, x: -720, y: -260, rot: 0 }, { t: 10, x: -46, y: -14, ease: "out", rot: 380 }, { t: 26, x: -46, y: -14, rot: 380 }],
        wobble: { from: 0, to: 9, y: 12, speed: 1.4 } },
      { id: "wow", text: "!", show: [10.5, 12.5], path: [{ t: 0, x: -18, y: -96 }] },
      { id: "letter", sprite: "letter", px: 4, show: [12.5, 24], fade: [0, 1],
        path: [{ t: 12.5, x: -46, y: -20, scale: 0.4 }, { t: 14, x: 4, y: -44, ease: "out", scale: 1 }] }
    ],
    particles: [
      { at: "letter", from: 15, to: 22, style: "rise", glyph: "\u2665", color: "#ff8fa8", count: 4, rate: 0.5, height: 60 }
    ]
  }
]

if (typeof module !== "undefined") module.exports = { ART: ART, EPISODES: EPISODES }
