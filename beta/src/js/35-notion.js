/* ════════════ Notion: tus hábitos y tus libros, en tu Notion ════════════
   Notion no deja hablar con su API desde el navegador, así que todo pasa por
   la función «notion» de Supabase (servidor/notion/index.ts). El permiso de
   Notion se queda allí; en este móvil solo se guarda la preferencia y hasta
   qué día se ha exportado (localStorage, fuera de la copia).
   Peak crea dos tablas en la página de Notion que elijas, «Peak · Hábitos»
   (una fila por día) y «Peak · Libros», y las va rellenando: lo que ya está
   se actualiza, no se duplica. */
var NT_KEY="peak-notion";
var ntInfo=null, ntPaginas=null, ntOcupado=false, ntError="";
function ntPref(){ try{ return JSON.parse(localStorage.getItem(NT_KEY)||"null")||{}; }catch(e){ return {}; } }
function ntPrefGuarda(o){ try{ localStorage.setItem(NT_KEY, JSON.stringify(o)); }catch(e){} }
function ntPuede(){ return !!(ses && ses.access_token && !ses.demo); }
function ntLlama(accion, extra){
  var body=Object.assign({ accion:accion }, extra||{});
  return pedirAuth("/functions/v1/notion", { method:"POST", body:body }).then(function(r){
    if(r.ok) return r.datos||{};
    var e=new Error((r.datos&&r.datos.error)||("http "+r.estado)); e.estado=r.estado; throw e;
  });
}
function ntMensaje(e){
  var m=e&&e.message;
  if(m==="sin_configurar" || (e&&e.estado===404)) return "La conexión con Notion aún no está activada en el servidor.";
  if(m==="reconectar") return "Notion ya no deja entrar a Peak. Vuelve a conectar.";
  if(m==="sin_pagina") return "No se encuentra la página de Notion. Elige otra.";
  if(m==="sin_sesion") return "Entra con tu cuenta para usar Notion.";
  return "No se ha podido hablar con Notion. Mira la conexión y prueba otra vez.";
}
function ntCargaEstado(){
  if(!ntPuede()) return Promise.resolve(null);
  return ntLlama("estado").then(function(j){
    ntInfo=j; ntError="";
    var p=ntPref(); p.on=!!j.conectado; if(!j.conectado){ p.hasta=null; } ntPrefGuarda(p);
    return j;
  }).catch(function(e){ ntError=ntMensaje(e); if(e.message==="reconectar"){ ntInfo={conectado:false}; } return null; });
}

/* ── lo que se manda ── */
function ntFechaBonita(d){
  try{ return new Date(d+"T00:00:00").toLocaleDateString(LOCALE,{ weekday:"short", day:"numeric", month:"short", year:"numeric" }); }catch(e){ return d; }
}
function ntHabitos(desde){
  var out=[], t=today(), d=desde, nombre={};
  (S.ideal||[]).forEach(function(x){ nombre[x.id]=x.text; });
  while(d<=t){
    var ids=checksOf(d)||[], hay=idealDe(d), h=(S.habits||{})[d];
    if(ids.length || h || d===t){
      out.push({
        fecha:d, titulo:ntFechaBonita(d), total:hay.length,
        hechos:ids.map(function(id){ return nombre[id]; }).filter(Boolean),
        pendientes:hay.filter(function(x){ return ids.indexOf(x.id)<0; }).map(function(x){ return x.text; }),
        agua:h&&h.water?h.water:null, sueno:h&&h.sleep?h.sleep:null, pantalla:h&&h.screen!=null?h.screen:null
      });
    }
    d=addDays(d,1);
  }
  return out;
}
/* los libros de Lectura (si esta versión de la app la tiene) */
function ntLibros(){
  var L=S.lectura&&S.lectura.libros; if(!L || typeof LB==="undefined") return [];
  var temas={}; if(typeof LB_TEMAS!=="undefined") LB_TEMAS.forEach(function(x){ temas[x.k]=x.t; });
  return Object.keys(L).map(function(id){
    var b=LB.filter(function(x){ return x.id===id; })[0], e=L[id]||{};
    if(!b) return null;
    return { id:id, titulo:b.t, autor:b.a, estado:e.e, tema:temas[b.k]||"", paginas:e.total||b.n||null, desde:e.desde||null, fin:e.fin||null };
  }).filter(Boolean);
}
function ntExporta(callado){
  if(ntOcupado) return Promise.resolve(false);
  var p=ntPref(), t=today();
  /* la primera vez, el último mes; luego desde un par de días antes de la última */
  var desde=p.hasta ? addDays(p.hasta,-2) : addDays(t,-29);
  if(desde<addDays(t,-59)) desde=addDays(t,-59);
  ntOcupado=true; ntRepinta();
  if(!callado) avisoNube("Exportando a Notion…");
  return ntLlama("exporta", { habitos:ntHabitos(desde), libros:ntLibros() }).then(function(j){
    var p2=ntPref(); p2.hasta=t; p2.dia=t; ntPrefGuarda(p2);
    if(ntInfo) ntInfo.exportado=j.exportado;
    ntError="";
    if(!callado) avisoNube("Listo: "+j.habitos+(j.habitos===1?" día":" días")+(j.libros?" y "+j.libros+(j.libros===1?" libro":" libros"):"")+" en Notion.");
    return true;
  }).catch(function(e){
    ntError=ntMensaje(e);
    if(e.message==="reconectar"){ ntInfo={conectado:false}; }
    if(e.message==="sin_pagina" && ntInfo){ ntInfo.pagina=null; }
    if(!callado) avisoNube(ntError);
    return false;
  }).then(function(r){ ntOcupado=false; ntRepinta(); return r; });
}
/* una vez al día, al abrir la app, si lo tienes activado */
function ntAutomatico(){
  var p=ntPref();
  if(!p.on || p.auto===false || p.dia===today() || !ntPuede()) return;
  ntCargaEstado().then(function(j){ if(j && j.conectado && j.pagina) ntExporta(true); });
}

/* ── en Ajustes, su propia sección ── */
var NT_ICO='<path d="M5 4.5h10.5L19 8v11.5H5z"/><path d="M8.5 16V8.5l7 7.5V8.5"/>';
function ntRepinta(){ var p=document.getElementById("aj-notion"); if(p) ntPintaAjustes(p); ntFilaMenu(); }
function ntFilaMenu(){
  var s=document.querySelector('.aj-fila[data-k="notion"] small'); if(!s) return;
  s.textContent = ntInfo&&ntInfo.conectado ? "Conectado"+(ntInfo.espacio?" · "+ntInfo.espacio:"") : "Exporta hábitos y libros";
}
function ntPintaAjustes(p){
  var h='', i=ntInfo, pr=ntPref();
  var vuelta=p.querySelector(".aj-atras"), tit=p.querySelector(".aj-h");
  if(!ntPuede()){
    h='<p class="nt-txt">Entra con tu cuenta de Peak para conectar Notion.</p>';
  } else if(!i){
    h='<p class="nt-txt">'+(ntError?esc(ntError):'Cargando…')+'</p>'+
      (ntError?'<button class="btn btn-quiet w-full !py-3 mt-4" data-act="x-nt-recarga">Probar otra vez</button>':'');
  } else if(!i.conectado){
    h='<p class="nt-txt">Conecta tu Notion y Peak irá apuntando allí tus hábitos de cada día y tus libros, en dos tablas que puedes ordenar, filtrar y enlazar con lo tuyo.</p>'+
      '<p class="nt-txt" style="margin-top:8px">Al dar permiso, marca la página donde quieres que vivan esas tablas.</p>'+
      (ntError?'<p class="nt-err">'+esc(ntError)+'</p>':'')+
      '<button class="btn btn-primary w-full !py-3.5 mt-4" data-act="x-nt-conecta"'+(ntOcupado?' disabled':'')+'>Conectar con Notion</button>';
  } else if(!i.pagina){
    h='<p class="nt-txt">Conectado'+(i.espacio?' a <b>'+esc(i.espacio)+'</b>':'')+'. Elige la página donde Peak creará sus tablas.</p>';
    if(!ntPaginas){ h+='<p class="nt-txt" style="margin-top:10px">Buscando tus páginas…</p>'; ntCargaPaginas(); }
    else if(!ntPaginas.length) h+='<p class="nt-txt" style="margin-top:10px">No has compartido ninguna página con Peak. Vuelve a conectar y marca una al dar permiso.</p>';
    else h+='<div class="soc-ajustes nt-paginas">'+ntPaginas.map(function(x){
      return '<button data-act="x-nt-elige" data-id="'+esc(x.id)+'"><span>'+(x.icono?esc(x.icono)+' ':'')+esc(x.titulo)+'</span><span class="t3">Elegir</span></button>'; }).join("")+'</div>';
    h+='<div class="soc-ajustes" style="margin-top:14px"><button data-act="x-nt-conecta"><span>Volver a conectar</span></button>'+
       '<button data-act="x-nt-desconecta"><span class="rojo">Desconectar</span></button></div>';
  } else {
    h='<div class="soc-ajustes">'+
        '<div><span>Conectado'+(i.espacio?' a <b>'+esc(i.espacio)+'</b>':'')+'</span></div>'+
        '<button data-act="x-nt-cambia"><span>Página</span><span class="t3">'+esc(i.paginaTitulo||"Notion")+' ›</span></button>'+
        '<label><span>Exportar solo cada día</span><input type="checkbox" id="nt-auto"'+(pr.auto!==false?' checked':'')+' data-act="x-nt-auto"></label>'+
        '<button data-act="x-nt-desconecta"><span class="rojo">Desconectar</span></button>'+
      '</div>'+
      (ntError?'<p class="nt-err">'+esc(ntError)+'</p>':'')+
      '<button class="btn btn-primary w-full !py-3.5 mt-4" data-act="x-nt-exporta"'+(ntOcupado?' disabled':'')+'>'+(ntOcupado?'Exportando…':'Exportar ahora')+'</button>'+
      '<p class="nt-txt" style="margin-top:12px">En «'+esc(i.paginaTitulo||"tu página")+'» verás «Peak · Hábitos», una fila por día'+(typeof LB!=="undefined"?', y «Peak · Libros»':'')+'. '+
        (i.exportado?'Última vez: '+esc(new Date(i.exportado).toLocaleString(LOCALE,{ day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" }))+'.':'Aún no has exportado nada.')+'</p>';
  }
  p.innerHTML=""; if(vuelta) p.appendChild(vuelta); if(tit) p.appendChild(tit);
  p.insertAdjacentHTML("beforeend", h);
}
function ntCargaPaginas(){
  if(ntOcupado) return;
  ntOcupado=true;
  ntLlama("paginas").then(function(j){ ntPaginas=j.paginas||[]; ntError=""; })
    .catch(function(e){ ntPaginas=[]; ntError=ntMensaje(e); if(e.message==="reconectar") ntInfo={conectado:false}; })
    .then(function(){ ntOcupado=false; ntRepinta(); });
}
var _sheetSettingsNt=sheetSettings;
sheetSettings=function(){
  _sheetSettingsNt.apply(this, arguments);
  var menu=document.getElementById("aj-menu"); if(!menu || document.getElementById("aj-notion")) return;
  var fila='<button class="aj-fila" data-act="x-aj-sec" data-k="notion"><span class="aj-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+NT_ICO+'</svg></span>'+
    '<span class="aj-txt"><b>Notion</b><small>Exporta hábitos y libros</small></span><svg class="aj-fl" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></button>';
  var ref=menu.querySelector('[data-k="datos"]')||menu.querySelector(".aj-pie");
  if(ref) ref.insertAdjacentHTML("beforebegin", fila); else menu.insertAdjacentHTML("beforeend", fila);
  var p=document.createElement("div"); p.className="aj-pag"; p.id="aj-notion"; p.hidden=true;
  p.innerHTML='<button class="aj-atras" data-act="x-aj-sec" data-k=""><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>Ajustes</button><h4 class="display aj-h">Notion</h4>';
  menu.parentNode.appendChild(p);
  ntPintaAjustes(p); ntFilaMenu();
  if(ajSeccion==="notion") ajMuestra("notion", true);
  if(ntPuede() && !ntOcupado) ntCargaEstado().then(ntRepinta);
};
function ntAccion(a, el){
  if(a==="x-nt-conecta"){
    if(!ntPuede()){ avisoNube("Entra con tu cuenta para conectar Notion."); return true; }
    ntOcupado=true; ntRepinta();
    ntLlama("inicio").then(function(j){ if(!j.url) throw new Error("x"); location.href=j.url; })
      .catch(function(e){ ntOcupado=false; ntError=ntMensaje(e); ntRepinta(); avisoNube(ntError); });
    return true;
  }
  if(a==="x-nt-recarga"){ ntError=""; ntInfo=null; ntRepinta(); ntCargaEstado().then(ntRepinta); return true; }
  if(a==="x-nt-elige"){
    if(ntOcupado) return true;
    ntOcupado=true;
    ntLlama("elige", { pagina:el.dataset.id }).then(function(j){
      ntInfo.pagina=j.pagina; ntInfo.paginaTitulo=j.paginaTitulo; ntPaginas=null; ntError="";
      var p=ntPref(); p.hasta=null; ntPrefGuarda(p);
      ntOcupado=false; ntExporta(false);
    }).catch(function(e){ ntOcupado=false; ntError=ntMensaje(e); ntRepinta(); avisoNube(ntError); });
    return true;
  }
  if(a==="x-nt-cambia"){ if(ntInfo){ ntInfo.pagina=null; } ntPaginas=null; ntRepinta(); return true; }
  if(a==="x-nt-exporta"){ ntExporta(false); return true; }
  if(a==="x-nt-auto"){ var p=ntPref(); p.auto=!!el.checked; ntPrefGuarda(p); return true; }
  if(a==="x-nt-desconecta"){
    ntLlama("desconecta").catch(function(){}).then(function(){
      try{ localStorage.removeItem(NT_KEY); }catch(e){}
      ntInfo={ conectado:false }; ntPaginas=null; ntError=""; ntRepinta();
      avisoNube("Notion desconectado. Lo que ya está en Notion se queda allí.");
    });
    return true;
  }
  return false;
}
var _ntGA=grupoAccion;
grupoAccion=function(a, el){ if(ntAccion(a, el)) return true; return _ntGA.apply(this, arguments); };
/* se vuelve de Notion: …?notion=ok (o cancelado, caducado, fallo) */
var ntVuelta=(function(){
  var m=/[?&]notion=([a-z]+)/.exec(location.search||""); if(!m) return null;
  try{ history.replaceState(null, "", location.pathname); }catch(e){}
  return m[1];
})();
setTimeout(function(){
  if(!ntVuelta){ ntAutomatico(); return; }
  var txt={ ok:"Notion conectado. Elige la página para tus tablas.", cancelado:"Has cancelado la conexión con Notion.",
            caducado:"La conexión con Notion ha caducado. Prueba otra vez." }[ntVuelta]||"Notion no ha dejado conectar. Prueba otra vez.";
  avisoNube(txt);
  if(!ntPuede()) return;
  ntCargaEstado().then(function(j){
    var p=ntPref(); p.hasta=null; ntPrefGuarda(p);
    ajSeccion="notion"; sheetSettings();
    if(j && j.conectado && j.pagina) ntExporta(false);   /* la integración trajo su propia página: se exporta ya */
  });
}, 1400);
document.addEventListener("visibilitychange", function(){ if(!document.hidden) ntAutomatico(); });
(function(){ var st=document.createElement("style"); st.id="notion-css"; st.textContent=[
'.nt-txt{ font-size:14px; line-height:1.45; color:var(--t2); }',
'.nt-err{ margin-top:12px; font-size:13px; line-height:1.4; color:var(--alert); }',
'.nt-paginas{ margin-top:12px; max-height:44vh; overflow-y:auto; }',
'.nt-paginas button span:first-child{ min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }',
'#aj-notion .soc-ajustes label input{ width:20px; height:20px; accent-color:var(--accent); }'
].join("\n"); document.head.appendChild(st); })();

if(!load()) save();
if(S.cats.length) newCat=S.cats[0].id;
trArranca();
extrasArranca();
seccionesPeak();
go("resumen");
arrancarCuenta();
if(!S.tour && !puertaEl()) setTimeout(function(){ tourStep=0; renderTour(); }, 700);
guardarEspejo();
setTimeout(refrescarAvisos, 2500);
