import { box, type Box } from './box';

export type Vec3 = [number, number, number];
/** Rumbo en pasos de 90°: 0 = -Z (el «adelante» inicial), 1 = +X, 2 = +Z, 3 = -X. */
export type Heading = 0 | 1 | 2 | 3;

const FX = [0, 1, 0, -1];
const FZ = [-1, 0, 1, 0];

/**
 * Marco local para diseñar tramos sin pensar en coordenadas del mundo:
 * x = lateral (derecha +), y = altura, f = avance. El origen suele ser el borde por el que
 * sigue el camino. Al girar 90° todo sigue siendo cajas alineadas con los ejes.
 */
export class Frame {
  constructor(
    readonly x: number,
    readonly y: number,
    readonly z: number,
    readonly h: Heading,
  ) {}

  get fx(): number { return FX[this.h]; }
  get fz(): number { return FZ[this.h]; }
  get rx(): number { return FX[(this.h + 1) % 4]; }
  get rz(): number { return FZ[(this.h + 1) % 4]; }
  /** true si el eje lateral del marco es el X del mundo. */
  get lateralIsX(): boolean { return this.h % 2 === 0; }

  /** Punto local → mundo. */
  p(lx: number, ly: number, lf: number): Vec3 {
    return [this.x + this.rx * lx + this.fx * lf, this.y + ly, this.z + this.rz * lx + this.fz * lf];
  }

  /** Caja local → caja del mundo. */
  box(lx0: number, ly0: number, lf0: number, lx1: number, ly1: number, lf1: number): Box {
    const a = this.p(lx0, ly0, lf0);
    const c = this.p(lx1, ly1, lf1);
    return box(a[0], a[1], a[2], c[0], c[1], c[2]);
  }

  /** Nuevo marco en un punto local, girado `turn` pasos (+1 derecha, -1 izquierda). */
  at(lx: number, ly: number, lf: number, turn = 0): Frame {
    const q = this.p(lx, ly, lf);
    return new Frame(q[0], q[1], q[2], ((((this.h + turn) % 4) + 4) % 4) as Heading);
  }

  /** Giro de cámara que mira hacia el avance del marco. */
  get yaw(): number {
    return -this.h * (Math.PI / 2);
  }
}
