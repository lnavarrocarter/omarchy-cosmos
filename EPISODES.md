# Episodios de Cosmos

Un episodio es una pequeña historia que cruza el panorama cada pocos minutos.
Cada episodio es **solo datos** dentro de un pack (`episodes/*.js`). El motor
(`episodes.js`) lo convierte en posiciones por frame y `EpisodeView.qml` lo
dibuja. Para agregar uno no hay que tocar QML: se escribe el objeto, se
agrega su pixel art al `ART` del pack y se corren los tests.

```bash
node --test tests/                                   # valida TODOS los episodios
node tools/storyboard.js <id> /tmp/x.png [t1 t2 …]   # dibuja instantes del episodio en un PNG
omarchy restart shell                                # recargar el servicio
omarchy-shell lnavarrocarter.cosmos episodes                  # lista los ids
omarchy-shell lnavarrocarter.cosmos episode <id|random>       # reproducir uno ahora
omarchy-shell lnavarrocarter.cosmos event <evento>            # simular un evento (ver abajo)
```

Además, **hacer clic en la isla** dispara un episodio al azar, y **hacer clic en el
perro, el gato o el astronauta** dispara una de sus reacciones
(`omarchy-shell lnavarrocarter.cosmos click <dog|cat|astronaut>` hace lo mismo).

## Eventos

Los episodios con `on` no salen al azar: responden a lo que pasa en el equipo.

| evento | cuándo | variables | enfriamiento |
| --- | --- | --- | --- |
| `taskDone` | una tarea del Hub terminó bien | `$agent`, `$agentName`, `$agentColor` | 20 s |
| `taskFailed` | una tarea del Hub falló | ídem | 20 s |
| `needsInput` | un agente espera tu respuesta | ídem | 60 s |
| `prompt` | le escribiste a un agente (Claude Code / Codex) | — | 5 min |
| `idle` | llevas `idleSeconds` (120) sin tocar nada | — | 10 min |
| `back` | volviste tras más de un minuto fuera | — | 2 min |
| `cpuSpike` | la CPU pasa del 85 % (no en las primeras lecturas tras arrancar) | — | 10 min |
| `clickDog`, `clickCat`, `clickAstronaut` | clic en ese personaje (solo si no hay otro episodio) | — | 2 s |
| `hour` | sale el cohete de cada hora (24 s de -420 a ancho+420, y ≈ h0.2) | `$time` | 30 min |

`hour` y los clics nunca quedan en cola: si hay otro episodio, se pierden.
Siempre existen `$time` ("14:05") y `$date` ("11-12").

Si ya hay un episodio en curso, el evento queda en cola y se reproduce al
terminar (si no pasaron más de 90 s). Las variables se usan dentro de textos y
colores: `text: "$agentName \u2713"`, `color: "$agentColor"`. `eventEpisodes: false`
en `config.json` apaga solo los eventos. Para que un episodio con `on` también
salga al azar, agrega `random: true`.

## Packs

| pack | zona | contenido |
| --- | --- | --- |
| `episodes/island.js` | isla del náufrago | perro, astronauta, gato |
| `episodes/planet.js` | gigante gaseoso | anillo, nubes, lunas |
| `episodes/station.js` | estación | rueda, módulo, escotilla |
| `episodes/sky.js` | todo el panorama | criaturas que cruzan las 3 pantallas |
| `episodes/seasonal.js` | según fecha | Navidad, Halloween, fiestas |
| `episodes/events.js` | según evento | tareas del Hub, prompts, inactividad, CPU |
| `episodes/clicks.js` | clic en un personaje | perro, gato, astronauta |
| `episodes/island2.js` | isla | pulpo, cumpleaños, fogata, vecino, hormigas, guitarra, pesca épica, fósil, nido, muñeco de nieve, asado, robot, tormenta de arena |
| `episodes/planet2.js` | planeta y sol | carrera en el anillo, gusano, ballena de gas, círculo en las nubes, basurero, turistas, mantarrayas, choque, SOS, estornudo, eclipse |
| `episodes/station2.js` | estación | básquetbol, atraque, enredadera, aspiradora, grúa, señal, pesca, paneles, pan quemado, vecinos, fiesta, simulacro, bomberos, rave |
| `episodes/sky2.js` | panorama | gato en caja, avión de papel, cardumen, tortuga, burbujas, mariposas, bolas de nieve, caracoles, autostop |
| `episodes/sky3.js` | panorama | cometa sin cola, banda, pulpo, velero solar, pez abisal, nave nodriza, pájaros cometa, agujero de gusano, luciérnagas con la hora |
| `episodes/dates2.js` | fechas y estado | Pascua, cueca, dragón de papel, árbol de Navidad, Perseidas/Gemínidas, viernes, búho, gallo, cumpleaños, aniversario, atasco por RAM |

Para crear un pack nuevo: crea el archivo con `ART` y `EPISODES`, impórtalo
arriba de `episodes.js` (`.import "episodes/x.js" as PackX`) y súmalo a `PACKS`.

## Formato

```js
{
  id: "pizza",                 // único; es lo que va en `omarchy-shell ... episode`
  title: "Pizza a domicilio",  // para el catálogo
  zone: "island",              // island | planet | station | castaway | world | sun | moon
  length: 30,                  // segundos
  weight: 1,                   // probabilidad relativa (0 = solo manual)
  on: "taskDone",              // solo por evento (ver Eventos)
  when:  { night: true },      // condición obligatoria (ver abajo)
  boost: { months: [9], weight: 5 },  // multiplica el peso si se cumple
  manual: false,               // true = nunca al azar, solo por comando
  island: { scene: "wave", hide: { dog: [4, 36] } },  // escena del náufrago y quién se ausenta
  effects: { wind: [2, 20, 25], lights: [0, 15, "party"] },  // viento en la palmera (grados) y luces
                                                             // de la estación ("party" | "alarm")
  actors: [...], shots: [...], bursts: [...], particles: [...], ropes: [...], beams: [...]
}
```

### Coordenadas

Los números son desplazamientos en píxeles desde el **ancla de la zona**. Las
cadenas son absolutas: `"above"` / `"below"` (fuera de pantalla), `"w0.5"`
(mitad del ancho del mundo), `"h0.3-40"` (30 % del alto, menos 40 px). El
mundo da la vuelta, así que en la zona `world` conviene aparecer con `fade`.

- **island**: `y = 0` es la arena. Palmera −136, perro −78, astronauta −18
  (cabeza en y −50), fogata +34, gato +66, carpa +116; la cúpula llega a y −135.
- **planet**: centro del planeta; disco de radio 240; anillo ≈ 375 × 112
  inclinado 11,5°.
- **station**: centro de la rueda (borde ≈ 123); módulo de x +140 a +316,
  escotilla en (+318, 0).
- **sun** / **moon**: donde está ahora el sol (de día) o la luna (de noche); el
  episodio solo puede salir si ese astro está en el cielo.

### Actores

```js
{ id: "ufo",
  sprite: "cow",                    // o frames: ["ufo0", "ufo1"], fps: 6
                                    // o swap: [[0, "dogShip"], [5, "dogShipCrew"]]
  text: "!", color: "#ffd65a", size: 22,   // en vez de sprite: un texto/glifo
  px: 4,                            // tamaño del píxel
  show: [3, 26], fade: [1, 2],      // ventana visible y fundidos (s)
  blink: { every: 4, dur: 1 },      // aparece a intervalos
  opacity: 0.5, glow: { r: 50, color: "#7df9ff", a: 0.15, dy: 10 },
  facesLeft: true,                  // el arte mira a la izquierda (humo/escape van atrás)
  path: [                           // keyframes
    { t: 3, x: -240, y: "above" },
    { t: 9, x: 515, y: -270, ease: "out" },     // linear | in | out | inOut | sine
    { t: 12, x: 0, y: 18, on: "rock" },         // relativo a otro actor (se espeja con él)
    { t: 14, x: 40, y: 0, arc: 40, rot: 90, scale: 0.5, o: 0.3, flip: true }
  ],
  orbit: { rx: 375, ry: 112, tilt: 11.5, from: 160, to: 560, t0: 1, t1: 26,
           hideBehind: 250, faceMotion: true },  // en vez de path
  wobble: [{ from: 9, to: 19, x: 14, y: 6, speed: 2, rot: 4 }],  // vaivén
  spin: 90,                         // grados por segundo
  gait: false }                     // ver "Marchas" abajo
```

**Marchas.** Un actor con sprite `dog`, `catSit` o `astronaut` mueve las patas solo
(`dogRun0/1`, `catWalk0/1`, `astronautWalk0/1`) mientras avanza de lado por un tramo
llano de su path en la isla, sin ir montado (`on`) ni girando. Fuera de la isla hace
falta `gait: true`; `gait: false` lo deja quieto. Saltar en el sitio no cuenta como correr.

`island.hide` acepta `dog`, `cat`, `astronaut`, `jar` (el frasco de estrellas) y `rod`
(la caña y la línea de la escena "fish").

Un actor sin `sprite` ni `text` es un **punto invisible**: sirve de ancla para
cuerdas, partículas o disparos (por ejemplo, la mano del astronauta).

### Efectos

```js
shots:     [{ from: "ship", to: "pirate", start: 12.5, every: 1.3, count: 9, travel: 0.6,
              kind: "laser" /* | "ball" */, glyph: "♥", hit: true, miss: [-260, 65],
              fromOffset: [34, 0], toOffset: [-30, 0], arc: 0 }]
bursts:    [{ at: "pirate", t: 23.5, duration: 2.5, count: 4, size: 46, colors: [...] }]
particles: [{ at: "ship" /* o region: { x, y, w, h } */, from: 0, to: 40,
              style: "exhaust", count: 6, rate: 3, offset: [-34, 4], trail: true,
              every: 4.5, dur: 1.4,               // ráfagas: todas nacen juntas
              pulse: { every: 8, dur: 1.6 },      // emite solo a intervalos
              color: ["#fff", "#ff0"], size: 1, glyph: "♪" }]
ropes:     [{ a: "hand", b: "kite", sag: 30, color: "#d8e6ff", aOffset: [0, 0], bOffset: [0, 14] }]
beams:     [{ src: "ufo", dst: "rock", show: [9.5, 18.5], dstOffset: [0, -18] }]
```

Estilos de partícula: `smoke`, `exhaust` (`forward: true` = aliento de
fuego), `spout`, `sparks` (`radius`), `rise` (`height`), `fall`, `streak`
(`angle`, `length`), `twinkle`.

Límites por frame (los tests los verifican): 16 actores, 16 disparos, 16
destellos, 64 partículas, 3 cuerdas y 2 rayos.

### Condiciones (`when` y `boost`)

`night`, `hours: [22, 6]`, `months: [12]`, `dates: ["12-31"]`, `weekdays: [5]`
(0 = domingo), `cpuAbove: 0.7`, `cpuBelow`, `ramAbove`, `ramBelow`, `busy` (algún agente en misión),
`scene: ["sleep"]` (lo que hace el náufrago: idle, fish, wave, sleep, cat, stargaze),
`gpuAbove: 0.6`, `special: "birthday"` (fechas de `specialDates` en `config.json`, por
ejemplo `{ "birthday": "05-14" }`; `"omarchy"` es el aniversario de instalación, detectado solo),
`home: ["island"]` (la casa elegida en el Studio: island, planetoid, castle, ship; úsalo cuando el
episodio depende de la palmera o la carpa, que solo existen en la isla).

Los actores con sprite `astronaut`, `catSit`, `dog` (y sus marchas) se dibujan con los colores que
el usuario eligió en el Studio; el arte propio de un pack no cambia de color.

### Pixel art

Los nombres de `ART` son globales: usa un prefijo propio del pack (`i2_`, `st2_`…).
Un test falla si dos packs usan el mismo nombre.

En `ART`, cada sprite es una lista de filas o `{ rows, colors }`. Letras de la
paleta: `K` contorno, `W` blanco, `G` gris, `V`/`D` visor, `O` naranja, `R`
rojo, `Y` amarillo, `C`/`c` naranja y café, `P` rosado, `B` vidrio
translúcido, `S`/`s` arena, `M`/`m` roca, `L`/`l` verde, `T` madera, `N`/`n`
metal, `A`/`a` azul, `Q` cian. `colors` agrega letras propias:
`{ x: "#ff00ff" }` o `{ x: ["#ff00ff", 180] }` (con alfa). Los sprites del
núcleo (`astronaut`, `dog`, `cat`, `fish`, `cow`, `ufo0`, `pirate`, `whale`,
`shuttle`, `rocket`…) se pueden usar por nombre.

## Catálogo: 100 ideas

Las 100 están hechas (✅). En negrita, las primeras; con `id`, las demás. Pruébalas con
`omarchy-shell lnavarrocarter.cosmos episode <id>`; las que dependen de fecha o estado también salen así.

### Isla

1. ✅ **El perro contra los piratas**: mientras el astronauta duerme
2. ✅ **Pizza a domicilio**: llega un repartidor y deja la caja
3. ✅ **Volantín**: más frecuente en septiembre
4. ✅ **Lluvia de estrellas**: el astronauta mira el cielo; más de noche
5. ✅ **El gato y el perro se persiguen**: el gato se lleva el pescado
6. ✅ Un pulpo espacial asoma bajo la isla y se roba la caña — `octoRod`
7. ✅ Cumpleaños: torta con velas y globos que se escapan — `islandBirthday`
8. ✅ **Mensaje en una botella**
9. ✅ **Un coco en la cabeza**: con estrellitas girando
10. ✅ Se apaga la fogata y el perro trae ramas — `fireOut`
11. ✅ Pasa flotando un vecino en su propia isla y saludan — `neighbor`
12. ✅ Hormigas espaciales cargan la jarra de estrellas — `antsJar`
13. ✅ El astronauta toca guitarra (♪) y el perro aúlla — `astroGuitar`
14. ✅ Pesca épica: pica una ballena y arrastra la isla — `whaleBite`
15. ✅ El perro entierra un hueso y desentierra un fósil — `dogFossil`
16. ✅ Un pájaro espacial anida en la palmera — `birdNest`
17. ✅ Muñeco de nieve en la isla (diciembre) — `snowman`
18. ✅ Asado dieciochero con banderitas (18 de septiembre) — `asado`
19. ✅ Un robot vendedor ofrece cosas raras — `robotVendor`
20. ✅ Tormenta de arena; la palmera se dobla — `sandstorm`

### Planeta

21. ✅ **Abducción de la vaca**
22. ✅ **Surf en el anillo**
23. ✅ **Medusas espaciales**: más de noche
24. ✅ **Supertormenta**: evento `cpuSpike` (CPU sobre 85 %)
25. ✅ Carrera de naves alrededor del anillo (`orbit`) — `ringRace`
26. ✅ Un gusano gigante sale de las nubes y se sumerge — `cloudWorm`
27. ✅ Ballena de gas que salta del planeta — `gasWhale`
28. ✅ Un ovni dibuja un círculo en las nubes — `ufoCircle`
29. ✅ Camión basurero espacial recoge rocas — `garbageTruck`
30. ✅ Bus de turistas con flashes de cámara — `touristBus`
31. ✅ Bandada de mantarrayas cruza el anillo — `mantaFlock`
32. ✅ Cohete que aterriza mal: humo y piloto en paracaídas — `rocketCrash`
33. ✅ Satélite perdido parpadea SOS — `lostSatellite`
34. ✅ El planeta "estornuda" una nube — `planetSneeze`
35. ✅ Eclipse: la luna pasa frente al sol — `eclipse`

### Estación

36. ✅ **Calcetines a la deriva**
37. ✅ **Reparación en el exterior**: con cuerda de seguridad
38. ✅ Básquetbol en gravedad cero junto a la escotilla — `zeroGHoops`
39. ✅ Atraque fallido: una nave rebota contra la estación — `dockBounce`
40. ✅ Una planta del invernadero crece y sale por la ventana — `greenhouseVine`
41. ✅ La aspiradora robot escapa por la escotilla — `vacuumEscape`
42. ✅ Llega carga: grúa con cajas — `cargoCrane`
43. ✅ La antena recibe una señal alienígena (ondas) — `alienSignal`
44. ✅ Un tripulante pesca desde la escotilla — `spaceFishing`
45. ✅ Limpieza de paneles solares — `solarWash`
46. ✅ Humo de pan quemado saliendo de la cocina — `burntToast`
47. ✅ Saludo con una estación vecina que pasa — `neighborWave`
48. ✅ Fiesta: luces de colores en las ventanas — `stationParty`
49. ✅ Simulacro de incendio con luces rojas — `fireDrill`
50. ✅ **Paracaidistas del cohete de la hora** (evento `hour`)

### Cielo (cruzan todas las pantallas)

51. ✅ **Ballena espacial**
52. ✅ **Dragón de las estrellas**
53. ✅ **Patito de goma gigante**: con patitos
54. ✅ **Tren espacial**: con vagones de colores
55. ✅ **Globo aerostático**
56. ✅ Gato en una caja de cartón con propulsor — `boxCat`
57. ✅ Avión de papel gigante — `paperPlane`
58. ✅ Cardumen de peces luminosos — `glowSchool`
59. ✅ Tortuga gigante con un mundo en el caparazón — `worldTurtle`
60. ✅ Burbujas de jabón gigantes que revientan — `soapBubbles`
61. ✅ Mariposas cósmicas — `cosmicButterflies`
62. ✅ Pelea de bolas de nieve entre dos naves — `snowballFight`
63. ✅ Carrera de caracoles espaciales (muy lenta) — `snailRace`
64. ✅ Astronauta perdido haciendo dedo — `hitchhiker`
65. ✅ Un cometa pierde la cola y vuelve a buscarla — `cometLostTail`
66. ✅ Banda de música sobre un asteroide — `asteroidBand`
67. ✅ Pulpo gigante abrazando una roca — `octopusHug`
68. ✅ Velero solar — `solarSail`
69. ✅ Pez abisal con farol que atrae peces — `anglerFish`
70. ✅ Nave nodriza que tapa medio cielo — `mothership`
71. ✅ Bandada de pájaros cometa en V — `cometBirds`
72. ✅ Agujero de gusano: algo entra en una pantalla y sale en otra — `wormhole`
73. ✅ Luciérnagas que forman la hora — `firefliesTime`

### Fechas

74. ✅ **Trineo navideño**: diciembre
75. ✅ **Barco fantasma**: octubre, sobre todo el 31
76. ✅ **Fuegos artificiales**: de noche; seguro en Año Nuevo y Fiestas Patrias
77. ✅ **San Valentín**: corazones (14-02)
78. ✅ Pascua: un conejo salta entre rocas (abril) — `easterBunny`
79. ✅ **Calabazas flotantes**: octubre
80. ✅ Cueca de astronautas con pañuelos (18-09) — `cueca`
81. ✅ Año Nuevo chino: dragón de papel (febrero) — `paperDragon`
82. ✅ Árbol de Navidad de luces en la estación (diciembre) — `stationTree`
83. ✅ Perseidas y Gemínidas reales (12-08, 14-12) — `meteorShowers`
84. ✅ **Lunes por la mañana**: café humeante (lunes 6–12 h)
85. ✅ Viernes en la tarde: fiesta en la isla — `fridayParty`
86. ✅ Medianoche: pasa un búho espacial — `midnightOwl`
87. ✅ Amanecer: canta un gallo espacial — `spaceRooster`
88. ✅ Tu cumpleaños — `birthday`
89. ✅ Aniversario de la instalación de Omarchy — `omarchyAnniversary`

### Reaccionan a lo que haces

90. ✅ **Un agente espera tu respuesta**: signo de pregunta en su color (`needsInput`)
    · pendiente: con `busy`, las naves saludan al pasar por la isla
91. ✅ CPU al 100 %: humo en la estación y llegan los bomberos — `fireBrigade`
92. ✅ GPU alta: rave en la estación — `gpuRave`
93. ✅ **Tarea completada**: confeti y el nombre del agente en su color (`taskDone`)
94. ✅ **Tarea fallida**: llega una nave humeando y el perro la repara (`taskFailed`)
95. ✅ **Hormigas cargando tokens**: con cada prompt (`prompt`)
96. ✅ RAM alta: atasco de asteroides y un policía espacial (`ramAbove`) — `ramJam`
97. ✅ **Todos a dormir** al irte (`idle`) y **¡Volviste!** al regresar (`back`)
98. ✅ **Clic en el perro, el gato o el astronauta**: 9 reacciones (pelota, perseguir la cola, hueso,
    ronroneo, salto a la cúpula, ovillo, jetpack, selfie, y no despertarlo si duerme)
99. ✅ **Arrastrar una roca y lanzarla**: conserva la inercia del mouse (`throwRocks`)
100. ✅ **Maratón en el salvapantallas**: episodios seguidos (`marathon`)

