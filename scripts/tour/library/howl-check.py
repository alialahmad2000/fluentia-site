"""
Is the wolf howl actually audible where the narrator says "the howling of wolves"?

The generator (fluentia-lms scripts/library/generate-cinematic-narration.mjs, PLAN
"The Wolf Winter" ch1) adelays a 4 s "single lone wolf howling far away" SFX, 8 dB
under the voice, to the END of sentence p1 s1 = 28.92 s. The next sentence starts at
29.62 s, so if the cue is in the mix, the 0.7 s gap between them must carry it.

    python3 scripts/tour/library/howl-check.py <chapter-1.mp3 | the tour clip>

Needs ffmpeg + numpy. Prints, for every inter-sentence gap of paragraphs 0–4:
RMS level, third-octave difference of the howl gap against the other gaps, and a
sliding search for any sustained narrow-band tone (a howl is a gliding tone that
lasts seconds; speech pitch changes every syllable; the wind bed is steady).
"""
import subprocess, sys, wave, tempfile, os
import numpy as np

src = sys.argv[1]
tmp = os.path.join(tempfile.mkdtemp(), "ch1.wav")
subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", src, "-t", "80.5", "-ac", "1", "-ar", "22050", "-c:a", "pcm_s16le", tmp], check=True)
w = wave.open(tmp); sr = w.getframerate()
x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
db = lambda v: 20 * np.log10(max(v, 1e-9))

T = [(0,0,0,5200),(0,1,5550,14830),(1,0,15530,20090),(1,1,20440,28920),(2,0,29620,33540),(2,1,33890,38690),
     (2,2,39040,42400),(3,0,43100,47500),(3,1,47850,57450),(4,0,58150,63590),(4,1,63940,73780),(4,2,74130,78370)]
gaps = [(a[3] / 1000 + 0.04, b[2] / 1000 - 0.04) for a, b in zip(T, T[1:])]

print("gap (s)            RMS dBFS")
for g0, g1 in gaps:
    seg = x[int(g0 * sr):int(g1 * sr)]
    tag = "   <-- howl cue placed at 28.92 s" if abs(g0 - 28.96) < 0.01 else ""
    print(f"{g0:6.2f}–{g1:6.2f}     {db(np.sqrt(np.mean(seg ** 2))):6.1f}{tag}")

def spec(a, b, L=2048, hop=512):
    seg = x[int(a * sr):int(b * sr)]; win = np.hanning(L)
    return np.fft.rfftfreq(L, 1 / sr), np.mean([np.abs(np.fft.rfft(seg[i:i + L] * win)) ** 2 for i in range(0, len(seg) - L, hop)], axis=0)

f, Ph = spec(28.96, 29.58)
Pc = np.mean([spec(a, b)[1] for a, b in gaps if abs(a - 28.96) > 0.01 and b - a > 0.26], axis=0)
edges = [150, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000]
print("\nthird-octave: howl gap minus the other gaps (a howl would lift 300–1200 Hz by several dB)")
for lo, hi in zip(edges, edges[1:]):
    k = (f >= lo) & (f < hi)
    print(f"{lo:5d}–{hi:5d} Hz  {10 * np.log10(Ph[k].sum() / Pc[k].sum()):+5.1f} dB")

n, hop = 4096, 512
fr = np.array([x[i:i + n] * np.hanning(n) for i in range(0, len(x) - n, hop)])
S = 20 * np.log10(np.abs(np.fft.rfft(fr, axis=1)) + 1e-9)
ff = np.fft.rfftfreq(n, 1 / sr); tt = np.arange(len(fr)) * hop / sr + n / 2 / sr
m = (ff >= 250) & (ff <= 1600); B = S[:, m]
from numpy.lib.stride_tricks import sliding_window_view
P = B - np.median(sliding_window_view(np.pad(B, ((0, 0), (20, 20)), mode="edge"), 41, axis=1), axis=2)
rows = []
for s in np.arange(0, 79, 0.5):
    k = (tt >= s) & (tt < s + 1.5)
    mp = P[k].mean(axis=0); j = int(np.argmax(mp)); rows.append((s, mp[j], ff[m][j]))
vals = np.array([r[1] for r in rows])
print(f"\nsustained-tone prominence, 1.5 s windows: median {np.median(vals):.1f} dB, p95 {np.percentile(vals, 95):.1f} dB")
for s, v, hz in rows:
    if 27.5 <= s <= 33:
        print(f"{s:5.1f}–{s + 1.5:5.1f} s  best {hz:5.0f} Hz  {v:4.1f} dB")
