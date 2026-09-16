"use client";

/**
 * Switch click, synthesised.
 *
 * A short filtered noise burst plus a body thump — close enough to a tactile
 * switch, and it keeps the project free of audio assets. The context is created
 * on the first click *after* the visitor turns sound on, which is also what
 * browser autoplay policies require.
 */
let context: AudioContext | null = null;

const audioContext = () => {
  if (typeof window === "undefined") return null;
  if (!context) {
    const Ctor = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
  }
  if (context.state === "suspended") void context.resume();
  return context;
};

const noiseBuffer = (ctx: AudioContext) => {
  const length = Math.floor(ctx.sampleRate * 0.05);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    // Decaying white noise: loud at the moment of contact, gone in ~25 ms.
    data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3;
  }
  return buffer;
};

/**
 * @param release `true` for the quieter, higher click of a key coming back up.
 */
export const playClick = (release = false) => {
  const ctx = audioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(release ? 0.055 : 0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
  gain.connect(ctx.destination);

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = release ? 3200 : 2100;
  filter.Q.value = 0.9;
  filter.connect(gain);

  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer(ctx);
  source.connect(filter);
  source.start(now);

  if (!release) {
    // Low thump of the stem hitting the housing.
    const thump = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    thump.frequency.setValueAtTime(190, now);
    thump.frequency.exponentialRampToValueAtTime(90, now + 0.05);
    thumpGain.gain.setValueAtTime(0.07, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    thump.connect(thumpGain);
    thumpGain.connect(ctx.destination);
    thump.start(now);
    thump.stop(now + 0.06);
  }

  source.stop(now + 0.07);
};
