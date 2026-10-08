# Factory iteration 8: Tests first, enforced at commit time

Vision: R6

## Goal

The test-first rule is checked by the environment, not only written in prose.

## Behaviour

- A branch that changes `src/` must also contain a new or changed test (branch-level, not per commit; decisions D), unless the human has set a refactor exemption.
- The human sets the exemption explicitly (for example a marker in the commit message). The agent never sets it.
- Otherwise the check fails with a message saying a test is missing.
- The check runs when the PR is opened, never on edits.

## Skippable?

Yes. Independent. Pairs with 3 and 7.

## Definition of done

- [ ] A branch changing only `src/app.js` fails the check.
- [ ] A branch changing `src/app.js` and a spec file (in the same or separate commits) passes.
- [ ] A branch changing only `src/app.js` with the human's refactor exemption is accepted.
- [ ] Docs-only and test-only branches pass.
- [ ] The agent's instructions say it must not set the exemption on its own (full enforcement needs iteration 6; otherwise this is a documented gap).

## Q&A

### Questions

1. **Order of commits:** in the TDD flow the test is committed first and the implementation later. A rule "a commit changing `src/` must include a test" would refuse the implementation commit. Should the rule be per commit, or across the whole branch?
   **Answer:** _open_
2. Is "a new or changed test" enough, even when it has nothing to do with the changed code? The check could be satisfied by an unrelated test tweak.
   **Answer:** _open_
3. Does the rule see "test was seen to fail first" (rule 3), or only "a test exists"? Which do we really want?
   **Answer:** _open_
4. Which changes need the exemption: refactors, styling, copy changes, dependency updates? Is one marker enough, or are there different kinds?
   **Answer:** _open_
5. Who may set the exemption, and how is it visible afterwards (so the human can see how often it is used)?
   **Answer:** _open_
6. Overlap with iteration 7: both check "spec exists and relates to the code". Are these one gate or two?
   **Answer:** _open_

### Simplest approach and alternatives

- **Simplest:** branch-level check, not commit-level: "this branch changes `src/`, and also contains a changed test". Evaluated when the PR is opened.
- **Alternative A: commit-level** (as planned). Stricter but conflicts with test-first ordering unless implementation and tests are committed together.
- **Alternative B: merge iterations 7 and 8 into one "commit consistency" check:** a production change requires an approved spec and a test.
- **Recommendation:** branch-level (decided, see decisions D). Commit-level would contradict the test-first workflow it enforces.
