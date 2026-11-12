// Run with: node --test tests/
const test = require("node:test")
const assert = require("node:assert")
const fs = require("node:fs")
const path = require("node:path")

const src = fs.readFileSync(path.join(__dirname, "..", "physics.js"), "utf8")
  .replace(/^\.pragma library\s*/, "")
const mod = { exports: {} }
new Function("module", src)(mod)
const P = mod.exports

const world = { width: 6480, height: 1080 }

test("rng is deterministic per seed", () => {
  const a = P.rng(42), b = P.rng(42), c = P.rng(43)
  const sa = [a(), a(), a()], sb = [b(), b(), b()]
  assert.deepStrictEqual(sa, sb)
  assert.notDeepStrictEqual(sa, [c(), c(), c()])
  for (const v of sa) assert.ok(v >= 0 && v < 1)
})

test("wrap and wrapDelta keep positions on the ring", () => {
  assert.strictEqual(P.wrap(-10, 100), 90)
  assert.strictEqual(P.wrap(250, 100), 50)
  assert.strictEqual(P.wrapDelta(90, 100), -10)
  assert.strictEqual(P.wrapDelta(-90, 100), 10)
})

test("a body without forces keeps its momentum (inertia)", () => {
  const b = P.driftBody(0, "rock", world, P.rng(1), { g: 0, kick: 0, minSpeed: 0, vx: 20, vy: 5, x: 100, y: 500 })
  for (let i = 0; i < 100; i++) P.step(world, [b], [], 0.01, P.rng(2))
  assert.ok(Math.abs(b.x - 120) < 1e-6)
  assert.ok(Math.abs(b.y - 505) < 1e-6)
  assert.strictEqual(b.vx, 20)
})

test("a circular orbit stays near its radius", () => {
  const planet = { x: 900, y: 540, gm: 353000, soft: 20, radius: 0 }
  const moon = P.orbitBody(0, "moon", planet, 420, 0.3, false)
  const rand = P.rng(9)
  for (let i = 0; i < 60 * 90; i++) P.step(world, [moon], [planet], 1 / 60, rand)
  const r = Math.hypot(P.wrapDelta(moon.x - planet.x, world.width), moon.y - planet.y)
  assert.ok(Math.abs(r - 420) < 30, "radius drifted to " + r)
})

test("bodies never end up inside a solid attractor", () => {
  const planet = { x: 900, y: 540, gm: 353000, soft: 20, radius: 250 }
  const rand = P.rng(5)
  const bodies = []
  for (let i = 0; i < 30; i++) bodies.push(P.driftBody(i, "rock", world, rand, { g: 1 }))
  for (let i = 0; i < 60 * 60; i++) P.step(world, bodies, [planet], 1 / 60, rand)
  for (const b of bodies) {
    const d = Math.hypot(P.wrapDelta(b.x - planet.x, world.width), b.y - planet.y)
    assert.ok(d >= planet.radius + b.r - 1, "body inside planet at " + d)
    assert.ok(b.x >= 0 && b.x < world.width)
    assert.ok(Number.isFinite(b.vx) && Number.isFinite(b.vy))
  }
})

test("drifters respect their speed limits", () => {
  const rand = P.rng(11)
  const bodies = []
  for (let i = 0; i < 20; i++) bodies.push(P.driftBody(i, "rock", world, rand))
  for (let i = 0; i < 60 * 30; i++) P.step(world, bodies, [], 1 / 60, rand)
  for (const b of bodies) {
    const s = Math.hypot(b.vx, b.vy)
    assert.ok(s <= b.maxSpeed + 1e-6 && s >= b.minSpeed - 1e-6, "speed " + s)
  }
})

test("comets leave a bounded trail and expire", () => {
  const rand = P.rng(3)
  const c = { kind: "comet", g: 0, kick: 0, maxSpeed: 1000, minSpeed: 0, r: 4, a: 0, va: 0, active: false }
  P.launchComet(c, world, rand)
  assert.ok(c.active)
  for (let i = 0; i < 60 * 20; i++) P.step(world, [c], [], 1 / 60, rand)
  assert.ok(!c.active)
  assert.ok(c.trail.length <= 16)
})
