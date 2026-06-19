Feature: Personalised German description in the calendar invite
  As David
  I want the ICS invite to carry a warm German description addressed by first name
  So that the recipient feels personally invited

  Background:
    Given the wheel has been spun and the winner dialog is open with winner "markus.dobel@senacor.com"

  Scenario: Description opens with the partner's first name
    When I click a proposed meeting slot
    Then the ICS DESCRIPTION starts with "Hallo Markus"

  Scenario: Description mentions Wheel-of-Meeting
    When I click a proposed meeting slot
    Then the ICS DESCRIPTION contains "Wheel-of-Meeting"

  Scenario: Description is signed by David Schmitz
    When I click a proposed meeting slot
    Then the ICS DESCRIPTION ends with "David Schmitz"
