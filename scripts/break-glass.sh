#!/usr/bin/env bash
# shellcheck disable=SC1091
# break-glass.sh — Emergency script to cut all traffic to the App Engine app.
# Run this when you need to take the app offline immediately.
#
# What it does:
#   1. Inserts a firewall rule that denies all inbound traffic (takes effect within seconds)
#   2. Stops all currently serving versions
#
# To restore service, delete the deny-all firewall rule and redeploy:
#   gcloud app firewall-rules delete 1 --project="${GCP_PROJECT}" --quiet
#   ./deploy.sh
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

echo "WARNING: This will immediately cut all traffic to ${GCP_PROJECT}."
read -r -p "Type 'yes' to confirm: " CONFIRM
if [[ "${CONFIRM}" != "yes" ]]; then
  echo "Aborted."
  exit 1
fi

echo ""
echo "Step 1: Inserting deny-all firewall rule..."
gcloud app firewall-rules create 1 \
  --action=DENY \
  --source-range="*" \
  --description="break-glass: deny all traffic" \
  --project="${GCP_PROJECT}" \
  --quiet
echo "  Firewall rule inserted. All inbound traffic is now blocked."

echo ""
echo "Step 2: Stopping all serving versions..."
VERSIONS=$(gcloud app versions list \
  --project="${GCP_PROJECT}" \
  --filter="SERVING_STATUS=SERVING" \
  --format="value(version.id)" 2>/dev/null)

if [[ -z "${VERSIONS}" ]]; then
  echo "  No serving versions found."
else
  echo "${VERSIONS}" | xargs -I{} gcloud app versions stop {} \
    --project="${GCP_PROJECT}" \
    --quiet
  echo "  Stopped versions: $(echo "${VERSIONS}" | tr '\n' ' ')"
fi

echo ""
echo "Done. App is offline."
echo ""
echo "To restore service:"
echo "  gcloud app firewall-rules delete 1 --project=${GCP_PROJECT} --quiet"
echo "  ./deploy.sh"
