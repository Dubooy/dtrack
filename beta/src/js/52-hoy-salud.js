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
  return hsTarjeta(k, etiqueta, v, uni, msg, sem, attrs, falta||!max?"":" ok");
}
function anilloDetalle(){ return ""; }

function tarjetaEstudio(){
  var a=S.estudio && S.estudio.actual, hoy=today(), min=estudioMinDia(hoy), max=30, semana=0;
  for(var i=0;i<7;i++){ var m=estudioMinDia(addDays(hoy,-i)); semana+=m; if(m>max) max=m; }
  var sem=hsSemana(function(d){ return estudioMinDia(d)/max; });
  if(a){
    var rest=Math.max(0, a.fin ? a.fin-Date.now() : (a.resto||0)), mm=Math.floor(rest/60000), ss=Math.floor(rest%60000/1000);
    var fase=a.fase==="descanso"?"Descanso":a.fase==="listo"?"Bloque terminado":(a.fin?"Concentración":"En pausa");
    return '<button class="hs-fila activo" data-act="x-hoy-estudio" style="--sf:var(--hs-estudio)">'+
      '<span class="hs-cab"><span class="hs-ic"><svg viewBox="0 0 24 24">'+hsIc("estudio")+'</svg></span><b>'+esc(fase)+'</b><span class="hs-cuando">ahora</span>'+hsChev()+'</span>'+
      '<span class="hs-cuerpo"><span class="hs-dato"><span class="hs-num num" id="hy-est-t">'+(a.fase==="listo"?"✓":(mm<10?"0":"")+mm+":"+(ss<10?"0":"")+ss)+'</span>'+
      '<span class="hs-msg">'+esc(a.nombre||"")+'</span></span><span class="hs-sem" aria-hidden="true">'+sem+'</span></span></button>';
  }
  var h=Math.floor(min/60), r=min%60;
  var num= !min ? "0" : h ? h+'<small>h</small> '+r : String(min);
  return hsTarjeta("estudio", "Estudiar", num, "min",
    semana ? horasTxt(semana)+" esta semana" : "Empieza un pomodoro", sem, 'data-act="x-estudiar"');
}

function tarjetaParte(){
  var hoy=today(), hecho=!!(S.parte && S.parte[hoy]), hh=new Date().getHours(), toca=(hh>=19||hh<4);
  var sem=hsSemana(function(d){
    if(!(S.parte && S.parte[d])) return null;
    var an=(typeof animoDe==="function"&&animoDe(d))||{};
    return an.v ? (20+an.v*16)/100 : .6;
  });
  var racha=0, d2=hecho?hoy:addDays(hoy,-1); while(S.parte && S.parte[d2] && racha<400){ racha++; d2=addDays(d2,-1); }
  var msg = hecho ? "Hecho · +"+dayXP(hoy,tasksByDay())+" XP hoy" : toca ? "Toca ahora: un minuto para cerrar el día" : "Esta noche, un minuto para repasar el día";
  return hsTarjeta("parte", "Parte del día", racha, racha===1?"noche seguida":"noches seguidas", msg, sem, 'data-act="parte"', hecho?" ok":toca?" toca":"");
}

(function(){
  var st=document.createElement("style");
  st.textContent=[
':root{ --hs-retos:#e8930c; --hs-habitos:#1f9d6b; --hs-vital:#ff375f; --hs-estudio:#0a9fb5; --hs-parte:#a54fd6; --hs-leer:#a0703c; --hs-xp:#c98a1b; }',
'html.dark{ --hs-retos:#ffb340; --hs-habitos:#3ed598; --hs-vital:#ff6482; --hs-estudio:#40cbe0; --hs-parte:#c77dff; --hs-leer:#d0a06a; --hs-xp:#f2c14e; }',
/* las tarjetas */
'#hoy .hy-anillos, #hoy .hy-dos{ display:flex!important; flex-direction:column; gap:12px; max-width:none!important; margin-top:0; }',
'#hoy .hy-dos{ margin-top:12px; }',
'#hoy .hy-dos > div{ display:block; }',
'.hs-fila{ --sf:var(--accent); display:block; width:100%; text-align:left; padding:16px 18px 18px; border-radius:24px; cursor:pointer;',
'  background:var(--tarjeta, var(--glass-bg)); box-shadow:0 0 0 1px var(--tarjeta-borde, var(--hairline));',
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
'#card-ideal, #hy-xp, #hy-evo .he-main, #lb-hab .lb-desc{ background:var(--tarjeta, var(--glass-bg))!important; box-shadow:0 0 0 1px var(--tarjeta-borde, var(--hairline))!important; border-radius:24px!important; }',
'#card-ideal h2{ display:flex; align-items:center; gap:7px; font-family:inherit!important; font-size:15.5px!important; font-weight:600!important; color:var(--hs-habitos); }',
'#card-ideal h2::before{ content:""; width:19px; height:19px; background:currentColor;',
'  -webkit-mask:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\'%3E%3Cpath fill-rule=\'evenodd\' d=\'M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm-1.3 13.7 6-6-1.4-1.4-4.6 4.6-2.4-2.4-1.4 1.4z\'/%3E%3C/svg%3E") center/contain no-repeat;',
'  mask:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\'%3E%3Cpath fill-rule=\'evenodd\' d=\'M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm-1.3 13.7 6-6-1.4-1.4-4.6 4.6-2.4-2.4-1.4 1.4z\'/%3E%3C/svg%3E") center/contain no-repeat; }',
'#card-ideal{ padding:18px 18px 20px!important; margin-top:12px; }',
'#ideal-bar{ background:var(--hs-habitos)!important; }',
'#card-ideal .tick.on, #card-ideal .tick[aria-pressed="true"]{ background:var(--hs-habitos)!important; border-color:var(--hs-habitos)!important; }',
'#lb-hab .eyebrow{ color:var(--hs-leer)!important; letter-spacing:0!important; text-transform:none!important; font-size:15.5px!important; font-weight:600!important; }',
'#lb-hab .lb-desc{ background-image:none!important; }',
'#hy-evo .he-ey, #hy-evo .he-ico{ color:var(--hs-estudio)!important; }',
'#hy-evo .he-ey{ font-size:15.5px!important; font-weight:600!important; letter-spacing:0!important; text-transform:none!important; }',
'#hy-evo .he-t{ font-family:Unbounded,sans-serif!important; font-size:24px!important; letter-spacing:-.04em; }',
'#hy-xp .hy-xp-hoy b{ font-family:Unbounded,sans-serif; letter-spacing:-.04em; color:var(--hs-xp); }'
  ].join("\n"); document.head.appendChild(st);
})();
