import { CONFIG } from '../config';
import type { Box } from '../core/box';
import type { Vec3 } from '../core/frame';
import type { Control, Driver, Game } from '../core/Game';
import type { RouteStep } from '../levels/builder';
import type { Player } from '../player/Player';
import type { Collider } from '../world/World';

const TURN = 7; // rad/s: gira rápido, pero no al instante, como una persona
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export interface BotStatus {
  state: 'run' | 'done' | 'fail';
  step: number;
  total: number;
  kind: string;
  reason: string;
}

/**
 * Juega el nivel siguiendo la solución que escribe cada tramo, con las mismas reglas y la misma
 * física que un jugador (no se teletransporta). Si el bot no puede terminar, el nivel no está listo.
 */
export class Bot implements Driver {
  private i = 0;
  private t = 0;
  private phase = 0;
  private falls: number;
  private state: BotStatus['state'] = 'run';
  private reason = '';
  private hits: Collider[] = [];

  constructor(private game: Game) {
    this.falls = game.stats.falls;
  }

  private get steps(): RouteStep[] {
    return this.game.level.route;
  }

  status(): BotStatus {
    const state = this.game.state === 'complete' ? 'done' : this.state;
    return { state, step: this.i, total: this.steps.length, kind: this.steps[this.i]?.kind ?? '', reason: this.reason };
  }

  control(g: Game, dt: number): Control {
    const out: Control = { forward: 0, right: 0, jumpHeld: false, jumpPressed: false, echoPressed: false };
    const st = this.steps[this.i];
    if (this.state !== 'run' || !st) return out;
    if (g.stats.falls > this.falls) return this.fail('se cayó al vacío');
    this.t += dt;
    const p = g.player;
    switch (st.kind) {
      case 'walk':
      case 'enter': {
        if (st.kind === 'walk' && this.flat(p, st.to) < (st.tol ?? 0.4)) return this.next();
        const err = this.face(p, this.yawTo(p, st.to), st.kind === 'walk' ? (st.pitch ?? -0.15) : 0, dt);
        out.forward = err < 0.35 ? 1 : 0;
        if (this.t > 12) return this.fail('no llega caminando');
        break;
      }
      case 'jump': {
        const d = this.flat(p, st.to);
        const pitch = Math.atan2(st.to[1] - (p.y + CONFIG.player.eye), Math.max(d, 0.5));
        const err = this.face(p, this.yawTo(p, st.to), Math.max(-1.2, pitch), dt);
        if (this.phase === 0) {
          // carrerilla hasta el borde
          out.forward = err < 0.3 ? 1 : 0;
          if (p.grounded && err < 0.3 && this.edgeAhead(g)) {
            out.jumpPressed = true;
            out.jumpHeld = true;
            this.phase = 1;
          }
        } else {
          out.jumpHeld = true;
          out.forward = d > 0.6 ? 1 : 0;
          if (!p.grounded) this.phase = 2;
          else if (this.phase === 2) {
            if (Math.abs(p.y - st.to[1]) < 0.6 && d < 2.6) return this.next();
            return this.fail(`aterrizó fuera (a ${d.toFixed(1)} m)`);
          }
        }
        if (this.t > 8) return this.fail('no consigue saltar');
        break;
      }
      case 'echo': {
        const s = g.world.find(st.name);
        if (!s) return this.fail(`no existe ${st.name}`);
        if (s.echoAge >= 0) return this.next();
        const err = this.face(p, this.yawTo(p, st.at), this.pitchTo(p, st.at), dt);
        if (err < 0.03 && this.t > 0.2 && s.presence > 0.7 && g.echoes.target === s) out.echoPressed = true;
        if (this.t > 4) return this.fail(`no consigue recordar ${st.name} (apunta a ${g.echoes.target?.name ?? 'nada'})`);
        break;
      }
      case 'look': {
        this.face(p, this.yawTo(p, st.at), this.pitchTo(p, st.at), dt);
        if (this.t > st.time) return this.next();
        break;
      }
    }
    return out;
  }

  private next(): Control {
    this.i++;
    this.t = 0;
    this.phase = 0;
    return { forward: 0, right: 0, jumpHeld: false, jumpPressed: false, echoPressed: false };
  }

  private fail(reason: string): Control {
    this.state = 'fail';
    this.reason = reason;
    return { forward: 0, right: 0, jumpHeld: false, jumpPressed: false, echoPressed: false };
  }

  private flat(p: Player, to: Vec3): number {
    return Math.hypot(to[0] - p.x, to[2] - p.z);
  }

  private yawTo(p: Player, to: Vec3): number {
    return Math.atan2(-(to[0] - p.x), -(to[2] - p.z));
  }

  private pitchTo(p: Player, at: Vec3): number {
    return Math.atan2(at[1] - (p.y + CONFIG.player.eye), Math.max(0.01, this.flat(p, at)));
  }

  /** Gira hacia la orientación pedida a velocidad limitada; devuelve lo que falta. */
  private face(p: Player, yaw: number, pitch: number, dt: number): number {
    const max = TURN * dt;
    p.yaw += clamp(wrap(yaw - p.yaw), -max, max);
    p.pitch += clamp(pitch - p.pitch, -max, max);
    return Math.max(Math.abs(wrap(yaw - p.yaw)), Math.abs(pitch - p.pitch));
  }

  /** ¿Se acaba el suelo medio metro por delante? */
  private edgeAhead(g: Game): boolean {
    const p = g.player;
    const x = p.x - Math.sin(p.yaw) * 0.5;
    const z = p.z - Math.cos(p.yaw) * 0.5;
    const probe: Box = { x0: x - 0.1, y0: p.y - 0.3, z0: z - 0.1, x1: x + 0.1, y1: p.y - 0.02, z1: z + 0.1 };
    return g.world.query(probe, this.hits).length === 0;
  }
}
