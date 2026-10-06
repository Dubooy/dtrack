/* ════════════════════════════════════════════════════════════════
   PROGRESO CON LA ESTÉTICA DE LA MONTAÑA (oct 2026)
   En Objetivos › Progreso, la tarjeta de nivel pasa a ser una cabecera
   de noche con estrellas y:
   1 una montaña 3D pequeña que gira despacio (tocarla abre la grande)
   2 el rango como insignia, con una barra de luz hasta el siguiente rango
   3 la racha como una llama que crece (se apaga a 0, dorada desde 30)
   4 «Tu camino» como un sendero que sube y baja, con banderines en los rangos
   5 «Por delante y por detrás de ti»: el amigo justo encima y justo debajo
   6 la XP de hoy, desglosada
   ════════════════════════════════════════════════════════════════ */
function pmXPSuelo(L){
  var acc=0, need=NV_XP_BASE;
  for(var lv=1; lv<L; lv++){ acc+=need; need=Math.round(need*NV_XP_CRECE); }
  return acc;
}

/* ── 1 · la montaña pequeña ── */
var PM_MINI=null;
function pmMini(box){
  if(PM_MINI && PM_MINI.box===box && box.contains(PM_MINI.cv)) return;
  if(PM_MINI) PM_MINI.para();
  if(!M3_MALLA) M3_MALLA=m3Malla();
  var V=M3_MALLA.V, T=M3_MALLA.T, NV=V.length;
  /* la montaña es el fondo de toda la tarjeta: a la derecha, grande; el texto va encima, a la izquierda */
  var cv=document.createElement("canvas"); cv.className="pm-fondo-cv"; cv.setAttribute("aria-hidden", "true");
  box.insertBefore(cv, box.firstChild);
  var W=320, H=260, dpr=Math.min(2, window.devicePixelRatio||1), ctx=cv.getContext("2d");
  function mide(){
    var w=box.clientWidth||320, h=box.clientHeight||260; if(w===W && h===H && cv.width) return;
    W=w; H=h; cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr);
    var ancho=W>=640;
    S=Math.min(H*.5, W*(ancho ? .26 : .42)); CX=W*(ancho ? .8 : .74); CY=H*.5+S*.12;
  }
  var PX=new Float32Array(NV), PY=new Float32Array(NV), PZ=new Float32Array(NV), vis=[];
  var CAM=[]; for(var k=0;k<=160;k++) CAM.push(m3Camino(k/160*40));
  var Lx=-.78, Ly=.5, Lz=.42, ll=Math.hypot(Lx, Ly, Lz); Lx/=ll; Ly/=ll; Lz/=ll;
  var yaw=0, pitch=.34, cY, sY, cP, sP, D=6.5, YC=.95, S=100, CX=200, CY=130;
  mide();
  var raf=0, vivo=true, prev=0, visto=true, o=[0,0,0,0];
  function pr(x, y, z){
    var x1=x*cY-z*sY, z1=x*sY+z*cY, yy=y-YC, y2=yy*cP-z1*sP, z2=yy*sP+z1*cP, f=D/(D-z2);
    o[0]=CX+x1*S*f; o[1]=CY-y2*S*f; o[2]=z2; return o;
  }
  function pinta(){
    var Lz_=mtLuz(), LR=Lz_.rgb.split(",").map(Number), yo=mtYo(), tu=Math.min(40, yo.lvl+yo.pct);
    cY=Math.cos(yaw); sY=Math.sin(yaw); cP=Math.cos(pitch); sP=Math.sin(pitch);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    for(var i=0;i<NV;i++){ var v=V[i]; pr(v[0], v[1], v[2]); PX[i]=o[0]; PY[i]=o[1]; PZ[i]=o[2]; }
    vis.length=0;
    for(i=0;i<T.length;i++){
      var t=T[i], nx1=t.nx*cY-t.nz*sY, nz1=t.nx*sY+t.nz*cY, ny2=t.ny*cP-nz1*sP, nz2=t.ny*sP+nz1*cP;
      if(nz2<-.02) continue;
      t.pl=Math.max(0, nx1*Lx+ny2*Ly+nz2*Lz); t.pd=PZ[t.a]+PZ[t.b]+PZ[t.c]; vis.push(t);
    }
    vis.sort(function(a, b){ return a.pd-b.pd; });
    ctx.lineWidth=.6; ctx.lineJoin="round";
    for(i=0;i<vis.length;i++){
      var q=vis[i], b0=14+96*Math.pow(q.pl, 1.6), r=b0+3, g=b0+4, bl=b0+9;
      var sn=Math.max(0, Math.min(1, (q.h-.55)/.2))*(.3+.7*q.ny);
      if(sn>0){ var nv=130+120*q.pl; r+=(nv-r)*sn; g+=(nv-g)*sn; bl+=(nv+5-bl)*sn; }
      r+=LR[0]*.04; g+=LR[1]*.04; bl+=LR[2]*.04;
      var fo=Math.min(1, Math.pow(Math.max(0, 1-q.rr)*2.6, .8)); r*=fo; g*=fo; bl*=fo;
      var col="rgb("+(r|0)+","+(g|0)+","+(bl|0)+")";
      ctx.fillStyle=col; ctx.strokeStyle=col;
      ctx.beginPath(); ctx.moveTo(PX[q.a], PY[q.a]); ctx.lineTo(PX[q.b], PY[q.b]); ctx.lineTo(PX[q.c], PY[q.c]); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    /* el camino que llevas, de luz, solo por delante de la montaña */
    ctx.save(); ctx.globalCompositeOperation="lighter"; ctx.lineCap="round";
    var fin=Math.round(tu/40*160), em=false;
    ctx.beginPath();
    for(i=0;i<=fin;i++){ var c=CAM[i]; pr(c[0], c[1], c[2]);
      if(o[2]<-.15){ em=false; continue; }
      if(!em){ ctx.moveTo(o[0], o[1]); em=true; } else ctx.lineTo(o[0], o[1]); }
    ctx.strokeStyle="rgba("+Lz_.rgb+",.25)"; ctx.lineWidth=7; ctx.stroke();
    ctx.strokeStyle=Lz_.claro; ctx.lineWidth=1.8; ctx.stroke();
    /* tu punto */
    var m=m3Camino(tu); pr(m[0], m[1], m[2]);
    if(o[2]>-.15){
      var gr=ctx.createRadialGradient(o[0], o[1], 0, o[0], o[1], 12);
      gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(.3, "rgba("+Lz_.rgb+",.85)"); gr.addColorStop(1, "rgba("+Lz_.rgb+",0)");
      ctx.fillStyle=gr; ctx.beginPath(); ctx.arc(o[0], o[1], 12, 0, 6.283); ctx.fill();
    }
    ctx.restore();
  }
  function cuadro(ahora){
    if(!vivo) return;
    var dt=prev ? Math.min(.1, (ahora-prev)/1000) : 0;
    if(!prev || ahora-prev>=40){   /* 25 imágenes por segundo bastan para un fondo */
      prev=ahora; if(!medQuieto()) yaw+=dt*.22; mide(); pinta();
    }
    raf=visto && !document.hidden ? requestAnimationFrame(cuadro) : 0;
  }
  var io=null;
  if(window.IntersectionObserver){
    io=new IntersectionObserver(function(es){ visto=es[0].isIntersecting; if(visto && !raf && vivo){ prev=0; raf=requestAnimationFrame(cuadro); } });
    io.observe(cv);
  }
  function alVolver(){ if(!document.hidden && visto && !raf && vivo){ prev=0; raf=requestAnimationFrame(cuadro); } }
  document.addEventListener("visibilitychange", alVolver);
  yaw=Math.PI/2-m3Camino(mtYo().lvl)[3];
  pinta(); raf=requestAnimationFrame(cuadro);
  PM_MINI={ box:box, cv:cv, para:function(){ vivo=false; cancelAnimationFrame(raf); if(io) io.disconnect(); document.removeEventListener("visibilitychange", alVolver); } };
}

/* ── 2 · el rango como insignia, con la barra de luz ── */
function pmInsignia(st){
  var card=document.getElementById("card-nivel"); if(!card) return;
  var nm=document.getElementById("lvl-name"); if(!nm) return;
  var ins=document.getElementById("pm-rango");
  if(!ins){ ins=document.createElement("div"); ins.id="pm-rango"; nm.parentNode.insertBefore(ins, nm.nextSibling); }
  var r=rangoDe(st.lvl), i=RANGOS.indexOf(r), sig=RANGOS[i+1];
  var html='<span class="pm-escudo" style="--c1:'+r.c+';--c2:'+r.d+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.4 20 5.4v6c0 5-3.4 9-8 10.8C7.4 20.4 4 16.4 4 11.4v-6z"/><path class="pm-esc-b" d="M12 7.2l1.5 3.1 3.4.5-2.5 2.4.6 3.4-3-1.6-3 1.6.6-3.4-2.5-2.4 3.4-.5z"/></svg></span>'+
    '<span class="pm-rango-n" style="--c1:'+r.c+'">'+esc(tr(r.n))+'</span>';
  if(ins.innerHTML!==html) ins.innerHTML=html;

  var nx=document.getElementById("lvl-next"), fila=nx && nx.parentNode;
  if(!fila) return;
  var bar=document.getElementById("pm-barra");
  if(!bar){ bar=document.createElement("div"); bar.id="pm-barra"; bar.innerHTML='<p class="pm-barra-t"></p><div class="pm-barra-v"><i></i></div>'; fila.parentNode.insertBefore(bar, fila.nextSibling); }
  var t=bar.querySelector(".pm-barra-t"), v=bar.querySelector("i");
  if(sig){
    var x0=pmXPSuelo(r.desde), x1=pmXPSuelo(sig.desde), pct=Math.max(0, Math.min(1, (st.xp-x0)/Math.max(1, x1-x0)));
    t.innerHTML=tr("Te faltan")+' <b class="num">'+Math.max(0, x1-st.xp)+' XP</b> '+tr("para")+' <b style="color:'+sig.c+'">'+esc(tr(sig.n))+'</b>';
    v.style.width=(pct*100).toFixed(1)+"%"; v.style.setProperty("--c1", r.c); v.style.setProperty("--c2", sig.c);
  } else {
    t.textContent=tr("Rango máximo: eres Leyenda"); v.style.width="100%"; v.style.setProperty("--c1", r.c); v.style.setProperty("--c2", r.d);
  }
}

/* ── 3 · la racha como llama ── */
function pmLlama(st){
  var n=document.getElementById("st-streak"), caja=n && n.parentNode; if(!caja) return;
  caja.classList.add("pm-racha");
  var ll=caja.querySelector(".pm-llama");
  if(!ll){ ll=document.createElement("span"); ll.className="pm-llama"; ll.setAttribute("aria-hidden", "true");
    ll.innerHTML='<svg viewBox="0 0 24 32"><defs><linearGradient id="pm-ll-g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" class="pm-ll-a"/><stop offset="1" class="pm-ll-b"/></linearGradient></defs>'+
      '<path class="pm-ll-f" d="M12 1c1.2 5.2 8.6 8.8 8.6 17.2A8.6 8.6 0 0 1 3.4 18.2c0-4.3 2.5-6.8 4.2-9 .2 2.6 1.3 4 2.6 4.6C10.2 9 10.5 5 12 1z"/>'+
      '<path class="pm-ll-c" d="M12 14c.8 2.4 4.2 3.8 4.2 7.6a4.2 4.2 0 0 1-8.4 0c0-2.2 1.4-3.4 2.3-4.4.1 1.2.7 1.9 1.3 2.1-.2-2 .1-3.6.6-5.3z"/></svg>';
    caja.insertBefore(ll, caja.firstChild); }
  var r=st.streak||0;
  caja.classList.toggle("apagada", r===0); caja.classList.toggle("dorada", r>=30);
  ll.style.setProperty("--t", (1+Math.min(r, 30)/30*.7).toFixed(2));
}

/* ── 4 · «Tu camino» como sendero ── */
var PM_PASO=84;
function pmY(n){ return Math.round(Math.sin((n-1)*.62)*13); }
function pmSendero(){
  var cm=document.getElementById("camino"); if(!cm) return;
  var pista=cm.querySelector(".cm-pista"); if(!pista) return;
  cm.classList.add("pm-sendero");
  var ps=pista.querySelectorAll(".cm-parada"), N=ps.length;
  if(!pista.querySelector(".pm-via")){
    for(var i=0;i<N;i++){
      ps[i].style.setProperty("--y", pmY(i+1)+"px");
      var rg=ps[i].querySelector(".cm-rango");
      if(rg && rg.textContent.trim() && !rg.querySelector("svg")) rg.insertAdjacentHTML("afterbegin", '<svg viewBox="0 0 12 14" aria-hidden="true"><path d="M2 1v13" stroke="currentColor" stroke-width="1.4" fill="none"/><path d="M2.6 1.4h8l-2 2.6 2 2.6h-8z" fill="currentColor"/></svg>');
    }
    var d="";
    for(i=1;i<=N;i++){
      var x=(i-1)*PM_PASO+PM_PASO/2, y=43+pmY(i);
      if(i===1) d="M"+x+" "+y;
      else { var xp=(i-2)*PM_PASO+PM_PASO/2, yp=43+pmY(i-1); d+=" C"+(xp+PM_PASO/2)+" "+yp+" "+(x-PM_PASO/2)+" "+y+" "+x+" "+y; }
    }
    pista.insertAdjacentHTML("afterbegin", '<svg class="pm-via" width="'+(N*PM_PASO)+'" height="90" viewBox="0 0 '+(N*PM_PASO)+' 90" aria-hidden="true">'+
      '<path class="pm-via-f" d="'+d+'"/><path class="pm-via-h" d="'+d+'" pathLength="1000"/><path class="pm-via-l" d="'+d+'" pathLength="1000"/></svg>');
  }
  /* lo hecho, hasta el nodo en el que estás (contando lo que llevas de él) */
  var yo=pista.querySelector(".cm-parada.yo"), idx=yo ? [].indexOf.call(ps, yo) : -1;
  var pct=yo ? (100-parseFloat(yo.style.getPropertyValue("--off")||"100"))/100 : 0;
  var hecho=idx<0 ? 0 : (idx+Math.max(0, Math.min(1, pct))*.98)/(N-1);
  var off=(1000-Math.min(1, hecho)*1000).toFixed(1);
  pista.querySelectorAll(".pm-via-h, .pm-via-l").forEach(function(p){ p.style.strokeDasharray="1000"; p.style.strokeDashoffset=off; });
}

/* ── 5 y 6 · amigos cerca y la XP de hoy ── */
function pmXPHoy(){
  var d=today(), tm=tasksByDay(), out=[], done=chOf(d).length, tot=done ? todaysChallenges(d).length : 0;
  function mete(n, x){ if(x>0) out.push([n, x]); }
  mete("Retos", done*15);
  mete("Gimnasio", wentGym(d) ? 20 : 0);
  mete("Hábitos", checksOf(d).length*4);
  var h=S.habits[d]||{};
  mete("Salud", (mealCount(d)>=3 ? 8 : 0)+((h.sleep||0)>=7 ? 8 : 0)+((h.water||0)>=8 ? 6 : 0)+(h.screen!=null && h.screen>0 && h.screen<2 ? 6 : 0));
  mete("Tareas", (tm[d]||0)*6);
  mete("Estudio", typeof estudioXP==="function" ? estudioXP(d) : 0);
  var base=dayXP(d, tm), suma=out.reduce(function(a, b){ return a+b[1]; }, 0);
  if(S.retoExtra && S.retoExtra[d]) { mete("Reto extra", 50); suma+=50; }
  if(tot>0 && done>=tot) mete("Los tres de hoy ×1,5", Math.max(0, base-suma));
  var pj=S.pajaros && S.pajaros.d===d ? (S.pajaros.xp||0) : 0;
  mete("Pájaros de la montaña", pj);
  return { total:base+pj, partes:out };
}
function pmExtra(st){
  var cm=document.getElementById("camino"); if(!cm) return;
  var ex=document.getElementById("pm-extra");
  if(!ex){ ex=document.createElement("section"); ex.id="pm-extra"; }
  if(ex.previousElementSibling!==cm) cm.parentNode.insertBefore(ex, cm.nextSibling);
  /* amigos */
  var gente=typeof mtGente==="function" ? mtGente() : [], mi=st.lvl, arriba=null, abajo=null;
  gente.forEach(function(g){ var n=g.nv||1;
    if(n>=mi && (!arriba || n<arriba.nv)) arriba=g;
    else if(n<mi && (!abajo || n>abajo.nv)) abajo=g; });
  function fila(g, por){
    if(!g) return '';
    var dif=Math.abs((g.nv||1)-mi), txt=dif===0 ? tr("A tu altura") : dif+" "+(dif===1 ? tr("nivel") : tr("niveles"))+" "+(por ? tr("por delante") : tr("por detrás"));
    return '<button class="pm-amigo" data-pm-u="'+esc(g.u)+'"><span class="pm-av">'+mtCara(g, 38)+'</span>'+
      '<span class="pm-am-t"><b>'+esc(String(g.u).slice(0, 18))+'</b><small>'+tr("Nivel")+' '+(g.nv||1)+' · '+esc(txt)+'</small></span>'+
      '<span class="pm-am-f '+(por ? 'arr' : 'abj')+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg></span></button>';
  }
  var am=gente.length ? fila(arriba, true)+fila(abajo, false) : '<p class="pm-vacio">'+tr("Cuando estés en un grupo, aquí verás quién va justo por delante y por detrás de ti.")+'</p>';
  /* XP de hoy */
  var xh=pmXPHoy();
  var pt=xh.partes.length ? xh.partes.map(function(p){ return '<li><span>'+esc(tr(p[0]))+'</span><b class="num">+'+p[1]+'</b></li>'; }).join("") :
    '<li class="pm-vacio">'+tr("Aún nada hoy. Marca un hábito o un reto y empieza a sumar.")+'</li>';
  var html='<div class="pm-tarj"><h3 class="pm-tit">'+tr("Por delante y por detrás de ti")+'</h3>'+am+'</div>'+
    '<div class="pm-tarj"><div class="pm-xp-cab"><h3 class="pm-tit">'+tr("XP de hoy")+'</h3><span class="pm-xp-n num">+'+xh.total+'</span></div><ul class="pm-xp">'+pt+'</ul></div>';
  if(ex.dataset.h!==html){ ex.innerHTML=html; ex.dataset.h=html; }
}
document.addEventListener("click", function(e){
  var b=e.target.closest && e.target.closest(".pm-amigo"); if(!b) return;
  if(typeof abrirPerfil==="function") abrirPerfil(b.getAttribute("data-pm-u"));
});

/* el panel de Progreso recoloca la tarjeta y el camino: lo nuestro va siempre justo detrás del camino */
var _pmDiario=pintaTarjetaDiario;
pintaTarjetaDiario=function(){
  var r=_pmDiario.apply(this, arguments);
  var cm=document.getElementById("camino"), ex=document.getElementById("pm-extra");
  if(cm && ex && ex.previousElementSibling!==cm) cm.parentNode.insertBefore(ex, cm.nextSibling);
  return r;
};
var _pmPintaRango=pintaRangoRetos;
pintaRangoRetos=function(st){
  var r=_pmPintaRango.apply(this, arguments);
  try{
    var card=document.getElementById("card-nivel"); if(card) card.classList.add("pm-noche");
    if(card) pmMini(card);
    var s=stats();
    pmInsignia(s); pmLlama(s); pmSendero(); pmExtra(s);
  }catch(e){ if(window.console) console.warn("progreso", e); }
  return r;
};

(function(){ var st=document.createElement("style"); st.textContent=[
/* 7 · cabecera de noche con estrellas, en los dos temas */
'#card-nivel.pm-noche{ position:relative; overflow:hidden; color:#f3eee3; background:radial-gradient(120% 90% at 80% -10%, #2a2f55 0%, #12142a 45%, #07080f 100%) !important; border:0; }',
'#card-nivel.pm-noche::before{ content:""; position:absolute; inset:0; pointer-events:none; opacity:.9;',
'  background-image:radial-gradient(1.2px 1.2px at 12% 18%, #fff, transparent), radial-gradient(1px 1px at 28% 62%, #fff, transparent), radial-gradient(1.4px 1.4px at 46% 12%, #fff, transparent), radial-gradient(1px 1px at 63% 40%, #fff, transparent), radial-gradient(1.2px 1.2px at 78% 22%, #fff, transparent), radial-gradient(1px 1px at 90% 70%, #fff, transparent), radial-gradient(1px 1px at 55% 82%, #fff, transparent), radial-gradient(1.3px 1.3px at 8% 80%, #fff, transparent), radial-gradient(1px 1px at 35% 35%, #fff, transparent), radial-gradient(1px 1px at 70% 90%, #fff, transparent);',
'  animation:pmBrillo 5s ease-in-out infinite alternate; }',
'@keyframes pmBrillo{ from{ opacity:.55; } to{ opacity:1; } }',
'#card-nivel.pm-noche > *{ position:relative; }',
'#card-nivel.pm-noche .t3, #card-nivel.pm-noche .eyebrow{ color:rgba(243,238,227,.62) !important; }',
'#card-nivel.pm-noche #lvl-name{ font-family:Unbounded, var(--font-display, inherit); letter-spacing:-.01em; }',
'#card-nivel.pm-noche #lvl-emblema{ display:none; }',
'#card-nivel.pm-noche{ min-height:300px; cursor:pointer; }',
'.pm-fondo-cv{ position:absolute !important; inset:0; width:100%; height:100%; display:block; pointer-events:none; z-index:0; }',
/* una sombra por la izquierda y por abajo para que el texto se lea sobre la montaña */
'#card-nivel.pm-noche::after{ content:""; position:absolute; inset:0; pointer-events:none; z-index:0; background:linear-gradient(90deg, rgba(7,8,15,.92) 0%, rgba(7,8,15,.7) 42%, rgba(7,8,15,0) 70%), linear-gradient(0deg, rgba(7,8,15,.85) 0%, rgba(7,8,15,0) 38%); }',
'#card-nivel.pm-noche > :not(canvas){ z-index:1; }',
'#card-nivel.pm-noche .min-w-0{ max-width:62%; }',
'@media (min-width:640px){ #card-nivel.pm-noche .min-w-0{ max-width:45%; } }',
'#pm-rango{ display:inline-flex; align-items:center; gap:6px; margin-top:6px; padding:3px 10px 3px 4px; border-radius:99px; background:rgba(255,255,255,.07); box-shadow:inset 0 0 0 1px rgba(255,255,255,.1); }',
'.pm-escudo svg{ width:22px; height:22px; display:block; filter:drop-shadow(0 0 6px var(--c1)); }',
'.pm-escudo path:first-child{ fill:var(--c1); }',
'.pm-escudo .pm-esc-b{ fill:rgba(255,255,255,.85); }',
'.pm-rango-n{ font:700 11px Unbounded, system-ui, sans-serif; letter-spacing:.1em; text-transform:uppercase; color:var(--c1); text-shadow:0 0 10px var(--c1); }',
'#pm-barra{ margin:2px 0 4px; }',
'.pm-barra-t{ font-size:12px; margin:0 0 7px; color:rgba(243,238,227,.75); }',
'.pm-barra-t b{ color:#fff; font-weight:700; }',
'.pm-barra-v{ height:6px; border-radius:99px; background:rgba(255,255,255,.1); overflow:visible; }',
'.pm-barra-v i{ display:block; height:100%; border-radius:99px; background:linear-gradient(90deg, var(--c1), var(--c2)); box-shadow:0 0 10px var(--c1), 0 0 2px #fff; transition:width .8s cubic-bezier(.3,.9,.3,1); min-width:6px; }',
/* 3 · la llama */
'.pm-racha{ display:grid; grid-template-columns:auto auto; column-gap:4px; align-items:end; }',
'.pm-racha .pm-llama{ grid-row:1 / span 2; align-self:center; width:calc(18px * var(--t,1)); transform-origin:50% 100%; animation:pmLlama 1.6s ease-in-out infinite alternate; }',
'.pm-llama svg{ width:100%; height:auto; display:block; filter:drop-shadow(0 0 6px rgba(255,140,40,.7)); }',
'.pm-ll-f{ fill:url(#pm-ll-g); } .pm-ll-c{ fill:#fff3c4; opacity:.9; }',
'.pm-ll-a{ stop-color:#ff5a1f; } .pm-ll-b{ stop-color:#ffb43a; }',
'.pm-racha.dorada .pm-ll-a{ stop-color:#e8a10c; } .pm-racha.dorada .pm-ll-b{ stop-color:#fff1a6; } .pm-racha.dorada .pm-llama svg{ filter:drop-shadow(0 0 9px rgba(255,210,80,.9)); }',
'.pm-racha.apagada .pm-llama{ animation:none; } .pm-racha.apagada .pm-llama svg{ filter:none; opacity:.35; } .pm-racha.apagada .pm-ll-a, .pm-racha.apagada .pm-ll-b{ stop-color:#8a8a8a; } .pm-racha.apagada .pm-ll-c{ opacity:0; }',
'@keyframes pmLlama{ 0%{ transform:scale(1,1) skewX(0); } 50%{ transform:scale(.96,1.05) skewX(-2deg); } 100%{ transform:scale(1.03,.97) skewX(2deg); } }',
/* 4 · el sendero */
'.pm-sendero .cm-pista{ position:relative; padding-bottom:16px; }',
'.pm-sendero .cm-parada{ transform:translateY(var(--y,0)); }',
'.pm-sendero .cm-parada::before{ display:none; }',
'.pm-via{ position:absolute; left:0; top:0; overflow:visible; pointer-events:none; }',
'.pm-via path{ fill:none; stroke-linecap:round; }',
'.pm-via-f{ stroke:var(--hairline, rgba(0,0,0,.12)); stroke-width:3; stroke-dasharray:2 7; }',
'.pm-via-h{ stroke:var(--accent); stroke-width:9; opacity:.18; }',
'.pm-via-l{ stroke:var(--accent); stroke-width:3.5; }',
'.pm-via-h, .pm-via-l{ transition:stroke-dashoffset 1s cubic-bezier(.3,.9,.3,1); }',
'.pm-sendero .cm-rango{ display:inline-flex; align-items:center; gap:3px; }',
'.pm-sendero .cm-rango svg{ width:9px; height:11px; }',
/* 5 y 6 */
'#pm-extra{ display:grid; gap:14px; margin:18px 0 16px; }',
'@media (min-width:700px){ #pm-extra{ grid-template-columns:1fr 1fr; } }',
'.pm-tarj{ background:var(--card, var(--bg)); border-radius:22px; padding:16px; box-shadow:inset 0 0 0 1px var(--hairline, rgba(0,0,0,.08)); min-width:0; }',
'.pm-tit{ font:700 14px Unbounded, system-ui, sans-serif; margin:0 0 10px; letter-spacing:-.01em; }',
'.pm-amigo{ display:flex; align-items:center; gap:12px; width:100%; padding:8px 0; text-align:left; background:none; border:0; color:inherit; font:inherit; cursor:pointer; }',
'.pm-amigo + .pm-amigo{ border-top:1px solid var(--hairline, rgba(0,0,0,.08)); }',
'.pm-av{ width:38px; height:38px; flex:0 0 38px; border-radius:99px; overflow:hidden; display:grid; place-items:center; background:var(--fill-hi, #e8e2d6); }',
'.pm-av img{ width:100%; height:100%; object-fit:cover; }',
'.pm-am-t{ display:flex; flex-direction:column; min-width:0; flex:1; } .pm-am-t b{ font-weight:700; } .pm-am-t small{ font-size:12px; opacity:.65; }',
'.pm-am-f svg{ width:18px; height:18px; fill:none; stroke-width:2.4; stroke-linecap:round; stroke-linejoin:round; }',
'.pm-am-f.arr svg{ stroke:var(--accent); } .pm-am-f.abj svg{ stroke:var(--t3, #888); transform:rotate(180deg); }',
'.pm-vacio{ font-size:13px; opacity:.65; margin:0; line-height:1.45; }',
'.pm-xp-cab{ display:flex; align-items:baseline; justify-content:space-between; }',
'.pm-xp-n{ font:700 22px Unbounded, system-ui, sans-serif; color:var(--accent); }',
'.pm-xp{ list-style:none; margin:0; padding:0; display:grid; gap:7px; }',
'.pm-xp li{ display:flex; justify-content:space-between; font-size:13.5px; } .pm-xp li b{ font-weight:700; color:var(--accent); }',
'@media (prefers-reduced-motion:reduce){ #card-nivel.pm-noche::before, .pm-racha .pm-llama{ animation:none; } }'
].join("\n"); document.head.appendChild(st); })();
/* tocar la cabecera (fuera de sus botones) abre tu montaña grande */
document.addEventListener("click", function(e){
  var c=e.target.closest && e.target.closest("#card-nivel.pm-noche"); if(!c) return;
  if(e.target.closest("button, a, input, [data-act]")) return;
  if(typeof mtAbre==="function"){ if(typeof sonido==="function") sonido("tick"); mtAbre(); }
});
