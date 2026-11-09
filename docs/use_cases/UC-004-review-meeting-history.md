# Use Case: Review Meeting History

## Overview

**Use Case ID:** UC-004
**Use Case Name:** Review Meeting History
**Primary Actor:** User
**Goal:** See who has been met recently in the active dataset, to keep track of meeting cadence without checking a calendar.
**Trigger:** System renders or refreshes the active dataset's view (on page load, after a spin, after a dataset switch, or after clearing history).
**Status:** Draft

**Requirements:** [FR-004, NFR-005](../requirements.md)

## Preconditions

- The active dataset's invitee data and meeting history are loaded (see UC-001).

## Main Success Scenario

1. System reads the active dataset's meeting history.
2. System orders the history most-recent-first.
3. System renders up to 10 entries in the "Recently Met" list, each showing the invitee's display name and a relative time ("just now", "<N>m ago", "<N>h ago", or "<N>d ago").
4. System marks each listed invitee's wheel segment and invitee-list entry as met.

## Alternative Flows

### A1: History Exceeds Ten Entries

**Trigger:** The active dataset's meeting history has more than 10 entries (step 3)
**Flow:**

1. System keeps only the 10 most recent entries for display; whenever a new entry pushes the total past 10, the oldest entry is permanently discarded (see UC-002, step 6).
2. Use case continues at step 3.

### A2: Underlying Invitee Data Was Unreachable At Load

**Trigger:** The active dataset's invitee data could not be loaded when the application last loaded (step 1, see UC-001 A1)
**Flow:**

1. System still shows the dataset's previously stored history entries, since stale-entry pruning is skipped for a dataset that failed to load.
2. Use case continues at step 2.

### A3: Stale Entry For A Removed Invitee

**Trigger:** A history entry's invitee is no longer present in a freshly and successfully loaded dataset (step 1, see UC-001 BR-004)
**Flow:**

1. System has already removed that entry from history during load.
2. Use case continues at step 2.

## Postconditions

### Success Postconditions

- The "Recently Met" list for the active dataset accurately reflects its stored history, capped at 10 entries, most-recent-first, with human-readable relative timestamps.
- Invitees shown in the history are visually marked as met in both the wheel and the invitee list.

### Failure Postconditions

- _None — rendering the history list never fails; the worst case is an empty list when no meetings have been recorded yet for the active dataset._

## Business Rules

### BR-001: History Cap

At most 10 history entries are kept per dataset; the oldest is discarded first when a new one is added.

### BR-002: Most-Recent-First Ordering

History entries are always ordered most-recent-first.

### BR-003: Relative Timestamp Format

A history entry's timestamp is shown as "just now" (under 60 seconds old), "<N>m ago", "<N>h ago", or "<N>d ago" depending on elapsed time.

### BR-004: Per-Dataset Independence

Meeting history is tracked and displayed independently per dataset; meeting someone on one dataset's wheel never appears in another dataset's history.

### BR-005: History Persistence

The active dataset and its history are remembered by the browser across reloads (see UC-001 BR-003).
