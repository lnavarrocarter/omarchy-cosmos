.pragma library

// Day cycle: where the sun or the moon is across the panorama, the colour of
// the horizon, the moon's phase, and when the hourly rocket is due.

function parseClock(text, fallback) {
  var m = /^(\d{1,2}):(\d{2})$/.exec(String(text || ""))
  if (!m) return fallback
  var h = Number(m[1]), min = Number(m[2])
  if (h > 23 || min > 59) return fallback
  return h * 60 + min
}

function minutesOf(date) {
  return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60
}

// Position along the day (sun) or the night (moon), 0 at rise, 1 at set.
// x and y are fractions of the world: x from 0 (left) to 1 (right), y is
// highest (smallest) halfway through.
function skyBody(minutes, rise, set) {
  var dayLen = (set - rise + 1440) % 1440
  var sinceRise = (minutes - rise + 1440) % 1440
  var kind, u
  if (sinceRise < dayLen) {
    kind = "sun"
    u = sinceRise / dayLen
  } else {
    kind = "moon"
    u = (sinceRise - dayLen) / (1440 - dayLen)
  }
  return { kind: kind, u: u, x: 0.02 + 0.96 * u, y: 0.86 - 0.7 * Math.sin(Math.PI * u) }
}

function mixColor(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

// Horizon glow: colour [r, g, b] in 0..1 and strength 0..1.
function horizon(minutes, rise, set) {
  var dawn = [1.0, 0.55, 0.45], day = [0.35, 0.75, 1.0], dusk = [1.0, 0.45, 0.25], night = [0.25, 0.2, 0.55]
  function near(center, width) {
    var d = Math.abs(((minutes - center + 720 + 1440) % 1440) - 720)
    return Math.max(0, 1 - d / width)
  }
  var aDawn = near(rise, 75), aDusk = near(set, 90)
  var body = skyBody(minutes, rise, set)
  if (aDawn > 0) return { color: aDawn > 0.5 ? dawn : mixColor(body.kind === "sun" ? day : night, dawn, aDawn * 2), strength: 0.18 + 0.32 * aDawn }
  if (aDusk > 0) return { color: aDusk > 0.5 ? dusk : mixColor(body.kind === "sun" ? day : night, dusk, aDusk * 2), strength: 0.18 + 0.32 * aDusk }
  return body.kind === "sun" ? { color: day, strength: 0.12 } : { color: night, strength: 0.08 }
}

// Moon phase 0..1 (0 new, 0.25 first quarter, 0.5 full, 0.75 last quarter).
function moonPhase(date) {
  var knownNew = Date.UTC(2000, 0, 6, 18, 14)
  var days = (date.getTime() - knownNew) / 86400000
  var p = (days / 29.530588853) % 1
  return p < 0 ? p + 1 : p
}

// Milliseconds until the next o'clock.
function msToNextHour(date) {
  var next = new Date(date.getTime())
  next.setMinutes(0, 0, 0)
  next.setHours(next.getHours() + 1)
  return next.getTime() - date.getTime()
}

function pad(n) { return (n < 10 ? "0" : "") + n }

function hourLabel(date) {
  return pad(date.getHours()) + ":00"
}

if (typeof module !== "undefined") {
  module.exports = { parseClock: parseClock, minutesOf: minutesOf, skyBody: skyBody, horizon: horizon,
    moonPhase: moonPhase, msToNextHour: msToNextHour, hourLabel: hourLabel }
}
