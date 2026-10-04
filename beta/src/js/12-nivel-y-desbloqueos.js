/* ════════════════ lo que se desbloquea con el nivel ════════════════ */
var NV_ARENA=7, NV_PORCELANA=13;
var NV_COLORES=4, NV_REACC1=5, NV_EXTRA=7, NV_TITULOS=8, NV_MEDIANOCHE=10, NV_REACC2=11, NV_ORO=16, NV_REACC3=17;
var DESBLOQUEOS=[
  {nv:3,  t:"Comodín de racha"},
  {nv:4,  t:"Colores de acento: azul, rosa y naranja"},
  {nv:5,  t:"Reacciones 😂 y 💀"},
  {nv:6,  t:"Comodín de racha"},
  {nv:7,  t:"Cuarto reto del día (+50 XP)"},
  {nv:7,  t:"Tema Arena"},
  {nv:8,  t:"Elegir tu título"},
  {nv:9,  t:"Comodín de racha"},
  {nv:10, t:"Tema Medianoche"},
  {nv:11, t:"Reacciones 🫡 y 👑"},
  {nv:12, t:"Comodín de racha"},
  {nv:13, t:"Tema Porcelana"},
  {nv:15, t:"Comodín de racha"},
  {nv:16, t:"Tema Oro"},
  {nv:17, t:"Reacción 🐐"},
  {nv:18, t:"Comodín de racha"}
];
var nivelCache=1;
function nivelRefresca(st){ nivelCache=(st||stats()).lvl; return nivelCache; }

/* temas */
function temasDesbloqueados(){
  var t=[];
  if(nivelCache>=NV_ARENA) t.push("arena");
  if(nivelCache>=NV_MEDIANOCHE) t.push("medianoche");
  if(nivelCache>=NV_PORCELANA) t.push("porcelana");
  if(nivelCache>=NV_ORO) t.push("oro");
  return t;
}
function temaVigila(){
  var cur=curTheme(), def=null;
  for(var i=0;i<TEMAS.length;i++) if(TEMAS[i].k===cur) def=TEMAS[i];
  if(def && def.nv && nivelCache<def.nv){
    try{ localStorage.setItem(TKEY,"system"); }catch(e){}
    applyTheme("system");
  }
}

/* color de acento: se guarda en el navegador, como el tema */
var ACKEY="dtrack-acento";
var ACENTOS=[
  {k:"",        n:"Por defecto", c:"#1c1b19"},
  {k:"azul",    n:"Azul",        c:"#1f6fe0"},
  {k:"rosa",    n:"Rosa",        c:"#d6337f"},
  {k:"naranja", n:"Naranja",     c:"#e0661c"}
];
function acentoActual(){ try{ return localStorage.getItem(ACKEY)||""; }catch(e){ return ""; } }
function aplicaAcento(){
  var r=document.documentElement, k=acentoActual();
  if(k && nivelCache<NV_COLORES && typeof S!=="undefined" && S) k="";   /* si bajas de nivel, vuelve al de siempre */
  r.classList.remove("acento-azul","acento-rosa","acento-naranja");
  if(k) r.classList.add("acento-"+k);
}
function selectorAcento(){
  var bloq=nivelCache<NV_COLORES, cur=acentoActual();
  return '<p class="eyebrow mb-2">Color'+(bloq?' <span style="letter-spacing:0;text-transform:none;font-weight:500">· se desbloquea en el nivel '+NV_COLORES+'</span>':'')+'</p>'+
    '<div class="acentos mb-6'+(bloq?' bloq':'')+'">'+
      ACENTOS.map(function(a){
        var on=(a.k===cur) || (!a.k && !cur);
        return '<button data-act="x-acento" data-c="'+a.k+'" class="'+(on?"on":"")+'" aria-label="'+a.n+'">'+
          '<i style="background:'+a.c+'"></i><span>'+a.n+'</span></button>';
      }).join("")+
    '</div>';
}

/* reacciones */
function emojisDisponibles(){
  var e=["🔥","👏","💪"];
  if(nivelCache>=NV_REACC1) e=e.concat(["😂","💀"]);
  if(nivelCache>=NV_REACC2) e=e.concat(["🫡","👑"]);
  if(nivelCache>=NV_REACC3) e=e.concat(["🐐"]);
  return e;
}

/* títulos */
function tituloElegido(n){
  var t=S.profile && S.profile.titulo;
  if(n>=NV_TITULOS && t){
    var i=LVL_NAMES.indexOf(t);
    if(i>=0 && i<n) return t;
  }
  return tituloDe(n);
}

/* cuarto reto */
var RETOS_EXTRA=[
  "Leer 50 páginas de un libro",
  "Escribir un poema",
  "Aprender a hacer algo nuevo",
  "Estudiar 50 minutos seguidos sin tocar el móvil",
  "Cero redes sociales hasta las 17:00",
  "Hacer 10.000 pasos",
  "Cocinar algo que no hayas hecho nunca",
  "Llamar a alguien con quien hace tiempo que no hablas",
  "Ordenar el cuarto entero",
  "Ver un documental y contarle a alguien de qué iba"
];
function retoExtraDe(d){
  var h=7; for(var i=0;i<d.length;i++) h=(h*31+d.charCodeAt(i))>>>0;
  return RETOS_EXTRA[h%RETOS_EXTRA.length];
}
function retoExtraHecho(d){ return !!(S.retoExtra && S.retoExtra[d]); }
var RAYO_RE='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.2 2.5 4.8 13.4h5.6l-1.6 8.1 8.4-10.9h-5.6z"/></svg>';
var CANDADO_RE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg>';
function filaRetoExtra(d){
  if(nivelCache<NV_EXTRA) return '';
  if(false)
    return '<div class="reto-extra bloq">'+
      '<div class="re-top"><span class="re-ico">'+CANDADO_RE+'</span><span class="re-ey">Reto extra</span><span class="re-xp">+50 XP</span></div>'+
      '<p class="re-t">Se desbloquea en el nivel '+NV_EXTRA+'</p>'+
      '<p class="re-pie">Un reto más exigente cada día, sin cambiarte la rutina.</p></div>';
  var h=retoExtraHecho(d);
  return '<div class="reto-extra'+(h?" done":"")+'">'+
    '<div class="re-top"><span class="re-ico">'+RAYO_RE+'</span><span class="re-ey">Reto extra</span><span class="re-xp">+50 XP</span></div>'+
    '<button class="re-t" data-act="x-extra" data-day="'+d+'"><span class="strike">'+esc(retoExtraDe(d))+'</span></button>'+
    '<button class="re-marca" data-act="x-extra" data-day="'+d+'"><span class="tick">'+ICON_CHECK+'</span>'+
      '<span class="re-marca-t">'+(h?"Hecho. Te lo has ganado.":"Marcar como hecho")+'</span></button>'+
  '</div>';
}
function pintaRetoExtra(){
  var tc=document.getElementById("today-challenges");
  if(tc && !tc.querySelector(".reto-extra")){
    var d=(typeof curDay==="function")?curDay():today();
    var bx=tc.querySelector(".bonus-x");
    if(bx) bx.insertAdjacentHTML("beforebegin", filaRetoExtra(d)); else tc.insertAdjacentHTML("beforeend", filaRetoExtra(d));
  }
  var mc=document.getElementById("mini-challenges");
  if(mc && !mc.querySelector(".reto-extra")) mc.insertAdjacentHTML("beforeend", filaRetoExtra(today()));
}

/* lista para el perfil */
function listaDesbloqueos(n){
  return '<div class="soc-lista">'+DESBLOQUEOS.map(function(u){
    var ok=n>=u.nv;
    return '<div class="soc-fila"><div class="soc-cuerpo">'+
      '<span class="num" style="width:44px;flex:0 0 auto;font-size:12.5px;font-weight:800;color:'+(ok?"var(--accent)":"var(--t3)")+'">NV '+u.nv+'</span>'+
      '<span style="flex:1;font-size:14.5px;'+(ok?"":"color:var(--t3)")+'">'+esc(u.t)+'</span>'+
      '<span style="font-size:14px;color:'+(ok?"var(--good)":"var(--t3)")+'">'+(ok?"✓":"")+'</span>'+
    '</div></div>';
  }).join("")+'</div>';
}
function desbloqueosEntre(a,b){ return DESBLOQUEOS.filter(function(u){ return u.nv>a && u.nv<=b && u.t.indexOf("Comodín")<0; }); }

var DESBLOQ_CSS=[
'.reto-extra{ position:relative; margin-top:18px; padding:18px 18px 16px; border-radius:24px; isolation:isolate; overflow:hidden;',
'  background:linear-gradient(150deg, color-mix(in srgb,var(--gold) 20%,var(--bg)) 0%, color-mix(in srgb,var(--warn) 12%,var(--bg)) 100%);',
'  box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--gold) 45%,transparent), 0 16px 34px -20px color-mix(in srgb,var(--gold) 80%,transparent); }',
/* un brillo que cruza de vez en cuando */
'.reto-extra:not(.bloq)::after{ content:""; position:absolute; inset:0; z-index:-1; pointer-events:none;',
'  background:linear-gradient(110deg, transparent 30%, rgba(255,255,255,.38) 48%, transparent 66%); transform:translateX(-120%);',
'  animation:reBrillo 5.5s ease-in-out 1s infinite; }',
'@keyframes reBrillo{ 0%,60%{ transform:translateX(-120%); } 85%,100%{ transform:translateX(120%); } }',
'.re-top{ display:flex; align-items:center; gap:10px; }',
'.re-ico{ width:30px; height:30px; border-radius:99px; display:grid; place-items:center; flex:0 0 auto; color:#fff;',
'  background:linear-gradient(145deg,var(--gold),color-mix(in srgb,var(--gold) 55%,var(--warn))); box-shadow:0 6px 14px -6px color-mix(in srgb,var(--gold) 80%,transparent); }',
'.re-ico svg{ width:16px; height:16px; }',
'.re-ey{ flex:1; font-size:11px; font-weight:800; letter-spacing:.13em; text-transform:uppercase; color:var(--gold); }',
'.re-xp{ flex:0 0 auto; font-size:13px; font-weight:800; padding:5px 11px; border-radius:999px;',
'  background:color-mix(in srgb,var(--gold) 22%,transparent); color:var(--gold); }',
'.reto-extra .re-t{ display:block; width:100%; text-align:left; margin-top:14px; font-family:"Plus Jakarta Sans",sans-serif;',
'  font-size:20px; font-weight:800; letter-spacing:-.025em; line-height:1.2; color:var(--t1); }',
'.re-marca{ display:flex; align-items:center; gap:10px; margin-top:14px; padding:11px 14px; width:100%; border-radius:16px; text-align:left;',
'  background:color-mix(in srgb,var(--bg) 55%,transparent); box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--gold) 30%,transparent);',
'  font-size:14px; font-weight:700; color:var(--t2); transition:transform .3s var(--spring); }',
'.re-marca:active{ transform:scale(.97); }',
'.re-pie{ margin-top:8px; font-size:13px; color:var(--t3); line-height:1.45; }',
'.reto-extra.done{ background:linear-gradient(145deg,var(--gold),color-mix(in srgb,var(--gold) 62%,var(--warn)));',
'  box-shadow:0 18px 36px -16px color-mix(in srgb,var(--gold) 80%,transparent); animation:rePop .5s var(--spring); }',
'@keyframes rePop{ 0%{ transform:scale(.97); } 60%{ transform:scale(1.02); } 100%{ transform:none; } }',
'.reto-extra.done .re-ey, .reto-extra.done .re-t, .reto-extra.done .re-marca-t{ color:#fff; }',
'.reto-extra.done .re-xp{ background:rgba(255,255,255,.24); color:#fff; }',
'.reto-extra.done .re-ico{ background:#fff; color:var(--gold); }',
'.reto-extra.done .strike{ color:#fff; text-decoration-color:rgba(255,255,255,.7); }',
'.reto-extra.done .re-marca{ background:rgba(255,255,255,.18); box-shadow:none; }',
'.reto-extra.done .tick{ background:#fff; box-shadow:none; }',
'.reto-extra.done .tick svg{ opacity:1; transform:none; color:var(--gold); }',
'.reto-extra.bloq{ background:var(--fill); box-shadow:inset 0 0 0 1px var(--hairline); }',
'.reto-extra.bloq .re-ico{ background:var(--fill-hi); color:var(--t3); box-shadow:none; }',
'.reto-extra.bloq .re-ey, .reto-extra.bloq .re-xp{ color:var(--t3); }',
'.reto-extra.bloq .re-xp{ background:var(--fill-hi); }',
'.reto-extra.bloq .re-t{ font-size:17px; color:var(--t2); }',
'.acentos{ display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }',
'.acentos button{ display:flex; flex-direction:column; align-items:center; gap:6px; padding:10px 4px; border-radius:14px; font-size:11.5px; color:var(--t2);',
'  background:var(--fill); box-shadow:inset 0 0 0 1px var(--hairline-2); }',
'.acentos button i{ width:26px; height:26px; border-radius:99px; display:block; }',
'.acentos button.on{ box-shadow:inset 0 0 0 2px var(--accent); color:var(--t1); }',
'.acentos.bloq button{ opacity:.45; }',
'.pf-sel{ display:flex; align-items:center; gap:10px; width:100%; max-width:420px; margin-top:14px; padding:0 14px; height:48px; border-radius:14px;',
'  background:var(--fill); box-shadow:inset 0 0 0 1px var(--hairline); }',
'.pf-sel span{ font-size:14px; color:var(--t3); }',
'.pf-sel select{ flex:1; min-width:0; background:none; border:0; outline:none; text-align:right; font-weight:700; color:var(--accent); -webkit-appearance:none; appearance:none; }'
].join("\n");

/* ════════════════ nivel: anillo, camino y XP que vuela ════════════════
   El nivel se ve como un anillo que se llena con la XP, del color del rango.
   Cada vez que ganas XP, unas bolitas vuelan hasta el anillo (si estás en
   Retos) o hasta el icono de Retos de la barra, que enseña un anillo pequeño
   llenándose. Debajo del anillo, el camino con los 20 niveles y lo que da cada uno. */
var RANGOS=[
  { n:"Bronce",   desde:1,  hasta:4,  c:"#c9773a", d:"#9a5424" },
  { n:"Plata",    desde:5,  hasta:9,  c:"#9aa7b4", d:"#6c7a88" },
  { n:"Oro",      desde:10, hasta:14, c:"#e8b32c", d:"#c07f0c" },
  { n:"Diamante", desde:15, hasta:17, c:"#3ea4e4", d:"#2560c8" },
  { n:"Leyenda",  desde:18, hasta:20, c:"#9b5cf6", d:"#d9468f" }
];
function rangoDe(n){
  for(var i=0;i<RANGOS.length;i++) if(n>=RANGOS[i].desde && n<=RANGOS[i].hasta) return RANGOS[i];
  return RANGOS[RANGOS.length-1];
}
var ROMANOS=["I","II","III","IV","V"];
function rangoNombre(n){ var r=rangoDe(n); return r.n+" "+ROMANOS[n-r.desde]; }

/* XP → nivel y progreso, con la misma curva que stats() */
function nivelDeXP(xp){
  var lv=1, need=150, acc=0;
  while(lv<LVL_NAMES.length && xp>=acc+need){ acc+=need; lv++; need=Math.round(need*1.215); }
  var pct = lv>=LVL_NAMES.length ? 1 : Math.max(0, Math.min(1, (xp-acc)/need));
  return { lvl:lv, pct:pct, falta:Math.max(0, acc+need-xp) };
}

/* el número, centrado de verdad: se mide la tinta del dígito con un canvas
   y se coloca para que su centro caiga justo en el centro del círculo */
var numMedidas={};
function numMide(txt){
  txt=String(txt);
  if(numMedidas[txt]) return numMedidas[txt];
  var m={ cx:0, cy:0.355 }, lista=true;
  try{
    var cv=numMide.cv||(numMide.cv=document.createElement("canvas")), ctx=cv.getContext("2d");
    ctx.font='800 100px "Plus Jakarta Sans", sans-serif'; ctx.textAlign="center"; ctx.textBaseline="alphabetic";
    var t=ctx.measureText(txt);
    if(t.actualBoundingBoxAscent!=null)
      m={ cx:(t.actualBoundingBoxRight-t.actualBoundingBoxLeft)/200, cy:(t.actualBoundingBoxAscent-t.actualBoundingBoxDescent)/200 };
    if(document.fonts && document.fonts.check) lista=document.fonts.check('800 100px "Plus Jakarta Sans"');
  }catch(e){}
  if(lista) numMedidas[txt]=m;
  return m;
}
function numTexto(txt, fs, cls){
  var m=numMide(txt);
  return '<text class="'+(cls||"an-num")+'" data-fs="'+fs+'" x="'+(50-m.cx*fs).toFixed(2)+'" y="'+(50+m.cy*fs).toFixed(2)+'" text-anchor="middle" '+
    'font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="'+fs+'">'+txt+'</text>';
}
function numRecentra(){
  numMedidas={};
  var ts=document.querySelectorAll("text[data-fs]");
  for(var i=0;i<ts.length;i++){
    var t=ts[i], fs=+t.getAttribute("data-fs"), m=numMide(t.textContent);
    t.setAttribute("x",(50-m.cx*fs).toFixed(2)); t.setAttribute("y",(50+m.cy*fs).toFixed(2));
  }
}
try{ if(document.fonts && document.fonts.ready) document.fonts.ready.then(numRecentra); }catch(e){}
setTimeout(numRecentra, 2500);

/* el anillo */
var anilloCuenta=0;
function anilloNivel(n, tam, pct){
  if(pct==null) pct=1;
  var r=rangoDe(n), id="anl"+(++anilloCuenta);
  var g = tam>=70 ? 8 : tam>=40 ? 9 : 11, rad=50-g/2-1;
  var fs = tam>=70 ? (n>=10?34:40) : (n>=10?36:44);
  return '<svg class="anillo" viewBox="0 0 100 100" style="width:'+tam+'px;height:'+tam+'px" aria-hidden="true">'+
    '<defs><linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+r.c+'"/><stop offset="1" stop-color="'+r.d+'"/></linearGradient></defs>'+
    '<circle cx="50" cy="50" r="'+rad+'" fill="none" stroke="'+r.c+'" stroke-opacity=".2" stroke-width="'+g+'"/>'+
    '<circle class="an-arco" cx="50" cy="50" r="'+rad+'" fill="none" stroke="url(#'+id+')" stroke-width="'+g+'" stroke-linecap="round" '+
      'pathLength="100" stroke-dasharray="100" transform="rotate(-90 50 50)" style="stroke-dashoffset:'+(100-pct*100).toFixed(2)+(pct<0.01?';opacity:0':'')+'"/>'+
    numTexto(n, fs)+'</svg>';
}
/* se sigue llamando así desde el perfil y el grupo: allí va el anillo completo */
function emblemaRango(n, tam, pct){ return anilloNivel(n, tam, pct); }
function anilloPon(caja, pct, anim){
  var a=caja && caja.querySelector(".an-arco"); if(!a) return;
  a.style.transition = anim ? "stroke-dashoffset .8s cubic-bezier(.3,.9,.3,1), opacity .2s" : "none";
  a.style.opacity = pct<0.01 ? "0" : "1";
  a.style.strokeDashoffset = (100-pct*100).toFixed(2);
}

/* lo que enseña la pantalla va un paso por detrás de la XP real mientras
   las bolitas están volando, para que el anillo se llene cuando llegan */
var xpMostrado=null, xpLlegada=0, xpTempo=null, xpDest=null;
function xpPendiente(){ return Date.now()<xpLlegada; }
function xpPreparar(){ if(xpMostrado==null) xpMostrado=stats().xp; xpLlegada=Math.max(xpLlegada, Date.now()+1500); }

function pintaTextosNivel(v){
  var nm=document.getElementById("lvl-name"); if(nm) nm.textContent=LVL_NAMES[v.lvl-1];
  var ey=document.getElementById("lvl-rango"); if(ey) ey.textContent="Rango "+rangoNombre(v.lvl);
  var nx=document.getElementById("lvl-next");
  if(nx) nx.textContent = v.lvl>=LVL_NAMES.length ? "Has llegado al final. Ya no hay nada por encima." : "Faltan "+v.falta+" XP para "+LVL_NAMES[v.lvl];
  var sig=document.getElementById("lvl-siguiente");
  if(sig){
    var r=rangoDe(v.lvl), idx=RANGOS.indexOf(r);
    sig.textContent = idx<RANGOS.length-1 ? "Siguiente rango: "+RANGOS[idx+1].n+" en el nivel "+RANGOS[idx+1].desde : "Rango máximo";
  }
}
function pintaRangoRetos(st){
  if(xpMostrado==null || !xpPendiente()) xpMostrado=st.xp;
  var v=nivelDeXP(xpMostrado);
  var box=document.getElementById("lvl-emblema");
  if(box){
    if(box.dataset.n!==String(v.lvl)){ box.innerHTML=anilloNivel(v.lvl,84,v.pct); box.dataset.n=v.lvl; }
    else anilloPon(box, v.pct, false);
  }
  pintaTextosNivel(v);
  pintaCamino(v);
}

/* ── las bolitas de XP ── */
function xpDestino(){
  if(view==="retos"){
    var e=document.getElementById("lvl-emblema");
    if(e && e.getBoundingClientRect().width) return { el:e, tipo:"anillo" };   /* en Retos, siempre al número */
  }
  var c=['#mtabs button[data-view="retos"]','#rail button[data-view="retos"]'];
  for(var i=0;i<c.length;i++){
    var b=document.querySelector(c[i]);
    if(b){ var rb=b.getBoundingClientRect(); if(rb.width && rb.height) return { el:b, tipo:"tab" }; }
  }
  return null;
}
function xpVuela(x, y, xp){
  /* ya no vuela nada: se enciende el aro del trofeo y se llena */
  var b=document.querySelector('#mtabs button[data-view="retos"]');
  if(!b || !b.getBoundingClientRect().width) b=document.querySelector('#rail button[data-view="retos"]');
  if(xpMostrado==null) xpMostrado=stats().xp;
  xpDest = b ? { el:b, tipo:"tab" } : null;
  if(b) tabAnillo(b);
  xpLlegada=Math.max(xpLlegada, Date.now()+520);
  clearTimeout(xpTempo); xpTempo=setTimeout(xpAlcanza, xpLlegada-Date.now());
}
function xpToque(dest){
  var el=dest.el;
  el.classList.remove("xp-toque"); void el.offsetWidth; el.classList.add("xp-toque");
  clearTimeout(el._xt); el._xt=setTimeout(function(){ el.classList.remove("xp-toque"); }, 420);
}
/* anillo pequeño alrededor del icono de Retos */
function tabAnillo(b){
  var w=b.querySelector(".tab-anillo");
  if(!w){
    var v=nivelDeXP(xpMostrado);
    w=document.createElement("i"); w.className="tab-anillo";
    /* solo una línea fina: sin pista gruesa detrás del trofeo */
    w.innerHTML='<svg viewBox="0 0 52 52" aria-hidden="true">'+
      '<circle cx="26" cy="26" r="23.5" fill="none" stroke="var(--hairline-2)" stroke-width="1.5"/>'+
      '<circle class="an-arco" cx="26" cy="26" r="23.5" fill="none" stroke="'+rangoDe(v.lvl).c+'" stroke-width="4" stroke-linecap="round" '+
      'pathLength="100" stroke-dasharray="100" transform="rotate(-90 26 26)" style="stroke-dashoffset:'+(100-v.pct*100).toFixed(2)+(v.pct<0.01?';opacity:0':'')+'"/></svg>';
    b.appendChild(w);
    void w.offsetWidth;
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ w.classList.add("ve"); }); });
  }
  else if(!w.classList.contains("ve")) w.classList.add("ve");
  clearTimeout(w._fuera); clearTimeout(w._quita);
}
function tabAnilloFuera(b, ms){
  var w=b && b.querySelector(".tab-anillo"); if(!w) return;
  clearTimeout(w._fuera);
  w._fuera=setTimeout(function(){
    w.classList.remove("ve");
    w._quita=setTimeout(function(){ if(w.parentNode && !w.classList.contains("ve")) w.parentNode.removeChild(w); }, 750);
  }, ms);
}
/* todas han llegado: el anillo se llena hasta la XP de verdad */
function xpAlcanza(){
  var st=stats(), antes=nivelDeXP(xpMostrado==null?st.xp:xpMostrado), ahora=nivelDeXP(st.xp);
  xpMostrado=st.xp; xpLlegada=0;
  var sube=ahora.lvl>antes.lvl;
  var box=document.getElementById("lvl-emblema");
  if(box){
    if(!sube){ anilloPon(box, ahora.pct, true); pintaTextosNivel(ahora); sonido("xp"); }
    else {
      anilloPon(box, 1, true);
      setTimeout(function(){
        box.innerHTML=anilloNivel(ahora.lvl, 84, 0); box.dataset.n=ahora.lvl;
        box.classList.remove("an-destello"); void box.offsetWidth; box.classList.add("an-destello");
        pintaTextosNivel(ahora);
        setTimeout(function(){ anilloPon(box, ahora.pct, true); }, 60);
      }, 700);
    }
  }
  var tab=xpDest && xpDest.tipo==="tab" ? xpDest.el : null, w=tab && tab.querySelector(".tab-anillo");
  if(w){
    if(!sube){ anilloPon(w, ahora.pct, true); tabAnilloFuera(tab, 1500); }
    else {
      anilloPon(w, 1, true);
      setTimeout(function(){ tab.classList.add("tab-sube"); setTimeout(function(){ tab.classList.remove("tab-sube"); }, 1200); }, 650);
      tabAnilloFuera(tab, 1400);
    }
  }
  pintaCamino(ahora);
  if(sube) setTimeout(function(){ comodinGana(stats()); }, 200);
}

/* ── el camino de los 20 niveles ── */
var CAMINO_PREMIO={3:"+1 comodín",4:"Colores",5:"😂 💀",6:"+1 comodín",7:"Arena",8:"Títulos",9:"+1 comodín",
  10:"Medianoche",11:"🫡 👑",12:"+1 comodín",13:"Porcelana",15:"+1 comodín",16:"Tema Oro",17:"🐐",18:"+1 comodín",20:"La cima"};
/* Todas las paradas tienen el mismo dibujo (fondo, pista, arco y número) y lo que
   cambia es la clase: futura, pasada (ok) o la tuya (yo). Así, al subir de nivel
   nada desaparece: el anillo se cierra, la parada se hace pequeña y se apaga un
   poco, la línea avanza y la siguiente crece y se va rodeando. */
var caminoPend=null, caminoAnimando=false, subidaProgramada=false;
function cmNodoSVG(n){
  return '<svg viewBox="0 0 100 100" aria-hidden="true">'+
    '<circle class="cm-fondo" cx="50" cy="50" r="45"/>'+
    '<circle class="cm-pista" cx="50" cy="50" r="45"/>'+
    '<circle class="cm-arco" cx="50" cy="50" r="45" pathLength="100" stroke-dasharray="100" transform="rotate(-90 50 50)"/>'+
    numTexto(n, n>=10?38:42, "cm-n")+'</svg>';
}
function cmEstado(el, estado, pct){
  if(!el) return;
  el.classList.toggle("ok", estado==="ok"); el.classList.toggle("yo", estado==="yo");
  if(pct!=null) el.style.setProperty("--off", (100-pct*100).toFixed(1));
}
function cmCabecera(cm, n){ var s=cm.querySelector(".cm-cab span"); if(s) s.textContent="Nivel "+n+" de "+LVL_NAMES.length; }
function pintaCamino(v){
  var card=document.getElementById("card-nivel"); if(!card) return;
  var cm=document.getElementById("camino");
  if(!cm){ cm=document.createElement("section"); cm.id="camino"; card.parentNode.insertBefore(cm, card.nextSibling); }
  if(caminoAnimando) return;
  var total=LVL_NAMES.length;
  if(!cm.querySelector(".cm-pista")){
    var h="";
    for(var n=1;n<=total;n++){
      var r=rangoDe(n), pr=CAMINO_PREMIO[n];
      h+='<button class="cm-parada" data-act="x-camino" data-n="'+n+'" style="--col:'+r.c+';--off:100">'+
        '<span class="cm-rango">'+(n===r.desde?esc(r.n):"")+'</span>'+
        '<span class="cm-nodo">'+cmNodoSVG(n)+'</span>'+
        '<span class="cm-nombre">'+esc(LVL_NAMES[n-1])+'</span>'+
        (pr?'<span class="cm-premio">'+esc(pr)+'</span>':'')+
      '</button>';
    }
    cm.innerHTML='<div class="cm-cab"><h2 class="display">Tu camino</h2><span class="t3 num"></span></div>'+
      '<div class="cm-scroll"><div class="cm-pista">'+h+'</div></div>';
  }
  var clave=v.lvl+"|"+Math.round(v.pct*100);
  if(cm.dataset.k!==clave){
    var viejo=cm.dataset.n ? +cm.dataset.n : 0, viejoPct=cm.dataset.p ? +cm.dataset.p : 0;
    /* has subido: se deja como estaba y se anima cuando se vea */
    if(viejo && v.lvl>viejo) caminoPend={ de: caminoPend?caminoPend.de:viejo, pct: caminoPend?caminoPend.pct:viejoPct, a:v.lvl };
    else if(v.lvl!==viejo) caminoPend=null;
    var P=caminoPend, vl=P?P.de:v.lvl, vp=P?P.pct:v.pct;
    var ps=cm.querySelectorAll(".cm-parada");
    for(var i=0;i<ps.length;i++){
      var k=i+1;
      cmEstado(ps[i], k<vl?"ok":k===vl?"yo":"fut", k===vl?vp:null);
      ps[i].classList.remove("cm-llega");
    }
    cmCabecera(cm, vl);
    if(!P && v.lvl!==viejo) cm.dataset.c="";
    cm.dataset.k=clave; cm.dataset.n=v.lvl; cm.dataset.p=v.pct;
  }
  caminoCentra();
  caminoAnimaSiToca();
}
function caminoCentroDe(sc, n){
  var el=sc.querySelectorAll(".cm-parada")[n-1]; if(!el) return 0;
  return Math.max(0, Math.min(sc.scrollWidth-sc.clientWidth, el.offsetLeft - sc.clientWidth/2 + el.offsetWidth/2));
}
function caminoCentra(){
  var cm=document.getElementById("camino"); if(!cm || view!=="retos" || caminoPend || caminoAnimando || cm.dataset.c===cm.dataset.n) return;
  var sc=cm.querySelector(".cm-scroll"); if(!sc || !sc.clientWidth) return;
  var fin=caminoCentroDe(sc, +cm.dataset.n);
  if(cm.dataset.c) cmDesliza(sc, fin, 450); else sc.scrollLeft=fin;
  cm.dataset.c=cm.dataset.n;
}
function cmDesliza(sc, a, ms){
  var x0=sc.scrollLeft, t0=null;
  function paso(ts){
    if(t0===null) t0=ts;
    var p=Math.min(1,(ts-t0)/ms), e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
    sc.scrollLeft=x0+(a-x0)*e;
    if(p<1) requestAnimationFrame(paso);
  }
  requestAnimationFrame(paso);
}
/* se juega cuando el camino está a la vista y no hay ninguna celebración delante */
function caminoAnimaSiToca(){
  if(!caminoPend || caminoAnimando || view!=="retos" || subidaProgramada || document.getElementById("subida-capa")) return;
  var cm=document.getElementById("camino"), sc=cm && cm.querySelector(".cm-scroll");
  if(!sc || !sc.clientWidth) return;
  requestAnimationFrame(caminoAnima);
}
function caminoAnima(){
  var P=caminoPend, cm=document.getElementById("camino"), sc=cm && cm.querySelector(".cm-scroll");
  if(!P || !sc || caminoAnimando) return;
  caminoPend=null; caminoAnimando=true;
  var ps=sc.querySelectorAll(".cm-parada"), real=nivelDeXP(xpMostrado!=null?xpMostrado:stats().xp);
  var f=Math.min(1, 3/(P.a-P.de)), t=250;
  function en(ms, fn){ setTimeout(fn, ms); }
  sc.scrollLeft=caminoCentroDe(sc, P.de);
  /* 1 · tu anillo se termina de cerrar */
  en(t, function(){ ps[P.de-1].style.setProperty("--off","0"); });
  t+=650*f+150;
  for(var k=P.de; k<P.a; k++) (function(k, t){
    var sig=ps[k], ultimo=(k+1===P.a);
    /* 2 · la parada se queda atrás (pequeña y algo apagada) y la línea avanza */
    en(t, function(){
      cmEstado(ps[k-1], "ok");
      sig.classList.add("cm-llega");
      cmDesliza(sc, caminoCentroDe(sc, k+1), 700*f+200);
      sonido("tick");
    });
    /* 3 · la siguiente crece y se va rodeando */
    en(t+430*f, function(){
      cmEstado(sig, "yo", 0);
      cmCabecera(cm, k+1);
      requestAnimationFrame(function(){ requestAnimationFrame(function(){
        sig.style.setProperty("--off", (100-(ultimo?real.pct:1)*100).toFixed(1));
      }); });
    });
  })(k, t + (k-P.de)*(430*f+700*f));
  var fin=t+(P.a-P.de)*(430*f+700*f)+300;
  en(fin-500, function(){ sonido("xp"); });
  en(fin, function(){
    for(var j=0;j<ps.length;j++) ps[j].classList.remove("cm-llega");
    caminoAnimando=false; cm.dataset.c=cm.dataset.n;
    pintaCamino(real);
  });
}
function caminoInfo(n){
  var nombre=LVL_NAMES[n-1], d=DESBLOQUEOS.filter(function(u){ return u.nv===n; }).map(function(u){ return u.t; });
  if(n===LVL_NAMES.length) d.push("el último título");
  avisoNube(d.length ? "Nivel "+n+" · "+nombre+". Desbloqueas: "+d.join(", ")+"." : "Nivel "+n+" · "+nombre+".");
}

/* ── la subida de nivel ── */
function celebraNivel(nuevo, viejo, lista){
  var r=rangoDe(nuevo), cambia=(rangoDe(viejo).n!==r.n);
  var capa=document.getElementById("subida-capa");
  if(capa) capa.parentNode.removeChild(capa);
  capa=document.createElement("div"); capa.id="subida-capa";
  capa.style.setProperty("--rc", r.c); capa.style.setProperty("--rd", r.d);
  var puntos="";
  for(var i=0;i<12;i++){
    puntos+='<i style="--ang:'+(i*30+15)+'deg;--dist:'+(98+(i%2)*14)+'px;--ret:'+((i%3)*.03)+'s"></i>';
  }
  var filas=[{ ey:"Título nuevo", t:tituloDe(nuevo) }].concat((lista||[]).map(function(t){ return { ey:"Desbloqueado", t:t }; }));
  var sobran=0; if(filas.length>4){ sobran=filas.length-4; filas=filas.slice(0,4); }
  var icoTitulo='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5l2.4 5 5.4.6-4 3.7 1.1 5.4L12 15.5l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z"/></svg>';
  var icoAbierto='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 6.8-1.2"/></svg>';
  var id="sbg"+(++anilloCuenta);
  capa.innerHTML=
    '<div class="sb-caja">'+
      '<p class="sb-ey">'+(cambia?"Nuevo rango":"Subes de nivel")+'</p>'+
      '<div class="sb-aro">'+
        '<svg class="sb-svg" viewBox="0 0 100 100" aria-hidden="true">'+
          '<defs><linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+r.c+'"/><stop offset="1" stop-color="'+r.d+'"/></linearGradient>'+
          '<clipPath id="'+id+'c"><circle cx="50" cy="50" r="40"/></clipPath></defs>'+
          '<circle cx="50" cy="50" r="46" fill="none" stroke="var(--fill-hi)" stroke-width="5"/>'+
          '<circle class="sb-arco" cx="50" cy="50" r="46" fill="none" stroke="url(#'+id+')" stroke-width="5" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" transform="rotate(-90 50 50)"/>'+
          '<g clip-path="url(#'+id+'c)">'+
            '<g class="sb-viejo">'+numTexto(viejo, viejo>=10?38:44, "sb-n")+'</g>'+
            '<g class="sb-nuevo">'+numTexto(nuevo, nuevo>=10?38:44, "sb-n")+'</g>'+
          '</g>'+
        '</svg>'+
      '</div>'+
      '<h2 class="display sb-t">'+(cambia?esc(r.n):"Nivel "+nuevo)+'</h2>'+
      '<p class="sb-sub"><i style="background:'+r.c+'"></i>'+(cambia?"Nivel "+nuevo+" · ":"")+esc(rangoNombre(nuevo))+'</p>'+
      '<div class="sb-lista">'+filas.map(function(c,i){
        return '<div class="sb-fila" style="--i:'+i+'"><span class="sb-ico">'+(i===0?icoTitulo:icoAbierto)+'</span>'+
          '<div><span>'+esc(c.ey)+'</span><b>'+esc(c.t)+'</b></div></div>';
      }).join("")+(sobran?'<p class="sb-mas">Y '+sobran+' más</p>':'')+'</div>'+
      '<button class="sb-boton" data-act="x-subida-cerrar" style="--nb:'+filas.length+'">Seguir</button>'+
    '</div>';
  document.body.appendChild(capa);
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ capa.classList.add("ve"); }); });
  setTimeout(function(){ try{ if(navigator.vibrate) navigator.vibrate([16,40,40]); }catch(e){} sonido("nivel"); }, 1000);
}
function cierraSubida(){
  var c=document.getElementById("subida-capa"); if(!c) return;
  c.classList.remove("ve"); setTimeout(function(){ if(c.parentNode) c.parentNode.removeChild(c); subidaProgramada=false; caminoAnimaSiToca(); },320);
}

var RANGO_CSS=[
'.emblema, .anillo{ display:block; flex:0 0 auto; }',
'.an-num{ fill:var(--t1); }',
'#lvl-emblema{ flex:0 0 auto; border-radius:999px; padding:6px; background:rgba(255,255,255,.96); box-shadow:0 14px 28px -14px rgba(0,0,0,.5); }',
'#lvl-emblema .an-num{ fill:#15151c; }',
'#lvl-emblema.xp-toque, .mtab.xp-toque > svg, #rail button.xp-toque > svg{ animation:xpToque .42s cubic-bezier(.3,.9,.3,1); }',
'@keyframes xpToque{ 0%{ transform:scale(1); } 40%{ transform:scale(1.06); } 100%{ transform:scale(1); } }',
'#lvl-emblema.an-destello{ animation:anDestello .9s var(--ease); }',
'@keyframes anDestello{ 0%{ transform:scale(1); } 30%{ transform:scale(1.08); } 100%{ transform:none; } }',
/* bolitas */
'.xp-orbe{ position:fixed; left:-3px; top:-3px; width:6px; height:6px; border-radius:99px; z-index:96; pointer-events:none; opacity:0; background:var(--good); }',
/* anillo pequeño en la barra */
'.tab-anillo{ position:absolute; left:50%; top:50%; width:52px; height:52px; margin:-26px 0 0 -26px; pointer-events:none; opacity:0; transform:scale(.86);',
'  transition:opacity .55s cubic-bezier(.4,0,.2,1), transform .65s cubic-bezier(.2,.8,.2,1); }',
'.tab-anillo.ve{ opacity:1; transform:none; }',
'.tab-anillo svg{ width:52px!important; height:52px!important; display:block; transform:none!important; animation:none!important; }',
'.mtab.tab-sube{ color:var(--good)!important; }',
'.mtab.tab-sube > svg{ animation:xpToque .5s cubic-bezier(.3,.9,.3,1) 2; }',
/* el camino */
'#camino{ margin:6px 0 30px; }',
'.cm-cab{ display:flex; align-items:baseline; justify-content:space-between; margin-bottom:8px; }',
'.cm-cab h2{ font-size:20px; font-weight:800; letter-spacing:-.03em; }',
'.cm-cab span{ font-size:12.5px; }',
'.cm-scroll{ overflow-x:auto; overflow-y:hidden; margin:0 -16px; padding:2px 16px 4px; scrollbar-width:none; -webkit-overflow-scrolling:touch; }',
'.cm-scroll::-webkit-scrollbar{ display:none; }',
'.cm-pista{ display:flex; width:max-content; }',
'.cm-parada{ position:relative; width:84px; flex:0 0 auto; display:flex; flex-direction:column; align-items:center; text-align:center; padding:0 3px; }',
'.cm-parada::before{ content:""; position:absolute; top:43px; right:50%; width:100%; height:3px; margin-top:-1.5px; z-index:0;',
'  background:linear-gradient(var(--col),var(--col)) left center / 0% 100% no-repeat, var(--cm-via); transition:background-size .5s cubic-bezier(.45,0,.25,1); }',
'.cm-parada:first-child::before{ display:none; }',
'.cm-parada.ok::before, .cm-parada.yo::before, .cm-parada.cm-llega::before{ background-size:100% 100%, auto; }',
'.cm-rango{ height:14px; margin-bottom:6px; font-size:9.5px; font-weight:800; letter-spacing:.13em; text-transform:uppercase; color:var(--col); white-space:nowrap; }',
'.cm-nodo{ position:relative; z-index:1; width:34px; height:34px; margin:6px 0; border-radius:99px;',
'  transition:width .5s cubic-bezier(.3,.9,.3,1), height .5s cubic-bezier(.3,.9,.3,1), margin .5s cubic-bezier(.3,.9,.3,1), opacity .5s var(--ease), transform .3s var(--spring); }',
'.cm-parada:active .cm-nodo{ transform:scale(.92); }',
'.cm-nodo > svg{ width:100%; height:100%; display:block; overflow:visible; }',
'.cm-fondo{ fill:var(--bg); transition:fill .5s var(--ease); }',
'circle.cm-pista{ fill:none; stroke:var(--cm-via); stroke-width:6; transition:stroke .5s var(--ease); }',
'#camino{ --cm-via:var(--fill-hi); }',
'html.neo #camino{ --cm-via:rgba(45,35,20,.2); }',
'.cm-arco{ fill:none; stroke:var(--col); stroke-width:8; stroke-linecap:round; stroke-dashoffset:100; opacity:0;',
'  transition:stroke-dashoffset .7s cubic-bezier(.4,0,.2,1), opacity .25s var(--ease), stroke .5s var(--ease); }',
'.cm-n{ fill:var(--t3); stroke:none; transition:fill .5s var(--ease); }',
'.cm-parada.ok .cm-fondo{ fill:color-mix(in srgb,var(--col) 14%,var(--bg)); }',
'.cm-parada.ok .cm-arco{ stroke-dashoffset:0; opacity:1; stroke:color-mix(in srgb,var(--col) 62%,var(--bg)); }',
'.cm-parada.ok .cm-n{ fill:color-mix(in srgb,var(--col) 80%,var(--bg)); }',
'.cm-parada.yo .cm-nodo{ width:46px; height:46px; margin:0; }',
'.cm-parada.yo .cm-pista{ stroke:color-mix(in srgb,var(--col) 22%,transparent); }',
'.cm-parada.yo .cm-arco{ stroke-dashoffset:var(--off); opacity:1; }',
'.cm-parada.yo .cm-n{ fill:var(--t1); }',
'.cm-nombre{ margin-top:8px; font-size:11.5px; font-weight:600; line-height:1.25; color:var(--t2); transition:color .5s var(--ease); }',
'.cm-parada.yo .cm-nombre{ color:var(--t1); font-weight:800; }',
'.cm-parada:not(.ok):not(.yo) .cm-nombre{ color:var(--t3); }',
'.cm-premio{ margin-top:6px; padding:3px 8px; border-radius:99px; font-size:10.5px; font-weight:700; white-space:nowrap;',
'  color:var(--col); background:color-mix(in srgb,var(--col) 14%,transparent); }',
'.cm-parada:not(.ok):not(.yo) .cm-premio{ color:var(--t3); background:var(--fill); }',
/* la subida: pantalla limpia, del color del tema */
'#subida-capa{ position:fixed; inset:0; z-index:90; display:flex; align-items:center; justify-content:center; padding:24px 24px calc(24px + env(safe-area-inset-bottom));',
'  background:var(--bg); opacity:0; transition:opacity .32s var(--ease); }',
'#subida-capa.ve{ opacity:1; }',
'.sb-caja{ width:100%; max-width:360px; display:flex; flex-direction:column; align-items:center; text-align:center; }',
'.sb-ey{ font-size:12px; font-weight:800; letter-spacing:.16em; text-transform:uppercase; color:var(--t3); opacity:0; }',
'#subida-capa.ve .sb-ey{ animation:sbSube .5s var(--ease) .1s forwards; }',
'.sb-aro{ position:relative; width:176px; height:176px; margin-top:22px; opacity:0; transform:scale(.92); }',
'#subida-capa.ve .sb-aro{ animation:sbAparece .5s var(--ease) .05s forwards, sbLatido .6s var(--ease) 1s; }',
'@keyframes sbAparece{ to{ opacity:1; transform:none; } }',
'@keyframes sbLatido{ 0%{ transform:none; } 40%{ transform:scale(1.04); } 100%{ transform:none; } }',
'.sb-svg{ position:absolute; inset:0; width:100%; height:100%; overflow:visible; }',
'#subida-capa.ve .sb-arco{ animation:sbLlena .75s cubic-bezier(.65,0,.35,1) .25s forwards; }',
'@keyframes sbLlena{ to{ stroke-dashoffset:0; } }',
'.sb-n{ fill:var(--t1); }',
'.sb-viejo, .sb-nuevo{ transform-box:view-box; }',
'.sb-nuevo{ opacity:0; transform:translateY(34px); }',
'#subida-capa.ve .sb-viejo{ animation:sbSale .38s cubic-bezier(.5,0,.75,0) .95s forwards; }',
'#subida-capa.ve .sb-nuevo{ animation:sbEntra .5s cubic-bezier(.2,.9,.3,1) 1.05s forwards; }',
'@keyframes sbSale{ to{ opacity:0; transform:translateY(-34px); } }',
'@keyframes sbEntra{ to{ opacity:1; transform:none; } }',
'.sb-puntos{ position:absolute; left:50%; top:50%; width:0; height:0; }',
'.sb-puntos i{ position:absolute; width:5px; height:5px; margin:-2.5px; border-radius:99px; background:var(--good); opacity:0; }',
'#subida-capa.ve .sb-puntos i{ animation:sbPunto .8s cubic-bezier(.15,.7,.3,1) calc(1s + var(--ret)) forwards; }',
'@keyframes sbPunto{ 0%{ opacity:0; transform:rotate(var(--ang)) translateX(84px); } 20%{ opacity:.85; }',
'  100%{ opacity:0; transform:rotate(var(--ang)) translateX(var(--dist)); } }',
'.sb-t{ font-size:40px; font-weight:800; letter-spacing:-.045em; line-height:1.05; margin-top:26px; color:var(--t1); opacity:0; }',
'.sb-sub{ display:inline-flex; align-items:center; gap:8px; margin-top:8px; font-size:15px; color:var(--t2); opacity:0; }',
'.sb-sub i{ width:9px; height:9px; border-radius:99px; }',
'#subida-capa.ve .sb-t{ animation:sbSube .5s var(--ease) 1.15s forwards; }',
'#subida-capa.ve .sb-sub{ animation:sbSube .5s var(--ease) 1.22s forwards; }',
'@keyframes sbSube{ from{ opacity:0; transform:translateY(10px); } to{ opacity:1; transform:none; } }',
'.sb-lista{ width:100%; margin-top:26px; border-radius:18px; background:var(--fill); perspective:700px; overflow:hidden; opacity:0; }',
'#subida-capa.ve .sb-lista{ animation:sbSube .4s var(--ease) 1.35s forwards; }',
'.sb-fila{ display:flex; align-items:center; gap:14px; padding:13px 16px; text-align:left; opacity:0; transform-origin:50% 0; transform:rotateX(-80deg); }',
'.sb-fila + .sb-fila{ box-shadow:inset 0 1px 0 var(--hairline); }',
'#subida-capa.ve .sb-fila{ animation:sbGira .6s cubic-bezier(.2,.9,.3,1) calc(1.45s + var(--i)*.14s) forwards; }',
'@keyframes sbGira{ to{ opacity:1; transform:none; } }',
'.sb-ico{ width:34px; height:34px; flex:0 0 auto; border-radius:99px; display:grid; place-items:center; color:var(--rd); background:color-mix(in srgb,var(--rc) 16%,transparent); }',
'.sb-ico svg{ width:18px; height:18px; }',
'.sb-fila div{ min-width:0; display:flex; flex-direction:column; }',
'.sb-fila span:not(.sb-ico){ font-size:11px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--t3); }',
'.sb-fila b{ font-size:15.5px; font-weight:700; color:var(--t1); line-height:1.25; margin-top:2px; }',
'.sb-mas{ font-size:13px; color:var(--t3); padding:10px 0 12px; box-shadow:inset 0 1px 0 var(--hairline); opacity:0; }',
'#subida-capa.ve .sb-mas{ animation:sbSube .45s var(--ease) 2.1s forwards; }',
'.sb-boton{ width:100%; height:54px; margin-top:22px; border-radius:999px; font-size:16px; font-weight:700; color:var(--on-accent); background:var(--accent); opacity:0; }',
'#subida-capa.ve .sb-boton{ animation:sbSube .45s var(--ease) calc(1.7s + var(--nb)*.14s) forwards; }'
].join("\n");


RANGO_CSS+="\n.pf-rango{ display:flex; align-items:center; gap:10px; margin-top:12px; padding:6px 16px 6px 8px; border-radius:999px; background:var(--fill); }"+
  "\n.pf-rango div{ display:flex; flex-direction:column; text-align:left; line-height:1.2; }"+
  "\n.pf-rango b{ font-size:14.5px; font-weight:800; }"+
  "\n.pf-rango span{ font-size:12px; color:var(--t3); }";

/* ════════════════ el botón del gimnasio ════════════════
   Al marcar: se hunde, una ola verde sale desde el dedo, se dibuja el check,
   salta +20 XP y unas chispas. Al desmarcar no hace fiesta. */
function celebraGym(ev){
  sonido("gym");
  var b=document.getElementById("gym-btn"); if(!b) return;
  var r=b.getBoundingClientRect();
  var x=(ev && ev.clientX) ? ev.clientX-r.left : r.width/2, y=(ev && ev.clientY) ? ev.clientY-r.top : r.height/2;
  b.classList.remove("gym-sello"); void b.offsetWidth; b.classList.add("gym-sello");
  var ola=document.createElement("span"); ola.className="gym-ola";
  var rad=Math.hypot(Math.max(x,r.width-x), Math.max(y,r.height-y));
  ola.style.cssText="left:"+x+"px;top:"+y+"px;width:"+(rad*2)+"px;height:"+(rad*2)+"px;margin:-"+rad+"px 0 0 -"+rad+"px";
  b.appendChild(ola);
  setTimeout(function(){ if(ola.parentNode) ola.parentNode.removeChild(ola); }, 900);
  /* chispas y +20 XP, por encima de todo */
  var capa=document.createElement("div"); capa.className="gym-fiesta";
  capa.style.cssText="left:"+(r.left+x)+"px;top:"+(r.top+y)+"px";
  var h='<b>+20 XP</b>';
  for(var i=0;i<12;i++){
    h+='<i style="--ang:'+(i*30+(i%2?8:0))+'deg;--dist:'+(46+(i%3)*18)+'px;--del:'+((i%4)*.03)+'s;background:'+(i%3===0?"var(--good)":i%3===1?"var(--cyan)":"#ffd45c")+'"></i>';
  }
  capa.innerHTML=h; document.body.appendChild(capa);
  setTimeout(function(){ if(capa.parentNode) capa.parentNode.removeChild(capa); }, 1300);
  try{ if(navigator.vibrate) navigator.vibrate([12,60,24]); }catch(err){}
  xpVuela(r.left+x, r.top+y, 20);
}
var GYM_CSS=[
'#gym-btn{ position:relative; overflow:hidden; isolation:isolate; transition:transform .35s var(--spring); }',
'#gym-btn:active{ transform:scale(.965); }',
'#gym-btn > span:not(.gym-ola){ position:relative; z-index:1; display:inline-flex; align-items:center; gap:8px; }',
'.gym-check{ width:22px; height:22px; }',
'.gym-check path{ stroke-dasharray:24; stroke-dashoffset:0; }',
'#gym-btn.gym-sello{ animation:gymSello .62s cubic-bezier(.3,1.5,.5,1); }',
'@keyframes gymSello{ 0%{ transform:scale(.94); } 45%{ transform:scale(1.035); } 100%{ transform:none; } }',
'#gym-btn.gym-sello .gym-check path{ animation:gymTraza .45s ease-out .18s both; }',
'@keyframes gymTraza{ from{ stroke-dashoffset:24; } to{ stroke-dashoffset:0; } }',
'#gym-btn.gym-sello .gym-si{ animation:gymTexto .4s var(--ease) both; }',
'@keyframes gymTexto{ from{ opacity:0; transform:translateY(6px); } to{ opacity:1; transform:none; } }',
'.gym-ola{ position:absolute; z-index:0; border-radius:999px; pointer-events:none;',
'  background:radial-gradient(circle, rgba(255,255,255,.55) 0%, rgba(255,255,255,.18) 45%, transparent 70%);',
'  transform:scale(0); animation:gymOla .75s cubic-bezier(.2,.8,.3,1) forwards; }',
'@keyframes gymOla{ 0%{ transform:scale(0); opacity:1; } 100%{ transform:scale(1); opacity:0; } }',
'.gym-fiesta{ position:fixed; z-index:95; width:0; height:0; pointer-events:none; }',
'.gym-fiesta b{ position:absolute; left:0; top:0; transform:translate(-50%,-50%); font-family:"Plus Jakarta Sans",sans-serif;',
'  font-size:17px; font-weight:800; color:var(--good); white-space:nowrap; animation:gymXP 1.1s var(--ease) .1s both; text-shadow:0 2px 10px var(--bg); }',
'@keyframes gymXP{ 0%{ opacity:0; transform:translate(-50%,-30%) scale(.7); } 25%{ opacity:1; transform:translate(-50%,-110%) scale(1.08); }',
'  100%{ opacity:0; transform:translate(-50%,-260%) scale(1); } }',
'.gym-fiesta i{ display:none!important; position:absolute; left:-2.5px; top:-2.5px; width:5px; height:5px; border-radius:99px; opacity:0; background:var(--good)!important;',
'  animation:gymChispa .75s cubic-bezier(.1,.8,.3,1) var(--del) forwards; }',
'@keyframes gymChispa{ 0%{ opacity:0; transform:rotate(var(--ang)) translateX(6px); } 25%{ opacity:.8; }',
'  100%{ opacity:0; transform:rotate(var(--ang)) translateX(calc(var(--dist) * .75)) scale(.6); } }'
].join("\n");
RANGO_CSS+="\n"+GYM_CSS;

/* ════════════════ info del grupo ════════════════ */
var GNKEY="dtrack-grupo-nombre";
function nombreGrupoGuardado(){ try{ return localStorage.getItem(GNKEY)||""; }catch(e){ return ""; } }
function abrirGrupo(){
  if(!GRUPO) return;
  var capa=document.getElementById("grupo-capa");
  if(!capa){ capa=document.createElement("div"); capa.id="grupo-capa"; document.body.appendChild(capa); }
  var yoNv=stats().lvl;
  var lista=GRUPO.miembros.slice().sort(function(a,b){
    var na=(a.usuario===GRUPO.yo?yoNv:a.nivel||1), nb=(b.usuario===GRUPO.yo?yoNv:b.nivel||1); return nb-na; });
  var caras=GRUPO.miembros.slice(0,6).map(function(m){ return '<span>'+caraDe(m,54)+'</span>'; }).join("");
  var r=GRUPO.reto, tot=retoTotal();
  capa.innerHTML=
    '<div class="pf-barra"><button class="pf-atras" data-act="x-grupo-cerrar" aria-label="Volver">'+
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>'+
      '<span>Grupo</span></div>'+
    '<div class="pf-scroll">'+
      '<div class="gr-cabeza">'+
        '<div class="gr-caras">'+caras+'</div>'+
        '<input id="gr-nombre" class="gr-nombre display" maxlength="28" value="'+esc(GRUPO.nombre)+'" aria-label="Nombre del grupo">'+
        '<p class="gr-sub">Toca el nombre para cambiarlo · '+GRUPO.miembros.length+' de 12 personas</p>'+
        '<textarea id="gr-desc" class="gr-desc" maxlength="140" rows="2" placeholder="Añade una descripción: de qué va el grupo, a qué vais…">'+esc(GRUPO.desc||"")+'</textarea>'+
      '</div>'+
      '<div class="soc-sec"><h2 class="display">Invitar</h2></div>'+
      '<div class="gr-codigo"><div><span>Código del grupo</span><b class="num">'+esc(GRUPO.codigo)+'</b></div>'+
        '<button data-act="x-grupo-copiar">Copiar</button></div>'+
      '<button class="gr-compartir" data-act="x-grupo-compartir">'+
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7.5 7.5 12 3l4.5 4.5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>'+
        'Mandar invitación</button>'+
      '<div class="soc-sec"><h2 class="display">Miembros</h2><span class="t3" style="font-size:12.5px">por nivel</span></div>'+
      '<div class="soc-lista">'+lista.map(function(m){
        var yo=(m.usuario===GRUPO.yo), nv=yo?yoNv:(m.nivel||1);
        return '<div class="soc-fila" data-act="x-perfil" data-u="'+esc(m.usuario)+'" style="cursor:pointer">'+caraDe(m,40)+
          '<div class="soc-cuerpo"><div style="flex:1;min-width:0"><p class="soc-nombre">'+esc(m.usuario)+(yo?'<span class="t3" style="font-weight:500"> · tú</span>':'')+'</p>'+
          '<p class="soc-sub">'+esc(rangoNombre(nv))+' · '+esc(yo?tituloElegido(nv):tituloDe(nv))+'</p></div>'+
          emblemaRango(nv,28)+'</div></div>';
      }).join("")+'</div>'+
      '<div class="soc-sec"><h2 class="display">Objetivo del grupo</h2></div>'+
      '<div class="soc-lista"><div class="soc-fila"><div class="soc-cuerpo"><span style="flex:1;font-size:15px">'+esc(r.txt)+'</span>'+
        '<span class="num t2" style="font-weight:700">'+tot+' / '+r.objetivo+'</span></div></div></div>'+
      '<div class="soc-ajustes" style="margin-top:34px"><button data-act="x-grupo-salir"><span class="rojo">Salir del grupo</span></button></div>'+
      '<div style="height:40px"></div>'+
    '</div>';
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ capa.classList.add("ve"); }); });
  var gd=document.getElementById("gr-desc");
  if(gd) gd.addEventListener("input", function(){
    GRUPO.desc=gd.value.slice(0,140);
    clearTimeout(gd._t); gd._t=setTimeout(function(){ try{ localStorage.setItem(GDKEY, GRUPO.desc); }catch(err){} if(typeof gEditarPronto==="function") gEditarPronto(); }, 400);
  });
  var inp=document.getElementById("gr-nombre");
  if(inp){
    inp.addEventListener("keydown", function(ev){ if(ev.key==="Enter") inp.blur(); });
    inp.addEventListener("change", function(){
      var v=inp.value.trim().slice(0,28);
      if(!v){ inp.value=GRUPO.nombre; return; }
      GRUPO.nombre=v; try{ localStorage.setItem(GNKEY,v); }catch(err){} if(typeof gEditarPronto==="function") gEditarPronto();
      avisoNube("Grupo renombrado: "+v);
    });
  }
}
function cerrarGrupo(){
  var capa=document.getElementById("grupo-capa"); if(!capa) return;
  var inp=document.getElementById("gr-nombre"); if(inp) inp.blur();
  capa.classList.remove("ve");
  setTimeout(function(){ if(capa.parentNode && !capa.classList.contains("ve")) capa.parentNode.removeChild(capa); }, 380);
  if(view==="social") rSocial();
}
var GRUPO_CSS=[
'#grupo-capa{ position:fixed; inset:0; z-index:64; background:var(--bg); display:flex; flex-direction:column;',
'  transform:translateX(100%); transition:transform .42s cubic-bezier(.32,.72,0,1); }',
'#grupo-capa.ve{ transform:none; }',
'.gr-cabeza{ display:flex; flex-direction:column; align-items:center; text-align:center; padding-top:10px; }',
'.gr-caras{ display:flex; }',
'.gr-caras > span{ margin-left:-14px; border-radius:999px; box-shadow:0 0 0 3px var(--bg); }',
'.gr-caras > span:first-child{ margin-left:0; }',
'#grupo-capa input.gr-nombre{ font-size:30px!important; }',
'.gr-nombre{ width:100%; margin-top:16px; text-align:center; font-size:30px; font-weight:800; letter-spacing:-.04em; background:none; border:0; outline:none; color:var(--t1);',
'  border-radius:14px; padding:4px 8px; transition:background .2s var(--ease); }',
'.gr-nombre:focus{ background:var(--fill); }',
'.gr-sub{ font-size:12.5px; color:var(--t3); margin-top:4px; }',
'.gr-codigo{ display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:10px; padding:14px 16px; border-radius:18px;',
'  background:var(--glass-bg); box-shadow:inset 0 0 0 1px var(--hairline-2); }',
'.gr-codigo span{ display:block; font-size:12px; color:var(--t3); }',
'.gr-codigo b{ font-family:"Plus Jakarta Sans",sans-serif; font-size:26px; font-weight:800; letter-spacing:.18em; }',
'.gr-codigo button{ font-size:14px; font-weight:700; color:var(--accent); padding:8px 4px; }',
'.gr-compartir{ width:100%; height:52px; margin-top:12px; border-radius:999px; display:flex; align-items:center; justify-content:center; gap:8px;',
'  font-size:15px; font-weight:700; color:var(--on-accent); background:var(--accent);',
'  box-shadow:0 14px 30px -14px color-mix(in srgb,var(--accent) 75%,transparent); }',
'.gr-compartir svg{ width:18px; height:18px; }',
'.soc-grupo{ cursor:pointer; }'
].join("\n");
RANGO_CSS+="\n"+GRUPO_CSS;

/* cambiar el nombre de usuario: en la nube hay que comprobar que no esté cogido */
function cambiarUsuario(v){
  function aplica(){
    var antes=perfil && perfil.usuario;
    if(!perfil) perfil={};
    perfil.usuario=v;
    if(!S.profile) S.profile={};
    S.profile.name = S.profile.name || v;
    if(GRUPO){
      for(var i=0;i<GRUPO.miembros.length;i++) if(GRUPO.miembros[i].usuario===antes) GRUPO.miembros[i].usuario=v;
      if(GRUPO.yo===antes) GRUPO.yo=v;
      if(GRUPO.reto && GRUPO.reto.marcas && antes && GRUPO.reto.marcas[antes]){ GRUPO.reto.marcas[v]=GRUPO.reto.marcas[antes]; delete GRUPO.reto.marcas[antes]; }
      (GRUPO.muro||[]).forEach(function(m){ if(m.usuario===antes) m.usuario=v; });
    }
    try{ var gp=JSON.parse(localStorage.getItem("dtrack-perfil")||"null"); if(gp){ gp.usuario=v; localStorage.setItem("dtrack-perfil",JSON.stringify(gp)); } }catch(err){}
    save();
    return true;
  }
  if(!ses || ses.demo) return Promise.resolve(aplica());
  return pedirAuth("/rest/v1/perfiles?id=eq."+ses.uid, {method:"PATCH", body:{usuario:v}}).then(function(r){
    if(r.ok) return aplica();
    var cod=(r.datos&&r.datos.code)||"";
    avisoNube(cod==="23505" ? "Ese nombre ya está cogido. Prueba otro." : "No se ha podido cambiar ahora. Inténtalo luego.");
    return false;
  }).catch(function(){ avisoNube("Sin conexión: no se ha podido cambiar."); return false; });
}

/* ════════════════ celebrar lo que marcas ════════════════
   Cada vez que marcas algo que da XP: el círculo da un salto con una onda,
   la fila se ilumina, sube el XP ganado y saltan unas chispas. */
function celebraTick(el, xp, color){
  if(!el) return;
  if(el.dataset && el.dataset.act==="check") recienMarcado={ id:el.dataset.id, t:Date.now() };
  sonido(xp>=50?"gym":"tick");
  var fila=el.closest(".soft, .reto-extra, .medal, div");
  var tick=(fila && fila.querySelector(".tick")) || el;
  var r=tick.getBoundingClientRect(); if(!r.width) return;
  var cx=r.left+r.width/2, cy=r.top+r.height/2;
  color=color||"var(--accent)";
  if(fila){ fila.classList.remove("tick-fiesta"); void fila.offsetWidth; fila.classList.add("tick-fiesta");
            setTimeout(function(){ fila.classList.remove("tick-fiesta"); }, 900); }
  var capa=document.createElement("div"); capa.className="gym-fiesta tick-capa";
  capa.style.cssText="left:"+cx+"px;top:"+cy+"px;--col:"+color;
  var h='<span class="tick-onda"></span><b>+'+xp+' XP</b>';
  for(var i=0;i<8;i++){
    h+='<i style="--ang:'+(i*45+20)+'deg;--dist:'+(26+(i%2)*12)+'px;--del:'+((i%3)*.02)+'s;background:'+(i%2?color:"#ffd45c")+'"></i>';
  }
  capa.innerHTML=h; document.body.appendChild(capa);
  setTimeout(function(){ if(capa.parentNode) capa.parentNode.removeChild(capa); }, 1200);
  try{ if(navigator.vibrate) navigator.vibrate(14); }catch(err){}
  xpVuela(cx, cy, xp);
}
var TICK_CSS=[
'.tick-fiesta{ animation:tickFila .8s var(--ease); }',
'@keyframes tickFila{ 0%{ background-color:color-mix(in srgb,var(--accent) 16%,transparent); } 100%{ background-color:transparent; } }',
'.tick-fiesta .tick{ animation:tickSalto .5s cubic-bezier(.3,1.8,.5,1); }',
'@keyframes tickSalto{ 0%{ transform:scale(.7); } 55%{ transform:scale(1.28); } 100%{ transform:none; } }',
'.tick-capa b{ font-size:14px!important; color:var(--col)!important; transform:translate(-50%,-50%); }',
'.tick-capa .tick-onda{ position:absolute; left:-15px; top:-15px; width:30px; height:30px; border-radius:99px;',
'  box-shadow:0 0 0 2px var(--col); opacity:0; animation:tickOnda .6s cubic-bezier(.2,.8,.3,1) forwards; }',
'@keyframes tickOnda{ 0%{ opacity:.9; transform:scale(.5); } 100%{ opacity:0; transform:scale(2.2); } }',
'.tick-capa i{ width:4px!important; height:4px!important; left:-2px!important; top:-2px!important; }',
'#pf-nombre, .pf-nombre{ width:100%; max-width:360px; margin-top:14px; text-align:center; font-size:30px!important; font-weight:800; letter-spacing:-.04em;',
'  background:none; border:0; outline:none; color:var(--t1); border-radius:14px; padding:2px 8px; transition:background .2s var(--ease); }',
'#perfil-capa input.pf-nombre{ font-size:30px!important; }',
'.pf-nombre:focus{ background:var(--fill); }',
'.pf-pista{ font-size:11.5px; color:var(--t3); margin-top:2px; }',
'.gr-desc{ width:100%; max-width:420px; margin-top:12px; padding:12px 14px; border-radius:16px; resize:none; text-align:center; line-height:1.45;',
'  background:var(--fill); color:var(--t1); border:0; outline:none; box-shadow:inset 0 0 0 1px var(--hairline); }',
'.gr-desc:focus{ box-shadow:inset 0 0 0 2px var(--accent); }'
].join("\n");
RANGO_CSS+="\n"+TICK_CSS;

/* descripción del grupo (en modo prueba se guarda en el navegador) */
var GDKEY="dtrack-grupo-desc";
function descGrupoGuardada(){ try{ return localStorage.getItem(GDKEY); }catch(e){ return null; } }

/* ════════════════ salud del día ════════════════
   Cumplir un objetivo celebra igual que el gimnasio, y el valor se puede
   escribir directamente tocándolo. */
var SALUD={
  water:{ n:"Agua",     u:"vasos", xp:6, max:16, paso:1,  cid:"water-val",  mid:"mg-agua",
          ok:function(v){ return v>=8; },            chips:[2,4,6,8,10,12] },
  sleep:{ n:"Descanso", u:"horas", xp:8, max:14, paso:.5, cid:"sleep-val",  mid:"mg-sueno",
          ok:function(v){ return v>=7; },            chips:[5,6,7,7.5,8,9] },
  screen:{ n:"Pantalla", u:"horas", xp:6, max:16, paso:.5, cid:"screen-val", mid:"mg-pantalla",
          ok:function(v){ return v!=null && v>0 && v<2; }, chips:[.5,1,1.5,2,3,5] }
};
function saludPon(d, k, v){
  var def=SALUD[k], antes=habit(d)[k];
  var o={}; o[k]=v; setHabit(d,o); rVital();
  if(def && !def.ok(antes) && def.ok(v)) setTimeout(function(){ celebraSalud(k); }, 30);
}
function celebraSalud(k){
  sonido("salud");
  var def=SALUD[k], caja=document.getElementById(def.cid), med=document.getElementById(def.mid);
  if(!caja) return;
  caja.classList.remove("salud-ok"); void caja.offsetWidth; caja.classList.add("salud-ok");
  if(med){ med.classList.remove("med-pop"); void med.offsetWidth; med.classList.add("med-pop"); }
  setTimeout(function(){ caja.classList.remove("salud-ok"); if(med) med.classList.remove("med-pop"); }, 1100);
  var r=caja.getBoundingClientRect();
  xpVuela(r.left+r.width/2, r.top+r.height/2, def.xp);
  var capa=document.createElement("div"); capa.className="gym-fiesta";
  capa.style.cssText="left:"+(r.left+r.width/2)+"px;top:"+(r.top+r.height/2)+"px";
  var h='<b>+'+def.xp+' XP</b>';
  for(var i=0;i<12;i++) h+='<i style="--ang:'+(i*30+10)+'deg;--dist:'+(40+(i%3)*16)+'px;--del:'+((i%4)*.03)+'s;background:'+(i%3===0?"var(--good)":i%3===1?"var(--cyan)":"#ffd45c")+'"></i>';
  capa.innerHTML=h; document.body.appendChild(capa);
  setTimeout(function(){ if(capa.parentNode) capa.parentNode.removeChild(capa); }, 1300);
  try{ if(navigator.vibrate) navigator.vibrate([12,60,24]); }catch(err){}
}

var valorClave="water", valorDia=null;
function fmtValor(k,v){
  if(k==="water") return v+" "+(v===1?"vaso":"vasos");
  return String(v).replace(".",",")+" h";
}
function sheetValor(k){
  var def=SALUD[k]; if(!def) return;
  valorClave=k; valorDia=curDay();
  var v=habit(valorDia)[k]; if(v==null) v=0;
  openSheet(
    '<div class="flex items-start justify-between mb-1"><h3 class="display" style="font-size:24px;font-weight:800;letter-spacing:-.035em">'+def.n+'</h3>'+closeBtn()+'</div>'+
    '<p class="t3" style="font-size:13px;margin-bottom:8px">'+(k==="water"?"Vasos de agua de ese día. El objetivo son 8.":k==="sleep"?"Horas que dormiste. El objetivo son 7 o más.":"Horas de pantalla sin contar clase. El objetivo es menos de 2.")+'</p>'+
    '<div class="vl-grande display num" id="vl-num">'+fmtValor(k,v)+'</div>'+
    '<input id="vl-rango" class="vl-rango" type="range" min="0" max="'+def.max+'" step="'+def.paso+'" value="'+v+'">'+
    '<div class="vl-chips">'+def.chips.map(function(c){ return '<button data-act="x-valor-chip" data-v="'+c+'">'+fmtValor(k,c)+'</button>'; }).join("")+'</div>'+
    '<button class="est-empezar" data-act="x-valor-ok">Guardar</button>'
  );
  var rg=document.getElementById("vl-rango");
  rg.addEventListener("input", function(){ valorPinta(+rg.value); });
  valorPinta(v);
}
function valorPinta(v){
  var n=document.getElementById("vl-num"); if(n){ n.textContent=fmtValor(valorClave,v); n.classList.toggle("ok", SALUD[valorClave].ok(v)); }
  var cs=document.querySelectorAll(".vl-chips button");
  for(var i=0;i<cs.length;i++) cs[i].classList.toggle("on", +cs[i].dataset.v===v);
}
function valorMarca(v){ var rg=document.getElementById("vl-rango"); if(rg){ rg.value=v; valorPinta(v); } }

var SALUD_CSS=[
'.salud-ok{ animation:saludOk 1s var(--ease); }',
'@keyframes saludOk{ 0%{ transform:scale(.94); } 30%{ transform:scale(1.05); background:color-mix(in srgb,var(--good) 28%,transparent); color:var(--good); }',
'  100%{ transform:none; } }',
'.med-pop{ animation:medPop .6s cubic-bezier(.3,1.7,.5,1); }',
'@keyframes medPop{ 0%{ transform:scale(.8); } 55%{ transform:scale(1.18); } 100%{ transform:none; } }',
'#mg-agua + div, #mg-sueno + div, #mg-pantalla + div{ margin-right:16px; }',
'#water-val, #sleep-val, #screen-val{ transition:background .2s var(--ease); }',
'#water-val:active, #sleep-val:active, #screen-val:active{ background:var(--fill-hi)!important; }',
'.vl-grande{ text-align:center; font-size:46px; font-weight:800; letter-spacing:-.04em; margin:18px 0 10px; transition:color .25s var(--ease); }',
'.vl-grande.ok{ color:var(--good); }',
'.vl-rango{ width:100%; accent-color:var(--accent); height:32px; }',
'.vl-chips{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:12px; }',
'.vl-chips button{ height:44px; border-radius:14px; font-size:14px; font-weight:700; background:var(--fill); color:var(--t2); box-shadow:inset 0 0 0 1px var(--hairline); }',
'.vl-chips button.on{ background:var(--accent-soft); color:var(--accent); box-shadow:inset 0 0 0 2px var(--accent); }'
].join("\n");
RANGO_CSS+="\n"+SALUD_CSS;

