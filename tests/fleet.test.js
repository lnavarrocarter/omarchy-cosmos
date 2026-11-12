// Run with: node --test tests/
const test = require("node:test")
const assert = require("node:assert")
const fs = require("node:fs")
const path = require("node:path")

const src = fs.readFileSync(path.join(__dirname, "..", "fleet.js"), "utf8").replace(/^\.pragma library\s*/, "")
const mod = { exports: {} }
new Function("module", src)(mod)
const F = mod.exports

const world = { width: 6480, height: 1080 }
const attractors = [
  { kind: "planet", x: 960, y: 560 },
  { kind: "castaway", x: 3240, y: 670 },
  { kind: "station", x: 5520, y: 432 },
]
const ctx = F.layout(world, attractors)
const wd = (d) => { d = ((d % world.width) + world.width) % world.width; return d > world.width / 2 ? d - world.width : d }
const fleet = (tasks, agents = {}, time = 1000) => ({ time, agents, hub: { tasks } })

test("pads sit at the station, one per agent", () => {
  assert.deepStrictEqual(Object.keys(ctx.pads), F.AGENTS)
  for (const a of F.AGENTS) assert.ok(Math.abs(ctx.pads[a].x - 5520) <= 660)
})

test("a running Hub task sends that engine's ship on a mission", () => {
  let ships = F.update({}, fleet([]), ctx, 0, 120)
  assert.strictEqual(ships.claude.mode, "docked")
  ships = F.update(ships, fleet([{ id: "t1", status: "running", engine: "claude" }]), ctx, 10, 120)
  assert.strictEqual(ships.claude.mode, "mission")
  assert.strictEqual(ships.codex.mode, "docked")
  // It starts where it was docked, then reaches the planet's orbit.
  const start = F.position(ships.claude, ctx, 10, 0)
  assert.ok(Math.abs(start.x - ctx.pads.claude.x) < 1)
  const orbit = F.position(ships.claude, ctx, 10 + F.TRANSIT + 30, 0)
  assert.ok(Math.hypot(wd(orbit.x - 960), (orbit.y - 560) / 0.6) < 340)
})

test("finishing returns home with cargo, failure with smoke", () => {
  let ships = F.update({}, fleet([{ id: "t1", status: "running", engine: "codex" }]), ctx, 0, 120)
  ships = F.update(ships, fleet([{ id: "t1", status: "completed", engine: "codex" }]), ctx, 40, 120)
  assert.strictEqual(ships.codex.mode, "inbound")
  assert.ok(F.position(ships.codex, ctx, 45, 1).cargo)
  ships = F.update(ships, fleet([]), ctx, 40 + F.INBOUND + 1, 120)
  assert.strictEqual(ships.codex.mode, "docked")

  let s2 = F.update({}, fleet([{ id: "t2", status: "running", engine: "copilot" }]), ctx, 0, 120)
  s2 = F.update(s2, fleet([{ id: "t2", status: "failed", engine: "copilot" }]), ctx, 20, 120)
  assert.ok(F.position(s2.copilot, ctx, 22, 2).smoke)
})

test("transitions start from the ship's current position (no jumps)", () => {
  let ships = F.update({}, fleet([{ id: "t1", status: "running", engine: "local" }]), ctx, 0, 120)
  const before = F.position(ships.local, ctx, 30, 3)
  ships = F.update(ships, fleet([{ id: "t1", status: "completed", engine: "local" }]), ctx, 30, 120)
  const after = F.position(ships.local, ctx, 30, 3)
  assert.ok(Math.hypot(before.x - after.x, before.y - after.y) < 1)
})

test("needs_input hovers with a beacon; queued warms up on the pad", () => {
  const ships = F.update({}, fleet([
    { id: "a", status: "needs_input", engine: "claude" },
    { id: "b", status: "queued", engine: "codex" },
  ]), ctx, 0, 120)
  assert.strictEqual(ships.claude.mode, "waiting")
  assert.ok(F.position(ships.claude, ctx, 30, 0).beacon)
  assert.strictEqual(ships.codex.mode, "warmup")
})

test("recent CLI activity means patrol, otherwise docked", () => {
  const ships = F.update({}, fleet([], { claude: { last_activity: 990 }, codex: { last_activity: 100 } }, 1000), ctx, 0, 120)
  assert.strictEqual(ships.claude.mode, "patrol")
  assert.strictEqual(ships.codex.mode, "docked")
})

test("scouts launch once per new prompt and expire", () => {
  let r = F.scouts([], [{ agent: "claude", at: 50, tokens: 10 }, { agent: "codex", at: 60 }], 55, 0)
  assert.strictEqual(r.list.length, 1)
  assert.strictEqual(r.lastSeen, 60)
  r = F.scouts(r.list, [{ agent: "codex", at: 60 }], r.lastSeen, 1)
  assert.strictEqual(r.list.length, 1)
  assert.ok(F.scoutPosition(r.list[0], ctx, 5))
  r = F.scouts(r.list, [], r.lastSeen, 30)
  assert.strictEqual(r.list.length, 0)
})

test("fuel drains with tokens; local runs on solar", () => {
  assert.strictEqual(F.fuel("claude", 0, { claude: 100 }), 1)
  assert.strictEqual(F.fuel("claude", 25, { claude: 100 }), 0.75)
  assert.strictEqual(F.fuel("claude", 500, { claude: 100 }), 0)
  assert.strictEqual(F.fuel("local", 1e9, { local: 1 }), 1)
  assert.strictEqual(F.shortNumber(3416013), "3.4M")
})

test("a mission orbits the moon of its workspace, following it", () => {
  const moon = { x: 1400, y: 300 }
  const c = Object.assign({}, ctx, { moons: { hub: moon } })
  const ships = F.update({}, fleet([{ id: "m", status: "running", engine: "codex", workspace: "hub" }]), c, 0, 120)
  assert.strictEqual(ships.codex.workspace, "hub")
  let p = F.position(ships.codex, c, F.TRANSIT + 20, 1)
  assert.ok(Math.hypot(wd(p.x - moon.x), (p.y - moon.y) / 0.8) < 90)
  moon.x = 1500
  p = F.position(ships.codex, c, F.TRANSIT + 21, 1)
  assert.ok(Math.hypot(wd(p.x - moon.x), (p.y - moon.y) / 0.8) < 90)
  // Unknown workspace falls back to the planet.
  const s2 = F.update({}, fleet([{ id: "n", status: "running", engine: "claude", workspace: "nope" }]), c, 0, 120)
  p = F.position(s2.claude, c, F.TRANSIT + 20, 0)
  assert.ok(Math.hypot(wd(p.x - 960), (p.y - 560) / 0.6) < 340)
})

test("a quick task still reaches orbit before heading home", () => {
  let ships = F.update({}, fleet([{ id: "q", status: "running", engine: "local" }]), ctx, 0, 120)
  ships = F.update(ships, fleet([{ id: "q", status: "completed", engine: "local" }]), ctx, 5, 120)
  assert.strictEqual(ships.local.mode, "mission")
  ships = F.update(ships, fleet([{ id: "q", status: "completed", engine: "local" }]), ctx, F.MIN_MISSION + 1, 120)
  assert.strictEqual(ships.local.mode, "inbound")
  assert.strictEqual(ships.local.result, "completed")
})

test("a task that finished between probes flies a sortie once", () => {
  const done = { id: "s", status: "failed", engine: "codex", recent: true, workspace: "hub" }
  let ships = F.update({}, fleet([done]), ctx, 0, 120)
  assert.strictEqual(ships.codex.mode, "mission")
  assert.strictEqual(ships.codex.workspace, "hub")
  ships = F.update(ships, fleet([Object.assign({}, done, { recent: false })]), ctx, 10, 120)
  assert.strictEqual(ships.codex.mode, "mission")
  ships = F.update(ships, fleet([Object.assign({}, done, { recent: false })]), ctx, 20, 120)
  assert.strictEqual(ships.codex.mode, "inbound")
  assert.ok(F.position(ships.codex, ctx, 22, 1).smoke)
  ships = F.update(ships, fleet([]), ctx, 20 + F.INBOUND + 1, 120)
  assert.strictEqual(ships.codex.mode, "docked")
  // Finished tasks without the recent flag are history: no sortie.
  const s2 = F.update({}, fleet([{ id: "old", status: "completed", engine: "claude" }]), ctx, 0, 120)
  assert.strictEqual(s2.claude.mode, "docked")
})

test("an open CLI turn keeps the ship on patrol through long tool calls", () => {
  const ships = F.update({}, fleet([], { codex: { last_activity: 100, busy: true }, local: { busy: false } }, 1000), ctx, 0, 120)
  assert.strictEqual(ships.codex.mode, "patrol")
  assert.strictEqual(ships.local.mode, "docked")
})

test("plan limits size the fuel when the agent reports them", () => {
  assert.strictEqual(F.fuel("codex", { tokens_today: 2.5e6, limit_used: 51 }, { codex: 3e6 }), 0.49)
  assert.ok(Math.abs(F.fuel("codex", { tokens_today: 1.5e6 }, { codex: 3e6 }) - 0.5) < 1e-9)
  assert.strictEqual(F.fuel("local", { tokens_today: 5000, limit_used: 99 }, {}), 1)
})
