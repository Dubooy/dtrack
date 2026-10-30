import type { ZoneDef } from './builder';
import { atrio } from './tramos/atrio';
import { despertar } from './tramos/despertar';
import { dosEcos } from './tramos/dosEcos';
import { escalera } from './tramos/escalera';
import { escalones } from './tramos/escalones';
import { estatica } from './tramos/estatica';
import { puente } from './tramos/puente';
import { sendero } from './tramos/sendero';

/** ZONA 01 — UMBRAL. Enseña la regla del universo sin explicarla:
 *  mirar construye, dejar de mirar olvida, recordar conserva, y una sola mirada no basta. */
export const ZONA_1: ZoneDef = {
  name: 'UMBRAL',
  tramos: [despertar, puente, escalones, sendero, escalera, estatica, dosEcos, atrio],
};
