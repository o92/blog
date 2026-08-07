#!/usr/bin/env bash
# 全库深度审计编排
# 用法：
#   scripts/audit/run.sh              # 只审计，不弹确认（本地试跑 / CI）
#   scripts/audit/run.sh --commit     # 审计 + 二次确认（git pre-commit）
#   SKIP_COMMIT_AUDIT=1 …             # 整段跳过
# shellcheck shell=bash
set -euo pipefail

AUDIT_HOME="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib.sh
source "$AUDIT_HOME/lib.sh"
# shellcheck source=scan.sh
source "$AUDIT_HOME/scan.sh"
# shellcheck source=build.sh
source "$AUDIT_HOME/build.sh"
# shellcheck source=confirm.sh
source "$AUDIT_HOME/confirm.sh"

WANT_CONFIRM=0
for a in "$@"; do
  case "$a" in
    --commit) WANT_CONFIRM=1 ;;
    --help|-h)
      cat <<'EOF'
Usage: scripts/audit/run.sh [--commit]

  (default)   全库审计，通过即退出 0（不弹窗）
  --commit    审计通过后二次确认（供 .githooks/pre-commit）

Env:
  SKIP_COMMIT_AUDIT=1   跳过全部
  CONFIRM_COMMIT=1      非 macOS 下 --commit 时必须设置
  AUDIT_HUGO_BASEURL    默认 https://o92.github.io/blog/
EOF
      exit 0
      ;;
  esac
done

audit_export_path

if [[ "${SKIP_COMMIT_AUDIT:-}" == "1" ]]; then
  audit_log "SKIP_COMMIT_AUDIT=1 — 已跳过"
  exit 0
fi

ROOT="$(audit_resolve_root "$AUDIT_HOME")"
cd "$ROOT"
audit_hook_log "$ROOT"

audit_need hugo
audit_need node
audit_need python3
if ! python3 -c 'import yaml' 2>/dev/null; then
  echo "$AUDIT_PREFIX Critical: python3 缺少 PyYAML。请执行: pip3 install pyyaml" >&2
  exit 1
fi
if [[ ! -f "$AUDIT_HOME/deep.py" || ! -f "$AUDIT_HOME/html.mjs" ]]; then
  echo "$AUDIT_PREFIX Critical: 缺少 scripts/audit/{deep.py,html.mjs}" >&2
  exit 1
fi

PAGES_BASEURL="${AUDIT_HUGO_BASEURL:-https://o92.github.io/blog/}"
STAGED="$(mktemp)"
TRACKED="$(mktemp)"
BUILD_LOG="$(mktemp)"
SCAN_TMP="$(mktemp -d)"
AUDIT_FAIL=0
BUILD_RC=1
trap 'rm -f "$STAGED" "$TRACKED" "$BUILD_LOG"; rm -rf "$SCAN_TMP"' EXIT

git diff --cached --name-only >"$STAGED"
git ls-files >"$TRACKED"
DIRTY_STAT="$(git status --short 2>/dev/null || true)"
STAGED_COUNT="$(wc -l <"$STAGED" | tr -d ' ')"
TRACKED_COUNT="$(wc -l <"$TRACKED" | tr -d ' ')"
PAGES_BASEPATH="$(python3 -c 'import sys; from urllib.parse import urlparse; p=urlparse(sys.argv[1]).path.rstrip("/"); print(p or "")' "$PAGES_BASEURL")"

audit_log "========== 全库深度审计（工作区） =========="
audit_log "root=$ROOT"
audit_log "跟踪文件 ${TRACKED_COUNT} · 本次暂存 ${STAGED_COUNT}"
if [[ -n "$DIRTY_STAT" ]]; then
  audit_log "工作区有未提交改动（结构/构建以磁盘工作区为准）"
fi

audit_scan
audit_build
audit_write_report

if [[ "$AUDIT_FAIL" -ne 0 ]]; then
  echo "$AUDIT_PREFIX ========== 全库审计失败，已中止 ==========" >&2
  exit 1
fi

if [[ "$WANT_CONFIRM" -eq 1 ]]; then
  if ! audit_confirm_commit; then
    exit 1
  fi
  audit_log "========== 全库审计通过，继续 commit =========="
else
  audit_log "========== 全库审计通过 =========="
fi
exit 0
