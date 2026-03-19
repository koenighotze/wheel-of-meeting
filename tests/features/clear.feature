Feature: Clearing dataset history
  As a user
  I want to clear the meeting history for the active dataset
  So that I can start fresh without affecting other datasets

  Scenario: Clearing history empties the Recently Met list
    Given I have spun the wheel 3 times on the Partners tab
    When I click "Clear All Data"
    And I confirm the action
    Then the "Recently Met" list is empty

  Scenario: Clearing history removes met badges from the wheel
    Given I have spun the wheel 3 times on the Partners tab
    When I click "Clear All Data"
    And I confirm the action
    Then no segments on the wheel are grayed out

  Scenario: Clearing history does not affect the other dataset
    Given I have spun the wheel 3 times on the Partners tab
    And I have spun the wheel 3 times on the Lead Developers tab
    When I click "Clear All Data" on the Partners tab
    And I confirm the action
    Then the Lead Developers "Recently Met" list still has 3 entries

  Scenario: Dismissing the confirmation leaves history unchanged
    Given I have spun the wheel 3 times on the Partners tab
    When I click "Clear All Data"
    And I dismiss the confirmation
    Then the "Recently Met" list still has 3 entries

  Scenario: Clear confirmation message names the active dataset
    Given I am on the "Lead Developers" tab
    When I click "Clear All Data"
    Then the confirmation message references "Lead Developers"
