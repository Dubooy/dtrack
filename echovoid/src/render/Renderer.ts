import {
  BasicShadowMap, DepthTexture, HalfFloatType, Mesh, NearestFilter, NoToneMapping, OrthographicCamera,
  PlaneGeometry, Scene, ShaderMaterial, UnsignedByteType, Vector2, WebGLRenderTarget, WebGLRenderer,
  type PerspectiveCamera,
} from 'three';
import { CONFIG } from '../config';
import { sharedTime } from './blockMaterial';
import { common } from './glsl';
import postFrag from './shaders/post.frag.glsl?raw';
import postVert from './shaders/post.vert.glsl?raw';

export interface PostFx {
  reveal: number;
  glitch: number;
  static: number;
  flash: number;
}

/**
 * Pinta la escena a resolución interna baja (≈144 filas), la pasa por el postproceso de paleta
 * y ruido ordenado, y el navegador la amplía sin suavizar (píxeles enteros y nítidos).
 */
export class Renderer {
  readonly gl: WebGLRenderer;
  width = 1;
  height = 1;
  scale = 1;
  private rt: WebGLRenderTarget;
  private post: ShaderMaterial;
  private quadScene = new Scene();
  private quadCam = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  constructor(readonly canvas: HTMLCanvasElement, keepBuffer: boolean) {
    this.gl = new WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: keepBuffer });
    this.gl.setPixelRatio(1);
    this.gl.toneMapping = NoToneMapping;
    this.gl.shadowMap.enabled = true;
    this.gl.shadowMap.type = BasicShadowMap;
    const ext = this.gl.extensions;
    const float = ext.has('EXT_color_buffer_float') || ext.has('EXT_color_buffer_half_float');
    this.rt = new WebGLRenderTarget(1, 1, {
      type: float ? HalfFloatType : UnsignedByteType,
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      depthTexture: new DepthTexture(1, 1),
    });
    this.post = new ShaderMaterial({
      uniforms: {
        tColor: { value: this.rt.texture },
        tDepth: { value: this.rt.depthTexture },
        uRes: { value: new Vector2(1, 1) },
        uTime: sharedTime,
        uNear: { value: CONFIG.render.near },
        uFar: { value: CONFIG.render.far },
        uVignette: { value: CONFIG.render.vignette },
        uGrain: { value: CONFIG.render.grain },
        uEdge: { value: CONFIG.render.edge },
        uReveal: { value: 1 },
        uGlitch: { value: 0 },
        uStatic: { value: 0 },
        uFlash: { value: 0 },
      },
      vertexShader: postVert,
      fragmentShader: common + postFrag,
      depthTest: false,
      depthWrite: false,
    });
    const quad = new Mesh(new PlaneGeometry(2, 2), this.post);
    quad.frustumCulled = false;
    this.quadScene.add(quad);
  }

  /** Escala entera: cada píxel interno ocupa exactamente scale×scale píxeles de pantalla. */
  resize(camera: PerspectiveCamera, targetHeight: number): void {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    this.scale = Math.max(1, Math.round(vh / targetHeight));
    this.width = Math.ceil(vw / this.scale);
    this.height = Math.ceil(vh / this.scale);
    this.gl.setSize(this.width, this.height, false);
    this.canvas.style.width = `${this.width * this.scale}px`;
    this.canvas.style.height = `${this.height * this.scale}px`;
    this.rt.setSize(this.width, this.height);
    (this.post.uniforms.uRes.value as Vector2).set(this.width, this.height);
    camera.aspect = this.width / this.height;
    camera.updateProjectionMatrix();
  }

  render(scene: Scene, camera: PerspectiveCamera, fx: PostFx): void {
    const u = this.post.uniforms;
    u.uReveal.value = fx.reveal;
    u.uGlitch.value = fx.glitch;
    u.uStatic.value = fx.static;
    u.uFlash.value = fx.flash;
    this.gl.setRenderTarget(this.rt);
    this.gl.render(scene, camera);
    this.gl.setRenderTarget(null);
    this.gl.render(this.quadScene, this.quadCam);
  }
}
