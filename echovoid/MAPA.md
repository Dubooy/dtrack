# Mapa de ECHO//VOID (`echovoid/`)

`index.html` y `assets/` se **generan** con `npm run build`: no se editan. El código está en `src/`.

## Arranque y ajustes
| Archivo | Qué hay |
|---|---|
| `src/index.html` | Página de entrada: canvas, capa del HUD y capa de pantallas |
| `src/main.ts` | Lee la dirección (`?semilla`, `?control`, `?prueba`, `?titulo`) y arranca el juego |
| `src/config.ts` | **Todos los números de ajuste**: render, jugador, cámara, mirada, ecos, física, audio |
| `src/styles.css` | Estilo del HUD y de las pantallas (tipografía de terminal, IBM Plex Mono) |

## Núcleo (`src/core/`)
| Archivo | Qué hay |
|---|---|
| `Game.ts` | Bucle y estados (título, jugando, pausa, final). Une los sistemas; reglas del nivel (caídas, puntos de control, terminales, pistas, portal); pasa el estado de cada estructura a su material; luz, sombras y sonido ambiente |
| `Input.ts` | Teclado, ratón y captura del puntero |
| `box.ts` | Cajas alineadas (geometría, colisiones, rayos) y `gazeCos`: ¿cae una caja en el cono de la mirada? |
| `frame.ts` | Marcos locales (lateral, altura, avance) para diseñar tramos y girar 90° |
| `rng.ts` | Números pseudoaleatorios con semilla (`Rng.derive` da uno independiente por parte) |
| `settings.ts` | Ajustes del jugador guardados en el navegador (sensibilidad, resolución, volumen) |

## Mundo, jugador y mecánica
| Archivo | Qué hay |
|---|---|
| `src/world/World.ts` | Estructuras (`solid` siempre existen, `gaze` dependen de la mirada), colisionadores en rejilla, rayos y zonas de estática |
| `src/player/Player.ts` | **Movimiento, física y cámara**: WASD, salto con margen y memoria, escalones, colisiones caja contra cajas a paso fijo |
| `src/mechanics/Observation.ts` | **Observación**: presencia de cada estructura según la mirada y cuándo sostiene |
| `src/mechanics/Echoes.ts` | **Ecos**: qué hay bajo la retícula, crear, renovar, caducar, máximo simultáneo |

## Niveles (`src/levels/`)
| Archivo | Qué hay |
|---|---|
| `builder.ts` | `LevelBuilder`: plataformas, estructuras observables, puntos de control, terminales, estática, luces y portal; al final monta mallas y colisiones. Tipos `RouteStep` (la solución que sigue el bot) |
| `architect.ts` | **Generador procedural** de arquitectura: islas, torres, arcos, columnatas, escaleras a ninguna parte, salas, puentes rotos, molas lejanas. Las reparte sin invadir el camino ni la caída bajo él |
| `zona1.ts` | Zona 01 — Umbral: la lista ordenada de tramos |
| `tramos/*.ts` | Un tramo por archivo: `despertar`, `puente`, `escalones`, `sendero`, `escalera`, `estatica`, `dosEcos`, `atrio` (ver `docs/diseno.md`) |

## Imagen (`src/render/`)
| Archivo | Qué hay |
|---|---|
| `Renderer.ts` | Pinta a resolución interna baja con escala entera y aplica el postproceso |
| `blockMaterial.ts` | Material de los bloques: Lambert de Three.js con `block.glsl` inyectado |
| `boxGeometry.ts` | Une muchas cajas en una geometría (cada vértice sabe su caja) |
| `effects.ts` | Columnas de luz, volumen de estática, membrana del portal, polvo |
| `glsl.ts` | Trocea los `.glsl` por secciones `//@nombre` |
| `shaders/post.frag.glsl` | **Paleta y dithering**, viñeta, contornos, desgarro, nieve de estática, transición por píxeles |
| `shaders/block.glsl` | Sillares, aristas, disolución según presencia, reconstrucción, color y temblor de los ecos |
| `shaders/common.glsl` | Hash y matriz de Bayer compartidos |
| `shaders/static.glsl`, `beam.glsl`, `portal.glsl`, `dust.glsl` | Estática, luz, portal y polvo |

## Interfaz y sonido
| Archivo | Qué hay |
|---|---|
| `src/ui/Hud.ts` | Retícula, ecos disponibles, progreso, mensajes y terminales que se escriben solos |
| `src/ui/Screens.ts` | Pantallas de título, pausa (con ajustes) y final |
| `src/audio/AudioEngine.ts` | Sonido procedural con Web Audio: viento, zumbido, estática, portal y efectos |

## Pruebas y herramientas
| Archivo | Qué hay |
|---|---|
| `src/debug/testApi.ts` | `window.__echo`, solo con `?prueba` en la dirección |
| `src/debug/bot.ts` | Bot que juega el nivel siguiendo la solución de los tramos, con física real |
| `herramientas/probar.mjs` | `npm run probar`: mecánica, recorrido con el bot y vistas → `capturas/` |
| `herramientas/construir.mjs` | `npm run build`: tipos + genera `index.html` y `assets/` |
| `docs/` | Prompt maestro, referencia visual y diseño implementado |
