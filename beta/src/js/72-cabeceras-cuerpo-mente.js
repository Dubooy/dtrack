/* ════════ cabeceras de Cuerpo y Mente (18/10/2026) ════════
   Mente: arriba tu ánimo de la semana (sale del parte del día, S.animo[d].v de 1 a 5)
   con una frase que cambia cada día y una barra por día. Meditación y Leer van en
   su propia ventana, con el mismo fondo que Agua o Sueño.
   Cuerpo: tu energía del día, calculada con sueño, agua y ejercicio (cambia según
   apuntas), con frase que cambia cada día y barras de la semana. */
var MN_FRASES=[
  null,
  ["Semana dura","Toca cuidarse","Días grises","Paso a paso","Con todo encima","Semana de las largas"],
  ["Cuesta arriba","Algo flojo","Un poco de bajón","Semana pesadita","Con pocas pilas","Sin mucha chispa"],
  ["Ni fu ni fa","Semana normalita","Ahí, en el medio","Tirando","Sin más","Día a día"],
  ["Con buena cara","Semana bonita","Vas bien","Buen rollo","Bastante a gusto","Tranqui y bien"],
  ["Semana top","En racha buena","Vas sobrado","Todo fluye","Semana de diez","Muy arriba"]
];
function mnFrase(lista, sal){
  var h=0, s=today()+sal; for(var i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))|0;
  return lista[Math.abs(h)%lista.length];
}
function mnCabHTML(){
  var hoy=today(), suma=0, n=0, barras="";
  for(var i=6;i>=0;i--){
    var d=addDays(hoy,-i), v=(animoDe(d)||{}).v||0;
    if(v){ suma+=v; n++; }
    barras+='<div class="'+(i===0?"hoy":"")+'"><i class="'+(v?"si":"")+'" style="height:'+(v?10+v*9:6)+'px"></i>'+INI[new Date(d+"T00:00:00").getDay()]+'</div>';
  }
  var nivel=n?Math.max(1,Math.min(5,Math.round(suma/n))):0;
  var t=nivel?mnFrase(MN_FRASES[nivel],"mn"):"¿Qué tal vas?";
  var sub=nivel?("Tu ánimo esta semana"+(nivel<=2?" · date un rato para ti":"")):"Haz el parte esta noche y aquí verás tu semana";
  return '<div class="cab-t">'+esc(t)+'</div><div class="cab-s">'+esc(sub)+'</div><div class="cab-sem">'+barras+'</div>';
}
function mnCabPinta(){
  /* sin Estudio, Mente es la vista de Tareas (#mente-tareas): la cabecera va donde esté la meditación */
  var ancla=menteHueco(); if(!ancla) return;
  var c=document.getElementById("mn-cab");
  if(!c){ c=document.createElement("div"); c.id="mn-cab"; c.className="cab-cm"; }
  if(c.nextSibling!==ancla) ancla.parentNode.insertBefore(c, ancla);
  c.innerHTML=mnCabHTML();
}
var CU_FRASES=[
  null,
  ["Sin pilas","Modo ahorro","Día de sofá","Bajo mínimos","Toca recargar","Cuerpo pidiendo tregua"],
  ["Algo flojo","Pilas a medias","A medio gas","Día lento","Con el freno puesto","Te falta chispa"],
  ["Normalito","Ahí vas","Energía justa","Día estable","Sin sobresaltos","Ni mucha ni poca"],
  ["Con energía","Buen ritmo","Con pilas","Vas fino","Cuerpo a punto","En forma"],
  ["A tope","Imparable","Con todo","Batería llena","Día de récord","Volando"]
];
/* 0 a 1, o null si ese día no hay nada apuntado. El agua solo cuenta si la apuntaste
   (por la mañana aún no has bebido) y el ejercicio solo suma. */
function cuAguaToca(d){
  if(d!==today()) return 8;
  var hh=new Date().getHours(); return Math.max(1, 8*Math.min(1, Math.max(0, (hh-8)/12)));
}
function cuEnergia(d){
  var h=habit(d), partes=[];
  /* sueño: 4 h o menos es 0 y 8 h y media es 1 · agua: lo que toca a esa hora (8 vasos de 8:00 a 20:00) */
  if(h.sleep>0) partes.push(Math.max(0, Math.min(1, (h.sleep-4)/4.5)));
  if(h.water>0){
    partes.push(Math.min(1, h.water/cuAguaToca(d)));
  }
  var gym=wentGym(d);
  if(!partes.length) return gym ? 0.7 : null;
  var e=partes.reduce(function(a,b){ return a+b; },0)/partes.length;
  return Math.min(1, e+(gym?0.15:0));
}
function cuNivel(e){ return e<0.35?1 : e<0.55?2 : e<0.7?3 : e<0.85?4 : 5; }
function cuCabHTML(){
  /* la semana acaba hoy; tocar una barra lleva a ese día */
  var dia=curDay(), hoy=today(), barras="";
  for(var i=6;i>=0;i--){
    var d=addDays(hoy,-i), e=cuEnergia(d);
    barras+='<div data-cu-dia="'+d+'" class="'+(d===dia?"hoy":"")+'"><i class="'+(e!=null?"si":"")+'" style="height:'+(e!=null?Math.round(12+e*48):6)+'px"></i>'+INI[new Date(d+"T00:00:00").getDay()]+'</div>';
  }
  var e=cuEnergia(dia), h=habit(dia), esHoy=dia===today(), t, sub;
  if(e==null){ t=esHoy?"¿Cómo amaneces?":"Sin datos"; sub=esHoy?"Apunta cómo dormiste y aquí verás tu energía":"Ese día no apuntaste sueño ni agua"; }
  else {
    var n=cuNivel(e); t=mnFrase(CU_FRASES[n],"cu"+dia);
    sub=(esHoy?"Tu energía hoy":"Tu energía ese día")+(n>=5 || !esHoy?"":
      h.sleep>0 && h.sleep<7 ? " · dormir más te la subiría" :
      h.water+1<cuAguaToca(dia) ? " · un par de vasos más te vendrán bien" :
      !wentGym(dia) ? " · moverte un rato le da un empujón" : "");
  }
  var otro=esHoy?"":'<div class="cu-otro"><span>'+esc(cap(fmt(dia,{weekday:"long",day:"numeric"})))+'</span><button data-cu-dia="'+today()+'">Volver a hoy</button></div>';
  return otro+'<div class="cab-t">'+esc(t)+'</div><div class="cab-s">'+esc(sub)+'</div><div class="cab-sem">'+barras+'</div>';
}
document.addEventListener("click", function(ev){
  var b=ev.target.closest && ev.target.closest("#cu-cab [data-cu-dia]"); if(!b) return;
  var d=b.getAttribute("data-cu-dia"); if(d>today()) return;
  selDay=(d===today()?null:d); try{ sonido("tick"); }catch(e){} render();
});
function cuCabPinta(){
  var ancla=document.getElementById("vital-daybar"); if(!ancla) return;
  var c=document.getElementById("cu-cab");
  if(!c){ c=document.createElement("div"); c.id="cu-cab"; c.className="cab-cm"; ancla.parentNode.insertBefore(c, ancla.nextSibling); }
  c.innerHTML=cuCabHTML();
}
/* que cambie al momento al apuntar (un vaso, el sueño…), sin esperar a pintar todo */
var _saveCabCM=save;
save=function(){ var r=_saveCabCM.apply(this, arguments); try{ cuCabPinta(); mnCabPinta(); }catch(e){} return r; };
var _renderCabCM=render;
render=function(){ var r=_renderCabCM.apply(this, arguments); try{ mnCabPinta(); }catch(e){} try{ cuCabPinta(); }catch(e){} return r; };
(function(){
  var st=document.createElement("style"); st.id="cabeceras-cm-css"; st.textContent=[
'.cab-cm{ margin:2px 0 26px; }',
'.cab-cm .cab-t{ font-family:Unbounded,sans-serif; font-weight:700; font-size:38px; line-height:1.05; letter-spacing:-.04em; color:var(--t1); }',
'.cab-cm .cab-s{ font-size:15px; font-weight:500; color:var(--t2); margin-top:8px; }',
'.cab-cm .cab-sem{ display:flex; gap:8px; align-items:flex-end; height:72px; margin-top:16px; }',
'.cab-cm .cab-sem div{ flex:1; text-align:center; font-size:11px; font-weight:500; color:var(--t3); }',
'.cab-cm .cab-sem i{ display:block; border-radius:6px; margin-bottom:6px; background:color-mix(in srgb,var(--c, var(--t1)) 16%,transparent); }',
'.cab-cm .cab-sem i.si{ background:color-mix(in srgb,var(--c, var(--t1)) 50%,transparent); }',
'.cab-cm .cab-sem div.hoy{ color:var(--t1); font-weight:600; } .cab-cm .cab-sem div.hoy i.si{ background:var(--c, var(--t1)); }',
'#mn-cab{ --c:var(--c-mente); } #cu-cab{ --c:var(--c-cuerpo); margin-top:18px; }',
/* Meditación y Leer, cada una en su ventana */
'html.dz-n .view #med-card#med-card, html.dz-n .view #mt-leer#mt-leer{ background:var(--tarjeta) !important; border:0 !important; box-shadow:none !important; border-radius:22px !important; padding:18px !important; }',
'html.dz-n .view #med-card{ margin-bottom:12px; } html .view #mt-leer{ margin-top:0; }',
/* Cuerpo sin la fila para cambiar de día arriba */
'#cu-cab .cab-sem div{ cursor:pointer; } #cu-cab .cab-sem div:active i{ transform:scale(.94); }',
'.cu-otro{ display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; font-size:14px; font-weight:600; color:var(--c-cuerpo); }',
'.cu-otro button{ height:32px; padding:0 14px; border-radius:99px; font-size:13px; font-weight:600; background:var(--t1); color:var(--bg); }',
'#vital-daybar{ display:none !important; } #cu-cab{ margin-top:4px !important; }'
  ].join("\n"); document.head.appendChild(st);
})();
