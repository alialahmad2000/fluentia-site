import { useEffect, useRef, useState } from "react";
import { FORM, REGISTRATION, getRegistrationStatus } from "./content";
import { fireTikTokLeadEvents, normalizePhoneE164 } from "../../lib/tiktokPixel";
import { saveLead } from "../../utils/tracking";

// ────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────

const WHATSAPP_NUMBER = "966558669974";
const FORM_CONTENT_ID = "fluentia_lead_form_v2";

// ────────────────────────────────────────────────────────────
// Inline helpers
// ────────────────────────────────────────────────────────────

function isValidSaudiPhone(raw) {
  const digits = (raw || "").replace(/\D/g, "");
  let p = digits;
  if (p.startsWith("00")) p = p.slice(2);
  if (p.startsWith("966")) p = p.slice(3);
  if (p.startsWith("0")) p = p.slice(1);
  return /^5\d{8}$/.test(p);
}

function readUtm() {
  if (typeof window === "undefined") return {};
  const u = new URLSearchParams(window.location.search);
  return {
    utm_source: u.get("utm_source") || "",
    utm_medium: u.get("utm_medium") || "",
    utm_campaign: u.get("utm_campaign") || "",
    utm_content: u.get("utm_content") || "",
    utm_term: u.get("utm_term") || "",
  };
}

function buildWhatsAppMessage({ name, phone, tierLabel, goal, utm }) {
  const lines = [
    "السلام عليكم 👋",
    "أريد حجز لقاء مبدئي مجاني.",
    "",
    `الاسم: ${name}`,
    `الجوّال: ${phone}`,
    `الباقة التي تهمّني: ${tierLabel}`,
  ];
  if (goal) lines.push(`الهدف: ${goal}`);
  if (utm.utm_source)
    lines.push(`المصدر: ${utm.utm_source}${utm.utm_campaign ? ` · ${utm.utm_campaign}` : ""}`);
  return lines.join("\n");
}

function fireGA4Lead({ tier, tierPrice, contentId }) {
  if (typeof window === "undefined" || !window.gtag) return;
  try {
    window.gtag("event", "generate_lead", {
      value: tierPrice || 0,
      currency: "SAR",
      form_id: contentId || FORM_CONTENT_ID,
      tier_id: tier,
    });
  } catch (e) {
    console.warn("[gtag] generate_lead failed (non-fatal):", e);
  }
}

// ────────────────────────────────────────────────────────────
// Modal component
// ────────────────────────────────────────────────────────────

export default function LeadFormModal() {
  // ALL HOOKS AT TOP — React #310
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tier, setTier] = useState("");
  const [goal, setGoal] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const dialogRef = useRef(null);
  const firstFieldRef = useRef(null);

  // Global click listener — any element with data-open-form opens the modal
  useEffect(() => {
    const onClick = (e) => {
      const trigger = e.target.closest("[data-open-form]");
      if (!trigger) return;
      e.preventDefault();
      const t = trigger.getAttribute("data-tier") || "";
      setTier(t);
      setOpen(true);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Esc key closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Lock body scroll while open + autofocus first field
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setTimeout(() => firstFieldRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Reset errors when closed
  useEffect(() => {
    if (!open) {
      setErrors({});
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  // Status-aware copy
  const regStatus = getRegistrationStatus();
  const isWaitlist = regStatus !== "open";
  const titleCopy = isWaitlist ? "احجز مقعدك للفترة القادمة" : FORM.title;
  const subCopy = isWaitlist
    ? `سنتواصل معك قريباً لإكمال حجزك.`
    : FORM.sub;
  const submitCopy = isWaitlist ? "أرسل واحجز للفترة القادمة ←" : FORM.submitLabel;
  const formContentId = isWaitlist ? "fluentia_waitlist_v2" : "fluentia_lead_form_v2";

  const close = () => setOpen(false);
  const onBackdropClick = (e) => {
    if (e.target === e.currentTarget) close();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const e1 = {};
    if (!name.trim()) e1.name = FORM.errors.nameRequired;
    if (!phone.trim()) e1.phone = FORM.errors.phoneRequired;
    else if (!isValidSaudiPhone(phone)) e1.phone = FORM.errors.phoneInvalid;
    if (Object.keys(e1).length) {
      setErrors(e1);
      return;
    }

    setSubmitting(true);
    const phoneE164 = normalizePhoneE164(phone) || `+966${phone.replace(/\D/g, "")}`;
    const selectedTier = FORM.tierOptions.find((t) => t.value === tier);
    const tierLabel = selectedTier?.label || "غير محدد";
    const tierPrice = selectedTier?.price || 0;
    const utm = readUtm();
    const eventId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 1. TikTok Pixel — identify() + SubmitForm + Lead + CompleteRegistration
    //    Uses existing module so context.user + event_id dedup are correct
    fireTikTokLeadEvents({
      phone: phoneE164,
      externalId: phoneE164,
      value: tierPrice,
      currency: "SAR",
      contentName: "Fluentia Registration",
      contentCategory: tier || "general",
      contentId: formContentId,
      eventIdBase: eventId,
    });

    // 2. GA4 generate_lead
    fireGA4Lead({ tier, tierPrice, contentId: formContentId });

    // 3. Supabase lead persistence (non-blocking)
    saveLead({
      name: name.trim(),
      phone: phoneE164,
      email: null,
      path: tier,
      pkg: tierLabel,
      goal: goal.trim() || null,
      source: utm.utm_source || "landing_v2",
    });

    // Build WhatsApp message and open after 250ms buffer for pixel beacon
    const message = buildWhatsAppMessage({
      name: name.trim(),
      phone: phoneE164,
      tierLabel,
      goal: goal.trim(),
      utm,
    });
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    setTimeout(() => {
      window.open(waUrl, "_blank", "noopener,noreferrer");
      setSubmitting(false);
      setName("");
      setPhone("");
      setGoal("");
      close();
    }, 250);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lp-form-title"
      onClick={onBackdropClick}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(10, 14, 26, 0.85)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--lp-space-md)",
        animation: "lp-fade-in 0.25s var(--lp-ease)",
      }}
    >
      <div
        ref={dialogRef}
        className="lp-scope"
        style={{
          background: "var(--lp-bg-elevated)",
          border: "1px solid var(--lp-border-amber)",
          borderRadius: "var(--lp-radius-lg)",
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "var(--lp-space-xl)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(251,191,36,0.12)",
          position: "relative",
          animation: "lp-slide-up 0.35s var(--lp-ease)",
        }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={close}
          aria-label="إغلاق"
          style={{
            position: "absolute",
            top: 12,
            insetInlineEnd: 12,
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--lp-bg-raised)",
            border: "1px solid var(--lp-border-subtle)",
            color: "var(--lp-text-muted)",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            lineHeight: 1,
          }}
        >
          ×
        </button>

        <h3
          id="lp-form-title"
          style={{
            fontFamily: "var(--lp-font-display)",
            fontSize: "var(--lp-h2)",
            fontWeight: 800,
            color: "var(--lp-text-strong)",
            margin: 0,
            marginBottom: "var(--lp-space-sm)",
            lineHeight: 1.2,
          }}
        >
          {titleCopy}
        </h3>

        {/* Waitlist mode pill */}
        {isWaitlist && (
          <div
            style={{
              paddingBlock: 8,
              paddingInline: 12,
              background: "rgba(251,191,36,0.08)",
              border: "1px solid var(--lp-border-amber)",
              borderRadius: "var(--lp-radius-tight)",
              color: "var(--lp-amber-bright)",
              fontFamily: "var(--lp-font-display)",
              fontSize: "var(--lp-caption)",
              fontWeight: 700,
              marginBottom: "var(--lp-space-sm)",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            🔒 التسجيل مقفل حالياً
          </div>
        )}

        <p
          style={{
            fontSize: "var(--lp-body-s)",
            color: "var(--lp-text-muted)",
            margin: 0,
            marginBottom: "var(--lp-space-xl)",
            lineHeight: 1.5,
          }}
        >
          {subCopy}
        </p>

        <form onSubmit={onSubmit} noValidate>
          {/* Name */}
          <Field label={FORM.fields.name.label} error={errors.name}>
            <input
              ref={firstFieldRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={FORM.fields.name.placeholder}
              autoComplete="name"
              style={inputStyle(!!errors.name)}
            />
          </Field>

          {/* Phone */}
          <Field label={FORM.fields.phone.label} error={errors.phone}>
            <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
              <span
                style={{
                  paddingBlock: 12,
                  paddingInline: 14,
                  background: "var(--lp-bg-raised)",
                  border: "1px solid var(--lp-border-subtle)",
                  borderInlineEnd: "none",
                  borderStartStartRadius: "var(--lp-radius-tight)",
                  borderEndStartRadius: "var(--lp-radius-tight)",
                  color: "var(--lp-text-muted)",
                  fontFamily: "var(--lp-font-num)",
                  fontSize: "var(--lp-body)",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                {FORM.fields.phone.prefix}
              </span>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={FORM.fields.phone.placeholder}
                autoComplete="tel-national"
                dir="ltr"
                style={{
                  ...inputStyle(!!errors.phone),
                  flex: 1,
                  borderStartStartRadius: 0,
                  borderEndStartRadius: 0,
                  textAlign: "left",
                  fontFamily: "var(--lp-font-num)",
                }}
              />
            </div>
          </Field>

          {/* Tier */}
          <Field label={FORM.fields.tier.label}>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              style={{ ...inputStyle(false), appearance: "none", cursor: "pointer" }}
            >
              <option value="">— اختر —</option>
              {FORM.tierOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                  {opt.recommended ? "  ⭐ موصى به" : ""}
                </option>
              ))}
            </select>
          </Field>

          {/* Goal */}
          <Field label={FORM.fields.goal.label}>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder={FORM.fields.goal.placeholder}
              rows={2}
              style={{
                ...inputStyle(false),
                resize: "vertical",
                minHeight: 56,
                fontFamily: "var(--lp-font-body)",
              }}
            />
          </Field>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              marginTop: "var(--lp-space-md)",
              paddingBlock: 16,
              background: "linear-gradient(135deg, var(--lp-amber-bright), var(--lp-amber))",
              color: "#0a0e1a",
              fontFamily: "var(--lp-font-display)",
              fontSize: "var(--lp-body-l)",
              fontWeight: 800,
              border: "none",
              borderRadius: "var(--lp-radius-pill)",
              cursor: submitting ? "wait" : "pointer",
              boxShadow: "var(--lp-shadow-amber-strong)",
              opacity: submitting ? 0.7 : 1,
              transition: "transform var(--lp-dur-fast) var(--lp-ease)",
            }}
            onMouseEnter={(e) => {
              if (!submitting) e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {submitting ? "جاري الإرسال…" : submitCopy}
          </button>

          <p
            style={{
              marginTop: "var(--lp-space-md)",
              fontSize: "var(--lp-caption)",
              color: "var(--lp-text-faint)",
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            {FORM.privacy}
          </p>
        </form>
      </div>

      <style>{`
        @keyframes lp-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes lp-slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Form primitives
// ────────────────────────────────────────────────────────────

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: "var(--lp-space-md)" }}>
      <label
        style={{
          display: "block",
          fontFamily: "var(--lp-font-display)",
          fontSize: "var(--lp-body-s)",
          fontWeight: 700,
          color: "var(--lp-text-strong)",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      {children}
      {error && (
        <div
          style={{
            color: "var(--lp-danger)",
            fontSize: "var(--lp-caption)",
            marginTop: 6,
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

function inputStyle(hasError) {
  return {
    width: "100%",
    paddingBlock: 12,
    paddingInline: 14,
    background: "var(--lp-bg-base)",
    border: hasError ? "1px solid var(--lp-danger)" : "1px solid var(--lp-border-subtle)",
    borderRadius: "var(--lp-radius-tight)",
    color: "var(--lp-text-strong)",
    fontFamily: "var(--lp-font-body)",
    fontSize: "var(--lp-body)",
    outline: "none",
    transition: "border-color var(--lp-dur-fast) var(--lp-ease)",
  };
}
