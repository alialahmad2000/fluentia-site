/**
 * Every piece of footage on /preview, by slot. Files live in
 * public/media/higgsfield/<section>/ and are made by docs/higgsfield-rebuild/encode.sh
 * from the Higgsfield jobs logged in docs/higgsfield-rebuild/generations.json.
 *
 * A slot:
 *   p      base path of the portrait (9:16 or 3:4) cut — <p>.avif/.webp poster, <p>.mp4/.webm loop
 *   l      base path of the landscape (16:9) cut, for full-bleed slots on landscape screens
 *   video  true when the slot has a loop (otherwise the poster is a still)
 *   w, h   intrinsic size of the portrait poster (reserves space: no layout shift)
 * A slot set to null renders a flat placeholder (only while footage is pending).
 */
const B = "/media/higgsfield";

const v = (section, name, { l = false, w = 720, h = 1280 } = {}) => ({
  p: `${B}/${section}/${name}-p`,
  l: l ? `${B}/${section}/${name}-l` : null,
  video: true,
  w,
  h,
});

export const MEDIA = {
  hero: v("hero", "hero"),
  before: v("before-after", "before"),
  after: v("before-after", "after"),
  class: v("classes", "class"),
  daily: null,
  coach: null,
  novel: null,
  podcast: null,
  scenes: null,
  speak: null,
  plan: null,
  recordings: null,
  employee: null,
  owner: null,
  student: null,
  final: null,
};
