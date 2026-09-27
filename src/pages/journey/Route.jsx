import { useEffect, useRef } from "react";
import { PRODUCT, METHOD, WORTH, WHO_FOR } from "../landing-v2/content";
import { SpeakingMock, VocabMock } from "../v1/V1Product";
import Giant from "./Giant";
import { useJourney } from "./context";
import { MARQUEE, TITLES } from "./copy";
import { scrollToEl } from "./motion";

/**
 * Legs 3b + 4 — the road. The voice leaves the phone's microphone as a thick
 * luminous track, turns, and runs down the page as the spine of everything
 * that follows: the platform proof, then «طريق واضح» with the method and the
 * four commitments as milestones, then the honest fit / not-fit. A glowing
 * pulse — you — travels the track with the scroll; behind you the track is
 * lit, ahead of you it waits. Giant outlined «طلاقة FLUENTIA» drifts behind.
 *
 * The track is one SVG in the page flow (it scrolls natively), its path laid
 * through the milestone nodes (`.jn-node`) as the layout actually fell, and
 * re-laid on resize. On a phone it runs down the right edge, content to its
 * left; on a desktop it swings along the left of the column.
 */

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function offsetIn(el, ancestor) {
  let x = 0;
  let y = 0;
  let n = el;
  while (n && n !== ancestor) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent;
  }
  return { x, y };
}

function Stop({ i, children, className = "" }) {
  return (
    <div className={`jn-stop ${className}`} style={{ "--k": i % 2 }}>
      <span className="jn-node" aria-hidden="true" />
      <div className="jn-stop-body jn-rise">{children}</div>
    </div>
  );
}

function Tick() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" className="jn-tick">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}
function Cross() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" className="jn-cross">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export default function Route() {
  const { fx, cfg } = useJourney();
  const routeRef = useRef(null);
  const svgRef = useRef(null);
  const baseRef = useRef(null);
  const litRef = useRef(null);
  const litGlowRef = useRef(null);
  const haloRef = useRef(null);
  const coreRef = useRef(null);
  const mqRef = useRef(null);
  const still = !cfg || !cfg.webgl;

  // Lay the track through the nodes; move the pulse with the scroll.
  useEffect(() => {
    const route = routeRef.current;
    const svg = svgRef.current;
    if (!route || !svg) return undefined;
    let total = 0;
    let ys = [];
    let ls = [];
    let top = 0;
    let startY = 0;
    let raf = 0;
    let ready = false;

    const layout = () => {
      const rr = route.getBoundingClientRect();
      top = rr.top + window.scrollY;
      const W = route.clientWidth;
      const H = route.scrollHeight;
      const pts = [];

      // start: the phone's microphone where the first-word stage comes to rest
      const sec = document.getElementById("jn-first");
      const stage = sec?.querySelector(".jn-first-stage");
      const mic = sec?.querySelector(".jn-mic");
      if (sec && stage && mic) {
        const secTop = sec.getBoundingClientRect().top + window.scrollY;
        const rest = secTop + sec.offsetHeight - stage.offsetHeight;
        const o = offsetIn(mic, stage);
        pts.push({ x: o.x + mic.offsetWidth / 2, y: rest + o.y + mic.offsetHeight / 2 - top });
      }
      route.querySelectorAll(".jn-node").forEach((n) => {
        const r = n.getBoundingClientRect();
        pts.push({ x: r.left + r.width / 2 - rr.left, y: r.top + r.height / 2 - rr.top });
      });
      pts.push({ x: W / 2, y: H });
      startY = pts[0].y;

      let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1];
        const b = pts[i];
        const dy = (b.y - a.y) * 0.5;
        d += ` C${a.x.toFixed(1)} ${(a.y + dy).toFixed(1)} ${b.x.toFixed(1)} ${(b.y - dy).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
      }
      const minY = Math.min(0, startY) - 20;
      svg.setAttribute("viewBox", `0 ${minY.toFixed(0)} ${W} ${(H - minY).toFixed(0)}`);
      svg.style.top = `${minY}px`;
      svg.style.height = `${H - minY}px`;
      baseRef.current.setAttribute("d", d);
      litRef.current.setAttribute("d", d);
      litGlowRef.current.setAttribute("d", d);
      total = litRef.current.getTotalLength();
      litRef.current.style.strokeDasharray = `${total} ${total}`;
      litGlowRef.current.style.strokeDasharray = `${total} ${total}`;
      ys = [];
      ls = [];
      const step = 6;
      let lastY = -Infinity;
      for (let l = 0; l <= total; l += step) {
        const p = litRef.current.getPointAtLength(l);
        lastY = Math.max(lastY, p.y);
        ys.push(lastY);
        ls.push(l);
      }
      ready = true;
      tick();
    };

    const tick = () => {
      raf = 0;
      if (!ready) return;
      const target = window.scrollY + window.innerHeight * 0.58 - top;
      let L = 0;
      if (still) L = total;
      else if (target > ys[0]) {
        let lo = 0;
        let hi = ys.length - 1;
        while (lo < hi) {
          const mid = (lo + hi) >> 1;
          if (ys[mid] < target) lo = mid + 1;
          else hi = mid;
        }
        L = ls[lo];
      }
      litRef.current.style.strokeDashoffset = String(total - L);
      litGlowRef.current.style.strokeDashoffset = String(total - L);
      const p = litRef.current.getPointAtLength(clamp(L, 0, total));
      const on = !still && L > 2 && L < total - 2 ? 1 : 0;
      for (const c of [haloRef.current, coreRef.current]) {
        c.setAttribute("cx", p.x.toFixed(1));
        c.setAttribute("cy", p.y.toFixed(1));
        c.style.opacity = String(on);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const ro = new ResizeObserver(() => layout());
    ro.observe(route);
    const first = document.getElementById("jn-first");
    if (first) ro.observe(first);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.fonts?.ready.then(layout);
    layout();
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [still]);

  // The marquee drifts with the scroll (and a little with its speed); cards rise in.
  useEffect(() => {
    if (!fx || still) return undefined;
    const { gsap, ScrollTrigger } = fx;
    const route = routeRef.current;
    const rows = mqRef.current.querySelectorAll(".jn-mq-row");
    const ctx = gsap.context(() => {
      let vel = 0;
      ScrollTrigger.create({
        trigger: route,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          vel += (self.getVelocity() / 900 - vel) * 0.2;
          rows.forEach((row, i) => {
            const dir = i % 2 ? 1 : -1;
            const x = dir * (self.progress * 60 + clamp(vel, -6, 6));
            row.style.transform = `translate3d(${x.toFixed(2)}%, 0, 0)`;
          });
        },
      });
      gsap.utils.toArray(".jn-route .jn-rise").forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, x: -40 },
          { autoAlpha: 1, x: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 86%", once: true } }
        );
      });
    }, route);
    return () => ctx.revert();
  }, [fx, still]);

  const bigs = PRODUCT.cards.filter((c) => c.size === "big");
  const smalls = PRODUCT.cards.filter((c) => c.size === "small");
  let k = 0;

  return (
    <div ref={routeRef} className="jn-route" data-theme="day" data-leg="4">
      <div className="jn-route-night" data-theme="night" aria-hidden="true" />
      <div className="jn-mq-layer" aria-hidden="true">
        <div ref={mqRef} className="jn-mq">
          {[0, 1].map((r) => (
            <div key={r} className="jn-mq-row" dir="rtl">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i}>{MARQUEE}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <svg ref={svgRef} className="jn-track" aria-hidden="true" preserveAspectRatio="none">
        <defs>
          <radialGradient id="jn-pulse-g">
            <stop offset="0" stopColor="#e0f5ff" />
            <stop offset="0.35" stopColor="#7dd3fc" stopOpacity="0.9" />
            <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path ref={baseRef} className="jn-track-base" fill="none" />
        <path ref={litGlowRef} className="jn-track-glow" fill="none" />
        <path ref={litRef} className="jn-track-lit" fill="none" />
        <circle ref={haloRef} className="jn-pulse-halo" r="30" fill="url(#jn-pulse-g)" />
        <circle ref={coreRef} className="jn-pulse-core" r="7" />
      </svg>

      <div className="jn-route-col">
        <section className="jn-proof" aria-labelledby="jn-proof-head">
          <div className="jn-stop jn-stop--head">
            <div className="jn-stop-body">
              <span className="jn-eyebrow">{PRODUCT.eyebrow}</span>
              <h2 id="jn-proof-head" className="jn-h2">
                {PRODUCT.headline}
              </h2>
              <p className="jn-lede">{PRODUCT.intro}</p>
            </div>
          </div>
          {bigs.map((c) => (
            <Stop key={c.title} i={k++}>
              <article className="jn-proof-card">
                <h3 className="jn-h3">{c.title}</h3>
                <p className="jn-proof-tag">{c.tagline}</p>
                <p className="jn-proof-bullet">{c.bullet}</p>
                <div className="jn-proof-mock v1-scope">{c.mockup === "speaking" ? <SpeakingMock /> : <VocabMock />}</div>
              </article>
            </Stop>
          ))}
          {smalls.map((c) => (
            <Stop key={c.title} i={k++} className="jn-stop--small">
              <article className="jn-proof-card jn-proof-card--small">
                <h3 className="jn-h3">{c.title}</h3>
                <p className="jn-proof-tag">{c.tagline}</p>
              </article>
            </Stop>
          ))}
        </section>

        <section id="jn-path" className="jn-path" aria-labelledby="jn-path-title">
          <div className="jn-stop jn-stop--head">
            <div className="jn-stop-body">
              <Giant id="jn-path-title" className="jn-path-title" lines={TITLES.path} tones={["ink", "sky"]} />
            </div>
          </div>

          <div className="jn-stop jn-stop--label">
            <div className="jn-stop-body">
              <span className="jn-eyebrow">{METHOD.eyebrow}</span>
              <p className="jn-lede jn-lede--strong">{METHOD.headline}</p>
            </div>
          </div>
          {METHOD.pillars.map((p) => (
            <Stop key={p.title} i={k++}>
              <span className="jn-num" dir="ltr">
                {p.num}
              </span>
              <h3 className="jn-h3 jn-h3--big">{p.title}</h3>
              <p className="jn-body">{p.body}</p>
            </Stop>
          ))}

          <div className="jn-stop jn-stop--label">
            <div className="jn-stop-body">
              <span className="jn-eyebrow">{WORTH.eyebrow}</span>
              <p className="jn-lede jn-lede--strong">{WORTH.headline}</p>
              <p className="jn-lede">{WORTH.deck}</p>
            </div>
          </div>
          {WORTH.pillars.map((p) => (
            <Stop key={p.title} i={k++}>
              <span className="jn-essence">
                <span className="jn-num" dir="ltr">
                  {p.num}
                </span>
                {p.essence}
              </span>
              <h3 className="jn-h3 jn-h3--big">{p.title}</h3>
              <p className="jn-body">{p.body}</p>
            </Stop>
          ))}
          <Stop i={k++} className="jn-stop--closing">
            <p className="jn-closing-lead">{WORTH.closing.lead}</p>
            <p className="jn-body">{WORTH.closing.body}</p>
            <a
              href="#jn-pricing"
              className="jn-btn jn-btn--ink"
              onClick={(e) => {
                e.preventDefault();
                scrollToEl(document.getElementById("jn-pricing"));
              }}
            >
              {WORTH.closing.ctaLabel}
              <span aria-hidden="true">↓</span>
            </a>
          </Stop>
        </section>

        <section className="jn-fit" aria-labelledby="jn-fit-head">
          <Stop i={k++}>
            <span className="jn-eyebrow">{WHO_FOR.eyebrow}</span>
            <h2 id="jn-fit-head" className="jn-h2">
              {WHO_FOR.headline}
            </h2>
            <p className="jn-lede">{WHO_FOR.intro}</p>
            <div className="jn-fit-cols">
              <div className="jn-fit-col jn-fit-col--yes">
                <h3 className="jn-fit-title">{WHO_FOR.forYou.title}</h3>
                <ul>
                  {WHO_FOR.forYou.items.map((t) => (
                    <li key={t}>
                      <Tick />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="jn-fit-col jn-fit-col--no">
                <h3 className="jn-fit-title">{WHO_FOR.notForYou.title}</h3>
                <ul>
                  {WHO_FOR.notForYou.items.map((t) => (
                    <li key={t}>
                      <Cross />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Stop>
        </section>
      </div>
    </div>
  );
}
