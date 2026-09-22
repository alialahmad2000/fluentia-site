# Fluentia Academy — موقع أكاديمية طلاقة

The marketing site at **fluentia.academy**. React 18 + Vite, Arabic-first, with
per-route prerendering for crawlers.

| | |
|---|---|
| Host | **Cloudflare Pages**, project `fluentia-site` (origin `fluentia-site.pages.dev`) |
| Live | `fluentia.academy`, `www.fluentia.academy` |
| Deploy | push to `main` → Pages builds → live. One preview per branch. **Merge = deploy.** |
| Env vars | Cloudflare dashboard → Pages → fluentia-site → Settings → Variables (Production **and** Preview): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `NODE_VERSION=24` |
| DNS | Cloudflare zone `fluentia.academy`; registrar stays Namecheap |
| LMS | separate repo `fluentia-lms` → `app.fluentia.academy` |

Moved off Vercel on 2026-09-22. The Vercel project is kept as the rollback until
**2026-09-29** — see `../fluentia-lms/docs/hosting/cloudflare-migration.md`.

## Build

```bash
npm install
npm run dev              # vite dev server
npm run build            # client build → SSR build → prerender 29 routes
```

`npm run build` is three steps and the third one matters:
`vite build` → `vite build --config vite.ssr.config.js` → `scripts/prerender-meta.mjs`.

## Routing — read this before adding a route

This is **not** a plain SPA, and Cloudflare is **not** Vercel. Four mechanisms
carry the routes; `scripts/cloudflare-routing.mjs` documents them in full.

1. **Prerendered routes** (29 of them: `PRERENDER_ROUTES`, every article, every
   work-English page) each get their own `.html` with baked social meta and an
   SSR-rendered body. Pages serves `/about` from `about.html` natively — they
   need no rule at all.
2. **Client-only routes** (`CLIENT_ONLY_ROUTES` — `/w`, `/v1`, `/cine`, …) get one
   explicit `200` rewrite each to `/app-shell`, the EMPTY shell. They must not
   fall through to `index.html`, which holds the prerendered homepage markup.
3. **Everything unknown** lands on `404.html`, a copy of that same empty shell.
4. **`/tour/*`** is a Pages Function, because the tour's client routes
   (`/tour/unit/reading`) and its media (`/tour/unit/cover.webp`) share a prefix.

**There is deliberately no catch-all in `_redirects`.** Cloudflare follows a
redirect rule *even when a real asset matches*, so a `/*` rule would serve HTML
for every file in `/assets/`. Vercel's rewrites ran after its filesystem check,
which is why `vercel.json` gets away with one.

**Adding a `<Route>` to `src/App.jsx` will fail the build** until it is
classified — `assertRouterClassified()` checks every route against the three
mechanisms above and names the ones with nowhere to be served from. That is
deliberate: a route nobody routes to is invisible otherwise.

`vercel.json` is still in the tree and still kept in sync by
`npm run sync:rewrites`. It is the rollback, and goes when the Vercel project does.

## Verifying a deploy

Status proves nothing. Check content:

```bash
# each prerendered route must serve ITS OWN title, not the homepage's
curl -s https://fluentia.academy/about | grep -o '<title>[^<]*</title>'

# and the edge must not be rewriting bytes — these must be identical
diff <(curl -s https://fluentia.academy/) <(curl -s https://fluentia-site.pages.dev/)
```
