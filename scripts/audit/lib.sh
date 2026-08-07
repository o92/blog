#!/usr/bin/env bash
# 审计公共库（bash 3.2）。由 run.sh / install.sh source，不要直接执行。
# shellcheck shell=bash

AUDIT_PREFIX="${AUDIT_PREFIX:-[audit]}"
AUDIT_FAIL="${AUDIT_FAIL:-0}"

audit_log()  { echo "$AUDIT_PREFIX $*"; }
audit_crit() { echo "$AUDIT_PREFIX Critical: $*" >&2; AUDIT_FAIL=1; }
audit_step() { echo "$AUDIT_PREFIX --- $* ---"; }

audit_need() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "$AUDIT_PREFIX Critical: 未安装 $1" >&2
    exit 1
  fi
}

audit_resolve_root() {
  local home="$1" root=""
  root="$(git -C "$home" rev-parse --show-toplevel 2>/dev/null || true)"
  if [[ -z "${root:-}" ]]; then
    root="$(cd "$home/../.." && pwd)"
  fi
  printf '%s' "$root"
}

audit_hook_log() {
  # 每次真正进审计写一行，用于判断 Cursor 是否绕过了 hook
  local root="$1"
  mkdir -p "$root/.git" 2>/dev/null || true
  printf '%s\thost=%s\tpwd=%s\tpath_has_hugo=%s\n' \
    "$(date '+%Y-%m-%d %H:%M:%S')" \
    "$(uname -n 2>/dev/null || echo unknown)" \
    "${PWD:-}" \
    "$(command -v hugo >/dev/null && echo yes || echo no)" \
    >>"$root/.git/hook-invocations.log" 2>/dev/null || true
}

audit_export_path() {
  # Cursor Source Control 的 PATH 往往很瘦
  export PATH="${HOME}/.proto/shims:${HOME}/.proto/bin:/opt/local/bin:/opt/homebrew/bin:/usr/local/bin:${PATH}"
}
