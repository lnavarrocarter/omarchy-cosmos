.pragma library

// Which part of the scene goes on which screen.
//
// The scene has three places: the planet, the castaway's home and the
// station. With three or more screens each gets a screen of its own. With
// fewer, the screens get the main places (always including the one chosen as
// hero), and whatever is left over joins a screen as a small companion off to
// one side, as if seen from further away. config `show` hides any of them;
// `zones` still pins a place to a named screen.

var KINDS = ["planet", "castaway", "station"]
var COMPANION_SCALE = 0.45
// Where a place sits on its screen, as fractions of the screen: x, y.
var HOME_Y = { planet: 0.52, castaway: 0.62, station: 0.40 }
var SIDE_Y = { planet: 0.30, castaway: 0.68, station: 0.30 }

function shownKinds(show) {
  var out = []
  for (var i = 0; i < KINDS.length; i++) {
    var k = KINDS[i]
    if (!show || typeof show !== "object" || show[k] !== false) out.push(k)
  }
  return out
}

function pinned(zones, name) {
  var z = zones && zones[name]
  return z === "planet" || z === "castaway" || z === "station" || z === "void" ? z : ""
}

// The place on screen `index` of `count` with three or more screens (the
// layout Cosmos always had): planet left, station right, home in the middle.
function wideKind(index, count) {
  if (index === 0) return "planet"
  if (index === count - 1) return "station"
  return index === Math.floor(count / 2) ? "castaway" : "void"
}

// screens: [{ name }] left to right. Returns one entry per screen:
// { name, kind (its main place or "void"), companions: [{ kind, fx, fy,
// scale }] }, plus { fx, fy } for the main place.
function plan(screens, opts) {
  opts = opts || {}
  var count = screens.length
  var shown = shownKinds(opts.show)
  var hero = shown.indexOf(opts.hero) >= 0 ? opts.hero : (shown.indexOf("castaway") >= 0 ? "castaway" : shown[0])
  var out = []
  var used = ({})
  var i

  // Main places.
  var mains = []
  if (count >= 3) {
    for (i = 0; i < count; i++) mains.push(wideKind(i, count))
  } else {
    // The hero, then the others in order, as many as there are screens,
    // laid out left to right in the usual order.
    var pick = hero ? [hero] : []
    for (i = 0; i < shown.length && pick.length < count; i++) if (pick.indexOf(shown[i]) < 0) pick.push(shown[i])
    pick.sort(function(a, b) { return KINDS.indexOf(a) - KINDS.indexOf(b) })
    for (i = 0; i < count; i++) mains.push(pick[i] || "void")
  }
  for (i = 0; i < count; i++) {
    var pin = pinned(opts.zones, screens[i].name)
    if (pin) mains[i] = pin
    if (shown.indexOf(mains[i]) < 0) mains[i] = "void"
  }
  // With fewer screens than places, the hero wins over a pin: it takes the
  // first screen that isn't pinned, or else the last one.
  if (count < 3 && hero && mains.indexOf(hero) < 0) {
    var free = -1
    for (i = 0; i < count && free < 0; i++) if (!pinned(opts.zones, screens[i].name)) free = i
    mains[free >= 0 ? free : count - 1] = hero
  }
  // A place pinned somewhere is not repeated where the defaults put it.
  for (i = 0; i < count; i++) {
    var k = mains[i]
    if (k === "void") continue
    if (used[k] && !pinned(opts.zones, screens[i].name)) mains[i] = "void"
    used[k] = true
  }
  for (i = 0; i < count; i++)
    out.push({ name: screens[i].name, kind: mains[i], fx: 0.5, fy: HOME_Y[mains[i]] || 0.5, companions: [] })

  // Companions: only with fewer screens than places.
  if (count >= 3) return out
  var left = []
  for (i = 0; i < shown.length; i++) if (!used[shown[i]]) left.push(shown[i])
  if (!left.length || !count) return out
  // They join a screen that isn't the hero's when there is one, else the
  // hero's; with two of them, one goes on each side.
  var host = 0
  for (i = 0; i < count; i++) if (out[i].kind !== hero) { host = i; break }
  if (count === 1) host = 0
  for (i = 0; i < left.length; i++) {
    var onLeft = count === 1 ? (left.length === 1 ? KINDS.indexOf(left[i]) < KINDS.indexOf(out[0].kind) : i === 0)
      : host === 0
    out[host].companions.push({ kind: left[i], fx: onLeft ? 0.16 : 0.84, fy: SIDE_Y[left[i]], scale: COMPANION_SCALE })
  }
  return out
}

if (typeof module !== "undefined")
  module.exports = { KINDS: KINDS, COMPANION_SCALE: COMPANION_SCALE, plan: plan, shownKinds: shownKinds }
