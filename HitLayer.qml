import QtQuick
import "looks.js" as Looks
import "fleet.js" as Fleet

// Clickable, hoverable spots over the scene, in this screen's coordinates:
// hangars 0-3, billboard 4, ships 5-8, moons 9-16, the castaway island 17,
// and on it the dog 18, the cat 19 and the astronaut 20, then drifting rocks
// 21-28 you can drag and throw (declared last, so on top).
Item {
  id: layer

  property var sim: null
  property var view: null
  property var strings: null

  property int hoverSlot: -1

  function hitItem(i) { return [h0, h1, h2, h3, h4, h5, h6, h7, h8, h9, h10, h11, h12, h13, h14, h15, h16, h17, h18, h19, h20,
    h21, h22, h23, h24, h25, h26, h27, h28][i] || null }

  function setHover(slot, on) {
    if (on) hoverSlot = slot
    else if (hoverSlot === slot) hoverSlot = -1
  }

  readonly property var none: ({ x: 0, y: 0, w: 0, h: 0, target: "", title: "", lines: [] })

  // World rect -> this screen, or nothing when it is not on this screen.
  function place(wx, wy, w, h, extra) {
    var sx = view.localX(wx + w / 2) - w / 2 - view.offX
    var sy = wy - view.offY
    if (sx + w < 0 || sx > view.width || sy + h < 0 || sy > view.height) return none
    var out = { x: Math.round(sx), y: Math.round(sy), w: w, h: h }
    for (var k in extra) out[k] = extra[k]
    return out
  }

  function modeText(ship) {
    var mode = ship ? ship.mode : "docked"
    return strings.t("mode." + mode)
  }

  function agentLines(agent) {
    var info = sim.fleetData && sim.fleetData.agents ? (sim.fleetData.agents[agent] || {}) : {}
    var ship = sim.ships[agent]
    var lines = [modeText(ship)]
    if (ship && ship.mode === "mission" && ship.workspace) lines.push(strings.t("mission.target").arg(ship.workspace))
    lines.push(strings.t("tokens.short").arg(Fleet.shortNumber(info.tokens_today || 0)))
    lines.push(strings.tn("prompts", info.prompts_today || 0).arg(info.prompts_today || 0))
    lines.push(agent === "local" ? strings.t("fuel.solar")
      : strings.t("fuel").arg(Math.round(Fleet.fuel(agent, info.tokens_today || 0, sim.cfg.budgets) * 100)))
    if (sim.canOpen("local.coordination")) lines.push(strings.t("open.coordination"))
    return lines
  }

  // Screen point (in this layer) -> world, for dragging rocks.
  // The held rock keeps the slot it was grabbed in: if the slots were
  // reshuffled, the box under the pointer would jump away for a frame, the
  // compositor would see the pointer leave the input region, and the press
  // would end right there.
  property int heldSlot: -1
  function grabAt(id, sx, sy, slot) {
    heldSlot = slot === undefined ? -1 : slot
    return sim.grabRock(id, sx + view.offX, sy + view.offY)
  }
  function dragAt(sx, sy) { sim.dragRock(sx + view.offX, sy + view.offY) }
  function release() { heldSlot = -1; sim.throwRock() }

  // The rocks on this screen, one per slot (0..7); the held one stays put.
  function rockFor(k) {
    var held = sim.heldRock ? sim.rockById(sim.heldRock.id) : null
    var keep = held && heldSlot >= 21 ? heldSlot - 21 : -1
    if (held && (k === keep || keep < 0 && k === 0)) return held
    if (held && keep < 0) k--
    var n = 0
    for (var i = 0; i < sim.bodies.length; i++) {
      var b = sim.bodies[i]
      if (b.kind !== "rock" || !b.active || b === held) continue
      var sx = view.localX(b.x) - view.offX
      if (sx < -40 || sx > view.width + 40 || b.y < -40 || b.y > view.height + view.offY + 40) continue
      if (n === keep) n++
      if (n++ === k) return b
    }
    return null
  }

  function geomFor(slot) {
    var ctx = sim.fleetCtx
    if (!ctx || !view || !strings) return none
    var agent, pad
    if (slot < 4) {
      if (!sim.fleetData || !sim.cfg.fleet) return none
      agent = Fleet.AGENTS[slot]
      pad = ctx.pads[agent]
      return place(pad.x - 120, pad.y - 80, 210, 135,
        { target: "local.coordination", title: Fleet.LABELS[agent], lines: agentLines(agent) })
    }
    if (slot === 4) {
      if (!sim.fleetData || !sim.cfg.fleet) return none
      return place(ctx.base.x - 150, ctx.H * 0.66, 300, 64,
        { target: "local.coordination", title: "Hub",
          lines: [strings.t(sim.fleetData.hub && sim.fleetData.hub.online ? "hub.online" : "hub.offline")]
            .concat(sim.canOpen("local.coordination") ? [strings.t("open.coordination")] : []) })
    }
    if (slot < 9) {
      if (!sim.fleetData || !sim.cfg.fleet) return none
      agent = Fleet.AGENTS[slot - 5]
      var ship = sim.ships[agent]
      if (!ship || ship.mode === "docked" || ship.mode === "warmup") return none
      var p = Fleet.position(ship, ctx, sim.t, slot - 5)
      return place(p.x - 40, p.y - 25, 80, 50,
        { target: "local.coordination", title: Fleet.LABELS[agent], lines: agentLines(agent) })
    }
    if (slot >= 21 && slot <= 28) {
      if (!sim.cfg.throwRocks) return none
      var rock = rockFor(slot - 21)
      if (!rock) return none
      // While held, a big box, so a quick drag never slips off it.
      var size = sim.heldRock && sim.heldRock.id === rock.id ? 360 : Math.round(rock.r * 2.6)
      return place(rock.x - size / 2, rock.y - size / 2, size, size, {
        grab: true, bodyId: rock.id, target: "", title: strings.t("rock.title"), lines: [strings.t("rock.drag")]
      })
    }
    if (slot >= 18 && slot <= 20) {
      // The island's characters, each with its own click episodes. Boxes are
      // offsets from the middle of the sand, like Castaway.qml draws them.
      if (!sim.cfg.episodes) return none
      var home = null
      for (var h = 0; h < sim.attractors.length; h++) if (sim.attractors[h].kind === "castaway") home = sim.attractors[h]
      // A small companion home plays no episodes, so it takes no clicks.
      if (!home || home.scale < 1) return none
      var who = ["dog", "cat", "astronaut"][slot - 18]
      if (sim.islandHidden(who)) return none
      var ground = home.y - 40 + Math.round(Math.sin(sim.t * 0.5) * 3) * 2
      var box = who === "dog" ? [-100, -38, 44, 42] : who === "cat" ? [48, -38, 36, 42]
        : sim.scene === "sleep" ? [0, -30, 64, 40] : [-42, -60, 48, 64]
      // On a round home they stand lower, on the curve (looks.js ground).
      var lift = Looks.ground(sim.look.home, 192 + box[0] + box[2] / 2).dy
      return place(home.x + box[0], ground + box[1] + lift, box[2], box[3], {
        target: "click:" + who, title: strings.t(who + ".title"),
        lines: [strings.t(sim.episode ? "island.busy" : who + ".click")]
      })
    }
    if (slot === 17) {
      // The island: a click makes something happen (an episode).
      if (!sim.cfg.episodes) return none
      var isle = null
      for (var a = 0; a < sim.attractors.length; a++) if (sim.attractors[a].kind === "castaway") isle = sim.attractors[a]
      if (!isle || isle.scale < 1) return none
      return place(isle.x - 190, isle.y - 130, 380, 170, {
        target: "episode", title: strings.t("island.title"),
        lines: [strings.t(sim.episode ? "island.busy" : "island.click")]
      })
    }
    var k = slot - 9, n = 0
    for (var i = 0; i < sim.bodies.length; i++) {
      var b = sim.bodies[i]
      if (b.kind !== "moon" || !b.label) continue
      if (n++ !== k) continue
      var project = b.moonKind === "project"
      return place(b.x - 28, b.y - 28, 56, 56, {
        target: project ? "local.workbench" : "local.coordination",
        title: b.label,
        lines: [strings.t(project ? "moon.project" : "moon.workspace")]
          .concat(sim.canOpen(project ? "local.workbench" : "local.coordination")
            ? [strings.t(project ? "open.workbench" : "open.coordination")] : [])
      })
    }
    return none
  }

  HitBox { id: h0; slot: 0; host: layer }
  HitBox { id: h1; slot: 1; host: layer }
  HitBox { id: h2; slot: 2; host: layer }
  HitBox { id: h3; slot: 3; host: layer }
  HitBox { id: h4; slot: 4; host: layer }
  HitBox { id: h5; slot: 5; host: layer }
  HitBox { id: h6; slot: 6; host: layer }
  HitBox { id: h7; slot: 7; host: layer }
  HitBox { id: h8; slot: 8; host: layer }
  HitBox { id: h9; slot: 9; host: layer }
  HitBox { id: h10; slot: 10; host: layer }
  HitBox { id: h11; slot: 11; host: layer }
  HitBox { id: h12; slot: 12; host: layer }
  HitBox { id: h13; slot: 13; host: layer }
  HitBox { id: h14; slot: 14; host: layer }
  HitBox { id: h15; slot: 15; host: layer }
  HitBox { id: h16; slot: 16; host: layer }
  HitBox { id: h17; slot: 17; host: layer }
  HitBox { id: h18; slot: 18; host: layer }
  HitBox { id: h19; slot: 19; host: layer }
  HitBox { id: h20; slot: 20; host: layer }
  HitBox { id: h21; slot: 21; host: layer }
  HitBox { id: h22; slot: 22; host: layer }
  HitBox { id: h23; slot: 23; host: layer }
  HitBox { id: h24; slot: 24; host: layer }
  HitBox { id: h25; slot: 25; host: layer }
  HitBox { id: h26; slot: 26; host: layer }
  HitBox { id: h27; slot: 27; host: layer }
  HitBox { id: h28; slot: 28; host: layer }

  // Tooltip for whatever the pointer is over.
  Rectangle {
    id: tip
    readonly property var g: { layer.sim.frame; return layer.hoverSlot >= 0 ? layer.geomFor(layer.hoverSlot) : layer.none }
    visible: layer.hoverSlot >= 0 && g.w > 0 && !layer.sim.heldRock
    width: Math.max(titleText.implicitWidth, linesCol.implicitWidth) + 20
    height: titleText.implicitHeight + linesCol.implicitHeight + 18
    x: Math.max(4, Math.min(layer.width - width - 4, g.x + g.w / 2 - width / 2))
    y: g.y - height - 10 < 4 ? g.y + g.h + 10 : g.y - height - 10
    color: Qt.rgba(0.04, 0.05, 0.12, 0.92)
    border.color: "#58c8ff"; border.width: 2
    radius: 4

    Text {
      id: titleText
      x: 10; y: 6
      textFormat: Text.PlainText
      font.family: "monospace"; font.bold: true; font.pixelSize: 13
      color: "#ffd65a"
      text: tip.g.title || ""
    }
    Column {
      id: linesCol
      x: 10; y: titleText.y + titleText.implicitHeight + 3
      Repeater {
        model: tip.g.lines || []
        Text {
          required property var modelData
          textFormat: Text.PlainText
          font.family: "monospace"; font.pixelSize: 12
          color: "#dfe8ff"
          text: String(modelData)
        }
      }
    }
  }
}
