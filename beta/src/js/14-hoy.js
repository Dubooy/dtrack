/* ════════════════════════════════════════════════════════════════
   HOY: el nuevo Resumen. Centrado en ti: tu día en tres anillos, el
   temporizador de estudio y el parte del día como piezas principales,
   lo que te toca ahora, y el grupo solo como una línea si lo tienes.
   ════════════════════════════════════════════════════════════════ */
function academicoOff(){ return prefValor("academico")===false; }

var ICO_RELOJ='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9.5 2.5h5"/></svg>';
var ICO_LUNA='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1z"/></svg>';

function hoyAnillo(v, max, col, centro, etiqueta, sub, act, jump){
  var p = max ? Math.min(1, v/max) : 0;
  return '<button class="hy-anillo" '+(act?'data-act="'+act+'"':'data-jump="'+jump+'"')+' style="--c:'+col+'">'+
    '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42" class="hy-pista"/>'+
      '<circle cx="50" cy="50" r="42" class="hy-arco" pathLength="100" stroke-dasharray="100" transform="rotate(-90 50 50)" style="stroke-dashoffset:'+(100-p*100).toFixed(1)+(p<=0?';opacity:0':'')+'"/>'+
      numTexto(centro, String(centro).length>3?24:28, "hy-num")+
    '</svg><b>'+etiqueta+'</b></button>';
}
function saludHoy(d){
  var h=S.habits[d]||{}, n=0;
  if(wentGym(d)) n++;
  if((h.water||0)>=8) n++;
  if((h.sleep||0)>=7) n++;
  if(h.screen!=null && h.screen>0 && h.screen<2) n++;
  return n;
}

function letrasSemana(){
  var h='', hoy=today();
  for(var i=6;i>=0;i--){ var d=addDays(hoy,-i); h+='<span'+(i===0?' class="hoy"':'')+'>'+L10N.sem[(new Date(d+"T00:00:00").getDay()+6)%7]+'</span>'; }
  return '<div class="hy-letras">'+h+'</div>';
}
/* ── la tarjeta de estudio ── */
function tarjetaEstudio(){
  var a=S.estudio && S.estudio.actual, hoy=today(), min=estudioMinDia(hoy);
  var dias=[], max=30;
  for(var i=6;i>=0;i--){ var m=estudioMinDia(addDays(hoy,-i)); dias.push(m); if(m>max) max=m; }
  var semana=dias.reduce(function(s,x){ return s+x; },0);
  var barras=dias.map(function(m,i){ return '<i class="'+(i===6?"hoy":"")+'"><u style="height:'+(m?Math.max(10, Math.round(m/max*100)):0)+'%"></u></i>'; }).join("");
  var marcas=""; for(var k=0;k<24;k++){ var ang=k*15; marcas+='<line x1="50" y1="8" x2="50" y2="'+(k%6===0?16:13)+'" transform="rotate('+ang+' 50 50)"/>'; }
  if(a){
    var rest=Math.max(0, a.fin ? a.fin-Date.now() : (a.resto||0)), mm=Math.floor(rest/60000), ss=Math.floor(rest%60000/1000);
    var fase=a.fase==="descanso"?"Descanso":a.fase==="listo"?"Bloque terminado":(a.fin?"Concentración":"En pausa");
    return '<button class="hy-tarjeta hy-estudio activo" data-act="x-hoy-estudio">'+
      '<div class="hy-dial"><svg viewBox="0 0 100 100">'+marcas+'</svg><b class="num" id="hy-est-t">'+(a.fase==="listo"?"✓":(mm<10?"0":"")+mm+":"+(ss<10?"0":"")+ss)+'</b></div>'+
      '<p class="hy-t">'+esc(fase)+'</p><p class="hy-s">'+esc(a.nombre)+'</p>'+
      '<span class="hy-boton">Volver</span></button>';
  }
  return '<button class="hy-tarjeta hy-estudio" data-act="x-estudiar">'+
    '<div class="hy-dial"><svg viewBox="0 0 100 100">'+marcas+'</svg><span class="hy-dial-ico">'+ICO_RELOJ+'</span></div>'+
    '<p class="hy-t">Estudiar</p><p class="hy-s">'+(min?horasTxt(min)+" hoy":"Aún nada hoy")+'</p>'+
    '<div class="hy-barras" title="Minutos de estudio de los últimos 7 días">'+barras+'</div>'+letrasSemana()+
    '<p class="hy-pie num">'+(semana?horasTxt(semana)+" esta semana":"Empieza un pomodoro")+'</p></button>';
}
/* ── la tarjeta del parte ── */
function tarjetaParte(){
  var hoy=today(), hecho=!!(S.parte && S.parte[hoy]), h=new Date().getHours(), toca=(h>=19||h<4);
  /* cada noche, una barra: alta si te fue bien (el ánimo que pusiste), vacía si no hubo parte */
  var lunas=""; for(var i=6;i>=0;i--){ var d=addDays(hoy,-i), ok=!!(S.parte && S.parte[d]), an=(typeof animoDe==="function"&&animoDe(d))||{};
    var alto= ok ? (an.v ? 20+an.v*16 : 60) : 0;
    lunas+='<i class="'+(i===0?"hoy":"")+'"><u style="height:'+alto+'%"></u></i>'; }
  var racha=0, d2=hecho?hoy:addDays(hoy,-1); while(S.parte && S.parte[d2] && racha<400){ racha++; d2=addDays(d2,-1); }
  var t, s;
  t="Parte del día";
  if(hecho) s="Hecho · +"+dayXP(hoy,tasksByDay())+" XP hoy";
  else if(toca) s="Toca ahora: un minuto para cerrar el día";
  else s="Esta noche, un minuto para repasar el día";
  return '<button class="hy-tarjeta hy-parte'+(hecho?" hecho":"")+(toca&&!hecho?" toca":"")+'" data-act="parte">'+
    '<div class="hy-luna">'+ICO_LUNA+'</div>'+
    '<p class="hy-t">'+t+'</p><p class="hy-s">'+s+'</p>'+
    '<div class="hy-barras hy-noches" title="Noches con Parte del día (la altura es cómo te fue)">'+lunas+'</div>'+letrasSemana()+
    '<p class="hy-pie num">'+(racha>1?racha+" noches seguidas":"Una vez cada noche")+'</p></button>';
}

/* ── para hoy: lo que toca, con su casilla ── */
function claseAhora(){
  if(academicoOff()) return null;
  try{
    var di=dayIdx(); if(di<0) return null;
    var sl=slotsFor(di);
    for(var i=0;i<sl.length;i++){
      if(sl[i].r || !isNow(sl[i])) continue;
      var c=cellOf(di+"-"+sl[i].ci), sb=c?subj(c.sid):null; if(!sb) return null;
      return { n:sb.name, col:sb.color, room:c.room||"", hasta:sl[i].e };
    }
  }catch(e){}
  return null;
}
function listaHoy(){
  var t=today(), filas=[];
  /* clase de ahora y examen cercano, solo si usas lo académico */
  var cl=claseAhora();
  if(cl) filas.push('<div class="hy-fila info"><span class="hy-punto" style="background:'+cl.col+'"></span><span class="hy-txt"><b>Ahora: '+esc(cl.n)+'</b>'+(cl.room?' · '+esc(cl.room):'')+'</span><span class="hy-meta num">hasta '+cl.hasta+'</span></div>');
  if(!academicoOff()){
    var ex=future()[0];
    if(ex){ var dd=diff(t,ex.date); if(dd<=3) filas.push('<div class="hy-fila info" data-jump="academico"><span class="hy-punto" style="background:var(--alert)"></span><span class="hy-txt"><b>'+esc(ex.title)+'</b></span><span class="hy-meta">'+(dd===0?"hoy":dd===1?"mañana":"en "+dd+" días")+'</span></div>'); }
  }
  /* las 3 que elegiste anoche */
  var plan=(S.plan&&S.plan[t])||[], vistos={};
  plan.forEach(function(id,ix){
    var tk=taskById(id); if(!tk) return; vistos[id]=1;
    filas.push('<div class="hy-fila'+(tk.done?" done":"")+'"><button class="tick tick-sm" data-act="toggle" data-id="'+tk.id+'" aria-label="Marcar">'+ICON_CHECK+'</button>'+
      '<button class="hy-txt" data-act="toggle" data-id="'+tk.id+'"><span class="strike">'+esc(tk.text)+'</span></button><span class="hy-meta hy-prio">'+(ix+1)+'</span></div>');
  });
  /* los retos del día */
  var md=chOf(t);
  todaysChallenges(t).forEach(function(c){
    var on=md.indexOf(c.id)>=0;
    filas.push('<div class="hy-fila'+(on?" done":"")+'"><button class="tick tick-sm" data-act="ch" data-id="'+c.id+'" data-day="'+t+'" aria-label="Marcar">'+ICON_CHECK+'</button>'+
      '<button class="hy-txt" data-act="ch" data-id="'+c.id+'" data-day="'+t+'"><span class="strike">'+esc(c.text)+'</span></button><span class="hy-meta hy-reto">reto</span></div>');
  });
  /* lo siguiente de tu checklist, por hora */
  var ck=checksOf(t), ahoraM=new Date().getHours()*60+new Date().getMinutes();
  var pend=ordenIdeal(idealActivos()).filter(function(it){ return ck.indexOf(it.id)<0; });
  function mins(x){ if(!x.time) return 9999; var p=x.time.split(":"); return +p[0]*60 + +p[1]; }
  var sig=pend.filter(function(it){ return mins(it)>=ahoraM-60; }).slice(0,2);
  if(!sig.length) sig=pend.slice(0,1);
  sig.forEach(function(it){
    filas.push('<div class="hy-fila"><button class="tick tick-sm" data-act="check" data-id="'+it.id+'" data-day="'+t+'" aria-label="Marcar">'+ICON_CHECK+'</button>'+
      '<button class="hy-txt" data-act="check" data-id="'+it.id+'" data-day="'+t+'"><span class="strike">'+esc(it.text)+'</span></button><span class="hy-meta num">'+esc(it.time||"")+'</span></div>');
  });
  /* tareas: vencidas, de hoy y las siguientes */
  var tareas=S.tasks.filter(function(x){ return !x.done && !vistos[x.id]; }).sort(function(a,b){
    var da=a.due||"9999", db=b.due||"9999"; return da<db?-1:da>db?1:0; }).slice(0,3);
  tareas.forEach(function(tk){
    var cuando = tk.due ? (tk.due<t?"atrasada":tk.due===t?"hoy":diff(t,tk.due)===1?"mañana":fmt(tk.due)) : "";
    filas.push('<div class="hy-fila"><button class="tick tick-sm" data-act="toggle" data-id="'+tk.id+'" aria-label="Marcar">'+ICON_CHECK+'</button>'+
      '<button class="hy-txt" data-act="toggle" data-id="'+tk.id+'"><span class="strike">'+esc(tk.text)+'</span></button>'+
      '<span class="hy-meta'+(tk.due&&tk.due<t?" tarde":"")+'">'+esc(cuando)+'</span></div>');
  });
  return filas;
}

/* ── el grupo, en una línea y solo si hay grupo ── */
function lineaGrupo(){
  if(typeof GRUPO==="undefined" || !GRUPO || typeof rachaGrupo!=="function") return "";
  var r=rachaGrupo(); if(!r) return "";
  return '<button class="hy-grupo" data-jump="social"><span class="hy-caras">'+GRUPO.miembros.slice(0,4).map(function(m){ return caraDe(m,24); }).join("")+'</span>'+
    '<span class="hy-grupo-t">'+r.cerrados.length+' de '+GRUPO.miembros.length+' han hecho el Parte del día · racha '+r.dias+'</span>'+
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></button>';
}

function pintaHoy(st){
  var sec=document.getElementById("v-resumen"); if(!sec) return;
  var box=document.getElementById("hoy");
  if(!box){
    box=document.createElement("div"); box.id="hoy";
    var ej=document.getElementById("ejemplos"); ej.parentNode.insertBefore(box, ej);
  }
  var t=today(), tc=todaysChallenges(t).length, cd=chOf(t).length, ni=idealActivos().length, ck=checksOf(t).length, sa=saludHoy(t);
  /* la frase de arriba habla de ti, no de exámenes */
  var sub=document.getElementById("hero-sub");
  if(sub){
    var qr=Math.max(0,tc-cd), qt=S.tasks.filter(function(x){ return !x.done; }).length, hh=new Date().getHours();
    var parteHecho=!!(S.parte&&S.parte[t]);
    /* por la mañana, lo siguiente de tu checklist */
    var sigCk=null;
    if(hh>=5 && hh<12){ var _ck=checksOf(t); sigCk=ordenIdeal(idealActivos()).filter(function(it){ return _ck.indexOf(it.id)<0; })[0]||null; }
    sub.textContent = (hh>=21 || hh<5) ? (parteHecho ? "Parte del día hecho. Buenas noches." : "Te queda el Parte del día: un minuto y a dormir.")
      : sigCk ? "Lo siguiente: "+sigCk.text+(sigCk.time?" · "+sigCk.time:"")+"."
      : qr>1 ? "Te quedan "+qr+" retos por hacer hoy."
      : qr===1 ? "Te queda 1 reto por hacer hoy."
      : qt>1 ? "Retos hechos. Te quedan "+qt+" tareas."
      : qt===1 ? "Retos hechos. Te queda 1 tarea."
      : (hh>=19 && !(S.parte&&S.parte[t])) ? "Todo hecho. Solo falta el Parte del día."
      : "Hoy lo llevas todo al día.";
  }
  box.innerHTML=
    '<div class="hy-anillos" id="hoy-anillos">'+
      hoyAnillo(cd, tc, "var(--accent)", cd+"/"+tc, "Retos", "", "x-anillo\" data-k=\"retos", null)+
      hoyAnillo(ck, ni, "var(--violet)", ck+"/"+ni, "Hábitos", "", "x-anillo\" data-k=\"habitos", null)+
      hoyAnillo(sa, 4, "var(--good)", sa+"/4", (S.labels&&S.labels.vital)||"Vital", "", "x-anillo\" data-k=\"vital", null)+
    '</div>'+(typeof anilloDetalle==="function"?anilloDetalle():'')+
    '<div class="hy-dos"><div id="hoy-estudio">'+tarjetaEstudio()+'</div><div id="hoy-parte">'+tarjetaParte()+'</div></div>';
  /* la racha, discreta, junto a la fecha */
  var hd=document.getElementById("hero-date");
  if(hd && !hd.querySelector(".hy-racha") && st.streak>0) hd.insertAdjacentHTML("beforeend",' <span class="hy-racha">'+ICON_LLAMA+'<b class="num">'+st.streak+'</b></span>');
  /* la checklist de siempre, justo debajo */
  var ci=document.getElementById("card-ideal");
  if(ci && ci.previousElementSibling!==box) box.parentNode.insertBefore(ci, box.nextSibling);
  if(typeof hoyNuevo==="function") hoyNuevo(st);   /* diseño nuevo (56) */
  hoyAjusta();
}
/* lo de arriba (saludo, anillos y tarjetas) llena la pantalla hasta la barra;
   al bajar aparece la checklist */
function hoyAjusta(){
  var box=document.getElementById("hoy"); if(!box) return;
  if(window.innerWidth>=1024 || view!=="resumen"){ box.style.minHeight=""; return; }
  var bar=document.querySelector(".bottombar"), bh=bar?bar.getBoundingClientRect().height:0;
  var top=box.getBoundingClientRect().top+(window.scrollY||0);
  var alto=Math.round((window.innerHeight||800)-top-bh-24);
  box.style.minHeight=Math.max(360, alto)+"px";
}
window.addEventListener("resize", function(){ hoyAjusta(); });
/* el reloj de la tarjeta de estudio, en vivo */
setInterval(function(){
  var el=document.getElementById("hy-est-t"), a=S && S.estudio && S.estudio.actual;
  if(!el || !a || !a.fin || view!=="resumen") return;
  var rest=Math.max(0,a.fin-Date.now()), mm=Math.floor(rest/60000), ss=Math.floor(rest%60000/1000);
  el.textContent=(mm<10?"0":"")+mm+":"+(ss<10?"0":"")+ss;
}, 1000);


/* ════════════════ el parte del día, a pantalla completa ════════════════
   Estas funciones sustituyen a las de serie (se declaran después y ganan).
   Cinco pasos con su icono, una barra de progreso arriba, el contenido en el
   centro y un botón grande abajo. Al terminar, la pantalla "se apaga" con la
   luna y un buenas noches. */
var PT_ICO=[
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3h8v4a4 4 0 0 1-8 0V3z"/><path d="M16 4.5h3v2a3 3 0 0 1-3 3M8 4.5H5v2a3 3 0 0 0 3 3"/><path d="M12 11v4M9 21h6l-.5-3h-5L9 21z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5c3 3.6 5 6.3 5 9a5 5 0 0 1-10 0c0-2.7 2-5.4 5-9z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18h18M6 18a6 6 0 0 1 12 0M12 5v3M4.2 10.2l2 1.5M19.8 10.2l-2 1.5"/></svg>',
  ICO_LUNA
];
var ptPasoAnterior=-1;
function parteOpen(){
  parteOn=true; parteStep=0; ptPasoAnterior=-1;
  try{ selDay=null; }catch(e){}
  var p=document.getElementById("parte"); p.hidden=false;
  p.classList.remove("pt-sale"); p.classList.add("pt-abre");
  renderParte(); sonido("inicio");
}
function parteClose(){
  var p=document.getElementById("parte");
  parteOn=false;
  p.classList.add("pt-sale");
  setTimeout(function(){ saludDevuelve(); p.hidden=true; p.classList.remove("pt-sale","pt-abre"); render(); }, 320);
}
function renderParte(){
  if(!parteOn) return;
  saludDevuelve();
  var d=today(), tom=addDays(d,1), tmap=tasksByDay(), c="", i;
  var estado="";
  if(parteStep===0){ var _tc=todaysChallenges(d).length, _h=chOf(d).length;
    estado = _h===0?"Nada marcado todavía." : _h>=_tc?"Los tienes los tres. Comprueba y sigue.":"Ya llevas "+_h+" de "+_tc+". Marca lo que falte."; }
  if(parteStep===1){ var _ck=checksOf(d).length, _n=idealActivos().length;
    estado = (wentGym(d)?"Ejercicio: sí":"Ejercicio: sin marcar")+" · hábitos "+_ck+" de "+_n+"."; }
  if(parteStep===2){ var hh2=S.habits[d]||{}, falta=[];
    if(hh2.sleep==null) falta.push("sueño"); if(hh2.water==null) falta.push("agua"); if(hh2.screen==null) falta.push("pantalla");
    var haySug=(sugerido("sleep")!=null||sugerido("water")!=null||sugerido("screen")!=null);
    estado = falta.length? ("Te falta "+falta.join(", ")+"."+(haySug?" Lo resaltado es lo que sueles poner.":"")) : "Todo puesto. Cámbialo si no cuadra."; }
  if(parteStep===3){ estado="Algo que no quieras olvidar, algo importante o algo que te propongas. Mañana te lo recuerdo arriba del todo."; }

  if(parteStep===0){
    var tc=todaysChallenges(d), dn=chOf(d);
    c+='<div class="space-y-2">'; for(i=0;i<tc.length;i++) c+=chRow(tc[i], dn.indexOf(tc[i].id)>=0, true, d); c+='</div>';
  }
  else if(parteStep===1){
    var went=wentGym(d);
    c+='<button class="pt-gym'+(went?" si":"")+'" data-act="gym" data-day="'+d+'">'+(went?"Hoy sí has entrenado ✓":"¿Ejercicio? Marcar que lo he hecho")+'</button>';
    c+='<p class="eyebrow mb-3 mt-6">Hábitos</p><div class="pt-ck">';
    var ck=checksOf(d), _li=ordenIdeal(idealDe(d));
    if(!_li.length) c+='<p class="text-[13px] t3">No tienes hábitos. Se escriben en Resumen.</p>';
    for(i=0;i<_li.length;i++){
      var it=_li[i], on=ck.indexOf(it.id)>=0;
      c+='<div class="soft flex items-center gap-3 px-3.5 py-2.5 '+(on?"done":"")+'">'+
        '<button class="tick tick-sm" data-act="check" data-id="'+it.id+'" data-day="'+d+'" aria-label="Marcar">'+ICON_CHECK+'</button>'+
        '<button class="text-[14px] flex-1 min-w-0 leading-snug text-left" data-act="check" data-id="'+it.id+'" data-day="'+d+'"><span class="strike">'+esc(it.text)+'</span></button></div>';
    }
    c+='</div>';
  }
  else if(parteStep===2){
    c+='<div id="pt-salud"></div>';
  }
  else if(parteStep===3){
    c+=mananaPaso(tom);
  }
  else {
    var an=animoDe(d)||{};
    c+='<p class="eyebrow mb-3">¿Qué tal el día?</p><div class="pt-animo">'+ANIMOS.map(function(e,i){
        return '<button class="'+(an.v===i+1?"on":"")+'" data-act="x-animo" data-v="'+(i+1)+'" aria-label="Ánimo '+(i+1)+' de 5">'+e+'</button>'; }).join("")+'</div>'+
      '<input id="pt-nota" class="field pt-nota" maxlength="120" placeholder="Una línea sobre hoy, si quieres" value="'+esc(an.nota||"")+'">'+
      '<div style="height:26px"></div>';
    var x=dayXP(d,tmap), st=stats(), sum=0;
    for(i=1;i<=7;i++) sum+=dayXP(addDays(d,-i),tmap);
    var avg=Math.round(sum/7), dif=x-avg, ref=Math.max(60, avg?Math.round(avg*1.3):120), pct=Math.min(1,x/ref);
    c+='<div class="pt-xp"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" class="pt-xp-pista"/>'+
         '<circle cx="50" cy="50" r="44" class="pt-xp-arco" pathLength="100" stroke-dasharray="100" transform="rotate(-90 50 50)" style="--p:'+(100-pct*100).toFixed(1)+'"/></svg>'+
         '<div><b class="display num" id="pt-xp-n" data-x="'+x+'">0</b><span>XP de hoy</span></div></div>'+
       '<p class="pt-comp num">'+(avg?((dif>=0?"+":"")+dif+" respecto a tu media de 7 días ("+avg+")"):"aún no hay media con la que compararte")+'</p>'+
       (tripleDone(d)?'<p class="pt-x15">×1,5 aplicado</p>':'')+
       '<p class="pt-linea num"><span class="pt-llama">'+ICON_LLAMA+'</span><b>'+st.streak+'</b> '+(st.streak===1?"día":"días")+' de racha<i></i>Nivel <b>'+st.lvl+'</b> · '+esc(LVL_NAMES[Math.min(st.lvl,LVL_NAMES.length)-1])+'</p>'+
       '<p class="pt-frase">'+frasePar(x,avg)+'</p>';
    var mn=mananaDe(tom);
    if(mn) c+='<p class="eyebrow mb-2 mt-6">Para mañana</p><div class="soft px-3.5 py-3 text-[14px]">'+esc(mn.t)+'</div>';
  }
  var pasos=""; for(i=0;i<5;i++) pasos+='<i class="'+(i<=parteStep?"on":"")+'"></i>';
  var dir = ptPasoAnterior<0 ? "" : (parteStep>ptPasoAnterior ? " pt-entra" : parteStep<ptPasoAnterior ? " pt-vuelve" : "");
  var b=
    '<div class="pt-top"><button class="pt-x" data-act="parte-close" aria-label="Cerrar">'+
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>'+
      '<div class="pt-pasos">'+pasos+'</div><span class="pt-n num">'+(parteStep+1)+'/5</span></div>'+
    '<div class="pt-cuerpo'+dir+'">'+
      '<div class="pt-ico'+(parteStep===4?" luna":"")+'">'+PT_ICO[parteStep]+'</div>'+
      '<p class="pt-ey">Parte del día</p>'+
      '<h2 class="pt-t display">'+PARTE_T[parteStep]+'</h2>'+
      (estado?'<p class="pt-estado">'+estado+'</p>':'')+
      '<div class="pt-contenido">'+c+'</div>'+
    '</div>'+
    '<div class="pt-pie">'+
      (parteStep>0?'<button class="pt-sec" data-act="parte-prev">Atrás</button>':'<button class="pt-sec" data-act="parte-close">Luego</button>')+
      '<button class="pt-main" data-act="'+(parteStep>=4?"x-parte-fin":"parte-next")+'">'+(parteStep>=4?"Terminar":"Siguiente")+'</button>'+
    '</div>';
  var sc=document.querySelector("#parte .pt-cuerpo"), top=(sc && ptPasoAnterior===parteStep)?sc.scrollTop:0;
  $("#parte-body").innerHTML=b;
  var sc2=document.querySelector("#parte .pt-cuerpo"); if(sc2) sc2.scrollTop=top;
  if(parteStep===2) saludPresta();
  var nueva=document.getElementById("pt-nueva");
  if(nueva) nueva.addEventListener("keydown", function(e){ if(e.key==="Enter"){ e.preventDefault(); ptNueva(); } });
  var nota=document.getElementById("pt-nota");
  if(nota) nota.addEventListener("input", function(){ if(!S.animo) S.animo={}; var dd=today(); S.animo[dd]=S.animo[dd]||{}; S.animo[dd].nota=nota.value.slice(0,120); clearTimeout(nota._t); nota._t=setTimeout(save,400); });
  if(parteStep===4 && ptPasoAnterior!==4) ptCuenta();
  else { var n=document.getElementById("pt-xp-n"); if(n) n.textContent=n.dataset.x; }
  ptPasoAnterior=parteStep;
}
/* el bloque de "Salud del día" de Vital se presta al parte y luego se devuelve,
   así es exactamente la misma interfaz (iconos, medidores, − y +) */
var saludSitio=null;
function saludBloque(){ var m=document.getElementById("mg-agua"); return m ? m.closest(".pad") : null; }
function saludPresta(){
  var hueco=document.getElementById("pt-salud"), b=saludBloque(); if(!hueco || !b) return;
  if(!saludSitio) saludSitio={ padre:b.parentNode, sig:b.nextSibling };
  hueco.appendChild(b);
  try{ rVital(); }catch(e){}
  var t=today(); b.querySelectorAll("[data-day]").forEach(function(x){ x.dataset.day=t; });
}
function saludDevuelve(){
  if(!saludSitio) return;
  var b=saludBloque(); if(b && saludSitio.padre) saludSitio.padre.insertBefore(b, saludSitio.sig);
  saludSitio=null;
}
/* apuntar una tarea nueva sin salir del parte; entra sola en las 3 si hay hueco */
function ptNueva(){
  var i=document.getElementById("pt-nueva"); if(!i) return;
  var v=(i.value||"").trim(); if(!v) { i.focus(); return; }
  var tk={ id:uid(), text:v.slice(0,90), cat:(S.cats[0]||{}).id, done:false, day:today(), due:"" };
  S.tasks.unshift(tk);
  var tom=addDays(today(),1), ar=(S.plan[tom]||[]).slice(); if(ar.length<3) ar.push(tk.id); S.plan[tom]=ar;
  save(); sonido("pop"); renderParte();
  var j=document.getElementById("pt-nueva"); if(j) j.focus();
}
/* el número de XP cuenta hacia arriba */
function ptCuenta(){
  var n=document.getElementById("pt-xp-n"); if(!n) return;
  var fin=+n.dataset.x, t0=null;
  function paso(ts){ if(t0===null) t0=ts; var p=Math.min(1,(ts-t0)/900), e=1-Math.pow(1-p,3);
    n.textContent=Math.round(fin*e); if(p<1) requestAnimationFrame(paso); }
  requestAnimationFrame(paso);
}
/* cerrar el día: la pantalla se despide */
function parteFin(){
  var hoy=today(); S.parte[hoy]=true; save();
  var x=dayXP(hoy,tasksByDay()), st=stats();
  var body=document.getElementById("parte-body"); if(!body) { parteClose(); return; }
  body.innerHTML='<div class="pt-noche"><div class="pt-noche-luna">'+ICO_LUNA+'</div>'+
    '<h2 class="display">Parte del día hecho</h2><p>Buenas noches. Mañana, más.</p>'+
    '<span class="num">+'+x+' XP · '+st.streak+' '+(st.streak===1?"día":"días")+' de racha</span></div>';
  sonido("nivel"); try{ if(navigator.vibrate) navigator.vibrate([20,60,30]); }catch(e){}
  setTimeout(parteClose, 2200);
}

/* ── módulo académico opcional: sin él, la quinta pestaña es Tareas ── */
var ICO_TAREAS='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6h11M9 12h11M9 18h11"/><path d="M3.5 6l1.3 1.3L7 5M3.5 12l1.3 1.3L7 11M3.5 18l1.3 1.3L7 17"/></svg>';
var tabAcadOriginal=null;
function academicoAplica(){
  var b=document.querySelector('#mtabs button.mtab:last-of-type');
  var bAc=document.querySelector('#mtabs button[data-view="academico"]'), bTa=document.querySelector('#mtabs button[data-view="tareas"]');
  var off=academicoOff();
  if(off && bAc){ if(!tabAcadOriginal) tabAcadOriginal=bAc.innerHTML; bAc.dataset.view="tareas"; bAc.innerHTML=ICO_TAREAS+'<span>Tareas</span>'; }
  if(!off && bTa && tabAcadOriginal){ bTa.dataset.view="academico"; bTa.innerHTML=tabAcadOriginal; }
  document.documentElement.classList.toggle("sin-academico", off);
  if(off && view==="academico") go("tareas");
}

var HOY_CSS=[
/* se esconde lo viejo del Resumen */
'#v-resumen #card-ring, #v-resumen #kpis, #v-resumen #plan3, #v-resumen > .grid, #parte-btn, #v-resumen [data-act="x-estudiar"].btn, #est-hoy{ display:none!important; }',
'#v-resumen > div:first-child{ margin-bottom:24px!important; }',
'#v-resumen #hero-sub ~ div{ display:none!important; }',
'#v-resumen #hero-sub{ margin-top:10px!important; }',
'html.sin-academico #rail button[data-view="academico"], html.sin-academico [data-sub="academico"]{ display:none!important; }',
'html.sin-academico #sub-tar{ display:none!important; }',
'#hoy{ display:flex; flex-direction:column; justify-content:flex-start; margin-bottom:26px; }',
'#hoy .hy-dos{ flex:1; }',
'#hoy .hy-dos > div > .hy-tarjeta{ min-height:214px; }',
'.hy-racha{ display:inline-flex; align-items:center; gap:3px; margin-left:6px; color:var(--warn); letter-spacing:0; }',
'.hy-racha svg{ width:12px; height:12px; }',
'.hy-racha b{ font-weight:800; }',
'#v-resumen #card-ideal{ margin-bottom:24px; }',
'.hy-cabeza{ display:flex; gap:8px; flex-wrap:wrap; margin:-6px 0 22px; }',
'.hy-chip{ display:inline-flex; align-items:center; gap:7px; height:34px; padding:0 13px 0 10px; border-radius:99px; font-size:13.5px; font-weight:600; color:var(--t2); background:var(--fill); }',
'.hy-chip b{ color:var(--t1); font-weight:800; }',
'.hy-chip svg{ width:15px; height:15px; display:block; }',
'.hy-nv{ min-width:22px; height:22px; padding:0 6px; border-radius:99px; display:grid; place-items:center; font-size:12px; font-weight:800; color:var(--on-accent); background:var(--accent); }',
/* anillos */
'.hy-anillos{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:0; }',
'.hy-anillo{ display:flex; flex-direction:column; align-items:center; text-align:center; padding:4px 0; transition:transform .3s var(--spring); }',
'.hy-anillo:active{ transform:scale(.95); }',
'.hy-anillo svg{ width:92px; height:92px; display:block; }',
'.hy-pista{ fill:none; stroke:color-mix(in srgb,var(--c) 16%,transparent); stroke-width:9; }',
'.hy-arco{ fill:none; stroke:var(--c); stroke-width:9; stroke-linecap:round; transition:stroke-dashoffset .8s cubic-bezier(.3,.9,.3,1); }',
'.hy-num{ fill:var(--t1); }',
'.hy-anillo b{ margin-top:8px; font-size:14px; font-weight:700; }',
'.hy-anillo span{ font-size:11.5px; color:var(--t3); margin-top:1px; }',
/* las dos tarjetas con personalidad */
'.hy-dos{ display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:22px; }',
'.hy-dos > div{ min-width:0; display:flex; }',
'.hy-tarjeta{ position:relative; overflow:hidden; isolation:isolate; width:100%; display:flex; flex-direction:column; align-items:flex-start; text-align:left;',
'  padding:16px 15px 14px; border-radius:24px; min-height:208px; transition:transform .35s var(--spring); }',
'.hy-tarjeta:active{ transform:scale(.97); }',
'.hy-t{ font-family:var(--f-texto); font-size:18px; font-weight:800; letter-spacing:-.03em; margin-top:12px; line-height:1.15; }',
'.hy-s{ font-size:12.5px; line-height:1.35; margin-top:3px; opacity:.8; }',
'.hy-pie{ padding-top:10px; font-size:11.5px; font-weight:600; opacity:.7; }',
/* estudio: esfera de reloj */
'.hy-estudio{ color:var(--t1); background:color-mix(in srgb,var(--accent) 9%,var(--bg)); box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--accent) 20%,transparent); }',
'.hy-dial{ position:relative; width:58px; height:58px; border-radius:99px; display:grid; place-items:center; color:var(--accent);',
'  background:var(--bg); box-shadow:0 6px 16px -8px color-mix(in srgb,var(--accent) 60%,transparent); }',
'.hy-dial svg{ position:absolute; inset:0; width:100%; height:100%; }',
'.hy-dial line{ stroke:currentColor; stroke-width:2.2; stroke-linecap:round; opacity:.45; }',
'.hy-dial-ico svg{ position:static; width:24px; height:24px; }',
'.hy-dial b{ position:relative; font-size:15px; font-weight:800; letter-spacing:-.02em; }',
'.hy-barras{ display:flex; align-items:stretch; gap:4px; flex:1; min-height:44px; max-height:260px; width:100%; margin-top:14px; }',
'.hy-letras{ display:grid; grid-template-columns:repeat(7,1fr); gap:4px; width:100%; margin-top:5px; }',
'.hy-letras span{ text-align:center; font-size:9.5px; font-weight:700; opacity:.45; }',
'.hy-letras span.hoy{ opacity:.9; }',
'.hy-barras i{ --bc:var(--accent); flex:1; position:relative; border-radius:5px; overflow:hidden; background:color-mix(in srgb,var(--bc) 9%,transparent); }',
'.hy-barras i u{ position:absolute; left:0; right:0; bottom:0; border-radius:5px; background:color-mix(in srgb,var(--bc) 40%,transparent); transition:height .6s cubic-bezier(.3,.9,.3,1); }',
'.hy-barras i.hoy u{ background:var(--bc); }',
'.hy-barras i.hoy{ box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--bc) 35%,transparent); }',
'.hy-noches i{ --bc:var(--violet); }',
'.hy-estudio.activo{ color:var(--on-accent); background:linear-gradient(150deg,var(--accent),var(--violet)); box-shadow:0 16px 34px -18px var(--accent); }',
'.hy-estudio.activo .hy-dial{ background:rgba(255,255,255,.16); color:#fff; box-shadow:none; animation:hyLatido 2s ease-in-out infinite; }',
'@keyframes hyLatido{ 0%,100%{ transform:scale(1); } 50%{ transform:scale(1.05); } }',
'.hy-boton{ margin-top:auto; padding:8px 14px; border-radius:99px; font-size:13px; font-weight:700; background:#fff; color:var(--accent); }',
/* parte: de noche */
'.hy-parte{ color:var(--t1); background:color-mix(in srgb,var(--violet) 10%,var(--bg)); box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--violet) 22%,transparent); }',
'.hy-luna{ width:58px; height:58px; border-radius:99px; display:grid; place-items:center; color:var(--violet); background:var(--bg);',
'  box-shadow:0 6px 16px -8px color-mix(in srgb,var(--violet) 60%,transparent); }',
'.hy-luna svg{ width:26px; height:26px; }',
'.hy-parte.toca .hy-luna{ animation:hyHalo 2.4s ease-out infinite; }',
'@keyframes hyHalo{ 0%{ box-shadow:0 0 0 0 color-mix(in srgb,var(--violet) 45%,transparent); } 100%{ box-shadow:0 0 0 16px transparent; } }',
'.hy-parte.hecho .hy-luna{ color:#fff; background:var(--violet); }',
'.hy-lunas{ display:grid; grid-template-columns:repeat(7,1fr); gap:4px; width:100%; margin-top:auto; padding-top:14px; justify-items:center; }',
'.hy-lunas i{ width:12px; height:12px; border-radius:99px; background:color-mix(in srgb,var(--violet) 22%,transparent); }',
'.hy-lunas i.on{ background:var(--violet); }',
'.hy-lunas i.hoy{ box-shadow:0 0 0 1.5px var(--violet); background:transparent; }',
'.hy-lunas i.hoy.on{ background:var(--violet); }',
/* para hoy */
'.hy-sec{ display:flex; align-items:baseline; justify-content:space-between; margin:30px 0 6px; }',
'.hy-sec h2{ font-size:20px; font-weight:800; letter-spacing:-.03em; }',
'.hy-sec button{ font-size:13.5px; font-weight:700; color:var(--accent); }',
'.hy-lista{ padding-left:6px; margin-left:-6px; }',
'.hy-fila{ display:flex; align-items:center; gap:12px; padding:12px 0; box-shadow:inset 0 -1px 0 var(--hairline); }',
'.hy-fila:last-child{ box-shadow:none; }',
'.hy-txt{ flex:1; min-width:0; text-align:left; font-size:14.5px; line-height:1.35; }',
'.hy-meta{ flex:0 0 auto; font-size:12px; color:var(--t3); }',
'.hy-meta.tarde{ color:var(--alert); font-weight:700; }',
'.hy-prio{ width:20px; height:20px; border-radius:99px; display:grid; place-items:center; font-size:11px; font-weight:800; color:var(--on-accent); background:var(--accent); }',
'.hy-reto{ font-size:11px; font-weight:700; padding:3px 8px; border-radius:99px; color:var(--accent); background:var(--accent-soft); }',
'.hy-fila.info .hy-txt{ font-size:14px; color:var(--t2); }',
'.hy-fila.info .hy-txt b{ color:var(--t1); }',
'.hy-punto{ width:9px; height:9px; border-radius:99px; margin:0 6px; flex:0 0 auto; }',
'.hy-vacio{ font-size:14px; color:var(--t3); padding:14px 0; }',
/* grupo */
'.hy-grupo{ width:100%; display:flex; align-items:center; gap:10px; margin-top:22px; padding:12px 14px; border-radius:16px; background:var(--fill); text-align:left; }',
'.hy-caras{ display:flex; flex:0 0 auto; }',
'.hy-caras > span{ margin-left:-7px; box-shadow:0 0 0 2px var(--bg); border-radius:99px; }',
'.hy-caras > span:first-child{ margin-left:0; }',
'.hy-grupo-t{ flex:1; min-width:0; font-size:13px; color:var(--t2); }',
'.hy-grupo svg{ width:16px; height:16px; color:var(--t3); flex:0 0 auto; }',
/* parte a pantalla completa */
'#parte .sheet-bg{ display:none; }',
'#parte .sheet-card{ inset:0!important; margin:0!important; max-width:none!important; width:100%!important; height:100%!important; max-height:none!important; border-radius:0!important;',
'  padding:0!important; background:var(--bg)!important; box-shadow:none!important; display:flex; flex-direction:column; overflow:hidden!important; }',
'#parte.pt-abre .sheet-card{ animation:ptAbre .45s cubic-bezier(.2,.8,.2,1); }',
'@keyframes ptAbre{ from{ opacity:0; transform:translateY(40px); } to{ opacity:1; transform:none; } }',
'#parte.pt-sale .sheet-card{ animation:ptSale .32s cubic-bezier(.4,0,1,1) forwards; }',
'@keyframes ptSale{ to{ opacity:0; transform:translateY(40px); } }',
'#parte-body{ flex:1; min-height:0; display:flex; flex-direction:column; --pc:var(--violet); }',
'.pt-top{ display:flex; align-items:center; gap:14px; padding:calc(env(safe-area-inset-top) + 14px) 18px 6px; width:100%; max-width:600px; margin:0 auto; }',
'.pt-x{ width:38px; height:38px; flex:0 0 auto; border-radius:99px; display:grid; place-items:center; color:var(--t2); background:var(--fill); }',
'.pt-x svg{ width:17px; height:17px; }',
'.pt-pasos{ flex:1; display:flex; gap:6px; }',
'.pt-pasos i{ flex:1; height:5px; border-radius:99px; background:var(--fill-hi); transition:background .45s var(--ease); }',
'.pt-pasos i.on{ background:var(--pc); }',
'.pt-n{ font-size:13px; font-weight:700; color:var(--t3); min-width:26px; text-align:right; }',
'.pt-cuerpo{ flex:1; overflow-y:auto; -webkit-overflow-scrolling:touch; width:100%; max-width:600px; margin:0 auto; padding:26px 22px 24px; }',
'.pt-cuerpo.pt-entra{ animation:ptEntra .42s cubic-bezier(.2,.8,.2,1); }',
'.pt-cuerpo.pt-vuelve{ animation:ptVuelve .42s cubic-bezier(.2,.8,.2,1); }',
'@keyframes ptEntra{ from{ opacity:0; transform:translateX(28px); } to{ opacity:1; transform:none; } }',
'@keyframes ptVuelve{ from{ opacity:0; transform:translateX(-28px); } to{ opacity:1; transform:none; } }',
'.pt-ico{ width:68px; height:68px; border-radius:22px; display:grid; place-items:center; color:var(--pc); background:color-mix(in srgb,var(--pc) 13%,var(--bg)); }',
'.pt-ico svg{ width:32px; height:32px; }',
'.pt-ico.luna{ color:#fff; background:var(--pc); box-shadow:0 14px 30px -14px var(--pc); }',
'.pt-ey{ margin-top:20px; font-size:12px; font-weight:800; letter-spacing:.14em; text-transform:uppercase; color:var(--pc); }',
'.pt-t{ font-size:36px; font-weight:800; letter-spacing:-.045em; line-height:1.05; margin-top:4px; }',
'.pt-estado{ font-size:15px; color:var(--t2); line-height:1.45; margin-top:10px; }',
'.pt-contenido{ margin-top:24px; }',
'.pt-pie{ display:flex; align-items:center; gap:10px; width:100%; max-width:600px; margin:0 auto; padding:12px 22px calc(env(safe-area-inset-bottom) + 18px); }',
'.pt-sec{ height:56px; padding:0 18px; border-radius:99px; font-size:15px; font-weight:700; color:var(--t2); background:var(--fill); }',
'.pt-main{ flex:1; height:56px; border-radius:99px; font-size:16.5px; font-weight:700; color:#fff; background:var(--pc);',
'  box-shadow:0 14px 30px -16px var(--pc); transition:transform .3s var(--spring); }',
'.pt-main:active, .pt-sec:active{ transform:scale(.97); }',
'.pt-gym{ width:100%; height:64px; border-radius:20px; font-family:var(--f-texto); font-size:17px; font-weight:800; color:var(--t2);',
'  background:var(--fill); box-shadow:inset 0 0 0 1px var(--hairline); transition:all .4s var(--spring); }',
'.pt-gym.si{ color:#fff; background:linear-gradient(145deg,var(--good),color-mix(in srgb,var(--good) 70%,var(--cyan))); box-shadow:0 12px 28px -14px var(--good); }',
'.pt-ck{ display:flex; flex-direction:column; gap:4px; }',
'.pt-elige{ width:100%; display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:16px; text-align:left;',
'  background:var(--fill); box-shadow:inset 0 0 0 1px var(--hairline-2); transition:all .3s var(--spring); }',
'.pt-elige.on{ background:color-mix(in srgb,var(--pc) 12%,var(--bg)); box-shadow:inset 0 0 0 1.5px var(--pc); }',
'.pt-num{ width:26px; height:26px; flex:0 0 auto; border-radius:99px; display:grid; place-items:center; font-size:12px; font-weight:800; background:var(--fill-hi); color:var(--t3); }',
'.pt-elige.on .pt-num{ background:var(--pc); color:#fff; }',
'.pt-xp{ position:relative; width:190px; height:190px; margin:0 auto; }',
'.pt-xp svg{ width:100%; height:100%; display:block; }',
'.pt-xp-pista{ fill:none; stroke:color-mix(in srgb,var(--pc) 15%,transparent); stroke-width:7; }',
'.pt-xp-arco{ fill:none; stroke:var(--pc); stroke-width:7; stroke-linecap:round; stroke-dashoffset:var(--p); animation:ptArco 1s cubic-bezier(.3,.9,.3,1) .1s both; }',
'@keyframes ptArco{ from{ stroke-dashoffset:100; } }',
'.pt-xp > div{ position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }',
'.pt-xp b{ font-size:54px; font-weight:800; letter-spacing:-.05em; line-height:1; }',
'.pt-xp span{ font-size:12.5px; color:var(--t3); margin-top:4px; }',
'.pt-comp{ text-align:center; font-size:13.5px; color:var(--t2); margin-top:14px; }',
'.pt-x15{ text-align:center; margin-top:8px; font-size:13px; font-weight:700; color:var(--good); }',
'.pt-cifras{ display:grid; grid-template-columns:1fr 1fr; margin-top:22px; box-shadow:inset 0 1px 0 var(--hairline), inset 0 -1px 0 var(--hairline); }',
'.pt-cifras > div{ display:flex; flex-direction:column; align-items:center; padding:14px 6px; text-align:center; }',
'.pt-cifras > div + div{ box-shadow:inset 1px 0 0 var(--hairline); }',
'.pt-cifras b{ font-size:20px; font-weight:800; letter-spacing:-.03em; }',
'.pt-cifras span{ font-size:11.5px; color:var(--t3); margin-top:3px; }',
'.pt-frase{ text-align:center; font-size:15px; color:var(--t2); line-height:1.45; margin:20px auto 0; max-width:34ch; }',
'#pt-salud .pad{ padding:0!important; background:none!important; box-shadow:none!important; }',
'#pt-salud .pad > h2, #pt-salud .pad > h2 + p{ display:none; }',
'.pt-noche{ flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:24px; }',
'.pt-noche-luna{ width:110px; height:110px; border-radius:99px; display:grid; place-items:center; color:#fff; background:var(--pc);',
'  box-shadow:0 0 0 0 color-mix(in srgb,var(--pc) 40%,transparent); animation:ptLuna .8s cubic-bezier(.2,1.4,.4,1) both, ptHalo 1.8s ease-out .5s; }',
'.pt-noche-luna svg{ width:50px; height:50px; }',
'@keyframes ptLuna{ from{ opacity:0; transform:scale(.5) rotate(-30deg); } to{ opacity:1; transform:none; } }',
'@keyframes ptHalo{ 0%{ box-shadow:0 0 0 0 color-mix(in srgb,var(--pc) 45%,transparent); } 100%{ box-shadow:0 0 0 46px transparent; } }',
'.pt-noche h2{ font-size:38px; font-weight:800; letter-spacing:-.045em; margin-top:26px; animation:ptTxt .5s var(--ease) .35s both; }',
'.pt-noche p{ font-size:16px; color:var(--t2); margin-top:6px; animation:ptTxt .5s var(--ease) .45s both; }',
'.pt-noche span{ margin-top:18px; font-size:14px; font-weight:700; color:var(--pc); animation:ptTxt .5s var(--ease) .55s both; }',
'@keyframes ptTxt{ from{ opacity:0; transform:translateY(10px); } to{ opacity:1; transform:none; } }',
'@media (min-width:1024px){ .hy-dos{ max-width:560px; } .hy-anillos{ max-width:520px; } #hoy{ max-width:760px; } }'
].join("\n");

