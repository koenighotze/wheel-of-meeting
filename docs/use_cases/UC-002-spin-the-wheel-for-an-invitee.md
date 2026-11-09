# Use Case: Spin the Wheel for an Invitee

## Overview

**Use Case ID:** UC-002
**Use Case Name:** Spin the Wheel for an Invitee
**Primary Actor:** User
**Goal:** Get a fair, history-aware selection of which invitee to meet next from the active dataset.
**Trigger:** User clicks the Spin button.
**Status:** Draft

**Requirements:** [FR-002, FR-006, FR-007, FR-008, NFR-003](../requirements.md)

## Preconditions

- The active dataset has at least one eligible invitee loaded, so the Spin button is enabled (see UC-001).
- The wheel is not already spinning.

## Main Success Scenario

1. User clicks the Spin button.
2. System disables the Spin button and stops the wheel's idle rotation.
3. System builds the eligible pool: every invitee in the active dataset who has not yet been met, according to its meeting history.
4. System randomly selects a winner from the eligible pool.
5. System spins the wheel so it visually lands on the winner's segment.
6. System records the winner as a new entry in the active dataset's meeting history (see UC-004).
7. System updates the invitee list and "Recently Met" list to reflect the new history.
8. System re-enables the Spin button.
9. System opens the winner dialog with proposed meeting slots for the winner (see UC-003).

## Alternative Flows

### A1: Everyone Has Already Been Met

**Trigger:** Every invitee in the active dataset is already in its meeting history (step 3)
**Flow:**

1. System builds the eligible pool from every invitee except the single most recently met one.
2. Use case continues at step 4.

### A2: Only the Most Recently Met Invitee Remains

**Trigger:** The pool built in A1 is still empty (for example, the dataset has a single invitee and they were just met) (step 3)
**Flow:**

1. System makes every invitee in the dataset eligible again, including the most recently met one.
2. Use case continues at step 4.

## Postconditions

### Success Postconditions

- The winner is recorded as the most recent entry in the active dataset's meeting history.
- The winner's wheel segment and invitee-list entry are marked as met.
- The winner dialog is open with meeting-slot proposals for the winner (see UC-003).

### Failure Postconditions

- _None — once the Spin button can be clicked, the use case always ends with a winner determined and recorded; see Preconditions for when it cannot start at all._

## Business Rules

### BR-001: Preference For Never-Met Invitees

Invitees who have never appeared in the active dataset's meeting history are preferred; they form the eligible pool whenever at least one of them exists.

### BR-002: Fallback Excluding Only The Most Recent

If every invitee has been met, the eligible pool becomes every invitee except the single most recently met one.

### BR-003: Last-Resort Fallback

If no invitee remains eligible even after BR-002, every invitee in the dataset becomes eligible again and the winner is chosen among all of them.

### BR-004: Deterministic Landing

The spin animation always comes to rest on the segment of the winner already determined in step 4; the animation itself never changes the outcome.

### BR-005: Segment Label Truncation

A wheel segment's name label is truncated and ends with "…" once it no longer fits the segment; the invitee list always shows the full name regardless of length.

### BR-006: Excluded Invitees Cannot Win

Invitees excluded by UC-001 BR-001 are never part of the active dataset's pool, so they can never be selected as a winner.

### BR-007: Winner Comes From The Active Dataset Only

A spin on the Partners dataset always yields a Partner, and a spin on the Lead Developers dataset always yields a Lead Developer (see UC-001 BR-005).
