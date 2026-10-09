/* ════════ diseño nuevo · Mente, Social y la barra (oct 2026) ════════
   Mente y Social conservan lo que tienen y donde lo tienen; solo cambia la piel:
   cabecera como Hoy, Objetivos y Cuerpo, botones de tinta tipo pastilla,
   tarjetas lisas y títulos de sección iguales.
   La barra de abajo pasa a ser de tinta (solo en Claro y Oscuro). */
(function(){
  document.documentElement.classList.add("dz-n");
  var V="html.dz-n #v-academico, html.dz-n #v-social";
  function en(sel){ return V.split(", ").map(function(v){ return v+" "+sel; }).join(", "); }
  var P="html:not(.sage):not(.neo):not(.arena):not(.porcelana):not(.medianoche):not(.oro):not(.gr)";
  var st=document.createElement("style"); st.id="diseno-mente-social-css"; st.textContent=[
/* cabecera */
en('p.eyebrow:has(+ h1.display)')+'{ font-size:11px; font-weight:600; letter-spacing:.18em; text-transform:uppercase; color:var(--t3); }',
en('p.eyebrow:has(+ h1.display)::before')+'{ content:"PEAK."; display:block; font-family:var(--f-titulo); font-weight:800; font-size:17px; letter-spacing:-.03em;',
'  color:var(--t1); text-transform:none; margin-bottom:30px; line-height:40px; white-space:normal; }',
en('h1.display')+'{ font-size:36px !important; font-weight:800 !important; letter-spacing:-.05em !important; line-height:1 !important; margin-top:14px; }',
/* tarjetas lisas */
en('.glass')+'{ background:var(--tarjeta) !important; border:0 !important; box-shadow:none !important; border-radius:22px !important; }',
en('.glass::before')+'{ display:none !important; }',
/* la meditación va sin tarjeta, como las secciones de Hoy (tenía el relleno quitado y quedaba un cuadrado blanco) */
'html.dz-n #v-academico #med-card{ background:none !important; border-radius:0 !important; }',
/* títulos de sección */
en('h2.display')+', '+en('.tq-cab h2')+'{ font-family:var(--f-titulo) !important; font-weight:700 !important; font-size:19px !important; letter-spacing:-.03em !important; }',
en('.soc-yo h2.display')+'{ font-size:24px !important; }',
/* botones: pastillas de tinta */
en('.btn-primary')+', '+en('.med-go')+'{ background:var(--t1) !important; color:var(--bg) !important; border:0 !important; box-shadow:none !important; border-radius:99px !important; }',
en('.med-go')+'{ height:52px; font-family:var(--f-texto) !important; font-size:16px !important; font-weight:600 !important; letter-spacing:0 !important; }',
en('.btn-quiet')+', '+en('.tq-bib')+'{ background:none !important; color:var(--t1) !important; border:1.5px solid var(--hairline) !important; box-shadow:none !important; border-radius:99px !important; }',
en('.btn')+'{ font-family:var(--f-texto) !important; font-weight:600 !important; }',
/* elegir: minutos, sonidos, Horario/Tareas */
en('.med-mins button')+', '+en('.med-fondos button')+', '+en('.seg')+'{ background:none !important; border:1px solid var(--hairline) !important; box-shadow:none !important; }',
en('.med-mins button')+', '+en('.med-fondos button')+'{ border-radius:99px !important; color:var(--t2) !important; }',
en('.med-mins button')+'{ border-radius:16px !important; }',
en('.med-mins button.on')+', '+en('.med-fondos button.on')+'{ background:var(--t1) !important; color:var(--bg) !important; border-color:var(--t1) !important; }',
en('.med-mins button b')+'{ font-family:var(--f-titulo); }',
en('.seg')+'{ border-radius:99px !important; padding:3px !important; }',
en('.seg button')+'{ border-radius:99px !important; font-family:var(--f-texto) !important; font-weight:600 !important; }',
en('.seg button.on')+', '+en('.seg button[aria-pressed="true"]')+'{ background:var(--t1) !important; color:var(--bg) !important; box-shadow:none !important; }',
en('.med-tipo')+'{ background:var(--bg) !important; border:0 !important; box-shadow:none !important; border-radius:16px !important; }',
en('.ac-bt')+'{ box-shadow:none !important; }',
en('.ac-bt.mas')+'{ background:var(--t1) !important; color:var(--bg) !important; }',
/* semana de meditación: barras como «Tu semana» de Hoy */
en('.med-dia i')+'{ border-radius:3px !important; background:var(--hairline); }',
en('.med-dia.hoy span')+'{ color:var(--t1); }',
/* social */
en('.soc-nv-n')+'{ background:none !important; border:1px solid var(--hairline); color:var(--t1) !important; }',
en('.soc-nota')+'{ color:var(--t2); font-size:14.5px; }',
/* ── la barra de abajo, de tinta ── */
P+' #mtabs.barpill{ background:rgba(20,20,20,.92) !important; -webkit-backdrop-filter:blur(14px) saturate(1.2); backdrop-filter:blur(14px) saturate(1.2);',
'  box-shadow:0 12px 30px -12px rgba(0,0,0,.45) !important; border:0 !important; }',
P+'.dark #mtabs.barpill{ background:rgba(30,29,27,.92) !important; box-shadow:inset 0 0 0 1px rgba(243,238,227,.1), 0 12px 30px -12px rgba(0,0,0,.6) !important; }',
P+' #mtabs .mtab{ color:rgba(241,236,225,.5); }',
P+' #mtabs .mtab[aria-current="true"], '+P+' #mtabs .mtab.cerca{ color:#141414; }',
P+' #mind::before{ background:#F1ECE1 !important; box-shadow:none !important; }',
P+' #mtabs .mtab[aria-current="true"] svg .d, '+P+' #mtabs .mtab[aria-current="true"] svg .h{ stroke:#F1ECE1; }'
  ].join("\n");
  document.head.appendChild(st);
})();
