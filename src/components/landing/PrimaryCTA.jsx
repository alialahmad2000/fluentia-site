export default function PrimaryCTA({ href, onClick, children, style }) {
  const Tag = href ? "a" : "button";
  return (
    <Tag
      href={href}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--lp-space-sm)",
        paddingBlock: "14px",
        paddingInline: "28px",
        background: "linear-gradient(135deg, var(--lp-amber-bright), var(--lp-amber))",
        color: "#0a0e1a",
        fontFamily: "var(--lp-font-display)",
        fontSize: "var(--lp-body)",
        fontWeight: 800,
        border: "none",
        borderRadius: "var(--lp-radius-pill)",
        cursor: "pointer",
        textDecoration: "none",
        boxShadow: "var(--lp-shadow-amber-strong)",
        transition: "transform var(--lp-dur-fast) var(--lp-ease), box-shadow var(--lp-dur-med) var(--lp-ease)",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(251, 191, 36, 0.5)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "var(--lp-shadow-amber-strong)";
      }}
    >
      {children}
    </Tag>
  );
}
