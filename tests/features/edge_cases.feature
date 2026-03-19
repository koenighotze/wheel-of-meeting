Feature: Edge cases and resilience
  As a user
  I want the application to behave correctly in unusual situations
  So that it never breaks or shows inconsistent state

  Scenario: Pressing Escape closes the winner dialog
    Given the winner dialog is open
    When I press the Escape key
    Then the dialog closes

  Scenario: Idle spin resumes after the dialog is closed with Escape
    Given the winner dialog is open
    When I press the Escape key
    Then the wheel resumes its idle spin

  Scenario: Long name is truncated on the wheel segment
    Given partners.json contains a name longer than 20 characters
    When the wheel renders
    Then the name on the wheel segment ends with "…"

  Scenario: Full name is shown in the partner list regardless of length
    Given partners.json contains a name longer than 20 characters
    When the wheel renders
    Then the full name is shown in the partner list

  Scenario: Rapid tab switching keeps the wheel responsive
    Given the application is loaded with names in both datasets
    When I click between the two tabs 10 times in quick succession
    Then the wheel renders the names of the currently active dataset

  Scenario: Unreachable JSON file results in a disabled Spin button
    Given a dataset JSON file cannot be fetched
    When the application loads
    Then the Spin button is disabled

  Scenario: Unreachable JSON file shows a placeholder on the wheel
    Given a dataset JSON file cannot be fetched
    When the application loads
    Then the wheel displays a placeholder message
