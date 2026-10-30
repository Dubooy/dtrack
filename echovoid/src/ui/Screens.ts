import { RESOLUTIONS, type Settings } from '../core/settings';

export interface ScreenActions {
  start(): void;
  resume(): void;
  restart(): void;
  newSeed(): void;
  sameSeed(): void;
  setting(key: keyof Settings, dir: number): void;
}

export interface Summary {
  time: number;
  echoes: number;
  falls: number;
  seed: number;
}

/** Pantallas de título, pausa y final. Texto de terminal, nada de menús recargados. */
export class Screens {
  constructor(private root: HTMLElement, private act: ScreenActions) {
    root.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>('[data-acc]');
      if (!b) return;
      e.stopPropagation();
      const [acc, key, dir] = (b.dataset.acc ?? '').split(':');
      if (acc === 'ajuste') this.act.setting(key as keyof Settings, Number(dir));
      else if (acc === 'empezar') this.act.start();
      else if (acc === 'seguir') this.act.resume();
      else if (acc === 'reiniciar') this.act.restart();
      else if (acc === 'nueva') this.act.newSeed();
      else if (acc === 'repetir') this.act.sameSeed();
    });
  }

  title(canPlay: boolean): void {
    this.root.className = 'titulo-pantalla';
    this.root.innerHTML = `
      <div class="marco" data-acc="${canPlay ? 'empezar' : ''}">
        <h1>ECHO<span class="mg">//</span>VOID</h1>
        <p class="lema">LO QUE NO MIRAS NO EXISTE.<br>LO QUE RECUERDAS PUEDE SALVARTE.</p>
        <p class="pulsa">${canPlay ? '[ CLIC PARA OBSERVAR ]' : 'NECESITAS TECLADO Y RATÓN'}</p>
        <p class="controles">WASD MOVERSE · RATÓN MIRAR · ESPACIO SALTAR · E RECORDAR · ESC PAUSA</p>
        <p class="pie">EXPLORA &nbsp;/&nbsp; RECUERDA &nbsp;/&nbsp; SOBREVIVE</p>
      </div>`;
  }

  pause(s: Settings, seed: number): void {
    this.root.className = 'menu-pantalla';
    const row = (label: string, key: keyof Settings, value: string) =>
      `<div class="fila"><span>${label}</span><button data-acc="ajuste:${key}:-1">‹</button><b>${value}</b><button data-acc="ajuste:${key}:1">›</button></div>`;
    this.root.innerHTML = `
      <div class="marco">
        <h2>PAUSA</h2>
        <button class="op" data-acc="seguir">CONTINUAR</button>
        <button class="op" data-acc="reiniciar">VOLVER AL ÚLTIMO PUNTO</button>
        <button class="op" data-acc="nueva">OTRO UNIVERSO (NUEVA SEMILLA)</button>
        <div class="ajustes">
          ${row('SENSIBILIDAD', 'sensitivity', s.sensitivity.toFixed(1))}
          ${row('RESOLUCIÓN', 'resolution', `${s.resolution} FILAS`)}
          ${row('VOLUMEN', 'volume', `${Math.round(s.volume * 100)}%`)}
        </div>
        <p class="pie">SEMILLA ${String(seed).padStart(4, '0')} · ${RESOLUTIONS.length} RESOLUCIONES · CLIC EN CONTINUAR PARA VOLVER</p>
      </div>`;
  }

  complete(z: Summary): void {
    this.root.className = 'menu-pantalla final';
    const mm = String(Math.floor(z.time / 60)).padStart(2, '0');
    const ss = String(Math.floor(z.time % 60)).padStart(2, '0');
    this.root.innerHTML = `
      <div class="marco">
        <p class="sub">ZONA 01 — UMBRAL</p>
        <h2>RECONSTRUIDA</h2>
        <p class="datos">TIEMPO ${mm}:${ss} · ECOS ${z.echoes} · CAÍDAS ${z.falls}</p>
        <p class="texto">&gt; ¿ESTÁS DESCUBRIENDO ESTE LUGAR<br>&gt; O RECONSTRUYÉNDOLO?</p>
        <button class="op" data-acc="nueva">OBSERVAR OTRO UNIVERSO</button>
        <button class="op" data-acc="repetir">REPETIR ESTE (SEMILLA ${String(z.seed).padStart(4, '0')})</button>
        <p class="pie">ZONA 02 — EN CONSTRUCCIÓN</p>
      </div>`;
  }

  hide(): void {
    this.root.className = '';
    this.root.innerHTML = '';
  }
}
