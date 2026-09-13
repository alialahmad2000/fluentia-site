"""
media.py: copy the four specimens' plates and clips into public/tour/expressions/.

    python3 scripts/tour/expressions/media.py

Plates are re-encoded as WebP at their native size (proverb 1024x768, idiom
768x1024; the sheets never draw them wider than that). The clips are copied as
they are: edge-tts MP3s, 24 kHz mono 48 kbps, 1.7 to 4.4 s, with no silence
worth trimming. None of them is in Dr. Ali's cloned voice.

door.webp is the hub's door card: the early-bird plate, cropped to 1400x900
from the bottom of the frame so the bird sits in the upper third, clear of
the door card's title block.
"""
import os
import urllib.request
from io import BytesIO

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "..", "..", "public", "tour", "expressions")
BASE = "https://nmjexpuycmqcxuxljier.supabase.co/storage/v1/object/public"

PLATES = [
    "dont-count-your-chickens", "the-early-bird",
    "cost-an-arm-and-a-leg-literal", "cost-an-arm-and-a-leg-real",
    "spill-the-beans-literal", "spill-the-beans-real",
]
CLIPS = [f"{s}{suf}" for s in ("dont-count-your-chickens", "the-early-bird", "cost-an-arm-and-a-leg", "spill-the-beans") for suf in ("", "-0", "-1")]


def fetch(url):
    with urllib.request.urlopen(url) as r:
        return r.read()


os.makedirs(OUT, exist_ok=True)
total = 0
for name in PLATES:
    im = Image.open(BytesIO(fetch(f"{BASE}/curriculum-images/expressions/{name}.jpg"))).convert("RGB")
    path = os.path.join(OUT, f"{name}.webp")
    im.save(path, "WEBP", quality=88, method=6)
    total += os.path.getsize(path)
    if name == "the-early-bird":
        door = im.crop((0, 110, 1024, 110 + 658)).resize((1400, 900), Image.LANCZOS)
        door_path = os.path.join(OUT, "door.webp")
        door.save(door_path, "WEBP", quality=86, method=6)
        total += os.path.getsize(door_path)

for name in CLIPS:
    data = fetch(f"{BASE}/curriculum-audio/expressions/{name}.mp3")
    with open(os.path.join(OUT, f"{name}.mp3"), "wb") as f:
        f.write(data)
    total += len(data)

print(f"media: {len(PLATES)} plates + door + {len(CLIPS)} clips = {total:,} bytes")
