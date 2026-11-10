import { PreviewMeta, Art } from "../shared";
import Shell from "./Shell";
import { Card, Dunes, Horizon } from "./Parts";
import { JOURNAL, JOURNAL_MANIFESTO, JOURNAL_NAME } from "../../../content/journal/index.js";

/** Journal home: a poster cover for the issue, then the six stories at different weights. */
export default function Home({ direction }) {
  const [hero, a, b, c, d, e] = JOURNAL;
  return (
    <Shell>
      <PreviewMeta title={`${JOURNAL_NAME} · العدد 1 | ${direction.name}`} description={JOURNAL_MANIFESTO} />

      <header id="fx-top" className="dk-cover">
        <div className="dk-cover-bg" data-plx="0.22">
          <Art dir="dusk" name="cover" eager alt="" />
        </div>
        <span className="dk-cover-tint" />
        <Dunes seed="cover" layers={["near"]} className="dk-dunes--cover" />
        <span className="dk-grain" />
        <div className="dk-cover-in">
          <p className="dk-issue-tag">
            <span>العدد 1</span><i /> <span>نوفمبر 2026</span>
          </p>
          <h1 className="dk-masthead">{JOURNAL_NAME}</h1>
          <p className="dk-manifesto">{JOURNAL_MANIFESTO}</p>
        </div>
        <a className="dk-cue" href="#issue" aria-label="اقرؤوا العدد">
          <span>اقرؤوا العدد</span>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
        </a>
      </header>

      <section id="issue" className="dk-issue">
        <Horizon seed="issue" />
        <div className="dk-sec-head dk-r">
          <p className="dk-kicker">ست مقالات</p>
          <h2 className="dk-sec-h">في هذا العدد</h2>
        </div>

        <div className="dk-hero"><Card article={hero} dir={direction.id} index={0} size="hero" level={2} /></div>

        <div className="dk-mids">
          <Card article={a} dir={direction.id} index={1} size="mid" />
          <Card article={b} dir={direction.id} index={2} size="mid" />
        </div>

        <Horizon seed="more" />
        <div className="dk-smalls">
          <Card article={c} dir={direction.id} index={3} size="small" />
          <Card article={d} dir={direction.id} index={4} size="small" />
          <Card article={e} dir={direction.id} index={5} size="small" />
        </div>

        <div className="dk-invite dk-invite--home dk-r">
          <p>الإنجليزي في بيئة العمل مهارة تنبني بالتدريب. إذا حبّيتوا نسمع وين يوقف عندكم، لقاء مبدئي يكفي.</p>
          <button type="button" data-open-form className="dk-btn">احجز لقاءك المبدئي</button>
        </div>
      </section>
    </Shell>
  );
}
