// Content gate: brand words, prices, slide counts, words per slide, captions.

// Forbidden by the voice guide (docs/editorial/VOICE.md). Matched as whole tokens after stripping و/ف/ب/ل/ك.
const FORBIDDEN = ["معهد", "المعهد", "معاهد", "دورة", "الدورة", "دورات", "الدورات", "مذهل", "مذهلة", "المذهل", "مميز", "مميزة", "المميز", "المميزة",
  "استثنائية", "استثنائي", "الاستثنائية", "الأفضل", "حبيبتي"];
const FORBIDDEN_PHRASES = ["كلاس تجريبي"];
const PRICE = /ريال|ر\.س|﷼|\bSAR\b|\bUSD\b|\$\s?\d|خصم|عرض لفترة|مجان/;

const stripMarkup = (t) => String(t).replace(/\{\{[\s\S]+?\}\}/g, " ").replace(/\*\*|==/g, "");
/** Arabic words in a string, English spans removed. */
export const words = (t) => stripMarkup(t).split(/\s+/).filter((w) => /[؀-ۿ]/.test(w)).length;

function strings(v, out = []) {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) if (!["type", "variant", "image", "pos", "tone"].includes(k)) strings(x, out);
  return out;
}

function tokens(t) {
  return stripMarkup(t)
    .split(/[^؀-ۿ]+/)
    .filter(Boolean)
    .map((w) => w.replace(/[ً-ْـ]/g, ""));
}

export function lint(c, plan) {
  const out = [];
  const err = (msg) => out.push({ id: c.id, level: "error", msg });
  const warn = (msg) => out.push({ id: c.id, level: "warn", msg });

  if (!/^\d{2}$/.test(c.id)) err(`id must be two digits (got "${c.id}")`);
  if (!c.file.startsWith(c.id + "-")) err(`file name ${c.file} must start with "${c.id}-"`);
  const n = c.slides?.length || 0;
  if (n < 6 || n > 9) err(`${n} slides; keep 6–9`);
  if (c.slides?.[0]?.type !== "cover") err("first slide must be the cover");
  if (c.slides?.[n - 1]?.type !== "cta") err("last slide must be the CTA");

  const everything = strings({ slides: c.slides, caption: c.caption, title: c.title, folder: c.folder });
  for (const s of everything) {
    for (const tk of tokens(s)) {
      const bare = tk.replace(/^[وفبلك](?=..)/, "");
      if (FORBIDDEN.includes(tk) || FORBIDDEN.includes(bare)) err(`forbidden word «${tk}» in: ${s.slice(0, 60)}`);
    }
    for (const ph of FORBIDDEN_PHRASES) if (s.includes(ph)) err(`forbidden phrase «${ph}»`);
    if (PRICE.test(s)) err(`price/offer language in: ${s.slice(0, 60)}`);
  }

  c.slides?.forEach((s, i) => {
    if (s.type === "cta" || s.type === "cover") return;
    const w = words(strings(s).join(" "));
    if (w > 34) err(`slide ${i + 1}: ${w} Arabic words (max ~25)`);
    else if (w > 28) warn(`slide ${i + 1}: ${w} Arabic words (aim for ≤25)`);
  });
  const hook = c.slides?.[0]?.hook || "";
  if (words(hook) > 12) warn(`cover hook is ${words(hook)} words; shorter stops the scroll better`);

  const cap = c.caption || {};
  if (!cap.hook) err("caption.hook missing");
  if (!Array.isArray(cap.lines) || cap.lines.length < 2 || cap.lines.length > 4) err("caption.lines: 2–4 short lines");
  const tt = cap.tiktok || cap.hook || "";
  if ([...tt].length > 150) err(`TikTok caption is ${[...tt].length} chars before hashtags (max 150)`);
  const tags = cap.tags || plan.defaultTags || [];
  if (tags.length < 5 || tags.length > 8) err(`${tags.length} hashtags; use 5–8`);
  if (tags.some((t) => !/^#\S+$/.test(t))) err("every hashtag must start with # and have no spaces");
  return out;
}
