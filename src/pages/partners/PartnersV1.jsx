import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ClipboardCheck,
  Link2,
  Share2,
  Banknote,
  TrendingUp,
  Tag,
  Star,
} from 'lucide-react';
import CommissionCalculator from './_shared/CommissionCalculator';
import FAQList from './_shared/FAQList';
import ApplicationForm from './_shared/ApplicationForm';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const GOLD = '#D4AF37';
const GOLD_LIGHT = '#E8C860';
const GOLD_DIM = 'rgba(212,175,55,0.15)';

const steps = [
  {
    num: 1,
    icon: ClipboardCheck,
    title: 'قدّم طلب الانضمام في دقيقتين',
  },
  {
    num: 2,
    icon: Link2,
    title: 'احصل على رابطك الفريد + QR بعد الموافقة',
  },
  {
    num: 3,
    icon: Share2,
    title: 'شاركه في حساباتك — صور، ستوريز، فيديوهات',
  },
  {
    num: 4,
    icon: Banknote,
    title: 'اربح 100 ريال عن كل طالب ينضم + دفع شهري',
  },
];

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

/* ------------------------------------------------------------------ */
/*  Noise SVG (inline, no external file)                               */
/* ------------------------------------------------------------------ */

const noiseSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.12, ease: 'easeOut' },
  }),
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function GoldDivider() {
  return (
    <div className="w-full flex items-center justify-center py-16">
      <div
        className="w-full max-w-4xl h-px"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${GOLD}44 20%, ${GOLD} 50%, ${GOLD}44 80%, transparent 100%)`,
        }}
      />
    </div>
  );
}

function SectionWrapper({ children, id, className = '' }) {
  return (
    <section id={id} className={`relative w-full max-w-6xl mx-auto px-6 ${className}`}>
      {children}
    </section>
  );
}

function StepCard({ step, index }) {
  const Icon = step.icon;
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className="flex flex-col items-center text-center gap-4"
    >
      {/* Number circle */}
      <div
        className="relative w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black"
        style={{
          border: `2px solid ${GOLD}`,
          color: GOLD,
          background: GOLD_DIM,
        }}
      >
        {step.num}
        <div
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            border: `1px solid ${GOLD}33`,
            animation: 'pulse 3s ease-in-out infinite',
          }}
        />
      </div>

      {/* Icon */}
      <Icon size={28} style={{ color: GOLD }} strokeWidth={1.5} />

      {/* Title */}
      <p className="text-zinc-200 text-lg leading-relaxed max-w-[260px]">
        {step.title}
      </p>
    </motion.div>
  );
}

function WhyCard({ card, index }) {
  const Icon = card.icon;
  return (
    <motion.div
      custom={index}
      variants={scaleIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className="group relative rounded-2xl p-8 transition-all duration-300"
      style={{
        background: 'rgba(39,39,42,0.50)',
        border: '1px solid rgba(63,63,70,1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(202,138,4,0.5)';
        e.currentTarget.style.boxShadow = `0 0 40px ${GOLD}15, 0 0 80px ${GOLD}08`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(63,63,70,1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
        style={{ background: GOLD_DIM }}
      >
        <Icon size={26} style={{ color: GOLD }} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
      <p className="text-zinc-400 leading-relaxed">{card.desc}</p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function PartnersV1() {
  const heroRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  /* Parallax mouse-tracking spotlight */
  useEffect(() => {
    function handleMouseMove(e) {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({ x, y });
    }
    const hero = heroRef.current;
    if (hero) hero.addEventListener('mousemove', handleMouseMove);
    return () => {
      if (hero) hero.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const scrollToApply = () => {
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' });
  };
  const scrollToHow = () => {
    document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      dir="rtl"
      style={{ fontFamily: "'Tajawal', sans-serif" }}
      className="relative min-h-screen"
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0A0A0A; }
        ::-webkit-scrollbar-thumb { background: #D4AF3744; border-radius: 8px; }
        ::-webkit-scrollbar-thumb:hover { background: #D4AF3788; }

        .gold-shimmer {
          background: linear-gradient(
            110deg,
            ${GOLD} 0%,
            ${GOLD_LIGHT} 40%,
            ${GOLD} 60%,
            ${GOLD_LIGHT} 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
      `}</style>

      {/* ---- Page background ---- */}
      <div
        className="fixed inset-0 -z-10"
        style={{ background: '#0A0A0A' }}
      />
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          backgroundImage: noiseSvg,
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
          opacity: 1,
        }}
      />

      {/* ============================================================ */}
      {/*  HERO                                                         */}
      {/* ============================================================ */}
      <header
        ref={heroRef}
        className="relative flex flex-col items-center justify-center text-center overflow-hidden"
        style={{ minHeight: '100vh', paddingTop: '6rem', paddingBottom: '6rem' }}
      >
        {/* Mouse-tracking spotlight */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-700"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, ${GOLD}12, transparent 60%)`,
          }}
        />

        {/* Decorative corner accents */}
        <div
          className="absolute top-8 right-8 w-24 h-24 pointer-events-none"
          style={{
            borderTop: `1px solid ${GOLD}33`,
            borderRight: `1px solid ${GOLD}33`,
          }}
        />
        <div
          className="absolute bottom-8 left-8 w-24 h-24 pointer-events-none"
          style={{
            borderBottom: `1px solid ${GOLD}33`,
            borderLeft: `1px solid ${GOLD}33`,
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-8 text-sm font-medium"
            style={{
              border: `1px solid ${GOLD}44`,
              background: GOLD_DIM,
              color: GOLD,
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: GOLD, animation: 'float 2s ease-in-out infinite' }}
            />
            برنامج الشركاء مفتوح الآن
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="gold-shimmer mb-6"
            style={{
              fontSize: 'clamp(3rem, 6vw, 4.5rem)',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
            }}
          >
            كن شريك&#1575;ً في أكاديمية طلاقة
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-zinc-400 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10"
          >
            اربح 100 ريال عن كل طالب ينضم عبر رابطك الخاص. دفع شهري. شفافية كاملة.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            {/* Primary CTA */}
            <button
              onClick={scrollToApply}
              className="relative px-10 py-4 rounded-full text-lg font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: GOLD,
                color: '#000',
                boxShadow: `0 0 30px ${GOLD}33, 0 4px 20px rgba(0,0,0,0.3)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = GOLD_LIGHT;
                e.currentTarget.style.boxShadow = `0 0 50px ${GOLD}55, 0 4px 30px rgba(0,0,0,0.3)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = GOLD;
                e.currentTarget.style.boxShadow = `0 0 30px ${GOLD}33, 0 4px 20px rgba(0,0,0,0.3)`;
              }}
            >
              قدّم الآن
            </button>

            {/* Secondary CTA */}
            <button
              onClick={scrollToHow}
              className="px-10 py-4 rounded-full text-lg font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'transparent',
                color: GOLD,
                border: `1.5px solid ${GOLD}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = GOLD_DIM;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              كيف يعمل البرنامج؟
            </button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div
            className="w-6 h-10 rounded-full flex items-start justify-center pt-2"
            style={{ border: `1.5px solid ${GOLD}44` }}
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: GOLD }}
            />
          </div>
        </motion.div>
      </header>

      {/* ============================================================ */}
      {/*  HOW IT WORKS                                                 */}
      {/* ============================================================ */}
      <GoldDivider />

      <SectionWrapper id="how">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2
            className="text-3xl sm:text-4xl font-black text-white mb-4"
            style={{ letterSpacing: '-0.01em' }}
          >
            كيف يعمل البرنامج؟
          </h2>
          <p className="text-zinc-500 text-lg">أربع خطوات بسيطة تفصلك عن أول عمولة</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {steps.map((step, i) => (
            <StepCard key={step.num} step={step} index={i} />
          ))}
        </div>

        {/* Connecting line (desktop) */}
        <div
          className="hidden lg:block absolute top-[13.5rem] left-[12%] right-[12%] h-px -z-0"
          style={{
            background: `linear-gradient(90deg, transparent, ${GOLD}33 20%, ${GOLD}33 80%, transparent)`,
          }}
        />
      </SectionWrapper>

      {/* ============================================================ */}
      {/*  WHY FLUENTIA                                                 */}
      {/* ============================================================ */}
      <GoldDivider />

      <SectionWrapper>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            لماذا طلاقة؟
          </h2>
          <p className="text-zinc-500 text-lg">
            منتج يبيع نفسه — أنت فقط شاركه
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {whyCards.map((card, i) => (
            <WhyCard key={i} card={card} index={i} />
          ))}
        </div>
      </SectionWrapper>

      {/* ============================================================ */}
      {/*  COMMISSION CALCULATOR                                        */}
      {/* ============================================================ */}
      <GoldDivider />

      <SectionWrapper>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <CommissionCalculator theme="dark-gold" />
        </motion.div>
      </SectionWrapper>

      {/* ============================================================ */}
      {/*  APPLICATION FORM                                             */}
      {/* ============================================================ */}
      <GoldDivider />

      <SectionWrapper id="apply">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            قدّم طلبك الآن
          </h2>
          <p className="text-zinc-500 text-lg">
            التسجيل مجاني ويستغرق أقل من دقيقتين
          </p>
        </motion.div>

        <motion.div
          variants={scaleIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <ApplicationForm theme="dark-gold" />
        </motion.div>
      </SectionWrapper>

      {/* ============================================================ */}
      {/*  FAQ                                                          */}
      {/* ============================================================ */}
      <GoldDivider />

      <SectionWrapper className="pb-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            الأسئلة الشائعة
          </h2>
          <p className="text-zinc-500 text-lg">
            كل ما تحتاج معرفته قبل الانضمام
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <FAQList theme="dark-gold" />
        </motion.div>
      </SectionWrapper>

      {/* ============================================================ */}
      {/*  FOOTER                                                       */}
      {/* ============================================================ */}
      <footer
        className="w-full py-8 text-center text-sm text-zinc-600"
        style={{
          borderTop: `1px solid rgba(63,63,70,0.5)`,
          background: 'rgba(10,10,10,0.8)',
        }}
      >
        <span>أكاديمية طلاقة — برنامج الشركاء</span>
        <span className="mx-2 text-zinc-700">|</span>
        <Link
          to="/partners/terms"
          className="transition-colors duration-200 hover:underline"
          style={{ color: GOLD }}
        >
          الشروط والأحكام
        </Link>
      </footer>
    </div>
  );
}
