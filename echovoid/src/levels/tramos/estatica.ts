import type { Tramo } from '../builder';

/** ESTÁTICA: dentro nadie observa, así que nada se sostiene por la mirada. El puente solo
 *  aguanta si lo recuerdas (E) antes de entrar. */
export const estatica: Tramo = (b, fr, rng) => {
  b.beginBeat('ESTÁTICA');
  const L = rng.range(15, 18);
  b.phantom('puente-estatica', [fr.box(-1.25, -0.6, 0, 1.25, 0, L)]);
  b.blind(fr.box(-7, -7, 2.6, 7, 8, L - 2.6));
  b.platform(fr, -3, 3, L, L + 6);
  b.checkpoint(fr.box(-3, 0, L, 3, 3, L + 6), fr.p(0, 0, L + 3), fr.yaw);
  b.exitPad = { halfW: 3, depth: 6 };

  // dos monolitos marcan la entrada
  for (const side of [-1, 1]) b.decorAdd([fr.box(side * 8.6, -9, 1.2, side * 10.2, 9 + rng.range(0, 3), 3.4)], true);

  b.go({ kind: 'walk', to: fr.p(0, 0, -0.8), pitch: -0.15 });
  b.go({ kind: 'echo', at: fr.p(0, -0.3, 1.6), name: 'puente-estatica' });
  b.go({ kind: 'walk', to: fr.p(0, 0, L + 3), pitch: -0.1 });
  return fr.at(0, 0, L + 6);
};
