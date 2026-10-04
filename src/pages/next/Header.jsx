import { useCallback, useEffect, useRef, useState } from "react";
import BrandMark from "../../components/BrandMark";
import { NAV } from "../landing-v2/content";
import { track } from "./scroll";
import { CTA_LABEL } from "./copy";
import { useCta } from "../v1/ctaContext";

/**
 * Header — fixed. The wordmark on the right; on the left the primary action
 * (the homepage's `[data-open-form]` → V1LeadModal). On wide screens the
 * section links sit inline between them, as on the classic homepage's
 * V1Header (muted, brightening on hover; «دخول الطلاب» after them) — the one
 * whose section is on screen stays lit. Narrower, they fold into «القائمة».
 * Transparent over the hero; a blurred void ground after 80 px of scroll.
 *
 * The menu is a full-screen overlay: void ground (the starfield keeps drifting
 * behind it), giant section links that rise word by word. Focus is trapped
 * inside, Esc closes, a link tap closes and scrolls.
 */

export const MENU = [
  { href: "#fx-platform", label: "من داخل المنصة" },
  { href: "#fx-pains", label: "العائق ليس أنت" },
  { href: "#fx-how", label: "كيف نُزيله" },
  { href: "#fx-stats", label: "الأرقام كما هي" },
  { href: "#fx-between", label: "بين الحصص" },
  { href: "#fx-pricing", label: "اختر مسارك" },
  { href: "#fx-faq", label: "أسئلة صريحة" },
];

export default function Header() {
  // /join: «بين الحصص» is not on the page, «كيف تبدأ» is.
  const campaign = Boolean(useCta());
  const menu = campaign
    ? [
        ...MENU.filter((m) => m.href !== "#fx-between" && m.href !== "#fx-pricing" && m.href !== "#fx-faq"),
        { href: "#fx-steps", label: "كيف تبدأ" },
        ...MENU.filter((m) => m.href === "#fx-pricing" || m.href === "#fx-faq"),
      ]
    : MENU;
  const headRef = useRef(null);
  const overlayRef = useRef(null);
  const toggleRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  // Which section is under the middle of the screen → its inline link stays lit.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    const els = menu.map((m) => document.querySelector(m.href)).filter(Boolean);
    if (!els.length) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setCurrent(`#${e.target.id}`);
          else setCurrent((c) => (c === `#${e.target.id}` ? null : c));
        }
      },
      { rootMargin: "-45% 0px -54% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [campaign]);

  // The backdrop comes on after 80 px — measured by the shared scroll loop.
  useEffect(() => {
    const head = headRef.current;
    const probe = document.getElementById("fx-top");
    if (!head || !probe) return undefined;
    return track(probe, {
      mode: "hero",
      write: false,
      onP: (p, el) => head.toggleAttribute("data-solid", p * el.offsetHeight > 80),
    });
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const overlay = overlayRef.current;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("fx-menu-open");
    const focusables = () => [...overlay.querySelectorAll("a[href], button")];
    focusables()[0]?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const f = focusables();
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    // One frame later, so the words start below their masks and rise.
    const raf = requestAnimationFrame(() => overlay.classList.add("is-in"));
    return () => {
      cancelAnimationFrame(raf);
      overlay.classList.remove("is-in");
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      document.documentElement.classList.remove("fx-menu-open");
    };
  }, [open, close]);

  const go = (e, href) => {
    e.preventDefault();
    setOpen(false);
    const target = document.querySelector(href);
    // After the overlay unlocks the body, or the jump lands short.
    requestAnimationFrame(() => target?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  let wi = 0;
  return (
    <>
      <header ref={headRef} className="fx-head">
        <a href="#fx-top" className="fx-brand" aria-label={`${NAV.brand.ar} — أعلى الصفحة`}>
          <BrandMark size={30} />
          <span className="fx-brand-ar">{NAV.brand.ar}</span>
        </a>
        <nav className="fx-nav" aria-label="أقسام الصفحة">
          {menu.map((m) => (
            <a
              key={m.href}
              href={m.href}
              onClick={(e) => go(e, m.href)}
              className="fx-nav-link"
              aria-current={current === m.href ? "location" : undefined}
            >
              {m.label}
            </a>
          ))}
          <a href={NAV.studentLogin.href} target="_blank" rel="noopener noreferrer" className="fx-nav-link fx-nav-login">
            {NAV.studentLogin.label}
          </a>
        </nav>
        <div className="fx-head-actions">
          <button type="button" data-open-form className="fx-btn fx-btn--primary fx-btn--sm">
            {CTA_LABEL}
          </button>
          <button
            ref={toggleRef}
            type="button"
            className="fx-menu-toggle"
            aria-expanded={open}
            aria-controls="fx-menu"
            onClick={() => setOpen(true)}
          >
            القائمة
          </button>
        </div>
      </header>

      {open && (
        <div
          ref={overlayRef}
          id="fx-menu"
          className="fx-menu"
          role="dialog"
          aria-modal="true"
          aria-label="القائمة"
        >
          <button type="button" className="fx-menu-close" onClick={close} aria-label="إغلاق القائمة">
            <span aria-hidden="true">×</span>
          </button>
          <nav>
            <ul className="fx-menu-list">
              {menu.map((m) => (
                <li key={m.href}>
                  <a href={m.href} onClick={(e) => go(e, m.href)} className="fx-menu-link">
                    <span className="fx-line">
                      {m.label.split(" ").map((w, i, all) => {
                        const idx = wi;
                        wi += 1;
                        return (
                          <span key={i}>
                            <span className="fx-w" style={{ "--i": idx }}>
                              {w}
                            </span>
                            {i < all.length - 1 ? " " : null}
                          </span>
                        );
                      })}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            {/* The header's button is under the overlay: the menu carries its own.
                It closes the menu; the page's [data-open-form] handler does the rest. */}
            <div className="fx-menu-cta">
              <button type="button" data-open-form className="fx-btn fx-btn--primary" onClick={() => setOpen(false)}>
                {CTA_LABEL}
                <span aria-hidden="true">←</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
