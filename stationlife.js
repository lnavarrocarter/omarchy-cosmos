.pragma library

// The station models and the life around them: shuttles that come in, dock
// and leave; crew on spacewalks at the end of a tether (one of them welding);
// and beacons. Positions are screen pixels around the station's centre, pure
// functions of (index, time), shared by Station.qml and the storyboard tool.

var MODELS = ["classic", "torus", "spire", "citadel"]

// ports: where shuttles dock. eva: where a spacewalker's tether is clipped.
// beacons: blinking lights [x, y, colour, rate]. radius: how far out rocks
// bounce off it. spin: turns per second of the rotating part.
var LAYOUT = {
  classic: {
    ports: [{ x: 346, y: 0, side: 1 }],
    eva: [{ x: 230, y: -34 }, { x: -60, y: -112 }],
    beacons: [], radius: 150, spin: 0
  },
  // Torus: R 70 art px at 3x, a 210 px spindle (630 px) through the hub.
  torus: {
    px: 3, R: 70, spindle: 210,
    ports: [{ x: -315, y: 0, side: -1 }, { x: 315, y: 0, side: 1 }],
    eva: [{ x: 148, y: -148 }, { x: -170, y: 112 }],
    beacons: [[0, -214, "#ff4d4d", 1.2], [0, 214, "#5dff9d", 1.2], [-214, 0, "#ffd65a", 0.7]],
    radius: 230, spin: 0.02
  },
  // Spire: 76x120 art px at 4x (304x480).
  spire: {
    px: 4,
    ports: [{ x: 0, y: 236, side: 0 }, { x: -112, y: -36, side: -1 }],
    eva: [{ x: 130, y: -96 }, { x: -130, y: 32 }],
    beacons: [[-4, -240, "#ff4d4d", 1.5], [-140, -96, "#ffd65a", 0.8], [140, 32, "#5dff9d", 0.8]],
    radius: 220, spin: 0
  },
  // Citadel: 104x104 art px at 4x (416x416).
  citadel: {
    px: 4,
    ports: [{ x: -192, y: 0, side: -1 }, { x: 0, y: 192, side: 0 }, { x: 192, y: 0, side: 1 }],
    eva: [{ x: 62, y: -110 }, { x: -62, y: -110 }],
    beacons: [[80, -112, "#ff4d4d", 1.0], [-192, 0, "#ffd65a", 0.6], [192, 0, "#ffd65a", 0.6]],
    radius: 215, spin: 0.01
  }
}

var SHUTTLES = 3
var CYCLE = 42

function layout(model) { return LAYOUT[model] || LAYOUT.classic }

function ease(k) { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k) }

function hash(n) {
  var x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

// Shuttle i: in from far away along a gentle curve, a stay at its port, and
// out the other way. Faces where it is going (the sprite faces left).
function shuttle(model, i, t) {
  var L = layout(model)
  var u = ((t / CYCLE) + i / SHUTTLES) % 1
  var round = Math.floor(t / CYCLE + i / SHUTTLES)
  var port = L.ports[(i + round) % L.ports.length]
  // Hold off the port by a shuttle's length, on the side it opens to.
  var hold = { x: port.x + (port.side || 0) * 30, y: port.y + (port.side === 0 ? 30 : 0) }
  var inAng = Math.PI * (0.15 + 0.7 * hash(round * 3 + i)) * (hash(round * 5 + i) > 0.5 ? 1 : -1)
  var far = { x: Math.cos(inAng) * 1100, y: Math.sin(inAng) * 500 }
  var away = { x: -far.x * 0.9, y: far.y * 0.6 - 300 }
  var p, mode
  if (u < 0.3) {
    var k = ease(u / 0.3)
    var bend = Math.sin(k * Math.PI) * 120
    p = { x: far.x + (hold.x - far.x) * k, y: far.y + (hold.y - far.y) * k - bend }
    mode = "approach"
  } else if (u < 0.6) {
    p = { x: hold.x, y: hold.y + Math.sin(t * 1.3 + i) * 1.5 }
    mode = "docked"
  } else if (u < 0.9) {
    var e = (u - 0.6) / 0.3
    var k2 = e * e
    p = { x: hold.x + (away.x - hold.x) * k2, y: hold.y + (away.y - hold.y) * k2 }
    mode = "depart"
  } else {
    return { visible: false, x: 0, y: 0, mode: "away", mirrored: false, flame: false }
  }
  // Heading from the motion a moment ahead.
  var dirX = mode === "approach" ? hold.x - far.x : mode === "depart" ? away.x - hold.x : -(port.side || 1)
  return { visible: true, x: p.x, y: p.y, mode: mode, mirrored: dirX > 0, flame: mode !== "docked" }
}

// Spacewalker i: drifts round its tether clip; the first one is welding,
// which throws sparks now and then.
function eva(model, i, t) {
  var L = layout(model)
  var a = L.eva[i % L.eva.length]
  var x = a.x + Math.sin(t * 0.35 + i * 2) * 26 + 20
  var y = a.y + Math.cos(t * 0.27 + i) * 18 - 24
  var welding = i === 0 && Math.sin(t * 0.9) > 0.2
  return { x: x, y: y, clipX: a.x, clipY: a.y, rot: Math.sin(t * 0.3 + i) * 0.5, welding: welding,
           spark: welding && hash(Math.floor(t * 12)) > 0.4 }
}

function beacon(model, i, t) {
  var b = layout(model).beacons[i]
  if (!b) return { visible: false }
  return { visible: true, x: b[0], y: b[1], color: b[2], on: Math.floor(t * b[3] + i * 0.37) % 2 === 0 }
}

if (typeof module !== "undefined")
  module.exports = { MODELS: MODELS, LAYOUT: LAYOUT, SHUTTLES: SHUTTLES, layout: layout, shuttle: shuttle, eva: eva, beacon: beacon }
