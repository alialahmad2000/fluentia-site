# PREMIUM-V2-DISCOVERY — Phase A Report

Generated: 2026-05-01 | Scope: replace hero, manifesto, founder sections

---

## 1. V1 Commit Confirmation

```
4b3d7da feat(premium): V1 archival + design system + skeleton   ✅
```

Latest on both HEAD and origin/main. Repo is up to date.

---

## 2. PremiumV1.jsx Structure (85 lines total)

Current file is a flat list renderer — all 12 sections share one `SECTIONS.map()` loop and one `fadeUp` variant.

| Line | Element |
|------|---------|
| 1 | `import { motion } from 'framer-motion'` |
| 3–16 | `SECTIONS` array (12 entries) |
| 18–25 | `fadeUp` variant (opacity 0→1, y 40→0, 0.8s ease-expo) |
| 27 | `export default function PremiumV1()` |
| 29 | `<main>` |
| 30–44 | Dev banner (fixed top, gold-deep bg) |
| 46–82 | `{SECTIONS.map(...)}` — all 12 placeholder sections |
| 84–85 | Close `</main>`, `}` |

**Section IDs in order:**

| # | ID | Current state |
|---|----|--------------|
| 1 | `hero` | ← **replace in V2** |
| 2 | `manifesto` | ← **replace in V2** |
| 3 | `founder` | ← **replace in V2** |
| 4 | `method` | stays placeholder |
| 5 | `tiers` | stays placeholder |
| 6 | `ielts` | stays placeholder |
| 7 | `stories` | stays placeholder |
| 8 | `trainer` | stays placeholder |
| 9 | `promise` | stays placeholder |
| 10 | `process` | stays placeholder |
| 11 | `cta` | stays placeholder |
| 12 | `footer` | stays placeholder |

**Current motion variants:** Only `fadeUp` (single variant, shared across all 12 sections).
V2 will add `fadeUpStagger` and `heroFadeIn` — no conflict with existing structure since the file is fully replaced.

---

## 3. Design Token Verification

All tokens required by V2 are present in `src/styles/premium-tokens.css`:

| Token group | Status |
|------------|--------|
| `--p-bg-primary` | ✅ `#0a0908` |
| `--p-bg-secondary` | ✅ `#16140f` |
| `--p-gold-rich` | ✅ `#c9a961` |
| `--p-gold-soft` | ✅ `#b89a55` |
| `--p-cream-bright` | ✅ `#f5f1e8` |
| `--p-cream-soft` | ✅ `#d8d2c4` |
| `--p-cream-muted` | ✅ `#a8a094` |
| `--p-cream-faded` | ✅ `#6b6558` |
| `--p-font-serif` | ✅ Cormorant Garamond |
| `--p-font-sans` | ✅ Readex Pro Variable |
| `--p-font-num` | ✅ Inter Variable |
| `--p-text-*` (10 sizes) | ✅ all present |
| `--p-tracking-*` (5 levels) | ✅ all present |
| `--p-space-*` (8 sizes) | ✅ all present |
| `--p-ease-out-expo` | ✅ `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--p-dur-base` | ✅ `800ms` |
| `--p-dur-slow` | ✅ `1200ms` |

**No missing tokens.** No need to add any.

---

## 4. Untouched File Confirmation

Phase B touches **only** `src/pages/PremiumV1.jsx` (full replacement).

| File | Will be touched? |
|------|-----------------|
| `src/App.jsx` | ❌ No |
| `src/main.jsx` | ❌ No |
| `src/styles/premium-tokens.css` | ❌ No |

---

## Phase B Plan

1. **B.1** — Replace `src/pages/PremiumV1.jsx` entirely with V2 content (hero + manifesto + founder + 9 preserved placeholders)
2. **B.2** — Local verify: `npm run dev`, both `/` and `/v1` checked
3. **B.3** — Single commit with only `src/pages/PremiumV1.jsx` staged, push to main
4. **B.4** — Production verification at fluentia.academy

---

## STOP — Awaiting "go for Phase B"

All checks green. No blockers. Ready to execute on your signal.
