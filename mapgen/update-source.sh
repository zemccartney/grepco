#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_URL="https://uninformativ.de/git/asciiworld.git"
TEMP_DIR=$(mktemp -d)
TARGET_DIR="$SCRIPT_DIR/asciiworld"

echo "Cloning asciiworld from $REPO_URL..."
git clone "$REPO_URL" "$TEMP_DIR"

echo "Getting current HEAD SHA..."
cd "$TEMP_DIR"
SHA=$(git rev-parse HEAD)
echo "Current SHA: $SHA"

echo "Copying files (excluding .git)..."
mkdir -p "$TARGET_DIR"
rsync -a --exclude='.git' "$TEMP_DIR/" "$TARGET_DIR/"

echo "Writing SHA to asciiworld-sha.txt..."
echo "$SHA" > "$SCRIPT_DIR/asciiworld-sha.txt"

echo "Cleaning up temp directory..."
rm -rf "$TEMP_DIR"

echo ""
echo "✓ Source updated successfully!"
echo "✓ SHA: $SHA"
echo "✓ Location: $TARGET_DIR"
echo ""
echo "Next step: Run 'npm run map:build' to rebuild the Docker image"
