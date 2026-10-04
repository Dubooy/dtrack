/* ── modo guiado: un estiramiento por pantalla, con cuenta atrás, y pasa solo al siguiente ──
   Antes de cada estiramiento hay unos segundos para colocarse. La voz dice cuál toca,
   cuándo cambiar de lado y cuándo acaba; los pitidos marcan los tres últimos segundos.
   La pantalla no se apaga mientras dura. */
var GUIA=null, guiaWake=null;
var GUIA_PREP=5;   /* segundos para colocarse antes de cada estiramiento */
function guiaPasoDoble(p){ return /por (lado|pierna)/.test(p.d); }
function guiaVozOn(){ return prefs().guiaVoz!==false; }
/* voz de hombre, la más natural del móvil: en iPhone Jorge (mejor si es la mejorada), en Windows Álvaro o Pablo.
   Si el móvil no dice el sexo de sus voces (Android), se queda con la más natural que tenga. */
var guiaVozElegida=null;
function guiaVoz(){
  if(!window.speechSynthesis) return null;
  var vs=speechSynthesis.getVoices()||[], lang=(typeof IDIOMA==="string"?IDIOMA:"es"), mejor=null, pm=-99;
  vs.forEach(function(v){
    var l=(v.lang||"").toLowerCase().replace("_","-"); if(l.indexOf(lang)!==0) return;
    var p=0, n=v.name||"";
    if(/premium/i.test(n)) p+=12;
    if(/enhanced|mejorad|natural|neural|siri/i.test(n)) p+=9;
    if(/google/i.test(n)) p+=3;
    if(lang==="es" && l==="es-es") p+=2;
    if(/jorge|juan|diego|carlos|pablo|[aá]lvaro|alvaro|dar[ií]o|ra[uú]l|enrique|miguel|male|hombre|masculin|daniel|aaron|arthur|tom\b|thomas|luca|markus/i.test(n)) p+=10;
    if(/m[oó]nica|marisa|paulina|marisol|luciana|helena|laura|elvira|elena|sabina|dalia|female|mujer|samantha|ava|zoe|amelie|alice|federica|elsa|karen|moira|tessa|anna/i.test(n)) p-=4;
    if(v.localService===false) p+=1;
    if(/compact|eloquence|grandma|grandpa|albert|bad news|bahh|bells|boing|bubbles|cellos|jester|organ|superstar|trinoids|whisper|wobble|zarvox|rocko|shelley|flo|reed|sandy|eddy/i.test(n)) p-=20;
    if(p>pm){ pm=p; mejor=v; }
  });
  guiaVozElegida=mejor; return mejor;
}
if(window.speechSynthesis){ try{ speechSynthesis.addEventListener("voiceschanged", function(){ guiaVoz(); }); }catch(e){} }
function guiaHabla(txt){
  if(!guiaVozOn() || !window.speechSynthesis || !txt) return;
  try{
    var u=new SpeechSynthesisUtterance(tr(txt)), v=guiaVozElegida||guiaVoz();
    if(v){ u.voice=v; u.lang=v.lang; } else u.lang=(typeof IDIOMA==="string"?IDIOMA:"es");
    u.rate=0.95; u.pitch=1; u.volume=0.9;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  }catch(e){}
}
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
  var s=document.querySelector("#guia .gu-seg"); if(s) s.textContent=guiaTiempo(seg);
  var pb=document.querySelector("#guia .gu-prog i"); if(pb) pb.style.transform="scaleX("+(1-resta/total).toFixed(4)+")";
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
/* el tiempo que queda: segundos sueltos, o minutos y segundos a partir de un minuto */
function guiaTiempo(seg){ return seg>=60 ? Math.floor(seg/60)+":"+("0"+seg%60).slice(-2) : String(seg); }
var GUIA_ICO_PAUSA='<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6.5" y="5" width="4" height="14" rx="1.4"/><rect x="13.5" y="5" width="4" height="14" rx="1.4"/></svg>';
var GUIA_ICO_SEGUIR='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.2v13.6a1 1 0 0 0 1.5.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8A1 1 0 0 0 8 5.2z"/></svg>';
var GUIA_ICO_ANT='<svg viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="5" width="2.6" height="14" rx="1.2"/><path d="M19 6.1v11.8a1 1 0 0 1-1.55.83l-8.6-5.9a1 1 0 0 1 0-1.66l8.6-5.9A1 1 0 0 1 19 6.1z"/></svg>';
var GUIA_ICO_SIG='<svg viewBox="0 0 24 24" fill="currentColor"><rect x="16.4" y="5" width="2.6" height="14" rx="1.2"/><path d="M5 6.1v11.8a1 1 0 0 0 1.55.83l8.6-5.9a1 1 0 0 0 0-1.66l-8.6-5.9A1 1 0 0 0 5 6.1z"/></svg>';
/* como en las apps de ejercicios en casa: la persona grande arriba y abajo un panel oscuro con el nombre, el tiempo y los mandos */
function guiaPinta(){
  var c=document.getElementById("guia"); if(!c||!GUIA) return;
  var r=GUIA.r, p=r.pasos[GUIA.i], sig=r.pasos[GUIA.i+1], total=(GUIA.prep?GUIA_PREP:p.s)*1000;
  var quieto=typeof medQuieto==="function" && medQuieto();
  c.classList.toggle("prep", GUIA.prep); c.classList.toggle("pausa", GUIA.pausa);
  c.innerHTML='<div class="gu-arriba"><div class="gu-barras">'+r.pasos.map(function(x,j){ return '<i class="'+(j<GUIA.i?"hecha":j===GUIA.i?"ahora":"")+'"></i>'; }).join("")+'</div>'+
      '<div class="gu-fila"><button data-act="x-gu-cierra" aria-label="Cerrar">'+GUIA_ICO_X+'</button>'+
        '<span class="gu-sig">'+(sig?'<b>'+esc(sig.t)+'</b><small>Siguiente</small>':'<b>Último</b><small>Ya casi está</small>')+'</span>'+guiaBotonVoz()+'</div></div>'+
    '<div class="gu-escena"><canvas class="gu-3d"></canvas></div>'+
    '<div class="gu-panel">'+
      '<p class="gu-fase">'+guiaFase()+'</p>'+
      '<h2 class="gu-nombre">'+esc(p.t)+' <button class="gu-ayuda" data-act="x-gu-info" aria-label="Cómo se hace">?</button></h2>'+
      '<b class="gu-seg num">'+guiaTiempo(Math.ceil(GUIA.resta/1000))+'</b>'+
      '<span class="gu-prog"><i style="transform:scaleX('+(1-GUIA.resta/total).toFixed(4)+')"></i></span>'+
      '<div class="gu-mandos">'+
        '<button class="gu-b" data-act="x-gu-atras" aria-label="Anterior"'+(GUIA.i?'':' disabled')+'>'+GUIA_ICO_ANT+'</button>'+
        '<button class="gu-reloj" data-act="x-gu-pausa" aria-label="'+(GUIA.pausa?"Seguir":"Pausa")+'"><span class="gu-pa">'+GUIA_ICO_PAUSA+'</span><span class="gu-pl">'+GUIA_ICO_SEGUIR+'</span></button>'+
        '<button class="gu-b" data-act="x-gu-sigue" aria-label="Siguiente">'+GUIA_ICO_SIG+'</button>'+
      '</div></div>';
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
  /* los músculos, uno por píldora */
  var mus=(p.m||"").split(/,\s*|\s+y\s+/).map(function(x){ return x.trim(); }).filter(Boolean);
  c.innerHTML='<div class="gi-fondo" data-act="x-gu-info-cierra"></div><div class="gi-hoja"><span class="gi-asa"></span>'+
    '<div class="gi-cuerpo"><h2>'+esc(p.t)+'</h2>'+
      '<div class="gi-escena"><canvas class="gi-3d"></canvas><div class="gi-capa"></div><p class="gi-gira">Arrastra para girarlo</p></div>'+
      (mus.length?'<p class="gi-et">Zona principal</p><div class="gi-musc">'+mus.map(function(m){ return '<span><i></i>'+esc(m.charAt(0).toUpperCase()+m.slice(1))+'</span>'; }).join("")+'</div>':'')+
      '<p class="gi-et">Instrucciones</p><p class="gi-txt">'+esc(p.d)+'</p>'+
      '<a class="gi-video" href="'+estiraVideo(p.v)+'" target="_blank" rel="noopener noreferrer">'+ico("video")+'Ver en vídeo</a></div>'+
    '<div class="gi-pie"><button data-act="x-gu-info-cierra">Cerrar</button></div></div>';
  document.body.appendChild(c);
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ c.classList.add("ve"); }); });
  GUIA.infoVivo=maniquiMusculos(c.querySelector(".gi-3d"), muscZonas(p.m), muscClaves(p.m), c.querySelector(".gi-capa"));
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
function muscClaves(m){
  var t=String(m||"").toLowerCase(), z=[];
  MUSC_CLAVES.forEach(function(c){ if(c[0].test(t)) c[1].forEach(function(k){ if(z.indexOf(k)<0) z.push(k); }); });
  return z;
}
function muscZonas(m){
  var out=[]; muscClaves(m).forEach(function(k){ (MUSC_ZONAS[k]||[]).forEach(function(e){ out.push(e); }); });
  return out;
}
/* el nombre corto de cada zona, para las etiquetas de la ficha */
var MUSC_NOMBRE={ cuello:"Cuello", cuelloF:"Cuello", trapecio:"Trapecio", deltA:"Deltoides", deltP:"Deltoides", infra:"Infraespinoso",
  triceps:"Tríceps", pectoral:"Pectoral", dorsal:"Dorsal", romboides:"Romboides", toracica:"Columna torácica", erectores:"Erectores",
  lumbares:"Lumbares", abdomen:"Abdomen", oblicuos:"Oblicuos", gluteo:"Glúteo", gluteoMed:"Glúteo medio", psoas:"Psoas",
  cuadriceps:"Cuádriceps", rectoFem:"Recto femoral", aductores:"Aductores", isquios:"Isquios", gemelos:"Gemelos", soleo:"Sóleo", tobillo:"Aquiles" };
var MUSC_MAX=24;
/* añade al material de la persona las zonas marcadas, del color de acento */
function mqMusculos(T, mat, zonas, color){
  /* los vec4 van seguidos en un Float32Array: centro + cara, y radios */
  var c=new Float32Array(MUSC_MAX*4), rr=new Float32Array(MUSC_MAX*4).fill(1);
  for(var i=0;i<MUSC_MAX && i<zonas.length;i++){ var e=zonas[i]; c.set([e[0][0],e[0][1],e[0][2],e[2]], i*4); rr.set([e[1][0],e[1][1],e[1][2],0], i*4); }
  var u={ mZ:{ value:c }, mR:{ value:rr }, mN:{ value:Math.min(MUSC_MAX, zonas.length) }, mCol:{ value:new T.Color(color) }, mPx:{ value:.026 }, mAncho:{ value:.45 } };
  var antes=mat.onBeforeCompile;
  mat.onBeforeCompile=function(sh, r){
    if(antes) antes.call(this, sh, r);
    for(var k in u) sh.uniforms[k]=u[k];
    sh.fragmentShader="uniform vec4 mZ["+MUSC_MAX+"]; uniform vec4 mR["+MUSC_MAX+"]; uniform int mN; uniform vec3 mCol; uniform float mPx, mAncho;\n"+
      sh.fragmentShader.replace("#include <roughnessmap_fragment>", [
        "  float mq_m = 0., mq_o = 0.;",
        "  for(int i = 0; i < "+MUSC_MAX+"; i++){",
        "    if(i >= mN) break;",
        "    vec3 q = (vec3(abs(r.x), r.y, r.z) - mZ[i].xyz) / mR[i].xyz;",
        "    float a = 1. - smoothstep(.94, 1., length(q));",
        "    if(mZ[i].w > .5) a *= smoothstep(-.15, .2, n.z);",
        "    if(mZ[i].w < -.5) a *= smoothstep(-.15, .2, -n.z);",
        "    float lq = length(q), cara = 1.;",
        "    if(mZ[i].w > .5) cara = smoothstep(-.15, .2, n.z);",
        "    if(mZ[i].w < -.5) cara = smoothstep(-.15, .2, -n.z);",
        "    mq_m = max(mq_m, a);",
        "    mq_o = max(mq_o, cara * smoothstep(.9, .935, lq) * (1. - smoothstep(.975, 1., lq)));",
        "  }",
        /* rayas pegadas al cuerpo (en sus coordenadas, no en la pantalla): se tuercen con la perspectiva al girar */
        "  float mq_t = (r.y + r.x * .85) / mPx, mq_f = fract(mq_t), mq_e = fwidth(mq_t) * 1.2;",
        "  float mq_s = smoothstep(1. - mAncho - mq_e, 1. - mAncho, mq_f) * (1. - smoothstep(1. - mq_e, 1., mq_f));",
        "#include <roughnessmap_fragment>"].join("\n"));
    /* al final de todo: rayas como las del logo, más gruesas y separadas que las de la sombra */
    sh.fragmentShader=sh.fragmentShader.replace(/\}\s*$/, [
        "  gl_FragColor.rgb = mix(gl_FragColor.rgb, mCol, max(mq_s * mq_m, mq_o));",
        "}"].join("\n"));
  };
  mat.customProgramCacheKey=function(){ return "mq-ropa-musc"; };
  mat.needsUpdate=true;
}
/* las etiquetas: de cada músculo sale una línea recta hacia un lado, acaba en un punto y lleva su nombre.
   Siguen al músculo al girar la persona; el de cada pareja que se ve es el más cercano, y los que
   quedan detrás se apagan. */
function muscEtiquetas(T, M, claves, capa){
  var g=M.malla.geometry, pos=g.attributes.position, nor=g.attributes.normal, n=pos.count, v=new T.Vector3();
  var grupos=[], vistos={};
  claves.forEach(function(k){
    var nom=MUSC_NOMBRE[k]; if(!nom || vistos[nom] || !MUSC_ZONAS[k]) return; vistos[nom]=1;
    var e=MUSC_ZONAS[k][0], c=e[0], rr=e[1], lados=[[],[]];
    for(var i=0;i<n;i++){
      var x=pos.getX(i), y=pos.getY(i), z=pos.getZ(i);
      var qx=(Math.abs(x)-c[0])/rr[0], qy=(y-c[1])/rr[1], qz=(z-c[2])/rr[2];
      if(qx*qx+qy*qy+qz*qz>1) continue;
      if(e[2]>.5 && nor.getZ(i)<.1) continue; if(e[2]<-.5 && nor.getZ(i)>-.1) continue;
      lados[x<0?1:0].push(i);
    }
    lados=lados.map(function(L){ var paso=Math.max(1, Math.ceil(L.length/40)); return L.filter(function(_,j){ return j%paso===0; }); }).filter(function(L){ return L.length; });
    if(!lados.length) return;
    var d=document.createElement("b"); d.className="gi-eti"; d.textContent=nom; capa.appendChild(d);
    grupos.push({ lados:lados, cara:e[2], el:d });
  });
  var svg=document.createElementNS("http://www.w3.org/2000/svg","svg"); svg.setAttribute("class","gi-lineas"); capa.insertBefore(svg, capa.firstChild);
  var p=new T.Vector3(), w=new T.Vector3(), cen=new T.Vector3(), haciaCam=new T.Vector3();
  var vistaAtras=0; grupos.forEach(function(G){ vistaAtras+=G.cara; });
  var ant=performance.now();
  function suave(x){ return 1-Math.pow(1-x,3); }
  var fn=function(cam, W, H){
    var ahora=performance.now(), dt=Math.min(60, ahora-ant); ant=ahora;
    M.malla.updateMatrixWorld();
    M.caja.getCenter(cen);
    var cc=cen.clone().project(cam), cx=(cc.x+1)/2*W;
    var filas={ i:[], d:[] };
    grupos.forEach(function(G){
      /* de cada lado, el punto medio del músculo ya colocado; se queda el más cercano a la cámara */
      var mejor=null, dm=1e9;
      G.lados.forEach(function(L){
        w.set(0,0,0); L.forEach(function(i){ M.malla.getVertexPosition(i, v); w.add(v); }); w.multiplyScalar(1/L.length); M.malla.localToWorld(w);
        var dd=w.distanceTo(cam.position); if(dd<dm){ dm=dd; mejor=w.clone(); }
      });
      haciaCam.copy(cam.position).sub(cen); haciaCam.y=0; haciaCam.normalize();
      var frente=G.cara ? G.cara*haciaCam.z : 1;
      p.copy(mejor).project(cam);
      var x=(p.x+1)/2*W, y=(1-p.y)/2*H, lado=x<cx ? "i" : "d";
      G.x=x; G.y=y;
      /* se ve o no (con un margen para que no parpadee en el límite) y la animación va hacia ahí */
      if(G.cara){ if(frente>.12) G.ve=true; else if(frente<-.02) G.ve=false; } else G.ve=true;
      G.p=G.p||0; G.p=G.ve ? Math.min(1, G.p+dt/420) : Math.max(0, G.p-dt/300);
      filas[lado].push(G); G.lado=lado;
    });
    /* que no se pisen: de arriba abajo, con un hueco mínimo */
    ["i","d"].forEach(function(k){
      var F=filas[k].sort(function(a,b){ return a.y-b.y; }), ult=-1e9;
      F.forEach(function(G){ G.ty=Math.max(G.y, ult+30); ult=G.ty; });
    });
    /* la línea: del borde, recta, hasta cerca del músculo y, si la etiqueta se ha apartado, un quiebro corto hasta él */
    var h="";
    grupos.forEach(function(G){
      var izq=G.lado==="i", bx=izq ? 12 : W-12, kx=G.x+(izq?-1:1)*Math.min(22, Math.abs(G.x-bx)/3);
      /* al aparecer: primero el punto en el músculo, luego la línea crece hacia el borde y al final sale el nombre;
         al irse, lo mismo al revés */
      var e=suave(G.p), pm=Math.min(1, e*4), pl=Math.max(0, Math.min(1, (e-.12)/.6)), pt=Math.max(0, (e-.62)/.38);
      if(e>0) h+='<g><path pathLength="1" stroke-dasharray="1" stroke-dashoffset="'+(1-pl).toFixed(3)+'" d="M'+G.x.toFixed(1)+' '+G.y.toFixed(1)+' L'+kx.toFixed(1)+' '+G.ty+' H'+bx+'"/>'+
        (pt>0?'<circle class="fin" cx="'+bx+'" cy="'+G.ty+'" r="'+(3.5*pt).toFixed(2)+'"/>':'')+
        '<circle class="mus" cx="'+G.x.toFixed(1)+'" cy="'+G.y.toFixed(1)+'" r="'+(3*pm).toFixed(2)+'"/></g>';
      G.el.className="gi-eti "+(izq?"izq":"der"); G.el.style.opacity=pt.toFixed(2); G.el.style.top=G.ty+"px";
      G.el.style.left=izq ? "12px" : ""; G.el.style.right=izq ? "" : "12px";
      G.el.style.transform="translate("+((izq?-1:1)*(1-pt)*8).toFixed(1)+"px, calc(-100% - 5px))";
    });
    svg.setAttribute("viewBox","0 0 "+W+" "+H); svg.innerHTML=h;
  };
  fn.atras=vistaAtras<0;
  return fn;
}
/* la persona de pie, quieta y sin fondo, girando despacio; se puede girar con el dedo */
function maniquiMusculos(lienzo, zonas, claves, capa){
  var vivo={ para:function(){ vivo.fin=true; } };
  maniquiCarga().then(function(T){
    if(vivo.fin) return;
    var acento=mqColor("var(--accent)");
    return mqModelo(T, acento).then(function(M){
      if(vivo.fin) return;
      /* la camiseta, gris: así lo marcado (del color de acento) se ve también en el pecho */
      var oscuro=document.documentElement.classList.contains("dark");
      if(M.ropa){ M.ropa.camiseta.value.set(oscuro ? "#4a463f" : "#d9d1c3"); M.ropa.logoC.value.set(oscuro ? "#8a8378" : "#f5f0e6"); }
      mqMusculos(T, M.malla.material, zonas, oscuro ? "#f3efe6" : acento);
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
      var et=capa && claves && claves.length ? muscEtiquetas(T, M, claves, capa) : null;
      var az=et && et.atras ? 200 : 20, tocando=null, vel=.012, antes=performance.now();
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
        if(et) et(cam, lienzo.clientWidth, lienzo.clientHeight);
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
/* pantalla del modo guiado: la persona grande sobre el fondo de la app y un panel de tinta abajo (como las apps de ejercicios en casa) */
'#guia, #gu-info{ --gu-fondo:var(--bg); --c:var(--accent); --gu-panel:#1c1b19; --gu-tx:#f5f0e6; --gu-tx2:rgba(245,240,230,.62); --gu-fill:rgba(245,240,230,.12); font-family:"Geist", "Inter", system-ui, sans-serif; }',
'html.dark #guia, html.dark #gu-info{ --gu-panel:#26241f; }',
'#guia *, #gu-info *{ font-family:inherit; }',
'#guia{ position:fixed; inset:0; z-index:70; display:flex; flex-direction:column; background:var(--gu-fondo); color:var(--t1); overflow:hidden; }',
'html.guia-abierta, html.guia-abierta body{ overflow:hidden; }',
'.gu-arriba{ padding:calc(env(safe-area-inset-top) + 12px) 18px 0; width:100%; max-width:520px; margin:0 auto; }',
'.gu-barras{ display:flex; gap:4px; } .gu-barras i{ flex:1; height:4px; border-radius:99px; background:var(--fill-hi); }',
'.gu-barras i.hecha{ background:var(--t1); } .gu-barras i.ahora{ background:color-mix(in srgb, var(--t1) 45%, var(--fill-hi)); }',
'.gu-fila{ display:flex; align-items:center; gap:10px; margin-top:12px; }',
'.gu-fila > button{ flex:0 0 auto; display:grid; place-items:center; width:42px; height:42px; border-radius:99px; color:var(--t1); background:var(--fill); }',
'.gu-fila > button svg{ width:20px; height:20px; }',
'.gu-sig{ flex:1; min-width:0; text-align:right; padding-right:4px; } .gu-sig b{ display:block; font-size:15px; font-weight:700; line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
'.gu-sig small{ display:block; font-size:13px; color:var(--t3); margin-top:1px; }',
'.gu-voz .off{ display:none; } .gu-voz.off{ color:var(--t3)!important; } .gu-voz.off .off{ display:inline; }',
/* la persona: tan grande como quepa entre la barra de arriba y el panel */
'.gu-escena{ position:relative; flex:1 1 0; min-height:0; width:100%; max-width:560px; margin:0 auto; container-type:size; }',
'.gu-3d{ position:absolute; inset:0; margin:auto; width:min(100cqw,100cqh); height:min(100cqw,100cqh); display:block; } .gu-escena.sin-3d .gu-3d{ display:none; }',
'.gu-panel{ flex:0 0 auto; background:var(--gu-panel); color:var(--gu-tx); border-radius:30px 30px 0 0; text-align:center;',
'  padding:22px 22px calc(env(safe-area-inset-bottom) + 22px); }',
'.gu-panel > *{ max-width:460px; margin-left:auto; margin-right:auto; }',
'.gu-fase{ font-size:12px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--gu-tx2); }',
'#guia.prep .gu-fase{ color:var(--gu-tx); }',
'.gu-nombre{ margin-top:8px; font-size:clamp(21px, 6vw, 25px); font-weight:700; letter-spacing:-.025em; line-height:1.2; text-wrap:balance; }',
'.gu-ayuda{ display:inline-grid; vertical-align:3px; margin-left:4px; place-items:center; width:26px; height:26px; border-radius:99px; border:1.6px solid var(--gu-tx2); color:var(--gu-tx2); font-size:14px; font-weight:600; line-height:1; }',
'.gu-ayuda:active{ transform:scale(.92); }',
'.gu-seg{ display:block; margin-top:6px; font-size:clamp(64px, 20vw, 84px); font-weight:700; letter-spacing:-.05em; line-height:1; font-variant-numeric:tabular-nums; }',
'#guia.prep .gu-seg{ color:var(--gu-tx2); }',
'.gu-prog{ display:block; height:4px; border-radius:99px; background:var(--gu-fill); overflow:hidden; margin-top:16px; }',
'.gu-prog i{ display:block; height:100%; background:var(--gu-tx); transform-origin:left; transition:transform .12s linear; }',
'#guia.prep .gu-prog i{ background:var(--gu-tx2); }',
'.gu-mandos{ display:flex; align-items:center; justify-content:center; gap:18px; margin-top:20px; }',
'.gu-b{ display:grid; place-items:center; width:58px; height:58px; border-radius:99px; color:var(--gu-tx); background:var(--gu-fill); } .gu-b svg{ width:22px; height:22px; } .gu-b:disabled{ opacity:.3; }',
'.gu-reloj{ flex:1; max-width:200px; height:58px; border-radius:99px; display:grid; place-items:center; background:var(--gu-tx); color:var(--gu-panel); }',
'.gu-reloj svg{ width:24px; height:24px; } .gu-reloj .gu-pl{ display:none; } #guia.pausa .gu-reloj .gu-pa{ display:none; } #guia.pausa .gu-reloj .gu-pl{ display:block; }',
'.gu-reloj:active, .gu-b:active{ transform:scale(.95); }',
/* en pausa: el número parpadea despacio */
'#guia.pausa .gu-seg{ animation:guPausa 1.4s ease-in-out infinite; } @keyframes guPausa{ 50%{ opacity:.3; } }',
'@media (prefers-reduced-motion: reduce){ #guia.pausa .gu-seg{ animation:none; opacity:.4; } }',
/* al acabar */
'.gu-final{ margin:auto; text-align:center; padding:20px; max-width:460px; } .gu-final h2{ font-size:34px; font-weight:700; letter-spacing:-.035em; margin-top:16px; } .gu-final p{ font-size:15px; color:var(--t2); margin-top:6px; line-height:1.45; }',
'.gu-ok{ display:inline-grid; place-items:center; width:72px; height:72px; border-radius:99px; color:var(--bg); background:var(--t1); } .gu-ok svg{ width:32px; height:32px; }',
'#guia .gu-top{ padding:calc(env(safe-area-inset-top) + 12px) 18px 0; } #guia .gu-top .gu-fila{ justify-content:space-between; }',
/* la ficha del «?»: una hoja oscura que sube desde abajo, como el panel de la guía */
'#gu-info{ position:fixed; inset:0; z-index:75; }',
'.gi-fondo{ position:absolute; inset:0; background:rgba(0,0,0,.38); opacity:0; transition:opacity .3s ease; } #gu-info.ve .gi-fondo{ opacity:1; }',
'.gi-hoja{ position:absolute; left:0; right:0; bottom:0; max-height:calc(100% - env(safe-area-inset-top) - 24px); display:flex; flex-direction:column;',
'  background:var(--gu-panel); color:var(--gu-tx); border-radius:30px 30px 0 0; transform:translateY(100%); transition:transform .4s cubic-bezier(.32,.72,0,1); }',
'#gu-info.ve .gi-hoja{ transform:none; }',
'.gi-asa{ display:block; width:40px; height:5px; border-radius:99px; background:var(--gu-fill); margin:10px auto 0; flex:0 0 auto; }',
'.gi-cuerpo{ flex:1 1 auto; overflow-y:auto; -webkit-overflow-scrolling:touch; padding:14px 22px 10px; width:100%; max-width:520px; margin:0 auto; }',
'.gi-cuerpo h2{ font-size:26px; font-weight:700; letter-spacing:-.03em; line-height:1.12; text-wrap:balance; }',
'.gi-escena{ --gu-eti:var(--t1); position:relative; height:min(40vh,340px); margin-top:14px; border-radius:20px; overflow:hidden; background:var(--bg); touch-action:pan-y; cursor:grab; }',
'.gi-3d{ position:absolute; inset:0; width:100%; height:100%; display:block; } .gi-escena.sin-3d{ display:none; }',
'.gi-capa{ position:absolute; inset:0; pointer-events:none; }',
/* las etiquetas: línea recta del músculo al borde, un punto al final y el nombre encima */
'.gi-lineas{ position:absolute; inset:0; width:100%; height:100%; overflow:visible; }',
'.gi-lineas path{ fill:none; stroke:var(--gu-eti); stroke-width:1.5; stroke-linejoin:round; }',
'.gi-lineas .fin{ fill:var(--gu-eti); } .gi-lineas .mus{ fill:var(--gu-eti); stroke:var(--bg); stroke-width:2; }',
'.gi-eti{ position:absolute; transform:translateY(calc(-100% - 5px)); font-size:11.5px; font-weight:700; line-height:1.15; color:var(--gu-eti); white-space:nowrap; }',
'.gi-gira{ position:absolute; left:0; right:0; bottom:8px; text-align:center; font-size:12px; color:var(--t3); pointer-events:none; }',
'.gi-et{ font-size:12px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--gu-tx2); margin-top:24px; }',
'.gi-musc{ display:flex; flex-wrap:wrap; gap:8px; margin-top:10px; }',
'.gi-musc span{ display:inline-flex; align-items:center; gap:8px; padding:9px 14px; border-radius:99px; background:var(--gu-fill); font-size:14.5px; font-weight:600; }',
'.gi-musc i{ width:9px; height:9px; border-radius:99px; background:var(--gu-tx); flex:0 0 auto; }',
'.gi-txt{ font-size:16px; color:var(--gu-tx); margin-top:8px; line-height:1.55; }',
'.gi-video{ display:inline-flex; align-items:center; gap:8px; margin-top:18px; font-size:15px; font-weight:700; color:var(--gu-tx); padding:10px 16px; border-radius:99px; background:var(--gu-fill); }',
'.gi-video .ic{ width:18px; height:18px; }',
'.gi-pie{ flex:0 0 auto; padding:12px 22px calc(env(safe-area-inset-bottom) + 16px); box-shadow:0 -1px 0 var(--gu-fill); }',
'.gi-pie button{ display:block; width:100%; max-width:476px; margin:0 auto; height:56px; border-radius:99px; background:var(--gu-tx); color:var(--gu-panel); font-size:17px; font-weight:700; }'
].join("\n");
(function(){ var st=document.createElement("style"); st.id="crecer2-css"; st.textContent=CRECER2_CSS; document.head.appendChild(st);
  var fu=document.createElement("link"); fu.rel="stylesheet"; fu.href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap"; document.head.appendChild(fu); })();


