/* ════════════════════════════════════════════════════════════════
   CALMA: meditación. Tarjeta en Vital con temporizador (5/10/15/20
   min) y sesión a pantalla completa: esfera que respira, olas y
   cuenco generados en el móvil y, si quieres, voz. Pantalla plana con
   los colores del tema y pétalos que cruzan con el viento. Hay tipos hechos y
   puedes crear los tuyos (se guardan en S.medTipos).
   Los minutos van a S.habits[día].medita y dan XP (1 por minuto,
   hasta MED_XP_TOPE al día).
   ════════════════════════════════════════════════════════════════ */
var MED_XP_TOPE=20, MED_MINUTOS=[5,10,15,20];
var MED_BASE=[
  { id:"calma",    n:"Calma",    d:"Para bajar revoluciones",                 i:4, h1:4, e:6, h2:0, guia:"resp" },
  { id:"caja",     n:"Caja",     d:"Para concentrarte antes de estudiar",     i:4, h1:4, e:4, h2:4, guia:"resp" },
  { id:"dormir",   n:"Dormir",   d:"Para relajarte antes de dormir",          i:4, h1:7, e:8, h2:0, guia:"resp" },
  { id:"despierta",n:"Despierta",d:"Respiración ágil para activarte",         i:3, h1:0, e:3, h2:0, guia:"resp" },
  { id:"silencio", n:"Silencio", d:"Solo el tiempo, con campana al empezar y al acabar", i:0, h1:0, e:0, h2:0, guia:"silencio" }
];
var MED_FRASES=[
  "Suelta los hombros.",
  "Si te distraes, vuelve a la respiración. Sin juzgarte.",
  "Nota el aire entrar fresco y salir templado.",
  "Afloja la mandíbula y la frente.",
  "Ahora mismo no hay nada que hacer. Solo respirar.",
  "Siente el peso de tu cuerpo apoyado.",
  "Cada vez que sueltas el aire, sueltas un poco más.",
  "Deja que los pensamientos pasen, como nubes.",
  "Lo estás haciendo bien.",
  "Vuelve a este momento."
];

function medTipos(){ return MED_BASE.concat(S.medTipos||[]); }
function medTipo(id){ var l=medTipos(); for(var i=0;i<l.length;i++) if(l[i].id===id) return l[i]; return MED_BASE[0]; }
function medPref(){ if(!S.medPref) S.medPref={ tipo:"calma", min:10, sonido:true, voz:false }; return S.medPref; }
function medPatron(t){ if(t.guia!=="resp") return ""; return [t.i,t.h1,t.e,t.h2].filter(function(x,k){ return x>0 || k===0 || k===2; }).join("-"); }
function medPropio(t){ return !!(S.medTipos||[]).filter(function(x){ return x.id===t.id; }).length; }
function medDesc(t){ var d=t.d?(medPropio(t)?t.d:tr(t.d)):""; return t.guia==="resp" ? medPatron(t)+(d?" · "+d:"") : d; }
function medNombre(t){ return medPropio(t)?t.n:tr(t.n); }
function medMinDia(d){ var h=S.habits[d]; return (h && h.medita) || 0; }
function medXP(d){ return Math.min(MED_XP_TOPE, medMinDia(d)); }

/* el XP de meditar entra en el día (sin tocar la plantilla) */
var _medDayXP=dayXP;
dayXP=function(d, tmap){ return _medDayXP(d, tmap)+medXP(d); };

/* ── tarjeta en Vital ── */
function medPintaTarjeta(){
  var gb=document.getElementById("gym-btn"); if(!gb) return;
  var gym=gb.closest(".glass"); if(!gym) return;
  var c=document.getElementById("med-card");
  if(!c){ c=document.createElement("div"); c.id="med-card"; c.className="glass rounded-[24px] pad"; gym.parentNode.insertBefore(c, gym.nextSibling); }
  var t=curDay(), esHoy=(t===today()), P=medPref(), tp=medTipo(P.tipo), min=medMinDia(t);
  var dias="", semana=0;
  for(var i=6;i>=0;i--){
    var d=addDays(today(),-i), m=medMinDia(d); semana+=m;
    dias+='<div class="med-dia'+(d===t?" hoy":"")+'"><i style="height:'+Math.max(4, Math.min(40, m*2))+'px;'+(m?"":"background:var(--fill-hi)")+'"></i><span>'+INI[new Date(d+"T00:00:00").getDay()]+'</span></div>';
  }
  c.innerHTML=
    '<div class="flex items-start justify-between mb-5">'+
      '<div><h2 class="display text-[17px] font-bold">Meditación</h2>'+
      '<p class="text-[12.5px] t3 mt-0.5">'+(esHoy?"Unos minutos para respirar":"Ese día")+' <span class="chip ml-1" style="background:color-mix(in srgb,var(--good) 15%,transparent);color:var(--good)">hasta '+MED_XP_TOPE+' XP</span></p></div>'+
      '<div class="text-right"><div class="display text-[30px] font-extrabold num leading-none">'+min+'</div><div class="text-[11px] t3 mt-1">min '+(esHoy?"hoy":"ese día")+'</div></div>'+
    '</div>'+
    (esHoy
      ? '<div class="med-mins">'+MED_MINUTOS.map(function(n){ return '<button class="'+(P.min===n?"on":"")+'" data-act="x-med-min" data-n="'+n+'"><b class="num">'+n+'</b><span>min</span></button>'; }).join("")+'</div>'+
        '<button class="med-tipo" data-act="x-med-tipos"><span class="med-tipo-ic">'+ico("loto")+'</span>'+
          '<span class="med-tipo-t"><b>'+esc(medNombre(tp))+'</b><small>'+esc(medDesc(tp))+'</small></span>'+
          '<svg class="med-flecha" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></button>'+
        '<button class="med-go" data-act="x-med-go">Empezar</button>'
      : '')+
    '<div class="flex items-end justify-between mb-3 mt-6"><span class="eyebrow">Esta semana</span><span class="text-[12.5px] t2 num">'+semana+' min</span></div>'+
    '<div class="med-semana">'+dias+'</div>';
}

/* ── tipos: elegir, crear y editar ── */
function medSheetTipos(){
  var P=medPref();
  var filas=medTipos().map(function(t){
    return '<div class="med-fila'+(P.tipo===t.id?" on":"")+'">'+
      '<button class="med-fila-b" data-act="x-med-elige" data-id="'+esc(t.id)+'"><b>'+esc(medNombre(t))+'</b>'+
        '<small>'+esc(medDesc(t))+'</small></button>'+
      '<button class="med-fila-e" data-act="x-med-edita" data-id="'+esc(t.id)+'" aria-label="Ajustar">'+
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg></button>'+
    '</div>';
  }).join("");
  openSheet('<div class="flex items-start justify-between mb-2"><h3 class="display text-[20px] font-bold">Tipo de meditación</h3>'+closeBtn()+'</div>'+
    '<p class="text-[12.5px] t3 mb-4">Toca uno para usarlo. Con el botón de ajustes cambias los tiempos, el sonido y la voz, y lo guardas como tuyo.</p>'+
    '<div class="med-lista">'+filas+'</div>'+
    '<button class="btn btn-quiet w-full !py-3.5 mt-4" data-act="x-med-nuevo">Crear mi meditación</button>');
}
var medBorr=null;
function medSheetEditor(id){
  var base=id ? medTipo(id) : { id:"", n:"", d:"", i:4, h1:2, e:6, h2:0, guia:"resp" };
  var propio=!!(id && (S.medTipos||[]).filter(function(x){ return x.id===id; }).length);
  var P=medPref();
  medBorr={ id:propio?id:"", n:propio?base.n:(id?tr(base.n)+" "+tr("(mía)"):""), d:propio?base.d:"", i:base.i||4, h1:base.h1||0, e:base.e||6, h2:base.h2||0, guia:base.guia,
            sonido: base.sonido!=null?base.sonido:P.sonido, voz: base.voz!=null?base.voz:P.voz };
  medPintaEditor(propio);
}
/* el sonido: "ambos" (olas y cuenco), "olas", "cuenco" o "nada".
   Los tipos guardados antes tenían true/false. */
var MED_SONIDOS=[["ambos","Olas y cuenco"],["olas","Solo olas"],["cuenco","Solo cuenco"],["nada","Sin sonido"]];
function medModoSonido(v){ if(v===true || v==null) return "ambos"; if(v===false) return "nada"; return v; }
function medPintaEditor(propio){
  var B=medBorr;
  function paso(k, l){ return '<div class="med-paso"><span>'+l+'</span><div><button data-act="x-med-paso" data-k="'+k+'" data-v="-1" aria-label="Menos">−</button>'+
    '<b class="num">'+B[k]+' s</b><button data-act="x-med-paso" data-k="'+k+'" data-v="1" aria-label="Más">+</button></div></div>'; }
  var v=medVozElegida||medVoz();
  openSheet('<div class="flex items-start justify-between mb-4"><h3 class="display text-[20px] font-bold">'+(propio?"Tu meditación":"Nueva meditación")+'</h3>'+closeBtn()+'</div>'+
    '<input id="med-nombre" class="field mb-3" maxlength="24" placeholder="Nombre (ej. Antes del examen)" value="'+esc(B.n)+'">'+
    '<div class="med-guias"><button class="'+(B.guia==="resp"?"on":"")+'" data-act="x-med-guia" data-g="resp">Respiración guiada</button>'+
      '<button class="'+(B.guia==="silencio"?"on":"")+'" data-act="x-med-guia" data-g="silencio">Solo el tiempo</button></div>'+
    (B.guia==="resp" ? '<div class="med-pasos">'+paso("i","Inspira")+paso("h1","Mantén")+paso("e","Espira")+paso("h2","Pausa")+'</div>' : '')+
    '<p class="eyebrow mt-5 mb-2">Sonido</p>'+
    '<div class="med-sons">'+MED_SONIDOS.map(function(o){ return '<button class="'+(medModoSonido(B.sonido)===o[0]?"on":"")+'" data-act="x-med-son-modo" data-m="'+o[0]+'">'+o[1]+'</button>'; }).join("")+'</div>'+
    '<div class="pref-lista mt-4">'+
      '<button class="pref-fila" data-act="x-med-tog" data-k="voz" aria-pressed="'+(B.voz?"true":"false")+'"><span class="pref-txt"><b>Voz</b><span>Te guía hablando</span></span><span class="pref-sw"><i></i></span></button>'+
    '</div>'+
    (B.voz ? '<p class="med-voz-nota">'+(v?tr("Voz")+': <b>'+esc(v.name)+'</b>. ':'')+
      tr("Para una voz más natural en iPhone: Ajustes › Accesibilidad › Contenido leído › Voces › Español, y descarga una voz «mejorada» o «premium». La app la usará sola.")+'</p>' : '')+
    '<div class="flex gap-2 mt-5">'+
      (propio?'<button class="btn btn-quiet !py-3.5 !px-4" data-act="x-med-borra">Borrar</button>':'')+
      '<button class="btn btn-quiet flex-1 !py-3.5" data-act="x-med-probar">Probar</button>'+
      '<button class="btn btn-primary flex-1 !py-3.5" data-act="x-med-guarda">Guardar</button></div>');
}
function medLeeNombre(){ var n=document.getElementById("med-nombre"); if(n) medBorr.n=n.value.trim().slice(0,24); }
function medGuarda(){
  medLeeNombre();
  var B=medBorr; if(!B.n) B.n=tr("Mi meditación");
  if(!S.medTipos) S.medTipos=[];
  var t={ id:B.id||("m"+Date.now().toString(36)), n:B.n, d:B.guia==="resp"?"":tr("Solo el tiempo"), i:B.i, h1:B.h1, e:B.e, h2:B.h2, guia:B.guia, sonido:medModoSonido(B.sonido), voz:B.voz };
  var hecho=false; S.medTipos=S.medTipos.map(function(x){ if(x.id===t.id){ hecho=true; return t; } return x; });
  if(!hecho) S.medTipos.push(t);
  medPref().tipo=t.id; save(); closeSheet(); render();
  avisoNube("Guardada: «"+t.n+"».");
}

/* ════════ sonido: olas y cuenco, generados en el móvil (sin archivos) ════════ */
var MED_CTX=null;
function medAudio(){
  try{ var C=window.AudioContext||window.webkitAudioContext; if(!C) return null; if(!MED_CTX) MED_CTX=new C(); if(MED_CTX.state==="suspended") MED_CTX.resume(); return MED_CTX; }catch(e){ return null; }
}
/* un cuenco tibetano: parciales no armónicos que se apagan despacio, con un leve batido */
function medCuenco(f, vol, dur){
  var ctx=medAudio(); if(!ctx) return;
  var t=ctx.currentTime+0.03, sal=ctx.createGain(); sal.gain.value=1; sal.connect(medSalida(ctx));
  [[1,1,1],[2.71,.42,.7],[5.13,.16,.45],[8.4,.05,.3]].forEach(function(p){
    [0,1.6].forEach(function(det){
      try{
        var o=ctx.createOscillator(), g=ctx.createGain(), d=(dur||6)*p[2];
        o.type="sine"; o.frequency.value=f*p[0]+det*p[0];
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime((vol||.03)*p[1]*.5, t+0.06);
        g.gain.exponentialRampToValueAtTime(0.0001, t+d);
        o.connect(g); g.connect(sal); o.start(t); o.stop(t+d+0.1);
      }catch(e){}
    });
  });
}
/* las olas: ruido marrón filtrado; sube al inspirar y baja al espirar */
var MED_OLAS=null;
function medOlasEmpieza(){
  var ctx=medAudio(); if(!ctx || MED_OLAS) return;
  try{
    var n=ctx.sampleRate*4, buf=ctx.createBuffer(1, n, ctx.sampleRate), d=buf.getChannelData(0), last=0;
    for(var i=0;i<n;i++){ var w=Math.random()*2-1; last=(last+0.02*w)/1.02; d[i]=last*3.2; }
    /* que el bucle no chasquee: se funden el final y el principio */
    for(var k=0;k<2000;k++){ var a=k/2000; d[n-2000+k]=d[n-2000+k]*(1-a)+d[k]*a; }
    var src=ctx.createBufferSource(); src.buffer=buf; src.loop=true;
    var fil=ctx.createBiquadFilter(); fil.type="lowpass"; fil.frequency.value=420; fil.Q.value=0.5;
    var g=ctx.createGain(); g.gain.value=0.0001;
    src.connect(fil); fil.connect(g); g.connect(medSalida(ctx)); src.start();
    g.gain.linearRampToValueAtTime(0.03, ctx.currentTime+3);
    MED_OLAS={ src:src, fil:fil, g:g };
  }catch(e){ MED_OLAS=null; }
}
function medOlasA(vol, frec, seg){
  if(!MED_OLAS) return; var ctx=MED_CTX, t=ctx.currentTime;
  try{
    MED_OLAS.g.gain.cancelScheduledValues(t); MED_OLAS.g.gain.setValueAtTime(MED_OLAS.g.gain.value, t);
    MED_OLAS.g.gain.linearRampToValueAtTime(vol, t+Math.max(.3,seg));
    MED_OLAS.fil.frequency.cancelScheduledValues(t); MED_OLAS.fil.frequency.setValueAtTime(MED_OLAS.fil.frequency.value, t);
    MED_OLAS.fil.frequency.exponentialRampToValueAtTime(frec, t+Math.max(.3,seg));
  }catch(e){}
}
function medOlasPara(){
  if(!MED_OLAS) return; var o=MED_OLAS; MED_OLAS=null;
  try{ var t=MED_CTX.currentTime; o.g.gain.cancelScheduledValues(t); o.g.gain.setValueAtTime(o.g.gain.value,t); o.g.gain.linearRampToValueAtTime(0.0001, t+2); o.src.stop(t+2.1); }catch(e){}
}
function medSuena(){ return medA && medA.son && medA.modo!=="nada"; }
function medHayOlas(){ return medSuena() && (medA.modo==="ambos" || medA.modo==="olas"); }
function medHayCuenco(){ return medSuena() && (medA.modo==="ambos" || medA.modo==="cuenco"); }

/* ════════ voz: la más natural del móvil, frases enteras y sin prisa ════════ */
var medVozElegida=null;
function medVoz(){
  if(!window.speechSynthesis) return null;
  var vs=speechSynthesis.getVoices()||[], lang=(typeof IDIOMA==="string"?IDIOMA:"es"), mejor=null, pm=-99;
  vs.forEach(function(v){
    var l=(v.lang||"").toLowerCase().replace("_","-"); if(l.indexOf(lang)!==0) return;
    var p=0, n=v.name||"";
    if(/premium/i.test(n)) p+=12;
    if(/enhanced|mejorad|natural|neural|siri/i.test(n)) p+=9;
    if(/google/i.test(n)) p+=3;
    if(lang==="es" && l==="es-es") p+=2;
    if(/m[oó]nica|marisa|paulina|marisol|luciana|jorge|samantha|ava|zoe|amelie|alice|federica|elsa/i.test(n)) p+=1;
    if(v.localService===false) p+=1;
    if(/compact|eloquence|grandma|grandpa|albert|bad news|bahh|bells|boing|bubbles|cellos|jester|organ|superstar|trinoids|whisper|wobble|zarvox|rocko|shelley|flo|reed|sandy|eddy/i.test(n)) p-=20;
    if(p>pm){ pm=p; mejor=v; }
  });
  medVozElegida=mejor; return mejor;
}
if(window.speechSynthesis){ try{ speechSynthesis.onvoiceschanged=function(){ medVoz(); }; }catch(e){} }
function medHabla(txt){
  if(!window.speechSynthesis || !txt) return;
  try{
    var u=new SpeechSynthesisUtterance(tr(txt)), v=medVozElegida||medVoz();
    if(v){ u.voice=v; u.lang=v.lang; } else u.lang=(typeof IDIOMA==="string"?IDIOMA:"es");
    u.rate=0.9; u.pitch=1; u.volume=0.85;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  }catch(e){}
}
/* lo que dice en cada fase: en los primeros ciclos, frases completas; luego, nada (solo acompaña cada minuto) */
var MED_VOZ_FASE={ "in":["Inspira despacio por la nariz","Inspira","Inspira"], h1:["Mantén el aire","Mantén","Mantén"], ex:["Y suéltalo despacio","Suelta","Suelta"], h2:["Espera un momento","",""] };

/* ════════ la sesión a pantalla completa ════════ */
var medA=null, medReloj=null, medWake=null;
var MED_PREP=5;   /* segundos para colocarse */
function medEmpieza(){
  var P=medPref(), tp=medTipo(P.tipo);
  var modo=medModoSonido(tp.sonido!=null?tp.sonido:P.sonido), voz=tp.voz!=null?tp.voz:P.voz;
  medA={ tipo:tp, min:P.min, ini:Date.now(), pausa:0, pausadoEn:0, fase:"", frase:-1, son:modo!=="nada", modo:modo==="nada"?"ambos":modo, voz:voz, fin:false };
  if(modo==="nada") medA.son=false;
  medAudio();
  if(voz) medHabla(tp.guia==="resp"?"Ponte cómodo y cierra los ojos si quieres. Empezamos.":"Ponte cómodo. Empezamos en silencio.");
  if(medHayCuenco()) medCuenco(196, .05, 7);
  if(medHayOlas()) medOlasEmpieza();
  closeSheet(); medPintaCapa();
  clearInterval(medReloj); medReloj=setInterval(medAvanza, 100);
  try{ if(navigator.wakeLock && !medWake) navigator.wakeLock.request("screen").then(function(w){ medWake=w; w.addEventListener("release",function(){ medWake=null; }); }).catch(function(){}); }catch(e){}
}
function medTranscurrido(){ if(!medA) return 0; var ahora=medA.pausadoEn||Date.now(); return Math.max(0, (ahora-medA.ini-medA.pausa)/1000); }
var MED_ICO_SON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path class="on" d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/><path class="off" d="M16 10l5 5M21 10l-5 5"/></svg>';
var MED_ICO_VOZ='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5v3"/><path class="off" d="M4 4l16 16"/></svg>';
function medPintaCapa(){
  var capa=document.getElementById("med-capa");
  if(!medA){ if(capa){ capa.classList.remove("ve"); setTimeout(function(){ if(capa.parentNode) capa.parentNode.removeChild(capa); }, 600); } return; }
  if(!capa){ capa=document.createElement("div"); capa.id="med-capa"; document.body.appendChild(capa);
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ capa.classList.add("ve"); }); }); }
  capa.classList.toggle("silencio", medA.tipo.guia!=="resp");
  /* pétalos que cruzan con el viento: planos, rosas, cada uno a su ritmo */
  var petalos=""; for(var i=0;i<12;i++){ var x=(i*29%110)-15, dur=13+(i*7%9), del=-(i*2.3), tam=11+(i*5%9), col=(i%3===0)?"var(--pet2)":"var(--pet1)";
    petalos+='<span class="pet" style="left:'+x+'%;--dur:'+dur+'s;--del:'+del+'s;--vuelta:'+(3+(i%4))+'s;width:'+tam+'px;color:'+col+'">'+
      '<svg viewBox="0 0 20 24"><path d="M10 3.2 8.4 1C3.8 5.2 2 11.8 4.8 17.6 6.3 20.7 8.4 22.4 10 23c1.6-.6 3.7-2.3 5.2-5.4C18 11.8 16.2 5.2 11.6 1z" fill="currentColor"/></svg></span>'; }
  capa.innerHTML=
    '<div class="med-petalos" aria-hidden="true">'+petalos+'</div>'+
    '<div class="med-arriba"><span>'+esc(medNombre(medA.tipo))+'</span>'+
      '<button data-act="x-med-son" aria-label="Sonido" class="'+(medA.son?"on":"")+'">'+MED_ICO_SON+'</button>'+
      '<button data-act="x-med-voz" aria-label="Voz" class="'+(medA.voz?"on":"")+'">'+MED_ICO_VOZ+'</button></div>'+
    '<div class="med-centro" id="med-centro">'+
      '<svg class="med-prog" viewBox="0 0 200 200"><circle cx="100" cy="100" r="96" class="pista"/><circle cx="100" cy="100" r="96" class="arco" id="med-arco" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/></svg>'+
      '<div class="med-onda o3"></div><div class="med-onda o2"></div><div class="med-onda o1"></div><div class="med-bola"></div>'+
      '<div class="med-fase"><b id="med-fase-t">Prepárate</b><span class="num" id="med-fase-s"></span></div></div>'+
    '<p class="med-frase" id="med-frase"></p>'+
    '<div class="med-abajo"><span class="num" id="med-resta">--:--</span>'+
      '<div class="med-botones" id="med-botones">'+
        '<button class="med-pausa" data-act="x-med-pausa" aria-label="Pausar"><svg viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="5.5" width="3.4" height="13" rx="1.2"/><rect x="13.6" y="5.5" width="3.4" height="13" rx="1.2"/></svg></button>'+
      '</div><button class="med-salir" data-act="x-med-fin">Terminar</button></div>';
  medA.fase=""; medEscala(.62, .8); medAvanza();
}
function medEscala(s, seg){
  var c=document.getElementById("med-centro"); if(!c) return;
  c.style.setProperty("--t", seg+"s"); c.style.setProperty("--s", s);
}
function medTexto(id, txt){
  var el=document.getElementById(id); if(!el || el.dataset.txt===txt) return;
  el.dataset.txt=txt; el.classList.add("cambia");
  setTimeout(function(){ el.textContent=txt; el.classList.remove("cambia"); }, 220);
}
function medFaseDe(seg){
  var t=medA.tipo;
  if(seg<MED_PREP) return { k:"prep", l:"Prepárate", dur:MED_PREP, rest:MED_PREP-seg };
  if(t.guia!=="resp") return { k:"silencio", l:"Respira a tu ritmo", dur:0, rest:0 };
  var ciclo=t.i+t.h1+t.e+t.h2, x=(seg-MED_PREP)%ciclo, n=Math.floor((seg-MED_PREP)/ciclo);
  var F=[["in","Inspira",t.i],["h1","Mantén",t.h1],["ex","Espira",t.e],["h2","Pausa",t.h2]];
  for(var i=0;i<F.length;i++){ if(!F[i][2]) continue; if(x<F[i][2]) return { k:F[i][0], l:F[i][1], dur:F[i][2], rest:F[i][2]-x, n:n }; x-=F[i][2]; }
  return { k:"in", l:"Inspira", dur:t.i, rest:t.i, n:n };
}
function medAvanza(){
  if(!medA || medA.fin) return;
  var seg=medTranscurrido(), total=medA.min*60+MED_PREP;
  var rest=Math.max(0, total-seg), resta=document.getElementById("med-resta");
  if(resta){ var r=Math.ceil(Math.min(rest, medA.min*60)); resta.textContent=Math.floor(r/60)+":"+("0"+(r%60)).slice(-2); }
  var arco=document.getElementById("med-arco"); if(arco) arco.style.strokeDashoffset=(100-Math.min(100, Math.max(0,seg-MED_PREP)/(medA.min*60)*100)).toFixed(2);
  if(rest<=0){ medTermina(true); return; }
  if(medA.pausadoEn) return;
  var f=medFaseDe(seg), ss=document.getElementById("med-fase-s");
  if(ss) ss.textContent = f.dur && f.k!=="prep" ? Math.ceil(f.rest) : "";
  var clave=f.k+"|"+(f.n||0);
  if(clave!==medA.fase){
    medA.fase=clave;
    medTexto("med-fase-t", tr(f.l));
    if(f.k==="in") medEscala(1, f.rest);
    else if(f.k==="ex") medEscala(.52, f.rest);
    else if(f.k==="prep") medEscala(.62, .8);
    var capa=document.getElementById("med-capa"); if(capa){ capa.classList.toggle("lleno", f.k==="in"||f.k==="h1"); }
    if(medHayOlas()){
      if(f.k==="in") medOlasA(.085, 1300, f.rest);
      else if(f.k==="ex") medOlasA(.022, 360, f.rest);
      else if(f.k==="silencio") medOlasA(.04, 650, 3);
    }
    if(medHayCuenco() && f.k==="in" && (f.n||0)%2===0) medCuenco(293.7, .016, 4.5);
    if(medA.voz && medA.tipo.guia==="resp" && f.n!=null && f.n<3){ var fr=(MED_VOZ_FASE[f.k]||[])[Math.min(f.n,2)]; if(fr && f.dur>=2) medHabla(fr); }
  }
  /* una frase cada minuto */
  var nf=Math.floor((seg-MED_PREP)/60);
  if(seg>MED_PREP+20 && nf!==medA.frase && ((seg-MED_PREP)%60)>20){
    medA.frase=nf;
    var txt=MED_FRASES[(nf+Math.floor(medA.ini/1000))%MED_FRASES.length], p=document.getElementById("med-frase");
    if(p){ p.classList.remove("ve"); void p.offsetWidth; p.textContent=tr(txt); p.classList.add("ve"); }
    if(medA.voz && (medA.tipo.guia!=="resp" || nf>=1)) setTimeout(function(){ if(medA && !medA.pausadoEn) medHabla(txt); }, 400);
  }
}
function medPausa(){
  if(!medA) return;
  var b=document.querySelector("#med-botones .med-pausa");
  if(medA.pausadoEn){
    medA.pausa+=Date.now()-medA.pausadoEn; medA.pausadoEn=0; medA.fase="";
    if(medHayOlas()) medOlasA(.03, 500, 1.5);
    if(b) b.innerHTML='<svg viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="5.5" width="3.4" height="13" rx="1.2"/><rect x="13.6" y="5.5" width="3.4" height="13" rx="1.2"/></svg>';
  } else {
    medA.pausadoEn=Date.now(); try{ speechSynthesis.cancel(); }catch(e){}
    medTexto("med-fase-t", tr("En pausa")); medEscala(.62, 1.2);
    if(MED_OLAS) medOlasA(.008, 300, 1.2);
    if(b) b.innerHTML='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>';
  }
  medAvanza();
}
function medTermina(completa){
  if(!medA) return;
  var seg=medTranscurrido()-MED_PREP, min=completa ? medA.min : Math.floor(Math.max(0,seg)/60), d=today();
  clearInterval(medReloj);
  try{ speechSynthesis.cancel(); }catch(e){}
  try{ if(medWake){ medWake.release(); medWake=null; } }catch(e){}
  medA.fin=true;
  var gan=0;
  if(min>=1){
    if(!S.habits[d]) S.habits[d]={};
    var antes=medXP(d); S.habits[d].medita=(S.habits[d].medita||0)+min; gan=medXP(d)-antes; save();
  }
  medOlasPara();
  if(medHayCuenco() || (medA.son && medA.modo==="olas")) medCuenco(196, .05, 8);
  if(medA.voz && min>=1) setTimeout(function(){ medHabla("Muy bien. Vuelve poco a poco, a tu ritmo."); }, 900);
  var capa=document.getElementById("med-capa"); if(!capa){ medA=null; return; }
  capa.classList.add("fin"); capa.classList.remove("lleno");
  var c=capa.querySelector(".med-centro"), ab=capa.querySelector(".med-abajo"), fr=document.getElementById("med-frase");
  if(fr) fr.textContent="";
  if(c) c.innerHTML='<div class="med-hecho">'+
    (min>=1 ? '<svg class="med-ok" viewBox="0 0 64 64"><circle cx="32" cy="32" r="29"/><path d="M20 33l8 8 16-17"/></svg>' : '')+
    '<b class="num">'+(min>=1?min+" min":"—")+'</b><span>'+
    (min>=1 ? tr("de meditación")+(gan>0?" · +"+gan+" XP":"") : tr("Menos de un minuto: no se guarda."))+'</span></div>';
  if(ab) ab.innerHTML='<div class="med-botones fin">'+
    (min>=1 && typeof pegSheet==="function" ? '<button class="med-bt" data-act="x-med-comparte">Compartir en historia</button>' : '')+
    '<button class="med-salir" data-act="x-med-cierra">'+(min>=1?"Cerrar":"Salir")+'</button></div>';
  render();
}
function medCierra(){ medOlasPara(); medA=null; medPintaCapa(); }

function calmaAccion(a, el){
  if(a.indexOf("x-med-")!==0) return false;
  var P=medPref();
  if(a==="x-med-min"){ P.min=+el.dataset.n; save(); medPintaTarjeta(); sonido("tick"); return true; }
  if(a==="x-med-tipos"){ medSheetTipos(); return true; }
  if(a==="x-med-elige"){ P.tipo=el.dataset.id; save(); closeSheet(); medPintaTarjeta(); return true; }
  if(a==="x-med-edita"){ medSheetEditor(el.dataset.id); return true; }
  if(a==="x-med-nuevo"){ medSheetEditor(null); return true; }
  if(a==="x-med-paso"){ medLeeNombre(); var k=el.dataset.k, v=medBorr[k]+(+el.dataset.v), mn=(k==="i"||k==="e")?2:0; medBorr[k]=Math.max(mn, Math.min(12, v)); medPintaEditor(!!medBorr.id); return true; }
  if(a==="x-med-guia"){ medLeeNombre(); medBorr.guia=el.dataset.g; medPintaEditor(!!medBorr.id); return true; }
  if(a==="x-med-tog"){ medLeeNombre(); medBorr[el.dataset.k]=!medBorr[el.dataset.k]; medPintaEditor(!!medBorr.id); return true; }
  if(a==="x-med-son-modo"){ medLeeNombre(); medBorr.sonido=el.dataset.m; medPintaEditor(!!medBorr.id);
    var m=el.dataset.m; if(m==="ambos"||m==="cuenco") medCuenco(293.7, .03, 5); return true; }
  if(a==="x-med-probar"){ var mm=medModoSonido(medBorr.sonido); if(mm==="ambos"||mm==="cuenco"||mm==="olas") medCuenco(196, .04, 6);
    if(medBorr.voz){ medHabla("Inspira despacio por la nariz. Y suéltalo despacio."); if(!window.speechSynthesis) avisoNube("Tu navegador no tiene voz."); } return true; }
  if(a==="x-med-guarda"){ medGuarda(); return true; }
  if(a==="x-med-borra"){ S.medTipos=(S.medTipos||[]).filter(function(x){ return x.id!==medBorr.id; }); if(P.tipo===medBorr.id) P.tipo="calma"; save(); closeSheet(); render(); return true; }
  if(a==="x-med-go"){ medEmpieza(); return true; }
  if(a==="x-med-pausa"){ medPausa(); return true; }
  if(a==="x-med-fin"){ medTermina(false); return true; }
  if(a==="x-med-cierra"){ medCierra(); return true; }
  if(a==="x-med-comparte"){ medCierra(); setTimeout(function(){ pegSheet("medita"); }, 200); return true; }
  if(a==="x-med-son"){ medA.son=!medA.son; el.classList.toggle("on", medA.son);
    if(!medA.son) medOlasPara(); else if(medHayOlas()){ medOlasEmpieza(); medA.fase=""; }
    return true; }
  if(a==="x-med-voz"){ medA.voz=!medA.voz; el.classList.toggle("on", medA.voz); if(!medA.voz){ try{ speechSynthesis.cancel(); }catch(e){} } return true; }
  return false;
}

var CALMA_CSS=[
'#med-card .med-mins{ display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }',
'#med-card .med-mins button{ border-radius:14px; padding:10px 0 8px; background:var(--fill); box-shadow:inset 0 0 0 1px var(--hairline-2); display:flex; flex-direction:column; align-items:center; transition:all .25s var(--ease); }',
'#med-card .med-mins b{ font-size:19px; font-weight:800; line-height:1; } #med-card .med-mins span{ font-size:10.5px; color:var(--t3); margin-top:3px; }',
'#med-card .med-mins button.on{ background:var(--accent); color:var(--on-accent); box-shadow:none; } #med-card .med-mins button.on span{ color:inherit; opacity:.8; }',
'#med-card .med-tipo{ width:100%; margin-top:10px; display:flex; align-items:center; gap:12px; text-align:left; padding:12px 14px; border-radius:16px; background:var(--fill); box-shadow:inset 0 0 0 1px var(--hairline-2); }',
'#med-card .med-tipo-ic{ width:34px; height:34px; border-radius:11px; display:grid; place-items:center; background:color-mix(in srgb,var(--accent) 14%,transparent); color:var(--accent); flex:0 0 auto; }',
'#med-card .med-tipo-ic .ic{ width:20px; height:20px; }',
'#med-card .med-tipo-t{ flex:1; min-width:0; } #med-card .med-tipo-t b{ display:block; font-size:14.5px; } #med-card .med-tipo-t small{ display:block; font-size:12px; color:var(--t3); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
'#med-card .med-flecha{ width:16px; height:16px; color:var(--t3); flex:0 0 auto; }',
'#med-card .med-go{ width:100%; margin-top:12px; height:54px; border-radius:18px; font-size:17px; font-weight:800; color:var(--on-accent); background:linear-gradient(145deg,var(--accent),color-mix(in srgb,var(--accent) 70%,var(--violet))); box-shadow:0 10px 26px -12px color-mix(in srgb,var(--accent) 70%,transparent); }',
'#med-card .med-semana{ display:flex; gap:8px; align-items:flex-end; }',
'#med-card .med-dia{ flex:1; display:flex; flex-direction:column; align-items:center; gap:6px; } #med-card .med-dia i{ display:block; width:100%; border-radius:8px; background:var(--accent); }',
'#med-card .med-dia span{ font-size:10.5px; color:var(--t3); } #med-card .med-dia.hoy span{ color:var(--t1); font-weight:600; }',
'.med-lista{ display:flex; flex-direction:column; gap:8px; }',
'.med-fila{ display:flex; align-items:center; border-radius:16px; background:var(--fill); box-shadow:inset 0 0 0 1px var(--hairline-2); }',
'.med-fila.on{ box-shadow:inset 0 0 0 2px var(--accent); }',
'.med-fila-b{ flex:1; text-align:left; padding:12px 14px; min-width:0; } .med-fila-b b{ display:block; font-size:15px; } .med-fila-b small{ display:block; font-size:12px; color:var(--t3); margin-top:1px; }',
'.med-fila-e{ width:48px; height:48px; display:grid; place-items:center; color:var(--t2); } .med-fila-e svg{ width:20px; height:20px; }',
'.med-guias{ display:grid; grid-template-columns:1fr 1fr; gap:8px; } .med-guias button, .med-sons button{ padding:11px 8px; border-radius:14px; font-size:13.5px; font-weight:700; background:var(--fill); box-shadow:inset 0 0 0 1px var(--hairline-2); }',
'.med-guias button.on, .med-sons button.on{ background:var(--accent); color:var(--on-accent); box-shadow:none; }',
'.med-sons{ display:grid; grid-template-columns:1fr 1fr; gap:8px; }',
'.med-voz-nota{ font-size:12px; line-height:1.45; color:var(--t3); margin-top:8px; } .med-voz-nota b{ color:var(--t2); }',
'.med-pasos{ margin-top:12px; display:grid; grid-template-columns:1fr 1fr; gap:8px; }',
'.med-paso{ border-radius:14px; background:var(--fill); padding:10px 12px; } .med-paso > span{ display:block; font-size:12px; color:var(--t3); margin-bottom:6px; }',
'.med-paso > div{ display:flex; align-items:center; justify-content:space-between; } .med-paso button{ width:32px; height:32px; border-radius:10px; background:var(--glass-bg); box-shadow:inset 0 0 0 1px var(--hairline); font-size:18px; font-weight:700; }',
'.med-paso b{ font-size:16px; }',
/* ── pantalla completa: plana, con los colores del tema, muy zen ── */
'#med-capa{ --pet1:#f6b5c8; --pet2:#ee94b0; --md-suave:color-mix(in srgb,var(--accent) 9%,var(--bg)); --md-medio:color-mix(in srgb,var(--accent) 18%,var(--bg)); --md-fuerte:color-mix(in srgb,var(--accent) 34%,var(--bg));',
'  position:fixed; inset:0; z-index:120; display:flex; flex-direction:column; align-items:center; overflow:hidden;',
'  padding:calc(16px + env(safe-area-inset-top)) 22px calc(26px + env(safe-area-inset-bottom)); color:var(--t1); background:var(--bg); opacity:0; transition:opacity .7s var(--ease); }',
'html.dark #med-capa{ --pet1:#c98ea1; --pet2:#b0768b; }',
'#med-capa.ve{ opacity:1; }',
'#med-capa > *:not(.med-petalos){ position:relative; z-index:1; }',
/* pétalos */
'#med-capa .med-petalos{ position:absolute; inset:0; z-index:0; pointer-events:none; overflow:hidden; }',
'#med-capa .pet{ position:absolute; top:-8%; display:block; opacity:.85; animation:petCae var(--dur) linear var(--del) infinite; }',
'#med-capa .pet svg{ display:block; width:100%; height:auto; animation:petGira var(--vuelta) ease-in-out infinite alternate; transform-origin:50% 40%; }',
'@keyframes petCae{ 0%{ transform:translate(0,0); } 25%{ transform:translate(9vw,28vh); } 50%{ transform:translate(4vw,56vh); } 75%{ transform:translate(16vw,84vh); } 100%{ transform:translate(12vw,116vh); } }',
'@keyframes petGira{ 0%{ transform:rotate(-35deg) scaleX(1); } 50%{ transform:rotate(10deg) scaleX(.45); } 100%{ transform:rotate(55deg) scaleX(1); } }',
'@media (prefers-reduced-motion:reduce){ #med-capa .pet:nth-child(n+5){ display:none; } }',
/* arriba */
'#med-capa .med-arriba{ width:100%; display:flex; align-items:center; gap:8px; }',
'#med-capa .med-arriba span{ flex:1; font-size:12px; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--t3); }',
'#med-capa .med-arriba button{ width:40px; height:40px; border-radius:99px; display:grid; place-items:center; background:var(--fill); color:var(--t3); transition:all .3s var(--ease); }',
'#med-capa .med-arriba button.on{ background:var(--md-medio); color:var(--accent); } #med-capa .med-arriba svg{ width:20px; height:20px; }',
'#med-capa .med-arriba button .off{ display:none; } #med-capa .med-arriba button:not(.on) .off{ display:inline; } #med-capa .med-arriba button:not(.on) .on{ display:none; }',
/* el centro: círculos planos que respiran */
'#med-capa .med-centro{ --s:.62; --t:1s; flex:1; width:100%; display:grid; place-items:center; }',
'#med-capa .med-centro > *{ grid-area:1/1; }',
'#med-capa .med-prog{ width:min(82vw,350px); height:auto; transform:rotate(-90deg); }',
'#med-capa .med-prog circle{ fill:none; stroke-width:1.2; } #med-capa .med-prog .pista{ stroke:var(--hairline); }',
'#med-capa .med-prog .arco{ stroke:var(--accent); stroke-linecap:round; transition:stroke-dashoffset .4s linear; }',
'#med-capa .med-bola, #med-capa .med-onda{ width:min(58vw,250px); aspect-ratio:1; border-radius:50%; transition:transform var(--t) cubic-bezier(.42,0,.35,1); }',
'#med-capa .med-onda.o3{ background:var(--md-suave); transform:scale(calc(var(--s) * 1.28)); transition-delay:.18s; }',
'#med-capa .med-onda.o2{ background:var(--md-medio); transform:scale(calc(var(--s) * 1.13)); transition-delay:.09s; opacity:.8; }',
'#med-capa .med-onda.o1{ display:none; }',
'#med-capa .med-bola{ background:var(--md-fuerte); transform:scale(var(--s)); }',
'#med-capa.silencio .med-bola{ animation:medLibre 12s ease-in-out infinite; }',
'#med-capa.silencio .med-onda{ animation:medLibreO 12s ease-in-out infinite; }',
'@keyframes medLibre{ 0%,100%{ transform:scale(.55); } 45%{ transform:scale(.9); } }',
'@keyframes medLibreO{ 0%,100%{ transform:scale(.7); } 45%{ transform:scale(1.2); } }',
'#med-capa .med-fase{ z-index:2; display:flex; flex-direction:column; align-items:center; pointer-events:none; }',
'#med-capa .med-fase b{ font-family:"Plus Jakarta Sans",sans-serif; font-size:24px; font-weight:600; letter-spacing:.02em; color:var(--t1); transition:opacity .22s ease, transform .3s ease; }',
'#med-capa .med-fase b.cambia{ opacity:0; transform:translateY(4px); }',
'#med-capa .med-fase span{ font-size:15px; font-weight:600; color:var(--t2); margin-top:4px; min-height:20px; }',
'#med-capa .med-frase{ min-height:46px; max-width:300px; text-align:center; font-size:15px; font-weight:500; line-height:1.5; color:var(--t2); opacity:0; transition:opacity 1.6s ease; margin:4px 0 12px; }',
'#med-capa .med-frase.ve{ opacity:1; }',
/* abajo */
'#med-capa .med-abajo{ display:flex; flex-direction:column; align-items:center; gap:10px; width:100%; }',
'#med-capa #med-resta{ font-size:16px; font-weight:600; letter-spacing:.06em; color:var(--t3); }',
'#med-capa .med-botones{ display:flex; justify-content:center; width:100%; max-width:320px; }',
'#med-capa .med-pausa{ width:62px; height:62px; border-radius:50%; display:grid; place-items:center; background:var(--md-medio); color:var(--accent); transition:transform .3s var(--spring); }',
'#med-capa .med-pausa:active{ transform:scale(.92); } #med-capa .med-pausa svg{ width:22px; height:22px; }',
'#med-capa .med-salir{ padding:10px 16px; color:var(--t3); font-weight:600; font-size:14px; }',
'#med-capa .med-botones.fin{ flex-direction:column; align-items:center; gap:4px; }',
'#med-capa .med-bt{ width:100%; height:54px; border-radius:99px; background:var(--accent); color:var(--on-accent); font-weight:800; font-size:16px; }',
/* al acabar */
'#med-capa .med-hecho{ display:flex; flex-direction:column; align-items:center; text-align:center; animation:medAparece .9s var(--ease) both; }',
'#med-capa .med-hecho b{ font-family:"Plus Jakarta Sans",sans-serif; font-size:54px; font-weight:700; letter-spacing:-.02em; margin-top:16px; } #med-capa .med-hecho span{ font-size:15px; color:var(--t2); }',
'#med-capa .med-ok{ width:84px; height:84px; } #med-capa .med-ok circle{ fill:var(--md-medio); stroke:none; }',
'#med-capa .med-ok path{ fill:none; stroke:var(--accent); stroke-width:3.5; stroke-linecap:round; stroke-linejoin:round; stroke-dasharray:40; stroke-dashoffset:40; animation:medTraza .9s .3s cubic-bezier(.6,0,.2,1) forwards; }',
'@keyframes medTraza{ to{ stroke-dashoffset:0; } }',
'@keyframes medAparece{ from{ opacity:0; transform:scale(.94); } to{ opacity:1; transform:none; } }'
].join("\n");

/* el icono de meditación: una flor de loto */
ICO_B.loto='<path d="M12 19.5c-2.8-1.7-4.3-4.3-4.3-7.2 0-2.6 1.5-5.1 4.3-7.8 2.8 2.7 4.3 5.2 4.3 7.8 0 2.9-1.5 5.5-4.3 7.2z"/><path d="M7.9 10.6C5.8 10 3.9 10 2.5 10.6c.3 4.9 4.3 8.9 9.5 8.9"/><path d="M16.1 10.6c2.1-.6 4-.6 5.4 0-.3 4.9-4.3 8.9-9.5 8.9"/>';

/* engancharse a la app: acciones, pintado y estilos */
var _calmaGA=grupoAccion;
grupoAccion=function(a, el){ if(calmaAccion(a, el)) return true; return _calmaGA.apply(this, arguments); };
var _calmaTR=grupoTrasRender;
grupoTrasRender=function(){ var r=_calmaTR.apply(this, arguments); if(view==="vital") medPintaTarjeta(); return r; };
(function(){ var st=document.createElement("style"); st.id="calma-css"; st.textContent=CALMA_CSS; document.head.appendChild(st); })();

