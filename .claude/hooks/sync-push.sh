#!/usr/bin/env bash
# sync-push.sh — PostToolUse, matcher "Bash"
#
# When Claude commits, the commit reaches the other person. A commit that sits
# unpushed on one laptop is the whole problem this repo has: the other person
# keeps building on a main that is already stale.
#
# It only acts when the command that just ran was a real `git commit` AND the
# branch is actually ahead of its upstream — so a failed commit, a --dry-run, or
# a mention of the words in some other command pushes nothing.
#
# exit 2 hands stderr back to Claude. That is how the conflict block reaches it.
set -u

cd "${CLAUDE_PROJECT_DIR:-$PWD}" 2>/dev/null || exit 0
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_lib.sh
. "$DIR/_lib.sh"

in_git_repo || exit 0

PAYLOAD="$(cat 2>/dev/null || true)"
CMD="$(printf '%s' "$PAYLOAD" | sed -n 's/.*"command"[[:space:]]*:[[:space:]]*"\(.*\)".*/\1/p' | head -1)"
[ -z "$CMD" ] && CMD="$PAYLOAD"

printf '%s' "$CMD" | grep -qE 'git[[:space:]]+(-[^[:space:]]+[[:space:]]+)*commit' || exit 0
printf '%s' "$CMD" | grep -q -- '--dry-run' && exit 0

if mid_operation; then
  conflict_block >&2
  exit 2
fi

BRANCH="$(cur_branch)"
[ -z "$BRANCH" ] || [ "$BRANCH" = "HEAD" ] && exit 0      # detached: nothing safe to push

UP="$(upstream)"
if [ -z "$UP" ]; then
  # First push of a new branch — set the upstream so later pushes are plain.
  if run_to 180 git push -u origin "$BRANCH" --quiet 2>/dev/null; then
    echo "✅ sync: pushed new branch $BRANCH → origin" >&2
    exit 0
  fi
  echo "⛔ sync: committed locally but NOT pushed — could not publish '$BRANCH'. Check \`gh auth status\`, or the pre-push gate refused it." >&2
  exit 2
fi

AHEAD="$(git rev-list --count "$UP..HEAD" 2>/dev/null || echo 0)"
[ "${AHEAD:-0}" -eq 0 ] && exit 0                          # commit failed, or already pushed

if ! run_to 20 git fetch origin --quiet 2>/dev/null; then
  echo "⛔ sync: committed locally but NOT pushed — GitHub unreachable. Push when back online." >&2
  exit 2
fi

BEHIND="$(git rev-list --count "HEAD..$UP" 2>/dev/null || echo 0)"
if [ "${BEHIND:-0}" -gt 0 ]; then
  if ! run_to 120 git pull --rebase --autostash --quiet 2>/dev/null; then
    # Deliberately NOT aborting: Claude resolves, continues the rebase, pushes.
    conflict_block >&2
    exit 2
  fi
fi

# No --force, ever. A rejected push means someone else moved; a human decides.
if run_to 180 git push origin HEAD --quiet 2>/dev/null; then
  echo "✅ pushed $(git log -1 --format='%h %s')" >&2
  exit 0
fi
echo "⛔ sync: push failed — check \`gh auth status\`, or the pre-push gate refused it. Committed locally, NOT pushed." >&2
exit 2
