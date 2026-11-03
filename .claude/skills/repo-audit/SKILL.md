---
name: repo-audit
description: Audit a repository for agent-readiness in one twenty-minute pass. Checks the instruction surface (CLAUDE.md, rules), imitation surface (naming, duplication, dead code), sensor surface (tests, pre-commit gate, CI), and safety surface (destructive ops, secrets). Marks each item yes, no, or partial, totals the gaps, and picks the cheapest one to close this week. Use when the user asks to "audit the repo", "is this repo agent-ready", "what does an agent meet here", or wants a readiness checklist for Claude Code.
---

# Repo Audit

Run this on the repo the user points at: the current working directory, unless the user names another path. Run it on `main` only. One pass takes about twenty minutes. Sample, do not exhaust. Mark each item `YES`, `NO`, or `PARTIAL`. Total the `NO`s and `PARTIAL`s. Pick the cheapest one to close this week.

## Rules

- Precondition: run `git branch --show-current`. If it is not `main` (or `master`), stop. Tell the user which branch is checked out and ask them to switch. Never switch branches during the audit.
- Read-only, with one exception: run the test suite, lint, and type check. Record `git status --short` before and after. New files after the run are evidence, not an error; report them under item 8. Never edit files, commit, push, or install.
- Every mark needs evidence: a path, a command and its result, or a count. No evidence, no `YES`.
- Marks: `YES` (fully met), `PARTIAL` (met in part: some modules, some paths, some of the time), `NO` (not met, or could not be verified). Never guess. Never write "unknown"; an unverifiable item is a `NO` with the note "not verified".
- Judge the repo as it is today. Aspirational docs do not count.
- Never open `.env*` file contents. Check existence and git tracking only.
- Run only safe commands: test suite, lint, type check. Never run deploy, drop, delete, or force-push commands.
- Time-box: about twenty minutes. If a slow test suite or CI inspection eats the budget, mark what was seen and note what was skipped.

## Checklist

### A. Instruction surface

1. `CLAUDE.md` exists at the repo root.
2. `CLAUDE.md` describes the codebase as it is. Spot-check 3+ claims (commands, paths, conventions) against the repo. All hold: `YES`. Some stale: `PARTIAL`. Mostly stale: `NO`.
3. `CLAUDE.md` is under 2,000 words (`wc -w`). If longer, overflow must live in scoped rule files. Over the limit with some overflow scoped: `PARTIAL`.
4. A rules directory exists (e.g. `.claude/rules/`) with at least one rule file scoped to a real path or topic. Nested `CLAUDE.md` files in subdirectories count as scoped rules; say so.

### B. Imitation surface

5. Naming inside one module is consistent: one concept, one name. Sample the 2-3 largest or most-touched modules. List any concept with competing names. Clean in some modules only: `PARTIAL`.
6. No live duplication of a major domain concept (two `BillingService`, two `User` models, two retry paths) without a written rule naming the canonical one. Grep for duplicate class/type names and parallel implementations.
7. Dead code is removed or clearly marked (deprecated notice, `legacy/` dir, comment). Look for unreferenced files, commented-out blocks, `old`/`v1`/`legacy`/`deprecated` names. Duplicated checkouts, worktrees, or parallel copies of the app belong to item 6 only. Do not count them again here.

### C. Sensor surface

8. A test suite exists and passes clean on `main`. Run it. Report the command, pass/fail counts, and any flaky or skipped tests. Passes with skips or flakes: `PARTIAL`. New untracked files after the run, or a dirty tree before it: `PARTIAL`. If every test fails at launch (browser, port, or permission errors rather than assertion failures), the cause is the environment, not the suite. Say so in the details. Ask the user to run the suite outside the audit and mark on the answer.
9. A git-level pre-commit gate exists: a hook that runs lint, types, or scoped tests before a commit lands. Look for `core.hooksPath`, a non-sample `.git/hooks/pre-commit`, husky, lefthook, or `.pre-commit-config.yaml`. Versioned hook present: `YES`. Hook present only in `.git/hooks` and not shared with the team: `PARTIAL`. None: `NO`. A manual gate such as `make verify` does not count, but name it in the summary. Speed is for the user to judge.
10. CI gives a single readable status per PR. Inspect CI config (`.github/workflows/`, etc.). Count checks per PR. Many overlapping or advisory checks: `PARTIAL` or `NO`.
11. At least one characterization test covers a legacy module an agent is likely to touch. Identify the legacy hotspots (high churn, old, large), then check for tests pinning current behavior. Some hotspots covered: `PARTIAL`.

### D. Safety surface

12. Destructive operations (drop, delete, force-push, production deploy) require explicit confirmation or sit behind a tool the agent lacks by default. Check agent permission settings (`.claude/settings*.json` allow/deny lists), hooks, Makefile and script targets, CI deploy triggers. Some guarded, some open: `PARTIAL`. Agent permissions may also live in user-level or managed settings, outside the repo. Do not read them. Ask the user whether they add or loosen guards, and mark on the answer.
13. Secrets do not enter agent context. Typical secrets (`.env*`, `*.pem`, `*.key`, `id_rsa`, `credentials*`): run `git ls-files | grep -iE '\.env|\.pem|\.key|id_rsa|credentials'` and list matching files in the working tree by name. Check `.claude/settings*.json` for `permissions.deny` rules covering these patterns. Deny rules present and nothing tracked: `YES`. Nothing present but no deny rule: `PARTIAL`. A typical secret tracked, or present and not denied: `NO`. User-level settings may add deny rules; do not read them, ask the user. Never open the files. Separately, read `.gitignore` and list ignored paths that exist on disk (`data/`, `*.tfvars`, `terraform.tfstate`) under "For your investigation". Report them whatever the mark. The user decides what they hold.

## Pick the cheapest to close

After marking, list every `NO` and `PARTIAL`. Estimate the cost to close each, in hours of human or agent work:

- **S**: under an hour (write a short rules file, add a `.gitignore` line, add a deprecation comment, trim `CLAUDE.md`).
- **M**: a half day (add a pre-commit gate, add a characterization test, consolidate CI checks).
- **L**: more than a day (remove a duplicated domain model, rename across a module, repair a failing suite).

Pick the single cheapest item. Break ties by leverage: the item whose gap would hurt an agent session most. Name one concrete first step that fits in this week. Do not start it unasked.

After the pick, name any open blockers: item 8 or 13 marked `NO` or `PARTIAL`. These do not change the pick. They stay visible.

## Output format

```
REPO AUDIT — <repo name>  (<date>, ~20 min pass, main@<short sha>)

A. INSTRUCTION SURFACE
| #  | Item                  | Mark    | Summary                                          |
|----|-----------------------|---------|--------------------------------------------------|
| 1  | CLAUDE.md exists      | YES     | Present at repo root.                            |
| 2  | CLAUDE.md is current  | PARTIAL | Two of four spot-checked claims no longer hold.  |
| 3  | Under 2,000 words     | YES     | 640 words.                                       |
| 4  | Scoped rules          | YES     | Nested src/CLAUDE.md and tests/CLAUDE.md.        |

Details
- 2. CLAUDE.md is current. The test command in the file was renamed in the
  Makefile. The architecture section names a module that no longer exists.

B. IMITATION SURFACE
...

TOTAL: <n> YES, <n> PARTIAL, <n> NO   →   gaps: <partials + nos>

CLOSE THIS WEEK
| Item | Size | Why this one              | First step                      |
|------|------|---------------------------|---------------------------------|
| 7    | S    | Cheapest gap, one comment | Mark the legacy helper as dead. |

Blockers still open: <items, or "none">.
```

Format rules:

- One table per surface (A to D) with columns `#`, `Item`, `Mark`, `Summary`. Every item gets a row, in checklist order.
- Summary is one sentence. For `YES` it carries the evidence (path, count, command result).
- Under each table, add a `Details` list for `NO` and `PARTIAL` rows only: item number and name, then two or three sentences on what was found and why it counts as a gap. `YES` rows get no details. If a surface has no gaps, omit its `Details` list. Exception: the "For your investigation" list from item 13 always appears under surface D, even when item 13 is `YES`. Names only.
- The pick is a table with columns `Item`, `Size`, `Why this one`, `First step`. One row.
- Blockers stay a plain line under the pick table.
- Show the full gap list with sizes only if the user asks.
