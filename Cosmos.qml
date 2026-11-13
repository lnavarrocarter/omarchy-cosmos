import QtQuick
import Quickshell
import Quickshell.Io
import Quickshell.Wayland
import Quickshell.Hyprland
import "physics.js" as Physics
import "sprites.js" as Sprites
import "fleet.js" as Fleet
import "daycycle.js" as Day
import "episodes.js" as Episodes
import "looks.js" as Looks
import "stationlife.js" as StationLife
import "zones.js" as Zones

// Cosmos: one living space scene spread across every screen.
//
// The screens are laid side by side into one wrapped world (with optional
// bezel gaps and per-screen vertical leveling). A single simulation drives
// it, so a rock leaving one monitor enters the next with the same momentum.
Item {
  id: root

  property var shell: null
  property var manifest: null

  // ------------------------------------------------------------ config

  readonly property var defaults: ({
    enabled: true,
    fps: 60,
    bezelGap: 0,
    verticalOffsets: ({}),
    zones: ({}),
    monitors: [],
    // Which places to show, and the hero: with fewer screens than places the
    // hero stays big and the rest join as small companions (zones.js).
    show: ({ planet: true, castaway: true, station: true }),
    hero: "castaway",
    rocks: 12,
    cats: 2,
    tourists: 1,
    satellites: 2,
    comets: true,
    cometEvery: [25, 70],
    sceneSeconds: [14, 26],
    pauseOnFullscreen: true,
    seed: 1987,
    fleet: false,
    hub: false,
    fleetSeconds: 10,
    interactiveSeconds: 120,
    ollamaJournal: "",
    budgets: ({ claude: 5000000, codex: 3000000, copilot: 1000000 }),
    weather: true,
    weatherSeconds: 15,
    projectMoons: false,
    maxMoons: 8,
    warp: true,
    screensaver: true,
    dayCycle: true,
    sunrise: "06:35",
    sunset: "20:40",
    hourlyRocket: true,
    episodes: true,
    episodeEvery: [120, 300],
    eventEpisodes: true,
    idleSeconds: 120,
    specialDates: ({}),
    marathon: true,
    throwRocks: true,
    look: ({}),
    // Planets from a description (planet_ai.py): engine auto | ollama | claude | offline.
    ai: ({ engine: "auto", ollamaUrl: "http://127.0.0.1:11434", ollamaModel: "", claude: false, claudeModel: "" })
  })
  property var cfg: defaults

  function pluginPath(name) {
    return decodeURIComponent(String(Qt.resolvedUrl(name)).replace(/^file:\/\//, ""))
  }

  // What the user wrote in config.json, as written: the Studio edits this
  // and saves it back, so defaults never get copied into the file.
  property var userConfig: ({})
  property string layoutKey: ""

  function readConfig(text) {
    var merged = ({}), user = ({})
    for (var k in defaults) merged[k] = defaults[k]
    try {
      user = JSON.parse(text || "{}")
      if (!user || typeof user !== "object" || Array.isArray(user)) user = ({})
      for (var u in user) if (u in defaults && user[u] !== null) merged[u] = user[u]
    } catch (e) {
      console.warn("cosmos: config.json is not valid JSON, using defaults:", e)
      user = ({})
    }
    merged.fps = Math.max(10, Math.min(144, Number(merged.fps) || 60))
    merged.bezelGap = Math.max(0, Math.min(800, Number(merged.bezelGap) || 0))
    userConfig = user
    cfg = merged
    // Only what changes the layout restarts the simulation; colours, the
    // planet and switches take effect in place.
    var normLook = Looks.normalize(merged.look)
    var key = JSON.stringify([merged.bezelGap, merged.verticalOffsets, merged.zones, merged.monitors, merged.rocks,
      merged.cats, merged.tourists, merged.satellites, merged.seed, normLook.home, normLook.station, merged.show, merged.hero])
    if (key !== layoutKey) { layoutKey = key; rebuild() }
  }

  // Write a whole config (the Studio's undo and reset).
  function replaceConfig(obj) {
    var text = JSON.stringify(obj && typeof obj === "object" ? obj : {}, null, 2) + "\n"
    configFile.setText(text)
    configMissing = false
    readConfig(text)
  }

  // Save some keys into config.json (look is merged one level deep, so
  // { look: { cat: {...} } } keeps the rest of look). null removes a key.
  function saveConfig(patch) {
    var out = JSON.parse(JSON.stringify(userConfig || {}))
    for (var k in patch) {
      if (!(k in defaults)) continue
      var v = patch[k]
      if (v === null) { delete out[k]; continue }
      if (k === "look" && v && typeof v === "object") {
        var look = out.look && typeof out.look === "object" ? out.look : ({})
        for (var part in v) {
          if (v[part] === null) delete look[part]
          else if (v[part] && typeof v[part] === "object" && !Array.isArray(v[part]) && part !== "planet") {
            var g = look[part] && typeof look[part] === "object" ? look[part] : ({})
            for (var f in v[part]) g[f] = v[part][f]
            look[part] = g
          } else look[part] = v[part]
        }
        out.look = look
      } else out[k] = v
    }
    var text = JSON.stringify(out, null, 2) + "\n"
    configFile.setText(text)
    configMissing = false
    readConfig(text)
  }

  // Settings live in ~/.config/cosmos/config.json, outside the plugin
  // folder: Omarchy reloads a plugin whenever a file in its folder changes,
  // which would restart the scene (and close the Studio) on every edit, and
  // `omarchy plugin update`/`remove` would fight with it. A config.json left
  // in the plugin folder by older versions is still read until the first save.
  readonly property string configDir: Quickshell.env("HOME") + "/.config/cosmos"
  Process {
    command: ["mkdir", "-p", root.configDir]
    running: true
  }

  FileView {
    id: configFile
    path: root.configDir + "/config.json"
    watchChanges: true
    printErrors: false
    onFileChanged: reload()
    onLoaded: { root.configMissing = false; root.readConfig(text()) }
    onLoadFailed: { root.configMissing = true; legacyConfig.reload() }
  }
  property bool configMissing: false

  FileView {
    id: legacyConfig
    path: root.pluginPath("config.json")
    printErrors: false
    // Move it (or an empty config) to the new place, so it is watched there.
    onLoaded: if (root.configMissing) root.adoptConfig(text())
    onLoadFailed: if (root.configMissing) root.adoptConfig("{}\n")
  }
  function adoptConfig(text) {
    configFile.setText(text)
    configMissing = false
    readConfig(text)
    Qt.callLater(function() { configFile.reload() })
  }

  // ------------------------------------------------------------ world layout

  property var world: ({ width: 1920, height: 1080 })
  property var screenGeo: ({})
  property var zones: []
  property var attractors: []
  property var bodies: []
  property int layoutVersion: 0
  property var sprites: ({})

  // The screens Cosmos draws on: cfg.monitors by name, or all of them. A
  // list that matches no connected screen falls back to all.
  readonly property var usedScreens: {
    var all = Quickshell.screens, want = Array.isArray(cfg.monitors) ? cfg.monitors : []
    if (!want.length) return all
    var out = []
    for (var i = 0; i < all.length; i++) if (want.indexOf(all[i].name) >= 0) out.push(all[i])
    return out.length ? out : all
  }
  onUsedScreensChanged: rebuild()

  function zoneCenter(kind) {
    for (var i = 0; i < zones.length; i++) if (zones[i].kind === kind) return zones[i]
    return null
  }

  function rebuild() {
    var list = []
    for (var i = 0; i < usedScreens.length; i++) list.push(usedScreens[i])
    list.sort(function(a, b) { return a.x - b.x || a.y - b.y })
    if (list.length === 0) return

    var gap = cfg.bezelGap
    var offset = 0, height = 0, geo = ({}), zs = []
    var plan = Zones.plan(list.map(function(sc) { return { name: sc.name } }),
      { zones: cfg.zones, show: cfg.show, hero: cfg.hero })
    // Every place on every screen: the screen's main one at full size, and
    // any companions, scaled down.
    var places = []
    for (var j = 0; j < list.length; j++) {
      var s = list[j]
      var lift = Number((cfg.verticalOffsets || {})[s.name]) || 0
      geo[s.name] = { x: offset, y: lift, w: s.width, h: s.height }
      var kind = plan[j].kind
      zs.push({ kind: kind, name: s.name, x: offset + s.width / 2, w: s.width, h: s.height, y0: lift })
      if (kind !== "void") places.push({ kind: kind, x: offset + s.width * plan[j].fx, fy: plan[j].fy, scale: 1 })
      for (var q = 0; q < plan[j].companions.length; q++) {
        var cp = plan[j].companions[q]
        places.push({ kind: cp.kind, x: offset + s.width * cp.fx, fy: cp.fy, scale: cp.scale })
      }
      offset += s.width + gap
      height = Math.max(height, s.height)
    }
    world = { width: offset, height: height }
    screenGeo = geo
    zones = zs

    var at = []
    var homeLay = Looks.HOME_LAYOUT[look.home] || Looks.HOME_LAYOUT.island
    var base = {
      planet: { gm: 353000, soft: 30, radius: 250 },
      castaway: { gm: 45000, soft: 60, radius: homeLay.radius || 175, solidDy: homeLay.solidDy || 0 },
      station: { gm: 60000, soft: 50, radius: StationLife.layout(look.station).radius }
    }
    for (var w = 0; w < places.length; w++) {
      var pl = places[w], b = base[pl.kind], k = pl.scale
      at.push({ kind: pl.kind, x: pl.x, y: height * pl.fy, gm: b.gm * k * k, soft: b.soft * k, radius: b.radius * k,
        solidDy: (b.solidDy || 0) * k, scale: k })
    }
    attractors = at

    buildSprites()
    spawn()
    nextComet = randRange(cfg.cometEvery)
    pickScene()
    episode = ""
    episodeState = null
    pendingEvent = null
    nextEpisode = t + Math.min(60, randRange(episodeRange()))
    fleetCtx = Fleet.layout(world, attractors)
    fleetCtx.moons = moonMap
    layoutVersion++
  }

  // What everything looks like (config `look`, checked by looks.js). The
  // sprites are rebuilt when it changes, so the Studio's edits show live.
  readonly property var look: Looks.normalize(cfg.look)
  readonly property var agentColors: {
    var out = ({})
    for (var a in Fleet.COLORS) out[a] = look.ships[a] || Fleet.COLORS[a]
    return out
  }
  property string spritesKey: ""
  onLookChanged: buildSprites()

  function buildSprites() {
    var key = JSON.stringify(look)
    if (sprites.planet && key === spritesKey) return
    var pal = Looks.palettes(look)
    // From look itself: agentColors may not have caught up yet in onLookChanged.
    var shipColor = function(a) { return look.ships[a] || Fleet.COLORS[a] }
    var lay = Looks.HOME_LAYOUT[look.home] || Looks.HOME_LAYOUT.island
    var sp = ({
      planet: Sprites.planet(80, 0, look.planet),
      home: Sprites.home(look.home, 4),
      decoLeft: Sprites.decor(lay.left),
      decoRight: Sprites.decor(lay.right),
      astronaut: Sprites.astronaut(pal.astronaut),
      astronautWave: Sprites.astronautWave(pal.astronaut),
      cat: Sprites.cat(pal.cat),
      catSit: Sprites.catSit(pal.cat),
      fish: Sprites.fish(),
      satellite: Sprites.satellite(),
      shuttle: Sprites.shuttle(pal.shuttle),
      wheel: Sprites.wheel(40),
      habitat: Sprites.habitat(44, 16),
      // The chosen station model and the machine planet's orbit (orbital.js).
      stationBody: look.station === "torus" ? Sprites.stationTorus(70) : look.station === "spire" ? Sprites.stationSpire()
        : look.station === "citadel" ? Sprites.stationCitadel() : null,
      stationSpindle: look.station === "torus" ? Sprites.stationSpindle(210) : null,
      orbit: look.planet.style !== "tech" ? null : ({
        wheel: Sprites.orbStation("wheel"), cross: Sprites.orbStation("cross"),
        mothership: [Sprites.mothership(3, "#ffd65a"), Sprites.mothership(10, "#ff9447"), Sprites.mothership(17, "#ffd65a")],
        junk: [Sprites.junk(0), Sprites.junk(1), Sprites.junk(2), Sprites.junk(3), Sprites.junk(4)],
        chunk: [0, 1, 2].map(function(i) {
          return Sprites.crustChunk(i, look.planet.colors[2], look.planet.colors[0], look.planet.colors[4])
        }),
        climber: Sprites.climber(), turret: Sprites.turret()
      }),
      fire: [Sprites.fire(0), Sprites.fire(1), Sprites.fire(2)],
      moon: [Sprites.moon(2, 7, "#b9c3d9"), Sprites.moon(5, 5, "#d9a7b9"), Sprites.moon(9, 6, "#9fd9c4"),
             Sprites.moon(13, 6, "#e0c48f"), Sprites.moon(17, 5, "#a9b8ff"), Sprites.moon(21, 7, "#f0a8a0"),
             Sprites.moon(25, 5, "#c9d98f"), Sprites.moon(29, 6, "#d8b4f0")],
      rock: [Sprites.rock(3, 9), Sprites.rock(7, 6), Sprites.rock(11, 4), Sprites.rock(19, 7)],
      ships: ({
        claude: Sprites.ship("hauler", shipColor("claude")),
        codex: Sprites.ship("fighter", shipColor("codex")),
        copilot: Sprites.ship("fighter", shipColor("copilot")),
        local: Sprites.ship("solar", shipColor("local"))
      }),
      crate: Sprites.crate(),
      sun: [Sprites.sun(22, 0), Sprites.sun(22, 1)],
      rocket: Sprites.rocket(),
      dog: Sprites.dog(pal.dog),
      dogWag: Sprites.dogWag(pal.dog),
      catBlink: Sprites.catBlink(pal.cat),
      catSwish: Sprites.catSwish(pal.cat),
      ep: Episodes.buildArt(Sprites, pal),
      moonNow: null
    })
    spritesKey = key
    moonDay = ""
    sprites = sp
  }

  // ------------------------------------------------------------ simulation

  property var rand: Physics.rng(1987)
  property real t: 0
  property int frame: 0
  property real accum: 0
  property real nextComet: 30
  property bool running: false

  function randRange(pair) {
    return pair[0] + rand() * (pair[1] - pair[0])
  }

  function spawn() {
    rand = Physics.rng(Number(cfg.seed) || 1987)
    var list = []
    var id = 0
    var planet = null
    for (var i = 0; i < attractors.length; i++) if (attractors[i].kind === "planet") planet = attractors[i]
    var n
    for (n = 0; n < cfg.rocks * 2; n++)
      list.push(Physics.driftBody(id++, "rock", world, rand, { r: 12 + (n % 4) * 3, active: n < cfg.rocks }))
    for (n = 0; n < cfg.cats; n++)
      list.push(Physics.driftBody(id++, "cat", world, rand, { r: 20, va: (rand() - 0.5) * 30, kick: 0.12 }))
    for (n = 0; n < cfg.tourists; n++)
      list.push(Physics.driftBody(id++, "tourist", world, rand, { r: 22, kick: 0.1 }))
    for (n = 0; n < cfg.satellites; n++)
      list.push(Physics.driftBody(id++, "satellite", world, rand, { r: 22, va: (rand() - 0.5) * 10, kick: 0.04, maxSpeed: 45 }))
    if (cfg.comets) {
      for (n = 0; n < 2; n++)
        list.push({ id: id++, kind: "comet", active: false, g: 0, kick: 0, r: 4, a: 0, va: 0,
          maxSpeed: 1000, minSpeed: 0, x: 0, y: -999, vx: 0, vy: 0, trail: [] })
    }
    bodies = list
    moonKeys = ""
    syncMoons()
  }

  // ------------------------------------------------------------ project moons

  // Each Workbench project and Hub workspace is a moon around the planet;
  // Hub missions orbit the moon of their workspace. Names are untrusted text
  // and are only ever shown as plain text.
  property var projectNames: []
  property var workspaceNames: []
  property string moonKeys: ""
  property int moonVersion: 0

  function cleanName(value) {
    if (typeof value !== "string") return ""
    return value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 40)
  }

  function moonEntries() {
    var out = [], seen = ({})
    function add(name, kind) {
      name = cleanName(name)
      if (!name || seen[name] || out.length >= Math.min(8, Number(cfg.maxMoons) || 8)) return
      seen[name] = true
      out.push({ name: name, kind: kind })
    }
    if (cfg.projectMoons) {
      for (var i = 0; i < workspaceNames.length; i++) add(workspaceNames[i], "workspace")
      for (var j = 0; j < projectNames.length; j++) add(projectNames[j], "project")
    }
    return out
  }

  function syncMoons() {
    var planet = null
    for (var i = 0; i < attractors.length; i++) if (attractors[i].kind === "planet") planet = attractors[i]
    var entries = moonEntries()
    var keys = JSON.stringify(entries)
    if (keys === moonKeys && bodies.length) return
    moonKeys = keys
    var kept = ({}), list = [], maxId = 0
    for (var b = 0; b < bodies.length; b++) {
      maxId = Math.max(maxId, bodies[b].id)
      if (bodies[b].kind === "moon") kept[bodies[b].label || ("#" + bodies[b].variant)] = bodies[b]
      else list.push(bodies[b])
    }
    var moons = []
    if (planet) {
      if (entries.length === 0) entries = [{ name: "", kind: "decor" }, { name: "", kind: "decor" }]
      for (var k = 0; k < entries.length; k++) {
        var key = entries[k].name || ("#" + k)
        var radius = (350 + k * 22) * (planet.scale || 1)
        var body = kept[key]
        if (!body || Math.abs(body.orbitRadius - radius) > 1)
          body = Physics.orbitBody(++maxId, "moon", planet, radius, k * 2.4 + 0.4, false,
            { variant: k, r: 16, orbitRadius: radius })
        body.label = entries[k].name
        body.moonKind = entries[k].kind
        moons.push(body)
      }
    }
    bodies = moons.concat(list)
    var map = ({})
    for (var m = 0; m < moons.length; m++) if (moons[m].label) map[moons[m].label] = moons[m]
    if (fleetCtx) fleetCtx.moons = map
    moonMap = map
    moonVersion++
  }
  property var moonMap: ({})

  function advance(frameTime) {
    var dt = Math.min(Math.max(frameTime, 0), 0.05)
    if (dt <= 0) return
    t += dt
    Physics.step(world, bodies, attractors, dt, rand)
    for (var tb = 0; tb < bodies.length; tb++) {
      var th = bodies[tb]
      if (th.baseMax !== undefined && th.maxSpeed > th.baseMax) th.maxSpeed = Math.max(th.baseMax, th.maxSpeed * (1 - 0.6 * dt))
    }

    if (cfg.comets) {
      nextComet -= dt
      if (nextComet <= 0) {
        for (var i = 0; i < bodies.length; i++) {
          if (bodies[i].kind === "comet" && !bodies[i].active) {
            Physics.launchComet(bodies[i], world, rand)
            break
          }
        }
        nextComet = randRange(cfg.cometEvery)
      }
    }

    if (t >= sceneEnd) pickScene()
    if (episode && t >= episodeEnd) {
      episode = ""
      episodeState = null
      // While the screensaver shows, episodes follow one another (marathon).
      nextEpisode = t + (screensaver.active && cfg.marathon ? 4 : randRange(episodeRange()))
      // Something happened meanwhile: answer it now, if it is still fresh.
      var queued = pendingEvent
      pendingEvent = null
      if (queued && t - queued.at < 90) startEpisode(queued.id, queued.vars)
    } else if (!episode && cfg.episodes && t >= nextEpisode) {
      if (!startEpisode("")) nextEpisode = t + 60
    }

    // Space weather eases toward the latest readings.
    var k = Math.min(1, dt * 0.5)
    cpu += (cpuTarget - cpu) * k
    ram += (ramTarget - ram) * k
    gpu += (gpuTarget - gpu) * k
    wheelAngle = (wheelAngle + dt * (4 + gpu * 40)) % 360
    rockClock += dt
    if (rockClock > 2) { rockClock = 0; syncRocks() }

    accum += dt
    if (accum >= 1 / cfg.fps - 0.002) {
      accum = 0
      if (episode) episodeState = Episodes.state(episode, t - episodeStart, episodeCtx())
      frame++
    }
  }

  // ------------------------------------------------------------ vignettes

  // Little scenes on the castaway asteroid, in the spirit of the old living
  // screensavers: each one plays for a while, then something else happens.
  readonly property var sceneNames: ["idle", "fish", "wave", "sleep", "cat", "fish", "stargaze"]
  property string scene: "idle"
  property real sceneStart: 0
  property real sceneEnd: 20
  property int caught: 0

  function pickScene() {
    var next = scene
    var guard = 0
    while (next === scene && guard++ < 10) next = sceneNames[Math.floor(rand() * sceneNames.length)]
    enterScene(next, randRange(cfg.sceneSeconds) + (next === "wave" ? 6 : 0))
  }

  function enterScene(next, seconds) {
    if (scene === "fish") caught = Math.min(6, caught + Math.floor((t - sceneStart) / 6))
    scene = next
    sceneStart = t
    sceneEnd = t + seconds
    if (next === "fish" && caught >= 6) caught = 0
    // Stargazing is better with a shooting star.
    if (next === "stargaze" && cfg.comets) nextComet = Math.min(nextComet, 2)
  }

  // ------------------------------------------------------------ episodes

  // Every few minutes a short story crosses the panorama. The stories are
  // data in episodes/*.js (see EPISODES.md); episodes.js turns the running
  // one into episodeState each frame and EpisodeView draws it. Some only
  // happen at night, on certain dates or under load (their `when`).
  property string episode: ""
  property real episodeStart: -1000
  property real episodeEnd: -1000
  property real nextEpisode: 60
  property var recentEpisodes: []
  property var episodeState: null

  function episodeRange() {
    var r = cfg.episodeEvery
    var lo = Array.isArray(r) ? Number(r[0]) : NaN, hi = Array.isArray(r) ? Number(r[1]) : NaN
    lo = isFinite(lo) ? Math.max(20, lo) : 120
    hi = isFinite(hi) ? Math.max(lo, hi) : Math.max(lo, 300)
    return [lo, hi]
  }

  function episodeCtx() {
    var p = null, c = null, s = null
    for (var i = 0; i < attractors.length; i++) {
      // Episodes are drawn at full size: small companions (zones.js) don't host them.
      if (attractors[i].scale < 1) continue
      if (attractors[i].kind === "planet") p = attractors[i]
      if (attractors[i].kind === "castaway") c = attractors[i]
      if (attractors[i].kind === "station") s = attractors[i]
    }
    var sky = skyBody, sun = null, moon = null
    if (sky) {
      var pos = { x: sky.x * world.width, y: sky.y * world.height }
      if (sky.kind === "sun") sun = pos
      else moon = pos
    }
    var now = new Date()
    var vars = { time: Qt.formatTime(now, "HH:mm"), date: Qt.formatDate(now, "dd-MM") }
    for (var k in episodeVars) vars[k] = episodeVars[k]
    // Where "w0.5" lands (episodes.js coord): the castaway's screen, or the
    // screen nearest the middle, never the bezel between two screens.
    var mid = c ? c.x : world.width / 2
    if (!c) {
      var best = 1e9
      for (var z = 0; z < zones.length; z++)
        if (Math.abs(zones[z].x - world.width / 2) < best) { best = Math.abs(zones[z].x - world.width / 2); mid = zones[z].x }
    }
    return { W: world.width, H: world.height, mid: mid, planet: p, castaway: c, station: s, sun: sun, moon: moon,
      bob: Math.round(Math.sin(t * 0.5) * 3) * 2, vars: vars }
  }

  // What episodes may depend on: time of day, date, load, agents at work.
  function episodeNow() {
    var d = new Date()
    var minutes = Day.minutesOf(d)
    var busy = false
    for (var a in ships) if (ships[a] && ships[a].mode === "mission") busy = true
    return {
      hour: minutes / 60,
      night: minutes < Day.parseClock(cfg.sunrise, 395) || minutes >= Day.parseClock(cfg.sunset, 1240),
      month: d.getMonth() + 1,
      date: Qt.formatDate(d, "MM-dd"),
      weekday: d.getDay(),
      cpu: cpu,
      ram: ram,
      gpu: gpu,
      busy: busy,
      scene: scene,
      home: look.home,
      special: specialToday(d)
    }
  }

  // name "" picks one at random. Returns false when it cannot play here.
  // vars are what a triggering event passed on ($agentName, $agentColor...).
  function startEpisode(name, vars) {
    episodeVars = vars || ({})
    var ctx = episodeCtx()
    if (!name) name = Episodes.pick(rand, recentEpisodes, ctx, episodeNow())
    if (!name || !Episodes.available(name, ctx)) return false
    var len = Episodes.length(name)
    episode = name
    episodeStart = t
    episodeEnd = t + len
    var recent = recentEpisodes.slice(-15)
    recent.push(name)
    recentEpisodes = recent
    var ep = Episodes.get(name)
    if (ep.island && ep.island.scene && ctx.castaway) enterScene(ep.island.scene, len + 4)
    episodeState = Episodes.state(name, 0, ctx)
    return true
  }

  // Special dates: the ones in config (specialDates: { birthday: "05-14" })
  // plus Omarchy's anniversary, from when this system was installed.
  property real installedAt: 0
  Process {
    command: ["stat", "-c", "%W", "/etc/machine-id"]
    running: true
    stdout: StdioCollector { onStreamFinished: { var v = Number(String(text).trim()); if (v > 0) root.installedAt = v * 1000 } }
  }

  function specialToday(d) {
    var md = Qt.formatDate(d, "MM-dd"), out = []
    var list = cfg.specialDates || {}
    for (var name in list) if (String(list[name]) === md) out.push(name)
    if (installedAt > 0) {
      var since = new Date(installedAt)
      if (Qt.formatDate(since, "MM-dd") === md && d.getFullYear() > since.getFullYear()) out.push("omarchy")
    }
    return out
  }

  // Something happened (see Episodes.EVENTS): play the episode that answers
  // it, or queue it behind the one playing. Each event has a cooldown so a
  // busy afternoon does not turn into nonstop confetti. force skips it.
  property var episodeVars: ({})
  property var pendingEvent: null
  property var eventLast: ({})

  function fireEvent(name, vars, force) {
    if (!cfg.enabled || !cfg.episodes || (!cfg.eventEpisodes && !force)) return ""
    var last = eventLast[name]
    var cooldown = Episodes.COOLDOWNS[name] || 60
    if (!force && last !== undefined && t - last < cooldown) return ""
    var id = Episodes.forEvent(rand, name, episodeCtx(), episodeNow(), recentEpisodes)
    if (!id) return ""
    var stamps = eventLast
    stamps[name] = t
    eventLast = stamps
    if (episode) {
      if (Episodes.NO_QUEUE.indexOf(name) >= 0) return ""
      pendingEvent = { id: id, vars: vars || ({}), at: t }
    } else startEpisode(id, vars)
    return id
  }

  // A click on the dog, the cat or the astronaut: one of its episodes, now.
  // Clicks during another episode do nothing (the tooltip says so).
  function clickCharacter(who) {
    if (episode || !cfg.episodes) return ""
    var name = { dog: "clickDog", cat: "clickCat", astronaut: "clickAstronaut" }[who]
    return name ? fireEvent(name, ({}), true) : ""
  }

  // Demo values for `omarchy-shell lnavarrocarter.cosmos event <name>`.
  function demoEvent(name) {
    return fireEvent(name, { agent: "claude", agentName: Fleet.LABELS.claude || "Claude",
      agentColor: agentColors.claude || "#ffd65a" }, true)
  }

  // You stepped away / came back (idle inhibitors such as video keep it quiet).
  property real idleSince: 0
  IdleMonitor {
    enabled: root.cfg.enabled && root.cfg.episodes && root.cfg.eventEpisodes
    timeout: Math.max(30, Number(root.cfg.idleSeconds) || 120)
    respectInhibitors: true
    onIsIdleChanged: {
      if (isIdle) { root.idleSince = Date.now(); root.fireEvent("idle") }
      else if (root.idleSince > 0 && Date.now() - root.idleSince > 60000) root.fireEvent("back")
    }
  }

  // ------------------------------------------------------------ throwing rocks

  // Drag a drifting rock with the mouse and let go to throw it: while held it
  // follows the pointer (physics skips it); on release it keeps the pointer's
  // recent velocity, so inertia and gravity take it from there.
  property var heldRock: null

  function rockById(id) {
    for (var i = 0; i < bodies.length; i++) if (bodies[i].id === id) return bodies[i]
    return null
  }

  function grabRock(id, wx, wy) {
    var b = rockById(id)
    if (!b || b.kind !== "rock" || !cfg.throwRocks) return false
    if (b.baseMax === undefined) b.baseMax = b.maxSpeed
    b.held = true
    b.vx = 0; b.vy = 0
    heldRock = { id: id, samples: [{ x: wx, y: wy, at: Date.now() }], dx: b.x - wx, dy: b.y - wy }
    return true
  }

  function dragRock(wx, wy) {
    if (!heldRock) return
    var b = rockById(heldRock.id)
    if (!b) return
    b.x = Physics.wrap(wx + heldRock.dx, world.width)
    b.y = Math.max(-100, Math.min(world.height + 100, wy + heldRock.dy))
    var list = heldRock.samples.concat([{ x: wx, y: wy, at: Date.now() }])
    heldRock.samples = list.slice(-6)
  }

  function throwRock() {
    if (!heldRock) return
    var b = rockById(heldRock.id), list = heldRock.samples
    heldRock = null
    if (!b) return
    b.held = false
    var a = list[0], z = list[list.length - 1], dt = Math.max(0.016, (z.at - a.at) / 1000)
    var vx = Physics.wrapDelta(z.x - a.x, world.width) / dt, vy = (z.y - a.y) / dt
    var sp = Math.sqrt(vx * vx + vy * vy), max = 900
    if (sp > max) { vx *= max / sp; vy *= max / sp }
    b.vx = vx; b.vy = vy
    b.va = (Math.random() - 0.5) * 200
    // Thrown rocks may fly faster than drifting ones, then slow back down.
    b.maxSpeed = Math.max(b.baseMax, Math.min(max, sp))
  }

  // Whether an episode has taken the dog, cat or astronaut off the island.
  function islandHidden(who) {
    return !!episodeState && !!episodeState.hide && !!episodeState.hide[who]
  }

  // ------------------------------------------------------------ weather

  // system_probe.py: CPU stirs storms on the planet, RAM thickens the
  // asteroid field, GPU spins and lights the station. With projectMoons it
  // also asks Workbench (local.workbench), if installed, for project names.
  property real cpuTarget: 0
  property real ramTarget: 0.3
  property real gpuTarget: 0
  property real cpu: 0
  property real ram: 0.3
  property real gpu: 0
  property real wheelAngle: 0
  property bool cpuHot: false
  property int weatherReadings: 0
  property real rockClock: 0
  property var weather: null

  function pct(v) { v = Number(v); return isFinite(v) ? Math.max(0, Math.min(100, v)) / 100 : 0 }

  function applyWeather(text) {
    var d
    try { d = JSON.parse(String(text || "")) } catch (e) { return }
    if (!d || typeof d !== "object") return
    if (!cfg.weather) d = { projects: d.projects }
    cpuTarget = pct(d.cpu)
    // The first readings come while the shell itself is starting: skip them.
    weatherReadings++
    if (cpuTarget > 0.85 && !cpuHot && weatherReadings > 3) { cpuHot = true; fireEvent("cpuSpike") }
    else if (cpuTarget < 0.6) cpuHot = false
    ramTarget = pct(d.ram)
    var g = Array.isArray(d.gpus) && d.gpus.length ? d.gpus[0] : null
    gpuTarget = g ? pct(g.usage) : 0
    weather = { cpu: Math.round(cpuTarget * 100), ram: Math.round(ramTarget * 100), gpu: g ? Math.round(gpuTarget * 100) : -1 }
    var names = []
    if (Array.isArray(d.projects))
      for (var i = 0; i < d.projects.length && i < 12; i++)
        if (d.projects[i] && typeof d.projects[i].name === "string") names.push(d.projects[i].name)
    if (JSON.stringify(names) !== JSON.stringify(projectNames)) { projectNames = names; syncMoons() }
  }

  // More memory pressure, more rocks: between half and twice cfg.rocks.
  function syncRocks() {
    var want = Math.round(cfg.rocks * (0.5 + 1.5 * ram))
    var n = 0
    for (var i = 0; i < bodies.length; i++) {
      var b = bodies[i]
      if (b.kind !== "rock") continue
      var on = n++ < want
      if (on && !b.active) {
        // Drift in from above or below, off screen.
        b.y = rand() < 0.5 ? -50 : world.height + 50
        b.x = rand() * world.width
        b.vy = (b.y < 0 ? 1 : -1) * (10 + rand() * 20)
      }
      b.active = on
    }
  }

  Process {
    id: weatherProc
    command: ["python3", root.pluginPath("system_probe.py")].concat(root.cfg.projectMoons ? ["--projects"] : [])
    stdout: StdioCollector { onStreamFinished: root.applyWeather(text) }
  }

  Timer {
    interval: Math.max(5, Number(root.cfg.weatherSeconds) || 15) * 1000
    running: root.cfg.enabled && (root.cfg.weather || root.cfg.projectMoons) && root.layoutVersion > 0
    repeat: true
    triggeredOnStart: true
    onTriggered: if (!weatherProc.running) weatherProc.running = true
  }

  // ------------------------------------------------------------ fleet

  // The agents as ships. A read-only probe reports Hub tasks and today's
  // token use; ships launch, orbit, wait and come home from that.
  property var fleetData: null
  property var fleetCtx: null
  property var ships: ({})
  property var scoutList: []
  property real lastSeenPrompt: -1
  property int fleetVersion: 0

  function applyFleet(text) {
    var data
    try { data = JSON.parse(String(text || "")) } catch (e) { return }
    if (!data || typeof data !== "object" || !data.agents || !data.hub) return
    if (!Array.isArray(data.hub.tasks)) data.hub.tasks = []
    if (!Array.isArray(data.events)) data.events = []
    if (!fleetCtx) { fleetCtx = Fleet.layout(world, attractors); fleetCtx.moons = moonMap }
    fleetData = data
    var ws = Array.isArray(data.hub.workspaces) ? data.hub.workspaces : []
    if (JSON.stringify(ws) !== JSON.stringify(workspaceNames)) { workspaceNames = ws; syncMoons() }
    var before = ships
    ships = Fleet.update(ships, data, fleetCtx, t, Number(cfg.interactiveSeconds) || 120)
    var evs = Episodes.fleetEvents(before, ships, Fleet.LABELS, agentColors)
    for (var e = 0; e < evs.length; e++) fireEvent(evs[e].name, evs[e].vars)
    // Prompts already made before the scene started are not replayed.
    if (lastSeenPrompt < 0) lastSeenPrompt = Number(data.time) || 0
    var r = Fleet.scouts(scoutList, data.events, lastSeenPrompt, t)
    if (r.lastSeen > lastSeenPrompt && fleetVersion > 0) fireEvent("prompt")
    scoutList = r.list
    lastSeenPrompt = r.lastSeen
    fleetVersion++
  }

  Process {
    id: fleetProc
    command: ["python3", root.pluginPath("fleet_probe.py")].concat(root.cfg.hub ? [] : ["--no-hub"])
      .concat(root.cfg.ollamaJournal ? ["--ollama", String(root.cfg.ollamaJournal)] : [])
    stdout: StdioCollector {
      onStreamFinished: root.applyFleet(text)
    }
  }

  Timer {
    interval: Math.max(5, Number(root.cfg.fleetSeconds) || 10) * 1000
    running: root.cfg.enabled && root.cfg.fleet && root.layoutVersion > 0
    repeat: true
    triggeredOnStart: true
    onTriggered: if (!fleetProc.running) fleetProc.running = true
  }

  // ------------------------------------------------------------ clicks

  // Optional companions: Coordination (the agent Hub) and Workbench
  // (projects). Clicks open them only when they are installed.
  property bool hasCoordination: false
  property bool hasWorkbench: false
  readonly property string pluginsDir: Quickshell.env("HOME") + "/.config/omarchy/plugins/"
  Process {
    command: ["test", "-f", root.pluginsDir + "local.coordination/manifest.json"]
    running: true
    onExited: function(code) { root.hasCoordination = code === 0 }
  }
  Process {
    command: ["test", "-f", root.pluginsDir + "local.workbench/manifest.json"]
    running: true
    onExited: function(code) { root.hasWorkbench = code === 0 }
  }
  function canOpen(target) {
    return (target === "local.coordination" && hasCoordination) || (target === "local.workbench" && hasWorkbench)
  }

  // Only these panels can be opened from the scene (or an episode started).
  function openPanel(target) {
    if (target === "episode") { if (!episode && cfg.episodes) startEpisode(""); return }
    if (target === "click:dog" || target === "click:cat" || target === "click:astronaut") { clickCharacter(target.slice(6)); return }
    if (!canOpen(target)) return
    Quickshell.execDetached(["omarchy-shell", "-q", target, "open"])
  }

  // ------------------------------------------------------------ day cycle

  // Sun by day, moon by night across the panorama; a rocket every hour.
  property var skyBody: null
  property int clockVersion: 0
  property string moonDay: ""
  property real rocketStart: -1000
  property string rocketLabel: ""

  function updateClock() {
    var now = new Date()
    var minutes = Day.minutesOf(now)
    skyBody = Day.skyBody(minutes, Day.parseClock(cfg.sunrise, 395), Day.parseClock(cfg.sunset, 1240))
    var day = now.toDateString()
    if (day !== moonDay && sprites.planet) {
      moonDay = day
      var sp = sprites
      sp.moonNow = Sprites.moonPhase(20, Day.moonPhase(now))
      sprites = sp
    }
    clockVersion++
  }

  function launchRocket(label) {
    rocketLabel = label || Qt.formatTime(new Date(), "HH:mm")
    rocketStart = t
    fireEvent("hour", { time: rocketLabel })
  }

  Timer {
    interval: 20000
    repeat: true
    running: root.cfg.enabled && root.cfg.dayCycle && root.layoutVersion > 0
    triggeredOnStart: true
    onTriggered: root.updateClock()
  }

  // Fires on the hour: re-armed each time for the next o'clock.
  Timer {
    id: hourTimer
    repeat: false
    running: root.cfg.enabled && root.cfg.hourlyRocket && root.layoutVersion > 0
    onRunningChanged: if (running) interval = Day.msToNextHour(new Date()) + 300
    onTriggered: {
      root.launchRocket(Day.hourLabel(new Date()))
      interval = Day.msToNextHour(new Date()) + 300
      restart()
    }
  }

  // ------------------------------------------------------------ pausing

  function screenCovered(screen) {
    if (!cfg.pauseOnFullscreen || !screen) return false
    var m = Hyprland.monitorFor(screen)
    var ws = m ? m.activeWorkspace : null
    return !!(ws && ws.hasFullscreen)
  }

  readonly property bool everyScreenCovered: {
    var ss = usedScreens
    if (!ss || ss.length === 0) return false
    for (var i = 0; i < ss.length; i++) if (!screenCovered(ss[i])) return false
    return true
  }

  FrameAnimation {
    running: root.cfg.enabled && (!root.everyScreenCovered || screensaver.active) && root.layoutVersion > 0
    onTriggered: root.advance(frameTime)
  }

  Connections {
    target: Quickshell
    function onScreensChanged() { root.rebuild() }
  }

  // ------------------------------------------------------------ screensaver

  // Cosmos Studio, the settings window (Studio.qml).
  Studio { id: studio; sim: root }
  function toggleStudio() { studio.toggle() }
  function openStudio(tab) { if (tab) studio.tab = tab; studio.open() }
  function describePlanet(text) { studio.describePlanet(text) }

  Screensaver {
    id: screensaver
    sim: root
    onActiveChanged: if (active && root.cfg.marathon && !root.episode) root.nextEpisode = Math.min(root.nextEpisode, root.t + 3)
  }

  // ------------------------------------------------------------ surfaces

  Variants {
    model: root.usedScreens

    PanelWindow {
      id: panel
      required property var modelData

      screen: modelData
      visible: root.cfg.enabled && root.layoutVersion > 0 && !root.screenCovered(modelData)
      color: "#05060f"
      anchors { top: true; bottom: true; left: true; right: true }
      exclusionMode: ExclusionMode.Ignore
      // Above Omarchy's own background layer, below every window, and
      // transparent to the pointer so desktop clicks still reach Omarchy.
      WlrLayershell.layer: WlrLayer.Bottom
      WlrLayershell.namespace: "cosmos"
      WlrLayershell.keyboardFocus: WlrKeyboardFocus.None
      // Click-through except over the ships, hangars, billboard, moons and island.
      mask: Region {
        Region { item: sky.hitItem(0) }
        Region { item: sky.hitItem(1) }
        Region { item: sky.hitItem(2) }
        Region { item: sky.hitItem(3) }
        Region { item: sky.hitItem(4) }
        Region { item: sky.hitItem(5) }
        Region { item: sky.hitItem(6) }
        Region { item: sky.hitItem(7) }
        Region { item: sky.hitItem(8) }
        Region { item: sky.hitItem(9) }
        Region { item: sky.hitItem(10) }
        Region { item: sky.hitItem(11) }
        Region { item: sky.hitItem(12) }
        Region { item: sky.hitItem(13) }
        Region { item: sky.hitItem(14) }
        Region { item: sky.hitItem(15) }
        Region { item: sky.hitItem(16) }
        Region { item: sky.hitItem(17) }
        Region { item: sky.hitItem(18) }
        Region { item: sky.hitItem(19) }
        Region { item: sky.hitItem(20) }
        Region { item: sky.hitItem(21) }
        Region { item: sky.hitItem(22) }
        Region { item: sky.hitItem(23) }
        Region { item: sky.hitItem(24) }
        Region { item: sky.hitItem(25) }
        Region { item: sky.hitItem(26) }
        Region { item: sky.hitItem(27) }
        Region { item: sky.hitItem(28) }
      }

      readonly property var hyprMonitor: Hyprland.monitorFor(modelData)

      SkyView {
        id: sky
        anchors.fill: parent
        workspaceId: panel.hyprMonitor && panel.hyprMonitor.activeWorkspace ? panel.hyprMonitor.activeWorkspace.id : -1
        sim: root
        screenName: panel.modelData.name
      }
    }
  }
}
