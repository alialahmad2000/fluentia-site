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
  if (typeof window !== 'undefined' && window.ttq) {
    try {
      if (phone) {
        // EMQ: convert SA local 05XXXXXXXX to E.164 +9665XXXXXXXX
        window.ttq.identify({ phone_number: '+966' + phone.replace(/^0/, '') });
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
  try {
    ['Lead', 'CompleteRegistration'].forEach(ev =>
      fetch(`${SUPABASE_URL}/functions/v1/tiktok-events-api`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name:  ev,
          event_id:    eventId,
          phone,
          external_id: phone,
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
