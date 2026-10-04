/* si algo peta, se avisa y se quitan las capas que puedan estar tapando la app */
window.addEventListener("error",function(ev){
  /* este aviso del navegador no es un fallo de verdad: no se enseña */
  if(/ResizeObserver loop/i.test(ev.message||"")){ if(ev.stopImmediatePropagation) ev.stopImmediatePropagation(); return; }
  try{
    var t=document.getElementById("tour"); if(t) t.hidden=true;
    var pp=document.getElementById("parte"); if(pp) pp.hidden=true;
    if(document.getElementById("boom")) return;
    var d=document.createElement("div"); d.id="boom";
    d.style.cssText="position:fixed;left:10px;right:10px;top:10px;z-index:999;padding:12px 14px;border-radius:14px;"+
      "background:#b3261e;color:#fff;font:500 12px/1.45 -apple-system,sans-serif;box-shadow:0 8px 28px -10px rgba(0,0,0,.6)";
    d.textContent="Fallo: "+(ev.message||"")+"  ·  "+((ev.filename||"").split("/").pop())+":"+(ev.lineno||"");
    d.onclick=function(){ d.remove(); };
    document.body.appendChild(d);
  }catch(e){}
});
