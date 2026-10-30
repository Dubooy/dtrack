import {
  AdditiveBlending, BoxGeometry, BufferGeometry, Color, CylinderGeometry, DoubleSide, Float32BufferAttribute,
  Mesh, PlaneGeometry, Points, ShaderMaterial, Vector3,
} from 'three';
import { centerOf, type Box } from '../core/box';
import type { Vec3 } from '../core/frame';
import { Rng } from '../core/rng';
import { sharedTime } from './blockMaterial';
import { common, sections } from './glsl';
import beamSrc from './shaders/beam.glsl?raw';
import dustSrc from './shaders/dust.glsl?raw';
import portalSrc from './shaders/portal.glsl?raw';
import staticSrc from './shaders/static.glsl?raw';

const BEAM = sections(beamSrc);
const STATIC = sections(staticSrc);
const PORTAL = sections(portalSrc);
const DUST = sections(dustSrc);

export const MAGENTA = 0xd52aff;

/** Columna de luz que cae del vacío: guía la vista hacia lo importante. */
export function createBeam(pos: Vec3, height: number, radius: number, color: number, opacity: number): Mesh {
  const geo = new CylinderGeometry(radius, radius * 1.2, height, 8, 1, true);
  geo.translate(0, height / 2, 0);
  const mat = new ShaderMaterial({
    uniforms: { uTime: sharedTime, uColor: { value: new Color(color) }, uOpacity: { value: opacity } },
    vertexShader: BEAM.vertex,
    fragmentShader: BEAM.fragment,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
  });
  const m = new Mesh(geo, mat);
  m.position.set(pos[0], pos[1], pos[2]);
  return m;
}

/** Volumen de estática (zona sin observación). */
export function createStaticVolume(b: Box): Mesh {
  const mat = new ShaderMaterial({
    uniforms: { uTime: sharedTime },
    vertexShader: STATIC.vertex,
    fragmentShader: common + STATIC.fragment,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
  });
  const m = new Mesh(new BoxGeometry(b.x1 - b.x0, b.y1 - b.y0, b.z1 - b.z0), mat);
  const c = centerOf(b);
  m.position.set(c[0], c[1], c[2]);
  m.renderOrder = 2;
  return m;
}

/** Membrana del portal, orientada para atravesarla en la dirección del avance. */
export function createPortalMembrane(center: Vec3, width: number, height: number, alongX: boolean): { mesh: Mesh; active: { value: number } } {
  const active = { value: 0 };
  const mat = new ShaderMaterial({
    uniforms: { uTime: sharedTime, uActive: active },
    vertexShader: PORTAL.vertex,
    fragmentShader: common + PORTAL.fragment,
    side: DoubleSide,
  });
  const mesh = new Mesh(new PlaneGeometry(width, height), mat);
  mesh.position.set(center[0], center[1], center[2]);
  if (!alongX) mesh.rotation.y = Math.PI / 2;
  return { mesh, active };
}

/** Polvo suspendido que acompaña al jugador. */
export function createDust(count: number, extent: number): { points: Points; center: Vector3 } {
  const rng = new Rng(77);
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < arr.length; i++) arr[i] = rng.range(0, extent * 2);
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(arr, 3));
  const center = new Vector3();
  const mat = new ShaderMaterial({
    uniforms: { uTime: sharedTime, uCenter: { value: center }, uExtent: { value: extent } },
    vertexShader: DUST.vertex,
    fragmentShader: DUST.fragment,
  });
  const points = new Points(geo, mat);
  points.frustumCulled = false;
  return { points, center };
}
