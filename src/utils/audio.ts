// Web Audio API Sound Effects for iPad & Touch devices (No external MP3 files needed)

class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Soft cheerful pop when tapping or selecting a piece
  playSelect() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // AudioContext policy fallback
    }
  }

  // Ascending musical chime when a piece snaps into the correct slot
  playSnap() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteTime = now + i * 0.07;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.25, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.19);
      });
    } catch {
      // AudioContext policy fallback
    }
  }

  // Gentle bouncy boing when placed on wrong slot
  playWrong() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.18);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.23);
    } catch {
      // AudioContext policy fallback
    }
  }

  // Celebratory fanfare when all 6 pieces are completed
  playFanfare() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const melody = [
        { f: 523.25, d: 0.15 }, // C5
        { f: 659.25, d: 0.15 }, // E5
        { f: 783.99, d: 0.15 }, // G5
        { f: 1046.5, d: 0.4 },  // C6
        { f: 880.0,  d: 0.15 }, // A5
        { f: 1046.5, d: 0.6 }   // C6 long
      ];

      let accumulatedTime = now;
      melody.forEach(item => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(item.f, accumulatedTime);

        gain.gain.setValueAtTime(0.3, accumulatedTime);
        gain.gain.exponentialRampToValueAtTime(0.001, accumulatedTime + item.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(accumulatedTime);
        osc.stop(accumulatedTime + item.d + 0.05);

        accumulatedTime += item.d;
      });
    } catch {
      // AudioContext policy fallback
    }
  }

  // Cheerful rhythmic clapping / applause sound for kids celebration
  playApplause() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Generate rhythmic clapping bursts (짝-짝-짝짝짝!)
      const clapTimings = [0.05, 0.25, 0.45, 0.60, 0.72, 0.85, 1.0, 1.12, 1.25, 1.4];

      clapTimings.forEach((offset, idx) => {
        if (!this.ctx) return;
        const clapTime = now + offset;
        
        // Use noise-like short bursts with bandpass filter
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = idx % 2 === 0 ? 'triangle' : 'square';
        osc.frequency.setValueAtTime(180 + Math.random() * 60, clapTime);
        osc.frequency.exponentialRampToValueAtTime(80, clapTime + 0.05);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800 + Math.random() * 300, clapTime);
        filter.Q.setValueAtTime(3, clapTime);

        gain.gain.setValueAtTime(0.22, clapTime);
        gain.gain.exponentialRampToValueAtTime(0.001, clapTime + 0.06);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(clapTime);
        osc.stop(clapTime + 0.07);
      });
    } catch {
      // AudioContext fallback
    }
  }

  // OX quiz correct
  playQuizCorrect() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [880, 1174.66].forEach((f, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.1);
        gain.gain.setValueAtTime(0.25, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.25);
      });
    } catch {}
  }

  // Arcade high-score fanfare (classic 8-bit retro arpeggio)
  playArcadeRank() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Fast ascending retro arpeggio: C5 -> E5 -> G5 -> C6 -> E6 -> G6 -> C7
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093.0];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = now + idx * 0.08;

        osc.type = idx === notes.length - 1 ? 'triangle' : 'square';
        osc.frequency.setValueAtTime(freq, t);

        const dur = idx === notes.length - 1 ? 0.45 : 0.07;
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + dur + 0.02);
      });
    } catch {}
  }
}

export const sounds = new SoundEngine();
