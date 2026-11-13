import { useState } from "react";
import { TRIES_B } from "./tries-b";

/** «جرّبوها» — gallery-styled interactives. Data and wording are the live journal's. */

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
  if (r >= ROUNDS.length) {
    return (
      <Box id="meet" title="اجتماع من أربع حركات">
        <p className="g-fb" aria-live="polite">
          اخترنا الحركة الأنسب في {score} من 4. والفكرة مب الدرجة: كل حركة من هذي لها جملتين جاهزة، نجهّزها قبل الاجتماع، مب وقته.
        </p>
        <div className="g-row-b">
          <button type="button" className="g-pbtn g-pbtn--ghost" onClick={() => { setR(0); setPick(null); setScore(0); }}>نعيدها</button>
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
      <div className="g-row-b" style={{ marginBlockStart: 0, justifyContent: "space-between" }}>
        <span className="g-label">الحركة {r + 1} من 4</span>
        <Dots n={4} at={r} />
      </div>
      <p style={{ marginBlockStart: 12, fontWeight: 700 }}>
        {round.s} {round.en ? <span style={{ display: "block", marginBlockStart: 4 }}><En>{round.en}</En></span> : null}
        {round.note ? <span style={{ display: "block", fontWeight: 400, color: "var(--mute-paper)" }}>{round.note}</span> : null}
      </p>
      <div className="g-opts">
        {round.o.map(([text, good], k) => {
          const isEn = !text.startsWith("(");
          return (
            <button
              key={text}
              type="button"
              className={`g-opt${pick === k ? (good ? " is-good" : " is-meh") : ""}`}
              aria-pressed={pick === k}
              disabled={pick !== null && pick !== k}
              onClick={() => choose(k)}
            >
              {isEn ? <En>{text}</En> : <span className="g-ar-opt">{text.slice(1, -1)}</span>}
            </button>
          );
        })}
      </div>
      <div aria-live="polite">
        {pick !== null ? (
          <>
            <p className="g-fb">{round.o[pick][2]}{!round.o[pick][1] ? <> الأنسب هنا: <En>{round.o.find((o) => o[1])[0]}</En></> : null}</p>
            <div className="g-row-b">
              <button type="button" className="g-pbtn" onClick={() => { setR(r + 1); setPick(null); }}>{r + 1 < ROUNDS.length ? "الحركة الجاية" : "النتيجة"}</button>
            </div>
          </>
        ) : null}
      </div>
    </Box>
  );
}

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
  const [all, setAll] = useState("lit");
  const [flip, setFlip] = useState({});
  const [tick, setTick] = useState(0);
  const mode = (i) => (flip[i] ? (all === "lit" ? "nat" : "lit") : all);
  return (
    <Box id="literal" title="حرفي، ولا طبيعي؟">
      <p>نفس الفكرة، مرتين: مرة مترجمة من العربي كلمة كلمة، ومرة كما يقولها أهل اللغة. بدّلوا بين الوضعين، أو اضغطوا أي سطر لوحده.</p>
      <div className="g-toggle" role="group" aria-label="طريقة العرض">
        <button type="button" aria-pressed={all === "lit"} onClick={() => { setAll("lit"); setFlip({}); setTick((t) => t + 1); }}>حرفي</button>
        <button type="button" aria-pressed={all === "nat"} onClick={() => { setAll("nat"); setFlip({}); setTick((t) => t + 1); }}>طبيعي</button>
      </div>
      <ul className="g-pairs">
        {PAIRS.map(([ar, lit, nat], i) => {
          const m = mode(i);
          return (
            <li key={lit}>
              <button
                type="button"
                className="g-pair"
                data-m={m}
                onClick={() => setFlip((f) => ({ ...f, [i]: !f[i] }))}
                aria-label={`${ar}: ${m === "nat" ? "الطبيعي" : "الحرفي"}. اضغطوا للتبديل`}
              >
                <span className="g-ar"><b>{m === "nat" ? "طبيعي" : "حرفي"}</b>{ar}</span>
                <span className="g-ln" dir="ltr" lang="en"><span key={m + tick}>{m === "nat" ? nat : lit}</span></span>
              </button>
            </li>
          );
        })}
      </ul>
    </Box>
  );
}

const TRIES = { "meeting-sim": MeetingSim, literal: Literal, ...TRIES_B };
export const hasTry = (id) => Boolean(TRIES[id]);
export default function Try({ id }) {
  const C = TRIES[id];
  return C ? <C /> : null;
}
