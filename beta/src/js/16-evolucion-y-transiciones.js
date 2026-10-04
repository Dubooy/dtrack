/* ════════════════════════════════════════════════════════════════
   EVOLUCIÓN: tarjetas de Resumen rehechas, la cuenta atrás de vuelta,
   retos de la semana editables, metas con hueco en blanco, "Tu evolución"
   (el antiguo historial) y transiciones suaves (tema, perfil, ×1,5).
   ════════════════════════════════════════════════════════════════ */

/* ── la tarjeta de estudio: bloques de pomodoro de hoy ── */
var EST_BLOQUE=25, EST_META_BLOQUES=4;
function tarjetaEstudio(){
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
  return '<button class="hy-tarjeta hy-estudio" data-act="x-estudiar">'+
    '<div class="hy-dial"><svg viewBox="0 0 100 100">'+marcas+'</svg><span class="hy-dial-ico">'+ICO_RELOJ+'</span></div>'+
    '<p class="hy-t">Estudiar</p><p class="hy-s">'+(min?horasTxt(min)+" hoy":"Aún nada hoy")+'</p>'+
    '<p class="hy-pie num">'+(semana?horasTxt(semana)+" esta semana":"Empieza un pomodoro")+'</p></button>';
}

/* ── la tarjeta del parte: la racha en grande y la semana de lunes a domingo ── */
function tarjetaParte(){
  var hoy=today(), hecho=!!(S.parte && S.parte[hoy]), h=new Date().getHours(), toca=(h>=19||h<4);
  var racha=0, d2=hecho?hoy:addDays(hoy,-1); while(S.parte && S.parte[d2] && racha<400){ racha++; d2=addDays(d2,-1); }
  var l=lunesDe(hoy), cuadros="", letras="";
  for(var i=0;i<7;i++){
    var d=addDays(l,i), ok=!!(S.parte && S.parte[d]), an=(typeof animoDe==="function"&&animoDe(d))||{};
    var fut=d>hoy, cls=(ok?"on":"")+(d===hoy?" hoy":"")+(fut?" fut":"");
    cuadros+='<i class="'+cls+'"'+(ok&&an.v?' style="--o:'+(0.45+an.v*0.11).toFixed(2)+'"':'')+'></i>';
    letras+='<span'+(d===hoy?' class="hoy"':'')+'>'+L10N.sem[i]+'</span>';
  }
  var s = hecho ? "Hecho · +"+dayXP(hoy,tasksByDay())+" XP hoy" : toca ? "Toca ahora: un minuto para cerrar el día" : "Esta noche, un minuto para repasar el día";
  return '<button class="hy-tarjeta hy-parte'+(hecho?" hecho":"")+(toca&&!hecho?" toca":"")+'" data-act="parte">'+
    '<div class="hy-luna">'+ICO_LUNA+'</div>'+
    '<p class="hy-t">Parte del día</p><p class="hy-s">'+s+'</p>'+
    '<div class="hy-semana">'+cuadros+'</div><div class="hy-letras">'+letras+'</div>'+
  '</button>';
}

/* ── la cuenta atrás vuelve al Resumen, discreta, debajo de la frase ── */
var ICO_ARENA='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9"/></svg>';
function pintaCuenta(){
  var viejo=document.getElementById("hy-cuenta"); if(viejo) viejo.remove(); return;
  var sub=document.getElementById("hero-sub"); if(!sub) return;
  var el=document.getElementById("hy-cuenta");
  var f=S.profile && S.profile.ebau, n=f ? diff(today(), f) : NaN;
  if(!f || isNaN(n) || n<0){ if(el) el.remove(); return; }
  if(!el){ el=document.createElement("button"); el.id="hy-cuenta"; el.setAttribute("data-act","open-settings"); sub.parentNode.insertBefore(el, sub.nextSibling); }
  var nom=(S.profile.evento||"").trim()||"Tu día";
  el.innerHTML='<span class="hc-ico">'+ICO_ARENA+'</span><b>'+esc(nom)+'</b><span class="num">'+(n===0?"es hoy":n===1?"mañana":"en "+n+" días")+'</span>';
}

/* ════════════ retos de la semana: se pueden elegir, cambiar y crear ════════════ */
var RS_TPL={ gym4:"Hacer ejercicio {n} días", est6:"Estudiar {n} horas con el temporizador", tres5:"Hacer los tres retos {n} días",
  sueno5:"Dormir 7 horas o más {n} noches", agua5:"Beber suficiente agua {n} días", check4:"Cumplir todos los hábitos {n} días", pant4:"Menos de 2 horas de pantalla {n} días" };
function rsCfg(){ if(!S.rsem) S.rsem={ off:{}, meta:{}, propios:[], elegido:{}, sem:{}, cuenta:{} };
  ["off","meta","elegido","sem","cuenta"].forEach(function(k){ if(!S.rsem[k]) S.rsem[k]={}; }); if(!S.rsem.propios) S.rsem.propios=[]; return S.rsem; }
function rsBase(id){ for(var i=0;i<RETOS_SEMANA.length;i++) if(RETOS_SEMANA[i].id===id) return RETOS_SEMANA[i]; return null; }
function rsTitulo(id, meta){ var tp=RS_TPL[id]; if(!tp){ var b=rsBase(id); return b?b.t:""; } return tp.replace("{n}", id==="est6" ? String(Math.round(meta/60*10)/10).replace(".",",") : meta); }
function rsPool(){
  var c=rsCfg(), a=[];
  RETOS_SEMANA.forEach(function(r){ if(c.off[r.id]) return; var m=c.meta[r.id]||r.meta; a.push({ id:r.id, t:rsTitulo(r.id,m), meta:m, u:r.u }); });
  c.propios.forEach(function(p){ a.push({ id:p.id, t:p.t, meta:p.meta, u:"veces", propio:true }); });
  return a;
}
function rsSnapActual(l, forzar){
  var c=rsCfg();
  if(c.sem[l] && !forzar) return c.sem[l];
  var pool=rsPool(); if(!pool.length) return null;
  var elegido=null; if(c.elegido[l]) pool.forEach(function(p){ if(p.id===c.elegido[l]) elegido=p; });
  var r=elegido || pool[hashTxt("sem"+l)%pool.length];
  c.sem[l]={ id:r.id, t:r.t, meta:r.meta, u:r.u, propio:!!r.propio };
  return c.sem[l];
}
function retoSemana(l){
  var hoy=today(), cur=lunesDe(hoy), r=null;
  if(S.rsem){ r = (S.rsem.sem && S.rsem.sem[l]) || (l===cur ? rsSnapActual(l) : null); }
  if(!r){ var b=RETOS_SEMANA[hashTxt("sem"+l)%RETOS_SEMANA.length]; r={ id:b.id, t:b.t, meta:b.meta, u:b.u }; }
  var ds=diasSemana(l).filter(function(d){ return d<=hoy; }), v;
  if(r.propio) v=(S.rsem && S.rsem.cuenta[l+"|"+r.id])||0;
  else { var base=rsBase(r.id); v = base ? base.f(ds) : 0; }
  return { r:r, v:v, hecho:v>=r.meta, pct:Math.min(1, v/Math.max(1,r.meta)), quedan:Math.max(0, diff(hoy, addDays(l,6))) };
}
function pintaRetoSemana(){
  var izq=document.getElementById("retos-left"); if(!izq) return;
  var box=document.getElementById("reto-semana");
  if(!box){ box=document.createElement("div"); box.id="reto-semana"; box.className="glass importante rounded-[24px] pad";
    var primera=izq.firstElementChild; if(primera && primera.nextSibling) izq.insertBefore(box, primera.nextSibling); else izq.appendChild(box); }
  var l=lunesDe(today()), s=retoSemana(l), r=s.r;
  var val = r.u==="min" ? horasTxt(s.v)+" de "+horasTxt(r.meta) : s.v+" de "+r.meta+(r.u==="veces"?(r.meta===1?" vez":" veces"):" días");
  var clave=l+"|"+r.id+"|"+r.meta+"|"+s.v+"|"+r.t; if(box.dataset.k===clave) return;
  var antes=box.dataset.k ? box.querySelector(".rs-barra i") : null, pctAntes=antes ? antes.style.width : null;
  box.dataset.k=clave;
  box.innerHTML=
    '<div class="rs-top"><span class="eyebrow">Reto de la semana</span><span class="rs-dcha"><span class="rs-xp">+'+RETO_SEMANA_XP+' XP</span>'+
      '<button class="rs-editar" data-act="x-rs-abrir">Cambiar</button></span></div>'+
    '<p class="rs-t display">'+esc(r.t)+'</p>'+
    '<div class="rs-barra"><i style="width:'+(pctAntes||Math.round(s.pct*100)+'%')+(s.hecho?';background:var(--good)':'')+'"></i></div>'+
    '<div class="rs-pie"><span class="num">'+val+'</span>'+
      (r.propio && !s.hecho
        ? '<span class="rs-cuenta"><button data-act="x-rs-cuenta" data-d="-1" aria-label="Quitar una">−</button><button data-act="x-rs-cuenta" data-d="1" aria-label="Sumar una">+1</button></span>'
        : '<span>'+(s.hecho?'<b style="color:var(--good)">Conseguido</b>':(s.quedan===0?"Último día":"Quedan "+s.quedan+(s.quedan===1?" día":" días")))+'</span>')+
    '</div>';
  if(pctAntes){ var i2=box.querySelector(".rs-barra i"); requestAnimationFrame(function(){ i2.style.width=Math.round(s.pct*100)+"%"; }); }
}
var RS_LIM={ gym4:[1,7], est6:[60,1800], tres5:[1,7], sueno5:[1,7], agua5:[1,7], check4:[1,7], pant4:[1,7] };
function sheetRetosSemana(){
  var c=rsCfg(), l=lunesDe(today()), actual=retoSemana(l).r.id;
  function fila(id, t, meta, propio, off){
    var n = id==="est6" ? (Math.round(meta/60*10)/10+" h").replace(".",",") : meta;
    return '<div class="rso'+(off?" off":"")+(id===actual?" actual":"")+'">'+
      (propio ? '<button class="rso-borra" data-act="x-rs-borra" data-id="'+id+'" aria-label="Borrar">'+ICON_TRASH+'</button>'
              : '<button class="rso-sw'+(off?"":" on")+'" data-act="x-rs-sw" data-id="'+id+'" aria-label="Activar o quitar"><i></i></button>')+
      '<div class="rso-txt"><span>'+esc(t)+'</span>'+
        (id===actual ? '<small class="rso-esta">Esta semana</small>'
                     : (off ? '' : '<button class="rso-usar" data-act="x-rs-usar" data-id="'+id+'">Usar esta semana</button>'))+'</div>'+
      (off ? '' : '<span class="rso-num"><button data-act="x-rs-meta" data-id="'+id+'" data-d="-1" aria-label="Menos">−</button><b class="num">'+n+'</b>'+
        '<button data-act="x-rs-meta" data-id="'+id+'" data-d="1" aria-label="Más">+</button></span>')+
    '</div>';
  }
  var h='<div class="flex items-start justify-between mb-2"><h3 class="display text-[19px] font-bold">Retos de la semana</h3>'+closeBtn()+'</div>'+
    '<p class="text-[12.5px] t3 mb-4">Cada lunes sale uno de esta lista. Los de la app se cuentan solos; los tuyos los vas marcando tú.</p>'+
    '<div class="rso-lista">'+RETOS_SEMANA.map(function(r){ var m=c.meta[r.id]||r.meta; return fila(r.id, rsTitulo(r.id,m), m, false, !!c.off[r.id]); }).join("")+'</div>'+
    (c.propios.length ? '<p class="eyebrow mt-5 mb-2">Los tuyos</p><div class="rso-lista">'+c.propios.map(function(p){ return fila(p.id, p.t, p.meta, true, false); }).join("")+'</div>' : '')+
    '<p class="eyebrow mt-5 mb-2">Nuevo reto semanal</p>'+
    '<div class="rso-nuevo"><input id="rso-t" class="field" maxlength="70" placeholder="Ej. Leer antes de dormir">'+
      '<label><input id="rso-n" type="number" inputmode="numeric" min="1" max="50" value="3" class="field"><span>veces</span></label></div>'+
    '<button class="btn btn-primary w-full mt-3" data-act="x-rs-nuevo">Añadir reto</button>';
  var sc=document.querySelector("#sheet-body"), top=sc&&sc.parentNode ? sc.parentNode.scrollTop : 0;
  openSheet(h);
  if(sc && sc.parentNode) sc.parentNode.scrollTop=top;
}
function rsCambia(){ var c=rsCfg(), l=lunesDe(today()); delete c.sem[l]; rsSnapActual(l, true); save(); render(); sheetRetosSemana(); }
function rsAccion(a, el){
  var c=rsCfg(), l=lunesDe(today()), id=el.dataset.id;
  if(a==="x-rs-abrir"){ sheetRetosSemana(); return true; }
  if(a==="x-rs-sw"){
    var activos=RETOS_SEMANA.filter(function(r){ return !c.off[r.id]; }).length + c.propios.length;
    if(!c.off[id] && activos<=1){ avisoNube("Deja al menos uno activo."); return true; }
    if(c.off[id]) delete c.off[id]; else c.off[id]=1;
    if(c.elegido[l]===id) delete c.elegido[l];
    sonido("tick"); rsCambia(); return true;
  }
  if(a==="x-rs-meta"){
    var d=+el.dataset.d, p=null; c.propios.forEach(function(x){ if(x.id===id) p=x; });
    if(p){ p.meta=Math.max(1, Math.min(50, p.meta+d)); }
    else { var b=rsBase(id), lim=RS_LIM[id]||[1,7], paso=id==="est6"?60:1; c.meta[id]=Math.max(lim[0], Math.min(lim[1], (c.meta[id]||b.meta)+d*paso)); }
    sonido("tick"); rsCambia(); return true;
  }
  if(a==="x-rs-usar"){ c.elegido[l]=id; sonido("pop"); rsCambia(); return true; }
  if(a==="x-rs-borra"){
    c.propios=c.propios.filter(function(x){ return x.id!==id; });
    if(c.elegido[l]===id) delete c.elegido[l];
    if(!rsPool().length){ RETOS_SEMANA.forEach(function(r){ delete c.off[r.id]; }); }
    rsCambia(); return true;
  }
  if(a==="x-rs-nuevo"){
    var ti=document.getElementById("rso-t"), t=(ti&&ti.value||"").trim(), n=parseInt((document.getElementById("rso-n")||{}).value,10);
    if(!t){ if(ti) ti.focus(); return true; }
    var nuevo={ id:"p"+uid(), t:t.slice(0,70), meta:Math.max(1,Math.min(50,n||3)) };
    c.propios.push(nuevo); sonido("pop"); rsCambia(); return true;
  }
  if(a==="x-rs-cuenta"){
    var s=retoSemana(l); if(!s.r.propio) return true;
    var k=l+"|"+s.r.id; c.cuenta[k]=Math.max(0,(c.cuenta[k]||0)+(+el.dataset.d));
    sonido(+el.dataset.d>0?"pop":"des"); save(); render(); return true;
  }
  return false;
}

/* ── metas del mes: siempre hay un hueco en blanco esperando a que lo escribas ── */
function pintaMetas(){
  var izq=document.getElementById("retos-left"); if(!izq) return;
  var box=document.getElementById("metas-mes");
  if(!box){ box=document.createElement("div"); box.id="metas-mes"; box.className="glass rounded-[24px] pad";
    var rs=document.getElementById("reto-semana"); if(rs && rs.nextSibling) izq.insertBefore(box, rs.nextSibling); else izq.appendChild(box); }
  var mk=mesDe(today()), ms=metasMes(mk);
  var nombreMes=cap(new Date(mk+"-15T12:00:00").toLocaleDateString(LOCALE,{month:"long"})).toLowerCase();
  var h='<div class="mt-cab"><div><h2 class="display text-[17px] font-bold">Objetivos de '+esc(nombreMes)+'</h2>'+
    '<p class="text-[12.5px] t3 mt-0.5">Hasta tres objetivos grandes para este mes · +'+META_XP+' XP cada una</p></div></div>';
  ms.forEach(function(m){
    var v=metaValor(m,mk), p=Math.min(1, v/Math.max(1,m.obj)), ok=v>=m.obj, tipo=METAS_TIPOS.filter(function(x){ return x.k===m.tipo; })[0]||METAS_TIPOS[0];
    h+='<div class="mt-fila'+(ok?" ok":"")+'">'+
      '<div class="mt-arriba"><button class="mt-t" data-act="x-meta-editar" data-id="'+m.id+'">'+esc(m.t)+'</button>'+
      (m.tipo==="hecha"?'<button class="mt-check'+(ok?" on":"")+'" data-act="x-meta-hecha" data-id="'+m.id+'" aria-label="Marcar como hecha">'+ICON_CHECK+'</button>':'')+
      (m.tipo==="manual"&&!ok?'<span class="mt-mas"><button data-act="x-meta-d" data-id="'+m.id+'" data-d="-1" aria-label="Quitar uno">−</button><button data-act="x-meta-d" data-id="'+m.id+'" data-d="1" aria-label="Sumar uno">+</button></span>':'')+'</div>'+
      (m.tipo==="hecha"
        ? '<div class="mt-pie"><span>'+(ok?'<b>Conseguida</b>':'Márcala cuando la cumplas')+'</span></div>'
        : '<div class="mt-barra"><i style="width:'+Math.round(p*100)+'%"></i></div>'+
          '<div class="mt-pie"><span class="num">'+v+' de '+m.obj+(tipo.u?" "+tipo.u:"")+'</span><span>'+(ok?'<b>Conseguida</b>':(m.tipo==="manual"?"la cuentas tú":"se cuenta sola"))+'</span></div>')+
    '</div>';
  });
  if(ms.length<3){
    h+='<button class="mt-blanco" data-act="x-meta-nueva">'+
      '<span class="mt-blanco-t">'+(ms.length?"Otra meta para "+esc(nombreMes):"Escribe tu meta de "+esc(nombreMes))+'</span>'+
      '<span class="mt-blanco-l"></span>'+
      '<span class="mt-blanco-p"><span>0 de —</span><span>toca para ponerla</span></span></button>';
  }
  box.innerHTML=h;
}

/* ════════════ Tu evolución (antes, historial) ════════════ */
function evoDatos(){
  var hoy=today(), ini=primerDia(), tmap=tasksByDay(), d=ini, activos=0, est=0, tope=0;
  while(d<=hoy && tope<3000){ if(activeDay(d)) activos++; est+=estudioMinDia(d); d=addDays(d,1); tope++; }
  var st=stats();
  return { activos:activos, est:est, mejor:st.best, xp:st.xp, dias:diff(ini,hoy)+1, tmap:tmap };
}
function evoMapa(semanas, tmap){
  /* columnas = semanas (de lunes a domingo), filas = días */
  var hoy=today(), l=addDays(lunesDe(hoy), -7*(semanas-1)), h='';
  for(var w=0; w<semanas; w++){
    h+='<span class="ev-col">';
    for(var i=0;i<7;i++){
      var d=addDays(l, w*7+i), x = d<=hoy ? dayXP(d,tmap) : -1;
      var n = x<0 ? "f" : x<=0 ? 0 : x<40 ? 1 : x<80 ? 2 : 3;
      h+='<i class="n'+n+(d===hoy?" hoy":"")+'"></i>';
    }
    h+='</span>';
  }
  return h;
}
function pintaBotonHistorial(){
  var izq=document.getElementById("retos-left"); if(!izq) return;
  var b=document.getElementById("hist-boton");
  if(!b){ b=document.createElement("button"); b.id="hist-boton"; b.className="ev-tarjeta"; b.setAttribute("data-act","x-historial"); izq.appendChild(b); }
  var e=evoDatos(), k=e.activos+"|"+e.xp+"|"+today(); if(b.dataset.k===k) return; b.dataset.k=k;
  b.innerHTML=
    '<div class="ev-cab"><div><p class="eyebrow">Tu evolución</p><p class="ev-titulo display">'+(e.activos===0?"Hoy empieza tu historia":e.activos===1?"1 día contigo":e.activos+" días contigo")+'</p></div>'+
      '<svg class="ev-flecha" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></div>'+
    '<div class="ev-mapa">'+evoMapa(16, e.tmap)+'</div>'+
    '<div class="ev-cifras"><div><b class="num">'+e.mejor+'</b><span>mejor racha</span></div><div><b class="num">'+e.xp+'</b><span>XP en total</span></div><div><b class="num">'+horasTxt(e.est)+'</b><span>de estudio</span></div></div>';
}
function histDevuelve(){
  histSitios.forEach(function(s){ if(s.padre) s.padre.insertBefore(s.el, s.sig && s.sig.parentNode===s.padre ? s.sig : null); });
  histSitios=[];
}
function abrirHistorial(){
  /* si se abre otra vez antes de que acabe el cierre, primero se devuelven las piezas: si no, se perdían (y Vital fallaba) */
  histDevuelve();
  histMarca();
  var capa=document.getElementById("hist-capa");
  if(!capa){ capa=document.createElement("div"); capa.id="hist-capa"; document.body.appendChild(capa); }
  var b=document.getElementById("hist-boton");
  if(b){ var r=b.getBoundingClientRect(); capa.style.setProperty("--ev-top", Math.max(0,r.top)+"px"); capa.style.setProperty("--ev-bot", Math.max(0,window.innerHeight-r.bottom)+"px");
    capa.style.setProperty("--ev-izq", r.left+"px"); capa.style.setProperty("--ev-der", Math.max(0,window.innerWidth-r.right)+"px"); }
  var e=evoDatos();
  capa.innerHTML='<div class="pf-barra"><button class="pf-atras" data-act="x-historial-cerrar" aria-label="Volver">'+
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button><span>Tu evolución</span></div>'+
    '<div class="pf-scroll" id="hist-scroll">'+
      '<div class="ev-hero"><p class="eyebrow">Desde que empezaste</p>'+
        '<h1 class="display">'+(e.activos===1?"1 día":e.activos+" días")+' <span>moviéndote</span></h1>'+
        '<p class="ev-sub">'+(e.dias>1?"De "+e.dias+" días desde tu primer registro.":"Hoy es tu primer día. Esto se irá llenando.")+'</p>'+
        '<div class="ev-mapa grande">'+evoMapa(20, e.tmap)+'</div>'+
        '<div class="ev-leyenda"><span>menos</span><i class="n0"></i><i class="n1"></i><i class="n2"></i><i class="n3"></i><span>más</span></div>'+
        '<div class="ev-cifras grande"><div><b class="num">'+e.mejor+'</b><span>mejor racha</span></div><div><b class="num">'+e.xp+'</b><span>XP en total</span></div><div><b class="num">'+horasTxt(e.est)+'</b><span>de estudio</span></div></div>'+
      '</div>'+
    '</div>';
  var sc=document.getElementById("hist-scroll");
  try{ rVital(); }catch(err){}
  histSitios=[];
  HIST_PIEZAS.forEach(function(p){
    var el = p.id ? document.getElementById(p.id) : (document.querySelector(p.sel) ? document.querySelector(p.sel).closest(".glass") : null);
    if(!el) return;
    histSitios.push({ el:el, padre:el.parentNode, sig:el.nextSibling });
    sc.appendChild(el);
  });
  sc.insertAdjacentHTML("beforeend",'<div style="height:40px"></div>');
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ capa.classList.add("ve"); }); });
  sonido("inicio");
}
function cerrarHistorial(){
  var capa=document.getElementById("hist-capa"); if(!capa) return;
  capa.classList.remove("ve"); capa.classList.add("sale");
  setTimeout(function(){
    if(capa.classList.contains("ve")) return;
    histDevuelve();
    if(capa.parentNode) capa.parentNode.removeChild(capa);
  }, 460);
}

/* ════════════ transiciones ════════════ */
/* el perfil sale del avatar que tocas y vuelve a él al cerrar */
document.addEventListener("pointerdown", function(ev){
  var t=ev.target.closest && ev.target.closest('[data-act="x-perfil"]'); if(!t) return;
  var r=(t.querySelector("img, .cara, span")||t).getBoundingClientRect();
  document.documentElement.style.setProperty("--pf-x", Math.round(r.left+r.width/2)+"px");
  document.documentElement.style.setProperty("--pf-y", Math.round(r.top+r.height/2)+"px");
}, true);

/* el ×1,5: la caja crece de la línea a la ventana verde (y al revés) */
var bxAntes={ d:null, on:null, h:0 };
function bonusSuave(){
  var bx=document.querySelector("#today-challenges .bonus-x"); if(!bx) return;
  var d=curDay(), on=!bx.classList.contains("bx-off"), h=bx.offsetHeight;
  if(bxAntes.d===d && bxAntes.on!==null && bxAntes.on!==on && view==="retos" && bxAntes.h && Math.abs(bxAntes.h-h)>2){
    var desde=bxAntes.h;
    bx.style.height=desde+"px"; bx.style.overflow="hidden";
    bx.classList.add(on?"bx-crece":"bx-mengua");
    void bx.offsetHeight;
    bx.style.transition="height .5s cubic-bezier(.3,.9,.3,1), background-color .4s ease, box-shadow .4s ease";
    bx.style.height=h+"px";
    setTimeout(function(){ bx.style.height=""; bx.style.overflow=""; bx.style.transition=""; bx.classList.remove("bx-crece","bx-mengua"); }, 560);
  }
  bxAntes={ d:d, on:on, h:h };
}

/* el tema nuevo se abre en círculo desde la muestra que tocas */
function temaConTransicion(k, x, y){
  var quieto=false; try{ quieto=window.matchMedia("(prefers-reduced-motion: reduce)").matches; }catch(e){}
  try{ localStorage.setItem(TKEY,k); }catch(e){}
  if(!document.startViewTransition || quieto){
    document.documentElement.classList.add("tema-suave");
    applyTheme(k);
    setTimeout(function(){ document.documentElement.classList.remove("tema-suave"); }, 600);
    return;
  }
  var t=document.startViewTransition(function(){ applyTheme(k); });
  t.ready.then(function(){
    var r=Math.hypot(Math.max(x, innerWidth-x), Math.max(y, innerHeight-y));
    document.documentElement.animate(
      { clipPath:["circle(0px at "+x+"px "+y+"px)", "circle("+r+"px at "+x+"px "+y+"px)"] },
      { duration:620, easing:"cubic-bezier(.3,.8,.25,1)", pseudoElement:"::view-transition-new(root)" });
  }).catch(function(){});
}

/* metas personalizadas: se marcan y ya */
if(typeof METAS_TIPOS!=="undefined" && !METAS_TIPOS.some(function(x){ return x.k==="hecha"; }))
  METAS_TIPOS.splice(1, 0, { k:"hecha", n:"Personalizada · la marco al acabar", u:"" });
var _metaValorBase=metaValor;
metaValor=function(m, mk){ if(m.tipo==="hecha") return m.v?1:0; return _metaValorBase(m, mk); };
function sheetMeta(id){
  var mk=mesDe(today()), m=null; metasMes(mk).forEach(function(x){ if(x.id===id) m=x; });
  metaEditando = m ? m.id : null;
  var tipo = m ? m.tipo : "hecha";
  openSheet('<div class="flex items-start justify-between mb-5"><h3 class="display text-[19px] font-bold">'+(m?"Editar meta":"Nueva meta")+'</h3>'+closeBtn()+'</div>'+
    '<input id="mt-t" class="field mb-3" maxlength="60" placeholder="Qué quieres conseguir" value="'+esc(m?m.t:"")+'">'+
    '<p class="eyebrow mb-2">Cómo se cuenta</p><div class="mt-tipos" id="mt-tipos">'+METAS_TIPOS.map(function(x){
      return '<button data-k="'+x.k+'" aria-pressed="'+(x.k===tipo?"true":"false")+'">'+x.n+'</button>'; }).join("")+'</div>'+
    '<div id="mt-obj-caja"'+(tipo==="hecha"?' hidden':'')+'><p class="eyebrow mb-2 mt-4">Objetivo</p><input id="mt-obj" type="number" inputmode="numeric" min="1" max="999" class="field" value="'+(m&&m.tipo!=="hecha"?m.obj:10)+'"></div>'+
    '<div style="height:20px"></div>'+
    '<button class="btn btn-primary w-full !py-3.5" data-act="x-meta-guardar">Guardar</button>'+
    (m?'<button class="btn btn-danger w-full mt-2" data-act="x-meta-borrar">Borrar meta</button>':''));
  var tp=document.getElementById("mt-tipos"); tp.dataset.v=tipo;
  tp.addEventListener("click", function(ev){ var b=ev.target.closest("button"); if(!b) return;
    tp.querySelectorAll("button").forEach(function(x){ x.setAttribute("aria-pressed", x===b?"true":"false"); }); tp.dataset.v=b.dataset.k;
    document.getElementById("mt-obj-caja").hidden=(b.dataset.k==="hecha"); });
  setTimeout(function(){ var i=document.getElementById("mt-t"); if(i && !m) i.focus(); }, 150);
}
function metaGuardar(){
  var t=(document.getElementById("mt-t").value||"").trim(), tipo=document.getElementById("mt-tipos").dataset.v||"hecha";
  var obj = tipo==="hecha" ? 1 : parseInt(document.getElementById("mt-obj").value,10);
  if(!t){ document.getElementById("mt-t").focus(); return; }
  if(!(obj>0)) obj=1;
  var mk=mesDe(today()); if(!S.metas) S.metas={}; if(!S.metas[mk]) S.metas[mk]=[];
  var ms=S.metas[mk], m=null; ms.forEach(function(x){ if(x.id===metaEditando) m=x; });
  if(m){ if(m.tipo!==tipo) m.v=0; m.t=t; m.obj=Math.min(999,obj); m.tipo=tipo; }
  else if(ms.length<3) ms.push({ id:uid(), t:t, obj:Math.min(999,obj), tipo:tipo, v:0 });
  save(); closeSheet(); render();
}

function evolucionAccion(a, el){
  if(a==="x-meta-hecha"){
    var mk=mesDe(today()); metasMes(mk).forEach(function(m){ if(m.id===el.dataset.id){ m.v=m.v?0:1; sonido(m.v?"pop":"des"); } });
    save(); render(); return true;
  }
  if(a.indexOf("x-rs-")===0) return rsAccion(a, el);
  return false;
}
function evolucionTrasRender(){
  if(view==="resumen") pintaCuenta();
  if(view==="retos") bonusSuave();
}

var EVOLUCION_CSS=[
/* tarjeta de estudio: bloques */
'.hy-centro{ flex:1; width:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; padding:14px 0 6px; min-height:0; }',
'.hy-bloques{ display:grid; grid-template-columns:repeat(4,1fr); gap:7px; width:100%; max-width:150px; }',
'.hy-bloques i{ aspect-ratio:1; border-radius:10px; background:color-mix(in srgb,var(--accent) 10%,transparent); box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--accent) 22%,transparent); position:relative; overflow:hidden; }',
'.hy-bloques i.on{ background:var(--accent); box-shadow:0 6px 14px -8px var(--accent); }',
'.hy-bloques i.medio::after{ content:""; position:absolute; left:0; right:0; bottom:0; height:var(--p); background:color-mix(in srgb,var(--accent) 55%,transparent); }',
'.hy-bloques-t{ font-size:12px; font-weight:700; opacity:.72; text-align:center; }',
/* tarjeta del parte: racha grande y la semana en cuadrados */
'.hy-grande{ font-size:44px; font-weight:800; letter-spacing:-.05em; line-height:1; color:var(--violet); }',
'.hy-parte.hecho .hy-grande{ color:var(--t1); }',
'.hy-grande-t{ font-size:12px; font-weight:700; opacity:.7; margin-top:-4px; }',
'.hy-semana{ display:grid; grid-template-columns:repeat(7,1fr); gap:4px; width:100%; }',
'.hy-semana i{ aspect-ratio:1; border-radius:6px; background:color-mix(in srgb,var(--violet) 14%,transparent); }',
'.hy-semana i.on{ background:var(--violet); opacity:var(--o,1); }',
'.hy-semana i.hoy{ box-shadow:0 0 0 1.5px var(--violet); }',
'.hy-semana i.fut{ background:transparent; box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--violet) 22%,transparent); }',
'.hy-parte .hy-letras{ margin-top:5px; }',
'#hoy{ min-height:0!important; }',
'#hoy .hy-dos{ flex:0 0 auto!important; }',
'#hoy .hy-dos > div > .hy-tarjeta{ min-height:0!important; }',
'.hy-estudio .hy-pie{ margin-top:auto; }',
'.hy-parte .hy-semana{ margin-top:auto; padding-top:16px; }',
/* cuenta atrás */
'#hy-cuenta{ display:inline-flex; align-items:center; gap:7px; margin-top:10px; padding:6px 12px 6px 8px; border-radius:99px; font-size:13px; color:var(--t2);',
'  background:color-mix(in srgb,var(--gold) 12%,transparent); box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--gold) 24%,transparent); transition:transform .3s var(--spring); }',
'#hy-cuenta:active{ transform:scale(.96); }',
'#hy-cuenta b{ color:var(--t1); font-weight:700; }',
'.hc-ico{ width:22px; height:22px; border-radius:99px; display:grid; place-items:center; color:var(--gold); background:color-mix(in srgb,var(--gold) 18%,transparent); }',
'.hc-ico svg{ width:13px; height:13px; }',
/* retos de la semana */
'.rs-dcha{ display:flex; align-items:center; gap:10px; }',
'.rs-editar{ font-size:13.5px; font-weight:700; color:var(--accent); padding:4px 0 4px 4px; }',
'.rs-barra i{ transition:width .7s cubic-bezier(.3,.9,.3,1); }',
'.rs-cuenta{ display:flex; gap:6px; }',
'.rs-cuenta button{ height:32px; min-width:40px; padding:0 12px; border-radius:99px; font-size:14px; font-weight:800; background:var(--fill); color:var(--t2); transition:transform .25s var(--spring); }',
'.rs-cuenta button:last-child{ background:var(--accent); color:var(--on-accent); }',
'.rs-cuenta button:active{ transform:scale(.9); }',
'.rso-lista{ display:flex; flex-direction:column; }',
'.rso{ display:flex; align-items:center; gap:12px; padding:11px 0; }',
'.rso + .rso{ box-shadow:inset 0 1px 0 var(--hairline); }',
'.rso.off .rso-txt span{ color:var(--t3); }',
'.rso-sw{ width:40px; height:24px; flex:0 0 auto; border-radius:99px; background:var(--fill-hi); position:relative; transition:background .25s var(--ease); }',
'.rso-sw i{ position:absolute; top:3px; left:3px; width:18px; height:18px; border-radius:99px; background:#fff; box-shadow:0 1px 3px rgba(0,0,0,.25); transition:transform .3s var(--spring); }',
'.rso-sw.on{ background:var(--good); }',
'.rso-sw.on i{ transform:translateX(16px); }',
'.rso-borra{ width:40px; height:24px; flex:0 0 auto; display:grid; place-items:center; color:var(--t3); }',
'.rso-txt{ flex:1; min-width:0; display:flex; flex-direction:column; align-items:flex-start; gap:2px; }',
'.rso-txt span{ font-size:14px; font-weight:600; line-height:1.3; }',
'.rso-usar{ font-size:12px; font-weight:700; color:var(--accent); }',
'.rso-esta{ font-size:11px; font-weight:800; color:var(--good); letter-spacing:.04em; }',
'.rso-num{ display:flex; align-items:center; gap:4px; flex:0 0 auto; }',
'.rso-num button{ width:30px; height:30px; border-radius:99px; background:var(--fill); font-size:16px; font-weight:700; color:var(--t2); }',
'.rso-num b{ min-width:34px; text-align:center; font-size:14px; }',
'.rso-nuevo{ display:flex; gap:8px; }',
'.rso-nuevo > input{ flex:1; min-width:0; }',
'.rso-nuevo label{ display:flex; align-items:center; gap:6px; flex:0 0 auto; font-size:12.5px; color:var(--t3); }',
'.rso-nuevo label input{ width:64px; text-align:center; }',
/* metas: el hueco en blanco */
'.mt-blanco{ display:flex; flex-direction:column; align-items:stretch; gap:8px; width:100%; margin-top:12px; padding:14px 16px; border-radius:18px; text-align:left;',
'  box-shadow:inset 0 0 0 1.5px var(--hairline); background:repeating-linear-gradient(135deg, transparent 0 10px, var(--fill) 10px 11px); transition:transform .3s var(--spring); }',
'.mt-blanco:active{ transform:scale(.98); }',
'.mt-blanco-t{ font-size:15px; font-weight:700; color:var(--t3); }',
'.mt-blanco-t::after{ content:"|"; margin-left:2px; color:var(--accent); animation:mtCursor 1.1s steps(1) infinite; }',
'@keyframes mtCursor{ 50%{ opacity:0; } }',
'.mt-blanco-l{ height:6px; border-radius:99px; background:var(--fill-hi); }',
'.mt-blanco-p{ display:flex; justify-content:space-between; font-size:12px; color:var(--t3); }',
'.mt-blanco-p span:last-child{ color:var(--accent); font-weight:700; }',
/* tu evolución: la tarjeta */
'.ev-tarjeta{ width:100%; display:block; text-align:left; padding:18px 18px 16px; border-radius:24px; color:var(--t1);',
'  background:linear-gradient(160deg, color-mix(in srgb,var(--accent) 10%,var(--bg)), color-mix(in srgb,var(--good) 8%,var(--bg)));',
'  box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--accent) 16%,transparent); transition:transform .35s var(--spring); }',
'.ev-tarjeta:active{ transform:scale(.98); }',
'.ev-cab{ display:flex; align-items:flex-start; justify-content:space-between; }',
'.ev-titulo{ font-size:22px; font-weight:800; letter-spacing:-.035em; margin-top:2px; }',
'.ev-flecha{ width:20px; height:20px; color:var(--t3); margin-top:4px; }',
'.ev-mapa{ display:flex; gap:3px; margin-top:14px; }',
'.ev-col{ flex:1; display:flex; flex-direction:column; gap:3px; }',
'.ev-mapa i{ display:block; aspect-ratio:1; border-radius:3px; background:var(--fill-hi); }',
'.ev-mapa i.n1, .ev-leyenda i.n1{ background:color-mix(in srgb,var(--accent) 30%,transparent); }',
'.ev-mapa i.n2, .ev-leyenda i.n2{ background:color-mix(in srgb,var(--accent) 62%,transparent); }',
'.ev-mapa i.n3, .ev-leyenda i.n3{ background:var(--accent); }',
'.ev-mapa i.nf{ background:transparent; }',
'html.neo .ev-mapa i:not(.n1):not(.n2):not(.n3):not(.nf), html.neo .ev-leyenda i.n0{ background:rgba(45,35,20,.13); }',
'html.neo .ev-tarjeta{ background:var(--glass-bg); box-shadow:0 0 0 1px var(--hairline-2), var(--shadow-1); }',
'.ev-mapa i.hoy{ box-shadow:0 0 0 1.5px var(--t1); }',
'.ev-cifras{ display:grid; grid-template-columns:repeat(3,1fr); margin-top:14px; }',
'.ev-cifras div{ display:flex; flex-direction:column; }',
'.ev-cifras div + div{ padding-left:12px; box-shadow:inset 1px 0 0 var(--hairline); }',
'.ev-cifras b{ font-family:"Plus Jakarta Sans",sans-serif; font-size:19px; font-weight:800; letter-spacing:-.03em; }',
'.ev-cifras span{ font-size:11.5px; color:var(--t3); }',
/* tu evolución: la pantalla */
'#hist-capa{ transform:none!important; clip-path:inset(var(--ev-top,40%) var(--ev-der,16px) var(--ev-bot,40%) var(--ev-izq,16px) round 24px);',
'  transition:clip-path .55s cubic-bezier(.32,.72,0,1)!important; }',
'#hist-capa.ve{ clip-path:inset(0 0 0 0 round 0px); }',
'#hist-capa.sale{ transition:clip-path .45s cubic-bezier(.4,0,.2,1)!important; }',
'#hist-capa .pf-scroll > *{ opacity:0; transform:translateY(16px); transition:opacity .45s var(--ease), transform .55s cubic-bezier(.2,.9,.3,1); }',
'#hist-capa.ve .pf-scroll > *{ opacity:1; transform:none; }',
'#hist-capa.ve .pf-scroll > *:nth-child(2){ transition-delay:.08s; } #hist-capa.ve .pf-scroll > *:nth-child(3){ transition-delay:.14s; }',
'#hist-capa.ve .pf-scroll > *:nth-child(4){ transition-delay:.2s; } #hist-capa.ve .pf-scroll > *:nth-child(5){ transition-delay:.26s; }',
'.ev-hero{ padding:6px 0 10px; }',
'.ev-hero h1{ font-size:38px; font-weight:800; letter-spacing:-.045em; line-height:1.05; margin-top:6px; }',
'.ev-hero h1 span{ color:var(--t3); }',
'.ev-sub{ font-size:14px; color:var(--t2); margin-top:6px; }',
'.ev-mapa.grande{ gap:4px; margin-top:20px; }',
'.ev-mapa.grande .ev-col{ gap:4px; }',
'.ev-mapa.grande i{ border-radius:4px; }',
'.ev-leyenda{ display:flex; align-items:center; justify-content:flex-end; gap:4px; margin-top:8px; font-size:11px; color:var(--t3); }',
'.ev-leyenda i{ width:10px; height:10px; border-radius:3px; background:var(--fill-hi); display:block; }',
'.ev-cifras.grande{ margin-top:22px; padding:16px 0; box-shadow:inset 0 1px 0 var(--hairline), inset 0 -1px 0 var(--hairline); }',
'.ev-cifras.grande b{ font-size:24px; }',
'#hist-capa .hist-pieza{ margin-top:34px!important; }',
/* perfil: se abre desde la foto que tocas */
'#perfil-capa{ transform:none!important; clip-path:circle(0px at var(--pf-x,50%) var(--pf-y,30%)); transition:clip-path .55s cubic-bezier(.32,.72,0,1)!important; }',
'#perfil-capa.ve{ clip-path:circle(150vmax at var(--pf-x,50%) var(--pf-y,30%)); }',
'#perfil-capa:not(.ve){ transition:clip-path .38s cubic-bezier(.5,0,.75,0)!important; }',
'#perfil-capa .pf-scroll, #perfil-capa .pf-barra{ transition:opacity .35s var(--ease), transform .5s cubic-bezier(.2,.9,.3,1); }',
'#perfil-capa:not(.ve) .pf-scroll{ opacity:0; transform:scale(.96) translateY(10px); }',
'#perfil-capa:not(.ve) .pf-barra{ opacity:0; }',
'#perfil-capa.ve .pf-scroll{ transition-delay:.06s; }',
/* metas: la casilla de las personalizadas */
'.mt-check{ width:30px; height:30px; flex:0 0 auto; border-radius:99px; display:grid; place-items:center; color:transparent; box-shadow:inset 0 0 0 2px var(--hairline); transition:all .35s var(--spring); }',
'.mt-check svg{ width:14px; height:14px; }',
'.mt-check.on{ background:var(--good); color:#fff; box-shadow:none; }',
'.mt-check:active{ transform:scale(.88); }',
/* ×1,5 */
'.bonus-x.bx-crece > span{ animation:bxTxt .45s var(--ease) .12s both; }',
/* el tema: el selector se abre con muelle y las muestras entran en cascada */
'#tema-pop{ transform:scale(.6) translateY(-8px)!important; opacity:0; transition:opacity .22s var(--ease), transform .42s cubic-bezier(.3,1.35,.45,1)!important; }',
'#tema-pop.ve{ transform:none!important; opacity:1; }',
'#tema-pop:not(.ve){ transform:scale(.92,.06)!important; opacity:0; transition:transform .34s cubic-bezier(.55,0,.3,1), opacity .18s ease .17s!important; }',
'#tema-pop:not(.ve) .tp-op{ transition:opacity .14s var(--ease), transform .2s var(--ease); transition-delay:0s!important; }',
'#tema-pop .tp-op{ opacity:0; transform:translateY(8px) scale(.9); transition:opacity .3s var(--ease), transform .4s cubic-bezier(.3,1.35,.45,1), background .2s var(--ease); }',
'#tema-pop.ve .tp-op{ opacity:1; transform:none; }',
'#tema-pop.ve .tp-op:nth-child(1){ transition-delay:.04s; } #tema-pop.ve .tp-op:nth-child(2){ transition-delay:.07s; } #tema-pop.ve .tp-op:nth-child(3){ transition-delay:.1s; }',
'#tema-pop.ve .tp-op:nth-child(4){ transition-delay:.13s; } #tema-pop.ve .tp-op:nth-child(5){ transition-delay:.16s; } #tema-pop.ve .tp-op:nth-child(6){ transition-delay:.19s; } #tema-pop.ve .tp-op:nth-child(7){ transition-delay:.22s; }',
'#tema-pop .tp-op.on .tp-m{ animation:tpElige .45s cubic-bezier(.3,1.5,.5,1); }',
'@keyframes tpElige{ 40%{ transform:scale(.86); } 100%{ transform:none; } }',
'::view-transition-old(root), ::view-transition-new(root){ animation:none; mix-blend-mode:normal; }',
'html.tema-suave body, html.tema-suave .glass, html.tema-suave .hy-tarjeta, html.tema-suave .barpill{ transition:background-color .5s var(--ease), color .5s var(--ease), box-shadow .5s var(--ease)!important; }',
/* el parte: las hojas (valores de agua, sueño, pantalla) salen por encima del parte */
'body:has(#parte:not([hidden])) #sheet{ z-index:60!important; }'
].join("\n");

