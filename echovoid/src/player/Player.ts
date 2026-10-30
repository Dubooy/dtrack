import type { PerspectiveCamera } from 'three';
import { CONFIG } from '../config';
import type { Box } from '../core/box';
import type { Collider, Structure, World } from '../world/World';

export interface MoveInput {
  forward: number; // -1..1
  right: number; // -1..1
  jumpHeld: boolean;
  jumpPressed: boolean;
}

const EPS = 1e-4;

/** Movimiento en primera persona y colisiones caja contra cajas, a paso fijo. */
export class Player {
  x = 0;
  y = 0; // los pies
  z = 0;
  vx = 0;
  vy = 0;
  vz = 0;
  yaw = 0;
  pitch = 0;
  grounded = false;
  groundOwner: Structure | null = null;
  /** Sucesos del último paso, para sonido y cámara. */
  jumped = false;
  landed = 0;

  private coyote = 0;
  private buffer = 0;
  private rising = false; // en la subida de un salto con ESPACIO pulsado
  private eyeLag = 0; // la cámara sube y baja escalones con suavidad
  private dip = 0;
  private dipVel = 0;
  private hits: Collider[] = [];
  private hits2: Collider[] = [];

  constructor(private world: World) {}

  place(x: number, y: number, z: number): void {
    this.x = x;
    this.y = y;
    this.z = z;
    this.vx = this.vy = this.vz = 0;
    this.grounded = false;
    this.groundOwner = null;
    this.eyeLag = this.dip = this.dipVel = 0;
  }

  look(dx: number, dy: number): void {
    this.yaw -= dx;
    this.pitch = Math.max(-CONFIG.camera.pitchLimit, Math.min(CONFIG.camera.pitchLimit, this.pitch - dy));
  }

  lookAt(x: number, y: number, z: number): void {
    const dx = x - this.x;
    const dz = z - this.z;
    const dy = y - (this.y + CONFIG.player.eye);
    this.yaw = Math.atan2(-dx, -dz);
    this.pitch = Math.atan2(dy, Math.hypot(dx, dz));
  }

  aabb(x = this.x, y = this.y, z = this.z): Box {
    const r = CONFIG.player.radius;
    return { x0: x - r, y0: y, z0: z - r, x1: x + r, y1: y + CONFIG.player.height, z1: z + r };
  }

  step(dt: number, inp: MoveInput): void {
    const P = CONFIG.player;
    this.jumped = false;
    this.landed = 0;

    // velocidad horizontal deseada según la cámara
    const sy = Math.sin(this.yaw);
    const cy = Math.cos(this.yaw);
    let wx = -sy * inp.forward + cy * inp.right;
    let wz = -cy * inp.forward - sy * inp.right;
    const len = Math.hypot(wx, wz);
    if (len > 1) {
      wx /= len;
      wz /= len;
    }
    const accel = (this.grounded ? P.groundAccel : len > 0 ? P.airAccel : P.airDrag) * dt;
    let ax = wx * P.speed - this.vx;
    let az = wz * P.speed - this.vz;
    const al = Math.hypot(ax, az);
    if (al > accel) {
      ax *= accel / al;
      az *= accel / al;
    }
    this.vx += ax;
    this.vz += az;

    // salto con margen («coyote») y memoria de pulsación
    this.buffer = inp.jumpPressed ? P.jumpBuffer : Math.max(0, this.buffer - dt);
    this.coyote = this.grounded ? P.coyoteTime : Math.max(0, this.coyote - dt);
    if (this.buffer > 0 && this.coyote > 0) {
      this.vy = P.jumpSpeed;
      this.grounded = false;
      this.groundOwner = null;
      this.coyote = 0;
      this.buffer = 0;
      this.rising = true;
      this.jumped = true;
    }
    if (this.rising && !inp.jumpHeld && this.vy > 0) {
      this.vy *= P.jumpCut;
      this.rising = false;
    }
    if (this.vy <= 0) this.rising = false;
    this.vy = Math.max(this.vy - P.gravity * dt, -P.maxFall);

    const wasGrounded = this.grounded;
    this.moveH(this.vx * dt, 0, wasGrounded);
    this.moveH(0, this.vz * dt, wasGrounded);
    this.moveV(this.vy * dt);
    if (wasGrounded && !this.grounded && !this.jumped && this.vy <= 0) this.snapDown();
  }

  private moveH(dx: number, dz: number, canStep: boolean): void {
    if (dx === 0 && dz === 0) return;
    const r = CONFIG.player.radius;
    const nx = this.x + dx;
    const nz = this.z + dz;
    const hits = this.world.query(this.aabb(nx, this.y, nz), this.hits);
    if (hits.length === 0) {
      this.x = nx;
      this.z = nz;
      return;
    }
    // ¿es un escalón que se puede subir?
    if (canStep) {
      let top = -Infinity;
      for (const c of hits) top = Math.max(top, c.box.y1);
      const rise = top - this.y;
      if (rise > 0 && rise <= CONFIG.player.stepHeight && this.world.query(this.aabb(nx, top, nz), this.hits2).length === 0) {
        this.x = nx;
        this.z = nz;
        this.y = top;
        this.eyeLag -= rise;
        return;
      }
    }
    if (dx > 0) {
      let m = nx;
      for (const c of hits) m = Math.min(m, c.box.x0 - r - EPS);
      this.x = Math.max(this.x, m);
      this.vx = 0;
    } else if (dx < 0) {
      let m = nx;
      for (const c of hits) m = Math.max(m, c.box.x1 + r + EPS);
      this.x = Math.min(this.x, m);
      this.vx = 0;
    }
    if (dz > 0) {
      let m = nz;
      for (const c of hits) m = Math.min(m, c.box.z0 - r - EPS);
      this.z = Math.max(this.z, m);
      this.vz = 0;
    } else if (dz < 0) {
      let m = nz;
      for (const c of hits) m = Math.max(m, c.box.z1 + r + EPS);
      this.z = Math.min(this.z, m);
      this.vz = 0;
    }
  }

  private moveV(dy: number): void {
    const ny = this.y + dy;
    const hits = this.world.query(this.aabb(this.x, ny, this.z), this.hits);
    if (hits.length === 0) {
      this.y = ny;
      this.grounded = false;
      this.groundOwner = null;
      return;
    }
    if (dy < 0) {
      let top = -Infinity;
      let owner: Structure | null = null;
      for (const c of hits) {
        if (c.box.y1 > top) {
          top = c.box.y1;
          owner = c.owner;
        }
      }
      if (!this.grounded) {
        this.landed = -this.vy;
        this.dipVel -= Math.min(3.2, this.landed * 0.22);
      }
      this.y = top;
      this.vy = 0;
      this.grounded = true;
      this.groundOwner = owner;
    } else {
      let bottom = Infinity;
      for (const c of hits) bottom = Math.min(bottom, c.box.y0);
      this.y = Math.min(this.y, bottom - CONFIG.player.height - EPS);
      this.vy = 0;
      this.rising = false;
    }
  }

  /** Bajando escalones: el jugador se pega al siguiente en vez de dar saltitos. */
  private snapDown(): void {
    const b = this.aabb();
    b.y0 = this.y - CONFIG.player.stepHeight;
    b.y1 = this.y;
    let top = -Infinity;
    let owner: Structure | null = null;
    for (const c of this.world.query(b, this.hits)) {
      if (c.box.y1 <= this.y + EPS && c.box.y1 > top) {
        top = c.box.y1;
        owner = c.owner;
      }
    }
    if (top === -Infinity) return;
    this.eyeLag += this.y - top;
    this.y = top;
    this.vy = 0;
    this.grounded = true;
    this.groundOwner = owner;
  }

  updateCamera(cam: PerspectiveCamera, dt: number): void {
    this.eyeLag *= Math.exp(-CONFIG.camera.stepSmoothing * dt);
    // muelle del aterrizaje: la cámara cede un poco y vuelve
    this.dipVel += (-this.dip * 140 - this.dipVel * 18) * dt;
    this.dip += this.dipVel * dt;
    cam.position.set(this.x, this.y + CONFIG.player.eye + this.eyeLag + this.dip, this.z);
    cam.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
    cam.updateMatrixWorld();
  }

  get speed(): number {
    return Math.hypot(this.vx, this.vz);
  }
}
