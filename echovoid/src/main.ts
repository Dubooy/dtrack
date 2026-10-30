import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import './styles.css';
import { Game } from './core/Game';
import { installTestApi } from './debug/testApi';

// Parámetros de la dirección: ?semilla=N (universo), ?control=N (empezar en un punto de control),
// ?prueba (modo de pruebas automáticas, sin bucle propio), ?titulo (con ?prueba, mostrar el título).
const q = new URLSearchParams(location.search);
const num = (k: string): number | null => {
  const v = Number(q.get(k));
  return q.has(k) && Number.isFinite(v) ? Math.floor(v) : null;
};
const test = q.has('prueba');
const game = new Game({
  seed: num('semilla') ?? 1,
  test,
  title: !test || q.has('titulo'),
  checkpoint: num('control') ?? 0,
});
if (test) installTestApi(game);
else game.run();
