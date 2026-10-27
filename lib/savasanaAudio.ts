// Generative soundscape for Savasana: a warm drone, soft "ocean breath"
// noise and a singing bowl at the start and end. No audio files needed.

type AudioContextCtor = typeof AudioContext;

export class SavasanaAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sources: AudioScheduledSourceNode[] = [];

  private ensure() {
    if (this.ctx) return this.ctx;
    const Ctor: AudioContextCtor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: AudioContextCtor }).webkitAudioContext;
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    this.ctx = ctx;
    this.master = master;
    return ctx;
  }

  async start() {
    const ctx = this.ensure();
    await ctx.resume();
    const master = this.master!;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0.9, now + 3);

    if (this.sources.length === 0) {
      this.startDrone(ctx, master);
      this.startBreath(ctx, master);
    }
  }

  async pause() {
    await this.ctx?.suspend();
  }

  async resume() {
    await this.ctx?.resume();
  }

  /** Fade everything out and release the audio graph. */
  stop(fade = 2.5) {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + fade);
    const sources = this.sources;
    this.sources = [];
    sources.forEach((s) => s.stop(now + fade + 0.1));
  }

  bowl(fundamental = 196) {
    const ctx = this.ensure();
    const out = ctx.createGain();
    out.gain.value = 0.5;
    out.connect(ctx.destination);
    const now = ctx.currentTime;
    // Inharmonic partials typical of a Tibetan singing bowl.
    const partials: [number, number, number][] = [
      [1, 0.5, 9],
      [2.71, 0.22, 7],
      [5.15, 0.1, 5],
      [8.4, 0.04, 3.5],
    ];
    partials.forEach(([ratio, gain, decay], i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = fundamental * ratio;
      // Slight detune between pairs creates the bowl's slow beating.
      osc.detune.value = i % 2 ? 4 : -3;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(gain, now + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, now + decay);
      osc.connect(g).connect(out);
      osc.start(now);
      osc.stop(now + decay + 0.1);
    });
  }

  async close() {
    this.stop(0.05);
    await this.ctx?.close();
    this.ctx = null;
    this.master = null;
  }

  private startDrone(ctx: AudioContext, master: GainNode) {
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 700;
    filter.Q.value = 0.4;
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.09;
    filter.connect(droneGain).connect(master);

    [98, 146.83, 196.5, 293.66].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? "triangle" : "sine";
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = [0.5, 0.35, 0.22, 0.08][i];
      // Each voice swells slowly at its own rate.
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.05 + i * 0.023;
      lfoGain.gain.value = g.gain.value * 0.6;
      lfo.connect(lfoGain).connect(g.gain);
      osc.connect(g).connect(filter);
      osc.start();
      lfo.start();
      this.sources.push(osc, lfo);
    });
  }

  private startBreath(ctx: AudioContext, master: GainNode) {
    const length = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    // Pinkish noise via a simple one-pole filter on white noise.
    let last = 0;
    for (let i = 0; i < length; i++) {
      last = 0.97 * last + 0.03 * (Math.random() * 2 - 1);
      data[i] = last * 6;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 420;
    filter.Q.value = 0.6;

    const g = ctx.createGain();
    g.gain.value = 0.05;
    // ~6 breaths per minute: inhale and exhale like slow waves.
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.1;
    lfoGain.gain.value = 0.045;
    lfo.connect(lfoGain).connect(g.gain);

    noise.connect(filter).connect(g).connect(master);
    noise.start();
    lfo.start();
    this.sources.push(noise, lfo);
  }
}
