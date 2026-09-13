/**
 * Small platform utilities, copied from fluentia-lms (origin/main) with their
 * store/DB ties removed. Each one is the platform's own definition.
 */
import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";

// i18n/gender.js — the platform reads the signed-in student's gender. A visitor
// has none, so the tour always takes the masculine-generic form, like the rest of
// fluentia.academy («ابدأ»، «جرّب»). Never the feminine-only default.
export const g = (m /* , f */) => m;
export const useG = () => g;
export const genderizeText = (t) => t;

// lib/numerals.js — Western digits everywhere.
export const arNum = (n) => (n == null ? "" : String(n));

// utils/paragraphLetter.js
export function paraLetter(i) {
  let n = i;
  let out = "";
  do {
    out = String.fromCharCode(65 + (n % 26)) + out;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return out;
}

// utils/readingLabel.js
const ORDINALS_AR = ["الأولى", "الثانية", "الثالثة", "الرابعة", "الخامسة", "السادسة"];
export function readingNameAr(label, index = 0) {
  const fromLabel = typeof label === "string" && /^[A-Za-z]$/.test(label) ? label.toUpperCase().charCodeAt(0) - 65 : null;
  const i = fromLabel ?? index;
  return `القراءة ${ORDINALS_AR[i] ?? String(i + 1)}`;
}

// Arabic counted nouns agree with the number (1 / 2 / 3-10 / 11+).
export function countAr(n, one, two, few, many) {
  if (n === 1) return one;
  if (n === 2) return two;
  if (n >= 3 && n <= 10) return `${n} ${few}`;
  return `${n} ${many}`;
}
export const minutesAr = (n) => countAr(n, "دقيقة واحدة", "دقيقتان", "دقائق", "دقيقة");

// _premiumPrimitives.useCinematicMotion — OS setting + the app's a11y toggle.
export function useCinematicMotion() {
  const prefersReduced = useReducedMotion();
  const [a11yReduce, setA11yReduce] = useState(false);
  useEffect(() => {
    const check = () => setA11yReduce(document.documentElement.classList.contains("a11y-reduce-motion"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  const reduced = prefersReduced || a11yReduce;
  return useMemo(
    () => ({
      reduced,
      fadeUp: reduced
        ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
        : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
      heroEntry: reduced
        ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
        : { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
    }),
    [reduced]
  );
}

// Deterministic Fisher-Yates. Production shuffles answer choices with
// Math.random on every mount; the tour seeds it from the question id so every
// visitor (and every screenshot) sees the same order.
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
export function seededShuffle(arr, seed) {
  const out = [...arr];
  let s = hash(String(seed)) || 1;
  const rand = () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
