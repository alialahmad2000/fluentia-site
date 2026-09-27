import { useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import {
  fireLeadTracking,
  stripPhone,
  toLocalPhone,
  buildWAMessage,
  toAsciiDigits,
} from "../../lib/leads/submitLead";
import { getSource } from "../../utils/tracking";
import { getAttribution } from "../../lib/attribution";
import { buildWhatsAppUrl } from "../../lib/whatsapp";
import { PACKAGES, FORM, CTA, fmt } from "./privateContent";

/**
 * /private booking form — /join's LeadForm (same j-* styling, same pipeline:
 * fireLeadTracking → GA4, pixel Lead + CompleteRegistration with a shared
 * event_id, Events API, lead-intake → leads fallback), with the fields this
 * page asks for. No schema change: «مجالك» and the goal chip travel together in
 * the existing `goal` field as «المجال: … · الهدف: …»; `pkg` is the package id.
 */

/** URL first (as /start reads it), then the touch captured at landing. */
function readUtm() {
  const p = new URLSearchParams(window.location.search);
  const a = getAttribution();
  return {
    source: p.get("utm_source") || a.utm_source || "",
    medium: p.get("utm_medium") || a.utm_medium || "",
    campaign: p.get("utm_campaign") || a.utm_campaign || "",
  };
}

function fallbackWaUrl() {
  return buildWhatsAppUrl(`السلام عليكم، أبي أحجز استشارة للتدريب الفردي\nالمصدر: ${getSource()}`);
}

export default function PrivateLeadForm({ pkgId, setPkgId, nameRef, onDone }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(""); // 9-digit suffix after +966
  const [field, setField] = useState("");
  const [goalId, setGoalId] = useState("");
  const [hp, setHp] = useState(""); // honeypot — humans never see it
  const [touched, setTouched] = useState({ name: false, phone: false });
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [success, setSuccess] = useState(null); // { firstName, waUrl }
  const busy = useRef(false);
  const phoneRef = useRef(null);

  const nameOk = name.trim().length >= 2;
  const phoneOk = phone.length === 9 && phone.startsWith("5");
  const showNameErr = touched.name && !nameOk;
  const showPhoneErr = touched.phone && !phoneOk;

  async function onSubmit(e) {
    e.preventDefault();
    if (busy.current) return;
    setTouched({ name: true, phone: true });
    if (!nameOk) { nameRef.current?.focus(); return; }
    if (!phoneOk) { phoneRef.current?.focus(); return; }
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setStatus("error");
      return;
    }

    busy.current = true;
    setStatus("sending");
    const pkg = PACKAGES.find((p) => p.id === pkgId) || PACKAGES[0];
    const goalChip = FORM.goals.find((g) => g.id === goalId) || null;
    const cleanName = name.trim();
    const phoneLocal = toLocalPhone(phone);
    const utm = readUtm();
    const cleanField = field.trim().slice(0, 80);
    const goal = [
      cleanField ? `المجال: ${cleanField}` : "",
      goalChip ? `الهدف: ${goalChip.label}` : "",
    ].filter(Boolean).join(" · ");

    try {
      await fireLeadTracking({
        name: cleanName,
        phone: phoneLocal,
        path: goalChip?.path || "",
        pkg: pkg.id,
        pkgPrice: pkg.price,
        goal,
        utm,
        consent: true, // the line under the button states it
        hp,
        defaultSource: "private_page",
      });

      const msg = buildWAMessage({
        name: cleanName,
        phoneLocal,
        path: goalChip?.path || "غير محدد",
        pkgName: pkg.name,
        pkgPrice: pkg.price,
        goal,
        utm,
      });
      // No window.open: in-app browsers block it after an await. The visitor taps a real link.
      setSuccess({ firstName: cleanName.split(/\s+/)[0], waUrl: buildWhatsAppUrl(msg) });
      setStatus("done");
      onDone?.();
    } catch (err) {
      busy.current = false;
      setStatus("error");
    }
  }

  function backToPage() {
    const top = document.getElementById("top");
    if (top) top.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (status === "done" && success) {
    return (
      <div className="j-form-inner j-success" aria-live="polite">
        <h2 className="j-form-title">وصلنا طلبك يا {success.firstName}</h2>
        <p className="j-form-sub">بنتواصل معك على واتساب خلال ساعات. تبي تبدأ المحادثة الحين؟</p>
        <a className="v1-cta v1-cta-primary j-btn" href={success.waUrl} target="_blank" rel="noopener">
          افتح واتساب
        </a>
        <button type="button" className="j-textlink" onClick={backToPage}>
          رجوع للصفحة
        </button>
      </div>
    );
  }

  const sending = status === "sending";

  return (
    <form className="j-form-inner" onSubmit={onSubmit} noValidate>
      <h2 className="j-form-title">{FORM.title}</h2>
      <p className="j-form-sub">{FORM.sub}</p>

      <fieldset className="j-field j-fieldset">
        <legend className="j-label">الباقة</legend>
        <div className="p-seg" role="radiogroup" aria-label="الباقة">
          {PACKAGES.map((p) => {
            const on = pkgId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={on}
                className={`p-seg-btn${on ? " is-on" : ""}`}
                onClick={() => setPkgId(p.id)}
              >
                <span className="p-seg-name">{p.name}</span>
                <span className="p-seg-price v1-num">{p.priceFrom ? "من " : ""}{fmt(p.price)} ر.س / شهرياً</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="j-field">
        <label htmlFor="private-name" className="j-label">الاسم</label>
        <input
          ref={nameRef}
          id="private-name"
          name="name"
          type="text"
          autoComplete="given-name"
          className="j-input"
          placeholder="اسمك الأول"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          aria-invalid={showNameErr}
          aria-describedby="private-name-err"
          required
        />
        <p id="private-name-err" className="j-err" aria-live="polite">{showNameErr ? "اكتب اسمك" : ""}</p>
      </div>

      <div className="j-field">
        <label htmlFor="private-phone" className="j-label">رقم الجوال (واتساب)</label>
        <div className={`j-phone${showPhoneErr ? " is-invalid" : ""}`} dir="ltr">
          <span className="j-phone-prefix" aria-hidden="true">+966</span>
          <input
            ref={phoneRef}
            id="private-phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            className="j-input j-phone-input"
            placeholder="5XXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(stripPhone(toAsciiDigits(e.target.value)))}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            aria-invalid={showPhoneErr}
            aria-describedby="private-phone-err"
            required
          />
        </div>
        <p id="private-phone-err" className="j-err" aria-live="polite">
          {showPhoneErr ? "اكتب رقم جوال سعودي يبدأ بـ 5 (9 أرقام)" : ""}
        </p>
      </div>

      <div className="j-field">
        <label htmlFor="private-field" className="j-label">مجالك</label>
        <input
          id="private-field"
          name="field"
          type="text"
          autoComplete="organization-title"
          className="j-input"
          placeholder={FORM.fieldPlaceholder}
          value={field}
          maxLength={80}
          onChange={(e) => setField(e.target.value)}
        />
      </div>

      <fieldset className="j-field j-fieldset">
        <legend className="j-label">وش تبي من الإنجليزي؟</legend>
        <div className="j-chips" role="radiogroup" aria-label="وش تبي من الإنجليزي؟">
          {FORM.goals.map((g) => {
            const on = goalId === g.id;
            return (
              <button
                key={g.id}
                type="button"
                role="radio"
                aria-checked={on}
                className={`j-chip${on ? " is-on" : ""}`}
                onClick={() => setGoalId(on ? "" : g.id)}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Honeypot: off-screen, unfocusable. A filled value marks a bot. */}
      <div className="j-hp" aria-hidden="true">
        <label htmlFor="private-company">الشركة</label>
        <input id="private-company" name="company" type="text" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
      </div>

      <button type="submit" className="v1-cta v1-cta-primary j-btn j-submit" disabled={sending} aria-busy={sending}>
        {sending ? (
          <>
            <LoaderCircle className="j-spin" size={20} aria-hidden="true" />
            <span>جاري الإرسال…</span>
          </>
        ) : CTA}
      </button>

      <div aria-live="polite">
        {status === "error" ? (
          <p className="j-err j-err-net">
            ما قدرنا نرسل طلبك. تأكد من الاتصال وجرّب مرة ثانية، أو{" "}
            <a href={fallbackWaUrl()} target="_blank" rel="noopener" className="j-link">كلّمنا على واتساب مباشرة</a>.
          </p>
        ) : null}
      </div>

      <p className="j-consent">بالضغط على الزر، توافق إننا نتواصل معك عبر واتساب.</p>
    </form>
  );
}
