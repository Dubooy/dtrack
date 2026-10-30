import type { Vector3 } from 'three';
import { CONFIG } from '../config';
import { centerOf, gazeCos, rayBox } from '../core/box';
import type { Structure, World } from '../world/World';

export type EchoResult = 'new' | 'refresh' | 'none';

/**
 * RECORDAR = CONSERVAR. Pulsando E sobre una estructura memorizable que estás viendo, se
 * convierte en eco: magenta y presente aunque dejes de mirarla, durante un tiempo limitado.
 * Caben CONFIG.echoes.max a la vez; uno nuevo desplaza al más antiguo.
 */
export class Echoes {
  /** De más antiguo a más reciente. */
  readonly slots: Structure[] = [];
  target: Structure | null = null;

  update(dt: number, now: number, onExpire: (s: Structure) => void): void {
    for (const s of [...this.slots]) {
      s.echoAge += dt;
      if (s.echoAge >= CONFIG.echoes.duration) {
        this.release(s, now);
        onExpire(s);
      }
    }
  }

  /** Lo que se recordaría ahora: lo que hay justo bajo la retícula (o casi). */
  findTarget(world: World, eye: Vector3, dir: Vector3): Structure | null {
    const E = CONFIG.echoes;
    let best: Structure | null = null;
    let bestT = E.range;
    for (const s of world.phantoms) {
      if (!s.memorable || s.permanent || s.presence < 0.35) continue;
      for (const b of s.boxes) {
        const t = rayBox(eye.x, eye.y, eye.z, dir.x, dir.y, dir.z, b);
        if (t < bestT) {
          bestT = t;
          best = s;
        }
      }
    }
    if (best) return world.raycast(eye.x, eye.y, eye.z, dir.x, dir.y, dir.z, bestT, best) < bestT ? null : best;

    // ayuda de puntería: la estructura más cercana a la retícula dentro de un ángulo pequeño
    let bestCos = Math.cos(E.aimAssist);
    for (const s of world.phantoms) {
      if (!s.memorable || s.permanent || s.presence < 0.35) continue;
      const c = gazeCos(eye.x, eye.y, eye.z, dir.x, dir.y, dir.z, s.bounds, E.range);
      if (c <= bestCos) continue;
      const [cx, cy, cz] = centerOf(s.bounds);
      const d = Math.hypot(cx - eye.x, cy - eye.y, cz - eye.z);
      if (world.raycast(eye.x, eye.y, eye.z, (cx - eye.x) / d, (cy - eye.y) / d, (cz - eye.z) / d, d, s) < d - 0.5) continue;
      bestCos = c;
      best = s;
    }
    return best;
  }

  create(now: number): EchoResult {
    const s = this.target;
    if (!s) return 'none';
    if (s.echoAge >= 0) {
      s.echoAge = 0;
      this.slots.splice(this.slots.indexOf(s), 1);
      this.slots.push(s);
      return 'refresh';
    }
    while (this.slots.length >= CONFIG.echoes.max) this.release(this.slots[0], now);
    s.echoAge = 0;
    s.presence = Math.max(s.presence, 0.6);
    this.slots.push(s);
    return 'new';
  }

  /** El eco se olvida: vuelve a depender de la mirada. */
  release(s: Structure, now: number): void {
    const i = this.slots.indexOf(s);
    if (i >= 0) this.slots.splice(i, 1);
    s.echoAge = -1;
    if (now >= 0) s.lastSeen = Math.max(s.lastSeen, now);
  }

  clear(): void {
    for (const s of [...this.slots]) this.release(s, -1);
  }
}
