import React, { useEffect, useMemo, useRef, useState } from 'react';

const AR = /[؀-ۿ]/;
const isAr = (s) => AR.test(s || '');

const SKILL_TAG = {
  grammar: 'قواعد',
  vocab: 'مفردات',
  reading: 'استيعاب',
  use: 'تواصل',
  listening: 'استماع',
};

/* ─── Progress ──────────────────────────────────────────────────────────── */
export function Progress({ answered, total, stageLabel }) {
  const pct = Math.min(100, Math.round((answered / total) * 100));
  return (
    <div className="lt-progress">
      <div className="lt-progress-head">
        <span className="lt-stage">{stageLabel}</span>
        {/* dir=ltr: in an RTL container "8 / 26" otherwise renders as "26 / 8" */}
        <span className="lt-count" dir="ltr">{answered} / {total}</span>
      </div>
      <div className="lt-bar"><i style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

/* ─── A single multiple-choice question ────────────────────────────────── */
export function QuestionScreen({ item, onAnswer, answered, total, stageLabel }) {
  const [picked, setPicked] = useState(null);

  // A fresh question must never inherit the previous selection.
  useEffect(() => { setPicked(null); }, [item.id]);

  // Desktop shortcuts: the letter shown on the badge (A–D) or its number,
  // whichever the hand reaches for. Enter confirms.
  useEffect(() => {
    const onKey = (e) => {
      const n = item.options.length;
      if (e.key >= '1' && e.key <= String(n)) setPicked(Number(e.key) - 1);
      const letter = (e.key || '').toUpperCase();
      if (letter.length === 1 && letter >= 'A' && letter < String.fromCharCode(65 + n)) {
        setPicked(letter.charCodeAt(0) - 65);
      }
      if (e.key === 'Enter' && picked !== null) onAnswer(picked);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [item, picked, onAnswer]);

  return (
    <div className="lt-in" key={item.id}>
      <Progress answered={answered} total={total} stageLabel={stageLabel} />
      <div className="lt-card">
        <div className="lt-qhead">
          <span className="lt-tag">{SKILL_TAG[item.skill] || item.skill}</span>
          {item.passageId && item.passageCount > 1 && (
            <span className="lt-tag">سؤال {item.passageIndex + 1} من {item.passageCount} عن النص</span>
          )}
        </div>

        {item.passage && <div className="lt-passage">{item.passage}</div>}

        <p className={`lt-q ${isAr(item.text) ? '' : 'ltr'}`}>{item.text}</p>

        <div className="lt-opts">
          {item.options.map((opt, i) => (
            <button
              key={i}
              type="button"
              className={`lt-opt ${isAr(opt) ? '' : 'lt-opt-ltr'}`}
              aria-pressed={picked === i}
              onClick={() => setPicked(i)}
            >
              {/* Badge by POSITION — never by the option's index in the bank. */}
              <i>{String.fromCharCode(65 + i)}</i>
              <span>{opt}</span>
            </button>
          ))}
        </div>

        <div className="lt-actions">
          {/* No numeral range in the copy: digits are bidi-weak and an RTL line
              renders "1–4" as "4–1". Latin letters are safe. */}
          <span className="lt-kbd">اضغط حرف الإجابة · Enter للتالي</span>
          <button
            type="button"
            className="lt-btn"
            disabled={picked === null}
            onClick={() => onAnswer(picked)}
          >
            التالي ←
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Listening ─────────────────────────────────────────────────────────── */

/** Pre-rendered clips (scripts/build-level-test-audio.mjs). Fixed recordings
 *  mean every student hears the same voice at the same speed — a device-supplied
 *  voice silently changes item difficulty, and therefore the score. */
export const clipUrl = (id) => `/audio/level-test/${id}.mp3`;

/** Resolve an English voice once. Only a FALLBACK now that clips are shipped. */
export function useEnglishVoice() {
  const [voice, setVoice] = useState(undefined); // undefined = still looking

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setVoice(null);
      return undefined;
    }
    let done = false;
    const resolve = () => {
      const voices = window.speechSynthesis.getVoices() || [];
      if (!voices.length) return;
      const en = voices.filter((v) => /^en(-|_|$)/i.test(v.lang || ''));
      if (!en.length) { done = true; setVoice(null); return; }
      const preferred =
        en.find((v) => /samantha|google us english|microsoft aria|daniel/i.test(v.name)) ||
        en.find((v) => /^en-US/i.test(v.lang)) ||
        en[0];
      done = true;
      setVoice(preferred);
    };
    resolve();
    window.speechSynthesis.addEventListener?.('voiceschanged', resolve);
    // Some browsers never fire voiceschanged; give up rather than hang the exam.
    const t = setTimeout(() => { if (!done) setVoice(null); }, 2500);
    return () => {
      clearTimeout(t);
      window.speechSynthesis.removeEventListener?.('voiceschanged', resolve);
    };
  }, []);

  return voice;
}

export function ListeningIntro({ voice, onStart, onSkip }) {
  const [tested, setTested] = useState(false);
  const audioRef = useRef(null);

  const speak = () => {
    setTested(true);
    const el = audioRef.current;
    if (el) {
      el.currentTime = 0;
      // A rejected play() means autoplay policy or a missing file — fall through
      // to the device voice rather than leaving the student with silence.
      el.play().catch(() => speakFallback(voice, 'Sound check. If you can hear this clearly, you are ready to begin.'));
      return;
    }
    speakFallback(voice, 'Sound check. If you can hear this clearly, you are ready to begin.');
  };

  return (
    <div className="lt-in">
      <div className="lt-card">
        <h2 className="lt-h2">قسم الاستماع</h2>
        <p className="lt-lead" style={{ marginTop: 12 }}>
          أربعة أسئلة قصيرة. تسمع التسجيل، وتختار الإجابة. تقدر تسمع كل تسجيل مرتين.
        </p>
        <div style={{ marginTop: 22 }}>
          {/* Attached to the DOM on purpose: a detached `new Audio()` is killed
              mid-playback on iPad. */}
          <audio ref={audioRef} src={clipUrl('check')} preload="auto" playsInline />
          <button type="button" className="lt-play" onClick={speak}>
            <div className={`lt-wave ${tested ? '' : 'idle'}`}><b /><b /><b /><b /><b /></div>
            جرّب الصوت أولاً
            <em>ارفع صوت الجهاز</em>
          </button>
        </div>
        <div className="lt-actions">
          <button type="button" className="lt-btn-ghost lt-chip" onClick={onSkip}>ما أقدر أسمع الآن — تخطّي</button>
          <button type="button" className="lt-btn" onClick={onStart} disabled={!tested}>
            سمعته — نبدأ ←
          </button>
        </div>
        {!tested && <p className="lt-hint">اضغط «جرّب الصوت» عشان نتأكد أن الصوت يشتغل عندك قبل ما نبدأ.</p>}
      </div>
    </div>
  );
}

/** Last resort when the clip can't play: the device voice, if it has one. */
function speakFallback(voice, text) {
  try {
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = voice?.lang || 'en-US';
    if (voice) u.voice = voice;
    u.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch { /* nothing else to try */ }
}

export function ListeningScreen({ item, voice, onAnswer, answered, total, stageLabel }) {
  const [picked, setPicked] = useState(null);
  const [plays, setPlays] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const timer = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    setPicked(null);
    setPlays(0);
    setSpeaking(false);
    return () => {
      clearTimeout(timer.current);
      try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
    };
  }, [item.id]);

  const play = () => {
    if (plays >= 2 || speaking) return;
    setPlays((p) => p + 1);
    setSpeaking(true);
    // Safari occasionally drops `ended`; release the button on a timer as well.
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSpeaking(false), Math.max(5000, item.say.length * 95));

    const el = audioRef.current;
    if (el) {
      el.currentTime = 0;
      el.play().catch(() => { speakFallback(voice, item.say); });
      return;
    }
    speakFallback(voice, item.say);
  };

  return (
    <div className="lt-in" key={item.id}>
      <Progress answered={answered} total={total} stageLabel={stageLabel} />
      <div className="lt-card">
        <div className="lt-qhead"><span className="lt-tag">استماع</span></div>

        <audio
          ref={audioRef}
          src={clipUrl(item.id)}
          preload="auto"
          playsInline
          onEnded={() => setSpeaking(false)}
          onError={() => setSpeaking(false)}
        />
        <button type="button" className="lt-play" onClick={play} disabled={plays >= 2 && !speaking}>
          <div className={`lt-wave ${speaking ? '' : 'idle'}`}><b /><b /><b /><b /><b /></div>
          {speaking ? 'جارٍ التشغيل…' : plays === 0 ? 'اضغط للاستماع' : plays === 1 ? 'اسمعها مرة أخيرة' : 'انتهت المحاولتان'}
          <em>{plays}/2</em>
        </button>

        <p className={`lt-q ${isAr(item.text) ? '' : 'ltr'}`}>{item.text}</p>

        <div className="lt-opts">
          {item.options.map((opt, i) => (
            <button
              key={i}
              type="button"
              className={`lt-opt ${isAr(opt) ? '' : 'lt-opt-ltr'}`}
              aria-pressed={picked === i}
              onClick={() => setPicked(i)}
            >
              <i>{String.fromCharCode(65 + i)}</i>
              <span>{opt}</span>
            </button>
          ))}
        </div>

        <div className="lt-actions">
          <span className="lt-kbd">{plays === 0 ? 'استمع أولاً' : ''}</span>
          <button type="button" className="lt-btn" disabled={picked === null} onClick={() => onAnswer(picked)}>
            التالي ←
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Writing ───────────────────────────────────────────────────────────── */
export function WritingScreen({ prompt, onSubmit, onSkip, answered, total }) {
  const [text, setText] = useState('');
  const words = useMemo(() => text.trim().split(/\s+/).filter(Boolean).length, [text]);
  const enough = words >= Math.max(8, Math.round(prompt.minWords * 0.6));

  return (
    <div className="lt-in">
      <Progress answered={answered} total={total} stageLabel="آخر خطوة — الكتابة" />
      <div className="lt-card">
        <h2 className="lt-h2">اكتب بلغتك أنت</h2>
        <p className="lt-lead" style={{ margin: '10px 0 18px', fontSize: '0.95rem' }}>
          هذي الخطوة ما تنحسب في الدرجة — بس هي أهم شي يشوفه المدرّب قبل ما يحدد مسارك.
          اكتب باللي تقدر عليه، وما يحتاج تستخدم مترجم.
        </p>

        <div className="lt-task">
          <p>{prompt.ar}</p>
          <p className="en">{prompt.en}</p>
        </div>

        <textarea
          className="lt-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={prompt.placeholder}
          spellCheck={false}
          autoComplete="off"
          dir="ltr"
        />
        <div className={`lt-wc ${enough ? 'ok' : ''}`}>
          <span>{words} كلمة</span>
          <span>{enough ? '✓ كافي' : `الأفضل ${prompt.minWords}+ كلمة`}</span>
        </div>

        <div className="lt-actions">
          <button type="button" className="lt-btn-ghost lt-chip" onClick={onSkip}>تخطّي</button>
          <button type="button" className="lt-btn" disabled={!enough} onClick={() => onSubmit(text)}>
            خلّصت ←
          </button>
        </div>
      </div>
    </div>
  );
}
