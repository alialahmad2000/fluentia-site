import { useEffect, useRef, useState } from "react";
import TRIES_B_CSS from "./tries-b.css?inline";

/** «جرّبوها» — gallery ports of five-seconds, stress, understood, edge. Data and wording are the live journal's. */

function Box({ id, title, children }) {
  return (
    <section className="g-try" aria-labelledby={`g-try-${id}`}>
      <div className="g-try-in">
        <span className="g-try-k">جرّبوها</span>
        <h3 className="g-try-t" id={`g-try-${id}`}>{title}</h3>
        {children}
      </div>
    </section>
  );
}

const En = ({ children }) => <span className="g-en-line" dir="ltr" lang="en">{children}</span>;

function Dots({ n, at }) {
  return (
    <span className="g-dots" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => <i key={i} className={i <= at ? "is-on" : undefined} />)}
    </span>
  );
}

/* ── understand-but-cant-speak ── */
const PROMPTS = [
  ["المدير يسأل في الاجتماع: وين وصل التقرير؟", "I'm almost done. I'll send it by the end of the day."],
  ["سؤال في الاجتماع: متى نقدر نسلّم؟", "We can deliver by Thursday, if the data is ready."],
  ["العميل يسأل عن سبب التأخير.", "There was a delay on the supplier's side. We're back on track now."],
  ["نبي نقاطع بلطف عشان نضيف نقطة.", "Sorry to jump in, but can I add something here?"],
  ["ما لقطنا آخر جملة في المكالمة.", "Sorry, I didn't quite catch that. Could you say it again?"],
];

function FiveSeconds() {
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState("idle"); // idle | run | ask | out | stuck
  const [left, setLeft] = useState(5);
  const timer = useRef(0);
  useEffect(() => () => clearInterval(timer.current), []);
  const start = () => {
    setPhase("run");
    setLeft(5);
    clearInterval(timer.current);
    const t0 = Date.now();
    timer.current = setInterval(() => {
      const s = 5 - Math.floor((Date.now() - t0) / 1000);
      if (s <= 0) {
        clearInterval(timer.current);
        setLeft(0);
        setPhase("ask");
      } else setLeft(s);
    }, 200);
  };
  const next = () => {
    setI((i + 1) % PROMPTS.length);
    setPhase("idle");
    setLeft(5);
  };
  const [situation, line] = PROMPTS[i];
  const C = 2 * Math.PI * 58;
  return (
    <Box id="five" title="خمس ثواني، وجملة بصوت">
      <p>اقرؤوا الموقف، واضغطوا «ابدأ»، وقولوا جملة إنجليزية بصوت قبل ما تخلص الخمس ثواني. أي جملة توصل المعنى.</p>
      <p className="g-five-sit">{situation}</p>
      <div className="g-five-timer" role="timer" aria-live="off" aria-label={`${left} ثواني`}>
        <svg viewBox="0 0 132 132" aria-hidden="true">
          <circle cx="66" cy="66" r="58" fill="none" stroke="rgba(11,11,12,.15)" strokeWidth="8" />
          <circle cx="66" cy="66" r="58" fill="none" stroke="#0b0b0c" strokeWidth="8" strokeDasharray={C.toFixed(1)} strokeDashoffset={((1 - left / 5) * C).toFixed(1)} />
        </svg>
        <b>{left}</b>
      </div>
      <div aria-live="polite">
        {phase === "idle" ? (
          <div className="g-row-b g-c">
            <button type="button" className="g-pbtn" onClick={start}>ابدأ</button>
          </div>
        ) : null}
        {phase === "run" ? <p className="g-c">قولوها الحين، بصوت مسموع.</p> : null}
        {phase === "ask" ? (
          <>
            <p className="g-c">طلعت الجملة؟</p>
            <div className="g-row-b g-c">
              <button type="button" className="g-pbtn" onClick={() => setPhase("out")}>طلعت</button>
              <button type="button" className="g-pbtn g-pbtn--ghost" onClick={() => setPhase("stuck")}>علقت</button>
            </div>
          </>
        ) : null}
        {phase === "out" || phase === "stuck" ? (
          <>
            <p className="g-fb">
              {phase === "out"
                ? "حلو. كل مرة تطلع فيها الجملة بصوت، يقصر الطريق من الراس للفم. وهذي جملة ثانية لنفس الموقف:"
                : "طبيعي جداً. هذا بالضبط الفرق بين اللي نفهمه واللي نقوله. هذي جملة جاهزة للموقف، نقولها بصوت ثلاث مرات:"}
              <En>{line}</En>
            </p>
            <div className="g-row-b g-c">
              <button type="button" className="g-pbtn g-pbtn--ghost" onClick={next}>الموقف الجاي</button>
            </div>
          </>
        ) : null}
      </div>
    </Box>
  );
}

/* ── accent-is-not-the-problem ── */
const WORDS = [
  ["develop", "يطوّر", ["de", "vel", "op"], 1],
  ["photograph", "صورة", ["pho", "to", "graph"], 0],
  ["photography", "التصوير", ["pho", "tog", "ra", "phy"], 1],
  ["economic", "اقتصادي", ["e", "co", "nom", "ic"], 2],
  ["analysis", "تحليل", ["a", "nal", "y", "sis"], 1],
  ["company", "شركة", ["com", "pa", "ny"], 0],
];

function Stress() {
  const [w, setW] = useState(0);
  const [tries, setTries] = useState([]);
  const [canSpeak, setCanSpeak] = useState(false);
  useEffect(() => {
    setCanSpeak(typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window);
  }, []);
  useEffect(() => () => {
    try { if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel(); } catch { /* none */ }
  }, []);
  const [word, ar, syl, hit] = WORDS[w];
  const solved = tries.includes(hit);
  const say = () => {
    try {
      window.speechSynthesis.cancel();
      const u = new window.SpeechSynthesisUtterance(word);
      u.lang = "en-US";
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    } catch { /* no voice on this device */ }
  };
  const shown = syl.map((s, i) => (i === hit ? s.toUpperCase() : s)).join("-");
  return (
    <Box id="stress" title="وين النبر؟">
      <p>اضغطوا المقطع اللي ينقال أقوى. ست كلمات من الشغل اليومي.</p>
      <div className="g-row-b" style={{ marginBlockStart: 0, justifyContent: "space-between" }}>
        <span className="g-label">الكلمة {w + 1} من {WORDS.length}</span>
        <Dots n={WORDS.length} at={w} />
      </div>
      <p className="g-stress-ar">{ar}</p>
      <div className="g-stress-syl" role="group" aria-label={`مقاطع كلمة ${word}`} dir="ltr">
        {syl.map((s, i) => (
          <button
            key={i}
            type="button"
            lang="en"
            className={tries.includes(i) ? (i === hit ? "is-right" : "is-wrong") : undefined}
            onClick={() => !solved && setTries((t) => (t.includes(i) ? t : [...t, i]))}
            aria-label={`المقطع ${s}`}
          >
            {solved && i === hit ? s.toUpperCase() : s}
          </button>
        ))}
      </div>
      <div aria-live="polite">
        {solved ? (
          <p className="g-fb">
            {tries.length === 1 ? "من أول مرة. " : ""}النبر على <b>{syl[hit]}</b>: <En>{shown}</En>
          </p>
        ) : tries.length ? (
          <p className="g-fb">قريب. جرّبوا مقطع ثاني.</p>
        ) : null}
        <div className="g-row-b">
          {canSpeak ? <button type="button" className="g-pbtn g-pbtn--ghost" onClick={say}>اسمعوها</button> : null}
          {solved ? (
            <button type="button" className="g-pbtn" onClick={() => { setW((w + 1) % WORDS.length); setTries([]); }}>
              {w + 1 < WORDS.length ? "الكلمة الجاية" : "من البداية"}
            </button>
          ) : null}
        </div>
      </div>
    </Box>
  );
}

/* ── fear-of-mistakes ── */
const WRONG = [
  ["He go to the office every day.", "He goes to the office every day."],
  ["Yesterday I send the report.", "Yesterday I sent the report."],
  ["I am agree with you.", "I agree with you."],
  ["Can you explain me the plan?", "Can you explain the plan to me?"],
  ["We discussed about the budget.", "We discussed the budget."],
];

function Understood() {
  const [ans, setAns] = useState([]);
  const i = ans.length;
  const done = i >= WRONG.length;
  const yes = ans.filter(Boolean).length;
  return (
    <Box id="understood" title="وصل المعنى؟">
      {!done ? (
        <>
          <p>خمس جمل، كأن زميل قالها في اجتماع. ما نبي نصحّحها. نبي نعرف بس: فهمنا وش يقصد؟</p>
          <div className="g-row-b" style={{ marginBlockStart: 0, justifyContent: "space-between" }}>
            <span className="g-label">الجملة {i + 1} من {WRONG.length}</span>
            <Dots n={WRONG.length} at={i} />
          </div>
          <p className="g-und-s"><En>{WRONG[i][0]}</En></p>
          <div className="g-row-b">
            <button type="button" className="g-pbtn" onClick={() => setAns([...ans, true])}>فهمت المقصود</button>
            <button type="button" className="g-pbtn g-pbtn--ghost" onClick={() => setAns([...ans, false])}>ما فهمت</button>
          </div>
        </>
      ) : (
        <div aria-live="polite">
          <p className="g-fb">
            فهمنا المقصود في {yes} من {WRONG.length}. والجمل الخمس كلها فيها غلط. هذا اللي يصير في راس اللي يسمعنا: المعنى يوصل، والغلط يمرّ.
          </p>
          <ul className="g-und-list">
            {WRONG.map(([w, ok]) => (
              <li key={w}>
                <span className="g-und-bad" dir="ltr" lang="en">{w}</span>
                <span className="g-und-ok" dir="ltr" lang="en">{ok}</span>
              </li>
            ))}
          </ul>
          <div className="g-row-b">
            <button type="button" className="g-pbtn g-pbtn--ghost" onClick={() => setAns([])}>نعيدها</button>
          </div>
        </div>
      )}
    </Box>
  );
}

/* ── adults-learn-differently ── */
const EDGES = [
  ["السبب", "عندنا سبب محدد نتعلم عشانه؟ ترقية، أو مقابلة، أو عميل، أو دراسة.", "إيه، واضح", "لسه مب واضح", "نبدأ بموقف واحد نبي الإنجليزي له: اجتماع، أو مقابلة، أو إيميل. السبب الواضح يختار لنا وش نتعلم."],
  ["السياق", "نعرف شغلنا بالعربي؟ اجتماعاته، ومصطلحاته، وتقاريره.", "إيه", "جزئياً", "نبدأ من الكلمات اللي نستخدمها في شغلنا كل يوم. هناك الفكرة معروفة، والناقص الاسم الإنجليزي بس."],
  ["الانضباط", "نقدر نعطي الإنجليزي وقت ثابت، ولو قليل، أغلب أيام الأسبوع؟", "إيه", "صعب حالياً", "حتى عشر دقائق ثابتة، موزّعة على الأيام، أنفع من جلسة طويلة وحدة في الأسبوع."],
];

function Edge() {
  const [ans, setAns] = useState([]);
  const i = ans.length;
  const done = i >= EDGES.length;
  const yes = ans.filter(Boolean).length;
  return (
    <Box id="edge" title="ثلاث مزايا، كم منها عندنا؟">
      <div className="g-edge-chips" aria-hidden="true">
        {EDGES.map(([name], k) => <div key={name} className={ans[k] ? "is-lit" : undefined}>{name}</div>)}
      </div>
      {!done ? (
        <>
          <p className="g-edge-q">{EDGES[i][1]}</p>
          <div className="g-row-b">
            <button type="button" className="g-pbtn" onClick={() => setAns([...ans, true])}>{EDGES[i][2]}</button>
            <button type="button" className="g-pbtn g-pbtn--ghost" onClick={() => setAns([...ans, false])}>{EDGES[i][3]}</button>
          </div>
        </>
      ) : (
        <div aria-live="polite">
          <p className="g-fb">
            {yes === EDGES.length
              ? "الثلاث عندنا. وهذي مزايا ما عند الطفل، وكل وحدة منها تختصر جزء من الطريق."
              : `عندنا ${yes} من 3. والناقص يتبني، مب شي ينولد معنا:`}
          </p>
          {yes !== EDGES.length ? (
            <ul className="g-edge-tips">
              {EDGES.map(([name, , , , tip], k) => (!ans[k] ? (
                <li key={name}><b>{name}</b><span>{tip}</span></li>
              ) : null))}
            </ul>
          ) : null}
          <div className="g-row-b">
            <button type="button" className="g-pbtn g-pbtn--ghost" onClick={() => setAns([])}>نعيدها</button>
          </div>
        </div>
      )}
    </Box>
  );
}

export const TRIES_B = { "five-seconds": FiveSeconds, stress: Stress, understood: Understood, edge: Edge };
export { TRIES_B_CSS };
