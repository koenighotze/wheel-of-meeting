# .github/ — Workflow Guidelines

## Workflow Map

| File | Trigger | Purpose |
|---|---|---|
| `ci.yml` | Push/PR to `main` | Quality (lint, format, audit) + Playwright E2E tests |
| `deploy.yml` | Tag `v*` or `workflow_dispatch` | Build image, push to Artifact Registry, deploy to Cloud Run |
| `plan.yml` | Push to `main` touching `infra/**` | Checkov + TFLint + fmt + validate + plan |
| `apply.yml` | `workflow_dispatch` only | Terraform apply |
| `codeql.yml` | Schedule / PR | SAST scanning |

---

## Fixed Conventions — Do Not Change

- **Apply is manual only.** `apply.yml` uses `workflow_dispatch`. Never add a push or schedule trigger to it.
- **Deploy triggers on `v*` tags.** Do not change the deploy trigger to branch pushes.
- **Concurrency groups:**
  - `deploy` — `cancel-in-progress: false` (never cancel a running deploy)
  - `tf` (plan) — `cancel-in-progress: true` (superseded plans can be cancelled)
  - `tf-apply` — `cancel-in-progress: false` (never cancel a running apply)
- **Permissions are minimal:** `contents: read` + `id-token: write` only. Do not widen.
- **No SHA pinning** for trusted action providers: `actions/*`, `google-github-actions/*`, `hashicorp/*`, `bridgecrewio/*`.

---

## Secrets Used

All sensitive values come from GitHub Actions secrets — never hardcode them in workflow files.

| Secret | Used by |
|---|---|
| `WORKLOAD_IDENTITY_PROVIDER_NAME` | All GCP-authenticated jobs |
| `GCP_SERVICE_ACCOUNT` | All GCP-authenticated jobs |
| `GCP_PROJECT_ID` | Terraform (`TF_VAR_project_id`) |
| `TF_STATE_BUCKET` | Terraform backend init |
| `AUTHORIZED_USER_EMAIL` | Terraform (`TF_VAR_authorized_user_email`) |
| `CLOUD_RUN_SERVICE_ACCOUNT` | Terraform (`TF_VAR_cloud_run_sa_email`) |
| `GCP_AR_REPO` | Deploy (image tag) |

---

## Runtime Versions

- Node: `22` (CI)
- OS: `ubuntu-24.04` (infra jobs), `ubuntu-latest` (app jobs)
- Terraform: installed via `hashicorp/setup-terraform@v4` using the version in `infra/.terraform-version`; this must stay aligned with `infra/providers.tf` `required_version`
- TFLint: `v0.56.0` (pinned in `plan.yml`)

---

## Dependabot

`dependabot.yml` runs every Monday and opens up to 2 PRs each for GitHub Actions and npm devDependencies. npm updates are grouped into a single `devDependencies` PR (minor + patch only). Merge these promptly — they keep action versions current without needing SHA pinning.

---

## Before Editing a Workflow

- Confirm the job still passes locally or in a draft PR before merging — broken CI blocks the whole team.
- Prefer `workflow_dispatch` for any destructive or irreversible operation (apply, delete).
- Keep each job's `working-directory` explicit when it differs from the repo root.
