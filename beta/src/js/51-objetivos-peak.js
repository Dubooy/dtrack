/* ════════════════════════════════════════════════════════════════
   OBJETIVOS CON AIRE PEAK. (oct 2026)
   1 «Los tres de hoy» como tres cumbres (el logo); se rellenan en verde
     al hacer cada reto y, con los tres, sale la bandera del ×1,5
   2 títulos con la letra del logo y su rayita debajo
   3 el reto de la semana como un sendero de puntos
   4 los objetivos del mes como tramos, con los días que quedan como altitud
   5 el selector Objetivos/Progreso más limpio (pastilla de tinta)
   6 tarjetas sin sombra, con un borde fino de tinta
   ════════════════════════════════════════════════════════════════ */
function opCumbres(){
  var lista=document.getElementById("today-challenges"); if(!lista) return;
  var t=curDay(), mc=todaysChallenges(t), md=chOf(t);
  var box=document.getElementById("op-cumbres");
  if(!mc.length){ if(box) box.remove(); return; }
  if(!box){ box=document.createElement("div"); box.id="op-cumbres"; lista.parentNode.insertBefore(box, lista); }
  var hechos=mc.filter(function(x){ return md.indexOf(x.id)>=0; }).length, tres=hechos>=mc.length;
  var picos=mc.slice(0, 3).map(function(x, i){
    var ok=md.indexOf(x.id)>=0;
    return '<span class="op-pico'+(ok ? ' ok' : '')+'" style="--i:'+i+'">'+
      '<svg viewBox="0 0 900 900" aria-hidden="true"><path d="'+PEAK_MK_D+'"/></svg>'+
      (tres && i===1 ? '<svg class="op-bandera" viewBox="0 0 12 14" aria-hidden="true"><path d="M2 1v13" stroke="currentColor" stroke-width="1.4" fill="none"/><path d="M2.6 1.4h8l-2 2.6 2 2.6h-8z" fill="currentColor"/></svg>' : '')+
    '</span>';
  }).join("");
  var txt=tres ? tr("Las tres cumbres: todo el XP de hoy ×1,5") : hechos+" "+tr("de")+" "+mc.length+" · "+tr("haz las tres y el XP de hoy va ×1,5");
  var html='<div class="op-picos">'+picos+'</div><p class="op-txt'+(tres ? ' ok' : '')+'">'+esc(txt)+'</p>';
  if(box.dataset.h!==html){ box.innerHTML=html; box.dataset.h=html; }
}

/* 4 · cada objetivo del mes, un tramo de sendero con su porcentaje */
function opTramos(){
  var box=document.getElementById("metas-mes"); if(!box) return;
  box.classList.add("op-mm");
  box.querySelectorAll(".mm-meta").forEach(function(f){
    var arco=f.querySelector(".mm-arco"), ok=f.classList.contains("ok"), p=ok ? 1 : 0;
    if(arco){ var C=parseFloat(arco.getAttribute("stroke-dasharray"))||1, off=parseFloat(arco.getAttribute("stroke-dashoffset"))||0; p=ok ? 1 : Math.max(0, Math.min(1, 1-off/C)); }
    var cu=f.querySelector(".mm-cuerpo"); if(!cu) return;
    var tr_=cu.querySelector(".op-tramo");
    if(!tr_){ tr_=document.createElement("div"); tr_.className="op-tramo"; tr_.innerHTML='<span class="op-tramo-v"><i></i></span><b class="num"></b>'; cu.appendChild(tr_); }
    tr_.querySelector("i").style.width=(p*100).toFixed(1)+"%";
    tr_.querySelector("b").textContent=Math.round(p*100)+"%";
  });
}

var _opPintaMetas=pintaMetas;
pintaMetas=function(){
  var r=_opPintaMetas.apply(this, arguments);
  try{ opCumbres(); opTramos(); }catch(e){ if(window.console) console.warn("objetivos", e); }
  return r;
};

(function(){ var st=document.createElement("style"); st.textContent=[
/* 6 · tarjetas: sin sombra, borde fino de tinta */
'#v-retos .glass{ box-shadow:none !important; }',
'#v-retos .glass:not(#rt-desc){ border:1px solid color-mix(in srgb, var(--t1) 14%, transparent) !important; }',
'#v-retos #card-nivel.pm-noche{ border:0 !important; }',
/* 2 · títulos con la letra del logo y la rayita */
'#v-retos h1.display, #ch-title, #v-retos h2.display, #metas-mes .mm-mes{ font-family:Unbounded, var(--font-display, system-ui), sans-serif !important; letter-spacing:-.02em; }',
'#ch-title, #metas-mes .mm-mes{ font-size:18px !important; font-weight:700 !important; }',
'#ch-title::after, #metas-mes .mm-mes::after, #reto-semana .rs-top .eyebrow::after{ content:""; display:block; width:26px; height:5px; margin-top:7px;',
'  background:repeating-linear-gradient(-55deg, var(--t1) 0 2px, transparent 2px 5px); opacity:.8; }',
'#reto-semana .rs-top .eyebrow{ font-family:Unbounded, system-ui, sans-serif; font-size:11px; letter-spacing:.06em; white-space:nowrap; }',
'#reto-semana .rs-xp{ white-space:nowrap; }',
/* la clase .mm del mapa de músculos (height:100%) estiraba esta tarjeta y aplastaba el reto de la semana */
'#metas-mes.mm{ height:auto !important; width:auto !important; }',
'#rt-obj > *{ flex-shrink:0; }',
/* 1 · las tres cumbres (sustituyen a la caja del ×1,5) */
'#today-challenges .bonus-x{ display:none !important; }',
'#op-cumbres{ display:flex; align-items:center; gap:14px; margin:-8px 0 16px; }',
'.op-picos{ display:flex; align-items:flex-end; gap:4px; }',
'.op-pico{ position:relative; display:block; width:30px; height:30px; transition:transform .4s var(--spring, cubic-bezier(.3,1.4,.5,1)); }',
'.op-pico:nth-child(2){ width:38px; height:38px; }',
'.op-pico > svg:first-child{ width:100%; height:100%; display:block; }',
'.op-pico path{ fill:var(--t1); opacity:.16; transition:fill .4s, opacity .4s; }',
'.op-pico.ok path{ fill:var(--good, #0E8A6E); opacity:1; }',
'.op-pico.ok{ animation:opSube .5s var(--spring, cubic-bezier(.3,1.4,.5,1)) both; animation-delay:calc(var(--i) * .06s); }',
'@keyframes opSube{ from{ transform:translateY(4px) scale(.9); } to{ transform:none; } }',
'.op-bandera{ position:absolute; left:50%; top:-15px; width:12px; height:14px; color:var(--good, #0E8A6E); }',
'.op-txt{ font-size:12.5px; color:var(--t3); margin:0; line-height:1.35; }',
'.op-txt.ok{ color:var(--good, #0E8A6E); font-weight:700; }',
/* 3 · el reto de la semana como sendero de puntos */
'#reto-semana .rs-segs{ display:flex !important; align-items:center; justify-content:space-between; gap:0 !important; position:relative; height:20px; margin:16px 2px 12px; background:none !important; }',
'#reto-semana .rs-segs::before{ content:""; position:absolute; left:8px; right:8px; top:50%; border-top:2px dashed color-mix(in srgb, var(--t1) 25%, transparent); }',
'#reto-semana .rs-segs i{ position:relative; flex:0 0 auto !important; width:16px !important; height:16px !important; border-radius:99px !important; background:var(--bg) !important; border:2px solid color-mix(in srgb, var(--t1) 35%, transparent); box-shadow:none !important; }',
'#reto-semana .rs-segs i.on{ background:var(--good, #0E8A6E) !important; border-color:var(--good, #0E8A6E); }',
'#reto-semana .rs-barra{ height:6px; background:repeating-linear-gradient(90deg, color-mix(in srgb, var(--t1) 22%, transparent) 0 6px, transparent 6px 11px) !important; border-radius:99px; }',
'#reto-semana .rs-barra i{ background:var(--good, #0E8A6E) !important; box-shadow:none !important; }',
'#reto-semana.rs-hecho{ background:var(--bg) !important; border-color:var(--good, #0E8A6E) !important; }',
/* 4 · objetivos del mes como mapa: días que quedan como altitud, metas como tramos */
'#metas-mes .mm-quedan b{ font-family:Unbounded, system-ui, sans-serif; font-size:30px; letter-spacing:-.03em; }',
'#metas-mes .mm-tiempo{ height:6px; background:repeating-linear-gradient(90deg, color-mix(in srgb, var(--t1) 22%, transparent) 0 6px, transparent 6px 11px) !important; }',
'#metas-mes .mm-tiempo i{ background:var(--t1) !important; }',
'#metas-mes.op-mm .mm-anillo{ position:absolute; opacity:0; pointer-events:none; }',
'#metas-mes.op-mm .mm-meta{ position:relative; }',
'.op-tramo{ display:flex; align-items:center; gap:10px; margin-top:7px; }',
'.op-tramo-v{ flex:1; height:6px; border-radius:99px; background:repeating-linear-gradient(90deg, color-mix(in srgb, var(--t1) 20%, transparent) 0 6px, transparent 6px 11px); overflow:hidden; }',
'.op-tramo-v i{ display:block; height:100%; border-radius:99px; background:var(--good, #0E8A6E); transition:width .7s cubic-bezier(.3,.9,.3,1); }',
'.op-tramo b{ font-family:Unbounded, system-ui, sans-serif; font-size:12px; min-width:3.2em; text-align:right; }',
/* 5 · el selector, con pastilla de tinta */
'.rt-tabs{ background:transparent !important; border:1px solid color-mix(in srgb, var(--t1) 14%, transparent); }',
'.rt-tabs button{ font-family:Unbounded, system-ui, sans-serif; font-size:12.5px !important; letter-spacing:.01em; }',
'.rt-tabs button.on{ color:var(--bg) !important; }',
'.rt-pill, html.dark .rt-pill{ background:var(--t1) !important; box-shadow:none !important; }',
'@media (prefers-reduced-motion:reduce){ .op-pico.ok{ animation:none; } }'
].join("\n"); document.head.appendChild(st); })();
