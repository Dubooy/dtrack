import type { Tramo } from '../builder';

/** ESCALERA: sube junto a una torre y solo existe mientras la miras. Desde el balcón, quien
 *  mira hacia abajo encuentra un camino oculto. */
export const escalera: Tramo = (b, fr, rng) => {
  b.beginBeat('ESCALERA');
  const t = b.turnFrom(fr, rng.sign());
  const N = 10;
  const RISE = 0.5;
  const HALF = 1.15;
  const steps = [];
  for (let i = 0; i < N; i++) steps.push(t.box(-HALF, (i + 1) * RISE - 0.8, i, HALF, (i + 1) * RISE, i + 1));
  b.phantom('escalera', steps);
  const top = N * RISE;
  const F = N;

  // la torre a la que se arrima la escalera
  const ts = rng.sign();
  b.decorAdd([
    t.box(ts * 1.9, -14, 1, ts * 6.3, top + 8, 9),
    t.box(ts * 1.6, top + 8, 0.6, ts * 6.6, top + 8.6, 9.4),
    t.box(ts * 3, top + 8.6, 3, ts * 5.2, top + 11.5, 7),
    t.box(ts * 1.6, 2.5, 3.5, ts * 1.9, 3.3, 6.5),
  ], true);

  b.platform(t, -3, 3, F, F + 6, { top, depth: 0.7 });
  b.checkpoint(t.box(-3, top, F, 3, top + 3, F + 6), t.p(0, top, F + 3), t.yaw);
  b.exitPad = { halfW: 3, depth: 6 };
  b.terminal(t.p(ts * 2.2, top, F + 4.8), ['AL FRENTE: ZONA SIN TESTIGOS.', 'EN LA ESTÁTICA NADIE OBSERVA.', 'LO QUE RECUERDAS, PERMANECE.  [E]']);
  b.beam(t.p(-ts * 2.4, top, F + 5.2), 40, 0.6);

  // camino oculto: escalones que bajan por el lado contrario a la torre
  const ss = -ts;
  const hidden = [];
  for (let j = 0; j < 6; j++) {
    hidden.push(t.box(ss * (3 + j), top - (j + 1) * 0.5 - 0.6, F + 1.6, ss * (4 + j), top - (j + 1) * 0.5, F + 3.8));
  }
  b.phantom('camino-oculto', hidden);
  b.platform(t, ss * 9, ss * 13, F + 0.7, F + 4.7, { top: top - 3, depth: 0.8 });
  b.terminal(t.p(ss * 11.8, top - 3, F + 2.7), ['REGISTRO 07.', 'HE CRUZADO ESTE PUENTE 312 VECES.', 'NUNCA ES EL MISMO PUENTE.']);

  b.go({ kind: 'walk', to: t.p(0, 0, -1.4), pitch: -0.1 });
  b.go({ kind: 'walk', to: t.p(0, top, F + 3), pitch: 0.12 });
  return t.at(0, top, F + 6);
};
