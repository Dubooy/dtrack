# Peak. (repo dtrack)

- Se trabaja directamente sobre `main`, sin PRs. Haz `git pull` antes de empezar y justo antes de subir.
- La app publicada es `beta/` (PWA en GitHub Pages; la app de iPhone de `app-ios/` carga esa misma web).
- **No edites `beta/index.html` a mano.** Se monta con las piezas de `beta/src/`:
  1. Mira en `beta/MAPA.md` qué pieza toca y lee solo esa (usa grep antes de leer trozos grandes).
  2. Edita la pieza.
  3. Ejecuta `node herramientas/montar-beta.js` y sube las piezas y `beta/index.html` juntos.
- Todas las piezas de `beta/src/js/` comparten el mismo ámbito: van, en orden, dentro de una sola
  función `(function(){ "use strict"; … })();` que está en `beta/src/index.plantilla.html`.
  Una función de una pieza se ve desde las demás. Si añades una pieza nueva, apúntala en la plantilla y en el mapa.
- Si cambias algo que la app guarda en caché, sube el número de `CACHE` en `beta/sw.js`.
