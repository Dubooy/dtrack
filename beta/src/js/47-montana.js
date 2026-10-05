/* ════════════════════════════════════════════════════════════════
   LA MONTAÑA (oct 2026)
   En Progreso, encima de «Tu camino», el botón «Ver tu montaña» abre a
   pantalla completa una montaña de luz: una línea que sube en zigzag
   con los 40 niveles. En cada pico hay un rango y en la cima pone Peak.
   La luz es del color de acento del tema (si el acento es neutro, como
   en Claro y Oscuro, dorada). Al abrirla, la línea se enciende desde la
   base hasta donde vas tú y salen las caras de la gente de tus grupos
   en su nivel. Solo hay una flecha arriba a la izquierda para volver.
   La gente de los otros grupos se recuerda en este móvil (localStorage
   «peak-monte-gente») cada vez que abres ese grupo, porque el servidor
   solo manda los miembros del grupo activo.
   ════════════════════════════════════════════════════════════════ */
var MT_KEY="peak-monte-gente", MT=null;
var MT_PICOS=[5,10,15,20,25,30,40];

/* ── la gente: el grupo de ahora y los que se recuerdan ── */
function mtLeeCache(){ try{ return JSON.parse(localStorage.getItem(MT_KEY)||"{}")||{}; }catch(e){ return {}; } }
function mtGuardaGrupo(){
  if(!GRUPO || !GRUPO.real || !GRUPO.id || !GRUPO.miembros) return;
  var C=mtLeeCache();
  C[GRUPO.id]={ n:GRUPO.nombre||"", t:Date.now(), m:GRUPO.miembros.map(function(m){
    return { uid:m.uid||"", u:m.usuario, a:m.avatar||"", nv:m.nivel||1 }; }) };
  try{ localStorage.setItem(MT_KEY, JSON.stringify(C)); }catch(e){}
}
var _mtGCargar=gCargar;
gCargar=function(){ return _mtGCargar.apply(this, arguments).then(function(r){ try{ mtGuardaGrupo(); }catch(e){} return r; }); };

function mtGente(){
  var yoU=(GRUPO && GRUPO.yo) || "", yoId=(typeof ses!=="undefined" && ses && ses.uid) || "", vistos={}, out=[];
  function mete(p){
    var k=p.uid || ("u:"+p.u);
    if(!p.u || p.u===yoU || (yoId && p.uid===yoId) || vistos[k]) return;
    vistos[k]=1; out.push(p);
  }
  if(GRUPO && GRUPO.miembros) GRUPO.miembros.forEach(function(m){ mete({ uid:m.uid||"", u:m.usuario, a:m.avatar||"", nv:m.nivel||1 }); });
  if(GRUPO && GRUPO.real){
    var C=mtLeeCache(), sigo=(typeof MIS_GRUPOS!=="undefined" && MIS_GRUPOS.length) ? MIS_GRUPOS.map(function(g){ return g.id; }) : null;
    Object.keys(C).forEach(function(g){ if(sigo && sigo.indexOf(g)<0) return; (C[g].m||[]).forEach(mete); });
  }
  return out;
}

/* ── el color de la luz ── */
function mtHexRgb(h){ var m=/^#?([0-9a-f]{6})$/i.exec(h||""); if(!m) return null; var n=parseInt(m[1],16); return [n>>16, (n>>8)&255, n&255]; }
function mtLuz(){
  var c=mtHexRgb(pegColorVar("--accent", "#e8b32c")) || [232,179,44];
  var mx=Math.max.apply(null,c), mn=Math.min.apply(null,c), sat=mx ? (mx-mn)/mx : 0;
  if(sat<.22) c=[245,196,64];   /* acento neutro (tinta o crema): dorado, como la foto */
  var lum=(c[0]*.299+c[1]*.587+c[2]*.114)/255;
  if(lum<.45){ var k=(.45-lum)/.55+.15; c=c.map(function(v){ return Math.round(v+(255-v)*Math.min(.6,k)); }); }
  var claro=c.map(function(v){ return Math.round(v+(255-v)*.55); });
  return { c:"rgb("+c.join(",")+")", claro:"rgb("+claro.join(",")+")", rgb:c.join(",") };
}

/* ── la forma: 0 es la base, 1…40 los niveles y 41 la cima ── */
function mtForma(W, H){
  /* como una gráfica que sube: cada paso va a la derecha; casi todos suben, alguno baja un poco
     y justo después de cada pico (un rango completo) hay una bajada clara */
  var Ht=Math.max(Math.round(H*1.4), 1050), arriba=150, abajo=110, alt=[0], a=0;
  for(var n=1;n<=41;n++){
    var paso = n===41 ? 2.8 : MT_PICOS.indexOf(n)>=0 ? 2.5 : MT_PICOS.indexOf(n-1)>=0 ? -1.5 : (n%2 ? 1.9 : -.55);
    a+=paso; alt.push(a);
  }
  var min=Math.min.apply(null, alt), max=Math.max.apply(null, alt), P=[];
  for(var k=0;k<=41;k++){
    var x=W*(.11+.69*(k/41)), y=abajo+(Ht-arriba-abajo)*(alt[k]-min)/(max-min);
    P.push({ x:Math.round(x*10)/10, y:Math.round((Ht-y)*10)/10 });
  }
  return { W:W, Ht:Ht, P:P };
}
function mtD(P){ return P.map(function(p,i){ return (i?"L":"M")+p.x+" "+p.y; }).join(""); }
/* dónde vas: entre tu nivel y el siguiente, según lo que llevas */
function mtPunto(F, lvl, pct){
  var a=F.P[lvl], b=F.P[Math.min(40, lvl+1)];
  if(lvl>=40) return { x:a.x, y:a.y };
  return { x:a.x+(b.x-a.x)*pct, y:a.y+(b.y-a.y)*pct };
}
function mtYo(){
  var st=stats(), lvl=Math.max(1, Math.min(40, st.lvl));
  var pct=lvl>=40 ? 0 : Math.max(0, Math.min(1, (st.xp-st.lvlFloor)/Math.max(1, st.lvlNeed)));
  return { lvl:lvl, pct:pct, a:(typeof perfil!=="undefined" && perfil && perfil.avatar) || "", u:(GRUPO && GRUPO.yo) || (typeof perfil!=="undefined" && perfil && perfil.usuario) || "Tú" };
}
function mtCara(p, tam){
  return p.a ? '<img src="'+esc(p.a)+'" alt="">' : '<b style="font-size:'+Math.round(tam*.42)+'px">'+esc((p.u||"?").charAt(0).toUpperCase())+'</b>';
}

/* ── abrir ── */
function mtAbre(){
  mtCierra(true);
  try{ mtGuardaGrupo(); }catch(e){}
  var W=Math.min(window.innerWidth, 560), H=window.innerHeight, F=mtForma(W, H), L=mtLuz(), yo=mtYo(), gente=mtGente();
  var P=F.P, quieto=medQuieto();
  var pYo=mtPunto(F, yo.lvl, yo.pct);
  /* la parte encendida: de la base hasta ti */
  var PB=P.slice(0, yo.lvl+1).concat([pYo]);
  var capa=document.createElement("div"); capa.id="mt-capa"; capa.style.setProperty("--mt", L.c); capa.style.setProperty("--mt-claro", L.claro); capa.style.setProperty("--mt-rgb", L.rgb);
  /* estrellas */
  var est=""; for(var i=0;i<70;i++){ var sx=(i*137.5%100), sy=((i*61.8)%100), r=(i%7===0?1.6:i%3===0?1.1:.7);
    est+='<circle cx="'+(sx*W/100).toFixed(1)+'" cy="'+(sy*F.Ht/100).toFixed(1)+'" r="'+r+'" class="'+(i%4===0?"mt-tit":"")+'" style="animation-delay:-'+(i%9)*.7+'s;opacity:'+(.25+(i%5)*.12).toFixed(2)+'"/>'; }
  /* la ladera: lo que queda debajo de la línea */
  var lad=mtD(P)+"L"+W+" "+P[41].y+"L"+W+" "+F.Ht+"L0 "+F.Ht+"L0 "+P[0].y+"Z";
  var svg='<svg class="mt-svg" width="'+W+'" height="'+F.Ht+'" viewBox="0 0 '+W+' '+F.Ht+'">'+
    '<defs><linearGradient id="mt-lad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba('+L.rgb+',.20)"/><stop offset=".55" stop-color="rgba('+L.rgb+',.05)"/><stop offset="1" stop-color="rgba('+L.rgb+',0)"/></linearGradient>'+
    '<radialGradient id="mt-cima" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="rgba('+L.rgb+',.45)"/><stop offset="1" stop-color="rgba('+L.rgb+',0)"/></radialGradient></defs>'+
    '<g class="mt-est">'+est+'</g>'+
    '<circle cx="'+P[41].x+'" cy="'+P[41].y+'" r="120" fill="url(#mt-cima)" class="mt-halo"/>'+
    '<path d="'+lad+'" fill="url(#mt-lad)" class="mt-ladera"/>'+
    '<path d="'+mtD(P)+'" class="mt-falta"/>'+
    '<path d="'+mtD(PB)+'" class="mt-l mt-l3"/><path d="'+mtD(PB)+'" class="mt-l mt-l2"/><path d="'+mtD(PB)+'" class="mt-l mt-l1"/>'+
    P.map(function(p,n){ if(n<1 || n>40) return ""; var pico=MT_PICOS.indexOf(n)>=0;
      return '<circle cx="'+p.x+'" cy="'+p.y+'" r="'+(pico?5.5:3)+'" class="mt-p'+(pico?" pico":"")+'" data-n="'+n+'"/>'; }).join("")+
    '</svg>';
  /* los rangos en los picos y Peak. en la cima */
  var html="";
  MT_PICOS.forEach(function(n){
    /* el nombre justo encima del pico, hacia la izquierda: ahí la línea siempre va por debajo */
    var p=P[n], r=rangoDe(n), ancho=tr(r.n).length*8.4+18, lx=Math.max(6, p.x+8-ancho);
    html+='<div class="mt-rango'+(yo.lvl>=r.desde?" ya":"")+'" data-n="'+n+'" style="left:'+lx.toFixed(1)+'px;top:'+p.y+'px;width:'+Math.round(ancho)+'px;--rc:'+r.c+'">'+
      '<b>'+esc(tr(r.n))+'</b></div>';
  });
  html+='<div class="mt-cima" style="left:'+P[41].x+'px;top:'+P[41].y+'px"><svg viewBox="'+PEAK_WM_VB+'" aria-label="Peak."><path d="'+PEAK_WM_D+'"/></svg>'+
    '<small>'+(yo.lvl>=40?tr("Has llegado a la cima"):tr("La cima"))+'</small></div>';
  /* la gente, en su nivel (si coinciden, en fila) */
  var porNv={};
  gente.forEach(function(g){ var n=Math.max(1, Math.min(40, g.nv)); (porNv[n]=porNv[n]||[]).push(g); });
  Object.keys(porNv).forEach(function(n){
    var p=P[+n], dir=p.x>W*.6 ? -1 : 1;
    porNv[n].forEach(function(g, i){
      var x=p.x+dir*(8+i*30), y=p.y+34;
      html+='<div class="mt-gente" style="left:'+x.toFixed(1)+'px;top:'+y+'px;animation-delay:'+(i*.08).toFixed(2)+'s"><span class="mt-av">'+mtCara(g, 28)+'</span><small>'+esc(g.u.slice(0,10))+'</small></div>';
    });
  });
  html+='<div class="mt-yo'+(pYo.x>W*.6?" izq":"")+'" style="left:'+pYo.x+'px;top:'+pYo.y+'px"><span class="mt-av">'+mtCara(yo, 40)+'</span>'+
    '<span class="mt-yo-t"><b>'+tr("Tú")+'</b> · '+esc(rangoNombre(yo.lvl))+'</span></div>';
  capa.innerHTML='<div class="mt-scroll"><div class="mt-lienzo" style="width:'+W+'px;height:'+F.Ht+'px">'+svg+html+'</div></div>'+
    '<button class="mt-atras" data-act="x-monte-cierra" aria-label="'+tr("Volver")+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>';
  document.body.appendChild(capa);
  document.documentElement.classList.add("mt-abierta");
  var sc=capa.querySelector(".mt-scroll");
  sc.scrollTop=F.Ht;
  MT={ capa:capa, raf:0, tocado:false };
  sc.addEventListener("touchstart", function(){ if(MT) MT.tocado=true; }, { passive:true });
  sc.addEventListener("wheel", function(){ if(MT) MT.tocado=true; }, { passive:true });
  requestAnimationFrame(function(){ capa.classList.add("ve"); });
  mtAnima(capa, sc, F, PB, yo, quieto, H);
}

/* la línea se enciende desde la base hasta ti, y la vista la sigue */
function mtAnima(capa, sc, F, PB, yo, quieto, H){
  var l1=capa.querySelector(".mt-l1"), ls=capa.querySelectorAll(".mt-l"), puntos=capa.querySelectorAll(".mt-p"), rangos=capa.querySelectorAll(".mt-rango");
  var tot=l1.getTotalLength(), hasta=[0], acc=0;
  for(var i=1;i<PB.length;i++){ acc+=Math.hypot(PB[i].x-PB[i-1].x, PB[i].y-PB[i-1].y); hasta.push(acc); }
  function enciende(len){
    puntos.forEach(function(p){ var n=+p.dataset.n; if(n<PB.length-1 && hasta[n]<=len+.5) p.classList.add("on"); });
    rangos.forEach(function(r){ var n=+r.dataset.n; if(n<PB.length-1 && hasta[n]<=len+.5) r.classList.add("on"); });
  }
  function fin(){
    ls.forEach(function(l){ l.style.strokeDashoffset="0"; });
    enciende(tot); capa.classList.add("listo");
    if(!MT.tocado){ var y=Math.max(0, mtPunto(F, yo.lvl, yo.pct).y-H*.5); if(quieto) sc.scrollTop=y; else try{ sc.scrollTo({ top:y, behavior:"smooth" }); }catch(e){ sc.scrollTop=y; } }
    try{ if(navigator.vibrate) navigator.vibrate(10); }catch(e){}
  }
  ls.forEach(function(l){ l.style.strokeDasharray=tot+" "+(tot+10); l.style.strokeDashoffset=tot; });
  if(quieto || tot<2){ fin(); return; }
  var dur=900+1700*Math.min(1, tot/2400), t0=0;
  function paso(ahora){
    if(!MT || MT.capa!==capa) return;
    if(!t0) t0=ahora+350;   /* un respiro mientras entra la capa */
    var u=Math.max(0, Math.min(1, (ahora-t0)/dur)), e=u<.5 ? 4*u*u*u : 1-Math.pow(-2*u+2,3)/2, len=tot*e;
    ls.forEach(function(l){ l.style.strokeDashoffset=(tot-len).toFixed(1); });
    enciende(len);
    if(!MT.tocado){ var pt=l1.getPointAtLength(len); sc.scrollTop=Math.max(0, pt.y-H*.55); }
    if(u<1) MT.raf=requestAnimationFrame(paso); else fin();
  }
  MT.raf=requestAnimationFrame(paso);
}

function mtCierra(ya){
  if(!MT) return;
  var c=MT.capa; cancelAnimationFrame(MT.raf); MT=null;
  document.documentElement.classList.remove("mt-abierta");
  if(ya){ if(c.parentNode) c.parentNode.removeChild(c); return; }
  c.classList.remove("ve"); setTimeout(function(){ if(c.parentNode) c.parentNode.removeChild(c); }, 320);
}
document.addEventListener("keydown", function(e){ if(MT && e.key==="Escape") mtCierra(); });

/* ── la señal: un botón que brilla encima de «Tu camino» ── */
var _mtPintaCamino=pintaCamino;
pintaCamino=function(){
  var r=_mtPintaCamino.apply(this, arguments);
  var cab=document.querySelector("#camino .cm-cab");
  if(cab && !cab.querySelector(".cm-monte")){
    var b=document.createElement("button"); b.className="cm-monte"; b.setAttribute("data-act","x-monte");
    b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" transform="translate(2.55 2.4) scale(.0211)" d="'+PEAK_MK_D+'"/></svg><span>'+tr("Ver tu montaña")+'</span>';
    cab.appendChild(b);
  }
  return r;
};
var _mtGA=grupoAccion;
grupoAccion=function(a, el){
  if(a==="x-monte"){ sonido("tick"); mtAbre(); return true; }
  if(a==="x-monte-cierra"){ mtCierra(); return true; }
  return _mtGA.apply(this, arguments);
};

(function(){ var st=document.createElement("style"); st.id="montana-css"; st.textContent=[
/* el botón */
'#camino .cm-cab{ flex-wrap:wrap; row-gap:8px; }',
'.cm-monte{ position:relative; overflow:hidden; display:inline-flex; align-items:center; gap:6px; padding:7px 13px 7px 10px; border-radius:99px;',
'  font-size:12.5px; font-weight:700; color:var(--accent); background:var(--accent-soft); box-shadow:inset 0 0 0 1px var(--accent-line); }',
'.cm-monte svg{ width:16px; height:16px; }',
'.cm-monte::after{ content:""; position:absolute; inset:0; background:linear-gradient(100deg, transparent 30%, rgba(255,255,255,.55) 50%, transparent 70%);',
'  transform:translateX(-120%); animation:cmBrillo 3.2s ease-in-out 1s infinite; pointer-events:none; }',
'@keyframes cmBrillo{ 0%,55%{ transform:translateX(-120%); } 80%,100%{ transform:translateX(120%); } }',
'.cm-monte:active{ transform:scale(.96); }',
/* la capa */
'html.mt-abierta, html.mt-abierta body{ overflow:hidden; }',
'#mt-capa{ position:fixed; inset:0; z-index:180; background:radial-gradient(120% 70% at 70% 0%, rgba(var(--mt-rgb),.10), transparent 60%), #050507; color:#fff;',
'  opacity:0; transition:opacity .35s ease; }',
'#mt-capa.ve{ opacity:1; }',
'#mt-capa .mt-scroll{ position:absolute; inset:0; overflow-y:auto; overflow-x:hidden; -webkit-overflow-scrolling:touch; overscroll-behavior:contain; scrollbar-width:none; }',
'#mt-capa .mt-scroll::-webkit-scrollbar{ display:none; }',
'#mt-capa .mt-lienzo{ position:relative; margin:0 auto; }',
'#mt-capa .mt-svg{ position:absolute; inset:0; display:block; overflow:visible; }',
'.mt-est circle{ fill:#fff; } .mt-est .mt-tit{ animation:mtTit 3.2s ease-in-out infinite; }',
'@keyframes mtTit{ 50%{ opacity:.08; } }',
'.mt-halo{ animation:mtLatido 4s ease-in-out infinite; transform-box:fill-box; transform-origin:center; }',
'@keyframes mtLatido{ 50%{ opacity:.55; transform:scale(.88); } }',
'.mt-falta{ fill:none; stroke:rgba(var(--mt-rgb),.30); stroke-width:1.6; stroke-dasharray:2 7; stroke-linecap:round; stroke-linejoin:round; }',
'.mt-l{ fill:none; stroke-linecap:round; stroke-linejoin:round; }',
'.mt-l3{ stroke:rgba(var(--mt-rgb),.16); stroke-width:16; }',
'.mt-l2{ stroke:rgba(var(--mt-rgb),.38); stroke-width:6.5; }',
'.mt-l1{ stroke:var(--mt-claro); stroke-width:2.4; }',
'.mt-p{ fill:#050507; stroke:rgba(var(--mt-rgb),.35); stroke-width:1.5; transition:fill .4s ease, stroke .4s ease; }',
'.mt-p.on{ fill:var(--mt-claro); stroke:var(--mt); }',
'.mt-p.pico.on{ filter:drop-shadow(0 0 6px var(--mt)); }',
/* rangos */
'.mt-rango{ position:absolute; transform:translateY(calc(-100% - 12px)); display:flex; justify-content:flex-end; pointer-events:none; opacity:.4; transition:opacity .6s ease; }',
'.mt-rango b{ display:flex; align-items:center; gap:6px; font-family:"Plus Jakarta Sans",sans-serif; font-size:11px; font-weight:800; letter-spacing:.14em; text-transform:uppercase; white-space:nowrap; color:rgba(255,255,255,.75); }',
'.mt-rango b::before{ content:""; width:6px; height:6px; border-radius:99px; background:var(--rc); }',
'.mt-rango.on{ opacity:1; } .mt-rango.on b{ color:#fff; text-shadow:0 0 12px var(--rc); } .mt-rango.on b::before{ box-shadow:0 0 8px var(--rc); }',
/* la cima */
'.mt-cima{ position:absolute; transform:translate(-50%,-100%); margin-top:-16px; display:flex; flex-direction:column; align-items:center; gap:6px; pointer-events:none; }',
'.mt-cima svg{ width:138px; height:auto; fill:var(--mt-claro); filter:drop-shadow(0 0 10px var(--mt)) drop-shadow(0 0 26px rgba(var(--mt-rgb),.6)); animation:mtCima 3.6s ease-in-out infinite; }',
'@keyframes mtCima{ 50%{ filter:drop-shadow(0 0 6px var(--mt)) drop-shadow(0 0 14px rgba(var(--mt-rgb),.35)); } }',
'.mt-cima small{ font-size:10.5px; font-weight:700; letter-spacing:.2em; text-transform:uppercase; color:rgba(255,255,255,.55); }',
/* la gente y tú */
'.mt-av{ display:grid; place-items:center; overflow:hidden; border-radius:99px; background:#1b1b20; color:#fff; }',
'.mt-av img{ width:100%; height:100%; object-fit:cover; display:block; }',
'.mt-gente{ position:absolute; transform:translate(-50%,-50%) scale(.4); opacity:0; display:flex; flex-direction:column; align-items:center; gap:3px; pointer-events:none; }',
'.mt-gente .mt-av{ width:28px; height:28px; box-shadow:0 0 0 2px #050507, 0 0 0 3.5px rgba(var(--mt-rgb),.55); }',
'.mt-gente small{ font-size:10px; font-weight:600; color:rgba(255,255,255,.7); max-width:64px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }',
'#mt-capa.listo .mt-gente{ animation:mtSale .5s cubic-bezier(.3,1.5,.5,1) forwards; }',
'.mt-yo{ position:absolute; transform:translate(-20px,-50%) scale(.3); opacity:0; display:flex; align-items:center; gap:8px; pointer-events:none; z-index:2; }',
'.mt-yo .mt-av{ position:relative; width:40px; height:40px; box-shadow:0 0 0 2.5px #050507, 0 0 0 5px var(--mt-claro), 0 0 26px 4px rgba(var(--mt-rgb),.7); }',
'.mt-yo::before{ content:""; position:absolute; left:0; top:50%; width:40px; height:40px; margin-top:-20px; border-radius:99px; border:2px solid var(--mt); animation:mtOnda 2s ease-out infinite; }',
'@keyframes mtOnda{ from{ transform:scale(1); opacity:.8; } to{ transform:scale(2.3); opacity:0; } }',
'.mt-yo-t{ padding:4px 10px; border-radius:99px; font-size:11.5px; color:#fff; white-space:nowrap; background:rgba(var(--mt-rgb),.22); box-shadow:inset 0 0 0 1px rgba(var(--mt-rgb),.5); }',
'#mt-capa.listo .mt-yo{ animation:mtSaleYo .6s cubic-bezier(.3,1.6,.5,1) forwards; }',
'.mt-yo.izq{ flex-direction:row-reverse; transform:translate(calc(-100% + 20px),-50%) scale(.3); } .mt-yo.izq::before{ left:auto; right:0; }',
'#mt-capa.listo .mt-yo.izq{ animation-name:mtSaleYoI; }',
'@keyframes mtSaleYoI{ to{ opacity:1; transform:translate(calc(-100% + 20px),-50%) scale(1); } }',
'@keyframes mtSaleYo{ to{ opacity:1; transform:translate(-20px,-50%) scale(1); } }',
'@keyframes mtSale{ to{ opacity:1; transform:translate(-50%,-50%) scale(1); } }',
/* la flecha */
'.mt-atras{ position:absolute; z-index:3; left:14px; top:calc(env(safe-area-inset-top) + 12px); width:42px; height:42px; border-radius:99px; display:grid; place-items:center; color:#fff;',
'  background:rgba(255,255,255,.10); box-shadow:inset 0 0 0 1px rgba(255,255,255,.14); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); }',
'.mt-atras svg{ width:22px; height:22px; } .mt-atras:active{ transform:scale(.92); }',
'@media (prefers-reduced-motion:reduce){ .mt-est .mt-tit, .mt-halo, .mt-cima svg, .mt-yo::before, .cm-monte::after{ animation:none!important; } }'
].join("\n"); document.head.appendChild(st); })();
