#!/usr/bin/env bash
# sync-db-guard.sh — PreToolUse, matcher "mcp__.*apply_migration|mcp__.*execute_sql"
#
# Git protects files. Nothing protects the live database: `create or replace
# function` silently discards whatever the other person deployed an hour ago,
# and no merge conflict ever warns you.
#
# So before any DDL: pull, so supabase/migrations/ holds their newest files, and
# put the compare-live-first rule in front of Claude. Plain SELECTs pass in
# silence — an alarm that fires on everything is not an alarm.
set -u

cd "${CLAUDE_PROJECT_DIR:-$PWD}" 2>/dev/null || exit 0
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_lib.sh
. "$DIR/_lib.sh"

in_git_repo || exit 0

PAYLOAD="$(cat 2>/dev/null || true)"
printf '%s' "$PAYLOAD" \
  | grep -qiE '(create|alter|drop|replace)[[:space:]]|[[:space:]](policy|trigger|grant|revoke)[[:space:]]' \
  || exit 0

if mid_operation; then
  conflict_block
  exit 0
fi

if ! is_worktree; then
  UP="$(upstream)"
  if [ -n "$UP" ] && run_to 20 git fetch origin --quiet 2>/dev/null; then
    BEHIND="$(git rev-list --count "HEAD..$UP" 2>/dev/null || echo 0)"
    if [ "${BEHIND:-0}" -gt 0 ]; then
      if run_to 60 git pull --rebase --autostash --quiet 2>/dev/null; then
        echo "📥 DB guard: pulled $BEHIND commit(s) first, so supabase/migrations/ is current."
      else
        conflict_block
        exit 0
      fi
    fi
  fi
fi

LATEST="$(ls -1 supabase/migrations 2>/dev/null | tail -1)"

cat <<TXT
🛢 DB guard: before replacing any function/view/policy/trigger, fetch its LIVE definition
   (\`pg_get_functiondef\` / \`pg_get_viewdef\` / \`pg_policies\` with the FULL qual, never truncated)
   and compare it with the latest repo migration. If live ≠ repo, the other person changed it —
   merge their change into yours, do not overwrite it.
   Use a fresh migration timestamp later than every file in supabase/migrations/${LATEST:+ (newest now: $LATEST)}.
TXT
exit 0
