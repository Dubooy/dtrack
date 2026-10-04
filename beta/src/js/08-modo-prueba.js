/* ════════ modo prueba ════════
   Dentro de un visor (el artifact) no hay salida a internet: la app no puede
   hablar con el servidor. Ahí, y solo ahí, se ofrece entrar sin cuenta con
   datos de mentira, para poder mirar y tocar la parte social. */
function enVisor(){
  return document.documentElement.classList.contains("embebido");
}
function esPrueba(){ return !!(ses && ses.demo); }

function entrarDePrueba(){
  sesGuardar({ demo:true, uid:"prueba", email:"modo de prueba",
               access_token:"", refresh_token:"", caduca:0 });
  perfil = { usuario:"carlos", nacimiento:"", avatar:FOTOS_PRUEBA.carlos };
  GRUPO=null;   /* sin grupo por defecto: se crea o se une con cuenta */
  cerrarPuerta();
  render();
  tourSiToca();
  if(typeof avisoTrasTour==="function") avisoTrasTour("Modo prueba: nada se guarda en la nube."); else avisoNube("Modo prueba: nada se guarda en la nube.");
}

/* fotos provisionales de los usuarios de prueba (dibujadas, no son personas) */
