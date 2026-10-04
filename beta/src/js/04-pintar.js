/* ════════ render ════════ */

/* ═════════════ PARTE DEL DÍA ═════════════ */
var parteOn=false, parteStep=0;
var PARTE_T=TEXTOS.parte.pasos;
function parteOpen(){ parteOn=true; parteStep=0; $("#parte").hidden=false; renderParte(); }
function parteClose(){ parteOn=false; $("#parte").hidden=true; render(); }
function frasePar(x,avg){
  var f=TEXTOS.parte.frases;
  if(x<=0) return f.cero;
  if(x<30) return f.poco;
  if(x<70) return x>avg ? f.normal : f.flojo;
  if(x<115) return f.bien;
  return f.bestial;
}
/* lo que sueles poner, para proponerlo en vez de dejarlo en blanco */
function sugerido(k){
  var cuenta={}, mejor=null, n=0;
  for(var i=1;i<=14;i++){
    var h=S.habits[addDays(today(),-i)]||{}, v=h[k];
    if(v==null||v==="") continue;
    cuenta[v]=(cuenta[v]||0)+1;
    if(cuenta[v]>n){ n=cuenta[v]; mejor=+v; }
  }
  return mejor;
}
function autoPlan(tom){
  if(S.plan[tom] && S.plan[tom].length) return false;
  var pend=sortTasks(S.tasks.filter(function(t){ return !t.done; }));
  if(!pend.length) return false;
  S.plan[tom]=pend.slice(0,3).map(function(t){ return t.id; });
  save(); return true;
}
function parteChip(k,v,cur,suf,sug){
  var on=(cur===v), propuesto=(cur==null && v===sug);
  return '<button class="px-3.5 py-2 rounded-[11px] text-[13px] num" data-act="parte-h" data-k="'+k+'" data-v="'+v+'" style="'+
    (on?"background:var(--accent);color:var(--on-accent);box-shadow:0 4px 14px -6px var(--accent-line)"
       :propuesto?"background:var(--accent-soft);color:var(--t1);box-shadow:inset 0 0 0 1.5px var(--accent-line)"
       :"background:var(--fill);color:var(--t2);box-shadow:inset 0 0 0 1px var(--hairline-2)")+
    ';transition:all .3s var(--spring)">'+v+(suf||"")+'</button>';
}
function parteFila(tit,k,vals,suf,cur,pista){
  var sug=(cur==null)?sugerido(k):null;
  var h='<div class="mb-5"><div class="flex items-baseline justify-between mb-2.5"><p class="text-[13.5px] font-semibold">'+tit+'</p>'+
    '<p class="text-[11px] t3">'+(cur!=null?"ya puesto":(sug!=null?"lo tuyo suele ser "+sug+(suf||""):(pista||"")))+'</p>'+
    '</div><div class="flex flex-wrap gap-2">';
  for(var i=0;i<vals.length;i++) h+=parteChip(k,vals[i],cur,suf,sug);
  return h+'</div></div>';
}
function renderParte(){
  if(!parteOn) return;
  var d=today(), tom=addDays(d,1), tmap=tasksByDay(), b="", i;
  b+='<div class="flex items-center gap-1.5 mb-5">';
  for(i=0;i<5;i++) b+='<span class="h-1 flex-1 rounded-full" style="background:'+(i<=parteStep?"var(--accent)":"var(--fill-hi)")+';transition:background .45s var(--ease)"></span>';
  b+='</div><p class="eyebrow mb-1.5">Parte del día · '+(parteStep+1)+' de 5</p>'+
     '<h2 class="display text-[23px] font-bold mb-1.5 tracking-[-.02em]">'+PARTE_T[parteStep]+'</h2>';
  var estado="";
  if(parteStep===0){ var _tc=todaysChallenges(d).length, _h=chOf(d).length;
    estado = _h===0?"Nada marcado todavía." : _h>=_tc?"Los tienes los tres. Comprueba y sigue.":"Ya llevas "+_h+" de "+_tc+". Marca lo que falte."; }
  if(parteStep===1){ var _ck=checksOf(d).length, _n=idealActivos().length;
    estado = (wentGym(d)?"Ejercicio: sí":"Ejercicio: sin marcar")+" · hábitos "+_ck+" de "+_n+"."; }
  if(parteStep===2){ var hh2=S.habits[d]||{}, falta=[];
    if(hh2.sleep==null) falta.push("sueño"); if(hh2.water==null) falta.push("agua"); if(hh2.screen==null) falta.push("pantalla");
    var haySug=(sugerido("sleep")!=null||sugerido("water")!=null||sugerido("screen")!=null);
    estado = falta.length? ("Te falta "+falta.join(", ")+"."+(haySug?" Lo resaltado es lo que sueles poner.":"")) : "Todo puesto. Cámbialo si no cuadra."; }
  if(parteStep===3){ var _s=(S.plan[addDays(d,1)]||[]).length;
    estado = _s? ("Te he puesto "+_s+". Cambia las que no te encajen.") : "Elige hasta tres."; }
  if(estado) b+='<p class="text-[12.5px] t3 mb-4 leading-relaxed">'+estado+'</p>';

  if(parteStep===0){
    var tc=todaysChallenges(d), dn=chOf(d);
    b+='<div class="space-y-2">';
    for(i=0;i<tc.length;i++) b+=chRow(tc[i], dn.indexOf(tc[i].id)>=0, false, d);
    b+='</div>';
  }
  else if(parteStep===1){
    var went=wentGym(d);
    b+='<button class="w-full rounded-[18px] py-5 mb-5" data-act="gym" data-day="'+d+'" style="'+
      (went?"background:linear-gradient(145deg,var(--good),color-mix(in srgb,var(--good) 70%,var(--cyan)));box-shadow:0 10px 26px -10px color-mix(in srgb,var(--good) 60%,transparent)"
           :"background:var(--fill);box-shadow:inset 0 0 0 1px var(--hairline);color:var(--t2)")+';transition:all .4s var(--spring)">'+
      '<span class="display text-[18px] font-bold"'+(went?' style="color:var(--on-accent)"':'')+'>'+(went?"Hoy sí has entrenado ✓":"¿Ejercicio? Marcar que lo he hecho")+'</span></button>';
    b+='<p class="eyebrow mb-3">Hábitos</p><div class="space-y-1 max-h-[38vh] overflow-y-auto px-1.5 -mx-1.5">';
    var ck=checksOf(d);
    var _li=ordenIdeal(idealDe(d));
    if(!_li.length) b+='<p class="text-[13px] t3">No tienes hábitos. Se escriben en Resumen.</p>';
    for(i=0;i<_li.length;i++){
      var it=_li[i], on=ck.indexOf(it.id)>=0;
      b+='<div class="soft flex items-center gap-3 px-3.5 py-2.5 '+(on?"done":"")+'">'+
        '<button class="tick tick-sm" data-act="check" data-id="'+it.id+'" data-day="'+d+'" aria-label="Marcar">'+ICON_CHECK+'</button>'+
        '<button class="text-[13px] flex-1 min-w-0 leading-snug text-left" data-act="check" data-id="'+it.id+'" data-day="'+d+'"><span class="strike">'+esc(it.text)+'</span></button></div>';
    }
    b+='</div>';
  }
  else if(parteStep===2){
    var h=S.habits[d]||{};

    b+=parteFila("Horas de sueño","sleep",[5,6,7,8,9],"h",h.sleep,"7h o más: +8 XP");
    b+=parteFila("Vasos de agua","water",[2,4,6,8,10],"",h.water,"8 o más: +6 XP");
    b+=parteFila("Horas de pantalla","screen",[1,2,3,4,5,6],"h",h.screen,"menos de 2h: +6 XP");
  }
  else if(parteStep===3){
    autoPlan(tom);
    var pend=S.tasks.filter(function(t){ return !t.done; }), sel=(S.plan[tom]||[]);
    b+='<p class="text-[13px] t2 mb-4 leading-relaxed">Mañana te salen arriba del todo y no te voy a dejar en paz con ellas.</p>';
    if(!pend.length) b+='<div class="soft px-4 py-6 text-center"><p class="text-[13px] t3">No tienes tareas pendientes. O eres una máquina o no has apuntado nada.</p></div>';
    else {
      pend=sortTasks(pend).slice(0,14);
      b+='<div class="space-y-1.5 max-h-[44vh] overflow-y-auto pr-1">';
      for(i=0;i<pend.length;i++){
        var tk=pend[i], mk=sel.indexOf(tk.id), sb=subj(tk.subject);
        b+='<button class="w-full text-left rounded-[13px] px-3.5 py-3 flex items-center gap-3" data-act="parte-pick" data-id="'+tk.id+'" style="'+
          (mk>=0?"background:var(--accent-soft);box-shadow:inset 0 0 0 1px var(--accent-line)":"background:var(--fill);box-shadow:inset 0 0 0 1px var(--hairline-2)")+';transition:all .3s var(--spring)">'+
          '<span class="w-6 h-6 rounded-full grid place-items-center text-[11px] num font-bold shrink-0" style="'+
          (mk>=0?"background:var(--accent);color:var(--on-accent)":"background:var(--fill-hi);color:var(--t3)")+'">'+(mk>=0?(mk+1):"·")+'</span>'+
          '<span class="min-w-0 flex-1"><span class="block text-[13.5px] leading-snug truncate">'+esc(tk.text)+'</span>'+
          (sb?'<span class="block text-[11px] t3 mt-0.5">'+esc(sb.name)+'</span>':'')+'</span>'+
          (tk.due?dueChip(tk.due):'')+'</button>';
      }
      b+='</div><p class="text-[11.5px] t3 mt-3">'+sel.length+' de 3 elegidas</p>';
    }
  }
  else {
    var x=dayXP(d,tmap), st=stats(), sum=0;
    for(i=1;i<=7;i++) sum+=dayXP(addDays(d,-i),tmap);
    var avg=Math.round(sum/7), dif=x-avg;
    b+='<div class="rounded-[20px] p-6 mb-4 text-center" style="background:linear-gradient(150deg,var(--accent-soft),transparent);box-shadow:inset 0 0 0 1px var(--accent-line)">'+
       '<p class="eyebrow mb-1">XP de hoy</p>'+
       '<p class="display text-[46px] font-extrabold num leading-none" style="color:var(--accent)">'+x+'</p>'+
       '<p class="text-[12.5px] t2 mt-2 num">'+(avg?((dif>=0?"+":"")+dif+" respecto a tu media de 7 días ("+avg+")"):"aún no hay media con la que compararte")+'</p>'+
       (tripleDone(d)?'<span class="chip mt-3 inline-block" style="background:color-mix(in srgb,var(--good) 16%,transparent);color:var(--good)">×1.5 aplicado</span>':'')+
       '</div>';
    b+='<div class="grid grid-cols-2 gap-3 mb-4">'+
       '<div class="soft px-4 py-3"><p class="eyebrow mb-1">Racha</p><p class="display text-[19px] font-bold num">'+st.streak+'</p></div>'+
       '<div class="soft px-4 py-3"><p class="eyebrow mb-1">Nivel</p><p class="display text-[19px] font-bold">'+LVL_NAMES[Math.min(st.lvl,LVL_NAMES.length)-1]+'</p></div></div>';
    b+='<p class="text-[13.5px] t2 leading-relaxed mb-4">'+frasePar(x,avg)+'</p>';
    var sel2=(S.plan[tom]||[]);
    if(sel2.length){
      b+='<p class="eyebrow mb-2">Mañana te toca</p><div class="space-y-1">';
      for(i=0;i<sel2.length;i++){ var tt=taskById(sel2[i]); if(tt) b+='<div class="soft px-3.5 py-2.5 text-[13px]">'+esc(tt.text)+'</div>'; }
      b+='</div>';
    }
  }

  b+='<div class="flex items-center gap-2 mt-7">'+
     (parteStep>0?'<button class="btn btn-quiet" data-act="parte-prev">Atrás</button>'
                 :'<button class="btn btn-quiet" data-act="parte-close">Luego</button>')+
     '<button class="btn btn-primary flex-1" data-act="'+(parteStep>=4?"parte-done":"parte-next")+'">'+
     (parteStep>=4?"Terminar":"Siguiente")+'</button></div>';
  $("#parte-body").innerHTML=b;
}
function taskById(id){ for(var i=0;i<S.tasks.length;i++) if(S.tasks[i].id===id) return S.tasks[i]; return null; }

function render(){
  var L=S.labels;
  $$("[data-label]").forEach(function(e){ e.textContent = L[e.dataset.label]||e.textContent; });
  $$("[data-label-h]").forEach(function(e){ e.textContent = L[e.dataset.labelH]||e.textContent; });
  var bn=$("#brand-name"); if(bn) bn.textContent=L.app;
  var bs=$("#brand-sub");  if(bs) bs.textContent=L.sub;
  document.title=L.app;
  var n=diff(today(),S.profile.ebau), pasada=(!isNaN(n) && n<0);
  $("#rail-ebau").textContent=isNaN(n)?"—":(pasada?0:n);
  var rn=$("#rail-ebau-name"); if(rn) rn.textContent=S.profile.evento||"Cuenta atrás";
  $("#rail-ebau-date").textContent=S.profile.ebau?cap(fmt(S.profile.ebau,{day:"numeric",month:"long",year:"numeric"}))+(pasada?" · ya pasó":""):"Ponla en Ajustes";

  var st=stats();

  if(view==="resumen") rResumen(st);
  if(view==="retos") rRetos(st);
  if(view==="vital") rVital();
  if(view==="academico") rAcademico();
  if(view==="tareas") rTareas();
  if(view==="social") rSocial();
  if(parteOn) renderParte();
  if(diaAbierto && !$("#sheet").hidden) sheetDia(diaAbierto);
  fitBottomBar(); avisoGuardado();
  extrasTrasRender(st);
}

function rSocial(){
  var c=$("#social-col"); if(!c) return;
  pintaSocial(c);
}

function chRow(c,done,big,day){
  return '<div class="soft flex items-center gap-3 px-3.5 py-3 '+(done?"done":"")+'">'+
    '<button class="tick '+(big?"":"tick-sm")+'" data-act="ch" data-id="'+c.id+'" data-day="'+(day||today())+'" aria-label="Hecho">'+ICON_CHECK+'</button>'+
    '<button class="text-[13.5px] flex-1 min-w-0 leading-snug text-left" data-act="ch" data-id="'+c.id+'" data-day="'+(day||today())+'"><span class="strike">'+esc(c.text)+'</span></button>'+
    (done?'<span class="chip shrink-0" style="background:color-mix(in srgb,var(--good) 15%,transparent);color:var(--good)">+15</span>':'')+'</div>';
}

/* ════════ gráfica de la checklist ════════
   un punto por día con lo que cumpliste, y por encima una línea de puntos
   escalonada con los hábitos que tenías ese día: si añades o quitas, el
   techo cambia a partir de ahí y los días viejos siguen siendo verdad. */
function graficaHabitos(){
  var hoy=today(), ini=addDays(hoy,-29), p0=primerDia();
  if(p0>ini) ini=p0;
  var dias=[], d=ini, guard=0;
  while(d<=hoy && guard++<40){ dias.push(d); d=addDays(d,1); }
  var n=dias.length;
  if(n<2) return '<p class="text-[12.5px] t3 text-center py-2 leading-relaxed">En cuanto lleves dos días marcando, aquí sale la gráfica.</p>';

  var hechos=[], techos=[], max=1, i;
  for(i=0;i<n;i++){
    hechos.push(checksOf(dias[i]).length);
    techos.push(idealDe(dias[i]).length);
    if(techos[i]>max) max=techos[i];
    if(hechos[i]>max) max=hechos[i];
  }
  var W=320, H=116, L=20, R=7, T=10, B=17;
  function X(i){ return +(L + i*(W-L-R)/(n-1)).toFixed(1); }
  function Y(v){ return +(T + (1-v/max)*(H-T-B)).toFixed(1); }

  var techo="M "+X(0)+" "+Y(techos[0]);
  for(i=1;i<n;i++) techo+=" L "+X(i)+" "+Y(techos[i-1])+" L "+X(i)+" "+Y(techos[i]);

  var linea="M "+X(0)+" "+Y(hechos[0]), puntos="";
  for(i=1;i<n;i++) linea+=" L "+X(i)+" "+Y(hechos[i]);
  for(i=0;i<n;i++) puntos+='<circle cx="'+X(i)+'" cy="'+Y(hechos[i])+'" r="'+(n>22?1.5:2)+'" fill="var(--accent)"/>';
  var area=linea+" L "+X(n-1)+" "+Y(0)+" L "+X(0)+" "+Y(0)+" Z";

  function etq(f){ var p=f.split("-"); return (+p[2])+"/"+(+p[1]); }
  var hoyN=hechos[n-1];

  return '<div class="flex items-baseline justify-between mb-2">'+
      '<span class="text-[12px] t3">Últimos '+n+(n===1?" día":" días")+'</span>'+
      '<span class="text-[12px] t3 num">hoy '+hoyN+' de '+techos[n-1]+'</span></div>'+
    '<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto;display:block;overflow:visible" aria-hidden="true">'+
      '<line x1="'+L+'" y1="'+Y(0)+'" x2="'+(W-R)+'" y2="'+Y(0)+'" stroke="var(--hairline-2)" stroke-width="1" vector-effect="non-scaling-stroke"/>'+
      '<path d="'+area+'" fill="var(--accent)" opacity=".08"/>'+
      '<path d="'+techo+'" fill="none" stroke="var(--t3)" stroke-width="1.2" stroke-dasharray="3 3" opacity=".75" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>'+
      '<path d="'+linea+'" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>'+
      puntos+
      '<text x="'+(L-5)+'" y="'+(Y(max)+3)+'" text-anchor="end" font-size="8.5" fill="var(--t3)">'+max+'</text>'+
      '<text x="'+(L-5)+'" y="'+(Y(0)+3)+'" text-anchor="end" font-size="8.5" fill="var(--t3)">0</text>'+
      '<text x="'+L+'" y="'+(H-4)+'" font-size="8.5" fill="var(--t3)">'+etq(dias[0])+'</text>'+
      '<text x="'+(W-R)+'" y="'+(H-4)+'" text-anchor="end" font-size="8.5" fill="var(--t3)">'+etq(dias[n-1])+'</text>'+
    '</svg>'+
    '<div class="flex items-start justify-between gap-3 mt-2">'+
      '<p class="text-[11px] t3 leading-relaxed flex-1">La línea de puntos son los hábitos que tenías ese día. Sube cuando añades uno y baja cuando archivas otro.</p>'+
      '<button class="btn btn-quiet shrink-0 !px-3 !py-1.5 !text-[11.5px]" data-act="compartir">Compartir</button></div>';
}

function rResumen(st){
  var hh=new Date().getHours(), t=today();
  var sal=TEXTOS.saludos, g=hh<6?sal.madrugada:hh<13?sal.manana:hh<21?sal.tarde:sal.noche;
  $("#hero-date").textContent=cap(fmt(t,{weekday:"long",day:"numeric",month:"long"}));
  $("#hero-greet").textContent=g+(S.profile.name?", "+S.profile.name:"");
  var pend=S.tasks.filter(function(x){return !x.done}).length, nx=future()[0];
  $("#hero-sub").textContent=(pend===0?"No te queda nada pendiente.":pend===1?"Tienes 1 tarea pendiente.":"Tienes "+pend+" tareas pendientes.")
    +(nx?" El próximo examen es en "+diff(t,nx.date)+" días.":"");
  var p=progress(), c=2*Math.PI*34;
  $("#ring").setAttribute("stroke-dasharray",c.toFixed(1));
  $("#ring").setAttribute("stroke-dashoffset",(c*(1-p/100)).toFixed(1));
  $("#ring-pct").textContent=p+"%";
  $("#ring-note").textContent=p>=85?TEXTOS.anillo.alto:p>=50?TEXTOS.anillo.medio:TEXTOS.anillo.bajo;

  var ej=$("#ejemplos");
  if(ej) ej.innerHTML = S.ejemplos ? ('<div class="glass rounded-[20px] px-5 py-4 mb-4 lg:mb-5 flex items-center gap-4 flex-wrap">'+
    '<div class="min-w-0 flex-1"><p class="text-[13px] font-semibold leading-snug">Hay un par de ejemplos puestos</p>'+
    '<p class="text-[12px] t3 mt-0.5 leading-snug">Para que veas cómo queda con cosas dentro. Bórralos cuando quieras.</p></div>'+
    '<button class="btn btn-quiet !py-2 !px-3.5 !text-[12px] shrink-0" data-act="borrar-ejemplos">Borrar ejemplos</button></div>') : "";

  /* botón del parte + las 3 del día */
  var hechoHoy=!!(S.parte&&S.parte[t]), hh2=new Date().getHours();
  $("#parte-btn-t").textContent = hechoHoy ? "Parte del día hecho · revisar" : "Parte del día";
  $("#parte-btn").className = "btn "+(hechoHoy?"btn-quiet":"btn-primary");

  var hoy3=(S.plan&&S.plan[t])||[], vivas=[];
  for(var q=0;q<hoy3.length;q++){ var tq=taskById(hoy3[q]); if(tq) vivas.push(tq); }
  $("#plan3").innerHTML = vivas.length ? ('<div class="glass rounded-[24px] pad mb-4 lg:mb-5">'+
    '<div class="flex items-center justify-between mb-5"><div>'+
      '<h2 class="display text-[17px] font-bold">Las 3 de hoy</h2>'+
      '<p class="text-[12.5px] t3 mt-0.5">Tú mismo las elegiste anoche. Ahí lo dejo.</p></div>'+
      '<button class="btn btn-quiet !px-3.5 !py-2 !text-[12px]" data-act="plan-clear">Quitar</button></div>'+
    '<div class="space-y-1.5">'+vivas.map(function(tk,ix){
      var sb=subj(tk.subject);
      return '<div class="soft flex items-center gap-3 px-3.5 py-3 '+(tk.done?"done":"")+'">'+
        '<span class="w-6 h-6 rounded-full grid place-items-center text-[11px] num font-bold shrink-0" style="background:var(--accent);color:var(--on-accent)">'+(ix+1)+'</span>'+
        '<button class="tick tick-sm" data-act="toggle" data-id="'+tk.id+'" aria-label="Marcar">'+ICON_CHECK+'</button>'+
        '<span class="text-[13.5px] flex-1 min-w-0 leading-snug"><span class="strike">'+esc(tk.text)+'</span></span>'+

        '</div>'; }).join("")+'</div></div>') : "";

  var dPau=diff(t,S.profile.ebau); if(!isNaN(dPau) && dPau<0) dPau=0;
  var K=[{v:st.lvl,l:"Nivel",c:"var(--accent)"},
         {v:st.streak,l:"Días de racha",c:"var(--warn)",ic:ICON_LLAMA},
         {v:chOf(t).length+" / "+todaysChallenges(t).length,l:"Retos de hoy",c:"var(--good)"},
         {v:isNaN(dPau)?"—":dPau,l:"Días para "+(S.profile.evento||"el día"),c:"var(--gold)"}];
  $("#kpis").innerHTML=K.map(function(k){
    return '<div class="glass glass-hover rounded-[24px] p-5 lg:p-6 flex flex-col justify-between min-h-[124px]">'+
      '<div class="display text-[34px] lg:text-[40px] font-extrabold num leading-none" style="color:'+k.c+'">'+k.v+'</div>'+
      '<div class="text-[12px] t3 mt-3" style="color:'+(k.ic?k.c:'')+'"><span class="t3">'+k.l+'</span>'+(k.ic||"")+'</div></div>'; }).join("");

  var ck=checksOf(t), items=ordenIdeal(idealActivos());
  $("#ideal-sub").textContent = items.length ? ck.length+" de "+items.length+" hechas" : "Aún no has escrito tus hábitos";
  $("#ideal-bar").style.width=(items.length? ck.length/items.length*100:0)+"%";
  $("#ideal-list").innerHTML = items.length ? items.map(function(it){
    var on=ck.indexOf(it.id)>=0;
    return '<div class="flex items-center gap-3 py-2 '+(on?"done":"")+'">'+
      '<button class="tick tick-sm" data-act="check" data-id="'+it.id+'" data-day="'+t+'" aria-label="Marcar">'+ICON_CHECK+'</button>'+
      (it.time?'<span class="num text-[11.5px] t3 w-[42px] shrink-0">'+esc(it.time)+'</span>':'')+
      '<span class="w-1.5 h-1.5 rounded-full shrink-0" style="background:'+(TAGV[it.tag]||"var(--accent)")+'"></span>'+
      '<button class="text-[13.5px] flex-1 min-w-0 text-left" data-act="check" data-id="'+it.id+'" data-day="'+t+'"><span class="strike">'+esc(it.text)+'</span></button>'+
      (on?'<span class="chip shrink-0" style="background:color-mix(in srgb,var(--accent) 14%,transparent);color:var(--accent)">+4</span>':'')+'</div>';
  }).join("") : '<p class="text-[13.5px] t3 py-6 text-center">Pulsa «Editar» y escribe los pasos de tu día.</p>';
  var _gf=$("#ideal-graf"); if(_gf) _gf.innerHTML=graficaHabitos();

  var mc=todaysChallenges(t), md=chOf(t);
  $("#mini-challenges").innerHTML = mc.length? mc.map(function(x){ return chRow(x, md.indexOf(x.id)>=0, false, t); }).join("")
    : '<p class="text-[13.5px] t3 py-4 text-center">No tienes retos en la lista.</p>';

  var nx1=future()[0];
  $("#next-exam").innerHTML = nx1 ? (function(e){
    var sb=subj(e.subject), d=diff(t,e.date), df=DIFFL[e.diff]||DIFFL.media;
    var tone=d<=3?"var(--alert)":d<=7?"var(--warn)":"var(--t1)";
    return '<div class="glass importante glass-hover rounded-[24px] pad flex flex-col cursor-pointer" data-jump="academico">'+
      '<div class="flex items-center justify-between mb-6"><span class="eyebrow">Próximo: '+tipoL(e)+'</span>'+
      '<span class="chip" style="background:color-mix(in srgb,'+df.c+' 14%,transparent);color:'+df.c+'">'+df.l+'</span></div>'+
      '<div class="flex items-baseline gap-2.5"><span class="display text-[60px] font-extrabold num leading-[.85]" style="color:'+tone+'">'+d+'</span>'+
      '<span class="text-[14px] t3">'+(d===0?"hoy":d===1?"día":"días")+'</span></div>'+
      '<p class="display text-[18px] font-bold mt-4 leading-tight">'+esc(e.title)+'</p>'+
      '<div class="flex items-center gap-2 mt-2.5"><span class="w-2 h-2 rounded-full" style="background:'+(sb?sb.color:"var(--t3)")+'"></span>'+
      '<span class="text-[13px] t2">'+esc(sb?sb.name:"—")+'</span></div>'+temasResumen(e)+'</div>';
  })(nx1) : '<div class="glass rounded-[24px] pad grid place-items-center text-center"><div>'+
      '<p class="display text-[18px] font-bold mb-2">Sin exámenes</p>'+
      '<button class="btn btn-quiet mt-2" data-act="new-exam">Apuntar uno</button></div></div>';

  var di=dayIdx();
  $("#today-name").textContent=di<0?"Fin de semana":DAYS[di]+" · "+dayRange(di);
  var box=$("#today-schedule");
  if(di<0){ box.innerHTML='<p class="text-[13.5px] t3 py-10 text-center">Sin clases.</p>'; }
  else{
    var rows="", sl=slotsFor(di);
    for(var s=0;s<sl.length;s++){
      if(sl[s].r){ rows+='<div class="flex items-center gap-3 py-2 px-1"><span class="num text-[11.5px] t3 w-[44px]">'+sl[s].t+'</span>'+
        '<span class="flex-1 h-px" style="background:var(--hairline-2)"></span><span class="text-[11px] t3">Recreo</span></div>'; continue; }
      var cel=cellOf(di+"-"+sl[s].ci), sb2=cel?subj(cel.sid):null, live=isNow(sl[s]);
      rows+='<div class="flex items-center gap-3.5 rounded-[14px] px-3 py-2.5" style="'+(live?"background:var(--accent-soft)":"")+'">'+
        '<span class="num text-[11.5px] t3 w-[44px]">'+sl[s].t+'</span>'+
        '<span class="w-1.5 h-1.5 rounded-full shrink-0" style="background:'+(sb2?sb2.color:"var(--hairline)")+'"></span>'+
        '<span class="min-w-0 flex-1"><span class="block text-[13.5px] '+(sb2?"":"t3")+' truncate '+(live?"font-semibold":"")+'">'+(sb2?esc(sb2.name):"Libre")+'</span>'+
        ((cel&&(cel.room||cel.note))?'<span class="block text-[11px] t3 truncate">'+esc([cel.room,cel.note].filter(Boolean).join(" · "))+'</span>':'')+'</span>'+
        (live?'<span class="chip" style="background:var(--accent);color:var(--on-accent)">ahora</span>':'')+'</div>';
    }
    box.innerHTML=rows;
  }
  var pl=sortTasks(S.tasks.filter(function(x){return !x.done})).slice(0,5);
  $("#today-tasks").innerHTML=pl.length? pl.map(function(t2){
    return '<div class="flex items-center gap-3">'+
      '<button class="tick" data-act="toggle" data-id="'+t2.id+'" aria-label="Completar">'+ICON_CHECK+'</button>'+
      '<span class="w-1.5 h-1.5 rounded-full shrink-0" style="background:'+catOf(t2.cat).color+'"></span>'+
      '<span class="text-[13.5px] truncate flex-1">'+esc(t2.text)+'</span>'+dueChip(t2.due)+'</div>';
  }).join("") : '<p class="text-[13.5px] t3 py-6 text-center">Todo hecho.</p>';
}
function isNow(sl){ var d=new Date(), m=d.getHours()*60+d.getMinutes();
  function q(x){var p=x.split(":");return +p[0]*60 + +p[1];} return m>=q(sl.t)&&m<q(sl.e); }

var medalsOpen=false;
function fitMedals(){
  var wrap=$("#medals-wrap"), list=$("#medals"), btn=$("#medals-more"), fade=$("#medals-fade"), left=$("#retos-left");
  if(!wrap||!list||!btn) return;
  var full=list.scrollHeight;
  var wt=wrap.getBoundingClientRect().top + (window.scrollY||0);
  var vis=(window.innerHeight||800) - (wt - (window.scrollY||0));
  var limit=Math.max(300, Math.round(vis-104));
  if(window.innerWidth<1024) limit=Math.max(300, Math.round((window.innerHeight||800)*0.62));
  if(full<=limit+20){ wrap.style.maxHeight="none"; btn.hidden=true; if(fade) fade.hidden=true; return; }
  btn.hidden=false;
  wrap.style.maxHeight=(medalsOpen? full : limit)+"px";
  if(fade) fade.hidden=medalsOpen;
  btn.textContent = medalsOpen? "Ver menos" : "Ver los "+MEDALS.length+" logros";
}
function rRetos(st){
  $("#lvl-num").textContent=st.lvl;
  $("#lvl-name").textContent=LVL_NAMES[Math.min(st.lvl-1,LVL_NAMES.length-1)];
  $("#lvl-xp").innerHTML=st.xp+" XP en total"+(st.medXP?' <span class="t3">· '+st.medXP+' de logros</span>':'');
  var into=st.xp-st.lvlFloor, pc=clamp(into/st.lvlNeed*100,0,100);
  $("#lvl-bar").style.width=pc+"%"; $("#lvl-pct").textContent=Math.round(pc)+"%";
  $("#lvl-next").textContent = st.lvl>=LVL_NAMES.length
    ? "Has llegado al final. Ya no hay nada por encima."
    : "Faltan "+Math.max(0,st.lvlNeed-into)+" XP para "+LVL_NAMES[st.lvl];
  if(st.lvl>=LVL_NAMES.length){ $("#lvl-bar").style.width="100%"; $("#lvl-pct").textContent="100%"; }
  $("#st-streak").textContent=st.streak; $("#st-best").textContent=st.best;
  $("#st-ch").textContent=st.ch; $("#st-med").textContent=st.med;

  var t=curDay(), mc=todaysChallenges(t), md=chOf(t);
  $("#retos-daybar").innerHTML=dayBar();
  var triple = mc.length && md.length>=mc.length;
  $("#ch-title").textContent = (t===today())? "Los tres de hoy" : "Los tres de ese día";
  $("#today-challenges").innerHTML = (mc.length? mc.map(function(x){ return chRow(x, md.indexOf(x.id)>=0, true, t); }).join("")
    : '<p class="text-[13.5px] t3 py-6 text-center">Tu lista de retos está vacía. Pulsa «Mis retos» para añadir.</p>')+
    (mc.length? '<div class="bonus-x'+(triple?'':' bx-off')+' mt-4 rounded-[18px] px-4 py-3.5 flex items-center gap-3" style="'+
      (triple?"background:linear-gradient(145deg,var(--good),color-mix(in srgb,var(--good) 70%,var(--cyan)));"+
              "box-shadow:0 10px 26px -10px color-mix(in srgb,var(--good) 60%,transparent);transition:all .4s var(--spring)"
             :"background:var(--fill);box-shadow:inset 0 0 0 1px var(--hairline);transition:all .4s var(--spring)")+'">'+
      '<span class="display text-[19px] font-extrabold num shrink-0" style="color:'+(triple?"var(--on-accent)":"var(--t3)")+'">×1,5</span>'+
      '<span class="text-[12.5px] leading-snug" style="color:'+(triple?"color-mix(in srgb,var(--on-accent) 88%,transparent)":"var(--t3)")+'">'+
      (triple?"Los tres hechos: todo lo que sumes este día va multiplicado por 1,5.":"a todo el XP del día si haces los tres")+
      '</span></div>' : '');

  var ck=checksOf(t), items=ordenIdeal(idealActivos());
  var cl=$("#retos-checklist");
  if(cl){
    $("#retos-cl-sub").textContent = items.length? ck.length+" de "+items.length+" hechas" : "Sin pasos";
    cl.innerHTML = items.length? items.map(function(it){
      var on=ck.indexOf(it.id)>=0;
      return '<div class="flex items-center gap-3 py-2 '+(on?"done":"")+'">'+
        '<button class="tick tick-sm" data-act="check" data-id="'+it.id+'" data-day="'+t+'" aria-label="Marcar">'+ICON_CHECK+'</button>'+
        (it.time?'<span class="num text-[11.5px] t3 w-[42px] shrink-0">'+esc(it.time)+'</span>':'')+
        '<span class="w-1.5 h-1.5 rounded-full shrink-0" style="background:'+(TAGV[it.tag]||"var(--accent)")+'"></span>'+
        '<button class="text-[13.5px] flex-1 min-w-0 text-left" data-act="check" data-id="'+it.id+'" data-day="'+t+'"><span class="strike">'+esc(it.text)+'</span></button>'+
        (on?'<span class="chip shrink-0" style="background:color-mix(in srgb,var(--accent) 14%,transparent);color:var(--accent)">+4</span>':'')+'</div>';
    }).join("") : '<p class="text-[13px] t3 py-4 text-center">Sin pasos todavía.</p>';
  }

  renderMes();
  renderAnio();

  $("#med-count").textContent=st.med+" / "+MEDALS.length;
  $("#medals").innerHTML=MEDALS.map(function(m){
    var on=m.f(st);
    return '<div class="medal '+(on?"on":"")+' flex items-center gap-3 px-3 py-2.5 rounded-[12px]" style="'+
      (on?"background:color-mix(in srgb,var(--gold) 12%,transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--gold) 28%,transparent)"
         :"background:var(--fill);box-shadow:inset 0 0 0 1px var(--hairline-2)")+'">'+
      '<span class="w-8 h-8 rounded-full grid place-items-center shrink-0" style="'+
        (on?"background:linear-gradient(145deg,var(--gold),color-mix(in srgb,var(--gold) 60%,var(--warn)));color:#fff"
           :"background:var(--fill-hi);color:var(--t3)")+'">'+
        (on?'<svg viewBox="0 0 24 24" class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="5"/><path d="M8.5 13.5L7 21l5-2.5L17 21l-1.5-7.5"/></svg>':ICON_LOCK)+'</span>'+
      '<span class="min-w-0 flex-1"><span class="block text-[12.5px] font-semibold leading-tight '+(on?"":"t2")+'">'+esc(m.n)+'</span>'+
      '<span class="block text-[11px] t3 leading-tight mt-0.5">'+esc(m.d)+'</span>'+(!on&&typeof medProg==="function"?medProg(m,st):'')+'</span>'+
      (on&&m.xp?'<span class="chip shrink-0" style="background:color-mix(in srgb,var(--gold) 20%,transparent);color:var(--gold)">+'+m.xp+'</span>':'')+'</div>';
  }).join("");
  requestAnimationFrame(fitMedals);
}

/* ════════ medidores de salud: vaso de agua, luna y reloj de arena ════════ */
var MED={}, medRAF=0, medUlt=0, MCOL=null, medIdle=false;

function medQuieto(){ try{ return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }catch(e){ return false; } }
function hexA(h,a){
  h=(h||"").trim();
  if(h.charAt(0)!=="#") return h;
  if(h.length===4) h="#"+h[1]+h[1]+h[2]+h[2]+h[3]+h[3];
  if(h.length<7) return h;
  return "rgba("+parseInt(h.substr(1,2),16)+","+parseInt(h.substr(3,2),16)+","+parseInt(h.substr(5,2),16)+","+a+")";
}
function mixHex(a,b,t){
  if(a.charAt(0)!=="#"||b.charAt(0)!=="#") return a;
  function p(h,i){ return parseInt(h.substr(i,2),16); }
  function d(n){ n=Math.round(n); return (n<16?"0":"")+n.toString(16); }
  return "#"+d(p(a,1)+(p(b,1)-p(a,1))*t)+d(p(a,3)+(p(b,3)-p(a,3))*t)+d(p(a,5)+(p(b,5)-p(a,5))*t);
}
function medCol(){
  var cs=getComputedStyle(document.documentElement);
  function v(n,f){ var x=cs.getPropertyValue(n); return (x&&x.trim())||f; }
  return { cyan:v("--cyan","#0b8fa8"), violet:v("--violet","#7c5cd6"), good:v("--good","#0f9d58"),
           warn:v("--warn","#c2740b"), alert:v("--alert","#d64545"), acc:v("--accent","#4f46e5"),
           fill:v("--fill","rgba(0,0,0,.055)"), fillHi:v("--fill-hi","rgba(0,0,0,.095)"),
           line:v("--hairline","rgba(0,0,0,.08)"), line2:v("--hairline-2","rgba(0,0,0,.05)"),
           spec:v("--spec","rgba(255,255,255,.9)"), bg:v("--bg","#f4f4f7"),
           t2:v("--t2","#55555f"), t3:v("--t3","#8a8a95") };
}
function medRepinta(){ MCOL=null; for(var k in MED) MED[k].dirty=true; medDespierta(); }

function medidor(k){
  var el=document.getElementById("mg-"+k);
  if(!el) return null;
  var m=MED[k];
  if(!m || m.el!==el){
    m=MED[k]={ k:k, el:el, val:0, mos:0, ola:0, f1:Math.random()*6.3, f2:Math.random()*6.3,
               tic:0, meta:false, gotas:[], t:Math.random()*400, dirty:true, primera:true };
  }
  return m;
}
function medPone(m,val,meta){
  if(!m) return;
  var dif=val-m.val;
  m.val=val; m.meta=!!meta;
  if(Math.abs(dif)>0.001 && !m.primera) m.ola=Math.min(1.25, m.ola+Math.min(1, 0.45+Math.abs(dif)*3.4));
  m.dirty=true;
}
function medSync(h,hecho){
  var vasos=h.water||0, hs=h.sleep||0, sc=h.screen;
  var a=medidor("agua");     if(a){ medPone(a, clamp(vasos/8,0,1), vasos>=8); }
  var s=medidor("sueno");    if(s){ medPone(s, clamp(hs/7,0,1), hs>=7); }
  var p=medidor("pantalla"); if(p){ p.horas=sc||0; p.nulo=(sc==null); medPone(p, clamp((sc||0)/6,0,1), (sc!=null && sc<=2)); }
  for(var k in MED){ MED[k].primera=false; }
  medDespierta();
}
function medDespierta(){ medIdle=false; if(!medRAF){ medUlt=0; medRAF=requestAnimationFrame(medBucle); } }
function medBucle(ts){
  medRAF=0;
  var dt=medUlt? Math.min(48, ts-medUlt) : 16;
  if(medIdle && dt<30){ medRAF=requestAnimationFrame(medBucle); return; }  /* en reposo basta con 30 fps */
  medUlt=ts;
  if(!MCOL) MCOL=medCol();
  var vivo=false, fuerte=false, quieto=medQuieto();
  for(var k in MED){ var r=medPinta(MED[k], dt, quieto); if(r){ vivo=true; if(r===2) fuerte=true; } }
  medIdle=!fuerte;
  if(vivo) medRAF=requestAnimationFrame(medBucle); else medIdle=false;
}

function medPinta(m, dt, quieto){
  var el=m.el;
  if(!el || !el.isConnected || !el.offsetParent || document.hidden) return false;
  var dpr=Math.min(3, window.devicePixelRatio||1), W=64, H=64;
  if(el.width!==Math.round(W*dpr)){ el.width=Math.round(W*dpr); el.height=Math.round(H*dpr); m.dirty=true; }
  var x=el.getContext("2d"); if(!x) return false;
  x.setTransform(dpr,0,0,dpr,0,0);
  x.clearRect(0,0,W,H);

  var k=dt/16.67;
  if(quieto){ m.mos=m.val; m.ola=0; m.tic=m.meta?1:0; }
  else{
    m.t+=dt;
    var dif=m.val-m.mos;
    m.mos += dif*Math.min(1, 0.14*k);
    if(Math.abs(dif)<0.0015) m.mos=m.val;
    m.ola *= Math.pow(0.938, k);
    if(m.ola<0.012) m.ola=0;
    m.f1 += 0.055*k; m.f2 += 0.037*k;
    var tv=dt/1250;                                   /* el tic tarda 1,25 s en dibujarse */
    if(m.meta){ if(m.tic<1) m.tic=Math.min(1, m.tic+tv); }
    else      { if(m.tic>0) m.tic=Math.max(0, m.tic-tv*1.7); }
  }
  var tc=m.tic<=0?0:m.tic>=1?1:(m.tic<0.5? 2*m.tic*m.tic : 1-Math.pow(-2*m.tic+2,2)/2);
  var calma=1-tc;

  x.save();
  x.globalAlpha = 1 - 0.18*tc;
  if(m.k==="agua")     medAgua(x,m,calma,quieto,k);
  if(m.k==="sueno")    medLuna(x,m,calma,quieto,k);
  if(m.k==="pantalla") medArena(x,m,calma,quieto,k);
  x.restore();
  if(tc>0) medTic(x,m,tc);

  var moviendo = !quieto && (m.mos!==m.val || m.ola>0 || (m.meta?m.tic<1:m.tic>0) || m.gotas.length>0);
  var latiendo  = !quieto && !m.meta && m.tic===0 && m.mos>0.02;   /* oleaje / zzz de fondo */
  m.dirty=false;
  return moviendo?2:latiendo?1:0;
}

/* Todo se dibuja con el mismo lenguaje que el resto de la app:
   línea fina, relleno muy tenue y nada de colorines ni brillos. */
function medTrazo(){ return hexA(MCOL.t3,.6); }

/* ── vaso: boca elíptica, cuerpo ligeramente cónico y base redondeada ── */
var VT=14, VB=56;
function ladoVaso(x,cerrar){
  x.moveTo(15,VT);
  x.lineTo(18.6,VB-6);
  x.quadraticCurveTo(19.1,VB,24.4,VB);
  x.lineTo(39.6,VB);
  x.quadraticCurveTo(44.9,VB,45.4,VB-6);
  x.lineTo(49,VT);
  if(cerrar) x.closePath();
}
function pathVaso(x){ x.beginPath(); ladoVaso(x,true); }
function medAgua(x,m,calma,quieto,k){
  var c=MCOL, tono=mixHex(c.cyan,c.good,1-calma);
  var nivel=clamp(m.mos,0,1);
  var y=VB-2-(VB-VT-4)*0.875*nivel;   /* lleno = hasta donde llegaba el séptimo vaso */
  var amp=(2.0*m.ola+(m.meta?0:0.45))*calma;

  x.save(); pathVaso(x); x.clip();
  if(nivel>0.004){
    var px,yy;
    x.fillStyle=hexA(tono,.19);
    x.beginPath();
    for(px=10;px<=54;px+=2){
      yy=y+Math.sin(px*0.17+m.f1)*amp+Math.sin(px*0.094-m.f2)*amp*0.6;
      if(px===10) x.moveTo(px,yy); else x.lineTo(px,yy);
    }
    x.lineTo(54,VB+4); x.lineTo(10,VB+4); x.closePath(); x.fill();
    x.strokeStyle=hexA(tono,.5); x.lineWidth=1.3; x.beginPath();
    for(px=10;px<=54;px+=2){
      yy=y+Math.sin(px*0.17+m.f1)*amp+Math.sin(px*0.094-m.f2)*amp*0.6;
      if(px===10) x.moveTo(px,yy); else x.lineTo(px,yy);
    }
    x.stroke();
  }
  x.restore();

  x.beginPath(); ladoVaso(x,false);
  x.strokeStyle=m.meta?hexA(c.good,.6):medTrazo(); x.lineWidth=1.4; x.lineJoin="round"; x.stroke();
  x.strokeStyle=hexA(m.meta?c.good:c.t3,.26); x.lineWidth=1.2;
  x.beginPath(); x.ellipse(32,VT,17,3.6,0,Math.PI,0); x.stroke();
  x.strokeStyle=m.meta?hexA(c.good,.6):medTrazo(); x.lineWidth=1.4;
  x.beginPath(); x.ellipse(32,VT,17,3.6,0,0,Math.PI); x.stroke();
}

/* ── luna ───────────────────────────────────────────────────── */
function medLuna(x,m,calma,quieto,k){
  var c=MCOL, cx=32, cy=33, r=17, p=clamp(m.mos,0,1);
  var tono=c.violet;

  if(p>0.006){
    x.save();
    x.beginPath(); x.arc(cx,cy,r,0,6.2832); x.clip();
    x.fillStyle=hexA(tono,.26);
    x.beginPath(); x.arc(cx,cy,r,-Math.PI/2,Math.PI/2); x.closePath();
    if(p>=0.5) x.ellipse(cx,cy,r*(2*p-1),r,0,0,6.2832);
    x.fill();
    if(p<0.5){
      x.globalCompositeOperation="destination-out";
      x.fillStyle="#000"; x.beginPath(); x.ellipse(cx,cy,r*(1-2*p),r,0,0,6.2832); x.fill();
      x.globalCompositeOperation="source-over";
    }
    x.restore();
    /* el filo iluminado, muy fino */
    x.save();
    x.strokeStyle=hexA(tono,.55); x.lineWidth=1.2;
    x.beginPath(); x.arc(cx,cy,r,-Math.PI/2,Math.PI/2); x.stroke();
    var rx=r*Math.abs(1-2*p);
    x.beginPath();
    if(rx>0.6) x.ellipse(cx,cy,rx,r,0,-Math.PI/2,Math.PI/2,p>=0.5);
    else { x.moveTo(cx,cy-r); x.lineTo(cx,cy+r); }   /* media luna justa: el filo es recto, pero sigue estando */
    x.stroke();
    x.restore();
  } else {
    /* sin registrar: una media luna tenue, para que se entienda qué es */
    x.save();
    x.fillStyle=hexA(tono,.14); x.strokeStyle=hexA(tono,.4); x.lineWidth=1.2;
    x.beginPath(); x.arc(cx,cy,r-3,-Math.PI/2,Math.PI/2); x.ellipse(cx,cy,(r-3)*.45,r-3,0,Math.PI/2,-Math.PI/2,true); x.closePath();
    x.fill(); x.stroke(); x.restore();
  }
  x.strokeStyle=m.meta?hexA(c.violet,.6):medTrazo(); x.lineWidth=1.4;
  x.beginPath(); x.arc(cx,cy,r,0,6.2832); x.stroke();

  if(m.meta && m.tic>0.12) m.gotas.length=0;
  if(!quieto){
    if(!m.meta && m.tic===0 && m.mos>0.03 && Math.random()<0.012*k) m.gotas.push({x:cx+r-4,y:cy-r+3,v:0.15+Math.random()*0.06,e:0});
    for(var j=m.gotas.length-1;j>=0;j--){
      var z=m.gotas[j]; z.e+=0.011*k; z.y-=z.v*k; z.x+=0.085*k;
      if(z.e>=1){ m.gotas.splice(j,1); continue; }
      var al=(z.e<0.22? z.e/0.22 : 1-(z.e-0.22)/0.78)*calma;
      var t2=2.8+z.e*2.8;
      x.save(); x.globalAlpha=Math.max(0,al)*.75;
      x.strokeStyle=tono; x.lineWidth=1.2; x.lineCap="round"; x.lineJoin="round";
      x.beginPath(); x.moveTo(z.x-t2/2,z.y-t2/2); x.lineTo(z.x+t2/2,z.y-t2/2); x.lineTo(z.x-t2/2,z.y+t2/2); x.lineTo(z.x+t2/2,z.y+t2/2);
      x.stroke(); x.restore();
    }
  }
}

/* ── reloj de arena: panzas curvas, cuello estrecho y marco ── */
var AT=10, AN=32, AB=54, IZ=16, DE=48, CU=2.1;
function pathReloj(x){
  x.beginPath();
  x.moveTo(IZ,AT);
  x.bezierCurveTo(IZ,AT+11, 32-CU,AN-8, 32-CU,AN);
  x.bezierCurveTo(32-CU,AN+8, IZ,AB-11, IZ,AB);
  x.lineTo(DE,AB);
  x.bezierCurveTo(DE,AB-11, 32+CU,AN+8, 32+CU,AN);
  x.bezierCurveTo(32+CU,AN-8, DE,AT+11, DE,AT);
  x.closePath();
}
function medArena(x,m,calma,quieto,k){
  var c=MCOL, h=m.horas||0;
  var tono=m.nulo? c.t3 : h<=2? c.good : h<=4? c.warn : c.alert;
  var p=clamp(m.mos,0,1), queda=1-p, HT=AN-AT-2;
  var niv=AB-(AB-AN-2)*Math.min(1,p), cono=5*Math.min(1,p*1.6);

  x.save(); pathReloj(x); x.clip();
  if(queda>0.004){
    var hs=HT*Math.sqrt(queda), ys=AN-hs;
    x.fillStyle=hexA(tono,.24);
    x.beginPath(); x.moveTo(0,ys); x.quadraticCurveTo(32,ys+2.8,64,ys); x.lineTo(64,AN+1); x.lineTo(0,AN+1); x.closePath(); x.fill();
    x.strokeStyle=hexA(tono,.42); x.lineWidth=1.2;
    x.beginPath(); x.moveTo(IZ-2,ys); x.quadraticCurveTo(32,ys+2.8,DE+2,ys); x.stroke();
  }
  /* el chorro: se corta justo donde empieza el montón */
  if(!quieto && (m.mos!==m.val||m.ola>0.05) && queda>0.01){
    var fin = p>0.004 ? Math.min(niv-cono+0.5, AB-2) : AB-2;
    if(fin>AN+2){
      x.strokeStyle=hexA(tono,.5); x.lineWidth=1.2; x.lineCap="round";
      x.beginPath(); x.moveTo(32,AN+1); x.lineTo(32,fin); x.stroke();
    }
  }
  if(p>0.004){
    x.fillStyle=hexA(tono,.24);
    x.beginPath(); x.moveTo(0,niv); x.lineTo(32-11,niv);
    x.quadraticCurveTo(32,niv-cono,32+11,niv); x.lineTo(64,niv);
    x.lineTo(64,AB+1); x.lineTo(0,AB+1); x.closePath(); x.fill();
  }
  x.restore();

  var tz=m.meta?hexA(c.good,.6):medTrazo();
  x.strokeStyle=tz; x.lineWidth=1.4; x.lineJoin="round"; x.lineCap="round";
  pathReloj(x); x.stroke();
  x.beginPath(); x.moveTo(IZ-4,AT); x.lineTo(DE+4,AT); x.stroke();
  x.beginPath(); x.moveTo(IZ-4,AB); x.lineTo(DE+4,AB); x.stroke();
  x.strokeStyle=hexA(m.meta?c.good:c.t3,.3); x.lineWidth=1.2;
  x.beginPath(); x.moveTo(IZ-2.5,AT); x.lineTo(IZ-2.5,AB); x.stroke();
  x.beginPath(); x.moveTo(DE+2.5,AT); x.lineTo(DE+2.5,AB); x.stroke();
}

/* ── tic: pequeño, fino y dibujado despacio ─────────────────── */
function medTic(x,m,t){
  var c=MCOL, col=(m.k==="sueno")? c.violet : c.good;
  var reloj=(m.k==="pantalla"), es=reloj?0.78:1, dy=reloj?13.5:0;
  function P(px,py){ return [32+(px-32)*es, 33+(py-33)*es+dy]; }
  x.save();
  x.globalAlpha=Math.min(1,t*1.5);
  x.strokeStyle=col; x.lineWidth=reloj?1.7:2; x.lineCap="round"; x.lineJoin="round";
  var a=P(26.6,33.4), b=P(30.6,37.4), d=P(38.1,28.2);
  var l1=Math.hypot(b[0]-a[0],b[1]-a[1]), l2=Math.hypot(d[0]-b[0],d[1]-b[1]), tot=l1+l2, av=t*tot;
  x.beginPath(); x.moveTo(a[0],a[1]);
  if(av<=l1) x.lineTo(a[0]+(b[0]-a[0])*(av/l1), a[1]+(b[1]-a[1])*(av/l1));
  else{ var f=(av-l1)/l2; x.lineTo(b[0],b[1]); x.lineTo(b[0]+(d[0]-b[0])*f, b[1]+(d[1]-b[1])*f); }
  x.stroke(); x.restore();
}
/* ════════ compartir el progreso como imagen ════════
   se dibuja en un lienzo y se pasa al menú de compartir del móvil.
   Todo va en el mismo gesto del dedo: iOS no deja compartir si no. */
function compartirProgreso(){
  var cs=getComputedStyle(document.documentElement);
  function v(n,f){ var q=cs.getPropertyValue(n); return (q&&q.trim())||f; }
  var BG=v("--bg","#f4f4f7"), T1=v("--t1","#14141a"), T3=v("--t3","#8a8a95"),
      AC=v("--accent","#4f46e5"), WA=v("--warn","#c2740b"), FI=v("--fill-hi","#e8e8ee");
  var W=1080, H=1350, c=document.createElement("canvas");
  c.width=W; c.height=H;
  var x=c.getContext("2d"); if(!x) return;
  x.fillStyle=BG; x.fillRect(0,0,W,H);

  var st=stats(), M=90, tm=tasksByDay(), hoy=today();
  var disp='"Plus Jakarta Sans",-apple-system,sans-serif', texto='Inter,-apple-system,sans-serif';

  x.fillStyle=T1; x.font="800 44px "+disp;
  x.fillText(S.labels.app||"Peak.", M, M+40);
  x.fillStyle=T3; x.font="400 26px "+texto;
  x.fillText(cap(fmt(hoy,{day:"numeric",month:"long",year:"numeric"})), M, M+82);

  /* el número grande */
  x.fillStyle=WA; x.font="800 190px "+disp;
  x.fillText(String(st.streak), M, M+300);
  var anchoN=x.measureText(String(st.streak)).width;
  x.fillStyle=T3; x.font="500 34px "+texto;
  x.fillText(st.streak===1?"día de racha":"días de racha", M+anchoN+22, M+300);

  /* la gráfica de los últimos 30 días */
  var ini=addDays(hoy,-29), p0=primerDia(); if(p0>ini) ini=p0;
  var dias=[], d=ini, g=0;
  while(d<=hoy && g++<40){ dias.push(d); d=addDays(d,1); }
  var gx=M, gy=M+400, gw=W-2*M, gh=360;
  if(dias.length>1){
    var hs=[], tc=[], mx=1, i;
    for(i=0;i<dias.length;i++){ hs.push(checksOf(dias[i]).length); tc.push(idealDe(dias[i]).length);
      if(hs[i]>mx) mx=hs[i]; if(tc[i]>mx) mx=tc[i]; }
    var PX=function(i){ return gx + i*gw/(dias.length-1); }, PY=function(val){ return gy + (1-val/mx)*gh; };
    x.strokeStyle=T3; x.globalAlpha=.55; x.lineWidth=3; x.setLineDash([9,9]);
    x.beginPath(); x.moveTo(PX(0),PY(tc[0]));
    for(i=1;i<dias.length;i++){ x.lineTo(PX(i),PY(tc[i-1])); x.lineTo(PX(i),PY(tc[i])); }
    x.stroke(); x.setLineDash([]); x.globalAlpha=1;
    x.strokeStyle=AC; x.lineWidth=6; x.lineJoin="round"; x.lineCap="round";
    x.beginPath(); x.moveTo(PX(0),PY(hs[0]));
    for(i=1;i<dias.length;i++) x.lineTo(PX(i),PY(hs[i]));
    x.stroke();
    x.fillStyle=AC;
    for(i=0;i<dias.length;i++){ x.beginPath(); x.arc(PX(i),PY(hs[i]),7,0,6.2832); x.fill(); }
    x.fillStyle=T3; x.font="500 24px "+texto;
    x.fillText("Últimos "+dias.length+" días", gx, gy-24);
  }

  /* el año en cubitos */
  var ay=gy+gh+150, anio=hoy.slice(0,4), d0=lunesDe(anio+"-01-01"), fin=anio+"-12-31";
  var C=Math.floor((W-2*M)/53)-3, G=3, P=C+G;
  x.fillStyle=T3; x.font="500 24px "+texto; x.fillText(anio, M, ay-22);
  for(var col=0;col<53;col++) for(var f2=0;f2<7;f2++){
    var dd=addDays(d0, col*7+f2);
    if(dd<anio+"-01-01" || dd>fin) continue;
    var fill;
    if(descansoDe(dd)) fill=WA;
    else if(dd>hoy) fill=FI;
    else { var xp=dayXP(dd,tm); fill = xp<=0? FI : AC; x.globalAlpha = xp<=0?1 : xp<40?.3 : xp<90?.62 : 1; }
    x.fillStyle=fill;
    if(descansoDe(dd)) x.globalAlpha=.55;
    x.beginPath();
    var rx=M+col*P, ry=ay+f2*P, r=3;
    x.moveTo(rx+r,ry); x.arcTo(rx+C,ry,rx+C,ry+C,r); x.arcTo(rx+C,ry+C,rx,ry+C,r);
    x.arcTo(rx,ry+C,rx,ry,r); x.arcTo(rx,ry,rx+C,ry,r); x.closePath(); x.fill();
    x.globalAlpha=1;
  }

  x.fillStyle=T3; x.font="500 26px "+texto;
  x.fillText("hecho con "+(S.labels.app||"Peak."), M, H-M+6);

  try{
    var url=c.toDataURL("image/png"), bin=atob(url.split(",")[1]), arr=new Uint8Array(bin.length);
    for(var k=0;k<bin.length;k++) arr[k]=bin.charCodeAt(k);
    var arch=new File([arr], "mi-progreso.png", {type:"image/png"});
    if(navigator.canShare && navigator.canShare({files:[arch]})){ navigator.share({files:[arch]}); return; }
    var a2=document.createElement("a");
    a2.href=url; a2.download="mi-progreso.png";
    document.body.appendChild(a2); a2.click(); a2.remove();
  }catch(e){}
}

/* ════════ la cuadrícula del año ════════
   un cubito por día, más lleno cuanto mejor fue. Los días de descanso
   salen con su propio color, para que se distingan de los días vacíos. */
var anioVer=null;
function aniosConDatos(){
  var a={};
  [S.checks,S.chDone,S.gym,S.habits,S.descanso].forEach(function(o){
    for(var k in (o||{})) a[k.slice(0,4)]=1;
  });
  a[today().slice(0,4)]=1;
  return Object.keys(a).sort();
}
function renderAnio(){
  var box=$("#anio-grid"); if(!box) return;
  var años=aniosConDatos();
  if(anioVer===null || años.indexOf(anioVer)<0) anioVer=today().slice(0,4);
  var nl=$("#anio-n"); if(nl) nl.textContent=anioVer;

  var tm=tasksByDay(), hoy=today();
  var ini=anioVer+"-01-01", fin=anioVer+"-12-31";
  /* el lunes de la semana en la que cae el 1 de enero */
  var d0=lunesDe(ini);
  var C=5.8, G=1.3, P=C+G, filas=7, cols=53;
  var W=cols*P, H=filas*P+11;
  var cubos="", marco="", meses="", mesVisto={}, MES=L10N.meses;
  for(var c=0;c<cols;c++){
    for(var f=0;f<filas;f++){
      var d=addDays(d0, c*7+f);
      if(d<ini || d>fin) continue;
      var x=(c*P).toFixed(1), y=(11+f*P).toFixed(1), fill, extra="";
      if(descansoDe(d)) { fill="color-mix(in srgb,var(--warn) 42%,transparent)"; }
      else if(comodinUsado(d)) { fill="color-mix(in srgb,var(--cyan) 55%,transparent)"; }
      else if(d>hoy)    { fill="var(--fill)"; }
      else {
        var xp=dayXP(d,tm);
        fill = xp<=0 ? "var(--fill-hi)" : xp<40 ? "color-mix(in srgb,var(--accent) 28%,transparent)"
             : xp<90 ? "color-mix(in srgb,var(--accent) 62%,transparent)" : "var(--accent)";
      }
      /* hoy: un marco dibujado con el mismo centro que su casilla */
      if(d===hoy) marco='<rect x="'+(c*P-1).toFixed(1)+'" y="'+(11+f*P-1).toFixed(1)+'" width="'+(C+2).toFixed(1)+'" height="'+(C+2).toFixed(1)+
        '" rx="2" fill="none" stroke="var(--t1)" stroke-width=".85" pointer-events="none"/>';
      cubos+='<rect x="'+x+'" y="'+y+'" width="'+C+'" height="'+C+'" rx="1.3" fill="'+fill+'"><title>'+d+'</title></rect>';
      var m=+d.slice(5,7);
      if(!mesVisto[m] && +d.slice(8,10)<=7){ mesVisto[m]=1; meses+='<text x="'+x+'" y="7" font-size="6.5" fill="var(--t3)">'+MES[m-1]+'</text>'; }
    }
  }
  var hechos=0, desc=0;
  for(var k in (S.checks||{})) if(k.slice(0,4)===anioVer && activeDay(k)) hechos++;
  for(var k2 in (S.descanso||{})) if(k2.slice(0,4)===anioVer) desc++;
  box.innerHTML='<svg viewBox="0 0 '+W.toFixed(1)+' '+H.toFixed(1)+'" style="width:100%;height:auto;display:block" aria-hidden="true">'+meses+cubos+marco+'</svg>'+
    '<div class="flex items-center justify-between mt-3">'+
      '<span class="text-[11.5px] t3">'+hechos+(hechos===1?" día vivo":" días vivos")+(desc?" · "+desc+" de descanso":"")+'</span>'+
      '<span class="flex items-center gap-1 text-[10.5px] t3">menos'+
        ["var(--fill-hi)","color-mix(in srgb,var(--accent) 28%,transparent)","color-mix(in srgb,var(--accent) 62%,transparent)","var(--accent)"]
          .map(function(c){ return '<span style="width:7px;height:7px;border-radius:2px;background:'+c+';display:inline-block"></span>'; }).join("")+
      'más</span></div>';
}

function rVital(){
  var t=curDay(), h=habit(t), went=wentGym(t);
  renderAnio();
  $("#vital-daybar").innerHTML=dayBar();
  var gs=0, d0=today(); if(!wentGym(d0)) d0=addDays(d0,-1);
  while(wentGym(d0) && gs<400){ gs++; d0=addDays(d0,-1); }
  $("#gym-streak").textContent=gs;
  var btn=$("#gym-btn");
  btn.dataset.day=t;
  var esHoy=(t===today());
  var gsb=$("#gym-sub"); if(gsb) gsb.innerHTML = (esHoy? "¿Has hecho ejercicio hoy?" : "¿Hiciste ejercicio ese día?")+
    ' <span class="chip ml-1" style="background:color-mix(in srgb,var(--good) 15%,transparent);color:var(--good)">+20 XP</span>';
  btn.innerHTML = went
    ? '<span class="display text-[19px] font-bold gym-si" style="color:var(--on-accent)">'+(esHoy?"Hoy sí has entrenado":"Ese día entrenaste")+
        '<svg class="gym-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.2 4.2L19 7"/></svg></span>'
    : '<span class="display text-[19px] font-bold">'+(esHoy?"He hecho ejercicio":"Hice ejercicio")+'</span>';
  btn.style.cssText = went
    ? "background:linear-gradient(145deg,var(--good),color-mix(in srgb,var(--good) 70%,var(--cyan)));box-shadow:0 10px 26px -10px color-mix(in srgb,var(--good) 60%,transparent);transition:all .4s var(--spring)"
    : "background:var(--fill);box-shadow:inset 0 0 0 1px var(--hairline);color:var(--t2);transition:all .4s var(--spring)";

  var wk=0, days="";
  for(var i=6;i>=0;i--){
    var d=addDays(today(),-i), on=wentGym(d); if(on) wk++;
    days+='<button class="flex-1 flex flex-col items-center gap-2" data-act="day-go" data-d="'+d+'">'+
      '<div class="w-full rounded-[10px]" style="height:44px;background:'+(on?"var(--good)":"var(--fill-hi)")+
      (d===t?";box-shadow:inset 0 0 0 2px var(--accent)":"")+'"></div>'+
      '<span class="text-[10.5px] '+(d===t?"t1 font-semibold":"t3")+'">'+INI[new Date(d+"T00:00:00").getDay()]+'</span></button>';
  }
  $("#gym-days").innerHTML=days;
  $("#gym-week").textContent=wk===1?"1 día":wk+" días";

  var va=h.water||0;
  /* el agua es un toque: sí (8) o no (0); así todo lo que contaba «8 o más» sigue igual */
  var wv=$("#water-val"); if(wv){ wv.classList.toggle("agua-si", va>=8); wv.textContent = va>=8 ? "Bien hidratado ✓" : "He bebido bastante agua"; wv.dataset.day=t; }
  $("#water-lab").textContent = va>=8 ? "hecho · +6 XP" : "un toque al día";
  $("#sleep-val").textContent=n1(h.sleep)+" h";
  $("#sleep-lab").textContent=h.sleep>=7?"descanso suficiente":h.sleep>0?"algo justo":"sin registrar";
  var sc=h.screen||0;
  $("#screen-val").textContent=n1(sc)+" h";
  $("#screen-lab").textContent = h.screen==null?"sin registrar":sc<=2?"bajo control":sc<=4?"lo normal":"se te ha ido";

  ["#water-minus","#water-plus","#sleep-minus","#sleep-plus","#screen-minus","#screen-plus"].forEach(function(q2){ var e2=$(q2); if(e2) e2.dataset.day=t; });
  medSync(h, !!(S.parte && S.parte[t]));
  var mm=mealsOf(t);
  $("#meals-list").innerHTML = S.mealNames.map(function(nm,i){
    var key=MEAL_KEYS[i], val=mm[key]||"", on=!!val.trim(), main=MEAL_MAIN.indexOf(i)>=0;
    return '<div class="flex items-center gap-3 py-2.5" style="border-bottom:1px solid var(--hairline-2)">'+
      '<span class="w-[18px] h-[18px] rounded-full grid place-items-center shrink-0" style="'+
        (on?"background:var(--good)":"box-shadow:inset 0 0 0 1.5px var(--hairline)")+'">'+
        (on?'<svg viewBox="0 0 24 24" class="w-[9px] h-[9px]" fill="none" stroke="var(--on-accent)" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>':'')+'</span>'+
      '<span class="text-[12.5px] '+(main?"t2":"t3")+' w-[102px] shrink-0 truncate">'+esc(nm)+'</span>'+
      '<input class="line-input" data-meal="'+key+'" data-day="'+t+'" value="'+esc(val)+'" maxlength="90" placeholder="…"></div>';
  }).join("");
  var mc=mealCount(t);
  $("#meals-chip").textContent=mc+" / 3";
  $("#meals-chip").style.cssText = mc>=3 ? "background:color-mix(in srgb,var(--good) 15%,transparent);color:var(--good)" : "background:var(--fill);color:var(--t2)";

  var rows=[["Ejercicio",function(d){ return wentGym(d)?1:0 }],
            ["Agua",function(d){var v=(S.habits[d]||{}).water||0;return v>=8?1:0}],
            ["Descanso",function(d){var v=(S.habits[d]||{}).sleep||0;return v>=7?1:v>=6?.5:0}],
            ["Pantalla",function(d){var v=(S.habits[d]||{}).screen; if(v==null||v===0) return 0; return v<=2?1:v<=4?.5:0}],
            ["Retos",function(d){var k=chOf(d).length;return k>=3?1:k>0?.5:0}]];
  var _stk=$("#streaks"); if(_stk) _stk.innerHTML=rows.map(function(r){
    var n=0, medio=0;
    for(var i=27;i>=0;i--){ var v=r[1](addDays(today(),-i)); if(v===1) n++; else if(v===.5) medio++; }
    var pct=Math.round((n+medio*0.5)/28*100);
    return '<div class="mb-3.5">'+
      '<div class="flex items-baseline justify-between mb-1.5">'+
        '<span class="text-[13px] font-medium">'+r[0]+'</span>'+
        '<span class="text-[11.5px] t3 num">'+n+' de 28 días · '+pct+'%</span></div>'+
      '<div class="h-2 rounded-full overflow-hidden" style="background:var(--fill-hi)">'+
        '<div class="h-full rounded-full bar-fill" style="width:'+pct+'%;background:'+
        (pct>=70?"var(--good)":pct>=40?"var(--accent)":"var(--warn)")+'"></div></div></div>';
  }).join("");
}



/* ═══ calendario de 4 semanas, 7 columnas: se toca bien y se lee mejor ═══ */
function lunesDe(d){
  var x=new Date(d+"T00:00:00"), w=(x.getDay()+6)%7;   /* 0 = lunes */
  return addDays(d,-w);
}
function nivelDia(d){
  var tm=tasksByDay(), x=dayXP(d,tm);
  if(x<=0) return 0;
  if(x<40) return 1;
  if(x<90) return 2;
  return 3;
}
function renderMes(){
  var box=$("#ch-heat"); if(!box) return;
  var t=today(), ini=lunesDe(addDays(t,-21)), h="";
  h+='<div class="grid grid-cols-7 gap-1.5 mb-2">';
  L10N.sem.forEach(function(n){
    h+='<div class="text-center text-[10.5px] font-semibold t3">'+n+'</div>'; });
  h+='</div><div class="grid grid-cols-7 gap-1.5">';
  for(var i=0;i<28;i++){
    var d=addDays(ini,i), futuro=d>t, hoy=(d===t), n=futuro?0:nivelDia(d);
    var bg = n===3?"var(--accent)"
           : n===2?"color-mix(in srgb,var(--accent) 55%,transparent)"
           : n===1?"color-mix(in srgb,var(--accent) 26%,transparent)"
           : "var(--fill)";
    var col = n>=2?"var(--on-accent)":"var(--t3)";
    h+='<button class="rounded-[12px] grid place-items-center" '+(futuro?'disabled':'data-act="dia" data-d="'+d+'"')+
       ' style="height:44px;background:'+(futuro?"transparent":bg)+';color:'+(futuro?"var(--t3)":col)+
       (hoy?";box-shadow:inset 0 0 0 2px var(--accent)":(futuro?";opacity:.35":""))+
       ';transition:background .3s var(--ease)">'+
       '<span class="text-[12.5px] num font-semibold">'+(+d.slice(8,10))+'</span></button>';
  }
  h+='</div><p class="text-[11.5px] t3 mt-3">Toca un día para ver cómo fue y corregirlo.</p>';
  box.innerHTML=h;
}

/* ═══ resumen de un día, editable desde la misma ventana ═══ */
var diaAbierto=null;
function sheetDia(d){
  diaAbierto=d;
  var tm=tasksByDay(), xp=dayXP(d,tm), h=S.habits[d]||{}, esHoy=(d===today());
  var tc=todaysChallenges(d), hechos=chOf(d), ck=checksOf(d);
  var body='<div class="flex items-start justify-between mb-5">'+
    '<div><p class="eyebrow mb-1.5">'+(esHoy?"Hoy":cap(fmt(d,{weekday:"long"})))+'</p>'+
    '<h3 class="display text-[20px] font-bold">'+cap(fmt(d,{day:"numeric",month:"long"}))+'</h3></div>'+closeBtn()+'</div>';

  body+='<div class="rounded-[18px] p-4 mb-5 flex items-center justify-between" '+
    'style="background:linear-gradient(140deg,var(--accent-soft),transparent);box-shadow:inset 0 0 0 1px var(--accent-line)">'+
    '<div><p class="eyebrow mb-1">XP del día</p>'+
    '<p class="display text-[30px] font-extrabold num leading-none" style="color:var(--accent)">'+xp+'</p></div>'+
    '<div class="text-right text-[11.5px] t3 leading-relaxed">'+
      hechos.length+' de '+tc.length+' retos<br>'+
      (wentGym(d)?"ejercicio sí":"ejercicio no")+'<br>'+
      ck.length+' de '+(idealDe(d).length||0)+' hábitos'+
      (tripleDone(d)?'<br><span style="color:var(--good)">×1.5 aplicado</span>':'')+
    '</div></div>';

  body+='<p class="eyebrow mb-2.5">Retos</p><div class="space-y-1.5 mb-5">'+
    (tc.length? tc.map(function(c){ return chRow(c, hechos.indexOf(c.id)>=0, false, d); }).join("")
              : '<p class="text-[13px] t3">Sin retos ese día.</p>')+'</div>';

  var went=wentGym(d);
  body+='<button class="w-full rounded-[16px] py-4 mb-5" data-act="gym" data-day="'+d+'" style="'+
    (went?"background:linear-gradient(145deg,var(--good),color-mix(in srgb,var(--good) 70%,var(--cyan)));box-shadow:0 8px 22px -12px color-mix(in srgb,var(--good) 60%,transparent)"
         :"background:var(--fill);box-shadow:inset 0 0 0 1px var(--hairline);color:var(--t2)")+';transition:all .4s var(--spring)">'+
    '<span class="display text-[15px] font-bold"'+(went?' style="color:var(--on-accent)"':'')+'>'+
    (went?"Hiciste ejercicio ✓":"Marcar que hiciste ejercicio")+'</span></button>';

  var desc=descansoDe(d), quedan=DESCANSOS_MES-descansosDelMes(d);
  body+='<button class="w-full rounded-[16px] py-3 mb-6" data-act="descanso" data-day="'+d+'" style="'+
    (desc?"background:color-mix(in srgb,var(--warn) 16%,transparent);box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--warn) 34%,transparent);color:var(--warn)"
        :"background:var(--fill);box-shadow:inset 0 0 0 1px var(--hairline-2);color:var(--t3)")+';transition:all .35s var(--spring)">'+
    '<span class="text-[13px] font-medium">'+(desc?"Día de descanso ✓":"Marcar como día de descanso")+'</span></button>'+
    '<p class="text-[11.5px] t3 -mt-4 mb-6 leading-relaxed">'+
    (!desc && quedan<=0 ? "Ya has gastado los "+DESCANSOS_MES+" días de descanso de este mes."
                        : "No rompe la racha. Te quedan "+Math.max(0,quedan)+" de "+DESCANSOS_MES+" este mes.")+'</p>';

  var _ld=ordenIdeal(idealDe(d));
  if(_ld.length){
    body+='<p class="eyebrow mb-2.5">Hábitos</p><div class="space-y-1 mb-5 max-h-[34vh] overflow-y-auto px-1.5 -mx-1.5">';
    _ld.forEach(function(it){
      var on=ck.indexOf(it.id)>=0;
      body+='<div class="soft flex items-center gap-3 px-3.5 py-2.5 '+(on?"done":"")+'">'+
        '<button class="tick tick-sm" data-act="check" data-id="'+it.id+'" data-day="'+d+'" aria-label="Marcar">'+ICON_CHECK+'</button>'+
        '<button class="text-[13px] flex-1 min-w-0 leading-snug text-left" data-act="check" data-id="'+it.id+'" data-day="'+d+'"><span class="strike">'+esc(it.text)+'</span></button></div>';
    });
    body+='</div>';
  }

  function fila(tit,k,vals,suf,cur,pista){
    var x='<div class="mb-4"><div class="flex items-baseline justify-between mb-2"><p class="text-[13px] font-semibold">'+tit+'</p>'+
      (pista?'<p class="text-[11px] t3">'+pista+'</p>':'')+'</div><div class="flex flex-wrap gap-2">';
    vals.forEach(function(v){
      var on=(cur===v);
      x+='<button class="px-3.5 py-2 rounded-[11px] text-[13px] num" data-act="dia-h" data-k="'+k+'" data-v="'+v+'" data-day="'+d+'" style="'+
        (on?"background:var(--accent);color:var(--on-accent)":"background:var(--fill);color:var(--t2);box-shadow:inset 0 0 0 1px var(--hairline-2)")+
        ';transition:all .3s var(--spring)">'+v+(suf||"")+'</button>';
    });
    return x+'</div></div>';
  }
  body+='<p class="eyebrow mb-2.5">Números</p>';
  body+=fila("Horas de sueño","sleep",[5,6,7,8,9],"h",h.sleep,"7h o más: +8 XP");
  body+='<div class="mb-4"><div class="flex items-baseline justify-between mb-2"><p class="text-[13px] font-semibold">Agua</p><p class="text-[11px] t3">bien hidratado: +6 XP</p></div><div class="flex flex-wrap gap-2">'+
    [[0,"No"],[8,"Bien hidratado"]].map(function(o){ var on=((h.water||0)>=8)===(o[0]===8);
      return '<button class="px-3.5 py-2 rounded-[11px] text-[13px]" data-act="dia-h" data-k="water" data-v="'+o[0]+'" data-day="'+d+'" style="'+
        (on?"background:var(--accent);color:var(--on-accent)":"background:var(--fill);color:var(--t2);box-shadow:inset 0 0 0 1px var(--hairline-2)")+';transition:all .3s var(--spring)">'+o[1]+'</button>'; }).join("")+'</div></div>';
  body+=fila("Horas de pantalla","screen",[1,2,3,4,5,6],"h",h.screen,"menos de 2h: +6 XP");

  var td=(tm[d]||0);
  body+='<p class="text-[12px] t3 mb-5">'+(td?("Ese día terminaste "+td+(td===1?" tarea":" tareas")):"Ese día no terminaste ninguna tarea")+'.</p>';
  body+='<button class="btn btn-primary w-full !py-3" data-act="close-sheet">Listo</button>';
  openSheet(body);
}

/* horario en móvil: un día cada vez, sin girar el teléfono */
var schedDay=null;
function curSchedDay(){ if(schedDay!=null) return schedDay; var i=dayIdx(); return i<0?0:i; }
/* varios huecos libres seguidos se juntan en una fila; al tocarla se abren */
var huecosAbiertos={};
function huecoVacio(d,x){ if(x.r) return false; var c=cellOf(claveCelda(d,x.ci)); return !(c&&(c.sid||c.txt)) && !((d===dayIdx())&&isNow(x)); }
function renderGridDay(){
  var box=$("#grid-day"); if(!box) return;
  var d=curSchedDay(), sl=slotsFor(d), h="", ND=nDias();
  if(d>=ND) d=0;
  h+='<div class="grid gap-1.5 mb-4" style="grid-template-columns:repeat('+ND+',1fr)">';
  for(var j=0;j<ND;j++){
    var on=(j===d), hoy=(j===dayIdx());
    h+='<button class="py-2.5 rounded-[13px] text-center" data-act="sched-day" data-d="'+j+'" style="'+
      (on?"background:var(--accent);color:var(--on-accent);box-shadow:0 6px 16px -8px var(--accent-line)"
         :"background:var(--fill);color:var(--t2);box-shadow:inset 0 0 0 1px var(--hairline-2)")+
      ';transition:all .35s var(--spring)">'+
      '<span class="block text-[12.5px] font-bold tracking-[.06em]">'+(ND>5?L10N.sem[j]:D3[j])+'</span>'+
      (hoy?'<span class="block text-[9px] mt-0.5 opacity-70">hoy</span>':'')+'</button>';
  }
  h+='</div>';
  h+='<p class="text-[11.5px] t3 num mb-3">'+dayRange(d)+'</p><div class="space-y-1.5">';
  var abiertoHasta=-1;
  for(var i=0;i<sl.length;i++){
    var x=sl[i];
    if(i>abiertoHasta && huecoVacio(d,x)){
      var fin=i; while(fin+1<sl.length && huecoVacio(d,sl[fin+1])) fin++;
      var hk=d+"-"+i;
      if(fin>i && !huecosAbiertos[hk]){
        h+='<button class="w-full text-left rounded-[15px] px-3.5 py-3 flex items-center gap-3.5" data-act="hueco-abre" data-k="'+hk+'" style="background:transparent;box-shadow:inset 0 0 0 1px var(--hairline-2)">'+
          '<span class="num text-[11.5px] t3 w-[46px] shrink-0 leading-tight">'+x.t+'</span>'+
          '<span class="min-w-0 flex-1 text-[13px] t3">Libre hasta las <span class="num">'+sl[fin].e+'</span></span>'+
          '<span class="text-[12px] font-semibold" style="color:var(--accent)">Rellenar</span></button>';
        i=fin; continue;
      }
      abiertoHasta=fin;
    }
    if(x.r){ h+='<div class="flex items-center gap-2.5 py-1.5"><span class="flex-1 h-px" style="background:var(--hairline-2)"></span>'+
      '<span class="text-[9.5px] tracking-[.12em] t3 font-semibold">RECREO</span>'+
      '<span class="flex-1 h-px" style="background:var(--hairline-2)"></span></div>'; continue; }
    var k=claveCelda(d,x.ci), cel=cellOf(k), sb=cel?subj(cel.sid):null, ex=cel?[cel.room,cel.note].filter(Boolean).join(" · "):"";
    var libre=cel&&cel.txt?cel.txt:"";
    var ahora=(d===dayIdx())&&isNow(x);
    h+='<button class="fila-clase w-full text-left rounded-[15px] px-3.5 py-3 flex items-center gap-3.5" data-act="cell" data-cell="'+k+'" style="'+
      'background:'+(sb?mix(sb.color,.11):"var(--fill)")+';'+(ahora?"box-shadow:inset 0 0 0 1.5px var(--accent);":"")+'transition:all .3s var(--ease)">'+
      '<span class="num text-[11.5px] t3 w-[46px] shrink-0 leading-tight">'+x.t+'</span>'+
      '<span class="w-1.5 h-1.5 rounded-full shrink-0" style="background:'+(sb?sb.color:"var(--hairline)")+'"></span>'+
      '<span class="min-w-0 flex-1">'+
        (sb?'<span class="block text-[13.5px] font-semibold leading-snug" style="color:'+sb.color+'">'+esc(sb.name)+'</span>'
           :libre?'<span class="block text-[13.5px] font-semibold leading-snug">'+esc(libre)+'</span>'
           :'<span class="block text-[13px] t3">Hueco libre · toca para rellenar</span>')+
        (ex?'<span class="block text-[11px] t3 truncate mt-0.5">'+esc(ex)+'</span>':'')+
      '</span>'+
      (ahora?'<span class="chip shrink-0" style="background:var(--accent);color:var(--on-accent)">ahora</span>':'')+
      '</button>';
  }
  return box.innerHTML=h+'</div>';
}
function rAcademico(){
  var cols="", ND=nDias();
  var tsem=$("#tit-semana"); if(tsem) tsem.textContent = esLibre()? "Tu semana" : "Horario semanal";
  $$("#modo-semana button").forEach(function(b){ b.setAttribute("aria-pressed", (b.dataset.m===agenda().modo)?"true":"false"); });
  for(var d=0; d<ND; d++){
    var sl=slotsFor(d), inner="", on=d===dayIdx();
    inner += '<div class="text-center mb-2.5 py-2 rounded-[10px]" style="'+(on?"background:var(--accent-soft)":"")+'">'+
      '<div class="text-[10.5px] font-semibold tracking-[.14em]" style="color:'+(on?"var(--accent)":"var(--t3)")+'">'+D3[d]+'</div>'+
      '<div class="text-[10px] num t3 mt-0.5">'+dayRange(d)+'</div></div>';
    for(var i=0;i<sl.length;i++){
      var x=sl[i];
      if(x.r){ inner+='<div class="flex items-center gap-2 my-1.5 px-1"><span class="flex-1 h-px" style="background:var(--hairline-2)"></span>'+
        '<span class="text-[9.5px] tracking-[.1em] t3 font-semibold">RECREO</span>'+
        '<span class="flex-1 h-px" style="background:var(--hairline-2)"></span></div>'; continue; }
      var k=claveCelda(d,x.ci), cel=cellOf(k), sb=cel?subj(cel.sid):null, extra=cel?[cel.room,cel.note].filter(Boolean).join(" · "):"";
      var lb=cel&&cel.txt?cel.txt:"";
      inner+='<button class="cellbtn rounded-[13px] px-2.5 py-2 text-left w-full mb-1.5 overflow-hidden" data-act="cell" data-cell="'+k+'" '+
        'style="background:'+(sb?mix(sb.color,.11):"var(--fill)")+';min-height:60px">'+
        '<span class="block text-[9.5px] num t3 leading-none mb-1">'+x.t+'</span>'+
        (sb?'<span class="block text-[11px] font-bold tracking-[.03em] leading-tight" style="color:'+sb.color+'">'+esc(sb.short)+'</span>'+
            '<span class="block text-[10px] t3 truncate leading-tight">'+esc(sb.name)+'</span>'
           :lb?'<span class="block text-[11px] font-semibold leading-tight">'+esc(lb)+'</span>'
           :'<span class="block text-[12px] t3 opacity-50">+</span>')+
        (extra?'<span class="block text-[9.5px] truncate leading-tight mt-0.5" style="color:var(--t2)">'+esc(extra)+'</span>':'')+'</button>';
    }
    cols+='<div class="min-w-0">'+inner+'</div>';
  }
  $("#grid").innerHTML='<div class="grid gap-2.5" style="grid-template-columns:repeat('+ND+',minmax('+(ND>5?"96px":"118px")+',1fr))">'+cols+'</div>';
  renderGridDay();

  var fx=future();
  $("#exam-featured").innerHTML = fx.length ? (function(e){
    var sb=subj(e.subject), d=diff(today(),e.date), df=DIFFL[e.diff]||DIFFL.media;
    var tone=d<=3?"var(--alert)":d<=7?"var(--warn)":"var(--t1)";
    return '<div class="glass importante rounded-[24px] pad h-full flex flex-col">'+
      '<div class="flex items-center justify-between mb-7"><span class="eyebrow">'+tipoL(e)+' más cercano</span>'+
      '<span class="chip" style="background:color-mix(in srgb,'+df.c+' 14%,transparent);color:'+df.c+'">'+df.l+'</span></div>'+
      '<div class="flex items-baseline gap-2.5"><span class="display text-[68px] font-extrabold num leading-[.85]" style="color:'+tone+'">'+d+'</span>'+
      '<span class="text-[14px] t3">'+(d===1?"día":"días")+'</span></div>'+
      '<p class="display text-[19px] font-bold mt-5 leading-tight">'+esc(e.title)+'</p>'+
      (sb?'<div class="flex items-center gap-2 mt-3"><span class="w-2 h-2 rounded-full" style="background:'+sb.color+'"></span>'+
      '<span class="text-[13px] t2">'+esc(sb.name)+'</span></div>':'')+
      '<div class="mt-auto pt-6 flex items-center justify-between"><span class="text-[12.5px] t3">'+cap(fmt(e.date,{weekday:"long",day:"numeric",month:"long"}))+'</span>'+
      '<div class="flex gap-1"><button class="icon-btn bare !w-8 !h-8" data-act="edit-exam" data-id="'+e.id+'" aria-label="Editar">'+ICON_PEN+'</button>'+
      '<button class="icon-btn bare !w-8 !h-8" data-act="del-exam" data-id="'+e.id+'" aria-label="Borrar">'+ICON_TRASH+'</button></div></div></div>';
  })(fx[0]) : '<div class="glass rounded-[24px] pad h-full grid place-items-center text-center"><div>'+
      '<p class="text-[13.5px] t3 mb-4">Nada apuntado.</p><button class="btn btn-quiet" data-act="new-exam">Nuevo evento</button></div></div>';

  $("#exam-rest").innerHTML = fx.slice(1).length ? fx.slice(1).map(function(e){
    var sb=subj(e.subject), d=diff(today(),e.date), df=DIFFL[e.diff]||DIFFL.media;
    return '<div class="soft flex items-center gap-3.5 px-4 py-3.5">'+
      '<span class="display text-[22px] font-bold num w-[38px] shrink-0" style="color:'+(d<=3?"var(--alert)":d<=7?"var(--warn)":"var(--t2)")+'">'+d+'</span>'+
      '<span class="w-1.5 h-1.5 rounded-full shrink-0" style="background:'+(sb?sb.color:"var(--t3)")+'"></span>'+
      '<span class="min-w-0 flex-1"><span class="block text-[13.5px] font-medium truncate">'+esc(e.title)+'</span>'+
      '<span class="block text-[11.5px] t3 mt-0.5">'+esc(sb?sb.short:"—")+' · '+fmt(e.date,{weekday:"short",day:"numeric",month:"short"})+'</span></span>'+
      '<span class="chip shrink-0" style="background:color-mix(in srgb,'+df.c+' 13%,transparent);color:'+df.c+'">'+df.l+'</span>'+
      '<button class="icon-btn bare !w-8 !h-8" data-act="edit-exam" data-id="'+e.id+'" aria-label="Editar">'+ICON_PEN+'</button></div>';
  }).join("") : '<p class="text-[13.5px] t3 py-8 text-center">Nada más a la vista.</p>';

  var past=S.exams.filter(function(e){return e.date<today()}).sort(function(a,b){return a.date<b.date?1:-1});
  $("#exam-past").innerHTML=past.length? past.map(function(e){
    var sb=subj(e.subject);
    return '<div class="flex items-center gap-3 px-1 py-2"><span class="w-1.5 h-1.5 rounded-full shrink-0" style="background:'+(sb?sb.color:"var(--t3)")+'"></span>'+
      '<button class="text-[13px] t2 truncate flex-1 text-left" data-act="edit-exam" data-id="'+e.id+'">'+esc(e.title)+'</button>'+
      '<span class="text-[11.5px] t3 num">'+fmt(e.date,{day:"numeric",month:"short"})+'</span>'+
      '<button class="icon-btn bare !w-7 !h-7" data-act="del-exam" data-id="'+e.id+'" aria-label="Borrar">'+ICON_TRASH+'</button></div>';
  }).join("") : '<p class="text-[13px] t3">Todavía no ha caído ninguno.</p>';
}

function textoFecha(due){
  if(!due) return "";
  var n=diff(today(),due);
  return n<0?("hace "+(-n)+" d") : n===0?"hoy" : n===1?"mañana" : "en "+n+" d";
}
function dueChip(due){
  if(!due) return "";
  var n=diff(today(),due);
  var col = n<0?"var(--alert)" : n===0?"var(--warn)" : n<=2?"var(--warn)" : "var(--t3)";
  var txt = n<0?("hace "+(-n)+" d") : n===0?"hoy" : n===1?"mañana" : "en "+n+" d";
  return '<span class="chip shrink-0" style="background:color-mix(in srgb,'+col+' 14%,transparent);color:'+col+'">'+txt+'</span>';
}
function sortTasks(list){
  return list.slice().sort(function(a,b){
    if(a.done!==b.done) return a.done?1:-1;
    var da=a.due||"9999-99-99", db=b.due||"9999-99-99";
    return da<db?-1:da>db?1:0;
  });
}
function rTareas(){
  fillTaskSubjects();
  $("#cat-picker").innerHTML=S.cats.map(function(c){
    return '<button data-cat="'+c.id+'" aria-pressed="'+(c.id===newCat?"true":"false")+'">'+esc(c.name)+'</button>'; }).join("");
  $$("#task-filter button").forEach(function(b){ b.setAttribute("aria-pressed",b.dataset.f===taskFilter?"true":"false"); });
  var list=sortTasks(S.tasks.filter(function(t){ return taskFilter==="todas"?true:taskFilter==="hechas"?t.done:!t.done; }));
  $("#task-list").innerHTML=list.length? list.map(function(t){
    var c=catOf(t.cat), sb=t.subject?subj(t.subject):null;
    return '<div class="glass glass-hover rounded-[18px] px-4 py-3.5 flex items-center gap-3 '+(t.done?"done":"")+'" data-row="'+t.id+'">'+
      '<button class="tick" data-act="toggle" data-id="'+t.id+'" aria-label="Completar">'+ICON_CHECK+'</button>'+
      '<span class="flex-1 min-w-0"><span class="block text-[14px] leading-snug"><span class="strike">'+esc(t.text)+'</span></span>'+
      '<span class="block text-[11.5px] t3 mt-1 sm:hidden">'+esc(c.name)+(t.due?' · '+textoFecha(t.due):'')+'</span></span>'+
      '<span class="hidden sm:contents">'+dueChip(t.due)+
      '<span class="chip shrink-0" style="background:color-mix(in srgb,'+c.color+' 16%,transparent);color:'+c.color+'">'+esc(c.name)+'</span></span>'+
      '<button class="icon-btn bare !w-8 !h-8 shrink-0" data-act="edit-task" data-id="'+t.id+'" aria-label="Editar">'+ICON_PEN+'</button>'+
      '<button class="icon-btn bare !w-8 !h-8 shrink-0" data-act="del-task" data-id="'+t.id+'" aria-label="Borrar">'+ICON_TRASH+'</button></div>';
  }).join("") : '<div class="glass rounded-[24px] p-12 text-center text-[13.5px] t3">Nada por aquí.</div>';
  var done=S.tasks.filter(function(t){return t.done}).length, tot=S.tasks.length;
  $("#tk-done").textContent=done; $("#tk-total").textContent="/ "+tot;
  $("#tk-bar").style.width=(tot?done/tot*100:0)+"%";
  $("#cat-stats").innerHTML=S.cats.map(function(c){
    var all=S.tasks.filter(function(t){return t.cat===c.id}), dn=all.filter(function(t){return t.done}).length;
    return '<div><div class="flex items-center justify-between mb-2">'+
      '<span class="flex items-center gap-2 text-[12.5px]"><i class="w-2 h-2 rounded-full inline-block" style="background:'+c.color+'"></i>'+esc(c.name)+'</span>'+
      '<span class="text-[11.5px] t3 num">'+dn+'/'+all.length+'</span></div>'+
      '<div class="h-1.5 rounded-full overflow-hidden" style="background:var(--fill-hi)">'+
      '<div class="h-full rounded-full bar-fill" style="width:'+(all.length?dn/all.length*100:0)+'%;background:'+c.color+'"></div></div></div>'; }).join("");
}

