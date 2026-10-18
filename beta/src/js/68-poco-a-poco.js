/* ════════ poco a poco: el primer día, solo lo básico (oct 2026) ════════
   A quien empieza (S.ppDesde lo pone el final de las preguntas iniciales) no se le
   enseña todo de golpe: lo demás aparece en los días siguientes, con un aviso.
   Quien ya usaba la app antes no tiene S.ppDesde y lo ve todo como siempre.
   Se oculta con clases en <html>, así da igual qué pieza repinte cada sección. */
var PP_PASOS=[
  { d:2, k:"cuerpo",  sel:["#cu-rutinas","#ali-card"], t:"🧘 Estirar y 🥗 Alimentación", en:"Cuerpo" },
  { d:3, k:"leer",    sel:["#mt-leer"],                t:"📚 Leer",                       en:"Mente" },
  { d:4, k:"metas",   sel:["#metas-mes","#rt-desc"],   t:"🎯 Metas del mes y días de descanso", en:"Retos" },
  { d:6, k:"mas",     sel:["#on-mas"],                 t:"🧪 Mis retos y Experimentos",   en:"Retos" }
];
function ppDia(){
  if(!S.ppDesde) return 99;
  var a=new Date(S.ppDesde+"T00:00:00"), b=new Date(today()+"T00:00:00");
  return Math.round((b-a)/864e5)+1;
}
function ppAplica(){
  var dia=ppDia(), html=document.documentElement;
  PP_PASOS.forEach(function(p){ html.classList.toggle("pp-no-"+p.k, dia<p.d); });
  /* lo que se acaba de abrir, una vez y con aviso */
  var nuevo=PP_PASOS.filter(function(p){ return dia>=p.d && dia<99 && (S.ppVisto||0)<p.d; });
  if(nuevo.length){
    S.ppVisto=nuevo[nuevo.length-1].d; save();
    var t=nuevo.map(function(p){ return p.t+" en "+p.en; }).join(" · ");
    setTimeout(function(){ avisoNube("🔓 Nuevo: "+t); }, 1600);
  }
}
/* en General, debajo de los hábitos: lo que se abre mañana */
function ppManana(){
  var box=document.getElementById("hoy"); if(!box) return;
  var v=box.querySelector(".pp-manana"); if(v) v.remove();
  var dia=ppDia(), sig=PP_PASOS.filter(function(p){ return p.d===dia+1; })[0];
  if(!sig) return;
  var ref=box.querySelector(".gn-habs") || box.querySelector(".gn-vacio"); if(!ref) return;
  var masHab=ref.nextElementSibling && ref.nextElementSibling.classList.contains("gn-pie") ? ref.nextElementSibling : ref;
  masHab.insertAdjacentHTML("afterend", '<p class="pp-manana">🔓 Mañana se abre '+sig.t+' en '+sig.en+'.</p>');
}
var _hoyNuevoPp=hoyNuevo;
hoyNuevo=function(){ var r=_hoyNuevoPp.apply(this, arguments); try{ ppManana(); }catch(e){} return r; };
var _renderPp=render;
render=function(){ try{ ppAplica(); }catch(e){} return _renderPp.apply(this, arguments); };
var _onbTerminaPp=onbTermina;
onbTermina=function(aplicar){
  if(!S.ppDesde && !onbPrueba){ S.ppDesde=today(); S.ppVisto=1; }
  return _onbTerminaPp(aplicar);
};
document.addEventListener("visibilitychange", function(){ if(!document.hidden) try{ ppAplica(); }catch(e){} });

(function(){
  var css=PP_PASOS.map(function(p){ return p.sel.map(function(s){ return 'html.pp-no-'+p.k+' '+s; }).join(", ")+'{ display:none !important; }'; });
  css.push('.pp-manana{ margin:14px 2px 0; font-size:14px; font-weight:500; color:var(--t3); }');
  var st=document.createElement("style"); st.id="poco-a-poco-css"; st.textContent=css.join("\n");
  document.head.appendChild(st);
})();
/* la primera pintura ya ha pasado cuando llega esta pieza: se aplica ya */
try{ ppAplica(); ppManana(); }catch(e){}
