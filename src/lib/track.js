/**
 * track — the one place custom analytics events leave the site.
 *
 * GA4 gets every event (snake_case names, snake_case params — Google's
 * convention, and what the existing generate_lead calls use). TikTok only gets
 * its STANDARD events, and only through src/lib/tiktokPixel.js, which keeps
 * src/ free of raw ttq.track calls. If a Snap or Meta pixel is ever added to
 * index.html, fan it out from here rather than from call sites.
 *
 * Never throws: an ad blocker or a missing tag must not break a click.
 */
import { fireTikTokContact } from "./tiktokPixel";
import { getAttribution } from "./attribution";

export function track(event, params = {}) {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", event, params);
  } catch { /* analytics only */ }
}

/* ── WhatsApp clicks ───────────────────────────────────────────────────────
   Most prospects convert by tapping a wa.me link, and none of those links sent
   an event: pricing, footer, the level-test result, /about, /terms. 144 of 156
   CRM leads arrive by DM, so the main conversion path was invisible.

   One delegated listener covers every such link, present and future, without
   touching each component. It also gives a BARE wa.me link (no ?text=) a
   message that says it came from the site, so the conversation in WhatsApp
   carries its source too. */

const WA_HREF = /^(https?:\/\/(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)\/|whatsapp:\/\/)/i;

function ctaOf(a) {
  const tagged = a.closest("[data-cta]");
  if (tagged) return tagged.getAttribute("data-cta");
  const section = a.closest("section[id], [data-section], footer, header, nav");
  if (!section) return "page";
  return section.getAttribute("data-section") || section.id || section.tagName.toLowerCase();
}

function withSourceText(href) {
  try {
    const url = new URL(href);
    if (!/wa\.me|api\.whatsapp\.com/i.test(url.hostname) || url.searchParams.get("text")) return href;
    const { utm_source, utm_medium } = getAttribution();
    const lines = ["السلام عليكم، وصلت لكم من موقع طلاقة وأبي أستفسر."];
    if (utm_source) lines.push(`(المصدر: ${utm_source}${utm_medium ? ` / ${utm_medium}` : ""})`);
    url.searchParams.set("text", lines.join("\n"));
    return url.toString();
  } catch {
    return href;
  }
}

function onDocumentClick(e) {
  const a = e.target?.closest?.("a[href]");
  if (!a) return;
  const href = a.getAttribute("href") || "";
  if (!WA_HREF.test(href)) return;

  const next = withSourceText(a.href);
  if (next !== a.href) a.href = next; // runs before the default navigation

  const cta = ctaOf(a);
  const { utm_source, utm_medium, utm_campaign } = getAttribution();
  track("whatsapp_click", {
    cta_id: cta,
    page_path: window.location.pathname,
    link_text: (a.textContent || "").trim().slice(0, 60),
    source: utm_source || "direct",
    medium: utm_medium || undefined,
    campaign: utm_campaign || undefined,
  });
  fireTikTokContact({ contentId: `fluentia_wa_${cta}`.slice(0, 64) });
}

let installed = false;
export function installWhatsAppClickTracking() {
  if (installed || typeof document === "undefined") return;
  installed = true;
  // Capture phase: some links stopPropagation in their own handlers.
  document.addEventListener("click", onDocumentClick, { capture: true });
}
