#!/usr/bin/env bash
# deep.py + 临时目录 hugo/glossary-inject + html.mjs
# 依赖：ROOT AUDIT_HOME PAGES_BASEURL PAGES_BASEPATH SCAN_TMP BUILD_LOG
# 产出：AUDIT_PUBLIC、BUILD_RC；可能置 AUDIT_FAIL=1
# shellcheck shell=bash

audit_build() {
  local br

  audit_step "8/8 结构一致性 + 临时构建 + HTML"
  if ! python3 "$AUDIT_HOME/deep.py" --root "$ROOT"; then
    AUDIT_FAIL=1
  fi

  if [[ ! -d "$ROOT/node_modules" ]]; then
    audit_log "npm ci（缺少 node_modules）…"
    npm ci --ignore-scripts
  fi

  AUDIT_PUBLIC="$SCAN_TMP/public-audit"
  rm -rf "$AUDIT_PUBLIC"
  audit_log "构建到临时目录（不触碰本地 public/）：$AUDIT_PUBLIC"
  set +e
  (
    set -e
    export HUGO_ENVIRONMENT=production
    export HUGO_BASEURL="$PAGES_BASEURL"
    hugo --gc --minify --printPathWarnings --cleanDestinationDir -d "$AUDIT_PUBLIC"
    export GLOSSARY_PUBLIC_DIR="$AUDIT_PUBLIC"
    node "$ROOT/scripts/glossary-inject.mjs" --public-dir="$AUDIT_PUBLIC"
  ) >"$BUILD_LOG" 2>&1
  br=$?
  set -e
  BUILD_RC=$br
  tail -n 40 "$BUILD_LOG" || true

  if [[ $br -ne 0 ]]; then
    audit_crit "临时目录构建 / glossary-inject 失败"
  fi
  if grep -Eq '\[glossary\] source file not found|\[glossary\] heading not found|\[glossary\] skip invalid entry|\[glossary\] alias collision|\[glossary\] unexpected no content root' "$BUILD_LOG"; then
    audit_crit "glossary-inject 报告错误"
    grep -E '\[glossary\] (source file not found|heading not found|skip invalid entry|alias collision|unexpected no content root)' "$BUILD_LOG" >&2 || true
  fi
  if grep -Eqi 'ERROR|fatal' "$BUILD_LOG" 2>/dev/null \
    || grep -Eqi 'WARN.*(Ref|ref\.|link|page not found|Path Warning)' "$BUILD_LOG" 2>/dev/null; then
    audit_crit "Hugo path/link 告警"
    grep -Ei 'ERROR|fatal|WARN.*(Ref|ref\.|link|page not found|Path Warning)' "$BUILD_LOG" | head -40 >&2 || true
  fi

  if [[ $br -eq 0 ]]; then
    if ! node "$AUDIT_HOME/html.mjs" "$AUDIT_PUBLIC" --base-path="$PAGES_BASEPATH" --skip-pagefind; then
      AUDIT_FAIL=1
    fi
  else
    audit_log "跳过 HTML 审计（构建未成功）"
  fi
}

audit_write_report() {
  local report="$ROOT/.git/last-pre-commit-audit.txt"
  {
    echo "time: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "branch: $(git rev-parse --abbrev-ref HEAD)"
    echo "scope: full worktree + hugo(temp public-audit) + glossary-inject + html audit"
    echo "baseURL: $PAGES_BASEURL"
    echo "basePath: ${PAGES_BASEPATH:-"(root)"}"
    echo "tracked_files: $TRACKED_COUNT"
    echo "staged_paths: $STAGED_COUNT"
    echo "result: $([[ "$AUDIT_FAIL" -eq 0 ]] && echo PASS || echo FAIL)"
    echo "hugo: $(hugo version 2>/dev/null || true)"
    echo "node: $(node -v 2>/dev/null || true)"
    echo
    echo "## git status --short"
    if [[ -n "$DIRTY_STAT" ]]; then printf '%s\n' "$DIRTY_STAT"; else echo "(clean)"; fi
    echo
    echo "## staged files"
    if [[ -s "$STAGED" ]]; then cat "$STAGED"; else echo "(none)"; fi
    echo
    echo "## staged stat"
    git diff --cached --stat || true
    echo
    echo "## build log (tail)"
    tail -n 100 "$BUILD_LOG" || true
  } >"$report"
  cp "$BUILD_LOG" "$ROOT/.git/last-pre-commit-build.log" 2>/dev/null || true
  audit_log "报告：$report"
  audit_log "构建日志：$ROOT/.git/last-pre-commit-build.log"
}
