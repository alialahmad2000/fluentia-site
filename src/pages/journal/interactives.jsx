import { useEffect, useRef, useState } from "react";

/**
 * «جرّبوها» — one small interactive per article. Everything works by tap,
 * keyboard and screen reader; nothing is scored against the reader, nothing is
 * stored, nothing leaves the page. Copy addresses the reader in the plural
 * (as the articles do), so no line is gendered.
 */

function Box({ id, title, children }) {
  return (
    <section className="jr-try jr-b" aria-labelledby={`jr-try-${id}`}>
      <span className="jr-try-k">جرّبوها</span>
      <h3 className="jr-try-t" id={`jr-try-${id}`}>{title}</h3>
      {children}
    </section>
  );
}

const En = ({ children }) => <span className="jr-en-line" dir="ltr" lang="en">{children}</span>;

function Dots({ n, at }) {
  return (
    <span className="jr-progress-dots" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => <i key={i} className={i <= at ? "is-on" : undefined} />)}
    </span>
  );
}

/* ── understand-but-cant-speak: five seconds to say it ──────────── */
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
      <p style={{ color: "var(--jr-cream)", fontWeight: 700, fontSize: "1.08em" }}>{situation}</p>
      <div className="jr-timer" role="timer" aria-live="off" aria-label={`${left} ثواني`}>
        <svg viewBox="0 0 132 132" aria-hidden="true">
          <circle cx="66" cy="66" r="58" fill="none" stroke="rgba(243,237,226,.12)" strokeWidth="6" />
          <circle cx="66" cy="66" r="58" fill="none" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" strokeDasharray={C.toFixed(1)} strokeDashoffset={((1 - left / 5) * C).toFixed(1)} style={{ transition: "stroke-dashoffset .25s linear" }} />
        </svg>
        <b>{left}</b>
      </div>
      <div aria-live="polite">
        {phase === "idle" ? (
          <div className="jr-row" style={{ justifyContent: "center" }}>
            <button type="button" className="jr-btn" onClick={start}>ابدأ</button>
          </div>
        ) : null}
        {phase === "run" ? <p style={{ textAlign: "center" }}>قولوها الحين، بصوت مسموع.</p> : null}
        {phase === "ask" ? (
          <>
            <p style={{ textAlign: "center" }}>طلعت الجملة؟</p>
            <div className="jr-row" style={{ justifyContent: "center" }}>
              <button type="button" className="jr-btn" onClick={() => setPhase("out")}>طلعت</button>
              <button type="button" className="jr-btn jr-btn--ghost" onClick={() => setPhase("stuck")}>علقت</button>
            </div>
          </>
        ) : null}
        {phase === "out" || phase === "stuck" ? (
          <>
            <p className="jr-fb">
              {phase === "out"
                ? "حلو. كل مرة تطلع فيها الجملة بصوت، يقصر الطريق من الراس للفم. وهذي جملة ثانية لنفس الموقف:"
                : "طبيعي جداً. هذا بالضبط الفرق بين اللي نفهمه واللي نقوله. هذي جملة جاهزة للموقف، نقولها بصوت ثلاث مرات:"}
              <En>{line}</En>
            </p>
            <div className="jr-row" style={{ justifyContent: "center" }}>
              <button type="button" className="jr-btn jr-btn--ghost" onClick={next}>الموقف الجاي</button>
            </div>
          </>
        ) : null}
      </div>
    </Box>
  );
}

/* ── first-ten-minutes: a four-move meeting ─────────────────────── */
const ROUNDS = [
  {
    s: "قبل الاجتماع، زميل يسأل:",
    en: "How's your week going?",
    o: [
      ["Pretty busy, but good. How about yours?", 1, "جواب، وزيادة صغيرة، ورجّعنا السؤال. هذي القاعدة الذهبية."],
      ["Fine.", 0, "صحيحة، بس تقفل الحديث. نزيد شي صغير ونرجّع السؤال."],
      ["I am fine, thank you. And you?", 0, "مفهومة، بس تطلع محفوظة ورسمية زيادة لكلام جانبي."],
    ],
  },
  {
    s: "الزميل يتكلم، وعندنا نقطة مهمة عن الميزانية.",
    o: [
      ["Wait, wait. The budget!", 0, "توصل، بس تطلع حادة. المقاطعة تحتاج غلاف لطيف."],
      ["Sorry to interrupt, but can I add something on the budget?", 1, "مقاطعة لطيفة وواضحة. ما فيها قلة أدب."],
      ["(نسكت لين يخلص الاجتماع)", 0, "الصمت الطويل هو اللي يُقرأ غياب. والنقطة تضيع."],
    ],
  },
  {
    s: "المدير يقول:",
    en: "We'll move it to Q2.",
    note: "وما نعرف: هل المقصود نبدأ من أبريل؟",
    o: [
      ["What?", 0, "ما فيها غلط قواعد، بس فيها غلط نبرة."],
      ["(نهز راسنا كأننا فاهمين)", 0, "وبعدها بنص ساعة نكتشف إن المطلوب كان شي ثاني."],
      ["Just to make sure I've got it: you mean we start in April?", 1, "نعيد اللي فهمناه بكلماتنا، ونترك الطرف الثاني يصحّح."],
    ],
  },
  {
    s: "الاجتماع يخلص، ونبي نثبّت من بيسوي وش.",
    o: [
      ["Thank you for your time.", 0, "جميلة كختام، بس ما ثبّتت من بيسوي وش، ومتى."],
      ["So, just to recap: I'll send the report by Thursday, and the finance team will check the numbers.", 1, "التزام ووقت، في جملة وحدة. هذا الختام اللي يتذكّره الكل."],
      ["OK, bye.", 0, "تقفل المكالمة، بس تقفل معها الفرصة."],
    ],
  },
];
function MeetingSim() {
  const [r, setR] = useState(0);
  const [pick, setPick] = useState(null);
  const [score, setScore] = useState(0);
  const done = r >= ROUNDS.length;
  if (done) {
    return (
      <Box id="meet" title="اجتماع من أربع حركات">
        <p className="jr-fb" aria-live="polite">
          اخترنا الحركة الأنسب في {score} من 4. والفكرة مب الدرجة: كل حركة من هذي لها جملتين جاهزة، نجهّزها قبل الاجتماع، مب وقته.
        </p>
        <div className="jr-row">
          <button type="button" className="jr-btn jr-btn--ghost" onClick={() => { setR(0); setPick(null); setScore(0); }}>نعيدها</button>
        </div>
      </Box>
    );
  }
  const round = ROUNDS[r];
  const choose = (k) => {
    if (pick !== null) return;
    setPick(k);
    if (round.o[k][1]) setScore((s) => s + 1);
  };
  return (
    <Box id="meet" title="اجتماع من أربع حركات">
      <div className="jr-row" style={{ marginTop: 0, justifyContent: "space-between" }}>
        <span className="jr-lbl">الحركة {r + 1} من 4</span>
        <Dots n={4} at={r} />
      </div>
      <p style={{ marginTop: 10 }}>
        {round.s} {round.en ? <En>{round.en}</En> : null}
        {round.note ? <span style={{ display: "block", color: "var(--jr-mute)" }}>{round.note}</span> : null}
      </p>
      <div className="jr-opts">
        {round.o.map(([text, good], k) => {
          const isEn = !text.startsWith("(");
          return (
            <button
              key={text}
              type="button"
              className={`jr-opt${pick === k ? (good ? " is-good" : " is-meh") : ""}`}
              aria-pressed={pick === k}
              disabled={pick !== null && pick !== k}
              onClick={() => choose(k)}
            >
              {isEn ? <En>{text}</En> : text.slice(1, -1)}
            </button>
          );
        })}
      </div>
      <div aria-live="polite">
        {pick !== null ? (
          <>
            <p className="jr-fb">{round.o[pick][2]}{!round.o[pick][1] ? <> الأنسب هنا: <En>{round.o.find((o) => o[1])[0]}</En></> : null}</p>
            <div className="jr-row">
              <button type="button" className="jr-btn" onClick={() => { setR(r + 1); setPick(null); }}>{r + 1 < ROUNDS.length ? "الحركة الجاية" : "النتيجة"}</button>
            </div>
          </>
        ) : null}
      </div>
    </Box>
  );
}

/* ── words-that-betrayed-us: literal vs natural ─────────────────── */
const PAIRS = [
  ["«افتح النور»", "Can you open the light?", "Can you turn on the light?"],
  ["«نتناقش عن الميزانية»", "We discussed about the budget.", "We discussed the budget."],
  ["«اشرح لي الخطة»", "Can you explain me the plan?", "Can you explain the plan to me?"],
  ["«لي خمس سنين هنا»", "I have five years here.", "I've worked here for five years."],
  ["«المعذرة على التأخير»", "Sorry for late.", "Sorry I'm late."],
  ["«بسكّر المايك»", "I'll close my mic.", "I'll mute myself."],
  ["«أنا موافق»", "I am agree.", "I agree."],
];
function Literal() {
  const [all, setAll] = useState("lit"); // lit | nat
  const [flip, setFlip] = useState({});
  const mode = (i) => (flip[i] ? (all === "lit" ? "nat" : "lit") : all);
  return (
    <Box id="literal" title="حرفي، ولا طبيعي؟">
      <p>نفس الفكرة، مرتين: مرة مترجمة من العربي كلمة كلمة، ومرة كما يقولها أهل اللغة. بدّلوا بين الوضعين، أو اضغطوا أي سطر لوحده.</p>
      <div className="jr-toggle" role="group" aria-label="طريقة العرض">
        <button type="button" aria-pressed={all === "lit"} onClick={() => { setAll("lit"); setFlip({}); }}>حرفي</button>
        <button type="button" aria-pressed={all === "nat"} onClick={() => { setAll("nat"); setFlip({}); }}>طبيعي</button>
      </div>
      <ul className="jr-pairs">
        {PAIRS.map(([ar, lit, nat], i) => {
          const m = mode(i);
          return (
            <li key={lit} className={m === "nat" ? "is-lit" : "is-off"}>
              <button
                type="button"
                onClick={() => setFlip((f) => ({ ...f, [i]: !f[i] }))}
                style={{ all: "unset", cursor: "pointer", display: "grid", gap: 2 }}
                aria-label={`${ar}: ${m === "nat" ? "الطبيعي" : "الحرفي"}. اضغطوا للتبديل`}
              >
                <span className="jr-ar">{ar} · {m === "nat" ? "طبيعي" : "حرفي"}</span>
                <span className="jr-en-line" dir="ltr" lang="en">{m === "nat" ? nat : lit}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </Box>
  );
}

/* ── accent-is-not-the-problem: find the stress ─────────────────── */
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
      <div className="jr-row" style={{ justifyContent: "space-between", marginTop: 0 }}>
        <span className="jr-lbl">الكلمة {w + 1} من {WORDS.length}</span>
        <Dots n={WORDS.length} at={w} />
      </div>
      <p className="jr-word-ar" style={{ marginTop: 12 }}>{ar}</p>
      <div className="jr-syl" role="group" aria-label={`مقاطع كلمة ${word}`}>
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
      <div aria-live="polite" style={{ textAlign: "center" }}>
        {solved ? (
          <p className="jr-fb">
            {tries.length === 1 ? "من أول مرة. " : ""}النبر على <b>{syl[hit]}</b>: <En>{shown}</En>
          </p>
        ) : tries.length ? (
          <p className="jr-fb">قريب. جرّبوا مقطع ثاني.</p>
        ) : null}
        <div className="jr-row" style={{ justifyContent: "center" }}>
          {canSpeak ? <button type="button" className="jr-btn jr-btn--ghost" onClick={say}>اسمعوها</button> : null}
          {solved ? (
            <button type="button" className="jr-btn" onClick={() => { setW((w + 1) % WORDS.length); setTries([]); }}>
              {w + 1 < WORDS.length ? "الكلمة الجاية" : "من البداية"}
            </button>
          ) : null}
        </div>
      </div>
    </Box>
  );
}

/* ── fear-of-mistakes: did the meaning get through? ─────────────── */
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
          <div className="jr-row" style={{ justifyContent: "space-between", marginTop: 0 }}>
            <span className="jr-lbl">الجملة {i + 1} من {WRONG.length}</span>
            <Dots n={WRONG.length} at={i} />
          </div>
          <p style={{ margin: "16px 0", fontSize: "1.2em", color: "var(--jr-cream)" }}><En>{WRONG[i][0]}</En></p>
          <div className="jr-row">
            <button type="button" className="jr-btn" onClick={() => setAns([...ans, true])}>فهمت المقصود</button>
            <button type="button" className="jr-btn jr-btn--ghost" onClick={() => setAns([...ans, false])}>ما فهمت</button>
          </div>
        </>
      ) : (
        <div aria-live="polite">
          <p className="jr-fb">
            فهمنا المقصود في {yes} من {WRONG.length}. والجمل الخمس كلها فيها غلط. هذا اللي يصير في راس اللي يسمعنا: المعنى يوصل، والغلط يمرّ.
          </p>
          <ul className="jr-pairs">
            {WRONG.map(([w, ok]) => (
              <li key={w} className="is-lit">
                <span className="jr-ar" dir="ltr" lang="en" style={{ textAlign: "left", textDecoration: "line-through", textDecorationColor: "rgba(251,191,36,.7)" }}>{w}</span>
                <span className="jr-en-line" dir="ltr" lang="en">{ok}</span>
              </li>
            ))}
          </ul>
          <div className="jr-row">
            <button type="button" className="jr-btn jr-btn--ghost" onClick={() => setAns([])}>نعيدها</button>
          </div>
        </div>
      )}
    </Box>
  );
}

/* ── adults-learn-differently: the three advantages ─────────────── */
const EDGES = [
  ["السبب", "عندنا سبب محدد نتعلم عشانه؟ ترقية، أو مقابلة، أو عميل، أو دراسة.", "إيه، واضح", "لسه مب واضح", "نبدأ بموقف واحد نبي الإنجليزي له: اجتماع، أو مقابلة، أو إيميل. السبب الواضح يختار لنا وش نتعلم."],
  ["السياق", "نعرف شغلنا بالعربي؟ اجتماعاته، ومصطلحاته، وتقاريره.", "إيه", "جزئياً", "نبدأ من الكلمات اللي نستخدمها في شغلنا كل يوم. هناك الفكرة معروفة، والناقص الاسم الإنجليزي بس."],
  ["الانضباط", "نقدر نعطي الإنجليزي وقت ثابت، ولو قليل، أغلب أيام الأسبوع؟", "إيه", "صعب حالياً", "حتى عشر دقائق ثابتة، موزّعة على الأيام، أنفع من جلسة طويلة وحدة في الأسبوع."],
];
function Edge() {
  const [ans, setAns] = useState([]);
  const i = ans.length;
  const done = i >= EDGES.length;
  return (
    <Box id="edge" title="ثلاث مزايا، كم منها عندنا؟">
      <div className="jr-edge" aria-hidden="true">
        {EDGES.map(([name], k) => <div key={name} className={ans[k] ? "is-lit" : undefined}>{name}</div>)}
      </div>
      {!done ? (
        <>
          <p style={{ marginTop: 12 }}>{EDGES[i][1]}</p>
          <div className="jr-row">
            <button type="button" className="jr-btn" onClick={() => setAns([...ans, true])}>{EDGES[i][2]}</button>
            <button type="button" className="jr-btn jr-btn--ghost" onClick={() => setAns([...ans, false])}>{EDGES[i][3]}</button>
          </div>
        </>
      ) : (
        <div aria-live="polite">
          <p className="jr-fb">
            {ans.every(Boolean)
              ? "الثلاث عندنا. وهذي مزايا ما عند الطفل، وكل وحدة منها تختصر جزء من الطريق."
              : `عندنا ${ans.filter(Boolean).length} من 3. والناقص يتبني، مب شي ينولد معنا:`}
          </p>
          {!ans.every(Boolean) ? (
            <ul className="jr-pairs">
              {EDGES.map(([name, , , , tip], k) => (!ans[k] ? (
                <li key={name}><b>{name}</b><span>{tip}</span></li>
              ) : null))}
            </ul>
          ) : null}
          <div className="jr-row">
            <button type="button" className="jr-btn jr-btn--ghost" onClick={() => setAns([])}>نعيدها</button>
          </div>
        </div>
      )}
    </Box>
  );
}

const TRIES = {
  "five-seconds": FiveSeconds,
  "meeting-sim": MeetingSim,
  literal: Literal,
  stress: Stress,
  understood: Understood,
  edge: Edge,
};

export default function Try({ id }) {
  const C = TRIES[id];
  return C ? <C /> : null;
}
