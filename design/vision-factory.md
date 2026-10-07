# Vision design: Software Factory

## Vision statement

I want to start working on a software factory within this repository. This is step one, focusing only on the internal dev flow (the inner loop). Nothing else.

The main goal is a super efficient inner loop, as defined in the papers listed under [References](#references). We must be able to set up the tools, linters, hooks, permissions and everything else that lets a developer drive Claude Code agents in a Docker sandbox (sbx) as efficiently as possible.

In this factory the agents write and review most of the code. The developer works _on_ the loop, not _in_ it: they state intent (the Gherkin feature file), build and maintain the harness, and review only what the factory flags as needing a human. At the end of every change an independent agent judges its risk and complexity and labels it, so human attention goes only where it is needed.

We are not concerned with workflows in the CI environment (GitHub workflows). That is the next step, see [vision-factory-iteration2.md](vision-factory-iteration2.md). This step is only for the inner loop.

### In scope for step one

- A dev environment for **one developer** in **one sbx sandbox**: sandbox image, tools, linters, hooks, permissions, skills.
- Fast, layered feedback for the agent and the developer.
- An independent agent review and a risk/complexity verdict (a label only, nothing acts on it yet).
- Passive collection of raw loop events in a log that a dashboard can import later (no dashboard yet).
- Separate roles (spec author, test author, implementer, reviewer), with handoffs enforced by the environment.
- Built for this repository first, with the pattern documented so it can be extracted later.

### Out of scope for step one

CI and GitHub workflows, auto-merge, teams, orchestration and dispatching (including starting the roles automatically), parallel agents and sandboxes, agents improving their own harness, the dashboard and the metrics agent. See [vision-factory-iteration2.md](vision-factory-iteration2.md).

## Goals

Priority order. All four are required.

1. **Fast feedback** — the agent and the developer learn within seconds whether a change is good.
2. **Trustworthy output** — results are correct and consistent because guardrails and independent checks catch mistakes.
3. **Zero friction** — a new sandbox is ready to work in with one command and no manual steps.
4. **Low attention cost** — the developer spends time on intent and on flagged reviews, not on babysitting agents.

## Requirements

### Feedback speed

- **R1** Feedback comes in three tiers with these time limits:
  - Tier 1, after every edit (format and lint): under 5 seconds.
  - Tier 2, before every commit (lint, format and the tests tagged `@smoke`): under 30 seconds.
  - Tier 3, the full Playwright suite, before the agent declares "done": under 3 minutes.
- **R2** `npm audit` is not part of the inner loop because it is network-bound. It moves to the outer loop (iteration 2). `npm run check` is split so that audit is a separate script. The current `brace-expansion` advisory is fixed first, as its own change.

### Zero friction

- **R3** One command on the host creates a sandbox that is ready to work in within 5 minutes, with Node, Playwright browsers, hooks, permissions and skills in place. The repo owns an in-sandbox script (`factory/setup.sh`: `npm ci`, `npx playwright install chromium`) as the source of truth. If setup takes more than 5 minutes, a template saved with `sbx template save` is used, and it is rebuilt when `package-lock.json` changes.
- **R4** Everything needed is versioned in the repository. The only manual input is the secrets sbx already handles, and the one-time network policy approvals.

### Trustworthy output

- **R5** The human review of the Gherkin file stays for every feature, as a gate between the spec author and the test author. The human signals approval by adding the `@approved` tag to the feature file. No agent can add or change it.
- **R6** The existing development workflow (Gherkin, failing test, implementation, green suite) is enforced by the environment, not only described in prose. It is checked at commit time, not on every edit. A refactor exemption is set explicitly by the human.
- **R7** Review is done by an **independent** reviewer agent. It starts in a fresh context and sees only the spec (the Gherkin file) and the diff, never the writing agent's session. For step one it is a subagent of the session, which shares the session's permissions. This is a known weakness, to be improved later.
- **R26** Four roles, each with fresh context and a handoff: spec author (human or agent), test author (turns the Gherkin into Playwright tests and shows they fail), implementer (makes the tests pass in production code), reviewer. The test author may be the spec author but **must be a different agent from the implementer**. The implementer may not edit `tests/` or `.feature` files (hard requirement, enforced by a hook). If it thinks a test is wrong it stops, writes up why, and the change is `Human-approval-required`. The developer starts each role by hand in step one.

### Risk and complexity verdict

- **R8** At the end of every change, an agent judges risk and complexity and records a verdict.
- **R9** Deterministic floor rules, run by a script, always force `Human-approval-required`. The human owns these rules. They cover:
  - Paths: `infra/`, `.github/`, `Dockerfile`, `nginx.conf`, `package.json`, `package-lock.json`, `.claude/`, `skills-lock.json`, and the factory rule and prompt files.
  - Diff size: more than 200 changed lines in `src/` plus `tests/` (excluding `factory/log/`, lockfiles and `.feature` files). Adjust after the first ten changes.
  - Security keywords: `innerHTML`, `eval`, `document.write`.
  - Tests: a feature's own tests (`tests/e2e/<name>.spec.js` for `tests/features/<name>.feature`) are expected. Changes to any other spec, or to `tests/support/`, trigger review.
- **R10** The agent's judgement can only escalate a change, never downgrade it below the floor rules.
- **R11** There are two labels: `low-risk-auto-approval-ready` and `Human-approval-required`.
- **R12** If the reviewer is unsure, fails, or cannot produce a verdict, the label is `Human-approval-required`. The system fails safe.
- **R13** The reviewer writes its verdict to a file. A script combines it with the floor rules, opens the PR, writes the verdict (label, reasons, rules triggered) into the description and applies the label with `gh`. The agent never sets the label itself. Opening the PR is the end of the inner loop. For now, nothing acts on the label.

### Stuck agents

- **R14** Limits apply per role session. Time: a warning after 10 minutes and a block after 30 minutes of active agent time (human waiting time excluded), with a hard kill 5 minutes after the block. Repeated failure: the implementer is stopped after 3 consecutive failing runs of the same failing test (same test title). The counter resets when the test passes or when the developer sends a message. The test author is exempt, because its tests must fail. Tokens and iterations are logged only, not enforced.
- **R15** When a limit is hit, a hook blocks further edits and the agent writes a short "what I tried and where I'm blocked" summary. The change is marked `Human-approval-required`.

### Metrics collection

- **R19** Collection is passive. Hooks write raw, structured events as one JSON object per line (JSONL) to an append-only log, `factory/log/<branch>.log`, which is committed. Each event has a timestamp, session, branch, feature, role, event type, tier, duration and result. The coding agent never reports its own numbers, collection adds no noticeable time to tier 1, and a hook rejects changes to existing lines. The log is excluded from the floor rules and from the reviewer's diff.
- **R22** For step one, metrics come only from local sources: Claude Code hooks, git, and the lint and Playwright output. GitHub Actions data comes in iteration 2.
- **R16-R18, R20, R21** (dashboard, containers, metrics agent, traceability) move to iteration 2. The intended metrics are kept in iteration 2.

### Constraints

- **R23** New tooling (dashboard containers, storage) is approved for factory tooling only. It lives in its own directory (for example `factory/`) and never touches `src/` or the app's dependencies. The app stays zero-build and zero-dependency.
- **R24** Prefer off-the-shelf components over custom code. The specific choices are made in the design phase.
- **R25** The pattern is built for this repository first. Requirements stay generic and are documented so they can be extracted later, but nothing is built for reuse now.

## Brainstorming

Interview held on 2026-10-06, at the level of requirements and goals. Format per item: question, discussion, answer, decision. The `R` numbers point to the requirements above. Before the interview, the sources in `references/` were read and the missing web references were fetched.

### Round 1: actors, goals, scope

**Q1. Who drives the factory, and how many agents at once?**

- Discussion: the options were one developer with one agent, one developer with several agents in parallel, or a team. The recommendation was a single developer with parallel agents.
- Answer: start with one developer and one sandbox. Note the team goal in a separate file.
- Decision: step one serves one developer and one sandbox. The team goal and parallel agents go to `vision-factory-iteration2.md`.

**Q2. What does "super efficient inner loop" mean?**

- Discussion: the candidates were fast feedback, low attention cost, trustworthy output and zero-friction setup. The recommendation ranked low attention first.
- Answer: fast feedback is the most important, then trustworthy output, zero friction and low attention. All are needed. (The answer said "trustworthy input"; it was read as "output".)
- Decision: priority order as in [Goals](#goals).

**Q3. How much autonomy does the agent get?**

- Discussion: the options were full autonomy, autonomy with guardrails, or human gates. The existing CLAUDE.md already requires a Gherkin review.
- Answer: the goal is that agents write and review most of the code. At the end an agent judges the criticality and complexity of the change. Low risk and low complexity changes are labelled and need no human attention. Auto-merge is for later. Everything else is labelled "Human-approval-needed" (later renamed, see Q20).
- Decision: R8–R13.

**Q4. What is "the factory" in scope?**

- Discussion: the options were the dev environment only, the environment plus agent workflows, or also an orchestration layer.
- Answer: this iteration covers the dev environment (sandbox image, tools, linters, hooks, permissions). The outer, more complex loop goes into `design/vision-factory-iteration2.md`.
- Decision: see [In scope](#in-scope-for-step-one) and [Out of scope](#out-of-scope-for-step-one).

**Q5. Specific to wheel-of-meeting, or a reusable pattern?**

- Answer: agreed with the recommendation.
- Decision: R25.

**Q6. What are the "papers in the reference sections"?**

- Discussion: the vision file listed no references. The author then added links and the `references/` directory. The PDFs were converted to text, which needed `poppler-utils` in the sandbox. Three web hosts were blocked by the sandbox firewall until the author approved them.
- Decision: references are listed in [References](#references). Extracted texts are stored in `references/text/` for reuse.

### Round 2: feedback, trust and the verdict

**Q7. What is the feedback budget?**

- Discussion: "fast feedback" needs numbers. The proposal was three tiers. `npm audit` is network-bound and slow in a sandbox.
- Answer: agreed.
- Decision: R1, R2.

**Q8. Does the Gherkin review gate stay for every feature?**

- Discussion: it conflicts with "agents write and review most of the code", but it is the only place where intent is stated, and Gherkin review is cheap compared with code review. Revisit once the risk label has proven itself.
- Answer: agreed.
- Decision: R5.

**Q9. Must the reviewing agent be independent of the writing agent?**

- Answer: agreed. Fresh context, sees only the spec and the diff.
- Decision: R7.

**Q10. Who defines "low risk and low complexity"?**

- Discussion: a hybrid of deterministic floor rules and agent judgement, where the agent can only escalate.
- Answer: agreed.
- Decision: R9, R10.

**Q11. Where does the label live in the inner loop?**

- Discussion: CI is out of scope, so the PR is the natural end of the inner loop.
- Answer: agreed.
- Decision: R13.

**Q12. What does "zero friction" mean concretely?**

- Answer: agreed. One command, under 5 minutes, everything versioned in the repo.
- Decision: R3, R4.

**Q13. How does the harness improve over time?**

- Discussion: the Fowler article describes the "steering loop", where repeated mistakes are fixed in the harness (guides and sensors), not in the output. The recommendation was to let agents propose harness changes but never apply them without a human.
- Answer: not a goal for this iteration. Add it to the extensions document.
- Decision: deferred to `vision-factory-iteration2.md`.

**Q14. How do we know step one worked, and what is out of scope?**

- Discussion: the proposal was by-hand measurement without tooling.
- Answer: the author wants a local dashboard with clear metrics instead. The initial version runs as a set of Docker containers and is extended later.
- Decision: R16–R24. The non-goals list was kept as proposed.

### Round 3: the dashboard and edge cases

**Q15. Which metrics does the dashboard show?**

- Answer: agreed, keep it simple.
- Decision: R18.

**Q16. How is the data collected?**

- Discussion: the recommendation was passive collection that never depends on the agent.
- Answer: use hooks and GitHub Actions. An agent should parse the logs and add the metrics. The agent for this runs locally for now.
- Decision: hooks for collection and a local metrics agent. This raised two follow-up questions, Q16a and Q16b.

**Q17. Where does the data live and how does the dashboard run?**

- Answer: agreed. On the host, offline, one command, history outside the sandbox.
- Decision: R17.

**Q18. Is new tooling approved for the dashboard?**

- Discussion: CLAUDE.md requires asking before introducing new dependencies or tools.
- Answer: agreed.
- Decision: R23, R24.

**Q19. What happens when an agent is stuck?**

- Answer: agreed.
- Decision: R14, R15.

**Q20. What are the label values and the default?**

- Answer: `low-risk-auto-approval-ready` and `Human-approval-required`.
- Decision: R11, R12. The default is `Human-approval-required`. This replaces the earlier name "Human-approval-needed".

**Q21. What goes into the extensions document?**

- Answer: agreed with the proposed list.
- Decision: see [vision-factory-iteration2.md](vision-factory-iteration2.md).

### Round 4: follow-ups

**Q16a. Do GitHub Actions conflict with the inner-loop scope?**

- Discussion: step one excludes CI, but Q16 named GitHub Actions as a metrics source. The options were local sources only (A) or a narrow exception that reads Actions results (B).
- Answer: not answered directly. Option A was assumed, and the author confirmed the decision summary.
- Decision: R22. GitHub Actions metrics move to iteration 2.

**Q16b. How far do we trust agent-parsed metrics?**

- Discussion: an LLM can miscount, so scripts compute the exact numbers and the agent handles classification. Raw events are always kept.
- Answer: agreed.
- Decision: R20, R21 (later moved to iteration 2, see Q19).

### Round 5: floor rules, logging, budget

**Q1. Does the floor rule on tests block every feature?**

- Discussion: as written, R9 would flag every feature, because test-first development changes tests.
- Answer: a feature's own test changes are expected. Touching tests unrelated to the feature triggers review.
- Decision: R9, with the name-based mapping from Q10.

**Q2. How is the human override rate recorded?**

- Answer: agreed. Read the label change on the PR and review comments or follow-up commits from `gh` and git.
- Decision: input for the iteration 2 dashboard.

**Q3 and Q11. Where does the log live?**

- Discussion: the log should be committed for later analysis. One shared file would conflict across branches and worktrees, and it must be excluded from the diff and floor rules.
- Answer: a dedicated log file, committed. Agreed on one file per branch.
- Decision: R19.

**Q4. How hard is the test-first enforcement?**

- Answer: agreed. Check at commit time, with a human-set refactor exemption.
- Decision: R6.

**Q5. How independent is the reviewer?**

- Answer: a subagent for now, with room to improve later.
- Decision: R7, with the weakness noted. Floor rules run as a script so the reviewer can only escalate.

**Q6, Q12, Q16, Q17, Q24. Budget.**

- Discussion: the first answer (nothing enforced, stop after 5 iterations) was withdrawn for more discussion. The aim is to guard against infinite loops. Time limits and the same-failure rule were then set, with the block-and-summarise stop so the agent can explain where it is stuck.
- Answer: warn at 10 minutes, kill at 30 minutes, stop after 3 failures of the same test, per role session, agreed.
- Decision: R14, R15.

### Round 6: setup, tooling and approval

**Q7, Q8, Q9.** Agreed: split `check` and fix the advisory first (R2), `@smoke` tests for tier 2 (R1), and protect harness files with explicit deny rules instead of relying on a permission mode (design phase).

**Q13.** Agreed: the path list, N = 200, and the keyword check (R9).

**Q14, Q15. Setup.**

- Discussion: the author checked the host side. `sbx` supports custom templates through `sbx template save`.
- Answer: a setup script first, a saved template if setup takes more than 5 minutes. One command on the host.
- Decision: R3, R4.

**Q18, Q20, Q21. Roles.**

- Discussion: the author wants the Gherkin file to be written by a human or a different agent than the implementer. The tests are written first and must fail, and a separate agent then makes them pass.
- Answer: four roles, a human review gate after the spec, the test author may be the spec author but never the implementer, the implementer may not touch tests or feature files (hard requirement), and the developer starts each role by hand.
- Decision: R5, R26. Role orchestration goes to iteration 2.

### Round 7: metrics and the PR

**Q19, Q22. What does step one collect?**

- Answer: no dashboard and no metrics agent yet. Collect metrics so they can be imported later, as raw JSONL events.
- Decision: R19. R16, R17, R18, R20 and R21 move to iteration 2.

**Q23. Who sets the label?**

- Answer: agreed. A script combines the verdict with the floor rules and applies the label.
- Decision: R13.

## References

Local copies of the sources are in [references/](references/) (PDFs) and [references/text/](references/text/README.md) (extracted plain text of the PDFs and of the web pages, for reuse by agents and humans).

Web:

- <https://docs.factory.com/>
- <https://www.thoughtworks.com/en-us/perspectives/edition39-agentic-ready-data-strategy>
- <https://github.com/humanlayer/12-factor-agents>
- <https://simonwillison.net/guides/agentic-engineering-patterns>

PDFs in `references/`:

- A question of trust: Developing an agentic-ready data strategy (Thoughtworks)
- Agentic SDLC: The Software Factory Framework (ASDLC.io)
- Building AI Software Factory: Top 2027 Guide to Agentic SDLC
- Harness engineering for coding agent users (Birgitta Böckeler)
- How Uber built an AI software factory for agentic coding: the MCP gateway and the platform underneath
- Humans and Agents in Software Engineering Loops (Kief Morris)
- The Agentic Software Factory: How AI Teams Debate, Code, and can Secure Enterprise Infrastructure (DEV Community)
- The Factory Model: How Coding Agents Changed Software Engineering (Addy Osmani)
