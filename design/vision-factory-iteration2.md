# Vision design: Software Factory, iteration 2 (extensions)

This file collects what was deliberately left out of step one, see [vision-factory.md](vision-factory.md). Step one covers only the inner loop for one developer in one sandbox. Each item below says why it was deferred.

## Team and multi-developer use

- **Goal:** several developers each drive agents with the same factory setup, with shared conventions and shared metrics.
- **Why deferred:** step one proves the loop for one developer first. Team use needs shared state, access control and a shared dashboard, none of which the single-developer setup needs.

## Outer loop: CI, GitHub workflows and auto-merge

- **Goal:** GitHub workflows repeat the fast checks, run the expensive ones (such as mutation testing and broader review), and run `npm audit`. Auto-merge acts on the `low-risk-auto-approval-ready` label. `Human-approval-required` changes wait for a human.
- **Why deferred:** step one only records the label. Nothing acts on it until the verdict has proven itself, for example through a low human override rate on the dashboard.

## GitHub Actions as a metrics source

- **Goal:** add CI-based metrics, such as CI duration and agreement between local and CI results, to the dashboard.
- **Why deferred:** step one has no CI scope and must work offline. All initial metrics are measured locally (decision Q16a).

## Harness self-improvement by agents

- **Goal:** agents review how the loop performed and propose improvements to the harness, such as a new lint rule, a hook change or a skill update. This is the steering loop and the "agentic flywheel" from the references.
- **Constraint to keep:** harness changes proposed by agents should always be `Human-approval-required`, so an agent cannot loosen its own constraints.
- **Why deferred:** not a goal for this iteration (decision Q13). The harness first needs to exist and be measured.

## Orchestration and dispatching

- **Goal:** tasks are dispatched to agents automatically, for example from an issue tracker, instead of being started by the developer.
- **Why deferred:** step one is driven by the developer, one task at a time.

## Parallel agents and sandboxes

- **Goal:** one developer runs several agents at once, each in its own worktree and sandbox. The dashboard aggregates across them.
- **Why deferred:** step one starts with one developer and one sandbox (decision Q1).

## Extended dashboard

- **Goal:** extend the initial dashboard (see [Dashboard and metrics agent](#dashboard-and-metrics-agent)) with more metrics, longer history, and richer views, including the metrics that need CI data.
- **Why deferred:** the initial dashboard with its small set of metrics (R18) is itself part of this iteration. Step one ships no dashboard and only collects raw JSONL events (R19).

## Orchestration of the roles

- **Goal:** the four roles (spec author, test author, implementer, reviewer) are started and handed off automatically, instead of by the developer. The rule that the test author is never the implementer stays.
- **Why deferred:** step one enforces the handoffs but the developer starts each role by hand (decision Q20).

## Dashboard and metrics agent

- **Goal:** import the JSONL events from `factory/log/` into a dashboard (for example Grafana). It shows time to feedback per tier, first-pass success rate, iterations until green, label distribution with the human override rate, and cycle time per feature. A separate metrics agent classifies the messy parts. Scripts compute exact numbers, every number is traceable to raw events, and the agent never edits the raw log. The dashboard runs as containers on the host, works offline and starts with one command.
- **Why deferred:** step one only collects the events in an importable format (decision Q19).

## Stronger reviewer isolation

- **Goal:** run the reviewer in its own process or sandbox, with its prompt and the floor rules out of the writing agent's reach.
- **Why deferred:** step one uses a subagent in the same session (decision Q5).

## Open points carried over

- The 200-line diff limit (N) is adjusted after the first ten changes.
- Time and token budgets beyond the step-one limits are set once the log has enough data.
- The choice of dashboard components is made when this iteration starts (R24).
