/**
 * The room «الأفعال الشاذة» stands in.
 *
 * The page used to sit on VocabShell's default field — a navy gradient with a
 * star canvas — and the verdict on it was that the background was muddy and
 * the colours were not colours. Everything here is a PURE hue on a pure ink
 * base: no grey-blue translucency, no colour mixed down into the background
 * until it reads as sludge.
 *
 * The blooms are the page's own six accents (cyan · violet · amber · red ·
 * pink · green) at very low alpha, so the light in the room comes from the
 * same palette the cards are painted with rather than from a preset wallpaper.
 * The whitish bloom at the top is what makes the pure hues read as LIT instead
 * of merely saturated.
 *
 * Decorative → aria-hidden, and every animation is CSS so `.vc-static`
 * (low-end devices) and prefers-reduced-motion switch it off.
 */
export default function VerbRoom() {
  return (
    <div className="vl-room" aria-hidden="true">
      <i className="vl-room__white" />
      <i className="vl-room__b vl-room__b--cyan" />
      <i className="vl-room__b vl-room__b--violet" />
      <i className="vl-room__b vl-room__b--amber" />
      <i className="vl-room__grid" />
    </div>
  )
}
