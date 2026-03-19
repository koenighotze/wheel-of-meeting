Feature: Wheel spinning and winner selection
  As a user
  I want the wheel to fairly select a meeting partner
  While avoiding people I have met recently

  Scenario: Spin with a single name always selects that person
    Given the Partners dataset contains only "Alice"
    When I spin the wheel
    Then the winner dialog shows "Alice"

  Scenario: Recently met partner segment is grayed out on the wheel
    Given "Alice" is the most recently met partner
    Then the "Alice" segment on the wheel is grayed out

  Scenario: Recently met partner segment shows a met label
    Given "Alice" is the most recently met partner
    Then the "Alice" segment label shows "(met)"

  Scenario: Recently met partner shows a met badge in the list
    Given "Alice" is the most recently met partner
    Then the partner list shows a "met" badge next to "Alice"

  Scenario: Recently met partner is excluded from selection
    Given the Partners dataset contains "Alice" and "Bob"
    And "Alice" is the most recently met partner
    When I spin the wheel
    Then "Bob" is selected

  Scenario: Fallback when all partners have been met recently
    Given the Partners dataset contains "Alice" and "Bob"
    And "Bob" was met most recently
    And "Alice" was met before "Bob"
    When I spin the wheel
    Then "Alice" is selected

  Scenario: Fallback when only one partner exists and they are in history
    Given the Partners dataset contains only "Alice"
    And "Alice" is the most recently met partner
    When I spin the wheel
    Then the winner dialog shows "Alice"

  Scenario: Spin button is disabled when the dataset is empty
    Given the Partners dataset JSON file is an empty array
    When the application loads
    Then the Spin button is disabled

  Scenario: Empty dataset shows a placeholder on the wheel
    Given the Partners dataset JSON file is an empty array
    When the application loads
    Then the wheel displays a placeholder message

  Scenario: Spin button is disabled while the wheel is animating
    Given the wheel is spinning
    Then the Spin button is disabled

  Scenario: Spin button is re-enabled after the wheel stops
    Given the wheel has finished spinning
    Then the Spin button is enabled
