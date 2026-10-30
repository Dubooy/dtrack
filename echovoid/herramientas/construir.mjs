// Genera el juego publicable en esta carpeta (index.html + assets/), como beta/index.html en Peak.
// Uso: npm run build
import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build, createLogger } from 'vite';

process.chdir(fileURLToPath(new URL('..', import.meta.url)));
const tsc = spawnSync(process.execPath, ['node_modules/typescript/bin/tsc', '--noEmit'], { stdio: 'inherit' });
if (tsc.status !== 0) process.exit(tsc.status ?? 1);
rmSync('assets', { recursive: true, force: true });
// src/ es la raíz y el resultado va a su carpeta madre (a propósito): se calla ese aviso de Vite.
const logger = createLogger('warn');
const warn = logger.warn;
logger.warn = (msg, opts) => (msg.includes('build.outDir must not be') ? undefined : warn(msg, opts));
await build({ logLevel: 'warn', customLogger: logger });
console.log('Listo: echovoid/index.html y echovoid/assets/ generados. Súbelos junto con el código.');
