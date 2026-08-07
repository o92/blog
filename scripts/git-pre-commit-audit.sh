#!/usr/bin/env bash
# 兼容入口 → scripts/audit/run.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec bash "$ROOT/scripts/audit/run.sh" "$@"
