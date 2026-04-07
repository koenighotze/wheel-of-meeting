#!/usr/bin/env bash
set -euo pipefail

PORT=${1:-8080}
URL="http://localhost:$PORT"

cd "$(dirname "$0")"

echo "Serving at $URL  (press Ctrl+C to stop)"
open "$URL"
python3 -m http.server "$PORT"
