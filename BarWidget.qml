import QtQuick
import Quickshell
import qs.Ui
import qs.Commons
import qs.Commons as Commons
import "fleet.js" as Fleet

// Cosmos in the bar. With the agent fleet on: a fleet light (missions
// running, waiting for you) and one small fuel tank per agent; a click opens
// Coordination when it is installed. With the fleet off: a star that plays
// an episode when clicked. It reads the running Cosmos service, so it adds
// no probes of its own.
BarWidget {
  id: root
  moduleName: "lnavarrocarter.cosmos"

  // The plugin's own running service, through the scoped shell API the bar
  // hands every widget. It can start after the widget, so look until found.
  property var service: null
  function findService() {
    if (!service && bar && bar.shell && typeof bar.shell.serviceFor === "function")
      service = bar.shell.serviceFor("lnavarrocarter.cosmos")
  }
  onBarChanged: findService()
  Component.onCompleted: findService()
  Timer {
    interval: 1000
    repeat: true
    running: !root.service
    onTriggered: root.findService()
  }

  Commons.Translations { id: strings; directory: Qt.resolvedUrl("i18n") }

  readonly property var fleet: service ? (service.fleetVersion, service.fleetData) : null
  readonly property var ships: service ? (service.fleetVersion, service.ships) : ({})
  readonly property var budgets: service && service.cfg ? service.cfg.budgets : ({})
  readonly property bool fleetOn: !!service && !!service.cfg && !!service.cfg.fleet

  function info(agent) {
    return fleet && fleet.agents && fleet.agents[agent] ? fleet.agents[agent] : { tokens_today: 0, prompts_today: 0 }
  }
  function fuel(agent) { return Fleet.fuel(agent, info(agent).tokens_today || 0, budgets) }
  function countMode(mode) {
    var n = 0
    for (var i = 0; i < Fleet.AGENTS.length; i++) {
      var s = ships[Fleet.AGENTS[i]]
      if (s && s.mode === mode) n++
    }
    return n
  }

  readonly property int missions: countMode("mission")
  readonly property int waiting: countMode("waiting")
  readonly property int patrolling: countMode("patrol")

  readonly property color lightColor: waiting > 0 ? Commons.Color.urgent
    : missions > 0 ? Commons.Color.accent
    : patrolling > 0 ? "#58c8ff" : button.foreground

  function tooltip() {
    var w = service ? service.weather : null
    if (!fleetOn) {
      var scene = [strings.t("bar.scene")]
      if (w) scene.push(strings.t("bar.weather").arg(w.cpu).arg(w.ram).arg(w.gpu < 0 ? "-" : w.gpu))
      scene.push(strings.t("bar.clickEpisode"))
      scene.push(strings.t("bar.studioHint"))
      return scene.join("\n")
    }
    var lines = [strings.t("bar.title")]
    if (missions) lines.push(strings.tn("bar.missions", missions).arg(missions))
    if (waiting) lines.push(strings.tn("bar.waiting", waiting).arg(waiting))
    if (!missions && !waiting) lines.push(strings.t("bar.calm"))
    for (var i = 0; i < Fleet.AGENTS.length; i++) {
      var a = Fleet.AGENTS[i]
      var fuelText = a === "local" ? strings.t("bar.solar") : Math.round(fuel(a) * 100) + "%"
      lines.push(strings.t("bar.agentLine").arg(Fleet.LABELS[a]).arg(fuelText).arg(Fleet.shortNumber(info(a).tokens_today || 0)))
    }
    if (w) lines.push(strings.t("bar.weather").arg(w.cpu).arg(w.ram).arg(w.gpu < 0 ? "-" : w.gpu))
    lines.push(strings.t(service.canOpen("local.coordination") ? "bar.click" : "bar.clickEpisode"))
    lines.push(strings.t("bar.studioHint"))
    return lines.join("\n")
  }

  implicitWidth: vertical ? barSize : content.implicitWidth + 14
  implicitHeight: vertical ? content.implicitHeight + 12 : barSize

  WidgetButton {
    id: button
    anchors.fill: parent
    bar: root.bar
    text: ""
    // The icon is drawn by the Grid below, not by the button's own text: say
    // so, or WidgetButton hides itself (and its hover, tooltip and clicks).
    hasVisualContent: true
    tooltipText: root.service ? root.tooltip() : strings.t("bar.off")
    onPressed: function(button) {
      if (!root.service) return
      // Right click: Cosmos Studio, to make the scene your own.
      if (button === Qt.RightButton) { root.service.openStudio(); return }
      root.service.openPanel(root.fleetOn && root.service.canOpen("local.coordination") ? "local.coordination" : "episode")
    }

  }

  // Drawn over the button so the button keeps hover and tooltip handling.
  Grid {
    id: content
    anchors.centerIn: parent
    columns: root.vertical || !root.fleetOn ? 1 : 2
    spacing: 4
    horizontalItemAlignment: Grid.AlignHCenter
    verticalItemAlignment: Grid.AlignVCenter

    // Fleet light: a little ship glyph that glows with the fleet's state.
    Item {
      width: 14; height: 14
      Rectangle {
        anchors.centerIn: parent
        width: 14; height: 14; radius: 7
        color: root.lightColor
        opacity: root.waiting > 0 ? (blink.on ? 0.45 : 0.1) : (root.missions > 0 ? 0.28 : 0)
      }
      Text {
        anchors.centerIn: parent
        textFormat: Text.PlainText
        text: root.fleetOn ? "▲" : "✦"
        rotation: root.missions > 0 ? 45 : 0
        font.pixelSize: 10
        color: root.lightColor
      }
    }

    // One fuel tank per agent, in its color; Qwen runs on solar.
    Row {
      visible: root.fleetOn
      spacing: 2
      Repeater {
        model: Fleet.AGENTS
        Item {
          required property string modelData
          readonly property real level: root.fuel(modelData)
          readonly property var ship: root.ships[modelData] || null
          width: 4; height: 14
          Rectangle { anchors.fill: parent; radius: 1; color: Qt.rgba(1, 1, 1, 0.12) }
          Rectangle {
            anchors.bottom: parent.bottom
            width: parent.width; radius: 1
            height: Math.max(1, Math.round(parent.height * parent.level))
            color: root.service && root.service.agentColors ? root.service.agentColors[parent.modelData] : Fleet.COLORS[parent.modelData]
            opacity: parent.ship && parent.ship.mode !== "docked" ? 1 : 0.7
          }
        }
      }
    }
  }

  Timer {
    id: blink
    property bool on: false
    interval: 600
    repeat: true
    running: root.waiting > 0
    onTriggered: on = !on
  }
}
