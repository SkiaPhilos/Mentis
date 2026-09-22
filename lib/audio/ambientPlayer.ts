/**
 * Scholarly Ambient Soundscape Synthesizer
 *
 * Implements infinite, artifact-free, network-independent acoustic atmospheres
 * using pure Web Audio API synthesis.
 */

export type SoundscapeId =
  | 'cloister-rain'
  | 'scriptorium-lute'
  | 'fireplace-hearth'
  | 'library-clock'
  | 'nocturnal-archive';

export interface SoundscapeMetadata {
  id: SoundscapeId;
  name: string;
  latinName: string;
  description: string;
  archetype: string;
}

export const SCHOLARLY_SOUNDSCAPES: SoundscapeMetadata[] = [
  {
    id: 'cloister-rain',
    name: 'Rain on Cloister Glass',
    latinName: 'Pluvia Super Vitrum Claustri',
    description: 'Gentle rainfall cascading across leaded stained glass in the cloister quadrangle.',
    archetype: 'Deep Contemplation & Writing',
  },
  {
    id: 'scriptorium-lute',
    name: 'Scriptorium Lute',
    latinName: 'Testudo Scriptorii',
    description: 'Contemplative modal plucked lute arpeggios echoing in the high vaulted scriptorium.',
    archetype: 'Manuscript Inscription & Focus',
  },
  {
    id: 'fireplace-hearth',
    name: 'Fireplace Hearth',
    latinName: 'Focus et Cinis',
    description: 'Warm cedar timber crackles and glowing embers in the great stone fireplace.',
    archetype: 'Nocturnal Solitude & Reading',
  },
  {
    id: 'library-clock',
    name: 'Library Pendulum Clock',
    latinName: 'Horologium Bibliothecae',
    description: 'Rhythmic, unhurried brass pendulum ticking marking scholarly vigilance at 60 bpm.',
    archetype: 'Methodical Research & Problem Solving',
  },
  {
    id: 'nocturnal-archive',
    name: 'Nocturnal Archive',
    latinName: 'Archivum Nocturnum',
    description: 'Quiet nocturnal breeze outside arched mullions with distant solfeggio drone and soft crickets.',
    archetype: 'Late-Night Vigil & Thesis Composition',
  },
];

export interface AmbientState {
  isPlaying: boolean;
  currentSoundscape: SoundscapeId;
  volume: number; // 0.0 to 1.0
  sleepTimerMinutes: number; // 0 = off, 15, 30, 45, 60
  sleepTimerRemainingSeconds: number;
}

type AmbientListener = (state: AmbientState) => void;

class AmbientPlayerEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private currentSoundscape: SoundscapeId = 'cloister-rain';
  private volume = 0.5;
  private sleepTimerMinutes = 0;
  private sleepTimerRemainingSeconds = 0;
  private sleepInterval: NodeJS.Timeout | null = null;
  private activeGenerators: { stop: () => void }[] = [];
  private listeners = new Set<AmbientListener>();

  constructor() {
    // Restore saved preferences if in browser
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('mentis_ambient_settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.currentSoundscape && SCHOLARLY_SOUNDSCAPES.some((s) => s.id === parsed.currentSoundscape)) {
            this.currentSoundscape = parsed.currentSoundscape;
          }
          if (typeof parsed.volume === 'number') {
            this.volume = Math.max(0, Math.min(1, parsed.volume));
          }
        }
      } catch {
        // Ignore storage parse issues
      }
    }
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private savePreferences() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        'mentis_ambient_settings',
        JSON.stringify({
          currentSoundscape: this.currentSoundscape,
          volume: this.volume,
        })
      );
    } catch {
      // Ignore
    }
  }

  public getState(): AmbientState {
    return {
      isPlaying: this.isPlaying,
      currentSoundscape: this.currentSoundscape,
      volume: this.volume,
      sleepTimerMinutes: this.sleepTimerMinutes,
      sleepTimerRemainingSeconds: this.sleepTimerRemainingSeconds,
    };
  }

  public subscribe(listener: AmbientListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((l) => l(state));
  }

  public async play(): Promise<void> {
    const ctx = this.initContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    if (this.isPlaying) return;

    this.isPlaying = true;
    this.startSoundscape(this.currentSoundscape);
    this.startSleepTimerCountdown();
    this.notify();
  }

  public stop(): void {
    if (!this.isPlaying) return;

    this.stopActiveGenerators();
    this.isPlaying = false;
    this.clearSleepTimer();
    this.notify();
  }

  public toggle(): void {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play();
    }
  }

  public setSoundscape(id: SoundscapeId): void {
    if (this.currentSoundscape === id) return;
    this.currentSoundscape = id;
    this.savePreferences();

    if (this.isPlaying) {
      // Cross-fade to new soundscape
      this.stopActiveGenerators();
      this.startSoundscape(id);
    }
    this.notify();
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
    this.savePreferences();
    this.notify();
  }

  public setSleepTimer(minutes: number): void {
    this.sleepTimerMinutes = minutes;
    if (minutes > 0) {
      this.sleepTimerRemainingSeconds = minutes * 60;
      if (this.isPlaying) {
        this.startSleepTimerCountdown();
      }
    } else {
      this.clearSleepTimer();
    }
    this.notify();
  }

  private startSleepTimerCountdown() {
    if (this.sleepInterval) clearInterval(this.sleepInterval);
    if (this.sleepTimerMinutes <= 0) return;

    if (this.sleepTimerRemainingSeconds <= 0) {
      this.sleepTimerRemainingSeconds = this.sleepTimerMinutes * 60;
    }

    this.sleepInterval = setInterval(() => {
      if (this.sleepTimerRemainingSeconds > 0) {
        this.sleepTimerRemainingSeconds--;
        if (this.sleepTimerRemainingSeconds <= 0) {
          this.handleSleepTimerExpired();
        }
        this.notify();
      }
    }, 1000);
  }

  private clearSleepTimer() {
    if (this.sleepInterval) {
      clearInterval(this.sleepInterval);
      this.sleepInterval = null;
    }
    this.sleepTimerRemainingSeconds = 0;
  }

  private handleSleepTimerExpired() {
    // Gentle 5s fade out
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 2.5);
    }
    setTimeout(() => {
      this.stop();
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      }
    }, 5000);
  }

  private stopActiveGenerators() {
    this.activeGenerators.forEach((g) => {
      try {
        g.stop();
      } catch {
        // Ignore stop error
      }
    });
    this.activeGenerators = [];
  }

  private startSoundscape(id: SoundscapeId) {
    const ctx = this.ctx;
    const master = this.masterGain;
    if (!ctx || !master) return;

    switch (id) {
      case 'cloister-rain':
        this.activeGenerators.push(this.createCloisterRain(ctx, master));
        break;
      case 'scriptorium-lute':
        this.activeGenerators.push(this.createScriptoriumLute(ctx, master));
        break;
      case 'fireplace-hearth':
        this.activeGenerators.push(this.createFireplaceHearth(ctx, master));
        break;
      case 'library-clock':
        this.activeGenerators.push(this.createLibraryClock(ctx, master));
        break;
      case 'nocturnal-archive':
        this.activeGenerators.push(this.createNocturnalArchive(ctx, master));
        break;
    }
  }

  /**
   * Soundscape 1: Cloister Rain (Continuous pink rainfall + soft droplet impulses)
   */
  private createCloisterRain(ctx: AudioContext, destination: GainNode) {
    const localGain = ctx.createGain();
    localGain.gain.setValueAtTime(0.001, ctx.currentTime);
    localGain.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 1.2);
    localGain.connect(destination);

    // Continuous pink noise buffer
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
      b6 = white * 0.115926;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Filter shaping rain tone
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(950, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(localGain);
    noiseSource.start();

    // Random droplet impulses
    let isRunning = true;
    const dropletInterval = setInterval(() => {
      if (!isRunning || ctx.state === 'closed') return;
      if (Math.random() > 0.45) {
        const dropOsc = ctx.createOscillator();
        const dropGain = ctx.createGain();
        const now = ctx.currentTime;
        const freq = 1400 + Math.random() * 1200;
        dropOsc.type = 'sine';
        dropOsc.frequency.setValueAtTime(freq, now);
        dropOsc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + 0.06);

        dropGain.gain.setValueAtTime(0.001, now);
        dropGain.gain.linearRampToValueAtTime(0.04 * Math.random(), now + 0.005);
        dropGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

        dropOsc.connect(dropGain);
        dropGain.connect(localGain);
        dropOsc.start(now);
        dropOsc.stop(now + 0.06);
      }
    }, 180);

    return {
      stop: () => {
        isRunning = false;
        clearInterval(dropletInterval);
        localGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.5);
        setTimeout(() => {
          try {
            noiseSource.stop();
            noiseSource.disconnect();
            localGain.disconnect();
          } catch {
            // Ignore
          }
        }, 600);
      },
    };
  }

  /**
   * Soundscape 2: Scriptorium Lute (Renaissance D Dorian / A Minor acoustic arpeggios)
   */
  private createScriptoriumLute(ctx: AudioContext, destination: GainNode) {
    const localGain = ctx.createGain();
    localGain.gain.setValueAtTime(0.001, ctx.currentTime);
    localGain.gain.linearRampToValueAtTime(0.85, ctx.currentTime + 1.5);
    localGain.connect(destination);

    // Chords in D Dorian & A Aeolian (frequencies in Hz)
    const chords: number[][] = [
      [146.83, 220.0, 293.66, 349.23, 440.0], // D3, A3, D4, F4, A4 (Dm)
      [130.81, 196.0, 261.63, 329.63, 392.0], // C3, G3, C4, E4, G4 (C)
      [174.61, 220.0, 261.63, 349.23, 440.0], // F3, A3, C4, F4, A4 (F)
      [110.0, 164.81, 220.0, 261.63, 329.63], // A2, E3, A3, C4, E4 (Am)
      [196.0, 246.94, 293.66, 392.0, 493.88], // G3, B3, D4, G4, B4 (G)
      [146.83, 220.0, 329.63, 349.23, 440.0], // D3, A3, E4, F4, A4 (Dsus2/Dm)
    ];

    let chordIdx = 0;
    let noteIdx = 0;
    let isRunning = true;

    const playPluckedNote = (freq: number) => {
      if (!isRunning || ctx.state === 'closed') return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const overtone = ctx.createOscillator();
      const noteGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(freq * 2, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 3.5, now);
      filter.frequency.exponentialRampToValueAtTime(freq * 1.1, now + 1.2);

      const decayTime = 1.4 + Math.random() * 0.4;
      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(0.12, now + 0.015);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + decayTime);

      osc.connect(filter);
      overtone.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(localGain);

      osc.start(now);
      overtone.start(now);
      osc.stop(now + decayTime);
      overtone.stop(now + decayTime);
    };

    const scheduleNext = () => {
      if (!isRunning) return;
      const activeChord = chords[chordIdx];
      const freq = activeChord[noteIdx];
      playPluckedNote(freq);

      noteIdx++;
      if (noteIdx >= activeChord.length) {
        noteIdx = 0;
        chordIdx = (chordIdx + 1) % chords.length;
        // Pause slightly between chord changes
        setTimeout(scheduleNext, 900 + Math.random() * 400);
      } else {
        setTimeout(scheduleNext, 450 + Math.random() * 200);
      }
    };

    scheduleNext();

    return {
      stop: () => {
        isRunning = false;
        localGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.6);
        setTimeout(() => {
          try {
            localGain.disconnect();
          } catch {
            // Ignore
          }
        }, 700);
      },
    };
  }

  /**
   * Soundscape 3: Fireplace Hearth (Warm low-frequency timber roar + cedar crackles)
   */
  private createFireplaceHearth(ctx: AudioContext, destination: GainNode) {
    const localGain = ctx.createGain();
    localGain.gain.setValueAtTime(0.001, ctx.currentTime);
    localGain.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 1.2);
    localGain.connect(destination);

    // Warm low-frequency roar
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (last + 0.02 * white) / 1.02;
      last = data[i];
      data[i] *= 2.8;
    }

    const rumble = ctx.createBufferSource();
    rumble.buffer = noiseBuffer;
    rumble.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(240, ctx.currentTime);

    rumble.connect(lowpass);
    lowpass.connect(localGain);
    rumble.start();

    // Wood crackle bursts
    let isRunning = true;
    const crackleInterval = setInterval(() => {
      if (!isRunning || ctx.state === 'closed') return;
      if (Math.random() > 0.3) {
        const now = ctx.currentTime;
        const dur = 0.015 + Math.random() * 0.035;
        const crackBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
        const crackData = crackBuffer.getChannelData(0);
        for (let i = 0; i < crackData.length; i++) {
          crackData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.005));
        }

        const crackNode = ctx.createBufferSource();
        crackNode.buffer = crackBuffer;

        const crackFilter = ctx.createBiquadFilter();
        crackFilter.type = 'highpass';
        crackFilter.frequency.setValueAtTime(1600 + Math.random() * 1500, now);

        const crackGain = ctx.createGain();
        crackGain.gain.setValueAtTime(0.08 + Math.random() * 0.14, now);
        crackGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

        crackNode.connect(crackFilter);
        crackFilter.connect(crackGain);
        crackGain.connect(localGain);

        crackNode.start(now);
      }
    }, 220);

    return {
      stop: () => {
        isRunning = false;
        clearInterval(crackleInterval);
        localGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.5);
        setTimeout(() => {
          try {
            rumble.stop();
            rumble.disconnect();
            localGain.disconnect();
          } catch {
            // Ignore
          }
        }, 600);
      },
    };
  }

  /**
   * Soundscape 4: Library Clock (60 BPM brass mechanical pendulum escapement)
   */
  private createLibraryClock(ctx: AudioContext, destination: GainNode) {
    const localGain = ctx.createGain();
    localGain.gain.setValueAtTime(0.001, ctx.currentTime);
    localGain.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 1.0);
    localGain.connect(destination);

    let isTick = true;
    let isRunning = true;

    // Room ambience (quiet air hall resonance)
    const airBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const airData = airBuffer.getChannelData(0);
    for (let i = 0; i < airData.length; i++) {
      airData[i] = (Math.random() * 2 - 1) * 0.015;
    }
    const airSource = ctx.createBufferSource();
    airSource.buffer = airBuffer;
    airSource.loop = true;
    const airFilter = ctx.createBiquadFilter();
    airFilter.type = 'bandpass';
    airFilter.frequency.setValueAtTime(450, ctx.currentTime);
    airSource.connect(airFilter);
    airFilter.connect(localGain);
    airSource.start();

    // 1 tick per second (60 BPM)
    const clockInterval = setInterval(() => {
      if (!isRunning || ctx.state === 'closed') return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Tick = 1180 Hz, Tock = 920 Hz
      const freq = isTick ? 1180 : 920;
      isTick = !isTick;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.45, now + 0.035);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq, now);
      filter.Q.setValueAtTime(4.5, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(localGain);

      osc.start(now);
      osc.stop(now + 0.045);
    }, 1000);

    return {
      stop: () => {
        isRunning = false;
        clearInterval(clockInterval);
        localGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.5);
        setTimeout(() => {
          try {
            airSource.stop();
            airSource.disconnect();
            localGain.disconnect();
          } catch {
            // Ignore
          }
        }, 600);
      },
    };
  }

  /**
   * Soundscape 5: Nocturnal Archive (Nocturnal breeze, soft crickets & Solfeggio 198Hz drone)
   */
  private createNocturnalArchive(ctx: AudioContext, destination: GainNode) {
    const localGain = ctx.createGain();
    localGain.gain.setValueAtTime(0.001, ctx.currentTime);
    localGain.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 1.2);
    localGain.connect(destination);

    // Solfeggio / Om deep resonant drone (198 Hz fundamental)
    const droneOsc = ctx.createOscillator();
    const droneGain = ctx.createGain();
    droneOsc.type = 'sine';
    droneOsc.frequency.setValueAtTime(198, ctx.currentTime);
    droneGain.gain.setValueAtTime(0.06, ctx.currentTime);
    droneOsc.connect(droneGain);
    droneGain.connect(localGain);
    droneOsc.start();

    // Soft nocturnal wind
    const bufferSize = ctx.sampleRate * 2;
    const windBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const windData = windBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      windData[i] = (Math.random() * 2 - 1) * 0.04;
    }
    const windSource = ctx.createBufferSource();
    windSource.buffer = windBuffer;
    windSource.loop = true;
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.setValueAtTime(320, ctx.currentTime);
    windSource.connect(windFilter);
    windFilter.connect(localGain);
    windSource.start();

    // Gentle distant crickets
    let isRunning = true;
    const cricketInterval = setInterval(() => {
      if (!isRunning || ctx.state === 'closed') return;
      if (Math.random() > 0.4) {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(4600 + Math.random() * 300, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.02, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

        osc.connect(gain);
        gain.connect(localGain);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    }, 450);

    return {
      stop: () => {
        isRunning = false;
        clearInterval(cricketInterval);
        localGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.5);
        setTimeout(() => {
          try {
            droneOsc.stop();
            droneOsc.disconnect();
            windSource.stop();
            windSource.disconnect();
            localGain.disconnect();
          } catch {
            // Ignore
          }
        }, 600);
      },
    };
  }
}

// Global singleton instance
export const scholarlyAmbientEngine = new AmbientPlayerEngine();
