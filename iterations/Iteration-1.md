# Iteration 1 — Project State Snapshot

**Date:** 2026-04-28  
**Branch:** `docs/project-rules-and-cleanup`

---

## Overview

Wheel of Meeting is a zero-build, zero-framework browser app that spins a canvas wheel to pick a meeting partner from a JSON-backed list. It tracks selection history in `localStorage`, proposes calendar time slots, and generates RFC 5545 ICS files for download.

The project is feature-complete. Infrastructure, CI/CD, and test coverage are all in good shape. No known bugs, no open TODOs or FIXMEs in production code.

---

## Application (`src/`)

| File         | Purpose                                                        |
| ------------ | -------------------------------------------------------------- |
| `app.js`     | All application logic — 714 lines, single vanilla JS file      |
| `index.html` | Single-page shell with `<dialog>` modal                        |
| `style.css`  | Dark theme, CSS custom properties, responsive at 900px / 420px |

**Core constraints (never violate):**

- No build step — the browser loads `app.js` directly
- No npm runtime dependencies
- No ES modules in `app.js` — plain `<script>` tag
- No frameworks — vanilla JS and the DOM only
- Single production JS file

**Architecture inside `app.js`:**  
Organized into 9 sections with IIFE modules: `StateManager` (localStorage abstraction), `WheelRenderer` (Canvas 2D animation), and a `boot()` entry point that wires everything together.

**Features:**

- Canvas wheel with idle spin animation and 4.5 s eased deceleration spin
- Smart partner selection: 3-tier priority (never met → not most recent → last resort fallback)
- Two independent datasets: `partners` (61 emails) and `lead-developers` (18 emails), each with isolated history
- History capped at 10 entries per dataset, with stale-entry pruning when source JSON changes
- Meeting slot generation: 3 random weekday slots within the next 14 days, 11:00–14:00
- ICS file generation and client-side download
- State persistence (localStorage schema v3) with forward migration
- Read-only `window.__wheel` hook for test introspection

**Data files:**  
`partners.json` and `lead-developers.json` are NOT baked into the Docker image. They are stored as GCP Secret Manager secrets and mounted into the container at runtime.

---

## Test Suite (`tests/`)

**63 E2E Playwright tests, all passing.** Each spec file is paired 1:1 with a Gherkin feature file.

| Feature                  | Tests | Spec File                          |
| ------------------------ | ----- | ---------------------------------- |
| Wheel selection          | 10    | `wheel_selection.spec.js`          |
| Meeting slots            | 8     | `meeting_slots.spec.js`            |
| History tracking         | 6     | `history.spec.js`                  |
| Display names            | 5     | `display_names.spec.js`            |
| Clear history            | 5     | `clear.spec.js`                    |
| Persistence              | 4     | `persistence.spec.js`              |
| Dataset switching        | 3     | `datasets.spec.js`                 |
| Email partners           | 2     | `email_partners.spec.js`           |
| Fetch failure resilience | 2     | `fetch_failure_resilience.spec.js` |
| ICS attendee             | 2     | `ics_attendee.spec.js`             |
| Edge cases               | 2     | `edge_cases.spec.js`               |
| Skip domain filtering    | 1     | `skip_domain.spec.js`              |

**Testing patterns:**

- Stub JSON data via `page.route()` before `page.goto()` using `stubPartners()` / `seedFullState()`
- Assert internal state via `window.__wheel.getHistory()` etc. — never pixel-diff canvas
- `waitForDialog()` handles the 4.5 s animation timeout
- Shared helpers live in `tests/support/helpers.js`

**Definition of done for app changes:**

```bash
npm run check   # lint + format + audit
npm test        # full Playwright suite
```

**Known gaps:**

- No accessibility (ARIA / screen reader) tests
- No responsiveness / mobile layout tests
- No visual regression tests for canvas rendering
- No cross-timezone validation for generated meeting slots

---

## Infrastructure (`infra/`)

**Provider:** Google Cloud (`europe-west3`), Terraform ~1.14.0, GCS backend.

| Resource          | Config                                                                           |
| ----------------- | -------------------------------------------------------------------------------- |
| Cloud Run service | `wheel-of-meeting`, 1 max instance, 128 Mi memory, CPU idle                      |
| Secret Manager    | `wom-partners-json`, `wom-leads-json` — mounted at runtime                       |
| IAM bindings      | `secretmanager.secretAccessor` on both secrets for the Cloud Run service account |
| Cloud Run invoker | Authorised user email granted `cloudrun.invoker`                                 |

**Key constraint:** IAM bindings and service account management live in the separate [`kh-gcp-seed`](https://github.com/koenighotze/kh-gcp-seed) repository. Never add IAM or service account resources here.

**Definition of done for infra changes:**

```bash
terraform fmt -recursive
terraform validate
terraform plan   # confirm no unintended changes
```

---

## CI/CD (`.github/workflows/`)

All workflows use Workload Identity Federation — no static GCP credentials.

| Workflow     | Trigger               | Purpose                                                |
| ------------ | --------------------- | ------------------------------------------------------ |
| `ci.yml`     | Push / PR to `main`   | Lint + format + audit + Playwright E2E                 |
| `plan.yml`   | Changes to `infra/**` | Checkov → TFLint → `fmt -check` → validate → plan      |
| `apply.yml`  | **Manual only**       | `terraform apply` — never auto-triggered               |
| `deploy.yml` | `v*` tag or manual    | Docker build → Artifact Registry → `gcloud run deploy` |
| `codeql.yml` | Scheduled             | GitHub CodeQL SAST                                     |

**Concurrency rules:**

- Deploy and apply: `cancel-in-progress: false` — a running deploy or apply is never cancelled
- Plan: `cancel-in-progress: true` — superseded plans are cancelled

---

## Recent Work (last ~15 commits)

| Theme                    | Detail                                                                           |
| ------------------------ | -------------------------------------------------------------------------------- |
| Documentation            | Added CLAUDE.md files per folder; fixed inconsistencies across all docs          |
| Secret Manager migration | Data files moved off the Docker image; served from GCP Secret Manager at runtime |
| Deploy refactor          | Switched to `deploy-cloudrun` reusable action                                    |
| Concurrency control      | Added concurrency groups to all workflows                                        |
| Dependabot               | Routine dependency bumps (Playwright, ESLint, Prettier, Checkov action)          |

---

## Open Gaps

| Area             | Gap                                                                        |
| ---------------- | -------------------------------------------------------------------------- |
| Testing          | No accessibility, responsiveness, or canvas visual regression tests        |
| Timezone         | Meeting slot generation uses local time; cross-timezone behaviour untested |
| Performance      | No tests for rapid spins, large partner lists, or memory usage over time   |
| Interoperability | ICS download tested; calendar app import interoperability not validated    |
