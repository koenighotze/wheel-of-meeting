---
name: iteration-plan
description: Create a structured iteration plan for wheel-of-meeting. Reads the latest iteration file, asks clarifying questions, then produces deployable step plans with Gherkin outlines and acceptance criteria.
---

1. Read the latest file in `iterations/` to understand the vision and any existing Q&A.
2. Identify open questions that block planning (deployment target, auth method, data model, scope cuts). Ask them **one at a time** and document each answer in the "Q and A" section of the iteration file before asking the next.
3. Once all blockers are answered, break the vision into 2–4 independent steps. Each step must:
   - Be deployable on its own (no step depends on a later one to work)
   - Add exactly one user-visible capability
   - Be expressible as a Gherkin scenario
4. For each step, create `iterations/Iteration-{N}-plan-{step}.md` with this structure:

```
# Iteration N — Step {step}: <title>

## Goal
One sentence.

## Acceptance Criteria
- [ ] ...

## Gherkin Outline
Feature: <name>
  Scenario: <happy path>
    Given ...
    When ...
    Then ...

## Out of Scope
What is explicitly NOT included in this step.

## Definition of Done
- npm run check passes
- npm test passes (all new scenarios implemented)
- Deployed and manually verified on Cloud Run
```

5. Think MVP at every step: ask "what is the simplest thing that works?" before adding anything.
6. Present a one-line summary of each step to the user and ask for approval before writing the plan files.
