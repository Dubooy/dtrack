/* ════════ Cuerpo: Estirar y Alimentación nuevos (17/10/2026) ════════
   · Cabecera, Salud del día y Ejercicio, igual.
   · Estirar: las mismas tarjetas que se pasan de lado, con el texto y una flecha debajo
     de la foto, y «Ver todos» con la lista entera.
   · Alimentación: «¿Has comido bien hoy?» con un check redondo y la semana, y las ideas
     de hoy (desayuno, almuerzo y cena) como filas con su dibujo. Los dibujos son
     nuestros (beta/comida/*.svg), sin licencias de fotos. Rehace rtPinta y aliTarjetaHTML. */

var CB_FL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
var CB_CHECK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.2 4.2L19 7"/></svg>';
/* ── Estirar ── */
rtPinta=function(){
  var v=document.getElementById("v-vital"); if(!v || typeof ESTIRA_RUTINAS==="undefined") return;
  var viejo=document.getElementById("cu-estirar"); if(viejo && viejo.parentNode) viejo.parentNode.removeChild(viejo);
  var el=document.getElementById("cu-rutinas");
  if(!el){ el=document.createElement("div"); el.id="cu-rutinas"; el.className="tq"; }
  if(el.parentNode!==v || el.nextElementSibling) v.appendChild(el);
  var pie=function(b, s){ return '<span class="rt-pie cb-pie"><span><b>'+b+'</b><small>'+s+'</small></span><i class="cb-fl">'+CB_FL+'</i></span>'; };
  var h='<div class="cb-sec"><h2>Estirar</h2><button data-act="x-cb-estirar">Ver todos'+CB_FL+'</button></div><div class="tq-fila">'+rtTodas().map(function(r){
      return '<button class="rt-card cb-card" data-act="x-rt-abre" data-k="'+esc(r.k)+'" aria-label="'+esc(r.t)+'">'+rtMiniatura(r)+
        pie(esc(r.t), r.pasos.length+' estiramientos · '+esc(r.sub))+'</button>';
    }).join("")+
    '<button class="rt-card cb-card rt-nueva" data-act="x-rt-nueva"><span class="rt-mini"><i class="rt-rayas"></i><b class="rt-gran" style="--l:7">Tu rutina</b><span class="rt-mas">+</span></span>'+
      pie("Crea la tuya", "Elige entre los 30 estiramientos")+'</button></div>';
  if(el._h!==h){ el._h=h; el.innerHTML=h; rtFotos(el); }
};
function cbHojaEstirar(){
  openSheet('<div class="flex items-start justify-between mb-4"><h3 class="cb-h3">Estirar</h3>'+closeBtn()+'</div>'+
    '<div class="cb-lista">'+rtTodas().map(function(r){
      return '<button class="cb-fila" data-act="x-rt-abre" data-k="'+esc(r.k)+'">'+rtMiniatura(r)+
        '<span class="cb-ftx"><b>'+esc(r.t)+'</b><small>'+r.pasos.length+' estiramientos · '+esc(r.sub)+'</small></span><i class="cb-fl">'+CB_FL+'</i></button>';
    }).join("")+'<button class="cb-fila" data-act="x-rt-nueva"><span class="rt-mini"><i class="rt-rayas"></i><span class="rt-mas">+</span></span>'+
      '<span class="cb-ftx"><b>Crea la tuya</b><small>Elige entre los 30 estiramientos</small></span><i class="cb-fl">'+CB_FL+'</i></button></div>');
  var sb=document.getElementById("sheet-body"); if(sb){ sb.scrollTop=0; rtFotos(sb); }
}

/* ── Alimentación ── */
/* platos vistos desde arriba: dibujos nuestros en beta/comida/ (sin licencias de fotos) */

aliTarjetaHTML=function(){
  var t=curDay(), hoy=today(), esHoy=(t===hoy), bien=aliBien(t), o=aliObjetivo();
  var semana=0, dias="", l=lunesDe(hoy);
  for(var i=0;i<7;i++){
    var d=addDays(l,i), si=aliBien(d); if(si) semana++;
    dias+='<span class="cb-dia'+(si?" si":"")+(d===t?" hoy":"")+(d>hoy?" fut":"")+'"><i>'+(si?CB_CHECK:"")+'</i>'+"LMXJVSD".charAt(i)+'</span>';
  }
  var filas=ALI_COMIDAS.map(function(c){
    var p=o ? ALI_PLATOS[o][c.k][aliIdeaHoy(o,c.k)] : null;
    return '<button class="cb-comida" data-act="x-ali-comida" data-m="'+c.k+'"><span class="cb-foto"><img src="comida/'+c.k+'.svg" alt="" loading="lazy"></span>'+
      '<span class="cb-ftx"><em>'+c.n+'</em><b>'+(p ? esc(p[0]) : "15 ideas para "+(c.k==="desayuno"?"el desayuno":c.k==="almuerzo"?"el almuerzo":"la cena"))+'</b>'+
      '<small>'+(p ? p[1]+' min · '+p[2]+' g proteína' : 'Elige tu objetivo')+'</small></span>'+
      '<i class="cb-fl">'+CB_FL+'</i></button>';
  }).join("");
  return '<div class="cb-sec"><h2>Alimentación</h2><button data-act="x-ali-comida" data-m="almuerzo">Ver todas'+CB_FL+'</button></div>'+
    '<div class="cb-hoy'+(bien?" si":"")+'">'+
      '<div class="cb-hoy-ar"><div><p class="cb-eti">'+(esHoy?"Hoy":"Ese día")+' · +'+ALI_XP+' XP</p>'+
        '<p class="cb-big">'+(bien ? (esHoy?"Has comido bien":"Comiste bien") : (esHoy?"¿Has comido bien?":"¿Comiste bien?"))+'</p>'+
        '<small>'+semana+' de 7 días esta semana</small></div>'+
        '<button id="ali-btn" class="cb-ck'+(bien?" si":"")+'" data-act="x-ali-bien" data-day="'+t+'" aria-pressed="'+bien+'" aria-label="He comido bien">'+CB_CHECK+'</button></div>'+
      '<div class="cb-dias">'+dias+'</div></div>'+
    '<div class="cb-sub"><span>Ideas de hoy</span><button class="cb-obj" data-act="x-ali-objetivo">'+(o ? "Objetivo: "+aliObjNombre(o) : "Elegir objetivo")+ALI_ICO.lapiz+'</button></div>'+
    '<div class="cb-comidas">'+filas+'</div>';
};

function cbAccion(a, el){
  if(a==="x-cb-estirar"){ sonido("tick"); cbHojaEstirar(); return true; }
  return false;
}
var _cbGA=grupoAccion;
grupoAccion=function(a, el){ if(cbAccion(a, el)) return true; return _cbGA.apply(this, arguments); };

(function(){
  var st=document.createElement("style"); st.id="cuerpo-nuevo-css"; st.textContent=[
/* títulos de sección con «Ver todos →», como el concepto */
'.cb-sec{ display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }',
'.cb-sec h2{ font-family:var(--f-titulo); font-weight:700; font-size:19px; letter-spacing:-.03em; color:var(--t1); }',
'.cb-sec button{ display:flex; align-items:center; gap:6px; font-size:14px; font-weight:500; color:var(--t2); min-height:32px; }',
'.cb-sec button svg{ width:16px; height:16px; }',
'.cb-fl{ flex:none; width:22px; height:22px; color:var(--t2); display:grid; place-items:center; } .cb-fl svg{ width:20px; height:20px; }',
/* estirar: la foto con su texto y flecha debajo, en una tarjeta */
'html.cu-n #cu-rutinas .tq-cab{ display:none; }',
'.cb-card{ background:var(--tarjeta); border-radius:22px; padding:8px 8px 0; }',
'.cb-card .rt-mini{ border-radius:16px; }',
'.cb-pie{ display:flex !important; align-items:center; gap:10px; padding:12px 8px 14px !important; }',
'.cb-pie > span{ flex:1; min-width:0; }',
'.cb-pie b{ white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
'.cb-h3{ font-family:var(--f-titulo); font-weight:700; font-size:21px; letter-spacing:-.03em; }',
'.cb-lista{ display:flex; flex-direction:column; gap:10px; }',
'.cb-fila{ display:flex; align-items:center; gap:14px; width:100%; text-align:left; padding:8px 12px 8px 8px; border-radius:20px; background:var(--tarjeta); }',
'.cb-fila .rt-mini{ flex:none; width:46%; max-width:190px; border-radius:14px; }',
'.cb-fila .rt-gran{ font-size:11px !important; } .cb-fila .rt-min{ font-size:10px; left:8px; bottom:7px; padding:2px 7px; } .cb-fila .rt-mas{ width:38px; height:38px; right:50%; }',
'.cb-ftx{ flex:1; min-width:0; display:block; }',
'.cb-ftx b{ display:block; font-size:15px; font-weight:600; letter-spacing:-.01em; line-height:1.25; color:var(--t1); }',
'.cb-ftx small{ display:block; font-size:12.5px; color:var(--t3); margin-top:3px; }',
/* alimentación: el check del día */
'.cb-hoy{ background:var(--tarjeta); border-radius:22px; padding:16px 16px 14px; }',
'.cb-hoy-ar{ display:flex; align-items:center; justify-content:space-between; gap:12px; }',
'.cb-eti{ font-size:11px; font-weight:600; letter-spacing:.16em; text-transform:uppercase; color:var(--t3); }',
'.cb-big{ font-family:var(--f-titulo); font-weight:800; font-size:23px; letter-spacing:-.045em; line-height:1.1; margin-top:6px; color:var(--t1); }',
'.cb-hoy small{ display:block; margin-top:5px; font-size:13px; color:var(--t2); }',
'.cb-ck{ flex:none; width:58px; height:58px; border-radius:50%; display:grid; place-items:center; border:2px solid var(--hairline); color:var(--t3);',
'  transition:transform .35s var(--spring), background .3s, border-color .3s, color .3s; }',
'.cb-ck svg{ width:26px; height:26px; } .cb-ck:active{ transform:scale(.9); }',
'.cb-ck.si{ background:var(--t1); border-color:var(--t1); color:var(--bg); }',
'.cb-ck.ali-sello{ animation:gymSello .62s cubic-bezier(.3,1.5,.5,1); }',
'html.dark .cb-ck.si svg{ color:var(--hn-ac, #3BE08B); filter:drop-shadow(0 0 6px rgba(59,224,139,.6)); }',
'.cb-dias{ display:flex; gap:6px; margin-top:14px; }',
'.cb-dia{ flex:1; display:flex; flex-direction:column; align-items:center; gap:5px; font-size:11px; font-weight:600; color:var(--t3); }',
'.cb-dia i{ width:100%; height:30px; border-radius:10px; display:grid; place-items:center; background:color-mix(in srgb, var(--t1) 6%, transparent); color:var(--bg); }',
'.cb-dia i svg{ width:14px; height:14px; }',
'.cb-dia.si i{ background:var(--t1); } .cb-dia.fut i{ opacity:.45; }',
'.cb-dia.hoy{ color:var(--t1); } .cb-dia.hoy:not(.si) i{ box-shadow:inset 0 0 0 1.5px var(--t1); }',
/* alimentación: ideas de hoy */
'.cb-sub{ display:flex; justify-content:space-between; align-items:center; margin:20px 2px 10px; }',
'.cb-sub > span{ font-size:11px; font-weight:600; letter-spacing:.16em; text-transform:uppercase; color:var(--t3); }',
'.cb-obj{ display:inline-flex; align-items:center; gap:6px; font-size:13px; font-weight:500; color:var(--t2); min-height:32px; }',
'.cb-obj svg{ width:12px; height:12px; }',
'.cb-comidas{ display:flex; flex-direction:column; gap:10px; }',
'.cb-comida{ display:flex; align-items:center; gap:14px; width:100%; text-align:left; padding:8px 14px 8px 8px; border-radius:20px; background:var(--tarjeta); transition:transform .3s var(--spring); }',
'.cb-comida:active{ transform:scale(.98); }',
'.cb-foto{ flex:none; width:104px; height:86px; border-radius:14px; overflow:hidden; }',
'.cb-foto img{ display:block; width:100%; height:100%; object-fit:cover; transform:scale(1.3); }',
'html.dark .cb-foto img{ filter:brightness(.88); }',
'.cb-comida em{ display:inline-block; font-style:normal; font-size:10.5px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; padding:3px 8px; border-radius:7px;',
'  background:color-mix(in srgb, var(--t1) 7%, transparent); color:var(--t1); margin-bottom:6px; }',
'.cb-comida b{ display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }'
  ].join("\n");
  document.head.appendChild(st);
})();
