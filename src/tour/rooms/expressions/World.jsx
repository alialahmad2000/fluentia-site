import './world.css'

/**
 * The background, built from whatever the page is about.
 *
 * A dark panel with a couple of blurred colour blobs on it is not a background
 * — it is a screensaver behind a card. This takes the actual plate of the thing
 * being read and layers it: a far pass blurred almost to colour, a near pass
 * that keeps just enough shape to be recognisable, then wash / bloom / motes /
 * grain. Change the expression and the whole room changes with it.
 */
export default function World({ src, tone }) {
  const bg = src ? { backgroundImage: `url("${String(src).replace(/"/g, '\\"')}")` } : undefined
  // `tone` recolours the light for content that has no plate to lend it — the
  // preposition track is type, not photographs, so its room takes the violet
  // its cards are drawn in instead of the gold wash made for proverb plates.
  return (
    <div className={`xw${tone ? ` is-${tone}` : ''}`} aria-hidden="true">
      <div className="xw__far" style={bg} />
      <div className="xw__near" style={bg} />
      <div className="xw__wash" />
      <div className="xw__bloom" />
      <div className="xw__motes" />
      <div className="xw__scrim" />
      <div className="xw__grain" />
    </div>
  )
}
