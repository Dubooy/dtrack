/* ════════════ Hoy con la estética de Salud del día ════════════
   Tarjetas lisas como agua, sueño y pantalla: icono y título en su color,
   número grande, una frase y las barritas de la semana con hoy en color.
   Sobrescribe hoyAnillo, anilloDetalle, tarjetaEstudio y tarjetaParte. */

/* funciones y no variables: Hoy se pinta antes de que esta pieza llegue a ejecutarse */
function hsIc(k){ return ({
  retos:'<path d="M7 3h10v2h3v3a4 4 0 0 1-4 4h-.4A5 5 0 0 1 13 14.9V17h3v3H8v-3h3v-2.1A5 5 0 0 1 8.4 12H8a4 4 0 0 1-4-4V5h3zM6 7v1a2 2 0 0 0 1 1.7V7zm12 0v2.7A2 2 0 0 0 18 8V7z"/>',
  habitos:'<path fill-rule="evenodd" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm-1.3 13.7 6-6-1.4-1.4-4.6 4.6-2.4-2.4-1.4 1.4z"/>',
  vital:'<path d="M12 20.6S3 15.2 3 9a4.8 4.8 0 0 1 9-2.4A4.8 4.8 0 0 1 21 9c0 6.2-9 11.6-9 11.6z"/>',
  estudio:'<path fill-rule="evenodd" d="M9.5 1.5h5v2h-5zM12 4.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17zm-1 4v5.1l3.8 2.3 1-1.7-2.8-1.7V8.5z"/>',
  parte:'<path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1z"/>'
})[k]; }
function hsColor(k){ return "--hs-"+k; }
function hsChev(){ return '<svg class="hs-chev" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>'; }

/* barritas de los últimos 7 días: f(d) devuelve de 0 a 1, o null si no hay nada */
function hsSemana(f){
  var hoy=today(), out="";
  for(var i=6;i>=0;i--){
    var v=f(addDays(hoy,-i)), tiene=v!=null && v>0;
    out+='<i class="'+(i===0?"hoy":"")+(tiene?"":" nada")+'" style="height:'+(tiene?Math.max(14, Math.min(100, Math.round(v*100))):8)+'%"></i>';
  }
  return out;
}
function hsTarjeta(k, titulo, num, unidad, msg, sem, attrs, extra){
  return '<button class="hs-fila'+(extra||"")+'" '+attrs+' style="--sf:var('+hsColor(k)+')">'+
    '<span class="hs-cab"><span class="hs-ic"><svg viewBox="0 0 24 24">'+hsIc(k)+'</svg></span><b>'+esc(titulo)+'</b><span class="hs-cuando">hoy</span>'+hsChev()+'</span>'+
    '<span class="hs-cuerpo"><span class="hs-dato"><span class="hs-num num">'+num+(unidad?'<small>'+unidad+'</small>':'')+'</span>'+
    '<span class="hs-msg">'+esc(msg)+'</span></span><span class="hs-sem" aria-hidden="true">'+sem+'</span></span></button>';
}

/* los tres anillos pasan a ser tarjetas; al tocar, vas a su sitio */
function hoyAnillo(v, max, col, centro, etiqueta, sub, act, jump){
  var k=/data-k="(\w+)/.exec(act||"");
  k=k?k[1]:"retos";
  var falta=Math.max(0,(max||0)-v), sem, msg, attrs, uni;
  if(k==="retos"){
    sem=hsSemana(function(d){ var n=todaysChallenges(d).length; return n?chOf(d).length/n:null; });
    msg= !max ? "Hoy no hay retos" : falta ? (falta===1?"Te queda 1 reto":"Te quedan "+falta+" retos") : "Los tres hechos: XP ×1,5";
    attrs='data-jump="retos"'; uni="de "+max+" retos";
  } else if(k==="habitos"){
    var n=Math.max(1, idealActivos().length);
    sem=hsSemana(function(d){ return checksOf(d).length/n; });
    msg= !max ? "Añade tus hábitos" : falta ? (falta===1?"Te queda 1 hábito":"Te quedan "+falta+" hábitos") : "Todos hechos hoy";
    attrs='data-act="x-ir-habitos"'; uni="de "+max+" hábitos";
  } else {
    sem=hsSemana(function(d){ return saludHoy(d)/4; });
    msg= falta ? "Ejercicio, agua, sueño y pantalla" : "Cuerpo al día";
    attrs='data-jump="vital"'; uni="de 4";
  }
  /* una columna de la tarjeta de arriba: icono, título, número y barritas */
  return '<button class="hs-col'+(falta||!max?"":" ok")+'" '+attrs+' style="--sf:var('+hsColor(k)+')" aria-label="'+esc(etiqueta+": "+v+" "+uni+". "+msg)+'">'+
    '<span class="hs-cab"><span class="hs-ic"><svg viewBox="0 0 24 24">'+hsIc(k)+'</svg></span><b>'+esc(etiqueta)+'</b></span>'+
    '<span class="hs-num num">'+v+'<small>/'+(max||0)+'</small></span></button>';
}
function anilloDetalle(){ return ""; }

/* Estudiar y Parte del día, lado a lado y con poco texto; el Parte, el protagonista */
function tarjetaEstudio(){
  var a=S.estudio && S.estudio.actual, min=estudioMinDia(today());
  var t="Estudiar", sub=min ? horasTxt(min)+" hoy" : "Pomodoro", act="x-estudiar", extra="";
  if(a){
    var rest=Math.max(0, a.fin ? a.fin-Date.now() : (a.resto||0)), mm=Math.floor(rest/60000), ss=Math.floor(rest%60000/1000);
    t=a.fase==="descanso"?"Descanso":a.fase==="listo"?"Terminado":(a.fin?"Estudiando":"En pausa");
    sub='<b class="num" id="hy-est-t">'+(a.fase==="listo"?"✓":(mm<10?"0":"")+mm+":"+(ss<10?"0":"")+ss)+'</b>'; act="x-hoy-estudio"; extra=" activo";
  } else sub=esc(sub);
  return '<button class="hs-fila hs-est'+extra+'" data-act="'+act+'" style="--sf:var(--hs-estudio)">'+
    '<span class="hs-ic"><svg viewBox="0 0 24 24">'+hsIc("estudio")+'</svg></span>'+
    '<b class="hs-t">'+esc(t)+'</b><span class="hs-s">'+sub+'</span></button>';
}
function tarjetaParte(){
  var hoy=today(), hecho=!!(S.parte && S.parte[hoy]), hh=new Date().getHours(), toca=(hh>=19||hh<4);
  var sub = hecho ? "Hecho. Buenas noches" : toca ? "Un minuto para cerrar el día" : "Esta noche, un minuto";
  return '<button class="hs-fila hs-parte'+(hecho?" ok":toca?" toca":"")+'" data-act="parte" style="--sf:var(--hs-parte)">'+
    '<span class="hs-luna"><svg viewBox="0 0 24 24">'+hsIc("parte")+'</svg></span>'+
    '<b class="hs-t">Parte del día</b><span class="hs-s">'+esc(sub)+'</span>'+
    (hecho?'':'<span class="hs-boton">'+(toca?"Empezar":"Ver")+'</span>')+'</button>';
}

/* la gráfica de hábitos se despliega al tocar su título */
document.addEventListener("click", function(e){
  var t=e.target.closest && e.target.closest("#ideal-graf > div:first-child"); if(!t) return;
  var c=document.getElementById("card-ideal"); if(c) c.classList.toggle("graf-abierta");
});

(function(){
  var st=document.createElement("style");
  st.textContent=[
':root{ --hs-retos:#e8930c; --hs-habitos:#1f9d6b; --hs-vital:#ff375f; --hs-estudio:#0a9fb5; --hs-parte:#a54fd6; --hs-leer:#a0703c; --hs-xp:#c98a1b; }',
'html.dark{ --hs-retos:#ffb340; --hs-habitos:#3ed598; --hs-vital:#ff6482; --hs-estudio:#40cbe0; --hs-parte:#c77dff; --hs-leer:#d0a06a; --hs-xp:#f2c14e; }',
/* las tarjetas */
/* arriba: una sola tarjeta con Retos, Hábitos y Cuerpo en tres columnas */
'#hoy .hy-anillos{ display:grid!important; grid-template-columns:repeat(3,1fr); gap:10px; max-width:none!important; margin-top:0; }',
'.hs-col{ display:flex; flex-direction:column; align-items:flex-start; text-align:left; padding:14px 14px 14px; min-width:0; border-radius:20px;',
'  background:var(--tarjeta, var(--glass-bg)); -webkit-tap-highlight-color:transparent; transition:transform .25s var(--spring); }',
'.hs-col:active{ transform:scale(.95); }',
'.hs-col .hs-cab{ width:100%; gap:5px; }',
'.hs-col .hs-cab b{ font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
'.hs-col .hs-ic, .hs-col .hs-ic svg{ width:16px; height:16px; }',
'.hs-col .hs-num{ margin-top:14px; font-size:30px; }',
'.hs-col .hs-num small{ margin-left:2px; font-size:13px; }',
'.hs-col .hs-sem{ height:30px; gap:3px; margin-top:12px; }',
'.hs-col .hs-sem i{ width:6px; border-radius:2px; }',
/* Estudiar y Parte del día: el Parte, ancho y primero; Estudiar, pequeño al lado */
'#hoy .hy-dos{ display:grid!important; grid-template-columns:1.7fr 1fr; gap:10px; max-width:none!important; margin-top:10px; }',
'#hoy .hy-dos > div{ display:flex; min-width:0; }',
'#hoy #hoy-parte{ order:-1; }',
'.hy-dos .hs-fila{ display:flex; flex-direction:column; align-items:flex-start; padding:16px; border-radius:20px; }',
'.hy-dos .hs-t{ font-size:16px; font-weight:600; color:var(--t1); margin-top:auto; padding-top:14px; }',
'.hy-dos .hs-s{ font-size:13px; color:var(--t3); margin-top:2px; line-height:1.3; }',
'.hy-dos .hs-s b{ font-family:Unbounded,sans-serif; font-size:20px; color:var(--sf); }',
'.hs-est .hs-ic{ color:var(--sf); width:26px; height:26px; }',
'.hs-est .hs-ic svg{ width:26px; height:26px; }',
/* el Parte: fondo de noche con su color, luna grande y botón */
'.hs-parte{ position:relative; overflow:hidden; color:#fff;',
'  background:linear-gradient(160deg, color-mix(in srgb, var(--sf) 82%, #1a1030), color-mix(in srgb, var(--sf) 45%, #0d0820))!important; }',
'.hs-parte .hs-t{ color:#fff; font-size:19px; font-weight:700; padding-top:30px; }',
'.hs-parte .hs-s{ color:rgba(255,255,255,.78); }',
'.hs-luna{ width:40px; height:40px; color:#fff; filter:drop-shadow(0 0 12px rgba(255,255,255,.45)); }',
'.hs-luna svg{ width:40px; height:40px; fill:currentColor; }',
'.hs-boton{ margin-top:12px; padding:7px 14px; border-radius:99px; background:#fff; color:color-mix(in srgb, var(--sf) 80%, #000); font-size:13.5px; font-weight:700; }',
'.hs-parte.ok{ background:var(--tarjeta, var(--glass-bg))!important; color:var(--t1); }',
'.hs-parte.ok .hs-t{ color:var(--t1); } .hs-parte.ok .hs-s{ color:var(--sf); font-weight:600; } .hs-parte.ok .hs-luna{ color:var(--sf); filter:none; }',
/* gráfica de hábitos plegada hasta que la tocas */
'#ideal-graf > div:first-child{ cursor:pointer; margin-bottom:0!important; align-items:center!important; }',
'#ideal-graf > div:first-child > span:first-child{ font-size:14px!important; font-weight:600; color:var(--hs-habitos)!important; }',
'#ideal-graf > div:first-child::after{ content:""; width:9px; height:9px; margin-left:8px; border:solid var(--t3); border-width:0 2px 2px 0; transform:rotate(45deg) translateY(-3px); transition:transform .25s; }',
'#card-ideal.graf-abierta #ideal-graf > div:first-child::after{ transform:rotate(-135deg) translateY(-3px); }',
'#card-ideal.graf-abierta #ideal-graf > div:first-child{ margin-bottom:8px!important; }',
'#card-ideal:not(.graf-abierta) #ideal-graf > *:not(:first-child){ display:none!important; }',
/* sin bordes en ninguna ventana de la app */
'.glass::before{ display:none!important; }',
'.hs-fila{ --sf:var(--accent); display:block; width:100%; text-align:left; padding:16px 18px 18px; border-radius:24px; cursor:pointer;',
'  background:var(--tarjeta, var(--glass-bg)); box-shadow:none;',
'  -webkit-tap-highlight-color:transparent; transition:transform .25s var(--spring); }',
'.hs-fila:active{ transform:scale(.985); }',
'.hs-cab{ display:flex; align-items:center; gap:7px; color:var(--sf); }',
'.hs-cab b{ font-size:15.5px; font-weight:600; flex:1; }',
'.hs-ic{ display:grid; place-items:center; width:20px; height:20px; }',
'.hs-ic svg{ width:19px; height:19px; fill:currentColor; }',
'.hs-cuando{ font-size:13.5px; color:var(--t3); }',
'.hs-chev{ width:15px; height:15px; fill:none; stroke:var(--t3); stroke-width:2.4; stroke-linecap:round; stroke-linejoin:round; margin-right:-3px; }',
'.hs-cuerpo{ display:flex; align-items:flex-end; justify-content:space-between; gap:14px; margin-top:22px; }',
'.hs-dato{ min-width:0; display:block; }',
'.hs-num{ display:block; font-family:Unbounded,sans-serif; font-weight:700; font-size:34px; letter-spacing:-.05em; line-height:1; color:var(--t1); }',
'.hs-num small{ font-family:Inter,sans-serif; font-size:14px; font-weight:600; letter-spacing:0; color:var(--t3); margin-left:6px; }',
'.hs-msg{ display:block; font-size:12.5px; color:var(--t3); margin-top:8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
'.hs-fila.ok .hs-msg, .hs-fila.toca .hs-msg{ color:var(--sf); font-weight:600; }',
'.hs-sem{ flex:none; display:flex; align-items:flex-end; gap:4px; height:52px; }',
'.hs-sem i{ width:8px; border-radius:2.5px; background:color-mix(in srgb, var(--t1) 22%, transparent); }',
'.hs-sem i.nada{ background:color-mix(in srgb, var(--t1) 10%, transparent); }',
'.hs-sem i.hoy{ background:var(--sf); }',
'.hs-sem i.hoy.nada{ background:color-mix(in srgb, var(--sf) 35%, transparent); }',
/* el resto de Hoy: títulos con icono y color, sin degradados */
'#card-ideal, #hy-xp, #hy-evo .he-main, #lb-hab .lb-desc{ background:var(--tarjeta, var(--glass-bg))!important; box-shadow:none!important; border:0!important; border-radius:22px!important; }',
'#hoy .hs-fila, #card-ideal, #hy-xp, #hy-evo, #hy-evo .he-main{ border:0!important; outline:0!important; }',

'#card-ideal h2{ display:flex; align-items:center; gap:7px; font-family:inherit!important; font-size:15.5px!important; font-weight:600!important; color:var(--hs-habitos); }',
'#card-ideal h2::before{ content:""; width:19px; height:19px; background:currentColor;',
'  -webkit-mask:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\'%3E%3Cpath fill-rule=\'evenodd\' d=\'M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm-1.3 13.7 6-6-1.4-1.4-4.6 4.6-2.4-2.4-1.4 1.4z\'/%3E%3C/svg%3E") center/contain no-repeat;',
'  mask:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\'%3E%3Cpath fill-rule=\'evenodd\' d=\'M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm-1.3 13.7 6-6-1.4-1.4-4.6 4.6-2.4-2.4-1.4 1.4z\'/%3E%3C/svg%3E") center/contain no-repeat; }',
'#card-ideal{ padding:18px 18px 20px!important; margin-top:12px; }',
'#ideal-bar{ background:var(--hs-habitos)!important; }',
/* hábitos como una lista de Salud: filas con raya fina entre ellas, sin puntos */
'#ideal-list{ max-height:none!important; overflow:visible!important; padding:0!important; margin:0!important; }',
'#ideal-list > div{ padding:12px 0!important; box-shadow:inset 0 -1px 0 var(--hairline); }',
'#ideal-list > div:last-child{ box-shadow:none; }',
'#ideal-list span.w-1\\.5{ display:none; }',
'#ideal-list button.text-left{ font-size:16px!important; }',
'#ideal-list .tick{ width:24px; height:24px; box-shadow:inset 0 0 0 1.8px color-mix(in srgb, var(--t1) 25%, transparent); }',
'#ideal-list .done .tick, #ideal-list > .done .tick{ background:var(--hs-habitos); box-shadow:inset 0 0 0 1.8px var(--hs-habitos); }',
'#card-ideal .tick.on, #card-ideal .tick[aria-pressed="true"]{ background:var(--hs-habitos)!important; border-color:var(--hs-habitos)!important; }',
'#lb-hab .eyebrow{ color:var(--hs-leer)!important; letter-spacing:0!important; text-transform:none!important; font-size:15.5px!important; font-weight:600!important; }',
'#lb-hab .lb-desc{ background-image:none!important; }',
'#hy-evo .he-ey, #hy-evo .he-ico{ color:var(--hs-estudio)!important; }',
'#hy-evo .he-ey{ font-size:15.5px!important; font-weight:600!important; letter-spacing:0!important; text-transform:none!important; }',
'#hy-evo .he-t{ font-family:Unbounded,sans-serif!important; font-size:24px!important; letter-spacing:-.04em; }',
'#hy-xp .hy-xp-hoy b{ font-family:Unbounded,sans-serif; letter-spacing:-.04em; color:var(--hs-xp); }'
  ].join("\n"); document.head.appendChild(st);
  document.documentElement.style.setProperty("--tarjeta-borde", "transparent");
})();
