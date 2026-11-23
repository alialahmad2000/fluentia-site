/**
 * Every piece of footage on /preview, by slot. Files live in
 * public/media/higgsfield/<section>/ and are made by docs/higgsfield-rebuild/encode.sh
 * from the Higgsfield jobs logged in docs/higgsfield-rebuild/generations.json.
 *
 * A slot:
 *   p      base path of the portrait (9:16 or 3:4) cut — <p>.avif/.webp poster, <p>.mp4/.webm loop
 *   l      base path of the landscape (16:9) cut, for full-bleed slots on landscape screens
 *   video  true when the slot has a loop (otherwise the poster is a still)
 *   loop   false = the clip plays once and holds its last frame
 *   w, h   intrinsic size of the portrait poster (reserves space: no layout shift)
 * A slot set to null renders a flat placeholder (only while footage is pending).
 */
const B = "/media/higgsfield";

const v = (section, name, { l = false, w = 720, h = 1280, video = true, loop = true } = {}) => ({
  p: `${B}/${section}/${name}-p`,
  l: l ? `${B}/${section}/${name}-l` : null,
  video,
  loop,
  w,
  h,
});
const card = { w: 720, h: 960 }; // 3:4 cards
const still = { ...card, video: false };

// Job ids per slot: docs/higgsfield-rebuild/generations.json («pack» entries).
export const MEDIA = {
  hero: v("hero", "hero", { l: true }), // reel: meeting → café → airport, dissolves, 21 s
  before: v("before-after", "before", { l: true }), // ping-pong (push-in does not return)
  after: v("before-after", "after", { l: true }), // Kingdom Centre + KAFD
  class: v("how", "class", card),
  daily: v("how", "daily", still), // phone cropped out
  coach: v("how", "coach", still),
  novel: v("platform", "novel", card),
  podcast: v("platform", "podcast", card), // last second trimmed
  scenes: v("platform", "scenes", card),
  speak: v("platform", "speak", card),
  plan: v("platform", "plan", still),
  recordings: v("platform", "recordings", still),
  employee: v("who", "employee", { ...card, loop: false }), // plays once and holds: walks away, no clean loop
  owner: v("who", "owner", card),
  student: v("who", "student", still),
  final: v("final", "final", { l: true }),
};
