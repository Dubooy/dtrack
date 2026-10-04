/* ════════════════════════════════════════════════════════════════
   PEGATINAS: imágenes con fondo transparente para ponerlas encima
   de una foto en las historias (como las de Strava). Un dato grande
   y «Peak» pequeño. Hay una general del día (anillos o cifras) y
   una por actividad: estudio, ejercicio, meditación y hábitos.
   Salen solas al terminar algo (pegOfrece) y desde «Compartir mi
   día» en el Resumen. La imagen de la semana queda como otra opción.
   ════════════════════════════════════════════════════════════════ */
var PEG_TIPOS=[
  { k:"anillos", n:"Mi día" },
  { k:"cifras",  n:"Mi día en cifras" },
  { k:"estudio", n:"Estudio" },
  { k:"ejercicio", n:"Ejercicio" },
  { k:"medita",  n:"Meditación" },
  { k:"habitos", n:"Hábitos" },
  { k:"semana",  n:"Mi semana" }
];
var PEGKEY="dtrack-peg-tinta", pegActual="anillos", pegMes=null;
function pegTinta(){ try{ return localStorage.getItem(PEGKEY)==="oscura" ? "#111114" : "#ffffff"; }catch(e){ return "#ffffff"; } }
function pegColorVar(nombre, def){
  try{
    var v=getComputedStyle(document.documentElement).getPropertyValue(nombre).trim(); if(!v) return def;
    var c=document.createElement("canvas").getContext("2d"); c.fillStyle="#010203"; c.fillStyle=v;
    return c.fillStyle==="#010203" ? def : c.fillStyle;
  }catch(e){ return def; }
}
/* los iconos de línea de la app, dibujados en el lienzo */
function pegIcono(c, k, x, y, lado, color){
  var svg=(ICO_B[k]||ICO_B.meta), s=lado/24;
  c.save(); c.translate(x, y); c.scale(s, s);
  c.strokeStyle=color; c.lineWidth=1.9; c.lineCap="round"; c.lineJoin="round";
  var m, re=/<(path|circle|rect)([^>]*)\/?>/g;
  while((m=re.exec(svg))){
    var at={}, r2=/(\w+)="([^"]*)"/g, q; while((q=r2.exec(m[2]))) at[q[1]]=q[2];
    try{
      if(m[1]==="path" && at.d && window.Path2D) c.stroke(new Path2D(at.d));
      else if(m[1]==="circle"){ c.beginPath(); c.arc(+at.cx, +at.cy, +at.r, 0, 6.2832); c.stroke(); }
      else if(m[1]==="rect"){ c.beginPath(); redondo(c, +at.x, +at.y, +at.width, +at.height, +(at.rx||0)); c.stroke(); }
    }catch(e){}
  }
  c.restore();
}
function pegMarca(c, cx, y, FG){
  var F='"Plus Jakarta Sans", -apple-system, sans-serif';
  c.font="800 34px "+F; var tw=c.measureText("Peak.").width, x=cx-(tw+36)/2;
  c.globalAlpha=.8; c.fillStyle=FG;
  c.beginPath(); c.moveTo(x+12,y-30); c.lineTo(x+24,y-2); c.lineTo(x+12,y-5); c.lineTo(x,y-2); c.closePath(); c.fill();
  c.globalAlpha=.4; c.beginPath(); c.moveTo(x+12,y+20); c.lineTo(x+24,y-2); c.lineTo(x+12,y+1); c.lineTo(x,y-2); c.closePath(); c.fill();
  c.globalAlpha=.8; c.textAlign="left"; c.fillText("Peak.", x+36, y+10); c.globalAlpha=1;
}
function pegAjusta(c, txt, peso, tam, maxW, F){
  var t=tam; c.font=peso+" "+t+"px "+F;
  while(c.measureText(txt).width>maxW && t>40){ t-=6; c.font=peso+" "+t+"px "+F; }
  return t;
}
function pegDatos(t){
  var tc=todaysChallenges(t).length, cd=chOf(t).length, ni=idealActivos().length, ck=checksOf(t).length, sa=saludHoy(t);
  var den=tc+ni+4, pct=den?Math.round((cd+ck+sa)/den*100):0;
  var l=lunesDe(t), sem=0; for(var i=0;i<7;i++){ var d=addDays(l,i); if(d<=t && wentGym(d)) sem++; }
  return { tc:tc, cd:cd, ni:ni, ck:ck, sa:sa, pct:pct, est:estudioMinDia(t), gym:wentGym(t), gymSem:sem,
           dep:((S.deporteDia&&S.deporteDia[t])||[]), med:(typeof medMinDia==="function"?medMinDia(t):0) };
}
function pegDibuja(tipo){
  var t=today(), D=pegDatos(t), FG=pegTinta(), claro=(FG==="#ffffff");
  var F='"Plus Jakarta Sans", -apple-system, sans-serif', FI='Inter, -apple-system, sans-serif';
  var W=1000, H = tipo==="anillos" ? 820 : 640;
  var cv=document.createElement("canvas"); cv.width=W; cv.height=H;
  var c=cv.getContext("2d"); if(!c) return null;
  function sombra(on){ if(!claro){ c.shadowColor="transparent"; return; } c.shadowColor=on?"rgba(0,0,0,.35)":"transparent"; c.shadowBlur=on?18:0; c.shadowOffsetY=on?3:0; }
  sombra(true); c.textAlign="center"; c.fillStyle=FG;
  var cx=W/2;
  function cabecera(ik, txt){
    c.font="800 34px "+FI; var tw=c.measureText(txt.toUpperCase()).width, x=cx-(tw+62)/2;
    pegIcono(c, ik, x, 34, 44, FG);
    c.textAlign="left"; c.globalAlpha=.9; c.fillText(txt.toUpperCase(), x+62, 70); c.globalAlpha=1; c.textAlign="center";
  }
  function grande(txt, y){ pegAjusta(c, txt, "800", 210, W-80, F); c.fillText(txt, cx, y); }
  function sub(txt, y){ c.globalAlpha=.85; c.font="700 46px "+FI; c.fillText(txt, cx, y); c.globalAlpha=1; }
  if(tipo==="estudio"){
    cabecera("estudiar", tr("Estudio"));
    grande(D.est ? horasTxt(D.est) : "0 min", 320); sub(tr("de estudio hoy"), 410);
  } else if(tipo==="ejercicio"){
    cabecera("moverme", tr("Ejercicio"));
    grande(D.gym ? (D.dep.length ? D.dep.slice(0,2).map(function(x){ return tr(x); }).join(" + ") : tr("Hecho")+" ✓") : tr("Hoy toca"), 320);
    sub(D.gymSem===1 ? tr("1 día esta semana") : D.gymSem+" "+tr("días esta semana"), 410);
  } else if(tipo==="medita"){
    cabecera("loto", tr("Meditación"));
    grande(D.med+" min", 320);
    var tp=(typeof medTipo==="function") ? medTipo(medPref().tipo) : null;
    sub(tr("meditando hoy")+(tp?" · "+medNombre(tp):""), 410);
  } else if(tipo==="habitos"){
    cabecera("habito", tr("Hábitos"));
    grande(D.ck+"/"+D.ni, 320); sub(D.ni && D.ck>=D.ni ? tr("todos los hábitos de hoy") : tr("hábitos hoy"), 410);
  } else if(tipo==="cifras"){
    cabecera("evo", tr("Mi día"));
    var cif=[[D.est?horasTxt(D.est):"0 min", tr("estudio")],[D.gym?"✓":"—", tr("ejercicio")],[D.ck+"/"+D.ni, tr("hábitos")]];
    if(D.med) cif[0]=[D.est?horasTxt(D.est):D.med+" min", D.est?tr("estudio"):tr("meditación")];
    var cw=(W-80)/3;
    cif.forEach(function(x,k){
      var xx=40+cw*k+cw/2;
      pegAjusta(c, x[0], "800", 118, cw-24, F); c.fillText(x[0], xx, 300);
      c.globalAlpha=.8; c.font="700 38px "+FI; c.fillText(x[1], xx, 370); c.globalAlpha=1;
    });
  } else if(tipo==="mes"){
    var M=pegMes||{}, nom=M.nombre||"";
    cabecera("cal", cap(nom));
    grande(M.activos+" "+(M.activos===1?tr("día"):tr("días")), 320);
    sub(tr("activos este mes")+(M.fotos?" · "+M.fotos+" 📸":""), 410);
  } else {
    /* anillos: el porcentaje del día grande y los tres anillos debajo */
    cabecera("evo", tr("Mi día"));
    c.font="800 190px "+F; c.fillText(D.pct+" %", cx, 290);
    var cols=[pegColorVar("--accent","#6366f1"), pegColorVar("--violet","#a855f7"), pegColorVar("--good","#22c55e")];
    var an=[[D.cd,D.tc,tr("Retos")],[D.ck,D.ni,tr("Hábitos")],[D.sa,4,(S.labels&&S.labels.vital)||"Vital"]];
    var R=92, gap=(W-80)/3;
    an.forEach(function(a,k){
      var x=40+gap*k+gap/2, y=470, f=a[1]?Math.min(1,a[0]/a[1]):0;
      sombra(false); c.lineWidth=26; c.lineCap="round";
      c.strokeStyle=claro?"rgba(255,255,255,.28)":"rgba(0,0,0,.14)"; c.beginPath(); c.arc(x,y,R,0,6.2832); c.stroke();
      sombra(true);
      if(f>0){ c.strokeStyle=cols[k]; c.beginPath(); c.arc(x,y,R,-Math.PI/2,-Math.PI/2+6.2832*Math.max(.02,f)); c.stroke(); }
      c.fillStyle=FG; c.font="800 52px "+F; c.fillText(a[0]+"/"+a[1], x, y+18);
      c.globalAlpha=.85; c.font="700 36px "+FI; c.fillText(a[2], x, y+R+62); c.globalAlpha=1;
    });
  }
  sombra(true); pegMarca(c, cx, H-54, FG); sombra(false);
  return cv;
}

/* ── la ventana para elegir y compartir ── */
function pegSheet(tipo){
  if(tipo) pegActual=tipo;
  if(pegActual==="semana") pegActual="anillos";
  var cv=pegDibuja(pegActual); if(!cv) return;
  var FG=pegTinta(), puede=!!(navigator.canShare && !enVisor());
  openSheet('<div class="flex items-start justify-between mb-2"><h3 class="display text-[19px] font-bold">Compartir en historia</h3>'+closeBtn()+'</div>'+
    '<div class="peg-tipos">'+PEG_TIPOS.concat(pegActual==="mes"?[{k:"mes",n:"Mi mes"}]:[]).map(function(x){
      return '<button class="'+(x.k===pegActual?"on":"")+'" data-act="x-peg-tipo" data-k="'+x.k+'">'+x.n+'</button>'; }).join("")+'</div>'+
    '<div class="peg-tinta"><button class="cs-c tr'+(FG==="#ffffff"?" on":"")+'" style="--tinta:#ffffff" data-act="x-peg-tinta" data-k="blanca" aria-label="Letras blancas"></button>'+
      '<button class="cs-c tr'+(FG!=="#ffffff"?" on":"")+'" style="--tinta:#111114" data-act="x-peg-tinta" data-k="oscura" aria-label="Letras oscuras"></button>'+
      '<span>'+(FG==="#ffffff"?"Letras blancas":"Letras oscuras")+'</span></div>'+
    '<div class="cs-marco tr peg-marco"><img class="cs-img" id="peg-img" src="'+cv.toDataURL("image/png")+'" alt="Pegatina de Peak"></div>'+
    '<p class="cs-ayuda">Fondo transparente: en Instagram, añádela como pegatina encima de tu foto.</p>'+
    '<div class="cs-botones"><button class="btn btn-quiet flex-1 !py-3.5" data-act="x-peg-bajar">Descargar</button>'+
      (puede ? '<button class="btn btn-primary flex-1 !py-3.5" data-act="x-peg-compartir">Compartir</button>' : '')+'</div>');
}
function pegComparte(){
  var cv=pegDibuja(pegActual); if(!cv) return;
  cv.toBlob(function(b){
    var file=null; try{ if(b) file=new File([b], "peak-"+pegActual+".png", {type:"image/png"}); }catch(e){}
    if(file && navigator.canShare && navigator.canShare({ files:[file] })) navigator.share({ files:[file] }).catch(function(){});
    else pegDescarga();
  }, "image/png");
}
function pegDescarga(){
  var cv=pegDibuja(pegActual); if(!cv) return;
  var nombre="peak-"+pegActual+".png";
  cv.toBlob(function(b){
    if(!b) return;
    function normal(){
      try{ var u=URL.createObjectURL(b), a=document.createElement("a"); a.href=u; a.download=nombre; document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(function(){ URL.revokeObjectURL(u); }, 1500); avisoNube("Imagen descargada."); }
      catch(e){ avisoNube("Mantén pulsada la imagen para guardarla."); }
    }
    var cl=window.claude;
    if(cl && typeof cl.use==="function"){
      cl.use("downloads").then(function(dl){
        if(!dl){ normal(); return; }
        dl.save({ filename:nombre, data:b }).then(function(){ avisoNube("Imagen guardada."); }, function(e){ if(e && e.code==="declined") return; avisoNube("Mantén pulsada la imagen para guardarla."); });
      }, function(){ normal(); });
    } else normal();
  }, "image/png");
}

/* ── al terminar algo: una barrita para compartirlo ── */
function pegOfrece(tipo, txt){
  if(!S.pegVisto) S.pegVisto={};
  var d=today(); if(S.pegVisto[tipo]===d) return; S.pegVisto[tipo]=d; save();
  var b=document.getElementById("peg-barra"); if(b && b.parentNode) b.parentNode.removeChild(b);
  b=document.createElement("div"); b.id="peg-barra";
  b.innerHTML='<span>'+esc(tr(txt||"¿Lo compartes en tu historia?"))+'</span><button class="peg-si" data-act="x-peg-abre" data-k="'+tipo+'">'+tr("Compartir")+'</button>'+
    '<button class="peg-no" data-act="x-peg-cierra" aria-label="Cerrar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';
  document.body.appendChild(b);
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ b.classList.add("ve"); }); });
  clearTimeout(pegOfrece._t); pegOfrece._t=setTimeout(pegCierraBarra, 9000);
}
function pegCierraBarra(){ var b=document.getElementById("peg-barra"); if(!b) return; b.classList.remove("ve"); setTimeout(function(){ if(b.parentNode) b.parentNode.removeChild(b); }, 350); }

/* estudio: al terminar una sesión con minutos guardados */
var _pegEstTermina=estudioTermina;
estudioTermina=function(){ var antes=estudioMinDia(today()); var r=_pegEstTermina.apply(this, arguments); if(estudioMinDia(today())>antes) setTimeout(function(){ pegOfrece("estudio", "Sesión guardada. ¿La compartes en tu historia?"); }, 600); return r; };

/* hábitos: cuando cierras todos los del día */
var pegHabAntes=null;
function pegVigilaHabitos(){
  var t=today(), ni=idealActivos().length, ck=checksOf(t).length, lleno=(ni>0 && ck>=ni);
  if(pegHabAntes===false && lleno) pegOfrece("habitos", "Todos los hábitos de hoy. ¿Lo compartes?");
  pegHabAntes=lleno;
}
/* botón en el Resumen, debajo de los anillos */
function pegBotonResumen(){
  var an=document.getElementById("hoy-anillos"); if(!an || document.getElementById("peg-hoy")) return;
  var b=document.createElement("button"); b.id="peg-hoy"; b.setAttribute("data-act","x-peg-abre"); b.setAttribute("data-k","anillos");
  b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7 8l5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg><span>'+tr("Compartir mi día")+'</span>';
  var det=document.querySelector("#hoy .hy-det"), ref=det||an;
  ref.parentNode.insertBefore(b, ref.nextSibling);
}

function pegAccion(a, el){
  if(a.indexOf("x-peg-")!==0) return false;
  if(a==="x-peg-abre"){ pegCierraBarra(); pegSheet(el.dataset.k); return true; }
  if(a==="x-peg-cierra"){ pegCierraBarra(); return true; }
  if(a==="x-peg-tipo"){
    if(el.dataset.k==="semana"){ closeSheet(); setTimeout(function(){ compartirSemana(lunesDe(today())); }, 120); return true; }
    pegActual=el.dataset.k; var cv=pegDibuja(pegActual), img=document.getElementById("peg-img");
    document.querySelectorAll(".peg-tipos button").forEach(function(b){ b.classList.toggle("on", b.dataset.k===pegActual); });
    if(img && cv){ img.classList.remove("cs-cambia"); void img.offsetWidth; img.src=cv.toDataURL("image/png"); img.classList.add("cs-cambia"); }
    sonido("tick"); return true; }
  if(a==="x-peg-tinta"){ try{ localStorage.setItem(PEGKEY, el.dataset.k); }catch(e){} pegSheet(); return true; }
  if(a==="x-peg-compartir"){ pegComparte(); return true; }
  if(a==="x-peg-bajar"){ pegDescarga(); return true; }
  return false;
}

var PEG_CSS=[
'.peg-tipos{ display:flex; gap:6px; overflow-x:auto; margin:4px -4px 12px; padding:2px 4px; scrollbar-width:none; } .peg-tipos::-webkit-scrollbar{ display:none; }',
'.peg-tipos button{ flex:0 0 auto; padding:8px 13px; border-radius:99px; font-size:13px; font-weight:700; background:var(--fill); box-shadow:inset 0 0 0 1px var(--hairline-2); color:var(--t2); white-space:nowrap; }',
'.peg-tipos button.on{ background:var(--accent); color:var(--on-accent); box-shadow:none; }',
'.peg-tinta{ display:flex; align-items:center; gap:8px; margin-bottom:10px; } .peg-tinta span{ font-size:12.5px; color:var(--t3); margin-left:4px; }',
'.peg-marco{ min-height:200px; display:grid; place-items:center; } .peg-marco img{ max-height:46vh; width:auto; max-width:100%; }',
'#peg-hoy{ margin:10px auto 0; display:flex; align-items:center; gap:7px; padding:8px 14px; border-radius:99px; font-size:13px; font-weight:700; color:var(--accent);',
'  background:color-mix(in srgb,var(--accent) 10%,transparent); } #peg-hoy svg{ width:16px; height:16px; }',
'#peg-barra{ position:fixed; left:12px; right:12px; bottom:calc(88px + env(safe-area-inset-bottom)); z-index:90; display:flex; align-items:center; gap:8px; padding:8px 8px 8px 16px;',
'  border-radius:18px; background:color-mix(in srgb,var(--bg) 88%,var(--accent)); box-shadow:0 14px 34px -14px rgba(0,0,0,.5), inset 0 0 0 1px var(--hairline);',
'  transform:translateY(20px); opacity:0; transition:all .35s var(--spring); max-width:520px; margin:0 auto; }',
'#peg-barra.ve{ transform:none; opacity:1; } #peg-barra span{ flex:1; font-size:13.5px; font-weight:600; line-height:1.35; }',
'#peg-barra .peg-si{ padding:9px 14px; border-radius:99px; background:var(--accent); color:var(--on-accent); font-weight:800; font-size:13.5px; }',
'#peg-barra .peg-no{ width:34px; height:34px; display:grid; place-items:center; color:var(--t3); } #peg-barra .peg-no svg{ width:16px; height:16px; }'
].join("\n");

var _pegGA=grupoAccion;
grupoAccion=function(a, el){ if(pegAccion(a, el)) return true; return _pegGA.apply(this, arguments); };
var _pegTR=grupoTrasRender;
grupoTrasRender=function(){ var r=_pegTR.apply(this, arguments); if(view==="resumen") pegBotonResumen(); pegVigilaHabitos(); return r; };
(function(){ var st=document.createElement("style"); st.id="peg-css"; st.textContent=PEG_CSS; document.head.appendChild(st); })();

/* ════════════════════════════════════════════════════════════════
   FOTOS DEL GYM Y RESUMEN DEL MES
   · Al marcar ejercicio hoy se ofrece subir una foto (+20 XP). Sale
     en la actividad del grupo y en tu perfil, en una cuadrícula por
     meses que ven tus amigos. No se borran.
     Con cuenta: Storage «gym» + funciones g_foto, g_fotos y
     g_evento_foto (servidor/grupos.sql). En modo prueba se guarda
     pequeña en este móvil.
   · El día 1 de cada mes (o la primera vez que entras esa semana)
     se abre el resumen del mes anterior: tuyo y del grupo.
   ════════════════════════════════════════════════════════════════ */
var FG_XP=20;
function fgFotos(){ if(!S.fotoGym) S.fotoGym={}; return S.fotoGym; }
function fgDe(d){ var f=S.fotoGym && S.fotoGym[d]; return f && f.u ? f.u : ""; }

/* +20 XP el día que hay foto y entrenaste */
var _fgDayXP=dayXP;
dayXP=function(d, tmap){ return _fgDayXP(d, tmap)+((fgDe(d) && wentGym(d)) ? FG_XP : 0); };

/* ── al marcar ejercicio ── */
document.addEventListener("click", function(ev){
  var b=ev.target.closest && ev.target.closest('[data-act="gym"]'); if(!b) return;
  var d=b.dataset.day||curDay(), antes=wentGym(d);
  setTimeout(function(){ if(!antes && wentGym(d) && d===today()) fgOfrece(d); }, 500);
}, true);
function fgOfrece(d){
  var hay=!!fgDe(d);
  openSheet('<div class="flex items-start justify-between mb-1"><h3 class="display text-[22px] font-extrabold">¡Entrenado! 💪</h3>'+closeBtn()+'</div>'+
    '<p class="text-[13px] t3 mb-5">'+(hay?"Ya tienes la foto de hoy.":"Sube una foto haciendo deporte: sale en tu grupo y en tu perfil.")+'</p>'+
    (hay ? '' :
      '<button class="fg-subir" data-act="x-fg-subir" data-d="'+d+'">'+
        '<span class="fg-subir-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg></span>'+
        '<span class="fg-subir-t"><b>Subir foto entrenando</b><small>'+(typeof gReal==="function"&&gReal()?"La ven tus amigos":"En modo prueba se guarda solo en este móvil")+'</small></span>'+
        '<span class="chip" style="background:color-mix(in srgb,var(--good) 18%,transparent);color:var(--good)">+'+FG_XP+' XP</span></button>')+
    (typeof pegSheet==="function" ? '<button class="btn btn-quiet w-full !py-3.5 mt-2" data-act="x-fg-historia">Compartir en historia</button>' : '')+
    '<button class="w-full py-3 mt-1 t3 text-[14px] font-semibold" data-act="x-fg-no">Ahora no</button>');
}
function fgElegir(d){
  var i=document.createElement("input"); i.type="file"; i.accept="image/*"; i.style.cssText="position:fixed;left:-9999px";
  document.body.appendChild(i);
  i.addEventListener("change", function(){ var f=i.files && i.files[0]; if(i.parentNode) i.parentNode.removeChild(i); if(f) fgPrepara(f, d); });
  i.click();
}
/* se reduce en el móvil antes de subir: 1080 px con cuenta, 480 px en modo prueba */
function fgPrepara(archivo, d){
  if(archivo.size > 25*1024*1024){ avisoNube("Esa foto pesa demasiado."); return; }
  var real=(typeof gReal==="function" && gReal());
  avisoNube(real?"Subiendo la foto…":"Guardando la foto…");
  var lector=new FileReader();
  lector.onerror=function(){ avisoNube("No he podido leer esa foto."); };
  lector.onload=function(){
    var im=new Image();
    im.onerror=function(){ avisoNube("Ese archivo no es una imagen."); };
    im.onload=function(){
      var L=real?1080:480, k=Math.min(1, L/Math.max(im.width, im.height)), w=Math.round(im.width*k), h=Math.round(im.height*k);
      var c=document.createElement("canvas"); c.width=w; c.height=h; var x=c.getContext("2d"); if(!x) return;
      x.drawImage(im, 0, 0, w, h);
      if(!real){ fgGuarda(d, c.toDataURL("image/jpeg", 0.72), false); return; }
      c.toBlob(function(b){ if(!b){ avisoNube("No he podido preparar la foto."); return; } fgSube(b, d); }, "image/jpeg", 0.82);
    };
    im.src=lector.result;
  };
  lector.readAsDataURL(archivo);
}
function fgSube(blob, d){
  /* el nombre lleva una parte al azar: sin ella, quien supiera tu identificador podría
     adivinar la dirección de tus fotos (el cubo «gym» es público para poder verlas) */
  var az=new Uint8Array(9); try{ crypto.getRandomValues(az); }catch(e){ for(var k=0;k<9;k++) az[k]=Math.floor(Math.random()*256); }
  var ruta="gym/"+ses.uid+"/"+d+"-"+Array.prototype.map.call(az, function(n){ return ("0"+n.toString(16)).slice(-2); }).join("")+".jpg";
  tokenFresco().then(function(){
    return fetch(NUBE_URL+"/storage/v1/object/"+ruta, { method:"POST",
      headers:{ "apikey":NUBE_KEY, "Authorization":"Bearer "+ses.access_token, "Content-Type":"image/jpeg", "x-upsert":"true" }, body:blob });
  }).then(function(r){
    if(!r || !r.ok) throw 0;
    var url=NUBE_URL+"/storage/v1/object/public/"+ruta+"?v="+Date.now();
    return gRpc("g_foto", { p_dia:d, p_url:url }).then(function(){ fgGuarda(d, url, true); });
  }).catch(function(e){ avisoNube(e && e.message==="sin_servidor" ? "Falta preparar el servidor para las fotos." : "No se ha podido subir la foto."); });
}
function fgGuarda(d, url, real){
  var F=fgFotos(); F[d]={ u:url };
  /* en modo prueba, como mucho 20 en el móvil */
  if(!real){ var ks=Object.keys(F).filter(function(k){ return F[k].u.indexOf("data:")===0; }).sort(); while(ks.length>20){ delete F[ks.shift()]; } }
  save(); closeSheet();
  fgPublica(d, url, real);
  render();
  avisoNube("Foto subida · +"+FG_XP+" XP");
}
function fgPublica(d, url, real){
  if(typeof gPubCfg!=="function" || !GRUPO) return;
  var P=gPubCfg(); if(!P.hechos) P.hechos={};
  var yo=(real && ses) ? ses.uid.slice(0,8) : "yo", clave="fg:"+yo+":"+d, texto="ha subido una foto entrenando 📸";
  if(P.hechos[clave]) return; P.hechos[clave]=today(); save();
  if(!GRUPO.real){ GRUPO.muro.unshift({ id:"l"+Date.now(), usuario:GRUPO.yo, texto:texto, cuando:tr("ahora"), reac:{}, foto:url }); return; }
  gRpc("g_evento_foto", { p_clave:clave, p_texto:texto, p_foto:url }).then(function(){ gCargar(true); }).catch(function(){ delete P.hechos[clave]; save(); });
}

/* ── la foto en la actividad del grupo ── */
var _fgMapea=gMapea;
gMapea=function(e){
  var r=_fgMapea.apply(this, arguments);
  (e.eventos||[]).forEach(function(x, i){ var u=gUrl(x.foto); if(u && r.muro[i]) r.muro[i].foto=u; });
  return r;
};
function fgMiniaturas(){
  if(!GRUPO || !GRUPO.muro) return;
  var filas=document.querySelectorAll(".soc-muro > .soc-fila");
  for(var i=0;i<filas.length && i<GRUPO.muro.length;i++){
    var m=GRUPO.muro[i]; if(!m.foto || filas[i].querySelector(".fg-mini")) continue;
    var p=filas[i].querySelector(".soc-cuerpo > p"); if(!p) continue;
    p.insertAdjacentHTML("afterend", '<button class="fg-mini" data-act="x-fg-ver" data-u="'+esc(m.foto)+'" data-t="'+esc(m.usuario+" · "+m.cuando)+'"><img src="'+esc(m.foto)+'" alt="" loading="lazy"></button>');
  }
}
var _fgRSocial=rSocial;
rSocial=function(){ var r=_fgRSocial.apply(this, arguments); fgMiniaturas(); return r; };

/* ── galería en el perfil ── */
function fgUidDe(u){ if(!GRUPO) return null; for(var i=0;i<GRUPO.miembros.length;i++) if(GRUPO.miembros[i].usuario===u) return GRUPO.miembros[i].uid||null; return null; }
function fgRejilla(lista){
  if(!lista.length) return '<p class="soc-nota">Aún no hay fotos.</p>';
  var porMes={}, meses=[];
  lista.forEach(function(f){ var m=f.d.slice(0,7); if(!porMes[m]){ porMes[m]=[]; meses.push(m); } porMes[m].push(f); });
  meses.sort().reverse();
  return meses.map(function(m){
    var fs=porMes[m].sort(function(a,b){ return a.d<b.d?1:-1; });
    return '<div class="fg-mes"><p><b>'+esc(cap(fmt(m+"-01",{month:"long", year:"numeric"})))+'</b><span class="num">'+fs.length+'</span></p>'+
      '<div class="fg-rejilla">'+fs.map(function(f){
        return '<button data-act="x-fg-ver" data-u="'+esc(f.u)+'" data-t="'+esc(cap(fmt(f.d,{weekday:"long", day:"numeric", month:"long"})))+'"><img src="'+esc(f.u)+'" alt="" loading="lazy"></button>'; }).join("")+
      '</div></div>';
  }).join("");
}
function fgGaleria(u){
  var capa=document.getElementById("perfil-capa"); if(!capa) return;
  var sc=capa.querySelector(".pf-scroll"); if(!sc || sc.querySelector("#fg-galeria")) return;
  var yo=(!u || (GRUPO && u===GRUPO.yo));
  var box=document.createElement("div"); box.id="fg-galeria";
  box.innerHTML='<div class="soc-sec"><h2 class="display">Fotos haciendo deporte</h2></div><div id="fg-gal-in"></div>';
  /* justo después de las cifras, antes de «Datos» */
  var ref=sc.querySelector(".soc-sec")||sc.lastElementChild; sc.insertBefore(box, ref);
  var dentro=box.querySelector("#fg-gal-in");
  if(yo){
    var F=fgFotos(); dentro.innerHTML=fgRejilla(Object.keys(F).map(function(d){ return { d:d, u:F[d].u }; }));
    if(!Object.keys(F).length) dentro.innerHTML='<p class="soc-nota">Cuando marques ejercicio en Vital, podrás subir una foto haciendo deporte: gym, fútbol, correr, lo que sea. Aquí se guardan todas, por meses.</p>';
    return;
  }
  var uid=fgUidDe(u);
  if(!uid || !(typeof gReal==="function" && gReal())){ dentro.innerHTML='<p class="soc-nota">'+esc(u)+' aún no ha subido fotos.</p>'; return; }
  dentro.innerHTML='<p class="soc-nota">Cargando…</p>';
  gRpc("g_fotos", { p_uid:uid, p_desde:null, p_hasta:null }).then(function(l){
    dentro.innerHTML=fgRejilla((Array.isArray(l)?l:[]).map(function(x){ return { d:String(x.d).slice(0,10), u:gUrl(x.u) }; }).filter(function(x){ return x.u; }));
    if(!(l||[]).length) dentro.innerHTML='<p class="soc-nota">'+esc(u)+' aún no ha subido fotos.</p>';
  }).catch(function(){ dentro.innerHTML='<p class="soc-nota">No se han podido cargar las fotos.</p>'; });
}
var _fgPerfil=abrirPerfil;
abrirPerfil=function(u){ var r=_fgPerfil.apply(this, arguments); fgGaleria(u); return r; };

function fgVer(url, txt){
  var v=document.getElementById("fg-visor"); if(!v){ v=document.createElement("div"); v.id="fg-visor"; v.setAttribute("data-act","x-fg-cierra"); document.body.appendChild(v); }
  v.innerHTML='<img src="'+esc(url)+'" alt=""><p>'+esc(txt||"")+'</p>';
  requestAnimationFrame(function(){ v.classList.add("ve"); });
}
function fgCierraVisor(){ var v=document.getElementById("fg-visor"); if(!v) return; v.classList.remove("ve"); setTimeout(function(){ if(v.parentNode) v.parentNode.removeChild(v); }, 300); }

/* ════════════ resumen del mes ════════════ */
function mesAnterior(){ var t=today(), y=+t.slice(0,4), m=+t.slice(5,7)-1; if(m<1){ m=12; y--; } return y+"-"+(m<10?"0":"")+m; }
function mesDias(mes){ var y=+mes.slice(0,4), m=+mes.slice(5,7), n=new Date(y, m, 0).getDate(), out=[]; for(var i=1;i<=n;i++) out.push(mes+"-"+(i<10?"0":"")+i); return out; }
function mesDatos(mes){
  var hoy=today(), ds=mesDias(mes).filter(function(d){ return d<=hoy; }), tm=tasksByDay();
  var o={ mes:mes, nombre:fmt(mes+"-01",{month:"long"}), dias:ds.length, activos:0, xp:0, gym:0, est:0, med:0, checks:0, retos:0, mejor:null, mejorXP:0, racha:0, fotos:[] };
  var run=0;
  ds.forEach(function(d){
    var x=dayXP(d, tm), act=activeDay(d); o.xp+=x;
    if(act){ o.activos++; run++; if(run>o.racha) o.racha=run; } else run=0;
    if(wentGym(d)) o.gym++;
    o.est+=estudioMinDia(d); o.med+=(typeof medMinDia==="function"?medMinDia(d):0);
    o.checks+=checksOf(d).length; o.retos+=chOf(d).length;
    if(x>o.mejorXP){ o.mejorXP=x; o.mejor=d; }
    if(fgDe(d)) o.fotos.push({ d:d, u:fgDe(d) });
  });
  return o;
}
function abrirMes(mes){
  var o=mesDatos(mes);
  S.mesVisto=mes; save();
  var capa=document.getElementById("mes-capa"); if(!capa){ capa=document.createElement("div"); capa.id="mes-capa"; document.body.appendChild(capa); }
  function cifra(v, l){ return '<div><b class="display num">'+v+'</b><span>'+l+'</span></div>'; }
  capa.innerHTML=
    '<div class="pf-barra"><button class="pf-atras" data-act="x-mes-cierra" aria-label="Cerrar">'+
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button><span>Resumen del mes</span></div>'+
    '<div class="mes-scroll">'+
      '<p class="eyebrow">Tu mes</p><h1 class="display mes-t">'+esc(cap(o.nombre))+'</h1>'+
      '<div class="mes-hero"><b class="display num">'+o.activos+'</b><span>'+(o.activos===1?"día activo":"días activos")+' de '+o.dias+'</span></div>'+
      '<div class="mes-cifras">'+
        cifra(o.xp, "XP ganado")+cifra(o.racha, "mejor racha")+cifra(o.gym, "días de ejercicio")+
        cifra(horasTxt(o.est)||"0 min", "de estudio")+cifra(o.med+" min", "de meditación")+cifra(o.checks, "hábitos cumplidos")+
      '</div>'+
      (o.mejor ? '<p class="mes-mejor">Tu mejor día: <b>'+esc(cap(fmt(o.mejor,{weekday:"long", day:"numeric"})))+'</b> · '+o.mejorXP+' XP</p>' : '')+
      '<div class="soc-sec"><h2 class="display">Tus fotos haciendo deporte</h2><span class="t3 num" style="font-size:12.5px">'+o.fotos.length+'</span></div>'+
      (o.fotos.length ? '<div class="fg-rejilla">'+o.fotos.map(function(f){ return '<button data-act="x-fg-ver" data-u="'+esc(f.u)+'" data-t="'+esc(cap(fmt(f.d,{weekday:"long", day:"numeric", month:"long"})))+'"><img src="'+esc(f.u)+'" alt="" loading="lazy"></button>'; }).join("")+'</div>'
                      : '<p class="soc-nota">Este mes no subiste fotos. El que viene, al marcar ejercicio, sube la tuya.</p>')+
      '<div id="mes-grupo"></div>'+
      '<div class="mes-botones"><button class="btn btn-primary w-full !py-3.5" data-act="x-mes-comparte">Compartir en historia</button>'+
        '<button class="w-full py-3 t3 text-[14px] font-semibold" data-act="x-mes-cierra">Cerrar</button></div>'+
    '</div>';
  pegMes={ nombre:o.nombre, activos:o.activos, fotos:o.fotos.length };
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ capa.classList.add("ve"); }); });
  mesGrupo(mes);
}
function mesGrupo(mes){
  var box=document.getElementById("mes-grupo"); if(!box) return;
  if(!GRUPO){ return; }
  if(!GRUPO.real || !(typeof gReal==="function" && gReal())){ box.innerHTML='<div class="soc-sec"><h2 class="display">Tu grupo</h2></div><p class="soc-nota">Con tu cuenta y un grupo de verdad, aquí verás el mes de tus amigos y sus fotos.</p>'; return; }
  var ds=mesDias(mes);
  box.innerHTML='<div class="soc-sec"><h2 class="display">'+esc(GRUPO.nombre||"Tu grupo")+'</h2></div><p class="soc-nota">Cargando…</p>';
  gRpc("g_fotos", { p_uid:null, p_desde:ds[0], p_hasta:ds[ds.length-1] }).then(function(l){
    l=(Array.isArray(l)?l:[]).map(function(x){ return { uid:x.uid, d:String(x.d).slice(0,10), u:gUrl(x.u) }; }).filter(function(x){ return x.u; });
    var por={}, nom={};
    GRUPO.miembros.forEach(function(m){ nom[m.uid]=m; por[m.uid]=0; });
    l.forEach(function(x){ por[x.uid]=(por[x.uid]||0)+1; });
    var rk=Object.keys(por).filter(function(k){ return nom[k]; }).sort(function(a,b){ return por[b]-por[a]; });
    var h='<div class="soc-sec"><h2 class="display">'+esc(GRUPO.nombre||"Tu grupo")+'</h2><span class="t3 num" style="font-size:12.5px">'+l.length+' 📸</span></div>'+
      '<p class="soc-nota">Quién ha subido más fotos haciendo deporte este mes.</p>'+
      '<div class="soc-lista">'+rk.map(function(k, i){ var m=nom[k];
        return '<div class="soc-fila" data-act="x-perfil" data-u="'+esc(m.usuario)+'"><span class="mes-pos num">'+(i+1)+'</span>'+caraDe(m,36)+
          '<div class="soc-cuerpo"><span style="flex:1;font-size:15px;font-weight:600">'+esc(m.usuario)+'</span><span class="num t2" style="font-weight:700">'+por[k]+'</span></div></div>'; }).join("")+'</div>'+
      (l.length ? '<div class="fg-rejilla mt-3">'+l.slice(0,18).map(function(x){ var m=nom[x.uid];
        return '<button data-act="x-fg-ver" data-u="'+esc(x.u)+'" data-t="'+esc((m?m.usuario+" · ":"")+cap(fmt(String(x.d).slice(0,10),{day:"numeric", month:"long"})))+'"><img src="'+esc(x.u)+'" alt="" loading="lazy"></button>'; }).join("")+'</div>' : '');
    box.innerHTML=h;
  }).catch(function(){ box.innerHTML=''; });
}
function cierraMes(){ var c=document.getElementById("mes-capa"); if(!c) return; c.classList.remove("ve"); setTimeout(function(){ if(c.parentNode) c.parentNode.removeChild(c); }, 350); }
/* se abre solo: los 7 primeros días del mes, una vez, si el mes anterior usaste la app */
var mesMirado=false;
function mesVigila(){
  if(mesMirado || view!=="resumen") return;
  if((typeof puertaEl==="function" && puertaEl()) || (typeof tourLive!=="undefined" && tourLive) || !S.tour || document.getElementById("onb")) return;
  var sh=document.getElementById("sheet"); if(sh && !sh.hidden) return;
  mesMirado=true;
  var ant=mesAnterior(), dia=+today().slice(8,10);
  /* en la beta se puede ver ya con el mes en curso, una vez */
  if(window.DTRACK_BETA && !S.mesPruebaBeta){ S.mesPruebaBeta=1; save(); setTimeout(function(){ abrirMes(today().slice(0,7)); }, 900); return; }
  if(S.mesVisto===ant || S.mesVisto>ant) return;
  var usado=mesDias(ant).some(function(d){ return activeDay(d); });
  if(dia>7 || !usado){ S.mesVisto=ant; save(); return; }
  setTimeout(function(){ abrirMes(ant); }, 900);
}

function fotosAccion(a, el){
  if(a==="x-fg-subir"){ fgElegir(el.dataset.d); return true; }
  if(a==="x-fg-historia"){ closeSheet(); setTimeout(function(){ pegSheet("ejercicio"); }, 150); return true; }
  if(a==="x-fg-no"){ closeSheet(); return true; }
  if(a==="x-fg-ver"){ fgVer(el.dataset.u, el.dataset.t); return true; }
  if(a==="x-fg-cierra"){ fgCierraVisor(); return true; }
  if(a==="x-mes-cierra"){ cierraMes(); return true; }
  if(a==="x-mes-comparte"){ cierraMes(); setTimeout(function(){ pegSheet("mes"); }, 200); return true; }
  return false;
}

var FOTOS_CSS=[
'.fg-subir{ width:100%; display:flex; align-items:center; gap:12px; text-align:left; padding:14px; border-radius:18px; background:var(--fill); box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--accent) 45%,transparent); }',
'.fg-subir-ic{ width:44px; height:44px; border-radius:14px; display:grid; place-items:center; background:var(--accent); color:var(--on-accent); flex:0 0 auto; } .fg-subir-ic svg{ width:22px; height:22px; }',
'.fg-subir-t{ flex:1; min-width:0; } .fg-subir-t b{ display:block; font-size:15.5px; } .fg-subir-t small{ display:block; font-size:12px; color:var(--t3); margin-top:1px; }',
'.fg-mini{ display:block; margin:8px 0 4px; width:min(100%,260px); aspect-ratio:4/5; border-radius:14px; overflow:hidden; background:var(--fill); }',
'.fg-mini img{ width:100%; height:100%; object-fit:cover; display:block; }',
'.fg-mes{ margin-bottom:16px; } .fg-mes > p{ display:flex; justify-content:space-between; font-size:13.5px; margin:0 2px 8px; } .fg-mes > p span{ color:var(--t3); }',
'.fg-rejilla{ display:grid; grid-template-columns:repeat(3,1fr); gap:4px; border-radius:16px; overflow:hidden; }',
'.fg-rejilla button{ aspect-ratio:1; background:var(--fill); overflow:hidden; } .fg-rejilla img{ width:100%; height:100%; object-fit:cover; display:block; }',
'#fg-visor{ position:fixed; inset:0; z-index:140; background:rgba(0,0,0,.92); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; padding:24px 12px; opacity:0; transition:opacity .25s ease; }',
'#fg-visor.ve{ opacity:1; } #fg-visor img{ max-width:100%; max-height:80vh; border-radius:14px; } #fg-visor p{ color:rgba(255,255,255,.8); font-size:14px; font-weight:600; }',
'#mes-capa{ position:fixed; inset:0; z-index:110; background:var(--bg); display:flex; flex-direction:column; transform:translateY(24px); opacity:0; transition:all .4s var(--spring); }',
'#mes-capa.ve{ transform:none; opacity:1; }',
'#mes-capa .pf-barra{ padding-top:calc(10px + env(safe-area-inset-top)); }',
'#mes-capa .mes-scroll{ flex:1; overflow-y:auto; padding:8px 18px calc(30px + env(safe-area-inset-bottom)); max-width:620px; width:100%; margin:0 auto; }',
'#mes-capa .mes-t{ font-size:42px; font-weight:800; letter-spacing:-.04em; margin:4px 0 16px; }',
'#mes-capa .mes-hero{ border-radius:24px; padding:22px; background:linear-gradient(145deg,var(--accent),color-mix(in srgb,var(--accent) 65%,var(--violet))); color:var(--on-accent); margin-bottom:12px; }',
'#mes-capa .mes-hero b{ display:block; font-size:72px; font-weight:800; line-height:1; letter-spacing:-.04em; } #mes-capa .mes-hero span{ font-size:15px; font-weight:600; opacity:.85; }',
'#mes-capa .mes-cifras{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }',
'#mes-capa .mes-cifras > div{ border-radius:18px; padding:14px 12px; background:var(--glass-bg); box-shadow:inset 0 0 0 1px var(--hairline); }',
'#mes-capa .mes-cifras b{ display:block; font-size:22px; font-weight:800; letter-spacing:-.02em; } #mes-capa .mes-cifras span{ display:block; font-size:11.5px; color:var(--t3); margin-top:2px; line-height:1.3; }',
'#mes-capa .mes-mejor{ font-size:13.5px; color:var(--t2); margin:14px 2px 4px; }',
'#mes-capa .mes-pos{ width:22px; font-weight:800; color:var(--t3); font-size:14px; flex:0 0 auto; text-align:center; }',
'#mes-capa .mes-botones{ margin-top:22px; display:flex; flex-direction:column; gap:4px; }'
].join("\n");

var _fgGA=grupoAccion;
grupoAccion=function(a, el){ if(fotosAccion(a, el)) return true; return _fgGA.apply(this, arguments); };
var _fgTR=grupoTrasRender;
grupoTrasRender=function(){ var r=_fgTR.apply(this, arguments); if(view==="social") fgMiniaturas(); mesVigila(); return r; };
(function(){ var st=document.createElement("style"); st.id="fotos-css"; st.textContent=FOTOS_CSS; document.head.appendChild(st); })();

