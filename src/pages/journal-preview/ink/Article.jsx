import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PreviewMeta } from "../shared";
import { SITE } from "../../../content/seo";
import { JOURNAL_NAME, dateLabel, journalPath, plain, readLabel, relatedArticles } from "../../../content/journal/index.js";
import { previewPath } from "../../../content/journal/preview.js";
import { Shell, Inline, Rise, Par, Card, DIR } from "./ui";

// Heavy, below-the-fold: own chunks.
const Scene = lazy(() => import("./scenes"));
const Try = lazy(() => import("./interactives"));

/** One full-bleed ember photograph between chapters (flagship + the second article). */
const BREAKS = { "first-ten-minutes": { beforeH: 3, name: "scene-door" }, "fear-of-mistakes": { beforeH: 4, name: "scene-table" } };

function splitTitle(t) {
  const i = t.indexOf(":");
  return i > 0 ? [t.slice(0, i).trim(), t.slice(i + 1).trim()] : [t, ""];
}

export default function Article({ direction, article }) {
  const [share, setShare] = useState(null);
  const [main, sub] = splitTitle(article.title);
  const related = relatedArticles(article);
  const brk = BREAKS[article.slug];
  let hN = 0;
  let firstP = true;

  const blocks = article.body.map((block, i) => {
    const [type, v] = block;
    if (type === "h") {
      hN += 1;
      const out = [];
      if (brk && brk.beforeH === hN) out.push(<ImageBreak key={`b${i}`} name={brk.name} />);
      out.push(
        <Rise as="div" className="ink-chap" key={i}>
          <span className="ink-chap-no ink-num" aria-hidden="true">{String(hN).padStart(2, "0")}</span>
          <h2><Inline text={v} /></h2>
        </Rise>,
      );
      return out;
    }
    if (type === "p") {
      if (firstP) {
        firstP = false;
        return (
          <Rise key={i}>
            <span className="ink-ornament" aria-hidden="true">”</span>
            <p className="ink-p ink-lede"><Inline text={v} /></p>
          </Rise>
        );
      }
      return <Rise as="p" className="ink-p" key={i}><Inline text={v} /></Rise>;
    }
    return <Block key={i} block={block} onShare={setShare} />;
  });

  return (
    <Shell share={share ? <ShareSheet article={article} quote={share} onClose={() => setShare(null)} /> : null}>
      <PreviewMeta title={`${article.title} | ${direction.name}`} description={article.description} />
      <article>
        <header id="fx-top" className="ink-plate">
          <div className="ink-plate-art" aria-hidden="true">
            <Par name={`plate-${article.slug}`} eager factor={0.16} />
          </div>
          <div className="ink-plate-in">
            <p className="ink-plate-k ink-rise is-in">
              <span className="ink-kicker"><Link to={previewPath(DIR)}>{JOURNAL_NAME} · العدد <span className="ink-num">1</span></Link></span>
              <span className="ink-kicker" style={{ color: "var(--mute)" }}>{article.category}</span>
            </p>
            <h1 className={`ink-title ink-bleed${main.length > 24 ? " ink-title--long" : ""}`}>{main}</h1>
            {sub ? <p className="ink-sub ink-rise is-in" style={{ "--d": "200ms" }}>{sub}</p> : null}
            <p className="ink-dek ink-rise is-in" style={{ "--d": "350ms" }}>{article.dek}</p>
            <div className="ink-meta ink-rise is-in" style={{ "--d": "450ms" }}>
              <span>علي الأحمد</span><i /><time dateTime={article.date}>{dateLabel(article.date)}</time><i /><span>{readLabel(article)}</span>
            </div>
          </div>
          <span className="ink-cue" aria-hidden="true" />
        </header>

        <div className="ink-body">{blocks}</div>

        <footer className="ink-end">
          <Rise className="ink-author"><div><b>علي الأحمد</b> · مؤسس أكاديمية طلاقة<br />يكتب في {JOURNAL_NAME} عن الإنجليزي في بيئة العمل.</div></Rise>
          <Rise className="ink-row"><button type="button" className="ink-share" onClick={() => setShare(article.quote)}><ShareIcon /> شاركوا جملة المقال</button></Rise>
          <Rise className="ink-invite">
            <p>إذا حسّيتوا إن المقال يتكلم عنكم، فالخطوة الجاية بسيطة: لقاء مبدئي، نسمع فيه وين يوقف الإنجليزي عندكم، ووين تبونه يوصل. وبعدها القرار لكم.</p>
            <button type="button" data-open-form className="ink-btn">احجز لقاءك المبدئي</button>
          </Rise>
          <section className="ink-src" aria-labelledby="ink-src-h">
            <h2 id="ink-src-h">مصادر</h2>
            {article.sources?.length ? (
              <ol>{article.sources.map((s) => (
                <li key={s.url}>{s.label} <a href={s.url} target="_blank" rel="noopener noreferrer" dir="ltr">{s.url.replace(/^https?:\/\//, "")}</a></li>
              ))}</ol>
            ) : <p>ما في هذا المقال أرقام أو دراسات منقولة. الجمل الإنجليزية فيه أمثلة شائعة في بيئة العمل.</p>}
          </section>
        </footer>

        {related.length ? (
          <section className="ink-rel" aria-labelledby="ink-rel-h">
            <h2 id="ink-rel-h">اقرؤوا بعدها</h2>
            <div className="ink-rel-g">
              {related.map((a, k) => <Card key={a.slug} article={a} variant={k ? "tall" : "wide"} direction={direction.id} />)}
            </div>
          </section>
        ) : null}
      </article>
    </Shell>
  );
}

function ImageBreak({ name }) {
  return (
    <div className="ink-ibreak" aria-hidden="true">
      <Par name={name} wide factor={0.18} />
    </div>
  );
}

function Block({ block, onShare }) {
  const [type, v] = block;
  switch (type) {
    case "punch":
      return <Rise as="p" className="ink-punch ink-bleed"><Inline text={v} /></Rise>;
    case "pull":
      return (
        <Rise as="figure" className="ink-pull">
          <blockquote><Inline text={v} /></blockquote>
          <button type="button" className="ink-share" onClick={() => onShare(plain(v))}><ShareIcon /> شاركوها كصورة</button>
        </Rise>
      );
    case "close":
      return <Rise as="p" className="ink-close ink-bleed"><Inline text={v} /></Rise>;
    case "steps":
      return (
        <ol className="ink-steps">
          {v.map(([title, text]) => (
            <Rise as="li" key={title}><h3><Inline text={title} /></h3><p><Inline text={text} /></p></Rise>
          ))}
        </ol>
      );
    case "en":
      return (
        <ul className="ink-enlist">
          {v.map(([en, gloss]) => (
            <Rise as="li" key={en}><span className="ink-en-line" dir="ltr" lang="en">{en}</span>{gloss ? <span className="ink-gloss"><Inline text={gloss} /></span> : null}</Rise>
          ))}
        </ul>
      );
    case "scene":
      return <Suspense fallback={<div className="ink-scene" style={{ height: "100svh" }} aria-hidden="true" />}><Scene id={v} /></Suspense>;
    case "try":
      return <Suspense fallback={<div className="ink-try" style={{ minHeight: 380 }} aria-hidden="true" />}><Try id={v} /></Suspense>;
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

/** Paints the quote as a story card and a post card, then shares files (Web Share) or offers downloads. */
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
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; lastFocus.current?.focus?.(); };
  }, [onClose]);

  useEffect(() => {
    let alive = true;
    const urls = [];
    (async () => {
      try {
        const { paint, toBlob } = await import("./share.js");
        const out = {};
        for (const kind of ["story", "post"]) {
          const blob = await toBlob(await paint({ kind, quote, title: article.title }));
          if (!blob) throw new Error("toBlob");
          const url = URL.createObjectURL(blob);
          urls.push(url);
          out[kind] = { url, blob };
        }
        if (alive) setCards(out);
      } catch { if (alive) setCards("error"); }
    })();
    return () => { alive = false; urls.forEach((u) => URL.revokeObjectURL(u)); };
  }, [article, quote]);

  const fileFor = useCallback((kind) => new File([cards[kind].blob], `fluentia-journal-${article.slug}-${kind}.png`, { type: "image/png" }), [cards, article.slug]);
  const canShareFiles = cards && cards !== "error" && typeof navigator !== "undefined" && navigator.canShare && (() => { try { return navigator.canShare({ files: [fileFor("story")] }); } catch { return false; } })();
  const shareFiles = async (kind) => {
    try { await navigator.share({ files: [fileFor(kind)], title: article.title, text: `${quote}\n${SITE}${journalPath(article.slug)}` }); } catch { /* dismissed */ }
  };

  return (
    <div className="ink-sheet" role="dialog" aria-modal="true" aria-labelledby="ink-sheet-h" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ink-sheet-card">
        <div className="ink-row" style={{ justifyContent: "space-between", marginTop: 0 }}>
          <h2 id="ink-sheet-h">شاركوها كصورة</h2>
          <button type="button" ref={closeRef} className="ink-btn ink-btn--ghost" onClick={onClose} aria-label="إغلاق">إغلاق</button>
        </div>
        {cards === null ? <div className="ink-sheet-wait" aria-live="polite">نجهّز الصورة…</div> : null}
        {cards === "error" ? <p className="ink-fb">ما قدرنا نجهّز الصورة على هذا الجهاز. ممكن نسخ الجملة ومشاركتها كنص.</p> : null}
        {cards && cards !== "error" ? (
          <>
            <div className="ink-sheet-pv">
              <figure><img src={cards.story.url} alt={`بطاقة ستوري: ${quote}`} width="1080" height="1920" /><figcaption>ستوري 1080×1920</figcaption></figure>
              <figure><img src={cards.post.url} alt={`بطاقة بوست: ${quote}`} width="1080" height="1350" /><figcaption>بوست 1080×1350</figcaption></figure>
            </div>
            <div className="ink-row">
              {canShareFiles ? (
                <>
                  <button type="button" className="ink-btn" onClick={() => shareFiles("story")}>مشاركة الستوري</button>
                  <button type="button" className="ink-btn ink-btn--ghost" onClick={() => shareFiles("post")}>مشاركة البوست</button>
                </>
              ) : null}
              <a className={canShareFiles ? "ink-btn ink-btn--ghost" : "ink-btn"} href={cards.story.url} download={`fluentia-journal-${article.slug}-story.png`}>حفظ الستوري</a>
              <a className="ink-btn ink-btn--ghost" href={cards.post.url} download={`fluentia-journal-${article.slug}-post.png`}>حفظ البوست</a>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
