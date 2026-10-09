/* ════════ pulido de UI: una sola letra, cabecera que se encoge, pestañas con memoria ════════
   1 letras: Unbounded (la del logo) solo en el título de cada pestaña y en los números grandes;
     la del iPhone (SF) en todo lo demás (--f-texto; Inter si no hay SF)
   2 cabecera: el título grande se encoge y se apaga al bajar, y arriba queda el nombre pequeño
     sobre un degradado del color del fondo (negro en oscuro, crema en claro), sin línea
   3 cada pestaña recuerda dónde te quedaste (tocar la que ya está abierta sube arriba)
   4 tarjetas que entran con un fundido al bajar, botones que se hunden al tocarlos,
     números que suben al entrar en la pestaña y hojas que se cierran arrastrando hacia abajo */
(function(){
  var st=document.createElement("style"); st.id="ui-pulido-css"; st.textContent=[
':root{ --f-texto:-apple-system,BlinkMacSystemFont,"SF Pro Text","SF Pro Display","Segoe UI",Inter,Roboto,sans-serif;',
'  --f-titulo:Unbounded,var(--f-texto); }',
'body{ font-family:var(--f-texto); letter-spacing:-.01em; }',

/* 1 · letras */
'.view h1.display{ font-family:var(--f-titulo) !important; font-weight:700 !important; font-size:30px !important;',
'  letter-spacing:-.035em !important; line-height:1.06 !important; }',
'@media (min-width:640px){ .view h1.display{ font-size:40px !important; } }',
/* los títulos de sección (Tu semana, Salud del día…) y lo pequeño, en SF, no en Unbounded */
'#lienzo .view h2.display, #lienzo #ch-title, #lienzo #metas-mes .mm-mes, #lienzo #hy-evo .he-t,',
'#lienzo #reto-semana .rs-top .eyebrow, #lienzo .rt-tabs button{ font-family:var(--f-texto) !important; letter-spacing:-.025em !important; }',
'#lienzo .view h2.display, #lienzo #ch-title, #lienzo #hy-evo .he-t{ font-weight:700 !important; }',
'#lienzo #reto-semana .rs-top .eyebrow{ letter-spacing:.12em !important; }',
'.view h3, .view h3.display, .sheet-card h3{ font-family:var(--f-texto) !important; font-weight:700; letter-spacing:-.02em; }',
'.btn, button, input, textarea, select{ font-family:var(--f-texto); }',

/* las cabeceras de pestaña, todas con la misma separación */
'#v-retos > div:first-child, #v-vital > div:first-child, #v-social > div:first-child, #v-academico > div:first-child{ margin-bottom:22px !important; }',
'.view > div:first-child .eyebrow{ margin-bottom:8px !important; }',
'.view h1.display{ transform-origin:left bottom; will-change:transform,opacity; }',

/* 2 · el nombre pequeño de arriba, sobre un degradado en vez de una línea */
'#soc-mini{ isolation:isolate; background:none !important; box-shadow:none !important;',
'  backdrop-filter:none !important; -webkit-backdrop-filter:none !important;',
'  padding:calc(env(safe-area-inset-top) + 12px) 16px 40px !important; }',
'#soc-mini::before{ content:""; position:absolute; inset:0; z-index:-1;',
'  background:linear-gradient(to bottom, var(--bg) 0%, var(--bg) 38%, color-mix(in srgb,var(--bg) 70%,transparent) 66%, transparent 100%);',
'  backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px);',
'  -webkit-mask-image:linear-gradient(to bottom,#000 50%,transparent); mask-image:linear-gradient(to bottom,#000 50%,transparent); }',
'#soc-mini b{ font-family:var(--f-texto) !important; font-size:17px !important; font-weight:650 !important; letter-spacing:-.02em !important; }',

/* 4 · tarjetas que entran al bajar */
'.ui-entra{ opacity:0; translate:0 18px; transition:opacity .5s var(--ease), translate .6s cubic-bezier(.2,.8,.2,1); }',
'.ui-entra.ui-visto{ opacity:1; translate:0 0; }',
'@media (prefers-reduced-motion:reduce){ .ui-entra{ opacity:1; translate:none; transition:none; } }',

/* 4 · botones que se hunden */
':where(.btn, .chip, .soft, .icon-btn, .seg button, .pu-boton, .view .glass[data-act], .view [data-act].glass, .view button.glass){',
'  transition:scale .18s cubic-bezier(.2,.8,.2,1); }',
':where(.btn, .chip, .soft, .icon-btn, .seg button, .pu-boton, .view .glass[data-act], .view [data-act].glass, .view button.glass):active{ scale:.965; }',

/* 4 · hoja con asa para arrastrar */
'.ui-asa{ display:none; }',
'@media (max-width:639px){ .ui-asa{ display:block; position:sticky; top:-16px; z-index:9; width:38px; height:5px;',
'  margin:-14px auto 12px; border-radius:99px; background:color-mix(in srgb,var(--t1) 22%,transparent); } }',
'#sheet .sheet-card.ui-tira{ transition:none !important; }',
'#sheet .sheet-card.ui-suelta{ transition:translate .32s cubic-bezier(.2,.8,.2,1) !important; }'
  ].join("\n");
  document.head.appendChild(st);

  /* Unbounded para toda la app (antes solo se cargaba al abrir Estirar) */
  if(!document.querySelector('link[href*="family=Unbounded"]')){
    var fu=document.createElement("link"); fu.rel="stylesheet";
    fu.href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;700;800&display=swap";
    document.head.appendChild(fu);
  }
})();

/* ── 2 · el título grande se encoge al bajar ── */
var uiTick=false;
function uiCabecera(){
  uiTick=false;
  var h=document.querySelector("#v-"+view+" h1.display"); if(!h) return;
  var y=Math.max(0, window.scrollY), k=Math.min(1, y/90);
  h.style.transform=k ? "scale("+(1-k*.14).toFixed(3)+")" : "";
  h.style.opacity=k ? (1-k*.9).toFixed(3) : "";
}
window.addEventListener("scroll", function(){
  if(!uiTick){ uiTick=true; requestAnimationFrame(function(){ uiCabecera(); uiEntradas(); }); }
}, {passive:true});

/* ── 3 · cada pestaña recuerda dónde te quedaste ── */
var uiScroll={};
var _goUi=go;
go=function(v){
  var antes=view;
  if(v===antes) return _goUi.apply(this, arguments);   /* la misma pestaña: arriba, como siempre */
  uiScroll[antes]=window.scrollY;
  var r=_goUi.apply(this, arguments);
  var y=uiScroll[view]||0;
  requestAnimationFrame(function(){ requestAnimationFrame(function(){
    window.scrollTo({top:y, behavior:"auto"}); uiCabecera(); uiEntradas(); uiCuenta();
  }); });
  return r;
};

/* ── 4 · tarjetas que entran con un fundido al bajar ── */
var uiObs = ("IntersectionObserver" in window) ? new IntersectionObserver(function(es){
  es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("ui-visto"); uiObs.unobserve(e.target); } });
}, {rootMargin:"0px 0px -6% 0px"}) : null;
function uiEntradas(){
  if(!uiObs || (window.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches)) return;
  var vista=document.getElementById("v-"+view); if(!vista) return;
  var alto=window.innerHeight;
  vista.querySelectorAll(".glass:not(.hero):not([data-ui])").forEach(function(c){
    c.setAttribute("data-ui","1");
    if(c.getBoundingClientRect().top > alto){ c.classList.add("ui-entra"); uiObs.observe(c); }
  });
}

/* ── 4 · números grandes que suben al entrar en la pestaña ── */
function uiCuenta(){
  var vista=document.getElementById("v-"+view); if(!vista) return;
  vista.querySelectorAll(".hs-num").forEach(function(n){
    var t=n.firstChild; if(!t || t.nodeType!==3) return;
    var fin=parseInt(t.nodeValue, 10); if(!(fin>0) || String(fin)!==t.nodeValue.trim()) return;
    var t0=performance.now(), dura=Math.min(700, 300+fin*20);
    (function paso(ahora){
      if(n.firstChild!==t) return;   /* se volvió a pintar: ya tiene el número bueno */
      var k=Math.min(1, (ahora-t0)/dura); k=1-Math.pow(1-k, 3);
      t.nodeValue=String(Math.round(fin*k));
      if(k<1) requestAnimationFrame(paso);
    })(t0);
  });
}

/* ── 4 · las hojas se cierran arrastrando hacia abajo ── */
(function(){
  var card=document.querySelector("#sheet .sheet-card"); if(!card) return;
  var asa=document.createElement("span"); asa.className="ui-asa"; card.insertBefore(asa, card.firstChild);
  var y0=null, dy=0;
  card.addEventListener("touchstart", function(e){
    y0 = (card.scrollTop<=0 && e.touches.length===1) ? e.touches[0].clientY : null; dy=0;
  }, {passive:true});
  card.addEventListener("touchmove", function(e){
    if(y0===null) return;
    dy=e.touches[0].clientY-y0;
    if(dy<=0){ card.style.translate=""; return; }
    if(e.cancelable) e.preventDefault();
    card.classList.add("ui-tira"); card.classList.remove("ui-suelta");
    card.style.translate="0 "+(dy*.85).toFixed(1)+"px";
  }, {passive:false});
  card.addEventListener("touchend", function(){
    if(y0===null) return; y0=null;
    card.classList.remove("ui-tira"); card.classList.add("ui-suelta");
    if(dy>110){
      card.style.translate="0 100%";
      setTimeout(function(){
        var bg=document.querySelector("#sheet .sheet-bg"); if(bg) bg.click(); else closeSheet();
        card.classList.remove("ui-suelta"); card.style.translate="";
      }, 260);
    } else card.style.translate="";
  });
})();
