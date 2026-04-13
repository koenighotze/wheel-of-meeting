# Wheel of Meeting — Architecture

## Overview

A single-page browser application with no build step. All production code is in one HTML file, one CSS file, and one JavaScript file. The browser fetches two JSON data files at startup. State is persisted in `localStorage`. There is no server-side logic.

```
Browser
  └── index.html
        ├── style.css          (all styles)
        └── app.js             (all logic, loaded as a plain <script>)
              └── boot()       (single entry point, runs on load)

Data (fetched via HTTP, stubbed in tests)
  ├── data/partners.json          (local scratch only — served from Secret Manager at runtime)
  └── data/lead-developers.json  (local scratch only — served from Secret Manager at runtime)

State (client-side only)
  └── localStorage["wheel-of-meeting"]  (JSON, version 3 schema)
```

---

## File Layout

```
wheel-of-meeting/
├── index.html                    HTML shell — no logic
├── app.js                        All production JavaScript
├── style.css                     All styles, CSS custom properties
├── data/                         local scratch only — gitignored, not in Docker image
│   ├── partners.json             ["Alice", "Bob", ...]  (source for push-data-secrets.sh)
│   └── lead-developers.json      ["Lead1", "Lead2", ...]
├── tests/
│   ├── features/                 Gherkin .feature files (source of truth for requirements)
│   ├── e2e/                      Playwright spec files (one per feature file)
│   └── support/
│       └── helpers.js            Shared test utilities (stubs, seeds, waiters)
├── CLAUDE.md                     AI development guidelines
├── ARCHITECTURE.md               This file
├── TECH_STACK.md                 Technology decisions and usage guide
├── playwright.config.js          Playwright configuration
├── eslint.config.mjs             ESLint flat config (ESLint 9)
└── .prettierrc.json              Prettier config
```

---

## `app.js` Internal Structure

The file is divided into sections separated by banner comments. Reading top-to-bottom:

| Section                 | What it contains                                                                 |
| ----------------------- | -------------------------------------------------------------------------------- |
| **Utilities**           | `segmentColor`, `easeOutQuart`, `relativeTime` — pure functions, no side effects |
| **Meeting slots & ICS** | `generateTimeSlots`, `generateICS`, `downloadICS`, format helpers                |
| **Dataset config**      | `DATASETS` array — single source of truth for which datasets exist               |
| **StateManager**        | IIFE that owns all localStorage access                                           |
| **JSON loader**         | `fetchPartners` — translates JSON name arrays to `{id, name}` objects            |
| **Selection algorithm** | `selectWinner` — pure function, no side effects                                  |
| **WheelRenderer**       | IIFE that owns the `<canvas>` and all animation state                            |
| **ListManager**         | `renderPartnerList` — DOM rendering of the sidebar partner list                  |
| **HistoryTracker**      | `renderHistory` — DOM rendering of the "Recently Met" list                       |
| **Bootstrap**           | `boot()` async function — wires everything together; called once                 |

### The `boot()` function

`boot()` is the single entry point. It:

1. Grabs all DOM element references
2. Initialises `WheelRenderer` with the canvas element
3. Fetches all dataset JSON files in parallel
4. Loads state from `localStorage` via `StateManager.load()`
5. Prunes stale history entries (names removed from JSON)
6. Attaches all event listeners (tabs, spin button, dialog, clear)
7. Renders the initial UI
8. Starts the idle canvas animation
9. Exposes `window.__wheel` (test hook)

Nothing outside `boot()` touches the DOM or fires side effects.

---

## State Model

### In-memory state (`root` object inside `boot()`)

```js
{
  version: 3,
  activeDataset: 'partners',         // key of the currently visible dataset
  datasets: {
    'partners': {
      history: [                     // ordered most-recent-first, max 10 entries
        { id: 'Alice', ts: 1710000000000 },
        ...
      ]
    },
    'lead-developers': {
      history: [...]
    }
  }
}
```

This object is the single in-memory state. It is loaded from `localStorage` on boot and saved back after every mutation.

### localStorage key

`"wheel-of-meeting"` — stores the JSON-serialised `root` object. Version 3 or higher is accepted; older versions are discarded and replaced with defaults.

### Partners data (not in localStorage)

Partner lists come from JSON files fetched at startup via `fetch('/data/partners.json')` etc. At runtime these are served by nginx from GCP Secret Manager volumes mounted into the container at `/run/secrets/partners/` and `/run/secrets/leads/` — they are never baked into the Docker image. In tests the endpoints are stubbed via `page.route()`.

The fetched data is stored in the closure variable `partnersByKey` (a `{datasetKey → [{id, name}]}` map). IDs are the name strings themselves, making them stable across reloads.

---

## Data Flow

```
JSON files ──fetch──► partnersByKey (in-memory, closure)
                              │
localStorage ──load──► root   │
                         │    │
                         ▼    ▼
                    selectWinner()   ◄── spin button click
                         │
                    WheelRenderer.spin()
                         │
                    StateManager.recordMeeting()  ──save──► localStorage
                         │
                    renderAll()
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
       WheelRenderer  renderPartner  renderHistory
        (canvas)        List (DOM)    (DOM)
```

---

## Key Design Decisions

### Selection algorithm (`selectWinner`)

Three-tier priority:

1. Partners **not** in history at all → preferred pool
2. If all partners are in history: partners other than the **most recently** met → fallback pool
3. If only one partner exists and they are the most recent: return that partner (last resort)

The algorithm is a pure function — given the same partners and history, it always returns the same eligible pool (the final pick within the pool is random).

### Canvas rendering

`WheelRenderer` owns two animation loops via `requestAnimationFrame`:

- **Idle spin**: slow continuous rotation while waiting to spin
- **Spin animation**: `easeOutQuart` deceleration over 4500 ms to a calculated target angle that lands the pointer on the winner's segment

The wheel renders directly from the `partners` array and a `historyIds` array. Dimmed (grey) segments and `(met)` labels are driven purely by whether a partner's id appears in `historyIds`.

### Test hooks (`window.__wheel`)

Internal state is not on `window` by design. A minimal read-only test hook is exposed at the end of `boot()`:

```js
window.__wheel = {
  getHistory:   () => StateManager.activeData(root).history,
  getPartners:  () => activePartners(),
  getLastSlots: () => /* ISO-string array of last generated time slots */,
};
```

This allows Playwright tests to verify data-driven canvas behaviour without pixel comparison.

---

## Event Flow

```
Tab click
  → StateManager.switchDataset()
  → WheelRenderer.stopIdleSpin() / resetAngle()
  → renderAll()
  → WheelRenderer.startIdleSpin()

Spin button click
  → selectWinner()
  → spinBtn.disabled = true
  → WheelRenderer.spin(..., onComplete)
      └─ onComplete:
           → StateManager.recordMeeting()
           → renderPartnerList() + renderHistory()
           → spinBtn.disabled = false
           → openWinnerDialog()

Slot button click (in dialog)
  → downloadICS()
  → dialog.close()
  → maybeStartIdle()

Skip / Escape
  → dialog.close() / cancel
  → maybeStartIdle()

Clear button click
  → window.confirm()
  → StateManager.clearActive()
  → WheelRenderer.resetAngle()
  → renderAll()
  → maybeStartIdle()
```

---

## Extending the App

### Adding a new dataset

1. Add an entry to `DATASETS` in `app.js`
2. Add the corresponding JSON file in `data/`
3. Add an HTML tab button in `index.html` with `data-dataset="<key>"`

The rest of the app (state, rendering, history, tabs) is driven by the `DATASETS` array automatically.

### Adding a new persisted field

1. Increment `version` in `defaultRoot()` inside `StateManager`
2. Handle migration in `StateManager.load()` (or let it reset to defaults)
3. Add accessor/mutator methods to `StateManager`
4. Expose via `window.__wheel` if tests need to read it

### Adding a new render area

Add a render helper function (pure: takes data, writes to DOM) and call it from `renderAll()`.
