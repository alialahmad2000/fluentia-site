import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Seo from "../../components/Seo";
import BrandMark from "../../components/BrandMark";
import { PrimaryCTA } from "../../components/landing";
import NotFound from "../NotFound";
import { getWorkPage, termCount, workPath, WORK_HUB_PATH, WORK_PAGES } from "../../content/workEnglish";
import { workPageSeo, SITE } from "../../content/seo";
import { useTrialHref } from "../../lib/trialLink";
import { track } from "../../lib/track";
import "./work.css";

/* ============================================================================
 * /work-english/:slug — one field's work-English glossary.
 *
 * Built for the searches that actually happen: «مصطلحات <مجال> بالانجليزي»
 * + "pdf" / "مترجمة" / "مع النطق". So: terms grouped by real work situation with
 * Arabic and an example, a pronunciation button (device speech — optional, only
 * rendered where the browser has it), a print stylesheet that turns the page into
 * the PDF people look for, then phrases, mistakes, a dialogue, an FAQ, and the
 * door into «درسك الأول» for this field.
 *
 * Content is data (src/content/work-english/<slug>.js). No 2nd-person gendered
 * verbs in the template copy — the reader's gender is unknown.
 * ========================================================================== */

export function WorkBar() {
  return (
    <div className="we-bar">
      <div className="we-wrap">
        <Link to="/" className="we-brand" aria-label="أكاديمية طلاقة — الرئيسية">
          <BrandMark size={26} />
          <span>طلاقة</span>
        </Link>
        <Link to={WORK_HUB_PATH} className="we-barlink">الإنجليزي للعمل ←</Link>
      </div>
    </div>
  );
}

function useSpeech(field) {
  const [can, setCan] = useState(false);
  const counted = useRef(false);
  useEffect(() => {
    setCan(typeof window !== "undefined" && "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function");
  }, []);
  const say = (text) => {
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new window.SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 0.9;
      const voice = synth.getVoices().find((v) => /^en(-|_)(US|GB)/i.test(v.lang));
      if (voice) u.voice = voice;
      synth.speak(u);
      if (!counted.current) {
        counted.current = true;
        track("work_glossary_speak", { field });
      }
    } catch { /* speech is a nicety */ }
  };
  return { can, say };
}

function SayButton({ can, say, text }) {
  if (!can) return null;
  return (
    <button type="button" className="we-say" onClick={() => say(text)} aria-label={`تشغيل نطق ${text}`} title="النطق">
      <span aria-hidden>▶</span>
    </button>
  );
}

export default function WorkEnglishPage() {
  const { slug } = useParams();
  const page = getWorkPage(slug);
  const { can, say } = useSpeech(slug);
  const trialHref = useTrialHref({ source: "work_english", job: page?.trialJob || undefined });

  if (!page) return <NotFound />;

  const url = `${SITE}${workPath(page.slug)}`;
  const nTerms = termCount(page);
  const related = WORK_PAGES.filter((p) => p.slug !== page.slug);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "الإنجليزي للعمل", item: `${SITE}${WORK_HUB_PATH}` },
      { "@type": "ListItem", position: 3, name: page.field, item: url },
    ],
  };
  const termSetLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": `${url}#terms`,
    name: page.h1,
    inLanguage: ["en", "ar"],
    url,
    hasDefinedTerm: page.groups.flatMap((g) =>
      g.terms.map((t) => ({ "@type": "DefinedTerm", name: t.en, description: t.ar, inDefinedTermSet: `${url}#terms` })),
    ),
  };
  const faqLd = page.faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: page.faq.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      }
    : null;

  return (
    <div className="lp-scope we">
      <Seo entry={workPageSeo(page)} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
        <script type="application/ld+json">{JSON.stringify(termSetLd)}</script>
        {faqLd ? <script type="application/ld+json">{JSON.stringify(faqLd)}</script> : null}
      </Helmet>

      <WorkBar />

      <main className="we-wrap">
        <header className="we-head">
          <nav className="we-crumbs" aria-label="مسار الصفحة">
            <Link to="/">الرئيسية</Link><span aria-hidden>/</span>
            <Link to={WORK_HUB_PATH}>الإنجليزي للعمل</Link><span aria-hidden>/</span>
            <span>{page.field}</span>
          </nav>
          <h1 className="we-h1">{page.h1}</h1>
          <div className="we-intro">
            {page.intro.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <div className="we-stats">
            <span className="we-stat"><b>{nTerms}</b> مصطلحاً</span>
            <span className="we-stat"><b>{page.phrases.length}</b> جملة جاهزة</span>
            <span className="we-stat"><b>{page.mistakes.length}</b> أخطاء شائعة</span>
          </div>
          <div className="we-actions">
            <button
              type="button"
              className="we-ghost"
              onClick={() => { track("work_glossary_print", { field: page.slug }); window.print(); }}
            >
              طباعة القائمة أو حفظها PDF
            </button>
            <a
              className="we-ghost"
              href={trialHref}
              data-cta={`work_${page.slug}_top`}
              onClick={() => track("trial_click", { source: "work_english", field: page.slug, position: "top" })}
            >
              درس مجاني من هذا المجال ←
            </a>
          </div>
          <ul className="we-toc" aria-label="أقسام الصفحة">
            {page.groups.map((g, i) => <li key={g.title}><a href={`#g-${i}`}>{g.title}</a></li>)}
            <li><a href="#phrases">جمل جاهزة</a></li>
            <li><a href="#mistakes">أخطاء شائعة</a></li>
            {page.dialogue ? <li><a href="#dialogue">حوار من العمل</a></li> : null}
          </ul>
        </header>

        {page.groups.map((g, i) => (
          <section key={g.title} id={`g-${i}`} className="we-sec">
            <h2 className="we-h2">{g.title}</h2>
            <ul className="we-terms">
              {g.terms.map((t) => (
                <li key={t.en} className="we-term">
                  <div className="we-en"><SayButton can={can} say={say} text={t.en} /><b>{t.en}</b></div>
                  <div className="we-ar">{t.ar}</div>
                  {t.ex ? (
                    <div className="we-ex">
                      <span className="e">{t.ex}</span>
                      {t.exAr ? <span className="a">{t.exAr}</span> : null}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section id="phrases" className="we-sec">
          <h2 className="we-h2">جمل جاهزة للعمل<small>عبارات تُقال كما هي في مواقف {page.field} اليومية</small></h2>
          <ul className="we-phrases">
            {page.phrases.map((ph) => (
              <li key={ph.en} className="we-phrase">
                <div className="e"><span>{ph.en}</span><SayButton can={can} say={say} text={ph.en} /></div>
                <div className="a">{ph.ar}</div>
                {ph.when ? <div className="w">{ph.when}</div> : null}
              </li>
            ))}
          </ul>
        </section>

        <section id="mistakes" className="we-sec">
          <h2 className="we-h2">أخطاء شائعة عند المتحدثين بالعربية</h2>
          <div className="we-mistakes">
            {page.mistakes.map((m) => (
              <div key={m.wrong} className="we-mistake">
                <div className="row bad"><i aria-label="خطأ">✕</i><span>{m.wrong}</span></div>
                <div className="row good"><i aria-label="صحيح">✓</i><span>{m.right}</span></div>
                <p className="why">{m.why}</p>
              </div>
            ))}
          </div>
        </section>

        {page.dialogue ? (
          <section id="dialogue" className="we-sec">
            <h2 className="we-h2">{page.dialogue.title}</h2>
            <div className="we-dialogue">
              {page.dialogue.context ? <p className="ctx">{page.dialogue.context}</p> : null}
              {page.dialogue.lines.map((l, i) => (
                <div key={i} className="we-line">
                  <div className="who">{l.who}</div>
                  <div className="e">{l.en}</div>
                  <div className="a">{l.ar}</div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <aside className="we-cta">
          <h2>القائمة تُحفظ… والطلاقة تُبنى بالاستخدام</h2>
          <p>
            في «درسك الأول» نصّ إنجليزي حقيقي من يوم العمل في {page.field}، ومصطلحاته، وأسئلة عليه،
            والتصحيح بالعربية في نفس اللحظة — مجاناً ومن غير حساب. ولمعرفة المستوى بدقة قبل أي خطة،
            اختبار تحديد المستوى المجاني في عشر دقائق.
          </p>
          <div className="links">
            <PrimaryCTA
              href={trialHref}
              data-cta={`work_${page.slug}_cta`}
              onClick={() => track("trial_click", { source: "work_english", field: page.slug, position: "bottom" })}
            >
              ادخل على درس من مجال {page.field} ←
            </PrimaryCTA>
            <a className="we-ghost" href="/level-test">اختبار تحديد المستوى</a>
          </div>
        </aside>

        {page.faq?.length ? (
          <section className="we-sec we-faq">
            <h2 className="we-h2">أسئلة شائعة</h2>
            {page.faq.map(({ q, a }) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </section>
        ) : null}

        <section className="we-sec we-noprint">
          <h2 className="we-h2">مصطلحات مجالات أخرى بالإنجليزي</h2>
          <ul className="we-related">
            {related.map((p) => <li key={p.slug}><Link to={workPath(p.slug)}>{p.field}</Link></li>)}
          </ul>
        </section>

        <footer className="we-foot">أكاديمية طلاقة · آخر تحديث {page.dateModified}</footer>
      </main>
    </div>
  );
}
