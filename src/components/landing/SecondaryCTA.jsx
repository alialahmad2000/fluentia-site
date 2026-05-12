export default function SecondaryCTA({ href, onClick, children, style, ...rest }) {
  const Tag = href ? "a" : "button";
  return (
    <Tag
      href={href}
      onClick={onClick}
      {...rest}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--lp-space-sm)",
        paddingBlock: "13px",
        paddingInline: "26px",
        background: "transparent",
        color: "var(--lp-text-strong)",
        fontFamily: "var(--lp-font-display)",
        fontSize: "var(--lp-body)",
        fontWeight: 700,
        border: "1px solid var(--lp-border-bold)",
        borderRadius: "var(--lp-radius-pill)",
        cursor: "pointer",
        textDecoration: "none",
        transition: "background var(--lp-dur-fast) var(--lp-ease), border-color var(--lp-dur-fast) var(--lp-ease)",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--lp-bg-elevated)";
        e.currentTarget.style.borderColor = "var(--lp-border-amber)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.borderColor = "var(--lp-border-bold)";
      }}
    >
      {children}
    </Tag>
  );
}
