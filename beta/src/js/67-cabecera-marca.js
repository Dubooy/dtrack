/* ════════ cabecera de marca (17/10/2026) ════════
   Cuerpo, Mente, Retos y Social ya no dicen dónde estás: sin antetítulo ni
   título grande, solo «PEAK.» pequeño a la izquierda y tu foto a la derecha.
   Al bajar sigue saliendo el nombre de la pestaña con el difuminado (#soc-mini).
   General se queda con su saludo. */
(function(){
  var st=document.createElement("style"); st.id="cabecera-marca";
  st.textContent=[
'.view:not(#v-resumen) p.eyebrow:has(+ h1.display){ font-size:0 !important; letter-spacing:0 !important; margin-bottom:0 !important; }',
'.view:not(#v-resumen) p.eyebrow:has(+ h1.display)::before{ font-size:17px !important; letter-spacing:-.03em !important; line-height:40px; margin:0 !important; }',
'.view:not(#v-resumen) p.eyebrow + h1.display{ display:none !important; }',
'.view:not(#v-resumen) > div:first-child:has(> p.eyebrow + h1.display), .view:not(#v-resumen) > div:first-child:has(> div > p.eyebrow + h1.display){ margin-bottom:18px !important; }'
  ].join("\n"); document.head.appendChild(st);
})();
