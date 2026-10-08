# Factory iteration 2: Instant feedback after every edit (tier 1)

Vision: R1 (tier 1)

## Goal

When Claude edits a file, the file is formatted and linted automatically, and the agent sees lint errors straight away.

## Behaviour

- After each edit of a JS, CSS, HTML, JSON or MD file, the file is auto-formatted.
- JS files are linted. Lint errors are shown to the agent in the same turn.
- Files of other types are ignored.
- The step takes under 5 seconds.

## Skippable?

Yes. Independent of all other iterations.

## Definition of done

- [ ] Editing a badly formatted `src/app.js` through Claude leaves it formatted (`npm run format:check` passes).
- [ ] Introducing an unused variable through Claude shows the lint error to the agent right after the edit.
- [ ] On 10 consecutive edits, the step takes under 5 s each (slowest time recorded in the PR).
- [ ] Editing an unsupported file type (for example a PNG) causes no error and no delay.
- [ ] A fresh clone has the behaviour with no manual setup.

## Q&A

### Questions

1. Should lint errors that already existed in the file (not caused by this edit) be shown to the agent too? Otherwise the agent may drown in unrelated noise, or fix things it was not asked to.
   **Answer:** _open_
2. Is a lint error a hard stop ("fix this before continuing") or just information? What about warnings?
   **Answer:** _open_
3. If the formatter rewrites the file after the agent edited it, the file no longer matches what the agent believes it wrote. Is that acceptable, and should the agent be told the file was reformatted?
   **Answer:** _open_
4. Which files must never be auto-formatted (generated files, lockfiles, vendored content, files the human is hand-editing)?
   **Answer:** _open_
5. Does this apply only to agent edits, or also to the human's edits in the editor? (Plan says "when Claude edits".)
   **Answer:** _open_
6. What does the agent see when formatting itself fails (for example a syntax error in a JSON file)? Same message as a lint error, or a different one?
   **Answer:** _open_
7. Is formatting CSS, HTML, JSON and MD worth it, or is JS alone enough? Each extra type adds noisy diffs and edge cases.
   **Answer:** _open_

### Simplest approach and alternatives

- **Simplest:** JS files only: format and lint, show errors. Add the other file types only if their formatting drift actually causes problems.
- **Alternative A: format only at commit time** (iteration 3) and skip instant feedback. Simpler, but the agent learns about problems late, after several edits.
- **Alternative B: lint only, never auto-format**; report format problems instead of fixing them. Avoids surprise rewrites but costs the agent extra turns.
- **Recommendation:** start with JS-only (format + lint). Widen the file types only on evidence.
