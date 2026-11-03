/**
 * «قصص طلابنا» — the one list every story surface reads (the homepage section,
 * /stories, the card on /private, the full-screen viewer).
 *
 * To add a student:
 *   1. Drop three files in public/stories/<id>/:
 *        <id>_site.mp4     full video, 720×1280 H.264, captions burned in, ≤ 8 MB
 *        <id>_preview.mp4  4 s MUTED loop, 480×854, no audio track, ≤ 600 KB
 *        <id>_poster.webp  one sharp frame, 720×1280
 *      (~/fluentia-video-studio/scripts/malak/site.sh makes all three.)
 *   2. Add one entry below. Newest first.
 *
 * `track`: "private" also shows the card on /private; anything else shows on
 * the homepage and /stories only.
 * `headline` and `excerpt` are the student's OWN words, verbatim from the
 * video — never a paraphrase. `duration` is in seconds.
 * No company names, no surnames.
 */
export const STORIES = [
  {
    id: "malak",
    name: "ملاك",
    role: "موظفة — تدريب فردي",
    headline: "سووا لي منهج خاص بمجالي",
    excerpt: "حتى الكلمات اللي أتعلمها هي نفسها اللي أحتاجها بشغلي.",
    track: "private",
    video: "/stories/malak/malak_site.mp4",
    preview: "/stories/malak/malak_preview.mp4",
    poster: "/stories/malak/malak_poster.webp",
    duration: 58,
  },
];

export const storiesFor = (track) => (track ? STORIES.filter((s) => s.track === track) : STORIES);

export const formatDuration = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

/** Spoken duration for labels: «58 ثانية», «دقيقة و12 ثانية». */
export function durationLabel(s) {
  const m = Math.floor(s / 60);
  const r = Math.round(s % 60);
  if (!m) return `${r} ثانية`;
  return r ? `${m === 1 ? "دقيقة" : `${m} دقائق`} و${r} ثانية` : m === 1 ? "دقيقة" : `${m} دقائق`;
}
