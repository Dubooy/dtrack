/* ════════ diseño nuevo · bienvenida y subida de rango (oct 2026) ════════
   Bienvenida: antes de las cuatro preguntas (17) salen el logo animado y
   «¿Cómo te llamas?»; las preguntas pasan a filas con líneas finas y botones de tinta.
   Subida: la celebración de 12 (celebraNivel) pasa a pantalla completa de noche,
   con la montaña del logo, tu punto en el sendero y confeti fino.
   verBienvenida() y verSubida(): para verlas desde Ajustes › Avanzado sin tocar nada. */
var onbPre=null, onbPrueba=false, onbAnim=null;
var _abrirPreguntasBase=abrirPreguntas;
abrirPreguntas=function(fin){
  _abrirPreguntasBase(fin);
  onbPre="intro"; onbPinta(true);
};
var _onbPintaBase=onbPinta;
onbPinta=function(primera){
  var c=document.getElementById("onb"); if(!c) return;
  document.documentElement.classList.add("onb-n");
  if(onbAnim){ try{ onbAnim.stop(); }catch(e){} onbAnim=null; }
  c.classList.toggle("onb-intro", onbPre==="intro");
  if(onbPre==="intro"){
    c.innerHTML='<canvas class="onb-logo" aria-hidden="true"></canvas>'+
      '<div class="onb-cuerpo onb-hola"><h2>Sube tu montaña<span>.</span></h2>'+
        '<p class="onb-s">Hábitos, retos y tu gente. Un día cada vez.</p></div>'+
      '<div class="onb-pie"><button class="onb-main" data-act="x-onb-pre-sig">Empezar</button></div>';
    var cv=c.querySelector(".onb-logo");
    if(window.PeakAnim && window.Path2D && cv){ try{ onbAnim=PeakAnim(cv, { pattern:"despliega", dark:true }); }catch(e){} }
    return;
  }
  if(onbPre==="nombre"){
    var n=(S.profile && S.profile.name) || "";
    c.innerHTML='<div class="onb-top"><span class="onb-ey">Antes de nada</span></div>'+
      '<div class="onb-cuerpo onb-entra"><h2 class="display">¿Cómo te llamas?</h2><p class="onb-s">Para saludarte cada mañana.</p>'+
        '<input id="onb-nombre" class="onb-nombre" maxlength="20" autocapitalize="words" autocomplete="given-name" spellcheck="false" placeholder="Tu nombre" value="'+esc(n)+'"></div>'+
      '<div class="onb-pie"><button class="onb-sec" data-act="x-onb-pre-sig" data-saltar="1">Saltar</button><button class="onb-main" data-act="x-onb-pre-sig">Siguiente</button></div>';
    var inp=c.querySelector("#onb-nombre");
    inp.addEventListener("keydown", function(ev){ if(ev.key==="Enter"){ ev.preventDefault(); onbAccion("x-onb-pre-sig", inp); } });
    return;
  }
  _onbPintaBase(primera);
  /* las metas, sin emoji y numeradas como las listas de Hoy */
  c.querySelectorAll(".onb-grid .onb-op").forEach(function(b, i){
    var e=b.querySelector(".onb-e"); if(e) e.outerHTML='<span class="onb-nn num">'+(i<9?"0":"")+(i+1)+'</span>';
  });
  var g=c.querySelector(".onb-grid"); if(g) g.className="onb-lista onb-metas";
};
var _onbAccionBase=onbAccion;
onbAccion=function(a, el){
  if(a==="x-onb-pre-sig"){
    if(onbPre==="intro"){ onbPre="nombre"; onbPinta(); setTimeout(function(){ var i=document.getElementById("onb-nombre"); if(i) i.focus(); }, 350); return true; }
    if(onbPre==="nombre"){
      var i=document.getElementById("onb-nombre"), v=i ? i.value.trim().slice(0,20) : "";
      if(v && !el.dataset.saltar && !onbPrueba){ if(!S.profile) S.profile={}; S.profile.name=v; save(); }
      onbPre=null; onbPinta(); return true;
    }
  }
  return _onbAccionBase(a, el);
};
var _onbTerminaBase=onbTermina;
onbTermina=function(aplicar){
  if(onbAnim){ try{ onbAnim.stop(); }catch(e){} onbAnim=null; }
  onbPre=null;
  if(onbPrueba){
    onbPrueba=false;
    var c=document.getElementById("onb");
    if(c){ c.classList.remove("ve"); c.classList.add("sale"); setTimeout(function(){ if(c.parentNode) c.parentNode.removeChild(c); }, 420); }
    return;
  }
  return _onbTerminaBase(aplicar);
};
function verBienvenida(){ onbPrueba=true; abrirPreguntas(null); }

/* ── subida de rango a pantalla completa ── */
var _celebraNivelBase=celebraNivel;
celebraNivel=function(nuevo, viejo, lista){
  _celebraNivelBase(nuevo, viejo, lista);
  var capa=document.getElementById("subida-capa"); if(!capa) return;
  capa.classList.add("sb-noche");
  var lv=Math.max(1, Math.min(40, nuevo));
  var fondo=document.createElement("div"); fondo.className="sb-fondo"; fondo.setAttribute("aria-hidden","true");
  var est=""; for(var i=0;i<26;i++) est+='<circle cx="'+((i*137)%350)+'" cy="'+((i*71)%150)+'" r="'+(.5+(i%3)*.35)+'" opacity="'+(.35+(i%4)*.15)+'"/>';
  fondo.innerHTML='<svg class="sb-cielo" viewBox="0 0 350 420" preserveAspectRatio="xMidYMid slice">'+
    '<defs><radialGradient id="sb-cie" cx=".7" cy=".05" r="1"><stop offset="0" stop-color="#22304a"/><stop offset=".6" stop-color="#0d0f16"/><stop offset="1" stop-color="#0A0A0A"/></radialGradient></defs>'+
    '<rect width="350" height="420" fill="url(#sb-cie)"/><g fill="#F3EEE3">'+est+'</g></svg>'+
    '<svg class="sb-tierra" viewBox="0 236 350 184" preserveAspectRatio="xMidYMax slice">'+
    '<defs><pattern id="sb-ry" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><rect width="2" height="6" fill="#F3EEE3" opacity=".2"/></pattern></defs>'+
    '<g class="sb-monte"><path d="M0 420 L120 305 L150 322 L205 250 L240 280 L262 268 L350 360 L350 420Z" fill="#1d2230"/>'+
    '<path d="M205 250 L240 280 L262 268 L350 360 L350 420 L230 420 Z" fill="url(#sb-ry)"/>'+
    '<path d="M40 420 C90 400 150 395 170 370 S150 330 185 315 S215 285 205 256" fill="none" stroke="#F3EEE3" stroke-width="1.6" stroke-dasharray="2 5" opacity=".5"/>'+
    '<path class="sb-hecho" d="M40 420 C90 400 150 395 170 370 S150 330 185 315 S215 285 205 256" fill="none" stroke="#3BE08B" stroke-width="2.5"/>'+
    '<path d="M205 250 V238 L216 242 L205 246" fill="#F3EEE3"/>'+
    '<g class="sb-yo"><circle r="9" fill="#3BE08B" opacity=".25"/><circle r="5" fill="#3BE08B" stroke="#0d0f16" stroke-width="2"/></g></g></svg>'+
    '<canvas class="sb-confeti"></canvas>';
  capa.insertBefore(fondo, capa.firstChild);
  try{
    var p=fondo.querySelector(".sb-hecho"), L=p.getTotalLength(), f0=Math.max(.04, (Math.max(1,viejo)-1)/39), f1=Math.max(.04, (lv-1)/39);
    var yo=fondo.querySelector(".sb-yo");
    function pon(f){ var pt=p.getPointAtLength(L*f); p.style.strokeDasharray=(L*f).toFixed(1)+" "+L.toFixed(1); yo.setAttribute("transform","translate("+pt.x.toFixed(1)+" "+pt.y.toFixed(1)+")"); }
    pon(f0);
    var t0=null; setTimeout(function(){ requestAnimationFrame(function paso(t){ if(t0===null) t0=t; var k=Math.min(1,(t-t0)/1100), e=1-Math.pow(1-k,3); pon(f0+(f1-f0)*e); if(k<1) requestAnimationFrame(paso); }); }, 700);
  }catch(e){}
  setTimeout(function(){ sbConfeti(fondo.querySelector(".sb-confeti"), getComputedStyle(capa).getPropertyValue("--rc")); }, 1000);
};
function sbConfeti(cv, rc){
  if(!cv || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
  var dpr=Math.min(2, window.devicePixelRatio||1), W=cv.clientWidth, H=cv.clientHeight; if(!W||!H) return;
  cv.width=W*dpr; cv.height=H*dpr; var c=cv.getContext("2d"); c.scale(dpr,dpr);
  var cols=["#F3EEE3","#3BE08B",(rc||"").trim()||"#F3EEE3"], ps=[];
  for(var i=0;i<70;i++) ps.push({ x:W/2+(Math.random()-.5)*60, y:H*.32, vx:(Math.random()-.5)*7, vy:-3-Math.random()*7, r:Math.random()*6.3, vr:(Math.random()-.5)*.3, w:2+Math.random()*2, h:7+Math.random()*6, c:cols[i%3] });
  var t0=null;
  requestAnimationFrame(function paso(t){
    if(t0===null) t0=t; var k=(t-t0)/2600; if(!cv.isConnected) return;
    c.clearRect(0,0,W,H);
    ps.forEach(function(p){ p.vy+=.16; p.vx*=.985; p.x+=p.vx; p.y+=p.vy; p.r+=p.vr;
      c.save(); c.globalAlpha=Math.max(0,1-k*k); c.translate(p.x,p.y); c.rotate(p.r); c.fillStyle=p.c; c.fillRect(-p.w/2,-p.h/2,p.w,p.h); c.restore(); });
    if(k<1) requestAnimationFrame(paso); else c.clearRect(0,0,W,H);
  });
}
function verSubida(){
  var st=stats(), lv=Math.max(2, st.lvl||2);
  /* para verla con cambio de rango: el primer nivel de tu rango */
  var n=lv; while(n>2 && rangoDe(n-1).n===rangoDe(n).n) n--;
  var lista=DESBLOQUEOS.filter(function(u){ return u.nv===n; }).map(function(u){ return u.t; });
  celebraNivel(n, n-1, lista);
}

(function(){
  var st=document.createElement("style"); st.id="bienvenida-subida-css"; st.textContent=[
/* bienvenida */
'html.onb-n #onb{ font-family:var(--f-texto); }',
'html.onb-n #onb.onb-intro{ background:#1C1B19; color:#F3EEE3; }',
'.onb-logo{ position:absolute; left:0; right:0; top:8%; width:100%; height:50%; pointer-events:none; }',
'.onb-hola{ display:flex; flex-direction:column; justify-content:flex-end; padding-bottom:12px; position:relative; }',
'.onb-hola h2{ font-family:var(--f-titulo); font-weight:800; font-size:40px; letter-spacing:-.05em; line-height:1.05; color:#F3EEE3; }',
'.onb-hola h2 span{ color:#3BE08B; }',
'.onb-hola .onb-s{ color:rgba(243,238,227,.62); font-size:17px; margin:14px 0 0; }',
'.onb-ey{ font-size:11px; font-weight:600; letter-spacing:.18em; text-transform:uppercase; color:var(--t3); }',
'.onb-intro .onb-ey{ color:rgba(243,238,227,.45); margin-bottom:12px; }',
'html.onb-n .onb-cuerpo h2.display{ font-family:var(--f-titulo); font-weight:800; font-size:34px; letter-spacing:-.05em; line-height:1.05; }',
'html.onb-n .onb-s{ font-weight:500; }',
'.onb-nombre{ width:100%; margin-top:8px; padding:10px 0 12px; border:0; border-bottom:1.5px solid var(--hairline); background:none; color:var(--t1); border-radius:0;',
'  font-family:var(--f-titulo); font-weight:700; font-size:30px; letter-spacing:-.04em; outline:none; }',
'.onb-nombre:focus{ border-bottom-color:var(--t1); }',
'.onb-nombre::placeholder{ color:var(--t3); }',
'html.onb-n .onb-pasos i{ height:3px; background:var(--hairline); }',
'html.onb-n .onb-pasos i.on{ background:var(--t1); }',
'html.onb-n .onb-top span.num{ font-family:var(--f-titulo); font-size:12px; color:var(--t3); }',
/* opciones: filas con línea fina, sin tarjetas */
'html.onb-n .onb-lista{ gap:0; border-top:1px solid var(--hairline); }',
'html.onb-n .onb-op, html.onb-n .onb-op.fila{ flex-direction:row; align-items:center; justify-content:flex-start; gap:14px; min-height:60px; padding:14px 2px; border-radius:0;',
'  background:none; box-shadow:none; border-bottom:1px solid var(--hairline); font-weight:500; font-size:16.5px; color:var(--t1); }',
'html.onb-n .onb-op.fila span{ flex:1; } html.onb-n .onb-op b{ font-weight:600; }',
'html.onb-n .onb-metas .onb-op > span:nth-child(2){ flex:1; }',
'.onb-nn.num{ font-family:var(--f-titulo); font-size:13px; font-weight:700; color:var(--t3); width:22px; }',
'html.onb-n .onb-op i, html.onb-n .onb-grid .onb-op i{ position:static; width:26px; height:26px; box-shadow:inset 0 0 0 1.5px var(--hairline); }',
'html.onb-n .onb-op.on{ background:none; box-shadow:none; }',
'html.onb-n .onb-op.on i{ background:var(--t1); color:var(--bg); transform:none; }',
'html.onb-n .onb-op.on .onb-nn{ color:var(--t1); }',
'html.onb-n .onb-op:active{ transform:none; opacity:.6; }',
/* botones */
'html.onb-n .onb-main{ flex:1; height:56px; border-radius:99px; background:var(--t1); color:var(--bg); font-family:var(--f-texto); font-size:16px; font-weight:600; box-shadow:none; }',
'html.onb-n .onb-main:disabled{ opacity:.3; }',
'html.onb-n .onb-intro .onb-main{ background:#F3EEE3; color:#141414; }',
'html.onb-n .onb-sec{ height:56px; border-radius:99px; background:none; box-shadow:inset 0 0 0 1.5px var(--hairline); color:var(--t1); font-family:var(--f-texto); font-weight:600; }',
/* subida de rango, de noche */
'#subida-capa.sb-noche{ background:#0A0A0A; --bg:#0A0A0A; --t1:#F3EEE3; --t2:rgba(243,238,227,.65); --t3:rgba(243,238,227,.42);',
'  --fill:rgba(243,238,227,.06); --fill-hi:rgba(243,238,227,.12); --hairline:rgba(243,238,227,.1); color:#F3EEE3; overflow:hidden; }',
'.sb-fondo{ position:absolute; inset:0; pointer-events:none; }',
'.sb-cielo{ position:absolute; inset:0; width:100%; height:100%; }',
'.sb-tierra{ position:absolute; left:0; right:0; bottom:0; width:100%; height:30%; }',
'.sb-confeti{ position:absolute; inset:0; width:100%; height:100%; }',
'.sb-monte{ opacity:0; transform:translateY(30px); transition:opacity .8s ease .2s, transform 1s cubic-bezier(.2,.9,.3,1) .2s; }',
'#subida-capa.ve .sb-monte{ opacity:1; transform:none; }',
'.sb-noche .sb-caja{ position:relative; z-index:1; margin-bottom:26vh; }',
'.sb-noche .sb-ey{ font-family:var(--f-texto); font-weight:600; letter-spacing:.18em; color:#3BE08B; }',
'.sb-noche .sb-aro{ width:150px; height:150px; }',
'.sb-noche .sb-n{ font-family:var(--f-titulo); }',
'.sb-noche .sb-t{ font-family:var(--f-titulo); font-size:44px; letter-spacing:-.055em; }',
'.sb-noche .sb-sub{ font-family:var(--f-texto); font-weight:500; }',
'.sb-noche .sb-lista{ background:rgba(10,10,10,.55); -webkit-backdrop-filter:blur(10px); backdrop-filter:blur(10px); box-shadow:inset 0 0 0 1px rgba(243,238,227,.1); }',
'.sb-noche .sb-fila b{ font-family:var(--f-texto); font-weight:600; }',
'.sb-noche .sb-ico{ color:#F3EEE3; background:rgba(243,238,227,.08); }',
'.sb-noche .sb-boton{ background:#F3EEE3; color:#141414; font-family:var(--f-texto); font-weight:600; }'
  ].join("\n"); document.head.appendChild(st);
})();
