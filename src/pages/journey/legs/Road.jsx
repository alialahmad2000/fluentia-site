import { useEffect, useRef } from "react";
import { SOLUTION, METHOD, FOUNDER, WHO_FOR } from "../../landing-v2/content";
import Giant from "../Giant";
import { useJourney } from "../context";
import { TITLES } from "../copy";
import { subscribe } from "../core/ticker";
import { vh, onLayout } from "../core/viewport";
import { wave } from "../core/voice";

/**
 * Leg 5 — the road. The voice leaves the booth as a real road: ink asphalt,
 * a sky centre line lit behind you, dashed markings ahead. You ride it as a
 * short waveform (the "packet"), carried on a critically damped spring so it
 * lags the scroll a little and breathes when you stop. Each stop's node lights
 * and its words arrive when the packet reaches it — not when a scroll
 * threshold says so.
 *
 * Stops, all verbatim: the three pillars (with «حد أقصى 7 طلاب»), «التحدّث
 * أولاً», the founder's promise, and a fork — WHO_FOR: the road you stay on
 * (for you, lit) and the branch that ends (not for you), with the free level
 * test as the honest next step for anyone not ready yet.
 *
 * Only the visible slice of the road is redrawn each frame (a short path), so
 * scroll never repaints a page-long SVG.
 */
const firstSentence = (s) => s.split(/(?<=[.؟!])\s/)[0];
const LEVEL = {
  kicker: "قبل ما تختار باقة",
  title: "«مستواي متوسط» — أكثر جملة تكلّف الطلاب سنة كاملة.",
  cta: "اختبر مستواك الآن",
  note: "مجاني · بدون تسجيل · 10 دقائق · النتيجة تظهر لك فوراً",
}; // verbatim from V1LevelTestBand

function Stop({ children, className = "", side = 0 }) {
  return (
    <div className={`jn-stop ${className}`} data-side={side}>
      <span className="jn-node" aria-hidden="true" />
      <div className="jn-stop-body">{children}</div>
    </div>
  );
}

export default function Road() {
  const { reduce } = useJourney();
  const secRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    const sec = secRef.current;
    const svg = svgRef.current;
    const road = svg.querySelector(".jn-road-asphalt");
    const edge = svg.querySelector(".jn-road-edge");
    const marks = svg.querySelector(".jn-road-marks");
    const lit = svg.querySelector(".jn-road-lit");
    const pkt = svg.querySelector(".jn-road-packet");
    const pktGlow = svg.querySelector(".jn-road-packet-glow");
    const branch = svg.querySelector(".jn-road-branch");
    const barrier = svg.querySelector(".jn-road-barrier");
    let pts = []; // [x, y] every ~8 px of length
    let top = 0;
    let stops = [];
    let L = 0;
    let V = 0;
    let lastLit = "";
    let unsub = null;

    const layout = () => {
      const sr = sec.getBoundingClientRect();
      top = sr.top + window.scrollY;
      const Wd = sec.clientWidth;
      const Hd = sec.scrollHeight;
      svg.setAttribute("viewBox", `0 0 ${Wd} ${Hd}`);
      svg.style.height = `${Hd}px`;
      const nodes = [...sec.querySelectorAll(".jn-node")].map((n) => {
        const r = n.getBoundingClientRect();
        return { x: r.left + r.width / 2 - sr.left, y: r.top + r.height / 2 - sr.top, el: n.closest(".jn-stop") };
      });
      const phone = Wd < 720;
      // the voice arrives down the booth's edge (see .jn-voice-edge)
      const startX = phone ? Wd - 10 : 24;
      if (phone) {
        // a phone gets a real road: it runs down its lane beside each stop, and only in the
        // empty gap between two stops does it sweep out across the width and back
        const pts2 = [];
        nodes.forEach((n, i) => {
          const body = n.el?.querySelector(".jn-stop-body");
          const bottom = body ? body.getBoundingClientRect().bottom - sr.top : n.y + 120;
          pts2.push(n);
          pts2.push({ x: n.x, y: bottom + 10, bend: true });
          const next = nodes[i + 1];
          if (next) pts2.push({ x: Wd * 0.72, y: (bottom + next.y) / 2, bend: true });
        });
        nodes.splice(0, nodes.length, ...pts2);
      }
      // after the last stop the road runs straight on, then turns for the water in the open space below
      const last = nodes[nodes.length - 1];
      const colBottom = sec.querySelector(".jn-road-col").getBoundingClientRect().bottom - sr.top;
      const tail = last ? [{ x: last.x, y: colBottom + 40 }] : [];
      const way = [{ x: startX, y: 0 }, ...nodes, ...tail, { x: Wd / 2, y: Hd }];
      let d = `M${way[0].x} ${way[0].y}`;
      for (let i = 1; i < way.length; i++) {
        const a = way[i - 1];
        const b = way[i];
        const dy = (b.y - a.y) * 0.5;
        d += ` C${a.x} ${a.y + dy} ${b.x} ${b.y - dy} ${b.x} ${b.y}`;
      }
      road.setAttribute("d", d);
      edge.setAttribute("d", d);
      marks.setAttribute("d", d);
      // sample once
      const total = road.getTotalLength();
      pts = [];
      for (let l = 0; l <= total; l += 8) {
        const q = road.getPointAtLength(l);
        pts.push([q.x, q.y]);
      }
      stops = nodes.filter((n) => !n.bend).map((n) => ({ ...n, on: false }));
      // the fork: a branch that leaves the road at the fork stop and ends
      // the fork: the branch leaves the road below the fork's title and ends at the "not for you" list
      const noList = sec.querySelector(".jn-fork-no");
      const fork = nodes.find((n) => n.el?.classList.contains("jn-stop--fork"));
      if (fork && noList) {
        const r = noList.getBoundingClientRect();
        // a real side road: it peels off, runs down beside the three items, and stops at a barrier
        const bx = phone ? 30 : r.left - sr.left - 34;
        const by0 = r.top - sr.top;
        const by1 = r.bottom - sr.top - 4;
        branch.setAttribute("d", `M${fork.x} ${by0 - 70} C${fork.x} ${by0 - 20} ${bx} ${by0 - 30} ${bx} ${by0 + 20} L${bx} ${by1}`);
        barrier.setAttribute("x", String(bx - 14));
        barrier.setAttribute("y", String(by1));
      }
    };

    const findY = (y) => {
      // first sample at or below y (the road always runs downward)
      let lo = 0;
      let hi = pts.length - 1;
      while (lo < hi) {
        const m = (lo + hi) >> 1;
        if (pts[m][1] < y) lo = m + 1;
        else hi = m;
      }
      return lo;
    };

    const frame = (t, dt, sy) => {
      if (!pts.length) return;
      const H = vh();
      const target = findY(sy + H * 0.58 - top);
      // critically damped spring (ω = 11): lags, never overshoots
      const w = 11;
      const a = w * w * (target - L) - 2 * w * V;
      V += a * dt;
      L += V * dt;
      if (reduce) L = target;
      const i = Math.max(0, Math.min(pts.length - 1, Math.round(L)));
      // lit centre line: only the visible slice
      const from = Math.max(0, findY(sy - top - H * 0.3));
      let d = "";
      for (let k = from; k <= i; k += 1) d += `${k === from ? "M" : "L"}${pts[k][0].toFixed(1)} ${pts[k][1].toFixed(1)}`;
      if (d !== lastLit) {
        lit.setAttribute("d", d || "M0 0");
        lastLit = d;
      }
      // the packet: a short waveform along the road's tangent at i
      const time = reduce ? 0 : t / 1000;
      const j = Math.min(pts.length - 1, i + 1);
      const [px, py] = pts[i];
      let tx = pts[j][0] - pts[Math.max(0, i - 1)][0];
      let ty = pts[j][1] - pts[Math.max(0, i - 1)][1];
      const tl = Math.hypot(tx, ty) || 1;
      tx /= tl;
      ty /= tl;
      const nx = -ty;
      const ny = tx;
      const endK = Math.min(1, Math.max(0, (i - (pts.length - 41)) / 40));
      const len = 80 * (1 - endK) + 2;
      const amp = (7 + Math.min(1, Math.abs(V) / 900) * 8 + (reduce ? 0 : Math.sin(time * 2.4) * 2)) * (1 - endK);
      let pd = "";
      for (let k = 0; k <= 36; k++) {
        const u = k / 36;
        const s = (u - 1) * len; // trailing behind the head
        const off = wave(u, time * 1.4, amp);
        pd += `${k ? "L" : "M"}${(px + tx * s + nx * off).toFixed(1)} ${(py + ty * s + ny * off).toFixed(1)}`;
      }
      pkt.setAttribute("d", pd);
      pktGlow.setAttribute("d", pd);
      // stops light as the packet reaches them
      for (const s of stops) {
        const reached = py >= s.y - 4;
        if (reached !== s.on) {
          s.on = reached;
          s.el?.toggleAttribute("data-on", reached);
        }
      }
    };

    layout();
    const offLayout = onLayout(layout);
    const ro = new ResizeObserver(() => layout());
    ro.observe(sec);
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !unsub) unsub = subscribe(frame, 1);
      else if (!e.isIntersecting && unsub) {
        unsub();
        unsub = null;
      }
    });
    io.observe(sec);
    return () => {
      io.disconnect();
      ro.disconnect();
      offLayout();
      unsub?.();
    };
  }, [reduce]);

  const pillars = SOLUTION.pillars;
  const speak = METHOD.pillars[0];
  return (
    <section id="jn-road" ref={secRef} className="jn-road" data-theme="day" data-leg="5" aria-labelledby="jn-road-title">
      <svg ref={svgRef} className="jn-road-svg" aria-hidden="true" preserveAspectRatio="none">
        <path className="jn-road-branch" fill="none" />
        <rect className="jn-road-barrier" width="28" height="5" rx="2" />
        <path className="jn-road-edge" fill="none" />
        <path className="jn-road-asphalt" fill="none" />
        <path className="jn-road-marks" fill="none" />
        <path className="jn-road-lit" fill="none" />
        <path className="jn-road-packet-glow" fill="none" />
        <path className="jn-road-packet" fill="none" />
      </svg>

      <div className="jn-road-col">
        <div className="jn-road-head">
          <Giant id="jn-road-title" className="jn-road-title" lines={TITLES.path} tones={["ink", "ink2"]} />
          <p className="jn-road-lede">{SOLUTION.headline}</p>
        </div>

        {pillars.map((p) => (
          <Stop key={p.title}>
            <span className="jn-stop-num jn-num">
              <bdi>{p.num}</bdi>
            </span>
            <h3 className="jn-stop-title">{p.title}</h3>
            <ul className="jn-stop-points">
              {p.points.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
          </Stop>
        ))}

        <Stop className="jn-stop--speak">
          <h3 className="jn-stop-title jn-stop-title--big">{speak.title}</h3>
          <p className="jn-stop-text">{firstSentence(speak.body)}</p>
        </Stop>

        <Stop className="jn-stop--founder">
          <p className="jn-founder-quote">{FOUNDER.headline}</p>
          <p className="jn-stop-text">{FOUNDER.paragraphs[0]}</p>
          <p className="jn-stop-text jn-founder-promise">{FOUNDER.paragraphs[3]}</p>
          <p className="jn-founder-sign">
            <b>{FOUNDER.signature.name}</b>
            <span>{FOUNDER.signature.title}</span>
          </p>
        </Stop>

        <Stop className="jn-stop--fork">
          <h3 className="jn-stop-title jn-stop-title--big">{WHO_FOR.headline}</h3>
          <div className="jn-fork">
            <div className="jn-fork-yes">
              <p className="jn-fork-title">{WHO_FOR.forYou.title}</p>
              <ul>
                {WHO_FOR.forYou.items.slice(0, 3).map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="jn-fork-no">
              <p className="jn-fork-title">{WHO_FOR.notForYou.title}</p>
              <ul>
                {WHO_FOR.notForYou.items.slice(0, 3).map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </Stop>

        <Stop className="jn-stop--level">
          <a className="jn-level" href="/level-test">
            <span className="jn-level-kicker">{LEVEL.kicker}</span>
            <span className="jn-level-title">{LEVEL.title}</span>
            <span className="jn-level-cta">
              {LEVEL.cta} <span aria-hidden="true">←</span>
            </span>
            <span className="jn-level-note">{LEVEL.note}</span>
          </a>
        </Stop>
      </div>
    </section>
  );
}
