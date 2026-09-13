/**
 * fluentia-lms components/curriculum/reading/ArticleBody.jsx — verbatim port.
 * Every word is a button; this reading's target words carry the gold rule on
 * their first appearance; paragraphs carry the A/B/C letter rail.
 * Only change: `vocabIndex` arrives as a plain object from data/unit.json (the
 * platform's own shape-normaliser below already accepts that), and there are no
 * «صعبة عليّ» flags for a visitor.
 */
import { memo, useMemo } from "react";
import { paraLetter } from "../lib/platform";

const TOKEN_RE = /([\p{L}\p{M}'’-]+)|([^\p{L}\p{M}'’-]+)/gu;

export const normWord = (w) =>
  (w || "").toLowerCase().replace(/’/g, "'").replace(/^[^\p{L}]+/u, "").replace(/[^\p{L}]+$/u, "");

function ArticleBody({ paragraphs, vocabIndex, onWordTap, difficultWords, lettered = false }) {
  const paras = Array.isArray(paragraphs) ? paragraphs : [];

  const hardSet = useMemo(() => {
    const out = new Set();
    const src = Array.isArray(difficultWords) ? difficultWords : [];
    for (const row of src) {
      const raw = typeof row === "string" ? row : row?.word_normalized || row?.word || "";
      const k = normWord(raw);
      if (k) out.add(k);
    }
    return out;
  }, [difficultWords]);

  const vocabMap = useMemo(() => {
    const s = vocabIndex;
    if (s instanceof Map) return s;
    const out = new Map();
    if (s && typeof s === "object") {
      Object.entries(s).forEach(([k, v]) => {
        const key = String(k).toLowerCase();
        if (key) out.set(key, v && typeof v === "object" ? v : null);
      });
    }
    return out;
  }, [vocabIndex]);

  const seenVocab = new Set();

  const handleTap = (e, word) => {
    const rect = e.currentTarget.getBoundingClientRect();
    onWordTap(word, rect, vocabMap.get(normWord(word)) || null);
  };

  return (
    <div dir="ltr" lang="en" className="article-body mx-auto" style={{ maxWidth: "100%" }}>
      <style>{`
        .article-body { font-family: 'Readex Pro', sans-serif; hyphens: auto; -webkit-hyphens: auto; }
        .article-body p {
          font-weight: 400;
          font-size: 20px;
          line-height: 1.85;
          letter-spacing: .002em;
          color: var(--ds-text-primary, #ece7dd);
          margin: 0 0 2em 0;
          text-wrap: pretty;
        }
        .article-body p:last-child { margin-bottom: 0; }
        @media (max-width: 640px) {
          .article-body p { font-size: 18px; line-height: 1.75; margin-bottom: 1.9em; }
        }
        .article-body .aw {
          display: inline; padding: 0 1px; margin: 0; border: 0; background: transparent;
          font: inherit; color: inherit; cursor: pointer; border-radius: 3px;
          -webkit-tap-highlight-color: transparent;
          transition: background-color 120ms ease, color 120ms ease;
        }
        @media (hover: hover) {
          .article-body .aw:hover { background: rgba(255,255,255,.05); }
        }
        .article-body .aw:active { background: rgba(255,255,255,.08); }
        .article-body .aw:focus-visible { outline: 2px solid var(--ds-accent-primary, #e9b949); outline-offset: 2px; }
        .article-body .aw-vocab {
          color: var(--ds-accent-primary, #e9b949);
          font-weight: 500;
          text-decoration: underline;
          text-decoration-color: var(--ds-accent-rule, rgba(233,185,73,.42));
          text-decoration-thickness: 1.5px;
          text-underline-offset: 5px;
          text-decoration-skip-ink: auto;
        }
        @media (hover: hover) {
          .article-body .aw-vocab:hover {
            background: var(--ds-accent-wash, rgba(233,185,73,.08));
            text-decoration-color: var(--ds-accent-primary, #e9b949);
          }
        }
        .article-body .aw-vocab:active,
        .article-body .aw-vocab[aria-expanded="true"] {
          background: var(--ds-accent-wash, rgba(233,185,73,.08));
          text-decoration-color: var(--ds-accent-primary, #e9b949);
        }
        .article-body .aw-hard,
        .article-body .aw.aw-vocab.aw-hard {
          background: var(--ds-hard-mark, #f6c945);
          color: #1c1608;
          font-weight: 500;
          padding: 0 3px;
          border-radius: 3px;
          text-decoration-color: rgba(28,22,8,.45);
        }
        .article-body p.aw-first > .aw:first-of-type { display: inline-block; }
        .article-body p.aw-first > .aw:first-of-type::first-letter {
          font-family: 'Cormorant Garamond', 'Playfair Display', serif;
          font-style: italic;
          font-size: 58px; line-height: .82;
          float: left; padding: 6px 8px 0 0;
          color: var(--ds-accent-primary, #e9b949);
        }
        .article-body p.pmark { position: relative; padding-left: 2.75rem; }
        .article-body .pmk {
          position: absolute; left: 0; top: 0; width: 2.75rem;
          font-family: 'Cormorant Garamond', 'Playfair Display', serif;
          font-style: italic;
          font-size: 32px; line-height: 37px;
          color: var(--ds-accent-primary, #e9b949);
          user-select: none; -webkit-user-select: none;
        }
        @media (max-width: 639px) {
          .article-body p.pmark { padding-left: 0; }
          .article-body .pmk {
            position: static; display: block; width: auto;
            font-size: 24px; line-height: 1; margin-bottom: .35em;
          }
        }
      `}</style>

      {paras.map((para, pi) => {
        const clean = (para || "").replace(/\*/g, "");
        const segments = [];
        let m;
        TOKEN_RE.lastIndex = 0;
        let key = 0;
        while ((m = TOKEN_RE.exec(clean)) !== null) {
          if (m[1] && /\p{L}/u.test(m[1])) {
            const word = m[1];
            const vocabKey = normWord(word);
            const isVocab = vocabMap.get(vocabKey)?.is_vocab === true && !seenVocab.has(vocabKey);
            if (isVocab) seenVocab.add(vocabKey);
            const isHard = hardSet.has(vocabKey);
            segments.push(
              <button
                key={key++}
                type="button"
                className={`aw${isVocab ? " aw-vocab" : ""}${isHard ? " aw-hard" : ""}`}
                data-w={word}
                aria-label={`${word}، اضغط لسماع النطق والترجمة`}
                onClick={(e) => handleTap(e, word)}
              >
                {word}
              </button>
            );
          } else {
            segments.push(<span key={key++}>{m[1] || m[2]}</span>);
          }
        }
        const marked = lettered && paras.length > 1;
        const cls = [marked ? "pmark" : null, pi === 0 && !marked ? "aw-first" : null].filter(Boolean).join(" ") || undefined;
        return (
          <p key={pi} data-paragraph-index={pi} className={cls}>
            {marked && (
              <span className="pmk" data-paragraph-letter={paraLetter(pi)}>
                <span className="sr-only">Paragraph </span>
                {paraLetter(pi)}
              </span>
            )}
            {segments}
          </p>
        );
      })}
    </div>
  );
}

export default memo(ArticleBody);
