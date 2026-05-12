export default function SectionHeading({ level = 2, size = "h1", children, style }) {
  const Tag = `h${level}`;
  const fontSize = size === "display" ? "var(--lp-display-2)" : "var(--lp-h1)";
  return (
    <Tag
      style={{
        fontSize,
        color: "var(--lp-text-strong)",
        maxWidth: "var(--lp-max-w-text)",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
