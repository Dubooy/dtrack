/* ════════ poco a poco: el primer día, solo lo básico (oct 2026) ════════
   A quien empieza (S.ppDesde lo pone el final de las preguntas iniciales) no se le
   enseña todo de golpe: lo demás aparece en los días siguientes, con un aviso.
   Quien ya usaba la app antes no tiene S.ppDesde y lo ve todo como siempre.
   Se oculta con clases en <html>, así da igual qué pieza repinte cada sección. */
var PP_PASOS=[
  { d:2, k:"cuerpo",  sel:["#cu-rutinas","#ali-card"], t:"🧘 Estirar y 🥗 Alimentación", en:"Cuerpo" },
  { d:3, k:"leer",    sel:["#mt-leer"],                t:"📚 Leer",                       en:"Mente" },
  { d:3, k:"nivel",   sel:[".soc-nv","#v-retos .rt-tabs"], t:"🏔️ Tu nivel y tu rango",   en:"Retos" },
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
  var w=box.querySelector(".pp-amigos"); if(w) w.remove();
  var ref=box.querySelector(".gn-habs") || box.querySelector(".gn-vacio"); if(!ref) return;
  var masHab=ref.nextElementSibling && ref.nextElementSibling.classList.contains("gn-pie") ? ref.nextElementSibling : ref;
  /* el grupo es lo que más engancha: mientras no tengas, se ofrece aquí */
  var conGrupo=(typeof GRUPO!=="undefined" && GRUPO && GRUPO.miembros && GRUPO.miembros.length>1);
  if(!conGrupo && !S.ppAmigosNo){
    masHab.insertAdjacentHTML("afterend", '<div class="pp-amigos"><button class="pp-am-x" data-pp="no" aria-label="Ahora no">×</button>'+
      '<span class="pp-am-e" aria-hidden="true">👋</span><b>Peak. va mejor con amigos</b>'+
      '<small>Haz un grupo con 2 o 3 y veréis cada día quién tira más del carro.</small>'+
      '<button class="pp-am-b" data-pp="crear">Invitar amigos</button></div>');
  }
  var dia=ppDia(), sig=PP_PASOS.filter(function(p){ return p.d===dia+1; });
  if(!sig.length) return;
  var t=sig.map(function(p){ return p.t+" en "+p.en; }).join(" y ");
  masHab.insertAdjacentHTML("afterend", '<p class="pp-manana">🔓 Mañana se abre '+t+'.</p>');
}
document.addEventListener("click", function(ev){
  var b=ev.target.closest && ev.target.closest(".pp-amigos [data-pp]"); if(!b) return;
  ev.preventDefault(); ev.stopPropagation();
  if(b.dataset.pp==="no"){ S.ppAmigosNo=1; save(); var c=b.closest(".pp-amigos"); if(c) c.remove(); return; }
  go("social"); setTimeout(function(){ grupoAccion("x-g-crear"); }, 350);
}, true);
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
  css.push('.pp-manana{ margin:14px 2px 0; font-size:14px; font-weight:500; color:var(--t3); }',
    '.pp-amigos{ position:relative; display:flex; flex-direction:column; align-items:flex-start; gap:4px; margin-top:22px; padding:18px; border-radius:22px; background:var(--fill); }',
    '.pp-am-e{ font-size:28px; line-height:1; margin-bottom:6px; }',
    '.pp-amigos b{ font-family:var(--f-texto); font-size:16.5px; font-weight:600; color:var(--t1); }',
    '.pp-amigos small{ font-size:14px; font-weight:500; color:var(--t2); line-height:1.4; }',
    '.pp-am-b{ margin-top:12px; height:42px; padding:0 18px; border-radius:99px; background:var(--t1); color:var(--bg); font-size:14.5px; font-weight:600; }',
    '.pp-am-x{ position:absolute; top:8px; right:8px; width:44px; height:44px; font-size:22px; color:var(--t3); }',
    '.gn-dos.gn-solo{ grid-template-columns:1fr !important; }',
    '.gn-semvacia{ margin:10px 2px 0; font-size:14.5px; font-weight:500; color:var(--t2); }',
    'html.pp-no-nivel #hy-evo .ev-mapa{ display:none !important; }');
  var st=document.createElement("style"); st.id="poco-a-poco-css"; st.textContent=css.join("\n");
  document.head.appendChild(st);
})();
/* la primera pintura ya ha pasado cuando llega esta pieza: se aplica ya */
try{ ppAplica(); ppManana(); }catch(e){}
