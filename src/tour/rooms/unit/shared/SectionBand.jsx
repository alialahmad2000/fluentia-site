/**
 * fluentia-lms components/curriculum/SectionBand.jsx + SectionJumper.jsx.
 * Verbatim, except the jumper measures the chrome above it from the room's own
 * --header-height (the TourBar), read off its nav rather than <html>.
 */
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";

const SCROLL_MARGIN = "calc(var(--impersonation-banner-height, 0px) + var(--header-height, 64px) + 68px)";

export const SectionBand = forwardRef(function SectionBand({ id, label, hint, seam = true, tone = "default", className = "", children }, ref) {
  const feature = tone === "feature";
  const seamRule = "var(--ds-accent-rule, rgba(233,185,73,.42))";
  const seamNeutral = "rgba(255,255,255,0.09)";
  return (
    <section id={id} ref={ref} dir="rtl" style={{ scrollMarginTop: SCROLL_MARGIN }} className={`${feature ? "pt-2" : ""} ${className}`}>
      {seam && (
        <div
          aria-hidden
          className={feature ? "mb-7 flex items-center gap-3" : "mb-6 h-px w-full"}
          style={feature ? undefined : { background: `linear-gradient(to left, transparent, ${seamNeutral} 20%, ${seamNeutral} 80%, transparent)` }}
        >
          {feature && (
            <>
              <span className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${seamRule})` }} />
              <span className="h-1 w-1 rounded-full" style={{ background: "var(--ds-accent-primary, #e9b949)" }} />
              <span className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${seamRule})` }} />
            </>
          )}
        </div>
      )}
      {label && (
        <div className="mb-3 flex items-baseline gap-3">
          <h3 className="font-['Tajawal'] text-[13px] font-bold tracking-wide" style={{ color: "var(--ds-text-primary, #faf5e6)" }}>
            {label}
          </h3>
          <span aria-hidden className="h-px flex-1" style={{ background: "var(--ds-border-subtle, rgba(255,255,255,0.07))" }} />
          {hint && (
            <span className="font-['Tajawal'] text-[11.5px]" style={{ color: "var(--ds-text-tertiary, #8b8578)" }}>
              {hint}
            </span>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  );
});

export { SCROLL_MARGIN };

export function SectionJumper({ sections = [], className = "", deps = "" }) {
  const [present, setPresent] = useState([]);
  const [active, setActive] = useState(null);
  const navRef = useRef(null);
  const railRef = useRef(null);
  const activeChipRef = useRef(null);

  const chrome = () => {
    const cs = getComputedStyle(navRef.current || document.documentElement);
    const banner = parseInt(cs.getPropertyValue("--impersonation-banner-height"), 10) || 0;
    const headerH = parseInt(cs.getPropertyValue("--header-height"), 10) || 64;
    const railH = navRef.current?.getBoundingClientRect().height ?? 52;
    return banner + headerH + railH;
  };

  const ids = useMemo(() => sections.map((s) => s.id).join("|"), [sections]);

  useEffect(() => {
    const check = () => setPresent(sections.filter((s) => document.getElementById(s.id)));
    check();
    const t = setTimeout(check, 400);
    const t2 = setTimeout(check, 1200);
    return () => { clearTimeout(t); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, deps]);

  useEffect(() => {
    if (!present.length) return undefined;
    const top = chrome();
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: `-${top}px 0px -55% 0px`, threshold: 0 }
    );
    present.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [present]);

  useEffect(() => {
    const chip = activeChipRef.current;
    const rail = railRef.current;
    if (!chip || !rail) return;
    const c = chip.getBoundingClientRect();
    const r = rail.getBoundingClientRect();
    if (c.left < r.left || c.right > r.right) {
      rail.scrollTo({ left: chip.offsetLeft - rail.clientWidth / 2 + chip.clientWidth / 2, behavior: "smooth" });
    }
  }, [active]);

  const jump = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - chrome() - 12;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    setActive(id);
  };

  if (present.length < 2) return null;

  const gold = "var(--ds-accent-primary, #e9b949)";
  const goldWash = "var(--ds-accent-wash, rgba(233,185,73,.08))";

  return (
    <nav ref={navRef} dir="rtl" aria-label="أقسام هذه الصفحة" className={className}>
      <div
        ref={railRef}
        className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border px-2 py-2 shadow-lg shadow-black/40 backdrop-blur-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ background: "var(--ds-bg-overlay, rgba(11,15,24,0.86))", borderColor: "var(--ds-border-subtle, rgba(255,255,255,0.07))" }}
      >
        {present.map((s) => {
          const isActive = active === s.id;
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              type="button"
              ref={isActive ? activeChipRef : null}
              onClick={() => jump(s.id)}
              aria-current={isActive ? "true" : undefined}
              style={isActive ? { background: goldWash, color: gold, boxShadow: "inset 0 0 0 1px rgba(233,185,73,0.30)" } : { color: "var(--ds-text-tertiary, #8b8578)" }}
              className={`flex min-h-[38px] flex-none items-center gap-1.5 rounded-xl px-3.5 py-1.5 font-['Tajawal'] text-[12.5px] font-medium transition-colors duration-200 [@media(pointer:coarse)]:min-h-[44px] [@media(pointer:coarse)]:px-4 ${
                isActive ? "" : "hover:bg-white/[0.06] hover:text-[var(--ds-text-primary,#faf5e6)]"
              }`}
            >
              {Icon && <Icon size={13} style={{ color: isActive ? gold : "currentColor", opacity: isActive ? 1 : 0.75 }} />}
              {s.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
