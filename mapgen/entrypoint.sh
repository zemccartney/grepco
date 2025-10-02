#!/bin/sh

set -e

cd /asciiworld

# Generate ASCII output (no colors) with higher detail
# Using 300x150 character dimensions for more detailed map
./asciiworld -c 0 -w 300 -h 150 -p ham -b "$@" > /tmp/map.txt

# Render to image with ImageMagick at natural size (no resize)
# Larger pointsize for crisp rendering without scaling artifacts
# Using 30% opacity (4D in hex = ~77/255) for subtle background effect
magick -background transparent \
        -fill "#f0fcff4D" \
        -font "DejaVu-Sans-Mono" \
        -pointsize 5 \
        label:@/tmp/map.txt \
        /output/map.png