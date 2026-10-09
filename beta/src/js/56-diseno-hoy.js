/* ════════ diseño nuevo · Hoy (oct 2026) ════════
   Maqueta: diseno/ui-peak/hoy-claro.html. pintaHoy (14) llama a hoyNuevo al final:
   la racha en grande (DÍA N.), Retos · Hábitos · Cuerpo en una fila, los retos y
   los hábitos en listas numeradas (lo hecho, tachado y al final), Parte del día
   y Estudiar, y tu semana en barras.
   Arriba a la derecha va tu foto: abre Tu perfil, Ajustes y Modo.
   Solo funciones: Hoy se pinta antes de que esta pieza llegue a ejecutarse. */

function hnFila(n, txt, sub, hecho, act, id){
  return '<button class="hn-r'+(hecho?' ok':'')+'" data-act="'+act+'" data-id="'+id+'" data-day="'+today()+'">'+
    '<i class="num">'+(n<10?'0':'')+n+'</i><span class="hn-tx"><span class="hn-p">'+esc(txt)+'</span><small>'+sub+'</small></span>'+
    '<b class="hn-ck" aria-hidden="true"></b></button>';
}
/* las tareas hechas bajan al final; el número es el puesto en la lista */
function hnLista(items, hechoDe, act, xp){
  var pend=items.filter(function(x){ return !hechoDe(x); }), ok=items.filter(hechoDe);
  return pend.concat(ok).map(function(x,i){ return hnFila(i+1, x.text, "+"+xp+" XP", hechoDe(x), act, x.id); }).join("");
}
function hnTramos(v, max){
  var s=""; for(var i=0;i<max;i++) s+='<u'+(i<v?' class="on"':'')+'></u>';
  return '<div class="hn-tot" aria-hidden="true">'+s+'</div>';
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
  var dia=["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"][dd.getDay()];

  var hd=document.getElementById("hero-date");
  if(hd) hd.textContent=dia+" "+dd.getDate()+" · "+(racha?"Racha":"Hoy");
  var hg=document.getElementById("hero-greet");
  if(hg) hg.innerHTML=(racha?"Día "+racha:"Hoy")+'<span class="hn-punto">.</span>';

  var sem=resumenSemana(lunesDe(t)), tope=Math.max.apply(null, sem.porDia.concat([1]));
  var barras=sem.dias.map(function(d,i){
    var x=sem.porDia[i];
    return '<div class="'+(d===t?"hoy":x>0?"on":"")+'"><i style="height:'+(x>0?Math.max(10, Math.round(x/tope*64)):6)+'px"></i>'+"LMXJVSD".charAt(i)+'</div>';
  }).join("");

  var est=S.estudio && S.estudio.actual, estSub, estAct="x-estudiar";
  if(est){
    var rest=Math.max(0, est.fin ? est.fin-Date.now() : (est.resto||0)), mm=Math.floor(rest/60000), ss=Math.floor(rest%60000/1000);
    estSub='<b class="num" id="hy-est-t">'+(est.fase==="listo"?"✓":(mm<10?"0":"")+mm+":"+(ss<10?"0":"")+ss)+'</b>'; estAct="x-hoy-estudio";
  } else { var min=estudioMinDia(t); estSub=min ? esc(horasTxt(min))+" hoy" : "Pomodoro · 25 min"; }
  var parteHecho=!!(S.parte && S.parte[t]), hh=new Date().getHours();

  box.innerHTML=
    '<div class="hn-fila3">'+
      '<button data-act="x-hn-ir" data-k="retos"><small>Retos</small><b class="num">'+hechos.length+'<span>/'+retos.length+'</span></b></button>'+
      '<button data-act="x-hn-ir" data-k="habitos"><small>Hábitos</small><b class="num">'+cks.length+'<span>/'+habs.length+'</span></b></button>'+
      '<button data-jump="vital"><small>Cuerpo</small><b class="num">'+sa+'<span>/4</span></b></button>'+
    '</div>'+
    (retos.length ?
    '<div class="hn-sec" id="hn-retos"><h2>Retos de hoy</h2><span>'+hechos.length+' de '+retos.length+'</span></div>'+
    hnTramos(hechos.length, retos.length)+
    hnLista(retos, function(c){ return hechos.indexOf(c.id)>=0; }, "ch", 15) : '')+
    '<div class="hn-sec" id="hn-habitos"><h2>Hábitos</h2><button data-act="edit-ideal">Editar</button></div>'+
    (habs.length ? hnTramos(cks.length, habs.length)+hnLista(habs, function(it){ return cks.indexOf(it.id)>=0; }, "check", 4)
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
}
/* en Hoy, Objetivos y Cuerpo, tu foto a la altura de PEAK.; en las demás pestañas, arriba */
function hnAlinea(){
  var af=document.getElementById("acciones-flotantes"); if(!af) return;
  var hd = view==="resumen" ? document.getElementById("hero-date")
         : (view==="retos" && document.documentElement.classList.contains("obj-n")) ? document.querySelector("#v-retos p.eyebrow")
         : (view==="vital" && document.documentElement.classList.contains("cu-n")) ? document.querySelector("#v-vital p.eyebrow") : null;
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
'html.hoy-n #v-resumen #hero-sub{ font-size:16px; color:var(--t2); margin-top:12px; }',
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
'.hn-tot{ display:flex; gap:4px; margin-bottom:6px; }',
'.hn-tot u{ flex:1; height:4px; border-radius:2px; background:var(--hairline); transition:background .3s; }',
'.hn-tot u.on{ background:var(--t1); }',
/* filas numeradas */
'.hn-r{ width:100%; display:grid; grid-template-columns:34px 1fr auto; align-items:center; gap:10px; padding:15px 0; border-bottom:1px solid var(--hairline); text-align:left; }',
'.hn-r i{ font-style:normal; font-family:var(--f-titulo); font-weight:700; font-size:13px; color:var(--t3); }',
'.hn-p{ display:block; font-size:16px; font-weight:500; line-height:1.3; color:var(--t1); }',
'.hn-r small{ display:block; font-size:13px; color:var(--t2); margin-top:2px; }',
'.hn-r.ok .hn-p{ color:var(--t3); text-decoration:line-through; text-decoration-thickness:1.5px; }',
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
'.hn-sem{ display:flex; gap:8px; align-items:flex-end; height:90px; }',
'.hn-sem div{ flex:1; text-align:center; font-size:11px; font-weight:600; color:var(--t3); }',
'.hn-sem i{ display:block; width:16px; margin:0 auto 6px; border-radius:99px; background:var(--hairline); }',
'.hn-sem .on i{ background:var(--t1); } .hn-sem .hoy{ color:var(--t1); } .hn-sem .hoy i{ background:var(--hn-ac); }',
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
