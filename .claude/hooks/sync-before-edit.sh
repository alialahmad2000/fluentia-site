#!/usr/bin/env bash
# sync-before-edit.sh — PreToolUse, matcher "Edit|MultiEdit|Write"
#
# Pull the other person's latest version of THIS file right before Claude edits
# it, so most same-file collisions never become conflicts at all. Editing a
# stale copy is how one person's work gets silently reverted.
#
# exit 2 blocks the edit and hands stderr to Claude — used only when the file
# actually changed underneath, so Claude re-reads it first.
set -u

cd "${CLAUDE_PROJECT_DIR:-$PWD}" 2>/dev/null || exit 0
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_lib.sh
. "$DIR/_lib.sh"

in_git_repo || exit 0

PAYLOAD="$(cat 2>/dev/null || true)"
FILE="$(printf '%s' "$PAYLOAD" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)"
[ -z "$FILE" ] && exit 0

# Repo-relative path. Let git resolve it rather than string-matching the repo
# root: on macOS /tmp is a symlink to /private/tmp, so a literal prefix test
# silently decides the file is outside the repo and the hook does nothing.
FDIR="$(cd "$(dirname "$FILE")" 2>/dev/null && pwd -P)" || exit 0
REL="$(cd "$FDIR" 2>/dev/null && git ls-files --full-name -- "$(basename "$FILE")" 2>/dev/null | head -1)"
[ -z "$REL" ] && exit 0      # untracked or brand-new file: nothing upstream to pull

if mid_operation; then
  conflict_block >&2
  exit 2
fi

# Rate-limit: one fetch per 45s. Claude edits in bursts; a network round trip
# per edit would make every burst crawl.
STAMP="$(gitdir)/claude-last-fetch"
NOW="$(date -u +%s)"
LAST="$(cat "$STAMP" 2>/dev/null || echo 0)"
case "$LAST" in ''|*[!0-9]*) LAST=0 ;; esac
if [ $((NOW - LAST)) -ge 45 ]; then
  run_to 15 git fetch origin --quiet 2>/dev/null || exit 0   # offline: never block an edit
  echo "$NOW" > "$STAMP" 2>/dev/null || true
fi

UP="$(upstream)"; [ -z "$UP" ] && UP="origin/main"
git rev-parse --verify -q "$UP" >/dev/null 2>&1 || exit 0

# Did this specific file move upstream, and are we actually behind?
git diff --quiet HEAD "$UP" -- "$REL" 2>/dev/null && exit 0
BEHIND="$(git rev-list --count "HEAD..$UP" 2>/dev/null || echo 0)"
[ "${BEHIND:-0}" -eq 0 ] && exit 0

WHO="$(git log -1 --format='%an, %ar' "$UP" -- "$REL" 2>/dev/null)"

if is_worktree; then
  echo "⚠️ sync: '$REL' changed on $UP (${WHO:-upstream}) and this worktree is $BEHIND commit(s) behind." >&2
  echo "   Worktrees are never rebased for you — merge $UP into this branch, then re-read the file." >&2
  exit 2
fi

if run_to 60 git pull --rebase --autostash --quiet 2>/dev/null; then
  echo "↻ pulled latest $REL (changed by ${WHO:-the other person}) — re-read it before editing." >&2
  exit 2
fi
conflict_block >&2
exit 2
