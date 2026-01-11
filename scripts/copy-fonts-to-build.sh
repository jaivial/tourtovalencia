#!/bin/bash

FONT_DIR="public/assets/fonts"
BUILD_DIR="build/client/assets/fonts"

echo "Copying fonts to build directory..."
if [ -d "$FONT_DIR" ]; then
  mkdir -p "$BUILD_DIR"
  cp -r "$FONT_DIR"/* "$BUILD_DIR/"
  echo "✓ Fonts copied to $BUILD_DIR"
  ls -lh "$BUILD_DIR"
else
  echo "✗ Font directory not found: $FONT_DIR"
  exit 1
fi
