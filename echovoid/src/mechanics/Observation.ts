import type { Vector3 } from 'three';
import { CONFIG } from '../config';
import { gazeCos, overlaps, type Box } from '../core/box';
import type { Structure, World } from '../world/World';

export interface ObservationEvents {
  /** Una estructura empieza a reconstruirse porque la miras. */
  materialize(s: Structure): void;
  /** El suelo que pisas ha empezado a olvidarse. */
  groundFading(s: Structure): void;
}

/**
 * OBSERVAR = EXISTIR. Cada estructura «fantasma» gana presencia mientras cae dentro del cono de
 * la mirada y la pierde poco después de salir de él, salvo que sea un eco. Solo sostiene al
 * jugador con presencia suficiente, y nunca se solidifica encima de él.
 */
export class Observation {
  private cosHalf = Math.cos(CONFIG.observation.halfAngle);

  update(
    world: World,
    dt: number,
    now: number,
    eye: Vector3,
    dir: Vector3,
    playerBox: Box,
    blind: boolean,
    ground: Structure | null,
    ev: ObservationEvents,
  ): void {
    const O = CONFIG.observation;
    for (const s of world.phantoms) {
      const seen = !blind && this.inGaze(s.bounds, eye, dir);
      s.observed = seen;
      if (seen) {
        s.lastSeen = now;
        s.warned = false;
      }
      const held = s.echoAge >= 0 || s.permanent;
      const before = s.presence;
      if (seen || held) s.presence = Math.min(1, s.presence + dt / O.materializeTime);
      else if (now - s.lastSeen > O.forgetDelay) s.presence = Math.max(0, s.presence - dt / O.fadeTime);
      if (before < 0.02 && s.presence >= 0.02) ev.materialize(s);

      if (!s.solid) {
        if (s.presence >= O.solidOn && !s.boxes.some((b) => overlaps(b, playerBox))) s.solid = true;
      } else if (s.presence <= O.solidOff) s.solid = false;

      if (s === ground && !seen && !held && !s.warned && now - s.lastSeen > O.forgetDelay) {
        s.warned = true;
        ev.groundFading(s);
      }
    }
  }

  /** ¿Cae la caja dentro del cono de la mirada? */
  inGaze(b: Box, eye: Vector3, dir: Vector3): boolean {
    return gazeCos(eye.x, eye.y, eye.z, dir.x, dir.y, dir.z, b, CONFIG.observation.range) >= this.cosHalf;
  }
}
