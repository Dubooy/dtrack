/* ════════════ Google Calendar: los eventos de hoy en Hoy ════════════
   Todo va desde el navegador, sin servidor propio: Google Identity Services
   da un permiso de una hora y con él se leen los eventos del calendario
   principal. El permiso y la preferencia viven solo en este móvil
   (localStorage), nunca en la copia ni en la nube.
   Para que funcione hay que poner el ID de cliente OAuth de Google Cloud
   (tipo "Aplicación web") en GCAL_CLIENT_ID. */
var GCAL_CLIENT_ID="35720789929-psilp5b5jsfava2lcbnuklslvvthpkue.apps.googleusercontent.com";
var GCAL_LEER="https://www.googleapis.com/auth/calendar.events.readonly";
var GCAL_ESCRIBIR="https://www.googleapis.com/auth/calendar.events";
var GCAL_KEY="dtrack-gcal";
var gcalCli=null, gcalCb=null, gcalEventos=null, gcalDia=null, gcalCargando=false;
function gcalEstado(){ try{ return JSON.parse(localStorage.getItem(GCAL_KEY)||"null")||{}; }catch(e){ return {}; } }
function gcalGuarda(o){ try{ localStorage.setItem(GCAL_KEY, JSON.stringify(o)); }catch(e){} }
function gcalConectado(){ return !!gcalEstado().on; }
function gcalTokenVale(){ var g=gcalEstado(); return !!(g.tok && g.exp && g.exp>Date.now()+60000); }
function gcalScript(fn){
  if(window.google && google.accounts && google.accounts.oauth2){ fn(); return; }
  var s=document.getElementById("gsi-js");
  if(!s){ s=document.createElement("script"); s.id="gsi-js"; s.src="https://accounts.google.com/gsi/client"; s.async=true; document.head.appendChild(s); }
  s.addEventListener("load", function(){ fn(); });
  s.addEventListener("error", function(){ avisoNube("No se pudo abrir Google. Mira la conexión."); });
}
/* pide el permiso; tiene que salir de un toque, o el navegador bloquea la ventana */
function gcalPide(escribir, luego){
  if(!GCAL_CLIENT_ID){ avisoNube("Google Calendar aún no está configurado en esta versión."); return; }
  gcalScript(function(){
    var g=gcalEstado();
    gcalCb=luego||null;
    gcalCli=google.accounts.oauth2.initTokenClient({
      client_id:GCAL_CLIENT_ID,
      scope: escribir ? GCAL_ESCRIBIR : GCAL_LEER,
      include_granted_scopes:true,
      callback:function(r){
        if(!r || r.error || !r.access_token){ if(r && r.error!=="access_denied") avisoNube("Google no dio permiso. Prueba otra vez."); return; }
        var g2=gcalEstado();
        g2.on=true; g2.tok=r.access_token; g2.exp=Date.now()+((+r.expires_in||3600)*1000);
        g2.escribir=google.accounts.oauth2.hasGrantedAnyScope(r, GCAL_ESCRIBIR) ? !!g2.escribir || !!escribir : false;
        gcalGuarda(g2); gcalEventos=null; gcalDia=null;
        var cb=gcalCb; gcalCb=null; if(cb) cb();
        gcalRepinta();
      }
    });
    gcalCli.requestAccessToken({ prompt: g.on ? "" : "consent", hint: g.email||undefined });
  });
}
function gcalApi(ruta, opt){
  var g=gcalEstado(); opt=opt||{};
  return fetch("https://www.googleapis.com/calendar/v3/"+ruta, {
    method:opt.method||"GET",
    headers: Object.assign({ "Authorization":"Bearer "+g.tok }, opt.body?{ "Content-Type":"application/json" }:{}),
    body: opt.body?JSON.stringify(opt.body):undefined
  }).then(function(res){
    if(res.status===401){ var g2=gcalEstado(); g2.tok=null; g2.exp=0; gcalGuarda(g2); throw new Error("caducado"); }
    if(!res.ok) throw new Error("http "+res.status);
    return res.json();
  });
}
function gcalCarga(){
  var t=today();
  if(gcalCargando || !gcalConectado() || !gcalTokenVale()) return;
  if(gcalDia===t && gcalEventos) return;
  gcalCargando=true;
  var ini=new Date(); ini.setHours(0,0,0,0); var fin=new Date(ini); fin.setDate(fin.getDate()+1);
  gcalApi("calendars/primary/events?singleEvents=true&orderBy=startTime&maxResults=20&timeMin="+encodeURIComponent(ini.toISOString())+"&timeMax="+encodeURIComponent(fin.toISOString()))
    .then(function(j){
      gcalEventos=(j.items||[]).filter(function(e){ return e.status!=="cancelled"; }).sort(function(a,b){ return (a.start&&a.start.dateTime?1:0)-(b.start&&b.start.dateTime?1:0); });
      gcalDia=t;
      if(j.summary && /@/.test(j.summary)){ var g=gcalEstado(); g.email=j.summary; gcalGuarda(g); }
    })
    .catch(function(){ gcalEventos=null; })
    .then(function(){ gcalCargando=false; gcalPintaHoy(); });
}
function gcalHora(e){
  if(!e.start || !e.start.dateTime) return "Todo el día";
  var d=new Date(e.start.dateTime); return (d.getHours()<10?"0":"")+d.getHours()+":"+(d.getMinutes()<10?"0":"")+d.getMinutes();
}
function gcalPintaHoy(){
  var box=document.getElementById("hoy"); if(!box) return;
  var c=document.getElementById("hy-gcal");
  if(!gcalConectado()){ if(c) c.remove(); return; }
  if(!c){ c=document.createElement("div"); c.id="hy-gcal"; c.className="gc-caja"; box.appendChild(c); }
  var cab='<div class="gc-cab"><span class="gc-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg></span><b>Tu calendario</b></div>';
  if(!gcalTokenVale()){
    c.innerHTML=cab+'<button class="gc-renueva" data-act="x-gcal-renueva">Toca para ver los eventos de hoy</button>';
    return;
  }
  if(!gcalEventos || gcalDia!==today()){ c.innerHTML=cab+'<p class="gc-vacio">Cargando…</p>'; gcalCarga(); return; }
  var ahora=Date.now();
  var filas=gcalEventos.slice(0,6).map(function(e){
    var fin=e.end && e.end.dateTime ? new Date(e.end.dateTime).getTime() : 0;
    return '<a class="gc-fila'+(fin && fin<ahora?" gc-pasado":"")+'" href="'+esc(e.htmlLink||"#")+'" target="_blank" rel="noopener"><span class="gc-h num">'+gcalHora(e)+'</span><span class="gc-t">'+esc(e.summary||"(Sin título)")+'</span></a>';
  }).join("");
  c.innerHTML=cab+(filas||'<p class="gc-vacio">Hoy no tienes nada en el calendario.</p>')+
    (gcalEventos.length>6?'<p class="gc-vacio">y '+(gcalEventos.length-6)+' más</p>':'');
}
function gcalRepinta(){
  gcalPintaHoy();
  var p=document.getElementById("aj-cal"); if(p) gcalPintaAjustes(p);
}
/* ── en Ajustes, su propia sección ── */
function gcalPintaAjustes(p){
  var g=gcalEstado(), h='';
  var vuelta=p.querySelector(".aj-atras"), tit=p.querySelector(".aj-h");
  if(!GCAL_CLIENT_ID){
    h='<p class="gc-txt">La conexión con Google Calendar está preparada, pero falta activarla en esta versión de la app.</p>';
  } else if(!g.on){
    h='<p class="gc-txt">Conecta tu cuenta de Google y verás los eventos del día en Hoy. Solo se lee tu calendario principal y todo se queda en este móvil.</p>'+
      '<button class="btn btn-primary w-full !py-3.5 mt-4" data-act="x-gcal-conecta">Conectar con Google</button>';
  } else {
    h='<div class="soc-ajustes"><div><span>Conectado'+(g.email?' como <b>'+esc(g.email)+'</b>':'')+'</span></div>'+
      '<label><span>Apuntar mis sesiones de estudio</span><input type="checkbox" id="gcal-escribir"'+(g.escribir?' checked':'')+' data-act="x-gcal-escribir"></label>'+
      '<button data-act="x-gcal-desconecta"><span class="rojo">Desconectar</span></button></div>'+
      '<p class="gc-txt" style="margin-top:12px">Con la opción de estudio, cada sesión que empieces se añade a tu calendario con su duración.</p>';
  }
  p.innerHTML=""; if(vuelta) p.appendChild(vuelta); if(tit) p.appendChild(tit);
  p.insertAdjacentHTML("beforeend", h);
}
var _sheetSettingsGc=sheetSettings;
sheetSettings=function(){
  _sheetSettingsGc.apply(this, arguments);
  var menu=document.getElementById("aj-menu"); if(!menu || document.getElementById("aj-cal")) return;
  var s={ k:"cal", t:"Calendario", s:"Google Calendar", ico:'<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>' };
  var fila='<button class="aj-fila" data-act="x-aj-sec" data-k="cal"><span class="aj-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+s.ico+'</svg></span>'+
    '<span class="aj-txt"><b>'+s.t+'</b><small>'+(gcalConectado()?"Conectado":s.s)+'</small></span><svg class="aj-fl" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></button>';
  var ref=menu.querySelector('[data-k="datos"]')||menu.querySelector(".aj-pie");
  if(ref) ref.insertAdjacentHTML("beforebegin", fila); else menu.insertAdjacentHTML("beforeend", fila);
  var p=document.createElement("div"); p.className="aj-pag"; p.id="aj-cal"; p.hidden=true;
  p.innerHTML='<button class="aj-atras" data-act="x-aj-sec" data-k=""><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>Ajustes</button><h4 class="display aj-h">Calendario</h4>';
  menu.parentNode.appendChild(p);
  gcalPintaAjustes(p);
  if(ajSeccion==="cal") ajMuestra("cal", true);
};
function gcalAccion(a, el){
  if(a==="x-gcal-conecta"){ gcalPide(false); return true; }
  if(a==="x-gcal-renueva"){ gcalPide(!!gcalEstado().escribir); return true; }
  if(a==="x-gcal-desconecta"){
    var g=gcalEstado();
    try{ if(g.tok && window.google && google.accounts) google.accounts.oauth2.revoke(g.tok, function(){}); }catch(e){}
    try{ localStorage.removeItem(GCAL_KEY); }catch(e){}
    gcalEventos=null; gcalDia=null; gcalRepinta(); avisoNube("Calendario desconectado."); return true;
  }
  if(a==="x-gcal-escribir"){
    var on=!!el.checked, g2=gcalEstado();
    if(!on){ g2.escribir=false; gcalGuarda(g2); return true; }
    el.checked=false;
    gcalPide(true, function(){ var g3=gcalEstado(); g3.escribir=true; gcalGuarda(g3); avisoNube("Tus sesiones de estudio irán a tu calendario."); });
    return true;
  }
  return false;
}
var _gcalGA=grupoAccion;
grupoAccion=function(a, el){ if(gcalAccion(a, el)) return true; return _gcalGA.apply(this, arguments); };
/* los eventos, debajo de las tarjetas de Hoy */
var _pintaHoyGc=pintaHoy;
pintaHoy=function(){ var r=_pintaHoyGc.apply(this, arguments); gcalPintaHoy(); hoyAjusta(); return r; };
/* cada sesión de estudio, al calendario (si lo has pedido y el permiso sigue vivo) */
var _estudioEmpiezaGc=estudioEmpieza;
estudioEmpieza=function(){
  var r=_estudioEmpiezaGc.apply(this, arguments);
  var g=gcalEstado(), a=S.estudio&&S.estudio.actual;
  if(g.on && g.escribir && a && gcalTokenVale()){
    var ini=new Date(), fin=new Date(ini.getTime()+a.est*60000);
    gcalApi("calendars/primary/events", { method:"POST", body:{ summary:"Estudio · "+a.nombre, description:"Apuntado desde Peak.",
      start:{ dateTime:ini.toISOString() }, end:{ dateTime:fin.toISOString() } } })
      .then(function(){ gcalEventos=null; gcalDia=null; })
      .catch(function(){});
  }
  return r;
};
/* al volver a la app otro día, se recargan */
document.addEventListener("visibilitychange", function(){ if(!document.hidden && gcalDia && gcalDia!==today()){ gcalEventos=null; gcalPintaHoy(); } });
(function(){ var st=document.createElement("style"); st.id="gcal-css"; st.textContent=[
'.gc-caja{ margin-top:12px; padding:14px 16px 10px; border-radius:22px; background:var(--fill); }',
'.gc-cab{ display:flex; align-items:center; gap:8px; margin-bottom:6px; font-size:14.5px; }',
'.gc-ico{ width:26px; height:26px; border-radius:9px; display:grid; place-items:center; color:var(--accent); background:var(--accent-soft); }',
'.gc-ico svg{ width:16px; height:16px; }',
'.gc-fila{ display:flex; align-items:baseline; gap:12px; padding:8px 0; font-size:14px; color:var(--t1); text-decoration:none; }',
'.gc-fila + .gc-fila{ box-shadow:inset 0 1px 0 var(--hairline); }',
'.gc-h{ flex:0 0 auto; width:76px; font-size:12.5px; font-weight:700; color:var(--t2); }',
'.gc-t{ min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }',
'.gc-pasado{ opacity:.5; }',
'.gc-vacio{ padding:6px 0 4px; font-size:13px; color:var(--t3); }',
'.gc-renueva{ width:100%; text-align:left; padding:8px 0 6px; font-size:14px; font-weight:600; color:var(--accent); }',
'.gc-txt{ font-size:14px; line-height:1.45; color:var(--t2); }',
'#aj-cal .soc-ajustes label input{ width:20px; height:20px; accent-color:var(--accent); }'
].join("\n"); document.head.appendChild(st); })();

/* ════════════ acciones y repintado ════════════ */
function bucleAccion(a, el){
  if(a==="x-metas"){ closeSheet(); setTimeout(sheetMetas, 60); return true; }
  if(a==="x-metas-op"){ var k=el.dataset.k, i=metasBorrador.indexOf(k); if(i>=0) metasBorrador.splice(i,1); else if(metasBorrador.length<3) metasBorrador.push(k); else { avisoNube("Hasta tres."); return true; }
    var o=document.getElementById("mt-ops"); if(o) o.innerHTML=metasOpsHTML(); sonido("tick"); return true; }
  if(a==="x-metas-ok"){ metasGuarda(); return true; }
  if(a==="x-ch-sube"){ var c=byChId(el.dataset.id), cat=c&&catRetoDe(c.text); if(c && cat && cat.up){ c.text=cat.up; save(); render(); sonido("pop"); avisoNube("Subido. Ahora es: "+cat.up); } return true; }
  if(a==="x-ch-nosube"){ if(!S.chNoSube) S.chNoSube={}; S.chNoSube[el.dataset.id]=1; save(); var b=el.closest(".ch-sube"); if(b) b.remove(); return true; }
  if(a==="x-exp-empieza"){ expEmpieza(el.dataset.k, el.dataset.h); return true; }
  if(a==="x-exp-otra"){ closeSheet(); expEmpieza(el.dataset.k, el.dataset.h); return true; }
  if(a==="x-exp-catalogo"){ expCatalogo(false); return true; }
  if(a==="x-exp-habs"){ expCatalogo(true); return true; }
  if(a==="x-exp-ver"){ expVer(); return true; }
  if(a==="x-exp-cancela"){ expCancela(); if(document.getElementById("hist-capa")) try{ abrirHistorial(); }catch(e){} return true; }
  if(a==="x-exp-res"){ expVerResultado(el.dataset.id); return true; }
  return false;
}
function bucleTrasRender(){
  expVigila();
  if(view==="resumen"){ pintaMetasHoy(); pintaParaHoy(); if(typeof habRetoca==="function") habRetoca(document.getElementById("hy-parahoy")); pintaDescubrimiento(); objetivoEmojis(document.getElementById("hoy")); objetivoEmojis(document.getElementById("ideal-list")); expMuestraNuevo(); }
  if(view==="retos"){ pintaMetas(); pintaExpObjetivos(); pintaPorqueRetos(); pintaRetoSemanaExtra(); objetivoEmojis(document.getElementById("today-challenges")); }
}
var _renderParteBc=renderParte;
renderParte=function(){ var r=_renderParteBc.apply(this, arguments); var p=document.getElementById("parte"); if(p) objetivoEmojis(p); return r; };

/* ════════════ estilos ════════════ */
var BUCLE_CSS=[
/* objetivos bajo el saludo */
'#hy-metas{ display:flex; align-items:center; flex-wrap:wrap; gap:5px 6px; margin-top:10px; text-align:left; }',
'#hy-metas .hm-t{ font-size:12.5px; font-weight:600; color:var(--t3); }',
'#hy-metas .hm-l{ display:contents; }',
'#hy-metas i{ font-style:normal; font-size:12px; font-weight:700; padding:3px 9px; border-radius:99px; background:var(--fill); color:var(--t1); white-space:nowrap; }',
'#hy-metas i.vacio{ color:var(--accent); background:var(--accent-soft); }',
'.mt-ops{ display:grid; grid-template-columns:1fr 1fr; gap:8px; }',
'.mt-op{ display:flex; align-items:center; gap:10px; padding:12px; border-radius:14px; text-align:left; background:var(--fill); transition:background .2s var(--ease), box-shadow .2s var(--ease); }',
'.mt-op span{ font-size:22px; } .mt-op b{ font-size:13.5px; font-weight:600; line-height:1.25; }',
'.mt-op.on{ background:var(--accent-soft); box-shadow:inset 0 0 0 1.5px var(--accent); }',
'.mt-anade{ display:flex; align-items:center; gap:10px; margin-top:16px; font-size:13px; color:var(--t2); }',
'.mt-anade input{ width:18px; height:18px; accent-color:var(--accent); }',
'.mt-emo{ font-size:13px; margin-right:6px; display:inline-block; text-decoration:none; }',
/* para hoy */
'#hy-parahoy{ margin-top:22px; }',
'#hy-parahoy .hy-sec{ margin-top:4px; }',
'#hy-parahoy .hy-fila{ padding:11px 0; }',
'.hy-plan, .hy-hab, .hy-grupo-m{ font-size:11px; font-weight:700; padding:3px 8px; border-radius:99px; }',
'.hy-plan{ color:var(--violet); background:color-mix(in srgb,var(--violet) 12%,transparent); }',
'.hy-hab{ color:var(--t3); background:var(--fill); }',
'.hy-grupo-m{ color:var(--good); background:color-mix(in srgb,var(--good) 12%,transparent); }',
'.hy-tend{ display:flex; align-items:flex-start; gap:10px; width:100%; margin:6px 0 4px; padding:11px 13px; border-radius:14px; text-align:left; background:var(--fill); }',
'.hy-tend span{ font-size:18px; line-height:1.2; } .hy-tend b{ font-size:13px; font-weight:600; line-height:1.45; color:var(--t2); }',
'.hy-tend.malo{ background:color-mix(in srgb,var(--warn) 10%,transparent); } .hy-tend.malo b{ color:var(--t1); }',
/* descubrimiento / experimento en Resumen */
'#hy-desc{ flex-direction:column; align-items:stretch; gap:10px; }',
'#hy-desc .hd-main{ display:flex; align-items:center; gap:14px; text-align:left; width:100%; }',
'.hd-probar{ align-self:flex-start; margin-left:38px; font-size:13px; font-weight:700; color:var(--accent); padding:2px 0; }',
'#hy-desc.hy-exp{ background:color-mix(in srgb,var(--accent) 8%,var(--bg)); box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--accent) 20%,transparent); }',
'#hy-desc.hy-exp .hd-txt small{ color:var(--accent); }',
'.hd-txt em{ font-style:normal; font-size:12.5px; color:var(--t3); margin-top:2px; }',
'.hd-puntos, .ex-puntos{ display:flex; gap:5px; margin-left:38px; }',
'.hd-puntos i, .ex-puntos i{ width:18px; height:6px; border-radius:99px; background:var(--fill-hi); }',
'.hd-puntos i.si, .ex-puntos i.si{ background:var(--accent); } .hd-puntos i.no, .ex-puntos i.no{ background:color-mix(in srgb,var(--t3) 55%,transparent); }',
'.hd-puntos i.hoy, .ex-puntos i.hoy{ box-shadow:0 0 0 1.5px var(--accent); }',
'.ex-puntos.grande{ margin:14px 0 0; gap:6px; } .ex-puntos.grande i{ flex:1; height:10px; }',
/* por qué estos retos */
'.ch-porque{ color:var(--accent)!important; font-weight:600; }',
'.ch-sube{ margin:-2px 0 6px 38px; padding:10px 12px; border-radius:12px; background:var(--accent-soft); }',
'.ch-sube p{ font-size:12.5px; color:var(--t2); margin-bottom:8px; }',
'.ch-sube div{ display:flex; flex-wrap:wrap; gap:8px; }',
'.ch-sube button{ font-size:12.5px; font-weight:700; padding:7px 11px; border-radius:10px; background:var(--accent); color:var(--on-accent); text-align:left; }',
'.ch-sube button.no{ background:transparent; color:var(--t2); box-shadow:inset 0 0 0 1px var(--hairline); }',
/* reto de la semana */
'.rs-porque{ font-size:12.5px; font-weight:600; color:var(--accent); margin:6px 0 2px; }',
'.rs-grupo{ display:flex; align-items:center; gap:9px; width:100%; margin-top:14px; padding-top:12px; box-shadow:inset 0 1px 0 var(--hairline); text-align:left; font-size:12.5px; color:var(--t2); }',
'.rs-grupo .rs-g-t{ flex:1; min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
'.rs-grupo b{ color:var(--t1); }', '.rs-g-ico{ font-size:16px; color:var(--accent); line-height:1; }',
'.sm-rs{ font-size:13.5px; line-height:1.5; color:var(--t2); margin-top:10px; }',
/* vital: lo que sueles hacer */
'.vt-suele{ font-size:12px; color:var(--t3); margin-left:auto; white-space:nowrap; }',
'.vt-suele.aviso{ color:var(--warn); font-weight:700; } .vt-suele.bien{ color:var(--good); font-weight:700; }',
/* ¿estás cambiando? */
'.cb{ margin:18px 0 6px; padding:16px; border-radius:18px; background:var(--fill); }',
'.cb-t{ font-size:17px; font-weight:800; letter-spacing:-.02em; margin-bottom:10px; }',
'.cb-vacio{ font-size:13.5px; color:var(--t2); line-height:1.5; }',
'.cb-tabla{ display:grid; grid-template-columns:1fr auto auto 18px; gap:8px 14px; align-items:center; }',
'.cb-col{ font-size:11px; font-weight:700; color:var(--t3); text-align:right; }',
'.cb-l{ font-size:13.5px; color:var(--t2); } .cb-v{ font-size:13.5px; text-align:right; color:var(--t3); } .cb-v.ahora{ color:var(--t1); font-weight:700; }',
'.cb-tabla i{ font-style:normal; font-size:11px; text-align:center; } .cb-bien{ color:var(--good); } .cb-mal{ color:var(--warn); } .cb-igual{ color:var(--t3); }',
'.cb-frase{ font-size:14px; line-height:1.5; margin-top:14px; color:var(--t2); } .cb-frase b{ color:var(--t1); }',
'.cb-nota{ font-size:11.5px; color:var(--t3); margin-top:8px; line-height:1.45; }',
/* lo aprendido y experimentos */
'.ev-d-nota{ font-size:12.5px; color:var(--t3); margin:-2px 0 6px; }',
'.ev-d > div{ flex:1; min-width:0; } .ev-probar{ font-size:13px; font-weight:700; color:var(--accent); margin-top:6px; }',
'.ex-bloque .soc-sec{ margin-top:28px; }',
'.ex-nuevo, .ex-activo{ display:flex; align-items:center; gap:14px; width:100%; padding:14px 16px; border-radius:18px; text-align:left; background:var(--accent-soft); }',
'.ex-ico{ font-size:26px; } .ex-t{ flex:1; min-width:0; display:flex; flex-direction:column; gap:3px; }',
'.ex-t b{ font-size:15px; font-weight:700; line-height:1.35; } .ex-t small{ font-size:12.5px; color:var(--t2); }',
'.ex-activo .ex-puntos{ margin:6px 0 0; }',
'.ex-hist{ margin-top:8px; }',
'.ex-h{ display:flex; gap:12px; width:100%; padding:12px 0; text-align:left; } .ex-h + .ex-h{ box-shadow:inset 0 1px 0 var(--hairline); }',
'.ex-h > span:first-child{ font-size:20px; } .ex-h-t{ display:flex; flex-direction:column; gap:3px; min-width:0; }',
'.ex-h-t b{ font-size:14px; } .ex-h-t small{ font-size:12.5px; color:var(--t3); line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }',
'.ex-lista{ display:flex; flex-direction:column; gap:8px; }',
'.ex-op{ display:flex; align-items:center; gap:12px; padding:13px 14px; border-radius:14px; text-align:left; background:var(--fill); }',
'.ex-op span{ font-size:22px; } .ex-op b{ font-size:14px; font-weight:600; line-height:1.35; }',
'.ex-aviso{ font-size:12.5px; color:var(--warn); margin-bottom:10px; }',
'.ex-tabla{ display:grid; grid-template-columns:1.2fr 1fr 1fr; gap:9px 10px; padding:14px; border-radius:14px; background:var(--fill); align-items:center; }',
'.ex-col{ font-size:11.5px; font-weight:700; color:var(--t3); line-height:1.3; } .ex-col em{ font-style:normal; font-weight:500; }',
'.ex-tabla > .num{ font-size:15px; font-weight:700; } .ex-l{ font-size:12.5px; color:var(--t2); }',
'.ex-concl{ font-size:15px; line-height:1.5; margin-top:14px; font-weight:600; }',
/* el +4 fijo sobra: el XP salta al marcar y se repasa en el Parte */
'#ideal-list .chip{ display:none!important; }',
/* iconos de línea */
'.ic{ width:1em; height:1em; display:inline-block; vertical-align:-.14em; flex:0 0 auto; }',
'.mt-emo{ color:var(--accent); font-size:14px; margin-right:7px; opacity:.85; }',
'.mt-emo .ic{ vertical-align:-.18em; }',
'.hy-tend > span{ color:var(--warn); font-size:18px; line-height:1; margin-top:1px; } .hy-tend:not(.malo) > span{ color:var(--good); }',
'.mt-op span{ font-size:0; color:var(--accent); } .mt-op span .ic{ font-size:22px; }',
'.ex-op > span{ font-size:0; color:var(--accent); } .ex-op > span .ic{ font-size:21px; }',
'.ex-ico{ font-size:0; color:var(--accent); } .ex-ico .ic{ font-size:26px; }',
'.ex-hico{ color:var(--accent); font-size:19px!important; }',
'.ev-d .ev-dico{ font-size:22px; color:var(--accent); line-height:1; margin-top:2px; }',
'#hy-desc .hd-ico{ color:var(--accent); } #hy-desc .hd-ico .ic{ font-size:26px; }',
'.aj-m-ico{ font-size:20px; color:var(--accent); }',
/* Para hoy: lo que marcas se va suave, lo nuevo entra suave */
'#hy-parahoy .hy-fila{ overflow:hidden; transition:height .38s cubic-bezier(.4,0,.2,1), padding .38s cubic-bezier(.4,0,.2,1), opacity .28s var(--ease), transform .38s var(--ease); }',
'#hy-parahoy .hy-fila.marca .tick{ background:var(--accent); border-color:var(--accent); color:#fff; transform:scale(1.08); }',
'#hy-parahoy .hy-fila.sale{ opacity:0; transform:translateX(24px); padding-top:0!important; padding-bottom:0!important; box-shadow:none!important; }',
'#hy-parahoy .hy-fila.entra{ animation:phEntra .45s var(--ease) both; }',
'@keyframes phEntra{ from{ opacity:0; transform:translateY(-6px); } to{ opacity:1; transform:none; } }',
/* Tu evolución en Resumen */
'#hy-evo{ margin-top:24px; border-radius:22px; background:var(--fill); overflow:hidden; }',
'.he-main{ display:flex; flex-direction:column; align-items:stretch; gap:6px; width:100%; padding:16px 18px 14px; text-align:left; }',
'.he-top{ display:flex; align-items:center; gap:8px; color:var(--accent); }',
'.he-ico .ic{ font-size:18px; } .he-ey{ flex:1; font-size:12.5px; font-weight:800; letter-spacing:.02em; } .he-fl{ font-size:16px; color:var(--t3); }',
'.he-t{ font-size:24px; font-weight:800; letter-spacing:-.035em; line-height:1.1; margin-top:2px; }',
'.he-s{ font-size:13.5px; line-height:1.45; color:var(--t2); } .he-s b{ color:var(--t1); font-weight:700; }',
'.he-mapa{ display:flex; gap:3px; margin-top:8px; }',
'.he-mapa .ev-col{ flex:1; display:flex; flex-direction:column; gap:3px; }',
'.he-mapa i{ aspect-ratio:1; border-radius:3px; }',
'.he-desc{ display:flex; gap:12px; padding:13px 18px 15px; box-shadow:inset 0 1px 0 var(--hairline); }',
'.he-dico{ font-size:20px; color:var(--gold); line-height:1; margin-top:2px; }',
'.he-desc small{ display:block; font-size:11.5px; font-weight:800; color:var(--gold); letter-spacing:.02em; }',
'.he-desc p{ font-size:14px; line-height:1.45; font-weight:600; margin-top:2px; }',
'.he-desc button{ font-size:13px; font-weight:700; color:var(--accent); margin-top:6px; }',
/* metas del mes */
'.mm-cab{ display:flex; align-items:flex-end; justify-content:space-between; gap:12px; }',
'.mm-mes{ font-size:26px; font-weight:800; letter-spacing:-.035em; line-height:1.1; margin-top:2px; }',
'.mm-quedan{ display:flex; flex-direction:column; align-items:flex-end; line-height:1; }',
'.mm-quedan b{ font-size:22px; font-weight:800; letter-spacing:-.03em; } .mm-quedan span{ font-size:11px; color:var(--t3); margin-top:3px; }',
'.mm-tiempo{ height:3px; border-radius:99px; background:var(--fill-hi); margin:12px 0 6px; overflow:hidden; } .mm-tiempo i{ display:block; height:100%; background:var(--t3); opacity:.5; border-radius:99px; }',
'.mm-meta{ display:flex; align-items:center; gap:14px; padding:14px 0; }',
'.mm-meta + .mm-meta{ box-shadow:inset 0 1px 0 var(--hairline); }',
'.mm-anillo{ position:relative; width:52px; height:52px; flex:0 0 auto; }',
'.mm-anillo svg{ width:100%; height:100%; transform:rotate(-90deg); }',
'.mm-pista{ fill:none; stroke:var(--fill-hi); stroke-width:5; } .mm-arco{ fill:none; stroke:var(--accent); stroke-width:5; stroke-linecap:round; transition:stroke-dashoffset .8s cubic-bezier(.3,.9,.3,1); }',
'.mm-meta.ok .mm-arco{ stroke:var(--good); }',
'.mm-in{ position:absolute; inset:0; display:grid; place-items:center; font-size:12.5px; font-weight:800; }',
'.mm-in svg{ width:18px; height:18px; color:var(--good); }',
'.mm-cuerpo{ flex:1; min-width:0; }',
'.mm-t{ display:block; width:100%; text-align:left; font-family:"Plus Jakarta Sans",sans-serif; font-size:17px; font-weight:800; letter-spacing:-.02em; line-height:1.25; }',
'html.esencial .mm-t{ font-family:Inter,sans-serif; }',
'.mm-sub{ font-size:12.5px; color:var(--t3); margin-top:3px; } .mm-bien{ color:var(--good); font-weight:600; } .mm-atras{ color:var(--warn); font-weight:600; } .mm-ok{ color:var(--good); }',
'.mm-nueva{ width:100%; margin-top:10px; padding:11px 0 2px; text-align:left; font-size:14px; font-weight:700; color:var(--accent); box-shadow:inset 0 1px 0 var(--hairline); }',
'.mm-nueva.grande{ display:flex; align-items:center; gap:14px; margin-top:14px; padding:16px; border-radius:16px; box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--accent) 35%,transparent); background:var(--accent-soft); }',
'.mm-plus{ font-size:26px; color:var(--accent); line-height:1; } .mm-nueva.grande b{ display:block; font-size:15.5px; color:var(--t1); } .mm-nueva.grande small{ display:block; font-size:12.5px; color:var(--t3); font-weight:500; margin-top:2px; }',
'.mm .mt-mas button{ width:34px; height:34px; }',
/* experimentos en Objetivos */
'.rx-cab{ display:flex; gap:12px; align-items:flex-start; margin-bottom:12px; }',
'.rx-ico{ width:40px; height:40px; flex:0 0 auto; border-radius:12px; display:grid; place-items:center; color:var(--accent); background:var(--accent-soft); font-size:22px; }',
'.rx-cab h2{ font-size:17px; font-weight:800; letter-spacing:-.02em; } .rx-cab p{ font-size:12.5px; color:var(--t3); margin-top:2px; line-height:1.4; }',
'.rx-lista{ display:flex; flex-direction:column; }',
'.rx-op{ display:flex; align-items:center; gap:12px; padding:12px 0; text-align:left; box-shadow:inset 0 1px 0 var(--hairline); }',
'.rx-op > span{ font-size:19px; color:var(--accent); line-height:1; } .rx-op b{ flex:1; font-size:14px; font-weight:600; line-height:1.35; }',
'.rx-op em{ font-style:normal; font-size:12.5px; font-weight:700; color:var(--accent); padding:5px 11px; border-radius:99px; background:var(--accent-soft); }',
'.rx-mas{ width:100%; padding:11px 0 0; text-align:left; font-size:13.5px; font-weight:700; color:var(--accent); box-shadow:inset 0 1px 0 var(--hairline); }',
'.rx-activo{ display:flex; flex-direction:column; gap:4px; width:100%; padding:14px; border-radius:16px; text-align:left; background:var(--accent-soft); }',
'.rx-activo small{ font-size:12px; font-weight:700; color:var(--accent); } .rx-activo b{ font-size:15.5px; line-height:1.35; } .rx-activo .ex-puntos{ margin:6px 0 0; }',
'.rx-ult{ display:flex; flex-direction:column; gap:3px; width:100%; margin-top:12px; padding-top:12px; text-align:left; box-shadow:inset 0 1px 0 var(--hairline); }',
'.rx-ult small{ font-size:11.5px; font-weight:700; color:var(--t3); } .rx-ult b{ font-size:14px; } .rx-ult span{ font-size:12.5px; color:var(--t2); line-height:1.4; }'
].join("\n");
