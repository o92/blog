#!/usr/bin/env bash
# 兼容旧路径 → scripts/audit/run.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec bash "$ROOT/scripts/audit/run.sh" "$@"
