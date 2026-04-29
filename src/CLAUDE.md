# src/ — Application Guidelines

## What lives here

The entire browser application: `app.js` (all logic), `index.html` (markup), `style.css` (styles). This is what gets served by Cloud Run.

---

## Hard Constraints — Never Violate

- **No build step.** The browser loads `app.js` directly as a plain `<script>`. No bundler, no transpiler, no TypeScript.
- **No npm runtime dependencies.** devDependencies are tooling only — nothing in `src/` gets shipped as a module.
- **No ES modules.** Do not add `import`/`export` to `app.js`.
- **No frameworks.** Vanilla JS and the DOM only.
- **Single JS file.** All logic lives in `app.js`. Do not split it.

---

## Code Style

- Use `const` and `let` — never `var`.
- No `console.log` in production code.
- No inline styles in HTML — use CSS classes and the existing custom properties.
- CSS custom properties to use: `--bg`, `--surface`, `--surface2`, `--accent`, `--text`, `--text-muted`, `--radius`, `--gap`. Do not hardcode colours or spacing.

---

## Architecture Quick Reference

| Concern                | Where                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------- |
| Pure utility functions | Top of `app.js`, near related helpers                                                   |
| Stateful behaviour     | Inside `boot()` as closures or inner functions                                          |
| Per-dataset data       | Routed through `StateManager` — never `localStorage` directly                           |
| Rendering              | `renderAll()`, or one of `renderPartnerList` / `renderHistory` / `WheelRenderer.render` |
| New dataset            | Add entry to `DATASETS` array at top of `app.js`                                        |
| State exposed to tests | Read-only accessors on `window.__wheel` at bottom of `boot()`                           |

---

## Running Locally

No build step needed. The app files live in `src/`. Use `scripts/start.sh` for local dev — it routes `/data/*` to the local `data/` directory (needed for real data) and everything else to `src/`:

```bash
./scripts/start.sh        # serves src/ + data/ on port 8080
```

Playwright's test server (`python3 -m http.server 8081 --directory src`) only serves `src/` — that's fine for tests because data fetches are stubbed via `page.route()`.

Test fixtures live in `data/` (real JSON files served at runtime) and `tests/fixtures/` (stubs used by Playwright via `page.route()`). Never modify `data/` for tests — stub via `page.route()` instead.

---

## Development Workflow

All changes follow TDD — no exceptions:

1. Write a Gherkin scenario in `tests/features/`
2. Write a failing Playwright test in `tests/e2e/`
3. Run `npm test` — confirm the test fails
4. Implement the feature in `app.js`
5. Run `npm test` — confirm all tests pass

---

## Before Every Commit

```bash
npm run check   # ESLint + Prettier + npm audit
npm test        # full Playwright suite
```
