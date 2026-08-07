#!/usr/bin/env bash
# 轻量扫描：暂存一致性、产物、密钥文件名、冲突、密钥内容、JS、shellcheck
# 依赖 lib.sh；使用全局：ROOT STAGED TRACKED DIRTY_STAT SCAN_TMP AUDIT_FAIL
# shellcheck shell=bash

audit_scan() {
  local unstaged_touch mixed gr sr f path base bad
  local secret_re

  # 0 暂存与工作区一致性
  audit_step "1/8 暂存文件不得另有未暂存修改"
  if [[ -s "$STAGED" ]]; then
    unstaged_touch="$(mktemp)"
    mixed="$(mktemp)"
    git diff --name-only >"$unstaged_touch"
    git diff --name-only --diff-filter=U >>"$unstaged_touch" 2>/dev/null || true
    sort -u "$STAGED" -o "$STAGED.sorted"
    sort -u "$unstaged_touch" -o "$unstaged_touch"
    comm -12 "$STAGED.sorted" "$unstaged_touch" >"$mixed" || true
    if [[ -s "$mixed" ]]; then
      audit_crit "以下文件既已暂存又有未暂存修改；提交内容 ≠ 本次审计的工作区："
      cat "$mixed" >&2
      echo "$AUDIT_PREFIX Hint: git add 这些文件，或 git restore --staged / checkout 对齐后再提交" >&2
    fi
    rm -f "$unstaged_touch" "$mixed" "$STAGED.sorted"
  fi

  # 1 禁止跟踪产物
  audit_step "2/8 禁止跟踪 public/ node_modules/"
  if grep -qE '^(public/|node_modules/)' "$TRACKED"; then
    audit_crit "不应跟踪 public/ 或 node_modules/"
    grep -E '^(public/|node_modules/)' "$TRACKED" | head -20 >&2 || true
  fi

  # 2 可疑密钥文件名
  audit_step "3/8 可疑密钥文件名"
  scan_bad_name() {
    f="$1"
    bad=0
    [[ -z "$f" ]] && return 0
    base="$(basename "$f")"
    case "$f" in *.pem|*.p12|*.keystore) bad=1 ;; esac
    case "$base" in .env|.env.*|credentials|credentials.*|id_rsa|id_ed25519) bad=1 ;; esac
    if [[ "$f" == *.env || "$f" == */.env || "$f" == */.env.* ]]; then bad=1; fi
    if [[ "$bad" -eq 1 ]]; then
      audit_crit "可疑路径：$f"
    fi
  }
  while IFS= read -r f; do scan_bad_name "$f"; done <"$TRACKED"
  while IFS= read -r f; do
    [[ -z "$f" ]] && continue
    case "$f" in
      "?? "*) path="${f#?? }" ;;
      ??*) path="${f:3}" ;;
      *) continue ;;
    esac
    case "$path" in
      content/*|data/*|layouts/*|static/*|scripts/*|*.toml|*.yaml|*.yml|package.json|.env|.env.*)
        scan_bad_name "$path"
        ;;
    esac
  done <<<"$DIRTY_STAT"

  # 3 冲突 + 空白
  audit_step "4/8 冲突标记与空白"
  set +e
  git grep -nI -e '^<<<<<<< ' -e '^=======$' -e '^>>>>>>> ' -- \
    ':!public' ':!node_modules' \
    >"$SCAN_TMP/conflicts" 2>/dev/null
  gr=$?
  set -e
  if [[ $gr -eq 0 ]]; then
    audit_crit "跟踪文件中发现冲突标记"
    head -30 "$SCAN_TMP/conflicts" >&2 || true
  elif [[ $gr -gt 1 ]]; then
    audit_crit "git grep 冲突扫描异常 (exit=$gr)"
  fi
  set +e
  while IFS= read -r f; do
    [[ -f "$f" ]] || continue
    git ls-files --error-unmatch "$f" >/dev/null 2>&1 && continue
    if grep -nE '^<<<<<<< |^=======$|^>>>>>>> ' "$f" >/dev/null 2>&1; then
      {
        echo "$f"
        grep -nE '^<<<<<<< |^=======$|^>>>>>>> ' "$f" || true
      } >>"$SCAN_TMP/conflicts-untracked"
    fi
  done < <(find "$ROOT/content" "$ROOT/data" "$ROOT/layouts" "$ROOT/static" "$ROOT/scripts" \
    -type f 2>/dev/null)
  set -e
  if [[ -s "$SCAN_TMP/conflicts-untracked" ]]; then
    audit_crit "未跟踪文件中发现冲突标记"
    head -30 "$SCAN_TMP/conflicts-untracked" >&2 || true
  fi
  if ! git diff --check >/dev/null 2>&1; then
    audit_crit "git diff --check 失败（工作区）"
    git diff --check >&2 || true
  fi
  if [[ -s "$STAGED" ]] && ! git diff --cached --check >/dev/null 2>&1; then
    audit_crit "git diff --cached --check 失败（暂存区）"
    git diff --cached --check >&2 || true
  fi

  # 4 密钥内容
  audit_step "5/8 密钥/私钥内容扫描"
  secret_re='(AKIA[0-9A-Z]{16}|-----BEGIN (RSA |OPENSSH )?PRIVATE KEY-----|api[_-]?key[[:space:]]*[:=][[:space:]]['\''"][^'\''"]{16,})'
  set +e
  git grep -nIE "$secret_re" -- \
    ':!*.png' ':!*.jpg' ':!*.jpeg' ':!*.gif' ':!*.webp' ':!*.ico' \
    ':!*.woff' ':!*.woff2' ':!*.ttf' ':!*.eot' \
    ':!package-lock.json' ':!**/package-lock.json' \
    ':!public/**' ':!node_modules/**' \
    >"$SCAN_TMP/secrets" 2>/dev/null
  sr=$?
  set -e
  if [[ $sr -eq 0 ]]; then
    audit_crit "跟踪文件中疑似密钥/私钥"
    head -30 "$SCAN_TMP/secrets" >&2 || true
  elif [[ $sr -gt 1 ]]; then
    audit_crit "git grep 密钥扫描异常 (exit=$sr)"
  fi
  set +e
  while IFS= read -r f; do
    [[ -f "$f" ]] || continue
    git ls-files --error-unmatch "$f" >/dev/null 2>&1 && continue
    case "$f" in
      *.png|*.jpg|*.jpeg|*.gif|*.webp|*.ico|*.woff|*.woff2|*.ttf|*.eot|*.pdf) continue ;;
    esac
    if grep -nIE "$secret_re" "$f" >/dev/null 2>&1; then
      grep -nIE "$secret_re" "$f" >>"$SCAN_TMP/secrets-untracked" || true
    fi
  done < <(find "$ROOT/content" "$ROOT/data" "$ROOT/layouts" "$ROOT/static" "$ROOT/scripts" \
    -type f 2>/dev/null)
  set -e
  if [[ -s "$SCAN_TMP/secrets-untracked" ]]; then
    audit_crit "未跟踪文件中疑似密钥/私钥"
    head -30 "$SCAN_TMP/secrets-untracked" >&2 || true
  fi

  # 5 JS
  audit_step "6/8 JavaScript / 模块语法（node --check）"
  shopt -s nullglob 2>/dev/null || true
  for f in \
    "$ROOT"/static/js/*.js \
    "$ROOT"/scripts/*.mjs \
    "$ROOT"/scripts/*.js \
    "$ROOT"/scripts/audit/*.mjs \
    "$ROOT"/scripts/audit/*.js
  do
    [[ -f "$f" ]] || continue
    if ! node --check "$f"; then
      audit_crit "node --check 失败：${f#$ROOT/}"
    fi
  done

  # 6 shellcheck
  audit_step "7/8 shellcheck（若已安装）"
  if command -v shellcheck >/dev/null 2>&1; then
    if ! shellcheck -x \
      "$ROOT/scripts/audit/run.sh" \
      "$ROOT/scripts/audit/lib.sh" \
      "$ROOT/scripts/audit/scan.sh" \
      "$ROOT/scripts/audit/build.sh" \
      "$ROOT/scripts/audit/confirm.sh" \
      "$ROOT/scripts/audit/install.sh" \
      "$ROOT/scripts/audit/cursor-git" \
      "$ROOT/.githooks/pre-commit"
    then
      audit_crit "shellcheck 未通过"
    fi
  else
    audit_log "Warning: 未安装 shellcheck，跳过（brew install shellcheck）"
  fi
}
