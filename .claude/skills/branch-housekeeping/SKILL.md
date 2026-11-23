---
name: branch-housekeeping
description: Review all open branches, PRs and worktrees, rank them by priority, judge merge/delete/continue, then delete the dead ones after approval. Use when the user asks for housekeeping, branch cleanup, "what branches are open", or "clean up stale branches".
user-invocable: true
effort: medium
allowed-tools: Read, Grep, Glob, Bash(git:*), Bash(/opt/homebrew/bin/gh:*)
---

Audit branches, report, then clean up. Two phases. Never delete before the user approves phase 2.

## Phase 1: Audit (read-only)

1. Sync: `git fetch --prune`.
2. Collect:
   - `git branch -a -vv --sort=-committerdate`
   - `git worktree list`
   - `/opt/homebrew/bin/gh pr list --state all --limit 40 --json number,title,headRefName,state,mergeable` (plain `gh` needs 1Password and fails in the sandbox)
3. Per branch (skip `main`): `git rev-list --left-right --count main...<branch>`, `git log main..<branch> --format='%h %s'`, `git diff --stat main...<branch>`.
4. Squash-merge trap. Ahead-counts lie here: the repo squash-merges. A branch is dead when its PR state is `MERGED` or its content is already on `main`. Confirm with `git diff --stat main <branch>` against the PR title, and `git log main --oneline | grep <topic>`. Count only commits that are not in a merged PR as real work.
5. For open PRs run `gh pr checks <n>`. Note failing checks and `CONFLICTING` mergeable state.
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
