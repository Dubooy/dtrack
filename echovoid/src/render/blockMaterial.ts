import { MeshLambertMaterial } from 'three';
import block from './shaders/block.glsl?raw';
import { common, sections } from './glsl';

const S = sections(block);

/** Reloj compartido por todos los shaders. */
export const sharedTime = { value: 0 };

export interface BlockUniforms {
  uPresence: { value: number };
  uEcho: { value: number };
  uBlink: { value: number };
  uTarget: { value: number };
  uStyle: { value: number };
}

/**
 * Material de los bloques del mundo: Lambert de Three.js (luces, sombras, niebla) con el estilo
 * de ECHO//VOID inyectado: sillares, aristas, disolución por presencia y color de eco.
 * Todas las instancias comparten programa; cada una tiene sus propios uniformes.
 */
export function createBlockMaterial(style: 'piedra' | 'fantasma'): { material: MeshLambertMaterial; u: BlockUniforms } {
  const u: BlockUniforms = {
    uPresence: { value: style === 'piedra' ? 1 : 0 },
    uEcho: { value: 0 },
    uBlink: { value: 0 },
    uTarget: { value: 0 },
    uStyle: { value: style === 'piedra' ? 0 : 1 },
  };
  const material = new MeshLambertMaterial({ color: style === 'piedra' ? 0xb2b2ae : 0xd9d9d5 });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, u, { uTime: sharedTime });
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${common}\n${S.vertex_pars}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\n${S.vertex_main}`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${common}\n${S.fragment_pars}`)
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );', `vec4 diffuseColor = vec4( diffuse, opacity );\n${S.fragment_surface}`)
      .replace('#include <opaque_fragment>', `${S.fragment_light}\n#include <opaque_fragment>`);
  };
  material.customProgramCacheKey = () => 'echovoid-bloque';
  return { material, u };
}
