/* Se actualiza sola: al volver a la app (desde la pantalla de inicio o desde
   otra app) mira si hay una versión nueva publicada y, si la hay, recarga.
   Así no hace falta cerrarla del todo para ver los cambios. */
if("serviceWorker" in navigator){
  window.addEventListener("load",function(){ navigator.serviceWorker.register("sw.js").catch(function(){}); });
  (function(){
    var habia=!!navigator.serviceWorker.controller, recargando=false, firma=null, oculta=0;
    function recarga(){ if(recargando) return; recargando=true; location.reload(); }
    function leeFirma(){
      return fetch("index.html",{ method:"HEAD", cache:"no-store" }).then(function(r){
        return r.ok ? (r.headers.get("etag") || r.headers.get("last-modified") || "") : "";
      }).catch(function(){ return ""; });
    }
    navigator.serviceWorker.addEventListener("controllerchange", function(){
      if(habia && document.visibilityState!=="visible") recarga();
      habia=true;
    });
    window.addEventListener("load", function(){ leeFirma().then(function(f){ firma=f; }); });
    document.addEventListener("visibilitychange", function(){
      if(document.visibilityState==="hidden"){ oculta=Date.now(); return; }
      if(!oculta || Date.now()-oculta<60000) return;
      navigator.serviceWorker.getRegistration().then(function(reg){ if(reg) reg.update().catch(function(){}); });
      leeFirma().then(function(f){ if(f && firma && f!==firma) recarga(); else if(f) firma=f; });
    });
  })();
}
