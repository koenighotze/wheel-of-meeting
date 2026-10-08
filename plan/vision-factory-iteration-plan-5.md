# Factory iteration 5: One-command sandbox

Vision: R3, R4

## Goal

A developer creates a ready-to-work sandbox with one host command and no manual steps.

## Behaviour

- One command on the host creates the sandbox.
- Inside, dependencies and the Playwright browser are installed, and the hooks, permissions and skills from the other iterations (where present) are active.
- Everything needed is in the repository. The only manual input is the secrets and the one-time network approvals.

## Follow-up (not part of this iteration)

Only if the 5-minute target is missed: a saved sandbox template, rebuilt when `package-lock.json` changes.

## Skippable?

Yes. Does not depend on iterations 2-4, but is more useful with them.

## Definition of done

- [ ] On a fresh sandbox, the one documented command is the only step needed before `npm test` runs successfully.
- [ ] Time from command to first green `npm test` is under 5 minutes (measured, recorded in the PR).
- [ ] Running the command again on an existing sandbox succeeds and changes nothing.
- [ ] A README section names the command and the only manual inputs.

## Q&A

### Questions

1. Who will use this: only me, or other developers or agents too? A one-person project may be well served by a short checklist.
   **Answer:** _open_
2. What are the "secrets" and "one-time approvals" concretely? Can they be listed in the repository so the human knows exactly what to hand over, and nothing else is needed?
   **Answer:** _open_
3. What does "ready to work" mean: tests run, or also that the agent has the right permissions, skills and rules from iterations 2-4 and 6-9 in place?
   **Answer:** _open_
4. When the command is re-run on an existing sandbox with outdated dependencies, should it update them or leave them alone? ("changes nothing" and "up to date" can conflict.)
   **Answer:** _open_
5. One sandbox per branch, per feature, or one long-lived? What is the cleanup story?
   **Answer:** _open_
6. What should the human see when a step fails (no network approval, missing secret)? A clear "do this next" message matters more than speed.
   **Answer:** _open_
7. Is 5 minutes a real requirement or a guess? If nobody waits on it, the target and the template follow-up are unnecessary.
   **Answer:** _open_

### Simplest approach and alternatives

- **Simplest:** a written setup checklist in the README plus one setup command that does the repeatable parts. No template.
- **Alternative A: documentation only.** Zero automation, quick to write, but manual steps drift and are skipped.
- **Alternative B: saved sandbox template** (already noted as follow-up). Faster start, but a template to maintain and invalidate.
- **Recommendation:** as planned, without the template. Do Q2 first: knowing the manual inputs defines the whole iteration.
