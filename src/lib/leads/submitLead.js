/**
 * Lead-form helpers shared by /start (StartPage) and /join (JoinPage).
 * Extracted verbatim from StartPage.jsx — the submit cascade itself
 * (GA4 → TikTok pixel → Events API → lead-intake/leads) lives in
 * src/utils/tracking.js and is re-exported here so a page imports one module.
 */
import { getSource } from '../../utils/tracking';

export { fireLeadTracking } from '../../utils/tracking';

// Strip to digits, drop leading 0 (user might type "05..." or "5..."),
// return the 9-digit Saudi mobile suffix (starts with 5).
export function stripPhone(raw) {
  let d = String(raw || '').replace(/\D/g, '');
  if (d.startsWith('966')) d = d.slice(3);
  if (d.startsWith('0')) d = d.slice(1);
  return d.slice(0, 9);
}

// Back to Saudi local (05XXXXXXXX) format — used in WA message so
// trainer's template parser keeps working.
export function toLocalPhone(digits) {
  return digits ? '0' + digits : '';
}

export function getUTM() {
  const p = new URLSearchParams(window.location.search);
  return {
    source:   p.get('utm_source')   || 'direct',
    medium:   p.get('utm_medium')   || '',
    campaign: p.get('utm_campaign') || '',
  };
}

export function buildWAMessage({ name, phoneLocal, path, pkgName, pkgPrice, goal, utm }) {
  const sourceLabel = getSource();
  return (
    `السلام عليكم، أبي أحجز لقاء مبدئي مجاني\n` +
    `الاسم: ${name}\n` +
    `الجوال: ${phoneLocal}\n` +
    `المسار: ${path}\n` +
    // No price when the visitor left the package to the first meeting (/join).
    `الباقة: ${pkgName}${pkgPrice ? ` (${pkgPrice} ر.س)` : ''}\n` +
    (goal ? `الهدف: ${goal}\n` : '') +
    `المصدر: ${sourceLabel}` +
    (utm.campaign ? ` · ${utm.campaign}` : '')
  );
}

// Arabic-Indic (٠-٩) and Persian (۰-۹) digits → ASCII. stripPhone's \D would
// otherwise drop them, and a phone typed on an Arabic keyboard would vanish.
export function toAsciiDigits(raw) {
  return String(raw || '').replace(/[\u0660-\u0669\u06F0-\u06F9]/g, (d) =>
    String(d.charCodeAt(0) & 0xf));
}
