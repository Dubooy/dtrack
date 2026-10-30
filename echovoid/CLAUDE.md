# ECHO//VOID (carpeta `echovoid/`)

Videojuego 3D en primera persona con Three.js, TypeScript, Vite y GLSL. «Lo que no miras no existe.
Lo que recuerdas puede salvarte.» Las reglas de `beta/` (Peak) no se aplican aquí.

- Visión completa: `docs/prompt-maestro.md`. Referencia visual: `docs/referencia.webp` (mírala antes
  de tocar el arte). Lo ya decidido y las ideas pendientes: `docs/diseno.md`.
- Qué hay en cada archivo: `MAPA.md`. Míralo antes de leer código y actualízalo si añades o mueves archivos.

## Cómo se trabaja

- Igual que en el resto del repo: directamente en `main`, con `git pull` antes de empezar y justo
  antes de subir.
- Los comandos se lanzan desde `echovoid/`. Si no existe `node_modules`, ejecuta antes `npm install`.
- `npm run comprobar` revisa los tipos de TypeScript. Es rápido; úsalo a menudo.
- `npm run probar` abre el juego en un Chromium sin pantalla y hace tres cosas:
  - comprueba la mecánica;
  - pone a un bot a jugar el nivel entero con las reglas reales;
  - deja capturas en `capturas/` (esa carpeta no se sube). Mira con Read las capturas de lo que hayas tocado.

  Para probar varias semillas: `npm run probar -- recorrido --semillas=1,2,3`.
- `npm run build` genera `index.html` y `assets/` en esta carpeta. Es lo que se publica en
  https://dubooy.github.io/dtrack/echovoid/. No se editan a mano; súbelos junto con el código,
  como `beta/index.html`.
- `npm run dev` abre un servidor local. Admite `?semilla=N` y `?control=N` para empezar en un
  punto de control.
- No des nada por hecho sin haber pasado `npm run probar`.

## Reglas que no se rompen

- Paleta: negro #08090D, blanco grisáceo #D8D8D5, grises intermedios y magenta #D52AFF. El magenta
  solo aparece en ecos, anomalías, portales y fenómenos especiales; nunca como decoración.
- Los números de ajuste (física, mirada, ecos, render, audio) viven en `src/config.ts`.
- Cada sistema va en su módulo (ver el MAPA). No metas todo en un archivo.
- La generación usa `Rng` con semilla y nunca `Math.random()`: la misma semilla da el mismo universo.
- Cada tramo nuevo es un archivo en `src/levels/tramos/` que construye con `LevelBuilder` y escribe
  su solución con `b.go(...)`. El nivel no está listo hasta que el bot lo termine con varias semillas.
- Los ecos tienen que ser necesarios para avanzar, no un simple efecto. Si añades un reto, añade
  una prueba en `herramientas/probar.mjs` que lo demuestre, como «sin eco, la estática se traga el puente».
