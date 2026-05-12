export default function Section({ id, raised = false, style, children }) {
  return (
    <section
      id={id}
      style={{
        background: raised ? "var(--lp-bg-raised)" : "var(--lp-bg-base)",
        paddingBlock: "var(--lp-space-section)",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </section>
  );
}
