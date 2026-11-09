# Use Case: Clear Meeting History

## Overview

**Use Case ID:** UC-005
**Use Case Name:** Clear Meeting History
**Primary Actor:** User
**Goal:** Reset the active dataset's meeting history so every invitee becomes eligible again.
**Trigger:** User clicks "Clear All Data".
**Status:** Draft

**Requirements:** [FR-005](../requirements.md)

## Preconditions

- The application is loaded and a dataset is active (see UC-001).

## Main Success Scenario

1. User clicks "Clear All Data".
2. System asks the user to confirm, naming the active dataset by its display label.
3. User confirms the action.
4. System empties the active dataset's meeting history.
5. System resets the wheel's rotation and redraws it with no segments marked as met.
6. System updates the invitee list and "Recently Met" list to show no met badges and no history entries (see UC-004).
7. System resumes the wheel's idle rotation.

## Alternative Flows

### A1: User Dismisses The Confirmation

**Trigger:** User dismisses the confirmation prompt instead of confirming (step 3)
**Flow:**

1. System leaves the active dataset's meeting history unchanged.
2. Use case ends.

## Postconditions

### Success Postconditions

- The active dataset's meeting history is empty; no invitee in it is marked as met.
- The other dataset's meeting history is unaffected.

### Failure Postconditions

- The active dataset's meeting history is unchanged when the user dismisses the confirmation.

## Business Rules

### BR-001: Scoped To Active Dataset

Clearing history affects only the active dataset; the other dataset's history is never touched.

### BR-002: Confirmation Names The Dataset

The confirmation message names the active dataset by its display label (for example, "Lead Developers").

### BR-003: Irreversible

Clearing is irreversible once confirmed; there is no undo.
