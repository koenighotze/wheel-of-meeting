---
name: codacy
description: Fetch Codacy findings and autonomously fix them. Works in two modes — pr (findings on the current open PR) and backlog (all open repository findings). Usage: /codacy [pr|backlog] [--categories all|quality|security-and-error-prone]
---

## Parse arguments

Extract from the invocation:

| Argument       | Values                                       | Default                 |
| -------------- | -------------------------------------------- | ----------------------- |
| mode           | `pr`, `backlog`                              | auto-detect (see below) |
| `--categories` | `all`, `quality`, `security-and-error-prone` | `all`                   |

**Auto-detect mode:** if no mode is given, run `gh pr view --json number` on the current branch.

- If an open PR is found → mode is `pr`
- If no PR is found → mode is `backlog`

---

## Validate preconditions

Check each of the following. On failure, print a clear error and stop — do not spawn the agent.

1. **`op` CLI available:** `op --version` must succeed.
2. **Not on a protected branch:** `git branch --show-current` must not return `main` or `master`.
3. **Inside a git repo:** `git rev-parse --is-inside-work-tree` must return `true`.
4. **Mode is determinable:** either explicitly provided, or auto-detection succeeded.

---

## Delegate to agent

Once all preconditions pass, spawn the `codacy-handler` agent with the resolved parameters in the prompt:

> Run the codacy-handler workflow with:
>
> - mode: `<resolved mode>`
> - categories: `<resolved categories>`
