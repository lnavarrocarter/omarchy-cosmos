import QtQuick
import "stationlife.js" as Life

// The orbital station, in the model chosen in the Studio (look.station):
// "classic", a small wheel and a habitat module whose windows show the crew
// walking about; "torus", a big turning habitat ring on a docking spindle;
// "spire", a tower with decks, solar wings and a hangar; "citadel", a
// hexagonal core with pods and a docking ring. Around every model, shuttles
// come and go from its ports, crew work outside on tethers and beacons
// blink (stationlife.js).
Item {
  id: root

  property var sim: null
  property var anchor: null
  property var viewRef: null

  readonly property real t: { sim.frame; return sim.t }
  readonly property real cx: anchor && viewRef ? viewRef.localX(anchor.x) : 0
  readonly property real cy: anchor ? anchor.y : 0
  readonly property string model: sim ? sim.look.station : "classic"
  readonly property var lay: Life.layout(model)


  Item {
    id: classic
    visible: root.model === "classic"
    // Truss between the wheel and the habitat.
    Rectangle {
      x: root.cx; y: root.cy - 5
      width: 150; height: 10
      color: "#4b5170"
      Repeater {
        model: 10
        Rectangle { required property int index; x: index * 15; y: 0; width: 3; height: 10; color: "#2d2f45" }
      }
    }

    // The busier the GPU, the brighter the station glows.
    Rectangle {
      readonly property real r: 170
      x: root.cx - r; y: root.cy - r
      width: r * 2; height: r * 2; radius: r
      color: "#58c8ff"
      opacity: { root.sim.frame; return 0.03 + root.sim.gpu * 0.16 }
    }

    PixelSprite {
      sprite: root.sim.sprites.wheel || null
      px: 3
      x: root.cx - width / 2
      y: root.cy - height / 2
      rotation: root.sim.wheelAngle
    }

    Item {
      id: hab
      x: root.cx + 140; y: root.cy - 32
      width: 176; height: 64

      PixelSprite { sprite: root.sim.sprites.habitat || null; px: 4 }

      // Crew walking past the windows (window strip is rows 4-8 at 4px).
      Item {
        x: 12; y: 16; width: 152; height: 20
        clip: true
        Repeater {
          model: [
            { c: "#ffd65a", s: 0.21, ph: 0.0 },
            { c: "#ff8fa8", s: 0.13, ph: 2.1 },
            { c: "#7df9ff", s: 0.17, ph: 4.0 },
            { c: "#f2a541", s: 0.09, ph: 1.0 }
          ]
          Item {
            required property var modelData
            required property int index
            readonly property real walk: Math.sin(root.t * modelData.s * 2 + modelData.ph)
            x: (walk + 1) / 2 * 140
            y: index === 3 ? 6 : 4
            width: 6; height: 16
            // The fourth "crew member" is the station cat.
            Rectangle { visible: index !== 3; x: 1; y: 0; width: 4; height: 4; color: "#f0d0b0" }
            Rectangle { visible: index !== 3; x: 0; y: 4; width: 6; height: 8; color: modelData.c }
            Rectangle { visible: index !== 3; x: 1; y: 12; width: 4; height: 4; color: "#2d2f45" }
            Rectangle { visible: index === 3; x: 0; y: 8; width: 8; height: 5; color: modelData.c }
            Rectangle { visible: index === 3; x: 6; y: 5; width: 4; height: 4; color: modelData.c }
          }
        }
      }

      // Episodes can light the windows: a party (cycling colours) or an alarm.
      Repeater {
        model: 8
        Rectangle {
          required property int index
          readonly property string mode: { root.sim.frame; var st = root.sim.episodeState; return st && st.effects ? st.effects.lights : "" }
          readonly property var party: ["#ff8fa8", "#ffd65a", "#7df9ff", "#9d7dff", "#5dff9d"]
          visible: mode !== ""
          x: 12 + index * 19; y: 16; width: 19; height: 20
          color: mode === "alarm" ? "#ff3b3b" : party[(index + Math.floor(root.t * 4)) % party.length]
          opacity: mode === "alarm" ? (Math.floor(root.t * 2.5) % 2 === 0 ? 0.55 : 0.12) : 0.45
        }
      }

      // Running lights.
      Rectangle {
        x: hab.width - 6; y: -6; width: 6; height: 6; radius: 3
        color: "#ff4d4d"
        opacity: Math.floor(root.t * 1.2) % 2 === 0 ? 1 : 0.15
      }
      Rectangle {
        x: 0; y: hab.height; width: 6; height: 6; radius: 3
        color: "#5dff9d"
        opacity: Math.floor(root.t * 1.2 + 0.5) % 2 === 0 ? 1 : 0.15
      }
    }

    // Docking collar at the end of the habitat.
    Rectangle {
      x: hab.x + hab.width; y: root.cy - 10
      width: 20; height: 20
      color: "#6b7290"
      border.color: "#2d2f45"; border.width: 3
    }
  }

  // ------------------------------------------------ the bigger models
  Rectangle {
    visible: root.model !== "classic"
    readonly property real r: 260
    x: root.cx - r; y: root.cy - r
    width: r * 2; height: r * 2; radius: r
    color: "#58c8ff"
    opacity: { root.sim.frame; return 0.025 + root.sim.gpu * 0.12 }
  }
  PixelSprite {
    visible: root.model === "torus"
    sprite: root.sim.sprites.stationSpindle || null
    px: 3
    x: root.cx - width / 2; y: root.cy - height / 2
  }
  PixelSprite {
    visible: root.model !== "classic"
    sprite: root.sim.sprites.stationBody || null
    px: root.lay.px || 3
    x: root.cx - width / 2; y: root.cy - height / 2
    // The torus turns faster when the GPU is busy, like the classic wheel.
    rotation: root.model === "torus" ? root.sim.wheelAngle * 0.35 : root.t * root.lay.spin * 360
  }

  // ------------------------------------------------ life around it
  Repeater {
    model: root.lay.beacons.length
    Item {
      required property int index
      readonly property var b: { root.t; return Life.beacon(root.model, index, root.t) }
      visible: b.visible && b.on
      Rectangle { x: root.cx + parent.b.x - 12; y: root.cy + parent.b.y - 12; width: 24; height: 24; radius: 12
        color: parent.b.color || "#ffffff"; opacity: 0.3 }
      Rectangle { x: root.cx + parent.b.x - 3; y: root.cy + parent.b.y - 3; width: 6; height: 6
        color: parent.b.color || "#ffffff" }
    }
  }

  // Spacewalkers on tethers; the first one welds.
  Repeater {
    model: root.lay.eva.length
    Item {
      id: walker
      required property int index
      readonly property var e: { root.t; return Life.eva(root.model, index, root.t) }
      readonly property real ax: root.cx + e.clipX
      readonly property real ay: root.cy + e.clipY
      readonly property real bx: root.cx + e.x
      readonly property real by: root.cy + e.y + 10
      Rectangle {
        x: walker.ax; y: walker.ay - 1
        width: Math.hypot(walker.bx - walker.ax, walker.by - walker.ay); height: 2
        transformOrigin: Item.Left
        rotation: Math.atan2(walker.by - walker.ay, walker.bx - walker.ax) * 180 / Math.PI
        color: "#c8cddc"; opacity: 0.7
      }
      PixelSprite {
        sprite: root.sim.sprites.astronaut || null
        px: 3
        x: root.cx + walker.e.x - width / 2; y: root.cy + walker.e.y - height / 2
        rotation: walker.e.rot * 180 / Math.PI
      }
      Item {
        visible: walker.e.welding
        Rectangle { x: walker.ax - 9; y: walker.ay - 9; width: 18; height: 18; radius: 9; color: "#7df9ff"
          opacity: walker.e.spark ? 0.8 : 0.35 }
        Repeater {
          model: 6
          Rectangle {
            required property int index
            readonly property real a: index * 1.05 + root.t * 7
            readonly property real d: 6 + ((root.t * 40 + index * 9) % 22)
            x: walker.ax + Math.cos(a) * d; y: walker.ay + Math.sin(a) * d
            width: 3; height: 3; color: "#ffd65a"
          }
        }
      }
    }
  }

  // Shuttles: in, a stay at a port, and out again.
  Repeater {
    model: Life.SHUTTLES
    Item {
      id: ferry
      required property int index
      readonly property var s: { root.t; return Life.shuttle(root.model, index, root.t) }
      visible: s.visible
      Rectangle {
        visible: ferry.s.flame
        x: root.cx + ferry.s.x + (ferry.s.mirrored ? -30 : 30) - 9; y: root.cy + ferry.s.y - 9
        width: 18; height: 18; radius: 9
        color: "#ff9447"; opacity: 0.5 + 0.3 * Math.sin(root.t * 20 + ferry.index)
      }
      PixelSprite {
        sprite: root.sim.sprites.shuttle || null
        px: 3
        mirrored: ferry.s.mirrored
        x: root.cx + ferry.s.x - width / 2; y: root.cy + ferry.s.y - height / 2
      }
    }
  }
}
