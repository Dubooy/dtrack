/* ════════════════════════════════════════════════════════════════
   NOVEDADES: reto de la semana, resumen semanal e historial, racha de
   grupo, sonidos, preferencias (texto, contraste, animaciones), icono
   con número, avisos del pomodoro, temas de examen y accesos rápidos.
   ════════════════════════════════════════════════════════════════ */

/* ── preferencias de este dispositivo ── */
var PREFKEY="dtrack-pref";
function prefs(){ try{ return JSON.parse(localStorage.getItem(PREFKEY)||"{}")||{}; }catch(e){ return {}; } }
function prefPon(k, v){ var p=prefs(); p[k]=v; try{ localStorage.setItem(PREFKEY, JSON.stringify(p)); }catch(e){} prefAplica(); }
function prefAplica(){
  var p=prefs(), r=document.documentElement;
  r.classList.toggle("a11y-grande", !!p.grande);
  r.classList.toggle("a11y-contraste", !!p.contraste);
  r.classList.toggle("a11y-quieto", !!p.quieto);
  if(typeof academicoAplica==="function"){ try{ academicoAplica(); if(novedadesListo) render(); }catch(e){} }
}
var PREF_LISTA=[
  { k:"academico", n:"Organización", d:"Horario, exámenes y temporizador. Sin ella, la quinta pestaña pasa a ser Tareas.", def:true },
  { k:"sonido",    n:"Sonidos",          d:"Suaves y cortos al marcar, subir de nivel o acabar un pomodoro.", def:true },
  { k:"grande",    n:"Texto más grande", d:"Agranda letras y botones de toda la app.", def:false },
  { k:"contraste", n:"Más contraste",    d:"Oscurece los grises y las líneas para leer mejor.", def:false },
  { k:"quieto",    n:"Menos animaciones",d:"Quita movimientos y transiciones.", def:false }
];
function prefValor(k){ var p=prefs(); if(p[k]==null){ for(var i=0;i<PREF_LISTA.length;i++) if(PREF_LISTA[i].k===k) return PREF_LISTA[i].def; } return !!p[k]; }
function selectorPrefs(){
  return '<p class="eyebrow mb-2">Preferencias</p>'+
    '<div class="pref-lista mb-6">'+PREF_LISTA.map(function(o){
      var on=prefValor(o.k);
      return '<button class="pref-fila" data-act="x-pref" data-k="'+o.k+'" aria-pressed="'+(on?"true":"false")+'">'+
        '<span class="pref-txt"><b>'+o.n+'</b><span>'+o.d+'</span></span><span class="pref-sw"><i></i></span></button>';
    }).join("")+'</div>';
}

/* ── sonidos: se generan al vuelo, sin archivos ── */
var SND_CTX=null;
var SONIDOS={
  tick:   [{f:1320,d:.05,g:.035},{f:1980,d:.04,g:.01}],
  des:    [{f:700,f2:520,d:.06,g:.028}],
  tab:    [{f:1100,d:.022,g:.014,tipo:"triangle"}],
  gym:    [{f:784,d:.12,g:.045},{t:.08,f:1175,d:.2,g:.045},{t:.08,f:2350,d:.14,g:.008}],
  salud:  [{f:880,d:.1,g:.035},{t:.07,f:1109,d:.1,g:.035},{t:.14,f:1319,d:.22,g:.035}],
  xp:     [{f:1047,f2:1568,d:.18,g:.02}],
  nivel:  [{f:1047,d:.3,g:.04},{t:.09,f:1319,d:.3,g:.04},{t:.18,f:1568,d:.3,g:.04},{t:.27,f:2093,d:.5,g:.04},{t:.27,f:1047,d:.5,g:.015}],
  semana: [{f:784,d:.25,g:.04},{t:.1,f:988,d:.25,g:.04},{t:.2,f:1175,d:.25,g:.04},{t:.3,f:1568,d:.5,g:.04}],
  pop:    [{f:620,f2:940,d:.07,g:.035}],
  ok:     [{f:988,d:.07,g:.028},{t:.06,f:1319,d:.12,g:.028}],
  borrar: [{f:440,f2:330,d:.1,g:.03}],
  inicio: [{f:660,d:.28,g:.035},{f:1320,d:.28,g:.01}],
  campana:[{f:1047,d:.7,g:.045},{f:2094,d:.6,g:.012},{t:.35,f:1319,d:.9,g:.045},{t:.35,f:2638,d:.6,g:.01}],
  bloq:   [{f:330,d:.08,g:.028},{t:.1,f:300,d:.1,g:.028}]
};
function sonido(k){
  if(!prefValor("sonido")) return;
  var P=SONIDOS[k]; if(!P) return;
  try{
    var C=window.AudioContext||window.webkitAudioContext; if(!C) return;
    if(!SND_CTX) SND_CTX=new C();
    if(SND_CTX.state==="suspended") SND_CTX.resume();
    var t0=SND_CTX.currentTime+0.012;
    P.forEach(function(n){ sndNota(t0+(n.t||0), n); });
  }catch(e){}
}
function sndNota(t, n){
  var ctx=SND_CTX, o=ctx.createOscillator(), v=ctx.createGain(), d=n.d||.08;
  o.type=n.tipo||"sine";
  o.frequency.setValueAtTime(n.f, t);
  if(n.f2) o.frequency.exponentialRampToValueAtTime(n.f2, t+d);
  v.gain.setValueAtTime(0.0001, t);
  v.gain.exponentialRampToValueAtTime(n.g||.04, t+0.008);
  v.gain.exponentialRampToValueAtTime(0.0001, t+d);
  o.connect(v); v.connect(ctx.destination);
  o.start(t); o.stop(t+d+0.03);
}
/* sonidos que dependen de lo que tocas: se miran antes de que la app cambie nada */
function sonidoAlTocar(ev){
  var nav=ev.target.closest && ev.target.closest("#rail button[data-view], #mtabs button");
  if(nav){ sonido("tab"); return; }
  var el=ev.target.closest && ev.target.closest("[data-act]"); if(!el) return;
  var a=el.dataset.act, t=el.dataset.day||today(), id=el.dataset.id;
  if(a==="gym"){ if(S.gym[t]) sonido("des"); return; }
  if(a==="toggle"){ var tk=taskById(id); if(tk && !tk.done && el.closest("#hoy")) celebraTick(el, 6); else if(tk && tk.done) sonido("des"); return; }
  if(a==="ch"){ if(chOf(t).indexOf(id)>=0) sonido("des"); return; }
  if(a==="check"){ if(checksOf(t).indexOf(id)>=0) sonido("des"); return; }
  if(a==="x-extra"){ if(S.retoExtra && S.retoExtra[t]) sonido("des"); return; }
  if(a==="soc-reac") { sonido("pop"); return; }
  if(a==="soc-reto"){ if(GRUPO && retoHoyHecho()) sonido("des"); return; }
  if(a==="x-est-go"){ sonido("inicio"); return; }
  if(a.indexOf("save-")===0 || a==="x-valor-ok"){ sonido("ok"); return; }
  if(a.indexOf("del-")===0){ sonido("borrar"); return; }
  if(a==="x-pref"){ sonido("tick"); return; }
}

/* ── semanas ── */
function lunesDe(d){ var w=(new Date(d+"T00:00:00").getDay()+6)%7; return addDays(d,-w); }
function diasSemana(l){ var a=[]; for(var i=0;i<7;i++) a.push(addDays(l,i)); return a; }
function hashTxt(s){ var h=11; for(var i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0; return h; }
function checklistEntera(d){ var n=idealDe(d).length; return n>0 && checksOf(d).length>=n; }
function hab(d){ return S.habits[d]||{}; }

var RETO_SEMANA_XP=150;
var RETOS_SEMANA=[
  { id:"gym4",   t:"Hacer ejercicio 4 días",                  meta:4,   u:"días", f:function(ds){ return ds.filter(wentGym).length; } },
  { id:"est6",   t:"Estudiar 6 horas con el temporizador",   meta:360, u:"min",  f:function(ds){ return ds.reduce(function(s,d){ return s+estudioMinDia(d); },0); } },
  { id:"tres5",  t:"Cerrar los tres retos 5 días",           meta:5,   u:"días", f:function(ds){ return ds.filter(tripleDone).length; } },
  { id:"sueno5", t:"Dormir 7 horas o más 5 noches",          meta:5,   u:"días", f:function(ds){ return ds.filter(function(d){ return (hab(d).sleep||0)>=7; }).length; } },
  { id:"agua5",  t:"Beber suficiente agua 5 días",           meta:5,   u:"días", f:function(ds){ return ds.filter(function(d){ return (hab(d).water||0)>=8; }).length; } },
  { id:"check4", t:"Cumplir todos los hábitos 4 días",          meta:4,   u:"días", f:function(ds){ return ds.filter(checklistEntera).length; } },
  { id:"pant4",  t:"Menos de 2 horas de pantalla 4 días",    meta:4,   u:"días", f:function(ds){ return ds.filter(function(d){ var s=hab(d).screen; return s!=null && s>0 && s<2; }).length; } }
];
function retoSemana(l){
  var r=RETOS_SEMANA[hashTxt("sem"+l)%RETOS_SEMANA.length], hoy=today();
  var ds=diasSemana(l).filter(function(d){ return d<=hoy; });
  var v=r.f(ds);
  return { r:r, v:v, hecho:v>=r.meta, pct:Math.min(1, v/r.meta), quedan:Math.max(0, diff(hoy, addDays(l,6))) };
}
function primerDia(){
  var min=today();
  [S.chDone,S.gym,S.checks,S.habits].forEach(function(o){ Object.keys(o||{}).forEach(function(k){ if(k<min) min=k; }); });
  if(S.estudio && S.estudio.sesiones) S.estudio.sesiones.forEach(function(x){ if(x.d<min) min=x.d; });
  return min;
}
/* XP de los retos semanales conseguidos (se suma en stats) */
function semanalXP(){
  var l=lunesDe(primerDia()), fin=lunesDe(today()), x=0, tope=0;
  while(l<=fin && tope<200){ if(retoSemana(l).hecho) x+=RETO_SEMANA_XP; l=addDays(l,7); tope++; }
  return x;
}
function xpSemana(l){
  var tmap=tasksByDay(), hoy=today(), x=0;
  diasSemana(l).forEach(function(d){ if(d<=hoy) x+=dayXP(d,tmap); });
  if(retoSemana(l).hecho) x+=RETO_SEMANA_XP;
  return x;
}
function resumenSemana(l){
  var tmap=tasksByDay(), hoy=today(), ds=diasSemana(l);
  var o={ l:l, dias:ds, porDia:[], xp:0, activos:0, gym:0, tres:0, retos:0, checks:0, estMin:0, sueno:[] };
  ds.forEach(function(d){
    var x = d<=hoy ? dayXP(d,tmap) : 0;
    o.porDia.push(x); o.xp+=x;
    if(d<=hoy && activeDay(d)) o.activos++;
    if(wentGym(d)) o.gym++;
    if(tripleDone(d)) o.tres++;
    o.retos+=chOf(d).length;
    if(checklistEntera(d)) o.checks++;
    o.estMin+=estudioMinDia(d);
    var h=hab(d); if(h.sleep) o.sueno.push(h.sleep);
  });
  o.reto=retoSemana(l);
  if(o.reto.hecho) o.xp+=RETO_SEMANA_XP;
  o.antes=xpSemana(addDays(l,-7));
  o.mejor=0; for(var i=1;i<7;i++) if(o.porDia[i]>o.porDia[o.mejor]) o.mejor=i;
  o.suenoMed = o.sueno.length ? o.sueno.reduce(function(a,b){return a+b;},0)/o.sueno.length : 0;
  return o;
}
function rangoSemana(l){
  var a=new Date(l+"T00:00:00"), b=new Date(addDays(l,6)+"T00:00:00");
  var m1=a.toLocaleDateString(LOCALE,{month:"long"}), m2=b.toLocaleDateString(LOCALE,{month:"long"});
  return m1===m2 ? a.getDate()+" – "+b.getDate()+" de "+m2 : a.getDate()+" de "+m1+" – "+b.getDate()+" de "+m2;
}
function semanaCorta(l){ return fmt(l,{day:"numeric",month:"short"}).replace(".",""); }

/* ── tarjeta del reto de la semana (Retos) ── */
function pintaRetoSemana(){
  var izq=document.getElementById("retos-left"); if(!izq) return;
  var box=document.getElementById("reto-semana");
  if(!box){ box=document.createElement("div"); box.id="reto-semana"; box.className="glass importante rounded-[24px] pad";
    var primera=izq.firstElementChild; if(primera && primera.nextSibling) izq.insertBefore(box, primera.nextSibling); else izq.appendChild(box); }
  var l=lunesDe(today()), s=retoSemana(l), r=s.r;
  var val = r.u==="min" ? horasTxt(s.v)+" de "+horasTxt(r.meta) : s.v+" de "+r.meta+" días";
  var clave=l+"|"+s.v; if(box.dataset.k===clave) return; box.dataset.k=clave;
  box.innerHTML=
    '<div class="rs-top"><span class="eyebrow">Reto de la semana</span><span class="rs-xp">+'+RETO_SEMANA_XP+' XP</span></div>'+
    '<p class="rs-t display">'+esc(r.t)+'</p>'+
    '<div class="rs-barra"><i style="width:'+Math.round(s.pct*100)+'%'+(s.hecho?';background:var(--good)':'')+'"></i></div>'+
    '<div class="rs-pie"><span class="num">'+val+'</span><span>'+(s.hecho?'<b style="color:var(--good)">Conseguido</b>':(s.quedan===0?"Último día":"Quedan "+s.quedan+(s.quedan===1?" día":" días")))+'</span></div>';
}
/* si se acaba de conseguir, se celebra una vez */
function vigilaRetoSemana(){
  var l=lunesDe(today()), s=retoSemana(l);
  if(!S.semanaOK) S.semanaOK={};
  if(s.hecho && !S.semanaOK[l]){
    S.semanaOK[l]=1; save();
    setTimeout(function(){ sonido("semana"); avisoNube("Reto de la semana conseguido: +"+RETO_SEMANA_XP+" XP"); xpVuela(0,0,RETO_SEMANA_XP); }, 500);
  }
}

/* ── tus semanas: gráfica e historial (Retos) ── */
var semanasTodas=false;
function pintaSemanas(){
  var izq=document.getElementById("retos-left"); if(!izq) return;
  var box=document.getElementById("tus-semanas");
  if(!box){ box=document.createElement("div"); box.id="tus-semanas"; box.className="glass rounded-[24px] pad"; izq.appendChild(box); }
  var actual=lunesDe(today()), ini=lunesDe(primerDia()), semanas=[], l=actual;
  for(var i=0;i<10;i++){ semanas.unshift(l); l=addDays(l,-7); }
  var vals=semanas.map(function(w){ return w<ini ? 0 : xpSemana(w); });
  var max=Math.max(60, Math.max.apply(null, vals));
  var clave=semanas[9]+"|"+vals.join(",")+"|"+semanasTodas; if(box.dataset.k===clave) return; box.dataset.k=clave;
  /* la gráfica: una sola serie, barras finas, valor escrito solo en la semana actual y en la mejor */
  var W=320, H=132, pie=18, alto=H-pie-18, paso=W/10, ancho=Math.min(20, paso-8), iMax=vals.indexOf(Math.max.apply(null, vals));
  var g='<svg class="ts-graf" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="XP por semana, últimas 10 semanas">'+
    '<line x1="0" x2="'+W+'" y1="'+(H-pie)+'" y2="'+(H-pie)+'" stroke="var(--hairline)" stroke-width="1"/>';
  vals.forEach(function(v,i){
    var h=v>0 ? Math.max(4, v/max*alto) : 0, x=i*paso+(paso-ancho)/2, y=H-pie-h, act=(i===9);
    g+='<g class="ts-bar'+(semanas[i]<ini?' vacia':'')+'" data-act="x-semana" data-l="'+semanas[i]+'">'+
      '<rect x="'+(i*paso)+'" y="0" width="'+paso+'" height="'+H+'" fill="transparent"/>'+
      (h?'<path d="M'+x+' '+(H-pie)+' V'+(y+4)+' Q'+x+' '+y+' '+(x+4)+' '+y+' H'+(x+ancho-4)+' Q'+(x+ancho)+' '+y+' '+(x+ancho)+' '+(y+4)+' V'+(H-pie)+' Z" '+
        'fill="var(--accent)" fill-opacity="'+(act?".45":"1")+'"><title>'+semanaCorta(semanas[i])+': '+v+' XP</title></path>':'')+
      ((act||i===iMax)&&v>0?'<text x="'+(x+ancho/2)+'" y="'+(y-6)+'" text-anchor="middle" class="ts-val">'+v+'</text>':'')+
      (i%3===0||act?'<text x="'+(i*paso+paso/2)+'" y="'+(H-4)+'" text-anchor="middle" class="ts-eje">'+(act?"esta":semanaCorta(semanas[i]))+'</text>':'')+
    '</g>';
  });
  g+='</svg>';
  /* lista de resúmenes: semanas ya cerradas, de la más reciente hacia atrás */
  var lista=[], w=addDays(actual,-7);
  while(w>=ini && lista.length<60){ lista.push(w); w=addDays(w,-7); }
  var ver = semanasTodas ? lista : lista.slice(0,4);
  box.innerHTML=
    '<div class="flex items-start justify-between mb-4"><div><h2 class="display text-[17px] font-bold">Tus semanas</h2>'+
    '<p class="text-[12.5px] t3 mt-0.5">XP por semana. Toca una para ver su resumen.</p></div></div>'+g+
    (lista.length ? '<div class="ts-lista">'+ver.map(function(x){
      return '<button class="ts-fila" data-act="x-semana" data-l="'+x+'"><span>'+esc(rangoSemana(x))+'</span><b class="num">'+xpSemana(x)+' XP</b>'+
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></button>';
    }).join("")+'</div>'+(lista.length>4?'<button class="ts-mas" data-act="x-semanas-todas">'+(semanasTodas?"Ver menos":"Ver las "+lista.length+" semanas")+'</button>':'')
    : '<p class="text-[12.5px] t3 mt-3">Tu primer resumen llegará el domingo por la noche.</p>');
}

/* ── aviso del resumen en Resumen: domingo desde las 18:00 y todo el lunes ── */
function semanaDelAviso(){
  var ahora=new Date(), dia=ahora.getDay(), l=lunesDe(today());
  if(dia===0 && ahora.getHours()>=18) return l;
  if(dia===1) return addDays(l,-7);
  return null;
}
function pintaAvisoSemana(){
  var kp=document.getElementById("hoy")||document.getElementById("kpis"); if(!kp) return;
  var box=document.getElementById("semana-aviso");
  var l=semanaDelAviso();
  if(!l || (S.semanaVista && S.semanaVista[l]) || l<lunesDe(primerDia())){ if(box) box.parentNode.removeChild(box); return; }
  if(!box){ box=document.createElement("div"); box.id="semana-aviso"; kp.parentNode.insertBefore(box, kp); }
  var o=resumenSemana(l);
  box.innerHTML='<button class="glass importante rounded-[24px] pad sa-caja" data-act="x-semana" data-l="'+l+'">'+
    '<div style="min-width:0;flex:1;text-align:left"><p class="eyebrow mb-1.5">Tu semana está lista</p>'+
    '<p class="display sa-t">'+o.xp+' XP · '+o.activos+' de 7 días</p>'+
    '<p class="text-[12.5px] t3 mt-1">'+esc(rangoSemana(l))+'</p></div>'+
    '<span class="sa-ir">Ver resumen</span></button>';
}

/* ── la pantalla del resumen ── */
function abrirSemana(l){
  if(!S.semanaVista) S.semanaVista={};
  if(!S.semanaVista[l]){ S.semanaVista[l]=1; save(); }
  var av=document.getElementById("semana-aviso"); if(av && semanaDelAviso()===l) av.parentNode.removeChild(av);
  var o=resumenSemana(l), actual=(l===lunesDe(today()));
  var capa=document.getElementById("semana-capa");
  if(!capa){ capa=document.createElement("div"); capa.id="semana-capa"; document.body.appendChild(capa); }
  var dif = o.antes>0 ? Math.round((o.xp-o.antes)/o.antes*100) : null;
  var maxDia=Math.max(1, Math.max.apply(null,o.porDia));
  var frase;
  if(actual) frase="La semana aún no ha acabado. El domingo por la noche tendrás el resumen completo.";
  else if(o.activos===7) frase="Siete de siete. Semana perfecta.";
  else if(dif!=null && dif>=10) frase="Más que la anterior. Vas hacia arriba.";
  else if(dif!=null && dif<=-10) frase="Algo menos que la anterior. La próxima, a por ella.";
  else frase="Semana constante. Así se llega.";
  var cifras=[
    [o.activos+"/7","días activos"],[o.gym,"días de ejercicio"],[horasTxt(o.estMin)||"0 min","de estudio"],
    [o.retos,"retos hechos"],[o.tres,"días con los tres"],[o.suenoMed?String(Math.round(o.suenoMed*10)/10).replace(".",L10N.dec)+" h":"—","de sueño medio"]
  ];
  capa.innerHTML=
    '<div class="pf-barra"><button class="pf-atras" data-act="x-semana-cerrar" aria-label="Volver">'+
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>'+
      '<span>'+(actual?"Esta semana":"Tu semana")+'</span></div>'+
    '<div class="pf-scroll">'+
      '<p class="eyebrow sm-ey">'+esc(rangoSemana(l))+'</p>'+
      '<div class="sm-xp"><b class="display num">'+o.xp+'</b><span>XP</span></div>'+
      (dif!=null?'<p class="sm-dif" style="color:'+(dif>=0?"var(--good)":"var(--warn)")+'">'+(dif>=0?"▲ ":"▼ ")+Math.abs(dif)+'% que la semana anterior</p>':'<p class="sm-dif t3">Tu primera semana con datos</p>')+
      '<div class="sm-dias">'+o.porDia.map(function(v,i){
        return '<div class="'+(i===o.mejor&&v>0?"mejor":"")+'"><i style="height:'+Math.max(v?6:2, Math.round(v/maxDia*88))+'px"></i><span>'+L10N.sem[i]+'</span></div>';
      }).join("")+'</div>'+
      (o.dias.some(function(d){ return animoDe(d); }) ? '<p class="eyebrow" style="text-align:center;margin-top:22px">Cómo te sentiste</p><div class="sm-animo">'+o.dias.map(function(d){ var a=animoDe(d); return a&&a.v ? '<span title="'+esc(a.nota||"")+'">'+ANIMOS[a.v-1]+'</span>' : '<span class="vacio">·</span>'; }).join("")+'</div>' : '')+
      (o.porDia[o.mejor]>0?'<p class="sm-mejor">Mejor día: <b>'+esc(cap(fmt(o.dias[o.mejor],{weekday:"long",day:"numeric"})))+'</b> · '+o.porDia[o.mejor]+' XP</p>':'')+
      '<div class="sm-cifras">'+cifras.map(function(c){ return '<div><b class="display num">'+c[0]+'</b><span>'+c[1]+'</span></div>'; }).join("")+'</div>'+
      '<div class="soc-sec"><h2 class="display">Reto de la semana</h2></div>'+
      '<div class="soc-lista"><div class="soc-fila"><div class="soc-cuerpo"><span style="flex:1;font-size:15px">'+esc(o.reto.r.t)+'</span>'+
        '<span style="font-weight:700;color:'+(o.reto.hecho?"var(--good)":"var(--t3)")+'">'+(o.reto.hecho?"+"+RETO_SEMANA_XP+" XP":(o.reto.r.u==="min"?horasTxt(o.reto.v):o.reto.v+"/"+o.reto.r.meta))+'</span></div></div></div>'+
      '<p class="sm-frase">'+esc(frase)+'</p>'+
      '<button class="sm-compartir" data-act="x-semana-compartir" data-l="'+l+'">'+
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7.5 7.5 12 3l4.5 4.5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>'+
        'Compartir mi semana</button>'+
      '<div style="height:40px"></div>'+
    '</div>';
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ capa.classList.add("ve"); }); });
}
function cerrarSemana(){
  var c=document.getElementById("semana-capa"); if(!c) return;
  c.classList.remove("ve"); setTimeout(function(){ if(c.parentNode && !c.classList.contains("ve")) c.parentNode.removeChild(c); }, 420);
}
/* imagen para compartir */
function compartirSemana(l){
  var o=resumenSemana(l), cs=getComputedStyle(document.documentElement);
  var ac=(cs.getPropertyValue("--accent")||"#4f46e5").trim(), vi=(cs.getPropertyValue("--violet")||"#7c3aed").trim();
  var cv=document.createElement("canvas"); cv.width=1080; cv.height=1350;
  var c=cv.getContext("2d"), F='"Plus Jakarta Sans", sans-serif';
  var gr=c.createLinearGradient(0,0,1080,1350); gr.addColorStop(0,ac); gr.addColorStop(1,vi);
  c.fillStyle=gr; c.fillRect(0,0,1080,1350);
  c.fillStyle="rgba(255,255,255,.72)"; c.font="700 38px "+F; c.fillText(tr("MI SEMANA"), 90, 150);
  c.fillStyle="#fff"; c.font="600 44px "+F; c.fillText(tr(rangoSemana(l)), 90, 215);
  c.font="800 250px "+F; c.fillText(String(o.xp), 80, 520);
  var wn=c.measureText(String(o.xp)).width; c.font="800 70px "+F; c.fillText("XP", 100+wn, 520);
  var cifras=[[o.activos+"/7",tr("días activos")],[String(o.gym),tr("días de ejercicio")],[horasTxt(o.estMin)||"0 min",tr("de estudio")],[String(o.retos),tr("retos hechos")]];
  cifras.forEach(function(x,i){
    var cx=90+(i%2)*460, cy=720+Math.floor(i/2)*220;
    c.fillStyle="#fff"; c.font="800 96px "+F; c.fillText(x[0], cx, cy);
    c.fillStyle="rgba(255,255,255,.72)"; c.font="600 38px "+F; c.fillText(x[1], cx, cy+58);
  });
  c.fillStyle="#fff"; c.font="800 52px "+F; c.fillText("Peak.", 90, 1250);
  var texto=tr("Mi semana en Peak")+": "+o.xp+" XP, "+o.activos+"/7 "+tr("días activos")+", "+o.gym+" "+tr("días de ejercicio")+".";
  function sinImagen(){
    if(navigator.share){ navigator.share({ text:texto }).catch(function(){}); return; }
    try{ navigator.clipboard.writeText(texto).then(function(){ avisoNube("Copiado. Pégalo donde quieras."); }); }catch(e){ avisoNube(texto); }
  }
  try{
    cv.toBlob(function(b){
      if(!b){ sinImagen(); return; }
      var file=null; try{ file=new File([b], "mi-semana-peak.png", {type:"image/png"}); }catch(e){}
      if(file && navigator.canShare && navigator.canShare({ files:[file] })){
        navigator.share({ files:[file], text:texto }).catch(function(){}); return;
      }
      if(!enVisor()){
        var u=URL.createObjectURL(b), a=document.createElement("a"); a.href=u; a.download="mi-semana-peak.png";
        document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(function(){ URL.revokeObjectURL(u); }, 1000); return;
      }
      sinImagen();
    }, "image/png");
  }catch(e){ sinImagen(); }
}

/* ── racha del grupo (Social) ── */
function rachaGrupo(){
  if(!GRUPO || !GRUPO.racha) return null;
  var hoy=today(), yoCerrado=!!(S.parte && S.parte[hoy]);
  var cerr=GRUPO.racha.cerrados.slice();
  if(yoCerrado && cerr.indexOf(GRUPO.yo)<0) cerr.push(GRUPO.yo);
  var faltan=GRUPO.miembros.filter(function(m){ return cerr.indexOf(m.usuario)<0; });
  var todos=!faltan.length, base=GRUPO.racha.dias;
  return { dias: base+(todos?1:0), base:base, mejor:Math.max(GRUPO.racha.mejor||0, base+(todos?1:0)),
           cerrados:cerr, faltan:faltan, todos:todos, yoCerrado:yoCerrado };
}
var LLAMA_RG='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.4c3.8 4.2 6 7.2 6 10.6a6 6 0 0 1-12 0c0-2.1.9-3.8 2.3-5.3-.1 1.5.4 2.5 1.2 3C9.8 7.5 10.6 5 12 2.4z"/></svg>';
function socRachaGrupo(){
  var r=rachaGrupo(); if(!r) return "";
  var hoy=today(), n=GRUPO.miembros.length;
  /* la semana: llamas encendidas los días que el grupo cumplió */
  var dias="";
  for(var i=6;i>=0;i--){
    var d=addDays(hoy,-i), esHoy=(i===0);
    var on = esHoy ? r.todos : (i<=r.base);
    var letra=L10N.sem[(new Date(d+"T00:00:00").getDay()+6)%7];
    dias+='<div class="rg-d'+(on?" on":"")+(esHoy?" hoy":"")+'"><span>'+LLAMA_RG+'</span><em>'+letra+'</em></div>';
  }
  /* celebrar una sola vez el día que todos cierran */
  var celebra = r.todos && (!S.rgVista || S.rgVista!==hoy);
  if(celebra){ S.rgVista=hoy; setTimeout(function(){ save(); sonido("semana"); }, 400); }
  var cifra = celebra
    ? '<b class="rg-num display num"><span class="a">'+r.base+'</span><span class="b">'+r.dias+'</span></b>'
    : '<b class="rg-num display num"><span>'+r.dias+'</span></b>';
  var boton;
  if(!r.yoCerrado) boton='<button class="rg-boton" data-act="parte">Hacer mi Parte del día</button>';
  else if(!r.todos) boton='<button class="rg-boton suave" data-act="x-toque"'+(S.toque===hoy?' disabled':'')+'>'+
    (S.toque===hoy?"Toque enviado":"Dar un toque a los que faltan")+'</button>';
  else boton='<p class="rg-ok">'+(r.cerrados.length>=n?'Todos habéis hecho el Parte del día. La racha sigue viva.':'Ya sois suficientes: la racha sigue viva.')+'</p>';
  return '<div class="soc-sec"><h2 class="display">Racha del grupo</h2><span class="t3" style="font-size:12.5px">mejor: '+r.mejor+'</span></div>'+
    '<div class="rg'+(celebra?" rg-celebra":"")+(r.todos?" rg-todos":"")+'">'+
      '<div class="rg-cab">'+
        '<span class="rg-llama">'+LLAMA_RG+'</span>'+cifra+
        '<div class="rg-cab-t"><span>'+(r.dias===1?"día":"días")+'</span><small>el grupo cumpliendo</small></div>'+
      '</div>'+
      '<div class="rg-semana">'+dias+'</div>'+
      '<div class="rg-hoy">'+
        '<div class="rg-hoy-t"><b>Hoy</b><span class="num">'+r.cerrados.length+' de '+n+(r.need&&r.need<n?' · bastan '+r.need:'')+'</span></div>'+
        '<div class="rg-seg">'+GRUPO.miembros.map(function(m,i){ return '<i class="'+(i<r.cerrados.length?"on":"")+'"></i>'; }).join("")+'</div>'+
        '<div class="rg-gente">'+GRUPO.miembros.map(function(m){
          var ok=r.cerrados.indexOf(m.usuario)>=0, yo=(m.usuario===GRUPO.yo);
          return '<div class="rg-p'+(ok?" ok":"")+'" data-act="x-perfil" data-u="'+esc(m.usuario)+'"><span class="rg-foto">'+caraDe(m,44)+'<i>'+(ok?ICON_CHECK:"")+'</i></span>'+
            '<em>'+(yo?"tú":esc(m.usuario))+'</em></div>';
        }).join("")+'</div>'+
      '</div>'+boton+
    '</div>';
}
/* ── hoy en el grupo: racha y ranking juntos, con el estilo tranquilo de la app ── */
function socHoyGrupo(){
  var r=rachaGrupo(); if(!r) return "";
  var hoy=today(), yoStats=null;
  var dias="";
  for(var i=6;i>=0;i--){
    var on = i===0 ? r.todos : (i<=r.base);
    dias+='<i class="'+(on?"on":"")+(i===0?" hoy":"")+'"></i>';
  }
  var celebra = r.todos && (!S.rgVista || S.rgVista!==hoy);
  if(celebra){ S.rgVista=hoy; setTimeout(function(){ save(); sonido("semana"); }, 400); }
  var cifra = celebra
    ? '<b class="rg-num display num"><span class="a">'+r.base+'</span><span class="b">'+r.dias+'</span></b>'
    : '<b class="rg-num display num"><span>'+r.dias+'</span></b>';
  var lista=ordenados();
  var filas=lista.map(function(m,i){
    var yo=(m.usuario===GRUPO.yo), ok=r.cerrados.indexOf(m.usuario)>=0;
    return '<div class="hg-fila" data-act="x-perfil" data-u="'+esc(m.usuario)+'">'+
      '<span class="hg-pos num">'+(i+1)+'</span>'+
      '<span class="hg-foto'+(ok?" ok":"")+'">'+caraDe(m,38)+(ok?'<i>'+ICON_CHECK+'</i>':'')+'</span>'+
      '<div class="hg-cuerpo"><p><b>'+esc(m.usuario)+'</b>'+(yo?'<span> · tú</span>':'')+'</p>'+
        '<small>'+(ok?"ha hecho su Parte del día":"aún no lo ha hecho")+'</small></div>'+
      '<div class="hg-pct"><b class="num">'+m.pct+'%</b><small>semana</small></div>'+
    '</div>';
  }).join("");
  var accion;
  if(!r.yoCerrado) accion='<button class="hg-accion" data-act="parte">Hacer mi Parte del día</button>';
  else if(!r.todos) accion='<button class="hg-accion" data-act="x-toque"'+(S.toque===hoy?' disabled':'')+'>'+(S.toque===hoy?"Toque enviado":"Dar un toque a los que faltan")+'</button>';
  else accion='<p class="hg-ok">Todos habéis hecho el Parte del día.</p>';
  return '<div class="soc-sec"><h2 class="display">Hoy en el grupo</h2><span class="t3" style="font-size:12.5px">mejor racha: '+r.mejor+'</span></div>'+
    '<div class="hg'+(celebra?" rg-celebra":"")+'">'+
      '<div class="hg-cab">'+
        '<span class="rg-llama">'+LLAMA_RG+'</span>'+cifra+
        '<div class="hg-cab-t"><b>'+(r.dias===1?"día":"días")+' seguidos</b><small>cumpliendo todos · hoy '+r.cerrados.length+' de '+GRUPO.miembros.length+'</small></div>'+
        '<div class="hg-dias">'+dias+'</div>'+
      '</div>'+
      '<div class="hg-lista">'+filas+'</div>'+accion+
    '</div>';
}
/* cuenta y pruebas, ahora en Ajustes */
function ajustesCuenta(){
  if(typeof socCuenta!=="function" || typeof ses==="undefined" || !ses) return "";
  try{ socEstilo(); }catch(e){}
  return '<div class="aj-cuenta mb-6">'+socCuenta().replace(/<div class="soc-sec"><h2 class="display">([^<]+)<\/h2>/g,'<div class="aj-sec"><p class="eyebrow mb-2">$1</p>')+'</div>';
}

/* toque a los que faltan (en modo prueba solo avisa) */
function toqueGrupo(){
  var r=rachaGrupo(); if(!r || !r.faltan.length) return;
  S.toque=today(); save();
  var nom=r.faltan.filter(function(m){ return m.usuario!==GRUPO.yo; }).map(function(m){ return m.usuario; });
  sonido("pop");
  avisoNube(nom.length ? "Toque enviado a "+nom.join(" y ")+"." : "Toque enviado.");
  rSocial();
}
/* ── reto en común: las filas se reordenan deslizándose ── */
function filasPos(){
  var m={}, fs=document.querySelectorAll(".soc-reto .soc-aporta [data-u]");
  for(var i=0;i<fs.length;i++) m[fs[i].dataset.u]=fs[i].getBoundingClientRect().top;
  return m;
}
function filasFlip(antes){
  if(!antes) return;
  var fs=document.querySelectorAll(".soc-reto .soc-aporta [data-u]");
  for(var i=0;i<fs.length;i++) (function(el){
    var u=el.dataset.u; if(antes[u]==null) return;
    var d=antes[u]-el.getBoundingClientRect().top; if(Math.abs(d)<1) return;
    el.style.transition="none"; el.style.transform="translateY("+d+"px)";
    el.style.position="relative"; el.style.zIndex=(GRUPO && u===GRUPO.yo)?"2":"1";
    void el.offsetWidth;
    requestAnimationFrame(function(){
      el.style.transition="transform .6s cubic-bezier(.3,.9,.25,1) .3s";
      el.style.transform="";
      setTimeout(function(){ el.style.transition=""; el.style.zIndex=""; }, 1000);
    });
  })(fs[i]);
}
/* "Ver los 5" / "Ver menos": la lista crece o encoge deslizándose */
function retoDespliega(){
  var caja=document.querySelector(".soc-reto .soc-aporta"), h0=caja?caja.getBoundingClientRect().height:0;
  var antes=filasPos(), abre=!retoTodos;
  retoTodos=!retoTodos; rSocial();
  var nueva=document.querySelector(".soc-reto .soc-aporta"); if(!nueva) return;
  var h1=nueva.getBoundingClientRect().height;
  nueva.style.height=h0+"px"; nueva.style.overflow="hidden";
  if(abre){
    var fs=nueva.querySelectorAll("[data-u]");
    for(var i=0;i<fs.length;i++) if(antes[fs[i].dataset.u]==null){ fs[i].classList.add("sr-nueva"); fs[i].style.animationDelay=(.08+i*.04)+"s"; }
  }
  void nueva.offsetWidth;
  nueva.style.transition="height .5s cubic-bezier(.3,.9,.3,1)";
  nueva.style.height=h1+"px";
  setTimeout(function(){ nueva.style.height=""; nueva.style.overflow=""; nueva.style.transition=""; }, 560);
  sonido("tick");
}
/* ── ×1,5: se activa con fiesta ── */
var tripleVisto={};
function vigilaTriple(){
  var d=curDay(), t=tripleDone(d), antes=tripleVisto[d];
  tripleVisto[d]=t;
  if(antes===false && t && view==="retos"){
    var bx=document.querySelector("#today-challenges .bonus-x"); if(!bx) return;
    bx.classList.add("bx-activa");
    setTimeout(function(){ sonido("semana"); try{ if(navigator.vibrate) navigator.vibrate([16,50,30]); }catch(e){} }, 120);
  }
}

/* ── marcar el reto en común: que se note ── */
function celebraRetoGrupo(antes){
  var caja=document.querySelector(".soc-reto"); if(!caja || !GRUPO) return;
  var r=GRUPO.reto, ahora=retoTotal(), meta=(ahora>=r.objetivo && antes<r.objetivo);
  sonido(meta ? "semana" : "salud");
  try{ if(navigator.vibrate) navigator.vibrate([12,60,24]); }catch(e){}
  var bt=caja.querySelector(".soc-boton"); if(bt) bt.classList.add("sr-sello");
  /* la cifra: primero la de antes, y salta a la nueva */
  var b=caja.querySelector(".soc-cifra b");
  if(b){ b.textContent=antes; setTimeout(function(){ b.textContent=ahora; b.classList.add("sr-pop"); }, 260); }
  /* la barra crece desde donde estaba */
  var i=caja.querySelector(".soc-barra > i");
  if(i){
    var fin=i.style.width;
    i.style.transition="none"; i.style.width=Math.min(100,Math.round(antes/r.objetivo*100))+"%";
    void i.offsetWidth;
    i.style.transition="width .9s cubic-bezier(.3,.9,.3,1) .15s"; i.style.width=fin;
  }
  /* tu fila: se ilumina y aparece el punto de hoy */
  var yo=caja.querySelector(".sr-yo");
  if(yo){
    yo.classList.add("sr-brillo");
    var pt=yo.querySelector(".soc-dias i.hoy"); if(pt) pt.classList.add("sr-punto");
    var nn=yo.querySelector(":scope > .num"); if(nn) nn.classList.add("sr-pop");
  }
  if(meta) caja.classList.add("sr-meta");
}

/* ── icono de la app con número: retos que te quedan hoy ── */
function pintaInsignia(){
  if(!("setAppBadge" in navigator)) return;
  try{
    var d=today(), q=Math.max(0, todaysChallenges(d).length-chOf(d).length);
    if(q>0) navigator.setAppBadge(q).catch(function(){}); else navigator.clearAppBadge().catch(function(){});
  }catch(e){}
}

/* ── pomodoro en la pantalla de bloqueo ── */
function hhmm(ms){ var x=new Date(ms); return (x.getHours()<10?"0":"")+x.getHours()+":"+(x.getMinutes()<10?"0":"")+x.getMinutes(); }
var pomoClave="";
function avisoPomodoro(){
  var a=S.estudio && S.estudio.actual;
  var clave = a ? a.fase+"|"+(a.fin||"p") : "";
  if(clave===pomoClave) return; pomoClave=clave;
  if(!("serviceWorker" in navigator) || !window.Notification || Notification.permission!=="granted") return;
  navigator.serviceWorker.getRegistration().then(function(reg){
    if(!reg) return;
    if(!a || a.fase==="listo" || !a.fin){
      reg.getNotifications({ tag:"pomodoro" }).then(function(ns){ ns.forEach(function(n){ n.close(); }); }).catch(function(){});
      return;
    }
    var t = a.fase==="estudio" ? "Concentración · "+a.nombre : "Descanso";
    var b = a.fase==="estudio" ? "Termina a las "+hhmm(a.fin)+(a.desc?" · luego "+a.desc+" min de descanso":"") : "Vuelves a las "+hhmm(a.fin);
    reg.showNotification(tr(t), { body:tr(b), tag:"pomodoro", silent:true, renotify:false, icon:"icon-192.png" }).catch(function(){});
  }).catch(function(){});
}

/* ── temas de un examen ── */
var temasTmp=[];
function temasHTML(e){
  temasTmp = (e && e.temas) ? e.temas.map(function(x){ return { t:x.t, ok:!!x.ok }; }) : [];
  return '<div class="tm-caja"><p class="eyebrow mb-2">Temas <span class="t3" style="letter-spacing:0;text-transform:none;font-weight:500">· opcional</span></p>'+
    '<div id="tm-lista">'+temasLista()+'</div>'+
    '<div class="flex gap-2 mt-2"><input id="tm-nuevo" class="field !py-2.5 !text-[13.5px]" maxlength="60" placeholder="Añadir tema">'+
    '<button class="btn btn-quiet" data-act="x-tema-add">+</button></div></div>';
}
function temasLista(){
  if(!temasTmp.length) return '<p class="text-[12.5px] t3">Apunta los temas que entran y ve tachándolos según los repasas.</p>';
  return temasTmp.map(function(x,i){
    return '<div class="tm-fila'+(x.ok?" ok done":"")+'"><button class="tm-marca" data-act="x-tema-tog" data-i="'+i+'"><span class="tick">'+ICON_CHECK+'</span><span class="tm-t">'+esc(x.t)+'</span></button>'+
      '<button class="tm-quita" data-act="x-tema-del" data-i="'+i+'" aria-label="Quitar">×</button></div>';
  }).join("");
}
function temasRefresca(){ var b=document.getElementById("tm-lista"); if(b) b.innerHTML=temasLista(); }
function temasGuardar(id){
  for(var i=0;i<S.exams.length;i++) if(S.exams[i].id===id){ if(temasTmp.length) S.exams[i].temas=temasTmp.slice(); else delete S.exams[i].temas; }
}
function temasResumen(e){
  if(!e || !e.temas || !e.temas.length) return "";
  var h=e.temas.filter(function(x){ return x.ok; }).length, n=e.temas.length;
  return '<div class="tm-prog"><div><i style="width:'+Math.round(h/n*100)+'%"></i></div><span class="num">'+h+' de '+n+' temas</span></div>';
}

/* ── accesos rápidos (mantener pulsado el icono en Android) ── */
function atajoInicial(){
  var m=/[?&]abre=([a-z]+)/.exec(location.search||""); if(!m) return;
  try{ history.replaceState(null, "", location.pathname); }catch(e){}
  setTimeout(function(){
    if(m[1]==="estudiar") sheetEstudio();
    else if(m[1]==="gym") go("vital");
    else if(m[1]==="retos") go("retos");
  }, 600);
}

/* ── acciones ── */
function novedadesAccion(a, el){
  if(limpiezaAccion(a, el)) return true;
  if(pulidoAccion(a, el)) return true;
  if(retoqueAccion(a, el)) return true;
  if(evolucionAccion(a, el)) return true;
  if(rumboAccion(a, el)) return true;
  if(a==="x-pref"){
    var k=el.dataset.k, v=!prefValor(k); prefPon(k, v);
    el.setAttribute("aria-pressed", v?"true":"false");
    if(k==="sonido" && v) setTimeout(function(){ sonido("ok"); }, 30);
    return true;
  }
  if(a==="x-toque"){ toqueGrupo(); return true; }
  if(a==="x-reto-todos"){ retoDespliega(); return true; }
  if(a==="x-reac-mas"){ reacAbiertas[el.dataset.id]=1; sonido("tick"); rSocial(); return true; }
  if(a==="x-hoy-checklist"){ var ci=document.getElementById("card-ideal"); if(ci) ci.scrollIntoView({behavior:"smooth", block:"start"}); return true; }
  if(a==="x-hoy-estudio"){ estudioPinta(); return true; }
  if(a==="x-parte-fin"){ parteFin(); return true; }
  if(a==="x-semana"){ abrirSemana(el.dataset.l); return true; }
  if(a==="x-semana-cerrar"){ cerrarSemana(); return true; }
  if(a==="x-semana-compartir"){ compartirSemana(el.dataset.l); return true; }
  if(a==="x-semanas-todas"){ semanasTodas=!semanasTodas; pintaSemanas(); return true; }
  if(a==="x-tema-add"){
    var inp=document.getElementById("tm-nuevo"), v2=(inp&&inp.value||"").trim();
    if(!v2){ if(inp) inp.focus(); return true; }
    temasTmp.push({ t:v2, ok:false }); inp.value=""; temasRefresca(); inp.focus(); sonido("tick"); return true;
  }
  if(a==="x-tema-tog"){ var x=temasTmp[+el.dataset.i]; if(x){ x.ok=!x.ok; sonido(x.ok?"tick":"des"); } temasRefresca(); temasAutoGuarda(); return true; }
  if(a==="x-tema-del"){ temasTmp.splice(+el.dataset.i,1); temasRefresca(); temasAutoGuarda(); return true; }
  if(a==="x-imp-archivo"){ var f=document.getElementById("imp-archivo"); if(f) f.click(); return true; }
  return false;
}
/* en un examen ya guardado, tachar un tema se guarda al momento */
function temasAutoGuarda(){
  var b=document.querySelector('#sheet [data-act="save-exam"]'), id=b&&b.dataset.id;
  if(id){ temasGuardar(id); save(); }
}

/* ── copia de seguridad: elegir el archivo en vez de pegarlo ── */
function copiaMejora(){
  var box=document.getElementById("imp-box"); if(!box || document.getElementById("imp-archivo")) return;
  var ta=document.getElementById("imp-text");
  box.insertAdjacentHTML("afterbegin",
    '<input id="imp-archivo" type="file" accept="application/json,.json,text/plain" hidden>'+
    '<button class="btn btn-quiet w-full mb-2" data-act="x-imp-archivo">Elegir el archivo de copia</button>'+
    '<p class="text-[11.5px] t3 mb-2 text-center">o pega su contenido aquí:</p>');
  document.getElementById("imp-archivo").addEventListener("change", function(ev){
    var f=ev.target.files && ev.target.files[0]; if(!f) return;
    var r=new FileReader(); r.onload=function(){ if(ta){ ta.value=String(r.result||""); } avisoNube("Archivo cargado. Pulsa «Restaurar todo» o «Solo el horario»."); };
    r.readAsText(f);
  });
}
/* descargar copia: en el móvil, mejor por el menú de compartir */
function exportaCopia(){
  var txt=JSON.stringify(S,null,1), nombre="peak-copia-"+today()+".json";
  try{
    var file=new File([txt], nombre, { type:"application/json" });
    if(navigator.canShare && navigator.canShare({ files:[file] })){ navigator.share({ files:[file], title:nombre }).catch(function(){}); return true; }
  }catch(e){}
  return false;
}

/* ── después de cada pintado ── */
function novedadesTrasRender(st){
  if(view==="resumen") pintaHoy(st);
  limpiezaTrasRender(st);
  pulidoTrasRender(st);
  retoqueTrasRender(st);
  evolucionTrasRender(st);
  rumboTrasRender(st);
  if(typeof disenoTrasRender==="function") disenoTrasRender(st);
  if(typeof bucleTrasRender==="function") bucleTrasRender(st);
  if(typeof grupoTrasRender==="function") grupoTrasRender(st);
  if(typeof lecturaTrasRender==="function") lecturaTrasRender(st);
  if(typeof crecerTrasRender==="function") crecerTrasRender(st);
  pintaRetoSemana(); pintaSemanas(); pintaAvisoSemana(); vigilaRetoSemana(); pintaInsignia(); avisoPomodoro(); vigilaTriple();
  if(document.getElementById("imp-box")) copiaMejora();
}
var novedadesListo=false;
function novedadesArranca(){
  prefAplica(); novedadesListo=true;
  document.addEventListener("click", sonidoAlTocar, true);
  atajoInicial();
  setInterval(avisoPomodoro, 2000);
}

var NOVEDADES_CSS=[
/* preferencias */
'.pref-lista{ border-radius:16px; background:var(--fill); overflow:hidden; }',
'.pref-fila{ width:100%; display:flex; align-items:center; gap:14px; padding:12px 14px; text-align:left; }',
'.pref-fila + .pref-fila{ box-shadow:inset 0 1px 0 var(--hairline); }',
'.pref-txt{ flex:1; min-width:0; display:flex; flex-direction:column; }',
'.pref-txt b{ font-size:14.5px; font-weight:600; color:var(--t1); }',
'.pref-txt span{ font-size:12px; color:var(--t3); margin-top:2px; line-height:1.35; }',
'.pref-sw{ width:46px; height:28px; flex:0 0 auto; border-radius:99px; background:var(--fill-hi); position:relative; transition:background .25s var(--ease); }',
'.pref-sw i{ position:absolute; left:3px; top:3px; width:22px; height:22px; border-radius:99px; background:#fff; box-shadow:0 1px 3px rgba(0,0,0,.25); transition:transform .3s var(--spring); }',
'.pref-fila[aria-pressed="true"] .pref-sw{ background:var(--good); }',
'.pref-fila[aria-pressed="true"] .pref-sw i{ transform:translateX(18px); }',
/* accesibilidad */
'html.a11y-grande .view, html.a11y-grande .sheet-card, html.a11y-grande #perfil-capa, html.a11y-grande #grupo-capa, html.a11y-grande #semana-capa{ zoom:1.12; }',
'html.a11y-contraste:not(.dark){ --t2:#33333c!important; --t3:#55555f!important; --hairline:rgba(20,20,26,.18)!important; --hairline-2:rgba(20,20,26,.12)!important; }',
'html.a11y-contraste.dark{ --t2:#d6d6dc!important; --t3:#b0b0b8!important; --hairline:rgba(255,255,255,.24)!important; --hairline-2:rgba(255,255,255,.14)!important; }',
'html.a11y-quieto *, html.a11y-quieto *::before, html.a11y-quieto *::after{ animation-duration:.01ms!important; animation-delay:0s!important; animation-iteration-count:1!important;',
'  transition-duration:.01ms!important; transition-delay:0s!important; scroll-behavior:auto!important; }',
/* reto de la semana */
'#reto-semana .rs-top{ display:flex; align-items:center; justify-content:space-between; }',
'.rs-xp{ font-size:12px; font-weight:800; padding:4px 9px; border-radius:99px; color:var(--accent); background:var(--accent-soft); }',
'.rs-t{ font-size:20px; font-weight:800; letter-spacing:-.03em; line-height:1.2; margin-top:10px; }',
'.rs-barra{ height:8px; border-radius:99px; background:var(--fill-hi); overflow:hidden; margin-top:16px; }',
'.rs-barra i{ display:block; height:100%; border-radius:99px; background:var(--accent); transition:width .8s var(--ease); }',
'.rs-pie{ display:flex; justify-content:space-between; margin-top:9px; font-size:12.5px; color:var(--t3); }',
/* tus semanas */
'.ts-graf{ width:100%; height:auto; display:block; overflow:visible; }',
'.ts-bar{ cursor:pointer; }',
'.ts-bar:hover path, .ts-bar:active path{ fill-opacity:.75; }',
'.ts-val{ font-size:10.5px; font-weight:700; fill:var(--t2); font-family:var(--f-texto); }',
'.ts-eje{ font-size:9.5px; fill:var(--t3); font-family:var(--f-texto); }',
'.ts-lista{ margin-top:14px; }',
'.ts-fila{ width:100%; display:flex; align-items:center; gap:10px; padding:12px 2px; text-align:left; box-shadow:inset 0 1px 0 var(--hairline); }',
'.ts-fila span{ flex:1; font-size:14px; }',
'.ts-fila b{ font-size:13px; font-weight:700; color:var(--t2); }',
'.ts-fila svg{ width:16px; height:16px; color:var(--t3); }',
'.ts-mas{ width:100%; padding:12px 0 2px; font-size:13.5px; font-weight:700; color:var(--accent); box-shadow:inset 0 1px 0 var(--hairline); }',
/* aviso del domingo */
'#semana-aviso{ margin-bottom:16px; }',
'.sa-caja{ width:100%; display:flex; align-items:center; gap:14px; }',
'.sa-t{ font-size:20px; font-weight:800; letter-spacing:-.03em; }',
'.sa-ir{ flex:0 0 auto; padding:10px 14px; border-radius:99px; font-size:13px; font-weight:700; color:var(--on-accent); background:var(--accent); }',
/* pantalla del resumen */
'#semana-capa{ position:fixed; inset:0; z-index:66; background:var(--bg); display:flex; flex-direction:column;',
'  transform:translateX(100%); transition:transform .42s cubic-bezier(.32,.72,0,1); }',
'#semana-capa.ve{ transform:none; }',
'.sm-ey{ text-align:center; margin-top:14px; }',
'.sm-xp{ display:flex; align-items:baseline; justify-content:center; gap:8px; margin-top:6px; }',
'.sm-xp b{ font-size:72px; font-weight:800; letter-spacing:-.05em; line-height:1; }',
'.sm-xp span{ font-size:22px; font-weight:800; color:var(--t3); }',
'.sm-dif{ text-align:center; font-size:14px; font-weight:600; margin-top:6px; }',
'.sm-dias{ display:grid; grid-template-columns:repeat(7,1fr); gap:8px; align-items:end; height:118px; margin-top:26px; }',
'.sm-dias div{ display:flex; flex-direction:column; align-items:center; justify-content:flex-end; height:100%; gap:8px; }',
'.sm-dias i{ width:100%; max-width:28px; border-radius:6px 6px 3px 3px; background:var(--fill-hi); }',
'.sm-dias .mejor i{ background:var(--accent); }',
'.sm-dias span{ font-size:11.5px; font-weight:700; color:var(--t3); }',
'.sm-mejor{ text-align:center; font-size:13.5px; color:var(--t2); margin-top:14px; }',
'.sm-cifras{ display:grid; grid-template-columns:repeat(3,1fr); margin-top:24px; box-shadow:inset 0 1px 0 var(--hairline); }',
'.sm-cifras div{ display:flex; flex-direction:column; align-items:center; padding:16px 4px; box-shadow:inset 0 -1px 0 var(--hairline); text-align:center; }',
'.sm-cifras div:not(:nth-child(3n+1)){ box-shadow:inset 0 -1px 0 var(--hairline), inset 1px 0 0 var(--hairline); }',
'.sm-cifras b{ font-size:24px; font-weight:800; letter-spacing:-.04em; line-height:1; }',
'.sm-cifras span{ font-size:11px; color:var(--t3); margin-top:6px; }',
'.sm-frase{ text-align:center; font-size:15px; color:var(--t2); margin:26px auto 0; max-width:32ch; line-height:1.45; }',
'.sm-compartir{ width:100%; height:54px; margin-top:22px; border-radius:999px; display:flex; align-items:center; justify-content:center; gap:10px;',
'  font-size:16px; font-weight:700; color:var(--on-accent); background:var(--accent); }',
'.sm-compartir svg{ width:20px; height:20px; }',
/* racha del grupo */
'.rg{ position:relative; overflow:hidden; border-radius:26px; padding:20px 18px 18px; color:#fff; isolation:isolate;',
'  background:radial-gradient(120% 90% at 100% 0%, rgba(255,214,120,.55) 0%, transparent 55%), linear-gradient(150deg,#ff8a3d 0%,#f0503c 55%,#d4336a 100%);',
'  box-shadow:0 18px 40px -22px rgba(240,80,60,.7); }',
'.rg-cab{ display:flex; align-items:center; gap:10px; }',
'.rg-llama{ width:46px; height:46px; display:grid; place-items:center; color:#fff; }',
'.rg-llama svg{ width:44px; height:44px; filter:drop-shadow(0 4px 10px rgba(120,20,0,.35)); }',
'.rg-num{ position:relative; display:inline-grid; font-size:58px; font-weight:800; letter-spacing:-.05em; line-height:.9; }',
'.rg-num span{ grid-area:1/1; }',
'.rg-cab-t{ display:flex; flex-direction:column; line-height:1.15; }',
'.rg-cab-t span{ font-size:17px; font-weight:800; }',
'.rg-cab-t small{ font-size:12.5px; opacity:.8; }',
'.rg-semana{ display:grid; grid-template-columns:repeat(7,1fr); gap:6px; margin-top:18px; }',
'.rg-d{ display:flex; flex-direction:column; align-items:center; gap:5px; }',
'.rg-d span{ width:34px; height:34px; border-radius:99px; display:grid; place-items:center; background:rgba(255,255,255,.14); color:rgba(255,255,255,.35); }',
'.rg-d span svg{ width:18px; height:18px; }',
'.rg-d.on span{ background:#fff; color:#f0503c; }',
'.rg-d.hoy span{ box-shadow:0 0 0 2px rgba(255,255,255,.8); }',
'.rg-d em{ font-style:normal; font-size:11px; font-weight:700; opacity:.8; }',
'.rg-hoy{ margin-top:18px; padding-top:16px; box-shadow:inset 0 1px 0 rgba(255,255,255,.22); }',
'.rg-hoy-t{ display:flex; justify-content:space-between; align-items:baseline; }',
'.rg-hoy-t b{ font-size:15px; font-weight:800; }',
'.rg-hoy-t span{ font-size:13.5px; font-weight:700; opacity:.9; }',
'.rg-seg{ display:flex; gap:5px; margin-top:9px; }',
'.rg-seg i{ flex:1; height:6px; border-radius:99px; background:rgba(255,255,255,.22); transition:background .4s var(--ease); }',
'.rg-seg i.on{ background:#fff; }',
'.rg-gente{ display:flex; justify-content:space-between; gap:6px; margin-top:16px; }',
'.rg-p{ display:flex; flex-direction:column; align-items:center; gap:6px; min-width:0; flex:1; }',
'.rg-foto{ position:relative; display:block; border-radius:99px; box-shadow:0 0 0 2px rgba(255,255,255,.3); }',
'.rg-p.ok .rg-foto{ box-shadow:0 0 0 2.5px #fff; }',
'.rg-p:not(.ok) .rg-foto > span:first-child{ opacity:.5; filter:saturate(.3); }',
'.rg-foto i{ position:absolute; right:-4px; bottom:-4px; width:19px; height:19px; border-radius:99px; display:grid; place-items:center;',
'  background:#fff; color:#1f9d5c; transform:scale(0); transition:transform .4s var(--spring); }',
'.rg-p.ok .rg-foto i{ transform:none; }',
'.rg-foto i svg{ width:11px; height:11px; }',
'.rg-p em{ font-style:normal; font-size:11.5px; font-weight:700; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }',
'.rg-p:not(.ok) em{ opacity:.65; }',
'.rg-boton{ width:100%; height:48px; margin-top:18px; border-radius:99px; font-size:15px; font-weight:700; background:#fff; color:#d9453a; transition:transform .3s var(--spring); }',
'.rg-boton:active{ transform:scale(.97); }',
'.rg-boton.suave{ background:rgba(255,255,255,.18); color:#fff; box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.4); }',
'.rg-boton[disabled]{ opacity:.6; }',
'.rg-ok{ margin-top:16px; text-align:center; font-size:13.5px; font-weight:700; }',
/* el día que todos cumplen */
'.rg-celebra .rg-num .a{ animation:rgSale .45s cubic-bezier(.5,0,.75,0) .5s both; }',
'.rg-celebra .rg-num .b{ animation:rgEntra .6s cubic-bezier(.2,1.3,.4,1) .7s both; }',
'@keyframes rgSale{ to{ opacity:0; transform:translateY(-60%); } }',
'@keyframes rgEntra{ from{ opacity:0; transform:translateY(60%); } to{ opacity:1; transform:none; } }',
'.rg-celebra .rg-llama svg{ animation:rgLlama .7s cubic-bezier(.3,1.6,.5,1) .6s both; }',
'@keyframes rgLlama{ 0%{ transform:scale(1); } 45%{ transform:scale(1.3) rotate(-6deg); } 100%{ transform:none; } }',
'.rg-celebra .rg-d.hoy span{ animation:rgHoy .6s cubic-bezier(.3,1.6,.5,1) .9s both; }',
'@keyframes rgHoy{ 0%{ background:rgba(255,255,255,.14); color:rgba(255,255,255,.35); transform:scale(.8); } 60%{ transform:scale(1.18); } 100%{ background:#fff; color:#f0503c; transform:none; } }',
/* hoy en el grupo */
'.hg{ border-radius:22px; background:var(--fill); padding:16px 16px 6px; }',
'.hg-cab{ display:flex; align-items:center; gap:8px; padding-bottom:14px; box-shadow:inset 0 -1px 0 var(--hairline); }',
'.hg .rg-llama{ width:34px; height:34px; color:var(--warn); }',
'.hg .rg-llama svg{ width:30px; height:30px; filter:none; }',
'.hg .rg-num{ font-size:40px; color:var(--t1); }',
'.hg-cab-t{ flex:1; min-width:0; display:flex; flex-direction:column; line-height:1.2; }',
'.hg-cab-t b{ font-size:14.5px; font-weight:700; }',
'.hg-cab-t small{ font-size:12px; color:var(--t3); }',
'.hg-dias{ display:flex; gap:4px; flex:0 0 auto; }',
'.hg-dias i{ width:8px; height:8px; border-radius:99px; background:var(--fill-hi); }',
'.hg-dias i.on{ background:var(--warn); }',
'.hg-dias i.hoy{ box-shadow:0 0 0 1.5px var(--warn); }',
'.hg-fila{ display:flex; align-items:center; gap:11px; padding:10px 0; cursor:pointer; }',
'.hg-fila + .hg-fila{ box-shadow:inset 0 1px 0 var(--hairline); }',
'.hg-pos{ width:14px; font-size:12.5px; font-weight:700; color:var(--t3); text-align:center; }',
'.hg-foto{ position:relative; flex:0 0 auto; }',
'.hg-foto > span:first-child{ opacity:.55; }',
'.hg-foto.ok > span:first-child{ opacity:1; }',
'.hg-foto i{ position:absolute; right:-3px; bottom:-3px; width:17px; height:17px; border-radius:99px; display:grid; place-items:center; background:var(--good); color:#fff; box-shadow:0 0 0 2px var(--fill); }',
'.hg-foto i svg{ width:10px; height:10px; }',
'.hg-cuerpo{ flex:1; min-width:0; }',
'.hg-cuerpo p{ font-size:14.5px; }',
'.hg-cuerpo p b{ font-weight:700; }',
'.hg-cuerpo p span{ color:var(--t3); }',
'.hg-cuerpo small{ font-size:12px; color:var(--t3); }',
'.hg-pct{ display:flex; flex-direction:column; align-items:flex-end; line-height:1.15; }',
'.hg-pct b{ font-size:15px; font-weight:800; }',
'.hg-pct small{ font-size:10.5px; color:var(--t3); }',
'.hg-accion{ width:100%; padding:12px 0 10px; font-size:14px; font-weight:700; color:var(--accent); box-shadow:inset 0 1px 0 var(--hairline); }',
'.hg-accion[disabled]{ color:var(--t3); }',
'.hg-ok{ padding:12px 0 10px; text-align:center; font-size:13.5px; font-weight:600; color:var(--good); box-shadow:inset 0 1px 0 var(--hairline); }',
/* el reto en común sin degradados en ningún tema */
'.soc .soc-reto, html.oro .soc-reto, html.dark .soc-reto, html.dark[class*="acento-"] .soc-reto{ background:var(--fill)!important; box-shadow:none!important; color:var(--t1)!important; }',
'.aj-cuenta .aj-sec{ margin-top:4px; }',
'.aj-cuenta .soc-ajustes{ margin:0 0 18px; }',
/* racha del grupo: la misma, sin degradado; solo las llamas con color */
'.rg{ color:var(--t1)!important; background:var(--fill)!important; box-shadow:none!important; }',
'.rg .rg-llama{ color:var(--warn); }',
'.rg .rg-llama svg{ filter:none; }',
'.rg .rg-cab-t small{ color:var(--t3); opacity:1; }',
'.rg .rg-d span{ background:var(--fill-hi); color:color-mix(in srgb,var(--t3) 70%,transparent); }',
'.rg .rg-d.on span{ background:var(--warn); color:#fff; }',
'.rg .rg-d.hoy span{ box-shadow:0 0 0 2px var(--warn); }',
'.rg .rg-d em{ color:var(--t3); opacity:1; }',
'.rg .rg-hoy{ box-shadow:inset 0 1px 0 var(--hairline); }',
'.rg .rg-hoy-t span{ color:var(--t2); opacity:1; }',
'.rg .rg-seg i{ background:var(--fill-hi); }',
'.rg .rg-seg i.on{ background:var(--warn); }',
'.rg .rg-foto{ box-shadow:none; }',
'.rg .rg-p.ok .rg-foto{ box-shadow:0 0 0 2.5px var(--warn); }',
'.rg .rg-foto i{ background:var(--good); color:#fff; box-shadow:0 0 0 2px var(--fill); }',
'.rg .rg-p em{ color:var(--t2); }',
'.rg .rg-boton{ background:var(--accent); color:var(--on-accent); }',
'.rg .rg-boton.suave{ background:var(--fill-hi); color:var(--t1); box-shadow:none; }',
'.rg .rg-ok{ color:var(--good); }',
'.rg.rg-celebra .rg-d.hoy span{ animation:rgHoy2 .6s cubic-bezier(.3,1.6,.5,1) .9s both; }',
'@keyframes rgHoy2{ 0%{ background:var(--fill-hi); transform:scale(.8); } 60%{ transform:scale(1.18); } 100%{ background:var(--warn); color:#fff; transform:none; } }',
/* checklist: al marcar, un brillo redondo que sale de la casilla */
'#ideal-list, #retos-checklist{ max-height:none!important; overflow:visible!important; }',
'.tick-fiesta{ animation:none!important; position:relative; isolation:isolate; }',
'.tick-fiesta::after{ content:""; position:absolute; left:-56px; top:50%; width:132px; height:132px; margin-top:-66px; border-radius:50%; z-index:-1; pointer-events:none;',
'  background:radial-gradient(circle, color-mix(in srgb,var(--accent) 26%,transparent) 0%, color-mix(in srgb,var(--accent) 10%,transparent) 40%, transparent 68%);',
'  animation:tickGlow .85s cubic-bezier(.2,.7,.3,1) forwards; }',
'@keyframes tickGlow{ 0%{ opacity:0; transform:scale(.2); } 25%{ opacity:1; } 100%{ opacity:0; transform:scale(1.5); } }',
'.tick-fiesta .strike{ transition:color .3s var(--ease); }',
'.soc-aporta .sr-nueva{ animation:srNueva .45s cubic-bezier(.2,.8,.2,1) both; }',
'@keyframes srNueva{ from{ opacity:0; transform:translateY(-8px); } to{ opacity:1; transform:none; } }',
/* reto en común: filas que se mueven */
'.soc-reto .soc-aporta [data-u]{ will-change:transform; }',
/* ×1,5 */
'#today-challenges .bonus-x{ position:relative; overflow:hidden; }',
'.bonus-x.bx-activa{ animation:bxPop .75s cubic-bezier(.3,1.4,.5,1); }',
'@keyframes bxPop{ 0%{ transform:scale(.96); } 45%{ transform:scale(1.025); } 100%{ transform:none; } }',
'.bonus-x.bx-activa::after{ content:""; position:absolute; top:0; bottom:0; left:0; width:45%; pointer-events:none;',
'  background:linear-gradient(100deg, transparent 0%, rgba(255,255,255,.55) 50%, transparent 100%); transform:translateX(-120%) skewX(-18deg);',
'  animation:bxBrillo .95s cubic-bezier(.4,0,.2,1) .25s forwards; }',
'@keyframes bxBrillo{ to{ transform:translateX(320%) skewX(-18deg); } }',
'.bonus-x.bx-activa > span:first-child{ display:inline-block; animation:bxNum .6s cubic-bezier(.2,1.4,.4,1) .1s both; }',
'@keyframes bxNum{ from{ opacity:0; transform:scale(.5) translateY(6px); } to{ opacity:1; transform:none; } }',
'.bonus-x.bx-activa > span:last-child{ animation:bxTxt .45s var(--ease) .22s both; }',
'@keyframes bxTxt{ from{ opacity:0; transform:translateY(6px); } to{ opacity:1; transform:none; } }',
/* checklist de Retos: que el círculo no se corte al saltar */
'#retos-checklist{ padding-left:8px; margin-left:-8px; padding-top:4px; margin-top:-4px; padding-bottom:4px; }',
/* temas de examen */
'.soc-reto .soc-boton.sr-sello{ animation:srSello .62s cubic-bezier(.3,1.5,.5,1); }',
'@keyframes srSello{ 0%{ transform:scale(.94); } 45%{ transform:scale(1.035); } 100%{ transform:none; } }',
'.sr-check{ width:20px; height:20px; flex:0 0 auto; }',
'.sr-check path{ stroke-dasharray:24; stroke-dashoffset:0; }',
'.sr-sello .sr-check path{ animation:srTraza .45s ease-out .18s both; }',
'@keyframes srTraza{ from{ stroke-dashoffset:24; } to{ stroke-dashoffset:0; } }',
'.sr-sello span{ animation:srTexto .4s var(--ease) .05s both; }',
'@keyframes srTexto{ from{ opacity:0; transform:translateY(6px); } to{ opacity:1; transform:none; } }',
'.soc-reto .soc-cifra b{ display:inline-block; }',
'.sr-pop{ animation:srPop .5s cubic-bezier(.3,1.6,.5,1); }',
'@keyframes srPop{ 0%{ transform:scale(1); } 40%{ transform:scale(1.2); } 100%{ transform:none; } }',
'.soc-dias i.sr-punto{ animation:srPunto .55s cubic-bezier(.3,1.7,.5,1) .35s both; }',
'@keyframes srPunto{ 0%{ transform:scale(0); } 60%{ transform:scale(1.5); } 100%{ transform:none; } }',
'.soc-reto .soc-cuerpo{ position:relative; }',
'.soc-reto .soc-cuerpo.sr-brillo::after{ content:""; position:absolute; top:3px; bottom:3px; left:-6px; right:-6px; border-radius:12px; background:var(--accent-soft); pointer-events:none; opacity:0; animation:srBrillo 1.1s var(--ease); }',
'@keyframes srBrillo{ 0%{ opacity:0; } 25%{ opacity:1; } 100%{ opacity:0; } }',
'.soc-reto.sr-meta{ animation:srMeta .9s cubic-bezier(.3,1.4,.5,1) .3s; }',
'@keyframes srMeta{ 0%{ transform:none; } 40%{ transform:scale(1.02); } 100%{ transform:none; } }',
'.tm-caja{ padding-top:4px; }',
'.tm-fila{ display:flex; align-items:center; gap:6px; }',
'.tm-marca{ flex:1; min-width:0; display:flex; align-items:center; gap:10px; padding:8px 2px; text-align:left; }',
'.tm-t{ font-size:14px; }',
'.tm-fila.ok .tm-t{ color:var(--t3); text-decoration:line-through; }',
'.tm-fila.ok .tick{ background:var(--good); box-shadow:inset 0 0 0 1.5px var(--good); }',
'.tm-quita{ width:30px; height:30px; border-radius:99px; color:var(--t3); font-size:18px; }',
'.tm-prog{ display:flex; align-items:center; gap:10px; margin-top:14px; }',
'.tm-prog div{ flex:1; height:6px; border-radius:99px; background:var(--fill-hi); overflow:hidden; }',
'.tm-prog i{ display:block; height:100%; background:var(--good); border-radius:99px; }',
'.tm-prog span{ font-size:12px; color:var(--t3); }'
].join("\n");

