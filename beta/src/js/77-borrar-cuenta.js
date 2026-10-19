/* ════════ BORRAR MI CUENTA (19/10/2026) ════════
   Ajustes › Tus datos › «Borrar mi cuenta». Con doble confirmación (hay que escribir
   BORRAR). Borra, por este orden:
   1. Tus fotos de la nube (cubos «gym» y «avatares», tu carpeta), con la API de Storage.
   2. Los avisos de este dispositivo.
   3. Todo lo tuyo del servidor y la propia cuenta: función borrar_mi_cuenta()
      (servidor/borrar-cuenta.sql): datos, perfil, grupos (y el grupo si te quedas
      sin nadie), reacciones, fotos publicadas, bloqueos, denuncias, Notion y avisos.
   4. Lo guardado en este dispositivo, y vuelve a la bienvenida.
   Si la función aún no está en el servidor, no se borra nada en local y se avisa. */
var bcFase="";
function bcPuede(){ return !!(typeof ses!=="undefined" && ses && !ses.demo && ses.uid && ses.access_token); }
function bcHoja(){
  openSheet('<div class="flex items-start justify-between mb-3"><h3 class="display text-[20px] font-bold">Borrar mi cuenta</h3>'+closeBtn()+'</div>'+
    '<p class="text-[14px] t2 leading-relaxed mb-3">Se borra para siempre, del servidor y de este dispositivo:</p>'+
    '<ul class="bc-lista">'+
      '<li>Tus hábitos, retos, diario, ánimo y todo lo que apuntas</li>'+
      '<li>Tu perfil, tu foto y tus fotos del gym</li>'+
      '<li>Lo que has publicado en tus grupos y tus reacciones. Sales de todos tus grupos</li>'+
    '</ul>'+
    '<p class="text-[13px] t3 leading-relaxed mb-4">No se puede deshacer. Si quieres guardar una copia, descárgala antes en Tus datos.</p>'+
    '<label class="bc-label">Escribe <b>BORRAR</b> para confirmar'+
      '<input id="bc-confirma" class="field !py-2.5 mt-2" autocomplete="off" autocapitalize="characters" spellcheck="false"></label>'+
    '<p id="bc-estado" class="text-[12.5px] mt-3" style="min-height:18px;color:var(--t3)"></p>'+
    '<button class="btn btn-danger w-full !py-3.5 mt-2" data-act="x-borrar-cuenta-si" disabled>Borrar mi cuenta para siempre</button>');
  var inp=document.getElementById("bc-confirma"), bt=document.querySelector('[data-act="x-borrar-cuenta-si"]');
  if(inp && bt) inp.addEventListener("input", function(){ bt.disabled=inp.value.trim().toUpperCase()!=="BORRAR" || !!bcFase; });
}
function bcEstado(t, mal){ var e=document.getElementById("bc-estado"); if(e){ e.textContent=t; e.style.color=mal?"var(--alert)":"var(--t3)"; } }

/* las fotos de tu carpeta en un cubo: se listan y se borran (Storage no deja borrar carpetas enteras) */
function bcFotos(cubo){
  var h={ "apikey":NUBE_KEY, "Authorization":"Bearer "+ses.access_token, "Content-Type":"application/json" };
  function lista(){
    return fetch(NUBE_URL+"/storage/v1/object/list/"+cubo, { method:"POST", headers:h,
      body:JSON.stringify({ prefix:ses.uid, limit:1000, offset:0 }) }).then(function(r){ return r.ok ? r.json() : []; });
  }
  return lista().then(function(l){
    var rutas=(Array.isArray(l)?l:[]).filter(function(x){ return x && x.name && x.id; }).map(function(x){ return ses.uid+"/"+x.name; });
    if(!rutas.length) return 0;
    return fetch(NUBE_URL+"/storage/v1/object/"+cubo, { method:"DELETE", headers:h, body:JSON.stringify({ prefixes:rutas }) })
      .then(function(r){ return r.ok ? rutas.length : 0; });
  }).catch(function(){ return 0; });
}
/* lo de este dispositivo: solo lo de Peak (las claves «beta:»), no lo de otras webs del mismo sitio */
function bcLocal(){
  /* desde aquí no se guarda nada más (si no, lo que esté pintándose lo volvería a escribir) */
  save=function(){}; clearTimeout(espejoPend); espejo=function(){};
  try{
    var ks=[]; for(var i=0;i<window.localStorage.length;i++){ var k=window.localStorage.key(i); if(k && k.indexOf("beta:")===0) ks.push(k.slice(5)); }
    ks.forEach(function(k){ try{ localStorage.removeItem(k); }catch(e){} });
  }catch(e){}
  /* la base de la sincronización y los textos de los avisos; se espera a que acabe */
  return new Promise(function(ok){
    var t=setTimeout(ok, 1500);
    try{ var r=indexedDB.deleteDatabase("dutrack"); r.onsuccess=r.onerror=r.onblocked=function(){ clearTimeout(t); ok(); }; }
    catch(e){ clearTimeout(t); ok(); }
  });
}
function bcBorra(){
  if(bcFase || !bcPuede()) return;
  var bt=document.querySelector('[data-act="x-borrar-cuenta-si"]'); if(bt) bt.disabled=true;
  bcFase="fotos"; bcEstado("Borrando tus fotos…");
  /* que nada vuelva a subir lo de este dispositivo mientras se borra */
  aplicando=true;
  /* antes de tocar nada, que el servidor sepa borrar cuentas */
  gRpc("borrar_mi_cuenta_lista", {}).then(function(){ return Promise.all([bcFotos("gym"), bcFotos("avatares")]); })
  .then(function(){
    bcFase="avisos"; bcEstado("Apagando los avisos…");
    return Promise.race([ (typeof desactivarAvisos==="function" && avActivos()) ? desactivarAvisos() : Promise.resolve(), new Promise(function(ok){ setTimeout(ok, 4000); }) ]);
  }).then(function(){
    bcFase="servidor"; bcEstado("Borrando tu cuenta del servidor…");
    return gRpc("borrar_mi_cuenta", {});
  }).then(function(){
    bcFase="local"; bcEstado("Hecho. Borrando lo de este dispositivo…");
    ses=null; perfil=null; GRUPO=null;
    return bcLocal().then(function(){ location.reload(); });
  }).catch(function(e){
    bcFase=""; aplicando=false;
    var m=(e && e.message)||"";
    bcEstado(m==="sin_servidor"
      ? "El borrado de cuentas aún no está activado en el servidor. No se ha borrado nada de tus datos."
      : (navigator.onLine===false ? "Sin conexión. No se ha borrado tu cuenta; prueba con red." : "No se ha podido borrar la cuenta. Prueba en un rato."), true);
    var b=document.querySelector('[data-act="x-borrar-cuenta-si"]'), inp=document.getElementById("bc-confirma");
    if(b) b.disabled=!(inp && inp.value.trim().toUpperCase()==="BORRAR");
  });
}
document.addEventListener("click", function(ev){
  var el=ev.target.closest && ev.target.closest('[data-act="x-borrar-cuenta"], [data-act="x-borrar-cuenta-si"]'); if(!el) return;
  ev.preventDefault(); ev.stopPropagation();
  if(el.dataset.act==="x-borrar-cuenta"){ if(bcPuede()) bcHoja(); else avisoNube("Sin cuenta no hay nada en el servidor: «Borrar todos los datos» borra lo de este dispositivo."); }
  else bcBorra();
}, true);
(function(){ var st=document.createElement("style"); st.id="bc-css"; st.textContent=[
'.bc-lista{ margin:0 0 12px; padding:0; list-style:none; display:flex; flex-direction:column; gap:6px; }',
'.bc-lista li{ position:relative; padding-left:16px; font-size:14px; line-height:1.4; color:var(--t1); }',
'.bc-lista li::before{ content:""; position:absolute; left:2px; top:.55em; width:6px; height:6px; border-radius:99px; background:var(--alert); }',
'.bc-label{ display:block; font-size:13px; color:var(--t2); }',
'.bc-label b{ color:var(--t1); letter-spacing:.04em; }'
].join("\n"); document.head.appendChild(st); })();
