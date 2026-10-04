/* Ficha «?» del modo guiado: mapa del cuerpo en 2D (delante y detrás) dibujado músculo a músculo.
   Los músculos que trabaja el estiramiento se pintan en verde con las rayas del logo; el resto en gris.
   Las claves son las de MUSC_CLAVES / MUSC_NOMBRE (34-estiramientos-guia.js). Se dibuja la mitad izquierda y se refleja. Las piezas van con tramos rectos, como facetas. */
var MM_COMUN={ cabeza:"M100 10 L90 13 L86 24 L87 38 L92 47 L100 51 Z",
 antebrazo:"M42 146 L38 160 L38 178 L42 194 L50 194 L54 176 L58 156 L56 144 Z",
 mano:"M42 198 L40 208 L44 218 L50 218 L52 208 L50 198 Z" };
var MM_DEL=Object.assign({}, MM_COMUN, {
 cuelloF:"M92 50 L89 58 L97 68 L100 68 L100 54 Z",
 trapecio:"M90 56 L64 64 L78 66 L95 66 Z",
 deltA:"M64 64 L50 70 L43 84 L44 98 L52 104 L60 90 L70 72 L78 66 Z",
 pectoral:"M98 70 L80 68 L70 74 L62 92 L64 104 L80 110 L98 108 Z",
 biceps:"M52 106 L44 112 L42 130 L46 142 L54 140 L58 124 L58 108 Z",
 abdomen:"M100 112 L88 114 L87 130 L100 130 Z", abd2:"M100 133 L87 133 L87 150 L100 150 Z",
 abd3:"M100 153 L87 153 L88 170 L100 170 Z", abd4:"M100 173 L88 173 L92 196 L100 200 Z",
 oblicuos:"M85 112 L68 108 L66 122 L70 150 L74 172 L86 196 L85 170 Z",
 psoas:"M88 200 L76 196 L72 202 L84 214 L96 228 L98 214 Z",
 cuadriceps:"M70 202 L64 220 L62 256 L66 290 L72 312 L78 314 L76 280 L74 240 L80 214 Z",
 rectoFem:"M82 214 L76 240 L78 280 L82 306 L88 304 L92 270 L92 236 Z",
 vastoM:"M92 276 L88 304 L84 314 L92 320 L98 310 L98 290 Z",
 aductores:"M96 230 L93 238 L93 268 L98 284 L99 236 Z",
 rodilla:"M74 318 L86 320 L96 322 L94 334 L80 334 L74 328 Z",
 tibial:"M74 338 L70 358 L74 380 L80 398 L84 398 L84 370 L86 340 Z",
 gemeloF:"M88 338 L96 352 L96 372 L90 398 L86 398 L86 360 Z",
 pie:"M78 402 L90 402 L94 412 L92 418 L76 418 L74 410 Z" });
var MM_DET=Object.assign({}, MM_COMUN, {
 cuello:"M92 48 L90 58 L100 60 L100 50 Z",
 trapecio:"M100 52 L92 52 L90 58 L62 64 L80 72 L94 84 L100 86 Z",
 toracica:"M100 86 L94 84 L90 104 L94 124 L100 146 Z",
 romboides:"M94 84 L80 72 L76 80 L82 100 L90 104 Z",
 deltP:"M62 64 L50 70 L43 84 L44 98 L52 104 L58 92 L66 78 Z",
 infra:"M66 78 L58 92 L60 104 L74 104 L82 100 L76 80 Z",
 redondo:"M60 106 L58 114 L68 117 L76 106 Z",
 dorsal:"M58 117 L62 134 L66 160 L74 178 L94 192 L95 160 L94 124 L90 104 L82 100 L76 108 L68 119 Z",
 erectores:"M100 146 L96 154 L96 196 L100 198 Z",
 lumbares:"M74 180 L72 196 L74 204 L100 206 L100 199 L95 197 L93 193 Z",
 triceps:"M52 106 L44 112 L42 130 L46 142 L54 140 L58 124 L58 108 Z",
 tricepsL:"M44 112 L42 130 L46 142 L50 137 L50 116 Z",
 gluteoMed:"M74 207 L68 210 L64 222 L72 218 L84 210 Z",
 gluteo:"M86 210 L72 219 L64 231 L66 246 L76 256 L90 258 L99 252 L99 210 Z",
 isquios:"M66 252 L64 280 L68 304 L74 318 L84 318 L82 290 L84 262 L76 258 Z",
 semiten:"M86 262 L84 290 L86 318 L94 318 L96 290 L97 258 L90 260 Z",
 rodilla:"M74 320 L94 320 L94 330 L74 330 Z",
 gemelos:"M72 334 L66 348 L68 364 L74 374 L82 370 L83 338 Z",
 gemeloM:"M85 336 L84 370 L90 376 L96 362 L96 344 L92 334 Z",
 soleo:"M72 378 L76 390 L80 398 L90 398 L92 388 L94 376 L88 380 L82 374 Z",
 tobillo:"M80 400 L90 400 L90 405 L80 405 Z",
 pie:"M78 407 L92 407 L92 418 L78 418 Z" });
/* claves que también encienden otras piezas del dibujo */
var MM_ALIAS={ gemelos:["gemeloF","gemeloM"], cuello:["cuelloF"], cuelloF:["cuello"], abdomen:["abd2","abd3","abd4"],
  cuadriceps:["vastoM","rectoFem"], isquios:["semiten"], infra:["redondo"], triceps:["tricepsL"], dorsal:["redondo"] };
function mapaMusculosVista(P, on, abs){
  var s="";
  for(var k in P){ var c=on.indexOf(k)>=0 ? "mm-on" : "";
    s+='<path class="'+c+'" d="'+P[k]+'"/><path class="'+c+'" d="'+P[k]+'" transform="translate(200 0) scale(-1 1)"/>'; }
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
