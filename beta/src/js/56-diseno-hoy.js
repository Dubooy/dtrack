/* ════════ diseño nuevo · Hoy (oct 2026) ════════
   Maqueta: diseno/ui-peak/hoy-claro.html. pintaHoy (14) llama a hoyNuevo al final:
   la racha en grande (DÍA N.), Retos · Hábitos · Cuerpo en una fila, los retos y
   los hábitos en listas numeradas (lo hecho, tachado y al final), Parte del día
   y Estudiar, y tu semana en barras.
   Arriba a la derecha va tu foto: abre Tu perfil, Ajustes y Modo.
   Solo funciones: Hoy se pinta antes de que esta pieza llegue a ejecutarse. */

function hnFila(n, txt, sub, hecho, act, id){
  return '<button class="hn-r'+(hecho?' ok':'')+'" data-act="'+act+'" data-id="'+id+'" data-day="'+today()+'">'+
    '<i class="num">'+(n<10?'0':'')+n+'</i><span class="hn-tx"><span class="hn-p">'+esc(txt)+'</span></span>'+
    '<b class="hn-ck" aria-hidden="true"></b></button>';
}
/* las tareas hechas bajan al final; el número es el puesto en la lista.
   Con tope, el resto se esconde tras «Ver N más» */
var hnTodos=false;
function hnLista(items, hechoDe, act, tope){
  var pend=items.filter(function(x){ return !hechoDe(x); }), ok=items.filter(hechoDe), l=pend.concat(ok);
  var corta=tope && !hnTodos && l.length>tope+1, ver=corta ? l.slice(0,tope) : l;
  return ver.map(function(x,i){ return hnFila(i+1, x.text, "", hechoDe(x), act, x.id); }).join("")+
    (corta ? '<button class="hn-mas" data-act="x-hn-mas">Ver '+(l.length-tope)+' más</button>'
      : (tope && hnTodos && l.length>tope+1) ? '<button class="hn-mas" data-act="x-hn-mas">Ver menos</button>' : '');
}
function hnAvatar(){
  var p=(typeof perfil!=="undefined" && perfil) || {}, nom=p.usuario || (S.profile && S.profile.name) || "";
  return p.avatar ? '<img src="'+esc(p.avatar)+'" alt="">' : '<span>'+esc((nom||"·").charAt(0).toUpperCase())+'</span>';
}

function hoyNuevo(st){
  var box=document.getElementById("hoy"); if(!box) return;
  document.documentElement.classList.add("hoy-n");
  var t=today(), retos=todaysChallenges(t), hechos=chOf(t), habs=ordenIdeal(idealActivos()), cks=checksOf(t), sa=saludHoy(t);
  var racha=(st && st.streak)||0, dd=new Date(t+"T00:00:00");
  var dia=["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"][dd.getDay()];
  var mes=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"][dd.getMonth()];

  /* arriba, la fecha en grande; la racha, en la línea pequeña */
  var hd=document.getElementById("hero-date");
  if(hd) hd.innerHTML=mes+(racha ? ' · <span class="hn-racha">racha de '+racha+(racha===1?" día":" días")+'</span>' : "");
  var hg=document.getElementById("hero-greet");
  if(hg) hg.innerHTML=dia+" "+dd.getDate()+'<span class="hn-punto">.</span>';

  var sem=resumenSemana(lunesDe(t)), tope=Math.max.apply(null, sem.porDia.concat([1]));
  var barras=sem.dias.map(function(d,i){
    var x=sem.porDia[i];
    return '<div class="'+(d===t?"hoy":x>0?"on":"")+'"><em class="num">'+(x>0?x:"")+'</em><i style="height:'+(x>0?Math.max(8, Math.round(x/tope*72)):3)+'px"></i><span>'+"LMXJVSD".charAt(i)+'</span></div>';
  }).join("");

  var est=S.estudio && S.estudio.actual, estSub, estAct="x-estudiar";
  if(est){
    var rest=Math.max(0, est.fin ? est.fin-Date.now() : (est.resto||0)), mm=Math.floor(rest/60000), ss=Math.floor(rest%60000/1000);
    estSub='<b class="num" id="hy-est-t">'+(est.fase==="listo"?"✓":(mm<10?"0":"")+mm+":"+(ss<10?"0":"")+ss)+'</b>'; estAct="x-hoy-estudio";
  } else { var min=estudioMinDia(t); estSub=min ? esc(horasTxt(min))+" hoy" : "Pomodoro · 25 min"; }
  var parteHecho=!!(S.parte && S.parte[t]), hh=new Date().getHours();

  box.innerHTML=
    '<div class="hn-fila3">'+
      '<button data-act="x-hn-ir" data-k="retos"><small>Retos</small><b class="num'+(retos.length&&hechos.length>=retos.length?" lleno":"")+'">'+hechos.length+'<span>/'+retos.length+'</span></b></button>'+
      '<button data-act="x-hn-ir" data-k="habitos"><small>Hábitos</small><b class="num'+(habs.length&&cks.length>=habs.length?" lleno":"")+'">'+cks.length+'<span>/'+habs.length+'</span></b></button>'+
      '<button data-jump="vital"><small>Cuerpo</small><b class="num'+(sa>=4?" lleno":"")+'">'+sa+'<span>/4</span></b></button>'+
    '</div>'+hnGuia()+
    (retos.length ?
    '<div class="hn-sec" id="hn-retos"><h2>Retos de hoy</h2><span>+15 XP c/u</span></div>'+
    hnLista(retos, function(c){ return hechos.indexOf(c.id)>=0; }, "ch", 0) : '')+
    '<div class="hn-sec" id="hn-habitos"><h2>Hábitos</h2><span>+4 XP c/u · <button data-act="edit-ideal">Editar</button></span></div>'+
    (habs.length ? hnLista(habs, function(it){ return cks.indexOf(it.id)>=0; }, "check", 4)
      : '<button class="hn-vacio" data-act="edit-ideal">Añade los hábitos que quieres cumplir cada día</button>')+
    '<div class="hn-dos">'+
      '<button class="hn-card neg'+(parteHecho?" ok":"")+'" data-act="parte"><span class="hn-ic"><svg viewBox="0 0 24 24"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/></svg></span>'+
        '<span><b>Parte del día</b><small>'+(parteHecho?"Hecho. Buenas noches":(hh>=19||hh<4)?"Ahora · 1 min":"Esta noche · 1 min")+'</small></span></button>'+
      '<button class="hn-card" data-act="'+estAct+'"><span class="hn-ic"><svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/></svg></span>'+
        '<span><b>'+(est?"Estudiando":"Estudiar")+'</b><small>'+estSub+'</small></span></button>'+
    '</div>'+
    '<div class="hn-sec"><h2>Tu semana</h2><span class="num">+'+sem.xp+' XP</span></div>'+
    '<div class="hn-sem">'+barras+'</div>';

  /* tu foto arriba a la derecha, en lugar de tema y ajustes */
  var af=document.getElementById("acciones-flotantes");
  if(af){
    var yo=af.querySelector(".hn-yo");
    if(!yo){ yo=document.createElement("button"); yo.className="hn-yo"; yo.setAttribute("data-act","x-hn-yo"); yo.setAttribute("aria-label","Tu perfil, ajustes y modo"); af.appendChild(yo); }
    yo.innerHTML=hnAvatar();
  }
  requestAnimationFrame(hnAlinea);
  hnFlip(box);
}

/* ── al marcar: el check se rellena al momento y, al repintar, cada fila se desliza
   desde donde estaba hasta su sitio nuevo (lo hecho baja al final) ── */
var hnAntes=null;
document.addEventListener("click", function(e){
  var r=e.target.closest && e.target.closest("#hoy .hn-r"); if(!r) return;
  hnAntes={};
  document.querySelectorAll("#hoy .hn-r").forEach(function(x){ hnAntes[x.dataset.act+x.dataset.id]=x.getBoundingClientRect().top; });
  r.classList.toggle("ok");
  if(r.classList.contains("ok")){ r.classList.remove("hn-pop"); void r.offsetWidth; r.classList.add("hn-pop"); }
}, true);
function hnFlip(box){
  var antes=hnAntes; hnAntes=null; if(!antes) return;
  if(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  box.querySelectorAll(".hn-r").forEach(function(x){
    var y0=antes[x.dataset.act+x.dataset.id]; if(y0==null) return;
    var dy=y0-x.getBoundingClientRect().top; if(Math.abs(dy)<2) return;
    x.style.transition="none"; x.style.transform="translateY("+dy+"px)";
    requestAnimationFrame(function(){ requestAnimationFrame(function(){
      x.style.transition="transform .5s cubic-bezier(.3,1.25,.5,1)"; x.style.transform="";
      setTimeout(function(){ x.style.transition=""; }, 520);
    }); });
  });
}

/* ── «Empieza aquí»: para quien aún no ha marcado nada; se va sola al completar los tres pasos ── */
function hnGuia(){
  if(S.hnGuiaFuera) return "";
  var algoMarcado=Object.keys(S.chDone||{}).some(function(k){ return (S.chDone[k]||[]).length; }) || Object.keys(S.checks||{}).some(function(k){ return (S.checks[k]||[]).length; });
  var habitos=!!S.hnGuiaHab || Object.keys(S.checks||{}).some(function(k){ return (S.checks[k]||[]).length; });
  var grupo=!!(typeof GRUPO!=="undefined" && GRUPO && GRUPO.real);
  var hechos=(algoMarcado?1:0)+(habitos?1:0)+(grupo?1:0);
  if(hechos>=3 || (algoMarcado && Object.keys(S.chDone||{}).length>3)) return "";
  function paso(ok, n, t, s, attr){
    return '<button class="hn-g-p'+(ok?" ok":"")+'" '+attr+'><i class="num">'+(ok?'<svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7"/></svg>':n)+'</i>'+
      '<span><b>'+t+'</b><small>'+s+'</small></span></button>';
  }
  return '<div class="hn-guia"><div class="hn-g-cab"><p>Empieza aquí</p><button data-act="x-hn-guia-fuera" aria-label="Ocultar">Ocultar</button></div>'+
    paso(algoMarcado, 1, "Marca tu primer reto", "Tócalo en la lista de abajo cuando lo hagas", 'data-act="x-hn-ir" data-k="retos"')+
    paso(habitos, 2, "Elige tus hábitos", "Los que quieres cumplir cada día", 'data-act="x-hn-guia-hab"')+
    paso(grupo, 3, "Únete a un grupo", "Sube la montaña con tus amigos", 'data-jump="social"')+
    '<div class="hn-g-bar"><i style="width:'+Math.round(hechos/3*100)+'%"></i></div></div>';
}
/* en cada pestaña, tu foto a la altura de PEAK. */
function hnAlinea(){
  var af=document.getElementById("acciones-flotantes"); if(!af) return;
  var hd = view==="resumen" ? document.getElementById("hero-date") : document.querySelector("#v-"+view+" p.eyebrow");
  if(!hd || !af.offsetParent){ af.style.top=""; return; }
  /* con offsetTop y no con la posición en pantalla: las entradas animadas aún se mueven */
  var y=0, e=hd, op=af.offsetParent;
  while(e && e!==op){ y+=e.offsetTop; e=e.offsetParent; }
  if(e===op) af.style.top=y+"px";
}

/* el menú de tu foto */
function hnMenu(){
  var m=document.getElementById("hn-menu");
  if(m){ hnMenuCierra(); return; }
  var oscuro=document.documentElement.classList.contains("dark"), p=(typeof perfil!=="undefined" && perfil) || {};
  var nom=p.usuario || (S.profile && S.profile.name) || "Tú";
  var ic=function(d){ return '<svg viewBox="0 0 24 24">'+d+'</svg>'; };
  m=document.createElement("div"); m.id="hn-menu";
  m.innerHTML='<div class="hn-velo"></div><div class="hn-caja" role="menu">'+
    '<button class="hn-yo2" data-act="x-perfil"><span class="hn-yo">'+hnAvatar()+'</span><span><b>'+esc(nom)+'</b><small>Ver tu perfil</small></span></button>'+
    '<button class="hn-op" data-act="x-perfil">'+ic('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>')+'Tu perfil</button>'+
    '<button class="hn-op" data-act="open-settings">'+ic('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>')+'Ajustes</button>'+
    '<div class="hn-op">'+ic('<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/>')+'Modo'+
      '<span class="hn-modo"><button data-act="x-hn-modo" data-th="light"'+(oscuro?'':' class="on"')+'>Claro</button><button data-act="x-hn-modo" data-th="dark"'+(oscuro?' class="on"':'')+'>Oscuro</button></span></div>'+
    '<button class="hn-op hn-mas" data-act="x-hn-temas">'+ic('<circle cx="8" cy="9" r="2"/><circle cx="15" cy="7" r="2"/><circle cx="17" cy="14" r="2"/><path d="M12 21a9 9 0 1 1 9-9c0 2-1.5 3-3.5 3H16a2 2 0 0 0-1.5 3.3A2 2 0 0 1 12 21z"/>')+'Más temas</button>'+
  '</div>';
  document.body.appendChild(m);
  requestAnimationFrame(function(){ m.classList.add("ve"); });
  /* cualquier opción cierra el menú; la acción la hace el manejador de siempre */
  m.addEventListener("click", function(ev){
    if(ev.target.classList.contains("hn-velo")){ hnMenuCierra(); return; }
    var b=ev.target.closest("[data-act]");
    if(b && b.dataset.act!=="x-hn-modo" && b.dataset.act!=="x-hn-temas") setTimeout(hnMenuCierra, 0);
  });
}
function hnMenuCierra(){
  var m=document.getElementById("hn-menu"); if(!m) return;
  m.classList.remove("ve"); setTimeout(function(){ if(m.parentNode) m.parentNode.removeChild(m); }, 220);
}
function hoyNuevoAccion(a, el){
  if(a==="x-hn-yo"){ hnMenu(); return true; }
  if(a==="x-hn-mas"){ hnTodos=!hnTodos; render(); return true; }
  if(a==="x-hn-guia-fuera"){ S.hnGuiaFuera=1; save(); render(); return true; }
  if(a==="x-hn-guia-hab"){ S.hnGuiaHab=1; save(); if(typeof sheetIdeal==="function") sheetIdeal(null); return true; }
  if(a==="x-pn-u"){ abrirPerfil(el.dataset.u); return true; }   /* tu grupo, en Progreso (57) */
  if(typeof cnAccion==="function" && cnAccion(a, el)) return true;   /* Cuerpo (58) */
  if(a==="x-hn-ir"){ var s=document.getElementById(el.dataset.k==="retos"?"hn-retos":"hn-habitos"); if(s) s.scrollIntoView({behavior:"smooth", block:"start"}); return true; }
  if(a==="x-hn-modo"){
    var r=el.getBoundingClientRect(), th=el.dataset.th;
    el.parentNode.querySelectorAll("button").forEach(function(b){ b.classList.toggle("on", b===el); });
    setTimeout(hnMenuCierra, 120);
    setTimeout(function(){ temaConTransicion(th, r.left+r.width/2, r.top+r.height/2); }, 300);
    return true;
  }
  if(a==="x-hn-temas"){
    var yo=document.querySelector("#acciones-flotantes .hn-yo");
    hnMenuCierra(); setTimeout(function(){ temaPicker(yo||el); }, 240); return true;
  }
  return false;
}

var _goHn=go;
go=function(v){ var r=_goHn.apply(this, arguments); requestAnimationFrame(hnAlinea); return r; };

(function(){
  var st=document.createElement("style"); st.id="diseno-hoy-css"; st.textContent=[
':root{ --hn-ac:#0E8A6E; } html.dark{ --hn-ac:#3BE08B; }',
/* lo que ya no va en Hoy */
'html.hoy-n #v-resumen .hy-racha, html.hoy-n #v-resumen #card-ring, html.hoy-n #v-resumen #card-ideal, html.hoy-n #v-resumen #hy-xp,',
'html.hoy-n #v-resumen div:has(> #parte-btn), html.hoy-n #acciones-flotantes > .icon-btn{ display:none !important; }',
'html.hoy-n #hoy{ min-height:0 !important; }',
/* arriba: PEAK. y la racha en grande */
'html.hoy-n #hero-date{ font-size:11px; font-weight:600; letter-spacing:.18em; text-transform:uppercase; color:var(--t3); margin:0; }',
'html.hoy-n #hero-date::before{ content:"PEAK."; display:block; font-family:var(--f-titulo); font-weight:800; font-size:17px; letter-spacing:-.03em;',
'  color:var(--t1); text-transform:none; margin-bottom:34px; line-height:40px; }',
'html.hoy-n #v-resumen #hero-greet{ font-family:var(--f-titulo) !important; font-weight:800 !important; font-size:64px !important; letter-spacing:-.06em !important;',
'  line-height:.92 !important; text-transform:uppercase; margin-top:18px; }',
'html.hoy-n .hn-punto{ color:var(--t3); margin-left:.08em; }',
'html.hoy-n #v-resumen #hero-sub{ display:none; }',
'.hn-r{ padding:16px 0 !important; }',
'.hn-mas{ width:100%; text-align:left; padding:14px 0 0 44px; font-size:14px; font-weight:600; color:var(--t2); }',
'html.hoy-n #v-resumen > div:first-child{ margin-bottom:28px !important; }',
/* tu foto */
'.hn-yo{ width:40px; height:40px; border-radius:50%; overflow:hidden; display:grid; place-items:center; background:var(--t1); color:var(--bg);',
'  font-family:var(--f-titulo); font-weight:700; font-size:16px; box-shadow:0 0 0 2px var(--bg), 0 0 0 3.5px var(--t1); flex:none; }',
'.hn-yo img{ width:100%; height:100%; object-fit:cover; }',
/* Retos · Hábitos · Cuerpo */
'.hn-fila3{ display:grid; grid-template-columns:repeat(3,1fr); border-top:1px solid var(--hairline); border-bottom:1px solid var(--hairline); }',
'.hn-fila3 button{ text-align:left; padding:14px 0; }',
'.hn-fila3 button+button{ padding-left:14px; border-left:1px solid var(--hairline); }',
'.hn-fila3 small{ font-size:11px; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:var(--t3); }',
'.hn-fila3 b{ display:block; font-family:var(--f-titulo); font-weight:700; font-size:24px; letter-spacing:-.04em; margin-top:5px; color:var(--t1); }',
'.hn-fila3 b span{ font:500 13px var(--f-texto); color:var(--t3); margin-left:2px; letter-spacing:0; }',
/* títulos de sección */
'.hn-sec{ display:flex; justify-content:space-between; align-items:baseline; margin:36px 0 12px; scroll-margin-top:80px; }',
'.hn-sec h2{ font-family:var(--f-titulo); font-weight:700; font-size:19px; letter-spacing:-.03em; color:var(--t1); }',
'.hn-sec span, .hn-sec button{ font-size:14px; color:var(--t2); }',
'.hn-sec button{ font-weight:600; color:var(--t1); }',
/* filas numeradas */
'.hn-r{ width:100%; display:grid; grid-template-columns:34px 1fr auto; align-items:center; gap:10px; padding:15px 0; border-bottom:1px solid var(--hairline); text-align:left; }',
'.hn-r i{ font-style:normal; font-family:var(--f-titulo); font-weight:700; font-size:13px; color:var(--t3); }',
'.hn-p{ display:block; font-size:16px; font-weight:500; line-height:1.3; color:var(--t1); }',
'.hn-r small{ display:block; font-size:13px; color:var(--t2); margin-top:2px; }',
'.hn-p{ display:inline; background:linear-gradient(currentColor, currentColor) no-repeat 0 58% / 0 1.5px; -webkit-box-decoration-break:clone; box-decoration-break:clone;',
'  transition:color .3s, background-size .35s cubic-bezier(.4,0,.2,1); }',
'.hn-r.ok .hn-p{ color:var(--t3); background-size:100% 1.5px; }',
'.hn-r.hn-pop .hn-ck{ animation:hnPop .45s cubic-bezier(.3,1.6,.5,1); }',
'.hn-r.hn-pop .hn-ck::after{ animation:hnTick .3s ease-out .05s both; }',
'@keyframes hnPop{ 0%{ transform:scale(.6); } 60%{ transform:scale(1.15); } 100%{ transform:none; } }',
'@keyframes hnTick{ from{ opacity:0; transform:rotate(45deg) scale(.4); } to{ opacity:1; transform:rotate(45deg); } }',
/* la guía */
'.hn-guia{ margin-top:24px; background:var(--tarjeta); border-radius:22px; padding:16px; }',
'.hn-g-cab{ display:flex; justify-content:space-between; align-items:baseline; margin-bottom:6px; }',
'.hn-g-cab p{ font-family:var(--f-titulo); font-weight:700; font-size:17px; letter-spacing:-.03em; }',
'.hn-g-cab button{ font-size:13px; color:var(--t3); font-weight:600; }',
'.hn-g-p{ width:100%; display:flex; align-items:center; gap:12px; padding:10px 0; text-align:left; color:var(--t1); }',
'.hn-g-p + .hn-g-p{ border-top:1px solid var(--hairline); }',
'.hn-g-p i{ width:30px; height:30px; flex:none; border-radius:50%; border:1.5px solid var(--t3); display:grid; place-items:center; font-style:normal; font-family:var(--f-titulo); font-weight:700; font-size:12px; color:var(--t2); }',
'.hn-g-p.ok i{ background:var(--hn-ac); border-color:var(--hn-ac); color:var(--bg); }',
'.hn-g-p i svg{ width:16px; height:16px; fill:none; stroke:currentColor; stroke-width:2.6; stroke-linecap:round; stroke-linejoin:round; }',
'.hn-g-p b{ display:block; font-weight:600; font-size:15px; } .hn-g-p small{ display:block; font-size:12.5px; color:var(--t2); margin-top:1px; }',
'.hn-g-p.ok b{ color:var(--t3); text-decoration:line-through; }',
'.hn-g-bar{ height:4px; border-radius:2px; background:var(--hairline); margin-top:8px; overflow:hidden; }',
'.hn-g-bar i{ display:block; height:100%; background:var(--hn-ac); border-radius:2px; transition:width .5s; }',
/* el verde, con brillo en oscuro */
'.hn-fila3 b.lleno{ color:var(--hn-ac); }',
'.hn-racha{ color:var(--hn-ac); }',
'html.dark .hn-fila3 b.lleno, html.dark .hn-racha, html.dark .hn-r.ok i, html.dark .cn-ok, html.dark .pn-am.me .pn-pos{ text-shadow:0 0 14px rgba(59,224,139,.55); }',
'html.dark .hn-sem .hoy i, html.dark .pn-xp u.ac, html.dark .hn-g-bar i{ box-shadow:0 0 14px rgba(59,224,139,.55), 0 0 2px rgba(59,224,139,.8); }',
'html.dark .hn-sem .hoy em{ color:var(--hn-ac); text-shadow:0 0 10px rgba(59,224,139,.5); }',
'html.dark .pn-hecho{ filter:drop-shadow(0 0 4px rgba(59,224,139,.7)); }',
'.hn-r.ok i{ color:var(--hn-ac); }',
'.hn-ck{ width:26px; height:26px; border-radius:50%; border:1.5px solid var(--t3); position:relative; transition:background .2s, border-color .2s; }',
'.hn-r.ok .hn-ck{ background:var(--t1); border-color:var(--t1); }',
'.hn-r.ok .hn-ck::after{ content:""; position:absolute; left:8.5px; top:4.5px; width:5px; height:10px; border:solid var(--bg); border-width:0 2px 2px 0; transform:rotate(45deg); }',
'.hn-vacio{ width:100%; text-align:left; padding:15px 0; border-bottom:1px solid var(--hairline); color:var(--t2); font-size:15px; }',
/* Parte del día y Estudiar */
'.hn-dos{ display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:36px; }',
'.hn-card{ background:var(--tarjeta); border-radius:20px; padding:16px; min-height:118px; display:flex; flex-direction:column; justify-content:space-between; align-items:flex-start; text-align:left; color:var(--t1); }',
'.hn-card b{ display:block; font-weight:600; font-size:16px; }',
'.hn-card small{ display:block; color:var(--t2); font-size:13px; margin-top:2px; }',
'.hn-ic{ width:34px; height:34px; border-radius:10px; border:1px solid var(--hairline); display:grid; place-items:center; }',
'.hn-ic svg{ width:18px; height:18px; fill:none; stroke:currentColor; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }',
'.hn-card.neg{ background:var(--t1); color:var(--bg); }',
'.hn-card.neg small{ color:color-mix(in srgb, var(--bg) 60%, transparent); }',
'.hn-card.neg .hn-ic{ border-color:color-mix(in srgb, var(--bg) 22%, transparent); }',
'.hn-card.neg.ok{ background:var(--tarjeta); color:var(--t1); } .hn-card.neg.ok small{ color:var(--t2); } .hn-card.neg.ok .hn-ic{ border-color:var(--hairline); }',
/* tu semana */
'.hn-sem{ display:flex; gap:8px; align-items:flex-end; height:112px; border-bottom:1px solid var(--hairline); padding-bottom:0; position:relative; }',
'.hn-sem div{ flex:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; height:100%; position:relative; }',
'.hn-sem em{ font-style:normal; font-size:10.5px; font-weight:600; color:var(--t3); margin-bottom:4px; min-height:13px; }',
'.hn-sem i{ display:block; width:100%; max-width:30px; border-radius:6px 6px 2px 2px; background:var(--hairline); }',
'.hn-sem span{ position:absolute; top:100%; margin-top:8px; font-size:11px; font-weight:600; color:var(--t3); }',
'.hn-sem .on i{ background:var(--t1); } .hn-sem .hoy span, .hn-sem .hoy em{ color:var(--t1); } .hn-sem .hoy i{ background:var(--hn-ac); }',
'.hn-sem + *{ margin-top:30px; }',
'html.hoy-n #hy-evo{ margin-top:36px; }',
/* el menú de tu foto */
'#hn-menu{ position:fixed; inset:0; z-index:80; }',
'.hn-velo{ position:absolute; inset:0; background:rgba(0,0,0,.22); -webkit-backdrop-filter:blur(6px); backdrop-filter:blur(6px); opacity:0; transition:opacity .2s; }',
'.hn-caja{ position:absolute; top:calc(env(safe-area-inset-top) + 72px); right:20px; width:264px; background:var(--tarjeta); border:1px solid var(--hairline); border-radius:22px; padding:8px;',
'  box-shadow:0 20px 50px -12px rgba(0,0,0,.35); transform-origin:top right; transform:scale(.92); opacity:0; transition:transform .25s var(--spring, ease), opacity .2s; }',
'#hn-menu.ve .hn-velo, #hn-menu.ve .hn-caja{ opacity:1; } #hn-menu.ve .hn-caja{ transform:none; }',
'.hn-yo2{ width:100%; display:flex; align-items:center; gap:12px; padding:10px 10px 14px; border-bottom:1px solid var(--hairline); margin-bottom:6px; text-align:left; color:var(--t1); }',
'.hn-yo2 .hn-yo{ width:44px; height:44px; box-shadow:none; }',
'.hn-yo2 b{ display:block; font-weight:600; font-size:16px; } .hn-yo2 small{ font-size:13px; color:var(--t2); }',
'.hn-op{ width:100%; display:flex; align-items:center; gap:12px; padding:12px 10px; border-radius:14px; font-size:15.5px; color:var(--t1); text-align:left; }',
'button.hn-op:active{ background:var(--hairline); }',
'.hn-op > svg{ width:20px; height:20px; fill:none; stroke:var(--t2); stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; flex:none; }',
'.hn-modo{ margin-left:auto; display:flex; background:var(--bg); border-radius:99px; padding:3px; }',
'.hn-modo button{ font-size:12.5px; font-weight:600; padding:5px 10px; border-radius:99px; color:var(--t2); }',
'.hn-modo button.on{ background:var(--t1); color:var(--bg); }',
'.hn-mas{ color:var(--t2); font-size:14.5px; }'
  ].join("\n");
  document.head.appendChild(st);
})();
