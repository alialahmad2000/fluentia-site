import { useEffect, useState } from "react";
import { REGISTRATION, getRegistrationStatus } from "./content";

export default function RegistrationStatusBanner() {
  // ALL HOOKS AT TOP — React #310
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const status = getRegistrationStatus(new Date(now));
  const opens = new Date(REGISTRATION.nextWindow.opens);
  const closes = new Date(REGISTRATION.nextWindow.closes);
  const target = status === "closed_before" ? opens : closes;
  const diff = Math.max(0, target.getTime() - now);
  const { days, hours, mins, secs } = breakdownMs(diff);

  const theme = {
    closed_before: {
      bg: "linear-gradient(90deg, rgba(239,68,68,0.18), rgba(251,191,36,0.18))",
      border: "rgba(239,68,68,0.4)",
      label: "🔒 مقاعد هذا الشهر ممتلئة",
      action: `النافذة القادمة: ٢٣-٢٧ مايو · ${REGISTRATION.nextWindow.cohortStartLabel}`,
      ctaLabel: "احجز للنافذة القادمة",
      timerPrefix: "تفتح خلال",
    },
    open: {
      bg: "linear-gradient(90deg, rgba(74,222,128,0.18), rgba(251,191,36,0.25))",
      border: "rgba(251,191,36,0.5)",
      label: "🟢 التسجيل مفتوح الآن",
      action: `لمدة محدودة · ${REGISTRATION.nextWindow.cohortStartLabel}`,
      ctaLabel: "احجز مقعدك الآن",
      timerPrefix: "يُغلق خلال",
    },
    closed_after: {
      bg: "linear-gradient(90deg, rgba(248,250,252,0.05), rgba(251,191,36,0.10))",
      border: "rgba(248,250,252,0.15)",
      label: "🔒 التسجيل مقفل",
      action: "النافذة القادمة قريباً — احجز اهتمامك",
      ctaLabel: "احجز اهتمامك",
      timerPrefix: "",
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
        padding: "10px clamp(12px, 4vw, 32px)",
        direction: "rtl",
      }}
    >
      <div
        style={{
          maxWidth: "var(--lp-max-w)",
          marginInline: "auto",
          display: "flex",
          alignItems: "center",
          gap: "var(--lp-space-md)",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
        className="lp-banner-row"
      >
        {/* Status label */}
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

        {/* Action / window info */}
        <span
          style={{
            fontSize: "var(--lp-body-s)",
            color: "var(--lp-text)",
            fontWeight: 500,
          }}
        >
          {theme.action}
        </span>

        {/* Countdown — only when active */}
        {status !== "closed_after" && (
          <>
            <Separator />
            <Countdown
              prefix={theme.timerPrefix}
              days={days}
              hours={hours}
              mins={mins}
              secs={secs}
            />
          </>
        )}

        {/* Inline CTA */}
        <Separator className="lp-sep-hide-mobile" />
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

      <style>{`
        @media (max-width: 700px) {
          .lp-banner-row { gap: 8px !important; }
          .lp-sep-hide-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function Separator({ className }) {
  return (
    <span
      aria-hidden
      className={className}
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

function Countdown({ prefix, days, hours, mins, secs }) {
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
      <Cell n={secs} label="ث" />
    </span>
  );
}

function Cell({ n, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 2 }}>
      <span style={{ minWidth: "1.5ch", textAlign: "center", color: "var(--lp-text-strong)" }}>
        {String(n).padStart(2, "0")}
      </span>
      <span style={{ fontSize: 10, color: "var(--lp-text-muted)", fontWeight: 500 }}>
        {label}
      </span>
    </span>
  );
}

function breakdownMs(ms) {
  const days  = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const mins  = Math.floor((ms % 3600000) / 60000);
  const secs  = Math.floor((ms % 60000) / 1000);
  return { days, hours, mins, secs };
}
