/* ════════════════════════════════════════════════════════════════
   CHAT DEL GRUPO (sep 2026)
   · Cada grupo tiene su chat, dentro de Social (donde estaba
     «Actividad»): un recuadro con scroll y la caja para escribir debajo.
     Los logros que se publican solos salen dentro, como líneas en gris.
   · Se pueden mandar fotos (botón de la cámara). Debajo de cada foto,
     también de las del gym que salen solas, hay comentarios que se
     despliegan.
   · Lo nuevo llega al momento: se escucha el tiempo real de Supabase
     (a mano, sin librería, como el resto de la nube) y, si no llega, se
     vuelve a preguntar cada pocos segundos mientras ves Social.
   · Reacciones: las mismas de Actividad (emojisDisponibles), una de
     cada por persona; tocar la burbuja las muestra, tocar otra vez quita.
   · Cambiar de grupo: el nombre del grupo lleva una flecha ⌄ que abre
     la lista de tus grupos con los mensajes sin leer de cada uno. Si
     hay algo sin leer, sale un punto en la pestaña Social.
   · El recuadro es siempre el mismo trozo de página: cuando Social se
     repinta se vuelve a colocar tal cual (con lo escrito y el scroll),
     y mientras escribes no se repinta, para no cerrar el teclado.
   · Servidor: tabla g_chat y funciones gc_* (servidor/social.sql).
   Solo con cuenta y un grupo de verdad; sin eso, Social sigue igual.
   ════════════════════════════════════════════════════════════════ */
var CH={ por:{}, caja:null, cajaGrupo:"", abiertoReac:null, borrar:null, firma:"", mantenArriba:false, sinServidor:false,
         coms:{}, comBorr:{}, repintar:false, listaPend:false };
var CH_RES={}, chResT=0, CH_N=60;
G_ERR.muy_rapido="Vas muy rápido. Espera un momento.";
G_ERR.vacio="El mensaje está vacío.";
G_ERR.foto_mal="Esa foto no se puede mandar.";
G_ERR.no_existe="Ese mensaje ya no está.";

function chYo(){ return (ses && ses.uid) || ""; }
function chActivo(){ return !!(GRUPO && GRUPO.real && GRUPO.id && gReal()); }
function chVisible(){ return !!(chActivo() && view==="social" && CH.caja && CH.caja.isConnected && document.visibilityState!=="hidden"); }
function chEscribiendo(){ var a=document.activeElement; return !!(a && CH.caja && CH.caja.contains(a) && (a.tagName==="TEXTAREA" || a.tagName==="INPUT")); }
/* lo de cada grupo por separado: cambiar de grupo no mezcla mensajes */
function chG(g){
  g=g||(GRUPO && GRUPO.id)||"";
  if(!CH.por[g]) CH.por[g]={ id:g, msgs:[], hayMas:false, cargado:0, cargando:null, error:false };
  return CH.por[g];
}
function chVistos(){ if(!S.chatVisto || typeof S.chatVisto!=="object") S.chatVisto={}; return S.chatVisto; }
function chQuien(uid){
  if(GRUPO) for(var i=0;i<GRUPO.miembros.length;i++) if(GRUPO.miembros[i].uid===uid) return GRUPO.miembros[i];
  return null;
}
/* mensaje del chat (no comentario) */
function chPrincipal(m){ return !m.padre && !m.evento; }
function chMapea(x){
  x=x||{};
  var reac={}, mias={}, yo=chYo();
  if(x.reac && typeof x.reac==="object") Object.keys(x.reac).slice(0,12).forEach(function(e){
    var l=Array.isArray(x.reac[e]) ? x.reac[e] : [];
    if(e.length>8 || !l.length) return;
    reac[e]=Math.min(l.length, 99); if(l.indexOf(yo)>=0) mias[e]=1;
  });
  return { id:gNum(x.id, 9e15), uid:gTxt(x.uid,40), texto:gTxt(x.texto,1000), foto:gUrl(x.foto), padre:gNum(x.padre, 9e15), evento:gNum(x.evento, 9e15),
           ts:Date.parse(x.creado)||Date.now(), reac:reac, mias:mias };
}
/* la actividad automática trae la hora exacta, para ordenarla con los mensajes */
var _chMapea=gMapea;
gMapea=function(e){
  var r=_chMapea.apply(this, arguments);
  (e.eventos||[]).forEach(function(x, i){ if(r.muro[i]) r.muro[i].ts=Date.parse(x.creado)||0; });
  return r;
};

/* ── hablar con el servidor ── */
function chCargar(antes){
  if(!chActivo()) return Promise.resolve();
  var G=chG();
  if(G.cargando && !antes) return G.cargando;
  var p=gRpc("gc_leer", { p_grupo:G.id, p_antes:antes||null, p_n:CH_N }).then(function(l){
    l=(Array.isArray(l)?l:[]).map(chMapea).filter(function(m){ return m.id; });
    var princ=l.filter(chPrincipal);
    CH.sinServidor=false; G.error=false;
    if(antes){
      var ya={}; G.msgs.forEach(function(m){ if(m.id) ya[m.id]=1; });
      G.msgs=l.filter(function(m){ return !ya[m.id]; }).concat(G.msgs);
      G.hayMas=princ.length>=CH_N; CH.mantenArriba=true;
    } else {
      /* lo anterior a lo recibido (cargado con «ver anteriores») se queda, con sus comentarios */
      var min=princ.length ? princ[0].id : Infinity, viejos={};
      var quedan=G.msgs.filter(function(m){ if(m.id && chPrincipal(m) && m.id<min){ viejos[m.id]=1; return true; } return false; });
      var comsViejos=G.msgs.filter(function(m){ return m.id && m.padre && viejos[m.padre]; });
      /* lo que se está enviando se queda, salvo que ya haya llegado por aquí */
      var pend=G.msgs.filter(function(m){
        return !m.id && !(m.estado==="enviando" && l.some(function(n){
          return n.uid===m.uid && n.texto===m.texto && !!n.foto===!!(m.foto||m.local) && n.padre===m.padre && n.evento===m.evento; }));
      });
      if(!G.leido){ G.hayMas=princ.length>=CH_N; G.leido=true; }
      G.msgs=quedan.concat(comsViejos, l, pend);
      G.cargado=Date.now();
    }
    chPintaTodo();
  }).catch(function(e){
    if(!antes) G.cargado=Date.now();
    if(e && e.message==="sin_servidor") CH.sinServidor=true; else { G.error=true; G.errorTxt=(e && e.message) || ""; }
    chPintaTodo();
  }).then(function(){ if(!antes) G.cargando=null; });
  if(!antes) G.cargando=p;
  return p;
}
/* mandar: texto, foto (blob + vista previa) o comentario (padre/evento) */
function chEnviar(txt, extra){
  extra=extra||{};
  txt=String(txt||"").replace(/^\s+|\s+$/g, "").slice(0, 1000);
  if((!txt && !extra.blob) || !chActivo()) return null;
  var G=chG(), m={ id:0, tmp:"t"+Date.now()+Math.random().toString(36).slice(2,6), uid:chYo(), texto:txt, foto:"", local:extra.local||"", blob:extra.blob||null,
                   padre:extra.padre||0, evento:extra.evento||0, ts:Date.now(), reac:{}, mias:{}, estado:"enviando" };
  G.msgs.push(m);
  chPintaLista(chPrincipal(m), true);
  chSube(G, m);
  return m;
}
function chSube(G, m){
  m.estado="enviando";
  var antes=(m.blob && !m.foto) ? chSubeFoto(m.blob).then(function(url){ m.foto=url; }) : Promise.resolve();
  antes.then(function(){
    return gRpc("gc_enviar", { p_grupo:G.id, p_texto:m.texto, p_foto:m.foto||null, p_padre:m.padre||null, p_evento:m.evento||null }).catch(function(e){
      /* si en el servidor solo está la versión primera (solo texto), un texto normal va igual */
      if(e && e.message==="sin_servidor" && !m.foto && !m.padre && !m.evento) return gRpc("gc_enviar", { p_grupo:G.id, p_texto:m.texto });
      throw e;
    });
  }).then(function(x){
    var n=chMapea(x); if(!n.id) throw new Error("sin_id");
    var i=G.msgs.indexOf(m), ya=G.msgs.some(function(o){ return o.id===n.id; });
    if(i>=0){ if(ya) G.msgs.splice(i,1); else G.msgs[i]=n; }
    else if(!ya) G.msgs.push(n);
    chPintaTodo();
  }).catch(function(e){
    var t=(e && e.message) || "";
    m.estado="fallo"; m.motivo=t==="sin_servidor" ? "falta activar el chat en Supabase"+(window.DTRACK_BETA && gEstado.detalle ? " · "+gEstado.detalle.slice(0,200) : "") : t==="foto" ? "no se ha podido subir la foto" : (window.DTRACK_BETA ? t.slice(0,160) : "");
    if(t==="sin_servidor") CH.sinServidor=true;
    chPintaTodo();
    if(t==="sin_servidor") avisoNube("El chat aún no está activado en el servidor.");
    else if(G_ERR[t] || t.indexOf("muy_rapido")>=0 || t.indexOf("no_eres_miembro")>=0) avisoNube(gError(e));
    /* en la beta, cualquier otro error se enseña tal cual para poder arreglarlo */
    else if(window.DTRACK_BETA && t && t!=="foto" && navigator.onLine!==false) avisoNube("No se ha enviado: "+t.slice(0,120));
  });
}
/* la foto va al mismo cubo público que las del gym, en tu carpeta y con un nombre al azar */
function chSubeFoto(blob){
  var az=new Uint8Array(9); try{ crypto.getRandomValues(az); }catch(e){ for(var k=0;k<9;k++) az[k]=Math.floor(Math.random()*256); }
  var ruta="gym/"+ses.uid+"/chat-"+Date.now().toString(36)+"-"+Array.prototype.map.call(az, function(n){ return ("0"+n.toString(16)).slice(-2); }).join("")+".jpg";
  return tokenFresco().then(function(){
    return fetch(NUBE_URL+"/storage/v1/object/"+ruta, { method:"POST",
      headers:{ "apikey":NUBE_KEY, "Authorization":"Bearer "+ses.access_token, "Content-Type":"image/jpeg", "x-upsert":"true" }, body:blob });
  }).then(function(r){
    if(!r || !r.ok) throw new Error("foto");
    return NUBE_URL+"/storage/v1/object/public/"+ruta;
  }, function(){ throw new Error("foto"); });
}
function chFotoElige(){
  var i=document.createElement("input"); i.type="file"; i.accept="image/*"; i.style.cssText="position:fixed;left:-9999px";
  document.body.appendChild(i);
  i.addEventListener("change", function(){ var f=i.files && i.files[0]; if(i.parentNode) i.parentNode.removeChild(i); if(f) chFotoPrepara(f); });
  i.click();
}
/* se reduce en el móvil (1280 px) y se manda con lo que hubiera escrito como pie */
function chFotoPrepara(archivo){
  if(archivo.size > 25*1024*1024){ avisoNube("Esa foto pesa demasiado."); return; }
  var lector=new FileReader();
  lector.onerror=function(){ avisoNube("No he podido leer esa foto."); };
  lector.onload=function(){
    var im=new Image();
    im.onerror=function(){ avisoNube("Ese archivo no es una imagen."); };
    im.onload=function(){
      var L=1280, k=Math.min(1, L/Math.max(im.width, im.height)), w=Math.round(im.width*k), h=Math.round(im.height*k);
      var c=document.createElement("canvas"); c.width=w; c.height=h; var x=c.getContext("2d"); if(!x) return;
      x.drawImage(im, 0, 0, w, h);
      var previa=c.toDataURL("image/jpeg", .6);
      c.toBlob(function(b){
        if(!b){ avisoNube("No he podido preparar la foto."); return; }
        var ta=document.getElementById("ch-texto"), pie=ta ? ta.value : "";
        if(ta){ ta.value=""; chAlto(ta); }
        chEnviar(pie, { blob:b, local:previa });
      }, "image/jpeg", .82);
    };
    im.src=lector.result;
  };
  lector.readAsDataURL(archivo);
}
function chBusca(key){
  var id=+String(key).slice(2), G=chG();
  for(var i=0;i<G.msgs.length;i++) if(G.msgs[i].id===id) return G.msgs[i];
  return null;
}
function chReacciona(key, e){
  CH.abiertoReac=null; CH.borrar=null;
  /* lo automático reacciona como siempre (Actividad) */
  if(key.indexOf("e:")===0){ reaccionar(key.slice(2), e, null); chPintaTodo(); return; }
  var m=chBusca(key); if(!m) return;
  if(m.mias[e]){ m.reac[e]=Math.max(0, (m.reac[e]||1)-1); if(!m.reac[e]) delete m.reac[e]; delete m.mias[e]; sonido("des"); }
  else { m.reac[e]=(m.reac[e]||0)+1; m.mias[e]=1; sonido("pop"); }
  chPintaTodo();
  gRpc("gc_reaccion", { p_id:m.id, p_emoji:e }).then(function(r){
    var n=chMapea({ reac:r }); m.reac=n.reac; m.mias=n.mias; chPintaTodo();
  }).catch(function(err){ avisoNube(gError(err)); chCargar(); });
}
function chBorra(key){
  if(CH.borrar!==key){ CH.borrar=key; chPintaLista(); return; }
  var m=chBusca(key), G=chG(); CH.borrar=null; CH.abiertoReac=null;
  if(!m) return;
  G.msgs=G.msgs.filter(function(o){ return o!==m && o.padre!==m.id; });
  sonido("borrar"); chPintaTodo();
  gRpc("gc_borrar", { p_id:m.id }).catch(function(err){ avisoNube(gError(err)); chCargar(); });
}
/* cuántos mensajes nuevos hay en cada grupo (para la lista de grupos y el punto) */
function chResumen(forzar){
  if(!gReal()) return Promise.resolve(CH_RES);
  if(!forzar && Date.now()-chResT<60000) return Promise.resolve(CH_RES);
  chResT=Date.now();
  var V=chVistos(), vistos={}; Object.keys(V).forEach(function(k){ if(typeof V[k]==="number") vistos[k]=V[k]; });
  return gRpc("gc_resumen", { p_vistos:vistos }).then(function(l){
    var o={}, antes=JSON.stringify(CH_RES);
    (Array.isArray(l)?l:[]).forEach(function(r){ var id=gTxt(r.grupo,40); if(id) o[id]={ ultimo:gNum(r.ultimo,9e15), sin:gNum(r.sin_leer,99) }; });
    CH_RES=o;
    /* si llega algo nuevo en el grupo que ves, se trae */
    if(chActivo() && o[GRUPO.id] && o[GRUPO.id].ultimo>chUltimo(chG())) chCargar();
    if(JSON.stringify(o)!==antes && view==="social") rSocial();
    chPunto();
    return o;
  }).catch(function(e){ if(e && e.message==="sin_servidor") CH.sinServidor=true; return CH_RES; });
}
function chUltimo(G){ var x=0; G.msgs.forEach(function(m){ if(m.id>x) x=m.id; }); return x; }
function chSinLeer(g){
  var G=CH.por[g], V=chVistos(), yo=chYo();
  if(G && G.cargado){ var n=0; G.msgs.forEach(function(m){ if(m.id && m.id>(V[g]||0) && m.uid!==yo) n++; }); return n; }
  return (CH_RES[g] && CH_RES[g].sin) || 0;
}
/* viendo Social, lo del grupo que tienes delante cuenta como leído */
function chMarcaVisto(){
  if(!chVisible()) return;
  var g=GRUPO.id, max=chUltimo(chG()), V=chVistos();
  if(max>(V[g]||0)){ V[g]=max; save(); }
  if(CH_RES[g]) CH_RES[g].sin=0;
  chPunto();
}
function chPunto(){
  var hay=false;
  if(chActivo()){
    var ids=MIS_GRUPOS.length ? MIS_GRUPOS.map(function(g){ return g.id; }) : [GRUPO.id];
    ids.forEach(function(g){ if(chSinLeer(g)>0 && !(chVisible() && g===GRUPO.id)) hay=true; });
  }
  $$('#mtabs button[data-view="social"], #rail button[data-view="social"]').forEach(function(b){ b.classList.toggle("ch-punto", hay); });
}

/* ── tiempo real: el aviso de Supabase de que algo ha cambiado en g_chat ──
   Solo hace de timbre: al sonar, se vuelven a pedir los últimos mensajes. */
var chWs=null, chWsTopic="", chWsOk=false, chWsRef=0, chWsJoin="", chWsHb=null, chWsReint=0, chWsTok="", chAvisoT=null;
function chRtQuiere(){ return chActivo() && document.visibilityState!=="hidden" && view==="social"; }
function chRtRevisa(){
  if(!chRtQuiere()){ chRtCierra(); return; }
  var topic="realtime:dtrack-chat-"+GRUPO.id;
  if(chWs && chWsTopic===topic) return;
  chRtCierra(); chRtAbre(topic, GRUPO.id);
}
function chRtAbre(topic, g){
  if(typeof WebSocket==="undefined") return;
  var ws;
  try{ ws=new WebSocket(NUBE_URL.replace(/^http/, "ws")+"/realtime/v1/websocket?apikey="+encodeURIComponent(NUBE_KEY)+"&vsn=1.0.0"); }catch(e){ return; }
  chWs=ws; chWsTopic=topic; chWsOk=false;
  function manda(o){ try{ if(ws.readyState===1) ws.send(JSON.stringify(o)); }catch(e){} }
  ws.onopen=function(){
    tokenFresco().then(function(){
      if(chWs!==ws || !ses || !ses.access_token) return;
      chWsTok=ses.access_token; chWsJoin=String(++chWsRef);
      manda({ topic:topic, event:"phx_join", ref:chWsJoin, join_ref:chWsJoin, payload:{
        config:{ broadcast:{ ack:false, self:false }, presence:{ key:"" }, private:false,
                 postgres_changes:[{ event:"*", schema:"public", table:"g_chat", filter:"grupo=eq."+g }] },
        access_token:chWsTok } });
    });
    clearInterval(chWsHb);
    chWsHb=setInterval(function(){
      manda({ topic:"phoenix", event:"heartbeat", payload:{}, ref:String(++chWsRef) });
      if(ses && ses.access_token && ses.access_token!==chWsTok){
        chWsTok=ses.access_token; manda({ topic:topic, event:"access_token", payload:{ access_token:chWsTok }, ref:String(++chWsRef), join_ref:chWsJoin });
      }
    }, 25000);
  };
  ws.onmessage=function(ev){
    var m; try{ m=JSON.parse(ev.data); }catch(e){ return; }
    if(!m || m.topic!==topic) return;
    var p=m.payload||{};
    if(m.event==="phx_reply" && m.ref===chWsJoin) chWsOk=(p.status==="ok");
    else if(m.event==="system"){ if(p.status==="ok"){ chWsOk=true; chWsReint=0; } else if(p.status==="error") chWsOk=false; }
    else if(m.event==="postgres_changes"){ clearTimeout(chAvisoT); chAvisoT=setTimeout(function(){ if(GRUPO && GRUPO.id===g) chCargar(); }, 150); }
    else if(m.event==="phx_error" || m.event==="phx_close") chWsOk=false;
  };
  ws.onerror=function(){};
  ws.onclose=function(){
    if(chWs!==ws) return;
    clearInterval(chWsHb); chWs=null; chWsTopic=""; chWsOk=false;
    setTimeout(chRtRevisa, Math.min(30000, 2000*Math.pow(2, chWsReint++)));
  };
}
function chRtCierra(){
  clearInterval(chWsHb);
  if(!chWs) return;
  var ws=chWs; chWs=null; chWsTopic=""; chWsOk=false;
  try{ ws.close(); }catch(e){}
}
/* por si el tiempo real no llega: viendo Social se pregunta cada 4 s (cada 30 s si llega) */
setInterval(function(){
  if(!chActivo() || document.visibilityState==="hidden" || view!=="social") return;
  var G=chG();
  if(Date.now()-(G.cargado||0)>(chWsOk?30000:4000)) chCargar();
}, 2000);
document.addEventListener("visibilitychange", function(){
  if(document.visibilityState==="hidden"){ chRtCierra(); return; }
  if(!chActivo()) return;
  chRtRevisa(); if(view==="social") chCargar(); chResumen(true);
});

/* ── pintar ── */
function chHora(ts){ var d=new Date(ts); return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0"); }
function chDiaTxt(d){
  var hoy=today();
  if(d===hoy) return tr("Hoy"); if(d===addDays(hoy,-1)) return tr("Ayer");
  return cap(fmt(d, d.slice(0,4)===hoy.slice(0,4) ? { weekday:"long", day:"numeric", month:"long" } : { day:"numeric", month:"long", year:"numeric" }));
}
function chNombre(uid){ if(uid===chYo()) return tr("Tú"); var q=chQuien(uid); return q ? q.usuario : "alguien"; }
/* mensajes y actividad automática, por orden de hora */
function chItems(){
  var G=chG(), princ=G.msgs.filter(chPrincipal), l=princ.map(function(m){ return { k:"m", ts:m.ts, m:m }; });
  var desde=(G.hayMas && princ.length) ? princ[0].ts : 0;
  ((GRUPO && GRUPO.muro) || []).forEach(function(e){ if(e.ts && e.ts>=desde) l.push({ k:"e", ts:e.ts, e:e }); });
  l.sort(function(a,b){ return a.ts-b.ts; });
  return l;
}
function chComentarios(key){
  var id=+String(key).slice(2), ev=key.indexOf("e:")===0;
  return chG().msgs.filter(function(m){ return ev ? m.evento===id : (m.padre===id && id>0); });
}
function chReacHTML(reac, mias, key){
  var ks=Object.keys(reac||{}); if(!ks.length) return "";
  return '<div class="ch-reac">'+ks.map(function(e){
    return '<button class="'+((mias && mias[e])?"mia":"")+'" data-act="x-chat-reac" data-id="'+esc(key)+'" data-e="'+esc(e)+'">'+esc(e)+
      (reac[e]>1 ? '<span class="num">'+reac[e]+'</span>' : '')+'</button>';
  }).join("")+'</div>';
}
function chEligeHTML(key, mias, mio){
  return '<div class="ch-elige">'+emojisDisponibles().map(function(e){
    return '<button class="'+((mias && mias[e])?"mia":"")+'" data-act="x-chat-reac" data-id="'+esc(key)+'" data-e="'+esc(e)+'">'+esc(e)+'</button>';
  }).join("")+
  (mio ? '<button class="ch-borra'+(CH.borrar===key?" seguro":"")+'" data-act="x-chat-borra" data-id="'+esc(key)+'">'+(CH.borrar===key?"¿Borrar?":"Borrar")+'</button>' : '')+
  '</div>';
}
/* los comentarios de una foto, plegados; al abrirlos, la caja para comentar */
function chComHTML(key){
  var l=chComentarios(key), ab=!!CH.coms[key];
  var h='<div class="ch-com'+(ab?" abierto":"")+'"><button class="ch-com-t" data-act="x-chat-com" data-id="'+esc(key)+'">'+
    (l.length ? l.length+" "+(l.length===1?"comentario":"comentarios") : "Comentar")+
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></button>';
  if(ab){
    h+='<div class="ch-com-lista">'+l.map(function(c){
      return '<p class="ch-com-c'+(c.estado?" "+c.estado:"")+'"><b>'+esc(chNombre(c.uid))+'</b> '+esc(c.texto)+
        (c.estado==="fallo" ? ' <button class="ch-fallo" data-act="x-chat-reintenta" data-tmp="'+esc(c.tmp)+'">Reintentar</button>' : '')+'</p>';
    }).join("")+
    '<div class="ch-com-esc"><input class="ch-com-in" data-id="'+esc(key)+'" maxlength="500" placeholder="Añade un comentario…" enterkeyhint="send" autocomplete="off" value="'+esc(CH.comBorr[key]||"")+'">'+
      '<button class="ch-com-env" data-act="x-chat-com-envia" data-id="'+esc(key)+'">Enviar</button></div></div>';
  }
  return h+'</div>';
}
function chMensajeHTML(m, sigue, mio){
  var key=m.id ? "m:"+m.id : "", nom=chNombre(m.uid), q=mio ? null : chQuien(m.uid), foto=m.foto||m.local;
  var cara="";
  if(!mio) cara = sigue ? '<span class="ch-hueco"></span>'
    : '<span class="ch-cara"'+(q?' data-act="x-perfil" data-u="'+esc(nom)+'"':'')+'>'+caraDe(q||{ usuario:nom }, 28)+'</span>';
  var hora='<span class="ch-hora num">'+(m.estado==="enviando"?"···":chHora(m.ts))+'</span>';
  return '<div class="ch-m'+(mio?" yo":"")+(sigue?" sigue":"")+'">'+cara+
    '<div class="ch-col">'+
      (!mio && !sigue ? '<p class="ch-quien">'+esc(nom)+'</p>' : '')+
      '<div class="ch-burbuja'+(foto?" con-foto":"")+(m.estado?" "+m.estado:"")+'"'+(key?' data-act="x-chat-toca" data-id="'+key+'"':'')+'>'+
        (foto ? '<button class="ch-foto-m"'+(m.foto?' data-act="x-fg-ver" data-u="'+esc(m.foto)+'" data-t="'+esc(nom+" · "+chHora(m.ts))+'"':'')+'><img src="'+esc(foto)+'" alt="" loading="lazy"></button>' : '')+
        (m.texto ? '<span class="ch-txt">'+esc(m.texto)+'</span>'+hora : (foto ? '<span class="ch-pie">'+hora+'</span>' : hora))+
      '</div>'+
      chReacHTML(m.reac, m.mias, key)+
      (key && CH.abiertoReac===key ? chEligeHTML(key, m.mias, mio) : '')+
      (m.estado==="fallo" ? '<button class="ch-fallo" data-act="x-chat-reintenta" data-tmp="'+esc(m.tmp)+'">No se ha enviado'+(m.motivo?" ("+esc(m.motivo)+")":"")+' · Reintentar</button>' : '')+
      (key && m.foto ? chComHTML(key) : '')+
    '</div></div>';
}
function chEventoHTML(e){
  var key="e:"+e.id;
  return '<div class="ch-ev">'+
    '<button class="ch-ev-t" data-act="x-chat-toca" data-id="'+esc(key)+'"><b>'+esc(e.usuario)+'</b> '+esc(e.texto)+'<span class="num"> · '+chHora(e.ts)+'</span></button>'+
    (e.foto ? '<button class="ch-foto" data-act="x-fg-ver" data-u="'+esc(e.foto)+'" data-t="'+esc(e.usuario+" · "+e.cuando)+'"><img src="'+esc(e.foto)+'" alt="" loading="lazy"></button>' : '')+
    chReacHTML(e.reac, e.mias, key)+
    (CH.abiertoReac===key ? chEligeHTML(key, e.mias, false) : '')+
    (e.foto && /^\d+$/.test(String(e.id)) ? chComHTML(key) : '')+
  '</div>';
}
function chFirma(items){
  return items.map(function(it){
    return it.k==="m" ? (it.m.id||it.m.tmp)+(it.m.estado||"")+JSON.stringify(it.m.reac)+JSON.stringify(it.m.mias)
                      : "e"+it.e.id+JSON.stringify(it.e.reac||{})+JSON.stringify(it.e.mias||{})+(it.e.foto?1:0);
  }).join("|")+"#"+chG().msgs.filter(function(m){ return !chPrincipal(m); }).map(function(m){ return (m.id||m.tmp)+(m.estado||""); }).join(",")+
    "#"+JSON.stringify(CH.coms)+"#"+CH.abiertoReac+"#"+CH.borrar+"#"+chG().hayMas+"#"+chG().cargado+"#"+CH.sinServidor+"#"+(GRUPO?GRUPO.miembros.length:0);
}
/* abajo: bajar al final; forzar: aunque estés comentando (después se devuelve el foco) */
function chPintaLista(abajo, forzar){
  var lista=document.getElementById("ch-lista"), sc=document.getElementById("ch-scroll"); if(!lista || !sc || !chActivo()) return;
  var ae=document.activeElement, comentando=ae && ae.classList && ae.classList.contains("ch-com-in") && lista.contains(ae);
  if(comentando && !forzar){ CH.listaPend=true; return; }
  var items=chItems(), firma=chFirma(items);
  if(firma===CH.firma && !abajo) return;
  CH.firma=firma; CH.listaPend=false;
  var G=chG(), yo=chYo(), h="", dia="", prev=null;
  var cerca=abajo || (sc.scrollHeight-sc.scrollTop-sc.clientHeight<140);
  if(G.hayMas) h+='<button class="ch-antes" data-act="x-chat-antes">Ver mensajes anteriores</button>';
  if(!items.length){
    h+='<p class="ch-vacio">'+(CH.sinServidor ? "El chat aún no está activado en el servidor. Vuelve a probar en un rato."
      : !G.cargado ? "Cargando…"
      : G.error ? "No se han podido cargar los mensajes. Prueba en un rato."+(window.DTRACK_BETA && G.errorTxt ? " ("+esc(G.errorTxt.slice(0,160))+")" : "")
      : "Aquí empieza el chat de «"+esc(GRUPO.nombre)+"». Lo que escribas solo lo ve el grupo.")+'</p>';
  }
  items.forEach(function(it){
    var d=iso(it.ts);
    if(d!==dia){ dia=d; prev=null; h+='<p class="ch-dia">'+esc(chDiaTxt(d))+'</p>'; }
    if(it.k==="e"){ h+=chEventoHTML(it.e); prev=null; return; }
    var m=it.m, sigue=!!(prev && prev.uid===m.uid && m.ts-prev.ts<5*60000 && !prev.foto && !m.foto);
    h+=chMensajeHTML(m, sigue, m.uid===yo);
    prev=m;
  });
  var alto=sc.scrollHeight, arriba=sc.scrollTop;
  lista.innerHTML=h;
  if(CH.mantenArriba){ CH.mantenArriba=false; sc.scrollTop=arriba+(sc.scrollHeight-alto); }
  else if(cerca) sc.scrollTop=sc.scrollHeight;
  else sc.scrollTop=arriba;
  /* si estabas comentando, el foco vuelve a tu caja */
  if(comentando){ var inp=lista.querySelector('.ch-com-in[data-id="'+ae.dataset.id+'"]'); if(inp){ try{ inp.focus({ preventScroll:true }); inp.setSelectionRange(inp.value.length, inp.value.length); }catch(e){ inp.focus(); } } }
  chMarcaVisto();
}
function chPintaTodo(){ if(chVisible()) chPintaLista(); chPunto(); }

/* ── el recuadro del chat: se crea una vez y se recoloca en cada repintado de Social ── */
var ICO_CAMARA='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>';
function chCaja(){
  if(CH.caja) return CH.caja;
  var c=document.createElement("div"); c.className="ch-caja"; c.id="ch-caja";
  c.innerHTML='<div class="ch-scroll" id="ch-scroll"><div class="ch-lista" id="ch-lista"></div></div>'+
    '<div class="ch-escribe">'+
      '<button class="ch-foto-bt" data-act="x-chat-foto" aria-label="Mandar una foto">'+ICO_CAMARA+'</button>'+
      '<textarea id="ch-texto" rows="1" maxlength="1000" placeholder="Escribe al grupo…" enterkeyhint="send" autocomplete="off"></textarea>'+
      '<button class="ch-enviar" data-act="x-chat-enviar" aria-label="Enviar">'+
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/></svg></button>'+
    '</div>';
  var ta=c.querySelector("#ch-texto"), sc=c.querySelector("#ch-scroll");
  ta.addEventListener("input", function(){ chAlto(ta); });
  ta.addEventListener("keydown", function(ev){ if(ev.key==="Enter" && !ev.shiftKey && !ev.isComposing){ ev.preventDefault(); chEnviaCaja(); } });
  /* que al tocar «enviar» no se cierre el teclado */
  c.addEventListener("pointerdown", function(ev){ if(ev.target.closest(".ch-enviar, .ch-com-env")) ev.preventDefault(); });
  c.addEventListener("mousedown", function(ev){ if(ev.target.closest(".ch-enviar, .ch-com-env")) ev.preventDefault(); });
  /* comentarios: lo escrito se guarda y Enter lo manda */
  c.addEventListener("input", function(ev){ var t=ev.target; if(t.classList && t.classList.contains("ch-com-in")) CH.comBorr[t.dataset.id]=t.value; });
  c.addEventListener("keydown", function(ev){ var t=ev.target; if(t.classList && t.classList.contains("ch-com-in") && ev.key==="Enter" && !ev.isComposing){ ev.preventDefault(); chComEnvia(t.dataset.id); } });
  /* al soltar la caja, lo que se dejó para luego */
  c.addEventListener("focusout", function(){
    setTimeout(function(){
      if(chEscribiendo()) return;
      if(CH.listaPend) chPintaLista();
      if(CH.repintar){ CH.repintar=false; if(view==="social") rSocial(); }
    }, 60);
  });
  /* tocar fuera de una burbuja cierra las reacciones */
  sc.addEventListener("click", function(ev){ if(!ev.target.closest("[data-act]") && CH.abiertoReac){ CH.abiertoReac=null; CH.borrar=null; chPintaLista(); } });
  CH.caja=c; return c;
}
function chAlto(ta){ ta.style.height="auto"; ta.style.height=Math.min(120, ta.scrollHeight)+"px"; }
function chEnviaCaja(){
  var ta=document.getElementById("ch-texto"); if(!ta) return;
  var v=ta.value; if(!v.trim()) return;
  ta.value=""; chAlto(ta); ta.focus();
  chEnviar(v);
}
function chComEnvia(key){
  var inp=CH.caja && CH.caja.querySelector('.ch-com-in[data-id="'+key+'"]'), v=inp ? inp.value : (CH.comBorr[key]||"");
  if(!v.trim()) return;
  CH.comBorr[key]="";
  if(inp) inp.value="";
  var id=+String(key).slice(2);
  chEnviar(v, key.indexOf("e:")===0 ? { evento:id } : { padre:id });
}
/* en Social, «Actividad» deja sitio al chat */
var _chSocMuro=socMuro;
socMuro=function(){
  if(!chActivo()) return _chSocMuro.apply(this, arguments);
  return '<div class="soc-sec"><h2 class="display">Chat</h2></div><div id="ch-sitio"></div>';
};
var _chRSocial=rSocial;
rSocial=function(){
  /* escribiendo no se repinta: se perdería el teclado. Se hace al soltar la caja. */
  if(chEscribiendo()){ CH.repintar=true; return; }
  var sc=CH.caja && CH.caja.isConnected ? CH.caja.querySelector(".ch-scroll") : null;
  var pos=sc ? { y:sc.scrollTop, abajo:sc.scrollHeight-sc.scrollTop-sc.clientHeight<60 } : null;
  var r=_chRSocial.apply(this, arguments);
  chColoca(pos);
  return r;
};
function chColoca(pos){
  var sitio=document.getElementById("ch-sitio"); if(!sitio || !chActivo()) return;
  var caja=chCaja(), sc=caja.querySelector(".ch-scroll");
  sitio.parentNode.replaceChild(caja, sitio);
  if(CH.cajaGrupo!==GRUPO.id){ CH.cajaGrupo=GRUPO.id; CH.firma=""; CH.abiertoReac=null; CH.borrar=null; chPintaLista(true); }
  else { CH.firma=""; chPintaLista(); if(pos) sc.scrollTop=pos.abajo ? sc.scrollHeight : pos.y; else sc.scrollTop=sc.scrollHeight; }
  chMarcaVisto();
  chPunto();
}

/* ── cambiar de grupo: nombre con flecha ⌄ y la lista de tus grupos ── */
gSelectorHTML=function(){ return ""; };
socGrupo=function(){
  var n=GRUPO.miembros.length, real=!!(GRUPO.real && gReal());
  var otros=real && MIS_GRUPOS.some(function(g){ return g.id!==GRUPO.id && chSinLeer(g.id)>0; });
  var titulo=real
    ? '<button class="gs-nombre" data-act="x-g-lista" aria-label="Cambiar de grupo"><span>'+esc(GRUPO.nombre)+'</span>'+
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>'+
        (otros ? '<i class="gs-punto"></i>' : '')+'</button>'
    : '<p class="soc-nombre" style="font-size:16px;font-weight:700">'+esc(GRUPO.nombre)+'</p>';
  return '<div class="soc-grupo" data-act="x-grupo">'+
    '<div class="soc-caras">'+GRUPO.miembros.slice(0,5).map(function(m){ return '<span>'+caraDe(m,34)+'</span>'; }).join("")+'</div>'+
    '<div style="min-width:0;flex:1">'+titulo+
      '<p class="soc-sub">'+(GRUPO.desc?esc(GRUPO.desc):(n===1?'1 persona':n+' personas'))+'</p>'+
    '</div>'+
    '<button data-act="x-grupo-compartir" style="font-size:14px;font-weight:700;color:var(--accent);flex:0 0 auto;padding:8px 2px">Invitar</button>'+
    '<svg viewBox="0 0 24 24" style="width:18px;height:18px;color:var(--t3);flex:0 0 auto" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>'+
  '</div>';
};
function chListaHTML(){
  var l=MIS_GRUPOS.length ? MIS_GRUPOS : [{ id:GRUPO.id, nombre:GRUPO.nombre, miembros:GRUPO.miembros.length }];
  var esta=l.some(function(g){ return g.id===GRUPO.id; });
  return '<div class="flex items-start justify-between mb-3"><h3 class="display text-[20px] font-bold">Tus grupos</h3>'+closeBtn()+'</div>'+
    '<div class="gs-lista">'+l.map(function(g){
      var on=esta ? (g.id===GRUPO.id) : !!g.activo, sin=on ? 0 : chSinLeer(g.id);
      return '<button class="gs-fila'+(on?" on":"")+'" data-act="x-g-elige" data-id="'+esc(g.id)+'">'+
        '<span class="gs-letra display">'+esc((g.nombre||"?").charAt(0).toUpperCase())+'</span>'+
        '<span class="gs-t"><b>'+esc(g.nombre)+'</b><small>'+(g.miembros===1?"1 persona":g.miembros+" personas")+'</small></span>'+
        (sin ? '<span class="gs-sin num">'+(sin>=99?"99+":sin)+'</span>' : '')+
        (on ? '<svg class="gs-ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>' : '')+
      '</button>';
    }).join("")+'</div>'+
    (l.length<8
      ? '<div style="display:flex;gap:10px;margin-top:16px"><button class="btn btn-quiet" data-act="x-g-crear" style="flex:1">Crear grupo</button>'+
        '<button class="btn btn-quiet" data-act="x-g-unirse" style="flex:1">Tengo un código</button></div>'
      : '')+
    '<p class="text-[12px] t3 mt-3">Puedes estar hasta en 8 grupos a la vez.</p>';
}
function chLista(){
  openSheet(chListaHTML());
  function repinta(){ var b=document.getElementById("sheet-body"); if(b && !$("#sheet").hidden && b.querySelector(".gs-lista") && chActivo()) b.innerHTML=chListaHTML(); }
  gMisGrupos(true).then(function(){ return chResumen(true); }).then(repinta);
}
/* g_activar y a cargar el grupo nuevo, aunque hubiera otra carga a medias */
function chCambiaA(id){
  closeSheet();
  if(!id || !GRUPO || id===GRUPO.id) return;
  var col=document.getElementById("social-col"); if(col) col.classList.add("gs-cambiando");
  gRpc("g_activar", { p_grupo:id }).then(function(){
    return new Promise(function(res){ var n=0; (function mira(){ if(!gEstado.cargando || n++>40) res(gCargar(true)); else setTimeout(mira, 150); })(); });
  }).then(function(){ return gMisGrupos(true); }).then(function(){
    CH.firma=""; if(view==="social") rSocial(); chRtRevisa(); chCargar(); sonido("tick");
  }).catch(function(e){ avisoNube(gError(e)); })
    .then(function(){ var c=document.getElementById("social-col"); if(c) c.classList.remove("gs-cambiando"); });
}

function chatAccion(a, el){
  if(a==="x-chat-enviar"){ chEnviaCaja(); return true; }
  if(a==="x-chat-foto"){ chFotoElige(); return true; }
  if(a==="x-chat-toca"){ var k=el.dataset.id; CH.abiertoReac=(CH.abiertoReac===k)?null:k; CH.borrar=null; sonido("tick"); chPintaLista();
    var e=document.querySelector("#ch-lista .ch-elige"); if(e && e.scrollIntoView) try{ e.scrollIntoView({ block:"nearest", behavior:"smooth" }); }catch(err){}
    return true; }
  if(a==="x-chat-reac"){ chReacciona(el.dataset.id, el.dataset.e); return true; }
  if(a==="x-chat-borra"){ chBorra(el.dataset.id); return true; }
  if(a==="x-chat-antes"){ var G=chG(), pr=G.msgs.filter(function(m){ return m.id && chPrincipal(m); }); if(pr[0]){ el.disabled=true; el.textContent="Cargando…"; chCargar(pr[0].id); } return true; }
  if(a==="x-chat-reintenta"){ var G2=chG(); G2.msgs.forEach(function(m){ if(m.tmp===el.dataset.tmp && m.estado==="fallo"){ chSube(G2, m); } }); chPintaLista(false, true); return true; }
  if(a==="x-chat-com"){ var ck=el.dataset.id; if(CH.coms[ck]) delete CH.coms[ck]; else CH.coms[ck]=1; sonido("tick"); chPintaLista(false, true);
    if(CH.coms[ck]){ var inp=document.querySelector('#ch-lista .ch-com-in[data-id="'+ck+'"]'); if(inp && inp.scrollIntoView) try{ inp.scrollIntoView({ block:"nearest", behavior:"smooth" }); }catch(err){} }
    return true; }
  if(a==="x-chat-com-envia"){ chComEnvia(el.dataset.id); return true; }
  if(a==="x-g-lista"){ chLista(); return true; }
  if(a==="x-g-elige"){ chCambiaA(el.dataset.id); return true; }
  return false;
}
function chTrasRender(){
  if(!chActivo()){ chRtCierra(); chPunto(); return; }
  chRtRevisa();
  if(view==="social"){ var G=chG(); if(!G.cargado && !G.cargando) chCargar(); }
  chResumen(false);
  chPunto();
}
var _chGA=grupoAccion;
grupoAccion=function(a, el){ if(chatAccion(a, el)) return true; return _chGA.apply(this, arguments); };
var _chGTR=grupoTrasRender;
grupoTrasRender=function(){ var r=_chGTR.apply(this, arguments); chTrasRender(); return r; };
/* el grupo suele llegar del servidor después del primer pintado: al llegar, lo mismo */
var _chGCargar=gCargar;
gCargar=function(){ return _chGCargar.apply(this, arguments).then(function(r){ try{ chTrasRender(); }catch(e){} return r; }); };

var CHAT_CSS=[
/* nombre del grupo con flecha y la lista de grupos */
'.gs-nombre{ display:inline-flex; align-items:center; gap:4px; max-width:100%; font-size:16px; font-weight:700; letter-spacing:-.01em; color:var(--t1); text-align:left; }',
'.gs-nombre span{ min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
'.gs-nombre svg{ width:16px; height:16px; flex:0 0 auto; color:var(--t3); }',
'.gs-punto{ width:7px; height:7px; border-radius:99px; background:var(--accent); flex:0 0 auto; }',
'.gs-lista{ display:flex; flex-direction:column; }',
'.gs-fila{ display:flex; align-items:center; gap:12px; width:100%; padding:10px 2px; text-align:left; }',
'.gs-fila + .gs-fila{ box-shadow:inset 0 1px 0 var(--hairline); }',
'.gs-letra{ width:38px; height:38px; border-radius:999px; flex:0 0 auto; display:grid; place-items:center; font-size:16px; font-weight:800; background:var(--fill); color:var(--t2); }',
'.gs-fila.on .gs-letra{ background:var(--accent-soft); color:var(--accent); }',
'.gs-t{ flex:1; min-width:0; display:flex; flex-direction:column; }',
'.gs-t b{ font-size:15px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
'.gs-t small{ font-size:12px; color:var(--t3); }',
'.gs-sin{ min-width:22px; height:22px; padding:0 6px; border-radius:99px; display:grid; place-items:center; font-size:12px; font-weight:700; background:var(--accent); color:var(--on-accent); }',
'.gs-ok{ width:18px; height:18px; color:var(--accent); flex:0 0 auto; }',
'#social-col.gs-cambiando{ opacity:.45; pointer-events:none; transition:opacity .2s var(--ease); }',
/* punto en la pestaña Social si hay mensajes sin leer */
'#mtabs button[data-view="social"].ch-punto::after{ content:""; position:absolute; top:8px; left:calc(50% + 9px); width:8px; height:8px; border-radius:99px; background:var(--accent); box-shadow:0 0 0 2px var(--bg); }',
'#rail button[data-view="social"].ch-punto::after{ content:""; position:absolute; top:50%; right:12px; margin-top:-4px; width:8px; height:8px; border-radius:99px; background:var(--accent); }',
/* el recuadro del chat */
'.ch-caja{ margin-top:10px; height:min(64vh, 500px); display:flex; flex-direction:column; border-radius:20px; overflow:hidden;',
'  background:var(--glass-bg); box-shadow:inset 0 0 0 1px var(--hairline-2); }',
'.ch-scroll{ flex:1; min-height:0; overflow-y:auto; -webkit-overflow-scrolling:touch; overscroll-behavior:contain; }',
'.ch-lista{ padding:4px 12px 12px; }',
'.ch-antes{ display:block; margin:10px auto 4px; padding:7px 14px; border-radius:99px; font-size:13px; font-weight:600; color:var(--accent); background:var(--fill); }',
'.ch-vacio{ margin:40px auto 0; max-width:30ch; text-align:center; font-size:13.5px; line-height:1.5; color:var(--t3); }',
'.ch-dia{ margin:16px 0 6px; text-align:center; font-size:11.5px; font-weight:700; color:var(--t3); }',
'.ch-m{ display:flex; align-items:flex-start; gap:8px; margin-top:10px; }',
'.ch-m.sigue{ margin-top:3px; }',
'.ch-m.yo{ justify-content:flex-end; }',
'.ch-cara, .ch-hueco{ width:28px; flex:0 0 auto; }',
'.ch-cara{ margin-top:18px; cursor:pointer; }',
'.ch-col{ min-width:0; max-width:80%; display:flex; flex-direction:column; align-items:flex-start; }',
'.ch-m.yo .ch-col{ align-items:flex-end; }',
'.ch-quien{ margin:0 0 3px 12px; font-size:12px; font-weight:600; color:var(--t3); }',
'.ch-burbuja{ display:block; max-width:100%; padding:7px 12px 7px; border-radius:18px; text-align:left; font-size:15px; line-height:1.38; cursor:pointer;',
'  white-space:pre-wrap; overflow-wrap:anywhere; background:var(--fill); color:var(--t1); }',
'.ch-m.yo .ch-burbuja{ background:var(--accent); color:var(--on-accent); }',
'.ch-burbuja.con-foto{ padding:4px; }',
'.ch-burbuja.con-foto .ch-txt{ display:inline; padding:0 8px; }',
'.ch-burbuja.con-foto .ch-txt:first-of-type{ padding-left:8px; }',
'.ch-burbuja.con-foto .ch-hora{ margin-right:6px; }',
'.ch-pie{ display:block; text-align:right; padding:2px 4px 0; }',
'.ch-foto-m{ display:block; width:min(240px, 62vw); max-height:320px; border-radius:14px; overflow:hidden; background:var(--fill-hi); margin-bottom:4px; }',
'.ch-foto-m img{ display:block; width:100%; max-height:320px; object-fit:cover; }',
'.ch-burbuja.enviando{ opacity:.6; }',
'.ch-burbuja.fallo{ opacity:.5; }',
'.ch-hora{ display:inline-block; margin-left:8px; font-size:10.5px; opacity:.55; vertical-align:-1px; white-space:nowrap; }',
'.ch-reac{ display:flex; flex-wrap:wrap; gap:4px; margin-top:4px; }',
'.ch-reac button{ height:24px; padding:0 8px; border-radius:99px; display:inline-flex; align-items:center; gap:4px; font-size:12.5px;',
'  background:var(--bg); color:var(--t2); box-shadow:inset 0 0 0 1px var(--hairline-2); transition:transform .25s var(--spring); }',
'.ch-reac button.mia{ background:var(--accent-soft); color:var(--accent); box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--accent) 35%,transparent); }',
'.ch-reac button:active, .ch-elige button:active{ transform:scale(.9); }',
'.ch-reac .num{ font-size:11.5px; font-weight:700; }',
'.ch-elige{ display:flex; flex-wrap:wrap; align-items:center; gap:2px; margin-top:6px; padding:3px; border-radius:22px; background:var(--bg); box-shadow:inset 0 0 0 1px var(--hairline-2); }',
'.ch-elige button{ width:36px; height:36px; border-radius:99px; font-size:19px; display:grid; place-items:center; transition:transform .25s var(--spring); }',
'.ch-elige button.mia{ background:var(--accent-soft); }',
'.ch-elige .ch-borra{ width:auto; padding:0 12px; font-size:13px; font-weight:600; color:var(--t3); }',
'.ch-elige .ch-borra.seguro{ color:var(--alert); }',
'.ch-fallo{ margin-top:4px; font-size:12px; font-weight:600; color:var(--alert); }',
/* comentarios de una foto */
'.ch-com{ margin-top:4px; width:min(240px, 62vw); }',
'.ch-ev .ch-com{ margin-left:auto; margin-right:auto; }',
'.ch-com-t{ display:inline-flex; align-items:center; gap:3px; padding:4px 2px; font-size:12.5px; font-weight:600; color:var(--t3); }',
'.ch-com-t svg{ width:14px; height:14px; transition:transform .25s var(--ease); }',
'.ch-com.abierto .ch-com-t svg{ transform:rotate(180deg); }',
'.ch-com-lista{ padding:2px 0 4px; text-align:left; }',
'.ch-com-c{ font-size:13.5px; line-height:1.4; padding:3px 0; color:var(--t2); overflow-wrap:anywhere; }',
'.ch-com-c b{ color:var(--t1); font-weight:600; }',
'.ch-com-c.enviando{ opacity:.6; }',
'.ch-com-esc{ display:flex; gap:6px; margin-top:4px; }',
'.ch-com-in{ flex:1; min-width:0; height:34px; padding:0 12px; border-radius:99px; border:0; outline:none; font:inherit; font-size:16px; background:var(--fill); color:var(--t1); box-shadow:inset 0 0 0 1px var(--hairline); }',
'.ch-com-env{ flex:0 0 auto; padding:0 10px; font-size:13px; font-weight:700; color:var(--accent); }',
/* actividad automática dentro del chat */
'.ch-ev{ display:flex; flex-direction:column; align-items:center; margin:14px auto 4px; max-width:90%; text-align:center; }',
'.ch-ev-t{ font-size:12.5px; line-height:1.45; color:var(--t3); }',
'.ch-ev-t b{ font-weight:600; color:var(--t2); }',
'.ch-foto{ display:block; width:150px; aspect-ratio:4/5; margin-top:6px; border-radius:14px; overflow:hidden; background:var(--fill); }',
'.ch-foto img{ width:100%; height:100%; object-fit:cover; display:block; }',
'.ch-ev .ch-reac, .ch-ev .ch-elige{ justify-content:center; }',
/* la caja para escribir */
'.ch-escribe{ flex:0 0 auto; display:flex; align-items:flex-end; gap:6px; padding:8px 8px 8px 6px; box-shadow:0 -1px 0 var(--hairline); background:var(--glass-bg); }',
'#ch-texto{ flex:1; min-width:0; min-height:38px; max-height:120px; resize:none; padding:8px 14px; border-radius:19px; border:0; outline:none;',
'  font:inherit; font-size:16px; line-height:1.35; background:var(--fill); color:var(--t1); box-shadow:inset 0 0 0 1px var(--hairline); }',
'#ch-texto:focus{ box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--accent) 55%,transparent); }',
'.ch-foto-bt{ width:38px; height:38px; flex:0 0 auto; border-radius:99px; display:grid; place-items:center; color:var(--t3); }',
'.ch-foto-bt svg{ width:22px; height:22px; }',
'.ch-enviar{ width:38px; height:38px; flex:0 0 auto; border-radius:99px; display:grid; place-items:center; background:var(--accent); color:var(--on-accent); transition:transform .25s var(--spring); }',
'.ch-enviar:active{ transform:scale(.9); }',
'.ch-enviar svg{ width:19px; height:19px; }'
].join("\n");
(function(){ var st=document.createElement("style"); st.id="chat-css"; st.textContent=CHAT_CSS; document.head.appendChild(st); })();

