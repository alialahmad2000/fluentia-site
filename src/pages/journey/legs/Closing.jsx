import { useEffect, useRef, useState } from "react";
import V1Pricing from "../../v1/V1Pricing";
import { V1FAQ, V1Footer } from "../../v1/V1Closing";
import { FAQ, FINAL_CTA } from "../../landing-v2/content";
import Giant from "../Giant";
import REGION from "../data/region-dots.json";
import { HOMES, PERF_LABEL, PERF_OPTIONS, TITLES } from "../copy";

/**
 * Legs 8–10 — pricing, before you start, and the map home.
 *
 * The homepage's pricing and FAQ, unchanged (their own duplicate headers
 * hidden through an optional prop; the FAQ gets the cold visitor's two fears
 * first through its existing `data` prop). The final call emits sound rings
 * from the button — the button is where the voice comes from now. The footer
 * closes the journey: the voice traces RUH → DMM → JED across a dotted map of
 * the region, and a giant dotted «طلاقة» ends the page.
 */
const FEARS = ["هل تضمنون نتيجة؟", "ماذا لو لم يناسبني بعد الاشتراك؟"];
const FAQ_ORDERED = {
  ...FAQ,
  items: [...FAQ.items.filter((i) => FEARS.includes(i.q)), ...FAQ.items.filter((i) => !FEARS.includes(i.q))],
};

const LON0 = 32;
const LON1 = 60;
const LAT0 = 12;
const LAT1 = 34;
const VW = 1000;
const VH = Math.round((VW * (LAT1 - LAT0)) / (LON1 - LON0) / Math.cos((23 * Math.PI) / 180));
const px = (lon) => ((lon - LON0) / (LON1 - LON0)) * VW;
const py = (lat) => ((LAT1 - lat) / (LAT1 - LAT0)) * VH;
const H3 = Object.fromEntries(HOMES.map((h) => [h.code, [px(h.lon), py(h.lat)]]));

function MapHome() {
  const ref = useRef(null);
  const [dots, setDots] = useState("");
  useEffect(() => {
    const out = [];
    for (const row of REGION.rows.split(";")) {
      const [ri, cols] = row.split(":");
      const lat = REGION.lat0 + Number(ri) * REGION.step;
      for (const k of cols.split(",")) out.push(`M${px(REGION.lon0 + Number(k) * REGION.step).toFixed(1)} ${py(lat).toFixed(1)}h0`);
    }
    setDots(out.join(""));
    const svg = ref.current;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          svg.setAttribute("data-on", "");
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(svg);
    return () => io.disconnect();
  }, []);
  const [r, d, j] = [H3.RUH, H3.DMM, H3.JED];
  const trace = `M${r[0]} ${r[1]} Q${(r[0] + d[0]) / 2} ${r[1] - 120} ${d[0]} ${d[1]} Q${(d[0] + j[0]) / 2 + 60} ${(d[1] + j[1]) / 2 + 260} ${j[0]} ${j[1]}`;
  return (
    <svg ref={ref} className="jn-map" viewBox={`0 0 ${VW} ${VH}`} aria-hidden="true">
      <path className="jn-map-dots" d={dots} />
      <path className="jn-map-trace" d={trace} pathLength="1" />
      {HOMES.map((h) => (
        <g key={h.code} transform={`translate(${H3[h.code][0].toFixed(1)} ${H3[h.code][1].toFixed(1)})`}>
          <circle className="jn-map-halo" r="24" />
          <circle className="jn-map-core" r="7" />
          <text className="jn-map-code" y="-20" textAnchor="middle">
            {h.name}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function Closing({ mode, onMode }) {
  return (
    <div className="jn-closing">
      <section id="jn-pricing" className="jn-pricing" data-theme="night" data-leg="8" aria-labelledby="jn-pricing-title">
        <Giant id="jn-pricing-title" className="jn-pricing-title jn-center" lines={[TITLES.pricing]} tones={["cream"]} />
        <V1Pricing embedded />
      </section>

      <section id="jn-faq" className="jn-faq" data-theme="night" data-leg="9" aria-labelledby="jn-faq-title">
        <Giant id="jn-faq-title" className="jn-faq-title jn-center" lines={[TITLES.faq]} tones={["cream"]} />
        <V1FAQ data={FAQ_ORDERED} embedded />
      </section>

      <div className="jn-foot" data-theme="night">
        <MapHome />
        <div className="jn-foot-cta">
          <p className="jn-final-sub">{FINAL_CTA.sub}</p>
          <div className="jn-rings">
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <button type="button" data-open-form className="jn-btn jn-btn--cream jn-btn--lg">
              {FINAL_CTA.primaryCTA}
              <span aria-hidden="true">←</span>
            </button>
          </div>
        </div>
        <p className="jn-wordmark" aria-hidden="true">
          طلاقة
        </p>
        <V1Footer />
        <div className="jn-perf" role="group" aria-label={PERF_LABEL}>
          <span className="jn-perf-label">{PERF_LABEL}</span>
          {PERF_OPTIONS.map((o, i) => (
            <span key={o.value}>
              {i > 0 ? <span aria-hidden="true"> / </span> : null}
              <button type="button" aria-pressed={mode === o.value} onClick={() => onMode(o.value)}>
                {o.label}
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
