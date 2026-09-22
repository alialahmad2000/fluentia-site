#!/usr/bin/env bash
# Shared helpers for the team-sync hooks. Sourced, never run directly.
#
# A hook must never be the reason a session stalls or a prompt is lost, so every
# helper here fails open: on any doubt it returns non-zero and the caller skips
# the work rather than guessing.

# macOS ships no coreutils `timeout`, and a hook that hangs on a dead network
# hangs the prompt. run_to <seconds> <cmd...> kills the child and returns 124.
run_to() {
  local secs=$1; shift
  "$@" &
  local pid=$!
  ( sleep "$secs"; kill -TERM "$pid" 2>/dev/null ) &
  local watcher=$!
  wait "$pid" 2>/dev/null; local rc=$?
  kill "$watcher" 2>/dev/null; wait "$watcher" 2>/dev/null
  return $rc
}

in_git_repo()  { git rev-parse --is-inside-work-tree >/dev/null 2>&1; }
# A linked worktree has a different --git-dir than --git-common-dir.
is_worktree()  { [ "$(git rev-parse --git-dir 2>/dev/null)" != "$(git rev-parse --git-common-dir 2>/dev/null)" ]; }
cur_branch()   { git rev-parse --abbrev-ref HEAD 2>/dev/null; }
upstream()     { git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null; }
gitdir()       { git rev-parse --git-dir 2>/dev/null; }

# A rebase/merge already in flight, or unmerged paths on disk. Starting another
# pull on top of that corrupts the state — the only case where refusing is safer
# than syncing.
mid_operation() {
  local d; d="$(gitdir)" || return 1
  [ -d "$d/rebase-merge" ] || [ -d "$d/rebase-apply" ] || [ -f "$d/MERGE_HEAD" ] && return 0
  [ -n "$(git diff --name-only --diff-filter=U 2>/dev/null)" ]
}

conflicted_files() { git diff --name-only --diff-filter=U 2>/dev/null | paste -sd', ' -; }

# The one message both people's Claude sessions act on. Printed on stdout by the
# pull hook (it lands in context) and on stderr by the hooks that exit 2.
conflict_block() {
  local files="${1:-$(conflicted_files)}"
  cat <<BLOCK
⛔ MERGE CONFLICT with the other person's work in: ${files:-<unknown>}
Resolve it yourself now, before anything else:
1. For each file: read BOTH sides (ours vs theirs) and the commit messages (\`git log -3 --format='%h %an %s' origin/main -- <file>\`).
2. Keep BOTH people's intent. Combine the changes; never just pick one side, never delete their feature to keep yours.
3. Remove all conflict markers. Run \`npm run lint:ci\`.
4. \`git add <files>\` → \`git rebase --continue\` (repeat until done) → \`git push origin HEAD\`.
5. Only if the two changes truly contradict each other (same behaviour changed two incompatible ways) → STOP and ask the user, showing both versions side by side.
6. Write one line in the commit/PR notes: "resolved conflict with <author>'s <hash>: kept X + Y".
BLOCK
}
