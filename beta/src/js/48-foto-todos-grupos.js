/* ════════════════════════════════════════════════════════════════
   FOTO DEL GYM EN TODOS TUS GRUPOS (oct 2026)
   Al marcar ejercicio y subir la foto, si estás en más de un grupo se
   elige dónde sale: en el grupo abierto o en todos. Se recuerda en este
   móvil (localStorage «peak-fg-destino»).
   El servidor publica en el grupo activo (g_evento_foto), así que para
   los demás se activa cada grupo un momento, se publica y al final se
   vuelve al que tenías abierto.
   ════════════════════════════════════════════════════════════════ */
var FG_DEST_KEY="peak-fg-destino";
function fgDestino(){ try{ return localStorage.getItem(FG_DEST_KEY)==="todos" ? "todos" : "actual"; }catch(e){ return "actual"; } }
function fgVariosGrupos(){ return !!(typeof gReal==="function" && gReal() && GRUPO && GRUPO.real && MIS_GRUPOS.length>1); }
function fgDestinoHTML(){
  var t=fgDestino(), n=MIS_GRUPOS.length;
  return '<p class="fg-dest-t">'+tr("Publicar en")+'</p><div class="fg-dest">'+
    '<button data-act="x-fg-destino" data-k="actual" class="'+(t==="actual"?"on":"")+'"><b>'+esc(GRUPO.nombre||tr("Este grupo"))+'</b><small>'+tr("El grupo abierto")+'</small></button>'+
    '<button data-act="x-fg-destino" data-k="todos" class="'+(t==="todos"?"on":"")+'"><b>'+tr("Todos mis grupos")+'</b><small>'+n+' '+tr("grupos")+'</small></button></div>';
}
var _fgOfreceTodos=fgOfrece;
fgOfrece=function(d){
  var r=_fgOfreceTodos.apply(this, arguments);
  var b=document.querySelector('#sheet-body [data-act="x-fg-subir"]');
  if(b && fgVariosGrupos() && !document.querySelector("#sheet-body .fg-dest")){
    var w=document.createElement("div"); w.className="fg-dest-caja"; w.innerHTML=fgDestinoHTML();
    b.parentNode.insertBefore(w, b.nextSibling);
  }
  /* por si la lista de grupos aún no había llegado */
  if(b && !MIS_GRUPOS.length && typeof gMisGrupos==="function" && typeof gReal==="function" && gReal())
    gMisGrupos(true).then(function(){ var bb=document.querySelector('#sheet-body [data-act="x-fg-subir"]');
      if(bb && fgVariosGrupos() && !document.querySelector("#sheet-body .fg-dest")){ var w2=document.createElement("div"); w2.className="fg-dest-caja"; w2.innerHTML=fgDestinoHTML(); bb.parentNode.insertBefore(w2, bb.nextSibling); } });
  return r;
};
fgPublica=function(d, url, real){
  if(typeof gPubCfg!=="function" || !GRUPO) return;
  var P=gPubCfg(); if(!P.hechos) P.hechos={};
  var yo=(real && ses) ? ses.uid.slice(0,8) : "yo", clave="fg:"+yo+":"+d, texto="ha subido una foto entrenando 📸";
  if(P.hechos[clave]) return; P.hechos[clave]=today(); save();
  if(!GRUPO.real){ GRUPO.muro.unshift({ id:"l"+Date.now(), usuario:GRUPO.yo, texto:texto, cuando:tr("ahora"), reac:{}, foto:url }); return; }
  var actual=GRUPO.id, otros=(fgDestino()==="todos" && fgVariosGrupos()) ? MIS_GRUPOS.map(function(g){ return g.id; }).filter(function(g){ return g && g!==actual; }) : [];
  gRpc("g_evento_foto", { p_clave:clave, p_texto:texto, p_foto:url }).catch(function(){ delete P.hechos[clave]; save(); })
    .then(function(){
      if(!otros.length) return;
      /* uno detrás de otro: activar, publicar; y al final, de vuelta al tuyo */
      var cadena=Promise.resolve(), bien=0;
      otros.forEach(function(g){
        cadena=cadena.then(function(){ return gRpc("g_activar", { p_grupo:g }); })
          .then(function(){ return gRpc("g_evento_foto", { p_clave:clave+":"+g.slice(0,8), p_texto:texto, p_foto:url }); })
          .then(function(){ bien++; }, function(){});
      });
      return cadena.then(function(){ return gRpc("g_activar", { p_grupo:actual }).catch(function(){}); })
        .then(function(){ avisoNube(tr("Foto publicada en")+" "+(bien+1)+" "+tr("grupos")+"."); });
    })
    .then(function(){ gCargar(true); });
};
var _fgTodosGA=grupoAccion;
grupoAccion=function(a, el){
  if(a==="x-fg-destino"){
    try{ localStorage.setItem(FG_DEST_KEY, el.dataset.k); }catch(e){}
    document.querySelectorAll("#sheet-body .fg-dest button").forEach(function(b){ b.classList.toggle("on", b===el); });
    sonido("tick"); return true;
  }
  return _fgTodosGA.apply(this, arguments);
};
(function(){ var st=document.createElement("style"); st.id="fg-todos-css"; st.textContent=[
'.fg-dest-t{ font-size:11.5px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--t3); margin:14px 2px 7px; }',
'.fg-dest{ display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:4px; }',
'.fg-dest button{ display:flex; flex-direction:column; align-items:flex-start; gap:1px; padding:11px 12px; border-radius:14px; text-align:left; background:var(--fill); box-shadow:inset 0 0 0 1px var(--hairline-2); transition:all .25s var(--ease); }',
'.fg-dest button b{ font-size:14px; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; } .fg-dest button small{ font-size:11.5px; color:var(--t3); }',
'.fg-dest button.on{ background:var(--accent-soft); box-shadow:inset 0 0 0 1.5px var(--accent); } .fg-dest button.on b{ color:var(--accent); }'
].join("\n"); document.head.appendChild(st); })();
