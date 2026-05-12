import { TRUSTED_BY } from "./content";

export default function TrustBar() {
  return (
    <div
      style={{
        marginBlock: "var(--lp-space-xl)",
        paddingBlock: "var(--lp-space-lg)",
        paddingInline: "var(--lp-space-xl)",
        background:
          "linear-gradient(90deg, transparent, var(--lp-bg-elevated) 20%, var(--lp-bg-elevated) 80%, transparent)",
        borderRadius: "var(--lp-radius-lg)",
        border: "1px solid var(--lp-border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "clamp(12px, 3vw, 28px)",
        rowGap: "var(--lp-space-md)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--lp-font-display)",
          fontSize: "var(--lp-caption)",
          fontWeight: 700,
          color: "var(--lp-amber-bright)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          whiteSpace: "nowrap",
        }}
      >
        {TRUSTED_BY.label}
      </span>

      {TRUSTED_BY.items.map((item, i) => (
        <span
          key={i}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "var(--lp-font-display)",
            fontSize: "var(--lp-body-s)",
            fontWeight: 600,
            color: "var(--lp-text)",
            whiteSpace: "nowrap",
          }}
        >
          {i > 0 && (
            <span
              aria-hidden
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "var(--lp-amber)",
                opacity: 0.6,
                display: "inline-block",
              }}
            />
          )}
          <span>{item}</span>
        </span>
      ))}
    </div>
  );
}
