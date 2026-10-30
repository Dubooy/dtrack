// Interfaz mínima durante el juego: retícula, ecos disponibles, progreso y mensajes breves que
// se escriben letra a letra, como en un terminal.

export interface EchoSlotView {
  fill: number; // tiempo restante 0..1
  warn: boolean;
}

interface Typing {
  text: string;
  shown: number;
  hold: number;
}

export class Hud {
  onType: () => void = () => {};
  private el: Record<string, HTMLElement> = {};
  private msg: Typing | null = null;
  private term: { lines: string[]; line: number; shown: number } | null = null;
  private denyT = 0;

  constructor(private root: HTMLElement) {
    root.innerHTML = `
      <div class="hud-tl"><div class="titulo">ECHO<span class="mg">//</span>VOID</div><div class="sub" data-r="zona"></div></div>
      <div class="hud-tr"><div data-r="sector"></div><div class="sub" data-r="semilla"></div></div>
      <div class="hud-bl"><div class="progreso" data-r="progreso"></div><div class="sub" data-r="tramo"></div></div>
      <div class="hud-br"><span data-r="ecotxt"></span><div class="ranuras" data-r="ranuras"></div></div>
      <div class="reticula" data-r="reticula"><i></i><b></b><span>E</span></div>
      <div class="ciego" data-r="ciego">SIN OBSERVACIÓN</div>
      <div class="mensaje" data-r="mensaje"></div>
      <div class="terminal" data-r="terminal"></div>
      <div class="ayuda" data-r="ayuda">WASD MOVERSE · RATÓN MIRAR · ESPACIO SALTAR · E RECORDAR · ESC PAUSA</div>`;
    root.querySelectorAll<HTMLElement>('[data-r]').forEach((e) => (this.el[e.dataset.r!] = e));
  }

  show(on: boolean): void {
    this.root.classList.toggle('visible', on);
  }

  setZone(zone: string, seed: number): void {
    this.el.zona.textContent = `ZONA 01 — ${zone}`;
    this.el.semilla.textContent = `SEMILLA ${String(seed).padStart(4, '0')}`;
  }

  setProgress(index: number, beats: string[]): void {
    this.el.sector.textContent = `SECTOR ${String(index + 1).padStart(2, '0')}/${String(beats.length).padStart(2, '0')}`;
    this.el.tramo.textContent = beats[index] ?? '';
    this.el.progreso.innerHTML = beats.map((_, i) => `<i class="${i < index ? 'hecho' : i === index ? 'actual' : ''}"></i>`).join('');
  }

  setEchoes(slots: EchoSlotView[], max: number): void {
    this.el.ecotxt.textContent = `ECO ${max - slots.length}/${max}`;
    let html = '';
    for (let i = 0; i < max; i++) {
      const s = slots[i];
      html += s ? `<i class="activa${s.warn ? ' aviso' : ''}"><u style="height:${Math.round(s.fill * 100)}%"></u></i>` : '<i></i>';
    }
    if (this.el.ranuras.innerHTML !== html) this.el.ranuras.innerHTML = html;
  }

  setReticle(target: boolean, blind: boolean): void {
    this.el.reticula.classList.toggle('objetivo', target);
    this.el.ciego.classList.toggle('visible', blind);
    this.root.classList.toggle('a-ciegas', blind);
  }

  deny(): void {
    this.denyT = 0.3;
    this.el.reticula.classList.add('niega');
  }

  showHelp(on: boolean): void {
    this.el.ayuda.classList.toggle('visible', on);
  }

  message(text: string, hold = 2.6): void {
    this.msg = { text, shown: 0, hold };
    this.el.mensaje.classList.add('visible');
  }

  terminal(lines: string[] | null): void {
    if (!lines) {
      this.term = null;
      this.el.terminal.classList.remove('visible');
      return;
    }
    this.term = { lines, line: 0, shown: 0 };
    this.el.terminal.innerHTML = '';
    this.el.terminal.classList.add('visible');
  }

  update(dt: number): void {
    if (this.denyT > 0 && (this.denyT -= dt) <= 0) this.el.reticula.classList.remove('niega');

    if (this.msg) {
      const m = this.msg;
      if (m.shown < m.text.length) {
        const before = Math.floor(m.shown);
        m.shown = Math.min(m.text.length, m.shown + dt * 38);
        if (Math.floor(m.shown) > before) this.onType();
        this.el.mensaje.textContent = m.text.slice(0, Math.floor(m.shown));
      } else if ((m.hold -= dt) <= 0) {
        this.el.mensaje.classList.remove('visible');
        this.msg = null;
      }
    }

    if (this.term && this.term.line < this.term.lines.length) {
      const t = this.term;
      const full = t.lines[t.line];
      const before = Math.floor(t.shown);
      t.shown = Math.min(full.length, t.shown + dt * 45);
      if (Math.floor(t.shown) > before) this.onType();
      const done = t.lines.slice(0, t.line).map((l) => `<div>&gt; ${l}</div>`).join('');
      this.el.terminal.innerHTML = `${done}<div>&gt; ${full.slice(0, Math.floor(t.shown))}<span class="cursor">█</span></div>`;
      if (t.shown >= full.length) {
        t.line++;
        t.shown = 0;
      }
    }
  }
}
