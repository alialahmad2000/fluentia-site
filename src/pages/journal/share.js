/**
 * Share cards for «مجلة طلاقة», painted on a canvas in the article's own art.
 *
 *   story  1080×1920  (Instagram / Snapchat story)
 *   post   1080×1350  (4:5 feed post)
 *   og     1200×630   (link preview — generated once, offline, into public/og/journal/)
 *
 * The art is the page's own plate SVG (serialized and drawn as an image), so a
 * card always looks like the article it came from. CSS animations do not run
 * inside an <img>, and every element's base style is its finished state, so the
 * still frame is the finished drawing. Browser-only module: import it lazily.
 */

export const SIZES = {
  story: [1080, 1920],
  post: [1080, 1350],
  og: [1200, 630],
};

const CREAM = "#f3ede2";
const ICE = "#7dd3fc";
const GOLD = "#fbbf24";
const DISPLAY = '"Kufam", "Readex Pro Variable", system-ui, sans-serif';
const BODY = '"Readex Pro Variable", "Kufam", system-ui, sans-serif';

async function fontsReady() {
  if (!document.fonts || !document.fonts.load) return;
  try {
    await Promise.all([
      document.fonts.load(`800 64px ${DISPLAY}`, "طلاقة"),
      document.fonts.load(`400 32px ${BODY}`, "طلاقة"),
    ]);
  } catch { /* fall back to system fonts */ }
}

function svgImage(svgEl) {
  return new Promise((resolve) => {
    if (!svgEl) return resolve(null);
    try {
      const clone = svgEl.cloneNode(true);
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clone.setAttribute("width", "1200");
      clone.setAttribute("height", "800");
      const xml = new XMLSerializer().serializeToString(clone);
      const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml;charset=utf-8" }));
      const img = new Image();
      img.onload = () => { resolve(img); setTimeout(() => URL.revokeObjectURL(url), 1000); };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    } catch {
      resolve(null);
    }
  });
}

/** draw img to cover the box (like object-fit: cover) */
function cover(ctx, img, x, y, w, h) {
  const s = Math.max(w / img.width, h / img.height);
  const iw = img.width * s;
  const ih = img.height * s;
  ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
}

/** greedy word wrap for RTL Arabic; returns lines */
function wrap(ctx, text, maxW) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

/** biggest font size (step 2) at which text fits in maxLines */
function fit(ctx, text, family, weight, maxW, start, min, maxLines) {
  let size = start;
  for (; size > min; size -= 2) {
    ctx.font = `${weight} ${size}px ${family}`;
    if (wrap(ctx, text, maxW).length <= maxLines) break;
  }
  ctx.font = `${weight} ${size}px ${family}`;
  return size;
}

function background(ctx, W, H) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#060e1c");
  g.addColorStop(0.6, "#0b1830");
  g.addColorStop(1, "#1a2d50");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const r = ctx.createRadialGradient(W * 0.85, -H * 0.05, 0, W * 0.85, -H * 0.05, W);
  r.addColorStop(0, "rgba(56,189,248,0.14)");
  r.addColorStop(1, "rgba(56,189,248,0)");
  ctx.fillStyle = r;
  ctx.fillRect(0, 0, W, H);
}

function brand(ctx, W, y, pad, scale = 1) {
  ctx.save();
  ctx.fillStyle = CREAM;
  ctx.globalAlpha = 0.9;
  ctx.direction = "rtl";
  ctx.textAlign = "right";
  ctx.font = `800 ${Math.round(34 * scale)}px ${DISPLAY}`;
  ctx.fillText("مجلة طلاقة", W - pad, y);
  ctx.direction = "ltr";
  ctx.textAlign = "left";
  ctx.globalAlpha = 0.6;
  ctx.font = `500 ${Math.round(26 * scale)}px Inter, system-ui, sans-serif`;
  ctx.fillText("fluentia.academy/journal", pad, y);
  ctx.restore();
}

/**
 * paint({ kind, svgEl, quote, title, kicker }) → HTMLCanvasElement
 * kind "story" | "post": the quote is the hero. kind "og": the title is.
 */
export async function paint({ kind = "post", svgEl = null, quote = "", title = "", kicker = "" }) {
  await fontsReady();
  const [W, H] = SIZES[kind];
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  background(ctx, W, H);
  const art = await svgImage(svgEl);

  if (kind === "og") {
    const pad = 72;
    if (art) {
      // put the plate's motif (its --jr-fx focus) in the free left third
      const fx = parseFloat(svgEl.style.getPropertyValue("--jr-fx")) || 50;
      const s = Math.max(W / art.width, H / art.height);
      const iw = art.width * s;
      const ih = art.height * s;
      ctx.globalAlpha = 0.95;
      ctx.drawImage(art, W * 0.27 - (fx / 100) * iw, (H - ih) / 2, iw, ih);
      ctx.globalAlpha = 1;
    }
    // shade the right two-thirds, where the Arabic title sits
    const sh = ctx.createLinearGradient(W, 0, 0, 0);
    sh.addColorStop(0, "rgba(6,14,28,0.94)");
    sh.addColorStop(0.55, "rgba(6,14,28,0.78)");
    sh.addColorStop(1, "rgba(6,14,28,0.15)");
    ctx.fillStyle = sh;
    ctx.fillRect(0, 0, W, H);
    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.fillStyle = ICE;
    ctx.font = `600 28px ${BODY}`;
    ctx.fillText(kicker || "مجلة طلاقة", W - pad, pad + 24);
    const maxW = W * 0.6;
    const size = fit(ctx, title, DISPLAY, 800, maxW, 88, 40, 3);
    const lines = wrap(ctx, title, maxW);
    const lh = size * 1.5;
    let y = H / 2 - ((lines.length - 1) * lh) / 2 + size * 0.35;
    ctx.fillStyle = CREAM;
    ctx.shadowColor = "rgba(56,189,248,0.25)";
    ctx.shadowBlur = 30;
    for (const l of lines) { ctx.fillText(l, W - pad, y); y += lh; }
    ctx.shadowBlur = 0;
    brand(ctx, W, H - pad + 10, pad, 0.9);
    return canvas;
  }

  const pad = 96;
  const artH = kind === "story" ? H * 0.46 : H * 0.42;
  if (art) {
    cover(ctx, art, 0, 0, W, artH);
    const fade = ctx.createLinearGradient(0, artH * 0.35, 0, artH);
    fade.addColorStop(0, "rgba(6,14,28,0)");
    fade.addColorStop(1, "rgba(9,20,40,1)");
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, W, artH + 2);
  }
  ctx.direction = "rtl";
  ctx.textAlign = "right";
  const maxW = W - pad * 2;
  const size = fit(ctx, quote, DISPLAY, 800, maxW, kind === "story" ? 76 : 66, 40, kind === "story" ? 7 : 5);
  const lines = wrap(ctx, quote, maxW);
  const lh = size * 1.6;
  const blockH = lines.length * lh;
  const top = artH + (H - artH - 220 - blockH) / 2;
  // the one gold spark
  ctx.fillStyle = GOLD;
  ctx.shadowColor = "rgba(251,191,36,0.7)";
  ctx.shadowBlur = 24;
  ctx.beginPath();
  ctx.arc(W - pad - 6, top - 24, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = CREAM;
  let y = top + size;
  for (const l of lines) { ctx.fillText(l, W - pad, y); y += lh; }
  if (title) {
    ctx.fillStyle = ICE;
    ctx.globalAlpha = 0.85;
    const ts = fit(ctx, title, BODY, 500, maxW, 30, 22, 2);
    let ty = H - 210;
    for (const l of wrap(ctx, title, maxW)) { ctx.fillText(l, W - pad, ty); ty += ts * 1.5; }
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = "rgba(243,237,226,0.12)";
  ctx.fillRect(pad, H - 140, W - pad * 2, 1);
  brand(ctx, W, H - 84, pad);
  return canvas;
}

export function toBlob(canvas) {
  return new Promise((resolve) => {
    try { canvas.toBlob((b) => resolve(b), "image/png"); } catch { resolve(null); }
  });
}
