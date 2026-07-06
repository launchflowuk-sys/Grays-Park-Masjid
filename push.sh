#!/usr/bin/env bash
# Commit and push all current changes to the "github" remote on the current branch.
# Usage: bash push.sh ["commit message"]

set -euo pipefail

REMOTE="github"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
MESSAGE="${1:-Update $(date '+%Y-%m-%d %H:%M:%S')}"

echo "Branch: $BRANCH"
echo "Remote: $REMOTE"

if [ -z "$(git status --porcelain)" ]; then
  echo "No changes to commit. Pushing existing commits (if any)..."
else
  git add -A
  git commit -m "$MESSAGE"
fi

git push "$REMOTE" "$BRANCH"

echo "Done."
