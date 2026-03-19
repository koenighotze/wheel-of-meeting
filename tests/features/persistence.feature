Feature: State persistence across page reloads
  As a user
  I want my meeting history and active tab to survive a page refresh
  So that I do not lose context between sessions

  Scenario: Meeting history is restored after refresh
    Given "Alice" has been met on the Partners tab
    When I refresh the page
    Then "Alice" still appears in the "Recently Met" list

  Scenario: Met segment graying is restored after refresh
    Given "Alice" has been met on the Partners tab
    When I refresh the page
    Then the "Alice" segment is still grayed out on the wheel

  Scenario: Active dataset tab is restored after refresh
    Given I am on the "Lead Developers" tab
    When I refresh the page
    Then the "Lead Developers" tab is active

  Scenario: Stale history entry is removed when a name is deleted from JSON
    Given "Alice" is in the meeting history for Partners
    And "Alice" has been removed from partners.json
    When the application loads
    Then "Alice" does not appear in the "Recently Met" list
