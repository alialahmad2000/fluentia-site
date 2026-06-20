import { useEffect, useState } from "react";
import { REGISTRATION, getRegistrationStatus } from "./content";

/**
 * RegistrationStatusBanner
 *
 * Two completely separate layouts driven by CSS media query:
 *  - DESKTOP (>700px): single horizontal row with all info + inline CTA pill
 *  - MOBILE  (≤700px): compact vertical stack, 1-2 lines, NO CTA
 *
 * The mobile layout intentionally omits the CTA because the sticky LandingHeader
 * already provides 'ابدأ بمحادثة' on mobile. Duplicating CTAs in the banner caused
 * visual competition and a 'rushed/unprofessional' feel on phones.
 *
 * Status auto-derives from REGISTRATION.nextWindow dates (see content.js).
 * Countdown updates every 60 seconds (LP-7 change — no ticking-seconds timebomb feel).
 */
export default function RegistrationStatusBanner() {
  // ALL HOOKS AT TOP — React #310
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  const status = getRegistrationStatus(new Date(now));
  const opens = new Date(REGISTRATION.nextWindow.opens);
  const closes = new Date(REGISTRATION.nextWindow.closes);
  const target = status === "closed_before" ? opens : closes;
  const diff = Math.max(0, target.getTime() - now);
  const { days, hours, mins } = breakdownMs(diff);

  // Theme + copy — three states
  const theme = {
    closed_before: {
      bg: "linear-gradient(90deg, rgba(248,250,252,0.04), rgba(251,191,36,0.10))",
      border: "var(--lp-border-amber)",
      // Desktop copy (full)
      label: "🔒 التسجيل مقفل حالياً",
      action: "فترة التسجيل القادمة قريباً",
      ctaLabel: "تواصل للتسجيل القادم",
      timerPrefix: "تفتح بعد",
      // Mobile copy (short)
      mobileLine1: "🔒 التسجيل القادم قريباً",
      mobileTimerPrefix: "تفتح بعد",
      showTimer: false,
    },
    open: {
      bg: "linear-gradient(90deg, rgba(74,222,128,0.10), rgba(251,191,36,0.15))",
      border: "rgba(251,191,36,0.4)",
      label: "🟢 التسجيل مفتوح",
      action: "تسجيل شهري · مقاعد محدودة لكل مجموعة",
      ctaLabel: "تواصل مع المدرّب",
      timerPrefix: "",
      mobileLine1: "🟢 التسجيل مفتوح · مقاعد محدودة",
      mobileTimerPrefix: "",
      showTimer: false,
    },
    closed_after: {
      bg: "linear-gradient(90deg, rgba(248,250,252,0.05), rgba(251,191,36,0.05))",
      border: "rgba(248,250,252,0.15)",
      label: "🔒 التسجيل مقفل",
      action: "فترة التسجيل القادمة قريباً",
      ctaLabel: "تواصل للاستفسار",
      timerPrefix: "",
      mobileLine1: "🔒 التسجيل مقفل · الفترة القادمة قريباً",
      mobileTimerPrefix: "",
      showTimer: false,
    },
  }[status];

  return (
    <div
      role="banner"
      style={{
        position: "relative",
        zIndex: 99,
        background: theme.bg,
        borderBottom: `1px solid ${theme.border}`,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        direction: "rtl",
      }}
    >
      {/* ───────────── DESKTOP LAYOUT (>700px) ───────────── */}
      <div
        className="lp-banner-desktop"
        style={{
          maxWidth: "var(--lp-max-w)",
          marginInline: "auto",
          padding: "10px clamp(12px, 4vw, 32px)",
          display: "flex",
          alignItems: "center",
          gap: "var(--lp-space-md)",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--lp-font-display)",
            fontSize: "var(--lp-body-s)",
            fontWeight: 800,
            color: "var(--lp-text-strong)",
            letterSpacing: "0.02em",
            whiteSpace: "nowrap",
          }}
        >
          {theme.label}
        </span>

        <Separator />

        <span
          style={{
            fontSize: "var(--lp-body-s)",
            color: "var(--lp-text)",
            fontWeight: 500,
          }}
        >
          {theme.action}
        </span>

        {theme.showTimer && (
          <>
            <Separator />
            <Countdown prefix={theme.timerPrefix} days={days} hours={hours} mins={mins} />
          </>
        )}

        <Separator />

        <a
          data-open-form="true"
          style={{
            paddingBlock: 6,
            paddingInline: 14,
            background: "linear-gradient(135deg, var(--lp-amber-bright), var(--lp-amber))",
            color: "#0a0e1a",
            fontFamily: "var(--lp-font-display)",
            fontSize: "var(--lp-caption)",
            fontWeight: 800,
            borderRadius: "var(--lp-radius-pill)",
            textDecoration: "none",
            cursor: "pointer",
            boxShadow: "0 2px 12px rgba(251,191,36,0.4)",
            whiteSpace: "nowrap",
          }}
        >
          {theme.ctaLabel} ←
        </a>
      </div>

      {/* ───────────── MOBILE LAYOUT (≤700px) ───────────── */}
      <div
        className="lp-banner-mobile"
        style={{
          display: "none",
          maxWidth: "var(--lp-max-w)",
          marginInline: "auto",
          padding: "7px 14px",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--lp-font-display)",
            fontSize: "12px",
            fontWeight: 700,
            color: "var(--lp-text-strong)",
            letterSpacing: "0.01em",
            lineHeight: 1.4,
          }}
        >
          {theme.mobileLine1}
        </span>
        {theme.showTimer && (
          <span
            style={{
              fontFamily: "var(--lp-font-num)",
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--lp-amber-bright)",
              letterSpacing: "0.02em",
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1.3,
            }}
          >
            <span style={{ color: "var(--lp-text-muted)", fontWeight: 500, marginInlineEnd: 4 }}>
              {theme.mobileTimerPrefix}
            </span>
            <MobileTimerCells days={days} hours={hours} mins={mins} />
          </span>
        )}
      </div>

      {/* Media query — swap layouts at 700px */}
      <style>{`
        @media (max-width: 700px) {
          .lp-banner-desktop {
            display: none !important;
          }
          .lp-banner-mobile {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────

function Separator() {
  return (
    <span
      aria-hidden
      style={{
        width: 4,
        height: 4,
        borderRadius: "50%",
        background: "var(--lp-text-faint)",
        opacity: 0.5,
        flexShrink: 0,
      }}
    />
  );
}

function Countdown({ prefix, days, hours, mins }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "var(--lp-font-num)",
        fontSize: "var(--lp-body-s)",
        fontWeight: 700,
        color: "var(--lp-amber-bright)",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <span style={{ fontWeight: 500, opacity: 0.85 }}>{prefix}</span>
      <Cell n={days} label="ي" />
      <Cell n={hours} label="س" />
      <Cell n={mins} label="د" />
    </span>
  );
}

function Cell({ n, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 2 }}>
      <span
        style={{
          minWidth: "1.5ch",
          textAlign: "center",
          color: "var(--lp-text-strong)",
        }}
      >
        {String(n).padStart(2, "0")}
      </span>
      <span style={{ fontSize: 10, color: "var(--lp-text-muted)", fontWeight: 500 }}>
        {label}
      </span>
    </span>
  );
}

/** Tighter inline timer used inside the mobile banner. */
function MobileTimerCells({ days, hours, mins }) {
  return (
    <span style={{ display: "inline-flex", gap: 5, alignItems: "baseline" }}>
      <MiniCell n={days} label="ي" />
      <MiniCell n={hours} label="س" />
      <MiniCell n={mins} label="د" />
    </span>
  );
}

function MiniCell({ n, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 1 }}>
      <span style={{ color: "var(--lp-text-strong)", fontWeight: 700 }}>
        {String(n).padStart(2, "0")}
      </span>
      <span style={{ fontSize: 9, color: "var(--lp-text-muted)", fontWeight: 500 }}>
        {label}
      </span>
    </span>
  );
}

function breakdownMs(ms) {
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  return { days, hours, mins };
}
