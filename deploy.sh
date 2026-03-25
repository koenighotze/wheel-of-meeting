#!/bin/bash
set -e
if [[ ! -f data/partners.json || ! -f data/lead-developers.json ]]; then
  echo "ERROR: data/ files are missing. Export them from your secure store first."
  exit 1
fi
echo "Deploying to App Engine..."
gcloud app deploy --quiet
echo "Done: https://$(gcloud config get-value project).appspot.com"
