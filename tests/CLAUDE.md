# tests/ — Test Guidelines

Feature files (`features/`) and spec files (`e2e/`) are **paired by name** (`wheel_selection.feature` ↔ `wheel_selection.spec.js`). Always create both together. Never write a spec without a corresponding feature file. Follow the TDD workflow in the root [CLAUDE.md](../CLAUDE.md).

Shared Playwright utilities live in `support/helpers.js` — add new ones there, not inline in spec files.

---

## Key Patterns

- **Stub order matters:** `stubPartners` / `seedFullState` / `seedHistory` must be called _before_ `page.goto()`, not after.
- **`waitForDialog(page)`:** 8 s timeout, accounts for the 4.5 s spin animation.
- **`window.confirm` dialogs:** Use `page.once('dialog', d => d.accept())` _before_ the click that triggers the dialog — not wrapped in `Promise.all`.
- **Canvas:** Do not pixel-diff canvas output. Verify the internal data state via `window.__wheel` accessors instead.
- **ICS downloads:** `Promise.all([page.waitForEvent('download'), button.click()])` — both must be set up together.
- **Internal state:** `page.evaluate(() => window.__wheel.getHistory())` etc. Only read-only accessors are exposed.

---

## Fixtures (`fixtures/`)

`partners.json` and `lead-developers.json` are the stub data files used by the CI seed step and available for tests that need realistic-looking data. Do not use these as the source of truth for production data — production data lives in GCP Secret Manager.
