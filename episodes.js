.pragma library
.import "episodes/island.js" as PackIsland
.import "episodes/planet.js" as PackPlanet
.import "episodes/station.js" as PackStation
.import "episodes/sky.js" as PackSky
.import "episodes/seasonal.js" as PackSeasonal
.import "episodes/events.js" as PackEvents
.import "episodes/clicks.js" as PackClicks
.import "episodes/island2.js" as PackIsland2
.import "episodes/planet2.js" as PackPlanet2
.import "episodes/station2.js" as PackStation2
.import "episodes/sky2.js" as PackSky2
.import "episodes/sky3.js" as PackSky3
.import "episodes/dates2.js" as PackDates2

// Episode engine. An episode is plain data (see EPISODES.md): actors that
// follow keyframed paths, plus shots, blasts, particles, ropes and beams.
// state(id, e, ctx) turns it into flat lists for EpisodeView to draw; every
// value is a pure function of e (seconds since the episode started), so all
// screens show the same moment and episodes are easy to test.
//
// ctx = { W, H, planet, castaway, station, sun, moon: {x, y} | null, bob, vars }
// now = { hour, night, month, date: "MM-DD", weekday, cpu, ram, gpu, busy, scene, special: [] }
// vars always has $time ("14:05") and $date ("12-11"), plus the event's own.
//
// Most episodes play at random. Those with `on` play when something happens
// instead (a Hub task finishing, a prompt, coming back to the computer...);
// the event can pass `vars` such as the agent's name and colour, which
// episodes use as "$agentName" / "$agentColor" in texts and colours.

var PACKS = [PackIsland, PackPlanet, PackStation, PackSky, PackSeasonal, PackEvents, PackClicks,
  PackIsland2, PackPlanet2, PackStation2, PackSky2, PackSky3, PackDates2]

// Slots EpisodeView has for each kind of thing; state() never exceeds them.
var LIMITS = { actors: 16, shots: 16, flashes: 16, particles: 64, ropes: 3, beams: 2 }
var ROPE_POINTS = 14

// ---------------------------------------------------------------- catalog

var _catalog = null

function catalog() {
  if (_catalog) return _catalog
  var list = [], byId = ({})
  for (var i = 0; i < PACKS.length; i++) {
    var eps = (PACKS[i] && PACKS[i].EPISODES) || []
    for (var j = 0; j < eps.length; j++) {
      var ep = eps[j]
      if (!ep || typeof ep.id !== "string" || byId.hasOwnProperty(ep.id)) continue
      byId[ep.id] = ep
      list.push(ep)
    }
  }
  _catalog = { list: list, byId: byId }
  return _catalog
}

function get(id) {
  var c = catalog()
  return typeof id === "string" && c.byId.hasOwnProperty(id) ? c.byId[id] : null
}

function ids() { return catalog().list.map(function(ep) { return ep.id }) }

function length(id) { var ep = get(id); return ep ? Number(ep.length) || 0 : 0 }

// ---------------------------------------------------------------- events

var EVENTS = ["taskDone", "taskFailed", "needsInput", "prompt", "idle", "back", "cpuSpike",
              "clickDog", "clickCat", "clickAstronaut", "hour"]

// Seconds before the same event can start another episode.
var COOLDOWNS = { taskDone: 20, taskFailed: 20, needsInput: 60, prompt: 300, idle: 600, back: 120, cpuSpike: 600,
                  clickDog: 2, clickCat: 2, clickAstronaut: 2, hour: 1800 }

// Events whose episode only makes sense right away (the hourly rocket is
// flying now; a click wants an answer now): never queued behind another.
var NO_QUEUE = ["hour", "clickDog", "clickCat", "clickAstronaut"]

function triggers(ep) {
  if (!ep || !ep.on) return []
  return Array.isArray(ep.on) ? ep.on : [ep.on]
}

// Events from one fleet update to the next: a ship that just turned for home
// finished (or failed) its task; one that just started waiting needs you.
function fleetEvents(prev, next, labels, colors) {
  var out = []
  if (!prev || !next) return out
  for (var agent in next) {
    var a = prev[agent], b = next[agent]
    if (!a || !b || a.mode === b.mode) continue
    var vars = { agent: agent, agentName: (labels && labels[agent]) || agent, agentColor: (colors && colors[agent]) || "#ffd65a" }
    if (b.mode === "inbound" && (a.mode === "mission" || a.mode === "waiting"))
      out.push({ name: b.result === "failed" ? "taskFailed" : "taskDone", vars: vars })
    else if (b.mode === "waiting")
      out.push({ name: "needsInput", vars: vars })
  }
  return out
}

// The episode to play for an event, or "" when none fits right now.
function forEvent(rand, name, ctx, now, recent) {
  var list = ids().filter(function(id) {
    var ep = get(id)
    return triggers(ep).indexOf(name) >= 0 && available(id, ctx) && matches(ep.when, now) && weight(id, now) > 0
  })
  return choose(rand, list, recent || [], now)
}

// Sprites episodes can use: the core ones by name, then every pack's ART.
// pal: the characters' colours (looks.js palettes), so episodes draw the
// same astronaut, cat and dog as the island.
function buildArt(S, pal) {
  pal = pal || {}
  var a = pal.astronaut, c = pal.cat, d = pal.dog
  var out = {
    astronaut: S.astronaut(a), astronautWave: S.astronautWave(a), cat: S.cat(c), catSit: S.catSit(c),
    fish: S.fish(), dog: S.dog(d), cow: S.cow(), grassRock: S.grassRock(),
    ufo0: S.ufo(0), ufo1: S.ufo(1), dogShip: S.dogShip(false), dogShipCrew: S.dogShip(true, d),
    pirate: S.pirate(), whale: S.whale(), satellite: S.satellite(), shuttle: S.shuttle(pal.shuttle), rocket: S.rocket(),
    dogRun0: S.dogRun(0, d), dogRun1: S.dogRun(1, d), catWalk0: S.catWalk(0, c), catWalk1: S.catWalk(1, c),
    astronautWalk0: S.astronautWalk(0, a), astronautWalk1: S.astronautWalk(1, a)
  }
  for (var i = 0; i < PACKS.length; i++) {
    var art = (PACKS[i] && PACKS[i].ART) || {}
    for (var name in art) if (!out[name]) out[name] = S.fromArt(art[name])
  }
  return out
}

// ---------------------------------------------------------------- choosing

function anchor(ep, ctx) {
  var c = ctx.castaway, p = ctx.planet, s = ctx.station
  var any = c || p || s || { x: ctx.W * 0.5, y: ctx.H * 0.5 }
  switch (ep.zone) {
    case "planet": return p || any
    case "station": return s || any
    case "castaway": return c || any
    case "island": return c ? { x: c.x, y: c.y - 40 + (ctx.bob || 0) } : any
    case "sun": return ctx.sun || any
    case "moon": return ctx.moon || any
    default: return { x: 0, y: 0 }
  }
}

function available(id, ctx) {
  var ep = get(id)
  if (!ep) return false
  var req = (ep.requires || []).slice()
  // An episode plays only where its zone exists: with one or two screens
  // there may be no planet or station, and their stories make no sense
  // anchored somewhere else.
  if (ep.zone === "island" || ep.zone === "castaway") req.push("castaway")
  if (ep.zone === "planet" || ep.zone === "station" || ep.zone === "sun" || ep.zone === "moon") req.push(ep.zone)
  for (var i = 0; i < req.length; i++) if (!ctx[req[i]]) return false
  return true
}

function inHours(h, r) {
  return r[0] <= r[1] ? h >= r[0] && h < r[1] : h >= r[0] || h < r[1]
}

function matches(w, now) {
  if (!w) return true
  now = now || {}
  if (w.night !== undefined && !!now.night !== !!w.night) return false
  if (w.hours && !inHours(Number(now.hour) || 0, w.hours)) return false
  if (w.months && w.months.indexOf(now.month) < 0) return false
  if (w.dates && w.dates.indexOf(now.date) < 0) return false
  if (w.weekdays && w.weekdays.indexOf(now.weekday) < 0) return false
  if (w.cpuAbove !== undefined && !((Number(now.cpu) || 0) > w.cpuAbove)) return false
  if (w.cpuBelow !== undefined && !((Number(now.cpu) || 0) < w.cpuBelow)) return false
  if (w.ramAbove !== undefined && !((Number(now.ram) || 0) > w.ramAbove)) return false
  if (w.ramBelow !== undefined && !((Number(now.ram) || 0) < w.ramBelow)) return false
  if (w.busy !== undefined && !!now.busy !== !!w.busy) return false
  if (w.scene && w.scene.indexOf(now.scene) < 0) return false
  // Episodes built around the palm (coconuts, a nest, a garland) need the island.
  if (w.home && w.home.indexOf(now.home || "island") < 0) return false
  if (w.gpuAbove !== undefined && !((Number(now.gpu) || 0) > w.gpuAbove)) return false
  if (w.special && (now.special || []).indexOf(w.special) < 0) return false
  return true
}

function eligible(id, ctx, now) {
  var ep = get(id)
  return !!ep && !ep.manual && (!ep.on || !!ep.random) && available(id, ctx) && matches(ep.when, now)
}

function weight(id, now) {
  var ep = get(id)
  if (!ep) return 0
  var w = ep.weight !== undefined ? Number(ep.weight) : 1
  if (ep.boost && matches(ep.boost, now)) w *= Number(ep.boost.weight) || 3
  return Math.max(0, w)
}

// Weighted random pick among what may play now, skipping the last few.
function pick(rand, recent, ctx, now) {
  var list = ids().filter(function(id) { return eligible(id, ctx, now) && weight(id, now) > 0 })
  return choose(rand, list, recent || [], now)
}

function choose(rand, list, recent, now) {
  if (!list.length) return ""
  var avoid = Math.min(recent.length, list.length - 1, 8)
  var skip = recent.slice(recent.length - avoid)
  var pool = list.filter(function(id) { return skip.indexOf(id) < 0 })
  var total = 0
  for (var i = 0; i < pool.length; i++) total += weight(pool[i], now)
  var r = rand() * total
  for (var j = 0; j < pool.length; j++) {
    r -= weight(pool[j], now)
    if (r < 0) return pool[j]
  }
  return pool[pool.length - 1]
}

// ---------------------------------------------------------------- math

function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v }
function seg(e, a, b) { return b <= a ? (e >= b ? 1 : 0) : clamp((e - a) / (b - a)) }
function lerp(a, b, t) { return a + (b - a) * t }
function hash(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x) }

var EASE = {
  linear: function(k) { return k },
  "in": function(k) { return k * k * k },
  out: function(k) { return 1 - Math.pow(1 - k, 3) },
  inOut: function(k) { return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2 },
  sine: function(k) { return (1 - Math.cos(Math.PI * k)) / 2 }
}

// Fade in over `ramp` after `from`, out over `ramp` before `to`.
function envelope(e, from, to, ramp) {
  if (from === undefined && to === undefined) return 1
  from = from === undefined ? -1e9 : from
  to = to === undefined ? 1e9 : to
  if (e < from || e >= to) return 0
  return Math.min(seg(e, from, from + ramp), 1 - seg(e, to - ramp, to))
}

// Numbers are offsets from the anchor; strings are absolute:
// "above"/"below" the screens, "w0.5" = half the world width, "h0.3-40".
var ABS = /^([wh])(-?[0-9.]+)([+-][0-9.]+)?$/
// mid (optional, x only): where "w0.5" lands. The middle of the world is
// the bezel between two screens when there are two, so ctx.mid is the
// centre of a screen (the castaway's) and the rest of the width stretches
// around it: w0 and w1 stay at the world's ends.
function coord(v, base, size, mid) {
  if (typeof v === "number") return base + v
  if (v === "above") return -160
  if (v === "below") return size + 160
  var m = typeof v === "string" ? ABS.exec(v) : null
  if (m) {
    var f = Number(m[2]), off = m[3] ? Number(m[3]) : 0
    if (m[1] === "w" && typeof mid === "number" && mid > 0 && mid < size)
      return (f <= 0.5 ? f * 2 * mid : mid + (f * 2 - 1) * (size - mid)) + off
    return size * f + off
  }
  return base
}

// ---------------------------------------------------------------- actors

function keyframes(a) {
  if (a._kf) return a._kf
  var path = a.path && a.path.length ? a.path : [{ t: 0, x: 0, y: 0 }]
  var out = [], prev = { rot: 0, scale: 1, o: 1, flip: false }
  for (var i = 0; i < path.length; i++) {
    var k = path[i]
    var f = {
      t: Number(k.t) || 0, x: k.x !== undefined ? k.x : 0, y: k.y !== undefined ? k.y : 0,
      on: k.on || null, ease: EASE[k.ease] ? k.ease : "inOut", arc: Number(k.arc) || 0,
      rot: k.rot !== undefined ? k.rot : prev.rot, scale: k.scale !== undefined ? k.scale : prev.scale,
      o: k.o !== undefined ? k.o : prev.o, flip: k.flip !== undefined ? !!k.flip : prev.flip
    }
    out.push(f)
    prev = f
  }
  a._kf = out
  return out
}

function actorIndex(ep) {
  if (ep._byId) return ep._byId
  var map = ({})
  var list = ep.actors || []
  for (var i = 0; i < list.length; i++) {
    if (!list[i].id) list[i].id = "_" + i
    map[list[i].id] = list[i]
  }
  ep._byId = map
  return map
}

// A keyframe point. With `on`, it rides another actor (mirrored with it).
function point(f, e, env) {
  if (f.on) {
    var o = actorAt(env, f.on, e)
    if (o) return { x: o.x + (o.flip ? -f.x : f.x), y: o.y + f.y }
  }
  return { x: coord(f.x, env.anchor.x, env.ctx.W, env.ctx.mid), y: coord(f.y, env.anchor.y, env.ctx.H) }
}

function actorAt(env, id, e) {
  var key = id + "@" + e
  if (env.memo[key]) return env.memo[key]
  var a = env.byId[id]
  if (!a || env.busy[key]) return null
  env.busy[key] = true
  var r = sample(env, a, e)
  env.busy[key] = false
  env.memo[key] = r
  return r
}

function orbitAt(env, a, e) {
  var o = a.orbit
  var c = point({ x: o.x || 0, y: o.y || 0, on: o.on || null }, e, env)
  var k = (EASE[o.ease] || EASE.linear)(seg(e, o.t0 || 0, o.t1 === undefined ? 1 : o.t1))
  var from = o.from || 0, to = o.to === undefined ? 360 : o.to
  var ang = lerp(from, to, k) * Math.PI / 180
  var rx = o.rx || 100, ry = o.ry || rx
  var x = Math.cos(ang) * rx, y = Math.sin(ang) * ry
  var tl = (o.tilt || 0) * Math.PI / 180
  var X = x * Math.cos(tl) - y * Math.sin(tl), Y = x * Math.sin(tl) + y * Math.cos(tl)
  var hidden = !!o.hideBehind && Math.sin(ang) < 0 && X * X + Y * Y < o.hideBehind * o.hideBehind
  var dX = (-Math.sin(ang) * rx * Math.cos(tl) - Math.cos(ang) * ry * Math.sin(tl)) * (to >= from ? 1 : -1)
  return { x: c.x + X + (o.dx || 0), y: c.y + Y + (o.dy || 0), rot: 0, scale: 1,
    o: hidden ? 0 : 1, flip: o.faceMotion ? dX < 0 : false }
}

function sample(env, a, e) {
  var r
  if (a.orbit) {
    r = orbitAt(env, a, e)
  } else {
    var kf = keyframes(a), n = kf.length
    if (n === 1 || e <= kf[0].t || e >= kf[n - 1].t) {
      var f = e >= kf[n - 1].t ? kf[n - 1] : kf[0]
      var p = point(f, e, env)
      r = { x: p.x, y: p.y, rot: f.rot, scale: f.scale, o: f.o, flip: f.flip }
    } else {
      var i = 0
      while (i < n - 2 && e >= kf[i + 1].t) i++
      var A = kf[i], B = kf[i + 1]
      var k = (e - A.t) / Math.max(1e-6, B.t - A.t)
      var q = EASE[B.ease](k)
      var pa = point(A, e, env), pb = point(B, e, env)
      r = { x: lerp(pa.x, pb.x, q), y: lerp(pa.y, pb.y, q) - Math.sin(Math.PI * k) * B.arc,
            rot: lerp(A.rot, B.rot, q), scale: lerp(A.scale, B.scale, q), o: lerp(A.o, B.o, q), flip: A.flip }
    }
  }
  var wob = a.wobble ? (Array.isArray(a.wobble) ? a.wobble : [a.wobble]) : []
  for (var w = 0; w < wob.length; w++) {
    var W = wob[w]
    var g = envelope(e, W.from, W.to, W.ramp === undefined ? 0.6 : W.ramp)
    if (!g) continue
    var sp = W.speed || 1, ph = W.phase || 0
    r.x += Math.sin(e * (W.xspeed || sp) + ph) * (W.x || 0) * g
    r.y += Math.sin(e * sp + ph + 1.7) * (W.y || 0) * g
    r.rot += Math.sin(e * sp + ph) * (W.rot || 0) * g
  }
  if (a.spin) r.rot += e * a.spin
  r.left = !!a.facesLeft
  return r
}

function showWindow(a, ep) {
  return a.show || [0, Number(ep.length) || 0]
}

function spriteName(a, e) {
  if (a.swap) {
    var name = a.swap[0][1]
    for (var i = 0; i < a.swap.length; i++) if (e >= a.swap[i][0]) name = a.swap[i][1]
    return name
  }
  if (a.frames) return a.frames[Math.floor(e * (a.fps || 4)) % a.frames.length]
  return a.sprite || ""
}

// Running along the ground, the dog, the cat and the astronaut move their
// legs: while an actor drawn with one of these sprites travels sideways on a
// level stretch of its path (not riding anything, not tumbling), its gait
// frames play instead. Only on the island, where there is ground to walk on;
// `gait: true` asks for it elsewhere, `gait: false` keeps the still sprite.
var GAITS = {
  dog: { frames: ["dogRun0", "dogRun1"], fps: 9 },
  catSit: { frames: ["catWalk0", "catWalk1"], fps: 8 },
  astronaut: { frames: ["astronautWalk0", "astronautWalk1"], fps: 5 }
}

function gaitName(env, a, e, name) {
  var g = GAITS[name]
  if (!g || a.gait === false || a.frames || a.swap || a.orbit) return name
  var ground = env.ep.zone === "island" || env.ep.zone === "castaway"
  if (!ground && a.gait !== true) return name
  var kf = keyframes(a), n = kf.length
  if (n < 2 || e <= kf[0].t || e >= kf[n - 1].t) return name
  var i = 0
  while (i < n - 2 && e >= kf[i + 1].t) i++
  var A = kf[i], B = kf[i + 1]
  if (A.on || B.on || typeof A.y !== "number" || typeof B.y !== "number" || Math.abs(B.y - A.y) > 14) return name
  if (Math.abs(A.rot) > 30 || Math.abs(B.rot - A.rot) > 5) return name
  var now = actorAt(env, a.id, e), before = actorAt(env, a.id, e - 0.05)
  if (!now || !before || Math.abs(now.x - before.x) < 1.5) return name
  return g.frames[Math.floor(e * g.fps) % g.frames.length]
}

// ---------------------------------------------------------------- effects

var STYLE_COLORS = {
  smoke: "#6b7290", exhaust: "#ff9447", spout: ["#e8fbff", "#ffe680"], sparks: ["#ffd65a", "#fff6c0"],
  rise: "#e8fbff", fall: "#e8fbff", streak: "#e8fbff", twinkle: "#fff6c0"
}

function pickColor(c, k, env) { return resolve(Array.isArray(c) ? c[k % c.length] : c, env) }

// "$name" takes the value the triggering event passed (vars), if any.
// Inside longer text, "$name" is replaced in place ("$agentName \u2713").
function resolve(v, env) {
  if (typeof v !== "string" || v.indexOf("$") < 0) return v
  var vars = (env && env.ctx && env.ctx.vars) || {}
  return v.replace(/\$(\w+)/g, function(m, key) {
    return vars.hasOwnProperty(key) ? String(vars[key]) : (key.indexOf("Color") >= 0 ? "#ffd65a" : "")
  }).trim()
}

// One particle of a given style at age 0..1. s is its random seed.
function particle(em, style, ox, oy, age, s, k, flip, env) {
  var size = em.size || 1
  var back = flip ? 1 : -1
  var col = pickColor(em.color || STYLE_COLORS[style] || "#ffffff", k, env)
  var p = { x: ox, y: oy, w: 4 * size, h: 4 * size, rot: 0, o: 1 - age, color: col, glyph: em.glyph || "", round: false }
  var dr = em.drift || [60, -40]
  switch (style) {
    case "smoke":
      p.x += back * age * dr[0]; p.y += age * dr[1]
      p.w = p.h = (10 + age * 30) * size; p.round = true; p.o = 0.55 * (1 - age)
      break
    case "exhaust":
      var dir = em.forward ? -back : back
      p.x += dir * (8 + age * (em.reach || 30)); p.y += (s - 0.5) * 8 * size
      p.w = p.h = (2 + 6 * (1 - age)) * size; p.round = true
      p.color = age < 0.35 ? "#fff6c0" : age < 0.6 ? "#ffd65a" : col
      break
    case "spout":
      var spread = (s - 0.5) * 2
      p.x += spread * 34 * age * size
      p.y -= Math.sin(Math.PI * Math.min(1, age * 1.2)) * (60 - Math.abs(spread) * 20) * size + age * 10
      p.w = p.h = k % 3 === 0 ? 5 : 3
      break
    case "sparks":
      var ang = s * Math.PI * 2, d = Math.sqrt(age) * (em.radius || 30)
      p.x += Math.cos(ang) * d; p.y += Math.sin(ang) * d + age * age * 25
      p.w = p.h = 3 * size
      break
    case "rise":
      p.x += Math.sin(age * 6 + s * 6) * 8 + (s - 0.5) * 24
      p.y -= age * (em.height || 80)
      p.o = Math.sin(Math.PI * age)
      break
    case "fall":
      p.x += Math.sin(age * 4 + s * 6) * 10 + (s - 0.5) * 30
      p.y += age * (em.height || 200)
      p.o = Math.min(1, (1 - age) * 3)
      p.rot = age * 360 * (s - 0.5)
      break
    case "streak":
      var a2 = (em.angle === undefined ? 28 : em.angle) * Math.PI / 180
      var dist = age * (em.length || 380)
      p.x += Math.cos(a2) * dist; p.y += Math.sin(a2) * dist
      p.w = 34 * size; p.h = 2; p.rot = em.angle === undefined ? 28 : em.angle
      p.o = Math.sin(Math.PI * age)
      break
    case "twinkle":
      p.w = p.h = (2 + Math.round(s * 2)) * size
      p.o = Math.sin(Math.PI * age)
      break
  }
  return p
}

function emit(env, em, idx, e, out) {
  var ep = env.ep
  var from = em.from || 0, to = em.to === undefined ? Number(ep.length) || 0 : em.to
  var count = Math.min(em.count || 8, LIMITS.particles)
  var style = em.style || "rise"
  for (var k = 0; k < count && out.length < LIMITS.particles; k++) {
    var age, cyc, born
    if (em.every) {
      // Bursts: every particle is born together, every `every` seconds.
      if (e < from || e >= to) return
      cyc = Math.floor((e - from) / em.every)
      var local = e - from - cyc * em.every, dur = em.dur || 1.2
      if (local >= dur) return
      age = local / dur
      born = e - local
    } else {
      var rate = em.rate || 1
      var phase = e * rate + k / count
      cyc = Math.floor(phase)
      age = phase - cyc
      born = (cyc - k / count) / rate
      if (born < from || born > to) continue
      if (em.pulse && ((born - from) % em.pulse.every) > em.pulse.dur) continue
    }
    var s = hash(idx * 97 + k * 13.7 + cyc * 7.31)
    var ox, oy, flip = false
    if (em.at) {
      var o = actorAt(env, em.at, em.trail ? born : e)
      if (!o) continue
      flip = o.flip !== !!o.left
      var off = em.offset || [0, 0]
      ox = o.x + (o.flip ? -off[0] : off[0]); oy = o.y + off[1]
    } else {
      var rg = em.region || { x: 0, y: 0, w: 100, h: 100 }
      var x0 = coord(rg.x, env.anchor.x, env.ctx.W, env.ctx.mid), y0 = coord(rg.y, env.anchor.y, env.ctx.H)
      ox = x0 + hash(s * 31 + 1) * coord(rg.w, 0, env.ctx.W)
      oy = y0 + hash(s * 57 + 2) * coord(rg.h, 0, env.ctx.H)
    }
    out.push(particle(em, style, ox, oy, age, s, k, flip, env))
  }
}

// ---------------------------------------------------------------- state

function state(id, e, ctx) {
  var ep = get(id)
  if (!ep) return null
  var env = { ep: ep, ctx: ctx, anchor: anchor(ep, ctx), memo: ({}), busy: ({}), byId: actorIndex(ep) }
  var actors = [], shots = [], flashes = [], particles = [], ropes = [], beams = [], i, j

  var list = ep.actors || []
  for (i = 0; i < list.length && actors.length < LIMITS.actors; i++) {
    var a = list[i]
    var win = showWindow(a, ep)
    if (e < win[0] || e >= win[1]) continue
    if (a.blink && ((e - win[0]) % a.blink.every) >= a.blink.dur) continue
    var name = spriteName(a, e)
    if (!name && a.text === undefined) continue
    var r = actorAt(env, a.id, e)
    name = gaitName(env, a, e, name)
    var fade = a.fade ? Math.min(a.fade[0] ? seg(e, win[0], win[0] + a.fade[0]) : 1,
                                 a.fade[1] ? 1 - seg(e, win[1] - a.fade[1], win[1]) : 1) : 1
    var op = r.o * fade * (a.opacity === undefined ? 1 : a.opacity)
    if (op <= 0.01) continue
    var glow = a.glow ? { r: a.glow.r, a: a.glow.a, dy: a.glow.dy, color: resolve(a.glow.color, env) } : null
    actors.push({ sprite: resolve(name, env), text: a.text === undefined ? "" : String(resolve(a.text, env)), x: r.x, y: r.y,
      rot: r.rot, scale: r.scale, o: op, flip: r.flip, px: a.px || 4,
      color: resolve(a.color || "#ffd65a", env), size: a.size || 22, glow: glow })
  }

  var sh = ep.shots || []
  for (i = 0; i < sh.length; i++) {
    var S = sh[i]
    for (j = 0; j < (S.count || 1); j++) {
      var ts = S.start + j * (S.every || 1), travel = S.travel || 0.6
      var p = (e - ts) / travel
      if (p < 0 || p >= (S.hit ? 1.3 : 1)) continue
      var src = actorAt(env, S.from, ts), dst = actorAt(env, S.to, ts + travel)
      if (!src || !dst) continue
      var fo = S.fromOffset || [0, 0], to = S.toOffset || [0, 0]
      var fx = src.x + (src.flip ? -fo[0] : fo[0]), fy = src.y + fo[1]
      var tx = dst.x + (dst.flip ? -to[0] : to[0]), ty = dst.y + to[1]
      if (S.miss) { tx += S.miss[0]; ty += (j % 2 ? 1 : -1) * S.miss[1] }
      if (p < 1) {
        if (shots.length < LIMITS.shots)
          shots.push({ kind: S.kind || "laser", x: lerp(fx, tx, p), y: lerp(fy, ty, p) - Math.sin(Math.PI * p) * (S.arc || 0),
            color: resolve(S.color || "", env), glyph: S.glyph || "", flip: tx < fx })
      } else if (flashes.length < LIMITS.flashes) {
        flashes.push({ x: tx, y: ty + ((j % 3) - 1) * 10, r: 16, color: S.hitColor || "#9ff8ff", a: 1 - (p - 1) / 0.3 })
      }
    }
  }

  var bs = ep.bursts || []
  for (i = 0; i < bs.length; i++) {
    var B = bs[i], dur = B.duration || 2.5
    if (e < B.t || e >= B.t + dur) continue
    var at = actorAt(env, B.at, B.follow ? e : B.t)
    if (!at) continue
    var f = seg(e, B.t, B.t + dur), n = B.count || 4, cols = B.colors || ["#ff9447", "#ffd65a"]
    for (j = 0; j < n && flashes.length < LIMITS.flashes; j++) {
      var g = clamp(f * 1.6 - j * 0.15)
      if (g <= 0 || g >= 1) continue
      var spread = B.spread === undefined ? 30 : B.spread
      flashes.push({ x: at.x + (hash(j * 7 + i) - 0.5) * 2 * spread, y: at.y + (hash(j * 13 + i + 3) - 0.5) * 2 * spread,
        r: 12 + g * (B.size || 44), color: resolve(cols[j % cols.length], env), a: 1 - g })
    }
  }

  var ps = ep.particles || []
  for (i = 0; i < ps.length && particles.length < LIMITS.particles; i++) emit(env, ps[i], i, e, particles)

  var rs = ep.ropes || []
  for (i = 0; i < rs.length && ropes.length < LIMITS.ropes; i++) {
    var R = rs[i], rw = R.show || [0, Number(ep.length) || 0]
    if (e < rw[0] || e >= rw[1]) continue
    var ra = actorAt(env, R.a, e), rb = actorAt(env, R.b, e)
    if (!ra || !rb) continue
    var ao = R.aOffset || [0, 0], bo = R.bOffset || [0, 0]
    var x1 = ra.x + (ra.flip ? -ao[0] : ao[0]), y1 = ra.y + ao[1]
    var x2 = rb.x + (rb.flip ? -bo[0] : bo[0]), y2 = rb.y + bo[1]
    var pts = []
    for (j = 0; j < ROPE_POINTS; j++) {
      var u = j / (ROPE_POINTS - 1)
      pts.push({ x: lerp(x1, x2, u), y: lerp(y1, y2, u) + Math.sin(Math.PI * u) * (R.sag === undefined ? 20 : R.sag) })
    }
    ropes.push({ points: pts, color: resolve(R.color || "#d8e6ff", env) })
  }

  var bm = ep.beams || []
  for (i = 0; i < bm.length && beams.length < LIMITS.beams; i++) {
    var M = bm[i], mw = M.show || [0, Number(ep.length) || 0]
    var k2 = envelope(e, mw[0], mw[1], 0.6)
    if (!k2) continue
    var ms = actorAt(env, M.src, e), md = actorAt(env, M.dst, e)
    if (!ms || !md) continue
    var so = M.srcOffset || [0, 16], dof = M.dstOffset || [0, 0]
    beams.push({ x: ms.x + so[0], top: ms.y + so[1], bottom: md.y + dof[1], w0: M.w0 || 34, w1: M.w1 || 100,
      color: M.color || "#9ff8ff", a: k2 })
  }

  // Effects on the fixed scenery: wind bends the palm (degrees), lights turn
  // the station's windows into a party or an alarm.
  var fx = { wind: 0, lights: "" }
  var ef = ep.effects || {}
  if (ef.wind) fx.wind = (ef.wind[2] || 10) * envelope(e, ef.wind[0], ef.wind[1], 1.5)
  if (ef.lights && e >= ef.lights[0] && e < ef.lights[1]) fx.lights = ef.lights[2] || "party"

  var hide = ({})
  var hd = ep.island && ep.island.hide ? ep.island.hide : {}
  for (var who in hd) hide[who] = e >= hd[who][0] && e < hd[who][1]

  return { id: ep.id, actors: actors, shots: shots, flashes: flashes, particles: particles,
    ropes: ropes, beams: beams, hide: hide, effects: fx }
}

if (typeof module !== "undefined") {
  module.exports = { PACKS: PACKS, LIMITS: LIMITS, EVENTS: EVENTS, COOLDOWNS: COOLDOWNS, NO_QUEUE: NO_QUEUE, triggers: triggers,
    fleetEvents: fleetEvents, forEvent: forEvent, resolve: resolve,
    catalog: catalog, get: get, ids: ids, length: length,
    buildArt: buildArt, GAITS: GAITS, anchor: anchor, available: available, matches: matches, eligible: eligible,
    weight: weight, pick: pick, state: state, coord: coord }
}
