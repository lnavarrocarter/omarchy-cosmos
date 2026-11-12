// Run with: node --test tests/
const test = require("node:test")
const assert = require("node:assert")
const fs = require("node:fs")
const path = require("node:path")

const src = fs.readFileSync(path.join(__dirname, "..", "daycycle.js"), "utf8").replace(/^\.pragma library\s*/, "")
const mod = { exports: {} }
new Function("module", src)(mod)
const D = mod.exports

const rise = 6 * 60 + 35, set = 20 * 60 + 40

test("clock strings parse, bad ones fall back", () => {
  assert.strictEqual(D.parseClock("06:35", 0), 395)
  assert.strictEqual(D.parseClock("24:00", 7), 7)
  assert.strictEqual(D.parseClock("6.30", 7), 7)
  assert.strictEqual(D.parseClock(null, 7), 7)
})

test("the sun rises left, peaks mid-day, sets right", () => {
  const morning = D.skyBody(rise + 1, rise, set)
  const noon = D.skyBody((rise + set) / 2, rise, set)
  const evening = D.skyBody(set - 1, rise, set)
  for (const b of [morning, noon, evening]) assert.strictEqual(b.kind, "sun")
  assert.ok(morning.x < 0.1 && evening.x > 0.9)
  assert.ok(Math.abs(noon.x - 0.5) < 0.01)
  assert.ok(noon.y < morning.y && noon.y < evening.y)
  assert.ok(noon.y >= 0.1)
})

test("the moon takes the night, across midnight", () => {
  const late = D.skyBody(23 * 60, rise, set)
  const early = D.skyBody(3 * 60, rise, set)
  assert.strictEqual(late.kind, "moon")
  assert.strictEqual(early.kind, "moon")
  assert.ok(late.x < early.x)
  const mid = D.skyBody((set + (rise + 1440 - set) / 2) % 1440, rise, set)
  assert.ok(Math.abs(mid.x - 0.5) < 0.01)
})

test("horizon colours: warm at dawn and dusk, faint by day and night", () => {
  const dawn = D.horizon(rise, rise, set), dusk = D.horizon(set, rise, set)
  const day = D.horizon(13 * 60, rise, set), night = D.horizon(2 * 60, rise, set)
  assert.ok(dawn.strength > day.strength && dusk.strength > night.strength)
  assert.ok(dawn.color[0] > dawn.color[2] && dusk.color[0] > dusk.color[2])
  assert.ok(day.color[2] > day.color[0])
})

test("moon phase follows the synodic month", () => {
  // 2024-04-08 was a new moon, 2024-04-23 a full moon.
  const nw = D.moonPhase(new Date(Date.UTC(2024, 3, 8, 18, 21)))
  const full = D.moonPhase(new Date(Date.UTC(2024, 3, 23, 23, 49)))
  assert.ok(nw < 0.02 || nw > 0.98, "new " + nw)
  assert.ok(Math.abs(full - 0.5) < 0.03, "full " + full)
})

test("next o'clock and its label", () => {
  const d = new Date(2026, 10, 11, 17, 59, 30)
  assert.strictEqual(D.msToNextHour(d), 30000)
  assert.strictEqual(D.hourLabel(new Date(2026, 10, 11, 9, 0, 0)), "09:00")
  assert.strictEqual(D.msToNextHour(new Date(2026, 10, 11, 23, 0, 0)), 3600000)
})
