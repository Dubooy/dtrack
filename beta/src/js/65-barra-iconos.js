/* ════════ barra de abajo e iconos (17/10/2026) ════════
   Cada icono tiene dos dibujos: de contorno (.o) y macizo (.s) para la pestaña abierta,
   con los detalles calados (máscara), como en iPhone. La pestaña abierta lleva una
   pastilla suave detrás del icono que salta de una a otra (#mind). */
var BI={
  resumen:'<g class="o"><rect x="3.8" y="3.8" width="6.9" height="6.9" rx="2.2"/><rect x="13.3" y="3.8" width="6.9" height="6.9" rx="2.2"/><rect x="3.8" y="13.3" width="6.9" height="6.9" rx="2.2"/><rect x="13.3" y="13.3" width="6.9" height="6.9" rx="2.2"/></g>'+
    '<g class="s" fill="currentColor" stroke="none"><rect x="3.3" y="3.3" width="7.6" height="7.6" rx="2.4"/><rect x="13.1" y="3.3" width="7.6" height="7.6" rx="3.8"/><rect x="3.3" y="13.1" width="7.6" height="7.6" rx="2.4"/><rect x="13.1" y="13.1" width="7.6" height="7.6" rx="2.4"/></g>',
  vital:'<g class="o"><circle cx="15.3" cy="4.4" r="1.9"/><path d="M13.7 7.7l-2 5.3M13.7 7.7l-4 1-2 2.6M13.7 7.7l2.2 3 3.1.6M11.7 13l3.7 2-1 4.8M11.7 13l-1.9 3.6-4.2 1"/></g>'+
    '<g class="s"><circle cx="15.3" cy="4.4" r="2.25" fill="currentColor" stroke="none"/><path stroke-width="2.4" d="M13.7 7.7l-2 5.3M13.7 7.7l-4 1-2 2.6M13.7 7.7l2.2 3 3.1.6M11.7 13l3.7 2-1 4.8M11.7 13l-1.9 3.6-4.2 1"/></g>',
  academico:'<g class="o"><path d="M12 5.4c-.7-.8-1.6-1.2-2.6-1.2A2.6 2.6 0 0 0 6.8 6.6 2.9 2.9 0 0 0 4.8 9.4c0 .6.2 1.2.5 1.7a3.1 3.1 0 0 0 .9 4.9 2.8 2.8 0 0 0 3 3c1 0 1.9-.4 2.8-1.1zM12 5.4c.7-.8 1.6-1.2 2.6-1.2a2.6 2.6 0 0 1 2.6 2.4 2.9 2.9 0 0 1 2 2.8c0 .6-.2 1.2-.5 1.7a3.1 3.1 0 0 1-.9 4.9 2.8 2.8 0 0 1-3 3c-1 0-1.9-.4-2.8-1.1zM12 5.4v12.5M8.6 9.2c.9 0 1.7.6 2 1.4M15.4 9.2c-.9 0-1.7.6-2 1.4M8.2 13.6c1 .2 1.8.9 2 1.8M15.8 13.6c-1 .2-1.8.9-2 1.8"/></g>'+
    '<g class="s"><mask id="bi-m-mente"><path fill="#fff" stroke="#fff" stroke-width="1.4" d="M12 5.4c-.7-.8-1.6-1.2-2.6-1.2A2.6 2.6 0 0 0 6.8 6.6 2.9 2.9 0 0 0 4.8 9.4c0 .6.2 1.2.5 1.7a3.1 3.1 0 0 0 .9 4.9 2.8 2.8 0 0 0 3 3c1 0 1.9-.4 2.8-1.1zM12 5.4c.7-.8 1.6-1.2 2.6-1.2a2.6 2.6 0 0 1 2.6 2.4 2.9 2.9 0 0 1 2 2.8c0 .6-.2 1.2-.5 1.7a3.1 3.1 0 0 1-.9 4.9 2.8 2.8 0 0 1-3 3c-1 0-1.9-.4-2.8-1.1z"/>'+
      '<path stroke="#000" stroke-width="1.5" d="M12 6.2v12M8.6 9.2c.9 0 1.7.6 2 1.4M15.4 9.2c-.9 0-1.7.6-2 1.4M8.2 13.6c1 .2 1.8.9 2 1.8M15.8 13.6c-1 .2-1.8.9-2 1.8"/></mask>'+
      '<rect x="0" y="0" width="24" height="24" fill="currentColor" stroke="none" mask="url(#bi-m-mente)"/></g>',
  retos:'<g class="o"><circle cx="11" cy="13" r="7.5"/><circle cx="11" cy="13" r="4"/><circle cx="11" cy="13" r=".6" fill="currentColor"/><path d="M11 13l8-8M15.6 5.2v3.2h3.2M19 5l1.5-1.5"/></g>'+
    '<g class="s"><mask id="bi-m-retos"><circle cx="11" cy="13" r="8.3" fill="#fff"/><circle cx="11" cy="13" r="4.1" fill="none" stroke="#000" stroke-width="1.6"/><circle cx="11" cy="13" r="1.2" fill="#000"/><path stroke="#000" stroke-width="2.6" d="M11 13l8-8"/></mask>'+
      '<rect x="0" y="0" width="24" height="24" fill="currentColor" stroke="none" mask="url(#bi-m-retos)"/><path stroke-width="1.8" d="M17.4 6.6 19.6 4.4M15.6 5.2v3.2h3.2M19.6 4.4l1.2-1.2"/></g>',
  social:'<g class="o"><circle cx="9" cy="8" r="3.1"/><path d="M3.3 19.3c0-3.2 2.6-5.4 5.7-5.4s5.7 2.2 5.7 5.4"/><circle cx="16.6" cy="8.6" r="2.5"/><path d="M15.9 13.9c2.9-.2 5 1.7 5 4.6"/></g>'+
    '<g class="s"><mask id="bi-m-social"><rect width="24" height="24" fill="#fff"/><circle cx="9" cy="8" r="4.6" fill="#000"/><path fill="#000" d="M1.6 20.9c0-4.5 3.4-8.6 7.4-8.6s7.4 4.1 7.4 8.6z"/></mask>'+
      '<g fill="currentColor" stroke="none"><circle cx="9" cy="8" r="3.4"/><path d="M2.8 19.7c0-3.5 2.8-6.2 6.2-6.2s6.2 2.7 6.2 6.2v.2c0 .3-.3.6-.6.6H3.4c-.3 0-.6-.3-.6-.6z"/>'+
      '<g mask="url(#bi-m-social)"><circle cx="16.6" cy="8.6" r="2.8"/><path d="M16.2 13.4c3.2-.3 5.6 1.9 5.6 5.1v1.4c0 .3-.3.6-.6.6h-5.6z"/></g></g></g>'
};
function biIco(k){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+BI[k]+'</svg>'; }
(function(){
  for(var k in BI) BARRA_ICO[k]=BI[k];
  BARRA_ICO.tareas=BI.academico;
  function pon(raiz){
    if(!raiz) return;
    ["resumen","vital","academico","retos","social","tareas"].forEach(function(k){
      var b=raiz.querySelector('button[data-view="'+k+'"]'); if(!b) return;
      var sv=b.querySelector("svg"); if(sv) sv.outerHTML=biIco(k==="tareas"?"academico":k);
    });
  }
  pon(document.getElementById("mtabs"));
  var _mt=menteTab;
  menteTab=function(){ var r=_mt.apply(this, arguments); var b=document.querySelector('#mtabs button[data-view="academico"], #mtabs button[data-view="tareas"]');
    if(b){ var sv=b.querySelector("svg"); if(sv && !sv.querySelector(".s")) sv.outerHTML=biIco("academico"); } return r; };

  /* más fuerte que la barra de 63 (ocho :not) */
  var Q="html"+[1,2,3,4,5,6,7,8,9].map(function(i){ return ":not(.biq"+i+")"; }).join("");
  var st=document.createElement("style"); st.id="barra-iconos-css"; st.textContent=[
'#mtabs .mtab svg .s{ display:none; } #mtabs .mtab[aria-current="true"] svg .o{ display:none; } #mtabs .mtab[aria-current="true"] svg .s{ display:inline; }',
Q+' #mtabs.barpill{ padding:6px !important; border-radius:32px !important; background:color-mix(in srgb, var(--gn-tarjeta) 97%, transparent) !important;',
'  -webkit-backdrop-filter:blur(22px) saturate(1.4) !important; backdrop-filter:blur(22px) saturate(1.4) !important;',
'  box-shadow:0 14px 34px -16px rgba(60,45,25,.35), 0 1px 2px rgba(60,45,25,.06), inset 0 0 0 1px rgba(255,255,255,.6), 0 0 0 1px rgba(40,32,20,.06) !important; }',
Q+'.dark #mtabs.barpill{ background:color-mix(in srgb, #1A1917 90%, transparent) !important;',
'  box-shadow:0 14px 34px -14px rgba(0,0,0,.8), inset 0 0 0 1px rgba(243,238,227,.07) !important; }',
Q+' #mtabs .mtab{ height:56px; gap:4px; color:var(--t3) !important; transition:color .25s; }',
Q+' #mtabs .mtab[aria-current="true"], '+Q+' #mtabs .mtab.cerca{ color:var(--t1) !important; }',
Q+' #mtabs .mtab svg{ width:24px !important; height:24px !important; stroke-width:1.6 !important; }',
Q+' #mtabs .mtab span{ font-size:11.5px !important; font-weight:500 !important; letter-spacing:0 !important; }',
Q+' #mtabs .mtab[aria-current="true"] span{ font-weight:650 !important; }',
Q+' #mtabs .mtab[aria-current="true"] svg{ animation:biSalta .5s cubic-bezier(.3,1.5,.5,1); }',
'@keyframes biSalta{ 0%{ transform:scale(.8); } 60%{ transform:scale(1.08); } 100%{ transform:none; } }',
/* la pastilla detrás del icono, en lugar de la rayita */
Q+' #mind{ top:6px !important; height:56px !important; }',
Q+' #mind::before{ inset:auto !important; top:1px !important; bottom:auto !important; left:50% !important; width:56px !important; height:32px !important; border-radius:16px !important;',
'  transform:translateX(-50%) !important; background:color-mix(in srgb, var(--t1) 8%, transparent) !important; box-shadow:none !important; }',
Q+'.dark #mind::before{ background:color-mix(in srgb, var(--t1) 12%, transparent) !important; }',
Q+' #mtabs.grabbing #mind::before, '+Q+' #mtabs.apretada #mind::before{ transform:translateX(-50%) scale(1.12) !important; }',
'@media (prefers-reduced-motion:reduce){ #mtabs .mtab svg{ animation:none !important; } }'
  ].join("\n");
  document.head.appendChild(st);
})();
