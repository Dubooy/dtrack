/* ════════════════════════════════════════════════════
   ESTILO ORDENADO (oct 2026)
   Paso 1 del estilo de Peak.: antes de añadir detalles de marca, la app
   se lee como una sola cosa. Solo en los temas Claro y Oscuro (los demás
   temas tienen su propia paleta):
   · crema, tinta y un solo acento, el verde del logo (fuera el lila, el
     cian, el oro y el naranja de los bloques);
   · una sola tarjeta (hoja crema con borde fino) para todo lo que ya era
     tarjeta;
   · sin degradados de color: la barra de hábitos brilla en grises y el
     halo de la luna de Parte del día es tinta (en oscuro, morado).
   ════════════════════════════════════════════════════ */
(function(){
  var P="html:not(.sage):not(.neo):not(.arena):not(.porcelana):not(.medianoche):not(.oro)", D=P+".dark";
  var TARJETAS=[".view .glass.importante",".hy-tarjeta",".hy-estudio",".hy-parte",".hy-xp",".tq-est",".ev-tarjeta","#hy-evo"];
  var st=document.createElement("style"); st.id="orden-css"; st.textContent=[
P+'{ --good:#0E8A6E; --violet:#0E8A6E; --cyan:#0E8A6E; --gold:#0E8A6E; --warn:#0E8A6E;',
'  --tarjeta:#fffcf6; --tarjeta-borde:rgba(28,27,25,.08); --halo:rgba(28,27,25,.55); }',
D+'{ --good:#3fbf98; --violet:#3fbf98; --cyan:#3fbf98; --gold:#3fbf98; --warn:#3fbf98;',
'  --tarjeta:#1d1b18; --tarjeta-borde:rgba(241,235,223,.08); --halo:rgba(185,160,255,.6); }',
/* una sola tarjeta */
TARJETAS.map(function(s){ return P+' '+s; }).join(",")+'{',
'  background:var(--tarjeta) !important; background-image:none !important; border:0 !important; border-radius:24px !important;',
'  box-shadow:0 0 0 1px var(--tarjeta-borde) !important; backdrop-filter:none !important; -webkit-backdrop-filter:none !important; }',
P+' .tq-est-f{ background:none !important; }',
/* barra de hábitos: el brillo de antes, en grises */
P+' #ideal-bar{ background:linear-gradient(90deg,var(--t1),color-mix(in srgb,var(--t1) 45%,var(--bg))) !important;',
'  box-shadow:0 0 12px -2px color-mix(in srgb,var(--t1) 35%,transparent); }',
/* puntos de los hábitos: tinta suave */
P+' #ideal-list .rounded-full[style*="background"]{ background:var(--t3) !important; }',
/* anillos de Hoy y de nivel: mismo fondo y el acento */
P+' .hy-anillo circle:first-of-type{ stroke:var(--fill-hi) !important; }',
P+' .hy-xp-an circle:first-of-type{ stroke:var(--fill-hi) !important; stroke-opacity:1 !important; }',
P+' .hy-xp-an .an-arco{ stroke:var(--good) !important; }',
/* Parte del día: luna en tinta con su halo */
P+' .hy-parte .hy-semana i{ background:var(--fill-hi) !important; }',
P+' .hy-parte .hy-semana i.on{ background:var(--good) !important; }',
P+' .hy-luna{ color:var(--t1) !important; box-shadow:0 6px 18px -6px var(--halo) !important; }',
P+' .hy-parte.toca .hy-luna{ animation:ordenHalo 2.4s ease-out infinite; }',
P+' .hy-parte.hecho .hy-luna{ background:var(--t1) !important; color:var(--bg) !important; }',
'@keyframes ordenHalo{ 0%{ box-shadow:0 6px 18px -6px var(--halo), 0 0 0 0 var(--halo); } 100%{ box-shadow:0 6px 18px -6px var(--halo), 0 0 0 16px transparent; } }'
  ].join("\n");
  document.head.appendChild(st);
})();
