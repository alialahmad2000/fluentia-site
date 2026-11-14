/* ============================================================================
 * Level test v2 — the test itself (lazy chunk).
 *   stage 1 (6 routing) → name + gender → stage 2 (11 at the estimate) →
 *   stage 3 (5 on the border) → listening (4 clips, 2 plays, skippable) →
 *   writing (saved, not scored) → voice note (optional) → teaser → phone →
 *   result.
 * One question per screen, no right/wrong feedback, every step saved on the
 * device (resume on refresh) and on the server (partial attempts count).
 * ========================================================================== */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  bOf, buildListening, buildResult, buildStage1, buildStage2, buildStage3, indexBank, newState,
  posterior, rng, serve, writingPromptFor, writingSignals,
} from './engine';
import { GOALS, g } from './content';
import { resultFields, saveProgress, startAttempt, submitContact, uploadVoice } from './api';
import { ltEvent, trackContact } from './events';
import { addSeen, clearRun, hashStr, readRun, readSeen, writeRun } from './run';
import SunMeter from './SunMeter';
import ResultView from './ResultView';

const STAGE_SIZE = { 1: 6, 2: 11, 3: 5, 4: 8 };
const AUDIO = (id) => `/audio/level-test-v2/${id}.mp3`;

function freshRun() {
  return {
    v: 1, seed: (Math.random() * 2 ** 31) >>> 0, att: null, phase: 'q', stage: 1,
    queue: [], idx: 0, responses: [], trail: [],
    name: '', gender: '', age: '', goal: '', phone: '',
    listen: null, listeningSkipped: false, writing: '', writingPasted: false, voice: 'none',
    tabSwitches: 0, startedAt: Date.now(), result: null, contacted: false, contactPending: false, done: false, booked: null,
  };
}

/** Engine state rebuilt from the saved run (so a resumed attempt never repeats an item). */
function stateFor(run) {
  const st = newState(readSeen());
  run.responses.forEach((r) => st.used.add(r.id));
  run.queue.forEach((id) => st.used.add(id));
  (run.listen?.blocks || []).forEach((b) => { st.used.add(b.clip); b.items.forEach((i) => st.used.add(i)); });
  return st;
}

const wordsIn = (t) => (t || '').trim().split(/\s+/).filter(Boolean).length;

export default function TestApp({ fresh, onExit }) {
  const [bank, setBank] = useState(null);
  const [run, setRun] = useState(() => {
    const saved = !fresh && readRun();
    if (saved && !saved.done) return saved;
    clearRun();
    return freshRun();
  });
  const [toast, setToast] = useState('');
  const runRef = useRef(run);
  runRef.current = run;
  const ix = useMemo(() => (bank ? indexBank(bank) : null), [bank]);

  /* ─── Load the bank, start the server attempt, build stage 1 ─────────── */
  useEffect(() => {
    let live = true;
    import('./bank.v2.json').then((m) => { if (live) setBank(m.default || m); });
    return () => { live = false; };
  }, []);

  const ensureAtt = useCallback(async () => {
    if (runRef.current.att) return runRef.current.att;
    const r = await startAttempt(bank?.version || 'v2');
    if (r?.id && r?.token) {
      const att = { id: r.id, token: r.token };
      setRun((s) => ({ ...s, att }));
      runRef.current = { ...runRef.current, att };
      return att;
    }
    return null;
  }, [bank]);

  useEffect(() => {
    if (!ix) return;
    if (run.queue.length === 0 && run.stage === 1 && run.phase === 'q') {
      const items = buildStage1(ix, stateFor(run), rng(run.seed + 1));
      setRun((s) => ({ ...s, queue: items.map((i) => i.id), idx: 0 }));
    }
    ensureAtt().then((att) => {
      if (att && !runRef.current.responses.length) ltEvent('level_test_start', { attempt: att.id });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ix]);

  /* ─── Persist every change; never lose a step ──────────────────────────── */
  useEffect(() => { writeRun(run); }, [run]);

  const progress = useCallback(async (step, patch = {}, opts) => {
    const att = await ensureAtt();
    if (!att) return null;
    const s = runRef.current;
    return saveProgress(att, step, {
      answers: s.trail,
      minutes: Math.max(1, Math.round((Date.now() - s.startedAt) / 60000)),
      left_page: s.tabSwitches,
      ...patch,
    }, opts);
  }, [ensureAtt]);

  /* ─── Integrity: leaving the tab mid-test (counted, never punished loudly) */
  const hiddenAt = useRef(0);
  const hiddenMs = useRef(0);
  useEffect(() => {
    const onVis = () => {
      const testing = ['q', 'listen'].includes(runRef.current.phase);
      if (document.visibilityState === 'hidden') {
        hiddenAt.current = Date.now();
        if (testing) setRun((s) => ({ ...s, tabSwitches: s.tabSwitches + 1 }));
      } else if (hiddenAt.current) {
        hiddenMs.current += Date.now() - hiddenAt.current;
        hiddenAt.current = 0;
      }
    };
    const onHide = () => {
      const s = runRef.current;
      if (s.att && !s.done && s.trail.length) saveProgress(s.att, stepOf(s), { answers: s.trail, left_page: s.tabSwitches }, { keepalive: true });
    };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pagehide', onHide);
    return () => { document.removeEventListener('visibilitychange', onVis); window.removeEventListener('pagehide', onHide); };
  }, []);

  /* ─── Back button: stays on the current question ───────────────────────── */
  useEffect(() => {
    window.history.pushState({ lt2: 1 }, '');
    const onPop = () => {
      if (runRef.current.phase === 'result') { onExit?.(); return; }
      window.history.pushState({ lt2: 1 }, '');
      setToast('إجاباتك محفوظة. الاختبار يمشي للأمام فقط حتى تبقى النتيجة دقيقة.');
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [onExit]);
  useEffect(() => { if (!toast) return undefined; const t = setTimeout(() => setToast(''), 4200); return () => clearTimeout(t); }, [toast]);

  useEffect(() => { window.scrollTo(0, 0); }, [run.phase, run.stage]);

  /* ─── Answering ────────────────────────────────────────────────────────── */
  const answer = useCallback((item, served, choice, ms) => {
    const correct = choice === served.correctIndex;
    setRun((s) => {
      const responses = [...s.responses, { id: item.id, lvl: item.lvl, skill: item.skill, b: bOf(item), correct, ms, stage: s.stage }];
      const trail = [...s.trail, {
        id: item.id, lvl: item.lvl, skill: item.skill, stage: s.stage, stem: item.stem.slice(0, 380),
        chosen: served.options[choice], correct_text: served.options[served.correctIndex], correct, ms,
      }];
      return { ...s, responses, trail, idx: s.idx + 1 };
    });
  }, []);

  // Stage boundaries (run after the answer lands in state)
  useEffect(() => {
    if (!ix || run.phase !== 'q' || !run.queue.length || run.idx < run.queue.length) return;
    const s = run;
    ltEvent('level_test_stage_complete', { attempt: s.att?.id || 'local', key: `s${s.stage}`, stage: s.stage });
    if (s.stage === 1) {
      progress('stage1');
      setRun((x) => ({ ...x, phase: 'details' }));
    } else if (s.stage === 2) {
      progress('stage2');
      setRun((x) => ({ ...x, phase: 'between' }));
    } else if (s.stage === 3) {
      progress('stage3');
      setRun((x) => ({ ...x, phase: 'listenIntro' }));
    }
  }, [ix, run, progress]);

  // A partial attempt is worth keeping: push the answer trail every 5 answers.
  useEffect(() => {
    if (run.trail.length && run.trail.length % 5 === 0) progress(stepOf(runRef.current));
  }, [run.trail.length, progress]);

  const startStage = (stage) => {
    setRun((s) => {
      const st = stateFor(s);
      const post = posterior(s.responses);
      const rand = rng(s.seed + stage * 7919);
      const items = stage === 2 ? buildStage2(ix, st, post.theta, rand) : buildStage3(ix, st, post.probs, rand);
      return { ...s, phase: 'q', stage, queue: items.map((i) => i.id), idx: 0 };
    });
  };

  const startListening = () => {
    setRun((s) => {
      const st = stateFor(s);
      const post = posterior(s.responses);
      const blocks = buildListening(ix, st, post.theta, rng(s.seed + 4 * 7919))
        .map((b) => ({ clip: b.clip.id, items: b.items.map((i) => i.id) }));
      return { ...s, phase: 'listen', stage: 4, listen: { blocks, bi: 0, ii: 0, plays: {} } };
    });
  };

  const finishListening = (skipped) => {
    ltEvent('level_test_stage_complete', { attempt: run.att?.id || 'local', key: 's4', stage: 4, skipped: !!skipped });
    setRun((s) => ({ ...s, phase: 'writing', listeningSkipped: skipped ? true : s.listeningSkipped }));
    progress('listening');
  };

  const computeResult = (s) => buildResult({ responses: s.responses, listeningSkipped: s.listeningSkipped, tabSwitches: s.tabSwitches });

  const toTeaser = () => {
    const result = computeResult(runRef.current);
    setRun((s) => ({ ...s, phase: 'teaser', result }));
    progress('teaser', resultFields(result));
  };

  /* ─── Render ───────────────────────────────────────────────────────────── */
  if (!ix) {
    return <div className="lt2-test"><main className="lt2-wrap lt2-step" aria-busy="true"><p>نجهّز الأسئلة…</p></main></div>;
  }

  let body = null;
  if (run.phase === 'q') {
    const id = run.queue[run.idx];
    const item = id && ix.items.get(id);
    body = item ? (
      <Question key={id} item={item} passage={item.passage_id ? ix.passages.get(item.passage_id) : null}
        seed={run.seed} onAnswer={(served, choice, ms) => answer(item, served, choice, ms)} hiddenMs={hiddenMs}
        kicker={item.passage_id ? 'اقرأ النص ثم أجب' : item.skill === 'use' ? 'اختر الرد المناسب' : 'اختر الإجابة الصحيحة'} gender={run.gender} />
    ) : <main className="lt2-wrap lt2-step" aria-busy="true" />;
  } else if (run.phase === 'details') {
    body = <Details run={run} onDone={(name, gender) => {
      setRun((s) => ({ ...s, name, gender }));
      progress('details', { name, gender });
      startStage(2);
    }} />;
  } else if (run.phase === 'between') {
    body = (
      <Between
        title="خلّصنا مرحلتين، وباقي مرحلة قصيرة."
        text="الأسئلة الخمسة الجاية تفصل بين أقرب مستويين لك، عشان تطلع النتيجة دقيقة."
        onNext={() => startStage(3)} />
    );
  } else if (run.phase === 'listenIntro') {
    body = <ListenIntro gender={run.gender} onStart={startListening} onSkip={() => finishListening(true)} />;
  } else if (run.phase === 'listen') {
    body = <Listening run={run} ix={ix} setRun={setRun} hiddenMs={hiddenMs}
      onAnswer={(item, served, choice, ms) => {
        const correct = choice === served.correctIndex;
        setRun((s) => {
          const L = s.listen;
          const blk = L.blocks[L.bi];
          const lastInBlock = L.ii + 1 >= blk.items.length;
          const nextBi = lastInBlock ? L.bi + 1 : L.bi;
          return {
            ...s,
            responses: [...s.responses, { id: item.id, lvl: item.lvl, skill: item.skill, b: bOf(item), correct, ms, stage: 4 }],
            trail: [...s.trail, { id: item.id, lvl: item.lvl, skill: item.skill, stage: 4, stem: item.stem.slice(0, 380), chosen: served.options[choice], correct_text: served.options[served.correctIndex], correct, ms }],
            listen: { ...L, bi: nextBi, ii: lastInBlock ? 0 : L.ii + 1 },
          };
        });
      }}
      onSkip={() => finishListening(true)} onDone={() => finishListening(false)} />;
  } else if (run.phase === 'writing') {
    body = <Writing run={run} onDone={(text, pasted) => {
      setRun((s) => ({ ...s, writing: text, writingPasted: pasted, phase: canRecord() ? 'voice' : s.phase }));
      const sig = text ? { ...writingSignals(text), pasted } : null;
      progress('writing', { writing: text || null, writing_signals: sig });
      if (!canRecord()) toTeaser();
    }} />;
  } else if (run.phase === 'voice') {
    body = <Voice gender={run.gender} ensureAtt={ensureAtt}
      onDone={(status) => { setRun((s) => ({ ...s, voice: status })); toTeaser(); }} />;
  } else if (run.phase === 'teaser') {
    body = <Teaser run={run} onSubmit={async ({ phone, goal, age }) => {
      const s = runRef.current;
      const att = await ensureAtt();
      const payload = { phone, goal: goal || null, age: age || null, name: s.name, ...resultFields(s.result), answers: s.trail };
      const res = att ? await submitContact(att, payload) : { error: 'network' };
      if (res?.status === 429) return { error: 'too_many' };
      if (res?.status === 400) return { error: 'phone' };
      trackContact({ attempt: att?.id || 'local', phone, result: s.result });
      addSeen(s.responses.map((r) => r.id).concat((s.listen?.blocks || []).map((b) => b.clip)));
      setRun((x) => ({ ...x, phone, goal, age, phase: 'result', contacted: !!res?.ok, contactPending: !res?.ok, done: true }));
      return { ok: true };
    }} />;
  } else if (run.phase === 'result') {
    body = <ResultView run={run} setRun={setRun} ensureAtt={ensureAtt}
      onRetake={() => { clearRun(); setRun(freshRun()); }} />;
  }

  return (
    <div className="lt2-test">
      {run.phase !== 'result' && <Horizon run={run} />}
      {body}
      <div aria-live="polite" className="lt2-sr">{toast}</div>
      {toast && <div className="lt2-toast" role="status">{toast}</div>}
    </div>
  );
}

function stepOf(s) {
  if (s.phase === 'q') return `stage${s.stage}`;
  return { details: 'details', between: 'stage2', listenIntro: 'stage3', listen: 'listening', writing: 'writing', voice: 'voice', teaser: 'teaser', result: 'result' }[s.phase] || 'stage1';
}

function canRecord() {
  return typeof window !== 'undefined' && !!window.MediaRecorder && !!navigator.mediaDevices?.getUserMedia;
}

/* ─── The horizon progress line ──────────────────────────────────────────── */
function Horizon({ run }) {
  const ph = run.phase;
  const doneIn = (stage) => {
    if (run.stage > stage || ['details', 'between', 'listenIntro', 'writing', 'voice', 'teaser'].includes(ph) && stageDone(run, stage)) return 1;
    if (run.stage === stage && ph === 'q') return run.queue.length ? run.idx / run.queue.length : 0;
    if (stage === 4 && ph === 'listen') {
      const L = run.listen; return L ? L.bi / Math.max(1, L.blocks.length) : 0;
    }
    return 0;
  };
  const label = ph === 'q' ? `المرحلة ${run.stage} من 3` : ph === 'listen' || ph === 'listenIntro' ? 'الاستماع' : ph === 'writing' ? 'الكتابة' : ph === 'voice' ? 'رسالة صوتية' : ph === 'teaser' ? 'النتيجة' : 'استراحة قصيرة';
  const count = ph === 'q' && run.queue.length ? `${Math.min(run.idx + 1, run.queue.length)} / ${run.queue.length}` : '';
  return (
    <div className="lt2-horizon">
      <div className="lt2-wrap">
        <div className="lt2-horizon-row">
          <strong>{label}</strong>
          <span dir="ltr">{count}</span>
        </div>
        <div className="lt2-segs" aria-hidden="true">
          {[1, 2, 3, 4].map((st) => <div className="lt2-seg" key={st}><span style={{ width: `${Math.round(doneIn(st) * 100)}%` }} /></div>)}
        </div>
      </div>
    </div>
  );
}
function stageDone(run, stage) {
  const order = { details: 1, between: 2, listenIntro: 3, writing: 4, voice: 4, teaser: 4 };
  return (order[run.phase] || 0) >= stage;
}

/* ─── One question ──────────────────────────────────────────────────────── */
function Question({ item, passage, seed, onAnswer, kicker, hiddenMs, disabled = false, children }) {
  const served = useMemo(() => serve(item, rng(hashStr(`${seed}:${item.id}`))), [item, seed]);
  const [sel, setSel] = useState(null);
  const shown = useRef(Date.now());
  const hidden0 = useRef(hiddenMs.current);
  const heading = useRef(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);
  const submit = () => {
    if (sel === null || disabled) return;
    const ms = Math.max(0, Date.now() - shown.current - (hiddenMs.current - hidden0.current));
    onAnswer(served, sel, ms);
  };
  const onKey = (e) => {
    const n = Number(e.key);
    if (n >= 1 && n <= served.options.length && !disabled) { setSel(n - 1); e.preventDefault(); }
    if (e.key === 'Enter' && sel !== null) { submit(); e.preventDefault(); }
  };
  return (
    <main className="lt2-wrap lt2-q lt2-enter" onKeyDown={onKey}>
      {children}
      <p className="lt2-q-kicker">{kicker}</p>
      {passage && (
        <section className="lt2-passage" lang="en" aria-label="Reading text">
          {passage.title && <h3>{passage.title}</h3>}
          <p>{passage.text}</p>
        </section>
      )}
      <h2 className="lt2-stem" lang="en" tabIndex={-1} ref={heading} id={`stem-${item.id}`}>{served.stem}</h2>
      <div className="lt2-opts" role="radiogroup" aria-labelledby={`stem-${item.id}`}>
        {served.options.map((o, i) => (
          <button key={o} type="button" role="radio" aria-checked={sel === i} className="lt2-opt" lang="en"
            disabled={disabled} onClick={() => setSel(i)}>
            <span className="dot" aria-hidden="true" />
            <span>{o}</span>
          </button>
        ))}
      </div>
      <div className="lt2-actions">
        <button type="button" className="lt2-cta is-block" disabled={sel === null || disabled} onClick={submit}>التالي</button>
        <p className="lt2-hint">ما في رجوع للسؤال السابق، وما تظهر الإجابة الصحيحة أثناء الاختبار.</p>
      </div>
    </main>
  );
}

/* ─── Name + gender (after stage 1) ──────────────────────────────────────── */
function Details({ run, onDone }) {
  const [name, setName] = useState(run.name || '');
  const [gender, setGender] = useState(run.gender || '');
  const [err, setErr] = useState('');
  const ok = name.trim().length >= 2 && gender;
  const go = (e) => {
    e.preventDefault();
    if (!ok) { setErr(!gender ? 'اختيار صيغة المخاطبة مطلوب.' : 'الاسم الأول مطلوب (حرفين على الأقل).'); return; }
    onDone(name.trim().slice(0, 60), gender);
  };
  return (
    <main className="lt2-wrap lt2-step lt2-enter">
      <SunMeter lvl={null} compact title="المرحلة الأولى انتهت" />
      <h2>المرحلة الأولى انتهت.</h2>
      <p>قبل المرحلة الثانية، نبي نعرف كيف نخاطبك. الأسئلة الجاية تقترب أكثر من مستواك.</p>
      <form onSubmit={go} className="lt2-step" style={{ padding: 0 }} noValidate>
        <div className="lt2-field">
          <label htmlFor="lt2-name">الاسم الأول</label>
          <input id="lt2-name" className="lt2-input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" maxLength={60} enterKeyHint="next" />
        </div>
        <div className="lt2-field">
          <span className="lbl" id="lt2-g">نخاطبك بصيغة</span>
          <div className="lt2-seg2" role="radiogroup" aria-labelledby="lt2-g">
            <button type="button" role="radio" aria-checked={gender === 'male'} className="lt2-chip" onClick={() => setGender('male')}>المذكر</button>
            <button type="button" role="radio" aria-checked={gender === 'female'} className="lt2-chip" onClick={() => setGender('female')}>المؤنث</button>
          </div>
        </div>
        {err && <p className="lt2-err" role="alert">{err}</p>}
        <div className="lt2-actions">
          <button type="submit" className="lt2-cta is-block" disabled={!ok}>نكمل للمرحلة الثانية</button>
        </div>
      </form>
    </main>
  );
}

function Between({ title, text, onNext }) {
  return (
    <main className="lt2-wrap lt2-step lt2-enter">
      <SunMeter lvl={null} compact title="المرحلة الثانية انتهت" />
      <h2>{title}</h2>
      <p>{text}</p>
      <div className="lt2-actions"><button type="button" className="lt2-cta is-block" onClick={onNext}>نكمل</button></div>
    </main>
  );
}

function ListenIntro({ gender, onStart, onSkip }) {
  return (
    <main className="lt2-wrap lt2-step lt2-enter">
      <h2>آخر جزء في الأسئلة: الاستماع</h2>
      <p>{g(gender, '4 مقاطع قصيرة بأصوات أمريكية وبريطانية وأسترالية. كل مقطع تسمعه مرتين كحد أقصى، وبعده سؤال أو سؤالين.', '4 مقاطع قصيرة بأصوات أمريكية وبريطانية وأسترالية. كل مقطع تسمعينه مرتين كحد أقصى، وبعده سؤال أو سؤالين.')}</p>
      <p>{g(gender, 'شغّل الصوت أو البس السماعة.', 'شغّلي الصوت أو البسي السماعة.')}</p>
      <div className="lt2-actions">
        <button type="button" className="lt2-cta is-block" onClick={onStart}>{g(gender, 'ابدأ الاستماع', 'ابدئي الاستماع')}</button>
        <button type="button" className="lt2-link" onClick={onSkip}>ما أقدر أسمع الحين، أتخطى الاستماع</button>
        <p className="lt2-hint">{g(gender, 'لو تخطيت، تنحسب النتيجة من باقي الأقسام.', 'لو تخطيتي، تنحسب النتيجة من باقي الأقسام.')}</p>
      </div>
    </main>
  );
}

/* ─── Listening: one clip, two plays, its questions one at a time ─────────── */
function Listening({ run, ix, setRun, onAnswer, onSkip, onDone, hiddenMs }) {
  const L = run.listen;
  const blk = L?.blocks[L.bi];
  const finished = useRef(false);
  useEffect(() => {
    if (L && !blk && !finished.current) { finished.current = true; onDone(); }
  }, [L, blk, onDone]);
  if (!blk) return <main className="lt2-wrap lt2-step" aria-busy="true" />;
  const clip = ix.clips.get(blk.clip);
  const item = ix.items.get(blk.items[L.ii]);
  const plays = L.plays[blk.clip] || 0;
  return (
    <Question key={item.id} item={item} seed={run.seed} hiddenMs={hiddenMs} disabled={plays === 0}
      kicker={`المقطع ${L.bi + 1} من ${L.blocks.length}${blk.items.length > 1 ? ` · السؤال ${L.ii + 1} من ${blk.items.length}` : ''}`}
      onAnswer={(served, choice, ms) => onAnswer(item, served, choice, ms)}>
      <Player key={clip.id} clip={clip} plays={plays} gender={run.gender}
        onPlayed={() => setRun((s) => ({ ...s, listen: { ...s.listen, plays: { ...s.listen.plays, [clip.id]: (s.listen.plays[clip.id] || 0) + 1 } } }))}
        onSkip={onSkip} />
    </Question>
  );
}

function Player({ clip, plays, onPlayed, onSkip, gender }) {
  const audio = useRef(null);
  const [on, setOn] = useState(false);
  const [err, setErr] = useState(false);
  const left = Math.max(0, 2 - plays);
  const play = async () => {
    const a = audio.current;
    if (!a || on || left === 0) return;
    try {
      a.currentTime = 0;
      await a.play();
      setOn(true);
      onPlayed();
    } catch {
      setErr(true);
    }
  };
  return (
    <div className="lt2-field">
      <div className="lt2-player">
        <button type="button" className="lt2-play" onClick={play} disabled={on || left === 0}
          aria-label={on ? 'يشتغل الآن' : left === 0 ? 'انتهت مرات الاستماع' : plays ? 'استمع مرة ثانية' : 'شغّل المقطع'}>
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
        </button>
        <div className="lt2-player-meta">
          <b>{clip.situation_ar}</b>
          <span>{left === 2 ? 'تقدر تسمعه مرتين' : left === 1 ? (on ? 'يشتغل…' : 'باقي مرة وحدة') : (on ? 'يشتغل…' : 'انتهت مرات الاستماع')}</span>
        </div>
        <span className={`lt2-wave ${on ? 'is-on' : ''}`} aria-hidden="true"><i /><i /><i /><i /><i /></span>
        <audio ref={audio} src={AUDIO(clip.id)} preload="auto" playsInline
          onEnded={() => setOn(false)} onPause={() => setOn(false)} onError={() => setErr(true)} />
      </div>
      {plays === 0 && !err && <small>{g(gender, 'شغّل المقطع أول، بعدها تقدر تختار.', 'شغّلي المقطع أول، بعدها تقدرين تختارين.')}</small>}
      {err && (
        <p className="lt2-err" role="alert">
          تعذّر تشغيل الصوت على هذا الجهاز. 
          <button type="button" className="lt2-link" onClick={onSkip}>أتخطى الاستماع</button>
        </p>
      )}
    </div>
  );
}

/* ─── Writing (saved for the trainer, not scored) ────────────────────────── */
function Writing({ run, onDone }) {
  const est = posterior(run.responses);
  const lvl = Math.max(0, Math.min(5, [-1.6, -0.8, 0, 0.8, 1.6].filter((c) => est.theta >= c).length));
  const prompt = writingPromptFor(lvl);
  const [text, setText] = useState(run.writing || '');
  const pasted = useRef(run.writingPasted || false);
  const n = wordsIn(text);
  const female = run.gender === 'female';
  return (
    <main className="lt2-wrap lt2-step lt2-enter">
      <h2>{female ? 'اكتبي فقرة قصيرة بالإنجليزي' : 'اكتب فقرة قصيرة بالإنجليزي'}</h2>
      <p lang="en" dir="ltr" className="lt2-prompt-en">{prompt.en}</p>
      <p>{female ? prompt.arF : prompt.ar}</p>
      <div className="lt2-field">
        <label htmlFor="lt2-w" className="lt2-sr">Your answer</label>
        <textarea id="lt2-w" className="lt2-textarea" lang="en" dir="ltr" value={text} rows={7}
          autoCapitalize="sentences" autoCorrect="off" spellCheck={false}
          onPaste={() => { pasted.current = true; }} onChange={(e) => setText(e.target.value.slice(0, 1200))} />
        <span className={`lt2-count ${n >= 40 ? 'is-ok' : ''}`} aria-live="polite">{n} كلمة · المطلوب 40 إلى 80</span>
      </div>
      <p className="lt2-hint">الكتابة ما تدخل في الدرجة. المدرب يقرأها قبل اللقاء عشان يفهم أسلوبك.</p>
      <div className="lt2-actions">
        <button type="button" className="lt2-cta is-block" disabled={n < 40} onClick={() => onDone(text.trim(), pasted.current)}>نكمل</button>
        <button type="button" className="lt2-link" onClick={() => onDone(text.trim(), pasted.current)}>أتخطى الكتابة</button>
      </div>
    </main>
  );
}

/* ─── Voice note (optional, 30 s, not scored) ────────────────────────────── */
function pickMime() {
  const c = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];
  return c.find((m) => window.MediaRecorder?.isTypeSupported?.(m)) || '';
}
function Voice({ gender, ensureAtt, onDone }) {
  const [state, setState] = useState('idle'); // idle | rec | review | sending | error
  const [secs, setSecs] = useState(0);
  const [url, setUrl] = useState('');
  const rec = useRef(null);
  const chunks = useRef([]);
  const blob = useRef(null);
  const timer = useRef(null);
  const female = gender === 'female';

  useEffect(() => () => { clearInterval(timer.current); rec.current?.stream?.getTracks().forEach((t) => t.stop()); if (url) URL.revokeObjectURL(url); }, [url]);

  const stop = () => { clearInterval(timer.current); if (rec.current?.state === 'recording') rec.current.stop(); };
  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = pickMime();
      const r = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunks.current = [];
      r.ondataavailable = (e) => { if (e.data?.size) chunks.current.push(e.data); };
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        blob.current = new Blob(chunks.current, { type: (r.mimeType || mime || 'audio/webm').split(';')[0] });
        setUrl(URL.createObjectURL(blob.current));
        setState('review');
      };
      rec.current = r;
      r.start(250);
      setSecs(0);
      setState('rec');
      const t0 = Date.now();
      timer.current = setInterval(() => {
        const s = Math.floor((Date.now() - t0) / 1000);
        setSecs(s);
        if (s >= 30) stop();
      }, 250);
    } catch {
      setState('error');
    }
  };
  const send = async () => {
    setState('sending');
    const att = await ensureAtt();
    const res = att && blob.current ? await uploadVoice(att, blob.current, Math.max(1, secs)) : { ok: false };
    onDone(res.ok ? 'done' : 'failed');
  };
  return (
    <main className="lt2-wrap lt2-step lt2-enter">
      <h2>رسالة صوتية قصيرة (اختيارية)</h2>
      <p>{female ? 'عرّفي عن نفسك بالإنجليزي في 30 ثانية: مين أنتِ، ووش تبين من الإنجليزي. المدرب يسمعها قبل اللقاء، وما تدخل في الدرجة.' : 'عرّف عن نفسك بالإنجليزي في 30 ثانية: مين أنت، ووش تبي من الإنجليزي. المدرب يسمعها قبل اللقاء، وما تدخل في الدرجة.'}</p>
      <p lang="en" dir="ltr" className="lt2-prompt-en">Hi, my name is … I want to improve my English because …</p>
      {state !== 'review' && state !== 'sending' && (
        <>
          <button type="button" className={`lt2-rec ${state === 'rec' ? 'is-on' : ''}`} onClick={state === 'rec' ? stop : start}
            aria-label={state === 'rec' ? 'إيقاف التسجيل' : 'ابدأ التسجيل'}>
            {state === 'rec'
              ? <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" /></svg>
              : <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-2.08A7 7 0 0 0 19 12h-2Z" fill="currentColor" /></svg>}
          </button>
          <div className="lt2-timer" aria-live="off">{`0:${String(Math.min(secs, 30)).padStart(2, '0')}`} / 0:30</div>
        </>
      )}
      {state === 'error' && <p className="lt2-err" role="alert">{female ? 'ما قدرنا نوصل للمايك. تقدرين تتخطين هذي الخطوة.' : 'ما قدرنا نوصل للمايك. تقدر تتخطى هذي الخطوة.'}</p>}
      {(state === 'review' || state === 'sending') && (
        <>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls src={url} style={{ width: '100%' }} />
          <div className="lt2-actions">
            <button type="button" className="lt2-cta is-block" onClick={send} disabled={state === 'sending'}>{state === 'sending' ? 'نرسلها…' : female ? 'أرسليها وكمّلي' : 'أرسلها وكمّل'}</button>
            <button type="button" className="lt2-ghost" onClick={() => { setUrl(''); setState('idle'); }} disabled={state === 'sending'}>{female ? 'سجّلي من جديد' : 'سجّل من جديد'}</button>
          </div>
        </>
      )}
      <div className="lt2-actions">
        <button type="button" className="lt2-link" onClick={() => { stop(); onDone('skipped'); }} disabled={state === 'sending'}>أتخطى، وأشوف النتيجة</button>
      </div>
    </main>
  );
}

/* ─── Teaser + phone gate ────────────────────────────────────────────────── */
export function localPhone(raw) {
  let d = String(raw || '').replace(/[^\d]/g, '');
  if (d.startsWith('00966')) d = d.slice(5);
  else if (d.startsWith('966')) d = d.slice(3);
  if (d.startsWith('0')) d = d.slice(1);
  return /^5\d{8}$/.test(d) ? `0${d}` : null;
}
function Teaser({ run, onSubmit }) {
  const female = run.gender === 'female';
  const [phone, setPhone] = useState('');
  const [goal, setGoal] = useState(run.goal || '');
  const [age, setAge] = useState(run.age || '');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const go = async (e) => {
    e.preventDefault();
    const p = localPhone(phone);
    if (!p) { setErr(female ? 'اكتبي رقم جوال سعودي يبدأ بـ 5 (9 أرقام).' : 'اكتب رقم جوال سعودي يبدأ بـ 5 (9 أرقام).'); return; }
    setBusy(true); setErr('');
    const a = Number(age) >= 10 && Number(age) <= 99 ? Number(age) : '';
    const r = await onSubmit({ phone: p, goal, age: a });
    setBusy(false);
    if (r?.error === 'too_many') setErr(female ? 'هذا الرقم أكمل الاختبار 3 مرات اليوم. جرّبي بكرة.' : 'هذا الرقم أكمل الاختبار 3 مرات اليوم. جرّب بكرة.');
    else if (r?.error === 'phone') setErr(female ? 'تأكدي من الرقم وحاولي مرة ثانية.' : 'تأكد من الرقم وحاول مرة ثانية.');
  };
  return (
    <main className="lt2-wrap lt2-step lt2-enter">
      <div className="lt2-card lt2-teaser-card" aria-hidden="true">
        <div className="lt2-blur">
          <SunMeter lvl={null} compact />
          <div className="lt2-level"><span className="lt2-level-name">مستواك</span><span className="lt2-level-code">··</span></div>
          <ul className="lt2-bars">{[62, 48, 40].map((w) => <li key={w}><span>مهارة</span><span className="lt2-track"><span style={{ width: `${w}%` }} /></span><span /></li>)}</ul>
        </div>
        <div className="lt2-teaser-veil"><b>{run.name ? `${run.name}، نتيجتك جاهزة` : 'نتيجتك جاهزة'}</b></div>
      </div>
      <h2>وين نحفظ نتيجتك؟</h2>
      <form onSubmit={go} noValidate className="lt2-step" style={{ padding: 0 }}>
        <div className="lt2-field">
          <label htmlFor="lt2-phone">رقم الجوال</label>
          <div className="lt2-phone" data-invalid={err && !localPhone(phone) ? 'true' : 'false'}>
            <span aria-hidden="true">+966</span>
            <input id="lt2-phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="5X XXX XXXX"
              value={phone} onChange={(e) => setPhone(e.target.value.slice(0, 16))} aria-describedby="lt2-phone-note" aria-invalid={!!err && !localPhone(phone)} />
          </div>
          <small id="lt2-phone-note">الرقم عشان نحفظ نتيجتك ونتواصل معك بخصوصها. ما نشاركه مع أي جهة.</small>
        </div>
        <div className="lt2-field">
          <span className="lbl" id="lt2-goal">وش هدفك من الإنجليزي؟ (اختياري)</span>
          <div className="lt2-chips" role="radiogroup" aria-labelledby="lt2-goal">
            {GOALS.map((x) => (
              <button key={x.id} type="button" role="radio" aria-checked={goal === x.id} className="lt2-chip" onClick={() => setGoal(goal === x.id ? '' : x.id)}>{x.ar}</button>
            ))}
          </div>
        </div>
        <div className="lt2-field">
          <label htmlFor="lt2-age">العمر (اختياري)</label>
          <input id="lt2-age" className="lt2-input" type="number" inputMode="numeric" min={10} max={99} value={age} onChange={(e) => setAge(e.target.value.slice(0, 2))} style={{ maxWidth: 140 }} dir="ltr" />
        </div>
        {err && <p className="lt2-err" role="alert">{err}</p>}
        <div className="lt2-actions">
          <button type="submit" className="lt2-cta is-block" disabled={busy}>{busy ? 'نجهّز النتيجة…' : female ? 'اعرضي نتيجتي' : 'اعرض نتيجتي'}</button>
        </div>
      </form>
    </main>
  );
}
