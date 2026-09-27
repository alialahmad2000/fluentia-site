import { useCallback, useEffect, useRef, useState } from "react";
import { SOCIAL_PROOF, TRUSTED_LOGOS } from "../landing-v2/content";
import Giant from "./Giant";
import { useJourney } from "./context";
import { TITLES } from "./copy";
import { reducedMotion } from "./line";
import seaDesk from "./stills/sea-d.webp";
import seaPhone from "./stills/sea-m.webp";

/**
 * Leg 5 — a sea of voices, at night again. Hundreds of waveform lines seen
 * from above (gl/sea.js); your pulse crosses it as you scroll and leaves a
 * bright wake, and a finger or a cursor leaves one too.
 *
 * There are no verbatim student quotes in the repo (the homepage hides its
 * STORIES stand-ins until real ones exist), so no line carries a quote. What
 * the homepage does say is where its students come from: each of the five
 * entities in TRUSTED_LOGOS is bound to one line of the sea, lit brighter —
 * tap it for the entity. The homepage stats count up as the pulse passes.
 */

function parseStat(v) {
  const m = String(v).match(/^(\+?)(\d+)(K?)$/);
  if (!m) return null;
  return { prefix: m[1], num: Number(m[2]) * (m[3] ? 1000 : 1) };
}

function Stat({ s, on, still }) {
  const ref = useRef(null);
  const done = useRef(false);
  const p = parseStat(s.value);
  useEffect(() => {
    const p = parseStat(s.value);
    if (!on || done.current || !p || still) return undefined;
    done.current = true;
    const el = ref.current;
    const t0 = performance.now();
    let raf = 0;
    const step = (now) => {
      const k = Math.min(1, (now - t0) / 1400);
      const e = 1 - Math.pow(1 - k, 4);
      el.textContent = `${p.prefix}${Math.round(p.num * e).toLocaleString("en-US")}`;
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      if (el) el.textContent = `${p.prefix}${p.num.toLocaleString("en-US")}`;
    };
  }, [on, s.value, still]);
  const final = p ? `${p.prefix}${p.num.toLocaleString("en-US")}` : s.value;
  return (
    <div className="jn-stat" data-on={on || still ? "" : undefined}>
      <span ref={ref} className="jn-stat-num" dir="ltr">
        {final}
      </span>
      <span className="jn-stat-label">{s.label}</span>
    </div>
  );
}

export default function Sea() {
  const { cfg, fx, dropToLow } = useJourney();
  const secRef = useRef(null);
  const canvasRef = useRef(null);
  const seaRef = useRef(null);
  const chipsRef = useRef([]);
  const lastFocus = useRef(null);
  const dialogRef = useRef(null);
  const [lit, setLit] = useState(0); // how many stats have been passed
  const [open, setOpen] = useState(-1);
  const webgl = Boolean(cfg && cfg.webgl);
  const items = TRUSTED_LOGOS.items;

  const place = useCallback(() => {
    const sea = seaRef.current;
    if (!sea) return;
    // a phone: at the right end of each line (content is above); wider: at the
    // left end, clear of the title and stats on the right
    const wide = window.innerWidth >= 900;
    sea.boundEnds(wide ? "left" : "right").forEach((p, i) => {
      const el = chipsRef.current[i];
      if (!el) return;
      const x = wide ? p.x : p.x - window.innerWidth;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) translateY(-50%)`;
    });
  }, []);

  useEffect(() => {
    if (!webgl) return undefined;
    let alive = true;
    let sea = null;
    let io = null;
    let onVis = null;
    let onResize = null;
    import("./gl/sea").then(({ createSea }) => {
      if (!alive || !canvasRef.current) return;
      try {
        sea = createSea(canvasRef.current, { cfg, bound: items, onLost: dropToLow, reduced: reducedMotion() });
      } catch {
        dropToLow();
        return;
      }
      seaRef.current = sea;
      secRef.current?.setAttribute("data-gl", "");
      let inView = false;
      const sync = () => (inView && document.visibilityState === "visible" ? sea.start() : sea.stop());
      io = new IntersectionObserver(([e]) => {
        inView = e.isIntersecting;
        sync();
      });
      io.observe(secRef.current);
      onVis = sync;
      document.addEventListener("visibilitychange", onVis);
      onResize = () => {
        sea.resize();
        place();
      };
      window.addEventListener("resize", onResize);
      place();
    });
    return () => {
      alive = false;
      io?.disconnect();
      if (onVis) document.removeEventListener("visibilitychange", onVis);
      if (onResize) window.removeEventListener("resize", onResize);
      sea?.dispose();
      seaRef.current = null;
    };
  }, [webgl, cfg, dropToLow, items, place]);

  // The pulse crosses with the scroll; each stat lights as it passes.
  useEffect(() => {
    if (!fx || !webgl) return undefined;
    const { ScrollTrigger } = fx;
    const sec = secRef.current;
    const st = ScrollTrigger.create({
      trigger: sec,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        seaRef.current?.setProgress(self.progress);
        const n = Math.min(4, Math.floor((self.progress + 0.08) / 0.16));
        setLit((cur) => Math.max(cur, n));
      },
    });
    return () => st.kill();
  }, [fx, webgl]);

  // A tap on the water near a lit line opens that line's entity.
  const onStageClick = (e) => {
    const sea = seaRef.current;
    if (!sea || e.target.closest("button, a")) return;
    const i = sea.hitLine(e.clientX, e.clientY);
    if (i >= 0) {
      lastFocus.current = chipsRef.current[i];
      setOpen(i);
    }
  };

  useEffect(() => {
    if (open < 0) return undefined;
    const d = dialogRef.current;
    d?.querySelector("button")?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(-1);
      if (e.key === "Tab") {
        e.preventDefault();
        d?.querySelector("button")?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      lastFocus.current?.focus?.();
    };
  }, [open]);

  const still = cfg && !cfg.webgl;

  return (
    <section id="jn-sea" ref={secRef} className="jn-sea" data-theme="night" data-leg="5" aria-labelledby="jn-sea-title">
      <div className="jn-sea-stage" onClick={onStageClick}>
        <picture className="jn-sea-still" aria-hidden="true">
          <source media="(max-aspect-ratio: 4/5)" srcSet={seaPhone} />
          <img src={seaDesk} alt="" decoding="async" loading="lazy" />
        </picture>
        <canvas ref={canvasRef} className="jn-sea-canvas" aria-hidden="true" />

        <div className="jn-sea-head">
          <Giant id="jn-sea-title" className="jn-sea-title" lines={TITLES.sea} tones={["cream", "ice"]} />
          <div className="jn-stats">
            {SOCIAL_PROOF.stats.map((s, i) => (
              <Stat key={s.label} s={s} on={lit > i} still={still} />
            ))}
          </div>
        </div>

        <div className="jn-chips">
          <p className="jn-chips-lead">
            {TRUSTED_LOGOS.lead} <b>{TRUSTED_LOGOS.emphasis}</b>
          </p>
          {items.map((it, i) => (
            <button
              key={it.name}
              ref={(el) => (chipsRef.current[i] = el)}
              type="button"
              className="jn-chip"
              aria-haspopup="dialog"
              onClick={(e) => {
                lastFocus.current = e.currentTarget;
                setOpen(i);
              }}
            >
              <span className="jn-chip-dot" aria-hidden="true" />
              {it.name}
            </button>
          ))}
        </div>

        {open >= 0 ? (
          <div className="jn-entity-scrim" onClick={() => setOpen(-1)}>
            <div
              ref={dialogRef}
              className="jn-entity"
              role="dialog"
              aria-modal="true"
              aria-label={items[open].name}
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" className="jn-entity-close" aria-label="إغلاق" onClick={() => setOpen(-1)}>
                <span aria-hidden="true" />
                <span aria-hidden="true" />
              </button>
              <img src={items[open].src} alt="" className="jn-entity-logo" />
              <p className="jn-entity-lead">
                {TRUSTED_LOGOS.lead} <b>{TRUSTED_LOGOS.emphasis}</b>
              </p>
              <p className="jn-entity-name">{items[open].name}</p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
