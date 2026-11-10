import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "../../styles/v1-tokens.css";
import "../../styles/v5-tokens.css";
// Inlined, as on the homepage: the prerendered page paints styled at once.
import NEXT_CSS from "../next/next.css?inline";
import JOURNAL_CSS from "./journal.css?inline";
import Seo from "../../components/Seo";
import V1LeadModal from "../v1/V1LeadModal";
import { V1Footer } from "../v1/V1Closing";
import Header from "../next/Header";
import NotFound from "../NotFound";
import Plate from "./plates";
import { Cover, Inline } from "./parts";
import { SITE, journalSeo } from "../../content/seo";
import {
  JOURNAL_NAME,
  JOURNAL_PATH,
  dateLabel,
  getJournalArticle,
  journalPath,
  plain,
  readLabel,
  relatedArticles,
  wordCount,
} from "../../content/journal/index.js";

// Heavy, below-the-fold art loads in its own chunks. Prerendered HTML already
// holds their markup, so hydration waits for the chunk without repainting.
const Scene = lazy(() => import("./scenes"));
const Try = lazy(() => import("./interactives"));

/**
 * Narration is built but switched off: no article ships an audio file yet
 * (2026-11-10). Turn on by setting this to true AND giving the article an
 * `audio: "/audio/journal/<slug>.mp3"` field.
 */
const AUDIO_ENABLED = false;

/**
 * /journal/<slug> — one «مجلة طلاقة» article: a full-screen plate, then the
 * text with its scenes and one interactive, then the ending, sources and two
 * related covers. Content lives only in src/content/journal/<slug>.js.
 */
export default function JournalArticle() {
  const { slug } = useParams();
  const article = getJournalArticle(slug);
  if (!article) return <NotFound />;
  return <ArticleView key={article.slug} article={article} />;
}

function ArticleView({ article }) {
  const seo = journalSeo(article);
  const bodyRef = useRef(null);
  const barRef = useRef(null);
  const [share, setShare] = useState(null); // the quote being shared

  useReadingProgress(bodyRef, barRef);

  const words = wordCount(article);
  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    inLanguage: "ar-SA",
    datePublished: article.date,
    dateModified: article.updated || article.date,
    wordCount: words,
    timeRequired: `PT${Math.max(1, Math.round(words / 180))}M`,
    articleSection: article.category,
    isPartOf: { "@type": "Periodical", name: JOURNAL_NAME, url: `${SITE}${JOURNAL_PATH}` },
    author: {
      "@type": "Person",
      name: "علي الأحمد",
      alternateName: "Ali Alahmad",
      url: `${SITE}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: "أكاديمية طلاقة",
      url: SITE,
      logo: { "@type": "ImageObject", url: `${SITE}/logo.png` },
    },
    image: { "@type": "ImageObject", url: seo.ogImage, width: 1200, height: 630 },
    mainEntityOfPage: { "@type": "WebPage", "@id": seo.url },
    ...(article.sources?.length
      ? { citation: article.sources.map((s) => ({ "@type": "CreativeWork", name: s.label, url: s.url })) }
      : {}),
  };
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: JOURNAL_NAME, item: `${SITE}${JOURNAL_PATH}` },
      { "@type": "ListItem", position: 3, name: article.title, item: seo.url },
    ],
  };
  const related = relatedArticles(article);

  return (
    <div className="v1-scope v5-scope fx-next jr" dir="rtl">
      <style dangerouslySetInnerHTML={{ __html: NEXT_CSS + JOURNAL_CSS }} />
      <Seo entry={seo} />
      <Helmet>
        <link rel="preload" as="font" type="font/woff2" href="/fonts/kufam-800-arabic.woff2" crossOrigin="" />
        <meta property="article:published_time" content={article.date} />
        <meta property="article:section" content={article.category} />
        <script type="application/ld+json">{JSON.stringify(ld)}</script>
        <script type="application/ld+json">{JSON.stringify(crumbs)}</script>
      </Helmet>
      <div className="jr-progress" ref={barRef} aria-hidden="true" />
      <Header page={JOURNAL_PATH} />

      <main>
        <article>
          <header id="fx-top" className="jr-plate">
            <div className="jr-plate-art"><Plate slug={article.slug} /></div>
            <div className="jr-plate-inner">
              <p className="jr-kicker jr-rise">
                <Link to={JOURNAL_PATH}>{JOURNAL_NAME}</Link>
                <span className="jr-chip">{article.category}</span>
              </p>
              <h1 className="jr-title jr-rise jr-rise-2">{article.title}</h1>
              <p className="jr-dek jr-rise jr-rise-3">{article.dek}</p>
              <div className="jr-meta jr-rise jr-rise-3">
                <span>علي الأحمد</span>
                <i className="jr-meta-dot" />
                <time dateTime={article.date}>{dateLabel(article.date)}</time>
                <i className="jr-meta-dot" />
                <span>{readLabel(article)}</span>
              </div>
              {AUDIO_ENABLED && article.audio ? <AudioPlayer src={article.audio} /> : null}
            </div>
            <span className="jr-cue" aria-hidden="true" />
          </header>

          <div className="jr-body" ref={bodyRef}>
            {article.body.map((block, i) => (
              <Block key={i} block={block} onShare={setShare} />
            ))}
          </div>

          <footer className="jr-end">
            <div className="jr-author">
              <div>
                <b>علي الأحمد</b> · مؤسس أكاديمية طلاقة
                <br />
                يكتب في {JOURNAL_NAME} عن الإنجليزي في بيئة العمل.
              </div>
            </div>
            <div className="jr-row" style={{ justifyContent: "center", marginTop: 18 }}>
              <button type="button" className="jr-share-btn" onClick={() => setShare(article.quote)}>
                <ShareIcon /> شاركوا جملة المقال
              </button>
            </div>
            <div className="jr-invite">
              <p>
                إذا حسّيتوا إن المقال يتكلم عنكم، فالخطوة الجاية بسيطة: لقاء مبدئي، نسمع فيه وين يوقف الإنجليزي عندكم، ووين تبونه يوصل. وبعدها القرار لكم.
              </p>
              <button type="button" data-open-form className="jr-invite-link">
                احجزوا لقاءكم المبدئي ←
              </button>
            </div>
            <section className="jr-sources" aria-labelledby="jr-src">
              <h2 id="jr-src">مصادر</h2>
              {article.sources?.length ? (
                <ol>
                  {article.sources.map((s) => (
                    <li key={s.url}>
                      {s.label}{" "}
                      <a href={s.url} target="_blank" rel="noopener noreferrer">{s.url.replace(/^https?:\/\//, "")}</a>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="jr-sources-none">
                  ما في هذا المقال أرقام أو دراسات منقولة. الجمل الإنجليزية فيه أمثلة شائعة في بيئة العمل.
                </p>
              )}
            </section>
          </footer>
        </article>

        {related.length ? (
          <section className="jr-related" aria-labelledby="jr-rel">
            <h2 id="jr-rel">اقرؤوا بعدها</h2>
            <div className="jr-covers">
              {related.map((a) => <Cover key={a.slug} article={a} />)}
            </div>
          </section>
        ) : null}
      </main>

      <div className="fx-footer"><V1Footer /></div>
      <V1LeadModal />
      {share ? <ShareSheet article={article} quote={share} onClose={() => setShare(null)} /> : null}
    </div>
  );
}

function Block({ block, onShare }) {
  const [type, v] = block;
  switch (type) {
    case "p":
      return <p className="jr-p jr-b"><Inline text={v} /></p>;
    case "h":
      return <h2 className="jr-h jr-b"><Inline text={v} /></h2>;
    case "punch":
      return <p className="jr-punch jr-b"><Inline text={v} /></p>;
    case "pull":
      return (
        <figure className="jr-pull jr-b">
          <blockquote><Inline text={v} /></blockquote>
          <button type="button" className="jr-share-btn" onClick={() => onShare(plain(v))}>
            <ShareIcon /> شاركوها كصورة
          </button>
        </figure>
      );
    case "close":
      return <p className="jr-close jr-b"><Inline text={v} /></p>;
    case "steps":
      return (
        <ol className="jr-steps jr-b">
          {v.map(([title, text]) => (
            <li key={title}>
              <h3><Inline text={title} /></h3>
              <p><Inline text={text} /></p>
            </li>
          ))}
        </ol>
      );
    case "en":
      return (
        <ul className="jr-enlist jr-b">
          {v.map(([en, gloss]) => (
            <li key={en}>
              <span className="jr-en-line" dir="ltr" lang="en">{en}</span>
              {gloss ? <span className="jr-gloss"><Inline text={gloss} /></span> : null}
            </li>
          ))}
        </ul>
      );
    case "scene":
      return (
        <Suspense fallback={<div className="jr-scene" aria-hidden="true" />}>
          <Scene id={v} />
        </Suspense>
      );
    case "try":
      return (
        <Suspense fallback={<div className="jr-try jr-b" style={{ minHeight: 360 }} aria-hidden="true" />}>
          <Try id={v} />
        </Suspense>
      );
    default:
      return null;
  }
}

/** The thin sky line at the top: how far through the text we are. No React state. */
function useReadingProgress(bodyRef, barRef) {
  useEffect(() => {
    const body = bodyRef.current;
    const bar = barRef.current;
    if (!body || !bar) return undefined;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = body.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      const v = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      bar.style.transform = `scaleX(${v.toFixed(4)})`;
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    update();
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [bodyRef, barRef]);
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12" />
      <path d="M7 8l5-5 5 5" />
      <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
    </svg>
  );
}

/**
 * The share sheet: paints the quote as a story card (1080×1920) and a post
 * card (1080×1350) in the article's art, then offers the system share sheet
 * (when the browser can share files) or a download of each.
 */
function ShareSheet({ article, quote, onClose }) {
  const [cards, setCards] = useState(null); // { story: {url, blob}, post: {url, blob} } | "error"
  const closeRef = useRef(null);
  const lastFocus = useRef(null);

  useEffect(() => {
    lastFocus.current = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      lastFocus.current?.focus?.();
    };
  }, [onClose]);

  useEffect(() => {
    let alive = true;
    const urls = [];
    (async () => {
      try {
        const { paint, toBlob } = await import("./share.js");
        const svgEl = document.querySelector(".jr-plate-art svg");
        const out = {};
        for (const kind of ["story", "post"]) {
          const canvas = await paint({ kind, svgEl, quote, title: article.title });
          const blob = await toBlob(canvas);
          if (!blob) throw new Error("toBlob");
          const url = URL.createObjectURL(blob);
          urls.push(url);
          out[kind] = { url, blob };
        }
        if (alive) setCards(out);
      } catch {
        if (alive) setCards("error");
      }
    })();
    return () => {
      alive = false;
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [article, quote]);

  const fileFor = useCallback(
    (kind) => new File([cards[kind].blob], `fluentia-journal-${article.slug}-${kind}.png`, { type: "image/png" }),
    [cards, article.slug],
  );
  const canShareFiles =
    cards && cards !== "error" && typeof navigator !== "undefined" && navigator.canShare && (() => {
      try { return navigator.canShare({ files: [fileFor("story")] }); } catch { return false; }
    })();

  const shareFiles = async (kind) => {
    try {
      await navigator.share({
        files: [fileFor(kind)],
        title: article.title,
        text: `${quote}\n${SITE}${journalPath(article.slug)}`,
      });
    } catch { /* dismissed */ }
  };

  return (
    <div className="jr-sheet" role="dialog" aria-modal="true" aria-labelledby="jr-sheet-h" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="jr-sheet-card">
        <div className="jr-row" style={{ justifyContent: "space-between", marginTop: 0 }}>
          <h2 id="jr-sheet-h" style={{ margin: 0 }}>شاركوها كصورة</h2>
          <button type="button" ref={closeRef} className="jr-btn jr-btn--ghost" onClick={onClose} aria-label="إغلاق">إغلاق</button>
        </div>
        {cards === null ? <div className="jr-sheet-wait" aria-live="polite">نجهّز الصورة…</div> : null}
        {cards === "error" ? <p className="jr-fb">ما قدرنا نجهّز الصورة على هذا الجهاز. ممكن نسخ الجملة ومشاركتها كنص.</p> : null}
        {cards && cards !== "error" ? (
          <>
            <div className="jr-sheet-previews" style={{ marginTop: 16 }}>
              <figure>
                <img src={cards.story.url} alt={`بطاقة ستوري: ${quote}`} width="1080" height="1920" />
                <figcaption>ستوري 1080×1920</figcaption>
              </figure>
              <figure>
                <img src={cards.post.url} alt={`بطاقة بوست: ${quote}`} width="1080" height="1350" />
                <figcaption>بوست 1080×1350</figcaption>
              </figure>
            </div>
            <div className="jr-row">
              {canShareFiles ? (
                <>
                  <button type="button" className="jr-btn" onClick={() => shareFiles("story")}>مشاركة الستوري</button>
                  <button type="button" className="jr-btn jr-btn--ghost" onClick={() => shareFiles("post")}>مشاركة البوست</button>
                </>
              ) : (
                <>
                  <a className="jr-btn" href={cards.story.url} download={`fluentia-journal-${article.slug}-story.png`}>حفظ الستوري</a>
                  <a className="jr-btn jr-btn--ghost" href={cards.post.url} download={`fluentia-journal-${article.slug}-post.png`}>حفظ البوست</a>
                </>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

/** Narration player — rendered only when AUDIO_ENABLED and the article has audio. */
function AudioPlayer({ src }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  const [t, setT] = useState(0);
  return (
    <div className="jr-audio">
      <button
        type="button"
        aria-label={on ? "إيقاف الاستماع" : "استمعوا للمقال"}
        onClick={() => {
          const a = ref.current;
          if (!a) return;
          if (a.paused) a.play().catch(() => {});
          else a.pause();
        }}
      >
        {on ? "❚❚" : "▶"}
      </button>
      <span>استمعوا للمقال</span>
      <span className="jr-audio-bar" aria-hidden="true"><i style={{ transform: `scaleX(${t})` }} /></span>
      <audio
        ref={ref}
        src={src}
        preload="none"
        playsInline
        onPlay={() => setOn(true)}
        onPause={() => setOn(false)}
        onTimeUpdate={(e) => setT(e.currentTarget.duration ? e.currentTarget.currentTime / e.currentTarget.duration : 0)}
      />
    </div>
  );
}
