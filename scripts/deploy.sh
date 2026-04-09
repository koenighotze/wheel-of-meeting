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

echo "Building and pushing image to Artifact Registry..."
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet
docker build -t "${AR_IMAGE}" .
docker push "${AR_IMAGE}"

echo "Deploying to Cloud Run (project: ${GCP_PROJECT}, region: ${REGION})..."
gcloud run deploy wheel-of-meeting \
  --image "${AR_IMAGE}" \
  --region "${REGION}" \
  --project "${GCP_PROJECT}" \
  --no-allow-unauthenticated \
  --quiet

echo "Done: $(gcloud run services describe wheel-of-meeting \
  --region "${REGION}" --project "${GCP_PROJECT}" \
  --format='value(status.url)')"
echo ""
echo "To open in browser run:"
echo "  gcloud run services proxy wheel-of-meeting --region ${REGION} --project ${GCP_PROJECT}"
