#!/bin/bash
# undeploy.sh — Remove all deployed App Engine versions, services, and firewall rules.
#
# NOTE: The App Engine application resource itself cannot be deleted once created
# (GCP platform limitation). To fully remove it, delete the entire GCP project.
#
# What this script removes:
#   - All deployed versions (all services)
#   - All non-default services
#   - All custom firewall rules (preserves the built-in default-allow rule)
set -e

PROJECT="wheel-of-meeting-13bf3f03"

echo "WARNING: This will remove all App Engine deployments from ${PROJECT}."
echo "The App Engine application itself cannot be deleted (GCP limitation)."
echo "To fully remove everything, delete the GCP project instead."
echo ""
read -r -p "Type 'yes' to confirm: " CONFIRM
if [[ "${CONFIRM}" != "yes" ]]; then
  echo "Aborted."
  exit 1
fi

echo ""
echo "Step 1: Removing custom firewall rules..."
RULES=$(gcloud app firewall-rules list \
  --project="${PROJECT}" \
  --format="value(priority)" 2>/dev/null | grep -v "^2147483647$" || true)

if [[ -z "${RULES}" ]]; then
  echo "  No custom firewall rules found."
else
  echo "${RULES}" | xargs -I{} gcloud app firewall-rules delete {} \
    --project="${PROJECT}" \
    --quiet
  echo "  Removed firewall rules: $(echo "${RULES}" | tr '\n' ' ')"
fi

echo ""
echo "Step 2: Deleting all deployed versions..."
VERSIONS=$(gcloud app versions list \
  --project="${PROJECT}" \
  --format="value(service,version.id)" 2>/dev/null || true)

if [[ -z "${VERSIONS}" ]]; then
  echo "  No deployed versions found."
else
  while IFS=$'\t' read -r SERVICE VERSION; do
    echo "  Deleting ${SERVICE}/${VERSION}..."
    gcloud app versions delete "${VERSION}" \
      --service="${SERVICE}" \
      --project="${PROJECT}" \
      --quiet
  done <<< "${VERSIONS}"
fi

echo ""
echo "Step 3: Deleting non-default services..."
SERVICES=$(gcloud app services list \
  --project="${PROJECT}" \
  --format="value(id)" 2>/dev/null | grep -v "^default$" || true)

if [[ -z "${SERVICES}" ]]; then
  echo "  No non-default services found."
else
  echo "${SERVICES}" | xargs -I{} gcloud app services delete {} \
    --project="${PROJECT}" \
    --quiet
  echo "  Deleted services: $(echo "${SERVICES}" | tr '\n' ' ')"
fi

echo ""
echo "Done. All deployed versions and custom configuration have been removed."
echo ""
echo "NOTE: The App Engine application shell still exists at:"
echo "  https://$(gcloud app describe --project="${PROJECT}" --format='value(defaultHostname)')"
echo "  To fully remove it, delete the GCP project:"
echo "  gcloud projects delete ${PROJECT}"
