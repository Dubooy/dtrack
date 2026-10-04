/* ════════════════════════════════════════════════════════════════
   ESTIRAR Y LEER, A UN TOQUE (oct 2026)
   Los estiramientos viven en Cuerpo y los libros en Mente, arriba del
   todo, en filas que se deslizan de lado. Un toque en una rutina la
   empieza ya en modo guiado (la explicación de cada postura está en el
   «?» de la guía); un toque en un libro gratis lo abre en el lector. En
   Hoy solo queda una fila para seguir leyendo, y «Para crecer» sale de
   Objetivos para que no haya nada repetido.
   ════════════════════════════════════════════════════════════════ */
(function(){
  var st=document.createElement("style"); st.id="tq-css"; st.textContent=[
'.tq{ margin-bottom:36px; }',
'.tq-cab{ display:flex; align-items:baseline; justify-content:space-between; gap:12px; margin-bottom:14px; }',
'.tq-cab h2{ font-size:22px; font-weight:800; letter-spacing:-.035em; line-height:1.1; }',
'.tq-cab .tq-link{ font-size:14px; font-weight:700; color:var(--accent); padding:4px 0 4px 10px; }',
'.tq-sub{ font-size:13px; font-weight:650; color:var(--t2); margin:20px 0 10px; letter-spacing:-.01em; }',
'.tq-fila{ display:flex; gap:12px; overflow-x:auto; overflow-y:hidden; scroll-snap-type:x mandatory; scroll-padding:0 20px;',
'  margin:0 -20px; padding:2px 20px 10px; scrollbar-width:none; -webkit-overflow-scrolling:touch; overscroll-behavior-x:contain; }',
'.tq-fila::-webkit-scrollbar{ display:none; }',
'@media (min-width:640px){ .tq-fila{ margin:0 -32px; padding-left:32px; padding-right:32px; scroll-padding:0 32px; } }',
'@media (min-width:1024px){ .tq-fila{ margin:0; padding-left:0; padding-right:0; scroll-padding:0; } }',
/* rutinas */
'.tq-est{ position:relative; flex:0 0 66%; max-width:250px; scroll-snap-align:start; text-align:left; border-radius:26px; overflow:hidden;',
'  background:color-mix(in srgb, var(--t1) 4.5%, var(--bg)); box-shadow:inset 0 0 0 1px var(--hairline-2); transition:transform .35s var(--spring); }',
'.tq-est:active{ transform:scale(.97); transition-duration:.12s; }',
'.tq-est-f{ display:block; aspect-ratio:1/1.08; background:radial-gradient(70% 55% at 50% 60%, color-mix(in srgb, var(--t1) 7%, transparent), transparent 70%); }',
'.tq-est-f img{ width:100%; height:100%; object-fit:contain; display:block; opacity:0; transform:scale(.96); transition:opacity .45s ease, transform .6s var(--spring); }',
'.tq-est-f img.ve{ opacity:1; transform:none; }',
'.tq-est-t{ display:block; padding:2px 16px 16px; }',
'.tq-est-t b{ display:block; font-family:"Plus Jakarta Sans",sans-serif; font-size:15.5px; font-weight:750; letter-spacing:-.02em; line-height:1.2; color:var(--t1); }',
'.tq-est-t small{ display:block; font-size:12.5px; color:var(--t3); margin-top:4px; }',
'.tq-play{ position:absolute; top:12px; right:12px; width:38px; height:38px; border-radius:99px; display:grid; place-items:center;',
'  background:var(--accent); color:var(--on-accent); box-shadow:0 6px 14px -6px rgba(0,0,0,.4); }',
'.tq-play svg{ width:15px; height:15px; margin-left:2px; }',
'.tq-min{ position:absolute; top:14px; left:14px; font-size:11px; font-weight:700; letter-spacing:.04em; text-transform:uppercase; color:var(--t3); }',
/* libros */
'.tq-now{ display:flex; align-items:center; gap:16px; width:100%; text-align:left; padding:14px; border-radius:24px;',
'  background:color-mix(in srgb, var(--t1) 4.5%, var(--bg)); box-shadow:inset 0 0 0 1px var(--hairline-2); transition:transform .35s var(--spring); }',
'.tq-now:active{ transform:scale(.98); transition-duration:.12s; }',
'.tq-now .lb-port{ width:66px; box-shadow:0 2px 3px rgba(0,0,0,.14), 0 12px 22px -10px rgba(0,0,0,.4); }',
'.tq-now-t{ flex:1; min-width:0; display:block; }',
'.tq-now-t small{ display:block; font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--t3); }',
'.tq-now-t b{ display:block; font-family:"Plus Jakarta Sans",sans-serif; font-size:16.5px; font-weight:750; letter-spacing:-.02em; line-height:1.2; margin-top:3px; color:var(--t1);',
'  overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; }',
'.tq-barra{ display:block; height:4px; border-radius:4px; background:var(--fill-hi); margin-top:10px; overflow:hidden; }',
'.tq-barra i{ display:block; height:100%; border-radius:inherit; background:var(--accent); }',
'.tq-now-t em{ display:block; font-style:normal; font-size:12px; color:var(--t3); margin-top:6px; }',
'.tq-seguir{ flex:0 0 auto; padding:9px 16px; border-radius:99px; background:var(--accent); color:var(--on-accent); font-size:13.5px; font-weight:700; }',
'.tq-libro{ flex:0 0 auto; width:108px; scroll-snap-align:start; text-align:left; transition:transform .35s var(--spring); }',
'.tq-libro:active{ transform:scale(.95); transition-duration:.12s; }',
'.tq-libro .lb-port{ width:108px; box-shadow:0 2px 3px rgba(0,0,0,.12), 0 14px 24px -12px rgba(0,0,0,.45); }',
'.tq-libro > b{ display:block; font-size:12.5px; font-weight:650; line-height:1.25; margin-top:9px; color:var(--t1);',
'  overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; }',
'.tq-libro > small{ display:block; font-size:11.5px; color:var(--t3); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
'.tq-subir{ flex:0 0 auto; width:108px; aspect-ratio:2/3; scroll-snap-align:start; border-radius:4px 8px 8px 4px; display:flex; flex-direction:column;',
'  align-items:center; justify-content:center; gap:8px; color:var(--t2); font-size:12px; font-weight:650; text-align:center; padding:10px;',
'  box-shadow:inset 0 0 0 1.5px var(--hairline); }',
'.tq-subir i{ font-style:normal; font-size:26px; font-weight:300; line-height:1; color:var(--t1); }',
/* Biblioteca: botón con icono arriba y tarjeta grande abajo */
'.tq-cab .tq-bib{ display:inline-flex; align-items:center; gap:6px; font-size:13.5px; font-weight:700; padding:8px 14px 8px 11px; border-radius:99px; background:var(--fill); color:var(--t1); }',
'.tq-cab .tq-bib .ic{ width:17px; height:17px; }',
'.tq-bib-g{ display:flex; align-items:center; gap:14px; width:100%; text-align:left; margin-top:18px; padding:14px 16px; border-radius:22px; background:var(--t1); color:var(--bg); transition:transform .35s var(--spring); }',
'.tq-bib-g:active{ transform:scale(.98); transition-duration:.12s; }',
'.tq-bib-g .tq-bib-i{ width:42px; height:42px; flex:0 0 auto; border-radius:13px; display:grid; place-items:center; background:color-mix(in srgb, var(--bg) 16%, transparent); }',
'.tq-bib-g .tq-bib-i .ic{ width:22px; height:22px; }',
'.tq-bib-g span.tx{ flex:1; min-width:0; } .tq-bib-g b{ display:block; font-size:15.5px; font-weight:750; letter-spacing:-.01em; } .tq-bib-g small{ display:block; font-size:12.5px; opacity:.7; margin-top:2px; }',
'.tq-bib-g > .ic{ width:18px; height:18px; opacity:.6; }',
/* ¿Qué leer ahora? */
'.lb-ahora{ margin:0 0 16px; padding:16px 16px 14px; border-radius:20px; background:var(--fill); }',
'.lb-ahora-t{ font-size:16px; font-weight:800; letter-spacing:-.02em; margin-bottom:10px; }',
'.lb-ahora-c{ margin:0 -16px 12px; padding:2px 16px; } .lb-ahora-c button{ background:var(--bg); } .lb-ahora-c button.on{ color:var(--bg); }',
'.lb-ahora-f{ display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }',
'.lb-ahora-f button{ text-align:left; min-width:0; } .lb-ahora-f .lb-port{ width:100%; box-shadow:0 2px 3px rgba(0,0,0,.12), 0 12px 20px -12px rgba(0,0,0,.45); }',
'.lb-ahora-f > button > b{ display:block; font-size:12px; font-weight:700; line-height:1.25; margin-top:8px; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; }',
'.lb-ahora-f > button > small{ display:block; font-size:11px; color:var(--t3); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
'.lb-x{ position:sticky; top:0; height:0; z-index:6; display:flex; justify-content:flex-end; pointer-events:none; }',
'.lb-x .icon-btn{ pointer-events:auto; box-shadow:0 4px 14px -6px rgba(0,0,0,.35); background:var(--bg); }',
/* mini barra de progreso y «Leído» bajo la portada */
'.tq-barra.tq-mini{ height:3px; margin-top:8px; }',
'.tq-hecho{ display:inline-block; margin-top:7px; font-size:10.5px; font-weight:750; letter-spacing:.06em; text-transform:uppercase; color:var(--t3); }',
'#mt-leer{ margin-top:8px; }',
/* Hoy: solo una fila para seguir leyendo */
'#lb-hab.tq-hoy{ margin-top:18px; }',
'#lb-hab.tq-hoy .tq-now{ padding:12px; border-radius:20px; } #lb-hab.tq-hoy .tq-now .lb-port{ width:44px; }',
'#lb-hab.tq-hoy .tq-now-t b{ font-size:14.5px; -webkit-line-clamp:1; }',
'#rt-crecer{ display:none!important; }'
  ].join("\n"); document.head.appendChild(st);

  var PLAY='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z"/></svg>';
  function pon(el, dentro, despues){
    if(el.parentNode!==dentro || el.previousElementSibling!==despues) dentro.insertBefore(el, despues ? despues.nextSibling : dentro.firstChild);
  }
  function pinta(el, h){ if(el._h!==h){ el._h=h; el.innerHTML=h; return true; } return false; }

  /* ── Cuerpo: estirar ── */
  function pintaEstirar(){
    var v=document.getElementById("v-vital"); if(!v || typeof ESTIRA_RUTINAS==="undefined") return;
    var el=document.getElementById("cu-estirar");
    if(!el){ el=document.createElement("div"); el.id="cu-estirar"; el.className="tq"; }
    pon(el, v, document.getElementById("vital-daybar") || v.firstElementChild);
    var h='<div class="tq-cab"><h2 class="display">Estirar</h2></div><div class="tq-fila">'+ESTIRA_RUTINAS.map(function(r){
      return '<button class="tq-est" data-act="x-cr-empieza" data-k="'+r.k+'" aria-label="Empezar '+esc(r.t)+'">'+
        '<span class="tq-est-f"><img data-mq="'+r.pasos[0].f+'" alt=""></span>'+
        '<span class="tq-min num">'+estiraMin(r)+' min</span><span class="tq-play">'+PLAY+'</span>'+
        '<span class="tq-est-t"><b>'+esc(r.t)+'</b><small>'+esc(r.sub)+' · '+r.pasos.length+' estiramientos</small></span></button>';
    }).join("")+'</div>';
    if(pinta(el, h)) maniquiFotos(el);
  }

  /* ── Mente: leer ── */
  function lbTarjetaAhora(act){
    var b=lbLibro(act), pg=Math.min(lbPags(act), lbTotal(act)), tot=lbTotal(act), pc=Math.min(100, Math.round(pg/tot*100));
    return '<button class="tq-now" data-act="'+(b.d?"x-lb-lee":"x-lb-apunta")+'" data-id="'+act+'">'+lbPortada(b,"m")+
      '<span class="tq-now-t"><small>Leyendo ahora</small><b>'+esc(b.t)+'</b><span class="tq-barra"><i style="width:'+pc+'%"></i></span>'+
      '<em class="num">'+pg+' de '+tot+' págs · '+pc+' %</em></span><span class="tq-seguir">'+(b.d?"Seguir":"Apuntar")+'</span></button>';
  }
  function tqLibro(b, act){
    var e=lbEstado(b.id), pg=lbPags(b.id), tot=lbTotal(b.id), marca="";
    if(e==="leido") marca='<span class="tq-hecho">Leído</span>';
    else if(pg>0 && tot) marca='<span class="tq-barra tq-mini"><i style="width:'+Math.min(100, Math.max(4, Math.round(pg/tot*100)))+'%"></i></span>';
    return '<button class="tq-libro" data-act="'+act+'" data-id="'+b.id+'">'+lbPortada(b,"l")+marca+'<b>'+esc(b.t)+'</b><small>'+esc(b.a)+'</small></button>';
  }
  function pintaLeer(){
    var vid=view==="tareas" ? "v-tareas" : view==="academico" ? "v-academico" : null; if(!vid) return;
    var v=document.getElementById(vid); if(!v || typeof LB==="undefined") return;
    var el=document.getElementById("mt-leer");
    if(!el){ el=document.createElement("div"); el.id="mt-leer"; el.className="tq"; }
    /* va debajo de la meditación */
    pon(el, v, document.getElementById("mente-"+vid.slice(2)) || v.firstElementChild);
    var act=lbActual(), P=lcPropios();
    var gratis=Object.keys(P).map(function(id){ return P[id]; }).concat(LB.filter(function(b){ return b.d; })).filter(function(b){ return b.id!==act; });
    /* primero los que ya has empezado, luego el resto; los terminados al final */
    function orden(b){ var e=lbEstado(b.id); return e==="leido" ? 2 : (lbPags(b.id)>0 ? 0 : 1); }
    gratis=gratis.map(function(b,i){ return [orden(b), i, b]; }).sort(function(x,y){ return x[0]-y[0] || x[1]-y[1]; }).map(function(x){ return x[2]; });
    var h='<div class="tq-cab"><h2 class="display">Leer</h2><button class="tq-bib" data-act="x-lb-biblio" data-t="para">'+ico("libro")+'Biblioteca</button></div>'+
      (act ? lbTarjetaAhora(act) : '')+
      '<p class="tq-sub"'+(act?'':' style="margin-top:0"')+'>Toca uno y empieza a leer</p><div class="tq-fila">'+gratis.map(function(b){ return tqLibro(b, "x-lb-lee"); }).join("")+
        '<button class="tq-subir" data-act="x-lb-subir"><i>+</i>Tu EPUB</button></div>'+
      '<button class="tq-bib-g" data-act="x-lb-biblio" data-t="para"><span class="tq-bib-i">'+ico("libro")+'</span><span class="tx"><b>Biblioteca</b><small>'+LB.length+' libros: novelas, fantasía, misterio y más</small></span>'+ico("flecha")+'</button>';
    pinta(el, h);
  }

  /* ── Hoy: solo seguir leyendo ── */
  lbPinta=function(){
    var card=document.getElementById("card-ideal"), lista=document.getElementById("ideal-list");
    var el=document.getElementById("lb-hab"), act=S && S.lectura ? lbActual() : null;
    if(!card || !lista || !act){ if(el && el.parentNode) el.parentNode.removeChild(el); return; }
    if(!el){ el=document.createElement("div"); el.id="lb-hab"; }
    el.className="tq-hoy";
    if(el.parentNode!==lista.parentNode || el.previousSibling!==lista) lista.parentNode.insertBefore(el, lista.nextSibling);
    pinta(el, lbTarjetaAhora(act));
  };

  /* Objetivos ya no lleva «Para crecer» */
  pintaCrecer=function(){ var el=document.getElementById("rt-crecer"); if(el && el.parentNode) el.parentNode.removeChild(el); };
  crecerTrasRender=function(){ pintaCrecer(); if(view==="vital") pintaEstirar(); };
  lecturaTrasRender=function(){ if(view==="resumen") lbPinta(); pintaLeer(); };

  /* el lector empieza en el texto, no en la portada de la edición */
  window.lcInicio=function(bk){
    /* si el índice trae un prólogo o un capítulo uno, se empieza ahí (sin tasas, erratas ni portadillas) */
    try{ var toc=(bk.navigation && bk.navigation.toc) || [], ok=null;
      (function busca(l){ (l||[]).forEach(function(x){ if(ok) return;
        var t=String(x.label||"").replace(/[^0-9A-Za-zÀ-ÿ. ]+/g," ").replace(/\s+/g," ").trim();
        if(/^(pr[oó]logo|al lector|cap[ií]tulo (primero|i\b|1\b)|tratado primero|acto primero|personas|i\b|1\b)/i.test(t)) ok=x.href;
        else busca(x.subitems); }); })(toc);
      if(ok) return ok; }catch(e){}
    try{ var it=(bk.spine && bk.spine.spineItems) || [];
      for(var i=0;i<it.length;i++){ var x=it[i]; if(!/cover|wrap0000|portada/i.test((x.idref||"")+" "+(x.href||""))) return x.href; } }catch(e){}
    return undefined;
  };
})();
setTimeout(function(){ moveMarker(); moveMTab(); fitBottomBar(); },80);
window.addEventListener("load",function(){ setTimeout(function(){ moveMarker(); moveMTab(); },160); });
