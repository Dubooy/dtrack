import type { Tramo } from '../builder';

/** DOS ECOS: una piedra y un puente que gira, los dos dentro de la estática. Hay que
 *  recordarlos ambos antes de entrar, y en el orden en que se van a pisar. */
export const dosEcos: Tramo = (b, fr, rng) => {
  b.beginBeat('DOS ECOS');
  const s = b.lastTurn === 1 ? -1 : 1;
  const A0 = 2.4;
  const A1 = 5.4;
  const AM = (A0 + A1) / 2;
  b.phantom('piedra', [fr.box(-1.5, -0.8, A0, 1.5, 0, A1)]);
  const t = fr.at(s * 1.5, 0, AM, s);
  b.lastTurn = s;
  const L = rng.range(10, 12);
  b.phantom('puente-giro', [t.box(-0.9, -0.6, 0, 0.9, 0, L)]);
  b.blind(fr.box(-3.6, -7, 0.5, 3.6, 7, 8.6));
  b.blind(t.box(-4, -7, 2.1, 4, 7, L - 1.4));
  b.platform(t, -3, 3, L, L + 6);
  b.checkpoint(t.box(-3, 0, L, 3, 3, L + 6), t.p(0, 0, L + 3), t.yaw);
  b.exitPad = { halfW: 3, depth: 6 };
  b.terminal(fr.p(-s * 2.2, 0, -4.4), ['DOS RECUERDOS CABEN EN TI.', 'EL TERCERO BORRA AL PRIMERO.']);
  b.beam(t.p(2.2, 0, L + 4.8), 40, 0.6);
  b.arq.place(t, b.arq.room(rng), -s * 14, rng.range(-4, -1), L / 2, false, true, true);

  b.go({ kind: 'walk', to: fr.p(0, 0, -0.8), pitch: -0.2 });
  b.go({ kind: 'echo', at: fr.p(0, -0.4, AM), name: 'piedra' });
  b.go({ kind: 'echo', at: t.p(0, -0.3, L * 0.45), name: 'puente-giro' });
  b.go({ kind: 'jump', to: fr.p(0, 0, AM) });
  b.go({ kind: 'walk', to: t.p(0, 0, L + 3), pitch: -0.1 });
  return t.at(0, 0, L + 6);
};
