import { centerOf } from '../core/box';
import type { Game } from '../core/Game';
import { Bot } from './bot';

/** window.__echo: lo que usan las pruebas automáticas (herramientas/probar.mjs).
 *  Solo se instala con ?prueba en la dirección. */
export function installTestApi(game: Game): void {
  const phantom = (name: string) => {
    const s = game.world.find(name);
    if (!s) return null;
    return { name: s.name, presence: s.presence, solid: s.solid, echo: s.echoAge >= 0, permanent: s.permanent, center: centerOf(s.bounds), bounds: s.bounds };
  };
  const api = {
    ready: true,
    state: () => game.debugState(),
    advance: (sec: number) => {
      game.advance(sec);
      return game.debugState();
    },
    teleport: (x: number, y: number, z: number) => game.player.place(x, y, z),
    look: (yaw: number, pitch: number) => {
      game.player.yaw = yaw;
      game.player.pitch = pitch;
    },
    lookAt: (x: number, y: number, z: number) => game.player.lookAt(x, y, z),
    key: (code: string, down: boolean) => game.input.setKey(code, down),
    echo: () => game.tryEcho(),
    checkpoint: (i: number) => game.respawnAt(i),
    checkpoints: () => game.level.checkpoints,
    phantom,
    phantoms: () => game.world.phantoms.map((s) => phantom(s.name)),
    route: () => game.level.route,
    blindZones: () => game.world.blindZones,
    bot: {
      start: () => {
        game.driver = new Bot(game);
      },
      status: () => (game.driver instanceof Bot ? game.driver.status() : null),
    },
  };
  (window as unknown as { __echo: typeof api }).__echo = api;
}
