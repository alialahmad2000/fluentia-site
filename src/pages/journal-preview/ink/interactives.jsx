import { useState } from "react";

/**
 * «جرّبوها» in the ink direction. Same data and behaviour as the live journal
 * (src/pages/journal/interactives.jsx): tap/keyboard/screen-reader, nothing
 * scored against the reader, nothing stored. Touch targets >= 56px.
 */
function Box({ id, title, children }) {
  return (
    <section className="ink-try" aria-labelledby={`ink-try-${id}`}>
      <span className="ink-try-k">جرّبوها</span>
      <h3 className="ink-try-t" id={`ink-try-${id}`}>{title}</h3>
      {children}
    </section>
  );
}
const En = ({ children }) => <span className="ink-en-line" dir="ltr" lang="en">{children}</span>;
const Dots = ({ n, at }) => (
  <span className="ink-dots" aria-hidden="true">{Array.from({ length: n }, (_, i) => <i key={i} className={i <= at ? "is-on" : undefined} />)}</span>
);

const ROUNDS = [
  { s: "قبل الاجتماع، زميل يسأل:", en: "How's your week going?", o: [
    ["Pretty busy, but good. How about yours?", 1, "جواب، وزيادة صغيرة، ورجّعنا السؤال. هذي القاعدة الذهبية."],
    ["Fine.", 0, "صحيحة، بس تقفل الحديث. نزيد شي صغير ونرجّع السؤال."],
    ["I am fine, thank you. And you?", 0, "مفهومة، بس تطلع محفوظة ورسمية زيادة لكلام جانبي."],
  ] },
  { s: "الزميل يتكلم، وعندنا نقطة مهمة عن الميزانية.", o: [
    ["Wait, wait. The budget!", 0, "توصل، بس تطلع حادة. المقاطعة تحتاج غلاف لطيف."],
    ["Sorry to interrupt, but can I add something on the budget?", 1, "مقاطعة لطيفة وواضحة. ما فيها قلة أدب."],
    ["(نسكت لين يخلص الاجتماع)", 0, "الصمت الطويل هو اللي يُقرأ غياب. والنقطة تضيع."],
  ] },
  { s: "المدير يقول:", en: "We'll move it to Q2.", note: "وما نعرف: هل المقصود نبدأ من أبريل؟", o: [
    ["What?", 0, "ما فيها غلط قواعد، بس فيها غلط نبرة."],
    ["(نهز راسنا كأننا فاهمين)", 0, "وبعدها بنص ساعة نكتشف إن المطلوب كان شي ثاني."],
    ["Just to make sure I've got it: you mean we start in April?", 1, "نعيد اللي فهمناه بكلماتنا، ونترك الطرف الثاني يصحّح."],
  ] },
  { s: "الاجتماع يخلص، ونبي نثبّت من بيسوي وش.", o: [
    ["Thank you for your time.", 0, "جميلة كختام، بس ما ثبّتت من بيسوي وش، ومتى."],
    ["So, just to recap: I'll send the report by Thursday, and the finance team will check the numbers.", 1, "التزام ووقت، في جملة وحدة. هذا الختام اللي يتذكّره الكل."],
    ["OK, bye.", 0, "تقفل المكالمة، بس تقفل معها الفرصة."],
  ] },
];

function MeetingSim() {
  const [r, setR] = useState(0);
  const [pick, setPick] = useState(null);
  const [score, setScore] = useState(0);
  if (r >= ROUNDS.length) {
    return (
      <Box id="meet" title="اجتماع من أربع حركات">
        <p className="ink-fb" aria-live="polite">اخترنا الحركة الأنسب في {score} من 4. والفكرة مب الدرجة: كل حركة من هذي لها جملتين جاهزة، نجهّزها قبل الاجتماع، مب وقته.</p>
        <div className="ink-row"><button type="button" className="ink-btn ink-btn--ghost" onClick={() => { setR(0); setPick(null); setScore(0); }}>نعيدها</button></div>
      </Box>
    );
  }
  const round = ROUNDS[r];
  const choose = (k) => { if (pick !== null) return; setPick(k); if (round.o[k][1]) setScore((s) => s + 1); };
  return (
    <Box id="meet" title="اجتماع من أربع حركات">
      <div className="ink-row" style={{ marginTop: 0, justifyContent: "space-between" }}>
        <span className="ink-lbl">الحركة {r + 1} من 4</span><Dots n={4} at={r} />
      </div>
      <p style={{ marginTop: 14 }}>
        {round.s} {round.en ? <En>{round.en}</En> : null}
        {round.note ? <span style={{ display: "block", color: "var(--mute)" }}>{round.note}</span> : null}
      </p>
      <div className="ink-opts">
        {round.o.map(([text, good], k) => (
          <button key={text} type="button" className={`ink-opt${pick === k ? (good ? " is-good" : " is-meh") : ""}`} aria-pressed={pick === k} disabled={pick !== null && pick !== k} onClick={() => choose(k)}>
            {text.startsWith("(") ? text.slice(1, -1) : <En>{text}</En>}
          </button>
        ))}
      </div>
      <div aria-live="polite">
        {pick !== null ? (
          <>
            <p className="ink-fb">{round.o[pick][2]}{!round.o[pick][1] ? <> الأنسب هنا: <En>{round.o.find((o) => o[1])[0]}</En></> : null}</p>
            <div className="ink-row"><button type="button" className="ink-btn" onClick={() => { setR(r + 1); setPick(null); }}>{r + 1 < ROUNDS.length ? "الحركة الجاية" : "النتيجة"}</button></div>
          </>
        ) : null}
      </div>
    </Box>
  );
}

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
  const yes = ans.filter(Boolean).length;
  return (
    <Box id="understood" title="وصل المعنى؟">
      {i < WRONG.length ? (
        <>
          <p>خمس جمل، كأن زميل قالها في اجتماع. ما نبي نصحّحها. نبي نعرف بس: فهمنا وش يقصد؟</p>
          <div className="ink-row" style={{ justifyContent: "space-between", marginTop: 8 }}>
            <span className="ink-lbl">الجملة {i + 1} من {WRONG.length}</span><Dots n={WRONG.length} at={i} />
          </div>
          <p className="ink-sentence"><En>{WRONG[i][0]}</En></p>
          <div className="ink-row">
            <button type="button" className="ink-btn" onClick={() => setAns([...ans, true])}>فهمت المقصود</button>
            <button type="button" className="ink-btn ink-btn--ghost" onClick={() => setAns([...ans, false])}>ما فهمت</button>
          </div>
        </>
      ) : (
        <div aria-live="polite">
          <p className="ink-fb">فهمنا المقصود في {yes} من {WRONG.length}. والجمل الخمس كلها فيها غلط. هذا اللي يصير في راس اللي يسمعنا: المعنى يوصل، والغلط يمرّ.</p>
          <ul className="ink-pairs">
            {WRONG.map(([w, ok]) => (
              <li key={w}><span className="ink-wrong" dir="ltr" lang="en">{w}</span><En>{ok}</En></li>
            ))}
          </ul>
          <div className="ink-row"><button type="button" className="ink-btn ink-btn--ghost" onClick={() => setAns([])}>نعيدها</button></div>
        </div>
      )}
    </Box>
  );
}

const TRIES = { "meeting-sim": MeetingSim, understood: Understood };
export default function Try({ id }) {
  const C = TRIES[id];
  return C ? <C /> : null;
}
