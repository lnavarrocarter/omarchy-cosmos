import QtQuick

// One clickable spot of the scene. Its geometry follows what it covers
// (a hangar, a ship, a moon); outside this screen it collapses to nothing,
// so the window's input region stays tiny and the desktop keeps its clicks.
Item {
  id: box

  property int slot: 0
  property var host: null

  readonly property var g: {
    host.sim.frame
    host.sim.fleetVersion
    host.sim.moonVersion
    return host.geomFor(slot)
  }

  x: g.x; y: g.y; width: g.w; height: g.h

  // Rocks (g.grab) are dragged and thrown; everything else is clicked.
  MouseArea {
    anchors.fill: parent
    enabled: box.width > 0 || pressed
    hoverEnabled: true
    preventStealing: true
    cursorShape: box.g.grab ? (pressed ? Qt.ClosedHandCursor : Qt.OpenHandCursor) : Qt.PointingHandCursor
    onContainsMouseChanged: box.host.setHover(box.slot, containsMouse)
    onPressed: (mouse) => {
      if (!box.g.grab) return
      var p = mapToItem(box.host, mouse.x, mouse.y)
      box.host.grabAt(box.g.bodyId, p.x, p.y, box.slot)
    }
    onPositionChanged: (mouse) => {
      if (!pressed || !box.host.sim.heldRock) return
      var p = mapToItem(box.host, mouse.x, mouse.y)
      box.host.dragAt(p.x, p.y)
    }
    onReleased: if (box.host.sim.heldRock) box.host.release()
    onCanceled: if (box.host.sim.heldRock) box.host.release()
    onClicked: if (!box.g.grab) box.host.sim.openPanel(box.g.target)
  }
}
