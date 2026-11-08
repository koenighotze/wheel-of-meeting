# Vision — Wheel of Meeting

> **Note on provenance:** this document was reverse-engineered from the existing
> codebase (`README.md`, `ARCHITECTURE.md`, `TECH_STACK.md`, `src/app.js`, and
> the Gherkin feature files in `tests/features/`) rather than written before
> implementation. It describes the intent the running application already
> satisfies. Treat it as a **Draft** for review, not a historical record of
> original intent.

## Vision Statement

Wheel of Meeting is a lightweight, single-user browser tool that randomly and
fairly selects who to meet next from one of two datasets, remembers who was met
recently so the same person is not selected twice in a row, and turns the winner
into a ready-to-download calendar invite in two clicks — with no backend, no
database, and no build step.

## Problem

Running a regular cadence of 1:1 meetings across two groups of colleagues is
easy to get wrong by hand: it is hard to remember who was met most recently,
easy to unintentionally favor some people over others, and tedious to look up
a free slot and draft a calendar invite every time. The user wants a tool
that removes the guesswork from "who's next" and the friction from "now when
do we meet."

## Target User

A single authenticated user (the Cloud Run service's configured
`authorized_user_email`) who runs recurring 1:1 meetings against two
disjoint datasets of invitees: **Partners** (business partners at the
company) and **Lead Developers**. A Partner is never a Lead Developer and
vice versa. There is no
multi-user, multi-tenant, or self-service account model — access to the
deployed tool itself is gated entirely by Google Cloud IAM, outside the
application.

## Goals

- **Fairness** — never suggest the same person twice in a row while there is
  still someone else available; fall back gracefully when everyone has
  recently been met.
- **Low friction** — go from "who's next" to "invite downloaded" in a couple
  of clicks, without leaving the page.
- **Low maintenance** — no server-side logic, no database, and no build
  pipeline; the entire application is one HTML file, one CSS file, and one
  JavaScript file, deployable as a static site.
- **Personal touch** — the generated calendar invite reads as a warm,
  personal note from the user, not a generic system notification.
- **Resilience** — keep working, and keep prior history intact, even when a
  dataset's invitee data cannot be loaded.

## Key Capabilities

- Two disjoint datasets — Partners and Lead Developers — each
  with its own meeting history, selectable via tabs.
- An animated wheel that visually lands on a randomly, fairly selected
  invitee.
- A selection rule that prioritizes invitees not yet met, falls back to
  everyone except the most recently met invitee once everyone has been met,
  and falls back further to the whole dataset only when no other option
  exists.
- A "Recently Met" list, capped at 10 entries per dataset, ordered most
  recent first, with human-readable relative timestamps ("just now",
  "1h ago").
- Three randomly proposed weekday meeting-slot options (11:00–14:00,
  Europe/Berlin, 30 minutes) after each spin.
- One-click download of a calendar invite (.ics) for the chosen slot, with
  the winner as an attendee, the user identified as organizer, an explicit
  Europe/Berlin timezone, and a personalized German-language description.
- Automatic exclusion of invitees from a specific external company domain
  from every list, every spin, and every count used to enable/disable
  spinning.
- Human-readable display names derived from email addresses, while the real
  email address is preserved for the calendar invite.
- Meeting history and the active dataset selection persist across page reloads, and
  survive a restart even when a dataset's invitee data cannot be loaded.
- Per-dataset history reset ("Clear All Data") with a confirmation step.

## Out of Scope / Non-Goals

- **No multi-user support.** There is exactly one authorized user;
  the application has no concept of accounts, roles, or permissions of its
  own.
- **No direct calendar integration.** The tool generates a downloadable
  .ics file; it does not call a calendar API or send the invite itself.
- **No in-app dataset management.** Each dataset's invitee data is a plain
  JSON file managed outside the app (via a scraping script and GCP Secret
  Manager); there is no UI to add, edit, or remove an invitee.
- **No backend or database.** All state beyond each dataset's invitee data
  file lives in the browser's own storage; there is no server-side
  persistence.

## Success Criteria

- The tool is used to drive real 1:1 scheduling with no maintenance beyond
  occasional updates to the underlying invitee data.
- No invitee is ever suggested twice in a row while an untried alternative
  exists in the active dataset.
- The full Gherkin/Playwright suite (`tests/features/`, `tests/e2e/`) passes,
  serving as the living acceptance criteria for every behavior described in
  this document.

## Constraints & Assumptions

- Must run as a zero-build, framework-free static site (vanilla HTML/CSS/JS
  only) — see `TECH_STACK.md`.
- Must deploy to Google Cloud Run behind IAM authentication restricted to a
  single configured user.
- Dataset invitee data must never be committed to the repository or baked
  into the container image; it is stored in GCP Secret Manager and mounted
  at runtime.
- Assumes a modern, evergreen browser (no polyfills, no legacy browser
  support).
