// Run with: node --test tests/
// Every episode in every pack is checked here, so a new one only needs to
// be added to a pack: these tests catch typos, missing art and overflows.
const test = require("node:test")
const assert = require("node:assert")
const { load, root } = require("./load.js")

const E = load(root + "/episodes.js")
const S = load(root + "/sprites.js")
const art = E.buildArt(S)

const ctx = { W: 6520, H: 1080, planet: { x: 960, y: 562 }, castaway: { x: 3240, y: 670 },
  station: { x: 5480, y: 432 }, bob: 0 }
const ZONES = ["island", "planet", "station", "castaway", "world", "sun", "moon"]
const STYLES = ["smoke", "exhaust", "spout", "sparks", "rise", "fall", "streak", "twinkle"]

function finite(v, where) {
  if (v && typeof v === "object") for (const k in v) finite(v[k], where + "." + k)
  else if (typeof v === "number") assert.ok(Number.isFinite(v), where + " is not finite")
}

test("catalog: unique ids, known zones, sane lengths and references", () => {
  const ids = E.ids()
  assert.ok(ids.length >= 15)
  let total = 0
  for (const pack of E.PACKS) total += pack.EPISODES.length
  assert.strictEqual(ids.length, total, "duplicate episode ids")
  for (const id of ids) {
    const ep = E.get(id)
    assert.ok(ZONES.includes(ep.zone), id + ": unknown zone " + ep.zone)
    assert.ok(ep.length > 5 && ep.length <= 180, id + ": length")
    assert.ok(typeof ep.title === "string" && ep.title, id + ": title")
    const actors = new Set((ep.actors || []).map((a) => a.id))
    const ref = (name, what) => assert.ok(actors.has(name), `${id}: ${what} refers to unknown actor ${name}`)
    for (const a of ep.actors || []) {
      for (const k of a.path || []) if (k.on) ref(k.on, "path")
      if (a.orbit && a.orbit.on) ref(a.orbit.on, "orbit")
      for (const name of [a.sprite, ...(a.frames || []), ...(a.swap || []).map((s) => s[1])])
        if (name) assert.ok(art[name], `${id}: no art named ${name}`)
    }
    for (const s of ep.shots || []) { ref(s.from, "shot"); ref(s.to, "shot") }
    for (const b of ep.bursts || []) ref(b.at, "burst")
    for (const r of ep.ropes || []) { ref(r.a, "rope"); ref(r.b, "rope") }
    for (const b of ep.beams || []) { ref(b.src, "beam"); ref(b.dst, "beam") }
    for (const p of ep.particles || []) {
      if (p.at) ref(p.at, "particles")
      assert.ok(STYLES.includes(p.style), `${id}: unknown particle style ${p.style}`)
    }
  }
})

test("every episode stays finite and within the view's slots", () => {
  for (const id of E.ids()) {
    for (let e = 0; e <= E.length(id); e += 0.2) {
      const s = E.state(id, e, ctx)
      finite(s, id + "@" + e.toFixed(1))
      for (const k in E.LIMITS) assert.ok(s[k].length <= E.LIMITS[k], `${id}@${e}: too many ${k}`)
    }
  }
})

test("every episode draws something for most of its length", () => {
  for (const id of E.ids()) {
    let shown = 0, steps = 0
    for (let e = 0; e < E.length(id); e += 0.5, steps++) {
      const s = E.state(id, e, ctx)
      if (s.actors.length || s.particles.length || s.flashes.length || s.ropes.length) shown++
    }
    assert.ok(shown / steps > 0.6, id + " is empty too often")
  }
})

test("availability follows the zones present", () => {
  const bare = { W: 1920, H: 1080, planet: null, castaway: null, station: null }
  assert.strictEqual(E.available("dogfight", bare), false)
  assert.strictEqual(E.available("abduction", bare), false, "no planet, no abduction")
  assert.strictEqual(E.available("abduction", ctx), true)
  assert.strictEqual(E.available("whale", bare), true, "world episodes play anywhere")
  assert.strictEqual(E.available("nope", ctx), false)
  finite(E.state("abduction", 12, bare), "abduction")
  // One screen (only the island) and two screens (planet and island).
  const one = { W: 1920, H: 1080, castaway: { x: 960, y: 670 }, planet: null, station: null }
  const two = { W: 3840, H: 1080, planet: { x: 960, y: 562 }, castaway: { x: 2880, y: 670 }, station: null }
  for (const id of E.ids()) {
    const zone = E.get(id).zone
    if (zone === "planet" || zone === "station") assert.strictEqual(E.available(id, one), false, id)
    if (zone === "station") assert.strictEqual(E.available(id, two), false, id)
  }
  assert.ok(E.ids().filter((id) => E.available(id, one)).length > 60, "one screen still has plenty")
})

test("conditions: when, boost and pick", () => {
  const nov = { month: 11, night: false, hour: 15, date: "11-12", cpu: 0.2 }
  const dec = { month: 12, night: true, hour: 23, date: "12-31", cpu: 0.2 }
  assert.strictEqual(E.eligible("sleigh", ctx, nov), false)
  assert.strictEqual(E.eligible("sleigh", ctx, dec), true)
  assert.strictEqual(E.eligible("fireworks", ctx, nov), false)
  assert.ok(E.weight("fireworks", dec) > E.weight("fireworks", { ...dec, date: "12-20" }))
  assert.ok(E.matches({ hours: [22, 6] }, { hour: 23 }))
  assert.ok(E.matches({ hours: [22, 6] }, { hour: 3 }))
  assert.ok(!E.matches({ hours: [22, 6] }, { hour: 12 }))
  let i = 0
  const rand = () => (i++ * 0.137) % 1
  const seen = new Set()
  for (let k = 0; k < 200; k++) {
    const id = E.pick(rand, ["whale"], ctx, nov)
    assert.ok(E.eligible(id, ctx, nov), id + " picked while not eligible")
    assert.notStrictEqual(id, "whale")
    seen.add(id)
  }
  assert.ok(seen.size >= 6, "pick should vary")
})

test("the dog leaves from and returns to its spot; the cow ends up in the UFO", () => {
  const at = (e) => E.state("dogfight", e, ctx)
  assert.strictEqual(at(3.9).hide.dog, false)
  assert.strictEqual(at(4).hide.dog, true)
  assert.strictEqual(at(36.6).hide.dog, false)
  const dogAt = (e) => at(e).actors.find((a) => a.sprite === "dog")
  const home = { x: ctx.castaway.x - 78, y: ctx.castaway.y - 40 - 16 }
  assert.ok(Math.hypot(dogAt(4).x - home.x, dogAt(4).y - home.y) < 1)
  assert.ok(Math.hypot(dogAt(36.49).x - home.x, dogAt(36.49).y - home.y) < 8)
  let prev = null
  for (let e = 1.6; e < 39.9; e += 1 / 60) {
    const ship = at(e).actors.find((a) => a.sprite.startsWith("dogShip"))
    if (prev) assert.ok(Math.hypot(ship.x - prev.x, ship.y - prev.y) < 40, "ship jumps at " + e.toFixed(2))
    prev = ship
  }
  assert.ok(at(24).flashes.length > 0)
  const ab = E.state("abduction", 16.95, ctx)
  const cow = ab.actors.find((a) => a.sprite === "cow"), ufo = ab.actors.find((a) => a.sprite.startsWith("ufo"))
  assert.ok(Math.abs(cow.x - ufo.x) < 10 && Math.abs(cow.y - ufo.y - 18) < 10)
  assert.ok(!E.state("abduction", 18, ctx).actors.some((a) => a.sprite === "cow"))
})

test("riders mirror with what they ride", () => {
  const p = E.state("pizza", 3, ctx)
  const scooter = p.actors.find((a) => a.sprite === "scooter"), box = p.actors.find((a) => a.sprite === "pizzaBox")
  assert.ok(scooter.flip)
  assert.ok(box.x > scooter.x, "box rides at the back of a left-facing scooter")
})

test("events: fleet transitions become taskDone / taskFailed / needsInput", () => {
  const labels = { claude: "Claude", codex: "Codex" }, colors = { claude: "#d97757", codex: "#10a37f" }
  const prev = { claude: { mode: "mission" }, codex: { mode: "mission" } }
  const next = { claude: { mode: "inbound", result: "completed" }, codex: { mode: "inbound", result: "failed" } }
  const ev = E.fleetEvents(prev, next, labels, colors)
  assert.deepStrictEqual(ev.map((x) => x.name), ["taskDone", "taskFailed"])
  assert.strictEqual(ev[0].vars.agentName, "Claude")
  assert.strictEqual(ev[1].vars.agentColor, "#10a37f")
  assert.deepStrictEqual(E.fleetEvents({ claude: { mode: "mission" } }, { claude: { mode: "waiting" } }).map((x) => x.name), ["needsInput"])
  assert.deepStrictEqual(E.fleetEvents({}, next), [], "no events on the first update")
  assert.deepStrictEqual(E.fleetEvents(next, next), [])
})

test("events: every trigger has an episode; triggered ones never play at random", () => {
  const now = { month: 11, hour: 12, night: false, cpu: 0.95, scene: "idle" }
  for (const name of E.EVENTS) {
    assert.ok(E.forEvent(() => 0.3, name, ctx, now, []), "no episode answers " + name)
    assert.ok(E.COOLDOWNS[name] > 0)
  }
  for (const id of E.ids()) {
    const ep = E.get(id)
    for (const name of E.triggers(ep)) assert.ok(E.EVENTS.includes(name), id + ": unknown event " + name)
    if (ep.on && !ep.random) assert.strictEqual(E.eligible(id, ctx, now), false, id + " should be event-only")
  }
  assert.strictEqual(E.forEvent(() => 0.3, "nothing", ctx, now, []), "")
})

test("events: $vars fill texts and colours", () => {
  const c = { ...ctx, vars: { agentName: "Codex", agentColor: "#10a37f" } }
  const s = E.state("confetti", 1, c)
  const banner = s.actors.find((a) => a.text)
  assert.strictEqual(banner.text, "Codex ✓")
  assert.strictEqual(banner.color, "#10a37f")
  assert.ok(s.particles.some((p) => p.color === "#10a37f"))
  const bare = E.state("confetti", 1, ctx).actors.find((a) => a.text)
  assert.strictEqual(bare.color, "#ffd65a", "falls back to a colour without vars")
})

test("chasers start and end at home", () => {
  const first = E.state("catdog", 0.01, ctx).actors, last = E.state("catdog", 20.9, ctx).actors
  const isle = { x: ctx.castaway.x, y: ctx.castaway.y - 40 }
  const at = (list, sprite) => list.find((a) => a.sprite === sprite)
  assert.ok(Math.abs(at(first, "catSit").x - (isle.x + 66)) < 2)
  assert.ok(Math.abs(at(last, "catSit").x - (isle.x + 66)) < 2)
  assert.ok(Math.abs(at(last, "dog").x - (isle.x - 78)) < 2)
})

test("clicks: the astronaut answers differently asleep and awake", () => {
  const awake = { scene: "idle" }, asleep = { scene: "sleep" }
  for (let k = 0; k < 20; k++) {
    const r = () => (k * 0.37) % 1
    assert.notStrictEqual(E.forEvent(r, "clickAstronaut", ctx, awake, []), "astroSnore")
    assert.strictEqual(E.forEvent(r, "clickAstronaut", ctx, asleep, []), "astroSnore")
  }
  for (const id of ["dogFetch", "catYarn"]) {
    const first = E.state(id, 0.01, ctx), last = E.state(id, E.get(id).island.hide[id === "dogFetch" ? "dog" : "cat"][1] - 0.01, ctx)
    const runner = (s) => s.actors.find((a) => a.sprite === (id === "dogFetch" ? "dog" : "catSit"))
    assert.ok(Math.abs(runner(first).x - runner(last).x) < 3, id + " returns home")
  }
})

test("art names are unique across packs and the core", () => {
  const core = Object.keys(E.buildArt(S))
  const seen = new Map()
  const coreOnly = new Set(["astronaut", "astronautWave", "cat", "catSit", "fish", "dog", "cow", "grassRock", "ufo0", "ufo1",
    "dogShip", "dogShipCrew", "pirate", "whale", "satellite", "shuttle", "rocket"])
  E.PACKS.forEach((pack, i) => {
    for (const name of Object.keys(pack.ART || {})) {
      assert.ok(!coreOnly.has(name), `pack ${i}: art ${name} hides a core sprite`)
      assert.ok(!seen.has(name), `art ${name} defined in packs ${seen.get(name)} and ${i}`)
      seen.set(name, i)
    }
  })
  assert.ok(core.length >= seen.size)
})

test("gaits: runners move their legs on the ground, not while riding or floating", () => {
  const names = (id, e) => E.state(id, e, ctx).actors.map((a) => a.sprite)
  const seen = new Set()
  for (let e = 0.8; e < 2.6; e += 0.05) for (const n of names("dogFetch", e)) seen.add(n)
  assert.ok(seen.has("dogRun0") && seen.has("dogRun1"), "the dog runs after the ball")
  assert.ok(names("dogFetch", 0.3).includes("dog"), "still before it starts")
  for (let e = 4; e < 36; e += 0.25) assert.ok(!names("dogfight", e).some((n) => /dogRun/.test(n)), "no running in the ship")
  for (const id of ["spaceFishing", "solarWash", "astroJetpack"])
    for (let e = 0; e < E.length(id); e += 0.1)
      assert.ok(!names(id, e).some((n) => /Walk/.test(n)), id + " walks in the air at " + e.toFixed(1))
  for (const g of Object.values(E.GAITS)) for (const f of g.frames) assert.ok(art[f], "no art for " + f)
})

test("looks: characters take their colours in episodes too", () => {
  const L = load(root + "/looks.js")
  const pal = L.palettes({ astronaut: { suit: "#ff0000" }, dog: { fur: "#00ff00" } })
  const custom = E.buildArt(S, pal)
  const px = (sp, ch) => { for (let i = 0; i < sp.data.length; i += 4) if (sp.data[i + 3] && sp.data[i] === ch[0] && sp.data[i + 1] === ch[1] && sp.data[i + 2] === ch[2]) return true; return false }
  assert.ok(px(custom.astronaut, [255, 0, 0]), "red suit")
  assert.ok(px(custom.dogRun0, [0, 255, 0]), "green dog runs green")
  assert.ok(!px(art.astronaut, [255, 0, 0]), "default suit untouched")
})

test("homes: palm episodes only on the island", () => {
  const now = { month: 11, hour: 12, night: false, cpu: 0.2, scene: "idle" }
  assert.strictEqual(E.eligible("coconut", ctx, { ...now, home: "island" }), true)
  assert.strictEqual(E.eligible("coconut", ctx, { ...now, home: "ship" }), false)
  assert.strictEqual(E.eligible("dogFetch", ctx, { ...now, home: "ship" }), false, "click episodes stay event-only")
  assert.strictEqual(E.eligible("catdog", ctx, { ...now, home: "planetoid" }), true)
})
