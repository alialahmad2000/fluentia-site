# fluentia-site — أكاديمية طلاقة

The marketing site at **fluentia.academy**. The LMS is a separate repo,
`fluentia-lms` → `app.fluentia.academy`, and carries its own CLAUDE.md.

Read `README.md` first: it has the routing model, which is the part of this repo
that will cost you an evening if you do not know it.

---

## ⛔ ROUTING IS NOT A PLAIN SPA, AND CLOUDFLARE IS NOT VERCEL

Before adding a `<Route>`, read the "Routing" section of README.md. The short
version:

- **There is no catch-all in `_redirects`.** Cloudflare follows a redirect rule
  *even when a real asset matches*, so `/*` would serve HTML for every file in
  `/assets/`. Vercel's rewrites ran after its filesystem check; these do not.
- A rewrite target must be **extension-less** (`/app-shell`, not
  `/app-shell.html`) — Pages 308-redirects every `.html` URL, including a
  rewrite target.
- Adding a route **fails the build** until it is classified in
  `scripts/cloudflare-routing.mjs`. That is deliberate: a route nobody routes to
  is invisible otherwise.

## 🧑‍💻 New developer setup (a new laptop)

```bash
git clone https://github.com/alialahmad2000/fluentia-site.git
cd fluentia-site
npm install

gh auth login                           # GitHub
npx wrangler login                      # Cloudflare Pages: deployments, build logs
```

**`.env.local` comes from Ali privately** — never a commit, never a screenshot in
a group chat. It holds `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; the same
two are set in the Cloudflare dashboard for Production and Preview.

**Before every session, and before every new task:** `git pull --rebase --autostash`.
The SessionStart hook does it at launch, but a long session drifts.

## 👥 Working with a second developer (Ali + Ahmed)

Both people work on this repo from their own laptops with separate Claude Code
sessions. The hooks in `.claude/hooks/` are committed, so both laptops get them.

- **Sync before work.** The SessionStart hook fetches and rebases and prints what
  the other person changed. Read those lines before touching anything.
- **Sync before push:** `git pull --rebase` → build → push. If the push is
  rejected, rebase and retry. **Never `--force` on `main`.**
- **Small, finished commits.** Push as soon as a task is done and builds. Don't
  sit on unpushed work for hours — the other person is editing the same tree.
- **Stage precise paths.** Never `git add -A` / `.` / `-u`; `git-guard.sh` blocks
  it. Another session's work may be sitting in the tree.
- **Conflicts: keep BOTH people's intent.** Never discard the other side. If the
  right merge is not obvious, stop and ask the human, showing both versions.
- **Same-area work:** if the incoming commits touch files you are about to edit,
  say so before editing. For bigger overlapping work use a short-lived branch.
- **After every push, confirm the deploy.** A push is not a deploy:
  ```bash
  npx wrangler pages deployment list --project-name fluentia-site  # deploy/success
  diff <(curl -s https://fluentia.academy/) <(curl -s https://fluentia-site.pages.dev/)
  ```
  A 200 proves nothing on its own — check content.

### Who owns what

| Area | Owner |
|---|---|
| Landing pages, articles, work-English, SEO/prerender | Ali |
| `/tour` | Ali |
| _(fill in as Ahmed picks up areas here)_ | |

The LMS repo's split is Ahmed = CRM, Ali = everything else; this repo has no
equivalent division yet. Update this table rather than assuming.
