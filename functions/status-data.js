/**
 * /status-data: the platform status for fluentia.academy/status (2026-11-12, reliability guardrails).
 *
 * The truth lives in status.json on the Cloudflare Pages project `fluentia-status`. The ops watchdog in
 * fluentia-autopilot redeploys it when the platform's state changes, and every 6 h. Browsers in Saudi Arabia
 * cannot open *.pages.dev reliably: the TLS handshake to fluentia-status.pages.dev times out on local
 * networks (measured 2026-11-12). So the page reads it same-origin through this function, which fetches it
 * inside Cloudflare. No Supabase anywhere on this path, so it still answers while the database is down.
 *
 * public/_routes.json scopes the Functions runtime to this path and /tour/*. Nothing else on the site pays for
 * an invocation, and the status page polls once a minute only while it is open.
 */
const SOURCE = "https://fluentia-status.pages.dev/status.json";

export async function onRequest() {
  try {
    const r = await fetch(SOURCE, { cf: { cacheTtl: 20, cacheEverything: true } });
    if (!r.ok) throw new Error(`upstream ${r.status}`);
    const body = await r.text();
    JSON.parse(body); // never pass HTML or garbage through as status
    return new Response(body, {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=20", "X-Robots-Tag": "noindex" },
    });
  } catch {
    return new Response(JSON.stringify({ state: "unknown", updated_at: null }), {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
    });
  }
}
