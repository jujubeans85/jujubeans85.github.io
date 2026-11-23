#!/bin/bash
set -euo pipefail
cd -- "$(dirname -- "$0")"
if ! xcodebuild -version >/dev/null 2>&1; then
  echo 'Install and open Xcode first, then run this launcher again.'
  read -r -p 'Press Return to close. '
  exit 1
fi
if ! command -v xcodegen >/dev/null 2>&1; then
  echo 'XcodeGen is required. Install with: brew install xcodegen'
  read -r -p 'Press Return to close. '
  exit 1
fi
xcodegen generate
open DjayKept.xcodeproj
