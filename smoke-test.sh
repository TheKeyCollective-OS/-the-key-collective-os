#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
find "$ROOT/js" -name '*.js' -print0 | while IFS= read -r -d '' f; do node --check "$f"; done
test -f "$ROOT/index.html"
test -f "$ROOT/docs/FEATURE_REGISTRY.md"
test -f "$ROOT/docs/REGRESSION_CHECKLIST.md"
grep -q 'menuScrim' "$ROOT/index.html"
grep -q "menuScrim.*onclick" "$ROOT/js/app.js"
grep -q 'Monthly Agenda' "$ROOT/js/features/pages.js"
grep -q 'Living Photo Collage' "$ROOT/js/features/pages.js"
echo 'Static smoke tests passed.'
