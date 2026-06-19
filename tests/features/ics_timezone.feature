Feature: Europe/Berlin timezone in the calendar invite
  As a user in Germany
  I want the ICS invite to carry an explicit Europe/Berlin timezone
  So that calendar clients display the correct local time

  Background:
    Given the wheel has been spun and the winner dialog is open with winner "Alice"

  Scenario: DTSTART carries the Europe/Berlin timezone
    When I click a proposed meeting slot
    Then the ICS DTSTART contains "TZID=Europe/Berlin"

  Scenario: DTEND carries the Europe/Berlin timezone
    When I click a proposed meeting slot
    Then the ICS DTEND contains "TZID=Europe/Berlin"

  Scenario: The ICS file includes a VTIMEZONE block for Europe/Berlin
    When I click a proposed meeting slot
    Then the ICS file contains "BEGIN:VTIMEZONE"
    And the ICS file contains "TZID:Europe/Berlin"
