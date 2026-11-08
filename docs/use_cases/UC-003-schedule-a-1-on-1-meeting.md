# Use Case: Schedule a 1:1 Meeting

## Overview

**Use Case ID:** UC-003
**Use Case Name:** Schedule a 1:1 Meeting
**Primary Actor:** User
**Goal:** Book a concrete calendar slot for the 1:1 with the winner, or decline to schedule now while keeping the meeting on record.
**Trigger:** System opens the winner dialog immediately after a spin determines a winner (see UC-002).
**Status:** Draft

**Requirements:** [FR-003, FR-007](../requirements.md)

## Preconditions

- UC-002 has just completed and a winner has been determined.

## Main Success Scenario

1. System displays the winner's display name in the winner dialog.
2. System proposes three meeting slots.
3. User selects one of the proposed slots.
4. System generates an invite for the selected slot, addressed to the winner, organized by the user, with a personalized description and an explicit timezone.
5. System starts a download of the generated invite file.
6. System closes the winner dialog.
7. System resumes the wheel's idle rotation.

## Alternative Flows

### A1: User Skips Scheduling

**Trigger:** User clicks "Skip" instead of a slot (step 3)
**Flow:**

1. System closes the winner dialog without generating an invite.
2. System resumes the wheel's idle rotation.
3. Use case ends.

### A2: User Dismisses The Dialog

**Trigger:** User presses Escape, or otherwise cancels the dialog, instead of picking a slot (step 3)
**Flow:**

1. System closes the winner dialog without generating an invite.
2. System resumes the wheel's idle rotation.
3. Use case ends.

## Postconditions

### Success Postconditions

- An invite file is downloaded, named "1on1-\<Winner Display Name>.ics", with the winner as an attendee, the user identified as organizer and attendee, an explicit Europe/Berlin timezone, and a personalized German-language description signed by the user.
- The winner dialog is closed and the wheel resumes idle rotation.

### Failure Postconditions

- No invite file is downloaded when the user skips or dismisses the dialog.
- The meeting record created in UC-002 is never altered or removed by skipping or dismissing this use case.

## Business Rules

### BR-001: Three Proposed Slots

Exactly three meeting slots are proposed per spin.

### BR-002: Slot Window

Each slot falls on a weekday (Monday–Friday) within the next 14 calendar days, and no two proposed slots fall on the same calendar date.

### BR-003: Slot Time And Duration

Each slot starts no earlier than 11:00 and ends no later than 14:00, Europe/Berlin local time, and lasts 30 minutes.

### BR-004: Invite Addressing

The invite's attendee entry for the winner uses the winner's full email address, even though the UI only ever shows their derived display name (see UC-001 BR-002).

### BR-005: Personalized Description

The invite's description is written in German, opens by addressing the winner by their first name, mentions the Wheel-of-Meeting tool by name, and is signed by the user's name.

### BR-006: Explicit Timezone

The invite's start and end times carry an explicit Europe/Berlin time zone identifier, and the invite includes the Europe/Berlin time zone definition.

### BR-007: Invite File Naming

The downloaded invite file is named "1on1-\<Winner Display Name>.ics", with spaces in the display name replaced by hyphens.
