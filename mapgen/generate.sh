#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="$SCRIPT_DIR/output"

echo "Generating ASCII map..."

# Run Docker container with volume mount
# Passes any additional params to asciiworld
docker run --rm \
    -v "$OUTPUT_DIR:/output" \
    grepco-mapgen:latest \
    "$@"

echo ""
echo "✓ Map generated successfully!"
echo "✓ Location: $OUTPUT_DIR/map.png"
echo ""
echo "To review: open $OUTPUT_DIR/map.png"
echo "To promote: cp $OUTPUT_DIR/map.png src/assets/images/map.png"
