Feature: Display names derived from email addresses

  The UI shows a human-readable name extracted from the email address
  (e.g. "markus.dobel@senacor.com" → "Markus Dobel").
  The raw email is only used inside the generated calendar invite.

  Scenario: Partner list shows display name, not the email address
    Given a partner "markus.dobel@senacor.com"
    When the app loads
    Then the partner list shows "Markus Dobel"
    And the partner list does not show "markus.dobel@senacor.com"

  Scenario: Winner dialog shows display name, not the email address
    Given a partner "markus.dobel@senacor.com"
    When the wheel spins and the winner dialog opens
    Then the dialog shows "Markus Dobel"
    And the dialog does not show "markus.dobel@senacor.com"

  Scenario: Single-word email local part is capitalised
    Given a partner "alice@example.com"
    When the app loads
    Then the partner list shows "Alice"

  Scenario: ICS attendee line still uses the full email address
    Given a partner "markus.dobel@senacor.com"
    When a meeting slot is downloaded
    Then the ICS file contains "mailto:markus.dobel@senacor.com"
    And the ICS summary contains "Markus Dobel"
