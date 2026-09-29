/**
 * A giant title: explicit lines, each a mask, each word its own span — in the
 * prerendered markup, so nothing re-wraps when the script arrives. The page's
 * reveal (GSAP) lifts `.jn-wi` from yPercent 110 to 0, 1.1 s expo.out,
 * stagger 0.06. Words are split on spaces only: Arabic joins stay intact.
 *
 * `lines` items may be a string or an array of strings; an array breaks into
 * separate lines on a phone (`.jn-l-ph`) and stays one line elsewhere.
 */
function Words({ text }) {
  const words = text.split(" ");
  return words.map((w, i) => (
    <span key={i} className="jn-w">
      <span className="jn-wi">{w}</span>
      {i < words.length - 1 ? " " : null}
    </span>
  ));
}

export default function Giant({ lines, as: Tag = "h2", className = "", tones = [], id, srText }) {
  return (
    <Tag id={id} className={`jn-giant ${className}`} aria-label={srText || undefined}>
      {lines.map((line, i) => (
        <span key={i} className={`jn-l${tones[i] ? ` jn-tone-${tones[i]}` : ""}`}>
          {Array.isArray(line)
            ? line.map((part, k) => (
                <span key={k} className="jn-l-ph">
                  <Words text={part} />
                  {k < line.length - 1 ? " " : null}
                </span>
              ))
            : <Words text={line} />}
        </span>
      ))}
    </Tag>
  );
}
