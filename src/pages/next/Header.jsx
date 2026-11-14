import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import BrandMark from "../../components/BrandMark";
import { NAV } from "../landing-v2/content";
import { buildWhatsAppUrl, WA_MESSAGES } from "../../lib/whatsapp";
import { lockScroll, unlockScroll, popOverlayEntry, triggerOpenForm } from "../../lib/scrollLock";
import { track } from "./scroll";
import { CTA_LABEL } from "./copy";
import { useCta } from "../v1/ctaContext";
import { bookingHref } from "../../lib/booking";
import MENU_CSS from "./menu.css?inline";

/**
 * Header — fixed. The wordmark on the right; on the left the primary action
 * (`[data-open-form]` → the page's lead modal / form). On wide screens the
 * section links sit inline; narrower, they fold into «القائمة».
 *
 * The phone menu (rebuilt 2026-11-03, Ali: «the sections show up overlapping
 * each other and far too large, with no order»): a sheet from the right over a
 * dimmed page, ONE z-index layer above everything (the cookie bar included).
 * Logo row and the booking call are pinned; only the grouped list between them
 * scrolls. Rows are 18 px text in 48 px+ targets; group labels 12.5 px.
 * Opens/closes in ≤ 280 ms. Closes on a link, the backdrop, Esc, the close
 * button and the phone's back gesture (it pushes one history entry). Focus is
 * trapped inside and returns to «القائمة».
 *
 * `page` — "home" (the default; anchors scroll in place) or any other page
 * (anchors become /#… and load the homepage; `current` marks that page's row).
 */

/**
 * The essentials (2026-11-10, Ali: «the nav is crowded and confusing»): four
 * links, the same on desktop and in the phone sheet. The other sections stay on
 * the page; «أسئلة صريحة» moved to the footer. «دخول الطلاب» is a quiet
 * secondary link after a hairline. `route` = a real page (never scroll-hijacked);
 * `page` = where an anchor goes when we are not on the homepage.
 */
export const MENU = [
  { href: "#fx-platform", label: "المنصّة" },
  { href: "#fx-pricing", label: "الباقات" },
  { href: "#fx-stories", label: "قصص طلابنا", page: "/stories" },
  { href: "/journal", label: "المجلة", route: true, page: "/journal" },
];

/** Phone menu — the same four. */
const GROUPS = [{ label: "تصفّح طلاقة", items: MENU }];

/** /join (paid traffic): on-page sections only — no link that leaves the form. */
const CAMPAIGN_MENU = [
  { href: "#fx-platform", label: "المنصّة" },
  { href: "#fx-steps", label: "كيف تبدأ" },
  { href: "#fx-pricing", label: "الباقات" },
];
const CAMPAIGN_GROUPS = [{ label: "أقسام الصفحة", items: CAMPAIGN_MENU }];

const KEY = "fxmenu";
const DUR = 280;

export default function Header({ page = "home", solidAt = 80 }) {
  // /join: on-page sections only («كيف تبدأ» is there, the journal is not).
  const campaign = Boolean(useCta());
  const home = page === "home";
  const inline = campaign ? CAMPAIGN_MENU : MENU;
  const groups = campaign ? CAMPAIGN_GROUPS : GROUPS;
  const headRef = useRef(null);
  const sheetRef = useRef(null);
  const toggleRef = useRef(null);
  const closeTimer = useRef(0);
  const openRef = useRef(false);
  const [rendered, setRendered] = useState(false); // in the DOM
  const [shown, setShown] = useState(false); // slid in
  const [current, setCurrent] = useState(null);
  const [wa, setWa] = useState("https://wa.me/966558669974");

  /** Off the homepage, an anchor is a link to the homepage section. */
  const hrefOf = (item) => {
    if (item.route) return item.href;
    if (!home) return item.page || `/${item.href}`;
    return item.href;
  };

  // Which section is under the middle of the screen → its row stays lit.
  useEffect(() => {
    if (!home || typeof IntersectionObserver === "undefined") return undefined;
    const ids = [...new Set([...inline, ...groups.flatMap((g) => g.items)].filter((m) => !m.route).map((m) => m.href))];
    const els = ids.map((h) => document.querySelector(h)).filter(Boolean);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign, home]);

  // The backdrop comes on after `solidAt` px (80; the dawn homepage: 40) — measured by the shared scroll loop.
  useEffect(() => {
    const head = headRef.current;
    const probe = document.getElementById("fx-top");
    if (!head || !probe) return undefined;
    return track(probe, {
      mode: "hero",
      write: false,
      onP: (p, el) => head.toggleAttribute("data-solid", p * el.offsetHeight > solidAt),
    });
  }, [solidAt]);

  const openMenu = useCallback(() => {
    if (openRef.current) return;
    openRef.current = true;
    window.clearTimeout(closeTimer.current);
    setWa(buildWhatsAppUrl(WA_MESSAGES.general));
    setRendered(true);
    lockScroll();
    document.documentElement.classList.add("fx-menu-open");
    window.history.pushState({ ...(window.history.state || {}), [KEY]: 1 }, "");
  }, []);

  /** Slide out, unlock, then (once the history entry is popped) run `then`. */
  const finish = useCallback((then) => {
    if (!openRef.current) return;
    openRef.current = false;
    setShown(false);
    document.documentElement.classList.remove("fx-menu-open");
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    closeTimer.current = window.setTimeout(() => setRendered(false), reduce ? 0 : DUR);
    unlockScroll();
    then?.();
  }, []);

  const closeMenu = useCallback(
    ({ then, focusToggle = true } = {}) => {
      if (!openRef.current) return;
      finish();
      popOverlayEntry(KEY, () => {
        if (focusToggle) toggleRef.current?.focus({ preventScroll: true });
        then?.();
      });
    },
    [finish],
  );

  // Back gesture.
  useEffect(() => {
    const onPop = () => {
      if (openRef.current && !(window.history.state && window.history.state[KEY])) {
        finish();
        toggleRef.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [finish]);

  // Slide in one frame after mounting; focus into the sheet; trap Tab; Esc.
  useEffect(() => {
    if (!rendered || !openRef.current) return undefined;
    const sheet = sheetRef.current;
    const raf = requestAnimationFrame(() => {
      setShown(true);
      sheet?.querySelector(".fxm-close")?.focus({ preventScroll: true });
    });
    const onKey = (e) => {
      if (!openRef.current) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu();
        return;
      }
      if (e.key !== "Tab" || !sheet) return;
      const f = [...sheet.querySelectorAll("a[href], button")];
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (!sheet.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
    };
  }, [rendered, closeMenu]);

  // Unmounting with the menu open (route change): give the page back.
  useEffect(
    () => () => {
      if (openRef.current) {
        openRef.current = false;
        unlockScroll();
        document.documentElement.classList.remove("fx-menu-open");
      }
    },
    [],
  );

  const scrollTo = (href) => {
    const target = document.querySelector(href);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /** Inline (desktop) link. */
  const goInline = (e, item) => {
    if (!home || item.route) return; // a plain link (/#… or a page)
    e.preventDefault();
    scrollTo(item.href);
  };

  /** Sheet link: close first; scroll / navigate once the page is back. */
  const goSheet = (e, item) => {
    const href = hrefOf(item);
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    if (home && !item.route) {
      closeMenu({ focusToggle: false, then: () => scrollTo(item.href) });
    } else {
      // Leave only after the menu's history entry is gone, so «back» from the
      // next page lands here, closed.
      closeMenu({ focusToggle: false, then: () => window.location.assign(href) });
    }
  };

  const isCurrent = (item) => (home ? !item.route && current === item.href : item.page === page);

  return (
    <>
      <header ref={headRef} className={`fx-head${home && !campaign ? " fx-head--home" : ""}`}>
        <a href={home ? "#fx-top" : "/"} className="fx-brand" aria-label={home ? `${NAV.brand.ar} — أعلى الصفحة` : `${NAV.brand.ar} — الصفحة الرئيسية`}>
          <BrandMark size={30} />
          <span className="fx-brand-ar">{NAV.brand.ar}</span>
        </a>
        <nav className="fx-nav" aria-label="أقسام الصفحة">
          {inline.map((m) => (
            <a
              key={m.href}
              href={hrefOf(m)}
              onClick={(e) => goInline(e, m)}
              className="fx-nav-link"
              aria-current={isCurrent(m) ? (home ? "location" : "page") : undefined}
            >
              {m.label}
            </a>
          ))}
          {campaign ? null : (
            <>
              <span className="fx-nav-sep" aria-hidden="true" />
              <a href={NAV.studentLogin.href} target="_blank" rel="noopener noreferrer" className="fx-nav-link fx-nav-login">
                {NAV.studentLogin.label}
              </a>
            </>
          )}
        </nav>
        <div className="fx-head-actions">
          <a href={bookingHref()} data-open-form className="fx-btn fx-btn--primary fx-btn--sm fx-btn--nav">
            {CTA_LABEL}
          </a>
          <button
            ref={toggleRef}
            type="button"
            className="fx-menu-toggle"
            aria-expanded={shown}
            aria-controls="fx-menu"
            aria-haspopup="dialog"
            onClick={openMenu}
          >
            <span className="fxm-burger" aria-hidden="true">
              <i />
              <i />
            </span>
            القائمة
          </button>
        </div>
      </header>

      <style dangerouslySetInnerHTML={{ __html: MENU_CSS }} />
      {rendered ? createPortal(
        <div className="fxm" data-shown={shown ? "" : undefined} dir="rtl">
          <div className="fxm-backdrop" onClick={() => closeMenu()} aria-hidden="true" />
          <div ref={sheetRef} id="fx-menu" className="fxm-sheet" role="dialog" aria-modal="true" aria-label="القائمة">
            <div className="fxm-top">
              <a href={home ? "#fx-top" : "/"} className="fxm-brand" onClick={(e) => (home ? goSheet(e, { href: "#fx-top" }) : undefined)}>
                <BrandMark size={28} />
                <span>{NAV.brand.ar}</span>
              </a>
              <button type="button" className="fxm-close" onClick={() => closeMenu()} aria-label="إغلاق القائمة">
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                  <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav className="fxm-body" aria-label="القائمة">
              {groups.map((g, gi) => (
                <section key={g.label} className="fxm-group" aria-labelledby={`fxm-g${gi}`}>
                  <h2 id={`fxm-g${gi}`} className="fxm-label">
                    {g.label}
                  </h2>
                  <ul className="fxm-list">
                    {g.items.map((item, ii) => {
                      const on = isCurrent(item);
                      return (
                        <li key={item.href} style={{ "--i": gi * 3 + ii }}>
                          <a
                            href={hrefOf(item)}
                            className="fxm-link"
                            onClick={(e) => goSheet(e, item)}
                            aria-current={on ? (home ? "location" : "page") : undefined}
                          >
                            <span>{item.label}</span>
                            <svg className="fxm-chev" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                              <path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </nav>

            <div className="fxm-foot">
              {/* Closes the menu, then hands off to the page's [data-open-form] flow. */}
              <button type="button" className="fxm-cta" onClick={() => closeMenu({ focusToggle: false, then: triggerOpenForm })}>
                احجز لقاء مبدئي مجاني
              </button>
              {campaign ? null : (
                <div className="fxm-minor">
                  <a href={wa} target="_blank" rel="noopener noreferrer" data-cta="menu_whatsapp" className="fxm-minor-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.2.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"
                      />
                    </svg>
                    تواصل معنا واتساب
                  </a>
                  <span aria-hidden="true" className="fxm-dot">·</span>
                  <a href={NAV.studentLogin.href} target="_blank" rel="noopener noreferrer" className="fxm-minor-link">
                    {NAV.studentLogin.label}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
