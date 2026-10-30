// Teclado y ratón. El ratón solo mueve la cámara con el puntero capturado (pointer lock).

const GAME_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'KeyE', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

export class Input {
  locked = false;
  onLockChange: (locked: boolean) => void = () => {};
  private down = new Set<string>();
  private pressed = new Set<string>();
  private mdx = 0;
  private mdy = 0;

  constructor(private target: HTMLElement) {
    window.addEventListener('keydown', (e) => {
      if (GAME_KEYS.has(e.code)) e.preventDefault();
      if (e.repeat) return;
      this.down.add(e.code);
      this.pressed.add(e.code);
    });
    window.addEventListener('keyup', (e) => this.down.delete(e.code));
    window.addEventListener('blur', () => this.down.clear());
    document.addEventListener('mousemove', (e) => {
      if (!this.locked) return;
      // algunos navegadores dan un salto enorme justo al capturar el puntero
      if (Math.abs(e.movementX) > 400 || Math.abs(e.movementY) > 400) return;
      this.mdx += e.movementX;
      this.mdy += e.movementY;
    });
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === this.target;
      this.onLockChange(this.locked);
    });
  }

  lock(): void {
    try {
      const r = this.target.requestPointerLock() as unknown;
      if (r instanceof Promise) r.catch(() => {});
    } catch {
      /* el navegador no deja capturar el puntero ahora */
    }
  }

  unlock(): void {
    if (document.pointerLockElement) document.exitPointerLock();
  }

  isDown(code: string): boolean {
    return this.down.has(code);
  }

  axis(neg: string[], pos: string[]): number {
    return (pos.some((c) => this.down.has(c)) ? 1 : 0) - (neg.some((c) => this.down.has(c)) ? 1 : 0);
  }

  consumePress(code: string): boolean {
    const had = this.pressed.has(code);
    this.pressed.delete(code);
    return had;
  }

  consumeMouse(): { dx: number; dy: number } {
    const r = { dx: this.mdx, dy: this.mdy };
    this.mdx = 0;
    this.mdy = 0;
    return r;
  }

  endFrame(): void {
    this.pressed.clear();
  }

  /** Solo para las pruebas automáticas. */
  setKey(code: string, down: boolean): void {
    if (down) {
      this.down.add(code);
      this.pressed.add(code);
    } else this.down.delete(code);
  }
}
