import { memo } from "react";
import { FAMILIES, GROUPS, TIERS, acceptedForms } from "../../content/irregularVerbs";
import { FORM_LABELS } from "./copy";
import { playVerb } from "./lib";

/**
 * The reference table. One row per verb, every row in the DOM from the first
 * byte (the prerender ships all of them — that is the SEO point of the page).
 * A phone gets the same markup laid out as a card.
 *
 * Column order follows the page's direction: on an RTL row the base form sits
 * on the right, so an Arabic reader meets go → went → gone in reading order.
 * Each form is a button — tapping any of them plays the clip.
 */

/* Arabic prose quoting English: an unisolated run like «I have went» is
   reordered by the bidi algorithm and paints as «I have» … «went». Each Latin
   run (words, spaces, / · → between them) gets its own LTR isolate. */
const LATIN_RUN = /[A-Za-z][A-Za-z'’ /·→.-]*[A-Za-z]|[A-Za-z]/g;

export function Mixed({ text }) {
  const out = [];
  let last = 0;
  for (const m of text.matchAll(LATIN_RUN)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <bdi key={m.index} dir="ltr" lang="en">
        {m[0]}
      </bdi>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

/** 191 rows × three inline icons was ~230 kB of repeated SVG in the
 *  prerendered HTML. One sprite (lucide's paths), referenced per row. */
export function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <symbol id="vb-i-vol" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
          <path d="M16 9a5 5 0 0 1 0 6" />
          <path d="M19.364 18.364a9 9 0 0 0 0-12.728" />
        </symbol>
        <symbol id="vb-i-pause" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="14" y="4" width="4" height="16" rx="1" />
          <rect x="6" y="4" width="4" height="16" rx="1" />
        </symbol>
        <symbol id="vb-i-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </symbol>
        <symbol id="vb-i-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </symbol>
      </defs>
    </svg>
  );
}

export const Icon = ({ id, size = 18 }) => (
  <svg width={size} height={size} aria-hidden="true" focusable="false"><use href={`#vb-i-${id}`} /></svg>
);

/** Wrap the past form inside the example so the eye finds it. */
function Example({ verb }) {
  const forms = acceptedForms(verb, "past").map((f) => f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`\\b(${forms.join("|")})\\b`, "i");
  const m = verb.exampleEn.match(re);
  if (!m) return <>{verb.exampleEn}</>;
  const at = m.index;
  return (
    <>
      {verb.exampleEn.slice(0, at)}
      <mark className="vb-hl">{m[0]}</mark>
      {verb.exampleEn.slice(at + m[0].length)}
    </>
  );
}

function Form({ verb, slot, alts, tone }) {
  return (
    <button
      type="button"
      className={`vb-f vb-f--${tone}`}
      data-l={FORM_LABELS[slot].short}
      onClick={() => playVerb(verb)}
      aria-label={`${FORM_LABELS[slot].ar}: ${verb[slot]} — استماع`}
    >
      <span className="vb-f-word" lang="en" dir="ltr">{verb[slot]}</span>
      {alts.length ? (
        <span className="vb-f-alt" lang="en" dir="ltr">{alts.join(" · ")}</span>
      ) : null}
    </button>
  );
}

export const VerbRow = memo(function VerbRow({ verb, open, onToggle, playing, mastered }) {
  const fam = FAMILIES[verb.family];
  const detailId = `vb-d-${verb.id}`;
  return (
    <li className="vb-row" data-open={open ? "" : undefined} id={`verb-${verb.id}`}>
      <div className="vb-row-main">
        <button
          type="button"
          className="vb-play"
          data-on={playing ? "" : undefined}
          onClick={() => playVerb(verb)}
          aria-label={`استماع: ${verb.base}`}
        >
          <Icon id={playing ? "pause" : "vol"} />
        </button>
        <Form verb={verb} slot="base" alts={[]} tone="v1" />
        <Form verb={verb} slot="past" alts={verb.pastAlt} tone="v2" />
        <Form verb={verb} slot="participle" alts={verb.participleAlt} tone="v3" />
        <span className="vb-ar">
          {verb.ar}
          {mastered ? (
            <span className="vb-done" title="متقَن">
              <Icon id="check" size={13} />
              <span className="vb-sr">متقَن</span>
            </span>
          ) : null}
        </span>
        <span className="vb-tag" title={GROUPS[verb.group].label}>
          <span lang="en" dir="ltr">{verb.group}</span>
        </span>
        <button
          type="button"
          className="vb-more"
          aria-expanded={open}
          aria-controls={detailId}
          onClick={() => onToggle(verb.id)}
        >
          <span className="vb-more-t">مثال</span>
          <Icon id="down" size={16} />
        </button>
      </div>

      <div className="vb-detail" id={detailId} hidden={!open}>
        <p className="vb-ex-en" lang="en" dir="ltr"><Example verb={verb} /></p>
        <p className="vb-ex-ar"><Mixed text={verb.exampleAr} /></p>
        <dl className="vb-facts">
          <div>
            <dt>النمط</dt>
            <dd>
              {GROUPS[verb.group].label} <span className="vb-dim">({GROUPS[verb.group].hint})</span>
            </dd>
          </div>
          <div>
            <dt>العائلة</dt>
            <dd>
              <Mixed text={fam.name} /> <span className="vb-dim">— <Mixed text={fam.rule} /></span>
            </dd>
          </div>
          <div>
            <dt>المستوى</dt>
            <dd>{TIERS[verb.tier].label}</dd>
          </div>
          {verb.note ? (
            <div className="vb-note">
              <dt>ملاحظة</dt>
              <dd><Mixed text={verb.note} /></dd>
            </div>
          ) : null}
        </dl>
      </div>
    </li>
  );
});

export function ListHead() {
  return (
    <div className="vb-head" aria-hidden="true">
      <span />
      <span className="vb-h vb-h--v1">{FORM_LABELS.base.ar}<small lang="en">{FORM_LABELS.base.en}</small></span>
      <span className="vb-h vb-h--v2">{FORM_LABELS.past.ar}<small lang="en">{FORM_LABELS.past.en}</small></span>
      <span className="vb-h vb-h--v3">{FORM_LABELS.participle.ar}<small lang="en">{FORM_LABELS.participle.en}</small></span>
      <span className="vb-h">المعنى</span>
      <span className="vb-h">النمط</span>
      <span />
    </div>
  );
}
