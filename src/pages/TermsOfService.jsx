import React from 'react';
import { buildWhatsAppUrl, WA_MESSAGES } from '../lib/whatsapp';
import { Helmet } from 'react-helmet-async';
import LegalLayout from './_shared/LegalLayout';

const H1 = (props) => (
  <h1
    style={{
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
      fontWeight: 900,
      color: '#f8fafc',
      margin: '0 0 0.5rem',
      lineHeight: 1.2,
    }}
    {...props}
  />
);

const H2 = (props) => (
  <h2
    style={{
      fontSize: '1.375rem',
      fontWeight: 800,
      color: '#38bdf8',
      marginTop: '2.25rem',
      marginBottom: '0.75rem',
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

const Ul = (props) => (
  <ul
    style={{
      fontSize: '1.0625rem',
      lineHeight: 1.9,
      color: '#cbd5e1',
      paddingInlineStart: '1.5rem',
      margin: '0 0 1rem',
    }}
    {...props}
  />
);

export default function TermsOfService() {
  return (
    <LegalLayout updated={{ iso: '2026-04-15', display: '15 أبريل 2026' }}>
      <Helmet>
        <title>شروط الاستخدام | أكاديمية طلاقة</title>
        <meta
          name="description"
          content="شروط وأحكام الاشتراك في أكاديمية طلاقة — الدفع، الاسترداد، الملكية الفكرية، إنهاء الخدمة."
        />
        <link rel="canonical" href="https://fluentia.academy/terms" />
        <meta property="og:title" content="شروط الاستخدام | أكاديمية طلاقة" />
        <meta property="og:url" content="https://fluentia.academy/terms" />
      </Helmet>

      <H1>شروط الاستخدام</H1>
      <div style={{ fontSize: '0.875rem', color: '#7e8a9a', marginBottom: '2rem' }}>
        تاريخ السريان: <time dateTime="2026-03-23">23 مارس 2026</time> · آخر تحديث:{' '}
        <time dateTime="2026-04-15">15 أبريل 2026</time>
      </div>

      <H2>1. قبول الشروط</H2>
      <P>
        باشتراكك في أكاديمية طلاقة أو استخدامك لأيٍّ من خدماتها، فإنك توافق على الالتزام بهذه
        الشروط والأحكام. إذا لم توافق، يرجى عدم استخدام الخدمة.
      </P>

      <H2>2. وصف الخدمة</H2>
      <P>
        تقدّم الأكاديمية دورات إنجليزي أونلاين عبر كلاسات جماعية مصغّرة (بحد أقصى 7 طلاب لكل مجموعة)
        و/أو حصص فردية، بإجمالي 8 ساعات تدريب شهرياً حسب الباقة المختارة. تُعقد الحصص عبر Google Meet
        في مواعيد محددة مسبقاً، وتشمل الخدمة: المنهج التعليمي، المواد المطبوعة والرقمية، المتابعة
        اليومية مع المدرب، والوصول إلى منصة Fluentia LMS.
      </P>

      <H2>3. التسجيل والحساب</H2>
      <Ul>
        <li>يجب تقديم معلومات صحيحة ومكتملة عند التسجيل.</li>
        <li>أنت مسؤول عن الحفاظ على سرية بيانات حسابك.</li>
        <li>يجب أن تكون بعمر 13 سنة فأكثر، أو بموافقة وليّ الأمر إن كنت دون ذلك.</li>
      </Ul>

      <H2>4. الدفع والاشتراكات</H2>
      <Ul>
        <li>
          <strong>الدفع شهري مقدماً</strong> في بداية كل شهر ميلادي.
        </li>
        <li>الأسعار معلنة بالريال السعودي (SAR) وشاملة لكل ما يخص الباقة المختارة.</li>
        <li>
          <strong>لا يوجد التزام طويل الأمد</strong> — يمكنك إيقاف اشتراكك في نهاية أي شهر.
        </li>
        <li>
          <strong>سياسة الاسترداد:</strong> يُسترد كامل المبلغ خلال 7 أيام من بداية الشهر{' '}
          <u>وبشرط عدم حضور أي حصة</u>. بعد حضور أي حصة، لا يوجد استرداد.
        </li>
        <li>
          <strong>تغيير الباقة:</strong> يمكنك الترقية أو التخفيض في بداية الشهر التالي. لا يُعدَّل
          السعر في منتصف الشهر.
        </li>
      </Ul>

      <H2>5. سلوك الطالب</H2>
      <Ul>
        <li>احترام المدرب والزملاء في جميع الأوقات.</li>
        <li>الحضور في الوقت المحدد — الحصة لا تُعاد بسبب تأخرك.</li>
        <li>عدم تسجيل أو نشر محتوى الكلاسات.</li>
        <li>عدم مشاركة بيانات حسابك مع الآخرين.</li>
      </Ul>
      <P>يحق للأكاديمية إنهاء اشتراك أي طالب يُخلّ بهذه السلوكيات دون استرداد للمبلغ المتبقي.</P>

      <H2>6. الملكية الفكرية</H2>
      <P>
        جميع المناهج والمواد والتسجيلات والفيديوهات والصوتيات المُقدّمة عبر الأكاديمية هي ملكية
        حصرية لأكاديمية طلاقة. لا يحق لك نسخها، إعادة توزيعها، أو نشرها علناً. الاستخدام مقصور على
        تعلّمك الشخصي.
      </P>

      <H2>7. إنهاء الخدمة</H2>
      <P>
        يحق للأكاديمية إنهاء أو تعليق اشتراك أي طالب في الحالات التالية: (أ) الإخلال بهذه الشروط،
        (ب) سلوك مسيء تجاه المدرب أو الزملاء، (ج) محاولة التلاعب في الدفع أو التسجيل. يُعاد المبلغ
        النسبي عن الفترة غير المستخدمة في حالات الإنهاء الإداري فقط.
      </P>

      <H2>8. التنصل من الضمانات</H2>
      <P>
        نبذل قصارى جهدنا لتحقيق أفضل النتائج التعليمية لك، لكنّنا لا نضمن تحقيق مستوى معيّن أو
        درجة IELTS محددة. النتيجة تعتمد على التزامك، تطبيقك، وممارستك الشخصية.
      </P>

      <H2>9. تحديد المسؤولية</H2>
      <P>
        إلى الحد الأقصى الذي يسمح به القانون، لا تتحمل الأكاديمية أي مسؤولية عن أضرار غير مباشرة أو
        تبعية. مسؤوليتنا الكلية في أي حال من الأحوال لا تتجاوز قيمة الاشتراك المدفوع للشهر الحالي.
      </P>

      <H2>10. القانون الحاكم والاختصاص القضائي</H2>
      <P>
        تخضع هذه الشروط لأنظمة المملكة العربية السعودية، وأي نزاع ينشأ عنها يُحال إلى المحاكم
        المختصة في مدينة الرياض.
      </P>

      <H2>11. التواصل</H2>
      <P>
        لأي استفسار بخصوص هذه الشروط:{' '}
        <a href="mailto:fluentia.sa@gmail.com" style={{ color: '#38bdf8', textDecoration: 'none' }}>
          fluentia.sa@gmail.com
        </a>{' '}
        ·{' '}
        <a href={buildWhatsAppUrl(WA_MESSAGES.general)} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'none' }}>
          واتساب: +966 55 866 9974
        </a>
      </P>

      {/* English section */}
      <details
        style={{
          marginTop: '2.5rem',
          padding: '1rem 1.25rem',
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '0.75rem',
        }}
      >
        <summary style={{ cursor: 'pointer', fontWeight: 700, color: '#38bdf8', fontSize: '1rem' }}>
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
          <h3 style={{ color: '#f8fafc', fontSize: '1.25rem' }}>Terms of Service — Fluentia Academy</h3>
          <p>
            <strong>Effective:</strong> March 23, 2026 · <strong>Updated:</strong> April 15, 2026
          </p>
          <p>
            By subscribing to Fluentia Academy you agree to these terms. The service provides online
            English instruction via small-group classes (max 7 students) and/or private sessions,
            totalling 8 training hours per month based on your chosen tier.
          </p>
          <p>
            <strong>Payment:</strong> monthly in advance, in Saudi Riyals (SAR). No long-term
            commitment; cancel at the end of any month. <strong>Refund policy:</strong> full refund
            within 7 days of the month only if no class was attended.
          </p>
          <p>
            <strong>Conduct:</strong> respect trainers and peers, attend on time, do not record or
            share class content, do not share account credentials.
          </p>
          <p>
            <strong>Intellectual property:</strong> all curriculum and materials are proprietary to
            Fluentia Academy and for personal learning use only.
          </p>
          <p>
            <strong>Termination:</strong> we may terminate accounts that violate these terms.{' '}
            <strong>No guarantee</strong> of specific IELTS band or CEFR level is made — outcomes
            depend on your commitment and practice.
          </p>
          <p>
            <strong>Liability:</strong> capped at the current month's subscription value.{' '}
            <strong>Governing law:</strong> Saudi Arabia; disputes heard in Riyadh courts.
          </p>
          <p>
            Contact:{' '}
            <a href="mailto:fluentia.sa@gmail.com" style={{ color: '#38bdf8' }}>
              fluentia.sa@gmail.com
            </a>
          </p>
        </div>
      </details>
    </LegalLayout>
  );
}
