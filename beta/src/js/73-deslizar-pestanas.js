/* ════════ deslizar para cambiar de pestaña (18/10/2026) ════════
   Un gesto horizontal claro sobre una pestaña pasa a la de al lado, en el orden
   de la barra. No salta si el dedo empieza en algo que ya se desliza de lado
   (filas de libros, rutinas, pastillas), en un campo, en un lienzo (montaña 3D)
   o fuera de las pestañas (hojas, parte, lector…). */
(function(){
  var x0=0, y0=0, t0=0, vale=false;
  function seDeslizaDeLado(el){
    for(; el && el!==document.body; el=el.parentElement){
      if(el.scrollWidth>el.clientWidth+4){
        var ox=getComputedStyle(el).overflowX;
        if(ox==="auto" || ox==="scroll") return true;
      }
    }
    return false;
  }
  document.addEventListener("touchstart", function(e){
    vale=false;
    if(e.touches.length!==1) return;
    var t=e.target;
    if(!t.closest || !t.closest(".view") || t.closest("input, textarea, select, canvas, [data-sin-deslizar]") || seDeslizaDeLado(t)) return;
    var p=e.touches[0]; x0=p.clientX; y0=p.clientY; t0=Date.now(); vale=true;
  }, { passive:true });
  document.addEventListener("touchend", function(e){
    if(!vale) return; vale=false;
    var p=e.changedTouches[0], dx=p.clientX-x0, dy=p.clientY-y0;
    if(Date.now()-t0>700 || Math.abs(dx)<70 || Math.abs(dx)<Math.abs(dy)*1.8) return;
    var bs=$$("#mtabs button[data-view]").filter(function(b){ return b.offsetParent!==null; });
    var i=bs.findIndex(function(b){ return b.getAttribute("aria-current")==="true"; });
    if(i<0) return;
    var j=i+(dx<0?1:-1);
    if(j>=0 && j<bs.length) bs[j].click();
  }, { passive:true });
})();
