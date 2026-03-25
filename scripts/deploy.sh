#!/bin/bash
set -e

PROJECT="wheel-of-meeting-13bf3f03"

if [[ ! -f data/partners.json || ! -f data/lead-developers.json ]]; then
  echo "ERROR: data/ files are missing. Export them from your secure store first."
  exit 1
fi
echo "Deploying to App Engine (project: ${PROJECT})..."
gcloud app deploy --quiet --project="${PROJECT}"
echo "Done: https://$(gcloud app describe --project="${PROJECT}" --format='value(defaultHostname)')"
