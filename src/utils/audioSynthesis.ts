// Web Speech API and Web Audio API synthesized sound cues with Algorithmic Ambient Synth

import { ViralSoundEffect } from '../types/stem';

export type CanvasTheme = '3blue1brown' | 'chalkboard' | 'cyberpunk';

class AudioService {
  private audioCtx: AudioContext | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;

  // Background Synth properties
  private bgGainNode: GainNode | null = null;
  private bgIntervalId: any = null;
  private isBgPlaying = false;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Algorithmic Hypnotic Background Soundtrack (Pentatonic ambient synth without copyright)
  startAmbientSoundtrack(volume = 0.04) {
    if (this.isBgPlaying) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    this.isBgPlaying = true;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, ctx.currentTime);
    masterGain.connect(ctx.destination);
    this.bgGainNode = masterGain;

    // Pentatonic scale frequencies in Hz (C Major / A Minor: C4, D4, E4, G4, A4, C5, D5, E5)
    const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];

    // Arpeggiator loop
    let step = 0;
    this.bgIntervalId = setInterval(() => {
      if (!this.isBgPlaying) return;
      try {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.value = 800; // Warm soft tone

        const noteIndex = (step * 3) % scale.length;
        const freq = scale[noteIndex];
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const now = ctx.currentTime;
        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.linearRampToValueAtTime(0.4, now + 0.1);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 1.3);

        step++;
      } catch (err) {
        console.warn(err);
      }
    }, 450);
  }

  stopAmbientSoundtrack() {
    this.isBgPlaying = false;
    if (this.bgIntervalId) {
      clearInterval(this.bgIntervalId);
      this.bgIntervalId = null;
    }
    if (this.bgGainNode && this.audioCtx) {
      this.bgGainNode.gain.linearRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.5);
      setTimeout(() => {
        if (this.bgGainNode) {
          this.bgGainNode.disconnect();
          this.bgGainNode = null;
        }
      }, 550);
    }
  }

  isSoundtrackActive(): boolean {
    return this.isBgPlaying;
  }

  // Viral Transition Whoosh (synthesized noise sweep)
  playWhoosh() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const bufferSize = ctx.sampleRate * 0.35;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 3.0;

      const now = ctx.currentTime;
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(3200, now + 0.15);
      filter.frequency.exponentialRampToValueAtTime(150, now + 0.35);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.35);
    } catch (e) {
      console.warn(e);
    }
  }

  // Viral Impact Bass / Boom Drop for dramatic reveals
  playImpactBass() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.55);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    } catch (e) {
      console.warn(e);
    }
  }

  // Viral Pop sound
  playPop() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      console.warn(e);
    }
  }

  // Tension Riser for Suspense / Hook
  playTensionRiser() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.7);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.7);
    } catch (e) {
      console.warn(e);
    }
  }

  // Play pleasant STEM transition chime
  playSceneTransitionSound() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      const now = ctx.currentTime;
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.35); // G5

      osc2.frequency.setValueAtTime(659.25, now); // E5
      osc2.frequency.exponentialRampToValueAtTime(1046.5, now + 0.35); // C6

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.5);
      osc2.stop(now + 0.5);
    } catch (e) {
      console.warn('Audio effects not supported or blocked:', e);
    }
  }

  // Dispatch viral cue
  playViralCue(cue?: ViralSoundEffect) {
    switch (cue) {
      case 'whoosh':
        this.playWhoosh();
        break;
      case 'impact_bass':
        this.playImpactBass();
        break;
      case 'pop':
        this.playPop();
        break;
      case 'tension_riser':
        this.playTensionRiser();
        break;
      case 'ding':
        this.playSceneTransitionSound();
        break;
      default:
        this.playWhoosh();
        break;
    }
  }

  // Speak narration using Web Speech API
  speakNarration(
    text: string,
    language: string = 'es',
    rate: number = 1.0,
    onWord?: (charIndex: number, currentWord: string) => void,
    onEnd?: () => void
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    this.stopNarration();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = Math.max(0.7, Math.min(1.6, rate));
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const langCode = language.toLowerCase().startsWith('en') ? 'en' : 'es';
    const matchingVoice =
      voices.find((v) => v.lang.toLowerCase().startsWith(langCode) && v.name.includes('Natural')) ||
      voices.find((v) => v.lang.toLowerCase().startsWith(langCode)) ||
      null;

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    } else {
      utterance.lang = langCode === 'en' ? 'en-US' : 'es-ES';
    }

    if (onWord) {
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const charIndex = event.charIndex;
          const remaining = text.slice(charIndex);
          const word = remaining.split(/\s+/)[0] || '';
          onWord(charIndex, word);
        }
      };
    }

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    this.isSpeaking = true;
    window.speechSynthesis.speak(utterance);
  }

  pauseNarration() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
  }

  resumeNarration() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
  }

  stopNarration() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }
}

export const audioService = new AudioService();
