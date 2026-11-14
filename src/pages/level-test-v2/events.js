/* ============================================================================
 * Level test v2 — funnel events. Each fires ONCE per attempt (or per page
 * session for the view), deduplicated in sessionStorage, and carries an
 * event id so GA4 / TikTok can dedupe a retried call on their side too.
 *
 *   level_test_view · level_test_start · level_test_stage_complete
 *   level_test_contact_submitted (→ TikTok SubmitForm/Lead, GA4 generate_lead + Ads conversion)
 *   level_test_result_view · level_test_book_click (→ TikTok Contact) · level_test_share
 * ========================================================================== */
import { track } from '../../lib/track';
import { fireTikTokContact, fireTikTokLeadEvents, normalizePhoneE164 } from '../../lib/tiktokPixel';

/** Lead value for ad optimisation, unchanged from v1 (campaign playbook). */
const LEAD_VALUE_SAR = 1200;

function once(key) {
  try {
    const k = `lt2_ev:${key}`;
    if (sessionStorage.getItem(k)) return false;
    sessionStorage.setItem(k, '1');
    return true;
  } catch {
    // No storage (private mode): fall back to an in-memory guard.
    once.mem ??= new Set();
    if (once.mem.has(key)) return false;
    once.mem.add(key);
    return true;
  }
}

export function ltEvent(name, { attempt = 'page', key = '', ...params } = {}) {
  if (typeof window === 'undefined') return null;
  const dedup = `${name}:${attempt}:${key}`;
  if (!once(dedup)) return null;
  const eventId = `lt2_${attempt}_${name}${key ? `_${key}` : ''}`.slice(0, 120);
  track(name, { ...params, event_id: eventId, test_version: 'v2' });
  return eventId;
}

export function trackContact({ attempt, phone, result }) {
  const eventId = ltEvent('level_test_contact_submitted', { attempt, level: result.level.cefr, confidence: result.confidence });
  if (!eventId) return;
  try {
    window.gtag?.('event', 'generate_lead', { event_category: 'level_test', event_label: result.level.code, value: LEAD_VALUE_SAR, currency: 'SAR', event_id: eventId });
    window.gtag?.('event', 'conversion', { send_to: 'AW-9314838750', value: 1.0, currency: 'SAR', transaction_id: eventId });
  } catch { /* analytics only */ }
  try {
    const e164 = normalizePhoneE164(phone);
    fireTikTokLeadEvents({
      phone,
      externalId: e164 || phone,
      value: LEAD_VALUE_SAR,
      currency: 'SAR',
      contentName: 'Fluentia Level Test',
      contentCategory: result.level.cefr,
      contentId: 'fluentia_level_test',
      eventIdBase: eventId,
    });
  } catch { /* analytics only */ }
}

export function trackBookClick({ attempt, via }) {
  if (!ltEvent('level_test_book_click', { attempt, via })) return;
  try { fireTikTokContact({ contentId: 'fluentia_level_test_booking', contentName: 'Level test intro meeting' }); } catch { /* analytics only */ }
}
