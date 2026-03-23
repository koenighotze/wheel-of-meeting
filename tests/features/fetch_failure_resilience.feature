Feature: History is preserved when JSON fetch fails on restart

  Scenario: Meeting history survives a restart when the partners file is unreachable
    Given Alice has been met and is recorded in history
    When the app restarts with the partners data file unreachable
    Then Alice still appears in the meeting history

  Scenario: Meeting history survives a restart when the leads file is unreachable
    Given a lead developer has been met and is recorded in history
    When the app restarts with the lead-developers data file unreachable
    Then the lead developer still appears in the meeting history
