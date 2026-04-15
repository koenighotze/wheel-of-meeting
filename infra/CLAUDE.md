# infra/ — Terraform Guidelines

## What lives here

Google Cloud infrastructure for the `wheel-of-meeting` Cloud Run service: the service itself, Secret Manager secrets, and the invoker IAM binding for the authorised user.

**IAM and service accounts are NOT managed here.** They live in [koenighotze/kh-gcp-seed](https://github.com/koenighotze/kh-gcp-seed). Never add `google_project_iam_*` or `google_service_account` resources to this directory.

---

## Stack

| Thing | Value |
|---|---|
| Terraform | `~> 1.14.0` (see `providers.tf`) |
| Google provider | `~> 7` |
| Backend | GCS — bucket passed via `-backend-config` at init time |
| Default region | `europe-west3` |

---

## Variables

All sensitive variables (`project_id`, `authorized_user_email`, `cloud_run_sa_email`) are fed from GitHub Actions secrets. Never hardcode them. The `terraform.tfvars.example` shows the expected shape for local use.

`container_image` is a **bootstrap-only** variable. After first apply, image updates are done via `gcloud run deploy` (the deploy workflow), not Terraform. The Cloud Run resource has `lifecycle { ignore_changes = [template[0].containers[0].image] }` — do not remove this.

---

## Key Patterns

- **Secret-to-Cloud-Run dependency:** Always add `depends_on` pointing at the `google_secret_manager_secret_iam_member` resources when a Cloud Run service mounts secrets. Without it, Terraform may create the service in parallel with the IAM binding, causing a `not found` race condition at deploy time.
- **No SHA pinning** for trusted providers (`actions/*`, `google-github-actions/*`, `hashicorp/*`).

---

## Before Every Commit

```bash
cd infra
terraform fmt -recursive   # format all .tf files
terraform validate         # catch syntax/reference errors
terraform plan             # confirm no unintended changes
```

CI enforces all three (`plan.yml` → `qa` job). A PR that fails format or validate will not plan.

---

## CI Workflow Summary

| Workflow | Trigger | Purpose |
|---|---|---|
| `plan.yml` | Push to `main` touching `infra/**` | Compliance scan (Checkov), TFLint, fmt check, validate, plan |
| `apply.yml` | `workflow_dispatch` only | Apply — never triggered automatically |

Apply is intentionally manual. Do not add automatic apply triggers.
