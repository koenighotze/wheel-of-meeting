# Wheel of Meeting

A zero-build, zero-framework browser app that spins a wheel to pick a meeting partner, tracks history in localStorage, and proposes calendar slots.

- **[ARCHITECTURE.md](ARCHITECTURE.md)** — system design, data flow, and extension guides
- **[TECH_STACK.md](TECH_STACK.md)** — technology choices, tooling reference, and npm scripts

---

## Development

```bash
./start.sh              # start local server at http://localhost:8081
npm test                # run all E2E tests (Playwright)
npm run check           # lint + format + audit
```

---

## Deployment

Deploys to Google App Engine. Requires the `data/` files to be present locally before deploying.

```bash
./deploy.sh             # validate data files and run gcloud app deploy
```

### Emergency stop (break-glass)

```bash
./break-glass.sh    # blocks all inbound traffic and stops all serving versions
```

To restore after a break-glass:

```bash
gcloud app firewall-rules delete 1 --project=wheel-of-meeting-13bf3f03 --quiet
./deploy.sh
```

### Check deployment status

```bash
# App Engine application status
gcloud app describe --project=wheel-of-meeting-13bf3f03

# List deployed services
gcloud app services list --project=wheel-of-meeting-13bf3f03

# List deployed versions
gcloud app versions list --project=wheel-of-meeting-13bf3f03

# Traffic split for the default service
gcloud app services describe default --project=wheel-of-meeting-13bf3f03

# Tail live request logs
gcloud app logs tail --project=wheel-of-meeting-13bf3f03

# Open the app in the browser
gcloud app browse --project=wheel-of-meeting-13bf3f03

# Print the app URL
echo "https://$(gcloud app describe --project=wheel-of-meeting-13bf3f03 --format='value(defaultHostname)')"
```
