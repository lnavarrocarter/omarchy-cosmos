const test = require("node:test")
const assert = require("node:assert")
const { load, root } = require("./load.js")

const O = load(root + "/orbital.js")
const S = load(root + "/sprites.js")
const L = load(root + "/looks.js")

const times = []
for (let t = 0; t < 400; t += 0.37) times.push(t)

test("ring plane matches the sprite's ring", () => {
  assert.strictEqual(O.RING.tilt, S.TECH_RING.tilt)
  assert.strictEqual(O.RING.rot, S.TECH_RING.rot)
  assert.deepStrictEqual(O.RING.broken, S.TECH_RING.broken)
})

test("every position is a finite number and stays near the planet screen", () => {
  for (const t of times) {
    const all = []
    for (let i = 0; i < O.COUNTS.satellites; i++) all.push(O.satellite(i, t))
    for (let i = 0; i < O.COUNTS.stations; i++) all.push(O.station(i, t))
    for (let i = 0; i < O.COUNTS.motherships; i++) all.push(O.mothership(i, t))
    for (let i = 0; i < O.COUNTS.junk; i++) all.push(O.junk(i, t))
    for (let i = 0; i < O.COUNTS.chunks; i++) all.push(O.chunk(i, t))
    for (const p of all) {
      assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y), JSON.stringify(p))
      // Screen half-size in art pixels at 3x is 320 x 180.
      assert.ok(Math.abs(p.x) < 320 && Math.abs(p.y) < 185, JSON.stringify(p))
    }
  }
})

test("chunks of crust lift off the upper limb, away from the elevator, and fall back", () => {
  let seenHigh = false
  for (const t of times) for (let i = 0; i < O.COUNTS.chunks; i++) {
    const c = O.chunk(i, t)
    if (!c.visible) continue
    assert.ok(c.y < 0, "upper half")
    assert.ok(c.r >= O.R, "outside the crust")
    assert.ok(Math.abs(c.x) >= 14, "clear of the elevator cable")
    if (c.r > O.R + 20) seenHigh = true
  }
  assert.ok(seenHigh)
})

test("water falls toward the planet and stops at the crust", () => {
  for (const t of times) for (let i = 0; i < O.COUNTS.chunks; i++) for (let k = 0; k < O.COUNTS.drops; k++) {
    const d = O.drop(i, k, t)
    if (d.visible) assert.ok(Math.hypot(d.x, d.y) > O.R)
  }
})

test("turret shots hit scrap in front of the planet, in range, and the scrap is gone after", () => {
  let shots = 0
  for (let n = 0; n < 80; n++) {
    const t = n * O.SHOT_EVERY + 0.1
    const s = O.shot(t)
    if (!s.beam) continue
    shots++
    const len = Math.hypot(s.to.x - s.from.x, s.to.y - s.from.y)
    assert.ok(len < 95, "within range")
    assert.ok(Math.hypot(s.to.x, s.to.y) > O.R + 5, "clear of the disc")
  }
  assert.ok(shots > 10, "turrets do fire")
})

test("the elevator climber stays on the cable", () => {
  for (const t of times) {
    const e = O.elevator(t)
    assert.ok(e.climberY <= e.baseY && e.climberY >= e.topY - 6)
  }
})

test("the forge preset is a tech world and draws", () => {
  const spec = L.planet({ preset: "forge" })
  assert.strictEqual(spec.style, "tech")
  assert.strictEqual(spec.colors.length, 6)
  const sp = S.planet(80, 0, spec)
  assert.ok(sp.w > 160 && sp.h > 160)
  for (const f of [S.mothership(3), S.orbStation("wheel"), S.orbStation("cross"), S.junk(2), S.crustChunk(1), S.climber(), S.turret()])
    assert.ok(f.w > 0 && f.h > 0 && f.data.length === f.w * f.h * 4)
})
