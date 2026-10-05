/* ════════════════════════════════════════════════════════════════
   EXPERIMENTOS, FUERA DE OBJETIVOS (oct 2026)
   La tarjeta de Experimentos ya no sale en Objetivos. Se llega desde
   Ajustes › Avanzado › «Activar experimento», que abre el catálogo de
   siempre (o el experimento en marcha, si hay uno). Lo demás sigue
   igual: el experimento en marcha se ve en Hoy y su resultado en Tu evolución.
   ════════════════════════════════════════════════════════════════ */
pintaExpObjetivos=function(){
  var el=document.getElementById("rt-exp"); if(el && el.parentNode) el.parentNode.removeChild(el);
};
var _sheetSettingsExp=sheetSettings;
sheetSettings=function(){
  var r=_sheetSettingsExp.apply(this, arguments);
  var av=document.getElementById("aj-av"); if(!av || document.getElementById("aj-exp")) return r;
  var a=expActivo(), b=document.createElement("button");
  b.id="aj-exp"; b.className="aj-priv"; b.setAttribute("data-act","x-exp-ajustes");
  b.innerHTML='<span class="aj-m-ico">'+ico("exp")+'</span><span class="aj-priv-t"><b>'+tr("Activar experimento")+'</b><small>'+
    (a ? tr("En marcha")+": "+esc(expTitulo(a)) : tr("Una pregunta sobre ti durante 7 días. Peak lo sigue solo."))+'</small></span>'+ico("flecha");
  av.appendChild(b);
  return r;
};
var _expAjGA=grupoAccion;
grupoAccion=function(a, el){
  if(a==="x-exp-ajustes"){ closeSheet(); setTimeout(function(){ if(expActivo()) expVer(); else expCatalogo(false); }, 220); return true; }
  return _expAjGA.apply(this, arguments);
};
