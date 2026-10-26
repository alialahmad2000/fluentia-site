# «دليل طلاقة» — the Knowledge Hub source

Every page under https://fluentia.academy/guide/ is ONE markdown file in this
folder. `scripts/build-guide.mjs` (run by `npm run build`) turns each file into:

1. a static HTML page `dist/guide/<slug>.html` (no JavaScript needed to read it),
2. a markdown mirror `dist/guide/<slug>.md`,
3. its share of `dist/llms.txt` + `dist/llms-full.txt`,
4. a `dist/sitemap.xml` entry with `lastmod = dateModified`,
5. its JSON-LD (Article + BreadcrumbList, + FAQPage / HowTo when present).

So a fact is edited in exactly one place. **Facts come only from
`docs/seo/FACTS.md`.** Anything not there goes to `docs/seo/NEEDS-ALI.md`.

## File format

```
---
slug: pricing                      # URL: /guide/pricing  (index.md → /guide/)
order: 3                           # position in the hub list
section: core                      # core | intent | decision | learn | trust
title: أسعار أكاديمية طلاقة 2026: الباقات وما تشمله   # <title>, ≤ 60 chars, contains «طلاقة»
description: ...                   # meta description, 140–160 chars, one concrete fact
h1: كم أسعار أكاديمية طلاقة؟         # the exact question / intent
crumb: الأسعار والباقات              # short name: breadcrumb, hub list, llms.txt
summary: one line for llms.txt and the hub list (≤ 140 chars)
datePublished: 2026-10-27
dateModified: 2026-10-27
related: about, faq, private-training   # ≥ 3 guide slugs
cta: home                          # home | private  (where the booking button goes)
howto: false                       # true → the «## خطوات …» section becomes HowTo schema
lang: ar                           # ar | en
---
First paragraph = the answer (40–60 words), names «أكاديمية طلاقة», one concrete fact.

## A question-shaped h2
Text, lists, tables …

## أسئلة شائعة
### The question, as people ask it?
The answer — one or more paragraphs.
```

Supported markdown: `##`/`###` headings, paragraphs, `-` and `1.` lists, tables
(`| a | b |` with a `|---|` row), `**bold**`, `[text](/path)`, `> callout`.
No raw HTML. The page template adds: «آخر تحديث», breadcrumb, related links,
and the booking box — do not write those by hand.

The last `## أسئلة شائعة` section feeds FAQPage JSON-LD **verbatim** (the visible
text is the schema text). For `howto: true`, the `### ` items under the h2 that
starts with «خطوات» become the HowTo steps.

## Voice rules

- First mention per page: «أكاديمية طلاقة (Fluentia Academy)». Never «فلونشيا» or any
  Arabic spelling of "Fluentia"; in Arabic it is «طلاقة».
- Our words: أكاديمية، منصّة، لقاء مبدئي. **Never in our voice:** معهد، دورة/دورات،
  مذهل، مميز/مميزات، استثنائية، الأفضل، حبيبتي، كلاس تجريبي. «معهد» and «دورة» are
  allowed only inside an `h2`/`h3`/FAQ question that quotes how people search.
- Mixed audience: impersonal or plural address (المتعلّم، من يريد، تبدأ الرحلة بـ…),
  never «أنتَ/أنتِ», no feminine-only or masculine-only imperatives in our voice.
- Western digits (500، 1,500)، prices as «750 ر.س شهرياً». Private packages: monthly
  price only — never a per-day price.
- No competitor names, no ratings, no student counts, no accreditation, no guarantees.
