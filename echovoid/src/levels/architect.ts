import { box, boundsOf, expand, overlaps, planDistance, translate, type Box } from '../core/box';
import type { Frame } from '../core/frame';
import type { Rng } from '../core/rng';
import type { LevelBuilder } from './builder';

const TAU = Math.PI * 2;
const swapXZ = (list: Box[]): Box[] => list.map((b) => box(b.z0, b.y0, b.x0, b.z1, b.y1, b.x1));

type ModuleKind = 'torre' | 'arco' | 'columnata' | 'escalera' | 'sala' | 'monolito' | 'puente' | 'restos';
const MODULES: ModuleKind[] = ['torre', 'torre', 'torre', 'arco', 'columnata', 'escalera', 'sala', 'monolito', 'puente', 'restos'];

/**
 * Arquitectura procedural: piezas (torres, arcos, columnatas, escaleras a ninguna parte, salas
 * abiertas al vacío…) generadas con reglas y repartidas alrededor del camino sin invadirlo.
 * Las piezas se describen en coordenadas relativas: base en y = 0, centradas, eje largo en X.
 */
export class Architect {
  private placed: Box[] = [];

  constructor(private b: LevelBuilder) {}

  /** Coloca una pieza en un marco local. Si alongLateral, su eje X sigue el lateral del marco.
   *  Con `check`, no la pone si invadiría el camino u otra pieza (y devuelve false). */
  place(fr: Frame, rel: Box[], lx: number, ly: number, lf: number, alongLateral: boolean, solid: boolean, check = false): boolean {
    const rot = alongLateral === fr.lateralIsX ? rel : swapXZ(rel);
    const [x, y, z] = fr.p(lx, ly, lf);
    const out = translate(rot, x, y, z);
    const bb = boundsOf(out);
    if (check && !this.isClear(bb, 3)) return false;
    this.b.decorAdd(out, solid);
    this.placed.push(bb);
    return true;
  }

  // ---------- piezas ----------

  /** Isla flotante: losa con panza escalonada. */
  island(w: number, d: number, rng: Rng, depth = 1): Box[] {
    const top = box(-w / 2, -1.2, -d / 2, w / 2, 0, d / 2);
    return [top, ...this.underside(top, rng, depth)];
  }

  /** Panza de una isla: capas cada vez más estrechas, rotas en bloques, y alguna estalactita. */
  underside(top: Box, rng: Rng, depth = 1): Box[] {
    const out: Box[] = [];
    let { x0, x1, z0, z1 } = top;
    let y = top.y0;
    const layers = Math.max(1, Math.round(rng.range(2, 4.5) * Math.min(depth, 1.5)));
    for (let i = 0; i < layers; i++) {
      x0 += rng.range(0.25, 0.9);
      x1 -= rng.range(0.25, 0.9);
      z0 += rng.range(0.25, 0.9);
      z1 -= rng.range(0.25, 0.9);
      if (x1 - x0 < 0.8 || z1 - z0 < 0.8) break;
      const h = rng.range(0.6, 1.5) * depth;
      const split = rng.int(1, 3);
      const alongX = x1 - x0 > z1 - z0;
      for (let k = 0; k < split; k++) {
        const a = k / split;
        const c = (k + 1) / split;
        const hh = h * rng.range(0.6, 1.4);
        out.push(alongX
          ? box(x0 + (x1 - x0) * a, y - hh, z0, x0 + (x1 - x0) * c, y, z1)
          : box(x0, y - hh, z0 + (z1 - z0) * a, x1, y, z0 + (z1 - z0) * c));
      }
      y -= h;
    }
    const n = rng.int(1, 3);
    for (let k = 0; k < n; k++) {
      const s = rng.range(0.4, 0.9);
      const cx = rng.range(top.x0 + 0.8, top.x1 - 0.8);
      const cz = rng.range(top.z0 + 0.8, top.z1 - 0.8);
      out.push(box(cx - s / 2, y - rng.range(1, 4) * depth, cz - s / 2, cx + s / 2, top.y0, cz + s / 2));
    }
    return out;
  }

  tower(rng: Rng): Box[] {
    let w = rng.range(2.4, 4.6);
    const h = rng.range(9, 24);
    const out = this.island(w + rng.range(2, 3.5), w + rng.range(2, 3.5), rng);
    let y = 0;
    while (y < h) {
      const seg = Math.min(rng.range(2.5, 6), h - y + 0.01);
      out.push(box(-w / 2, y, -w / 2, w / 2, y + seg, w / 2));
      if (rng.chance(0.45)) {
        const e = w / 2 + rng.range(0.25, 0.6);
        out.push(box(-e, y + seg - 0.35, -e, e, y + seg, e));
      }
      if (rng.chance(0.3) && seg > 1.2) {
        const bw = rng.range(0.9, 1.6);
        const by = y + rng.range(0.5, seg - 0.4);
        const sx = rng.sign();
        out.push(box((sx * w) / 2, by - 0.4, -bw / 2, sx * (w / 2 + rng.range(0.8, 1.8)), by, bw / 2));
      }
      y += seg;
      if (rng.chance(0.4)) w *= rng.range(0.72, 0.9);
    }
    if (rng.chance(0.5)) {
      const s = Math.max(0.5, w * 0.3);
      out.push(box(-s / 2, y, -s / 2, s / 2, y + rng.range(2, 6), s / 2));
    } else {
      const m = w / 2;
      const s = Math.max(0.4, w * 0.18);
      for (const [ax, az] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        out.push(box(ax * m, y, az * m, ax * (m - s), y + 0.8, az * (m - s)));
      }
    }
    return out;
  }

  /** Arco monumental (el mismo dibujo sirve para el inicio y para el portal). */
  arch(span: number, height: number, thick: number): Box[] {
    const p = span / 2;
    const t = thick / 2;
    return [
      box(-p - thick, 0, -t, -p, height, t),
      box(p, 0, -t, p + thick, height, t),
      box(-p - thick - 0.3, height, -t - 0.15, p + thick + 0.3, height + thick * 0.8, t + 0.15),
      box(-p * 0.55, height + thick * 0.8, -t, p * 0.55, height + thick * 1.3, t),
      box(-p - thick - 0.2, 0, -t - 0.2, -p + 0.15, 0.35, t + 0.2),
      box(p - 0.15, 0, -t - 0.2, p + thick + 0.2, 0.35, t + 0.2),
    ];
  }

  gate(rng: Rng): Box[] {
    const span = rng.range(3, 6);
    const t = rng.range(0.9, 1.5);
    return [...this.island(span + 2 * t + 3, t + 4, rng), ...this.arch(span, rng.range(5, 9), t)];
  }

  colonnade(rng: Rng): Box[] {
    const n = rng.int(4, 7);
    const sp = rng.range(2.6, 3.6);
    const ph = rng.range(4, 8);
    const pw = rng.range(0.7, 1.1);
    const len = (n - 1) * sp;
    const out = this.island(len + 4, 5, rng);
    for (let i = 0; i < n; i++) {
      const x = -len / 2 + i * sp;
      if (rng.chance(0.15)) {
        out.push(box(x - pw, 0, 0.6, x + pw * 2.5, pw, 0.6 + pw)); // columna caída
        continue;
      }
      out.push(box(x - pw / 2, 0, -pw / 2, x + pw / 2, rng.chance(0.2) ? ph * rng.range(0.35, 0.8) : ph, pw / 2));
    }
    if (rng.chance(0.55)) {
      const a = rng.int(0, n - 2);
      const c = Math.min(n - 1, a + rng.int(1, 3));
      out.push(box(-len / 2 + a * sp - pw / 2, ph, -pw / 2 - 0.1, -len / 2 + c * sp + pw / 2, ph + 0.7, pw / 2 + 0.1));
    }
    return out;
  }

  /** Escalera que no conduce a ningún lugar. */
  stairs(rng: Rng): Box[] {
    const n = rng.int(7, 14);
    const run = rng.range(0.9, 1.2);
    const w = rng.range(1.6, 2.4);
    const out = translate(this.island(5, w + 3, rng), -2.5, 0, 0);
    for (let i = 0; i < n; i++) out.push(box(i * run, (i + 1) * 0.5 - 0.6, -w / 2, (i + 1) * run, (i + 1) * 0.5, w / 2));
    if (rng.chance(0.45)) {
      const x = n * run;
      const y = n * 0.5;
      out.push(box(x, y - 0.6, -w / 2 - 0.5, x + 2.5, y, w / 2 + 0.5));
      out.push(...translate(swapXZ(this.arch(1.6, 2.6, 0.5)), x + 1.25, y, 0));
    }
    return out;
  }

  /** Habitación abierta al vacío. */
  room(rng: Rng): Box[] {
    const w = rng.range(6, 10);
    const d = rng.range(5, 8);
    const h = rng.range(3, 4.5);
    const t = 0.5;
    const out = this.island(w, d, rng);
    const wx = rng.range(-w / 4, w / 4);
    const ww = rng.range(1, 2);
    out.push(box(-w / 2, 0, d / 2 - t, wx - ww / 2, h, d / 2));
    out.push(box(wx + ww / 2, 0, d / 2 - t, w / 2, h, d / 2));
    out.push(box(wx - ww / 2, 0, d / 2 - t, wx + ww / 2, h * 0.35, d / 2));
    out.push(box(wx - ww / 2, h * 0.8, d / 2 - t, wx + ww / 2, h, d / 2));
    const sx0 = rng.sign() > 0 ? w / 2 - t : -w / 2;
    const door = rng.range(1.2, 1.8);
    out.push(box(sx0, 0, -d / 2, sx0 + t, h, -door / 2));
    out.push(box(sx0, 0, door / 2, sx0 + t, h, d / 2));
    out.push(box(sx0, h - 0.6, -door / 2, sx0 + t, h, door / 2));
    if (rng.chance(0.5)) out.push(box(-w / 2, h, 0, (w / 2) * rng.range(0, 1), h + 0.4, d / 2));
    return out;
  }

  monolith(rng: Rng): Box[] {
    const out = this.island(5, 5, rng);
    const h = rng.range(6, 13);
    const w = rng.range(0.9, 1.4);
    const d = rng.range(2.2, 3.2);
    out.push(box(-w / 2, 0, -d / 2, w / 2, h, d / 2));
    if (rng.chance(0.6)) {
      const s = rng.range(0.6, 1.2);
      const y = h + rng.range(1.2, 3);
      out.push(box(-s / 2, y, -s / 2, s / 2, y + s, s / 2));
    }
    return out;
  }

  /** Puente interrumpido, con pilares que se pierden en el vacío. */
  brokenBridge(rng: Rng): Box[] {
    const out: Box[] = [];
    const L = rng.range(16, 30);
    const w = rng.range(2, 3);
    let x = -L / 2;
    let first = true;
    while (x < L / 2) {
      const seg = rng.range(2, 4.5);
      if (first || rng.chance(0.75)) out.push(box(x, -0.8, -w / 2, Math.min(L / 2, x + seg), 0, w / 2));
      first = false;
      x += seg + (rng.chance(0.3) ? rng.range(0.5, 2) : 0);
    }
    for (let px = -L / 2 + rng.range(2, 5); px < L / 2; px += rng.range(7, 11)) {
      const pw = rng.range(0.8, 1.3);
      out.push(box(px - pw / 2, -rng.range(8, 18), -pw / 2, px + pw / 2, -0.8, pw / 2));
    }
    for (const e of [-1, 1]) {
      for (let k = 0; k < 3; k++) {
        const s = rng.range(0.3, 0.8);
        const bx = e * (L / 2 + 0.5 + k * rng.range(0.6, 1.2));
        out.push(box(bx - s / 2, -0.8 - k * 0.7 - s, -s / 2, bx + s / 2, -0.8 - k * 0.7, s / 2));
      }
    }
    return out;
  }

  debris(rng: Rng, radius: number): Box[] {
    const out: Box[] = [];
    const n = rng.int(5, 11);
    for (let k = 0; k < n; k++) {
      const s = rng.range(0.3, 1.8);
      const x = rng.range(-radius, radius);
      const y = rng.range(-radius * 0.6, radius * 0.6);
      const z = rng.range(-radius, radius);
      out.push(box(x - s / 2, y - s / 2, z - s / 2, x + s / 2, y + s / 2, z + s / 2));
    }
    return out;
  }

  /** Mole lejana: da escala al horizonte. */
  giant(rng: Rng): Box[] {
    const out: Box[] = [];
    let w = rng.range(8, 20);
    let d = w * rng.range(0.6, 1.4);
    const base = box(-w / 2, -2, -d / 2, w / 2, 0, d / 2);
    const h = rng.range(40, 110);
    let y = 0;
    while (y < h) {
      const seg = rng.range(8, 22);
      out.push(box(-w / 2, y, -d / 2, w / 2, Math.min(h, y + seg), d / 2));
      y += seg;
      w *= rng.range(0.7, 0.95);
      d *= rng.range(0.7, 0.95);
    }
    if (rng.chance(0.5)) out.push(box(-w * 0.15, y, -w * 0.15, w * 0.15, y + rng.range(6, 20), w * 0.15));
    out.push(base, ...this.underside(base, rng, 4));
    return out;
  }

  // ---------- reparto ----------

  /** Viste el nivel: piezas junto al camino, molas en el horizonte, restos junto a la estática. */
  dress(rng: Rng): void {
    const pts = this.b.checkpoints.map((c) => c.pos);
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = pts[i];
      const c = pts[i + 1];
      const dx = c[0] - a[0];
      const dz = c[2] - a[2];
      const len = Math.hypot(dx, dz) || 1;
      const nx = -dz / len;
      const nz = dx / len;
      const alongX = Math.abs(dx) > Math.abs(dz);
      for (let s = rng.range(2, 7); s < len; s += rng.range(8, 13)) {
        for (const side of [-1, 1]) {
          if (!rng.chance(0.72)) continue;
          const dist = rng.range(12, 26);
          const t = s / len;
          this.module(rng, a[0] + dx * t + nx * side * dist, a[1] + (c[1] - a[1]) * t + rng.range(-8, 1.5), a[2] + dz * t + nz * side * dist, alongX);
        }
      }
    }

    const all = boundsOf(this.b.pathBoxes);
    const cx = (all.x0 + all.x1) / 2;
    const cz = (all.z0 + all.z1) / 2;
    const rad = Math.max(all.x1 - all.x0, all.z1 - all.z0) / 2;
    for (let k = 0; k < 18; k++) {
      const ang = (k / 18) * TAU + rng.range(-0.12, 0.12);
      const r = rad + rng.range(45, 95);
      this.tryPlace(this.giant(rng), cx + Math.cos(ang) * r, all.y0 + rng.range(-45, -15), cz + Math.sin(ang) * r, 2, false);
    }
    for (let k = 0; k < 9; k++) {
      const w = rng.range(14, 30);
      const top = box(-w / 2, -rng.range(8, 20), -w / 2, w / 2, 0, w / 2);
      this.tryPlace([top, ...this.underside(top, rng, 3)], rng.range(all.x0 - 30, all.x1 + 30), all.y0 - rng.range(55, 85), rng.range(all.z0 - 30, all.z1 + 30), 0, false);
    }
    for (const st of this.b.statics) {
      for (let k = 0; k < 4; k++) {
        const ang = rng.range(0, TAU);
        const r = Math.max(st.x1 - st.x0, st.z1 - st.z0) / 2 + rng.range(5, 12);
        this.tryPlace(this.debris(rng, 3.5), (st.x0 + st.x1) / 2 + Math.cos(ang) * r, (st.y0 + st.y1) / 2 + rng.range(-3, 5), (st.z0 + st.z1) / 2 + Math.sin(ang) * r, 2, false);
      }
    }
  }

  private module(rng: Rng, x: number, y: number, z: number, alongX: boolean): void {
    const kind = rng.pick(MODULES);
    let rel: Box[];
    switch (kind) {
      case 'torre': rel = this.tower(rng); break;
      case 'arco': rel = this.gate(rng); break;
      case 'columnata': rel = this.colonnade(rng); break;
      case 'escalera': rel = this.stairs(rng); break;
      case 'sala': rel = this.room(rng); break;
      case 'monolito': rel = this.monolith(rng); break;
      case 'puente': rel = this.brokenBridge(rng); break;
      default: rel = this.debris(rng, 4); break;
    }
    if (!alongX) rel = swapXZ(rel);
    if (kind === 'torre' && rng.chance(0.4)) {
      // repetición deliberada: la misma torre, tres veces en fila
      const step = rng.range(9, 13);
      for (let k = 0; k < 3; k++) this.tryPlace(rel, x + (alongX ? k * step : 0), y, z + (alongX ? 0 : k * step), 4);
      return;
    }
    this.tryPlace(rel, x, y, z, 4);
  }

  private tryPlace(rel: Box[], x: number, y: number, z: number, margin: number, solid = true): boolean {
    const out = translate(rel, x, y, z);
    const bb = boundsOf(out);
    if (!this.isClear(bb, margin)) return false;
    const near = solid && this.b.pathBoxes.some((p) => planDistance(p, bb) < 30);
    this.b.decorAdd(out, near);
    this.placed.push(bb);
    return true;
  }

  /** ¿Cabe aquí sin invadir el camino (ni la caída bajo él), la estática u otra pieza? */
  private isClear(bb: Box, margin: number): boolean {
    for (const p of this.b.pathBoxes) if (overlaps(expand(p, margin, margin + 4, margin, 30), bb)) return false;
    for (const s of this.b.statics) if (overlaps(expand(s, 1.5, 1.5, 1.5), bb)) return false;
    for (const q of this.placed) if (overlaps(expand(q, 1.5, 1.5, 1.5), bb)) return false;
    return true;
  }
}
