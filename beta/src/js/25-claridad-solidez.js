/* ════════════════════════════════════════════════════════════════
   CLARIDAD (sep 2026): cambios que pidió Carlos tras probar la beta.
   · Resumen: sin «Para hoy»; los hábitos van justo debajo de las
     tarjetas. Arriba sale lo que te propusiste anoche en el Parte.
   · Parte, paso 4 «Para mañana»: una nota (algo que no olvidar, algo
     importante o algo que te propones). Mañana se marca: +10 XP.
   · Vital: sin comida; el agua es un toque (guarda 8 = «bien hidratado»,
     así todo lo que contaba «8 o más» sigue igual).
   · Objetivos del mes: el círculo ya no parece una casilla, el tick no
     sale girado, «días restantes» y una celebración al cumplirlos.
   · Tu evolución ya no está en Progreso (se abre desde el Resumen).
   ════════════════════════════════════════════════════════════════ */
var MN_XP=10;
function mananaDe(d){ var m=S.manana && S.manana[d]; return (m && m.t) ? m : null; }
var _mnDayXP=dayXP;
dayXP=function(d, tmap){ var m=mananaDe(d); return _mnDayXP(d, tmap)+((m && m.h) ? MN_XP : 0); };

/* ── el paso del Parte ── */
function mananaPaso(tom){
  var m=mananaDe(tom)||{ t:"" }, ideas=[], vistos={};
  sortTasks(S.tasks.filter(function(t){ return !t.done; })).slice(0,3).forEach(function(t){ var x=t.text.slice(0,60); if(!vistos[x]){ vistos[x]=1; ideas.push(x); } });
  ["Ir a entrenar","Acostarme antes de las 12","Llamar a alguien que quiero"].forEach(function(x){ if(ideas.length<5 && !vistos[x]){ vistos[x]=1; ideas.push(tr(x)); } });
  return '<textarea id="pt-manana" class="field pt-mn" rows="3" maxlength="100" enterkeyhint="done" placeholder="'+esc(tr("Ej. Llevar el chándal, llamar a la abuela, repasar el tema 4…"))+'">'+esc(m.t)+'</textarea>'+
    '<p class="pt-mn-t">'+tr("Ideas")+'</p>'+
    '<div class="pt-mn-ideas">'+ideas.map(function(x){ return '<button data-act="x-mn-idea" data-t="'+esc(x)+'">'+esc(x)+'</button>'; }).join("")+'</div>'+
    '<p class="pt-mn-nota">'+tr("Opcional. Si mañana lo cumples, +10 XP.")+'</p>';
}
function mananaGuarda(txt){
  var tom=addDays(today(),1); if(!S.manana) S.manana={};
  txt=(txt||"").trim().slice(0,100);
  if(!txt){ delete S.manana[tom]; }
  else { var ant=S.manana[tom]; S.manana[tom]={ t:txt, h:!!(ant && ant.t===txt && ant.h) }; }
  /* que no crezca sin fin */
  var ks=Object.keys(S.manana).sort(); while(ks.length>60) delete S.manana[ks.shift()];
  save();
}
document.addEventListener("input", function(ev){
  if(!ev.target || ev.target.id!=="pt-manana") return;
  var v=ev.target.value; clearTimeout(mananaGuarda._t); mananaGuarda._t=setTimeout(function(){ mananaGuarda(v); }, 350);
});
document.addEventListener("keydown", function(ev){ if(ev.target && ev.target.id==="pt-manana" && ev.key==="Enter"){ ev.preventDefault(); ev.target.blur(); } });

/* ── en el Resumen: lo que te propusiste ── */
function pintaMananaHoy(){
  var box=document.getElementById("hoy"); if(!box) return;
  var m=mananaDe(today()), el=document.getElementById("mn-hoy");
  if(!m){ if(el) el.remove(); return; }
  if(!el){ el=document.createElement("div"); el.id="mn-hoy"; }
  var ref=document.getElementById("peg-hoy")||document.getElementById("hy-detalle")||document.getElementById("hoy-anillos");
  if(ref && ref.nextSibling!==el) ref.parentNode.insertBefore(el, ref.nextSibling);
  if(el.dataset.anima==="1") return;
  el.className="mn-card"+(m.h?" hecho":"");
  el.innerHTML='<button class="mn-check" data-act="x-mn-hecho" aria-label="'+esc(tr("Marcar como hecho"))+'"><svg viewBox="0 0 24 24"><path d="M5.5 12.5l4.2 4.2L18.5 7.5"/></svg></button>'+
    '<button class="mn-txt" data-act="x-mn-hecho"><small>'+tr(m.h?"Cumplido":"Anoche te propusiste")+'</small><b>'+esc(m.t)+'</b></button>'+
    '<span class="mn-xp num">+'+MN_XP+' XP</span>';
}
function mananaMarca(){
  var d=today(), m=mananaDe(d); if(!m) return;
  m.h=!m.h; save();
  var el=document.getElementById("mn-hoy");
  if(!m.h || !el){ sonido("des"); render(); return; }
  el.dataset.anima="1"; el.classList.add("hecho","celebra");
  var sm=el.querySelector(".mn-txt small"); if(sm) sm.textContent=tr("Cumplido");
  celebraEn(el.querySelector(".mn-check"), "+"+MN_XP+" XP");
  sonido("semana"); try{ if(navigator.vibrate) navigator.vibrate(18); }catch(e){}
  setTimeout(function(){ el.dataset.anima=""; el.classList.remove("celebra"); render(); }, 1500);
}
/* chispas que salen de un elemento y un «+XP» que sube */
function celebraEn(el, txt){
  if(!el) return;
  var cap=document.createElement("span"); cap.className="cb-chispas";
  var cols=["var(--good)","var(--accent)","var(--gold)","var(--cyan)","var(--violet)"], h="";
  for(var i=0;i<14;i++){ var a=i/14*6.2832+(i%2?.2:0), r=34+(i%3)*12;
    h+='<i style="--x:'+(Math.cos(a)*r).toFixed(1)+'px;--y:'+(Math.sin(a)*r).toFixed(1)+'px;background:'+cols[i%cols.length]+';animation-delay:'+(i%4)*.03+'s"></i>'; }
  if(txt) h+='<b class="num">'+esc(txt)+'</b>';
  cap.innerHTML=h; el.appendChild(cap);
  setTimeout(function(){ if(cap.parentNode) cap.parentNode.removeChild(cap); }, 1400);
}

/* ── Resumen: fuera «Para hoy»; queda un ancla invisible debajo de los hábitos
      para que el experimento y «Tu evolución» sigan colocándose después ── */
pintaParaHoy=function(){
  var ci=document.getElementById("card-ideal"), el=document.getElementById("hy-parahoy");
  if(!el){ el=document.createElement("div"); el.id="hy-parahoy"; }
  el.innerHTML=""; el.className="hy-ancla";
  if(ci && ci.nextSibling!==el) ci.parentNode.insertBefore(el, ci.nextSibling);
};
/* sin relleno: los hábitos van justo debajo de las tarjetas, sin tener que bajar */
hoyAjusta=function(){ var b=document.getElementById("hoy"); if(b) b.style.minHeight=""; };

/* ── Vital: el agua es un toque; sin tendencias de vasos ── */
try{ delete TEND_DEF.water; }catch(e){}
try{ delete VT_DEF.water; }catch(e){}

/* ── Tu evolución: al quitarla de Progreso, se abre desde la tarjeta del Resumen ── */
var _clAbreHist=abrirHistorial;
abrirHistorial=function(){
  var r=_clAbreHist.apply(this, arguments);
  var b=document.querySelector("#hy-evo .he-main"), capa=document.getElementById("hist-capa");
  if(b && capa){ var q=b.getBoundingClientRect(); if(q.width){
    capa.style.setProperty("--ev-top", Math.max(0,q.top)+"px"); capa.style.setProperty("--ev-bot", Math.max(0,window.innerHeight-q.bottom)+"px");
    capa.style.setProperty("--ev-izq", q.left+"px"); capa.style.setProperty("--ev-der", Math.max(0,window.innerWidth-q.right)+"px"); } }
  return r;
};

/* ── Objetivos del mes: más claro y con celebración ──
   Ojo: en cada pintado la tarjeta se dibuja dos veces seguidas (dos módulos la
   llaman), así que se compara siempre con el estado de antes del cambio. */
var mmAntes=null, mmBase=null, mmT=0, mmCel={};
var _clPintaMetas=pintaMetas;
pintaMetas=function(){
  var r=_clPintaMetas.apply(this, arguments);
  var box=document.getElementById("metas-mes"); if(!box) return r;
  var ahoraT=Date.now(); if(ahoraT-mmT>120) mmBase=mmAntes; mmT=ahoraT;
  var ahora={};
  box.querySelectorAll(".mm-meta").forEach(function(f){
    var t=f.querySelector(".mm-t"), id=t?t.dataset.id:""; if(!id) return;
    var ok=f.classList.contains("ok"), arco=f.querySelector(".mm-arco"), fin=arco?parseFloat(arco.getAttribute("stroke-dashoffset")):0;
    /* las metas de marcar: un icono dentro, no una casilla vacía */
    if(f.querySelector('[data-act="x-meta-hecha"]')){ f.classList.add("hecha"); var inn=f.querySelector(".mm-in"); if(inn && !ok) inn.innerHTML=ico("meta"); }
    ahora[id]={ ok:ok, off:fin };
    var antes=mmBase && mmBase[id];
    /* el anillo se llena desde donde estaba, de forma fluida */
    if(arco && antes && Math.abs(antes.off-fin)>.5){
      arco.style.transition="none"; arco.style.strokeDashoffset=antes.off;
      void arco.getBoundingClientRect();
      requestAnimationFrame(function(){ arco.style.transition=""; arco.style.strokeDashoffset=fin; });
    }
    if(antes && !antes.ok && ok){
      f.classList.add("celebra");
      if(!mmCel[id] || ahoraT-mmCel[id]>1500){
        mmCel[id]=ahoraT;
        setTimeout(function(){
          var tt=document.querySelector('#metas-mes .mm-t[data-id="'+id+'"]'), ff=tt&&tt.closest(".mm-meta"); if(!ff) return;
          celebraEn(ff.querySelector(".mm-anillo"), "+"+META_XP+" XP"); sonido("semana"); try{ if(navigator.vibrate) navigator.vibrate([16,40,24]); }catch(e){}
        }, 380);
        setTimeout(function(){ var tt=document.querySelector('#metas-mes .mm-t[data-id="'+id+'"]'), ff=tt&&tt.closest(".mm-meta"); if(ff) ff.classList.remove("celebra"); }, 2200);
      }
    }
  });
  mmAntes=ahora;
  return r;
};

function claridadAccion(a, el){
  if(a==="x-agua"){ var d=el.dataset.day||curDay(), on=(habit(d).water||0)>=8; saludPon(d, "water", on?0:8); sonido(on?"des":"pop"); return true; }
  if(a==="x-mn-idea"){ var i=document.getElementById("pt-manana"); if(i){ i.value=el.dataset.t; mananaGuarda(i.value); } sonido("tick");
    document.querySelectorAll(".pt-mn-ideas button").forEach(function(b){ b.classList.toggle("on", b===el); }); return true; }
  if(a==="x-mn-hecho"){ mananaMarca(); return true; }
  return false;
}

var CLARIDAD_CSS=[
/* Resumen */
'#hy-parahoy.hy-ancla{ display:none; }',
'#hoy #hoy-anillos ~ .hy-dos{ margin-bottom:0; }',
'.mn-card{ position:relative; display:flex; align-items:center; gap:12px; margin:14px 0 4px; padding:12px 14px 12px 12px; border-radius:20px; background:var(--glass-bg);',
'  box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--accent) 30%,transparent), 0 10px 26px -18px color-mix(in srgb,var(--accent) 60%,transparent); transition:box-shadow .5s var(--ease), background .5s var(--ease); }',
'.mn-check{ position:relative; width:40px; height:40px; flex:0 0 auto; border-radius:50%; display:grid; place-items:center; box-shadow:inset 0 0 0 2px color-mix(in srgb,var(--accent) 55%,transparent); transition:background .35s var(--ease), box-shadow .35s var(--ease), transform .45s var(--spring); }',
'.mn-check svg{ width:20px; height:20px; fill:none; stroke:var(--on-accent); stroke-width:3; stroke-linecap:round; stroke-linejoin:round; stroke-dasharray:22; stroke-dashoffset:22; transition:stroke-dashoffset .4s .1s cubic-bezier(.6,0,.2,1); }',
'.mn-txt{ flex:1; min-width:0; text-align:left; } .mn-txt small{ display:block; font-size:11.5px; font-weight:700; letter-spacing:.04em; text-transform:uppercase; color:var(--accent); }',
'.mn-txt b{ display:block; font-size:15.5px; font-weight:700; line-height:1.3; margin-top:2px; transition:color .4s var(--ease); }',
'.mn-xp{ font-size:12px; font-weight:800; color:var(--good); padding:4px 8px; border-radius:99px; background:color-mix(in srgb,var(--good) 14%,transparent); flex:0 0 auto; }',
'.mn-card.hecho{ box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--good) 40%,transparent); background:color-mix(in srgb,var(--good) 7%,var(--glass-bg)); }',
'.mn-card.hecho .mn-check{ background:var(--good); box-shadow:none; } .mn-card.hecho .mn-check svg{ stroke-dashoffset:0; }',
'.mn-card.hecho .mn-txt small{ color:var(--good); } .mn-card.hecho .mn-txt b{ color:var(--t2); } .mn-card.hecho .mn-xp{ opacity:.55; }',
'.mn-card.celebra .mn-check{ animation:clPop .6s var(--spring); } .mn-card.celebra{ animation:clBrillo 1.2s var(--ease); }',
'@keyframes clPop{ 0%{ transform:scale(1); } 30%{ transform:scale(.8); } 70%{ transform:scale(1.18); } 100%{ transform:scale(1); } }',
'@keyframes clBrillo{ 0%{ box-shadow:inset 0 0 0 1.5px var(--good), 0 0 0 0 color-mix(in srgb,var(--good) 45%,transparent); } 100%{ box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--good) 40%,transparent), 0 0 0 16px transparent; } }',
/* chispas */
'.cb-chispas{ position:absolute; left:50%; top:50%; width:0; height:0; pointer-events:none; z-index:5; }',
'.cb-chispas i{ position:absolute; left:-3.5px; top:-3.5px; width:7px; height:7px; border-radius:50%; opacity:0; animation:cbChispa .85s cubic-bezier(.2,.8,.3,1) forwards; }',
'@keyframes cbChispa{ 0%{ opacity:1; transform:translate(0,0) scale(.4); } 70%{ opacity:1; } 100%{ opacity:0; transform:translate(var(--x),var(--y)) scale(1); } }',
'.cb-chispas b{ position:absolute; left:50%; top:-18px; transform:translateX(-50%); white-space:nowrap; font-size:14px; font-weight:800; color:var(--good); animation:cbSube 1.3s var(--ease) forwards; }',
'@keyframes cbSube{ 0%{ opacity:0; transform:translate(-50%,6px) scale(.8); } 25%{ opacity:1; transform:translate(-50%,-6px) scale(1.05); } 100%{ opacity:0; transform:translate(-50%,-34px); } }',
/* Parte: para mañana */
'.pt-mn{ width:100%; min-height:88px; resize:none; font-size:16px; line-height:1.45; }',
'.pt-mn-t{ font-size:11.5px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:var(--t3); margin:16px 0 8px; }',
'.pt-mn-ideas{ display:flex; flex-wrap:wrap; gap:6px; }',
'.pt-mn-ideas button{ padding:8px 12px; border-radius:99px; font-size:13px; font-weight:600; background:var(--fill); box-shadow:inset 0 0 0 1px var(--hairline-2); color:var(--t2); text-align:left; }',
'.pt-mn-ideas button.on{ background:var(--accent); color:var(--on-accent); box-shadow:none; }',
'.pt-mn-nota{ font-size:12.5px; color:var(--t3); margin-top:14px; }',
/* Vital */
'#v-vital .glass:has(#meals-list){ display:none!important; }',
'#water-val{ font-size:14px; font-weight:700; color:var(--t2); transition:all .35s var(--spring); }',
'#water-val.agua-si{ background:color-mix(in srgb,var(--cyan) 20%,transparent)!important; color:color-mix(in srgb,var(--cyan) 75%,var(--t1)); box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--cyan) 45%,transparent)!important; }',
'#water-val:active{ transform:scale(.97); }',
/* Progreso: sin Tu evolución */
'#hist-boton{ display:none!important; }',
/* Objetivos del mes */
'.mm-anillo .mm-in svg{ transform:none; }',
'.mm-meta.hecha .mm-anillo > svg{ display:none; }',
'.mm-meta.hecha .mm-in{ border-radius:50%; background:color-mix(in srgb,var(--accent) 12%,transparent); color:var(--accent); }',
'.mm-meta.hecha .mm-in .ic{ width:22px; height:22px; }',
'.mm-meta.hecha.ok .mm-in{ background:var(--good); } .mm-meta.hecha.ok .mm-in svg{ color:var(--on-accent); }',
'.mm-meta{ position:relative; transition:background .6s var(--ease); border-radius:16px; }',
'.mm-meta.celebra{ animation:mmFondo 2s var(--ease); }',
'.mm-meta.celebra .mm-anillo{ animation:clPop .7s var(--spring) .3s both; }',
'.mm-meta.celebra .mm-in svg{ animation:mmTick .5s .45s var(--spring) both; }',
'.mm-meta.celebra .mm-t{ animation:mmTexto .6s .5s var(--ease) both; }',
'@keyframes mmFondo{ 0%{ background:transparent; } 25%{ background:color-mix(in srgb,var(--good) 14%,transparent); } 100%{ background:transparent; } }',
'@keyframes mmTick{ 0%{ opacity:0; transform:scale(.3) rotate(-20deg); } 100%{ opacity:1; transform:none; } }',
'@keyframes mmTexto{ 0%{ transform:none; } 40%{ transform:translateX(4px); color:var(--good); } 100%{ transform:none; } }',
'.mm-anillo{ overflow:visible; }'
].join("\n");

var _clGA=grupoAccion;
grupoAccion=function(a, el){ if(claridadAccion(a, el)) return true; return _clGA.apply(this, arguments); };
var _clTR=grupoTrasRender;
grupoTrasRender=function(){ var r=_clTR.apply(this, arguments); if(view==="resumen") pintaMananaHoy(); return r; };
(function(){ var st=document.createElement("style"); st.id="claridad-css"; st.textContent=CLARIDAD_CSS; document.head.appendChild(st); })();

/* ════════════════════════════════════════════════════════════════
   SOLIDEZ (sep 2026): la revisión de toda la app.
   · Resumen: una fila con tu nivel, lo que falta para el siguiente y
     el XP de hoy (antes no se veía el XP en ningún sitio al abrir),
     debajo de los hábitos y su gráfica, encima del experimento. Al
     tocarla se abre Progreso.
   · «Compartir mi día» solo sale cuando ya has hecho algo hoy.
   · La barra de abajo cabe en pantallas de 320 px.
   ════════════════════════════════════════════════════════════════ */
function hoyNivelHTML(st){
  var x=dayXP(today(), tasksByDay()), maxNv=st.lvl>=LVL_NAMES.length;
  var dentro=Math.max(0, st.xp-st.lvlFloor), pct=maxNv ? 1 : Math.min(1, dentro/Math.max(1, st.lvlNeed));
  return '<span class="hy-xp-an">'+anilloNivel(st.lvl, 46, pct)+'</span>'+
    '<span class="hy-xp-txt"><b>'+esc(tituloElegido(st.lvl))+'</b>'+
      '<small class="num">'+(maxNv ? tr("Nivel máximo") : tr("Faltan "+Math.max(0, st.lvlNeed-dentro)+" XP para el nivel "+(st.lvl+1)))+'</small>'+
      '<i class="hy-xp-barra"><u style="width:'+(pct*100).toFixed(1)+'%"></u></i></span>'+
    '<span class="hy-xp-hoy'+(x>0?' si':'')+'"><b class="num">+'+x+'</b><small>'+tr("XP hoy")+'</small></span>';
}
/* se coloca la última de todas, cuando ya han encontrado su sitio los hábitos, la
   gráfica y el ancla del experimento: así se queda siempre debajo de una cosa y
   encima de la otra, pase lo que pase en el resto del render de Resumen. */
function sdColocaNivel(st){
  if(view!=="resumen") return;
  var box=document.getElementById("hoy");
  if(box) box.classList.toggle("sin-nada", dayXP(today(), tasksByDay())<=0);
  var ci=document.getElementById("card-ideal"); if(!ci) return;
  st=st||stats();
  var el=document.getElementById("hy-xp");
  if(!el){ el=document.createElement("button"); el.id="hy-xp"; el.className="hy-xp"; el.setAttribute("data-act","x-hoy-nivel"); }
  el.setAttribute("aria-label", tr("Ver tu progreso"));
  el.innerHTML=hoyNivelHTML(st);
  if(ci.nextSibling!==el) ci.parentNode.insertBefore(el, ci.nextSibling);
}
var _sdGTR=grupoTrasRender;
grupoTrasRender=function(){
  var r=_sdGTR.apply(this, arguments);
  sdColocaNivel(arguments[0]);
  return r;
};

/* ── el salto al reaccionar ──
   Reaccionar a algo en la Actividad del grupo repinta toda la pestaña Social
   (rSocial → pintaSocial → innerHTML entero). El botón que acabas de tocar
   desaparece de en medio de ese repintado; si conservaba el foco, el navegador
   decide él solo dónde recolocarlo y, en el peor caso, mueve la pantalla. Se
   evita quitando el foco antes de repintar y devolviendo el scroll exactamente
   donde estaba si aun así se hubiera movido. */
var _sdRSocial=rSocial;
rSocial=function(){
  var col=document.getElementById("social-col");
  var y=window.scrollY, af=document.activeElement;
  if(af && col && col.contains(af)){ try{ af.blur(); }catch(e){} }
  var r=_sdRSocial.apply(this, arguments);
  if(window.scrollY!==y) window.scrollTo(0, y);
  return r;
};
/* ── icono de racha y de logros: hacía falta uno nuevo ── */
try{ if(typeof ICO_B==="object"){
  ICO_B.racha='<path d="M12 2.4c3.8 4.2 6 7.2 6 10.6a6 6 0 0 1-12 0c0-2.1.9-3.8 2.3-5.3-.1 1.5.4 2.5 1.2 3C9.8 7.5 10.6 5 12 2.4z"/>';
  ICO_B.logro='<circle cx="12" cy="8.5" r="5"/><path d="M9 12.8 7 21l5-3 5 3-2-8.2"/>';
} }catch(e){}

/* ── cuánto llevas meditado en total ── */
function meditaTotalMin(){
  var t=0; Object.keys(S.habits||{}).forEach(function(d){ t+=(S.habits[d].medita||0); });
  return t;
}

function solidezAccion(a, el){
  if(a==="x-hoy-nivel"){
    go("retos");
    if(typeof retosCambiaTab==="function") retosCambiaTab("prog");
    /* se baja hasta tu nivel, que está debajo de los retos de hoy */
    setTimeout(function(){ var t=document.getElementById("rt-tabs"); if(!t) return;
      try{ window.scrollTo({ top:Math.max(0, t.getBoundingClientRect().top+window.scrollY-70), behavior:"smooth" }); }catch(e){} }, 120);
    return true;
  }
  return false;
}

/* ── XP justo: tope diario para tareas y hábitos ──
   Antes, apuntar y tachar muchas tareas (o muchos hábitos) daba XP sin fin, y en
   el grupo se compara el nivel. Desde el 29 sep 2026 cuentan como mucho 5 tareas
   (30 XP) y 10 hábitos (40 XP) al día. Los días anteriores no cambian: nadie baja
   de nivel por esto. */
var XP_TOPE_DESDE="2026-09-29", XP_TAREAS_MAX=5, XP_HABITOS_MAX=10;
var _sdDayXP=dayXP;
dayXP=function(d, tmap){
  var x=_sdDayXP(d, tmap);
  if(d<XP_TOPE_DESDE) return x;
  var sobra=Math.max(0, ((tmap&&tmap[d])||0)-XP_TAREAS_MAX)*6 + Math.max(0, checksOf(d).length-XP_HABITOS_MAX)*4;
  if(!sobra) return x;
  return Math.max(0, x-Math.round(sobra*(tripleDone(d)?1.5:1)));
};

/* la celebración dice la verdad: pasado el tope, un ✓ en vez de «+4 XP» */
var _sdCelebra=celebraTick;
celebraTick=function(el, xp, color){
  var hoy=today(), topado=false;
  if(hoy>=XP_TOPE_DESDE && el && el.dataset){
    if(el.dataset.act==="check" && xp===4 && checksOf(el.dataset.day||hoy).length>XP_HABITOS_MAX) topado=true;
    if(el.dataset.act==="toggle" && xp===6 && (tasksByDay()[hoy]||0)>=XP_TAREAS_MAX) topado=true;
  }
  var r=_sdCelebra.call(this, el, topado?0:xp, color);
  if(topado){ var capas=document.querySelectorAll(".tick-capa b"), c=capas[capas.length-1]; if(c) c.textContent="✓"; }
  return r;
};

var SOLIDEZ_CSS=[
'.hy-xp{ width:100%; display:flex; align-items:center; gap:13px; margin-top:24px; padding:12px 14px; border-radius:20px; text-align:left;',
'  background:var(--fill); box-shadow:inset 0 0 0 1px var(--hairline); transition:transform .3s var(--spring); }',
'.hy-xp:active{ transform:scale(.98); }',
'.hy-xp-an{ flex:0 0 auto; display:grid; place-items:center; }',
'.hy-xp-txt{ flex:1; min-width:0; display:flex; flex-direction:column; gap:2px; }',
'.hy-xp-txt b{ font-family:"Plus Jakarta Sans",sans-serif; font-size:15px; font-weight:800; letter-spacing:-.02em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
'.hy-xp-txt small{ font-size:12px; color:var(--t3); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
'.hy-xp-barra{ display:block; height:5px; margin-top:5px; border-radius:99px; overflow:hidden; background:color-mix(in srgb,var(--accent) 14%,transparent); }',
'.hy-xp-barra u{ display:block; height:100%; border-radius:99px; background:var(--accent); transition:width .8s cubic-bezier(.3,.9,.3,1); }',
'.hy-xp-hoy{ flex:0 0 auto; display:flex; flex-direction:column; align-items:flex-end; min-width:54px; }',
'.hy-xp-hoy b{ font-family:"Plus Jakarta Sans",sans-serif; font-size:20px; font-weight:800; letter-spacing:-.03em; color:var(--t3); line-height:1.1; }',
'.hy-xp-hoy.si b{ color:var(--accent); }',
'.hy-xp-hoy small{ font-size:11px; color:var(--t3); font-weight:600; }',
'#hoy.sin-nada #peg-hoy{ display:none!important; }',
/* los iconos delante del número en el perfil (racha, mejor racha, logros, estudio) */
'.pf-cif-ico{ display:block; margin-bottom:3px; }',
'.pf-cif-ico .ic{ width:17px; height:17px; }',
'html.esencial .hy-xp{ border-radius:12px; }',
/* la barra de abajo en móviles de 320 px: los cinco botones caben sin salirse */
'@media (max-width:370px){ .mtab{ width:calc((100vw - 44px) / 5)!important; } }',
/* quien pide menos movimiento en el móvil, lo tiene en toda la app */
'@media (prefers-reduced-motion:reduce){ *, *::before, *::after{ animation-duration:.01ms!important; animation-iteration-count:1!important; transition-duration:.01ms!important; scroll-behavior:auto!important; } }'
].join("\n");

var _sdGA=grupoAccion;
grupoAccion=function(a, el){ if(solidezAccion(a, el)) return true; return _sdGA.apply(this, arguments); };
(function(){ var st=document.createElement("style"); st.id="solidez-css"; st.textContent=SOLIDEZ_CSS; document.head.appendChild(st); })();

/* ════════════════════════════════════════════════════════════════
   EASTER EGG «DUBOY» (sep 2026)
   Si te pones de nombre «Duboy» en tu perfil, los nombres de nivel y las
   frases más visibles (el saludo, el comentario del aro del día y el
   resumen del Parte) pasan a un tono muy vacilón y basto, de coña. Si
   dejas de llamarte así, vuelve todo a la normalidad tal cual estaba.
   Solo existe en español: es una broma interna, no hace falta traducirla
   (si el idioma no es español, no se activa).
   ════════════════════════════════════════════════════════════════ */
var DUBOY_NIVELES=["Noname","Nini","Empanado","Aplatanado","Siesta enjoyer","Recién levantado","Panza",
  "Mileurista","Currante","Espabiladillo","Apañado","Máquina","Sigma","Tiburón",
  "Imparable","Leyenda del insti","El puto amo","Padre de los padres","Final boss","Carlos Duboy"];
var DUBOY_SALUDOS={ madrugada:"Serás noctámbulo o qué", manana:"Buenas, crack", tarde:"Qué pasa, máquina", noche:"A currar o a la cama, tú decides" };
var DUBOY_ANILLO={ alto:"Día de escándalo. Esto es una barbaridad.", medio:"Vas que te sales, dale caña.", bajo:"Vaya cutrez de día, espabila." };
var DUBOY_FRASES={
  cero:"Hoy cero patatero. Menudo desastre.",
  poco:"Cuatro cosillas de nada, vaya tela.",
  normal:"Ni fu ni fa, del montón.",
  flojo:"Día flojísimo, manda narices.",
  bien:"Menudo día, máquina como no hay otra.",
  bestial:"Te has salido del mapa, bestia parda."
};

var duboyOn=false, duboyGuardado=null;
function duboyNombre(){
  if(typeof IDIOMA!=="undefined" && IDIOMA!=="es") return false;   /* la coña es solo en español */
  var u=(typeof perfil!=="undefined" && perfil && perfil.usuario) || (S.profile && S.profile.name) || "";
  return String(u).trim().toLowerCase()==="duboy";
}
function duboyActiva(){
  if(duboyOn) return;
  duboyOn=true;
  duboyGuardado={ niveles:LVL_NAMES.slice(), saludos:{}, anillo:{}, frases:{} };
  Object.keys(DUBOY_SALUDOS).forEach(function(k){ duboyGuardado.saludos[k]=TEXTOS.saludos[k]; TEXTOS.saludos[k]=DUBOY_SALUDOS[k]; });
  Object.keys(DUBOY_ANILLO).forEach(function(k){ duboyGuardado.anillo[k]=TEXTOS.anillo[k]; TEXTOS.anillo[k]=DUBOY_ANILLO[k]; });
  Object.keys(DUBOY_FRASES).forEach(function(k){ duboyGuardado.frases[k]=TEXTOS.parte.frases[k]; TEXTOS.parte.frases[k]=DUBOY_FRASES[k]; });
  /* se cambia el contenido del array, no la variable: así todo lo que ya
     apuntaba a LVL_NAMES (o a TEXTOS.niveles, el mismo array) ve el cambio */
  LVL_NAMES.length=0; Array.prototype.push.apply(LVL_NAMES, DUBOY_NIVELES);
}
function duboyDesactiva(){
  if(!duboyOn) return;
  duboyOn=false;
  if(duboyGuardado){
    Object.keys(duboyGuardado.saludos).forEach(function(k){ TEXTOS.saludos[k]=duboyGuardado.saludos[k]; });
    Object.keys(duboyGuardado.anillo).forEach(function(k){ TEXTOS.anillo[k]=duboyGuardado.anillo[k]; });
    Object.keys(duboyGuardado.frases).forEach(function(k){ TEXTOS.parte.frases[k]=duboyGuardado.frases[k]; });
    LVL_NAMES.length=0; Array.prototype.push.apply(LVL_NAMES, duboyGuardado.niveles);
  }
  duboyGuardado=null;
}
function duboyVigila(){
  var on=duboyNombre();
  if(on && !duboyOn){ duboyActiva(); return true; }
  if(!on && duboyOn){ duboyDesactiva(); return true; }
  return false;
}
/* se comprueba en cada render (barato: dos comparaciones de texto) y, además,
   nada más cambiar el nombre, para que se note al momento */
var _duboyGTR=grupoTrasRender;
grupoTrasRender=function(){ duboyVigila(); return _duboyGTR.apply(this, arguments); };
var _duboyCambiarUsuario=cambiarUsuario;
cambiarUsuario=function(v){
  return _duboyCambiarUsuario.apply(this, arguments).then(function(ok){
    if(ok && duboyVigila()) render();
    return ok;
  });
};

