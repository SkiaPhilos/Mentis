/**
 * Scholarly Acoustic Engine (Web Audio API Synthesizer)
 *
 * Generates tactile academic acoustic tones natively without external network dependencies.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Majestic Cathedral Bell / Astrolabe Chime for Vigil Completion
 */
export function playCathedralChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const harmonics = [
    { freq: 432, gain: 0.35, decay: 3.5 },
    { freq: 864, gain: 0.18, decay: 2.8 },
    { freq: 1296, gain: 0.08, decay: 1.8 },
    { freq: 216, gain: 0.22, decay: 4.2 },
  ];

  harmonics.forEach(({ freq, gain, decay }) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.exponentialRampToValueAtTime(gain, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decay);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + decay);
  });
}

/**
 * Meditative Tibetan Singing Bowl for Vigil Initiation
 */
export function playSingingBowl(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const fundamental = 396; // Solfeggio frequency for liberating guilt and fear / grounded focus

  const osc = ctx.createOscillator();
  const subOsc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(fundamental, now);

  subOsc.type = 'triangle';
  subOsc.frequency.setValueAtTime(fundamental * 2, now);

  gainNode.gain.setValueAtTime(0.001, now);
  gainNode.gain.exponentialRampToValueAtTime(0.2, now + 0.1);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

  osc.connect(gainNode);
  subOsc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);
  subOsc.start(now);
  osc.stop(now + 2.5);
  subOsc.stop(now + 2.5);
}

/**
 * Tactile Page Turn or Quill Stroke
 */
export function playPageTurnSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // White noise burst shaped by bandpass filter
  const bufferSize = ctx.sampleRate * 0.08; // 80ms
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1400, now);
  filter.Q.setValueAtTime(1.5, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
}

/**
 * Tactile Ink/Wax Seal Click
 */
export function playClickTactile(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.03);
}

/**
 * Gentle Parchment Rustle
 */
export function playParchmentRustle(): void {
  playPageTurnSound();
}

