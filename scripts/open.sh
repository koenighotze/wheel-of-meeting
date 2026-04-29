#!/usr/bin/env bash
# shellcheck disable=SC1091
set -o errexit
set -o nounset
set -o pipefail
if [[ "${TRACE-0}" == "1" ]]; then set -o xtrace; fi

source "$(dirname "$0")/common.sh"
cd "$(dirname "$0")/.."

PORT=${1:-8080}

echo "Starting proxy for ${GCP_PROJECT} (region: ${REGION}) on port ${PORT}..."
gcloud run services proxy wheel-of-meeting \
  --region "${REGION}" \
  --project "${GCP_PROJECT}" \
  --port "${PORT}" &

PROXY_PID=$!

until curl --silent --fail "http://localhost:${PORT}" > /dev/null 2>&1; do
  sleep 1
done

open "http://localhost:${PORT}"
wait "${PROXY_PID}"
