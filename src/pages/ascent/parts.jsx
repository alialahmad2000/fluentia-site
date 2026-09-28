import { Fragment, useEffect, useRef, useState } from "react";
import BrandMark from "../../components/BrandMark";
import { NAV } from "../landing-v2/content";
import { CAMPS, METRE, INTRO, HEADER_CTA, SOUND_ON, SOUND_OFF, PERF_LABEL, PERF_OPTIONS } from "./copy";

/**
 * A title that rises word by word, each word out of its own mask. Words are
 * never split: an Arabic word is one text node, so its letters stay joined.
 * The reveal itself is CSS (`.is-in` on the chapter's track, or an animation
 * for the hero), so the prerendered page needs no JavaScript to show it.
 */
export function Title({ lines, as: Tag = "h2", id, className = "" }) {
  let i = 0;
  return (
    <Tag id={id} className={`as-title ${className}`}>
      {lines.map((line, li) => {
        const words = line.split(" ");
        return (
          <span className="as-tl" key={li}>
            {words.map((w, wi) => {
              const k = i++;
              return (
                <Fragment key={wi}>
                  <span className="as-w">
                    <span style={{ "--i": k }}>{w}</span>
                  </span>
                  {wi < words.length - 1 ? " " : null}
                </Fragment>
              );
            })}
          </span>
        );
      })}
    </Tag>
  );
}

/** The camp label above each chapter title: name · altitude م. */
export function CampTag({ i }) {
  const c = CAMPS[i];
  return (
    <p className="as-camp">
      <span>{c.name}</span>
      <span className="as-camp-dot" aria-hidden="true" />
      <span className="as-num" dir="ltr">
        {c.alt.toLocaleString("en-US")}
      </span>
      <span>{METRE}</span>
    </p>
  );
}

/* ─── header ──────────────────────────────────────────────────────────────── */

function SoundIcon({ on }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" />
      {on ? (
        <path d="M15.5 9a4.5 4.5 0 010 6M18 6.5a8 8 0 010 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      ) : (
        <path d="M16 9.5l5 5M21 9.5l-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      )}
    </svg>
  );
}

export function Header({ sound, onSound }) {
  return (
    <header className="as-header">
      <a href="/" className="as-brand" aria-label={`${NAV.brand.ar} — الصفحة الرئيسية`}>
        <BrandMark size={30} />
        <span className="as-brand-ar">{NAV.brand.ar}</span>
      </a>
      <div className="as-header-actions">
        <button
          type="button"
          className="as-sound"
          aria-pressed={sound}
          aria-label={sound ? SOUND_ON : SOUND_OFF}
          onClick={onSound}
        >
          <SoundIcon on={sound} />
          <span className="as-sound-label">{sound ? SOUND_ON : SOUND_OFF}</span>
        </button>
        <button type="button" data-open-form className="as-btn as-btn--sm">
          {HEADER_CTA}
        </button>
      </div>
    </header>
  );
}

/* ─── altitude HUD ────────────────────────────────────────────────────────── */

export function Hud({ onJump }) {
  return (
    <nav className="as-hud" aria-label="مراحل الصعود">
      <div className="as-hud-read" aria-hidden="true">
        <span className="as-hud-alt">
          <span className="as-num" dir="ltr" data-hud-alt="">
            {CAMPS[0].alt.toLocaleString("en-US")}
          </span>
          <span className="as-hud-m">{METRE}</span>
        </span>
        <span className="as-hud-name" data-hud-name="">
          {CAMPS[0].name}
        </span>
      </div>
      <ol className="as-hud-line">
        {CAMPS.map((c, i) => (
          <li key={c.id} style={{ "--k": i }}>
            <button
              type="button"
              className="as-hud-tick"
              data-hud-tick=""
              aria-current={i === 0 ? "step" : undefined}
              onClick={() => onJump(i)}
            >
              <span className="as-sr">
                {c.name} · {c.alt.toLocaleString("en-US")} {METRE}
              </span>
            </button>
          </li>
        ))}
        <li className="as-hud-marker" aria-hidden="true" />
      </ol>
    </nav>
  );
}

/* ─── intro ───────────────────────────────────────────────────────────────── */

/**
 * The whiteout the page opens in. It is in the prerendered markup and plays
 * by CSS alone (html.as-intro, set by the boot script before first paint), so
 * the hero underneath is already in the DOM. JavaScript only adds tap/Esc to
 * skip and takes the class off when it is over.
 */
export function Intro() {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const d = document.documentElement;
    if (!window.__asIntro || !d.classList.contains("as-intro")) {
      setGone(true);
      return undefined;
    }
    const end = () => {
      d.classList.add("as-intro-out");
      window.setTimeout(() => {
        d.classList.remove("as-intro", "as-intro-out");
        window.__asIntro = false;
        setGone(true);
      }, 520);
    };
    const t = window.setTimeout(() => {
      d.classList.remove("as-intro");
      window.__asIntro = false;
      setGone(true);
    }, 2650);
    const skip = () => {
      window.clearTimeout(t);
      end();
    };
    const onKey = (e) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") skip();
    };
    window.addEventListener("pointerdown", skip, { once: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", onKey);
    };
  }, []);
  if (gone) return null;
  return (
    <div className="as-intro-layer" aria-hidden="true">
      <div className="as-intro-fog" />
      <p className="as-intro-text">
        <span className="as-intro-l as-intro-l1">{INTRO[0]}</span>
        <span className="as-intro-l as-intro-l2">{INTRO[1]}</span>
      </p>
    </div>
  );
}

/* ─── backdrop: sky, stills, canvas, white bloom ──────────────────────────── */

const STILLS = import.meta.glob("./stills/*.webp", { eager: true, query: "?url", import: "default" });
const still = (set, i) => STILLS[`./stills/${set}${i}.webp`] || null;

export function Backdrop({ canvasRef, fxRef, stillSet, showStills }) {
  const list = [0, 1, 2, 3, 4, 5, 6].map((i) => (stillSet ? still(stillSet, i) : null));
  return (
    <div className="as-backdrop" aria-hidden="true">
      <div className="as-sky" />
      <div className={`as-stills${showStills ? "" : " is-off"}`}>
        {list.map((src, i) =>
          src ? (
            <img
              key={i}
              data-still=""
              data-src={src}
              src={i === 0 ? src : undefined}
              alt=""
              decoding="async"
              style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? "visible" : "hidden" }}
            />
          ) : null
        )}
      </div>
      <canvas ref={canvasRef} className="as-canvas" />
      <canvas ref={fxRef} className="as-fx" />
      <div className="as-white" data-white="" />
    </div>
  );
}

/* ─── performance control ─────────────────────────────────────────────────── */

export function PerfControl({ mode, onMode }) {
  return (
    <div className="as-perf" role="group" aria-label={PERF_LABEL}>
      <span className="as-perf-label">{PERF_LABEL}</span>
      {PERF_OPTIONS.map((o, i) => (
        <Fragment key={o.value}>
          {i ? (
            <span className="as-perf-sep" aria-hidden="true">
              /
            </span>
          ) : null}
          <button type="button" className="as-perf-opt" aria-pressed={mode === o.value} onClick={() => onMode(o.value)}>
            {o.label}
          </button>
        </Fragment>
      ))}
    </div>
  );
}

/** Count up once when shown (the stats of the high zone). */
export function Count({ to, prefix = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const calm =
      document.documentElement.getAttribute("data-as-tier") === "low" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (calm || !("IntersectionObserver" in window)) return undefined;
    let raf = 0;
    el.textContent = prefix + "0";
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const step = (now) => {
          const f = Math.min(1, (now - t0) / 1600);
          const v = Math.round(to * (1 - Math.pow(1 - f, 3)));
          el.textContent = prefix + v.toLocaleString("en-US");
          if (f < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = prefix + to.toLocaleString("en-US");
    };
  }, [to, prefix]);
  return (
    <span ref={ref} className="as-num" dir="ltr">
      {prefix + to.toLocaleString("en-US")}
    </span>
  );
}
