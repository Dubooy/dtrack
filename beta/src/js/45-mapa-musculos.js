/* Ficha «?» del modo guiado: mapa del cuerpo en 2D (delante y detrás) dibujado músculo a músculo.
   Los músculos que trabaja el estiramiento se pintan en verde con las rayas del logo; el resto en gris.
   Las claves son las de MUSC_CLAVES / MUSC_NOMBRE (34-estiramientos-guia.js). Se dibuja la mitad izquierda y se refleja. Las piezas van con tramos rectos, como facetas. */
var MM_COMUN={cabeza:"M100 11 L87.5 17.8 L84 32 L89.0 46.5 L100 52 Z",
 antebrazo:"M52 144 L47.5 168.0 L46 192 L54 192 L59.5 167.8 L62 142 Z",
 mano:"M46 196 L45.8 208.2 L50 216 L54.2 208.2 L54 196 Z"};
var MM_DEL=Object.assign({}, MM_COMUN, {
 cuelloF:"M92 50 L91.9 59.1 L88 66 L98 70 L100 70 L100 50 Z",
 trapecio:"M90 58 L78.5 64.5 L64 68 L77.0 70.5 L90 70 Z",
 deltA:"M64 68 L52.2 73.8 L48 90 L52.0 99.5 L56 106 L63.2 90.0 L72 74 L68.4 69.5 L64 68 Z",
 pectoral:"M98 72 L74 74 L67.0 88.2 L66 104 L81.2 111.5 L98 110 Z",
 biceps:"M56 106 L51.8 122.2 L52 140 L57.8 140.2 L62 136 L64.5 118.5 L64 104 Z",
 oblicuos:"M84 116 L73.6 113.1 L67 108 L68.4 139.5 L72 168 L78.6 186.0 L86 198 L82.8 155.5 L84 116 Z",
 abdomen:"M100 115 L87 116 L85.8 155.2 L89 196 L94.1 201.0 L100 203 Z",
 psoas:"M86 202 L81.8 210.5 L82 222 L95 230 L94.4 214.5 L90 202 Z",
 cuadriceps:"M66 206 L63.0 252.2 L66 300 L72.6 313.5 L80 318 L76.0 269.0 L78 214 L72.0 208.9 L66 206 Z",
 rectoFem:"M80 216 L78.9 269.2 L83 318 L92 318 L94.2 273.2 L92 230 L86.0 223.4 L80 216 Z",
 aductores:"M94 232 L96.4 255.0 L95 284 L99 270 L99 236 Z",
 rodilla:"M70 320 L73.4 329.1 L82 333 L92 333 L95.2 325.0 L94 320 Z",
 tibial:"M72 337 L72.0 366.4 L78 398 L84 398 L84.2 366.4 L86 337 Z",
 gemeloF:"M88 337 L92.8 362.6 L90 398 L86 398 L86.2 366.4 L88 337 Z",
 pie:"M76 402 L92 402 L94.2 411.5 L92 418 L74 418 L73.5 409.2 L76 402 Z"});
var MM_DET=Object.assign({}, MM_COMUN, {
 cuello:"M92 50 L91.8 57.5 L90 62 L100 64 L100 50 Z",
 trapecio:"M100 52 L92 52 L84.0 62.2 L64 68 L80.5 77.5 L94 90 L100 93 Z",
 toracica:"M100 93 L94 90 L94.0 114.5 L100 142 Z",
 romboides:"M94 90 L84.5 82.6 L78 82 L82.8 101.5 L92 118 L92.2 103.2 L94 90 Z",
 deltP:"M64 68 L52.2 73.8 L48 90 L52.0 99.5 L56 106 L62.2 91.2 L70 78 Z",
 infra:"M70 78 L62.8 91.0 L60 104 L70.2 106.2 L82 104 L79.2 92.2 L78 82 Z",
 dorsal:"M60 106 L65.2 138.8 L72 170 L83.8 184.4 L94 192 L93.5 160.5 L93 132 L92.1 124.2 L92 118 L85.1 110.2 L82 104 L70.2 107.2 L60 106 Z",
 erectores:"M100 142 L96.4 155.9 L95 175 L95 194 L100 196 Z",
 lumbares:"M72 172 L70.5 190.2 L72 204 L100 206 L100 197 L94 194 L81.1 184.1 L72 172 Z",
 triceps:"M56 106 L51.8 122.2 L52 140 L57.8 140.2 L62 136 L63.2 119.5 L60 106 Z",
 gluteoMed:"M72 206 L65.8 213.8 L64 226 L73.0 217.9 L82 209 Z",
 gluteo:"M84 209 L70.8 220.8 L65 237 L73.1 250.5 L88 255 L95.8 252.2 L99 245 L99 209 Z",
 isquios:"M66 254 L66.0 288.2 L72 318 L94 318 L95.8 286.5 L96 258 L81.8 259.0 L66 254 Z",
 rodilla:"M72 320 L94 320 L94.5 327.0 L92 331 L72 331 L70.5 325.1 L72 320 Z",
 gemelos:"M72 334 L67.5 353.0 L72 372 L83.8 374.8 L94 370 L96.0 349.8 L92 334 Z",
 soleo:"M72 376 L76.0 388.1 L80 398 L90 398 L92.8 386.0 L94 374 L83.0 378.0 L72 376 Z",
 tobillo:"M80 400 L90 400 L90 404 L80 404 Z",
 pie:"M78 406 L92 406 L92.0 414.2 L86 418 L80 418 L76.8 413.1 L78 406 Z"});
/* claves que también encienden otra pieza del dibujo */
var MM_ALIAS={ gemelos:["gemeloF"], cuello:["cuelloF"], cuelloF:["cuello"] };
function mapaMusculosVista(P, on, abs){
  var s="";
  for(var k in P){ var c=on.indexOf(k)>=0 ? "mm-on" : "";
    s+='<path class="'+c+'" d="'+P[k]+'"/><path class="'+c+'" d="'+P[k]+'" transform="translate(200 0) scale(-1 1)"/>'; }
  if(abs) s+='<path class="mm-li" d="M86 138 H114 M86 160 H114 M87 180 H113"/>';
  return '<svg class="mm" viewBox="36 6 128 416" aria-hidden="true">'+s+'</svg>';
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
