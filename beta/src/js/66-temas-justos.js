/* ════════ temas que quedan (17/10/2026) ════════
   Solo Claro, Oscuro, Sistema (el del dispositivo), Jardín, Cielo y los que se
   desbloquean por nivel. Fuera Clásico, Melocotón, Lavanda, Menta y los de degradado.
   Quien tuviera uno de esos pasa a Claro u Oscuro.
   Y ventanas que se distingan del fondo: Jardín y los temas de nivel no tenían
   --tarjeta (menús y tarjetas salían transparentes), y en oscuro la hoja era
   del mismo negro que lo de detrás. */
(function(){
  var quedan={ light:1, dark:1, system:1, sage:1, cielo:1 }, fuera=[];
  for(var i=TEMAS.length-1;i>=0;i--) if(!TEMAS[i].nv && !quedan[TEMAS[i].k]){ fuera.push(TEMAS[i].k); TEMAS.splice(i,1); }
  var cur=curTheme();
  if(fuera.indexOf(cur)>=0){
    var osc=document.documentElement.classList.contains("dark");
    var root=document.documentElement;
    fuera.concat(["gr"]).forEach(function(k){ root.classList.remove(k); });
    cur=osc?"dark":"light";
    try{ localStorage.setItem(TKEY,cur); }catch(e){}
    applyTheme(cur);
  }
})();
(function(){
  var C="html.sage, html.neo, html.arena, html.porcelana, html.cielo";
  var O="html.medianoche, html.oro, html.esmeralda, html.leyenda, html.aurora";
  var st=document.createElement("style"); st.id="temas-justos-css"; st.textContent=[
C.split(", ").map(function(x){ return x+":not(.dark)"; }).join(", ")+'{ --tarjeta:color-mix(in srgb, var(--bg) 35%, #fff); --tarjeta-borde:rgba(0,0,0,.08); }',
O.split(", ").map(function(x){ return x+".dark"; }).join(", ")+'{ --tarjeta:color-mix(in srgb, var(--bg) 88%, #fff); --tarjeta-borde:rgba(255,255,255,.1); }',
/* la hoja y los menús, siempre con su borde */
'html #sheet .sheet-card{ box-shadow:0 -10px 40px -16px rgba(0,0,0,.35), 0 0 0 1px var(--tarjeta-borde, var(--hairline)) !important; }',
'html.dark #sheet .sheet-card{ background:color-mix(in srgb, var(--bg) 94%, #fff) !important; box-shadow:0 -10px 40px -10px rgba(0,0,0,.9), 0 0 0 1px rgba(255,255,255,.12) !important; }',
'html .hn-caja, html #tema-pop{ box-shadow:0 18px 44px -16px rgba(0,0,0,.35), 0 0 0 1px var(--tarjeta-borde, var(--hairline)) !important; }',
'html.dark .hn-caja, html.dark #tema-pop{ box-shadow:0 18px 44px -12px rgba(0,0,0,.9), 0 0 0 1px rgba(255,255,255,.12) !important; }'
  ].join("\n"); document.head.appendChild(st);
})();
