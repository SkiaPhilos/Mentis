/**
 * Scholarly Tactile Sound Effects Engine
 *
 * Synthesizes tactile, organic acoustic feedback for the Mentis scholar
 * experience using the native Web Audio API. Requires zero external audio assets.
 */

let audioCtx: AudioContext | null = null;
let isMuted = false;
let sfxVolume = 0.6;

// Check localStorage preferences on initialization
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('mentis_sfx_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed.isMuted === 'boolean') isMuted = parsed.isMuted;
      if (typeof parsed.volume === 'number') sfxVolume = Math.max(0, Math.min(1, parsed.volume));
    }
  } catch {
    // Ignore storage parse issues
  }
}

function saveSfxSettings() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      'mentis_sfx_settings',
      JSON.stringify({ isMuted, volume: sfxVolume })
    );
  } catch {
    // Ignore storage issues
  }
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isSfxMuted(): boolean {
  return isMuted;
}

export function setSfxMuted(muted: boolean): void {
  isMuted = muted;
  saveSfxSettings();
  notifySfxListeners();
}

export function getSfxVolume(): number {
  return sfxVolume;
}

export function setSfxVolume(vol: number): void {
  sfxVolume = Math.max(0, Math.min(1, vol));
  saveSfxSettings();
  notifySfxListeners();
}

type SfxListener = (settings: { isMuted: boolean; volume: number }) => void;
const listeners = new Set<SfxListener>();

export function subscribeSfx(listener: SfxListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifySfxListeners() {
  listeners.forEach((l) => l({ isMuted, volume: sfxVolume }));
}

/**
 * 1. Tactile Parchment Rustle (Paper friction & folio turn)
 */
export function playParchmentRustle(): void {
  if (isMuted || sfxVolume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const duration = 0.12;
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Generate shaped colored noise
  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + 0.04 * white) / 1.04;
    lastOut = data[i];
    data[i] *= 3.5; // boost
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1200, now);
  filter.frequency.exponentialRampToValueAtTime(700, now + duration);
  filter.Q.setValueAtTime(2.2, now);

  const gain = ctx.createGain();
  const effectiveVol = 0.22 * sfxVolume;
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(effectiveVol, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
}

/**
 * 2. Delicate Quill Scratch (Ink on paper stroke)
 */
export function playQuillScratch(): void {
  if (isMuted || sfxVolume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const duration = 0.07;
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // High-frequency friction burst
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(2800, now);
  filter.Q.setValueAtTime(3.0, now);

  const gain = ctx.createGain();
  const effectiveVol = 0.15 * sfxVolume;
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(effectiveVol, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
}

/**
 * 3. Wax Seal Stamp (Physical signet ring compression thud & seal seal)
 */
export function playWaxSealStamp(): void {
  if (isMuted || sfxVolume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Deep low-end compression thud
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(110, now);
  osc.frequency.exponentialRampToValueAtTime(35, now + 0.18);

  const effectiveVol = 0.45 * sfxVolume;
  oscGain.gain.setValueAtTime(0.001, now);
  oscGain.gain.linearRampToValueAtTime(effectiveVol, now + 0.02);
  oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

  osc.connect(oscGain);
  oscGain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.22);

  // High-frequency wax crunch transient
  const bufferSize = Math.floor(ctx.sampleRate * 0.06);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.015));
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.setValueAtTime(1800, now);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.18 * sfxVolume, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);

  noise.start(now);
}

/**
 * 4. Resonant Brass Bell Chime (Academic victory, vigil completion, achievement)
 */
export function playBrassBellChime(): void {
  if (isMuted || sfxVolume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Golden harmonic series centered on Solfeggio 528Hz (Transformation & Clarity)
  const partials = [
    { freq: 528, gain: 0.3 * sfxVolume, decay: 2.8 },
    { freq: 1056, gain: 0.16 * sfxVolume, decay: 2.2 },
    { freq: 1584, gain: 0.09 * sfxVolume, decay: 1.5 },
    { freq: 2640, gain: 0.04 * sfxVolume, decay: 1.0 },
  ];

  partials.forEach(({ freq, gain, decay }) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.exponentialRampToValueAtTime(gain, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decay);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + decay);
  });
}

/**
 * 5. Gentle Wood / Key Click (Button tactile feedback)
 */
export function playClickTactile(): void {
  if (isMuted || sfxVolume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(650, now);
  osc.frequency.exponentialRampToValueAtTime(220, now + 0.025);

  const effectiveVol = 0.12 * sfxVolume;
  gain.gain.setValueAtTime(effectiveVol, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.025);
}
