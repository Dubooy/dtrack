/* ════════ moderación: denunciar y bloquear ════════
   En el chat, al tocar un mensaje de otra persona salen «Denunciar» y
   «Bloquear». Lo denunciado deja de verse en el acto; con tres denuncias de
   personas distintas el servidor lo esconde para todos. De quien bloqueas no
   ves nada más (mensajes, comentarios ni fotos). La lista de bloqueados está
   en Ajustes. Si el servidor aún no tiene las funciones gm_*, se guarda solo
   en este móvil. */
ICO_B.bloqueo='<circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/>';
var MOD_MOTIVOS=[["acoso","Insultos o acoso"],["sexual","Contenido sexual"],["violencia","Violencia o autolesiones"],
                 ["odio","Odio o discriminación"],["spam","Spam o estafa"],["otro","Otra cosa"]];
function modEstado(){ if(!S.mod || typeof S.mod!=="object") S.mod={}; if(!S.mod.bloq) S.mod.bloq={}; if(!S.mod.ocultos) S.mod.ocultos={}; return S.mod; }
function modBloqueado(uid){ return !!(uid && modEstado().bloq[uid]); }
function modFuera(m){ return !!(m && (modBloqueado(m.uid) || (m.id && modEstado().ocultos["m:"+m.id]))); }
var _chItemsMod=chItems;
chItems=function(){
  return _chItemsMod.apply(this, arguments).filter(function(it){
    if(it.k==="m") return !modFuera(it.m);
    return !(it.e && (modBloqueado(it.e.uid) || (it.e.foto && modEstado().ocultos["f:"+it.e.foto])));
  });
};
var _chComentariosMod=chComentarios;
chComentarios=function(){ return _chComentariosMod.apply(this, arguments).filter(function(m){ return !modFuera(m); }); };
var _chEligeMod=chEligeHTML;
chEligeHTML=function(key, mias, mio){
  var h=_chEligeMod.apply(this, arguments);
  if(mio || String(key).indexOf("m:")!==0) return h;
  var m=chBusca(key); if(!m || !m.uid) return h;
  return h+'<div class="mod-fila"><button data-act="x-mod-denuncia" data-id="'+esc(key)+'">'+tr("Denunciar")+'</button>'+
    '<button data-act="x-mod-bloquea" data-u="'+esc(m.uid)+'">'+tr("Bloquear a")+' '+esc(chNombre(m.uid))+'</button></div>';
};
/* los comentarios de las fotos: un «Denunciar» pequeño en los de los demás */
var _chComHTMLMod=chComHTML;
chComHTML=function(key){
  var h=_chComHTMLMod.apply(this, arguments), yo=chYo();
  chComentarios(key).forEach(function(c){
    if(!c.id || c.uid===yo) return;
    var marca='<b>'+esc(chNombre(c.uid))+'</b> '+esc(c.texto);
    h=h.replace(marca, marca+' <button class="mod-mini" data-act="x-mod-denuncia" data-id="m:'+c.id+'">'+tr("Denunciar")+'</button>');
  });
  return h;
};
/* el visor de fotos: «Denunciar foto» si no es tuya */
var _fgVerMod=fgVer;
fgVer=function(url, txt){
  var r=_fgVerMod.apply(this, arguments), v=document.getElementById("fg-visor"), yo=chYo();
  if(v && url && !(yo && String(url).indexOf(yo)>=0) && !modEstado().ocultos["f:"+url])
    v.insertAdjacentHTML("beforeend", '<button class="mod-foto" data-act="x-mod-foto" data-u="'+esc(url)+'">'+tr("Denunciar foto")+'</button>');
  return r;
};
function modSheetMotivo(tipo, ref, autor){
  openSheet('<div class="flex items-start justify-between mb-4"><div><p class="eyebrow mb-1.5">'+tr("Denunciar")+'</p>'+
    '<h3 class="display text-[20px] font-bold">'+tr("¿Qué pasa con esto?")+'</h3></div>'+closeBtn()+'</div>'+
    '<p class="text-[13.5px] t2 leading-relaxed mb-5">'+tr("Deja de verse ahora mismo. Lo revisamos y, si incumple las normas, se borra. Quien lo escribió no sabe quién lo ha denunciado.")+'</p>'+
    '<div class="space-y-1.5">'+MOD_MOTIVOS.map(function(o){
      return '<button class="soft w-full text-left px-4 py-3.5 text-[13.5px]" data-act="x-mod-motivo" data-m="'+o[0]+'" data-t="'+esc(tipo)+'" data-r="'+esc(ref)+'" data-u="'+esc(autor||"")+'">'+tr(o[1])+'</button>'; }).join("")+'</div>'+
    '<p class="text-[12px] t3 leading-relaxed mt-5">'+tr("Si alguien corre peligro, llama al 112. Si eres tú quien lo está pasando mal, el 024 te atiende gratis a cualquier hora.")+'</p>');
}
function modDenuncia(tipo, ref, motivo, autor){
  var id=(tipo==="mensaje") ? String(ref).replace(/^m:/,"") : ref;
  var M=modEstado(); M.ocultos[(tipo==="foto"?"f:":"m:")+id]=Date.now(); save();
  closeSheet(); fgCierraVisor(); CH.abiertoReac=null; CH.firma=""; chPintaTodo(); if(view==="social") rSocial();
  avisoNube(tr("Gracias. Ya no lo ves y lo revisamos."));
  if(!gReal()) return;
  gRpc("gm_denunciar", { p_tipo:tipo, p_ref:id, p_motivo:motivo, p_nota:"", p_autor:autor||null }).catch(function(){});
}
function modSheetBloquea(uid){
  var nom=chNombre(uid);
  openSheet('<div class="flex items-start justify-between mb-4"><div><p class="eyebrow mb-1.5">'+tr("Bloquear")+'</p>'+
    '<h3 class="display text-[20px] font-bold">'+tr("¿Bloquear a")+' '+esc(nom)+'?</h3></div>'+closeBtn()+'</div>'+
    '<p class="text-[13.5px] t2 leading-relaxed mb-5">'+tr("No verás sus mensajes, comentarios ni fotos. No se le avisa. Puedes desbloquear cuando quieras desde Ajustes.")+'</p>'+
    '<div class="flex gap-2"><button class="btn btn-quiet flex-1" data-act="close-sheet">'+tr("Cancelar")+'</button>'+
    '<button class="btn btn-primary flex-1" data-act="x-mod-bloquea-ok" data-u="'+esc(uid)+'" data-n="'+esc(nom)+'">'+tr("Bloquear")+'</button></div>');
}
function modBloquea(uid, nom){
  var M=modEstado(); M.bloq[uid]={ n:nom||"alguien", t:Date.now() }; save();
  closeSheet(); CH.abiertoReac=null; CH.firma=""; chPintaTodo(); if(view==="social") rSocial();
  avisoNube(tr("Bloqueado. Ya no verás nada suyo."));
  if(gReal()) gRpc("gm_bloquear", { p_uid:uid }).catch(function(){});
}
function modDesbloquea(uid){
  delete modEstado().bloq[uid]; save(); CH.firma="";
  if(gReal()) gRpc("gm_desbloquear", { p_uid:uid }).then(function(){ chCargar(); }).catch(function(){});
  modSheetBloqueados(); chPintaTodo();
}
function modSheetBloqueados(){
  var B=modEstado().bloq, ks=Object.keys(B);
  openSheet('<div class="flex items-start justify-between mb-4"><div><p class="eyebrow mb-1.5">'+tr("Social")+'</p>'+
    '<h3 class="display text-[20px] font-bold">'+tr("Personas bloqueadas")+'</h3></div>'+closeBtn()+'</div>'+
    (ks.length ? '<div class="space-y-1.5">'+ks.map(function(u){
      return '<div class="soft flex items-center justify-between gap-3 px-4 py-3"><span class="text-[14px] font-semibold truncate">'+esc((B[u]&&B[u].n)||"alguien")+'</span>'+
        '<button class="btn btn-quiet !py-2 !px-3 !text-[13px]" data-act="x-mod-desbloquea" data-u="'+esc(u)+'">'+tr("Desbloquear")+'</button></div>'; }).join("")+'</div>'
      : '<p class="text-[13.5px] t2">'+tr("No has bloqueado a nadie.")+'</p>'));
}
/* la lista del servidor manda: si bloqueaste desde otro móvil, aquí también */
function modSincroniza(){
  if(!gReal()) return;
  gRpc("gm_bloqueados", {}).then(function(l){
    if(!Array.isArray(l)) return;
    var B=modEstado().bloq, cambia=false;
    l.forEach(function(u){ u=gTxt(u,40); if(u && !B[u]){ B[u]={ n:chNombre(u), t:Date.now() }; cambia=true; } });
    if(cambia){ save(); CH.firma=""; chPintaTodo(); }
  }).catch(function(){});
}
var _sheetSettingsMod=sheetSettings;
sheetSettings=function(){
  var r=_sheetSettingsMod.apply(this, arguments);
  var tu=document.getElementById("aj-tu"); if(!tu || document.getElementById("aj-bloq")) return r;
  var n=Object.keys(modEstado().bloq).length, b=document.createElement("button");
  b.id="aj-bloq"; b.className="aj-priv"; b.setAttribute("data-act","x-mod-lista");
  b.innerHTML='<span class="aj-m-ico">'+ico("bloqueo")+'</span><span class="aj-priv-t"><b>'+tr("Personas bloqueadas")+'</b><small>'+
    (n ? n+" "+tr(n===1?"persona":"personas") : tr("Nadie"))+'</small></span>';
  tu.appendChild(b);
  return r;
};
var _extrasAccionMod=extrasAccion;
extrasAccion=function(a, el){
  if(a==="x-mod-denuncia"){ var m=chBusca(el.dataset.id); modSheetMotivo("mensaje", el.dataset.id, m&&m.uid); return true; }
  if(a==="x-mod-foto"){ var u=el.dataset.u; fgCierraVisor(); setTimeout(function(){ modSheetMotivo("foto", u, ""); }, 60); return true; }
  if(a==="x-mod-motivo"){ modDenuncia(el.dataset.t, el.dataset.r, el.dataset.m, el.dataset.u); return true; }
  if(a==="x-mod-bloquea"){ modSheetBloquea(el.dataset.u); return true; }
  if(a==="x-mod-bloquea-ok"){ modBloquea(el.dataset.u, el.dataset.n); return true; }
  if(a==="x-mod-desbloquea"){ modDesbloquea(el.dataset.u); return true; }
  if(a==="x-mod-lista"){ closeSheet(); setTimeout(modSheetBloqueados, 60); return true; }
  return _extrasAccionMod.apply(this, arguments);
};
(function(){ var st=document.createElement("style"); st.textContent=[
  '.mod-fila{ display:flex; gap:6px; margin-top:6px; flex-wrap:wrap; }',
  '.mod-fila button{ font-size:12.5px; font-weight:600; padding:6px 11px; border-radius:99px; background:var(--fill); color:var(--t2); box-shadow:inset 0 0 0 1px var(--hairline); }',
  '.mod-fila button:last-child{ color:var(--alert); }',
  '.mod-mini{ font-size:11.5px; color:var(--t3); text-decoration:underline; margin-left:4px; }',
  '#fg-visor .mod-foto{ position:absolute; top:calc(env(safe-area-inset-top) + 14px); right:14px; font-size:13px; font-weight:600; padding:8px 13px; border-radius:99px; background:rgba(0,0,0,.55); color:#fff; }'
].join("\n"); document.head.appendChild(st); })();
setTimeout(modSincroniza, 4000);


/* ════════ secciones de Peak.: Hoy · Objetivos · Cuerpo · Mente · Social ════════
   Las vistas por dentro siguen llamándose resumen, retos, vital, academico y social;
   aquí solo cambian los nombres, el orden de abajo y dónde vive la meditación.
   Mente junta la meditación con el estudio (horario, exámenes y tareas). Si no
   estudias, Mente abre Tareas con la meditación arriba. */
var ICO_MENTE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.5C10 5 7 4.5 3.5 5v13.5c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z"/><path d="M12 6.5V20"/></svg>';
function seccionesPeak(){
  var L=S.labels||(S.labels={});
  if(!L.resumen || L.resumen==="Resumen") L.resumen="Hoy";
  if(!L.vital || L.vital==="Vital") L.vital="Cuerpo";
  if(!L.academico || L.academico==="Organización" || L.academico==="Académico") L.academico="Mente";
  if(!L.retos) L.retos="Objetivos";
  /* el icono de Mente, en la barra lateral y en la de abajo */
  $$('#rail button[data-view="academico"] svg').forEach(function(sv){ sv.outerHTML=ICO_MENTE; });
  menteTab();
  /* abajo, Mente va antes que Social */
  var bar=$("#mtabs"), bm=bar && bar.querySelector('button[data-view="academico"], button[data-view="tareas"]'), bs=bar && bar.querySelector('button[data-view="social"]');
  if(bm && bs && bm.compareDocumentPosition(bs) & Node.DOCUMENT_POSITION_PRECEDING) bar.insertBefore(bm, bs);
  /* los títulos pequeños de encima */
  var ea=$("#v-academico .eyebrow"); if(ea) ea.textContent="Cabeza y estudio";
  ["academico","tareas"].forEach(function(k){
    var v=$("#v-"+k); if(!v || $("#mente-"+k)) return;
    var d=document.createElement("div"); d.id="mente-"+k; d.className="mente-hueco";
    var cab=v.querySelector(":scope > div"); if(cab) cab.parentNode.insertBefore(d, cab.nextSibling);
  });
  save();
}
/* sin estudios, la pestaña sigue siendo Mente (antes pasaba a llamarse Tareas) */
function menteTab(){
  var b=document.querySelector('#mtabs button[data-view="academico"], #mtabs button[data-view="tareas"]');
  if(b) b.innerHTML=ICO_MENTE+'<span data-label="academico">'+esc((S.labels&&S.labels.academico)||"Mente")+'</span>';
}
var _academicoAplicaPeak=academicoAplica;
academicoAplica=function(){
  var r=_academicoAplicaPeak.apply(this, arguments);
  menteTab();
  return r;
};
/* la meditación vive en Mente, en la vista que esté abierta */
function menteHueco(){
  var k=(academicoOff() || view==="tareas") ? "tareas" : "academico";
  return document.getElementById("mente-"+k);
}
var _medPintaPeak=medPintaTarjeta;
medPintaTarjeta=function(){
  var h=menteHueco(), c=document.getElementById("med-card");
  if(h){
    if(!c){ c=document.createElement("div"); c.id="med-card"; c.className="glass rounded-[24px] pad"; }
    if(c.parentNode!==h) h.appendChild(c);
  }
  return _medPintaPeak.apply(this, arguments);
};
var _goPeak=go;
go=function(v){
  /* en la barra lateral Mente siempre está; sin estudios abre Tareas */
  if(v==="academico" && academicoOff()) v="tareas";
  var r=_goPeak.call(this, v);
  if(v==="tareas") $$('#rail button[data-view="academico"]').forEach(function(b){ b.setAttribute("aria-current","true"); });
  if(v==="academico" || v==="tareas"){ try{ medPintaTarjeta(); }catch(e){} }
  return r;
};
(function(){ var st=document.createElement("style"); st.textContent=
  '.mente-hueco:empty{ display:none; } .mente-hueco{ margin-bottom:20px; }'+
  'html.sin-academico body #rail button[data-view="academico"]{ display:flex!important; }'; document.head.appendChild(st); })();


