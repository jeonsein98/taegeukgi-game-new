// Web Audio API Sound Effects for iPad & Touch devices (No external MP3 files needed)

class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public isBgmMuted: boolean = false;
  public isBgmPlaying: boolean = false;

  // BGM Synthesizer Nodes & State
  private bgmMasterGain: GainNode | null = null;
  private bgmFilter: BiquadFilterNode | null = null;
  private bgmTimer: number | null = null;
  private bgmStep: number = 0;
  private nextStepTime: number = 0;
  private isUnlocked: boolean = false;

  constructor() {
    // Setup global user gesture unlock listener for iOS/iPad Safari and Chrome
    if (typeof window !== 'undefined') {
      const unlockHandler = () => {
        this.unlockAudio();
        if (this.isUnlocked) {
          window.removeEventListener('pointerdown', unlockHandler);
          window.removeEventListener('touchstart', unlockHandler);
          window.removeEventListener('click', unlockHandler);
        }
      };
      window.addEventListener('pointerdown', unlockHandler, { passive: true });
      window.addEventListener('touchstart', unlockHandler, { passive: true });
      window.addEventListener('click', unlockHandler, { passive: true });
    }
  }

  public initCtx(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlockAudio() {
    this.initCtx();
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().then(() => {
          this.isUnlocked = true;
          // If BGM was requested, ensure loop is running at current time
          if (this.isBgmPlaying && !this.isBgmMuted && !this.isMuted) {
            this.nextStepTime = (this.ctx?.currentTime || 0) + 0.05;
            this.scheduleBgmLoop();
          }
        }).catch(() => {});
      } else {
        this.isUnlocked = true;
      }
    }
  }

  // =========================================================================
  // RETRO ARCADE BGM SYNTHESIZER (Audible, Catchy, Chiptune Loop)
  // =========================================================================
  public startBgm() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      // Initialize Master Gain & Filter once
      if (!this.bgmMasterGain) {
        this.bgmMasterGain = this.ctx.createGain();
        this.bgmFilter = this.ctx.createBiquadFilter();
        this.bgmFilter.type = 'lowpass';
        this.bgmFilter.frequency.setValueAtTime(3200, this.ctx.currentTime); // Warm 8-bit chiptune filter
        this.bgmMasterGain.connect(this.bgmFilter);
        this.bgmFilter.connect(this.ctx.destination);
      }

      const now = this.ctx.currentTime;
      const targetVolume = this.isBgmMuted || this.isMuted ? 0 : 0.28; // Clear, comfortable arcade volume
      this.bgmMasterGain.gain.cancelScheduledValues(now);
      this.bgmMasterGain.gain.setValueAtTime(targetVolume, now);

      this.isBgmPlaying = true;

      // Always reset next step to current time + 0.05s so it starts immediately
      this.nextStepTime = now + 0.05;

      if (this.bgmTimer) {
        window.clearTimeout(this.bgmTimer);
        this.bgmTimer = null;
      }

      this.scheduleBgmLoop();
    } catch {
      // AudioContext fallback
    }
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      window.clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
    if (this.bgmMasterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.bgmMasterGain.gain.cancelScheduledValues(now);
      this.bgmMasterGain.gain.setValueAtTime(0, now);
    }
  }

  public toggleBgm(): boolean {
    this.unlockAudio();

    if (this.isBgmPlaying && !this.isBgmMuted) {
      // Turn OFF
      this.isBgmMuted = true;
      if (this.bgmMasterGain && this.ctx) {
        const now = this.ctx.currentTime;
        this.bgmMasterGain.gain.cancelScheduledValues(now);
        this.bgmMasterGain.gain.setValueAtTime(0, now);
      }
      return false;
    } else {
      // Turn ON
      this.isBgmMuted = false;
      this.startBgm();
      if (this.bgmMasterGain && this.ctx) {
        const now = this.ctx.currentTime;
        this.bgmMasterGain.gain.cancelScheduledValues(now);
        this.bgmMasterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.28, now);
      }
      return true;
    }
  }

  private scheduleBgmLoop = () => {
    if (!this.isBgmPlaying || !this.ctx || !this.bgmMasterGain) return;

    try {
      const now = this.ctx.currentTime;

      // If context drifted or was suspended while playing, resync to now
      if (this.nextStepTime < now - 0.25) {
        this.nextStepTime = now + 0.02;
      }

      // 138 BPM Upbeat 8-bit Tempo (8th note = 0.2174s)
      const stepDuration = 0.2174;
      const lookahead = 0.20;

      while (this.nextStepTime < now + lookahead) {
        this.playArcadeStep(this.bgmStep, this.nextStepTime, stepDuration);
        this.nextStepTime += stepDuration;
        this.bgmStep = (this.bgmStep + 1) % 32; // 32-step cheerful arcade loop
      }
    } catch {
      // Keep scheduling even if one step had a minor hiccup
    }

    this.bgmTimer = window.setTimeout(this.scheduleBgmLoop, 35);
  };

  private playArcadeStep(step: number, targetTime: number, dur: number) {
    if (!this.ctx || !this.bgmMasterGain || this.isBgmMuted || this.isMuted) return;

    try {
      // WebKit safety: time must always be in the future relative to currentTime
      const now = this.ctx.currentTime;
      const time = Math.max(targetTime, now + 0.005);

      // Cheerful Korean Flag Arcade Melody (Pentatonic & Major 8-bit)
      // 32-step upbeat melody:
      // Bar 1: Do-Mi-Sol-HighDo | La-Sol-Mi-Re
      // Bar 2: Do-Re-Mi-Sol | La-Ti-HighDo-Rest
      // Bar 3: Sol-Mi-Do-Mi | Fa-La-Sol-Mi
      // Bar 4: Re-Mi-Fa-Re | Do-Mi-Do-Rest
      const melodySeq: number[] = [
        523.25, 659.25, 783.99, 1046.5, 880.00, 783.99, 659.25, 587.33,
        523.25, 587.33, 659.25, 783.99, 880.00, 987.77, 1046.5, 0,
        783.99, 659.25, 523.25, 659.25, 698.46, 880.00, 783.99, 659.25,
        587.33, 659.25, 698.46, 587.33, 523.25, 659.25, 523.25, 0,
      ];

      // Bouncy Walking 8-bit Bass
      const bassSeq: number[] = [
        130.81, 196.00, 130.81, 261.63, 174.61, 220.00, 130.81, 196.00,
        130.81, 146.83, 164.81, 196.00, 174.61, 196.00, 130.81, 196.00,
        196.00, 164.81, 130.81, 164.81, 174.61, 220.00, 196.00, 164.81,
        146.83, 164.81, 174.61, 146.83, 130.81, 196.00, 130.81, 196.00,
      ];

      const melodyFreq = melodySeq[step];
      const bassFreq = bassSeq[step];

      // 1. Lead Melody Voice (Crisp Square Wave with snappy decay)
      if (melodyFreq > 0) {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(melodyFreq, time);

        const noteLen = dur * 0.72;
        noteGain.gain.setValueAtTime(0.18, time);
        noteGain.gain.linearRampToValueAtTime(0.005, time + noteLen);

        osc.connect(noteGain);
        noteGain.connect(this.bgmMasterGain);

        osc.start(time);
        osc.stop(time + noteLen + 0.02);
      }

      // 2. Punchy Bouncy Bass Voice (Triangle wave)
      if (bassFreq > 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();

        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(bassFreq, time);

        const bassLen = dur * 0.82;
        bassGain.gain.setValueAtTime(0.25, time);
        bassGain.gain.linearRampToValueAtTime(0.005, time + bassLen);

        bassOsc.connect(bassGain);
        bassGain.connect(this.bgmMasterGain);

        bassOsc.start(time);
        bassOsc.stop(time + bassLen + 0.02);
      }

      // 3. Arcade Percussion (Crisp 8-bit drum beats on 2 & 4)
      if (step % 2 === 0) {
        const percOsc = this.ctx.createOscillator();
        const percGain = this.ctx.createGain();

        percOsc.type = 'sawtooth';
        // Hi-hat tick on beat 1/3, Snare pop on beat 2/4
        const isSnare = step % 4 === 2;
        percOsc.frequency.setValueAtTime(isSnare ? 600 : 1800, time);
        percOsc.frequency.linearRampToValueAtTime(80, time + 0.04);

        const pVol = isSnare ? 0.08 : 0.04;
        percGain.gain.setValueAtTime(pVol, time);
        percGain.gain.linearRampToValueAtTime(0.001, time + 0.04);

        percOsc.connect(percGain);
        percGain.connect(this.bgmMasterGain);

        percOsc.start(time);
        percOsc.stop(time + 0.05);
      }
    } catch {
      // Ignore individual step scheduling errors
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
