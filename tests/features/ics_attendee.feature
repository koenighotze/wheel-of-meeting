Feature: Winner added as attendee to the calendar invite
  As a user
  I want the selected partner's email address included in the ICS file
  So that the calendar invite is addressed directly to them

  Background:
    Given the wheel has been spun and the winner dialog is open with winner "alice@example.com"

  Scenario: Downloaded ICS includes the winner as an ATTENDEE
    When I click a proposed meeting slot
    Then the ICS file contains "ATTENDEE" with "mailto:alice@example.com"

  Scenario: Downloaded ICS uses REQUEST method when an attendee is present
    When I click a proposed meeting slot
    Then the ICS file contains "METHOD:REQUEST"
