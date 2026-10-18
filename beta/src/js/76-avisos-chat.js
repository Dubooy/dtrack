/* ════════ avisos del chat (18/10/2026) ════════
   Cuando alguien escribe en el chat de tu grupo, te llega un aviso al móvil.
   La app guarda tu suscripción de avisos en g_push (servidor/avisos-chat.sql) y la
   función de Supabase «aviso-chat» la usa cuando entra un mensaje nuevo en g_chat.
   El permiso se pide la primera vez que envías un mensaje (hace falta un toque) o
   ya lo tienes si activaste los avisos diarios. En iPhone solo con Peak. instalada. */
function chatAvisosAlta(){
  if(!hayAvisos() || !claveAvisos() || typeof Notification==="undefined" || Notification.permission!=="granted") return;
  if(!ses || !ses.uid) return;
  navigator.serviceWorker.ready.then(suscripcionAvisos).then(function(sub){
    if(!sub) return;
    var j=sub.toJSON(); if(S.chatPush===j.endpoint) return;
    return pedirAuth("/rest/v1/g_push?on_conflict=endpoint", { method:"POST", prefer:"resolution=merge-duplicates,return=minimal",
      body:{ endpoint:j.endpoint, sub:j } }).then(function(r){ if(r && r.ok){ S.chatPush=j.endpoint; save(); } });
  }).catch(function(){});
}
/* la primera vez que escribes, se pide el permiso (iPhone exige que sea tras un toque) */
document.addEventListener("click", function(e){
  if(!(e.target.closest && e.target.closest('[data-act="x-chat-enviar"]'))) return;
  if(!hayAvisos() || typeof Notification==="undefined" || Notification.permission!=="default" || S.chatPushPedido) return;
  if(esIOS() && !instalada()) return;
  S.chatPushPedido=true; save();
  try{ Notification.requestPermission().then(function(p){ if(p==="granted") chatAvisosAlta(); }); }catch(err){}
}, true);
setTimeout(chatAvisosAlta, 5000);
