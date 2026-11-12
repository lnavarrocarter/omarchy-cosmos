import QtQuick
import "looks.js" as Looks

// The castaway asteroid: a sandy rock under a thin glass dome, a palm, a
// tent, a campfire, an astronaut and their cat. sim.scene decides what the
// two of them are up to; every motion is a function of sim.t so it stays
// consistent however many screens show it.
Item {
  id: root

  property var sim: null
  property var anchor: null
  property var viewRef: null

  readonly property real t: { sim.frame; return sim.t }
  readonly property real elapsed: t - sim.sceneStart
  readonly property string scene: sim.scene
  readonly property real cx: anchor && viewRef ? viewRef.localX(anchor.x) : 0
  readonly property real cy: anchor ? anchor.y : 0
  readonly property real bob: Math.round(Math.sin(t * 0.5) * 3) * 2

  // The home style (looks.js): island, planetoid, castle or ship. On a round
  // home everything stands on the curve and leans with it.
  readonly property string home: sim.look ? sim.look.home : "island"
  readonly property var layout: Looks.HOME_LAYOUT[home] || Looks.HOME_LAYOUT.island
  function ground(x) { return Looks.ground(home, x) }

  // Glass dome the drifting rocks bounce off.
  Rectangle {
    visible: root.layout.dome
    readonly property real r: root.anchor ? root.anchor.radius : 175
    x: root.cx - r; y: root.cy - r + root.bob
    width: r * 2; height: r * 2; radius: r
    color: Qt.rgba(0.5, 0.85, 1.0, 0.035)
    border.color: Qt.rgba(0.6, 0.9, 1.0, 0.10)
    border.width: 2
  }

  Item {
    id: island
    width: 384; height: 160
    x: root.cx - width / 2
    y: root.cy - 72 + root.bob
    readonly property real surface: 32

    // Centred: a round home can be wider than the island.
    PixelSprite { sprite: root.sim.sprites.home || null; px: 4; x: 192 - width / 2 }

    // The landmark in the palm's place (palm, tree, tower, antenna).
    PixelSprite {
      readonly property var g: root.ground(56)
      sprite: root.sim.sprites.decoLeft || null; px: 4
      x: 56 - width / 2; y: island.surface - height + 6 + g.dy
      // Episodes can blow wind across the island (effects.wind, degrees).
      readonly property real wind: root.sim.episodeState && root.sim.episodeState.effects ? root.sim.episodeState.effects.wind : 0
      rotation: g.rot + (root.layout.sways ? Math.sin(root.t * 0.7) * 2 + wind * (0.75 + 0.25 * Math.sin(root.t * 3.1)) : 0)
      transformOrigin: Item.Bottom
    }

    // The landmark in the tent's place (tent, hut, keep, cockpit).
    PixelSprite {
      readonly property var g: root.ground(308)
      sprite: root.sim.sprites.decoRight || null; px: 4
      x: 308 - width / 2; y: island.surface - height + 6 + g.dy
      rotation: g.rot
      transformOrigin: Item.Bottom
    }

    // Jar of caught stars beside the tent (episodes can take it: "jar").
    Repeater {
      model: root.sim.islandHidden("jar") ? 0
        : Math.min(6, root.sim.caught + (root.scene === "fish" ? Math.floor(root.elapsed / 6) : 0))
      Rectangle {
        required property int index
        width: 4; height: 4
        x: 268 + (index % 3) * 5
        y: island.surface - 6 - Math.floor(index / 3) * 5 + root.ground(275).dy
        color: "#ffe680"
        opacity: 0.7 + 0.3 * Math.sin(root.t * 3 + index)
      }
    }

    // Campfire with a warm glow.
    Rectangle {
      x: 196; y: island.surface - 42 + root.ground(226).dy
      width: 60; height: 60; radius: 30
      color: "#ff9447"
      opacity: 0.10 + 0.05 * Math.sin(root.t * 9)
    }
    PixelSprite {
      sprite: root.sim.sprites.fire ? root.sim.sprites.fire[Math.floor(root.t * 7) % 3] : null
      px: 4
      readonly property var g: root.ground(226)
      x: 216; y: island.surface - height + 4 + g.dy
      rotation: g.rot; transformOrigin: Item.Bottom
    }

    // The cat: by the fire, or out chasing a fish across the dome.
    readonly property bool catAway: root.scene === "cat"
    readonly property real catP: catAway ? Math.min(1, root.elapsed / 16) : 0
    readonly property real catEnv: Math.sin(Math.PI * catP)

    PixelSprite {
      visible: (!island.catAway || island.catEnv < 0.05) && !root.sim.islandHidden("cat")
      // Now and then it blinks, and swishes its tail.
      readonly property bool blinking: root.t % 4.3 < 0.16
      readonly property bool swishing: root.t % 9 < 1.6 && Math.floor(root.t * 2.5) % 2 === 0
      sprite: (blinking || root.scene === "sleep" ? root.sim.sprites.catBlink
        : swishing ? root.sim.sprites.catSwish : root.sim.sprites.catSit) || null
      px: 4
      readonly property var g: root.ground(258)
      x: 240; y: island.surface - height + 4 + g.dy
      rotation: g.rot; transformOrigin: Item.Bottom
      mirrored: root.scene === "sleep"
    }
    PixelSprite {
      id: floatingCat
      visible: island.catAway && island.catEnv >= 0.05 && !root.sim.islandHidden("cat")
      sprite: root.sim.sprites.cat || null; px: 3
      x: 240 + island.catEnv * 170 * Math.cos(island.catP * Math.PI * 3)
      y: island.surface - 40 - island.catEnv * 190 - island.catEnv * 40 * Math.sin(root.t * 2.2)
      rotation: Math.sin(root.t * 1.3) * 25
    }
    PixelSprite {
      visible: floatingCat.visible
      sprite: root.sim.sprites.fish || null; px: 3
      x: floatingCat.x + 60 + 18 * Math.sin(root.t * 3.1)
      y: floatingCat.y - 14 + 10 * Math.cos(root.t * 2.4)
    }

    // The dog, between the palm and the astronaut. Episodes can take it,
    // the cat or the astronaut away for a while (sim.islandHidden).
    PixelSprite {
      visible: !root.sim.islandHidden("dog")
      // It wags its tail now and then, and all the time while the astronaut waves.
      readonly property bool wagging: (root.scene === "wave" || (root.t + 3) % 7 < 1.2)
        && Math.floor(root.t * 6) % 2 === 0
      sprite: (wagging ? root.sim.sprites.dogWag : root.sim.sprites.dog) || null
      px: 4
      readonly property var g: root.ground(114)
      x: 92
      y: island.surface - height + 4 + g.dy
      rotation: g.rot; transformOrigin: Item.Bottom
    }

    // The astronaut.
    Item {
      id: astro
      visible: !root.sim.islandHidden("astronaut")
      width: 48; height: 60
      readonly property var g: root.ground(x + 24)
      x: root.scene === "sleep" ? 200 : 150
      y: island.surface - height + 4 + g.dy + (root.scene === "sleep" ? 34 : 0)
         - (root.scene === "idle" ? Math.max(0, Math.round(Math.sin(root.t * 2.4)) * 4) : 0)
      rotation: g.rot + (root.scene === "sleep" ? -90 : root.scene === "stargaze" ? -12 : 0)

      PixelSprite {
        sprite: root.scene === "wave" && Math.floor(root.t * 3) % 2 === 0
          ? (root.sim.sprites.astronautWave || null) : (root.sim.sprites.astronaut || null)
        px: 4
      }
    }

    // Fishing for stars: a rod, a line, and now and then a catch.
    Item {
      visible: root.scene === "fish" && !root.sim.islandHidden("rod")
      readonly property real tipX: astro.x + 78
      readonly property real tipY: astro.y - 14
      readonly property real goalX: tipX + 150
      readonly property real goalY: tipY - 210

      Rectangle {
        x: astro.x + 40; y: astro.y + 30
        width: 52; height: 3
        color: "#8a5a35"
        rotation: -42
        transformOrigin: Item.Left
      }
      Repeater {
        model: 14
        Rectangle {
          required property int index
          readonly property real f: index / 13
          x: parent.tipX + (parent.goalX - parent.tipX) * f
          y: parent.tipY + (parent.goalY - parent.tipY) * f + Math.sin(f * Math.PI) * 24
          width: 2; height: 2
          color: "#d8e6ff"; opacity: 0.6
        }
      }
      Rectangle {
        readonly property real p: (root.elapsed % 6) / 6
        readonly property real f: p < 0.6 ? 0 : (p - 0.6) / 0.4
        x: parent.goalX + (parent.tipX - parent.goalX) * f - 3
        y: parent.goalY + (parent.tipY - parent.goalY) * f + Math.sin(f * Math.PI) * 24 - 3
        width: 6; height: 6; rotation: 45
        color: "#fff2a0"
      }
    }

    // Zzz while asleep.
    Repeater {
      model: root.scene === "sleep" ? 3 : 0
      Text {
        required property int index
        readonly property real p: ((root.t * 0.4 + index / 3) % 1)
        textFormat: Text.PlainText
        text: "z"
        font.family: "monospace"
        font.bold: true
        font.pixelSize: 14 + index * 5
        color: "#dfe8ff"
        x: 232 + p * 40 + index * 6
        y: island.surface - 50 - p * 70
        opacity: 1 - p
      }
    }
  }
}
