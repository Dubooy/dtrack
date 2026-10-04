/* ════════════════════════════════════════════════════════════════
   FOTOS DE PERFIL EN GRANDE (oct 2026)
   Mantén pulsada cualquier foto de perfil (la tuya, la de tus amigos
   o la del grupo): mientras aprietas se hunde un poco, como un botón
   de verdad, y al rato se abre en grande a pantalla completa saliendo
   desde donde estaba. Se cierra tocando en cualquier sitio.
   Para cambiar tu foto o la del grupo está el lápiz de abajo a la derecha.
   ════════════════════════════════════════════════════════════════ */
(function(){
  var SEL=".av-lp, .soc-yo-foto, .pf-foto, .gr-foto";
  var el=null, t=null, x0=0, y0=0, tragar=0;
  function nombreDe(a){
    var c=a.closest(".soc-yo"); if(c){ var h=c.querySelector("h2"); if(h) return h.textContent; }
    c=a.closest(".pf-cabeza"); if(c){ var n=c.querySelector("#pf-nombre"); if(n) return n.value; var h1=c.querySelector("h1"); if(h1) return h1.textContent; }
    if(a.classList.contains("gr-foto") || a.classList.contains("gr-foto-s")) return GRUPO ? GRUPO.nombre : "";
    var f=a.closest("[data-u]"); if(f) return f.dataset.u;
    return "";
  }
  function suelta(){ clearTimeout(t); t=null; if(el) el.classList.remove("av-pulsa"); el=null; }
  document.addEventListener("pointerdown", function(ev){
    if(ev.button) return;
    var a=ev.target.closest && ev.target.closest(SEL);
    if(!a || ev.target.closest(".av-lapiz") || document.getElementById("av-ver")) return;
    if(a.classList.contains("gr-foto") && a.classList.contains("sin")) a=ev.target.closest(".av-lp");
    if(!a) return;
    el=a; x0=ev.clientX; y0=ev.clientY;
    a.classList.add("av-pulsa");
    clearTimeout(t); t=setTimeout(function(){ var b=el; suelta(); if(b && document.body.contains(b)) abrir(b); }, 430);
  }, {passive:true});
  document.addEventListener("pointermove", function(ev){ if(el && Math.abs(ev.clientX-x0)+Math.abs(ev.clientY-y0)>10) suelta(); }, {passive:true});
  document.addEventListener("pointerup", suelta);
  document.addEventListener("pointercancel", suelta);
  window.addEventListener("scroll", suelta, {passive:true, capture:true});
  /* tras abrirla, el «click» de soltar el dedo no debe abrir el perfil */
  document.addEventListener("click", function(ev){ if(Date.now()<tragar){ tragar=0; ev.stopPropagation(); ev.preventDefault(); } }, true);
  document.addEventListener("contextmenu", function(ev){ if(ev.target.closest && ev.target.closest(SEL)) ev.preventDefault(); });

  function abrir(a){
    tragar=Date.now()+700;
    try{ if(navigator.vibrate) navigator.vibrate(8); }catch(e){}
    var r=a.getBoundingClientRect(), img=a.querySelector("img");
    var lado=Math.min(window.innerWidth-40, window.innerHeight-200, 460);
    var capa=document.createElement("div"); capa.id="av-ver"; capa.setAttribute("role","dialog"); capa.setAttribute("aria-label","Foto de perfil");
    var g=document.createElement("div"); g.className="av-grande"; g.style.width=lado+"px"; g.style.height=lado+"px";
    if(img){ var im=document.createElement("img"); im.src=img.currentSrc||img.src; im.alt=""; g.appendChild(im); }
    else { var l=document.createElement("span"); l.className="av-letra display"; l.textContent=(a.textContent||"?").trim().charAt(0).toUpperCase()||"?"; l.style.fontSize=Math.round(lado*.42)+"px"; g.appendChild(l); }
    var n=document.createElement("p"); n.className="av-nombre display"; n.textContent=nombreDe(a);
    capa.appendChild(g); if(n.textContent) capa.appendChild(n);
    document.body.appendChild(capa);
    /* sale desde la foto pequeña (FLIP): mismo sitio y tamaño, y de ahí crece */
    var gr=g.getBoundingClientRect(), s=r.width/lado;
    var dx=(r.left+r.width/2)-(gr.left+gr.width/2), dy=(r.top+r.height/2)-(gr.top+gr.height/2);
    g.style.transform="translate3d("+dx+"px,"+dy+"px,0) scale("+s+")";
    g.style.borderRadius="999px";
    a.style.visibility="hidden";
    void g.offsetWidth;
    requestAnimationFrame(function(){
      capa.classList.add("ve");
      g.style.transition="transform .55s cubic-bezier(.2,1.12,.3,1), border-radius .45s ease";
      g.style.transform="translate3d(0,0,0) scale(1)";
      g.style.borderRadius="32px";
    });
    function cerrar(){
      capa.removeEventListener("click", cerrar); document.removeEventListener("keydown", tecla);
      var r2=document.body.contains(a) ? a.getBoundingClientRect() : r, gr2=g.getBoundingClientRect();
      var s2=r2.width/lado, dx2=(r2.left+r2.width/2)-(gr2.left+gr2.width/2), dy2=(r2.top+r2.height/2)-(gr2.top+gr2.height/2);
      capa.classList.remove("ve");
      g.style.transition="transform .42s cubic-bezier(.3,.9,.3,1), border-radius .35s ease";
      g.style.transform="translate3d("+dx2+"px,"+dy2+"px,0) scale("+s2+")";
      g.style.borderRadius="999px";
      setTimeout(function(){ a.style.visibility=""; if(capa.parentNode) capa.parentNode.removeChild(capa); }, 430);
    }
    function tecla(e){ if(e.key==="Escape") cerrar(); }
    /* se cierra con un toque después de soltar */
    setTimeout(function(){ capa.addEventListener("click", cerrar); }, 50);
    document.addEventListener("keydown", tecla);
  }
})();

/* ════════════════════════════════════════════════════════════════
   FOTO DEL GRUPO (oct 2026)
   Cada grupo puede tener su foto; la cambia cualquiera del grupo con
   el lápiz, en la ficha del grupo. Se recorta igual que la tuya y se
   sube a tu carpeta de «avatares»; la dirección se guarda en la tabla
   g_grupo_foto con gg_foto_pon y se leen todas con gg_fotos
   (servidor/social.sql). Sin foto se ven las caras, como antes.
   ════════════════════════════════════════════════════════════════ */
var FOTO_DESTINO="yo", GF_KEY="peak-grupo-fotos", GF_LEIDO=0;
var GFOTOS=(function(){ try{ return JSON.parse(localStorage.getItem(GF_KEY)||"{}")||{}; }catch(e){ return {}; } })();
function gfGuarda(){ try{ localStorage.setItem(GF_KEY, JSON.stringify(GFOTOS)); }catch(e){} }
function grupoFoto(){ return (GRUPO && GRUPO.id && GFOTOS[GRUPO.id]) || ""; }
function gfLee(){
  if(!GRUPO || !GRUPO.real || !(typeof gReal==="function" && gReal()) || esPrueba()) return;
  if(Date.now()-GF_LEIDO < 120000) return; GF_LEIDO=Date.now();
  pedirAuth("/rest/v1/rpc/gg_fotos", { method:"POST", body:{} }).then(function(r){
    if(!r.ok || !r.datos || typeof r.datos!=="object") return;
    var antes=JSON.stringify(GFOTOS), nuevo={};
    (Array.isArray(r.datos)?r.datos:[]).forEach(function(x){ if(x && x.grupo && x.url) nuevo[x.grupo]=x.url; });
    GFOTOS=nuevo;
    if(JSON.stringify(GFOTOS)!==antes){ gfGuarda(); gfRepinta(); }
  }).catch(function(){});
}
function gfRepinta(){
  if(view==="social" && typeof rSocial==="function") rSocial();
  if(document.getElementById("grupo-capa") && document.querySelector("#grupo-capa .gr-cabeza")) gfPonEnFicha();
}
var LAPIZ_SVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>';
/* en la ficha del grupo: la foto grande (o las caras) con el lápiz */
function gfPonEnFicha(){
  var cab=document.querySelector("#grupo-capa .gr-cabeza"); if(!cab || !GRUPO) return;
  var viejo=cab.querySelector(".gr-foto"); if(viejo) viejo.parentNode.removeChild(viejo);
  var caras=cab.querySelector(".gr-caras");
  var f=grupoFoto(), d=document.createElement("div");
  d.className="gr-foto"+(f?"":" sin");
  d.innerHTML=(f ? '<img src="'+esc(f)+'" alt="">' : '<div class="gr-foto-caras">'+(caras?caras.innerHTML:"")+'</div>')+
    '<button class="av-lapiz" data-act="x-gr-foto" aria-label="Cambiar la foto del grupo">'+LAPIZ_SVG+'</button>';
  if(caras){ caras.style.display="none"; caras.parentNode.insertBefore(d, caras); } else cab.insertBefore(d, cab.firstChild);
}
var _abrirGrupoGf=abrirGrupo;
abrirGrupo=function(){ var r=_abrirGrupoGf.apply(this, arguments); gfPonEnFicha(); gfLee(); return r; };
/* en Social: si el grupo tiene foto, sale la foto en vez de las caras */
var _socGrupoGf=socGrupo;
socGrupo=function(){
  var h=_socGrupoGf.apply(this, arguments), f=grupoFoto();
  setTimeout(gfLee, 0);
  if(!f) return h;
  return h.replace(/<div class="soc-caras">[\s\S]*?<\/div>(?=<div style="min-width:0;flex:1">)/,
    '<div class="soc-caras"><span class="gr-foto-s av-lp"><img src="'+esc(f)+'" alt=""></span></div>');
};
var _grupoAccionGf=grupoAccion;
grupoAccion=function(a, el){
  if(a==="x-gr-foto"){ FOTO_DESTINO="grupo"; elegirFoto(); return true; }
  return _grupoAccionGf.apply(this, arguments);
};
document.addEventListener("click", function(ev){ if(ev.target.closest && ev.target.closest('[data-act="nube-foto"]')) FOTO_DESTINO="yo"; }, true);
var _rcSubeAvatarGf=rcSubeAvatar;
rcSubeAvatar=function(blob, previa){
  if(FOTO_DESTINO!=="grupo") return _rcSubeAvatarGf.apply(this, arguments);
  FOTO_DESTINO="yo";
  var gid=GRUPO && GRUPO.id, url="";
  if(!gid){ avisoNube("No hay grupo abierto."); return; }
  var listo=function(u){
    GFOTOS[gid]=u; gfGuarda(); rcCierra(); gfRepinta(); avisoNube("Foto del grupo puesta.");
  };
  var falla=function(m){
    avisoNube(m||"No se ha podido subir la foto del grupo.");
    var bt=document.querySelector("#rc-capa .rc-ok"); if(bt){ bt.disabled=false; bt.textContent="Usar"; }
  };
  tokenFresco().then(function(){
    return fetch(NUBE_URL+"/storage/v1/object/avatares/"+ses.uid+"/grupo-"+gid+".jpg", {
      method:"POST",
      headers:{ "apikey":NUBE_KEY, "Authorization":"Bearer "+ses.access_token, "Content-Type":"image/jpeg", "x-upsert":"true" },
      body:blob
    });
  }).then(function(r){
    if(!r || !r.ok) throw new Error("subida");
    url=NUBE_URL+"/storage/v1/object/public/avatares/"+ses.uid+"/grupo-"+gid+".jpg?v="+Date.now();
    return pedirAuth("/rest/v1/rpc/gg_foto_pon", { method:"POST", body:{ p_grupo:String(gid), p_url:url } });
  }).then(function(r2){
    if(r2.estado===404 || (r2.datos && r2.datos.code==="PGRST202")) return falla("Falta actualizar el servidor para las fotos de grupo.");
    if(!r2.ok) return falla();
    listo(url);
  }).catch(function(){ falla(); });
};


