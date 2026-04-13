import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Handshake,
  ClipboardCheck,
  Link2,
  Share2,
  Banknote,
  TrendingUp,
  Tag,
  Star,
  Eye,
  CalendarCheck,
  Headphones,
  CreditCard,
  ArrowDown,
} from 'lucide-react';
import CommissionCalculator from './_shared/CommissionCalculator';
import FAQList from './_shared/FAQList';
import ApplicationForm from './_shared/ApplicationForm';

/* ─── Animation variants ─── */
const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ─── Reusable fade-in wrapper ─── */
function FadeSection({ children, style, className, id }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={fadeIn}
      style={style}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ─── Section heading ─── */
function SectionHeading({ children, sub }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
      <h2 style={{
        fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, color: '#111827',
        fontFamily: 'Tajawal', marginBottom: sub ? '12px' : '0', lineHeight: 1.4,
      }}>
        {children}
      </h2>
      {sub && (
        <p style={{ fontSize: '16px', color: '#6B7280', fontFamily: 'Tajawal', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ─── Steps data ─── */
const steps = [
  { num: 1, icon: ClipboardCheck, title: 'قدّم طلب الانضمام في دقيقتين', desc: 'عبّأ النموذج البسيط وأرسل طلبك. ما نحتاج شيء معقد.' },
  { num: 2, icon: Link2, title: 'احصل على رابطك الفريد + QR بعد الموافقة', desc: 'نراجع طلبك ونرسل لك رابط ورمز QR خاص فيك.' },
  { num: 3, icon: Share2, title: 'شاركه في حساباتك — صور، ستوريز، فيديوهات', desc: 'انشر رابطك بأي طريقة تناسبك. المحتوى عليك والنتائج علينا.' },
  { num: 4, icon: Banknote, title: 'اربح 100 ريال عن كل طالب ينضم + دفع شهري', desc: 'لكل طالب يسجّل من رابطك، تحصل على 100 ريال. دفع شهري منتظم.' },
];

/* ─── Why Fluentia data ─── */
const whyCards = [
  { icon: TrendingUp, title: 'منتج مطلوب', desc: 'طلب متزايد على تعلم الإنجليزي في السعودية' },
  { icon: Tag, title: 'أسعار تنافسية', desc: 'باقات تبدأ من 500 ريال' },
  { icon: Star, title: 'سمعة قوية', desc: 'تقييمات حقيقية وطلاب سعداء' },
];

/* ─── Trust badges ─── */
const trustBadges = [
  { icon: Eye, label: 'شفافية' },
  { icon: CalendarCheck, label: 'دفع شهري' },
  { icon: Headphones, label: 'دعم' },
  { icon: CreditCard, label: 'دفع سعودي' },
];

/* ═══════════════════════════════════════════════════════════ */
export default function PartnersV3() {
  useEffect(() => {
    // inject Tajawal font if not already present
    if (!document.querySelector('link[href*="Tajawal"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;600;700;800;900&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif", background: '#FFFFFF', color: '#111827', minHeight: '100vh' }}>

      {/* ─── HERO ─── */}
      <section style={{ background: '#FFFFFF', padding: 'clamp(60px,10vw,120px) 24px 80px' }}>
        <div style={{
          maxWidth: '1120px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center',
        }}>
          {/* Text side (right in RTL) */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <h1 style={{
              fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, lineHeight: 1.35,
              color: '#111827', marginBottom: '20px',
            }}>
              كن شريكا في أكاديمية طلاقة
            </h1>
            <p style={{
              fontSize: 'clamp(16px, 2vw, 19px)', color: '#4B5563', lineHeight: 1.8,
              marginBottom: '32px', maxWidth: '480px',
            }}>
              اربح 100 ريال عن كل طالب ينضم عبر رابطك الخاص. دفع شهري. شفافية كاملة.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
              <button
                onClick={() => scrollTo('apply')}
                style={{
                  padding: '14px 36px', borderRadius: '12px', fontWeight: 700, fontSize: '16px',
                  background: '#0EA5E9', color: '#fff', border: 'none', cursor: 'pointer',
                  fontFamily: 'Tajawal', transition: 'background 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#0284C7'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#0EA5E9'; }}
              >
                قدّم الآن
              </button>
              <button
                onClick={() => scrollTo('how')}
                style={{
                  padding: '14px 36px', borderRadius: '12px', fontWeight: 700, fontSize: '16px',
                  background: 'transparent', color: '#0EA5E9', border: '2px solid #0EA5E9',
                  cursor: 'pointer', fontFamily: 'Tajawal', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F0F9FF'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                كيف يعمل البرنامج؟
              </button>
            </div>
          </motion.div>

          {/* Illustration side (left in RTL) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <div style={{
              position: 'relative', width: '280px', height: '280px',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
            }}>
              <div style={{
                position: 'absolute', width: '260px', height: '260px', borderRadius: '50%',
                background: 'rgba(14,165,233,0.08)',
              }} />
              <Handshake size={200} strokeWidth={1.2} color="#0EA5E9" style={{ position: 'relative', zIndex: 1 }} />
            </div>
          </motion.div>
        </div>

        {/* Mobile: stack vertically */}
        <style>{`
          @media (max-width: 768px) {
            section:first-child > div:first-child {
              grid-template-columns: 1fr !important;
              text-align: center;
            }
            section:first-child > div:first-child > div:first-child {
              order: 1;
            }
            section:first-child > div:first-child > div:last-child {
              order: 0;
            }
            section:first-child > div:first-child > div:first-child > div:last-child {
              justify-content: center;
            }
          }
        `}</style>
      </section>

      {/* ─── TRUST BADGES ─── */}
      <FadeSection style={{ background: '#FFFFFF', padding: '0 24px 64px' }}>
        <div style={{
          maxWidth: '720px', margin: '0 auto',
          display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '32px',
        }}>
          {trustBadges.map((b, i) => (
            <motion.div key={i} custom={i} variants={fadeIn} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <b.icon size={22} color="#0EA5E9" />
              </div>
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#374151' }}>{b.label}</span>
            </motion.div>
          ))}
        </div>
      </FadeSection>

      {/* ─── HOW IT WORKS (Steps) ─── */}
      <FadeSection id="how" style={{ background: '#F9FAFB', padding: '80px 24px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <SectionHeading sub="أربع خطوات بسيطة وتبدأ تكسب">كيف يعمل البرنامج؟</SectionHeading>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px',
            }}
          >
            {steps.map((s, i) => (
              <motion.div key={i} custom={i} variants={fadeIn} style={{
                background: '#fff', border: '1px solid #E5E7EB', borderRadius: '16px',
                padding: '32px 28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '14px',
                    background: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <s.icon size={24} color="#0EA5E9" />
                  </div>
                  <span style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: '#0EA5E9', color: '#fff', fontSize: '14px', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {s.num}
                  </span>
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#111827', marginBottom: '8px', lineHeight: 1.5 }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.7 }}>
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
          {/* Mobile responsive */}
          <style>{`
            @media (max-width: 640px) {
              #how > div > div:last-child {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
        </div>
      </FadeSection>

      {/* ─── WHY FLUENTIA ─── */}
      <FadeSection style={{ background: '#FFFFFF', padding: '80px 24px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <SectionHeading sub="ليش تختار طلاقة كشريك؟">لماذا أكاديمية طلاقة؟</SectionHeading>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px',
            }}
          >
            {whyCards.map((c, i) => (
              <motion.div key={i} custom={i} variants={fadeIn} style={{
                background: '#fff', border: '1px solid #E5E7EB', borderRadius: '16px',
                padding: '32px 24px', textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'box-shadow 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
              >
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <c.icon size={28} color="#0EA5E9" />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                  {c.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.7 }}>
                  {c.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
          <style>{`
            @media (max-width: 768px) {
              /* Why cards responsive - handled below */
            }
          `}</style>
        </div>
      </FadeSection>

      {/* ─── COMMISSION CALCULATOR ─── */}
      <FadeSection style={{ background: '#F9FAFB', padding: '80px 24px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <SectionHeading sub="حرّك السلايدر وشوف كم تقدر تكسب">احسب أرباحك</SectionHeading>
          <CommissionCalculator theme="clean" />
        </div>
      </FadeSection>

      {/* ─── FAQ ─── */}
      <FadeSection style={{ background: '#FFFFFF', padding: '80px 24px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <SectionHeading sub="إجابات لأهم الأسئلة عن البرنامج">أسئلة شائعة</SectionHeading>
          <FAQList theme="clean" />
        </div>
      </FadeSection>

      {/* ─── APPLICATION FORM ─── */}
      <FadeSection id="apply" style={{ background: '#F9FAFB', padding: '80px 24px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <SectionHeading sub="عبّأ النموذج وابدأ رحلتك كشريك">قدّم طلبك الآن</SectionHeading>
          <div style={{
            background: '#fff', border: '1px solid #E5E7EB', borderRadius: '20px',
            padding: 'clamp(24px,4vw,40px)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <ApplicationForm theme="clean" />
          </div>
        </div>
      </FadeSection>

      {/* ─── FOOTER ─── */}
      <footer style={{
        background: '#FFFFFF', borderTop: '1px solid #E5E7EB',
        padding: '32px 24px', textAlign: 'center',
      }}>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>
          أكاديمية طلاقة — برنامج الشركاء
        </p>
        <a
          href="/partners/terms"
          style={{ fontSize: '14px', color: '#0EA5E9', textDecoration: 'none', fontWeight: 600 }}
          onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; }}
          onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; }}
        >
          الشروط والأحكام
        </a>
      </footer>

      {/* ─── Global responsive overrides ─── */}
      <style>{`
        @media (max-width: 768px) {
          /* Why Fluentia cards stack */
          section:nth-of-type(3) > div > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
