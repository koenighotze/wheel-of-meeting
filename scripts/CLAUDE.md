# scripts/ — Operational Scripts

All scripts are local-only — they are never run by CI. Some scripts require `gcloud`, `gh`, and `op` (1Password CLI) to be installed and authenticated; see [Prerequisites](#prerequisites) below for script-specific requirements.

---

## Script Reference

| Script | Purpose |
|---|---|
| `start.sh [port]` | Serve the app locally via `server.py` and open the browser (default port 8080) |
| `deploy.sh` | Build Docker image, push to Artifact Registry, deploy to Cloud Run |
| `push-data-secrets.sh` | Push `data/partners.json` and `data/lead-developers.json` to GCP Secret Manager |
| `tf-local-init.sh` | Initialize Terraform locally with the GCS backend bucket |
| `check.sh` | Run TFLint, `terraform validate`, `terraform fmt`, and Checkov locally |
| `set-gh-secrets.sh` | Push GitHub Actions secrets from 1Password to the repo |
| `scrape-sop.js` | DevTools console snippet — paste into browser on the SOP partner search page to scrape emails into `data/partners.json` |
| `common.sh` | Shared env vars sourced by all other scripts — do not run directly |
| `gcp-functions.sh` | Shared GCP helper functions sourced by other scripts — do not run directly |

---

## common.sh — Shared Variables

All scripts `source common.sh`. It reads the GCP resource postfix from 1Password and derives:

| Variable | Value pattern |
|---|---|
| `GCP_PROJECT` | `wheel-of-meeting-<postfix>` |
| `TF_STATE_BUCKET_NAME` | `wheel-of-meeting-<postfix>-tf-state` |
| `REGION` | `europe-west3` |
| `AR_REPO` | `europe-west3-docker.pkg.dev/platform-<postfix>/docker-<postfix>` |
| `AR_IMAGE` | `<AR_REPO>/wheel-of-meeting:<git-sha>` |

---

## Secret Management

`push-data-secrets.sh` is the canonical way to update partner/lead data in production:

1. Edit `data/partners.json` or `data/lead-developers.json` locally
2. Run `./scripts/push-data-secrets.sh`

The script adds a new secret version and disables all previous enabled versions. Disabled versions are automatically destroyed after 24 h (`version_destroy_ttl=86400s`). CI never writes secrets — this is always a manual local operation.

---

## Prerequisites

- `gcloud auth login` and `gcloud auth application-default login`
- `op signin` (1Password CLI)
- `gh auth login` (for `set-gh-secrets.sh`)
- Docker running (for `deploy.sh`)
- `data/partners.json` and `data/lead-developers.json` present (for `deploy.sh` and `push-data-secrets.sh`)

---

## Adding a Script

- Place it in `scripts/` — never in the repo root.
- Source `common.sh` for shared variables.
- Use the standard bash safety header (`set -o errexit/nounset/pipefail`).
- Support `TRACE=1` for debug mode.
