# Wheel of Meeting — Claude Code Guidelines

## Project in One Sentence

A zero-build, zero-framework browser app that spins a wheel to pick a meeting partner from a JSON-backed list, tracks history in localStorage, and proposes calendar slots.

## Further Reading

- **[ARCHITECTURE.md](ARCHITECTURE.md)** — system design, data flow, `app.js` internals, event flow, and extension guides
- **[TECH_STACK.md](TECH_STACK.md)** — technology choices, tooling reference, and npm scripts

---

## Development Workflow: TDD / BDD

All new features must follow this order — no exceptions:

1. **Write a Gherkin feature file** in `tests/features/` describing the new behaviour
2. **Write the failing Playwright test(s)** in `tests/e2e/` that implement the scenarios
3. **Verify the tests fail** (`npm test`) before touching any production code
4. **Implement the feature** in production code until all new tests pass
5. **Confirm the full suite still passes** (`npm test`)

Never implement a feature before its test exists and has been seen to fail.

---

## Core Constraints — Never Violate These

- **No build step.** No bundler, no transpiler, no TypeScript. The browser loads `app.js` directly.
- **No npm runtime dependencies.** All devDependencies are tooling only. Nothing gets shipped.
- **No ES modules in `app.js`.** It is a plain `<script>` tag. Do not add `import`/`export`.
- **No frameworks.** No React, Vue, Alpine, etc. Vanilla JS and the DOM only.
- **Single production JS file.** All logic lives in `app.js`. Do not split it.

---

## How to Add a Feature

### Adding logic

- New pure functions go at the top of `app.js` near related utilities.
- New stateful behaviour belongs inside `boot()` as a closure variable or inner function.
- If the feature touches per-dataset data, route it through `StateManager` — do not read/write `localStorage` directly anywhere else.
- If the feature changes what is rendered, update `renderAll()` or one of the three render helpers (`renderPartnerList`, `renderHistory`, `WheelRenderer.render`).

### Adding a dataset

Add an entry to the `DATASETS` array at the top of `app.js`. The rest of the app is driven by this array.

### Exposing state for tests

Add read-only accessors to `window.__wheel` at the bottom of `boot()`. Never expose mutable references.

### Adding styles

Use the existing CSS custom properties (`--bg`, `--surface`, `--surface2`, `--accent`, `--text`, `--text-muted`, `--radius`, `--gap`). Do not hardcode colours or spacing.

---

## Testing Patterns

| Need                    | How                                                                          |
| ----------------------- | ---------------------------------------------------------------------------- |
| Stub JSON data          | `stubPartners(page, { partners: [...], leads: [...] })` before `goto`        |
| Pre-seed history        | `seedHistory(page, ids)` or `seedFullState(page, {...})` before `goto`       |
| Seed both datasets      | `seedFullState(page, { partnerIds, leadIds })`                               |
| Wait for winner dialog  | `waitForDialog(page)` (8 s timeout, handles 4.5 s animation)                 |
| Handle `window.confirm` | `page.once('dialog', d => d.accept())` **before** clicking — not Promise.all |
| Read internal state     | `page.evaluate(() => window.__wheel.getHistory())` etc.                      |
| Verify canvas behaviour | Check the data that drives rendering via `window.__wheel`, not pixels        |
| Capture ICS download    | `Promise.all([page.waitForEvent('download'), button.click()])`               |

Helpers live in `tests/support/helpers.js`. Add shared utilities there, not inline in spec files.

---

## Definition of Done

A task is complete only when:

```bash
npm test      # all 49+ tests green
npm run check # lint + format + audit all pass
```

---

## What NOT to Do

- Do not use `var` — use `const` and `let`.
- Do not call `localStorage` directly outside `StateManager`.
- Do not add `console.log` to production code (ESLint will flag it as `no-undef` in the browser script context anyway).
- Do not add inline styles to HTML — use CSS classes.
- Do not modify `data/partners.json` or `data/lead-developers.json` for tests — stub them with `page.route()`.
- Do not write pixel-diffing tests for canvas — verify the data state that drives rendering instead.
- Do not introduce a `package.json` `"type": "module"` — it would break the `app.js` script context.
