import QtQuick

// Draws whatever episode is playing from sim.episodeState (built by
// episodes.js once per frame). It knows nothing about any one episode: it
// has fixed slots for actors, shots, flashes, particles, ropes and beams.
Item {
  id: root

  property var sim: null
  property var viewRef: null

  readonly property var st: sim.episodeState
  readonly property real t: { sim.frame; return sim.t }
  function sx(wx) { return viewRef ? viewRef.localX(wx) : wx }
  function art(name) { return sim.sprites.ep ? (sim.sprites.ep[name] || null) : null }

  visible: !!st

  // Beams (under everything else), drawn as stepped, widening light.
  Repeater {
    model: 2
    Item {
      id: beam
      required property int index
      readonly property var b: root.st ? root.st.beams[index] || null : null
      visible: !!b
      Repeater {
        model: 10
        Rectangle {
          required property int index
          readonly property var b: beam.b
          readonly property real span: b ? Math.max(0, b.bottom - b.top) : 0
          width: b ? b.w0 + (b.w1 - b.w0) * index / 9 : 0
          height: span / 10 + 1
          x: b ? root.sx(b.x) - width / 2 : 0
          y: b ? b.top + index * span / 10 : 0
          color: b ? b.color : "transparent"
          opacity: b ? b.a * (0.14 + 0.06 * Math.sin(root.t * 18 + index)) : 0
        }
      }
    }
  }

  // Ropes: a chain of dots that sags between two actors.
  Repeater {
    model: 3
    Item {
      id: rope
      required property int index
      readonly property var r: root.st ? root.st.ropes[index] || null : null
      visible: !!r
      Repeater {
        model: 14
        Rectangle {
          required property int index
          readonly property var p: rope.r ? rope.r.points[index] : null
          width: 3; height: 3
          x: p ? root.sx(p.x) - 1.5 : 0
          y: p ? p.y - 1.5 : 0
          color: rope.r ? rope.r.color : "transparent"
          opacity: 0.85
        }
      }
    }
  }

  // Actors.
  Repeater {
    model: 16
    Item {
      id: actor
      required property int index
      readonly property var a: root.st ? root.st.actors[index] || null : null
      visible: !!a

      Rectangle {
        readonly property var g: actor.a ? actor.a.glow : null
        visible: !!g
        width: g ? g.r * 2 : 0; height: width; radius: width / 2
        x: g ? root.sx(actor.a.x) - g.r : 0
        y: g ? actor.a.y - g.r + (g.dy || 0) : 0
        color: g ? g.color : "transparent"
        opacity: g ? (g.a || 0.15) * actor.a.o * (0.8 + 0.2 * Math.sin(root.t * 4 + actor.index)) : 0
      }
      PixelSprite {
        visible: !!actor.a && !!actor.a.sprite
        sprite: actor.a && actor.a.sprite ? root.art(actor.a.sprite) : null
        px: actor.a ? actor.a.px : 4
        mirrored: actor.a ? actor.a.flip : false
        x: actor.a ? root.sx(actor.a.x) - width / 2 : 0
        y: actor.a ? actor.a.y - height / 2 : 0
        rotation: actor.a ? actor.a.rot : 0
        scale: actor.a ? actor.a.scale : 1
        opacity: actor.a ? actor.a.o : 0
      }
      Text {
        visible: !!actor.a && !!actor.a.text
        textFormat: Text.PlainText
        text: actor.a ? actor.a.text : ""
        font.family: "monospace"; font.bold: true
        font.pixelSize: actor.a ? actor.a.size : 22
        color: actor.a ? actor.a.color : "#ffd65a"
        x: actor.a ? root.sx(actor.a.x) - implicitWidth / 2 : 0
        y: actor.a ? actor.a.y - implicitHeight / 2 : 0
        opacity: actor.a ? actor.a.o : 0
      }
    }
  }

  // Particles: squares, dots, streaks or a glyph.
  Repeater {
    model: 64
    Item {
      id: part
      required property int index
      readonly property var p: root.st ? root.st.particles[index] || null : null
      visible: !!p
      Rectangle {
        visible: !!part.p && !part.p.glyph
        width: part.p ? part.p.w : 0; height: part.p ? part.p.h : 0
        radius: part.p && part.p.round ? width / 2 : 0
        x: part.p ? root.sx(part.p.x) - width / 2 : 0
        y: part.p ? part.p.y - height / 2 : 0
        rotation: part.p ? part.p.rot : 0
        color: part.p ? part.p.color : "transparent"
        opacity: part.p ? Math.max(0, part.p.o) : 0
      }
      Text {
        visible: !!part.p && !!part.p.glyph
        textFormat: Text.PlainText
        text: part.p ? part.p.glyph : ""
        font.pixelSize: part.p ? 10 + part.p.w * 2 : 14
        font.bold: true
        color: part.p ? part.p.color : "#ffffff"
        x: part.p ? root.sx(part.p.x) - implicitWidth / 2 : 0
        y: part.p ? part.p.y - implicitHeight / 2 : 0
        rotation: part.p ? part.p.rot : 0
        opacity: part.p ? Math.max(0, part.p.o) : 0
      }
    }
  }

  // Shots: lasers, cannonballs, or a thrown glyph.
  Repeater {
    model: 16
    Item {
      id: shot
      required property int index
      readonly property var s: root.st ? root.st.shots[index] || null : null
      readonly property bool laser: !!s && s.kind === "laser"
      visible: !!s
      Rectangle {
        visible: !!shot.s && !shot.s.glyph
        width: shot.laser ? 26 : 10; height: shot.laser ? 4 : 10; radius: shot.laser ? 2 : 5
        x: shot.s ? root.sx(shot.s.x) - width / 2 : 0
        y: shot.s ? shot.s.y - height / 2 : 0
        color: shot.s && shot.s.color ? shot.s.color : shot.laser ? "#7df9ff" : "#2d2f45"
        border.color: shot.laser ? "#e8fbff" : "#ff9447"; border.width: shot.laser ? 1 : 2
      }
      Text {
        visible: !!shot.s && !!shot.s.glyph
        textFormat: Text.PlainText
        text: shot.s ? shot.s.glyph : ""
        font.pixelSize: 18; font.bold: true
        color: shot.s && shot.s.color ? shot.s.color : "#ffd65a"
        x: shot.s ? root.sx(shot.s.x) - implicitWidth / 2 : 0
        y: shot.s ? shot.s.y - implicitHeight / 2 : 0
      }
    }
  }

  // Hits and blasts.
  Repeater {
    model: 16
    Rectangle {
      required property int index
      readonly property var f: root.st ? root.st.flashes[index] || null : null
      visible: !!f
      width: f ? f.r * 2 : 0; height: width; radius: width / 2
      x: f ? root.sx(f.x) - f.r : 0
      y: f ? f.y - f.r : 0
      color: f ? f.color : "transparent"
      opacity: f ? 0.75 * f.a : 0
    }
  }
}
