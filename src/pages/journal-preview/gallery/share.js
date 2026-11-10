/**
 * Quote cards in the gallery look, painted on a canvas: the article's own
 * monochrome plate (story / post crop), a black gradient, a lime block, the
 * quote in huge Alexandria. Browser-only; import lazily.
 */
export const SIZES = { story: [1080, 1920], post: [1080, 1350] };
const LIME = "#c6ff3d";
const INK = "#0b0b0c";
const DISP = "Alexandria, 'IBM Plex Sans Arabic', system-ui, sans-serif";
const TXT = "'IBM Plex Sans Arabic', Alexandria, system-ui, sans-serif";

async function fontsReady() {
  if (!document.fonts || !document.fonts.load) return;
  try {
    await Promise.all([
      document.fonts.load(`900 64px Alexandria`, "طلاقة"),
      document.fonts.load(`700 32px "IBM Plex Sans Arabic"`, "طلاقة"),
    ]);
  } catch { /* fall back to system fonts */ }
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function cover(ctx, img, w, h) {
  const s = Math.max(w / img.width, h / img.height);
  const iw = img.width * s;
  const ih = img.height * s;
  ctx.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih);
}

function wrap(ctx, text, maxW) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

export async function paint({ kind, slug, quote, title, number }) {
  await fontsReady();
  const [W, H] = SIZES[kind];
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
  const img = await loadImage(`/images/journal/gallery/plate-${slug}-${kind}.webp`);
  if (img) cover(ctx, img, W, H);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "rgba(11,11,12,0.55)"); g.addColorStop(0.35, "rgba(11,11,12,0.35)"); g.addColorStop(1, "rgba(11,11,12,0.95)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const m = 80;
  // top rule + brand
  ctx.direction = "rtl"; ctx.textAlign = "right"; ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#fff"; ctx.font = `900 46px ${DISP}`;
  ctx.fillText("طلاقة", W - m, m + 48);
  ctx.font = `700 28px ${TXT}`; ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.textAlign = "left"; ctx.direction = "ltr";
  ctx.fillText("01 — 2026", m, m + 46);
  ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.fillRect(m, m + 78, W - m * 2, 2);
  // lime numeral block
  const blk = kind === "story" ? 300 : 240;
  ctx.fillStyle = LIME; ctx.fillRect(W - m - blk, kind === "story" ? 420 : 300, blk, blk);
  ctx.fillStyle = INK; ctx.font = `900 ${blk * 0.72}px ${DISP}`; ctx.textAlign = "center"; ctx.direction = "ltr";
  ctx.fillText(String(number).padStart(2, "0"), W - m - blk / 2, (kind === "story" ? 420 : 300) + blk * 0.78);
  // quote
  ctx.direction = "rtl"; ctx.textAlign = "right";
  let size = kind === "story" ? 96 : 84;
  let lines;
  const maxW = W - m * 2;
  for (; size >= 52; size -= 4) {
    ctx.font = `900 ${size}px ${DISP}`;
    lines = wrap(ctx, quote, maxW);
    if (lines.length * size * 1.45 < (kind === "story" ? 760 : 560)) break;
  }
  const lh = size * 1.45;
  const total = lines.length * lh;
  const bottom = H - m - 120;
  let y = bottom - total + lh * 0.8;
  ctx.fillStyle = "#fff";
  lines.forEach((ln, i) => {
    const wdt = ctx.measureText(ln).width;
    if (i === lines.length - 1) { ctx.fillStyle = LIME; ctx.fillRect(W - m - wdt - 8, y + size * 0.16, wdt + 16, 10); ctx.fillStyle = "#fff"; }
    ctx.fillText(ln, W - m, y);
    y += lh;
  });
  ctx.font = `700 30px ${TXT}`; ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fillText(title, W - m, H - m - 36);
  ctx.fillStyle = LIME; ctx.fillRect(m, H - m - 14, 120, 8);
  ctx.textAlign = "left"; ctx.direction = "ltr"; ctx.fillStyle = "#fff";
  ctx.fillText("fluentia.academy/journal", m, H - m - 36);
  return canvas;
}

export const toBlob = (canvas) => new Promise((res) => canvas.toBlob((b) => res(b), "image/png"));
