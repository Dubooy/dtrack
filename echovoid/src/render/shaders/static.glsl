// Volumen de estática: zona donde nadie observa.
//@vertex
varying vec3 vW;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
//@fragment
uniform float uTime;
varying vec3 vW;
void main() {
  vec2 fc = floor(gl_FragCoord.xy);
  float n = evHash2(fc + floor(uTime * 18.0) * vec2(7.0, 13.0));
  float rows = step(0.86, evHash(floor(vW.y * 3.0) + floor(uTime * 6.0)));
  float a = 0.05 + 0.32 * step(0.94, n) + rows * 0.1;
  vec3 col = vec3(0.15 + 0.7 * n);
  if (evHash2(fc + floor(uTime * 9.0)) > 0.9985) col = vec3(0.835, 0.165, 1.0);
  gl_FragColor = vec4(col, a);
}
