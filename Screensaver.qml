import QtQuick
import Quickshell
import Quickshell.Io
import Quickshell.Wayland
import qs.Commons
import qs.Commons as Commons
import "episodes.js" as Episodes

// Cosmos screensaver: after Omarchy's own idle.screensaver delay, the whole
// scene fills every screen above all windows, with a clock. Any activity
// ends it. Idle inhibitors (a playing video, game mode) keep it away, and it
// steps aside once the session is locked.
Item {
  id: saver

  property var sim: null
  property int timeoutSeconds: 150
  property bool locked: false
  // `omarchy-shell lnavarrocarter.cosmos preview` shows it now, until the mouse moves.
  property bool forced: false
  // Showcase: the scene over every window, without the clock, for recording
  // demos. Moving the mouse does not end it; a click or `stop` does.
  property bool showcase: false

  readonly property bool wanted: !!sim && sim.cfg.enabled && sim.cfg.screensaver && timeoutSeconds > 0
  readonly property bool active: (wanted && idle.isIdle && !locked) || forced

  Commons.Translations { id: strings; directory: Qt.resolvedUrl("i18n") }

  // Same delay as Omarchy's screensaver setting.
  FileView {
    path: Quickshell.env("HOME") + "/.config/omarchy/shell.json"
    watchChanges: true
    onFileChanged: reload()
    onLoaded: {
      try {
        var d = JSON.parse(text())
        var v = d && d.idle ? Number(d.idle.screensaver) : NaN
        saver.timeoutSeconds = isFinite(v) && v > 0 ? Math.round(v) : 0
      } catch (e) {
        saver.timeoutSeconds = 150
      }
    }
  }

  IpcHandler {
    target: "lnavarrocarter.cosmos"
    function preview(): void { saver.showcase = false; saver.forced = true; previewTimer.interval = 30000; previewTimer.restart() }
    function stop(): void { saver.forced = false; saver.showcase = false }
    function showcase(seconds: int): void {
      saver.showcase = true; saver.forced = true
      previewTimer.interval = Math.max(5, Math.min(600, seconds || 60)) * 1000
      previewTimer.restart()
    }
    function rocket(): void { saver.sim.launchRocket() }
    function episode(name: string): string { return saver.sim.startEpisode(name === "random" ? "" : name) ? saver.sim.episode : "unavailable" }
    function episodes(): string { return Episodes.ids().join(" ") }
    function studio(): void { saver.sim.toggleStudio() }
    function studioTab(tab: string): void { saver.sim.openStudio(["scene", "world", "crew", "fleet"].indexOf(tab) >= 0 ? tab : "scene") }
    function planet(description: string): string { saver.sim.describePlanet(description); return "creating" }
    function status(): string {
      var s = saver.sim
      return JSON.stringify({ version: s.manifest ? s.manifest.version : "", episode: s.episode || "",
        zones: s.zones.map(function(z) { return z.name + ":" + z.kind }), weather: s.weather,
        fleet: !!s.cfg.fleet, hub: !!s.cfg.hub, coordination: s.hasCoordination, workbench: s.hasWorkbench })
    }
    function event(name: string): string { return saver.sim.demoEvent(name) || "unavailable" }
    function click(who: string): string { return saver.sim.clickCharacter(who) || "busy" }
  }

  Timer { id: previewTimer; interval: 30000; onTriggered: { saver.forced = false; saver.showcase = false } }

  IdleMonitor {
    id: idle
    enabled: saver.wanted
    timeout: Math.max(1, saver.timeoutSeconds)
    respectInhibitors: true
    onIsIdleChanged: if (!isIdle) saver.locked = false
  }

  Process {
    id: lockProc
    command: ["omarchy-shell", "lock", "isLocked"]
    stdout: StdioCollector { onStreamFinished: saver.locked = String(text || "").trim() === "true" }
  }

  Timer {
    interval: 3000
    repeat: true
    running: saver.wanted && idle.isIdle
    triggeredOnStart: true
    onTriggered: if (!lockProc.running) lockProc.running = true
  }

  property date now: new Date()
  Timer {
    interval: 1000
    repeat: true
    running: saver.active
    triggeredOnStart: true
    onTriggered: saver.now = new Date()
  }

  Variants {
    model: saver.active ? saver.sim.usedScreens : []

    PanelWindow {
      id: win
      required property var modelData
      screen: modelData
      color: "#03040c"
      anchors { top: true; bottom: true; left: true; right: true }
      exclusionMode: ExclusionMode.Ignore
      WlrLayershell.layer: WlrLayer.Overlay
      WlrLayershell.namespace: "cosmos-saver"
      WlrLayershell.keyboardFocus: WlrKeyboardFocus.None

      // In preview, moving the mouse (after a moment) ends it.
      MouseArea {
        anchors.fill: parent
        hoverEnabled: true
        z: 10
        property point start: Qt.point(-1, -1)
        property real since: Date.now()
        onPositionChanged: function(mouse) {
          if (!saver.forced || saver.showcase || Date.now() - since < 1500) return
          if (start.x < 0) { start = Qt.point(mouse.x, mouse.y); return }
          if (Math.abs(mouse.x - start.x) + Math.abs(mouse.y - start.y) > 12) saver.forced = false
        }
        onPressed: { saver.forced = false; saver.showcase = false }
      }

      Item {
        anchors.fill: parent
        opacity: 0
        Component.onCompleted: opacity = 1
        Behavior on opacity { NumberAnimation { duration: Style.duration(1200); easing.type: Easing.OutCubic } }

        SkyView {
          anchors.fill: parent
          sim: saver.sim
          screenName: win.modelData.name
        }

        // Clock, with a soft glow in the theme accent.
        Column {
          visible: !saver.showcase
          anchors.horizontalCenter: parent.horizontalCenter
          y: parent.height * 0.12
          spacing: 6

          Item {
            anchors.horizontalCenter: parent.horizontalCenter
            width: clock.implicitWidth; height: clock.implicitHeight
            Text {
              x: 0; y: 4
              textFormat: Text.PlainText
              text: clock.text
              font: clock.font
              color: Color.accent
              opacity: 0.45
            }
            Text {
              id: clock
              textFormat: Text.PlainText
              text: Qt.locale(Commons.I18n.formatLocale).toString(saver.now, "HH:mm")
              font.family: "monospace"
              font.bold: true
              font.pixelSize: Math.round(win.height * 0.13)
              color: "#f3f2ff"
            }
          }
          Text {
            anchors.horizontalCenter: parent.horizontalCenter
            textFormat: Text.PlainText
            text: Qt.locale(Commons.I18n.formatLocale).toString(saver.now, "dddd d MMMM")
            font.family: "monospace"
            font.pixelSize: Math.round(win.height * 0.028)
            color: "#c9d4ff"
            opacity: 0.8
          }
        }

        Text {
          visible: !saver.showcase
          anchors.horizontalCenter: parent.horizontalCenter
          anchors.bottom: parent.bottom
          anchors.bottomMargin: parent.height * 0.04
          textFormat: Text.PlainText
          text: strings.t("saver.hint")
          font.family: "monospace"
          font.pixelSize: Math.round(win.height * 0.016)
          color: "#9d9ac4"
          opacity: 0.6
        }
      }
    }
  }
}
