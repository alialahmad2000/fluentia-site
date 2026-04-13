import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Handshake, Link2, Share2, Wallet, TrendingUp, ShieldCheck,
  Users, Target, Star, ArrowLeft, Check, ChevronDown,
} from 'lucide-react';
import ApplicationForm from './_shared/ApplicationForm';
import FAQList from './_shared/FAQList';
import CommissionCalculator from './_shared/CommissionCalculator';

/* ──── Brand tokens from main site ──── */
const BG = '#060e1c';
const BG2 = '#0a1225';
const GOLD = '#D4AF37';
const GOLD_LIGHT = '#E8C860';
const SKY = '#38bdf8';
const T1 = '#f8fafc';
const T2 = '#8899aa';

/* ──── Shared animation variants ──── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

/* ──── Inline Logo (matches main site exactly) ──── */
function Logo({ size = 'lg' }) {
  const fSize = size === 'lg' ? '28px' : '22px';
  const restSize = size === 'lg' ? '20px' : '16px';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', fontFamily: "'Playfair Display', serif" }}>
      <span style={{ fontSize: fSize, fontWeight: 900, color: SKY }}>F</span>
      <span style={{ fontSize: restSize, fontWeight: 700, color: '#e2e8f0' }}>luentia</span>
    </span>
  );
}

/* ──── Section wrapper ──── */
function Section({ id, children, className = '', style = {} }) {
  return (
    <section id={id} className={className} style={{ padding: '80px 28px', ...style }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>{children}</div>
    </section>
  );
}

/* ──── Section heading ──── */
function SectionHeading({ children }) {
  return (
    <motion.h2
      initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
      variants={fadeUp}
      style={{
        fontFamily: 'Tajawal', fontWeight: 800, fontSize: 'clamp(28px, 5vw, 40px)',
        color: T1, textAlign: 'center', marginBottom: '48px',
      }}
    >
      {children}
    </motion.h2>
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
    <div dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif", color: T1, minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>

      {/* ══════ Fixed background ══════ */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
        <div style={{ position: 'absolute', inset: 0, background: BG }} />
        {/* Animated mesh — hero zone only */}
        <div style={{ position: 'absolute', inset: '0', height: '100vh', overflow: 'hidden', mixBlendMode: 'screen' }}>
          <motion.div
            style={{
              position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
              filter: 'blur(120px)', opacity: 0.2, top: '-10%', right: '-5%',
              background: `radial-gradient(circle, ${GOLD}, transparent 70%)`,
            }}
            animate={{ x: ['0%', '15%', '0%'], y: ['0%', '12%', '0%'] }}
            transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            style={{
              position: 'absolute', width: '700px', height: '700px', borderRadius: '50%',
              filter: 'blur(140px)', opacity: 0.12, top: '10%', left: '-10%',
              background: `radial-gradient(circle, ${SKY}, transparent 70%)`,
            }}
            animate={{ x: ['0%', '-10%', '0%'], y: ['0%', '15%', '0%'] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            style={{
              position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
              filter: 'blur(120px)', opacity: 0.1, bottom: '0', left: '30%',
              background: `radial-gradient(circle, ${GOLD_LIGHT}, transparent 70%)`,
            }}
            animate={{ x: ['0%', '10%', '0%'], y: ['0%', '-8%', '0%'] }}
            transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* ══════ HERO ══════ */}
      <section style={{ minHeight: '88vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 28px 40px', position: 'relative' }}>
        <div style={{ maxWidth: '900px', width: '100%', textAlign: 'center', margin: '0 auto' }}>

          {/* Logo */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '40px' }}>
            <Logo size="lg" />
          </motion.div>

          {/* Status chip */}
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 16px', borderRadius: '999px',
              background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
              color: GOLD_LIGHT, fontSize: '14px', fontWeight: 500, marginBottom: '32px',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD_LIGHT, display: 'inline-block', animation: 'pulse 2s infinite' }} />
            برنامج الشركاء مفتوح الآن
          </motion.div>

          {/* Title — massive, centered, RTL-safe */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7 }}
            style={{
              textAlign: 'center', margin: '0 auto 24px', maxWidth: '100%',
              fontSize: 'clamp(40px, 9vw, 84px)', fontWeight: 900, lineHeight: 1.1,
              background: 'linear-gradient(180deg, #FDE68A 0%, #D4AF37 60%, #B8860B 100%)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
              fontFamily: "'Tajawal', sans-serif",
            }}
          >
            كن شريكاً في<br />أكاديمية طلاقة
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            style={{
              textAlign: 'center', margin: '0 auto 40px', maxWidth: '600px',
              fontSize: 'clamp(16px, 3vw, 20px)', lineHeight: 1.7, color: T2,
            }}
          >
            اربح <span style={{ color: GOLD_LIGHT, fontWeight: 700 }}>100 ريال</span> عن كل طالب ينضم عبر رابطك الخاص.
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
                background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`,
                color: '#1a1a00', fontWeight: 700, fontSize: '17px',
                padding: '14px 32px', borderRadius: '999px',
                textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: `0 8px 32px rgba(212,175,55,0.2)`,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              قدّم الآن
              <ArrowLeft size={20} />
            </a>
            <a
              href="#how-it-works"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                border: `2px solid rgba(212,175,55,0.5)`, color: GOLD_LIGHT,
                fontWeight: 700, fontSize: '17px',
                padding: '12px 32px', borderRadius: '999px',
                textDecoration: 'none', transition: 'background 0.2s',
                background: 'transparent',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              كيف يعمل البرنامج؟
            </a>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ marginTop: '64px', color: T2, opacity: 0.4 }}
          >
            <ChevronDown size={28} style={{ margin: '0 auto', display: 'block' }} />
          </motion.div>
        </div>
      </section>

      {/* ══════ HOW IT WORKS ══════ */}
      <Section id="how-it-works">
        <SectionHeading>كيف يعمل البرنامج؟</SectionHeading>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
              custom={i} variants={fadeUp}
              style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px', padding: '32px 24px', textAlign: 'center',
                transition: 'border-color 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
            >
              {/* Number circle */}
              <div style={{
                width: 56, height: 56, borderRadius: '50%', margin: '0 auto 16px',
                border: `2px solid ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', fontWeight: 900, color: GOLD, fontFamily: 'Tajawal',
              }}>
                {step.num}
              </div>
              {/* Icon */}
              <step.icon size={28} color={GOLD} style={{ margin: '0 auto 12px', display: 'block' }} />
              <h3 style={{ fontFamily: 'Tajawal', fontWeight: 700, fontSize: '18px', color: T1, marginBottom: '8px' }}>
                {step.title}
              </h3>
              <p style={{ fontFamily: 'Tajawal', fontSize: '14px', color: T2, lineHeight: 1.7 }}>
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══════ COMMISSION CALCULATOR ══════ */}
      <Section id="calculator">
        <SectionHeading>احسب دخلك المتوقع</SectionHeading>
        <CommissionCalculator theme="dark-gold" />
      </Section>

      {/* ══════ WHY FLUENTIA ══════ */}
      <Section id="why">
        <SectionHeading>لماذا Fluentia؟</SectionHeading>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {whyCards.map((card, i) => (
            <motion.div
              key={i}
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
              custom={i} variants={fadeUp}
              style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px', padding: '32px 28px',
                transition: 'border-color 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'rgba(212,175,55,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <card.icon size={22} color={GOLD} />
              </div>
              <h3 style={{ fontFamily: 'Tajawal', fontWeight: 700, fontSize: '18px', color: T1, marginBottom: '8px' }}>
                {card.title}
              </h3>
              <p style={{ fontFamily: 'Tajawal', fontSize: '14px', color: T2, lineHeight: 1.7 }}>
                {card.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══════ FAQ ══════ */}
      <Section id="faq">
        <SectionHeading>الأسئلة الشائعة</SectionHeading>
        <FAQList theme="dark-gold" />
      </Section>

      {/* ══════ APPLICATION FORM ══════ */}
      <Section id="apply" style={{ padding: '80px 28px 60px' }}>
        <SectionHeading>قدّم طلبك الآن</SectionHeading>
        <ApplicationForm theme="dark-gold" />
      </Section>

      {/* ══════ FOOTER CTA ══════ */}
      <section style={{ padding: '60px 28px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontFamily: 'Tajawal', fontSize: '14px', color: T2, marginBottom: '12px' }}>
          بالانضمام أنت توافق على{' '}
          <a href="/partners/terms" style={{ color: GOLD, textDecoration: 'underline' }}>شروط وأحكام برنامج الشركاء</a>.
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
      `}</style>
    </div>
  );
}
