/* ════════════════════════════════════════════════════════════════
   RUMBO: la gran revisión. Vocabulario claro (hábitos, retos, objetivos,
   grupo), Retos partido en Objetivos y Progreso, anillos que se explican,
   Vital con tendencias, ajustes por secciones, cuatro preguntas al empezar,
   descubrimientos, diario, tarjeta semanal, descansos planificados,
   instalación guiada y copia automática.
   ════════════════════════════════════════════════════════════════ */

/* hacer el Parte del día también cuenta como día activo */
var _activeDayBase=activeDay;
activeDay=function(d){ if(S.parte && S.parte[d]) return true; return _activeDayBase(d); };

/* ════════════ Vital ════════════ */
/* rVital se llama también desde botones sueltos (agua, sueño…): se completa
   siempre aquí para que nada cambie de altura y la página no salte */
var _rVitalBase=rVital;
rVital=function(){
  var y=window.scrollY;
  _rVitalBase.apply(this, arguments);
  try{ pintaComidas(); }catch(e){}
  try{ vitalSemana(); }catch(e){}
  try{ vitalTendencias(); }catch(e){}
  try{ vitalDeportes(); }catch(e){}
  try{ if(typeof vitalVacios==="function") vitalVacios(); }catch(e){}
  if(Math.abs(window.scrollY-y)>2) window.scrollTo(0,y);
};
/* la semana del gimnasio, de lunes a domingo como en el resto de la app */
function vitalSemana(){
  var box=document.getElementById("gym-days"); if(!box) return;
  var t=curDay(), hoy=today(), l=lunesDe(hoy), h="", wk=0;
  for(var i=0;i<7;i++){
    var d=addDays(l,i), on=wentGym(d), fut=d>hoy; if(on) wk++;
    h+='<button class="vs-dia'+(on?" on":"")+(d===t?" sel":"")+(fut?" fut":"")+(descansoDe(d)?" desc":"")+'" data-act="day-go" data-d="'+d+'"'+(fut?' disabled':'')+'>'+
      '<i></i><span>'+L10N.sem[i]+'</span></button>';
  }
  box.innerHTML=h; box.className="vs-semana";
  var w=document.getElementById("gym-week"); if(w) w.textContent=wk===1?"1 día":wk+" días";
}
/* comidas: una fila de círculos, sin ocupar media pantalla */
function pintaComidas(){
  var box=document.getElementById("meals-list"); if(!box) return;
  var t=curDay(), mm=mealsOf(t);
  box.innerHTML='<div class="cm2">'+[0,1,2,3,4].map(function(i){
    var k=MEAL_KEYS[i], on=!!(mm[k]||"").trim(), main=MEAL_MAIN.indexOf(i)>=0;
    return '<button class="cm2-b cmd'+(on?" on":"")+(main?"":" extra")+'" data-act="x-comida" data-k="'+k+'" data-day="'+t+'">'+
      '<i>'+ICON_CHECK+'</i><span>'+esc(S.mealNames[i]||"")+'</span></button>';
  }).join("")+'</div>';
  var sub=box.parentNode && box.parentNode.querySelector("p.t3"); if(sub) sub.textContent="Toca lo que ya has comido";
}
/* tendencia de 7 días debajo de cada medidor */
var VT_DEF={ water:{ id:"water-val", meta:8, max:12, u:"vasos", bien:function(v){ return v>=8; } },
             sleep:{ id:"sleep-val", meta:7, max:10, u:"h", bien:function(v){ return v>=7; } },
             screen:{ id:"screen-val", meta:2, max:6, u:"h", bien:function(v){ return v<2; } } };
function vitalTendencias(){
  var hoy=today();
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
    box.innerHTML='<div class="vt-barras">'+barras+'</div><span class="vt-t num">'+txt+'</span>';
  });
}

/* ════════════ Resumen ════════════ */
/* los anillos se explican al tocarlos */
var anilloAbierto=null, anilloAnima=false;
function anilloDetalle(){
  if(!anilloAbierto) return '<div id="hy-detalle" class="hy-det cerrado"></div>';
  var t=today(), h='';
  if(anilloAbierto==="retos"){
    var tc=todaysChallenges(t).length, md=chOf(t).length;
    h='<p class="hy-det-t">Se llena con los tres retos de hoy: llevas '+md+' de '+tc+'. Si haces los tres, todo el XP del día vale ×1,5.</p>'+
      '<button class="hy-det-ir" data-jump="retos">Ir a '+esc((S.labels&&S.labels.retos)||"Objetivos")+'</button>';
  } else if(anilloAbierto==="habitos"){
    var ck=checksOf(t), it=ordenIdeal(idealActivos());
    h='<p class="hy-det-t">Se llena con tus hábitos de cada día: '+ck.length+' de '+it.length+' hechos. Cada uno da +4 XP (cuentan hasta 10 al día). Se marcan en la lista de abajo.</p>'+
      '<button class="hy-det-ir" data-act="x-ir-habitos">Ir a los hábitos</button>';
  } else {
    h='<p class="hy-det-t">Se llena con cuatro cosas del cuerpo: hacer ejercicio, beber suficiente agua, dormir 7 horas y estar menos de 2 horas con la pantalla. Llevas '+saludHoy(t)+' de 4.</p>'+
      '<button class="hy-det-ir" data-jump="vital">Ir a '+esc((S.labels&&S.labels.vital)||"Vital")+'</button>';
  }
  return '<div id="hy-detalle" class="hy-det k-'+anilloAbierto+(anilloAnima?" entra":"")+'">'+h+'</div>';
}
function anilloToca(k){
  var antes=document.getElementById("hy-detalle"), hAntes=antes?antes.offsetHeight:0;
  anilloAbierto = (anilloAbierto===k) ? null : k; anilloAnima=true;
  sonido("tick"); render(); anilloAnima=false;
  var d=document.getElementById("hy-detalle"); if(!d) return;
  var hNueva=d.scrollHeight;
  if(!anilloAbierto){ hNueva=0; }
  d.style.height=hAntes+"px"; d.style.overflow="hidden"; void d.offsetHeight;
  d.style.transition="height .42s cubic-bezier(.3,.9,.3,1)"; d.style.height=hNueva+"px";
  setTimeout(function(){ d.style.height=""; d.style.overflow=""; d.style.transition=""; }, 460);
  document.querySelectorAll(".hy-anillo").forEach(function(a){ a.classList.toggle("abierto", a.dataset.k===anilloAbierto); });
}

/* (guardada, no se usa: la tarjeta de estudiar vuelve a ser la de antes) */
function tarjetaEstudioConBoton(){
  var a=S.estudio && S.estudio.actual, hoy=today(), min=estudioMinDia(hoy);
  var semana=0, l=lunesDe(hoy); for(var i=0;i<7;i++){ var d=addDays(l,i); if(d<=hoy) semana+=estudioMinDia(d); }
  var marcas=""; for(var k=0;k<24;k++){ marcas+='<line x1="50" y1="8" x2="50" y2="'+(k%6===0?16:13)+'" transform="rotate('+(k*15)+' 50 50)"/>'; }
  if(a){
    var rest=Math.max(0, a.fin ? a.fin-Date.now() : (a.resto||0)), mm=Math.floor(rest/60000), ss=Math.floor(rest%60000/1000);
    var fase=a.fase==="descanso"?"Descanso":a.fase==="listo"?"Bloque terminado":(a.fin?"Concentración":"En pausa");
    return '<button class="hy-tarjeta hy-estudio activo" data-act="x-hoy-estudio">'+
      '<div class="hy-dial"><svg viewBox="0 0 100 100">'+marcas+'</svg><b class="num" id="hy-est-t">'+(a.fase==="listo"?"✓":(mm<10?"0":"")+mm+":"+(ss<10?"0":"")+ss)+'</b></div>'+
      '<p class="hy-t">'+esc(fase)+'</p><p class="hy-s">'+esc(a.nombre)+'</p>'+
      '<span class="hy-boton">Volver</span></button>';
  }
  return '<div class="hy-tarjeta hy-estudio" data-act="x-estudiar" role="button" tabindex="0">'+
    '<div class="hy-dial"><svg viewBox="0 0 100 100">'+marcas+'</svg><span class="hy-dial-ico">'+ICO_RELOJ+'</span></div>'+
    '<p class="hy-t">Estudiar</p><p class="hy-s">'+(min?horasTxt(min)+" hoy":"Aún nada hoy")+(semana?" · "+horasTxt(semana)+" esta semana":"")+'</p>'+
    '<button class="hy-pomo" data-act="x-pomo-ya"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l10.5-6.5z"/></svg>Iniciar pomodoro</button>'+
  '</div>';
}
function pomodoroYa(){
  estSel.est=25; estSel.desc=5;
  if(estSel.sid===null){ var subs=(!academicoOff() && S.subjects) ? S.subjects : []; estSel.sid = subs.length ? subs[0].id : ""; }
  if(estSel.sid==="" && !estSel.nombre) estSel.nombre="Concentración";
  estudioEmpieza(); sonido("inicio");
}

/* la barra de hábitos no sale hasta que marcas el primero */
function habitosBarra(){
  var bar=document.getElementById("ideal-bar"); if(!bar) return;
  var p=bar.parentNode, n=checksOf(today()).length;
  if(p) p.classList.toggle("rb-oculta", n===0);
}

/* ════════════ Retos: lo de hoy arriba; debajo, Objetivos y Progreso ════════════ */
var retosTab="obj";
function retosOrganiza(){
  var izq=document.getElementById("retos-left"); if(!izq) return;
  var tc=document.getElementById("today-challenges"), hoyCard=tc && tc.closest(".glass"); if(!hoyCard) return;
  if(izq.firstElementChild!==hoyCard) izq.insertBefore(hoyCard, izq.firstElementChild);
  /* el calendario, como icono en la cabecera de los retos */
  if(!hoyCard.querySelector(".rt-cal")){
    var mis=hoyCard.querySelector('[data-act="edit-challenges"]');
    if(mis){ var w=document.createElement("div"); w.className="rt-cab-der"; mis.parentNode.insertBefore(w, mis); w.appendChild(mis);
      w.insertAdjacentHTML("afterbegin",'<label class="daybar-cal rt-cal" aria-label="Elegir día"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg><input type="date" data-act="day-pick" max="'+today()+'"></label>'); }
  }
  var cal=hoyCard.querySelector(".rt-cal input"); if(cal){ cal.value=curDay(); cal.max=today(); }
  var tabs=document.getElementById("rt-tabs");
  if(!tabs){ tabs=document.createElement("div"); tabs.id="rt-tabs"; tabs.className="rt-tabs"; }
  tabs.innerHTML='<button data-act="x-rt-tab" data-t="obj" class="'+(retosTab==="obj"?"on":"")+'">Objetivos</button>'+
    '<button data-act="x-rt-tab" data-t="prog" class="'+(retosTab==="prog"?"on":"")+'">Progreso</button><i class="rt-pill '+retosTab+'"></i>';
  if(tabs.previousElementSibling!==hoyCard) izq.insertBefore(tabs, hoyCard.nextSibling);
  var obj=document.getElementById("rt-obj"); if(!obj){ obj=document.createElement("div"); obj.id="rt-obj"; obj.className="rt-panel"; }
  var prog=document.getElementById("rt-prog"); if(!prog){ prog=document.createElement("div"); prog.id="rt-prog"; prog.className="rt-panel"; }
  if(obj.previousElementSibling!==tabs) izq.insertBefore(obj, tabs.nextSibling);
  if(prog.previousElementSibling!==obj) izq.insertBefore(prog, obj.nextSibling);
  ["reto-semana","metas-mes"].forEach(function(id){ var e=document.getElementById(id); if(e && e.parentNode!==obj) obj.appendChild(e); });
  pintaDescansos(obj);
  ["hist-boton","card-nivel","camino"].forEach(function(id){ var e=document.getElementById(id); if(e && e.parentNode!==prog) prog.appendChild(e); });
  pintaTarjetaDiario(prog);
  obj.hidden = retosTab!=="obj"; prog.hidden = retosTab!=="prog";
}
function retosCambiaTab(t){
  if(t===retosTab) return;
  retosTab=t; sonido("tick");
  var tabs=document.getElementById("rt-tabs");
  if(tabs){ tabs.querySelectorAll("button").forEach(function(b){ b.classList.toggle("on", b.dataset.t===t); });
    var pl=tabs.querySelector(".rt-pill"); if(pl) pl.className="rt-pill "+t; }
  var ver=document.getElementById(t==="obj"?"rt-obj":"rt-prog"), otro=document.getElementById(t==="obj"?"rt-prog":"rt-obj");
  if(otro) otro.hidden=true;
  if(ver){ ver.hidden=false; ver.classList.remove("rt-entra"); void ver.offsetWidth; ver.classList.add("rt-entra"); }
  if(t==="prog" && typeof caminoAnima==="function"){ try{ var cm=document.querySelector("#camino .cm-scroll"), yo=document.querySelector("#camino .cm-parada.yo"); if(cm&&yo) cm.scrollLeft=Math.max(0, yo.offsetLeft-60); }catch(e){} }
}

/* descansos planificados: un día libre avisado no rompe la racha ni gasta comodín */
function pintaDescansos(dentro){
  var box=document.getElementById("rt-desc");
  if(!box){ box=document.createElement("div"); box.id="rt-desc"; box.className="glass rounded-[24px] pad"; }
  if(box.parentNode!==dentro) dentro.appendChild(box);
  var hoy=today(), usados=descansosDelMes(hoy), h="";
  for(var i=0;i<10;i++){
    var d=addDays(hoy,i), on=descansoDe(d), dt=new Date(d+"T00:00:00");
    h+='<button class="ds-d'+(on?" on":"")+(i===0?" hoy":"")+'" data-act="x-desc" data-d="'+d+'">'+
      '<span>'+(i===0?"hoy":L10N.sem[(dt.getDay()+6)%7])+'</span><b class="num">'+dt.getDate()+'</b></button>';
  }
  box.innerHTML='<div class="mt-cab"><div><h2 class="display text-[17px] font-bold">Días de descanso</h2>'+
    '<p class="text-[12.5px] t3 mt-0.5">Avisa con tiempo: ese día cuenta para la racha sin gastar comodín · '+usados+' de '+DESCANSOS_MES+' este mes</p></div></div>'+
    '<div class="ds-fila">'+h+'</div>';
}
function descansoToca(d){
  if(!S.descanso) S.descanso={};
  if(S.descanso[d]){ delete S.descanso[d]; sonido("des"); }
  else {
    if(descansosDelMes(d)>=DESCANSOS_MES){ avisoNube("Ya tienes los "+DESCANSOS_MES+" descansos de ese mes."); return; }
    if(d===today() && activeDay(d) && !descansoDe(d)){ /* hoy ya cuenta: no hace falta */ }
    S.descanso[d]=1; sonido("pop");
  }
  save(); render();
}

/* los logros viven ahora en tu perfil */
var _abrirPerfilBase=abrirPerfil;
abrirPerfil=function(u){
  _abrirPerfilBase(u);
  var propio=(!u || (typeof GRUPO!=="undefined" && GRUPO && u===GRUPO.yo));
  if(!propio) return;
  var sc=document.querySelector("#perfil-capa .pf-scroll"); if(!sc) return;
  var st=stats(), hechos=MEDALS.filter(function(m){ return m.f(st); }).length;
  var h='<div class="soc-sec"><h2 class="display">Logros</h2><span class="t3" style="font-size:12.5px">'+hechos+' de '+MEDALS.length+'</span></div><div class="pf-logros">'+
    MEDALS.map(function(m){ var on=m.f(st);
      return '<div class="pf-lg'+(on?" on":"")+'"><span class="pf-lg-i">'+(on?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="5"/><path d="M8.5 13.5L7 21l5-2.5L17 21l-1.5-7.5"/></svg>':ICON_LOCK)+'</span>'+
        '<div><b>'+esc(m.n)+'</b><span>'+esc(m.d)+'</span>'+(!on&&typeof medProg==="function"?medProg(m,st):'')+'</div>'+
        (on&&m.xp?'<em>+'+m.xp+'</em>':'')+'</div>'; }).join("")+'</div>';
  var ref=sc.querySelector(".pf-medallas");
  var secs=sc.querySelectorAll(".soc-sec"), antes=null;
  secs.forEach(function(s){ if(/Lo que desbloqueas/.test(s.textContent)) antes=s; });
  if(ref){ var t=ref.previousElementSibling; if(t && t.classList.contains("soc-sec")) t.remove(); ref.remove(); }
  if(antes) antes.insertAdjacentHTML("beforebegin", h); else sc.insertAdjacentHTML("beforeend", h);
};

/* ════════════ Social ════════════ */
/* la racha del grupo aguanta si cumple el 80% */
function rachaGrupo(){
  if(!GRUPO || !GRUPO.racha) return null;
  var hoy=today(), yoCerrado=!!(S.parte && S.parte[hoy]);
  var cerr=GRUPO.racha.cerrados.slice();
  if(yoCerrado && cerr.indexOf(GRUPO.yo)<0) cerr.push(GRUPO.yo);
  var faltan=GRUPO.miembros.filter(function(m){ return cerr.indexOf(m.usuario)<0; });
  var n=GRUPO.miembros.length, need=Math.max(1, Math.ceil(n*0.8));
  var todos=cerr.length>=need, base=GRUPO.racha.dias;
  return { dias: base+(todos?1:0), base:base, mejor:Math.max(GRUPO.racha.mejor||0, base+(todos?1:0)),
           cerrados:cerr, faltan:faltan, todos:todos, yoCerrado:yoCerrado, need:need };
}
/* menos piezas: la clasificación pasa a la pantalla del grupo */
function pintaSocial(c){
  socEstilo();
  c.className = "lg:col-span-7 min-w-0 soc";
  var h = socYo();
  if(GRUPO) h += socGrupo() + socRachaGrupo() + socReto() + socMuro();
  else h += socSinGrupo();
  h += '<div style="height:18px"></div>';
  c.innerHTML = h;
  socMini();
}
var _abrirGrupoBase=abrirGrupo;
abrirGrupo=function(){
  _abrirGrupoBase.apply(this, arguments);
  var capa=document.getElementById("grupo-capa"); if(!capa) return;
  var bt=capa.querySelector(".gr-compartir");
  if(bt && typeof socRanking==="function" && !capa.querySelector(".rk")) bt.insertAdjacentHTML("afterend", '<div class="soc-sec"><h2 class="display">Esta semana</h2></div>'+socRanking());
};

/* ════════════ Académico: solo + y ··· ════════════ */
function acadMenu(){
  var A=agenda();
  openSheet('<div class="flex items-start justify-between mb-5"><h3 class="display text-[19px] font-bold">Organización</h3>'+closeBtn()+'</div>'+
    '<p class="eyebrow mb-2">Tu semana</p>'+
    '<div class="seg w-full mb-5" style="display:grid;grid-template-columns:1fr 1fr">'+
      '<button data-act="x-acad-modo" data-m="clase"'+(A.modo==="clase"?' aria-pressed="true"':'')+'>Horario de clase</button>'+
      '<button data-act="x-acad-modo" data-m="libre"'+(A.modo==="libre"?' aria-pressed="true"':'')+'>Semana libre</button></div>'+
    '<div class="am-lista">'+
      '<button data-act="timetable"><span>Editar la semana</span><small>Horas, recreo y huecos</small></button>'+
      '<button data-act="school"><span>Mi centro</span><small>Nombre y enlaces que usas</small></button>'+
      '<button data-act="x-acad-pref"><span>Quitar Organización</span><small>La pestaña pasa a ser Tareas</small></button>'+
    '</div>');
}

/* ════════════ Ajustes por secciones, y todo se guarda solo ════════════ */
var AJ_SECCIONES=[
  { k:"tu",    t:"Tú",            s:"Cómo quieres que te salude",            ico:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>' },
  { k:"ver",   t:"Apariencia",    s:"Tema, color e idioma",              ico:'<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor"/>' },
  { k:"pref",  t:"Preferencias",  s:"Módulos, sonidos y accesibilidad",  ico:'<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>' },
  { k:"avisos",t:"Avisos",        s:"Por la mañana y por la noche",      ico:'<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>' },
  { k:"datos", t:"Tus datos",     s:"Copia de seguridad y borrar",       ico:'<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>' },
  { k:"cuenta",t:"Cuenta",        s:"Nube y sesión",                     ico:'<path d="M7 18a4.5 4.5 0 0 1-.5-9 6 6 0 0 1 11.5 1.5A3.8 3.8 0 0 1 17.5 18z"/>' },
  { k:"av",    t:"Avanzado",      s:"Nombres, servidor y pruebas",       ico:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>' }
];
var AJ_ANCLAS=[["Tu nombre","tu"],["Idioma","ver"],["Apariencia","ver"],["Color","ver"],["Preferencias","pref"],
  ["Avisos diarios","avisos"],["Copia de seguridad","datos"]];
var ajSeccion=null;
var _sheetSettingsBase=sheetSettings;
sheetSettings=function(){
  _sheetSettingsBase.apply(this, arguments);
  var body=document.getElementById("sheet-body"); if(!body) return;
  var hijos=[].slice.call(body.children), cab=hijos[0], actual=null, grupos={};
  AJ_SECCIONES.forEach(function(s){ grupos[s.k]=[]; });
  hijos.slice(1).forEach(function(n){
    var txt=(n.textContent||"").trim();
    if(n.classList.contains("eyebrow")){ AJ_ANCLAS.forEach(function(a){ if(txt.indexOf(a[0])===0) actual=a[1]; }); }
    if(n.tagName==="DETAILS"){ n.open=true; n.querySelector("summary") && (n.querySelector("summary").style.display="none"); grupos.av.push(n); return; }
    if(n.classList.contains("aj-cuenta")){ grupos.cuenta.push(n); return; }
    if(n.getAttribute("data-act")==="save-settings"){ n.remove(); return; }
    if(n.getAttribute("data-act")==="tour-open"){ grupos.pref.push(n); return; }
    if(n.getAttribute("data-act")==="reset"){ grupos.datos.push(n); return; }
    if(n.id==="av-servidor" || (n.querySelector && n.querySelector('[data-act="av-srv-ver"]'))){ grupos.av.unshift(n); return; }
    (grupos[actual||"tu"]).push(n);
  });
  /* la sección de pruebas de la cuenta, a Avanzado */
  var cu=grupos.cuenta[0];
  if(cu){ var eyes=cu.querySelectorAll(".eyebrow, p"); var mover=false, lista=[];
    [].slice.call(cu.children).forEach(function(c){ if(/^Pruebas/.test((c.textContent||"").trim()) && c.classList.contains("eyebrow")) mover=true; if(mover) lista.push(c); });
    if(lista.length){ var caja=document.createElement("div"); caja.className="mb-6"; lista.forEach(function(c){ caja.appendChild(c); }); grupos.av.push(caja); } }
  body.innerHTML=""; body.appendChild(cab);
  var menu=document.createElement("div"); menu.className="aj-menu"; menu.id="aj-menu";
  menu.innerHTML=AJ_SECCIONES.filter(function(s){ return grupos[s.k].length; }).map(function(s){
    return '<button class="aj-fila" data-act="x-aj-sec" data-k="'+s.k+'"><span class="aj-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+s.ico+'</svg></span>'+
      '<span class="aj-txt"><b>'+s.t+'</b><small>'+s.s+'</small></span><svg class="aj-fl" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></button>'; }).join("")+
    '<p class="aj-pie">Todo se guarda solo al cambiarlo.</p>';
  body.appendChild(menu);
  AJ_SECCIONES.forEach(function(s){
    if(!grupos[s.k].length) return;
    var p=document.createElement("div"); p.className="aj-pag"; p.id="aj-"+s.k; p.hidden=true;
    p.innerHTML='<button class="aj-atras" data-act="x-aj-sec" data-k=""><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>Ajustes</button><h4 class="display aj-h">'+s.t+'</h4>';
    grupos[s.k].forEach(function(n){ p.appendChild(n); });
    body.appendChild(p);
  });
  var t=cab.querySelector("h3"); if(t) t.id="aj-titulo";
  if(ajSeccion) ajMuestra(ajSeccion, true);
  /* guardado automático */
  body.addEventListener("input", ajGuardaPronto);
  body.addEventListener("change", ajGuardaPronto);
};
function ajMuestra(k, sinAnim){
  ajSeccion=k||null;
  var menu=document.getElementById("aj-menu"); if(!menu) return;
  document.querySelectorAll(".aj-pag").forEach(function(p){ p.hidden=true; p.classList.remove("aj-entra"); });
  var cab=document.getElementById("aj-titulo"); if(cab) cab.parentNode.parentNode.classList.toggle("aj-cab-oculta", !!k);
  if(!k){ menu.hidden=false; if(!sinAnim){ menu.classList.remove("aj-vuelve"); void menu.offsetWidth; menu.classList.add("aj-vuelve"); } }
  else { menu.hidden=true; var p=document.getElementById("aj-"+k); if(p){ p.hidden=false; if(!sinAnim){ void p.offsetWidth; p.classList.add("aj-entra"); } } }
  var sc=document.querySelector("#sheet .sheet-card"); if(sc) sc.scrollTop=0;
}
var ajTimer=null;
function ajGuardaPronto(ev){
  var id=ev && ev.target && ev.target.id; if(!id) return;
  if(!/^(st-|lb-|mn-|sn-|ss-|cat-|av-servidor)/.test(id)) return;
  clearTimeout(ajTimer); ajTimer=setTimeout(ajGuarda, 450);
}
function ajGuarda(){
  function v(id){ var e=document.getElementById(id); return e ? (e.value||"").trim() : null; }
  var cs=v("av-servidor"); if(cs!==null) S.avisos.servidor=cs;
  var nm=v("st-name"); if(nm!==null) S.profile.name=nm;
  var eb=v("st-ebau"); if(eb!==null) S.profile.ebau=eb;
  var ev=v("st-evento"); if(ev!==null) S.profile.evento=ev;
  var ap=v("lb-app"); if(ap!==null) S.labels.app=ap||"Peak.";
  var sb=v("lb-sub"); if(sb!==null) S.labels.sub=sb;
  ["resumen","retos","vital","academico","tareas"].forEach(function(k){ var x=v("lb-"+k); if(x) S.labels[k]=x; });
  S.cats.forEach(function(c){ var x=v("cat-"+c.id); if(x) c.name=x; });
  S.mealNames=S.mealNames.map(function(m,i){ var x=v("mn-"+i); return x||m; });
  S.subjects.forEach(function(s){ var a=v("sn-"+s.id), b=v("ss-"+s.id); if(a) s.name=a; if(b) s.short=b.toUpperCase(); });
  save(); render();
}

/* ════════════ tutorial: el aviso de modo prueba espera a que acabe ════════════ */
function avisoTrasTour(t){
  var n=0;
  (function mira(){
    n++;
    var hayOnb=document.getElementById("onb"), hayTour=(typeof tourLive!=="undefined" && tourLive);
    if((hayOnb || hayTour || !S.tour) && n<400){ setTimeout(mira, 800); return; }
    setTimeout(function(){ avisoNube(t); }, 500);
  })();
}

/* ════════════ cuatro preguntas antes del tutorial ════════════ */
var ONB_METAS=[
  { k:"dormir",  t:"Dormir mejor",       e:"😴", tag:"personal",
    h:["Móvil fuera 30 minutos antes de dormir","En la cama antes de las 23:30","Levantarme a la primera"],
    r:["Hoy a la cama media hora antes","Nada de pantallas en la cama","Una siesta de 20 minutos, ni uno más"] },
  { k:"estudiar",t:"Estudiar más",       e:"📚", tag:"estudio",
    h:["Un bloque de estudio de 50 minutos","Repasar lo del día 15 minutos","Dejar preparado lo de mañana"],
    r:["Estudiar 50 minutos seguidos sin tocar el móvil","Explicarle a alguien lo que has estudiado","Hacer un esquema de un tema entero"] },
  { k:"moverme", t:"Moverme más",        e:"🏃", tag:"vital",
    h:["Entrenar o andar 30 minutos","10 minutos de estiramientos","Subir siempre por las escaleras"],
    r:["Un minuto de plancha","Llegar a 10.000 pasos","20 sentadillas antes de ducharte"] },
  { k:"movil",   t:"Usar menos el móvil",e:"📵", tag:"personal",
    h:["La primera hora del día sin móvil","El móvil fuera de la mesa al comer","Nada de redes después de las 22:00"],
    r:["Una hora entera con el móvil en otra habitación","Borrar una app que te roba tiempo","Nada de redes hasta el mediodía"] },
  { k:"comer",   t:"Comer mejor",        e:"🥗", tag:"vital",
    h:["Desayunar en condiciones","Una pieza de fruta","Cenar sin pantallas"],
    r:["Nada de bollería hoy","Cocinar algo tú de principio a fin","Beber solo agua en todo el día"] },
  { k:"orden",   t:"Organizarme",        e:"🗓️", tag:"personal",
    h:["Hacer la cama","Mirar el plan del día por la mañana","Ordenar 10 minutos antes de dormir"],
    r:["Planificar la semana 10 minutos","Vaciar las notificaciones y los mensajes pendientes","Tirar o regalar algo que no uses"] },
  { k:"calma",   t:"Estar más tranquilo",e:"🧘", tag:"personal",
    h:["5 minutos de respirar sin pantalla","Escribir 3 cosas buenas del día","Que te dé el sol 10 minutos"],
    r:["Diez minutos de paseo sin cascos","Escribir una página de diario","Llamar a alguien que te importe"] }
];
var ONB_PASOS=[
  { t:"¿Qué quieres mejorar?", s:"Elige hasta tres. Con esto te preparo los hábitos y los retos." },
  { t:"¿Estudias?", s:"Si estudias, se enciende Organización: horario, exámenes y temporizador." },
  { t:"¿Cuánto te quieres exigir?", s:"Siempre puedes añadir o quitar hábitos después." },
  { t:"¿Cuándo haces el Parte del día?", s:"Un minuto por la noche para repasar el día. Te aviso a esa hora si activas los avisos." }
];
var onb={ paso:0, metas:[], estudia:null, nivel:null, hora:null, fin:null };
function abrirPreguntas(fin){
  onb={ paso:0, metas:[], estudia:null, nivel:null, hora:null, fin:fin };
  var c=document.getElementById("onb");
  if(!c){ c=document.createElement("div"); c.id="onb"; document.body.appendChild(c); }
  onbPinta(true);
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ c.classList.add("ve"); }); });
}
function onbPinta(primera){
  var c=document.getElementById("onb"); if(!c) return;
  var p=ONB_PASOS[onb.paso], cuerpo="", listo=false;
  if(onb.paso===0){
    cuerpo='<div class="onb-grid">'+ONB_METAS.map(function(m){ var on=onb.metas.indexOf(m.k)>=0;
      return '<button class="onb-op'+(on?" on":"")+'" data-act="x-onb-meta" data-k="'+m.k+'"><span class="onb-e">'+m.e+'</span><span>'+m.t+'</span><i>'+ICON_CHECK+'</i></button>'; }).join("")+'</div>';
    listo=onb.metas.length>0;
  } else if(onb.paso===1){
    cuerpo='<div class="onb-lista">'+[["insti","Sí, en el instituto"],["uni","Sí, en la universidad"],["examen","Preparo un examen u oposición"],["no","No, ahora no estudio"]].map(function(o){
      return '<button class="onb-op fila'+(onb.estudia===o[0]?" on":"")+'" data-act="x-onb-uno" data-c="estudia" data-v="'+o[0]+'"><span>'+o[1]+'</span><i>'+ICON_CHECK+'</i></button>'; }).join("")+'</div>';
    listo=!!onb.estudia;
  } else if(onb.paso===2){
    cuerpo='<div class="onb-lista">'+[["3","Poco a poco","3 hábitos al día"],["5","Normal","5 hábitos al día"],["7","A tope","7 hábitos al día"]].map(function(o){
      return '<button class="onb-op fila'+(onb.nivel===o[0]?" on":"")+'" data-act="x-onb-uno" data-c="nivel" data-v="'+o[0]+'"><span><b>'+o[1]+'</b><small>'+o[2]+'</small></span><i>'+ICON_CHECK+'</i></button>'; }).join("")+'</div>';
    listo=!!onb.nivel;
  } else {
    cuerpo='<div class="onb-lista">'+[["21","A las 21:00"],["22","A las 22:00"],["23","A las 23:00"],["0","Sin hora fija"]].map(function(o){
      return '<button class="onb-op fila'+(onb.hora===o[0]?" on":"")+'" data-act="x-onb-uno" data-c="hora" data-v="'+o[0]+'"><span>'+o[1]+'</span><i>'+ICON_CHECK+'</i></button>'; }).join("")+'</div>';
    listo=!!onb.hora;
  }
  var pasos=""; for(var i=0;i<4;i++) pasos+='<i class="'+(i<=onb.paso?"on":"")+'"></i>';
  c.innerHTML='<div class="onb-top"><div class="onb-pasos">'+pasos+'</div><span class="num">'+(onb.paso+1)+'/4</span></div>'+
    '<div class="onb-cuerpo'+(primera?"":" onb-entra")+'"><h2 class="display">'+p.t+'</h2><p class="onb-s">'+p.s+'</p>'+cuerpo+'</div>'+
    '<div class="onb-pie">'+(onb.paso>0?'<button class="onb-sec" data-act="x-onb-atras">Atrás</button>':'<button class="onb-sec" data-act="x-onb-saltar">Saltar</button>')+
      '<button class="onb-main" data-act="x-onb-sig"'+(listo?'':' disabled')+'>'+(onb.paso<3?"Siguiente":"Empezar")+'</button></div>';
}
function onbAccion(a, el){
  if(a==="x-onb-meta"){
    var k=el.dataset.k, i=onb.metas.indexOf(k);
    if(i>=0) onb.metas.splice(i,1); else { if(onb.metas.length>=3){ avisoNube("Como mucho tres. Quita una para elegir otra."); return true; } onb.metas.push(k); }
    sonido("tick"); onbPinta(true); return true;
  }
  if(a==="x-onb-uno"){ onb[el.dataset.c]=el.dataset.v; sonido("tick"); onbPinta(true); return true; }
  if(a==="x-onb-atras"){ onb.paso=Math.max(0,onb.paso-1); onbPinta(); return true; }
  if(a==="x-onb-sig"){ if(onb.paso<3){ onb.paso++; onbPinta(); } else onbTermina(true); return true; }
  if(a==="x-onb-saltar"){ onbTermina(false); return true; }
  return false;
}
function onbTermina(aplicar){
  if(aplicar){
    var elegidas=ONB_METAS.filter(function(m){ return onb.metas.indexOf(m.k)>=0; });
    var cuantos=parseInt(onb.nivel,10)||5, habs=[], vistos={};
    for(var r=0; habs.length<cuantos && r<3; r++) elegidas.forEach(function(m){ if(habs.length<cuantos && m.h[r] && !vistos[m.h[r]]){ vistos[m.h[r]]=1; habs.push({ t:m.h[r], tag:m.tag }); } });
    /* si faltan, se completa con hábitos generales */
    ["Beber 8 vasos de agua","Hacer la cama","10 minutos de estiramientos","Leer 10 páginas"].forEach(function(t){ if(habs.length<cuantos && !vistos[t]){ vistos[t]=1; habs.push({ t:t, tag:"personal" }); } });
    var hoy=today();
    S.ideal=habs.map(function(x,i){ return { id:"h"+uid(), time:"", text:x.t, tag:x.tag, desde:hoy }; });
    var retos=[]; elegidas.forEach(function(m){ m.r.forEach(function(t){ retos.push(t); }); });
    var extra=defaultChallenges().map(function(c){ return c.text; });
    for(var j=0; retos.length<9 && j<extra.length; j++) if(retos.indexOf(extra[j])<0) retos.push(extra[j]);
    S.challenges=retos.map(function(t){ return { id:uid(), text:t }; });
    if(S.chPick) S.chPick={};
    var estudia=(onb.estudia && onb.estudia!=="no");
    try{ prefPon("academico", estudia); }catch(e){}
    var h=parseInt(onb.hora,10); if(h>=20 && h<=23){ S.avisos.hn=h; }
    S.onbMetas=onb.metas.slice();
  }
  S.onb=1; save();
  var c=document.getElementById("onb");
  if(c){ c.classList.remove("ve"); c.classList.add("sale"); setTimeout(function(){ if(c.parentNode) c.parentNode.removeChild(c); }, 420); }
  render();
  var f=onb.fin; onb.fin=null;
  setTimeout(function(){ if(f) f(); }, 450);
}

/* ════════════ descubrimientos: lo que dicen tus datos ════════════ */
function diasConDatos(n){
  var hoy=today(), a=[], p0=primerDia();
  for(var i=1;i<=n;i++){ var d=addDays(hoy,-i); if(d<p0) break; a.push(d); }
  return a;
}
function mediaDe(ds, f){ var s=0, c=0; ds.forEach(function(d){ var v=f(d); if(v!=null && !isNaN(v)){ s+=v; c++; } }); return c ? { m:s/c, n:c } : null; }
function descubrimientos(){
  var ds=diasConDatos(60), tmap=tasksByDay(), out=[];
  if(ds.length<7) return out;
  function hb(d){ return (S.habits&&S.habits[d])||{}; }
  function retos(d){ return chOf(d).length; }
  function animo(d){ var a=animoDe(d); return a&&a.v ? a.v : null; }
  function estudio(d){ return estudioMinDia(d); }
  function habs(d){ var n=idealDe(d).length; return n ? checksOf(d).length/n : null; }
  function compara(nombreSi, si, cual, f, formato){
    var A=ds.filter(si), B=ds.filter(function(d){ return !si(d); });
    if(A.length<3 || B.length<3) return;
    var a=mediaDe(A,f), b=mediaDe(B,f); if(!a || !b || a.n<3 || b.n<3) return;
    formato(a.m, b.m);
  }
  function pct(a,b){ return b>0 ? Math.round((a-b)/b*100) : null; }
  /* sueño → retos */
  compara("", function(d){ return (hb(d).sleep||0)>=7; }, "", retos, function(a,b){ var p=pct(a,b); if(p!=null && p>=15) out.push({ ico:"😴", peso:p, t:"Los días que duermes 7 h o más haces un "+p+" % más de retos." }); });
  /* gimnasio → ánimo */
  compara("", function(d){ return wentGym(d); }, "", animo, function(a,b){ var dif=Math.round((a-b)*10)/10; if(dif>=0.4) out.push({ ico:"💪", peso:dif*40, t:"Los días que haces ejercicio, tu ánimo sube "+String(dif).replace(".",L10N.dec)+" puntos de media." }); });
  /* pantalla → estudio */
  compara("", function(d){ var s=hb(d).screen; return s!=null && s>0 && s<2; }, "", estudio, function(a,b){ var p=pct(a,b); if(p!=null && p>=20) out.push({ ico:"📵", peso:p, t:"Con menos de 2 h de pantalla estudias un "+p+" % más." }); });
  /* agua → hábitos */
  compara("", function(d){ return (hb(d).water||0)>=8; }, "", habs, function(a,b){ var p=pct(a,b); if(p!=null && p>=15) out.push({ ico:"💧", peso:p, t:"Los días que bebes suficiente agua cumples un "+p+" % más de hábitos." }); });
  /* parte de la noche → retos del día siguiente */
  compara("", function(d){ return !!(S.parte && S.parte[addDays(d,-1)]); }, "", retos, function(a,b){ var p=pct(a,b); if(p!=null && p>=15) out.push({ ico:"🌙", peso:p, t:"Si haces el Parte del día, al día siguiente haces un "+p+" % más de retos." }); });
  /* sueño → ánimo */
  compara("", function(d){ return (hb(d).sleep||0)>=7; }, "", animo, function(a,b){ var dif=Math.round((a-b)*10)/10; if(dif>=0.4) out.push({ ico:"🛌", peso:dif*35, t:"Durmiendo 7 h o más, tu ánimo es "+String(dif).replace(".",L10N.dec)+" puntos mejor." }); });
  /* el mejor día de la semana */
  var porDia=[0,0,0,0,0,0,0], cuenta=[0,0,0,0,0,0,0];
  ds.forEach(function(d){ var w=(new Date(d+"T00:00:00").getDay()+6)%7; porDia[w]+=dayXP(d,tmap); cuenta[w]++; });
  var mejor=-1, mv=0, total=0, tn=0;
  for(var i=0;i<7;i++){ if(cuenta[i]>=2){ var m=porDia[i]/cuenta[i]; total+=m; tn++; if(m>mv){ mv=m; mejor=i; } } }
  if(mejor>=0 && tn>=5 && mv>total/tn*1.2) out.push({ ico:"📅", peso:20, t:"Tu mejor día de la semana es el "+L10N.dias[mejor].toLowerCase()+": "+Math.round(mv)+" XP de media." });
  out.sort(function(a,b){ return b.peso-a.peso; });
  return out;
}
function descubrimientoDelDia(){
  var l=descubrimientos(); if(!l.length) return null;
  return l[hashTxt(today())%l.length];
}
function pintaDescubrimiento(){
  var hoy=document.getElementById("hoy"); if(!hoy) return;
  var d=descubrimientoDelDia(), el=document.getElementById("hy-desc");
  if(!d){ if(el) el.remove(); return; }
  if(!el){ el=document.createElement("button"); el.id="hy-desc"; el.setAttribute("data-act","x-historial"); }
  var dos=hoy.querySelector(".hy-dos"); if(dos && el.previousElementSibling!==dos) dos.parentNode.insertBefore(el, dos.nextSibling);
  el.innerHTML='<span class="hd-ico">'+d.ico+'</span><span class="hd-txt"><small>Descubrimiento</small><b>'+esc(d.t)+'</b></span>';
}

/* ════════════ el diario: tus notas del Parte del día ════════════ */
function entradasDiario(){
  var a=[], vistos={};
  Object.keys(S.animo||{}).forEach(function(d){ var x=S.animo[d]; if(x && (x.v || (x.nota||"").trim())){ a.push(d); vistos[d]=1; } });
  Object.keys(S.parte||{}).forEach(function(d){ if(S.parte[d] && !vistos[d]) a.push(d); });
  a.sort(); a.reverse();
  return a;
}
var diarioBusca="";
var ANIMO_COL=["#e25c5c","#e89a4a","#c9b24a","#7cbf6b","#3fae8c"];
function abrirDiario(){
  var capa=document.getElementById("diario-capa");
  if(!capa){ capa=document.createElement("div"); capa.id="diario-capa"; document.body.appendChild(capa); }
  capa.innerHTML='<div class="pf-barra"><button class="pf-atras" data-act="x-diario-cerrar" aria-label="Volver">'+
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button><span>Tu diario</span></div>'+
    '<div class="pf-scroll" id="diario-scroll"></div>';
  diarioPinta();
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ capa.classList.add("ve"); }); });
  sonido("inicio");
}
function diarioPinta(){
  var sc=document.getElementById("diario-scroll"); if(!sc) return;
  var hoy=today(), anio=hoy.slice(0,4), ents=entradasDiario(), q=diarioBusca.trim().toLowerCase();
  /* el año en ánimos: un cuadrito por día, del color de cómo te fue */
  var d0=lunesDe(anio+"-01-01"), cols="";
  for(var w=0; w<53; w++){
    cols+='<span class="dy-col">';
    for(var i=0;i<7;i++){
      var d=addDays(d0, w*7+i);
      if(d.slice(0,4)!==anio){ cols+='<i class="fuera"></i>'; continue; }
      var a=animoDe(d), c = a&&a.v ? ANIMO_COL[a.v-1] : "";
      cols+='<i'+(c?' style="background:'+c+'"':'')+(d>hoy?' class="fut"':'')+(d===hoy?' class="hoy"':'')+'></i>';
    }
    cols+='</span>';
  }
  var conNota=ents.filter(function(d){ return (((S.animo||{})[d]||{}).nota||"").trim(); }).length;
  var h='<div class="dy-hero"><p class="eyebrow">'+anio+' en ánimos</p><h1 class="display">'+ents.length+' <span>'+(ents.length===1?"día escrito":"días apuntados")+'</span></h1>'+
    '<p class="ev-sub">'+(conNota? conNota+(conNota===1?" nota tuya":" notas tuyas")+". Cada noche, en el Parte del día, puedes dejar una línea." : "Cada noche, en el Parte del día, puedes dejar una línea sobre cómo te fue. Aquí se van guardando.")+'</p>'+
    '<div class="dy-anio">'+cols+'</div>'+
    '<div class="dy-ley">'+ANIMOS.map(function(e,i){ return '<span><i style="background:'+ANIMO_COL[i]+'"></i>'+e+'</span>'; }).join("")+'</div></div>'+
    '<div class="dy-busca"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>'+
      '<input id="dy-q" placeholder="Buscar en tus notas" value="'+esc(diarioBusca)+'" enterkeyhint="search"></div>';
  var lista=ents.filter(function(d){ if(!q) return true; var n=(((S.animo||{})[d]||{}).nota||"").toLowerCase(); return n.indexOf(q)>=0 || fmt(d,{day:"numeric",month:"long"}).toLowerCase().indexOf(q)>=0; });
  if(!lista.length) h+='<p class="dy-vacio">'+(q?"Nada con «"+esc(diarioBusca)+"».":"Todavía no hay nada. Esta noche, en el Parte del día, escribe una línea.")+'</p>';
  var mesActual="";
  lista.forEach(function(d){
    var mes=cap(new Date(d+"T12:00:00").toLocaleDateString(LOCALE,{month:"long",year:"numeric"}));
    if(mes!==mesActual){ mesActual=mes; h+='<p class="dy-mes">'+esc(mes)+'</p>'; }
    var a=(S.animo||{})[d]||{}, nota=(a.nota||"").trim(), tc=todaysChallenges(d).length, md=chOf(d).length;
    var notaH=esc(nota); if(q && nota){ var i=nota.toLowerCase().indexOf(q); if(i>=0) notaH=esc(nota.slice(0,i))+'<mark>'+esc(nota.slice(i,i+q.length))+'</mark>'+esc(nota.slice(i+q.length)); }
    h+='<button class="dy-e" data-act="x-diario-editar" data-d="'+d+'" style="--c:'+(a.v?ANIMO_COL[a.v-1]:"var(--fill-hi)")+'">'+
      '<span class="dy-fecha"><b class="num">'+new Date(d+"T12:00:00").getDate()+'</b><small>'+L10N.dias[(new Date(d+"T12:00:00").getDay()+6)%7].slice(0,3)+'</small></span>'+
      '<span class="dy-cuerpo">'+(nota?'<span class="dy-nota">'+notaH+'</span>':'<span class="dy-nota vacia">Sin nota</span>')+
        '<span class="dy-meta num">'+(a.v?ANIMOS[a.v-1]+" · ":"")+md+'/'+tc+' retos'+(wentGym(d)?" · ejercicio":"")+'</span></span></button>';
  });
  h+='<div style="height:40px"></div>';
  sc.innerHTML=h;
  var inp=document.getElementById("dy-q");
  if(inp){ inp.addEventListener("input", function(){ diarioBusca=inp.value; var pos=inp.selectionStart; diarioPinta(); var j=document.getElementById("dy-q"); if(j){ j.focus(); try{ j.setSelectionRange(pos,pos); }catch(e){} } }); }
}
function cerrarDiario(){
  var c=document.getElementById("diario-capa"); if(!c) return;
  c.classList.remove("ve"); setTimeout(function(){ if(c.parentNode && !c.classList.contains("ve")) c.parentNode.removeChild(c); }, 420);
}
var diarioDia=null;
function diarioEditar(d){
  diarioDia=d; var a=(S.animo&&S.animo[d])||{};
  openSheet('<div class="flex items-start justify-between mb-2"><h3 class="display text-[19px] font-bold">'+esc(cap(fmt(d,{weekday:"long",day:"numeric",month:"long"})))+'</h3>'+closeBtn()+'</div>'+
    '<p class="text-[12.5px] t3 mb-4">Cambia cómo te fue o lo que escribiste.</p>'+
    '<div class="pt-animo mb-4">'+ANIMOS.map(function(e,i){ return '<button class="'+(a.v===i+1?"on":"")+'" data-act="x-diario-animo" data-v="'+(i+1)+'">'+e+'</button>'; }).join("")+'</div>'+
    '<textarea id="dy-nota" class="field" rows="4" maxlength="400" placeholder="Una línea sobre ese día">'+esc(a.nota||"")+'</textarea>'+
    '<button class="btn btn-primary w-full !py-3.5 mt-4" data-act="x-diario-guardar">Guardar</button>');
}
function pintaTarjetaDiario(dentro){
  var b=document.getElementById("rt-diario");
  if(!b){ b=document.createElement("button"); b.id="rt-diario"; b.className="dy-tarjeta"; b.setAttribute("data-act","x-diario"); }
  if(b.parentNode!==dentro) dentro.appendChild(b);
  var ents=entradasDiario(), ult=null; for(var i=0;i<ents.length;i++){ if((((S.animo||{})[ents[i]]||{}).nota||"").trim()){ ult=ents[i]; break; } }
  b.innerHTML='<div class="ev-cab"><div><p class="eyebrow">Tu diario</p><p class="ev-titulo display">'+(ents.length?ents.length+(ents.length===1?" día apuntado":" días apuntados"):"Aún vacío")+'</p></div>'+
    '<svg class="ev-flecha" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></div>'+
    (ult ? '<p class="dy-ult">«'+esc(S.animo[ult].nota.trim())+'»<span>'+esc(cap(fmt(ult,{weekday:"long",day:"numeric"})))+'</span></p>'
         : '<p class="dy-ult vacio">Tus notas del Parte del día, con el color de cada día y un buscador.</p>');
}

/* Tu evolución: con descubrimientos, diario y compartir */
var _abrirHistorialBase=abrirHistorial;
abrirHistorial=function(){
  _abrirHistorialBase.apply(this, arguments);
  var hero=document.querySelector("#hist-capa .ev-hero"); if(!hero) return;
  var l=descubrimientos(), h='<div class="ev-desc"><div class="soc-sec"><h2 class="display">Descubrimientos</h2></div>';
  if(l.length) h+=l.map(function(x){ return '<div class="ev-d"><span>'+x.ico+'</span><p>'+esc(x.t)+'</p></div>'; }).join("");
  else h+='<p class="ev-d-vacio">Con una o dos semanas de datos (sueño, ejercicio, ánimo…) empezarás a ver qué te funciona.</p>';
  h+='</div><div class="ev-botones"><button class="ev-b" data-act="x-diario">Tu diario</button><button class="ev-b" data-act="x-semana-compartir" data-l="'+lunesDe(today())+'">Compartir mi semana</button></div>';
  hero.insertAdjacentHTML("afterend", h);
  var titulo=hero.querySelector("h1");
  var e=evoDatos(); if(titulo && e.activos===0) titulo.innerHTML='Hoy empieza <span>tu historia</span>';
};

/* ════════════ la tarjeta de la semana, para historias ════════════ */
function compartirSemana(l){
  var o=resumenSemana(l), cs=getComputedStyle(document.documentElement);
  function v(n,f){ var q=cs.getPropertyValue(n); return (q&&q.trim())||f; }
  var AC=v("--accent","#4f46e5"), VI=v("--violet","#7c5cd6"), GO=v("--good","#0f9d58");
  var W=1080, H=1920, cv=document.createElement("canvas"); cv.width=W; cv.height=H;
  var c=cv.getContext("2d"); if(!c) return;
  var F='"Plus Jakarta Sans", -apple-system, sans-serif', FI='Inter, -apple-system, sans-serif';
  var gr=c.createLinearGradient(0,0,W,H); gr.addColorStop(0,AC); gr.addColorStop(1,VI);
  c.fillStyle=gr; c.fillRect(0,0,W,H);
  /* brillo suave arriba */
  var rg=c.createRadialGradient(W*0.85,200,0,W*0.85,200,900); rg.addColorStop(0,"rgba(255,255,255,.28)"); rg.addColorStop(1,"rgba(255,255,255,0)");
  c.fillStyle=rg; c.fillRect(0,0,W,H);
  var M=96;
  c.fillStyle="rgba(255,255,255,.75)"; c.font="700 36px "+F; c.fillText(tr("MI SEMANA"), M, 190);
  c.fillStyle="#fff"; c.font="600 46px "+F; c.fillText(tr(rangoSemana(l)), M, 252);
  /* la cifra grande: días activos */
  c.font="800 300px "+F; c.fillText(String(o.activos), M-8, 590);
  var wn=c.measureText(String(o.activos)).width;
  c.font="800 90px "+F; c.fillStyle="rgba(255,255,255,.6)"; c.fillText("/7", M+wn, 590);
  c.fillStyle="#fff"; c.font="600 44px "+FI; c.fillText(tr("días activos"), M, 660);
  /* las barras de la semana */
  var bx=M, by=760, bw=W-2*M, bh=300, max=Math.max(1, Math.max.apply(null,o.porDia)), anchoB=(bw-6*26)/7;
  o.porDia.forEach(function(x,i){
    var hh=Math.max(14, Math.round(x/max*bh)), X=bx+i*(anchoB+26);
    c.fillStyle="rgba(255,255,255,.18)"; redondo(c, X, by, anchoB, bh, 22); c.fill();
    c.fillStyle= i===o.mejor && x>0 ? "#fff" : "rgba(255,255,255,.62)"; redondo(c, X, by+bh-hh, anchoB, hh, 22); c.fill();
    c.fillStyle="rgba(255,255,255,.8)"; c.font="700 34px "+FI; c.textAlign="center"; c.fillText(L10N.sem[i], X+anchoB/2, by+bh+56); c.textAlign="left";
  });
  /* cifras */
  var cifras=[[horasTxt(o.estMin)||"0 min",tr("de estudio")],[String(o.retos),tr("retos hechos")],[String(o.gym),tr("días de ejercicio")],[stats().streak+"",tr("días de racha")]];
  cifras.forEach(function(x,i){
    var cx=M+(i%2)*450, cy=1290+Math.floor(i/2)*190;
    c.fillStyle="#fff"; c.font="800 88px "+F; c.fillText(x[0], cx, cy);
    c.fillStyle="rgba(255,255,255,.75)"; c.font="600 36px "+FI; c.fillText(x[1], cx, cy+52);
  });
  /* ánimo y descubrimiento */
  var an=o.dias.map(function(d){ var a=animoDe(d); return a&&a.v?a.v:null; }).filter(function(x){ return x; });
  var yb=1700;
  var d=descubrimientoDelDia();
  if(d){ c.fillStyle="rgba(255,255,255,.16)"; redondo(c, M, yb-70, W-2*M, 130, 34); c.fill();
    c.fillStyle="#fff"; c.font="600 34px "+FI; envuelve(c, tr(d.t), M+36, yb-12, W-2*M-72, 44, 2); }
  else if(an.length){ var med=an.reduce(function(a,b){ return a+b; },0)/an.length; c.fillStyle="#fff"; c.font="600 40px "+FI; c.fillText(tr("Ánimo de la semana")+": "+ANIMOS[Math.round(med)-1], M, yb); }
  c.fillStyle="#fff"; c.font="800 50px "+F; c.fillText("Peak.", M, H-110);
  c.fillStyle="rgba(255,255,255,.7)"; c.font="500 32px "+FI; c.fillText(tr("hábitos, retos y tu Parte del día"), M, H-64);
  var texto=tr("Mi semana en Peak")+": "+o.activos+"/7 "+tr("días activos")+", "+(horasTxt(o.estMin)||"0 min")+" "+tr("de estudio")+".";
  cv.toBlob(function(b){
    var file=null; try{ if(b) file=new File([b], "mi-semana-peak.png", {type:"image/png"}); }catch(e){}
    if(file && navigator.canShare && navigator.canShare({ files:[file] }) && !enVisor()){ navigator.share({ files:[file], text:texto }).catch(function(){}); return; }
    /* si no se puede compartir directamente, se enseña para guardarla */
    var url=cv.toDataURL("image/png");
    openSheet('<div class="flex items-start justify-between mb-2"><h3 class="display text-[19px] font-bold">Tu semana</h3>'+closeBtn()+'</div>'+
      '<p class="text-[12.5px] t3 mb-4">Mantén pulsada la imagen para guardarla o compartirla.</p>'+
      '<img class="cs-img" src="'+url+'" alt="Tu semana en Peak">');
  }, "image/png");
}
function redondo(c,x,y,w,h,r){ r=Math.min(r,w/2,h/2); c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
function envuelve(c,t,x,y,w,lh,max){ var ps=t.split(" "), l="", n=0; for(var i=0;i<ps.length;i++){ var p=l?l+" "+ps[i]:ps[i]; if(c.measureText(p).width>w && l){ c.fillText(l,x,y+n*lh); n++; l=ps[i]; if(n>=max) return; } else l=p; } if(l && n<max) c.fillText(l,x,y+n*lh); }

/* ════════════ instalar en la pantalla de inicio ════════════ */
var instalarEvento=null;
window.addEventListener("beforeinstallprompt", function(e){ e.preventDefault(); instalarEvento=e; });
var INSTKEY="dtrack-instalar-luego";
function pintaInstalar(){
  var hoyBox=document.getElementById("hoy"); if(!hoyBox) return;
  var el=document.getElementById("hy-instalar");
  var luego=0; try{ luego=Number(localStorage.getItem(INSTKEY)||0); }catch(e){}
  var toca = !instalada() && !enVisor() && Date.now()>luego && S.tour;
  if(!toca){ if(el) el.remove(); return; }
  if(!el){ el=document.createElement("div"); el.id="hy-instalar"; hoyBox.parentNode.insertBefore(el, hoyBox); }
  el.innerHTML='<span class="hi-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M12 8v6M9 11l3 3 3-3"/></svg></span>'+
    '<span class="hi-txt"><b>Instala Peak</b><small>Así no se pierde nada de lo que apuntas.</small></span>'+
    '<button class="hi-si" data-act="x-instalar">Cómo</button><button class="hi-no" data-act="x-instalar-luego" aria-label="Más tarde">×</button>';
}
function instalarGuia(){
  if(instalarEvento){ instalarEvento.prompt(); instalarEvento.userChoice.then(function(){ instalarEvento=null; render(); }); return; }
  var ios=esIOS();
  openSheet('<div class="flex items-start justify-between mb-2"><h3 class="display text-[19px] font-bold">Instalar Peak</h3>'+closeBtn()+'</div>'+
    '<p class="text-[13px] t3 mb-5">Instalada, funciona como una app normal, puede avisarte y tus datos no se borran aunque pases días sin abrirla.</p>'+
    '<ol class="ig-pasos">'+(ios
      ? '<li><b>1</b><span>Abre esta página en <strong>Safari</strong>.</span></li>'+
        '<li><b>2</b><span>Toca <strong>Compartir</strong> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7.5 7.5 12 3l4.5 4.5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg> abajo.</span></li>'+
        '<li><b>3</b><span>Baja y elige <strong>Añadir a pantalla de inicio</strong>.</span></li>'
      : '<li><b>1</b><span>Abre el menú del navegador <strong>⋮</strong>.</span></li>'+
        '<li><b>2</b><span>Elige <strong>Instalar aplicación</strong> o <strong>Añadir a pantalla de inicio</strong>.</span></li>')+
    '</ol><button class="btn btn-primary w-full !py-3.5 mt-5" data-act="close-sheet">Entendido</button>');
}

/* ════════════ copia en la nube cada rato, si tienes cuenta ════════════
   Cada minuto, si hay algo nuevo sin subir (nubeSucia, en nube.js). */
setInterval(function(){
  try{
    if(typeof ses==="undefined" || !ses || ses.demo || document.hidden || !nubeSucia) return;
    subirDatos();
  }catch(e){}
}, 60*1000);

/* ════════════ acciones y pintado ════════════ */
function rumboAccion(a, el){
  if(onbAccion(a, el)) return true;
  if(rumboAccion2(a, el)) return true;
  if(typeof disenoAccion==="function" && disenoAccion(a, el)) return true;
  if(typeof bucleAccion==="function" && bucleAccion(a, el)) return true;
  if(typeof grupoAccion==="function" && grupoAccion(a, el)) return true;
  if(typeof lecturaAccion==="function" && lecturaAccion(a, el)) return true;
  if(typeof crecerAccion==="function" && crecerAccion(a, el)) return true;
  if(a==="x-anillo"){ anilloToca(el.dataset.k); return true; }
  if(a==="x-ir-habitos"){ var ci=document.getElementById("card-ideal"); if(ci) ci.scrollIntoView({behavior:"smooth", block:"start"}); return true; }
  if(a==="x-pomo-ya"){ pomodoroYa(); return true; }
  if(a==="x-rt-tab"){ retosCambiaTab(el.dataset.t); return true; }
  if(a==="x-desc"){ descansoToca(el.dataset.d); return true; }
  if(a==="x-acad-menu"){ acadMenu(); return true; }
  if(a==="x-acad-modo"){ var A=agenda(); A.modo=el.dataset.m; S.agenda=A; save(); render(); acadMenu(); return true; }
  if(a==="x-acad-pref"){ closeSheet(); prefPon("academico", false); render(); avisoNube("Organización está apagada. Se enciende en Ajustes, en Preferencias."); return true; }
  if(a==="x-aj-sec"){ ajMuestra(el.dataset.k||null); sonido("tick"); return true; }
  if(a==="x-diario"){ abrirDiario(); return true; }
  if(a==="x-diario-cerrar"){ cerrarDiario(); return true; }
  if(a==="x-diario-editar"){ diarioEditar(el.dataset.d); return true; }
  if(a==="x-diario-animo"){ if(!S.animo) S.animo={}; var dd=diarioDia; S.animo[dd]=S.animo[dd]||{}; S.animo[dd].v=+el.dataset.v; save();
    el.parentNode.querySelectorAll("button").forEach(function(b){ b.classList.toggle("on", b===el); }); sonido("tick"); return true; }
  if(a==="x-diario-guardar"){ if(!S.animo) S.animo={}; var d2=diarioDia, t=document.getElementById("dy-nota"); S.animo[d2]=S.animo[d2]||{}; S.animo[d2].nota=(t?t.value:"").slice(0,400); save(); closeSheet(); diarioPinta(); render(); return true; }
  if(a==="x-instalar"){ instalarGuia(); return true; }
  if(a==="x-instalar-luego"){ try{ localStorage.setItem(INSTKEY, String(Date.now()+3*86400000)); }catch(e){} var h=document.getElementById("hy-instalar"); if(h) h.remove(); return true; }
  return false;
}
function rumboTrasRender(){
  if(view==="resumen"){ habitosBarra(); pintaDescubrimiento(); pintaInstalar();
    document.querySelectorAll(".hy-anillo").forEach(function(a){ a.classList.toggle("abierto", a.dataset.k===anilloAbierto); }); }
  if(view==="retos") retosOrganiza();
  if(document.getElementById("diario-capa")) diarioPinta();
}

var RUMBO_CSS=[
/* Vital: semana, comidas, tendencias */
'.vs-semana{ display:grid; grid-template-columns:repeat(7,1fr); gap:7px; }',
'.vs-dia{ display:flex; flex-direction:column; align-items:center; gap:6px; }',
'.vs-dia i{ width:100%; height:44px; border-radius:11px; background:var(--fill-hi); display:block; transition:background .3s var(--ease); }',
'.vs-dia.on i{ background:var(--good); }',
'.vs-dia.desc i{ background:color-mix(in srgb,var(--warn) 30%,transparent); }',
'.vs-dia.fut i{ background:transparent; box-shadow:inset 0 0 0 1.5px var(--hairline); }',
'.vs-dia.sel i{ box-shadow:inset 0 0 0 2px var(--accent); }',
'.vs-dia span{ font-size:12px; color:var(--t3); }',
'.vs-dia.sel span{ color:var(--t1); font-weight:700; }',
'.cm2{ display:grid; grid-template-columns:repeat(5,1fr); gap:6px; }',
'.cm2-b.cmd, .cm2-b.cmd.extra{ height:auto; flex-direction:column; gap:7px; padding:10px 2px 9px; border-radius:16px; font-size:12px; background:none; box-shadow:none; }',
'.cm2-b.cmd i, .cm2-b.cmd.extra i{ width:40px; height:40px; background:var(--fill); box-shadow:inset 0 0 0 1.5px var(--hairline); }',
'.cm2-b.cmd i svg, .cm2-b.cmd.extra i svg{ width:16px; height:16px; }',
'.cm2-b.cmd.on{ background:none; box-shadow:none; }',
'.cm2-b.cmd span{ line-height:1.2; text-align:center; color:var(--t2); }',
'.cm2-b.cmd.on span{ color:var(--t1); font-weight:700; }',
'.vt{ display:flex; align-items:center; gap:12px; margin:10px 0 0 78px; }',
'.vt-barras{ display:grid; grid-template-columns:repeat(7,8px); gap:4px; height:26px; }',
'.vt-barras i{ position:relative; border-radius:3px; background:var(--fill); overflow:hidden; }',
'.vt-barras i u{ position:absolute; left:0; right:0; bottom:0; background:color-mix(in srgb,var(--t3) 55%,transparent); border-radius:3px; }',
'.vt-barras i.ok u{ background:var(--good); }',
'.vt-barras i.hoy{ box-shadow:0 0 0 1.5px var(--hairline); }',
'.vt-t{ font-size:12px; color:var(--t3); }',
/* Resumen: anillos que se abren */
'.hy-anillo{ transition:transform .3s var(--spring); }',
'.hy-anillo.abierto b{ color:var(--c); }',
'.hy-anillo.abierto svg{ transform:scale(1.05); transition:transform .35s var(--spring); }',
'.hy-det{ margin-top:14px; padding:14px 16px 10px; border-radius:20px; background:var(--fill); }',
'.hy-det.cerrado{ display:none; }',
'.hy-det.entra > *{ animation:hdEntra .4s var(--ease) both; }',
'.hy-det.entra > *:nth-child(2){ animation-delay:.04s; } .hy-det.entra > *:nth-child(3){ animation-delay:.08s; } .hy-det.entra > *:nth-child(4){ animation-delay:.12s; } .hy-det.entra > *:nth-child(5){ animation-delay:.16s; }',
'@keyframes hdEntra{ from{ opacity:0; transform:translateY(6px); } to{ opacity:1; transform:none; } }',
'.hy-det-t{ font-size:13px; color:var(--t2); line-height:1.45; margin-bottom:6px; }',
'.hy-det-f{ display:flex; align-items:center; gap:12px; padding:9px 0; }',
'.hy-det-f + .hy-det-f{ box-shadow:inset 0 1px 0 var(--hairline); }',
'.hy-det-x{ flex:1; min-width:0; text-align:left; font-size:14px; display:flex; justify-content:space-between; gap:8px; }',
'.hy-det-x b{ font-weight:600; } .hy-det-x em{ font-style:normal; color:var(--t3); font-size:13px; }',
'.hy-det-p{ width:18px; height:18px; flex:0 0 auto; border-radius:99px; box-shadow:inset 0 0 0 1.5px var(--hairline); position:relative; }',
'.hy-det-f.ok .hy-det-p{ background:var(--good); box-shadow:none; }',
'.hy-det-f.ok .hy-det-p::after{ content:""; position:absolute; left:6px; top:3px; width:5px; height:9px; border:solid #fff; border-width:0 2px 2px 0; transform:rotate(45deg); }',
'.hy-det-f.ok b{ color:var(--t2); }',
'.hy-det-ir{ display:block; width:100%; padding:10px 0 4px; font-size:14px; font-weight:700; color:var(--accent); text-align:left; }',
/* estudiar: botón de iniciar */
'.hy-estudio{ cursor:pointer; }',
'.hy-pomo{ margin-top:auto; display:inline-flex; align-items:center; justify-content:center; gap:7px; width:100%; height:42px; border-radius:99px; font-size:14px; font-weight:700;',
'  color:var(--on-accent); background:var(--accent); box-shadow:0 8px 18px -10px var(--accent); transition:transform .25s var(--spring); }',
'.hy-pomo:active{ transform:scale(.95); }',
'.hy-pomo svg{ width:14px; height:14px; }',
'.hy-estudio .hy-s{ margin-bottom:14px; }',
'.rb-oculta{ display:none!important; }',
/* descubrimiento en Resumen */
'#hy-desc{ display:flex; align-items:center; gap:14px; width:100%; margin-top:12px; padding:14px 16px; border-radius:20px; text-align:left;',
'  background:color-mix(in srgb,var(--gold) 10%,var(--bg)); box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--gold) 22%,transparent); }',
'.hd-ico{ font-size:24px; line-height:1; }',
'.hd-txt{ display:flex; flex-direction:column; gap:2px; }',
'.hd-txt small{ font-size:11.5px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; color:var(--gold); }',
'.hd-txt b{ font-size:14.5px; font-weight:600; line-height:1.4; }',
/* instalar */
'#hy-instalar{ display:flex; align-items:center; gap:12px; margin:0 0 18px; padding:12px 12px 12px 14px; border-radius:18px; background:var(--accent-soft); box-shadow:inset 0 0 0 1px var(--accent-line); }',
'.hi-ico{ width:36px; height:36px; border-radius:11px; display:grid; place-items:center; color:var(--on-accent); background:var(--accent); flex:0 0 auto; }',
'.hi-ico svg{ width:19px; height:19px; }',
'.hi-txt{ flex:1; min-width:0; display:flex; flex-direction:column; } .hi-txt b{ font-size:14.5px; } .hi-txt small{ font-size:12.5px; color:var(--t2); }',
'.hi-si{ font-size:14px; font-weight:700; color:var(--accent); padding:8px 6px; }',
'.hi-no{ width:30px; height:30px; font-size:20px; color:var(--t3); }',
'.ig-pasos{ display:flex; flex-direction:column; gap:14px; }',
'.ig-pasos li{ display:flex; gap:14px; align-items:center; font-size:15px; }',
'.ig-pasos li b{ width:30px; height:30px; flex:0 0 auto; border-radius:99px; display:grid; place-items:center; background:var(--accent); color:var(--on-accent); font-size:14px; }',
'.ig-pasos svg{ width:17px; height:17px; display:inline; vertical-align:-3px; }',
/* Retos: pestañas */
'#retos-daybar .daybar:not(.pasado){ display:none; }',
'#retos-daybar .daybar.pasado .daybar-fila{ display:none; }',
'#retos-daybar .daybar.pasado .daybar-aviso{ margin-top:0; margin-bottom:6px; }',
'.rt-cab-der{ display:flex; align-items:center; gap:10px; }',
'.rt-cal.daybar-cal{ width:36px; height:36px; }',
'.rt-cal svg{ width:17px; height:17px; }',
'.rt-tabs{ position:relative; display:grid; grid-template-columns:1fr 1fr; padding:4px; border-radius:16px; background:var(--fill); margin-top:8px; }',
'.rt-tabs button{ position:relative; z-index:1; height:40px; font-size:14.5px; font-weight:700; color:var(--t3); transition:color .3s var(--ease); }',
'.rt-tabs button.on{ color:var(--t1); }',
'.rt-pill{ position:absolute; top:4px; bottom:4px; left:4px; width:calc(50% - 4px); border-radius:12px; background:var(--glass-bg-hi); box-shadow:var(--shadow-1); transition:transform .45s var(--spring); }',
'html.dark .rt-pill{ background:rgba(255,255,255,.12); }',
'.rt-pill.prog{ transform:translateX(100%); }',
'.rt-panel{ display:flex; flex-direction:column; gap:16px; }',
'.rt-panel[hidden]{ display:none; }',
'.rt-panel.rt-entra > *{ animation:rtEntra .45s cubic-bezier(.2,.9,.3,1) both; }',
'.rt-panel.rt-entra > *:nth-child(2){ animation-delay:.05s; } .rt-panel.rt-entra > *:nth-child(3){ animation-delay:.1s; } .rt-panel.rt-entra > *:nth-child(4){ animation-delay:.15s; }',
'@keyframes rtEntra{ from{ opacity:0; transform:translateY(12px); } to{ opacity:1; transform:none; } }',
'#rt-prog #card-nivel{ margin-bottom:0!important; }',
'#rt-prog #camino{ margin:0; }',
'#v-retos .grid > div:has(#medals-wrap){ display:none!important; }',
/* descansos */
'.ds-fila{ display:grid; grid-template-columns:repeat(5,1fr); gap:7px; margin-top:14px; }',
'.ds-d{ height:58px; border-radius:14px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; background:var(--fill); transition:all .3s var(--spring); }',
'.ds-d span{ font-size:11.5px; color:var(--t3); font-weight:600; } .ds-d b{ font-size:17px; font-weight:800; }',
'.ds-d.hoy{ box-shadow:inset 0 0 0 1.5px var(--hairline); }',
'.ds-d.on{ background:color-mix(in srgb,var(--warn) 18%,transparent); box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--warn) 50%,transparent); }',
'.ds-d.on span, .ds-d.on b{ color:var(--warn); }',
'.ds-d:active{ transform:scale(.93); }',
/* logros en el perfil */
'.pf-logros{ display:flex; flex-direction:column; }',
'.pf-lg{ display:flex; align-items:center; gap:12px; padding:11px 0; }',
'.pf-lg + .pf-lg{ box-shadow:inset 0 1px 0 var(--hairline); }',
'.pf-lg-i{ width:34px; height:34px; flex:0 0 auto; border-radius:99px; display:grid; place-items:center; background:var(--fill-hi); color:var(--t3); }',
'.pf-lg-i svg{ width:16px; height:16px; }',
'.pf-lg.on .pf-lg-i{ background:linear-gradient(145deg,var(--gold),color-mix(in srgb,var(--gold) 60%,var(--warn))); color:#fff; }',
'.pf-lg > div{ flex:1; min-width:0; display:flex; flex-direction:column; }',
'.pf-lg b{ font-size:14px; font-weight:700; } .pf-lg:not(.on) b{ color:var(--t2); }',
'.pf-lg span:not(.pf-lg-i):not(.num):not(.md-barra){ font-size:12.5px; color:var(--t3); }',
'.pf-lg em{ font-style:normal; font-size:12px; font-weight:800; color:var(--gold); }',
/* académico */
'.ac-botones{ display:flex; gap:8px; }',
'.ac-bt{ width:44px; height:44px; border-radius:99px; display:grid; place-items:center; background:var(--fill); color:var(--t1); transition:transform .25s var(--spring); }',
'.ac-bt.mas{ background:var(--accent); color:var(--on-accent); box-shadow:0 8px 18px -10px var(--accent); }',
'.ac-bt svg{ width:20px; height:20px; } .ac-bt:active{ transform:scale(.92); }',
'.am-lista{ display:flex; flex-direction:column; }',
'.am-lista button{ display:flex; flex-direction:column; align-items:flex-start; padding:13px 0; text-align:left; }',
'.am-lista button + button{ box-shadow:inset 0 1px 0 var(--hairline); }',
'.am-lista span{ font-size:15px; font-weight:600; } .am-lista small{ font-size:12.5px; color:var(--t3); }',
/* ajustes */
'.aj-menu{ display:flex; flex-direction:column; border-radius:18px; background:var(--fill); overflow:hidden; }',
'.aj-menu.aj-vuelve{ animation:ajVuelve .35s var(--ease); }',
'@keyframes ajVuelve{ from{ opacity:0; transform:translateX(-14px); } to{ opacity:1; transform:none; } }',
'.aj-fila{ display:flex; align-items:center; gap:13px; padding:13px 14px; text-align:left; transition:background .2s var(--ease); }',
'.aj-fila + .aj-fila{ box-shadow:inset 0 1px 0 var(--hairline); }',
'.aj-fila:active{ background:var(--fill-hi); }',
'.aj-ico{ width:34px; height:34px; flex:0 0 auto; border-radius:10px; display:grid; place-items:center; color:var(--accent); background:var(--accent-soft); }',
'.aj-ico svg{ width:18px; height:18px; }',
'.aj-txt{ flex:1; min-width:0; display:flex; flex-direction:column; } .aj-txt b{ font-size:15px; font-weight:700; } .aj-txt small{ font-size:12.5px; color:var(--t3); }',
'.aj-fl{ width:17px; height:17px; color:var(--t3); flex:0 0 auto; }',
'.aj-menu[hidden], .aj-pag[hidden]{ display:none!important; }',
'.aj-pie{ padding:12px 14px 14px; font-size:12.5px; color:var(--t3); background:var(--bg); }',
'.aj-pag.aj-entra{ animation:ajEntra .38s cubic-bezier(.2,.9,.3,1); }',
'@keyframes ajEntra{ from{ opacity:0; transform:translateX(18px); } to{ opacity:1; transform:none; } }',
'.aj-atras{ display:inline-flex; align-items:center; gap:4px; font-size:15px; font-weight:700; color:var(--accent); padding:4px 0 10px; margin-left:-6px; }',
'.aj-atras svg{ width:20px; height:20px; }',
'.aj-h{ font-size:26px; font-weight:800; letter-spacing:-.035em; margin-bottom:18px; }',
'.aj-cab-oculta > div:first-child{ display:none!important; }',
/* tutorial y accesibilidad */
'.tick{ position:relative; }',
'.tick::before{ content:""; position:absolute; inset:-12px; border-radius:99px; }',
':root:not(.dark):not(.neo):not(.sage){ --t3:#6c6c78; }',
'html.sage{ --t3:#63736a; }',
'.text-\\[10\\.5px\\], .text-\\[11px\\]{ font-size:12px!important; }',
'.text-\\[11\\.5px\\]{ font-size:12.5px!important; }',
'.text-\\[9px\\], .text-\\[9\\.5px\\], .text-\\[10px\\]{ font-size:11px!important; }',
'.chip{ font-size:11.5px; }',
/* preguntas del principio */
'#onb{ position:fixed; inset:0; z-index:96; display:flex; flex-direction:column; background:var(--bg); padding:calc(env(safe-area-inset-top) + 16px) 22px calc(env(safe-area-inset-bottom) + 18px);',
'  opacity:0; transform:translateY(20px); transition:opacity .4s var(--ease), transform .5s cubic-bezier(.2,.9,.3,1); }',
'#onb.ve{ opacity:1; transform:none; }',
'#onb.sale{ opacity:0; transform:scale(.97); transition:opacity .35s var(--ease), transform .4s var(--ease); }',
'.onb-top{ display:flex; align-items:center; gap:12px; }',
'.onb-pasos{ flex:1; display:grid; grid-template-columns:repeat(4,1fr); gap:6px; }',
'.onb-pasos i{ height:5px; border-radius:99px; background:var(--fill-hi); transition:background .4s var(--ease); }',
'.onb-pasos i.on{ background:var(--accent); }',
'.onb-top span{ font-size:13px; font-weight:700; color:var(--t3); }',
'.onb-cuerpo{ flex:1; min-height:0; overflow-y:auto; padding-top:34px; max-width:520px; width:100%; margin:0 auto; }',
'.onb-cuerpo.onb-entra{ animation:rtEntra .45s cubic-bezier(.2,.9,.3,1); }',
'.onb-cuerpo h2{ font-size:32px; font-weight:800; letter-spacing:-.045em; line-height:1.08; }',
'.onb-s{ font-size:15px; color:var(--t2); margin:10px 0 24px; line-height:1.45; }',
'.onb-grid{ display:grid; grid-template-columns:1fr 1fr; gap:10px; }',
'.onb-lista{ display:flex; flex-direction:column; gap:10px; }',
'.onb-op{ position:relative; display:flex; flex-direction:column; align-items:flex-start; gap:10px; padding:16px; border-radius:20px; text-align:left; font-size:15px; font-weight:700;',
'  background:var(--fill); box-shadow:inset 0 0 0 1.5px transparent; transition:all .3s var(--spring); }',
'.onb-op.fila{ flex-direction:row; align-items:center; justify-content:space-between; min-height:60px; }',
'.onb-op.fila span{ display:flex; flex-direction:column; } .onb-op small{ font-size:13px; font-weight:500; color:var(--t3); margin-top:2px; }',
'.onb-e{ font-size:28px; line-height:1; }',
'.onb-op i{ width:24px; height:24px; border-radius:99px; display:grid; place-items:center; box-shadow:inset 0 0 0 1.5px var(--hairline); color:transparent; transition:all .3s var(--spring); }',
'.onb-grid .onb-op i{ position:absolute; top:14px; right:14px; }',
'.onb-op i svg{ width:12px; height:12px; }',
'.onb-op.on{ background:var(--accent-soft); box-shadow:inset 0 0 0 2px var(--accent); }',
'.onb-op.on i{ background:var(--accent); color:var(--on-accent); box-shadow:none; transform:scale(1.08); }',
'.onb-op:active{ transform:scale(.97); }',
'.onb-pie{ display:flex; gap:10px; padding-top:14px; max-width:520px; width:100%; margin:0 auto; }',
'.onb-sec{ height:56px; padding:0 22px; border-radius:99px; font-size:16px; font-weight:700; color:var(--t2); background:var(--fill); }',
'.onb-main{ flex:1; height:56px; border-radius:99px; font-size:16px; font-weight:700; color:var(--on-accent); background:var(--accent); transition:opacity .3s var(--ease), transform .25s var(--spring); }',
'.onb-main[disabled]{ opacity:.35; }',
'.onb-main:active{ transform:scale(.97); }',
/* tu evolución: descubrimientos y botones */
'.ev-desc .soc-sec{ margin-top:24px; }',
'.ev-d{ display:flex; gap:14px; align-items:flex-start; padding:12px 0; }',
'.ev-d + .ev-d{ box-shadow:inset 0 1px 0 var(--hairline); }',
'.ev-d span{ font-size:24px; line-height:1.1; } .ev-d p{ font-size:15px; line-height:1.45; }',
'.ev-d-vacio{ font-size:14px; color:var(--t3); line-height:1.5; }',
'.ev-botones{ display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:18px; }',
'.ev-b{ height:50px; border-radius:16px; font-size:14.5px; font-weight:700; background:var(--fill); color:var(--t1); }',
'.ev-b:last-child{ background:var(--accent); color:var(--on-accent); }',
/* diario */
'#diario-capa{ position:fixed; inset:0; z-index:66; background:var(--bg); display:flex; flex-direction:column; transform:translateX(100%); transition:transform .42s cubic-bezier(.32,.72,0,1); }',
'#diario-capa.ve{ transform:none; }',
'.dy-hero h1{ font-size:38px; font-weight:800; letter-spacing:-.045em; line-height:1.05; margin-top:6px; } .dy-hero h1 span{ color:var(--t3); }',
'.dy-anio{ display:flex; gap:2px; margin-top:18px; }',
'.dy-col{ flex:1; display:flex; flex-direction:column; gap:2px; }',
'.dy-anio i{ display:block; aspect-ratio:1; border-radius:2px; background:var(--fill-hi); }',
'html.neo .dy-anio i{ background:rgba(45,35,20,.12); }',
'.dy-anio i.fuera{ background:transparent; } .dy-anio i.fut{ opacity:.45; } .dy-anio i.hoy{ box-shadow:0 0 0 1.5px var(--t1); }',
'.dy-ley{ display:flex; justify-content:space-between; margin-top:10px; font-size:14px; }',
'.dy-ley span{ display:flex; align-items:center; gap:4px; } .dy-ley i{ width:10px; height:10px; border-radius:3px; display:block; }',
'.dy-busca{ display:flex; align-items:center; gap:10px; margin:22px 0 6px; padding:0 14px; height:46px; border-radius:14px; background:var(--fill); color:var(--t3); }',
'.dy-busca svg{ width:18px; height:18px; flex:0 0 auto; }',
'.dy-busca input{ flex:1; min-width:0; background:none; border:0; outline:none; color:var(--t1); }',
'.dy-mes{ margin:22px 0 6px; font-size:12px; font-weight:800; letter-spacing:.12em; text-transform:uppercase; color:var(--t3); }',
'.dy-e{ display:flex; gap:14px; width:100%; padding:12px 0 12px 12px; text-align:left; box-shadow:inset 3px 0 0 var(--c); border-radius:2px; }',
'.dy-e + .dy-e{ margin-top:4px; }',
'.dy-fecha{ width:34px; flex:0 0 auto; display:flex; flex-direction:column; align-items:center; }',
'.dy-fecha b{ font-size:20px; font-weight:800; line-height:1.1; } .dy-fecha small{ font-size:11.5px; color:var(--t3); text-transform:lowercase; }',
'.dy-cuerpo{ flex:1; min-width:0; display:flex; flex-direction:column; gap:4px; }',
'.dy-nota{ font-size:15px; line-height:1.45; } .dy-nota.vacia{ color:var(--t3); font-style:italic; }',
'.dy-nota mark{ background:color-mix(in srgb,var(--gold) 35%,transparent); color:inherit; border-radius:3px; }',
'.dy-meta{ font-size:12.5px; color:var(--t3); }',
'.dy-vacio{ padding:24px 0; font-size:14px; color:var(--t3); text-align:center; }',
'.dy-tarjeta{ width:100%; display:block; text-align:left; padding:18px; border-radius:24px; color:var(--t1);',
'  background:color-mix(in srgb,var(--violet) 9%,var(--bg)); box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--violet) 18%,transparent); transition:transform .35s var(--spring); }',
'.dy-tarjeta:active{ transform:scale(.98); }',
'.dy-ult{ margin-top:12px; font-size:15px; line-height:1.45; } .dy-ult span{ display:block; margin-top:4px; font-size:12.5px; color:var(--t3); } .dy-ult.vacio{ color:var(--t3); font-size:14px; }',
'body:has(#hist-capa.ve) #sheet, body:has(#diario-capa.ve) #sheet, body:has(#semana-capa.ve) #sheet, body:has(#perfil-capa.ve) #sheet, body:has(#grupo-capa.ve) #sheet{ z-index:72!important; }',
'.cs-img{ width:100%; max-width:360px; display:block; margin:0 auto; border-radius:18px; box-shadow:0 18px 40px -20px rgba(0,0,0,.5); }'
].join("\n");

/* ════════════ ejercicio: y, si quieres, qué deporte ════════════ */
var DEP_IDEAS=["Gimnasio","Correr","Fútbol","Baloncesto","Nadar","Bici","Andar","Yoga","Baile","Pádel"];
var depVisto={}, depAnadiendo=false;
function vitalDeportes(){
  var btn=document.getElementById("gym-btn"); if(!btn) return;
  var t=curDay(), hecho=wentGym(t);
  if(!S.deportes) S.deportes=[]; if(!S.deporteDia) S.deporteDia={};
  if(!hecho && S.deporteDia[t]){ delete S.deporteDia[t]; save(); }
  var caja=document.getElementById("dep-caja");
  if(!caja){ caja=document.createElement("div"); caja.id="dep-caja"; btn.parentNode.insertBefore(caja, btn.nextSibling); }
  if(!hecho){ caja.innerHTML=""; caja.className="dep-caja"; depVisto[t]=false; depAnadiendo=false; return; }
  var hoySel=S.deporteDia[t]||[];
  var h='<p class="dep-t">¿Qué has hecho? <span>opcional</span></p><div class="dep-chips">'+
    S.deportes.map(function(n){ var on=hoySel.indexOf(n)>=0; return '<button class="dep-c'+(on?" on":"")+'" data-act="x-dep" data-n="'+esc(n)+'">'+(on?'<i>'+ICON_CHECK+'</i>':'')+esc(n)+'</button>'; }).join("")+
    (depAnadiendo
      ? '<span class="dep-nuevo"><input id="dep-in" maxlength="24" placeholder="Ej. Escalada" enterkeyhint="done"><button data-act="x-dep-ok" aria-label="Añadir">'+ICON_CHECK+'</button></span>'
      : '<button class="dep-c mas" data-act="x-dep-nuevo">+ Añadir</button>')+
    (S.deportes.length?'<button class="dep-editar" data-act="x-dep-editar">Editar</button>':'')+
    '</div>';
  if(!S.deportes.length && !depAnadiendo){
    h+='<p class="dep-ideas-t">Ideas para empezar:</p><div class="dep-chips">'+DEP_IDEAS.slice(0,6).map(function(n){ return '<button class="dep-c idea" data-act="x-dep-idea" data-n="'+esc(n)+'">'+esc(n)+'</button>'; }).join("")+'</div>';
  }
  caja.innerHTML=h; caja.className="dep-caja abierta";
  var inp=document.getElementById("dep-in");
  if(inp){ setTimeout(function(){ try{ inp.focus(); }catch(e){} }, 60);
    inp.addEventListener("keydown", function(e){ if(e.key==="Enter"){ e.preventDefault(); depAnade(inp.value); } }); }
  /* se despliega con suavidad la primera vez que aparece */
  if(!depVisto[t]){
    depVisto[t]=true;
    var alto=caja.scrollHeight; caja.style.height="0px"; caja.style.opacity="0"; void caja.offsetHeight;
    caja.style.transition="height .45s cubic-bezier(.3,.9,.3,1), opacity .35s ease .08s"; caja.style.height=alto+"px"; caja.style.opacity="1";
    setTimeout(function(){ caja.style.height=""; caja.style.transition=""; }, 480);
  }
}
function depAnade(v){
  v=(v||"").trim().slice(0,24); if(!v){ depAnadiendo=false; rVital(); return; }
  if(!S.deportes) S.deportes=[];
  if(S.deportes.map(function(x){ return x.toLowerCase(); }).indexOf(v.toLowerCase())<0) S.deportes.push(v);
  var t=curDay(); if(!S.deporteDia) S.deporteDia={}; var l=S.deporteDia[t]||[]; if(l.indexOf(v)<0) l.push(v); S.deporteDia[t]=l;
  depAnadiendo=false; save(); sonido("pop"); rVital();
}
function sheetDeportes(){
  openSheet('<div class="flex items-start justify-between mb-2"><h3 class="display text-[19px] font-bold">Tus deportes</h3>'+closeBtn()+'</div>'+
    '<p class="text-[12.5px] t3 mb-4">Los que salen para elegir cuando marcas que has hecho ejercicio.</p>'+
    '<div class="dep-lista">'+(S.deportes||[]).map(function(n,i){ return '<div class="dep-f"><span>'+esc(n)+'</span><button data-act="x-dep-quita" data-i="'+i+'" aria-label="Quitar">'+ICON_TRASH+'</button></div>'; }).join("")+
    ((S.deportes||[]).length?'':'<p class="text-[13px] t3 py-3">Aún no tienes ninguno.</p>')+'</div>');
}
/* los días de la semana del ejercicio dicen qué hiciste */
function deporteTexto(d){ var l=(S.deporteDia&&S.deporteDia[d])||[]; return l.join(", "); }

/* ════════════ reto de la semana: que se note cada paso ════════════ */
function pintaRetoSemana(){
  var izq=document.getElementById("retos-left"); if(!izq) return;
  var box=document.getElementById("reto-semana");
  if(!box){ box=document.createElement("div"); box.id="reto-semana"; box.className="glass importante rounded-[24px] pad";
    var primera=izq.firstElementChild; if(primera && primera.nextSibling) izq.insertBefore(box, primera.nextSibling); else izq.appendChild(box); }
  var l=lunesDe(today()), s=retoSemana(l), r=s.r;
  var val = r.u==="min" ? horasTxt(s.v)+" de "+horasTxt(r.meta) : s.v+" de "+r.meta+(r.u==="veces"?(r.meta===1?" vez":" veces"):" días");
  var clave=l+"|"+r.id+"|"+r.meta+"|"+s.v+"|"+r.t; if(box.dataset.k===clave) return;
  var vAntes = (box.dataset.l===l && box.dataset.id===r.id) ? +box.dataset.v : null, eraHecho=box.dataset.hecho==="1";
  box.dataset.k=clave; box.dataset.l=l; box.dataset.id=r.id; box.dataset.v=s.v; box.dataset.hecho=s.hecho?"1":"0";
  var segs = (r.u!=="min" && r.meta<=10);
  var prog;
  if(segs){
    prog='<div class="rs-segs" style="--n:'+r.meta+'">';
    for(var i=0;i<r.meta;i++){ var on=i<s.v, nuevo=(vAntes!=null && i>=vAntes && i<s.v); prog+='<i class="'+(on?"on":"")+(nuevo?" nuevo":"")+'" style="--d:'+(nuevo?(i-vAntes)*0.12:0)+'s"></i>'; }
    prog+='</div>';
  } else prog='<div class="rs-barra"><i style="width:'+(vAntes!=null?Math.min(100,Math.round(vAntes/r.meta*100)):Math.round(s.pct*100))+'%"></i></div>';
  var pie = s.hecho
    ? '<span class="rs-logrado"><i>'+ICON_CHECK+'</i>Conseguido</span><span class="num">'+val+'</span>'
    : '<span class="num">'+val+'</span>'+(r.propio
        ? '<span class="rs-cuenta"><button data-act="x-rs-cuenta" data-d="-1" aria-label="Quitar una">−</button><button data-act="x-rs-cuenta" data-d="1" aria-label="Sumar una">+1</button></span>'
        : '<span>'+(s.quedan===0?"Último día":"Quedan "+s.quedan+(s.quedan===1?" día":" días"))+'</span>');
  box.classList.toggle("rs-hecho", s.hecho);
  box.innerHTML=
    '<div class="rs-top"><span class="eyebrow">Reto de la semana</span><span class="rs-dcha"><span class="rs-xp">+'+RETO_SEMANA_XP+' XP</span>'+
      (s.hecho?'':'<button class="rs-editar" data-act="x-rs-abrir">Cambiar</button>')+'</span></div>'+
    '<p class="rs-t display">'+esc(r.t)+'</p>'+prog+
    '<div class="rs-pie">'+pie+'</div>'+
    (s.hecho?'<span class="rs-brillo"></span>':'');
  if(!segs && vAntes!=null){ var i2=box.querySelector(".rs-barra i"); requestAnimationFrame(function(){ requestAnimationFrame(function(){ i2.style.width=Math.round(s.pct*100)+"%"; }); }); }
  /* avance: el número salta; conseguido: la tarjeta se celebra */
  if(vAntes!=null && s.v>vAntes && !s.hecho){ var n=box.querySelector(".rs-pie .num"); if(n) n.classList.add("rs-salta"); sonido("tick"); }
  if(s.hecho && vAntes!=null && !eraHecho){
    box.classList.remove("rs-celebra"); void box.offsetWidth; box.classList.add("rs-celebra");
    setTimeout(function(){ sonido("semana"); try{ if(navigator.vibrate) navigator.vibrate([16,50,30]); }catch(e){} }, 250);
  }
}

/* ════════════ la imagen de la semana: fondo liso o transparente, con su gráfica ════════════ */
var CS_COLORES=[
  { k:"tinta",  bg:"#4f46e5", fg:"#ffffff" }, { k:"noche", bg:"#111114", fg:"#ffffff" }, { k:"crema", bg:"#f3ead8", fg:"#1d1810" },
  { k:"bosque", bg:"#1f5b47", fg:"#f4efe3" }, { k:"coral", bg:"#ee6a50", fg:"#ffffff" }, { k:"cielo", bg:"#d7e9ff", fg:"#0f2a4d" },
  { k:"rosa",   bg:"#f3cadb", fg:"#3b1022" },
  { k:"tr-claro", bg:null, fg:"#ffffff" }, { k:"tr-oscuro", bg:null, fg:"#111114" }
];
var CSKEY="dtrack-color-semana", csSemana=null;
function csColor(){ var k="tinta"; try{ k=localStorage.getItem(CSKEY)||k; }catch(e){} for(var i=0;i<CS_COLORES.length;i++) if(CS_COLORES[i].k===k) return CS_COLORES[i]; return CS_COLORES[0]; }
function alfa(hex, a){ var h=hex.replace("#",""); var r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16); return "rgba("+r+","+g+","+b+","+a+")"; }
function dibujaSemana(l, col){
  var o=resumenSemana(l), st=stats(), hoy=today();
  var W=1080, H=1920, cv=document.createElement("canvas"); cv.width=W; cv.height=H;
  var c=cv.getContext("2d"); if(!c) return null;
  var F='"Plus Jakarta Sans", -apple-system, sans-serif', FI='Inter, -apple-system, sans-serif', FG=col.fg, M=100, tr0=!col.bg;
  if(col.bg){ c.fillStyle=col.bg; c.fillRect(0,0,W,H); }
  /* en transparente, una sombra suave para que se lea sobre cualquier foto */
  function sombra(on){ if(!tr0 || FG!=="#ffffff") return; c.shadowColor = on ? "rgba(0,0,0,.28)" : "transparent"; c.shadowBlur = on?10:0; c.shadowOffsetY = on?2:0; }
  sombra(true);
  /* marca y fechas */
  c.fillStyle=FG; c.beginPath(); c.moveTo(M+14,112); c.lineTo(M+28,152); c.lineTo(M+14,148); c.lineTo(M,152); c.closePath(); c.fill();
  c.globalAlpha=.45; c.beginPath(); c.moveTo(M+14,178); c.lineTo(M+28,152); c.lineTo(M+14,156); c.lineTo(M,152); c.closePath(); c.fill(); c.globalAlpha=1;
  c.font="800 38px "+F; c.fillText("Peak.", M+44, 160);
  c.fillStyle=alfa(FG,.6); c.font="600 32px "+FI; c.textAlign="right"; c.fillText(tr(rangoSemana(l)), W-M, 160); c.textAlign="left";
  /* titular */
  c.fillStyle=FG; c.font="800 132px "+F; c.fillText(tr("Mi semana"), M-6, 390);
  c.fillStyle=alfa(FG,.7); c.font="600 44px "+FI;
  c.fillText(o.activos+" "+tr("de")+" 7 "+tr("días activos")+(st.streak>1?"  ·  "+st.streak+" "+tr("de racha"):""), M, 470);
  /* la gráfica: el XP de cada día, curva suave con su área */
  var gx=M, gy=620, gw=W-2*M, gh=520, max=Math.max(20, Math.max.apply(null,o.porDia)), pts=[];
  for(var i=0;i<7;i++){ var v=(o.dias[i]<=hoy)?o.porDia[i]:null; pts.push({ x:gx+i*gw/6, y: v==null?null: gy+gh-(v/max)*gh*0.86-gh*0.06, v:v }); }
  var vis=pts.filter(function(p){ return p.y!=null; });
  sombra(false);
  /* guías */
  c.strokeStyle=alfa(FG,.14); c.lineWidth=2; c.setLineDash([4,14]);
  [0,0.5,1].forEach(function(f){ var yy=gy+gh*0.06+ f*gh*0.86; c.beginPath(); c.moveTo(gx,yy); c.lineTo(gx+gw,yy); c.stroke(); });
  c.setLineDash([]);
  function curva(){ c.moveTo(vis[0].x, vis[0].y); for(var k=1;k<vis.length;k++){ var a=vis[k-1], b=vis[k], mx=(a.x+b.x)/2; c.bezierCurveTo(mx,a.y,mx,b.y,b.x,b.y); } }
  if(vis.length>1){
    var g=c.createLinearGradient(0,gy,0,gy+gh); g.addColorStop(0,alfa(FG,.34)); g.addColorStop(1,alfa(FG,0));
    c.beginPath(); curva(); c.lineTo(vis[vis.length-1].x, gy+gh); c.lineTo(vis[0].x, gy+gh); c.closePath(); c.fillStyle=g; c.fill();
    sombra(true); c.beginPath(); curva(); c.strokeStyle=FG; c.lineWidth=9; c.lineCap="round"; c.lineJoin="round"; c.stroke(); sombra(false);
  }
  /* puntos y el mejor día con su globo */
  var mejor=-1, mv=0; vis.forEach(function(p,k){ if(p.v>mv){ mv=p.v; mejor=k; } });
  vis.forEach(function(p,k){
    c.beginPath(); c.arc(p.x,p.y, k===mejor?20:11, 0, 6.2832); c.fillStyle=FG; c.fill();
    if(col.bg){ c.beginPath(); c.arc(p.x,p.y, k===mejor?9:5, 0, 6.2832); c.fillStyle=col.bg; c.fill(); }
  });
  if(mejor>=0 && mv>0){
    var pb=vis[mejor], txt=mv+" XP"; c.font="800 38px "+F; var tw=c.measureText(txt).width+44, bx=Math.max(gx, Math.min(gx+gw-tw, pb.x-tw/2)), by=pb.y-96;
    sombra(true); c.fillStyle=FG; redondo(c,bx,by,tw,62,31); c.fill(); sombra(false);
    c.fillStyle= col.bg || (FG==="#ffffff"?"#111114":"#ffffff"); c.fillText(txt, bx+22, by+44);
  }
  /* días */
  sombra(true);
  for(var d=0; d<7; d++){ var act=(o.dias[d]<=hoy && activeDay(o.dias[d]));
    c.fillStyle= act?FG:alfa(FG,.4); c.font=(act?"800 ":"600 ")+"36px "+F; c.textAlign="center"; c.fillText(L10N.sem[d], gx+d*gw/6, gy+gh+70); }
  c.textAlign="left";
  /* tres cifras */
  var cif=[[horasTxt(o.estMin)||"0 min", tr("de estudio")],[String(o.retos), tr("retos hechos")],[String(o.gym), tr("días de ejercicio")]];
  var cy=1390, cw=(W-2*M)/3;
  sombra(false); c.strokeStyle=alfa(FG,.18); c.lineWidth=2;
  c.beginPath(); c.moveTo(M,cy-110); c.lineTo(W-M,cy-110); c.stroke();
  cif.forEach(function(x,k){
    var cx=M+k*cw;
    if(k>0){ sombra(false); c.beginPath(); c.moveTo(cx-20,cy-70); c.lineTo(cx-20,cy+60); c.stroke(); }
    sombra(true); c.fillStyle=FG; c.font="800 76px "+F; c.fillText(x[0], cx+(k?10:0), cy);
    c.fillStyle=alfa(FG,.62); c.font="600 32px "+FI; c.fillText(x[1], cx+(k?10:0), cy+50);
  });
  /* una frase: descubrimiento, ánimo o mejor día */
  var ds=descubrimientoDelDia(), y2=1600;
  var an=o.dias.map(function(d){ var a=animoDe(d); return a&&a.v?a.v:0; });
  c.fillStyle=FG;
  if(ds){ c.font="700 44px "+F; envuelve(c, "“"+tr(ds.t)+"”", M, y2, W-2*M, 58, 3); }
  else if(an.some(function(v){ return v; })){ c.fillStyle=alfa(FG,.6); c.font="700 30px "+F; c.fillText(tr("CÓMO ME SENTÍ"), M, y2-20);
    c.font="68px sans-serif"; an.forEach(function(v,k){ c.globalAlpha=v?1:.2; c.fillText(v?ANIMOS[v-1]:"·", M+k*((W-2*M)/7), y2+70); }); c.globalAlpha=1; }
  else { c.font="700 44px "+F; c.fillText(o.porDia[o.mejor]>0 ? tr("Mejor día")+": "+cap(fmt(o.dias[o.mejor],{weekday:"long"})) : tr("Un día detrás de otro."), M, y2+10); }
  c.fillStyle=alfa(FG,.5); c.font="600 30px "+FI; c.fillText(tr("hecho con Peak · hábitos, retos y tu Parte del día"), M, H-100);
  sombra(false);
  return cv;
}
function compartirSemana(l){
  csSemana=l||lunesDe(today());
  var col=csColor(), cv=dibujaSemana(csSemana, col); if(!cv) return;
  var puede=!!(navigator.canShare && !enVisor());
  openSheet('<div class="flex items-start justify-between mb-2"><h3 class="display text-[19px] font-bold">Tu semana</h3>'+closeBtn()+'</div>'+
    '<div class="cs-colores">'+CS_COLORES.map(function(x){ return '<button class="cs-c'+(x.k===col.k?" on":"")+(x.bg?"":" tr")+'" data-act="x-cs-color" data-k="'+x.k+'" style="'+(x.bg?'background:'+x.bg:'--tinta:'+x.fg)+'" aria-label="'+(x.bg?"Color":"Transparente")+'"></button>'; }).join("")+'</div>'+
    '<p class="cs-ayuda" id="cs-ayuda">'+(col.bg?"Fondo liso":"Transparente: para ponerla encima de una foto")+'</p>'+
    '<div class="cs-marco'+(col.bg?"":" tr")+'" id="cs-marco"><img class="cs-img" id="cs-img" src="'+cv.toDataURL("image/png")+'" alt="Tu semana en Peak"></div>'+
    '<div class="cs-botones"><button class="btn btn-quiet flex-1 !py-3.5" data-act="x-cs-bajar">Descargar</button>'+
      (puede ? '<button class="btn btn-primary flex-1 !py-3.5" data-act="x-cs-compartir">Compartir</button>' : '')+'</div>');
}
function csCambiaColor(k){
  try{ localStorage.setItem(CSKEY,k); }catch(e){}
  var col=csColor(), cv=dibujaSemana(csSemana, col), img=document.getElementById("cs-img");
  document.querySelectorAll(".cs-c").forEach(function(b){ b.classList.toggle("on", b.dataset.k===k); });
  var mc=document.getElementById("cs-marco"); if(mc) mc.classList.toggle("tr", !col.bg);
  var ay=document.getElementById("cs-ayuda"); if(ay) ay.textContent = col.bg ? "Fondo liso" : "Transparente: para ponerla encima de una foto";
  if(img && cv){ img.classList.remove("cs-cambia"); void img.offsetWidth; img.src=cv.toDataURL("image/png"); img.classList.add("cs-cambia"); }
  sonido("tick");
}
function csComparte(){
  var cv=dibujaSemana(csSemana, csColor()); if(!cv) return;
  var o=resumenSemana(csSemana), texto=tr("Mi semana en Peak")+": "+o.activos+"/7 "+tr("días activos")+".";
  cv.toBlob(function(b){
    var file=null; try{ if(b) file=new File([b], "mi-semana-peak.png", {type:"image/png"}); }catch(e){}
    if(file && navigator.canShare && navigator.canShare({ files:[file] })) navigator.share({ files:[file], text:texto }).catch(function(){});
    else csDescarga();
  }, "image/png");
}
/* descargar: dentro de Claude pide permiso para guardar; fuera, descarga normal */
function csDescarga(){
  var col=csColor(), cv=dibujaSemana(csSemana, col); if(!cv) return;
  var nombre="mi-semana-peak"+(col.bg?"":"-transparente")+".png";
  cv.toBlob(function(b){
    if(!b) return;
    function normal(){
      try{ var u=URL.createObjectURL(b), a=document.createElement("a"); a.href=u; a.download=nombre; document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(function(){ URL.revokeObjectURL(u); }, 1500); avisoNube("Imagen descargada."); }
      catch(e){ avisoNube("Mantén pulsada la imagen para guardarla."); }
    }
    var cl=window.claude;
    if(cl && typeof cl.use==="function"){
      cl.use("downloads").then(function(dl){
        if(!dl){ normal(); return; }
        dl.save({ filename:nombre, data:b }).then(function(){ avisoNube("Imagen guardada."); }, function(e){
          if(e && e.code==="declined") return;
          if(e && e.code==="rate_limited"){ avisoNube("Espera un momento y vuelve a probar."); return; }
          avisoNube("Mantén pulsada la imagen para guardarla.");
        });
      }, function(){ normal(); });
    } else normal();
  }, "image/png");
}

/* acciones de esta parte */
function rumboAccion2(a, el){
  if(a==="x-dep"){ var t=curDay(), n=el.dataset.n; if(!S.deporteDia) S.deporteDia={}; var l=S.deporteDia[t]||[], i=l.indexOf(n);
    if(i>=0) l.splice(i,1); else l.push(n); S.deporteDia[t]=l; save(); sonido(i>=0?"des":"pop"); rVital(); return true; }
  if(a==="x-dep-nuevo"){ depAnadiendo=true; rVital(); return true; }
  if(a==="x-dep-ok"){ var inp=document.getElementById("dep-in"); depAnade(inp?inp.value:""); return true; }
  if(a==="x-dep-idea"){ depAnade(el.dataset.n); return true; }
  if(a==="x-dep-editar"){ sheetDeportes(); return true; }
  if(a==="x-dep-quita"){ var k=+el.dataset.i, nom=(S.deportes||[])[k]; S.deportes.splice(k,1);
    Object.keys(S.deporteDia||{}).forEach(function(d){ var l2=S.deporteDia[d]; var j=l2.indexOf(nom); if(j>=0) l2.splice(j,1); });
    save(); sheetDeportes(); rVital(); return true; }
  if(a==="x-cs-color"){ csCambiaColor(el.dataset.k); return true; }
  if(a==="x-cs-compartir"){ csComparte(); return true; }
  if(a==="x-cs-bajar"){ csDescarga(); return true; }
  return false;
}

var RUMBO2_CSS=[
/* deportes */
'.dep-caja{ overflow:hidden; }',
'.dep-caja.abierta{ margin:-8px 0 22px; }',
'.dep-t{ font-size:13.5px; font-weight:700; margin-bottom:10px; } .dep-t span{ font-weight:500; color:var(--t3); font-size:12.5px; margin-left:4px; }',
'.dep-chips{ display:flex; flex-wrap:wrap; gap:8px; align-items:center; }',
'.dep-c{ display:inline-flex; align-items:center; gap:6px; height:38px; padding:0 15px; border-radius:99px; font-size:14px; font-weight:600; color:var(--t2);',
'  background:var(--fill); box-shadow:inset 0 0 0 1px var(--hairline-2); transition:all .3s var(--spring); }',
'.dep-c:active{ transform:scale(.93); }',
'.dep-c.on{ color:#fff; background:var(--good); box-shadow:none; }',
'.dep-c i{ display:grid; width:14px; height:14px; } .dep-c i svg{ width:100%; height:100%; }',
'.dep-c.mas{ color:var(--accent); background:transparent; box-shadow:inset 0 0 0 1.5px var(--accent-line); }',
'.dep-c.idea{ background:transparent; border:1.5px dashed var(--hairline); box-shadow:none; }',
'.dep-ideas-t{ font-size:12.5px; color:var(--t3); margin:14px 0 8px; }',
'.dep-editar{ font-size:13px; font-weight:700; color:var(--t3); padding:0 6px; height:38px; }',
'.dep-nuevo{ display:inline-flex; align-items:center; gap:6px; height:38px; padding:0 4px 0 14px; border-radius:99px; box-shadow:inset 0 0 0 1.5px var(--accent); background:var(--bg); }',
'.dep-nuevo input{ width:130px; background:none; border:0; outline:none; color:var(--t1); font-size:16px; }',
'.dep-nuevo button{ width:30px; height:30px; border-radius:99px; display:grid; place-items:center; background:var(--accent); color:var(--on-accent); }',
'.dep-nuevo button svg{ width:13px; height:13px; }',
'.dep-lista .dep-f{ display:flex; align-items:center; justify-content:space-between; padding:12px 0; font-size:15px; }',
'.dep-lista .dep-f + .dep-f{ box-shadow:inset 0 1px 0 var(--hairline); }',
'.dep-lista button{ width:32px; height:32px; display:grid; place-items:center; color:var(--t3); }',
/* reto de la semana */
'#reto-semana{ position:relative; overflow:hidden; transition:background .5s var(--ease), box-shadow .5s var(--ease); }',
'.rs-segs{ display:grid; grid-template-columns:repeat(var(--n),1fr); gap:6px; margin-top:14px; }',
'.rs-segs i{ height:10px; border-radius:99px; background:var(--fill-hi); position:relative; overflow:hidden; }',
'.rs-segs i::after{ content:""; position:absolute; inset:0; border-radius:inherit; background:var(--accent); transform:scaleX(0); transform-origin:left; }',
'.rs-segs i.on::after{ transform:none; }',
'.rs-segs i.nuevo::after{ animation:rsSeg .55s cubic-bezier(.3,.9,.3,1) var(--d) both; }',
'@keyframes rsSeg{ from{ transform:scaleX(0); } to{ transform:none; } }',
'.rs-segs i.nuevo{ animation:rsSegPop .6s cubic-bezier(.3,1.6,.5,1) var(--d); }',
'@keyframes rsSegPop{ 50%{ transform:scaleY(1.6); } }',
'.rs-salta{ display:inline-block; animation:rsSalta .5s cubic-bezier(.3,1.6,.5,1); }',
'@keyframes rsSalta{ 40%{ transform:scale(1.25); color:var(--accent); } }',
'#reto-semana.rs-hecho{ background:linear-gradient(150deg, color-mix(in srgb,var(--good) 16%,var(--bg)), color-mix(in srgb,var(--good) 6%,var(--bg)))!important;',
'  box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--good) 40%,transparent)!important; }',
'.rs-hecho .rs-segs i::after, .rs-hecho .rs-barra i{ background:var(--good)!important; }',
'.rs-hecho .rs-xp{ background:var(--good)!important; color:#fff!important; }',
'.rs-logrado{ display:inline-flex; align-items:center; gap:7px; font-weight:800; color:var(--good); }',
'.rs-logrado i{ width:22px; height:22px; border-radius:99px; display:grid; place-items:center; background:var(--good); color:#fff; }',
'.rs-logrado i svg{ width:12px; height:12px; }',
'.rs-brillo{ position:absolute; top:0; bottom:0; left:-60%; width:45%; pointer-events:none; opacity:0;',
'  background:linear-gradient(100deg, transparent, rgba(255,255,255,.55), transparent); transform:skewX(-18deg); }',
'.rs-celebra{ animation:rsCel .8s cubic-bezier(.3,1.4,.5,1); }',
'@keyframes rsCel{ 0%{ transform:scale(.97); } 45%{ transform:scale(1.025); } 100%{ transform:none; } }',
'.rs-celebra .rs-brillo{ animation:rsBrillo 1.1s ease .15s; }',
'@keyframes rsBrillo{ 0%{ left:-60%; opacity:1; } 100%{ left:120%; opacity:1; } }',
'.rs-celebra .rs-logrado i{ animation:rsCheck .6s cubic-bezier(.3,1.8,.5,1) .2s both; }',
'@keyframes rsCheck{ from{ transform:scale(0) rotate(-40deg); } to{ transform:none; } }',
'.rs-celebra .rs-xp{ animation:rsXp .6s cubic-bezier(.3,1.8,.5,1) .35s both; }',
'@keyframes rsXp{ 0%{ transform:scale(.6); } 60%{ transform:scale(1.2); } 100%{ transform:none; } }',
/* imagen de la semana */
'.cs-colores{ display:flex; gap:7px; justify-content:center; margin:6px 0 16px; flex-wrap:nowrap; }',
'.cs-c{ width:30px; height:30px; flex:0 0 auto; border-radius:99px; box-shadow:inset 0 0 0 1px rgba(0,0,0,.15); transition:transform .3s var(--spring); }',
'.cs-c.on{ transform:scale(1.12); box-shadow:0 0 0 2.5px var(--bg), 0 0 0 4.5px var(--accent); }',
'.cs-img{ max-height:54vh; width:auto!important; max-width:100%; }',
'.cs-c.tr{ background:repeating-conic-gradient(#cfcfd6 0% 25%, #fff 0% 50%) 50%/12px 12px; position:relative; }',
'.cs-c.tr::after{ content:""; position:absolute; inset:9px; border-radius:99px; background:var(--tinta); box-shadow:0 0 0 1px rgba(0,0,0,.2); }',
'.cs-ayuda{ text-align:center; font-size:12.5px; color:var(--t3); margin:-6px 0 12px; }',
'.cs-marco{ border-radius:18px; padding:0; display:flex; justify-content:center; }',
'.cs-marco.tr{ background:repeating-conic-gradient(color-mix(in srgb,var(--t1) 10%,transparent) 0% 25%, transparent 0% 50%) 50%/22px 22px; padding:10px; }',
'.cs-marco.tr .cs-img{ box-shadow:none; }',
'.cs-botones{ display:flex; gap:10px; margin-top:16px; }',
'.glass:has(#rail-ebau){ display:none!important; }',
'.cs-img.cs-cambia{ animation:csCambia .35s var(--ease); }',
'@keyframes csCambia{ from{ opacity:.4; transform:scale(.98); } to{ opacity:1; transform:none; } }'
].join("\n");
