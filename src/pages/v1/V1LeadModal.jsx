import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FORM } from "../landing-v2/content";
import { fireTikTokLeadEvents, normalizePhoneE164 } from "../../lib/tiktokPixel";
import { saveLead } from "../../utils/tracking";
import { EASE } from "./motion";
import BrandMark from "../../components/BrandMark";

/**
 * V1LeadModal — identical tracking flow to the live LeadFormModal
 * (TikTok identify+3 events → GA4 generate_lead → Supabase lead →
 * WhatsApp handoff), restyled in the V1 Obsidian Azure language.
 * Opens from any [data-open-form] element; data-tier preselects.
 */

const WHATSAPP_NUMBER = "966558669974";
const FORM_CONTENT_ID = "fluentia_lead_form_v1";

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

function fireGA4Lead({ tier, tierPrice }) {
  if (typeof window === "undefined" || !window.gtag) return;
  try {
    window.gtag("event", "generate_lead", {
      value: tierPrice || 0,
      currency: "SAR",
      form_id: FORM_CONTENT_ID,
      tier_id: tier,
    });
  } catch (e) {
    console.warn("[gtag] generate_lead failed (non-fatal):", e);
  }
}

export default function V1LeadModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tier, setTier] = useState("");
  const [goal, setGoal] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const firstFieldRef = useRef(null);

  // Any [data-open-form] element opens the modal
  useEffect(() => {
    const onClick = (e) => {
      const trigger = e.target.closest("[data-open-form]");
      if (!trigger) return;
      e.preventDefault();
      setTier(trigger.getAttribute("data-tier") || "");
      setOpen(true);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setTimeout(() => firstFieldRef.current?.focus(), 60);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setErrors({});
      setSubmitting(false);
    }
  }, [open]);

  const close = () => setOpen(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const e1 = {};
    if (!name.trim()) e1.name = FORM.errors.nameRequired;
    if (!phone.trim()) e1.phone = FORM.errors.phoneRequired;
    else if (!isValidSaudiPhone(phone)) e1.phone = FORM.errors.phoneInvalid;
    if (Object.keys(e1).length) return setErrors(e1);

    setSubmitting(true);
    const phoneE164 = normalizePhoneE164(phone) || `+966${phone.replace(/\D/g, "")}`;
    const selectedTier = FORM.tierOptions.find((t) => t.value === tier);
    const tierLabel = selectedTier?.label || "غير محدد";
    const tierPrice = selectedTier?.price || 0;
    const utm = readUtm();
    const eventId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    fireTikTokLeadEvents({
      phone: phoneE164,
      externalId: phoneE164,
      value: tierPrice,
      currency: "SAR",
      contentName: "Fluentia Registration",
      contentCategory: tier || "general",
      contentId: FORM_CONTENT_ID,
      eventIdBase: eventId,
    });
    fireGA4Lead({ tier, tierPrice });
    saveLead({
      name: name.trim(),
      phone: phoneE164,
      email: null,
      path: tier,
      pkg: tierLabel,
      goal: goal.trim() || null,
      source: utm.utm_source || "landing_v1",
    });

    const message = buildWhatsAppMessage({ name: name.trim(), phone: phoneE164, tierLabel, goal: goal.trim(), utm });
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
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="v1-form-title"
          onClick={(e) => e.target === e.currentTarget && close()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="v1-scope"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 300,
            background: "rgba(4, 7, 14, 0.82)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 18,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            style={{
              width: "100%",
              maxWidth: 500,
              maxHeight: "min(92vh, 92dvh)",
              overflowY: "auto",
              borderRadius: "var(--v1-r-lg)",
              border: "1px solid var(--v1-line-azure)",
              background: "linear-gradient(175deg, #0c1526, #060b16)",
              boxShadow: "0 40px 120px rgba(0,0,0,0.7), 0 0 80px rgba(56,189,248,0.1)",
              padding: "clamp(26px, 4vw, 38px)",
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={close}
              aria-label="إغلاق"
              style={{
                position: "absolute", top: 10, insetInlineEnd: 10,
                width: 44, height: 44, borderRadius: "50%",
                background: "rgba(148,197,255,0.06)", border: "1px solid var(--v1-line)",
                color: "var(--v1-t-mute)", cursor: "pointer", fontSize: 17, lineHeight: 1,
              }}
            >
              ×
            </button>

            <BrandMark size={34} style={{ marginBottom: 16 }} />
            <h3 id="v1-form-title" style={{ fontFamily: "var(--v1-display)", fontSize: "1.5rem", fontWeight: 800, color: "var(--v1-t-strong)", margin: 0, lineHeight: 1.5 }}>
              {FORM.title}
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--v1-t-mute)", margin: "10px 0 26px", lineHeight: 1.9, fontWeight: 300 }}>
              {FORM.sub}
            </p>

            <form onSubmit={onSubmit} noValidate>
              <Field label={FORM.fields.name.label} error={errors.name}>
                <input
                  ref={firstFieldRef}
                  type="text"
                  className="v1-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={FORM.fields.name.placeholder}
                  autoComplete="name"
                  style={errors.name ? { borderColor: "var(--v1-red)" } : undefined}
                />
              </Field>

              <Field label={FORM.fields.phone.label} error={errors.phone}>
                <div style={{ display: "flex" }}>
                  <span className="v1-num" dir="ltr" style={{
                    display: "inline-flex", alignItems: "center", padding: "0 15px",
                    background: "rgba(148,197,255,0.07)", border: "1px solid var(--v1-line)", borderInlineEnd: "none",
                    borderStartStartRadius: "var(--v1-r-sm)", borderEndStartRadius: "var(--v1-r-sm)",
                    color: "var(--v1-t-mute)", fontSize: "0.95rem", fontWeight: 600,
                  }}>
                    {FORM.fields.phone.prefix}
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    className="v1-input v1-num"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={FORM.fields.phone.placeholder}
                    autoComplete="tel-national"
                    dir="ltr"
                    style={{
                      flex: 1, borderStartStartRadius: 0, borderEndStartRadius: 0, textAlign: "left",
                      ...(errors.phone ? { borderColor: "var(--v1-red)" } : {}),
                    }}
                  />
                </div>
              </Field>

              <Field label={FORM.fields.tier.label}>
                <div style={{ position: "relative" }}>
                  <select
                    className="v1-input"
                    value={tier}
                    onChange={(e) => setTier(e.target.value)}
                    style={{ appearance: "none", cursor: "pointer", paddingInlineEnd: 42 }}
                  >
                    <option value="">— اختر —</option>
                    {FORM.tierOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                        {opt.recommended ? "  ⭐ موصى به" : ""}
                      </option>
                    ))}
                  </select>
                  <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden
                    style={{ position: "absolute", insetInlineEnd: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                  >
                    <path d="M6 9l6 6 6-6" stroke="var(--v1-t-mute)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </Field>

              <Field label={FORM.fields.goal.label}>
                <textarea
                  className="v1-input"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder={FORM.fields.goal.placeholder}
                  rows={2}
                  style={{ resize: "none", minHeight: 58 }}
                />
              </Field>

              <button
                type="submit"
                disabled={submitting}
                className="v1-cta v1-cta-primary"
                style={{ width: "100%", marginTop: 8, opacity: submitting ? 0.7 : 1, cursor: submitting ? "wait" : "pointer" }}
              >
                {submitting ? "جاري الإرسال…" : FORM.submitLabel}
              </button>

              <p style={{ marginTop: 16, fontSize: "0.76rem", color: "var(--v1-t-faint)", textAlign: "center", lineHeight: 1.8 }}>
                {FORM.privacy}
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontFamily: "var(--v1-display)", fontSize: "0.86rem", fontWeight: 600, color: "var(--v1-t)", marginBottom: 8 }}>
        {label}
      </label>
      {children}
      {error && (
        <div style={{ color: "var(--v1-red)", fontSize: "0.78rem", marginTop: 7, fontWeight: 600 }}>{error}</div>
      )}
    </div>
  );
}
