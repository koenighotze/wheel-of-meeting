Feature: Skip partners from excluded domains

  Partners and lead developers from Finanteq (finanteq.com) are excluded from
  the wheel entirely — they do not appear in the list, cannot be selected, and
  are not counted toward the spin-button enable logic.

  Scenario: Finanteq partner is not shown in the partner list
    Given partners include "alice@finanteq.com" and "bob@example.com"
    When the app loads
    Then "alice@finanteq.com" does not appear in the partner list
    And "bob@example.com" appears in the partner list

  Scenario: Finanteq lead developer is not shown in the lead list
    Given lead developers include "grace@finanteq.com" and "henry@example.com"
    When the app loads on the lead developers tab
    Then "grace@finanteq.com" does not appear in the partner list
    And "henry@example.com" appears in the partner list

  Scenario: Finanteq partner is never selected as winner
    Given partners include "alice@finanteq.com" and "bob@example.com"
    When the wheel spins
    Then the winner is always "bob@example.com"

  Scenario: Spin button is disabled when only Finanteq partners are present
    Given partners include only "alice@finanteq.com"
    When the app loads
    Then the spin button is disabled
