/* ════════════════════════════════════════════════════════════════
   DISEÑO: dos temas claros nuevos (Arena y Porcelana), el Clásico con
   más contraste, el modo «Esencial» (sobrio, se quita cuando quieras),
   hábitos flexibles (días, veces por semana, cantidades), recordatorio
   por hábito, tu año en Peak y la política de privacidad.
   ════════════════════════════════════════════════════════════════ */

/* ════════════ modo de diseño: Peak / Esencial ════════════ */
var DISENO_KEY="dtrack-diseno";
function disenoActual(){ try{ return localStorage.getItem(DISENO_KEY)==="esencial" ? "esencial" : "dtrack"; }catch(e){ return "dtrack"; } }
function disenoAplica(k){
  document.documentElement.classList.toggle("esencial", k==="esencial");
  if(typeof medRepinta==="function") medRepinta();
}
function disenoCambia(k){
  if(k===disenoActual()) return;
  try{ localStorage.setItem(DISENO_KEY,k); }catch(e){}
  var quieto=false; try{ quieto=window.matchMedia("(prefers-reduced-motion: reduce)").matches; }catch(e){}
  function hazlo(){ disenoAplica(k); render(); disenoPintaSelector(); }
  if(document.startViewTransition && !quieto) document.startViewTransition(hazlo); else hazlo();
  sonido("tick");
}
disenoAplica(disenoActual());
function disenoSelectorHTML(){
  var k=disenoActual();
  return '<div id="aj-diseno"><p class="eyebrow mb-2">Diseño</p>'+
    '<div class="dz-ops">'+
      '<button class="dz-op'+(k==="dtrack"?" on":"")+'" data-act="x-diseno" data-k="dtrack">'+
        '<span class="dz-m dz-m1"><i></i><b></b><u></u></span><span class="dz-n">Peak.</span><span class="dz-s">Con color y brillo</span></button>'+
      '<button class="dz-op'+(k==="esencial"?" on":"")+'" data-act="x-diseno" data-k="esencial">'+
        '<span class="dz-m dz-m2"><i></i><b></b><u></u></span><span class="dz-n">Esencial</span><span class="dz-s">Sobrio y limpio</span></button>'+
    '</div><p class="text-[12px] t3 mt-2 mb-6 leading-relaxed">Cambia la forma, no tus datos ni tu tema. Puedes volver cuando quieras.</p></div>';
}
function disenoPintaSelector(){
  var k=disenoActual();
  document.querySelectorAll(".dz-op").forEach(function(b){ b.classList.toggle("on", b.dataset.k===k); });
}

/* ════════════ ajustes: selector de diseño y privacidad ════════════ */
var _sheetSettingsDz=sheetSettings;
sheetSettings=function(){
  _sheetSettingsDz.apply(this, arguments);
  var ver=document.getElementById("aj-ver");
  if(ver && !document.getElementById("aj-diseno")){
    var ancla=null;
    [].slice.call(ver.querySelectorAll("p.eyebrow")).forEach(function(p){ if(!ancla && /^Apariencia/.test((p.textContent||"").trim())) ancla=p; });
    var caja=document.createElement("div"); caja.innerHTML=disenoSelectorHTML();
    var nodo=caja.firstChild;
    if(ancla) ancla.parentNode.insertBefore(nodo, ancla); else ver.appendChild(nodo);
  }
  var datos=document.getElementById("aj-datos");
  if(datos && !document.getElementById("aj-priv")){
    var b=document.createElement("button"); b.id="aj-priv"; b.className="aj-priv"; b.setAttribute("data-act","x-privacidad");
    b.innerHTML='<span>🔒</span><span class="aj-priv-t"><b>Privacidad</b><small>Qué se guarda, dónde y quién lo ve</small></span>'+
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';
    datos.appendChild(b);
  }
  /* la fila del menú de «Apariencia» dice también lo del diseño */
  var fila=document.querySelector('.aj-fila[data-k="ver"] small'); if(fila) fila.textContent="Diseño, tema, color e idioma";
};

/* ════════════ política de privacidad ════════════ */
var PRIV_CONTACTO="";   /* pon aquí el correo de contacto antes de publicar */
var PRIV_FECHA="septiembre de 2026";
function privacidadHTML(){
  function s(t, p){ return '<h4 class="pv-h">'+t+'</h4>'+p.map(function(x){ return '<p class="pv-p">'+x+'</p>'; }).join(""); }
  return '<div class="pv">'+
    '<p class="pv-intro">Peak es una app para organizarte y cuidar tus hábitos. Esta página explica, sin letra pequeña, qué datos usa y qué pasa con ellos.</p>'+
    s("📱 Lo que se guarda y dónde",[
      "Todo lo que apuntas (hábitos, retos, tareas, exámenes, horario, notas, el diario y el Parte del día) se guarda <b>solo en este dispositivo</b>, dentro del navegador o de la app instalada.",
      "Si creas una cuenta y activas la copia en la nube, esos mismos datos viajan por una conexión segura y se guardan en el servidor de Peak, para que no los pierdas y puedas usarlos en otro móvil."
    ])+
    s("🔑 Tu cuenta",[ "Puedes entrar con un código que te llega al correo o con tu cuenta de Google. Si entras con Google, Peak recibe solo tu dirección de correo y tu nombre, para identificarte. No recibe tu contraseña ni nada más de tu cuenta de Google." ])+
    s("❤️ Datos de salud y ánimo",[
      "Sueño, agua, ejercicio, tiempo de pantalla, comidas y cómo te sientes son datos sensibles. Los usas tú, para ti: <b>no se comparten con tu grupo</b>, no se venden y no se usan para publicidad.",
      "Solo salen del dispositivo si activas la copia en la nube, y únicamente para guardarlos a tu nombre."
    ])+
    s("👥 Lo que ve tu grupo",[
      "Si te unes a un grupo, los demás ven tu nombre y tu foto, tu nivel y título, tu racha, tus logros, cuántos retos haces, tu porcentaje de la semana, los días de ejercicio, las horas de estudio y de meditación (solo el número), tu descripción, si has hecho el Parte del día y el reto del grupo, lo que se publica solo en la actividad y las fotos haciendo deporte que subas (se guardan en el servidor y las ven tus amigos del grupo). Nunca ven tus hábitos concretos, tu diario, tu ánimo ni tu sueño, agua o pantalla."
    ])+
    s("🔔 Avisos",[
      "Para mandarte avisos, el servidor guarda la dirección de avisos de tu navegador, las horas que eliges y el texto de los recordatorios de tus hábitos. El resto del aviso lo escribe tu propio móvil."
    ])+
    s("🎂 Edad",[
      "Para crear una cuenta hace falta tener 14 años o más, porque incluye grupos con otras personas. La fecha de nacimiento solo se usa para comprobarlo y no se le enseña a nadie. Sin cuenta puedes usar la app igual: todo se queda en tu móvil."
    ])+
    s("🗑️ Tus derechos",[
      "Puedes descargar una copia de todo en Ajustes → Tus datos, y borrarlo todo desde ahí mismo. Si tienes cuenta, al borrarla se eliminan también los datos del servidor.",
      "No usamos cookies de publicidad ni herramientas de seguimiento."
    ])+
    s("✉️ Contacto",[ PRIV_CONTACTO ? 'Para cualquier duda sobre tus datos: <b>'+esc(PRIV_CONTACTO)+'</b>' : "Para cualquier duda sobre tus datos, escríbenos a la dirección que aparece en la página de la app." ])+
    '<p class="pv-fecha">Última actualización: '+PRIV_FECHA+'</p></div>';
}
function abrirPrivacidad(){
  openSheet('<div class="flex items-start justify-between mb-4"><div><p class="eyebrow mb-1.5">Ajustes</p><h3 class="display text-[20px] font-bold">Privacidad</h3></div>'+closeBtn()+'</div>'+privacidadHTML());
  var sc=document.querySelector("#sheet .sheet-card"); if(sc) sc.scrollTop=0;
}

/* ════════════ hábitos flexibles ════════════
   Cada hábito puede tener:
     dias: [0..6]  solo esos días (0 = lunes)
     vs:   n       n veces por semana (se esconde cuando ya las has hecho)
     meta, unidad  una cantidad (p. ej. 20 páginas); se marca solo al llegar
     aviso: h      recordatorio a esa hora                                   */
function diaSem(d){ return (new Date(d+"T12:00:00").getDay()+6)%7; }
function habHechoSemana(x, d, sinD){
  var l=lunesDe(d), n=0;
  for(var i=0;i<7;i++){ var k=addDays(l,i); if(sinD && k===d) continue; if((S.checks[k]||[]).indexOf(x.id)>=0) n++; }
  return n;
}
function habToca(x, d){
  if(x.dias && x.dias.length) return x.dias.indexOf(diaSem(d))>=0;
  if(x.vs){
    if((S.checks[d]||[]).indexOf(x.id)>=0) return true;
    return habHechoSemana(x, d, true) < x.vs;
  }
  return true;
}
function idealDe(d){ return S.ideal.filter(function(x){ return (!x.desde || x.desde<=d) && (!x.hasta || d<x.hasta) && habToca(x, d); }); }
function idealActivos(){ var t=today(); return S.ideal.filter(function(x){ return !x.hasta && habToca(x, t); }); }
function idealTodos(){ return S.ideal.filter(function(x){ return !x.hasta; }); }
function habPorId(id){ for(var i=0;i<S.ideal.length;i++) if(S.ideal[i].id===id) return S.ideal[i]; return null; }
var DIAS_CORTOS=["L","M","X","J","V","S","D"];
function habFrecTxt(x){
  var p=[];
  var T=(typeof tr==="function")?tr:function(z){ return z; };
  if(x.dias && x.dias.length) p.push(x.dias.length===5 && x.dias.join("")==="01234" ? T("Entre semana") : x.dias.length===2 && x.dias.join("")==="56" ? T("Fines de semana") : x.dias.map(function(i){ return (typeof L10N!=="undefined" && L10N.sem ? L10N.sem[i] : DIAS_CORTOS[i]); }).join(" · "));
  else if(x.vs) p.push(T(x.vs+(x.vs===1?" vez":" veces")+" por semana"));
  if(x.meta) p.push(x.meta+" "+(x.unidad||""));
  if(x.aviso!=null) p.push("⏰ "+x.aviso+":00");
  return p.join("  ·  ").trim();
}
/* cantidades: S.cant[día][id] = número */
function cantDe(d, id){ return (S.cant && S.cant[d] && S.cant[d][id]) || 0; }
function cantPon(d, id, v){
  var x=habPorId(id); if(!x) return;
  if(!S.cant) S.cant={};
  if(!S.cant[d]) S.cant[d]={};
  v=Math.max(0, Math.round(v*10)/10); S.cant[d][id]=v;
  var arr=(S.checks[d]||[]).slice(), j=arr.indexOf(id), ya=j>=0;
  if(v>=x.meta && !ya) arr.push(id);
  if(v<x.meta && ya) arr.splice(j,1);
  S.checks[d]=arr; save();
  return !ya && v>=x.meta;
}

/* el editor de hábitos, con frecuencia, cantidad y recordatorio */
var habEd=null;   /* borrador del que se está editando */
function sheetIdeal(editId){
  var items=ordenIdeal(idealTodos());
  var ed=editId ? habPorId(editId) : null;
  habEd={ id: ed?ed.id:"", modo: ed ? (ed.dias&&ed.dias.length?"dias":ed.vs?"vs":"diario") : "diario",
          dias: ed&&ed.dias ? ed.dias.slice() : [0,1,2,3,4], vs: ed&&ed.vs ? ed.vs : 3,
          cant: !!(ed&&ed.meta), tag: ed?ed.tag:"vital" };
  var horas=[""]; for(var h=6;h<=23;h++) horas.push(h);
  openSheet('<div class="flex items-start justify-between mb-2"><h3 class="display text-[19px] font-bold">Hábitos</h3>'+closeBtn()+'</div>'+
    '<p class="text-[12.5px] t3 mb-5">Cada día, algunos días o unas veces por semana. Cada mañana empieza limpia.</p>'+
    '<div class="hb-lista mb-6">'+ items.map(function(it){
      var f=habFrecTxt(it);
      return '<div class="hb-item'+(ed&&ed.id===it.id?" on":"")+'">'+
        '<span class="w-2 h-2 rounded-full shrink-0" style="background:'+(TAGV[it.tag]||"var(--accent)")+'"></span>'+
        '<span class="hb-item-t"><b>'+(it.time?'<span class="num t3">'+esc(it.time)+'</span> ':'')+esc(it.text)+'</b>'+(f?'<small>'+esc(f)+'</small>':'')+'</span>'+
        '<button class="icon-btn bare !w-8 !h-8" data-act="edit-ideal-item" data-id="'+it.id+'" aria-label="Editar">'+ICON_PEN+'</button>'+
        '<button class="icon-btn bare !w-8 !h-8" data-act="del-ideal" data-id="'+it.id+'" aria-label="Quitar">'+ICON_TRASH+'</button></div>'; }).join("")
      + (items.length?'':'<p class="text-[13px] t3 py-4 text-center">Sin hábitos todavía.</p>')+'</div>'+
    '<p class="eyebrow mb-2">'+(ed?"Editar hábito":"Nuevo hábito")+'</p>'+
    '<div class="flex gap-2 mb-4"><input id="id-time" type="time" class="field !w-[118px]" value="'+esc(ed?(ed.time||""):"")+'">'+
    '<input id="id-text" class="field flex-1" maxlength="60" placeholder="Qué haces" value="'+esc(ed?ed.text:"")+'"></div>'+
    '<p class="hb-lab">Cuándo</p>'+
    '<div class="seg w-full mb-3" id="hb-modo" style="display:grid;grid-template-columns:1fr 1fr 1fr">'+
      [["diario","Cada día"],["dias","Algunos días"],["vs","Por semana"]].map(function(o){
        return '<button data-act="x-hb-modo" data-k="'+o[0]+'"'+(habEd.modo===o[0]?' aria-pressed="true"':'')+'>'+o[1]+'</button>'; }).join("")+'</div>'+
    '<div id="hb-modo-det" class="mb-4">'+habModoDet()+'</div>'+
    '<p class="hb-lab">Cantidad <span class="t3" style="font-weight:500">· opcional</span></p>'+
    '<div class="flex gap-2 mb-1.5"><input id="hb-meta" class="field !w-[96px] text-center num" inputmode="decimal" maxlength="5" placeholder="20" value="'+(ed&&ed.meta?ed.meta:"")+'">'+
    '<input id="hb-unidad" class="field flex-1" maxlength="18" placeholder="páginas, minutos, vasos…" value="'+esc(ed&&ed.unidad||"")+'"></div>'+
    '<p class="text-[11.5px] t3 mb-4">Si pones una cantidad, vas sumando y se marca solo al llegar.</p>'+
    '<p class="hb-lab">Recordatorio</p>'+
    '<select id="hb-aviso" class="field mb-1.5">'+horas.map(function(h){
        var sel = ed && ed.aviso!=null ? ed.aviso===h : h==="";
        return '<option value="'+h+'"'+(sel?" selected":"")+'>'+(h===""?"Sin recordatorio":"A las "+h+":00")+'</option>'; }).join("")+'</select>'+
    '<p class="text-[11.5px] t3 mb-4">'+(S.avisos&&S.avisos.activo?"Te llegará como aviso al móvil.":"Con la app abierta te sale un aviso. Para que llegue con ella cerrada, activa los avisos en Ajustes.")+'</p>'+
    '<p class="hb-lab">Tipo</p>'+
    '<div class="seg w-full mb-5" id="id-tag" style="display:grid;grid-template-columns:1fr 1fr 1fr">'+
    ["vital","estudio","personal"].map(function(k){ var sel=habEd.tag===k;
      return '<button data-t="'+k+'"'+(sel?' aria-pressed="true"':'')+'>'+cap(k)+'</button>'; }).join("")+'</div>'+
    '<button class="btn btn-primary w-full !py-3.5" data-act="x-hb-guardar">'+(ed?"Guardar cambios":"Añadir hábito")+'</button>'+
    (ed?'<button class="btn btn-quiet w-full mt-2" data-act="x-hb-nuevo">Cancelar</button>':''));
  $("#id-tag").dataset.value=habEd.tag;
  $("#id-tag").addEventListener("click",function(ev){ var b=ev.target.closest("button"); if(!b) return;
    $$("#id-tag button").forEach(function(x){ x.setAttribute("aria-pressed",x===b?"true":"false"); });
    $("#id-tag").dataset.value=b.dataset.t; habEd.tag=b.dataset.t; });
  if(ed){ var sc=document.querySelector("#sheet .sheet-card"), f=document.getElementById("id-text"); if(sc && f) setTimeout(function(){ sc.scrollTop=f.offsetTop-80; }, 30); }
}
function habModoDet(){
  if(habEd.modo==="dias") return '<div class="hb-dias">'+DIAS_CORTOS.map(function(l,i){
      return '<button data-act="x-hb-dia" data-i="'+i+'" class="'+(habEd.dias.indexOf(i)>=0?"on":"")+'">'+(typeof L10N!=="undefined" && L10N.sem ? L10N.sem[i] : l)+'</button>'; }).join("")+'</div>';
  if(habEd.modo==="vs") return '<div class="hb-vs"><button data-act="x-hb-vs" data-d="-1" aria-label="Menos">−</button>'+
      '<span><b class="num">'+habEd.vs+'</b> '+(habEd.vs===1?"vez":"veces")+' por semana</span>'+
      '<button data-act="x-hb-vs" data-d="1" aria-label="Más">+</button></div>'+
      '<p class="text-[11.5px] t3 mt-2">Sale cada día hasta que lo cumples esas veces; luego descansa hasta el lunes.</p>';
  return '<p class="text-[11.5px] t3">Sale todos los días.</p>';
}
function habPintaModo(){
  $$("#hb-modo button").forEach(function(b){ b.setAttribute("aria-pressed", b.dataset.k===habEd.modo?"true":"false"); });
  var d=document.getElementById("hb-modo-det"); if(d) d.innerHTML=habModoDet();
}
function habGuarda(){
  var tx=($("#id-text").value||"").trim(); if(!tx){ $("#id-text").focus(); return; }
  var tm=($("#id-time").value||"").trim(), tg=$("#id-tag").dataset.value||"vital";
  var mt=parseFloat(String($("#hb-meta").value||"").replace(",", ".")), un=($("#hb-unidad").value||"").trim();
  var av=$("#hb-aviso").value;
  if(habEd.modo==="dias" && !habEd.dias.length){ avisoNube("Elige al menos un día."); return; }
  var x=habEd.id ? habPorId(habEd.id) : null;
  if(!x){ x={id:uid(), desde:today()}; S.ideal.push(x); }
  x.text=tx; x.time=tm; x.tag=tg;
  if(habEd.modo==="dias"){ x.dias=habEd.dias.slice().sort(); delete x.vs; }
  else if(habEd.modo==="vs"){ x.vs=habEd.vs; delete x.dias; }
  else { delete x.dias; delete x.vs; }
  if(mt>0){ x.meta=Math.round(mt*10)/10; x.unidad=un; } else { delete x.meta; delete x.unidad; }
  if(av!=="" && av!=null) x.aviso=+av; else delete x.aviso;
  save(); sheetIdeal(null); render();
  if(typeof refrescarAvisos==="function") refrescarAvisos();
  avisoNube(habEd && habEd.id ? "Guardado." : "Hábito añadido.");
}

/* las filas de hábitos: cantidades y "2 de 3 esta semana" */
function habRetoca(raiz){
  raiz=raiz||document;
  raiz.querySelectorAll('[data-act="check"][data-id], [data-act="x-cant"][data-id]').forEach(function(b){
    var x=habPorId(b.dataset.id); if(!x) return;
    var fila=b.closest(".hy-fila, .soft, #ideal-list > div"); if(!fila) return;
    var d=b.dataset.day||today();
    if(x.meta){
      b.setAttribute("data-act","x-cant");
      if(!fila.querySelector(".hb-cant")){
        var v=cantDe(d, x.id), p=document.createElement("span"); p.className="hb-cant num"+(v>=x.meta?" ok":"");
        p.innerHTML='<i style="width:'+Math.min(100, v/x.meta*100)+'%"></i><b>'+fmtCant(v)+'/'+fmtCant(x.meta)+'</b>'+(x.unidad?' '+esc(x.unidad):'');
        var txt=fila.querySelector('.hy-txt, button.flex-1, button.text-\\[13\\.5px\\], button.text-\\[14px\\]');
        if(txt && txt.nextSibling) fila.insertBefore(p, txt.nextSibling); else fila.appendChild(p);
      }
    }
    if(x.vs && !fila.querySelector(".hb-fq")){
      var s=fila.querySelector(".strike"); if(!s) return;
      var n=habHechoSemana(x, d, false), q=document.createElement("small"); q.className="hb-fq";
      q.textContent=n+" de "+x.vs+" esta semana"; s.parentNode.appendChild(q);
    }
  });
}
function fmtCant(v){ return (Math.round(v*10)/10).toString().replace(".", ","); }
var cantAbierto=null;
function abrirCantidad(id, d){
  var x=habPorId(id); if(!x) return;
  cantAbierto={id:id, d:d||today()};
  var v=cantDe(cantAbierto.d, id), paso=x.meta>=100?10:x.meta>=20?5:1;
  openSheet('<div class="flex items-start justify-between mb-2"><div><p class="eyebrow mb-1.5">'+(cantAbierto.d===today()?"Hoy":cap(fmt(cantAbierto.d,{weekday:"long",day:"numeric"})))+'</p>'+
      '<h3 class="display text-[20px] font-bold leading-tight">'+esc(x.text)+'</h3></div>'+closeBtn()+'</div>'+
    '<div class="ct-caja"><div class="ct-num"><b class="num" id="ct-v">'+fmtCant(v)+'</b><span class="num">/ '+fmtCant(x.meta)+' '+esc(x.unidad||"")+'</span></div>'+
      '<div class="ct-barra"><i id="ct-barra" style="width:'+Math.min(100,v/x.meta*100)+'%"></i></div></div>'+
    '<div class="ct-botones">'+
      '<button data-act="x-cant-mas" data-n="-'+paso+'">−'+paso+'</button>'+
      '<button data-act="x-cant-mas" data-n="1">+1</button>'+
      '<button data-act="x-cant-mas" data-n="'+paso+'">+'+paso+'</button>'+
      '<button data-act="x-cant-mas" data-n="'+(paso*2)+'">+'+(paso*2)+'</button></div>'+
    '<div class="flex gap-2 mt-4"><input id="ct-in" class="field flex-1 num text-center" inputmode="decimal" placeholder="Escribe cuánto llevas" value="">'+
      '<button class="btn btn-quiet" data-act="x-cant-pon">Poner</button></div>'+
    '<button class="btn btn-primary w-full !py-3.5 mt-4" data-act="x-cant-todo">'+(v>=x.meta?"Hecho ✓":"Lo he hecho entero")+'</button>');
}
function cantActualiza(nuevo){
  if(!cantAbierto) return;
  var x=habPorId(cantAbierto.id); if(!x) return;
  var sube=cantPon(cantAbierto.d, x.id, nuevo), v=cantDe(cantAbierto.d, x.id);
  var e=document.getElementById("ct-v"); if(e){ e.textContent=fmtCant(v); e.classList.remove("ct-pop"); void e.offsetWidth; e.classList.add("ct-pop"); }
  var b=document.getElementById("ct-barra"); if(b) b.style.width=Math.min(100,v/x.meta*100)+"%";
  var bt=document.querySelector('[data-act="x-cant-todo"]'); if(bt) bt.textContent=v>=x.meta?"Hecho ✓":"Lo he hecho entero";
  if(sube){ sonido("pop"); if(typeof celebraTick==="function" && bt) celebraTick(bt, 4); setTimeout(function(){ closeSheet(); render(); if(document.getElementById("parte") && !document.getElementById("parte").hidden) renderParte(); }, 650); }
  else { sonido("tick"); render(); if(document.getElementById("parte") && !document.getElementById("parte").hidden) renderParte(); }
}
var _renderParteDz=renderParte;
renderParte=function(){ var r=_renderParteDz.apply(this, arguments); var p=document.getElementById("parte"); if(p) habRetoca(p); return r; };

/* ════════════ recordatorio de cada hábito ════════════ */
function avisosHabitos(){
  return idealTodos().filter(function(x){ return x.aviso!=null; }).map(function(x){
    return { h:x.aviso, t:(x.meta ? x.text+" ("+fmtCant(x.meta)+" "+(x.unidad||"")+")" : x.text).trim(), d:(x.dias&&x.dias.length)?x.dias:null };
  });
}
/* con la app abierta (o sin avisos del servidor): aviso dentro de la app */
function recordatoriosMira(){
  if(!S || !S.ideal) return;
  var ahora=new Date(), h=ahora.getHours(), t=today();
  idealActivos().forEach(function(x){
    if(x.aviso==null || x.aviso!==h) return;
    if((S.checks[t]||[]).indexOf(x.id)>=0) return;
    var k="dtrack-rec-"+t+"-"+x.id;
    try{ if(localStorage.getItem(k)) return; localStorage.setItem(k,"1"); }catch(e){ return; }
    if(S.avisos && S.avisos.activo) return;     /* ya llega por el servidor */
    avisoNube("⏰ "+tr("Recordatorio")+": "+x.text);
  });
}
setInterval(recordatoriosMira, 60000);
setTimeout(recordatoriosMira, 4000);

/* ════════════ tu año en Peak ════════════ */
function anioDatos(y){
  var hoy=today(), ini=y+"-01-01", fin=(y+"-12-31"<hoy)?y+"-12-31":hoy, pd=primerDia(); if(pd>ini) ini=pd;
  var o={ y:y, dias:0, activos:0, xp:0, meses:[0,0,0,0,0,0,0,0,0,0,0,0], checks:0, porHab:{}, retos:0, triples:0,
          racha:0, gym:0, deportes:{}, agua:0, suenoT:0, suenoN:0, estudio:0, animos:[0,0,0,0,0], diario:0, partes:0 };
  if(ini>fin) return o;
  var tmap=tasksByDay(), run=0;
  for(var d=ini, g=0; d<=fin && g<400; d=addDays(d,1), g++){
    o.dias++;
    var act=activeDay(d); if(act){ o.activos++; run++; if(run>o.racha) o.racha=run; } else run=0;
    var xp=dayXP(d, tmap); o.xp+=xp; o.meses[+d.slice(5,7)-1]+=xp;
    var ck=checksOf(d); o.checks+=ck.length; ck.forEach(function(id){ o.porHab[id]=(o.porHab[id]||0)+1; });
    o.retos+=chOf(d).length; if(tripleDone(d)) o.triples++;
    if(wentGym(d)){ o.gym++; ((S.deporteDia&&S.deporteDia[d])||[]).forEach(function(s){ o.deportes[s]=(o.deportes[s]||0)+1; }); }
    var h=S.habits[d]||{}; o.agua+=((h.water||0)>=8?1:0); if(h.sleep>0){ o.suenoT+=h.sleep; o.suenoN++; }
    if(typeof estudioMinDia==="function") o.estudio+=estudioMinDia(d);
    var an=animoDe(d); if(an && an.v) o.animos[an.v-1]++; if(an && (an.nota||"").trim()) o.diario++;
    if(S.parte && S.parte[d]) o.partes++;
  }
  var top=null; Object.keys(o.porHab).forEach(function(id){ if(!top || o.porHab[id]>o.porHab[top]) top=id; });
  var th=top?habPorId(top):null; o.habTop=th?{t:th.text, n:o.porHab[top]}:null;
  var dep=null; Object.keys(o.deportes).forEach(function(s){ if(!dep || o.deportes[s]>o.deportes[dep]) dep=s; }); o.deporteTop=dep;
  var mm=0; o.meses.forEach(function(v,i){ if(v>o.meses[mm]) mm=i; }); o.mesTop=o.xp?mm:-1;
  var am=-1; o.animos.forEach(function(v,i){ if(v && (am<0 || v>o.animos[am])) am=i; }); o.animoTop=am;
  return o;
}
var MESES_L=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
var MESES_C=["E","F","M","A","M","J","J","A","S","O","N","D"];
var AN_FONDOS=["#1d1b3a","#3b1d5e","#0f3d3a","#5a2a14","#12324f","#402036","#1f3a1c","#2b2b31"];
var anio=null;
function anioDiapos(o){
  var L=[];
  L.push({c:0, e:"✨", t:"Tu "+o.y+" en Peak", s:"Lo que has hecho este año, en un minuto. Toca para avanzar."});
  if(!o.activos){ L.push({c:7, e:"🌱", t:"Tu año empieza ahora", s:"Todavía no hay días que contar. Marca tus hábitos y retos, y aquí aparecerá tu resumen."}); return L; }
  L.push({c:1, e:"📅", n:o.activos, u:o.activos===1?"día activo":"días activos", s:"de "+miles(o.dias)+" desde que empezaste. "+(o.activos/o.dias>=.6?"Constancia de verdad.":"Cada día cuenta.")});
  L.push({c:2, e:"🔥", n:o.racha, u:o.racha===1?"día seguido":"días seguidos", s:"Tu mejor racha del año."});
  if(o.checks) L.push({c:3, e:"✅", n:o.checks, u:"hábitos cumplidos", s:o.habTop?"El que más: «"+o.habTop.t+"», "+o.habTop.n+" veces.":""});
  if(o.retos) L.push({c:4, e:"🎯", n:o.retos, u:"retos superados", s:o.triples?o.triples+(o.triples===1?" día":" días")+" hiciste los tres y el XP valió ×1,5.":"Sigue así: si haces los tres, el día vale ×1,5."});
  if(o.gym || o.agua) L.push({c:6, e:"💪", n:o.gym, u:o.gym===1?"día de ejercicio":"días de ejercicio",
      s:(o.deporteTop?"Tu favorito: "+o.deporteTop+". ":"")+(o.agua?miles(o.agua)+(o.agua===1?" día bien hidratado. ":" días bien hidratado. "):"")+(o.suenoN?"Dormiste "+(Math.round(o.suenoT/o.suenoN*10)/10).toString().replace(".",",")+" h de media.":"")});
  if(o.estudio>=30) L.push({c:5, e:"📚", n:Math.round(o.estudio/60), u:Math.round(o.estudio/60)===1?"hora de estudio":"horas de estudio", s:"Con el temporizador. Bloque a bloque."});
  if(o.mesTop>=0) L.push({c:1, e:"📈", t:"Tu mejor mes: "+MESES_L[o.mesTop], s:"El mes que más XP sumaste.", barras:o.meses, top:o.mesTop});
  if(o.animoTop>=0) L.push({c:3, e:ANIMOS[o.animoTop], t:"Así te sentiste", s:"Tu ánimo más repetido en el Parte del día"+(o.diario?", y "+o.diario+(o.diario===1?" nota":" notas")+" en tu diario.":"."), animos:o.animos});
  var st=stats();
  L.push({c:0, e:"🏆", n:o.xp, u:"XP este año", s:"Nivel "+st.lvl+" · "+(LVL_NAMES[st.lvl-1]||""), fin:true});
  return L;
}
function abrirAnio(y){
  y=y||+today().slice(0,4);
  var o=anioDatos(y); anio={o:o, L:anioDiapos(o), i:0, t:null};
  var c=document.getElementById("anio"); if(c) c.remove();
  c=document.createElement("div"); c.id="anio"; c.setAttribute("role","dialog"); c.setAttribute("aria-label","Tu año");
  document.body.appendChild(c);
  anioPinta(); requestAnimationFrame(function(){ c.classList.add("abierto"); });
  sonido("pop");
}
function anioCierra(){
  var c=document.getElementById("anio"); if(!c) return;
  clearTimeout(anio && anio.t); c.classList.remove("abierto"); c.classList.add("saliendo");
  setTimeout(function(){ c.remove(); }, 380); anio=null;
}
function anioPinta(){
  var c=document.getElementById("anio"); if(!c || !anio) return;
  var D=anio.L[anio.i], n=anio.L.length;
  var barras=anio.L.map(function(_,k){ return '<i class="'+(k<anio.i?"ok":k===anio.i?"ya":"")+'"><u></u></i>'; }).join("");
  var cuerpo='<div class="an-e">'+D.e+'</div>';
  if(D.n!=null) cuerpo+='<div class="an-n num" data-n="'+D.n+'">0</div><div class="an-u">'+esc(D.u)+'</div>';
  else cuerpo+='<h2 class="an-t">'+esc(D.t)+'</h2>';
  if(D.s) cuerpo+='<p class="an-s">'+esc(D.s)+'</p>';
  if(D.barras){ var mx=Math.max.apply(null, D.barras)||1;
    cuerpo+='<div class="an-meses">'+D.barras.map(function(v,k){ return '<span style="--k:'+k+'" class="'+(k===D.top?"top":"")+'"><i style="--h:'+Math.max(4, v/mx*100)+'%"></i><b>'+MESES_C[k]+'</b></span>'; }).join("")+'</div>'; }
  if(D.animos){ var ma=Math.max.apply(null, D.animos)||1;
    cuerpo+='<div class="an-animos">'+D.animos.map(function(v,k){ return '<span><em style="--s:'+(0.7+v/ma*0.6)+'">'+ANIMOS[k]+'</em><b class="num">'+v+'</b></span>'; }).join("")+'</div>'; }
  if(D.fin) cuerpo+='<div class="an-fin"><button data-act="x-anio-compartir">Compartir</button><button data-act="x-anio-cerrar" class="sec">Cerrar</button></div>';
  c.style.setProperty("--an-bg", AN_FONDOS[D.c%AN_FONDOS.length]);
  c.innerHTML='<div class="an-barras">'+barras+'</div>'+
    '<button class="an-x" data-act="x-anio-cerrar" aria-label="Cerrar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>'+
    (D.fin ? '' : '<div class="an-zona an-atras" data-act="x-anio-mueve" data-d="-1"></div><div class="an-zona an-alante" data-act="x-anio-mueve" data-d="1"></div>')+
    '<div class="an-cuerpo">'+cuerpo+'</div>';
  var num=c.querySelector(".an-n"); if(num) anioCuenta(num, +num.dataset.n);
  clearTimeout(anio.t);
  if(!D.fin) anio.t=setTimeout(function(){ anioMueve(1); }, 6500);
}
function miles(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
function anioCuenta(el, fin){
  var t0=performance.now(), dur=900;
  (function paso(t){ var k=Math.min(1,(t-t0)/dur), e=1-Math.pow(1-k,3); el.textContent=miles(Math.round(fin*e)); if(k<1) requestAnimationFrame(paso); })(t0);
}
function anioMueve(d){
  if(!anio) return;
  var j=anio.i+d; if(j<0) j=0;
  if(j>=anio.L.length){ anioCierra(); return; }
  if(j===anio.i) return;
  anio.i=j; anioPinta(); sonido("tick");
}
function dibujaAnio(o){
  var W=1080, H=1920, cv=document.createElement("canvas"); cv.width=W; cv.height=H;
  var c=cv.getContext("2d"); if(!c) return null;
  var F='"Plus Jakarta Sans", -apple-system, sans-serif', FI='Inter, -apple-system, sans-serif', M=100;
  if(document.documentElement.classList.contains("esencial")) F=FI;
  c.fillStyle="#17152e"; c.fillRect(0,0,W,H);
  c.fillStyle="#fff"; c.textBaseline="alphabetic";
  c.font="600 40px "+FI; c.globalAlpha=.7; c.fillText("Peak.", M, 170); c.globalAlpha=1;
  c.font="800 132px "+F; c.fillText(tr("Mi")+" "+o.y, M, 340);
  var datos=[[o.activos, tr("días activos")],[o.racha, tr("mejor racha")],[o.checks, tr("hábitos cumplidos")],[o.retos, tr("retos superados")]];
  if(o.gym) datos.push([o.gym, tr("días de ejercicio")]);
  if(o.estudio>=60) datos.push([Math.round(o.estudio/60), tr("horas de estudio")]);
  datos=datos.filter(function(p,k){ return k===0 || p[0]>0; }).slice(0,6);
  var y0=480, fila=250;
  datos.forEach(function(p,k){
    var x=M+(k%2)*((W-2*M)/2), y=y0+Math.floor(k/2)*fila;
    c.fillStyle="#fff"; c.font="800 120px "+F; c.fillText(String(p[0]).replace(/\B(?=(\d{3})+(?!\d))/g,"."), x, y+100);
    c.globalAlpha=.7; c.font="500 36px "+FI; c.fillText(p[1], x, y+160); c.globalAlpha=1;
  });
  var yb=y0+Math.ceil(datos.length/2)*fila+40, hb=260, mx=Math.max.apply(null,o.meses)||1, bw=(W-2*M)/12;
  o.meses.forEach(function(v,k){
    var h=Math.max(8, v/mx*hb), x=M+k*bw+10;
    c.fillStyle= k===o.mesTop ? "#ffd166" : "rgba(255,255,255,.28)";
    c.beginPath(); if(c.roundRect) c.roundRect(x, yb+hb-h, bw-20, h, 12); else c.rect(x, yb+hb-h, bw-20, h); c.fill();
    c.fillStyle="rgba(255,255,255,.6)"; c.font="600 28px "+FI; c.textAlign="center"; c.fillText(MESES_C[k], x+(bw-20)/2, yb+hb+50); c.textAlign="left";
  });
  c.fillStyle="#fff"; c.font="700 44px "+F; c.fillText(miles(o.xp)+" XP", M, H-170);
  c.globalAlpha=.6; c.font="500 32px "+FI; c.fillText(tr("Hecho con Peak"), M, H-110); c.globalAlpha=1;
  return cv;
}
function anioComparte(){
  if(!anio) return;
  var o=anio.o, cv=dibujaAnio(o); if(!cv) return;
  var nombre="mi-"+o.y+"-peak.png";
  cv.toBlob(function(b){
    if(!b) return;
    var file=null; try{ file=new File([b], nombre, {type:"image/png"}); }catch(e){}
    if(file && navigator.canShare && navigator.canShare({ files:[file] })){ navigator.share({ files:[file], text:tr("Mi año en Peak") }).catch(function(){}); return; }
    function normal(){
      try{ var u=URL.createObjectURL(b), a=document.createElement("a"); a.href=u; a.download=nombre; document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(function(){ URL.revokeObjectURL(u); }, 1500); avisoNube("Imagen descargada."); }
      catch(e){ avisoNube("No se ha podido guardar la imagen."); }
    }
    var cl=window.claude;
    if(cl && typeof cl.use==="function"){
      cl.use("downloads").then(function(dl){
        if(!dl){ normal(); return; }
        dl.save({ filename:nombre, data:b }).then(function(){ avisoNube("Imagen guardada."); }, function(e){ if(e && (e.code==="declined")) return; normal(); });
      }, function(){ normal(); });
    } else normal();
  }, "image/png");
}
/* el botón en "Tu evolución" */
var _abrirHistorialDz=abrirHistorial;
abrirHistorial=function(){
  var r=_abrirHistorialDz.apply(this, arguments);
  setTimeout(function(){
    var bt=document.querySelector(".ev-botones"); if(!bt || document.getElementById("ev-anio")) return;
    var b=document.createElement("button"); b.id="ev-anio"; b.className="ev-anio"; b.setAttribute("data-act","x-anio");
    b.innerHTML='<span class="ev-anio-e">✨</span><span class="ev-anio-t"><b>Tu '+today().slice(0,4)+' en Peak</b><small>Tu año en un minuto</small></span>'+
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';
    bt.parentNode.insertBefore(b, bt);
  }, 0);
  return r;
};

/* ════════════ acciones y repintado ════════════ */
function disenoAccion(a, el){
  if(a==="x-diseno"){ disenoCambia(el.dataset.k); return true; }
  if(a==="x-privacidad"){ abrirPrivacidad(); return true; }
  if(a==="x-hb-modo"){ habEd.modo=el.dataset.k; habPintaModo(); sonido("tick"); return true; }
  if(a==="x-hb-dia"){ var i=+el.dataset.i, j=habEd.dias.indexOf(i); if(j>=0) habEd.dias.splice(j,1); else habEd.dias.push(i); el.classList.toggle("on", j<0); sonido("tick"); return true; }
  if(a==="x-hb-vs"){ habEd.vs=Math.max(1, Math.min(6, habEd.vs+(+el.dataset.d))); habPintaModo(); sonido("tick"); return true; }
  if(a==="x-hb-guardar"){ habGuarda(); return true; }
  if(a==="x-hb-nuevo"){ sheetIdeal(null); return true; }
  if(a==="x-cant"){ abrirCantidad(el.dataset.id, el.dataset.day); return true; }
  if(a==="x-cant-mas"){ if(cantAbierto) cantActualiza(cantDe(cantAbierto.d, cantAbierto.id)+(+el.dataset.n)); return true; }
  if(a==="x-cant-pon"){ var v=parseFloat(String(($("#ct-in")||{}).value||"").replace(",", ".")); if(!isNaN(v)) cantActualiza(v); return true; }
  if(a==="x-cant-todo"){ if(cantAbierto){ var x=habPorId(cantAbierto.id); if(x){ if(cantDe(cantAbierto.d,x.id)>=x.meta){ closeSheet(); return true; } cantActualiza(x.meta); } } return true; }
  if(a==="x-anio"){ abrirAnio(); return true; }
  if(a==="x-anio-cerrar"){ anioCierra(); return true; }
  if(a==="x-anio-mueve"){ anioMueve(+el.dataset.d); return true; }
  if(a==="x-anio-compartir"){ anioComparte(); return true; }
  return false;
}
function disenoTrasRender(){
  var il=document.getElementById("ideal-list"); if(il) habRetoca(il);
  var hy=document.getElementById("hoy"); if(hy) habRetoca(hy);
}
document.addEventListener("keydown", function(ev){
  if(!document.getElementById("anio")) return;
  if(ev.key==="Escape") anioCierra(); else if(ev.key==="ArrowRight") anioMueve(1); else if(ev.key==="ArrowLeft") anioMueve(-1);
});

/* ════════════ estilos ════════════ */
var DISENO_CSS=[
/* ── Arena: arena cálida, tarjetas casi blancas, terracota ── */
'html.arena{ color-scheme:light; --grad-2:#d98b4a;',
'  --bg:#efe6d8; --bg-tint-a:rgba(214,150,100,.20); --bg-tint-b:rgba(205,175,125,.18);',
'  --t1:#2a1d14; --t2:#5a4738; --t3:#7a6656;',
'  --accent:#b5562f; --accent-soft:rgba(181,86,47,.12); --accent-line:rgba(181,86,47,.30); --on-accent:#fff;',
'  --good:#4d7a3a; --warn:#b06a14; --alert:#b8402c; --cyan:#3f7f7a; --violet:#8b5a7c; --gold:#a8791f;',
'  --glass-bg:rgba(255,252,247,.92); --glass-bg-hi:#fffcf7; --glass-edge:#fff; --glass-ring:rgba(255,255,255,.95);',
'  --hairline:rgba(70,45,20,.13); --hairline-2:rgba(70,45,20,.075);',
'  --fill:rgba(130,85,40,.075); --fill-hi:rgba(130,85,40,.13); --spec:rgba(255,255,255,.9);',
'  --shadow-1:0 1px 2px rgba(70,45,20,.06), 0 8px 24px -12px rgba(70,45,20,.18);',
'  --shadow-2:0 2px 6px rgba(70,45,20,.08), 0 22px 46px -18px rgba(70,45,20,.26); }',
'html.arena .barpill{ background:color-mix(in srgb,#fffcf7 82%,transparent); }',
'html.arena .field{ background:#fffcf7; box-shadow:inset 0 0 0 1px var(--hairline); }',
'html.arena .view .glass.importante, html.arena .hy-estudio, html.arena .hy-parte{ background:#fffcf7; box-shadow:0 0 0 1px var(--hairline-2), 0 10px 26px -18px rgba(70,45,20,.35); }',
'html.arena .hy-dial, html.arena .hy-luna{ background:#f6eee2; }',
/* ── Porcelana: blanco limpio, tinta casi negra, cobalto ── */
'html.porcelana{ color-scheme:light; --grad-2:#3d7bf5;',
'  --bg:#f7f7f8; --bg-tint-a:transparent; --bg-tint-b:transparent;',
'  --t1:#0d0f14; --t2:#454a55; --t3:#6a707c;',
'  --accent:#1f4fd1; --accent-soft:rgba(31,79,209,.09); --accent-line:rgba(31,79,209,.26); --on-accent:#fff;',
'  --good:#12805c; --warn:#b36b00; --alert:#c93a3a; --cyan:#0e7c93; --violet:#5b4fd6; --gold:#a57a12;',
'  --glass-bg:#ffffff; --glass-bg-hi:#ffffff; --glass-edge:#fff; --glass-ring:#fff;',
'  --hairline:rgba(13,15,20,.10); --hairline-2:rgba(13,15,20,.06);',
'  --fill:rgba(13,15,20,.045); --fill-hi:rgba(13,15,20,.08); --spec:rgba(255,255,255,.9);',
'  --shadow-1:0 1px 2px rgba(13,15,20,.05), 0 6px 18px -10px rgba(13,15,20,.14);',
'  --shadow-2:0 2px 6px rgba(13,15,20,.06), 0 18px 40px -18px rgba(13,15,20,.22); }',
'html.porcelana .canvas-bg{ display:none; }',
'html.porcelana .barpill{ background:rgba(255,255,255,.88); }',
'html.porcelana .field{ background:#fff; box-shadow:inset 0 0 0 1px var(--hairline); }',
'html.porcelana .view .glass.importante, html.porcelana .hy-estudio, html.porcelana .hy-parte{ background:#fff; box-shadow:0 0 0 1px var(--hairline), 0 8px 22px -16px rgba(13,15,20,.25); }',
'html.porcelana .hy-dial, html.porcelana .hy-luna{ background:#f2f3f5; }',
'html.porcelana .view .glass.hero{ background:linear-gradient(155deg,#16338f 0%,#1f4fd1 60%,#3d7bf5 100%); }',
/* ── Clásico: papel blanco sobre lino, títulos más oscuros ── */
'html.neo{ --bg:#ece4d3; --t1:#15100a; --t2:#3b3124; --t3:#5f5242; --glass-bg:#fffdf8; --glass-bg-hi:#ffffff; --fill:#f3ecdd; --fill-hi:#e9dfca;',
'  --hairline:rgba(45,35,20,.20); --hairline-2:rgba(45,35,20,.11); }',
'html.neo .view .glass.importante{ background:#fffdf8!important; box-shadow:0 0 0 1px rgba(45,35,20,.13), 0 1px 2px rgba(50,38,20,.07)!important; }',
'html.neo .hy-estudio, html.neo .hy-parte{ background:#fffdf8; box-shadow:0 0 0 1px rgba(45,35,20,.13), 0 1px 2px rgba(50,38,20,.07); }',
'html.neo .hy-estudio.activo{ background:var(--accent); }',
'html.neo .hy-dial, html.neo .hy-luna{ background:#f3ecdd; box-shadow:inset 0 0 0 1px rgba(45,35,20,.10); }',
'html.neo .hy-pista{ stroke:color-mix(in srgb,var(--c) 24%,#d9ceb6); }',
'html.neo .barpill{ background:#fffdf8; }',
'html.neo .seg{ background:#e4d9c3; } html.neo .seg button[aria-pressed="true"]{ background:#fffdf8; }',
'html.neo .btn-quiet{ background:#fffdf8; box-shadow:inset 0 0 0 1px var(--hairline); }',
'html.neo .eyebrow{ color:var(--t2); }',
'html.neo #gym-btn:not(:has(.gym-si)){ background:#fffdf8!important; box-shadow:inset 0 0 0 1.5px var(--accent-line)!important; color:var(--accent)!important; }',
'html.neo .pt-gym:not(.si){ background:#fffdf8; box-shadow:inset 0 0 0 1px var(--hairline); }',
'html.esencial #gym-btn:has(.gym-si){ background:var(--good)!important; box-shadow:none!important; }',
'html.esencial #gym-btn:not(:has(.gym-si)){ background:transparent!important; box-shadow:inset 0 0 0 1px var(--hairline)!important; color:var(--t1)!important; }',
'html.neo .hy-grupo{ background:#fffdf8; box-shadow:0 0 0 1px var(--hairline-2); }',
'html.neo .view .glass.hero{ background:linear-gradient(155deg,#223a66 0%,#2f4a7d 60%,#4f6f9f 100%); }',

/* ════════ ESENCIAL: la misma app, más sobria ════════ */
'html.esencial{ --spring:cubic-bezier(.2,.7,.2,1); --ease:cubic-bezier(.2,.7,.2,1); }',
'html.esencial:not(.dark):not(.sage):not(.neo):not(.arena):not(.porcelana){ --bg:#fafafa; --t1:#111113; --t2:#4d4d55; --t3:#707078;',
'  --accent:#18181b; --accent-soft:rgba(24,24,27,.07); --accent-line:rgba(24,24,27,.2); --on-accent:#fff; --grad-2:#3f3f46; --violet:#6d5bd0;',
'  --glass-bg:#fff; --glass-bg-hi:#fff; --hairline:rgba(17,17,19,.09); --hairline-2:rgba(17,17,19,.055); --fill:rgba(17,17,19,.04); --fill-hi:rgba(17,17,19,.075); }',
'html.esencial.dark:not(.medianoche):not(.oro){ --bg:#0f0f11; --t1:#f4f4f5; --t2:#a1a1aa; --t3:#7b7b84;',
'  --accent:#f4f4f5; --accent-soft:rgba(244,244,245,.1); --accent-line:rgba(244,244,245,.26); --on-accent:#111113; --grad-2:#d4d4d8; --violet:#a594f9;',
'  --glass-bg:#18181b; --glass-bg-hi:#1f1f23; --hairline:rgba(255,255,255,.09); --hairline-2:rgba(255,255,255,.055); --fill:rgba(255,255,255,.05); --fill-hi:rgba(255,255,255,.09); }',
'html.esencial[class*="acento-"]:not(.neo):not(.arena):not(.porcelana){ --grad-2:var(--accent); }',
/* una sola letra, jerarquía por tamaño y peso */
'html.esencial h1, html.esencial h2, html.esencial h3, html.esencial h4, html.esencial .display, html.esencial .hy-t, html.esencial .pt-t{ font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; letter-spacing:-.025em; }',
'html.esencial .eyebrow, html.esencial .pt-ey{ text-transform:none; letter-spacing:-.005em; font-size:13px; font-weight:600; color:var(--t2); }',
'html.esencial .pt-ey{ color:var(--pc); }',
/* sin brillos, sin desenfoques, sin fondos de colores */
'html.esencial *, html.esencial *::before, html.esencial *::after{ backdrop-filter:none!important; -webkit-backdrop-filter:none!important; }',
'html.esencial .canvas-bg{ display:none!important; }',
'html.esencial #soc-mini{ background:var(--bg)!important; } html.esencial .av{ background:var(--glass-bg)!important; } html.esencial #tour-pop, html.esencial #tema-pop{ background:var(--glass-bg)!important; }',
'html.esencial body{ background-image:none!important; }',
'html.esencial .glass::before, html.esencial .glass::after{ display:none!important; }',
'html.esencial .glass{ border-radius:16px; box-shadow:0 0 0 1px var(--hairline-2); }',
'html.esencial .glass-hover:hover{ transform:none; box-shadow:0 0 0 1px var(--hairline); }',
'html.esencial .view .glass.importante{ border-radius:16px; background:var(--glass-bg)!important; box-shadow:0 0 0 1px var(--hairline)!important; }',
'html.esencial .view .glass.hero{ border-radius:18px; background:var(--accent)!important; box-shadow:none!important; color:var(--on-accent); }',
'html.esencial .view .hero .t1, html.esencial .view .hero h1, html.esencial .view .hero h2, html.esencial .view .hero .display{ color:var(--on-accent)!important; }',
'html.esencial .view .hero .t2, html.esencial .view .hero .t3, html.esencial .view .hero .eyebrow{ color:color-mix(in srgb,var(--on-accent) 70%,transparent)!important; }',
'html.esencial .hy-tarjeta{ border-radius:16px; background:var(--glass-bg)!important; box-shadow:0 0 0 1px var(--hairline)!important; }',
'html.esencial .hy-estudio.activo{ background:var(--accent)!important; color:var(--on-accent); }',
'html.esencial .hy-dial, html.esencial .hy-luna{ background:var(--fill); box-shadow:none; }',
'html.esencial .hy-dial line{ opacity:.3; }',
'html.esencial .hy-parte.hecho .hy-luna{ background:var(--t1); color:var(--bg); }',
'html.esencial .hy-pista{ stroke:var(--fill-hi); stroke-width:6; }',
'html.esencial .hy-arco{ stroke-width:6; }',
'html.esencial .hy-anillo svg{ width:86px; height:86px; }',
'html.esencial .btn{ border-radius:11px; }',
'html.esencial .btn-primary{ background:var(--accent)!important; background-image:none!important; box-shadow:none!important; }',
'html.esencial .btn-primary:hover, html.esencial .btn-quiet:hover, html.esencial .icon-btn:hover{ transform:none; box-shadow:none; }',
'html.esencial .btn-quiet{ background:transparent; box-shadow:inset 0 0 0 1px var(--hairline); }',
'html.esencial .icon-btn{ border-radius:10px; }',
'html.esencial .soft{ border-radius:11px; }',
'html.esencial .field{ border-radius:11px; background:var(--glass-bg); box-shadow:inset 0 0 0 1px var(--hairline); }',
'html.esencial .seg{ border-radius:11px; } html.esencial .seg button{ border-radius:8px; } html.esencial .seg button[aria-pressed="true"]{ box-shadow:0 0 0 1px var(--hairline); }',
'html.esencial .chip, html.esencial .hy-chip, html.esencial .hy-reto{ border-radius:8px; }',
'html.esencial .hy-grupo{ border-radius:12px; background:transparent; box-shadow:inset 0 0 0 1px var(--hairline); }',
'html.esencial .sheet-card{ border-radius:18px 18px 0 0; box-shadow:0 -1px 0 var(--hairline), 0 -20px 50px -30px rgba(0,0,0,.35)!important; }',
'@media (min-width:1024px){ html.esencial .sheet-card{ border-radius:18px; } }',
'html.esencial .sheet-bg{ background:rgba(0,0,0,.28)!important; }',
'html.esencial .barpill{ background:var(--glass-bg)!important; box-shadow:0 0 0 1px var(--hairline), 0 8px 24px -14px rgba(0,0,0,.25)!important; }',
'html.esencial .mtab[aria-current="true"]{ color:var(--t1); }',
'html.esencial .tick{ border-radius:7px; }',
'html.esencial .tick-sm{ border-radius:6px; }',
/* superficies con degradado de las piezas nuevas: color liso */
'html.esencial .soc-reto, html.esencial .reto-extra.done, html.esencial .pt-gym.si, html.esencial #reto-semana.rs-hecho, html.esencial .pf-lg.on .pf-lg-i, html.esencial .av-logro .av-ico{ background:var(--accent)!important; background-image:none!important; box-shadow:none!important; color:var(--on-accent)!important; }',
'html.esencial .hist-boton, html.esencial .rg, html.esencial .hg, html.esencial .rk{ background-image:none!important; box-shadow:0 0 0 1px var(--hairline)!important; }',
'html.esencial .pt-ico{ border-radius:16px; } html.esencial .pt-ico.luna{ box-shadow:none; }',
'html.esencial .aj-ico{ background:var(--fill); color:var(--t1); border-radius:9px; }',
/* movimiento más corto */
'html.esencial .glass, html.esencial .btn, html.esencial .soft, html.esencial .seg button, html.esencial .hy-anillo, html.esencial .hy-tarjeta, html.esencial .mtab svg{ transition-duration:.18s!important; }',
'html.esencial .hy-tarjeta:active, html.esencial .hy-anillo:active{ transform:scale(.985); }',
'html.esencial .mtab[aria-current="true"] svg{ transform:none; }',

/* ── selector de diseño en Ajustes ── */
'.dz-ops{ display:grid; grid-template-columns:1fr 1fr; gap:10px; }',
'.dz-op{ display:flex; flex-direction:column; align-items:flex-start; gap:2px; padding:10px 10px 12px; border-radius:16px; text-align:left; background:var(--fill); box-shadow:inset 0 0 0 1px var(--hairline-2); transition:box-shadow .25s var(--ease), background .25s var(--ease); }',
'.dz-op.on{ background:var(--glass-bg-hi); box-shadow:inset 0 0 0 2px var(--accent); }',
'.dz-m{ position:relative; display:block; width:100%; height:62px; border-radius:11px; overflow:hidden; margin-bottom:8px; }',
'.dz-m i, .dz-m b, .dz-m u{ position:absolute; display:block; }',
'.dz-m1{ background:radial-gradient(90% 90% at 0% 0%,rgba(124,92,214,.35),transparent 60%),#eef0f7; }',
'.dz-m1 i{ left:8px; right:8px; top:8px; height:26px; border-radius:10px; background:linear-gradient(135deg,#4f46e5,#7c5cd6); box-shadow:0 6px 12px -6px #4f46e5; }',
'.dz-m1 b{ left:8px; width:40%; bottom:8px; height:14px; border-radius:7px; background:rgba(255,255,255,.9); box-shadow:0 2px 6px -2px rgba(0,0,0,.2); }',
'.dz-m1 u{ right:8px; width:34%; bottom:8px; height:14px; border-radius:7px; background:rgba(255,255,255,.9); box-shadow:0 2px 6px -2px rgba(0,0,0,.2); }',
'.dz-m2{ background:#fafafa; box-shadow:inset 0 0 0 1px rgba(0,0,0,.08); }',
'.dz-m2 i{ left:8px; right:8px; top:8px; height:26px; border-radius:6px; background:#18181b; }',
'.dz-m2 b{ left:8px; right:8px; bottom:16px; height:1px; background:rgba(0,0,0,.12); }',
'.dz-m2 u{ left:8px; width:46%; bottom:6px; height:6px; border-radius:2px; background:rgba(0,0,0,.18); }',
'.dz-n{ font-size:14.5px; font-weight:700; color:var(--t1); }',
'.dz-s{ font-size:11.5px; color:var(--t3); }',
/* ── privacidad ── */
'.aj-priv{ width:100%; display:flex; align-items:center; gap:12px; margin-top:22px; padding:14px; border-radius:16px; text-align:left; background:var(--fill); }',
'.aj-priv > span:first-child{ font-size:20px; }',
'.aj-priv-t{ flex:1; display:flex; flex-direction:column; } .aj-priv-t b{ font-size:14.5px; } .aj-priv-t small{ font-size:12px; color:var(--t3); }',
'.aj-priv svg{ width:16px; height:16px; color:var(--t3); }',
'.pv{ padding-bottom:10px; }',
'.pv-intro{ font-size:14.5px; line-height:1.55; color:var(--t2); margin-bottom:6px; }',
'.pv-h{ font-size:15.5px; font-weight:800; letter-spacing:-.02em; margin:22px 0 6px; }',
'.pv-p{ font-size:13.5px; line-height:1.6; color:var(--t2); margin-top:6px; } .pv-p b{ color:var(--t1); }',
'.pu-link{ display:inline; padding:0; font:inherit; color:inherit; text-decoration:underline; font-weight:700; }',
'.pv-fecha{ font-size:12px; color:var(--t3); margin-top:24px; }',
/* ── editor de hábitos ── */
'.hb-lista{ max-height:250px; overflow-y:auto; margin-right:-4px; padding-right:4px; }',
'.hb-item{ display:flex; align-items:center; gap:10px; padding:9px 0; box-shadow:inset 0 -1px 0 var(--hairline-2); }',
'.hb-item:last-child{ box-shadow:none; }',
'.hb-item.on .hb-item-t b{ color:var(--accent); }',
'.hb-item-t{ flex:1; min-width:0; display:flex; flex-direction:column; }',
'.hb-item-t b{ font-size:13.5px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
'.hb-item-t small{ font-size:11.5px; color:var(--t3); margin-top:1px; }',
'.hb-lab{ font-size:12.5px; font-weight:700; color:var(--t2); margin-bottom:7px; }',
'.hb-dias{ display:grid; grid-template-columns:repeat(7,1fr); gap:6px; }',
'.hb-dias button{ height:40px; border-radius:12px; font-size:13.5px; font-weight:700; color:var(--t2); background:var(--fill); transition:background .2s var(--ease), color .2s var(--ease), transform .25s var(--spring); }',
'.hb-dias button.on{ background:var(--accent); color:var(--on-accent); }',
'.hb-dias button:active{ transform:scale(.92); }',
'.hb-vs{ display:flex; align-items:center; gap:12px; }',
'.hb-vs button{ width:42px; height:42px; border-radius:12px; font-size:20px; font-weight:600; background:var(--fill); color:var(--t1); flex:0 0 auto; }',
'.hb-vs span{ flex:1; text-align:center; font-size:14px; color:var(--t2); } .hb-vs b{ font-size:20px; color:var(--t1); font-weight:800; }',
/* ── cantidades en las filas ── */
'.hb-cant{ position:relative; overflow:hidden; flex:0 0 auto; display:inline-flex; align-items:center; gap:3px; height:24px; padding:0 9px; border-radius:99px; font-size:11.5px; color:var(--t2); background:var(--fill); isolation:isolate; }',
'.hb-cant i{ position:absolute; left:0; top:0; bottom:0; z-index:-1; background:color-mix(in srgb,var(--accent) 18%,transparent); transition:width .5s var(--ease); }',
'.hb-cant b{ color:var(--t1); font-weight:700; }',
'.hb-cant.ok{ color:var(--accent); } .hb-cant.ok b{ color:var(--accent); }',
'.hb-fq{ display:block; font-size:11px; color:var(--t3); margin-top:1px; text-decoration:none; }',
'.done .hb-fq{ text-decoration:none; }',
'.ct-caja{ margin:14px 0 18px; }',
'.ct-num{ display:flex; align-items:baseline; gap:8px; }',
'.ct-num b{ font-family:"Plus Jakarta Sans",sans-serif; font-size:56px; font-weight:800; letter-spacing:-.04em; line-height:1; }',
'html.esencial .ct-num b{ font-family:Inter,sans-serif; }',
'.ct-num span{ font-size:16px; color:var(--t3); font-weight:600; }',
'.ct-pop{ animation:ctPop .35s var(--spring); }',
'@keyframes ctPop{ 0%{ transform:scale(1); } 40%{ transform:scale(1.12); } 100%{ transform:scale(1); } }',
'.ct-barra{ height:10px; border-radius:99px; background:var(--fill-hi); overflow:hidden; margin-top:14px; }',
'.ct-barra i{ display:block; height:100%; border-radius:99px; background:var(--accent); transition:width .45s cubic-bezier(.3,.9,.3,1); }',
'.ct-botones{ display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }',
'.ct-botones button{ height:52px; border-radius:14px; font-size:16px; font-weight:700; background:var(--fill); color:var(--t1); transition:transform .2s var(--spring); }',
'.ct-botones button:active{ transform:scale(.93); }',
'.ct-botones button:first-child{ color:var(--t3); }',
/* ── tu año ── */
'.ev-anio{ width:100%; display:flex; align-items:center; gap:13px; margin-top:18px; padding:15px 16px; border-radius:18px; text-align:left; color:#fff;',
'  background:radial-gradient(120% 120% at 100% 0%,#7c5cd6 0%,transparent 55%),linear-gradient(140deg,#1d1b3a,#3b1d5e); box-shadow:0 14px 30px -18px #3b1d5e; }',
'.ev-anio-e{ font-size:26px; }',
'.ev-anio-t{ flex:1; display:flex; flex-direction:column; } .ev-anio-t b{ font-size:15.5px; font-weight:800; } .ev-anio-t small{ font-size:12px; opacity:.75; }',
'.ev-anio svg{ width:17px; height:17px; opacity:.7; }',
'html.esencial .ev-anio{ background:var(--accent); color:var(--on-accent); box-shadow:none; border-radius:14px; }',
'#anio{ position:fixed; inset:0; z-index:96; color:#fff; background:var(--an-bg,#1d1b3a); transition:background .6s var(--ease), opacity .38s var(--ease), transform .38s var(--ease); opacity:0; transform:scale(.96);',
'  display:flex; flex-direction:column; overflow:hidden; }',
'#anio::before{ content:""; position:absolute; inset:-20%; background:radial-gradient(60% 45% at 80% 10%,rgba(255,255,255,.16),transparent 70%),radial-gradient(50% 40% at 10% 90%,rgba(255,255,255,.08),transparent 70%); pointer-events:none; }',
'html.esencial #anio::before{ display:none; }',
'#anio.abierto{ opacity:1; transform:none; }',
'#anio.saliendo{ opacity:0; transform:scale(.97); }',
'.an-barras{ position:relative; z-index:3; display:flex; gap:4px; padding:calc(env(safe-area-inset-top) + 12px) 14px 0; }',
'.an-barras i{ flex:1; height:3px; border-radius:3px; background:rgba(255,255,255,.28); overflow:hidden; }',
'.an-barras i u{ display:block; height:100%; width:0; background:#fff; }',
'.an-barras i.ok u{ width:100%; }',
'.an-barras i.ya u{ animation:anBarra 6.5s linear forwards; }',
'@keyframes anBarra{ to{ width:100%; } }',
'.an-x{ position:absolute; z-index:4; top:calc(env(safe-area-inset-top) + 24px); right:12px; width:40px; height:40px; border-radius:99px; display:grid; place-items:center; color:#fff; background:rgba(255,255,255,.14); }',
'.an-x svg{ width:18px; height:18px; }',
'.an-zona{ position:absolute; top:70px; bottom:0; z-index:2; }',
'.an-atras{ left:0; width:34%; } .an-alante{ right:0; width:66%; }',
'.an-cuerpo{ position:relative; z-index:1; flex:1; display:flex; flex-direction:column; justify-content:center; padding:40px 30px 60px; max-width:560px; margin:0 auto; width:100%; animation:anEntra .5s cubic-bezier(.2,.8,.2,1); }',
'@keyframes anEntra{ from{ opacity:0; transform:translateY(22px); } to{ opacity:1; transform:none; } }',
'.an-e{ font-size:54px; line-height:1; margin-bottom:22px; }',
'.an-n{ font-family:"Plus Jakarta Sans",sans-serif; font-size:96px; font-weight:800; letter-spacing:-.05em; line-height:.95; }',
'.an-u{ font-size:24px; font-weight:700; letter-spacing:-.02em; margin-top:8px; }',
'.an-t{ font-family:"Plus Jakarta Sans",sans-serif; font-size:40px; font-weight:800; letter-spacing:-.04em; line-height:1.05; }',
'html.esencial .an-n, html.esencial .an-t{ font-family:Inter,sans-serif; }',
'.an-s{ font-size:16.5px; line-height:1.5; margin-top:16px; opacity:.8; max-width:30em; }',
'.an-meses{ display:grid; grid-template-columns:repeat(12,1fr); gap:6px; height:150px; margin-top:34px; }',
'.an-meses span{ display:flex; flex-direction:column; justify-content:flex-end; align-items:center; gap:6px; }',
'.an-meses i{ width:100%; height:var(--h); border-radius:6px; background:rgba(255,255,255,.3); transform-origin:bottom; animation:anSube .8s cubic-bezier(.2,.8,.2,1) both; }',
'.an-meses span:nth-child(n) i{ animation-delay:calc(var(--k,0) * 40ms); }',
'.an-meses .top i{ background:#ffd166; }',
'.an-meses b{ font-size:11px; font-weight:700; opacity:.6; }',
'@keyframes anSube{ from{ transform:scaleY(0); } to{ transform:none; } }',
'.an-animos{ display:flex; justify-content:space-between; margin-top:34px; }',
'.an-animos span{ display:flex; flex-direction:column; align-items:center; gap:8px; }',
'.an-animos em{ font-style:normal; font-size:34px; transform:scale(var(--s)); }',
'.an-animos b{ font-size:14px; opacity:.75; }',
'.an-fin{ position:relative; z-index:3; display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:40px; }',
'.an-fin button{ height:52px; border-radius:16px; font-size:15px; font-weight:700; background:#fff; color:#17152e; }',
'.an-fin button.sec{ background:rgba(255,255,255,.14); color:#fff; }',
'@media (prefers-reduced-motion:reduce){ .an-cuerpo, .an-meses i{ animation:none; } }'
].join("\n");
