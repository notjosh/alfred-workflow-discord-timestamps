#!/bin/bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 patch|minor|major|current"
  exit 1
fi

echo "🔍 Checking branch..."
if [[ "$(git branch --show-current)" != "main" ]]; then
  echo "❌ Not on main branch"
  exit 1
fi
echo "✅ On main branch"

echo "🔍 Checking working directory..."
if [[ -n "$(git status --porcelain)" ]]; then
  echo "❌ Working directory is not clean"
  exit 1
fi
echo "✅ Working directory is clean"

echo "🔍 Fetching origin..."
git fetch origin main --quiet
if [[ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]]; then
  echo "❌ Local main is not up to date with origin/main"
  exit 1
fi
echo "✅ Up to date with origin/main"

if [[ "$1" == "current" ]]; then
  VERSION=$(node -p "require('./package.json').version")
else
  echo "📦 Bumping version ($1)..."
  npm version "$1" --no-git-tag-version
  VERSION=$(node -p "require('./package.json').version")

  node scripts/stamp-version.js "$VERSION"

  git add package.json info.plist
  git commit -m "v${VERSION}"
  echo "✅ Bumped to ${VERSION}"
fi

TAG="v${VERSION}"
echo ""
echo "🚀 Releasing ${TAG}..."

echo "🔍 Checking tag doesn't exist on remote..."
if git ls-remote --tags origin "$TAG" | grep -q "$TAG"; then
  echo "❌ Tag $TAG already exists on remote"
  exit 1
fi
echo "✅ Tag is available"

echo "📤 Tagging and pushing..."
git tag -m "$TAG" "$TAG"
git push && git push --tags
echo "✅ Pushed"

echo "⏳ Waiting for release workflow..."

RUN_ID=""
for _ in {1..15}; do
  sleep 2
  RUN_ID=$(gh run list --workflow=release.yml --limit=1 --json databaseId,headBranch \
    -q ".[] | select(.headBranch == \"${TAG}\") | .databaseId")
  if [[ -n "$RUN_ID" ]]; then
    break
  fi
done

if [[ -z "$RUN_ID" ]]; then
  REPO_URL=$(gh repo view --json url -q .url)
  echo "❌ Could not find workflow run. Check manually:"
  echo "   ${REPO_URL}/actions"
  exit 1
fi

gh run watch "$RUN_ID"

echo ""
echo "🎉 Release: $(gh release view "$TAG" --json url -q .url)"
