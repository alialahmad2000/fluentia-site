import React, { useEffect, useState } from 'react';
import { resultWhatsAppUrl, goalAr } from './submit';
import { track } from '../../lib/track';

/* The share link carries its own source, so a friend who arrives through it and
 * later takes the test or leaves a number is counted as utm_source=share. */
const SHARE_URL = 'https://fluentia.academy/level-test?utm_source=share&utm_medium=level_test&utm_campaign=result';

/** First person, so it reads right whoever sends it and to whomever. The level
 *  is included from A2 up — a Pre-A1/A1 result is not something most people
 *  want to broadcast, and a share nobody sends converts no one. */
function shareText(report) {
  const lvl = report.lvlIndex >= 2 ? ` وطلع مستواي ${report.level.cefr}` : '';
  return `اختبرت مستواي في الإنجليزي مع أكاديمية طلاقة (اختبار تكيّفي مجاني، 10 دقائق)${lvl}.`;
}


/* What each level actually means, in the site's honest voice — and written for
 * both genders rather than defaulting to the masculine. */
const MEANING = [
  {
    m: 'تعرف كلمات متفرقة، لكن تركيب جملة كاملة لسّا صعب. البداية الصحيحة معك من الصفر المرتّب — مو من النص.',
    f: 'تعرفين كلمات متفرقة، لكن تركيب جملة كاملة لسّا صعب. البداية الصحيحة معك من الصفر المرتّب — مو من النص.',
  },
  {
    m: 'تقدر تعرّف عن نفسك وتفهم جمل بسيطة. اللي ينقصك أساس ثابت في الأزمنة والمفردات اليومية.',
    f: 'تقدرين تعرّفين عن نفسك وتفهمين جمل بسيطة. اللي ينقصك أساس ثابت في الأزمنة والمفردات اليومية.',
  },
  {
    m: 'تمشّي حالك في المواقف اليومية المعروفة، بس تتوقف أول ما يتغيّر الموضوع. حاجزك الحقيقي: الطلاقة تحت الضغط.',
    f: 'تمشّين حالك في المواقف اليومية المعروفة، بس تتوقفين أول ما يتغيّر الموضوع. حاجزك الحقيقي: الطلاقة تحت الضغط.',
  },
  {
    m: 'تقدر تمشّي حوار كامل وتفهم النص العام، وأخطاؤك صارت في التراكيب الأدق. من هنا يبدأ التحوّل من «أفهم» إلى «أتكلم».',
    f: 'تقدرين تمشّين حوار كامل وتفهمين النص العام، وأخطاؤك صارت في التراكيب الأدق. من هنا يبدأ التحوّل من «أفهم» إلى «أتكلم».',
  },
  {
    m: 'تتعامل مع نقاش مهني وتفهم التفاصيل. الباقي عندك دقة ونبرة احترافية — مو أساسيات.',
    f: 'تتعاملين مع نقاش مهني وتفهمين التفاصيل. الباقي عندك دقة ونبرة احترافية — مو أساسيات.',
  },
  {
    m: 'مستواك متقدم فعلاً. الشغل الباقي تهذيب: الدقة، الأسلوب، والفروق الدقيقة في المعنى.',
    f: 'مستواك متقدم فعلاً. الشغل الباقي تهذيب: الدقة، الأسلوب، والفروق الدقيقة في المعنى.',
  },
];

const RING_R = 44;
const RING_C = 2 * Math.PI * RING_R;

export default function ResultScreen({ lead, report, saving }) {
  const [ringOn, setRingOn] = useState(false);
  const [barsOn, setBarsOn] = useState(false);

  useEffect(() => {
    const a = setTimeout(() => setRingOn(true), 120);
    const b = setTimeout(() => setBarsOn(true), 420);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);

  const L = report.level;
  const g = lead.gender === 'male' ? 'm' : 'f';
  const meaning = MEANING[report.lvlIndex][g];
  const filled = (report.lvlIndex + 1) / 6;

  const waUrl = resultWhatsAppUrl(lead, report);

  const [shared, setShared] = useState(false);
  const share = async () => {
    const text = shareText(report);
    try {
      if (navigator.share) {
        await navigator.share({ text, url: SHARE_URL });
        track('share', { method: 'web_share', content_type: 'level_test', item_id: report.level.cefr });
        setShared(true);
        return;
      }
    } catch (e) {
      if (e?.name === 'AbortError') return; // closed the share sheet — not a share
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${SHARE_URL}`)}`, '_blank', 'noopener');
    track('share', { method: 'whatsapp', content_type: 'level_test', item_id: report.level.cefr });
    setShared(true);
  };

  return (
    <div className="lt-in">
      <div className="lt-result-hero">
        <span className="lt-eyebrow">نتيجتك جاهزة</span>

        <div className="lt-level-ring">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <defs>
              {/* Symmetric on purpose: the arc only covers (level+1)/6 of the
                  circle, so an asymmetric gradient made a Pre-A1 ring sample
                  the far end and render beige instead of brand azure. */}
              <linearGradient id="ltGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#7dd3fc" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
            <circle className="lt-ring-bg" cx="50" cy="50" r={RING_R} />
            <circle
              className="lt-ring-fg"
              cx="50" cy="50" r={RING_R}
              strokeDasharray={RING_C}
              strokeDashoffset={ringOn ? RING_C * (1 - filled) : RING_C}
            />
          </svg>
          <div>
            <div className="lt-level-code">{L.code}</div>
            <div className="lt-level-cefr">{L.cefr}</div>
          </div>
        </div>

        <h1 className="lt-level-name">{L.ar}</h1>
        <p className="lt-level-sub">{meaning}</p>

        <div className={`lt-confidence ${report.confidence}`}>
          دقة التقييم: {report.confidenceAr}
        </div>
      </div>

      {report.borderline && report.alt && (
        <div className="lt-note">
          <p>
            <b>أنت على الحدود بين {L.cefr} و{report.alt.cefr}.</b>{' '}
            الاختبار وحده ما يحسمها — نأكدها في أول خمس دقائق من مكالمتك مع المدرّب، ونحطك في المستوى الصح من أول يوم.
          </p>
        </div>
      )}

      <div className="lt-card" style={{ marginTop: 18 }}>
        <h2 className="lt-h2">تفصيل مهاراتك</h2>
        <p className="lt-hint" style={{ marginBottom: 18 }}>
          النسبة محسوبة مقارنة بمستواك أنت — مو مقارنة بالجميع. يعني «قوي» تعني أقوى من بقية مهاراتك.
        </p>
        <div className="lt-skills">
          {report.skills.map((s) => (
            <div className="lt-skill-row" key={s.skill}>
              <span className="lt-skill-name">{s.ar}</span>
              <div className={`lt-skill-bar ${s.verdict}`}>
                <i style={{ width: barsOn ? `${Math.max(4, s.pct)}%` : '0%' }} />
              </div>
              <span className="lt-skill-pct">{s.pct}%</span>
            </div>
          ))}
        </div>

        <div className="lt-verdicts">
          <div className="lt-verdict good">
            <h4>✓ الأقوى عندك</h4>
            {/* Never claim "balanced" while the other card lists weak skills —
                if nothing stands out, name the best of what there is. */}
            <p>
              {report.strong.length
                ? report.strong.map((s) => s.ar).join(' · ')
                : report.weak.length
                  ? `أقرب مهارة للجاهزية: ${report.skills[0]?.ar || '—'}`
                  : 'مستواك متوازن في كل المهارات'}
            </p>
          </div>
          <div className="lt-verdict work">
            <h4>○ يحتاج شغل</h4>
            <p>{report.weak.length ? report.weak.map((s) => s.ar).join(' · ') : 'ما فيه مهارة متأخرة عن الباقي'}</p>
          </div>
        </div>

        {!report.listeningDone && (
          <p className="lt-hint" style={{ marginTop: 16 }}>
            قسم الاستماع ما تم — النتيجة محسوبة من بقية الأقسام.
          </p>
        )}
      </div>

      <div className="lt-card">
        <h2 className="lt-h2">خطوتك الجاية</h2>
        <p className="lt-lead" style={{ margin: '12px 0 4px', fontSize: '0.95rem' }}>
          مستواك يوديك لـ<b style={{ color: 'var(--lt-azure)' }}> مسار {L.track}</b>.
          أرسل نتيجتك لنا في واتساب، ونرد عليك بخطة واضحة: من وين تبدأ بالضبط، وكم تحتاج للمستوى اللي بعده.
        </p>

        {saving && (
          <div className="lt-sending"><span className="lt-spin" /> نحفظ نتيجتك…</div>
        )}

        <div className="lt-cta-block">
          <a
            className="lt-btn lt-btn-wa"
            data-cta="level_test_result"
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            أرسل نتيجتي في واتساب ←
          </a>
          <p className="lt-cta-note">
            نتيجتك محفوظة عندنا باسم {lead.name} — لو ما ضغطت الزر، بنتواصل معك على {lead.phone}.
          </p>
        </div>
      </div>

      <div className="lt-card">
        <h2 className="lt-h2">ملخّص سريع</h2>
        <div className="lt-facts" style={{ margin: '18px 0 0' }}>
          <div className="lt-fact"><b>{report.correct}/{report.total}</b><span>إجابة صحيحة</span></div>
          <div className="lt-fact"><b>{report.minutes}</b><span>دقيقة</span></div>
          <div className="lt-fact"><b>{goalAr(lead.goal)}</b><span>هدفك</span></div>
        </div>
        <p className="lt-hint" style={{ marginTop: 16 }}>
          هذا تقييم مبدئي دقيق، لكنه ما يغني عن المكالمة: النطق والطلاقة ما ينقاسان باختيار من متعدد.
        </p>
      </div>

      <div className="lt-card">
        <h2 className="lt-h2">{g === 'm' ? 'تعرف أحد' : 'تعرفين أحد'} يسأل عن مستواه؟</h2>
        <p className="lt-lead" style={{ margin: '12px 0 16px', fontSize: '0.95rem' }}>
          الاختبار مجاني ومفتوح لأي أحد — {g === 'm' ? 'شاركه' : 'شاركيه'} مع صديق أو زميل.
        </p>
        <button type="button" className="lt-btn lt-btn-ghost lt-btn-wide" onClick={share}>
          {shared ? 'تمت المشاركة ✓' : `${g === 'm' ? 'شارك' : 'شاركي'} الاختبار ←`}
        </button>
      </div>
    </div>
  );
}
