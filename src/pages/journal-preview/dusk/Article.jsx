import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PreviewMeta, Art } from "../shared";
import Shell from "./Shell";
import { Card, Dunes, Horizon, Inline, MOTIF_OF } from "./Parts";
import { previewPath } from "../../../content/journal/preview.js";
import { JOURNAL_NAME, dateLabel, plain, readLabel, relatedArticles } from "../../../content/journal/index.js";

const Scene = lazy(() => import("./Scenes"));
const Try = lazy(() => import("./Tries"));

const SITE = "https://fluentia.academy";

/** Plates with their own photograph keep only the foreground dune; the others get three layers + a motif. */
const PHOTO_PLATES = { "first-ten-minutes": true };

export default function Article({ direction, article }) {
  const dir = direction.id;
  const barRef = useRef(null);
  const bodyRef = useRef(null);
  const [share, setShare] = useState(null);
  const related = relatedArticles(article);
  const photo = PHOTO_PLATES[article.slug];
  const motif = MOTIF_OF[article.slug];
  let chapter = 0;
  let ledeDone = false;

  return (
    <Shell barRef={barRef} bodyRef={bodyRef}>
      <PreviewMeta title={`${article.title} | ${direction.name}`} description={article.description} image={`/images/journal/dusk/plate-${article.slug}-og.jpg`} />
      <article>
        <header id="fx-top" className={`dk-plate${photo ? " dk-plate--photo" : ""}`}>
          <div className="dk-plate-bg" data-plx="0.22">
            <Art dir="dusk" name={`plate-${article.slug}`} eager alt="" />
          </div>
          <span className="dk-plate-tint" />
          <Dunes seed={article.slug} layers={photo ? ["near"] : ["far", "mid", "near"]} motif={photo ? null : motif} className="dk-dunes--plate" />
          <span className="dk-grain" />
          <div className="dk-plate-in">
            <p className="dk-kicker">
              <Link to={previewPath(dir)}>{JOURNAL_NAME}</Link>
              <i /> <span>{article.category}</span>
            </p>
            <h1 className="dk-title">{article.title}</h1>
            <p className="dk-dek">{article.dek}</p>
            <div className="dk-meta">
              <span>علي الأحمد</span><i />
              <time dateTime={article.date}>{dateLabel(article.date)}</time><i />
              <span>{readLabel(article)}</span>
            </div>
          </div>
          <span className="dk-cue dk-cue--dot" aria-hidden="true" />
        </header>

        <div className="dk-body" ref={bodyRef}>
          {article.body.map((block, i) => {
            const [type, v] = block;
            if (type === "h") chapter += 1;
            const lede = type === "p" && !ledeDone;
            if (type === "p") ledeDone = true;
            return <Block key={i} block={block} lede={lede} chapter={chapter} seed={`${article.slug}-${i}`} onShare={setShare} />;
          })}
        </div>

        <footer className="dk-end">
          <Horizon seed={`${article.slug}-end`} />
          <div className="dk-author dk-r">
            <b>علي الأحمد</b> · مؤسس أكاديمية طلاقة
            <br />
            يكتب في {JOURNAL_NAME} عن الإنجليزي في بيئة العمل.
          </div>
          <div className="dk-row dk-row--c dk-r">
            <button type="button" className="dk-btn dk-btn--ghost" onClick={() => setShare(article.quote)}><ShareIcon /> شاركوا جملة المقال</button>
          </div>
          <div className="dk-invite dk-r">
            <p>إذا حسّيتوا إن المقال يتكلم عنكم، فالخطوة الجاية بسيطة: لقاء مبدئي، نسمع فيه وين يوقف الإنجليزي عندكم، ووين تبونه يوصل. وبعدها القرار لكم.</p>
            <button type="button" data-open-form className="dk-btn">احجز لقاءك المبدئي</button>
          </div>
          <section className="dk-sources dk-r" aria-labelledby="dk-src">
            <h2 id="dk-src">مصادر</h2>
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
              <p>ما في هذا المقال أرقام أو دراسات منقولة. الجمل الإنجليزية فيه أمثلة شائعة في بيئة العمل.</p>
            )}
          </section>
        </footer>

        {related.length ? (
          <section className="dk-related" aria-labelledby="dk-rel">
            <Horizon seed={`${article.slug}-rel`} />
            <h2 id="dk-rel" className="dk-sec-h dk-r">اقرؤوا بعدها</h2>
            <div className="dk-mids">
              {related.map((a, k) => <Card key={a.slug} article={a} dir={dir} index={k} size="mid" />)}
            </div>
          </section>
        ) : null}
      </article>
      {share ? <ShareSheet article={article} quote={share} onClose={() => setShare(null)} /> : null}
    </Shell>
  );
}

function Block({ block, lede, chapter, seed, onShare }) {
  const [type, v] = block;
  switch (type) {
    case "p":
      return <p className={`dk-p dk-r${lede ? " dk-lede" : ""}`}><Inline text={v} /></p>;
    case "h":
      return (
        <>
          <Horizon seed={seed} n={chapter} />
          <h2 className="dk-h dk-r"><Inline text={v} /></h2>
        </>
      );
    case "punch":
      return <p className="dk-punch dk-r"><Inline text={v} /></p>;
    case "pull":
      return (
        <figure className="dk-pull dk-r">
          <span className="dk-pull-sun" aria-hidden="true" />
          <blockquote><Inline text={v} /></blockquote>
          <button type="button" className="dk-btn dk-btn--ghost" onClick={() => onShare(plain(v))}><ShareIcon /> شاركوها كصورة</button>
        </figure>
      );
    case "close":
      return <p className="dk-close dk-r"><Inline text={v} /></p>;
    case "steps":
      return (
        <ol className="dk-steps">
          {v.map(([title, text], i) => (
            <li key={title} className="dk-r">
              <span className="dk-step-n" dir="ltr">{i + 1}</span>
              <div><h3><Inline text={title} /></h3><p><Inline text={text} /></p></div>
            </li>
          ))}
        </ol>
      );
    case "en":
      return (
        <ul className="dk-enlist dk-r">
          {v.map(([en, gloss]) => (
            <li key={en}>
              <span className="dk-en-line" dir="ltr" lang="en">{en}</span>
              {gloss ? <span className="dk-gloss"><Inline text={gloss} /></span> : null}
            </li>
          ))}
        </ul>
      );
    case "scene":
      return (
        <Suspense fallback={<div className="dk-scene" aria-hidden="true" />}>
          <Scene id={v} />
        </Suspense>
      );
    case "try":
      return (
        <Suspense fallback={<div className="dk-try" style={{ minHeight: 360 }} aria-hidden="true" />}>
          <Try id={v} />
        </Suspense>
      );
    default:
      return null;
  }
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12" /><path d="M7 8l5-5 5 5" /><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
    </svg>
  );
}

/** Paints the quote as a story (1080×1920) and a post (1080×1350) on the dusk backgrounds. */
function ShareSheet({ article, quote, onClose }) {
  const [cards, setCards] = useState(null);
  const closeRef = useRef(null);
  const lastFocus = useRef(null);

  useEffect(() => {
    lastFocus.current = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("pv-sheet-open");
    return () => {
      document.documentElement.classList.remove("pv-sheet-open");
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
        const out = {};
        for (const kind of ["story", "post"]) {
          const canvas = await paint({ kind, quote, title: article.title, seed: article.slug });
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
    return () => { alive = false; urls.forEach((u) => URL.revokeObjectURL(u)); };
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
      await navigator.share({ files: [fileFor(kind)], title: article.title, text: `${quote}\n${SITE}/journal/${article.slug}` });
    } catch { /* dismissed */ }
  };

  return (
    <div className="dk-sheet" role="dialog" aria-modal="true" aria-labelledby="dk-sheet-h" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dk-sheet-card">
        <div className="dk-row dk-row--b">
          <h2 id="dk-sheet-h">شاركوها كصورة</h2>
          <button type="button" ref={closeRef} className="dk-btn dk-btn--ghost" onClick={onClose} aria-label="إغلاق">إغلاق</button>
        </div>
        {cards === null ? <p className="dk-wait" aria-live="polite">نجهّز الصورة…</p> : null}
        {cards === "error" ? <p className="dk-fb">ما قدرنا نجهّز الصورة على هذا الجهاز. ممكن نسخ الجملة ومشاركتها كنص.</p> : null}
        {cards && cards !== "error" ? (
          <>
            <div className="dk-sheet-previews">
              <figure><img src={cards.story.url} alt={`بطاقة ستوري: ${quote}`} width="1080" height="1920" /><figcaption>ستوري 1080×1920</figcaption></figure>
              <figure><img src={cards.post.url} alt={`بطاقة بوست: ${quote}`} width="1080" height="1350" /><figcaption>بوست 1080×1350</figcaption></figure>
            </div>
            <div className="dk-row">
              {canShareFiles ? (
                <>
                  <button type="button" className="dk-btn" onClick={() => shareFiles("story")}>مشاركة الستوري</button>
                  <button type="button" className="dk-btn dk-btn--ghost" onClick={() => shareFiles("post")}>مشاركة البوست</button>
                </>
              ) : (
                <>
                  <a className="dk-btn" href={cards.story.url} download={`fluentia-journal-${article.slug}-story.png`}>حفظ الستوري</a>
                  <a className="dk-btn dk-btn--ghost" href={cards.post.url} download={`fluentia-journal-${article.slug}-post.png`}>حفظ البوست</a>
                </>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
