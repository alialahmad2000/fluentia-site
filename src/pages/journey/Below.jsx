import { useEffect, useState } from "react";
import { V1FAQ, V1Footer } from "../v1/V1Closing";
import Giant from "./Giant";
import REGION from "./data/region-dots.json";
import { HOMES, PERF_LABEL, PERF_OPTIONS, TITLES } from "./copy";

/**
 * Leg 7 — below, calm navy. «قبل أن تبدأ» and the homepage FAQ, then the
 * homepage footer over a dotted map of the region (baked from Natural Earth)
 * with RUH · JED · DMM glowing, and the performance-mode control.
 */

const DOTS = (() => {
  const out = [];
  for (const row of REGION.rows.split(";")) {
    const [ri, cols] = row.split(":");
    const lat = REGION.lat0 + Number(ri) * REGION.step;
    for (const k of cols.split(",")) out.push([REGION.lon0 + Number(k) * REGION.step, lat]);
  }
  return out;
})();
const LON0 = 32;
const LON1 = 60;
const LAT0 = 12;
const LAT1 = 34;
const VW = 1000;
const VH = Math.round((VW * (LAT1 - LAT0)) / (LON1 - LON0) / Math.cos((23 * Math.PI) / 180));
const px = (lon) => ((lon - LON0) / (LON1 - LON0)) * VW;
const py = (lat) => ((LAT1 - lat) / (LAT1 - LAT0)) * VH;

// One path of zero-length round-capped strokes, built after mount so the
// prerendered HTML does not carry 2,000+ dots.
function RegionMap() {
  const [d, setD] = useState("");
  useEffect(() => {
    setD(DOTS.map(([lon, lat]) => `M${px(lon).toFixed(1)} ${py(lat).toFixed(1)}h0`).join(""));
  }, []);
  return (
    <svg className="jn-map" viewBox={`0 0 ${VW} ${VH}`} aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <path className="jn-map-dots" d={d} />
      {HOMES.map((h) => (
        <g key={h.code} className="jn-map-home" transform={`translate(${px(h.lon).toFixed(1)} ${py(h.lat).toFixed(1)})`}>
          <circle className="jn-map-halo" r="26" />
          <circle className="jn-map-core" r="6.5" />
          <text className="jn-map-code" y="-18" textAnchor="middle">
            {h.code}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function Below({ mode, onMode }) {
  return (
    <div className="jn-below" data-theme="night" data-leg="7">
      <section id="jn-faq" className="jn-faq" aria-labelledby="jn-faq-title">
        <Giant id="jn-faq-title" className="jn-faq-title jn-center" lines={[TITLES.faq]} tones={["cream"]} />
        <V1FAQ />
      </section>
      <div className="jn-foot">
        <RegionMap />
        <div className="jn-foot-inner">
          <V1Footer />
          <div className="jn-perf" role="group" aria-label={PERF_LABEL}>
            <span className="jn-perf-label">{PERF_LABEL}</span>
            {PERF_OPTIONS.map((o, i) => (
              <span key={o.value} className="jn-perf-opt">
                {i > 0 ? <span aria-hidden="true"> / </span> : null}
                <button type="button" aria-pressed={mode === o.value} onClick={() => onMode(o.value)}>
                  {o.label}
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
