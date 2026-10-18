/* ════════ cabeceras de Cuerpo y Mente (18/10/2026) ════════
   Mente: arriba tu ánimo de la semana (sale del parte del día, S.animo[d].v de 1 a 5)
   con una frase que cambia cada día y una barra por día. Meditación y Leer van en
   su propia ventana, con el mismo fondo que Agua o Sueño. */
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
  var v=document.getElementById("v-academico"), ancla=document.getElementById("mente-academico");
  if(!v || !ancla) return;
  var c=document.getElementById("mn-cab");
  if(!c){ c=document.createElement("div"); c.id="mn-cab"; c.className="cab-cm"; ancla.parentNode.insertBefore(c, ancla); }
  c.innerHTML=mnCabHTML();
}
var _renderCabCM=render;
render=function(){ var r=_renderCabCM.apply(this, arguments); try{ mnCabPinta(); }catch(e){} return r; };
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
'#mn-cab{ --c:var(--c-mente); }',
/* Meditación y Leer, cada una en su ventana */
'html.dz-n #v-academico #med-card, html #v-academico #mt-leer{ background:var(--tarjeta) !important; border:0 !important; box-shadow:none !important; border-radius:22px !important; padding:18px !important; }',
'html.dz-n #v-academico #med-card{ margin-bottom:12px; } html #v-academico #mt-leer{ margin-top:0; }'
  ].join("\n"); document.head.appendChild(st);
})();
