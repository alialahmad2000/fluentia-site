import BrandMark from "../../components/BrandMark";
import { PreviewHead } from "./shared";
import { HOME_DIRECTIONS, homePreviewPath } from "./routes";
import "./base.css";
import "./chooser.css";

/**
 * /preview — pick a homepage direction. Each card carries the direction's real
 * hero, captured at 1440 and 390 (public/preview/choose/<id>-desk|phone.webp).
 */
export default function Chooser() {
  return (
    <div className="pv pv-choose" dir="rtl">
      <PreviewHead title="معاينات الصفحة الرئيسية — أكاديمية طلاقة" />
      <header className="pvc-head pv-wrap">
        <a href="/" className="pv-brand" aria-label="طلاقة — الصفحة الرئيسية الحالية">
          <BrandMark size={30} />
          <span className="pv-brand-word">طلاقة</span>
        </a>
        <h1 className="pvc-title">ثلاثة اتجاهات للصفحة الرئيسية</h1>
        <p className="pvc-sub">
          النص والأسعار والروابط نفسها في الثلاثة؛ الذي يتغيّر هو الشكل. افتح كل واحد على جوالك وعلى الشاشة الكبيرة، ثم اختر
          واحداً — أو مزيجاً، مثل «واجهة أ مع مزايا ج».
        </p>
      </header>
      <main className="pv-wrap pvc-list">
        {HOME_DIRECTIONS.map((d) => (
          <article key={d.id} className="pvc-card">
            <a href={homePreviewPath(d.id)} className="pvc-shots" aria-label={`افتح معاينة ${d.letter} · ${d.name}`}>
              <img
                className="pvc-desk"
                src={`/preview/choose/${d.id}-desk.webp`}
                alt=""
                width="1440"
                height="900"
                loading={d.id === "a" ? "eager" : "lazy"}
                decoding="async"
              />
              <img
                className="pvc-phone"
                src={`/preview/choose/${d.id}-phone.webp`}
                alt=""
                width="390"
                height="844"
                loading="lazy"
                decoding="async"
              />
            </a>
            <div className="pvc-copy">
              <h2 className="pvc-name">
                <span className="pvc-letter">{d.letter}</span>
                {d.name}
              </h2>
              <p className="pvc-line">{d.line}</p>
              <ul className="pvc-swatches" aria-label="ألوان الاتجاه">
                {d.accents.map((c) => (
                  <li key={c} style={{ background: c }} title={c} />
                ))}
              </ul>
              <a href={homePreviewPath(d.id)} className="pv-cta pvc-open">
                افتح المعاينة {d.letter}
              </a>
            </div>
          </article>
        ))}
        <p className="pvc-foot">
          الصفحة الحالية تبقى كما هي على <a href="/" className="pv-link">fluentia.academy</a> حتى تختار.
        </p>
      </main>
    </div>
  );
}
