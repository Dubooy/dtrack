/* ════════ navegación ════════ */
/* la barra vive pegada abajo; al abrirse el teclado se aparta para no estorbar */
function fitBottomBar(){
  var m=$("#mtabs"); if(!m) return;
  var nav=m.parentNode; if(!nav) return;
  var ae=document.activeElement;
  var escribiendo = ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName);
  nav.style.opacity = escribiendo ? "0" : "";
  nav.style.pointerEvents = "none";                 /* solo la pastilla recibe toques */
  m.style.pointerEvents = escribiendo ? "none" : "auto";
}
var mindX=0;
function moveMTab(){
  var ind=$("#mind"), b=$('#mtabs button[data-view="'+((view==="tareas" && !(typeof academicoOff==="function" && academicoOff()))?"academico":view)+'"]');
  if(!ind||!b) return;
  ind.style.width=b.offsetWidth+"px";
  mindX=b.offsetLeft;
  ind.style.transform="translate3d("+mindX+"px,0,0)";
  ind.style.opacity="1";
}
/* arrastrar la pastilla con el dedo, a 60 fps */
(function(){
  var bar=$("#mtabs"), ind=$("#mind");
  if(!bar||!ind) return;
  var pulsando=false, movido=false, x0=0, base=0, pid=null;
  var offs=[], vistas=[], pend=null, ultimo=-1, raf=false;
  var tApretada=0, soltarTimer=null;
  function apretar(){
    clearTimeout(soltarTimer); tApretada=Date.now();
    bar.classList.add("apretada");
  }
  function aflojar(){                       /* un toque corto también se ve saltar */
    var espera=Math.max(0, 190-(Date.now()-tApretada));
    clearTimeout(soltarTimer);
    soltarTimer=setTimeout(function(){ bar.classList.remove("apretada"); }, espera);
  }

  function medir(){                      /* una sola vez al empezar el gesto */
    var t=bar.querySelectorAll("button");
    offs=[]; vistas=[];
    for(var i=0;i<t.length;i++){ offs.push(t[i].offsetLeft); vistas.push(t[i].dataset.view); }
  }
  function masCerca(x){
    var mejor=0, dd=1e9;
    for(var i=0;i<offs.length;i++){ var d=Math.abs(offs[i]-x); if(d<dd){ dd=d; mejor=i; } }
    return mejor;
  }
  function pintar(i){
    if(i===ultimo) return;               /* solo se toca el DOM si cambia */
    ultimo=i;
    var t=bar.querySelectorAll("button");
    for(var j=0;j<t.length;j++) t[j].classList.toggle("cerca", j===i);
  }
  function aplicar(){
    raf=false;
    if(pend==null) return;
    mindX=pend; ind.style.transform="translate3d("+pend+"px,0,0)";
    pintar(masCerca(pend));
  }
  bar.addEventListener("pointerdown",function(e){
    if(e.button&&e.button!==0) return;
    pulsando=true; movido=false; x0=e.clientX; base=mindX; pid=e.pointerId; ultimo=-1;
    medir(); apretar();
    ind.classList.add("suelto"); bar.classList.add("grabbing");
    try{ bar.setPointerCapture(pid); }catch(err){}
  });
  bar.addEventListener("pointermove",function(e){
    if(!pulsando) return;
    var dx=e.clientX-x0;
    if(!movido && Math.abs(dx)<5) return;
    movido=true;
    pend=Math.max(offs[0], Math.min(offs[offs.length-1], base+dx));
    if(!raf){ raf=true; requestAnimationFrame(aplicar); }
  },{passive:true});
  function soltar(e){
    if(!pulsando) return;
    pulsando=false; pend=null; bar.classList.remove("grabbing");
    ind.classList.remove("suelto"); aflojar();
    try{ bar.releasePointerCapture(pid); }catch(err){}
    pintar(-1);
    if(movido){
      bar.dataset.tragar="1";
      var i=masCerca(mindX);
      mindX=offs[i]; ind.style.transform="translate3d("+mindX+"px,0,0)";
      if(vistas[i]!==view) go(vistas[i]); else moveMTab();
    }else{
      var bajo=document.elementFromPoint(e.clientX,e.clientY);
      var btn=bajo&&bajo.closest?bajo.closest("#mtabs button[data-view]"):null;
      if(btn&&btn.dataset.view!==view) go(btn.dataset.view);
    }
  }
  bar.addEventListener("pointerup",soltar);
  bar.addEventListener("pointercancel",soltar);
  bar.addEventListener("click",function(e){
    if(bar.dataset.tragar==="1"){ bar.dataset.tragar=""; e.stopPropagation(); e.preventDefault(); }
  },true);
})();

function moveMarker(){
  var m=$("#rail-marker"), b=$('#rail button[data-view="'+(view==="tareas"?"academico":view)+'"]');
  if(!m||!b) return;
  m.style.height=b.offsetHeight+"px"; m.style.transform="translateY("+b.offsetTop+"px)"; m.style.opacity="1";
}
function go(v){
  view=v;
  setTimeout(function(){ if(typeof socMini==="function") socMini(); }, 30);
  ["resumen","retos","vital","academico","tareas","social"].forEach(function(k){
    var el=$("#v-"+k); if(!el) return;
    el.hidden=(k!==v);
    if(k===v){ el.classList.remove("view"); void el.offsetWidth; el.classList.add("view"); }
  });
  /* Horario y Tareas comparten pestaña: la de abajo se marca igual en las dos */
  var tab = (v==="tareas" && !(typeof academicoOff==="function" && academicoOff())) ? "academico" : v;
  $$("[data-sub]").forEach(function(b){ b.setAttribute("aria-pressed", b.dataset.sub===v?"true":"false"); });
  $$("#rail button[data-view]").forEach(function(b){ b.setAttribute("aria-current",b.dataset.view===tab?"true":"false"); });
  $$("#mtabs button").forEach(function(b){ b.setAttribute("aria-current",b.dataset.view===tab?"true":"false"); });
  moveMarker(); moveMTab(); fitBottomBar(); window.scrollTo({top:0,behavior:"auto"}); render();
  /* la primera vez que entras al horario, se te pregunta qué estudias */
  if(v==="academico" && !S.modalidad && !tourLive) setTimeout(function(){ if(view==="academico" && !S.modalidad && !tourLive) sheetModalidad(); },320);
}

/* ════════ eventos ════════ */
document.addEventListener("click",function(ev){
  var nav=ev.target.closest("#rail button[data-view], #mtabs button");
  if(nav){ go(nav.dataset.view); return; }
  var sb2=ev.target.closest("[data-sub]");
  if(sb2){ go(sb2.dataset.sub); return; }
  var jump=ev.target.closest("[data-jump]");
  if(jump && !ev.target.closest("[data-act]")){ go(jump.dataset.jump); return; }
  if(ev.target.closest("a")) return;
  var el=ev.target.closest("[data-act]"); if(!el) return;
  var a=el.dataset.act, id=el.dataset.id, t=el.dataset.day||today();
  if(a.indexOf("x-")===0 && extrasAccion(a, el)) return;

  if(a==="day-prev"){ selDay=addDays(curDay(),-1); render(); return; }
  if(a==="day-next"){ var nx2=addDays(curDay(),1); if(nx2<=today()){ selDay=(nx2===today()?null:nx2); render(); } return; }
  if(a==="day-today"){ selDay=null; render(); return; }
  if(a==="day-go"){ var dd=el.dataset.d; if(dd&&dd<=today()){ selDay=(dd===today()?null:dd); render(); } return; }
  if(a==="modalidad"){ aplicarModalidad(el.dataset.m); closeSheet(); render(); return; }
  if(a==="tour-next"){ tourStep++; renderTour(); return; }
  if(a==="tour-prev"){ tourStep=Math.max(0,tourStep-1); renderTour(); return; }
  if(a==="tour-skip"){ tourStep=TOUR.length; renderTour(); go("resumen"); return; }
  if(a==="tour-open"){ tourStep=0; tourLive=false; closeSheet(); go("resumen"); renderTour(); return; }
  if(a==="av-hora"){ S.avisos[el.dataset.k]=+el.dataset.h; save(); if(S.avisos.activo) activarAvisos(); sheetSettings(); return; }
  if(a==="av-toggle"){
    var campo=$("#av-servidor"); if(campo){ S.avisos.servidor=(campo.value||"").trim(); save(); }
    if(S.avisos.activo) desactivarAvisos().then(function(){ sheetSettings(); });
    else activarAvisos().then(function(ok){ if(ok) sheetSettings(); });
    return;
  }
  if(a==="av-srv-ver"){ var cv=$("#av-servidor"); if(cv){ cv.hidden=!cv.hidden; if(!cv.hidden) cv.focus(); } return; }
  if(a==="av-probar"){ probarAviso(); return; }
  if(a==="borrar-ejemplos"){
    S.exams=S.exams.filter(function(e){ return !e.ej; });
    S.tasks=S.tasks.filter(function(t){ return !t.ej; });
    S.ejemplos=0; save(); render(); return;
  }
  if(a==="dia"){ sheetDia(el.dataset.d); return; }
  if(a==="dia-h"){ var ph={}; ph[el.dataset.k]=+el.dataset.v; setHabit(el.dataset.day,ph); render(); if(diaAbierto) sheetDia(diaAbierto); return; }
  if(a==="sched-day"){ schedDay=+el.dataset.d; renderGridDay(); return; }
  if(a==="hueco-abre"){ huecosAbiertos[el.dataset.k]=1; renderGridDay(); return; }
  if(a==="parte"){ parteOpen(); return; }
  if(a==="parte-close"){ parteClose(); return; }
  if(a==="parte-next"){ parteStep=Math.min(4,parteStep+1); renderParte(); $("#parte-body").parentNode.scrollTop=0; return; }
  if(a==="parte-prev"){ parteStep=Math.max(0,parteStep-1); renderParte(); $("#parte-body").parentNode.scrollTop=0; return; }
  if(a==="parte-h"){ var pp={}; pp[el.dataset.k]=+el.dataset.v; setHabit(today(),pp); renderParte(); return; }
  if(a==="parte-pick"){
    var tm2=addDays(today(),1), ar=(S.plan[tm2]||[]).slice(), ix=ar.indexOf(id);
    if(ix>=0) ar.splice(ix,1); else if(ar.length<3) ar.push(id);
    S.plan[tm2]=ar; save(); renderParte(); return;
  }
  if(a==="parte-done"){ S.parte[today()]=true; save(); parteClose(); return; }
  if(a==="plan-clear"){ delete S.plan[today()]; save(); render(); return; }
  if(a==="export"){
    if(typeof exportaCopia==="function" && exportaCopia()) return;
    var blob=new Blob([JSON.stringify(S,null,1)],{type:"application/json"});
    var u=URL.createObjectURL(blob), lk=document.createElement("a");
    lk.href=u; lk.download="peak-copia-"+today()+".json"; document.body.appendChild(lk); lk.click();
    document.body.removeChild(lk); setTimeout(function(){ URL.revokeObjectURL(u); },800); return;
  }
  if(a==="import-open"){ var bx=$("#imp-box"); bx.hidden=!bx.hidden; if(!bx.hidden) $("#imp-text").focus(); return; }
  if(a==="import-all" || a==="import-sched"){
    var txt=($("#imp-text").value||"").trim(); if(!txt){ $("#imp-text").focus(); return; }
    var inc; try{ inc=JSON.parse(txt); }catch(e){ $("#imp-text").value="Eso no es un JSON válido. Pega el archivo entero, desde la primera llave { hasta la última }."; return; }
    if(!inc || typeof inc!=="object"){ return; }
    if(a==="import-all"){
      if(!inc.subjects){ $("#imp-text").value="Le falta la lista de asignaturas: no parece una copia de Peak."; return; }
      S=inc; if(!S.plan) S.plan={}; if(!S.parte) S.parte={}; if(!S.chPick) S.chPick={};
    } else {
      if(inc.subjects) S.subjects=inc.subjects;
      if(inc.schedule) S.schedule=inc.schedule;
      if(inc.timetable) S.timetable=inc.timetable;
      S.imported="2b-26-27-v2";
    }
    save(); closeSheet(); render(); return;
  }
  if(a==="medals-toggle"){ medalsOpen=!medalsOpen; fitMedals(); return; }
  if(a==="close-sheet"){ closeSheet(); return; }
  if(a==="open-settings"){ sheetSettings(); return; }
  if(a==="school"){ sheetSchool(); return; }
  if(a==="new-exam"){ sheetExam(null); return; }
  if(a==="edit-exam"){ sheetExam(id); return; }
  if(a==="edit-task"){ sheetTask(id); return; }
  if(a==="homework"){
    cellKey=null;
    var sbh=subj(el.dataset.sid);
    sheetTask(null,{ text:(sbh?sbh.name+": ":""), due:addDays(today(),1), cat:"acad" });
    return;
  }
  if(a==="new-task"){ sheetTask(null,{}); return; }
  if(a==="cell"){ sheetCell(el.dataset.cell); return; }
  if(a==="edit-ideal"){ sheetIdeal(null); return; }
  if(a==="edit-ideal-item"){ sheetIdeal(id); return; }
  if(a==="edit-challenges"){ sheetChallenges(null); return; }
  if(a==="edit-ch"){ sheetChallenges(id); return; }
  if(a==="timetable"){ sheetTimetable(); return; }
  if(a==="agenda-modo"){
    if(!S.agenda) S.agenda={};
    var abierta=!$("#sheet").hidden;
    S.agenda.modo=el.dataset.m; schedDay=null; save(); render();
    if(abierta) sheetTimetable();
    return;
  }
  if(a==="save-agenda"){
    if(!S.agenda) S.agenda={};
    S.agenda.ini=$("#ag-ini").value||"07:00";
    S.agenda.fin=$("#ag-fin").value||"22:00";
    S.agenda.paso=Number($("#ag-paso").value)||60;
    if(toMin(S.agenda.fin)<=toMin(S.agenda.ini)) S.agenda.fin="22:00";
    save(); closeSheet(); render(); return;
  }
  if(a==="toggle-theme"){
    if(typeof temaPicker==="function"){ temaPicker(el); return; }
    var orden=["light","dark","sage","neo"].concat(temasDesbloqueados());
    var cur=curTheme(); if(cur==="system") cur=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";
    var next=orden[(orden.indexOf(cur)+1)%orden.length];
    try{ localStorage.setItem(TKEY,next); }catch(e){}
    applyTheme(next); return;
  }
  if(a==="gym"){
    var iba=!!S.gym[t];
    if(!iba && typeof xpPreparar==="function") xpPreparar();
    if(iba) delete S.gym[t]; else S.gym[t]=true;
    save(); render();
    if(!iba && typeof celebraGym==="function") celebraGym(ev);
    return;
  }
  if(a==="ch"){
    var arr=chOf(t).slice(), i=arr.indexOf(id);
    if(i>=0) arr.splice(i,1); else { arr.push(id); if(typeof celebraTick==="function") celebraTick(el, 15, "var(--good)"); }
    S.chDone[t]=arr; save();
    var row=el.closest(".soft"); if(row) row.classList.toggle("done");
    setTimeout(render,400); return;
  }
  if(a==="save-ch"){
    var txt=($("#ch-text").value||"").trim(); if(!txt){ $("#ch-text").focus(); return; }
    if(id){ for(var z=0;z<S.challenges.length;z++) if(S.challenges[z].id===id) S.challenges[z].text=txt; }
    else S.challenges.push({id:uid(),text:txt});
    save(); sheetChallenges(null); render(); return;
  }
  if(a==="del-ch"){ S.challenges=S.challenges.filter(function(c){return c.id!==id}); save(); sheetChallenges(null); render(); return; }
  if(a==="nueva-asig"){
    var ci=$("#cl-nueva"), nom=ci?(ci.value||"").trim():"";
    if(!nom){ if(ci) ci.focus(); return; }
    var nueva={ id:uid(), name:nom, short:siglas(nom), color:PAL[S.subjects.length % PAL.length], prof:"" };
    S.subjects.push(nueva);
    var c3=cellOf(cellKey)||{sid:"",room:"",note:""};
    c3.sid=nueva.id; S.schedule[cellKey]=c3;      /* se queda puesta en este hueco */
    save(); render(); sheetCell(cellKey); return;
  }
  if(a==="pick-subject"){
    var cel=cellOf(cellKey)||{sid:"",room:"",note:""};
    cel.sid=el.dataset.sid; S.schedule[cellKey]=cel;
    $$('#sheet-body [data-act="pick-subject"]').forEach(function(b){
      b.style.cssText = b.dataset.sid===cel.sid ? "background:var(--fill-hi);box-shadow:inset 0 0 0 1px var(--accent-line)" : ""; });
    return;
  }
  if(a==="save-cell"){
    var c2=cellOf(cellKey)||{sid:"",room:"",note:"",txt:""};
    var ctx=$("#cl-txt"); if(ctx) c2.txt=(ctx.value||"").trim();
    var cro=$("#cl-room"); if(cro) c2.room=(cro.value||"").trim();
    var cno=$("#cl-note"); if(cno) c2.note=(cno.value||"").trim();
    if(!c2.sid && !c2.room && !c2.note && !c2.txt) delete S.schedule[cellKey]; else S.schedule[cellKey]=c2;
    save(); closeSheet(); render(); return;
  }
  if(a==="clear-cell"){ delete S.schedule[cellKey]; save(); closeSheet(); render(); return; }
  if(a==="save-exam"){
    var ti=($("#nx-title").value||"").trim(), da=$("#nx-date").value;
    if(!ti||!da){ $("#nx-title").focus(); return; }
    var body={ title:ti, subject:$("#nx-subject").value, date:da, diff:$("#nx-diff").dataset.value||"media", tipo:$("#nx-tipo").dataset.value||"examen" };
    if(id){ for(var y=0;y<S.exams.length;y++) if(S.exams[y].id===id){ S.exams[y].title=body.title; S.exams[y].subject=body.subject; S.exams[y].date=body.date; S.exams[y].diff=body.diff; S.exams[y].tipo=body.tipo; } }
    else {
      body.id=uid(); S.exams.push(body);
      var pl=$("#nx-plan");
      if(pl && pl.checked && body.tipo==="examen"){
        var sbn=subj(body.subject), etq=sbn?sbn.short:"", n=0;
        [[7,"Primer repaso"],[3,"Segundo repaso"],[1,"Repaso final"]].forEach(function(r){
          var d=addDays(body.date,-r[0]);
          if(d<today()) return;
          S.tasks.unshift({id:uid(), text:r[1]+" · "+body.title, cat:(S.cats[1]||S.cats[0]).id,
            done:false, day:today(), subject:body.subject, due:d, exam:body.id});
          n++;
        });
      }
    }
    temasGuardar(id||body.id);
    save(); closeSheet(); render(); return;
  }
  if(a==="del-exam"){
    S.exams=S.exams.filter(function(x){return x.id!==id});
    S.tasks=S.tasks.filter(function(x){ return !(x.exam===id && !x.done); });
    save(); closeSheet(); render(); return; }
  if(a==="add-task"){ addTask(); return; }
  if(a==="save-task"){
    var nt=($("#tk-text").value||"").trim(); if(!nt){ $("#tk-text").focus(); return; }
    var nsb="", ndu=$("#tk-due").value||"", nct=$("#tk-cat").dataset.value;
    if(id){ S.tasks.forEach(function(x){ if(x.id===id){ x.text=nt; x.cat=nct||x.cat; x.subject=nsb; x.due=ndu; } }); }
    else S.tasks.unshift({id:uid(),text:nt,cat:nct||(S.cats[0]||{}).id,done:false,day:today(),subject:nsb,due:ndu});
    save(); closeSheet(); render(); return;
  }
  if(a==="toggle"){
    var row2=$('[data-row="'+id+'"]');
    S.tasks.forEach(function(x){ if(x.id===id){ x.done=!x.done; if(x.done) x.day=today(); } });
    save();
    if(row2 && view==="tareas"){ row2.classList.toggle("done"); setTimeout(render,420); } else render();
    return;
  }
  if(a==="del-task"){ S.tasks=S.tasks.filter(function(x){return x.id!==id}); save(); render(); return; }
  if(a==="clear-done"){ S.tasks=S.tasks.filter(function(x){return !x.done}); save(); render(); return; }
  if(a==="check"){
    var arr2=checksOf(t).slice(), j=arr2.indexOf(id);
    if(j>=0) arr2.splice(j,1); else { arr2.push(id); if(typeof celebraTick==="function") celebraTick(el, 4); }
    S.checks[t]=arr2; save();
    var line=el.closest("div"); if(line) line.classList.toggle("done");
    setTimeout(render,400); return;
  }
  if(a==="add-ideal"){
    var tx=($("#id-text").value||"").trim(); if(!tx){ $("#id-text").focus(); return; }
    var tm=($("#id-time").value||"").trim(), tg=$("#id-tag").dataset.value||"vital";
    if(id){ for(var w=0;w<S.ideal.length;w++) if(S.ideal[w].id===id){ S.ideal[w].text=tx; S.ideal[w].time=tm; S.ideal[w].tag=tg; } }
    else S.ideal.push({id:uid(),time:tm,text:tx,tag:tg,desde:today()});
    save(); sheetIdeal(null); render(); return;
  }
  if(a==="del-ideal"){
    /* no se borra: se archiva con la fecha de hoy, para que los días
       anteriores sigan contando con el techo que tenían entonces */
    for(var w2=0;w2<S.ideal.length;w2++) if(S.ideal[w2].id===id) S.ideal[w2].hasta=today();
    save(); sheetIdeal(null); render(); return;
  }
  if(a==="compartir"){ compartirProgreso(); return; }
  if(a==="nube-subir"){ pintaEstadoNube("mirando"); subirDatos().then(function(ok){ if(ok) avisoNube("Guardado."); }); return; }
  if(a==="nube-salir"){ salirCuenta(); return; }
  if(a==="nube-foto"){ elegirFoto(); return; }
  if(a==="nube-quitafoto"){ quitarFoto(); return; }
  if(a==="soc-reto"){
    if(!GRUPO) return;
    var totAntes=retoTotal(), posAntes=(typeof filasPos==="function")?filasPos():null;
    var marcado=retoMarcarHoy();
    rSocial();
    if(typeof filasFlip==="function") filasFlip(posAntes);
    if(marcado && typeof celebraRetoGrupo==="function") celebraRetoGrupo(totAntes);
    else { var _bt=document.querySelector(".soc-reto .soc-boton"); if(_bt) _bt.classList.add("sr-desmarca"); }
    if(marcado){
      var tot=retoTotal(), obj=GRUPO.reto.objetivo;
      avisoNube(tot>=obj ? "¡Reto conseguido entre todos! "+GRUPO.reto.premio+"."
                         : "Sumado. Vais "+tot+" de "+obj+".");
    }
    return;
  }
  if(a==="soc-reac"){
    if(!GRUPO) return;
    var em=el.dataset.e;
    for(var q=0;q<GRUPO.muro.length;q++) if(GRUPO.muro[q].id===id){
      var r=GRUPO.muro[q].reac||{};
      r[em]=(r[em]||0)+1; GRUPO.muro[q].reac=r;
    }
    rSocial(); return;
  }
  if(a==="soc-codigo"){
    if(!GRUPO) return;
    avisoNube("Código del grupo: "+GRUPO.codigo);
    return;
  }
  if(a==="soc-crear" || a==="soc-entrar"){
    avisoNube(esPrueba() ? "En modo prueba no hay servidor: el grupo es de mentira."
                         : "Todavía no está conectado al servidor.");
    return;
  }
  if(a==="anio"){
    var ys=aniosConDatos(), i=ys.indexOf(anioVer||today().slice(0,4))+Number(el.dataset.d);
    if(i>=0 && i<ys.length){ anioVer=ys[i]; renderAnio(); }
    return;
  }
  if(a==="descanso"){
    var dd=el.dataset.day||today();
    if(!S.descanso) S.descanso={};
    if(S.descanso[dd]) delete S.descanso[dd];
    else{
      if(descansosDelMes(dd)>=DESCANSOS_MES) return;   /* se avisa en el propio texto */
      S.descanso[dd]=1;
    }
    save(); sheetDia(dd); render(); return;
  }
  if(a==="water"){ var v=Number(el.dataset.v); setHabit(t,{water:(habit(t).water===v?v-1:v)}); rVital(); return; }
  if(a==="water-d"){ saludPon(t,"water",clamp((habit(t).water||0)+Number(el.dataset.d),0,20)); return; }
  if(a==="sleep"){ saludPon(t,"sleep",clamp(habit(t).sleep+0.5*Number(el.dataset.d),0,14)); return; }
  if(a==="screen"){ saludPon(t,"screen",clamp((habit(t).screen||0)+0.5*Number(el.dataset.d),0,16)); return; }
  if(a==="save-timetable"){
    for(var d0=0; d0<5; d0++){
      S.timetable[d0]={ start:$("#tt-start-"+d0).value||"08:00",
        len:clamp(Number($("#tt-len-"+d0).value)||55,20,120),
        before:clamp(Number($("#tt-b-"+d0).value)||0,0,10),
        after:clamp(Number($("#tt-a-"+d0).value)||0,0,10),
        brk:clamp(Number($("#tt-brk-"+d0).value)||0,0,120) };
    }
    save(); closeSheet(); render(); return;
  }
  if(a==="add-link"){
    var lb=($("#lk-label").value||"").trim(), u=($("#lk-url").value||"").trim();
    if(!lb||!u) return;
    if(!/^https?:\/\//i.test(u)) u="https://"+u;
    S.profile.school.name=($("#sc-name").value||"").trim();
    S.profile.school.links.push({label:lb,url:u});
    save(); sheetSchool(); render(); return;
  }
  if(a==="del-link"){ S.profile.school.links.splice(Number(el.dataset.i),1); save(); sheetSchool(); render(); return; }
  if(a==="import-ics"){
    var added=0;
    icsFound.filter(function(e){ return e.date>=addDays(today(),-1); }).forEach(function(e){
      var isExam=/examen|prueba|control|test|evaluaci|ebau/i.test(e.title);
      if(isExam){ if(!S.exams.some(function(x){return x.title===e.title && x.date===e.date})){
        S.exams.push({id:uid(),title:e.title,subject:(S.subjects[0]||{}).id||"",date:e.date,diff:"media"}); added++; } }
      else { var txt=e.title+" · "+fmt(e.date,{day:"numeric",month:"short"});
        if(!S.tasks.some(function(x){return x.text===txt})){ S.tasks.push({id:uid(),text:txt,cat:S.cats[0].id,done:false,day:today()}); added++; } }
    });
    save();
    var o=$("#ics-out"); if(o) o.innerHTML='<p class="text-[13px]" style="color:var(--good)">Listo: '+added+' cosas añadidas.</p>';
    render(); return;
  }
  if(a==="add-subject"){
    var nm2=($("#st-newsub").value||"").trim(); if(!nm2) return;
    S.subjects.push({id:uid(),name:nm2,short:nm2.slice(0,3).toUpperCase(),color:PAL[S.subjects.length%PAL.length]});
    save(); sheetSettings(); render(); return;
  }
  if(a==="del-subject"){
    S.subjects=S.subjects.filter(function(s){return s.id!==id});
    Object.keys(S.schedule).forEach(function(k){ var c=cellOf(k); if(c&&c.sid===id) delete S.schedule[k]; });
    save(); sheetSettings(); render(); return;
  }
  if(a==="save-settings"){
    var cs=$("#av-servidor"); if(cs) S.avisos.servidor=(cs.value||"").trim();
    S.profile.name=($("#st-name").value||"").trim();
    S.labels.app=($("#lb-app").value||"Peak.").trim()||"Peak.";
    S.labels.sub=($("#lb-sub").value||"").trim();
    ["resumen","retos","vital","academico","tareas"].forEach(function(k){
      var vv=($("#lb-"+k).value||"").trim(); if(vv) S.labels[k]=vv; });
    S.cats.forEach(function(c){ var e2=$("#cat-"+c.id); if(e2 && e2.value.trim()) c.name=e2.value.trim(); });
    S.mealNames=S.mealNames.map(function(m,i){ var e3=$("#mn-"+i); return (e3&&e3.value.trim())||m; });
    S.subjects.forEach(function(s){
      var n1e=$("#sn-"+s.id), s1=$("#ss-"+s.id);
      if(n1e && n1e.value.trim()) s.name=n1e.value.trim();
      if(s1 && s1.value.trim()) s.short=s1.value.trim().toUpperCase();
    });
    save(); closeSheet(); render(); return;
  }
  if(a==="reset"){
    if(el.dataset.armed!=="1"){ el.dataset.armed="1"; el.textContent="Toca otra vez para confirmar";
      setTimeout(function(){ if(el){el.dataset.armed="0"; el.textContent="Borrar todos los datos";} },4000); return; }
    var keepCh=S.challenges, keepId=S.ideal, keepLb=S.labels;
    S=seed(); S.challenges=keepCh; S.ideal=keepId; S.labels=keepLb;
    save(); closeSheet(); render(); return;
  }
});

document.addEventListener("input",function(ev){
  var tt=ev.target.closest?ev.target.closest("[data-tt]"):null; if(!tt) return;
  var d=+tt.dataset.tt, out=$("#tt-out-"+d); if(!out) return;
  var st=$("#tt-start-"+d).value||"08:00",
      len=clamp(Number($("#tt-len-"+d).value)||55,20,120),
      b=clamp(Number($("#tt-b-"+d).value)||0,0,10),
      a2=clamp(Number($("#tt-a-"+d).value)||0,0,10),
      bk=clamp(Number($("#tt-brk-"+d).value)||0,0,120);
  out.textContent = st+" – "+toHM(toMin(st)+(b+a2)*len+bk);
});
document.addEventListener("change",function(ev){
  var pick=ev.target.closest('[data-act="day-pick"]');
  if(pick){ var v2=pick.value; if(v2 && v2<=today()){ selDay=(v2===today()?null:v2); render(); } return; }
  var meal=ev.target.closest("[data-meal]");
  if(meal){ var md2=meal.dataset.day||today(), m=S.meals[md2]||{}; m[meal.dataset.meal]=meal.value.trim(); S.meals[md2]=m; save(); rVital(); return; }
  if(ev.target.id==="ics-file"){
    var f=ev.target.files&&ev.target.files[0]; if(!f) return;
    var rd=new FileReader();
    rd.onload=function(){ try{ showICS(parseICS(rd.result)); }catch(e){
      var o=$("#ics-out"); if(o) o.innerHTML='<p class="text-[12.5px]" style="color:var(--alert)">No he podido leer el archivo.</p>'; } };
    rd.readAsText(f);
  }
});
$("#cat-picker").addEventListener("click",function(e){ var b=e.target.closest("button"); if(!b) return; newCat=b.dataset.cat; rTareas(); });
$("#task-filter").addEventListener("click",function(e){ var b=e.target.closest("button"); if(!b) return; taskFilter=b.dataset.f; rTareas(); });
$("#task-input").addEventListener("keydown",function(e){ if(e.key==="Enter") addTask(); });
function fillTaskSubjects(){}
function addTask(){
  var i=$("#task-input"), v=(i.value||"").trim(); if(!v){ i.focus(); return; }
  var du=$("#task-due");
  S.tasks.unshift({id:uid(),text:v,cat:newCat,done:false,day:today(), due:(du&&du.value)||""});
  i.value=""; if(du) du.value="";
  save(); if(taskFilter==="hechas") taskFilter="pend"; render();
}
document.addEventListener("visibilitychange",function(){
  if(document.visibilityState==="hidden") sincronizarAlCerrar();
});
window.addEventListener("pagehide", sincronizarAlCerrar);
document.addEventListener("keydown",function(e){ if(e.key==="Escape"){ if(parteOn) parteClose(); else closeSheet(); } });
window.addEventListener("resize",function(){ moveMarker(); moveMTab(); fitBottomBar(); if(view==="retos") fitMedals(); });
if(window.visualViewport){
  window.visualViewport.addEventListener("resize",fitBottomBar);
  window.visualViewport.addEventListener("scroll",fitBottomBar);
}
if(window.ResizeObserver){
  try{ new ResizeObserver(function(){ fitBottomBar(); }).observe(document.body); }catch(e){}
}
var rafP=false,lastE=null;
document.addEventListener("pointermove",function(e){
  lastE=e; if(rafP) return; rafP=true;
  requestAnimationFrame(function(){
    rafP=false;
    var c=lastE.target.closest?lastE.target.closest(".glass"):null; if(!c) return;
    var r=c.getBoundingClientRect();
    c.style.setProperty("--mx",((lastE.clientX-r.left)/r.width*100)+"%");
    c.style.setProperty("--my",((lastE.clientY-r.top)/r.height*100)+"%");
  });
},{passive:true});


