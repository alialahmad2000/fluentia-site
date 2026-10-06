#!/usr/bin/env python3
"""
Renders one clip per irregular verb for /verbs: «go … went … gone», each form
spoken on its own with a pause between, into public/audio/verbs/<id>.mp3.

Voice: Kokoro-82M (Apache-2.0), run locally — free and unlimited. The project's
standing rule is local Kokoro for batch voicing, not the ElevenLabs character
budget (which the LMS needs for speech-to-text). American voice, matching the
-ed forms the page teaches.

Homographs are pinned with Kokoro's phoneme markup: spelled alike, said
differently, and the reason a learner presses play at all (read /red/).

Every file is mono (Safari plays stereo/odd MP3s badly). Re-run after adding a
verb to src/content/irregularVerbs.js:

  node -e 'import("./src/content/irregularVerbs.js").then(m=>console.log(JSON.stringify(m.IRREGULAR_VERBS)))' \
    | ~/.venvs/podcast/bin/python -I scripts/build-verbs-audio.py [--only id,id]
"""
import json, os, subprocess, sys, tempfile

import numpy as np
import soundfile as sf
from kokoro import KPipeline

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'audio', 'verbs')
SR = 24000
VOICE = 'af_heart'
SPEED = 0.86
GAP_S = 0.55      # between forms: long enough to repeat after
EDGE_S = 0.12     # lead-in / tail

# (verb id, slot) → phonemes. Slot: 'base' | 'past' | 'participle'.
PHONEMES = {
    ('read', 'past'): 'ɹˈɛd', ('read', 'participle'): 'ɹˈɛd',
    ('proofread', 'past'): 'pɹˈufɹˌɛd', ('proofread', 'participle'): 'pɹˈufɹˌɛd',
    ('wind', 'base'): 'wˈInd', ('wind', 'past'): 'wˈWnd', ('wind', 'participle'): 'wˈWnd',
    ('tear', 'base'): 'tˈɛɹ',
}


def words(v):
    pasts = [p.strip() for p in v['past'].split('/') if p.strip()]
    return [('base', v['base'])] + [('past', p) for p in pasts] + [('participle', v['participle'])]


def speak(pipe, vid, slot, word):
    ph = PHONEMES.get((vid, slot))
    text = f'[{word}](/{ph}/)' if ph else word
    chunks = [r.audio.numpy() for r in pipe(text, voice=VOICE, speed=SPEED) if r.audio is not None]
    if not chunks:
        raise RuntimeError(f'no audio for {vid}:{word}')
    a = np.concatenate(chunks)
    # Trim Kokoro's own padding so every gap is the same length.
    loud = np.where(np.abs(a) > 0.012)[0]
    return a[max(0, loud[0] - 240): loud[-1] + 480] if len(loud) else a


def main():
    verbs = json.load(sys.stdin)
    only = None
    if '--only' in sys.argv:
        only = set(sys.argv[sys.argv.index('--only') + 1].split(','))
    os.makedirs(OUT, exist_ok=True)
    pipe = KPipeline(lang_code='a', repo_id='hexgrad/Kokoro-82M')
    gap = np.zeros(int(SR * GAP_S), dtype=np.float32)
    edge = np.zeros(int(SR * EDGE_S), dtype=np.float32)
    total = 0
    with tempfile.TemporaryDirectory() as tmp:
        for v in verbs:
            if only and v['id'] not in only:
                continue
            parts = [edge]
            for i, (slot, w) in enumerate(words(v)):
                if i:
                    parts.append(gap)
                parts.append(speak(pipe, v['id'], slot, w))
            parts.append(edge)
            wav = os.path.join(tmp, f"{v['id']}.wav")
            sf.write(wav, np.concatenate(parts), SR)
            mp3 = os.path.join(OUT, f"{v['id']}.mp3")
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-ac', '1', '-ar', str(SR),
                            '-b:a', '48k', mp3], check=True)
            kb = os.path.getsize(mp3) // 1024
            total += kb
            print(f"  {v['id']:<14} {' · '.join(w for _, w in words(v)):<40} {kb:>3} kB", flush=True)
    print(f'done — {total} kB')


if __name__ == '__main__':
    main()
