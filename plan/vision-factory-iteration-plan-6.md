# Factory iteration 6: Protected harness files

Vision: R4, R9 (path list), R26 (implementer boundary, part 1)

## Goal

The agent cannot change the rules that govern it.

## Behaviour

- The agent is denied edits to harness files: `.claude/`, `skills-lock.json`, the factory rule and prompt files, and the `@approved` tag in feature files.
- A denied edit shows a clear message that a human must make the change.
- The human can still edit these files by hand.

## Skippable?

Yes. Iterations 7 and 8 are stronger with it, but work without it.

## Definition of done

- [ ] An agent attempt to edit `.claude/settings.json` is refused.
- [ ] An agent attempt to edit a factory rule file is refused.
- [ ] An agent attempt to add `@approved` to a feature file is refused.
- [ ] An agent edit of `src/app.js` still works.
- [ ] A human edit of the same harness file outside the agent succeeds.

## Q&A

### Questions

1. What is the full list of protected files? "Factory rule and prompt files" do not exist yet. Who maintains the list, and is the list itself protected?
   **Answer:** _open_
2. Can the agent read the protected files? (Presumably yes. It needs the rules.)
   **Answer:** _open_
3. Is this a hard guarantee or a guard rail? Can the agent achieve the same change by another route (for example running a command that writes the file)? If it is only a guard rail, what do we claim about it?
   **Answer:** _open_
4. Approval tag: can the agent create new feature files (spec author work)? Can it edit the text of an already approved feature without invalidating the approval?
   **Answer:** _open_
5. When protected files change in a commit, how do we know whether a human or the agent made the change? The commit itself does not say.
   **Answer:** _open_
6. Where does the human go from a denied edit: edit by hand and then tell the agent to continue? Is that flow acceptable in the middle of a session?
   **Answer:** _open_

### Simplest approach and alternatives

- **Simplest:** a deny list for the protected paths, plus a clear message. Nothing more.
- **Alternative A: no prevention, only detection.** Iteration 11 already flags protected-path changes for human approval. Cheaper, but a bad change is only caught late, and a self-approved `@approved` would be invisible.
- **Alternative B: run the agent in an environment where these files are read-only.** Stronger guarantee, but it moves this into sandbox setup (iteration 5).
- **Recommendation:** as planned, but answer Q3 honestly. Iteration 7 is only meaningful if "agent cannot self-approve" holds.
