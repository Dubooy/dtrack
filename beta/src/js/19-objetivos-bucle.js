/* ════════════════════════════════════════════════════════════════
   BUCLE: Peak sabe qué intentas mejorar y te ayuda a hacerlo hoy.
   Objetivos visibles, "Para hoy", el para qué de cada reto y hábito,
   tendencias de Vital, retos adaptativos, reto semanal con progresión,
   evolución narrativa y experimentos de 7 días.
   ════════════════════════════════════════════════════════════════ */

/* ════════════ iconos de línea (en vez de emojis) ════════════ */
var ICO_B={
  dormir:'<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/>',
  estudiar:'<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5A2.5 2.5 0 0 1 4 20.5z"/>',
  moverme:'<path d="M3 12h4l2.5-6 5 12 2.5-6H21"/>',
  movil:'<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M3.5 3.5l17 17"/>',
  comer:'<path d="M12 7.5c-1.6-1.4-5-1.6-6.4 1-1.7 3 .3 8.4 2.7 10.4 1.2 1 2.4.8 3.7.3 1.3.5 2.5.7 3.7-.3 2.4-2 4.4-7.4 2.7-10.4-1.4-2.6-4.8-2.4-6.4-1z"/><path d="M12 7.5c0-2 1-3.5 3-4"/>',
  orden:'<path d="M10 6h10M10 12h10M10 18h10"/><path d="M3.5 6l1.5 1.5L7.5 5M3.5 12l1.5 1.5 2.5-2.5M3.5 18l1.5 1.5 2.5-2.5"/>',
  calma:'<path d="M20 4c0 8-5 13-11 13H5c0-8 5-13 11-13h4z"/><path d="M5 20c2-5 5-8 9-10"/>',
  agua:'<path d="M12 3.5c3 3.6 5 6.3 5 9a5 5 0 0 1-10 0c0-2.7 2-5.4 5-9z"/>',
  pantalla:'<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  exp:'<path d="M9 3h6M10 3v6L4.6 18.4A1.8 1.8 0 0 0 6.2 21h11.6a1.8 1.8 0 0 0 1.6-2.6L14 9V3"/><path d="M7.2 14.5h9.6"/>',
  cal:'<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  habito:'<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.8 2.8L16 10"/>',
  animo:'<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c.9 1.2 2.1 1.8 3.5 1.8s2.6-.6 3.5-1.8M9 9.5h.01M15 9.5h.01"/>',
  evo:'<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  meta:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".6" fill="currentColor"/>',
  flecha:'<path d="M9 5l7 7-7 7"/>',
  grupo:'<circle cx="9" cy="8" r="3.4"/><path d="M2.5 20c0-3.3 2.9-5.6 6.5-5.6s6.5 2.3 6.5 5.6"/><path d="M16.5 5.2a3.4 3.4 0 0 1 0 6.6M18 14.6c2.1.6 3.5 2.3 3.5 4.6"/>'
};
function ico(k, cls){ return '<svg class="ic'+(cls?" "+cls:"")+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(ICO_B[k]||ICO_B.meta)+'</svg>'; }

/* ════════════ objetivos ════════════ */
var META_EMO={}; ONB_METAS.forEach(function(m){ META_EMO[m.k]=m.e; });
function metaPorK(k){ for(var i=0;i<ONB_METAS.length;i++) if(ONB_METAS[i].k===k) return ONB_METAS[i]; return null; }

/* el catálogo: a qué objetivo sirve cada reto conocido, lo difícil que es y su versión más dura */
var CAT_RETOS={};
(function(){
  function c(t, m, d, up){ CAT_RETOS[t.toLowerCase()]={ m:m, d:d, up:up||null }; }
  c("Lavarte los dientes especialmente bien, tres minutos completos","calma",1);
  c("Aguantar un minuto colgado de la barra de dominadas","moverme",2,"Aguantar minuto y medio colgado de la barra de dominadas");
  c("Aguantar minuto y medio colgado de la barra de dominadas","moverme",3);
  c("Hacer la cama nada más levantarte","orden",1);
  c("Beber un vaso de agua antes de cada comida","comer",1);
  c("Diez minutos de estiramientos antes de dormir","moverme",1,"Veinte minutos de estiramientos antes de dormir");
  c("Veinte minutos de estiramientos antes de dormir","moverme",2);
  c("Subir por las escaleras todo el día, cero ascensor","moverme",1);
  c("Media hora sin tocar el móvil mientras estudias","estudiar",2,"Una hora sin tocar el móvil mientras estudias");
  c("Una hora sin tocar el móvil mientras estudias","estudiar",3);
  c("Salir a andar veinte minutos sin auriculares","calma",1,"Salir a andar cuarenta minutos sin auriculares");
  c("Salir a andar cuarenta minutos sin auriculares","calma",2);
  c("Dejar la mochila preparada la noche anterior","orden",1);
  c("Escribir tres cosas que te han salido bien hoy","calma",1);
  c("Cincuenta sentadillas repartidas por el día","moverme",2,"Cien sentadillas repartidas por el día");
  c("Cien sentadillas repartidas por el día","moverme",3);
  c("Un minuto de plancha, en dos o tres series","moverme",2,"Dos minutos de plancha, en dos o tres series");
  c("Dos minutos de plancha, en dos o tres series","moverme",3);
  c("Comer una pieza de fruta a media mañana","comer",1);
  c("Recoger tu escritorio antes de ponerte a estudiar","orden",1);
  c("Repasar veinte minutos algo de hace dos semanas","estudiar",2,"Repasar cuarenta minutos algo de hace dos semanas");
  c("Repasar cuarenta minutos algo de hace dos semanas","estudiar",3);
  c("No mirar el móvil la primera hora del día","movil",2);
  c("Llamar o escribir a alguien de tu familia","calma",1);
  c("Ordenar los apuntes de una asignatura","estudiar",2);
  c("Dormir con el móvil fuera de la habitación","dormir",2);
  c("Ducha fría los últimos treinta segundos","calma",2,"Ducha fría el último minuto");
  c("Ducha fría el último minuto","calma",3);
  c("Leer diez páginas de algo que no sea de clase","calma",1,"Leer veinte páginas de algo que no sea de clase");
  c("Leer veinte páginas de algo que no sea de clase","calma",2);
  c("Preguntar una duda en clase en voz alta","estudiar",2);
  c("Cinco minutos sentado en silencio, sin nada","calma",1,"Diez minutos sentado en silencio, sin nada");
  c("Diez minutos sentado en silencio, sin nada","calma",2);
  c("Hacer la cena o ayudar a hacerla","comer",1);
  c("Andar hasta el instituto en vez de que te lleven","moverme",2);
  c("Terminar la tarea más pesada antes que las fáciles","estudiar",3);
  c("Levantarte a la primera, sin nueve alarmas","dormir",2);
  c("45 minutos de estudio con el móvil en otra habitación","estudiar",3,"Una hora y media de estudio con el móvil en otra habitación");
  c("Una hora y media de estudio con el móvil en otra habitación","estudiar",3);
  c("Recoger el cuarto hasta que se vea el suelo","orden",2);
  c("Subir andando todo el día, cero ascensor","moverme",1);
  c("Beberte los ocho vasos de agua","comer",2);
  c("Cero móvil durante la primera hora del día","movil",2);
  c("Un minuto colgado de la barra de dominadas","moverme",2,"Aguantar minuto y medio colgado de la barra de dominadas");
  c("Hacer tú la cena de principio a fin","comer",2);
  c("En la cama antes de las doce, con la luz apagada","dormir",2);
  c("Hoy a la cama media hora antes","dormir",2);
  c("Nada de pantallas en la cama","dormir",2);
  c("Una siesta de 20 minutos, ni uno más","dormir",1);
  c("Estudiar 50 minutos seguidos sin tocar el móvil","estudiar",3);
  c("Explicarle a alguien lo que has estudiado","estudiar",2);
  c("Hacer un esquema de un tema entero","estudiar",3);
  c("Un minuto de plancha","moverme",2,"Dos minutos de plancha");
  c("Dos minutos de plancha","moverme",3);
  c("Llegar a 10.000 pasos","moverme",2,"Llegar a 12.000 pasos");
  c("Llegar a 12.000 pasos","moverme",3);
  c("20 sentadillas antes de ducharte","moverme",1,"40 sentadillas antes de ducharte");
  c("40 sentadillas antes de ducharte","moverme",2);
  c("Una hora entera con el móvil en otra habitación","movil",2,"Dos horas enteras con el móvil en otra habitación");
  c("Dos horas enteras con el móvil en otra habitación","movil",3);
  c("Borrar una app que te roba tiempo","movil",3);
  c("Nada de redes hasta el mediodía","movil",3);
  c("Nada de bollería hoy","comer",2);
  c("Cocinar algo tú de principio a fin","comer",2);
  c("Beber solo agua en todo el día","comer",2);
  c("Planificar la semana 10 minutos","orden",1);
  c("Vaciar las notificaciones y los mensajes pendientes","orden",1);
  c("Tirar o regalar algo que no uses","orden",2);
  c("Diez minutos de paseo sin cascos","calma",1,"Media hora de paseo sin cascos");
  c("Media hora de paseo sin cascos","calma",2);
  c("Escribir una página de diario","calma",2);
  c("Llamar a alguien que te importe","calma",1);
  /* los hábitos del onboarding también dicen a qué objetivo sirven */
  ONB_METAS.forEach(function(m){ m.h.concat(m.r).forEach(function(t){ var k=t.toLowerCase(); if(!CAT_RETOS[k]) CAT_RETOS[k]={ m:m.k, d:2, up:null }; }); });
})();
var META_PALABRAS=[
  ["dormir", /dorm|cama|siesta|alarma|despert|acost/],
  ["movil", /m[óo]vil|pantalla|redes|notificac|instagram|tiktok|app /],
  ["estudiar", /estudi|apuntes|esquema|repas|temario|examen|deberes|tarea|clase|asignatura/],
  ["moverme", /entren|correr|andar|pasos|plancha|sentadill|ejercicio|gimnas|gym|estiramient|escaleras|bici|nadar|dominadas|flexiones|deporte/],
  ["comer", /fruta|agua|vasos|comer|comida|cena|desayun|boller|cocin|verdura|az[úu]car/],
  ["orden", /orden|planific|recoger|mochila|escritorio|limpi|cuarto|agenda|hacer la cama/],
  ["calma", /respir|diario|paseo|sol |silencio|llamar|leer|medit|gracias|cosas buenas|tranquil/]
];
function metaDeTexto(t){
  if(!t) return null;
  var k=String(t).trim().toLowerCase(), c=CAT_RETOS[k]; if(c) return c.m;
  for(var i=0;i<META_PALABRAS.length;i++) if(META_PALABRAS[i][1].test(k)) return META_PALABRAS[i][0];
  return null;
}
function catRetoDe(t){ return CAT_RETOS[String(t||"").trim().toLowerCase()]||null; }
/* los objetivos del usuario: los que eligió o, si no los tiene guardados, los que se deducen de su lista */
function misMetas(){
  if(S.onbMetas && S.onbMetas.length) return S.onbMetas.slice(0,3);
  var n={};
  (S.challenges||[]).forEach(function(c){ var m=metaDeTexto(c.text); if(m) n[m]=(n[m]||0)+1; });
  (S.ideal||[]).forEach(function(x){ if(x.hasta) return; var m=metaDeTexto(x.text); if(m) n[m]=(n[m]||0)+1.5; });
  return Object.keys(n).filter(function(k){ return n[k]>=3; }).sort(function(a,b){ return n[b]-n[a]; }).slice(0,3);
}
function metasElegidas(){ return !!(S.onbMetas && S.onbMetas.length); }
function metasTexto(ks){ return ks.map(function(k){ var m=metaPorK(k); return m ? tr(m.t) : ""; }).filter(Boolean).join(" · "); }

var metasBorrador=null;
function sheetMetas(){
  metasBorrador=misMetas().slice();
  openSheet('<div class="flex items-start justify-between mb-2"><div><p class="eyebrow mb-1.5">Tus objetivos</p><h3 class="display text-[20px] font-bold">¿Qué quieres mejorar?</h3></div>'+closeBtn()+'</div>'+
    '<p class="text-[12.5px] t3 mb-5 leading-relaxed">Elige hasta tres. Peak los usa para elegir tus retos del día y el de la semana, y te dice para qué sirve cada uno.</p>'+
    '<div class="mt-ops" id="mt-ops">'+metasOpsHTML()+'</div>'+
    '<label class="mt-anade"><input type="checkbox" id="mt-anade" checked><span>Añadir a mi lista los retos de los objetivos nuevos</span></label>'+
    '<button class="btn btn-primary w-full !py-3.5 mt-4" data-act="x-metas-ok">Guardar</button>');
}
function metasOpsHTML(){
  return ONB_METAS.map(function(m){ var on=metasBorrador.indexOf(m.k)>=0;
    return '<button class="mt-op'+(on?" on":"")+'" data-act="x-metas-op" data-k="'+m.k+'"><span>'+ico(m.k)+'</span><b>'+esc(m.t)+'</b></button>'; }).join("");
}
function metasGuarda(){
  var antes=misMetas(), nuevas=metasBorrador.filter(function(k){ return antes.indexOf(k)<0 || !metasElegidas(); });
  S.onbMetas=metasBorrador.slice(0,3);
  var anade=document.getElementById("mt-anade"), n=0;
  if(anade && anade.checked){
    var ya={}; (S.challenges||[]).forEach(function(c){ ya[c.text.toLowerCase()]=1; });
    nuevas.forEach(function(k){ var m=metaPorK(k); if(!m) return; m.r.forEach(function(t){ if(!ya[t.toLowerCase()]){ S.challenges.push({ id:uid(), text:t }); ya[t.toLowerCase()]=1; n++; } }); });
  }
  save(); closeSheet(); render(); var am=document.getElementById("aj-metas"); if(am) am.remove();
  avisoNube(n ? "Guardado. "+n+(n===1?" reto nuevo en tu lista.":" retos nuevos en tu lista.") : "Guardado.");
}

/* ════════════ tendencias de Vital (sin diagnósticos) ════════════ */
function vHab(d){ return (S.habits&&S.habits[d])||{}; }
function mediaVal(dias, f){ var s=0, n=0; dias.forEach(function(d){ var v=f(d); if(v!=null){ s+=v; n++; } }); return n ? { m:s/n, n:n } : { m:0, n:0 }; }
function rangoDias(a, b){ var hoy=today(), p0=primerDia(), out=[]; for(var i=a;i<=b;i++){ var d=addDays(hoy,-i); if(d>=p0) out.push(d); } return out; }
function num1(v){ return String(Math.round(v*10)/10).replace(".", L10N.dec||","); }
var TEND_DEF={
  sleep:{ ico:"😴", ik:"dormir", meta:"dormir", f:function(d){ var v=vHab(d).sleep; return v>0 ? v : null; }, lim:0.75,
          malo:function(r,b){ return "Últimamente duermes menos de lo habitual: "+num1(r)+" h estos días; sueles dormir "+num1(b)+" h."; },
          bueno:function(r,b){ return "Estos días duermes más que de costumbre: "+num1(r)+" h (sueles "+num1(b)+" h)."; }, sube:true },
  screen:{ ico:"📵", ik:"pantalla", meta:"movil", f:function(d){ var v=vHab(d).screen; return (v!=null && v>0) ? v : null; }, lim:1,
          malo:function(r,b){ return "Estos días pasas más tiempo con la pantalla: "+num1(r)+" h; sueles estar "+num1(b)+" h."; },
          bueno:function(r,b){ return "Estos días usas menos la pantalla: "+num1(r)+" h (sueles "+num1(b)+" h)."; }, sube:false },
  water:{ ico:"💧", ik:"agua", meta:"comer", f:function(d){ var v=vHab(d).water; return v>0 ? v : null; }, lim:2,
          malo:function(r,b){ return "Estos días bebes menos agua: "+num1(r)+" vasos; sueles beber "+num1(b)+"."; },
          bueno:function(r,b){ return "Estos días bebes más agua que de costumbre: "+num1(r)+" vasos."; }, sube:true }
};
function tendencias(){
  var out=[], rec=rangoDias(0,3), base=rangoDias(4,31), metas=misMetas();
  Object.keys(TEND_DEF).forEach(function(k){
    var T=TEND_DEF[k], r=mediaVal(rec,T.f), b=mediaVal(base,T.f);
    if(r.n<3 || b.n<7) return;
    var dif=r.m-b.m; if(Math.abs(dif)<T.lim) return;
    var malo = T.sube ? dif<0 : dif>0;
    out.push({ k:k, ico:T.ico, ik:T.ik, malo:malo, t:(malo?T.malo:T.bueno)(r.m,b.m), peso:Math.abs(dif)/T.lim+(metas.indexOf(T.meta)>=0?2:0)+(malo?3:0), r:r.m, b:b.m });
  });
  /* ejercicio: esta semana contra tu semana normal del último mes */
  var p0=primerDia();
  if(diff(p0,today())>=35){
    var ult=rangoDias(0,6).filter(wentGym).length, ant=rangoDias(7,34).filter(wentGym).length/4;
    if(ant>=1.5 && ult<=ant-2) out.push({ k:"gym", ico:"🏃", ik:"moverme", malo:true, t:"Esta semana te estás moviendo menos que de costumbre: "+ult+" días; sueles hacer ejercicio "+num1(ant)+".", peso:3+(metas.indexOf("moverme")>=0?2:0) });
  }
  out.sort(function(a,b){ return b.peso-a.peso; });
  return out;
}
function tendenciaDe(k){ var l=tendencias(); for(var i=0;i<l.length;i++) if(l[i].k===k) return l[i]; return null; }

/* Vital: debajo de cada barra, tu media y lo que sueles hacer */
function vitalTendencias(){
  var hoy=today(), base=rangoDias(4,31);
  Object.keys(VT_DEF).forEach(function(k){
    var def=VT_DEF[k], val=document.getElementById(def.id); if(!val) return;
    var fila=val.closest(".flex.items-center.gap-3\\.5"); if(!fila) return;
    var box=document.getElementById("vt-"+k);
    if(!box){ box=document.createElement("div"); box.id="vt-"+k; box.className="vt"; fila.parentNode.insertBefore(box, fila.nextSibling); }
    var barras="", suma=0, n=0;
    for(var i=6;i>=0;i--){
      var d=addDays(hoy,-i), h=(S.habits&&S.habits[d])||{}, v=h[k];
      var tiene=(v!=null && (k==="screen" ? true : v>0));
      if(tiene){ suma+=v; n++; }
      var alto=tiene ? Math.max(12, Math.min(100, Math.round(v/def.max*100))) : 0;
      barras+='<i class="'+(tiene&&def.bien(v)?"ok":"")+(i===0?" hoy":"")+'"><u style="height:'+alto+'%"></u></i>';
    }
    var media = n ? (Math.round(suma/n*10)/10) : null;
    var txt = media==null ? "Sin datos esta semana" : "Media: "+String(media).replace(".",L10N.dec)+" "+(def.u==="vasos"&&media===1?"vaso":def.u);
    var T=TEND_DEF[k], b=T?mediaVal(base,T.f):{n:0}, tt=tendenciaDe(k);
    var suele = (media!=null && b.n>=7) ? '<span class="vt-suele'+(tt&&tt.malo?" aviso":tt?" bien":"")+'">'+(tt?(tt.malo?"▼ ":"▲ "):"")+'sueles '+num1(b.m)+'</span>' : '';
    box.innerHTML='<div class="vt-barras">'+barras+'</div><span class="vt-t num">'+txt+'</span>'+suele;
  });
}

/* ════════════ descubrimientos, sin sonar a causa y con algo que probar ════════════ */
function descubrimientos(){
  var ds=diasConDatos(60), tmap=tasksByDay(), out=[];
  if(ds.length<7) return out;
  function hb(d){ return (S.habits&&S.habits[d])||{}; }
  function retos(d){ return todaysChallenges(d).length ? chOf(d).length : null; }
  function animo(d){ var a=animoDe(d); return a&&a.v ? a.v : null; }
  function estudio(d){ return estudioMinDia(d); }
  function habs(d){ var n=idealDe(d).length; return n ? checksOf(d).length/n : null; }
  function compara(si, f, formato){
    var A=ds.filter(function(d){ return si(d)===true; }), B=ds.filter(function(d){ return si(d)===false; });
    if(A.length<3 || B.length<3) return;
    var a=mediaDe(A,f), b=mediaDe(B,f); if(!a || !b || a.n<3 || b.n<3) return;
    formato(a.m, b.m);
  }
  function pct(a,b){ return b>0 ? Math.round((a-b)/b*100) : null; }
  function sueno7(d){ var s=hb(d).sleep; return s>0 ? s>=7 : null; }
  function pant2(d){ var s=hb(d).screen; return (s!=null && s>0) ? s<2 : null; }
  function agua8(d){ var s=hb(d).water; return s>0 ? s>=8 : null; }
  compara(sueno7, retos, function(a,b){ var p=pct(a,b); if(p!=null && p>=15) out.push({ ico:"😴", ik:"dormir", peso:p, exp:"sueno", t:"Los días que duermes 7 h o más haces un "+p+" % más de retos." }); });
  compara(function(d){ return wentGym(d); }, animo, function(a,b){ var dif=Math.round((a-b)*10)/10; if(dif>=0.4) out.push({ ico:"💪", ik:"moverme", peso:dif*40, exp:"ejercicio", t:"Los días que haces ejercicio, tu ánimo es "+num1(dif)+" puntos mejor de media." }); });
  compara(pant2, estudio, function(a,b){ var p=pct(a,b); if(p!=null && p>=20) out.push({ ico:"📵", ik:"pantalla", peso:p, exp:"pantalla", t:"Los días con menos de 2 h de pantalla estudias un "+p+" % más." }); });
  compara(agua8, habs, function(a,b){ var p=pct(a,b); if(p!=null && p>=15) out.push({ ico:"💧", ik:"agua", peso:p, exp:"agua", t:"Los días que bebes suficiente agua cumples un "+p+" % más de hábitos." }); });
  compara(function(d){ return !!(S.parte && S.parte[addDays(d,-1)]); }, retos, function(a,b){ var p=pct(a,b); if(p!=null && p>=15) out.push({ ico:"🌙", ik:"dormir", peso:p, exp:"parte", t:"Los días después de hacer el Parte del día haces un "+p+" % más de retos." }); });
  compara(sueno7, animo, function(a,b){ var dif=Math.round((a-b)*10)/10; if(dif>=0.4) out.push({ ico:"🛌", ik:"animo", peso:dif*35, exp:"sueno", t:"Los días que duermes 7 h o más, tu ánimo es "+num1(dif)+" puntos mejor." }); });
  var porDia=[0,0,0,0,0,0,0], cuenta=[0,0,0,0,0,0,0];
  ds.forEach(function(d){ var w=(new Date(d+"T00:00:00").getDay()+6)%7; porDia[w]+=dayXP(d,tmap); cuenta[w]++; });
  var mejor=-1, mv=0, total=0, tn=0;
  for(var i=0;i<7;i++){ if(cuenta[i]>=2){ var m=porDia[i]/cuenta[i]; total+=m; tn++; if(m>mv){ mv=m; mejor=i; } } }
  if(mejor>=0 && tn>=5 && mv>total/tn*1.2) out.push({ ico:"📅", ik:"cal", peso:20, t:"Tu mejor día de la semana es el "+L10N.dias[mejor].toLowerCase()+": "+Math.round(mv)+" XP de media." });
  out.sort(function(a,b){ return b.peso-a.peso; });
  return out;
}
/* en Resumen: el descubrimiento del día, o el experimento en marcha */
function pintaDescubrimiento(){
  var hoy=document.getElementById("hoy"); if(!hoy) return;
  var ph=document.getElementById("hy-parahoy");
  /* el experimento en marcha, justo después de "Para hoy" */
  var el=document.getElementById("hy-desc"), act=expActivo();
  if(act){
    if(!el || el.tagName!=="DIV"){ if(el) el.remove(); el=document.createElement("div"); el.id="hy-desc"; }
    if(ph && ph.nextSibling!==el) ph.parentNode.insertBefore(el, ph.nextSibling);
    var n=Math.min(7, diff(act.ini,today())+1), hoyC=expCond(act, today()), E=expDef(act.k);
    var estado = hoyC===true ? "Hoy cuenta ✓" : hoyC===false ? "Hoy no se cumple, también sirve para comparar" : E.falta;
    el.className="hy-exp";
    el.innerHTML='<button class="hd-main" data-act="x-exp-ver"><span class="hd-ico">'+ico("exp")+'</span><span class="hd-txt"><small>Experimento · día '+n+' de 7</small><b>'+esc(expTitulo(act))+'</b><em>'+esc(estado)+'</em></span></button>'+
      '<span class="hd-puntos">'+expPuntos(act)+'</span>';
  } else if(el) el.remove();
  pintaEvoHoy();
}
/* Tu evolución, con peso propio en Resumen */
function evoFrase(){
  var c=cambioDatos(), que=c.lab==="Hace un mes" ? "que hace un mes" : "que al empezar";
  if(c.faltan) return '<span>En '+c.faltan+(c.faltan===1?" día":" días")+' podrás comparar cómo estás ahora con cómo empezaste.</span>';
  if(c.top) return '<span>'+(c.top.bueno?"Tu mayor cambio este mes: ":"Lo que más ha cambiado: ")+'</span><b>'+esc(c.top.D.frase(c.top.dif)+" "+que+".")+'</b>';
  if(c.filas && c.filas.length) return '<span>Todo bastante estable. Mantener también cuenta.</span>';
  return '<span>Apunta el sueño, la pantalla o el ánimo unos días y aquí verás si estás cambiando.</span>';
}
function pintaEvoHoy(){
  var hoy=document.getElementById("hoy"); if(!hoy) return;
  var el=document.getElementById("hy-evo");
  if(!el){ el=document.createElement("div"); el.id="hy-evo"; }
  var ant=document.getElementById("hy-desc")||document.getElementById("hy-parahoy");
  if(ant && ant.nextSibling!==el) ant.parentNode.insertBefore(el, ant.nextSibling);
  var e=evoDatos(), d=expActivo()?null:descubrimientoDelDia();
  var tit = e.activos===0 ? "Hoy empieza tu historia" : (e.activos===1?"1 día":e.activos+" días")+" moviéndote";
  el.innerHTML='<button class="he-main" data-act="x-historial">'+
      '<span class="he-top"><span class="he-ico">'+ico("evo")+'</span><span class="he-ey">Tu evolución</span>'+ico("flecha","he-fl")+'</span>'+
      '<span class="he-t display">'+esc(tit)+'</span>'+
      '<span class="he-s">'+evoFrase()+'</span>'+
      '<span class="ev-mapa he-mapa">'+evoMapa(18, e.tmap)+'</span>'+
    '</button>'+
    (d ? '<div class="he-desc"><span class="he-dico">'+ico(d.ik)+'</span><div><small>Lo que hemos aprendido de ti</small><p>'+esc(d.t)+'</p>'+
         (d.exp?'<button data-act="x-exp-empieza" data-k="'+d.exp+'">¿Lo pruebas esta semana?</button>':'')+'</div></div>' : '');
}

/* ════════════ Resumen: objetivos y "Para hoy" ════════════ */
function pintaMetasHoy(){ var v=document.getElementById("hy-metas"); if(v) v.remove(); return;
  var sub=document.getElementById("hero-sub"); if(!sub) return;
  var el=document.getElementById("hy-metas");
  if(!el){ el=document.createElement("button"); el.id="hy-metas"; el.setAttribute("data-act","x-metas"); }
  if(sub.nextSibling!==el) sub.parentNode.insertBefore(el, sub.nextSibling);
  var ks=misMetas();
  el.innerHTML = ks.length ? '<span class="hm-t">Trabajando en</span><span class="hm-l">'+ks.map(function(k){ var m=metaPorK(k); return '<i>'+m.e+' <span>'+esc(m.t)+'</span></i>'; }).join("")+'</span>'
                           : '<span class="hm-t">¿Qué quieres mejorar?</span><span class="hm-l"><i class="vacio">Elige tus objetivos</i></span>';
}
function fila(txt, act, id, extra, hecho, meta, clase){
  return '<div class="hy-fila'+(hecho?" done":"")+(clase?" "+clase:"")+'">'+
    '<button class="tick tick-sm" data-act="'+act+'" data-id="'+id+'"'+(extra||"")+' aria-label="Marcar">'+ICON_CHECK+'</button>'+
    '<button class="hy-txt" data-act="'+act+'" data-id="'+id+'"'+(extra||"")+'><span class="strike">'+esc(txt)+'</span></button>'+
    (meta?'<span class="hy-meta">'+meta+'</span>':'')+'</div>';
}
function paraHoyHTML(){
  var t=today(), filas=[], max=5;
  /* los retos del día que faltan */
  var tc=todaysChallenges(t), md=chOf(t);
  var pend=tc.filter(function(c){ return md.indexOf(c.id)<0; });
  pend.forEach(function(c){ filas.push(fila(c.text, "ch", c.id, ' data-day="'+t+'"', false, '<span class="hy-reto">reto</span>')); });
  /* las 3 que elegiste anoche en el Parte */
  var plan=(S.plan&&S.plan[t])||[];
  plan.forEach(function(id){ var tk=taskById(id); if(!tk || tk.done) return; filas.push(fila(tk.text, "toggle", tk.id, "", false, '<span class="hy-plan">de anoche</span>')); });
  /* el reto del grupo */
  if(typeof GRUPO!=="undefined" && GRUPO && GRUPO.reto && GRUPO.reto.txt){
    var r=GRUPO.reto;
    if(t>=r.inicio && t<=r.acaba && !retoHoyHecho()) filas.push('<div class="hy-fila"><button class="tick tick-sm" data-act="soc-reto" aria-label="Marcar">'+ICON_CHECK+'</button>'+
      '<button class="hy-txt" data-act="soc-reto"><span class="strike">'+esc(r.txt)+'</span></button><span class="hy-meta"><span class="hy-grupo-m">grupo</span></span></div>');
  }
  /* los hábitos ya tienen su tarjeta en Resumen: aquí no se repiten */
  var ck=checksOf(t), quedan=idealActivos().filter(function(it){ return ck.indexOf(it.id)<0; }).length;
  var total=filas.length; filas=filas.slice(0,max);
  var h=filas.join("");
  if(!total && quedan){
    h='<div class="hy-fila info"><span class="hy-punto" style="background:var(--accent)"></span><span class="hy-txt"><b>Retos hechos.</b> '+(quedan===1?"Te queda 1 hábito.":"Te quedan "+quedan+" hábitos.")+'</span></div>';
  } else if(!total){
    var parte=!!(S.parte&&S.parte[t]), hh=new Date().getHours();
    h = (!parte && hh>=18) ? '<div class="hy-fila info"><span class="hy-punto" style="background:var(--violet)"></span><button class="hy-txt" data-act="parte"><b>Todo hecho.</b> Solo falta el Parte del día.</button></div>'
                           : '<div class="hy-fila info"><span class="hy-punto" style="background:var(--good)"></span><span class="hy-txt"><b>Todo lo de hoy, hecho.</b> Lo demás es extra.</span></div>';
  }
  /* una tendencia, si la hay: sin diagnósticos, solo lo que dicen tus datos */
  var tt=tendencias()[0], modo=(S.chInfo&&S.chInfo[t])||null, nota="";
  if(tt){
    var suave = tt.malo && modo && modo.modo==="suave" && modo.porque==="sueno";
    nota='<button class="hy-tend'+(tt.malo?" malo":"")+'" data-jump="vital"><span>'+ico(tt.ik)+'</span><b>'+esc(tt.t)+(suave?" Hoy te hemos puesto retos más suaves.":"")+'</b></button>';
  }
  return '<div class="hy-sec"><h2 class="display">Para hoy</h2>'+(total>max?'<button data-jump="retos">Ver todo</button>':'')+'</div>'+nota+'<div class="hy-lista">'+h+'</div>';
}
var phVistos=null;
function pintaParaHoy(){
  var box=document.getElementById("hoy"); if(!box) return;
  var el=document.getElementById("hy-parahoy");
  if(!el){ el=document.createElement("div"); el.id="hy-parahoy"; }
  var ref=box.querySelector(".hy-dos")||document.getElementById("hy-detalle")||document.getElementById("hoy-anillos");
  if(ref && ref.nextSibling!==el) ref.parentNode.insertBefore(el, ref.nextSibling);
  el.innerHTML=paraHoyHTML();
  /* lo que aparece nuevo entra suave */
  var ahora={};
  el.querySelectorAll(".hy-fila").forEach(function(f){ var b=f.querySelector("[data-id], [data-act]"); var k=b?(b.dataset.act+"|"+(b.dataset.id||"")):f.textContent; ahora[k]=1; if(phVistos && !phVistos[k]) f.classList.add("entra"); });
  phVistos=ahora;
}
document.addEventListener("click", function(ev){
  var b=ev.target.closest ? ev.target.closest("#hy-parahoy .hy-fila [data-act]") : null; if(!b) return;
  var a=b.dataset.act; if(["ch","check","toggle","soc-reto"].indexOf(a)<0) return;
  if(b.dataset.pasa){ delete b.dataset.pasa; return; }
  var fila=b.closest(".hy-fila"); if(!fila || fila.classList.contains("sale")) { ev.preventDefault(); ev.stopPropagation(); return; }
  ev.preventDefault(); ev.stopPropagation(); if(ev.stopImmediatePropagation) ev.stopImmediatePropagation();
  fila.classList.add("done","marca");
  try{ sonido("tick"); }catch(e){}
  setTimeout(function(){
    fila.style.height=fila.offsetHeight+"px"; void fila.offsetWidth;
    fila.classList.add("sale"); fila.style.height="0px";
  }, 260);
  setTimeout(function(){ b.dataset.pasa="1"; b.click(); }, 640);
}, true);

function objetivoEmojis(raiz){
  raiz=raiz||document; var metas=misMetas(); if(!metas.length) return;
  raiz.querySelectorAll('[data-act="ch"][data-id] .strike, [data-act="check"][data-id] .strike, [data-act="x-cant"][data-id] .strike').forEach(function(s){
    var b=s.closest("[data-id]"), btn=s.parentNode; if(!b || btn.querySelector(".mt-emo")) return;
    var id=b.dataset.id, a=b.dataset.act, txt=null;
    if(a==="ch"){ var c=byChId(id); txt=c&&c.text; } else { var x=habPorId(id); txt=x&&x.text; }
    var m=metaDeTexto(txt); if(!m || metas.indexOf(m)<0) return;
    var e=document.createElement("span"); e.className="mt-emo"; e.innerHTML=ico(m); e.title=tr(metaPorK(m).t);
    btn.insertBefore(e, s);
  });
}

/* ════════════ retos del día adaptativos ════════════
   Siempre dentro de TU lista. Mira tus objetivos, lo que has hecho con cada
   reto, que no se repitan y la carga del día. Se decide una vez por día. */
function azar(sem){ var a=sem>>>0; return function(){ a=(a+0x6D2B79F5)>>>0; var t=a; t=Math.imul(t^(t>>>15), t|1); t^=t+Math.imul(t^(t>>>7), t|61); return ((t^(t>>>14))>>>0)/4294967296; }; }
function chHistoria(d, dias){
  var o={}, hasta=dias||30;
  for(var i=1;i<=hasta;i++){
    var k=addDays(d,-i), p=S.chPick&&S.chPick[k]; if(!p || !p.length) continue;
    var hechos=(S.chDone&&S.chDone[k])||[];
    p.forEach(function(id){ var x=o[id]||(o[id]={ sale:0, hecho:0, ult:null }); x.sale++; if(hechos.indexOf(id)>=0) x.hecho++; if(x.ult===null) x.ult=i; });
  }
  return o;
}
function cargaDe(d){
  var sale=0, hecho=0, dias=0;
  for(var i=1;i<=3;i++){ var k=addDays(d,-i), p=S.chPick&&S.chPick[k]; if(!p||!p.length) continue; dias++; sale+=p.length; hecho+=((S.chDone&&S.chDone[k])||[]).filter(function(id){ return p.indexOf(id)>=0; }).length; }
  var flojo = dias>=2 && sale>0 && hecho/sale<0.34;
  var sueno = (d===today()) && !!(function(){ var t=tendenciaDe("sleep"); return t && t.malo; })();
  var manana=addDays(d,1);
  var examen = (S.exams||[]).some(function(e){ return e.date===d || e.date===manana; });
  var tareas = (S.tasks||[]).filter(function(t){ return !t.done && t.due===d; }).length>=3;
  var fuerte=true, n5=0;
  for(var j=1;j<=5;j++){ var k2=addDays(d,-j); if(S.chPick&&S.chPick[k2]&&S.chPick[k2].length){ n5++; if(!tripleDone(k2)) fuerte=false; } else fuerte=false; }
  fuerte = fuerte && n5===5;
  if(flojo) return { modo:"suave", porque:"flojo" };
  if(sueno) return { modo:"suave", porque:"sueno" };
  if(examen) return { modo:"suave", porque:"examen" };
  if(tareas) return { modo:"suave", porque:"tareas" };
  if(fuerte) return { modo:"fuerte", porque:"racha" };
  return { modo:"normal", porque: misMetas().length ? "metas" : "" };
}
function difDe(c, h){
  var cat=catRetoDe(c.text); if(cat) return cat.d;
  if(h && h.sale>=3){ var r=h.hecho/h.sale; return r>=0.75?1 : r<=0.3?3 : 2; }
  return 2;
}
function drawChallenges(d){
  var list=S.challenges||[]; if(!list.length) return [];
  var carga=cargaDe(d);
  if(!S.chInfo) S.chInfo={};
  S.chInfo[d]=carga;
  if(list.length<=3) return list.slice();
  var hist=chHistoria(d, 30), metas=misMetas(), rnd=azar(hash("dtrack"+d));
  var cand=list.map(function(c){
    var h=hist[c.id], m=(catRetoDe(c.text)||{}).m || metaDeTexto(c.text), dif=difDe(c,h), w=1;
    if(m && metas.indexOf(m)>=0) w*=1.7;
    if(h && h.ult===1) w*=0.2; else if(h && h.ult===2) w*=0.5;
    if(h && h.sale>=3){ var r=h.hecho/h.sale; if(r>=0.8) w*=0.7; else if(r<=0.2) w*=0.5; }
    if(carga.modo==="suave"){ if(dif>=3) w*=0.15; else if(dif===1) w*=1.8; }
    if(carga.modo==="fuerte"){ if(dif>=3) w*=1.8; else if(dif===1) w*=0.6; }
    return { c:c, m:m, dif:dif, w:w };
  });
  var out=[];
  for(var k=0;k<3;k++){
    var tot=cand.reduce(function(s,x){ return s+x.w; },0); if(tot<=0) break;
    var r=rnd()*tot, i=0; while(i<cand.length-1 && r>cand[i].w){ r-=cand[i].w; i++; }
    var el=cand.splice(i,1)[0]; out.push(el);
    cand.forEach(function(x){ if(el.m && x.m===el.m) x.w*=0.35; });   /* variedad: no tres del mismo objetivo */
  }
  function asegura(cumple){
    if(out.some(cumple)) return;
    var mejor=null; cand.forEach(function(x){ if(cumple(x) && (!mejor || x.w>mejor.w)) mejor=x; }); if(!mejor) return;
    var peor=0; out.forEach(function(x,j){ if(Math.abs(x.dif-mejor.dif)>Math.abs(out[peor].dif-mejor.dif)) peor=j; });
    out[peor]=mejor;
  }
  if(carga.modo==="suave") asegura(function(x){ return x.dif===1; });
  if(carga.modo==="fuerte") asegura(function(x){ return x.dif>=3; });
  return out.map(function(x){ return x.c; });
}
function porqueRetos(){
  var i=(S.chInfo&&S.chInfo[today()])||null; if(!i) return tr("Cambian cada día a las 00:00");
  var T={ flojo:"Hoy algo más suave: llevas unos días flojos.", sueno:"Hoy algo más suave: estos días duermes menos.",
          examen:"Hoy algo más suave: tienes un examen muy pronto.", tareas:"Hoy algo más suave: tienes mucho entre manos.",
          racha:"Vas fuerte: hoy uno es un poco más exigente." };
  if(T[i.porque]) return tr(T[i.porque]);
  var ms=misMetas(); if(ms.length) return tr("Elegidos para")+": "+metasTexto(ms);
  return tr("Cambian cada día a las 00:00");
}
function pintaPorqueRetos(){
  var h=document.getElementById("ch-title"); if(!h) return;
  var p=h.nextElementSibling; if(!p) return;
  var t=porqueRetos(); if(p.textContent!==t){ p.textContent=t; p.setAttribute("data-tr-no","1"); }
  p.classList.toggle("ch-porque", !!(S.chInfo&&S.chInfo[today()]&&S.chInfo[today()].modo!=="normal"));
  /* ofrecer la versión más difícil de un reto que ya haces siempre */
  var box=document.getElementById("today-challenges"); if(!box) return;
  var info=(S.chInfo&&S.chInfo[today()])||{}, hist=chHistoria(today(), 30);
  if(!S.chNoSube) S.chNoSube={};
  todaysChallenges(today()).forEach(function(c){
    var cat=catRetoDe(c.text), h=hist[c.id];
    if(!cat || !cat.up || info.modo==="suave" || S.chNoSube[c.id] || !h || h.sale<4 || h.hecho/h.sale<0.8) return;
    if(box.querySelector('.ch-sube[data-id="'+c.id+'"]')) return;
    var b=box.querySelector('[data-act="ch"][data-id="'+c.id+'"]'), f=b&&b.closest(".soft"); if(!f) return;
    f.insertAdjacentHTML("afterend", '<div class="ch-sube" data-id="'+c.id+'"><p>Lo haces casi siempre. ¿Subimos un poco?</p>'+
      '<div><button data-act="x-ch-sube" data-id="'+c.id+'">'+esc(cat.up)+'</button><button class="no" data-act="x-ch-nosube" data-id="'+c.id+'">Así está bien</button></div></div>');
  });
}

/* ════════════ reto de la semana: por tus objetivos, variado y con progresión ════════════ */
var RS_METAS={ dormir:["sueno5","pant4"], estudiar:["est6","tres5"], moverme:["gym4"], movil:["pant4"], comer:["agua5"], orden:["check4","tres5"], calma:["sueno5","check4"] };
function rsHistorial(id, l){
  var c=rsCfg(), out=[];
  for(var w=1; w<=8 && out.length<2; w++){ var lw=addDays(l,-7*w), sn=c.sem[lw]; if(sn && sn.id===id){ var s=retoSemana(lw); out.push({ hecho:s.hecho, v:s.v, meta:sn.meta }); } }
  return out;
}
function rsSnapActual(l, forzar){
  var c=rsCfg();
  if(c.sem[l] && !forzar) return c.sem[l];
  var pool=rsPool(); if(!pool.length) return null;
  var elegido=null; if(c.elegido[l]) pool.forEach(function(p){ if(p.id===c.elegido[l]) elegido=p; });
  var r=elegido, porque="", razonMeta=null;
  if(!r){
    var metas=misMetas(), antes1=c.sem[addDays(l,-7)], antes2=c.sem[addDays(l,-14)], rnd=azar(hashTxt("sem"+l));
    var cand=pool.map(function(p){
      var w=1, m=null;
      metas.forEach(function(k){ if((RS_METAS[k]||[]).indexOf(p.id)>=0){ w*=2.5; if(!m) m=k; } });
      if(antes1 && antes1.id===p.id) w*=0.1; else if(antes2 && antes2.id===p.id) w*=0.5;
      return { p:p, w:w, m:m };
    });
    var tot=cand.reduce(function(s,x){ return s+x.w; },0), x=rnd()*tot, i=0;
    while(i<cand.length-1 && x>cand[i].w){ x-=cand[i].w; i++; }
    r=cand[i].p; razonMeta=cand[i].m;
  }
  var meta=r.meta;
  if(!r.propio && !elegido){
    var h=rsHistorial(r.id, l), lim=RS_LIM[r.id]||[1,7], paso=r.id==="est6"?60:1;
    if(h.length && h[0].hecho && (h[0].v>=h[0].meta+paso || (h[1]&&h[1].hecho))){ meta=Math.min(lim[1], h[0].meta+paso, r.meta+2*paso); if(meta>r.meta || meta>h[0].meta) porque="sube"; }
    else if(h.length>=2 && !h[0].hecho && !h[1].hecho){ meta=Math.max(lim[0], Math.min(h[0].meta, h[1].meta)-paso, r.meta-2*paso); porque="baja"; }
    else if(h.length) meta=h[0].meta;
  }
  c.sem[l]={ id:r.id, t:r.propio ? r.t : rsTitulo(r.id, meta), meta:meta, u:r.u, propio:!!r.propio, porque:porque, razon:razonMeta };
  return c.sem[l];
}
function rsPorqueTxt(sn){
  if(!sn) return "";
  var n = sn.u==="min" ? horasTxt(sn.meta) : sn.meta;
  if(sn.porque==="sube") return tr("Subimos a")+" "+n+": "+tr("la última vez lo sacaste sobrado.");
  if(sn.porque==="baja") return tr("Bajamos a")+" "+n+" "+tr("para retomar el ritmo.");
  if(sn.razon && metaPorK(sn.razon)) return tr("Elegido por tu objetivo")+": "+metaPorK(sn.razon).e+" "+tr(metaPorK(sn.razon).t);
  return "";
}
function pintaRetoSemanaExtra(){
  var box=document.getElementById("reto-semana"); if(!box) return;
  var l=lunesDe(today()), sn=S.rsem&&S.rsem.sem&&S.rsem.sem[l], t=rsPorqueTxt(sn);
  var p=box.querySelector(".rs-porque");
  if(t){ if(!p){ p=document.createElement("p"); p.className="rs-porque"; var tt=box.querySelector(".rs-t"); if(tt) tt.parentNode.insertBefore(p, tt.nextSibling); } if(p.textContent!==t) p.textContent=t; }
  else if(p) p.remove();
  /* tu reto y el del grupo, juntos pero distintos */
  var g=box.querySelector(".rs-grupo");
  if(typeof GRUPO!=="undefined" && GRUPO && GRUPO.reto && GRUPO.reto.txt){
    var tot=retoTotal(), obj=GRUPO.reto.objetivo;
    var html='<span class="rs-g-ico">'+ico("grupo")+'</span><span class="rs-g-t">'+tr("Tu grupo")+': '+esc(GRUPO.reto.txt)+'</span><b class="num">'+tot+'/'+obj+'</b>';
    if(!g){ g=document.createElement("button"); g.className="rs-grupo"; g.setAttribute("data-jump","social"); box.appendChild(g); }
    if(g.innerHTML!==html) g.innerHTML=html;
  } else if(g) g.remove();
}
/* el resumen del domingo dice qué te propusiste y cómo te fue */
var _abrirSemanaBc=abrirSemana;
abrirSemana=function(l){
  var r=_abrirSemanaBc.apply(this, arguments);
  var capa=document.getElementById("semana-capa"); if(!capa) return r;
  var s=retoSemana(l), n=0, k=0;
  for(var w=0; w<4; w++){ var lw=addDays(l,-7*w); if(lw<lunesDe(primerDia())) break; k++; if(retoSemana(lw).hecho) n++; }
  var val = s.r.u==="min" ? horasTxt(s.v)+" "+tr("de")+" "+horasTxt(s.r.meta) : s.v+" "+tr("de")+" "+s.r.meta;
  var t = tr("Te propusiste")+": "+s.r.t+". "+(s.hecho ? tr("Lo conseguiste.") : tr("Te quedaste en")+" "+val+".")+
          (k>=2 ? " "+tr("Van")+" "+n+" "+tr("de las últimas")+" "+k+" "+tr("semanas.") : "");
  var lista=capa.querySelectorAll(".soc-lista"); var ult=lista[lista.length-1];
  if(ult && !capa.querySelector(".sm-rs")) ult.insertAdjacentHTML("afterend", '<p class="sm-rs">'+esc(t)+'</p>');
  return r;
};

/* ════════════ Tu evolución: ¿estás cambiando? ════════════ */
var CAMBIO_DEF=[
  { k:"sueno", l:"Sueño", f:function(d){ var v=vHab(d).sleep; return v>0?v:null; }, fmt:function(v){ return num1(v)+" h"; }, mas:true, thr:0.5,
    frase:function(d){ return (d>0?"duermes ":"duermes ")+horasTxt(Math.round(Math.abs(d)*60))+(d>0?" más":" menos"); } },
  { k:"pantalla", l:"Pantalla", f:function(d){ var v=vHab(d).screen; return (v!=null&&v>0)?v:null; }, fmt:function(v){ return num1(v)+" h"; }, mas:false, thr:0.75,
    frase:function(d){ return "pasas "+horasTxt(Math.round(Math.abs(d)*60))+(d>0?" más":" menos")+" con la pantalla"; } },
  { k:"ejercicio", l:"Ejercicio", sem:true, f:function(d){ return wentGym(d)?1:0; }, fmt:function(v){ return num1(v)+" "+tr("días/sem"); }, mas:true, thr:1,
    frase:function(d){ var n=Math.round(Math.abs(d)*10)/10; return "haces ejercicio "+num1(n)+(n===1?" día":" días")+(d>0?" más":" menos")+" a la semana"; } },
  { k:"habitos", l:"Hábitos", f:function(d){ var n=idealDe(d).length; return n?checksOf(d).length/n:null; }, fmt:function(v){ return Math.round(v*100)+" %"; }, mas:true, thr:0.1,
    frase:function(d){ return "cumples "+Math.round(Math.abs(d)*100)+" puntos"+(d>0?" más":" menos")+" de tus hábitos"; } },
  { k:"retos", l:"Retos", f:function(d){ return (S.chPick&&S.chPick[d]&&S.chPick[d].length)?chOf(d).length:null; }, fmt:function(v){ return num1(v)+" "+tr("al día"); }, mas:true, thr:0.5,
    frase:function(d){ return "haces "+num1(Math.abs(d))+(d>0?" retos más":" retos menos")+" al día"; } },
  { k:"animo", l:"Ánimo", f:function(d){ var a=animoDe(d); return a&&a.v?a.v:null; }, fmt:function(v){ return ANIMOS[Math.max(0,Math.min(4,Math.round(v)-1))]+" "+num1(v); }, mas:true, thr:0.4,
    frase:function(d){ return "tu ánimo está "+num1(Math.abs(d))+" puntos"+(d>0?" más alto":" más bajo"); } }
];
function cambioDatos(){
  var hoy=today(), p0=primerDia(), dias=diff(p0,hoy);
  if(dias<28) return { faltan:28-dias };
  var ahora=rangoDias(1,14), antes, lab;
  if(dias>=42){ antes=rangoDias(29,42); lab="Hace un mes"; }
  else { antes=[]; for(var i=0;i<14;i++) antes.push(addDays(p0,i)); lab="Al empezar"; }
  var filas=[];
  CAMBIO_DEF.forEach(function(D){
    var a=mediaVal(antes,D.f), b=mediaVal(ahora,D.f);
    if(D.sem){ var sa=antes.filter(function(d){ return D.f(d); }).length, sb=ahora.filter(function(d){ return D.f(d); }).length; if(!sa && !sb) return; a={ m:sa/antes.length*7, n:antes.length }; b={ m:sb/ahora.length*7, n:ahora.length }; }
    if(a.n<5 || b.n<5) return;
    var dif=b.m-a.m, bueno = D.mas ? dif>0 : dif<0;
    filas.push({ D:D, a:a.m, b:b.m, dif:dif, bueno:bueno, peso:Math.abs(dif)/D.thr });
  });
  var top=null; filas.forEach(function(f){ if(f.peso>=1 && (!top || f.peso>top.peso)) top=f; });
  return { lab:lab, filas:filas, top:top, dias:dias };
}
function cambioHTML(){
  var c=cambioDatos(), h='<div class="cb"><p class="cb-t">¿Estás cambiando?</p>';
  if(c.faltan) return h+'<p class="cb-vacio">En '+c.faltan+(c.faltan===1?" día":" días")+' podrás comparar cómo estás ahora con cómo empezaste.</p></div>';
  if(!c.filas.length) return h+'<p class="cb-vacio">Aún no hay datos suficientes para comparar. Apunta el sueño, la pantalla o el ánimo unos días y aparecerá aquí.</p></div>';
  h+='<div class="cb-tabla"><span></span><span class="cb-col">'+tr(c.lab)+'</span><span class="cb-col">'+tr("Ahora")+'</span><span></span>';
  c.filas.forEach(function(f){
    var flecha = f.peso<0.5 ? '<i class="cb-igual">=</i>' : '<i class="'+(f.bueno?"cb-bien":"cb-mal")+'">'+(f.dif>0?"▲":"▼")+'</i>';
    h+='<span class="cb-l">'+tr(f.D.l)+'</span><span class="cb-v num">'+f.D.fmt(f.a)+'</span><span class="cb-v num ahora">'+f.D.fmt(f.b)+'</span>'+flecha;
  });
  h+='</div>';
  var que = c.lab==="Hace un mes" ? "que hace un mes" : "que al empezar";
  if(c.top) h+='<p class="cb-frase'+(c.top.bueno?"":" malo")+'">'+(c.top.bueno?"Tu mayor cambio este mes: ":"Lo que más ha cambiado: ")+'<b>'+c.top.D.frase(c.top.dif)+" "+que+'.</b></p>';
  else h+='<p class="cb-frase">Todo bastante estable. Mantener también cuenta.</p>';
  return h+'<p class="cb-nota">Últimas dos semanas contra '+(c.lab==="Hace un mes"?"dos semanas de hace un mes":"tus dos primeras semanas")+'. Solo sale lo que tiene datos suficientes.</p></div>';
}

/* ════════════ experimentos: una pregunta sobre ti durante 7 días ════════════ */
function expPct(v){ return Math.round(v*100)+" %"; }
var EXP_MET={
  retos:  { l:"retos hechos", f:function(d){ return (S.chPick&&S.chPick[d]&&S.chPick[d].length)?chOf(d).length:null; }, fmt:num1, rel:0.15, abs:0.3, mas:"más retos hechos", menos:"menos retos hechos" },
  habitos:{ l:"de tus hábitos", f:null, fmt:expPct, abs:0.1, mas:"más hábitos cumplidos", menos:"menos hábitos cumplidos" },
  animo:  { l:"de ánimo (1 a 5)", f:function(d){ var a=animoDe(d); return a&&a.v?a.v:null; }, fmt:num1, abs:0.4, mas:"mejor ánimo", menos:"peor ánimo" },
  estudio:{ l:"min de estudio", f:function(d){ return estudioMinDia(d); }, fmt:function(v){ return String(Math.round(v)); }, rel:0.2, abs:10, mas:"más estudio", menos:"menos estudio" }
};
var EXPS=[
  { k:"sueno", ik:"dormir", e:"😴", t:"¿Dormir 7 h o más cambia tus días?", si:"con 7 h o más", no:"con menos de 7 h", falta:"Apunta cuánto has dormido para que hoy cuente",
    c:function(d){ var s=vHab(d).sleep; return s>0 ? s>=7 : null; }, met:["retos","habitos","animo"] },
  { k:"pantalla", ik:"pantalla", e:"📵", t:"¿Menos de 2 h de pantalla cambia tus días?", si:"con menos de 2 h de pantalla", no:"con 2 h o más", falta:"Apunta tu tiempo de pantalla para que hoy cuente",
    c:function(d){ var s=vHab(d).screen; return (s!=null&&s>0) ? s<2 : null; }, met:["estudio","retos","animo"] },
  { k:"ejercicio", ik:"moverme", e:"🏃", t:"¿Hacer ejercicio cambia tu ánimo?", si:"con ejercicio", no:"sin ejercicio", falta:"Si hoy haces ejercicio, márcalo en Vital",
    c:function(d){ return wentGym(d) ? true : (d<today() ? false : null); }, met:["animo","habitos","retos"] },
  { k:"parte", ik:"dormir", e:"🌙", t:"¿Hacer el Parte del día cambia cómo empiezas el siguiente?", si:"después de hacer el Parte", no:"sin Parte la noche anterior", falta:"",
    c:function(d){ return !!(S.parte && S.parte[addDays(d,-1)]); }, met:["retos","habitos","animo"] },
  { k:"agua", ik:"agua", e:"💧", t:"¿Beber suficiente agua cambia tus días?", si:"bien hidratado", no:"sin marcar el agua", falta:"Marca el agua en Vital para que hoy cuente",
    c:function(d){ var s=vHab(d).water; return s>0 ? s>=8 : null; }, met:["habitos","animo","retos"] },
  { k:"habito", ik:"habito", e:"✅", t:"¿Qué pasa los días que cumples un hábito?", si:"en que lo cumples", no:"en que no", falta:"Márcalo en tus hábitos si lo haces",
    c:null, met:["retos","animo","habitos"] }
];
function expDef(k){ for(var i=0;i<EXPS.length;i++) if(EXPS[i].k===k) return EXPS[i]; return EXPS[0]; }
function expCfg(){ if(!S.exp) S.exp={ act:null, hist:[] }; if(!S.exp.hist) S.exp.hist=[]; return S.exp; }
function expActivo(){ return (S.exp && S.exp.act) || null; }
function expTitulo(a){
  if(a.k==="habito"){ var x=habPorId(a.hid); return tr("¿Qué pasa los días que cumples")+" «"+(x?x.text:"…")+"»?"; }
  return tr(expDef(a.k).t);
}
function expCond(a, d){
  if(a.k==="habito"){ var ck=(S.checks&&S.checks[d])||[]; return ck.indexOf(a.hid)>=0 ? true : (d<today() ? false : null); }
  return expDef(a.k).c(d);
}
function expMetF(a, m){
  if(m==="habitos") return function(d){ var l=idealDe(d).filter(function(x){ return x.id!==a.hid; }); if(!l.length) return null; var ck=checksOf(d); return l.filter(function(x){ return ck.indexOf(x.id)>=0; }).length/l.length; };
  return EXP_MET[m].f;
}
function expPuntos(a){
  var h='';
  for(var i=0;i<7;i++){ var d=addDays(a.ini,i), c = d<=today() ? expCond(a,d) : undefined;
    h+='<i class="'+(c===true?"si":c===false?"no":d>today()?"luego":"nada")+(d===today()?" hoy":"")+'"></i>'; }
  return h;
}
function expResultado(a){
  var E=expDef(a.k), fin=addDays(a.ini,6), dias=[]; for(var i=0;i<7;i++) dias.push(addDays(a.ini,i));
  var A=dias.filter(function(d){ return expCond(a,d)===true; }), B=dias.filter(function(d){ return expCond(a,d)===false; }), ref="exp";
  if(A.length>=3 && B.length<3){
    var ant=[]; for(var j=1;j<=14;j++){ var d=addDays(a.ini,-j); if(d>=primerDia() && expCond(a,d)===false) ant.push(d); }
    if(ant.length>=3){ B=ant; ref="antes"; }
  }
  var res={ A:A.length, B:B.length, ref:ref, filas:[], difs:[], insuf:false };
  if(A.length<3 || B.length<3){ res.insuf=true; return res; }
  E.met.forEach(function(m){
    var M=EXP_MET[m], f=expMetF(a,m), ma=mediaVal(A,f), mb=mediaVal(B,f);
    if(ma.n<3 || mb.n<3) return;
    var dif=ma.m-mb.m, nota=Math.abs(dif)>=M.abs && (!M.rel || (mb.m>0 && Math.abs(dif)/mb.m>=M.rel) || mb.m===0);
    res.filas.push({ m:m, a:ma.m, b:mb.m });
    if(nota) res.difs.push({ m:m, dif:dif, a:ma.m, b:mb.m });
  });
  if(!res.filas.length) res.insuf=true;
  return res;
}
function expConclusion(a, res){
  var E=expDef(a.k), si = a.k==="habito" ? tr("en que cumples")+" «"+((habPorId(a.hid)||{}).text||"")+"»" : tr(E.si);
  if(res.insuf) return tr("Todavía no hay suficientes datos para sacar una conclusión. Hacen falta al menos 3 días de cada tipo con datos.");
  if(!res.difs.length) return tr("Durante este experimento no se ve una diferencia clara entre tus días")+" "+si+" "+tr("y los demás. También es un resultado.");
  var partes=res.difs.map(function(x){ var M=EXP_MET[x.m]; return tr(x.dif>0?M.mas:M.menos)+" ("+M.fmt(x.a)+" "+tr("frente a")+" "+M.fmt(x.b)+")"; });
  var lista = partes.length===1 ? partes[0] : partes.slice(0,-1).join(", ")+" "+tr("y")+" "+partes[partes.length-1];
  return tr("Durante este experimento, tus días")+" "+si+" "+tr("coincidieron con")+" "+lista+".";
}
function expEmpieza(k, hid){
  var c=expCfg();
  if(c.act){ avisoNube("Ya tienes un experimento en marcha."); return; }
  c.act={ k:k, hid:hid||null, ini:today() };
  save(); closeSheet(); render();
  sonido("pop"); avisoNube("Experimento en marcha: 7 días. Peak lo sigue solo con lo que ya apuntas.");
  if(document.getElementById("hist-capa")) try{ abrirHistorial(); }catch(e){}
}
function expCancela(){ var c=expCfg(); c.act=null; save(); closeSheet(); render(); avisoNube("Experimento cancelado."); }
function expVigila(){
  var c=expCfg(), a=c.act; if(!a) return;
  if(today()<=addDays(a.ini,6)) return;
  var res=expResultado(a), id="e"+a.ini+a.k;
  c.hist.unshift({ id:id, k:a.k, hid:a.hid, ini:a.ini, t:expTitulo(a), e:a.k==="habito"?"✅":expDef(a.k).e, res:res, txt:expConclusion(a,res) });
  c.hist=c.hist.slice(0,20); c.act=null; S.expNuevo=id; save();
}
function expMuestraNuevo(){
  if(!S.expNuevo || document.getElementById("onb") || (typeof tourLive!=="undefined" && tourLive) || !$("#sheet").hidden) return;
  var id=S.expNuevo; S.expNuevo=null; save();
  setTimeout(function(){ expVerResultado(id); }, 600);
}
function expFilasHTML(h){
  var a={ k:h.k, hid:h.hid }, E=expDef(h.k), si=h.k==="habito"?"Días que lo cumples":cap(E.si), no=h.k==="habito"?"Días que no":cap(E.no);
  if(h.res.ref==="antes") no+=" "+tr("(dos semanas antes)");
  var t='<div class="ex-tabla"><span></span><span class="ex-col">'+esc(tr(si))+' <em class="num">'+h.res.A+'</em></span><span class="ex-col">'+esc(tr(no))+' <em class="num">'+h.res.B+'</em></span>';
  h.res.filas.forEach(function(f){ var M=EXP_MET[f.m]; t+='<span class="ex-l">'+tr(M.l)+'</span><span class="num">'+M.fmt(f.a)+'</span><span class="num">'+M.fmt(f.b)+'</span>'; });
  return t+'</div>';
}
function expVerResultado(id){
  var h=null; expCfg().hist.forEach(function(x){ if(x.id===id) h=x; }); if(!h) return;
  openSheet('<div class="flex items-start justify-between mb-2"><div><p class="eyebrow mb-1.5">Experimento terminado</p><h3 class="display text-[20px] font-bold leading-tight">'+esc(expTitulo({k:h.k,hid:h.hid}))+'</h3></div>'+closeBtn()+'</div>'+
    '<p class="text-[12.5px] t3 mb-4">7 días de datos · del '+esc(fmt(h.ini,{day:"numeric",month:"long"}))+' al '+esc(fmt(addDays(h.ini,6),{day:"numeric",month:"long"}))+'</p>'+
    (h.res.insuf ? '' : expFilasHTML(h))+
    '<p class="ex-concl">'+esc(expConclusion({k:h.k,hid:h.hid}, h.res))+'</p>'+
    '<p class="text-[11.5px] t3 mt-3 leading-relaxed">Son pocos días: esto habla de coincidencias en tus datos, no de causas. Se queda guardado en Tu evolución.</p>'+
    '<div class="flex gap-2 mt-5"><button class="btn btn-quiet flex-1" data-act="x-exp-otra" data-k="'+h.k+'"'+(h.hid?' data-h="'+h.hid+'"':'')+'>Repetirlo</button><button class="btn btn-primary flex-1" data-act="close-sheet">Entendido</button></div>');
  sonido("semana");
}
function expVer(){
  var a=expActivo(); if(!a) return;
  var E=expDef(a.k), n=Math.min(7, diff(a.ini,today())+1), si=a.k==="habito"?"en que lo cumples":E.si, no=a.k==="habito"?"en que no":E.no;
  openSheet('<div class="flex items-start justify-between mb-2"><div><p class="eyebrow mb-1.5">Experimento · día '+n+' de 7</p><h3 class="display text-[20px] font-bold leading-tight">'+esc(expTitulo(a))+'</h3></div>'+closeBtn()+'</div>'+
    '<div class="ex-puntos grande">'+expPuntos(a)+'</div>'+
    '<p class="text-[13px] t2 leading-relaxed mt-4">Peak compara tus días '+esc(tr(si))+' con los días '+esc(tr(no))+', usando lo que ya apuntas: retos, hábitos, ánimo'+(E.met.indexOf("estudio")>=0?" y estudio":"")+'. No tienes que registrar nada nuevo.</p>'+
    (E.falta?'<p class="text-[12.5px] t3 mt-3">'+esc(tr(E.falta))+'.</p>':'')+
    '<p class="text-[12px] t3 mt-3">El '+esc(fmt(addDays(a.ini,7),{weekday:"long",day:"numeric"}))+' tendrás el resultado.</p>'+
    '<button class="btn btn-quiet w-full mt-5" data-act="x-exp-cancela">Cancelar el experimento</button>');
}
function expCatalogo(conHab){
  var act=expActivo();
  var lista=EXPS.filter(function(E){ return E.k!=="habito"; }).map(function(E){
    return '<button class="ex-op" data-act="x-exp-empieza" data-k="'+E.k+'"><span>'+ico(E.ik)+'</span><b>'+esc(E.t)+'</b></button>'; }).join("");
  var habs=idealTodos();
  var hab = conHab ? habs.map(function(x){ return '<button class="ex-op sub" data-act="x-exp-empieza" data-k="habito" data-h="'+x.id+'"><span>'+ico("habito")+'</span><b>'+esc(x.text)+'</b></button>'; }).join("")
                   : (habs.length?'<button class="ex-op" data-act="x-exp-habs"><span>'+ico("habito")+'</span><b>¿Qué pasa los días que cumples uno de tus hábitos?</b></button>':'');
  openSheet('<div class="flex items-start justify-between mb-2"><div><p class="eyebrow mb-1.5">Experimentos</p><h3 class="display text-[20px] font-bold">Una pregunta sobre ti</h3></div>'+closeBtn()+'</div>'+
    '<p class="text-[12.5px] t3 mb-4 leading-relaxed">Durante 7 días Peak sigue lo que ya apuntas y al final compara. Sin registrar nada nuevo.</p>'+
    (act?'<p class="ex-aviso">Ya tienes uno en marcha. Cuando termine podrás empezar otro.</p>':'')+
    '<div class="ex-lista">'+(conHab?hab:lista+hab)+'</div>');
}
function expBloqueHTML(){
  var c=expCfg(), a=c.act, h='<div class="ex-bloque"><div class="soc-sec"><h2 class="display">Experimentos</h2></div>';
  if(a){
    var n=Math.min(7, diff(a.ini,today())+1);
    h+='<button class="ex-activo" data-act="x-exp-ver"><span class="ex-ico">'+ico("exp")+'</span><span class="ex-t"><small>Día '+n+' de 7</small><b>'+esc(expTitulo(a))+'</b><span class="ex-puntos">'+expPuntos(a)+'</span></span></button>';
  } else h+='<button class="ex-nuevo" data-act="x-exp-catalogo"><span class="ex-ico">'+ico("exp")+'</span><span class="ex-t"><b>Haz un experimento</b><small>Una pregunta sobre ti durante 7 días. Peak lo sigue solo.</small></span></button>';
  if(c.hist.length) h+='<div class="ex-hist">'+c.hist.slice(0,6).map(function(x){
    return '<button class="ex-h" data-act="x-exp-res" data-id="'+x.id+'"><span class="ex-hico">'+ico(expDef(x.k).ik)+'</span><span class="ex-h-t"><b>'+esc(expTitulo({k:x.k,hid:x.hid}))+'</b><small>'+esc(expConclusion({k:x.k,hid:x.hid}, x.res))+'</small></span></button>'; }).join("")+'</div>';
  return h+'</div>';
}
/* Tu evolución: cambio arriba, lo aprendido con algo que probar, y experimentos */
var _abrirHistorialBc=abrirHistorial;
abrirHistorial=function(){
  var r=_abrirHistorialBc.apply(this, arguments);
  var capa=document.getElementById("hist-capa"); if(!capa) return r;
  var hero=capa.querySelector(".ev-hero");
  if(hero){
    var mapa=hero.querySelector(".ev-mapa.grande"), ley=hero.querySelector(".ev-leyenda");
    if(ley) ley.remove();
    if(mapa){ mapa.insertAdjacentHTML("afterend", cambioHTML()); mapa.remove(); }
  }
  var desc=capa.querySelector(".ev-desc");
  if(desc){
    var l=descubrimientos(), act=expActivo();
    var h='<div class="soc-sec"><h2 class="display">Lo que hemos aprendido de ti</h2></div><p class="ev-d-nota">Coincidencias en tus datos de los dos últimos meses. No son causas: son pistas.</p>';
    if(l.length) h+=l.map(function(x){ return '<div class="ev-d"><span class="ev-dico">'+ico(x.ik)+'</span><div><p>'+esc(x.t)+'</p>'+(x.exp&&!act?'<button class="ev-probar" data-act="x-exp-empieza" data-k="'+x.exp+'">¿Lo pruebas esta semana?</button>':'')+'</div></div>'; }).join("");
    else h+='<p class="ev-d-vacio">Con una o dos semanas de datos (sueño, ejercicio, ánimo…) empezarás a ver qué te funciona.</p>';
    desc.innerHTML=h;
    desc.insertAdjacentHTML("beforebegin", expBloqueHTML());
  }
  return r;
};


/* ════════════ metas del mes: pocas, grandes, con su propio peso ════════════ */
function pintaMetas(){
  var izq=document.getElementById("retos-left"); if(!izq) return;
  var box=document.getElementById("metas-mes");
  if(!box){ box=document.createElement("div"); box.id="metas-mes";
    var rs=document.getElementById("reto-semana"); if(rs && rs.nextSibling) izq.insertBefore(box, rs.nextSibling); else izq.appendChild(box); }
  box.className="glass importante rounded-[24px] pad mm";
  var hoy=today(), mk=mesDe(hoy), ms=metasMes(mk);
  var d0=new Date(mk+"-01T12:00:00"), total=new Date(d0.getFullYear(), d0.getMonth()+1, 0).getDate(), dia=+hoy.slice(8,10), quedan=total-dia;
  var nombreMes=cap(d0.toLocaleDateString(LOCALE,{month:"long"}));
  var h='<div class="mm-cab"><div><p class="eyebrow">Objetivos del mes</p><h2 class="display mm-mes">'+esc(nombreMes)+'</h2></div>'+
    '<div class="mm-quedan"><b class="num">'+quedan+'</b><span>'+(quedan===1?"día restante":"días restantes")+'</span></div></div>'+
    '<div class="mm-tiempo"><i style="width:'+Math.round(dia/total*100)+'%"></i></div>';
  ms.forEach(function(m){
    var v=metaValor(m,mk), ok=v>=m.obj, tipo=METAS_TIPOS.filter(function(x){ return x.k===m.tipo; })[0]||METAS_TIPOS[0];
    var p = m.tipo==="hecha" ? (ok?1:0) : Math.min(1, v/Math.max(1,m.obj)), R=21, C=2*Math.PI*R;
    var ritmo="";
    if(ok) ritmo='<b class="mm-ok">'+tr("Conseguida")+' · +'+META_XP+' XP</b>';
    else if(m.tipo==="hecha") ritmo=tr("Márcala cuando la cumplas");
    else { var esperado=m.obj*dia/total, falta=m.obj-v;
      ritmo='<span class="num">'+v+' '+tr("de")+' '+m.obj+(tipo.u?" "+tr(tipo.u):"")+'</span> · '+(v>=esperado?'<span class="mm-bien">'+tr("vas a buen ritmo")+'</span>':'<span class="mm-atras">'+tr("te faltan")+' '+falta+'</span>'); }
    h+='<div class="mm-meta'+(ok?" ok":"")+'">'+
      '<div class="mm-anillo"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="'+R+'" class="mm-pista"/><circle cx="26" cy="26" r="'+R+'" class="mm-arco" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+(C*(1-p)).toFixed(1)+'"/></svg>'+
        (ok?'<span class="mm-in">'+ICON_CHECK+'</span>':'<span class="mm-in num">'+(m.tipo==="hecha"?"":Math.round(p*100)+"%")+'</span>')+'</div>'+
      '<div class="mm-cuerpo"><button class="mm-t" data-act="x-meta-editar" data-id="'+m.id+'">'+esc(m.t)+'</button><p class="mm-sub">'+ritmo+'</p></div>'+
      (m.tipo==="hecha"?'<button class="mt-check'+(ok?" on":"")+'" data-act="x-meta-hecha" data-id="'+m.id+'" aria-label="Marcar como hecha">'+ICON_CHECK+'</button>':'')+
      (m.tipo==="manual"&&!ok?'<span class="mt-mas"><button data-act="x-meta-d" data-id="'+m.id+'" data-d="-1" aria-label="Quitar uno">−</button><button data-act="x-meta-d" data-id="'+m.id+'" data-d="1" aria-label="Sumar uno">+</button></span>':'')+
    '</div>';
  });
  if(!ms.length) h+='<button class="mm-nueva grande" data-act="x-meta-nueva"><span class="mm-plus">'+ico("meta")+'</span><span><b>'+tr("Una meta grande para")+' '+esc(nombreMes.toLowerCase())+'</b><small>'+tr("Algo que quieras haber conseguido al acabar el mes.")+' +'+META_XP+' XP</small></span></button>';
  else if(ms.length<3) h+='<button class="mm-nueva" data-act="x-meta-nueva">+ '+tr("Añadir otra meta")+'</button>';
  box.innerHTML=h;
}

/* ════════════ experimentos, a la vista en Objetivos ════════════ */
function expSugeridos(){
  var out=[], metas=misMetas(), porMeta={ dormir:"sueno", movil:"pantalla", moverme:"ejercicio", comer:"agua", estudiar:"pantalla", calma:"ejercicio", orden:"parte" };
  descubrimientos().forEach(function(d){ if(d.exp && out.indexOf(d.exp)<0) out.push(d.exp); });
  metas.forEach(function(k){ var e=porMeta[k]; if(e && out.indexOf(e)<0) out.push(e); });
  ["sueno","ejercicio","parte","pantalla","agua"].forEach(function(k){ if(out.indexOf(k)<0) out.push(k); });
  return out.slice(0,3);
}
function pintaExpObjetivos(){
  var obj=document.getElementById("rt-obj"); if(!obj) return;
  var el=document.getElementById("rt-exp");
  if(!el){ el=document.createElement("div"); el.id="rt-exp"; el.className="glass importante rounded-[24px] pad"; }
  var mm=document.getElementById("metas-mes");
  if(mm && mm.parentNode===obj){ if(mm.nextSibling!==el) obj.insertBefore(el, mm.nextSibling); } else if(el.parentNode!==obj) obj.appendChild(el);
  var a=expActivo(), c=expCfg();
  var h='<div class="rx-cab"><span class="rx-ico">'+ico("exp")+'</span><div><h2 class="display">'+tr("Experimentos")+'</h2><p>'+tr("Una pregunta sobre ti durante 7 días. Peak lo sigue solo.")+'</p></div></div>';
  if(a){
    var n=Math.min(7, diff(a.ini,today())+1);
    h+='<button class="rx-activo" data-act="x-exp-ver"><small>'+tr("Día")+' '+n+' '+tr("de")+' 7</small><b>'+esc(expTitulo(a))+'</b><span class="ex-puntos">'+expPuntos(a)+'</span></button>';
  } else {
    h+='<div class="rx-lista">'+expSugeridos().map(function(k){ var E=expDef(k); return '<button class="rx-op" data-act="x-exp-empieza" data-k="'+k+'"><span>'+ico(E.ik)+'</span><b>'+esc(tr(E.t))+'</b><em>'+tr("Empezar")+'</em></button>'; }).join("")+'</div>'+
       '<button class="rx-mas" data-act="x-exp-catalogo">'+tr("Ver todos los experimentos")+'</button>';
  }
  if(c.hist.length){ var x=c.hist[0];
    h+='<button class="rx-ult" data-act="x-exp-res" data-id="'+x.id+'"><small>'+tr("Último resultado")+'</small><b>'+esc(expTitulo({k:x.k,hid:x.hid}))+'</b><span>'+esc(expConclusion({k:x.k,hid:x.hid}, x.res))+'</span></button>'; }
  el.innerHTML=h;
}

/* ════════════ tus objetivos, en Ajustes → Tú ════════════ */
var _sheetSettingsBc=sheetSettings;
sheetSettings=function(){
  _sheetSettingsBc.apply(this, arguments);
  var tu=document.getElementById("aj-tu"); if(!tu || document.getElementById("aj-metas")) return;
  var ks=misMetas(), b=document.createElement("button"); b.id="aj-metas"; b.className="aj-priv"; b.setAttribute("data-act","x-metas");
  b.innerHTML='<span class="aj-m-ico">'+ico("meta")+'</span><span class="aj-priv-t"><b>'+tr("Tus objetivos")+'</b><small>'+(ks.length?esc(metasTexto(ks)):tr("Elige qué quieres mejorar"))+'</small></span>'+ico("flecha");
  tu.appendChild(b);
};

