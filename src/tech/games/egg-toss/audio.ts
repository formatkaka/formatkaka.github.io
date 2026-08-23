import type { BasketBehavior } from './types';

export class GameAudio {
  private context: AudioContext | null = null;
  private isEnabled = true;

  unlock() {
    if (!this.context) this.context = new AudioContext();
    if (this.context.state === 'suspended') void this.context.resume();
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }

  get enabled() {
    return this.isEnabled;
  }

  jump() {
    this.playTone(360, 560, 0.1, 'sine', 0.06);
  }

  catch() {
    this.playTone(520, 720, 0.1, 'triangle', 0.07);
    this.playTone(760, 920, 0.08, 'sine', 0.05, 0.07);
  }

  miss() {
    this.playTone(220, 90, 0.22, 'sawtooth', 0.06);
  }

  receiverWarning(behavior: BasketBehavior) {
    const sounds = {
      PAUSE: () => this.playBrakeWarning(),
      REVERSE: () => this.playTurnWarning(),
      SWIFT: () => this.playWindWarning(),
      STEADY: () => undefined,
    };
    sounds[behavior]();
  }

  receiverAction(behavior: BasketBehavior) {
    const sounds = {
      PAUSE: () => this.playTone(150, 75, 0.11, 'triangle', 0.06),
      REVERSE: () => this.playTurnImpact(),
      SWIFT: () => this.playNoise(0.2, 0.055, 1300, 2800),
      STEADY: () => this.playTone(330, 440, 0.07, 'sine', 0.022),
    };
    sounds[behavior]();
  }

  private playWindWarning() {
    this.playNoise(0.28, 0.04, 420, 1500);
    this.playTone(240, 520, 0.2, 'sine', 0.025);
  }

  private playBrakeWarning() {
    this.playTone(620, 360, 0.13, 'triangle', 0.045);
    this.playTone(350, 190, 0.13, 'triangle', 0.04, 0.13);
  }

  private playTurnWarning() {
    this.playTone(260, 310, 0.11, 'square', 0.03);
    this.playTone(260, 310, 0.11, 'square', 0.03, 0.15);
  }

  private playTurnImpact() {
    this.playTone(120, 75, 0.08, 'square', 0.055);
    this.playTone(360, 620, 0.14, 'triangle', 0.035, 0.07);
  }

  private playNoise(
    duration: number,
    volume: number,
    startFrequency: number,
    endFrequency: number
  ) {
    if (!this.context || !this.isEnabled) return;

    const startTime = this.context.currentTime;
    const { source, filter, gain } = this.createNoiseNodes(duration);
    filter.frequency.setValueAtTime(startFrequency, startTime);
    filter.frequency.exponentialRampToValueAtTime(endFrequency, startTime + duration);
    this.setToneEnvelope(gain, volume, startTime, duration);
    source.start(startTime);
    source.stop(startTime + duration);
  }

  private createNoiseNodes(duration: number): NoiseNodes {
    if (!this.context) throw new Error('Audio context is unavailable');

    const frameCount = Math.ceil(this.context.sampleRate * duration);
    const buffer = this.context.createBuffer(1, frameCount, this.context.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let index = 0; index < frameCount; index++) samples[index] = Math.random() * 2 - 1;

    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    source.buffer = buffer;
    filter.type = 'bandpass';
    filter.Q.value = 0.8;
    source.connect(filter).connect(gain).connect(this.context.destination);
    return { source, filter, gain };
  }

  private playTone(
    startFrequency: number,
    endFrequency: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    delay = 0
  ) {
    if (!this.context || !this.isEnabled) return;

    const startTime = this.context.currentTime + delay;
    const { oscillator, gain } = this.createTone(startFrequency, type, startTime);
    this.setToneEnvelope(gain, volume, startTime, duration);
    oscillator.frequency.linearRampToValueAtTime(endFrequency, startTime + duration);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.02);
  }

  private createTone(frequency: number, type: OscillatorType, startTime: number): ToneNodes {
    const oscillator = this.context?.createOscillator();
    const gain = this.context?.createGain();
    if (!oscillator || !gain) throw new Error('Audio context is unavailable');

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.connect(gain).connect(this.context.destination);
    return { oscillator, gain };
  }

  private setToneEnvelope(gain: GainNode, volume: number, startTime: number, duration: number) {
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  }
}

type ToneNodes = { oscillator: OscillatorNode; gain: GainNode };
type NoiseNodes = {
  source: AudioBufferSourceNode;
  filter: BiquadFilterNode;
  gain: GainNode;
};
