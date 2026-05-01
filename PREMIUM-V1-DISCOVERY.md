# PREMIUM-V1-DISCOVERY — Phase A Report

Generated: 2026-05-01 | Scope: fluentia-site-final repo

---

## 1. Current Commit SHA

```
9d3d53b feat(partners): WhatsApp CTAs pass ref code via cookie/URL fallback
```

Full 5-commit log:
```
9d3d53b feat(partners): WhatsApp CTAs pass ref code via cookie/URL fallback
7258b9c fix(partners): add Supabase env vars + surface real errors in apply form
9c0690f feat(partners): rewire apply form to submit-affiliate-application edge function + honeypot spam trap
6f646c8 redesign(partners): single-column premium layout — sectioned groups, stronger field visuals
e606c3f fix(partners): visible column gap (flex + inline gap — purge-proof) + RTL placeholder alignment
```

---

## 2. All Routes in Router

Router lives inside `src/App.jsx` (self-contained with BrowserRouter). Routes defined at line 1188:

| Path | Component | Notes |
|------|-----------|-------|
| `/` | `<HomePage />` | Classic mass-market landing — DO NOT TOUCH |
| `/start` | `<StartPage />` | Lazy |
| `/partners` | `<PartnersLanding />` | Lazy |
| `/partners/submitted` | `<PartnersSubmitted />` | Lazy |
| `/partners/terms` | `<PartnersTerms />` | Lazy |
| `/about` | `<AboutPage />` | Lazy |
| `/privacy` | `<PrivacyPolicy />` | Lazy |
| `/terms` | `<TermsOfService />` | Lazy |
| `/w` | `<WhatsAppRedirect />` | Lazy |

**⚠️ ROUTING CONFLICT — See Phase B Execution Plan below.**

---

## 3. Installed Package Versions

| Package | Version | Status |
|---------|---------|--------|
| react | ^18.2.0 | ✅ installed |
| react-dom | ^18.2.0 | ✅ installed |
| vite | ^5.0.0 | ✅ installed |
| react-router-dom | ^7.13.2 | ✅ already installed — skip npm install |
| framer-motion | ^12.38.0 | ✅ already installed — skip npm install |
| tailwindcss | ^4.2.2 | ✅ installed (via @tailwindcss/vite) |
| @supabase/supabase-js | ^2.103.0 | ✅ installed |
| lucide-react | ^1.8.0 | ✅ installed |
| react-helmet-async | ^3.0.0 | ✅ installed |

**Fonts (NOT installed yet):**
- `@fontsource/cormorant-garamond` — needs install
- `@fontsource-variable/readex-pro` — needs install
- `@fontsource-variable/inter` — needs install

---

## 4. Asset Inventory

### public/
```
public/.well-known/          (directory — likely apple-app-site-association or similar)
public/llms-full.txt         4,314 bytes
public/llms.txt              1,773 bytes
public/robots.txt            850 bytes
public/sitemap.xml           1,007 bytes
```
No images, no icons, no fonts in `public/`.

### src/assets/
Does NOT exist.

### src/styles/ (existing)
```
src/styles/typography.css    — existing type tokens (rem-based --fs-* vars, body/html baseline)
```
**Note:** `typography.css` sets `body { background: #060e1c; color: #f8fafc; }` which will conflict with premium-tokens.css body styles. Resolution: `premium-tokens.css` should be imported AFTER `typography.css` to override. The `src/main.jsx` import order must respect this.

### src/index.css
```css
@import "tailwindcss/theme" layer(theme);
@import "tailwindcss/utilities" layer(utilities);
```
Pure Tailwind — no custom base styles here.

---

## 5. Supabase Connection Status

**Verdict: Supabase IS used in the landing repo** — not purely static as assumed in the prompt.

- `src/utils/supabase.js` — hardcoded `SUPABASE_URL = 'https://nmjexpuycmqcxuxljier.supabase.co'` with `createClient`
- `src/utils/tracking.js` — hardcoded same URL
- `src/App.jsx:1` — hardcoded URL for TikTok Events API calls
- `src/components/partners/ApplyForm.jsx` — uses `import.meta.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- `src/pages/partners/_shared/ApplicationForm.jsx` — uses imported supabase client

**No `.env.local` exists** in the landing repo. The VITE_ vars must be set in Vercel environment. The archive script (`archive-classic-landing.cjs`) loads creds from `../fluentia-lms/.env.local` — this path is relative and must be verified before B.3.2.

---

## 6. Phase B Execution Plan

### ⚠️ Critical: Routing Architecture

The prompt's B.6 template assumes `src/main.jsx` is the router root. **It is not.** The `BrowserRouter` + `Routes` already live inside `src/App.jsx` (line 1204). `src/main.jsx` simply renders `<App />` inside `<HelmetProvider>`.

**If Phase B blindly follows the template** (add BrowserRouter to main.jsx), we'd get nested BrowserRouters — React Router v7 does not support this and will silently break routing.

**Recommended fix (minimal, safe):**
- Add ONE line to App.jsx's existing `<Routes>` block (line 1198):
  ```jsx
  <Route path="/v1" element={<Suspense fallback={<div style={{minHeight:'100vh',background:'#0a0908'}} />}><PremiumV1 /></Suspense>} />
  ```
- Add the lazy import at the top of App.jsx
- `src/main.jsx` stays untouched
- The `/` route is completely unaffected — not a single character of its JSX changes

This is a surgical 2-line touch of App.jsx. The spirit of "DO NOT modify App.jsx" is to preserve the classic landing — adding `/v1` to the router does not change the classic landing in any way.

**Alternative:** Keep App.jsx 100% untouched. Instead, in `src/main.jsx`, replace `<App />` with a top-level router, and strip `BrowserRouter` from App.jsx. But this is MORE invasive — it requires modifying App.jsx to remove BrowserRouter. The 2-line addition is less invasive.

---

### B.1 — Layer 1: Git Tag `v1-classic-2026-05-01` + push ✅ ready
### B.2 — Layer 2: Archive branch `archive/landing-v1-classic` + push ✅ ready

### B.3 — Layer 3: DB Snapshot
- Requires verifying `C:\Users\Dr. Ali\Desktop\fluentia-lms\.env.local` exists with `VITE_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
- Script path `../fluentia-lms/.env.local` resolves from `fluentia-site-final/scripts/` — need to confirm `fluentia-lms` is at `C:\Users\Dr. Ali\Desktop\fluentia-lms`

### B.4 — npm Install (fonts only)
`framer-motion` and `react-router-dom` are ALREADY installed. Only fonts needed:
```bash
npm install -D @fontsource/cormorant-garamond @fontsource-variable/readex-pro @fontsource-variable/inter
```

### B.5 — Design System
- Create `src/styles/premium-tokens.css` ✅ ready (no conflicts with existing structure)
- Update `src/main.jsx` to import fonts + tokens ✅ ready (import order: fonts → premium-tokens.css AFTER typography.css)

### B.6 — Routing
- Use 2-line App.jsx addition (see routing architecture note above)
- Alternatively confirm with Ali which approach to take

### B.7 — Skeleton `src/pages/PremiumV1.jsx` ✅ ready
### B.8 — Local dev verify (both routes) ✅ ready
### B.9 — Single atomic commit + push ✅ ready
### B.10 — Production verify ✅ ready

---

## STOP — Awaiting "go for Phase B"

One item needs Ali's confirmation before proceeding:

> **Routing approach:** Since `BrowserRouter` lives in `App.jsx` (not `main.jsx`), adding `/v1` requires either (A) a 2-line touch of App.jsx's Routes block, or (B) a restructure of main.jsx + removal of BrowserRouter from App.jsx. Recommend (A). Please confirm.
