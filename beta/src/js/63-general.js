/* ════════ General (oct 2026) ════════
   La pestaña de inicio pasa a ser «General»: un panel que resume Cuerpo, Mente,
   Retos y Social. Sigue la referencia que mandó Carlos el 17/10: PEAK. y tu foto
   arriba, fecha, «Buenos días, tu mejor versión» con la montaña a la derecha,
   «Tu progreso de hoy» con cuatro anillos, tu intención de hoy, tus hábitos en
   tarjetas y el siguiente reto. Debajo sigue lo que ya había (Parte del día,
   Estudiar, Tu semana, Tu evolución).
   La barra de abajo queda General · Cuerpo · Mente · Retos · Social, en la
   barra de siempre (tinta y burbuja).
   Envuelve hoyNuevo (56), hnAlinea y hnAvatar. Todo sale de S (y de GRUPO). */

var GN_ICO={
  general:'<rect class="r" x="3.5" y="3.5" width="7" height="7" rx="2"/><rect class="r" x="13.5" y="3.5" width="7" height="7" rx="2"/><rect class="r" x="3.5" y="13.5" width="7" height="7" rx="2"/><rect class="r" x="13.5" y="13.5" width="7" height="7" rx="2"/>',
  cuerpo:'<circle cx="15.2" cy="4.6" r="1.9"/><path d="M8 10.2l2.6-2.3 3.4.3 2 3.3 3 .8M14 8.2l-1.6 5.1 3.1 2.6-.9 4.6M12.4 13.3l-2 3.3-4.2 1.2"/>',
  mente:'<path d="M12 5.4c-.7-.8-1.6-1.2-2.6-1.2A2.6 2.6 0 0 0 6.8 6.6 2.9 2.9 0 0 0 4.8 9.4c0 .6.2 1.2.5 1.7a3.1 3.1 0 0 0 .9 4.9 2.8 2.8 0 0 0 3 3c1 0 1.9-.4 2.8-1.1zM12 5.4c.7-.8 1.6-1.2 2.6-1.2a2.6 2.6 0 0 1 2.6 2.4 2.9 2.9 0 0 1 2 2.8c0 .6-.2 1.2-.5 1.7a3.1 3.1 0 0 1-.9 4.9 2.8 2.8 0 0 1-3 3c-1 0-1.9-.4-2.8-1.1zM12 5.4v12.5M8.6 9.2c.9 0 1.7.6 2 1.4M15.4 9.2c-.9 0-1.7.6-2 1.4M8.2 13.6c1 .2 1.8.9 2 1.8M15.8 13.6c-1 .2-1.8.9-2 1.8"/>',
  retos:'<circle cx="11" cy="13" r="7.5"/><circle cx="11" cy="13" r="4"/><circle cx="11" cy="13" r=".6" fill="currentColor"/><path d="M11 13l8-8M15.6 5.2v3.2h3.2M19 5l1.5-1.5"/>',
  social:'<circle cx="9" cy="8" r="3.1"/><path d="M3.3 19.3c0-3.2 2.6-5.4 5.7-5.4s5.7 2.2 5.7 5.4"/><circle cx="16.6" cy="8.6" r="2.5"/><path d="M15.9 13.9c2.9-.2 5 1.7 5 4.6"/>',
  hoja:'<path d="M5.5 18.5C5.5 10 10.5 5 19 5c0 8.5-5 13.5-13.5 13.5z"/><path d="M5.5 18.5l8-8"/>',
  flecha:'<path d="M5 12h14M13.5 6.5 19 12l-5.5 5.5"/>',
  estrella:'<path fill="currentColor" stroke="none" d="M12 3.6l2.5 5.2 5.6.7-4.1 3.9 1 5.6L12 16.3 7 19l1-5.6-4.1-3.9 5.6-.7z"/>',
  luna:'<path d="M19.5 14.6A7.6 7.6 0 0 1 9.4 4.5a7.6 7.6 0 1 0 10.1 10.1z"/>',
  zapa:'<path d="M3 16.5V10.8c1.4.4 2.5.4 3.5-.1l1.4 2.4c1.6.5 3.4.6 5 .3l4.4.9c1.8.4 3.2 1.4 3.7 3.2v1H3z"/><path d="M3 17.5h17.9M9.6 11.6l1.3-1.1M11.6 12.6l1.3-1.1"/>',
  pesa:'<path d="M6.5 7.5v9M17.5 7.5v9M4 10v4M20 10v4M6.5 12h11"/>',
  gota:'<path d="M12 3.8c3 3.8 5.4 6.9 5.4 9.9a5.4 5.4 0 0 1-10.8 0c0-3 2.4-6.1 5.4-9.9z"/>',
  libro:'<path d="M12 6.6C10 5.1 7 4.7 3.5 5.1v12.8c3.5-.4 6.5 0 8.5 1.5 2-1.5 5-1.9 8.5-1.5V5.1C17 4.7 14 5.1 12 6.6zM12 6.6v12.8"/>',
  movil:'<rect x="7" y="3" width="10" height="18" rx="2.4"/><path d="M11 18h2"/>',
  sol:'<circle cx="12" cy="12" r="3.8"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
  loto:'<path d="M12 18.5c-2.6-1.6-4-4-4-6.7 0-2.4 1.4-4.7 4-7.2 2.6 2.5 4 4.8 4 7.2 0 2.7-1.4 5.1-4 6.7zM8.2 10.2c-1.9-.5-3.6-.5-4.9 0 .3 4.5 3.9 8.3 8.7 8.3M15.8 10.2c1.9-.5 3.6-.5 4.9 0-.3 4.5-3.9 8.3-8.7 8.3"/>',
  persona:'<circle cx="12" cy="8.2" r="3.6"/><path d="M5 20c.6-3.8 3.4-6 7-6s6.4 2.2 7 6"/>'
};
function gnSvg(k, cls){ return '<svg class="'+(cls||"")+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+GN_ICO[k]+'</svg>'; }

/* las cuatro áreas: color, pestaña y lo que cuenta en cada una */
var GN_AREAS=[
  { k:"cuerpo", n:"Cuerpo", tab:"vital",     ico:"cuerpo" },
  { k:"mente",  n:"Mente",  tab:"academico", ico:"mente" },
  { k:"retos",  n:"Retos",  tab:"retos",     ico:"retos" },
  { k:"social", n:"Social", tab:"social",    ico:"social" }
];

/* a qué área y tipo pertenece un hábito, por sus palabras (y si no, por su etiqueta) */
function gnSinTilde(s){ return String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,""); }
var GN_TIPOS=[
  [/movil|pantalla|redes|instagram|tiktok|scroll/, "mente","Desconexión","movil","arena"],
  [/medit|respir|diario|gratitud|calma/,           "mente","Calma","loto","lavanda"],
  [/leer|libro|lectura|pagina/,                    "mente","Enfoque","libro","arena"],
  [/estudi|repaso|deberes|examen|clase|mochila/,   "mente","Estudio","mente","lavanda"],
  [/cama|dormir|sueno|siesta|acost/,               "cuerpo","Descanso","luna","salvia"],
  [/levant|madrug|despert/,                        "cuerpo","Descanso","sol","salvia"],
  [/pasos|camin|andar|correr|bici|escaler|nadar|cardio|paseo/, "cuerpo","Movimiento","zapa","verde"],
  [/sentadill|flexion|gym|gimnas|entren|pesas|abdominal|fuerza|plancha|dominad/, "cuerpo","Fuerza","pesa","lavanda"],
  [/estira|yoga|movilidad/,                        "cuerpo","Movilidad","cuerpo","salvia"],
  [/agua|beber|hidrat/,                            "cuerpo","Hidratación","gota","verde"],
  [/desayun|comer|comida|cena|fruta|verdura|protein|dieta/, "cuerpo","Alimentación","hoja","arena"],
  [/amig|llamar|famil|mensaje|quedar|abuel/,       "social","Conexión","social","verde"]
];
function gnTipo(it){
  var s=gnSinTilde(it.text);
  for(var i=0;i<GN_TIPOS.length;i++) if(GN_TIPOS[i][0].test(s)) return { area:GN_TIPOS[i][1], sub:GN_TIPOS[i][2], ico:GN_TIPOS[i][3], tono:GN_TIPOS[i][4] };
  if(it.tag==="vital") return { area:"cuerpo", sub:"Bienestar", ico:"cuerpo", tono:"salvia" };
  if(it.tag==="estudio") return { area:"mente", sub:"Estudio", ico:"mente", tono:"lavanda" };
  return { area:"mente", sub:"Personal", ico:"hoja", tono:"arena" };
}

/* lo de cada área hoy: una lista de cosas, hechas o no. Los anillos y «Ver detalle» salen de aquí */
function gnDatos(t){
  var h=(S.habits&&S.habits[t])||{}, cks=checksOf(t), habs=ordenIdeal(idealActivos());
  var A={ cuerpo:[], mente:[], retos:[], social:[] };
  A.cuerpo.push({ txt:"Entrenar", ok:wentGym(t) });
  A.cuerpo.push({ txt:"8 vasos de agua", ok:(h.water||0)>=8 });
  A.cuerpo.push({ txt:"Dormir 7 horas", ok:(h.sleep||0)>=7 });
  A.cuerpo.push({ txt:"Menos de 2 h de pantalla", ok:h.screen!=null && h.screen>0 && h.screen<2 });
  A.mente.push({ txt:"Meditar", ok:(h.medita||0)>0 });
  A.mente.push({ txt:"Estudiar o aprender algo", ok:(typeof estudioMinDia==="function" && estudioMinDia(t)>0) });
  A.mente.push({ txt:"Parte del día", ok:!!(S.parte&&S.parte[t]) });
  habs.forEach(function(it){
    var tp=gnTipo(it); (A[tp.area]||A.mente).push({ txt:it.text, ok:cks.indexOf(it.id)>=0, act:"check", id:it.id });
  });
  var hechos=chOf(t);
  todaysChallenges(t).forEach(function(c){ A.retos.push({ txt:c.text, ok:hechos.indexOf(c.id)>=0, act:"ch", id:c.id }); });
  if(typeof GRUPO!=="undefined" && GRUPO && GRUPO.miembros) GRUPO.miembros.forEach(function(m){
    if(m.usuario===GRUPO.yo) return;
    A.social.push({ txt:"@"+m.usuario+(m.retos>0?" · "+m.retos+(m.retos===1?" reto hoy":" retos hoy"):" · aún nada hoy"), ok:(m.retos||0)>0 });
  });
  return A;
}

var GN_INTENCIONES=[
  ["Sal a caminar diez minutos sin el móvil.", "vital"],
  ["Escribe a alguien a quien echas de menos.", "social"],
  ["Respira hondo un minuto antes de empezar.", "academico"],
  ["Dedica 10 minutos a algo que te haga bien.", "academico"],
  ["Bebe un vaso de agua antes de cada comida.", "vital"],
  ["Termina hoy algo que llevas días aplazando.", "retos"],
  ["Esta noche, a la cama sin pantallas.", "vital"]
];
function gnIntencion(t){
  var d=new Date(t+"T00:00:00"), ini=new Date(d.getFullYear(),0,0), n=Math.round((d-ini)/864e5);
  return GN_INTENCIONES[n%GN_INTENCIONES.length];
}

/* los anillos se animan desde donde estaban */
var gnAntes={}, gnTodos=false, gnHoja=null;
function gnAnillo(a, hechos, total){
  var C=2*Math.PI*30, f=total?Math.min(1,hechos/total):0, prev=gnAntes[a.k]!=null?gnAntes[a.k]:f;
  gnAntes[a.k]=f;
  return '<button class="gn-an gn-'+a.k+'" data-act="x-gn-area" data-k="'+a.k+'" aria-label="'+a.n+': '+hechos+' de '+total+'">'+
    '<span class="gn-ani"><svg viewBox="0 0 68 68"><circle class="gn-pista" cx="34" cy="34" r="30"/>'+
      '<circle class="gn-arco" cx="34" cy="34" r="30" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+(C*(1-prev)).toFixed(1)+'" data-to="'+(C*(1-f)).toFixed(1)+'"/></svg>'+
      gnSvg(a.ico, "gn-aico")+'</span>'+
    '<b class="num">'+(total?hechos+"/"+total:"—")+'</b><small>'+a.n+'</small></button>';
}

function gnPinta(st){
  var box=document.getElementById("hoy"); if(!box) return;
  document.documentElement.classList.add("gen");
  gnEtiquetas();
  var t=today(), d=new Date(t+"T00:00:00"), hh=new Date().getHours(), A=gnDatos(t);
  var fecha=["DOM","LUN","MAR","MIÉ","JUE","VIE","SÁB"][d.getDay()]+" "+d.getDate()+" "+["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"][d.getMonth()];
  var saludo=(hh>=6&&hh<14)?"Buenos días,":(hh>=14&&hh<21)?"Buenas tardes,":"Buenas noches,";
  var habs=ordenIdeal(idealActivos()), cks=checksOf(t);
  var nHab=cks.filter(function(id){ return habs.some(function(x){ return x.id===id; }); }).length;
  var pendRetos=A.retos.filter(function(x){ return !x.ok; });
  var frase = ((hh>=21||hh<5) && !(S.parte&&S.parte[t])) ? "Te queda el Parte del día: un minuto y a dormir."
    : (habs.length && nHab>=habs.length && !pendRetos.length) ? "Todo hecho hoy. Esa es tu mejor versión."
    : (nHab || A.retos.length-pendRetos.length) ? "Vas bien. Sigue con lo que te hace bien."
    : "Hoy es un buen día para cuidar lo que te hace bien.";
  var intn=gnIntencion(t);

  var anillos=GN_AREAS.map(function(a){
    var l=A[a.k]; return gnAnillo(a, l.filter(function(x){ return x.ok; }).length, l.length);
  }).join("");

  /* hábitos: en su orden, con el número de puesto; los hechos se quedan donde están */
  var tope=4, corta=!gnTodos && habs.length>tope, ver=corta?habs.slice(0,tope):habs;
  var filas=ver.map(function(it,i){
    var tp=gnTipo(it), ok=cks.indexOf(it.id)>=0;
    return '<button class="gn-h'+(ok?" ok":"")+'" data-act="check" data-id="'+it.id+'" data-day="'+t+'" aria-pressed="'+ok+'">'+
      '<i class="num">'+(i<9?"0":"")+(i+1)+'</i><span class="gn-hic t-'+tp.tono+'">'+gnSvg(tp.ico)+'</span>'+
      '<span class="gn-htx"><b>'+esc(it.text)+'</b><small>'+(tp.area==="cuerpo"?"Cuerpo":tp.area==="social"?"Social":"Mente")+" · "+tp.sub+'</small></span>'+
      '<span class="gn-ck" aria-hidden="true"></span></button>';
  }).join("");
  var masHab = corta ? '<button class="gn-mas" data-act="x-gn-todos">Ver '+(habs.length-tope)+' más</button>'
    : (gnTodos && habs.length>tope) ? '<button class="gn-mas" data-act="x-gn-todos">Ver menos</button>' : "";
  if(habs.length) masHab='<div class="gn-pie">'+(masHab||'<span></span>')+'<button class="gn-mas gn-edit" data-act="edit-ideal">Editar hábitos</button></div>';

  var sig=pendRetos[0], reto = sig
    ? '<button class="gn-reto" data-act="x-gn-retos"><span class="gn-rst">'+gnSvg("estrella")+'</span><span class="gn-rtx"><small>Siguiente reto</small><b>'+esc(sig.txt)+'</b></span>'+gnSvg("flecha","gn-fl")+'</button>'
    : A.retos.length ? '<button class="gn-reto ok" data-act="x-gn-retos"><span class="gn-rst">'+gnSvg("estrella")+'</span><span class="gn-rtx"><small>Retos de hoy</small><b>Los '+A.retos.length+' hechos. Bien.</b></span>'+gnSvg("flecha","gn-fl")+'</button>' : '';

  var hd=document.getElementById("hero-date"); if(hd) hd.textContent=fecha;

  box.innerHTML=
    '<header class="gn-cab">'+
      '<div class="gn-monte" aria-hidden="true">'+gnMontana()+'</div>'+
      '<p class="gn-logo" id="gn-logo">PEAK.</p>'+
      '<p class="gn-fecha">'+fecha+'</p>'+
      '<h1 class="gn-tit">'+saludo+'<br>tu mejor versión</h1><i class="gn-raya"></i>'+
      '<p class="gn-frase">'+esc(frase)+'</p>'+
    '</header>'+
    '<section class="gn-prog">'+
      '<div class="gn-sec"><h2>Tu progreso de hoy</h2><button data-act="x-gn-detalle">Ver detalle'+gnSvg("flecha")+'</button></div>'+
      '<div class="gn-anillos">'+anillos+'</div>'+
      '<button class="gn-int" data-jump="'+intn[1]+'"><span class="gn-hoja">'+gnSvg("hoja")+'</span>'+
        '<span class="gn-itx"><small>Tu intención de hoy</small><b>'+esc(intn[0])+'</b></span>'+gnSvg("flecha","gn-fl")+'</button>'+
    '</section>'+
    '<div class="gn-sec gn-sec2" id="hn-habitos"><h2>Tus hábitos de hoy</h2><button data-act="x-gn-vertodos">Ver todos'+gnSvg("flecha")+'</button></div>'+
    (habs.length ? '<div class="gn-habs">'+filas+'</div>'+masHab
      : '<button class="gn-vacio" data-act="edit-ideal">Añade los hábitos que quieres cumplir cada día</button>')+
    reto+
    gnMasDeHoy(t);

  /* los anillos, a su sitio nuevo */
  requestAnimationFrame(function(){ requestAnimationFrame(function(){
    box.querySelectorAll(".gn-arco").forEach(function(c){ c.style.strokeDashoffset=c.dataset.to; });
  }); });
  if(gnHoja && !document.getElementById("sheet").hidden) gnAbreHoja(gnHoja);
  requestAnimationFrame(hnAlinea);
}

/* lo que ya había en Hoy sigue debajo: Parte del día, Estudiar y Tu semana */
function gnMasDeHoy(t){
  var est=S.estudio && S.estudio.actual, estSub, estAct="x-estudiar";
  if(est){
    var rest=Math.max(0, est.fin ? est.fin-Date.now() : (est.resto||0)), mm=Math.floor(rest/60000), ss=Math.floor(rest%60000/1000);
    estSub='<b class="num" id="hy-est-t">'+(est.fase==="listo"?"✓":(mm<10?"0":"")+mm+":"+(ss<10?"0":"")+ss)+'</b>'; estAct="x-hoy-estudio";
  } else { var min=estudioMinDia(t); estSub=min ? esc(horasTxt(min))+" hoy" : "Pomodoro · 25 min"; }
  var parteHecho=!!(S.parte && S.parte[t]), hh=new Date().getHours();
  var sem=resumenSemana(lunesDe(t)), tope=Math.max.apply(null, sem.porDia.concat([1]));
  var barras=sem.dias.map(function(d,i){
    var x=sem.porDia[i];
    return '<div class="'+(d===t?"hoy":x>0?"on":"")+'"><em class="num">'+(x>0?x:"")+'</em><i style="height:'+(x>0?Math.max(8, Math.round(x/tope*72)):3)+'px"></i><span>'+"LMXJVSD".charAt(i)+'</span></div>';
  }).join("");
  var estudia=prefValor("academico"), vacia=!sem.xp && !sem.porDia.some(function(x){ return x>0; });
  return '<div class="gn-sec gn-sec2"><h2>Más de hoy</h2></div>'+
    '<div class="hn-dos gn-dos'+(estudia?"":" gn-solo")+'">'+
      '<button class="hn-card neg'+(parteHecho?" ok":"")+'" data-act="parte"><span class="hn-ic">'+gnSvg("luna")+'</span>'+
        '<span><b>Parte del día</b><small>'+(parteHecho?"Hecho. Buenas noches":(hh>=19||hh<4)?"Ahora · 1 min":"Esta noche · 1 min")+'</small></span></button>'+
      (estudia ? '<button class="hn-card" data-act="'+estAct+'"><span class="hn-ic"><svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/></svg></span>'+
        '<span><b>'+(est?"Estudiando":"Estudiar")+'</b><small>'+estSub+'</small></span></button>' : '')+
    '</div>'+
    '<div class="gn-sec gn-sec2"><h2>Tu semana</h2><span class="num">+'+sem.xp+' XP</span></div>'+
    (vacia ? '<p class="gn-semvacia">Marca tu primer hábito y aquí empieza tu semana 📈</p>' : '<div class="hn-sem">'+barras+'</div>');
}

/* la montaña de la cabecera: roca en grises con relieve, un sol de arena detrás y la base fundida con el fondo */
function gnMontana(){
  return '<svg viewBox="0 0 240 230" preserveAspectRatio="xMaxYMax meet">'+
    '<defs>'+
      '<filter id="gn-roca" x="0" y="0" width="100%" height="100%">'+
        '<feTurbulence type="fractalNoise" baseFrequency="0.12 0.04" numOctaves="5" seed="7" result="n"/>'+
        '<feDiffuseLighting in="n" surfaceScale="6" lighting-color="#fff" result="l"><feDistantLight azimuth="235" elevation="50"/></feDiffuseLighting>'+
        '<feColorMatrix in="l" type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0" result="g"/>'+
        '<feComposite in="g" in2="SourceGraphic" operator="in" result="tex"/>'+
        '<feBlend in="tex" in2="SourceGraphic" mode="multiply"/>'+
      '</filter>'+
      '<linearGradient id="gn-tono" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E4E1DA"/><stop offset=".55" stop-color="#A39F97"/><stop offset="1" stop-color="#55524D"/></linearGradient>'+
      '<linearGradient id="gn-funde" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".22" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff"/></linearGradient>'+
      '<mask id="gn-mask"><rect width="240" height="230" fill="url(#gn-funde)"/></mask>'+
    '</defs>'+
    '<circle class="gn-sol" cx="138" cy="72" r="58"/>'+
    '<g mask="url(#gn-mask)">'+
      '<path filter="url(#gn-roca)" fill="url(#gn-tono)" d="M0 230 L28 214 L44 208 L58 197 L70 194 L84 181 L96 178 L106 168 L116 163 L124 152 L134 147 L142 133 L150 128 L157 117 L165 112 L172 101 L180 98 L188 89 L196 84 L203 88 L209 87 L216 97 L224 100 L232 106 L240 107 L240 230Z"/>'+
      '<path class="gn-sombra" d="M196 86 L188 112 L178 128 L182 150 L170 176 L176 200 L160 230 L240 230 L240 108 L222 102 L208 90Z"/>'+
      '<path class="gn-luz" d="M196 86 L182 98 L170 104 L158 120 L170 114 L180 112 L188 104Z"/>'+
    '</g></svg>';
}

/* «Ver detalle» y «Siguiente reto»: una hoja con lo que cuenta en cada anillo */
function gnAbreHoja(que){
  gnHoja=que;
  var A=gnDatos(today()), areas=que==="retos" ? [GN_AREAS[2]] : GN_AREAS;
  var h='<div class="gn-hoja-c"><div class="gn-hoja-t"><h2>'+(que==="retos"?"Retos de hoy":"Tu progreso de hoy")+'</h2>'+
    '<button class="icon-btn" data-act="x-gn-cierra" aria-label="Cerrar"><svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>';
  areas.forEach(function(a){
    var l=A[a.k], n=l.filter(function(x){ return x.ok; }).length;
    h+='<div class="gn-ha gn-'+a.k+'"><div class="gn-ha-t"><span class="gn-ha-i">'+gnSvg(a.ico)+'</span><b>'+a.n+'</b><span class="num">'+(l.length?n+"/"+l.length:"—")+'</span>'+
      '<button data-act="x-gn-ir" data-tab="'+a.tab+'">Abrir'+gnSvg("flecha")+'</button></div>';
    if(!l.length) h+='<p class="gn-ha-v">'+(a.k==="social"?"Únete a un grupo para ver cómo van tus amigos.":"Nada para hoy.")+'</p>';
    l.forEach(function(x){
      h+='<'+(x.act?'button':'div')+' class="gn-hf'+(x.ok?" ok":"")+'"'+(x.act?' data-act="'+x.act+'" data-id="'+x.id+'" data-day="'+today()+'"':'')+'>'+
        '<span class="gn-ck"></span><span>'+esc(x.txt)+'</span></'+(x.act?'button':'div')+'>';
    });
    h+='</div>';
  });
  openSheet(h+'</div>');
}

function gnAccion(a, el){
  if(a==="x-gn-area"){ var ar=GN_AREAS.filter(function(x){ return x.k===el.dataset.k; })[0]; if(ar) go(ar.tab); return true; }
  if(a==="x-gn-detalle"){ gnAbreHoja("todo"); return true; }
  if(a==="x-gn-retos"){ gnAbreHoja("retos"); return true; }
  if(a==="x-gn-cierra"){ gnHoja=null; closeSheet(); return true; }
  if(a==="x-gn-ir"){ gnHoja=null; closeSheet(); go(el.dataset.tab); return true; }
  if(a==="x-gn-todos"){ gnTodos=!gnTodos; render(); return true; }
  if(a==="x-gn-vertodos"){
    if(ordenIdeal(idealActivos()).length>4){ gnTodos=!gnTodos; render(); }
    else if(typeof sheetIdeal==="function") sheetIdeal(null);
    return true;
  }
  return false;
}
var _gnExtras=extrasAccion;
extrasAccion=function(a, el){ return gnAccion(a, el) || _gnExtras.apply(this, arguments); };
/* al cerrar la hoja tocando fuera, se olvida */
document.addEventListener("click", function(e){ if(e.target.closest && e.target.closest('[data-act="close-sheet"]')) gnHoja=null; }, true);

/* al marcar, el círculo se rellena al momento (el repintado viene justo después) */
document.addEventListener("click", function(e){
  var r=e.target.closest && e.target.closest(".gn-h, .gn-hf[data-act]"); if(!r) return;
  r.classList.toggle("ok");
  if(r.classList.contains("ok")){ r.classList.remove("gn-pop"); void r.offsetWidth; r.classList.add("gn-pop"); }
}, true);

/* nombres de las pestañas: Hoy → General, Objetivos → Retos (solo si no los cambiaste tú) */
function gnEtiquetas(){
  if(!S.labels) return;
  var cambia=false;
  if(S.labels.resumen==="Hoy"){ S.labels.resumen="General"; cambia=true; }
  if(S.labels.retos==="Objetivos"){ S.labels.retos="Retos"; cambia=true; }
  if(cambia){
    $$('[data-label="resumen"]').forEach(function(e){ e.textContent=S.labels.resumen; });
    $$('[data-label="retos"]').forEach(function(e){ e.textContent=S.labels.retos; });
  }
}

var _gnHoy=hoyNuevo;
hoyNuevo=function(st){ _gnHoy.apply(this, arguments); gnPinta(st); };

/* tu foto, a la altura de PEAK. en General */
var _gnAlinea=hnAlinea;
hnAlinea=function(){
  var af=document.getElementById("acciones-flotantes"), lg=document.getElementById("gn-logo");
  if(view!=="resumen" || !af || !lg || !af.offsetParent) return _gnAlinea();
  var y=0, e=lg, op=af.offsetParent;
  while(e && e!==op){ y+=e.offsetTop; e=e.offsetParent; }
  if(e===op) af.style.top=(y+lg.offsetHeight/2-20)+"px";
};
/* sin foto, una silueta en un círculo claro */
var _gnAvatar=hnAvatar;
hnAvatar=function(){
  var p=(typeof perfil!=="undefined" && perfil) || {};
  return p.avatar ? _gnAvatar() : '<span class="gn-sinfoto">'+gnSvg("persona")+'</span>';
};

/* ── la barra: General · Cuerpo · Mente · Retos · Social ── */
/* (17/10) la barra conserva su aspecto y sus iconos de antes: solo cambian el orden y los nombres */
(function(){
  var bar=document.getElementById("mtabs"); if(!bar) return;
  ["resumen","vital","academico","retos","social"].forEach(function(k){
    var b=bar.querySelector('button[data-view="'+k+'"]') || (k==="academico" && bar.querySelector('button[data-view="tareas"]'));
    if(!b) return;
    bar.appendChild(b);
  });
  var rail=document.getElementById("rail");
  if(rail) ["resumen","vital","academico","retos","social"].forEach(function(k){
    var b=rail.querySelector('button[data-view="'+k+'"]'); if(b) b.parentNode.appendChild(b);
  });
  gnEtiquetas();
  setTimeout(moveMTab, 80);
})();

(function(){
  /* más fuerte que la barra de tinta de 59 (que va con siete :not) */
  var Q="html"+[1,2,3,4,5,6,7,8].map(function(i){ return ":not(.gnq"+i+")"; }).join("");
  var st=document.createElement("style"); st.id="general-css"; st.textContent=[
':root{ --gn-tarjeta:#F8F5EE; --gn-sombra:0 1px 2px rgba(40,32,20,.04);',
'  --gn-salvia:#5E6B54; --gn-salvia-2:#DCE0D3; --gn-lavanda:#7A6A98; --gn-lavanda-2:#E4DEEC;',
'  --gn-arena:#9E7B4C; --gn-arena-2:#EFE2CB; --gn-verde:#3F6266; --gn-verde-2:#D8E3E2;',
'  --gn-int:#E5E6DA; --gn-reto:#ECE6EE; --gn-reto-ic:#DBD2E0; --gn-sol:#E2DACB; }',
'html.dark{ --gn-tarjeta:#171614; --gn-sombra:none;',
'  --gn-salvia:#A9BC98; --gn-salvia-2:#2A3026; --gn-lavanda:#B6A6D6; --gn-lavanda-2:#2D2836;',
'  --gn-arena:#D2AE7C; --gn-arena-2:#3A2F20; --gn-verde:#8DB7B6; --gn-verde-2:#22302F;',
'  --gn-int:#1F211B; --gn-reto:#221F27; --gn-reto-ic:#2F2A37; --gn-sol:#2A2621; }',
/* fuera lo que General no usa */
'html.gen #v-resumen > div:first-child, html.gen .hn-fila3, html.gen .hn-guia{ display:none !important; }',
'html.gen #hoy{ position:relative; }',
/* cabecera */
'.gn-cab{ position:relative; padding-bottom:26px; }',
'.gn-logo{ font-family:"Unbounded",var(--f-titulo); font-weight:800; font-size:26px; letter-spacing:-.045em; line-height:40px; color:var(--t1); position:relative; }',
'.gn-fecha{ position:relative; margin-top:30px; font-size:12px; font-weight:500; letter-spacing:.24em; color:var(--t2); }',
'.gn-tit{ position:relative; margin-top:12px; font-family:var(--f-texto); font-weight:700; font-size:31px; line-height:1.08; letter-spacing:-.035em; color:var(--t1); }',
'.gn-raya{ position:relative; display:block; width:22px; height:2.5px; border-radius:2px; background:var(--t1); margin-top:16px; }',
'.gn-frase{ position:relative; margin-top:16px; max-width:56%; font-size:15px; line-height:1.4; color:var(--t2); }',
'.gn-monte{ position:absolute; right:-20px; bottom:-40px; width:min(80%,340px); pointer-events:none; }',
'.gn-monte svg{ display:block; width:100%; height:auto; }',
'.gn-sol{ fill:var(--gn-sol); }',
'.gn-sombra{ fill:#1D1B19; opacity:.38; mix-blend-mode:multiply; }',
'.gn-luz{ fill:#fff; opacity:.35; }',
'html.dark .gn-monte svg g{ opacity:.82; }',
/* tarjeta de progreso */
'.gn-prog{ position:relative; z-index:1; background:var(--gn-tarjeta); border-radius:22px; padding:18px 16px 16px; box-shadow:var(--gn-sombra); margin-top:-6px; }',
'.gn-sec{ display:flex; justify-content:space-between; align-items:center; }',
'.gn-sec h2{ font-family:var(--f-texto); font-weight:700; font-size:19px; letter-spacing:-.025em; color:var(--t1); }',
'.gn-sec button, .gn-sec > span{ display:flex; align-items:center; gap:5px; font-size:13.5px; font-weight:500; color:var(--t2); min-height:32px; }',
'.gn-sec button svg{ width:15px; height:15px; }',
'.gn-prog .gn-sec{ padding:0 4px; }',
'.gn-sec2{ margin:34px 0 12px; scroll-margin-top:80px; }',
'.gn-anillos{ display:grid; grid-template-columns:repeat(4,1fr); gap:4px; margin-top:16px; }',
'.gn-an{ display:flex; flex-direction:column; align-items:center; border-radius:16px; padding:2px 0 4px; transition:transform .2s; }',
'.gn-an:active{ transform:scale(.94); }',
'.gn-ani{ position:relative; width:72px; height:72px; display:block; }',
'.gn-ani svg:first-child{ width:72px; height:72px; transform:rotate(-90deg); }',
'.gn-pista{ fill:none; stroke-width:4.5; }',
'.gn-arco{ fill:none; stroke-width:4.5; stroke-linecap:round; transition:stroke-dashoffset .9s cubic-bezier(.3,.8,.3,1); }',
'.gn-aico{ position:absolute; left:50%; top:50%; width:28px; height:28px; transform:translate(-50%,-50%); }',
'.gn-an b{ margin-top:10px; font-family:var(--f-texto); font-size:17px; font-weight:500; color:var(--t1); letter-spacing:-.01em; }',
'.gn-an small{ margin-top:2px; font-size:13px; color:var(--t2); }',
'.gn-cuerpo{ --c:var(--gn-salvia); --c2:var(--gn-salvia-2); } .gn-mente{ --c:var(--gn-lavanda); --c2:var(--gn-lavanda-2); }',
'.gn-retos{ --c:var(--gn-arena); --c2:var(--gn-arena-2); } .gn-social{ --c:var(--gn-verde); --c2:var(--gn-verde-2); }',
'.gn-an .gn-pista{ stroke:var(--c2); } .gn-an .gn-arco{ stroke:var(--c); } .gn-an .gn-aico{ color:var(--c); }',
/* tu intención */
'.gn-int{ width:100%; display:flex; align-items:center; gap:14px; margin-top:18px; padding:12px 16px 12px 12px; border-radius:16px; background:var(--gn-int); text-align:left; transition:transform .2s; }',
'.gn-int:active, .gn-reto:active, .gn-h:active{ transform:scale(.985); }',
'.gn-hoja{ width:40px; height:40px; flex:none; border-radius:50%; display:grid; place-items:center; background:var(--gn-tarjeta); color:var(--gn-salvia); box-shadow:0 0 0 1px rgba(0,0,0,.03); }',
'.gn-hoja svg{ width:22px; height:22px; } .gn-hoja svg path:first-child{ fill:var(--gn-salvia); fill-opacity:.85; }',
'.gn-itx, .gn-rtx{ flex:1; min-width:0; }',
'.gn-itx small, .gn-rtx small{ display:block; font-size:10.5px; font-weight:600; letter-spacing:.14em; text-transform:uppercase; color:var(--t2); }',
'.gn-itx b, .gn-rtx b{ display:block; margin-top:3px; font-size:14.5px; font-weight:500; line-height:1.3; color:var(--t1); }',
'.gn-fl{ width:17px; height:17px; flex:none; color:var(--t2); }',
/* hábitos */
'.gn-habs{ display:flex; flex-direction:column; gap:8px; }',
'.gn-h{ width:100%; display:flex; align-items:center; gap:10px; padding:11px 12px 11px 14px; border-radius:16px; background:var(--gn-tarjeta); box-shadow:var(--gn-sombra); text-align:left; transition:transform .2s; }',
'.gn-h > i{ width:19px; flex:none; font-style:normal; font-size:13px; font-weight:500; color:var(--t2); }',
'.gn-hic{ width:38px; height:38px; flex:none; border-radius:50%; display:grid; place-items:center; }',
'.gn-hic svg{ width:21px; height:21px; }',
'.t-salvia{ background:var(--gn-salvia-2); color:var(--gn-salvia); } .t-lavanda{ background:var(--gn-lavanda-2); color:var(--gn-lavanda); }',
'.t-arena{ background:var(--gn-arena-2); color:var(--gn-arena); } .t-verde{ background:var(--gn-verde-2); color:var(--gn-verde); }',
'.gn-htx{ flex:1; min-width:0; }',
'.gn-htx b{ display:block; font-size:14px; letter-spacing:-.005em; font-weight:500; line-height:1.3; color:var(--t1); transition:color .25s; }',
'.gn-htx small{ display:block; margin-top:2px; font-size:12.5px; color:var(--t3); }',
'.gn-ck{ width:26px; height:26px; flex:none; border-radius:50%; border:1.5px solid var(--t2); position:relative; transition:background .2s, border-color .2s; }',
'.ok > .gn-ck{ background:var(--t1); border-color:var(--t1); }',
'.ok > .gn-ck::after{ content:""; position:absolute; left:8.5px; top:4.5px; width:5px; height:10px; border:solid var(--bg); border-width:0 2px 2px 0; transform:rotate(45deg); }',
'.gn-h.ok .gn-htx b{ color:var(--t3); }',
'.gn-pop > .gn-ck{ animation:hnPop .45s cubic-bezier(.3,1.6,.5,1); }',
'.gn-mas{ display:inline-block; padding:12px 16px 0 4px; font-size:14px; font-weight:600; color:var(--t2); }',
'.gn-pie{ display:flex; justify-content:space-between; } .gn-edit{ padding-right:4px; font-weight:500; }',
'.gn-vacio{ width:100%; padding:18px 16px; border-radius:16px; background:var(--gn-tarjeta); color:var(--t2); font-size:15px; text-align:left; }',
/* siguiente reto */
'.gn-reto{ width:100%; display:flex; align-items:center; gap:14px; margin-top:16px; padding:14px 18px 14px 14px; border-radius:16px; background:var(--gn-reto); text-align:left; transition:transform .2s; }',
'.gn-rst{ width:42px; height:42px; flex:none; border-radius:50%; display:grid; place-items:center; background:var(--gn-reto-ic); color:var(--gn-lavanda); }',
'.gn-rst svg{ width:20px; height:20px; }',
'.gn-reto.ok .gn-rtx b{ color:var(--t2); }',
'.gn-dos{ margin-top:0 !important; }',
/* hoja de detalle */
'.gn-hoja-t{ display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }',
'.gn-hoja-t h2{ font-family:var(--f-texto); font-weight:700; font-size:21px; letter-spacing:-.03em; }',
'.gn-ha{ padding:14px 0 6px; border-top:1px solid var(--hairline); margin-top:10px; }',
'.gn-ha-t{ display:flex; align-items:center; gap:10px; margin-bottom:4px; }',
'.gn-ha-i{ width:32px; height:32px; border-radius:50%; display:grid; place-items:center; background:var(--c2); color:var(--c); } .gn-ha-i svg{ width:18px; height:18px; }',
'.gn-ha-t b{ font-size:16px; font-weight:600; } .gn-ha-t .num{ color:var(--c); font-weight:600; font-size:14px; }',
'.gn-ha-t button{ margin-left:auto; display:flex; align-items:center; gap:4px; font-size:13px; color:var(--t2); min-height:32px; } .gn-ha-t button svg{ width:14px; height:14px; }',
'.gn-hf{ width:100%; display:flex; align-items:center; gap:12px; padding:9px 0 9px 4px; font-size:14.5px; text-align:left; color:var(--t1); }',
'.gn-hf .gn-ck{ width:22px; height:22px; } .gn-hf.ok > .gn-ck::after{ left:6.8px; top:3px; width:5px; height:9px; }',
'.gn-hf.ok span:last-child{ color:var(--t3); }',
'.gn-ha-v{ font-size:13.5px; color:var(--t3); padding:6px 0 4px 4px; }',
/* tu foto sin foto */
'.hn-yo:has(.gn-sinfoto){ background:#E2DCCF; box-shadow:none; color:#141414; }',
'html.dark .hn-yo:has(.gn-sinfoto){ background:#24221F; color:#F3EEE3; }',
'.gn-sinfoto svg{ width:22px; height:22px; } .gn-sinfoto svg circle{ fill:currentColor; } .gn-sinfoto svg path{ fill:currentColor; }',
'@media (max-width:1023px){ #lienzo{ padding-bottom:calc(112px + env(safe-area-inset-bottom)) !important; } }',
/* pantallas grandes: la cabecera y el progreso a la izquierda, los hábitos a la derecha */
'@media (min-width:1024px){',
'  html.gen #hoy{ display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); column-gap:40px; align-items:start; max-width:1100px; }',
'  html.gen #hoy > *{ grid-column:1; } html.gen #hoy > .gn-sec2, html.gen #hoy > .gn-habs, html.gen #hoy > .gn-pie, html.gen #hoy > .gn-reto, html.gen #hoy > .gn-vacio, html.gen #hoy > .gn-dos, html.gen #hoy > .hn-sem{ grid-column:2; }',
'  html.gen #hoy > .gn-sec2:first-of-type{ margin-top:0; }',
'  .gn-monte{ right:0; } .gn-logo{ display:none; }',
'}'
  ].join("\n"); document.head.appendChild(st);
  if(typeof render==="function") try{ render(); }catch(e){}
})();
