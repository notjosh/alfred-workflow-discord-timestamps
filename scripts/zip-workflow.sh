#!/bin/bash
set -euo pipefail
OUT="${1:-discord-timestamps.alfredworkflow}"
zip -r "$OUT" info.plist icon.png dist/index.js run-node.sh icons/
echo "$OUT"
