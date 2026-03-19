Feature: Meeting history tracking
  As a user
  I want to see who I have met recently
  So that the wheel can avoid repeating the same people

  Scenario: Winner appears at the top of the history list after a spin
    Given the Partners dataset contains "Alice" and "Bob"
    And "Bob" was met before "Alice"
    And "Alice" has just been met
    Then "Alice" is the first entry in the "Recently Met" list

  Scenario: History is ordered most recent first
    Given "Alice" was met before "Bob"
    Then "Bob" is the first entry in the "Recently Met" list
    And "Alice" is the second entry

  Scenario: History is capped at 10 entries
    Given I have spun the wheel 11 times
    Then the "Recently Met" list contains exactly 10 entries

  Scenario: Recent entry shows "just now" timestamp
    Given "Alice" was met less than 60 seconds ago
    Then the history entry for "Alice" shows "just now"

  Scenario: Older entry shows hours ago timestamp
    Given "Alice" was met 90 minutes ago
    Then the history entry for "Alice" shows "1h ago"

  Scenario: History is independent per dataset
    Given "Alice" has been met on the Partners tab
    When I switch to the "Lead Developers" tab
    Then the "Recently Met" list is empty
