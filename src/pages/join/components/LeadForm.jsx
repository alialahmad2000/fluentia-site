import { useRef, useState } from "react";
import { ChevronDown, LoaderCircle } from "lucide-react";
import {
  fireLeadTracking,
  stripPhone,
  toLocalPhone,
  buildWAMessage,
  toAsciiDigits,
} from "../../../lib/leads/submitLead";
import { getSource } from "../../../utils/tracking";
import { getAttribution } from "../../../lib/attribution";
import { buildWhatsAppUrl } from "../../../lib/whatsapp";
import { TIERS, GOALS, CTA, formatPrice } from "../joinContent";

const UNDECIDED_LABEL = "ساعدوني أختار في اللقاء";

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
  return buildWhatsAppUrl(`السلام عليكم، أبي أحجز لقاء مبدئي مجاني\nالمصدر: ${getSource()}`);
}

export default function LeadForm({ pkgId, setPkgId, nameRef, onDone }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(""); // 9-digit suffix after +966
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
    const tier = TIERS.find((t) => t.id === pkgId) || null;
    const goal = GOALS.find((g) => g.id === goalId) || null;
    const cleanName = name.trim();
    const phoneLocal = toLocalPhone(phone);
    const utm = readUtm();

    try {
      // Same cascade as /start: GA4 → TikTok identify + pixel (shared event_id)
      // → Events API → lead-intake (REST `leads` insert as fallback).
      await fireLeadTracking({
        name: cleanName,
        phone: phoneLocal,
        path: goal?.path || "",
        pkg: tier ? tier.name : "غير محدد",
        pkgPrice: tier ? tier.price : 0,
        goal: goal?.label || "",
        utm,
        consent: true, // the line under the button states it
        hp,
        defaultSource: "join_page",
      });

      const msg = buildWAMessage({
        name: cleanName,
        phoneLocal,
        path: goal?.path || "غير محدد",
        pkgName: tier ? tier.name : UNDECIDED_LABEL,
        pkgPrice: tier ? tier.price : 0,
        goal: goal?.label || "",
        utm,
      });
      // No window.open: TikTok's in-app browser blocks it after an await, and
      // leaving the page can cut the tracking requests. The visitor taps a real link.
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
      <h2 className="j-form-title">احجز لقاءك المبدئي</h2>
      <p className="j-form-sub">30 ثانية، ونتواصل معك على واتساب خلال ساعات.</p>

      <div className="j-field">
        <label htmlFor="join-name" className="j-label">الاسم</label>
        <input
          ref={nameRef}
          id="join-name"
          name="name"
          type="text"
          autoComplete="given-name"
          className="j-input"
          placeholder="اسمك الأول"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          aria-invalid={showNameErr}
          aria-describedby="join-name-err"
          required
        />
        <p id="join-name-err" className="j-err" aria-live="polite">{showNameErr ? "اكتب اسمك" : ""}</p>
      </div>

      <div className="j-field">
        <label htmlFor="join-phone" className="j-label">رقم الجوال (واتساب)</label>
        <div className={`j-phone${showPhoneErr ? " is-invalid" : ""}`} dir="ltr">
          <span className="j-phone-prefix" aria-hidden="true">+966</span>
          <input
            ref={phoneRef}
            id="join-phone"
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
            aria-describedby="join-phone-err"
            required
          />
        </div>
        <p id="join-phone-err" className="j-err" aria-live="polite">
          {showPhoneErr ? "اكتب رقم جوال سعودي يبدأ بـ 5 (9 أرقام)" : ""}
        </p>
      </div>

      <fieldset className="j-field j-fieldset">
        <legend className="j-label">وش هدفك؟</legend>
        <div className="j-chips" role="radiogroup" aria-label="وش هدفك؟">
          {GOALS.map((g) => {
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

      <div className="j-field">
        <label htmlFor="join-pkg" className="j-label">الباقة</label>
        <div className="j-select-wrap">
          <select id="join-pkg" name="pkg" className="j-input j-select" value={pkgId} onChange={(e) => setPkgId(e.target.value)}>
            <option value="">{UNDECIDED_LABEL}</option>
            {TIERS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}: {t.priceFrom ? "من " : ""}{formatPrice(t.price)} ر.س شهريًا
              </option>
            ))}
          </select>
          <ChevronDown className="j-select-icon" size={18} aria-hidden="true" />
        </div>
      </div>

      {/* Honeypot: off-screen, unfocusable. A filled value marks a bot. */}
      <div className="j-hp" aria-hidden="true">
        <label htmlFor="join-company">الشركة</label>
        <input id="join-company" name="company" type="text" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
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
