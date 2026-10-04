/* Peak · service worker
   La app entera va dentro de index.html, así que basta con guardarla
   y servirla desde la caché cuando no hay internet. */
const CACHE = "dtrack-beta-v223";
const FILES = [
  "./", "./index.html", "./manifest.webmanifest", "./textos.js", "./peak-anim.js",
  "./vendor/jszip.min.js", "./vendor/epub.min.js",
  "./icon-192.png", "./icon-512.png", "./icon-maskable.png", "./apple-touch-icon.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k.indexOf(CACHE.replace(/\d+$/, "")) === 0).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const FUENTES = ["fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Lo propio: primero la red, y si no hay, la copia guardada.
  // Solo se guardan las respuestas buenas, y sin la parte «?…» de la dirección
  // (la vuelta del login con Google trae un código de un solo uso).
  if (url.origin === location.origin) {
    e.respondWith(
      fetch(req).then(res => {
        if (res.ok) {
          const copy = res.clone(), clave = url.search ? url.origin + url.pathname : req;
          caches.open(CACHE).then(c => c.put(clave, copy)).catch(() => {});
        }
        return res;
      }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match("./index.html")))
    );
    return;
  }

  // Las tipografías: si ya están guardadas, se sirven; si no, se piden y se guardan.
  if (FUENTES.indexOf(url.hostname) >= 0) {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        if (res.ok || res.type === "opaque") {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      }))
    );
    return;
  }

  // Todo lo demás (la cuenta, la nube, los grupos y las fotos) va siempre a la red:
  // nunca se sirve una copia vieja de tus datos.
});

/* ═══ avisos diarios ═══
   El servidor solo manda el momento del día. El texto lo dejó escrito la
   propia app en el almacén del navegador, así que nada sale del móvil. */
const CACHE_HOY = () => {
  const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};
const AYER = () => {
  const d = new Date(); d.setDate(d.getDate() - 1);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};
function leerEspejo(){
  return new Promise(res => {
    try {
      const r = indexedDB.open("dutrack", 1);
      r.onupgradeneeded = () => { try { r.result.createObjectStore("estado"); } catch(e){} };
      r.onsuccess = () => {
        try {
          const db = r.result, tx = db.transaction("estado", "readonly");
          const g = tx.objectStore("estado").get("avisos");
          g.onsuccess = () => { res(g.result || null); db.close(); };
          g.onerror  = () => { res(null); db.close(); };
        } catch(e){ res(null); }
      };
      r.onerror = () => res(null);
    } catch(e){ res(null); }
  });
}

self.addEventListener("push", e => {
  e.waitUntil((async () => {
    let d = {};
    try { if (e.data) d = e.data.json(); } catch(err) {}

    if (d.tipo === "prueba" || d.b) {
      /* el título del aviso de prueba lo pone la app, no el servidor:
         iOS ya escribe el nombre de la app debajo y si no, sale dos veces */
      return self.registration.showNotification(d.tipo === "prueba" ? "Los avisos funcionan" : (d.t || "Aviso"), {
        body: d.b || "", icon:"./icon-192.png", badge:"./icon-192.png",
        tag:"dtrack-"+(d.tipo || "prueba"), data:{ url:"./index.html" }
      });
    }

    const esp = await leerEspejo();
    const hoy = CACHE_HOY(), ayer = AYER();
    let avisos = [];

    if (esp) {
      if (d.tipo === "n" && esp.fecha === hoy && esp.noche) avisos = [esp.noche];
      else if (d.tipo === "m") {
        if (esp.fecha === hoy && esp.mananaHoy) avisos = esp.mananaHoy;
        else if (esp.fecha === ayer && esp.mananaSig) avisos = esp.mananaSig;
      }
      if (!avisos.length && esp.viejo) avisos = [esp.viejo];
    }
    if (!avisos.length) avisos = [ d.tipo === "m" ? { t:"Buenos días", b:"Échale un ojo al día." } : { t:"Parte del día", b:"¿Has hecho el Parte del día?" } ];

    for (let i = 0; i < avisos.length && i < 2; i++) {
      await self.registration.showNotification(avisos[i].t || "Aviso", {
        body: avisos[i].b || "",
        icon:"./icon-192.png", badge:"./icon-192.png",
        tag: "dtrack-" + (d.tipo || "x") + "-" + i,
        data:{ url:"./index.html" }
      });
    }
  })());
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil((async () => {
    const abiertas = await self.clients.matchAll({ type:"window", includeUncontrolled:true });
    for (const c of abiertas) if ("focus" in c) return c.focus();
    if (self.clients.openWindow) return self.clients.openWindow((e.notification.data && e.notification.data.url) || "./index.html");
  })());
});
