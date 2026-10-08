# Factory iteration 12: Independent reviewer verdict

Vision: R7, R8, R10, R12

## Goal

An independent reviewer agent reads only the spec and the diff, and writes a risk and complexity verdict.

## Behaviour

- The developer starts the review at the end of a change.
- The reviewer starts with fresh context. It sees the `.feature` file and the diff, nothing else (no log, no earlier conversation).
- It writes a verdict file: label, short reasons, complexity (low, medium or high).
- Unsure, failed or missing verdict means `Human-approval-required`.
- If iteration 11 exists, the final label is the stricter of floor result and verdict. The verdict can only escalate.

## Skippable?

Yes. Works alone.

## Definition of done

- [ ] On a trivial change, a verdict file is written with label, reasons and complexity.
- [ ] On a change with a planted defect (such as `innerHTML` fed with user input), the verdict is `Human-approval-required`.
- [ ] If the reviewer is stopped half-way, the final label is `Human-approval-required`.
- [ ] The verdict file lists its inputs, and they are only the spec and the diff.
- [ ] With iteration 11 present, a floor-flagged change never ends as `low-risk-auto-approval-ready`, even if the reviewer says so.

## Q&A

### Questions

1. What criteria does the reviewer use to call a change risky? Who defines them? Without them the verdict depends on the model's mood.
   **Answer:** _open_
2. The reviewer sees only the spec and the diff, not the surrounding code. Is that enough to judge risk? Is the narrow input worth the loss of context?
   **Answer:** _open_
3. What does the reviewer do when there is no feature file (bug fix, chore)?
   **Answer:** _open_
4. What is "complexity" used for? If nothing reads it, it is extra output to maintain.
   **Answer:** _open_
5. How often do we expect "unsure"? If the reviewer escalates most of the time, the verdict adds cost without information.
   **Answer:** _open_
6. Who starts the review, and what if the developer forgets? Is an unreviewed change simply `Human-approval-required`?
   **Answer:** _open_
7. Since the verdict can only escalate, it adds value only for changes the floor rules (iteration 11) pass. Should the review be skipped when the floor already says human?
   **Answer:** _open_

### Simplest approach and alternatives

- **Simplest:** no AI reviewer yet. Floor rules (11) decide the label, and the human reviews every PR anyway because nothing acts on the label.
- **Alternative A: reviewer runs only for floor-passing changes.** Saves cost and removes the "stricter of two" logic from most cases.
- **Alternative B: the reviewer writes a plain-language summary for the human, with no label.** Helps human review immediately and can grow into a verdict later.
- **Recommendation:** defer, or do Alternative B. The verdict has no consumer until something acts on labels.
