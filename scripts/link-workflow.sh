#!/bin/bash
set -euo pipefail

WORKFLOWS_DIR="$HOME/Library/Application Support/Alfred/Alfred.alfredpreferences/workflows"
LINK_NAME="user.workflow.discord-timestamps-dev"
LINK_PATH="$WORKFLOWS_DIR/$LINK_NAME"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [[ -d "$LINK_PATH" && ! -L "$LINK_PATH" ]]; then
  echo "Updating dev workflow at: $LINK_PATH"
elif [[ -L "$LINK_PATH" ]]; then
  echo "Removing old symlink: $LINK_PATH"
  rm "$LINK_PATH"
elif [[ -e "$LINK_PATH" ]]; then
  echo "Error: $LINK_PATH already exists and is unexpected"
  exit 1
fi

mkdir -p "$LINK_PATH"

# Symlink runtime files from the project
for f in dist icons icon.png run-node.sh; do
  ln -sf "$PROJECT_DIR/$f" "$LINK_PATH/$f"
done

# Generate a dev info.plist with a different keyword, name, and bundle ID
sed \
  -e 's|<string>dt</string>|<string>dtdev</string>|' \
  -e 's|<string>Discord Timestamps</string>|<string>Discord Timestamps (Dev)</string>|' \
  -e 's|<string>com.notjosh.alfred-discord-timestamps</string>|<string>com.notjosh.alfred-discord-timestamps.dev</string>|' \
  "$PROJECT_DIR/info.plist" > "$LINK_PATH/info.plist"

echo "Dev workflow installed at: $LINK_PATH"
echo "  Keyword: dtdev"
echo "  Symlinks: dist/ icons/ icon.png run-node.sh"
echo "  Patched: info.plist (keyword=dtdev, name=Discord Timestamps (Dev))"
echo ""
echo "Reload Alfred (or toggle the workflow) to pick it up."
