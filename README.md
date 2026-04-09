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

Deploys to Cloud Run via Cloud Build. Requires the `data/` files to be present locally before deploying.

```bash
scripts/deploy.sh       # build container, push to Artifact Registry, deploy to Cloud Run
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
