---
name: tdd-cycle
description: Start a new TDD feature cycle for wheel-of-meeting. Guides strictly through Gherkin → failing test → implement → green suite.
---

Follow the TDD workflow from CLAUDE.md strictly. Do not skip or reorder steps.

1. Ask the user: what feature should be implemented? (one sentence)
2. Check the current test suite passes before touching anything: run `npm test`. If it fails, stop and report — do not continue until the user confirms.
3. Write the Gherkin scenario in `tests/features/<name>.feature`. Use existing `.feature` files in that directory as style reference.
4. **STOP** — show the feature file to the user and wait for explicit approval before continuing.
5. Only after approval: write the failing Playwright test in `tests/e2e/<name>.spec.js`. Import helpers from `tests/support/helpers.js`. Follow the patterns in `tests/CLAUDE.md`.
6. Run `npm test`. Confirm the new test **fails**. If it passes already, the test is wrong — stop and report to the user.
7. Implement the feature in `src/app.js` following the patterns in `src/CLAUDE.md`:
   - Pure functions near related utilities at the top
   - Stateful behaviour inside `boot()` as closures
   - Route dataset data through `StateManager`
   - Update `renderAll()` or a render helper if the UI changes
   - Add read-only accessors to `window.__wheel` if tests need to inspect state
8. Run `npm test`. Confirm **all** tests pass, including the new ones.
9. Run `npm run check` (lint + format + audit). Fix any violations.
10. Report done: summarise what was added, which tests cover it, and confirm the full suite is green.
