const test = require("node:test")
const assert = require("node:assert")
const { load, root } = require("./load.js")

const Z = load(root + "/zones.js")
const screens = (n) => Array.from({ length: n }, (_, i) => ({ name: "S" + i }))
const kinds = (plan) => plan.map((p) => p.kind)
const all = (plan) => plan.flatMap((p) => (p.kind === "void" ? [] : [p.kind]).concat(p.companions.map((c) => c.kind)))

test("three or more screens: one place per screen, as before", () => {
  assert.deepStrictEqual(kinds(Z.plan(screens(3), {})), ["planet", "castaway", "station"])
  assert.deepStrictEqual(kinds(Z.plan(screens(4), {})), ["planet", "void", "castaway", "station"])
  assert.ok(Z.plan(screens(3), {}).every((p) => p.companions.length === 0))
})

test("one screen: the hero big, the others small on each side", () => {
  for (const hero of Z.KINDS) {
    const [p] = Z.plan(screens(1), { hero })
    assert.strictEqual(p.kind, hero)
    assert.strictEqual(p.companions.length, 2)
    assert.deepStrictEqual(p.companions.map((c) => c.fx).sort(), [0.16, 0.84])
    assert.ok(p.companions.every((c) => c.scale < 1 && c.kind !== hero))
  }
  assert.strictEqual(Z.plan(screens(1), {})[0].kind, "castaway")
})

test("two screens: the hero always gets a screen, the third place joins as a companion", () => {
  for (const hero of Z.KINDS) {
    const plan = Z.plan(screens(2), { hero })
    assert.ok(kinds(plan).includes(hero))
    assert.deepStrictEqual(all(plan).sort(), ["castaway", "planet", "station"])
    const host = plan.find((p) => p.companions.length)
    assert.notStrictEqual(host.kind, hero)
  }
})

test("hidden places are left out, and the hero falls back to one that shows", () => {
  const plan = Z.plan(screens(1), { hero: "castaway", show: { castaway: false } })
  assert.notStrictEqual(plan[0].kind, "castaway")
  assert.deepStrictEqual(all(plan).sort(), ["planet", "station"])
  assert.deepStrictEqual(all(Z.plan(screens(3), { show: { station: false } })).sort(), ["castaway", "planet"])
  assert.deepStrictEqual(all(Z.plan(screens(1), { show: { planet: false, station: false } })), ["castaway"])
})

test("a place pinned to a screen in `zones` stays there and is not repeated", () => {
  const plan = Z.plan(screens(2), { zones: { S1: "station" } })
  assert.strictEqual(plan[1].kind, "station")
  const placed = all(plan)
  assert.strictEqual(new Set(placed).size, placed.length)
})

test("with fewer screens the hero wins over a pin", () => {
  const pins = { S0: "station", S1: "castaway" }
  assert.strictEqual(Z.plan(screens(1), { hero: "castaway", zones: pins })[0].kind, "castaway")
  const two = Z.plan(screens(2), { hero: "planet", zones: pins })
  assert.ok(kinds(two).includes("planet"))
  assert.deepStrictEqual(all(two).sort(), ["castaway", "planet", "station"])
})
