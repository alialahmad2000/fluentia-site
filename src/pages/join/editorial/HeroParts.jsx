/**
 * /join editorial — Header, Hero (+ the lead-form slot), Intro, StickyCta.
 *
 * The hero is the reference's signature move: a calligraphic headline and a
 * giant Latin marquee sit in a sticky "stage"; the photograph that follows
 * in normal flow scrolls UP OVER them (stage z 0, photo z 1). The stage lets
 * go when the hero section ends, so the headline leaves with the photo.
 * The lead form rides on the photo: a card hanging off its lower inline-end
 * edge on desktop, overlapping its bottom edge on phones.
 *
 * Copy: HERO / WORTH from landing-v2/content.js, CTA from joinContent.js.
 */
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { HERO, WORTH } from "../../landing-v2/content";
import { CTA } from "../joinContent";
import { EASE, LineReveal, Marquee } from "./primitives";

/* ─────────────────────────── Header ─────────────────────────── */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className={`jx-header${scrolled ? " is-scrolled" : ""}`}>
      <div className="jx-header-row">
        <a className="jx-brand" href="#top" aria-label="طلاقة — أعلى الصفحة">
          <img src="/brand/fluentia-mark.svg" alt="" width="30" height="38" />
          <span className="jx-brand-word">طلاقة</span>
        </a>
        <a className="jx-btn jx-btn-primary jx-header-cta" href="#join-form" data-open-form>
          {CTA}
        </a>
      </div>
    </header>
  );
}

/* ─────────────────────────── Hero ─────────────────────────── */
const [HEAD_A, HEAD_B] = HERO.headline.split(/\s*—\s*/);
/* HERO.sub, condensed to its first two claims (no new facts). */
const HERO_SUB = "أكاديمية أونلاين للراشدين السعوديين، مبنية على منهج علمي. مدرّبون أكاديميون ومتابعة شخصية.";
const MARQUEE_TEXT = "Speak it, don’t memorize it";

function HeroPhoto() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);
  return (
    <figure className="jx-hero-photo" ref={ref}>
      <motion.div className="jx-hero-photo-inner" style={reduce ? undefined : { y }}>
        <picture>
          <source
            type="image/avif"
            srcSet="/home/worth-road-tall-640.avif 640w, /home/worth-road-tall-1024.avif 1024w"
            sizes="(min-width: 1100px) 820px, calc(100vw - 32px)"
          />
          <img
            src="/home/worth-road-tall-1024.webp"
            srcSet="/home/worth-road-tall-640.webp 640w, /home/worth-road-tall-1024.webp 1024w"
            sizes="(min-width: 1100px) 820px, calc(100vw - 32px)"
            width="1024"
            height="1365"
            alt="طريق مفتوح يمتد بين الجبال تحت سماء صافية"
            loading="eager"
            fetchpriority="high"
            decoding="async"
          />
        </picture>
      </motion.div>
    </figure>
  );
}

export function Hero({ form }) {
  return (
    <section className="jx-hero" id="top">
      <div className="jx-hero-stage">
        <div className="jx-wrap jx-hero-head">
          <LineReveal
            as="h1"
            onMount
            delay={0.1}
            className="jx-display jx-hero-h1"
            lines={[
              <span key="a">
                {HEAD_A}
                <span className="jx-sr"> — </span>
              </span>,
              HEAD_B,
            ]}
          />
        </div>

        <div className="jx-hero-marquee" aria-hidden="true">
          <Marquee baseSpeed={46} direction={-1} copies={4}>
            <span className="jx-hero-marquee-item" dir="ltr">
              {MARQUEE_TEXT}
              <span className="jx-hero-marquee-sep">—</span>
              Fluentia
              <span className="jx-hero-marquee-sep">—</span>
            </span>
          </Marquee>
        </div>

        <div className="jx-wrap jx-hero-foot">
          <p className="jx-hero-sub">{HERO_SUB}</p>
          <a className="jx-btn jx-btn-primary jx-hero-cta" href="#join-form" data-open-form>
            {CTA}
          </a>
          <ul className="jx-hero-ticks" aria-label="بدون مخاطرة">
            {HERO.trustRow.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="jx-hero-media">
        <HeroPhoto />
        <div className="jx-hero-formslot">{form}</div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Intro ─────────────────────────── */
export function Intro() {
  return (
    <section className="jx-section jx-intro" aria-labelledby="jx-intro-h">
      <div className="jx-wrap jx-intro-inner">
        {/* The in-view trigger sits on the h2, not on the masked line: an
            IntersectionObserver never sees a child translated out of its
            overflow:hidden mask, so a trigger on the child would never fire. */}
        <motion.h2
          id="jx-intro-h"
          className="jx-display jx-intro-h"
          initial="hide"
          whileInView="show"
          viewport={{ once: true, margin: "0px 0px -12% 0px" }}
        >
          <span className="jx-mask">
            <motion.span
              style={{ display: "block" }}
              variants={{ hide: { y: "110%" }, show: { y: "0%" } }}
              transition={{ duration: 1, ease: EASE }}
            >
              {WORTH.headline}
            </motion.span>
          </span>
        </motion.h2>
        <p className="jx-intro-p">{WORTH.intro}</p>
        <div className="jx-intro-actions">
          <a className="jx-btn jx-btn-primary" href="#join-form" data-open-form>{CTA}</a>
          <a className="jx-btn jx-btn-outline" href="#pricing">شوف الباقات</a>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── StickyCta ─────────────────────────── */
export function StickyCta({ show }) {
  return (
    <div className={`jx-sticky${show ? " is-on" : ""}`} aria-hidden={!show}>
      <a className="jx-btn jx-btn-primary jx-sticky-btn" href="#join-form" data-open-form tabIndex={show ? 0 : -1}>
        {CTA}
      </a>
    </div>
  );
}
