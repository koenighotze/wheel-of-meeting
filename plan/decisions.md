# Factory plan: cross-cutting decisions

Recorded while reviewing `vision-factory-iteration-plan-1..15.md`. Per-plan Q&A stays in each plan file.

Status: themes A-G decided.

## Decided

### A. Scope

**Decision:** Keep the first iteration as small and understandable as possible.

- Iteration 1 (split audit from quick check) is the first slice.
- Split applied 2026-10-08: iteration 1 keeps only the check/audit split. CI step, `--audit-level=high` and distinct offline result are in new plan 1b.
- Later iterations are not committed to. Each is picked up one at a time, smallest useful slice first (CLAUDE.md RULE 1).
- Plans 10, 12, 13, 15 recommend defer or merge. No work on them until a consumer exists.

**Why:** Nothing consumes the log, verdict or label yet. A small first step keeps the factory understandable.

### B. Enforcement strength

**Decision:** Guard rail, documented. Not a hard guarantee.

- Hooks and deny rules stop accidents and honest drift.
- They do not stop a determined agent (for example a Bash command that writes a protected file).
- Known gaps are listed in the factory docs. No stronger claim is made anywhere.

**Applies to:** 6, 7, 8, 9.

### C. Roles

**Decision:** Two roles, default unrestricted.

- Roles: writing (spec/tests) and implementing.
- Human sets the implementer role explicitly. No choice means normal rules.
- Agent cannot switch roles. The role state file is protected (needs 6).
- More roles only when they get different permissions.

**Applies to:** 9, 12, 14.

### D. Commit gate

**Decision:** Branch-level test check, not commit-level.

- Rule: a branch that changes `src/` must also contain a changed test. Checked when the PR is opened.
- Reason: commit-level contradicts RULE 3 (failing test is committed before the implementation).
- Plan 3 gate starts as lint + format only. Smoke tests are added only if broken commits reach the PR.

**Applies to:** 3, 8. Open: whether 7 and 8 merge into one check.

### E. Labels

**Decision:** Labels are not deferred. Humans react to them.

- `Human-approval-required` tells the human to review before merge. `low-risk-auto-approval-ready` tells the human a light review is enough.
- The label has a consumer today: the human reading the PR. No automation needed to justify it.
- Label staleness after new commits (plan 13 Q2) still needs an answer when 13 is picked up.

**Applies to:** 11, 12, 13. Scope order is still governed by A (small slices, one at a time).

### F. Human bypass and exemptions

**Decision:** One visible commit-message marker, set only by the human.

- Used for the refactor exemption (8) and gate bypass (3).
- Shows in history, so usage can be counted.
- Gap, documented per B: the agent can type the marker. The agent's instructions forbid it.

**Applies to:** 3, 7, 8.

### G. "Done" and stuck agent

**Decision:**

- "Finish" means the agent claims the task complete. Not every stop, not a question to the human.
- Failing tests are allowed during TDD steps 1-3 (feature file, failing test, verify failure).
- Cap the bounces from the done gate at 3, then stop and hand to the human.

**Applies to:** 4, 14. Plan 14 time limit stays deferred; the consecutive-failure rule comes first.

## Open

None at the cross-cutting level.

## Per-plan questions still open

Iteration 1 Q&A is answered (see plan 1; the split-off work is plan 1b). All Q&A entries in plans 2-15 are `_open_`. They are answered plan by plan when the plan is picked up.
