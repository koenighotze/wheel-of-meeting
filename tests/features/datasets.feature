Feature: Dataset switching
  As a user
  I want to switch between the Partners and Lead Developers datasets
  So that I can run independent wheels for each group

  Scenario: Switching tabs updates the section heading
    Given the application is open on the Partners tab
    When I click the "Lead Developers" tab
    Then the section heading reads "Lead Developers"

  Scenario: Switching tabs updates the wheel content
    Given the application is open on the Partners tab
    When I click the "Lead Developers" tab
    Then the wheel displays the lead developer names
