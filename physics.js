.pragma library

// Cosmos physics: one shared universe for every screen.
//
// Bodies keep their momentum (inertia), bend around attractors (softened
// Newtonian gravity), and take small random impulses now and then so the
// scene never settles into a loop. The world wraps horizontally, so a body
// leaving the right edge of the last screen re-enters on the first.

// Small deterministic PRNG (mulberry32) so a seed gives the same sky.
function rng(seed) {
  var a = seed >>> 0
  return function() {
    a = (a + 0x6D2B79F5) >>> 0
    var t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Box-Muller normal sample from a uniform source.
function gauss(rand) {
  var u = Math.max(1e-9, rand())
  var v = rand()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function wrap(value, size) {
  if (size <= 0) return value
  value = value % size
  return value < 0 ? value + size : value
}

// Shortest signed horizontal distance on the wrapped world.
function wrapDelta(d, size) {
  if (size <= 0) return d
  if (d > size / 2) return d - size
  if (d < -size / 2) return d + size
  return d
}

// A body in a circular orbit around an attractor.
function orbitBody(id, kind, attractor, radius, phase, clockwise, extra) {
  var speed = Math.sqrt(attractor.gm / radius) * (clockwise ? -1 : 1)
  var b = {
    id: id, kind: kind,
    x: attractor.x + Math.cos(phase) * radius,
    y: attractor.y + Math.sin(phase) * radius,
    vx: -Math.sin(phase) * speed,
    vy: Math.cos(phase) * speed,
    a: 0, va: 0, r: 14, g: 1, kick: 0, maxSpeed: 400, minSpeed: 0,
    scale: 1, active: true, wrapY: false, trail: null, variant: 0
  }
  for (var k in (extra || {})) b[k] = extra[k]
  return b
}

function driftBody(id, kind, world, rand, extra) {
  var angle = rand() * Math.PI * 2
  var speed = 12 + rand() * 28
  var b = {
    id: id, kind: kind,
    x: rand() * world.width,
    y: world.height * (0.08 + rand() * 0.84),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed * 0.5,
    a: rand() * 360, va: (rand() - 0.5) * 24,
    r: 10, g: 0.12, kick: 0.08, maxSpeed: 70, minSpeed: 8,
    scale: 1, active: true, wrapY: true, trail: null, variant: Math.floor(rand() * 4)
  }
  for (var k in (extra || {})) b[k] = extra[k]
  return b
}

// A comet starts outside one vertical edge region and crosses the world fast.
function launchComet(body, world, rand) {
  var fromLeft = rand() < 0.5
  var y0 = world.height * (0.05 + rand() * 0.35)
  var speed = 260 + rand() * 220
  var angle = 0.08 + rand() * 0.22
  var dir = fromLeft ? 1 : -1
  body.x = rand() * world.width
  body.y = y0
  body.vx = Math.cos(angle) * speed * dir
  body.vy = Math.sin(angle) * speed
  body.active = true
  body.life = 0
  body.ttl = 6 + rand() * 6
  body.trail = []
  body.trailClock = 0
}

// Advance the world by dt seconds. Mutates bodies in place.
function step(world, bodies, attractors, dt, rand) {
  var W = world.width, H = world.height
  for (var i = 0; i < bodies.length; i++) {
    var b = bodies[i]
    // Inactive, or held by the mouse (Cosmos moves it until it is thrown).
    if (!b.active || b.held) continue

    var ax = 0, ay = 0
    if (b.g > 0) {
      for (var j = 0; j < attractors.length; j++) {
        var at = attractors[j]
        var dx = wrapDelta(at.x - b.x, W)
        var dy = at.y - b.y
        var d2 = dx * dx + dy * dy + at.soft * at.soft
        var inv = at.gm * b.g / (d2 * Math.sqrt(d2))
        ax += dx * inv
        ay += dy * inv
      }
    }

    // Random impulses: a Poisson process with rate b.kick per second.
    if (b.kick > 0 && rand() < b.kick * dt) {
      b.vx += gauss(rand) * 9
      b.vy += gauss(rand) * 6
      b.va += gauss(rand) * 18
    }

    b.vx += ax * dt
    b.vy += ay * dt

    var speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy)
    if (speed > b.maxSpeed) {
      b.vx *= b.maxSpeed / speed
      b.vy *= b.maxSpeed / speed
    } else if (b.minSpeed > 0 && speed < b.minSpeed) {
      var ang = speed > 1e-3 ? Math.atan2(b.vy, b.vx) : rand() * Math.PI * 2
      b.vx = Math.cos(ang) * b.minSpeed
      b.vy = Math.sin(ang) * b.minSpeed
    }

    b.x += b.vx * dt
    b.y += b.vy * dt
    b.a = (b.a + b.va * dt) % 360
    b.va *= Math.max(0, 1 - 0.02 * dt)

    // Solid attractors: bounce softly off their surface, a circle that may
    // sit solidDy below the attractor (a round home under the island spot).
    for (var k = 0; k < attractors.length; k++) {
      var s = attractors[k]
      if (!(s.radius > 0)) continue
      var sy = s.y + (s.solidDy || 0)
      var ddx = wrapDelta(b.x - s.x, W)
      var ddy = b.y - sy
      var dist = Math.sqrt(ddx * ddx + ddy * ddy)
      var minDist = s.radius + b.r
      if (dist > 1e-3 && dist < minDist) {
        var nx = ddx / dist, ny = ddy / dist
        b.x = s.x + nx * minDist
        b.y = sy + ny * minDist
        var vn = b.vx * nx + b.vy * ny
        if (vn < 0) {
          b.vx -= 1.6 * vn * nx
          b.vy -= 1.6 * vn * ny
          b.va += (rand() - 0.5) * 40
        }
      }
    }

    if (b.kind === "comet") {
      b.life += dt
      b.trailClock += dt
      if (b.trailClock > 0.045) {
        b.trailClock = 0
        b.trail.unshift({ x: b.x, y: b.y })
        if (b.trail.length > 16) b.trail.pop()
      }
      if (b.life > b.ttl || b.y > H + 80) b.active = false
    } else {
      // Remember the unwrapped position so a trail never jumps a seam.
      if (b.wrapY) {
        var margin = 60
        if (b.y < -margin) b.y += H + margin * 2
        else if (b.y > H + margin) b.y -= H + margin * 2
      }
    }
    b.x = wrap(b.x, W)
  }
}

// Total kinetic energy per unit mass; used by tests.
function energy(bodies) {
  var e = 0
  for (var i = 0; i < bodies.length; i++) {
    var b = bodies[i]
    if (b.active) e += 0.5 * (b.vx * b.vx + b.vy * b.vy)
  }
  return e
}

if (typeof module !== "undefined") {
  module.exports = { rng: rng, gauss: gauss, wrap: wrap, wrapDelta: wrapDelta,
    orbitBody: orbitBody, driftBody: driftBody, launchComet: launchComet,
    step: step, energy: energy }
}
