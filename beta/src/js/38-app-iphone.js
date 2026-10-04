/* ════════════════════════════════════════════════════════════════
   DENTRO DE LA APP DE IPHONE (app-ios/, Capacitor)
   Ahí la barra de abajo es la de Apple (en iOS 26, con Liquid Glass) y
   la web esconde la suya. La web le cuenta a la app, por el canal
   «peakBarra», qué pestañas hay, cuál está abierta, el color de la app
   y si hay algo a pantalla completa tapando abajo (entonces la barra de
   Apple se esconde). La app llama a peakNativo.ir(vista) al tocar una
   pestaña y a peakNativo.login(url) abre el login de Google en iOS.
   ════════════════════════════════════════════════════════════════ */
(function(){
  var canal=window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.peakBarra;
  if(!canal) return;
  document.documentElement.classList.add("nativo");
  var st=document.createElement("style"); st.textContent="html.nativo nav.bottombar{ display:none!important; }";
  document.head.appendChild(st);
  window.peakNativo={
    ir:function(v){ try{ go(v); }catch(e){} setTimeout(manda, 30); },
    login:function(url){ canal.postMessage({ login:url }); }
  };
  var ultimo="";
  function tapada(){
    var el=document.elementFromPoint(window.innerWidth/2, window.innerHeight-24);
    for(; el && el!==document.body && el!==document.documentElement; el=el.parentElement){
      var cs=getComputedStyle(el);
      if(cs.position==="fixed" && (parseInt(cs.zIndex,10)||0)>=30) return true;
    }
    return false;
  }
  function manda(){
    var tabs=$$("#mtabs button[data-view]").map(function(b){ var sp=b.querySelector("span"); return [b.dataset.view, ((sp||b).textContent||"").trim()]; });
    var cur=document.querySelector('#mtabs button[aria-current="true"]');
    var color=getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
    var m={ pestanas:tabs, vista:cur?cur.dataset.view:view, ocultar:tapada(), color:color };
    var j=JSON.stringify(m); if(j===ultimo) return; ultimo=j;
    try{ canal.postMessage(m); }catch(e){}
  }
  var _goNativo=go;
  go=function(){ var r=_goNativo.apply(this, arguments); setTimeout(manda, 30); return r; };
  setInterval(manda, 400);
  setTimeout(manda, 50);
})();
