export default function EyebrowLabel({ children, style }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--lp-space-sm)",
        color: "var(--lp-amber)",
        fontFamily: "var(--lp-font-display)",
        fontSize: "var(--lp-caption)",
        fontWeight: 700,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        marginBottom: "var(--lp-space-md)",
        ...style,
      }}
    >
      <span
        style={{
          width: 24,
          height: 1,
          background: "var(--lp-amber)",
          opacity: 0.6,
        }}
      />
      {children}
    </div>
  );
}
