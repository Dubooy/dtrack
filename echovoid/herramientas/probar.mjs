// Prueba ECHO//VOID en un Chromium sin pantalla y deja capturas en capturas/.
//
//   npm run probar                       todo: mecánica, recorrido completo con el bot y vistas
//   npm run probar -- mecanica           solo las comprobaciones de la mecánica
//   npm run probar -- recorrido          el bot juega el nivel entero (con capturas)
//   npm run probar -- vistas             capturas fijas para revisar el arte
//   npm run probar -- recorrido --semillas=1,2,3
//
// El juego se abre con ?prueba: no tiene bucle propio y el tiempo avanza con __echo.advance(),
// así que el resultado no depende de lo rápido que vaya el navegador.
import { mkdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

process.chdir(fileURLToPath(new URL('..', import.meta.url)));
const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('No encuentro Playwright. En las sesiones de Claude Code en la nube ya viene instalado.');
  process.exit(2);
}

const args = process.argv.slice(2);
const opt = (name, def) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1] ?? def;
const pedidos = args.filter((a) => !a.startsWith('--'));
const escenarios = pedidos.length ? pedidos : ['mecanica', 'recorrido', 'vistas'];
const semillas = opt('semillas', opt('semilla', '1')).split(',').map(Number);
rmSync('capturas', { recursive: true, force: true });
mkdirSync('capturas', { recursive: true });

const server = await createServer({ logLevel: 'error', server: { port: 5199, strictPort: false, hmr: false } });
await server.listen();
const base = server.resolvedUrls.local[0];
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
let fallos = 0;
const t0 = Date.now();

async function abrir(semilla, extra = '') {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errores = [];
  page.on('pageerror', (e) => errores.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
  await page.goto(`${base}?prueba&semilla=${semilla}${extra}`);
  await page.waitForFunction(() => window.__echo?.ready === true, null, { timeout: 120000 });
  return { page, errores };
}

function comprobar(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function caso(nombre, fn) {
  try {
    await fn();
    console.log(`  ✔ ${nombre}`);
  } catch (e) {
    fallos++;
    console.log(`  ✘ ${nombre}: ${e.message}`);
  }
}

async function mecanica(semilla) {
  console.log(`\nMECÁNICA (semilla ${semilla})`);
  const { page, errores } = await abrir(semilla);
  const E = (fn, arg) => page.evaluate(fn, arg);

  await caso('arranca de pie sobre la plataforma inicial', async () => {
    const s = await E(() => __echo.advance(1));
    comprobar(s.grounded && Math.abs(s.y) < 0.01, `y=${s.y} apoyado=${s.grounded}`);
  });

  await caso('lo que miras aparece; lo que dejas de mirar desaparece', async () => {
    const c = (await E(() => __echo.phantom('puente'))).center;
    let p = await E((c) => { __echo.lookAt(...c); __echo.advance(0.6); return __echo.phantom('puente'); }, c);
    comprobar(p.presence > 0.95 && p.solid, `mirándolo: presencia ${p.presence.toFixed(2)}`);
    p = await E(() => { __echo.look(0, 1.45); __echo.advance(1.6); return __echo.phantom('puente'); });
    comprobar(p.presence < 0.05 && !p.solid, `sin mirarlo: presencia ${p.presence.toFixed(2)}`);
  });

  await caso('si dejas de mirar lo que pisas, caes', async () => {
    const b = (await E(() => __echo.phantom('puente'))).bounds;
    const x = (b.x0 + b.x1) / 2, z = (b.z0 + b.z1) / 2;
    // primero se mira (para que exista) y luego se pisa
    let s = await E(([x, z, y]) => {
      __echo.checkpoint(0); __echo.lookAt(x, y, z); __echo.advance(0.5);
      __echo.teleport(x, y, z); __echo.lookAt(x, y + 1, z - 30); return __echo.advance(0.5);
    }, [x, z, b.y1]);
    comprobar(s.grounded && s.ground === 'puente', `debería estar sobre el puente (suelo: ${s.ground})`);
    s = await E(() => { __echo.look(__echo.state().yaw, 1.45); return __echo.advance(1.5); });
    comprobar(s.y < b.y1 - 2, `sigue a y=${s.y.toFixed(2)}`);
    await E(() => { __echo.checkpoint(0); __echo.advance(0.2); });
  });

  await caso('E convierte lo que miras en eco y lo conserva 5 s', async () => {
    const c = (await E(() => __echo.phantom('puente'))).center;
    const r = await E((c) => { __echo.checkpoint(0); __echo.lookAt(...c); __echo.advance(0.5); return __echo.echo(); }, c);
    comprobar(r === 'new', `resultado ${r}`);
    let p = await E(() => { __echo.look(0, 1.45); __echo.advance(3); return __echo.phantom('puente'); });
    comprobar(p.echo && p.presence > 0.99 && p.solid, `a los 3 s: eco=${p.echo} presencia=${p.presence.toFixed(2)}`);
    p = await E(() => { __echo.advance(2.4); return __echo.phantom('puente'); });
    comprobar(!p.echo, 'el eco debería haber caducado');
    p = await E(() => { __echo.advance(1.5); return __echo.phantom('puente'); });
    comprobar(p.presence < 0.05, `olvidado: presencia ${p.presence.toFixed(2)}`);
  });

  await caso('caben dos ecos; el tercero borra el más antiguo', async () => {
    const names = ['escalon-1', 'escalon-2', 'escalon-3'];
    await E(() => { __echo.checkpoint(1); __echo.advance(0.2); });
    for (const n of names) {
      const c = (await E((n) => __echo.phantom(n), n)).center;
      const r = await E((c) => { __echo.lookAt(...c); __echo.advance(0.5); return __echo.echo(); }, c);
      comprobar(r === 'new', `${n}: ${r}`);
    }
    const s = await E(() => __echo.state());
    comprobar(s.echoes.join(',') === 'escalon-2,escalon-3', `ecos: ${s.echoes.join(',')}`);
  });

  await caso('en la estática nadie observa', async () => {
    const z = (await E(() => __echo.blindZones()))[0];
    const s = await E((z) => { __echo.teleport((z.x0 + z.x1) / 2, (z.y0 + z.y1) / 2, (z.z0 + z.z1) / 2); return __echo.advance(0.1); }, z);
    comprobar(s.blind, 'debería estar a ciegas');
  });

  // El eco no es decorativo: sin él, la estática se traga el puente; con él, se cruza.
  const cruzarEstatica = (recordar) => E((recordar) => {
    __echo.checkpoint(4); __echo.advance(0.3);
    const c = __echo.phantom('puente-estatica').center;
    __echo.lookAt(c[0], __echo.state().y + 1.2, c[2]); __echo.advance(0.4);
    if (recordar) __echo.echo();
    __echo.key('KeyW', true); const st = __echo.advance(recordar ? 3.6 : 4.2); __echo.key('KeyW', false);
    return st;
  }, recordar);
  await caso('sin eco, la estática se traga el puente', async () => {
    const st = await cruzarEstatica(false);
    comprobar(st.falls >= 1, `no cayó (punto ${st.checkpoint}, y=${st.y.toFixed(1)})`);
  });
  await caso('con eco, el puente aguanta dentro de la estática', async () => {
    const antes = (await E(() => __echo.state())).falls;
    const st = await cruzarEstatica(true);
    comprobar(st.falls === antes && st.checkpoint === 5, `punto ${st.checkpoint}, caídas ${st.falls - antes}`);
  });

  await caso('el portal exige los tres pilares a la vez', async () => {
    const cps = await E(() => __echo.checkpoints());
    await E((i) => { __echo.checkpoint(i); __echo.advance(0.2); }, cps.length - 1);
    const cs = [];
    for (const n of ['pilar-1', 'pilar-2', 'pilar-3']) cs.push((await E((n) => __echo.phantom(n), n)).center);
    let s = await E((cs) => { for (const c of cs) { __echo.lookAt(...c); __echo.advance(0.6); } return __echo.state(); }, cs);
    comprobar(!s.portal, 'se abrió mirándolos de uno en uno');
    s = await E((cs) => {
      __echo.lookAt(...cs[0]); __echo.advance(0.4); __echo.echo();
      __echo.lookAt(...cs[1]); __echo.advance(0.4); __echo.echo();
      __echo.lookAt(...cs[2]); return __echo.advance(0.6);
    }, cs);
    comprobar(s.portal, 'no se abrió con dos ecos y el tercero a la vista');
    await page.screenshot({ path: `capturas/s${semilla}-portal.png` });
  });

  await caso('sin errores en la consola', async () => comprobar(errores.length === 0, errores.slice(0, 3).join(' | ')));
  await page.close();
}

async function recorrido(semilla) {
  console.log(`\nRECORRIDO COMPLETO CON EL BOT (semilla ${semilla})`);
  const { page, errores } = await abrir(semilla);
  await page.evaluate(() => { __echo.advance(1); __echo.bot.start(); });
  let ultimo = -1;
  let ecos = 0;
  let s;
  for (let simulado = 0; simulado < 400; simulado += 0.25) {
    s = await page.evaluate(() => { const st = __echo.advance(0.25); return { ...st, bot: __echo.bot.status() }; });
    if (s.checkpoint !== ultimo) {
      ultimo = s.checkpoint;
      await page.screenshot({ path: `capturas/s${semilla}-control-${String(ultimo).padStart(2, '0')}.png` });
    }
    if (s.created > ecos) {
      ecos = s.created;
      await page.evaluate(() => __echo.advance(0.3));
      await page.screenshot({ path: `capturas/s${semilla}-eco-${ecos}.png` });
    }
    if (s.bot.state !== 'run') break;
  }
  await page.screenshot({ path: `capturas/s${semilla}-final.png` });
  await caso(`el bot llega a la salida (${s.time.toFixed(0)} s de juego, ${s.created} ecos)`, async () =>
    comprobar(s.state === 'complete', `paso ${s.bot.step}/${s.bot.total} (${s.bot.kind}): ${s.bot.reason || 'tiempo agotado'} en x=${s.x.toFixed(1)} y=${s.y.toFixed(1)} z=${s.z.toFixed(1)}`));
  await caso('sin errores en la consola', async () => comprobar(errores.length === 0, errores.slice(0, 3).join(' | ')));
  await page.close();
}

async function vistas(semilla) {
  console.log(`\nVISTAS (semilla ${semilla})`);
  const t = await abrir(semilla, '&titulo');
  await t.page.evaluate(() => __echo.advance(4));
  await t.page.screenshot({ path: `capturas/s${semilla}-titulo.png` });
  await t.page.close();
  const { page, errores } = await abrir(semilla);
  await page.evaluate(() => __echo.advance(2.5));
  await page.screenshot({ path: `capturas/s${semilla}-inicio.png` });
  const c = (await page.evaluate(() => __echo.phantom('puente'))).center;
  await page.evaluate((c) => { __echo.lookAt(c[0], c[1], c[2] + 4); __echo.advance(1.2); }, c);
  await page.screenshot({ path: `capturas/s${semilla}-mirar-puente.png` });
  await caso('sin errores en la consola', async () => comprobar(errores.length === 0, errores.slice(0, 3).join(' | ')));
  await page.close();
}

const tareas = { mecanica, recorrido, vistas };
for (const semilla of semillas) {
  for (const e of escenarios) {
    if (!tareas[e]) {
      console.log(`Escenario desconocido: ${e}`);
      fallos++;
      continue;
    }
    await tareas[e](semilla);
  }
}
await browser.close();
await server.close();
console.log(`\n${fallos ? `✘ ${fallos} fallo(s)` : '✔ Todo bien'} · ${((Date.now() - t0) / 1000).toFixed(0)} s · capturas en echovoid/capturas/`);
process.exit(fallos ? 1 : 0);
