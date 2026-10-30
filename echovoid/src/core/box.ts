// Cajas alineadas con los ejes. Todo el universo de ECHO//VOID está hecho de cajas: sirven a la
// vez para la geometría, las colisiones, la mirada y los ecos.

export interface Box {
  x0: number;
  y0: number;
  z0: number;
  x1: number;
  y1: number;
  z1: number;
}

export function box(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): Box {
  return {
    x0: Math.min(x0, x1),
    y0: Math.min(y0, y1),
    z0: Math.min(z0, z1),
    x1: Math.max(x0, x1),
    y1: Math.max(y0, y1),
    z1: Math.max(z0, z1),
  };
}

export function overlaps(a: Box, b: Box, eps = 1e-4): boolean {
  return (
    a.x0 < b.x1 - eps &&
    a.x1 > b.x0 + eps &&
    a.y0 < b.y1 - eps &&
    a.y1 > b.y0 + eps &&
    a.z0 < b.z1 - eps &&
    a.z1 > b.z0 + eps
  );
}

export function union(a: Box, b: Box): Box {
  return {
    x0: Math.min(a.x0, b.x0),
    y0: Math.min(a.y0, b.y0),
    z0: Math.min(a.z0, b.z0),
    x1: Math.max(a.x1, b.x1),
    y1: Math.max(a.y1, b.y1),
    z1: Math.max(a.z1, b.z1),
  };
}

export function boundsOf(list: Box[]): Box {
  return list.length ? list.reduce(union) : box(0, 0, 0, 0, 0, 0);
}

export function expand(b: Box, x: number, y: number, z: number, down = y): Box {
  return { x0: b.x0 - x, y0: b.y0 - down, z0: b.z0 - z, x1: b.x1 + x, y1: b.y1 + y, z1: b.z1 + z };
}

export function translate(list: Box[], x: number, y: number, z: number): Box[] {
  return list.map((b) => ({ x0: b.x0 + x, y0: b.y0 + y, z0: b.z0 + z, x1: b.x1 + x, y1: b.y1 + y, z1: b.z1 + z }));
}

export function containsPoint(b: Box, x: number, y: number, z: number): boolean {
  return x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1 && z >= b.z0 && z <= b.z1;
}

export function centerOf(b: Box): [number, number, number] {
  return [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, (b.z0 + b.z1) / 2];
}

/** Distancia horizontal (XZ) entre dos cajas; 0 si se solapan en planta. */
export function planDistance(a: Box, b: Box): number {
  const dx = Math.max(0, a.x0 - b.x1, b.x0 - a.x1);
  const dz = Math.max(0, a.z0 - b.z1, b.z0 - a.z1);
  return Math.hypot(dx, dz);
}

/** Rayo contra caja (método de las franjas). Devuelve la distancia de entrada o Infinity. */
export function rayBox(ox: number, oy: number, oz: number, dx: number, dy: number, dz: number, b: Box): number {
  let tmin = 0;
  let tmax = Infinity;
  const o = [ox, oy, oz];
  const d = [dx, dy, dz];
  const lo = [b.x0, b.y0, b.z0];
  const hi = [b.x1, b.y1, b.z1];
  for (let i = 0; i < 3; i++) {
    if (Math.abs(d[i]) < 1e-9) {
      if (o[i] < lo[i] || o[i] > hi[i]) return Infinity;
      continue;
    }
    let t1 = (lo[i] - o[i]) / d[i];
    let t2 = (hi[i] - o[i]) / d[i];
    if (t1 > t2) [t1, t2] = [t2, t1];
    if (t1 > tmin) tmin = t1;
    if (t2 < tmax) tmax = t2;
    if (tmin > tmax) return Infinity;
  }
  return tmin;
}

// Distancias a lo largo de la mirada en las que se busca la caja (más densas cerca).
const GAZE_SAMPLES = [0.3, 0.6, 1, 1.5, 2.2, 3, 4, 5.5, 7.5, 10, 13, 17, 22, 29, 38, 50, 65, 80, 100];

/** Coseno del menor ángulo entre la mirada y la caja: 1 si la mirada la atraviesa. Busca, a lo
 *  largo del rayo, el punto de la caja más cercano a cada muestra y se queda con el más centrado.
 *  Es lo que decide si una estructura cae dentro del cono de la mirada. */
export function gazeCos(
  ox: number, oy: number, oz: number,
  dx: number, dy: number, dz: number,
  b: Box, range: number,
): number {
  if (rayBox(ox, oy, oz, dx, dy, dz, b) <= range) return 1;
  let best = -1;
  for (const t of GAZE_SAMPLES) {
    if (t > range) break;
    const vx = Math.min(b.x1, Math.max(b.x0, ox + dx * t)) - ox;
    const vy = Math.min(b.y1, Math.max(b.y0, oy + dy * t)) - oy;
    const vz = Math.min(b.z1, Math.max(b.z0, oz + dz * t)) - oz;
    const len = Math.hypot(vx, vy, vz);
    if (len < 1e-6) return 1;
    if (len > range) continue;
    const c = (vx * dx + vy * dy + vz * dz) / len;
    if (c > best) best = c;
  }
  return best;
}
