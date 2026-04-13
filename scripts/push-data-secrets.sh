#!/usr/bin/env bash
# Push data files to GCP Secret Manager.
#
# For each secret, adds a new version from the local data file then immediately
# disables all previously enabled versions. Combined with version_destroy_ttl=86400s
# on the secrets, this keeps exactly one enabled version at all times.
#
# Usage: ./scripts/push-data-secrets.sh
# Requires: gcloud authenticated with secretmanager.secretVersionAdder permission.

set -o errexit
set -o nounset
set -o pipefail
if [[ "${TRACE-0}" == "1" ]]; then set -o xtrace; fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/common.sh
source "${SCRIPT_DIR}/common.sh"

push_secret() {
  local secret_id="$1"
  local data_file="$2"

  echo "→ Pushing ${data_file} to ${secret_id}..."

  # Add new version; capture its full resource name (projects/.../versions/N)
  new_version=$(gcloud secrets versions add "${secret_id}" \
    --project="${GCP_PROJECT}" \
    --data-file="${data_file}" \
    --format="value(name)")

  echo "  New version: ${new_version}"

  # Disable every previously enabled version except the one we just created
  mapfile -t old_versions < <(
    gcloud secrets versions list "${secret_id}" \
      --project="${GCP_PROJECT}" \
      --filter="state=ENABLED AND NOT name=${new_version}" \
      --format="value(name)"
  )

  if [[ ${#old_versions[@]} -eq 0 ]]; then
    echo "  No previous versions to disable."
  else
    for v in "${old_versions[@]}"; do
      echo "  Disabling ${v}..."
      gcloud secrets versions disable "${v}" \
        --secret="${secret_id}" \
        --project="${GCP_PROJECT}" \
        --quiet
    done
  fi

  echo "  Done."
}

push_secret "wom-partners-json"    "${SCRIPT_DIR}/../data/partners.json"
push_secret "wom-leads-json"       "${SCRIPT_DIR}/../data/lead-developers.json"

echo ""
echo "✓ All secrets updated. Disabled versions will be destroyed after 24 h."
