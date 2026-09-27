/**
 * Giant — a display title whose WORDS rise out of a masked line.
 *
 * Arabic is never split into letters (the joins would break), so the unit is
 * the word: each one an inline-block inside an `overflow: hidden` line, lifted
 * from below with a 60 ms stagger that runs across both lines. The mask carries
 * padding on every side so Alexandria's tall alef/lam and deep descenders are
 * never shaved.
 *
 *   lines  [{ text, tone: "cream" | "ice" | "sky" | "gold" }]
 *   reveal "view" (default): `.fx-rv`, revealed once by the page's observer
 *          "hero": CSS keyframes that start at first paint (see next.css)
 *          "none": static
 */
export default function Giant({ lines, as: Tag = "h2", reveal = "view", className = "", id, start = 0 }) {
  let i = start;
  const cls = reveal === "view" ? "fx-rv" : reveal === "hero" ? "fx-hero-rv" : "";
  return (
    <Tag id={id} className={`fx-giant ${cls} ${className}`}>
      {lines.map((line, li) => (
        <span key={li} className={`fx-line fx-tone-${line.tone || "cream"}`}>
          {line.text.split(" ").map((w, wi, all) => {
            const idx = i;
            i += 1;
            return (
              <span key={wi}>
                <span className="fx-w" style={{ "--i": idx }}>
                  {w}
                </span>
                {wi < all.length - 1 ? " " : null}
              </span>
            );
          })}
          {li < lines.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
