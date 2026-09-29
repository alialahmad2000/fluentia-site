/**
 * One clock for the whole page. Legs subscribe while they are on screen and
 * unsubscribe when they leave; with no active subscriber nothing runs (no
 * perpetual rAF). Two phases per frame: 0 = update (read scroll, move state),
 * 1 = render (write DOM / draw) — every read happens before any write.
 * Passive subscribers (the shared layers: voice canvas, GL manager) run only
 * while some leg keeps the clock alive.
 */
const phases = [new Set(), new Set()];
const passive = new Set();
let raf = 0;
let last = 0;
let active = 0;

function loop(t) {
  raf = 0;
  const dt = last ? Math.min(0.05, (t - last) / 1000) : 1 / 60;
  last = t;
  const sy = window.scrollY;
  for (const set of phases) for (const f of set) f(t, dt, sy);
  if (active > 0) raf = requestAnimationFrame(loop);
  else {
    last = 0;
    // one last pass so shared layers can clear what the leaving leg drew
    for (const f of phases[1]) if (passive.has(f)) f(t + 1, dt, sy);
  }
}

export function subscribe(fn, phase = 0, opts = {}) {
  phases[phase].add(fn);
  if (opts.passive) passive.add(fn);
  else active += 1;
  if (!raf && active > 0) raf = requestAnimationFrame(loop);
  let done = false;
  return () => {
    if (done) return;
    done = true;
    phases[phase].delete(fn);
    if (passive.has(fn)) passive.delete(fn);
    else active -= 1;
  };
}

export function kick() {
  if (!raf && active > 0 && typeof window !== "undefined") raf = requestAnimationFrame(loop);
}
