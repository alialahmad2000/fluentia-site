import { createContext, useContext } from "react";

/**
 * CtaContext — lets a single-action page (/join) reuse the homepage sections
 * while keeping every visitor on the page.
 *
 * Absent (the homepage and every other page): `useCta()` is null and each
 * component renders exactly as it always has.
 * Present: `{ label }`. Primary buttons take that label, and links that would
 * leave the page (the tour, the trial lesson, nav, login, the WhatsApp line
 * under pricing) become `[data-open-form]` buttons or are left out. The page
 * that provides the context owns what a `[data-open-form]` click does.
 */
export const CtaContext = createContext(null);

export const useCta = () => useContext(CtaContext);
