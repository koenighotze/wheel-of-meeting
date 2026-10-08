# Factory iteration 10: Event log for later analysis

Vision: R19, R22

## Goal

Every notable loop event is recorded passively, so a dashboard can import it later.

## Behaviour

- One JSON object per line in `factory/log/<branch>.log`, committed with the branch.
- Events recorded: tier 1, tier 2 and tier 3 runs, session start and end, role.
- Each event has: timestamp, session, branch, feature, role, event type, tier, duration, result.
- The agent never writes numbers itself. Existing lines cannot be changed, only appended.
- Logging adds no noticeable time to tier 1.

## Skippable?

Yes. Logs whichever of iterations 2-4 and 9 exist.

## Definition of done

- [ ] After a session with an edit, a commit and a finish, the log has one valid JSON object per line with every listed field.
- [ ] A commit that modifies or deletes an existing log line is refused.
- [ ] Tier 1 is no more than 0.2 s slower with logging on.
- [ ] No log field is filled by the agent (events come from hooks and tools only).

## Q&A

### Questions

1. Who will use this log and which question does it answer? Without a named consumer (a dashboard does not exist yet), what we collect is guesswork.
   **Answer:** _open_
2. Is committing the log with the branch right? It adds a file to every branch, adds noise to every PR and may conflict on merge. Should it be kept outside the code history?
   **Answer:** _open_
3. What is "feature" for a branch that is not a feature (fix, docs, chore)?
   **Answer:** _open_
4. How long are logs kept, and are they ever cleaned up?
   **Answer:** _open_
5. Is "cannot be changed" a hard guarantee or tamper-evidence? A human can always edit the file. What are we protecting against: the agent, or accidents?
   **Answer:** _open_
6. Can the log contain anything sensitive (file names, command text, error output)? Which fields are strictly necessary?
   **Answer:** _open_
7. Tiers 1-3 and the role do not all exist yet. What does the log show for steps that are not in place?
   **Answer:** _open_

### Simplest approach and alternatives

- **Simplest:** defer. Nothing reads the log yet, and it is safe to build once the first real question ("how often did tier 3 fail?") exists.
- **Alternative A: keep a local, uncommitted log** with the same fields. No history noise, nothing to protect, and still available for a later dashboard.
- **Alternative B: store only a summary in the PR** (iteration 13): time per tier, number of failures. Covers most of the value for the dashboard idea.
- **Recommendation:** postpone, or do the local-only variant. Revisit when a consumer is defined.
