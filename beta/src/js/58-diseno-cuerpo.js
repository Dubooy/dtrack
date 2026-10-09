/* ════════ diseño nuevo · Cuerpo (oct 2026) ════════
   Maqueta: diseno/ui-peak/cuerpo-claro.html. En el móvil el orden pasa a ser
   Salud del día · Ejercicio · Estirar · Alimentación (con CSS, sin mover nodos:
   otras piezas recolocan los suyos en cada pintado).
   Ejercicio: tarjeta de tinta «Entreno de hoy» con el tipo (Gym, Correr, Deporte,
   Otro), la semana con un check por día y el botón de registrar. */

var CN_TIPOS=[
  { n:"Gimnasio", t:"Gym", d:'<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>' },
  { n:"Correr", t:"Correr", d:'<circle cx="14" cy="4.5" r="1.8"/><path d="M8 21l3-6 3 2v4M6 12l3-4 4 1 3 3 3 1M11 15l-1.5-4"/>' },
  { n:"Deporte", t:"Deporte", d:'<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17M3.5 12h17M6 6c3 2 3 10 0 12M18 6c-3 2-3 10 0 12"/>' },
  { n:"Otro", t:"Otro", d:'<circle cx="6" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18" cy="12" r="1.3"/>' }
];
function cnIc(d, tam){ return '<svg viewBox="0 0 24 24" width="'+(tam||20)+'" height="'+(tam||20)+'" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+d+'</svg>'; }
function cnTipoDe(d){
  var l=(S.deporteDia && S.deporteDia[d]) || [];
  for(var i=0;i<CN_TIPOS.length;i++) if(l.indexOf(CN_TIPOS[i].n)>=0) return CN_TIPOS[i];
  return l.length ? { n:l[0], t:l[0], otro:true } : null;
}

function cnPinta(){
  var v=document.getElementById("v-vital"), btn=document.getElementById("gym-btn"); if(!v || !btn) return;
  document.documentElement.classList.add("cu-n");
  var eb=v.querySelector("p.eyebrow"); if(eb && eb.textContent!=="Muévete · come · descansa") eb.textContent="Muévete · come · descansa";
  var card=btn.closest(".glass"); if(!card) return;
  card.classList.add("cn-gym");
  var t=curDay(), hoy=today(), esHoy=t===hoy, hecho=wentGym(t), tipo=hecho ? cnTipoDe(t) : null;
  /* racha de ejercicio y último entreno */
  var gs=0, d0=hoy; if(!wentGym(d0)) d0=addDays(d0,-1);
  while(wentGym(d0) && gs<400){ gs++; d0=addDays(d0,-1); }
  var ult=null; for(var i=1;i<60;i++){ var dd=addDays(t,-i); if(wentGym(dd)){ ult=dd; break; } }
  var ultTxt="";
  if(ult){ var ut=cnTipoDe(ult), dia=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"][new Date(ult+"T00:00:00").getDay()];
    ultTxt="Último: "+(ut?ut.t.toLowerCase():"entreno")+" · "+(ult===addDays(hoy,-1)?"ayer":dia); }
  else ultTxt="Elige qué haces y suma +20 XP";
  var big = hecho ? (tipo ? tipo.t : "Hecho")+'<span class="cn-ok">'+cnIc('<path d="M5 12.5l4.2 4.2L19 7"/>', 26)+'</span>'
          : esHoy ? "¿Qué toca hoy?" : "¿Qué hiciste?";
  var tipos=CN_TIPOS.map(function(T){
    var on=hecho && tipo && (tipo.n===T.n || (T.n==="Otro" && tipo.otro));
    return '<button class="'+(on?"on":"")+'" data-act="x-cn-tipo" data-n="'+T.n+'">'+cnIc(T.d, 22)+'<span>'+T.t+'</span></button>';
  }).join("");
  var l=lunesDe(hoy), dias="";
  for(var k=0;k<7;k++){
    var d=addDays(l,k), on=wentGym(d), fut=d>hoy;
    dias+='<button class="'+(on?"ok":"")+(d===t?" hoy":"")+'" data-act="day-go" data-d="'+d+'"'+(fut?" disabled":"")+'><i>'+(on?cnIc('<path d="M5 12.5l4.2 4.2L19 7"/>', 16):"")+'</i>'+"LMXJVSD".charAt(k)+'</button>';
  }
  var html=
    '<div class="hn-sec cn-sec"><h2>Ejercicio</h2><span>'+(gs?"Racha de "+gs:"Sin racha aún")+'</span></div>'+
    '<div class="cn-entreno"><div class="cn-ar"><div><p class="cn-eti">'+(esHoy?"Entreno de hoy":"Entreno de ese día")+'</p>'+
      '<p class="cn-big">'+big+'</p><small>'+esc(hecho?"+20 XP sumados. Toca otro tipo para cambiarlo":ultTxt)+'</small></div>'+
      '<span class="cn-ico">'+cnIc(CN_TIPOS[0].d, 28)+'</span></div>'+
      '<div class="cn-tipos">'+tipos+'</div></div>'+
    '<div class="cn-dias">'+dias+'</div>'+
    '<button class="cn-btn'+(hecho?" si":"")+'" data-act="gym" data-day="'+t+'">'+
      (hecho ? (esHoy?"Entreno hecho · deshacer":"Entrenaste · deshacer") : 'Registrar entreno <span>+20 XP</span>')+'</button>';
  var box=document.getElementById("cn-gym");
  if(!box){ box=document.createElement("div"); box.id="cn-gym"; card.insertBefore(box, card.firstChild); }
  if(box.dataset.h!==html){ box.innerHTML=html; box.dataset.h=html; }
  /* salud del día: cuántos datos llevas apuntados */
  var sf=v.querySelector(".sf-caja");
  if(sf){
    var hb=(S.habits && S.habits[t]) || {}, n=((hb.water||0)>0?1:0)+(hb.sleep!=null?1:0)+(hb.screen!=null?1:0);
    var cab=sf.querySelector(".cn-sfcab");
    if(!cab){ cab=document.createElement("div"); cab.className="hn-sec cn-sfcab"; sf.insertBefore(cab, sf.firstChild); }
    var ch='<h2>Salud del día</h2><span>'+n+' de 3 apuntados</span>';
    if(cab.innerHTML!==ch) cab.innerHTML=ch;
  }
  card.classList.toggle("cn-otro", !!(hecho && (!tipo || tipo.otro || tipo.n==="Otro")));
}
function cnAccion(a, el){
  if(a!=="x-cn-tipo") return false;
  var t=curDay(), n=el.dataset.n, ya=wentGym(t), tipo=ya ? cnTipoDe(t) : null;
  if(!S.deporteDia) S.deporteDia={};
  if(ya && tipo && (tipo.n===n || (n==="Otro" && tipo.otro))){   /* tocar el marcado lo quita */
    delete S.gym[t]; delete S.deporteDia[t]; sonido("des"); save(); render(); return true;
  }
  if(!ya){ if(typeof xpPreparar==="function") xpPreparar(); S.gym[t]=true; }
  S.deporteDia[t] = n==="Otro" ? [] : [n];
  if(n==="Otro"){ depAnadiendo=!(S.deportes && S.deportes.length); }
  save(); render();
  if(!ya && typeof celebraGym==="function") celebraGym({ clientX:el.getBoundingClientRect().left+20, clientY:el.getBoundingClientRect().top+20, target:el });
  return true;
}

var _cnVital=rVital;
rVital=function(){ var r=_cnVital.apply(this, arguments); try{ cnPinta(); }catch(e){ if(window.console) console.warn("cuerpo", e); } return r; };

(function(){
  var st=document.createElement("style"); st.id="diseno-cuerpo-css"; st.textContent=[
/* cabecera como Hoy y Objetivos */
'html.cu-n #v-vital p.eyebrow:has(+ h1.display){ font-size:11px; font-weight:600; letter-spacing:.18em; text-transform:uppercase; color:var(--t3); }',
'html.cu-n #v-vital p.eyebrow:has(+ h1.display)::before{ content:"PEAK."; display:block; font-family:var(--f-titulo); font-weight:800; font-size:17px; letter-spacing:-.03em;',
'  color:var(--t1); text-transform:none; margin-bottom:30px; line-height:40px; white-space:normal; }',
'html.cu-n #v-vital h1.display{ font-size:36px !important; font-weight:800 !important; letter-spacing:-.05em !important; line-height:1 !important; margin-top:14px; }',
'html.cu-n #v-vital > div:first-child{ margin-bottom:20px !important; }',
/* orden en el móvil: Salud, Ejercicio, Estirar, Alimentación */
'@media (max-width:1023px){',
'  html.cu-n #v-vital{ display:flex; flex-direction:column; }',
'  html.cu-n #v-vital > .grid, html.cu-n #v-vital > .grid > div{ display:contents; }',
'  html.cu-n #v-vital .sf-caja{ order:1; } html.cu-n #v-vital .cn-gym{ order:2; } html.cu-n #cu-rutinas{ order:3; } html.cu-n #ali-card{ order:4; }',
'}',
/* sin tarjetas por fuera */
'html.cu-n #v-vital .cn-gym, html.cu-n #v-vital #ali-card, html.cu-n #v-vital .sf-caja{ background:none !important; border:0 !important; box-shadow:none !important; padding:0 !important; border-radius:0 !important; }',
'html.cu-n #v-vital .cn-gym::before, html.cu-n #v-vital #ali-card::before{ display:none !important; }',
'html.cu-n .cn-gym > :not(#cn-gym):not(#dep-caja){ display:none !important; }',
'html.cu-n #v-vital .sf-caja > h2, html.cu-n #v-vital .sf-caja > p{ display:none !important; }',
'html.cu-n #ali-card > .flex.items-start{ align-items:baseline !important; margin-bottom:12px !important; }',
'html.cu-n #ali-card > .flex.items-start h2{ font-family:var(--f-titulo) !important; font-weight:700 !important; font-size:19px !important; letter-spacing:-.03em !important; }',
'html.cu-n #ali-card > .flex.items-start p{ display:none; }',
'html.cu-n #ali-card > .flex.items-start .text-right{ display:flex; align-items:baseline; gap:4px; }',
'html.cu-n #ali-card > .flex.items-start .text-right > div{ font-family:var(--f-texto) !important; font-size:14px !important; font-weight:500 !important; color:var(--t2); margin:0 !important; letter-spacing:0 !important; }',
'html.cu-n #ali-card .ali-de{ font-size:14px !important; font-weight:500 !important; color:var(--t2) !important; }',
'html.cu-n .cn-sfcab{ margin-top:8px; }',
/* salud del día: tarjetas como la ventana que se abre al tocar */
'html.cu-n #v-vital .sf-fila{ background:var(--tarjeta) !important; border:0 !important; box-shadow:none !important; border-radius:22px !important; padding:16px 16px 14px !important; margin-bottom:10px; }',
'html.cu-n #v-vital .sf-fila b{ font-size:15px; }',
'html.cu-n #v-vital .sf-num{ font-family:var(--f-titulo) !important; font-weight:800 !important; font-size:34px !important; letter-spacing:-.05em !important; }',
'html.cu-n #v-vital .sf-msg{ font-size:13px; color:var(--t2); }',
'html.cu-n #v-vital .sf-sem{ width:140px; height:56px; gap:4px; align-items:flex-end; }',
'html.cu-n #v-vital .sf-sem i{ flex:1; width:auto !important; min-height:6px; border-radius:4px !important; }',
/* ejercicio */
'.cn-sec{ margin-top:36px; }',
'.cn-entreno{ background:var(--t1); color:var(--bg); border-radius:24px; padding:18px; }',
'.cn-ar{ display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }',
'.cn-eti{ font-size:11px; font-weight:600; letter-spacing:.18em; text-transform:uppercase; color:color-mix(in srgb, var(--bg) 55%, transparent); }',
'.cn-big{ font-family:var(--f-titulo); font-weight:800; font-size:26px; letter-spacing:-.04em; line-height:1.05; margin-top:8px; display:flex; align-items:center; gap:8px; }',
'.cn-ok{ color:var(--hn-ac); display:inline-flex; }',
'.cn-entreno small{ display:block; margin-top:6px; font-size:13.5px; color:color-mix(in srgb, var(--bg) 62%, transparent); }',
'.cn-ico{ width:54px; height:54px; flex:none; border-radius:16px; background:color-mix(in srgb, var(--bg) 12%, transparent); display:grid; place-items:center; }',
'.cn-tipos{ display:flex; gap:8px; margin-top:16px; }',
'.cn-tipos button{ flex:1; border:1px solid color-mix(in srgb, var(--bg) 22%, transparent); border-radius:14px; padding:10px 0 8px; display:flex; flex-direction:column; align-items:center; gap:5px;',
'  font-size:12px; font-weight:600; color:var(--bg); transition:transform .2s; }',
'.cn-tipos button:active{ transform:scale(.94); }',
'.cn-tipos button.on{ background:var(--bg); color:var(--t1); border-color:var(--bg); }',
'.cn-dias{ display:flex; gap:6px; margin-top:14px; }',
'.cn-dias button{ flex:1; text-align:center; font-size:11px; font-weight:600; color:var(--t3); }',
'.cn-dias i{ display:grid; place-items:center; height:40px; border-radius:12px; border:1.5px solid var(--hairline); margin-bottom:6px; color:var(--bg); }',
'.cn-dias .ok i{ background:var(--t1); border-color:var(--t1); }',
'.cn-dias .hoy{ color:var(--hn-ac); } .cn-dias .hoy i{ border:2px dashed var(--hn-ac); } .cn-dias .ok.hoy i{ border-style:solid; }',
'.cn-btn{ width:100%; display:flex; align-items:center; justify-content:center; gap:8px; background:var(--t1); color:var(--bg); border-radius:99px; height:52px; font-weight:600; font-size:16px; margin-top:16px; }',
'.cn-btn span{ opacity:.6; font-weight:500; }',
'.cn-btn.si{ background:none; color:var(--t2); border:1.5px solid var(--hairline); font-size:14.5px; }',
'html.cu-n #dep-caja{ margin-top:14px; } html.cu-n .cn-gym:not(.cn-otro) #dep-caja{ display:none !important; }',
/* estirar */
'html.cu-n #cu-rutinas{ margin-top:36px !important; }',
'html.cu-n #cu-rutinas .tq-cab h2{ font-family:var(--f-titulo) !important; font-weight:700 !important; font-size:19px !important; letter-spacing:-.03em !important; }',
/* alimentación */
'html.cu-n #ali-card{ margin-top:36px !important; }',
'html.cu-n #ali-card .ali-btn{ background:none !important; border:1.5px solid var(--hairline) !important; box-shadow:none !important; border-radius:99px !important; min-height:50px; padding:12px !important; }',
'html.cu-n #ali-card .ali-btn .display{ font-family:var(--f-texto) !important; font-size:15.5px !important; font-weight:600 !important; letter-spacing:0 !important; }',
'html.cu-n #ali-card .ali-btn.si{ background:var(--t1) !important; color:var(--bg) !important; border-color:var(--t1) !important; }',
'html.cu-n #ali-card .ali-sep{ display:none; }',
'html.cu-n #ali-card .ali-cab{ padding:14px 0; border-top:1px solid var(--hairline); border-bottom:1px solid var(--hairline); margin-top:14px; }',
'html.cu-n #ali-card .ali-tile{ background:var(--tarjeta) !important; border:0 !important; box-shadow:none !important; border-radius:16px !important; }'
  ].join("\n");
  document.head.appendChild(st);
})();
