/* ════════ modo prueba ════════
   Dentro de un visor (el artifact) no hay salida a internet: la app no puede
   hablar con el servidor. Ahí, y solo ahí, se ofrece entrar sin cuenta con
   datos de mentira, para poder mirar y tocar la parte social. */
function enVisor(){
  return document.documentElement.classList.contains("embebido");
}
function esPrueba(){ return !!(ses && ses.demo); }
/* fuera del visor, el modo prueba es «probar sin cuenta»: todo se guarda en este móvil
   y, al crear la cuenta, se sube (es la primera subida de la cuenta nueva) */
function sinCuenta(){ return esPrueba() && !enVisor(); }
function nombrePrueba(){ return (S.profile && S.profile.name) || (enVisor() ? "carlos" : "tú"); }
function cuentaDesdePrueba(aviso){
  sesGuardar(null);
  try{ localStorage.removeItem(SYNCKEY); }catch(e){}
  puertaAviso=aviso||"";
  abrirPuerta("correo");
}

function entrarDePrueba(){
  var vis=enVisor();
  sesGuardar({ demo:true, uid:"prueba", email:vis?"modo de prueba":"sin cuenta",
               access_token:"", refresh_token:"", caduca:0 });
  perfil = { usuario:nombrePrueba(), nacimiento:"", avatar:vis?FOTOS_PRUEBA.carlos:"" };
  GRUPO=null;   /* sin grupo por defecto: se crea o se une con cuenta */
  cerrarPuerta();
  render();
  tourSiToca();
  var t=vis ? "Modo prueba: nada se guarda en la nube." : "Sin cuenta: lo tuyo se guarda en este móvil. Crea la cuenta cuando quieras y se sube.";
  if(typeof avisoTrasTour==="function") avisoTrasTour(t); else avisoNube(t);
}

/* fotos provisionales de los usuarios de prueba (dibujadas, no son personas) */
