# Factory iteration 3: Smoke tests and the pre-commit gate (tier 2)

Vision: R1 (tier 2)

## Goal

A commit is only possible when lint, format and the quick smoke tests pass, in under 30 seconds.

## Behaviour

- A small set of existing Playwright tests is tagged `@smoke` (the happy path of each major area: spin, history, datasets, calendar slot).
- Before each commit, lint, format check and the `@smoke` tests run.
- If any of them fails, the commit is refused and the failure is shown.
- `npm run test:smoke` runs the tagged tests on demand.

## Skippable?

Yes. Independent. Iterations 7 and 8 add more commit-time checks next to this one.

## Definition of done

- [ ] `npm run test:smoke` runs only tests tagged `@smoke`, and at least one test per major area is tagged.
- [ ] Committing a clean change succeeds in under 30 s (measured, recorded in the PR).
- [ ] Committing a change with a lint error is refused.
- [ ] Committing a change that breaks a smoke test is refused.
- [ ] A fresh clone has the gate after the normal install, with no manual setup.

## Q&A

### Questions

1. Who decides which scenarios are "smoke", and how is that kept current when new features arrive? What happens when a new feature has no smoke test?
   **Answer:** _open_
2. Does the gate apply to the human's commits as well as the agent's? Is there a deliberate, visible way for the human to bypass it (for example in an emergency)?
   **Answer:** _open_
3. Should docs-only commits go through the same gate, or be waved through?
   **Answer:** _open_
4. What if the smoke set grows past 30 seconds? Which gives way: the time budget, or the number of tests?
   **Answer:** _open_
5. Is the gate checking the change being committed, or whatever is currently in the working folder (including uncommitted extras)? A "green" result on something other than the commit is misleading.
   **Answer:** _open_
6. Overlap with iteration 4: if the full suite must be green at "done", what extra safety does a smoke run at every commit add? Is the goal early feedback within a long session, or protection of the repository history?
   **Answer:** _open_
7. When the gate fails, what exactly should the agent do next: fix and retry, or stop?
   **Answer:** _open_

### Simplest approach and alternatives

- **Simplest:** gate = lint + format check only (seconds, no browser). Full suite stays at "done" (iteration 4) and on the PR.
- **Alternative A: smoke on every commit** (as planned). Highest protection, but needs a curated tag set and a speed budget to defend.
- **Alternative B: run only tests related to the changed files.** Fewer tests, but requires knowing which test covers what, which is more complex than a hand-picked list.
- **Recommendation:** ship the lint + format gate first. Add smoke only if broken commits actually reach the PR.
