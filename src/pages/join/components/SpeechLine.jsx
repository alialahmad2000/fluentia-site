/**
 * SpeechLine — the page's one signature moment. A hesitant, broken waveform
 * (stop-start speech) flattens out while one smooth line draws across it,
 * right to left like the sentence above it.
 *
 * Two stacked paths and CSS only (opacity, transform, stroke-dashoffset), so it
 * runs identically in the TikTok webview and needs no JS: the prerendered HTML
 * starts it on first paint. prefers-reduced-motion shows the resolved line.
 */
const JAGGED =
  "M320 12 L306 12 L300 5 L294 19 L289 9 L284 14 L272 14 L268 3 L262 21 L257 12 L240 12 " +
  "L236 7 L231 17 L226 12 L204 12 L199 2 L193 22 L188 8 L183 15 L178 12 L160 12 L156 6 " +
  "L151 18 L146 12 L122 12 L117 4 L111 20 L106 10 L101 14 L84 14 L80 7 L75 17 L70 12 " +
  "L48 12 L44 3 L38 21 L33 11 L28 13 L0 13";

const SMOOTH =
  "M320 12 C 293 4, 267 4, 240 12 S 187 20, 160 12 S 107 4, 80 12 S 27 20, 0 12";

export default function SpeechLine() {
  return (
    <svg className="j-speech" viewBox="0 0 320 24" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path className="j-speech-jagged" d={JAGGED} pathLength="1" />
      <path className="j-speech-smooth" d={SMOOTH} pathLength="1" />
    </svg>
  );
}
