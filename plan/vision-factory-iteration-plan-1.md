# Factory iteration 1: Split audit from the quick check

Vision: R2

## Goal

`npm run check` is fast and works offline. The network-bound audit becomes its own command.

## Behaviour

- `npm run check` runs lint and format check only.
- `npm run audit` runs the dependency audit on its own, plain `npm audit` behaviour.
- CI step, severity threshold and distinct offline result move to iteration 1b (decided 2026-10-08).
- The `brace-expansion` advisory is already fixed (commit 71e9ef6). Nothing to do for it here.

## Skippable?

Yes. Nothing hard-depends on it, but iterations 2-4 assume `check` is offline.

## Definition of done

- [ ] With the network blocked, `npm run check` exits 0 on a clean checkout.
- [ ] `npm run check` output contains no audit output.
- [ ] `npm run audit` exists and runs the audit (exit code follows the audit result).
- [ ] `npm run check && npm test` still passes.
- [ ] README or TECH_STACK mentions the split.

## Q&A

### Questions

1. Who runs the audit, and when? If nobody is prompted to, vulnerabilities go unnoticed. What triggers it: a habit, a schedule, before a PR, before a release?
   **Answer:** Manual (`npm run audit`) plus a CI step on every PR so the result is always visible. Decided 2026-10-08.
2. Does a failing audit block anything (a PR, a deployment), or is it informational only?
   **Answer:** Informational only. Nothing blocks a PR or deployment. Revisit if it proves useful. Decided 2026-10-08.
3. Which severity fails the audit: any finding, or only high/critical?
   **Answer:** High and critical fail (`--audit-level=high`). Lower severities do not. Decided 2026-10-08.
4. When the audit cannot run because the network is blocked, should that look different from "vulnerabilities found"? Otherwise a blocked network could be read as a security problem, or as a pass.
   **Answer:** Distinct failure: own message (audit unavailable: network) and a different exit code from "vulnerabilities found". Never reads as a pass. Decided 2026-10-08.
5. Do we still want the audit result visible somewhere regularly (for example on every PR), or is on-demand enough for a single-developer project?
   **Answer:** Covered by Q1: on-demand plus every PR. Decided 2026-10-08.

### Simplest approach and alternatives

- **Plan as written** is already about the simplest option: one fast command, one slow command, a one-line doc change.
- **Alternative A: drop the local audit entirely** and rely on an automated dependency scanner on the repository host. Less to maintain, but the result is no longer available on demand.
- **Alternative B: keep audit inside `check`** and just skip it when offline. Hidden behaviour, and a silent skip looks like a pass. Not recommended.
- **Recommendation:** keep as written. Answer Q1/Q2 so the audit does not become a command nobody runs.
