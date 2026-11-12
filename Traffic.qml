import QtQuick

// Shuttles that travel between zones, drawn on every screen so they can
// fly from one monitor to the next: a flyby over the castaway when the
// astronaut waves, and a regular shuttle that docks at the station.
Item {
  id: root

  property var sim: null
  property var viewRef: null

  readonly property real t: { sim.frame; return sim.t }

  function anchorFor(kind) {
    var a = sim.attractors
    for (var i = 0; i < a.length; i++) if (a[i].kind === kind) return a[i]
    return null
  }
  function easeOut(x) { return 1 - Math.pow(1 - x, 3) }
  function easeIn(x) { return x * x * x }

  readonly property var castaway: { sim.layoutVersion; return anchorFor("castaway") }
  readonly property var station: { sim.layoutVersion; return anchorFor("station") }

  // Flyby while the astronaut waves.
  PixelSprite {
    readonly property real p: root.sim.scene === "wave" && root.castaway
      ? Math.min(1, (root.t - root.sim.sceneStart) / Math.max(1, root.sim.sceneEnd - root.sim.sceneStart)) : -1
    visible: p >= 0 && p < 1
    sprite: root.sim.sprites.shuttle || null
    px: 3
    mirrored: true
    x: root.castaway ? root.viewRef.localX(root.castaway.x - 1800 + p * 3600) - width / 2 : 0
    y: root.castaway ? root.castaway.y - 300 - Math.sin(Math.max(0, p) * Math.PI) * 50 : 0
  }

  // Docking shuttle on a 52 s cycle: arrive, stay docked, leave toward the
  // castaway's screen, then vanish into the distance.
  PixelSprite {
    id: docker
    readonly property real period: 52
    readonly property real p: ((root.t + 9) % period) / period
    readonly property real dockX: root.station ? root.station.x + 140 + 176 + 20 + width / 2 : 0
    readonly property real dockY: root.station ? root.station.y : 0
    readonly property var pos: {
      if (!root.station) return { x: 0, y: 0, v: false }
      if (p < 0.25) {
        var a = root.easeOut(p / 0.25)
        return { x: dockX + 1100 * (1 - a), y: dockY - 220 * (1 - a), v: true }
      }
      if (p < 0.6) return { x: dockX, y: dockY, v: true }
      if (p < 0.95) {
        var d = root.easeIn((p - 0.6) / 0.35)
        return { x: dockX - 2800 * d, y: dockY - 380 * d, v: true }
      }
      return { x: 0, y: 0, v: false }
    }
    visible: pos.v
    sprite: root.sim.sprites.shuttle || null
    px: 3
    scale: p >= 0.6 && p < 0.95 ? 1 - 0.4 * root.easeIn((p - 0.6) / 0.35) : 1
    x: root.viewRef.localX(pos.x) - width / 2
    y: pos.y - height / 2
  }
}
