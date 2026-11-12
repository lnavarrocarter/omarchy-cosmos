import QtQuick
import Quickshell
import Quickshell.Io
import Quickshell.Wayland
import qs.Commons
import qs.Commons as Commons
import qs.Ui
import "looks.js" as Looks
import "sprites.js" as Sprites

// Cosmos Studio: make the scene your own. A card on the right of the
// focused screen, over a live view of that screen's scene. At its top a
// small diorama previews the planet, the home and its characters as they
// are now; every change is saved at once (sim.saveConfig) and can be undone.
// Opened with `omarchy-shell lnavarrocarter.cosmos studio` or a right click
// on the bar widget; Escape, Close or a click outside the card closes it.
Item {
  id: studio

  property var sim: null
  property bool opened: false
  property string tab: "scene"

  function open() {
    if (!thumbs) buildThumbs()
    opened = true
    Qt.callLater(function() { keys.forceActiveFocus() })
  }
  function close() { opened = false; resetArmed = false }
  function toggle() { opened ? close() : open() }

  Commons.Translations { id: strings; directory: Qt.resolvedUrl("i18n") }

  readonly property var cfg: sim ? sim.cfg : ({})
  readonly property var look: sim ? sim.look : Looks.normalize({})
  readonly property var sprites: sim ? sim.sprites : ({})
  readonly property color fg: Commons.Color.menu.text
  readonly property color accent: Commons.Color.accent
  readonly property string autoLabel: strings.t("studio.color.auto")
  readonly property string useAutoLabel: strings.t("studio.color.useAuto")

  // ---------------------------------------------------------------- saving, undo

  property var history: []

  function remember() {
    var h = history.slice(-19)
    h.push(JSON.stringify(sim ? sim.userConfig : {}))
    history = h
  }
  function save(patch) { if (!sim) return; remember(); sim.saveConfig(patch) }
  function saveLook(part, value) { var l = ({}); l[part] = value; save({ look: l }) }
  function undo() {
    if (!sim || !history.length) return
    var h = history.slice()
    var prev = h.pop()
    history = h
    sim.replaceConfig(JSON.parse(prev))
  }
  property bool resetArmed: false
  Timer { id: disarm; interval: 3500; onTriggered: studio.resetArmed = false }
  function resetAll() {
    if (!resetArmed) { resetArmed = true; disarm.restart(); return }
    resetArmed = false
    remember()
    sim.replaceConfig({})
  }

  // Colours offered for characters and ships.
  readonly property var swatches: ["#eef0f7", "#a3a9c2", "#1b1d2b", "#e2524a", "#ff8fa8", "#ff6ad5", "#9b6bff",
    "#3d6fd8", "#58c8ff", "#7df9ff", "#3fae6a", "#9be37a", "#ffd65a", "#f2a541", "#ff9447", "#e9cf93",
    "#c9a86a", "#8a5a35"]

  // ---------------------------------------------------------------- thumbnails

  // Small renders of every planet preset and every home, made once.
  property var thumbs: null
  function buildThumbs() {
    var planets = ({}), homes = ({})
    for (var k in Looks.PLANETS) planets[k] = Sprites.planet(22, 0, Looks.planet({ preset: k }))
    for (var i = 0; i < Looks.HOMES.length; i++) {
      var h = Looks.HOMES[i], lay = Looks.HOME_LAYOUT[h]
      homes[h] = { home: Sprites.home(h, 4), left: Sprites.decor(lay.left), right: Sprites.decor(lay.right) }
    }
    var stations = ({ classic: Sprites.wheel(40), torus: Sprites.stationTorus(70), spire: Sprites.stationSpire(),
      citadel: Sprites.stationCitadel() })
    thumbs = { planets: planets, homes: homes, stations: stations }
  }

  // ---------------------------------------------------------------- planet from a description

  property string aiStatus: ""
  property bool aiBusy: false

  Process {
    id: planetProc
    stdout: StdioCollector {
      onStreamFinished: {
        studio.aiBusy = false
        var r
        try { r = JSON.parse(String(text || "")) } catch (e) { studio.aiStatus = strings.t("studio.ai.failed"); return }
        if (!r || !r.planet) { studio.aiStatus = strings.t("studio.ai.failed"); return }
        studio.saveLook("planet", r.planet)
        studio.aiStatus = strings.t("studio.ai.done").arg(r.engine || "?").arg(String(r.planet.name || ""))
      }
    }
    onExited: function(code) { if (code !== 0 && studio.aiBusy) { studio.aiBusy = false; studio.aiStatus = strings.t("studio.ai.failed") } }
  }

  function describePlanet(text) {
    text = String(text || "").trim()
    if (!text || aiBusy || !sim) return
    aiBusy = true
    aiStatus = strings.t("studio.ai.working")
    var ai = cfg.ai || ({})
    planetProc.command = ["python3", sim.pluginPath("planet_ai.py"), "--engine", String(ai.engine || "auto"),
      "--ollama-url", String(ai.ollamaUrl || "http://127.0.0.1:11434"), "--ollama-model", String(ai.ollamaModel || ""),
      "--claude", ai.claude === true ? "on" : "off", "--claude-model", String(ai.claudeModel || ""), "--", text.slice(0, 300)]
    planetProc.running = true
  }

  // ---------------------------------------------------------------- window

  OverlayWindow {
    id: win
    shown: studio.opened
    WlrLayershell.namespace: "cosmos-studio"

    // The live scene of this screen, behind the card.
    SkyView {
      anchors.fill: parent
      sim: studio.sim
      screenName: win.targetScreen ? win.targetScreen.name : ""
      visible: !!studio.sim && studio.sim.layoutVersion > 0
    }

    MouseArea { anchors.fill: parent; onClicked: studio.close() }

    BorderSurface {
      id: card
      width: Math.min(Style.space(660), parent.width - Style.gapsOut * 4)
      anchors { right: parent.right; top: parent.top; bottom: parent.bottom; margins: Style.gapsOut * 2 }
      radius: Style.cornerRadius
      color: Commons.Color.menu.background
      borderSpec: Border.surfaceSpec("menu", "border", Commons.Color.menu.border, Math.max(1, Style.space(2)))
      padding: Style.spacing.panelPadding

      readonly property real innerW: width - contentLeftInset - contentRightInset

      MouseArea { anchors.fill: parent; onClicked: {} }

      // Escape closes from anywhere in the window, even while typing.
      Shortcut {
        sequence: "Escape"
        enabled: studio.opened
        onActivated: studio.close()
      }

      Item {
        id: keys
        anchors.fill: parent
        focus: true
        Keys.onPressed: function(event) {
          if (event.key === Qt.Key_Escape) { studio.close(); event.accepted = true }
          else if (event.key === Qt.Key_Z && (event.modifiers & Qt.ControlModifier)) { studio.undo(); event.accepted = true }
        }
      }

      // ------------------------------------------------ header + preview + tabs
      Column {
        id: head
        x: card.contentLeftInset; y: card.contentTopInset
        width: card.innerW
        spacing: Style.spacing.lg

        Item {
          width: parent.width; height: Math.max(titleCol.height, closeBtn.height)
          Column {
            id: titleCol
            spacing: Style.spacing.xxs
            Text {
              textFormat: Text.PlainText
              text: strings.t("studio.title")
              color: studio.fg
              font.family: Style.font.family; font.pixelSize: Math.round(Style.font.title * 1.25); font.bold: true
            }
            Text {
              textFormat: Text.PlainText
              text: strings.t("studio.subtitle")
              color: studio.fg; opacity: 0.6
              font.family: Style.font.family; font.pixelSize: Style.font.caption
            }
          }
          Button {
            id: closeBtn
            anchors.right: parent.right; anchors.verticalCenter: titleCol.verticalCenter
            text: strings.t("studio.close")
            bordered: true
            onClicked: studio.close()
          }
        }

        Diorama { width: parent.width; height: Style.space(190) }

        ButtonGroup {
          width: parent.width
          value: studio.tab
          options: [
            { value: "scene", label: strings.t("studio.tab.scene") },
            { value: "world", label: strings.t("studio.tab.world") },
            { value: "crew", label: strings.t("studio.tab.crew") },
            { value: "fleet", label: strings.t("studio.tab.fleet") }
          ]
          onChanged: function(v) { studio.tab = v; flick.contentY = 0 }
        }
      }

      // ------------------------------------------------ footer
      Item {
        id: foot
        x: card.contentLeftInset
        width: card.innerW
        height: undoBtn.height
        y: card.height - card.contentBottomInset - height
        Text {
          anchors.verticalCenter: parent.verticalCenter
          textFormat: Text.PlainText
          text: strings.t("studio.autosave")
          color: studio.fg; opacity: 0.55
          font.family: Style.font.family; font.pixelSize: Style.font.caption
        }
        Row {
          anchors.right: parent.right
          spacing: Style.spacing.md
          Button {
            id: undoBtn
            text: strings.t("studio.undo")
            bordered: true
            opacity: studio.history.length ? 1 : 0.4
            onClicked: studio.undo()
          }
          Button {
            text: studio.resetArmed ? strings.t("studio.resetConfirm") : strings.t("studio.resetAll")
            bordered: true
            foreground: studio.resetArmed ? Commons.Color.urgent : studio.fg
            onClicked: studio.resetAll()
          }
        }
      }

      // A comfortable wheel: about four lines per notch (Flickable's own is
      // slow). It takes no buttons, so clicks still reach the controls.
      MouseArea {
        z: 2
        x: flick.x; y: flick.y; width: flick.width; height: flick.height
        acceptedButtons: Qt.NoButton
        onWheel: function(wheel) {
          var max = Math.max(0, flick.contentHeight - flick.height)
          flick.contentY = Math.max(0, Math.min(max, flick.contentY - wheel.angleDelta.y / 120 * Style.space(72)))
        }
      }

      Flickable {
        id: flick
        x: card.contentLeftInset
        y: head.y + head.height + Style.spacing.lg
        width: card.innerW
        height: foot.y - y - Style.spacing.lg
        contentHeight: body.implicitHeight + Style.spacing.lg
        clip: true
        boundsBehavior: Flickable.StopAtBounds

        Column {
          id: body
          width: flick.width
          spacing: Style.spacing.lg

          // ------------------------------------------------ scene
          Column {
            visible: studio.tab === "scene"
            width: parent.width
            spacing: Style.spacing.md

            Header { text: strings.t("studio.section.motion") }
            SwitchRow { st: studio; key: "episodes"; label: strings.t("studio.episodes"); hint: strings.t("studio.hint.episodes") }
            SwitchRow { st: studio; key: "eventEpisodes"; label: strings.t("studio.eventEpisodes"); hint: strings.t("studio.hint.eventEpisodes"); enabledRow: !!studio.cfg.episodes }
            SliderRow {
              st: studio
              label: strings.t("studio.episodeEvery")
              minimum: 1; maximum: 15; step: 1
              value: Math.round((studio.cfg.episodeEvery ? studio.cfg.episodeEvery[0] : 120) / 60)
              valueText: strings.t("studio.minutes").arg(Math.round(liveValue))
              onCommit: function(v) { studio.save({ episodeEvery: [Math.round(v) * 60, Math.round(v) * 150] }) }
            }
            SwitchRow { st: studio; key: "comets"; label: strings.t("studio.comets") }
            SwitchRow { st: studio; key: "warp"; label: strings.t("studio.warp"); hint: strings.t("studio.hint.warp") }
            SwitchRow { st: studio; key: "dayCycle"; label: strings.t("studio.dayCycle") }
            SwitchRow { st: studio; key: "hourlyRocket"; label: strings.t("studio.hourlyRocket") }
            SwitchRow { st: studio; key: "throwRocks"; label: strings.t("studio.throwRocks"); hint: strings.t("studio.hint.throwRocks") }
            SwitchRow { st: studio; key: "weather"; label: strings.t("studio.weather"); hint: strings.t("studio.hint.weather") }

            Header { text: strings.t("studio.section.crowd") }
            SliderRow {
              st: studio
              label: strings.t("studio.rocks"); minimum: 0; maximum: 40; step: 1
              value: Number(studio.cfg.rocks) || 0; valueText: String(Math.round(liveValue))
              onCommit: function(v) { studio.save({ rocks: Math.round(v) }) }
            }
            SliderRow {
              st: studio
              label: strings.t("studio.cats"); minimum: 0; maximum: 8; step: 1
              value: Number(studio.cfg.cats) || 0; valueText: String(Math.round(liveValue))
              onCommit: function(v) { studio.save({ cats: Math.round(v) }) }
            }
            SliderRow {
              st: studio
              label: strings.t("studio.satellites"); minimum: 0; maximum: 8; step: 1
              value: Number(studio.cfg.satellites) || 0; valueText: String(Math.round(liveValue))
              onCommit: function(v) { studio.save({ satellites: Math.round(v) }) }
            }

            Header { text: strings.t("studio.section.screens") }
            SwitchRow { st: studio; key: "screensaver"; label: strings.t("studio.screensaver"); hint: strings.t("studio.hint.screensaver") }
            SwitchRow { st: studio; key: "marathon"; label: strings.t("studio.marathon"); enabledRow: !!studio.cfg.screensaver }
            SwitchRow { st: studio; key: "pauseOnFullscreen"; label: strings.t("studio.pauseOnFullscreen"); hint: strings.t("studio.hint.pause") }
            ChoiceRow {
              st: studio
              label: strings.t("studio.fps")
              hint: strings.t("studio.hint.fps")
              value: String(studio.cfg.fps >= 50 ? 60 : 30)
              options: [{ value: "30", label: strings.t("studio.fps30") }, { value: "60", label: strings.t("studio.fps60") }]
              onPicked: function(v) { studio.save({ fps: Number(v) }) }
            }
          }

          // ------------------------------------------------ home and planet
          Column {
            visible: studio.tab === "world"
            width: parent.width
            spacing: Style.spacing.md

            Header { text: strings.t("studio.section.home") }
            Grid {
              columns: 2
              spacing: Style.spacing.md
              Repeater {
                model: Looks.HOMES
                Tile {
                  id: homeTile
                  required property string modelData
                  st: studio
                  width: (card.innerW - Style.spacing.md) / 2
                  height: Style.space(112)
                  selected: studio.look.home === modelData
                  label: strings.t("studio.home." + modelData)
                  onPicked: studio.saveLook("home", modelData)
                  HomeThumb {
                    st: studio; home: homeTile.modelData
                    anchors.horizontalCenter: parent.horizontalCenter
                  }
                }
              }
            }

            Header { text: strings.t("studio.section.station") }
            Grid {
              columns: 2
              spacing: Style.spacing.md
              Repeater {
                model: Looks.STATIONS
                Tile {
                  id: stationTile
                  required property string modelData
                  st: studio
                  width: (card.innerW - Style.spacing.md) / 2
                  height: Style.space(112)
                  selected: studio.look.station === modelData
                  label: strings.t("studio.station." + modelData)
                  onPicked: studio.saveLook("station", modelData)
                  PixelSprite {
                    readonly property var art: studio.thumbs ? studio.thumbs.stations[stationTile.modelData] : null
                    anchors.horizontalCenter: parent.horizontalCenter
                    anchors.top: parent.top; anchors.topMargin: Style.space(8)
                    sprite: art
                    px: art ? Math.min(1, Style.space(72) / art.h) : 1
                  }
                }
              }
            }

            Header { text: strings.t("studio.section.planet") }
            Grid {
              columns: 3
              spacing: Style.spacing.md
              Repeater {
                model: Object.keys(Looks.PLANETS)
                Tile {
                  id: planetTile
                  required property string modelData
                  st: studio
                  width: (card.innerW - Style.spacing.md * 2) / 3
                  height: Style.space(96)
                  selected: studio.look.planet.preset === modelData
                  label: strings.t("studio.planet." + modelData)
                  onPicked: studio.saveLook("planet", { preset: modelData })
                  PixelSprite {
                    anchors.centerIn: parent; anchors.verticalCenterOffset: -Style.space(8)
                    sprite: studio.thumbs ? studio.thumbs.planets[planetTile.modelData] : null
                    px: 1
                  }
                }
              }
            }
            Text {
              visible: studio.look.planet.preset === "custom"
              width: parent.width; wrapMode: Text.WordWrap
              textFormat: Text.PlainText
              text: strings.t("studio.customPlanet").arg(studio.look.planet.name)
              color: studio.accent
              font.family: Style.font.family; font.pixelSize: Style.font.body
            }
            SwitchRow {
              st: studio
              label: strings.t("studio.rings")
              checked: studio.look.planet.rings
              onFlip: {
                var p = JSON.parse(JSON.stringify(studio.look.planet))
                p.rings = !p.rings
                studio.saveLook("planet", p)
              }
            }

            Header { text: strings.t("studio.section.describe") }
            Text {
              width: parent.width; wrapMode: Text.WordWrap
              textFormat: Text.PlainText
              text: strings.t("studio.describeHint")
              color: studio.fg; opacity: 0.7
              font.family: Style.font.family; font.pixelSize: Style.font.caption
            }
            TextField {
              id: describe
              width: parent.width
              placeholderText: strings.t("studio.describePlaceholder")
              maximumLength: 300
              enabled: !studio.aiBusy
              onAccepted: studio.describePlanet(text)
            }
            Row {
              spacing: Style.spacing.md
              Button {
                text: studio.aiBusy ? strings.t("studio.ai.busy") : strings.t("studio.ai.create")
                bordered: true
                onClicked: studio.describePlanet(describe.text)
              }
              Dropdown {
                width: Style.space(210)
                showLabel: false
                value: String((studio.cfg.ai && studio.cfg.ai.engine) || "auto")
                options: [
                  { value: "auto", label: strings.t("studio.ai.auto") },
                  { value: "ollama", label: "Ollama" },
                  { value: "claude", label: "Claude" },
                  { value: "offline", label: strings.t("studio.ai.offline") }
                ]
                onChanged: function(v) {
                  var ai = JSON.parse(JSON.stringify(studio.cfg.ai || {}))
                  ai.engine = v
                  if (v === "claude") ai.claude = true
                  studio.save({ ai: ai })
                }
              }
            }
            Text {
              visible: studio.aiStatus !== ""
              width: parent.width; wrapMode: Text.WordWrap
              textFormat: Text.PlainText
              text: studio.aiStatus
              color: studio.accent
              font.family: Style.font.family; font.pixelSize: Style.font.body
            }
            SwitchRow {
              st: studio
              label: strings.t("studio.ai.claude")
              hint: strings.t("studio.ai.claudeHint")
              checked: !!(studio.cfg.ai && studio.cfg.ai.claude)
              onFlip: {
                var ai = JSON.parse(JSON.stringify(studio.cfg.ai || {}))
                ai.claude = !ai.claude
                if (!ai.claude && ai.engine === "claude") ai.engine = "auto"
                studio.save({ ai: ai })
              }
            }
          }

          // ------------------------------------------------ crew colours
          Column {
            visible: studio.tab === "crew"
            width: parent.width
            spacing: Style.spacing.md

            // Close-up portraits, in the colours chosen below.
            Rectangle {
              width: parent.width; height: Style.space(124)
              radius: Style.cornerRadius
              color: Qt.rgba(1, 1, 1, 0.04)
              Row {
                anchors.centerIn: parent
                spacing: Style.space(30)
                Portrait { sprite: studio.sprites.astronaut || null; label: strings.t("studio.section.astronaut") }
                Portrait { sprite: studio.sprites.catSit || null; label: strings.t("studio.section.cat") }
                Portrait { sprite: studio.sprites.dog || null; label: strings.t("studio.section.dog") }
                Portrait { sprite: studio.sprites.shuttle || null; label: strings.t("studio.section.shuttle"); px: 4 }
              }
            }

            Header { text: strings.t("studio.section.astronaut") }
            ColorRow { st: studio; part: "astronaut"; field: "suit"; label: strings.t("studio.color.suit") }
            ColorRow { st: studio; part: "astronaut"; field: "visor"; label: strings.t("studio.color.visor") }
            ColorRow { st: studio; part: "astronaut"; field: "accent"; label: strings.t("studio.color.accent") }
            Header { text: strings.t("studio.section.cat") }
            ColorRow { st: studio; part: "cat"; field: "fur"; label: strings.t("studio.color.fur") }
            ColorRow { st: studio; part: "cat"; field: "stripes"; label: strings.t("studio.color.stripes") }
            Header { text: strings.t("studio.section.dog") }
            ColorRow { st: studio; part: "dog"; field: "fur"; label: strings.t("studio.color.fur") }
            ColorRow { st: studio; part: "dog"; field: "spots"; label: strings.t("studio.color.spots") }
            ColorRow { st: studio; part: "dog"; field: "collar"; label: strings.t("studio.color.collar") }
            Header { text: strings.t("studio.section.shuttle") }
            ColorRow { st: studio; part: "shuttle"; field: "hull"; label: strings.t("studio.color.hull") }
            ColorRow { st: studio; part: "shuttle"; field: "stripe"; label: strings.t("studio.color.stripe") }
            Button {
              text: strings.t("studio.resetColors")
              bordered: true
              onClicked: studio.save({ look: { astronaut: null, cat: null, dog: null, shuttle: null } })
            }
          }

          // ------------------------------------------------ agent fleet
          Column {
            visible: studio.tab === "fleet"
            width: parent.width
            spacing: Style.spacing.md

            Text {
              width: parent.width; wrapMode: Text.WordWrap
              textFormat: Text.PlainText
              text: strings.t("studio.fleetHint")
              color: studio.fg; opacity: 0.7
              font.family: Style.font.family; font.pixelSize: Style.font.caption
            }
            SwitchRow { st: studio; key: "fleet"; label: strings.t("studio.fleet") }
            SwitchRow { st: studio; key: "hub"; label: strings.t("studio.hub"); enabledRow: !!studio.cfg.fleet }
            Rectangle {
              width: parent.width; height: Style.space(70)
              radius: Style.cornerRadius
              color: Qt.rgba(1, 1, 1, 0.04)
              Row {
                anchors.centerIn: parent
                spacing: Style.space(40)
                Repeater {
                  model: ["claude", "codex", "copilot", "local"]
                  PixelSprite {
                    required property string modelData
                    sprite: studio.sprites.ships ? studio.sprites.ships[modelData] : null
                    px: 3
                  }
                }
              }
            }
            Header { text: strings.t("studio.section.ships") }
            ColorRow { st: studio; part: "ships"; field: "claude"; label: "Claude"; clearable: true }
            ColorRow { st: studio; part: "ships"; field: "codex"; label: "Codex"; clearable: true }
            ColorRow { st: studio; part: "ships"; field: "copilot"; label: "Copilot"; clearable: true }
            ColorRow { st: studio; part: "ships"; field: "local"; label: strings.t("studio.localModel"); clearable: true }
          }
        }
      }
    }
  }

  // ---------------------------------------------------------------- pieces

  // The preview: the planet and the home with its characters, as they are.
  component Diorama: Rectangle {
    id: dio
    radius: Style.cornerRadius
    clip: true
    gradient: Gradient {
      GradientStop { position: 0; color: "#05040f" }
      GradientStop { position: 1; color: "#1a1236" }
    }
    // A few fixed stars.
    Repeater {
      model: 40
      Rectangle {
        required property int index
        width: index % 7 === 0 ? 2 : 1; height: width
        x: (index * 97 % 1000) / 1000 * dio.width
        y: (index * 61 % 1000) / 1000 * dio.height
        color: "#dfe8ff"; opacity: 0.3 + (index % 5) * 0.12
      }
    }
    property real t: 0
    NumberAnimation on t { from: 0; to: Math.PI * 2; duration: 6000; loops: Animation.Infinite; running: studio.opened }

    PixelSprite {
      sprite: studio.sprites.planet || null
      px: sprite ? Math.min(1, (dio.height - 24) / sprite.h) : 1
      x: dio.width * 0.26 - width / 2
      y: (dio.height - height) / 2 + Math.sin(dio.t) * 2
    }

    // The home at px 2, laid out as Castaway.qml lays it out at px 4.
    Item {
      id: dHome
      readonly property real k: 0.5
      width: 384 * k; height: 160 * k
      x: dio.width * 0.68 - width / 2
      // A round home is tall: lift it so its top, where everyone stands, shows.
      y: dio.height * (studio.look.home === "planetoid" ? 0.36 : 0.52) - Math.round(Math.sin(dio.t) * 2)
      readonly property real surface: 32 * k
      function g(x) { var r = Looks.ground(studio.look.home, x); return { dy: r.dy * k, rot: r.rot } }

      PixelSprite { sprite: studio.sprites.home || null; px: 2; x: dHome.width / 2 - width / 2 }
      PixelSprite {
        readonly property var gr: dHome.g(56)
        sprite: studio.sprites.decoLeft || null; px: 2
        x: 56 * dHome.k - width / 2; y: dHome.surface - height + 3 + gr.dy
        rotation: gr.rot; transformOrigin: Item.Bottom
      }
      PixelSprite {
        readonly property var gr: dHome.g(308)
        sprite: studio.sprites.decoRight || null; px: 2
        x: 308 * dHome.k - width / 2; y: dHome.surface - height + 3 + gr.dy
        rotation: gr.rot; transformOrigin: Item.Bottom
      }
      PixelSprite {
        readonly property var gr: dHome.g(226)
        sprite: studio.sprites.fire ? studio.sprites.fire[Math.floor(dio.t * 6) % 3] : null; px: 2
        x: 216 * dHome.k; y: dHome.surface - height + 2 + gr.dy
        rotation: gr.rot; transformOrigin: Item.Bottom
      }
      PixelSprite {
        readonly property var gr: dHome.g(114)
        sprite: studio.sprites.dog || null; px: 2
        x: 92 * dHome.k; y: dHome.surface - height + 2 + gr.dy
        rotation: gr.rot; transformOrigin: Item.Bottom
      }
      PixelSprite {
        readonly property var gr: dHome.g(174)
        sprite: studio.sprites.astronaut || null; px: 2
        x: 150 * dHome.k; y: dHome.surface - height + 2 + gr.dy
        rotation: gr.rot; transformOrigin: Item.Bottom
      }
      PixelSprite {
        readonly property var gr: dHome.g(258)
        sprite: studio.sprites.catSit || null; px: 2
        x: 240 * dHome.k; y: dHome.surface - height + 2 + gr.dy
        rotation: gr.rot; transformOrigin: Item.Bottom
      }
    }
    PixelSprite {
      sprite: studio.sprites.shuttle || null; px: 2
      x: dio.width * 0.55 + Math.cos(dio.t) * 30
      y: dio.height * 0.14 + Math.sin(dio.t * 2) * 4
    }
    Text {
      anchors { left: parent.left; bottom: parent.bottom; margins: Style.spacing.md }
      textFormat: Text.PlainText
      text: studio.look.planet.name + "  ·  " + strings.t("studio.home." + studio.look.home)
      color: "#dfe8ff"; opacity: 0.75
      font.family: Style.font.family; font.pixelSize: Style.font.caption
    }
  }

  component Header: Text {
    textFormat: Text.PlainText
    color: Commons.Color.accent
    font.family: Style.font.family; font.pixelSize: Style.font.caption; font.bold: true
    font.capitalization: Font.AllUppercase
    font.letterSpacing: 1
    topPadding: Style.spacing.sm
  }

  component Portrait: Column {
    id: por
    property var sprite: null
    property string label: ""
    property real px: 5
    spacing: Style.spacing.sm
    Item {
      anchors.horizontalCenter: parent.horizontalCenter
      width: Math.max(Style.space(64), pic.width); height: Style.space(80)
      PixelSprite { id: pic; anchors.centerIn: parent; sprite: por.sprite; px: por.px }
    }
    Text {
      anchors.horizontalCenter: parent.horizontalCenter
      textFormat: Text.PlainText
      text: por.label
      color: Commons.Color.menu.text; opacity: 0.7
      font.family: Style.font.family; font.pixelSize: Style.font.caption
    }
  }

  // A selectable card with a picture (its children) and a name.
  component Tile: Rectangle {
    id: tile
    required property var st
    property bool selected: false
    property string label: ""
    signal picked()
    radius: Style.cornerRadius
    color: selected ? Qt.rgba(st.accent.r, st.accent.g, st.accent.b, 0.16)
      : (hover.containsMouse ? Qt.rgba(1, 1, 1, 0.07) : Qt.rgba(1, 1, 1, 0.03))
    border.width: selected ? 2 : 1
    border.color: selected ? st.accent : Qt.rgba(1, 1, 1, 0.12)
    clip: true
    // The name on a small dark pill, so it reads over any picture.
    Rectangle {
      z: 2
      anchors { horizontalCenter: parent.horizontalCenter; bottom: parent.bottom; bottomMargin: Style.spacing.sm }
      width: tileName.implicitWidth + Style.spacing.lg * 2; height: tileName.implicitHeight + Style.spacing.xs * 2
      radius: height / 2
      color: Qt.rgba(0.02, 0.02, 0.06, 0.78)
      Text {
        id: tileName
        anchors.centerIn: parent
        textFormat: Text.PlainText
        text: tile.label
        color: tile.selected ? tile.st.accent : Commons.Color.menu.text
        font.family: Style.font.family; font.pixelSize: Style.font.caption; font.bold: tile.selected
      }
    }
    MouseArea {
      id: hover
      anchors.fill: parent
      hoverEnabled: true
      cursorShape: Qt.PointingHandCursor
      onClicked: tile.picked()
    }
  }

  // A home thumbnail: ground plus its two landmarks, laid out like
  // Castaway.qml (px 4) at a smaller pixel; a round home sits on its curve.
  component HomeThumb: Item {
    id: ht
    required property var st
    property string home: "island"
    readonly property var t: st.thumbs ? st.thumbs.homes[home] : null
    readonly property real p: home === "planetoid" ? 1.05 : 1.6
    readonly property real k: p / 4
    readonly property real topY: home === "planetoid" ? 22 : 18
    readonly property real surface: topY + 8 * p
    function g(x) { var r = Looks.ground(home, x); return { dy: r.dy * k, rot: r.rot } }
    width: 96 * 1.6; height: 70
    PixelSprite {
      sprite: ht.t ? ht.t.home : null; px: ht.p
      x: ht.width / 2 - width / 2; y: ht.topY
    }
    PixelSprite {
      readonly property var gr: ht.g(56)
      sprite: ht.t ? ht.t.left : null; px: ht.p
      x: ht.width / 2 + (56 - 192) * ht.k - width / 2; y: ht.surface - height + 1.5 * ht.p + gr.dy
      rotation: gr.rot; transformOrigin: Item.Bottom
    }
    PixelSprite {
      readonly property var gr: ht.g(308)
      sprite: ht.t ? ht.t.right : null; px: ht.p
      x: ht.width / 2 + (308 - 192) * ht.k - width / 2; y: ht.surface - height + 1.5 * ht.p + gr.dy
      rotation: gr.rot; transformOrigin: Item.Bottom
    }
  }

  // A labelled switch bound to a config key (or to `checked` + onFlip).
  component SwitchRow: Item {
    id: row
    required property var st
    property string key: ""
    property string label: ""
    property string hint: ""
    property bool checked: key ? !!st.cfg[key] : false
    property bool enabledRow: true
    signal flip()
    width: parent ? parent.width : 0
    height: Math.max(sw.height, texts.height)
    opacity: enabledRow ? 1 : 0.45
    Column {
      id: texts
      anchors { left: parent.left; right: sw.left; rightMargin: Style.spacing.lg; verticalCenter: parent.verticalCenter }
      spacing: Style.spacing.xxs
      Text {
        width: parent.width
        textFormat: Text.PlainText
        text: row.label
        wrapMode: Text.WordWrap
        color: Commons.Color.menu.text
        font.family: Style.font.family; font.pixelSize: Style.font.body
      }
      Text {
        visible: row.hint !== ""
        width: parent.width
        textFormat: Text.PlainText
        text: row.hint
        wrapMode: Text.WordWrap
        color: Commons.Color.menu.text; opacity: 0.55
        font.family: Style.font.family; font.pixelSize: Style.font.caption
      }
    }
    // A clear on/off switch: accent track and knob on the right when on.
    Rectangle {
      id: sw
      anchors { right: parent.right; verticalCenter: parent.verticalCenter }
      width: Style.space(42); height: Style.space(22); radius: height / 2
      color: row.checked ? Commons.Color.accent : Qt.rgba(1, 1, 1, 0.14)
      border.width: 1
      border.color: row.checked ? Qt.lighter(Commons.Color.accent, 1.2) : Qt.rgba(1, 1, 1, 0.22)
      Behavior on color { ColorAnimation { duration: Style.duration(140) } }
      Rectangle {
        width: parent.height - Style.space(6); height: width; radius: width / 2
        anchors.verticalCenter: parent.verticalCenter
        x: row.checked ? parent.width - width - Style.space(3) : Style.space(3)
        color: row.checked ? "#ffffff" : Qt.rgba(1, 1, 1, 0.6)
        Behavior on x { NumberAnimation { duration: Style.duration(140); easing.type: Easing.OutCubic } }
      }
      MouseArea {
        anchors.fill: parent
        anchors.margins: -Style.space(4)
        enabled: row.enabledRow
        cursorShape: Qt.PointingHandCursor
        onClicked: {
          if (row.key) { var p = ({}); p[row.key] = !row.checked; row.st.save(p) }
          else row.flip()
        }
      }
    }

  }

  // A labelled slider that saves when let go; the number follows the knob.
  component SliderRow: Column {
    id: srow
    required property var st
    property string label: ""
    property string valueText: ""
    property alias minimum: sl.minimum
    property alias maximum: sl.maximum
    property alias step: sl.step
    property real value: 0
    readonly property real liveValue: sl.liveValue
    signal commit(real v)
    width: parent ? parent.width : 0
    spacing: Style.spacing.sm
    Item {
      width: parent.width; height: t1.implicitHeight
      Text {
        id: t1
        textFormat: Text.PlainText
        text: srow.label
        color: Commons.Color.menu.text
        font.family: Style.font.family; font.pixelSize: Style.font.body
      }
      Text {
        anchors.right: parent.right
        textFormat: Text.PlainText
        text: srow.valueText
        color: Commons.Color.accent
        font.family: Style.font.family; font.pixelSize: Style.font.body; font.bold: true
      }
    }
    PanelSlider {
      id: sl
      width: parent.width
      height: Math.round(Style.spacing.controlHeight * 0.7)
      value: srow.value
      integer: true
      fillColor: Commons.Color.accent
      knobColor: Commons.Color.menu.text
      trackColor: Qt.rgba(1, 1, 1, 0.12)
      onReleased: function(v) { srow.commit(v) }
    }
  }

  // One choice out of a few, as a row of buttons.
  component ChoiceRow: Column {
    id: crow
    required property var st
    property string label: ""
    property string hint: ""
    property string value: ""
    property var options: []
    signal picked(string v)
    width: parent ? parent.width : 0
    spacing: Style.spacing.sm
    Text {
      visible: crow.label !== ""
      textFormat: Text.PlainText
      text: crow.label
      color: Commons.Color.menu.text
      font.family: Style.font.family; font.pixelSize: Style.font.body
    }
    Text {
      visible: crow.hint !== ""
      width: parent.width; wrapMode: Text.WordWrap
      textFormat: Text.PlainText
      text: crow.hint
      color: Commons.Color.menu.text; opacity: 0.55
      font.family: Style.font.family; font.pixelSize: Style.font.caption
    }
    ButtonGroup {
      value: crow.value
      options: crow.options
      onChanged: function(v) { crow.picked(v) }
    }
  }

  // A colour for one part of one character: swatches, or any #rrggbb.
  component ColorRow: Column {
    id: colrow
    required property var st
    property string part: ""
    property string field: ""
    property string label: ""
    property bool clearable: false
    readonly property string current: st.look[part] ? String(st.look[part][field] || "") : ""
    function pick(c) { var v = ({}); v[field] = c; st.saveLook(part, v) }
    width: parent ? parent.width : 0
    spacing: Style.spacing.sm
    Row {
      spacing: Style.spacing.md
      Rectangle {
        anchors.verticalCenter: parent.verticalCenter
        width: Style.space(14); height: width; radius: Style.space(3)
        color: colrow.current || "transparent"
        border.width: 1; border.color: Qt.rgba(1, 1, 1, 0.35)
      }
      Text {
        anchors.verticalCenter: parent.verticalCenter
        textFormat: Text.PlainText
        text: colrow.label
        color: Commons.Color.menu.text
        font.family: Style.font.family; font.pixelSize: Style.font.body
      }
      Text {
        anchors.verticalCenter: parent.verticalCenter
        textFormat: Text.PlainText
        text: colrow.current || colrow.st.autoLabel
        color: Commons.Color.menu.text; opacity: 0.45
        font.family: Style.font.family; font.pixelSize: Style.font.caption
      }
      // Back to the automatic colour (ships follow their agent's colour).
      Text {
        visible: colrow.clearable && colrow.current !== ""
        anchors.verticalCenter: parent.verticalCenter
        textFormat: Text.PlainText
        text: "↺ " + colrow.st.useAutoLabel
        color: Commons.Color.accent
        font.family: Style.font.family; font.pixelSize: Style.font.caption; font.underline: autoMouse.containsMouse
        MouseArea {
          id: autoMouse
          anchors.fill: parent
          anchors.margins: -Style.space(4)
          hoverEnabled: true
          cursorShape: Qt.PointingHandCursor
          onClicked: colrow.pick("")
        }
      }
    }
    Flow {
      width: parent.width
      spacing: Style.space(6)
      Repeater {
        model: colrow.st.swatches
        Rectangle {
          required property string modelData
          width: Style.space(22); height: width; radius: width / 2
          color: modelData
          border.width: colrow.current === modelData ? Style.space(3) : 1
          border.color: colrow.current === modelData ? Commons.Color.accent : Qt.rgba(1, 1, 1, 0.25)
          scale: swatchMouse.containsMouse ? 1.15 : 1
          MouseArea {
            id: swatchMouse
            anchors.fill: parent
            hoverEnabled: true
            cursorShape: Qt.PointingHandCursor
            onClicked: colrow.pick(parent.modelData)
          }
        }
      }
      TextField {
        width: Style.space(96)
        height: Style.space(22)
        topPadding: 0; bottomPadding: 0
        placeholderText: "#rrggbb"
        maximumLength: 7
        font.pixelSize: Style.font.caption
        onAccepted: {
          var v = text.trim()
          if (v.charAt(0) !== "#") v = "#" + v
          if (/^#[0-9a-fA-F]{6}$/.test(v)) { colrow.pick(v.toLowerCase()); text = "" }
        }
      }
    }
  }
}
