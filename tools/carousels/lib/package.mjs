// Packaging: caption.txt per carousel, the contact sheet (index.html) and the posting plan.
import { writeFileSync } from "node:fs";
import { join } from "node:path";

export const FORMAT = {
  mistake: "غلط شائع",
  phrases: "جمل للعمل",
  myth: "خرافة وحقيقة",
  idea: "فكرة",
  scene: "مشهد",
};
const DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const plainText = (t) => String(t).replace(/\{\{([\s\S]+?)\}\}/g, "$1").replace(/\*\*([\s\S]+?)\*\*/g, "$1").replace(/==([\s\S]+?)==/g, "$1");

export const folderName = (c) => `${c.id}-${String(c.folder || c.title).trim().replace(/\s+/g, "-")}`;

/** Posting dates: plan.start, then every plan.weekdays day (0 = Sunday), one carousel per slot, in id order. */
export function schedule(all, plan) {
  const [y, m, d] = plan.start.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  const out = [];
  while (out.length < all.length) {
    if (plan.weekdays.includes(t.getUTCDay())) out.push(new Date(t));
    t.setUTCDate(t.getUTCDate() + 1);
  }
  return out;
}
const dayLabel = (dt) => `${DAYS[dt.getUTCDay()]} ${dt.getUTCDate()} ${MONTHS[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`;

export function captionText(c, plan) {
  const cap = c.caption;
  const tags = (cap.tags || plan.defaultTags).join(" ");
  const tiktok = plainText(cap.tiktok || cap.hook);
  const cta = cap.cta || plan.captionCta;
  return [
    "━━━━ تيك توك (قصير — الصقه كما هو) ━━━━",
    "",
    `${tiktok}`,
    "",
    tags,
    "",
    "",
    "━━━━ إنستقرام (طويل) ━━━━",
    "",
    plainText(cap.hook),
    "",
    ...cap.lines.map(plainText).flatMap((l) => [l, ""]),
    cta,
    "",
    tags,
    "",
  ].join("\n");
}

export function writePlan(OUT, all, plan) {
  const dates = schedule(all, plan);
  const byWeek = [];
  all.forEach((c, k) => {
    const w = Math.floor(k / plan.weekdays.length);
    (byWeek[w] ||= []).push({ c, dt: dates[k] });
  });
  const L = [];
  L.push(`# خطة نشر كاروسيلات «مجلة طلاقة» — العدد ${plan.issue}`, "");
  L.push(`**${all.length} كاروسيل** مأخوذة من ${new Set(all.map((c) => c.article)).size} مقالات. كل مجلد فيه نسختين:`, "");
  L.push("- `4x5/` لإنستقرام (منشور كاروسيل)، والصق الكابشن **الطويل** من `caption.txt`.");
  L.push("- `9x16/` لتيك توك (وضع الصور) وللستوري، والصق الكابشن **القصير**.", "");
  L.push("## الإيقاع", "");
  for (const l of plan.rhythm) L.push(`- ${l}`);
  L.push("", "## الترتيب ولماذا", "");
  for (const l of plan.why) L.push(`- ${l}`);
  L.push("", "## الجدول", "");
  byWeek.forEach((wk, w) => {
    L.push(`### الأسبوع ${w + 1}`, "");
    for (const { c, dt } of wk) {
      L.push(`**${dayLabel(dt)} · ${plan.time}** — \`${folderName(c)}\``);
      L.push(`> ${plainText(c.slides[0].hook)}`);
      L.push(`${FORMAT[c.format] || c.format} · من مقال «${c.articleTitle}»`, "");
      L.push("- [ ] نُشر على تيك توك", "- [ ] نُشر على إنستقرام", "");
    }
  });
  L.push("---", "", `عدد جديد من المجلة؟ اكتبوا ملفات المحتوى في \`tools/carousels/content/\` وشغّلوا: \`node tools/carousels/render.mjs\``, "");
  writeFileSync(join(OUT, "00-POSTING-PLAN.md"), L.join("\n"));
}

export function writeSheet(OUT, all, plan, fontCSS = "") {
  const dates = schedule(all, plan);
  const rows = all
    .map((c, k) => {
      const f = folderName(c);
      const thumbs = (size) =>
        c.slides.map((_, i) => `<img loading="lazy" src="${encodeURI(f)}/${size}/${String(i + 1).padStart(2, "0")}.png" alt="">`).join("");
      return `<article>
  <div class="meta"><span class="n">${c.id}</span>
    <div><h2>${esc(plainText(c.slides[0].hook))}</h2>
    <p><b>${esc(FORMAT[c.format] || c.format)}</b> · «${esc(c.articleTitle)}» · ${c.slides.length} شرائح · <span class="d">${dayLabel(dates[k])}</span></p>
    <p class="path">${esc(f)}/</p></div></div>
  <div class="strip s45">${thumbs("4x5")}</div><div class="strip s916">${thumbs("9x16")}</div>
  <details><summary>الكابشن</summary><pre>${esc(captionText(c, plan))}</pre></details>
</article>`;
    })
    .join("\n");
  const html = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>كاروسيلات مجلة طلاقة</title><style>${fontCSS}
:root{--ink:#0b0b0c;--paper:#f4f4f4;--lime:#c6ff3d;--mute:#a6a8ab}
*{box-sizing:border-box;margin:0}body{background:var(--ink);color:var(--paper);font-family:Plex,"IBM Plex Sans Arabic",system-ui,sans-serif;padding:40px clamp(16px,4vw,56px) 80px}
header{display:flex;flex-wrap:wrap;gap:24px;align-items:flex-end;justify-content:space-between;border-bottom:1px solid rgba(244,244,244,.2);padding-bottom:24px;margin-bottom:8px}
h1{font-family:Alexandria,sans-serif;font-weight:900;font-size:clamp(34px,5vw,64px);line-height:1.2}h1 span{color:var(--lime)}
header p{color:var(--mute);font-size:16px;margin-top:8px}
.tg{display:flex;gap:0;border:1px solid rgba(244,244,244,.3)}.tg label{padding:10px 18px;cursor:pointer;font-family:Alexandria;font-weight:800;font-size:15px}
#a:checked~header label[for=a],#b:checked~header label[for=b]{background:var(--lime);color:var(--ink)}input{display:none}
article{border-bottom:1px solid rgba(244,244,244,.16);padding:28px 0}
.meta{display:flex;gap:20px;align-items:flex-start}.n{font-family:Alexandria;font-weight:900;font-size:56px;line-height:.9;color:var(--lime);direction:ltr;min-width:76px}
h2{font-family:Alexandria;font-weight:800;font-size:24px;line-height:1.5}.meta p{color:var(--mute);font-size:15px;margin-top:4px}.meta b{color:var(--paper)}.d{color:var(--lime)}
.path{font-family:ui-monospace,monospace;font-size:13px!important;direction:ltr;text-align:right}
.strip{display:flex;gap:10px;overflow-x:auto;padding:18px 0 6px;scroll-snap-type:x mandatory}.strip img{height:300px;flex:none;scroll-snap-align:start;background:#222}
.s916 img{height:380px}.s916{display:none}#b:checked~main .s45{display:none}#b:checked~main .s916{display:flex}
details{margin-top:10px}summary{cursor:pointer;color:var(--mute);font-size:14px}pre{white-space:pre-wrap;font-family:inherit;font-size:15px;line-height:1.8;background:#151517;padding:18px;margin-top:10px;max-width:760px}
</style></head><body>
<input type="radio" name="sz" id="a" checked><input type="radio" name="sz" id="b">
<header><div><h1>مجلة طلاقة <span>·</span> بنك الكاروسيلات</h1><p>العدد ${esc(plan.issue)} · ${all.length} كاروسيل · مرتّبة حسب ترتيب النشر · الخطة في 00-POSTING-PLAN.md</p></div>
<div class="tg"><label for="a">4:5 إنستقرام</label><label for="b">9:16 تيك توك</label></div></header>
<main>${rows}</main></body></html>`;
  writeFileSync(join(OUT, "index.html"), html);
}
