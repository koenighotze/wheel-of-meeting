# Factory iteration 11: Risk floor rules

Vision: R9, R10, R11

## Goal

A script decides which changes always need a human, with no AI involved.

## Behaviour

- Input: the diff of the branch against `main`. Output: a label (`low-risk-auto-approval-ready` or `Human-approval-required`) and the list of rules triggered.
- These rules force `Human-approval-required`:
  - Protected paths changed: `infra/`, `.github/`, `Dockerfile`, `nginx.conf`, `package.json`, `package-lock.json`, `.claude/`, `skills-lock.json`, the factory rule and prompt files.
  - More than 200 changed lines in `src/` plus `tests/` (excluding `factory/log/`, lockfiles and `.feature` files).
  - Added lines contain `innerHTML`, `eval` or `document.write`.
  - A spec other than the feature's own (`tests/e2e/<name>.spec.js` for `tests/features/<name>.feature`) or `tests/support/` changed.
- No rule triggered gives `low-risk-auto-approval-ready`.
- The rules live in one file the human owns.

## Skippable?

Yes. Usable by hand. Iteration 13 can use it.

## Definition of done

- [ ] A fixture diff per rule gives `Human-approval-required` and names that rule.
- [ ] A small diff to `src/app.js` plus its own spec gives `low-risk-auto-approval-ready`.
- [ ] A diff of exactly 200 lines passes, 201 lines is flagged.
- [ ] A change only to `factory/log/` and `.feature` files counts as zero lines.
- [ ] Running the script twice on the same diff gives the same result.

## Q&A

### Questions

1. Who owns the rule list and how does it change? Because it decides what needs a human, changes to it should be human-only. (Iteration 6 protects it only if the file is listed there.)
   **Answer:** _open_
2. Are the thresholds meaningful? Is 200 lines based on how large a change can be reviewed carefully, or a guess? Added lines only, or added plus removed?
   **Answer:** _open_
3. The suspicious-text rule (`innerHTML`, `eval`, `document.write`): does "eval" also match words like "evaluate"? Do we want whole-word matching? What about other risky patterns?
   **Answer:** _open_
4. The "other spec changed" rule: when a bug fix legitimately needs a test in a different feature's spec, is a human always required?
   **Answer:** _open_
5. Is any change to `package.json` high-risk, including a harmless script rename? Same for docs-only changes.
   **Answer:** _open_
6. Deleting or weakening tests (removing assertions, skipping tests) is not covered. Is that deliberate?
   **Answer:** _open_
7. What does "low-risk-auto-approval-ready" mean today, given that nothing acts on it? Do we promise anything with the name?
   **Answer:** _open_

### Simplest approach and alternatives

- **Simplest:** two rules only: protected paths changed, and size over the limit. Add text matching and the "other spec" rule when a real miss shows they are needed.
- **Alternative A: always require a human** until real auto-approval exists. Needs no rules, the label adds no information yet.
- **Alternative B: let the reviewer agent (iteration 12) do all risk judgement.** Removes the rule list, but it is non-deterministic, which the plan wants to avoid for the floor.
- **Recommendation:** start with the two-rule version. The four-rule version is probably over-specified for the evidence we have.
