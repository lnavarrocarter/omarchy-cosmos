import QtQuick
import qs.Commons

// The hourly rocket: on the hour it crosses every screen, left to right,
// towing a banner with the time and leaving a trail of smoke.
Item {
  id: root

  property var sim: null
  property var viewRef: null

  readonly property real duration: 24
  readonly property real e: { sim.frame; return sim.t - sim.rocketStart }
  readonly property bool flying: e >= 0 && e < duration
  readonly property real startX: -420
  readonly property real endX: sim.world.width + 420
  function xAt(time) { return startX + (endX - startX) * (time / duration) }
  function yAt(time) { return sim.world.height * 0.2 + Math.sin(time * 0.7) * 34 }

  readonly property real wx: xAt(e)
  readonly property real wy: yAt(e)
  readonly property real sx: viewRef ? viewRef.localX(wx) : 0

  visible: flying && sim.cfg.hourlyRocket

  // Smoke left behind along the path.
  Repeater {
    model: 14
    Rectangle {
      required property int index
      readonly property real back: (index + 1) * 0.35
      readonly property real age: Math.min(1, back / 4.9)
      width: 10 + age * 26; height: width; radius: width / 2
      x: root.viewRef ? root.viewRef.localX(root.xAt(root.e - back)) - 36 - width / 2 : 0
      y: root.yAt(root.e - back) - height / 2 + age * 10
      color: "#c9cbe0"
      opacity: (root.e - back > 0 ? 0.35 : 0) * (1 - age)
    }
  }

  // Tow line and banner with the hour.
  Rectangle {
    x: banner.x + banner.width; y: root.wy - 1
    width: Math.max(0, root.sx - 36 - x); height: 2
    color: "#c9cbe0"; opacity: 0.8
  }
  Rectangle {
    id: banner
    width: label.implicitWidth + 28; height: 40
    x: root.sx - 140 - width
    y: root.wy - height / 2 + Math.sin(root.e * 3) * 4
    color: Qt.rgba(0.04, 0.05, 0.12, 0.85)
    border.color: Color.accent; border.width: 3
    radius: 4
    Text {
      id: label
      anchors.centerIn: parent
      textFormat: Text.PlainText
      text: root.sim.rocketLabel
      font.family: "monospace"; font.bold: true; font.pixelSize: 22
      color: "#ffd65a"
    }
  }

  // Flame flicker behind the nozzle.
  Rectangle {
    readonly property real len: 18 + 10 * Math.sin(root.e * 40)
    width: len; height: 10; radius: 5
    x: root.sx - 27 - len; y: root.wy - 5
    color: "#ff9447"
    Rectangle { width: parent.width * 0.5; height: 6; radius: 3; anchors.right: parent.right; anchors.verticalCenter: parent.verticalCenter; color: "#fff6c0" }
  }

  PixelSprite {
    sprite: root.sim.sprites.rocket || null
    px: 3
    x: root.sx - width / 2
    y: root.wy - height / 2
    rotation: Math.cos(root.e * 0.7) * 6
  }
}
