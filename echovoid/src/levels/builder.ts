import { Mesh, MeshBasicMaterial, type Scene } from 'three';
import { box, expand, overlaps, type Box } from '../core/box';
import { Frame, type Vec3 } from '../core/frame';
import { Rng } from '../core/rng';
import { createBlockMaterial } from '../render/blockMaterial';
import { buildBoxGeometry } from '../render/boxGeometry';
import { createBeam, createPortalMembrane, createStaticVolume, MAGENTA } from '../render/effects';
import type { Structure, World } from '../world/World';
import { Architect } from './architect';

/** Pasos de la solución de un nivel. Los escribe cada tramo y los usa el bot de pruebas. */
export type RouteStep =
  | { kind: 'walk'; to: Vec3; pitch?: number; tol?: number }
  | { kind: 'jump'; to: Vec3 }
  | { kind: 'echo'; at: Vec3; name: string }
  | { kind: 'look'; at: Vec3; time: number }
  | { kind: 'enter'; to: Vec3 };

export interface Checkpoint {
  index: number;
  region: Box;
  pos: Vec3;
  yaw: number;
}

export interface Terminal {
  pos: Vec3;
  radius: number;
  lines: string[];
}

export interface Beam {
  mesh: Mesh;
  tag: string;
}

export interface Portal {
  region: Box;
  center: Vec3;
  active: { value: number };
}

export interface LevelData {
  seed: number;
  zone: string;
  beats: string[];
  checkpoints: Checkpoint[];
  terminals: Terminal[];
  route: RouteStep[];
  pillars: Structure[];
  portal: Portal | null;
  beams: Beam[];
}

/** Un tramo recibe el marco donde empieza (borde de la plataforma anterior) y devuelve el marco
 *  donde acaba. Así los tramos se encadenan como piezas. */
export type Tramo = (b: LevelBuilder, fr: Frame, rng: Rng) => Frame;

export interface ZoneDef {
  name: string;
  tramos: Tramo[];
}

interface BeamDef {
  pos: Vec3;
  height: number;
  radius: number;
  color: number;
  opacity: number;
  tag: string;
}

export function buildLevel(zone: ZoneDef, seed: number, scene: Scene, world: World): LevelData {
  const b = new LevelBuilder(world, seed);
  let fr = new Frame(0, 0, 0, 0);
  zone.tramos.forEach((t, i) => {
    fr = t(b, fr, Rng.derive(seed, `tramo-${i}`));
  });
  return b.finish(scene, zone);
}

/** Herramientas con las que los tramos construyen el nivel. */
export class LevelBuilder {
  readonly arq: Architect;
  /** Todo lo que pisa o atraviesa el camino: el decorado no puede invadirlo. */
  readonly pathBoxes: Box[] = [];
  readonly statics: Box[] = [];
  readonly checkpoints: Checkpoint[] = [];
  readonly terminals: Terminal[] = [];
  readonly route: RouteStep[] = [];
  readonly beats: string[] = [];
  readonly pillars: Structure[] = [];
  /** Medidas de la plataforma con la que acabó el último tramo (para girar desde su costado). */
  exitPad = { halfW: 3, depth: 6 };
  lastTurn: 1 | -1 = 1;
  private anchorBoxes: Box[] = [];
  private decorBoxes: Box[] = [];
  private decorSolid: Box[] = [];
  private glowBoxes: Box[] = [];
  private undersides: { top: Box; depth: number }[] = [];
  private beamDefs: BeamDef[] = [];
  private portalDef: { center: Vec3; region: Box; alongX: boolean; span: number; height: number } | null = null;

  constructor(readonly world: World, readonly seed: number) {
    this.arq = new Architect(this);
  }

  beginBeat(title: string): void {
    this.beats.push(title);
  }

  /** Plataforma anclada: existe siempre. Debajo cuelga una panza de isla flotante. */
  platform(fr: Frame, x0: number, x1: number, f0: number, f1: number, o: { top?: number; thick?: number; depth?: number } = {}): Box {
    const top = o.top ?? 0;
    const b = fr.box(x0, top - (o.thick ?? 1.2), f0, x1, top, f1);
    this.anchorBoxes.push(b);
    this.pathBoxes.push(b);
    const depth = o.depth ?? 1;
    if (depth > 0) this.undersides.push({ top: b, depth });
    return b;
  }

  /** Estructura que solo existe mientras se observa (o se recuerda). */
  phantom(name: string, boxes: Box[], o: { memorable?: boolean; tag?: string } = {}): Structure {
    const s = this.world.create(name, 'gaze', boxes, o);
    this.pathBoxes.push(...boxes);
    return s;
  }

  checkpoint(region: Box, pos: Vec3, yaw: number): void {
    this.checkpoints.push({ index: this.checkpoints.length, region, pos, yaw });
  }

  /** Terminal: pedestal con una pantalla que cuenta algo cuando te acercas. */
  terminal(pos: Vec3, lines: string[]): void {
    const [x, y, z] = pos;
    this.decorAdd([box(x - 0.32, y, z - 0.32, x + 0.32, y + 1.0, z + 0.32), box(x - 0.45, y, z - 0.45, x + 0.45, y + 0.16, z + 0.45)], true);
    this.glowBoxes.push(box(x - 0.42, y + 1.0, z - 0.42, x + 0.42, y + 1.07, z + 0.42));
    this.terminals.push({ pos: [x, y + 1, z], radius: 4, lines });
  }

  /** Zona de estática: dentro, nadie observa. */
  blind(b: Box): void {
    this.statics.push(b);
  }

  beam(pos: Vec3, height: number, radius: number, o: { magenta?: boolean; opacity?: number; tag?: string } = {}): void {
    this.beamDefs.push({ pos, height, radius, color: o.magenta ? MAGENTA : 0xdcdcd8, opacity: o.opacity ?? 0.16, tag: o.tag ?? '' });
  }

  /** Portal de salida: el mismo arco que el del principio. Se abre al reconstruirse. */
  portal(fr: Frame, lf: number): void {
    const span = 3.2;
    const height = 5.2;
    this.arq.place(fr, this.arq.arch(span, height, 1.1), 0, 0, lf, true, true);
    this.portalDef = {
      center: fr.p(0, height / 2, lf),
      region: fr.box(-span / 2, 0, lf - 0.8, span / 2, height, lf + 0.8),
      alongX: fr.lateralIsX,
      span,
      height,
    };
    this.beam(fr.p(0, height + 1.5, lf), 70, 1.3, { magenta: true, opacity: 0.4, tag: 'portal' });
  }

  go(step: RouteStep): void {
    this.route.push(step);
  }

  /** Marco en el costado de la última plataforma, ya girado hacia ese lado. */
  turnFrom(fr: Frame, s: 1 | -1): Frame {
    this.lastTurn = s;
    return fr.at(s * this.exitPad.halfW, 0, -this.exitPad.depth / 2, s);
  }

  decorAdd(boxes: Box[], solid: boolean): void {
    this.decorBoxes.push(...boxes);
    if (solid) this.decorSolid.push(...boxes);
  }

  clearOfPath(b: Box, margin: number, ignore?: Box): boolean {
    for (const p of this.pathBoxes) if (p !== ignore && overlaps(expand(p, margin, margin, margin), b)) return false;
    return true;
  }

  finish(scene: Scene, zone: ZoneDef): LevelData {
    const rng = Rng.derive(this.seed, 'arquitectura');
    for (const u of this.undersides) {
      this.decorAdd(this.arq.underside(u.top, rng, u.depth).filter((b) => this.clearOfPath(b, 0.3, u.top)), false);
    }
    this.arq.dress(rng);

    // piedra: anclas + arquitectura, una sola malla cada una y un solo material
    const stone = createBlockMaterial('piedra');
    this.world.create('anclas', 'solid', this.anchorBoxes);
    this.world.create('arquitectura', 'solid', this.decorSolid);
    const addStatic = (boxes: Box[], salt: number) => {
      if (!boxes.length) return;
      const m = new Mesh(buildBoxGeometry(boxes, salt), stone.material);
      m.castShadow = true;
      m.receiveShadow = true;
      m.matrixAutoUpdate = false;
      scene.add(m);
    };
    addStatic(this.anchorBoxes, 1);
    addStatic(this.decorBoxes, 2);

    // estructuras observables: una malla y un material (uniformes propios) por estructura
    for (const s of this.world.phantoms) {
      const { material, u } = createBlockMaterial('fantasma');
      const m = new Mesh(buildBoxGeometry(s.boxes, s.id + 10), material);
      m.receiveShadow = true;
      m.visible = false;
      m.matrixAutoUpdate = false;
      scene.add(m);
      s.mesh = m;
      s.u = u;
    }

    if (this.glowBoxes.length) {
      const g = new Mesh(buildBoxGeometry(this.glowBoxes, 3), new MeshBasicMaterial({ color: 0xd8d8d5 }));
      g.matrixAutoUpdate = false;
      scene.add(g);
    }
    for (const st of this.statics) scene.add(createStaticVolume(st));
    const beams: Beam[] = this.beamDefs.map((d) => {
      const mesh = createBeam(d.pos, d.height, d.radius, d.color, d.opacity);
      mesh.visible = d.tag === '';
      scene.add(mesh);
      return { mesh, tag: d.tag };
    });

    let portal: Portal | null = null;
    if (this.portalDef) {
      const p = this.portalDef;
      const { mesh, active } = createPortalMembrane(p.center, p.span, p.height, p.alongX);
      scene.add(mesh);
      portal = { region: p.region, center: p.center, active };
    }

    this.world.blindZones.push(...this.statics);
    this.world.buildGrid();

    return {
      seed: this.seed,
      zone: zone.name,
      beats: this.beats,
      checkpoints: this.checkpoints,
      terminals: this.terminals,
      route: this.route,
      pillars: this.pillars,
      portal,
      beams,
    };
  }
}
