# Wheel of Meeting — Claude Code Guidelines

## Development Workflow: TDD / BDD

All new features must follow this order — no exceptions:

1. **Write a Gherkin feature file** in `tests/features/` describing the new behaviour
2. **Write the failing Playwright test(s)** in `tests/e2e/` that implement the scenarios
3. **Verify the tests fail** (`npm test`) before touching any production code
4. **Implement the feature** in production code until all new tests pass
5. **Confirm all tests still pass** (`npm test`)

Never implement a feature before its test exists and has been seen to fail.
