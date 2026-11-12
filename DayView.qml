import QtQuick
import "daycycle.js" as Day

// The sun by day, the moon (in its real phase) by night, crossing the whole
// panorama from the first screen to the last as the hours go by.
Item {
  id: root

  property var sim: null
  property var viewRef: null

  readonly property var body: { sim.clockVersion; return sim.skyBody }
  readonly property bool isSun: body && body.kind === "sun"
  readonly property real wx: body ? body.x * sim.world.width : 0
  readonly property real wy: body ? body.y * sim.world.height : 0
  readonly property real sx: viewRef ? viewRef.localX(wx) : 0
  readonly property real t: { sim.frame; return sim.t }

  visible: !!body && sim.cfg.dayCycle

  // Halo: a few soft discs, warm for the sun, cool for the moon.
  Repeater {
    model: [{ r: 190, a: 0.06 }, { r: 120, a: 0.09 }, { r: 70, a: 0.14 }]
    Rectangle {
      required property var modelData
      readonly property real pulse: 1 + 0.04 * Math.sin(root.t * 0.6)
      width: modelData.r * 2 * pulse; height: width; radius: width / 2
      x: root.sx - width / 2; y: root.wy - height / 2
      color: root.isSun ? "#ffb347" : "#b9c8ff"
      opacity: modelData.a * (root.isSun ? 1.2 : 0.8)
    }
  }

  PixelSprite {
    visible: root.isSun
    sprite: root.sim.sprites.sun ? root.sim.sprites.sun[Math.floor(root.t * 1.5) % 2] : null
    px: 3
    x: root.sx - width / 2
    y: root.wy - height / 2
  }

  PixelSprite {
    visible: !root.isSun
    sprite: { root.sim.clockVersion; return root.sim.sprites.moonNow || null }
    px: 3
    x: root.sx - width / 2
    y: root.wy - height / 2
  }
}
