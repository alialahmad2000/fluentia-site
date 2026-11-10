import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import CSS from "./chooser.css?inline";
import { PreviewMeta } from "./shared";
import { DIRECTIONS, FLAGSHIP, previewPath } from "../../content/journal/preview.js";
import { getJournalArticle } from "../../content/journal/index.js";

/**
 * /journal/preview — the chooser. Three directions, each card dressed in its own
 * palette with a desktop + phone capture of its home. Thumbnails:
 * public/images/journal/preview/<id>-desk.webp and <id>-phone.webp.
 */
export default function Chooser() {
  const flagship = getJournalArticle(FLAGSHIP);
  return (
    <div className="pvc" dir="rtl">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <PreviewMeta title="ثلاث هيئات لمجلة طلاقة — معاينة" description="ثلاث هيئات فنية مختلفة لمجلة طلاقة، للمقارنة والاختيار." />
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap" />
      </Helmet>

      <header className="pvc-head">
        <a className="pvc-brand" href="/journal">مجلة طلاقة</a>
        <span className="pvc-tag">معاينة · غير منشورة</span>
      </header>

      <main className="pvc-main">
        <div className="pvc-intro">
          <h1>ثلاث هيئات للمجلة نفسها</h1>
          <p>
            نفس المقالات بنفس الكلمات، في ثلاثة عوالم مختلفة. افتحوا كل واحدة على الجوال واللابتوب، اقرؤوا قليلًا، ثم اختاروا.
          </p>
        </div>

        <ol className="pvc-list">
          {DIRECTIONS.map((d, i) => {
            const second = getJournalArticle(d.second);
            return (
              <li key={d.id} className={`pvc-card pvc-${d.id}`}>
                <Link to={previewPath(d.id)} className="pvc-shot" aria-label={`افتح ${d.name}`}>
                  <img className="pvc-desk" src={`/images/journal/preview/${d.id}-desk.webp`} alt="" width="1440" height="900" loading={i ? "lazy" : "eager"} decoding="async" />
                  <img className="pvc-phone" src={`/images/journal/preview/${d.id}-phone.webp`} alt="" width="390" height="844" loading={i ? "lazy" : "eager"} decoding="async" />
                </Link>
                <div className="pvc-body">
                  <p className="pvc-num"><span dir="ltr">{String(i + 1).padStart(2, "0")}</span> · <span dir="ltr" lang="en">{d.en}</span></p>
                  <h2>{d.name}</h2>
                  <p className="pvc-line">{d.line}</p>
                  <div className="pvc-links">
                    <Link className="pvc-go" to={previewPath(d.id)}>افتح المجلة</Link>
                    <Link className="pvc-sub" to={previewPath(d.id, FLAGSHIP)}>{flagship.title}</Link>
                    <Link className="pvc-sub" to={previewPath(d.id, d.second)}>{second.title}</Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <p className="pvc-foot">
          المجلة الحالية تبقى كما هي على <a href="/journal">/journal</a> حتى يُختار تصميم.
        </p>
      </main>
    </div>
  );
}
