# Factory iteration 9: The implementer cannot touch tests or specs

Vision: R26 (implementer boundary)

## Goal

When the agent runs as the implementer, it can change production code only. If it thinks a test is wrong, it stops and explains.

## Behaviour

- The developer starts a session in the implementer role with one explicit step.
- In that role, edits to `tests/` and to `.feature` files are refused.
- The refusal tells the agent to stop and write up why it thinks the test is wrong.
- That write-up is saved, and the change is marked as needing human approval (used by iterations 13 and 14).
- In other roles (spec author, test author, reviewer) the normal rules apply.

## Skippable?

Yes. Independent.

## Definition of done

- [ ] In the implementer role, editing `tests/e2e/wheel_selection.spec.js` is refused.
- [ ] In the implementer role, editing a `.feature` file is refused.
- [ ] In the implementer role, editing `src/app.js` works.
- [ ] In the test author role, editing `tests/e2e/` works.
- [ ] After a refused test edit, the write-up is saved and the change is marked `Human-approval-required`.
- [ ] The active role is shown to the agent at session start.

## Q&A

### Questions

1. How is the role chosen, and what is the role when nothing is chosen? Default to the strictest, or to unrestricted?
   **Answer:** _open_
2. Can the agent change its own role? It must not. How does the human change role mid-session?
   **Answer:** _open_
3. Which roles exist, and what may each one change? The plan names four (spec author, test author, implementer, reviewer) but only defines the implementer. Is spec author vs test author a real distinction, and is reviewer an editing role at all?
   **Answer:** _open_
4. What is "tests" for the implementer: only spec files, or also test helpers, fixtures and test configuration?
   **Answer:** _open_
5. May the implementer add its own new tests (for example for an edge case), or is any test change off limits?
   **Answer:** _open_
6. After a refusal, who reads the write-up, where does it live, and what happens next: does the session end, or does the human change the test and resume?
   **Answer:** _open_
7. Where does the "needs human approval" marker live so that iterations 13 and 14 can find it?
   **Answer:** _open_

### Simplest approach and alternatives

- **Simplest:** two modes only: "writing tests/specs" and "implementing". The implementer cannot touch tests. Everything else is the same.
- **Alternative A: rely on separate sessions and instructions only,** with the PR review catching test edits (iteration 11 already flags other specs). Cheap but not enforced.
- **Alternative B: infer the role from the workflow step** (failing test exists, so implementer) instead of an explicit start. Fewer manual steps, but ambiguous when it infers wrongly.
- **Recommendation:** two roles first. Add spec author / reviewer as roles only when they have different permissions.
