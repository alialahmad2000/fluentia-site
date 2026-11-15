/* ============================================================================
 * /level-test — v2 (2026-11-14). The landing is server-rendered (crawlable:
 * intro, how it works, the level descriptors, FAQ). The test itself is a
 * lazy chunk that loads on the first tap, so the landing stays light.
 * Rollback: LEVEL_TEST_VERSION in src/App.jsx. v1 stays at /level-test-v1.
 * ========================================================================== */
import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Seo from '../../components/Seo';
import BrandMark from '../../components/BrandMark';
import SunMeter from './SunMeter';
import { FAQ, HOW_IT_WORKS, LEVEL_DESCRIPTORS } from './content';
import { ltEvent } from './events';
import { readRun } from './run';
import '../../styles/dawn-tokens.css';
import './lt2.css';

const TestApp = lazy(() => import('./TestApp'));

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
};

const MOCK_BARS = [
  { ar: 'المفردات', rel: 68, v: 'أقوى' },
  { ar: 'القواعد', rel: 52, v: '' },
  { ar: 'الاستماع', rel: 36, v: 'تحتاج شغل' },
];

export default function LevelTestV2() {
  const [mode, setMode] = useState('landing'); // landing | test
  const [resume, setResume] = useState(null);

  useEffect(() => {
    ltEvent('level_test_view', { attempt: 'page' });
    const r = readRun();
    if (r && !r.done) setResume(r);
    // Prefetch the test chunk once the page is idle — the first tap is instant.
    const idle = window.requestIdleCallback || ((f) => setTimeout(f, 1500));
    idle(() => { import('./TestApp'); });
  }, []);

  const begin = (fresh) => {
    setMode(fresh ? 'test-new' : 'test');
    window.scrollTo(0, 0);
  };

  if (mode !== 'landing') {
    return (
      <div className="lt2 fx-dawn" dir="rtl" lang="ar">
        <Seo path="/level-test" />
        <Suspense fallback={<div style={{ minHeight: '100dvh' }} aria-busy="true" />}>
          <TestApp fresh={mode === 'test-new'} onExit={() => { setMode('landing'); setResume(readRun()); }} />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="lt2 fx-dawn" dir="rtl" lang="ar">
      <Seo path="/level-test" />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
      </Helmet>

      <header className="lt2-wrap lt2-wide lt2-bar">
        <a className="lt2-brand" href="/" aria-label="طلاقة: الصفحة الرئيسية">
          <BrandMark size={30} />
          <span>طلاقة</span>
        </a>
        <span className="lt2-bar-note">مجاني، بدون تسجيل</span>
      </header>

      <main>
        <section className="lt2-wrap lt2-wide lt2-hero" aria-labelledby="lt2-h1">
          <div className="lt2-hero-grid">
            <div>
              <h1 id="lt2-h1" className="lt2-h1">اختبار تحديد مستوى اللغة الإنجليزية مجاناً</h1>
              <p className="lt2-lede">أسئلة تتكيّف مع إجاباتك، ومقاطع استماع بأصوات حقيقية، ونتيجة على مقياس CEFR توضّح نقطة البداية.</p>
              {resume ? (
                <>
                  <button type="button" className="lt2-cta is-block" onClick={() => begin(false)}>نكمل من حيث توقفنا</button>
                  <div className="lt2-resume">
                    <span>إجاباتك محفوظة على هذا الجهاز.</span>
                    <button type="button" className="lt2-link" onClick={() => begin(true)}>بدء اختبار جديد</button>
                  </div>
                </>
              ) : (
                <button type="button" className="lt2-cta is-block" onClick={() => begin(true)}>نبدأ الاختبار</button>
              )}
              <ul className="lt2-trust" aria-label="عن الاختبار">
                <li>بدون حساب</li>
                <li>قرابة 10 دقائق</li>
                <li>النتيجة فوراً</li>
              </ul>
            </div>

            <figure className="lt2-card" style={{ margin: 0 }} aria-label="مثال على شكل النتيجة">
              <span className="lt2-mock-tag">مثال على النتيجة</span>
              <SunMeter lvl={3} title="مثال: مستوى B1 على مقياس من ما قبل A1 إلى C1" />
              <div className="lt2-level">
                <span className="lt2-level-name">صار يتكلم</span>
                <span className="lt2-level-code">B1</span>
              </div>
              <p className="lt2-life">حوار كامل في موضوع مألوف، وفهم الفكرة العامة في اجتماع أو مقطع.</p>
              <ul className="lt2-bars" aria-label="مثال على المهارات">
                {MOCK_BARS.map((b) => (
                  <li key={b.ar}>
                    <span>{b.ar}</span>
                    <span className="lt2-track"><span style={{ width: `${b.rel}%` }} /></span>
                    <span className={`lt2-verdict ${b.v === 'أقوى' ? 'is-strong' : b.v ? 'is-weak' : ''}`}>{b.v || 'متوازنة'}</span>
                  </li>
                ))}
              </ul>
            </figure>
          </div>
        </section>

        <section className="lt2-wrap lt2-wide lt2-section" aria-labelledby="lt2-how">
          <h2 id="lt2-how" className="lt2-h2">كيف يحدد الاختبار مستواك</h2>
          <div className="lt2-how">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.h}>
                <h3>{s.h}</h3>
                <p>{s.p}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="lt2-wrap lt2-wide lt2-section" aria-labelledby="lt2-levels">
          <h2 id="lt2-levels" className="lt2-h2">المستويات من ما قبل <span className="lt2-h2-code">A1</span> <span className="lt2-nowrap">إلى <span className="lt2-h2-code">C1</span></span></h2>
          <ul className="lt2-levels">
            {LEVEL_DESCRIPTORS.map(([code, , d]) => (
              <li key={code}>
                <b>{code}</b>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="lt2-wrap lt2-wide lt2-section lt2-faq" aria-labelledby="lt2-faq">
          <h2 id="lt2-faq" className="lt2-h2">أسئلة شائعة</h2>
          {FAQ.map(({ q, a }) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </section>

        <section className="lt2-wrap lt2-final">
          <p className="lt2-h2" style={{ marginBottom: 18 }}>عشر دقائق، ونقطة بداية واضحة.</p>
          <button type="button" className="lt2-cta" onClick={() => begin(!resume)}>{resume ? 'نكمل من حيث توقفنا' : 'نبدأ الاختبار'}</button>
        </section>
      </main>

      <footer className="lt2-wrap lt2-wide lt2-foot">
        <span>طلاقة · </span>
        <a href="/">الصفحة الرئيسية</a>
        <span> · </span>
        <a href="/privacy">الخصوصية</a>
      </footer>
    </div>
  );
}
