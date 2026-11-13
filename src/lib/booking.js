/**
 * Where a «book your intro meeting» call to action goes when it is followed as
 * a plain link — no JavaScript yet, middle-click, «open in new tab», a crawler.
 *
 * With JavaScript on, the page's own `[data-open-form]` listener still takes a
 * plain left click and the href is never followed: on `/` a general CTA goes to
 * HOME_BOOKING via NextLanding, a pricing card opens V1LeadModal with its
 * package; /join and the campaign page open their own form. `/start` is the live admissions route («مستشار طلاقة»,
 * src/pages/start/AdvisorChat.jsx) and records the full landing URL, so the
 * package travels with the visitor as `?pkg=<tier id>` — the same ids the
 * pricing cards' `data-tier` carry (asas, tamayuz, fardi, fardi_intensive,
 * self_study; there is no separate self-study checkout).
 */
export const BOOKING_PATH = "/start";
/** A general «احجز لقاءك المبدئي» on the site — same URL the JS click goes to. */
export const HOME_BOOKING = `${BOOKING_PATH}?src=site_home`;

export function bookingHref(tier) {
  return tier ? `${BOOKING_PATH}?pkg=${encodeURIComponent(tier)}` : HOME_BOOKING;
}

/**
 * A click the browser should handle itself (new tab / window, download,
 * non-primary button) — `[data-open-form]` listeners let these through.
 */
export function isModifiedClick(e) {
  return Boolean(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (typeof e.button === "number" && e.button !== 0));
}
