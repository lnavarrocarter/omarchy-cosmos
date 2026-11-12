.pragma library

// Agent fleet: one ship per agent, based at the station's hangars.
//
// Modes, driven by the fleet probe:
//   docked   idle on its hangar pad
//   warmup   a Hub task is queued: engines idle, pad light blinking
//   mission  a Hub task runs: fly to the planet and orbit while it works
//   waiting  a Hub task needs input: hover by the castaway with a beacon
//   inbound  the task ended: fly home with cargo (done) or smoke (failed)
//   patrol   the agent's CLI is in use (recent activity or a turn still
//            open): loop between station and castaway
// A mission lasts at least MIN_MISSION seconds, and a Hub task that started
// and finished between two probes still flies a short sortie, so quick
// tasks (local ones take a few seconds) are never invisible.
// Every prompt also launches a scout that streaks across all screens.

var AGENTS = ["claude", "codex", "copilot", "local"]
var COLORS = { claude: "#ff9447", codex: "#4fd1c5", copilot: "#a78bfa", local: "#ffd65a" }
var LABELS = { claude: "CLAUDE", codex: "CODEX", copilot: "COPILOT", local: "QWEN" }
var TRANSIT = 14
var INBOUND = 14
var HOVER_IN = 10
var MIN_MISSION = TRANSIT + 4
var SCOUT_LIFE = 18
var SCOUT_SPEED = 380

function find(attractors, kind) {
  for (var i = 0; i < attractors.length; i++) if (attractors[i].kind === kind) return attractors[i]
  return null
}

function layout(world, attractors) {
  var planet = find(attractors, "planet")
  var castaway = find(attractors, "castaway")
  var station = find(attractors, "station")
  var base = station || castaway || planet || { x: world.width / 2, y: world.height / 2 }
  var spread = [-660, -220, 220, 660]
  var pads = {}
  for (var i = 0; i < AGENTS.length; i++)
    pads[AGENTS[i]] = { x: base.x + spread[i], y: world.height * 0.83 }
  return { W: world.width, H: world.height, planet: planet, castaway: castaway, station: station, base: base, pads: pads }
}

function wrapDelta(d, size) {
  if (!(size > 0)) return d
  d = d % size
  if (d > size / 2) d -= size
  if (d < -size / 2) d += size
  return d
}

function ease(u) {
  u = Math.max(0, Math.min(1, u))
  return u * u * (3 - 2 * u)
}

function bezier(p0, p1, p2, u) {
  var a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u
  return { x: a * p0.x + b * p1.x + c * p2.x, y: a * p0.y + b * p1.y + c * p2.y }
}

function sign(v, fallback) {
  return v > 0.001 ? 1 : v < -0.001 ? -1 : fallback
}

function padRest(ctx, agent, t, index) {
  var pad = ctx.pads[agent]
  return { x: pad.x, y: pad.y - 30 + Math.sin(t * 1.3 + index) * 3 }
}

// Where a ship is at sim time t. dir is -1 facing left, 1 facing right.
function position(ship, ctx, t, index) {
  var agent = ship.agent
  var rest = padRest(ctx, agent, t, index)
  var from = ship.from || rest
  var e = t - (ship.since || 0)
  var target, p, u, mid

  if (ship.mode === "mission") {
    // Orbit the moon of the task's workspace when there is one.
    var moon = ship.workspace && ctx.moons ? ctx.moons[ship.workspace] : null
    var body = moon || ctx.planet || ctx.castaway || ctx.base
    target = { x: from.x + wrapDelta(body.x - from.x, ctx.W), y: body.y }
    var R = moon ? 64 + index * 16 : (ctx.planet ? 330 : 230) + index * 45
    var flat = moon ? 0.8 : 0.6
    var a0 = Math.atan2(from.y - target.y, from.x - target.x)
    var entry = { x: target.x + Math.cos(a0) * R, y: target.y + Math.sin(a0) * R * flat }
    if (e < TRANSIT) {
      u = ease(e / TRANSIT)
      mid = { x: (from.x + entry.x) / 2, y: ctx.H * 0.12 + index * 30 }
      p = bezier(from, mid, entry, u)
      return { x: p.x, y: p.y, dir: sign(entry.x - from.x, -1), flame: 1 }
    }
    var w = (moon ? 0.6 : 0.22) * (index % 2 ? -1 : 1)
    var a = a0 + w * (e - TRANSIT)
    return { x: target.x + Math.cos(a) * R, y: target.y + Math.sin(a) * R * flat,
             dir: sign(-Math.sin(a) * w, -1), flame: 0.4 }
  }

  if (ship.mode === "waiting") {
    target = ctx.castaway || ctx.base
    var hover = { x: target.x - 240 + index * 160, y: target.y - 290 }
    if (e < HOVER_IN) {
      u = ease(e / HOVER_IN)
      mid = { x: (from.x + hover.x) / 2, y: Math.min(from.y, hover.y) - 120 }
      p = bezier(from, mid, hover, u)
      return { x: p.x, y: p.y, dir: sign(hover.x - from.x, -1), flame: 1, beacon: true }
    }
    return { x: hover.x, y: hover.y + Math.sin(t * 1.7 + index) * 6, dir: -1, flame: 0.2, beacon: true }
  }

  if (ship.mode === "inbound") {
    if (e < INBOUND) {
      u = ease(e / INBOUND)
      mid = { x: (from.x + rest.x) / 2, y: ctx.H * 0.2 }
      p = bezier(from, mid, rest, u)
      return { x: p.x, y: p.y, dir: sign(rest.x - from.x, 1), flame: 1,
               cargo: ship.result === "completed", smoke: ship.result === "failed" }
    }
    return { x: rest.x, y: rest.y, dir: -1, flame: 0, cargo: ship.result === "completed" }
  }

  if (ship.mode === "patrol") {
    var other = ctx.castaway && ctx.castaway !== ctx.base ? ctx.castaway : ctx.planet
    var cx = other ? (ctx.base.x + other.x) / 2 : ctx.base.x
    var A = other ? Math.abs(ctx.base.x - other.x) * 0.55 : 500
    var ph = index * 1.7
    var loop = { x: cx + A * Math.sin(0.1 * e + ph), y: ctx.H * 0.28 + 120 * Math.sin(0.2 * e + ph * 2) + index * 36 }
    var k = ease(e / 5)
    return { x: from.x + (loop.x - from.x) * k, y: from.y + (loop.y - from.y) * k,
             dir: sign(Math.cos(0.1 * e + ph), -1), flame: 0.8 }
  }

  return { x: rest.x, y: rest.y, dir: -1, flame: ship.mode === "warmup" ? 0.5 : 0 }
}

function taskFor(agent, tasks) {
  var order = ["running", "needs_input", "queued"]
  for (var o = 0; o < order.length; o++)
    for (var i = 0; i < tasks.length; i++)
      if (tasks[i].engine === agent && tasks[i].status === order[o]) return tasks[i]
  return null
}

// A task that finished since the last probe without being seen running.
function sortieFor(agent, tasks, flown) {
  for (var i = 0; i < tasks.length; i++)
    if (tasks[i].engine === agent && tasks[i].recent && tasks[i].id !== flown) return tasks[i]
  return null
}

function statusOf(id, tasks) {
  for (var i = 0; i < tasks.length; i++) if (tasks[i].id === id) return tasks[i].status
  return null
}

function finalResult(status) {
  return status === "completed" || status === "failed" || status === "cancelled" ? status : null
}

// Next mode for one ship from the latest probe data.
function decide(prev, info, tasks, now, t, interactiveWindow) {
  var active = taskFor(prev.agent, tasks)
  if (active) {
    var mode = active.status === "running" ? "mission" : active.status === "needs_input" ? "waiting" : "warmup"
    return { mode: mode, taskId: active.id, result: null, workspace: active.workspace || "" }
  }
  if (prev.mode === "mission" || prev.mode === "waiting") {
    var result = finalResult(statusOf(prev.taskId, tasks)) || prev.result || "completed"
    // Reach the orbit before turning back, however quick the task was.
    if (prev.mode === "mission" && t - prev.since < MIN_MISSION)
      return { mode: "mission", taskId: prev.taskId, result: result }
    return { mode: "inbound", taskId: prev.taskId, result: result }
  }
  if (prev.mode === "inbound" && t - prev.since < INBOUND)
    return { mode: "inbound", taskId: prev.taskId, result: prev.result }
  var sortie = sortieFor(prev.agent, tasks, prev.taskId)
  if (sortie)
    return { mode: "mission", taskId: sortie.id, result: finalResult(sortie.status), workspace: sortie.workspace || "" }
  var last = info && info.last_activity
  if ((info && info.busy) || (last && now - last < interactiveWindow)) return { mode: "patrol", taskId: null, result: null }
  return { mode: "docked", taskId: null, result: prev.mode === "inbound" ? prev.result : null }
}

function update(ships, fleet, ctx, t, interactiveWindow) {
  var tasks = (fleet && fleet.hub && fleet.hub.tasks) || []
  var agents = (fleet && fleet.agents) || {}
  var now = (fleet && fleet.time) || 0
  var next = {}
  for (var i = 0; i < AGENTS.length; i++) {
    var agent = AGENTS[i]
    var prev = ships[agent] || { agent: agent, mode: "docked", since: t, taskId: null, result: null, from: null }
    var d = decide(prev, agents[agent], tasks, now, t, interactiveWindow)
    if (d.mode !== prev.mode || (d.taskId && d.taskId !== prev.taskId)) {
      var here = position(prev, ctx, t, i)
      next[agent] = { agent: agent, mode: d.mode, since: t, taskId: d.taskId, result: d.result,
                      workspace: d.workspace || prev.workspace || "", from: { x: here.x, y: here.y } }
    } else {
      next[agent] = prev
      prev.result = d.result || prev.result
    }
  }
  return next
}

// New scouts for prompts newer than lastSeen.
function scouts(existing, events, lastSeen, t) {
  var list = []
  for (var i = 0; i < existing.length; i++) if (t - existing[i].start < SCOUT_LIFE) list.push(existing[i])
  var newest = lastSeen
  var stagger = 0
  for (var j = 0; j < (events || []).length; j++) {
    var ev = events[j]
    if (!(ev.at > lastSeen) || AGENTS.indexOf(ev.agent) < 0) continue
    newest = Math.max(newest, ev.at)
    list.push({ agent: ev.agent, start: t + stagger, tokens: ev.tokens || 0, seed: (ev.at * 1000) % 997 / 997 })
    stagger += 0.8
  }
  while (list.length > 10) list.shift()
  return { list: list, lastSeen: newest }
}

function scoutPosition(scout, ctx, t) {
  var e = t - scout.start
  if (e < 0 || e > SCOUT_LIFE) return null
  var pad = ctx.pads[scout.agent]
  var cruise = ctx.H * (0.1 + scout.seed * 0.55)
  var y = pad.y - 40 + (cruise - pad.y + 40) * ease(e / 3) + Math.sin(e * 1.8 + scout.seed * 9) * 18
  return { x: pad.x - SCOUT_SPEED * e, y: y, opacity: Math.min(1, e * 3, (SCOUT_LIFE - e) / 2) }
}

// Fuel left, 0..1. stats is the probe's agent entry (or a token count).
// An agent that reports its own plan limits (Codex) uses the most used
// window; otherwise today's tokens drain the daily budget. Qwen is solar.
function fuel(agent, stats, budgets) {
  if (agent === "local") return 1
  var s = typeof stats === "number" ? { tokens_today: stats } : (stats || {})
  if (typeof s.limit_used === "number" && s.limit_used >= 0)
    return Math.max(0, Math.min(1, 1 - s.limit_used / 100))
  var budget = budgets && budgets[agent]
  if (!(budget > 0)) return 1
  return Math.max(0, Math.min(1, 1 - (s.tokens_today || 0) / budget))
}

function shortNumber(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B"
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M"
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "k"
  return String(Math.round(n))
}

if (typeof module !== "undefined") {
  module.exports = { AGENTS: AGENTS, layout: layout, position: position, decide: decide, update: update,
    scouts: scouts, scoutPosition: scoutPosition, fuel: fuel, shortNumber: shortNumber, TRANSIT: TRANSIT, INBOUND: INBOUND,
    MIN_MISSION: MIN_MISSION }
}
