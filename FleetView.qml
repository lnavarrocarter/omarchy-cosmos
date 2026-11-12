import QtQuick
import "fleet.js" as Fleet

// The agent fleet in world coordinates: hangar pads with fuel tanks under
// the station, one ship per agent, prompt scouts, and a status billboard.
Item {
  id: root

  property var sim: null
  property var viewRef: null
  property var strings: null

  readonly property real t: { sim.frame; return sim.t }
  readonly property var ctx: { sim.layoutVersion; sim.fleetVersion; return sim.fleetCtx }
  readonly property var fleet: { sim.fleetVersion; return sim.fleetData }
  readonly property bool ready: !!ctx && !!fleet && !!sim.sprites.ships

  function color(agent) { return sim.agentColors[agent] || Fleet.COLORS[agent] || "#ffffff" }
  function info(agent) { return fleet && fleet.agents && fleet.agents[agent] ? fleet.agents[agent] : { tokens_today: 0, prompts_today: 0 } }
  function totalTokens() {
    var sum = 0
    for (var i = 0; i < Fleet.AGENTS.length; i++) sum += info(Fleet.AGENTS[i]).tokens_today || 0
    return sum
  }

  visible: ready && sim.cfg.fleet

  // ---------------------------------------------------------------- billboard

  Item {
    visible: root.ready
    x: root.ready ? root.viewRef.localX(root.ctx.base.x) - 150 : 0
    y: root.ready ? root.ctx.H * 0.66 : 0
    width: 300; height: 64

    Rectangle {
      anchors.fill: parent
      color: Qt.rgba(0.05, 0.06, 0.14, 0.75)
      border.color: "#2d2f45"; border.width: 3
    }
    Rectangle {
      readonly property bool online: root.fleet && root.fleet.hub && root.fleet.hub.online
      x: 12; y: 17; width: 12; height: 12; radius: 6
      color: online ? "#5dff9d" : "#ff4d4d"
      opacity: online ? 1 : (Math.floor(root.t * 2) % 2 ? 1 : 0.3)
    }
    Text {
      x: 32; y: 6
      textFormat: Text.PlainText
      font.family: "monospace"; font.bold: true; font.pixelSize: 13
      color: "#dfe8ff"
      text: root.strings ? root.strings.t(root.fleet && root.fleet.hub && root.fleet.hub.online ? "hub.online" : "hub.offline") : ""
    }
    Text {
      x: 32; y: 24
      textFormat: Text.PlainText
      font.family: "monospace"; font.pixelSize: 12
      color: "#ffd65a"
      text: root.strings ? root.strings.t("tokens.today").arg(Fleet.shortNumber(root.totalTokens())) : ""
    }
    Text {
      readonly property var w: root.sim.weather
      visible: !!w && root.sim.cfg.weather
      x: 32; y: 42
      textFormat: Text.PlainText
      font.family: "monospace"; font.pixelSize: 11
      color: "#7dffb0"
      text: w && root.strings ? root.strings.t("weather.line").arg(w.cpu).arg(w.ram).arg(w.gpu < 0 ? "-" : w.gpu) : ""
    }
  }

  // ---------------------------------------------------------------- hangars

  Repeater {
    model: Fleet.AGENTS

    Item {
      id: hangar
      required property string modelData
      required property int index
      readonly property string agent: modelData
      readonly property var pad: root.ready ? root.ctx.pads[agent] : { x: 0, y: 0 }
      readonly property var stats: root.info(agent)
      readonly property real fuel: Fleet.fuel(agent, stats, root.sim.cfg.budgets)
      readonly property var ship: root.sim.ships[agent] || null
      readonly property bool warming: !!ship && ship.mode === "warmup"

      x: root.ready ? root.viewRef.localX(pad.x) : 0
      y: pad.y

      // Landing pad.
      Rectangle { x: -78; y: 0; width: 156; height: 12; color: "#4b5170"; border.color: "#2d2f45"; border.width: 2 }
      Rectangle { x: -74; y: 2; width: 148; height: 3; color: root.color(hangar.agent) }
      Rectangle { x: -60; y: 12; width: 8; height: 26; color: "#2d2f45" }
      Rectangle { x: 52; y: 12; width: 8; height: 26; color: "#2d2f45" }
      Repeater {
        model: 5
        Rectangle {
          required property int index
          x: -70 + index * 34; y: -4; width: 6; height: 4
          color: hangar.warming ? "#ffd65a" : "#5dff9d"
          opacity: hangar.warming ? (Math.floor(root.t * 4 + index) % 2 ? 1 : 0.2)
                                  : (Math.floor(root.t * 0.8 + index * 0.2) % 5 === index ? 1 : 0.25)
        }
      }

      // Fuel tank: the plan limit (Codex) or today's tokens drain it; Qwen runs on solar.
      Item {
        x: -112; y: -64
        width: 20; height: 76
        Rectangle { anchors.fill: parent; color: "#14182c"; border.color: "#6b7290"; border.width: 2 }
        Rectangle {
          readonly property color level: hangar.agent === "local" ? "#ffd65a"
            : hangar.fuel > 0.5 ? "#5dff9d" : hangar.fuel > 0.2 ? "#ffd65a" : "#ff4d4d"
          x: 4; width: 12
          height: Math.round((parent.height - 8) * hangar.fuel)
          y: parent.height - 4 - height
          color: level
          opacity: hangar.agent !== "local" && hangar.fuel < 0.15 ? (Math.floor(root.t * 2) % 2 ? 1 : 0.35) : 0.9
        }
        Repeater {
          model: 3
          Rectangle { required property int index; x: 2; y: 18 + index * 18; width: 6; height: 2; color: "#6b7290" }
        }
      }

      Text {
        x: -78; y: 18
        width: 156
        horizontalAlignment: Text.AlignHCenter
        textFormat: Text.PlainText
        font.family: "monospace"; font.bold: true; font.pixelSize: 13
        color: root.color(hangar.agent)
        text: Fleet.LABELS[hangar.agent] || hangar.agent
      }
      Text {
        x: -78; y: 34
        width: 156
        horizontalAlignment: Text.AlignHCenter
        textFormat: Text.PlainText
        font.family: "monospace"; font.pixelSize: 11
        color: "#a3a9c2"
        text: !root.strings ? "" : hangar.agent === "local" && !(hangar.stats.tokens_today > 0)
          ? root.strings.t("solar")
          : root.strings.t("usage.line").arg(Fleet.shortNumber(hangar.stats.tokens_today || 0)).arg(hangar.stats.prompts_today || 0)
      }
    }
  }

  // ---------------------------------------------------------------- ships

  Repeater {
    model: Fleet.AGENTS

    Item {
      id: craft
      required property string modelData
      required property int index
      readonly property string agent: modelData
      readonly property var ship: root.sim.ships[agent] || { agent: agent, mode: "docked", since: 0 }
      readonly property var pos: {
        root.sim.frame
        return root.ready ? Fleet.position(ship, root.ctx, root.t, index) : { x: 0, y: 0, dir: -1, flame: 0 }
      }
      readonly property var art: root.sim.sprites.ships ? root.sim.sprites.ships[agent] : null
      readonly property real sx: root.ready ? root.viewRef.localX(pos.x) : 0

      // Smoke trail when a task failed.
      Repeater {
        model: craft.pos.smoke ? 6 : 0
        Rectangle {
          required property int index
          readonly property real age: ((root.t * 1.5 + index / 6) % 1)
          width: 8 + age * 18; height: width; radius: width / 2
          x: craft.sx - craft.pos.dir * (30 + age * 70) - width / 2
          y: craft.pos.y - 6 - age * 20 - height / 2
          color: "#6b6f80"
          opacity: 0.55 * (1 - age)
        }
      }

      // Engine flame behind the ship.
      Rectangle {
        visible: craft.pos.flame > 0
        readonly property real len: (8 + 10 * craft.pos.flame) * (0.75 + 0.25 * Math.sin(root.t * 31 + craft.index))
        width: len; height: 6
        x: craft.pos.dir < 0 ? craft.sx + sprite.width / 2 - 2 : craft.sx - sprite.width / 2 - len + 2
        y: craft.pos.y - 3
        color: "#ffd65a"
        Rectangle {
          width: parent.width * 0.55; height: 4
          x: craft.pos.dir < 0 ? 0 : parent.width - width; y: 1
          color: "#ffffff"
        }
      }

      PixelSprite {
        id: sprite
        sprite: craft.art
        px: 4
        mirrored: craft.pos.dir > 0
        x: craft.sx - width / 2
        y: craft.pos.y - height / 2
      }

      PixelSprite {
        visible: !!craft.pos.cargo
        sprite: root.sim.sprites.crate || null
        px: 3
        x: craft.sx - width / 2
        y: craft.pos.y + sprite.height / 2 - 2
      }

      // Beacon while a task waits for the user's answer.
      Rectangle {
        visible: !!craft.pos.beacon
        x: craft.sx - 4; y: craft.pos.y - sprite.height / 2 - 14
        width: 8; height: 8; radius: 4
        color: "#ff4d4d"
        opacity: Math.floor(root.t * 2.5) % 2 ? 1 : 0.2
      }
      Text {
        visible: !!craft.pos.beacon
        x: craft.sx + 8; y: craft.pos.y - sprite.height / 2 - 30
        textFormat: Text.PlainText
        font.family: "monospace"; font.bold: true; font.pixelSize: 22
        color: "#ffd65a"
        text: "?"
      }
    }
  }

  // ---------------------------------------------------------------- scouts

  Repeater {
    model: { root.sim.fleetVersion; return root.sim.scoutList.length }

    Item {
      id: scout
      required property int index
      readonly property var s: root.sim.scoutList[index] || null
      readonly property var pos: { root.sim.frame; return s && root.ready ? Fleet.scoutPosition(s, root.ctx, root.t) : null }
      readonly property real sx: pos ? root.viewRef.localX(pos.x) : 0
      visible: !!pos
      opacity: pos ? pos.opacity : 0

      Rectangle {
        x: scout.sx + 10; y: scout.pos ? scout.pos.y - 1 : 0
        width: 140; height: 3
        gradient: Gradient {
          orientation: Gradient.Horizontal
          GradientStop { position: 0; color: scout.s ? root.color(scout.s.agent) : "white" }
          GradientStop { position: 1; color: "transparent" }
        }
      }
      PixelSprite {
        sprite: scout.s && root.sim.sprites.ships ? root.sim.sprites.ships[scout.s.agent] : null
        px: 2
        x: scout.sx - width / 2
        y: scout.pos ? scout.pos.y - height / 2 : 0
      }
    }
  }
}
