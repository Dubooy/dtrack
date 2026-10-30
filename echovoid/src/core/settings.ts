// Ajustes del jugador (ratón, resolución, volumen). Se guardan en este navegador.

export interface Settings {
  sensitivity: number; // multiplicador de CONFIG.camera.sensitivity
  resolution: number; // filas internas
  volume: number;
}

export const RESOLUTIONS = [120, 144, 180, 216, 270];
const KEY = 'echovoid-ajustes';

export function loadSettings(): Settings {
  const base: Settings = { sensitivity: 1, resolution: 144, volume: 0.8 };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...base, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    /* sin almacenamiento: valores por defecto */
  }
  return base;
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* sin almacenamiento */
  }
}
