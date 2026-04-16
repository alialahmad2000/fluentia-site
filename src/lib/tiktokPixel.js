// src/lib/tiktokPixel.js
// TikTok Pixel helpers — guarantees identify() runs before track()
// and injects user_data into every event's context.user.
//
// All raw ttq.track() calls in this app must go through this module
// so the EMQ diagnostic ("email and phone are missing") does not
// regress silently on future edits.

/**
 * Normalize phone to E.164 format for Saudi Arabia.
 * Input variations: "0583662000", "583662000", "+966583662000",
 * "966583662000", "00966583662000"
 * Output: "+966XXXXXXXXX" (13 chars)
 */
export function normalizePhoneE164(rawPhone) {
  if (!rawPhone) return '';
  // Strip all non-digits
  let digits = String(rawPhone).replace(/\D/g, '');

  // Strip leading international prefix 00 if present (00966... -> 966...)
  if (digits.startsWith('00966')) digits = digits.slice(2);

  // Already has country code
  if (digits.startsWith('966') && digits.length === 12) {
    return '+' + digits;
  }

  // Starts with 0 (local format: 05XX...)
  if (digits.startsWith('0') && digits.length === 10) {
    return '+966' + digits.slice(1);
  }

  // Starts with 5, 9 digits (5XX...)
  if (digits.startsWith('5') && digits.length === 9) {
    return '+966' + digits;
  }

  // Fallback: if it's 9 digits, assume Saudi mobile missing country code
  if (digits.length === 9) {
    return '+966' + digits;
  }

  // If it already has + and looks valid, return as-is
  if (String(rawPhone).startsWith('+') && digits.length >= 11) {
    return '+' + digits;
  }

  // Unknown format — return as-is prefixed with + (TikTok will reject if
  // invalid, but try — raw string will still surface in diagnostics).
  return '+' + digits;
}

/**
 * Normalize email: trim + lowercase (TikTok requirement).
 */
export function normalizeEmail(rawEmail) {
  if (!rawEmail) return '';
  return String(rawEmail).trim().toLowerCase();
}

/**
 * SHA-256 hash using Web Crypto API (native, no dependencies).
 * TikTok requires hashed PII for best match quality.
 */
export async function sha256(text) {
  if (!text) return '';
  const msgBuffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Build TikTok user_data object with hashed PII.
 * Returns an object ready to pass as `context.user` in any track() call.
 */
export async function buildTikTokUserData({ email, phone, externalId }) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = normalizePhoneE164(phone);

  const hashedEmail = normalizedEmail ? await sha256(normalizedEmail) : undefined;
  const hashedPhone = normalizedPhone ? await sha256(normalizedPhone) : undefined;
  const hashedExternalId = externalId ? await sha256(String(externalId).toLowerCase()) : undefined;

  const userData = {};
  if (hashedEmail) userData.email = hashedEmail;
  if (hashedPhone) userData.phone_number = hashedPhone;
  if (hashedExternalId) userData.external_id = hashedExternalId;

  return userData;
}

/**
 * Fire TikTok events with user_data baked in.
 * Guarantees identify() is called before any track().
 *
 * @param {Object} params
 * @param {string} [params.email]       — raw email from form (optional)
 * @param {string} [params.phone]       — raw phone from form (optional — if absent, events fire without EMQ)
 * @param {string} [params.externalId]  — any unique user ID (defaults to phone)
 * @param {number} [params.value]       — transaction value (default 750)
 * @param {string} [params.currency]    — currency code (default 'SAR')
 * @param {string} [params.contentName] — event content name
 * @param {string} [params.contentCategory] — event content category
 * @param {string} [params.contentId]   — event content id
 * @param {string} [params.eventIdBase] — optional shared base for event_id (for server-side dedup)
 * @returns {Promise<string|null>} the base event_id used (caller can pass to Events API for dedup), null on failure
 */
export async function fireTikTokLeadEvents({
  email,
  phone,
  externalId,
  value = 750,
  currency = 'SAR',
  contentName = 'Fluentia Registration',
  contentCategory = 'English Course',
  contentId = 'fluentia_lead_form',
  eventIdBase,
} = {}) {
  if (typeof window === 'undefined' || !window.ttq) {
    if (typeof console !== 'undefined') console.warn('[TikTok] ttq not loaded — skipping events');
    return null;
  }

  try {
    // Build hashed user_data once — reused in all events
    const userData = await buildTikTokUserData({
      email,
      phone,
      externalId: externalId || phone, // fallback external_id = phone
    });

    // Debug log (stripped in prod by Vite's esbuild drop config)
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
      console.log('[TikTok Debug] User data built:', {
        hasEmail: !!userData.email,
        hasPhone: !!userData.phone_number,
        hasExternalId: !!userData.external_id,
        normalizedPhone: normalizePhoneE164(phone),
      });
    }

    // 1. CALL identify() FIRST — MUST come before any track()
    //    identify() persists user context for the session
    const identifyPayload = {};
    if (userData.email) identifyPayload.email = userData.email;
    if (userData.phone_number) identifyPayload.phone_number = userData.phone_number;
    if (userData.external_id) identifyPayload.external_id = userData.external_id;

    // Only call identify() if we actually have at least one piece of PII
    if (Object.keys(identifyPayload).length > 0) {
      window.ttq.identify(identifyPayload);
    }

    // 2. Shared event_id for deduplication with Events API.
    //    TikTok dedups on (event_name, event_id) pairs, so the same event_id
    //    can be reused across SubmitForm / Lead / CompleteRegistration without
    //    collision — and the server-side Events API uses this same id for
    //    pixel↔server dedup on Lead + CompleteRegistration.
    const baseId = eventIdBase || `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const baseProps = {
      content_name: contentName,
      content_category: contentCategory,
      content_id: contentId,
      value,
      currency,
      event_id: baseId,
    };

    const eventOptions = {
      event_id: baseId,
      context: { user: userData },
    };

    // 3. Fire SubmitForm — with user_data INLINE in context.user.
    //    Key fix: even if identify() was silently dropped, each event carries user_data.
    window.ttq.track('SubmitForm', baseProps, eventOptions);

    // 4. Fire Lead — same user_data
    window.ttq.track('Lead', baseProps, eventOptions);

    // 5. Fire CompleteRegistration
    window.ttq.track('CompleteRegistration', baseProps, eventOptions);

    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
      console.log('[TikTok Debug] Fired 3 events: SubmitForm, Lead, CompleteRegistration', { baseId });
    }

    return baseId;
  } catch (err) {
    if (typeof console !== 'undefined') console.error('[TikTok] Event firing failed:', err);
    // Non-blocking — don't break the form submission
    return null;
  }
}

/**
 * Fire upper-funnel ViewContent event on page load.
 * No PII is expected at this stage — kept here so src/ has zero raw ttq.track
 * calls outside this helper.
 */
export function fireTikTokViewContent({
  contentName = 'Fluentia Landing Page',
  contentCategory = 'education',
  contentType = 'product',
  contentId = 'fluentia_landing',
  value = 750,
  currency = 'SAR',
} = {}) {
  if (typeof window === 'undefined' || !window.ttq) return;
  try {
    window.ttq.track('ViewContent', {
      content_name: contentName,
      content_category: contentCategory,
      content_type: contentType,
      content_id: contentId,
      currency,
      value,
    });
  } catch (e) {
    if (typeof console !== 'undefined') console.error('TikTok ViewContent error:', e);
  }
}
