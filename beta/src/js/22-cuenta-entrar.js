/* ════════ la puerta: correo, código y perfil ════════ */
var puertaPaso="bienvenida", puertaCorreo="", puertaCargando=false, puertaError="", puertaReenvio=0, puertaCrono=null;
var puertaAviso="";   /* un aviso arriba de los botones (p. ej. «tu sesión ha caducado») */

function puertaEl(){ return document.getElementById("puerta"); }

function abrirPuerta(paso){
  puertaPaso=paso||"correo";
  var d=puertaEl();
  if(!d){
    d=document.createElement("div"); d.id="puerta";
    d.style.cssText="position:fixed;inset:0;z-index:200;background:var(--bg);overflow-y:auto;"+
      "display:flex;align-items:center;justify-content:center;"+
      "padding:calc(28px + env(safe-area-inset-top)) 18px calc(28px + env(safe-area-inset-bottom))";
    document.body.appendChild(d);
    if(!document.getElementById("car-css")){
      var st=document.createElement("style"); st.id="car-css"; st.textContent=CAR_CSS+"\n"+BV_CSS;
      document.head.appendChild(st);
    }
    d.dataset.base="";
    d.addEventListener("click", puertaClic);
    d.addEventListener("keydown", function(e){
      if(e.key==="Enter"){ e.preventDefault(); puertaAvanzar(); }
    });
  }
  pintarPuerta();
  /* el botón de Google solo sale si está activado en Supabase */
  if(!enVisor()){
    var gAntes=googleActivo();
    googleMira().then(function(on){ if(on!==gAntes) repintaPie(); });
  }
}
function cerrarPuerta(){
  var d=puertaEl(); if(d&&d.parentNode) d.parentNode.removeChild(d);
  clearInterval(puertaCrono); clearInterval(googleT); carPara(); peakFondosPara();
  puertaAviso="";
}

function marcaPeak(){
  return '<div style="display:flex;align-items:center;margin-bottom:26px;height:18px">'+
    peakWM("var(--t1)").replace('<svg ','<svg style="height:18px;width:auto" ')+'</div>';
}

function puertaError_(){
  return puertaError
    ? '<p style="margin-top:12px;font-size:12.5px;line-height:1.5;color:var(--alert)">'+puertaError+'</p>'
    : '';
}

/* la bienvenida se pinta una vez y se queda de fondo; los pasos suben encima
   en una hoja, como una ventanita, sin tocar el carrusel */
function pieHTML(){
  var ult=ultimoCorreo(), g=googleActivo(), porGoogle=!!(ult && g && ultimoMetodo()==="google");
  return '<div class="car-pie">'+
    (puertaAviso ? '<p class="pu-aviso">'+esc(puertaAviso)+'</p>' : '')+
    (ult
      ? '<button class="pu-boton" data-p="'+(porGoogle?"google":"recordado")+'">'+
          '<span class="pu-boton-sub">Entrar como</span>'+
          '<span class="pu-boton-t">'+esc(ult)+'</span>'+
        '</button>'+
        (g && !porGoogle ? botonGoogle() : '')+
        '<button class="pu-enlace" data-p="otro-correo">Usar otro correo</button>'
      : '<button class="pu-boton" data-p="empezar">Entrar o crear cuenta</button>'+
        (g ? botonGoogle() : ''))+
    /* en la beta (publicar.py pone window.DTRACK_BETA) también se ofrece, para probar sin código */
    (enVisor()
      ? '<button class="pu-enlace" data-p="prueba">Entrar sin cuenta · modo prueba</button>'+
        (enVisor() ? '<p class="pu-nota">Aquí dentro no hay conexión con el servidor, así que la cuenta no funciona. El modo prueba usa datos de mentira.</p>' : '')
      : '')+
  '</div>';
}

function repintaPie(){
  var d=puertaEl(); if(!d || d.dataset.base!=="1") return;
  var pie=d.querySelector(".car-pie"); if(!pie) return;
  var t=document.createElement("div"); t.innerHTML=pieHTML();
  pie.parentNode.replaceChild(t.firstChild, pie);
}
var peakFondos=[];
function peakFondosPara(){ peakFondos.forEach(function(a){ a.stop(); }); peakFondos=[]; }
function peakFondosArranca(d){
  peakFondosPara();
  if(!window.PeakAnim || !window.Path2D) return;
  var oscuro=document.documentElement.classList.contains("dark");
  d.querySelectorAll(".bv-peak-c").forEach(function(c){ peakFondos.push(PeakAnim(c,{ pattern:"palabras", dark:oscuro })); });
}
function pintarBase(d){
  if(d.dataset.base==="1") return;
  d.className="bienve";
  d.innerHTML = carHTML() + pieHTML();
  d.dataset.base="1";
  peakFondosArranca(d);
  carGestos(); carPinta(false); carArranca();
}

function contenidoPaso(){
  if(puertaPaso==="correo"){
    return '<h1 class="pu-t display">Entra en tu cuenta</h1>'+
      '<p class="pu-sub">Te mandamos un código al correo. No hay contraseña que recordar.</p>'+
      '<p class="pu-nota" style="text-align:left;margin-top:6px">Hace falta tener 14 años o más. Al seguir aceptas la <button class="pu-link" data-p="ver-priv">política de privacidad</button>.</p>'+
      (googleActivo() ? botonGoogle()+'<div class="pu-o"><span>o con tu correo</span></div>' : '')+
      '<input id="p-correo" class="pu-campo" type="email" inputmode="email" autocomplete="email" '+
        'autocapitalize="off" autocorrect="off" placeholder="tucorreo@gmail.com" value="'+esc(puertaCorreo)+'">'+
      puertaError_()+
      '<button class="pu-boton" data-p="enviar"'+(puertaCargando?' disabled':'')+'>'+
        (puertaCargando?"Enviando…":"Enviarme el código")+'</button>';
  }
  if(puertaPaso==="codigo"){
    return '<h1 class="pu-t display">Mira tu correo</h1>'+
      '<p class="pu-sub">Hemos mandado un código a <b>'+esc(puertaCorreo)+'</b>. Si no lo ves, mira en spam.</p>'+
      '<input id="p-codigo" class="pu-campo pu-codigo num" type="text" inputmode="numeric" autocomplete="one-time-code" '+
        'maxlength="10" placeholder="Código">'+
      puertaError_()+
      '<button class="pu-boton" data-p="verificar"'+(puertaCargando?' disabled':'')+'>'+
        (puertaCargando?"Comprobando…":"Entrar")+'</button>'+
      '<div class="pu-fila-enlaces">'+
        '<button class="pu-enlace" data-p="otro">Otro correo</button>'+
        '<span class="t3">·</span>'+
        '<button id="p-reenviar" class="pu-enlace" data-p="reenviar"'+(puertaReenvio>0?' disabled':'')+'>'+
          (puertaReenvio>0?("Reenviar en "+puertaReenvio+" s"):"Reenviar el código")+'</button>'+
      '</div>';
  }
  if(puertaPaso==="google"){
    return '<h1 class="pu-t display">Entrando con Google</h1>'+
      '<p class="pu-sub">Termina en la ventana de Google. Al acabar, vuelve aquí y entrarás solo.</p>'+
      '<div class="pu-espera" aria-hidden="true"><i></i></div>'+
      puertaError_()+
      '<button class="pu-enlace" data-p="cancelar-google" style="margin-top:6px">Cancelar</button>';
  }
  if(puertaPaso==="google-vuelta"){
    return '<h1 class="pu-t display">Entrando…</h1>'+
      '<p class="pu-sub">Un momento: estamos terminando de entrar con tu cuenta de Google.</p>'+
      '<div class="pu-espera" aria-hidden="true"><i></i></div>';
  }
  if(puertaPaso==="perfil"){
    var rec=perfilRecordado();
    return '<h1 class="pu-t display">Ya casi</h1>'+
      '<p class="pu-sub">Es una cuenta nueva para <b>'+esc(puertaCorreo||(ses&&ses.email)||"")+'</b>. Elige cómo te verán en tu grupo.</p>'+
      '<div class="pu-grupo">'+
        '<label class="pu-fila"><span>Usuario</span>'+
          '<input id="p-usuario" type="text" autocapitalize="words" autocorrect="off" maxlength="16" placeholder="Carlos" value="'+esc(rec.usuario||nombreGoogle||"")+'"></label>'+
        '<label class="pu-fila"><span>Nacimiento</span>'+
          '<input id="p-nac" type="date" max="'+today()+'" value="'+esc(rec.nacimiento||"")+'"></label>'+
      '</div>'+
      '<p class="pu-nota" style="text-align:left;margin-top:10px">La fecha solo se usa para comprobar la edad. No se le enseña a nadie.</p>'+
      puertaError_()+
      '<button class="pu-boton" data-p="crear"'+(puertaCargando?' disabled':'')+'>'+
        (puertaCargando?"Creando…":"Crear mi cuenta")+'</button>'+
      '<button class="pu-enlace" data-p="otro" style="margin-top:14px">¿No es tu correo de siempre? Entrar con otro</button>';
  }
  if(puertaPaso==="privacidad" && typeof privacidadHTML==="function"){
    return '<h1 class="pu-t display">Privacidad</h1>'+privacidadHTML()+
      '<button class="pu-boton" data-p="empezar" style="margin-top:18px">Volver</button>';
  }
  if(puertaPaso==="menor"){
    return '<h1 class="pu-t display">Todavía no</h1>'+
      '<p class="pu-sub">Peak pide 14 años o más para tener cuenta, porque incluye grupos y chat con otras personas. Vuelve cuando los cumplas.</p>'+
      '<button class="pu-enlace" data-p="otro" style="margin-top:18px">Usar otro correo</button>';
  }
  return "";
}

function hojaSeCierra(){ return puertaPaso==="correo" || puertaPaso==="codigo" || puertaPaso==="privacidad" || puertaPaso==="google"; }

function pintarHoja(d){
  var h=document.getElementById("puerta-hoja");
  if(puertaPaso==="bienvenida"){ quitarHoja(); return; }
  /* si cambia si se puede cerrar o no (p. ej. de «Entrando…» a un error), se rehace */
  if(h && h.dataset.cierra!==String(hojaSeCierra())){ if(h.parentNode) h.parentNode.removeChild(h); h=null; }
  if(!h){
    h=document.createElement("div"); h.id="puerta-hoja"; h.dataset.cierra=String(hojaSeCierra());
    h.innerHTML='<div class="puerta-velo"'+(hojaSeCierra()?' data-p="cerrar-hoja"':'')+'></div>'+
      '<div class="puerta-tarjeta glass">'+
        (hojaSeCierra()
          ? '<button class="hoja-x" data-p="cerrar-hoja" aria-label="Cerrar">'+
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">'+
              '<path d="M6 6l12 12M18 6L6 18"/></svg></button>'
          : '')+
        '<div id="puerta-cuerpo"></div></div>';
    d.appendChild(h);
    naceHoja(d, h);
    ajustaHoja();
    if(window.visualViewport){
      window.visualViewport.addEventListener("resize", ajustaHoja);
      window.visualViewport.addEventListener("scroll", ajustaHoja);
    }
  }
  var cuerpo=document.getElementById("puerta-cuerpo");
  if(cuerpo) cuerpo.innerHTML=contenidoPaso();
  var f=h.querySelector("#p-correo,#p-codigo,#p-usuario");
  if(f && !puertaCargando) setTimeout(function(){ try{ f.focus(); }catch(e){} }, 220);
}

/* la ventana crece desde el botón que la abrió, no desde el centro a secas */
function naceHoja(d, h){
  var tarjeta = h.querySelector(".puerta-tarjeta");
  var boton = d.querySelector(".car-pie .pu-boton") || d.querySelector(".car-pie button");
  if(tarjeta && boton){
    try{
      var rb = boton.getBoundingClientRect(), rt = tarjeta.getBoundingClientRect();
      tarjeta.style.transformOrigin =
        (rb.left + rb.width/2 - rt.left) + "px " + (rb.top + rb.height/2 - rt.top) + "px";
    }catch(e){}
  }
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){ if(tarjeta) tarjeta.classList.add("entra"); });
  });
}

/* con el teclado abierto, la ventana se recoloca en el hueco que queda */
function ajustaHoja(){
  var h=document.getElementById("puerta-hoja"); if(!h) return;
  var vv=window.visualViewport;
  var tapado = vv ? Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)) : 0;
  h.style.paddingBottom = tapado>60 ? tapado+"px" : "";
}

function quitarHoja(){
  var h=document.getElementById("puerta-hoja"); if(!h) return;
  h.id="";
  h.classList.add("fuera");
  if(window.visualViewport){
    window.visualViewport.removeEventListener("resize", ajustaHoja);
    window.visualViewport.removeEventListener("scroll", ajustaHoja);
  }
  setTimeout(function(){ if(h.parentNode) h.parentNode.removeChild(h); }, 300);
}

function pintarPuerta(){
  var d=puertaEl(); if(!d) return;
  pintarBase(d);
  pintarHoja(d);
}

function puertaClic(ev){
  var b=ev.target.closest?ev.target.closest("[data-p]"):null; if(!b) return;
  var a=b.dataset.p;
  if(a==="enviar")    return pasoEnviar();
  if(a==="verificar") return pasoVerificar();
  if(a==="crear")     return pasoCrear();
  if(a==="reenviar")  return pasoEnviar(true);
  if(a==="prueba"){ entrarDePrueba(); return; }
  if(a==="google"){ entrarConGoogle(); return; }
  if(a==="cancelar-google"){ clearInterval(googleT); puertaError=""; puertaPaso="bienvenida"; pintarPuerta(); return; }
  if(a==="cerrar-hoja"){ if(hojaSeCierra()){ clearInterval(googleT); puertaError=""; puertaPaso="bienvenida"; pintarPuerta(); } return; }
  if(a==="ver-priv"){ var ic=document.getElementById("p-correo"); if(ic) puertaCorreo=(ic.value||"").trim(); puertaError=""; puertaPaso="privacidad"; pintarPuerta(); return; }
  if(a==="empezar"){ puertaError=""; puertaPaso="correo"; pintarPuerta(); return; }
  if(a==="otro-correo"){ puertaError=""; puertaCorreo=""; puertaPaso="correo"; pintarPuerta(); return; }
  if(a==="recordado"){ puertaCorreo=ultimoCorreo(); puertaError=""; pasoEnviar(); return; }
  if(a==="otro"){ sesGuardar(null); puertaError=""; puertaCorreo=""; puertaPaso="correo"; pintarPuerta(); return; }
}
function puertaAvanzar(){
  if(puertaCargando) return;
  if(puertaPaso==="correo") pasoEnviar();
  else if(puertaPaso==="codigo") pasoVerificar();
  else if(puertaPaso==="perfil") pasoCrear();
}

function cuentaAtras(){
  clearInterval(puertaCrono); puertaReenvio=60;
  puertaCrono=setInterval(function(){
    puertaReenvio--;
    if(puertaReenvio<=0){ clearInterval(puertaCrono); puertaReenvio=0; }
    /* solo cambia el botón: repintar la hoja entera borraba el código y cerraba el teclado */
    var r=document.getElementById("p-reenviar"); if(!r || puertaPaso!=="codigo") return;
    r.disabled=puertaReenvio>0;
    r.textContent=puertaReenvio>0?("Reenviar en "+puertaReenvio+" s"):"Reenviar el código";
  }, 1000);
}

/* el último código pedido (correo y hora): si Supabase no deja pedir otro tan
   seguido, se va directo a escribir el que ya llegó */
var codigoPedido={ correo:"", t:0 };
function pasoEnviar(reenvio){
  if(puertaCargando) return;   /* dos toques seguidos no piden dos códigos */
  var i=document.getElementById("p-correo");
  var v=(i && puertaPaso==="correo") ? (i.value||"").trim().toLowerCase() : puertaCorreo;
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){ puertaError="Ese correo no tiene buena pinta. Revísalo."; if(puertaPaso==="bienvenida") puertaPaso="correo"; pintarPuerta(); return; }
  puertaCorreo=v; puertaError=""; puertaCargando=true; pintarPuerta();
  /* desde «Entrar como…» no hay hoja todavía: que el botón diga que está enviando */
  var rb=document.querySelector('[data-p="recordado"]'), rbSub=rb&&rb.querySelector(".pu-boton-sub"), rbAntes=rbSub?rbSub.textContent:"";
  if(rb){ rb.disabled=true; if(rbSub) rbSub.textContent=tr("Enviando código…"); }
  function suelta(){ if(rb){ rb.disabled=false; if(rbSub) rbSub.textContent=rbAntes; } }
  pedirCodigo(v).then(function(r){
    puertaCargando=false; suelta();
    if(r.ok){ codigoPedido={ correo:v, t:Date.now() }; puertaPaso="codigo"; cuentaAtras(); pintarPuerta(); return; }
    var m=(r.datos&&(r.datos.msg||r.datos.error_description||r.datos.message))||"";
    if(r.estado===429){
      /* Supabase no deja pedir otro código hasta pasado un rato: el anterior sigue valiendo */
      puertaPaso="codigo";
      puertaError="Ya te hemos mandado un código hace poco: usa el último que te haya llegado. Si no lo tienes, pide otro en un minuto.";
      if(!codigoPedido.t || codigoPedido.correo!==v) cuentaAtras();
      pintarPuerta(); return;
    }
    puertaError=m||"No se ha podido mandar el código. Comprueba la conexión.";
    if(puertaPaso==="bienvenida") puertaPaso="correo";   /* para que el error se vea */
    pintarPuerta();
  }).catch(function(){
    puertaCargando=false; suelta(); puertaError="Sin conexión. Inténtalo otra vez.";
    if(puertaPaso==="bienvenida") puertaPaso="correo";
    pintarPuerta();
  });
}

function pasoVerificar(){
  var i=document.getElementById("p-codigo");
  var v=i ? (i.value||"").replace(/\D/g,"") : "";
  /* los códigos de Supabase pueden tener de 6 a 10 cifras */
  if(v.length<6 || v.length>10){ puertaError="Escribe el código entero que te ha llegado."; pintarPuerta(); return; }
  puertaError=""; puertaCargando=true; pintarPuerta();
  verificarCodigo(puertaCorreo, v).then(function(r){
    puertaCargando=false;
    if(!r || !r.ok || !r.datos || !r.datos.access_token){
      var ec=(r && r.datos && r.datos.error_code)||"", m=(r && r.datos && (r.datos.msg||r.datos.message))||"";
      puertaError = r && r.estado===429 ? "Demasiados intentos. Espera un minuto y vuelve a probar."
        : ec==="otp_expired" ? "Ese código no vale o ha caducado. Usa el último que te haya llegado o pide otro."
        : ("No se ha podido entrar"+(m?": "+m:".")+" Pide otro código.");
      pintarPuerta(); return;
    }
    guardarSesion(r.datos);
    ultimoCorreoSet(puertaCorreo); ultimoMetodoSet("correo");
    leerPerfilConReintento().then(function(p){
      if(p){ cerrarPuerta(); entrarApp(); }
      else if(p===null){ puertaPaso="perfil"; pintarPuerta(); }
      else { puertaError="No se ha podido leer tu cuenta. Revisa la conexión y pulsa Entrar otra vez."; pintarPuerta(); }
    });
  }).catch(function(){
    puertaCargando=false; puertaError="Sin conexión. Inténtalo otra vez."; pintarPuerta();
  });
}

function edadEn(fecha){
  if(!fecha) return -1;
  var n=new Date(fecha+"T00:00:00"), h=new Date();
  var a=h.getFullYear()-n.getFullYear();
  var m=h.getMonth()-n.getMonth();
  if(m<0 || (m===0 && h.getDate()<n.getDate())) a--;
  return a;
}

function pasoCrear(){
  var u=document.getElementById("p-usuario"), n=document.getElementById("p-nac");
  var us=u?(u.value||"").trim():"", na=n?(n.value||""):"";
  if(!/^[A-Za-z0-9._-]{3,16}$/.test(us)){
    puertaError="El nombre son de 3 a 16 caracteres: letras, números, punto, guion o guion bajo."; pintarPuerta(); return;
  }
  if(!na){ puertaError="Pon tu fecha de nacimiento."; pintarPuerta(); return; }
  var e=edadEn(na);
  if(e<0 || e>120){ puertaError="Esa fecha no puede ser."; pintarPuerta(); return; }
  if(e<14){ puertaPaso="menor"; sesGuardar(null); pintarPuerta(); return; }
  puertaError=""; puertaCargando=true; pintarPuerta();
  crearPerfil(us, na).then(function(r){
    puertaCargando=false;
    if(r.ok){ perfil={usuario:us, nacimiento:na}; perfilRecuerda(perfil); cerrarPuerta(); entrarApp(); return; }
    var cod=(r.datos&&r.datos.code)||"", msg=(r.datos&&(r.datos.message||r.datos.details))||"";
    if(cod==="23505" && /pkey|\(id\)/.test(msg)){
      /* esta cuenta ya tenía perfil: se lee y se entra */
      leerPerfil().then(function(p){ if(p){ cerrarPuerta(); entrarApp(); } else { puertaError="No se ha podido entrar. Inténtalo otra vez."; pintarPuerta(); } });
      return;
    }
    if(cod==="23505") puertaError="Ese nombre ya está cogido. Prueba otro.";
    else if((r.datos&&r.datos.message||"").indexOf("14")>=0) puertaPaso="menor";
    else puertaError="No se ha podido crear la cuenta. Inténtalo otra vez.";
    pintarPuerta();
  }).catch(function(){
    puertaCargando=false; puertaError="Sin conexión. Inténtalo otra vez."; pintarPuerta();
  });
}

/* ── entrar y salir ──────────────────────────────────────── */
/* el tutorial no puede salir con la puerta puesta: se lanza al entrar */
function tourSiToca(){
  if(S.tour || puertaEl()) return;
  setTimeout(function(){
    if(puertaEl() || S.tour) return;
    if(!S.onb && typeof abrirPreguntas==="function"){ abrirPreguntas(function(){ tourStep=0; renderTour(); }); return; }
    tourStep=0; renderTour();
  }, 650);
}
function entrarApp(){
  cerrarPuerta();
  render();
  tourSiToca();
  sincronizarAlAbrir();
}

var salirArmado=0;
function salirCuenta(){
  function fin(){
    sesGuardar(null); perfil=null;
    try{ localStorage.removeItem(SYNCKEY); localStorage.removeItem("dtrack-grupo-cache"); }catch(e){}
    location.reload();
  }
  if(!ses || ses.demo){ fin(); return; }
  /* dos toques, para no salir sin querer */
  if(Date.now()-salirArmado>4000){ salirArmado=Date.now(); avisoNube("Toca otra vez «Cerrar sesión» para salir. Tus datos se quedan guardados."); return; }
  avisoNube("Guardando y cerrando la sesión…");
  var tarea=(nubeSucia ? subirDatos() : Promise.resolve(true)).then(function(){
    /* el testigo de esta sesión deja de valer también en el servidor */
    return pedir("/auth/v1/logout?scope=local", { method:"POST" }).catch(function(){});
  });
  Promise.race([tarea, new Promise(function(ok){ setTimeout(ok, 5000); })]).then(fin, fin);
}

function arrancarCuenta(){
  if(volverDeGoogle()) return;   /* se vuelve de Google con un código: se termina de entrar */
  ses=sesLeer();
  if(ses && ses.demo){
    perfil = { usuario:"carlos", nacimiento:"", avatar:"" };
    GRUPO=null; render(); tourSiToca(); return;
  }
  if(!ses){ abrirPuerta("bienvenida"); return; }
  /* con sesión guardada se entra ya, aunque no haya red */
  leerPerfilConReintento().then(function(p){
    if(p===false){ tourSiToca(); return; }   /* sin red o fallo del servidor: adentro con lo local; no se piden otra vez los datos */
    if(p) { tourSiToca(); sincronizarAlAbrir(); return; }
    if(!ses){ abrirPuerta("bienvenida"); return; }
    puertaCorreo=ses.email||""; abrirPuerta("perfil");
  }).catch(function(){});
}

/* ════════ entrar con Google ════════
   Lo hace Supabase (Authentication → Sign In / Providers → Google). Si no está
   activado allí, el botón no sale. Flujo PKCE: el código que vuelve en la dirección
   solo se puede canjear con una clave que se queda en este móvil. En el iPhone con
   la app en la pantalla de inicio, salir a otra web abre un Safari aparte (con otro
   almacén) y la sesión se perdería: por eso allí se usa una ventana de la propia
   app, que al terminar guarda la sesión y se cierra. */
var GKEY="dtrack-google", PKCEKEY="dtrack-pkce", METKEY="dtrack-metodo";
var googleT=null, nombreGoogle="";
var ICO_GOOGLE='<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
function botonGoogle(){ return '<button class="pu-google" data-p="google">'+ICO_GOOGLE+'<span>Continuar con Google</span></button>'; }
function googleActivo(){ try{ var g=JSON.parse(localStorage.getItem(GKEY)||"null"); return !!(g && g.on); }catch(e){ return false; } }
function googleMira(){
  return pedir("/auth/v1/settings", { anon:true }).then(function(r){
    if(!r.ok || !r.datos || !r.datos.external) return googleActivo();
    var on=!!r.datos.external.google;
    try{ localStorage.setItem(GKEY, JSON.stringify({ on:on, t:Date.now() })); }catch(e){}
    return on;
  }).catch(function(){ return googleActivo(); });
}
function ultimoMetodo(){ try{ return localStorage.getItem(METKEY)||""; }catch(e){ return ""; } }
function ultimoMetodoSet(m){ try{ localStorage.setItem(METKEY, m); }catch(e){} }
function b64url(bytes){ var t=""; for(var i=0;i<bytes.length;i++) t+=String.fromCharCode(bytes[i]); return btoa(t).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); }
/* las pruebas automáticas (carpeta pruebas/) simulan la dirección y la salida a Google */
function urlActual(){ return window.DTRACK_URL_PRUEBA || location.href; }
function irA(url){ if(typeof window.DTRACK_IR_PRUEBA==="function"){ window.DTRACK_IR_PRUEBA(url); return; } location.href=url; }
function iosInstalada(){ return (typeof esIOS==="function" && esIOS()) && (typeof instalada==="function" && instalada()); }
/* un error en la puerta siempre se ve: si no hay hoja, se abre la del correo */
function puertaFallo(msg){
  clearInterval(googleT); puertaCargando=false; puertaError=msg;
  if(puertaPaso==="bienvenida" || puertaPaso==="google" || puertaPaso==="google-vuelta") puertaPaso="correo";
  if(!puertaEl()) abrirPuerta(puertaPaso); else pintarPuerta();
}
function entrarConGoogle(){
  if(!window.crypto || !crypto.subtle || !window.TextEncoder || !window.isSecureContext){
    puertaFallo("Este navegador no deja entrar con Google. Entra con tu correo."); return;
  }
  /* la ventana se abre ya, con el toque: si se abre después, el móvil la bloquea */
  var ventana=null;
  if(iosInstalada()){ try{ ventana=window.open("about:blank", "_blank"); }catch(e){ ventana=null; } }
  var bytes=new Uint8Array(32); crypto.getRandomValues(bytes);
  var clave=b64url(bytes);
  crypto.subtle.digest("SHA-256", new TextEncoder().encode(clave)).then(function(h){
    try{ localStorage.setItem(PKCEKEY, JSON.stringify({ v:clave, t:Date.now(), ventana:!!ventana })); }catch(e){}
    /* dentro de la app de iPhone Google no deja entrar desde la web: lo abre iOS y vuelve por peak://login */
    var vuelta=(window.peakNativo && window.peakNativo.login) ? "peak://login" : location.origin+location.pathname;
    var url=NUBE_URL+"/auth/v1/authorize?provider=google"+
      "&redirect_to="+encodeURIComponent(vuelta)+
      "&code_challenge="+b64url(new Uint8Array(h))+"&code_challenge_method=s256";
    if(vuelta!==location.origin+location.pathname) window.peakNativo.login(url);
    else if(ventana){ ventana.location.href=url; googleEspera(); }
    else irA(url);
  }).catch(function(){
    if(ventana){ try{ ventana.close(); }catch(e){} }
    puertaFallo("No se ha podido abrir Google. Prueba otra vez o entra con tu correo.");
  });
}
/* la app espera a que la ventana de Google deje la sesión guardada */
function googleEspera(){
  puertaError=""; puertaPaso="google"; pintarPuerta();
  clearInterval(googleT); var t0=Date.now();
  googleT=setInterval(function(){
    var sg=sesLeer();
    if(sg && sg.uid && !sg.demo && sg.access_token){
      clearInterval(googleT); ses=sg;
      if(sg.email){ ultimoCorreoSet(sg.email); puertaCorreo=sg.email; }
      ultimoMetodoSet("google"); trasEntrar(); return;
    }
    if(Date.now()-t0>10*60000){ clearInterval(googleT); puertaFallo("No ha llegado la respuesta de Google. Vuelve a intentarlo."); }
  }, 1000);
}
function nombreDeGoogle(u){
  var m=(u && u.user_metadata)||{}, n=String(m.given_name||m.full_name||m.name||"").trim().split(/\s+/)[0]||"";
  try{ n=n.normalize("NFD").replace(/[̀-ͯ]/g,""); }catch(e){}
  n=n.replace(/[^A-Za-z0-9._-]/g,"").slice(0,16);
  return n.length>=3 ? n : "";
}
/* después de entrar (con código o con Google): a la app, o a «Ya casi» si la cuenta es nueva */
function trasEntrar(){
  puertaAviso="";
  leerPerfilConReintento().then(function(p){
    puertaCargando=false;
    if(p){ cerrarPuerta(); entrarApp(); return; }
    if(p===null){ puertaCorreo=(ses&&ses.email)||puertaCorreo; puertaError=""; puertaPaso="perfil"; if(!puertaEl()) abrirPuerta("perfil"); else pintarPuerta(); return; }
    puertaFallo("No se ha podido leer tu cuenta. Revisa la conexión y vuelve a intentarlo.");
  });
}
/* se vuelve de Google: ?code=… (o un error) en la dirección */
function volverDeGoogle(){
  var q, hq;
  try{ var u=new URL(urlActual()); q=new URLSearchParams(u.search); hq=new URLSearchParams((u.hash||"").replace(/^#/,"")); }catch(e){ return false; }
  var code=q.get("code"), err=q.get("error")||hq.get("error"), desc=q.get("error_description")||hq.get("error_description"), at=hq.get("access_token");
  if(!code && !err && !at) return false;
  try{ history.replaceState(null, "", location.pathname); }catch(e){}
  var g=null; try{ g=JSON.parse(localStorage.getItem(PKCEKEY)||"null"); localStorage.removeItem(PKCEKEY); }catch(e){}
  var enVentana=!!(g && g.ventana);
  abrirPuerta("google-vuelta");
  if(err){ puertaFallo(err==="access_denied" ? "Has cancelado el inicio con Google." : ("Google no ha dejado entrar"+(desc?": "+desc:".")+" Prueba otra vez o entra con tu correo.")); return true; }
  var canje;
  if(code){
    if(!g || !g.v || Date.now()-g.t>30*60000){ puertaFallo("Este inicio con Google ha caducado. Vuelve a pulsar «Continuar con Google»."); return true; }
    canje=pedir("/auth/v1/token?grant_type=pkce", { method:"POST", anon:true, body:{ auth_code:code, code_verifier:g.v } });
  } else {
    /* por si Supabase devuelve la sesión directamente (flujo implícito) */
    canje=pedir("/auth/v1/user", { token:at }).then(function(r){
      if(!r.ok || !r.datos || !r.datos.id) return r;
      return { ok:true, estado:200, datos:{ access_token:at, refresh_token:hq.get("refresh_token"), expires_in:+hq.get("expires_in")||3600, user:r.datos } };
    });
  }
  canje.then(function(r){
    if(!r || !r.ok || !r.datos || !r.datos.access_token){
      var m=(r && r.datos && (r.datos.msg||r.datos.error_description||r.datos.message))||"";
      puertaFallo("No se ha podido entrar con Google"+(m?": "+m:".")+" Prueba otra vez o entra con tu correo."); return;
    }
    guardarSesion(r.datos);
    var u=r.datos.user||{};
    if(u.email){ ultimoCorreoSet(u.email); puertaCorreo=u.email; }
    ultimoMetodoSet("google"); nombreGoogle=nombreDeGoogle(u);
    if(enVentana){
      /* era la ventanita del iPhone: la app de verdad ya ve la sesión; esta se cierra */
      setTimeout(function(){ try{ window.close(); }catch(e){} }, 150);
      setTimeout(trasEntrar, 900);   /* si no se ha podido cerrar, se entra aquí */
    } else trasEntrar();
  }).catch(function(){ puertaFallo("Sin conexión. Inténtalo otra vez."); });
  return true;
}

/* ════════ elegir versión cuando las dos han cambiado ════════ */
function fechaBonita(d){
  if(!d) return "nunca";
  try{
    var x=new Date(d.length>10?d:d+"T00:00:00");
    return x.toLocaleDateString(LOCALE,{day:"numeric",month:"short"});
  }catch(e){ return d; }
}
function tarjetaVersion(t, r, boton, act){
  return '<div class="soft" style="padding:15px 16px;border-radius:16px">'+
    '<p class="eyebrow" style="margin-bottom:9px">'+t+'</p>'+
    '<p style="font-size:13px;line-height:1.7">'+
      '<b>'+(r?r.dias:0)+'</b> días apuntados<br>'+
      '<b>'+(r?r.tareas:0)+'</b> tareas ('+(r?r.hechas:0)+' hechas)<br>'+
      '<span class="t3">último día: '+fechaBonita(r?r.ultimo:"")+'</span></p>'+
    '<button class="btn btn-quiet w-full" data-c="'+act+'" style="margin-top:12px">'+boton+'</button>'+
  '</div>';
}
function preguntarConflicto(nube, aqui, alla){
  var d=document.createElement("div"); d.id="conflicto";
  d.style.cssText="position:fixed;inset:0;z-index:190;background:var(--bg);overflow-y:auto;"+
    "display:flex;align-items:center;justify-content:center;"+
    "padding:calc(28px + env(safe-area-inset-top)) 18px calc(28px + env(safe-area-inset-bottom))";
  d.innerHTML='<div class="glass rounded-[24px] pad" style="width:100%;max-width:420px">'+
    marcaPeak()+
    '<h1 class="display" style="font-size:24px;font-weight:700;letter-spacing:-.032em;line-height:1.2">Hay dos versiones</h1>'+
    '<p class="t2" style="margin-top:9px;font-size:13.5px;line-height:1.55">Lo que hay en este móvil no coincide con lo que hay guardado en tu cuenta. Elige con cuál te quedas: la otra se pierde.</p>'+
    '<div style="display:grid;gap:11px;margin-top:18px">'+
      tarjetaVersion("En este dispositivo", aqui, "Quedarme con esta", "local")+
      tarjetaVersion("En tu cuenta", alla, "Traer esta", "nube")+
    '</div>';
  document.body.appendChild(d);
  d.addEventListener("click", function(ev){
    var b=ev.target.closest?ev.target.closest("[data-c]"):null; if(!b) return;
    if(b.dataset.c==="local"){
      verLocalSet(nube.version);
      d.parentNode.removeChild(d);
      subirDatos().then(function(){ avisoNube("Guardado lo de este dispositivo."); });
    } else {
      aplicarEstado(nube.estado, nube.version);
    }
  });
}


/* ════════ foto de perfil ════════ */
function tokenFresco(){
  if(ses && ses.caduca && ses.caduca - Date.now() < 90000) return refrescar();
  return Promise.resolve(true);
}
function elegirFoto(){
  if(esPrueba()){ avisoNube("En modo prueba no se pueden subir fotos."); return; }
  var i=document.createElement("input");
  i.type="file"; i.accept="image/*";
  i.style.cssText="position:fixed;left:-9999px";
  document.body.appendChild(i);
  i.addEventListener("change", function(){
    var f=i.files && i.files[0];
    if(i.parentNode) i.parentNode.removeChild(i);
    if(f) subirFoto(f);
  });
  i.click();
}
function subirFoto(archivo){
  if(!ses) return;
  if(archivo.size > 12*1024*1024){ avisoNube("Esa foto pesa demasiado."); return; }
  avisoNube("Subiendo la foto…");
  var lector=new FileReader();
  lector.onerror=function(){ avisoNube("No he podido leer esa foto."); };
  lector.onload=function(){
    var im=new Image();
    im.onerror=function(){ avisoNube("Ese archivo no es una imagen."); };
    im.onload=function(){
      /* se recorta cuadrada por el centro y se deja en 256 px: no hace falta más */
      var L=256, c=document.createElement("canvas"); c.width=L; c.height=L;
      var x=c.getContext("2d"); if(!x) return;
      var lado=Math.min(im.width, im.height);
      x.drawImage(im, (im.width-lado)/2, (im.height-lado)/2, lado, lado, 0, 0, L, L);
      c.toBlob(function(b){
        if(!b){ avisoNube("No he podido preparar la foto."); return; }
        tokenFresco().then(function(){
          return fetch(NUBE_URL+"/storage/v1/object/avatares/"+ses.uid+"/foto.jpg", {
            method:"POST",
            headers:{ "apikey":NUBE_KEY, "Authorization":"Bearer "+ses.access_token,
                      "Content-Type":"image/jpeg", "x-upsert":"true" },
            body: b
          });
        }).then(function(r){
          if(!r || !r.ok) throw 0;
          var url=NUBE_URL+"/storage/v1/object/public/avatares/"+ses.uid+"/foto.jpg?v="+Date.now();
          return pedirAuth("/rest/v1/perfiles?id=eq."+ses.uid, {method:"PATCH", body:{avatar:url}})
            .then(function(r2){
              if(!r2.ok) throw 0;
              if(!perfil) perfil={};
              perfil.avatar=url;
              if(view==="social") rSocial();
              avisoNube("Foto puesta.");
            });
        }).catch(function(){ avisoNube("No se ha podido subir la foto."); });
      }, "image/jpeg", 0.86);
    };
    im.src=lector.result;
  };
  lector.readAsDataURL(archivo);
}
function quitarFoto(){
  if(!ses) return;
  tokenFresco().then(function(){
    return fetch(NUBE_URL+"/storage/v1/object/avatares/"+ses.uid+"/foto.jpg", {
      method:"DELETE",
      headers:{ "apikey":NUBE_KEY, "Authorization":"Bearer "+ses.access_token }
    }).catch(function(){});
  }).then(function(){
    return pedirAuth("/rest/v1/perfiles?id=eq."+ses.uid, {method:"PATCH", body:{avatar:null}});
  }).then(function(){
    if(perfil) perfil.avatar="";
    if(view==="social") rSocial();
    avisoNube("Foto quitada.");
  }).catch(function(){ avisoNube("No se ha podido quitar."); });
}

/* ════════ tarjeta de cuenta en la pestaña Social ════════ */
function tarjetaCuenta(){
  if(!ses) return "";
  var u=perfil&&perfil.usuario ? perfil.usuario : "—";
  var foto=perfil&&perfil.avatar ? perfil.avatar : "";
  return '<div class="glass rounded-[24px] pad">'+
    '<div style="display:flex;align-items:center;gap:13px">'+
      '<button data-act="nube-foto" aria-label="Cambiar foto" style="width:52px;height:52px;border-radius:16px;flex:0 0 auto;'+
        'overflow:hidden;position:relative;display:flex;align-items:center;justify-content:center;'+
        (foto ? 'background:var(--fill)' : 'background:var(--accent-soft);color:var(--accent)')+
        ';box-shadow:inset 0 0 0 1px var(--hairline-2)">'+
        (foto
          ? '<img src="'+esc(foto)+'" alt="" style="width:100%;height:100%;object-fit:cover;display:block">'
          : '<span class="display" style="font-weight:800;font-size:20px">'+esc(u.charAt(0).toUpperCase())+'</span>')+
        '<span style="position:absolute;right:0;bottom:0;width:18px;height:18px;border-radius:99px;'+
          'display:flex;align-items:center;justify-content:center;background:var(--accent);color:var(--on-accent);'+
          'box-shadow:0 0 0 2px var(--glass-bg)">'+
          '<svg viewBox="0 0 24 24" style="width:10px;height:10px" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>'+
        '</span></button>'+
      '<div style="min-width:0;flex:1">'+
        '<p class="display" style="font-size:17px;font-weight:700;letter-spacing:-.02em">'+esc(u)+'</p>'+
        '<p class="t3" style="font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(ses.email||"")+'</p>'+
      '</div>'+
    '</div>'+
    '<div class="soft" style="margin-top:16px;padding:12px 14px;border-radius:14px;display:flex;'+
      'align-items:center;justify-content:space-between;gap:10px">'+
      '<span class="t2" style="font-size:12.5px">'+(esPrueba()?"Modo prueba":"Tus datos")+'</span>'+
      '<span id="nube-estado" class="t3" style="font-size:12px">al día</span>'+
    '</div>'+
    '<p class="t3" style="margin-top:10px;font-size:11.5px;line-height:1.5">'+
      (foto ? 'Toca la foto para cambiarla. <button data-act="nube-quitafoto" style="text-decoration:underline;color:var(--t3)">Quitarla</button>'
            : 'Toca el cuadro para ponerte una foto.')+'</p>'+
    '<div style="display:flex;gap:10px;margin-top:12px">'+
      '<button class="btn btn-quiet" data-act="nube-subir" style="flex:1">Guardar ahora</button>'+
      '<button class="btn btn-danger" data-act="nube-salir" style="flex:1">'+(esPrueba()?"Salir":"Cerrar sesión")+'</button>'+
    '</div>'+
  '</div>';
}

