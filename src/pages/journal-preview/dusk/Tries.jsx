import { useState } from "react";

/**
 * «جرّبوها» for «غسق الصحراء»: the meeting simulation (flagship) and «ثلاث مزايا» (adults-learn-differently).
 * Data and wording are the live journal's; only the look changed. Works by tap, keyboard and screen reader.
 */

function Box({ id, title, children }) {
  return (
    <section className="dk-try dk-r" aria-labelledby={`dk-try-${id}`}>
      <span className="dk-try-k">جرّبوها</span>
      <h3 className="dk-try-t" id={`dk-try-${id}`}>{title}</h3>
      {children}
    </section>
  );
}

const En = ({ children }) => <span className="dk-en-line" dir="ltr" lang="en">{children}</span>;

function Dots({ n, at }) {
  return (
    <span className="dk-dots" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => <i key={i} className={i <= at ? "is-on" : undefined} />)}
    </span>
  );
}

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
        <p className="dk-fb" aria-live="polite">
          اخترنا الحركة الأنسب في {score} من 4. والفكرة مب الدرجة: كل حركة من هذي لها جملتين جاهزة، نجهّزها قبل الاجتماع، مب وقته.
        </p>
        <div className="dk-row">
          <button type="button" className="dk-btn dk-btn--ghost" onClick={() => { setR(0); setPick(null); setScore(0); }}>نعيدها</button>
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
      <div className="dk-row" style={{ marginTop: 0, justifyContent: "space-between" }}>
        <span className="dk-lbl">الحركة {r + 1} من 4</span>
        <Dots n={4} at={r} />
      </div>
      <p style={{ marginTop: 10 }}>
        {round.s} {round.en ? <En>{round.en}</En> : null}
        {round.note ? <span className="dk-mute">{round.note}</span> : null}
      </p>
      <div className="dk-opts">
        {round.o.map(([text, good], k) => {
          const isEn = !text.startsWith("(");
          return (
            <button
              key={text}
              type="button"
              className={`dk-opt${pick === k ? (good ? " is-good" : " is-meh") : ""}`}
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
            <p className="dk-fb">{round.o[pick][2]}{!round.o[pick][1] ? <> الأنسب هنا: <En>{round.o.find((o) => o[1])[0]}</En></> : null}</p>
            <div className="dk-row">
              <button type="button" className="dk-btn" onClick={() => { setR(r + 1); setPick(null); }}>{r + 1 < ROUNDS.length ? "الحركة الجاية" : "النتيجة"}</button>
            </div>
          </>
        ) : null}
      </div>
    </Box>
  );
}

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
      <div className="dk-edge" aria-hidden="true">
        {EDGES.map(([name], k) => <div key={name} className={ans[k] ? "is-lit" : undefined}>{name}</div>)}
      </div>
      {!done ? (
        <>
          <p style={{ marginTop: 12 }}>{EDGES[i][1]}</p>
          <div className="dk-row">
            <button type="button" className="dk-btn" onClick={() => setAns([...ans, true])}>{EDGES[i][2]}</button>
            <button type="button" className="dk-btn dk-btn--ghost" onClick={() => setAns([...ans, false])}>{EDGES[i][3]}</button>
          </div>
        </>
      ) : (
        <div aria-live="polite">
          <p className="dk-fb">
            {ans.every(Boolean)
              ? "الثلاث عندنا. وهذي مزايا ما عند الطفل، وكل وحدة منها تختصر جزء من الطريق."
              : `عندنا ${ans.filter(Boolean).length} من 3. والناقص يتبني، مب شي ينولد معنا:`}
          </p>
          {!ans.every(Boolean) ? (
            <ul className="dk-pairs">
              {EDGES.map(([name, , , , tip], k) => (!ans[k] ? (
                <li key={name}><b>{name}</b><span>{tip}</span></li>
              ) : null))}
            </ul>
          ) : null}
          <div className="dk-row">
            <button type="button" className="dk-btn dk-btn--ghost" onClick={() => setAns([])}>نعيدها</button>
          </div>
        </div>
      )}
    </Box>
  );
}


const TRIES = { "meeting-sim": MeetingSim, edge: Edge };

export default function Try({ id }) {
  const C = TRIES[id];
  return C ? <C /> : null;
}
