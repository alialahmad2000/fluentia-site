/* ============================================================================
 * Level Test — delivery layer.
 * Three destinations, deliberately independent so one failing never costs the
 * lead:  (1) Supabase via the public edge function, (2) an email to Ali fired
 * by that same function, (3) the WhatsApp hand-off the student taps.
 * ========================================================================== */

import { buildWhatsAppUrl } from '../../lib/whatsapp';
import { SUPABASE_URL } from '../../utils/tracking';
import { getStoredRef, getVisitorId } from '../../utils/affiliateTracking';
import { fireTikTokLeadEvents, normalizePhoneE164 } from '../../lib/tiktokPixel';
import { getAttribution } from '../../lib/attribution';

const FN = `${SUPABASE_URL}/functions/v1/level-test-submit`;

/** Ad-platform value for a level-test lead. The hero tier (طلاقة) is the most
 *  common outcome of these conversations — see the lead-value note in the
 *  campaign playbook before changing it, since it steers ad optimisation. */
const LEAD_VALUE_SAR = 1200;

export const GOALS = [
  { id: 'work', ar: 'شغلي' },
  { id: 'study', ar: 'دراستي' },
  { id: 'ielts', ar: 'آيلتس' },
  { id: 'travel', ar: 'السفر' },
  { id: 'confidence', ar: 'ثقتي بنفسي' },
];

export const goalAr = (id) => GOALS.find((g) => g.id === id)?.ar || '—';

/** The homepage links here with a full-reload <a href>, which drops the query
 *  string — so the source comes from what attribution.js stored at landing.
 *  Before this, 0 of 34 level-test rows in 30 days had any source. */
function utm() {
  try {
    const { utm_source, utm_medium, utm_campaign } = getAttribution();
    return { utm_source, utm_medium, utm_campaign };
  } catch { return {}; }
}

/** Fire-and-forget: the exam must start even if the network is having a day. */
export async function startAttempt(lead) {
  try {
    const res = await fetch(FN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'start',
        name: lead.name,
        age: lead.age,
        gender: lead.gender,
        ref_code: getStoredRef() || null,
        visitor_id: getVisitorId(),
        ...utm(),
      }),
    });
    const data = await res.json();
    return data?.id || null;
  } catch { return null; }
}

export async function finishAttempt({ attemptId, lead, report }) {
  try {
    const res = await fetch(FN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'finish',
        attempt_id: attemptId,
        name: lead.name,
        age: lead.age,
        gender: lead.gender,
        phone: lead.phone,
        goal: lead.goal,
        level_code: report.level.code,
        level_index: report.lvlIndex,
        cefr: report.level.cefr,
        level_ar: report.level.ar,
        track: report.level.track,
        confidence: report.confidence,
        top_prob: report.topProb,
        alt_level: report.alt?.code || null,
        alt_prob: report.alt ? report.altProb : null,
        theta: report.theta,
        se: report.se,
        correct: report.correct,
        total: report.total,
        pct: report.pct,
        skills: report.skills,
        listening_done: report.listeningDone,
        writing: report.writing || null,
        writing_signals: report.writingSignals,
        minutes: report.minutes,
        left_page: report.leftPage,
        ref_code: getStoredRef() || null,
        visitor_id: getVisitorId(),
        ...utm(),
      }),
    });
    return await res.json().catch(() => ({}));
  } catch { return null; }
}

/** GA4 + TikTok. Never allowed to block or break the result screen. */
export function fireTracking(lead, report) {
  const eventId = `ltest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  try {
    if (window.gtag) {
      window.gtag('event', 'generate_lead', {
        event_category: 'level_test',
        event_label: report.level.code,
        value: LEAD_VALUE_SAR,
        currency: 'SAR',
      });
      window.gtag('event', 'conversion', { send_to: 'AW-9314838750', value: 1.0, currency: 'SAR' });
    }
  } catch { /* silent */ }

  try {
    const e164 = normalizePhoneE164(lead.phone);
    fireTikTokLeadEvents({
      phone: lead.phone,
      externalId: e164 || lead.phone,
      value: LEAD_VALUE_SAR,
      currency: 'SAR',
      contentName: 'Fluentia Level Test',
      contentCategory: report.level.cefr,
      contentId: 'fluentia_level_test',
      eventIdBase: eventId,
    });
  } catch { /* silent */ }

  return eventId;
}

/* ─── WhatsApp hand-off ─────────────────────────────────────────────────── */

const GENDER_AR = { male: 'ذكر', female: 'أنثى' };

export function buildResultMessage(lead, report) {
  const L = report.level;
  const lines = [
    'السلام عليكم 👋',
    'هذي نتيجة اختبار تحديد المستوى من موقع طلاقة:',
    '',
    `الاسم: ${lead.name}`,
    `الجوال: ${lead.phone}`,
    `العمر: ${lead.age}`,
    `الجنس: ${GENDER_AR[lead.gender] || '—'}`,
    `الهدف: ${goalAr(lead.goal)}`,
    '',
    `المستوى: ${L.code} · ${L.cefr} — ${L.ar}`,
    `المسار: ${L.track}`,
    `دقة التقييم: ${report.confidenceAr} (${report.topProb}%)`,
  ];

  if (report.borderline && report.alt) {
    lines.push(`ملاحظة: على الحدود مع ${report.alt.code} · ${report.alt.cefr} (${report.altProb}%)`);
  }

  lines.push(
    `الإجابات الصحيحة: ${report.correct} من ${report.total}`,
    `مدة الاختبار: ${report.minutes} دقيقة`,
    '',
    'المهارات:'
  );
  report.skills.forEach((s) => {
    const mark = s.verdict === 'strong' ? '↑' : s.verdict === 'weak' ? '↓' : '·';
    lines.push(`${mark} ${s.ar}: ${s.pct}% (${s.correct}/${s.total})`);
  });

  if (report.writing) {
    const sample = report.writing.length > 420 ? `${report.writing.slice(0, 420)}…` : report.writing;
    const sig = report.writingSignals;
    lines.push('', 'عينة الكتابة:', `"${sample}"`);
    if (sig) lines.push(`(${sig.words} كلمة · ${sig.sentences} جمل · روابط: ${sig.linkers})`);
  }

  lines.push('', 'أبي أعرف خطوتي الجاية 🌸');
  return lines.join('\n');
}

export function resultWhatsAppUrl(lead, report) {
  return buildWhatsAppUrl(buildResultMessage(lead, report));
}
