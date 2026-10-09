/* ════════ diseño nuevo · transiciones, botones pequeños y pruebas en Ajustes (oct 2026) ════════
   Al cambiar de pestaña, la nueva entra con un fundido y un deslizamiento corto
   hacia el lado al que vas (si vas a la derecha, entra desde la derecha).
   Ajustes › Avanzado › «Ver pantallas nuevas»: bienvenida, subida de rango,
   Tu semana, la tarjeta del domingo y las pantallas vacías, sin tocar tus datos. */
var TR_ORDEN={ resumen:0, retos:1, vital:2, academico:3, tareas:3, social:4 };
var _goTrans=go;
go=function(v){
  var antes=TR_ORDEN[view], d=TR_ORDEN[v], h=document.documentElement;
  h.classList.remove("va-der","va-izq");
  if(antes!=null && d!=null && antes!==d) h.classList.add(d>antes?"va-der":"va-izq");
  return _goTrans.apply(this, arguments);
};

/* ── pruebas: ver sin tocar nada ── */
var vcVer=false, csHoyVer=false;
var _metasMesVer=metasMes;
metasMes=function(mk){ return vcVer ? [] : _metasMesVer.apply(this, arguments); };
var _pintaSocialVer=pintaSocial;
pintaSocial=function(){
  if(!vcVer) return _pintaSocialVer.apply(this, arguments);
  var g=GRUPO; GRUPO=null;
  try{ return _pintaSocialVer.apply(this, arguments); } finally { GRUPO=g; }
};
var _hnGuiaVer=hnGuia;
hnGuia=function(){
  var g=_hnGuiaVer.apply(this, arguments);
  if(!csHoyVer || g.indexOf("cs-hoy")>=0) return g;
  var o=resumenSemana(lunesDe(today()));
  return g+'<div class="cs-hoy"><div><p>Tu semana está lista</p><b class="num">+'+o.xp+' XP</b><small>'+o.activos+' de 7 días activos</small></div>'+
    '<span><button class="cs-hoy-x" data-act="x-cs-hoy-fuera" aria-label="Ocultar">✕</button><button class="cs-hoy-b" data-act="x-cs-hoy">Compartir</button></span></div>';
};
var PR_LISTA=[
  ["x-pr-bienvenida", "Bienvenida", "Lo que ve alguien nuevo al entrar"],
  ["x-pr-subida", "Subida de rango", "La celebración a pantalla completa"],
  ["x-pr-semana", "Tu semana para stories", "La imagen para compartir"],
  ["x-pr-domingo", "Tarjeta del domingo", "La que sale en Hoy para compartir tu semana"],
  ["x-pr-vacios", "Pantallas vacías", "Objetivos y Social como los ve alguien que empieza"]
];
var _sheetSettingsPr=sheetSettings;
sheetSettings=function(){
  var r=_sheetSettingsPr.apply(this, arguments);
  var av=document.getElementById("aj-av"); if(!av || document.getElementById("aj-pruebas")) return r;
  var caja=document.createElement("div"); caja.id="aj-pruebas"; caja.className="mb-6";
  caja.innerHTML='<p class="eyebrow mb-2">Ver pantallas nuevas</p>'+PR_LISTA.map(function(p){
    var on=(p[0]==="x-pr-vacios" && vcVer) || (p[0]==="x-pr-domingo" && csHoyVer);
    return '<button class="aj-priv" data-act="'+p[0]+'"><span class="aj-m-ico">'+ico("exp")+'</span><span class="aj-priv-t"><b>'+p[1]+(on?" · activado":"")+'</b><small>'+
      (on?"Tócalo otra vez para quitarlo":p[2])+'</small></span>'+ico("flecha")+'</button>'; }).join("");
  av.insertBefore(caja, av.querySelector(".aj-h") ? av.querySelector(".aj-h").nextSibling : av.firstChild);
  return r;
};
var _hoyNuevoAccionPr=hoyNuevoAccion;
hoyNuevoAccion=function(a, el){
  if(a.indexOf("x-pr-")===0){
    closeSheet();
    setTimeout(function(){
      if(a==="x-pr-bienvenida") verBienvenida();
      else if(a==="x-pr-subida") verSubida();
      else if(a==="x-pr-semana") compartirSemana(lunesDe(today()));
      else if(a==="x-pr-domingo"){ csHoyVer=!csHoyVer; go("resumen"); }
      else if(a==="x-pr-vacios"){ vcVer=!vcVer; go("retos"); if(vcVer) avisoNube("Así lo ve alguien que empieza. Mira también Social."); }
    }, 260);
    return true;
  }
  if(a==="x-cs-hoy-fuera" && csHoyVer){ csHoyVer=false; render(); return true; }
  return _hoyNuevoAccionPr.apply(this, arguments);
};

(function(){
  var st=document.createElement("style"); st.id="transiciones-css"; st.textContent=[
'html.va-der .view{ animation:vDer .42s cubic-bezier(.2,.8,.2,1) both; }',
'html.va-izq .view{ animation:vIzq .42s cubic-bezier(.2,.8,.2,1) both; }',
'@keyframes vDer{ from{ opacity:0; transform:translateX(28px); } to{ opacity:1; transform:none; } }',
'@keyframes vIzq{ from{ opacity:0; transform:translateX(-28px); } to{ opacity:1; transform:none; } }',
'html.tour-on .view{ animation:none!important; }',
'@media (prefers-reduced-motion:reduce){ html.va-der .view, html.va-izq .view{ animation:vIn .2s linear both; } }',
/* botones pequeños: misma pinta, pero se pueden tocar en un círculo de al menos 44 px */
'.hn-g-cab button, [data-act="edit-ideal"], .rs-editar, .sf-mas, .ali-obj, [data-act="day-prev"], [data-act="day-next"], [data-act="day-pick"], .cs-hoy-x{ position:relative; }',
'.hn-g-cab button::after, [data-act="edit-ideal"]::after, .rs-editar::after, .sf-mas::after, .ali-obj::after, [data-act="day-prev"]::after, [data-act="day-next"]::after, [data-act="day-pick"]::after, .av-lapiz::after, .cs-hoy-x::after{',
'  content:""; position:absolute; left:50%; top:50%; width:max(100%, 44px); height:max(100%, 44px); transform:translate(-50%,-50%); }'
  ].join("\n"); document.head.appendChild(st);
})();
