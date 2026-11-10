/**
 * Quote cards for «غسق الصحراء»: the dusk photograph, a seeded dune ridge drawn on the canvas,
 * the quote in the display face. story 1080×1920 · post 1080×1350. Browser-only: import lazily.
 */
import { ridge } from "./gen.js";

export const SIZES = { story: [1080, 1920], post: [1080, 1350] };
const OFF = "#f7ebe3";
const APRICOT = "#e8b48a";
const DISPLAY = '"Reem Kufi", "Noto Kufi Arabic", system-ui, sans-serif';
const BODY = '"IBM Plex Sans Arabic", system-ui, sans-serif';

async function fontsReady() {
  if (!document.fonts || !document.fonts.load) return;
  try {
    await Promise.all([document.fonts.load(`600 64px ${DISPLAY}`, "طلاقة"), document.fonts.load(`500 32px ${BODY}`, "طلاقة")]);
  } catch { /* system fonts */ }
}
const loadImg = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });

function cover(ctx, img, w, h) {
  const s = Math.max(w / img.width, h / img.height);
  ctx.drawImage(img, (w - img.width * s) / 2, (h - img.height * s) / 2, img.width * s, img.height * s);
}
function wrap(ctx, text, maxW) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}
function fit(ctx, text, family, weight, maxW, start, min, maxLines) {
  let size = start;
  for (; size > min; size -= 2) {
    ctx.font = `${weight} ${size}px ${family}`;
    if (wrap(ctx, text, maxW).length <= maxLines) break;
  }
  ctx.font = `${weight} ${size}px ${family}`;
  return size;
}

export async function paint({ kind = "post", quote = "", title = "", seed = "dusk" }) {
  await fontsReady();
  const [W, H] = SIZES[kind];
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#2a1433");
  g.addColorStop(1, "#6a2d4c");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const img = await loadImg(`/images/journal/dusk/quote-${kind}.webp`);
  if (img) cover(ctx, img, W, H);
  // plum veil from the top, so the quote always sits on a deep sky
  const v = ctx.createLinearGradient(0, 0, 0, H);
  v.addColorStop(0, "rgba(30,12,40,0.86)");
  v.addColorStop(0.55, "rgba(42,20,51,0.55)");
  v.addColorStop(1, "rgba(28,10,36,0.2)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
  // two seeded dune ridges at the foot
  [["a", 0.84, 46, "#3a1a42", 0.55], ["b", 0.92, 40, "#1d0a27", 0.9]].forEach(([k, base, amp, fill, rimO]) => {
    const r = ridge(`${seed}-share-${k}`, { w: W, base: H * base, amp, waves: 3 });
    ctx.beginPath();
    for (let x = 0; x <= W; x += 6) ctx[x ? "lineTo" : "moveTo"](x, r.yAt(x));
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
    ctx.beginPath();
    for (let x = 0; x <= W; x += 6) ctx[x ? "lineTo" : "moveTo"](x, r.yAt(x));
    ctx.strokeStyle = `rgba(232,180,138,${rimO})`; ctx.lineWidth = 2; ctx.stroke();
  });
  const pad = 96;
  const maxW = W - pad * 2;
  ctx.direction = "rtl";
  ctx.textAlign = "right";
  const size = fit(ctx, quote, DISPLAY, 600, maxW, kind === "story" ? 124 : 104, 56, kind === "story" ? 8 : 6);
  const lines = wrap(ctx, quote, maxW);
  const lh = size * 1.55;
  const top = (kind === "story" ? H * 0.2 : H * 0.17);
  // the sun above the quote
  ctx.fillStyle = APRICOT;
  ctx.beginPath(); ctx.arc(W - pad - 22, top - 34, 16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = OFF;
  let y = top + size;
  for (const l of lines) { ctx.fillText(l, W - pad, y); y += lh; }
  if (title) {
    ctx.fillStyle = APRICOT;
    ctx.font = `500 30px ${BODY}`;
    ctx.fillText(title.length > 60 ? `${title.slice(0, 58)}…` : title, W - pad, y + 40);
  }
  ctx.fillStyle = OFF;
  ctx.globalAlpha = 0.92;
  ctx.font = `600 38px ${DISPLAY}`;
  ctx.fillText("مجلة طلاقة", W - pad, H - 64);
  ctx.direction = "ltr"; ctx.textAlign = "left"; ctx.globalAlpha = 0.7;
  ctx.font = `500 26px ${BODY}`;
  ctx.fillText("fluentia.academy/journal", pad, H - 64);
  ctx.globalAlpha = 1;
  return canvas;
}

export function toBlob(canvas) {
  return new Promise((resolve) => { try { canvas.toBlob((b) => resolve(b), "image/png"); } catch { resolve(null); } });
}
