// ════════════════════════════════════════════════════════════════
// Peak · función «notion» (Supabase Edge Function)
//
// Notion no deja que una web hable con su API desde el navegador y el
// canje del permiso necesita un secreto, así que este trocito de servidor
// hace de puente. La app nunca ve el permiso de Notion: se queda en la
// tabla notion_conexiones (ver notion.sql).
//
// Lo que hace:
//   GET  ?code&state          Notion vuelve aquí tras dar permiso: canjea el
//                             código, lo guarda y manda de vuelta a la app.
//   POST {accion:"inicio"}    la dirección de Notion para dar permiso.
//   POST {accion:"estado"}    si estás conectado, a qué espacio y página.
//   POST {accion:"paginas"}   las páginas que has compartido con Peak.
//   POST {accion:"elige", pagina}
//   POST {accion:"exporta", habitos:[…], libros:[…]}
//   POST {accion:"desconecta"}
//
// Secretos (Supabase → Edge Functions → Secrets):
//   NOTION_CLIENT_ID, NOTION_CLIENT_SECRET   los de tu integración pública
//   PEAK_APP_URL (opcional)                  a dónde volver; por defecto la beta
// Se despliega con «Verify JWT» APAGADO: Notion vuelve sin sesión de Supabase,
// y las llamadas de la app se comprueban aquí dentro con su testigo.
// ════════════════════════════════════════════════════════════════

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CLIENT_ID = Deno.env.get("NOTION_CLIENT_ID") || "";
const CLIENT_SECRET = Deno.env.get("NOTION_CLIENT_SECRET") || "";
const APP_URL = Deno.env.get("PEAK_APP_URL") || "https://dubooy.github.io/dtrack/beta/";
const REDIRECT = SB_URL + "/functions/v1/notion";
const NOTION = "https://api.notion.com/v1/";
const NOTION_VER = "2022-06-28";
const MAX_FILAS = 62;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { ...CORS, "Content-Type": "application/json" } });

// ── base de datos (PostgREST con la clave de servicio) ─────────────
type Conexion = {
  uid: string; token: string; refresco?: string | null; espacio?: string | null; espacio_icono?: string | null;
  pagina?: string | null; pagina_titulo?: string | null; db_habitos?: string | null; db_libros?: string | null; exportado?: string | null;
};
async function db(ruta: string, init: RequestInit = {}) {
  const r = await fetch(SB_URL + "/rest/v1/" + ruta, {
    ...init,
    headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY, "Content-Type": "application/json", ...(init.headers || {}) },
  });
  if (!r.ok) throw new Error("db " + r.status + " " + (await r.text()));
  const t = await r.text();
  return t ? JSON.parse(t) : null;
}
async function leeConexion(uid: string): Promise<Conexion | null> {
  const f = await db("notion_conexiones?uid=eq." + uid + "&select=*");
  return f && f[0] ? f[0] : null;
}
async function guardaConexion(uid: string, cambios: Partial<Conexion>) {
  await db("notion_conexiones?uid=eq." + uid, { method: "PATCH", body: JSON.stringify(cambios) });
}

// ── quién llama: el testigo de la sesión de Peak ───────────────────
async function usuario(req: Request): Promise<string | null> {
  const a = req.headers.get("authorization") || "";
  const tok = a.replace(/^Bearer\s+/i, "");
  if (!tok) return null;
  const r = await fetch(SB_URL + "/auth/v1/user", { headers: { apikey: SB_KEY, Authorization: "Bearer " + tok } });
  if (!r.ok) return null;
  const u = await r.json();
  return u && u.id ? u.id : null;
}

// ── el «state» de OAuth: uid + hora firmados, sin tabla aparte ─────
const enc = new TextEncoder();
async function firma(txt: string) {
  const k = await crypto.subtle.importKey("raw", enc.encode(CLIENT_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const s = new Uint8Array(await crypto.subtle.sign("HMAC", k, enc.encode(txt)));
  return btoa(String.fromCharCode(...s)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function haceEstado(uid: string) {
  const base = uid + "." + Date.now();
  return base + "." + (await firma(base));
}
async function leeEstado(st: string): Promise<string | null> {
  const p = (st || "").split(".");
  if (p.length !== 3) return null;
  const base = p[0] + "." + p[1];
  if ((await firma(base)) !== p[2]) return null;
  if (Date.now() - Number(p[1]) > 20 * 60000) return null;
  return p[0];
}

// ── Notion ─────────────────────────────────────────────────────────
const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));
class NotionError extends Error { constructor(public status: number, public code: string, msg: string) { super(msg); } }

async function canje(cuerpo: Record<string, string>) {
  const r = await fetch(NOTION + "oauth/token", {
    method: "POST",
    headers: { Authorization: "Basic " + btoa(CLIENT_ID + ":" + CLIENT_SECRET), "Content-Type": "application/json", "Notion-Version": NOTION_VER },
    body: JSON.stringify(cuerpo),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) throw new NotionError(r.status, j.code || "oauth", j.error_description || j.message || "canje");
  return j;
}

/* una llamada a Notion; respeta su límite (≈3 por segundo) y renueva el permiso si caduca */
async function notion(c: Conexion, ruta: string, metodo = "GET", cuerpo?: unknown, intento = 0): Promise<any> {
  const r = await fetch(NOTION + ruta, {
    method: metodo,
    headers: { Authorization: "Bearer " + c.token, "Notion-Version": NOTION_VER, "Content-Type": "application/json" },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  if (r.status === 429 && intento < 4) {
    await espera((Number(r.headers.get("retry-after")) || 1) * 1000);
    return notion(c, ruta, metodo, cuerpo, intento + 1);
  }
  if (r.status === 401 && c.refresco && intento === 0) {
    const j = await canje({ grant_type: "refresh_token", refresh_token: c.refresco });
    c.token = j.access_token; c.refresco = j.refresh_token || c.refresco;
    await guardaConexion(c.uid, { token: c.token, refresco: c.refresco });
    return notion(c, ruta, metodo, cuerpo, 1);
  }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new NotionError(r.status, j.code || "notion", j.message || ("http " + r.status));
  return j;
}

const texto = (s: unknown) => [{ type: "text", text: { content: String(s ?? "").slice(0, 1900) } }];
function tituloDe(o: any): string {
  if (o.object === "database") return (o.title || []).map((t: any) => t.plain_text).join("") || "Sin título";
  const props = o.properties || {};
  for (const k in props) if (props[k].type === "title") return props[k].title.map((t: any) => t.plain_text).join("") || "Sin título";
  return "Sin título";
}

// las dos tablas que Peak crea en tu página
const ESQUEMA_HABITOS = {
  "Día": { title: {} },
  "Fecha": { date: {} },
  "Hechos": { number: { format: "number" } },
  "De": { number: { format: "number" } },
  "Cumplido": { number: { format: "percent" } },
  "Hábitos hechos": { rich_text: {} },
  "Pendientes": { rich_text: {} },
  "Agua (vasos)": { number: { format: "number" } },
  "Sueño (h)": { number: { format: "number" } },
  "Pantalla (h)": { number: { format: "number" } },
};
const ESTADOS: Record<string, { n: string; c: string }> = {
  leyendo: { n: "Leyendo", c: "blue" }, pausa: { n: "En pausa", c: "yellow" },
  leido: { n: "Leído", c: "green" }, quiero: { n: "Quiero leer", c: "gray" },
};
const ESQUEMA_LIBROS = {
  "Título": { title: {} },
  "Autor": { rich_text: {} },
  "Estado": { select: { options: Object.values(ESTADOS).map((e) => ({ name: e.n, color: e.c })) } },
  "Tema": { select: {} },
  "Páginas": { number: { format: "number" } },
  "Empezado": { date: {} },
  "Terminado": { date: {} },
  "Peak ID": { rich_text: {} },
};

async function tablaViva(c: Conexion, id?: string | null) {
  if (!id) return false;
  try { const d = await notion(c, "databases/" + id); return !d.archived && !d.in_trash; }
  catch (e) { if (e instanceof NotionError && (e.status === 404 || e.status === 400)) return false; throw e; }
}
async function aseguraTabla(c: Conexion, campo: "db_habitos" | "db_libros") {
  if (await tablaViva(c, c[campo])) return c[campo]!;
  if (!c.pagina) throw new NotionError(400, "sin_pagina", "Elige antes una página de Notion.");
  const d = await notion(c, "databases", "POST", {
    parent: { type: "page_id", page_id: c.pagina },
    icon: { type: "emoji", emoji: campo === "db_habitos" ? "✅" : "📚" },
    title: texto(campo === "db_habitos" ? "Peak · Hábitos" : "Peak · Libros"),
    properties: campo === "db_habitos" ? ESQUEMA_HABITOS : ESQUEMA_LIBROS,
  });
  c[campo] = d.id;
  await guardaConexion(c.uid, { [campo]: d.id });
  return d.id as string;
}
/* las filas que ya hay, por su clave (la fecha o el id del libro) */
async function filasExistentes(c: Conexion, dbId: string, filtro: unknown, clave: (p: any) => string | null) {
  const m: Record<string, string> = {};
  let cursor: string | undefined;
  do {
    const r = await notion(c, "databases/" + dbId + "/query", "POST", { page_size: 100, filter: filtro, start_cursor: cursor });
    for (const p of r.results || []) { const k = clave(p); if (k && !m[k]) m[k] = p.id; }
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);
  return m;
}
async function escribe(c: Conexion, dbId: string, existentes: Record<string, string>, k: string, props: unknown) {
  if (existentes[k]) await notion(c, "pages/" + existentes[k], "PATCH", { properties: props });
  else await notion(c, "pages", "POST", { parent: { database_id: dbId }, properties: props });
  await espera(340);
}

const num = (v: unknown) => (typeof v === "number" && isFinite(v) ? v : null);
const fechaOk = (s: unknown) => (typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null);
const lista = (a: unknown) => (Array.isArray(a) ? a.map(String).join(", ") : "");

async function exportaHabitos(c: Conexion, filas: any[]) {
  filas = filas.filter((f) => fechaOk(f && f.fecha)).slice(-MAX_FILAS);
  if (!filas.length) return 0;
  const dbId = await aseguraTabla(c, "db_habitos");
  const fechas = filas.map((f) => f.fecha).sort();
  const existentes = await filasExistentes(c, dbId,
    { and: [{ property: "Fecha", date: { on_or_after: fechas[0] } }, { property: "Fecha", date: { on_or_before: fechas[fechas.length - 1] } }] },
    (p) => p.properties?.Fecha?.date?.start?.slice(0, 10) || null);
  for (const f of filas) {
    const hechos = Array.isArray(f.hechos) ? f.hechos.length : 0, de = num(f.total) ?? 0;
    await escribe(c, dbId, existentes, f.fecha, {
      "Día": { title: texto(f.titulo || f.fecha) },
      "Fecha": { date: { start: f.fecha } },
      "Hechos": { number: hechos },
      "De": { number: de },
      "Cumplido": { number: de ? Math.round((hechos / de) * 100) / 100 : null },
      "Hábitos hechos": { rich_text: texto(lista(f.hechos)) },
      "Pendientes": { rich_text: texto(lista(f.pendientes)) },
      "Agua (vasos)": { number: num(f.agua) },
      "Sueño (h)": { number: num(f.sueno) },
      "Pantalla (h)": { number: num(f.pantalla) },
    });
  }
  return filas.length;
}

async function exportaLibros(c: Conexion, libros: any[]) {
  libros = libros.filter((l) => l && l.id && l.titulo).slice(0, 200);
  if (!libros.length) return 0;
  const dbId = await aseguraTabla(c, "db_libros");
  const existentes = await filasExistentes(c, dbId, undefined,
    (p) => (p.properties?.["Peak ID"]?.rich_text || []).map((t: any) => t.plain_text).join("") || null);
  for (const l of libros) {
    const e = ESTADOS[l.estado];
    await escribe(c, dbId, existentes, String(l.id), {
      "Título": { title: texto(l.titulo) },
      "Autor": { rich_text: texto(l.autor || "") },
      "Estado": { select: e ? { name: e.n } : null },
      "Tema": { select: l.tema ? { name: String(l.tema).replace(/,/g, " ").slice(0, 90) } : null },
      "Páginas": { number: num(l.paginas) },
      "Empezado": { date: fechaOk(l.desde) ? { start: l.desde } : null },
      "Terminado": { date: fechaOk(l.fin) ? { start: l.fin } : null },
      "Peak ID": { rich_text: texto(l.id) },
    });
  }
  return libros.length;
}

// ── las peticiones ─────────────────────────────────────────────────
async function vueltaDeNotion(url: URL) {
  const volver = (r: string) => Response.redirect(APP_URL + (APP_URL.includes("?") ? "&" : "?") + "notion=" + r, 302);
  if (url.searchParams.get("error")) return volver(url.searchParams.get("error") === "access_denied" ? "cancelado" : "fallo");
  const uid = await leeEstado(url.searchParams.get("state") || "");
  const code = url.searchParams.get("code");
  if (!uid || !code) return volver("caducado");
  try {
    const j = await canje({ grant_type: "authorization_code", code, redirect_uri: REDIRECT });
    const fila = {
      uid, token: j.access_token, refresco: j.refresh_token || null,
      espacio: j.workspace_name || null, espacio_icono: j.workspace_icon || null,
      pagina: j.duplicated_template_id || null, pagina_titulo: j.duplicated_template_id ? "Peak" : null,
      db_habitos: null, db_libros: null, exportado: null,
    };
    await db("notion_conexiones?on_conflict=uid", {
      method: "POST", headers: { Prefer: "resolution=merge-duplicates" }, body: JSON.stringify(fila),
    });
    return volver("ok");
  } catch (e) {
    console.error("notion canje", e);
    return volver("fallo");
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const url = new URL(req.url);
  if (req.method === "GET") return vueltaDeNotion(url);
  if (req.method !== "POST") return json({ error: "metodo" }, 405);
  if (!CLIENT_ID || !CLIENT_SECRET) return json({ error: "sin_configurar" }, 503);

  const uid = await usuario(req);
  if (!uid) return json({ error: "sin_sesion" }, 401);
  const b = await req.json().catch(() => ({}));

  try {
    if (b.accion === "inicio") {
      const q = new URLSearchParams({ client_id: CLIENT_ID, response_type: "code", owner: "user", redirect_uri: REDIRECT, state: await haceEstado(uid) });
      return json({ url: NOTION + "oauth/authorize?" + q.toString() });
    }
    const c = await leeConexion(uid);
    if (b.accion === "estado") {
      if (!c) return json({ conectado: false });
      return json({ conectado: true, espacio: c.espacio, icono: c.espacio_icono, pagina: c.pagina, paginaTitulo: c.pagina_titulo, exportado: c.exportado });
    }
    if (!c) return json({ error: "sin_conexion" }, 409);

    if (b.accion === "paginas") {
      const r = await notion(c, "search", "POST", { filter: { property: "object", value: "page" }, page_size: 50 });
      const paginas = (r.results || [])
        .filter((p: any) => !p.archived && !p.in_trash && p.parent?.type !== "database_id")
        .map((p: any) => ({ id: p.id, titulo: tituloDe(p), icono: p.icon?.type === "emoji" ? p.icon.emoji : null }));
      return json({ paginas });
    }
    if (b.accion === "elige") {
      const p = await notion(c, "pages/" + String(b.pagina || ""));
      const cambios = { pagina: p.id, pagina_titulo: tituloDe(p), db_habitos: null, db_libros: null };
      await guardaConexion(uid, cambios);
      return json({ ok: true, pagina: p.id, paginaTitulo: cambios.pagina_titulo });
    }
    if (b.accion === "exporta") {
      if (!c.pagina) return json({ error: "sin_pagina" }, 409);
      const habitos = await exportaHabitos(c, Array.isArray(b.habitos) ? b.habitos : []);
      const libros = await exportaLibros(c, Array.isArray(b.libros) ? b.libros : []);
      const exportado = new Date().toISOString();
      await guardaConexion(uid, { exportado });
      return json({ ok: true, habitos, libros, exportado });
    }
    if (b.accion === "desconecta") {
      await db("notion_conexiones?uid=eq." + uid, { method: "DELETE" });
      return json({ ok: true });
    }
    return json({ error: "accion" }, 400);
  } catch (e) {
    console.error("notion", b.accion, e);
    if (e instanceof NotionError) {
      // sin permiso o la integración quitada desde Notion: hay que volver a conectar
      if (e.status === 401) return json({ error: "reconectar" }, 409);
      if (e.code === "sin_pagina" || e.code === "object_not_found") return json({ error: "sin_pagina" }, 409);
      return json({ error: "notion", detalle: e.message }, 502);
    }
    return json({ error: "servidor" }, 500);
  }
});
