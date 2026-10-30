// Utilidades compartidas por los shaders de ECHO//VOID.

float evHash(float n) { return fract(sin(n) * 43758.5453123); }
float evHash2(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123); }

// Matriz de Bayer 8×8 (ruido ordenado): un umbral en [0,1) para cada píxel de pantalla.
float evBayer(vec2 fc) {
  ivec2 p = ivec2(mod(fc, 8.0));
  int xy = p.x ^ p.y;
  int v = ((xy & 1) << 5) | ((p.y & 1) << 4) | ((xy & 2) << 2) | ((p.y & 2) << 1) | ((xy & 4) >> 1) | ((p.y & 4) >> 2);
  return (float(v) + 0.5) / 64.0;
}
