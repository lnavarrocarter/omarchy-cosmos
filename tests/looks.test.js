const test = require("node:test")
const assert = require("node:assert")
const { load, root } = require("./load.js")

const L = load(root + "/looks.js")
const S = load(root + "/sprites.js")

test("normalize: defaults, bad values fall back, colours lower-cased", () => {
  const d = L.normalize(undefined)
  assert.deepStrictEqual(d.astronaut, L.DEFAULT.astronaut)
  assert.strictEqual(d.home, "island")
  assert.strictEqual(d.planet.preset, "ringed")
  const n = L.normalize({ astronaut: { suit: "#FFAA00", visor: "red", accent: 3 }, home: "volcano",
    ships: { claude: "#123456", codex: "nope" }, planet: { preset: "lava" } })
  assert.strictEqual(n.astronaut.suit, "#ffaa00")
  assert.strictEqual(n.astronaut.visor, L.DEFAULT.astronaut.visor)
  assert.strictEqual(n.home, "island")
  assert.strictEqual(n.ships.claude, "#123456")
  assert.strictEqual(n.ships.codex, "")
  assert.strictEqual(n.planet.style, "lava")
})

test("planet: custom specs are bounded and keep a preset's gaps filled", () => {
  const p = L.planet({ style: "ocean", colors: ["#000000", "bad", "#ffffff"], rings: "yes", name: "x".repeat(99), seed: -77.6 })
  assert.strictEqual(p.preset, "custom")
  assert.strictEqual(p.style, "ocean")
  assert.deepStrictEqual(p.colors, ["#000000", "#ffffff"])
  assert.strictEqual(p.rings, false, "non-boolean rings take the preset's")
  assert.strictEqual(p.name.length, 40)
  assert.strictEqual(p.seed, 78)
  assert.strictEqual(L.planet({ style: "plaid" }).style, "bands")
  assert.ok(L.planet({ colors: ["#111111"] }).colors.length >= 2, "one colour is not enough")
})

test("every planet preset and style renders, rings or not", () => {
  for (const name of Object.keys(L.PLANETS)) {
    const sp = S.planet(80, 0, L.planet({ preset: name }))
    let lit = 0
    for (let i = 3; i < sp.data.length; i += 4) if (sp.data[i]) lit++
    assert.ok(lit > 15000, name + " draws a sphere")
    assert.ok(sp.w >= 166, name)
  }
  for (const style of L.STYLES) assert.ok(S.planet(40, 0, L.planet({ style, seed: 5 })).w > 0, style)
})

test("homes: every style has ground art, landmarks and level ground where it is flat", () => {
  for (const h of L.HOMES) {
    const lay = L.HOME_LAYOUT[h]
    assert.ok(S.home(h, 4).w >= 96, h + " is at least as wide as the island")
    assert.ok(S.decor(lay.left) && S.decor(lay.right), h + " landmarks")
    if (!lay.curve) assert.deepStrictEqual(L.ground(h, 30), { dy: 0, rot: 0 })
  }
  const mid = L.ground("planetoid", 192), side = L.ground("planetoid", 114)
  assert.strictEqual(mid.dy, 0)
  assert.ok(side.dy > 0 && side.dy < 24, "the dog stands a little lower on the curve")
  assert.ok(side.rot < 0, "and leans left")
})

test("palettes recolour the right letters", () => {
  const p = L.palettes({ cat: { fur: "#010203" } })
  assert.strictEqual(p.cat.C, "#010203")
  assert.strictEqual(p.astronaut.W, L.DEFAULT.astronaut.suit)
  assert.ok(/^#[0-9a-f]{6}$/.test(p.astronaut.G))
})
