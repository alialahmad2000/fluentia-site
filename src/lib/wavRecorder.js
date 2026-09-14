/**
 * wavRecorder — record one short sentence as 16 kHz mono PCM WAV.
 *
 * Why WAV and not MediaRecorder: iPhone Safari's MediaRecorder output (mp4/AAC)
 * has almost no track record through Whisper on this project, while every one of
 * the ~9,600 speaking clips the LMS transcribed in the last 180 days was WAV.
 * 15 s of 16 kHz mono ≈ 480 KB — small enough to upload on mobile data.
 *
 * iOS rules this follows: the AudioContext is created synchronously inside the
 * tap (before any await), mic tracks are stopped when done so the red recording
 * indicator goes away, and nothing here runs at import time (SSR-safe).
 */

const TARGET_RATE = 16000;

/**
 * Start recording. Must be called from a user gesture.
 * @param {{ onLevel?: (level: number) => void, maxMs?: number, onAutoStop?: () => void }} opts
 * @returns {Promise<{ stop: () => Promise<{ blob: Blob, seconds: number }>, cancel: () => void }>}
 */
export async function startWavRecording({ onLevel, maxMs = 15000, onAutoStop } = {}) {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx || !navigator.mediaDevices?.getUserMedia) {
    const err = new Error("unsupported");
    err.name = "NotSupportedError";
    throw err;
  }
  const ctx = new Ctx(); // synchronously, inside the gesture
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
  } catch (e) {
    ctx.close?.();
    throw e;
  }
  if (ctx.state === "suspended") await ctx.resume();

  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 512;
  // ScriptProcessor is deprecated but is the one capture node every target
  // browser (incl. older iOS) still runs without a separate worklet file.
  const proc = ctx.createScriptProcessor(4096, 1, 1);
  const chunks = [];
  let samples = 0;
  proc.onaudioprocess = (e) => {
    const data = e.inputBuffer.getChannelData(0);
    chunks.push(new Float32Array(data));
    samples += data.length;
  };
  source.connect(analyser);
  source.connect(proc);
  proc.connect(ctx.destination); // required for onaudioprocess to fire in Safari

  const levelBuf = new Uint8Array(analyser.fftSize);
  let raf = 0;
  const tick = () => {
    analyser.getByteTimeDomainData(levelBuf);
    let peak = 0;
    for (let i = 0; i < levelBuf.length; i++) peak = Math.max(peak, Math.abs(levelBuf[i] - 128));
    onLevel?.(Math.min(1, peak / 64));
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  const startedAt = performance.now();
  let finished = false;
  const teardown = () => {
    cancelAnimationFrame(raf);
    try { proc.disconnect(); source.disconnect(); analyser.disconnect(); } catch { /* already */ }
    stream.getTracks().forEach((t) => t.stop());
    ctx.close?.();
  };

  let autoTimer = setTimeout(() => onAutoStop?.(), maxMs);

  return {
    async stop() {
      if (finished) throw new Error("already stopped");
      finished = true;
      clearTimeout(autoTimer);
      const seconds = (performance.now() - startedAt) / 1000;
      const rate = ctx.sampleRate;
      teardown();
      const merged = new Float32Array(samples);
      let o = 0;
      for (const c of chunks) { merged.set(c, o); o += c.length; }
      return { blob: encodeWav(downsample(merged, rate, TARGET_RATE), TARGET_RATE), seconds };
    },
    cancel() {
      if (finished) return;
      finished = true;
      clearTimeout(autoTimer);
      teardown();
    },
  };
}

function downsample(input, fromRate, toRate) {
  if (fromRate === toRate) return input;
  const ratio = fromRate / toRate;
  const out = new Float32Array(Math.floor(input.length / ratio));
  for (let i = 0; i < out.length; i++) {
    // average the source samples that fall in this output sample (cheap low-pass)
    const start = Math.floor(i * ratio);
    const end = Math.min(input.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    for (let j = start; j < end; j++) sum += input[j];
    out[i] = sum / Math.max(1, end - start);
  }
  return out;
}

function encodeWav(pcm, rate) {
  const buffer = new ArrayBuffer(44 + pcm.length * 2);
  const v = new DataView(buffer);
  const str = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str(0, "RIFF"); v.setUint32(4, 36 + pcm.length * 2, true); str(8, "WAVE");
  str(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  str(36, "data"); v.setUint32(40, pcm.length * 2, true);
  for (let i = 0; i < pcm.length; i++) {
    const s = Math.max(-1, Math.min(1, pcm[i]));
    v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}

/** TikTok / Instagram / Snapchat / Facebook in-app browsers usually block the mic. */
export function isInAppBrowser() {
  if (typeof navigator === "undefined") return false;
  return /FBAN|FBAV|Instagram|musical_ly|TikTok|Bytedance|Snapchat|Line\/|Twitter/i.test(navigator.userAgent || "");
}
