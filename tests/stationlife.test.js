const test = require("node:test")
const assert = require("node:assert")
const { load, root } = require("./load.js")

const SL = load(root + "/stationlife.js")
const L = load(root + "/looks.js")
const S = load(root + "/sprites.js")

test("every station model has a layout and is offered by looks.js", () => {
  assert.deepStrictEqual(SL.MODELS, L.STATIONS)
  for (const m of SL.MODELS) {
    const lay = SL.layout(m)
    assert.ok(lay.ports.length >= 1 && lay.eva.length >= 1 && lay.radius > 100)
  }
  assert.strictEqual(L.normalize({}).station, "classic")
  assert.strictEqual(L.normalize({ station: "torus" }).station, "torus")
  assert.strictEqual(L.normalize({ station: "deathstar" }).station, "classic")
  assert.strictEqual(SL.layout("nope"), SL.layout("classic"))
})

test("shuttles dock at a port and face where they go", () => {
  for (const m of SL.MODELS) {
    const ports = SL.layout(m).ports
    let docked = 0
    for (let t = 0; t < 200; t += 0.5) for (let i = 0; i < SL.SHUTTLES; i++) {
      const s = SL.shuttle(m, i, t)
      if (!s.visible) continue
      assert.ok(Number.isFinite(s.x) && Number.isFinite(s.y))
      if (s.mode === "docked") {
        docked++
        assert.ok(ports.some((p) => Math.hypot(s.x - p.x, s.y - p.y) < 45), `${m} docks near a port`)
      }
    }
    assert.ok(docked > 0, m)
  }
})

test("spacewalkers stay near their tether clip", () => {
  for (const m of SL.MODELS) for (let t = 0; t < 120; t += 0.7) for (let i = 0; i < SL.layout(m).eva.length; i++) {
    const e = SL.eva(m, i, t)
    assert.ok(Math.hypot(e.x - e.clipX, e.y - e.clipY) < 80)
  }
})

test("station sprites draw", () => {
  for (const s of [S.stationTorus(70), S.stationSpindle(210), S.stationSpire(), S.stationCitadel()])
    assert.ok(s.w > 50 && s.h > 8 && s.data.length === s.w * s.h * 4)
})
