#!/bin/bash
# break-glass.sh — Emergency script to cut all traffic to the App Engine app.
# Run this when you need to take the app offline immediately.
#
# What it does:
#   1. Inserts a firewall rule that denies all inbound traffic (takes effect within seconds)
#   2. Stops all currently serving versions
#
# To restore service, delete the deny-all firewall rule and redeploy:
#   gcloud app firewall-rules delete 1 --project=wheel-of-meeting-13bf3f03 --quiet
#   ./deploy.sh
set -e

PROJECT="wheel-of-meeting-13bf3f03"

echo "WARNING: This will immediately cut all traffic to ${PROJECT}."
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
  --project="${PROJECT}" \
  --quiet
echo "  Firewall rule inserted. All inbound traffic is now blocked."

echo ""
echo "Step 2: Stopping all serving versions..."
VERSIONS=$(gcloud app versions list \
  --project="${PROJECT}" \
  --filter="SERVING_STATUS=SERVING" \
  --format="value(version.id)" 2>/dev/null)

if [[ -z "${VERSIONS}" ]]; then
  echo "  No serving versions found."
else
  echo "${VERSIONS}" | xargs -I{} gcloud app versions stop {} \
    --project="${PROJECT}" \
    --quiet
  echo "  Stopped versions: $(echo "${VERSIONS}" | tr '\n' ' ')"
fi

echo ""
echo "Done. App is offline."
echo ""
echo "To restore service:"
echo "  gcloud app firewall-rules delete 1 --project=${PROJECT} --quiet"
echo "  ./deploy.sh"
