import { useCallback, useEffect, useRef, useState } from "react";
import BrandMark from "../../components/BrandMark";
import { NAV } from "../landing-v2/content";
import { HEADER_CTA, TITLES } from "./copy";
import { scrollToEl } from "./motion";

/**
 * Fixed, minimal. The real mark + «طلاقة» on the right; on the left the
 * homepage's primary action (`[data-open-form]` → V1LeadModal, the same
 * TikTok / GA4 / Supabase / WhatsApp flow) and the menu. Its colours follow
 * the leg under it — cream on night, ink on day — through `data-theme`,
 * which the page writes as you scroll.
 *
 * The menu is a full-screen sheet of the journey's own legs. Focus is trapped
 * inside, Esc closes, a link closes and scrolls.
 */

const MENU = [
  { id: "jn-first", label: TITLES.firstWord[0] },
  { id: "jn-road", label: TITLES.path[0] },
  { id: "jn-pricing", label: TITLES.pricing },
  { id: "jn-faq", label: TITLES.faq },
];

export default function Header() {
  const overlayRef = useRef(null);
  const toggleRef = useRef(null);
  const [open, setOpen] = useState(false);

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const overlay = overlayRef.current;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.__jnLenis?.stop();
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
    const raf = requestAnimationFrame(() => overlay.classList.add("is-in"));
    return () => {
      cancelAnimationFrame(raf);
      overlay.classList.remove("is-in");
      document.body.style.overflow = prev;
      window.__jnLenis?.start();
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const go = (e, id) => {
    e.preventDefault();
    setOpen(false);
    requestAnimationFrame(() => scrollToEl(document.getElementById(id), -8));
  };

  return (
    <>
      <header className="jn-head" data-theme="night">
        <a href="#jn-top" className="jn-brand" aria-label="طلاقة" onClick={(e) => go(e, "jn-top")}>
          <BrandMark size={30} />
          <span className="jn-brand-ar">طلاقة</span>
          <span className="jn-brand-en" dir="ltr">
            FLUENTIA
          </span>
        </a>
        <div className="jn-head-actions">
          <button type="button" data-open-form className="jn-btn jn-btn--head">
            {HEADER_CTA}
          </button>
          <button
            ref={toggleRef}
            type="button"
            className="jn-menu-btn"
            aria-expanded={open}
            aria-controls="jn-menu"
            aria-label="القائمة"
            onClick={() => setOpen((o) => !o)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </header>

      <div
        id="jn-menu"
        ref={overlayRef}
        className="jn-menu"
        role="dialog"
        aria-modal="true"
        aria-label="القائمة"
        hidden={!open}
      >
        <button type="button" className="jn-menu-close" aria-label="إغلاق" onClick={close}>
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
        <nav>
          <ol className="jn-menu-list">
            {MENU.map((m, i) => (
              <li key={m.id} style={{ "--i": i }}>
                <a href={`#${m.id}`} onClick={(e) => go(e, m.id)}>
                  <span className="jn-menu-num" dir="ltr">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="jn-menu-word">{m.label}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="jn-menu-foot">
          <button type="button" data-open-form className="jn-btn jn-btn--cream" onClick={() => setOpen(false)}>
            {HEADER_CTA}
          </button>
          <a className="jn-menu-login" href={NAV.studentLogin.href}>
            {NAV.studentLogin.label}
          </a>
        </div>
      </div>
    </>
  );
}
