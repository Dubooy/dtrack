/* Ficha «?» del modo guiado: mapa del cuerpo en 2D (delante y detrás) dibujado músculo a músculo.
   Los músculos que trabaja el estiramiento se pintan en verde con las rayas del logo; el resto en gris.
   Las claves son las de MUSC_CLAVES / MUSC_NOMBRE (34-estiramientos-guia.js). Se dibuja la mitad izquierda y se refleja. */
var MM_COMUN={cabeza:"M100 11 C88 11 84 22 84 32 C84 44 92 52 100 52 Z",
 antebrazo:"M52 144 C48 160 46 176 46 192 L54 192 C58 176 62 160 62 142 Z",
 mano:"M46 196 C44 204 46 214 50 216 C54 214 56 204 54 196 Z"};
var MM_DEL=Object.assign({}, MM_COMUN, {
 cuelloF:"M92 50 C93 57 92 62 88 66 L98 70 L100 70 L100 50 Z",
 trapecio:"M90 58 C84 64 74 66 64 68 C72 71 82 71 90 70 Z",
 deltA:"M64 68 C54 68 48 76 48 90 C50 98 54 102 56 106 C60 96 66 84 72 74 C70 70 67 68 64 68 Z",
 pectoral:"M98 72 L74 74 C68 82 64 94 66 104 C74 112 88 114 98 110 Z",
 biceps:"M56 106 C52 116 50 128 52 140 C56 142 60 140 62 136 C64 124 66 112 64 104 Z",
 oblicuos:"M84 116 C76 115 70 112 67 108 C67 130 69 150 72 168 C76 182 81 192 86 198 C82 170 82 140 84 116 Z",
 abdomen:"M100 115 L87 116 C85 140 85 170 89 196 C92 200 96 203 100 203 Z",
 psoas:"M86 202 C82 207 80 213 82 222 L95 230 C96 220 94 208 90 202 Z",
 cuadriceps:"M66 206 C62 236 62 268 66 300 C70 312 75 318 80 318 C76 290 74 250 78 214 C74 210 70 207 66 206 Z",
 rectoFem:"M80 216 C77 250 79 290 83 318 L92 318 C95 290 95 256 92 230 C88 226 84 221 80 216 Z",
 aductores:"M94 232 C97 246 97 262 95 284 L99 270 L99 236 Z",
 rodilla:"M70 320 C70 327 75 333 82 333 L92 333 C96 327 96 322 94 320 Z",
 tibial:"M72 337 C70 356 72 376 78 398 L84 398 C84 376 84 356 86 337 Z",
 gemeloF:"M88 337 C94 350 94 372 90 398 L86 398 C86 376 86 356 88 337 Z",
 pie:"M76 402 L92 402 C94 410 96 414 92 418 L74 418 C72 412 74 406 76 402 Z"});
var MM_DET=Object.assign({}, MM_COMUN, {
 cuello:"M92 50 C92 56 92 60 90 62 L100 64 L100 50 Z",
 trapecio:"M100 52 L92 52 C92 60 80 66 64 68 C76 74 86 80 94 90 L100 93 Z",
 toracica:"M100 93 L94 90 C92 106 94 122 100 142 Z",
 romboides:"M94 90 C87 83 81 80 78 82 C80 96 84 108 92 118 C92 108 92 98 94 90 Z",
 deltP:"M64 68 C54 68 48 76 48 90 C50 98 54 102 56 106 C60 96 64 86 70 78 Z",
 infra:"M70 78 C64 86 60 96 60 104 C66 108 74 106 82 104 C80 96 78 88 78 82 Z",
 dorsal:"M60 106 C64 128 66 150 72 170 C80 182 88 189 94 192 C94 170 93 150 93 132 C92 126 92 122 92 118 C86 112 83 108 82 104 C74 108 66 108 60 106 Z",
 erectores:"M100 142 C97 150 95 160 95 175 L95 194 L100 196 Z",
 lumbares:"M72 172 C70 186 70 196 72 204 L100 206 L100 197 L94 194 C84 188 77 181 72 172 Z",
 triceps:"M56 106 C52 116 50 128 52 140 C56 142 60 140 62 136 C64 124 64 114 60 106 Z",
 gluteoMed:"M72 206 C66 210 64 216 64 226 C70 221 76 215 82 209 Z",
 gluteo:"M84 209 C74 215 65 225 65 237 C67 249 77 255 88 255 C94 255 99 251 99 245 L99 209 Z",
 isquios:"M66 254 C64 278 66 300 72 318 L94 318 C96 296 96 276 96 258 C88 260 76 260 66 254 Z",
 rodilla:"M72 320 L94 320 C96 325 94 330 92 331 L72 331 C70 327 70 323 72 320 Z",
 gemelos:"M72 334 C66 346 66 360 72 372 C78 376 90 376 94 370 C98 356 96 342 92 334 Z",
 soleo:"M72 376 C74 385 78 392 80 398 L90 398 C92 390 94 382 94 374 C88 379 78 379 72 376 Z",
 tobillo:"M80 400 L90 400 L90 404 L80 404 Z",
 pie:"M78 406 L92 406 C94 412 92 418 86 418 L80 418 C76 416 76 411 78 406 Z"});
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
    ':root{ --mm-base:#ddd5c6; --mm-v:#0E8A6E; --mm-r:#0a6650; }',
    'html.dark{ --mm-base:#3a3631; --mm-v:#2fbf98; --mm-r:#1f8f71; }',
    '.mm-caja{ position:absolute; left:0; right:0; top:14px; bottom:30px; display:flex; justify-content:center; }',
    '.mm{ height:100%; width:auto; display:block; }',
    '.mm path{ fill:var(--mm-base); stroke:var(--bg); stroke-width:2; stroke-linejoin:round; }',
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
