#!/usr/bin/env bash
# sync-pull.sh — SessionStart + UserPromptSubmit
#
# Catch this machine up with origin before Claude does anything, and tell it
# what the OTHER person changed since this machine last synced. stdout reaches
# the conversation, so it stays silent when there is nothing to say.
#
# On conflict it does NOT abort. The rebase is left in progress and the
# resolution instructions go into context, because the work is already on both
# laptops and throwing away the rebase just hides the collision until later.
set -u

cd "${CLAUDE_PROJECT_DIR:-$PWD}" 2>/dev/null || exit 0
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_lib.sh
. "$DIR/_lib.sh"

in_git_repo || exit 0

# Already mid-rebase: say so and stop. Anything else corrupts the state.
if mid_operation; then
  conflict_block
  exit 0
fi

if ! run_to 20 git fetch origin --quiet 2>/dev/null; then
  echo "⚠️ sync: GitHub unreachable — working on local copy"
  exit 0
fi
date -u +%s > "$(gitdir)/claude-last-fetch" 2>/dev/null || true

BRANCH="$(cur_branch)"
UP="$(upstream)"
STAMP="$(git rev-parse --git-common-dir)/claude-last-sync"   # inside .git, never committed

report_incoming() {
  # Keyed on the last SEEN origin/main commit, not on a timestamp: `git log
  # --since` filters by AUTHOR date, so a commit written this morning and pushed
  # this afternoon falls outside the window and the other person's work goes
  # unreported. A commit range cannot miss one.
  local seen="" raw="" log=""
  [ -f "$STAMP" ] && seen="$(sed -n '1p' "$STAMP" 2>/dev/null)"
  # \x1f-separated so the author email can be matched as a whole field.
  local FMT='%h%x1f%ae%x1f%an %ar — %s'
  if [ -n "$seen" ] && git cat-file -e "${seen}^{commit}" 2>/dev/null; then
    raw="$(git log --no-merges --format="$FMT" "${seen}..origin/main" 2>/dev/null | head -20)"
  else
    raw="$(git log --no-merges -5 --format="$FMT" origin/main 2>/dev/null)"
  fi
  # Drop this machine's own commits — the point is what the OTHER person did.
  # Match on EMAIL, not name: this repo carries a local user.name ("Ali Alahmad")
  # that differs from the global one ("alialahmad2000"), so a name test misses
  # half of them depending on which clone the commit was made in.
  local me sep; me="$(git config user.email 2>/dev/null)"
  # BSD awk (the one macOS ships) does not decode \x1f in -F — it splits on the
  # literal backslash-x-1-f and every line comes back as one field. Pass the real
  # byte instead.
  sep="$(printf '\037')"
  log="$(printf '%s\n' "$raw" | awk -F"$sep" -v me="$me" 'NF>=3 && $2 != me { print $1" "$3 }')"
  if [ -n "${log// /}" ]; then
    echo "📥 sync: new on origin/main since your last sync:"
    printf '%s\n' "$log" | sed 's/^/   /'
  fi
  { git rev-parse origin/main 2>/dev/null; date -u +%Y-%m-%dT%H:%M:%SZ; } > "$STAMP" 2>/dev/null || true
}

if is_worktree; then
  BEHIND="$(git rev-list --count HEAD..origin/main 2>/dev/null || echo 0)"
  report_incoming
  [ "${BEHIND:-0}" -gt 0 ] && echo "⚠️ sync: worktree is $BEHIND commit(s) behind origin/main — merge origin/main before finishing."
  exit 0
fi

if [ -z "$UP" ]; then
  report_incoming
  echo "ℹ️ sync: '$BRANCH' tracks no remote — fetched only, nothing pulled."
  exit 0
fi

BEHIND="$(git rev-list --count "HEAD..$UP" 2>/dev/null || echo 0)"
if [ "${BEHIND:-0}" -eq 0 ]; then
  report_incoming
  exit 0
fi

if run_to 60 git pull --rebase --autostash --quiet 2>/dev/null; then
  echo "📥 sync: pulled $BEHIND commit(s) into $BRANCH."
  report_incoming
else
  # Deliberately NOT aborting — see the header.
  conflict_block
fi
exit 0
