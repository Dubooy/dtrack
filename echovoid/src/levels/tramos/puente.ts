import type { Tramo } from '../builder';

/** PUENTE: la primera estructura que solo existe mientras la miras. */
export const puente: Tramo = (b, fr, rng) => {
  b.beginBeat('PUENTE');
  const L = rng.range(12, 15);
  b.phantom('puente', [fr.box(-1.5, -0.7, 0, 1.5, 0, L)]);
  b.platform(fr, -3, 3, L, L + 6);
  b.checkpoint(fr.box(-3, 0, L, 3, 3, L + 6), fr.p(0, 0, L + 3), fr.yaw);
  b.exitPad = { halfW: 3, depth: 6 };
  b.beam(fr.p(2.3, 0, L + 4.6), 45, 0.6);

  // torres gemelas: la misma torre a ambos lados del puente
  const tower = b.arq.tower(rng);
  const drop = rng.range(-7, -3);
  for (const side of [-1, 1]) b.arq.place(fr, tower, side * 12.5, drop, L / 2, true, true, true);

  b.go({ kind: 'walk', to: fr.p(0, 0, L + 3), pitch: -0.12 });
  return fr.at(0, 0, L + 6);
};
