#!/usr/bin/env bash
# sync-stop-check.sh — Stop
#
# Last line of defence: say out loud, at the end of a turn, that work is still
# sitting on this laptop. It warns, it never blocks — a hook that can refuse to
# end a turn is a hook that eventually traps someone.
set -u

cd "${CLAUDE_PROJECT_DIR:-$PWD}" 2>/dev/null || exit 0
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_lib.sh
. "$DIR/_lib.sh"

in_git_repo || exit 0

BRANCH="$(cur_branch)"
UP="$(upstream)"
MSGS=()

if [ -n "$UP" ]; then
  AHEAD="$(git rev-list --count "$UP..HEAD" 2>/dev/null || echo 0)"
  [ "${AHEAD:-0}" -gt 0 ] && MSGS+=("$AHEAD unpushed commit(s) on $BRANCH")
elif [ -n "$BRANCH" ] && [ "$BRANCH" != "HEAD" ]; then
  git rev-parse --verify -q HEAD >/dev/null 2>&1 && MSGS+=("branch '$BRANCH' has never been pushed")
fi

DIRTY="$(git status --porcelain --untracked-files=no 2>/dev/null)"
if [ -n "$DIRTY" ]; then
  N="$(printf '%s\n' "$DIRTY" | wc -l | tr -d ' ')"
  FILES="$(printf '%s\n' "$DIRTY" | awk '{ $1=""; sub(/^ /,""); print }' | head -5 | paste -sd', ' -)"
  [ "$N" -gt 5 ] && FILES="$FILES, +$((N-5)) more"
  MSGS+=("$N uncommitted file(s): $FILES")
fi

[ ${#MSGS[@]} -eq 0 ] && exit 0
printf '⚠️ sync: %s. Finish or commit before closing.\n' "$(IFS=' / '; echo "${MSGS[*]}")"
exit 0
