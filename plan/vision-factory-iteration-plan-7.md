# Factory iteration 7: Approved specs only (human Gherkin gate)

Vision: R5

## Goal

No test or code is committed for a feature whose Gherkin file the human has not approved.

## Behaviour

- The human approves a feature by adding the `@approved` tag to the `.feature` file.
- At commit time: if the commit adds or changes `tests/e2e/<name>.spec.js` or production code for a feature, `tests/features/<name>.feature` must exist and carry `@approved`.
- Otherwise the commit is refused with a message naming the missing approval.
- A commit that only touches the `.feature` file itself is allowed (that is the spec-writing step).

## Skippable?

Yes. Best after 3 (same commit gate) and 6 (agents cannot self-approve), but works alone.

## Definition of done

- [ ] Committing a new spec file for a feature without `@approved` is refused.
- [ ] Committing the same spec after `@approved` was added by hand succeeds.
- [ ] Committing only a new `.feature` file without the tag succeeds.
- [ ] The refusal message names the feature file that needs approval.
- [ ] The 14 existing features carry `@approved` and keep committing normally.

## Q&A

### Questions

1. What does "approved" cover: the file as reviewed? If the feature file is changed after approval, does the approval still count, or does it need to be given again?
   **Answer:** _open_
2. How is a production change mapped to a feature? One change may touch several features, or none (bug fix, dependency bump, styling).
   **Answer:** _open_
3. What is the path for work that has no feature: bug fixes, refactors, docs? Is there an explicit exemption, and who grants it? (Iteration 8 has a similar question.)
   **Answer:** _open_
4. Who may approve: only me? Does approval need to be visible as a deliberate act in history, separate from the agent's work?
   **Answer:** _open_
5. Does approval cover the spec file only, or also the tests that implement it (step 2 of the workflow)? Today the plan gates tests and code with the same approval.
   **Answer:** _open_
6. What should happen to features with similar names or one test file covering two feature files?
   **Answer:** _open_

### Simplest approach and alternatives

- **Simplest:** the plan's tag approach: a visible human marker, checked at commit time.
- **Alternative A: approval by PR review only.** Remove the marker. The human reviews the Gherkin in the PR before anything else. Zero mechanism, but it is a convention rather than a gate, and the agent may already have built everything.
- **Alternative B: approval as a separate human commit.** The feature file is committed alone, by the human, before any other work. No tag, but depends on knowing who committed.
- **Recommendation:** as planned, but settle Q1 (re-approval after edits) and Q3 (no-feature work). Otherwise the gate will either leak or block routine fixes.
