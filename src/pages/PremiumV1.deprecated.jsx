import { motion } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════
// MOTION VARIANTS
// ═══════════════════════════════════════════════════════════════

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeUpStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

// ═══════════════════════════════════════════════════════════════
// SECTION DEFINITIONS — 10 sections, conversion-optimized order
// ═══════════════════════════════════════════════════════════════

const SECTIONS = [
  { id: 'hero',         number: '01', label: 'Hero',            title: 'Hero + LMS Preview + CTAs',
    note: 'Full-viewport. Headline + subhead + 2 CTAs + trust strip + LMS dashboard mockup.' },

  { id: 'social-proof', number: '02', label: 'Social Proof',     title: 'Numbers + Testimonial Strip',
    note: 'Animated counters: students, levels, satisfaction. Logo strip if applicable.' },

  { id: 'problem',      number: '03', label: 'The Problem',      title: 'Why English Holds You Back',
    note: 'Punchy 1-2 sentences. Frames the pain before showing solution.' },

  { id: 'solution',     number: '04', label: 'The Solution',     title: '3 Pillars: Expert + Platform + Community',
    note: 'Three columns showing how Fluentia solves it. Visual icons + short copy.' },

  { id: 'showcase',     number: '05', label: 'Product Showcase', title: 'Bento Grid: LMS Features',
    note: 'Visual showcase of LMS capabilities. Bento grid with mockups + screenshots-style mockups.' },

  { id: 'method',       number: '06', label: 'The Method',       title: '5 Pillars of the Fluentia Approach',
    note: 'Vertical numbered list of methodology. Editorial spacing.' },

  { id: 'pricing',      number: '07', label: 'Pricing',          title: 'Tier Reveal: 3 Plans + IELTS',
    note: 'Three-tier pricing cards: 1,200 / 2,200 / 6,000. IELTS Guarantee as separate premium block.' },

  { id: 'stories',      number: '08', label: 'Student Stories',  title: 'Anonymous Case Studies',
    note: 'M.A., K.S., F.R. with specific results. Quote-style cards.' },

  { id: 'founder',      number: '09', label: 'Founder Note',     title: 'Why Dr. Ali Built Fluentia',
    note: 'Warm, personal. After value is established, the story builds trust.' },

  { id: 'cta-footer',   number: '10', label: 'Final CTA',        title: 'Ready When You Are',
    note: 'Strong final CTA + footer with trust links + WhatsApp.' },
];

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE — SKELETON
// ═══════════════════════════════════════════════════════════════

export default function PremiumV1() {
  return (
    <main style={{ background: 'var(--f-bg-base)', minHeight: '100vh' }}>
      {/* Dev banner */}
      <div
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 100,
          padding: '8px 16px',
          background: 'var(--f-amber)',
          color: 'var(--f-bg-base)',
          fontSize: 'var(--f-text-xs)',
          fontWeight: 'var(--f-weight-bold)',
          textAlign: 'center',
          letterSpacing: 'var(--f-tracking-wider)',
          textTransform: 'uppercase',
        }}
      >
        Fresh V1 · Modern Cinematic Skeleton · Sections await V2-V5
      </div>

      {/* Sections */}
      {SECTIONS.map((s, i) => (
        <section
          key={s.id}
          id={s.id}
          style={{
            padding: 'var(--f-space-32) var(--f-space-6)',
            minHeight: '70vh',
            display: 'flex',
            alignItems: 'center',
            background: i % 2 === 1 ? 'var(--f-bg-raised)' : 'var(--f-bg-base)',
            borderTop: i === 0 ? 'none' : '1px solid var(--f-border-subtle)',
          }}
        >
          <div className="f-container">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={fadeUpStagger}
            >
              <motion.div variants={fadeUp} className="f-eyebrow">
                <span className="f-num">{s.number}</span> · {s.label}
              </motion.div>

              <motion.h2
                variants={fadeUp}
                className="f-display f-h2"
                style={{
                  color: 'var(--f-text-primary)',
                  marginTop: 'var(--f-space-4)',
                  marginBottom: 'var(--f-space-4)',
                }}
              >
                {s.title}
              </motion.h2>

              <motion.div variants={fadeUp} className="f-divider" />

              <motion.p
                variants={fadeUp}
                className="f-lead"
                style={{
                  marginTop: 'var(--f-space-6)',
                  color: 'var(--f-text-muted)',
                  maxWidth: '720px',
                }}
              >
                {s.note}
              </motion.p>

              <motion.p
                variants={fadeUp}
                style={{
                  marginTop: 'var(--f-space-4)',
                  fontSize: 'var(--f-text-xs)',
                  color: 'var(--f-text-dim)',
                  letterSpacing: 'var(--f-tracking-wider)',
                  textTransform: 'uppercase',
                }}
              >
                — Built in PROMPT-FRESH-V2 / V3 / V4 / V5 —
              </motion.p>
            </motion.div>
          </div>
        </section>
      ))}
    </main>
  );
}
