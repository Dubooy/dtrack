import type { Tramo } from '../builder';

/** SENDERO: losas sueltas. Lo que queda a tu espalda se olvida; lo que miras se construye.
 *  Si te paras sin mirar dónde pisas, caes. */
export const sendero: Tramo = (b, fr, rng) => {
  b.beginBeat('SENDERO');
  const n = rng.int(7, 9);
  const W = 2.4;
  const D = 2.0;
  let f = 0;
  let x = 0;
  let run = 0;
  for (let i = 0; i < n; i++) {
    if (run >= 2 && rng.chance(0.6)) {
      const nx = x + rng.sign();
      x = Math.abs(nx) > 2.2 ? x - Math.sign(nx) : nx;
      run = 0;
    }
    b.phantom(`losa-${i + 1}`, [fr.box(x - W / 2, -0.5, f, x + W / 2, 0, f + D)]);
    b.go({ kind: 'walk', to: fr.p(x, 0, f + D / 2), pitch: -0.45, tol: 0.7 });
    f += D + 0.15;
    run++;
  }
  b.platform(fr, -3, 3, f, f + 6);
  b.checkpoint(fr.box(-3, 0, f, 3, 3, f + 6), fr.p(0, 0, f + 3), fr.yaw);
  b.exitPad = { halfW: 3, depth: 6 };
  b.terminal(fr.p(-2.1, 0, f + 4.7), ['REGISTRO 01.', 'EL SUELO RECUERDA HABER SIDO MIRADO.', 'PERO OLVIDA DEPRISA.']);
  b.go({ kind: 'walk', to: fr.p(0, 0, f + 3) });

  // columnata en paralelo: la repetición también es un mensaje
  b.arq.place(fr, b.arq.colonnade(rng), rng.sign() * 13, rng.range(-3, 0), f / 2, false, true, true);
  return fr.at(0, 0, f + 6);
};
