import React, { useState, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { buildWhatsAppUrl } from "../../lib/whatsapp";
import { fireTikTokLeadEvents } from "../../lib/tiktokPixel";
import { EASE_REVEAL } from "./atelier.tokens";

// ============================================================================
// AtelierLeadModal — Velvet Midnight lead capture for the /atelier page.
// Opened via window event "open-lead-form" (any CTA dispatches it).
// Replicates the live LeadFormModal flow EXACTLY (tracking parity is sacred):
// builds the same WhatsApp message, fires TikTok Lead/Contact/CompleteReg,
// GA4 generate_lead + Ads conversion, and inserts the lead into Supabase.
// ============================================================================

const SUPABASE_URL = "https://nmjexpuycmqcxuxljier.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tamV4cHV5Y21xY3h1eGxqaWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMjU2MTgsImV4cCI6MjA4ODcwMTYxOH0.Lznjnw2Pmrr04tFjQD6hRfWp-12JlRagZaCmo59KG8A";

const PATHS = ["تأسيس", "تطوير", "IELTS"];

function buildLeadMessage(form) {
  const lines = [
    "السلام عليكم، أبي أحجز لقاء مبدئي مجاني",
    `الاسم: ${form.name || "—"}`,
    `العمر: ${form.age || "—"}`,
    `المسار: ${form.path || "—"}`,
    `الباقة: ${form.pkg || "—"}`,
    `الهدف: ${form.goal || "—"}`,
  ];
  const utm = (() => {
    try {
      return (
        new URLSearchParams(window.location.search).get("utm_source") ||
        sessionStorage.getItem("utm_source") ||
        "مباشر"
      );
    } catch {
      return "مباشر";
    }
  })();
  lines.push(`المصدر: ${utm}`);
  return buildWhatsAppUrl(lines.join("\n"));
}

async function saveLead(form) {
  try {
    const p = new URLSearchParams(window.location.search);
    await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        name: form.name || null,
        path: form.path || null,
        pkg: form.pkg || null,
        goal: form.goal || null,
        source: "atelier_lead",
        utm_source: p.get("utm_source") || null,
        utm_medium: p.get("utm_medium") || null,
        utm_campaign: p.get("utm_campaign") || null,
      }),
    });
  } catch {}
}

const field = {
  width: "100%",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid var(--hairline)",
  borderRadius: "12px",
  padding: "13px 15px",
  color: "var(--white)",
  fontFamily: "var(--body-ar)",
  fontSize: "15px",
  outline: "none",
};

export default function AtelierLeadModal() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", age: "", path: "", pkg: "", goal: "" });
  const reduce = useReducedMotion();

  useEffect(() => {
    const onOpen = (e) => {
      setForm((f) => ({ ...f, pkg: e.detail?.pkg || "" }));
      setOpen(true);
    };
    window.addEventListener("open-lead-form", onOpen);
    return () => window.removeEventListener("open-lead-form", onOpen);
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const u = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name.trim()) { alert("اكتب اسمك"); return; }
    const eventId = `lead_${Date.now()}`;
    await fireTikTokLeadEvents({
      contentName: "Fluentia Lead",
      contentCategory: form.path || "general",
      eventIdBase: eventId,
    });
    if (window.gtag) {
      window.gtag("event", "generate_lead", {
        event_category: "atelier",
        event_label: form.path || "general",
        value: 1,
      });
      window.gtag("event", "conversion", {
        send_to: "AW-9314838750",
        value: 1.0,
        currency: "SAR",
      });
    }
    saveLead(form);
    window.open(buildLeadMessage(form), "_blank");
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          onClick={() => setOpen(false)}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 3000,
            background: "rgba(6,14,28,0.86)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={reduce ? false : { opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.5, ease: EASE_REVEAL }}
            role="dialog"
            aria-modal="true"
            aria-label="حجز لقاء مبدئي مجاني"
            style={{
              width: "100%",
              maxWidth: "440px",
              background: "linear-gradient(180deg, var(--nv), var(--nd))",
              border: "1px solid var(--hairline-gold)",
              borderRadius: "22px",
              padding: "30px 26px",
              maxHeight: "92vh",
              overflowY: "auto",
              boxShadow: "0 40px 120px -40px rgba(0,0,0,0.9)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
              <div>
                <div className="at-eyebrow" style={{ marginBottom: "8px" }}>لقاء مبدئي مجاني</div>
                <h3 style={{ fontFamily: "var(--display-ar)", fontSize: "22px", color: "var(--cream)" }}>
                  احجز لقاءك مع المدرب
                </h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="إغلاق"
                style={{ background: "none", border: "none", color: "var(--muted)", fontSize: "22px", cursor: "pointer", lineHeight: 1, marginTop: "-4px" }}
              >
                ✕
              </button>
            </div>

            <p className="at-meta" style={{ marginBottom: "20px", lineHeight: 1.7 }}>
              اكتب بياناتك ونكمل على واتساب — نفهم مستواك وهدفك بدون أي التزام.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input
                style={field}
                placeholder="الاسم *"
                value={form.name}
                onChange={(e) => u("name", e.target.value)}
              />
              <input
                style={field}
                placeholder="العمر (اختياري)"
                inputMode="numeric"
                value={form.age}
                onChange={(e) => u("age", e.target.value)}
              />

              <div>
                <div className="at-meta" style={{ marginBottom: "8px" }}>المسار</div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {PATHS.map((p) => {
                    const active = form.path === p;
                    return (
                      <button
                        key={p}
                        onClick={() => u("path", active ? "" : p)}
                        style={{
                          flex: "1 1 auto",
                          padding: "10px 12px",
                          borderRadius: "100px",
                          cursor: "pointer",
                          fontFamily: "var(--ui)",
                          fontSize: "14px",
                          fontWeight: 500,
                          border: active ? "1px solid var(--hairline-gold)" : "1px solid var(--hairline)",
                          background: active ? "rgba(251,191,36,0.10)" : "rgba(255,255,255,0.02)",
                          color: active ? "var(--gold)" : "var(--soft)",
                          transition: "all 0.25s ease",
                        }}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {form.pkg && (
                <div className="at-meta" style={{ color: "var(--sky-light)" }}>
                  الباقة المختارة: {form.pkg}
                </div>
              )}

              <textarea
                style={{ ...field, minHeight: "70px", resize: "vertical" }}
                placeholder="هدفك من تعلم الإنجليزي (اختياري)"
                value={form.goal}
                onChange={(e) => u("goal", e.target.value)}
              />

              <button
                className="at-cta at-cta--primary"
                style={{ justifyContent: "center", width: "100%", marginTop: "4px" }}
                onClick={submit}
              >
                أكمل على واتساب ←
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
