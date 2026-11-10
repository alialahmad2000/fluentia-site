/**
 * Quote cards for the ink direction, painted on a canvas: the direction's own
 * night photograph (public/images/journal/ink/quote-*.webp), a warm ink scrim,
 * film grain, the quote in Aref Ruqaa with one ember rule.
 *   story 1080×1920 · post 1080×1350
 * Browser-only: import lazily.
 */
export const SIZES = { story: [1080, 1920], post: [1080, 1350] };
const CREAM = "#f2eadf";
const EMBER = "#e8542c";
const EMBER2 = "#ff7a45";
const DISPLAY = '"Aref Ruqaa", "Noto Naskh Arabic", serif';
const BODY = '"IBM Plex Sans Arabic", system-ui, sans-serif';

async function fontsReady() {
  if (!document.fonts || !document.fonts.load) return;
  try {
    await Promise.all([document.fonts.load(`700 64px ${DISPLAY}`, "طلاقة"), document.fonts.load(`500 32px ${BODY}`, "طلاقة")]);
  } catch { /* system fallback */ }
}
function loadImg(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}
function cover(ctx, img, x, y, w, h) {
  const s = Math.max(w / img.width, h / img.height);
  ctx.drawImage(img, x + (w - img.width * s) / 2, y + (h - img.height * s) / 2, img.width * s, img.height * s);
}
function wrap(ctx, text, maxW) {
  const lines = [];
  let line = "";
  for (const w of String(text).split(/\s+/).filter(Boolean)) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}
function fit(ctx, text, family, weight, maxW, start, min, maxLines) {
  let size = start;
  for (; size > min; size -= 2) { ctx.font = `${weight} ${size}px ${family}`; if (wrap(ctx, text, maxW).length <= maxLines) break; }
  ctx.font = `${weight} ${size}px ${family}`;
  return size;
}
function grain(ctx, W, H) {
  const n = document.createElement("canvas");
  n.width = n.height = 256;
  const nc = n.getContext("2d");
  const d = nc.createImageData(256, 256);
  for (let i = 0; i < d.data.length; i += 4) { const v = 150 + Math.random() * 105; d.data[i] = v; d.data[i + 1] = v * 0.93; d.data[i + 2] = v * 0.8; d.data[i + 3] = Math.random() * 46; }
  nc.putImageData(d, 0, 0);
  ctx.fillStyle = ctx.createPattern(n, "repeat");
  ctx.globalCompositeOperation = "overlay";
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = "source-over";
}

export async function paint({ kind = "post", quote = "", title = "" }) {
  await fontsReady();
  const [W, H] = SIZES[kind];
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0e0b09";
  ctx.fillRect(0, 0, W, H);
  const img = await loadImg(`/images/journal/ink/quote-${kind}.webp`);
  if (img) { ctx.globalAlpha = 0.95; cover(ctx, img, 0, 0, W, H); ctx.globalAlpha = 1; }
  const scrim = ctx.createLinearGradient(0, 0, 0, H);
  scrim.addColorStop(0, "rgba(14,11,9,0.25)");
  scrim.addColorStop(0.35, "rgba(14,11,9,0.7)");
  scrim.addColorStop(1, "rgba(14,11,9,0.96)");
  ctx.fillStyle = scrim;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W * 0.2, H * 1.02, 0, W * 0.2, H * 1.02, W * 0.95);
  glow.addColorStop(0, "rgba(232,84,44,0.55)");
  glow.addColorStop(1, "rgba(232,84,44,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  const pad = 96;
  const maxW = W - pad * 2;
  ctx.direction = "rtl";
  ctx.textAlign = "right";
  const size = fit(ctx, quote, DISPLAY, 700, maxW, kind === "story" ? 118 : 100, 52, kind === "story" ? 8 : 6);
  const lines = wrap(ctx, quote, maxW);
  const lh = size * 1.5;
  const block = lines.length * lh;
  const top = (H - block) / 2 - (kind === "story" ? 40 : 30);
  // the ember mark
  ctx.fillStyle = EMBER;
  ctx.shadowColor = "rgba(255,122,69,0.9)";
  ctx.shadowBlur = 30;
  ctx.fillRect(W - pad - 90, top - 50, 90, 6);
  ctx.shadowBlur = 0;
  ctx.fillStyle = CREAM;
  let y = top + size;
  for (const l of lines) { ctx.fillText(l, W - pad, y); y += lh; }
  if (title) {
    ctx.fillStyle = EMBER2;
    const ts = fit(ctx, title, BODY, 500, maxW, 30, 22, 2);
    let ty = H - 250;
    for (const l of wrap(ctx, title, maxW)) { ctx.fillText(l, W - pad, ty); ty += ts * 1.5; }
  }
  ctx.fillStyle = "rgba(242,234,223,0.16)";
  ctx.fillRect(pad, H - 150, W - pad * 2, 1);
  ctx.fillStyle = CREAM;
  ctx.font = `700 46px ${DISPLAY}`;
  ctx.fillText("مجلة طلاقة", W - pad, H - 84);
  ctx.direction = "ltr";
  ctx.textAlign = "left";
  ctx.globalAlpha = 0.65;
  ctx.font = `500 26px ${BODY}`;
  ctx.fillText("fluentia.academy/journal", pad, H - 90);
  ctx.globalAlpha = 1;
  grain(ctx, W, H);
  return canvas;
}

export function toBlob(canvas) {
  return new Promise((resolve) => { try { canvas.toBlob((b) => resolve(b), "image/png"); } catch { resolve(null); } });
}
