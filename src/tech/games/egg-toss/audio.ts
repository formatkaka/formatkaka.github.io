import type { BasketBehavior } from './types';

const AUDIO_SETTING_KEY = 'toss-kaka-sfx-enabled';

export class GameAudio {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private warningGain: GainNode | null = null;
  private isEnabled = this.loadEnabledSetting();
  private themeIndex = 0;

  setTheme(modeIndex: number) {
    this.themeIndex = modeIndex;
  }

  unlock() {
    if (!this.context) {
      this.context = new AudioContext();
      this.setupMixGraph();
    }
    if (this.context.state === 'suspended') void this.context.resume();
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    this.applyEnabledState();
    this.saveEnabledSetting();
    return this.isEnabled;
  }

  get enabled() {
    return this.isEnabled;
  }

  jump(modeIndex = this.themeIndex) {
    const profile = JUMP_PROFILES[modeIndex % JUMP_PROFILES.length];
    this.playVariedTone(profile.start, profile.end, 0.1, profile.type, 0.05);
  }

  catch(modeIndex = this.themeIndex) {
    const profile = CATCH_PROFILES[modeIndex % CATCH_PROFILES.length];
    this.playVariedTone(profile.start, profile.end, 0.1, profile.type, 0.065);
    this.playVariedTone(profile.end * 1.08, profile.end * 1.3, 0.08, 'sine', 0.04, 0.065);
  }

  reward(isMajor: boolean) {
    if (!isMajor) return;
    this.playVariedTone(620, 980, 0.16, 'triangle', 0.045, 0.04);
  }

  miss() {
    this.playTone(220, 90, 0.26, 'sawtooth', 0.055);
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
      PAUSE: () => this.playTone(150, 75, 0.11, 'triangle', 0.07, 0, 'WARNING'),
      REVERSE: () => this.playTurnImpact(),
      SWIFT: () => this.playNoise(0.2, 0.065, 1300, 2800, 'WARNING'),
      STEADY: () => undefined,
    };
    sounds[behavior]();
  }

  private setupMixGraph() {
    if (!this.context) return;
    this.masterGain = this.context.createGain();
    this.sfxGain = this.context.createGain();
    this.warningGain = this.context.createGain();
    this.sfxGain.gain.value = decibelsToGain(-4);
    this.warningGain.gain.value = decibelsToGain(-2);
    this.sfxGain.connect(this.masterGain);
    this.warningGain.connect(this.masterGain);
    this.masterGain.connect(this.context.destination);
    this.applyEnabledState();
  }

  private applyEnabledState() {
    if (!this.context || !this.masterGain) return;
    const now = this.context.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(this.isEnabled ? decibelsToGain(-3) : 0.0001, now, 0.02);
  }

  private playWindWarning() {
    this.playNoise(0.28, 0.055, 420, 1500, 'WARNING');
    this.playTone(240, 520, 0.2, 'sine', 0.035, 0, 'WARNING');
  }

  private playBrakeWarning() {
    this.playTone(620, 360, 0.13, 'triangle', 0.055, 0, 'WARNING');
    this.playTone(350, 190, 0.13, 'triangle', 0.05, 0.13, 'WARNING');
  }

  private playTurnWarning() {
    this.playTone(260, 310, 0.11, 'square', 0.04, 0, 'WARNING');
    this.playTone(260, 310, 0.11, 'square', 0.04, 0.15, 'WARNING');
  }

  private playTurnImpact() {
    this.playTone(120, 75, 0.08, 'square', 0.065, 0, 'WARNING');
    this.playTone(360, 620, 0.14, 'triangle', 0.045, 0.07, 'WARNING');
  }

  private playVariedTone(
    start: number,
    end: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    delay = 0
  ) {
    const variation = 0.96 + Math.random() * 0.08;
    this.playTone(start * variation, end * variation, duration, type, volume, delay);
  }

  private playNoise(
    duration: number,
    volume: number,
    startFrequency: number,
    endFrequency: number,
    bus: AudioBus = 'SFX'
  ) {
    if (!this.context || !this.isEnabled) return;
    const startTime = this.context.currentTime;
    const { source, filter, gain } = this.createNoiseNodes(duration, bus);
    filter.frequency.setValueAtTime(startFrequency, startTime);
    filter.frequency.exponentialRampToValueAtTime(endFrequency, startTime + duration);
    this.setToneEnvelope(gain, volume, startTime, duration);
    source.start(startTime);
    source.stop(startTime + duration);
  }

  private createNoiseNodes(duration: number, bus: AudioBus): NoiseNodes {
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
    source.connect(filter).connect(gain).connect(this.getBus(bus));
    return { source, filter, gain };
  }

  private playTone(
    startFrequency: number,
    endFrequency: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    delay = 0,
    bus: AudioBus = 'SFX'
  ) {
    if (!this.context || !this.isEnabled) return;
    const startTime = this.context.currentTime + delay;
    const { oscillator, gain } = this.createTone(startFrequency, type, startTime, bus);
    this.setToneEnvelope(gain, volume, startTime, duration);
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, startTime + duration);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.02);
  }

  private createTone(
    frequency: number,
    type: OscillatorType,
    startTime: number,
    bus: AudioBus
  ): ToneNodes {
    const oscillator = this.context?.createOscillator();
    const gain = this.context?.createGain();
    if (!oscillator || !gain) throw new Error('Audio context is unavailable');
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.connect(gain).connect(this.getBus(bus));
    return { oscillator, gain };
  }

  private getBus(bus: AudioBus) {
    const node = bus === 'WARNING' ? this.warningGain : this.sfxGain;
    if (!node) throw new Error('Audio mix graph is unavailable');
    return node;
  }

  private setToneEnvelope(gain: GainNode, volume: number, startTime: number, duration: number) {
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  }

  private loadEnabledSetting() {
    try {
      return window.localStorage.getItem(AUDIO_SETTING_KEY) !== 'false';
    } catch {
      return true;
    }
  }

  private saveEnabledSetting() {
    try {
      window.localStorage.setItem(AUDIO_SETTING_KEY, String(this.isEnabled));
    } catch {
      // Keep the setting for the current session when storage is unavailable.
    }
  }
}

const JUMP_PROFILES: SoundProfile[] = [
  { start: 360, end: 560, type: 'sine' },
  { start: 290, end: 470, type: 'triangle' },
  { start: 430, end: 650, type: 'sine' },
];

const CATCH_PROFILES: SoundProfile[] = [
  { start: 520, end: 720, type: 'triangle' },
  { start: 420, end: 610, type: 'sine' },
  { start: 610, end: 820, type: 'triangle' },
];

function decibelsToGain(decibels: number) {
  return 10 ** (decibels / 20);
}

type AudioBus = 'SFX' | 'WARNING';
type SoundProfile = { start: number; end: number; type: OscillatorType };
type ToneNodes = { oscillator: OscillatorNode; gain: GainNode };
type NoiseNodes = {
  source: AudioBufferSourceNode;
  filter: BiquadFilterNode;
  gain: GainNode;
};
