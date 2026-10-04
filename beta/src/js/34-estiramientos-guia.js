/* ── modo guiado: un estiramiento por pantalla, con cuenta atrás, y pasa solo al siguiente ──
   Antes de cada estiramiento hay unos segundos para colocarse. La voz dice cuál toca,
   cuándo cambiar de lado y cuándo acaba; los pitidos marcan los tres últimos segundos.
   La pantalla no se apaga mientras dura. */
var GUIA=null, guiaWake=null;
var GUIA_PREP=5;   /* segundos para colocarse antes de cada estiramiento */
function guiaPasoDoble(p){ return /por (lado|pierna)/.test(p.d); }
function guiaVozOn(){ return prefs().guiaVoz!==false; }
function guiaHabla(txt){ if(guiaVozOn() && typeof medHabla==="function") medHabla(txt); }
/* pitidos propios: suenan aunque los sonidos de la app estén apagados, y se callan con la voz */
SONIDOS.cuenta=[{f:880,d:.09,g:.05}];
SONIDOS.ya=[{f:1320,d:.28,g:.05},{f:660,d:.28,g:.015}];
function guiaPita(k){
  if(!guiaVozOn()) return;
  var P=SONIDOS[k]; if(!P) return;
  try{
    var C=window.AudioContext||window.webkitAudioContext; if(!C) return;
    if(!SND_CTX) SND_CTX=new C();
    if(SND_CTX.state==="suspended") SND_CTX.resume();
    var t0=SND_CTX.currentTime+0.012;
    P.forEach(function(n){ sndNota(t0+(n.t||0), n); });
  }catch(e){}
}
function guiaDespierta(){
  try{ if(navigator.wakeLock && !guiaWake) navigator.wakeLock.request("screen").then(function(w){ guiaWake=w; w.addEventListener("release",function(){ guiaWake=null; }); }).catch(function(){}); }catch(e){}
}
function guiaDuerme(){ try{ if(guiaWake) guiaWake.release(); }catch(e){} guiaWake=null; }
/* al volver a la app el sistema suelta el bloqueo de pantalla: se pide otra vez */
document.addEventListener("visibilitychange", function(){ if(GUIA && !GUIA.hecho && document.visibilityState==="visible") guiaDespierta(); });
function guiaEmpieza(k){
  closeSheet();
  GUIA={ r:estiraRutina(k), i:0, fin:0, resta:0, pausa:false, tm:0, cambio:false, prep:false, seg:0 };
  var c=document.getElementById("guia");
  if(!c){ c=document.createElement("div"); c.id="guia"; document.body.appendChild(c); }
  c.hidden=false; document.documentElement.classList.add("guia-abierta");
  guiaDespierta();
  guiaPaso(0);
  GUIA.tm=setInterval(guiaTic, 100);
}
/* va al estiramiento i empezando por los segundos para colocarse */
function guiaPaso(i){
  var r=GUIA.r; if(i<0) i=0;
  if(i>=r.pasos.length){ guiaFin(); return; }
  var p=r.pasos[i];
  GUIA.i=i; GUIA.cambio=false; GUIA.prep=GUIA_PREP>0;
  GUIA.resta=(GUIA.prep?GUIA_PREP:p.s)*1000; GUIA.fin=Date.now()+GUIA.resta; GUIA.seg=Math.ceil(GUIA.resta/1000);
  guiaPinta(); sonido("tick");
  guiaHabla((i?"Siguiente: ":"Primero: ")+p.t+"."+(guiaPasoDoble(p)?" Empieza por el lado derecho.":""));
  if(!GUIA.prep) guiaHabla("Ya.");
}
/* se acaba la preparación: empieza a contar el estiramiento sin volver a pintar la figura */
function guiaArranca(){
  var p=GUIA.r.pasos[GUIA.i];
  GUIA.prep=false; GUIA.resta=p.s*1000; GUIA.fin=Date.now()+GUIA.resta; GUIA.seg=p.s;
  guiaPita("ya");
  var c=document.getElementById("guia"); if(c) c.classList.remove("prep");
  guiaPonFase();
}
function guiaTic(){
  if(!GUIA || GUIA.pausa || GUIA.hecho) return;
  var p=GUIA.r.pasos[GUIA.i], total=(GUIA.prep?GUIA_PREP:p.s)*1000, resta=Math.max(0, GUIA.fin-Date.now());
  GUIA.resta=resta;
  var seg=Math.ceil(resta/1000);
  if(seg!==GUIA.seg){ GUIA.seg=seg; if(seg>=1 && seg<=3) guiaPita("cuenta"); }
  if(!GUIA.prep && guiaPasoDoble(p) && !GUIA.cambio && resta<=total/2){ GUIA.cambio=true; sonido("pop"); guiaHabla("Cambia de lado."); guiaPonFase(); }
  var s=document.querySelector("#guia .gu-seg"); if(s) s.textContent=seg;
  var arco=document.querySelector("#guia .gu-arco"); if(arco) arco.style.strokeDashoffset=(GUIA_C*(1-resta/total)).toFixed(1);
  if(resta<=0){ if(GUIA.prep) guiaArranca(); else guiaPaso(GUIA.i+1); }
}
/* la fase, en grande encima del nombre */
function guiaFase(){
  if(!GUIA) return "";
  if(GUIA.prep) return "Preparados";
  return GUIA.cambio ? "Cambia de lado" : "Estira";
}
var GUIA_R=88, GUIA_C=2*Math.PI*GUIA_R;
var GUIA_ICO_ATRAS='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
var GUIA_ICO_SIGUE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';
var GUIA_ICO_X='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
function guiaPinta(){
  var c=document.getElementById("guia"); if(!c||!GUIA) return;
  var r=GUIA.r, p=r.pasos[GUIA.i], total=(GUIA.prep?GUIA_PREP:p.s)*1000;
  var quieto=typeof medQuieto==="function" && medQuieto();
  c.classList.toggle("prep", GUIA.prep); c.classList.toggle("pausa", GUIA.pausa);
  c.innerHTML='<div class="gu-top"><div class="gu-barras">'+r.pasos.map(function(x,j){ return '<i class="'+(j<GUIA.i?"hecha":j===GUIA.i?"ahora":"")+'"></i>'; }).join("")+'</div>'+
      '<div class="gu-fila">'+guiaBotonVoz()+'<button data-act="x-gu-cierra" aria-label="Cerrar">'+GUIA_ICO_X+'</button></div></div>'+
    '<div class="gu-cab"><p class="gu-fase">'+guiaFase()+'</p>'+
      '<div class="gu-nombre"><h2>'+esc(p.t)+'</h2><button class="gu-ayuda" data-act="x-gu-info" aria-label="Cómo se hace">?</button></div></div>'+
    '<div class="gu-escena"><canvas class="gu-3d"></canvas></div>'+
    '<div class="gu-mandos">'+
      '<button class="gu-b" data-act="x-gu-atras" aria-label="Anterior"'+(GUIA.i?'':' disabled')+'>'+GUIA_ICO_ATRAS+'</button>'+
      '<button class="gu-reloj" data-act="x-gu-pausa" aria-label="'+(GUIA.pausa?"Seguir":"Pausa")+'"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="'+GUIA_R+'" class="gu-pista"/>'+
        '<circle cx="100" cy="100" r="'+GUIA_R+'" class="gu-arco" stroke-dasharray="'+GUIA_C.toFixed(1)+'" stroke-dashoffset="'+(GUIA_C*(1-GUIA.resta/total)).toFixed(1)+'" transform="rotate(-90 100 100)"/></svg>'+
        '<b class="gu-seg num">'+Math.ceil(GUIA.resta/1000)+'</b></button>'+
      '<button class="gu-b" data-act="x-gu-sigue" aria-label="Siguiente">'+GUIA_ICO_SIGUE+'</button>'+
    '</div>';
  if(GUIA.vivo) GUIA.vivo.para();
  GUIA.vivo=maniquiVivo(c.querySelector(".gu-3d"), p.f, quieto, guiaPasoDoble(p) ? function(){ return GUIA && GUIA.cambio; } : null);
}
function guiaPonFase(){ var f=document.querySelector("#guia .gu-fase"); if(f) f.textContent=guiaFase(); }
function guiaBotonVoz(){
  var on=guiaVozOn();
  return '<button data-act="x-gu-voz" class="gu-voz'+(on?"":" off")+'" aria-pressed="'+on+'" aria-label="'+(on?"Silenciar la voz":"Activar la voz")+'">'+MED_ICO_VOZ+'</button>';
}
function guiaPausa(){
  if(!GUIA) return;
  if(GUIA.pausa){ GUIA.pausa=false; GUIA.fin=Date.now()+GUIA.resta; } else { GUIA.pausa=true; GUIA.resta=Math.max(0, GUIA.fin-Date.now()); try{ speechSynthesis.cancel(); }catch(e){} }
  var b=document.querySelector("#guia .gu-reloj"); if(b) b.setAttribute("aria-label", GUIA.pausa?"Seguir":"Pausa");
  var c=document.getElementById("guia"); if(c) c.classList.toggle("pausa", GUIA.pausa);
}
/* al terminar: si la rutina está entre tus hábitos, se marca la de hoy */
function guiaFin(){
  var r=GUIA.r, tx=estiraHabito(r).toLowerCase(), hab=null;
  idealTodos().forEach(function(x){ if(String(x.text||"").toLowerCase()===tx) hab=x; });
  var marcado=false;
  if(hab){ var t=today(); if(!S.checks[t]) S.checks[t]=[]; if(S.checks[t].indexOf(hab.id)<0){ S.checks[t].push(hab.id); save(); marcado=true; } }
  GUIA.hecho=true; sonido("pop"); guiaPita("ya"); guiaHabla("Rutina hecha. Buen trabajo."); guiaDuerme(); if(GUIA.vivo){ GUIA.vivo.para(); GUIA.vivo=null; }
  var c=document.getElementById("guia"); if(!c) return;
  c.innerHTML='<div class="gu-top"><div class="gu-fila"><span>'+esc(r.t)+'</span><button data-act="x-gu-cierra" aria-label="Cerrar">'+
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div></div>'+
    '<div class="gu-final"><span class="gu-ok">'+ICON_CHECK+'</span><h2 class="display">Rutina hecha</h2>'+
      '<p>'+estiraMin(r)+' minutos, '+r.pasos.length+' estiramientos.'+(marcado?' La he marcado en tus hábitos de hoy.':hab?' Ya estaba marcada hoy.':'')+'</p>'+
      (hab?'':'<button class="btn btn-primary w-full !py-3 mt-5" data-act="x-gu-habito">Añadirla a mis hábitos</button>')+
      '<button class="btn btn-quiet w-full !py-3 mt-2" data-act="x-gu-cierra">Cerrar</button></div>';
}
function guiaCierra(){
  guiaInfoCierra(true);
  if(GUIA && GUIA.tm) clearInterval(GUIA.tm);
  if(GUIA && GUIA.vivo) GUIA.vivo.para();
  if(GUIA && guiaVozOn()){ try{ speechSynthesis.cancel(); }catch(e){} }
  guiaDuerme();
  GUIA=null;
  var c=document.getElementById("guia"); if(c){ c.hidden=true; c.innerHTML=""; }
  document.documentElement.classList.remove("guia-abierta");
  render();
}
function guiaAccion(a){
  if(a==="x-gu-info-cierra"){ guiaInfoCierra(); return true; }
  if(a==="x-gu-cierra"){ guiaCierra(); return true; }
  if(!GUIA) return false;
  if(a==="x-gu-pausa"){ guiaPausa(); return true; }
  if(a==="x-gu-info"){ guiaInfo(); return true; }
  if(a==="x-gu-info-cierra"){ guiaInfoCierra(); return true; }
  if(a==="x-gu-voz"){ var on=!guiaVozOn(); prefPon("guiaVoz", on); if(!on){ try{ speechSynthesis.cancel(); }catch(e){} }
    var vb=document.querySelector("#guia .gu-voz"); if(vb) vb.outerHTML=guiaBotonVoz(); return true; }
  /* siguiente: si aún te estás colocando, empieza ya; si no, pasa al próximo */
  if(a==="x-gu-sigue"){ var pz=GUIA.pausa; GUIA.pausa=false; if(GUIA.prep){ guiaArranca(); if(pz){ var cg=document.getElementById("guia"); if(cg) cg.classList.remove("pausa"); } } else guiaPaso(GUIA.i+1); return true; }
  if(a==="x-gu-atras"){ GUIA.pausa=false; guiaPaso(GUIA.i-1); return true; }
  if(a==="x-gu-habito"){ var r=GUIA.r; if(habitoAnade(estiraHabito(r), "vital")){ var hb=null; idealTodos().forEach(function(x){ if(x.text===estiraHabito(r)) hb=x; });
      if(hb){ var t=today(); if(!S.checks[t]) S.checks[t]=[]; if(S.checks[t].indexOf(hb.id)<0) S.checks[t].push(hb.id); save(); }
      var bt=document.querySelector('#guia [data-act="x-gu-habito"]'); if(bt) bt.remove(); } return true; }
  return false;
}
document.addEventListener("keydown", function(e){ if(GUIA && e.key==="Escape"){ if(document.getElementById("gu-info")) guiaInfoCierra(); else guiaCierra(); } });

/* ── la ficha del «?»: cómo se hace, con la persona quieta y los músculos que trabaja marcados ──
   El reloj se para mientras está abierta y sigue al cerrarla (si no estaba ya en pausa). */
function guiaInfo(){
  if(!GUIA) return;
  var p=GUIA.r.pasos[GUIA.i];
  GUIA.infoPausa=!GUIA.pausa; if(!GUIA.pausa) guiaPausa();
  try{ speechSynthesis.cancel(); }catch(e){}
  var c=document.createElement("div"); c.id="gu-info";
  c.innerHTML='<div class="gi-top"><button data-act="x-gu-info-cierra" aria-label="Volver">'+GUIA_ICO_ATRAS+'</button></div>'+
    '<div class="gi-cuerpo"><h2>'+esc(p.t)+'</h2>'+
      '<div class="gi-escena"><canvas class="gi-3d"></canvas></div>'+
      '<p class="gi-gira">Arrastra para girarlo</p>'+
      (p.m?'<p class="gi-et">Músculos</p><p class="gi-musc">'+esc(p.m)+'</p>':'')+
      '<p class="gi-et">Cómo se hace</p><p class="gi-txt">'+esc(p.d)+'</p>'+
      '<a class="gi-video" href="'+estiraVideo(p.v)+'" target="_blank" rel="noopener noreferrer">'+ico("video")+'Ver en vídeo</a></div>';
  document.body.appendChild(c);
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ c.classList.add("ve"); }); });
  GUIA.infoVivo=maniquiMusculos(c.querySelector(".gi-3d"), muscZonas(p.m));
}
function guiaInfoCierra(sinSeguir){
  var c=document.getElementById("gu-info"); if(!c) return;
  if(GUIA && GUIA.infoVivo){ GUIA.infoVivo.para(); GUIA.infoVivo=null; }
  c.classList.remove("ve"); setTimeout(function(){ if(c.parentNode) c.parentNode.removeChild(c); }, 300);
  if(!sinSeguir && GUIA && GUIA.infoPausa && GUIA.pausa) guiaPausa();
  if(GUIA) GUIA.infoPausa=false;
}

/* los músculos, como elipsoides en la pose de reposo del modelo (metros; y arriba, x hacia su
   izquierda, z hacia delante; el modelo mide 1,5 m con los brazos en cruz). Se marcan los dos lados.
   cara: 1 solo por delante, -1 solo por detrás, 0 por todos lados. */
var MUSC_ZONAS={
  cuello:     [[[.035,1.29,-.04],[.05,.06,.05],-1]],
  cuelloF:    [[[.02,1.28,.03],[.04,.05,.045],1]],
  trapecio:   [[[.08,1.24,-.05],[.11,.06,.08],0],[[0,1.16,-.09],[.09,.1,.06],-1]],
  deltA:      [[[.19,1.22,-.02],[.07,.07,.07],1]],
  deltP:      [[[.19,1.22,-.07],[.07,.07,.07],-1]],
  infra:      [[[.1,1.14,-.1],[.07,.06,.05],-1]],
  triceps:    [[[.27,1.21,-.09],[.12,.05,.06],-1]],
  pectoral:   [[[.08,1.15,.08],[.1,.065,.06],1]],
  dorsal:     [[[.12,1.04,-.07],[.07,.14,.08],-1]],
  romboides:  [[[.05,1.15,-.11],[.06,.07,.04],-1]],
  toracica:   [[[0,1.12,-.11],[.05,.13,.04],-1]],
  erectores:  [[[.035,1.0,-.1],[.045,.2,.05],-1]],
  lumbares:   [[[.045,.92,-.1],[.07,.08,.05],-1]],
  abdomen:    [[[0,1.0,.09],[.085,.14,.06],1]],
  oblicuos:   [[[.12,.98,.02],[.05,.1,.1],0]],
  gluteo:     [[[.08,.8,-.1],[.1,.09,.07],-1]],
  gluteoMed:  [[[.13,.87,-.04],[.06,.06,.07],0]],
  psoas:      [[[.07,.82,.08],[.06,.07,.05],1]],
  cuadriceps: [[[.09,.64,.05],[.08,.2,.08],1]],
  rectoFem:   [[[.09,.68,.07],[.045,.17,.04],1]],
  aductores:  [[[.035,.7,0],[.045,.13,.08],0]],
  isquios:    [[[.09,.63,-.06],[.08,.2,.08],-1]],
  gemelos:    [[[.095,.36,-.06],[.055,.11,.05],-1]],
  soleo:      [[[.095,.24,-.05],[.05,.09,.05],-1]],
  tobillo:    [[[.1,.14,-.07],[.04,.05,.04],-1]]
};
/* qué zonas toca cada texto de músculos */
var MUSC_CLAVES=[
  [/todo el cuerpo/, ["pectoral","abdomen","psoas","cuadriceps","erectores","gluteo","isquios","gemelos","dorsal"]],
  [/trapecio/, ["trapecio"]], [/elevador|esplenio/, ["cuello"]], [/flexores del cuello/, ["cuelloF"]],
  [/deltoides anterior/, ["deltA"]], [/deltoides posterior/, ["deltP"]], [/infraespinoso/, ["infra"]],
  [/tr[ií]ceps/, ["triceps"]], [/pectoral/, ["pectoral"]], [/dorsal/, ["dorsal"]], [/romboides/, ["romboides"]],
  [/tor[aá]cica/, ["toracica"]], [/erectores|extensores de la espalda|movilidad de la espalda|^espalda/, ["erectores"]],
  [/lumbar/, ["lumbares"]], [/abdom/, ["abdomen"]], [/oblicuos/, ["oblicuos"]],
  [/gl[uú]teo medio/, ["gluteoMed"]], [/gl[uú]teo mayor|gl[uú]teos|piriforme|gl[uú]teo profundo|rotadores/, ["gluteo"]],
  [/aductor|pect[ií]neo/, ["aductores"]], [/psoas|il[ií]aco|flexores de cadera/, ["psoas"]], [/recto femoral/, ["rectoFem"]],
  [/cu[aá]driceps/, ["cuadriceps"]], [/isquio/, ["isquios"]], [/gemelo/, ["gemelos"]], [/s[oó]leo/, ["soleo"]],
  [/aquiles|tobillo/, ["tobillo"]], [/cadera(?! )|cadera$|, cadera/, ["psoas","gluteoMed"]]
];
function muscZonas(m){
  var t=String(m||"").toLowerCase(), z=[];
  MUSC_CLAVES.forEach(function(c){ if(c[0].test(t)) c[1].forEach(function(k){ if(z.indexOf(k)<0) z.push(k); }); });
  var out=[]; z.forEach(function(k){ (MUSC_ZONAS[k]||[]).forEach(function(e){ out.push(e); }); });
  return out;
}
var MUSC_MAX=24;
/* añade al material de la persona las zonas marcadas, del color de acento */
function mqMusculos(T, mat, zonas, color){
  /* los vec4 van seguidos en un Float32Array: centro + cara, y radios */
  var c=new Float32Array(MUSC_MAX*4), rr=new Float32Array(MUSC_MAX*4).fill(1);
  for(var i=0;i<MUSC_MAX && i<zonas.length;i++){ var e=zonas[i]; c.set([e[0][0],e[0][1],e[0][2],e[2]], i*4); rr.set([e[1][0],e[1][1],e[1][2],0], i*4); }
  var u={ mZ:{ value:c }, mR:{ value:rr }, mN:{ value:Math.min(MUSC_MAX, zonas.length) }, mCol:{ value:new T.Color(color) } };
  var antes=mat.onBeforeCompile;
  mat.onBeforeCompile=function(sh, r){
    if(antes) antes.call(this, sh, r);
    for(var k in u) sh.uniforms[k]=u[k];
    sh.fragmentShader="uniform vec4 mZ["+MUSC_MAX+"]; uniform vec4 mR["+MUSC_MAX+"]; uniform int mN; uniform vec3 mCol;\n"+
      sh.fragmentShader.replace("#include <roughnessmap_fragment>", [
        "  float mq_m = 0.;",
        "  for(int i = 0; i < "+MUSC_MAX+"; i++){",
        "    if(i >= mN) break;",
        "    vec3 q = (vec3(abs(r.x), r.y, r.z) - mZ[i].xyz) / mR[i].xyz;",
        "    float a = 1. - smoothstep(.86, 1., length(q));",
        "    if(mZ[i].w > .5) a *= smoothstep(-.15, .2, n.z);",
        "    if(mZ[i].w < -.5) a *= smoothstep(-.15, .2, -n.z);",
        "    mq_m = max(mq_m, a);",
        "  }",
        "  diffuseColor.rgb = mix(diffuseColor.rgb, mCol, mq_m * .88);",
        "#include <roughnessmap_fragment>"].join("\n"));
  };
  mat.customProgramCacheKey=function(){ return "mq-ropa-musc"; };
  mat.needsUpdate=true;
}
/* la persona de pie, quieta y sin fondo, girando despacio; se puede girar con el dedo */
function maniquiMusculos(lienzo, zonas){
  var vivo={ para:function(){ vivo.fin=true; } };
  maniquiCarga().then(function(T){
    if(vivo.fin) return;
    var acento=mqColor("var(--accent)");
    return mqModelo(T, acento).then(function(M){
      if(vivo.fin) return;
      /* la camiseta, gris: así lo marcado (del color de acento) se ve también en el pecho */
      var oscuro=document.documentElement.classList.contains("dark");
      if(M.ropa){ M.ropa.camiseta.value.set(oscuro ? "#4a463f" : "#d9d1c3"); M.ropa.logoC.value.set(oscuro ? "#8a8378" : "#f5f0e6"); }
      mqMusculos(T, M.malla.material, zonas, acento);
      var esc=new T.Scene();
      esc.add(new T.HemisphereLight(0xffffff, 0xffffff, Math.PI));
      var sol=new T.DirectionalLight(0xffffff, .8); sol.position.set(1.54,2.25,2.2); esc.add(sol); esc.add(sol.target);
      esc.add(M.raiz);
      mqPon(M, mq({}), T);
      var cen=M.caja.getCenter(new T.Vector3()), tamv=M.caja.getSize(new T.Vector3());
      var cam=new T.PerspectiveCamera(26, 1, .05, 30);
      var E={ esc:esc, cam:cam, M:M, cen:cen, dist:(tamv.y*.56+.04)/Math.sin(13*MQ_R), el:6 };
      var r=mqRenderer(T, lienzo);
      function tam(){ var w=lienzo.clientWidth||300, h=lienzo.clientHeight||300; r.setPixelRatio(Math.min(3, window.devicePixelRatio||1)); r.setSize(w,h,false); cam.aspect=w/h; cam.updateProjectionMatrix(); }
      tam();
      var az=20, tocando=null, vel=.012, antes=performance.now();
      lienzo.addEventListener("pointerdown", function(e){ tocando={ x:e.clientX, az:az }; try{ lienzo.setPointerCapture(e.pointerId); }catch(er){} });
      lienzo.addEventListener("pointermove", function(e){ if(tocando) az=tocando.az+(e.clientX-tocando.x)*.6; });
      function suelta(){ tocando=null; }
      lienzo.addEventListener("pointerup", suelta); lienzo.addEventListener("pointercancel", suelta);
      var quieto=typeof medQuieto==="function" && medQuieto();
      function cuadro(ahora){
        if(vivo.fin){ r.dispose(); try{ r.forceContextLoss(); }catch(e){} return; }
        var dt=Math.min(50, ahora-antes); antes=ahora;
        if(!tocando && !quieto) az+=dt*vel;
        if(lienzo.clientWidth && Math.abs(lienzo.clientWidth-lienzo.width/r.getPixelRatio())>2) tam();
        mqCamara(E, az, lienzo.clientHeight);
        r.render(esc, cam);
        requestAnimationFrame(cuadro);
      }
      requestAnimationFrame(cuadro);
    });
  }).catch(function(e){  var p=lienzo.parentNode; if(p) p.classList.add("sin-3d"); });
  return vivo;
}

var CRECER2_CSS=[
'.cr-r-ico{ background:color-mix(in srgb,var(--accent) 12%,var(--glass-bg-hi))!important; }',
'.cr-r-ico img, .cr-mini img{ width:100%; height:100%; object-fit:contain; opacity:0; transition:opacity .35s var(--ease); } .cr-r-ico img.ve, .cr-mini img.ve{ opacity:1; }',
/* miniatura de la figura en la lista de pasos */
'.cr-pasos li .cr-mini{ flex:0 0 auto; width:68px; height:68px; border-radius:14px; padding:2px; background:color-mix(in srgb,var(--accent) 10%,transparent); }',
/* pantalla del modo guiado: fondo liso (el crema o el oscuro del tema, como el resto de Peak.), la persona en el centro,
   la fase en grande, el nombre con su «?» y abajo solo el número */
'#guia, #gu-info{ --gu-fondo:var(--bg); --c:var(--accent); font-family:"Geist", "Inter", system-ui, sans-serif; }',
'#guia *, #gu-info *{ font-family:inherit; }',
'html.dark #guia, html.dark #gu-info{ --gu-fondo:var(--bg); }',
'#guia{ position:fixed; inset:0; z-index:70; display:flex; flex-direction:column; padding:calc(env(safe-area-inset-top) + 14px) 20px calc(env(safe-area-inset-bottom) + 22px);',
'  background:var(--gu-fondo); color:var(--t1); overflow:hidden; }',
'html.guia-abierta, html.guia-abierta body{ overflow:hidden; }',
'#guia > *{ width:100%; max-width:460px; margin-left:auto; margin-right:auto; }',
'.gu-barras{ display:flex; gap:4px; } .gu-barras i{ flex:1; height:3px; border-radius:99px; background:var(--fill-hi); }',
'.gu-barras i.hecha, .gu-barras i.ahora{ background:var(--c); } .gu-barras i.ahora{ opacity:.45; }',
'.gu-fila{ display:flex; align-items:center; justify-content:space-between; margin-top:10px; }',
'.gu-fila button{ display:grid; place-items:center; width:38px; height:38px; border-radius:99px; color:var(--t2); }',
'.gu-fila button svg{ width:20px; height:20px; }',
'.gu-voz .off{ display:none; } .gu-voz.off{ color:var(--t3); } .gu-voz.off .off{ display:inline; }',
'.gu-cab{ text-align:center; margin-top:4px; }',
'.gu-fase{ font-size:clamp(34px, 10vw, 44px); font-weight:700; letter-spacing:-.035em; line-height:1.05; text-wrap:balance; }',
'.gu-nombre{ display:flex; align-items:center; justify-content:center; gap:10px; margin-top:8px; }',
'.gu-nombre h2{ font-size:17px; font-weight:500; color:var(--t2); letter-spacing:-.01em; min-width:0; text-wrap:balance; }',
'.gu-ayuda{ flex:none; display:grid; place-items:center; width:26px; height:26px; border-radius:99px; border:1.6px solid currentColor; color:var(--t2); font-size:14px; font-weight:600; line-height:1; }',
'.gu-ayuda:active{ transform:scale(.92); }',
/* la persona, en un cuadrado tan grande como quepa (así el encuadre es el de siempre) */
'.gu-escena{ position:relative; flex:1 1 0; min-height:0; margin:6px auto 0; container-type:size; }',
'.gu-3d{ position:absolute; inset:0; margin:auto; width:min(100cqw,100cqh); height:min(100cqw,100cqh); display:block; } .gu-escena.sin-3d .gu-3d{ display:none; }',
'.gu-mandos{ display:flex; align-items:center; justify-content:center; gap:28px; margin-top:6px; }',
'.gu-b{ display:grid; place-items:center; width:48px; height:48px; border-radius:99px; color:var(--t2); } .gu-b svg{ width:26px; height:26px; } .gu-b:disabled{ opacity:.25; }',
/* el reloj, como el del pomodoro: anillo grueso y el número en medio */
'.gu-reloj{ position:relative; width:min(42vw,168px); aspect-ratio:1; display:grid; place-items:center; }',
'.gu-reloj svg{ position:absolute; inset:0; width:100%; height:100%; }',
'.gu-pista{ fill:none; stroke:var(--fill-hi); stroke-width:10; } .gu-arco{ fill:none; stroke:var(--c); stroke-width:10; stroke-linecap:round; transition:stroke-dashoffset .12s linear, stroke .3s var(--ease); }',
'.gu-reloj b{ position:relative; font-size:clamp(46px, 14vw, 60px); font-weight:700; letter-spacing:-.05em; line-height:1; font-variant-numeric:tabular-nums; }',
'#guia.prep .gu-arco{ stroke:color-mix(in srgb,var(--c) 40%,var(--fill-hi)); }',
/* en pausa: el número parpadea despacio */
'#guia.pausa .gu-reloj b{ animation:guPausa 1.4s ease-in-out infinite; } @keyframes guPausa{ 50%{ opacity:.25; } }',
'@media (prefers-reduced-motion: reduce){ #guia.pausa .gu-reloj b{ animation:none; opacity:.35; } }',
'.gu-final{ margin:auto; text-align:center; padding:20px 0; } .gu-final h2{ font-size:34px; font-weight:700; letter-spacing:-.035em; margin-top:16px; } .gu-final p{ font-size:15px; color:var(--t2); margin-top:6px; line-height:1.45; }',
'.gu-ok{ display:inline-grid; place-items:center; width:72px; height:72px; border-radius:99px; color:var(--on-accent, #fff); background:var(--c); } .gu-ok svg{ width:32px; height:32px; }',
/* la ficha del «?» */
'#gu-info{ position:fixed; inset:0; z-index:75; display:flex; flex-direction:column; background:var(--gu-fondo); color:var(--t1); overflow-y:auto; -webkit-overflow-scrolling:touch;',
'  padding:calc(env(safe-area-inset-top) + 10px) 20px calc(env(safe-area-inset-bottom) + 28px); transform:translateX(100%); transition:transform .38s cubic-bezier(.32,.72,0,1); }',
'#gu-info.ve{ transform:none; }',
'#gu-info > *{ width:100%; max-width:460px; margin-left:auto; margin-right:auto; }',
'.gi-top button{ display:grid; place-items:center; width:40px; height:40px; margin-left:-8px; border-radius:99px; color:var(--t1); } .gi-top svg{ width:24px; height:24px; }',
'.gi-cuerpo h2{ font-size:30px; font-weight:700; letter-spacing:-.035em; line-height:1.1; margin-top:4px; text-wrap:balance; }',
'.gi-escena{ position:relative; height:min(52vh,440px); margin:6px 0 0; touch-action:pan-y; cursor:grab; }',
'.gi-3d{ position:absolute; inset:0; width:100%; height:100%; display:block; } .gi-escena.sin-3d{ display:none; }',
'.gi-gira{ text-align:center; font-size:12.5px; color:var(--t3); margin-top:2px; }',
'.gi-et{ font-size:12px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--t3); margin-top:22px; }',
'.gi-musc{ font-size:17px; font-weight:600; color:var(--c); margin-top:6px; line-height:1.35; }',
'.gi-txt{ font-size:16px; color:var(--t1); margin-top:6px; line-height:1.55; max-width:62ch; }',
'.gi-video{ display:inline-flex; align-items:center; gap:8px; margin-top:22px; font-size:15px; font-weight:600; color:var(--c); } .gi-video .ic{ width:18px; height:18px; }'
].join("\n");
(function(){ var st=document.createElement("style"); st.id="crecer2-css"; st.textContent=CRECER2_CSS; document.head.appendChild(st);
  var fu=document.createElement("link"); fu.rel="stylesheet"; fu.href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap"; document.head.appendChild(fu); })();


