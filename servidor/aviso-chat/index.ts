// ════════════════════════════════════════════════════════════════
// Peak · función «aviso-chat» (Supabase Edge Function)
//
// Salta con cada mensaje nuevo del chat (un Database Webhook sobre g_chat,
// INSERT) y manda un aviso a los demás del grupo: «Nombre» y el mensaje.
// No avisa a quien escribe, ni a quien le tiene bloqueado, ni por los
// comentarios de fotos ni por mensajes escondidos.
//
// Secretos (Supabase → Edge Functions → Secrets):
//   VAPID_PUBLIC, VAPID_PRIVATE   las claves de los avisos (la pública es la
//                                 «clave» de avisos de textos.js)
//   VAPID_SUBJECT (opcional)      un mailto:, por defecto el de Peak
// Se despliega con «Verify JWT» ENCENDIDO; el webhook manda la clave de
// servicio en la cabecera Authorization.
// ════════════════════════════════════════════════════════════════
import webpush from "npm:web-push@3.6.7";

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
webpush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT") || "mailto:avisos@peak.app",
  Deno.env.get("VAPID_PUBLIC") || "",
  Deno.env.get("VAPID_PRIVATE") || "",
);

async function db(ruta: string, opc: RequestInit = {}) {
  const r = await fetch(SB_URL + "/rest/v1/" + ruta, {
    ...opc,
    headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY, "Content-Type": "application/json" },
  });
  return r.ok && r.status !== 204 ? r.json() : null;
}

Deno.serve(async (req) => {
  let cuerpo: any = {};
  try { cuerpo = await req.json(); } catch (_) { /* nada */ }
  const m = cuerpo.record;
  if (cuerpo.type !== "INSERT" || !m || m.oculto || m.padre || m.evento) return new Response("nada");

  const socios: { uid: string }[] = (await db("g_socios?select=uid&grupo=eq." + encodeURIComponent(m.grupo))) || [];
  const bloquean: { uid: string }[] = (await db("g_bloqueos?select=uid&bloqueado=eq." + m.uid)) || [];
  const fuera = new Set([m.uid, ...bloquean.map((b) => b.uid)]);
  const uids = socios.map((s) => s.uid).filter((u) => !fuera.has(u));
  if (!uids.length) return new Response("nadie");

  const perfil = ((await db("perfiles?select=usuario&id=eq." + m.uid)) || [])[0];
  const nombre = (perfil && perfil.usuario) || "Tu grupo";
  const texto = (m.texto || "").trim() || "📷 Foto";
  const aviso = JSON.stringify({ tipo: "chat", t: nombre, b: texto.length > 140 ? texto.slice(0, 139) + "…" : texto });

  const subs: { endpoint: string; sub: any }[] =
    (await db("g_push?select=endpoint,sub&uid=in.(" + uids.join(",") + ")")) || [];
  await Promise.all(subs.map(async (s) => {
    try { await webpush.sendNotification(s.sub, aviso, { TTL: 3600 }); }
    catch (e: any) {
      /* el móvil ya no tiene esa suscripción: se borra */
      if (e && (e.statusCode === 404 || e.statusCode === 410)) await db("g_push?endpoint=eq." + encodeURIComponent(s.endpoint), { method: "DELETE" });
    }
  }));
  return new Response("ok " + subs.length);
});
