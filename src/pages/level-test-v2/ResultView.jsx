/* Level test v2 — the result. Level first (sun meter), then what it means in
 * real life, how sure we are, skills relative to the learner's own level, the
 * first four weeks, and one call: leave your number and we get back to you. No prices.
 * 2026-11-25 (Ali): no slot picker, no booking — the result goes to «طلبات بانتظار قرارك»
 * (v2_contact / v2_request → lt_request) and Ali proposes a time himself. */
import React, { useEffect, useRef, useState } from 'react';
import SunMeter from './SunMeter';
import { CARD_LINE, CONF_AR, CONF_NOTE, LEVEL_COPY, goalAr, levelName, planFor } from './content';
import { requestReview, resultFields, submitContact } from './api';
import { ltEvent, trackBookClick } from './events';
import { drawShareCard } from './shareCard';
import { buildWhatsAppUrl } from '../../lib/whatsapp';

const VERDICT = { strong: 'أقوى عندك', weak: 'تحتاج شغل', even: 'متوازنة' };
const GENDER_AR = { male: 'ذكر', female: 'أنثى' };

export function resultMessage(run) {
  const r = run.result; const L = r.level;
  const lines = [
    'السلام عليكم 👋',
    'هذي نتيجة اختبار تحديد المستوى من موقع طلاقة:',
    '',
    `الاسم: ${run.name || '—'}`,
    `العمر: ${run.age || '—'}`,
    `الجنس: ${GENDER_AR[run.gender] || '—'}`,
    `الهدف: ${goalAr(run.goal)}`,
    '',
    `المستوى: ${L.code} · ${L.cefr} — ${L.ar}`,
    `المسار: ${L.track}`,
    `دقة التقييم: ${CONF_AR[r.confidence]} (${Math.round(r.confidenceScore * 100)}%)`,
  ];
  if (r.borderline && r.alt) lines.push(`ملاحظة: على الحد مع ${r.alt.cefr}`);
  if (r.listeningSkipped) lines.push('الاستماع: تم تخطيه');
  lines.push(`الإجابات الصحيحة: ${r.correct} من ${r.total}`, '', 'المهارات:');
  r.skills.forEach((s) => lines.push(`${s.verdict === 'strong' ? '↑' : s.verdict === 'weak' ? '↓' : '·'} ${s.ar}: ${s.correct}/${s.total}`));
  if (run.writing) lines.push('', 'عينة الكتابة:', `"${run.writing.length > 420 ? `${run.writing.slice(0, 420)}…` : run.writing}"`);
  lines.push('', 'أبي أعرف الخطوة الجاية 🌅');
  return lines.join('\n');
}

export default function ResultView({ run, setRun, ensureAtt, onRetake }) {
  const r = run.result;
  const female = run.gender === 'female';
  const k = female ? 'f' : 'm';
  const copy = LEVEL_COPY[r.lvl];
  const attId = run.att?.id || 'local';
  const [sent, setSent] = useState(!!run.contacted); // info reached the team (contact saved / request made)
  const [shareMsg, setShareMsg] = useState('');
  const heading = useRef(null);

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    ltEvent('level_test_result_view', { attempt: attId, level: r.level.cefr });
    let live = true;
    (async () => {
      const att = await ensureAtt();
      // The contact save failed earlier (network): try once more, quietly.
      if (att && run.contactPending) {
        const res = await submitContact(att, { phone: run.phone, goal: run.goal || null, age: run.age || null, name: run.name, ...resultFields(r), answers: run.trail });
        if (res?.ok && live) setRun((s) => ({ ...s, contacted: true, contactPending: false }));
      }
      if (!att) return;
      if (run.contacted || run.phone) {
        const q = await requestReview(att); // idempotent: one open request per lead
        if (live && (q?.ok || run.contacted)) setSent(true);
      }
    })();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const waUrl = buildWhatsAppUrl(resultMessage(run));

  const share = async () => {
    setShareMsg('');
    try {
      const blob = await drawShareCard({ level: r.level, name: levelName(r.level, run.gender), life: CARD_LINE[r.lvl] });
      const file = new File([blob], `fluentia-level-${r.level.cefr}.png`, { type: 'image/png' });
      const url = 'https://fluentia.academy/level-test?utm_source=share&utm_medium=level_test&utm_campaign=result';
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: `مستواي في الإنجليزي ${r.level.cefr}. اختبر مستواك مجاناً: ${url}` });
      } else {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = file.name; document.body.appendChild(a); a.click(); a.remove();
        setShareMsg('حفظنا صورة النتيجة على جهازك.');
      }
      ltEvent('level_test_share', { attempt: attId, level: r.level.cefr });
    } catch (e) {
      if (e?.name !== 'AbortError') setShareMsg('ما قدرنا نجهّز الصورة على هذا المتصفح.');
    }
  };

  return (
    <main className="lt2-wrap lt2-result lt2-enter">
      <header className="lt2-bar" style={{ paddingBlock: 0 }}>
        <a className="lt2-brand" href="/" aria-label="طلاقة: الصفحة الرئيسية"><span>طلاقة</span></a>
        <span className={`lt2-badge is-${r.confidence}`}>{CONF_AR[r.confidence]}</span>
      </header>

      <section className="lt2-card" aria-labelledby="lt2-res-h">
        <p className="lt2-hello">{run.name ? `${run.name}، هذا مستواك` : 'هذا مستواك'}</p>
        <SunMeter lvl={r.lvl} title={`مستواك ${r.level.cefr} على مقياس من ما قبل A1 إلى C1`} />
        <div className="lt2-level">
          <h1 className="lt2-level-name" id="lt2-res-h" tabIndex={-1} ref={heading} style={{ margin: 0 }}>{levelName(r.level, run.gender)}</h1>
          <span className="lt2-level-code">{r.level.cefr}</span>
        </div>
        <p className="lt2-life">{copy.life[k]}</p>
        <p className="lt2-life" style={{ color: 'var(--text-3)', fontSize: 14.5 }}>مسار {r.level.track} · المستوى {r.level.code}</p>
      </section>

      <p style={{ margin: 0, color: 'var(--text-2)' }}>{CONF_NOTE[r.confidence]}</p>
      {r.borderline && r.alt && (
        <p className="lt2-border">نتيجتك على الحد بين {r.level.cefr} و{r.alt.cefr}. المدرب يحسم أيهما أنسب للبداية.</p>
      )}
      {r.listeningSkipped && <p className="lt2-border">{female ? 'تخطيتي الاستماع' : 'تخطيت الاستماع'}، فالنتيجة محسوبة من القواعد والمفردات والقراءة.</p>}

      <section aria-labelledby="lt2-mean">
        <h2 className="lt2-h3" id="lt2-mean">وش يعني هذا المستوى</h2>
        <p style={{ margin: 0, color: 'var(--text-2)' }}>{copy.meaning[k]}</p>
      </section>

      {r.skills.length > 1 && (
        <section aria-labelledby="lt2-skills">
          <h2 className="lt2-h3" id="lt2-skills">مهاراتك مقارنة بمستواك أنت</h2>
          <ul className="lt2-bars">
            {r.skills.map((s) => (
              <li key={s.skill}>
                <span>{s.ar}</span>
                <span className={`lt2-track${s.verdict === 'strong' ? ' is-strong' : ''}`} role="img" aria-label={`${s.ar}: ${VERDICT[s.verdict]}`}><span style={{ width: `${s.rel}%` }} /></span>
                <span className={`lt2-verdict is-${s.verdict}`}>{VERDICT[s.verdict]}</span>
              </li>
            ))}
          </ul>
          <p className="lt2-hint" style={{ textAlign: 'start', marginTop: 10 }}>الخط في المنتصف هو مستواك العام. الشريط الأطول يعني مهارة أقوى من باقي مهاراتك.</p>
        </section>
      )}

      <section aria-labelledby="lt2-plan">
        <h2 className="lt2-h3" id="lt2-plan">أول 4 أسابيع{run.goal ? ` (هدفك: ${goalAr(run.goal)})` : ''}</h2>
        <ul className="lt2-plan">
          {planFor(r.lvl, run.goal, run.gender).map((p) => <li key={p}><b aria-hidden="true">·</b><span>{p}</span></li>)}
        </ul>
      </section>

      <section className="lt2-card" aria-labelledby="lt2-next">
        {sent ? (
          <div className="lt2-ok" role="status">
            <h2 className="lt2-h3" id="lt2-next" style={{ marginBottom: 4 }}>وصلتنا بياناتك 🌷</h2>
            <p style={{ margin: 0 }}>بنراجعها ونتواصل معك قريب إن شاء الله.</p>
          </div>
        ) : (
          <>
            <h2 className="lt2-h3" id="lt2-next">الخطوة الجاية</h2>
            <p style={{ margin: '0 0 14px', color: 'var(--text-2)' }}>{female ? 'أرسلي نتيجتك على واتساب، ونراجعها ونتواصل معك قريب إن شاء الله.' : 'أرسل نتيجتك على واتساب، ونراجعها ونتواصل معك قريب إن شاء الله.'}</p>
            <a className="lt2-cta is-block" href={waUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackBookClick({ attempt: attId, via: 'whatsapp' })}>
              {female ? 'أرسلي نتيجتك على واتساب' : 'أرسل نتيجتك على واتساب'}
            </a>
          </>
        )}
      </section>

      <div className="lt2-row" style={{ justifyContent: 'space-between' }}>
        <button type="button" className="lt2-ghost" onClick={share}>{female ? 'شاركي نتيجتك' : 'شارك نتيجتك'}</button>
        <button type="button" className="lt2-link" onClick={onRetake}>{female ? 'أعيدي الاختبار' : 'أعد الاختبار'}</button>
      </div>
      {shareMsg && <p className="lt2-hint" role="status">{shareMsg}</p>}
      <p className="lt2-hint">النتيجة تقدير مبدئي على مقياس CEFR، وليست شهادة رسمية ولا تعادل درجة في STEP أو IELTS.</p>
    </main>
  );
}
