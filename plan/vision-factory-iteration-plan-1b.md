# Factory iteration 1b: Audit in CI and distinct offline result

Vision: R2 (follow-up to iteration 1)

## Goal

The audit result is visible on every PR, and "audit could not run" never looks like a pass or like vulnerabilities.

## Behaviour

- A CI step runs the audit on every PR. It is informational and never blocks.
- The audit fails only on high and critical findings (`--audit-level=high`).
- When the network is unreachable, the audit prints `audit unavailable: network` and exits with a different code than "vulnerabilities found".

## Skippable?

Yes. Iteration 1 stands alone. Needs iteration 1 first.

## Definition of done

- [ ] A PR shows the audit result as a non-blocking check.
- [ ] A high or critical finding makes `npm run audit` exit non-zero with the findings code.
- [ ] A moderate-only finding exits 0.
- [ ] With the network blocked, `npm run audit` prints `audit unavailable: network` and exits with a code different from the findings code.
- [ ] `npm run check && npm test` still passes.

## Decisions carried over from iteration 1 Q&A

Trigger: on demand plus every PR. Informational only. High and critical fail. Offline is a distinct failure. Decided 2026-10-08.

## Open

- Exact exit codes and wrapper location (script under `scripts/`?). Decide when this iteration is picked up.
- Workflow file lives in `.github/`, which iteration 11 treats as protected. Human edit expected.
