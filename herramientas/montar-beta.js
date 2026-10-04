#!/usr/bin/env node
/* Monta beta/index.html a partir de las piezas de beta/src/.
   beta/index.html NO se edita a mano: se cambian las piezas y se ejecuta
     node herramientas/montar-beta.js              (escribe beta/index.html)
     node herramientas/montar-beta.js --comprobar  (solo mira que esté al día)
   La plantilla (beta/src/index.plantilla.html) tiene líneas <!--#incluye ruta-->
   que se sustituyen por el contenido de beta/src/ruta, sin su salto de línea final.
   Así el resultado es exactamente el mismo archivo de siempre. Mapa: beta/MAPA.md */
const fs = require("fs"), path = require("path");
const BETA = path.join(__dirname, "..", "beta"), SRC = path.join(BETA, "src");
const usados = new Set();
const html = fs.readFileSync(path.join(SRC, "index.plantilla.html"), "utf8")
  .replace(/<!--#incluye ([^\s>]+)-->/g, (_, ruta) => {
    usados.add(ruta);
    return fs.readFileSync(path.join(SRC, ruta), "utf8").replace(/\n$/, "");
  });

/* una pieza que nadie incluye es casi siempre un despiste */
for (const dir of ["css", "html", "js"]) {
  for (const f of fs.readdirSync(path.join(SRC, dir))) {
    if (!usados.has(dir + "/" + f)) { console.error("Pieza sin incluir en la plantilla: " + dir + "/" + f); process.exit(1); }
  }
}

const destino = path.join(BETA, "index.html");
if (process.argv.includes("--comprobar")) {
  if (fs.readFileSync(destino, "utf8") !== html) {
    console.error("beta/index.html no coincide con beta/src/. Ejecuta: node herramientas/montar-beta.js");
    process.exit(1);
  }
  console.log("beta/index.html está al día.");
} else {
  fs.writeFileSync(destino, html);
  console.log("beta/index.html montado (" + html.split("\n").length + " líneas).");
}
