/**
 * /tour/* — the one route Cloudflare's _redirects cannot express.
 *
 * The tour is a second Vite page entry (tour.html) with its own client router:
 * /tour, /tour/unit, /tour/unit/reading, … And its media lives at the SAME
 * prefix — public/tour/unit/cover.webp → /tour/unit/cover.webp.
 *
 * vercel.json gets away with `/tour/:path* → /tour.html` because Vercel applies
 * a rewrite only AFTER the filesystem check. Cloudflare does not: "Redirects are
 * always followed, regardless of whether or not an asset matches the incoming
 * request." A `/tour/* /tour.html 200` rule here would hand every .webp in the
 * tour an HTML body.
 *
 * So the filesystem check happens here instead, on the one test that separates
 * the two: a tour client route never has a file extension, and every tour asset
 * does. This mirrors vite.config.js's dev-server middleware exactly, which uses
 * the same regex for the same reason.
 *
 * public/_routes.json scopes the Functions runtime to /tour/* so no other
 * request on this site pays for a function invocation.
 */
export async function onRequest(context) {
  const url = new URL(context.request.url);

  // Looks like a file → a real asset under public/tour/. Let Pages serve it,
  // including its 404 if it genuinely is not there.
  if (/\.[a-z0-9]+$/i.test(url.pathname)) return context.next();

  // A client route: serve the tour entry and let its router read the path.
  const shell = await context.env.ASSETS.fetch(new URL("/tour.html", url));
  return new Response(shell.body, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
