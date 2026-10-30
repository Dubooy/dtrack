// Membrana del portal: solo existe cuando el portal se ha reconstruido.
//@vertex
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
//@fragment
uniform float uActive;
uniform float uTime;
varying vec2 vUv;
void main() {
  // aparece por píxeles al activarse
  if (uActive < 0.01 || evBayer(gl_FragCoord.xy) > uActive) discard;
  vec2 c = (vUv - 0.5) * vec2(1.0, 1.6);
  float r = length(c);
  float ring = step(0.82, fract(r * 4.0 - uTime * 0.6));  // anillos finos que se expanden
  float core = 1.0 - smoothstep(0.0, 0.6, r);
  vec3 col = vec3(0.28, 0.06, 0.36) + vec3(0.55, 0.11, 0.64) * (core * 0.6 + ring * 0.9);
  gl_FragColor = vec4(col, 1.0);
}
