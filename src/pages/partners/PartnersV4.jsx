import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Handshake, Link2, Share2, Wallet, TrendingUp, ShieldCheck,
  Users, Target, Star, ArrowLeft, Check, ChevronDown,
} from 'lucide-react';
import ApplicationForm from './_shared/ApplicationForm';
import FAQList from './_shared/FAQList';
import CommissionCalculator from './_shared/CommissionCalculator';

/* ──── Brand tokens — blue/white only, NO GOLD ──── */
const BG = '#060e1c';
const SKY = '#38bdf8';
const T1 = '#f8fafc';
const T2 = '#94A3B8';

/* ──── Shared animation variants ──── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

/* ──── Inline Logo — forced LTR to prevent RTL letter reversal ──── */
function Logo() {
  return (
    <span dir="ltr" className="inline-block" style={{ fontFamily: "'Playfair Display', serif" }}>
      <span style={{ fontSize: '28px', fontWeight: 900, color: SKY }}>F</span>
      <span style={{ fontSize: '20px', fontWeight: 700, color: '#e2e8f0' }}>luentia</span>
    </span>
  );
}

/* ──── Section wrapper — generous padding ──── */
function Section({ id, children, className = '', style = {} }) {
  return (
    <section id={id} className={className} style={{ padding: '96px 28px', position: 'relative', ...style }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 10 }}>{children}</div>
    </section>
  );
}

/* ──── Unified section heading with eyebrow ──── */
function SectionHeading({ eyebrow, children, subtitle }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: '64px', maxWidth: '640px', margin: '0 auto 64px' }}>
      {eyebrow && (
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          style={{ fontSize: '12px', fontWeight: 700, color: SKY, letterSpacing: '0.2em', marginBottom: '12px', fontFamily: 'Tajawal', textTransform: 'uppercase' }}
        >
          {eyebrow}
        </motion.div>
      )}
      <motion.h2
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
        style={{
          fontFamily: 'Tajawal', fontWeight: 900, fontSize: 'clamp(32px, 5vw, 48px)',
          color: T1, marginBottom: subtitle ? '20px' : '0', lineHeight: 1.15,
        }}
      >
        {children}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp} custom={1}
          style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.7, fontFamily: 'Tajawal' }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════ */
export default function PartnersV4() {
  /* Load fonts */
  useEffect(() => {
    if (!document.getElementById('v4-fonts')) {
      const link = document.createElement('link');
      link.id = 'v4-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Playfair+Display:wght@700;900&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const steps = [
    { num: '١', icon: Handshake, title: 'قدّم طلب الانضمام', desc: 'املأ نموذجاً بسيطاً في دقيقتين.' },
    { num: '٢', icon: Link2, title: 'احصل على رابطك الفريد', desc: 'بعد الموافقة، يصلك رابط خاص + QR.' },
    { num: '٣', icon: Share2, title: 'شاركه في حساباتك', desc: 'صور، ستوريز، فيديوهات، خاصة.' },
    { num: '٤', icon: Wallet, title: 'اربح 100 ريال لكل طالب', desc: 'دفع شهري مباشر لحسابك البنكي.' },
  ];

  const whyCards = [
    { icon: Target, title: 'منتج مطلوب', desc: 'طلب متزايد على تعلم الإنجليزي في السعودية — سوق ضخم ومتنامي.' },
    { icon: Wallet, title: 'أسعار تنافسية', desc: 'باقات تبدأ من 500 ريال — سهل الإقناع مقارنة بالمعاهد التقليدية.' },
    { icon: Star, title: 'سمعة قوية', desc: 'تقييمات حقيقية وطلاب سعداء — المنتج يبيع نفسه.' },
  ];

  return (
    <div dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif", color: T1, minHeight: '100vh', position: 'relative', overflowX: 'hidden', background: BG }}>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* HERO SECTION — animated background INSIDE it (absolute)  */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ minHeight: '92vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 28px 40px', position: 'relative', overflow: 'hidden', background: BG }}>

        {/* ========== ANIMATED BACKGROUND (absolute z-0 inside hero) ========== */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>

          {/* ── Animated mesh gradient (blue palette, toned down) ── */}
          <div className="v4-hero-mesh" style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

          {/* ── 4 Calibrated blobs — soft-light blend, alpha 0.45 ── */}

          {/* Blob 1 — sky top-right */}
          <div style={{
            position: 'absolute', top: '-200px', right: '-200px', width: 720, height: 720,
            borderRadius: '50%', filter: 'blur(90px)',
            background: 'radial-gradient(circle, rgba(56,189,248,0.45) 0%, rgba(56,189,248,0) 70%)',
            mixBlendMode: 'soft-light', animation: 'v4blob1 22s ease-in-out infinite',
            willChange: 'transform', zIndex: 2,
          }} />

          {/* Blob 2 — cyan middle-left */}
          <div style={{
            position: 'absolute', top: '20%', left: '-280px', width: 820, height: 820,
            borderRadius: '50%', filter: 'blur(90px)',
            background: 'radial-gradient(circle, rgba(14,165,233,0.45) 0%, rgba(14,165,233,0) 70%)',
            mixBlendMode: 'soft-light', animation: 'v4blob2 28s ease-in-out infinite',
            willChange: 'transform', zIndex: 2,
          }} />

          {/* Blob 3 — indigo bottom-center */}
          <div style={{
            position: 'absolute', bottom: '-220px', left: '30%', width: 640, height: 640,
            borderRadius: '50%', filter: 'blur(90px)',
            background: 'radial-gradient(circle, rgba(99,102,241,0.45) 0%, rgba(99,102,241,0) 70%)',
            mixBlendMode: 'soft-light', animation: 'v4blob3 26s ease-in-out infinite',
            willChange: 'transform', zIndex: 2,
          }} />

          {/* Blob 4 — bright blue top-left */}
          <div style={{
            position: 'absolute', top: '-60px', left: '15%', width: 500, height: 500,
            borderRadius: '50%', filter: 'blur(90px)',
            background: 'radial-gradient(circle, rgba(59,130,246,0.45) 0%, rgba(59,130,246,0) 70%)',
            mixBlendMode: 'soft-light', animation: 'v4blob4 24s ease-in-out infinite',
            willChange: 'transform', zIndex: 2,
          }} />

          {/* ── Navy overlay — re-establishes brand color over blobs ── */}
          <div
            style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3,
              background: 'linear-gradient(180deg, rgba(6,14,28,0.35) 0%, rgba(6,14,28,0.15) 50%, rgba(6,14,28,0.55) 100%)',
            }}
          />

          {/* Grain overlay for premium film texture */}
          <div
            style={{
              position: 'absolute', inset: 0, opacity: 0.04, mixBlendMode: 'overlay', zIndex: 4,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E")`,
            }}
          />

          {/* Bottom fade into next section */}
          <div
            style={{
              position: 'absolute', left: 0, right: 0, bottom: 0, height: '128px', zIndex: 5,
              background: `linear-gradient(to bottom, transparent, ${BG})`,
              pointerEvents: 'none',
            }}
          />
        </div>
        {/* ========== end animated BG ========== */}

{/* ========== HERO CONTENT (above BG at z-10) ========== */}
        <div style={{ maxWidth: '900px', width: '100%', textAlign: 'center', margin: '0 auto', position: 'relative', zIndex: 10 }}>

          {/* Logo — forced LTR */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '56px' }}>
            <Logo />
          </motion.div>

          {/* Status chip — frosted glass for any BG */}
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 16px', borderRadius: '999px',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(56,189,248,0.4)',
              color: '#bae6fd', fontSize: '14px', fontWeight: 500, marginBottom: '40px',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              boxShadow: '0 4px 24px rgba(56,189,248,0.1)',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7dd3fc', display: 'inline-block', animation: 'pulse 2s infinite', boxShadow: '0 0 6px rgba(125,211,252,0.5)' }} />
            برنامج الشركاء مفتوح الآن
          </motion.div>

          {/* Title — white with sky-300 highlight + navy textShadow */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7 }}
            style={{
              textAlign: 'center', margin: '0 auto 24px', maxWidth: '100%',
              fontSize: 'clamp(40px, 9vw, 84px)', fontWeight: 900, lineHeight: 1.1,
              color: '#FFFFFF',
              fontFamily: "'Tajawal', sans-serif",
              textShadow: '0 2px 40px rgba(6,14,28,0.4)',
            }}
          >
            كن شريكاً في<br />
            <span style={{
              color: '#7dd3fc',
              textShadow: '0 2px 30px rgba(56,189,248,0.3)',
            }}>
              أكاديمية طلاقة
            </span>
          </motion.h1>

          {/* Subtitle — bright white for readability */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            style={{
              textAlign: 'center', margin: '0 auto 48px', maxWidth: '600px',
              fontSize: 'clamp(16px, 3vw, 20px)', lineHeight: 1.7,
              color: 'rgba(255,255,255,0.9)',
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
            }}
          >
            اربح <span style={{ color: '#7dd3fc', fontWeight: 700 }}>100 ريال</span> عن كل طالب ينضم عبر رابطك الخاص.
            <br />
            دفع شهري. شفافية كاملة.
          </motion.p>

          {/* CTA pair */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', alignItems: 'center' }}
          >
            <a
              href="#apply"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: '#0ea5e9',
                color: '#FFFFFF', fontWeight: 700, fontSize: '17px',
                padding: '14px 32px', borderRadius: '999px',
                textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 8px 32px rgba(14,165,233,0.3)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(14,165,233,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(14,165,233,0.3)'; }}
            >
              قدّم الآن
              <ArrowLeft size={20} />
            </a>
            <a
              href="#how-it-works"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                border: '2px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.9)',
                fontWeight: 700, fontSize: '17px',
                padding: '12px 32px', borderRadius: '999px',
                textDecoration: 'none', transition: 'background 0.2s, border-color 0.2s',
                background: 'transparent',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
            >
              كيف يعمل البرنامج؟
            </a>
          </motion.div>

          {/* Hero bottom divider */}
          <div style={{ marginTop: '64px' }}>
            <div style={{ height: '1px', maxWidth: '200px', margin: '0 auto', background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.3), transparent)' }} />
          </div>

          {/* Scroll hint */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ marginTop: '24px', color: T2, opacity: 0.4 }}
          >
            <ChevronDown size={28} style={{ margin: '0 auto', display: 'block' }} />
          </motion.div>
        </div>
      </section>

      {/* ═══════ Transition band: animated hero → solid body ═══════ */}
      <div
        aria-hidden="true"
        style={{
          height: '128px', pointerEvents: 'none',
          background: `linear-gradient(to bottom, transparent, ${BG})`,
        }}
      />

      {/* ══════════════════════════════════════════════════════════ */}
      {/* REST OF PAGE — solid navy base + subtle static ambient    */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div style={{ position: 'relative', background: BG }}>

        {/* Static ambient glow for depth — NOT animated, low alpha */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0, opacity: 0.4 }}>
          <div style={{
            position: 'absolute', top: '20%', right: '-400px', width: 1000, height: 1000,
            borderRadius: '50%', filter: 'blur(120px)',
            background: 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, rgba(56,189,248,0) 60%)',
          }} />
          <div style={{
            position: 'absolute', bottom: '10%', left: '-300px', width: 800, height: 800,
            borderRadius: '50%', filter: 'blur(120px)',
            background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, rgba(99,102,241,0) 60%)',
          }} />
        </div>

        {/* ══════ HOW IT WORKS ══════ */}
        <Section id="how-it-works">
          <SectionHeading eyebrow="آلية العمل" subtitle="أربع خطوات بسيطة لتبدأ رحلتك كشريك">
            كيف يعمل البرنامج؟
          </SectionHeading>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
                custom={i} variants={fadeUp}
                style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '24px', padding: '32px 24px', textAlign: 'center',
                  transition: 'border-color 0.3s, background 0.3s, transform 0.3s, box-shadow 0.3s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(56,189,248,0.4)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(56,189,248,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Icon circle — sky-blue */}
                <div style={{
                  width: 56, height: 56, borderRadius: '16px', margin: '0 auto 20px',
                  border: '1px solid rgba(56,189,248,0.3)', background: 'rgba(56,189,248,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.3s',
                }}>
                  <step.icon size={28} color="#7dd3fc" strokeWidth={2} />
                </div>
                {/* Step number */}
                <div style={{ fontSize: '14px', fontWeight: 700, color: SKY, marginBottom: '8px', fontFamily: 'Tajawal' }}>
                  الخطوة {step.num}
                </div>
                <h3 style={{ fontFamily: 'Tajawal', fontWeight: 700, fontSize: '18px', color: T1, marginBottom: '8px' }}>
                  {step.title}
                </h3>
                <p style={{ fontFamily: 'Tajawal', fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ══════ COMMISSION CALCULATOR ══════ */}
        <Section id="calculator">
          <SectionHeading eyebrow="حاسبة العمولة" subtitle="حرّك المؤشر لمعرفة دخلك الشهري والسنوي">
            احسب دخلك المتوقع
          </SectionHeading>
          <CommissionCalculator theme="dark-blue" />
        </Section>

        {/* ══════ WHY FLUENTIA ══════ */}
        <Section id="why">
          <SectionHeading eyebrow="لماذا نحن" subtitle="ثلاثة أسباب تجعل الترويج لطلاقة أسهل">
            لماذا Fluentia؟
          </SectionHeading>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {whyCards.map((card, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
                custom={i} variants={fadeUp}
                style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '24px', padding: '36px 28px',
                  transition: 'border-color 0.3s, transform 0.3s, background 0.3s, box-shadow 0.3s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(56,189,248,0.4)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(56,189,248,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: '16px',
                  background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '20px', transition: 'background 0.3s',
                }}>
                  <card.icon size={28} color="#7dd3fc" strokeWidth={2} />
                </div>
                <h3 style={{ fontFamily: 'Tajawal', fontWeight: 700, fontSize: '18px', color: T1, marginBottom: '8px' }}>
                  {card.title}
                </h3>
                <p style={{ fontFamily: 'Tajawal', fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ══════ FAQ ══════ */}
        <Section id="faq">
          <SectionHeading eyebrow="أسئلة شائعة" subtitle="إجابات على أكثر الأسئلة تكراراً">
            الأسئلة الشائعة
          </SectionHeading>
          <FAQList theme="dark-blue" />
        </Section>

        {/* ══════ APPLICATION FORM ══════ */}
        <Section id="apply" style={{ padding: '96px 28px 60px' }}>
          <SectionHeading eyebrow="انضم الآن" subtitle="العملية سريعة — دقيقتين فقط">
            قدّم طلبك الآن
          </SectionHeading>
          <div style={{
            maxWidth: '640px', margin: '0 auto',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px', padding: '32px',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          }}>
            <ApplicationForm theme="dark-blue" />
          </div>
        </Section>

      </div>

      {/* ══════ FOOTER CTA ══════ */}
      <section style={{ padding: '60px 28px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', background: BG }}>
        <p style={{ fontFamily: 'Tajawal', fontSize: '14px', color: T2, marginBottom: '12px' }}>
          بالانضمام أنت توافق على{' '}
          <a href="/partners/terms" style={{ color: SKY, textDecoration: 'underline' }}>شروط وأحكام برنامج الشركاء</a>.
        </p>
        <p style={{ fontFamily: 'Tajawal', fontSize: '13px', color: 'rgba(255,255,255,0.25)' }}>
          &copy; {new Date().getFullYear()} Fluentia Academy
        </p>
      </section>

      {/* ══════ Global keyframes ══════ */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .v4-hero-mesh {
          background:
            radial-gradient(ellipse 80% 60% at 20% 30%, rgba(14,165,233,0.4) 0%, transparent 55%),
            radial-gradient(ellipse 70% 50% at 80% 20%, rgba(59,130,246,0.35) 0%, transparent 55%),
            radial-gradient(ellipse 60% 55% at 50% 80%, rgba(6,182,212,0.3) 0%, transparent 55%);
          background-size: 200% 200%, 200% 200%, 200% 200%;
          animation: v4meshRotate 12s ease-in-out infinite;
        }
        @keyframes v4meshRotate {
          0%   { background-position: 0% 50%, 100% 50%, 50% 100%; }
          25%  { background-position: 100% 0%, 0% 100%, 50% 0%; }
          50%  { background-position: 100% 100%, 50% 0%, 0% 50%; }
          75%  { background-position: 0% 100%, 100% 0%, 100% 50%; }
          100% { background-position: 0% 50%, 100% 50%, 50% 100%; }
        }
        @keyframes v4blob1 {
          0%   { transform: translate3d(0, 0, 0) scale(1); }
          25%  { transform: translate3d(180px, 120px, 0) scale(1.1); }
          50%  { transform: translate3d(-60px, 40px, 0) scale(0.95); }
          75%  { transform: translate3d(100px, -30px, 0) scale(1.05); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes v4blob2 {
          0%   { transform: translate3d(0, 0, 0) scale(1); }
          25%  { transform: translate3d(140px, -80px, 0) scale(1.08); }
          50%  { transform: translate3d(-50px, 100px, 0) scale(0.92); }
          75%  { transform: translate3d(80px, 30px, 0) scale(1.05); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes v4blob3 {
          0%   { transform: translate3d(0, 0, 0) scale(1); }
          25%  { transform: translate3d(-120px, -50px, 0) scale(1.12); }
          50%  { transform: translate3d(80px, -90px, 0) scale(0.9); }
          75%  { transform: translate3d(-40px, -20px, 0) scale(1.06); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes v4blob4 {
          0%   { transform: translate3d(0, 0, 0) scale(1); }
          25%  { transform: translate3d(100px, 70px, 0) scale(1.1); }
          50%  { transform: translate3d(-70px, -80px, 0) scale(0.95); }
          75%  { transform: translate3d(50px, -20px, 0) scale(1.08); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
      `}</style>
    </div>
  );
}
