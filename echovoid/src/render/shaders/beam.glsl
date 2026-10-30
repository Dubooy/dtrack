// Columna de luz (aditiva).
//@vertex
varying float vY;
void main() {
  vY = uv.y;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
//@fragment
uniform vec3 uColor;
uniform float uOpacity;
uniform float uTime;
varying float vY;
void main() {
  float a = uOpacity * smoothstep(0.0, 0.1, vY) * (1.0 - smoothstep(0.45, 1.0, vY));
  a *= 0.75 + 0.25 * sin(uTime * 1.3 + vY * 9.0);
  gl_FragColor = vec4(uColor * a, a);
}
