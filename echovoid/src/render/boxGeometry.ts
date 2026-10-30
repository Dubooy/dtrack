import { BufferGeometry, Float32BufferAttribute } from 'three';
import type { Box } from '../core/box';

// Caras de una caja: normal y esquinas en sentido antihorario vistas desde fuera
// (1 = lado máximo de la caja en ese eje).
const FACES: { n: [number, number, number]; c: [number, number, number][] }[] = [
  { n: [1, 0, 0], c: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]] },
  { n: [-1, 0, 0], c: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]] },
  { n: [0, 1, 0], c: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]] },
  { n: [0, -1, 0], c: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]] },
  { n: [0, 0, 1], c: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]] },
  { n: [0, 0, -1], c: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]] },
];

/** Une muchas cajas en una sola geometría (una sola llamada de dibujo). Cada vértice sabe a
 *  qué caja pertenece (centro, medidas y semilla) para el sombreado y la reconstrucción. */
export function buildBoxGeometry(boxes: Box[], salt = 0): BufferGeometry {
  const n = boxes.length * 24;
  const pos = new Float32Array(n * 3);
  const nor = new Float32Array(n * 3);
  const abox = new Float32Array(n * 4);
  const ahalf = new Float32Array(n * 3);
  const index: number[] = [];
  let v = 0;
  boxes.forEach((b, i) => {
    const cx = (b.x0 + b.x1) / 2;
    const cy = (b.y0 + b.y1) / 2;
    const cz = (b.z0 + b.z1) / 2;
    const seed = ((i * 7919 + salt * 104729) % 997) + 0.37;
    for (const f of FACES) {
      const base = v;
      for (const c of f.c) {
        pos.set([c[0] ? b.x1 : b.x0, c[1] ? b.y1 : b.y0, c[2] ? b.z1 : b.z0], v * 3);
        nor.set(f.n, v * 3);
        abox.set([cx, cy, cz, seed], v * 4);
        ahalf.set([(b.x1 - b.x0) / 2, (b.y1 - b.y0) / 2, (b.z1 - b.z0) / 2], v * 3);
        v++;
      }
      index.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
  });
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  g.setAttribute('aBox', new Float32BufferAttribute(abox, 4));
  g.setAttribute('aHalf', new Float32BufferAttribute(ahalf, 3));
  g.setIndex(index);
  g.computeBoundingSphere();
  g.computeBoundingBox();
  return g;
}
