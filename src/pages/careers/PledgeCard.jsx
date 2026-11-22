/**
 * «تعهّد الالتزام بالفترة التجريبية» (v1, 2026-11-22) — the formal trial-commitment pledge.
 * The LAST step before an application is submitted, and the page behind /careers/pledge/:token (the applicant's
 * read-only copy, and the link for people invited to a trial before the pledge existed).
 * The text comes from the edge function (hiring-interview: pledgeText) and is stored as a snapshot — never written here.
 * Flat, official card: solid colours only, no glow, no gradient.
 */
import { useState } from "react";
import BrandMark from "../../components/BrandMark";

const pick = (gender, m, f) => (gender === "f" ? f : m);

/** Name rule shared with the edge function and SQL _hr_norm_name: diacritics, alef/taa forms, punctuation ignored. */
export const normName = (s) => String(s || "").toLowerCase().replace(/[ً-ٰٟـ]/g, "")
  .replace(/[أإآٱ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/ؤ/g, "و").replace(/ئ/g, "ي")
  .replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();

function Meta({ pledge, en }) {
  const rows = en
    ? [["Full name", pledge.name], ["Applicant ID", pledge.applicant_code || "—"], ["Date", pledge.date], ["Reference", pledge.ref]]
    : [["الاسم الكامل", pledge.name], ["رقم المتقدّم", pledge.applicant_code || "—"], ["التاريخ", pledge.date], ["رقم المرجع", pledge.ref]];
  return (
    <dl className="pl-meta">
      {rows.map(([k, v]) => (
        <div key={k}><dt>{k}</dt><dd dir="auto">{v}</dd></div>
      ))}
    </dl>
  );
}

/**
 * props: pledge (edge pledgeView), en, mode "flow" | "link", busy, error, fieldError,
 *        onSign(name) → Promise, onDecline() → Promise, onBack() (after a decline), copyUrl (signed)
 */
export default function PledgeCard({ pledge, en, mode = "flow", busy, error, fieldError, onSign, onDecline, onBack, copyUrl, declinedMsg }) {
  const [agree, setAgree] = useState(false);
  const [name, setName] = useState("");
  const [local, setLocal] = useState("");
  const gender = pledge?.gender;
  if (!pledge) return null;
  const signed = !!pledge.signed;
  const declined = !!declinedMsg;
  const paras = String(pledge.text || "").split("\n");

  const submit = (e) => {
    e.preventDefault();
    setLocal("");
    if (!agree) { setLocal(en ? "Please tick the box to confirm you have read and agree to the pledge." : pick(gender, "علّم على المربع لتأكيد إنك قرأت التعهّد وتوافق عليه.", "علّمي على المربع لتأكيد إنك قرأتي التعهّد وتوافقين عليه.")); return; }
    if (!normName(name)) { setLocal(en ? "Please type your full name as your signature." : pick(gender, "اكتب اسمك الكامل كتوقيع.", "اكتبي اسمك الكامل كتوقيع.")); return; }
    if (normName(name) !== normName(pledge.name)) {
      setLocal(en ? `The name doesn't match the name on your application («${pledge.name}»). Please type it again exactly as you gave it.`
        : pick(gender, `الاسم ما يطابق الاسم المكتوب في طلبك («${pledge.name}»). اكتبه مرة ثانية بنفس الشكل.`, `الاسم ما يطابق الاسم المكتوب في طلبك («${pledge.name}»). اكتبيه مرة ثانية بنفس الشكل.`));
      return;
    }
    onSign?.(name.trim());
  };
  const shownErr = local || error;
  const nameBad = !!local && /name|الاسم/i.test(local) || fieldError === "name";

  return (
    <article className="pl-card" aria-labelledby="pl-title">
      <header className="pl-head">
        <div className="pl-brand"><BrandMark size={34} /><span>{en ? "Fluentia Academy" : "أكاديمية طلاقة"}</span></div>
        <span className="pl-badge">{en ? "Formal pledge" : "تعهّد رسمي"}</span>
      </header>
      <h2 id="pl-title" className="pl-title">{pledge.title}</h2>
      <Meta pledge={pledge} en={en} />

      <div className="pl-text" dir={en ? "ltr" : "rtl"}>
        {paras.map((p, i) => (/^\d+\.\s/.test(p) ? <p key={i} className="pl-item">{p}</p> : <p key={i}>{p}</p>))}
      </div>

      {signed ? (
        <div className="pl-signed" role="status">
          <div className="pl-sigline">
            <span className="pl-sig" dir="auto">{pledge.signed_name || pledge.name}</span>
            <span className="pl-siglbl">{en ? "Signature" : "التوقيع"}</span>
          </div>
          <p className="pl-ok">{en ? `Signed on ${pledge.date} · reference ${pledge.ref} · version ${pledge.version}` : `وُقّع بتاريخ ${pledge.date} · رقم المرجع ${pledge.ref} · الإصدار ${pledge.version}`}</p>
          <div className="pl-actions">
            <button type="button" className="cr-btn cr-btn-ghost" onClick={() => window.print()}>{en ? "Print / save as PDF" : "طباعة / حفظ PDF"}</button>
            {copyUrl && mode === "flow" ? <a className="cr-btn cr-btn-ghost" href={copyUrl} target="_blank" rel="noopener">{en ? "Open my copy" : "نسخة من تعهّدك"}</a> : null}
          </div>
        </div>
      ) : declined ? (
        <div className="pl-declined" role="status">
          <p>{declinedMsg}</p>
          {onBack ? <button type="button" className="cr-btn cr-btn-ghost" onClick={onBack} disabled={busy}>{en ? "I've changed my mind — I want to sign" : pick(gender, "غيّرت رأيي — أبي أوقّع", "غيّرت رأيي — أبي أوقّع")}</button> : null}
        </div>
      ) : (
        <form className="pl-form" onSubmit={submit} noValidate>
          <label className={`cr-consent${local && !agree ? " bad" : ""}`}>
            <input type="checkbox" checked={agree} onChange={(e) => { setAgree(e.target.checked); setLocal(""); }} />
            <span><b>{en ? "I have read the pledge and I agree to it" : "قرأت التعهّد وأوافق عليه"}</b></span>
          </label>
          <div className="cr-field">
            <label htmlFor="pl-name">{en ? "Type your full name as your signature" : pick(gender, "اكتب اسمك الكامل كتوقيع", "اكتبي اسمك الكامل كتوقيع")}</label>
            <input id="pl-name" type="text" autoComplete="name" dir="auto" value={name} maxLength={120}
              onChange={(e) => { setName(e.target.value); setLocal(""); }} aria-invalid={nameBad ? "true" : "false"}
              placeholder={pledge.name} aria-describedby="pl-name-h" />
            <span id="pl-name-h" className="cr-hint">{en ? "The same name you gave in your application." : "نفس الاسم اللي كتبته في الطلب."}</span>
          </div>
          {shownErr ? <p className="cr-err cr-err-box" role="alert">{shownErr}</p> : null}
          <button type="submit" className="cr-btn cr-btn-primary pl-go" disabled={busy}>
            {mode === "flow" ? (en ? "Sign and submit my application" : "أوقّع وأرسل طلبي") : (en ? "Sign the pledge" : "أوقّع التعهّد")}
          </button>
          <button type="button" className="cr-link pl-no" onClick={() => onDecline?.()} disabled={busy}>
            {en ? "I can't commit to this" : pick(gender, "ما أقدر ألتزم", "ما أقدر ألتزم")}
          </button>
        </form>
      )}
    </article>
  );
}
