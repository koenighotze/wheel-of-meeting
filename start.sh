#!/usr/bin/env bash
set -euo pipefail

PORT=${1:-8080}
URL="http://localhost:$PORT"

cd "$(dirname "$0")"

if command -v python3 &>/dev/null; then
  echo "Serving at $URL  (press Ctrl+C to stop)"
  open "$URL"
  python3 -m http.server "$PORT"
elif command -v npx &>/dev/null; then
  echo "Serving at $URL  (press Ctrl+C to stop)"
  open "$URL"
  npx serve -l "$PORT" .
else
  echo "Error: neither python3 nor npx found. Install one to serve the app." >&2
  exit 1
fi
