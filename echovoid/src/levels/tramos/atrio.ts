import { centerOf } from '../../core/box';
import type { Tramo } from '../builder';

/** ATRIO: tres pilares observables alrededor de la plaza, a 120° entre sí. El portal solo se
 *  reconstruye si los tres existen a la vez, y nunca caben dos en la misma mirada: hacen falta
 *  dos ecos y mirar el tercero. */
export const atrio: Tramo = (b, fr, rng) => {
  b.beginBeat('ATRIO');
  const C = 16;
  const R = 7;
  const CF = C + R;
  b.platform(fr, -1.6, 1.6, 0, C, { thick: 1.0 });
  b.platform(fr, -R, R, C, C + 2 * R, { thick: 1.6, depth: 1.6 });
  b.checkpoint(fr.box(-R, 0, C, R, 3, C + 2 * R), fr.p(0, 0, CF), fr.yaw);
  b.terminal(fr.p(-2.6, 0, C + 1.4), ['TRES PILARES SOSTIENEN LA SALIDA.', 'UNA SOLA MIRADA NO BASTA.']);
  for (const x of [-R + 0.7, R - 0.7]) {
    for (const f of [C + 0.7, C + 2 * R - 0.7]) b.decorAdd([fr.box(x - 0.4, 0, f - 0.4, x + 0.4, 1.1, f + 0.4)], true);
  }
  b.portal(fr, C + 2 * R - 1.2);

  const base = (rng.range(85, 95) * Math.PI) / 180;
  const RP = 20;
  for (let k = 0; k < 3; k++) {
    const a = base + (k * 2 * Math.PI) / 3;
    const px = Math.sin(a) * RP;
    const pf = CF + Math.cos(a) * RP;
    b.platform(fr, px - 2.5, px + 2.5, pf - 2.5, pf + 2.5, { top: -1, depth: 1.3 });
    const pillar = b.phantom(`pilar-${k + 1}`, [
      fr.box(px - 1.1, -1, pf - 1.1, px + 1.1, 7.5, pf + 1.1),
      fr.box(px - 1.4, 7.5, pf - 1.4, px + 1.4, 8.3, pf + 1.4),
    ], { tag: 'pilar' });
    b.pillars.push(pillar);
    b.beam(fr.p(px, 8.3, pf), 60, 0.9, { magenta: true, opacity: 0.35, tag: 'pilar' });
  }
  b.arq.place(fr, b.arq.giant(rng), 0, -40, CF + 60, true, false, true);

  b.go({ kind: 'walk', to: fr.p(0, 0, CF), pitch: -0.05 });
  b.pillars.forEach((p, k) => {
    const c = centerOf(p.bounds);
    b.go(k < 2 ? { kind: 'echo', at: c, name: p.name } : { kind: 'look', at: c, time: 1 });
  });
  b.go({ kind: 'enter', to: fr.p(0, 0, C + 2 * R - 0.6) });
  return fr.at(0, 0, C + 2 * R);
};
