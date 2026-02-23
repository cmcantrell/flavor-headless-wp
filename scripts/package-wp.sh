#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"

rm -rf "$DIST"
mkdir -p "$DIST"

echo "Packaging WordPress components..."

# Plugin
(cd "$ROOT/app/wp-content/plugins" && zip -r "$DIST/headless-core.zip" headless-core/)
echo "  -> dist/headless-core.zip ($(du -h "$DIST/headless-core.zip" | cut -f1))"

# WooCommerce plugin (optional)
if [ -d "$ROOT/app/wp-content/plugins/headless-woo" ]; then
  (cd "$ROOT/app/wp-content/plugins" && zip -r "$DIST/headless-woo.zip" headless-woo/)
  echo "  -> dist/headless-woo.zip ($(du -h "$DIST/headless-woo.zip" | cut -f1))"
fi

# Theme
(cd "$ROOT/app/wp-content/themes" && zip -r "$DIST/headless-theme.zip" headless-theme/)
echo "  -> dist/headless-theme.zip ($(du -h "$DIST/headless-theme.zip" | cut -f1))"

echo ""
echo "Done! Upload these zips via WordPress > Plugins/Themes > Add New > Upload."
