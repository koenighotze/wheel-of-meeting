# Factory iteration 14: Stop a stuck agent

Vision: R14, R15

## Goal

An agent that loops or runs too long is stopped, explains where it is stuck, and the change goes to a human.

## Behaviour

- Same-failure limit: the implementer is stopped after 3 consecutive failing runs of the same test (same title). The counter resets when the test passes or when the developer sends a message. The test author is exempt.
- Time limit per role session, counting active agent time only: warning at 10 minutes, edits blocked at 30 minutes, hard stop 5 minutes later.
- When blocked, further edits are refused and the agent writes a short "what I tried and where I am blocked" note.
- The change is marked `Human-approval-required`.

## Skippable?

Yes. Can be split in two: same-failure limit first, time limit second.

## Definition of done

- [ ] A test that always fails is run 3 times in a row by the implementer: after the 3rd failure, edits are refused.
- [ ] A passing run, or a developer message, resets the counter (2 failures, reset, 2 failures: not blocked).
- [ ] The test author role can fail the same test 5 times without being blocked.
- [ ] With the limits set to a few seconds (test setting), the warning, the block and the hard stop each happen in the right order.
- [ ] A pause with no agent activity does not move the clock.
- [ ] After a block, the note exists and the change is marked `Human-approval-required`.

## Q&A

### Questions

1. Why 3 failures and 30 minutes? Are these based on observed sessions? Too tight blocks normal debugging, too loose wastes time.
   **Answer:** _open_
2. Same-failure counts the same test title only. An agent cycling through different failing tests is not caught. Is that acceptable?
   **Answer:** _open_
3. What does "hard stop" do to the work in progress? Is work lost, or preserved for the human?
   **Answer:** _open_
4. How does the human resume a blocked agent? The developer message resets the failure counter, but what about the time limit?
   **Answer:** _open_
5. "Active agent time only": what counts as active, and is that precision worth building? Wall-clock with a longer limit would be simpler.
   **Answer:** _open_
6. The test author is exempt from the failure limit but can still loop forever. What stops that?
   **Answer:** _open_
7. Is the "what I tried" note something the agent writes (and may write badly)? What if it declines to?
   **Answer:** _open_
8. Overlap with iteration 9: both end in "stop, explain, mark as human-approval-required". Should that be one shared mechanism?
   **Answer:** _open_

### Simplest approach and alternatives

- **Simplest:** one rule: stop after N consecutive failing test runs (any test), until a human message. Catches same-test loops and cycling loops.
- **Alternative A: time limit only,** measured in wall-clock minutes. Catches every kind of runaway, but is slower to trigger than a failure count.
- **Alternative B: combine with iteration 4:** the agent already gets bounced at "done", so cap that number of bounces.
- **Recommendation:** ship the single consecutive-failure rule first (the plan's own split). Defer the time limit and the three-stage warning until real runaway sessions justify it.
