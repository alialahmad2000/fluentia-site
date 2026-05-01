import { motion } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════
// TYPOGRAPHIC MONOGRAM — used in Founder Story in place of a portrait
// ═══════════════════════════════════════════════════════════════

function Monogram() {
  return (
    <div
      aria-hidden="true"
      style={{
        width: '180px',
        height: '180px',
        borderRadius: '50%',
        border: '1px solid var(--p-gold-rich)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        background: 'radial-gradient(circle at 30% 30%, rgba(201, 169, 97, 0.06), transparent 70%)',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--p-font-serif)',
          fontSize: '52px',
          fontWeight: 400,
          color: 'var(--p-gold-rich)',
          letterSpacing: '0.02em',
          lineHeight: 1,
          fontStyle: 'italic',
        }}
      >
        ع.أ
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '-32px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '10px',
          letterSpacing: 'var(--p-tracking-widest)',
          textTransform: 'uppercase',
          color: 'var(--p-cream-faded)',
          whiteSpace: 'nowrap',
        }}
      >
        FOUNDER · EST. 2024
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MOVEMENT LABEL — small numbered eyebrow used in Founder Story
// ═══════════════════════════════════════════════════════════════

function MovementLabel({ number, label }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        marginBottom: 'var(--p-space-md)',
      }}
    >
      <span
        className="p-num"
        style={{
          fontFamily: 'var(--p-font-serif)',
          fontStyle: 'italic',
          fontSize: '20px',
          color: 'var(--p-gold-rich)',
        }}
      >
        {number}
      </span>
      <span
        style={{
          width: '36px',
          height: '1px',
          background: 'var(--p-gold-rich)',
          opacity: 0.5,
        }}
      />
      <span
        style={{
          fontSize: 'var(--p-text-overline)',
          letterSpacing: 'var(--p-tracking-widest)',
          textTransform: 'uppercase',
          color: 'var(--p-cream-muted)',
          fontWeight: 500,
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MOTION VARIANTS — slow editorial pacing
// ═══════════════════════════════════════════════════════════════

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] },
  },
};

const fadeUpStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.18, delayChildren: 0.1 },
  },
};

const heroFadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 1.6, ease: [0.16, 1, 0.3, 1] },
  },
};

// ═══════════════════════════════════════════════════════════════
// PLACEHOLDER SECTIONS (sections 4-12) — preserved from V1 skeleton
// ═══════════════════════════════════════════════════════════════

const PLACEHOLDER_SECTIONS = [
  { id: 'method',  number: '04', label: 'The Method',          title: 'الطريقة' },
  { id: 'tiers',   number: '05', label: 'Tier Reveal',         title: 'الباقات' },
  { id: 'ielts',   number: '06', label: 'IELTS Guarantee',     title: 'ضمان آيلتس' },
  { id: 'stories', number: '07', label: 'Student Stories',     title: 'قصص الطالبات' },
  { id: 'trainer', number: '08', label: 'Trainer Credentials', title: 'المدربون' },
  { id: 'promise', number: '09', label: 'The Promise',         title: 'الوعد' },
  { id: 'process', number: '10', label: 'The Process',         title: 'الرحلة' },
  { id: 'cta',     number: '11', label: 'Final CTA',           title: 'دعوة' },
  { id: 'footer',  number: '12', label: 'Footer',              title: 'فلوينتيا' },
];

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export default function PremiumV1() {
  return (
    <main>
      {/* Dev banner — preserved from V1 */}
      <div
        style={{
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
        }}
      >
        Premium V2 · Hero + Manifesto + Founder Live · Sections 4-12 Skeleton
      </div>

      {/* ═════════════════════════════════════════════════════════
          SECTION 1: HERO
          Full viewport. No CTA. Only the bombshell opening.
          ═════════════════════════════════════════════════════════ */}
      <section
        id="hero"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '120px 24px 80px',
          position: 'relative',
          background: 'var(--p-bg-primary)',
        }}
      >
        {/* Top brand mark — quiet */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          style={{
            position: 'absolute',
            top: '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 'var(--p-text-overline)',
            letterSpacing: 'var(--p-tracking-widest)',
            textTransform: 'uppercase',
            color: 'var(--p-gold-rich)',
          }}
        >
          أكاديمية فلوينتيا
        </motion.div>

        {/* The opening verse */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUpStagger}
          className="p-container-base"
          style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}
        >
          <motion.h1
            variants={fadeUp}
            className="p-display"
            style={{
              fontSize: 'clamp(36px, 6vw, 72px)',
              lineHeight: '1.25',
              color: 'var(--p-cream-bright)',
              fontWeight: 400,
              letterSpacing: 'var(--p-tracking-tight)',
              marginBottom: 'var(--p-space-xl)',
            }}
          >
            حين لا تَملِك اللُّغة،
            <br />
            <span style={{ color: 'var(--p-cream-muted)' }}>لا تَملِك البابَ الذي تَطرُقه،</span>
            <br />
            <span style={{ color: 'var(--p-cream-muted)' }}>ولا الكلمةَ التي تُعرِّفُك،</span>
            <br />
            <span style={{ color: 'var(--p-gold-rich)', fontStyle: 'italic' }}>
              ولا الفُرصةَ التي تَستَحقُّها.
            </span>
          </motion.h1>

          <motion.div
            variants={fadeUp}
            style={{
              width: '40px',
              height: '1px',
              background: 'var(--p-gold-rich)',
              margin: '0 auto var(--p-space-md)',
              opacity: 0.6,
            }}
          />

          <motion.p
            variants={fadeUp}
            style={{
              fontFamily: 'var(--p-font-serif)',
              fontStyle: 'italic',
              fontSize: 'var(--p-text-lead)',
              color: 'var(--p-cream-soft)',
              lineHeight: 1.6,
            }}
          >
            — د. علي الأحمد
            <br />
            <span style={{ fontSize: 'var(--p-text-caption)', fontStyle: 'normal', letterSpacing: 'var(--p-tracking-wider)', textTransform: 'uppercase', color: 'var(--p-cream-faded)' }}>
              مؤسس فلوينتيا
            </span>
          </motion.p>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 2.0 }}
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              letterSpacing: 'var(--p-tracking-widest)',
              textTransform: 'uppercase',
              color: 'var(--p-cream-faded)',
            }}
          >
            تابِع
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: '1px',
              height: '40px',
              background: 'linear-gradient(to bottom, var(--p-gold-rich), transparent)',
            }}
          />
        </motion.div>
      </section>

      {/* ═════════════════════════════════════════════════════════
          SECTION 2: MANIFESTO
          5 lines. Each one a thesis. Generous space. Slow stagger.
          ═════════════════════════════════════════════════════════ */}
      <section
        id="manifesto"
        className="p-section-alt"
        style={{
          padding: 'var(--p-space-3xl) 24px',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div className="p-container-narrow" style={{ textAlign: 'center' }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUpStagger}
          >
            {/* Section overline */}
            <motion.div
              variants={fadeUp}
              className="p-overline"
              style={{ marginBottom: 'var(--p-space-md)' }}
            >
              <span className="p-num">02</span> · ما نُؤمِن بِه
            </motion.div>

            <motion.div
              variants={fadeUp}
              style={{
                width: '40px',
                height: '1px',
                background: 'var(--p-gold-rich)',
                margin: '0 auto var(--p-space-2xl)',
                opacity: 0.5,
              }}
            />

            {/* The 5 manifesto lines */}
            {[
              { primary: 'أنَّ اللُّغة', accent: 'ليست مَهارة. اللُّغة شَرط.' },
              { primary: 'أنَّ الإصرارَ وَحدَه لا يَكفي', accent: '— يَحتاج طَريقاً.' },
              { primary: 'أنَّ الطالِبَ ليس عَميلاً،', accent: 'والمُعلِّمَ ليس مُوظَّفاً.' },
              { primary: 'أنَّ الجَودةَ الحَقيقيَّة', accent: 'لا تُقاس بِعَدد الحِصَص.' },
              { primary: 'أنَّ مَن يَتَعَلَّم اللُّغة،', accent: 'يَتَعَلَّم نَفسَه أوَّلاً.' },
            ].map((line, i) => (
              <motion.p
                key={i}
                variants={fadeUp}
                className="p-display"
                style={{
                  fontSize: 'clamp(24px, 3.5vw, 36px)',
                  lineHeight: 1.6,
                  color: 'var(--p-cream-bright)',
                  fontWeight: 400,
                  letterSpacing: 'var(--p-tracking-tight)',
                  marginBottom: 'var(--p-space-xl)',
                }}
              >
                {line.primary}
                <br />
                <span style={{ color: 'var(--p-gold-rich)', fontStyle: 'italic' }}>
                  {line.accent}
                </span>
              </motion.p>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════
          SECTION 3: FOUNDER STORY
          Three movements: Discovery → The Long Search → The Awakening
          Monogram on the right (or top on mobile), text on the left.
          ═════════════════════════════════════════════════════════ */}
      <section
        id="founder"
        style={{
          padding: 'var(--p-space-3xl) 24px',
          background: 'var(--p-bg-primary)',
        }}
      >
        <div className="p-container-base">
          {/* Section overline */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUpStagger}
            style={{ marginBottom: 'var(--p-space-2xl)' }}
          >
            <motion.div variants={fadeUp} className="p-overline">
              <span className="p-num">03</span> · المُؤسِّس
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="p-display"
              style={{
                fontSize: 'clamp(36px, 5vw, 60px)',
                lineHeight: 1.15,
                color: 'var(--p-cream-bright)',
                fontWeight: 400,
                letterSpacing: 'var(--p-tracking-tight)',
                marginTop: 'var(--p-space-md)',
              }}
            >
              لماذا أسَّستُ
              <br />
              <span style={{ color: 'var(--p-gold-rich)', fontStyle: 'italic' }}>
                أكاديميَّة فلوينتيا
              </span>
            </motion.h2>
            <motion.div
              variants={fadeUp}
              style={{
                width: '60px',
                height: '1px',
                background: 'var(--p-gold-rich)',
                marginTop: 'var(--p-space-md)',
                opacity: 0.6,
              }}
            />
          </motion.div>

          {/* Two-column layout: monogram + story */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr)',
              gap: 'var(--p-space-2xl)',
              alignItems: 'flex-start',
            }}
          >
            {/* Monogram column — sticky on desktop */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={fadeUp}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--p-space-xl)',
                padding: 'var(--p-space-lg) 0',
              }}
            >
              <Monogram />
              <div style={{ textAlign: 'center', maxWidth: '280px' }}>
                <p
                  style={{
                    fontFamily: 'var(--p-font-serif)',
                    fontSize: 'var(--p-text-h6)',
                    color: 'var(--p-cream-bright)',
                    marginBottom: 'var(--p-space-xs)',
                    letterSpacing: 'var(--p-tracking-tight)',
                  }}
                >
                  د. علي الأحمد
                </p>
                <p
                  style={{
                    fontSize: 'var(--p-text-caption)',
                    color: 'var(--p-cream-muted)',
                    letterSpacing: 'var(--p-tracking-wider)',
                    textTransform: 'uppercase',
                    fontStyle: 'normal',
                  }}
                >
                  طبيب · مُربٍّ · مؤسِّس
                </p>
              </div>
            </motion.div>

            {/* Story column */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={fadeUpStagger}
            >
              {/* Movement I */}
              <motion.div variants={fadeUp} style={{ marginBottom: 'var(--p-space-2xl)' }}>
                <MovementLabel number="I." label="الاكتشاف" />
                <h3
                  className="p-display"
                  style={{
                    fontSize: 'clamp(24px, 3vw, 32px)',
                    color: 'var(--p-cream-bright)',
                    lineHeight: 1.3,
                    marginBottom: 'var(--p-space-md)',
                    fontWeight: 400,
                  }}
                >
                  في الخامسةَ عشرة، اكتشفتُ الجِدار.
                </h3>
                <div
                  style={{
                    fontSize: 'var(--p-text-lead)',
                    lineHeight: 'var(--p-leading-body)',
                    color: 'var(--p-cream-soft)',
                  }}
                >
                  <p style={{ marginBottom: 'var(--p-space-md)' }}>
                    بَدَأتُ البَرمجةَ كَهِواية. سُرعانَ ما اصطَدَمتُ بِحَقيقةٍ لم أَكُن مُستَعِدّاً لها:
                    كلُّ شَيءٍ بِالإنجليزيَّة. التَوثيق، الكُتُب، المُنتدَيات، حتَّى رَسائِل الخَطَأ.
                  </p>
                  <p
                    className="p-quote"
                    style={{
                      fontSize: 'var(--p-text-h6)',
                      color: 'var(--p-gold-rich)',
                      borderInlineStart: '2px solid var(--p-gold-rich)',
                      paddingInlineStart: 'var(--p-space-md)',
                      margin: 'var(--p-space-md) 0',
                      fontStyle: 'italic',
                      fontFamily: 'var(--p-font-serif)',
                      lineHeight: 1.5,
                    }}
                  >
                    لم تَكُن مُشكِلَةَ لُغة. كانَت مُشكِلَةَ وُجود.
                  </p>
                  <p>
                    أَدرَكتُ — في تِلكَ اللَّحظة — أنَّ مَن لا يَملِك الإنجليزيَّةَ في عالَمِنا اليَوم،
                    كَمَن يُحاوِل السِّباقَ على عُكَّازَين. قَد يَصِل، لكِن أَبَداً لا يُنافِس.
                  </p>
                </div>
              </motion.div>

              {/* Movement II */}
              <motion.div variants={fadeUp} style={{ marginBottom: 'var(--p-space-2xl)' }}>
                <MovementLabel number="II." label="الرِّحلة الطويلة" />
                <h3
                  className="p-display"
                  style={{
                    fontSize: 'clamp(24px, 3vw, 32px)',
                    color: 'var(--p-cream-bright)',
                    lineHeight: 1.3,
                    marginBottom: 'var(--p-space-md)',
                    fontWeight: 400,
                  }}
                >
                  حاوَلتُ كلَّ شَيء.
                </h3>
                <div
                  style={{
                    fontSize: 'var(--p-text-lead)',
                    lineHeight: 'var(--p-leading-body)',
                    color: 'var(--p-cream-soft)',
                  }}
                >
                  <p style={{ marginBottom: 'var(--p-space-md)' }}>
                    سَنَواتٌ مِنَ المَجهود اليَومي. خَتَمتُ قَواميسَ مِن أَوَّلِها إلى آخِرِها.
                    جَرَّبتُ الكُتُبَ، الدَّوراتِ، المُحاضَراتِ، التَّطبيقاتِ، الطُّرُقَ التَّقليديَّةَ
                    وغَيرَ التَّقليديَّة.
                  </p>
                  <p style={{ marginBottom: 'var(--p-space-md)' }}>
                    وَصَلتُ — وذاكَ ما يُؤلِم — إلى نَتيجَةٍ صادِمة:
                  </p>
                  <p
                    className="p-quote"
                    style={{
                      fontSize: 'var(--p-text-h6)',
                      color: 'var(--p-gold-rich)',
                      borderInlineStart: '2px solid var(--p-gold-rich)',
                      paddingInlineStart: 'var(--p-space-md)',
                      margin: 'var(--p-space-md) 0',
                      fontStyle: 'italic',
                      fontFamily: 'var(--p-font-serif)',
                      lineHeight: 1.5,
                    }}
                  >
                    الإصرارُ وَحدَه لا يَكفي.
                    <br />
                    المُحاوَلةُ الفَرديَّةُ — مَهما طالَت — لا تَصنَع طَلاقة.
                  </p>
                  <p>
                    اللُّغَة — اكتَشَفتُ مُتَأخِّراً — لَيسَت كِتاباً تَحفَظُه. هي عَلاقةٌ تَنمو،
                    تَحتاج مَن يَأخُذُ بِيَدِك، يُصَحِّحُ مَسارَك، ويَفتَح لَكَ الأَبوابَ في اللَّحَظات
                    التي كُنتَ سَتَتَوَقَّفُ فيها.
                  </p>
                </div>
              </motion.div>

              {/* Movement III */}
              <motion.div variants={fadeUp}>
                <MovementLabel number="III." label="فلوينتيا" />
                <h3
                  className="p-display"
                  style={{
                    fontSize: 'clamp(24px, 3vw, 32px)',
                    color: 'var(--p-cream-bright)',
                    lineHeight: 1.3,
                    marginBottom: 'var(--p-space-md)',
                    fontWeight: 400,
                  }}
                >
                  لم أَترُك الطِّبّ. وَسَّعتُ الرِّسالة.
                </h3>
                <div
                  style={{
                    fontSize: 'var(--p-text-lead)',
                    lineHeight: 'var(--p-leading-body)',
                    color: 'var(--p-cream-soft)',
                  }}
                >
                  <p style={{ marginBottom: 'var(--p-space-md)' }}>
                    ما زِلتُ طَبيباً مُمارِساً. لكِنِّي أَدرَكتُ أنَّ الطَّبيبَ يُعالِج جَسَداً واحِداً،
                    والمُؤَسِّسَ يُعالِج حاجِزاً يَقِفُ بَينَ مِئاتٍ — وَرُبَّما آلاف — وَأَحلامِهم.
                  </p>
                  <p style={{ marginBottom: 'var(--p-space-md)' }}>
                    أَسَّستُ فلوينتيا لِسَبَبٍ واحِدٍ بَسيط:
                  </p>
                  <p
                    className="p-quote"
                    style={{
                      fontSize: 'var(--p-text-h6)',
                      color: 'var(--p-gold-rich)',
                      borderInlineStart: '2px solid var(--p-gold-rich)',
                      paddingInlineStart: 'var(--p-space-md)',
                      margin: 'var(--p-space-md) 0',
                      fontStyle: 'italic',
                      fontFamily: 'var(--p-font-serif)',
                      lineHeight: 1.5,
                    }}
                  >
                    لِأَبني للطَّالِبِ ما لم يَكُن مَوجوداً حينَ كُنتُ أنا أَبحَث.
                    <br />
                    طَريقاً، لا مَحاوَلات. وَيَداً تَأخُذ، لا مَنهَجاً يَترُك.
                  </p>
                  <p>
                    فلوينتيا لَيسَت مَعهَد لُغة. هي مَكانٌ يَتَعَلَّم فيه الإنسانُ نَفسَه أوَّلاً —
                    ثِقَتَه، طَريقةَ تَفكيرِه، صَبرَه — ثُمَّ تَأتي اللُّغة كَنَتيجة طَبيعيَّة.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Two-column upgrade for desktop */}
        <style>{`
          @media (min-width: 900px) {
            #founder > div > div:last-child {
              grid-template-columns: 240px minmax(0, 1fr) !important;
              gap: var(--p-space-3xl) !important;
            }
            #founder > div > div:last-child > div:first-child {
              position: sticky;
              top: 80px;
            }
          }
        `}</style>
      </section>

      {/* ═════════════════════════════════════════════════════════
          SECTIONS 4-12: PLACEHOLDERS (preserved for V3/V4)
          ═════════════════════════════════════════════════════════ */}
      {PLACEHOLDER_SECTIONS.map((s, i) => (
        <section
          key={s.id}
          id={s.id}
          className={`p-section ${i % 2 === 0 ? 'p-section-alt' : ''}`}
          style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}
        >
          <div className="p-container-base">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={fadeUp}
            >
              <div className="p-overline">
                <span className="p-num">{s.number}</span> · {s.label}
              </div>
              <h2
                className="p-display p-h2"
                style={{ color: 'var(--p-cream-bright)', marginTop: 'var(--p-space-md)' }}
              >
                {s.title}
              </h2>
              <div
                className="p-divider"
                style={{ marginInlineStart: 0, marginInlineEnd: 'auto' }}
              />
              <p
                className="p-lead"
                style={{ marginTop: 'var(--p-space-lg)', color: 'var(--p-cream-muted)' }}
              >
                — Final content arrives in PROMPT-PREMIUM-V3 / V4 —
              </p>
            </motion.div>
          </div>
        </section>
      ))}
    </main>
  );
}
