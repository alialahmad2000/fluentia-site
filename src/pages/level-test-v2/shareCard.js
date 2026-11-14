/* ============================================================================
 * The 1080×1920 share card (stories size), drawn on a canvas so it works
 * offline and needs no server. Same composition as the result card: the sun
 * on the learner's level over a dawn horizon. No name, no phone, no score —
 * only the level, so nobody shares more than they meant to.
 * ========================================================================== */
import { sunPoint } from './SunMeter';

const CEFR = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'];

export async function drawShareCard({ level, name, life }) {
  const W = 1080; const H = 1920;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  try {
    await Promise.all([
      document.fonts.load('800 120px Kufam', 'طلاقة'),
      document.fonts.load('800 300px "Barlow Condensed"', 'B1'),
      document.fonts.load('400 40px "Readex Pro"', 'مستوى'),
    ]);
  } catch { /* system fallback */ }

  // night → dawn
  const bg = x.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#060914'); bg.addColorStop(0.55, '#0b1024'); bg.addColorStop(1, '#18204a');
  x.fillStyle = bg; x.fillRect(0, 0, W, H);

  // the meter, scaled into the middle band
  const MW = 960; const MH = 600; const ox = 60; const oy = 640;
  const horizon = oy + MH * 0.8;
  const [sx0, sy0] = sunPoint(level.i, MW, MH); const sx = ox + sx0; const sy = oy + sy0;
  const glow = x.createRadialGradient(sx, sy, 10, sx, sy, 900);
  const w = 0.25 + level.i * 0.13;
  glow.addColorStop(0, `rgba(255,181,71,${w})`); glow.addColorStop(0.35, `rgba(255,138,76,${w * 0.45})`); glow.addColorStop(1, 'rgba(11,16,36,0)');
  x.save(); x.beginPath(); x.rect(0, 0, W, horizon); x.clip();
  x.fillStyle = glow; x.fillRect(0, 0, W, horizon);
  // dotted path
  x.strokeStyle = 'rgba(186,230,253,.25)'; x.lineWidth = 4; x.setLineDash([6, 16]); x.lineCap = 'round';
  x.beginPath();
  for (let k = 0; k <= 40; k++) { const [px, py] = sunPoint(k / 8, MW, MH); k ? x.lineTo(ox + px, oy + py) : x.moveTo(ox + px, oy + py); }
  x.stroke(); x.setLineDash([]);
  CEFR.forEach((code, i) => {
    const [px, py] = sunPoint(i, MW, MH);
    x.fillStyle = i <= level.i ? '#ffb547' : 'rgba(186,230,253,.4)';
    x.beginPath(); x.arc(ox + px, oy + py, 10, 0, Math.PI * 2); x.fill();
    x.font = '800 38px "Barlow Condensed", "Arial Narrow", sans-serif'; x.textAlign = 'center'; x.direction = 'ltr';
    x.fillStyle = i === level.i ? '#ffb547' : 'rgba(246,241,232,.5)';
    x.fillText(code, ox + px, i === level.i ? oy + py + 92 : oy + py - 30);
  });
  const halo = x.createRadialGradient(sx, sy, 0, sx, sy, 130);
  halo.addColorStop(0, 'rgba(255,181,71,.6)'); halo.addColorStop(1, 'rgba(255,181,71,0)');
  x.fillStyle = halo; x.beginPath(); x.arc(sx, sy, 130, 0, Math.PI * 2); x.fill();
  const sun = x.createRadialGradient(sx, sy, 0, sx, sy, 46);
  sun.addColorStop(0, '#fff4dc'); sun.addColorStop(0.45, '#ffd08a'); sun.addColorStop(1, '#ffb547');
  x.fillStyle = sun; x.beginPath(); x.arc(sx, sy, 46, 0, Math.PI * 2); x.fill();
  x.restore();
  x.strokeStyle = 'rgba(255,181,71,.6)'; x.lineWidth = 4; x.beginPath(); x.moveTo(0, horizon); x.lineTo(W, horizon); x.stroke();

  // text
  x.direction = 'rtl'; x.textAlign = 'right';
  x.fillStyle = 'rgba(246,241,232,.72)'; x.font = '400 44px "Readex Pro", Tajawal, sans-serif';
  x.fillText('مستواي في الإنجليزي', W - 90, 250);
  x.fillStyle = '#f6f1e8';
  let fs = 104; // shrink long names ("ما قبل الخطوة الأولى") to the card width
  do { x.font = `800 ${fs}px Kufam, "Readex Pro", sans-serif`; fs -= 4; } while (fs > 56 && x.measureText(name || level.ar).width > W - 180);
  x.fillText(name || level.ar, W - 90, 400);
  x.direction = 'ltr'; x.textAlign = 'left'; x.fillStyle = '#ffb547'; x.font = '800 230px "Barlow Condensed", "Arial Narrow", sans-serif';
  x.fillText(level.cefr, 90, 610);

  x.direction = 'rtl'; x.textAlign = 'right';
  x.fillStyle = 'rgba(246,241,232,.82)'; x.font = '400 44px "Readex Pro", Tajawal, sans-serif';
  wrap(x, life, W - 90, horizon + 150, W - 180, 70);

  x.fillStyle = '#f6f1e8'; x.font = '800 64px Kufam, sans-serif';
  x.fillText('طلاقة', W - 90, H - 200);
  x.fillStyle = 'rgba(246,241,232,.65)'; x.font = '400 38px "Readex Pro", sans-serif';
  x.fillText('اختبار المستوى مجاناً', W - 90, H - 130);
  x.direction = 'ltr'; x.textAlign = 'left'; x.fillStyle = '#bae6fd'; x.font = '500 38px Inter, sans-serif';
  x.fillText('fluentia.academy/level-test', 90, H - 130);

  return new Promise((res) => c.toBlob((b) => res(b), 'image/png'));
}

function wrap(x, text, right, top, max, lh) {
  const words = String(text || '').split(/\s+/);
  let line = ''; let y = top;
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (x.measureText(t).width > max && line) { x.fillText(line, right, y); line = w; y += lh; } else line = t;
  }
  if (line) x.fillText(line, right, y);
}
