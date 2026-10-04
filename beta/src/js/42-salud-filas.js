/* ════════════════════════════════════════════════════════════════
   SALUD DEL DÍA EN FILAS (oct 2026)
   Agua, sueño y pantalla: una fila cada uno, con su color, una frase
   en vez de «sin registrar», una barra hasta el objetivo y un «+».
   El «+» del agua suma un vaso; el de sueño y pantalla abre la hoja
   para apuntar las horas (la misma que al tocar la fila).
   Los iconos se mueven un poco: la gota cae y salpica, la luna se mece
   y suelta «z», y el móvil vibra cuando te pasas de pantalla.
   El marcado está en html/pantallas.html (.sf-caja).
   ════════════════════════════════════════════════════════════════ */

/* los medidores de lienzo de antes ya no existen */
function medSync(){}
/* las barritas de la semana bajo cada valor tampoco */
function vitalTendencias(){}

var SF_COLOR={ water:"--sf-agua", sleep:"--sf-sueno", screen:"--sf-pantalla" };
function sfHoras(v){ return String(Math.round(v*10)/10).replace(".", L10N.dec||","); }
function sfTexto(k, v){
  if(k==="water"){
    if(!v) return { n:"0", u:"/8", msg:"Empieza con un vaso", f:0 };
    return { n:String(v), u:"/8", msg: v>=8 ? "¡Bien hidratado!" : (8-v===1 ? "Te falta 1 vaso" : "Te faltan "+(8-v)+" vasos"), f:v/8 };
  }
  if(k==="sleep"){
    if(v==null || !v) return { n:"—", u:"", msg:"¿Cuánto dormiste anoche?", f:0 };
    return { n:sfHoras(v), u:"h", msg: v>=7 ? "Has dormido bien, sigue así" : "Te faltan "+sfHoras(7-v)+" h para las 7", f:v/7 };
  }
  if(v==null) return { n:"—", u:"", msg:"Toca + para apuntarla", f:0 };
  var queda=2-v;
  return { n:sfHoras(v), u:"h", f:v/2, pasa:v>2,
           msg: v<2 ? (queda>=1 ? "Te quedan "+sfHoras(queda)+" h libres" : "Te queda "+(queda===.5?"media hora":sfHoras(queda)+" h")+" libre")
                    : v===2 ? "Justo en el límite" : "Te has pasado "+sfHoras(v-2)+" h" };
}
/* la semana en barritas, como en Salud del iPhone: grises y hoy en color */
var SF_TOPE={ water:10, sleep:10, screen:6 };
function sfSemana(k){
  var hoy=curDay(), out="";
  for(var i=6;i>=0;i--){
    var d=addDays(hoy,-i), v=((S.habits&&S.habits[d])||{})[k];
    var tiene=(v!=null && (k==="screen" || v>0));
    var alto=tiene ? Math.max(14, Math.min(100, Math.round(v/SF_TOPE[k]*100))) : 8;
    out+='<i class="'+(i===0?"hoy":"")+(tiene?"":" nada")+'" style="height:'+alto+'%"></i>';
  }
  return out;
}
function saludFilas(){
  var t=curDay(), h=habit(t);
  document.querySelectorAll(".sf-fila").forEach(function(f){
    var k=f.dataset.k, v=h[k], o=sfTexto(k, k==="water" ? (v||0) : v), ok=SALUD[k].ok(v);
    f.style.setProperty("--sf", "var("+SF_COLOR[k]+")");
    var n=f.querySelector(".sf-num"); n.innerHTML=o.n+(o.u?'<small>'+(o.u==="/8"?"de 8 vasos":o.u==="h"?"horas":o.u)+'</small>':"");
    n.classList.toggle("vacio", o.n==="—");
    f.querySelector(".sf-msg").textContent=o.msg;
    f.querySelector(".sf-sem").innerHTML=sfSemana(k);
    f.querySelector(".sf-cuando").textContent = t===today() ? "hoy" : "ese día";
    f.classList.toggle("ok", !!ok);
    f.classList.toggle("pasa", !!o.pasa);
    f.querySelectorAll("[data-act]").forEach(function(b){ b.dataset.day=t; });
    if(f.dataset.act) f.dataset.day=t;
  });
}
/* un toque: la animación del icono vuelve a empezar */
function sfToca(k, cls){
  var f=document.querySelector('.sf-fila[data-k="'+k+'"]'); if(!f) return;
  f.classList.remove(cls); void f.offsetWidth; f.classList.add(cls);
  setTimeout(function(){ f.classList.remove(cls); }, 900);
}

(function(){
  var antes=rVital;
  rVital=function(){ antes.apply(this, arguments); try{ saludFilas(); }catch(e){} };

  var acc=crecerAccion;
  crecerAccion=function(a, el){
    if(a==="x-sf-vaso"){
      var d=el.dataset.day||curDay();
      saludPon(d, "water", clamp((habit(d).water||0)+1, 0, 20));
      sonido("pop"); sfToca("water", "sf-cae");
      return true;
    }
    return acc(a, el);
  };

  var st=document.createElement("style");
  st.textContent=[
/* como Salud del iPhone: tarjeta lisa, el color solo en el título y en la barra de hoy */
':root{ --sf-agua:#2f8fd8; --sf-sueno:#5e5ce6; --sf-pantalla:#f2652a; }',
'html.dark{ --sf-agua:#4fb1f5; --sf-sueno:#8583ff; --sf-pantalla:#ff7d45; }',
'.sf-caja{ padding:0!important; background:none!important; box-shadow:none!important; }',
'.sf-fila{ --sf:var(--accent); display:block; padding:16px 18px 18px; margin-bottom:12px; border-radius:24px; cursor:pointer;',
'  background:var(--tarjeta, var(--glass-bg)); box-shadow:0 0 0 1px var(--tarjeta-borde, var(--hairline));',
'  -webkit-tap-highlight-color:transparent; transition:transform .25s var(--spring); }',
'.sf-fila:last-child{ margin-bottom:0; }',
'.sf-fila:active{ transform:scale(.985); }',
'.sf-cab{ display:flex; align-items:center; gap:7px; color:var(--sf); }',
'.sf-cab b{ font-size:15.5px; font-weight:600; flex:1; }',
'.sf-ic{ display:grid; place-items:center; width:20px; height:20px; }',
'.sf-ic svg{ width:19px; height:19px; fill:currentColor; }',
'.sf-cuando{ font-size:13.5px; color:var(--t3); }',
'.sf-chev{ width:15px; height:15px; fill:none; stroke:var(--t3); stroke-width:2.4; stroke-linecap:round; stroke-linejoin:round; margin-right:-3px; }',
'.sf-mas{ font-size:12.5px; font-weight:600; color:var(--sf); padding:5px 10px; border-radius:99px; margin-right:4px;',
'  background:color-mix(in srgb, var(--sf) 13%, transparent); transition:transform .2s var(--spring); }',
'.sf-mas:active{ transform:scale(.9); }',
'.sf-cuerpo{ display:flex; align-items:flex-end; justify-content:space-between; gap:14px; margin-top:22px; }',
'.sf-dato{ min-width:0; }',
'.sf-fila .sf-num{ display:block; font-family:Unbounded,sans-serif!important; font-weight:700!important; font-size:34px!important; letter-spacing:-.05em; line-height:1; color:var(--t1)!important; background:none!important; }',
'.sf-num small{ font-family:Inter,sans-serif; font-size:14px; font-weight:600; letter-spacing:0; color:var(--t3); margin-left:6px; }',
'.sf-fila .sf-num.vacio{ color:var(--t3)!important; }',
'.sf-msg{ font-size:12.5px; color:var(--t3); margin-top:8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
'.sf-fila.pasa .sf-msg{ color:var(--sf); }',
'.sf-sem{ flex:none; display:flex; align-items:flex-end; gap:4px; height:52px; }',
'.sf-sem i{ width:8px; border-radius:2.5px; background:color-mix(in srgb, var(--t1) 22%, transparent); transition:height .5s var(--spring); }',
'.sf-sem i.nada{ background:color-mix(in srgb, var(--t1) 10%, transparent); }',
'.sf-sem i.hoy{ background:var(--sf); }',
'.sf-sem i.hoy.nada{ background:color-mix(in srgb, var(--sf) 35%, transparent); }',
/* al apuntar: el número da un saltito y el icono también */
'.sf-num.salud-ok{ animation:sfNum .6s var(--spring); background:none!important; color:var(--t1)!important; }',
'@keyframes sfNum{ 30%{ transform:scale(1.08); } }',
'.sf-cae .sf-ic{ animation:sfIc .5s var(--spring); }',
'@keyframes sfIc{ 40%{ transform:scale(1.35); } }',
'@media (prefers-reduced-motion: reduce){ .sf-fila *{ animation:none!important; } }'
  ].join("\n"); document.head.appendChild(st);
})();

/* ════════════════ la hoja de cada una, como en Salud del iPhone ════════════════
   Arriba el número de hoy, la gráfica de la semana con la línea del objetivo y
   tu media; luego apuntar, y abajo artículos cortos con su dibujo.
   Sustituye a la sheetValor de 12-nivel-y-desbloqueos.js (mismas ids:
   vl-num, vl-rango y vl-chips, así «Guardar» sigue igual). */
var SF_HOJA={
  water:{ t:"Agua", ic:"agua", meta:8, u:"vasos", obj:"El objetivo son 8 vasos al día.", media:"Esta semana bebes" },
  sleep:{ t:"Sueño", ic:"sueno", meta:7, u:"h", obj:"El objetivo son 7 horas o más.", media:"Esta semana duermes" },
  screen:{ t:"Pantalla", ic:"pantalla", meta:2, u:"h", obj:"Tiempo de ocio con el móvil u otras pantallas. El objetivo es menos de 2 horas.", media:"Esta semana usas pantallas" }
};
var SF_ICONO={
  agua:'<path d="M12 2.5c3.8 4.5 6.5 8.1 6.5 11.5a6.5 6.5 0 0 1-13 0c0-3.4 2.7-7 6.5-11.5z"/>',
  sueno:'<path d="M20 14.6A8.3 8.3 0 0 1 9.4 4a8.3 8.3 0 1 0 10.6 10.6z"/>',
  pantalla:'<path fill-rule="evenodd" d="M8.5 2h7A2.5 2.5 0 0 1 18 4.5v15a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 6 19.5v-15A2.5 2.5 0 0 1 8.5 2zM8 5v12.5h8V5z"/>'
};

/* artículos: d = dibujo, t = título, s = entradilla, p = párrafos */
var SF_ARTS={
  sleep:[
    { d:"lunamar", t:"Por qué dormir bien lo cambia todo", s:"Lo que hace tu cuerpo mientras duermes.",
      p:["Mientras duermes, el cerebro ordena lo que has aprendido durante el día y lo guarda. Por eso estudiar y luego dormir funciona mejor que pasar la noche en vela.",
         "El sueño también regula el hambre y el ánimo: después de una mala noche es normal tener más antojos y menos paciencia.",
         "Y es cuando los músculos se recuperan del entreno. Si entrenas fuerte y duermes poco, avanzas más despacio.",
         "Entre los 18 y los 25 años se recomiendan de 7 a 9 horas. Si tienes menos de 18, de 8 a 10."] },
    { d:"montana", t:"Una rutina para dormirte antes", s:"Pequeños cambios que se notan en una semana.",
      p:["Acuéstate y levántate a la misma hora, también el fin de semana. Es lo que más ayuda al reloj del cuerpo.",
         "Deja la última cafeína, el té o las bebidas energéticas para antes de las 16:00.",
         "Una hora antes de dormir, baja las luces y aparta el móvil. Leer un rato en papel es buena señal para el cerebro.",
         "Habitación fresca, oscura y en silencio. Si a los 20 minutos no te duermes, levántate un momento y vuelve cuando tengas sueño."] },
    { d:"siesta", t:"Siestas: cuándo sí y cuándo no", s:"Cortas y temprano, mejor.",
      p:["Una siesta de 10 a 20 minutos despeja sin dejarte atontado.",
         "Si pasas de 30 minutos, entras en sueño profundo y te despiertas peor.",
         "Mejor antes de las 16:00. Una siesta tarde te quita sueño por la noche."] }
  ],
  water:[
    { d:"vaso", t:"¿De verdad hacen falta 8 vasos?", s:"Lo que dice la ciencia, sin mitos.",
      p:["Los 8 vasos son una referencia fácil de recordar, no una regla exacta. Una parte del agua que necesitas ya te llega con la comida.",
         "Necesitas más si hace calor, si haces deporte o si estás enfermo.",
         "Una pista sencilla: si la orina sale de color amarillo claro, vas bien. Si es oscura, bebe un poco más."] },
    { d:"botella", t:"Trucos para beber más sin pensarlo", s:"Que beber agua sea lo fácil.",
      p:["Lleva una botella contigo y déjala a la vista: lo que ves, lo bebes.",
         "Engánchalo a algo que ya haces: un vaso al levantarte y otro con cada comida.",
         "Si el agua sola te aburre, añade limón, menta o fruta.",
         "Cada vez que bebas un vaso, toca «+ vaso» en Peak. y verás cómo avanza la semana."] },
    { d:"gotas", t:"Agua y deporte", s:"Antes, durante y después de entrenar.",
      p:["Bebe un vaso o dos en las horas antes de entrenar.",
         "Durante el entreno, da sorbos pequeños cada 15 o 20 minutos, sobre todo si sudas mucho.",
         "Después, recupera lo que has perdido. Si entrenas más de una hora con calor, una bebida con sales ayuda."] }
  ],
  screen:[
    { d:"reloj", t:"¿Por qué menos de 2 horas?", s:"El tiempo de ocio con pantallas, en su sitio.",
      p:["Las 2 horas son una referencia muy usada para el tiempo de ocio con pantallas: redes, vídeos y juegos. No cuenta lo que haces para clase o para trabajar.",
         "Pasar muchas horas con el móvil se relaciona con dormir peor, moverse menos y más ansiedad, sobre todo por las comparaciones en redes.",
         "No se trata de dejarlo, sino de que lo uses tú a él y no al revés."] },
    { d:"bocabajo", t:"Cómo mirar menos el móvil", s:"Ideas que funcionan de verdad.",
      p:["Quita las notificaciones de todo lo que no sea de personas.",
         "Pon la pantalla en blanco y negro: las apps pierden mucha gracia.",
         "Saca las redes de la pantalla de inicio y pon límites de tiempo a las que más usas.",
         "Cuando estés con gente o estudiando, deja el móvil boca abajo o en otra habitación."] },
    { d:"brillo", t:"Pantallas y sueño", s:"Por qué el móvil en la cama te quita horas.",
      p:["La luz de la pantalla y, sobre todo, lo que ves en ella mantienen el cerebro despierto.",
         "Cada vídeo o mensaje pide «uno más», y así se va la hora de dormir sin darte cuenta.",
         "Prueba a dejar el móvil cargando fuera del dormitorio y usa un despertador normal. Es de lo que más ayuda."] }
  ]
};

/* dibujos propios, planos y con textura suave, para no depender de imágenes con licencia */
function sfEstrellas(n, sem, alto){
  var s="", x=sem;
  for(var i=0;i<n;i++){ x=(x*9301+49297)%233280; var a=x/233280; x=(x*9301+49297)%233280; var b=x/233280;
    s+='<circle cx="'+(a*400).toFixed(1)+'" cy="'+(b*alto).toFixed(1)+'" r="'+(i%5===0?1.6:.9)+'" fill="#fff" opacity="'+(.4+(i%3)*.2)+'"/>'; }
  return s;
}
function sfDibujo(d){
  var g='<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice"><defs>'+
    '<linearGradient id="sfg-'+d+'" x1="0" y1="0" x2="0" y2="1">';
  var c="";
  if(d==="lunamar"){
    g+='<stop offset="0" stop-color="#0b1440"/><stop offset="1" stop-color="#28309a"/></linearGradient></defs><rect width="400" height="220" fill="url(#sfg-lunamar)"/>';
    c=sfEstrellas(40,7,110)+'<circle cx="200" cy="78" r="34" fill="#f6dfc0"/><rect y="120" width="400" height="100" fill="#2f58c9"/>'+
      '<path d="M0 150h400M0 175h400M0 200h400" stroke="#4a73dd" stroke-width="2" opacity=".5"/>'+
      '<g fill="#f6dfc0"><rect x="168" y="128" width="64" height="6" rx="3"/><rect x="176" y="142" width="48" height="5" rx="2.5" opacity=".85"/><rect x="160" y="156" width="80" height="5" rx="2.5" opacity=".7"/><rect x="182" y="170" width="36" height="4" rx="2" opacity=".6"/><rect x="170" y="184" width="60" height="4" rx="2" opacity=".45"/><rect x="186" y="198" width="28" height="3" rx="1.5" opacity=".35"/></g>';
  } else if(d==="montana"){
    g+='<stop offset="0" stop-color="#1a1450"/><stop offset="1" stop-color="#5b3fb8"/></linearGradient></defs><rect width="400" height="220" fill="url(#sfg-montana)"/>';
    c=sfEstrellas(45,3,140)+'<path d="M300 40a26 26 0 1 0 22 40 22 22 0 1 1-22-40z" fill="#f3e6c8"/>'+
      '<path d="M0 220L120 90l60 60 50-40 170 110z" fill="#2a1f6b"/><path d="M120 90l60 60-30-10-30 20z" fill="#3b2d8c"/>'+
      '<path d="M140 220l110-130 150 130z" fill="#7a5ad6"/><g stroke="#9b80ec" stroke-width="2.4" opacity=".7"><path d="M250 90l-60 130M262 104l-48 116M274 118l-36 102M286 132l-24 88"/></g>';
  } else if(d==="siesta"){
    g+='<stop offset="0" stop-color="#f7b267"/><stop offset="1" stop-color="#f4845f"/></linearGradient></defs><rect width="400" height="220" fill="url(#sfg-siesta)"/>';
    c='<circle cx="210" cy="120" r="46" fill="#fde7c4"/><path d="M0 150c80-30 160-30 240 0s120 20 160 0v70H0z" fill="#d9634a"/><path d="M0 185c100-25 220-25 400 5v30H0z" fill="#a8473a"/>';
  } else if(d==="vaso"){
    g+='<stop offset="0" stop-color="#bfe3fb"/><stop offset="1" stop-color="#5aa9e6"/></linearGradient></defs><rect width="400" height="220" fill="url(#sfg-vaso)"/>';
    c='<path d="M160 40h80l-10 150h-60z" fill="#ffffff" opacity=".35"/><path d="M164 100c12-8 24 8 36 0s24 8 36 0l-6 90h-60z" fill="#1d78c9"/>'+
      '<path d="M160 40h80l-10 150h-60z" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>'+
      '<circle cx="190" cy="150" r="5" fill="#fff" opacity=".5"/><circle cx="210" cy="128" r="3.5" fill="#fff" opacity=".5"/><circle cx="200" cy="170" r="4" fill="#fff" opacity=".4"/>';
  } else if(d==="botella"){
    g+='<stop offset="0" stop-color="#d7f0e6"/><stop offset="1" stop-color="#7cc6b0"/></linearGradient></defs><rect width="400" height="220" fill="url(#sfg-botella)"/>';
    c='<rect x="178" y="22" width="44" height="22" rx="6" fill="#2b6f63"/><path d="M168 50h64c10 0 18 8 18 18v120c0 10-8 18-18 18h-64c-10 0-18-8-18-18V68c0-10 8-18 18-18z" fill="#fff" opacity=".55"/>'+
      '<path d="M150 110h100v78c0 10-8 18-18 18h-64c-10 0-18-8-18-18z" fill="#3fa7d6" opacity=".75"/>'+
      '<circle cx="185" cy="150" r="17" fill="#f7e36b"/><circle cx="185" cy="150" r="12" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="4 4"/>'+
      '<path d="M215 170c10-14 26-14 30 0-10 8-22 8-30 0z" fill="#3d9b5d"/>';
  } else if(d==="gotas"){
    g+='<stop offset="0" stop-color="#123a6b"/><stop offset="1" stop-color="#2f80c9"/></linearGradient></defs><rect width="400" height="220" fill="url(#sfg-gotas)"/>';
    var gt=""; [[80,60,1],[150,110,.7],[230,50,1.2],[300,120,.8],[350,60,.6],[120,170,.9],[260,175,.7]].forEach(function(q){
      gt+='<path transform="translate('+q[0]+' '+q[1]+') scale('+q[2]+')" d="M0-26c12 14 20 24 20 34a20 20 0 0 1-40 0c0-10 8-20 20-34z" fill="#9fd4fb" opacity=".85"/>'; });
    c=gt+'<path d="M0 220l90-70 50 30 70-60 190 100z" fill="#0c2a52" opacity=".8"/>';
  } else if(d==="reloj"){
    g+='<stop offset="0" stop-color="#ffd3a5"/><stop offset="1" stop-color="#f08a4b"/></linearGradient></defs><rect width="400" height="220" fill="url(#sfg-reloj)"/>';
    c='<circle cx="200" cy="110" r="70" fill="#fff4e6"/><circle cx="200" cy="110" r="70" fill="none" stroke="#c4532a" stroke-width="6"/>'+
      '<path d="M200 110V62M200 110l34 20" stroke="#c4532a" stroke-width="7" stroke-linecap="round"/><path d="M200 40a70 70 0 0 1 60 106L200 110z" fill="#f08a4b" opacity=".35"/>';
  } else if(d==="bocabajo"){
    g+='<stop offset="0" stop-color="#f6e7d2"/><stop offset="1" stop-color="#e7c9a3"/></linearGradient></defs><rect width="400" height="220" fill="url(#sfg-bocabajo)"/>';
    c='<ellipse cx="200" cy="168" rx="120" ry="14" fill="#c9a77d" opacity=".5"/><rect x="120" y="128" width="160" height="34" rx="12" fill="#3a3530"/>'+
      '<circle cx="150" cy="145" r="6" fill="#57514a"/><path d="M290 60c-20 20-20 50 0 70 20-20 20-50 0-70z" fill="#6aa36f"/><path d="M290 130V170" stroke="#4f7d53" stroke-width="4"/>'+
      '<path d="M100 70c-14 16-14 40 0 56 14-16 14-40 0-56z" fill="#8cc08f"/><path d="M100 126v44" stroke="#4f7d53" stroke-width="4"/>';
  } else {  /* brillo */
    g+='<stop offset="0" stop-color="#140f2e"/><stop offset="1" stop-color="#2a1d55"/></linearGradient>'+
      '<radialGradient id="sfr-brillo"><stop offset="0" stop-color="#7fb2ff" stop-opacity=".7"/><stop offset="1" stop-color="#7fb2ff" stop-opacity="0"/></radialGradient></defs>'+
      '<rect width="400" height="220" fill="url(#sfg-brillo)"/>';
    c=sfEstrellas(25,11,90)+'<circle cx="200" cy="140" r="110" fill="url(#sfr-brillo)"/><rect x="170" y="90" width="60" height="104" rx="10" fill="#cfe1ff"/>'+
      '<rect x="176" y="98" width="48" height="84" rx="4" fill="#ffffff"/><path d="M0 195h400v25H0z" fill="#0d0a20"/>';
  }
  return g+c+'</svg>';
}

function sfMediaSemana(k){
  var hoy=curDay(), suma=0, n=0, dias=[];
  for(var i=6;i>=0;i--){
    var d=addDays(hoy,-i), v=((S.habits&&S.habits[d])||{})[k], tiene=(v!=null && (k==="screen" || v>0));
    if(tiene){ suma+=v; n++; }
    dias.push({ d:d, v:tiene?v:null, hoy:i===0 });
  }
  return { dias:dias, media:n ? Math.round(suma/n*10)/10 : null };
}
function sfGrafica(k){
  var H=SF_HOJA[k], w=sfMediaSemana(k), tope=H.meta*1.4;
  w.dias.forEach(function(x){ if(x.v!=null && x.v>tope) tope=x.v; });
  var linea=Math.round(H.meta/tope*100);
  var barras=w.dias.map(function(x){
    var alto=x.v==null ? 0 : Math.max(4, Math.round(x.v/tope*100));
    var dia=INI[new Date(x.d+"T00:00:00").getDay()];
    return '<div class="sfh-col'+(x.hoy?" hoy":"")+'"><div class="sfh-pila"><i style="height:'+alto+'%"></i></div><span>'+dia+'</span></div>';
  }).join("");
  return { html:'<div class="sfh-graf"><div class="sfh-meta" style="bottom:calc('+linea+'% * .78 + 22px)"><span>'+(k==="water"?H.meta+" vasos":H.meta+" h")+'</span></div>'+barras+'</div>', media:w.media };
}

function sheetValor(k){
  var def=SALUD[k], H=SF_HOJA[k]; if(!def || !H) return;
  valorClave=k; valorDia=curDay();
  var v=habit(valorDia)[k]; if(v==null) v=0;
  var gr=sfGrafica(k);
  var media = gr.media==null ? "Aún no hay datos de esta semana. Apunta hoy y empieza a verla."
    : H.media+" "+(k==="water" ? sfHoras(gr.media)+" "+(gr.media===1?"vaso":"vasos")+" de media." : sfHoras(gr.media)+" h de media.");
  openSheet(
    '<div class="sfh" style="--sf:var('+SF_COLOR[k]+')">'+
    '<div class="sfh-cab"><span class="sfh-ic"><svg viewBox="0 0 24 24">'+SF_ICONO[H.ic]+'</svg></span><b>'+H.t+'</b>'+closeBtn()+'</div>'+
    '<div class="sfh-hoy"><small>'+(valorDia===today()?"HOY":"ESE DÍA")+'</small><div class="vl-grande num" id="vl-num">'+fmtValor(k,v)+'</div></div>'+
    gr.html+
    '<p class="sfh-media">'+media+'</p>'+
    '<div class="sfh-caja"><p class="sfh-t">Apuntar</p><p class="sfh-obj">'+H.obj+'</p>'+
    '<input id="vl-rango" class="vl-rango" type="range" min="0" max="'+def.max+'" step="'+def.paso+'" value="'+v+'">'+
    '<div class="vl-chips">'+def.chips.map(function(c){ return '<button data-act="x-valor-chip" data-v="'+c+'">'+fmtValor(k,c)+'</button>'; }).join("")+'</div>'+
    '<button class="sfh-guardar" data-act="x-valor-ok">Guardar</button></div>'+
    '<p class="sfh-sec">Para saber más</p>'+
    SF_ARTS[k].map(function(a,i){
      return '<button class="sfh-art" data-act="x-sf-art" data-k="'+k+'" data-i="'+i+'"><div class="sfh-dib">'+sfDibujo(a.d)+'</div>'+
        '<div class="sfh-art-t"><b>'+a.t+'</b><span>'+a.s+'</span></div></button>';
    }).join("")+
    '</div>'
  );
  var rg=document.getElementById("vl-rango");
  rg.addEventListener("input", function(){ valorPinta(+rg.value); });
  valorPinta(v);
}
function sfArticulo(k, i){
  var a=SF_ARTS[k][i]; if(!a) return;
  openSheet(
    '<div class="sfh sfh-leer" style="--sf:var('+SF_COLOR[k]+')">'+
    '<div class="sfh-cab"><button class="sfh-volver" data-act="x-sf-volver" data-k="'+k+'"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>'+SF_HOJA[k].t+'</button>'+closeBtn()+'</div>'+
    '<div class="sfh-dib grande">'+sfDibujo(a.d)+'</div>'+
    '<h3>'+a.t+'</h3><p class="sfh-ent">'+a.s+'</p>'+
    a.p.map(function(x){ return '<p>'+x+'</p>'; }).join("")+
    '</div>'
  );
  var sh=document.getElementById("sheet-body"); if(sh && sh.scrollTo) sh.scrollTo(0,0);
}

(function(){
  var acc=crecerAccion;
  crecerAccion=function(a, el){
    if(a==="x-sf-art"){ sfArticulo(el.dataset.k, +el.dataset.i); return true; }
    if(a==="x-sf-volver"){ sheetValor(el.dataset.k); return true; }
    return acc(a, el);
  };
  var st=document.createElement("style");
  st.textContent=[
'.sfh{ padding-bottom:8px; }',
'.sfh-cab{ display:flex; align-items:center; gap:8px; color:var(--sf); margin-bottom:18px; }',
'.sfh-cab b{ flex:1; font-size:19px; font-weight:700; }',
'.sfh-ic svg{ width:22px; height:22px; fill:currentColor; display:block; }',
'.sfh-hoy small{ font-size:11.5px; font-weight:700; letter-spacing:.06em; color:var(--t3); }',
'.sfh .vl-grande{ text-align:left; margin:4px 0 0; font-family:Unbounded,sans-serif; font-size:40px; font-weight:700; letter-spacing:-.05em; color:var(--t1); }',
'.sfh .vl-grande.ok{ color:var(--t1); }',
'.sfh-graf{ position:relative; display:flex; align-items:flex-end; gap:10px; height:170px; margin:18px 0 10px; padding-top:10px; }',
'.sfh-col{ flex:1; display:flex; flex-direction:column; align-items:center; height:100%; }',
'.sfh-pila{ flex:1; width:100%; display:flex; align-items:flex-end; border-radius:7px; background:color-mix(in srgb, var(--t1) 5%, transparent); }',
'.sfh-pila i{ display:block; width:100%; border-radius:7px; background:color-mix(in srgb, var(--t1) 17%, transparent); transition:height .5s var(--spring); }',
'.sfh-col.hoy .sfh-pila i{ background:var(--sf); }',
'.sfh-col span{ font-size:11.5px; font-weight:600; color:var(--t3); margin-top:6px; height:16px; }',
'.sfh-col.hoy span{ color:var(--t1); }',
'.sfh-meta{ position:absolute; left:0; right:0; border-top:1.5px dashed color-mix(in srgb, var(--sf) 70%, transparent); pointer-events:none; z-index:1; }',
'.sfh-meta span{ position:absolute; left:0; top:-19px; font-size:10.5px; font-weight:700; color:var(--sf); background:var(--sheet-bg, var(--bg)); padding:0 6px 0 0; }',
'.sfh-media{ font-size:13.5px; color:var(--t2); margin-bottom:18px; }',
'.sfh-caja{ border-radius:20px; padding:16px; background:color-mix(in srgb, var(--t1) 4%, transparent); }',
'.sfh-t{ font-size:15px; font-weight:700; }',
'.sfh-obj{ font-size:12.5px; color:var(--t3); margin:3px 0 6px; }',
'.sfh .vl-rango{ accent-color:var(--sf); }',
'.sfh .vl-chips button.on{ background:color-mix(in srgb, var(--sf) 14%, transparent); color:var(--sf); box-shadow:inset 0 0 0 2px var(--sf); }',
'.sfh-guardar{ display:block; width:100%; margin-top:14px; padding:14px; border-radius:16px; font-size:15px; font-weight:700; color:#fff; background:var(--sf); }',
'.sfh-sec{ font-size:19px; font-weight:700; margin:26px 0 12px; }',
'.sfh-art{ display:block; width:100%; text-align:left; border-radius:20px; overflow:hidden; margin-bottom:14px;',
'  background:color-mix(in srgb, var(--t1) 4%, transparent); transition:transform .25s var(--spring); }',
'.sfh-art:active{ transform:scale(.98); }',
'.sfh-dib{ aspect-ratio:400/200; overflow:hidden; } .sfh-dib svg{ display:block; width:100%; height:100%; }',
'.sfh-art-t{ padding:14px 16px 16px; } .sfh-art-t b{ display:block; font-size:17px; font-weight:700; line-height:1.25; }',
'.sfh-art-t span{ display:block; font-size:13.5px; color:var(--t2); margin-top:4px; }',
'.sfh-volver{ flex:1; display:flex; align-items:center; gap:2px; font-size:15px; font-weight:600; color:var(--sf); }',
'.sfh-volver svg{ width:20px; height:20px; fill:none; stroke:currentColor; stroke-width:2.4; stroke-linecap:round; stroke-linejoin:round; margin-left:-4px; }',
'.sfh-dib.grande{ border-radius:20px; margin-bottom:18px; }',
'.sfh-leer h3{ font-size:24px; font-weight:800; letter-spacing:-.03em; line-height:1.15; }',
'.sfh-leer .sfh-ent{ font-size:15px; color:var(--t3); margin:6px 0 16px; }',
'.sfh-leer p{ font-size:15.5px; line-height:1.55; color:var(--t1); margin-bottom:12px; }'
  ].join("\n"); document.head.appendChild(st);
})();
