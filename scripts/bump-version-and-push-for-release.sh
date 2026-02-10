#!/bin/bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 patch|minor|major"
  exit 1
fi

npm version "$1" --no-git-tag-version
VERSION=$(node -p "require('./package.json').version")

node scripts/stamp-version.js "$VERSION"

git add package.json info.plist
git commit -m "v${VERSION}"
git tag "v${VERSION}"
git push && git push --tags

REPO_URL=$(gh repo view --json url -q .url)
echo ""
echo "Done! GitHub will create the release."
echo "Watch: ${REPO_URL}/actions"
echo "Release: ${REPO_URL}/releases/tag/v${VERSION}"
