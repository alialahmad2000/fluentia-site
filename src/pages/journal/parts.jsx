import { Link } from "react-router-dom";
import Plate from "./plates";
import { journalPath, parseInline, readLabel } from "../../content/journal/index.js";

/** Inline markup → React: {{English}} is an isolated LTR run, **x** is bold. */
export function Inline({ text }) {
  return parseInline(text).map((tok, i) => {
    if (tok.t === "en") return <span key={i} className="jr-en" dir="ltr" lang="en">{tok.v}</span>;
    if (tok.t === "b") return <b key={i}>{tok.v}</b>;
    return tok.v;
  });
}

/** A magazine cover: the article's own plate, its title, its line. */
export function Cover({ article, index, lead = false, level = 3 }) {
  const H = level === 2 ? "h2" : "h3";
  return (
    <Link to={journalPath(article.slug)} className={`jr-cover${lead ? " jr-cover--lead" : ""}`}>
      <div className="jr-cover-art">
        <Plate slug={article.slug} variant="cover" />
        {index != null ? <span className="jr-cover-no" dir="ltr">{String(index + 1).padStart(2, "0")}</span> : null}
      </div>
      <div className="jr-cover-body">
        <span><span className="jr-chip">{article.category}</span></span>
        <H className="jr-cover-title">{article.title}</H>
        <p className="jr-cover-line">{article.quote}</p>
        <div className="jr-cover-foot">
          <span>{readLabel(article)}</span>
        </div>
      </div>
    </Link>
  );
}
