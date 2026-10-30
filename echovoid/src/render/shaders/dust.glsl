// Polvo suspendido alrededor del jugador: da escala al vacío.
//@vertex
uniform vec3 uCenter;
uniform float uExtent;
uniform float uTime;
varying float vFade;
void main() {
  vec3 p = position;
  p.y += sin(uTime * 0.25 + position.x * 0.7) * 0.6;
  p = mod(p - uCenter + uExtent, 2.0 * uExtent) + uCenter - uExtent;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vFade = 1.0 - smoothstep(6.0, uExtent, -mv.z);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = 1.0;
}
//@fragment
varying float vFade;
void main() {
  if (vFade <= 0.02) discard;
  gl_FragColor = vec4(vec3(0.38 * vFade), 1.0);
}
