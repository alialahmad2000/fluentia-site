export default function Container({ narrow = false, text = false, style, children }) {
  const maxW = text ? "var(--lp-max-w-text)" : narrow ? "var(--lp-max-w-narrow)" : "var(--lp-max-w)";
  return (
    <div
      style={{
        width: "100%",
        maxWidth: maxW,
        marginInline: "auto",
        paddingInline: "clamp(16px, 4vw, 32px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
