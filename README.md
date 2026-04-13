# Wheel of Meeting

A zero-build, zero-framework browser app that spins a wheel to pick a meeting partner, tracks history in localStorage, and proposes calendar slots.

- **[ARCHITECTURE.md](ARCHITECTURE.md)** — system design, data flow, and extension guides
- **[TECH_STACK.md](TECH_STACK.md)** — technology choices, tooling reference, and npm scripts

---

## Development

```bash
scripts/start.sh        # start local server at http://localhost:8081
npm test                # run all E2E tests (Playwright)
npm run check           # lint + format + audit
```

---

## Deployment

Deploys to Cloud Run via GitHub Actions. Trigger by pushing a `v*` tag or via manual `workflow_dispatch`. The pipeline builds the Docker image, pushes it to Artifact Registry, and deploys to Cloud Run.

```bash
git tag v1.2.3 && git push origin v1.2.3   # triggers deploy workflow
```

Data files (`partners.json`, `lead-developers.json`) are **not** part of the image. They are stored in GCP Secret Manager and mounted into the container at runtime.

### Updating partner data

```bash
# 1. Scrape current emails from the internal directory (run in DevTools on the SOP page)
scripts/scrape-sop.js

# 2. Paste the output into data/partners.json, then push to Secret Manager
scripts/push-data-secrets.sh
```

### Access

The service requires authentication. Only the configured `authorized_user_email` can invoke it.

```bash
# Open in browser via local proxy (handles auth transparently)
gcloud run services proxy wheel-of-meeting \
  --region europe-west3 \
  --project wheel-of-meeting-13bf3f03
```

### Check deployment status

```bash
# Describe the Cloud Run service
gcloud run services describe wheel-of-meeting \
  --region europe-west3 \
  --project wheel-of-meeting-13bf3f03

# Tail live request logs
gcloud logging read "resource.type=cloud_run_revision" \
  --project wheel-of-meeting-13bf3f03 \
  --limit 50

# Print the service URL
gcloud run services describe wheel-of-meeting \
  --region europe-west3 \
  --project wheel-of-meeting-13bf3f03 \
  --format='value(status.url)'
```
