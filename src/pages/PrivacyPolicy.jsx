import React from 'react';
import Seo from "../components/Seo";
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

export default function PrivacyPolicy() {
  return (
    <LegalLayout updated={{ iso: '2026-11-14', display: '14 نوفمبر 2026' }}>
      <Seo path="/privacy" />

      <H1>سياسة الخصوصية</H1>
      <div style={{ fontSize: '0.875rem', color: '#7e8a9a', marginBottom: '2rem' }}>
        تاريخ السريان: <time dateTime="2026-03-23">23 مارس 2026</time> · آخر تحديث:{' '}
        <time dateTime="2026-11-14">14 نوفمبر 2026</time>
      </div>

      <H2>1. مقدمة</H2>
      <P>
        نحن في أكاديمية طلاقة ("الأكاديمية"، "نحن") نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.
        توضّح هذه السياسة أنواع البيانات التي نجمعها، وكيف نستخدمها، ومع من نشاركها، وحقوقك
        المتعلقة بها. باستخدامك لموقعنا أو خدماتنا فإنك توافق على ممارساتنا الموضحة هنا.
      </P>

      <H2>2. البيانات التي نجمعها</H2>
      <Ul>
        <li>
          <strong>معلومات الاتصال:</strong> الاسم، البريد الإلكتروني، رقم الجوال، قناة التواصل المفضلة.
        </li>
        <li>
          <strong>معلومات الطالب:</strong> مستواك اللغوي، أهدافك، ملاحظات الأداء، سجل الحضور، نتائج الاختبارات.
        </li>
        <li>
          <strong>بيانات استخدام الموقع:</strong> IP، نوع المتصفح، الصفحات التي زرتها، مصدر الإحالة — عبر Google Analytics 4 و TikTok Pixel، وفقط بعد موافقتك في شريط الموافقة. قبل موافقتك لا تُضبط أي كوكيز تحليلية أو إعلانية، ويصل إلى Google Analytics قياس مجهول للزيارة فقط (بلا كوكيز وبلا معرّف).
        </li>
        <li>
          <strong>تسجيلات صوتية:</strong> عند إرسالك تسجيلات تدريب داخل منصة LMS فقط، وبإذنك الصريح. لا نسجّل كلاساتك الحية إلا بإخطار مسبق.
        </li>
        <li>
          <strong>بيانات الدفع:</strong> لا نخزن بيانات البطاقات لدينا — تُعالج مباشرةً عبر مزوّدي الدفع الآمنين.
        </li>
      </Ul>

      <H2>3. كيف نستخدم البيانات</H2>
      <Ul>
        <li>تقديم الخدمة التعليمية وتخصيص تجربتك التعليمية.</li>
        <li>التواصل معك عبر واتساب، البريد الإلكتروني، تيليجرام بخصوص حصصك ومستواك.</li>
        <li>تحسين المناهج والتجربة بناءً على تحليل الأداء المجمّع.</li>
        <li>الإعلانات المستهدفة (بموافقتك) عبر منصات Google Ads و TikTok Ads.</li>
        <li>الوفاء بالالتزامات القانونية والتنظيمية.</li>
      </Ul>

      <H2>4. مشاركة البيانات</H2>
      <P>
        نشارك بياناتك مع مزوّدي خدمات موثوقين فقط، وبالحد الأدنى اللازم لتشغيل الخدمة:
      </P>
      <Ul>
        <li>
          <strong>Google Workspace</strong> — البريد الإلكتروني وتقويم الحصص.
        </li>
        <li>
          <strong>Supabase</strong> — قاعدة بيانات الطلاب والمنصة التعليمية.
        </li>
        <li>
          <strong>Cloudflare</strong> — استضافة الموقع والمنصّة.
        </li>
        <li>
          <strong>ElevenLabs</strong> — توليد الصوت لتدريب النطق داخل LMS.
        </li>
        <li>
          <strong>Anthropic Claude API</strong> — المساعد التعليمي داخل LMS، و«مستشار طلاقة» (محادثة حجز اللقاء المبدئي في الموقع): نص رسائلك فيها يُعالَج لتوليد الرد.
        </li>
        <li>
          <strong>Resend</strong> — إرسال البريد الإلكتروني المعاملاتي.
        </li>
        <li>
          <strong>Google Ads و TikTok Ads</strong> — قياس أداء الإعلانات، بموافقتك على الكوكيز التسويقية فقط. عند إرسالك نموذج تواصل بعد هذه الموافقة، تُرسَل نسخة مُشفَّرة تشفيراً أحادياً (SHA-256) من رقمك وبريدك إلى TikTok لمطابقة الإعلان الذي أوصلك إلينا، ولا يمكن استرجاع الرقم منها.
        </li>
      </Ul>
      <P>
        لا نبيع بياناتك لأي طرف ثالث لأغراض تسويقية. لا ننقل بياناتك خارج المملكة العربية السعودية
        إلا للمزوّدين المذكورين أعلاه، وبضمانات حماية مناسبة.
      </P>

      <H2>5. حقوقك</H2>
      <P>وفقاً لنظام حماية البيانات الشخصية السعودي (PDPL)، لديك الحق في:</P>
      <Ul>
        <li>
          <strong>الوصول</strong> إلى بياناتك الشخصية التي نحتفظ بها.
        </li>
        <li>
          <strong>تصحيح</strong> أي بيانات غير دقيقة أو غير مكتملة.
        </li>
        <li>
          <strong>حذف</strong> بياناتك (مع استثناءات قانونية محدودة).
        </li>
        <li>
          <strong>الاعتراض</strong> على معالجة معيّنة لبياناتك.
        </li>
        <li>
          <strong>سحب موافقتك</strong> على الكوكيز والإعلانات المستهدفة في أي وقت.
        </li>
        <li>
          <strong>نقل بياناتك</strong> إلى مزوّد آخر بصيغة منظمة.
        </li>
      </Ul>
      <P>
        لممارسة أيٍّ من هذه الحقوق، راسلنا على{' '}
        <a href="mailto:fluentia.sa@gmail.com" style={{ color: '#38bdf8', textDecoration: 'none' }}>
          fluentia.sa@gmail.com
        </a>{' '}
        وسنرد خلال 30 يوماً.
      </P>

      <H2>6. ملفات تعريف الارتباط (Cookies)</H2>
      <P>نستخدم ثلاث فئات من الكوكيز:</P>
      <Ul>
        <li>
          <strong>ضرورية:</strong> لتشغيل الموقع وحفظ جلستك. لا يمكن تعطيلها.
        </li>
        <li>
          <strong>تحليلية:</strong> GA4 لفهم كيف يستخدم الزوار الموقع. اختيارية.
        </li>
        <li>
          <strong>تسويقية:</strong> TikTok Pixel و Google Ads لقياس أداء الإعلانات. اختيارية.
        </li>
      </Ul>
      <P>
        يمكنك التحكم في تفضيلاتك عبر شريط الموافقة الذي يظهر عند أول زيارة، وتغيير اختيارك في أي وقت من هنا:{' '}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event('fluentia-open-cookie-settings'))}
          style={{
            font: 'inherit', fontWeight: 700, color: '#38bdf8', background: 'rgba(56,189,248,0.08)',
            border: '1px solid rgba(56,189,248,0.3)', borderRadius: '0.5rem', padding: '0.5rem 0.875rem',
            minHeight: 44, cursor: 'pointer', marginBlockStart: '0.25rem',
          }}
        >
          إعدادات ملفات تعريف الارتباط
        </button>
      </P>

      <H2>7. أمن البيانات</H2>
      <P>
        نحمي بياناتك بتشفير TLS 1.3 أثناء النقل وتشفير AES-256 في التخزين. الوصول إلى بيانات الطلاب
        مقصور على المدربين والإدارة، ويُسجَّل ويُراجَع دورياً.
      </P>

      <H2>8. الاحتفاظ بالبيانات</H2>
      <P>
        نحتفظ ببيانات الطالب طوال فترة اشتراكه النشط، ومدة إضافية قدرها سنتان بعد انتهاء الاشتراك
        (لأغراض قانونية ومحاسبية)، ثم تُحذف أو تُجعل مجهّلة الهوية.
      </P>

      <H2>9. الأطفال</H2>
      <P>
        لا نقدّم خدماتنا عن قصد للأطفال دون سن 13 عاماً دون موافقة وليّ الأمر. إذا علمنا أنّنا جمعنا
        بيانات من طفل دون هذه الموافقة، سنحذفها فوراً.
      </P>

      <H2>10. التحديثات</H2>
      <P>
        قد نحدّث هذه السياسة من حينٍ لآخر. التغييرات الجوهرية ستُعلَم بها عبر البريد الإلكتروني أو
        إشعار بارز في الموقع قبل 14 يوماً من السريان.
      </P>

      <H2>11. التواصل</H2>
      <P>
        لأي استفسار حول الخصوصية أو بياناتك، راسلنا:{' '}
        <a href="mailto:fluentia.sa@gmail.com" style={{ color: '#38bdf8', textDecoration: 'none' }}>
          fluentia.sa@gmail.com
        </a>
      </P>

      <H2>12. القانون الحاكم</H2>
      <P>
        تخضع هذه السياسة لأنظمة المملكة العربية السعودية، وتحديداً نظام حماية البيانات الشخصية
        الصادر بالمرسوم الملكي رقم م/19 بتاريخ 1443/2/9هـ.
      </P>


      <H2 id="apps">13. تطبيقات طلاقة (ماك، آيفون، آيباد) والمنصّة</H2>
      <P>
        التطبيقات الأصلية للأكاديمية وتطبيق الويب (app.fluentia.academy) تعمل على الحساب نفسه والبيانات نفسها الموضّحة
        أعلاه. لتشغيلها بثبات وتحسينها، تجمع التطبيقات والمنصّة أيضًا:
      </P>
      <Ul>
        <li>
          <strong>تقارير الأعطال والأخطاء</strong> عبر Sentry (خوادم في الاتحاد الأوروبي): نوع الجهاز، إصدار النظام،
          إصدار التطبيق، الشاشة المفتوحة، وتفاصيل العطل التقنية، مع معرّف حسابك ودورك (طالب/مدرّب). لا تتضمن اسمك ولا بريدك
          ولا ما تكتبه.
        </li>
        <li>
          <strong>إحصاءات الاستخدام</strong> عبر PostHog (خوادم في الاتحاد الأوروبي): الشاشات التي تفتحها، الإجراءات
          الرئيسية (مثل تأكيد حصة أو إرسال واجب)، ومدة الجلسة، مرتبطة بمعرّف حسابك ودورك. على تطبيق الويب قد تُسجَّل
          الجلسة كتسجيل تفاعلي مع إخفاء كل حقول الإدخال؛ لا تسجيل جلسات في تطبيقات ماك وآيفون وآيباد.
        </li>
        <li>
          <strong>الإشعارات:</strong> عند تفعيلها، يُخزَّن رمز الجهاز لإرسال تنبيهات الحصص والرسائل. يمكنك إيقافها من
          إعدادات الجهاز في أي وقت.
        </li>
        <li>
          <strong>الرسائل:</strong> الرسائل التي تتبادلها مع مدرّبك أو فريق الأكاديمية داخل التطبيق والمنصّة (نصًا أو صوتًا
          أو صورًا) تُحفظ في قاعدة بيانات المنصّة، ولا يراها إلا أطراف المحادثة وفريق الأكاديمية المسؤول عن متابعتك. لا
          توجد محادثات عامة ولا بحث عن مستخدمين آخرين.
        </li>
        <li>
          <strong>«مشاهد»:</strong> المقاطع تُعرض داخل التطبيق بمشغّل YouTube الرسمي، فتصل Google عنوان IP ونوع الجهاز والمقطع
          المعروض عند التشغيل، دون ملفات تعريف دائمة ودون ربط بالإعلانات.
        </li>
        <li>
          <strong>الميكروفون:</strong> يُستخدم فقط عند ضغطك على زر التسجيل في تمارين التحدث، ويُحلَّل التسجيل بالذكاء
          الاصطناعي لإعطائك ملاحظات. لا تسجيل في الخلفية.
        </li>
      </Ul>
      <P>لا تحتوي التطبيقات على أي عملية شراء؛ الاشتراك يُدار مع فريق الأكاديمية خارجها.</P>

      <H2 id="deletion">14. حذف الحساب من داخل التطبيق</H2>
      <P>
        يمكنك طلب حذف حسابك من إعدادات التطبيق (الحساب ← حذف الحساب) أو بمراسلتنا. عند الطلب يتوقف الدخول فورًا على كل
        الأجهزة، ويُغلق الحساب نهائيًا خلال 30 يومًا: تُحذف بيانات التواصل والتعريف، ويُحتفظ بالسجل التعليمي مجهول
        الهوية وبالمستندات المالية المطلوبة نظامًا (المادة 8). خلال الثلاثين يومًا يمكنك التراجع بمراسلة فريق الدعم.
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
          <h3 style={{ color: '#f8fafc', fontSize: '1.25rem' }}>Privacy Policy — Fluentia Academy</h3>
          <p>
            <strong>Effective:</strong> March 23, 2026 · <strong>Updated:</strong> November 14, 2026
          </p>
          <p>
            Fluentia Academy ("we", "us") respects your privacy. This policy explains what personal
            data we collect, how we use it, and your rights.
          </p>
          <p>
            <strong>Data we collect:</strong> name, email, phone, language level and goals,
            performance notes, voice recordings (LMS only, with consent), site analytics (GA4,
            TikTok Pixel — only after you accept them in the consent banner; before that GA4 gets
            cookieless, anonymous pings only). We do not store payment card data.
          </p>
          <p>
            <strong>How we use it:</strong> to deliver lessons, communicate with you, improve our
            curriculum, and (with your consent) run targeted ads.
          </p>
          <p>
            <strong>We share data with:</strong> Google Workspace, Supabase, Cloudflare, ElevenLabs,
            Anthropic (the LMS assistant and the «مستشار طلاقة» booking chat on this site), Resend,
            Google Ads, TikTok Ads (with marketing consent only; a one-way SHA-256 hash of the phone
            and email you submit is used to match the ad that brought you). We do not sell your data.
          </p>
          <p>
            <strong>Your rights (aligned with Saudi PDPL):</strong> access, correct, delete, object,
            withdraw consent, data portability. Email{' '}
            <a href="mailto:fluentia.sa@gmail.com" style={{ color: '#38bdf8' }}>
              fluentia.sa@gmail.com
            </a>{' '}
            to exercise any right.
          </p>
          <p>
            <strong>Cookies:</strong> essential (always on), analytics (optional), marketing
            (optional). Nothing optional runs until you accept it in the consent banner; change your
            choice any time with the «إعدادات ملفات تعريف الارتباط» button above.
          </p>
          <p>
            <strong>Security:</strong> TLS 1.3 in transit, AES-256 at rest. <strong>Retention:</strong>{' '}
            active subscription + 2 years, then deleted or anonymised. <strong>Children:</strong> we do
            not knowingly serve under-13s without guardian consent.
          </p>
          <p>
            <strong>Apps (Mac, iPhone, iPad) and the platform:</strong> the native apps and the web app
            (app.fluentia.academy) use the same account and data. To keep them stable and improve them they
            also collect crash and error reports through Sentry (EU servers: device model, OS and app version,
            the open screen, technical crash details, your account id and role — never your name, email or
            typed text) and usage analytics through PostHog (EU servers: screens opened, key actions such as
            confirming a class or submitting homework, session length, tied to your account id and role).
            On the web app a session may be recorded as an interactive replay with every input field masked;
            there is no session recording in the Mac, iPhone or iPad apps. Push notification tokens are stored
            only when you enable notifications. Messages you exchange with your trainer or the academy team inside
            the app and the platform (text, voice or images) are stored in the platform's database and are seen only by
            the people in that conversation and the academy staff who follow your learning; there are no public posts
            and no way to find other users. Film scenes play inside the app in YouTube's official embedded player, so Google receives the IP address,
            device type and the clip being played; no persistent identifiers and nothing linked to advertising. The microphone is used only when you tap record in a speaking
            exercise. The apps sell nothing; subscriptions are handled with the academy team outside them.
          </p>
          <p>
            <strong>Account deletion:</strong> request it from the app's Settings (Account → Delete account)
            or by email. Sign-in stops immediately on every device and the account is closed within 30 days:
            contact and identifying data are deleted, the learning record is kept anonymised and financial
            records required by law are retained (section 8). You can cancel the request within the 30 days
            by contacting support.
          </p>
          <p>Governing law: Kingdom of Saudi Arabia (PDPL, Royal Decree No. M/19).</p>
        </div>
      </details>
    </LegalLayout>
  );
}
