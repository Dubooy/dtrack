/* ════════ un color por sección y tarjetas destacadas en oscuro (18/10/2026) ════════
   Cada sección tiene su color, el mismo que sus anillos de General:
   Cuerpo salvia, Mente lavanda, Retos arena y Social verde azulado
   (--c-cuerpo, --c-mente, --c-retos, --c-social). Salud del día va con el de
   Cuerpo y «Siguiente reto» con el de Retos.
   La tarjeta destacada de cada pestaña (Parte del día, Entreno de hoy,
   Biblioteca) es de tinta; en oscuro ya no se invierte a crema: pasa a gris. */
(function(){
  var st=document.createElement("style"); st.id="colores-seccion";
  st.textContent=[
':root{ --c-cuerpo:var(--gn-salvia); --c-mente:var(--gn-lavanda); --c-retos:var(--gn-arena); --c-social:var(--gn-verde); --tarjeta-dest-oscuro:#242220; }',
/* Salud del día: agua, sueño y pantalla con el color de Cuerpo */
':root, html.dark{ --sf-agua:var(--c-cuerpo); --sf-sueno:var(--c-cuerpo); --sf-pantalla:var(--c-cuerpo); }',
/* Siguiente reto: el color de Retos */
':root{ --gn-reto:var(--gn-arena-2); --gn-reto-ic:#E3D0AE; }',
'html.dark{ --gn-reto:#262119; --gn-reto-ic:var(--gn-arena-2); }',
'.gn-rst{ color:var(--c-retos) !important; }',
/* tarjetas destacadas en oscuro: gris, no crema */
'html.dark .hn-card.neg, html.dark .cn-entreno, html.dark .tq-bib-g{ background:var(--tarjeta-dest-oscuro) !important; color:#F3EEE3 !important; box-shadow:inset 0 0 0 1px rgba(255,255,255,.07) !important; }',
'html.dark :is(.hn-card.neg, .cn-entreno, .tq-bib-g) :not(svg, svg *){ color:#F3EEE3 !important; -webkit-text-fill-color:currentColor; }',
'html.dark .hn-card.neg small, html.dark .cn-entreno :is(small, .cn-eti), html.dark .tq-bib-g small{ color:rgba(243,238,227,.62) !important; }',
'html.dark .cn-entreno button{ border-color:rgba(255,255,255,.14) !important; }',
'html.dark .cn-entreno .cn-c{ stroke:var(--tarjeta-dest-oscuro) !important; }'
  ].join("\n"); document.head.appendChild(st);
})();
