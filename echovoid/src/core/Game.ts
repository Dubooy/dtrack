import { Color, DirectionalLight, FogExp2, HemisphereLight, PerspectiveCamera, Scene, Vector3 } from 'three';
import { AudioEngine } from '../audio/AudioEngine';
import { CONFIG } from '../config';
import { buildLevel, type LevelData, type Terminal } from '../levels/builder';
import { ZONA_1 } from '../levels/zona1';
import { Echoes, type EchoResult } from '../mechanics/Echoes';
import { Observation, type ObservationEvents } from '../mechanics/Observation';
import { Player, type MoveInput } from '../player/Player';
import { sharedTime } from '../render/blockMaterial';
import { createDust } from '../render/effects';
import { Renderer, type PostFx } from '../render/Renderer';
import { Hud } from '../ui/Hud';
import { Screens } from '../ui/Screens';
import { World, type Structure } from '../world/World';
import { centerOf, containsPoint } from './box';
import { Input } from './Input';
import { loadSettings, RESOLUTIONS, saveSettings, type Settings } from './settings';

export type GameState = 'title' | 'playing' | 'paused' | 'complete';

export interface Control extends MoveInput {
  echoPressed: boolean;
}

/** Algo que maneja al jugador en lugar del teclado (el bot de pruebas). */
export interface Driver {
  control(game: Game, dt: number): Control;
}

export interface GameOptions {
  seed: number;
  test: boolean;
  title: boolean;
  checkpoint: number;
}

const IDLE: Control = { forward: 0, right: 0, jumpHeld: false, jumpPressed: false, echoPressed: false };
const SUN = new Vector3(-0.55, 1, 0.35).normalize();
const approach = (v: number, target: number, step: number) => (v < target ? Math.min(target, v + step) : Math.max(target, v - step));
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** Une todos los sistemas y lleva el bucle del juego. */
export class Game {
  readonly scene = new Scene();
  readonly camera: PerspectiveCamera;
  readonly renderer: Renderer;
  readonly input: Input;
  readonly audio = new AudioEngine();
  readonly hud: Hud;
  readonly screens: Screens;
  readonly world = new World();
  readonly observation = new Observation();
  readonly echoes = new Echoes();
  readonly level: LevelData;
  readonly player: Player;
  readonly settings: Settings = loadSettings();
  state: GameState = 'title';
  driver: Driver | null = null;
  checkpoint = 0;
  portalActive = false;
  blind = false;
  time = 0; // reloj visual
  playTime = 0; // reloj de partida (se para en pausa)
  stats = { echoes: 0, falls: 0 };

  private obsTime = 0; // reloj de la observación
  private dir = new Vector3();
  private acc = 0;
  private pendingJump = false;
  private fx: PostFx = { reveal: 0, glitch: 0, static: 0, flash: 0 };
  private revealTarget = 1;
  private respawnT = -1;
  private stepT = 0;
  private terminal: Terminal | null = null;
  private hints = new Set<string>();
  private timers: { t: number; fn: () => void }[] = [];
  private lastBlink = new Map<Structure, number>();
  private last = 0;
  private sun: DirectionalLight;
  private dust: ReturnType<typeof createDust>;

  private obsEvents: ObservationEvents = {
    materialize: (s) => {
      const c = centerOf(s.bounds);
      const b = s.bounds;
      this.audio.materialize(b.x1 - b.x0 + b.y1 - b.y0 + b.z1 - b.z0, this.camera.position.distanceTo(new Vector3(c[0], c[1], c[2])));
    },
    groundFading: () => this.audio.groundFading(),
  };

  constructor(readonly opts: GameOptions) {
    const app = document.getElementById('app')!;
    this.renderer = new Renderer(document.getElementById('vista') as HTMLCanvasElement, opts.test);
    this.input = new Input(app);
    this.hud = new Hud(document.getElementById('hud')!);
    this.screens = new Screens(document.getElementById('pantallas')!, {
      start: () => this.start(),
      resume: () => this.resume(),
      restart: () => {
        this.respawnAt(this.checkpoint);
        this.resume();
      },
      newSeed: () => this.reload(1 + Math.floor(Math.random() * 9999)),
      sameSeed: () => this.reload(this.opts.seed),
      setting: (k, d) => this.changeSetting(k, d),
    });

    this.camera = new PerspectiveCamera(CONFIG.render.fov, 1, CONFIG.render.near, CONFIG.render.far);
    this.scene.background = new Color(CONFIG.render.background);
    this.scene.fog = new FogExp2(CONFIG.render.fogColor, CONFIG.render.fogDensity);
    this.scene.add(new HemisphereLight(0xb9b9b5, 0x0a0b0e, 1.6));
    this.sun = new DirectionalLight(0xffffff, 4);
    this.sun.castShadow = true;
    const E = CONFIG.render.shadowExtent;
    const sc = this.sun.shadow.camera;
    sc.left = -E;
    sc.right = E;
    sc.top = E;
    sc.bottom = -E;
    sc.near = 1;
    sc.far = 260;
    this.sun.shadow.mapSize.set(CONFIG.render.shadowMapSize, CONFIG.render.shadowMapSize);
    this.sun.shadow.bias = -0.0006;
    this.sun.shadow.normalBias = 0.04;
    this.scene.add(this.sun, this.sun.target);
    this.dust = createDust(420, 40);
    this.scene.add(this.dust.points);

    this.level = buildLevel(ZONA_1, opts.seed, this.scene, this.world);
    this.player = new Player(this.world);
    this.hud.setZone(this.level.zone, opts.seed);
    this.hud.onType = () => this.audio.type();

    this.input.onLockChange = (locked) => {
      if (this.opts.test) return;
      if (locked && this.state === 'paused') this.resume();
      else if (!locked && this.state === 'playing') this.pause();
    };
    app.addEventListener('click', () => {
      if (this.state === 'playing' && !this.input.locked && !opts.test) this.input.lock();
    });
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyP' && this.state === 'playing') this.pause();
    });
    window.addEventListener('blur', () => {
      if (this.state === 'playing' && !opts.test) this.pause();
    });
    window.addEventListener('resize', () => this.resize());

    this.respawnAt(clamp(opts.checkpoint, 0, this.level.checkpoints.length - 1));
    this.resize();
    if (opts.title) {
      this.state = 'title';
      this.fx.reveal = 1;
      this.screens.title(!matchMedia('(pointer: coarse)').matches || matchMedia('(any-pointer: fine)').matches);
    } else this.begin();
  }

  /** Bucle normal del navegador. (Las pruebas avanzan el tiempo con advance().) */
  run(): void {
    const loop = (t: number) => {
      const dt = Math.min(0.1, Math.max(0, (t - this.last) / 1000));
      this.last = t;
      this.tick(dt);
      this.draw();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  advance(sec: number): void {
    const n = Math.max(1, Math.round(sec * 60));
    for (let i = 0; i < n; i++) this.tick(1 / 60);
    this.draw();
  }

  tick(dt: number): void {
    this.time += dt;
    sharedTime.value = this.time;
    for (const t of [...this.timers]) {
      if ((t.t -= dt) <= 0) {
        this.timers.splice(this.timers.indexOf(t), 1);
        t.fn();
      }
    }
    if (this.state === 'title') this.attract(dt);
    else if (this.state === 'playing') this.play(dt);
    this.effects(dt);
    this.input.endFrame();
  }

  draw(): void {
    this.renderer.render(this.scene, this.camera, this.fx);
  }

  // ---------- estados ----------

  private start(): void {
    this.audio.start(this.settings.volume);
    this.input.lock();
    this.respawnAt(this.checkpoint);
    this.begin();
  }

  private begin(): void {
    this.state = 'playing';
    this.screens.hide();
    this.hud.show(true);
    this.fx.reveal = 0;
    this.revealTarget = 1;
    this.hud.showHelp(true);
    this.later(1.4, () => this.hud.message('LO QUE NO MIRAS NO EXISTE.', 3));
    this.later(10, () => this.hud.showHelp(false));
  }

  pause(): void {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.input.unlock();
    this.audio.duck(true);
    this.hud.show(false);
    this.screens.pause(this.settings, this.opts.seed);
  }

  resume(): void {
    if (this.state !== 'paused') return;
    this.state = 'playing';
    this.screens.hide();
    this.hud.show(true);
    this.audio.duck(false);
    this.acc = 0;
    this.input.consumeMouse();
    if (!this.input.locked && !this.opts.test) this.input.lock();
  }

  private complete(): void {
    this.state = 'complete';
    this.input.unlock();
    this.hud.show(false);
    this.hud.terminal(null);
    this.audio.complete();
    this.fx.flash = 1;
    this.screens.complete({ time: this.playTime, echoes: this.stats.echoes, falls: this.stats.falls, seed: this.opts.seed });
  }

  private reload(seed: number): void {
    location.search = `?semilla=${seed}`;
  }

  /** Vuelve a un punto de control: todo lo observable se olvida y los ecos se pierden. */
  respawnAt(i: number): void {
    const cp = this.level.checkpoints[i];
    this.checkpoint = i;
    this.player.place(cp.pos[0], cp.pos[1], cp.pos[2]);
    this.player.yaw = cp.yaw;
    this.player.pitch = -0.03;
    this.echoes.clear();
    for (const s of this.world.phantoms) {
      if (s.permanent) continue;
      s.presence = 0;
      s.solid = false;
      s.lastSeen = -1e9;
    }
    this.acc = 0;
    this.pendingJump = false;
    this.respawnT = -1;
    this.hud.setProgress(i, this.level.beats);
    this.player.updateCamera(this.camera, 0);
  }

  // ---------- juego ----------

  /** Pantalla de título: la cámara barre la plataforma inicial y el mundo aparece a su paso. */
  private attract(dt: number): void {
    const cp = this.level.checkpoints[0];
    this.player.yaw = cp.yaw + Math.sin(this.time * 0.13) * 1.25;
    this.player.pitch = -0.06 + Math.sin(this.time * 0.09) * 0.08;
    this.player.updateCamera(this.camera, dt);
    this.observe(dt);
  }

  private play(dt: number): void {
    this.playTime += dt;
    const ctl = this.control(dt);
    if (ctl.jumpPressed) this.pendingJump = true;
    if (this.respawnT < 0) {
      const P = CONFIG.physics;
      this.acc += dt;
      let n = 0;
      while (this.acc >= P.step && n < P.maxSteps) {
        this.player.step(P.step, { ...ctl, jumpPressed: this.pendingJump });
        this.pendingJump = false;
        if (this.player.jumped) this.audio.jump();
        if (this.player.landed > 2) this.audio.land(this.player.landed);
        this.acc -= P.step;
        n++;
      }
      if (n === P.maxSteps) this.acc = 0;
    }
    this.player.updateCamera(this.camera, dt);
    this.footsteps(dt);
    this.observe(dt);
    this.echoes.update(dt, this.obsTime, () => {
      this.audio.echoEnd();
      this.hint('olvido', 'OLVIDAR = DESAPARECER.');
    });
    this.echoes.target = this.blind ? null : this.echoes.findTarget(this.world, this.camera.position, this.dir);
    if (ctl.echoPressed) this.tryEcho();
    this.rules(dt);

    const E = CONFIG.echoes;
    this.hud.setReticle(this.echoes.target !== null, this.blind);
    this.hud.setEchoes(this.echoes.slots.map((s) => ({ fill: 1 - s.echoAge / E.duration, warn: E.duration - s.echoAge < E.warnTime })), E.max);
  }

  private control(dt: number): Control {
    const m = this.input.consumeMouse();
    if (this.respawnT >= 0) return IDLE;
    if (this.driver) return this.driver.control(this, dt);
    const k = CONFIG.camera.sensitivity * this.settings.sensitivity;
    this.player.look(m.dx * k, m.dy * k);
    const i = this.input;
    return {
      forward: i.axis(['KeyS', 'ArrowDown'], ['KeyW', 'ArrowUp']),
      right: i.axis(['KeyA', 'ArrowLeft'], ['KeyD', 'ArrowRight']),
      jumpHeld: i.isDown('Space'),
      jumpPressed: i.consumePress('Space'),
      echoPressed: i.consumePress('KeyE'),
    };
  }

  private observe(dt: number): void {
    this.obsTime += dt;
    this.camera.getWorldDirection(this.dir);
    const eye = this.camera.position;
    this.blind = this.world.inBlind(eye.x, eye.y, eye.z);
    this.observation.update(this.world, dt, this.obsTime, eye, this.dir, this.player.aabb(), this.blind, this.player.groundOwner, this.obsEvents);
  }

  tryEcho(): EchoResult {
    const r = this.blind ? 'none' : this.echoes.create(this.obsTime);
    if (r === 'none') {
      this.hud.deny();
      this.audio.deny();
      return r;
    }
    this.stats.echoes++;
    this.audio.echo();
    this.fx.glitch = 1;
    this.hint('eco', 'LO QUE RECUERDAS, PERMANECE.');
    return r;
  }

  /** Reglas del nivel: caídas, puntos de control, terminales, pistas y el portal. */
  private rules(dt: number): void {
    const p = this.player;
    const L = this.level;
    if (this.respawnT >= 0) {
      this.respawnT += dt;
      if (this.respawnT >= 0.6) {
        this.respawnAt(this.checkpoint);
        this.revealTarget = 1;
        this.audio.respawn();
      }
      return;
    }
    if (p.y < L.checkpoints[this.checkpoint].pos[1] - CONFIG.player.fallDepth) {
      this.stats.falls++;
      this.respawnT = 0;
      this.revealTarget = 0;
      this.audio.fall();
      this.hud.message('OLVIDADO.', 1.2);
      return;
    }

    for (const cp of L.checkpoints) {
      if (cp.index > this.checkpoint && p.grounded && containsPoint(cp.region, p.x, p.y + 0.1, p.z)) {
        this.checkpoint = cp.index;
        this.hud.setProgress(cp.index, L.beats);
        this.audio.checkpoint();
      }
    }

    let near: Terminal | null = null;
    for (const t of L.terminals) {
      if (Math.hypot(t.pos[0] - p.x, t.pos[2] - p.z) < t.radius && Math.abs(t.pos[1] - 1 - p.y) < 2.5) near = t;
    }
    if (near !== this.terminal) {
      this.terminal = near;
      this.hud.terminal(near ? near.lines : null);
    }

    if (this.blind && this.echoes.slots.length === 0) this.hint('ciego', 'AQUÍ NADIE OBSERVA.');
    if (this.echoes.target && this.checkpoint >= 4) this.hint('recordar', 'E · RECORDAR');

    if (!this.portalActive && L.pillars.length && L.pillars.every((s) => s.presence >= 0.95)) this.openPortal();
    if (this.portalActive && L.portal && containsPoint(L.portal.region, p.x, p.y + 1, p.z)) this.complete();
  }

  private openPortal(): void {
    this.portalActive = true;
    for (const s of this.level.pillars) {
      this.echoes.release(s, this.obsTime);
      s.permanent = true;
    }
    for (const b of this.level.beams) if (b.tag) b.mesh.visible = true;
    this.fx.flash = 0.7;
    this.audio.portalOpen();
    this.hud.message('RECONSTRUCCIÓN COMPLETA.', 3);
  }

  private hint(id: string, text: string): void {
    if (this.hints.has(id)) return;
    this.hints.add(id);
    this.hud.message(text);
  }

  private later(t: number, fn: () => void): void {
    this.timers.push({ t, fn });
  }

  private footsteps(dt: number): void {
    const p = this.player;
    if (p.grounded && p.speed > 2) {
      if ((this.stepT -= dt) <= 0) {
        this.stepT = 0.4;
        this.audio.step();
      }
    } else this.stepT = 0.12;
  }

  // ---------- imagen y sonido ----------

  private effects(dt: number): void {
    const fx = this.fx;
    fx.reveal = approach(fx.reveal, this.revealTarget, dt / (this.revealTarget > fx.reveal ? 0.9 : 0.4));
    fx.glitch = Math.max(0, fx.glitch - dt * 3.5);
    fx.flash = Math.max(0, fx.flash - dt * 1.4);
    const eye = this.camera.position;
    const near = Math.max(0, 0.05 * (1 - this.world.blindDistance(eye.x, eye.y, eye.z) / 3));
    const active = this.state === 'playing' || this.state === 'title';
    fx.static = approach(fx.static, active ? (this.blind ? 0.6 : near) : 0, dt * 4);
    if (this.level.portal) this.level.portal.active.value = approach(this.level.portal.active.value, this.portalActive ? 1 : 0, dt * 0.8);

    // el sol y su sombra acompañan al jugador
    const p = this.player;
    const cx = Math.round(p.x);
    const cy = Math.round(p.y);
    const cz = Math.round(p.z);
    this.sun.target.position.set(cx, cy, cz);
    this.sun.position.set(cx + SUN.x * 100, cy + SUN.y * 100, cz + SUN.z * 100);
    this.sun.target.updateMatrixWorld();
    this.dust.center.copy(eye);

    this.syncVisuals(dt);

    let hum = 0;
    if (this.portalActive && this.level.portal) {
      const c = this.level.portal.center;
      hum = Math.max(0, 0.08 * (1 - Math.hypot(c[0] - p.x, c[2] - p.z) / 45));
    }
    this.audio.ambient({
      wind: active ? 0.05 + clamp(p.y * 0.004, 0, 0.05) : 0.02,
      drone: this.blind ? 0.015 : 0.045,
      hiss: fx.static * 0.08,
      hum,
    });
    this.hud.update(dt);
  }

  /** Pasa el estado de cada estructura observable a su material. */
  private syncVisuals(dt: number): void {
    const E = CONFIG.echoes;
    for (const s of this.world.phantoms) {
      const u = s.u!;
      const m = s.mesh!;
      u.uPresence.value = s.presence;
      m.visible = s.presence > 0.002;
      m.castShadow = s.presence > 0.5;
      const held = s.echoAge >= 0 || s.permanent;
      u.uEcho.value = approach(u.uEcho.value, held ? 1 : 0, dt * (held ? 7 : 2.5));
      let blink = 0;
      if (s.echoAge >= 0 && E.duration - s.echoAge < E.warnTime) {
        const k = 1 - (E.duration - s.echoAge) / E.warnTime;
        blink = Math.sin(this.time * Math.PI * 2 * (3 + k * 9)) > 0.2 ? 1 : 0;
        if (blink && !this.lastBlink.get(s)) this.audio.echoTick();
      }
      this.lastBlink.set(s, blink);
      u.uBlink.value = blink;
      u.uTarget.value = approach(u.uTarget.value, s === this.echoes.target ? 1 : 0, dt * 10);
    }
  }

  private resize(): void {
    this.renderer.resize(this.camera, this.settings.resolution);
  }

  private changeSetting(key: keyof Settings, dir: number): void {
    const s = this.settings;
    if (key === 'sensitivity') s.sensitivity = clamp(Math.round((s.sensitivity + dir * 0.1) * 10) / 10, 0.3, 3);
    if (key === 'volume') {
      s.volume = clamp(Math.round((s.volume + dir * 0.1) * 10) / 10, 0, 1);
      this.audio.setVolume(s.volume);
    }
    if (key === 'resolution') {
      const i = RESOLUTIONS.indexOf(s.resolution);
      s.resolution = RESOLUTIONS[clamp((i < 0 ? 1 : i) + dir, 0, RESOLUTIONS.length - 1)];
      this.resize();
    }
    saveSettings(s);
    this.screens.pause(s, this.opts.seed);
  }

  debugState() {
    const p = this.player;
    return {
      state: this.state,
      x: p.x,
      y: p.y,
      z: p.z,
      yaw: p.yaw,
      pitch: p.pitch,
      grounded: p.grounded,
      ground: p.groundOwner?.name ?? null,
      checkpoint: this.checkpoint,
      blind: this.blind,
      echoes: this.echoes.slots.map((s) => s.name),
      target: this.echoes.target?.name ?? null,
      portal: this.portalActive,
      falls: this.stats.falls,
      created: this.stats.echoes,
      time: this.playTime,
    };
  }
}
