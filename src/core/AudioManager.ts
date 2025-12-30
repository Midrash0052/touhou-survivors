/**
 * 音频管理器 - 处理BGM和音效
 */

const NOTES: Record<string, number> = {
  'Bb3': 233.08, 'B3': 246.94, 'C4': 261.63, 'C#4': 277.18,
  'D4': 293.66, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23,
  'F#4': 369.99, 'G4': 392.00, 'Ab4': 415.30, 'A4': 440.00,
  'Bb4': 466.16, 'B4': 493.88, 'C5': 523.25, 'C#5': 554.37,
  'D5': 587.33, 'Eb5': 622.25, 'E5': 659.25, 'F5': 698.46,
  'F#5': 739.99, 'G5': 783.99, 'Ab5': 830.61, 'A5': 880.00,
  'Bb5': 932.33, 'B5': 987.77, 'C6': 1046.50, 'D6': 1174.66,
  'Eb6': 1244.51
};

export type MelodyNote = string | number;

export class MusicPlayer {
  private isPlaying = false;
  private currentIndex = 0;
  private nextNoteTime = 0;
  private melody: MelodyNote[] = [];
  private tempo = 120;
  private oscillatorType: OscillatorType = 'square';
  private timerID: number | null = null;
  private audioContext: AudioContext;
  private masterGain: GainNode;

  constructor(audioContext: AudioContext, masterGain: GainNode) {
    this.audioContext = audioContext;
    this.masterGain = masterGain;
  }

  play(melody: MelodyNote[], tempo: number, oscillatorType: OscillatorType): void {
    if (this.isPlaying) this.stop();
    this.melody = melody;
    this.tempo = tempo;
    this.oscillatorType = oscillatorType;
    this.isPlaying = true;
    this.currentIndex = 0;
    this.nextNoteTime = this.audioContext.currentTime + 0.1;
    this.scheduler();
  }

  stop(): void {
    this.isPlaying = false;
    if (this.timerID !== null) {
      clearTimeout(this.timerID);
    }
  }

  private scheduler(): void {
    if (!this.isPlaying) return;
    while (this.nextNoteTime < this.audioContext.currentTime + 0.1) {
      this.playNote(
        this.melody[this.currentIndex] as string,
        this.melody[this.currentIndex + 1] as number
      );
      this.nextNoteTime += this.melody[this.currentIndex + 1] * (60.0 / this.tempo);
      this.currentIndex = (this.currentIndex + 2) % this.melody.length;
    }
    this.timerID = setTimeout(() => this.scheduler(), 25);
  }

  private playNote(note: string, duration: number): void {
    if (note === 'Rest' || !NOTES[note]) return;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const time = this.nextNoteTime;
    const dur = (60.0 / this.tempo) * duration;

    osc.type = this.oscillatorType;
    osc.frequency.value = NOTES[note];
    gain.gain.setValueAtTime(0.01, time);
    gain.gain.linearRampToValueAtTime(0.05, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur * 0.9);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + dur);
  }
}

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicPlayer: MusicPlayer | null = null;

  init(): void {
    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.audioContext.destination);
      this.musicPlayer = new MusicPlayer(this.audioContext, this.masterGain);
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  playMusic(melody: MelodyNote[], tempo: number, oscillatorType: OscillatorType): void {
    this.init();
    this.musicPlayer?.play(melody, tempo, oscillatorType);
  }

  stopMusic(): void {
    this.musicPlayer?.stop();
  }

  playSFX(type: 'shoot' | 'slash' | 'hit' | 'ult' | 'kill'): void {
    if (!this.audioContext || !this.masterGain) return;
    const t = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);

    switch (type) {
      case 'shoot':
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.1);
        break;
      case 'slash':
        osc.type = 'sawtooth';
        osc.frequency.value = 100;
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        break;
      case 'hit':
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.05);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
        break;
      case 'ult':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(50, t);
        osc.frequency.linearRampToValueAtTime(800, t + 1.0);
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.linearRampToValueAtTime(0, t + 1.0);
        break;
      case 'kill':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.linearRampToValueAtTime(1200, t + 0.1);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.1);
        break;
    }

    osc.start(t);
    const duration = type === 'ult' ? 1.0 : (type === 'hit' ? 0.05 : 0.1);
    osc.stop(t + duration);
  }
}

// 全局音频管理器实例
export const audioManager = new AudioManager();
