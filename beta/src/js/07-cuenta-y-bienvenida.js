/* ════════ cuenta y nube ════════ */

/* ════════ carrusel de bienvenida ════════
   A pantalla completa: la foto ocupa todo el fondo y se desvanece hacia
   el color del tema para dejar sitio al texto y a los botones. */
var carIdx=0, carAuto=null, carX0=null, carDX=0;
var ULTKEY="dtrack-ultimo";

function ultimoCorreo(){ try{ return localStorage.getItem(ULTKEY)||""; }catch(e){ return ""; } }
function ultimoCorreoSet(v){ try{ v?localStorage.setItem(ULTKEY,v):localStorage.removeItem(ULTKEY); }catch(e){} }

function marcaBlanca(){
  return '<div class="car-marca">'+peakWM("#fff")+'</div>';
}

/* carHTML y carPinta viven en bienvenida.js */
/* carVa vive en bienvenida.js */
function carArranca(){ clearInterval(carAuto); carAuto=setInterval(function(){ carVa(carIdx+1); }, 8200); }
function carPara(){ clearInterval(carAuto); carAuto=null; }

function carGestos(){
  var c=document.getElementById("car"); if(!c) return;
  var pista=document.getElementById("car-pista"), arrastrando=false, pid=null;
  c.addEventListener("pointerdown", function(e){
    carPara(); carX0=e.clientX; carDX=0; arrastrando=false; pid=e.pointerId;
  });
  c.addEventListener("pointermove", function(e){
    if(carX0===null) return;
    carDX=e.clientX-carX0;
    /* el dedo solo se captura cuando de verdad arrastra: si no, los puntitos dejan de responder */
    if(!arrastrando){
      if(Math.abs(carDX)<7) return;
      arrastrando=true;
      if(pista) pista.style.transition="none";
      try{ c.setPointerCapture(pid); }catch(err){}
    }
    if(pista) pista.style.transform="translate3d(calc("+(-(carIdx+1)*100)+"% + "+carDX+"px),0,0)";
  }, {passive:true});
  function suelta(){
    if(carX0===null) return;
    var era=arrastrando;
    carX0=null; arrastrando=false;
    try{ c.releasePointerCapture(pid); }catch(err){}
    if(era){
      if(pista) pista.style.transition="";
      var ancho=c.offsetWidth||360;
      if(Math.abs(carDX)>ancho*0.16) carVa(carIdx+(carDX<0?1:-1)); else carPinta(true);
    }
    carDX=0; carArranca();
  }
  c.addEventListener("pointerup", suelta);
  c.addEventListener("pointercancel", suelta);
  c.addEventListener("click", function(e){
    var p=e.target.closest?e.target.closest("[data-car]"):null;
    if(p){ carPara(); carVa(+p.dataset.car); carArranca(); }
  });
}

var CAR_CSS =
"#puerta-hoja{ position:absolute; inset:0; z-index:10; display:flex; align-items:center;"+
  " justify-content:center; padding:0 18px; transition:padding-bottom .22s var(--ease); }"+
"#puerta .puerta-velo{ position:absolute; inset:0; cursor:default;"+
  " background:rgba(0,0,0,.14); animation:fade .28s var(--ease) both; }"+
"#puerta .puerta-tarjeta{ position:relative; width:100%; max-width:400px;"+
  " max-height:82vh; overflow-y:auto; -webkit-overflow-scrolling:touch;"+
  " border-radius:26px; padding:26px 24px 24px;"+
  " background:color-mix(in srgb,var(--bg) 86%,var(--glass-bg));"+
  " backdrop-filter:blur(22px) saturate(180%); -webkit-backdrop-filter:blur(22px) saturate(180%);"+
  " box-shadow:0 28px 70px -22px rgba(0,0,0,.5), inset 0 0 0 1px var(--glass-edge);"+
  " opacity:0; transform:scale(.72); }"+
"#puerta .puerta-tarjeta.entra{ opacity:1; transform:scale(1);"+
  " transition:opacity .26s var(--ease), transform .46s var(--spring); }"+

"#puerta-hoja.fuera .puerta-velo{ opacity:0; transition:opacity .26s var(--ease); }"+
"#puerta-hoja.fuera .puerta-tarjeta{ opacity:0; transform:scale(.78);"+
  " transition:opacity .22s var(--ease), transform .28s var(--ease); }"+
"#puerta .hoja-x{ position:absolute; top:14px; right:14px; width:30px; height:30px; border-radius:11px;"+
  " display:grid; place-items:center; color:var(--t3); background:var(--fill);"+
  " transition:background .25s var(--ease), color .25s var(--ease); }"+
"#puerta .hoja-x:hover{ background:var(--fill-hi); color:var(--t1); }"+
"#puerta .hoja-x svg{ width:14px; height:14px; }"+

"#puerta.bienve{ padding:0!important; display:flex!important; flex-direction:column;"+
  " align-items:stretch!important; overflow:hidden!important; overscroll-behavior:none; }"+
"#puerta .car{ position:relative; flex:1 1 auto; min-height:0; overflow:hidden; touch-action:none;"+
  " user-select:none; -webkit-user-select:none; }"+
"#puerta .car-pista{ display:flex; height:100%; transition:transform .55s var(--spring); will-change:transform; }"+
"#puerta .car-lam{ flex:0 0 100%; position:relative; height:100%; overflow:hidden; }"+
"#puerta .car-foto{ position:absolute; inset:0; background-size:cover; background-position:center; }"+
"#puerta .car-velo{ position:absolute; inset:0; background:"+
  "linear-gradient(180deg, rgba(0,0,0,.36) 0%, rgba(0,0,0,.18) 30%,"+
  " color-mix(in srgb,var(--bg) 0%,transparent) 46%,"+
  " color-mix(in srgb,var(--bg) 62%,transparent) 64%,"+
  " var(--bg) 81%, var(--bg) 100%); }"+
/* la primera lámina ya viene compuesta: se oscurece menos y se desvanece más abajo */
"#puerta .car-lam.entera .car-velo{ background:"+
  "linear-gradient(180deg, rgba(0,0,0,.06) 0%,"+
  " color-mix(in srgb,var(--bg) 0%,transparent) 50%,"+
  " color-mix(in srgb,var(--bg) 58%,transparent) 68%,"+
  " var(--bg) 84%, var(--bg) 100%); }"+
"#puerta .car-caja{ position:absolute; inset:0; display:flex; flex-direction:column; align-items:center;"+
  " padding-top:13.5%; }"+
"#puerta .car-marca{ display:flex; align-items:center; gap:9px; }"+
"#puerta .car-marca svg{ height:26px; width:auto; display:block;"+
  " filter:drop-shadow(0 2px 9px rgba(0,0,0,.45)); }"+
"#puerta .car-marca span{ font-size:24px; font-weight:800; letter-spacing:-.035em; color:#fff;"+
  " line-height:1; text-shadow:0 2px 12px rgba(0,0,0,.4); }"+
"#puerta .car-tel{ margin-top:3.8%; width:45%; max-width:218px; border-radius:22px; overflow:hidden;"+
  " padding:3px; background:#17171b;"+
  " box-shadow:0 24px 54px -18px rgba(0,0,0,.6), inset 0 0 0 1px rgba(255,255,255,.14); }"+
"#puerta .car-tel img{ display:block; width:100%; height:auto; border-radius:19px; }"+
"#puerta .car-frase{ position:absolute; left:0; right:0; bottom:78px; margin:0 auto; padding:0 24px;"+
  " max-width:25ch; text-align:center; font-size:19px; font-weight:700; letter-spacing:-.03em;"+
  " line-height:1.26; color:var(--t1); }"+
"#puerta .car-puntos{ position:absolute; left:0; right:0; bottom:34px; display:flex; gap:6px;"+
  " justify-content:center; z-index:3; }"+
"#puerta .car-punto{ width:6px; height:6px; border-radius:99px; background:var(--fill-hi); cursor:pointer;"+
  " transition:width .4s var(--spring), background .3s var(--ease); }"+
"#puerta .car-punto.on{ width:18px; background:var(--accent); }"+
"#puerta .car-pie{ flex:0 0 auto; position:relative; z-index:2; background:var(--bg);"+
  " padding:0 20px calc(20px + env(safe-area-inset-bottom)); }"+
/* ── el mismo lenguaje que el resto de la app ── */
"#puerta .pu-boton{ width:100%; height:56px; border-radius:999px; display:flex; flex-direction:column;"+
  " align-items:center; justify-content:center; gap:1px; font-size:16px; font-weight:700; letter-spacing:-.01em;"+
  " color:var(--on-accent); margin-top:16px;"+
  " background:linear-gradient(155deg, color-mix(in srgb,var(--accent) 90%,#000) 0%, var(--accent) 55%, var(--grad-2) 130%);"+
  " box-shadow:0 14px 30px -14px color-mix(in srgb,var(--accent) 75%,transparent);"+
  " transition:transform .35s var(--spring), opacity .2s var(--ease); }"+
"#puerta .pu-boton:active{ transform:scale(.97); }"+
"#puerta .pu-boton[disabled]{ opacity:.6; }"+
"#puerta .car-pie .pu-boton{ margin-top:0; }"+
"#puerta .pu-boton-sub{ font-size:11.5px; font-weight:500; opacity:.8; }"+
"#puerta .pu-boton-t{ font-size:15px; font-weight:700; max-width:88%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }"+
"#puerta .pu-enlace{ display:block; width:100%; text-align:center; padding:12px 0 2px; font-size:15px; font-weight:700;"+
  " color:var(--accent); background:none; }"+
"#puerta .pu-enlace[disabled]{ color:var(--t3); }"+
"#puerta .pu-nota{ margin-top:12px; text-align:center; font-size:12px; line-height:1.5; color:var(--t3); }"+
"#puerta .pu-t{ font-size:28px; font-weight:800; letter-spacing:-.04em; line-height:1.1; padding-right:34px; }"+
"#puerta .pu-sub{ margin-top:8px; font-size:14.5px; line-height:1.5; color:var(--t2); }"+
"#puerta .pu-campo{ display:block; width:100%; height:56px; margin-top:20px; padding:0 18px; border-radius:16px;"+
  " background:var(--fill); color:var(--t1); border:0; outline:none; font-size:17px!important;"+
  " box-shadow:inset 0 0 0 1px var(--hairline); transition:box-shadow .2s var(--ease), background .2s var(--ease); }"+
"#puerta .pu-campo:focus{ background:var(--glass-bg-hi); box-shadow:inset 0 0 0 2px var(--accent); }"+
"#puerta .pu-codigo{ height:68px; text-align:center; font-size:28px!important; font-weight:800; letter-spacing:.28em; padding-left:.28em; }"+
"#puerta .pu-codigo::placeholder{ letter-spacing:.02em; font-size:20px; font-weight:600; }"+
"#puerta .pu-fila-enlaces{ display:flex; align-items:center; justify-content:center; gap:10px; margin-top:6px; }"+
"#puerta .pu-fila-enlaces .pu-enlace{ width:auto; padding-top:10px; font-size:14px; }"+
"#puerta .pu-fila-enlaces .t3{ padding-top:8px; }"+
"#puerta .pu-grupo{ margin-top:20px; border-radius:16px; background:var(--fill); box-shadow:inset 0 0 0 1px var(--hairline); padding:0 16px; }"+
"#puerta .pu-fila{ display:flex; align-items:center; gap:12px; min-height:54px; }"+
"#puerta .pu-fila + .pu-fila{ box-shadow:inset 0 1px 0 var(--hairline); }"+
"#puerta .pu-fila span{ flex:0 0 96px; font-size:15px; font-weight:600; color:var(--t1); }"+
"#puerta .pu-fila input{ flex:1; min-width:0; height:52px; background:none; border:0; outline:none; color:var(--t1);"+
  " text-align:right; font-size:16px!important; -webkit-appearance:none; appearance:none; }"+
"#puerta .pu-fila input::-webkit-date-and-time-value{ text-align:right; }"+
"#puerta .hoja-x{ border-radius:999px!important; width:32px!important; height:32px!important; top:18px!important; right:18px!important; }"+
"#puerta .puerta-tarjeta{ border-radius:30px!important; padding:28px 24px 24px!important; }"+
/* entrar con Google: el botón blanco de Google, con su «G» */
"#puerta .pu-google{ width:100%; height:52px; margin-top:10px; border-radius:999px; display:flex; align-items:center;"+
  " justify-content:center; gap:10px; font-size:15.5px; font-weight:600; color:#1f1f1f; background:#fff;"+
  " box-shadow:inset 0 0 0 1px #747775; transition:transform .35s var(--spring); }"+
"html.dark #puerta .pu-google{ color:#e3e3e3; background:#131314; box-shadow:inset 0 0 0 1px #8e918f; }"+
"#puerta .pu-google svg{ width:20px; height:20px; flex:0 0 auto; }"+
"#puerta .pu-google:active{ transform:scale(.97); }"+
"#puerta .puerta-tarjeta .pu-google{ margin-top:18px; }"+
"#puerta .pu-o{ display:flex; align-items:center; gap:12px; margin-top:18px; font-size:12.5px; color:var(--t3); }"+
"#puerta .pu-o:before, #puerta .pu-o:after{ content:''; flex:1; height:1px; background:var(--hairline-2); }"+
"#puerta .pu-o + .pu-campo{ margin-top:14px; }"+
"#puerta .pu-aviso{ margin:0 0 12px; padding:11px 14px; border-radius:14px; font-size:13px; line-height:1.45;"+
  " text-align:center; color:var(--t1); background:color-mix(in srgb,var(--warn) 16%,var(--bg)); }"+
"#puerta .pu-espera{ display:flex; justify-content:center; padding:24px 0 10px; }"+
"#puerta .pu-espera i{ width:34px; height:34px; border-radius:50%; border:3px solid color-mix(in srgb,var(--accent) 20%,transparent);"+
  " border-top-color:var(--accent); animation:puGira .9s linear infinite; }"+
"@keyframes puGira{ to{ transform:rotate(360deg); } }"+
/* el pie, compacto y pegado abajo: que no pise la animación de la bienvenida */
"#puerta .car-pie{ padding:0 20px calc(10px + env(safe-area-inset-bottom)); }"+
"#puerta .car-pie .pu-boton{ height:52px; }"+
"#puerta .car-pie .pu-google{ height:48px; margin-top:8px; }"+
"#puerta .car-pie .pu-enlace{ padding:9px 0 0; font-size:14px; }"+
"#puerta .car-pie .pu-aviso{ margin-bottom:8px; padding:9px 12px; font-size:12.5px; }"+
"@media (min-height:900px){ #puerta .car-tel{ max-width:244px; } }"+
"@media (max-height:700px){ #puerta .car-caja{ padding-top:9%; } #puerta .car-tel{ width:40%; } }";

/* ════════════════ bienvenida: la app en movimiento ════════════════
   Sin fotos. Cada lámina es un titular grande y una pieza real de la app
   que se anima sola cuando la lámina está delante. */
var CARRUSEL=[
  /* { marca:true },  la lámina de la marca («Palabras»): fuera de momento, falta decidir dónde va */
  { t:"Cuida <br>el cuerpo.",          s:"Ejercicio, sueño, pantallas y meditación. Un toque y apuntado.",   e:escenaGym },
  { t:"Una racha <br>que engancha.",   s:"Tres retos al día, XP y niveles. Si haces los tres, ×1,5.",   e:escenaRacha },
  { t:"Con <br>los tuyos.",            s:"Tu grupo, un objetivo en común y quién tira más del carro.",       e:escenaGrupo },
  { t:"Cada noche, <br>tu Parte del día.", s:"Un minuto: repasas el día, cómo te has sentido y lo que no quieres olvidar mañana.", e:escenaParte }
];
var LLAMA_BV='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.4c3.8 4.2 6 7.2 6 10.6a6 6 0 0 1-12 0c0-2.1.9-3.8 2.3-5.3-.1 1.5.4 2.5 1.2 3C9.8 7.5 10.6 5 12 2.4z"/></svg>';
var CHECK_BV='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>';

function marcaColor(){
  return '<div class="bv-marca">'+peakWM("var(--t1)")+'</div>';
}

function escenaHorario(){
  var filas=[["08:00","#d64545","Matemáticas","Aula 12"],["08:55","#0b8fa8","Geografía","Aula 8"],
             ["09:50","#c2740b","Historia de España","Aula 12"],["11:10","#7c5cd6","Filosofía","Aula 5"]];
  return '<div class="bv-lista">'+filas.map(function(f,i){
      return '<div class="bv-fila'+(i===1?" ahora":"")+'" style="--d:'+i+'">'+
        '<span class="bv-h num">'+f[0]+'</span><i style="background:'+f[1]+'"></i>'+
        '<div><b style="color:'+f[1]+'">'+f[2]+'</b><small>'+f[3]+'</small></div>'+
        (i===1?'<em>ahora</em>':'')+'</div>';
    }).join("")+
    '<div class="bv-examen"><span>Examen de Historia</span><b class="num">en 6 días</b></div>'+
  '</div>';
}
function escenaParte(){
  var filas=[["Retos","3 de 3"],["Hábitos","7 de 8"],["Agua","✓"]];
  var caras=["😫","😕","😐","🙂","😄"];
  return '<div class="bv-parte">'+
    '<div class="bv-pc"><span class="bv-pc-luna"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1z"/></svg></span>'+
      '<div><b class="display">Parte del día</b><small class="num">22:30 · un minuto</small></div></div>'+
    '<div class="bv-pl">'+filas.map(function(f,i){
      return '<div class="bv-pf" style="--d:'+i+'"><span class="bv-tick">'+CHECK_BV+'</span><span class="bv-pn2">'+f[0]+'</span><b class="num">'+f[1]+'</b></div>';
    }).join("")+'</div>'+
    '<p class="bv-pq">¿Qué tal el día?</p>'+
    '<div class="bv-caras">'+caras.map(function(c,i){ return '<span class="'+(i===3?"elegida":"")+'">'+c+'</span>'; }).join("")+'</div>'+
    '<div class="bv-phecho"><span>'+LLAMA_BV+'</span>Parte del día hecho <b class="num">+64 XP</b></div>'+
  '</div>';
}
function escenaGym(){
  var sem="", d=L10N.sem;
  for(var i=0;i<7;i++) sem+='<div class="bv-dia'+(i===2?" libre":"")+(i===6?" hoy":"")+'" style="--d:'+i+'"><i></i><span>'+d[i]+'</span></div>';
  return '<div class="bv-gym">'+
    '<div class="bv-gym-cab"><div><b class="display">Ejercicio</b><small>¿Has entrenado hoy?</small></div>'+
      '<span class="bv-cuenta num"><span class="a">5</span><span class="b">6</span></span></div>'+
    '<div class="bv-boton"><span class="a">He hecho ejercicio</span><span class="b">Hoy sí has entrenado ✓</span><span class="bv-xp">+20 XP</span><i class="bv-dedo"></i></div>'+
    '<div class="bv-semana">'+sem+'</div>'+
    /* debajo, el resto del cuerpo: entra cuando ya has marcado el ejercicio */
    '<div class="bv-cuerpo">'+[
      ['<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/>',"7 h 40","Sueño","var(--violet)",.86],
      ['<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/>',"1 h 50","Pantalla","var(--cyan)",.62],
      ['<path d="M12 19.5c-2.8-1.7-4.3-4.3-4.3-7.2 0-2.6 1.5-5.1 4.3-7.8 2.8 2.7 4.3 5.2 4.3 7.8 0 2.9-1.5 5.5-4.3 7.2z"/><path d="M7.9 10.6C5.8 10 3.9 10 2.5 10.6c.3 4.9 4.3 8.9 9.5 8.9"/><path d="M16.1 10.6c2.1-.6 4-.6 5.4 0-.3 4.9-4.3 8.9-9.5 8.9"/>',"10 min","Meditación","var(--accent)",.5]
    ].map(function(x,i){ return '<div class="bv-mini" style="--i:'+i+';--c:'+x[3]+';--p:'+x[4]+'">'+
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'+x[0]+'</svg>'+
      '<b class="num">'+x[1]+'</b><span>'+x[2]+'</span><i><em></em></i></div>'; }).join("")+'</div>'+
  '</div>';
}
function escenaRacha(){
  var R=46, C=(2*Math.PI*R).toFixed(1);
  var retos=["Leer diez páginas","Un minuto de plancha","Hacer la cama"];
  return '<div class="bv-racha">'+
    '<div class="bv-anillo"><svg viewBox="0 0 110 110"><circle cx="55" cy="55" r="'+R+'" fill="none" stroke="var(--fill-hi)" stroke-width="9"/>'+
      '<circle class="bv-arco" cx="55" cy="55" r="'+R+'" fill="none" stroke="var(--accent)" stroke-width="9" stroke-linecap="round" '+
      'stroke-dasharray="'+C+'" style="--c:'+C+'" transform="rotate(-90 55 55)"/></svg>'+
      '<div class="bv-num"><span class="bv-cuenta num"><span class="a">33</span><span class="b">34</span></span><i class="bv-fuego">'+LLAMA_BV+'</i></div></div>'+
    '<div class="bv-retos">'+retos.map(function(r,i){
      return '<div class="bv-reto" style="--d:'+i+'"><span class="bv-tick">'+CHECK_BV+'</span><span class="bv-rt">'+r+'</span><span class="bv-mas">+15</span></div>';
    }).join("")+'</div>'+
    '<div class="bv-bonus"><b class="num">×1,5</b><span>Los tres hechos</span></div>'+
  '</div>';
}
function escenaGrupo(){
  var gente=[["lucia","L",92,0,1],["marcos","M",80,1,2],["tú","C",94,2,0],["nerea","N",64,3,3]];
  return '<div class="bv-grupo">'+
    '<div class="bv-rank">'+gente.map(function(g){
      var yo=(g[0]==="tú");
      return '<div class="bv-pers'+(yo?" yo":"")+'" style="--de:'+g[3]+';--a:'+g[4]+'">'+
        '<span class="bv-cara">'+g[1]+'</span>'+
        '<div class="bv-pn"><b>'+g[0]+'</b><div class="bv-barra"><i style="--p:'+g[2]+'%"></i></div></div>'+
        '<span class="bv-pct num">'+g[2]+'%</span></div>';
    }).join("")+'</div>'+
    '<div class="bv-comun"><div class="bv-comun-t"><span>Objetivo del grupo</span><b class="num"><span class="bv-cuenta"><span class="a">18</span><span class="b">24</span></span> / 24</b></div>'+
      '<div class="bv-barra grande"><i></i></div></div>'+
  '</div>';
}

function laminaHTML(L, copia){
  /* la primera lámina es solo la marca: PEAK. en bandas que se mueven (peak-anim.js) */
  if(L.marca) return '<div class="car-lam bv-peak'+(copia?" copia":"")+'"><canvas class="bv-peak-c" aria-label="Peak."></canvas></div>';
  return '<div class="car-lam bv'+(copia?" copia":"")+'">'+
    '<div class="bv-cabeza">'+marcaColor()+
      '<h2 class="bv-t display">'+L.t+'</h2>'+
      '<p class="bv-s">'+esc(L.s)+'</p></div>'+
    '<div class="bv-escena">'+L.e()+'</div>'+
  '</div>';
}
function carHTML(){
  var n=CARRUSEL.length, laminas=laminaHTML(CARRUSEL[n-1],true), puntos="";
  for(var i=0;i<n;i++){
    laminas+=laminaHTML(CARRUSEL[i],false);
    puntos+='<span class="car-punto'+(i===carIdx?" on":"")+'" data-car="'+i+'"></span>';
  }
  laminas+=laminaHTML(CARRUSEL[0],true);
  return '<div class="car" id="car">'+
    '<div class="car-pista" id="car-pista">'+laminas+'</div>'+
    '<div class="car-puntos" id="car-puntos">'+puntos+'</div>'+
  '</div>';
}
var carUltimoOn=-1, carQuitaOn=null, carSaltando=false;
/* si la escena no cabe entre el texto y los puntos, se encoge entera (zoom) en vez de pisar el texto */
function carAjusta(){
  var es=document.querySelectorAll("#car-pista .bv-escena");
  for(var i=0;i<es.length;i++){
    var e=es[i], dentro=e.firstElementChild; if(!dentro) continue;
    dentro.style.zoom="";
    var cs=getComputedStyle(e), hueco=e.clientHeight-parseFloat(cs.paddingTop||0)-parseFloat(cs.paddingBottom||0);
    var alto=dentro.offsetHeight;
    if(hueco>40 && alto>hueco){ dentro.style.zoom=Math.max(.5, (hueco-4)/alto).toFixed(3); e.classList.add("apretada"); }
    else e.classList.remove("apretada");
  }
}
window.addEventListener("resize", function(){ carAjusta(); });
try{ document.fonts.ready.then(function(){ carAjusta(); }); }catch(e){}
function carMueve(pos, animar){
  var pista=document.getElementById("car-pista"); if(!pista) return;
  pista.style.transition = animar===false ? "none" : "";
  pista.style.transform = "translate3d("+(-pos*100)+"%,0,0)";
}
/* arranca la escena de la lámina real que está delante */
function carEnciende(){
  var pista=document.getElementById("car-pista"); if(!pista) return;
  var ls=pista.querySelectorAll(".car-lam"), pos=carIdx+1;
  if(carUltimoOn===carIdx && ls[pos] && ls[pos].classList.contains("on")) return;
  if(ls[pos]){ ls[pos].classList.remove("on"); void ls[pos].offsetWidth; ls[pos].classList.add("on"); carIdaVuelta(ls[pos]); }
  clearTimeout(carQuitaOn);
  carQuitaOn=setTimeout(function(){ for(var j=0;j<ls.length;j++) if(j!==pos) ls[j].classList.remove("on"); }, 650);
  carUltimoOn=carIdx;
}
function carPuntos(){
  var ps=document.querySelectorAll("#car-puntos .car-punto");
  for(var i=0;i<ps.length;i++) ps[i].className="car-punto"+(i===carIdx?" on":"");
}
function carPinta(animar){
  carAjusta();
  carMueve(carIdx+1, animar);
  carEnciende(); carPuntos();
}
var BV_CSS=[
'#puerta .car{ background:var(--bg); }',
'#puerta .bv-peak canvas{ position:absolute; inset:0; width:100%; height:100%; display:block; }',
'#puerta .bv-peak::after{ content:""; position:absolute; inset:auto 0 0 0; height:22%; pointer-events:none; background:linear-gradient(180deg, color-mix(in srgb,var(--bg) 0%,transparent), var(--bg) 85%); }',
'#puerta .car-lam.bv{ display:flex; flex-direction:column; padding:calc(env(safe-area-inset-top) + 26px) 26px 44px; }',
'#puerta .bv-marca{ display:flex; align-items:center; gap:8px; }',
'#puerta .bv-marca svg{ height:20px; width:auto; }',
'#puerta .bv-marca span{ font-size:19px; font-weight:800; letter-spacing:-.035em; color:var(--t1); }',
'#puerta .bv-t{ margin-top:30px; font-size:40px; font-weight:800; letter-spacing:-.045em; line-height:1.02; color:var(--t1); }',
'#puerta .bv-s{ margin-top:12px; font-size:15.5px; line-height:1.45; color:var(--t2); max-width:30ch; }',
'#puerta .bv-escena{ flex:1; min-height:0; display:flex; align-items:center; justify-content:center; padding-top:14px; }',
'#puerta .bv-escena > div{ width:100%; max-width:340px; }',
'#puerta .bv-escena.apretada{ align-items:flex-start; }',
'#puerta .car-puntos{ bottom:16px!important; }',
'#puerta .car-puntos .car-punto{ background:var(--fill-hi); }',
'#puerta .car-puntos .car-punto.on{ background:var(--accent); }',
'@media (max-height:720px){ #puerta .bv-t{ font-size:32px; margin-top:20px; } #puerta .bv-s{ font-size:14px; } }',

/* piezas comunes */
'#puerta .bv-cuenta{ position:relative; display:inline-grid; overflow:hidden; padding:.06em 0; margin:-.06em 0; vertical-align:bottom; }',
'#puerta .bv-cuenta > span{ grid-area:1/1; }',
'#puerta .bv .bv-cuenta .b{ opacity:0; transform:translateY(105%); }',
'#puerta .bv.on .bv-cuenta .a{ animation:bvSale .45s var(--ease) var(--t,1.3s) both; }',
'#puerta .bv.on .bv-cuenta .b{ animation:bvEntra .5s cubic-bezier(.2,.9,.3,1) calc(var(--t,1.3s) + .08s) both; }',
'@keyframes bvSale{ to{ opacity:0; transform:translateY(-105%); } }',
'@keyframes bvEntra{ from{ opacity:0; transform:translateY(105%); } to{ opacity:1; transform:none; } }',
'@keyframes bvSube{ from{ opacity:0; transform:translateY(16px); } to{ opacity:1; transform:none; } }',
'@keyframes bvPop{ 0%{ opacity:0; transform:scale(.6); } 70%{ opacity:1; transform:scale(1.06); } 100%{ opacity:1; transform:scale(1); } }',

/* 1 · horario */
'#puerta .bv-fila{ display:flex; align-items:center; gap:12px; padding:12px 12px; border-radius:16px; opacity:0; }',
'#puerta .bv-fila + .bv-fila{ margin-top:2px; }',
'#puerta .bv.on .bv-fila{ animation:bvSube .5s var(--ease) calc(.15s + var(--d)*.12s) both; }',
'#puerta .bv-fila i{ width:4px; height:32px; border-radius:4px; flex:0 0 auto; }',
'#puerta .bv-fila .bv-h{ width:40px; font-size:12.5px; color:var(--t3); flex:0 0 auto; }',
'#puerta .bv-fila div{ flex:1; min-width:0; display:flex; flex-direction:column; }',
'#puerta .bv-fila b{ font-size:15px; font-weight:700; }',
'#puerta .bv-fila small{ font-size:12px; color:var(--t3); }',
'#puerta .bv-fila em{ font-style:normal; font-size:11.5px; font-weight:700; padding:3px 9px; border-radius:99px; background:var(--accent); color:var(--on-accent); opacity:0; }',
'#puerta .bv.on .bv-fila.ahora{ animation:bvSube .5s var(--ease) .27s both, bvAhora .6s var(--ease) 1.05s both; }',
'#puerta .bv.on .bv-fila.ahora em{ animation:bvPop .45s var(--spring) 1.15s both; }',
'@keyframes bvAhora{ to{ background:var(--accent-soft); } }',
'#puerta .bv-examen{ display:flex; align-items:center; justify-content:space-between; margin-top:16px; padding:14px 16px; border-radius:18px; opacity:0;',
'  background:color-mix(in srgb,var(--warn) 14%,transparent); color:var(--warn); font-size:14px; font-weight:700; }',
'#puerta .bv-examen b{ font-size:15px; }',
'#puerta .bv.on .bv-examen{ animation:bvPop .55s var(--spring) 1.6s both; }',

/* parte del día */
'#puerta .bv-parte{ padding:18px 16px 16px; border-radius:24px; background:color-mix(in srgb,var(--violet) 10%,var(--bg)); box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--violet) 22%,transparent); }',
'#puerta .bv-pc{ display:flex; align-items:center; gap:12px; }',
'#puerta .bv-pc-luna{ width:44px; height:44px; border-radius:99px; display:grid; place-items:center; color:var(--violet); background:var(--bg); box-shadow:0 6px 16px -8px color-mix(in srgb,var(--violet) 60%,transparent); }',
'#puerta .bv-pc-luna svg{ width:20px; height:20px; }',
'#puerta .bv.on .bv-pc-luna{ animation:bvLunaOn .5s var(--ease) 2.3s both; }',
'@keyframes bvLunaOn{ to{ color:#fff; background:var(--violet); } }',
'#puerta .bv-pc b{ display:block; font-size:18px; font-weight:800; letter-spacing:-.03em; }',
'#puerta .bv-pc small{ font-size:12px; color:var(--t3); }',
'#puerta .bv-pl{ margin-top:14px; }',
'#puerta .bv-pf{ display:flex; align-items:center; gap:12px; padding:9px 2px; opacity:0; }',
'#puerta .bv-pf + .bv-pf{ box-shadow:inset 0 1px 0 var(--hairline); }',
'#puerta .bv.on .bv-pf{ animation:bvSube .45s var(--ease) calc(.15s + var(--d)*.16s) both; }',
'#puerta .bv-parte .bv-tick{ --tc:var(--violet); }',
'#puerta .bv.on .bv-pf .bv-tick{ animation:bvTickV .35s var(--spring) calc(.45s + var(--d)*.22s) forwards; }',
'@keyframes bvTickV{ 0%{ transform:scale(1); } 40%{ transform:scale(.75); } 100%{ transform:none; background:var(--violet); box-shadow:none; color:#fff; } }',
'#puerta .bv-pn2{ flex:1; font-size:14.5px; font-weight:600; }',
'#puerta .bv-pf b{ font-size:13px; font-weight:700; color:var(--t2); }',
'#puerta .bv-pq{ margin-top:12px; font-size:11px; font-weight:800; letter-spacing:.12em; text-transform:uppercase; color:var(--t3); opacity:0; }',
'#puerta .bv.on .bv-pq{ animation:bvSube .4s var(--ease) 1.05s both; }',
'#puerta .bv-caras{ display:flex; justify-content:space-between; margin-top:8px; }',
'#puerta .bv-caras span{ width:44px; height:44px; border-radius:99px; display:grid; place-items:center; font-size:22px; background:var(--fill); opacity:0; filter:grayscale(.5); }',
'#puerta .bv.on .bv-caras span{ animation:bvSube .35s var(--ease) 1.15s forwards; }',
'#puerta .bv.on .bv-caras span.elegida{ animation:bvSube .35s var(--ease) 1.15s forwards, bvCara .45s var(--spring) 1.7s forwards; }',
'@keyframes bvCara{ 0%{ transform:scale(1); } 45%{ transform:scale(1.25); } 100%{ transform:scale(1.12); filter:none; background:color-mix(in srgb,var(--violet) 20%,transparent); box-shadow:0 0 0 2px var(--violet); } }',
'#puerta .bv-phecho{ display:flex; align-items:center; gap:8px; margin-top:14px; padding:12px 14px; border-radius:16px; font-size:14px; font-weight:700;',
'  color:#fff; background:var(--violet); opacity:0; }',
'#puerta .bv-phecho span{ width:18px; height:18px; display:grid; }',
'#puerta .bv-phecho svg{ width:100%; height:100%; }',
'#puerta .bv-phecho b{ margin-left:auto; font-weight:800; }',
'#puerta .bv.on .bv-phecho{ animation:bvPop .5s var(--spring) 2.2s both; }',

/* 2 · gimnasio */
'#puerta .bv-gym{ position:relative; }',
'#puerta .bv-gym-cab{ display:flex; align-items:flex-start; justify-content:space-between; }',
'#puerta .bv-gym-cab b{ font-size:22px; font-weight:800; letter-spacing:-.03em; display:block; }',
'#puerta .bv-gym-cab small{ font-size:13px; color:var(--t3); }',
'#puerta .bv-gym-cab .bv-cuenta{ font-family:"Plus Jakarta Sans",sans-serif; font-size:34px; font-weight:800; letter-spacing:-.04em; line-height:1; --t:1.35s; }',
'#puerta .bv-boton{ position:relative; margin-top:18px; height:64px; border-radius:20px; display:grid; place-items:center; overflow:visible;',
'  background:var(--fill); box-shadow:inset 0 0 0 1px var(--hairline); font-size:18px; font-weight:800; font-family:"Plus Jakarta Sans",sans-serif; }',
'#puerta .bv-boton > span{ grid-area:1/1; }',
'#puerta .bv-boton .a{ color:var(--t2); }',
'#puerta{ --bv-sobre:#fff; }',
'html.dark #puerta{ --bv-sobre:#0e2419; }',
'#puerta .bv-boton .b{ color:var(--bv-sobre); opacity:0; }',
'#puerta .bv.on .bv-boton{ animation:bvGymOn .45s var(--spring) 1.1s both; }',
'#puerta .bv.on .bv-boton .a{ animation:bvFuera .2s linear 1.1s both; }',
'#puerta .bv.on .bv-boton .b{ animation:bvPop .45s var(--spring) 1.15s both; }',
'@keyframes bvGymOn{ 0%{ transform:scale(1); } 30%{ transform:scale(.95); }',
'  100%{ transform:scale(1); background:linear-gradient(145deg,var(--good),color-mix(in srgb,var(--good) 70%,var(--cyan)));',
'  box-shadow:0 12px 28px -10px color-mix(in srgb,var(--good) 65%,transparent); } }',
'@keyframes bvFuera{ to{ opacity:0; } }',
'#puerta .bv-dedo{ position:absolute; right:6%; bottom:-26px; width:44px; height:44px; border-radius:99px; opacity:0;',
'  background:color-mix(in srgb,var(--t1) 16%,transparent); box-shadow:0 0 0 2px color-mix(in srgb,var(--t1) 22%,transparent); }',
'#puerta .bv.on .bv-dedo{ animation:bvDedo 1.5s var(--ease) .25s both; }',
'@keyframes bvDedo{ 0%{ opacity:0; transform:translate(40px,50px); } 45%{ opacity:1; transform:translate(0,-10px); }',
'  58%{ transform:translate(0,-10px) scale(.8); } 70%{ opacity:1; transform:translate(0,-10px) scale(1); } 100%{ opacity:0; transform:translate(10px,10px); } }',
'#puerta .bv-xp{ position:absolute; right:16px; top:50%; margin-top:-10px; line-height:20px; font-size:13px; font-weight:800; color:var(--bv-sobre); opacity:0; }',
'#puerta .bv.on .bv-xp{ animation:bvXP 1.2s var(--ease) 1.2s both; }',
'@keyframes bvXP{ 0%{ opacity:0; transform:translateX(8px); } 25%{ opacity:.9; transform:none; } 70%{ opacity:.9; } 100%{ opacity:0; transform:translateY(-6px); } }',
'#puerta .bv-semana{ display:grid; grid-template-columns:repeat(7,1fr); gap:7px; margin-top:26px; }',
'#puerta .bv-dia{ display:flex; flex-direction:column; align-items:center; gap:6px; }',
'#puerta .bv-dia i{ width:100%; aspect-ratio:1; border-radius:11px; background:var(--fill-hi); display:block; }',
'#puerta .bv-dia span{ font-size:11px; color:var(--t3); }',
'#puerta .bv.on .bv-dia:not(.libre):not(.hoy) i{ animation:bvDia .35s var(--spring) calc(.2s + var(--d)*.1s) forwards; }',
'#puerta .bv.on .bv-dia.hoy i{ animation:bvDia .4s var(--spring) 1.3s forwards; }',
'#puerta .bv-dia.hoy span{ color:var(--t1); font-weight:800; }',
'@keyframes bvDia{ 0%{ transform:scale(1); } 40%{ transform:scale(.8); } 100%{ transform:none; background:var(--good); } }',
/* 2b · el resto del cuerpo, debajo de la semana (entra después del ejercicio) */
'#puerta .bv-cuerpo{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:22px; }',
'#puerta .bv-mini{ border-radius:16px; padding:11px 11px 10px; background:var(--fill); box-shadow:inset 0 0 0 1px var(--hairline-2); display:flex; flex-direction:column; gap:2px; opacity:0; transform:translateY(10px); }',
'#puerta .bv-mini svg{ width:18px; height:18px; color:var(--c); margin-bottom:4px; }',
'#puerta .bv-mini b{ font-family:"Plus Jakarta Sans",sans-serif; font-size:16px; font-weight:800; letter-spacing:-.02em; line-height:1.1; }',
'#puerta .bv-mini span{ font-size:11px; color:var(--t3); }',
'#puerta .bv-mini i{ display:block; height:4px; border-radius:99px; background:var(--fill-hi); margin-top:7px; overflow:hidden; }',
'#puerta .bv-mini em{ display:block; height:100%; width:0; border-radius:99px; background:var(--c); }',
'#puerta .bv.on .bv-mini{ animation:bvMini .5s var(--spring) calc(1.75s + var(--i)*.14s) forwards; }',
'#puerta .bv.on .bv-mini em{ animation:bvBarra .8s var(--ease) calc(2s + var(--i)*.14s) forwards; }',
'@keyframes bvMini{ to{ opacity:1; transform:none; } }',
'@keyframes bvBarra{ to{ width:calc(var(--p) * 100%); } }',

/* 3 · racha */
'#puerta .bv-racha{ display:flex; flex-direction:column; align-items:center; }',
'#puerta .bv-anillo{ position:relative; width:148px; height:148px; }',
'#puerta .bv-anillo svg{ width:100%; height:100%; }',
'#puerta .bv-arco{ stroke-dashoffset:var(--c); }',
'#puerta .bv.on .bv-arco{ animation:bvArco 1.6s var(--ease) .2s both; }',
'@keyframes bvArco{ to{ stroke-dashoffset:0; } }',
'#puerta .bv-num{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; gap:2px; padding-left:6px; }',
'#puerta .bv-num .bv-cuenta{ font-family:"Plus Jakarta Sans",sans-serif; font-size:42px; font-weight:800; letter-spacing:-.05em; line-height:1; --t:1.7s; }',
'#puerta .bv-num .bv-fuego{ width:36px; height:36px; display:block; color:var(--warn); transform-origin:50% 90%; margin-top:7px; }',
'#puerta .bv-num .bv-fuego svg{ width:100%; height:100%; display:block; }',
'#puerta .bv.on .bv-num .bv-fuego{ animation:bvLlama .6s var(--spring) 1.7s both; }',
'@keyframes bvLlama{ 0%{ transform:scale(.9); } 45%{ transform:scale(1.35) rotate(-6deg); } 100%{ transform:none; } }',
'#puerta .bv-retos{ width:100%; margin-top:18px; }',
'#puerta .bv-reto{ display:flex; align-items:center; gap:12px; padding:10px 2px; }',
'#puerta .bv-reto + .bv-reto{ box-shadow:inset 0 1px 0 var(--hairline); }',
'#puerta .bv-tick{ width:22px; height:22px; border-radius:99px; display:grid; place-items:center; box-shadow:inset 0 0 0 1.5px var(--hairline); color:transparent; flex:0 0 auto; }',
'#puerta .bv-tick svg{ width:12px; height:12px; }',
'#puerta .bv.on .bv-tick{ animation:bvTick .35s var(--spring) calc(.45s + var(--d)*.35s) forwards; }',
'@keyframes bvTick{ 0%{ transform:scale(1); } 40%{ transform:scale(.75); } 100%{ transform:none; background:var(--accent); box-shadow:none; color:var(--on-accent); } }',
'#puerta .bv-rt{ flex:1; font-size:14.5px; font-weight:600; }',
'#puerta .bv-mas{ font-size:12px; font-weight:800; padding:3px 9px; border-radius:99px; color:var(--good); background:color-mix(in srgb,var(--good) 15%,transparent); opacity:0; }',
'#puerta .bv.on .bv-mas{ animation:bvPop .4s var(--spring) calc(.55s + var(--d)*.35s) both; }',
'#puerta .bv-bonus{ width:100%; display:flex; align-items:center; gap:12px; margin-top:12px; padding:13px 16px; border-radius:18px;',
'  background:var(--fill); color:var(--t3); font-size:13.5px; font-weight:600; }',
'#puerta .bv-bonus b{ font-family:"Plus Jakarta Sans",sans-serif; font-size:19px; font-weight:800; }',
'#puerta .bv.on .bv-bonus{ animation:bvBonus .5s var(--spring) 1.65s both; }',
'@keyframes bvBonus{ 0%{ transform:scale(1); } 40%{ transform:scale(1.04); }',
'  100%{ transform:scale(1); color:var(--bv-sobre); background:linear-gradient(145deg,var(--good),color-mix(in srgb,var(--good) 70%,var(--cyan)));',
'  box-shadow:0 10px 26px -10px color-mix(in srgb,var(--good) 60%,transparent); } }',

/* 4 · grupo */
'#puerta .bv-rank{ position:relative; height:232px; }',
'#puerta .bv-pers{ position:absolute; left:0; right:0; top:0; height:54px; display:flex; align-items:center; gap:12px; padding:0 4px;',
'  transform:translateY(calc(var(--de)*58px)); }',
'#puerta .bv.on .bv-pers{ animation:bvMueve .75s cubic-bezier(.45,0,.2,1) 1.3s both; }',
'#puerta .bv-pers.yo{ z-index:2; border-radius:16px; }',
'#puerta .bv.on .bv-pers.yo{ animation:bvMueve .75s cubic-bezier(.45,0,.2,1) 1.3s both, bvAlza .75s ease 1.3s both; }',
'@keyframes bvAlza{ 0%,100%{ background:transparent; box-shadow:none; } 25%,75%{ background:var(--bg); box-shadow:0 12px 26px -12px rgba(0,0,0,.35), 0 0 0 1px var(--hairline); } }',
'@keyframes bvMueve{ from{ transform:translateY(calc(var(--de)*58px)); } to{ transform:translateY(calc(var(--a)*58px)); } }',
'#puerta .bv-cara{ width:38px; height:38px; border-radius:99px; display:grid; place-items:center; font-weight:800; font-size:16px;',
'  background:var(--accent-soft); color:var(--accent); flex:0 0 auto; font-family:"Plus Jakarta Sans",sans-serif; }',
'#puerta .bv-pers.yo .bv-cara{ background:var(--accent); color:var(--on-accent); }',
'#puerta .bv-pn{ flex:1; min-width:0; }',
'#puerta .bv-pn b{ font-size:15px; font-weight:700; }',
'#puerta .bv-pers.yo .bv-pn b{ font-weight:800; }',
'#puerta .bv-barra{ height:5px; border-radius:99px; background:var(--fill-hi); overflow:hidden; margin-top:6px; }',
'#puerta .bv-barra i{ display:block; height:100%; width:var(--p); border-radius:99px; background:var(--accent); }',
'#puerta .bv-pers.yo .bv-barra i{ width:71%; }',
'#puerta .bv.on .bv-pers.yo .bv-barra i{ animation:bvCrece .9s var(--ease) .5s both; }',
'@keyframes bvCrece{ to{ width:var(--p); } }',
'#puerta .bv-pct{ font-size:16px; font-weight:800; width:46px; text-align:right; }',
'#puerta .bv-pers.yo .bv-pct{ color:var(--accent); }',
'#puerta .bv-comun{ margin-top:14px; padding:16px; border-radius:20px; color:#fff;',
'  background:linear-gradient(155deg, color-mix(in srgb,var(--accent) 88%,#000) 0%, var(--accent) 55%, var(--grad-2) 100%); }',
'html.dark:not([class*="acento-"]):not(.oro) #puerta .bv-comun{ background:linear-gradient(155deg,#3b35b8 0%,#5048e0 55%,#7a5ad8 100%); }',
'#puerta .bv-comun-t{ display:flex; justify-content:space-between; align-items:baseline; font-size:13px; font-weight:700; }',
'#puerta .bv-comun-t b{ font-family:"Plus Jakarta Sans",sans-serif; font-size:20px; font-weight:800; }',
'#puerta .bv-comun .bv-cuenta{ --t:1.9s; }',
'#puerta .bv-barra.grande{ height:8px; margin-top:10px; background:rgba(255,255,255,.25); }',
'#puerta .bv-barra.grande i{ width:75%; background:#fff; }',
'#puerta .bv.on .bv-barra.grande i{ animation:bvLlena .7s var(--ease) 1.9s both; }',
'@keyframes bvLlena{ to{ width:100%; } }',
'@media (prefers-reduced-motion:reduce){ #puerta .bv *{ animation-duration:.01s!important; animation-delay:0s!important; } }'
].join("\n");

function carVa(i){
  if(carSaltando) return;
  var n=CARRUSEL.length;
  if(i>=n || i<0){
    var copia = i>=n ? n+1 : 0, real = i>=n ? 0 : n-1;
    carIdx=real; carPuntos();
    carMueve(copia, true);
    carSaltando=true;
    setTimeout(function(){
      carMueve(real+1, false);
      var pista=document.getElementById("car-pista"); if(pista) void pista.offsetWidth;
      carSaltando=false;
      carEnciende();
    }, 560);
    return;
  }
  carIdx=i; carPinta(true);
}
BV_CSS+="\n#puerta .car-pista{ transition:transform .55s var(--spring), opacity .26s var(--ease); }"+
  "\n#puerta .car-pista.fundido{ opacity:1; }"+
  "\n@media (max-height:720px){ #puerta .bv-marca{ display:none; } #puerta .bv-t{ font-size:28px; margin-top:0; } #puerta .bv-t br{ display:none; } #puerta .bv-s{ font-size:13.5px; margin-top:6px; } #puerta .car-lam.bv{ padding:calc(env(safe-area-inset-top) + 14px) 22px 30px; } #puerta .bv-escena{ padding-top:8px; } #puerta .car-puntos{ bottom:10px!important; } }\n@media (max-height:640px){ #puerta .bv-s{ display:none; } #puerta .bv-retos{ margin-top:8px; } #puerta .bv-reto{ padding:6px 2px; } #puerta .bv-bonus{ margin-top:8px; padding:10px 14px; } #puerta .bv-fila{ padding:8px 12px; } #puerta .bv-examen{ margin-top:10px; padding:11px 14px; } #puerta .bv-comun{ margin-top:6px; } #puerta .car-pie .pu-nota{ display:none; } #puerta .car-pie .pu-enlace{ padding-top:8px; } #puerta .bv-semana{ margin-top:18px; } }";

/* cada escena se reproduce entera, se queda un momento quieta, se funde,
   vuelve al principio sin que se vea y empieza otra vez: un bucle limpio */
var carPP=null, carRAF=0, CAR_PAUSA_FIN=1600;
function carIdaVuelta(lam){
  clearTimeout(carPP); cancelAnimationFrame(carRAF);
  var todas=document.querySelectorAll("#car-pista .bv-escena"); for(var k=0;k<todas.length;k++) todas[k].style.opacity="";
  if(!lam || !lam.getAnimations) return;
  var esc=lam.querySelector(".bv-escena") || lam;
  var as=lam.getAnimations({subtree:true}); if(!as.length) return;
  var fin=0;
  for(var i=0;i<as.length;i++){ try{ var ct=as[i].effect.getComputedTiming(); if(ct.endTime>fin) fin=ct.endTime; }catch(e){} }
  fin=Math.min(fin, 6000);
  esc.style.transition="opacity .45s ease";
  function vuelta(){
    carPP=setTimeout(function(){
      if(!lam.classList.contains("on")) return;
      esc.style.opacity="0";
      carPP=setTimeout(function(){
        if(!lam.classList.contains("on")) { esc.style.opacity=""; return; }
        var bs=lam.getAnimations({subtree:true});
        for(var j=0;j<bs.length;j++){ try{ bs[j].cancel(); bs[j].play(); }catch(e){} }
        esc.style.opacity="1";
        vuelta();
      }, 480);
    }, fin+CAR_PAUSA_FIN);
  }
  vuelta();
}

