/**
 * The mountain's sound — WebAudio only, no files. Off unless the visitor turns
 * it on (and then remembered). Filtered noise for the wind, its volume and
 * brightness rising with altitude; silence in the basin; a soft low tone at
 * the summit. Created on the first tap that turns it on (browsers refuse audio
 * before a gesture).
 */

const ss = (a, b, v) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function createSound() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  const ctx = new AC();

  // two seconds of pink-ish noise, looped
  const len = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.997 * b0 + w * 0.029;
    b1 = 0.985 * b1 + w * 0.032;
    b2 = 0.95 * b2 + w * 0.048;
    d[i] = (b0 + b1 + b2 + w * 0.02) * 0.9;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  noise.loop = true;
  const band = ctx.createBiquadFilter();
  band.type = "lowpass";
  band.frequency.value = 400;
  band.Q.value = 0.7;
  const gust = ctx.createOscillator();
  gust.frequency.value = 0.13;
  const gustGain = ctx.createGain();
  gustGain.gain.value = 120;
  gust.connect(gustGain).connect(band.frequency);
  const wind = ctx.createGain();
  wind.gain.value = 0;
  noise.connect(band).connect(wind);

  // the summit: a quiet open fifth, slowly breathing
  const toneGain = ctx.createGain();
  toneGain.gain.value = 0;
  const oscs = [110, 164.8, 220].map((f, i) => {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.value = [0.5, 0.3, 0.16][i];
    o.connect(g).connect(toneGain);
    return o;
  });

  const master = ctx.createGain();
  master.gain.value = 0;
  wind.connect(master);
  toneGain.connect(master);
  master.connect(ctx.destination);
  noise.start();
  gust.start();
  oscs.forEach((o) => o.start());

  let on = false;
  const set = (param, v) => param.setTargetAtTime(v, ctx.currentTime, 0.35);

  return {
    setOn(v) {
      on = v;
      if (v && ctx.state === "suspended") ctx.resume();
      set(master.gain, v ? 0.9 : 0);
    },
    update(p) {
      if (!on) return;
      const alt = Math.min(1, p / 5);
      const basin = ss(2.05, 2.3, p) * (1 - ss(2.7, 2.95, p));
      const summit = ss(4.9, 5.4, p);
      set(wind.gain, (0.05 + alt * 0.22) * (1 - basin) * (1 - summit * 0.75));
      set(band.frequency, 300 + alt * 1100);
      set(toneGain.gain, summit * 0.06);
    },
    dispose() {
      try {
        noise.stop();
        gust.stop();
        oscs.forEach((o) => o.stop());
      } catch {
        /* already stopped */
      }
      ctx.close();
    },
  };
}
