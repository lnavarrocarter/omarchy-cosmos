.pragma library

// How Cosmos looks: character colours, the planet and the castaway's home.
// config.json `look` is merged over DEFAULT and every value is checked here,
// so a typo, or a planet made up by a model, can never break the scene.

var HEX = /^#[0-9a-fA-F]{6}$/

var DEFAULT = {
  astronaut: { suit: "#eef0f7", visor: "#58c8ff", accent: "#ff9447" },
  cat: { fur: "#f2a541", stripes: "#b86d1f" },
  dog: { fur: "#e9cf93", spots: "#8a5a35", collar: "#e2524a" },
  shuttle: { hull: "#eef0f7", stripe: "#e2524a" },
  ships: { claude: "", codex: "", copilot: "", local: "" },
  planet: { preset: "ringed" },
  home: "island",
  station: "classic"
}

// The station models (stationlife.js has their docks and spacewalk spots).
var STATIONS = ["classic", "torus", "spire", "citadel"]

// Planet styles the generator knows. "bands" is a gas giant; the others are
// solid worlds drawn from 2D noise.
var STYLES = ["bands", "storm", "ice", "lava", "ocean", "rocky", "crystal", "tech"]

var PLANETS = {
  ringed: { name: "Ringed giant", style: "bands", rings: true,
    colors: ["#d98e5a", "#f1d3a1", "#b5653f", "#e8b980", "#8c4a3a", "#f0c48c"],
    ringColors: ["#cdbb9a", "#a8956f", "#e4d6b6"], rim: "#ffb27a" },
  storm: { name: "Storm giant", style: "storm", rings: false,
    colors: ["#c99a6b", "#ead2b0", "#a8673f", "#dcb48a", "#b37a52"], spot: "#c2453a", rim: "#ffcf9e" },
  amethyst: { name: "Amethyst giant", style: "bands", rings: true,
    colors: ["#6c4bd1", "#a98bff", "#4a2f9a", "#c9b6ff", "#7f5ae6"],
    ringColors: ["#9fe3ff", "#6fb4d6", "#d6f4ff"], rim: "#c9a6ff" },
  ice: { name: "Ice world", style: "ice", rings: true,
    colors: ["#e8f8ff", "#b7e4f7", "#7fb8dd", "#ffffff"], ringColors: ["#cfefff", "#9ccbe6"], rim: "#bfefff" },
  lava: { name: "Lava world", style: "lava", rings: false,
    colors: ["#2b1d24", "#4a2a2a", "#ff6b2b", "#ffd65a"], rim: "#ff7a3a" },
  ocean: { name: "Ocean world", style: "ocean", rings: false,
    colors: ["#1f5fa8", "#2f86c9", "#3fae6a", "#e9cf93", "#ffffff"], rim: "#9fe3ff" },
  desert: { name: "Desert world", style: "rocky", rings: false,
    colors: ["#c8643c", "#e08a52", "#9a4430", "#f0b07a"], rim: "#ffb27a" },
  toxic: { name: "Toxic giant", style: "bands", rings: true,
    colors: ["#3fae6a", "#9be37a", "#2a7a4a", "#d6f58a", "#5fc46e"],
    ringColors: ["#e9f5a0", "#a7c96a"], rim: "#c6ff9e" },
  crystal: { name: "Crystal world", style: "crystal", rings: true,
    colors: ["#2a3a6a", "#58c8ff", "#9b6bff", "#d6f4ff"], ringColors: ["#ff6ad5", "#9b6bff"], rim: "#7df9ff" },
  // A machine world. colors: plate, seam, ocean, shallows, fissure, city
  // lights; ringColors: rails, deck, running lights. Comes with its own
  // orbit (orbital.js): stations, motherships, scrap, an elevator, turrets.
  forge: { name: "Broken Forge", style: "tech", rings: true,
    colors: ["#5a6478", "#2e3446", "#1a6f8a", "#36b5c9", "#ff9447", "#7df9ff"],
    ringColors: ["#9aa3ba", "#5f6784", "#58c8ff"], rim: "#9fd8ff" }
}

// Where the astronaut, the cat and the dog live. Every home keeps the same
// spots (dog, astronaut, fire, cat, jar) so episodes still fit; `left` and
// `right` are the landmarks in the palm's and the tent's places. `curve` is
// the radius (in art pixels) of a round home the characters stand around;
// `radius`/`solidDy` the circle drifting rocks bounce off (default: the dome).
var HOMES = ["island", "planetoid", "castle", "ship"]
var HOME_LAYOUT = {
  island: { left: "palm", right: "tent", dome: true, curve: 0, sways: true },
  planetoid: { left: "tree", right: "hut", dome: false, curve: 56, sways: true, radius: 228, solidDy: 184 },
  castle: { left: "tower", right: "keep", dome: true, curve: 0, sways: false },
  ship: { left: "antenna", right: "cockpit", dome: true, curve: 0, sways: false }
}

// Where the ground is at x (pixels from the home's left edge, 384 wide):
// how far it drops below the flat line, and how much it leans (degrees).
function ground(home, x) {
  var L = HOME_LAYOUT[home] || HOME_LAYOUT.island
  if (!L.curve) return { dy: 0, rot: 0 }
  var c = Math.max(-L.curve * 0.95, Math.min(L.curve * 0.95, (x - 192) / 4))
  return { dy: (L.curve - Math.sqrt(L.curve * L.curve - c * c)) * 4, rot: Math.asin(c / L.curve) * 180 / Math.PI }
}

function isHex(v) { return typeof v === "string" && HEX.test(v) }

function colorOr(v, fallback) { return isHex(v) ? v.toLowerCase() : fallback }

function colorList(v, fallback, min, max) {
  if (!Array.isArray(v)) return fallback.slice()
  var out = []
  for (var i = 0; i < v.length && out.length < max; i++) if (isHex(v[i])) out.push(v[i].toLowerCase())
  return out.length >= min ? out : fallback.slice()
}

function group(user, def) {
  var out = {}
  for (var k in def) out[k] = def[k] === "" ? (isHex(user && user[k]) ? user[k].toLowerCase() : "") : colorOr(user && user[k], def[k])
  return out
}

// The first preset drawn in a style: what a custom planet borrows from.
function styleBase(style) {
  for (var k in PLANETS) if (PLANETS[k].style === style) return PLANETS[k]
  return null
}

// A planet spec from a preset name, a full custom spec, or both (the
// custom values override the preset's).
function planet(p) {
  p = p && typeof p === "object" ? p : {}
  var base = PLANETS[p.preset] || styleBase(p.style) || PLANETS.ringed
  var style = STYLES.indexOf(p.style) >= 0 ? p.style : base.style
  return {
    preset: PLANETS[p.preset] ? p.preset : (p.colors || p.style ? "custom" : "ringed"),
    name: typeof p.name === "string" && p.name.trim() ? p.name.trim().slice(0, 40) : base.name,
    style: style,
    colors: colorList(p.colors, base.colors, 2, 8),
    rings: typeof p.rings === "boolean" ? p.rings : !!base.rings,
    ringColors: colorList(p.ringColors, base.ringColors || ["#cdbb9a", "#a8956f", "#e4d6b6"], 1, 4),
    spot: colorOr(p.spot, base.spot || "#c2453a"),
    rim: colorOr(p.rim, base.rim || "#ffb27a"),
    seed: Math.abs(Math.round(Number(p.seed) || 0)) % 1000
  }
}

function normalize(look) {
  look = look && typeof look === "object" ? look : {}
  return {
    astronaut: group(look.astronaut, DEFAULT.astronaut),
    cat: group(look.cat, DEFAULT.cat),
    dog: group(look.dog, DEFAULT.dog),
    shuttle: group(look.shuttle, DEFAULT.shuttle),
    ships: group(look.ships, DEFAULT.ships),
    planet: planet(look.planet),
    home: HOMES.indexOf(look.home) >= 0 ? look.home : "island",
    station: STATIONS.indexOf(look.station) >= 0 ? look.station : "classic"
  }
}

// Darker / lighter shade of a colour, for the second tone of a sprite.
function shade(c, k) {
  var n = parseInt(c.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255
  var t = k < 0 ? [20, 16, 40] : [255, 255, 255], a = Math.abs(k)
  function ch(v, w) { var x = Math.round(v + (w - v) * a); return (x < 16 ? "0" : "") + x.toString(16) }
  return "#" + ch(r, t[0]) + ch(g, t[1]) + ch(b, t[2])
}

// Palette letters each character's art uses (see sprites.js).
function palettes(look) {
  var L = normalize(look)
  return {
    astronaut: { W: L.astronaut.suit, G: shade(L.astronaut.suit, -0.3), V: L.astronaut.visor,
      D: shade(L.astronaut.visor, -0.55), O: L.astronaut.accent },
    cat: { C: L.cat.fur, c: L.cat.stripes },
    dog: { S: L.dog.fur, T: L.dog.spots, R: L.dog.collar },
    shuttle: { W: L.shuttle.hull, R: L.shuttle.stripe }
  }
}

if (typeof module !== "undefined")
  module.exports = { DEFAULT: DEFAULT, STYLES: STYLES, STATIONS: STATIONS, PLANETS: PLANETS, HOMES: HOMES, HOME_LAYOUT: HOME_LAYOUT, ground: ground, isHex: isHex,
    normalize: normalize, planet: planet, palettes: palettes, shade: shade }
