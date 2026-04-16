import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fireLeadTracking, getSource, WA_BASE } from '../utils/tracking';

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS (shared with future main landing redesign)
   ═══════════════════════════════════════════════════════════════ */
export const T = {
  // Backgrounds
  bg:     '#060e1c',
  bgAlt:  '#0a1225',
  bgCard: 'rgba(255,255,255,0.025)',
  bgCardHover: 'rgba(255,255,255,0.04)',

  // Text
  white: '#f8fafc',
  text:  '#cbd5e1',
  muted: '#7e8a9a',
  dim:   '#556677',

  // Brand
  sky:      '#38bdf8',
  skyLt:    '#7dd3fc',
  gold:     '#fbbf24',
  goldDk:   '#d97706',
  purple:   '#a855f7',
  purpleLt: '#c084fc',

  // Borders
  border:  'rgba(255,255,255,0.06)',
  borderH: 'rgba(56,189,248,0.25)',

  // Accents per tier
  selfStudy: '#94a3b8',
  asas:      '#64748b',
  talaqa:    '#38bdf8',
  tamayuz:   '#fbbf24',
  fardi:     '#a855f7',

  // Shadows
  shadowSky:    '0 20px 60px rgba(56,189,248,0.12)',
  shadowGold:   '0 20px 60px rgba(251,191,36,0.10)',
  shadowPurple: '0 20px 60px rgba(168,85,247,0.12)',
};

export const FONTS = {
  ar: "'Tajawal', sans-serif",
  en: "'Playfair Display', serif",
};

/* ═══════════════════════════════════════════════════════════════
   PACKAGES (source of truth — also drives form dropdown)
   ═══════════════════════════════════════════════════════════════ */
const PACKAGES = [
  {
    id: 'self_study',
    name: 'تعلم ذاتي',
    sub: 'للي يبي يبدأ بنفسه',
    price: 500,
    oldPrice: 700,
    tier: 'self_study',
    accent: T.selfStudy,
    badge: null,
    features: [
      'وصول كامل للمنصة الذكية',
      'منهج 6 مستويات (Pre-A1 → C1)',
      'تمارين قرامر + مفردات + قراءة',
      'مساعد AI للتدريب على المحادثة',
      'تقدّمك بنظام نقاط ومكافآت',
    ],
    cta: 'ابدأ بنفسك',
  },
  {
    id: 'asas',
    name: 'أساس',
    sub: 'للتطوير بوتيرة مريحة',
    price: 750,
    oldPrice: 1050,
    tier: 'asas',
    accent: T.asas,
    badge: null,
    features: [
      '8 حصص جماعية شهرياً',
      'حد أقصى 7 طلاب بالكلاس',
      'كل مزايا تعلم ذاتي',
      'تقييم شهري + متابعة من المدرب',
      'مجتمع تيليجرام داعم',
    ],
    cta: 'اختر أساس',
  },
  {
    id: 'talaqa',
    name: 'طلاقة',
    sub: 'الأنسب للتأسيس والتطوير',
    price: 1100,
    oldPrice: 1600,
    tier: 'talaqa',
    accent: T.talaqa,
    badge: 'الأكثر طلباً',
    popular: true,
    features: [
      'كل مزايا أساس',
      'متابعة يومية مع المدرب',
      'حصة فردية شهرية مع مدربك',
      'تقييم كل أسبوعين + تقرير شهري',
      'محتوى مسجل ترجعله أي وقت',
    ],
    cta: 'اختر طلاقة',
  },
  {
    id: 'tamayuz',
    name: 'تميّز',
    sub: 'نتائج مكثفة وسريعة',
    price: 1500,
    oldPrice: 2200,
    tier: 'tamayuz',
    accent: T.tamayuz,
    badge: 'أسرع تقدّم',
    features: [
      'كل مزايا طلاقة',
      '4 حصص فردية شهرياً',
      'متابعة يومية مكثفة',
      'تقييم أسبوعي + خطة تطوير شخصية',
      'بنك أسئلة حصري + مكتبة دروس كاملة',
    ],
    cta: 'اختر تميّز',
  },
  {
    id: 'fardi',
    name: 'فردي',
    sub: 'أقصى تركيز. أقصى نتائج',
    price: 2000,
    oldPrice: 2800,
    tier: 'fardi',
    accent: T.fardi,
    badge: '👑 VIP',
    premium: true,
    features: [
      'حصص فردية فقط (أنت ومدربك)',
      'منهج مخصص يتكيف معك',
      'متابعة يومية مباشرة',
      'تصحيح كتابي ونطق غير محدود',
      'أولوية في الرد + جلسة شهرية مع المؤسس',
    ],
    cta: 'احجز VIP',
  },
];

const PATHS = ['تأسيس', 'تطوير', 'IELTS'];

const TESTIMONIALS = [
  { name: 'الجوهرة', role: 'ثالث ثانوي',              quote: 'ما كنت أتكلم ولا أقرأ والحين أقدر أتكلم وأقرأ بأقل من ١٠ دقايق!' },
  { name: 'هوازن',   role: 'دورة IELTS',              quote: 'الدكتور علي يتميّز بأسلوبه الراقي والمحفّز. مثال في المهنية والتمكن العلمي.' },
  { name: 'لمى',     role: 'جامعة الملك عبدالعزيز',   quote: 'القرامر والأزمنة للحين أتذكرها! والأكسنت حلو ويعلمنا نطق الكلمات صح.' },
];

const FAQS = [
  { q: 'وش اللقاء المبدئي المجاني؟',
    a: 'لقاء مباشر مع المدرب — نفهم مستواك وأهدافك. وأنت تتعرف على أسلوب المدرب. بناءً عليه نقرر مع بعض إذا Fluentia المكان الصح لك.' },
  { q: 'كم عدد الطلاب بالكلاس؟',
    a: 'حد أقصى 7 طلاب فقط. مو 20 أو 30 مثل المعاهد الثانية.' },
  { q: 'هل أقدر أغير الباقة لاحقاً؟',
    a: 'نعم! الدفع شهري بدون أي التزام. تقدر ترفع باقتك أو تنزّلها أي وقت.' },
  { q: 'متى تبدأ الدورات؟',
    a: 'الكورسات تبدأ مع بداية كل شهر ميلادي. تقدر تنضم بأي وقت والمدرب يعوّضك.' },
  { q: 'جربت دورات قبل وما استفدت — ليش عندكم بيختلف؟',
    a: 'لأننا ندرس كل طالب بشكل فردي، نفهم شخصيته، ونحطه بالقروب اللي يناسبه. المدرب يتابعك يومياً. والمحتوى مصمم بعناية علمية.' },
];

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */

// Strip to digits, drop leading 0 (user might type "05..." or "5..."),
// return the 9-digit Saudi mobile suffix (starts with 5).
function stripPhone(raw) {
  let d = String(raw || '').replace(/\D/g, '');
  if (d.startsWith('966')) d = d.slice(3);
  if (d.startsWith('0')) d = d.slice(1);
  return d.slice(0, 9);
}

// Back to Saudi local (05XXXXXXXX) format — used in WA message so
// trainer's template parser keeps working.
function toLocalPhone(digits) {
  return digits ? '0' + digits : '';
}

function getUTM() {
  const p = new URLSearchParams(window.location.search);
  return {
    source:   p.get('utm_source')   || 'direct',
    medium:   p.get('utm_medium')   || '',
    campaign: p.get('utm_campaign') || '',
  };
}

function buildWAMessage({ name, phoneLocal, path, pkgName, pkgPrice, goal, utm }) {
  const sourceLabel = getSource();
  return (
    `السلام عليكم، أبي أحجز لقاء مبدئي مجاني\n` +
    `الاسم: ${name}\n` +
    `الجوال: ${phoneLocal}\n` +
    `المسار: ${path}\n` +
    `الباقة: ${pkgName} (${pkgPrice} ر.س)\n` +
    (goal ? `الهدف: ${goal}\n` : '') +
    `المصدر: ${sourceLabel}` +
    (utm.campaign ? ` · ${utm.campaign}` : '')
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function StartPage() {
  // Form state
  const [name, setName]     = useState('');
  const [phone, setPhone]   = useState(''); // 9-digit suffix after +966
  const [path, setPath]     = useState('');
  const [pkgId, setPkgId]   = useState('talaqa'); // default: most popular
  const [goal, setGoal]     = useState('');
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [utm, setUtm] = useState({ source: 'direct', medium: '', campaign: '' });

  // UI state
  const [openFAQ, setOpenFAQ] = useState(null);
  const [activeTestim, setActiveTestim] = useState(0);
  const [flashForm, setFlashForm] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);

  // Refs
  const heroRef = useRef(null);
  const formRef = useRef(null);
  const nameInputRef = useRef(null);

  // Derived
  const selectedPackage = PACKAGES.find(p => p.id === pkgId) || PACKAGES[2];
  const isNameValid  = name.trim().length >= 2;
  const isPhoneValid = phone.length === 9 && phone.startsWith('5');
  const isPathValid  = !!path;
  const canSubmit    = isNameValid && isPhoneValid && isPathValid && !submitting;

  /* ── PageView + UTM + TikTok page() ── */
  useEffect(() => {
    setUtm(getUTM());
    if (typeof window !== 'undefined' && window.ttq) {
      try { window.ttq.page(); } catch (e) {}
    }
  }, []);

  /* ── IELTS path → auto-select tamayuz ── */
  useEffect(() => {
    if (path === 'IELTS' && pkgId !== 'tamayuz' && pkgId !== 'fardi') {
      setPkgId('tamayuz');
    }
  }, [path]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Carousel auto-rotate ── */
  useEffect(() => {
    const id = setInterval(() => setActiveTestim(i => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(id);
  }, []);

  /* ── Hero form visibility observer (for floating WA button) ── */
  useEffect(() => {
    const el = formRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const o = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting), { threshold: 0.1 });
    o.observe(el);
    return () => o.disconnect();
  }, []);

  /* ── Package CTA: scroll + pre-select + flash + focus name ── */
  const jumpToForm = useCallback((id) => {
    setPkgId(id);
    setFlashForm(true);
    const el = formRef.current;
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => nameInputRef.current?.focus(), 600);
    setTimeout(() => setFlashForm(false), 1200);
  }, []);

  /* ── Submit ── */
  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ name: true, phone: true, path: true });
    if (!canSubmit) return;

    setSubmitting(true);
    const phoneLocal = toLocalPhone(phone);
    const pkg = selectedPackage;

    try {
      // Fire tracking cascade (GA4 + TikTok pixel + Events API + Supabase lead)
      await fireLeadTracking({
        name,
        phone: phoneLocal, // Saudi local — identify() converts to E.164 inside
        path,
        pkg: pkg.name,
        pkgPrice: pkg.price,
        goal,
        utm,
      });

      // Open WhatsApp with UTM-tagged message
      const msg = buildWAMessage({
        name,
        phoneLocal,
        path,
        pkgName: pkg.name,
        pkgPrice: pkg.price,
        goal,
        utm,
      });
      window.open(WA_BASE + encodeURIComponent(msg), '_blank');

      setSubmitted(true);
    } catch (err) {
      console.error('[StartPage] submit error:', err);
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Floating WA click ── */
  const handleFloatingWA = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      try { window.gtag('event', 'conversion', { send_to: 'AW-9314838750', value: 1.0, currency: 'SAR' }); } catch (e) {}
    }
    const src = getSource();
    const msg = `السلام عليكم، أبي أحجز لقاء مبدئي مجاني\nالمصدر: ${src}`;
    window.open(WA_BASE + encodeURIComponent(msg), '_blank');
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */

  return (
    <div
      dir="rtl"
      style={{
        minHeight: '100vh',
        background: T.bg,
        color: T.white,
        fontFamily: FONTS.ar,
        overflowX: 'hidden',
      }}
    >
      {/* Fonts + keyframes + media queries */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap');

        @keyframes textShine {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes waPulse {
          0%, 100% { transform: scale(1);   box-shadow: 0 4px 20px rgba(37,211,102,0.35); }
          50%      { transform: scale(1.06); box-shadow: 0 6px 28px rgba(37,211,102,0.55); }
        }
        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 0 1px rgba(56,189,248,0.3), 0 20px 60px rgba(56,189,248,0.18); }
          50%      { box-shadow: 0 0 0 1px rgba(56,189,248,0.55), 0 20px 80px rgba(56,189,248,0.32); }
        }
        @keyframes formFlash {
          0%, 100% { box-shadow: 0 0 0 0   rgba(56,189,248,0);   }
          50%      { box-shadow: 0 0 0 6px rgba(56,189,248,0.25); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        .sp-hero-grid { display: grid; grid-template-columns: 1fr; gap: 32px; }
        .sp-pkg-grid  { display: grid; grid-template-columns: 1fr; gap: 14px; }
        .sp-pkg-wrap  { overflow: visible; }
        .sp-why-grid  { display: grid; grid-template-columns: 1fr; gap: 14px; }
        .sp-cta-row   { display: flex; flex-direction: column; gap: 12px; }
        .sp-hero-text { order: 2; }
        .sp-hero-form { order: 1; }

        @media (min-width: 640px) {
          .sp-why-grid  { grid-template-columns: repeat(3, 1fr); gap: 16px; }
          .sp-pkg-grid  { grid-template-columns: repeat(3, 1fr); gap: 14px; }
          .sp-cta-row   { flex-direction: row; justify-content: center; gap: 14px; }
        }
        @media (min-width: 1024px) {
          .sp-hero-grid { grid-template-columns: 3fr 2fr; gap: 48px; align-items: center; }
          .sp-hero-text { order: 1; }
          .sp-hero-form { order: 2; }
          .sp-pkg-grid  { grid-template-columns: repeat(5, 1fr); gap: 14px; }
        }

        /* Mobile: package strip becomes horizontal-scroll snap */
        @media (max-width: 639px) {
          .sp-pkg-wrap  { overflow-x: auto; overflow-y: visible; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; padding-bottom: 8px; margin: 0 -20px; padding-left: 20px; padding-right: 20px; }
          .sp-pkg-grid  { display: flex; gap: 12px; grid-template-columns: none; width: max-content; }
          .sp-pkg-card  { scroll-snap-align: center; min-width: 78vw; max-width: 78vw; }
        }

        .sp-pkg-card:hover { transform: translateY(-4px); }

        /* Hide scrollbar on mobile scroll */
        .sp-pkg-wrap::-webkit-scrollbar { height: 4px; }
        .sp-pkg-wrap::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
      `}</style>

      {/* ─── 1. TOP TRUST STRIP ─── */}
      <div
        style={{
          background: T.bgAlt,
          borderBottom: `1px solid ${T.border}`,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 16px',
        }}
      >
        <span style={{ fontSize: 12, color: T.muted, textAlign: 'center' }}>
          🇸🇦 أكاديمية سعودية · مدربون متخصصون · بدون التزام
        </span>
      </div>

      {/* Mini nav */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(6,14,28,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${T.border}`,
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: FONTS.en, fontSize: 22, fontWeight: 900, color: T.sky }}>F</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: T.white }}>Fluentia</span>
        </Link>
        <Link to="/" style={{ fontSize: 12, color: T.skyLt, textDecoration: 'none', fontWeight: 500 }}>
          الصفحة الرئيسية →
        </Link>
      </nav>

      {/* ─── 2. HERO ─── */}
      <section
        ref={heroRef}
        style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px 56px', animation: 'fadeUp .6s ease-out' }}
      >
        <div className="sp-hero-grid">
          {/* LEFT: copy */}
          <div className="sp-hero-text">
            <div
              style={{
                display: 'inline-block',
                background: 'rgba(56,189,248,0.08)',
                border: '1px solid rgba(56,189,248,0.25)',
                color: T.sky,
                borderRadius: 100,
                padding: '5px 14px',
                fontSize: 11,
                fontWeight: 700,
                marginBottom: 18,
              }}
            >
              احجز لقاءك المبدئي المجاني
            </div>

            <h1
              style={{
                fontFamily: FONTS.ar,
                fontSize: 'clamp(36px, 7vw, 64px)',
                fontWeight: 900,
                lineHeight: 1.05,
                margin: 0,
                marginBottom: 16,
                color: T.white,
              }}
            >
              تكلّم إنجليزي{' '}
              <span
                style={{
                  background: `linear-gradient(90deg, ${T.sky}, ${T.skyLt}, ${T.white}, ${T.sky})`,
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'textShine 4s linear infinite',
                }}
              >
                بثقة
              </span>
            </h1>

            <p style={{ fontSize: 16, color: T.text, lineHeight: 1.8, marginBottom: 22 }}>
              مدربون سعوديون · مجموعات صغيرة (٧ طلاب) · متابعة يومية · 5 باقات تناسبك
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'grid', gap: 10 }}>
              {[
                'كلاس تجريبي مجاني مع المدرب',
                'منصة ذكية + AI لتدريب يومي',
                'نتائج تشوفها بالأرقام كل أسبوع',
              ].map(t => (
                <li key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: T.text }}>
                  <span style={{ color: T.sky, fontWeight: 900, fontSize: 16 }}>✓</span>
                  {t}
                </li>
              ))}
            </ul>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, fontSize: 13, color: T.muted, alignItems: 'center' }}>
              <span>⭐ 4.9</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>+50 طالب</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>معتمدون رسمياً</span>
            </div>
          </div>

          {/* RIGHT: form */}
          <div className="sp-hero-form">
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              id="start-form"
              data-page="start"
              style={{
                background: `linear-gradient(170deg, rgba(56,189,248,0.06), rgba(56,189,248,0.01))`,
                border: `1px solid rgba(56,189,248,0.2)`,
                borderRadius: 24,
                padding: 24,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                animation: flashForm ? 'formFlash 1.2s ease-out' : undefined,
              }}
            >
              {submitted ? (
                <SuccessCard onWA={handleFloatingWA} />
              ) : (
                <>
                  <h2 style={{ fontSize: 18, fontWeight: 900, color: T.white, marginTop: 0, marginBottom: 6, textAlign: 'center' }}>
                    سجّل بياناتك
                  </h2>
                  <p style={{ fontSize: 12, color: T.muted, marginTop: 0, marginBottom: 18, textAlign: 'center' }}>
                    نتواصل معك خلال ساعات قليلة
                  </p>

                  {/* Name */}
                  <Field label="الاسم الكامل" error={touched.name && !isNameValid ? 'الاسم لازم يكون حرفين على الأقل' : null}>
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      onBlur={() => setTouched(t => ({ ...t, name: true }))}
                      placeholder="اسمك الأول"
                      style={inputStyle}
                    />
                  </Field>

                  {/* Phone */}
                  <Field
                    label="رقم الجوال"
                    error={touched.phone && !isPhoneValid ? 'أدخل رقم سعودي يبدأ بـ 5 (9 أرقام)' : null}
                  >
                    <div style={{ position: 'relative', display: 'flex' }}>
                      <span
                        style={{
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          left: 0,
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 12px',
                          fontSize: 14,
                          fontWeight: 700,
                          color: T.muted,
                          background: 'rgba(255,255,255,0.04)',
                          borderInlineEnd: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '0 12px 12px 0',
                          userSelect: 'none',
                          direction: 'ltr',
                        }}
                      >
                        +966
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(stripPhone(e.target.value))}
                        onBlur={() => setTouched(t => ({ ...t, phone: true }))}
                        placeholder="5XXXXXXXX"
                        inputMode="tel"
                        style={{ ...inputStyle, paddingInlineStart: 72, direction: 'ltr', textAlign: 'left' }}
                      />
                    </div>
                  </Field>

                  {/* Path */}
                  <Field label="المسار" error={touched.path && !isPathValid ? 'اختر المسار' : null}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {PATHS.map((p, idx) => (
                        <button
                          type="button"
                          key={p}
                          onClick={() => { setPath(p); setTouched(t => ({ ...t, path: true })); }}
                          style={pillStyle(path === p)}
                        >
                          {['📗', '📘', '📙'][idx]} {p}
                        </button>
                      ))}
                    </div>
                  </Field>

                  {/* Package */}
                  <Field label="الباقة المهتم فيها">
                    <select
                      value={pkgId}
                      onChange={e => setPkgId(e.target.value)}
                      style={{
                        ...inputStyle,
                        appearance: 'auto',
                        cursor: 'pointer',
                        colorScheme: 'dark',
                        backgroundColor: '#0d1a2d',
                      }}
                    >
                      {PACKAGES.map(p => (
                        <option
                          key={p.id}
                          value={p.id}
                          style={{ background: '#0d1a2d', color: '#f8fafc' }}
                        >
                          {p.name} — {p.price} ر.س/شهرياً
                        </option>
                      ))}
                    </select>
                  </Field>

                  {/* Submit */}
                  <button
                    type="submit"
                    id="start-submit-btn"
                    data-action="submit-lead"
                    data-tracking="google-ads-start"
                    disabled={!canSubmit}
                    style={{
                      width: '100%',
                      height: 56,
                      border: 'none',
                      borderRadius: 14,
                      marginTop: 8,
                      fontSize: 16,
                      fontWeight: 800,
                      fontFamily: FONTS.ar,
                      cursor: canSubmit ? 'pointer' : 'not-allowed',
                      background: canSubmit
                        ? `linear-gradient(135deg, ${T.sky}, ${T.skyLt})`
                        : 'rgba(56,189,248,0.15)',
                      color: canSubmit ? '#0a1225' : T.muted,
                      transition: 'all .25s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    {submitting ? (
                      <>
                        <span style={spinnerStyle} />
                        جاري الإرسال...
                      </>
                    ) : (
                      <>احجز لقاءك المجاني ←</>
                    )}
                  </button>

                  <p style={{ textAlign: 'center', fontSize: 12, color: T.muted, marginTop: 14, marginBottom: 6 }}>
                    أو اضغط لـ{' '}
                    <a
                      href="#wa"
                      onClick={(e) => { e.preventDefault(); handleFloatingWA(); }}
                      style={{ color: T.skyLt, textDecoration: 'underline' }}
                    >
                      محادثة واتساب مباشرة
                    </a>
                  </p>
                  <p style={{ textAlign: 'center', fontSize: 11, color: T.dim, margin: 0 }}>
                    🔒 معلوماتك آمنة — لن نشاركها مع أحد
                  </p>
                </>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* ─── 3. WHY FLUENTIA ─── */}
      <Section title="ليش Fluentia مختلفة؟">
        <div className="sp-why-grid">
          {[
            { icon: '👥', title: '7 طلاب فقط بالكلاس',        desc: 'لضمان متابعة فردية لكل طالب' },
            { icon: '📅', title: 'متابعة يومية مع المدرب',   desc: 'مو فقط في الكلاس — يومياً عبر تيليجرام' },
            { icon: '🇸🇦', title: 'مدربون سعوديون متخصصون', desc: 'يفهمون لهجتك وثقافتك ومشاكلك' },
          ].map(c => (
            <div
              key={c.title}
              style={{
                background: T.bgCard,
                border: `1px solid ${T.border}`,
                borderRadius: 20,
                padding: 28,
                transition: 'all .4s',
                cursor: 'default',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = T.borderH; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';  e.currentTarget.style.borderColor = T.border; }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>{c.icon}</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: T.white, marginBottom: 6 }}>{c.title}</div>
              <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.7 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── 4. PACKAGES ─── */}
      <section id="packages" style={{ padding: '24px 20px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h2 style={{ fontFamily: FONTS.en, fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, color: T.white, margin: 0 }}>
            <span
              style={{
                background: `linear-gradient(90deg, ${T.sky}, ${T.skyLt})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >5</span>{' '}
            <span style={{ fontFamily: FONTS.ar }}>باقات — اختر اللي يناسبك</span>
          </h2>
          <p style={{ fontSize: 14, color: T.muted, marginTop: 10 }}>
            لقاء مبدئي مجاني · دفع شهري · بدون التزام
          </p>
        </div>

        <div className="sp-pkg-wrap">
          <div className="sp-pkg-grid">
            {PACKAGES.map(pkg => (
              <PackageCard key={pkg.id} pkg={pkg} onClick={() => jumpToForm(pkg.id)} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. SOCIAL PROOF ─── */}
      <Section title="قصص نجاح حقيقية" bg={T.bgAlt}>
        <div
          style={{
            background: T.bgCard,
            border: `1px solid ${T.border}`,
            borderRadius: 20,
            padding: '36px 28px',
            maxWidth: 720,
            margin: '0 auto',
            position: 'relative',
            minHeight: 200,
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 10,
              right: 20,
              fontFamily: FONTS.en,
              fontSize: 80,
              lineHeight: 1,
              color: T.sky,
              opacity: 0.12,
              userSelect: 'none',
            }}
          >
            "
          </span>
          <blockquote
            key={activeTestim}
            style={{
              margin: 0,
              fontSize: 16,
              lineHeight: 1.9,
              color: T.text,
              fontStyle: 'italic',
              animation: 'fadeUp .4s ease-out',
            }}
          >
            {TESTIMONIALS[activeTestim].quote}
          </blockquote>
          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.white }}>{TESTIMONIALS[activeTestim].name}</div>
              <div style={{ fontSize: 12, color: T.muted }}>{TESTIMONIALS[activeTestim].role}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestim(i)}
                  aria-label={`شهادة ${i + 1}`}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    background: i === activeTestim ? T.sky : 'rgba(255,255,255,0.15)',
                    transition: 'background .2s',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ─── 6. FAQ ─── */}
      <Section title="أسئلة شائعة">
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {FAQS.map((f, i) => {
            const open = openFAQ === i;
            return (
              <div
                key={i}
                style={{
                  border: `1px solid ${T.border}`,
                  borderRadius: 14,
                  marginBottom: 10,
                  overflow: 'hidden',
                  background: T.bgCard,
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFAQ(open ? null : i)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    padding: '16px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: T.white,
                    fontSize: 15,
                    fontWeight: 700,
                    fontFamily: FONTS.ar,
                    cursor: 'pointer',
                    textAlign: 'right',
                  }}
                >
                  <span>{f.q}</span>
                  <span
                    style={{
                      color: T.sky,
                      fontSize: 20,
                      lineHeight: 1,
                      transition: 'transform .3s',
                      transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
                    }}
                  >
                    ‹
                  </span>
                </button>
                <div
                  style={{
                    maxHeight: open ? 240 : 0,
                    overflow: 'hidden',
                    transition: 'max-height .3s ease',
                  }}
                >
                  <div style={{ padding: '0 18px 18px', fontSize: 14, color: T.text, lineHeight: 1.85 }}>
                    {f.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ─── 7. FINAL CTA ─── */}
      <section
        style={{
          padding: '56px 20px',
          textAlign: 'center',
          background: `radial-gradient(ellipse at center, rgba(56,189,248,0.08), transparent 60%)`,
        }}
      >
        <h2 style={{ fontFamily: FONTS.en, fontSize: 40, fontWeight: 900, color: T.white, margin: 0, marginBottom: 10 }}>
          جاهز تبدأ؟
        </h2>
        <p style={{ fontSize: 15, color: T.muted, marginBottom: 28 }}>
          احجز لقاءك المبدئي المجاني الآن — بدون أي التزام
        </p>
        <div className="sp-cta-row" style={{ alignItems: 'center' }}>
          <button
            onClick={() => { formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => nameInputRef.current?.focus(), 600); }}
            style={{
              padding: '16px 30px',
              borderRadius: 14,
              border: 'none',
              background: `linear-gradient(135deg, ${T.sky}, ${T.skyLt})`,
              color: '#0a1225',
              fontSize: 15,
              fontWeight: 800,
              fontFamily: FONTS.ar,
              cursor: 'pointer',
            }}
          >
            احجز لقاءك المجاني ←
          </button>
          <button
            onClick={handleFloatingWA}
            style={{
              padding: '16px 30px',
              borderRadius: 14,
              border: '1px solid #25D366',
              background: 'transparent',
              color: '#25D366',
              fontSize: 15,
              fontWeight: 700,
              fontFamily: FONTS.ar,
              cursor: 'pointer',
            }}
          >
            💬 واتساب مباشر
          </button>
        </div>
      </section>

      {/* ─── 8. FOOTER ─── */}
      <footer
        style={{
          padding: '28px 20px',
          borderTop: `1px solid ${T.border}`,
          textAlign: 'center',
          background: T.bgAlt,
        }}
      >
        <div style={{ fontFamily: FONTS.en, fontSize: 22, fontWeight: 900, marginBottom: 6 }}>
          <span style={{ color: T.sky }}>F</span>
          <span style={{ color: T.white }}>luentia</span>
        </div>
        <div style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>
          © 2026 Fluentia Academy — جميع الحقوق محفوظة
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, fontSize: 12 }}>
          <a href="https://www.tiktok.com/@fluentia_"    target="_blank" rel="noreferrer" style={footerLinkStyle}>تيك توك</a>
          <a href="https://www.instagram.com/fluentia__" target="_blank" rel="noreferrer" style={footerLinkStyle}>انستجرام</a>
          <a href="#wa" onClick={(e) => { e.preventDefault(); handleFloatingWA(); }} style={footerLinkStyle}>واتساب</a>
        </div>
      </footer>

      {/* FLOATING WA BUTTON — hidden when hero form in viewport */}
      <button
        type="button"
        onClick={handleFloatingWA}
        aria-label="واتساب مباشر"
        style={{
          position: 'fixed',
          bottom: 22,
          left: 22,  // RTL: visual = left edge of screen
          width: 60,
          height: 60,
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          background: 'linear-gradient(135deg, #25D366, #128C7E)',
          color: '#fff',
          fontSize: 28,
          boxShadow: '0 4px 20px rgba(37,211,102,0.35)',
          zIndex: 999,
          opacity: heroVisible ? 0 : 1,
          pointerEvents: heroVisible ? 'none' : 'auto',
          transform: heroVisible ? 'scale(0.8)' : 'scale(1)',
          transition: 'opacity .35s, transform .35s',
          animation: heroVisible ? 'none' : 'waPulse 2.4s ease-in-out infinite',
        }}
      >
        💬
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS + STYLES
   ═══════════════════════════════════════════════════════════════ */

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 6 }}>
        {label}
      </label>
      {children}
      {error && (
        <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4, fontFamily: FONTS.ar }}>{error}</div>
      )}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  height: 48,
  padding: '0 14px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(255,255,255,0.04)',
  color: '#fff',
  fontSize: 15,
  fontFamily: FONTS.ar,
  outline: 'none',
  boxSizing: 'border-box',
  direction: 'rtl',
};

function pillStyle(active) {
  return {
    padding: '10px 16px',
    height: 40,
    borderRadius: 100,
    border: active ? `1.5px solid ${T.sky}` : `1px solid rgba(255,255,255,0.12)`,
    background: active ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.03)',
    color: active ? T.sky : T.text,
    fontWeight: active ? 700 : 500,
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: FONTS.ar,
    transition: 'all .2s',
  };
}

const spinnerStyle = {
  width: 16,
  height: 16,
  border: '2px solid rgba(10,18,37,0.3)',
  borderTopColor: '#0a1225',
  borderRadius: '50%',
  display: 'inline-block',
  animation: 'spin 0.7s linear infinite',
};

const footerLinkStyle = {
  color: T.skyLt,
  textDecoration: 'none',
};

function Section({ title, children, bg }) {
  return (
    <section style={{ padding: '48px 20px', background: bg || 'transparent' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h2
          style={{
            fontFamily: FONTS.en,
            fontSize: 'clamp(26px, 4.5vw, 36px)',
            fontWeight: 900,
            textAlign: 'center',
            color: T.white,
            margin: 0,
            marginBottom: 28,
          }}
        >
          <span style={{ fontFamily: FONTS.ar }}>{title}</span>
        </h2>
        {children}
      </div>
    </section>
  );
}

function PackageCard({ pkg, onClick }) {
  const tierStyles = getTierStyles(pkg);
  return (
    <div
      className="sp-pkg-card"
      style={{
        ...tierStyles.card,
        borderRadius: 20,
        padding: '22px 18px',
        minHeight: 480,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        transition: 'transform .3s, border-color .3s',
        boxSizing: 'border-box',
      }}
    >
      {pkg.badge && (
        <div
          style={{
            position: 'absolute',
            top: -10,
            insetInlineEnd: 14,
            padding: '4px 12px',
            borderRadius: 100,
            fontSize: 11,
            fontWeight: 800,
            fontFamily: FONTS.ar,
            ...tierStyles.badge,
          }}
        >
          {pkg.badge}
        </div>
      )}

      <div>
        <div
          style={{
            fontFamily: FONTS.en,
            fontSize: 22,
            fontWeight: 900,
            color: pkg.accent,
            marginBottom: 2,
          }}
        >
          <span style={{ fontFamily: FONTS.ar }}>{pkg.name}</span>
        </div>
        <div style={{ fontSize: 12, color: T.muted, marginBottom: 14 }}>{pkg.sub}</div>

        <div style={{ marginBottom: 12 }}>
          {pkg.oldPrice && (
            <div style={{ fontSize: 13, color: T.dim, textDecoration: 'line-through' }}>
              {pkg.oldPrice} ر.س
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: T.white, fontFamily: FONTS.en }}>
              {pkg.price}
            </span>
            <span style={{ fontSize: 12, color: T.muted }}>ر.س / شهرياً</span>
          </div>
        </div>

        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${T.border}, transparent)`, margin: '10px 0 14px' }} />

        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
          {pkg.features.map(f => (
            <li key={f} style={{ display: 'flex', gap: 8, fontSize: 13, color: T.text, lineHeight: 1.65 }}>
              <span style={{ color: pkg.accent, fontWeight: 900, flexShrink: 0 }}>✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ flex: 1 }} />

      <button
        type="button"
        onClick={onClick}
        style={{
          marginTop: 16,
          width: '100%',
          height: 48,
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 700,
          fontFamily: FONTS.ar,
          cursor: 'pointer',
          transition: 'all .25s',
          ...tierStyles.cta,
        }}
      >
        {pkg.cta}
      </button>
    </div>
  );
}

function getTierStyles(pkg) {
  switch (pkg.tier) {
    case 'self_study':
      return {
        card: { background: 'rgba(148,163,184,0.04)', border: '1px solid rgba(148,163,184,0.12)' },
        cta:  { background: 'transparent', border: `1px solid ${T.selfStudy}`, color: T.selfStudy },
        badge:{ background: 'rgba(148,163,184,0.18)', color: T.selfStudy },
      };
    case 'asas':
      return {
        card: { background: 'rgba(100,116,139,0.04)', border: `1px solid ${T.border}` },
        cta:  { background: 'transparent', border: `1px solid ${T.asas}`, color: T.text },
        badge:{ background: 'rgba(100,116,139,0.2)', color: T.text },
      };
    case 'talaqa':
      return {
        card: {
          background: 'linear-gradient(170deg, rgba(56,189,248,0.10), rgba(56,189,248,0.02))',
          border: '2px solid rgba(56,189,248,0.3)',
          animation: 'borderGlow 4s ease-in-out infinite',
        },
        cta:  { background: T.sky, border: 'none', color: '#0a1225' },
        badge:{ background: T.sky, color: '#0a1225' },
      };
    case 'tamayuz':
      return {
        card: {
          background: 'linear-gradient(170deg, rgba(251,191,36,0.06), rgba(251,191,36,0.01))',
          border: '2px solid rgba(251,191,36,0.2)',
          boxShadow: T.shadowGold,
        },
        cta:  { background: T.gold, border: 'none', color: '#0a1225' },
        badge:{ background: T.gold, color: '#0a1225' },
      };
    case 'fardi':
      return {
        card: {
          background: 'linear-gradient(170deg, rgba(168,85,247,0.08), rgba(168,85,247,0.02))',
          border: '2px solid rgba(168,85,247,0.28)',
          boxShadow: T.shadowPurple,
        },
        cta:  { background: `linear-gradient(135deg, ${T.purple}, ${T.purpleLt})`, border: 'none', color: '#fff' },
        badge:{ background: `linear-gradient(135deg, ${T.purple}, ${T.purpleLt})`, color: '#fff' },
      };
    default:
      return {
        card: { background: T.bgCard, border: `1px solid ${T.border}` },
        cta:  { background: 'transparent', border: `1px solid ${T.border}`, color: T.text },
        badge:{ background: 'rgba(255,255,255,0.08)', color: T.text },
      };
  }
}

function SuccessCard({ onWA }) {
  return (
    <div style={{ textAlign: 'center', padding: '18px 8px' }}>
      <div style={{ fontSize: 48, marginBottom: 10 }}>✅</div>
      <h3 style={{ fontSize: 18, fontWeight: 900, color: T.white, margin: '0 0 10px' }}>
        تم الإرسال
      </h3>
      <p style={{ fontSize: 14, color: T.text, lineHeight: 1.8, margin: '0 0 18px' }}>
        راح نتواصل معك خلال ساعات قليلة إن شاء الله.
      </p>
      <button
        onClick={onWA}
        style={{
          padding: '12px 24px',
          borderRadius: 12,
          border: '1px solid #25D366',
          background: 'rgba(37,211,102,0.1)',
          color: '#25D366',
          fontSize: 13,
          fontWeight: 700,
          fontFamily: FONTS.ar,
          cursor: 'pointer',
        }}
      >
        💬 افتح واتساب
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
