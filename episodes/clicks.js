.pragma library

// Clicks pack: what the dog, the cat and the astronaut do when you click
// them (events clickDog, clickCat, clickAstronaut). Each click picks one of
// that character's episodes at random; `when.scene` lets the astronaut react
// differently while asleep. Zone "island" (see island.js for landmarks).

var ART = {
  ball: { colors: { g: "#c8e04a" }, rows: [".gg.", "gWgg", "ggWg", ".gg."] },
  bone: ["W.....W", "WWWWWWW", "W.....W"],
  phone: ["KKKK", "KVVK", "KVVK", "KKKK"],
  yarn: { colors: { p: "#d98ab0", q: "#a3577c" }, rows: [".ppp.", "pqpqp", "ppqpp", "pqpqp", ".ppp."] }
}

var AWAKE = ["idle", "fish", "wave", "cat", "stargaze"]

// Running with little hops through x positions, at ground level `y`.
function run(xs, delay, step, y) {
  var out = [{ t: delay, x: xs[0], y: y, flip: xs[1] < xs[0] }], t = delay
  for (var i = 1; i < xs.length; i++) {
    var from = xs[i - 1], to = xs[i], n = Math.max(1, Math.round(Math.abs(to - from) / 40))
    for (var k = 1; k <= n; k++) {
      t += step
      // A keyframe's flip holds until the next one: face where we go next.
      var goingLeft = k < n ? to < from : (i + 1 < xs.length ? xs[i + 1] < to : false)
      out.push({ t: t, x: from + (to - from) * k / n, y: y, arc: 12, ease: "linear", flip: goingLeft })
    }
  }
  return out
}

// A loop in the air, as keyframes around (x, y - r).
function loop(t0, t1, x, y, r, steps) {
  var out = []
  for (var i = 1; i <= steps; i++) {
    var a = i / steps * Math.PI * 2
    out.push({ t: t0 + (t1 - t0) * i / steps, x: x + Math.sin(a) * r, y: y - (1 - Math.cos(a)) * r, ease: "linear",
      rot: -i / steps * 360 })
  }
  return out
}

function dizzy(id, on, t0, t1, from) {
  return { id: id, text: "*", size: 16, show: [t0, t1], color: "#ffd65a",
    orbit: { on: on, rx: 20, ry: 6, from: from, to: from + 720, t0: t0, t1: t1 } }
}

var EPISODES = [
  // ------------------------------------------------------------ dog

  {
    id: "dogFetch",
    title: "El perro busca la pelota",
    on: "clickDog",
    zone: "island",
    length: 9,
    island: { scene: "idle", hide: { dog: [0, 5.2] } },
    actors: [
      { id: "dog", sprite: "dog", show: [0, 5.2], path: run([-78, 160, -78], 0.6, 0.35, -16) },
      { id: "ball", sprite: "ball", px: 3, fade: [0, 1.5],
        path: [
          { t: 0, x: 0, y: -40 },
          { t: 2, x: 168, y: -6, arc: 150, ease: "linear" },
          { t: 2.7, x: 168, y: -6 },
          { t: 2.75, x: 20, y: -8, on: "dog" },
          { t: 4.8, x: 20, y: -8, on: "dog" },
          { t: 5.3, x: -40, y: -6, arc: 10 }
        ] }
    ],
    particles: [{ at: "dog", from: 5, to: 8, style: "rise", glyph: "♥", color: "#ff8fa8", count: 3, rate: 0.7, height: 50 }]
  },

  {
    id: "dogSpin",
    title: "El perro persigue su cola",
    on: "clickDog",
    zone: "island",
    length: 8,
    island: { hide: { dog: [0, 5] } },
    actors: [
      { id: "dog", sprite: "dog", show: [0, 5], spin: 288, path: [{ t: 0, x: -78, y: -16 }] },
      { id: "head", path: [{ t: 0, x: -70, y: -42 }] },
      dizzy("s0", "head", 5, 8, 0), dizzy("s1", "head", 5, 8, 180)
    ]
  },

  {
    id: "dogDig",
    title: "El perro encuentra un hueso",
    on: "clickDog",
    zone: "island",
    length: 9,
    island: { hide: { dog: [0, 4.2] } },
    actors: [
      { id: "dog", sprite: "dog", show: [0, 4.2], path: [{ t: 0, x: -78, y: -16 }],
        wobble: { from: 0.3, to: 4, rot: 14, speed: 16, y: 2 } },
      { id: "hole", path: [{ t: 0, x: -52, y: -2 }] },
      { id: "bone", sprite: "bone", px: 4, show: [4, 9], fade: [0, 1.5], glow: { r: 26, color: "#fff6c0", a: 0.2 },
        path: [{ t: 4, x: -52, y: -4 }, { t: 5, x: -52, y: -64, ease: "out" }], wobble: { from: 5, to: 9, y: 4, speed: 3 } },
      { id: "wow", text: "!", show: [4.4, 6.5], path: [{ t: 0, x: -78, y: -60 }] }
    ],
    particles: [
      { at: "hole", from: 0.3, to: 4, style: "sparks", count: 10, rate: 2.4, radius: 26, color: ["#c9a86a", "#8a5a35"], size: 1.3 }
    ]
  },

  // ------------------------------------------------------------ cat

  {
    id: "catPurr",
    title: "El gato ronronea",
    on: "clickCat",
    zone: "island",
    length: 7,
    actors: [{ id: "cat", path: [{ t: 0, x: 66, y: -40 }] }],
    particles: [
      { at: "cat", style: "rise", glyph: "♥", color: "#ff8fa8", count: 3, rate: 0.6, height: 60, to: 6 },
      { at: "cat", style: "rise", glyph: "♪", color: "#ffd65a", count: 2, rate: 0.5, height: 50, from: 0.8, to: 6 }
    ]
  },

  {
    id: "catJump",
    title: "El gato salta a la cúpula",
    on: "clickCat",
    zone: "island",
    length: 8,
    island: { hide: { cat: [0, 6] } },
    actors: [
      { id: "cat", sprite: "catSit", show: [0, 6],
        path: [
          { t: 0, x: 66, y: -16 },
          { t: 1.1, x: 30, y: -116, ease: "out", arc: 20, rot: 180 },
          { t: 3, x: 30, y: -116, rot: 180 },
          { t: 4.4, x: 140, y: -72, ease: "in", rot: 240 },
          { t: 6, x: 66, y: -16, arc: 30, ease: "out", rot: 360 }
        ],
        wobble: { from: 1.2, to: 3, x: 3, speed: 9 } },
      { id: "eek", text: "!", show: [1.3, 3], path: [{ t: 0, x: 30, y: -86 }] }
    ]
  },

  {
    id: "catYarn",
    title: "El gato y el ovillo",
    on: "clickCat",
    zone: "island",
    length: 9,
    island: { hide: { cat: [0, 5.6] } },
    actors: [
      { id: "spool", path: [{ t: 0, x: 116, y: -8 }] },
      { id: "cat", sprite: "catSit", show: [0, 5.6], path: run([66, -100, 66], 0.4, 0.35, -16) },
      { id: "yarn", sprite: "yarn", px: 3, fade: [0, 2], spin: -200,
        path: [
          { t: 0, x: 116, y: -8 },
          { t: 2, x: -110, y: -8, ease: "out" },
          { t: 2.2, x: -16, y: 8, on: "cat" },
          { t: 5.6, x: -16, y: 8, on: "cat" },
          { t: 6.2, x: 90, y: -8 }
        ] }
    ],
    ropes: [{ a: "spool", b: "yarn", sag: 4, color: "#d98ab0" }]
  },

  // ------------------------------------------------------------ astronaut

  {
    id: "astroJetpack",
    title: "El astronauta prueba el jetpack",
    on: "clickAstronaut",
    zone: "island",
    length: 9,
    when: { scene: AWAKE },
    island: { scene: "idle", hide: { astronaut: [0, 8.5] } },
    actors: [
      { id: "astro", sprite: "astronaut", show: [0, 8.5],
        path: [{ t: 0, x: -18, y: -26 }, { t: 1.5, x: 0, y: -100, ease: "out" }]
          .concat(loop(1.5, 6.5, 0, -100, 50, 16), [{ t: 8.5, x: -18, y: -26, ease: "inOut", rot: -360 }]) },
      { id: "pack", path: [{ t: 0, x: 0, y: 30, on: "astro" }] }
    ],
    particles: [
      { at: "pack", from: 0.2, to: 8.3, style: "smoke", count: 8, rate: 2.5, drift: [0, 40], size: 0.35,
        color: ["#ff9447", "#ffd65a"] }
    ]
  },

  {
    id: "astroSelfie",
    title: "Selfie en la isla",
    on: "clickAstronaut",
    zone: "island",
    length: 6,
    when: { scene: AWAKE },
    island: { scene: "wave" },
    actors: [
      { id: "cam", path: [{ t: 0, x: 14, y: -60 }] },
      { id: "phone", sprite: "phone", px: 3, fade: [0.4, 0.6], path: [{ t: 0, x: 14, y: -60 }], wobble: { y: 2, speed: 4 } }
    ],
    bursts: [
      { at: "cam", t: 1, duration: 0.35, count: 2, size: 40, colors: ["#ffffff", "#fff6c0"], spread: 4 },
      { at: "cam", t: 2.2, duration: 0.35, count: 2, size: 40, colors: ["#ffffff", "#fff6c0"], spread: 4 },
      { at: "cam", t: 3.4, duration: 0.35, count: 2, size: 40, colors: ["#ffffff", "#fff6c0"], spread: 4 }
    ],
    particles: [{ at: "cam", from: 3.8, to: 5.5, style: "rise", glyph: "♥", color: "#ff8fa8", count: 2, rate: 0.8, height: 40 }]
  },

  {
    id: "astroSnore",
    title: "No despiertes al astronauta",
    on: "clickAstronaut",
    zone: "island",
    length: 6,
    when: { scene: ["sleep"] },
    actors: [
      { id: "snorer", path: [{ t: 0, x: 40, y: -30 }] },
      { id: "huh", text: "?", size: 18, show: [0.2, 1.6], color: "#dfe8ff", path: [{ t: 0, x: 60, y: -60 }] }
    ],
    particles: [
      { at: "snorer", style: "sparks", glyph: "z", count: 8, every: 10, dur: 4.4, from: 1.4, radius: 70, color: "#dfe8ff", size: 1.5 }
    ]
  }
]

if (typeof module !== "undefined") module.exports = { ART: ART, EPISODES: EPISODES }
