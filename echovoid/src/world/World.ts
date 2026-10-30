import type { Mesh } from 'three';
import { boundsOf, containsPoint, overlaps, rayBox, type Box } from '../core/box';
import type { BlockUniforms } from '../render/blockMaterial';

/** solid: existe siempre. gaze: existe mientras se observa (o se recuerda). */
export type Rule = 'solid' | 'gaze';

export interface Structure {
  id: number;
  name: string;
  rule: Rule;
  memorable: boolean; // se puede convertir en eco
  tag: string;
  boxes: Box[];
  bounds: Box;
  presence: number; // 0 = olvidada, 1 = existe del todo
  lastSeen: number; // último instante (tiempo de juego) en que se observó
  observed: boolean;
  solid: boolean;
  echoAge: number; // segundos desde que se recordó; -1 si no es un eco
  permanent: boolean; // recuerdo fijado (los pilares tras la reconstrucción)
  warned: boolean; // ya avisó de que se deshacía bajo los pies
  mesh: Mesh | null;
  u: BlockUniforms | null;
}

export interface Collider {
  box: Box;
  owner: Structure;
}

const CELL = 6;
const cellKey = (ix: number, iz: number) => (ix + 32768) * 65536 + (iz + 32768);

/** Estructuras, colisionadores y zonas de estática de un nivel. */
export class World {
  readonly structures: Structure[] = [];
  readonly phantoms: Structure[] = [];
  readonly colliders: Collider[] = [];
  readonly blindZones: Box[] = [];
  private grid = new Map<number, number[]>();
  private marks = new Uint32Array(0);
  private mark = 0;

  create(name: string, rule: Rule, boxes: Box[], opts: { memorable?: boolean; tag?: string } = {}): Structure {
    const s: Structure = {
      id: this.structures.length,
      name,
      rule,
      memorable: rule === 'gaze' && (opts.memorable ?? true),
      tag: opts.tag ?? '',
      boxes,
      bounds: boundsOf(boxes),
      presence: rule === 'solid' ? 1 : 0,
      lastSeen: -1e9,
      observed: false,
      solid: rule === 'solid',
      echoAge: -1,
      permanent: false,
      warned: false,
      mesh: null,
      u: null,
    };
    this.structures.push(s);
    if (rule === 'gaze') this.phantoms.push(s);
    for (const b of boxes) this.colliders.push({ box: b, owner: s });
    return s;
  }

  find(name: string): Structure | undefined {
    return this.structures.find((s) => s.name === name);
  }

  /** Rejilla en planta para consultar colisiones rápido. Se llama una vez al terminar el nivel. */
  buildGrid(): void {
    this.grid.clear();
    this.colliders.forEach((c, i) => {
      for (let ix = Math.floor(c.box.x0 / CELL); ix <= Math.floor(c.box.x1 / CELL); ix++) {
        for (let iz = Math.floor(c.box.z0 / CELL); iz <= Math.floor(c.box.z1 / CELL); iz++) {
          const k = cellKey(ix, iz);
          let list = this.grid.get(k);
          if (!list) this.grid.set(k, (list = []));
          list.push(i);
        }
      }
    });
    this.marks = new Uint32Array(this.colliders.length);
    this.mark = 0;
  }

  /** Colisionadores sólidos ahora mismo que se solapan con la caja. */
  query(b: Box, out: Collider[]): Collider[] {
    out.length = 0;
    if (++this.mark >= 0xffffffff) {
      this.marks.fill(0);
      this.mark = 1;
    }
    for (let ix = Math.floor(b.x0 / CELL); ix <= Math.floor(b.x1 / CELL); ix++) {
      for (let iz = Math.floor(b.z0 / CELL); iz <= Math.floor(b.z1 / CELL); iz++) {
        const list = this.grid.get(cellKey(ix, iz));
        if (!list) continue;
        for (const i of list) {
          if (this.marks[i] === this.mark) continue;
          this.marks[i] = this.mark;
          const c = this.colliders[i];
          if (c.owner.solid && overlaps(c.box, b)) out.push(c);
        }
      }
    }
    return out;
  }

  /** Distancia hasta el primer obstáculo sólido en la dirección dada (o maxT si no hay). */
  raycast(ox: number, oy: number, oz: number, dx: number, dy: number, dz: number, maxT: number, skip?: Structure): number {
    let best = maxT;
    for (const c of this.colliders) {
      if (!c.owner.solid || c.owner === skip) continue;
      const t = rayBox(ox, oy, oz, dx, dy, dz, c.box);
      if (t < best) best = t;
    }
    return best;
  }

  inBlind(x: number, y: number, z: number): boolean {
    for (const b of this.blindZones) if (containsPoint(b, x, y, z)) return true;
    return false;
  }

  /** Distancia a la zona de estática más cercana (0 dentro). */
  blindDistance(x: number, y: number, z: number): number {
    let best = Infinity;
    for (const b of this.blindZones) {
      const dx = Math.max(0, b.x0 - x, x - b.x1);
      const dy = Math.max(0, b.y0 - y, y - b.y1);
      const dz = Math.max(0, b.z0 - z, z - b.z1);
      best = Math.min(best, Math.hypot(dx, dy, dz));
    }
    return best;
  }
}
