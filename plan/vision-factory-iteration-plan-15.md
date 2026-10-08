# Factory iteration 15: Document the pattern

Vision: R25

## Goal

Someone else can understand, and later extract, what the factory does.

## Behaviour

- One short document in `factory/` describes the roles, the three feedback tiers, the gates, the verdict, the log format, and which iterations are in place.
- It separates what is generic from what is specific to this repository.
- CLAUDE.md links to it.

## Skippable?

Yes. Best done last.

## Definition of done

- [ ] The document exists and covers every part of the factory that exists.
- [ ] Each section names the command or file a reader can run or open to see it work.
- [ ] A reader (a second person or an agent) can name the four roles and the two labels after reading only this document.
- [ ] No link in the document is broken (checked by a script).
- [ ] CLAUDE.md links to the document.

## Q&A

### Questions

1. Who is the reader and what will they do with it: onboard to this repository, or reuse the factory elsewhere? The "later extract" goal changes how general it must be.
   **Answer:** _open_
2. How do we notice when the document and the factory drift apart? "Which iterations are in place" is a status that goes stale quickly.
   **Answer:** _open_
3. Is it written once at the end, or does each iteration add its own section when delivered? Waiting until the end risks forgetting or misremembering.
   **Answer:** _open_
4. Is the generic/specific split a requirement now, or an intention for the future? Splitting before a second user exists is a guess.
   **Answer:** _open_
5. Is the document the single place for factory rules, or does it duplicate rules that already live in CLAUDE.md (for example the workflow steps)? Duplication creates conflicts.
   **Answer:** _open_
6. A link checker is an extra tool. Is that check needed, or is a manual look at the document enough?
   **Answer:** _open_

### Simplest approach and alternatives

- **Simplest:** one short document that each iteration extends in its own definition of done. No separate "document" iteration at the end.
- **Alternative A: put the content in CLAUDE.md or the README** instead of a new place. Fewer files, but the factory section grows large.
- **Alternative B: write it at the end, as planned,** with the status list generated from what exists. Single effort, but weaker accuracy.
- **Recommendation:** fold this into every iteration (one paragraph each) and drop the stand-alone iteration. Make the link check manual unless a checker is already in use.
