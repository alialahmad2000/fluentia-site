import { useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { TIERS, PACKAGES, formatPrice } from "../joinContent";

export default function Packages({ onChoose }) {
  const railRef = useRef(null);
  const heroRef = useRef(null);

  // Phone: the rail scrolls sideways — open it on طلاقة, not on the cheapest tier.
  useEffect(() => {
    const rail = railRef.current;
    const card = heroRef.current;
    if (!rail || !card || rail.scrollWidth <= rail.clientWidth + 1) return;
    const r = rail.getBoundingClientRect();
    const c = card.getBoundingClientRect();
    rail.scrollLeft += c.left + c.width / 2 - (r.left + r.width / 2);
  }, []);

  return (
    <section className="j-section j-alt" aria-labelledby="j-pkg-h">
      <div className="j-wrap">
        <h2 id="j-pkg-h" className="j-h2">{PACKAGES.h2}</h2>
        <p className="j-lede">{PACKAGES.sub}</p>

        <ul className="j-pkgs" ref={railRef}>
          {TIERS.map((t) => (
            <li
              key={t.id}
              ref={t.recommended ? heroRef : undefined}
              className={`j-pkg${t.recommended ? " is-rec" : ""}`}
            >
              {t.recommended ? <span className="j-pkg-badge">{PACKAGES.badge}</span> : null}
              <h3 className="j-pkg-name">{t.name}</h3>
              <p className="j-pkg-tag">{t.tagline}</p>
              <p className="j-pkg-price">
                {t.priceFrom ? <span className="j-pkg-from">من </span> : null}
                <span className="j-num">{formatPrice(t.price)}</span>
                <span className="j-pkg-suffix">{PACKAGES.suffix}</span>
              </p>
              <ul className="j-pkg-feats">
                {t.features.map((f) => (
                  <li key={f}>
                    <Check size={16} aria-hidden="true" className="j-pkg-check" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={`j-btn ${t.recommended ? "j-btn-primary" : "j-btn-ghost"} j-pkg-btn`}
                onClick={() => onChoose(t.id)}
              >
                اختر {t.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
