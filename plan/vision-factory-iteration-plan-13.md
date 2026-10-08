# Factory iteration 13: Pull request with verdict

Vision: R13

## Goal

One command ends the inner loop: it opens the PR with the verdict and the label applied.

## Behaviour

- One command takes the branch and whatever exists of the floor result (11) and the reviewer verdict (12), and opens a PR.
- The PR description contains: label, reasons, rules triggered, complexity.
- The command applies the label, never the agent.
- Nothing acts on the label yet.
- With no floor result and no verdict, the label is `Human-approval-required` and the description says why.

## Skippable?

Yes. Most useful with 11 and/or 12.

## Definition of done

- [ ] On a test branch, the command opens a PR whose description lists label, reasons and rules.
- [ ] The PR carries exactly one of the two labels.
- [ ] A branch with a protected-path change gets `Human-approval-required` (needs 11).
- [ ] With no floor result and no verdict, the PR is labelled `Human-approval-required`.
- [ ] Running the command twice does not create a second PR.

## Q&A

### Questions

1. What is the PR label used for right now? The plan says nothing acts on it. What is the human supposed to do differently because of it?
   **Answer:** _open_
2. When more commits are added after the PR is opened, is the label recalculated? A stale "low-risk" on a changed branch is dangerous.
   **Answer:** _open_
3. "No result" and "evaluated, needs a human" both give `Human-approval-required`. Should the description make the difference very visible?
   **Answer:** _open_
4. Running the command again: update the existing description and label, or leave them untouched?
   **Answer:** _open_
5. Is the PR opened as a draft or ready for review?
   **Answer:** _open_
6. Is the description meant to replace the existing PR-writing step (summary of changes, test notes) or be added to it? Do we want one description, not two.
   **Answer:** _open_
7. Does the label have to come from a command the developer remembers to run, or could it be produced whenever a PR exists, so it cannot be skipped?
   **Answer:** _open_

### Simplest approach and alternatives

- **Simplest:** a single PR description with the floor result (if present) included, created with the normal PR step. The label is a plain text line at the top.
- **Alternative A: label calculated automatically on every PR update** on the repository host. Cannot be forgotten and cannot go stale, but runs in a different place from the local loop.
- **Alternative B: skip until labels are used.** With nothing acting on them the label has no function yet.
- **Recommendation:** merge into the existing PR description step, and decide Q2 before choosing between command and automatic.
