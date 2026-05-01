# FRESH-V1-DISCOVERY — Phase A Report

Generated: 2026-05-01 | Scope: Modern Cinematic reset from editorial V2

---

## 1. Current Commit SHA

```
6ed4766 feat(premium): V2 — Hero + Manifesto + Founder Story   ✅
```

Latest on both HEAD and origin/main. Repo is up to date.

---

## 2. Files That Will Be DELETED

| File | Size | Notes |
|------|------|-------|
| `src/pages/PremiumV1.jsx` | 28,748 bytes | V2 editorial page (hero + manifesto + founder + 9 placeholders) |
| `src/styles/premium-tokens.css` | 9,343 bytes | Editorial `--p-*` token system |

Both will be preserved in git tag `v2-editorial-archive-2026-05-01` before deletion.

---

## 3. Files That Will Be CREATED

| File | Notes |
|------|-------|
| `src/pages/PremiumV1.jsx` | New Modern Cinematic 10-section skeleton — same filename, completely new content |
| `src/styles/fresh-tokens.css` | New `--f-*` design system (navy + amber + white) |

---

## 4. Files That Will Be MODIFIED

| File | Change |
|------|--------|
| `src/main.jsx` | Remove Cormorant Garamond imports + old `premium-tokens.css` import. Add Tajawal + `fresh-tokens.css` |
| `package.json` | Add `@fontsource/tajawal` |
| `package-lock.json` | Auto-updated with Tajawal |

---

## 5. Files That Will NOT Be Touched

| File | Status |
|------|--------|
| `src/App.jsx` | ❌ Not touched — route mapping unchanged (same filename) |
| `src/styles/typography.css` | ❌ Not touched — baseline type file stays |
| `src/pages/AboutPage.jsx` | ❌ Not touched |
| `src/pages/PrivacyPolicy.jsx` | ❌ Not touched |
| `src/pages/StartPage.jsx` | ❌ Not touched |
| `src/pages/TermsOfService.jsx` | ❌ Not touched |
| `src/pages/WhatsAppRedirect.jsx` | ❌ Not touched |
| `src/pages/partners/` | ❌ Not touched |
| Classic landing (`/` route) | ❌ Not touched |

---

## 6. App.jsx Route Mapping Confirmed

```
Line 2:    import PremiumV1 from './pages/PremiumV1.jsx';
Line 1199: <Route path="/v1" element={<PremiumV1 />} />
```

**Same filename = zero changes to App.jsx.** The new `src/pages/PremiumV1.jsx` slots in automatically.

---

## Phase B Plan

1. **B.1** — Archive V2: `git tag -a v2-editorial-archive-2026-05-01` + push
2. **B.2** — Delete `src/pages/PremiumV1.jsx` and `src/styles/premium-tokens.css`
3. **B.3** — `npm install -D @fontsource/tajawal`
4. **B.4** — Update `src/main.jsx`: remove Cormorant, add Tajawal + fresh-tokens
5. **B.5** — Create `src/styles/fresh-tokens.css`
6. **B.6** — Create new `src/pages/PremiumV1.jsx` (10-section skeleton)
7. **B.7** — Local verify: `npm run dev`, both `/` and `/v1` checked
8. **B.8** — Single atomic commit with all changes, push to main
9. **B.9** — Production verification

No blockers. Ready to execute.

---

## STOP — Awaiting "go for Phase B"
