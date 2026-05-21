---
name: infrastructure-work-conventions
description: Defines the conventions to follow when working with infrastructure and specifically terraform code.
user-invocable: false
---

When working with terraform code and infrastructure releated tasks, it's important to maintain a consistent style and structure. Here are some guidelines to help you achieve this.

## Repository setup

- **[koenighotze/kh-gcp-seed](https://github.com/koenighotze/kh-gcp-seed)** — all IAM and service account management
- **[koenighotze/wheel-of-meeting](https://github.com/koenighotze/wheel-of-meeting)** — application code and infrastructure (Cloud Run, secrets, etc.) This is THIS repository

Never add IAM bindings or service account changes to wheel-of-meeting here; those belong in kh-gcp-seed.

## Workflow

It is important to keep terraform valid and working. So, follow this workflow

0. Always work on a fresh branch! Never on main.
1. check that everything is still working
2. apply your changes
3. verify that everything STILL works - feel free to fix issues if you can. If something breaks, fix it and try again.
4. commit your changes
5. push your changes to the remote repository

BUT, if step 1. fails, DO NOT continue. Instead ask for my guidance.

### How to verify infrastructure code

The easiest way is to use @scripts/check.sh. That file executes all the checks you need and will output a summary of what it found.
