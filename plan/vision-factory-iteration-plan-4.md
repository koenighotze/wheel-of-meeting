# Factory iteration 4: "Done" means the full suite is green (tier 3)

Vision: R1 (tier 3)

## Goal

The agent cannot declare "done" while the full Playwright suite is failing.

## Behaviour

- When the agent tries to finish, the full suite runs.
- If it fails, the agent is told which tests failed and keeps working.
- If it passes, the agent finishes.
- The full suite takes under 3 minutes.

## Skippable?

Yes. Independent of the others.

## Definition of done

- [ ] With a deliberately broken test, the agent's attempt to finish is blocked and the failing test name is shown to it.
- [ ] With all tests green, the agent finishes normally.
- [ ] The full suite runs in under 3 minutes in the sandbox (measured, recorded in the PR).
- [ ] If nothing changed since the last green run, finishing does not rerun the suite (finish takes under 5 s).

## Q&A

### Questions

1. What exactly is "finish"? Every time the agent stops talking (including when it asks me a question), or only when it claims the task is complete? Running 3 minutes of tests while the agent merely asks "which option?" would be wasteful.
   **Answer:** _open_
2. If the suite was already red when the session began (rule 0 says to ask me), should the agent be blocked forever for failures it did not cause?
   **Answer:** _open_
3. How are flaky tests handled: automatic rerun of the failing ones, or treat the first failure as real?
   **Answer:** _open_
4. Is there a cap on how many times the agent can be bounced back? An agent that cannot fix a failure would loop (this overlaps with iteration 14).
   **Answer:** _open_
5. "Nothing changed since the last green run": does a docs-only edit count as a change? Does a change to a feature file?
   **Answer:** _open_
6. During TDD the agent legitimately has a failing test before implementing (rule 3). Must "finish" be allowed in that state, for example when handing the failing test to me for review (step 1/2)?
   **Answer:** _open_
7. What does the agent see: only test names, or also the failure reason?
   **Answer:** _open_

### Simplest approach and alternatives

- **Simplest:** run the suite only when the agent claims completion and files have changed since the last green run. Report failing test names and reasons.
- **Alternative A: rely on the PR check only.** No local blocking at all. Simplest, but the failure is found late and costs a round trip.
- **Alternative B: run the suite at every commit.** Gives stronger history, but is slow (3 min per commit) and conflicts with the TDD flow of "failing test first".
- **Recommendation:** keep as planned, but settle Q1 and Q6 first. Without a defined "finish" and a TDD exception, this gate blocks legitimate work.
