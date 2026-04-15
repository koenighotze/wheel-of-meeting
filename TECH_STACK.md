# Wheel of Meeting — Tech Stack

## Philosophy

This project is intentionally minimal. Every technology choice has a specific reason; nothing is added speculatively. The guiding rule: **if the browser can do it natively, use the browser**.

---

## Production

### Vanilla JavaScript (ES2022)

- **Why**: No build step. The browser loads `app.js` directly as a `<script>` tag. Frameworks and bundlers would add complexity with no benefit for a single-file app.
- **Style**: `'use strict'` at the top. `const`/`let` only. Arrow functions, template literals, `async/await`, destructuring, `Promise.all`.
- **Modules**: None. The file is a plain script. All symbols are module-private by being defined inside `boot()` or inside IIFEs (`StateManager`, `WheelRenderer`).
- **Target**: Modern evergreen browsers only. No polyfills.

### HTML5

- Uses `<dialog>` for the winner modal — native, accessible, keyboard-dismissable with Escape.
- Uses `<canvas>` for wheel rendering.
- No templating engine. DOM is mutated directly via `innerHTML` and `createElement`.

### CSS3

- All styles in a single `style.css`.
- CSS custom properties (`--bg`, `--surface`, `--accent`, etc.) are the design token system — use them, do not hardcode values.
- Responsive via `@media` breakpoints at 900 px and 420 px (canvas shrinks, layout collapses to single column).
- No CSS preprocessor.

### Canvas 2D API

- Used exclusively for wheel rendering (`WheelRenderer` IIFE).
- Handles: segment drawing, colour generation (`hsl`), text measurement and truncation, idle spin animation, and the 4.5 s eased spin animation.
- `requestAnimationFrame` drives both animation loops.

### Web Storage API (`localStorage`)

- Persists meeting history and active dataset choice across sessions.
- Key: `"wheel-of-meeting"`. Schema version: `3`.
- All reads and writes are funnelled through `StateManager` — nothing else touches `localStorage`.

### JSON data files

- `data/partners.json` and `data/lead-developers.json` — plain arrays of name strings.
- Fetched at startup via `fetch()`. Names double as stable IDs.
- At runtime, files are served by nginx from GCP Secret Manager volumes; they are **not** baked into the Docker image. The `data/` directory is local scratch only (gitignored).
- Use `scripts/push-data-secrets.sh` to update the live data. Use `scripts/scrape-sop.js` to regenerate `data/partners.json` from the internal directory.
- Adding a dataset requires a new JSON file, an entry in the `DATASETS` array, a new secret in `infra/secrets.tf`, and a corresponding volume mount in `infra/cloud_run.tf`.

---

## Development Server

### `python3 -m http.server 8081`

- **Why**: Zero configuration, ships with Python 3 (available on all developer machines).
- Serves the project root as a static site.
- Playwright's `webServer` config starts it automatically for test runs.
- For manual development: `./start.sh` (or `python3 -m http.server 8081` directly).

---

## Testing

### Playwright (`@playwright/test` ^1.44)

- **Why**: The app has no build step and all logic is in closures. Unit testing internals would require either exposing them or a module system. Playwright tests the app exactly as a user would, in a real browser.
- `page.route()` stubs `fetch()` calls to `data/*.json` — no real files needed in tests.
- `page.addInitScript()` seeds `localStorage` before the app boots.
- `window.__wheel` hook exposes read-only internal state for assertions that would otherwise require pixel comparison.
- Configured in `playwright.config.js` — `testDir: ./tests/e2e`, uses Chromium headless shell.

### Gherkin feature files (`tests/features/`)

- Written before any code — the requirements document.
- One `.feature` file per domain area; one matching `.spec.js` file per feature.
- Not executed directly by a Cucumber runner — scenarios are manually mapped to Playwright tests. This keeps the toolchain simple while preserving the BDD communication format.

### Test helpers (`tests/support/helpers.js`)

| Helper                                                      | Purpose                                        |
| ----------------------------------------------------------- | ---------------------------------------------- |
| `stubPartners(page, {partners, leads})`                     | Route-stubs both JSON endpoints                |
| `seedHistory(page, ids, dataset?)`                          | Pre-seeds localStorage history for one dataset |
| `seedFullState(page, {partnerIds, leadIds, activeDataset})` | Pre-seeds full localStorage state              |
| `waitForDialog(page)`                                       | Waits up to 8 s for `#winner-dialog[open]`     |

---

## Code Quality

### ESLint 9 (`eslint`, `@eslint/js`, `globals`)

- Flat config in `eslint.config.mjs`.
- Two environments:
  - `app.js` — browser globals, `sourceType: 'script'` (not ESM)
  - `tests/**/*.js`, `playwright.config.js` — Node.js + browser globals, `sourceType: 'module'`
- Browser globals are included in the test config because `page.evaluate()` callbacks run in the browser.
- Ruleset: `eslint:recommended` — catches `no-undef`, `no-unused-vars`, and other real bugs.
- Run: `npm run lint` / auto-fix: `npm run lint:fix`

### Prettier 3 (`prettier`)

- Config in `.prettierrc.json`: single quotes, semicolons, ES5 trailing commas.
- Run: `npm run format:check` (CI) / `npm run format` (auto-fix)

### `npm audit`

- Built-in, no extra package.
- Threshold: `--audit-level=moderate` (fails on moderate or higher severity).
- Run: `npm run audit`

### Combined check

```bash
npm run check   # lint + format:check + audit — run before every commit
npm test        # full Playwright suite
```

---

## Key npm Scripts

| Script                 | Command                            | Use                         |
| ---------------------- | ---------------------------------- | --------------------------- |
| `npm test`             | `playwright test`                  | Run all E2E tests           |
| `npm run test:ui`      | `playwright test --ui`             | Interactive visual debugger |
| `npm run lint`         | `eslint .`                         | Check JS quality            |
| `npm run lint:fix`     | `eslint . --fix`                   | Auto-fix JS issues          |
| `npm run format:check` | `prettier --check .`               | Verify formatting (CI)      |
| `npm run format`       | `prettier --write .`               | Auto-format everything      |
| `npm run audit`        | `npm audit --audit-level=moderate` | Check for vulnerabilities   |
| `npm run check`        | lint + format:check + audit        | Full pre-commit gate        |

---

## What This Stack Deliberately Excludes

| Excluded                 | Reason                                                                  |
| ------------------------ | ----------------------------------------------------------------------- |
| TypeScript               | No build step — adding TS would require a compiler                      |
| React / Vue / Svelte     | Unnecessary complexity for a single interactive page                    |
| Webpack / Vite / esbuild | No module system, no need to bundle                                     |
| Jest / Vitest            | Logic is in closures; unit testing would require extracting modules     |
| Cucumber / WebDriverIO   | Gherkin scenarios are mapped manually to Playwright — simpler toolchain |
| Stylelint                | CSS is minimal and consistent; Prettier handles formatting              |
| Husky / lint-staged      | Not added yet; `npm run check` is the manual gate                       |
