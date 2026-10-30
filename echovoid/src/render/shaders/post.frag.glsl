// Postproceso: la escena (renderizada a baja resolución) se reduce a la paleta del juego con
// ruido ordenado. Grises para el mundo; magenta solo si el píxel ya venía magenta (ecos,
// anomalías, portal).
#include <packing>

uniform sampler2D tColor;
uniform sampler2D tDepth;
uniform vec2 uRes;
uniform float uTime;
uniform float uNear;
uniform float uFar;
uniform float uVignette;
uniform float uGrain;
uniform float uEdge;
uniform float uReveal;  // 0 = negro, 1 = imagen completa (la imagen se arma por píxeles)
uniform float uGlitch;
uniform float uStatic;
uniform float uFlash;
varying vec2 vUv;

const vec3 G0 = vec3(0.031, 0.035, 0.051);  // #08090D negro profundo
const vec3 G1 = vec3(0.110, 0.114, 0.129);  // #1C1D21
const vec3 G2 = vec3(0.220, 0.224, 0.243);  // #38393E
const vec3 G3 = vec3(0.392, 0.396, 0.408);  // #646568
const vec3 G4 = vec3(0.604, 0.604, 0.596);  // #9A9A98
const vec3 G5 = vec3(0.847, 0.847, 0.835);  // #D8D8D5 blanco grisáceo
const vec3 M1 = vec3(0.239, 0.051, 0.310);  // #3D0D4F
const vec3 M2 = vec3(0.541, 0.106, 0.690);  // #8A1BB0
const vec3 M3 = vec3(0.835, 0.165, 1.0);    // #D52AFF magenta de anomalías
const vec3 M4 = vec3(0.949, 0.710, 1.0);    // #F2B5FF

vec3 grey(float i) { return i < 0.5 ? G0 : i < 1.5 ? G1 : i < 2.5 ? G2 : i < 3.5 ? G3 : i < 4.5 ? G4 : G5; }
vec3 magenta(float i) { return i < 0.5 ? G0 : i < 1.5 ? M1 : i < 2.5 ? M2 : i < 3.5 ? M3 : M4; }

float linDepth(vec2 uv) {
  return -perspectiveDepthToViewZ(texture2D(tDepth, uv).x, uNear, uFar);
}

void main() {
  vec2 px = 1.0 / uRes;
  vec2 uv = vUv;
  vec2 fc = floor(vUv * uRes);

  // desgarro horizontal: al crear un eco y dentro de la estática
  float g = uGlitch + uStatic * 0.3;
  if (g > 0.001) {
    float band = floor(fc.y / 3.0);
    if (evHash2(vec2(band, floor(uTime * 24.0))) > 1.0 - g * 0.5)
      uv.x += (evHash(band + floor(uTime * 30.0)) - 0.5) * 0.07 * g;
  }

  vec3 c = texture2D(tColor, uv).rgb;
  vec3 s = pow(max(c, 0.0), vec3(1.0 / 2.2));
  float lum = dot(s, vec3(0.299, 0.587, 0.114));
  float mx = max(s.r, s.b);
  float chroma = (min(s.r, s.b) - s.g) / max(mx, 0.001);

  // contorno: el píxel es el borde de algo mucho más cercano que lo que tiene al lado
  float d = linDepth(uv);
  float dn = max(max(linDepth(uv + vec2(px.x, 0.0)), linDepth(uv - vec2(px.x, 0.0))),
                 max(linDepth(uv + vec2(0.0, px.y)), linDepth(uv - vec2(0.0, px.y))));
  float edge = step(d * 0.3 + 1.0, dn - d) * step(d, 90.0);

  // viñeta: la mirada ilumina el centro, el resto se apaga
  vec2 q = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  float vig = 1.0 - uVignette * smoothstep(0.3, 1.0, length(q));

  float b = evBayer(fc);
  vec3 outc;
  if (chroma > 0.3 && mx > 0.035) {
    float m = mx * vig * 1.2 + edge * uEdge;
    outc = m > 1.08 ? M4 : magenta(floor(clamp(m, 0.0, 1.0) * 3.0 + b));
  } else {
    float l = clamp((lum - 0.05) * 1.12 * vig + edge * uEdge, 0.0, 1.0);
    l += (evHash2(fc + floor(uTime * 12.0) * 7.0) - 0.5) * uGrain * l * (1.0 - l) * 4.0;
    outc = grey(floor(clamp(l, 0.0, 1.0) * 5.0 + b));
  }

  // estática: nieve de televisor
  if (uStatic > 0.001) {
    float n = evHash2(fc * 1.37 + floor(uTime * 20.0) * 13.0);
    if (n < uStatic * 0.42) outc = grey(floor(evHash2(fc + floor(uTime * 20.0)) * 6.0));
  }
  outc = mix(outc, G5, step(b, uFlash));
  if (b >= uReveal) outc = G0;
  gl_FragColor = vec4(outc, 1.0);
}
