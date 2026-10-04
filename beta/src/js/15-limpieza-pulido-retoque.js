/* ════════════════════════════════════════════════════════════════
   LIMPIEZA: historial en una sola pantalla, comidas a toques, racha por
   paso de la checklist, ánimo en el parte y metas del mes.
   ════════════════════════════════════════════════════════════════ */

/* ── historial: las cuatro gráficas juntas ── */
var HIST_PIEZAS=[
  { id:"tus-semanas", t:null },
  { sel:"#ch-heat", t:"Últimas 4 semanas" },
  { sel:"#streaks", t:"Constancia · 4 semanas" },
  { sel:"#anio-grid", t:"El año entero" }
];
var histSitios=[];
function histMarca(){
  HIST_PIEZAS.forEach(function(p){
    var el = p.id ? document.getElementById(p.id) : (document.querySelector(p.sel)||{}).closest && document.querySelector(p.sel).closest(".glass");
    if(el) el.classList.add("hist-pieza");
  });
  var ck=document.getElementById("retos-checklist"); if(ck){ var g=ck.closest(".glass"); if(g) g.classList.add("oculto-retos"); }
}
function pintaBotonHistorial(){
  var izq=document.getElementById("retos-left"); if(!izq || document.getElementById("hist-boton")) return;
  var b=document.createElement("button"); b.id="hist-boton"; b.className="hist-boton"; b.setAttribute("data-act","x-historial");
  b.innerHTML='<span class="hist-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg></span>'+
    '<span class="hist-txt"><b>Historial</b><small>Tus semanas, constancia y el año entero</small></span>'+
    '<svg class="hist-flecha" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';
  izq.appendChild(b);
}
function abrirHistorial(){
  histMarca();
  var capa=document.getElementById("hist-capa");
  if(!capa){ capa=document.createElement("div"); capa.id="hist-capa"; document.body.appendChild(capa); }
  capa.innerHTML='<div class="pf-barra"><button class="pf-atras" data-act="x-historial-cerrar" aria-label="Volver">'+
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button><span>Historial</span></div>'+
    '<div class="pf-scroll" id="hist-scroll"></div>';
  var sc=document.getElementById("hist-scroll");
  try{ rVital(); }catch(e){}
  histSitios=[];
  HIST_PIEZAS.forEach(function(p){
    var el = p.id ? document.getElementById(p.id) : (document.querySelector(p.sel) ? document.querySelector(p.sel).closest(".glass") : null);
    if(!el) return;
    histSitios.push({ el:el, padre:el.parentNode, sig:el.nextSibling });
    sc.appendChild(el);
  });
  sc.insertAdjacentHTML("beforeend",'<div style="height:40px"></div>');
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ capa.classList.add("ve"); }); });
}
function cerrarHistorial(){
  var capa=document.getElementById("hist-capa"); if(!capa) return;
  capa.classList.remove("ve");
  setTimeout(function(){
    histSitios.forEach(function(s){ if(s.padre) s.padre.insertBefore(s.el, s.sig && s.sig.parentNode===s.padre ? s.sig : null); });
    histSitios=[];
    if(capa.parentNode && !capa.classList.contains("ve")) capa.parentNode.removeChild(capa);
  }, 420);
}
function historialAbierto(){ var c=document.getElementById("hist-capa"); return !!(c && c.classList.contains("ve")); }

/* ── comidas: tres toques, sin escribir ── */
function pintaComidas(){
  var box=document.getElementById("meals-list"); if(!box) return;
  var t=curDay(), mm=mealsOf(t);
  function boton(i){
    var k=MEAL_KEYS[i], on=!!(mm[k]||"").trim(), main=MEAL_MAIN.indexOf(i)>=0;
    return '<button class="cmd'+(on?" on":"")+(main?"":" extra")+'" data-act="x-comida" data-k="'+k+'" data-day="'+t+'">'+
      '<i>'+ICON_CHECK+'</i><span>'+esc(S.mealNames[i]||"")+'</span></button>';
  }
  box.innerHTML='<div class="cmd-fila">'+MEAL_MAIN.map(boton).join("")+'</div>'+
    '<div class="cmd-fila extras">'+[1,3].map(boton).join("")+'</div>';
  var sub=box.parentNode && box.parentNode.querySelector("p.t3"); if(sub) sub.textContent="Toca lo que ya has comido";
}

/* ── racha de cada paso de la checklist ── */
function rachaPaso(id){
  var d=today(), n=0;
  if(checksOf(d).indexOf(id)<0) d=addDays(d,-1);
  while(n<400 && checksOf(d).indexOf(id)>=0){ n++; d=addDays(d,-1); }
  return n;
}
function pintaRachasPasos(){
  var lista=document.getElementById("ideal-list"); if(!lista) return;
  lista.querySelectorAll("button.tick[data-act='check']").forEach(function(b){
    var fila=b.parentNode; if(!fila || fila.querySelector(".ck-racha")) return;
    var n=rachaPaso(b.dataset.id); if(n<2) return;
    var txt=fila.querySelector("button:not(.tick)");
    var s=document.createElement("span"); s.className="ck-racha num"; s.innerHTML=ICON_LLAMA+n;
    s.title=n+" días seguidos";
    if(txt && txt.nextSibling) fila.insertBefore(s, txt.nextSibling); else fila.appendChild(s);
  });
}

/* ── metas del mes ── */
var METAS_TIPOS=[
  { k:"manual",  n:"La cuento yo",        u:"" },
  { k:"gym",     n:"Días de ejercicio",    u:"días" },
  { k:"estudio", n:"Horas de estudio",    u:"h" },
  { k:"parte",   n:"Noches con Parte del día", u:"noches" },
  { k:"retos",   n:"Retos hechos",        u:"retos" }
];
var META_XP=100;
function mesDe(d){ return d.slice(0,7); }
function diasMes(mk){
  var a=[], d=mk+"-01", hoy=today();
  while(d.slice(0,7)===mk && d<=hoy){ a.push(d); d=addDays(d,1); }
  return a;
}
function metaValor(m, mk){
  var ds=diasMes(mk);
  if(m.tipo==="gym") return ds.filter(wentGym).length;
  if(m.tipo==="estudio") return Math.floor(ds.reduce(function(s,d){ return s+estudioMinDia(d); },0)/60);
  if(m.tipo==="parte") return ds.filter(function(d){ return !!(S.parte&&S.parte[d]); }).length;
  if(m.tipo==="retos") return ds.reduce(function(s,d){ return s+chOf(d).length; },0);
  return m.v||0;
}
function metasMes(mk){ if(!S.metas) S.metas={}; return S.metas[mk]||[]; }
function metasXP(){
  var x=0; if(!S.metas) return 0;
  Object.keys(S.metas).forEach(function(mk){ (S.metas[mk]||[]).forEach(function(m){ if(metaValor(m,mk)>=m.obj) x+=META_XP; }); });
  return x;
}
function pintaMetas(){
  var izq=document.getElementById("retos-left"); if(!izq) return;
  var box=document.getElementById("metas-mes");
  if(!box){ box=document.createElement("div"); box.id="metas-mes"; box.className="glass rounded-[24px] pad";
    var rs=document.getElementById("reto-semana"); if(rs && rs.nextSibling) izq.insertBefore(box, rs.nextSibling); else izq.appendChild(box); }
  var mk=mesDe(today()), ms=metasMes(mk);
  var nombreMes=cap(new Date(mk+"-15T12:00:00").toLocaleDateString(LOCALE,{month:"long"}));
  var h='<div class="mt-cab"><div><h2 class="display text-[17px] font-bold">Objetivos de '+esc(nombreMes.toLowerCase())+'</h2>'+
    '<p class="text-[12.5px] t3 mt-0.5">Hasta tres objetivos grandes para este mes · +'+META_XP+' XP cada una</p></div>'+
    (ms.length<3?'<button class="btn btn-quiet !px-3.5 !py-2 !text-[12px]" data-act="x-meta-nueva">Añadir</button>':'')+'</div>';
  if(!ms.length) h+='<p class="mt-vacio">Por ejemplo: leer 2 libros, hacer ejercicio 16 días o hacer el Parte del día 25 noches.</p>';
  ms.forEach(function(m){
    var v=metaValor(m,mk), p=Math.min(1, v/Math.max(1,m.obj)), ok=v>=m.obj, tipo=METAS_TIPOS.filter(function(x){ return x.k===m.tipo; })[0]||METAS_TIPOS[0];
    h+='<div class="mt-fila'+(ok?" ok":"")+'">'+
      '<div class="mt-arriba"><button class="mt-t" data-act="x-meta-editar" data-id="'+m.id+'">'+esc(m.t)+'</button>'+
      (m.tipo==="manual"&&!ok?'<span class="mt-mas"><button data-act="x-meta-d" data-id="'+m.id+'" data-d="-1" aria-label="Quitar uno">−</button><button data-act="x-meta-d" data-id="'+m.id+'" data-d="1" aria-label="Sumar uno">+</button></span>':'')+'</div>'+
      '<div class="mt-barra"><i style="width:'+Math.round(p*100)+'%"></i></div>'+
      '<div class="mt-pie"><span class="num">'+v+' de '+m.obj+(tipo.u?" "+tipo.u:"")+'</span><span>'+(ok?'<b>Conseguida</b>':(m.tipo==="manual"?"la cuentas tú":"se cuenta sola"))+'</span></div>'+
    '</div>';
  });
  box.innerHTML=h;
}
function vigilaMetas(){
  var mk=mesDe(today()); if(!S.metasOK) S.metasOK={};
  metasMes(mk).forEach(function(m){
    if(metaValor(m,mk)>=m.obj && !S.metasOK[m.id]){
      S.metasOK[m.id]=1; save();
      setTimeout(function(){ sonido("semana"); avisoNube("Meta conseguida: "+m.t+" · +"+META_XP+" XP"); xpVuela(0,0,META_XP); }, 500);
    }
  });
}
var metaEditando=null;
function sheetMeta(id){
  var mk=mesDe(today()), m=null; metasMes(mk).forEach(function(x){ if(x.id===id) m=x; });
  metaEditando = m ? m.id : null;
  var tipo = m ? m.tipo : "manual";
  openSheet('<div class="flex items-start justify-between mb-5"><h3 class="display text-[19px] font-bold">'+(m?"Editar meta":"Nueva meta")+'</h3>'+closeBtn()+'</div>'+
    '<input id="mt-t" class="field mb-3" maxlength="60" placeholder="Qué quieres conseguir" value="'+esc(m?m.t:"")+'">'+
    '<p class="eyebrow mb-2">Cómo se cuenta</p><div class="mt-tipos" id="mt-tipos">'+METAS_TIPOS.map(function(x){
      return '<button data-k="'+x.k+'" aria-pressed="'+(x.k===tipo?"true":"false")+'">'+x.n+'</button>'; }).join("")+'</div>'+
    '<p class="eyebrow mb-2 mt-4">Objetivo</p><input id="mt-obj" type="number" inputmode="numeric" min="1" max="999" class="field mb-5" value="'+(m?m.obj:10)+'">'+
    '<button class="btn btn-primary w-full !py-3.5" data-act="x-meta-guardar">Guardar</button>'+
    (m?'<button class="btn btn-danger w-full mt-2" data-act="x-meta-borrar">Borrar meta</button>':''));
  var tp=document.getElementById("mt-tipos"); tp.dataset.v=tipo;
  tp.addEventListener("click", function(ev){ var b=ev.target.closest("button"); if(!b) return;
    tp.querySelectorAll("button").forEach(function(x){ x.setAttribute("aria-pressed", x===b?"true":"false"); }); tp.dataset.v=b.dataset.k; });
  setTimeout(function(){ var i=document.getElementById("mt-t"); if(i && !m) i.focus(); }, 150);
}
function metaGuardar(){
  var t=(document.getElementById("mt-t").value||"").trim(), obj=parseInt(document.getElementById("mt-obj").value,10), tipo=document.getElementById("mt-tipos").dataset.v||"manual";
  if(!t){ document.getElementById("mt-t").focus(); return; }
  if(!(obj>0)) obj=1;
  var mk=mesDe(today()); if(!S.metas) S.metas={}; if(!S.metas[mk]) S.metas[mk]=[];
  var ms=S.metas[mk], m=null; ms.forEach(function(x){ if(x.id===metaEditando) m=x; });
  if(m){ m.t=t; m.obj=Math.min(999,obj); m.tipo=tipo; }
  else if(ms.length<3) ms.push({ id:uid(), t:t, obj:Math.min(999,obj), tipo:tipo, v:0 });
  save(); closeSheet(); render();
}

/* ── ánimo del día (en el parte) ── */
var ajAvanzado=false;
document.addEventListener("toggle", function(e){ if(e.target && e.target.classList && e.target.classList.contains("aj-avanzado")) ajAvanzado=e.target.open; }, true);
var ANIMOS=["😫","😕","😐","🙂","😄"];
function animoDe(d){ return (S.animo && S.animo[d]) || null; }

function limpiezaAccion(a, el){
  if(a==="x-historial"){ abrirHistorial(); return true; }
  if(a==="x-historial-cerrar"){ cerrarHistorial(); return true; }
  if(a==="x-comida"){
    var d=el.dataset.day||today(), k=el.dataset.k; if(!S.meals[d]) S.meals[d]={};
    var antes=mealCount(d), on=!!(S.meals[d][k]||"").trim();
    S.meals[d][k] = on ? "" : "✓"; save();
    try{ rVital(); }catch(e){} pintaComidas();
    if(!on){ var b=document.querySelector('.cmd[data-k="'+k+'"]'); if(b) b.classList.add("pop"); sonido(antes<3 && mealCount(d)>=3 ? "salud" : "tick"); }
    else sonido("des");
    extrasTrasRender(stats());
    return true;
  }
  if(a==="x-meta-nueva"){ sheetMeta(null); return true; }
  if(a==="x-meta-editar"){ sheetMeta(el.dataset.id); return true; }
  if(a==="x-meta-guardar"){ metaGuardar(); return true; }
  if(a==="x-meta-borrar"){ var mk=mesDe(today()); S.metas[mk]=metasMes(mk).filter(function(x){ return x.id!==metaEditando; }); save(); closeSheet(); render(); return true; }
  if(a==="x-meta-d"){
    var mk2=mesDe(today()); metasMes(mk2).forEach(function(x){ if(x.id===el.dataset.id) x.v=Math.max(0,(x.v||0)+Number(el.dataset.d)); });
    save(); sonido(Number(el.dataset.d)>0?"tick":"des"); render(); return true;
  }
  if(a==="x-animo"){
    var dd=today(); if(!S.animo) S.animo={}; S.animo[dd]=S.animo[dd]||{}; S.animo[dd].v=+el.dataset.v; save(); sonido("pop"); renderParte(); return true;
  }
  return false;
}
function limpiezaTrasRender(st){
  histMarca();
  if(view==="retos"){ pintaMetas(); pintaBotonHistorial(); }
  if(view==="vital") pintaComidas();
  if(view==="resumen") pintaRachasPasos();
  if(historialAbierto()){ try{ rVital(); }catch(e){} }
  vigilaMetas();
}

var LIMPIEZA_CSS=[
'.view .hist-pieza, .view .oculto-retos{ display:none!important; }',
'#hist-capa{ position:fixed; inset:0; z-index:64; background:var(--bg); display:flex; flex-direction:column; transform:translateX(100%); transition:transform .42s cubic-bezier(.32,.72,0,1); }',
'#hist-capa.ve{ transform:none; }',
'#hist-capa .hist-pieza{ display:block!important; margin-top:18px; }',
'#hist-capa .hist-pieza:first-child{ margin-top:6px; }',
'.hist-boton{ width:100%; display:flex; align-items:center; gap:14px; padding:14px 16px; border-radius:20px; text-align:left; background:var(--fill); transition:transform .3s var(--spring); }',
'.hist-boton:active{ transform:scale(.98); }',
'.hist-ico{ width:40px; height:40px; flex:0 0 auto; border-radius:12px; display:grid; place-items:center; color:var(--accent); background:var(--accent-soft); }',
'.hist-ico svg{ width:20px; height:20px; }',
'.hist-txt{ flex:1; min-width:0; display:flex; flex-direction:column; }',
'.hist-txt b{ font-size:15.5px; font-weight:700; }',
'.hist-txt small{ font-size:12.5px; color:var(--t3); margin-top:1px; }',
'.hist-flecha{ width:18px; height:18px; color:var(--t3); flex:0 0 auto; }',
/* comidas */
'.cmd-fila{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }',
'.cmd-fila.extras{ grid-template-columns:repeat(2,1fr); margin-top:8px; }',
'.cmd{ display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; height:88px; border-radius:18px; background:var(--fill);',
'  box-shadow:inset 0 0 0 1px var(--hairline-2); font-size:13.5px; font-weight:600; color:var(--t2); transition:all .35s var(--spring); }',
'.cmd.extra{ flex-direction:row; height:46px; font-size:13px; }',
'.cmd i{ width:26px; height:26px; border-radius:99px; display:grid; place-items:center; box-shadow:inset 0 0 0 1.5px var(--hairline); color:transparent; transition:all .35s var(--spring); }',
'.cmd.extra i{ width:20px; height:20px; }',
'.cmd i svg{ width:13px; height:13px; }',
'.cmd.extra i svg{ width:10px; height:10px; }',
'.cmd.on{ color:var(--t1); background:color-mix(in srgb,var(--good) 12%,var(--bg)); box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--good) 45%,transparent); }',
'.cmd.on i{ background:var(--good); color:#fff; box-shadow:none; }',
'.cmd.pop i{ animation:cmdPop .5s cubic-bezier(.3,1.7,.5,1); }',
'@keyframes cmdPop{ 0%{ transform:scale(.6); } 55%{ transform:scale(1.25); } 100%{ transform:none; } }',
'.cmd:active{ transform:scale(.96); }',
/* racha de cada paso */
'.ck-racha{ display:inline-flex; align-items:center; gap:2px; flex:0 0 auto; font-size:11.5px; font-weight:800; color:var(--warn); margin-right:4px; }',
'.ck-racha svg{ width:11px; height:11px; }',
/* metas */
'.mt-cab{ display:flex; align-items:flex-start; justify-content:space-between; gap:10px; margin-bottom:10px; }',
'.mt-vacio{ font-size:13.5px; color:var(--t3); line-height:1.45; padding:6px 0 2px; }',
'.mt-fila{ padding:12px 0; box-shadow:inset 0 1px 0 var(--hairline); }',
'.mt-arriba{ display:flex; align-items:center; gap:10px; }',
'.mt-t{ flex:1; min-width:0; text-align:left; font-size:15px; font-weight:600; }',
'.mt-mas{ display:flex; gap:6px; }',
'.mt-mas button{ width:32px; height:32px; border-radius:99px; font-size:17px; background:var(--fill); color:var(--t2); }',
'.mt-barra{ height:7px; border-radius:99px; background:var(--fill-hi); overflow:hidden; margin-top:10px; }',
'.mt-barra i{ display:block; height:100%; border-radius:99px; background:var(--accent); transition:width .7s var(--ease); }',
'.mt-fila.ok .mt-barra i{ background:var(--good); }',
'.mt-pie{ display:flex; justify-content:space-between; margin-top:7px; font-size:12.5px; color:var(--t3); }',
'.mt-pie b{ color:var(--good); }',
'.mt-tipos{ display:flex; flex-wrap:wrap; gap:6px; }',
'.mt-tipos button{ padding:8px 12px; border-radius:99px; font-size:13px; font-weight:600; background:var(--fill); color:var(--t2); }',
'.mt-tipos button[aria-pressed="true"]{ background:var(--accent); color:var(--on-accent); }',
/* ánimo en el parte */
'.pt-animo{ display:grid; grid-template-columns:repeat(5,1fr); gap:8px; }',
'.pt-animo button{ height:58px; border-radius:18px; font-size:28px; background:var(--fill); filter:grayscale(.6); opacity:.7; transition:all .3s var(--spring); }',
'.pt-animo button.on{ filter:none; opacity:1; background:color-mix(in srgb,var(--pc) 14%,var(--bg)); box-shadow:inset 0 0 0 2px var(--pc); transform:scale(1.06); }',
'.pt-nota{ margin-top:10px; }',
'.sm-animo{ display:grid; grid-template-columns:repeat(7,1fr); gap:6px; margin-top:14px; text-align:center; }',
'.sm-animo span{ font-size:22px; }',
'.sm-animo span.vacio{ font-size:14px; color:var(--t3); line-height:30px; }',
'details.aj-avanzado{ border-radius:16px; background:var(--fill); padding:0 14px; }',
'details.aj-avanzado > summary{ list-style:none; cursor:pointer; display:flex; align-items:center; justify-content:space-between; min-height:50px; font-size:14.5px; font-weight:600; }',
'details.aj-avanzado > summary::-webkit-details-marker{ display:none; }',
'details.aj-avanzado > summary::after{ content:"›"; font-size:20px; color:var(--t3); transition:transform .3s var(--ease); }',
'details.aj-avanzado[open] > summary::after{ transform:rotate(90deg); }',
'details.aj-avanzado > div{ padding:4px 0 14px; }'
].join("\n");

/* ════════════════════════════════════════════════════════════════
   PULIDO: avisos más bonitos, reacciones de una en una, ranking plegado
   en Social, el +4 que entra suave y el botón del reto en común.
   ════════════════════════════════════════════════════════════════ */

/* ── avisos: una tarjeta que sube, con icono ── */
var AV_ICO={
  logro:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.8l2.6 5.5 6 .7-4.5 4.1 1.2 5.9L12 16.1 6.7 19l1.2-5.9L3.4 9l6-.7z"/></svg>',
  ok:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.2 4.2L19 7"/></svg>',
  info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
  llama:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.4c3.8 4.2 6 7.2 6 10.6a6 6 0 0 1-12 0c0-2.1.9-3.8 2.3-5.3-.1 1.5.4 2.5 1.2 3C9.8 7.5 10.6 5 12 2.4z"/></svg>'
};
function avisoTipo(txt){
  var t=(txt||"").toLowerCase();
  if(/nivel|meta conseguida|reto de la semana|desbloque|conseguido/.test(t)) return "logro";
  if(/racha|comod/.test(t)) return "llama";
  if(/no se ha podido|no he podido|sin conexión|pesa demasiado|no es una imagen|modo prueba|se desbloquea/.test(t)) return "info";
  return "ok";
}
function avisoNube(txt){
  var viejo=document.getElementById("aviso-nube");
  if(viejo){ viejo.id=""; viejo.classList.remove("ve"); viejo.classList.add("fuera"); setTimeout(function(){ if(viejo.parentNode) viejo.parentNode.removeChild(viejo); }, 380); }
  var d=document.createElement("div"); d.id="aviso-nube"; d.className="av av-"+avisoTipo(txt);
  d.innerHTML='<span class="av-ico">'+AV_ICO[avisoTipo(txt)]+'</span><span class="av-t"></span>';
  d.querySelector(".av-t").textContent=txt;
  document.body.appendChild(d);
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ d.classList.add("ve"); }); });
  clearTimeout(avisoNube._t);
  avisoNube._t=setTimeout(function(){
    d.classList.remove("ve"); d.classList.add("fuera");
    setTimeout(function(){ if(d.parentNode) d.parentNode.removeChild(d); }, 420);
  }, 3200);
}

/* ── reacciones: una por persona y emoji, se pone y se quita ── */
var reacAnim=null;
function reaccionar(id, e, boton){
  if(!GRUPO) return;
  var p=null; for(var i=0;i<GRUPO.muro.length;i++) if(GRUPO.muro[i].id===id) p=GRUPO.muro[i];
  if(!p) return;
  p.reac=p.reac||{}; p.mias=p.mias||{};
  var mia=!!p.mias[e];
  function aplica(){
    if(mia){ p.reac[e]=Math.max(0,(p.reac[e]||1)-1); if(!p.reac[e]) delete p.reac[e]; delete p.mias[e]; }
    else { p.reac[e]=(p.reac[e]||0)+1; p.mias[e]=1; }
    reacAbiertas[id]=0;
    reacAnim={ id:id, e:e, dir: mia?"resta":"suma" };
    rSocial();
  }
  if(mia && (p.reac[e]||0)<=1 && boton){
    boton.classList.add("rc-fuera"); sonido("des");
    setTimeout(aplica, 230);
  } else { sonido(mia?"des":"pop"); aplica(); }
}
function reacAnima(){
  if(!reacAnim) return;
  var a=reacAnim; reacAnim=null;
  var b=document.querySelector('.soc-reac button[data-id="'+a.id+'"][data-e="'+a.e+'"]'); if(!b) return;
  b.classList.add(a.dir==="suma"?"rc-suma":"rc-resta");
  setTimeout(function(){ b.classList.remove("rc-suma","rc-resta"); }, 600);
}

/* ── el ranking de la semana, plegado ── */
var rankAbierto=false;
function socRanking(){
  if(!GRUPO) return "";
  var lista=ordenados(), pos=0;
  lista.forEach(function(m,i){ if(m.usuario===GRUPO.yo) pos=i+1; });
  var caras=lista.slice(0,3).map(function(m){ return '<span>'+caraDe(m,26)+'</span>'; }).join("");
  var filas=lista.map(function(m,i){
    var yo=(m.usuario===GRUPO.yo);
    return '<div class="rk-fila'+(yo?" yo":"")+'" data-act="x-perfil" data-u="'+esc(m.usuario)+'">'+
      '<span class="rk-pos num">'+(i+1)+'</span>'+caraDe(m,34)+
      '<div class="rk-cuerpo"><p><b>'+esc(m.usuario)+'</b>'+(yo?'<span> · tú</span>':'')+'</p>'+
        '<div class="rk-barra"><i style="width:'+m.pct+'%"></i></div>'+
        '<small>'+m.racha+' de racha · '+m.gym+' de ejercicio</small></div>'+
      '<b class="rk-pct num">'+m.pct+'%</b></div>';
  }).join("");
  return '<div class="rk'+(rankAbierto?" abierto":"")+'">'+
    '<button class="rk-cab" data-act="x-ranking">'+
      '<span class="rk-caras">'+caras+'</span>'+
      '<span class="rk-t"><b>Clasificación de la semana</b><small>Vas '+pos+'º de '+lista.length+' · cada uno contra su propio plan</small></span>'+
      '<svg class="rk-flecha" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>'+
    '</button>'+
    '<div class="rk-lista"><div class="rk-dentro">'+filas+'</div></div>'+
  '</div>';
}
function rankingDespliega(){
  var rk=document.querySelector(".rk"); if(!rk) return;
  var lista=rk.querySelector(".rk-lista"), dentro=rk.querySelector(".rk-dentro");
  rankAbierto=!rankAbierto;
  var h=dentro.getBoundingClientRect().height;
  if(rankAbierto){
    lista.style.height="0px"; rk.classList.add("abierto"); void lista.offsetWidth;
    lista.style.height=h+"px";
    setTimeout(function(){ if(rankAbierto) lista.style.height="auto"; }, 520);
  } else {
    lista.style.height=h+"px"; void lista.offsetWidth;
    rk.classList.remove("abierto"); lista.style.height="0px";
  }
  sonido("tick");
}

/* ── el +4 de la checklist entra suave ── */
var recienMarcado=null;
function chipRecien(){
  if(!recienMarcado || Date.now()-recienMarcado.t>2000) return;
  var b=document.querySelector('[data-act="check"][data-id="'+recienMarcado.id+'"]');
  var fila=b && b.parentNode; if(!fila) return;
  var chip=fila.querySelector(".chip"); if(chip && !chip.classList.contains("chip-recien")) chip.classList.add("chip-recien");
  recienMarcado=null;
}

function pulidoAccion(a, el){
  if(a==="x-reac"){ reaccionar(el.dataset.id, el.dataset.e, el); return true; }
  if(a==="x-ranking"){ rankingDespliega(); return true; }
  return false;
}
function pulidoTrasRender(){
  if(view==="social") reacAnima();
  chipRecien();
}

var PULIDO_CSS=[
/* avisos */
'.av{ position:fixed; left:50%; bottom:calc(96px + env(safe-area-inset-bottom)); z-index:85; display:flex; align-items:center; gap:11px;',
'  width:max-content; max-width:calc(100vw - 32px); padding:11px 16px 11px 11px; border-radius:18px;',
'  background:color-mix(in srgb,var(--bg) 78%,transparent); backdrop-filter:blur(20px) saturate(160%); -webkit-backdrop-filter:blur(20px) saturate(160%);',
'  box-shadow:0 16px 40px -18px rgba(0,0,0,.45), inset 0 0 0 1px var(--hairline); color:var(--t1);',
'  opacity:0; transform:translate(-50%,18px) scale(.94); transition:opacity .38s var(--ease), transform .5s cubic-bezier(.2,1.25,.4,1); pointer-events:none; }',
'.av.ve{ opacity:1; transform:translate(-50%,0) scale(1); }',
'.av.fuera{ opacity:0; transform:translate(-50%,10px) scale(.97); transition:opacity .3s var(--ease), transform .35s var(--ease); }',
'.av-ico{ width:30px; height:30px; flex:0 0 auto; border-radius:10px; display:grid; place-items:center; color:#fff; background:var(--accent); }',
'.av-ico svg{ width:16px; height:16px; }',
'.av-logro .av-ico{ background:linear-gradient(145deg,#f5b73d,#e08a1e); }',
'.av-llama .av-ico{ background:var(--warn); }',
'.av-info .av-ico{ background:var(--fill-hi); color:var(--t2); }',
'.av-ok .av-ico{ background:var(--good); }',
'.av-t{ font-size:13.5px; font-weight:600; line-height:1.35; }',
'.av.ve .av-ico{ animation:avIco .6s cubic-bezier(.3,1.6,.5,1) .08s both; }',
'@keyframes avIco{ from{ transform:scale(.4) rotate(-20deg); opacity:0; } to{ transform:none; opacity:1; } }',
/* reacciones */
'.soc-reac button{ transition:transform .3s var(--spring), background .3s var(--ease), box-shadow .3s var(--ease); }',
'.soc-reac button.mia{ background:var(--accent-soft)!important; box-shadow:inset 0 0 0 1.5px var(--accent)!important; color:var(--accent); }',
'.soc-reac button .num{ display:inline-block; }',
'.soc-reac button.rc-suma{ animation:rcPop .45s cubic-bezier(.3,1.7,.5,1); }',
'.soc-reac button.rc-suma .num{ animation:rcSube .4s cubic-bezier(.2,.9,.3,1); }',
'.soc-reac button.rc-resta .num{ animation:rcBaja .4s cubic-bezier(.2,.9,.3,1); }',
'.soc-reac button.rc-fuera{ animation:rcFuera .23s cubic-bezier(.5,0,.75,0) forwards; }',
'@keyframes rcPop{ 0%{ transform:scale(.85); } 50%{ transform:scale(1.12); } 100%{ transform:none; } }',
'@keyframes rcSube{ from{ opacity:0; transform:translateY(70%); } to{ opacity:1; transform:none; } }',
'@keyframes rcBaja{ from{ opacity:0; transform:translateY(-70%); } to{ opacity:1; transform:none; } }',
'@keyframes rcFuera{ to{ opacity:0; transform:scale(.4); } }',
'.soc-reac button.vacio{ animation:rcAparece .3s cubic-bezier(.2,1.3,.4,1) both; }',
'@keyframes rcAparece{ from{ opacity:0; transform:scale(.6); } to{ opacity:.6; transform:none; } }',
/* ranking plegado */
'.rk{ margin-top:12px; border-radius:20px; background:var(--fill); overflow:hidden; }',
'.rk-cab{ width:100%; display:flex; align-items:center; gap:12px; padding:13px 14px; text-align:left; }',
'.rk-caras{ display:flex; flex:0 0 auto; }',
'.rk-caras > span{ margin-left:-8px; border-radius:99px; box-shadow:0 0 0 2px var(--fill); }',
'.rk-caras > span:first-child{ margin-left:0; }',
'.rk-t{ flex:1; min-width:0; display:flex; flex-direction:column; }',
'.rk-t b{ font-size:14.5px; font-weight:700; }',
'.rk-t small{ font-size:12px; color:var(--t3); margin-top:1px; }',
'.rk-flecha{ width:18px; height:18px; color:var(--t3); flex:0 0 auto; transition:transform .4s var(--ease); }',
'.rk.abierto .rk-flecha{ transform:rotate(180deg); }',
'.rk-lista{ height:0; overflow:hidden; transition:height .5s cubic-bezier(.3,.9,.3,1); }',
'.rk.abierto .rk-lista{ height:auto; }',
'.rk-dentro{ padding:0 14px 6px; }',
'.rk-fila{ display:flex; align-items:center; gap:11px; padding:10px 0; box-shadow:inset 0 1px 0 var(--hairline); cursor:pointer; }',
'.rk-pos{ width:14px; font-size:12.5px; font-weight:700; color:var(--t3); text-align:center; }',
'.rk-cuerpo{ flex:1; min-width:0; }',
'.rk-cuerpo p{ font-size:14px; }',
'.rk-cuerpo p span{ color:var(--t3); }',
'.rk-cuerpo small{ font-size:11.5px; color:var(--t3); }',
'.rk-barra{ height:5px; border-radius:99px; background:var(--fill-hi); overflow:hidden; margin:5px 0 4px; }',
'.rk-barra i{ display:block; height:100%; border-radius:99px; background:var(--accent); }',
'.rk-fila.yo .rk-barra i{ background:var(--good); }',
'.rk-pct{ font-size:15px; font-weight:800; }',
'.rk.abierto .rk-fila{ animation:srNueva .45s cubic-bezier(.2,.8,.2,1) both; }',
'.rk.abierto .rk-fila:nth-child(2){ animation-delay:.04s; } .rk.abierto .rk-fila:nth-child(3){ animation-delay:.08s; } .rk.abierto .rk-fila:nth-child(4){ animation-delay:.12s; } .rk.abierto .rk-fila:nth-child(5){ animation-delay:.16s; }',
/* el +4 entra suave y el +XP sube sin saltos */
'.chip-recien{ animation:chipEntra .55s cubic-bezier(.2,1.3,.4,1) both; }',
'@keyframes chipEntra{ from{ opacity:0; transform:scale(.5) translateX(-6px); } to{ opacity:1; transform:none; } }',
'.gym-fiesta b{ animation:xpSube 1.25s cubic-bezier(.2,.8,.2,1) .05s both!important; }',
'@keyframes xpSube{ 0%{ opacity:0; transform:translate(-50%,-30%) scale(.85); } 18%{ opacity:1; transform:translate(-50%,-80%) scale(1); } 70%{ opacity:1; } 100%{ opacity:0; transform:translate(-50%,-190%) scale(1); } }',
/* botón del reto en común: pasa de un estado a otro sin saltos */
'.soc-reto .soc-boton.sr-sello{ animation:srMorph .6s cubic-bezier(.3,1.2,.5,1)!important; }',
'@keyframes srMorph{ 0%{ background:var(--accent); color:var(--on-accent); transform:scale(.96); } 45%{ transform:scale(1.025); } 100%{ background:var(--accent-soft); color:var(--accent); transform:none; } }',
'.soc-reto .soc-boton.sr-desmarca{ animation:srVuelve .5s cubic-bezier(.3,1.2,.5,1); }',
'@keyframes srVuelve{ 0%{ background:var(--accent-soft); color:var(--accent); transform:scale(.97); } 100%{ background:var(--accent); color:var(--on-accent); transform:none; } }',
'.soc-reto .soc-boton span, .soc-reto .soc-boton{ white-space:nowrap; }',
/* caras y nombres que se pueden tocar */
'[data-act="x-perfil"]{ cursor:pointer; }',
'.soc-muro .soc-fila [data-act="x-perfil"]:active{ opacity:.7; }'
].join("\n");

/* ════════════════════════════════════════════════════════════════
   RETOQUE: selector de tema a mano, estados vacíos amables, progreso
   de los logros, mantener pulsado para editar un paso, la pantalla de
   arranque y contraste en oscuro.
   ════════════════════════════════════════════════════════════════ */

/* ── selector de tema: el botón del sol abre las muestras ── */
var TEMA_MUESTRA={
  cielo:["#eaf1fa","#ffffff","#2f7fd8"], melocoton:["#fbeee6","#fffaf6","#e0664a"],
  lavanda:["#f0ecfa","#fcfaff","#7457d9"], menta:["#e8f5ef","#f8fdfb","#15936c"],
  light:["#f5f0e6","#fffcf6","#1c1b19"], dark:["#141311","#1e1c19","#f1ebdf"],
  sage:["#eef3ec","#ffffff","#4f7d63"],  neo:["#e6dcc6","#fbf6ea","#2f4a7d"],
  medianoche:["#000000","#161618","#8f8fff"], oro:["#12100b","#1f1b12","#d9ae45"],
  arena:["#efe6d8","#fffcf7","#b5562f"], porcelana:["#f3f4f6","#ffffff","#1f4fd1"],
  esmeralda:["#07140f","#10251c","#34c98a"], leyenda:["#110a1b","#1f1430","#b57bff"], aurora:["#06121a","#0e2230","#5ee0c8"]
};
var TEMA_VISTO="dtrack-temas-visto";
function temaVisto(){ try{ return !!localStorage.getItem(TEMA_VISTO); }catch(e){ return true; } }
function muestraTema(k){
  if(k==="system"){
    var a=TEMA_MUESTRA.light, b=TEMA_MUESTRA.dark;
    return '<span class="tp-m tp-sis"><i style="background:'+a[0]+'"></i><i style="background:'+b[0]+'"></i>'+
      '<b style="background:'+a[1]+'"><u style="background:'+a[2]+'"></u></b></span>';
  }
  var c=TEMA_MUESTRA[k]||TEMA_MUESTRA.light;
  return '<span class="tp-m" style="background:'+c[0]+'"><b style="background:'+c[1]+'"><u style="background:'+c[2]+'"></u></b></span>';
}
function temaPicker(btn){
  var viejo=document.getElementById("tema-pop");
  if(viejo && !viejo.classList.contains("cerrando")){ temaCierra(); return; }
  if(viejo && viejo.parentNode) viejo.parentNode.removeChild(viejo);
  try{ localStorage.setItem(TEMA_VISTO,"1"); }catch(e){}
  $$('[data-act="toggle-theme"]').forEach(function(b){ b.classList.remove("tp-nuevo"); });
  var cur=curTheme(), nv=nivelCache||1;
  var pop=document.createElement("div"); pop.id="tema-pop"; pop.setAttribute("role","dialog"); pop.setAttribute("aria-label","Tema");
  pop.innerHTML='<p class="tp-t">Tema</p><div class="tp-grid">'+TEMAS.map(function(T){
      var bloq=T.nv && nv<T.nv;
      return '<button class="tp-op'+(T.k===cur?" on":"")+(bloq?" bloq":"")+'" data-th="'+T.k+'"'+(bloq?' data-bloq="'+T.nv+'"':'')+'>'+
        muestraTema(T.k)+'<span class="tp-n">'+esc(T.n)+'</span>'+
        (bloq?'<span class="tp-lv">'+ICON_LOCK+'Nivel '+T.nv+'</span>':'')+'</button>';
    }).join("")+'</div>';
  document.body.appendChild(pop);
  /* se coloca debajo del botón que lo abrió */
  var r=btn.getBoundingClientRect(), w=pop.offsetWidth, vw=window.innerWidth;
  var left=Math.min(vw-w-12, Math.max(12, r.right-w));
  var top=r.bottom+8;
  if(top+pop.offsetHeight>window.innerHeight-12) top=Math.max(12, r.top-pop.offsetHeight-8);
  pop.style.left=left+"px"; pop.style.top=top+"px";
  pop.style.transformOrigin=(r.left+r.width/2-left)+"px "+(top>r.top?"0":"100%");
  requestAnimationFrame(function(){ pop.classList.add("ve"); });
  pop.addEventListener("click", function(ev){
    var b=ev.target.closest(".tp-op"); if(!b) return;
    ev.stopPropagation();
    if(b.dataset.bloq){ avisoNube("Se desbloquea en el nivel "+b.dataset.bloq+"."); b.classList.add("tp-no"); setTimeout(function(){ b.classList.remove("tp-no"); },400); return; }
    if(pop.classList.contains("cerrando")) return;
    var rb=b.querySelector(".tp-m").getBoundingClientRect(), th=b.dataset.th, cx=rb.left+rb.width/2, cy=rb.top+rb.height/2;
    sonido("tick");
    pop.querySelectorAll(".tp-op").forEach(function(x){ x.classList.toggle("on", x===b); });
    /* primero se pliega la ventana y, cuando ya casi no está, se abre el tema nuevo en círculo */
    setTimeout(temaCierra, 140);
    setTimeout(function(){ temaConTransicion(th, cx, cy); }, 400);
  });
  setTimeout(function(){
    document.addEventListener("pointerdown", temaFuera, true);
    window.addEventListener("scroll", temaCierra, { passive:true, once:true });
  }, 0);
  sonido("tick");
}
function temaFuera(ev){
  var p=document.getElementById("tema-pop");
  if(!p){ document.removeEventListener("pointerdown", temaFuera, true); return; }
  if(p.contains(ev.target) || ev.target.closest('[data-act="toggle-theme"]')) return;
  temaCierra();
}
function temaCierra(){
  document.removeEventListener("pointerdown", temaFuera, true);
  var p=document.getElementById("tema-pop"); if(!p || p.classList.contains("cerrando")) return;
  p.classList.add("cerrando"); p.classList.remove("ve");
  setTimeout(function(){ if(p.parentNode) p.parentNode.removeChild(p); }, 360);
}
/* un puntito en el botón hasta que lo abras una vez, para que se sepa que hay temas */
function temaAvisa(){
  if(temaVisto()) return;
  $$('[data-act="toggle-theme"]').forEach(function(b){ b.classList.add("tp-nuevo"); });
}

/* ── estados vacíos: nada de ceros fríos para quien empieza ── */
function vitalVacios(){
  var t=curDay(), h=(S.habits&&S.habits[t])||{};
  var gs=document.getElementById("gym-streak");
  if(gs){
    var caja=gs.parentNode, lab=gs.nextElementSibling, cero=(gs.textContent==="0");
    caja.classList.toggle("gym-vacio", cero);
    if(lab) lab.textContent = cero ? "Tu racha empieza hoy" : (gs.textContent==="1" ? "día seguido" : "días seguidos");
  }
  var sv=document.getElementById("sleep-val"); if(sv && h.sleep==null) sv.textContent="—";
  var pv=document.getElementById("screen-val"); if(pv && h.screen==null) pv.textContent="—";
}

/* ── logros bloqueados: cuánto te falta ── */
var MED_PROG={ m1:["ch",1], m2:["best",7], m3:["best",30], m4:["ch",50], m5:["ch",100], m6:["gym",20], m7:["gym",100],
  m8:["sleep",10], m9:["lowScreen",5], m10:["perfect",1], m11:["perfect",5], m12:["tasksDone",10], m13:["examsPast",10],
  m14:["lvl",26], m15:["lvl",40], m16:["triples",1], m17:["triples",10] };
function medProg(m, st){
  var p=MED_PROG[m.id]; if(!p || p[1]<=1) return "";
  var v=Math.min(p[1], Math.max(0, +(st[p[0]]||0))), obj=p[1];
  var u = p[0]==="lvl" ? "nivel "+v+" de "+obj : v+" de "+obj;
  return '<span class="md-prog"><span class="md-barra"><i style="width:'+Math.round(v/obj*100)+'%"></i></span><span class="num">'+u+'</span></span>';
}

/* ── mantener pulsado un paso de la checklist: se edita ── */
var lpT=null, lpX=0, lpY=0, lpHecho=0;
document.addEventListener("pointerdown", function(ev){
  var b=ev.target.closest('#ideal-list [data-act="check"], #retos-checklist [data-act="check"]');
  if(!b || !b.dataset.id) return;
  lpX=ev.clientX; lpY=ev.clientY; lpHecho=0;
  var fila=b.parentNode;
  clearTimeout(lpT);
  lpT=setTimeout(function(){
    lpHecho=Date.now();
    try{ if(navigator.vibrate) navigator.vibrate(12); }catch(e){}
    if(fila) { fila.classList.add("lp-toca"); setTimeout(function(){ fila.classList.remove("lp-toca"); }, 300); }
    sheetIdeal(b.dataset.id);
  }, 520);
}, true);
function lpCancela(ev){
  if(!lpT) return;
  if(ev.type==="pointermove" && Math.abs(ev.clientX-lpX)<8 && Math.abs(ev.clientY-lpY)<8) return;
  clearTimeout(lpT); lpT=null;
}
document.addEventListener("pointermove", lpCancela, true);
document.addEventListener("pointerup", lpCancela, true);
document.addEventListener("pointercancel", lpCancela, true);
document.addEventListener("contextmenu", function(ev){ if(ev.target.closest('#ideal-list, #retos-checklist')) ev.preventDefault(); }, true);
/* el toque que acaba la pulsación larga no marca el paso */
document.addEventListener("click", function(ev){
  if(!lpHecho) return;
  var reciente=(Date.now()-lpHecho<900); lpHecho=0;
  if(reciente){ ev.stopPropagation(); ev.preventDefault(); }
}, true);

/* ── pantalla de arranque: se va sola en cuanto la app está pintada ── */
function splashFuera(){
  var s=document.getElementById("splash"); if(!s) return;
  var falta=(window.__splashMin||0)-Date.now();
  if(falta>0){ setTimeout(splashFuera, falta); return; }
  s.classList.add("fuera");
  setTimeout(function(){ if(window.__splashAnim) window.__splashAnim.stop(); if(s.parentNode) s.parentNode.removeChild(s); }, 450);
}
setTimeout(splashFuera, 420);

function retoqueAccion(a, el){
  if(a==="x-pt-nueva"){ ptNueva(); return true; }
  return false;
}
function retoqueTrasRender(){
  temaAvisa();
  if(view==="vital") vitalVacios();
}

var RETOQUE_CSS=[
/* selector de tema */
'#tema-pop{ position:fixed; z-index:95; width:min(292px,calc(100vw - 24px)); padding:14px 12px 12px; border-radius:22px;',
'  background:var(--bg);',
'  box-shadow:0 22px 50px -20px rgba(0,0,0,.5), inset 0 0 0 1px var(--hairline); opacity:0; transform:scale(.92) translateY(-6px);',
'  transition:opacity .2s var(--ease), transform .28s cubic-bezier(.3,1.3,.5,1); }',
'html.neo #tema-pop{ background:var(--glass-bg); backdrop-filter:none; -webkit-backdrop-filter:none; }',
'#tema-pop.ve{ opacity:1; transform:none; }',
'.tp-t{ font-size:11px; font-weight:800; letter-spacing:.14em; text-transform:uppercase; color:var(--t3); padding:0 6px 10px; }',
'.tp-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:4px; }',
'.tp-op{ display:flex; flex-direction:column; align-items:center; gap:6px; padding:9px 4px 8px; border-radius:16px; transition:background .2s var(--ease), transform .25s var(--spring); }',
'.tp-op:active{ transform:scale(.94); }',
'.tp-op.on{ background:var(--accent-soft); box-shadow:inset 0 0 0 1.5px var(--accent-line); }',
'.tp-m{ position:relative; width:52px; height:38px; border-radius:11px; overflow:hidden; display:block; box-shadow:inset 0 0 0 1px rgba(0,0,0,.12); }',
'.tp-m > b{ position:absolute; left:7px; right:7px; bottom:0; height:22px; border-radius:7px 7px 0 0; display:block; }',
'.tp-m > b u{ position:absolute; left:6px; top:6px; width:18px; height:5px; border-radius:9px; display:block; }',
'.tp-sis > i{ position:absolute; top:0; bottom:0; width:50%; display:block; }',
'.tp-sis > i:first-child{ left:0; } .tp-sis > i:nth-child(2){ right:0; }',
'.tp-sis > b{ z-index:1; }',
'.tp-n{ font-size:12px; font-weight:700; color:var(--t1); }',
'.tp-lv{ display:inline-flex; align-items:center; gap:3px; margin-top:-3px; font-size:10px; font-weight:700; color:var(--t3); }',
'.tp-lv svg{ width:10px; height:10px; }',
'.tp-op.bloq .tp-m{ opacity:.45; filter:saturate(.6); }',
'.tp-op.bloq .tp-n{ color:var(--t3); }',
'.tp-op.tp-no{ animation:tpNo .35s var(--ease); }',
'@keyframes tpNo{ 20%{ transform:translateX(-4px); } 50%{ transform:translateX(4px); } 80%{ transform:translateX(-2px); } }',
'[data-act="toggle-theme"]{ position:relative; }',
'[data-act="toggle-theme"].tp-nuevo::after{ content:""; position:absolute; top:5px; right:5px; width:8px; height:8px; border-radius:99px;',
'  background:var(--accent); box-shadow:0 0 0 2px var(--bg); animation:tpLatido 2s ease-in-out infinite; }',
'@keyframes tpLatido{ 0%,100%{ transform:scale(1); } 50%{ transform:scale(1.3); } }',

/* Vital: vacíos */
'.gym-vacio #gym-streak{ display:none; }',
'.gym-vacio > div:last-child{ font-size:12.5px!important; font-weight:700; color:var(--good)!important; max-width:92px; line-height:1.25; margin-top:4px!important; }',

/* Retos: tres cifras, selector de día compacto y ×1,5 en una línea */
'#v-retos div:has(> #st-ch), #v-retos div:has(> #st-med){ display:none!important; }',
'#retos-daybar .daybar, #vital-daybar .daybar{ padding-top:2px; padding-bottom:2px; }',
'#retos-daybar .daybar-fila .icon-btn, #vital-daybar .daybar-fila .icon-btn{ width:30px!important; height:30px!important; }',
'#retos-daybar .daybar-fila p:first-child, #vital-daybar .daybar-fila p:first-child{ font-size:13.5px; }',
'#retos-daybar .daybar-fila p + p, #vital-daybar .daybar-fila p + p{ font-size:10.5px; }',
'#retos-daybar .daybar-cal, #vital-daybar .daybar-cal{ transform:scale(.85); }',
'.bonus-x.bx-off{ background:none!important; box-shadow:none!important; padding:2px 2px 0!important; margin-top:10px!important; gap:8px!important; }',
'.bonus-x.bx-off > span:first-child{ font-size:13px!important; padding:2px 8px; border-radius:99px; background:var(--fill); }',
'.bonus-x.bx-off > span:last-child{ font-size:12.5px!important; }',
/* progreso en los logros que faltan */
'.md-prog{ display:flex; align-items:center; gap:8px; margin-top:6px; font-size:10.5px; color:var(--t3); }',
'.md-barra{ flex:1; max-width:120px; height:4px; border-radius:99px; background:var(--fill-hi); overflow:hidden; }',
'.md-barra i{ display:block; height:100%; border-radius:99px; background:color-mix(in srgb,var(--gold) 70%,var(--t3)); }',

/* Social: el nivel se ve, sin barra; descripción en dos líneas; reacciones más grandes */
'.soc-nv{ display:flex; align-items:center; gap:8px; margin-top:6px; min-width:0; }',
'.soc-nv-n{ flex:0 0 auto; padding:3px 10px; border-radius:99px; font-size:12.5px; font-weight:800; color:var(--rc);',
'  background:color-mix(in srgb,var(--rc) 15%,transparent); box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--rc) 28%,transparent); }',
'.soc-nv-t{ font-size:13px; color:var(--t2); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
'.soc-grupo .soc-sub{ white-space:normal; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; line-height:1.35; }',
'.soc-reac button{ height:36px!important; padding:0 13px!important; font-size:14px!important; }',
'.soc-reac-mas{ width:40px!important; height:36px!important; }',

/* parte: apuntar algo nuevo y la línea de racha y nivel */
'.pt-nueva{ display:flex; gap:8px; margin-top:14px; }',
'.pt-nueva .field{ flex:1; min-width:0; }',
'.pt-nueva button{ width:46px; flex:0 0 auto; border-radius:14px; display:grid; place-items:center; color:var(--on-accent); background:var(--pc,var(--accent)); }',
'.pt-nueva button svg{ width:18px; height:18px; }',
'.pt-linea{ display:flex; align-items:center; justify-content:center; flex-wrap:wrap; gap:4px; margin-top:18px; font-size:13.5px; color:var(--t2); }',
'.pt-linea b{ color:var(--t1); font-weight:800; }',
'.pt-linea i{ width:4px; height:4px; border-radius:99px; background:var(--t3); opacity:.5; margin:0 6px; }',
'.pt-llama{ display:inline-grid; width:16px; height:16px; color:var(--warn); margin-right:2px; }',
'.pt-llama svg{ width:100%; height:100%; }',

/* mantener pulsado */
'#ideal-list .lp-toca, #retos-checklist .lp-toca{ animation:lpToca .3s var(--ease); }',
'@keyframes lpToca{ 40%{ transform:scale(.97); } }',
'#ideal-list, #retos-checklist{ -webkit-user-select:none; user-select:none; -webkit-touch-callout:none; }',

/* oscuro: las tarjetas se separan mejor del fondo */
'html.dark:not(.medianoche):not(.oro):not(.esmeralda):not(.leyenda):not(.aurora){ --glass-bg:rgba(255,255,255,.07); }',
'html.dark.esmeralda .rg, html.dark.esmeralda .hg, html.dark.esmeralda .soc-reto, html.dark.esmeralda .rk, html.dark.esmeralda .hist-boton{ background:#11261c!important; }',
'html.dark.leyenda .rg, html.dark.leyenda .hg, html.dark.leyenda .soc-reto, html.dark.leyenda .rk, html.dark.leyenda .hist-boton{ background:#1e1530!important; }',
'html.dark.aurora .rg, html.dark.aurora .hg, html.dark.aurora .soc-reto, html.dark.aurora .rk, html.dark.aurora .hist-boton{ background:#0f2231!important; }',
'html.dark .rg, html.dark .hg, html.dark .soc-reto, html.dark .rk, html.dark .hist-boton{ background:#29292c!important; box-shadow:inset 0 0 0 1px rgba(255,255,255,.07)!important; }',
'html.dark.medianoche .rg, html.dark.medianoche .hg, html.dark.medianoche .soc-reto, html.dark.medianoche .rk, html.dark.medianoche .hist-boton{ background:#141416!important; }',
'html.dark.oro .rg, html.dark.oro .hg, html.dark.oro .soc-reto, html.dark.oro .rk, html.dark.oro .hist-boton{ background:#221d13!important; }'
].join("\n");

