/* ════════════════════════════════════════════════════════════════
   BARRA DE HÁBITOS SUAVE (sep 2026)
   Antes la barra salía de golpe: al marcar el primero aparecía ya llena
   (pasaba de oculta a visible sin nada que animar), y en los demás
   esperaba al repintado (0,4 s) y la curva hacía casi todo el recorrido
   de una vez. Ahora avanza en el mismo toque, con una curva pareja, y
   la primera vez se despliega en vez de aparecer.
   ════════════════════════════════════════════════════════════════ */
habitosBarra=function(){
  var bar=document.getElementById("ideal-bar"); if(!bar) return;
  var p=bar.parentNode; if(!p) return;
  var pleg=checksOf(today()).length===0;
  p.classList.remove("rb-oculta");
  if(!p.classList.contains("hb-caja")){
    p.classList.add("hb-caja"); p.classList.toggle("hb-plegada", pleg);
    setTimeout(function(){ p.classList.add("hb-lista"); }, 60);
    return;
  }
  if(pleg!==p.classList.contains("hb-plegada")) p.classList.toggle("hb-plegada", pleg);
};
/* al tocar un hábito, la barra se mueve ya (el repintado llega luego con el mismo valor) */
document.addEventListener("click", function(ev){
  var el=ev.target.closest && ev.target.closest('[data-act="check"]'); if(!el) return;
  setTimeout(function(){
    var bar=document.getElementById("ideal-bar"); if(!bar || view!=="resumen") return;
    var t=(typeof curDay==="function") ? curDay() : today(), items=ordenIdeal(idealActivos()), ck=checksOf(t);
    bar.style.width=(items.length ? Math.min(100, ck.length/items.length*100) : 0)+"%";
    habitosBarra();
  }, 0);
});

/* ════════════════════════════════════════════════════════════════
   RECORTE DE LA FOTO DE PERFIL (sep 2026)
   Al elegir foto se abre una pantalla con la foto dentro de un
   cuadrado con cuadrícula: se mueve con el dedo y se hace zoom
   pellizcando (o con la barra de abajo). El círculo enseña cómo se
   verá. Se guarda cuadrada, a 512 px, y se sube como antes.
   ════════════════════════════════════════════════════════════════ */
var RC=null, RC_SALIDA=512;
subirFoto=function(archivo){
  if(!ses) return;
  if(archivo.size > 25*1024*1024){ avisoNube("Esa foto pesa demasiado."); return; }
  var lector=new FileReader();
  lector.onerror=function(){ avisoNube("No he podido leer esa foto."); };
  lector.onload=function(){
    var im=new Image();
    im.onerror=function(){ avisoNube("Ese archivo no es una imagen."); };
    im.onload=function(){ rcAbre(im); };
    im.src=lector.result;
  };
  lector.readAsDataURL(archivo);
};
function rcAbre(im){
  var capa=document.getElementById("rc-capa");
  if(!capa){ capa=document.createElement("div"); capa.id="rc-capa"; document.body.appendChild(capa); }
  capa.innerHTML=
    '<div class="rc-arriba"><button data-act="x-rc-cancela">Cancelar</button><b>Mueve y ajusta</b><button class="rc-ok" data-act="x-rc-ok">Usar</button></div>'+
    '<div class="rc-zona"><div class="rc-marco" id="rc-marco">'+
      '<img id="rc-img" alt="" draggable="false">'+
      '<div class="rc-circulo"></div>'+
      '<div class="rc-rejilla"><i></i><i></i><i></i><i></i></div>'+
    '</div></div>'+
    '<div class="rc-abajo">'+
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M8.5 11h5M16 16l4 4"/></svg>'+
      '<input type="range" id="rc-zoom" min="1" max="4" step="0.01" value="1" aria-label="Zoom">'+
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M8.5 11h5M11 8.5v5M16 16l4 4"/></svg>'+
    '</div>'+
    '<p class="rc-pista">Arrastra para moverla · pellizca para acercar</p>';
  var img=capa.querySelector("#rc-img"); img.src=im.src;
  RC={ im:im, w:im.naturalWidth||im.width, h:im.naturalHeight||im.height, F:0, b:1, z:1, x:0, y:0, dedos:{}, gesto:null };
  rcMide(true);
  var marco=capa.querySelector("#rc-marco");
  marco.addEventListener("pointerdown", rcBaja);
  marco.addEventListener("pointermove", rcMueve);
  ["pointerup","pointercancel","pointerleave"].forEach(function(t){ marco.addEventListener(t, rcSube); });
  marco.addEventListener("wheel", function(ev){ ev.preventDefault(); var r=marco.getBoundingClientRect(); rcZoom(RC.z*Math.exp(-ev.deltaY*0.0015), ev.clientX-r.left, ev.clientY-r.top); }, { passive:false });
  capa.querySelector("#rc-zoom").addEventListener("input", function(ev){ rcZoom(+ev.target.value, RC.F/2, RC.F/2); });
  window.addEventListener("resize", rcMideYa);
  /* en el iPhone, pellizcar no debe ampliar la página entera */
  ["gesturestart","gesturechange"].forEach(function(t){ capa.addEventListener(t, function(ev){ ev.preventDefault(); }); });
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ capa.classList.add("ve"); }); });
}
function rcMideYa(){ rcMide(false); }
/* el cuadrado ocupa lo que quepa; la foto empieza cubriéndolo, centrada */
function rcMide(inicio){
  var marco=document.getElementById("rc-marco"); if(!RC || !marco) return;
  var zona=marco.parentNode, F=Math.floor(Math.min(zona.clientWidth-32, zona.clientHeight-24, 420));
  F=Math.max(160, F);
  var viejo=RC.F, cx=viejo ? (RC.F/2-RC.x)/(RC.b*RC.z) : RC.w/2, cy=viejo ? (RC.F/2-RC.y)/(RC.b*RC.z) : RC.h/2;
  RC.F=F; RC.b=F/Math.min(RC.w, RC.h);
  marco.style.width=F+"px"; marco.style.height=F+"px";
  var img=document.getElementById("rc-img");
  img.style.width=(RC.w*RC.b)+"px"; img.style.height=(RC.h*RC.b)+"px";
  if(inicio) RC.z=1;
  RC.x=F/2-cx*RC.b*RC.z; RC.y=F/2-cy*RC.b*RC.z;
  rcPinta();
}
function rcLimita(){
  var s=RC.b*RC.z, W=RC.w*s, H=RC.h*s;
  RC.x=Math.min(0, Math.max(RC.F-W, RC.x));
  RC.y=Math.min(0, Math.max(RC.F-H, RC.y));
}
function rcPinta(){
  rcLimita();
  var img=document.getElementById("rc-img"); if(img) img.style.transform="translate("+RC.x.toFixed(2)+"px,"+RC.y.toFixed(2)+"px) scale("+RC.z.toFixed(4)+")";
  var r=document.getElementById("rc-zoom"); if(r && Math.abs(+r.value-RC.z)>.005) r.value=RC.z;
}
/* zoom alrededor de un punto del cuadrado: lo que está bajo el dedo se queda bajo el dedo */
function rcZoom(z, px, py){
  if(!RC) return;
  z=Math.min(4, Math.max(1, z));
  var u=(px-RC.x)/RC.z, v=(py-RC.y)/RC.z;
  RC.z=z; RC.x=px-u*z; RC.y=py-v*z;
  rcPinta();
}
function rcPunto(ev){ var r=document.getElementById("rc-marco").getBoundingClientRect(); return { x:ev.clientX-r.left, y:ev.clientY-r.top }; }
function rcGesto(){
  var ids=Object.keys(RC.dedos);
  if(ids.length>=2){
    var a=RC.dedos[ids[0]], b=RC.dedos[ids[1]];
    RC.gesto={ n:2, d:Math.max(1, Math.hypot(a.x-b.x, a.y-b.y)), mx:(a.x+b.x)/2, my:(a.y+b.y)/2, z:RC.z, x:RC.x, y:RC.y };
  } else if(ids.length===1){
    var p=RC.dedos[ids[0]]; RC.gesto={ n:1, px:p.x, py:p.y, x:RC.x, y:RC.y };
  } else RC.gesto=null;
}
function rcBaja(ev){
  if(!RC) return; ev.preventDefault();
  try{ ev.currentTarget.setPointerCapture(ev.pointerId); }catch(e){}
  RC.dedos[ev.pointerId]=rcPunto(ev); rcGesto();
  document.getElementById("rc-marco").classList.add("toca");
}
function rcMueve(ev){
  if(!RC || !RC.dedos[ev.pointerId]) return; ev.preventDefault();
  RC.dedos[ev.pointerId]=rcPunto(ev);
  var g=RC.gesto, ids=Object.keys(RC.dedos); if(!g) return;
  if(g.n===2 && ids.length>=2){
    var a=RC.dedos[ids[0]], b=RC.dedos[ids[1]], d=Math.max(1, Math.hypot(a.x-b.x, a.y-b.y)), mx=(a.x+b.x)/2, my=(a.y+b.y)/2;
    var z=Math.min(4, Math.max(1, g.z*d/g.d)), u=(g.mx-g.x)/g.z, v=(g.my-g.y)/g.z;
    RC.z=z; RC.x=mx-u*z; RC.y=my-v*z;
  } else if(g.n===1){
    var p=RC.dedos[ids[0]]; RC.x=g.x+(p.x-g.px); RC.y=g.y+(p.y-g.py);
  }
  rcPinta();
}
function rcSube(ev){
  if(!RC || !RC.dedos[ev.pointerId]) return;
  delete RC.dedos[ev.pointerId]; rcLimita(); rcGesto();
  if(!Object.keys(RC.dedos).length){ var m=document.getElementById("rc-marco"); if(m) m.classList.remove("toca"); }
}
function rcCierra(){
  window.removeEventListener("resize", rcMideYa);
  var capa=document.getElementById("rc-capa"); RC=null; if(!capa) return;
  capa.classList.remove("ve");
  setTimeout(function(){ if(capa.parentNode && !capa.classList.contains("ve")) capa.parentNode.removeChild(capa); }, 350);
}
/* lo que se ve en el cuadrado, a 512 px */
function rcRecorta(){
  if(!RC) return null;
  var s=RC.b*RC.z, c=document.createElement("canvas"); c.width=RC_SALIDA; c.height=RC_SALIDA;
  var x=c.getContext("2d"); if(!x) return null;
  x.imageSmoothingEnabled=true; x.imageSmoothingQuality="high";
  x.drawImage(RC.im, -RC.x/s, -RC.y/s, RC.F/s, RC.F/s, 0, 0, RC_SALIDA, RC_SALIDA);
  return c;
}
function rcUsar(){
  var c=rcRecorta(); if(!c){ avisoNube("No he podido preparar la foto."); return; }
  var bt=document.querySelector("#rc-capa .rc-ok"); if(bt){ bt.disabled=true; bt.textContent="Subiendo…"; }
  c.toBlob(function(b){
    if(!b){ avisoNube("No he podido preparar la foto."); if(bt){ bt.disabled=false; bt.textContent="Usar"; } return; }
    rcSubeAvatar(b, c.toDataURL("image/jpeg", .8));
  }, "image/jpeg", 0.88);
}
function rcSubeAvatar(blob, previa){
  tokenFresco().then(function(){
    return fetch(NUBE_URL+"/storage/v1/object/avatares/"+ses.uid+"/foto.jpg", {
      method:"POST",
      headers:{ "apikey":NUBE_KEY, "Authorization":"Bearer "+ses.access_token, "Content-Type":"image/jpeg", "x-upsert":"true" },
      body:blob
    });
  }).then(function(r){
    if(!r || !r.ok) throw 0;
    var url=NUBE_URL+"/storage/v1/object/public/avatares/"+ses.uid+"/foto.jpg?v="+Date.now();
    return pedirAuth("/rest/v1/perfiles?id=eq."+ses.uid, { method:"PATCH", body:{ avatar:url } }).then(function(r2){
      if(!r2.ok) throw 0;
      if(!perfil) perfil={};
      perfil.avatar=url;
      rcCierra();
      /* el perfil abierto también cambia al momento */
      $$("#perfil-capa .pf-foto").forEach(function(f){ f.innerHTML='<img src="'+esc(previa||url)+'" alt="">'; });
      if(view==="social") rSocial();
      avisoNube("Foto puesta.");
    });
  }).catch(function(){
    avisoNube("No se ha podido subir la foto.");
    var bt=document.querySelector("#rc-capa .rc-ok"); if(bt){ bt.disabled=false; bt.textContent="Usar"; }
  });
}
function recorteAccion(a){
  if(a==="x-rc-cancela"){ rcCierra(); return true; }
  if(a==="x-rc-ok"){ rcUsar(); return true; }
  return false;
}
var _rcGA=grupoAccion;
grupoAccion=function(a, el){ if(recorteAccion(a, el)) return true; return _rcGA.apply(this, arguments); };

/* ════════════════════════════════════════════════════════════════
   FOTOS DEL PERFIL: DESCRIPCIÓN, LIKES Y REACCIONES (sep 2026)
   En la galería del perfil, cada foto enseña sus likes (❤️). Al tocarla
   se abre en grande con el corazón, las reacciones de siempre y su
   descripción, que solo escribe su dueño (se guarda al dejar de
   escribir). Lo ven quienes comparten algún grupo con el dueño.
   Servidor: g_foto_descr, g_foto_reac y funciones gf_* (servidor/social.sql).
   ════════════════════════════════════════════════════════════════ */
var FP={}, FPV=null, FP_LIKE="❤️";
var ICO_CORAZON='<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.6 3.9 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 3.3 0 5.6 3.1 4.4 6.6-1.7 4.8-9.2 9.4-9.2 9.4z"/></svg>';
function fpDatos(dueno){ if(!FP[dueno]) FP[dueno]={ descr:{}, reac:{}, cargado:0 }; return FP[dueno]; }
function fpCarga(dueno){
  return gRpc("gf_datos", { p_dueno:dueno }).then(function(d){
    var D=fpDatos(dueno); d=d||{};
    D.descr={}; Object.keys(d.descr||{}).forEach(function(k){ D.descr[k.slice(0,10)]=gTxt(d.descr[k], 300); });
    D.reac={}; Object.keys(d.reac||{}).forEach(function(k){ D.reac[k.slice(0,10)]=fpReacLimpia(d.reac[k]); });
    D.cargado=Date.now(); fpMarcas(dueno); fpPintaVisor(); return D;
  }).catch(function(){ return fpDatos(dueno); });
}
function fpReacLimpia(r){ var o={}; if(r && typeof r==="object") Object.keys(r).slice(0,12).forEach(function(e){ if(e.length<=8 && Array.isArray(r[e]) && r[e].length) o[e]=r[e].map(function(x){ return gTxt(x,40); }); }); return o; }
/* cuadrícula por meses, como la de siempre, con los likes de cada foto */
function fpRejilla(lista, dueno){
  var porMes={}, meses=[];
  lista.forEach(function(f){ var m=f.d.slice(0,7); if(!porMes[m]){ porMes[m]=[]; meses.push(m); } porMes[m].push(f); });
  meses.sort().reverse();
  return meses.map(function(m){
    var fs=porMes[m].sort(function(a,b){ return a.d<b.d?1:-1; });
    return '<div class="fg-mes"><p><b>'+esc(cap(fmt(m+"-01",{month:"long", year:"numeric"})))+'</b><span class="num">'+fs.length+'</span></p>'+
      '<div class="fg-rejilla">'+fs.map(function(f){
        return '<button class="fp-b" data-act="x-fp-ver" data-dueno="'+esc(dueno)+'" data-d="'+esc(f.d)+'" data-u="'+esc(f.u)+'"><img src="'+esc(f.u)+'" alt="" loading="lazy"><span class="fp-marca" data-d="'+esc(f.d)+'"></span></button>'; }).join("")+
      '</div></div>';
  }).join("");
}
function fpMarcas(dueno){
  var D=fpDatos(dueno);
  $$('#fg-galeria .fp-b[data-dueno="'+dueno+'"] .fp-marca').forEach(function(s){
    var r=D.reac[s.dataset.d]||{}, n=(r[FP_LIKE]||[]).length;
    s.innerHTML=n ? ICO_CORAZON+'<b class="num">'+n+'</b>' : ''; s.classList.toggle("ve", n>0);
  });
}
var _fpGaleria=fgGaleria;
fgGaleria=function(u){
  if(!(typeof gReal==="function" && gReal())) return _fpGaleria.apply(this, arguments);
  var capa=document.getElementById("perfil-capa"); if(!capa) return;
  var sc=capa.querySelector(".pf-scroll"); if(!sc || sc.querySelector("#fg-galeria")) return;
  var yo=(!u || (GRUPO && u===GRUPO.yo) || (perfil && u===perfil.usuario));
  var box=document.createElement("div"); box.id="fg-galeria";
  box.innerHTML='<div class="soc-sec"><h2 class="display">Fotos haciendo deporte</h2></div><div id="fg-gal-in"></div>';
  var ref=sc.querySelector(".soc-sec")||sc.lastElementChild; sc.insertBefore(box, ref);
  var dentro=box.querySelector("#fg-gal-in");
  if(yo){
    var F=fgFotos(), l=Object.keys(F).filter(function(d){ return gUrl(F[d].u); }).map(function(d){ return { d:d, u:F[d].u }; });
    if(!l.length){ dentro.innerHTML='<p class="soc-nota">Cuando marques ejercicio en Vital, podrás subir una foto haciendo deporte: gym, fútbol, correr, lo que sea. Aquí se guardan todas, por meses.</p>'; return; }
    dentro.innerHTML=fpRejilla(l, ses.uid)+'<p class="soc-nota">Toca una foto para ponerle descripción y ver sus likes.</p>';
    fpMarcas(ses.uid); fpCarga(ses.uid); return;
  }
  var uid=fgUidDe(u);
  if(!uid){ dentro.innerHTML='<p class="soc-nota">'+esc(u)+' aún no ha subido fotos.</p>'; return; }
  dentro.innerHTML='<p class="soc-nota">Cargando…</p>';
  gRpc("g_fotos", { p_uid:uid, p_desde:null, p_hasta:null }).then(function(l){
    l=(Array.isArray(l)?l:[]).map(function(x){ return { d:String(x.d).slice(0,10), u:gUrl(x.u) }; }).filter(function(x){ return x.u; });
    dentro.innerHTML=l.length ? fpRejilla(l, uid) : '<p class="soc-nota">'+esc(u)+' aún no ha subido fotos.</p>';
    if(l.length){ fpMarcas(uid); fpCarga(uid); }
  }).catch(function(){ dentro.innerHTML='<p class="soc-nota">No se han podido cargar las fotos.</p>'; });
};
/* ── la foto en grande ── */
function fpNombreDe(dueno){
  if(dueno===chYo()) return (perfil && perfil.usuario) || "tú";
  var q=chQuien(dueno); return q ? q.usuario : "";
}
function fpAbre(dueno, d, u){
  FPV={ dueno:dueno, d:d, u:u, elige:false };
  var v=document.getElementById("fp-capa");
  if(!v){ v=document.createElement("div"); v.id="fp-capa"; document.body.appendChild(v); }
  v.innerHTML='<div class="fp-arriba"><span class="fp-quien"><b>'+esc(fpNombreDe(dueno))+'</b><small>'+esc(cap(fmt(d,{weekday:"long", day:"numeric", month:"long"})))+'</small></span>'+
      '<button class="fp-x" data-act="x-fp-cierra" aria-label="Cerrar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>'+
    '<div class="fp-img"><img src="'+esc(u)+'" alt=""></div>'+
    '<div class="fp-abajo"><div id="fp-acc"></div><div id="fp-desc"></div></div>';
  fpPintaVisor(true);
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ v.classList.add("ve"); }); });
  if(!fpDatos(dueno).cargado) fpCarga(dueno);
}
function fpPintaVisor(todo){
  if(!FPV) return;
  var acc=document.getElementById("fp-acc"), dsc=document.getElementById("fp-desc"); if(!acc) return;
  var D=fpDatos(FPV.dueno), r=D.reac[FPV.d]||{}, yo=chYo(), mio=FPV.dueno===yo;
  var likes=r[FP_LIKE]||[], megusta=likes.indexOf(yo)>=0;
  var otras=Object.keys(r).filter(function(e){ return e!==FP_LIKE; });
  acc.innerHTML='<div class="fp-acciones">'+
      '<button class="fp-like'+(megusta?" on":"")+'" data-act="x-fp-reac" data-e="'+FP_LIKE+'" aria-label="Me gusta">'+ICO_CORAZON+'<b class="num">'+(likes.length||"")+'</b></button>'+
      otras.map(function(e){ var l=r[e]; return '<button class="fp-r'+(l.indexOf(yo)>=0?" on":"")+'" data-act="x-fp-reac" data-e="'+esc(e)+'">'+esc(e)+(l.length>1?'<b class="num">'+l.length+'</b>':'')+'</button>'; }).join("")+
      '<button class="fp-mas" data-act="x-fp-elige" aria-label="Reaccionar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="12" r="8"/><path d="M8 14.5c.8 1 1.8 1.5 3 1.5s2.2-.5 3-1.5M8.5 10h.01M13.5 10h.01"/><path d="M19 3v4M17 5h4"/></svg></button>'+
    '</div>'+
    (FPV.elige ? '<div class="fp-elige">'+emojisDisponibles().map(function(e){ return '<button class="'+((r[e]||[]).indexOf(yo)>=0?"on":"")+'" data-act="x-fp-reac" data-e="'+esc(e)+'">'+esc(e)+'</button>'; }).join("")+'</div>' : '')+
    (likes.length ? '<p class="fp-quienes">'+esc(fpQuienes(likes))+'</p>' : '');
  /* la descripción: el dueño la escribe; los demás la leen */
  if(todo || !mio){
    var t=D.descr[FPV.d]||"";
    if(mio){
      if(!document.getElementById("fp-descr") || todo){
        dsc.innerHTML='<textarea id="fp-descr" maxlength="300" rows="2" placeholder="Añade una descripción…">'+esc(t)+'</textarea>';
        var ta=document.getElementById("fp-descr");
        ta.addEventListener("input", function(){ ta.style.height="auto"; ta.style.height=Math.min(140, ta.scrollHeight)+"px"; });
        ta.addEventListener("blur", function(){ fpGuardaDescr(ta.value); });
      }
    } else dsc.innerHTML=t ? '<p class="fp-texto">'+esc(t)+'</p>' : '';
  } else {
    var ta2=document.getElementById("fp-descr");
    if(ta2 && document.activeElement!==ta2){ var t2=D.descr[FPV.d]||""; if(ta2.value!==t2) ta2.value=t2; }
  }
}
function fpQuienes(l){
  var n=l.map(function(u){ return u===chYo() ? "tú" : (chQuien(u) ? chQuien(u).usuario : null); }).filter(Boolean);
  var otros=l.length-n.length;
  if(!n.length) return l.length+" "+(l.length===1?"me gusta":"me gusta");
  return "Le gusta a "+n.slice(0,3).join(", ")+(n.length>3 || otros>0 ? " y "+(n.length-Math.min(3,n.length)+otros)+" más" : "");
}
function fpGuardaDescr(v){
  if(!FPV || FPV.dueno!==chYo()) return;
  var D=fpDatos(FPV.dueno), d=FPV.d; v=String(v||"").replace(/^\s+|\s+$/g, "").slice(0,300);
  if((D.descr[d]||"")===v) return;
  var antes=D.descr[d]; if(v) D.descr[d]=v; else delete D.descr[d];
  gRpc("gf_descr", { p_dia:d, p_texto:v }).then(function(){ avisoNube(v ? "Descripción guardada." : "Descripción quitada."); })
    .catch(function(e){ if(antes) D.descr[d]=antes; else delete D.descr[d]; avisoNube(e && e.message==="sin_servidor" ? "Falta activar las fotos en el servidor." : gError(e)); });
}
function fpReacciona(e){
  if(!FPV) return;
  var F=FPV, D=fpDatos(F.dueno), r=D.reac[F.d]=D.reac[F.d]||{}, yo=chYo(), l=r[e]=r[e]||[], i=l.indexOf(yo);
  if(i>=0){ l.splice(i,1); if(!l.length) delete r[e]; sonido("des"); } else { l.push(yo); sonido("pop"); }
  F.elige=false; fpPintaVisor(); fpMarcas(F.dueno);
  gRpc("gf_reaccion", { p_dueno:F.dueno, p_dia:F.d, p_emoji:e }).then(function(n){ D.reac[F.d]=fpReacLimpia(n); fpPintaVisor(); fpMarcas(F.dueno); })
    .catch(function(err){ avisoNube(err && err.message==="sin_servidor" ? "Falta activar las fotos en el servidor." : gError(err)); fpCarga(F.dueno); });
}
function fpCierra(){
  var ta=document.getElementById("fp-descr"); if(ta) fpGuardaDescr(ta.value);
  var v=document.getElementById("fp-capa"); FPV=null; if(!v) return;
  v.classList.remove("ve"); setTimeout(function(){ if(v.parentNode && !v.classList.contains("ve")) v.parentNode.removeChild(v); }, 300);
}
function fotosPerfilAccion(a, el){
  if(a==="x-fp-ver"){ fpAbre(el.dataset.dueno, el.dataset.d, el.dataset.u); return true; }
  if(a==="x-fp-cierra"){ fpCierra(); return true; }
  if(a==="x-fp-reac"){ fpReacciona(el.dataset.e); return true; }
  if(a==="x-fp-elige"){ if(FPV){ FPV.elige=!FPV.elige; sonido("tick"); fpPintaVisor(); } return true; }
  return false;
}
var _fpGA=grupoAccion;
grupoAccion=function(a, el){ if(fotosPerfilAccion(a, el)) return true; return _fpGA.apply(this, arguments); };

var MEJORAS_CSS=[
/* fotos del perfil */
'.fp-b{ position:relative; }',
'.fp-marca{ position:absolute; left:6px; bottom:6px; display:none; align-items:center; gap:3px; padding:2px 7px 2px 5px; border-radius:99px; font-size:11.5px; color:#fff; background:rgba(0,0,0,.45); }',
'.fp-marca.ve{ display:inline-flex; } .fp-marca svg{ width:13px; height:13px; fill:currentColor; }',
'#fp-capa{ position:fixed; inset:0; z-index:140; background:#0c0c0e; color:#fff; display:flex; flex-direction:column; opacity:0; transition:opacity .25s ease; }',
'#fp-capa.ve{ opacity:1; }',
'.fp-arriba{ display:flex; align-items:center; gap:10px; padding:calc(env(safe-area-inset-top) + 10px) 12px 8px 18px; }',
'.fp-quien{ flex:1; min-width:0; display:flex; flex-direction:column; } .fp-quien b{ font-size:15px; } .fp-quien small{ font-size:12px; color:rgba(255,255,255,.55); }',
'.fp-x{ width:40px; height:40px; border-radius:99px; display:grid; place-items:center; background:rgba(255,255,255,.1); } .fp-x svg{ width:20px; height:20px; }',
'.fp-img{ flex:1; min-height:0; display:grid; place-items:center; padding:0 8px; } .fp-img img{ max-width:100%; max-height:100%; object-fit:contain; border-radius:10px; }',
'.fp-abajo{ padding:12px 16px calc(env(safe-area-inset-bottom) + 14px); max-width:640px; width:100%; margin:0 auto; }',
'.fp-acciones{ display:flex; align-items:center; flex-wrap:wrap; gap:6px; }',
'.fp-acciones button{ height:36px; padding:0 12px; border-radius:99px; display:inline-flex; align-items:center; gap:5px; font-size:15px; background:rgba(255,255,255,.1); transition:transform .25s var(--spring); }',
'.fp-acciones button:active, .fp-elige button:active{ transform:scale(.9); }',
'.fp-acciones .num{ font-size:13px; font-weight:700; }',
'.fp-like svg{ width:20px; height:20px; fill:none; } .fp-like.on{ color:#ff4d6d; } .fp-like.on svg{ fill:currentColor; }',
'.fp-r.on{ background:rgba(255,255,255,.22); box-shadow:inset 0 0 0 1px rgba(255,255,255,.35); }',
'.fp-mas{ width:36px; padding:0!important; justify-content:center; color:rgba(255,255,255,.7); } .fp-mas svg{ width:19px; height:19px; }',
'.fp-elige{ display:flex; flex-wrap:wrap; gap:2px; margin-top:8px; padding:3px; border-radius:22px; background:rgba(255,255,255,.08); width:max-content; max-width:100%; }',
'.fp-elige button{ width:38px; height:38px; border-radius:99px; font-size:20px; display:grid; place-items:center; } .fp-elige button.on{ background:rgba(255,255,255,.18); }',
'.fp-quienes{ margin-top:8px; font-size:12.5px; color:rgba(255,255,255,.6); }',
'.fp-texto{ margin-top:10px; font-size:14.5px; line-height:1.45; white-space:pre-wrap; overflow-wrap:anywhere; }',
'#fp-descr{ width:100%; margin-top:10px; padding:10px 12px; border-radius:14px; border:0; outline:none; resize:none; font:inherit; font-size:16px; line-height:1.4;',
'  background:rgba(255,255,255,.08); color:#fff; box-shadow:inset 0 0 0 1px rgba(255,255,255,.12); }',
'#fp-descr::placeholder{ color:rgba(255,255,255,.45); }',
/* sonidos de fondo de la meditación */
'#med-card .med-fondos{ display:flex; flex-wrap:wrap; gap:6px; }',
'#med-card .med-fondos button{ padding:8px 12px; border-radius:99px; font-size:13px; font-weight:600; background:var(--fill); color:var(--t2); box-shadow:inset 0 0 0 1px var(--hairline); }',
'#med-card .med-fondos button.on{ background:var(--accent-soft); color:var(--accent); box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--accent) 30%,transparent); }',
'#med-capa .med-arriba .med-fondo-bt{ width:auto!important; padding:0 14px; font-size:12.5px; font-weight:700; color:var(--t2)!important; }',
/* barra de hábitos */
'#ideal-bar{ transition:width 1s cubic-bezier(.4,0,.2,1)!important; }',
'.hb-caja.hb-lista{ transition:height .5s cubic-bezier(.4,0,.2,1), margin-bottom .5s cubic-bezier(.4,0,.2,1), opacity .4s ease; }',
'.hb-caja.hb-plegada{ height:0!important; margin-bottom:0!important; opacity:0; }',
/* recorte de la foto */
'#rc-capa{ position:fixed; inset:0; z-index:150; background:#0c0c0e; color:#fff; display:flex; flex-direction:column;',
'  opacity:0; transition:opacity .3s ease; }',
'#rc-capa.ve{ opacity:1; }',
'.rc-arriba{ display:flex; align-items:center; justify-content:space-between; gap:10px; padding:calc(env(safe-area-inset-top) + 10px) 16px 10px; }',
'.rc-arriba b{ font-size:16px; font-weight:700; }',
'.rc-arriba button{ min-width:72px; font-size:15px; font-weight:600; color:rgba(255,255,255,.8); text-align:left; padding:8px 0; }',
'.rc-arriba .rc-ok{ text-align:center; padding:8px 16px; border-radius:99px; background:var(--accent); color:var(--on-accent); }',
'.rc-arriba .rc-ok:disabled{ opacity:.6; }',
'.rc-zona{ flex:1; min-height:0; display:grid; place-items:center; }',
'.rc-marco{ position:relative; overflow:hidden; touch-action:none; cursor:grab; background:#000; border-radius:4px; }',
'.rc-marco.toca{ cursor:grabbing; }',
'#rc-img{ position:absolute; left:0; top:0; max-width:none; transform-origin:0 0; will-change:transform; user-select:none; -webkit-user-select:none; pointer-events:none; }',
'.rc-circulo{ position:absolute; inset:0; border-radius:50%; box-shadow:0 0 0 999px rgba(0,0,0,.5); pointer-events:none; outline:1px solid rgba(255,255,255,.55); outline-offset:-1px; }',
'.rc-rejilla{ position:absolute; inset:0; pointer-events:none; box-shadow:inset 0 0 0 1px rgba(255,255,255,.6); opacity:.55; transition:opacity .2s ease; }',
'.rc-marco.toca .rc-rejilla{ opacity:1; }',
'.rc-rejilla i{ position:absolute; background:rgba(255,255,255,.45); }',
'.rc-rejilla i:nth-child(1){ left:33.333%; top:0; bottom:0; width:1px; } .rc-rejilla i:nth-child(2){ left:66.666%; top:0; bottom:0; width:1px; }',
'.rc-rejilla i:nth-child(3){ top:33.333%; left:0; right:0; height:1px; } .rc-rejilla i:nth-child(4){ top:66.666%; left:0; right:0; height:1px; }',
'.rc-abajo{ display:flex; align-items:center; gap:12px; max-width:420px; width:100%; margin:0 auto; padding:14px 24px 6px; color:rgba(255,255,255,.7); }',
'.rc-abajo svg{ width:20px; height:20px; flex:0 0 auto; }',
'#rc-zoom{ flex:1; accent-color:var(--accent); }',
'.rc-pista{ text-align:center; font-size:12.5px; color:rgba(255,255,255,.5); padding:4px 16px calc(env(safe-area-inset-bottom) + 16px); }'
].join("\n");
(function(){ var st=document.createElement("style"); st.id="mejoras-css"; st.textContent=MEJORAS_CSS; document.head.appendChild(st); })();

