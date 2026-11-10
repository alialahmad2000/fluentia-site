import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PreviewMeta, Art } from "../shared";
import { previewPath, PREVIEW_PATH } from "../../../content/journal/preview.js";
import {
  JOURNAL, JOURNAL_NAME, dateLabel, plain, readLabel, relatedArticles,
} from "../../../content/journal/index.js";
import Shell, { DIR, Inline, pad2, useReveal } from "./shell";

const Scene = lazy(() => import("./scenes"));
const Try = lazy(() => import("./tries"));

const to = (a) => previewPath(DIR, a.slug);

/** Each plate carries its own typographic / geometric experiment. */
function Motif({ slug }) {
  switch (slug) {
    case "first-ten-minutes":
      return <div className="g-motif" aria-hidden="true">10<em>:</em>00</div>;
    case "words-that-betrayed-us":
      return <div className="g-motif g-motif--small" aria-hidden="true"><s>open</s> <em>turn on</em></div>;
    case "accent-is-not-the-problem":
      return <div className="g-motif g-motif--small" aria-hidden="true">/ˈæk<em>ˌ</em>sənt/</div>;
    case "understand-but-cant-speak":
      return <span className="g-shape" aria-hidden="true" style={{ width: "min(34vw,420px)", aspectRatio: "1", borderRadius: "50%", insetInlineStart: "6vw", top: "16vh" }} />;
    case "fear-of-mistakes":
      return <span className="g-shape" aria-hidden="true" style={{ width: "min(9vw,96px)", aspectRatio: "1", borderRadius: "50%", insetInlineEnd: "22vw", top: "30vh" }} />;
    case "adults-learn-differently":
      return <div className="g-motif" aria-hidden="true" style={{ fontSize: "30vw" }}><em>→</em></div>;
    default:
      return null;
  }
}

export default function Article({ direction, article }) {
  return <ArticleView key={article.slug} direction={direction} article={article} />;
}

function ArticleView({ direction, article }) {
  const bodyRef = useRef(null);
  const barRef = useRef(null);
  const artRef = useRef(null);
  const [share, setShare] = useState(null);
  const number = JOURNAL.findIndex((a) => a.slug === article.slug) + 1;
  const related = relatedArticles(article);

  useReveal(article.slug);
  useReadingProgress(bodyRef, barRef);
  useParallax(artRef);

  const numbered = article.body.some(([t, v]) => t === "h" && /^\s*\d+\.\s/.test(v));
  let seq = 0;
  let firstP = true;

  return (
    <Shell>
      <PreviewMeta title={`${article.title} | ${direction.name}`} description={article.description} />
      <div className="g-progress" aria-hidden="true"><i ref={barRef} /></div>
      <main>
        <article>
          <header id="fx-top" className="g-plate">
            <div className="g-plate-art" ref={artRef}>
              <Art dir={DIR} name={`plate-${article.slug}`} eager alt="" />
            </div>
            <Motif slug={article.slug} />
            <span className="g-cue" aria-hidden="true" />
            <div className="g-wrap g-plate-in">
              <p className="g-plate-top g-rise">
                <Link to={previewPath(DIR)}>{JOURNAL_NAME}</Link>
                <span className="g-tag">{article.category}</span>
              </p>
              <div className="g-12 g-plate-grid">
                <div className="g-num g-plate-no g-rise" style={{ "--d": ".1s" }} aria-hidden="true">{pad2(number)}</div>
                <div className="g-plate-h">
                  <h1 className="g-rise" style={{ "--d": ".2s" }}>{article.title}</h1>
                  <p className="g-dek g-rise" style={{ "--d": ".35s" }}>{article.dek}</p>
                </div>
              </div>
              <div className="g-meta g-rise" style={{ "--d": ".5s" }}>
                <div><small>الكاتب</small>علي الأحمد</div>
                <div><small>التاريخ</small><time dateTime={article.date}>{dateLabel(article.date)}</time></div>
                <div><small>القراءة</small>{readLabel(article)}</div>
                <div><small>المقال</small><span dir="ltr">{pad2(number)} / 06</span></div>
              </div>
            </div>
          </header>

          <div className="g-body" ref={bodyRef}>
            <div className="g-wrap">
              <div className="g-12">
                {article.body.map((block, i) => {
                  const [type, v] = block;
                  if (type === "p" && firstP) { firstP = false; return <p key={i} className="g-p g-lead g-b g-rv"><Inline text={v} /></p>; }
                  if (type === "h") {
                    const m = /^\s*(\d+)\.\s*([\s\S]*)$/.exec(v);
                    let label;
                    if (m) label = <span className="g-num">{pad2(Number(m[1]))}</span>;
                    else if (numbered) label = <span className="g-num g-num--sq" aria-hidden="true" />;
                    else label = <span className="g-num" aria-hidden="true">{pad2(++seq)}</span>;
                    return (
                      <div key={i} className="g-h g-rv">
                        {label}
                        <h2><Inline text={m ? m[2] : v} /></h2>
                      </div>
                    );
                  }
                  return <Block key={i} block={block} onShare={setShare} />;
                })}
              </div>
            </div>
          </div>

          <footer className="g-end g-paper">
            <div className="g-wrap">
              <div className="g-12">
                <div className="g-end-a">
                  <div className="g-author">
                    <b>علي الأحمد</b> · مؤسس أكاديمية طلاقة
                    <br />
                    يكتب في {JOURNAL_NAME} عن الإنجليزي في بيئة العمل.
                  </div>
                  <div className="g-row-b">
                    <button type="button" className="g-btn" onClick={() => setShare(plain(article.quote))}>
                      <ShareIcon /> شاركوا جملة المقال
                    </button>
                  </div>
                  <section className="g-src" aria-labelledby="g-src-h" style={{ marginBlockStart: 36 }}>
                    <h2 id="g-src-h">مصادر</h2>
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
                </div>
                <div className="g-end-b">
                  <div className="g-invite-s">
                    <p>
                      إذا حسّيتوا إن المقال يتكلم عنكم، فالخطوة الجاية بسيطة: لقاء مبدئي، نسمع فيه وين يوقف الإنجليزي عندكم، ووين تبونه يوصل. وبعدها القرار لكم.
                    </p>
                    <button type="button" data-open-form className="g-cta">احجز لقاءك المبدئي</button>
                  </div>
                </div>
              </div>
            </div>
          </footer>

          {related.length ? (
            <section className="g-related g-ink" aria-labelledby="g-rel-h">
              <div className="g-wrap">
                <div className="g-index-h" style={{ borderColor: "var(--hair-ink)", marginBlockEnd: 30 }}>
                  <h2 id="g-rel-h" style={{ margin: 0, font: "900 clamp(28px,3.6vw,48px)/1.2 var(--g-disp)" }}>اقرؤوا بعدها</h2>
                </div>
                <div className="g-12">
                  {related.map((a) => {
                    const i = JOURNAL.findIndex((x) => x.slug === a.slug);
                    return (
                      <Link key={a.slug} to={to(a)} className="g-card g-rv">
                        <div className="g-card-top" style={{ borderColor: "var(--hair-ink)" }}>
                          <span className="g-num" style={{ color: "var(--lime)" }}>{pad2(i + 1)}</span>
                          <span className="g-label" style={{ color: "var(--mute-ink)" }}>{readLabel(a)}</span>
                        </div>
                        <div className="g-img g-duo"><Art dir={DIR} name={`plate-${a.slug}`} alt="" sizes="(min-width: 900px) 45vw, 100vw" /></div>
                        <h3 style={{ color: "#fff", fontSize: "clamp(22px,2.4vw,34px)" }}>{a.title}</h3>
                        <span className="g-more" style={{ color: "var(--lime)" }}>اقرؤوا المقال <i>←</i></span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          ) : null}
        </article>
      </main>
      {share ? <ShareSheet article={article} number={number} quote={share} onClose={() => setShare(null)} /> : null}
    </Shell>
  );
}

function Block({ block, onShare }) {
  const [type, v] = block;
  switch (type) {
    case "p":
      return <p className="g-p g-b g-rv"><Inline text={v} /></p>;
    case "punch":
      return <p className="g-punch g-b g-rv"><span><Inline text={v} /></span></p>;
    case "pull":
      return (
        <figure className="g-pull g-rv">
          <div className="g-wrap" style={{ padding: 0 }}>
            <blockquote><Inline text={v} /></blockquote>
            <button type="button" className="g-btn g-pull-btn" onClick={() => onShare(plain(v))}>
              <ShareIcon /> شاركوها كصورة
            </button>
          </div>
        </figure>
      );
    case "close":
      return <p className="g-close g-rv"><span><Inline text={v} /></span></p>;
    case "steps":
      return (
        <ol className="g-steps g-b g-b--wide g-rv">
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
        <ul className="g-enlist g-b g-rv">
          {v.map(([en, gloss]) => (
            <li key={en}>
              <span className="g-en-line" dir="ltr" lang="en">{en}</span>
              {gloss ? <span className="g-gloss"><Inline text={gloss} /></span> : null}
            </li>
          ))}
        </ul>
      );
    case "scene":
      return (
        <Suspense fallback={<div className="g-scene" style={{ height: "60vh" }} aria-hidden="true" />}>
          <Scene id={v} />
        </Suspense>
      );
    case "try":
      return (
        <Suspense fallback={<div className="g-try" style={{ minHeight: 360 }} aria-hidden="true" />}>
          <Try id={v} />
        </Suspense>
      );
    default:
      return null;
  }
}

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

/** The plate photo drifts slower than the page (transform only, first screen only). */
function useParallax(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) return undefined;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = Math.min(window.scrollY, window.innerHeight * 1.2);
      el.style.transform = `translate3d(0, ${(y * 0.22).toFixed(1)}px, 0)`;
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener("scroll", on, { passive: true });
    update();
    return () => { window.removeEventListener("scroll", on); if (raf) cancelAnimationFrame(raf); };
  }, [ref]);
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
      <path d="M12 3v12" /><path d="M7 8l5-5 5 5" /><path d="M5 13v7h14v-7" />
    </svg>
  );
}

/** Quote-card sheet: story 1080×1920 + post 1080×1350; Web Share with files, else download. */
function ShareSheet({ article, number, quote, onClose }) {
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
          const canvas = await paint({ kind, slug: article.slug, quote, title: article.title, number });
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
  }, [article, quote, number]);

  const fileFor = useCallback(
    (kind) => new File([cards[kind].blob], `fluentia-journal-${article.slug}-${kind}.png`, { type: "image/png" }),
    [cards, article.slug],
  );
  const canShareFiles = cards && cards !== "error" && typeof navigator !== "undefined" && navigator.canShare && (() => {
    try { return navigator.canShare({ files: [fileFor("story")] }); } catch { return false; }
  })();
  const shareFiles = async (kind) => {
    try {
      await navigator.share({ files: [fileFor(kind)], title: article.title, text: `${quote}\nhttps://fluentia.academy/journal/${article.slug}` });
    } catch { /* dismissed */ }
  };

  return (
    <div className="g-sheet" role="dialog" aria-modal="true" aria-labelledby="g-sheet-h" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="g-sheet-card g-paper">
        <div className="g-row-b" style={{ justifyContent: "space-between", marginBlockStart: 0 }}>
          <h2 id="g-sheet-h">شاركوها كصورة</h2>
          <button type="button" ref={closeRef} className="g-pbtn g-pbtn--ghost" onClick={onClose}>إغلاق</button>
        </div>
        {cards === null ? <p aria-live="polite">نجهّز الصورة…</p> : null}
        {cards === "error" ? <p>ما قدرنا نجهّز الصورة على هذا الجهاز. ممكن نسخ الجملة ومشاركتها كنص.</p> : null}
        {cards && cards !== "error" ? (
          <>
            <div className="g-sheet-previews">
              <figure>
                <img src={cards.story.url} alt={`بطاقة ستوري: ${quote}`} width="1080" height="1920" />
                <figcaption>ستوري <bdi dir="ltr">1080×1920</bdi></figcaption>
              </figure>
              <figure>
                <img src={cards.post.url} alt={`بطاقة بوست: ${quote}`} width="1080" height="1350" />
                <figcaption>بوست <bdi dir="ltr">1080×1350</bdi></figcaption>
              </figure>
            </div>
            <div className="g-row-b">
              {canShareFiles ? (
                <>
                  <button type="button" className="g-pbtn" onClick={() => shareFiles("story")}>مشاركة الستوري</button>
                  <button type="button" className="g-pbtn g-pbtn--ghost" onClick={() => shareFiles("post")}>مشاركة البوست</button>
                </>
              ) : (
                <>
                  <a className="g-pbtn" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }} href={cards.story.url} download={`fluentia-journal-${article.slug}-story.png`}>حفظ الستوري</a>
                  <a className="g-pbtn g-pbtn--ghost" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }} href={cards.post.url} download={`fluentia-journal-${article.slug}-post.png`}>حفظ البوست</a>
                </>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
