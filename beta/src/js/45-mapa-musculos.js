/* Ficha «?» del modo guiado: mapa del cuerpo en 2D (delante y detrás) dibujado músculo a músculo.
   Los músculos que trabaja el estiramiento se pintan en verde con las rayas del logo; el resto en gris.
   Las claves son las de MUSC_CLAVES / MUSC_NOMBRE (34-estiramientos-guia.js). Se dibuja la mitad izquierda y se refleja. Las piezas van con tramos rectos, como facetas. */
var MM_COMUN={ cabeza:"M100.0 -11.9 L84.7 -7.3 L78.5 9.6 L80.1 31.1 L87.7 44.9 L100.0 51.0 Z",
 antebrazo:"M30.6 146.0 L24.4 160.0 L24.4 178.0 L30.6 194.0 L43.0 194.0 L49.2 176.0 L55.4 156.0 L52.3 144.0 Z",
 mano:"M30.6 198.0 L27.5 208.0 L33.7 218.0 L43.0 218.0 L46.1 208.0 L43.0 198.0 Z" };
var MM_DEL=Object.assign({}, MM_COMUN, {
 cuelloF:"M92.0 50.0 L89.0 58.0 L97.0 68.0 L100.0 68.0 L100.0 54.0 Z",
 trapecio:"M90.0 56.0 L63.0 64.0 L78.0 66.0 L95.0 66.0 Z",
 deltA:"M64.0 64.0 L45.1 70.9 L35.6 87.0 L37.0 103.1 L47.8 110.0 L58.6 93.9 L72.1 73.2 L82.9 66.3 Z",
 pectoral:"M98.0 70.0 L80.0 68.0 L69.8 74.0 L60.8 92.0 L63.0 104.0 L80.0 110.0 L98.0 108.0 Z",
 biceps:"M46.1 106.0 L33.7 112.0 L30.6 130.0 L36.8 142.0 L49.2 140.0 L55.4 124.0 L55.4 108.0 Z",
 abdomen:"M100.0 112.0 L88.0 114.0 L87.0 130.0 L100.0 130.0 Z", abd2:"M100.0 133.0 L87.0 133.0 L87.0 150.0 L100.0 150.0 Z",
 abd3:"M100.0 153.0 L87.0 153.0 L88.0 170.0 L100.0 170.0 Z", abd4:"M100.0 173.0 L88.0 173.0 L92.0 196.0 L100.0 200.0 Z",
 oblicuos:"M85.0 112.0 L67.5 108.0 L65.3 122.0 L69.8 150.0 L74.0 172.0 L86.0 196.0 L85.0 170.0 Z",
 psoas:"M86.6 200.0 L73.1 196.0 L68.6 202.0 L82.1 214.0 L95.5 228.0 L97.8 214.0 Z",
 cuadriceps:"M66.4 202.0 L59.7 220.0 L57.4 256.0 L61.9 290.0 L68.6 312.0 L75.4 314.0 L73.1 280.0 L70.9 240.0 L77.6 214.0 Z",
 rectoFem:"M79.8 214.0 L73.1 240.0 L75.4 280.0 L79.8 306.0 L86.6 304.0 L91.0 270.0 L91.0 236.0 Z",
 vastoM:"M91.0 276.0 L86.6 304.0 L82.1 314.0 L91.0 320.0 L97.8 310.0 L97.8 290.0 Z",
 aductores:"M95.5 230.0 L92.2 238.0 L92.2 268.0 L97.8 284.0 L98.9 236.0 Z",
 rodilla:"M70.9 318.0 L84.3 320.0 L95.5 322.0 L93.3 334.0 L77.6 334.0 L70.9 328.0 Z",
 tibial:"M70.9 338.0 L66.4 358.0 L70.9 380.0 L77.6 398.0 L82.1 398.0 L82.1 370.0 L84.3 340.0 Z",
 gemeloF:"M86.6 338.0 L95.5 352.0 L95.5 372.0 L88.8 398.0 L84.3 398.0 L84.3 360.0 Z",
 pie:"M75.4 402.0 L88.8 402.0 L93.3 412.0 L91.0 418.0 L73.1 418.0 L70.9 410.0 Z" });
var MM_DET=Object.assign({}, MM_COMUN, {
 cuello:"M92.0 48.0 L90.0 58.0 L100.0 60.0 L100.0 50.0 Z",
 trapecio:"M100.0 52.0 L92.0 52.0 L90.0 58.0 L60.8 64.0 L80.0 72.0 L94.0 84.0 L100.0 86.0 Z",
 toracica:"M100.0 86.0 L94.0 84.0 L90.0 104.0 L94.0 124.0 L100.0 146.0 Z",
 romboides:"M94.0 84.0 L80.0 72.0 L76.0 80.0 L82.0 100.0 L90.0 104.0 Z",
 deltP:"M61.3 64.0 L45.1 70.9 L35.6 87.0 L37.0 103.1 L47.8 110.0 L55.9 96.2 L66.7 80.1 Z",
 infra:"M65.3 78.0 L56.3 92.0 L58.6 104.0 L74.0 104.0 L82.0 100.0 L76.0 80.0 Z",
 redondo:"M58.6 106.0 L56.3 114.0 L67.5 117.0 L76.0 106.0 Z",
 dorsal:"M56.3 117.0 L60.8 134.0 L65.3 160.0 L74.0 178.0 L94.0 192.0 L95.0 160.0 L94.0 124.0 L90.0 104.0 L82.0 100.0 L76.0 108.0 L67.5 119.0 Z",
 erectores:"M100.0 146.0 L96.0 154.0 L96.0 196.0 L100.0 198.0 Z",
 lumbares:"M74.0 180.0 L72.0 196.0 L74.0 204.0 L100.0 206.0 L100.0 199.0 L95.0 197.0 L93.0 193.0 Z",
 triceps:"M46.1 106.0 L33.7 112.0 L30.6 130.0 L36.8 142.0 L49.2 140.0 L55.4 124.0 L55.4 108.0 Z",
 tricepsL:"M33.7 112.0 L30.6 130.0 L36.8 142.0 L43.0 137.0 L43.0 116.0 Z",
 gluteoMed:"M70.9 207.0 L64.2 210.0 L59.7 222.0 L68.6 218.0 L82.1 210.0 Z",
 gluteo:"M84.3 210.0 L68.6 219.0 L59.7 231.0 L61.9 246.0 L73.1 256.0 L88.8 258.0 L98.9 252.0 L98.9 210.0 Z",
 isquios:"M61.9 252.0 L59.7 280.0 L64.2 304.0 L70.9 318.0 L82.1 318.0 L79.8 290.0 L82.1 262.0 L73.1 258.0 Z",
 semiten:"M84.3 262.0 L82.1 290.0 L84.3 318.0 L93.3 318.0 L95.5 290.0 L96.6 258.0 L88.8 260.0 Z",
 rodilla:"M70.9 320.0 L93.3 320.0 L93.3 330.0 L70.9 330.0 Z",
 gemelos:"M68.6 334.0 L61.9 348.0 L64.2 364.0 L70.9 374.0 L79.8 370.0 L81.0 338.0 Z",
 gemeloM:"M83.2 336.0 L82.1 370.0 L88.8 376.0 L95.5 362.0 L95.5 344.0 L91.0 334.0 Z",
 soleo:"M68.6 378.0 L73.1 390.0 L77.6 398.0 L88.8 398.0 L91.0 388.0 L93.3 376.0 L86.6 380.0 L79.8 374.0 Z",
 tobillo:"M77.6 400.0 L88.8 400.0 L88.8 405.0 L77.6 405.0 Z",
 pie:"M75.4 407.0 L91.0 407.0 L91.0 418.0 L75.4 418.0 Z" });
/* claves que también encienden otras piezas del dibujo */
var MM_ALIAS={ gemelos:["gemeloF","gemeloM"], cuello:["cuelloF"], cuelloF:["cuello"], abdomen:["abd2","abd3","abd4"],
  cuadriceps:["vastoM","rectoFem"], isquios:["semiten"], infra:["redondo"], triceps:["tricepsL"], dorsal:["redondo"] };
function mapaMusculosVista(P, on, abs){
  var s="";
  for(var k in P){ var c=on.indexOf(k)>=0 ? "mm-on" : "";
    s+='<path class="'+c+'" d="'+P[k]+'"/><path class="'+c+'" d="'+P[k]+'" transform="translate(200 0) scale(-1 1)"/>'; }
  return '<svg class="mm" viewBox="20 -14 160 436" aria-hidden="true">'+s+'</svg>';
}
function mapaMusculos(claves){
  var on=[]; (claves||[]).forEach(function(k){ on.push(k); (MM_ALIAS[k]||[]).forEach(function(a){ on.push(a); }); });
  return '<div class="gi-vista"><div class="mm-caja">'+mapaMusculosVista(MM_DEL, on, true)+'</div><p class="gi-gira">Delante</p></div>'+
    '<div class="gi-vista"><div class="mm-caja">'+mapaMusculosVista(MM_DET, on, false)+'</div><p class="gi-gira">Detrás</p></div>';
}
(function(){
  var st=document.createElement("style");
  st.textContent=[
    ':root{ --mm-base:#dcdcdc; --mm-v:#0E8A6E; --mm-r:#0a6650; }',
    'html.dark{ --mm-base:#3b3b3b; --mm-v:#2fbf98; --mm-r:#1f8f71; }',
    '.mm-caja{ position:absolute; left:0; right:0; top:14px; bottom:30px; display:flex; justify-content:center; }',
    '.mm{ height:100%; width:auto; display:block; }',
    '.mm path{ fill:var(--mm-base); stroke:var(--bg); stroke-width:2; stroke-linejoin:miter; }',
    '.mm path.mm-on{ fill:url(#mm-rayas); }',
    '.mm .mm-li{ fill:none; stroke-width:1.6; }'
  ].join("\n");
  document.head.appendChild(st);
  /* las rayas del logo, una sola vez para todas las fichas */
  var d=document.createElement("div");
  d.innerHTML='<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><pattern id="mm-rayas" width="4.5" height="4.5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">'+
    '<rect width="4.5" height="4.5" style="fill:var(--mm-v)"/><rect width="1.6" height="4.5" style="fill:var(--mm-r)"/></pattern></defs></svg>';
  document.body.appendChild(d.firstChild);
})();
