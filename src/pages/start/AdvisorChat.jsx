import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../../components/Seo';
import { MARK_BOX, MARK_PATHS } from '../../lib/brandMark';
import { getVisitorId } from '../../utils/affiliateTracking';
import { track } from '../../lib/track';
import { fireTikTokContact } from '../../lib/tiktokPixel';
import Orb from '../next/Orb';
import Starfield from '../next/Starfield';
import { detectTier, tierConfig } from '../next/perf';
import './advisor.css';

/* «مستشار طلاقة» — fluentia.academy/start.
 *
 * The page never reads the database. Every turn is one POST to the admissions-bot
 * edge function, which owns the conversation, the CRM lead, the booking and the
 * human hand-off. The browser keeps only a random client id (localStorage) so a
 * returning visitor resumes the same thread; the server stores its sha256.
 * The old form lives on at /start/form (linked at the bottom).
 * SSR-safe: the prerendered HTML is the shell + typing indicator; the first
 * request runs in an effect, on the client only. */

const ENDPOINT = 'https://nmjexpuycmqcxuxljier.supabase.co/functions/v1/admissions-bot';
const CID_KEY = 'fl_abot_cid';
const TEST_KEY = 'fl_abot_test'; // sessionStorage, set only by the self-check harness
const MAX_LEN = 600;
const URL_KEYS = ['src', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ttclid', 'fbclid', 'gclid', 'ref'];

function newId() {
  const a = new Uint8Array(18);
  try { crypto.getRandomValues(a); } catch { for (let i = 0; i < a.length; i++) a[i] = Math.floor(Math.random() * 256); }
  return 'w' + Array.from(a, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 31);
}
let memoryCid = null;
function clientId() {
  try {
    let v = window.localStorage.getItem(CID_KEY);
    if (!v || !/^[A-Za-z0-9_-]{16,80}$/.test(v)) { v = newId(); window.localStorage.setItem(CID_KEY, v); }
    return v;
  } catch {
    memoryCid = memoryCid || newId();
    return memoryCid;
  }
}
function testKey() {
  try { return window.sessionStorage.getItem(TEST_KEY) || undefined; } catch { return undefined; }
}
function context() {
  const utm = {};
  try {
    const q = new URLSearchParams(window.location.search);
    for (const k of URL_KEYS) { const v = q.get(k); if (v) utm[k] = v.slice(0, 300); }
    if (document.referrer && !document.referrer.startsWith(window.location.origin)) utm.referrer = document.referrer.slice(0, 300);
    utm.landing = (window.location.pathname + window.location.search).slice(0, 300);
  } catch { /* attribution is best-effort */ }
  let visitor;
  try { visitor = getVisitorId(); } catch { visitor = undefined; }
  return { src: utm.src || utm.utm_source || '', utm, visitor_id: visitor };
}

async function call(body) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, client_id: clientId(), test_key: testKey(), ...context() }),
  });
  const j = await res.json().catch(() => null);
  if (!j) throw new Error('bad_response');
  return j;
}

/* ── calendar ─────────────────────────────────────────────────────────────── */
const icsDate = (iso) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const NOTE = 'لقاء مبدئي مجاني مع المدرب على Google Meet — يكفي فيه الصوت. يوصلك رابط اللقاء على واتساب.';
function googleCalUrl(b) {
  const q = new URLSearchParams({
    action: 'TEMPLATE', text: b.title || 'اللقاء المبدئي — أكاديمية طلاقة',
    dates: `${icsDate(b.start)}/${icsDate(b.end)}`,
    details: b.meet_url ? `${NOTE}\n${b.meet_url}` : NOTE,
    location: b.meet_url || 'Google Meet',
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}
function downloadIcs(b) {
  const esc = (s) => String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Fluentia//Admissions//AR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT', `UID:${b.id}@fluentia.academy`, `DTSTAMP:${icsDate(new Date().toISOString())}`,
    `DTSTART:${icsDate(b.start)}`, `DTEND:${icsDate(b.end)}`,
    `SUMMARY:${esc(b.title || 'اللقاء المبدئي — أكاديمية طلاقة')}`,
    `DESCRIPTION:${esc(b.meet_url ? `${NOTE}\n${b.meet_url}` : NOTE)}`,
    `LOCATION:${esc(b.meet_url || 'Google Meet')}`,
    'BEGIN:VALARM', 'TRIGGER:-PT10M', 'ACTION:DISPLAY', 'DESCRIPTION:اللقاء المبدئي بعد 10 دقائق', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  try {
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'fluentia-meeting.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  } catch { window.open(googleCalUrl(b), '_blank', 'noopener'); }
}

/* ── pieces ───────────────────────────────────────────────────────────────── */
const TONES = ['#7dd3fc', '#38bdf8', '#0ea5e9', '#0369a1'];
function Mark({ size = 22 }) {
  const [x, y, w, h] = MARK_BOX;
  return (
    <svg width={size} height={size * (h / w)} viewBox={`${x} ${y} ${w} ${h}`} aria-hidden="true" focusable="false">
      {MARK_PATHS.map(([t, d], i) => <path key={i} d={d} fill={TONES[t]} />)}
    </svg>
  );
}
function Avatar({ small }) {
  return <span className={`adv-avatar${small ? ' sm' : ''}`} aria-hidden="true"><Mark size={small ? 13 : 20} /></span>;
}
function Typing() {
  return (
    <div className="adv-row bot" aria-hidden="true">
      <Avatar small />
      <div className="adv-bub bot adv-typing"><i /><i /><i /></div>
    </div>
  );
}

function ContactCard({ busy, onSubmit, error }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [hp, setHp] = useState('');
  const ok = name.trim().length >= 2 && phone.replace(/\D/g, '').length >= 9;
  const submit = (e) => { e.preventDefault(); if (ok && !busy) onSubmit({ name: name.trim(), phone: phone.trim(), hp }); };
  return (
    <form className="adv-card" onSubmit={submit} aria-label="بيانات التواصل">
      <label className="adv-field">
        <span>الاسم</span>
        <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" maxLength={60} placeholder="اسمك الأول" enterKeyHint="next" />
      </label>
      <label className="adv-field">
        <span>رقم الواتساب</span>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" dir="ltr" maxLength={20} placeholder="05xxxxxxxx" enterKeyHint="send" aria-invalid={!!error} />
      </label>
      <input className="adv-hp" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} aria-hidden="true" name="company" />
      <button type="submit" className="adv-primary" disabled={!ok || busy}>{busy ? 'لحظة…' : 'تمام، كمّل'}</button>
      <p className="adv-fine">نستخدم رقمك للتواصل معك بخصوص اللقاء فقط. ما نرسل لك إعلانات.</p>
    </form>
  );
}

function BookingCard({ b }) {
  return (
    <div className="adv-booked" role="status">
      <div className="adv-booked-top">
        <span className="adv-check" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <div>
          <div className="adv-booked-k">تم حجز لقائك المبدئي المجاني</div>
          <div className="adv-booked-when">{b.when}</div>
        </div>
      </div>
      <ul className="adv-booked-facts">
        <li>على Google Meet — يكفي الصوت بدون كاميرا</li>
        <li>مدته تقريباً {b.minutes || 30} دقيقة</li>
        <li>{b.meet_url ? 'رابط اللقاء جاهز تحت' : 'يوصلك رابط اللقاء على واتساب'}</li>
      </ul>
      <div className="adv-booked-actions">
        <a className="adv-primary" href={googleCalUrl(b)} target="_blank" rel="noopener noreferrer">أضف للتقويم (Google)</a>
        <button type="button" className="adv-ghost" onClick={() => downloadIcs(b)}>تقويم iPhone / Outlook</button>
        {b.meet_url && <a className="adv-ghost" href={b.meet_url} target="_blank" rel="noopener noreferrer">رابط اللقاء</a>}
      </div>
    </div>
  );
}

/* ── page ─────────────────────────────────────────────────────────────────── */
const OFFLINE = 'ما قدرت أوصل للخادم 🙏 تأكد من الإنترنت وجرّب مرة ثانية.';

export default function AdvisorChat() {
  const [msgs, setMsgs] = useState([]);           // {role, body, id}
  // The home page's sky behind the chat: its starfield, and its planet rising as the horizon.
  // Same device tiers as the home page; the planet is capped at 30 fps since it runs while people type.
  const [tier, setTier] = useState(null);
  useEffect(() => {
    let alive = true;
    detectTier().then((t) => { if (alive) setTier(t); }).catch(() => {});
    return () => { alive = false; };
  }, []);
  const space = tier ? tierConfig(tier) : null;
  const planetGl = space && space.webgl ? { webgl: true, fps: Math.min(space.fps, 30), dpr: Math.min(space.dpr, 1.5) } : null;
  const [chips, setChips] = useState([]);
  const [card, setCard] = useState(null);
  const [booking, setBooking] = useState(null);
  const [busy, setBusy] = useState(true);
  const [typing, setTyping] = useState(true);
  const [text, setText] = useState('');
  const [phoneErr, setPhoneErr] = useState(false);
  const [retry, setRetry] = useState(null);       // the request to resend after a failure
  const logRef = useRef(null);
  const inputRef = useRef(null);
  const seq = useRef(0);
  const alive = useRef(true);
  const timers = useRef([]);

  const push = useCallback((role, body) => {
    seq.current += 1;
    setMsgs((m) => [...m, { role, body, id: seq.current }]);
  }, []);

  // Show the bot's messages one by one, with a short typing beat between them.
  const reveal = useCallback((list, done) => {
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let i = 0;
    const step = () => {
      if (!alive.current) return;
      if (i >= list.length) { setTyping(false); done(); return; }
      const m = list[i++];
      push(m.role === 'user' ? 'user' : 'bot', m.body);
      if (i < list.length) {
        setTyping(true);
        timers.current.push(setTimeout(step, reduce ? 0 : Math.min(1400, 450 + m.body.length * 6)));
      } else step();
    };
    setTyping(true);
    timers.current.push(setTimeout(step, reduce ? 0 : 380));
  }, [push]);

  const apply = useCallback((r) => {
    setRetry(null);
    if (r.resumed && Array.isArray(r.transcript) && r.transcript.length) {
      // A known conversation (this browser, or the same number on another device): show it whole.
      seq.current += r.transcript.length;
      setMsgs(r.transcript.map((m, i) => ({ role: m.role === 'user' ? 'user' : 'bot', body: m.body, id: `t${i}` })));
      setTyping(false);
      setChips(r.chips || []); setCard(r.card || null);
      if (r.booking) setBooking(r.booking);
      setBusy(false);
      return;
    }
    reveal(r.messages || [], () => {
      setChips(r.chips || []);
      setCard(r.card || null);
      if (r.booking) setBooking(r.booking);
      setBusy(false);
    });
  }, [reveal]);

  const send = useCallback(async (req, echo) => {
    if (echo) push('user', echo);
    setChips([]); setCard(null); setBusy(true); setTyping(true); setPhoneErr(false);
    try {
      const r = await call(req);
      if (!alive.current) return;
      if (req.action === 'contact') {
        if (r.error === 'invalid_phone' || r.card === 'contact') setPhoneErr(true);
        else { track('generate_lead', { method: 'admissions_bot' }); fireTikTokContact({ contentId: 'admissions_bot', contentName: 'Admissions chat' }); }
      }
      if (req.action === 'book' && r.booking) track('book_meeting', { method: 'admissions_bot' });
      if (!r.ok && !r.messages?.length) throw new Error(r.error || 'failed');
      if (!r.ok && r.error !== 'invalid_phone') {
        reveal(r.messages || [], () => { setRetry({ req }); setBusy(false); });
        return;
      }
      apply(r);
    } catch {
      if (!alive.current) return;
      setTyping(false);
      push('bot', OFFLINE);
      setRetry({ req });
      setBusy(false);
    }
  }, [apply, push, reveal]);

  useEffect(() => {
    alive.current = true;
    send({ action: 'hello' });
    const t = timers.current;
    return () => { alive.current = false; t.forEach(clearTimeout); };
  }, [send]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: msgs.length > 2 ? 'smooth' : 'auto' });
  }, [msgs, typing, chips, card, booking]);

  const onChip = (c) => {
    if (busy) return;
    if (c.kind === 'slot' && c.value) send({ action: 'book', start: c.value, label: c.label }, c.label);
    else send({ action: 'message', text: c.value || c.label }, c.label);
  };
  const onSend = (e) => {
    e?.preventDefault();
    const t = text.trim().slice(0, MAX_LEN);
    if (!t || busy) return;
    setText('');
    send({ action: 'message', text: t }, t);
    inputRef.current?.focus();
  };
  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) onSend(e);
  };

  const slots = chips.filter((c) => c.kind === 'slot' || c.kind === 'no_slot');
  const replies = chips.filter((c) => c.kind !== 'slot' && c.kind !== 'no_slot' && c.kind !== 'contact');

  return (
    <div className="adv-page" dir="rtl" lang="ar">
      <Seo path="/start" />
      <div className="adv-world" aria-hidden="true">
        <Starfield density={space ? space.stars : 0} />
        <div className="adv-planet"><Orb variant="planet" gl={planetGl} scale={0.9} /></div>
      </div>
      <main className="adv-shell">
        <header className="adv-head">
          <Avatar />
          <div className="adv-id">
            <h1>مستشار طلاقة</h1>
            <p><span className="adv-dot" aria-hidden="true" />متصل الآن · المساعد الذكي<span className="adv-sub-long">&nbsp;لأكاديمية طلاقة</span></p>
          </div>
          <a className="adv-home" href="/" aria-label="الصفحة الرئيسية لأكاديمية طلاقة">طلاقة</a>
        </header>

        <ul className="adv-trust" aria-label="عن اللقاء">
          <li>لقاء مبدئي مجاني</li><li>أونلاين مباشر</li><li>منهج على هدفك</li>
        </ul>

        <section className="adv-log" ref={logRef} aria-live="polite" aria-label="المحادثة" aria-busy={typing}>
          {msgs.map((m, i) => {
            const firstOfRun = i === 0 || msgs[i - 1].role !== m.role;
            return (
              <div key={m.id} className={`adv-row ${m.role}${firstOfRun ? ' first' : ''}`}>
                {m.role === 'bot' && (firstOfRun ? <Avatar small /> : <span className="adv-avatar-gap" />)}
                <div className={`adv-bub ${m.role}`}>{m.body}</div>
              </div>
            );
          })}
          {typing && <Typing />}

          {!typing && booking && <BookingCard b={booking} />}

          {!typing && card === 'contact' && (
            <ContactCard busy={busy} error={phoneErr}
              onSubmit={({ name, phone, hp }) => send({ action: 'contact', name, phone, hp }, `${name} · ${phone}`)} />
          )}

          {!typing && !!slots.length && (
            <div className="adv-slots" role="group" aria-label="المواعيد المتاحة">
              {slots.map((c, i) => (
                <button key={i} type="button" className={`adv-slot${c.kind === 'no_slot' ? ' none' : ''}`} disabled={busy} onClick={() => onChip(c)}>{c.label}</button>
              ))}
            </div>
          )}

          {!typing && !!replies.length && (
            <div className="adv-chips" role="group" aria-label="ردود سريعة">
              {replies.map((c, i) => <button key={i} type="button" className="adv-chip" style={{ '--i': i }} disabled={busy} onClick={() => onChip(c)}>{c.label}</button>)}
            </div>
          )}

          {!typing && retry && (
            <div className="adv-chips">
              <button type="button" className="adv-chip" onClick={() => { const r = retry.req; setRetry(null); send(r); }}>إعادة المحاولة</button>
            </div>
          )}
        </section>

        <form className="adv-compose" onSubmit={onSend}>
          <textarea ref={inputRef} rows={1} value={text} maxLength={MAX_LEN} onChange={(e) => setText(e.target.value)} onKeyDown={onKey}
            placeholder={card === 'contact' ? 'أو اكتب سؤالك هنا…' : 'اكتب رسالتك…'} aria-label="اكتب رسالتك" enterKeyHint="send" />
          <button type="submit" className="adv-send" disabled={busy || !text.trim()} aria-label="إرسال">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M20 12H5m0 0l6-6m-6 6l6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </form>
        <footer className="adv-foot">
          <Link to="/start/form">تفضّل تعبّي نموذج؟</Link>
          <span aria-hidden="true">·</span>
          <Link to="/privacy">الخصوصية</Link>
        </footer>
      </main>
    </div>
  );
}
