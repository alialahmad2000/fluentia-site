import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Seo from "../../components/Seo";
import BrandMark from '../../components/BrandMark';
import {
  bOf, serve, estimateTheta, buildStage1, buildStage2, buildStage3,
  buildListening, writingPrompt, buildReport,
} from './engine';
import {
  Progress, QuestionScreen, ListeningScreen, ListeningIntro, WritingScreen, useEnglishVoice,
} from './ExamScreens';
import ResultScreen from './ResultScreen';
import { startAttempt, finishAttempt, fireTracking, GOALS } from './submit';
import './levelTest.css';

const TOTAL_ITEMS = 26; // 22 multiple-choice + 4 listening

/* Saudi mobile: 05XXXXXXXX locally, or +9665XXXXXXXX / 9665XXXXXXXX. */
function normalizePhone(raw) {
  const d = (raw || '').replace(/[^\d]/g, '');
  if (/^05\d{8}$/.test(d)) return `0${d.slice(1)}`;
  if (/^9665\d{8}$/.test(d)) return `0${d.slice(3)}`;
  if (/^5\d{8}$/.test(d)) return `0${d}`;
  return null;
}

export default function LevelTestPage() {
  const [phase, setPhase] = useState('intro'); // intro|gate1|exam|listenIntro|writing|gate2|result
  const [lead, setLead] = useState({ name: '', age: '', gender: '', phone: '', goal: '' });
  const [attemptId, setAttemptId] = useState(null);

  // Exam state. Responses live in a ref as well, because the next stage is
  // built from them inside the same tick that records the last answer.
  const usedRef = useRef(new Set());
  const responsesRef = useRef([]);
  const startedAtRef = useRef(0);
  const lastTickRef = useRef(0);
  const activeMsRef = useRef(0);
  const leftPageRef = useRef(0);
  const [queue, setQueue] = useState([]);
  const [idx, setIdx] = useState(0);
  const [stage, setStage] = useState(1);
  const [answered, setAnswered] = useState(0);
  const [listeningDone, setListeningDone] = useState(false);
  const [report, setReport] = useState(null);
  const [saving, setSaving] = useState(false);

  const voice = useEnglishVoice(); // undefined = detecting, null = unavailable

  /* ─── Integrity signal: how often the tab lost focus mid-exam ─────────── */
  useEffect(() => {
    if (phase !== 'exam') return undefined;
    const onBlur = () => { leftPageRef.current += 1; };
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, [phase]);

  /* ─── Don't let eight minutes of work vanish on an accidental refresh ── */
  useEffect(() => {
    const guarded = ['exam', 'listenIntro', 'writing', 'gate2'].includes(phase);
    if (!guarded) return undefined;
    const onUnload = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [phase]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [phase, idx, stage]);

  const stageLabel = useMemo(() => {
    if (stage === 1) return 'المرحلة الأولى — نحدد نطاقك';
    if (stage === 2) return 'المرحلة الثانية — نضيّق النطاق';
    if (stage === 3) return 'المرحلة الثالثة — نأكّد المستوى';
    return 'قسم الاستماع';
  }, [stage]);

  /* ─── Flow ────────────────────────────────────────────────────────────── */

  const beginExam = useCallback((leadData) => {
    usedRef.current = new Set();
    responsesRef.current = [];
    startedAtRef.current = Date.now();
    lastTickRef.current = Date.now();
    activeMsRef.current = 0;
    setQueue(buildStage1(usedRef.current).map(serve));
    setIdx(0);
    setStage(1);
    setAnswered(0);
    setPhase('exam');
    startAttempt(leadData).then(setAttemptId); // fire-and-forget
  }, []);

  const finish = useCallback((writingText) => {
    // Count the writing screen too, under the same idle cap.
    const now = Date.now();
    activeMsRef.current += Math.min(now - (lastTickRef.current || now), 120_000);
    lastTickRef.current = now;

    const built = buildReport({
      responses: responsesRef.current,
      writing: writingText || '',
      listeningDone,
      leftPage: leftPageRef.current,
      elapsedMs: activeMsRef.current,
    });
    setReport(built);
    setPhase('gate2');
  }, [listeningDone]);

  const nextStage = useCallback(() => {
    const responses = responsesRef.current;
    const { theta } = estimateTheta(responses);

    if (stage === 1) {
      setQueue(buildStage2(theta, usedRef.current).map(serve));
      setIdx(0);
      setStage(2);
      return;
    }
    if (stage === 2) {
      setQueue(buildStage3(theta, usedRef.current).map(serve));
      setIdx(0);
      setStage(3);
      return;
    }
    if (stage === 3) {
      // Always offered: the clips are pre-rendered files, so this no longer
      // depends on the device shipping an English speech voice.
      setQueue(buildListening(theta).map(serve));
      setIdx(0);
      setStage(4);
      setPhase('listenIntro');
      return;
    }
    // stage 4 (listening) finished
    setListeningDone(true);
    setPhase('writing');
  }, [stage]);

  const onAnswer = useCallback((pickedIndex) => {
    // Count time question-by-question and discard any gap longer than two
    // minutes: a student who wanders off and comes back tomorrow should not be
    // reported as having spent seven hours on the exam.
    const now = Date.now();
    activeMsRef.current += Math.min(now - (lastTickRef.current || now), 120_000);
    lastTickRef.current = now;

    const item = queue[idx];
    responsesRef.current = [
      ...responsesRef.current,
      {
        id: item.id,
        skill: item.skill,
        lvl: item.lvl,
        b: bOf(item),
        correct: pickedIndex === item.correctIndex,
      },
    ];
    setAnswered((n) => n + 1);
    if (idx + 1 < queue.length) setIdx(idx + 1);
    else nextStage();
  }, [queue, idx, nextStage]);

  const submitFinal = useCallback(async (finalLead) => {
    setLead(finalLead);
    setPhase('result');
    setSaving(true);
    fireTracking(finalLead, report);
    await finishAttempt({ attemptId, lead: finalLead, report });
    setSaving(false);
  }, [attemptId, report]);

  /* ─── Render ──────────────────────────────────────────────────────────── */

  const prompt = useMemo(
    () => writingPrompt(estimateTheta(responsesRef.current).theta),
    [phase] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <div className="lt-scope">
      <Seo path="/level-test" />

      <div className="lt-bg" aria-hidden="true" />
      <div className="lt-orb lt-orb-a" aria-hidden="true" />
      <div className="lt-orb lt-orb-b" aria-hidden="true" />

      <main className="lt-shell">
        <header className="lt-topbar">
          <a className="lt-brand" href="/">
            <BrandMark size={30} />
            <span>طلاقة</span>
          </a>
          <span className="lt-topmeta">
            {phase === 'result' ? 'النتيجة' : 'اختبار تحديد المستوى'}
          </span>
        </header>

        {phase === 'intro' && <Intro onStart={() => setPhase('gate1')} />}

        {phase === 'gate1' && (
          <GateOne
            onDone={(data) => {
              const merged = { ...lead, ...data };
              setLead(merged);
              beginExam(merged);
            }}
          />
        )}

        {phase === 'exam' && queue[idx] && stage !== 4 && (
          <QuestionScreen
            item={queue[idx]}
            onAnswer={onAnswer}
            answered={answered}
            total={TOTAL_ITEMS}
            stageLabel={stageLabel}
          />
        )}

        {phase === 'exam' && queue[idx] && stage === 4 && (
          <ListeningScreen
            item={queue[idx]}
            voice={voice}
            onAnswer={onAnswer}
            answered={answered}
            total={TOTAL_ITEMS}
            stageLabel={stageLabel}
          />
        )}

        {phase === 'listenIntro' && (
          <ListeningIntro
            voice={voice}
            onStart={() => setPhase('exam')}
            onSkip={() => { setListeningDone(false); setPhase('writing'); }}
          />
        )}

        {phase === 'writing' && (
          <WritingScreen
            prompt={prompt}
            answered={answered}
            total={TOTAL_ITEMS}
            onSubmit={(t) => finish(t)}
            onSkip={() => finish('')}
          />
        )}

        {phase === 'gate2' && report && (
          <GateTwo lead={lead} onDone={submitFinal} />
        )}

        {phase === 'result' && report && (
          <ResultScreen lead={lead} report={report} saving={saving} />
        )}
      </main>
    </div>
  );
}

/* ─── Intro ─────────────────────────────────────────────────────────────── */
function Intro({ onStart }) {
  return (
    <div className="lt-in">
      <span className="lt-eyebrow">مجاني · بدون تسجيل</span>
      <h1 className="lt-h1">وين مستواك بالضبط في الإنجليزي؟</h1>
      <p className="lt-lead">
        أغلب الناس يقولون «متوسط». وهذي أكثر إجابة تضيّع الوقت والفلوس: تدخل مستوى أسهل من قدرتك فتملّ،
        أو أصعب فتنسحب. عشر دقائق هنا تعطيك جواباً محدداً — مستوى واحد بالاسم والرقم.
      </p>

      <div className="lt-facts">
        <div className="lt-fact"><b>26</b><span>سؤالاً تكيّفياً</span></div>
        <div className="lt-fact"><b>10</b><span>دقائق تقريباً</span></div>
        <div className="lt-fact"><b>6</b><span>مستويات CEFR</span></div>
      </div>

      <div className="lt-card">
        <h2 className="lt-h2">كيف يشتغل؟</h2>
        <div className="lt-steps" style={{ marginTop: 18 }}>
          <div className="lt-step">
            <i>1</i>
            <p><b>الاختبار يتكيّف معك.</b> كل إجابة تغيّر السؤال اللي بعدها — إذا أجبت صح يصعّب، وإذا أخطأت يخفّف. يعني ما تضيع وقتك في أسئلة أسهل أو أصعب من مستواك.</p>
          </div>
          <div className="lt-step">
            <i>2</i>
            <p><b>خمس مهارات، مو سؤال واحد.</b> قواعد، مفردات، استيعاب نص، تواصل في مواقف حقيقية، واستماع — وفي الآخر فقرة كتابة قصيرة.</p>
          </div>
          <div className="lt-step">
            <i>3</i>
            <p><b>نتيجة فورية وصريحة.</b> مستواك على مقياس CEFR، وتفصيل وين أنت قوي ووين تحتاج شغل — تقدر ترسلها لنا في واتساب وتاخذ خطتك.</p>
          </div>
        </div>
      </div>

      <div className="lt-card">
        <p className="lt-hint" style={{ margin: 0 }}>
          نصيحة قبل ما تبدأ: لا تستخدم مترجم ولا تسأل أحد. نتيجة مضخّمة تحطك في مستوى أصعب من قدرتك،
          وهذا بالضبط السبب اللي يخلي أغلب الناس يتركون الدورات.
        </p>
      </div>

      <div className="lt-cta-block">
        <button type="button" className="lt-btn" onClick={onStart}>نبدأ الاختبار ←</button>
      </div>
    </div>
  );
}

/* ─── Gate 1 — name + age + gender ─────────────────────────────────────── */
function GateOne({ onDone }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [err, setErr] = useState({});

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (name.trim().length < 2) next.name = 'اكتب اسمك من فضلك';
    const n = Number(age);
    if (!age || Number.isNaN(n) || n < 8 || n > 80) next.age = 'اكتب عمراً بين 8 و 80';
    if (!gender) next.gender = 'اختر واحداً';
    setErr(next);
    if (Object.keys(next).length) return;
    onDone({ name: name.trim(), age: String(n), gender });
  };

  return (
    <div className="lt-in">
      <span className="lt-eyebrow">خطوة واحدة قبل البداية</span>
      <h1 className="lt-h1">قبل ما نبدأ</h1>
      <p className="lt-lead">
        معلومتان فقط — عشان نرسل لك النتيجة ونخاطبك باسمك. ما نحتاج إيميل ولا كلمة مرور.
      </p>

      <form className="lt-card" style={{ marginTop: 24 }} onSubmit={submit} noValidate>
        <div className="lt-field">
          <label className="lt-label" htmlFor="lt-name">الاسم</label>
          <input
            id="lt-name" className="lt-input" value={name} autoComplete="name"
            onChange={(e) => setName(e.target.value)} placeholder="اسمك الأول يكفي"
          />
          {err.name && <p className="lt-err">{err.name}</p>}
        </div>

        <div className="lt-field">
          <label className="lt-label" htmlFor="lt-age">العمر</label>
          <input
            id="lt-age" className="lt-input lt-input-num" value={age} inputMode="numeric"
            onChange={(e) => setAge(e.target.value.replace(/[^\d]/g, '').slice(0, 2))} placeholder="مثال: 24"
          />
          {err.age && <p className="lt-err">{err.age}</p>}
          <p className="lt-hint">العمر يغيّر طريقة الشرح ونوع المجموعة المناسبة لك.</p>
        </div>

        <div className="lt-field">
          <span className="lt-label">الجنس</span>
          <div className="lt-chips">
            {[{ id: 'male', ar: 'ذكر' }, { id: 'female', ar: 'أنثى' }].map((o) => (
              <button
                key={o.id} type="button" className="lt-chip"
                aria-pressed={gender === o.id} onClick={() => setGender(o.id)}
              >
                {o.ar}
              </button>
            ))}
          </div>
          {err.gender && <p className="lt-err">{err.gender}</p>}
          <p className="lt-hint">مجموعاتنا مفصولة — ولهذا نحتاجها لنحجز لك المكان الصحيح.</p>
        </div>

        <button type="submit" className="lt-btn lt-btn-wide" style={{ marginTop: 8 }}>
          ابدأ الاختبار ←
        </button>
      </form>
    </div>
  );
}

/* ─── Gate 2 — phone + goal, right before the result ───────────────────── */
function GateTwo({ lead, onDone }) {
  const [phone, setPhone] = useState('');
  const [goal, setGoal] = useState('');
  const [err, setErr] = useState({});

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    const p = normalizePhone(phone);
    if (!p) next.phone = 'اكتب رقم جوال سعودي صحيح — مثال: 0551234567';
    if (!goal) next.goal = 'اختر هدفك';
    setErr(next);
    if (Object.keys(next).length) return;
    onDone({ ...lead, phone: p, goal });
  };

  return (
    <div className="lt-in">
      <span className="lt-eyebrow">خلصت ✓</span>
      <h1 className="lt-h1">نتيجتك جاهزة يا {lead.name}</h1>
      <p className="lt-lead">
        باقي شيء واحد: رقمك، عشان نرسل لك النتيجة وخطتك ولا تضيع منك. ما نتصل عليك إلا إذا طلبت.
      </p>

      <form className="lt-card" style={{ marginTop: 24 }} onSubmit={submit} noValidate>
        <div className="lt-field">
          <label className="lt-label" htmlFor="lt-phone">رقم الجوال</label>
          <input
            id="lt-phone" className="lt-input lt-input-num" value={phone}
            inputMode="tel" autoComplete="tel" placeholder="05XXXXXXXX"
            onChange={(e) => setPhone(e.target.value.replace(/[^\d+ ]/g, '').slice(0, 16))}
          />
          {err.phone && <p className="lt-err">{err.phone}</p>}
        </div>

        <div className="lt-field">
          <span className="lt-label">وش أهم سبب تبي الإنجليزي عشانه؟</span>
          <div className="lt-chips">
            {GOALS.map((o) => (
              <button
                key={o.id} type="button" className="lt-chip"
                aria-pressed={goal === o.id} onClick={() => setGoal(o.id)}
              >
                {o.ar}
              </button>
            ))}
          </div>
          {err.goal && <p className="lt-err">{err.goal}</p>}
        </div>

        <button type="submit" className="lt-btn lt-btn-wide" style={{ marginTop: 8 }}>
          اعرض نتيجتي ←
        </button>
        <p className="lt-hint" style={{ textAlign: 'center', marginTop: 14 }}>
          بياناتك تبقى عندنا فقط. ما نبيعها ولا نشاركها مع أحد.
        </p>
      </form>
    </div>
  );
}
