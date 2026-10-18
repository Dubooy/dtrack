/* ════════ Retos en una sola página (18/10/2026) ════════
   Sin el selector Objetivos / Progreso: de arriba abajo, tu rango, los retos
   de hoy en una tarjeta arena (con «1/3» y su anillo), el reto de la semana,
   las metas del mes, tu montaña, tu grupo, el camino de rangos y «Más»
   (Días de descanso plegado, Experimentos, Mis retos) con el diario al final.
   Maquetas: /mnt/project-files/capturas/retos-nuevo/ (la 1 con la tarjeta de la 2).
   Los paneles #rt-obj, #rt-prog y #pn pasan a display:contents y se ordenan con order. */

var RP_IC={
  movil:'<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M4 4l16 16"/>',
  pasos:'<path d="M4 20h4v-4h4v-4h4V8h4"/>',
  pluma:'<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>',
  agua:'<path d="M12 3c3.5 4.4 6 7.6 6 10.6A6 6 0 0 1 6 13.6C6 10.6 8.5 7.4 12 3z"/>',
  libro:'<path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5V19c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5z"/><path d="M12 6v13.5"/>',
  gente:'<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><path d="M16 5.2a3 3 0 0 1 0 5.6M17.5 14.3c1.7.6 2.8 2.2 3 4.7"/>',
  luna:'<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/>',
  estrella:'<path d="M12 3l2.6 5.6 6 .6-4.5 4 1.3 6L12 16.2 6.6 19.2l1.3-6-4.5-4 6-.6z"/>'
};
function rpIcono(t){
  t=String(t||"").toLowerCase();
  var k = /móvil|movil|pantalla|redes|notific/.test(t) ? "movil"
    : /escaler|camina|pasos|corre|flexi|sentadilla|estira|deporte|gym|entren/.test(t) ? "pasos"
    : /escrib|apunta|diario|nota|lista/.test(t) ? "pluma"
    : /agua|vaso|bebe|fruta|verdura|come|desayun/.test(t) ? "agua"
    : /lee|libro|página|pagina|estudi|aprend/.test(t) ? "libro"
    : /amig|llama|mensaje|familia|gracias|habla/.test(t) ? "gente"
    : /duerm|sueño|cama|acuést|acuest|medit|respira/.test(t) ? "luna" : "estrella";
  return '<svg viewBox="0 0 24 24" aria-hidden="true">'+RP_IC[k]+'</svg>';
}

function rpHoy(izq){
  var box=document.getElementById("rp-hoy");
  if(!box){ box=document.createElement("div"); box.id="rp-hoy"; }
  if(box.parentNode!==izq) izq.appendChild(box);
  var d=curDay(), es=d===today(), mc=todaysChallenges(d), md=chOf(d);
  var hechos=mc.filter(function(x){ return md.indexOf(x.id)>=0; }).length, n=mc.length;
  var filas = n ? mc.map(function(x){
      var ok=md.indexOf(x.id)>=0;
      return '<button class="rp-fila'+(ok?" hecho":"")+'" data-act="ch" data-id="'+x.id+'" data-day="'+d+'">'+
        '<span class="rp-ic">'+rpIcono(x.text)+'</span>'+
        '<span class="rp-tx"><b>'+esc(x.text)+'</b><small>+15 XP</small></span>'+
        '<span class="rp-chk'+(ok?" on":"")+'" aria-label="'+(ok?"Hecho":"Por hacer")+'"></span></button>';
    }).join("")
    : '<button class="rp-fila rp-vacio" data-act="edit-challenges"><span class="rp-tx"><b>Tu lista de retos está vacía</b><small>Pulsa aquí para elegir tus retos</small></span></button>';
  var pie = !n ? "" : hechos>=n ? "Los tres hechos: hoy todo suma ×1,5" : "×1,5 a todo el XP del día si cierras los tres";
  var pct = n ? Math.round(hechos/n*100) : 0;
  var html='<div class="rp-top"><div><small>'+(es?"RETOS DE HOY":"RETOS DE ESE DÍA")+'</small>'+
      '<div class="rp-big num">'+hechos+'<span>/'+n+'</span></div><p>'+pie+'</p></div>'+
      '<span class="rp-anillo" style="--p:'+pct+'%"></span></div>'+
    '<div class="rp-lista">'+filas+'</div>';
  if(box.dataset.h!==html){ box.innerHTML=html; box.dataset.h=html; }
}

/* «Días de descanso» se pliega en una fila de «Más» */
var rpDescAbierto=false;
function rpMas(){
  var mas=document.getElementById("on-mas"), desc=document.getElementById("rt-desc");
  if(!mas || !desc) return;
  var usados=typeof descansosDelMes==="function" ? descansosDelMes(today()) : 0;
  var fila=document.getElementById("rp-desc-fila");
  if(!fila){ fila=document.createElement("button"); fila.id="rp-desc-fila"; fila.className="on-fila"; fila.setAttribute("data-act","x-rp-desc"); }
  var h='<span><b>Días de descanso</b><small>'+usados+' de '+DESCANSOS_MES+' este mes · no rompen la racha</small></span><i>'+(rpDescAbierto?"⌃":"›")+'</i>';
  if(fila.dataset.h!==h){ fila.innerHTML=h; fila.dataset.h=h; }
  var cab=mas.querySelector(".hn-sec");
  if(cab && fila.previousElementSibling!==cab) cab.after(fila);
  if(desc.previousElementSibling!==fila) fila.after(desc);
  desc.classList.toggle("rp-abierto", rpDescAbierto);
}

function rpPinta(){
  var v=document.getElementById("v-retos"), izq=document.getElementById("retos-left"); if(!v || !izq) return;
  document.documentElement.classList.add("rp-una");
  rpHoy(izq);
  var obj=document.getElementById("rt-obj"), mas=document.getElementById("on-mas");
  if(obj && mas && mas.parentNode!==obj) obj.appendChild(mas);
  rpMas();
  /* «Tu cima» encima de la montaña */
  var pn=document.getElementById("pn"), mont=pn && pn.querySelector(".pn-mont");
  if(mont && !(mont.previousElementSibling && mont.previousElementSibling.id==="rp-cima")){
    var c=document.getElementById("rp-cima") || document.createElement("div");
    c.id="rp-cima"; c.className="hn-sec"; c.innerHTML="<h2>Tu cima</h2>";
    mont.parentNode.insertBefore(c, mont);
  }
}

var _rpOrganiza=retosOrganiza;
retosOrganiza=function(){
  var r=_rpOrganiza.apply(this, arguments);
  try{ rpPinta(); }catch(e){ if(window.console) console.warn("retos", e); }
  return r;
};
var _rpAccion=rumboAccion;
rumboAccion=function(a, el){
  if(a==="x-rp-desc"){ rpDescAbierto=!rpDescAbierto; sonido("tick"); rpMas(); return true; }
  return _rpAccion.apply(this, arguments);
};

(function(){
  var st=document.createElement("style"); st.id="retos-una-pagina";
  st.textContent=[
/* fuera el selector; los paneles se abren y todo se ordena en una columna */
'html.rp-una #rt-tabs, html.rp-una #v-retos .glass:has(#ch-title){ display:none !important; }',
'html.rp-una #retos-left{ display:flex !important; flex-direction:column; gap:0 !important; }',
'html.rp-una #rt-obj, html.rp-una #rt-prog, html.rp-una #pn{ display:contents !important; }',
'html.rp-una #pn .pn-rango{ order:1; } html.rp-una #rp-hoy{ order:2; }',
'html.rp-una #reto-semana{ order:3; } html.rp-una #metas-mes{ order:4; }',
'html.rp-una #rp-cima, html.rp-una #pn .pn-mont, html.rp-una #pn .pn-f3{ order:5; }',
'html.rp-una #pn > .hn-sec:not(#rp-cima), html.rp-una #pn > .pn-am, html.rp-una #pn > .on-fila{ order:6; }',
'html.rp-una #camino{ order:7; } html.rp-una #on-mas{ order:8; } html.rp-una #rt-diario{ order:9; margin-top:14px; }',
'html.rp-una #hist-boton, html.rp-una #card-nivel, html.rp-una #pm-extra{ order:10; }',
'html.rp-una #rt-obj > #rt-desc{ order:8; }',
/* rango, más pequeño y en arena */
'html.rp-una #pn .pn-rango{ margin-top:6px; }',
'html.rp-una .pn-eti{ display:none; }',
'html.rp-una .pn-big{ font-size:32px; text-transform:none; margin-top:0; }',
'html.rp-una .pn-xp{ margin-top:12px; } html.rp-una .pn-xp u{ height:6px; }',
'html.rp-una .pn-xp u.on{ background:var(--c-retos) !important; } html.rp-una .pn-xp u.ac{ background:color-mix(in srgb, var(--c-retos) 45%, transparent) !important; box-shadow:none !important; }',
/* la tarjeta de los retos de hoy */
'#rp-hoy{ margin-top:26px; background:var(--gn-arena-2); border-radius:26px; padding:20px 20px 8px; color:var(--t1); }',
'html.dark #rp-hoy{ background:#2a2218; }',
'.rp-top{ display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }',
'.rp-top small{ font-size:12px; font-weight:600; letter-spacing:.14em; color:var(--c-retos); }',
'.rp-big{ font-family:var(--f-titulo); font-weight:800; font-size:46px; letter-spacing:-.05em; line-height:1; margin-top:6px; }',
'.rp-big span{ font-size:22px; color:var(--t3); }',
'.rp-top p{ font-size:13.5px; color:var(--t2); margin-top:6px; }',
'.rp-anillo{ width:76px; height:76px; flex:none; border-radius:50%; display:grid; place-items:center;',
'  background:conic-gradient(var(--c-retos) 0 var(--p), color-mix(in srgb, var(--c-retos) 20%, transparent) 0); transition:background .5s; }',
'.rp-anillo::after{ content:""; width:58px; height:58px; border-radius:50%; background:var(--gn-arena-2); }',
'html.dark .rp-anillo::after{ background:#2a2218; }',
'.rp-lista{ margin-top:14px; }',
'.rp-fila{ width:100%; display:flex; align-items:center; gap:13px; padding:14px 0; text-align:left; color:var(--t1);',
'  border-top:1px solid color-mix(in srgb, var(--c-retos) 22%, transparent); }',
'.rp-ic{ width:40px; height:40px; flex:none; border-radius:50%; background:var(--bg); color:var(--c-retos); display:grid; place-items:center; }',
'.rp-ic svg{ width:20px; height:20px; fill:none; stroke:currentColor; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }',
'.rp-tx{ flex:1; min-width:0; } .rp-tx b{ display:block; font-weight:600; font-size:15.5px; line-height:1.25; }',
'.rp-tx small{ display:block; font-size:13px; color:var(--c-retos); font-weight:600; margin-top:2px; }',
'.rp-fila.hecho .rp-tx b{ text-decoration:line-through; color:var(--t3); }',
'.rp-chk{ width:30px; height:30px; flex:none; border-radius:50%; border:2px solid color-mix(in srgb, var(--c-retos) 35%, transparent); position:relative; transition:background .25s, border-color .25s; }',
'.rp-chk.on{ background:var(--c-retos); border-color:var(--c-retos); }',
'.rp-chk.on::after{ content:""; position:absolute; left:9px; top:5px; width:7px; height:12px; border:solid var(--gn-arena-2); border-width:0 2.5px 2.5px 0; transform:rotate(45deg); }',
'html.dark .rp-chk.on::after{ border-color:#2a2218; }',
'.rp-fila:active{ opacity:.7; }',
/* reto de la semana en tarjeta, con el color de Retos */
'html.rp-una #v-retos #reto-semana{ margin-top:30px !important; background:var(--tarjeta) !important; border-radius:22px !important; padding:18px !important; }',
'html.rp-una #reto-semana .rs-segs i.on{ background:var(--c-retos) !important; border-color:var(--c-retos) !important; }',
'html.rp-una #reto-semana .rs-xp{ color:var(--c-retos); background:color-mix(in srgb, var(--c-retos) 14%, transparent); }',
'html.rp-una #reto-semana .rs-t{ font-size:22px !important; margin-top:10px !important; }',
'html.rp-una.obj-n #v-retos #reto-semana .rs-top .eyebrow{ font-family:var(--f-texto) !important; font-size:12px !important; font-weight:600; letter-spacing:.12em !important; text-transform:uppercase; color:var(--t2); }',
'html.rp-una #reto-semana .rs-top{ align-items:center !important; }',
'html.rp-una #camino{ margin-top:30px !important; }',
'html.rp-una .op-tramo-v i{ background:var(--c-retos) !important; }',
/* montaña y grupo */
'html.rp-una #rp-cima{ margin-top:36px; } html.rp-una .pn-mont{ margin-top:0; }',
'html.rp-una #pn > .hn-sec:not(#rp-cima){ margin-top:30px; }',
/* Más: descanso plegado */
'html.rp-una #on-mas{ margin-top:22px; }',
'html.rp-una #rt-desc{ display:none !important; margin-top:12px !important; }',
'html.rp-una #rt-desc.rp-abierto{ display:block !important; }',
'html.rp-una #rt-desc .mt-cab{ display:none; }',
'html.rp-una #rp-desc-fila i{ font-size:18px; }'
  ].join("\n");
  document.head.appendChild(st);
})();
