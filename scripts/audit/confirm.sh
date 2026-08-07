#!/usr/bin/env bash
# macOS / 非 Darwin 提交前二次确认。依赖：STAGED、STAGED_COUNT 已设置；ROOT 已 cd。
# shellcheck shell=bash

audit_confirm_commit() {
  local stat file_list as_body as_stat rc
  stat="$(git diff --cached --stat 2>/dev/null || true)"
  file_list="$(head -n 40 "$STAGED")"
  if [[ "${STAGED_COUNT:-0}" -gt 40 ]]; then
    file_list="${file_list}"$'\n…'
  fi
  if [[ ! -s "$STAGED" ]]; then
    file_list="（无暂存）"
    stat="（无暂存）"
  fi

  if [[ "$(uname -s)" == "Darwin" ]]; then
    as_body="$(printf '%s\n' "$file_list" | python3 -c 'import sys; print(sys.stdin.read().replace("\\","\\\\").replace("\"","\\\"")[:1800])')"
    as_stat="$(printf '%s\n' "$stat" | python3 -c 'import sys; print(sys.stdin.read().replace("\\","\\\\").replace("\"","\\\"")[:800])')"
    set +e
    osascript <<APPLESCRIPT
set theFiles to "$as_body"
set theStat to "$as_stat"
set msg to "全库工作区深度审计已通过（含完整构建 + HTML）。确认提交本次暂存？" & return & return & "【本次暂存】" & return & theStat & return & return & theFiles & return & return & "报告：.git/last-pre-commit-audit.txt"
try
  display dialog msg buttons {"取消", "确认提交"} default button "确认提交" cancel button "取消" with title "Commit 二次确认" with icon caution
on error number -128
  error "user cancelled" number 1
end try
APPLESCRIPT
    rc=$?
    set -e
    if [[ $rc -ne 0 ]]; then
      audit_log "已取消提交" >&2
      return 1
    fi
    return 0
  fi

  if [[ "${CONFIRM_COMMIT:-}" == "1" ]]; then
    return 0
  fi
  echo "$AUDIT_PREFIX 非 macOS：设置 CONFIRM_COMMIT=1 以确认" >&2
  return 1
}
