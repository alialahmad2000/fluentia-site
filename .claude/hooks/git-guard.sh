#!/usr/bin/env bash
# git-guard.sh — PreToolUse(Bash) guard for the shared-worktree convention.
#
# Enforces the three rules that this repo learned the hard way:
#   1. never `git add -A` / `.` / `-u` in the fluentia-lms family (untracked and
#      modified files in a shared tree belong to other sessions). NOTE: the older
#      reason — node_modules committed as a symlink — was true only 2026-06-08..11
#      (bf816389..c12e82e4); it is gitignored now and the repo has zero tracked
#      symlinks. The rule stands on the concurrency reason alone.
#   2. never move HEAD or rewrite refs in a SHARED tree (~/projects/fluentia-*)
#   3. never force-push (--force-with-lease is allowed)
#
# Scope is decided by the git common dir, so it binds every worktree of
# fluentia-lms and nothing else. A session-private worktree under /private/tmp
# keeps full freedom for rule 2 — that is the whole point of taking one.
#
# FAILS OPEN. Any unexpected condition (no jq, malformed payload, not a git
# repo, git errors) allows the command through. A guard that blocks real work
# is worse than no guard.

set -u

payload=$(cat 2>/dev/null) || exit 0
command -v jq >/dev/null 2>&1 || exit 0

cmd=$(printf '%s' "$payload" | jq -r '.tool_input.command // empty' 2>/dev/null) || exit 0
[ -n "$cmd" ] || exit 0

# Cheap bail-out: the overwhelming majority of Bash calls are not git.
case "$cmd" in
  *git*) ;;
  *) exit 0 ;;
esac

cwd=$(printf '%s' "$payload" | jq -r '.cwd // empty' 2>/dev/null)
[ -n "$cwd" ] || cwd="$PWD"

# `cd <path> && git ...` is the common shape under bypass mode, and the session
# cwd would otherwise hide which tree the git command actually lands in.
cd_target=$(printf '%s' "$cmd" | sed -n -E "s/^[[:space:]]*cd[[:space:]]+['\"]?([^'\"&|;]+)['\"]?[[:space:]]*(&&|;).*/\1/p" | head -1)
if [ -n "$cd_target" ]; then
  cd_target="${cd_target%"${cd_target##*[![:space:]]}"}"   # rstrip
  case "$cd_target" in
    /*) cwd="$cd_target" ;;
    "~"/*) cwd="$HOME/${cd_target#\~/}" ;;
    *) cwd="$cwd/$cd_target" ;;
  esac
fi

# The rules below match a git invocation, not a mention of one. Without this a
# read-only `grep "git add -A" docs/` was refused — which is how this guard first
# blocked the very audit that keeps it honest. Quoted segments are ARGUMENTS to
# some other program, so they are stripped before matching.
#
# Consequence, accepted deliberately: `bash -c "git add -A"` slips through. That
# shape is never a typo, and this guard fails open by design (see the header) —
# obstructing every grep and echo is the worse failure.
# 1. drop heredoc BODIES: a commit message that documents this very rule contains
#    the pattern, and `git commit -m "$(cat <<'EOF' … EOF)"` was refused for that
#    reason alone. Everything from the `<<WORD` operator to its closing delimiter
#    is data, not a command.
# 2. drop quoted segments: they are ARGUMENTS to some other program.
scan=$(printf '%s' "$cmd" | awk '
  BEGIN { skip = 0 }
  skip == 1 { if ($0 == delim) skip = 0; next }
  {
    line = $0
    if (match(line, /<<-?[\047"]?[A-Za-z_][A-Za-z0-9_]*[\047"]?/)) {
      delim = substr(line, RSTART, RLENGTH)
      gsub(/^<<-?[\047"]?/, "", delim); gsub(/[\047"]?$/, "", delim)
      print substr(line, 1, RSTART - 1)
      skip = 1
      next
    }
    print line
  }' | sed -e "s/'[^']*'/ /g" -e 's/"[^"]*"/ /g')

deny() {
  jq -nc --arg r "$1" \
    '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'
  exit 0
}

# True when cwd sits in ANY worktree of a Fluentia repo.
#
# Identified by the git REMOTE, not by a path. It used to match
# "$HOME"/projects/fluentia-lms/.git*, which is one person's directory layout:
# on a second laptop that checks the repo out anywhere else, every rule below
# silently stopped firing — a safety hook that quietly does nothing is worse
# than no hook, because nobody notices. It also left Ali's own
# ~/audits/cq-wt worktree unguarded, since it is a fluentia-lms worktree that
# does not live under ~/projects.
in_fluentia_family() {
  local url
  url=$(cd "$cwd" 2>/dev/null && git config --get remote.origin.url 2>/dev/null) || return 1
  case "$url" in
    *fluentia-lms*|*fluentia-site*) return 0 ;;
  esac
  return 1
}

# True when cwd is a SHARED tree: a Fluentia worktree that other sessions also
# sit in. A scratchpad worktree under a temp dir is this session's own.
in_shared_tree() {
  case "$cwd" in
    /private/tmp/*|/tmp/*|/private/var/folders/*|/var/folders/*) return 1 ;;
    *) in_fluentia_family ;;
  esac
}

# --- Rule 1: blanket staging -------------------------------------------------
# Matches `git add -A`, `--all`, `-u`, `--update`, and a bare `.` pathspec.
# `git add ./src/x.js` and `git add -p` are untouched.
if printf '%s' "$scan" | grep -Eq '(^|[;&|(]|[[:space:]])git[[:space:]]+add[[:space:]]+([^;&|]*[[:space:]])?(-A|--all|-u|--update|\.)([[:space:]]|[;&|)]|$)'; then
  if in_fluentia_family; then
    deny 'Blanket staging is forbidden in the fluentia-lms family.

Several sessions work these trees at once, so the untracked and modified files
around you are usually somebody else'"'"'s in-flight work — a blanket add takes them
and commits them under your message.

Stage precise paths instead:  git add src/pages/Foo.jsx src/lib/bar.js
Check what you are about to take:  git status --short'
  fi
fi

# --- Rule 2: HEAD and ref surgery in a shared tree ---------------------------
if printf '%s' "$scan" | grep -Eq '(^|[;&|(]|[[:space:]])git[[:space:]]+(checkout|switch|rebase|stash|clean)([[:space:]]|$)|(^|[;&|(]|[[:space:]])git[[:space:]]+reset[[:space:]]+([^;&|]*[[:space:]])?--hard|(^|[;&|(]|[[:space:]])git[[:space:]]+branch[[:space:]]+([^;&|]*[[:space:]])?-[dD]([[:space:]]|$)'; then
  if in_shared_tree; then
    deny 'HEAD/ref surgery is forbidden in a SHARED tree ('"$cwd"').

Dr. Ali runs several sessions against these worktrees at once. HEAD, the index
and branch refs are global to the repo — checkout / switch / rebase / stash /
clean / reset --hard / branch -d all move ground the other sessions are
standing on. This exact class of move once landed a commit on another
session'"'"'s branch and deleted their ref.

Instead:
  • take your own worktree      git worktree add <scratchpad>/wt -b <branch> origin/main
  • hand off without moving HEAD  git branch <name> <sha> && git push origin <name>
  • ship to main from a clean tree, deriving each edited file from origin/main'
  fi
fi

# --- Rule 3: force push ------------------------------------------------------
# The force flag is judged ONLY on the segment that is the `git push`, never on
# the whole command.
#
# It used to be two independent greps over the entire multi-line $cmd: deny when
# `git push` appears ANYWHERE and a force flag appears ANYWHERE. So this was a
# false deny:
#
#     rm -f node_modules
#     git push --force-with-lease origin my-branch
#
# `rm -f` on line 2 supplied the flag, the push on line 6 supplied the push, and
# the guard refused a `--force-with-lease` that its own message recommends —
# which is what it did on 2026-09-22 during the Cloudflare migration. Any
# compound command carrying both a push and a bare -f from some other tool
# (rm, cp, mv, ln, grep, sed, tail) hit it. The REGEX was always correct;
# --force-with-lease never matched it. The scope was wrong.
#
# Backslash-continuations are joined first so `git push \` + `--force` on the
# next line stays one segment and is still caught.
push_cmds=$(printf '%s' "$scan" \
  | awk '{ if (sub(/\\$/, "")) { printf "%s", $0 } else { print } }' \
  | tr ';&|' '\n\n\n' \
  | grep -E '(^|[[:space:]])git[[:space:]]+push([[:space:]]|$)')
if [ -n "$push_cmds" ]; then
  if printf '%s' "$push_cmds" | grep -Eq '(--force([[:space:]]|$)|[[:space:]]-f([[:space:]]|$))'; then
    deny 'Force-push is blocked. origin/main auto-deploys to production, and other
sessions push here minutes apart — a force-push discards whatever landed
between your fetch and your push.

If you truly must overwrite, use  git push --force-with-lease  (which refuses
when the remote moved under you), and say why in your report.'
  fi
fi

exit 0
