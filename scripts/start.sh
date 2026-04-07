#!/usr/bin/env bash
set -euo pipefail

PORT=${1:-8080}
URL="http://localhost:$PORT"

cd "$(dirname "$0")/.."

open "$URL"
python3 "$(dirname "$0")/server.py" "$PORT"
