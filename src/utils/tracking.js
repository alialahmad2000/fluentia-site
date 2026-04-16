/**
 * Shared ad-tracking + lead-persistence helpers.
 * Extracted from App.jsx so /start (StartPage.jsx) and / (HomePage)
 * can both call exactly the same code path — never duplicate tracking logic.
 */
import { getStoredRef, getVisitorId } from './affiliateTracking';

export const UTM_MAP = {
  tiktok:    'تيك توك',
  google:    'إعلان جوجل',
  instagram: 'انستقرام',
  twitter:   'تويتر',
  snapchat:  'سناب شات',
  facebook:  'فيسبوك',
  whatsapp:  'واتساب',
  telegram:  'تيليجرام',
  organic:   'بحث مباشر',
};

export function getSource() {
  const params = new URLSearchParams(window.location.search);
  const utm = params.get('utm_source') || sessionStorage.getItem('utm_source');
  return UTM_MAP[utm?.toLowerCase()] || 'مباشر';
}

export const WA_BASE = 'https://wa.me/966558669974?text=';
export const WA_DEFAULT = WA_BASE + encodeURIComponent('السلام عليكم، أبي أحجز لقاء مبدئي مجاني مع المدرب');
export const TT_URL = 'https://www.tiktok.com/@fluentia_';
export const IG_URL = 'https://www.instagram.com/fluentia__';

export const SUPABASE_URL = 'https://nmjexpuycmqcxuxljier.supabase.co';
export const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tamV4cHV5Y21xY3h1eGxqaWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMjU2MTgsImV4cCI6MjA4ODcwMTYxOH0.Lznjnw2Pmrr04tFjQD6hRfWp-12JlRagZaCmo59KG8A';

/**
 * Normalize a Saudi phone to strict E.164: `+966XXXXXXXXX` (13 chars total).
 * Handles: `0XXXXXXXXX`, `XXXXXXXXX`, `966XXXXXXXXX`, `+966XXXXXXXXX`,
 * with or without spaces / dashes. Returns empty string for empty input.
 * Callers should guard on `isValidE164SA()` before sending to ad platforms.
 */
export function normalizePhoneSA(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('966')) return '+' + digits;
  if (digits.startsWith('0'))   return '+966' + digits.substring(1);
  return '+966' + digits;
}

export function isValidE164SA(e164) {
  return /^\+966[0-9]{9}$/.test(e164);
}

export async function saveLead({ name, phone, email, path, pkg, goal, source }) {
  try {
    const refCode = getStoredRef();
    let affiliateId = null;
    if (refCode) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/affiliates?ref_code=eq.${refCode}&status=eq.approved&select=id&limit=1`, {
        headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
      });
      const affs = await res.json();
      if (affs?.[0]?.id) affiliateId = affs[0].id;
    }
    const p = new URLSearchParams(window.location.search);
    await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        name: name || null,
        phone: phone || null,
        email: email || null,
        path: path || null,
        pkg: pkg || null,
        goal: goal || null,
        source: source || null,
        utm_source: p.get('utm_source') || null,
        utm_medium: p.get('utm_medium') || null,
        utm_campaign: p.get('utm_campaign') || null,
        ref_code: refCode || null,
        affiliate_id: affiliateId,
        first_click_at: refCode ? new Date().toISOString() : null,
        visitor_id: getVisitorId(),
      }),
    });
  } catch (e) { /* silent — don't break the form */ }
}

/**
 * Fires the full tracking cascade for a submitted lead:
 *  1. GA4 generate_lead + Google Ads conversion
 *  2. TikTok Pixel: identify (EMQ) → SubmitForm → Lead → CompleteRegistration
 *  3. TikTok Events API server-side (Lead + CompleteRegistration)
 *  4. Supabase lead persistence with affiliate attribution
 *
 * @param {object} data
 * @param {string} data.name     — full name
 * @param {string} data.phone    — Saudi local 05XXXXXXXX (10 digits)
 * @param {string} data.path     — 'تأسيس' | 'تطوير' | 'IELTS'
 * @param {string} data.pkg      — display name of package
 * @param {number} data.pkgPrice — numeric value in SAR for pixel value
 * @param {string} [data.goal]
 * @param {object} [data.utm]    — { source, medium, campaign }
 */
export async function fireLeadTracking({ name, phone, path, pkg, pkgPrice, goal, utm = {} }) {
  const eventId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // 1. GA4
  if (typeof window !== 'undefined' && window.gtag) {
    try {
      window.gtag('event', 'generate_lead', {
        event_category: 'form',
        event_label: 'start_page_form',
        path,
        package: pkg,
        source: utm.source || 'google_ads',
        value: pkgPrice,
        currency: 'SAR',
      });
      window.gtag('event', 'conversion', { send_to: 'AW-9314838750', value: 1.0, currency: 'SAR' });
    } catch (e) { console.error('GA4 error:', e); }
  }

  // 2. TikTok Pixel (client-side)
  // EMQ requires phone in strict E.164 (+966XXXXXXXXX, 13 chars) and
  // identify() MUST fire before any track() calls so the hashed phone is
  // attached to subsequent events.
  const phoneE164 = normalizePhoneSA(phone);
  const phoneValid = isValidE164SA(phoneE164);
  // Debug (visible in prod — helps validate EMQ via browser console):
  console.log('[TikTok EMQ] phone', { original: phone, e164: phoneE164, valid: phoneValid });

  if (typeof window !== 'undefined' && window.ttq) {
    try {
      if (phoneValid) {
        window.ttq.identify({ phone_number: phoneE164 });
      }
      const payload = {
        content_name:     'Fluentia Free Consultation',
        content_category: path || 'general',
        content_id:       'fluentia_lead_form',
        value:            pkgPrice,
        currency:         'SAR',
        event_id:         eventId,
      };
      window.ttq.track('SubmitForm',          payload);
      window.ttq.track('Lead',                { ...payload, content_name: 'Fluentia Registration' });
      window.ttq.track('CompleteRegistration',{ ...payload, content_name: 'Fluentia Registration' });
    } catch (e) { console.error('TikTok pixel error:', e); }
  }

  // 3. TikTok Events API (server-side, non-blocking)
  // Send phone in E.164 so server-side hashing matches the pixel's hashed phone
  // (pixel + server dedup on event_id AND match on hashed phone for higher EMQ).
  try {
    ['Lead', 'CompleteRegistration'].forEach(ev =>
      fetch(`${SUPABASE_URL}/functions/v1/tiktok-events-api`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name:  ev,
          event_id:    eventId,
          phone:       phoneValid ? phoneE164 : phone,
          external_id: phoneValid ? phoneE164 : phone,
          url:         window.location.href,
          user_agent:  navigator.userAgent,
          value:       pkgPrice,
          currency:    'SAR',
        }),
      }).then(r => r.json()).then(r => console.log('[TikTok Events API]', ev, r)).catch(() => {})
    );
  } catch (e) { /* silent */ }

  // 4. Supabase lead (with affiliate attribution)
  saveLead({ name, phone, email: null, path, pkg, goal, source: utm.source || 'start_page' });

  return eventId;
}
