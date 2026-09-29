import { useEffect, useRef } from "react";
import Giant from "../Giant";
import { useJourney } from "../context";
import { CTA_LABEL, DESTS, HEADLINE, HERO_SUB, HOMES, TITLES, TRUST_LINE } from "../copy";
import { useStage, win, ease, lerp } from "../core/stage";
import { vh, vw, isPhone, onLayout } from "../core/viewport";
import { claim, anchor, strokeVoice, wave, voiceStep, voiceTo, SKY } from "../core/voice";
import * as gl from "../gl/manager";
import { shared } from "../core/shared";
import globeDesk from "../stills/globe-d.webp";
import globePhone from "../stills/globe-m.webp";

/**
 * Leg 1 — the night globe, and 1→2 — the fall (0.9 screens).
 *
 * At rest the globe turns one way, voice arcs leave الرياض / جدة / الدمام,
 * hug the surface, land and pulse; Riyadh breathes. Scrolling, the voice falls:
 *   0.00–0.12  the headline leaves
 *   0.02–0.20  every arc runs back home into Riyadh; the camera closes on the Gulf
 *   0.10–0.20  a bead of light (gold → sky) leaves Riyadh and comes toward you
 *   0.20–0.50  the fall: a streak above it, cloud decks rushing up (they keep
 *              falling while you rest)
 *   0.38–0.60  day opens FROM the voice — one solid disc, drawn by the voice layer
 *   0.50–0.64  it lands, with weight: the bead squashes, the line ripples
 *   0.66–1.00  it unrolls into the flat line the next leg owns — the leg ends
 *              exactly as the line reaches both edges (no empty frame)
 */
const BANDS = ["#0b2447", "#0e3a6b", "#135a98", "#1b7fc4", "#57b5ea", "#a9dcf7"];
const ALL = [...HOMES.map((h) => ({ ...h, home: true })), ...DESTS.map((d) => ({ ...d, home: false }))];
const hex = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const GOLD = hex("#fbbf24");
const ICE = hex("#e0f5ff");

export default function Hero() {
  const { cfg, introDone, fx, reduce, glAlive } = useJourney();
  const secRef = useRef(null);
  const stageRef = useRef(null);
  const copyRef = useRef(null);
  const tagRefs = useRef({});
  const drag = useRef({ x: 0, v: 0, down: false, lx: 0 });
  const landed = useRef({ at: -1 });
  const fallClock = useRef(0);
  const last = useRef({ theme: "", out: "", dayOn: null });
  const copyBox = useRef({ top: 9999, left: 0, right: 0 });
  const bands = useRef({ W: 0, list: [] });
  const webgl = Boolean(cfg && cfg.webgl && glAlive);

  useEffect(() => {
    if (cfg?.webgl) gl.warm("globe");
  }, [cfg]);

  // tags never sit on the words: cache the copy's box on layout
  useEffect(() => {
    const m = () => {
      const r = copyRef.current.getBoundingClientRect();
      copyBox.current = { top: r.top + window.scrollY - 24, left: r.left - 30, right: r.right + 10 };
    };
    m();
    return onLayout(m);
  }, []);

  // desktop drag: horizontal only, inertia, eases home
  useEffect(() => {
    const st = stageRef.current;
    if (!st || !window.matchMedia("(pointer: fine)").matches) return undefined;
    const d = drag.current;
    const down = (e) => {
      if (e.button !== 0 || e.target.closest("a, button")) return;
      d.down = true;
      d.lx = e.clientX;
    };
    const move = (e) => {
      if (!d.down) return;
      d.v = (e.clientX - d.lx) * 0.004;
      d.x += d.v;
      d.lx = e.clientX;
    };
    const up = () => (d.down = false);
    st.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up);
    return () => {
      st.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  // the headline rises once the intro hands over
  useEffect(() => {
    if (!fx || !introDone) return undefined;
    const { gsap } = fx;
    const el = copyRef.current;
    const ctx = gsap.context(() => {
      gsap.fromTo(el.querySelectorAll(".jn-wi"), { yPercent: 110, y: 0 }, { yPercent: 0, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.06, delay: 0.05 });
      gsap.fromTo(el.querySelectorAll(".jn-rise"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.08, delay: 0.4 });
    }, el);
    return () => ctx.revert();
  }, [fx, introDone]);

  useStage(secRef, (p, { t, dt }) => {
    const W = vw();
    const H = vh();
    const phone = isPhone();
    const copy = copyRef.current;
    if (reduce) {
      if (webgl) gl.show("globe", 1, t);
      return;
    }
    const d = drag.current;
    if (!d.down) {
      d.v *= 0.92;
      d.x += d.v;
      d.x *= 1 - dt * 0.4;
    }
    const g = gl.params("globe");
    if (g) {
      g.dive = Math.min(0.6, p * 1.25);
      g.dragX = d.x;
    }
    const open = ease.in2(win(p, 0.22, 0.42));
    if (webgl && open < 1) gl.show("globe", 1, t);
    // the day leg lies underneath, already held: the disc reveals it
    const dayOn = open >= 1;
    if (dayOn !== last.current.dayOn) {
      document.documentElement.toggleAttribute("data-jn-day", dayOn);
      last.current.dayOn = dayOn;
    }
    shared.fallDone = p >= 0.999;

    // headline exit (scrubbed)
    const out = win(p, 0, 0.12).toFixed(3);
    if (out !== last.current.out) {
      copy.style.setProperty("--out", out);
      copy.style.visibility = out === "1.000" ? "hidden" : "";
      last.current.out = out;
    }
    const theme = open >= 1 ? "day" : "night";
    if (theme !== last.current.theme) {
      secRef.current.setAttribute("data-theme", theme);
      last.current.theme = theme;
    }

    // tags follow the globe (DOM text stays crisp)
    const tags = g?.tags || [];
    const placed = [];
    const cb = copyBox.current;
    const fade = 1 - Number(out);
    for (const tg of tags) {
      const el = tagRefs.current[tg.code];
      if (!el) continue;
      let a = tg.a * fade;
      if (tg.y > cb.top && tg.x > cb.left && tg.x < cb.right) a = 0;
      for (const q of placed) if (Math.abs(q.x - tg.x) < 70 && Math.abs(q.y - tg.y) < 26) a = 0;
      if (a > 0.05) placed.push(tg);
      el.style.opacity = a.toFixed(2);
      if (a > 0.01) el.style.transform = `translate3d(${tg.x.toFixed(1)}px, ${tg.y.toFixed(1)}px, 0)`;
    }

    // ── the fall ──
    const ruh = g?.ruh || { x: phone ? W * 0.56 : W * 0.3, y: phone ? H * 0.34 : H * 0.44 };
    const cx = W / 2;
    const cy = H * 0.42;
    const floorY = H * (phone ? 0.87 : 0.85);
    const x0 = W * (phone ? 0.06 : 0.08);
    const x1 = W - x0;
    const detach = ease.inOut3(win(p, 0.1, 0.2));
    const land = ease.in2(win(p, 0.5, 0.64));
    const unroll = ease.out3(win(p, 0.66, 1));
    const fx_ = lerp(ruh.x, cx, detach);
    const fy = lerp(lerp(ruh.y, cy, detach), floorY, land);
    const streak = H * 0.34 * win(p, 0.16, 0.26) * (1 - land);
    const bandsOn = win(p, 0.14, 0.18) * (1 - win(p, 0.3, 0.36));
    fallClock.current += dt * 0.35 * bandsOn;
    const travel = 3 * p + 10 * ease.inOut2(win(p, 0.14, 0.36)) + fallClock.current;
    if (land >= 1 && landed.current.at < 0) landed.current.at = t;
    if (land < 0.98) landed.current.at = -1;
    const since = landed.current.at < 0 ? 99 : (t - landed.current.at) / 1000;
    const squash = Math.exp(-since * 9);
    if (bands.current.W !== W) {
      bands.current.W = W;
      bands.current.list = Array.from({ length: 22 }, (_, i) => {
        const w = W * (0.35 + ((i * 37) % 10) / 14);
        const xL = (((i * 53) % 100) / 100) * (W - w * 0.5) - w * 0.25;
        return { w, xL, c: BANDS[i % BANDS.length], a: 0.45 + ((i * 7) % 5) / 9, lane: (i * 0.618034) % 1, h: 1 + (i % 3) * 0.8, g: null };
      });
    }
    if (p <= 0.1) return;
    claim(
      "fall",
      (ctx) => {
        voiceTo({ amp: unroll > 0 ? 2.8 : 0, energy: 0.15, thick: 2.6, glow: 0 });
        const v = voiceStep(t, dt);
        // day opens from the voice
        if (open > 0 && open < 1) {
          ctx.fillStyle = "#f3f7fb";
          ctx.beginPath();
          ctx.arc(fx_, fy, Math.hypot(W, H) * open, 0, Math.PI * 2);
          ctx.fill();
        }
        if (bandsOn > 0.01) {
          for (const b of bands.current.list) {
            if (!b.g) {
              b.g = ctx.createLinearGradient(b.xL, 0, b.xL + b.w, 0);
              b.g.addColorStop(0, b.c + "00");
              b.g.addColorStop(0.5, b.c);
              b.g.addColorStop(1, b.c + "00");
            }
            const y = H * 1.1 - ((b.lane + travel) % 1) * H * 1.3;
            ctx.globalAlpha = bandsOn * b.a;
            ctx.fillStyle = b.g;
            ctx.fillRect(b.xL, y, b.w, b.h);
          }
          ctx.globalAlpha = 1;
        }
        if (unroll > 0) {
          const half = ((x1 - x0) / 2) * unroll;
          const rip = Math.exp(-win(p, 0.66, 0.8) * 5) * 8;
          const pts = [];
          for (let i = 0; i <= 96; i++) {
            const u = i / 96;
            pts.push([fx_ - half + half * 2 * u, floorY + wave(u, v.t, v.amp) + (1 - Math.abs(u - 0.5) * 2) * rip * Math.sin(u * 40)]);
          }
          strokeVoice(ctx, pts, { thick: v.thick, glow: 0 });
          anchor("fall-end", fx_ + half, floorY);
          return;
        }
        if (streak > 1) {
          ctx.strokeStyle = SKY;
          ctx.lineCap = "round";
          ctx.lineWidth = 2.6;
          ctx.globalAlpha = 0.9;
          ctx.beginPath();
          ctx.moveTo(fx_, fy - streak);
          ctx.lineTo(fx_, fy);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        const r = 3 + detach * 3.5;
        ctx.fillStyle = `rgb(${lerp(GOLD[0], ICE[0], detach) | 0},${lerp(GOLD[1], ICE[1], detach) | 0},${lerp(GOLD[2], ICE[2], detach) | 0})`;
        ctx.beginPath();
        ctx.ellipse(fx_, fy, r * (1 + 0.6 * squash), r * (1 - 0.45 * squash), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = SKY;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(fx_, fy, r + 5, 0, Math.PI * 2);
        ctx.stroke();
        anchor("fall-bead", fx_, fy);
      },
      t,
      0
    );
  });

  return (
    <section id="jn-top" ref={secRef} className="jn-hero" data-theme="night" data-leg="1" aria-labelledby="jn-hero-title">
      <div ref={stageRef} className="jn-stage jn-hero-stage">
        <picture className="jn-still" aria-hidden="true">
          <source media="(max-aspect-ratio: 4/5)" srcSet={globePhone} />
          <img src={globeDesk} alt="" decoding="async" />
        </picture>
        <div className="jn-tags" aria-hidden="true">
          {ALL.map((c) => (
            <span key={c.code} ref={(el) => (tagRefs.current[c.code] = el)} className={`jn-tag${c.home ? " jn-tag--home" : ""}`}>
              {c.name}
            </span>
          ))}
        </div>
        <div className="jn-safe">
          <div ref={copyRef} className="jn-hero-copy">
            <p className="jn-hero-eyebrow jn-rise">
              <span>{TITLES.hero[0]}</span>
              <span aria-hidden="true" className="jn-dot" />
              <span>{TITLES.hero[1]}</span>
            </p>
            <Giant id="jn-hero-title" as="h1" className="jn-hero-title" lines={[HEADLINE.a, HEADLINE.b]} tones={["cream", "gold"]} srText={HEADLINE.full} />
            <p className="jn-hero-sub jn-rise">{HERO_SUB}</p>
            <div className="jn-hero-actions jn-rise">
              <button type="button" data-open-form className="jn-btn jn-btn--cream jn-btn--lg">
                {CTA_LABEL}
                <span aria-hidden="true">←</span>
              </button>
              <p className="jn-trust">{TRUST_LINE}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
