/* ════════════════════════════════════════════════════════════════
   GRUPO DE VERDAD: con cuenta, Social habla con el servidor (Supabase,
   funciones g_*). Se traduce al mismo GRUPO de siempre, así que la
   pantalla no cambia: racha, reto del grupo, actividad, reacciones,
   clasificación y perfiles salen de tus amigos reales.
   En modo prueba sigue el grupo de mentira, pero tu propia actividad
   también se publica (solo en esta pantalla).
   ════════════════════════════════════════════════════════════════ */
var gEstado={ cargado:0, cargando:false, error:null, sinServidor:false, ultimoSync:"" };
function gReal(){ return !!(typeof ses!=="undefined" && ses && !ses.demo && ses.uid && ses.access_token); }
function gRpc(fn, args){
  return pedirAuth("/rest/v1/rpc/"+fn, { method:"POST", body:args||{} }).then(function(r){
    if(r.estado===404 || (r.datos && r.datos.code==="PGRST202")){ gEstado.sinServidor=true; gEstado.detalle=fn+": "+((r.datos && (r.datos.hint||r.datos.message))||("error "+r.estado)); throw new Error("sin_servidor"); }
    if(!r.ok){ var m=(r.datos && (r.datos.message||r.datos.hint)) || ("error "+r.estado); throw new Error(m); }
    gEstado.sinServidor=false;
    return r.datos;
  });
}
var G_ERR={ ya_en_grupo:"Ya estás en ese grupo.", codigo_mal:"Ese código no existe. Revísalo.",
            lleno:"Ese grupo ya tiene 12 personas.", sin_sesion:"Hace falta entrar con tu cuenta.", sin_servidor:"El servidor de grupos aún no está configurado.",
            demasiados_grupos:"Como mucho, 8 grupos a la vez.", no_eres_miembro:"Ya no estás en ese grupo." };
function gError(e){ var m=(e&&e.message)||""; for(var k in G_ERR) if(m.indexOf(k)>=0) return G_ERR[k]; return navigator.onLine===false ? "Sin conexión. Prueba en un rato." : "No se ha podido. Prueba en un rato."+(window.DTRACK_BETA && m ? " ("+m.slice(0,160)+")" : ""); }

/* ── bajar el grupo y traducirlo al GRUPO de siempre ── */
function gCargar(forzar){
  if(!gReal() || gEstado.cargando) return Promise.resolve(null);
  if(!forzar && Date.now()-gEstado.cargado<40000) return Promise.resolve(GRUPO);
  gEstado.cargando=true;
  return gRpc("g_estado", { p_desde:addDays(today(),-60) }).then(function(e){
    gEstado.cargando=false; gEstado.cargado=Date.now(); gEstado.error=null;
    GRUPO = e ? gMapea(e) : null;
    try{ localStorage.setItem("dtrack-grupo-cache", JSON.stringify(e||null)); }catch(err){}
    gCelebra();
    if(view==="social") rSocial(); else if(view==="resumen" || view==="retos") render();
    return GRUPO;
  }).catch(function(err){ gEstado.cargando=false; gEstado.error=err; gEstado.cargado=Date.now(); if(view==="social") rSocial(); return GRUPO; });
}
/* al abrir sin red, lo último que se vio */
function gCache(){ try{ var e=JSON.parse(localStorage.getItem("dtrack-grupo-cache")||"null"); if(e && gReal()) GRUPO=gMapea(e); }catch(err){} }

/* ── varios grupos a la vez: la lista para el selector de arriba de Social ── */
var MIS_GRUPOS=[], misGruposCargados=0;
function gMisGrupos(forzar){
  if(!gReal()) return Promise.resolve(MIS_GRUPOS=[]);
  if(!forzar && MIS_GRUPOS.length && Date.now()-misGruposCargados<60000) return Promise.resolve(MIS_GRUPOS);
  return gRpc("g_mis_grupos", {}).then(function(l){
    MIS_GRUPOS=(Array.isArray(l)?l:[]).map(function(g){
      return { id:gTxt(g.id,40), nombre:gTxt(g.nombre,28)||"Mi grupo", codigo:gTxt(g.codigo,8), miembros:gNum(g.miembros,50), activo:!!g.activo };
    });
    misGruposCargados=Date.now(); return MIS_GRUPOS;
  }).catch(function(){ return MIS_GRUPOS; });
}
function haceTxt(iso){
  var t=Date.parse(iso); if(isNaN(t)) return "";
  var m=Math.max(0, Math.round((Date.now()-t)/60000));
  if(m<1) return tr("ahora"); if(m<60) return tr("hace")+" "+m+" min"; var h=Math.round(m/60);
  if(h<24) return tr("hace")+" "+h+" h"; var d=Math.round(h/24); if(d===1) return tr("ayer");
  return tr("hace")+" "+d+" "+tr("días");
}
/* lo que llega de otros miembros se limpia antes de usarlo: la ficha la escribe cada
   móvil, así que solo se aceptan números donde van números, textos cortos y fotos
   que vienen del propio Storage de Peak */
function gNum(v, max){ v=Number(v); return (isFinite(v) && v>0) ? Math.min(Math.round(v), max||1e7) : 0; }
function gTxt(v, n){ return (v==null || typeof v==="object") ? "" : String(v).slice(0, n||140); }
function gUrl(u){ u=gTxt(u, 500); return u.indexOf(NUBE_URL+"/storage/v1/object/public/")===0 ? u : ""; }
function gReac(r){ var o={}; if(r && typeof r==="object") Object.keys(r).forEach(function(k){ if(k.length<=8) o[k]=gNum(r[k], 99); }); return o; }
function gMapea(e){
  var hoy=today(), yoUid=e.yo, porUid={}, yoNom=null;
  var miembros=(e.miembros||[]).map(function(m){
    var f=(m.ficha && typeof m.ficha==="object") ? m.ficha : {}, dias={}; (Array.isArray(m.dias)?m.dias:[]).forEach(function(x){ dias[String(x.d).slice(0,10)]={ p:!!x.p, r:!!x.r }; });
    var o={ uid:gTxt(m.uid,40), usuario:gTxt(m.usuario,16)||"alguien", avatar:gUrl(m.avatar), unido:gTxt(m.unido,10), dias:dias,
            pct:gNum(f.pct,100), racha:gNum(f.racha,5000), gym:gNum(f.gym,7), retos:gNum(f.retosHoy,4), nivel:Math.max(1, gNum(f.nivel, LVL_NAMES.length)),
            mejor:gNum(f.mejor||f.racha,5000), logros:gNum(f.logros,99), retosTot:gNum(f.retosTot), estudioMin:gNum(f.estudioMin), meditaMin:gNum(f.meditaMin),
            estudioTop:gTxt(f.estudioTop,40)||null, desc:gTxt(f.desc,140), titulo:gTxt(f.titulo,40)||null,
            medallas:(Array.isArray(f.medallas)?f.medallas:[]).slice(0,30).map(function(x){ return gTxt(x,60); }).filter(Boolean) };
    porUid[m.uid]=o; if(m.uid===yoUid) yoNom=o.usuario;
    return o;
  });
  /* racha del grupo: días seguidos en los que al menos el 80 % hizo el Parte */
  var creado=String((e.grupo&&e.grupo.creado)||hoy).slice(0,10);
  function okDia(d){
    var n=miembros.filter(function(m){ return m.unido<=d; }), need=Math.max(1, Math.ceil(n.length*0.8));
    var hechos=n.filter(function(m){ return m.dias[d] && m.dias[d].p; }).length;
    return n.length>0 && hechos>=need;
  }
  var base=0, d=addDays(hoy,-1); while(d>=creado && okDia(d) && base<62){ base++; d=addDays(d,-1); }
  var mejor=0, run=0; for(var i=61;i>=1;i--){ var k=addDays(hoy,-i); if(k<creado){ continue; } if(okDia(k)){ run++; if(run>mejor) mejor=run; } else run=0; }
  var cerrados=miembros.filter(function(m){ return m.dias[hoy] && m.dias[hoy].p; }).map(function(m){ return m.usuario; });
  /* el reto del grupo */
  var R=e.grupo&&e.grupo.reto, reto;
  if(R && R.txt){
    var ini=String(R.inicio).slice(0,10), fin=String(R.acaba).slice(0,10), marcas={};
    miembros.forEach(function(m){ marcas[m.usuario]=Object.keys(m.dias).filter(function(k){ return k>=ini && k<=fin && m.dias[k].r; }).sort(); });
    /* lo tuyo, lo último que marcaste aquí */
    if(yoNom && S.gRc){ var l=marcas[yoNom]||[]; Object.keys(S.gRc).forEach(function(k){ if(k<ini||k>fin) return; var i2=l.indexOf(k); if(S.gRc[k] && i2<0) l.push(k); if(!S.gRc[k] && i2>=0) l.splice(i2,1); }); marcas[yoNom]=l.sort(); }
    reto={ txt:gTxt(R.txt,90), inicio:ini, acaba:fin, por:R.por||4, objetivo:(R.por||4)*Math.max(1,miembros.length), premio:"+150 XP para cada uno", marcas:marcas };
  } else reto={ txt:"", inicio:"", acaba:"", objetivo:1, premio:"", marcas:{} };
  var muro=(e.eventos||[]).map(function(x){
    var mias={}; (Array.isArray(x.mias)?x.mias:[]).forEach(function(em){ mias[gTxt(em,8)]=1; });
    var u=porUid[x.uid]; return { id:String(x.id).replace(/\D/g,"").slice(0,18), usuario:u?u.usuario:"alguien", texto:gTxt(x.texto,160), cuando:haceTxt(x.creado), reac:gReac(x.reac), mias:mias };
  });
  return { real:true, id:gTxt(e.grupo.id,40), nombre:gTxt(e.grupo.nombre,28)||"Mi grupo", codigo:gTxt(e.grupo.codigo,8), desc:gTxt(e.grupo.descr,140), yo:yoNom||"tú",
           miembros:miembros, racha:{ dias:base, mejor:Math.max(mejor, base), cerrados:cerrados }, reto:reto, muro:muro };
}
function retoEnMarcha(){ return !!(GRUPO && GRUPO.reto && GRUPO.reto.txt && today()>=GRUPO.reto.inicio && today()<=GRUPO.reto.acaba); }

/* ── subir lo tuyo: la ficha y, por día, Parte y reto del grupo ── */
function gFicha(){
  var st=stats(), tot=estudioTotales(), hoy=today(), num=0, den=0, gym=0;
  for(var i=0;i<7;i++){ var d=addDays(hoy,-i); var tc=(S.chPick&&S.chPick[d])?S.chPick[d].length:0; num+=chOf(d).length+checksOf(d).length; den+=tc+idealDe(d).length; if(wentGym(d)) gym++; }
  return { nivel:st.lvl, racha:st.streak, mejor:st.best, logros:st.med, retosTot:st.ch, retosHoy:chOf(hoy).length, gym:gym,
           estudioMin:tot.min, estudioTop:tot.top||null, meditaMin:(typeof meditaTotalMin==="function"?meditaTotalMin():0), desc:((S.profile&&S.profile.bio)||"").slice(0,140),
           titulo:(typeof tituloElegido==="function")?tituloElegido(st.lvl):null, pct:den?Math.min(100,Math.round(num/den*100)):0,
           medallas:MEDALS.filter(function(m){ return m.f(st); }).map(function(m){ return m.n; }).slice(-12) };
}
function gDias(){
  var out=[], hoy=today();
  for(var i=0;i<8;i++){ var d=addDays(hoy,-i); var rc=!!(S.gRc && S.gRc[d]); if(!rc && GRUPO && GRUPO.real){ rc=(GRUPO.reto.marcas[GRUPO.yo]||[]).indexOf(d)>=0; } out.push({ d:d, p:!!(S.parte&&S.parte[d]), r:rc }); }
  return out;
}
var gSyncT=null;
function gSyncPronto(ms){ if(!gReal() || !GRUPO) return; clearTimeout(gSyncT); gSyncT=setTimeout(gSync, ms==null?3000:ms); }
function gSync(){
  if(!gReal() || !GRUPO) return Promise.resolve(false);
  var f=gFicha(), ds=gDias(), clave=JSON.stringify([f,ds]);
  if(clave===gEstado.ultimoSync) return Promise.resolve(true);
  return gRpc("g_sync", { p_ficha:f, p_dias:ds }).then(function(){ gEstado.ultimoSync=clave; return true; }).catch(function(){ return false; });
}

/* ── publicar sola la actividad cuando consigues algo ── */
var HITOS_RACHA=[7,14,21,30,50,75,100,150,200,365];
function gPubCfg(){ if(!S.gPub) S.gPub={}; return S.gPub; }
function gPublica(clave, texto){
  var P=gPubCfg(); if(!P.hechos) P.hechos={};
  if(P.hechos[clave]) return; P.hechos[clave]=today();
  /* que no crezca sin fin */
  var ks=Object.keys(P.hechos); if(ks.length>200){ ks.sort(function(a,b){ return P.hechos[a]<P.hechos[b]?-1:1; }).slice(0,ks.length-150).forEach(function(k){ delete P.hechos[k]; }); }
  save();
  if(GRUPO && !GRUPO.real){ GRUPO.muro.unshift({ id:"l"+Date.now(), usuario:GRUPO.yo, texto:texto, cuando:tr("ahora"), reac:{} }); if(view==="social") rSocial(); return; }
  if(gReal() && GRUPO) gRpc("g_evento", { p_clave:clave, p_texto:texto }).then(function(){ gCargar(true); }).catch(function(){ delete P.hechos[clave]; save(); });
}
var gVigilaT=0;
function gVigila(){
  if(!GRUPO || Date.now()-gVigilaT<8000) return; gVigilaT=Date.now();
  var P=gPubCfg(), st=stats(), yo=(GRUPO.real && ses) ? ses.uid.slice(0,8) : "yo", hoy=today();
  /* la primera vez solo se apunta dónde estás, sin publicar lo antiguo */
  if(!P.ini){ P.ini=hoy; P.nivel=st.lvl; P.racha=st.streak; P.hechos=P.hechos||{}; var l0=lunesDe(hoy); if(retoSemana(l0).hecho) P.hechos["rs:"+yo+":"+l0]=hoy; if(tripleDone(hoy)) P.hechos["tr:"+yo+":"+hoy]=hoy; save(); return; }
  if(st.lvl>(P.nivel||0)){ P.nivel=st.lvl; gPublica("nv:"+yo+":"+st.lvl, "ha subido al nivel "+st.lvl+" · "+tituloDe(st.lvl)); }
  if(st.streak<(P.racha||0)) P.racha=st.streak;
  HITOS_RACHA.forEach(function(h){ if(st.streak>=h && (P.racha||0)<h){ gPublica("ra:"+yo+":"+h+":"+addDays(hoy,-st.streak+1), "lleva "+h+" días de racha 🔥"); } });
  P.racha=Math.max(P.racha||0, st.streak);
  var l=lunesDe(hoy), rs=retoSemana(l); if(rs.hecho) gPublica("rs:"+yo+":"+l, "ha conseguido su reto de la semana: «"+rs.r.t+"»");
  if(tripleDone(hoy)) gPublica("tr:"+yo+":"+hoy, "ha hecho los tres retos de hoy");
  var mes=hoy.slice(0,7); ((S.metas&&S.metas[mes])||[]).forEach(function(m){ try{ if(metaValor(m)>=m.obj) gPublica("mt:"+yo+":"+m.id, "ha cumplido su objetivo del mes: «"+m.t+"»"); }catch(e){} });
  /* el grupo entero consigue su reto */
  if(GRUPO.reto && GRUPO.reto.txt && retoTotal()>=GRUPO.reto.objetivo) gPublica("rc:"+GRUPO.reto.inicio, "ha cerrado el reto del grupo: «"+GRUPO.reto.txt+"» 🎉");
  save();
}
/* +150 XP para cada uno cuando el grupo de verdad consigue su reto */
function grupoXP(){ var x=0; Object.keys(S.gXP||{}).forEach(function(k){ x+=S.gXP[k]||0; }); return x; }
function gCelebra(){
  if(!GRUPO || !GRUPO.real || !GRUPO.reto || !GRUPO.reto.txt) return;
  if(retoTotal()>=GRUPO.reto.objetivo){
    if(!S.gXP) S.gXP={};
    if(!S.gXP[GRUPO.reto.inicio]){ S.gXP[GRUPO.reto.inicio]=150; save(); avisoNube("¡Reto del grupo conseguido! +150 XP para cada uno."); sonido("semana"); }
  }
}

/* ── lo que cambia en la pantalla ── */
/* el selector de grupo: la pastilla con tus grupos y un «+» para crear o unirte a otro.
   Con uno solo, no hace falta elegir: sale igual el «+» para tener más de uno. */
function gSelectorHTML(){
  if(!gReal() || !MIS_GRUPOS.length) return "";
  var pills = MIS_GRUPOS.length>1 ? MIS_GRUPOS.map(function(g){
    return '<button class="'+(g.activo?"on":"")+'" data-act="x-g-cambia" data-id="'+esc(g.id)+'">'+esc(g.nombre)+'</button>';
  }).join("") : "";
  return '<div class="g-selector">'+pills+'<button class="mas" data-act="x-g-otro" aria-label="'+esc(tr("Otro grupo"))+'">'+
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button></div>';
}
var _socGrupoBase=socGrupo;
socGrupo=function(){ return gSelectorHTML()+_socGrupoBase.apply(this, arguments); };

function socSinGrupo(){
  var real=gReal(), prueba=(typeof esPrueba==="function" && esPrueba());
  return '<div class="soc-sec"><h2 class="display">Tu grupo</h2></div>'+
    '<p class="soc-nota" style="font-size:14px;color:var(--t2)">De 2 a 12 personas que se conozcan. Sin clasificación mundial y sin desconocidos: solo tu gente, mejorando juntos.</p>'+
    (gEstado.sinServidor ? '<p class="soc-nota" style="color:var(--warn)">'+esc(G_ERR.sin_servidor)+'</p>' : '')+
    (real||prueba
      ? '<div style="display:flex;gap:10px;margin-top:14px"><button class="btn btn-primary" data-act="x-g-crear" style="flex:1">Crear grupo</button>'+
        '<button class="btn btn-quiet" data-act="x-g-unirse" style="flex:1">Tengo un código</button></div>'
      : '<p class="soc-nota">Entra con tu cuenta para crear un grupo o unirte al de tus amigos.</p>');
}
var _socRetoG=socReto;
socReto=function(){
  if(GRUPO && GRUPO.real && !retoEnMarcha()) return gElegirRetoHTML();
  return _socRetoG.apply(this, arguments);
};
var G_RETOS=["Sin móvil la primera hora del día","Andar 30 minutos","En la cama antes de las doce","Beber suficiente agua todo el día","Leer 10 páginas","10 minutos de estiramientos","Nada de redes después de las 22:00","Un bloque de estudio de 50 minutos sin móvil"];
function gSugerencias(){
  var s=[], metas=misMetas();
  metas.forEach(function(k){ var m=metaPorK(k); if(m && m.r[0]) s.push(m.r[0]); });
  G_RETOS.forEach(function(t){ if(s.indexOf(t)<0) s.push(t); });
  var h=hashTxt(lunesDe(today())), out=[]; for(var i=0;i<s.length && out.length<3;i++){ var t=s[(i<metas.length)?i:(metas.length+((h+i)%(s.length-metas.length||1)))]; if(t && out.indexOf(t)<0) out.push(t); }
  return out;
}
function gElegirRetoHTML(){
  var r=GRUPO.reto, antes = r && r.txt ? '<p style="font-size:12.5px;opacity:.85;margin-top:8px">'+tr("El último")+': «'+esc(r.txt)+'» · '+retoTotal()+' '+tr("de")+' '+r.objetivo+' '+tr("días")+(retoTotal()>=r.objetivo?" ✓":"")+'</p>' : '';
  return '<div class="soc-reto g-elige">'+
    '<span class="soc-ey">Objetivo del grupo</span>'+
    '<p class="soc-reto-t display">Elegid el reto de esta semana</p>'+
    '<p style="font-size:13px;opacity:.85;margin-top:6px">7 días. Cada uno marca los días que lo cumple y todo suma al bote. Si llegáis, +150 XP para cada uno.</p>'+antes+
    '<div class="g-sug">'+gSugerencias().map(function(t){ return '<button data-act="x-g-reto" data-t="'+esc(t)+'">'+esc(t)+'</button>'; }).join("")+
      '<button class="otro" data-act="x-g-reto-otro">Otro…</button></div></div>';
}
/* en la tarjeta de actividad, la verdad */
var _socMuroG=socMuro;
socMuro=function(){
  var h=_socMuroG.apply(this, arguments);
  if(GRUPO && !GRUPO.muro.length) h=h.replace('<div class="soc-lista soc-muro"></div>','<p class="soc-nota">Aún no hay nada. Cuando alguien suba de nivel, cierre su reto de la semana o llegue a una racha, saldrá aquí.</p>');
  if(GRUPO && !GRUPO.real) h=h.replace("Se publica sola cuando alguien consigue algo.", "Se publica sola cuando alguien consigue algo. En modo prueba, solo lo tuyo.");
  return h;
};

/* crear y unirse */
function gSheetCrear(){
  openSheet('<div class="flex items-start justify-between mb-4"><h3 class="display text-[20px] font-bold">Crear grupo</h3>'+closeBtn()+'</div>'+
    '<p class="text-[13px] t2 mb-4 leading-relaxed">Luego te da un código para que tus amigos se unan.</p>'+
    '<input id="g-nombre" class="field mb-4" maxlength="28" placeholder="Nombre del grupo">'+
    '<p id="g-err" class="text-[12.5px] mb-3" style="color:var(--alert)"></p>'+
    '<button class="btn btn-primary w-full !py-3.5" data-act="x-g-crear-ok">Crear</button>');
  setTimeout(function(){ var i=document.getElementById("g-nombre"); if(i) i.focus(); }, 200);
}
function gSheetUnirse(){
  openSheet('<div class="flex items-start justify-between mb-4"><h3 class="display text-[20px] font-bold">Unirme a un grupo</h3>'+closeBtn()+'</div>'+
    '<p class="text-[13px] t2 mb-4 leading-relaxed">Pide el código de 6 letras a alguien del grupo.</p>'+
    '<input id="g-codigo" class="field mb-4 num" maxlength="6" autocapitalize="characters" autocorrect="off" placeholder="K7M2PQ" style="text-transform:uppercase;letter-spacing:.2em;text-align:center">'+
    '<p id="g-err" class="text-[12.5px] mb-3" style="color:var(--alert)"></p>'+
    '<button class="btn btn-primary w-full !py-3.5" data-act="x-g-unirse-ok">Unirme</button>');
  setTimeout(function(){ var i=document.getElementById("g-codigo"); if(i) i.focus(); }, 200);
}
function gFallo(e){ var p=document.getElementById("g-err"); var t=gError(e); if(p) p.textContent=t; else avisoNube(t); }
function gTrasEntrar(txt){
  closeSheet(); gEstado.ultimoSync=""; S.gPub=null;
  return gMisGrupos(true).then(function(){ return gCargar(true); }).then(function(){ gSync(); rSocial(); avisoNube(txt); sonido("semana"); });
}
function gSalir(){
  if(!gReal()){ avisoNube("En modo prueba no se puede salir del grupo."); return; }
  if(!confirmaSalir()) return;
  gRpc("g_salir", {}).then(function(){
    S.gPub=null; save(); try{ localStorage.removeItem("dtrack-grupo-cache"); }catch(e){}
    return gMisGrupos(true);
  }).then(function(lista){
    /* si te quedan más grupos, el servidor ya ha activado otro: se carga ese */
    if(lista && lista.length) return gCargar(true).then(function(){ cerrarGrupo(); rSocial(); avisoNube("Has salido del grupo."); });
    GRUPO=null; cerrarGrupo(); rSocial(); avisoNube("Has salido del grupo.");
  }).catch(function(e){ avisoNube(gError(e)); });
}
var salirPulsado=0;
function confirmaSalir(){ if(Date.now()-salirPulsado<4000) return true; salirPulsado=Date.now(); avisoNube("Pulsa otra vez para salir del grupo."); return false; }
var gEditT=null;
function gEditarPronto(){ if(!gReal() || !GRUPO) return; clearTimeout(gEditT); gEditT=setTimeout(function(){ gRpc("g_editar", { p_nombre:GRUPO.nombre, p_descr:GRUPO.desc||"" }).catch(function(){}); }, 900); }

/* marcar el reto del grupo: se guarda aquí y se sube */
var _retoMarcarHoyG=retoMarcarHoy;
retoMarcarHoy=function(){
  var r=_retoMarcarHoyG.apply(this, arguments);
  if(GRUPO && GRUPO.real){ if(!S.gRc) S.gRc={}; S.gRc[today()]=retoHoyHecho(); save(); gSyncPronto(600); }
  return r;
};
/* reaccionar: al momento en pantalla y luego al servidor */
var _reaccionarG=reaccionar;
reaccionar=function(id, e, boton){
  var r=_reaccionarG.apply(this, arguments);
  if(GRUPO && GRUPO.real && /^\d+$/.test(String(id))) gRpc("g_reaccion", { p_evento:+id, p_emoji:e }).catch(function(err){ avisoNube(gError(err)); gCargar(true); });
  return r;
};

function grupoAccion(a, el){
  if(a==="x-g-crear"){ if(typeof esPrueba==="function" && esPrueba() && !gReal()){ avisoNube("Sin cuenta no hay grupos: entra con tu cuenta para crear uno."); return true; } gSheetCrear(); return true; }
  if(a==="x-g-unirse"){ if(typeof esPrueba==="function" && esPrueba() && !gReal()){ avisoNube("Sin cuenta no hay grupos: entra con tu cuenta para unirte a uno."); return true; } gSheetUnirse(); return true; }
  if(a==="x-g-crear-ok"){ var n=(($("#g-nombre")||{}).value||"").trim(); el.disabled=true;
    gRpc("g_crear", { p_nombre:n }).then(function(){ return gTrasEntrar("Grupo creado. Invita a tus amigos con el código."); }).catch(function(e){ el.disabled=false; gFallo(e); }); return true; }
  if(a==="x-g-unirse-ok"){ var c=(($("#g-codigo")||{}).value||"").trim().toUpperCase(); if(c.length<6){ gFallo({message:"codigo_mal"}); return true; } el.disabled=true;
    gRpc("g_unirse", { p_codigo:c }).then(function(){ return gTrasEntrar("Ya estás dentro. ¡A por ello juntos!"); }).catch(function(e){ el.disabled=false; gFallo(e); }); return true; }
  if(a==="x-g-reto"){ gPonReto(el.dataset.t); return true; }
  if(a==="x-g-reto-otro"){
    openSheet('<div class="flex items-start justify-between mb-4"><h3 class="display text-[20px] font-bold">Reto del grupo</h3>'+closeBtn()+'</div>'+
      '<input id="g-reto-t" class="field mb-4" maxlength="90" placeholder="Ej. 20 minutos de lectura">'+
      '<button class="btn btn-primary w-full !py-3.5" data-act="x-g-reto-ok">Empezar esta semana</button>'); return true; }
  if(a==="x-g-reto-ok"){ var t=(($("#g-reto-t")||{}).value||"").trim(); if(t.length<3) return true; closeSheet(); gPonReto(t); return true; }
  if(a==="x-g-otro"){
    openSheet('<div class="flex items-start justify-between mb-4"><h3 class="display text-[20px] font-bold">Otro grupo</h3>'+closeBtn()+'</div>'+
      '<p class="text-[13px] t2 mb-4 leading-relaxed">Puedes estar hasta en 8 grupos a la vez y cambiar de cuál ves con el selector de arriba.</p>'+
      '<div style="display:flex;flex-direction:column;gap:10px">'+
        '<button class="btn btn-primary w-full !py-3.5" data-act="x-g-crear">Crear grupo nuevo</button>'+
        '<button class="btn btn-quiet w-full !py-3.5" data-act="x-g-unirse">Tengo un código</button>'+
      '</div>');
    return true;
  }
  if(a==="x-g-cambia"){
    var idc=el.dataset.id; if(el.classList.contains("on")) return true;
    el.disabled=true;
    gRpc("g_activar", { p_grupo:idc }).then(function(){ return gCargar(true); }).then(function(){ return gMisGrupos(true); }).then(function(){ rSocial(); })
      .catch(function(e){ avisoNube(gError(e)); }).then(function(){ el.disabled=false; });
    return true;
  }
  return false;
}
function gPonReto(t){
  gRpc("g_reto", { p_txt:t, p_por:4, p_dias:7, p_hoy:today() }).then(function(d){
    return gCargar(true).then(function(){ avisoNube(d&&d.ok ? "Reto del grupo en marcha: «"+t+"»." : "Alguien ya ha elegido el reto."); });
  }).catch(function(e){ avisoNube(gError(e)); });
}

/* ── cuándo se habla con el servidor ── */
var gArrancado=false, gMisGruposVistos=-1;
function grupoTrasRender(){
  if(gReal()){
    if(!gArrancado){ gArrancado=true; gCache(); gCargar(true).then(function(){ gSyncPronto(1500); }); gMisGrupos(true).then(function(l){ gMisGruposVistos=l.length; if(l.length && view==="social") rSocial(); }); }
    else {
      gSyncPronto();
      if(view==="social"){
        gCargar(false);
        gMisGrupos(false).then(function(l){ if(l.length!==gMisGruposVistos){ gMisGruposVistos=l.length; if(view==="social") rSocial(); } });
      }
    }
  }
  gVigila();
}
setInterval(function(){ if(gReal() && view==="social" && document.visibilityState!=="hidden") gCargar(false); }, 45000);
document.addEventListener("visibilitychange", function(){ if(document.visibilityState==="visible" && gReal()) gCargar(true); });

var GRUPO2_CSS=[
/* el selector de grupo */
'.g-selector{ display:flex; align-items:center; gap:7px; overflow-x:auto; padding:2px 2px 4px; margin-bottom:10px; -webkit-overflow-scrolling:touch; }',
'.g-selector::-webkit-scrollbar{ display:none; }',
'.g-selector button{ flex:0 0 auto; height:34px; padding:0 14px; border-radius:99px; font-size:13px; font-weight:700; white-space:nowrap;',
'  background:var(--fill); color:var(--t2); box-shadow:inset 0 0 0 1px var(--hairline); }',
'.g-selector button.on{ background:var(--accent); color:var(--on-accent); box-shadow:none; }',
'.g-selector button.mas{ flex:0 0 auto; width:34px; height:34px; padding:0; display:grid; place-items:center; border-radius:99px;',
'  background:var(--fill); color:var(--accent); box-shadow:inset 0 0 0 1px var(--hairline); }',
'.g-selector button.mas svg{ width:16px; height:16px; }',
'.g-elige .g-sug{ display:flex; flex-direction:column; gap:8px; margin-top:14px; }',
'.g-elige .g-sug button{ text-align:left; padding:12px 14px; border-radius:14px; font-size:14px; font-weight:700; background:rgba(255,255,255,.16); color:inherit; }',
'.g-elige .g-sug button.otro{ background:transparent; box-shadow:inset 0 0 0 1px rgba(255,255,255,.35); font-weight:600; }',
'.soc .g-elige .g-sug button{ background:var(--glass-bg); color:var(--t1); box-shadow:0 0 0 1px var(--hairline); }',
'.soc .g-elige .g-sug button.otro{ background:transparent; color:var(--accent); }'
].join("\n");
/* ════════ cuenta y nube ════════
   Todo a mano con fetch: sin librería externa, así la app sigue
   abriendo y funcionando aunque no haya cobertura. */

var NUBE_URL="https://zznytqlurhxhdwludrxm.supabase.co";
var NUBE_KEY="sb_publishable_npV7Ia-MEspOktfL0VMteg_JSOFyoZb";
var SESKEY="dtrack-sesion", SYNCKEY="dtrack-version";

var ses=null;        /* {access_token, refresh_token, caduca, uid, email} */
var perfil=null;     /* {usuario, nacimiento} */
var sincronizando=false, ultimoSync=0;

function sesLeer(){
  try{ var r=localStorage.getItem(SESKEY); return r?JSON.parse(r):null; }catch(e){ return null; }
}
function sesGuardar(s){
  ses=s;
  try{ s?localStorage.setItem(SESKEY,JSON.stringify(s)):localStorage.removeItem(SESKEY); }catch(e){}
}
function verLocal(){ try{ return Number(localStorage.getItem(SYNCKEY)||0); }catch(e){ return 0; } }
function verLocalSet(n){ try{ localStorage.setItem(SYNCKEY,String(n)); }catch(e){} }

/* ── llamadas ───────────────────────────────────────────── */
/* hasta sep 2026 el service worker guardaba copias de estas respuestas y podía
   devolver un perfil o unos datos viejos («Ya casi» cada vez, sincronizar con lo
   antiguo). Al abrir se borran esas copias antes de la primera llamada. */
var cacheNubeLimpia=null;
function limpiaCacheNube(){
  if(cacheNubeLimpia) return cacheNubeLimpia;
  var p=Promise.resolve();
  try{
    if(window.caches && caches.keys){
      p=caches.keys().then(function(ks){
        return Promise.all(ks.map(function(k){
          return caches.open(k).then(function(c){
            return c.keys().then(function(rs){
              return Promise.all(rs.filter(function(q){ return q.url.indexOf(NUBE_URL)===0; }).map(function(q){ return c.delete(q); }));
            });
          });
        }));
      });
    }
  }catch(e){}
  cacheNubeLimpia=p.catch(function(){});
  return cacheNubeLimpia;
}
function pedir(ruta, opc){
  opc=opc||{};
  var h={ "apikey":NUBE_KEY, "Content-Type":"application/json" };
  var t=(opc.anon||!ses||!ses.access_token)?NUBE_KEY:ses.access_token;
  h["Authorization"]="Bearer "+(opc.token||t);
  if(opc.prefer) h["Prefer"]=opc.prefer;
  var conf={ method:opc.method||"GET", headers:h, cache:"no-store" };
  if(opc.body) conf.body=JSON.stringify(opc.body);
  return limpiaCacheNube().then(function(){ return fetch(NUBE_URL+ruta, conf); }).then(function(r){
    return r.text().then(function(txt){
      var j=null; try{ j=txt?JSON.parse(txt):null; }catch(e){}
      return { ok:r.ok, estado:r.status, datos:j, texto:txt };
    });
  });
}

/* renueva el testigo antes de que caduque y reintenta una vez si aun así da 401 */
function pedirAuth(ruta, opc){
  return tokenFresco().then(function(){
    /* sin sesión no se pregunta como anónimo: devolvería vacío y parecería una cuenta nueva */
    if(!ses || !ses.access_token) return { ok:false, estado:401, datos:null, texto:"" };
    return pedir(ruta,opc).then(function(r){
      if(r.estado!==401) return r;
      return refrescar().then(function(bien){
        return (bien && ses) ? pedir(ruta,opc) : r;
      });
    });
  });
}

/* una sola renovación a la vez: Supabase solo deja usar cada testigo de renovación
   una vez, y dos a la vez podían cerrar la sesión */
var refrescando=null;
function refrescar(){
  if(!ses||!ses.refresh_token||ses.demo) return Promise.resolve(false);
  if(refrescando) return refrescando;
  /* otra ventana de la app (la de Google, por ejemplo) puede haberla renovado ya */
  var guardada=sesLeer();
  if(guardada && guardada.uid===ses.uid && guardada.refresh_token && guardada.refresh_token!==ses.refresh_token){
    ses=guardada;
    if(ses.caduca && ses.caduca-Date.now()>60000) return Promise.resolve(true);
  }
  refrescando=pedir("/auth/v1/token?grant_type=refresh_token",
      { method:"POST", anon:true, body:{ refresh_token:ses.refresh_token } })
    .then(function(r){
      if(r.ok && r.datos && r.datos.access_token){ guardarSesion(r.datos); return true; }
      /* el servidor dice que esa sesión ya no vale (caducada o cerrada en otro sitio) */
      if(r.estado===400 || r.estado===401 || r.estado===403) sesionCaducada();
      return false;
    })
    .catch(function(){ return false; })
    .then(function(ok){ refrescando=null; return ok; });
  return refrescando;
}
/* la sesión ya no vale: se pide entrar otra vez, sin tocar nada de lo guardado en el móvil */
function sesionCaducada(){
  if(!ses || ses.demo) return;
  if(ses.email) ultimoCorreoSet(ses.email);
  sesGuardar(null); perfil=null;
  pintaEstadoNube("caducada");
  setTimeout(function(){
    if(puertaEl()) return;
    puertaAviso="Tu sesión ha caducado. Entra otra vez para seguir guardando en la nube: lo de este móvil no se pierde.";
    abrirPuerta("bienvenida");
  }, 300);
}

function guardarSesion(d){
  if(!d || !d.access_token) return;
  sesGuardar({
    access_token: d.access_token,
    refresh_token: d.refresh_token,
    caduca: Date.now() + (d.expires_in||3600)*1000,
    uid: d.user ? d.user.id : (ses?ses.uid:""),
    email: d.user ? d.user.email : (ses?ses.email:"")
  });
}

function pedirCodigo(correo){
  return pedir("/auth/v1/otp", { method:"POST", anon:true,
    body:{ email:correo, create_user:true } });
}
/* Supabase manda el mismo tipo de código para entrar y para registrarse, pero según
   la cuenta hay que verificarlo como "email", "signup" o "magiclink": se prueban en orden */
function verificarCodigo(correo, codigo){
  var tipos=["email","signup","magiclink"], ultimo=null;
  function prueba(i){
    if(i>=tipos.length) return Promise.resolve(ultimo);
    return pedir("/auth/v1/verify", { method:"POST", anon:true,
      body:{ email:correo, token:codigo, type:tipos[i] } }).then(function(r){
        if(r.ok && r.datos && r.datos.access_token) return r;
        ultimo=r;
        /* si el fallo no es de código (demasiados intentos, sin red…), no se sigue probando */
        var ec=(r.datos&&(r.datos.error_code||""))||"";
        if(r.estado===429 || (ec && ec!=="otp_expired" && ec!=="validation_failed")) return r;
        return prueba(i+1);
      });
  }
  return prueba(0);
}

/* devuelve el perfil; null si la cuenta de verdad no tiene perfil (hay que crearlo);
   false si no se ha podido leer (sin red, sesión caducada…): entonces NO se pide
   otra vez el nombre y la fecha */
function leerPerfil(){
  if(!ses || ses.demo) return Promise.resolve(perfil);
  return pedirAuth("/rest/v1/perfiles?select=usuario,nacimiento,avatar&id=eq."+ses.uid)
    .then(function(r){
      if(r.ok && r.datos && r.datos.length){ perfil=r.datos[0]; perfilRecuerda(perfil); return perfil; }
      if(r.ok && r.datos && !r.datos.length) return null;
      return false;
    })
    .catch(function(){ return false; });
}
/* se recuerda en el móvil el último nombre y fecha, para no volver a escribirlos */
function perfilRecuerda(p){ try{ if(p && p.usuario) localStorage.setItem("dtrack-perfil-ultimo", JSON.stringify({ usuario:p.usuario, nacimiento:p.nacimiento||"" })); }catch(e){} }
function perfilRecordado(){ try{ return JSON.parse(localStorage.getItem("dtrack-perfil-ultimo")||"null")||{}; }catch(e){ return {}; } }
function leerPerfilConReintento(){
  return leerPerfil().then(function(p){
    if(p!==false) return p;
    return new Promise(function(ok){ setTimeout(ok, 1200); }).then(leerPerfil);
  });
}
function crearPerfil(usuario, nacimiento){
  return pedirAuth("/rest/v1/perfiles", { method:"POST", prefer:"return=representation",
    body:{ id:ses.uid, usuario:usuario, nacimiento:nacimiento } });
}

/* ── subir y bajar el estado ─────────────────────────────── */
/* la fila de la nube; null si aún no hay ninguna; false si no se ha podido leer */
function bajarDatos(){
  if(!ses || ses.demo) return Promise.resolve(false);
  return pedirAuth("/rest/v1/datos?select=estado,version,actualizado&id=eq."+ses.uid)
    .then(function(r){ if(!r.ok || !Array.isArray(r.datos)) return false; return r.datos.length ? r.datos[0] : null; })
    .catch(function(){ return false; });
}
/* nubeSucia: hay cambios en este móvil que aún no se han subido */
var subiendo=null, nubeSucia=false;
function subirDatos(){
  if(!ses || ses.demo){ pintaEstadoNube("prueba"); return Promise.resolve(false); }
  if(aplicando) return Promise.resolve(false);
  if(subiendo) return subiendo;
  var vAntes=verLocal(), v=vAntes+1, ahora=new Date().toISOString();
  nubeSucia=false;
  /* se sube una foto de cómo está todo ahora: si sale bien, esa foto es la nueva «base» */
  var txt=JSON.stringify(S), foto=JSON.parse(txt);
  /* solo se sobrescribe si en la nube sigue la versión que este móvil conoce: si otro
     dispositivo ha guardado entre medias, no se pisa: se juntan las dos (o se pregunta) */
  var peticion = vAntes>0
    ? pedirAuth("/rest/v1/datos?id=eq."+ses.uid+"&version=eq."+vAntes+"&select=version",
        { method:"PATCH", prefer:"return=representation", body:{ estado:foto, version:v, actualizado:ahora } })
    : pedirAuth("/rest/v1/datos?select=version",
        { method:"POST", prefer:"return=representation", body:{ id:ses.uid, estado:foto, version:v, actualizado:ahora } });
  subiendo=peticion.then(function(r){
    if(r.ok && Array.isArray(r.datos) && r.datos.length){ verLocalSet(v); baseGuarda(v, txt); ultimoSync=Date.now(); pintaEstadoNube("guardado"); return true; }
    nubeSucia=true;
    if((r.ok && Array.isArray(r.datos)) || r.estado===409){ nubeConflicto(); return false; }
    pintaEstadoNube(r.estado===401 ? "caducada" : "error"); return false;
  }).catch(function(){ nubeSucia=true; pintaEstadoNube("sinred"); return false; })
    .then(function(ok){ subiendo=null; return ok; });
  return subiendo;
}
/* cada vez que se guarda algo en el móvil, queda pendiente de subir */
var _saveNube=save;
save=function(){ var r=_saveNube.apply(this, arguments); nubeSucia=true; return r; };
/* la nube tiene otra versión: se pregunta en cuanto la app esté a la vista */
var conflictoPend=false;
var conflictoUltimo=0;
function nubeConflicto(){
  if(document.visibilityState==="hidden"){ conflictoPend=true; return; }
  conflictoPend=false;
  if(document.getElementById("conflicto")) return;
  if(Date.now()-conflictoUltimo<20000) return;   /* nunca en bucle */
  conflictoUltimo=Date.now();
  sincronizarAlAbrir();
}
document.addEventListener("visibilitychange", function(){
  if(document.visibilityState==="visible" && conflictoPend) nubeConflicto();
});

/* cuánto "pesa" un estado, para poder comparar dos versiones */
function resumenEstado(e){
  if(!e) return null;
  var dias=Object.keys(e.checks||{}).length;
  var tareas=(e.tasks||[]).length;
  var ult="";
  var ks=Object.keys(e.checks||{}); ks.sort(); if(ks.length) ult=ks[ks.length-1];
  var hechas=0; (e.tasks||[]).forEach(function(t){ if(t.done) hechas++; });
  return { dias:dias, tareas:tareas, hechas:hechas, ultimo:ult };
}

/* ── la «base»: cómo estaba todo la última vez que este móvil y la nube coincidieron ──
   Con ella, cuando la nube va por delante, se sabe qué ha cambiado aquí y qué allí, y se
   juntan las dos sin preguntar. Antes se obligaba a quedarse con una versión entera (y la
   otra se perdía) aunque en este móvil no se hubiera tocado nada: bastaba con usar la web
   y la app de iPhone, que guardan cada una lo suyo. Va en IndexedDB, con su versión, para
   no quitarle sitio al estado en el almacén del navegador. */
function baseIDB(escribe){
  return new Promise(function(ok){
    try{
      if(!ses || !ses.uid || !window.indexedDB) return ok(null);
      var clave="sync:"+ses.uid, r=indexedDB.open("dutrack",1);
      r.onupgradeneeded=function(){ try{ r.result.createObjectStore("estado"); }catch(e){} };
      r.onerror=function(){ ok(null); };
      r.onsuccess=function(){
        try{
          var db=r.result, tx=db.transaction("estado", escribe?"readwrite":"readonly"), st=tx.objectStore("estado");
          var q=escribe ? st.put(escribe, clave) : st.get(clave);
          q.onsuccess=function(){ if(!escribe) ok(q.result||null); };
          tx.oncomplete=function(){ db.close(); ok(escribe ? true : (q.result||null)); };
          tx.onerror=tx.onabort=function(){ try{ db.close(); }catch(e){} ok(null); };
        }catch(e){ ok(null); }
      };
    }catch(e){ ok(null); }
  });
}
function baseGuarda(v, txt){ return baseIDB({ v:v, txt:txt }); }
function baseLee(){ return baseIDB(null); }

/* JSON con las claves en orden, para saber si dos trozos son iguales */
function jsonFijo(v){
  if(v===undefined) return "~";
  if(v===null || typeof v!=="object") return JSON.stringify(v);
  if(Array.isArray(v)) return "["+v.map(jsonFijo).join(",")+"]";
  return "{"+Object.keys(v).sort().filter(function(k){ return v[k]!==undefined; })
    .map(function(k){ return JSON.stringify(k)+":"+jsonFijo(v[k]); }).join(",")+"}";
}
function esObjeto(v){ return v!==null && typeof v==="object" && !Array.isArray(v); }
function esVacio(v){ return v==null || v==="" || v===0 || v===false || (Array.isArray(v) && !v.length) || (esObjeto(v) && !Object.keys(v).length); }
/* lo que cambió en los dos sitios a la vez y aun así tiene una respuesta clara */
function fusionaChoque(ruta, l, n, local, nube){
  var p=ruta.split(".");
  /* los tres retos de un día (y su «por qué») se calculan solos al abrir la app: valen los
     del lado donde ese día se marcó alguno; si no, los de la nube */
  if((p[0]==="chPick" || p[0]==="chInfo") && p.length===2){
    var dl=((local.chDone||{})[p[1]]||[]).length, dn=((nube.chDone||{})[p[1]]||[]).length;
    return { v:(dl && !dn) ? l : n };
  }
  /* el saldo de comodines también se recalcula solo */
  if(p[0]==="comodin" && p.length===2 && p[1]!=="usados") return { v:n };
  /* listas de marcas (hábitos o retos hechos un día…): se juntan las de los dos */
  if(Array.isArray(l) && Array.isArray(n) && l.concat(n).every(function(x){ return x===null || typeof x!=="object"; })){
    var u=l.slice(); n.forEach(function(x){ if(u.indexOf(x)<0) u.push(x); }); return { v:u };
  }
  return null;
}
/* fusión a tres bandas: b es la base, l lo de este móvil y n lo de la nube */
function fusiona3(b, l, n, ruta, local, nube, choques){
  var jl=jsonFijo(l), jn=jsonFijo(n);
  if(jl===jn) return l;
  var jb=jsonFijo(b);
  if(jl===jb) return n;                     /* solo cambió en la nube */
  if(jn===jb) return l;                     /* solo cambió aquí */
  if(b===undefined && esVacio(l)) return n; /* aquí solo se preparó, vacío */
  if(b===undefined && esVacio(n)) return l;
  if(esObjeto(l) && esObjeto(n)){
    var o={}, bo=esObjeto(b)?b:{}, ks={};
    Object.keys(l).concat(Object.keys(n)).forEach(function(k){ ks[k]=1; });
    Object.keys(ks).forEach(function(k){
      var v=fusiona3(bo[k], l[k], n[k], ruta?ruta+"."+k:k, local, nube, choques);
      if(v!==undefined) o[k]=v;
    });
    return o;
  }
  var r=fusionaChoque(ruta, l, n, local, nube);
  if(r) return r.v;
  choques.push(ruta); return l;
}
/* el estado juntado, o null si algo cambió de verdad en los dos sitios (entonces se pregunta) */
function fusionaConNube(nube, base){
  try{
    if(!base || !base.txt || base.v!==verLocal() || !esObjeto(nube.estado)) return null;
    var b=JSON.parse(base.txt), l=JSON.parse(JSON.stringify(S)), choques=[];
    var f=fusiona3(b, l, nube.estado, "", l, nube.estado, choques);
    return (choques.length || !esObjeto(f)) ? null : f;
  }catch(e){ return null; }
}

/* se trae lo de la nube y se recarga. Mientras, nada puede volver a subir ni guardar
   lo viejo (al recargar se dispara el «al cerrar»). «base» es lo que hay en la nube en
   esa versión (si no se pasa, es el propio estado) */
var aplicando=false;
function aplicarEstado(e, version, base){
  try{
    aplicando=true; nubeSucia=false;
    S=e;
    localStorage.setItem(KEY, JSON.stringify(e));
    verLocalSet(version||0);
  }catch(err){ aplicando=false; avisoNube("No se ha podido guardar lo de la nube en este navegador."); return; }
  var listo=false;
  function recarga(){ if(listo) return; listo=true; location.reload(); }
  baseGuarda(version||0, JSON.stringify(base||e)).then(recarga, recarga);
  setTimeout(recarga, 1500);
}

/* ── sincronizar al abrir ────────────────────────────────── */
function sincronizarAlAbrir(){
  if(!ses || ses.demo){ pintaEstadoNube("prueba"); return Promise.resolve(); }
  pintaEstadoNube("mirando");
  return bajarDatos().then(function(nube){
    if(nube===false){ pintaEstadoNube(navigator.onLine===false ? "sinred" : "error"); return; }
    if(!nube){ verLocalSet(0); return subirDatos(); }   /* primera vez: sube lo que haya */
    var vLocal=verLocal();
    if(nube.version===vLocal){
      /* la misma versión: lo de la nube es justo la base de este móvil */
      baseGuarda(vLocal, JSON.stringify(nube.estado));
      /* si en este móvil hay algo sin subir (se cerró sin red), se sube */
      if(JSON.stringify(nube.estado)!==JSON.stringify(S)) return subirDatos();
      pintaEstadoNube("aldia"); return;
    }
    var aqui=resumenEstado(S), alla=resumenEstado(nube.estado);
    if(vLocal===0 && aqui && aqui.dias===0 && aqui.tareas===0){
      aplicarEstado(nube.estado, nube.version); return;  /* móvil vacío: baja sin preguntar */
    }
    if(nube.version>vLocal){
      /* la nube va por delante: si lo de aquí y lo de allí no chocan, se juntan sin preguntar
         (y al recargar se sube lo juntado); si algo cambió en los dos sitios, se pregunta */
      return baseLee().then(function(base){
        var f=fusionaConNube(nube, base);
        if(f){ aplicarEstado(f, nube.version, nube.estado); return; }
        preguntarConflicto(nube, aqui, alla);
      });
    }
    /* la nube va por detrás de este móvil: se sube lo de aquí */
    verLocalSet(nube.version); return subirDatos();
  }).catch(function(){ pintaEstadoNube("sinred"); });
}

function sincronizarAlCerrar(){
  if(!ses || ses.demo || !nubeSucia) return;
  subirDatos();
}

/* ── avisos pequeños ─────────────────────────────────────── */
function avisoNubeViejo(txt){
  var d=document.getElementById("aviso-nube");
  if(!d){
    d=document.createElement("div"); d.id="aviso-nube";
    d.style.cssText="position:fixed;left:12px;right:12px;bottom:calc(88px + env(safe-area-inset-bottom));z-index:80;"+
      "border-radius:14px;padding:12px 14px;font-size:12.5px;line-height:1.45;text-align:center;"+
      "background:color-mix(in srgb,var(--bg) 86%,var(--accent));color:var(--t1);"+
      "box-shadow:0 10px 30px -12px rgba(0,0,0,.45), inset 0 0 0 1px var(--hairline)";
    document.body.appendChild(d);
  }
  d.textContent=txt;
  clearTimeout(d._t); d._t=setTimeout(function(){ if(d.parentNode) d.parentNode.removeChild(d); }, 3200);
}

var ESTADOS={ mirando:"comprobando…", guardado:"guardado en la nube", aldia:"al día", prueba:"modo prueba · sin nube",
              sinred:"sin conexión", error:"no se ha podido guardar", caducada:"sesión caducada" };
function pintaEstadoNube(k){
  var e=document.getElementById("nube-estado");
  if(e) e.textContent=ESTADOS[k]||"";
}

