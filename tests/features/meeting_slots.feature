Feature: Meeting slot proposals and ICS download
  As a user
  I want to be offered three meeting time proposals after selecting a partner
  So that I can schedule the meeting directly from the app

  Background:
    Given the wheel has been spun and the winner dialog is open with winner "Alice"

  Scenario: Three meeting slots are proposed
    Then exactly 3 meeting slot options are displayed

  Scenario: Each proposed slot starts no earlier than 11:00
    Then each proposed slot has a start time no earlier than 11:00

  Scenario: Each proposed slot ends no later than 14:00
    Then each proposed slot has an end time no later than 14:00

  Scenario: All proposed slots fall on weekdays
    Then none of the proposed slots fall on a Saturday or Sunday

  Scenario: All proposed slots fall within the next 14 days
    Then each proposed slot date is within the next 14 calendar days

  Scenario: All proposed slots are on different days
    Then no two proposed slots share the same calendar date

  Scenario: Selecting a slot downloads an ICS file
    When I click a proposed meeting slot
    Then an ICS file named "1on1-Alice.ics" is downloaded

  Scenario: Selecting a slot closes the dialog
    When I click a proposed meeting slot
    Then the dialog closes

  Scenario: Downloaded ICS contains the correct summary
    When I click a proposed meeting slot
    Then the ICS file contains "SUMMARY:1:1 with Alice"

  Scenario: Downloaded ICS contains the correct start time
    When I click the first proposed slot
    Then the ICS file DTSTART matches the displayed start time of that slot

  Scenario: Downloaded ICS contains the correct end time
    When I click the first proposed slot
    Then the ICS file DTEND is 30 minutes after the displayed start time of that slot

  Scenario: Skipping closes the dialog
    When I click "Skip"
    Then the dialog closes

  Scenario: Skipping does not download a file
    When I click "Skip"
    Then no ICS file is downloaded

  Scenario: Skipping still records the meeting in history
    When I click "Skip"
    Then "Alice" appears in the "Recently Met" list
