---
name: codacy
description: 'Fetch Codacy findings and autonomously fix them. Works in two modes — pr (findings on the current open PR) and backlog (all open repository findings). Usage: /codacy [pr|backlog] [--categories all|quality|security-and-error-prone]'
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

1. **Codacy API token resolvable:** try the sources below in order and use the first that yields a non-empty value. Never print the token.
   1. `$CODACY_API_TOKEN` is set and non-empty (e.g. in a sandbox without the `op` CLI).
   2. `op` is installed, `$CODACY_OP_REF` is set (an `op://vault/item/field` URI) and `op read "$CODACY_OP_REF"` returns a non-empty value.
   3. Neither works: stop, do not spawn the agent, and show the user the matching message, then ask them to export `CODACY_API_TOKEN` or fix the `op` setup:
      - `op` not installed (`command -v op` fails): "The 1Password CLI op is not available and CODACY_API_TOKEN is not set. Export CODACY_API_TOKEN or install and sign in to op, then set CODACY_OP_REF."
      - `op` installed but `$CODACY_OP_REF` unset: "The 1Password CLI op is available but CODACY_OP_REF is not set. Set it to the op://vault/item/field URI of the Codacy token, or export CODACY_API_TOKEN."
      - `op read` fails or returns nothing: "op read failed for CODACY_OP_REF. Run op signin or check the reference, or export CODACY_API_TOKEN."
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
