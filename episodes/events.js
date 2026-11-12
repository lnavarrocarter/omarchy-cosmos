.pragma library

// Events pack: episodes that answer to what happens on the computer instead
// of playing at random (`on`). Events: taskDone, taskFailed, needsInput
// (Hub tasks, with $agent, $agentName, $agentColor), prompt (a new prompt to
// an agent), idle (you stepped away), back (you came back), cpuSpike.

var ART = {
  ant: ["..Y.", "TTTT", "T.T."],
  cloud: {
    colors: { g: "#4b5170" },
    rows: [
      "....GGGG......",
      "..GGGGGGGG.GG.",
      ".GGGGGGGGGGGGG",
      "GGGGGGGGGGGGGG",
      "gggggggggggggg",
      ".gggggggggggg."
    ]
  },
  chute: [
    "..RRWWRR..",
    ".RRWWWWRR.",
    "RWWRRRRWWR",
    "K........K",
    ".K......K.",
    "..K....K..",
    "...KWWK...",
    "...KVVK...",
    "...KWWK...",
    "....KK...."
  ]
}

// Hops in place: a keyframe every `step` seconds, each one a little jump.
function hops(x, y, t0, t1, step, height) {
  var out = [{ t: t0, x: x, y: y }]
  for (var t = t0 + step; t <= t1 + 1e-6; t += step) out.push({ t: t, x: x, y: y, arc: height, ease: "linear" })
  return out
}

function ant(i) {
  var start = i * 1.6
  return { id: "ant" + i, sprite: "ant", px: 3, show: [start, start + 12],
    path: [{ t: start, x: -186, y: -4 }, { t: start + 12, x: 96, y: -4, ease: "linear" }],
    wobble: { y: 1.5, speed: 14, phase: i } }
}

function cloud(i, x, y, t0) {
  return { id: "cloud" + i, sprite: "cloud", px: 5, fade: [2, 3], show: [t0, 30],
    path: [{ t: t0, x: x - 80, y: y }, { t: 30, x: x + 80, y: y, ease: "linear" }],
    wobble: { y: 6, speed: 0.7, phase: i } }
}

// A passenger who rides the hourly rocket, jumps at `jump` and drifts down
// under a parachute. The rocket's own path (RocketView.qml) is copied by the
// invisible "rocket" actor: -420 to the world's width + 420 in 24 s.
function jumper(i, jump, land) {
  // Where the rocket is at `jump`: x = -420 + (W + 840) * jump / 24.
  var f = jump / 24, off = Math.round(840 * f - 420)
  var x = "w" + f.toFixed(4) + (off < 0 ? String(off) : "+" + off)
  var dy = Math.round(Math.sin(jump * 0.7) * 34)
  var y = "h0.2" + (dy < 0 ? String(dy) : "+" + dy)
  return { id: "jumper" + i, sprite: "chute", px: 3, show: [jump, 30], fade: [0.3, 3],
    path: [
      { t: jump, x: x, y: y },
      { t: 30, x: "w" + land, y: "h0.8", ease: "out" }
    ],
    wobble: { from: jump + 1, to: 30, x: 18, xspeed: 0.9, rot: 10, speed: 1.3, phase: i } }
}

var EPISODES = [
  {
    id: "confetti",
    title: "Tarea completada: confeti",
    on: "taskDone",
    zone: "island",
    length: 14,
    island: { scene: "wave" },
    actors: [
      { id: "banner", text: "$agentName ✓", color: "$agentColor", size: 22, fade: [0.5, 1.5],
        path: [{ t: 0, x: 0, y: -150, scale: 0.4 }, { t: 0.8, x: 0, y: -175, ease: "out", scale: 1 }],
        wobble: { y: 4, speed: 2.5 } },
      { id: "pop0", path: [{ t: 0, x: -130, y: -210 }] },
      { id: "pop1", path: [{ t: 0, x: 140, y: -230 }] }
    ],
    particles: [
      { region: { x: -230, y: -280, w: 460, h: 40 }, style: "fall", count: 28, rate: 0.4, height: 270, size: 1.4,
        to: 9, color: ["$agentColor", "#ffd65a", "#ff8fa8", "#7df9ff", "#3fae6a"] },
      { at: "pop0", style: "sparks", count: 14, every: 3, dur: 1.2, to: 10, radius: 55, color: ["$agentColor", "#fff6c0"] },
      { at: "pop1", style: "sparks", count: 14, every: 3, dur: 1.2, from: 1.4, to: 11, radius: 55, color: ["#ffd65a", "#ffffff"] }
    ]
  },

  {
    id: "repair",
    title: "Tarea fallida: el perro repara la nave",
    on: "taskFailed",
    zone: "island",
    length: 25,
    island: { hide: { dog: [3, 22] } },
    actors: [
      { id: "wreck", sprite: "shuttle", px: 3, facesLeft: true, show: [0, 25],
        path: [
          { t: 0, x: 700, y: "above" },
          { t: 4, x: 250, y: -40, ease: "out", rot: -12 },
          { t: 18, x: 250, y: -40, rot: 0 },
          { t: 19, x: 250, y: -46, flip: true },
          { t: 24, x: 900, y: "above", ease: "in", rot: -10 }
        ],
        wobble: [{ from: 0, to: 18, rot: 6, speed: 5, y: 3 }] },
      { id: "label", text: "$agentName", color: "$agentColor", size: 14, show: [4, 18], fade: [0.5, 0.5],
        path: [{ t: 0, x: 0, y: -34, on: "wreck" }] },
      { id: "oops", text: "!", show: [2, 4], path: [{ t: 0, x: -60, y: -66 }] },
      { id: "fixer", sprite: "dog", show: [3, 22],
        path: [
          { t: 3, x: -78, y: -16 },
          { t: 3.8, x: 0, y: -16, arc: 14, ease: "linear" },
          { t: 4.6, x: 80, y: -16, arc: 14, ease: "linear" },
          { t: 5.4, x: 150, y: -16, arc: 14, ease: "linear" },
          { t: 6.2, x: 196, y: -26, arc: 14, ease: "linear" },
          { t: 18.4, x: 196, y: -26, flip: true },
          { t: 19.2, x: 150, y: -16, arc: 14, ease: "linear" },
          { t: 20, x: 80, y: -16, arc: 14, ease: "linear" },
          { t: 20.8, x: 0, y: -16, arc: 14, ease: "linear" },
          { t: 22, x: -78, y: -16, arc: 14, ease: "linear", flip: false }
        ],
        wobble: { from: 7, to: 18, rot: 10, speed: 9 } },
      { id: "torch", path: [{ t: 0, x: 26, y: -6, on: "fixer" }] }
    ],
    particles: [
      { at: "wreck", from: 0, to: 17, style: "smoke", count: 8, rate: 0.9, offset: [24, -4], trail: true },
      { at: "torch", from: 7, to: 17.5, style: "sparks", count: 12, rate: 2.4, radius: 20, color: ["#ffd65a", "#fff6c0"] },
      { at: "wreck", from: 18.2, to: 22, style: "rise", glyph: "♥", color: "#ff8fa8", count: 4, rate: 0.6, height: 70 },
      { at: "wreck", from: 19, to: 24, style: "exhaust", count: 6, rate: 3, offset: [30, 0] }
    ]
  },

  {
    id: "ask",
    title: "Un agente espera tu respuesta",
    on: "needsInput",
    zone: "island",
    length: 10,
    actors: [
      { id: "q", text: "?", color: "$agentColor", size: 34, blink: { every: 1, dur: 0.7 }, show: [0, 10], fade: [0.3, 1],
        path: [{ t: 0, x: -18, y: -110 }], wobble: { y: 6, speed: 3 } },
      { id: "who", text: "$agentName", color: "$agentColor", size: 14, show: [0, 10], fade: [0.3, 1],
        path: [{ t: 0, x: -18, y: -140 }] }
    ]
  },

  {
    id: "ants",
    title: "Hormigas cargando tokens",
    on: "prompt",
    zone: "island",
    length: 22,
    actors: [ant(0), ant(1), ant(2), ant(3), ant(4), ant(5)]
  },

  {
    id: "bedtime",
    title: "Todos a dormir",
    on: "idle",
    zone: "island",
    length: 60,
    island: { scene: "sleep" },
    actors: [
      { id: "dogNap", path: [{ t: 0, x: -70, y: -40 }] },
      { id: "catNap", path: [{ t: 0, x: 72, y: -40 }] }
    ],
    particles: [
      { at: "dogNap", style: "rise", glyph: "z", color: "#dfe8ff", count: 3, rate: 0.35, height: 60, from: 2 },
      { at: "catNap", style: "rise", glyph: "z", color: "#dfe8ff", count: 3, rate: 0.3, height: 50, from: 5 },
      { region: { x: -260, y: -320, w: 520, h: 220 }, style: "twinkle", count: 10, rate: 0.25, color: ["#fff6c0", "#bcd4ff"] }
    ]
  },

  {
    id: "welcome",
    title: "¡Volviste!",
    on: "back",
    zone: "island",
    length: 14,
    island: { scene: "wave", hide: { dog: [0, 10] } },
    actors: [
      { id: "happy", sprite: "dog", show: [0, 10], path: hops(-78, -16, 0, 10, 0.5, 26) },
      { id: "yay", text: "!", show: [0.3, 3], path: [{ t: 0, x: -50, y: -80 }] }
    ],
    particles: [
      { at: "happy", style: "rise", glyph: "♥", color: "#ff8fa8", count: 5, rate: 0.6, height: 70, offset: [0, -20], to: 10 }
    ]
  },

  {
    id: "storm",
    title: "Supertormenta (CPU al máximo)",
    on: "cpuSpike",
    zone: "planet",
    length: 30,
    actors: [cloud(0, -120, -150, 0), cloud(1, 90, -60, 1.5), cloud(2, -40, 40, 3)],
    bursts: [
      { at: "cloud0", t: 5, duration: 0.5, count: 3, size: 70, colors: ["#fff6c0", "#ffffff"], spread: 40 },
      { at: "cloud1", t: 9, duration: 0.5, count: 3, size: 70, colors: ["#fff6c0", "#ffffff"], spread: 40 },
      { at: "cloud2", t: 12.5, duration: 0.5, count: 3, size: 70, colors: ["#fff6c0", "#ffffff"], spread: 40 },
      { at: "cloud0", t: 16, duration: 0.5, count: 3, size: 80, colors: ["#fff6c0", "#ffffff"], spread: 40 },
      { at: "cloud1", t: 20, duration: 0.5, count: 3, size: 70, colors: ["#fff6c0", "#ffffff"], spread: 40 },
      { at: "cloud2", t: 23, duration: 0.5, count: 3, size: 70, colors: ["#fff6c0", "#ffffff"], spread: 40 }
    ],
    particles: [
      { region: { x: -300, y: -150, w: 600, h: 260 }, style: "streak", angle: 100, length: 90, count: 30, rate: 1.4,
        from: 3, to: 27, color: "#9fe3ff", size: 0.5 }
    ]
  },

  {
    id: "skydivers",
    title: "Paracaidistas del cohete de la hora",
    on: "hour",
    zone: "world",
    length: 30,
    actors: [
      { id: "rocket", path: [{ t: 0, x: -420, y: "h0.2" }, { t: 24, x: "w1+420", y: "h0.2", ease: "linear" }],
        wobble: { y: 34, speed: 0.7, phase: -1.7 } },
      jumper(0, 6, 0.24), jumper(1, 11, 0.47), jumper(2, 16, 0.7)
    ]
  }
]

if (typeof module !== "undefined") module.exports = { ART: ART, EPISODES: EPISODES }
