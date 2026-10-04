/* ════════ sheets ════════ */
function closeBtn(){ return '<button class="icon-btn !w-8 !h-8" data-act="close-sheet" aria-label="Cerrar">'+
  '<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>'; }
function openSheet(h){ $("#sheet-body").innerHTML=h; $("#sheet").hidden=false; }
function closeSheet(){ $("#sheet").hidden=true; cellKey=null; diaAbierto=null; }

function sheetCell(key){
  cellKey=key;
  var cel=cellOf(key)||{sid:"",room:"",note:"",txt:""};
  var lib=(key.charAt(0)==="L"), p=(lib?key.slice(1):key).split("-");
  var sl=slotsFor(+p[0]), hh=null;
  for(var z=0;z<sl.length;z++) if(sl[z].ci===+p[1]) hh=sl[z];
  if(lib){
    openSheet('<div class="flex items-start justify-between mb-1"><h3 class="display text-[19px] font-bold">'+DAYS[+p[0]]+'</h3>'+closeBtn()+'</div>'+
      '<p class="text-[12.5px] t3 mb-5 num">'+(hh?hh.t+" – "+hh.e:"")+'</p>'+
      '<p class="eyebrow mb-2">Qué haces a esa hora</p>'+
      '<input id="cl-txt" class="field mb-4" maxlength="42" placeholder="Ej. Gimnasio, Trabajo, Estudiar francés" value="'+esc(cel.txt||"")+'">'+
      '<p class="eyebrow mb-2">Nota</p><input id="cl-note" class="field mb-5" maxlength="60" placeholder="Ej. llevar la mochila" value="'+esc(cel.note||"")+'">'+
      '<div class="flex gap-2"><button class="btn btn-quiet flex-1" data-act="clear-cell">Dejar libre</button>'+
      '<button class="btn btn-primary flex-1" data-act="save-cell">Guardar</button></div>');
    setTimeout(function(){ var e2=$("#cl-txt"); if(e2) e2.focus(); },140);
    return;
  }
  openSheet('<div class="flex items-start justify-between mb-1"><h3 class="display text-[19px] font-bold">'+DAYS[+p[0]]+'</h3>'+closeBtn()+'</div>'+
    '<p class="text-[12.5px] t3 mb-5 num">'+(hh?hh.t+" – "+hh.e:"")+'</p>'+
    '<p class="eyebrow mb-2">Asignatura</p>'+
    '<div class="space-y-2 mb-5 max-h-[210px] overflow-y-auto pr-1">'+ S.subjects.map(function(s){
      return '<button class="w-full flex items-center gap-3 px-4 py-2.5 rounded-[14px] text-left soft" data-act="pick-subject" data-sid="'+s.id+'" '+
        'style="'+(s.id===cel.sid?"background:var(--fill-hi);box-shadow:inset 0 0 0 1px var(--accent-line)":"")+'">'+
        '<span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:'+s.color+'"></span>'+
        '<span class="text-[13.5px] flex-1 truncate">'+esc(s.name)+'</span>'+
        '<span class="text-[11px] t3 font-semibold">'+esc(s.short)+'</span></button>'; }).join("")+'</div>'+
    '<div class="flex gap-2 mb-5"><input id="cl-nueva" class="field !py-2 !text-[13px]" maxlength="40" placeholder="¿Falta una? Escríbela aquí">'+
    '<button class="btn btn-quiet !px-4" data-act="nueva-asig">Añadir</button></div>'+
    '<p class="eyebrow mb-2">Aula</p><input id="cl-room" class="field mb-4" maxlength="18" placeholder="Ej. Aula 2B" value="'+esc(cel.room)+'">'+
    '<p class="eyebrow mb-2">Nota</p><input id="cl-note" class="field mb-5" maxlength="60" placeholder="Ej. traer calculadora" value="'+esc(cel.note)+'">'+
    '<div class="flex gap-2 mb-2"><button class="btn btn-quiet flex-1" data-act="clear-cell">Dejar libre</button>'+
    '<button class="btn btn-primary flex-1" data-act="save-cell">Guardar</button></div>'+
    (cel.sid?'<button class="btn btn-quiet w-full" data-act="homework" data-sid="'+cel.sid+'">Poner deberes de esta clase</button>':''));
}
function sheetExam(id){
  var e = id? (function(){ for(var i=0;i<S.exams.length;i++) if(S.exams[i].id===id) return S.exams[i]; return null; })() : null;
  openSheet('<div class="flex items-start justify-between mb-6"><h3 class="display text-[19px] font-bold">'+(e?"Editar evento":"Nuevo evento")+'</h3>'+closeBtn()+'</div>'+
    '<div class="space-y-3">'+
    '<div class="seg w-full" id="nx-tipo" style="display:grid;grid-template-columns:1fr 1fr 1fr">'+
    ["examen","entrega","otro"].map(function(k){ var sel=tipoDe(e)===k;
      return '<button data-k="'+k+'"'+(sel?' aria-pressed="true"':'')+'>'+TIPOS[k].l+'</button>'; }).join("")+'</div>'+
    '<input id="nx-title" class="field" maxlength="70" placeholder="Qué es" value="'+esc(e?e.title:"")+'">'+
    '<select id="nx-subject" class="field"><option value="">Sin asignatura</option>'+S.subjects.map(function(s){
      return '<option value="'+s.id+'"'+(e&&e.subject===s.id?" selected":"")+'>'+esc(s.name)+'</option>'; }).join("")+'</select>'+
    '<input id="nx-date" type="date" class="field" value="'+esc(e?e.date:addDays(today(),7))+'">'+
    '<div class="seg w-full" id="nx-diff" style="display:grid;grid-template-columns:1fr 1fr 1fr">'+
    ["baja","media","alta"].map(function(k){ var sel=(e?e.diff:"media")===k;
      return '<button data-d="'+k+'"'+(sel?' aria-pressed="true"':'')+'>'+DIFFL[k].l+'</button>'; }).join("")+'</div>'+
    (e?'':'<label class="flex items-center gap-2.5 px-1 py-1 text-[13px] t2 cursor-pointer">'+
      '<input type="checkbox" id="nx-plan" checked style="width:16px;height:16px;accent-color:var(--accent)">'+
      'Crear plan de repaso: una semana antes, tres días antes y la víspera. Solo para exámenes.</label>')+
    temasHTML(e)+
    '<button class="btn btn-primary w-full !py-3.5" data-act="save-exam" data-id="'+(e?e.id:"")+'">Guardar</button>'+
    (e?'<button class="btn btn-danger w-full" data-act="del-exam" data-id="'+e.id+'">Borrar examen</button>':'')+'</div>');
  $("#nx-tipo").dataset.value=tipoDe(e);
  $("#nx-tipo").addEventListener("click",function(ev){ var b=ev.target.closest("button"); if(!b) return;
    $$("#nx-tipo button").forEach(function(x){ x.setAttribute("aria-pressed",x===b?"true":"false"); });
    $("#nx-tipo").dataset.value=b.dataset.k; });
  $("#nx-diff").dataset.value=e?e.diff:"media";
  $("#nx-diff").addEventListener("click",function(ev){ var b=ev.target.closest("button"); if(!b) return;
    $$("#nx-diff button").forEach(function(x){ x.setAttribute("aria-pressed",x===b?"true":"false"); });
    $("#nx-diff").dataset.value=b.dataset.d; });
  setTimeout(function(){ var el=$("#nx-title"); if(el) el.focus(); },140);
}
function sheetTask(id, preset){
  var t=null; for(var i=0;i<S.tasks.length;i++) if(S.tasks[i].id===id) t=S.tasks[i];
  var nuevo=!t;
  if(nuevo) t={id:"",text:(preset&&preset.text)||"",cat:(preset&&preset.cat)||(S.cats[0]||{}).id,due:(preset&&preset.due)||""};
  openSheet('<div class="flex items-start justify-between mb-6"><h3 class="display text-[19px] font-bold">'+(nuevo?"Nuevos deberes":"Editar tarea")+'</h3>'+closeBtn()+'</div>'+
    '<input id="tk-text" class="field mb-3" maxlength="120" placeholder="Qué hay que hacer" value="'+esc(t.text)+'">'+
    '<div class="grid grid-cols-2 gap-2 mb-3">'+
      ''+
        S.subjects.map(function(x){ return '<option value="'+x.id+'"'+(x.id===t.subject?" selected":"")+'>'+esc(x.name)+'</option>'; }).join("")+'</select>'+
      '<input id="tk-due" type="date" class="field !py-2.5 !text-[13px]" value="'+esc(t.due||"")+'"></div>'+
    '<div class="seg w-full mb-5" id="tk-cat" style="display:grid;grid-template-columns:repeat('+S.cats.length+',1fr)">'+
    S.cats.map(function(c){ return '<button data-c="'+c.id+'"'+(c.id===t.cat?' aria-pressed="true"':'')+'>'+esc(c.name)+'</button>'; }).join("")+'</div>'+
    '<button class="btn btn-primary w-full" data-act="save-task" data-id="'+(t.id||"")+'">Guardar</button>');
  $("#tk-cat").dataset.value=t.cat;
  $("#tk-cat").addEventListener("click",function(ev){ var b=ev.target.closest("button"); if(!b) return;
    $$("#tk-cat button").forEach(function(x){ x.setAttribute("aria-pressed",x===b?"true":"false"); });
    $("#tk-cat").dataset.value=b.dataset.c; });
}
function sheetIdeal(editId){
  var items=ordenIdeal(idealActivos());
  var ed=null; if(editId){ for(var i=0;i<S.ideal.length;i++) if(S.ideal[i].id===editId) ed=S.ideal[i]; }
  openSheet('<div class="flex items-start justify-between mb-2"><h3 class="display text-[19px] font-bold">Hábitos</h3>'+closeBtn()+'</div>'+
    '<p class="text-[12.5px] t3 mb-5">Se repite cada día. Cada mañana empieza limpia.</p>'+
    '<div class="space-y-2 mb-5 max-h-[240px] overflow-y-auto pr-1">'+ items.map(function(it){
      return '<div class="soft flex items-center gap-2.5 px-3 py-2.5">'+
        '<span class="w-2 h-2 rounded-full shrink-0" style="background:'+(TAGV[it.tag]||"var(--accent)")+'"></span>'+
        '<span class="num text-[11.5px] t3 w-[40px] shrink-0">'+esc(it.time||"")+'</span>'+
        '<span class="text-[13px] flex-1 truncate">'+esc(it.text)+'</span>'+
        '<button class="icon-btn bare !w-7 !h-7" data-act="edit-ideal-item" data-id="'+it.id+'" aria-label="Editar">'+ICON_PEN+'</button>'+
        '<button class="icon-btn bare !w-7 !h-7" data-act="del-ideal" data-id="'+it.id+'" aria-label="Quitar">'+ICON_TRASH+'</button></div>'; }).join("")
      + (items.length?'':'<p class="text-[13px] t3 py-4 text-center">Sin pasos todavía.</p>')+'</div>'+
    '<p class="eyebrow mb-2">'+(ed?"Editar paso":"Añadir paso")+'</p>'+
    '<div class="flex gap-2 mb-1.5"><input id="id-time" type="time" class="field !w-[128px]" value="'+esc(ed?(ed.time||""):"")+'">'+
    '<input id="id-text" class="field flex-1" maxlength="60" placeholder="Qué haces" value="'+esc(ed?ed.text:"")+'"></div>'+
    '<p class="text-[11.5px] t3 mb-3">La hora es opcional. Los pasos sin hora van al final de la lista.</p>'+
    '<div class="seg w-full mb-4" id="id-tag" style="display:grid;grid-template-columns:1fr 1fr 1fr">'+
    ["vital","estudio","personal"].map(function(k){ var sel=(ed?ed.tag:"vital")===k;
      return '<button data-t="'+k+'"'+(sel?' aria-pressed="true"':'')+'>'+cap(k)+'</button>'; }).join("")+'</div>'+
    '<button class="btn btn-primary w-full" data-act="add-ideal" data-id="'+(ed?ed.id:"")+'">'+(ed?"Guardar cambios":"Añadir al día")+'</button>');
  $("#id-tag").dataset.value=ed?ed.tag:"vital";
  $("#id-tag").addEventListener("click",function(ev){ var b=ev.target.closest("button"); if(!b) return;
    $$("#id-tag button").forEach(function(x){ x.setAttribute("aria-pressed",x===b?"true":"false"); });
    $("#id-tag").dataset.value=b.dataset.t; });
}
function sheetChallenges(editId){
  var ed=null; if(editId){ for(var i=0;i<S.challenges.length;i++) if(S.challenges[i].id===editId) ed=S.challenges[i]; }
  openSheet('<div class="flex items-start justify-between mb-2"><h3 class="display text-[19px] font-bold">Mis retos</h3>'+closeBtn()+'</div>'+
    '<p class="text-[12.5px] t3 mb-5">Cada día se eligen tres de esta lista. Cuantos más tengas, menos se repiten.</p>'+
    '<div class="space-y-2 mb-5 max-h-[280px] overflow-y-auto pr-1">'+ S.challenges.map(function(c){
      return '<div class="soft flex items-center gap-2.5 px-3 py-2.5">'+
        '<span class="text-[13px] flex-1 leading-snug">'+esc(c.text)+'</span>'+
        '<button class="icon-btn bare !w-7 !h-7 shrink-0" data-act="edit-ch" data-id="'+c.id+'" aria-label="Editar">'+ICON_PEN+'</button>'+
        '<button class="icon-btn bare !w-7 !h-7 shrink-0" data-act="del-ch" data-id="'+c.id+'" aria-label="Quitar">'+ICON_TRASH+'</button></div>'; }).join("")
      + (S.challenges.length?'':'<p class="text-[13px] t3 py-4 text-center">Lista vacía.</p>')+'</div>'+
    '<p class="eyebrow mb-2">'+(ed?"Editar reto":"Nuevo reto")+'</p>'+
    '<input id="ch-text" class="field mb-3" maxlength="90" placeholder="Ej. Diez minutos de estiramientos" value="'+esc(ed?ed.text:"")+'">'+
    '<button class="btn btn-primary w-full" data-act="save-ch" data-id="'+(ed?ed.id:"")+'">'+(ed?"Guardar cambios":"Añadir reto")+'</button>');
}
function sheetTimetable(){
  var A=agenda();
  var cabecera='<div class="flex items-start justify-between mb-2"><h3 class="display text-[19px] font-bold">La semana</h3>'+closeBtn()+'</div>'+
    '<div class="seg w-full mb-5" style="display:grid;grid-template-columns:1fr 1fr">'+
      '<button data-act="agenda-modo" data-m="clase"'+(A.modo==="clase"?' aria-pressed="true"':'')+'>Horario de clase</button>'+
      '<button data-act="agenda-modo" data-m="libre"'+(A.modo==="libre"?' aria-pressed="true"':'')+'>Semana libre</button>'+
    '</div>';
  if(A.modo==="libre"){
    openSheet(cabecera+
      '<p class="text-[12.5px] t3 mb-5 leading-relaxed">Siete días y las horas que tú digas, sin recreo y sin asignaturas: en cada hueco escribes lo que quieras.</p>'+
      '<div class="grid grid-cols-3 gap-2 mb-5">'+
        '<label class="block"><span class="block text-[10.5px] t3 mb-1">Empieza</span><input id="ag-ini" type="time" class="field !py-2 !text-[13px]" value="'+A.ini+'"></label>'+
        '<label class="block"><span class="block text-[10.5px] t3 mb-1">Acaba</span><input id="ag-fin" type="time" class="field !py-2 !text-[13px]" value="'+A.fin+'"></label>'+
        '<label class="block"><span class="block text-[10.5px] t3 mb-1">Cada</span><select id="ag-paso" class="field !py-2 !text-[13px]">'+
          [30,60,90,120].map(function(p){ return '<option value="'+p+'"'+(A.paso===p?" selected":"")+'>'+(p<60?p+" min":(p/60)+" h")+'</option>'; }).join("")+
        '</select></label>'+
      '</div>'+
      '<p class="text-[11.5px] t3 mb-5 leading-relaxed">Tu horario de clase se queda guardado: si vuelves a «Horario de clase» lo encuentras igual que lo dejaste.</p>'+
      '<button class="btn btn-primary w-full !py-3.5" data-act="save-agenda">Guardar</button>');
    return;
  }
  var rows = DAYS.slice(0,5).map(function(nm,d){
    var c=ttOf(d);
    return '<div class="soft px-3.5 py-3 mb-2">'+
      '<div class="flex items-center justify-between mb-2.5"><span class="text-[13px] font-semibold">'+nm+'</span>'+
      '<span class="text-[11px] num t3" id="tt-out-'+d+'">'+dayRange(d)+'</span></div>'+
      '<div class="grid gap-1.5" style="grid-template-columns:1.35fr .75fr .9fr .75fr .8fr">'+
        '<label class="block"><span class="block text-[9.5px] t3 mb-1">Inicio</span><input id="tt-start-'+d+'" data-tt="'+d+'" type="time" class="field !px-2 !py-1.5 !text-[12px] !rounded-[9px]" value="'+c.start+'"></label>'+
        '<label class="block"><span class="block text-[9.5px] t3 mb-1">Antes</span><input id="tt-b-'+d+'" data-tt="'+d+'" class="field !px-2 !py-1.5 !text-[12px] !rounded-[9px] text-center" inputmode="numeric" maxlength="2" value="'+c.before+'"></label>'+
        '<label class="block"><span class="block text-[9.5px] t3 mb-1">Recreo</span><input id="tt-brk-'+d+'" data-tt="'+d+'" class="field !px-2 !py-1.5 !text-[12px] !rounded-[9px] text-center" inputmode="numeric" maxlength="3" value="'+c.brk+'"></label>'+
        '<label class="block"><span class="block text-[9.5px] t3 mb-1">Después</span><input id="tt-a-'+d+'" data-tt="'+d+'" class="field !px-2 !py-1.5 !text-[12px] !rounded-[9px] text-center" inputmode="numeric" maxlength="2" value="'+c.after+'"></label>'+
        '<label class="block"><span class="block text-[9.5px] t3 mb-1">Clase</span><input id="tt-len-'+d+'" data-tt="'+d+'" class="field !px-2 !py-1.5 !text-[12px] !rounded-[9px] text-center" inputmode="numeric" maxlength="3" value="'+c.len+'"></label>'+
      '</div></div>'; }).join("");
  openSheet(cabecera+
    '<p class="text-[12.5px] t3 mb-5">Clases antes y después del recreo, en minutos. La salida se calcula sola.</p>'+
    '<div class="max-h-[46vh] overflow-y-auto pr-1 mb-5">'+rows+'</div>'+
    '<button class="btn btn-primary w-full !py-3.5" data-act="save-timetable">Guardar horario</button>');
}
var icsFound=[];
function parseICS(text){
  var lines=String(text).replace(/\r\n/g,"\n").replace(/\n[ \t]/g,"").split("\n"), out=[], cur=null;
  for(var i=0;i<lines.length;i++){
    var L=lines[i];
    if(L.indexOf("BEGIN:VEVENT")===0){ cur={}; continue; }
    if(L.indexOf("END:VEVENT")===0){ if(cur&&cur.title&&cur.date) out.push(cur); cur=null; continue; }
    if(!cur) continue;
    var c=L.indexOf(":"); if(c<0) continue;
    var key=L.slice(0,c).toUpperCase(), val=L.slice(c+1);
    if(key.indexOf("SUMMARY")===0) cur.title=val.replace(/\\,/g,",").replace(/\\n/gi," ").trim();
    if(key.indexOf("DTSTART")===0){ var m=val.match(/(\d{4})(\d{2})(\d{2})/); if(m) cur.date=m[1]+"-"+m[2]+"-"+m[3]; }
  }
  return out;
}
function showICS(events){
  icsFound=events;
  var box=$("#ics-out"); if(!box) return;
  if(!events.length){ box.innerHTML='<p class="text-[12.5px]" style="color:var(--alert)">No he encontrado eventos con fecha.</p>'; return; }
  var recent=events.filter(function(e){ return e.date>=addDays(today(),-1); });
  box.innerHTML='<p class="text-[12.5px] t3 mb-3">'+recent.length+' eventos futuros.</p>'+
    '<div class="space-y-1.5 mb-4 max-h-[160px] overflow-y-auto pr-1">'+ recent.slice(0,40).map(function(e){
      return '<div class="flex items-center gap-2.5 text-[12.5px]"><span class="num t3 w-[54px] shrink-0">'+fmt(e.date,{day:"numeric",month:"short"})+'</span>'+
        '<span class="truncate">'+esc(e.title)+'</span></div>'; }).join("")+'</div>'+
    '<button class="btn btn-primary w-full" data-act="import-ics">Importar '+recent.length+'</button>';
}
function sheetSchool(){
  var sc=S.profile.school;
  openSheet('<div class="flex items-start justify-between mb-2"><h3 class="display text-[19px] font-bold">Mi colegio</h3>'+closeBtn()+'</div>'+
    '<p class="text-[12.5px] t3 mb-5">Tus accesos y la importación del calendario.</p>'+
    '<p class="eyebrow mb-2">Centro</p><input id="sc-name" class="field mb-5" maxlength="40" value="'+esc(sc.name)+'" placeholder="Nombre del centro">'+
    '<p class="eyebrow mb-2">Accesos rápidos</p><div class="space-y-2 mb-3">'+ (sc.links.length? sc.links.map(function(l,i){
      return '<div class="soft flex items-center gap-3 px-3.5 py-2.5"><span class="text-[13px] flex-1 truncate">'+esc(l.label)+'</span>'+
        '<a href="'+esc(l.url)+'" target="_blank" rel="noopener noreferrer" class="text-[11.5px] font-semibold" style="color:var(--accent)">Abrir</a>'+
        '<button class="icon-btn bare !w-7 !h-7" data-act="del-link" data-i="'+i+'" aria-label="Quitar">'+ICON_TRASH+'</button></div>';
    }).join("") : '<p class="text-[13px] t3 py-2">Ninguno guardado.</p>')+'</div>'+
    '<div class="flex gap-2 mb-6"><input id="lk-label" class="field !w-[36%]" maxlength="20" placeholder="Nombre">'+
    '<input id="lk-url" class="field flex-1" placeholder="https://…"></div>'+
    '<button class="btn btn-quiet w-full mb-6" data-act="add-link">Guardar acceso</button>'+
    '<div class="divider mb-5"></div><p class="eyebrow mb-2">Calendario del aula virtual</p>'+
    '<p class="text-[12.5px] t3 mb-3 leading-relaxed">Si tu plataforma deja exportar el calendario en <span class="num">.ics</span>, súbelo: lo leo aquí mismo y lo convierto en exámenes y tareas.</p>'+
    '<input type="file" id="ics-file" accept=".ics,text/calendar" class="field mb-3" style="padding:9px 12px;font-size:12.5px">'+
    '<div id="ics-out"></div>');
}


/* ═══════════ LO QUE DIRÁN LOS AVISOS ═══════════
   El servidor solo dice "es de mañana" o "es de noche".
   El texto lo compone aquí el propio móvil con tus datos, que no salen
   de él, y se guarda para que el trozo que corre en segundo plano lo lea. */
function rellena(txt, datos){
  return (txt||"").replace(/\{(\w+)\}/g, function(_, k){ return datos[k]!=null ? datos[k] : ""; }).replace(/\s+/g," ").trim();
}
function txAviso(k){ return ((TEXTOS.avisos&&TEXTOS.avisos.textos)||{})[k] || {t:"Peak.", b:""}; }

function claseDe(fecha){                       /* qué toca ese día */
  var w=new Date(fecha+"T00:00:00").getDay();
  var di = esLibre() ? (w+6)%7 : ((w===0||w===6)?-1:w-1);
  if(di<0) return null;
  var sl=slotsFor(di), n=0, primera="";
  for(var i=0;i<sl.length;i++){
    if(sl[i].r) continue;
    var cel=cellOf(claveCelda(di,sl[i].ci)), sb=cel?subj(cel.sid):null;
    var txt=cel&&cel.txt?cel.txt:"";
    if(sb||txt){ n++; if(!primera) primera=sb?sb.name:txt; }
  }
  return {n:n, primera:primera, rango:dayRange(di)};
}
function avisosManana(fecha){
  var out=[], cl=claseDe(fecha);
  var pend=S.tasks.filter(function(t){ return !t.done; }).length;
  var tareasTxt = pend===0 ? "Nada pendiente." : pend===1 ? "Tienes 1 tarea pendiente." : "Tienes "+pend+" tareas pendientes.";
  if(cl && cl.n){
    var base=txAviso("manana");
    out.push({ t:base.t, b:rellena(base.b, {
      clases: cl.n+(cl.n===1?" clase":" clases")+(cl.primera?", empiezas con "+cl.primera:"")+" · "+cl.rango,
      tareas: tareasTxt }) });
  } else {
    var f=txAviso("finde");
    out.push({ t:f.t, b:rellena(f.b, {tareas:tareasTxt}) });
  }

  /* la cuenta atrás avisa cuando se acerca */
  var dEv=diff(fecha, S.profile.ebau), nEv=S.profile.evento||"tu día";
  if(!isNaN(dEv) && [30,7,3,1,0].indexOf(dEv)>=0){
    var ev0 = dEv===0 ? txAviso("eventoHoy") : txAviso("evento");
    out.push({ t:rellena(ev0.t,{evento:nEv}), b:rellena(ev0.b,{evento:nEv, dias:dEv}) });
  }

  /* examen dentro de tres días y entrega de mañana, contados desde el día del aviso */
  var ex=null, exDia=addDays(fecha,3);
  for(var i=0;i<S.exams.length;i++) if(S.exams[i].date===exDia){ ex=S.exams[i]; break; }
  var tr=null, trDia=addDays(fecha,1);
  for(var j=0;j<S.tasks.length;j++) if(!S.tasks[j].done && S.tasks[j].due===trDia){ tr=S.tasks[j]; break; }

  if(ex && tr){
    var a=txAviso("ambos"), sbA=subj(ex.subject);
    out.push({ t:a.t, b:rellena(a.b, {asignatura:(sbA?sbA.name:ex.title), tarea:tr.text}) });
  } else if(ex){
    var sbE=subj(ex.subject);
    if(tipoDe(ex)==="examen"){
      var e2=txAviso("examen");
      out.push({ t:e2.t, b:rellena(e2.b, {asignatura:(sbE?sbE.name:ex.title), dia:fmt(ex.date,{weekday:"long",day:"numeric"})}) });
    } else {
      var e3=txAviso("otroEvento");
      out.push({ t:rellena(e3.t,{tipo:tipoL(ex)}), b:rellena(e3.b, {titulo:ex.title, dia:fmt(ex.date,{weekday:"long",day:"numeric"})}) });
    }
  } else if(tr){
    var t2=txAviso("entrega");
    out.push({ t:t2.t, b:rellena(t2.b, {tarea:tr.text}) });
  }
  return out.slice(0,2);
}
function avisoNoche(fecha){
  var tmap=tasksByDay(), st=stats();
  if(S.parte && S.parte[fecha]){
    var h=txAviso("nocheHecho");
    if(new Date(fecha+"T12:00:00").getDay()===0 && typeof xpSemana==="function")
      return { t:"Tu semana", b:xpSemana(lunesDe(fecha))+" XP esta semana. Tu resumen ya está listo." };
    return { t:h.t, b:rellena(h.b, {xp:dayXP(fecha,tmap), racha:(st.streak===1?"1 día de racha":st.streak+" días de racha")}) };
  }
  var falta=[], tc=todaysChallenges(fecha).length, hechos=chOf(fecha).length;
  if(tc-hechos>0) falta.push("te faltan "+(tc-hechos)+(tc-hechos===1?" reto":" retos"));
  var n=idealActivos().length, ck=checksOf(fecha).length;
  if(n && ck<n) falta.push(ck===0?"los hábitos sin tocar":"los hábitos a medias");
  if(!wentGym(fecha)) falta.push("el ejercicio sin marcar");
  var f=txAviso("noche");
  var txtF = falta.length ? (falta.slice(0,2).join(" y ")+".") : "Un minuto y ya.";
  if(new Date(fecha+"T12:00:00").getDay()===0) txtF+=" Luego, tu resumen de la semana.";
  return { t:f.t, b:rellena(f.b, {falta: txtF.charAt(0).toUpperCase()+txtF.slice(1)}) };
}

function guardarEspejo(){
  if(!("indexedDB" in window)) return;
  var hoy=today();
  var datos={ fecha:hoy, noche:avisoNoche(hoy), mananaHoy:avisosManana(hoy), mananaSig:avisosManana(addDays(hoy,1)), viejo:txAviso("viejo") };
  (function trAv(o){ if(!o) return; if(Array.isArray(o)){ o.forEach(trAv); return; } if(o.t!=null){ o.t=tr(o.t); o.b=tr(o.b); } })([datos.noche, datos.mananaHoy, datos.mananaSig, datos.viejo]);
  try{
    var req=indexedDB.open("dutrack",1);
    req.onupgradeneeded=function(){ try{ req.result.createObjectStore("estado"); }catch(e){} };
    req.onsuccess=function(){
      try{
        var db=req.result, tx=db.transaction("estado","readwrite");
        tx.objectStore("estado").put(datos,"avisos");
        tx.oncomplete=function(){ db.close(); };
      }catch(e){}
    };
  }catch(e){}
}
var espejoPend=null;
function espejo(){ clearTimeout(espejoPend); espejoPend=setTimeout(guardarEspejo, 800); }


/* ═══════════ AVISOS DIARIOS ═══════════ */
function servidorAvisos(){
  var puesto = ((S.avisos&&S.avisos.servidor) || (TEXTOS.avisos&&TEXTOS.avisos.servidor) || "").trim();
  if(puesto) return puesto.replace(/\/+$/,"");
  /* si no hay nada puesto, se prueba con el propio sitio desde el que se abre la app:
     si el servidor de avisos sirve también la app, no hay nada que configurar */
  try{
    if(window.top!==window.self) return "";
    if(location.protocol!=="http:" && location.protocol!=="https:") return "";
    return location.origin.replace(/\/+$/,"");
  }catch(e){ return ""; }
}
function avisosPropios(){ return !((S.avisos&&S.avisos.servidor)||(TEXTOS.avisos&&TEXTOS.avisos.servidor)||"").trim(); }
function claveAvisos(){ return (TEXTOS.avisos&&TEXTOS.avisos.clave)||""; }
function hayAvisos(){
  return !!(window.isSecureContext && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window);
}
function instalada(){
  return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || window.navigator.standalone === true;
}
function esIOS(){ return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform==="MacIntel" && navigator.maxTouchPoints>1); }
function aBytes(b64){
  var s=(b64+"=".repeat((4-b64.length%4)%4)).replace(/-/g,"+").replace(/_/g,"/");
  var bin=atob(s), out=new Uint8Array(bin.length);
  for(var i=0;i<bin.length;i++) out[i]=bin.charCodeAt(i);
  return out;
}
function desfaseHoras(){ return -Math.round(new Date().getTimezoneOffset()/60); }

function avisoEstado(txt, mal){
  var e=$("#av-estado"); if(!e) return;
  e.textContent=txt||"";
  e.style.color = mal ? "var(--alert)" : "var(--t3)";
}
async function activarAvisos(){
  var url=servidorAvisos();
  if(!url){ avisoEstado("Falta la dirección del servidor de avisos.", true); return false; }
  if(!hayAvisos()){ avisoEstado("Este navegador no admite avisos.", true); return false; }
  if(esIOS() && !instalada()){ avisoEstado("En iPhone hay que añadirla a la pantalla de inicio y abrirla desde ahí.", true); return false; }
  try{
    var permiso = await Notification.requestPermission();
    if(permiso!=="granted"){ avisoEstado("No has dado permiso para los avisos.", true); return false; }
    var reg = await navigator.serviceWorker.ready;
    var sub = await reg.pushManager.getSubscription();
    if(!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly:true, applicationServerKey: aBytes(claveAvisos()) });
    var r = await fetch(url+"/alta", { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ sub: sub.toJSON(), hm: S.avisos.hm, hn: S.avisos.hn, desfase: desfaseHoras(), hab: (typeof avisosHabitos==="function"?avisosHabitos():[]) }) });
    if(!r.ok){ avisoEstado("El servidor ha contestado con un error ("+r.status+").", true); return false; }
    S.avisos.activo=true; S.avisos.endpoint=sub.endpoint; save();
    avisoEstado("Listo. Te aviso a las "+S.avisos.hm+":00 y a las "+S.avisos.hn+":00.");
    return true;
  }catch(e){ avisoEstado("No se ha podido activar: "+(e.message||e), true); return false; }
}
async function desactivarAvisos(){
  var url=servidorAvisos();
  try{
    var reg = await navigator.serviceWorker.ready;
    var sub = await reg.pushManager.getSubscription();
    if(sub){ if(url) await fetch(url+"/baja",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({endpoint:sub.endpoint})}).catch(function(){}); await sub.unsubscribe().catch(function(){}); }
  }catch(e){}
  S.avisos.activo=false; S.avisos.endpoint=""; save();
  avisoEstado("Avisos apagados.");
}
async function probarAviso(){
  var url=servidorAvisos();
  if(!url || !S.avisos.activo){ avisoEstado("Primero activa los avisos.", true); return; }
  try{
    var reg = await navigator.serviceWorker.ready;
    var sub = await reg.pushManager.getSubscription();
    if(!sub){ avisoEstado("No hay suscripción activa.", true); return; }
    avisoEstado("Enviando…");
    var r = await fetch(url+"/prueba",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sub:sub.toJSON()})});
    var d = await r.json().catch(function(){ return {}; });
    avisoEstado(d.ok ? "Enviado. Debería llegarte en unos segundos." : ("El servidor ha dicho que no ("+(d.estado||r.status)+")."), !d.ok);
  }catch(e){ avisoEstado("No se ha podido enviar: "+(e.message||e), true); }
}
/* al abrir la app se refresca la suscripción, por si cambió la hora oficial */
function refrescarAvisos(){
  if(!S.avisos || !S.avisos.activo || !servidorAvisos() || !hayAvisos()) return;
  navigator.serviceWorker.ready.then(function(reg){
    return reg.pushManager.getSubscription();
  }).then(function(sub){
    if(!sub) return;
    return fetch(servidorAvisos()+"/alta",{ method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ sub: sub.toJSON(), hm: S.avisos.hm, hn: S.avisos.hn, desfase: desfaseHoras(), hab: (typeof avisosHabitos==="function"?avisosHabitos():[]) }) });
  }).catch(function(){});
}

function sheetModalidad(){
  var ops=[["tec","Ciencias y Tecnología"],["sal","Ciencias de la Salud"],
           ["soc","Ciencias Sociales"],["hum","Humanidades"],["art","Artes"],
           ["otro","Otra cosa: universidad, FP, oposiciones…"]];
  openSheet('<div class="flex items-start justify-between mb-4">'+
    '<div><p class="eyebrow mb-1.5">Tu horario</p><h3 class="display text-[20px] font-bold">¿Qué estudias?</h3></div>'+closeBtn()+'</div>'+
    '<p class="text-[13.5px] t2 leading-relaxed mb-5">Si estás en Bachillerato, te dejo puestas las comunes y las de tu modalidad. Si estudias otra cosa, empiezas con el horario vacío. Lo que falte se añade desde el propio horario al tocar un hueco.</p>'+
    '<div class="space-y-1.5">'+ops.map(function(o){
      return '<button class="soft w-full text-left px-4 py-3.5 text-[13.5px]" data-act="modalidad" data-m="'+o[0]+'">'+o[1]+'</button>'; }).join("")+'</div>');
}
function sheetSettings(){
  var L=S.labels;
  openSheet('<div class="flex items-start justify-between mb-6"><h3 class="display text-[19px] font-bold">Ajustes</h3>'+closeBtn()+'</div>'+
    '<p class="eyebrow mb-2">Tu nombre</p><input id="st-name" class="field mb-5" maxlength="24" value="'+esc(S.profile.name)+'" placeholder="Para el saludo">'+

    selectorIdioma()+
    '<p class="eyebrow mb-2">Apariencia</p>'+
    '<div class="grid grid-cols-2 gap-2 mb-6" id="st-theme">'+
      TEMAS.map(function(t){
        var bloq = t.nv && nivelCache<t.nv;
        return '<button class="soft px-4 py-3 text-left text-[13px]'+(bloq?' tema-bloq':'')+'" data-th="'+t.k+'"'+(bloq?' data-bloq="'+t.nv+'"':'')+'>'+
          t.n+(bloq?'<span class="t3" style="float:right;font-size:11.5px">nivel '+t.nv+'</span>':'')+'</button>'; }).join("")+
    '</div>'+
    selectorAcento()+
    selectorPrefs()+
    '<p class="eyebrow mb-2">Avisos diarios</p>'+
    '<p class="text-[12.5px] t3 mb-3 leading-relaxed">Dos avisos al día, y otro cuando tengas un examen a tres días o una entrega mañana. El texto lo escribe tu móvil: tus datos no salen de aquí. '+
      (esIOS()&&!instalada() ? 'En iPhone solo funciona con la app añadida a la pantalla de inicio.' : 'Hace falta dar permiso una vez.')+'</p>'+
    '<p class="text-[11.5px] t3 mb-1.5">Por la mañana, con lo que toca hoy</p>'+
    '<div class="flex gap-2 mb-3">'+
      [6,7,8,9].map(function(h){
        var on=(S.avisos.hm===h);
        return '<button class="flex-1 py-2.5 rounded-[12px] text-[13px] num" data-act="av-hora" data-k="hm" data-h="'+h+'" style="'+
          (on?"background:var(--accent);color:var(--on-accent)":"background:var(--fill);color:var(--t2);box-shadow:inset 0 0 0 1px var(--hairline-2)")+
          ';transition:all .3s var(--spring)">'+h+':00</button>'; }).join("")+
    '</div>'+
    '<p class="text-[11.5px] t3 mb-1.5">Por la noche, en el Parte del día</p>'+
    '<div class="flex gap-2 mb-3">'+
      [20,21,22,23].map(function(h){
        var on=(S.avisos.hn===h);
        return '<button class="flex-1 py-2.5 rounded-[12px] text-[13px] num" data-act="av-hora" data-k="hn" data-h="'+h+'" style="'+
          (on?"background:var(--accent);color:var(--on-accent)":"background:var(--fill);color:var(--t2);box-shadow:inset 0 0 0 1px var(--hairline-2)")+
          ';transition:all .3s var(--spring)">'+h+':00</button>'; }).join("")+
    '</div>'+
    '<div class="flex gap-2 mb-2">'+
      '<button class="btn '+(S.avisos.activo?"btn-quiet":"btn-primary")+' flex-1" data-act="av-toggle">'+
        (S.avisos.activo?"Apagar avisos":"Activar avisos")+'</button>'+
      (S.avisos.activo?'<button class="btn btn-quiet" data-act="av-probar">Probar</button>':'')+
    '</div>'+
    '<p id="av-estado" class="text-[11.5px] t3 mb-3 leading-relaxed">'+(S.avisos.activo?("Activos a las "+S.avisos.hm+":00 y a las "+S.avisos.hn+":00."):"")+'</p>'+
    '<div class="flex items-center justify-between mb-6">'+
      '<span class="text-[11.5px] t3">'+(avisosPropios()?"Servidor: el mismo sitio donde está la app":"Servidor de avisos configurado")+'</span>'+
      '<button class="text-[11.5px] t3 underline" data-act="av-srv-ver">cambiar</button></div>'+
    '<input id="av-servidor" class="field !py-2 mb-6" placeholder="https://…" value="'+esc(S.avisos.servidor||"")+'" hidden>'+
    '<p class="eyebrow mb-2">Copia de seguridad</p>'+
    '<p class="text-[12.5px] t3 mb-3 leading-relaxed">Todo se guarda solo en este dispositivo. Si borras los datos del navegador, se va. Descarga una copia de vez en cuando.</p>'+
    '<div class="flex gap-2 mb-3"><button class="btn btn-quiet flex-1" data-act="export">Descargar copia</button>'+
    '<button class="btn btn-quiet flex-1" data-act="import-open">Importar</button></div>'+
    '<div id="imp-box" class="mb-6" hidden>'+
      '<textarea id="imp-text" class="field mb-2" rows="4" placeholder="Pega aquí el contenido del archivo de copia (o el horario que te hayan pasado)"></textarea>'+
      '<div class="flex gap-2"><button class="btn btn-primary flex-1" data-act="import-all">Restaurar todo</button>'+
      '<button class="btn btn-quiet flex-1" data-act="import-sched">Solo el horario</button></div>'+
      '<p class="text-[11.5px] t3 mt-2">«Restaurar todo» pisa lo que tengas ahora. «Solo el horario» cambia asignaturas y clases y deja tus tareas, retos y rachas intactos.</p>'+
    '</div>'+
    '<details class="aj-avanzado mb-6"'+(typeof ajAvanzado!=="undefined"&&ajAvanzado?' open':'')+'><summary>Avanzado</summary><div>'+
    '<p class="eyebrow mb-2">Nombre de la app</p>'+
    '<div class="flex gap-2 mb-5"><input id="lb-app" class="field !w-[45%]" maxlength="18" value="'+esc(L.app)+'">'+
    '<input id="lb-sub" class="field flex-1" maxlength="24" value="'+esc(L.sub)+'" placeholder="Subtítulo"></div>'+
    '<p class="eyebrow mb-2">Nombre de las secciones</p><div class="grid grid-cols-2 gap-2 mb-5">'+
      ["resumen","retos","vital","academico","tareas"].map(function(k){
        return '<input id="lb-'+k+'" class="field !py-2 !text-[13px]" maxlength="16" value="'+esc(L[k])+'">'; }).join("")+'</div>'+

    '<p class="eyebrow mb-2" style="display:none">Nombre de las comidas</p><div class="grid grid-cols-2 gap-2 mb-5" style="display:none">'+
      S.mealNames.map(function(m,i){ return '<input id="mn-'+i+'" class="field !py-2 !text-[13px]" maxlength="18" value="'+esc(m)+'">'; }).join("")+'</div>'+
    '<p class="eyebrow mb-2">Asignaturas</p><div class="space-y-2 mb-3 max-h-[210px] overflow-y-auto pr-1">'+
      S.subjects.map(function(s){ return '<div class="flex items-center gap-2">'+
        '<span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:'+s.color+'"></span>'+
        '<input id="sn-'+s.id+'" class="field !py-2 !text-[13px] flex-1" maxlength="34" value="'+esc(s.name)+'">'+
        '<input id="ss-'+s.id+'" class="field !py-2 !text-[13px] !w-[64px] text-center" maxlength="5" value="'+esc(s.short)+'">'+
        '<button class="icon-btn bare !w-7 !h-7 shrink-0" data-act="del-subject" data-id="'+s.id+'" aria-label="Quitar">'+ICON_TRASH+'</button></div>'; }).join("")+'</div>'+
    '<div class="flex gap-2 mb-6"><input id="st-newsub" class="field" maxlength="34" placeholder="Añadir asignatura">'+
    '<button class="btn btn-quiet" data-act="add-subject">+</button></div>'+
    '</div></details>'+
    (typeof ajustesCuenta==="function"?ajustesCuenta():"")+
    '<button class="btn btn-quiet w-full mb-3" data-act="tour-open">Ver el tutorial otra vez</button>'+
    '<button class="btn btn-primary w-full !py-3.5 mb-3" data-act="save-settings">Guardar cambios</button>'+
    '<button class="btn btn-danger w-full" data-act="reset">Borrar todos los datos</button>');
  var th=curTheme();
  function marcar(){
    $$("#st-theme button").forEach(function(b){
      var on=b.dataset.th===curTheme();
      b.setAttribute("aria-pressed",on?"true":"false");
      b.style.cssText = on ? "background:var(--accent-soft);box-shadow:inset 0 0 0 1.5px var(--accent-line);color:var(--t1)" : "";
    });
  }
  marcar();
  $("#st-theme").addEventListener("click",function(ev){ var b=ev.target.closest("button"); if(!b) return;
    if(b.dataset.bloq){ avisoNube("Se desbloquea en el nivel "+b.dataset.bloq+"."); return; }
    try{ localStorage.setItem(TKEY,b.dataset.th); }catch(e){}
    applyTheme(b.dataset.th); marcar(); });
}


/* ─────── tutorial ─────── */

/* cada uno estudia lo suyo: al empezar se elige la modalidad */
var PAL=["#4f46e5","#d64545","#0f9d58","#0b8fa8","#c2740b","#7c5cd6","#c2408f","#5b7cfa","#2f7d5b","#3d8a8a","#7d7ba6"];
var COMUNES=["Lengua Castellana y Literatura II","Inglés","Historia de España","Historia de la Filosofía"];
var MODALIDADES={
  tec:{ nombre:"Ciencias y Tecnología", asig:[
    "Matemáticas II","Física","Química","Biología","Geología y Ciencias Ambientales",
    "Dibujo Técnico II","Tecnología e Ingeniería II","Informática Digital","Electrotecnia"] },
  sal:{ nombre:"Ciencias de la Salud", asig:[
    "Matemáticas II","Biología","Química","Física","Geología y Ciencias Ambientales",
    "Anatomía Aplicada","Psicología","Informática Digital"] },
  soc:{ nombre:"Ciencias Sociales", asig:[
    "Matemáticas Aplicadas a las CC. Sociales II","Geografía","Economía",
    "Empresa y Diseño de Modelos de Negocio","Historia del Arte",
    "Fundamentos de Administración y Gestión","Informática Digital","Latín II","Griego II"] },
  hum:{ nombre:"Humanidades", asig:[
    "Latín II","Griego II","Historia del Arte","Literatura Universal","Geografía",
    "Historia de la Música y de la Danza","Psicología"] },
  art:{ nombre:"Artes", asig:[
    "Dibujo Artístico II","Fundamentos Artísticos","Diseño","Técnicas de Expresión Gráfico-Plástica",
    "Cultura Audiovisual II","Artes Escénicas II","Análisis Musical II","Historia de la Música y de la Danza",
    "Literatura Dramática","Coro y Técnica Vocal II"] }
};
function siglas(n){
  var limpio=n.replace(/\s+(I|II)$/,"").replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ\s]/g," ");
  var ps=limpio.split(/\s+/).filter(function(w){ return w.length>2 && !/^(de|del|la|las|los|y|e|en)$/i.test(w); });
  if(!ps.length) return n.slice(0,3).toUpperCase();
  if(ps.length===1) return ps[0].slice(0,3).toUpperCase();
  return (ps[0].slice(0,2)+ps[1].slice(0,1)).toUpperCase();
}
function aplicarModalidad(k){
  if(k==="otro"){ S.subjects=[]; S.schedule={}; S.modalidad=k; S.imported="2b-26-27-v2"; save(); return; }
  var m=MODALIDADES[k]; if(!m) return;
  var nombres=COMUNES.concat(m.asig), lista=[];
  for(var i=0;i<nombres.length;i++)
    lista.push({ id:"m"+(i+1), name:nombres[i], short:siglas(nombres[i]), color:PAL[i%PAL.length], prof:"" });
  S.subjects=lista;
  S.schedule={};                 /* el horario lo rellena cada uno en Académico */
  S.modalidad=k; S.imported="2b-26-27-v2";
  save();
}
var TOUR_OBJ=[
  {v:"resumen",   sel:"#hoy-anillos"},
  {v:"resumen",   sel:"#card-ideal"},
  {v:null,        sel:["#mtabs","#rail"]}
];
var TOUR=TOUR_OBJ.map(function(o,i){
  var t=(TEXTOS.tutorial||[])[i]||{t:"",d:""};
  return {v:o.v, sel:o.sel, t:t.t||"", d:t.d||""};
}).filter(function(x){ return x.t; });
var tourStep=0, tourLive=false;

function tourEl(st){
  if(!st || !st.sel) return null;
  var sels = typeof st.sel==="string" ? [st.sel] : st.sel;
  for(var i=0;i<sels.length;i++){
    var lista=document.querySelectorAll(sels[i]);
    for(var j=0;j<lista.length;j++){
      var r=lista[j].getBoundingClientRect();
      if(r.width>2 && r.height>2 && lista[j].offsetParent!==null) return lista[j];
    }
  }
  return null;
}
/* margen de seguridad arriba: dentro de un visor hay una barra propia por encima */
function topeArriba(){
  var extra=0;
  try{ if(window.self!==window.top) extra=92; }catch(e){ extra=92; }
  var sa=parseFloat(getComputedStyle(document.documentElement).paddingTop)||0;
  return 16+extra+sa;
}
function barraAlto(){
  var m=$("#mtabs"); if(!m) return 16;
  var r=m.getBoundingClientRect();
  return r.height>2 ? r.height+34 : 16;
}
/* para un titular, el recuadro del elemento es mucho más ancho que las letras */
function rectDe(el){
  var r=el.getBoundingClientRect();
  try{
    var solo=true, n;
    for(var i=0;i<el.childNodes.length;i++){
      n=el.childNodes[i];
      if(n.nodeType===1 && !/^(SPAN|B|I|EM|STRONG|SMALL)$/.test(n.tagName)){ solo=false; break; }
    }
    if(solo && (el.textContent||"").trim()){
      var rg=document.createRange(); rg.selectNodeContents(el);
      var t=rg.getBoundingClientRect();
      /* ancho el del texto, alto el mayor de los dos: los titulares llevan interlineado apretado */
      if(t.width>10 && t.height>6 && t.width < r.width-6){
        var top=Math.min(r.top,t.top), bot=Math.max(r.bottom,t.bottom);
        return {left:t.left, right:t.right, top:top, bottom:bot, width:t.width, height:bot-top};
      }
    }
  }catch(e){}
  return r;
}
function posTour(anim){
  if(!tourLive) return;
  var st=TOUR[tourStep], spot=$("#tour-spot"), pop=$("#tour-pop");
  if(!st||!spot||!pop) return;
  spot.style.transition = anim?"":"none";
  pop.style.transition  = anim?"":"none";
  var vw=window.innerWidth, vh=window.innerHeight, bar=barraAlto(), minY=topeArriba();
  /* el globo nunca puede ser más alto que el hueco disponible */
  pop.style.maxHeight=Math.max(150,(vh-minY-bar-16))+"px";
  var pw=pop.offsetWidth, ph=pop.offsetHeight, el=tourEl(st), x, y;
  if(!el){
    spot.style.opacity="1"; spot.style.width="0"; spot.style.height="0";
    spot.style.left=(vw/2)+"px"; spot.style.top=(vh/2)+"px";
    x=(vw-pw)/2; y=Math.max(minY,(vh-ph)/2);
  }else{
    var r=rectDe(el), pad=11;
    var cr=parseFloat(getComputedStyle(el).borderRadius)||14;
    /* el foco se queda en lo que se ve y nunca ocupa media pantalla */
    var t=Math.max(minY, r.top-pad), bt=Math.min(vh-8, r.bottom+pad);
    var lf=Math.max(8, r.left-pad), rg=Math.min(vw-8, r.right+pad);
    var maxAlto=Math.round(vh*0.42);
    if(bt-t>maxAlto) bt=t+maxAlto;
    if(bt-t<34){ t=Math.max(minY,Math.min(t,vh-46)); bt=t+34; }
    spot.style.opacity="1";
    spot.style.top=t+"px"; spot.style.left=lf+"px";
    spot.style.width=Math.max(0,rg-lf)+"px"; spot.style.height=Math.max(0,bt-t)+"px";
    spot.style.borderRadius=Math.min(28,cr+pad)+"px";
    if(bt+16+ph <= vh-bar)        y = bt+16;          /* debajo del elemento */
    else if(t-16-ph >= minY)      y = t-16-ph;        /* encima */
    else                          y = vh-bar-ph-10;   /* no cabe: pegado abajo */
    x = (lf+rg)/2 - pw/2;
  }
  x=Math.max(16, Math.min(x, vw-pw-16));
  y=Math.max(minY, Math.min(y, vh-ph-(bar>20?bar:14)));
  pop.style.transform="translate3d("+Math.round(x)+"px,"+Math.round(y)+"px,0)";
  pop.style.opacity="1";
  if(!anim){ void pop.offsetWidth; spot.style.transition=""; pop.style.transition=""; }
}
function tourScroll(el){
  if(!el) return;
  var r=el.getBoundingClientRect(), vh=window.innerHeight, arriba=topeArriba()+56, dest=null;
  if(r.top < arriba) dest = window.scrollY + r.top - arriba;
  else if(r.bottom > vh-250) dest = window.scrollY + Math.min(r.bottom-(vh-250), r.top-arriba);
  if(dest==null) return;
  var tope=Math.max(0, document.documentElement.scrollHeight - vh);   /* nunca más allá del final */
  window.scrollTo({top:Math.max(0,Math.min(dest,tope)), behavior:"smooth"});
}
var tourTrack=function(){ posTour(false); };
function renderTour(){
  var box=$("#tour"); if(!box) return;
  if(tourStep>=TOUR.length || tourStep<0){
    box.hidden=true; tourLive=false; S.tour=true; save();
    document.documentElement.classList.remove("tour-on");
    window.removeEventListener("scroll",tourTrack); window.removeEventListener("resize",tourTrack);
    return;
  }
  var c=TOUR[tourStep], primera=!tourLive;
  if(primera){
    tourLive=true; box.hidden=false;
    document.documentElement.classList.add("tour-on");
    window.addEventListener("scroll",tourTrack,{passive:true});
    window.addEventListener("resize",tourTrack);
  }
  if(c.v && view!==c.v) go(c.v);
  $("#tour-body").innerHTML=
    '<div class="flex items-center gap-1 mb-4">'+TOUR.map(function(x,i){
      return '<span class="rounded-full" style="height:3.5px;flex:'+(i===tourStep?"3":"1")+
             ';background:'+(i<=tourStep?"var(--accent)":"var(--fill-hi)")+';transition:all .45s var(--spring)"></span>'; }).join("")+'</div>'+
    '<h3 class="display text-[20px] font-extrabold leading-tight mb-2">'+esc(c.t)+'</h3>'+
    '<p class="text-[13.5px] t2 leading-relaxed mb-5">'+esc(c.d)+'</p>'+
    '<div class="flex items-center gap-2">'+
      (tourStep>0?'<button class="btn btn-quiet !py-2 !px-3.5 !text-[12.5px]" data-act="tour-prev">Atrás</button>':'')+
      (tourStep===TOUR.length-1?'':'<button class="btn btn-quiet !py-2 !px-3.5 !text-[12.5px]" data-act="tour-skip">Saltar</button>')+
      '<button class="btn btn-primary flex-1 !py-2.5" data-act="tour-next">'+
      (tourStep===TOUR.length-1?"Empezar":"Siguiente")+'</button></div>';
  var el=tourEl(c);
  tourScroll(el);
  posTour(!primera);
  setTimeout(function(){ posTour(true); },120);
  setTimeout(function(){ posTour(true); },480);
  setTimeout(function(){ posTour(true); },760);
  setTimeout(function(){
    var po=$("#tour-pop");
    if(tourLive && po && (po.offsetWidth<40 || parseFloat(getComputedStyle(po).opacity)<.5)){
      tourStep=TOUR.length; renderTour();
    }
  },1400);
}

