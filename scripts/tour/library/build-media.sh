#!/usr/bin/env bash
# Library tour media — re-runnable. Downloads the real library art/audio from the
# public Supabase buckets into a scratch dir, then writes lean copies to
# public/tour/library/. Needs ffmpeg and python3 with Pillow (WebP support).
#
#   bash scripts/tour/library/build-media.sh [scratch-dir]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
OUT="$ROOT/public/tour/library"
TMP="${1:-$(mktemp -d)}"
BASE="https://nmjexpuycmqcxuxljier.supabase.co/storage/v1/object/public"
mkdir -p "$OUT/covers" "$TMP"

COVERS="the-silent-tide the-light-between-us what-the-river-kept higher-ground the-wolf-winter the-bottle-from-the-sea the-lost-cat the-cartographer the-translator"
for s in $COVERS; do
  [ -f "$TMP/$s.png" ] || curl -fsS -o "$TMP/$s.png" "$BASE/library-art/covers/$s.png"
done
[ -f "$TMP/backdrop.jpg" ] || curl -fsS -o "$TMP/backdrop.jpg" "$BASE/library-art/backdrops/midnight-reading-room.jpg"
[ -f "$TMP/ww-ch1-opener.jpg" ] || curl -fsS -o "$TMP/ww-ch1-opener.jpg" "$BASE/library-art/the-wolf-winter/ch1-opener.jpg"
[ -f "$TMP/ww-ch1.mp3" ] || curl -fsS -o "$TMP/ww-ch1.mp3" "$BASE/library-audio/narration/the-wolf-winter/ch1.mp3"

# The Wolf Winter opener carries a stray AI pseudo-signature ("Refi") at about
# (108–137, 700–712) px; delogo paints it out before the WebP pass.
ffmpeg -hide_banner -loglevel error -y -i "$TMP/ww-ch1-opener.jpg" -vf "delogo=x=100:y=692:w=46:h=26" -q:v 1 "$TMP/ww-ch1-opener-clean.jpg"

# Chapter 1, paragraphs 0–4 only: 0–80.5 s with a 2 s fade from 78.5 s (the
# 12th sentence ends at 78.37 s). CBR mono so Safari's byte-range seeks land
# exactly; re-encoding keeps audio_timing aligned (gap edges match within ~1 ms).
ffmpeg -hide_banner -loglevel error -y -i "$TMP/ww-ch1.mp3" -t 80.5 -af "afade=t=out:st=78.5:d=2" \
  -c:a libmp3lame -b:a 128k -ar 44100 -ac 1 "$OUT/the-wolf-winter-ch1-part1.mp3"

python3 - "$TMP" "$OUT" $COVERS <<'PY'
import sys
from PIL import Image
tmp, out, covers = sys.argv[1], sys.argv[2], sys.argv[3:]
def save(im, path, q):
    im.save(path, "WEBP", quality=q, method=6)
# covers: 896x1344 PNG -> 480x720 WebP (largest display is ~240 CSS px wide at 2x)
for s in covers:
    im = Image.open(f"{tmp}/{s}.png").convert("RGB").resize((480, 720), Image.LANCZOS)
    save(im, f"{out}/covers/{s}.webp", 80)
# the Midnight Reading Room backdrop, native 1440x1024
save(Image.open(f"{tmp}/backdrop.jpg").convert("RGB"), f"{out}/midnight-reading-room.webp", 72)
# chapter-1 opener plate (cleaned), native 1024x768
save(Image.open(f"{tmp}/ww-ch1-opener-clean.jpg").convert("RGB"), f"{out}/the-wolf-winter-ch1-opener.webp", 78)
# hub door: 1400x900 crop of the reading room, the lit windows and the aisle's
# vanishing point in the upper two-thirds, the dark floor under the title scrim
save(Image.open(f"{tmp}/backdrop.jpg").convert("RGB").crop((20, 0, 1420, 900)), f"{out}/door.webp", 78)
PY

find "$OUT" -type f -exec ls -l {} \; | awk '{s+=$5; printf "%8d  %s\n", $5, $9} END {printf "%8d  TOTAL bytes\n", s}'
