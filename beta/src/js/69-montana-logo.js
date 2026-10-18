/* ════════ un solo dibujo: la montaña del logo (oct 2026) ════════
   La roca gris de General y la montaña de línea de las pantallas vacías pasan a ser
   la misma: la del logo, maciza en tinta (crema en oscuro), con la cara derecha a rayas
   y la bandera en la cima. La base no se corta: se funde con el fondo. */
function mlSvg(id, vb, monte, rayas, bandera, f){   /* f: [y donde empieza a fundirse, y del suelo, x del fundido izquierdo o 0] */
  return '<svg viewBox="'+vb+'" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">'+
    '<defs>'+
      '<pattern id="'+id+'-ry" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><rect width="2" height="6" style="fill:var(--bg)" opacity=".6"/></pattern>'+
      '<linearGradient id="'+id+'-v" gradientUnits="userSpaceOnUse" x1="0" y1="'+f[0]+'" x2="0" y2="'+f[1]+'"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>'+
      '<linearGradient id="'+id+'-h" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="'+(f[2]||1)+'" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="'+(f[2]?0:1)+'"/><stop offset="1" stop-color="#fff"/></linearGradient>'+
      '<mask id="'+id+'-mv" maskUnits="userSpaceOnUse"><rect x="-50" y="-50" width="400" height="400" fill="url(#'+id+'-v)"/></mask>'+
      '<mask id="'+id+'-mh" maskUnits="userSpaceOnUse"><rect x="-50" y="-50" width="400" height="400" fill="url(#'+id+'-h)"/></mask>'+
    '</defs>'+
    '<g mask="url(#'+id+'-mh)"><g mask="url(#'+id+'-mv)" style="fill:currentColor">'+
      '<path d="'+monte+'"/><path d="'+rayas+'" fill="url(#'+id+'-ry)"/>'+
    '</g><path d="'+bandera+'" style="fill:currentColor"/></g></svg>';
}
gnMontana=function(){
  return mlSvg("gn-ml", "0 0 240 230",
    "M0 230 L72 166 L94 178 L150 72 L176 100 L190 92 L240 146 L240 230Z",
    "M150 72 L176 100 L190 92 L240 146 L240 230 L168 230 Z",
    "M150 73 V54 L163 58.5 L150 63Z", [150, 228, 90]);
};
vcDibujo=function(){
  return '<span class="vc-svg">'+mlSvg("vc-ml", "0 -6 120 70",
    "M0 64 L34 32 L45 38 L74 6 L88 21 L96 16 L120 42 L120 64Z",
    "M74 6 L88 21 L96 16 L120 42 L120 64 L82 64 Z",
    "M74 7 V-4 L81 -1.5 L74 1Z", [34, 63, 0])+'</span>';
};
(function(){
  var st=document.createElement("style"); st.id="montana-logo-css"; st.textContent=[
    '.gn-monte{ color:var(--t1); }',
    'html.dark .gn-monte svg g{ opacity:1; }',
    'span.vc-svg{ display:block; width:132px; height:77px; }',
    'span.vc-svg svg{ display:block; width:100%; height:100%; overflow:visible; }'
  ].join("\n");
  document.head.appendChild(st);
})();
/* General ya se pintó antes de llegar esta pieza: se repinta con la montaña nueva */
try{ render(); }catch(e){}
