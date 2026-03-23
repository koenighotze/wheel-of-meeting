Feature: Partners identified by email address
  As a user
  I want partners to be stored as email addresses
  So that I know exactly who will receive the calendar invite

  Scenario: Partner email is shown in the partner list
    Given the Partners dataset contains "alice@example.com"
    When the application loads
    Then the partner list shows "alice@example.com"

  Scenario: Winner dialog shows partner email address
    Given the Partners dataset contains only "alice@example.com"
    When I spin the wheel
    Then the winner dialog shows "alice@example.com"

  Scenario: Production data files use email addresses
    Given the application loads with real data files
    Then every entry in the partner list contains an "@" character
