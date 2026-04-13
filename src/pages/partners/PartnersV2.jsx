import { motion } from 'framer-motion';
import {
  ClipboardCheck,
  Link2,
  Share2,
  Banknote,
  TrendingUp,
  Tag,
  Star,
  ArrowDown,
} from 'lucide-react';
import CommissionCalculator from './_shared/CommissionCalculator';
import FAQList from './_shared/FAQList';
import ApplicationForm from './_shared/ApplicationForm';

/* ── Google Fonts ── */
const fontLink = document.querySelector('link[href*="Tajawal"]');
if (!fontLink) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap';
  document.head.appendChild(link);
}

/* ── Animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, type: 'spring', stiffness: 80, damping: 16 },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, type: 'spring', stiffness: 120, damping: 14 },
  },
};

/* ── CSS Keyframes (injected once) ── */
const styleId = 'partners-v2-styles';
if (!document.getElementById(styleId)) {
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes meshRotate {
      0%   { background-position: 0% 50%, 100% 50%, 50% 100%; }
      25%  { background-position: 100% 0%, 0% 100%, 50% 0%; }
      50%  { background-position: 100% 100%, 50% 0%, 0% 50%; }
      75%  { background-position: 0% 100%, 100% 0%, 100% 50%; }
      100% { background-position: 0% 50%, 100% 50%, 50% 100%; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-12px); }
    }
    @keyframes pulse-glow {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
    .v2-hero-mesh {
      background:
        radial-gradient(ellipse 80% 60% at 20% 30%, #7C3AED 0%, transparent 55%),
        radial-gradient(ellipse 70% 50% at 80% 20%, #3B82F6 0%, transparent 55%),
        radial-gradient(ellipse 60% 55% at 50% 80%, #06B6D4 0%, transparent 55%);
      background-size: 200% 200%, 200% 200%, 200% 200%;
      animation: meshRotate 12s ease-in-out infinite;
    }
    .v2-glass-card {
      background: rgba(255,255,255,0.08);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.12);
      transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease;
    }
    .v2-glass-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 20px 60px rgba(124,58,237,0.15), 0 8px 24px rgba(0,0,0,0.2);
    }
    .v2-progress-line {
      background: linear-gradient(90deg, #7C3AED, #3B82F6, #06B6D4);
    }
    .v2-gradient-text {
      background: linear-gradient(135deg, #ffffff 0%, #93C5FD 50%, #BAE6FD 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .v2-btn-primary {
      background: linear-gradient(135deg, #7C3AED, #3B82F6);
      color: #fff;
      border: none;
      transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease;
    }
    .v2-btn-primary:hover {
      transform: scale(1.05);
      box-shadow: 0 8px 32px rgba(124,58,237,0.4);
    }
    .v2-btn-primary:active { transform: scale(0.97); }
    .v2-btn-glass {
      background: rgba(255,255,255,0.08);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.3);
      color: #fff;
      transition: transform 0.25s ease, background 0.25s ease;
    }
    .v2-btn-glass:hover {
      transform: scale(1.05);
      background: rgba(255,255,255,0.15);
    }
    .v2-btn-glass:active { transform: scale(0.97); }
    .v2-step-circle {
      background: linear-gradient(135deg, #7C3AED, #3B82F6);
      box-shadow: 0 4px 20px rgba(124,58,237,0.35);
    }
  `;
  document.head.appendChild(style);
}

/* ── Smooth scroll ── */
const scrollTo = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

/* ── Steps data ── */
const steps = [
  { icon: ClipboardCheck, title: 'قدّم طلب الانضمام في دقيقتين' },
  { icon: Link2, title: 'احصل على رابطك الفريد + QR بعد الموافقة' },
  { icon: Share2, title: 'شاركه في حساباتك — صور، ستوريز، فيديوهات' },
  { icon: Banknote, title: 'اربح 100 ريال عن كل طالب ينضم + دفع شهري' },
];

/* ── Why Fluentia data ── */
const whyCards = [
  {
    icon: TrendingUp,
    title: 'منتج مطلوب',
    desc: 'طلب متزايد على تعلم الإنجليزي في السعودية',
  },
  {
    icon: Tag,
    title: 'أسعار تنافسية',
    desc: 'باقات تبدأ من 500 ريال',
  },
  {
    icon: Star,
    title: 'سمعة قوية',
    desc: 'تقييمات حقيقية وطلاب سعداء',
  },
];

/* ═══════════════════════════════════════════════
   PartnersV2 — Stripe Atlas Vibrant Gradient
   ═══════════════════════════════════════════════ */
export default function PartnersV2() {
  return (
    <div
      dir="rtl"
      style={{
        fontFamily: "'Tajawal', sans-serif",
        minHeight: '100vh',
        overflowX: 'hidden',
        background: '#030014',
        color: '#fff',
      }}
    >
      {/* ═══════════ HERO ═══════════ */}
      <section
        style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
      >
        {/* Animated mesh gradient background */}
        <div
          className="v2-hero-mesh"
          style={{ position: 'absolute', inset: 0, zIndex: 0 }}
        />
        {/* Dark overlay for readability */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'rgba(3,0,20,0.4)' }} />
        {/* Floating orbs */}
        <div style={{
          position: 'absolute', top: '15%', left: '10%', width: 300, height: 300,
          borderRadius: '50%', background: 'rgba(124,58,237,0.2)', filter: 'blur(80px)',
          animation: 'float 6s ease-in-out infinite', zIndex: 1,
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '15%', width: 250, height: 250,
          borderRadius: '50%', background: 'rgba(6,182,212,0.2)', filter: 'blur(80px)',
          animation: 'float 8s ease-in-out infinite 2s', zIndex: 1,
        }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 800, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 60 }}
            className="v2-gradient-text"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: 24,
            }}
          >
            كن شريكاً في أكاديمية طلاقة
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 60 }}
            style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.8)',
              maxWidth: 640,
              margin: '0 auto 40px',
            }}
          >
            اربح 100 ريال عن كل طالب ينضم عبر رابطك الخاص. دفع شهري. شفافية كاملة.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 16 }}
          >
            <button
              onClick={() => scrollTo('apply')}
              className="v2-btn-primary"
              style={{
                padding: '14px 36px',
                borderRadius: 16,
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                fontFamily: "'Tajawal', sans-serif",
              }}
            >
              قدّم الآن
            </button>
            <button
              onClick={() => scrollTo('how')}
              className="v2-btn-glass"
              style={{
                padding: '14px 36px',
                borderRadius: 16,
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                fontFamily: "'Tajawal', sans-serif",
              }}
            >
              كيف يعمل البرنامج؟
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            style={{ marginTop: 64 }}
          >
            <ArrowDown size={22} style={{ margin: '0 auto', color: '#06B6D4', animation: 'float 2s ease-in-out infinite' }} />
          </motion.div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section
        id="how"
        style={{
          padding: '100px 24px',
          background: 'linear-gradient(180deg, rgba(88,28,135,0.15) 0%, rgba(30,58,138,0.15) 100%)',
        }}
      >
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          style={{
            textAlign: 'center',
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 800,
            marginBottom: 64,
          }}
        >
          <span style={{ marginLeft: 8 }}>🎯</span> كيف يعمل البرنامج
        </motion.h2>

        {/* Steps with connected progress line */}
        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative' }}>
          {/* Desktop progress line */}
          <div
            className="v2-progress-line"
            style={{
              position: 'absolute',
              top: 32,
              right: 'calc(12.5% + 24px)',
              left: 'calc(12.5% + 24px)',
              height: 3,
              borderRadius: 2,
              zIndex: 0,
              display: 'none',
            }}
          />
          <style>{`@media(min-width:768px){.v2-progress-line-visible{display:block!important}}`}</style>
          <div
            className="v2-progress-line v2-progress-line-visible"
            style={{
              position: 'absolute',
              top: 32,
              right: 'calc(12.5% + 24px)',
              left: 'calc(12.5% + 24px)',
              height: 3,
              borderRadius: 2,
              zIndex: 0,
            }}
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 32,
              position: 'relative',
              zIndex: 1,
            }}
          >
            {steps.map(({ icon: Icon, title }, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
              >
                <div
                  className="v2-step-circle"
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={28} color="#fff" strokeWidth={2} />
                </div>
                <span style={{
                  display: 'inline-block',
                  background: 'rgba(124,58,237,0.2)',
                  color: '#C4B5FD',
                  fontSize: 13,
                  fontWeight: 700,
                  padding: '2px 12px',
                  borderRadius: 20,
                  marginBottom: 10,
                }}>
                  الخطوة {i + 1}
                </span>
                <p style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.7, color: 'rgba(255,255,255,0.9)' }}>
                  {title}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ WHY FLUENTIA ═══════════ */}
      <section
        style={{
          padding: '100px 24px',
          background: 'linear-gradient(180deg, rgba(124,58,237,0.03) 0%, rgba(59,130,246,0.03) 100%)',
        }}
      >
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          style={{
            textAlign: 'center',
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 800,
            marginBottom: 64,
          }}
        >
          <span style={{ marginLeft: 8 }}>🚀</span> ليش تنضم لطلاقة؟
        </motion.h2>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={stagger}
          style={{
            maxWidth: 1000,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 24,
          }}
        >
          {whyCards.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              className="v2-glass-card"
              style={{
                borderRadius: 24,
                padding: 36,
                textAlign: 'center',
              }}
            >
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(59,130,246,0.25))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <Icon size={28} color="#A78BFA" strokeWidth={2} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#fff' }}>{title}</h3>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.65)' }}>{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════ COMMISSION CALCULATOR ═══════════ */}
      <section
        style={{
          padding: '100px 24px',
          background: 'linear-gradient(180deg, rgba(88,28,135,0.15) 0%, rgba(30,58,138,0.15) 100%)',
        }}
      >
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          style={{
            textAlign: 'center',
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 800,
            marginBottom: 64,
          }}
        >
          <span style={{ marginLeft: 8 }}>💰</span> احسب أرباحك
        </motion.h2>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={scaleIn}
        >
          <CommissionCalculator theme="gradient" />
        </motion.div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section
        style={{
          padding: '100px 24px',
          background: 'linear-gradient(180deg, rgba(124,58,237,0.03) 0%, rgba(59,130,246,0.03) 100%)',
        }}
      >
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          style={{
            textAlign: 'center',
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 800,
            marginBottom: 64,
          }}
        >
          الأسئلة الشائعة
        </motion.h2>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <FAQList theme="gradient" />
        </motion.div>
      </section>

      {/* ═══════════ APPLICATION FORM ═══════════ */}
      <section
        id="apply"
        style={{
          padding: '100px 24px',
          background: 'linear-gradient(180deg, rgba(88,28,135,0.15) 0%, rgba(30,58,138,0.15) 100%)',
        }}
      >
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          style={{
            textAlign: 'center',
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 800,
            marginBottom: 16,
          }}
        >
          قدّم طلبك الآن
        </motion.h2>
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          style={{
            textAlign: 'center',
            fontSize: 16,
            color: 'rgba(255,255,255,0.6)',
            marginBottom: 48,
          }}
        >
          العملية تأخذ دقيقتين فقط
        </motion.p>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={scaleIn}
          className="v2-glass-card"
          style={{
            maxWidth: 680,
            margin: '0 auto',
            borderRadius: 24,
            padding: 'clamp(24px, 4vw, 48px)',
          }}
        >
          <ApplicationForm theme="gradient" />
        </motion.div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer
        style={{
          padding: '32px 24px',
          textAlign: 'center',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          fontSize: 14,
          color: 'rgba(255,255,255,0.45)',
          fontFamily: "'Tajawal', sans-serif",
        }}
      >
        أكاديمية طلاقة &mdash; برنامج الشركاء
        <span style={{ margin: '0 8px' }}>|</span>
        <a
          href="/partners/terms"
          style={{ color: 'rgba(167,139,250,0.8)', textDecoration: 'underline', textUnderlineOffset: 3 }}
        >
          الشروط والأحكام
        </a>
      </footer>
    </div>
  );
}
