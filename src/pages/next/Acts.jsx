import { useEffect, useId, useRef, useState } from "react";
import { PROBLEM, WORTH, SOCIAL_PROOF } from "../landing-v2/content";
import Giant from "./Giant";
import { track } from "./scroll";
import { TITLES } from "./copy";

/**
 * The three "acts": a two-line giant title that slides in from the right edge
 * while its words rise, then stays sticky (desktop) while the content column
 * scrolls past. On a phone the title reveals at the top and scrolls away.
 * Every word of content is the homepage's, from landing-v2/content.js.
 */

function Act({ id, title, lede, children, className = "" }) {
  return (
    <section id={id} className={`fx-act ${className}`}>
      <div className="fx-act-grid">
        <div className="fx-act-head">
          <Giant lines={title} className="fx-act-title" />
          {lede ? <p className="fx-act-lede fx-rv fx-fade">{lede}</p> : null}
        </div>
        <div className="fx-act-body">{children}</div>
      </div>
    </section>
  );
}

/* ── العائق ليس أنت — the four pains, one by one, along a progress line ── */
export function Pains() {
  const listRef = useRef(null);
  useEffect(() => track(listRef.current, { mode: "through" }), []);
  return (
    <Act id="fx-pains" title={TITLES.pains} lede={PROBLEM.intro}>
      <ol ref={listRef} className="fx-pains">
        {PROBLEM.cards.map((c, i) => (
          <li key={c.title} className="fx-pain fx-rv fx-fade">
            <span className="fx-num" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="fx-pain-title">{c.title}</h3>
            <p className="fx-pain-body">{c.body}</p>
          </li>
        ))}
      </ol>
      <p className="fx-bridge fx-rv fx-fade">{PROBLEM.bridge.replace("←", "↓")}</p>
    </Act>
  );
}

/* ── كيف نُزيله — the homepage's four pillars as rows that open on tap ── */
function PillarRow({ p, open, onToggle }) {
  const uid = useId();
  return (
    <li className="fx-row fx-rv fx-fade" data-open={open ? "" : undefined}>
      <button
        type="button"
        className="fx-row-head"
        aria-expanded={open}
        aria-controls={`${uid}-body`}
        onClick={onToggle}
      >
        <span className="fx-num" aria-hidden="true">
          {p.num}
        </span>
        <span className="fx-row-titles">
          <span className="fx-row-essence">{p.essence}</span>
          <span className="fx-row-title">{p.title}</span>
        </span>
        <span className="fx-row-plus" aria-hidden="true" />
      </button>
      {/* Closed rows are visibility:hidden (out of the tab order and the a11y tree);
          the height opens on a 0fr → 1fr grid row, so nothing is measured. */}
      <div id={`${uid}-body`} className="fx-row-body">
        <div>
          <p>{p.body}</p>
        </div>
      </div>
    </li>
  );
}

export function How() {
  const [open, setOpen] = useState(0);
  return (
    <Act id="fx-how" title={TITLES.how} lede={WORTH.deck}>
      <ul className="fx-rows">
        {WORTH.pillars.map((p, i) => (
          <PillarRow key={p.num} p={p} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
        ))}
      </ul>
      <p className="fx-bridge fx-rv fx-fade">{WORTH.closing.lead}</p>
    </Act>
  );
}

/* ── الأرقام كما هي — each stat a row: a giant number counting up once. No bars:
   none of these numbers has an honest maximum to draw against. ── */
function parseStat(v) {
  const m = String(v).match(/^(\+?)(\d+)(K?)$/);
  if (!m) return null;
  return { prefix: m[1], to: Number(m[2]) * (m[3] ? 1000 : 1) };
}
const fmt = (n) => n.toLocaleString("en-US");
const COUNT_MS = 1600;

export function Stats({ still = false, bars = false }) {
  const listRef = useRef(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return undefined;
    const rows = [...list.querySelectorAll("[data-to]")];
    const showFinal = () =>
      rows.forEach((r) => {
        r.querySelector(".fx-stat-n").textContent = fmt(Number(r.dataset.to));
      });
    // The tier can resolve to low after mount: a still page always shows the real values.
    if (still || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      showFinal();
      return undefined;
    }
    const rafs = new Set();
    // Numbers not yet on screen start from zero; the prerender carries the real values.
    rows.forEach((r) => {
      const rect = r.getBoundingClientRect();
      if (rect.top > window.innerHeight) r.querySelector(".fx-stat-n").textContent = "0";
      else r.dataset.done = "";
    });
    const run = (row) => {
      const to = Number(row.dataset.to);
      const out = row.querySelector(".fx-stat-n");
      const t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / COUNT_MS);
        const e = 1 - Math.pow(1 - k, 4);
        out.textContent = fmt(Math.round(to * e));
        if (k < 1) {
          const id = requestAnimationFrame(step);
          rafs.add(id);
        }
      };
      rafs.add(requestAnimationFrame(step));
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting || e.target.dataset.done !== undefined) return;
          e.target.dataset.done = "";
          io.unobserve(e.target);
          run(e.target);
        });
      },
      { threshold: 0.4 }
    );
    rows.forEach((r) => r.dataset.done === undefined && io.observe(r));
    return () => {
      io.disconnect();
      rafs.forEach((id) => cancelAnimationFrame(id));
      rows.forEach((r) => delete r.dataset.done);
    };
  }, [still]);

  return (
    <Act id="fx-stats" title={TITLES.stats} className="fx-act--stats">
      <ul ref={listRef} className="fx-stats">
        {SOCIAL_PROOF.stats.map((s) => {
          const p = parseStat(s.value);
          return (
            <li key={s.label} className="fx-stat fx-rv" data-to={p ? p.to : undefined}>
              <span className="fx-stat-num" dir="ltr">
                {p?.prefix ? <span className="fx-stat-pre">{p.prefix}</span> : null}
                <span className="fx-stat-n">{p ? fmt(p.to) : s.value}</span>
              </span>
              <span className="fx-stat-label">{s.label}</span>
              {/* /join keeps its launch layout (bars) until it is switched to the showcase */}
              {bars ? (
                <span className="fx-bar" aria-hidden="true">
                  <i />
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </Act>
  );
}
