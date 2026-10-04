/* ════════════════════════════════════════════════════════════════
   BARRA DE ABAJO «LIQUID GLASS» (oct 2026)
   Cápsula flotante de cristal esmerilado separada del borde, con un
   borde fino de cristal. Iconos de trazo fino (1,5) y texto pequeño.
   La pestaña abierta la marca la burbuja clara de siempre (salta con
   muelle). Los iconos son como los de la app de iPhone: de contorno y
   rellenos en la pestaña abierta.
   ════════════════════════════════════════════════════════════════ */
var BARRA_SVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">';
/* r: se rellena debajo de la burbuja · d: detalle que debajo de la burbuja
   toma el color de la burbuja (la línea del libro) · f: solo relleno, solo
   debajo de la burbuja · h: contorno que separa figuras rellenas */
var BARRA_ICO={
  resumen:'<rect class="r" x="3.5" y="3.5" width="7.25" height="7.25" rx="2"/><rect class="r" x="13.25" y="3.5" width="7.25" height="7.25" rx="2"/><rect class="r" x="3.5" y="13.25" width="7.25" height="7.25" rx="2"/><rect class="r" x="13.25" y="13.25" width="7.25" height="7.25" rx="2"/>',
  retos:'<path class="r" d="M7 3.5h10v5.5a5 5 0 0 1-10 0z"/><path d="M7 5.25H5.4a1.15 1.15 0 0 0-1.15 1.2c.08 2 1.4 3.6 3.25 4M17 5.25h1.6a1.15 1.15 0 0 1 1.15 1.2c-.08 2-1.4 3.6-3.25 4"/><path class="r" d="M10.9 14h2.2v3.6h-2.2z"/><path class="r" d="M8 20.5h8v-.6a2.3 2.3 0 0 0-2.3-2.3h-3.4A2.3 2.3 0 0 0 8 19.9z"/>',
  /* el corredor de la app de iPhone: de contorno (el hueco se recorta con una máscara) */
  vital:'<defs><mask id="barra-corre" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24"><g stroke="#fff" fill="#fff"><path fill="none" stroke-width="3.6" d="M12.9 7.7l-2.3 5.5M12.9 7.9l2.5 2.2 2.6-.8M12.7 8l-3.1 1.1-1.6 2.3M10.6 13.2l3.4 2.2-1 4.9 1.5.2M10.6 13.2l-1.7 3.6-3.7 1.5"/><circle cx="14.7" cy="3.7" r="2.6" stroke="none"/></g><g stroke="#000" fill="#000"><path fill="none" stroke-width="1.2" d="M12.9 7.7l-2.3 5.5M12.9 7.9l2.5 2.2 2.6-.8M12.7 8l-3.1 1.1-1.6 2.3M10.6 13.2l3.4 2.2-1 4.9 1.5.2M10.6 13.2l-1.7 3.6-3.7 1.5"/><circle cx="14.7" cy="3.7" r="1.3" stroke="none"/></g></mask></defs><rect x="0" y="0" width="24" height="24" fill="currentColor" stroke="none" mask="url(#barra-corre)"/>',
  academico:'<path class="r" d="M12 19.5c-2.8-1.7-4.3-4.3-4.3-7.2 0-2.6 1.5-5.1 4.3-7.8 2.8 2.7 4.3 5.2 4.3 7.8 0 2.9-1.5 5.5-4.3 7.2z"/><path d="M7.9 10.6C5.8 10 3.9 10 2.5 10.6c.3 4.9 4.3 8.9 9.5 8.9"/><path d="M16.1 10.6c2.1-.6 4-.6 5.4 0-.3 4.9-4.3 8.9-9.5 8.9"/>',
  social:'<circle class="r" cx="16.6" cy="7.4" r="2.6"/><path d="M17.2 13.4c2.4.3 4.05 2.2 4.05 4.6v.35a.6.6 0 0 1-.6.6h-2.6"/><path class="f" d="M12 13.75c1.3-.45 2.9-.6 4.8-.4 2.6.3 4.45 2.25 4.45 4.65v.35a.65.65 0 0 1-.65.65H12z"/><g class="h"><circle cx="9" cy="7.75" r="3.25"/><path d="M2.75 19.1c0-3.3 2.8-5.6 6.25-5.6s6.25 2.3 6.25 5.6v.15a.75.75 0 0 1-.75.75H3.5a.75.75 0 0 1-.75-.75z"/></g><circle class="r" cx="9" cy="7.75" r="3.25"/><path class="r" d="M2.75 19.1c0-3.3 2.8-5.6 6.25-5.6s6.25 2.3 6.25 5.6v.15a.75.75 0 0 1-.75.75H3.5a.75.75 0 0 1-.75-.75z"/>',
  tareas:'<path d="M3.5 6.25l1.6 1.6 3-3.1M3.5 12.75l1.6 1.6 3-3.1M3.5 19.25l1.6 1.6 3-3.1M11 6.5h9.5M11 13h9.5M11 19.5h9.5"/>'
};
function barraIco(k){ return BARRA_SVG+BARRA_ICO[k]+'</svg>'; }
menteTab=function(){
  var b=document.querySelector('#mtabs button[data-view="academico"], #mtabs button[data-view="tareas"]');
  if(b) b.innerHTML=barraIco("academico")+'<span data-label="academico">'+esc((S.labels&&S.labels.academico)||"Mente")+'</span>';
};
ICO_TAREAS=barraIco("tareas");
(function(){
  var st=document.createElement("style"); st.id="barra-cristal-css"; st.textContent=[
'nav.bottombar{ padding-bottom:calc(12px + env(safe-area-inset-bottom))!important; }',
'#mtabs{ gap:0; padding:5px; isolation:isolate;',
'  background:color-mix(in srgb, var(--bg) 60%, transparent)!important;',
'  backdrop-filter:blur(28px) saturate(180%)!important; -webkit-backdrop-filter:blur(28px) saturate(180%)!important;',
'  border:1px solid rgba(255,255,255,.55); box-shadow:0 10px 30px -12px rgba(0,0,0,.26), 0 0 0 .5px rgba(0,0,0,.06)!important; }',
'html.dark #mtabs{ background:color-mix(in srgb, var(--bg) 55%, transparent)!important; border-color:rgba(255,255,255,.1);',
'  box-shadow:0 10px 30px -12px rgba(0,0,0,.6)!important; }',
'#mtabs .mtab{ width:66px; height:54px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; color:var(--t2); }',
'#mtabs .mtab svg, #mtabs button[data-view="resumen"] svg{ width:24px; height:24px; flex:none; stroke-width:1.5; transition:transform .35s cubic-bezier(.3,1.4,.5,1); }',
'#mtabs .mtab span{ position:static; opacity:1; transform:none; font-size:10px; font-weight:500; letter-spacing:.01em; line-height:1; color:inherit; }',
'#mtabs .mtab[aria-current="true"], #mtabs .mtab.cerca{ color:var(--accent); }',
'#mtabs .mtab[aria-current="true"] span{ opacity:1; font-weight:600; }',
'#mtabs .mtab[aria-current="true"] svg{ transform:none; }',
'#mtabs .mtab svg .f, #mtabs .mtab svg .h{ display:none; }',
'#mtabs .mtab:active svg{ transform:scale(.9); }',
/* la burbuja de siempre: pastilla del color de la app que salta con muelle */
'#mind{ top:5px; height:54px; width:66px; opacity:0; background:none!important; box-shadow:none!important; will-change:transform;',
'  transition:transform .55s var(--spring), width .45s var(--spring), opacity .3s var(--ease); }',
/* lo que se ve va en ::before, así crecer al pulsar no mueve la burbuja de su sitio */
'#mind::before{ content:""; position:absolute; inset:0; border-radius:inherit; pointer-events:none; will-change:transform;',
'  background:var(--accent-soft); box-shadow:inset 0 0 0 1px var(--accent-line);',
'  transition:transform .35s cubic-bezier(.3,1.4,.5,1); }',
'#mind::after{ content:none; }',
/* la pestaña abierta: icono relleno; el detalle (la línea del libro) y el contorno que separa figuras van del color del fondo */
'#mtabs .mtab[aria-current="true"] svg .r{ fill:currentColor; }',
'#mtabs .mtab[aria-current="true"] svg .d{ stroke:var(--bg); stroke-width:1.6; }',
'#mtabs .mtab[aria-current="true"] svg .f{ display:inline; fill:currentColor; stroke:none; }',
'#mtabs .mtab[aria-current="true"] svg .h{ display:inline; fill:none; stroke:var(--bg); stroke-width:3.2; }',
'#mtabs.grabbing #mind::before, #mtabs.apretada #mind::before{ transform:scale(1.1); }',
'@media (max-width:370px){ #mtabs .mtab{ width:calc((100vw - 40px) / 5)!important; } }',
'@media (prefers-reduced-motion:reduce){ #mind{ transition:opacity .2s!important; } }',
/* ── fotos: mantener pulsado ── */
'.av-lp, .soc-yo-foto, .pf-foto, .gr-foto{ -webkit-touch-callout:none; -webkit-user-select:none; user-select:none;',
'  transition:transform .5s cubic-bezier(.3,1.6,.5,1); }',
'.av-lp img, .soc-yo-foto img, .pf-foto img, .gr-foto img{ -webkit-user-drag:none; pointer-events:none; }',
'.av-pulsa{ transform:scale(.88)!important; transition:transform .42s cubic-bezier(.2,.7,.3,1)!important; }',
'#av-ver{ position:fixed; inset:0; z-index:200; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:18px;',
'  background:rgba(10,10,12,0); backdrop-filter:blur(0px); -webkit-backdrop-filter:blur(0px);',
'  transition:background .35s ease, backdrop-filter .35s ease, -webkit-backdrop-filter .35s ease; cursor:zoom-out; }',
'#av-ver.ve{ background:rgba(10,10,12,.62); backdrop-filter:blur(22px) saturate(140%); -webkit-backdrop-filter:blur(22px) saturate(140%); }',
'#av-ver .av-grande{ position:relative; overflow:hidden; border-radius:999px; will-change:transform, border-radius;',
'  box-shadow:0 30px 80px -20px rgba(0,0,0,.6); display:flex; align-items:center; justify-content:center;',
'  background:var(--accent-soft); color:var(--accent); background-color:color-mix(in srgb,var(--bg) 88%,var(--accent)); }',
'#av-ver .av-grande img{ width:100%; height:100%; object-fit:cover; display:block; }',
'#av-ver .av-grande .av-letra{ font-weight:800; letter-spacing:-.04em; }',
'#av-ver .av-nombre{ color:#fff; font-size:20px; font-weight:800; letter-spacing:-.02em; opacity:0; transform:translateY(8px);',
'  transition:opacity .3s ease .12s, transform .45s cubic-bezier(.3,1.4,.5,1) .12s; }',
'#av-ver.ve .av-nombre{ opacity:1; transform:none; }',
/* ── el lápiz para cambiar la foto ── */
'.av-lapiz{ position:absolute; right:-2px; bottom:-2px; width:26px; height:26px; border-radius:99px; z-index:2;',
'  display:flex; align-items:center; justify-content:center; background:var(--accent); color:var(--on-accent);',
'  box-shadow:0 0 0 3px var(--bg), 0 3px 8px -2px rgba(0,0,0,.3); cursor:pointer; transition:transform .35s cubic-bezier(.3,1.6,.5,1); }',
'.av-lapiz:active{ transform:scale(.85); }',
'.av-lapiz svg{ width:13px; height:13px; }',
'.pf-foto{ position:relative; overflow:visible!important; }',
'.pf-foto > img{ border-radius:999px; }',
'.pf-foto .av-lapiz{ width:34px; height:34px; right:0; bottom:0; } .pf-foto .av-lapiz svg{ width:16px; height:16px; }',
/* ── la foto del grupo ── */
'.gr-foto{ position:relative; width:96px; height:96px; border-radius:999px; flex:0 0 auto; display:flex; align-items:center; justify-content:center;',
'  background:var(--accent-soft); color:var(--accent); }',
'.gr-foto > img{ width:100%; height:100%; object-fit:cover; border-radius:999px; display:block; }',
'.gr-foto .av-lapiz{ width:32px; height:32px; right:0; bottom:0; } .gr-foto .av-lapiz svg{ width:15px; height:15px; }',
'.gr-foto-caras{ display:flex; } .gr-foto-caras > span{ margin-left:-14px; border-radius:999px; box-shadow:0 0 0 3px var(--bg); } .gr-foto-caras > span:first-child{ margin-left:0; }',
'.gr-foto.sin{ width:auto; height:auto; background:none; }',
'.gr-foto.sin .av-lapiz{ right:-10px; bottom:-6px; }',
'.soc-caras .gr-foto-s{ width:40px; height:40px; border-radius:999px; overflow:hidden; display:block; }',
'.soc-caras .gr-foto-s img{ width:100%; height:100%; object-fit:cover; display:block; }'
  ].join("\n"); document.head.appendChild(st);

  /* los iconos */
  $$("#mtabs button[data-view]").forEach(function(b){
    var k=b.dataset.view, sv=b.querySelector("svg"); if(sv && BARRA_ICO[k]) sv.outerHTML=barraIco(k);
  });
  try{ menteTab(); if(typeof academicoAplica==="function") academicoAplica(); }catch(e){}
  setTimeout(moveMTab, 60);
})();

