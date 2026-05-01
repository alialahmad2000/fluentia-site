import { motion } from 'framer-motion';

const SECTIONS = [
  { id: 'hero',          label: 'Hero',                placeholder: 'Hero — opening manifesto statement' },
  { id: 'manifesto',     label: 'Manifesto',           placeholder: 'Manifesto — 5 philosophical lines' },
  { id: 'founder',       label: 'Founder Story',       placeholder: 'Founder Story — Dr. Ali Alahmad personal narrative' },
  { id: 'method',        label: 'The Method',          placeholder: 'The Method — 5 pillars of Fluentia approach' },
  { id: 'tiers',         label: 'Tier Reveal',         placeholder: 'Tier Reveal — الجماعي / تميّز / الفردي' },
  { id: 'ielts',         label: 'IELTS Guarantee',     placeholder: 'IELTS Guarantee — standalone premium offer' },
  { id: 'stories',       label: 'Student Stories',     placeholder: 'Student Stories — anonymous case studies' },
  { id: 'trainer',       label: 'Trainer Credentials', placeholder: 'Trainers — credentials + philosophy' },
  { id: 'promise',       label: 'The Promise',         placeholder: 'The Promise — guarantees + transparency' },
  { id: 'process',       label: 'The Process',         placeholder: 'The Process — what happens after signup' },
  { id: 'cta',           label: 'Final CTA',           placeholder: 'Final CTA — personal invitation' },
  { id: 'footer',        label: 'Footer',              placeholder: 'Footer — minimal' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

export default function PremiumV1() {
  return (
    <main>
      {/* Dev banner — remove before V4 replaces / */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        padding: '8px 16px',
        background: 'var(--p-gold-deep)',
        color: 'var(--p-cream-bright)',
        fontSize: 'var(--p-text-caption)',
        textAlign: 'center',
        letterSpacing: 'var(--p-tracking-wider)',
        textTransform: 'uppercase',
      }}>
        Premium V1 · Skeleton · Not for Production Traffic
      </div>

      {SECTIONS.map((s, i) => (
        <section
          key={s.id}
          id={s.id}
          className={`p-section ${i % 2 === 1 ? 'p-section-alt' : ''}`}
          style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}
        >
          <div className="p-container-base">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={fadeUp}
            >
              <div className="p-overline">
                <span className="p-num">{String(i + 1).padStart(2, '0')}</span> · Section
              </div>
              <h2 className="p-display p-h2" style={{ color: 'var(--p-cream-bright)', marginTop: 'var(--p-space-md)' }}>
                {s.label}
              </h2>
              <div className="p-divider" style={{ marginInlineStart: 0, marginInlineEnd: 'auto' }} />
              <p className="p-lead" style={{ marginTop: 'var(--p-space-lg)', color: 'var(--p-cream-muted)' }}>
                {s.placeholder}
              </p>
              <p style={{
                marginTop: 'var(--p-space-md)',
                fontSize: 'var(--p-text-caption)',
                color: 'var(--p-cream-faded)',
                letterSpacing: 'var(--p-tracking-wider)',
                textTransform: 'uppercase',
              }}>
                — Final content arrives in PROMPT-PREMIUM-V2/V3/V4 —
              </p>
            </motion.div>
          </div>
        </section>
      ))}
    </main>
  );
}
