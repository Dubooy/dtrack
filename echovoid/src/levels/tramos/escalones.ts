import type { Tramo } from '../builder';

/** ESCALONES: piedras que se deshacen en cuanto miras a la siguiente. Hay que saltar a tiempo
 *  (o mirar con más intención). */
export const escalones: Tramo = (b, fr, rng) => {
  b.beginBeat('ESCALONES');
  const n = rng.int(3, 5);
  const S = 2.4;
  let f = 0;
  let y = 0;
  for (let i = 0; i < n; i++) {
    f += rng.range(2.0, 2.6);
    y += rng.range(0.3, 0.5);
    const x = (i % 2 === 0 ? 1 : -1) * rng.range(0.6, 1.3);
    b.phantom(`escalon-${i + 1}`, [fr.box(x - S / 2, y - 0.8, f, x + S / 2, y, f + S)]);
    b.go({ kind: 'jump', to: fr.p(x, y, f + S / 2) });
    f += S;
  }
  f += rng.range(2.0, 2.4);
  y += rng.range(0, 0.4);
  b.platform(fr, -3, 3, f, f + 6, { top: y });
  b.checkpoint(fr.box(-3, y, f, 3, y + 3, f + 6), fr.p(0, y, f + 3), fr.yaw);
  b.exitPad = { halfW: 3, depth: 6 };
  b.go({ kind: 'jump', to: fr.p(0, y, f + 1.6) });
  b.go({ kind: 'walk', to: fr.p(0, y, f + 3) });

  // un puente roto paralelo, como un eco de piedra del propio camino
  b.arq.place(fr, b.arq.brokenBridge(rng), rng.sign() * 15, y - 3, f / 2, false, true, true);
  return fr.at(0, y, f + 6);
};
