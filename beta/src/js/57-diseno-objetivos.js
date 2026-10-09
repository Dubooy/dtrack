/* ════════ diseño nuevo · Objetivos y Progreso (oct 2026) ════════
   Maquetas: diseno/ui-peak/objetivos-claro.html y progreso-claro.html.
   Objetivos: sin tarjetas, con títulos de sección; «Los tres de hoy» ya va en Hoy,
   así que aquí sale «Más» con Mis retos y Experimentos.
   Progreso: tu rango en grande con la barra por tramos, la montaña de noche con
   el gancho de tus amigos y «Abrir 3D», hoy · racha · mejor, y tu grupo por nivel.
   Las tarjetas viejas siguen en la página (escondidas) porque otras piezas las usan. */

function onObjetivos(){
  var v=document.getElementById("v-retos"); if(!v) return;
  document.documentElement.classList.add("obj-n");
  var eb=v.querySelector("p.eyebrow"); if(eb && eb.textContent!=="Tus metas") eb.textContent="Tus metas";
  /* metas del mes: cabecera como las demás secciones */
  var mm=document.getElementById("metas-mes"), cab=mm && mm.querySelector(".mm-cab");
  if(cab){
    var q=cab.querySelector(".mm-quedan b"), n=q ? +q.textContent : 0;
    var h=document.createElement("div"); h.className="hn-sec on-cab";
    h.innerHTML='<h2>Metas del mes</h2><span>'+(n===1?"Queda 1 día":"Quedan "+n+" días")+'</span>';
    cab.parentNode.replaceChild(h, cab);
  }
  /* Más: Mis retos y Experimentos */
  var obj=document.getElementById("rt-obj");
  if(obj){
    var mas=document.getElementById("on-mas");
    if(!mas){ mas=document.createElement("div"); mas.id="on-mas"; }
    if(mas.parentNode!==obj || mas.nextElementSibling) obj.appendChild(mas);
    var ex=typeof expActivo==="function" && expActivo();
    var html='<div class="hn-sec"><h2>Más</h2></div>'+
      '<button class="on-fila" data-act="edit-challenges"><span><b>Mis retos</b><small>Elige los tres de cada día</small></span><i>›</i></button>'+
      '<button class="on-fila" data-act="'+(ex?"x-exp-ver":"x-exp-catalogo")+'"><span><b>Experimentos</b><small>'+(ex?"Tienes uno en marcha":"Prueba un cambio 7 días")+'</small></span><i>›</i></button>';
    if(mas.dataset.h!==html){ mas.innerHTML=html; mas.dataset.h=html; }
  }
}

function pnPinta(){
  var prog=document.getElementById("rt-prog"); if(!prog) return;
  var st=stats(), lv=st.lvl, sig=Math.min(40, lv+1);
  var x0=pmXPSuelo(lv), x1=pmXPSuelo(lv+1), dentro=Math.max(0, st.xp-x0), need=Math.max(1, x1-x0);
  var on=Math.max(0, Math.min(20, Math.floor(dentro/need*20))), seg="";
  for(var i=0;i<20;i++) seg+='<u'+(i<on?' class="on"':i===on?' class="ac"':'')+'></u>';
  var nombre=function(n){ return LVL_NAMES[Math.min(n-1, LVL_NAMES.length-1)]; };
  /* tu grupo, por nivel */
  var gente=typeof mtGente==="function" ? mtGente() : [], arriba=null;
  gente.forEach(function(g){ var n=g.nv||1; if(n>lv && (!arriba || n<arriba.nv)) arriba=g; });
  var yoNom=(typeof perfil!=="undefined" && perfil && perfil.usuario) || "Tú";
  var lista=gente.map(function(g){ return { u:g.u, nv:g.nv||1, g:g }; }).concat([{ u:yoNom, nv:lv, yo:true }]);
  lista.sort(function(a,b){ return b.nv-a.nv || (a.yo?-1:b.yo?1:0); });
  var pos=0; lista.forEach(function(p,i){ if(p.yo) pos=i; });
  var desde=Math.max(0, Math.min(pos-2, lista.length-5));
  var grupo=gente.length ? lista.slice(desde, desde+5).map(function(p,i){
      return '<button class="pn-am'+(p.yo?' me':'')+'"'+(p.yo?' data-act="x-perfil"':' data-act="x-pn-u" data-u="'+esc(p.u)+'"')+'>'+
        '<span class="pn-pos num">'+(desde+i+1)+'</span><span class="pn-av">'+(p.yo?hnAvatar():mtCara(p.g, 36))+'</span>'+
        '<span class="pn-tx"><b>'+(p.yo?"Tú":esc(String(p.u).slice(0,18)))+'</b><small>'+esc(nombre(p.nv))+'</small></span><b class="pn-nv num">'+p.nv+'</b></button>';
    }).join("")
    : '<button class="on-fila" data-jump="social"><span><b>Sube con tus amigos</b><small>Únete a un grupo y verás aquí cómo vais</small></span><i>›</i></button>';
  var gancho = arriba ? esc(String(arriba.u).slice(0,14))+" va "+((arriba.nv||1)-lv)+((arriba.nv||1)-lv===1?" nivel":" niveles")+" por encima. Mira por dónde va."
    : gente.length ? "Vas el primero de tu grupo. Mira la vista desde arriba."
    : "Mira todo lo que te queda hasta la cima.";
  var html=
    '<div class="pn-rango"><p class="pn-eti">Tu rango</p><p class="pn-big">'+esc(nombre(lv))+'</p>'+
      '<div class="pn-xp">'+seg+'</div>'+
      '<div class="pn-xpl"><span class="num">'+dentro+' / '+need+' XP</span><span>'+(lv<40?esc(nombre(sig))+' en '+Math.max(0, x1-st.xp)+' XP':'Has llegado a la cima')+'</span></div></div>'+
    '<button class="pn-mont" data-act="x-monte" aria-label="Abrir tu montaña en 3D">'+
      '<svg viewBox="0 0 350 210" preserveAspectRatio="xMidYMax slice" aria-hidden="true">'+
        '<defs><pattern id="pn-ry" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><rect width="2" height="6" fill="#F3EEE3" opacity=".22"/></pattern>'+
        '<radialGradient id="pn-cie" cx=".7" cy=".1" r=".9"><stop offset="0" stop-color="#2b3a55"/><stop offset="1" stop-color="#0d0f16"/></radialGradient></defs>'+
        '<rect width="350" height="210" fill="url(#pn-cie)"/>'+
        '<g fill="#F3EEE3"><circle cx="40" cy="30" r="1"/><circle cx="90" cy="18" r=".8"/><circle cx="150" cy="40" r="1.1"/><circle cx="300" cy="28" r=".9"/><circle cx="260" cy="60" r=".7"/><circle cx="20" cy="80" r=".8"/></g>'+
        '<path d="M0 210 L120 95 L150 112 L205 40 L240 70 L262 58 L350 150 L350 210Z" fill="#1d2230"/>'+
        '<path d="M205 40 L240 70 L262 58 L350 150 L350 210 L230 210 Z" fill="url(#pn-ry)"/>'+
        '<path class="pn-senda" d="M40 210 C90 190 150 185 170 160 S150 120 185 105 S215 75 205 46" fill="none" stroke="#F3EEE3" stroke-width="1.6" stroke-dasharray="2 5" opacity=".55"/>'+
        '<path class="pn-hecho" d="M40 210 C90 190 150 185 170 160 S150 120 185 105 S215 75 205 46" fill="none" stroke="#3BE08B" stroke-width="2.5"/>'+
        '<path d="M205 40 V22 L218 27 L205 32" fill="#F3EEE3"/>'+
        '<g class="pn-yo"><circle r="8" fill="#3BE08B" opacity=".25"/><circle r="5.5" fill="#3BE08B" stroke="#0d0f16" stroke-width="2"/></g>'+
      '</svg>'+
      '<span class="pn-mt-top"><span>Nivel '+lv+' de 40</span><span>'+(lv<40?"Cima ▸ "+(40-lv)+(40-lv===1?" nivel":" niveles"):"En la cima")+'</span></span>'+
      '<span class="pn-mt-pie"><span><b>Ver tu montaña</b><small>'+gancho+'</small></span><span class="pn-btn">Abrir 3D</span></span>'+
    '</button>'+
    '<div class="hn-fila3 pn-f3"><div><small>Hoy</small><b class="num">+'+pmXPHoy().total+'<span>XP</span></b></div>'+
      '<div><small>Racha</small><b class="num">'+(st.streak||0)+'<span>'+((st.streak||0)===1?" día":" días")+'</span></b></div>'+
      '<div><small>Mejor</small><b class="num">'+(st.best||0)+'<span>'+((st.best||0)===1?" día":" días")+'</span></b></div></div>'+
    '<div class="hn-sec"><h2>Tu grupo</h2><span>'+(gente.length?"Por nivel":"")+'</span></div>'+grupo;
  var box=document.getElementById("pn");
  if(!box){ box=document.createElement("div"); box.id="pn"; }
  if(box.parentNode!==prog || box!==prog.firstElementChild) prog.insertBefore(box, prog.firstElementChild);
  if(box.dataset.h===html) return;
  box.innerHTML=html; box.dataset.h=html;
  document.documentElement.classList.add("obj-n");
  /* tu punto sube por el sendero según tu nivel */
  try{
    var p=box.querySelector(".pn-hecho"), L=p.getTotalLength(), f=Math.max(.04, Math.min(1, (lv-1)/39)), pt=p.getPointAtLength(L*f);
    p.style.strokeDasharray=(L*f).toFixed(1)+" "+L.toFixed(1);
    box.querySelector(".pn-yo").setAttribute("transform", "translate("+pt.x.toFixed(1)+" "+pt.y.toFixed(1)+")");
  }catch(e){}
}

var _onMetas=pintaMetas;
pintaMetas=function(){ var r=_onMetas.apply(this, arguments); try{ onObjetivos(); }catch(e){ if(window.console) console.warn("objetivos", e); } return r; };
var _pnRango=pintaRangoRetos;
pintaRangoRetos=function(){ var r=_pnRango.apply(this, arguments); try{ pnPinta(); }catch(e){ if(window.console) console.warn("progreso", e); } return r; };
/* retosOrganiza crea los paneles después; al final pinta el diario, así que ahí se repasa todo */
var _pnDiario=pintaTarjetaDiario;
pintaTarjetaDiario=function(){ var r=_pnDiario.apply(this, arguments); try{ onObjetivos(); pnPinta(); }catch(e){ if(window.console) console.warn("objetivos", e); } return r; };

(function(){
  var st=document.createElement("style"); st.id="diseno-objetivos-css"; st.textContent=[
/* cabecera: PEAK. arriba, «Tus metas» y el título */
'html.obj-n #v-retos p.eyebrow:has(+ h1.display){ font-size:11px; font-weight:600; letter-spacing:.18em; text-transform:uppercase; color:var(--t3); }',
'html.obj-n #v-retos p.eyebrow:has(+ h1.display)::before{ content:"PEAK."; display:block; font-family:var(--f-titulo); font-weight:800; font-size:17px; letter-spacing:-.03em;',
'  color:var(--t1); text-transform:none; margin-bottom:30px; line-height:40px; white-space:normal; }',
'html.obj-n #v-retos h1.display{ font-size:36px !important; font-weight:800 !important; letter-spacing:-.05em !important; line-height:1 !important; margin-top:14px; }',
/* lo que ya no va */
'html.obj-n #v-retos .glass:has(#ch-title), html.obj-n #card-nivel, html.obj-n #pm-extra, html.obj-n #camino .cm-monte, html.obj-n #metas-mes .mm-tiempo{ display:none !important; }',
/* sin tarjetas */
'html.obj-n #v-retos #reto-semana, html.obj-n #v-retos #metas-mes, html.obj-n #v-retos #rt-desc{ background:none !important; border:0 !important; box-shadow:none !important; padding:0 !important; border-radius:0 !important; }',
'html.obj-n #reto-semana::before, html.obj-n #metas-mes::before, html.obj-n #rt-desc::before{ display:none !important; }',
/* el selector Objetivos / Progreso */
'html.obj-n .rt-tabs{ border:1px solid var(--hairline) !important; border-radius:99px !important; padding:3px !important; margin-top:22px; background:transparent !important; }',
'html.obj-n .rt-tabs button{ height:38px; font-family:var(--f-texto) !important; font-size:14.5px !important; font-weight:600; letter-spacing:0; color:var(--t2); }',
'html.obj-n .rt-tabs .rt-pill{ border-radius:99px !important; }',
/* reto de la semana */
'html.obj-n #reto-semana{ margin-top:16px; }',
'html.obj-n #reto-semana .rs-top{ align-items:baseline; }',
'html.obj-n #v-retos #reto-semana .rs-top .eyebrow{ font-family:var(--f-titulo) !important; font-weight:700; font-size:19px; letter-spacing:-.03em !important; text-transform:none; color:var(--t1); }',
'html.obj-n #reto-semana .rs-top .eyebrow::after, html.obj-n #reto-semana .rs-top .eyebrow::before{ display:none !important; }',
'html.obj-n #reto-semana .rs-xp{ color:var(--hn-ac); background:color-mix(in srgb, var(--hn-ac) 13%, transparent); font-size:12.5px; font-weight:600; padding:5px 10px; }',
'html.obj-n #reto-semana .rs-editar{ font-size:14px; font-weight:600; color:var(--t2); }',
'html.obj-n #reto-semana .rs-t{ font-family:var(--f-titulo) !important; font-weight:800 !important; font-size:28px !important; letter-spacing:-.04em !important; line-height:1.1 !important; margin:14px 0 18px; }',
'html.obj-n #reto-semana .rs-segs{ height:30px; margin:0 0 12px; }',
'html.obj-n #reto-semana .rs-segs::before{ left:15px; right:15px; border-top:2px solid var(--hairline); }',
'html.obj-n #reto-semana .rs-segs i{ width:30px !important; height:30px !important; border:1.5px solid var(--t3) !important; background:var(--bg) !important; }',
'html.obj-n #reto-semana .rs-segs i.on{ background:var(--t1) !important; border-color:var(--t1) !important; }',
'html.obj-n #reto-semana .rs-pie{ font-size:13px; color:var(--t2); }',
/* metas del mes */
'html.obj-n #metas-mes .on-cab{ margin-top:36px; }',
'html.obj-n #metas-mes .mm-meta{ padding:16px 0; border-bottom:1px solid var(--hairline); box-shadow:none !important; }',
'html.obj-n #metas-mes .mm-meta:first-of-type{ border-top:1px solid var(--hairline); }',
'html.obj-n #metas-mes .mm-t{ font-size:16px; font-weight:500; color:var(--t1); }',
'html.obj-n #metas-mes .mm-sub{ font-size:13px; color:var(--t2); }',
'html.obj-n .op-tramo-v{ background:var(--hairline) !important; }',
'html.obj-n .op-tramo-v i{ background:var(--t1) !important; }',
'html.obj-n .op-tramo b{ font-family:var(--f-titulo); font-size:15px; letter-spacing:-.03em; }',
'html.obj-n #v-retos #metas-mes .mm-nueva.grande{ background:var(--tarjeta) !important; border:0 !important; box-shadow:none !important; border-radius:20px; }',
'html.obj-n #metas-mes .mm-nueva:not(.grande){ display:block; margin-left:auto; margin-top:12px; font-size:13px; font-weight:600; color:var(--t2); background:none !important; }',
/* días de descanso */
'html.obj-n #rt-desc{ margin-top:36px; }',
'html.obj-n #rt-desc h2{ font-family:var(--f-titulo) !important; font-weight:700 !important; font-size:19px !important; letter-spacing:-.03em !important; }',
'html.obj-n #rt-desc .ds-d{ background:var(--tarjeta) !important; border:0 !important; }',
'html.obj-n #rt-desc .ds-d.hoy{ box-shadow:inset 0 0 0 1.5px var(--t1) !important; }',
/* Más */
'#on-mas{ margin-top:4px; }',
'.on-fila{ width:100%; display:flex; align-items:center; justify-content:space-between; background:var(--tarjeta); border-radius:20px; padding:16px; margin-top:12px; text-align:left; color:var(--t1); }',
'.on-fila b{ display:block; font-weight:600; font-size:16px; } .on-fila small{ display:block; color:var(--t2); font-size:13px; margin-top:2px; }',
'.on-fila i{ font-style:normal; color:var(--t3); font-size:22px; }',
/* Progreso */
'#pn{ margin-top:30px; }',
'.pn-eti{ font-size:11px; font-weight:600; letter-spacing:.18em; text-transform:uppercase; color:var(--t3); }',
'.pn-big{ font-family:var(--f-titulo); font-weight:800; font-size:44px; letter-spacing:-.05em; line-height:1; margin-top:10px; text-transform:uppercase; color:var(--t1); }',
'.pn-xp{ display:flex; gap:3px; margin-top:18px; }',
'.pn-xp u{ flex:1; height:8px; border-radius:2px; background:var(--hairline); }',
'.pn-xp u.on{ background:var(--t1); } .pn-xp u.ac{ background:var(--hn-ac); }',
'.pn-xpl{ display:flex; justify-content:space-between; font-size:13px; color:var(--t2); margin-top:8px; }',
'.pn-mont{ position:relative; display:block; width:100%; height:250px; border-radius:24px; overflow:hidden; margin-top:24px; background:#0d0f16; color:#F3EEE3; text-align:left; }',
'.pn-mont svg{ position:absolute; inset:0; width:100%; height:100%; }',
'.pn-mt-top{ position:absolute; top:14px; left:16px; right:16px; display:flex; justify-content:space-between; font-size:10.5px; font-weight:600; letter-spacing:.16em; text-transform:uppercase; color:rgba(243,238,227,.7); }',
'.pn-mt-pie{ position:absolute; left:0; right:0; bottom:0; padding:40px 16px 14px; display:flex; align-items:flex-end; justify-content:space-between; gap:10px;',
'  background:linear-gradient(to top, rgba(13,15,22,.95), rgba(13,15,22,0)); }',
'.pn-mt-pie b{ display:block; font-family:var(--f-titulo); font-weight:800; font-size:19px; letter-spacing:-.03em; }',
'.pn-mt-pie small{ display:block; font-size:13px; color:rgba(243,238,227,.7); margin-top:3px; max-width:200px; }',
'.pn-btn{ background:#F3EEE3; color:#0d0f16; border-radius:99px; padding:10px 14px; font-size:14px; font-weight:600; white-space:nowrap; }',
'.pn-f3{ margin-top:24px; } .pn-f3 > div{ padding:14px 0; } .pn-f3 > div+div{ padding-left:14px; border-left:1px solid var(--hairline); }',
'.pn-am{ width:100%; display:flex; align-items:center; gap:12px; padding:13px 0; border-bottom:1px solid var(--hairline); text-align:left; color:var(--t1); }',
'.pn-pos{ font-family:var(--f-titulo); font-weight:700; font-size:13px; color:var(--t3); width:22px; }',
'.pn-av{ width:36px; height:36px; border-radius:50%; overflow:hidden; flex:none; display:grid; place-items:center; }',
'.pn-av .hn-yo{ width:36px; height:36px; box-shadow:none; font-size:14px; } .pn-av > *{ max-width:100%; }',
'.pn-tx b{ display:block; font-weight:500; font-size:16px; } .pn-tx small{ display:block; font-size:13px; color:var(--t2); }',
'.pn-nv{ margin-left:auto; font-family:var(--f-titulo); font-size:14px; letter-spacing:-.03em; }',
'.pn-am.me{ background:color-mix(in srgb, var(--hn-ac) 9%, transparent); margin:0 -20px; padding:13px 20px; width:calc(100% + 40px); }',
'.pn-am.me .pn-pos{ color:var(--hn-ac); }',
'html.obj-n #camino{ margin-top:36px; }',
'html.obj-n #camino .cm-cab h2{ font-family:var(--f-titulo) !important; font-weight:700 !important; font-size:19px !important; letter-spacing:-.03em !important; }'
  ].join("\n");
  document.head.appendChild(st);
  try{ onObjetivos(); pnPinta(); }catch(e){}
})();
