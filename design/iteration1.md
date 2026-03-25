# Wheel of Meeting — Iteration 1 Design Summary

## What Was Built

A zero-build, zero-framework browser app that spins a wheel to pick a meeting partner, tracks history in localStorage, and proposes calendar slots.

---

## Architecture

### Core Files

| File                        | Role                                              |
| --------------------------- | ------------------------------------------------- |
| `app.js`                    | Single production JS file — all logic, no modules |
| `index.html`                | Entry point, loads `app.js` as plain `<script>`   |
| `style.css`                 | CSS custom properties, no frameworks              |
| `data/partners.json`        | Partner email addresses                           |
| `data/lead-developers.json` | Lead developer email addresses                    |

### `app.js` Structure

- **`StateManager`** — localStorage read/write, version 3 schema, per-dataset history
- **`WheelRenderer`** — Canvas 2D spinning wheel with `easeOutQuart` deceleration over 4500 ms
- **`generateTimeSlots(n)`** — Proposes `n` future meeting slots (weekdays, business hours, 14-day window, unique days)
- **`generateICS(partnerName, start, end)`** — Produces `.ics` calendar invite with `METHOD:REQUEST` and `ATTENDEE` line
- **`boot()`** — Async entry: fetches data, wires DOM events, starts idle animation
- **`renderAll()`** — Orchestrates all three render helpers for the active dataset
- **`renderPartnerList(partners, history, emptyText)`** — Renders the partner list with met badges
- **`renderHistory(partners, history)`** — Renders the meeting history list with relative timestamps
- **`DATASETS`** — Config array at top of file; add an entry here to support a new dataset (key, label, file path, empty text)
- **`window.__wheel`** — Read-only test hook: `getHistory()`, `getPartners()`, `getLastSlots()`

### localStorage Schema (version 3)

```json
{
  "version": 3,
  "activeDataset": "partners",
  "datasets": {
    "partners": {
      "history": [{ "id": "alice@example.com", "ts": 1234567890 }]
    },
    "lead-developers": { "history": [] }
  }
}
```

### Selection Algorithm (3-tier priority)

1. Partners not in history → eligible pool
2. If pool empty (all partners have been met) → all partners except the most recently met one
3. If that filter also produces nothing (single partner who is also the most recent) → all partners (guaranteed pick)

---

## Test Suite

### Stack

- **Playwright** for E2E browser testing
- **Gherkin** feature files as requirements source of truth
- **TDD/BDD workflow**: feature file → failing test → implementation → green

### Spec Files (run `npm test` for current count)

| File                                | Scenarios                                                              |
| ----------------------------------- | ---------------------------------------------------------------------- |
| `tests/e2e/wheel_selection.spec.js` | 11 — selection logic, visual state, button behaviour                   |
| `tests/e2e/datasets.spec.js`        | 2 — tab switching                                                      |
| `tests/e2e/history.spec.js`         | 6 — ordering, cap, relative timestamps, dataset isolation              |
| `tests/e2e/clear.spec.js`           | 5 — clear confirmation, badge removal, cross-dataset safety            |
| `tests/e2e/persistence.spec.js`     | 4 — reload, graying, active tab, stale entry pruning                   |
| `tests/e2e/edge_cases.spec.js`      | 7 — Escape, idle resume, long names, rapid switching, unreachable JSON |
| `tests/e2e/meeting_slots.spec.js`   | 14 — slot count, time constraints, ICS content, Skip behaviour         |
| `tests/e2e/email_partners.spec.js`  | 3 — email format in list, dialog, production data                      |
| `tests/e2e/ics_attendee.spec.js`    | 2 — ATTENDEE in ICS, METHOD:REQUEST                                    |

### Key Testing Patterns

- Stub JSON: `stubPartners(page, { partners: [...], leads: [...] })` via `page.route()`
- Seed history: `seedHistory(page, ids)` or `seedFullState(page, {...})` via `page.evaluate()`
- `window.confirm` dialogs: `page.once('dialog', d => d.accept())` **before** click (not Promise.all)
- Canvas behaviour: verify data state via `window.__wheel`, not pixel-diffing

---

## Tooling

| Tool                          | Purpose                                                                            |
| ----------------------------- | ---------------------------------------------------------------------------------- |
| ESLint 9 (flat config)        | Linting — two environments: `app.js` (browser script) and `tests/**` (Node module) |
| Prettier                      | Formatting — single quotes, semicolons, ES5 trailing commas                        |
| `npm audit`                   | Dependency vulnerability scanning                                                  |
| `npm run check`               | Combined gate: lint + format:check + audit                                         |
| `python3 -m http.server 8081` | Dev server (no build required)                                                     |

---

## Key Decisions

- **No build step** — browser loads `app.js` directly as a plain `<script>` tag
- **No npm runtime dependencies** — devDependencies only; nothing shipped
- **No ES modules in `app.js`** — avoids CORS issues with `file://` and keeps the script context clean
- **Email addresses as partner IDs** — email is both the display name and the unique identifier
- **ICS `METHOD:REQUEST`** — signals to calendar clients that the invite requires a response
- **`ATTENDEE` with `mailto:` URI** — enables calendar clients to auto-populate recipients

---

## Constraints Never to Violate

- No `var` — use `const`/`let`
- No direct `localStorage` access outside `StateManager`
- No `console.log` in production code
- No inline styles in HTML
- No pixel-diffing tests for canvas
- No `"type": "module"` in `package.json`
- No modifying real data files in tests — stub with `page.route()`
