// Material de bloques: se inyecta en MeshLambertMaterial (ver blockMaterial.ts), así conserva
// luces, sombras y niebla de Three.js. Cada sección empieza con //@nombre.

//@vertex_pars
attribute vec4 aBox;   // centro de la caja + semilla
attribute vec3 aHalf;  // media dimensión de la caja
uniform float uPresence;
uniform float uEcho;
uniform float uTime;
varying vec3 vEvWorld;
varying vec3 vEvLocal;
varying vec3 vEvHalf;
varying vec3 vEvNormal;
varying float vEvSeed;

//@vertex_main
vEvSeed = aBox.w;
vEvHalf = aHalf;
vEvLocal = position - aBox.xyz;
vEvNormal = normal;
float evP = clamp(uPresence, 0.0, 1.0);
if (evP < 0.999) {
  // reconstrucción: cada bloque llega desde un poco más lejos y más pequeño
  float evS = evP * evP * (3.0 - 2.0 * evP);
  vec3 evOff = vec3(evHash(aBox.w * 1.7), evHash(aBox.w * 2.3), evHash(aBox.w * 3.1)) - 0.5;
  transformed = aBox.xyz + (transformed - aBox.xyz) * mix(0.6, 1.0, evS) + evOff * (1.0 - evS) * 1.4;
}
if (uEcho > 0.001) {
  // los ecos tiemblan a saltos, como una imagen mal sintonizada
  float evJ = evHash(aBox.w * 5.3 + floor(uTime * 9.0)) - 0.5;
  transformed += normal * evJ * 0.06 * uEcho;
}
vEvWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;

//@fragment_pars
uniform float uPresence;
uniform float uEcho;
uniform float uBlink;
uniform float uTarget;
uniform float uStyle;  // 0 = piedra, 1 = estructura observable
uniform float uTime;
varying vec3 vEvWorld;
varying vec3 vEvLocal;
varying vec3 vEvHalf;
varying vec3 vEvNormal;
varying float vEvSeed;

//@fragment_surface
// disolución por píxeles según la presencia (lo olvidado se deshace en ruido ordenado)
float evPres = clamp(uPresence, 0.0, 1.0);
float evVis = evPres * 1.3 - evHash(vEvSeed * 7.13) * 0.3;
if (evVis < 0.999 && evVis <= evBayer(gl_FragCoord.xy)) discard;

// sillares: losas de 1×1 arriba, hiladas de 1×0.5 en los lados
vec3 evAn = abs(vEvNormal);
bool evTop = evAn.y > 0.5;
vec2 evUv = evTop ? vEvWorld.xz : (evAn.x > 0.5 ? vEvWorld.zy : vEvWorld.xy);
vec2 evTs = evTop ? vec2(1.0) : vec2(1.0, 0.5);
vec2 evG = evUv / evTs;
if (!evTop) evG.x += 0.5 * mod(floor(evG.y), 2.0);
vec2 evF = fract(evG);
vec2 evCell = floor(evG);
float evMortar = step(min(min(evF.x, 1.0 - evF.x) * evTs.x, min(evF.y, 1.0 - evF.y) * evTs.y), 0.03);
float evN = evHash(dot(evCell, vec2(12.9898, 78.233)) + vEvSeed * 3.7);
float evShade = mix(0.88, 1.04, evN);
if (evN > 0.95) evShade *= 0.75;
evShade *= mix(0.9, 1.0, evHash(vEvSeed * 1.31));

// aristas de cada caja: ayudan a leer dónde acaba una plataforma
vec3 evD = vEvHalf - abs(vEvLocal);
float evE = evTop ? min(evD.x, evD.z) : (evAn.x > 0.5 ? min(evD.y, evD.z) : min(evD.x, evD.y));
float evRim = 1.0 - smoothstep(0.0, 0.08, evE);

if (uStyle > 0.5) {
  // estructuras observables: más limpias y claras, con una línea de barrido
  evShade = mix(evShade, 1.0, 0.6) * (1.0 - evMortar * 0.15);
  evShade += step(0.965, fract(vEvWorld.y * 0.45 - uTime * 0.3)) * 0.1;
} else {
  evShade *= 1.0 - evMortar * 0.28;
}
evShade += evRim * (evTop ? 0.14 : 0.05);
diffuseColor.rgb *= evShade;

//@fragment_light
// ECO: magenta. Es el único sitio, junto a anomalías y portales, donde existe ese color.
if (uEcho > 0.001) {
  float evL = dot(outgoingLight, vec3(0.3, 0.59, 0.11));
  vec3 evMg = vec3(0.835, 0.165, 1.0);
  vec3 evEcho = evMg * (0.2 + evL * 0.5) + evMg * evRim * 1.2;
  outgoingLight = mix(outgoingLight, evEcho, uEcho * (1.0 - uBlink * 0.85));
}
outgoingLight += vec3(evRim * 0.5 * uTarget);
