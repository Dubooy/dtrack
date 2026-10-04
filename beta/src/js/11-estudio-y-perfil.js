/* ════════════════ comodines de racha ════════════════
   Uno cada 3 niveles, como mucho 2 guardados. Si un día se te pasa sin hacer
   nada, se gasta solo y la racha sigue. Solo se gastan si tapan el hueco
   entero; si el hueco es más largo que lo que tienes, no se malgastan. */
var COMODIN_CADA=3, COMODIN_MAX=2;
function comodinEstado(){
  if(!S.comodin) S.comodin={ saldo:0, nivel:1, usados:{} };
  if(!S.comodin.usados) S.comodin.usados={};
  return S.comodin;
}
function comodinUsado(d){ return !!(S.comodin && S.comodin.usados && S.comodin.usados[d]); }
function comodinesDisponibles(){ return comodinEstado().saldo; }

/* se llama con las stats ya calculadas: si has subido de nivel, gana */
function comodinGana(st){
  var c=comodinEstado();
  if(st.lvl>c.nivel){
    var ganados=Math.floor(st.lvl/COMODIN_CADA)-Math.floor(c.nivel/COMODIN_CADA);
    var nuevos=desbloqueosEntre(c.nivel, st.lvl).map(function(u){ return u.t; });
    var viejo=c.nivel, primeraVez=!c.visto;
    c.nivel=st.lvl; c.visto=1;
    var antes=c.saldo;
    if(ganados>0) c.saldo=Math.min(COMODIN_MAX, c.saldo+ganados);
    if(c.saldo>antes) nuevos.push("un comodín de racha ("+c.saldo+"/"+COMODIN_MAX+")");
    save();
    /* la primera vez que abres esta versión no se celebra: solo se ajusta */
    if(!primeraVez){ subidaProgramada=true; setTimeout(function(){ celebraNivel(st.lvl, viejo, nuevos); }, Math.max(450, xpLlegada-Date.now()+1000)); }
  }
}

/* al abrir: mira si ayer (y antes) se quedaron vacíos */
function comodinGasta(){
  var c=comodinEstado(); if(c.saldo<=0) return;
  var hueco=[], d=addDays(today(),-1);
  while(!activeDay(d) && hueco.length<=COMODIN_MAX){ hueco.push(d); d=addDays(d,-1); }
  if(!hueco.length || hueco.length>c.saldo) return;
  if(!activeDay(d)) return;                         /* no había racha que salvar */
  hueco.forEach(function(x){ c.usados[x]=1; });
  c.saldo-=hueco.length;
  save();
  setTimeout(function(){
    avisoNube("Se ha gastado "+(hueco.length===1?"un comodín":hueco.length+" comodines")+
      ": tu racha sigue viva. Te "+(c.saldo===1?"queda 1.":"quedan "+c.saldo+"."));
  }, 900);
}

/* ════════════════ estudio (temporizador) ════════════════ */
var EST_XP_MIN=0.4, EST_XP_TOPE=60;
function estudioEstado(){
  if(!S.estudio) S.estudio={ sesiones:[], actual:null };
  if(!S.estudio.sesiones) S.estudio.sesiones=[];
  return S.estudio;
}
function estudioMinDia(d){
  var e=S.estudio; if(!e||!e.sesiones) return 0;
  var m=0; for(var i=0;i<e.sesiones.length;i++) if(e.sesiones[i].d===d) m+=e.sesiones[i].min;
  return m;
}
function estudioXP(d){ return Math.min(EST_XP_TOPE, Math.round(estudioMinDia(d)*EST_XP_MIN)); }
function estudioTotales(){
  var e=estudioEstado(), total=0, por={};
  e.sesiones.forEach(function(s){ total+=s.min; var k=s.sid||("t:"+(s.nombre||"Otra cosa")); por[k]=(por[k]||0)+s.min; });
  var top=null, topMin=0;
  Object.keys(por).forEach(function(k){ if(por[k]>topMin){ topMin=por[k]; top=k; } });
  var topNombre=null;
  if(top){ if(top.indexOf("t:")===0) topNombre=top.slice(2); else { var sb=subj(top); topNombre=sb?sb.name:"—"; } }
  return { min:total, top:topNombre, topMin:topMin };
}
function horasTxt(min){
  if(min<60) return min+" min";
  var h=Math.floor(min/60), m=min%60;
  return h+" h"+(m?" "+m+" min":"");
}

var estSel={ sid:null, nombre:"", est:25, desc:5 };
function sheetEstudio(){
  var subs=S.subjects||[];
  if(estSel.sid===null && subs.length) estSel.sid=subs[0].id;
  var chips=subs.map(function(s){
    var on=(estSel.sid===s.id);
    return '<button class="est-chip'+(on?" on":"")+'" data-act="x-est-sub" data-sid="'+s.id+'">'+
      '<span style="width:8px;height:8px;border-radius:99px;background:'+s.color+';flex:0 0 auto"></span>'+esc(s.short||s.name)+'</button>';
  }).join("")+
    '<button class="est-chip'+(estSel.sid===""?" on":"")+'" data-act="x-est-sub" data-sid="">Otra cosa</button>';
  var pre=[[25,5],[50,10]], esPre=false;
  var segs=pre.map(function(p){
    var on=(estSel.est===p[0] && estSel.desc===p[1]); if(on) esPre=true;
    return '<button class="est-seg'+(on?" on":"")+'" data-act="x-est-pre" data-e="'+p[0]+'" data-d="'+p[1]+'">'+
      '<b class="num">'+p[0]+'</b><span>+ '+p[1]+' descanso</span></button>';
  }).join("")+
    '<button class="est-seg'+(!esPre?" on":"")+'" data-act="x-est-otro"><b>Otro</b><span>tú eliges</span></button>';
  openSheet(
    '<div class="flex items-start justify-between mb-1"><h3 class="display" style="font-size:24px;font-weight:800;letter-spacing:-.035em">Estudiar</h3>'+closeBtn()+'</div>'+
    '<p class="t3" style="font-size:13px;margin-bottom:18px">Suma XP y horas de estudio. Hasta '+EST_XP_TOPE+' XP al día.</p>'+
    '<p class="eyebrow" style="margin-bottom:9px">Qué vas a estudiar</p>'+
    '<div class="est-chips">'+chips+'</div>'+
    (estSel.sid===""?'<input id="est-nombre" class="field" style="margin-top:10px" maxlength="40" placeholder="Ej. Repasar vocabulario" value="'+esc(estSel.nombre)+'">':'')+
    '<p class="eyebrow" style="margin:20px 0 9px">Cuánto tiempo</p>'+
    '<div class="est-segs">'+segs+'</div>'+
    (!esPre
      ? '<div class="est-otro">'+
          '<label><span>Estudio</span><input id="est-min" type="number" inputmode="numeric" min="5" max="180" value="'+estSel.est+'"><em>min</em></label>'+
          '<label><span>Descanso</span><input id="est-des" type="number" inputmode="numeric" min="0" max="60" value="'+estSel.desc+'"><em>min</em></label>'+
        '</div>'
      : '')+
    '<button class="est-empezar" data-act="x-est-go">Empezar</button>'
  );
}
function leerOtro(){
  var a=document.getElementById("est-min"), b=document.getElementById("est-des"), n=document.getElementById("est-nombre");
  if(a){ var v=parseInt(a.value,10); if(!isNaN(v)) estSel.est=Math.max(5,Math.min(180,v)); }
  if(b){ var w=parseInt(b.value,10); if(!isNaN(w)) estSel.desc=Math.max(0,Math.min(60,w)); }
  if(n) estSel.nombre=n.value.trim();
}

var estTic=null, estWake=null;
function estudioEmpieza(){
  leerOtro();
  var sb=estSel.sid?subj(estSel.sid):null;
  var e=estudioEstado();
  e.actual={ sid:estSel.sid||"", nombre: sb?sb.name:(estSel.nombre||"Otra cosa"), color: sb?sb.color:"var(--accent)",
             est:estSel.est, desc:estSel.desc, fase:"estudio", fin:Date.now()+estSel.est*60000, resto:null, bloque:1, hechoMin:0 };
  save(); closeSheet(); estudioPinta(); estudioReloj();
}
function estudioRestante(a){ return a.fin ? Math.max(0, a.fin-Date.now()) : (a.resto||0); }
function estudioGuarda(min, a){
  if(min<1) return 0;
  var e=estudioEstado(), antes=estudioXP(today());
  e.sesiones.push({ d:today(), sid:a.sid||"", nombre:a.sid?"":a.nombre, min:min });
  var gan=estudioXP(today())-antes;
  save();
  return gan;
}
/* avanza de fase si el tiempo ya ha pasado (también al volver a la app) */
function estudioAvanza(){
  var e=estudioEstado(), a=e.actual; if(!a || !a.fin) return;
  var ahora=Date.now();
  if(a.fin>ahora) return;
  if(a.fase==="estudio"){
    var gan=estudioGuarda(a.est, a);
    a.hechoMin+=a.est;
    zumbido(); sonido("campana");
    if(a.desc>0){ a.fase="descanso"; a.fin=a.fin+a.desc*60000; }
    else { a.fase="listo"; a.fin=null; }
    avisoNube("Bloque hecho: "+a.est+" min de "+a.nombre+(gan>0?" · +"+gan+" XP":" · tope de XP de hoy"));
    save(); render();
    if(a.fase==="descanso" && a.fin<=ahora){ a.fase="listo"; a.fin=null; save(); }
  } else if(a.fase==="descanso"){
    zumbido(); sonido("campana"); a.fase="listo"; a.fin=null; save();
  }
}
function zumbido(){ try{ if(navigator.vibrate) navigator.vibrate([180,90,180]); }catch(e){} }
function estudioReloj(){
  clearInterval(estTic);
  estTic=setInterval(function(){
    var a=S.estudio&&S.estudio.actual;
    if(!a){ clearInterval(estTic); return; }
    estudioAvanza(); estudioRefresca();
  }, 250);
  try{ if(navigator.wakeLock && !estWake) navigator.wakeLock.request("screen").then(function(w){ estWake=w; w.addEventListener("release",function(){ estWake=null; }); }).catch(function(){}); }catch(e){}
}
function estudioPinta(){
  var a=S.estudio&&S.estudio.actual, capa=document.getElementById("est-capa");
  if(!a){ if(capa){ capa.classList.remove("ve"); setTimeout(function(){ if(capa.parentNode) capa.parentNode.removeChild(capa); },320); } return; }
  if(!capa){
    capa=document.createElement("div"); capa.id="est-capa";
    document.body.appendChild(capa);
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ capa.classList.add("ve"); }); });
  }
  var R=112, C=2*Math.PI*R;
  capa.innerHTML=
    '<div class="est-arriba"><span class="est-punto" style="background:'+a.color+'"></span><span class="est-asig">'+esc(a.nombre)+'</span></div>'+
    '<p class="est-fase display" id="est-fase"></p>'+
    '<div class="est-anillo"><svg viewBox="0 0 250 250"><circle cx="125" cy="125" r="'+R+'" fill="none" stroke="var(--fill-hi)" stroke-width="10"/>'+
      '<circle id="est-arco" cx="125" cy="125" r="'+R+'" fill="none" stroke-width="10" stroke-linecap="round" '+
      'stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="0" transform="rotate(-90 125 125)"/></svg>'+
      '<div class="est-tiempo"><b class="num display" id="est-t">--:--</b><span id="est-sub"></span></div></div>'+
    '<div class="est-botones" id="est-botones"></div>';
  estudioRefresca(true);
}
var estUltimaFase="";
function estudioRefresca(forzar){
  var a=S.estudio&&S.estudio.actual; if(!a) { estudioPinta(); return; }
  var capa=document.getElementById("est-capa"); if(!capa) return;
  var rest=estudioRestante(a), total=(a.fase==="descanso"?a.desc:a.est)*60000;
  var mm=Math.floor(rest/60000), ss=Math.floor((rest%60000)/1000);
  var t=document.getElementById("est-t"), arco=document.getElementById("est-arco");
  var R=112, C=2*Math.PI*R;
  if(a.fase==="listo"){
    if(t) t.textContent="✓";
    if(arco){ arco.style.strokeDashoffset="0"; arco.style.stroke="var(--good)"; }
  } else {
    if(t) t.textContent=(mm<10?"0":"")+mm+":"+(ss<10?"0":"")+ss;
    if(arco){ arco.style.strokeDashoffset=(C*(1-rest/Math.max(1,total))).toFixed(1);
              arco.style.stroke=(a.fase==="descanso"?"var(--good)":a.color); }
  }
  var clave=a.fase+"|"+(a.fin?"1":"0");
  if(!forzar && clave===estUltimaFase) return;
  estUltimaFase=clave;
  var f=document.getElementById("est-fase"), sub=document.getElementById("est-sub"), bt=document.getElementById("est-botones");
  capa.classList.toggle("descanso", a.fase==="descanso");
  if(a.fase==="estudio"){
    f.textContent=a.fin?"Concentración":"En pausa";
    sub.textContent="bloque "+a.bloque+" · "+a.est+" min";
    bt.innerHTML='<button class="est-pill" data-act="x-est-pausa">'+(a.fin?"Pausar":"Seguir")+'</button>'+
      '<button class="est-link" data-act="x-est-fin">Terminar</button>';
  } else if(a.fase==="descanso"){
    f.textContent=a.fin?"Descanso":"En pausa";
    sub.textContent="aléjate de la pantalla";
    bt.innerHTML='<button class="est-pill" data-act="x-est-saltar">Saltar descanso</button>'+
      '<button class="est-link" data-act="x-est-fin">Terminar</button>';
  } else {
    f.textContent="Bloque terminado";
    sub.textContent=horasTxt(a.hechoMin)+" en esta sesión";
    bt.innerHTML='<button class="est-pill" data-act="x-est-otro-bloque">Otro bloque de '+a.est+' min</button>'+
      '<button class="est-link" data-act="x-est-fin">Terminar</button>';
  }
}
function estudioTermina(){
  var a=S.estudio&&S.estudio.actual; if(!a) return;
  var msg="";
  if(a.fase==="estudio"){
    var hecho=Math.floor((a.est*60000-estudioRestante(a))/60000);
    if(hecho>=5){ var g=estudioGuarda(hecho,a); a.hechoMin+=hecho; msg="Guardados "+hecho+" min"+(g>0?" · +"+g+" XP":""); }
    else if(!a.hechoMin) msg="Menos de 5 minutos: no se guarda.";
  }
  var tot=a.hechoMin;
  S.estudio.actual=null; save();
  clearInterval(estTic);
  try{ if(estWake){ estWake.release(); estWake=null; } }catch(e){}
  estudioPinta(); render();
  avisoNube(msg || (tot? "Sesión terminada: "+horasTxt(tot)+" de estudio." : "Sesión terminada."));
}

/* ════════════════ perfil ════════════════ */
function perfilPropio(){
  var st=stats(), tot=estudioTotales(), c=comodinEstado();
  return {
    yo:true,
    usuario: (typeof perfil!=="undefined" && perfil && perfil.usuario) || (S.profile && S.profile.name) || "tú",
    avatar: (typeof perfil!=="undefined" && perfil && perfil.avatar) || "",
    desc: (S.profile && S.profile.bio) || "",
    nivel: st.lvl, xp: st.xp, floor: st.lvlFloor, need: st.lvlNeed,
    racha: st.streak, mejor: st.best, logros: st.med, gym: st.gym, retos: st.ch,
    estudioMin: tot.min, estudioTop: tot.top, meditaMin: (typeof meditaTotalMin==="function"?meditaTotalMin():0), comodines: c.saldo,
    medallas: MEDALS.filter(function(m){ return m.f(st); }).map(function(m){ return m.n; })
  };
}
function perfilDe(u){
  if(!GRUPO) return null;
  for(var i=0;i<GRUPO.miembros.length;i++){
    var m=GRUPO.miembros[i];
    if(m.usuario===u){
      if(u===GRUPO.yo) return perfilPropio();
      return { yo:false, usuario:m.usuario, avatar:m.avatar||"", desc:m.desc||"", nivel:m.nivel||1,
               racha:m.racha, mejor:m.mejor||m.racha, logros:m.logros||0, gym:m.gym, retos:m.retosTot||0,
               estudioMin:m.estudioMin||0, estudioTop:m.estudioTop||null, meditaMin:m.meditaMin||0, comodines:null, medallas:m.medallas||[] };
    }
  }
  return null;
}
function tituloDe(n){ return LVL_NAMES[Math.max(0,Math.min(n,LVL_NAMES.length)-1)]; }
function abrirPerfil(u){
  var p = (!u || (GRUPO && u===GRUPO.yo)) ? perfilPropio() : perfilDe(u);
  if(!p) return;
  var capa=document.getElementById("perfil-capa");
  if(!capa){ capa=document.createElement("div"); capa.id="perfil-capa"; document.body.appendChild(capa); }
  var letra=(p.usuario||"?").charAt(0).toUpperCase();
  /* floor = XP acumulado al empezar el nivel; need = XP que pide este nivel */
  var pctNv = p.yo ? Math.max(0, Math.min(100, Math.round((p.xp-p.floor)/Math.max(1,p.need)*100))) : null;
  var foto = p.avatar ? '<img src="'+esc(p.avatar)+'" alt="">' : '<span class="display">'+esc(letra)+'</span>';
  capa.innerHTML=
    '<div class="pf-barra"><button class="pf-atras" data-act="x-perfil-cerrar" aria-label="Volver">'+
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>'+
      '<span>'+(p.yo?"Tu perfil":"Perfil")+'</span></div>'+
    '<div class="pf-scroll">'+
      '<div class="pf-cabeza">'+
        (p.yo ? '<div class="pf-foto">'+foto+'<button class="av-lapiz" data-act="nube-foto" aria-label="Cambiar foto"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg></button></div>'
              : '<div class="pf-foto">'+foto+'</div>')+
        (p.yo
          ? '<input id="pf-nombre" class="pf-nombre display" maxlength="16" autocapitalize="words" autocorrect="off" spellcheck="false" value="'+esc(p.usuario)+'" aria-label="Tu nombre">'+
            '<p class="pf-pista">Toca tu nombre para cambiarlo</p>'
          : '<h1 class="display">'+esc(p.usuario)+'</h1>')+
        '<div class="pf-rango">'+emblemaRango(p.nivel,40)+'<div><b>'+esc(rangoNombre(p.nivel))+'</b><span>Nivel '+p.nivel+'</span></div></div>'+
        '<p class="pf-titulo"><span class="pf-nv num">NV '+p.nivel+'</span>'+esc(p.yo?tituloElegido(p.nivel):(p.titulo||tituloDe(p.nivel)))+'</p>'+
        (p.yo && p.nivel>=NV_TITULOS
          ? '<label class="pf-sel"><span>Tu título</span><select id="pf-titulo">'+
              LVL_NAMES.slice(0,p.nivel).map(function(n){ return '<option'+(n===tituloElegido(p.nivel)?' selected':'')+'>'+esc(n)+'</option>'; }).join("")+
            '</select></label>'
          : '')+
        (p.yo
          ? '<textarea id="pf-desc" class="pf-desc" maxlength="140" rows="2" placeholder="Escribe algo sobre ti (se ve en tu grupo)">'+esc(p.desc)+'</textarea>'+
            '<p class="pf-cuenta num" id="pf-cuenta">'+(p.desc.length)+'/140</p>'
          : (p.desc?'<p class="pf-desc-ver">'+esc(p.desc)+'</p>':''))+
      '</div>'+
      (pctNv!==null
        ? '<div class="pf-nivel"><div class="soc-barra"><i style="width:'+pctNv+'%;background:var(--accent)"></i></div>'+
          '<p class="num">'+(p.nivel>=LVL_NAMES.length?"Nivel máximo":"Faltan "+Math.max(0,p.floor+p.need-p.xp)+" XP para "+esc(tituloDe(p.nivel+1)))+'</p></div>'
        : '')+
      '<div class="pf-cifras">'+
        pfCifra(p.racha,"racha","var(--warn)","racha")+pfCifra(p.mejor,"mejor racha","var(--t1)","racha")+
        pfCifra(p.logros,"logros","var(--gold)","logro")+pfCifra(Math.round(p.estudioMin/60*10)/10,"h de estudio","var(--accent)","estudiar")+
      '</div>'+
      '<div class="soc-sec"><h2 class="display">Datos</h2></div>'+
      '<div class="soc-lista">'+
        pfFila("Días de ejercicio", p.gym)+
        pfFila("Retos cumplidos", p.retos)+
        pfFila("Estudio total", horasTxt(p.estudioMin||0))+
        (p.estudioTop?pfFila("Lo que más estudia", p.estudioTop):"")+
        (p.meditaMin?pfFila("Meditación total", horasTxt(p.meditaMin)):"")+
        (p.comodines!==null?pfFila("Comodines de racha"+ICON_COMODIN.replace("margin-left:.26em","margin-left:.3em;color:var(--cyan)"), p.comodines+" de "+COMODIN_MAX, true):"")+
      '</div>'+
      (p.medallas.length
        ? '<div class="soc-sec"><h2 class="display">Logros</h2><span class="t3" style="font-size:12.5px">'+p.medallas.length+'</span></div>'+
          '<div class="pf-medallas">'+p.medallas.map(function(n){ return '<span>🏅 '+esc(n)+'</span>'; }).join("")+'</div>'
        : '')+
      (p.yo ? '<div class="soc-sec"><h2 class="display">Lo que desbloqueas</h2><span class="t3" style="font-size:12.5px">nivel '+p.nivel+'</span></div>'+listaDesbloqueos(p.nivel) : '')+
      '<div style="height:40px"></div>'+
    '</div>';
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ capa.classList.add("ve"); }); });
  var nom=document.getElementById("pf-nombre");
  if(nom){
    nom.addEventListener("keydown", function(ev){ if(ev.key==="Enter") nom.blur(); });
    nom.addEventListener("change", function(){
      var v=nom.value.trim(), antes=p.usuario;
      if(v===antes) return;
      if(!/^[A-Za-z0-9._-]{3,16}$/.test(v)){
        avisoNube("De 3 a 16 caracteres: letras, números, punto, guion o guion bajo.");
        nom.value=antes; return;
      }
      cambiarUsuario(v).then(function(ok){
        if(ok){ p.usuario=v; nom.value=v; avisoNube("Ahora te llamas "+v+"."); }
        else nom.value=antes;
      });
    });
  }
  var sel=document.getElementById("pf-titulo");
  if(sel) sel.addEventListener("change", function(){
    if(!S.profile) S.profile={};
    S.profile.titulo=sel.value; save();
    var tt=capa.querySelector(".pf-titulo"); if(tt) tt.innerHTML='<span class="pf-nv num">NV '+p.nivel+'</span>'+esc(sel.value);
  });
  var ta=document.getElementById("pf-desc");
  if(ta) ta.addEventListener("input", function(){
    if(!S.profile) S.profile={};
    S.profile.bio=ta.value.slice(0,140);
    var c2=document.getElementById("pf-cuenta"); if(c2) c2.textContent=ta.value.length+"/140";
    clearTimeout(ta._t); ta._t=setTimeout(save, 500);
  });
}
function pfCifra(v,l,c,ic){ return '<div>'+(ic&&typeof ico==="function"?'<i class="pf-cif-ico" style="color:'+c+'">'+ico(ic)+'</i>':'')+'<b class="display num" style="color:'+c+'">'+v+'</b><span>'+l+'</span></div>'; }
function pfFila(l,v,html){ return '<div class="soc-fila"><div class="soc-cuerpo"><span style="flex:1;font-size:15px">'+(html?l:esc(l))+'</span>'+
  '<span class="num t2" style="font-size:15px;font-weight:600">'+esc(String(v))+'</span></div></div>'; }
function cerrarPerfil(){
  var capa=document.getElementById("perfil-capa"); if(!capa) return;
  capa.classList.remove("ve");
  setTimeout(function(){ if(capa.parentNode && !capa.classList.contains("ve")) capa.parentNode.removeChild(capa); }, 380);
  if(view==="social") rSocial();
}

/* ════════════════ acciones y estilo ════════════════ */
function extrasAccion(a, el){
  if(novedadesAccion(a, el)) return true;
  if(a==="x-estudiar"){ sheetEstudio(); return true; }
  if(a==="x-est-sub"){ leerOtro(); estSel.sid=el.dataset.sid; sheetEstudio(); return true; }
  if(a==="x-est-pre"){ leerOtro(); estSel.est=+el.dataset.e; estSel.desc=+el.dataset.d; sheetEstudio(); return true; }
  if(a==="x-est-otro"){ leerOtro(); if(estSel.est===25&&estSel.desc===5 || estSel.est===50&&estSel.desc===10){ estSel.est=40; estSel.desc=8; } sheetEstudio(); return true; }
  if(a==="x-est-go"){ estudioEmpieza(); return true; }
  if(a==="x-est-pausa"){
    var p=S.estudio.actual; if(!p) return true;
    if(p.fin){ p.resto=p.fin-Date.now(); p.fin=null; } else { p.fin=Date.now()+(p.resto||0); p.resto=null; }
    save(); estudioRefresca(true); return true;
  }
  if(a==="x-est-saltar"){ var q=S.estudio.actual; if(q){ q.fase="listo"; q.fin=null; save(); estudioRefresca(true); } return true; }
  if(a==="x-est-otro-bloque"){ var r=S.estudio.actual; if(r){ r.fase="estudio"; r.bloque++; r.fin=Date.now()+r.est*60000; r.resto=null; save(); estudioRefresca(true); } return true; }
  if(a==="x-est-fin"){ estudioTermina(); return true; }
  if(a==="x-dev-nivel" || a==="x-dev-racha" || a==="x-dev-reset"){ pruebaAccion(a, el); return true; }
  if(a==="x-extra"){
    if(nivelCache<NV_EXTRA){ avisoNube("El reto extra se desbloquea en el nivel "+NV_EXTRA+"."); return true; }
    var dx=el.dataset.day||today();
    if(!S.retoExtra) S.retoExtra={};
    if(S.retoExtra[dx]) delete S.retoExtra[dx]; else { S.retoExtra[dx]=1; celebraTick(el, 50, "var(--gold)"); }
    var fila=el.closest(".reto-extra");
    if(fila){ fila.classList.toggle("done"); var mt=fila.querySelector(".re-marca-t"); if(mt) mt.textContent=fila.classList.contains("done")?"Hecho. Te lo has ganado.":"Marcar como hecho"; }
    save(); setTimeout(render,400); return true;
  }
  if(a==="x-acento"){
    if(nivelCache<NV_COLORES){ avisoNube("Los colores se desbloquean en el nivel "+NV_COLORES+"."); return true; }
    try{ el.dataset.c ? localStorage.setItem(ACKEY, el.dataset.c) : localStorage.removeItem(ACKEY); }catch(err){}
    aplicaAcento();
    var bs=document.querySelectorAll(".acentos button");
    for(var ib=0;ib<bs.length;ib++) bs[ib].classList.toggle("on", bs[ib]===el);
    return true;
  }
  if(a==="x-subida-cerrar"){ cierraSubida(); return true; }
  if(a==="x-camino"){ caminoInfo(+el.dataset.n); return true; }
  if(a==="x-valor"){ sheetValor(el.dataset.k); return true; }
  if(a==="x-idioma"){ if(el.dataset.k!==IDIOMA) idiomaPon(el.dataset.k); return true; }
  if(a==="x-valor-chip"){ valorMarca(+el.dataset.v); return true; }
  if(a==="x-valor-ok"){ var sv=document.getElementById("vl-rango"); closeSheet(); if(sv) saludPon(valorDia, valorClave, +sv.value); return true; }
  if(a==="x-grupo"){ abrirGrupo(); return true; }
  if(a==="x-grupo-cerrar"){ cerrarGrupo(); return true; }
  if(a==="x-grupo-copiar"){
    var cod=GRUPO?GRUPO.codigo:"";
    try{ navigator.clipboard.writeText(cod).then(function(){ avisoNube("Código copiado: "+cod); },function(){ avisoNube("Código: "+cod); }); }catch(err){ avisoNube("Código: "+cod); }
    return true;
  }
  if(a==="x-grupo-compartir"){
    var txt="Únete a mi grupo «"+(GRUPO?GRUPO.nombre:"")+"» en Peak con el código "+(GRUPO?GRUPO.codigo:"");
    if(navigator.share){ navigator.share({ title:"Peak.", text:txt }).catch(function(){}); }
    else { try{ navigator.clipboard.writeText(txt); avisoNube("Invitación copiada."); }catch(err){ avisoNube(txt); } }
    return true;
  }
  if(a==="x-grupo-salir"){ if(typeof gSalir==="function") gSalir(); else avisoNube("En modo prueba no se puede salir del grupo."); return true; }
  if(a==="x-perfil"){ abrirPerfil(el.dataset.u||""); return true; }
  if(a==="x-perfil-cerrar"){ cerrarPerfil(); return true; }
  return false;
}

var EXTRAS_CSS=[
/* hoja de estudiar */
'.est-chips{ display:flex; flex-wrap:wrap; gap:8px; }',
'.est-chip{ display:inline-flex; align-items:center; gap:7px; height:38px; padding:0 14px; border-radius:999px; font-size:14px; font-weight:600;',
'  background:var(--fill); color:var(--t2); box-shadow:inset 0 0 0 1px var(--hairline); transition:all .25s var(--ease); }',
'.est-chip.on{ background:var(--accent); color:var(--on-accent); box-shadow:none; }',
'.est-segs{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }',
'.est-seg{ display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; height:70px; border-radius:18px;',
'  background:var(--fill); color:var(--t2); box-shadow:inset 0 0 0 1px var(--hairline); transition:all .25s var(--ease); }',
'.est-seg b{ font-family:"Plus Jakarta Sans",sans-serif; font-size:22px; font-weight:800; letter-spacing:-.03em; color:var(--t1); }',
'.est-seg span{ font-size:11px; }',
'.est-seg.on{ background:var(--accent-soft); box-shadow:inset 0 0 0 2px var(--accent); color:var(--accent); }',
'.est-seg.on b{ color:var(--accent); }',
'.est-otro{ display:flex; gap:10px; margin-top:10px; }',
'.est-otro label{ flex:1; display:flex; align-items:center; gap:8px; height:52px; padding:0 14px; border-radius:16px; background:var(--fill); box-shadow:inset 0 0 0 1px var(--hairline); }',
'.est-otro span{ font-size:13px; color:var(--t3); }',
'.est-otro input{ flex:1; min-width:0; width:100%; background:none; border:0; outline:none; text-align:right; font-weight:700; color:var(--t1); }',
'.est-otro em{ font-style:normal; font-size:13px; color:var(--t3); }',
'.est-empezar{ width:100%; height:56px; margin-top:22px; border-radius:999px; font-size:16px; font-weight:700; color:var(--on-accent);',
'  background:linear-gradient(155deg, color-mix(in srgb,var(--accent) 90%,#000) 0%, var(--accent) 55%, var(--grad-2) 130%);',
'  box-shadow:0 14px 30px -14px color-mix(in srgb,var(--accent) 75%,transparent); transition:transform .35s var(--spring); }',
'.est-empezar:active{ transform:scale(.97); }',
/* pantalla del temporizador */
'#est-capa{ position:fixed; inset:0; z-index:70; background:var(--bg); display:flex; flex-direction:column; align-items:center;',
'  padding:calc(env(safe-area-inset-top) + 30px) 24px calc(env(safe-area-inset-bottom) + 30px);',
'  opacity:0; transform:translateY(24px); transition:opacity .3s var(--ease), transform .45s var(--spring); }',
'#est-capa.ve{ opacity:1; transform:none; }',
'.est-arriba{ display:flex; align-items:center; gap:9px; margin-top:6px; }',
'.est-punto{ width:10px; height:10px; border-radius:99px; }',
'.est-asig{ font-size:15px; font-weight:700; color:var(--t2); }',
'.est-fase{ font-size:32px; font-weight:800; letter-spacing:-.04em; margin-top:10px; text-align:center; }',
'.est-anillo{ position:relative; width:min(78vw,300px); aspect-ratio:1; margin:auto 0; }',
'.est-anillo svg{ width:100%; height:100%; display:block; }',
'#est-arco{ transition:stroke-dashoffset .25s linear, stroke .4s var(--ease); }',
'.est-tiempo{ position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }',
'.est-tiempo b{ font-size:64px; font-weight:800; letter-spacing:-.05em; line-height:1; }',
'.est-tiempo span{ font-size:13px; color:var(--t3); margin-top:8px; }',
'.est-botones{ width:100%; max-width:380px; }',
'.est-pill{ width:100%; height:56px; border-radius:999px; font-size:16px; font-weight:700; color:var(--on-accent); background:var(--accent);',
'  box-shadow:0 14px 30px -14px color-mix(in srgb,var(--accent) 75%,transparent); transition:transform .35s var(--spring); }',
'#est-capa.descanso .est-pill{ background:var(--good); box-shadow:0 14px 30px -14px color-mix(in srgb,var(--good) 75%,transparent); }',
'.est-pill:active{ transform:scale(.97); }',
'.est-link{ display:block; width:100%; padding:14px 0 0; font-size:15px; font-weight:700; color:var(--t3); }',
/* perfil */
'#perfil-capa{ position:fixed; inset:0; z-index:65; background:var(--bg); display:flex; flex-direction:column;',
'  transform:translateX(100%); transition:transform .42s cubic-bezier(.32,.72,0,1); }',
'#perfil-capa.ve{ transform:none; }',
'.pf-barra{ display:flex; align-items:center; gap:6px; padding:calc(env(safe-area-inset-top) + 10px) 12px 8px; }',
'.pf-barra span{ font-size:16px; font-weight:700; }',
'.pf-atras{ width:40px; height:40px; display:grid; place-items:center; border-radius:999px; color:var(--accent); }',
'.pf-atras svg{ width:24px; height:24px; }',
'.pf-scroll{ flex:1; overflow-y:auto; -webkit-overflow-scrolling:touch; padding:0 20px; max-width:640px; width:100%; margin:0 auto; }',
'.pf-cabeza{ display:flex; flex-direction:column; align-items:center; text-align:center; padding-top:8px; }',
'.pf-foto{ width:104px; height:104px; border-radius:999px; overflow:hidden; display:flex; align-items:center; justify-content:center;',
'  background:var(--accent-soft); color:var(--accent); font-size:42px; font-weight:800; }',
'.pf-foto img{ width:100%; height:100%; object-fit:cover; display:block; }',
'.pf-cabeza h1{ font-size:30px; font-weight:800; letter-spacing:-.04em; margin-top:14px; }',
'.pf-titulo{ display:flex; align-items:center; gap:8px; margin-top:6px; font-size:15px; font-weight:600; color:var(--t2); }',
'.pf-nv{ display:inline-flex; align-items:center; height:22px; padding:0 8px; border-radius:7px; font-size:11.5px; font-weight:800; background:var(--accent-soft); color:var(--accent); }',
'.pf-desc{ width:100%; max-width:420px; margin-top:16px; padding:12px 14px; border-radius:16px; resize:none; text-align:center; line-height:1.45;',
'  background:var(--fill); color:var(--t1); border:0; outline:none; box-shadow:inset 0 0 0 1px var(--hairline); }',
'.pf-desc:focus{ box-shadow:inset 0 0 0 2px var(--accent); }',
'.pf-cuenta{ font-size:11px; color:var(--t3); margin-top:5px; }',
'.pf-desc-ver{ margin-top:14px; font-size:15px; line-height:1.5; color:var(--t2); max-width:36ch; }',
'.pf-nivel{ margin-top:22px; }',
'.pf-nivel .soc-barra{ height:7px; margin:0; }',
'.pf-nivel p{ font-size:12.5px; color:var(--t3); margin-top:7px; text-align:center; }',
'.pf-cifras{ display:grid; grid-template-columns:repeat(4,1fr); margin-top:24px; box-shadow:inset 0 1px 0 var(--hairline), inset 0 -1px 0 var(--hairline); }',
'.pf-cifras > div{ display:flex; flex-direction:column; align-items:center; padding:16px 0; }',
'.pf-cifras > div + div{ box-shadow:inset 1px 0 0 var(--hairline); }',
'.pf-cifras b{ font-size:24px; font-weight:800; letter-spacing:-.04em; line-height:1; }',
'.pf-cifras span{ font-size:11px; color:var(--t3); margin-top:6px; text-align:center; }',
'.pf-medallas{ display:flex; flex-wrap:wrap; gap:8px; margin-top:10px; }',
'.pf-medallas span{ font-size:13px; padding:7px 12px; border-radius:999px; background:color-mix(in srgb,var(--gold) 13%,transparent); color:var(--t1); }',
/* comodines en Retos */
'.comodin-ico{ color:var(--cyan); }'
].join("\n");
function extrasEstilo(){
  if(document.getElementById("extras-css")) return;
  var st=document.createElement("style"); st.id="extras-css"; st.textContent=EXTRAS_CSS+"\n"+DESBLOQ_CSS+"\n"+RANGO_CSS+"\n"+NOVEDADES_CSS+"\n"+HOY_CSS+"\n"+LIMPIEZA_CSS+"\n"+PULIDO_CSS+"\n"+RETOQUE_CSS+"\n"+EVOLUCION_CSS+"\n"+RUMBO_CSS+"\n"+RUMBO2_CSS+"\n"+(typeof DISENO_CSS==="string"?DISENO_CSS:"")+"\n"+(typeof BUCLE_CSS==="string"?BUCLE_CSS:"")+"\n"+(typeof GRUPO2_CSS==="string"?GRUPO2_CSS:"");
  document.head.appendChild(st);
}

/* tras cada pintado de la app */
function extrasTrasRender(st){
  nivelRefresca(st);
  comodinGana(st);
  pintaRetoExtra();
  pintaRangoRetos(st);
  temaVigila(); aplicaAcento();
  var sc=document.getElementById("st-com"); if(sc) sc.textContent=comodinEstado().saldo;
  var eh=document.getElementById("est-hoy");
  if(eh){ var m=estudioMinDia(today()); eh.textContent = m ? horasTxt(m)+" hoy" : ""; eh.hidden=!m; }
  novedadesTrasRender(st);
}

/* al arrancar */
function extrasArranca(){
  extrasEstilo();
  novedadesArranca();
  try{ var st0=stats(); nivelRefresca(st0); aplicaAcento(); temaVigila(); comodinGana(st0); }catch(e){}
  comodinGasta();
  var a=S.estudio&&S.estudio.actual;
  if(a){ estudioAvanza(); estudioPinta(); estudioReloj(); }
  document.addEventListener("visibilitychange", function(){
    if(document.visibilityState==="visible"){
      comodinGasta();
      if(S.estudio&&S.estudio.actual){ estudioAvanza(); estudioRefresca(true); }
    }
  });
}

/* ════════════════ botones de prueba (solo modo prueba) ════════════════ */
function pruebaAccion(a, el){
  if(!esPrueba()) return;
  var st=stats();
  if(a==="x-dev-nivel"){
    if(st.lvl>=LVL_NAMES.length){ avisoNube("Ya estás en el último nivel."); return; }
    xpPreparar();
    S.xpPrueba=(S.xpPrueba||0)+Math.max(1,(st.lvlFloor+st.lvlNeed)-st.xp);
    save(); render();
    if(el){ var rb=el.getBoundingClientRect(); xpVuela(rb.left+rb.width/2, rb.top+rb.height/2, 50); }
    var n=stats().lvl;
    avisoNube("Nivel "+n+" · "+tituloDe(n));
    return;
  }
  if(a==="x-dev-racha"){
    var base=activeDay(today())?today():addDays(today(),-1), obj;
    obj = st.streak>0 ? addDays(base,-st.streak) : today();
    var tope=0; while(activeDay(obj) && tope<800){ obj=addDays(obj,-1); tope++; }
    if(!S.rachaPrueba) S.rachaPrueba={};
    S.rachaPrueba[obj]=1;
    save(); render();
    avisoNube("Racha: "+stats().streak+" días");
    return;
  }
  if(a==="x-dev-reset"){
    delete S.xpPrueba; delete S.rachaPrueba;
    if(S.comodin){ S.comodin.nivel=1; S.comodin.saldo=0; }
    save(); render();
    avisoNube("Quitado todo lo de prueba.");
  }
}

