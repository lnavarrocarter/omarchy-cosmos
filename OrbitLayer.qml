import QtQuick
import "orbital.js" as Orbital

// What circles a machine world (planet style "tech"), from orbital.js. The
// planet view places two of these: one behind the planet sprite (front:
// false) and one over it (front: true), so orbits pass behind and in front.
// Only the front layer draws the elevator, chunks of crust, turret shots and
// the motherships.
Item {
  id: orbit

  property var sim: null
  property bool front: false
  property real pcx: 0
  property real pcy: 0

  readonly property var art: sim && sim.sprites ? sim.sprites.orbit : null
  readonly property var colors: (sim && sim.look && sim.look.planet && sim.look.planet.colors) || []
  readonly property real t: { sim.frame; return sim.t }
  readonly property real px: 3
  visible: !!art

  function sx(p) { return pcx + p.x * px }
  function sy(p) { return pcy + p.y * px }

  // Orbiting stations and satellites, and scrap from the broken ring.
  Repeater {
    model: orbit.art ? Orbital.COUNTS.stations : 0
    PixelSprite {
      required property int index
      readonly property var p: { orbit.t; return Orbital.station(index, orbit.t) }
      visible: p.front === orbit.front
      sprite: orbit.art ? orbit.art[p.kind] : null
      px: orbit.px
      x: orbit.sx(p) - width / 2; y: orbit.sy(p) - height / 2
      rotation: p.rot * 180 / Math.PI
    }
  }
  Repeater {
    model: orbit.art ? Orbital.COUNTS.satellites : 0
    PixelSprite {
      required property int index
      readonly property var p: { orbit.t; return Orbital.satellite(index, orbit.t) }
      visible: p.front === orbit.front
      sprite: orbit.sim ? orbit.sim.sprites.satellite : null
      px: orbit.px
      x: orbit.sx(p) - width / 2; y: orbit.sy(p) - height / 2
      rotation: p.rot * 180 / Math.PI
    }
  }
  Repeater {
    model: orbit.art ? Orbital.COUNTS.junk : 0
    PixelSprite {
      required property int index
      readonly property var p: { orbit.t; return Orbital.junk(index, orbit.t) }
      visible: p.front === orbit.front && !p.hidden
      sprite: orbit.art ? orbit.art.junk[index % orbit.art.junk.length] : null
      px: orbit.px
      x: orbit.sx(p) - width / 2; y: orbit.sy(p) - height / 2
      rotation: p.rot * 180 / Math.PI
    }
  }

  // ------------------------------------------------ front layer only
  Item {
    visible: orbit.front
    anchors.fill: parent

    // Space elevator: cable from the pole, a counterweight, the climber.
    Item {
      id: lift
      readonly property var e: { orbit.t; return Orbital.elevator(orbit.t) }
      Rectangle {
        x: orbit.pcx - 1; y: orbit.pcy + lift.e.topY * orbit.px
        width: 3; height: (lift.e.baseY - lift.e.topY) * orbit.px
        color: "#96a0be"; opacity: 0.85
      }
      PixelSprite {
        sprite: orbit.art ? orbit.art.wheel : null
        px: 2
        x: orbit.pcx - width / 2; y: orbit.pcy + lift.e.topY * orbit.px - 12 - height / 2
      }
      Rectangle {
        readonly property real r: 16
        x: orbit.pcx - r; y: orbit.pcy + lift.e.climberY * orbit.px - r
        width: r * 2; height: r * 2; radius: r
        color: "#ffd65a"; opacity: 0.25
      }
      PixelSprite {
        sprite: orbit.art ? orbit.art.climber : null
        px: orbit.px
        x: orbit.pcx - width / 2; y: orbit.pcy + lift.e.climberY * orbit.px - height / 2
      }
    }

    Repeater {
      model: orbit.art ? Orbital.COUNTS.turrets : 0
      PixelSprite {
        required property int index
        readonly property var p: Orbital.turret(index)
        visible: p.front
        sprite: orbit.art ? orbit.art.turret : null
        px: orbit.px
        x: orbit.sx(p) - width / 2; y: orbit.sy(p) - height / 2
        rotation: p.rot * 180 / Math.PI
      }
    }

    // Chunks of crust with their seas, and the water pouring off them.
    Repeater {
      model: orbit.art ? Orbital.COUNTS.chunks : 0
      Item {
        id: chunkItem
        required property int index
        readonly property var c: { orbit.t; return Orbital.chunk(index, orbit.t) }
        visible: c.visible
        Rectangle {
          readonly property real r: 14
          x: orbit.sx(chunkItem.c) - r; y: orbit.sy(chunkItem.c) + 8 - r
          width: r * 2; height: r * 2; radius: r
          color: orbit.colors[4] || "#ff9447"; opacity: 0.12
        }
        PixelSprite {
          sprite: orbit.art ? orbit.art.chunk[chunkItem.c.variant % 3] : null
          px: orbit.px
          x: orbit.sx(chunkItem.c) - width / 2; y: orbit.sy(chunkItem.c) - height / 2
          rotation: chunkItem.c.rot * 180 / Math.PI
        }
        Repeater {
          model: Orbital.COUNTS.drops
          Rectangle {
            required property int index
            readonly property var d: { orbit.t; return Orbital.drop(chunkItem.index, index, orbit.t) }
            visible: d.visible
            x: orbit.sx(d) - 1; y: orbit.sy(d) - d.len * 2
            width: 3; height: Math.max(3, d.len * 3)
            color: orbit.colors[3] || "#36b5c9"; opacity: 0.9
          }
        }
      }
    }

    // A turret's beam and the burst when it hits.
    Item {
      id: shot
      readonly property var s: { orbit.t; return Orbital.shot(orbit.t) }
      readonly property real fx: orbit.sx(s.from)
      readonly property real fy: orbit.sy(s.from)
      readonly property real tx: orbit.sx(s.to)
      readonly property real ty: orbit.sy(s.to)
      Rectangle {
        visible: shot.s.beam
        x: shot.fx; y: shot.fy - 1.5
        width: Math.hypot(shot.tx - shot.fx, shot.ty - shot.fy); height: 3
        transformOrigin: Item.Left
        rotation: Math.atan2(shot.ty - shot.fy, shot.tx - shot.fx) * 180 / Math.PI
        color: "#ff5c8a"; opacity: 0.9
      }
      Rectangle {
        visible: shot.s.beam
        x: shot.fx - 9; y: shot.fy - 9; width: 18; height: 18; radius: 9
        color: "#ff5c8a"; opacity: 0.45
      }
      Item {
        visible: shot.s.blast
        readonly property real age: Math.max(0, Math.min(1, shot.s.blastAge))
        readonly property real r: 18 + age * 50
        Rectangle {
          x: shot.tx - parent.r; y: shot.ty - parent.r; width: parent.r * 2; height: parent.r * 2; radius: parent.r
          color: "#ffd65a"; opacity: 0.45 * (1 - parent.age)
        }
        Rectangle {
          x: shot.tx - parent.r / 2; y: shot.ty - parent.r / 2; width: parent.r; height: parent.r; radius: parent.r / 2
          color: "#ffffff"; opacity: 0.6 * (1 - parent.age)
        }
        Repeater {
          model: 10
          Rectangle {
            required property int index
            readonly property real a: index * 0.628 + parent.age
            readonly property real d: 8 + parent.age * 70
            x: shot.tx + Math.cos(a) * d - 2; y: shot.ty + Math.sin(a) * d - 2
            width: 4; height: 4
            color: index % 2 ? "#ff9447" : "#ffd65a"; opacity: 1 - parent.age
          }
        }
      }
    }

    // Motherships, holding still with their engines glowing.
    Repeater {
      model: orbit.art ? Orbital.COUNTS.motherships : 0
      Item {
        id: mship
        required property int index
        readonly property var m: { orbit.t; return Orbital.mothership(index, orbit.t) }
        Rectangle {
          readonly property real r: 28
          x: orbit.sx(mship.m) + (mship.m.flip ? -104 : 104) - r; y: orbit.sy(mship.m) - r
          width: r * 2; height: r * 2; radius: r
          color: "#58c8ff"; opacity: 0.2
        }
        PixelSprite {
          sprite: orbit.art ? orbit.art.mothership[mship.index] : null
          px: 4
          mirrored: mship.m.flip
          x: orbit.sx(mship.m) - width / 2; y: orbit.sy(mship.m) - height / 2
        }
      }
    }
  }
}
