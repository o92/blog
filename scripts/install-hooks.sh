#!/usr/bin/env bash
# 兼容入口 → scripts/audit/install.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec bash "$ROOT/scripts/audit/install.sh" "$@"
