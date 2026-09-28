import { lookAt, whiteAt, TONES } from "./scene/looks";
import { CAMPS } from "./copy";

/**
 * The page's one loop. Scroll → ascent position p (damped, never jumps) → the
 * HUD, the white bloom, the header's tone, the sky behind everything, the
 * title tracks, the phone, the stills, the sound and the WebGL frame.
 *
 * Nothing here re-renders React: it writes CSS variables, attributes and text
 * straight to the elements it was given, once per frame, only when they change.
 *
 * p runs 0 → 6: chapter i spans [i, i+1) from the moment its top crosses the
 * middle of the screen (base camp starts at the top of the page).
 */

const ss = (a, b, v) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const toCss = (c) => `rgb(${Math.round(c[0] * 255)} ${Math.round(c[1] * 255)} ${Math.round(c[2] * 255)})`;

export function createController(root, opts) {
  const state = {
    p: 0,
    target: 0,
    engine: null,
    sound: null,
    calm: opts.calm,
    pointer: { x: 0, y: 0 },
    // ?snap=1 (screenshots): no damping, the climb lands exactly where the scroll is
    snap: new URLSearchParams(window.location.search).get("snap") === "1",
  };
  let chapters = [];
  let tracks = [];
  let phone = null;
  let raf = 0;
  let lastT = 0;
  let vh = window.innerHeight;
  let sleeping = false;

  const hudAlt = root.querySelectorAll("[data-hud-alt]");
  const hudName = root.querySelectorAll("[data-hud-name]");
  const hudTicks = root.querySelectorAll("[data-hud-tick]");
  const white = root.querySelector("[data-white]");
  let stills = [];
  const look = {};
  let lastCamp = -1;
  let lastTone = "";
  let lastAlt = "";
  let summitLp = 0;

  function measure() {
    vh = window.innerHeight;
    const sy = window.scrollY;
    chapters = [...root.querySelectorAll("[data-camp]")].map((el) => {
      const r = el.getBoundingClientRect();
      return { el, top: r.top + sy, bottom: r.bottom + sy };
    });
    tracks = [...root.querySelectorAll("[data-track]")].map((el) => {
      const r = el.getBoundingClientRect();
      return { el, top: r.top + sy, h: r.height, shown: el.classList.contains("is-in"), out: -1 };
    });
    phone = root.querySelector("[data-phone]");
    stills = [...root.querySelectorAll("[data-still]")];
    stills.forEach((el) => (el.__o = undefined));
  }

  /*
   * Within a chapter, the first and last EDGE px of scroll map to the first and
   * last 9% of p — the band where the light changes under the white bloom. So a
   * boundary always takes the same short stretch of scroll (≈ 0.3 of a screen),
   * however long the chapter is, and it happens over the empty sky each chapter
   * ends with, never over text.
   */
  function edgeMap(d, len) {
    const E = Math.min(vh * 0.3, len * 0.2);
    const F = 0.09;
    if (d <= 0) return 0;
    if (d >= len) return 1;
    if (d < E) return (d / E) * F;
    if (d > len - E) return 1 - ((len - d) / E) * F;
    return F + ((d - E) / Math.max(1, len - 2 * E)) * (1 - 2 * F);
  }

  function targetP() {
    if (!chapters.length) return 0;
    const y = window.scrollY + vh * 0.5;
    const n = chapters.length;
    for (let i = 0; i < n; i++) {
      const start = i === 0 ? vh * 0.5 : chapters[i].top;
      const end = i + 1 < n ? chapters[i + 1].top : chapters[i].bottom;
      if (y < end || i === n - 1) {
        return Math.min(7, i + edgeMap(y - start, end - start));
      }
    }
    return 7;
  }

  function writeDom(p) {
    // altitude: camps 0..5, counting between them
    const a = Math.min(5, Math.max(0, p));
    const i = Math.min(4, Math.floor(a));
    const alt = Math.round(CAMPS[i].alt + (CAMPS[i + 1].alt - CAMPS[i].alt) * (a - i));
    const altTxt = alt.toLocaleString("en-US");
    if (altTxt !== lastAlt) {
      lastAlt = altTxt;
      hudAlt.forEach((el) => (el.textContent = altTxt));
    }
    const camp = Math.min(5, Math.floor(p + 0.02));
    if (camp !== lastCamp) {
      lastCamp = camp;
      hudName.forEach((el) => (el.textContent = CAMPS[camp].name));
      hudTicks.forEach((el, k) => {
        if (k === camp) el.setAttribute("aria-current", "step");
        else el.removeAttribute("aria-current");
      });
    }
    root.style.setProperty("--as-climb", (a / 5).toFixed(4));

    // white bloom (the low tier and reduced motion keep only the basin's haze, no flashes)
    const w = state.calm ? ss(2.02, 2.2, p) * (1 - ss(2.62, 2.92, p)) * 0.5 : whiteAt(p);
    if (white) white.style.opacity = w.toFixed(3);

    // the sunrise itself is bright: navy chrome while the summit title holds, cream once the veil comes
    const ch = Math.min(6, Math.floor(p));
    const tone = w > 0.45 || (ch === 5 && summitLp < 1.05) ? "light" : TONES[ch];
    if (tone !== lastTone) {
      lastTone = tone;
      root.setAttribute("data-tone", tone);
    }

    // the sky behind everything (what shows before WebGL, or without it)
    lookAt(p, look);
    root.style.setProperty("--as-sky-top", toCss(look.skyTop));
    root.style.setProperty("--as-sky-hor", toCss(look.skyHor));

    // stills: the pair around p cross-fade
    if (stills.length) {
      const c = Math.min(6, Math.max(0, p - 0.35));
      const k = Math.floor(c);
      const f = c - k;
      stills.forEach((el, idx) => {
        const o = idx < k ? 0 : idx === k ? 1 : idx === k + 1 ? f : 0;
        const on = idx === k || idx === k + 1;
        if (el.__o !== o) {
          el.__o = o;
          el.style.opacity = idx === k ? "1" : String(o);
          el.style.visibility = on ? "visible" : "hidden";
        }
        if (Math.abs(idx - k) <= 2 && !el.getAttribute("src") && el.dataset.src) el.setAttribute("src", el.dataset.src);
      });
    }
  }

  function writeTracks() {
    const sy = window.scrollY;
    for (const t of tracks) {
      if (!t.shown && t.top < sy + vh * 0.82) {
        t.shown = true;
        t.el.classList.add("is-in");
      }
      const span = Math.max(1, t.h - vh);
      const lp = (sy - t.top) / span;
      const out = ss(0.72, 1.08, lp);
      if (t.el.parentElement && t.el.parentElement.getAttribute("data-camp") === "5") summitLp = lp;
      if (Math.abs(out - t.out) > 0.002) {
        t.out = out;
        t.el.style.setProperty("--out", out.toFixed(3));
      }
    }
    if (phone) {
      const r = phone.getBoundingClientRect();
      const q = state.calm ? 1 : ss(vh * 1.05, vh * 0.25, r.top);
      phone.style.setProperty("--straight", q.toFixed(3));
    }
  }

  function tick(now) {
    raf = 0;
    const dt = lastT ? Math.min(0.1, (now - lastT) / 1000) : 0.016;
    lastT = now;
    state.target = targetP();
    const k = state.calm || state.snap ? 1 : 1 - Math.exp(-dt * 4.2);
    state.p += (state.target - state.p) * k;
    if (Math.abs(state.target - state.p) < 1e-4) state.p = state.target;

    writeDom(state.p);
    writeTracks();
    if (state.sound) state.sound.update(state.p);
    if (state.engine && !document.hidden) state.engine.frame(state.p, now, state.pointer);

    const moving = state.p !== state.target;
    if (state.engine || moving) schedule();
    else sleeping = true;
  }

  function schedule() {
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function wake() {
    if (sleeping) {
      sleeping = false;
      lastT = 0;
    }
    schedule();
  }

  const onScroll = () => wake();
  const onResize = () => {
    measure();
    if (state.engine) state.engine.resize();
    wake();
  };
  const onPointer = (e) => {
    if (e.pointerType !== "mouse") return;
    state.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    state.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  const onVis = () => {
    if (!document.hidden) wake();
  };

  const ro = "ResizeObserver" in window ? new ResizeObserver(() => onResize()) : null;
  if (ro) ro.observe(root);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  window.addEventListener("pointermove", onPointer, { passive: true });
  document.addEventListener("visibilitychange", onVis);
  measure();
  state.target = targetP();
  state.p = state.target;
  wake();

  return {
    get p() {
      return state.p;
    },
    setEngine(engine) {
      state.engine = engine;
      if (engine) engine.resize();
      wake();
    },
    setSound(s) {
      state.sound = s;
    },
    setCalm(v) {
      state.calm = v;
      if (v) tracks.forEach((t) => t.el.classList.add("is-in"));
      wake();
    },
    remeasure() {
      measure();
      wake();
    },
    /** Scroll so camp i's chapter is where its title is fully in view. */
    jump(i) {
      const ch = chapters[i];
      if (!ch) return;
      const y = i === 0 ? 0 : ch.top + 2;
      window.scrollTo({ top: y, behavior: state.calm ? "auto" : "smooth" });
    },
    dispose() {
      if (raf) cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVis);
    },
  };
}
