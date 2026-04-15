# tests/ — Test Guidelines

## Structure

```
tests/
  features/      # Gherkin .feature files — one per behaviour area
  e2e/           # Playwright specs — one .spec.js per .feature file
  support/       # helpers.js — shared Playwright utilities
  fixtures/      # Static JSON stubs used by page.route() in tests
```

Feature files and spec files are **paired by name** (`wheel_selection.feature` ↔ `wheel_selection.spec.js`). Always create both together.

---

## Adding a Test

1. Write the Gherkin scenario in `features/<name>.feature`
2. Write the failing Playwright spec in `e2e/<name>.spec.js`
3. Run `npm test` — confirm it fails before writing any production code
4. Implement in `src/app.js` until the test passes
5. Run `npm test` — confirm the full suite still passes

Never write a spec without a corresponding feature file.

---

## Helper Reference (`support/helpers.js`)

Import helpers at the top of every spec:

```js
import { stubPartners, seedHistory, seedFullState, waitForDialog } from '../support/helpers.js';
```

| Helper | When to use |
|---|---|
| `stubPartners(page, { partners, leads })` | Intercept JSON fetches — call **before** `page.goto()` |
| `seedHistory(page, ids, dataset?)` | Pre-seed history for one dataset — call **before** `page.goto()` |
| `seedFullState(page, { partnerIds, leadIds, activeDataset? })` | Pre-seed both datasets — call **before** `page.goto()` |
| `waitForDialog(page)` | Wait for winner dialog (8 s timeout, accounts for 4.5 s spin animation) |

Add new shared utilities to `helpers.js` — not inline in spec files.

---

## Key Patterns

- **Stub order matters:** `stubPartners` / `seedFullState` / `seedHistory` must be called _before_ `page.goto()`, not after.
- **`window.confirm` dialogs:** Use `page.once('dialog', d => d.accept())` _before_ the click that triggers the dialog — not wrapped in `Promise.all`.
- **Canvas:** Do not pixel-diff canvas output. Verify the internal data state via `window.__wheel` accessors instead.
- **ICS downloads:** `Promise.all([page.waitForEvent('download'), button.click()])` — both must be set up together.
- **Internal state:** `page.evaluate(() => window.__wheel.getHistory())` etc. Only read-only accessors are exposed.

---

## Fixtures (`fixtures/`)

`partners.json` and `lead-developers.json` are the stub data files used by the CI seed step and available for tests that need realistic-looking data. Do not use these as the source of truth for production data — production data lives in GCP Secret Manager.
