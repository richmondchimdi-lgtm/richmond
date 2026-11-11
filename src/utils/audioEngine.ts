/**
 * Synthesized Web Audio Engine for VYRO
 * Generates background music loops and UI sound effects without external audio assets.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private currentMusicNode: { stop: () => void } | null = null;
  private currentTrack: string | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopMusic();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.isMuted) {
      this.stopMusic();
    }
  }

  // Play a quick like "pop" sound
  public playLikeSound() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.13);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Snap sent whoosh sound
  public playWhoosh() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch {}
  }

  // Streak fire ignite sound
  public playStreakIgnite() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.06 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + i * 0.06);
        osc.stop(this.ctx.currentTime + i * 0.06 + 0.35);
      });
    } catch {}
  }

  // Gift fanfare explosion
  public playGiftFanfare() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.07);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.07 + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.07);
        osc.stop(this.ctx.currentTime + idx * 0.07 + 0.45);
      });
    } catch {}
  }

  // Synthesize ambient music loop matching video sound tag
  public playMusicTrack(trackName: string) {
    if (this.isMuted) return;
    if (this.currentTrack === trackName && this.currentMusicNode) return;
    this.stopMusic();

    try {
      this.initCtx();
      if (!this.ctx) return;
      this.currentTrack = trackName;

      // Create an ambient pulsing bass/chord loop
      const bpm = 120;
      const interval = 60 / bpm;
      let step = 0;
      let active = true;

      const chords = [
        [220, 261.63, 329.63], // Am
        [174.61, 220, 261.63], // F
        [130.81, 164.81, 196.0], // C
        [196.0, 246.94, 293.66], // G
      ];

      const playChord = () => {
        if (!active || !this.ctx || this.isMuted) return;
        const chord = chords[step % chords.length];
        step++;

        chord.forEach((freq) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, this.ctx.currentTime);

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
          gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + interval * 1.8);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start();
          osc.stop(this.ctx.currentTime + interval * 2);
        });

        // Add subtle sub-bass kick
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.frequency.setValueAtTime(110, this.ctx.currentTime);
        kickOsc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.12);
        kickGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        kickGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
        kickOsc.connect(kickGain);
        kickGain.connect(this.ctx.destination);
        kickOsc.start();
        kickOsc.stop(this.ctx.currentTime + 0.2);
      };

      playChord();
      const timer = setInterval(playChord, interval * 1000 * 2);

      this.currentMusicNode = {
        stop: () => {
          active = false;
          clearInterval(timer);
        },
      };
    } catch {}
  }

  public stopMusic() {
    if (this.currentMusicNode) {
      this.currentMusicNode.stop();
      this.currentMusicNode = null;
    }
    this.currentTrack = null;
  }
}

export const audioEngine = new AudioEngine();
