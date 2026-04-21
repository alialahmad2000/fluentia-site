import React from 'react';
import { buildWhatsAppUrl, WA_MESSAGES } from '../lib/whatsapp';
import { Helmet } from 'react-helmet-async';
import LegalLayout from './_shared/LegalLayout';

const H1 = (props) => (
  <h1
    style={{
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: 'clamp(2rem, 5vw, 3rem)',
      fontWeight: 900,
      color: '#f8fafc',
      margin: '0 0 0.75rem',
      lineHeight: 1.2,
    }}
    {...props}
  />
);

const H2 = (props) => (
  <h2
    style={{
      fontSize: '1.5rem',
      fontWeight: 800,
      color: '#38bdf8',
      marginTop: '2.5rem',
      marginBottom: '1rem',
    }}
    {...props}
  />
);

const H3 = (props) => (
  <h3
    style={{
      fontSize: '1.125rem',
      fontWeight: 700,
      color: '#f8fafc',
      marginTop: '1.5rem',
      marginBottom: '0.5rem',
    }}
    {...props}
  />
);

const P = (props) => (
  <p
    style={{
      fontSize: '1.0625rem',
      lineHeight: 1.9,
      color: '#cbd5e1',
      margin: '0 0 1rem',
    }}
    {...props}
  />
);

const Pillar = ({ num, title, text }) => (
  <div
    style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '0.75rem',
      padding: '1.25rem',
      display: 'flex',
      gap: '1rem',
    }}
  >
    <div
      style={{
        flexShrink: 0,
        width: '2.5rem',
        height: '2.5rem',
        borderRadius: '50%',
        background: 'rgba(56,189,248,0.1)',
        color: '#38bdf8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 900,
        fontFamily: "'Playfair Display', serif",
      }}
    >
      {num}
    </div>
    <div>
      <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 0.375rem' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.9375rem', color: '#94a3b8', margin: 0, lineHeight: 1.7 }}>{text}</p>
    </div>
  </div>
);

const TeamCard = ({ name, role, text }) => (
  <div
    style={{
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '0.75rem',
      padding: '1.25rem',
    }}
  >
    <div style={{ fontSize: '1.0625rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem' }}>
      {name}
    </div>
    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#38bdf8', marginBottom: '0.5rem' }}>
      {role}
    </div>
    <div style={{ fontSize: '0.9375rem', color: '#94a3b8', lineHeight: 1.7 }}>{text}</div>
  </div>
);

export default function AboutPage() {
  return (
    <LegalLayout updated={{ iso: '2026-04-15', display: '15 أبريل 2026' }}>
      <Helmet>
        <title>من نحن | أكاديمية طلاقة — Fluentia Academy</title>
        <meta
          name="description"
          content="قصة أكاديمية طلاقة ومؤسسها د. علي الأحمد — لماذا نؤمن بالتعليم المخصص والمجموعات الصغيرة."
        />
        <link rel="canonical" href="https://fluentia.academy/about" />
        <meta property="og:title" content="من نحن | أكاديمية طلاقة" />
        <meta property="og:url" content="https://fluentia.academy/about" />
        <meta property="og:description" content="قصة أكاديمية طلاقة ومؤسسها د. علي الأحمد." />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "من نحن — أكاديمية طلاقة",
            "url": "https://fluentia.academy/about",
            "inLanguage": "ar-SA",
            "dateModified": "2026-04-15",
            "datePublished": "2026-03-23",
            "author": {
              "@type": "Person",
              "name": "Dr. Ali Alahmad",
              "alternateName": "د. علي الأحمد"
            },
            "about": { "@id": "https://fluentia.academy/#organization" }
          }
        `}</script>
      </Helmet>

      {/* Author meta */}
      <div
        style={{
          fontSize: '0.875rem',
          color: '#7e8a9a',
          marginBottom: '0.5rem',
        }}
      >
        بقلم د. علي الأحمد · مؤسس الأكاديمية
      </div>

      <H1>من نحن — أكاديمية طلاقة</H1>

      <div
        style={{
          fontSize: '0.875rem',
          color: '#7e8a9a',
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <span>
          تأسست <time dateTime="2026-03-23">23 مارس 2026</time>
        </span>
        <span>·</span>
        <span>
          آخر تحديث: <time dateTime="2026-04-15">15 أبريل 2026</time>
        </span>
      </div>

      <H2>قصة الأكاديمية</H2>
      <P>
        بدأت أكاديمية طلاقة من إيمان عميق بأن تعلّم اللغة الإنجليزية للناطقين بالعربية يحتاج
        أكثر من مجرد فيديوهات مسجلة أو تطبيقات تكرار. يحتاج إلى مدرب يفهم طريقة تفكيرك،
        يعرف تحديات لغتك الأم، ويتابع تطورك شخصياً — لا رقماً ضمن مئات الطلاب.
      </P>
      <P>
        درّستُ اللغة الإنجليزية لسنوات داخل الجامعات والمعاهد، وشاهدتُ الطلاب أنفسهم يخرجون
        بعد أشهر من الدراسة دون تحسن حقيقي. السبب لم يكن في الطلاب، بل في النظام: فصول مزدحمة،
        مناهج جاهزة لا تراعي الفروقات، متابعة أسبوعية متقطعة، وتقييم سطحي. قررتُ أن أبني شيئاً مختلفاً.
      </P>
      <P>
        أكاديمية طلاقة هي الإجابة: مجموعات صغيرة بحد أقصى 7 طلاب، متابعة يومية من المدرب،
        منهج مصمم خصيصاً للناطقين بالعربية، وتقنيات ذكاء اصطناعي تساعد على التدرب خارج الكلاس.
        النتيجة؟ طلاب يتكلمون الإنجليزية بثقة حقيقية — لا يحفظون جملاً، بل يفكرون بها.
      </P>

      <H2>رسالتنا</H2>
      <P>
        أن نجعل الإنجليزية في متناول كل عربي جاد في تعلّمها — بتعليم مخصص، مدربين محترفين،
        ومنهج علمي مبني على أحدث أبحاث اكتساب اللغة الثانية. هدفنا ليس أن تنجح في امتحان،
        بل أن تعيش اللغة.
      </P>

      <H2>ما الذي يميّز أكاديمية طلاقة؟</H2>
      <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
        <Pillar
          num="1"
          title="مجموعات صغيرة فعلاً"
          text="حد أقصى 7 طلاب في كل مجموعة، مقابل 20-30 طالباً في المعاهد التقليدية. كل طالب يشارك، يتكلم، ويحصل على وقت كافٍ."
        />
        <Pillar
          num="2"
          title="متابعة يومية مع المدرب"
          text="المدرب يصحح أخطاءك، يرد على أسئلتك، ويتابع تقدمك كل يوم — لا مرة في الأسبوع."
        />
        <Pillar
          num="3"
          title="منهج مصمّم للناطقين بالعربية"
          text="نعرف أين تقع الصعوبات اللغوية بين العربية والإنجليزية، ونبني الشرح على هذا الفهم."
        />
        <Pillar
          num="4"
          title="ذكاء اصطناعي يخدم التعلم"
          text="منصة LMS بتقنيات تساعدك على تدريب النطق والتحدث والمفردات خارج الكلاس، بتصحيح فوري."
        />
        <Pillar
          num="5"
          title="تقييم حقيقي بالأرقام"
          text="تقرير شهري مفصّل يوضح تقدمك في المهارات الأربع — لا مجاملات، لا تقييمات غامضة."
        />
      </div>

      <H2>فريق الأكاديمية</H2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginTop: '1rem',
        }}
      >
        <TeamCard
          name="د. علي الأحمد"
          role="المؤسس والمدرب الرئيسي"
          text="متخصص في تدريس الإنجليزية للناطقين بالعربية بمنهجية علمية مبنية على أحدث أبحاث اكتساب اللغة."
        />
        <TeamCard
          name="د. محمد شربات"
          role="مدرب المجموعات المبتدئة"
          text="يتميّز بأسلوب صبور ومنظم في بناء الأساس اللغوي للطلاب الجدد."
        />
        <TeamCard
          name="هاجر"
          role="دعم الطلاب والتواصل"
          text="تتابع استفساراتكم على واتساب والإيميل، وتنسّق العمليات اليومية."
        />
      </div>

      <H2>الأرقام</H2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginTop: '1rem',
        }}
      >
        {[
          { v: '+14', l: 'طالب نشط' },
          { v: '4.9★', l: 'تقييم الأكاديمية' },
          { v: '+100', l: 'شهادة نجاح' },
        ].map((item) => (
          <div
            key={item.l}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(56,189,248,0.12)',
              borderRadius: '0.75rem',
              padding: '1rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.75rem',
                fontWeight: 900,
                color: '#38bdf8',
              }}
            >
              {item.v}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.25rem' }}>{item.l}</div>
          </div>
        ))}
      </div>

      <H2>تواصل معنا</H2>
      <P>
        للاستفسار أو حجز لقاء مبدئي مجاني مع المدرب، تواصل معنا على{' '}
        <a href={buildWhatsAppUrl(WA_MESSAGES.general)} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'none' }}>
          واتساب: +966 55 866 9974
        </a>{' '}
        أو عبر البريد الإلكتروني{' '}
        <a href="mailto:fluentia.sa@gmail.com" style={{ color: '#38bdf8', textDecoration: 'none' }}>
          fluentia.sa@gmail.com
        </a>
        .
      </P>

      {/* English translation */}
      <details
        style={{
          marginTop: '2.5rem',
          padding: '1rem 1.25rem',
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '0.75rem',
        }}
      >
        <summary
          style={{
            cursor: 'pointer',
            fontWeight: 700,
            color: '#38bdf8',
            fontSize: '1rem',
          }}
        >
          English version
        </summary>
        <div
          dir="ltr"
          style={{
            marginTop: '1rem',
            fontSize: '1rem',
            lineHeight: 1.8,
            color: '#cbd5e1',
            fontFamily: "'Segoe UI', -apple-system, sans-serif",
          }}
        >
          <h3 style={{ color: '#f8fafc', fontSize: '1.25rem', marginBottom: '0.5rem' }}>About Fluentia Academy</h3>
          <p>
            Fluentia Academy is a premium online English school for Arabic speakers, founded by
            Dr. Ali Alahmad. We believe language learning requires a trainer who understands your
            mother tongue, your learning style, and your real-world goals — not a one-size-fits-all
            curriculum.
          </p>
          <p>
            Our signature model: small groups of at most 7 learners, daily personal follow-up from
            the head trainer, and a curriculum specifically designed for Arabic-to-English transfer
            challenges. Students don't memorise phrases — they learn to think in English.
          </p>
          <p>
            Founded March 2026. Based in Saudi Arabia. All sessions conducted online via Google Meet.
            Contact:{' '}
            <a href="mailto:fluentia.sa@gmail.com" style={{ color: '#38bdf8' }}>
              fluentia.sa@gmail.com
            </a>
            .
          </p>
        </div>
      </details>
    </LegalLayout>
  );
}
