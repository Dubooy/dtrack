import type { Tramo } from '../builder';

/** DESPERTAR: plataforma inicial. Apareces mirando al arco; el camino sigue a tu izquierda y
 *  solo existe cuando lo buscas con la mirada. */
export const despertar: Tramo = (b, fr) => {
  b.beginBeat('DESPERTAR');
  const W = 6;
  const D = 12;
  b.platform(fr, -W, W, -D, 0, { thick: 1.6, depth: 1.5 });
  b.checkpoint(fr.box(-W, 0, -D, W, 3, 0), fr.p(-3.2, 0, -6.5), fr.at(0, 0, 0, 1).yaw);
  b.exitPad = { halfW: W, depth: D };

  // el arco: el mismo dibujo que el portal del final
  b.arq.place(fr, b.arq.arch(3.2, 5.2, 1.1), W - 0.9, 0, -6.5, false, true);
  // columnata rota al fondo
  b.decorAdd([
    fr.box(-4.4, 0, -11.6, -3.6, 6.2, -10.8),
    fr.box(-1.4, 0, -11.6, -0.6, 4.4, -10.8),
    fr.box(1.6, 0, -11.6, 2.4, 2.1, -10.8),
    fr.box(3.2, 0, -10.4, 5.4, 0.8, -9.6),
  ], true);
  b.terminal(fr.p(-0.6, 0, -9.2), ['SEÑAL RECUPERADA.', 'OBSERVADOR: 1.', 'ESTE LUGAR NO PERSISTE SIN TESTIGO.']);

  b.go({ kind: 'walk', to: fr.p(0, 0, -1.2), pitch: -0.15 });
  return fr;
};
