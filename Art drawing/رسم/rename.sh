#!/bin/bash

# Usage:
# ./rename.sh oldext newext
# Example:
# ./rename.sh png jpg

OLD="$1"
NEW="$2"

# Check input
if [ -z "$OLD" ] || [ -z "$NEW" ]; then
  echo "Usage: ./rename.sh oldext newext"
  exit 1
fi

# Rename loop
shopt -s nullglob
for f in *."$OLD"; do
  mv "$f" "${f%.*}.$NEW"
done
shopt -u nullglob

echo "Done renaming all *.$OLD → *.$NEW"