import { MOCKUP } from "./content";

export default function LMSMockup() {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 620,
        marginInline: "auto",
        perspective: "1200px",
      }}
    >
      {/* Glow behind */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: "-40px",
          background:
            "radial-gradient(ellipse at center, rgba(251,191,36,0.18), transparent 60%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      {/* Browser chrome */}
      <div
        style={{
          position: "relative",
          background: "var(--lp-bg-elevated)",
          border: "1px solid var(--lp-border-bold)",
          borderRadius: "var(--lp-radius-lg)",
          overflow: "hidden",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.55), 0 8px 32px rgba(251,191,36,0.12)",
          transform: "rotateY(-3deg) rotateX(2deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Top bar — three dots + URL */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--lp-space-md)",
            paddingBlock: "12px",
            paddingInline: "16px",
            background: "var(--lp-bg-raised)",
            borderBottom: "1px solid var(--lp-border-subtle)",
            direction: "ltr",
          }}
        >
          <span style={{ display: "flex", gap: 6 }}>
            <Dot color="#ef4444" />
            <Dot color="#fbbf24" />
            <Dot color="#22c55e" />
          </span>
          <span
            style={{
              flex: 1,
              maxWidth: 300,
              marginInline: "auto",
              paddingBlock: "4px",
              paddingInline: "12px",
              background: "var(--lp-bg-base)",
              border: "1px solid var(--lp-border-subtle)",
              borderRadius: "var(--lp-radius-pill)",
              color: "var(--lp-text-muted)",
              fontFamily: "var(--lp-font-num)",
              fontSize: "var(--lp-caption)",
              textAlign: "center",
            }}
          >
            🔒 app.fluentia.academy
          </span>
        </div>

        {/* Dashboard body */}
        <div
          style={{
            padding: "var(--lp-space-lg)",
            display: "grid",
            gap: "var(--lp-space-md)",
            direction: "rtl",
          }}
        >
          {/* Greeting + week progress */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--lp-space-md)",
              padding: "var(--lp-space-md)",
              background: "var(--lp-bg-raised)",
              border: "1px solid var(--lp-border-subtle)",
              borderRadius: "var(--lp-radius-card)",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--lp-font-display)",
                  fontWeight: 800,
                  fontSize: "var(--lp-body-l)",
                  color: "var(--lp-text-strong)",
                }}
              >
                {MOCKUP.greeting}
              </div>
              <div
                style={{
                  fontSize: "var(--lp-body-s)",
                  color: "var(--lp-text-muted)",
                  marginTop: 2,
                }}
              >
                {MOCKUP.weekProgress.label}
              </div>
            </div>
            <ProgressOrb pct={MOCKUP.weekProgress.value} />
          </div>

          {/* Three cards row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr 1fr",
              gap: "var(--lp-space-sm)",
            }}
          >
            {/* Next Unit (wider) */}
            <MockCard accent="amber">
              <CardLabel>{MOCKUP.nextUnit.label}</CardLabel>
              <div
                style={{
                  fontFamily: "var(--lp-font-display)",
                  fontWeight: 800,
                  fontSize: "var(--lp-body)",
                  color: "var(--lp-text-strong)",
                  marginTop: 4,
                }}
              >
                {MOCKUP.nextUnit.title}
              </div>
              <div
                style={{
                  fontSize: "var(--lp-caption)",
                  color: "var(--lp-text-muted)",
                  marginTop: 4,
                }}
              >
                {MOCKUP.nextUnit.chapter}
              </div>
              <ProgressBar pct={MOCKUP.nextUnit.progress} />
            </MockCard>

            {/* Vocab */}
            <MockCard>
              <CardLabel>{MOCKUP.vocab.label}</CardLabel>
              <div
                style={{
                  fontFamily: "var(--lp-font-num)",
                  fontWeight: 800,
                  fontSize: "1.5rem",
                  color: "var(--lp-amber)",
                  marginTop: 4,
                  lineHeight: 1,
                }}
              >
                {MOCKUP.vocab.count}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "var(--lp-text-faint)",
                  marginTop: 4,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 4,
                  direction: "ltr",
                }}
              >
                {MOCKUP.vocab.sample.map((w, i) => (
                  <span
                    key={i}
                    style={{
                      paddingBlock: 2,
                      paddingInline: 6,
                      background: "var(--lp-bg-base)",
                      borderRadius: 4,
                      border: "1px solid var(--lp-border-subtle)",
                    }}
                  >
                    {w}
                  </span>
                ))}
              </div>
            </MockCard>

            {/* Live class */}
            <MockCard>
              <CardLabel>{MOCKUP.liveClass.label}</CardLabel>
              <div
                style={{
                  fontFamily: "var(--lp-font-display)",
                  fontWeight: 700,
                  fontSize: "var(--lp-body-s)",
                  color: "var(--lp-text-strong)",
                  marginTop: 4,
                }}
              >
                {MOCKUP.liveClass.when}
              </div>
              <div
                style={{
                  fontSize: "var(--lp-caption)",
                  color: "var(--lp-text-muted)",
                  marginTop: 4,
                }}
              >
                مع {MOCKUP.liveClass.trainer}
              </div>
            </MockCard>
          </div>

          {/* AI Feedback panel */}
          <div
            style={{
              padding: "var(--lp-space-md)",
              background:
                "linear-gradient(135deg, rgba(251,191,36,0.10), rgba(251,191,36,0.02))",
              border: "1px solid var(--lp-border-amber)",
              borderRadius: "var(--lp-radius-card)",
              display: "grid",
              gridTemplateColumns: "auto 1fr auto",
              alignItems: "center",
              gap: "var(--lp-space-md)",
            }}
          >
            <ScoreCircle score={MOCKUP.feedback.score} />
            <div>
              <div
                style={{
                  fontSize: "var(--lp-caption)",
                  color: "var(--lp-amber-bright)",
                  fontFamily: "var(--lp-font-display)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {MOCKUP.feedback.title}
              </div>
              <div
                style={{
                  fontFamily: "var(--lp-font-display)",
                  fontWeight: 700,
                  fontSize: "var(--lp-body)",
                  color: "var(--lp-text-strong)",
                  marginTop: 2,
                }}
              >
                {MOCKUP.feedback.note}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                paddingBlock: 4,
                paddingInline: 10,
                background: "rgba(74,222,128,0.15)",
                borderRadius: "var(--lp-radius-pill)",
                color: "var(--lp-success)",
                fontFamily: "var(--lp-font-num)",
                fontSize: "var(--lp-caption)",
                fontWeight: 700,
              }}
            >
              {MOCKUP.feedback.improvement}
            </div>
          </div>

          {/* XP footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--lp-space-md)",
              padding: "10px var(--lp-space-md)",
              background: "var(--lp-bg-base)",
              border: "1px solid var(--lp-border-subtle)",
              borderRadius: "var(--lp-radius-card)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14 }}>⚡</span>
              <span
                style={{
                  fontFamily: "var(--lp-font-num)",
                  fontWeight: 700,
                  color: "var(--lp-text-strong)",
                  fontSize: "var(--lp-body-s)",
                }}
              >
                {MOCKUP.xp.value.toLocaleString("en")} XP
              </span>
            </div>
            <div
              style={{
                fontSize: "var(--lp-caption)",
                color: "var(--lp-text-muted)",
              }}
            >
              المركز <span style={{ color: "var(--lp-amber)", fontWeight: 700 }}>#{MOCKUP.xp.rank}</span> هذا الأسبوع
            </div>
          </div>
        </div>
      </div>

      {/* Floating notification */}
      <FloatingToast />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Mockup primitives
// ────────────────────────────────────────────────────────────

function Dot({ color }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: color,
      }}
    />
  );
}

function MockCard({ accent, children }) {
  return (
    <div
      style={{
        padding: "var(--lp-space-sm) var(--lp-space-md)",
        background: "var(--lp-bg-raised)",
        border:
          accent === "amber"
            ? "1px solid var(--lp-border-amber)"
            : "1px solid var(--lp-border-subtle)",
        borderRadius: "var(--lp-radius-card)",
        minHeight: 80,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {children}
    </div>
  );
}

function CardLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 10,
        color: "var(--lp-text-muted)",
        fontFamily: "var(--lp-font-display)",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      {children}
    </div>
  );
}

function ProgressBar({ pct }) {
  return (
    <div
      style={{
        marginTop: "var(--lp-space-sm)",
        height: 4,
        background: "var(--lp-bg-base)",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: "linear-gradient(90deg, var(--lp-amber), var(--lp-amber-bright))",
        }}
      />
    </div>
  );
}

function ProgressOrb({ pct }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <div style={{ position: "relative", width: 56, height: 56 }}>
      <svg width={56} height={56} viewBox="0 0 56 56">
        <circle cx={28} cy={28} r={r} fill="none" stroke="var(--lp-bg-base)" strokeWidth={5} />
        <circle
          cx={28}
          cy={28}
          r={r}
          fill="none"
          stroke="var(--lp-amber)"
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform="rotate(-90 28 28)"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--lp-font-num)",
          fontWeight: 800,
          fontSize: "var(--lp-body-s)",
          color: "var(--lp-text-strong)",
        }}
      >
        {pct}%
      </div>
    </div>
  );
}

function ScoreCircle({ score }) {
  return (
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: "50%",
        background:
          "conic-gradient(var(--lp-amber) 0deg, var(--lp-amber-bright) 280deg, var(--lp-bg-base) 280deg 360deg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "var(--lp-bg-elevated)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--lp-font-num)",
          fontWeight: 800,
          fontSize: "var(--lp-body)",
          color: "var(--lp-text-strong)",
        }}
      >
        {score}
      </div>
    </div>
  );
}

function FloatingToast() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: -22,
        insetInlineStart: -20,
        paddingBlock: 10,
        paddingInline: 14,
        background: "var(--lp-bg-elevated)",
        border: "1px solid var(--lp-border-amber)",
        borderRadius: "var(--lp-radius-card)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.5), 0 0 24px var(--lp-amber-glow)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        transform: "rotate(-2deg)",
        animation: "lp-toast-pulse 3s var(--lp-ease) infinite",
      }}
    >
      <span style={{ fontSize: 18 }}>🎯</span>
      <div>
        <div
          style={{
            fontFamily: "var(--lp-font-display)",
            fontWeight: 800,
            fontSize: "var(--lp-body-s)",
            color: "var(--lp-text-strong)",
            lineHeight: 1.1,
          }}
        >
          +5 XP · أحسنت!
        </div>
        <div
          style={{
            fontSize: "var(--lp-caption)",
            color: "var(--lp-text-muted)",
            marginTop: 2,
          }}
        >
          أكملت تمرين النطق
        </div>
      </div>
      <style>{`
        @keyframes lp-toast-pulse {
          0%, 100% { transform: rotate(-2deg) translateY(0); }
          50% { transform: rotate(-2deg) translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
