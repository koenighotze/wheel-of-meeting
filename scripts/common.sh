#!/usr/bin/env bash
# shellcheck disable=SC1091,SC2034
# when a command fails, bash exits instead of continuing with the rest of the script
set -o errexit
# make the script fail, when accessing an unset variable
set -o nounset
# pipeline command is treated as failed, even if one command in the pipeline fails
set -o pipefail
# enable debug mode, by running your script as TRACE=1
if [[ "${TRACE-0}" == "1" ]]; then set -o xtrace; fi

POSTFIX=$(op read "op://kh-development/kh-gcp-bootstrap/gcp_resource_postfix")
GCP_PROJECT="wheel-of-meeting-${POSTFIX}"
TF_STATE_BUCKET_NAME="wheel-of-meeting-${POSTFIX}-tf-state"
REGION="europe-west3"
AR_REPO="${REGION}-docker.pkg.dev/platform-${POSTFIX}/docker-${POSTFIX}"
AR_IMAGE="${AR_REPO}/wheel-of-meeting:latest"
