/* ════════ diseño nuevo · la base (oct 2026) ════════
   Maquetas y reglas en diseno/ui-peak/ (LEEME.md). Aquí solo la base común:
   · letras: Instrument Sans (500 normal, 600 para destacar) en el texto y
     Unbounded en títulos de pestaña, títulos de sección y números grandes
   · colores de Claro y Oscuro: crema y tinta más puros, un solo acento
   Los temas con color propio (Arena, Porcelana…, degradados) no se tocan. */
(function(){
  if(!document.querySelector('link[href*="family=Instrument+Sans"]')){
    var fi=document.createElement("link"); fi.rel="stylesheet";
    fi.href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap";
    document.head.appendChild(fi);
  }
  var P="html:not(.sage):not(.neo):not(.arena):not(.porcelana):not(.medianoche):not(.oro):not(.gr)", D=P+".dark";
  var st=document.createElement("style"); st.id="diseno-base-css"; st.textContent=[
/* letras */
':root{ --f-texto:"Instrument Sans",-apple-system,BlinkMacSystemFont,"SF Pro Text",Inter,Roboto,sans-serif; }',
'body{ font-weight:500; letter-spacing:-.005em; }',
'b, strong, .font-semibold, .font-bold{ font-weight:600; }',
'html #lienzo .view h2.display, html #lienzo #ch-title, html #lienzo #metas-mes .mm-mes, html #lienzo #hy-evo .he-t{',
'  font-family:var(--f-titulo) !important; font-weight:700 !important; letter-spacing:-.03em !important; }',
'html #lienzo .view h3, html .sheet-card h3{ font-family:var(--f-texto) !important; font-weight:600 !important; }',
/* colores */
P+'{ --bg:#F1ECE1; --tarjeta:#FBF8F1; --t1:#141414; --t2:rgba(20,20,20,.72); --t3:rgba(20,20,20,.6);',
'  --hairline:rgba(20,20,20,.12); --tarjeta-borde:rgba(20,20,20,.07); }',
D+'{ --bg:#0A0A0A; --tarjeta:#161513; --t1:#F3EEE3; --t2:rgba(243,238,227,.7); --t3:rgba(243,238,227,.52);',
'  --hairline:rgba(243,238,227,.12); --tarjeta-borde:rgba(243,238,227,.08); }',
P+' body{ background:var(--bg); }',
P+' .canvas-bg{ display:none; }'
  ].join("\n");
  document.head.appendChild(st);
})();
