import QtQuick
import qs.Commons
import qs.Commons as Commons
import "physics.js" as Physics
import "daycycle.js" as Day

// One screen's window onto the shared world. Everything is placed in world
// coordinates inside `worldLayer`, shifted by this screen's offset, so the
// scene lines up across monitors.
Item {
  id: view

  property var sim: null
  property string screenName: ""

  readonly property var geo: {
    sim.layoutVersion
    return sim.screenGeo[screenName] || { x: 0, y: 0, w: width, h: height }
  }
  readonly property real offX: geo.x
  readonly property real offY: geo.y
  readonly property real worldW: sim.world.width
  readonly property real worldH: sim.world.height

  function intersects(x, w) {
    var d = Physics.wrapDelta(x + w / 2 - (offX + width / 2), worldW)
    return Math.abs(d) < (w + width) / 2
  }

  // Nearest wrapped copy of a world x relative to this screen.
  function localX(x) {
    return Physics.wrapDelta(x - (offX + width / 2), worldW) + offX + width / 2
  }

  clip: true

  Commons.Translations { id: strings; directory: Qt.resolvedUrl("i18n") }

  function hitItem(i) { return hits.hitItem(i) }

  // Warp: switching workspace on this monitor streaks its stars in the
  // direction the workspaces slide (up for a higher number, down for lower).
  property int workspaceId: -1
  property int lastWorkspace: -1
  property real warpStart: -100
  property int warpDir: 1
  onWorkspaceIdChanged: {
    if (lastWorkspace >= 0 && workspaceId >= 0 && workspaceId !== lastWorkspace && sim.cfg.warp) {
      warpDir = workspaceId > lastWorkspace ? -1 : 1
      warpStart = sim.t
    }
    lastWorkspace = workspaceId
  }
  readonly property real warpP: {
    sim.frame
    var e = sim.t - warpStart
    return e >= 0 && e < 0.9 ? e / 0.9 : -1
  }

  // ---------------------------------------------------------------- sky

  Rectangle {
    anchors.fill: parent
    gradient: Gradient {
      GradientStop { position: 0.0; color: "#03040c" }
      GradientStop { position: 0.55; color: "#080920" }
      GradientStop { position: 1.0; color: "#120a24" }
    }
  }

  // Nebulae and the galactic band, painted once in world coordinates so
  // they flow continuously from one screen into the next.
  Canvas {
    id: nebula
    anchors.fill: parent
    renderTarget: Canvas.FramebufferObject
    property int version: view.sim.layoutVersion
    property color accent: Color.accent
    onVersionChanged: requestPaint()
    onAccentChanged: requestPaint()
    onWidthChanged: requestPaint()

    SequentialAnimation on opacity {
      loops: Animation.Infinite
      NumberAnimation { from: 0.82; to: 1.0; duration: 23000; easing.type: Easing.InOutSine }
      NumberAnimation { from: 1.0; to: 0.82; duration: 23000; easing.type: Easing.InOutSine }
    }

    onPaint: {
      var ctx = getContext("2d")
      ctx.reset()
      ctx.clearRect(0, 0, width, height)
      var W = view.worldW, H = view.worldH
      if (W <= 0) return
      var rand = Physics.rng(7719)
      var acc = accent
      var palette = [
        Qt.rgba(acc.r, acc.g, acc.b, 0.20),
        Qt.rgba(0.36, 0.16, 0.53, 0.30),
        Qt.rgba(0.11, 0.31, 0.54, 0.28),
        Qt.rgba(0.69, 0.19, 0.42, 0.18),
        Qt.rgba(0.10, 0.55, 0.60, 0.14)
      ]
      ctx.save()
      ctx.translate(-view.offX, -view.offY)
      ctx.globalCompositeOperation = "lighter"
      // Clouds along a slow wave that spans the whole world.
      var count = Math.round(W / 220)
      for (var i = 0; i < count; i++) {
        var x = rand() * W
        var band = H * (0.45 + 0.25 * Math.sin(x / W * Math.PI * 2 + 1.3))
        var y = band + (rand() - 0.5) * H * 0.55
        var r = 160 + rand() * 420
        var c = palette[Math.floor(rand() * palette.length)]
        for (var copy = -1; copy <= 1; copy++) {
          var cx = x + copy * W
          if (cx + r < view.offX || cx - r > view.offX + width) continue
          var g = ctx.createRadialGradient(cx, y, 0, cx, y, r)
          g.addColorStop(0, c)
          g.addColorStop(1, Qt.rgba(0, 0, 0, 0))
          ctx.fillStyle = g
          ctx.fillRect(cx - r, y - r, r * 2, r * 2)
        }
      }
      // Dense dust of the galactic band.
      var dust = Physics.rng(4242)
      var total = Math.round(W * 1.6)
      for (var k = 0; k < total; k++) {
        var dx = dust() * W
        var by = H * (0.45 + 0.25 * Math.sin(dx / W * Math.PI * 2 + 1.3))
        var spread = (dust() + dust() + dust() - 1.5) * H * 0.18
        var a = 0.15 + dust() * 0.5
        if (dx < view.offX - 4 || dx > view.offX + width + 4) continue
        ctx.fillStyle = Qt.rgba(0.85, 0.85, 1.0, a)
        ctx.fillRect(Math.round(dx), Math.round(by + spread), 1, 1)
      }
      ctx.restore()
    }
  }

  // Two parallax star layers drifting at different speeds. Each canvas holds
  // one tile period of extra width so it can slide and wrap seamlessly.
  Repeater {
    model: [
      { tile: 1024, speed: 2.5, seed: 11, count: 260, size: 1, alpha: 0.55 },
      { tile: 1536, speed: 6.0, seed: 23, count: 160, size: 2, alpha: 0.9 }
    ]

    Canvas {
      id: stars
      required property var modelData
      readonly property real tile: modelData.tile
      width: view.width + tile
      height: view.height
      renderTarget: Canvas.FramebufferObject
      x: {
        view.sim.frame
        var shift = view.offX + view.sim.t * modelData.speed
        return -(((shift % tile) + tile) % tile)
      }
      onWidthChanged: requestPaint()

      onPaint: {
        var ctx = getContext("2d")
        ctx.clearRect(0, 0, width, height)
        var rand = Physics.rng(modelData.seed)
        var cols = ["#ffffff", "#cfe0ff", "#ffe9c4", "#d8c8ff"]
        var reps = Math.ceil(width / tile)
        for (var i = 0; i < modelData.count; i++) {
          var x = rand() * tile, y = rand() * height
          var big = rand() < 0.12
          ctx.globalAlpha = modelData.alpha * (0.4 + rand() * 0.6)
          ctx.fillStyle = cols[Math.floor(rand() * cols.length)]
          var s = modelData.size + (big ? 1 : 0)
          for (var r = 0; r <= reps; r++) ctx.fillRect(Math.round(x + r * tile), Math.round(y), s, s)
        }
      }
    }
  }

  // Bright stars that twinkle in place.
  Repeater {
    model: 36
    Rectangle {
      required property int index
      readonly property var spot: {
        var rand = Physics.rng(9001 + Math.round(view.offX) * 7 + index * 131)
        return { x: rand() * view.width, y: rand() * view.height, s: 2 + Math.floor(rand() * 2), d: 1400 + rand() * 3200, c: rand() }
      }
      x: spot.x; y: spot.y; width: spot.s; height: spot.s
      color: spot.c < 0.3 ? "#bcd4ff" : spot.c < 0.5 ? "#ffe2b0" : "#ffffff"
      SequentialAnimation on opacity {
        loops: Animation.Infinite
        NumberAnimation { to: 0.15; duration: spot.d; easing.type: Easing.InOutSine }
        NumberAnimation { to: 1.0; duration: spot.d * 0.8; easing.type: Easing.InOutSine }
      }
    }
  }

  // Horizon light that follows the time of day: dawn, day, dusk, night.
  Rectangle {
    id: horizonGlow
    readonly property var h: { view.sim.clockVersion; return view.sim.cfg.dayCycle ? Day.horizon(Day.minutesOf(new Date()), Day.parseClock(view.sim.cfg.sunrise, 395), Day.parseClock(view.sim.cfg.sunset, 1240)) : null }
    anchors.left: parent.left; anchors.right: parent.right; anchors.bottom: parent.bottom
    height: parent.height * 0.45
    visible: !!h
    gradient: Gradient {
      GradientStop { position: 0.0; color: "transparent" }
      GradientStop { position: 1.0; color: horizonGlow.h ? Qt.rgba(horizonGlow.h.color[0], horizonGlow.h.color[1], horizonGlow.h.color[2], horizonGlow.h.strength) : "transparent" }
    }
  }

  // ---------------------------------------------------------------- world

  Item {
    id: worldLayer
    x: -view.offX
    y: -view.offY
    width: view.worldW
    height: view.worldH

    DayView { sim: view.sim; viewRef: view }

    Repeater {
      model: view.sim.attractors
      Loader {
        required property var modelData
        readonly property real span: modelData.kind === "planet" ? 1000 : 900
        active: view.intersects(modelData.x - span / 2, span)
        sourceComponent: modelData.kind === "planet" ? planetComp
          : modelData.kind === "castaway" ? castawayComp : stationComp
        property var anchor: modelData
      }
    }

    Component {
      id: planetComp
      Item {
        readonly property var anchor: parent ? parent.anchor : null
        readonly property real pcx: anchor ? view.localX(anchor.x) : 0
        readonly property real pcy: anchor ? anchor.y : 0
        readonly property real t: { view.sim.frame; return view.sim.t }
        readonly property real cpu: { view.sim.frame; return view.sim.cpu }

        // Aurora: the planet's magnetosphere stirs with CPU load.
        Repeater {
          model: [{ r: 262, c: "#7dffb0", s: 1.7 }, { r: 280, c: "#58c8ff", s: 1.1 }]
          Rectangle {
            required property var modelData
            readonly property real pulse: 0.6 + 0.4 * Math.sin(parent.t * modelData.s)
            x: parent.pcx - modelData.r; y: parent.pcy - modelData.r * 0.98
            width: modelData.r * 2; height: modelData.r * 1.96; radius: modelData.r
            color: "transparent"
            border.color: modelData.c; border.width: 5
            opacity: (0.03 + parent.cpu * 0.45) * pulse
          }
        }

        PixelSprite {
          id: planetSprite
          px: 3
          sprite: view.sim.sprites.planet || null
          x: parent.pcx - width / 2
          y: parent.pcy - height / 2
        }

        // Lightning in the cloud bands; more often the busier the CPU.
        Repeater {
          model: 4
          Item {
            required property int index
            readonly property real rate: 0.6 + parent.cpu * 7
            readonly property real tick: parent.t * rate + index * 0.37
            readonly property int seed: Math.floor(tick) * 7 + index * 131
            function h(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x) }
            readonly property bool on: (tick - Math.floor(tick)) < 0.18 && h(seed) < 0.1 + parent.cpu * 0.8
            readonly property real ang: h(seed + 1) * Math.PI * 2
            readonly property real rad: Math.sqrt(h(seed + 2)) * 200
            visible: on
            x: parent.pcx + Math.cos(ang) * rad
            y: parent.pcy + Math.sin(ang) * rad
            Rectangle { x: -14; y: -14; width: 28; height: 28; radius: 14; color: "#fff6c0"; opacity: 0.35 }
            Rectangle { x: -6; y: -2; width: 12; height: 4; color: "#ffffff" }
            Rectangle { x: 2; y: 2; width: 4; height: 6; color: "#ffffff" }
          }
        }
      }
    }

    Component {
      id: castawayComp
      Castaway { sim: view.sim; anchor: parent ? parent.anchor : null; viewRef: view }
    }

    Component {
      id: stationComp
      Station { sim: view.sim; anchor: parent ? parent.anchor : null; viewRef: view }
    }

    Traffic { sim: view.sim; viewRef: view }

    // Free bodies: moons, rocks, cats, a lost tourist, satellites, comets.
    Repeater {
      model: view.sim.bodies.length
      delegate: Item {
        id: bodyItem
        required property int index
        readonly property var body: view.sim.bodies[index] || null
        readonly property string kind: body ? body.kind : ""
        readonly property var art: {
          var sp = view.sim.sprites
          if (!body || !sp.rock) return null
          if (kind === "moon") return sp.moon[body.variant % sp.moon.length]
          if (kind === "rock") return sp.rock[body.variant % sp.rock.length]
          if (kind === "cat") return sp.cat
          if (kind === "tourist") return sp.astronaut
          if (kind === "satellite") return sp.satellite
          return null
        }
        readonly property real bx: { view.sim.frame; return body ? view.localX(body.x) : 0 }
        readonly property real by: { view.sim.frame; return body ? body.y : 0 }
        visible: !!body && body.active !== false && bx > view.offX - 200 && bx < view.offX + view.width + 200

        PixelSprite {
          visible: !!bodyItem.art
          sprite: bodyItem.art
          px: 3
          x: bodyItem.bx - width / 2
          y: bodyItem.by - height / 2
          rotation: { view.sim.frame; return bodyItem.kind === "moon" ? 0 : (bodyItem.body ? bodyItem.body.a : 0) }
        }

        // Project and workspace names under their moons.
        Text {
          visible: bodyItem.kind === "moon" && !!bodyItem.body && !!bodyItem.body.label
          x: bodyItem.bx - implicitWidth / 2
          y: bodyItem.by + 26
          textFormat: Text.PlainText
          font.family: "monospace"; font.pixelSize: 11
          color: "#c9d4ff"
          opacity: 0.6
          text: bodyItem.body && bodyItem.body.label ? bodyItem.body.label : ""
        }

        // Comet head and its fading tail.
        Repeater {
          model: bodyItem.kind === "comet" ? 16 : 0
          Rectangle {
            required property int index
            readonly property var p: {
              view.sim.frame
              var tr = bodyItem.body && bodyItem.body.trail
              return tr && tr[index] ? tr[index] : null
            }
            visible: !!p
            width: Math.max(2, 7 - index * 0.35); height: width; radius: width / 2
            x: p ? view.localX(p.x) - width / 2 : 0
            y: p ? p.y - height / 2 : 0
            color: index < 3 ? "#e8fbff" : "#7fd8ff"
            opacity: 0.85 * (1 - index / 16)
          }
        }
        Rectangle {
          visible: bodyItem.kind === "comet"
          width: 9; height: 9; radius: 4.5
          x: bodyItem.bx - 4.5; y: bodyItem.by - 4.5
          color: "#ffffff"
          Rectangle { anchors.centerIn: parent; width: 26; height: 26; radius: 13; color: "#7fd8ff"; opacity: 0.25 }
        }
      }
    }

    // Ships fly above the drifting rocks.
    FleetView { sim: view.sim; viewRef: view; strings: strings }
    EpisodeView { sim: view.sim; viewRef: view }
    RocketView { sim: view.sim; viewRef: view }
  }

  // Warp streaks, drawn only while a jump is under way.
  Item {
    anchors.fill: parent
    visible: view.warpP >= 0
    readonly property real k: view.warpP >= 0 ? Math.sin(Math.PI * view.warpP) : 0
    Rectangle { anchors.fill: parent; color: Color.accent; opacity: 0.07 * parent.k }
    Repeater {
      model: 70
      Rectangle {
        required property int index
        readonly property var seed: {
          var r = Physics.rng(5003 + index * 97 + Math.round(view.offX))
          return { x: r() * view.width, y: r() * view.height, d: 0.4 + r() * 0.6, c: r() }
        }
        readonly property real travel: view.warpP >= 0 ? view.warpP * view.warpP * 1600 * seed.d : 0
        x: seed.x
        width: seed.d > 0.8 ? 3 : 2
        height: 6 + 260 * parent.k * seed.d
        y: {
          var span = view.height + height
          var p = seed.y + view.warpDir * travel
          return ((p % span) + span) % span - height
        }
        radius: 1
        color: seed.c < 0.3 ? "#9fd8ff" : seed.c < 0.5 ? Color.accent : "#ffffff"
        opacity: 0.85 * parent.k * seed.d
      }
    }
  }

  // Soft vignette so windows with blur over it read as glass over deep space.
  // (Drawn before the hit layer so tooltips stay crisp.)
  Rectangle {
    anchors.fill: parent
    gradient: Gradient {
      GradientStop { position: 0.0; color: Qt.rgba(0, 0, 0, 0.35) }
      GradientStop { position: 0.18; color: Qt.rgba(0, 0, 0, 0.0) }
      GradientStop { position: 0.82; color: Qt.rgba(0, 0, 0, 0.0) }
      GradientStop { position: 1.0; color: Qt.rgba(0, 0, 0, 0.4) }
    }
  }

  HitLayer {
    id: hits
    anchors.fill: parent
    sim: view.sim
    view: view
    strings: strings
  }
}
