#!/usr/bin/env bash
# shellcheck disable=SC1091
# when a command fails, bash exits instead of continuing with the rest of the script
set -o errexit
# make the script fail, when accessing an unset variable
set -o nounset
# pipeline command is treated as failed, even if one command in the pipeline fails
set -o pipefail
# enable debug mode, by running your script as TRACE=1
if [[ "${TRACE-0}" == "1" ]]; then set -o xtrace; fi

source "$(dirname "$0")/common.sh"
cd "$(dirname "$0")/.."

if [[ ! -f data/partners.json || ! -f data/lead-developers.json ]]; then
  echo "ERROR: data/ files are missing. Export them from your secure store first."
  exit 1
fi
echo "Deploying to App Engine (project: ${GCP_PROJECT})..."
gcloud app deploy --quiet --project="${GCP_PROJECT}"
echo "Done: https://$(gcloud app describe --project="${GCP_PROJECT}" --format='value(defaultHostname)')"
