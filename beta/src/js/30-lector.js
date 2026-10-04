/* ════════════ lector: leer libros digitales dentro de Peak ════════════
   Dos fuentes, las dos sin problemas de derechos:
     · Clásicos de dominio público (tema «cla»), servidos desde libros/<id>.epub.
       Los baja de Project Gutenberg el flujo .github/workflows/libros.yml, que
       les quita la marca y la licencia de Gutenberg.
     · Tus propios EPUB: se suben desde el móvil y se quedan en este dispositivo
       (IndexedDB). En S solo va la ficha, no el archivo.
   Leer suma páginas al hábito del libro: cada página nueva que pasas (más allá
   de la más lejana a la que habías llegado) se apunta hoy con cantPon.
     S.lectura.propios[id] = { id, t, a, n, k:"tuyo", propio:1, d:1, sub:fecha }
     S.lectura.libros[id]  += { cfi, max, total }
   epub.js (BSD-2) y JSZip (MIT) van en vendor/ y se cargan al abrir el lector. */
var LB_TEMA_TUYO={ k:"tuyo", t:"Tu libro", c:"#5b5bd6", pal:[["#2b2a33","#f7f3ea","#9b8cff"],["#f2ede4","#1c1c1e","#5b5bd6"],["#1e2a3a","#f1ede4","#7fc8a9"],["#fde7d8","#3a2330","#e2725b"]] };
var LC={ book:null, rend:null, id:null, total:0, pag:0, tam:+(localStorage.getItem("peak-lector-tam")||100), fondo:localStorage.getItem("peak-lector-fondo")||"", cargando:false };

/* ── guardar archivos en el dispositivo ── */
function lcDB(){
  if(lcDB.p) return lcDB.p;
  lcDB.p=new Promise(function(ok, ko){
    var r=indexedDB.open("peak-libros", 1);
    r.onupgradeneeded=function(){ var db=r.result; if(!db.objectStoreNames.contains("f")) db.createObjectStore("f"); if(!db.objectStoreNames.contains("loc")) db.createObjectStore("loc"); };
    r.onsuccess=function(){ ok(r.result); }; r.onerror=function(){ lcDB.p=null; ko(r.error); };
    /* en algunos iPhone la base de datos no contesta nunca: a los 2 s se sigue sin ella */
    setTimeout(function(){ ko(new Error("idb")); }, 2000);
  });
  lcDB.p.catch(function(){ lcDB.p=null; });
  return lcDB.p;
}
function lcLee(tabla, k){ return lcDB().then(function(db){ return new Promise(function(ok){ setTimeout(function(){ ok(null); }, 2500); var q=db.transaction(tabla).objectStore(tabla).get(k); q.onsuccess=function(){ ok(q.result||null); }; q.onerror=function(){ ok(null); }; }); }).catch(function(){ return null; }); }
function lcPon(tabla, k, v){ return lcDB().then(function(db){ return new Promise(function(ok){ setTimeout(function(){ ok(false); }, 4000); var t=db.transaction(tabla, "readwrite"); if(v==null) t.objectStore(tabla).delete(k); else t.objectStore(tabla).put(v, k); t.oncomplete=function(){ ok(true); }; t.onerror=function(){ ok(false); }; }); }).catch(function(){ return false; }); }

function lcScripts(){
  if(window.ePub) return Promise.resolve();
  if(lcScripts.p) return lcScripts.p;
  function uno(src){ return new Promise(function(ok, ko){ var s=document.createElement("script"); s.src=src; s.onload=ok; s.onerror=function(){ ko(new Error(src)); }; document.head.appendChild(s); }); }
  lcScripts.p=uno("vendor/jszip.min.js").then(function(){ return uno("vendor/epub.min.js"); }).catch(function(e){ lcScripts.p=null; throw e; });
  return lcScripts.p;
}
/* el archivo del libro: primero lo guardado; si es un clásico, se baja y se guarda */
function lcArchivo(id){
  return lcLee("f", id).then(function(buf){
    if(buf) return buf;
    var b=lbLibro(id); if(!b || b.propio) return null;
    return fetch("libros/"+id+".epub", { cache:"no-cache" }).then(function(r){ if(!r.ok) throw new Error("http "+r.status); return r.arrayBuffer(); })
      .then(function(buf){ lcPon("f", id, buf); return buf; });
  });
}

/* ── subir un EPUB propio ── */
function lcElegir(){
  var inp=document.createElement("input"); inp.type="file"; inp.accept=".epub,application/epub+zip";
  inp.onchange=function(){ var f=inp.files && inp.files[0]; if(f) lcSube(f); };
  inp.click();
}
function lcSube(f){
  if(f.size>60*1024*1024){ avisoNube("Ese archivo es muy grande. Prueba con un EPUB de menos de 60 MB."); return; }
  avisoNube("Preparando «"+f.name.replace(/\.epub$/i,"")+"»…");
  var buf;
  f.arrayBuffer().then(function(b){ buf=b; return lcScripts(); }).then(function(){
    var bk=ePub(buf.slice(0));
    return bk.loaded.metadata;
  }).then(function(m){
    var t=(m && m.title || f.name.replace(/\.epub$/i,"")).trim().slice(0,120) || "Libro sin título";
    var a=(m && m.creator || "").trim().slice(0,80) || "Autor desconocido";
    var id="u-"+lbHash(t+"|"+a).toString(36);
    var P=lcPropios(), ya=!!P[id];
    P[id]={ id:id, t:t, a:a, n:(P[id]&&P[id].n)||0, k:"tuyo", propio:1, d:1, sub:today() };
    return lcPon("f", id, buf).then(function(ok){
      if(!ok){ avisoNube("No he podido guardar el libro en este dispositivo."); return; }
      save(); sonido("pop");
      avisoNube(ya?"Libro actualizado en este dispositivo.":"Añadido a tus libros: «"+t+"».");
      /* recién subido, se abre ya en el lector */
      if(document.getElementById("lc-capa")){ lcCierra(); setTimeout(function(){ lcAbre(id); }, 260); }
      else lcAbre(id);
    });
  }).catch(function(){ avisoNube("No he podido abrir ese archivo. ¿Es un EPUB sin DRM?"); });
}
function lcPropios(){ var L=lbSt(); if(!L.propios || typeof L.propios!=="object") L.propios={}; return L.propios; }
function lcBorra(id){
  var P=lcPropios(); if(!P[id]) return;
  lbDeja(id); delete P[id];
  var s=lbEst(id); if(s && (!s.habs || !s.habs.length)) delete lbSt().libros[id]; else if(s) s.e="pausa";
  lcPon("f", id, null); lcPon("loc", id, null); save();
}

/* ── el lector a pantalla completa ── */
function lcColores(){
  var f=LC.fondo;
  if(!f){ var bg=getComputedStyle(document.documentElement).getPropertyValue("--bg").trim(); f=lcOscuro(bg)?"noche":"papel"; }
  return f==="noche" ? { f:"noche", bg:"#151412", tx:"#d9d2c3" } : f==="blanco" ? { f:"blanco", bg:"#ffffff", tx:"#1a1a1a" } : { f:"papel", bg:"#f6efdf", tx:"#2a2218" };
}
function lcOscuro(c){
  var m=/^#([0-9a-f]{6})$/i.exec(c||""); if(!m) return false;
  var n=parseInt(m[1],16); return ((n>>16)*0.299+((n>>8)&255)*0.587+(n&255)*0.114)<110;
}
function lcAbre(id){
  var b=lbLibro(id); if(!b || LC.cargando) return;
  /* abrir un libro que no estás leyendo lo pone a leer, con su hábito */
  if(lbEstado(id)!=="leyendo" && lbEstado(id)!=="leido"){ lbEmpieza(id, lbRitmoSel && lbRitmoSel.id===id ? lbRitmoSel.n : null); render(); }
  closeSheet();
  LC.cargando=true; LC.id=id;
  var col=lcColores();
  var capa=document.getElementById("lc-capa");
  if(!capa){ capa=document.createElement("div"); capa.id="lc-capa"; document.body.appendChild(capa); }
  capa.className="f-"+col.f; capa.style.setProperty("--lc-bg", col.bg); capa.style.setProperty("--lc-tx", col.tx);
  capa.innerHTML=
    '<div class="lc-arriba"><button class="lc-bt" data-act="x-lb-lcierra" aria-label="Cerrar el libro"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>'+
      '<span class="lc-tit"><b>'+esc(b.t)+'</b><small id="lc-cap"></small></span>'+
      '<button class="lc-bt" data-act="x-lb-lindice" aria-label="Índice"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg></button>'+
      '<button class="lc-bt lc-aa" data-act="x-lb-lajustes" aria-label="Letra y fondo">Aa</button></div>'+
    '<div class="lc-panel" id="lc-panel" hidden></div>'+
    '<div class="lc-zona"><div id="lc-libro"></div>'+
      '<button class="lc-lado izq" data-act="x-lb-lprev" aria-label="Página anterior"></button><button class="lc-lado der" data-act="x-lb-lnext" aria-label="Página siguiente"></button>'+
      '<div class="lc-carga" id="lc-carga"><span class="lc-spin"></span><p>Abriendo el libro…</p></div></div>'+
    '<div class="lc-abajo"><div class="lc-barra"><i id="lc-barra" style="width:0"></i></div><p id="lc-pag" class="num">&nbsp;</p></div>';
  requestAnimationFrame(function(){ capa.classList.add("ve"); });
  document.documentElement.classList.add("lc-abierto");
  document.addEventListener("keydown", lcTeclas);

  lcScripts().then(function(){ return lcArchivo(id); }).then(function(buf){
    if(LC.id!==id) return;
    if(!buf){ lcFalta(b); return; }
    LC.book=ePub(buf);
    /* el libro nunca ejecuta nada suyo: se le quitan los scripts antes de pintarlo. Así el marco
       puede llevar allow-scripts, que Safari necesita para que funcionen los toques dentro del libro */
    LC.book.spine.hooks.serialize.register(function(out, sec){
      sec.output=String(out||"").replace(/<script[\s\S]*?<\/script\s*>/gi,"").replace(/<script[^>]*\/>/gi,"")
        .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi,"").replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi,'$1="#"');
    });
    var el=document.getElementById("lc-libro");
    LC.rend=LC.book.renderTo(el, { width:"100%", height:"100%", flow:"paginated", spread:"none", allowScriptedContent:true });
    lcTema();
    LC.rend.hooks.content.register(lcGestos);
    LC.rend.on("relocated", lcMovido);
    LC.book.loaded.navigation.then(function(nav){ LC.toc=nav && nav.toc || []; });
    var s=lbEst(id)||{};
    return (s.cfi ? LC.rend.display(s.cfi) : LC.book.ready.then(function(){ return LC.rend.display(window.lcInicio ? lcInicio(LC.book) : undefined); }))
      .catch(function(){ return LC.rend && LC.rend.display(); })   /* si la marca guardada falla, desde el principio */
      .then(function(){ var c=document.getElementById("lc-carga"); if(c && LC.id===id) c.remove(); return lcPaginas(id); });
  }).catch(function(e){ lcError(id, e); }).then(function(){ LC.cargando=false; });
  /* si a los 25 s sigue sin abrir, se dice y se puede reintentar */
  clearTimeout(lcAbre.t); lcAbre.t=setTimeout(function(){ if(LC.id===id && document.getElementById("lc-carga")) lcError(id, new Error("tarda demasiado")); }, 25000);
}
function lcError(id, e){
  var c=document.getElementById("lc-carga"); if(!c || LC.id!==id) return;
  c.innerHTML='<p>No he podido abrir el libro.<br><small>'+(navigator.onLine?"Vuelve a intentarlo.":"Sin internet: la primera vez hace falta conexión para bajarlo.")+'</small></p>'+
    '<button class="lc-sube" data-act="x-lb-lotra" data-id="'+id+'">Reintentar</button><small style="opacity:.45;font-size:11px">'+esc(String(e && e.message || e || "").slice(0,80))+'</small>';
}
function lcFalta(b){
  var c=document.getElementById("lc-carga");
  if(c) c.innerHTML='<p><b>Este libro está en otro dispositivo.</b><br><small>Los EPUB que subes se guardan solo en el móvil donde los subiste. Súbelo aquí también y seguirás por donde ibas.</small></p>'+
    '<button class="lc-sube" data-act="x-lb-subir">Subir el EPUB</button>';
}
/* páginas: una «página» son unos 1600 caracteres, como un libro de bolsillo. Se calculan una vez y se guardan. */
function lcPaginas(id){
  return lcLee("loc", id).then(function(guardado){
    if(LC.id!==id || !LC.book) return;
    if(guardado){ LC.book.locations.load(guardado); return; }
    var c=document.getElementById("lc-pag"); if(c) c.textContent="Contando páginas…";
    return LC.book.locations.generate(1600).then(function(){ if(LC.book) lcPon("loc", id, LC.book.locations.save()); });
  }).then(function(){
    if(LC.id!==id || !LC.book) return;
    LC.total=LC.book.locations.length();
    var s=lbEst(id), b=lbLibro(id);
    if(s && LC.total>=20){ s.total=LC.total; }
    if(b && b.propio && LC.total>=20) b.n=LC.total;
    save();
    var loc=LC.rend && LC.rend.currentLocation(); if(loc && loc.start) lcMovido(loc, true);
  });
}
function lcTema(){
  if(!LC.rend) return;
  var col=lcColores();
  LC.rend.themes.default({
    "html, body":{ "background":col.bg+" !important", "color":col.tx+" !important" },
    "body":{ "font-family":"Georgia, 'Iowan Old Style', 'Palatino Linotype', serif !important", "line-height":"1.6 !important", "padding":"0 !important" },
    "p":{ "text-align":"justify", "hyphens":"auto", "-webkit-hyphens":"auto" },
    "h1, h2, h3, h4, h5":{ "text-align":"center !important", "hyphens":"none !important", "letter-spacing":"normal !important", "word-spacing":"normal !important", "line-height":"1.25 !important", "margin":"1.2em 0 .8em !important" },
    "h1":{ "font-size":"1.5em !important" }, "h2":{ "font-size":"1.3em !important" }, "h3, h4, h5":{ "font-size":"1.1em !important" },
    "a":{ "color":"inherit !important" },
    "img":{ "max-width":"100% !important", "height":"auto !important" }
  });
  LC.rend.themes.fontSize(LC.tam+"%");
  var capa=document.getElementById("lc-capa");
  if(capa){ capa.className="ve f-"+col.f; capa.style.setProperty("--lc-bg", col.bg); capa.style.setProperty("--lc-tx", col.tx); }
}
function lcGestos(contents){
  var d=contents.document, x0=null, y0=0, t0=0;
  if(!d.documentElement.getAttribute("lang")) d.documentElement.setAttribute("lang", d.documentElement.getAttribute("xml:lang")||"es");
  d.addEventListener("keydown", lcTeclas);
  d.addEventListener("touchstart", function(e){ var t=e.changedTouches[0]; x0=t.screenX; y0=t.screenY; t0=Date.now(); }, { passive:true });
  d.addEventListener("touchend", function(e){
    if(x0==null) return; var t=e.changedTouches[0], dx=t.screenX-x0, dy=t.screenY-y0; x0=null;
    if(Math.abs(dx)>40 && Math.abs(dx)>Math.abs(dy)*1.3 && Date.now()-t0<800){ if(dx<0) lcPasa(1); else lcPasa(-1); }
  }, { passive:true });
  /* un toque en el centro enseña u oculta las barras; en los bordes pasa página */
  d.addEventListener("click", function(e){
    if(e.target.closest && e.target.closest("a")) return;
    var fr=d.defaultView && d.defaultView.frameElement, caja=document.getElementById("lc-libro");
    if(!fr || !caja) return;
    var rc=caja.getBoundingClientRect(), w=rc.width, x=fr.getBoundingClientRect().left+e.clientX-rc.left;
    if(x<w*0.28) lcPasa(-1); else if(x>w*0.72) lcPasa(1);
    else { var c=document.getElementById("lc-capa"); if(c) c.classList.toggle("limpio"); lcPanel(null); }
  });
}
function lcTeclas(e){
  if(!document.getElementById("lc-capa")) return;
  if(e.key==="ArrowRight"||e.key==="PageDown"||e.key===" ") { e.preventDefault(); lcPasa(1); }
  else if(e.key==="ArrowLeft"||e.key==="PageUp"){ e.preventDefault(); lcPasa(-1); }
  else if(e.key==="Escape") lcCierra();
}
function lcPasa(dir){
  if(!LC.rend) return; if(dir>0) LC.rend.next(); else LC.rend.prev();
  /* al pasar página las barras se apartan; un toque en el centro las vuelve a traer */
  var c=document.getElementById("lc-capa"); if(c && !document.getElementById("lc-panel").dataset.t) c.classList.add("limpio");
}

/* cada vez que cambias de página: guarda por dónde vas y suma las páginas nuevas al hábito */
function lcMovido(loc, inicial){
  var id=LC.id, s=lbEst(id); if(!s || !loc || !loc.start) return;
  s.cfi=loc.start.cfi;
  var tot=LC.total, pag=0;
  if(tot && LC.book && LC.book.locations.length()){
    pag=Math.max(1, Math.min(tot, LC.book.locations.locationFromCfi(loc.start.cfi)+1));
    if(loc.atEnd) pag=tot;
    var antes=s.max||0;
    if(antes===0 && inicial){ s.max=pag; }
    else if(pag>antes){
      var nuevo=pag-antes; s.max=pag;
      /* solo cuenta lo que lees seguido: saltar con el índice no suma páginas */
      if(nuevo<=4 && !inicial) lcSuma(id, nuevo);
    }
    LC.pag=pag;
    var pc=Math.round(pag/tot*100);
    var bar=document.getElementById("lc-barra"); if(bar) bar.style.width=pc+"%";
    var tx=document.getElementById("lc-pag"); if(tx) tx.textContent="Página "+pag+" de "+tot+" · "+pc+" %";
    if(loc.atEnd && lbEstado(id)==="leyendo" && !LC.finAvisado){ LC.finAvisado=true; lcFinal(id); }
  }
  var cap=document.getElementById("lc-cap"); if(cap) cap.textContent=lcCapitulo(loc.start.href);
  var c=document.getElementById("lc-carga"); if(c) c.remove();
  clearTimeout(lcMovido.t); lcMovido.t=setTimeout(save, 800);
}
function lcSuma(id, n){
  var x=lbHabActivo(id); if(!x) return;
  var d=today(), antes=cantDe(d, x.id);
  var completo=cantPon(d, x.id, antes+n);
  if(completo){ sonido("gym"); lcAviso("Hoy ya llevas tus "+x.meta+" páginas. ¡Hábito cumplido!"); try{ if(navigator.vibrate) navigator.vibrate(12); }catch(e){} }
}
function lcAviso(t){
  var c=document.getElementById("lc-capa"); if(!c) return;
  var a=document.createElement("div"); a.className="lc-toast"; a.textContent=t; c.appendChild(a);
  setTimeout(function(){ a.classList.add("fuera"); }, 2600); setTimeout(function(){ a.remove(); }, 3100);
}
function lcFinal(id){
  var c=document.getElementById("lc-capa"); if(!c) return;
  var a=document.createElement("div"); a.className="lc-fin";
  a.innerHTML='<b>Has llegado al final</b><small>¿Lo marcas como terminado?</small><div><button data-act="x-lb-lfin" data-id="'+id+'">Sí, terminado</button><button data-act="x-lb-lfinno">Aún no</button></div>';
  c.appendChild(a);
}
function lcCapitulo(href){
  var t="", base=String(href||"").split("#")[0];
  (function busca(l){ (l||[]).forEach(function(it){ if(String(it.href||"").split("#")[0].replace(/^.*\//,"")===base.replace(/^.*\//,"")) t=t||it.label; busca(it.subitems); }); })(LC.toc);
  return (t||"").trim();
}
function lcPanel(tipo){
  var p=document.getElementById("lc-panel"); if(!p) return;
  if(!tipo || p.dataset.t===tipo){ p.hidden=true; p.dataset.t=""; return; }
  p.dataset.t=tipo; p.hidden=false;
  if(tipo==="ajustes"){
    var col=lcColores();
    p.innerHTML='<p class="lc-p-t">Tamaño de letra</p><div class="lc-fila"><button data-act="x-lb-ltam" data-n="-10" aria-label="Letra más pequeña">A−</button><span class="num">'+LC.tam+' %</span><button data-act="x-lb-ltam" data-n="10" aria-label="Letra más grande">A+</button></div>'+
      '<p class="lc-p-t">Fondo</p><div class="lc-fila lc-fondos">'+[["papel","Papel"],["blanco","Blanco"],["noche","Noche"]].map(function(f){
        return '<button data-act="x-lb-lfondo" data-f="'+f[0]+'" class="fo-'+f[0]+(col.f===f[0]?" on":"")+'">'+f[1]+'</button>'; }).join("")+'</div>';
  } else {
    var items=[]; (function aplana(l, n){ (l||[]).forEach(function(it){ items.push({ h:it.href, t:(it.label||"").trim(), n:n }); aplana(it.subitems, n+1); }); })(LC.toc, 0);
    p.innerHTML='<p class="lc-p-t">Índice</p><div class="lc-indice">'+(items.length?items.map(function(it){
      return '<button data-act="x-lb-lir" data-h="'+esc(it.h)+'" style="padding-left:'+(12+it.n*14)+'px">'+esc(it.t||"Sin título")+'</button>'; }).join(""):'<p>Este libro no trae índice.</p>')+'</div>';
  }
}
function lcCierra(){
  var c=document.getElementById("lc-capa"); if(!c) return;
  save();
  document.removeEventListener("keydown", lcTeclas);
  try{ if(LC.rend) LC.rend.destroy(); }catch(e){}
  LC.book=null; LC.rend=null; LC.toc=null; LC.finAvisado=false; LC.cargando=false;
  var id=LC.id; LC.id=null;
  c.classList.remove("ve"); document.documentElement.classList.remove("lc-abierto");
  setTimeout(function(){ if(c.parentNode) c.parentNode.removeChild(c); }, 220);
  /* al cerrar vuelves a donde estabas, sin fichas por medio */
  render();
}

/* ── acciones ── */
var _lecturaAccionLc=lecturaAccion;
lecturaAccion=function(a, el){
  var id=el.dataset.id;
  if(a==="x-lb-lee"){ sonido("tick"); lcAbre(id); return true; }
  if(a==="x-lb-subir"){ lcElegir(); return true; }
  if(a==="x-lb-borra"){ if(confirm("¿Quitar este libro de Peak? Se borra el archivo de este dispositivo.")){ lcBorra(id); render(); lbSheetBiblio("mis"); avisoNube("Libro quitado."); } return true; }
  if(a==="x-lb-lcierra"){ lcCierra(); return true; }
  if(a==="x-lb-lotra"){ lcCierra(); lcScripts.p=null; setTimeout(function(){ lcAbre(id); }, 260); return true; }
  if(a==="x-lb-lprev"){ lcPasa(-1); return true; }
  if(a==="x-lb-lnext"){ lcPasa(1); return true; }
  if(a==="x-lb-lajustes"){ lcPanel("ajustes"); return true; }
  if(a==="x-lb-lindice"){ lcPanel("indice"); return true; }
  if(a==="x-lb-ltam"){ LC.tam=Math.max(70, Math.min(200, LC.tam+(+el.dataset.n))); try{ localStorage.setItem("peak-lector-tam", LC.tam); }catch(e){} lcTema(); lcPanel(null); lcPanel("ajustes"); return true; }
  if(a==="x-lb-lfondo"){ LC.fondo=el.dataset.f; try{ localStorage.setItem("peak-lector-fondo", LC.fondo); }catch(e){} lcTema(); lcPanel(null); lcPanel("ajustes"); return true; }
  if(a==="x-lb-lir"){ if(LC.rend) LC.rend.display(el.dataset.h); lcPanel(null); return true; }
  if(a==="x-lb-lfin"){ lcCierra(); lbTermina(id); render(); var n=lbLeidos().length; avisoNube("¡Libro terminado! Ya "+(n===1?"llevas uno":"van "+n)+".");
    if(lbSt().enc && lbSt().enc.r) lbSheetResultado(true); else lbSheetLibro(id); lbFiesta(); return true; }
  if(a==="x-lb-lfinno"){ var f=el.closest(".lc-fin"); if(f) f.remove(); return true; }
  return _lecturaAccionLc(a, el);
};

var LECTOR_CSS=[
'#lc-capa{ position:fixed; inset:0; z-index:160; display:flex; flex-direction:column; background:var(--lc-bg); color:var(--lc-tx); opacity:0; transition:opacity .2s; }',
'#lc-capa.ve{ opacity:1; }',
'html.lc-abierto, html.lc-abierto body{ overflow:hidden; }',
'.lc-arriba{ display:flex; align-items:center; gap:6px; padding:calc(env(safe-area-inset-top) + 8px) 10px 6px; transition:opacity .2s; }',
'.lc-bt{ width:40px; height:40px; flex:0 0 auto; display:grid; place-items:center; border-radius:12px; color:inherit; opacity:.8; }',
'.lc-bt svg{ width:20px; height:20px; } .lc-bt:active{ background:color-mix(in srgb, currentColor 10%, transparent); }',
'.lc-aa{ font:600 16px Georgia, serif; }',
'.lc-tit{ flex:1; min-width:0; text-align:center; line-height:1.2; }',
'.lc-tit b{ display:block; font-size:13.5px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
'.lc-tit small{ display:block; font-size:11.5px; opacity:.6; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-height:14px; }',
'.lc-zona{ position:relative; flex:1; min-height:0; }',
'#lc-libro{ position:absolute; inset:4px 22px 0; }',
'.lc-lado{ position:absolute; top:0; bottom:0; width:22px; } .lc-lado.izq{ left:0; } .lc-lado.der{ right:0; }',
'.lc-carga{ position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; text-align:center; padding:24px; background:var(--lc-bg); font-size:14px; }',
'.lc-carga small{ opacity:.65; font-size:12.5px; line-height:1.5; display:inline-block; margin-top:6px; max-width:300px; }',
'.lc-spin{ width:26px; height:26px; border-radius:50%; border:2.5px solid color-mix(in srgb, currentColor 20%, transparent); border-top-color:currentColor; animation:lc-gira .8s linear infinite; }',
'@keyframes lc-gira{ to{ transform:rotate(360deg); } }',
'.lc-sube{ padding:11px 20px; border-radius:999px; background:var(--accent); color:var(--on-accent); font-weight:600; font-size:14px; }',
'.lc-abajo{ padding:8px 24px calc(env(safe-area-inset-bottom) + 12px); transition:opacity .2s; }',
'.lc-barra{ height:3px; border-radius:3px; background:color-mix(in srgb, currentColor 14%, transparent); overflow:hidden; }',
'.lc-barra i{ display:block; height:100%; background:currentColor; opacity:.55; transition:width .3s; }',
'#lc-pag{ text-align:center; font-size:11.5px; opacity:.6; margin-top:7px; }',
'#lc-capa.limpio .lc-arriba, #lc-capa.limpio .lc-abajo{ opacity:0; pointer-events:none; }',
'.lc-panel{ position:absolute; top:calc(env(safe-area-inset-top) + 56px); right:10px; left:10px; max-width:360px; margin-left:auto; z-index:3; border-radius:18px; padding:14px 16px 16px;',
'  background:var(--lc-bg); color:var(--lc-tx); box-shadow:0 1px 0 color-mix(in srgb, currentColor 10%, transparent) inset, 0 18px 50px -12px rgba(0,0,0,.45); border:1px solid color-mix(in srgb, currentColor 14%, transparent); }',
'.lc-p-t{ font-size:11px; letter-spacing:.08em; text-transform:uppercase; opacity:.55; margin:4px 0 8px; }',
'.lc-fila{ display:flex; align-items:center; gap:8px; margin-bottom:10px; } .lc-fila span{ flex:1; text-align:center; font-size:14px; }',
'.lc-fila button{ flex:1; padding:10px 0; border-radius:12px; font-weight:600; border:1px solid color-mix(in srgb, currentColor 18%, transparent); }',
'.lc-fondos button.on{ outline:2px solid var(--accent); outline-offset:1px; }',
'.fo-papel{ background:#f6efdf; color:#2a2218; } .fo-blanco{ background:#fff; color:#1a1a1a; } .fo-noche{ background:#151412; color:#d9d2c3; }',
'.lc-indice{ max-height:55vh; overflow:auto; margin:0 -8px; } .lc-indice p{ font-size:13.5px; opacity:.7; padding:6px 8px; }',
'.lc-indice button{ display:block; width:100%; text-align:left; padding:10px 12px; border-radius:10px; font-size:14px; line-height:1.3; }',
'.lc-indice button:active{ background:color-mix(in srgb, currentColor 8%, transparent); }',
'.lc-toast, .lc-fin{ position:absolute; left:50%; bottom:calc(env(safe-area-inset-bottom) + 58px); transform:translateX(-50%); z-index:4; max-width:calc(100% - 32px);',
'  background:var(--lc-tx); color:var(--lc-bg); border-radius:14px; padding:10px 16px; font-size:13.5px; font-weight:600; text-align:center; box-shadow:0 12px 30px -10px rgba(0,0,0,.5); transition:opacity .4s; }',
'.lc-toast.fuera{ opacity:0; }',
'.lc-fin{ padding:14px 18px; } .lc-fin b{ display:block; font-size:15px; } .lc-fin small{ display:block; opacity:.75; font-weight:500; margin-top:2px; }',
'.lc-fin div{ display:flex; gap:8px; margin-top:10px; justify-content:center; }',
'.lc-fin button{ padding:8px 14px; border-radius:999px; border:1px solid currentColor; font-size:13px; } .lc-fin button:first-child{ background:var(--lc-bg); color:var(--lc-tx); border-color:transparent; }',
'.lb-aqui{ display:inline-flex; align-items:center; gap:4px; font-style:normal; font-size:10.5px; font-weight:700; letter-spacing:.02em; color:var(--accent); background:var(--accent-soft); padding:2px 7px; border-radius:999px; }',
'.lb-subir{ display:flex; align-items:center; gap:12px; width:100%; text-align:left; padding:12px 14px; border-radius:16px; border:1.5px dashed var(--accent-line); color:var(--t1); margin:6px 0 4px; }',
'.lb-subir .lb-subir-i{ width:34px; height:34px; border-radius:10px; display:grid; place-items:center; background:var(--accent-soft); color:var(--accent); font-size:18px; flex:0 0 auto; }',
'.lb-subir b{ display:block; font-size:14px; } .lb-subir small{ display:block; font-size:12px; color:var(--t3); }'
].join("\n");
(function(){ var st=document.createElement("style"); st.id="lector-css"; st.textContent=LECTOR_CSS; document.head.appendChild(st); })();

var LECTURA_CSS=[
/* portadas */
'.lb-port{ position:relative; display:block; flex:0 0 auto; container-type:inline-size; aspect-ratio:2/3; border-radius:2px 6px 6px 2px; overflow:hidden; background:var(--f); color:var(--t);',
'  box-shadow:0 1px 1.5px rgba(0,0,0,.18), 0 8px 18px -8px rgba(0,0,0,.45); text-align:left; }',
'.lb-port::before{ content:""; position:absolute; inset:0 auto 0 0; width:7%; z-index:3; background:linear-gradient(90deg, rgba(0,0,0,.28), rgba(255,255,255,.14) 70%, rgba(0,0,0,.06)); }',
'.lb-port::after{ content:""; position:absolute; inset:0; z-index:3; background:linear-gradient(125deg, rgba(255,255,255,.16), transparent 38%); pointer-events:none; }',
'.lb-port.s{ width:40px; border-radius:2px 4px 4px 2px; } .lb-port.m{ width:64px; } .lb-port.l{ width:104px; } .lb-port.xl{ width:148px; border-radius:3px 9px 9px 3px; }',
'.lb-deco{ position:absolute; z-index:1; }',
'.lb-in{ position:absolute; inset:0; z-index:2; display:flex; flex-direction:column; gap:5cqw; padding:12cqw 10cqw 11cqw 16cqw; }',
'.lb-p-a{ font-size:7cqw; font-weight:700; letter-spacing:.1em; text-transform:uppercase; line-height:1.15; opacity:.85; }',
'.lb-p-t{ font-family:Georgia,"Iowan Old Style","Times New Roman",serif; font-size:13cqw; font-weight:700; line-height:1.04; letter-spacing:-.01em;',
'  display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:6; overflow:hidden; overflow-wrap:break-word; hyphens:auto; }',
'.lb-ini{ display:none; position:absolute; z-index:2; inset:0; place-items:center; padding-left:8%; font-family:Georgia,"Times New Roman",serif; font-size:52cqw; font-weight:700; }',
'.lb-port.s .lb-in{ display:none; } .lb-port.s .lb-ini{ display:grid; }',
/* variantes: banda, círculo, franjas, marco */
'.lb-port.v0 .lb-deco{ left:0; right:0; bottom:0; height:30%; background:var(--x); }',
'.lb-port.v0 .lb-p-t{ margin-top:auto; margin-bottom:36cqw; }',
'.lb-port.v1 .lb-deco{ width:95%; aspect-ratio:1; border-radius:50%; right:-30%; bottom:-14%; background:var(--x); opacity:.95; }',
'.lb-port.v1 .lb-in{ flex-direction:column-reverse; justify-content:flex-end; }',
'.lb-port.v2 .lb-deco{ left:0; right:0; top:0; height:26%; background:repeating-linear-gradient(-45deg, var(--x) 0 5cqw, transparent 5cqw 10cqw); opacity:.9; }',
'.lb-port.v2 .lb-in{ padding-top:36cqw; }',
'.lb-port.v3 .lb-deco{ inset:6cqw 6cqw 6cqw 11cqw; border:1.5cqw solid var(--x); border-radius:1cqw; }',
'.lb-port.v3 .lb-in{ padding:18cqw 14cqw 14cqw 20cqw; justify-content:center; text-align:center; align-items:center; }',
'.lb-port.v3 .lb-p-t{ text-align:center; }',
'.lb-port.s.v1 .lb-ini, .lb-port.s.v0 .lb-ini{ place-items:start center; padding-top:14%; }',
/* bloque en Hábitos */
'.lb-hab{ margin-top:20px; }',
'.lb-cab{ display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }',
'.lb-cab .eyebrow{ display:flex; align-items:center; gap:6px; } .lb-cab .eyebrow .ic{ width:14px; height:14px; }',
'.lb-cab button{ font-size:12.5px; font-weight:600; color:var(--accent); }',
'.lb-now{ display:flex; gap:14px; align-items:flex-start; padding:14px; border-radius:20px; background:var(--fill); }',
'.lb-now-port{ flex:0 0 auto; transition:transform .25s var(--spring); } .lb-now-port:active{ transform:scale(.95) rotate(-2deg); }',
'.lb-now-t{ flex:1; min-width:0; }',
'.lb-now-tit{ display:block; text-align:left; width:100%; } .lb-now-tit b{ display:block; font-size:14.5px; font-weight:700; line-height:1.25; } .lb-now-tit small{ display:block; font-size:12px; color:var(--t3); margin-top:1px; }',
'.lb-barra{ height:6px; border-radius:99px; overflow:hidden; background:var(--fill-hi); margin-top:10px; }',
'.lb-barra i{ display:block; height:100%; border-radius:99px; background:linear-gradient(90deg,var(--accent),var(--violet)); transition:width .6s var(--ease); }',
'.lb-now-p{ font-size:12px; color:var(--t3); margin-top:6px; } .lb-now-p b{ color:var(--t1); font-weight:700; }',
'.lb-now-s{ font-size:12px; color:var(--t2); margin-top:2px; line-height:1.4; }',
'.lb-pill{ display:inline-flex; align-items:center; gap:6px; margin-top:10px; font-size:12.5px; font-weight:700; color:var(--accent); padding:7px 12px; border-radius:99px; background:var(--accent-soft); transition:transform .2s var(--spring); }',
'.lb-pill:active{ transform:scale(.96); }',
'.lb-pill-on{ background:var(--accent); color:var(--on-accent); }',
'.lb-pill-ok{ background:var(--good); color:#fff; }',
'.lb-now.fin{ background:color-mix(in srgb,var(--good) 12%,transparent); }',
'.lb-desc{ display:flex; gap:16px; align-items:center; padding:16px; border-radius:20px;',
'  background:linear-gradient(135deg, color-mix(in srgb,var(--accent) 11%,transparent), color-mix(in srgb,var(--violet) 8%,transparent));',
'  box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--accent) 16%,transparent); }',
'.lb-pila{ position:relative; flex:0 0 auto; width:92px; height:100px; }',
'.lb-pila .lb-port{ position:absolute; bottom:0; transition:transform .35s var(--spring); }',
'.lb-pila .lb-port:nth-child(1){ left:0; transform:rotate(-9deg); } .lb-pila .lb-port:nth-child(2){ left:14px; transform:rotate(-2deg); } .lb-pila .lb-port:nth-child(3){ left:28px; transform:rotate(6deg); }',
'.lb-pila .lb-port:only-child{ left:14px; }',
'.lb-pila:active .lb-port:nth-child(3){ transform:rotate(2deg) translateY(-4px); }',
'.lb-desc-t{ flex:1; min-width:0; } .lb-desc-t small{ display:block; font-size:10.5px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--accent); }',
'.lb-desc-t > b, .lb-desc-tit b{ display:block; font-size:15px; font-weight:800; line-height:1.25; margin-top:3px; letter-spacing:-.01em; } .lb-desc-tit{ text-align:left; }',
'.lb-desc-t p{ font-size:12.5px; color:var(--t2); margin-top:3px; line-height:1.4; }',
'.lb-desc-bt{ display:flex; flex-wrap:wrap; gap:6px; } .lb-desc-bt .lb-pill{ margin-top:10px; }',
/* hojas */
'.lb-enc-ban{ display:flex; align-items:center; gap:12px; width:100%; text-align:left; padding:12px 14px; border-radius:16px; margin-bottom:14px;',
'  background:linear-gradient(135deg, color-mix(in srgb,var(--accent) 14%,transparent), color-mix(in srgb,var(--violet) 10%,transparent)); }',
'.lb-enc-ban > span:nth-child(2){ flex:1; min-width:0; } .lb-enc-ban b{ display:block; font-size:14px; font-weight:700; } .lb-enc-ban small{ display:block; font-size:12px; color:var(--t2); margin-top:1px; }',
'.lb-enc-ico{ display:grid; place-items:center; width:36px; height:36px; border-radius:12px; background:var(--accent); font-size:17px; flex:0 0 auto; }',
'.lb-enc-ban .ic{ width:16px; height:16px; color:var(--t3); }',
'.lb-chips{ display:flex; gap:6px; overflow-x:auto; margin:0 -24px 6px; padding:2px 24px; scrollbar-width:none; } .lb-chips::-webkit-scrollbar{ display:none; }',
'.lb-chips button{ flex:0 0 auto; font-size:12.5px; font-weight:700; padding:7px 12px; border-radius:99px; background:var(--fill); color:var(--t2); transition:background .2s var(--ease), color .2s var(--ease); }',
'.lb-chips button.on{ background:var(--c); color:#fff; }',
'.lb-sec{ font-size:10.5px; font-weight:600; letter-spacing:.16em; text-transform:uppercase; color:var(--t3); margin:18px 0 6px; }',
'.lb-lista{ display:flex; flex-direction:column; }',
'.lb-fila{ display:flex; align-items:center; gap:12px; width:100%; text-align:left; padding:10px 0; box-shadow:inset 0 -1px 0 var(--hairline-2); }',
'.lb-fila .lb-port.s{ width:42px; }',
'.lb-fila-t{ flex:1; min-width:0; } .lb-fila-t b{ display:block; font-size:14px; font-weight:700; line-height:1.28; } .lb-fila-t small{ display:block; font-size:11.5px; color:var(--t3); margin-top:1px; }',
'.lb-fila-t > span{ display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; overflow:hidden; font-size:12.5px; color:var(--t2); margin-top:3px; line-height:1.38; }',
'.lb-fila-d{ flex:0 0 auto; display:flex; flex-direction:column; align-items:flex-end; gap:4px; }',
'.lb-fila-d em{ font-style:normal; font-size:10.5px; font-weight:700; padding:3px 8px; border-radius:99px; background:var(--fill-hi); color:var(--t2); }',
'.lb-fila-d em.on{ background:var(--accent-soft); color:var(--accent); } .lb-fila-d em.ok{ background:color-mix(in srgb,var(--good) 16%,transparent); color:var(--good); }',
'.lb-match{ font-style:normal; font-size:12px; font-weight:800; color:var(--accent); } .lb-fecha{ font-style:normal; font-size:11px; color:var(--t3); }',
'.lb-vacio{ font-size:13px; color:var(--t3); text-align:center; padding:28px 12px; line-height:1.45; }',
'.lb-nota{ font-size:11.5px; color:var(--t3); margin-top:14px; line-height:1.4; }',
'.lb-ficha{ display:flex; gap:16px; align-items:flex-end; }',
'.lb-ficha-t{ flex:1; min-width:0; padding-bottom:2px; } .lb-ficha-t h3{ font-size:21px; font-weight:800; line-height:1.15; letter-spacing:-.02em; margin-top:8px; }',
'.lb-ficha-t p{ font-size:13.5px; color:var(--t2); margin-top:4px; } .lb-ficha-t small{ display:block; font-size:12px; color:var(--t3); margin-top:6px; line-height:1.35; }',
'.lb-tema{ display:inline-block; font-size:11px; font-weight:700; padding:3px 9px; border-radius:99px; color:color-mix(in srgb,var(--c) 72%,var(--t1)); background:color-mix(in srgb,var(--c) 14%,transparent); }',
'.lb-desc-l{ font-size:14px; color:var(--t1); line-height:1.5; margin-top:16px; }',
'.lb-ideas{ display:flex; flex-direction:column; gap:8px; counter-reset:lb; }',
'.lb-ideas li{ position:relative; padding-left:28px; font-size:13.5px; color:var(--t2); line-height:1.42; counter-increment:lb; }',
'.lb-ideas li::before{ content:counter(lb); position:absolute; left:0; top:0; width:19px; height:19px; display:grid; place-items:center; border-radius:99px; font-size:10.5px; font-weight:800; background:var(--accent-soft); color:var(--accent); }',
'.lb-est{ font-size:12.5px; color:var(--t2); margin-top:10px; line-height:1.4; }',
'.lb-dos{ display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:8px; }',
'.lb-link{ display:flex; align-items:center; justify-content:center; gap:4px; width:100%; margin-top:14px; font-size:12.5px; font-weight:600; color:var(--t3); }',
'.lb-link .ic{ width:13px; height:13px; }',
'.lb-prog{ margin-top:18px; padding:14px; border-radius:16px; background:var(--fill); }',
'.lb-prog b{ font-size:22px; font-weight:800; } .lb-prog b span{ font-size:13px; font-weight:600; color:var(--t3); } .lb-prog em{ font-style:normal; font-size:13px; font-weight:700; color:var(--accent); }',
'.lb-prog p{ font-size:12.5px; color:var(--t2); margin-top:8px; }',
'.lb-edicion{ display:flex; align-items:center; gap:8px; margin-top:12px; font-size:12.5px; color:var(--t2); } .lb-edicion input{ width:78px; padding:8px; }',
'.lb-leido{ display:flex; align-items:center; gap:10px; margin-top:18px; padding:12px 14px; border-radius:14px; font-size:13.5px; font-weight:600; color:var(--good); background:color-mix(in srgb,var(--good) 12%,transparent); }',
'.lb-leido svg{ width:18px; height:18px; flex:0 0 auto; }',
/* encuesta */
'.lb-volver{ display:flex; align-items:center; gap:2px; font-size:13px; font-weight:600; color:var(--accent); } .lb-volver .ic{ width:15px; height:15px; transform:rotate(180deg); }',
'.lb-atras .ic{ transform:rotate(180deg); width:16px; height:16px; }',
'.lb-pasos{ display:flex; gap:5px; } .lb-pasos i{ flex:1; height:4px; border-radius:99px; background:var(--fill-hi); transition:background .3s var(--ease); }',
'.lb-pasos i.ya, .lb-pasos i.on{ background:var(--accent); } .lb-pasos i.on{ opacity:.55; }',
'.lb-enc-n{ font-size:12px; font-weight:600; color:var(--t3); margin-top:16px; }',
'.lb-enc-q{ font-size:22px; font-weight:800; line-height:1.2; letter-spacing:-.02em; margin:4px 0 16px; }',
'.lb-ops{ display:flex; flex-direction:column; gap:8px; }',
'.lb-op{ display:flex; align-items:center; gap:12px; width:100%; text-align:left; padding:12px 14px; border-radius:16px; font-size:14.5px; font-weight:600; background:var(--fill);',
'  box-shadow:inset 0 0 0 1.5px transparent; transition:background .2s var(--ease), box-shadow .2s var(--ease), transform .2s var(--spring); animation:lbEntra .35s var(--ease) both; }',
'.lb-op:nth-child(2){ animation-delay:.03s } .lb-op:nth-child(3){ animation-delay:.06s } .lb-op:nth-child(4){ animation-delay:.09s } .lb-op:nth-child(5){ animation-delay:.12s } .lb-op:nth-child(6){ animation-delay:.15s } .lb-op:nth-child(7){ animation-delay:.18s }',
'.lb-op:active{ transform:scale(.98); }',
'.lb-op > span:nth-child(2){ flex:1; }',
'.lb-op-e{ display:grid; place-items:center; width:36px; height:36px; border-radius:12px; font-size:18px; background:var(--glass-bg-hi); flex:0 0 auto; }',
'.lb-op i{ display:grid; place-items:center; width:22px; height:22px; border-radius:99px; color:transparent; box-shadow:inset 0 0 0 1.5px var(--hairline-2); flex:0 0 auto; }',
'.lb-op i svg{ width:12px; height:12px; }',
'.lb-op.on{ background:var(--accent-soft); box-shadow:inset 0 0 0 1.5px var(--accent); } .lb-op.on i{ background:var(--accent); color:var(--on-accent); box-shadow:none; }',
'@keyframes lbEntra{ from{ opacity:0; transform:translateY(8px); } to{ opacity:1; transform:none; } }',
'.lb-res{ display:flex; flex-direction:column; align-items:center; text-align:center; padding-top:4px; }',
'.lb-res-port{ position:relative; margin-bottom:16px; animation:lbSale .6s var(--spring) both; }',
'.lb-res-port .lb-port{ box-shadow:0 2px 3px rgba(0,0,0,.2), 0 22px 40px -14px rgba(0,0,0,.55); }',
'.lb-res-match{ position:absolute; right:-14px; top:-10px; z-index:4; font-size:13px; font-weight:800; padding:6px 10px; border-radius:99px; background:var(--accent); color:var(--on-accent); box-shadow:0 6px 16px -6px var(--accent); }',
'.lb-res h3{ font-size:23px; font-weight:800; line-height:1.15; letter-spacing:-.02em; margin-top:10px; } .lb-res p{ font-size:13.5px; color:var(--t2); margin-top:4px; }',
'@keyframes lbSale{ from{ opacity:0; transform:translateY(16px) rotate(-4deg) scale(.92); } to{ opacity:1; transform:none; } }',
'.lb-porque{ display:flex; flex-direction:column; gap:8px; }',
'.lb-porque li{ display:flex; gap:10px; align-items:flex-start; font-size:13.5px; color:var(--t2); line-height:1.4; }',
'.lb-porque svg{ width:16px; height:16px; flex:0 0 auto; color:var(--good); margin-top:1px; }',
/* fila en el editor de hábitos */
'.lb-ed{ display:flex; align-items:center; gap:12px; width:100%; text-align:left; margin:-12px 0 22px; padding:12px 14px; border-radius:16px; background:var(--fill); }',
'.lb-ed-p{ display:flex; } .lb-ed-p .lb-port.s{ width:30px; } .lb-ed-p .lb-port + .lb-port{ margin-left:-10px; transform:rotate(5deg); }',
'.lb-ed-t{ flex:1; min-width:0; } .lb-ed-t b{ display:block; font-size:13.5px; font-weight:700; } .lb-ed-t small{ display:block; font-size:12px; color:var(--t3); margin-top:1px; }',
'.lb-ed .ic{ width:16px; height:16px; color:var(--t3); }',
'@media (prefers-reduced-motion: reduce){ .lb-op, .lb-res-port{ animation:none; } }'
].join("\n");
(function(){ var st=document.createElement("style"); st.id="lectura-css"; st.textContent=LECTURA_CSS; document.head.appendChild(st); })();


