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

1. Open the SOP partner search results page in your browser, open DevTools, paste the contents of `scripts/scrape-sop.js` into the console, and run it. Copy the printed JSON output into `data/partners.json`.

2. Push the updated file to Secret Manager:

```bash
./scripts/push-data-secrets.sh
```

### Access

The service requires authentication. Only the configured `authorized_user_email` can invoke it.

```bash
# Open in browser via local proxy (handles auth transparently)
gcloud run services proxy wheel-of-meeting \
  --region europe-west3 \
  --project <your-project-id>
```

### Check deployment status

```bash
# Describe the Cloud Run service
gcloud run services describe wheel-of-meeting \
  --region europe-west3 \
  --project <your-project-id>

# Tail live request logs
gcloud logging read "resource.type=cloud_run_revision" \
  --project <your-project-id> \
  --limit 50

# Print the service URL
gcloud run services describe wheel-of-meeting \
  --region europe-west3 \
  --project <your-project-id> \
  --format='value(status.url)'
```
