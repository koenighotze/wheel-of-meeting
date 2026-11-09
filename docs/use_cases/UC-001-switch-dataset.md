# Use Case: Switch Dataset

## Overview

**Use Case ID:** UC-001
**Use Case Name:** Switch Dataset
**Primary Actor:** User
**Goal:** See the invitees of the chosen dataset (Partners or Lead Developers) on the wheel, in the invitee list, and in the meeting history.
**Trigger:** User opens the application, or clicks a different dataset tab.
**Status:** Draft

**Requirements:** [FR-001, FR-006, FR-007, FR-008, NFR-002, NFR-005](../requirements.md)

## Preconditions

- _None — this use case includes the application's initial load._

## Main Success Scenario

1. User opens the Wheel of Meeting application in the browser.
2. System loads the invitees of each dataset: the Partners and the Lead Developers.
3. System filters out any invitee whose email belongs to an excluded domain.
4. System derives a display name for each remaining invitee from their email address.
5. System restores the previously active dataset and its meeting history from the data the browser remembers between visits.
6. System removes any history entry whose invitee is no longer present in that dataset's freshly loaded invitees.
7. System displays the wheel, invitee list, and "Recently Met" list for the active dataset (see UC-004).
8. User clicks a different dataset's tab.
9. System makes the clicked dataset active and updates the section heading, wheel, invitee list, and history list to reflect it.

## Alternative Flows

### A1: Dataset Data Cannot Be Loaded

**Trigger:** A dataset's invitee data cannot be loaded (step 2)
**Flow:**

1. System treats that dataset as having no invitees for this session.
2. System does not remove any of that dataset's previously stored history entries, since it cannot tell which invitees still exist.
3. Use case continues at step 7.

### A2: Dataset Has No Eligible Invitees

**Trigger:** A dataset's invitee data loads as empty, or every invitee in it belongs to an excluded domain (step 2)
**Flow:**

1. System shows that dataset's empty-state message on the wheel and in the invitee list.
2. System disables the Spin button while that dataset is active (see UC-002 preconditions).
3. Use case continues at step 7.

## Postconditions

### Success Postconditions

- The active dataset's invitee list, wheel segments, and "Recently Met" list reflect the selected dataset only.
- The selected dataset and its history remain available the next time the application is opened.

### Failure Postconditions

- No existing meeting history is discarded or altered when a dataset's invitee data cannot be loaded.

## Business Rules

### BR-001: Excluded Domain

Invitees whose email address ends in an excluded domain (currently `finanteq.com`) are never shown in any dataset's invitee list.

### BR-002: Display Name Derivation

The name shown in the UI is derived from the email's local part, splitting on `.`, `_`, or `-` and capitalizing each part (for example, "markus.dobel@senacor.com" becomes "Markus Dobel"). The email address itself is only used in the generated invite (see UC-003 BR-004).

### BR-003: Persisted State Versioning

The active dataset selection and meeting history are remembered by the browser across reloads, tagged with a schema version. Data saved under an older schema version is discarded and replaced with defaults.

### BR-004: Stale History Pruning

A history entry is removed when its invitee is no longer present in that dataset's freshly and successfully loaded invitees. Pruning is skipped for a dataset whose invitee data could not be loaded, so history is never lost due to a temporary outage (see A1).

### BR-005: Disjoint Datasets

The Partners dataset holds only Partners and the Lead Developers dataset holds only Lead Developers; no invitee belongs to both. _Not enforced by the current implementation: an email address listed in both data files appears in both datasets. The system's reaction to such an overlap is still to be decided._
