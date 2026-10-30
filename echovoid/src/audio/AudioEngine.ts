// Sonido procedural con Web Audio: nada de archivos. Viento lejano, zumbidos graves, pulsos
// digitales al materializarse algo y una cola de reverberación que hace grande el vacío.

export interface AmbientLevels {
  wind: number;
  drone: number;
  hiss: number; // estática
  hum: number; // portal activo
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private out!: GainNode;
  private verbIn!: GainNode;
  private noise!: AudioBuffer;
  private wind!: GainNode;
  private drone!: GainNode;
  private hiss!: GainNode;
  private hum!: GainNode;
  private volume = 0.8;
  private ducked = false;
  private last: Record<string, number> = {};

  get ready(): boolean {
    return this.ctx !== null;
  }

  /** Solo puede arrancar tras un gesto del jugador (clic). */
  start(volume: number): void {
    this.volume = volume;
    if (this.ctx) {
      void this.ctx.resume();
      return;
    }
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    this.ctx = ctx;
    this.out = ctx.createGain();
    this.out.gain.value = volume;
    const comp = ctx.createDynamicsCompressor();
    this.out.connect(comp).connect(ctx.destination);

    const verb = ctx.createConvolver();
    verb.buffer = this.impulse(3.4, 2.4);
    this.verbIn = ctx.createGain();
    this.verbIn.gain.value = 0.6;
    this.verbIn.connect(verb).connect(this.out);
    this.noise = this.makeNoise(3);

    // viento: ruido filtrado que respira despacio
    const ws = this.loopNoise();
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 420;
    bp.Q.value = 0.7;
    this.lfo(0.06, 220, bp.frequency);
    this.wind = ctx.createGain();
    this.wind.gain.value = 0;
    ws.connect(bp).connect(this.wind).connect(this.out);
    this.lfo(0.11, 0.035, this.wind.gain);

    // zumbido grave con batido lento
    this.drone = ctx.createGain();
    this.drone.gain.value = 0;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 260;
    for (const f of [55, 55.35, 82.6]) {
      const o = ctx.createOscillator();
      o.type = f > 80 ? 'triangle' : 'sine';
      o.frequency.value = f;
      o.connect(lp);
      o.start();
    }
    lp.connect(this.drone);
    this.drone.connect(this.out);
    this.drone.connect(this.verbIn);

    // estática
    const hs = this.loopNoise();
    hs.playbackRate.value = 0.7;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1800;
    this.hiss = ctx.createGain();
    this.hiss.gain.value = 0;
    hs.connect(hp).connect(this.hiss).connect(this.out);

    // portal: acorde que tiembla
    this.hum = ctx.createGain();
    this.hum.gain.value = 0;
    const trem = ctx.createGain();
    trem.gain.value = 0.5;
    this.lfo(3.3, 0.5, trem.gain);
    for (const f of [110, 164.8, 220.6]) {
      const o = ctx.createOscillator();
      o.frequency.value = f;
      o.connect(trem);
      o.start();
    }
    trem.connect(this.hum);
    this.hum.connect(this.out);
    this.hum.connect(this.verbIn);
  }

  setVolume(v: number): void {
    this.volume = v;
    this.applyVolume();
  }

  duck(on: boolean): void {
    this.ducked = on;
    this.applyVolume();
  }

  private applyVolume(): void {
    if (!this.ctx) return;
    this.out.gain.setTargetAtTime(this.volume * (this.ducked ? 0.2 : 1), this.ctx.currentTime, 0.15);
  }

  ambient(l: AmbientLevels): void {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.wind.gain.setTargetAtTime(l.wind, t, 0.6);
    this.drone.gain.setTargetAtTime(l.drone, t, 0.8);
    this.hiss.gain.setTargetAtTime(l.hiss, t, 0.15);
    this.hum.gain.setTargetAtTime(l.hum, t, 0.5);
  }

  // ---- sonidos sueltos ----

  materialize(size: number, dist: number): void {
    if (!this.throttle('mat', 0.05)) return;
    const f = (1500 / (1 + size * 0.06)) * (0.92 + Math.random() * 0.16);
    const g = 0.045 * Math.max(0.12, 1 - dist / 60);
    this.tone('square', f, f * 0.5, 0.07, g, 0.6);
    this.burst(0.05, f * 2, 4, g * 0.5, 0.3);
  }

  groundFading(): void {
    this.burst(0.4, 900, 0.8, 0.05, 0.4, 'highpass');
    this.tone('sawtooth', 210, 80, 0.45, 0.025, 0.3);
  }

  echo(): void {
    this.tone('sawtooth', 320, 640, 0.35, 0.05, 0.7);
    this.tone('sine', 960, 1280, 0.6, 0.05, 0.9, 0.05);
    this.burst(0.25, 3000, 1, 0.025, 0.6, 'highpass');
  }

  echoTick(): void {
    if (this.throttle('tick', 0.06)) this.tone('sine', 1500, 1400, 0.03, 0.035, 0.2);
  }

  echoEnd(): void {
    this.tone('triangle', 640, 150, 0.55, 0.055, 0.7);
  }

  deny(): void {
    this.tone('square', 140, 110, 0.09, 0.035, 0.1);
  }

  jump(): void {
    this.burst(0.09, 700, 1.2, 0.025, 0.1);
  }

  land(v: number): void {
    this.tone('sine', 120, 45, 0.16, Math.min(0.12, 0.02 + v * 0.008), 0.15);
    this.burst(0.06, 420, 1, Math.min(0.05, 0.01 + v * 0.003), 0.1);
  }

  step(): void {
    this.burst(0.035, 1700 + Math.random() * 500, 2.5, 0.012, 0.05);
  }

  fall(): void {
    this.burst(1.4, 500, 0.5, 0.05, 0.6, 'lowpass');
    this.tone('sine', 300, 40, 1.4, 0.05, 0.6);
  }

  respawn(): void {
    [440, 660, 880].forEach((f, i) => this.tone('sine', f, f, 0.5, 0.035, 0.8, i * 0.08));
  }

  type(): void {
    if (this.throttle('type', 0.035)) this.tone('square', 2400, 2300, 0.012, 0.01, 0);
  }

  checkpoint(): void {
    this.tone('sine', 523, 523, 0.7, 0.03, 0.8);
    this.tone('sine', 784, 784, 0.9, 0.022, 0.8, 0.1);
  }

  portalOpen(): void {
    this.tone('sawtooth', 110, 110, 2.6, 0.04, 0.9);
    this.tone('sine', 220, 440, 2.2, 0.05, 0.9);
    this.tone('sine', 330, 660, 2.6, 0.04, 0.9, 0.2);
  }

  complete(): void {
    [220, 277, 330, 440].forEach((f, i) => this.tone('sine', f, f * 1.01, 3, 0.035, 1, i * 0.15));
  }

  // ---- utilidades ----

  private throttle(key: string, sec: number): boolean {
    if (!this.ctx) return false;
    const now = this.ctx.currentTime;
    if (now - (this.last[key] ?? -10) < sec) return false;
    this.last[key] = now;
    return true;
  }

  private tone(type: OscillatorType, f0: number, f1: number, dur: number, gain: number, wet: number, delay = 0): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.out);
    if (wet > 0) {
      const w = ctx.createGain();
      w.gain.value = wet;
      g.connect(w).connect(this.verbIn);
    }
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  private burst(dur: number, freq: number, q: number, gain: number, wet: number, type: BiquadFilterType = 'bandpass'): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    const s = ctx.createBufferSource();
    s.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(this.out);
    if (wet > 0) {
      const w = ctx.createGain();
      w.gain.value = wet;
      g.connect(w).connect(this.verbIn);
    }
    s.start(t, Math.random() * 2);
    s.stop(t + dur + 0.05);
  }

  private loopNoise(): AudioBufferSourceNode {
    const s = this.ctx!.createBufferSource();
    s.buffer = this.noise;
    s.loop = true;
    s.start();
    return s;
  }

  private lfo(freq: number, depth: number, target: AudioParam): void {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.value = depth;
    o.connect(g).connect(target);
    o.start();
  }

  private makeNoise(sec: number): AudioBuffer {
    const ctx = this.ctx!;
    const b = ctx.createBuffer(1, Math.floor(ctx.sampleRate * sec), ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }

  private impulse(sec: number, decay: number): AudioBuffer {
    const ctx = this.ctx!;
    const len = Math.floor(ctx.sampleRate * sec);
    const b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return b;
  }
}
