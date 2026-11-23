---
name: branch-housekeeping
description: Review all open branches, PRs and worktrees, rank them by priority, judge merge/delete/continue, then delete the dead ones after approval. Use when the user asks for housekeeping, branch cleanup, "what branches are open", or "clean up stale branches".
user-invocable: true
effort: medium
allowed-tools: Read, Grep, Glob, Bash(git:*), Bash(/opt/homebrew/bin/gh:*)
---

Audit branches, report, then clean up. Two phases. Never delete before the user approves phase 2.

## Phase 1: Audit (read-only)

1. Sync: `git fetch`. Do not prune: pruning deletes remote-tracking refs. List stale refs with `git fetch --prune --dry-run`.
2. Collect:
   - `git branch -a -vv --sort=-committerdate`
   - `git worktree list`
   - `/opt/homebrew/bin/gh pr list --state all --limit 500 --json number,title,headRefName,state,mergeable` (plain `gh` needs 1Password and fails in the sandbox; the high limit avoids missing open PRs)
3. Compare against `origin/main`, not local `main` (fetch does not move local `main`). Per branch (skip `main`): `git rev-list --left-right --count origin/main...<branch>`, `git log origin/main..<branch> --format='%h %s'`, `git diff --stat origin/main...<branch>`.
4. Squash-merge trap. Ahead-counts lie here: the repo squash-merges. A branch is dead when its PR state is `MERGED`, or merging it changes nothing: `git merge-tree --write-tree origin/main <branch>` prints the tree of `origin/main` (compare with `git rev-parse origin/main^{tree}`). `git cherry origin/main <branch>` is a hint only: squash merges rewrite patches, so its `+` lines do not prove unique work. Count only commits outside a merged PR as real work.
5. For open PRs run `/opt/homebrew/bin/gh pr checks <n>`. Note failing checks and `CONFLICTING` mergeable state.
6. Remote-tracking refs with no matching remote in `git remote` (e.g. stale `httpsorigin/*`) are leftovers. Flag them.

## Report format

Sort by priority (open PRs with green or near-green CI first, then live WIP, then stale). For each branch:

- a) What happens on the branch
- b) State of the work and what comes next
- c) Judgement: merge / delete / continue
- d) Complexity: easy / semi / hard to finish

Group dead branches in one table: branch, reason (e.g. "merged as #58"). End with the open decisions that belong to the user (WIP branches whose direction is unclear).

## Phase 2: Cleanup (after explicit approval)

1. Local: `git branch -D <branches>` (`-D` needed; squash-merged branches look unmerged).
2. Remote: `git push origin --delete <branches>`.
3. Leftover refs: `git update-ref -d <ref>` for refs of a non-existent remote.
4. Verify with `git fetch --prune` and `git branch -a`.

Never delete: `main`, branches with an open PR, branches checked out in a worktree, branches with unmerged unique work. Ask first when in doubt.

## Sandbox limits

`git worktree prune/remove` and `git remote remove` fail in the sandbox (`.git/worktrees`, `.git/config` read-only). Do not retry. Give the user the exact command to run with `!`.

## Style

Terse. Hemingway. No first person.
