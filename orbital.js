.pragma library

// Life around the machine world (planet style "tech"): satellites on tilted
// orbits, small stations, stationary motherships, scrap drifting in the
// broken ring, chunks of crust torn off at the fissures that spill their seas
// and fall back, a space elevator, and ring turrets that shoot scrap down.
//
// Everything is a pure function of (index, time) in art pixels around the
// planet's centre (the scene draws them 3x), so QML delegates can bind to it
// frame by frame and tools/planet-storyboard.js can draw the very same frames.
// `front` says whether a thing passes in front of the planet or behind it.

var R = 80
var RING = { tilt: 0.3, rot: -0.2, inner: 1.36, outer: 1.62, broken: [1.95, 2.55] }
var COUNTS = { satellites: 4, stations: 2, motherships: 3, junk: 12, chunks: 3, drops: 8, turrets: 3 }

var SATELLITES = [
  { e: 1.3, incl: 0.55, turn: 0.5, speed: 0.21, ph: 0.4 },
  { e: 1.78, incl: 0.25, turn: -0.9, speed: -0.13, ph: 2.2 },
  { e: 2.05, incl: 0.7, turn: 1.25, speed: 0.09, ph: 4.1 },
  { e: 1.15, incl: 0.95, turn: -0.35, speed: 0.27, ph: 5.3 }
]
var STATIONS = [
  { kind: "wheel", e: 2.15, incl: 0.32, turn: 0.15, speed: 0.045, ph: 1.0, spin: 0.25 },
  { kind: "cross", e: 2.45, incl: 0.2, turn: -0.12, speed: -0.03, ph: 3.6, spin: -0.08 }
]
// Motherships hold still, high over the world, and only breathe a little.
var MOTHERSHIPS = [
  { x: -238, y: -122, flip: false, ph: 0.0 },
  { x: 214, y: -146, flip: true, ph: 1.7 },
  { x: 250, y: 64, flip: true, ph: 3.1 }
]
var TURRETS = [2.72, 3.02, 0.3]
var RANGE = 90
var SHOT_EVERY = 5.5
var BEAM = 0.35
var BLAST = 0.9
var CHUNK_CYCLE = 26
var GRAVITY = 36

function hash(n) {
  var x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

// A point on an orbit of radius e*R, squashed by incl, turned by turn.
function onOrbit(e, incl, turn, a) {
  var ox = Math.cos(a) * e * R, oy = Math.sin(a) * e * R * incl
  var c = Math.cos(turn), s = Math.sin(turn)
  return { x: ox * c - oy * s, y: ox * s + oy * c, front: Math.sin(a) > 0 }
}

// A point in the ring plane at angle a and radius e (in R), as sprites.js
// draws the ring: front half is 0..pi.
function ringPoint(a, e) {
  var rx = Math.cos(a) * e * R, ry = Math.sin(a) * e * R * RING.tilt
  var c = Math.cos(RING.rot), s = Math.sin(RING.rot)
  return { x: rx * c + ry * s, y: -rx * s + ry * c, front: Math.sin(a) > 0 }
}

function satellite(i, t) {
  var o = SATELLITES[i % SATELLITES.length]
  var p = onOrbit(o.e, o.incl, o.turn, o.ph + o.speed * t)
  p.rot = o.turn + Math.sin(t * 0.4 + i) * 0.2
  return p
}

function station(i, t) {
  var o = STATIONS[i % STATIONS.length]
  var p = onOrbit(o.e, o.incl, o.turn, o.ph + o.speed * t)
  p.kind = o.kind
  p.rot = o.spin * t
  return p
}

function mothership(i, t) {
  var m = MOTHERSHIPS[i % MOTHERSHIPS.length]
  return { x: m.x + Math.sin(t * 0.11 + m.ph) * 2, y: m.y + Math.sin(t * 0.23 + m.ph) * 1.5,
           flip: m.flip, front: true, blink: Math.sin(t * 2 + m.ph * 3) > 0.6 }
}

// Scrap spills out of the broken stretch and spreads round the ring.
function junkOrbit(i) {
  var b = RING.broken
  return { a0: b[0] + (b[1] - b[0]) * hash(i * 3 + 1) + (hash(i * 5) - 0.5) * 1.6,
           e: RING.inner + (RING.outer - RING.inner + 0.25) * hash(i * 7 + 2),
           speed: 0.025 + hash(i * 11) * 0.03, spin: (hash(i * 13) - 0.5) * 2 }
}

function junkAt(i, t) {
  var o = junkOrbit(i)
  var p = ringPoint(o.a0 + o.speed * t, o.e)
  p.rot = o.spin * t
  p.variant = i
  return p
}

function junk(i, t) {
  var p = junkAt(i, t)
  p.hidden = shotDown(i, t)
  return p
}

// Turret shots: every SHOT_EVERY seconds one turret fires a beam at a piece
// of scrap, which bursts and is gone until its turn comes round again.
// The turret takes the nearest scrap that is clear of the planet's disc and
// in front of it, so every shot reads against open sky.
function shotAt(n) {
  var turret = Math.floor(hash(n * 7 + 3) * TURRETS.length)
  var from = ringPoint(TURRETS[turret], RING.outer + 0.04)
  var target = -1, best = 1e9
  for (var i = 0; i < COUNTS.junk; i++) {
    var p = junkAt(i, n * SHOT_EVERY + BEAM)
    if (!p.front || Math.hypot(p.x, p.y) < R + 6) continue
    var d = Math.hypot(p.x - from.x, p.y - from.y)
    if (d < best && d < RANGE) { best = d; target = i }
  }
  return { n: n, turret: turret, target: target }
}

function shot(t) {
  var n = Math.floor(t / SHOT_EVERY)
  var s = shotAt(n)
  var e = t - n * SHOT_EVERY
  var from = ringPoint(TURRETS[s.turret], RING.outer + 0.04)
  var at = s.target >= 0 ? junkAt(s.target, n * SHOT_EVERY + BEAM) : from
  var live = s.target >= 0
  return { from: from, to: { x: at.x, y: at.y, front: true },
           beam: live && e < BEAM, blast: live && e >= BEAM && e < BEAM + BLAST, blastAge: (e - BEAM) / BLAST }
}

function shotDown(i, t) {
  // Hidden from its blast until 3 cycles later.
  var n = Math.floor(t / SHOT_EVERY)
  for (var k = 0; k < 3; k++) {
    var m = n - k
    if (m < 0) break
    if (shotAt(m).target === i && (t - m * SHOT_EVERY) >= BEAM + BLAST * 0.3) return true
  }
  return false
}

function turret(i) {
  var p = ringPoint(TURRETS[i % TURRETS.length], RING.outer + 0.04)
  p.rot = Math.atan2(p.y, p.x) + Math.PI / 2
  return p
}

// A chunk of crust torn off at a fissure on the upper limb: it lifts away,
// hangs while its sea pours out, and falls back under gravity.
function chunk(i, t) {
  var u = ((t + i * CHUNK_CYCLE / COUNTS.chunks) / CHUNK_CYCLE) % 1
  var cycle = Math.floor((t + i * CHUNK_CYCLE / COUNTS.chunks) / CHUNK_CYCLE)
  // Anywhere on the upper limb but the pole, where the elevator stands.
  var side = hash(cycle * 17 + i * 5)
  var theta = -Math.PI * (side < 0.5 ? 0.16 + side * 0.5 : 0.59 + (side - 0.5) * 0.5)
  var lift = 20 + 16 * hash(cycle * 3 + i)
  // Up fast, a long hang near the top, then an accelerating fall.
  var h = u < 0.25 ? lift * (1 - Math.pow(1 - u / 0.25, 2)) : u < 0.7 ? lift + Math.sin((u - 0.25) * 9) * 1.2
    : lift * (1 - Math.pow((u - 0.7) / 0.3, 2))
  var r = R + 2 + Math.max(0, h)
  var drift = (u - 0.5) * 0.06
  return { x: Math.cos(theta + drift) * r, y: Math.sin(theta + drift) * r, front: true,
           rot: theta + Math.PI / 2 + Math.sin(u * 5 + i) * 0.15, u: u, theta: theta + drift, r: r,
           variant: cycle + i, spilling: u > 0.12 && u < 0.78, visible: h > 0.5 }
}

// Water pouring off chunk i: drop k falls straight toward the planet,
// faster and faster, and vanishes when it reaches the crust.
function drop(i, k, t) {
  var c = chunk(i, t)
  if (!c.spilling) return { visible: false, x: 0, y: 0 }
  var age = ((t * 0.8 + k / COUNTS.drops + i * 0.13) % 1) * 1.4
  var side = (k % 2 ? 1 : -1) * (2 + (k >> 1) * 2.5)
  var tx = -Math.sin(c.theta), ty = Math.cos(c.theta)
  var sx = c.x + tx * side, sy = c.y + ty * side
  var fall = 0.5 * GRAVITY * age * age + 6 * age
  var d = Math.hypot(sx, sy)
  var x = sx - sx / d * fall, y = sy - sy / d * fall
  return { visible: Math.hypot(x, y) > R + 1, x: x, y: y, len: 1 + Math.min(4, age * 5) }
}

// Space elevator from the north pole up past the ring to a counterweight.
var ELEVATOR = { baseY: -R + 2, topY: -R * 1.95, period: 22 }

function elevator(t) {
  var u = (t % ELEVATOR.period) / ELEVATOR.period
  var k = u < 0.5 ? u * 2 : 2 - u * 2
  var e = k * k * (3 - 2 * k)
  return { baseY: ELEVATOR.baseY, topY: ELEVATOR.topY, x: 0,
           climberY: ELEVATOR.baseY - 6 + (ELEVATOR.topY - ELEVATOR.baseY + 10) * e }
}

if (typeof module !== "undefined")
  module.exports = { R: R, RING: RING, COUNTS: COUNTS, TURRETS: TURRETS, SHOT_EVERY: SHOT_EVERY, satellite: satellite,
    station: station, mothership: mothership, junk: junk, shot: shot, shotDown: shotDown, turret: turret,
    chunk: chunk, drop: drop, elevator: elevator, ringPoint: ringPoint }
