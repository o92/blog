#!/usr/bin/env bash
# 全库深度审计（磁盘工作区）+ macOS 二次确认
# 入口：.githooks/pre-commit → 本脚本
# 跳过：SKIP_COMMIT_AUDIT=1
# 试跑：npm run audit
# 兼容 macOS /bin/bash 3.2
set -euo pipefail

AUDIT_HOME="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(git -C "$AUDIT_HOME" rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "${ROOT:-}" ]]; then
  ROOT="$(cd "$AUDIT_HOME/../.." && pwd)"
fi
cd "$ROOT"

PREFIX="[audit]"
FAIL=0
PAGES_BASEURL="${AUDIT_HUGO_BASEURL:-https://o92.github.io/blog/}"

log()  { echo "$PREFIX $*"; }
crit() { echo "$PREFIX Critical: $*" >&2; FAIL=1; }
step() { echo "$PREFIX --- $* ---"; }

if [[ "${SKIP_COMMIT_AUDIT:-}" == "1" ]]; then
  log "SKIP_COMMIT_AUDIT=1 — 已跳过"
  exit 0
fi

need() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "$PREFIX Critical: 未安装 $1" >&2
    exit 1
  fi
}
need hugo
need node
need python3
if ! python3 -c 'import yaml' 2>/dev/null; then
  echo "$PREFIX Critical: python3 缺少 PyYAML。请执行: pip3 install pyyaml" >&2
  exit 1
fi
if [[ ! -f "$AUDIT_HOME/deep.py" || ! -f "$AUDIT_HOME/html.mjs" ]]; then
  echo "$PREFIX Critical: 缺少 scripts/audit/{deep.py,html.mjs}" >&2
  exit 1
fi

STAGED="$(mktemp)"
TRACKED="$(mktemp)"
BUILD_LOG="$(mktemp)"
SCAN_TMP="$(mktemp -d)"
trap 'rm -f "$STAGED" "$TRACKED" "$BUILD_LOG"; rm -rf "$SCAN_TMP"' EXIT

git diff --cached --name-only >"$STAGED"
git ls-files >"$TRACKED"
DIRTY_STAT="$(git status --short 2>/dev/null || true)"
STAGED_COUNT="$(wc -l <"$STAGED" | tr -d ' ')"
TRACKED_COUNT="$(wc -l <"$TRACKED" | tr -d ' ')"
PAGES_BASEPATH="$(python3 -c 'import sys; from urllib.parse import urlparse; p=urlparse(sys.argv[1]).path.rstrip("/"); print(p or "")' "$PAGES_BASEURL")"

log "========== 全库深度审计（工作区） =========="
log "root=$ROOT"
log "跟踪文件 ${TRACKED_COUNT} · 本次暂存 ${STAGED_COUNT}"
if [[ -n "$DIRTY_STAT" ]]; then
  log "工作区有未提交改动（结构/构建以磁盘工作区为准）"
fi

# —— 0 暂存与工作区一致性（避免「工作区修好、提交仍是坏的」） ——
step "0/11 暂存文件不得另有未暂存修改"
if [[ -s "$STAGED" ]]; then
  UNSTAGED_TOUCH="$(mktemp)"
  git diff --name-only >"$UNSTAGED_TOUCH"
  git diff --name-only --diff-filter=U >>"$UNSTAGED_TOUCH" 2>/dev/null || true
  MIXED="$(mktemp)"
  # 交集：已暂存但仍有工作区未暂存 diff
  sort -u "$STAGED" -o "$STAGED.sorted"
  sort -u "$UNSTAGED_TOUCH" -o "$UNSTAGED_TOUCH"
  comm -12 "$STAGED.sorted" "$UNSTAGED_TOUCH" >"$MIXED" || true
  if [[ -s "$MIXED" ]]; then
    crit "以下文件既已暂存又有未暂存修改；提交内容 ≠ 本次审计的工作区："
    cat "$MIXED" >&2
    echo "$PREFIX Hint: git add 这些文件，或 git restore --staged / checkout 对齐后再提交" >&2
  fi
  rm -f "$UNSTAGED_TOUCH" "$MIXED" "$STAGED.sorted"
fi

# —— 1 禁止跟踪产物 ——
step "1/11 禁止跟踪 public/ node_modules/"
if grep -qE '^(public/|node_modules/)' "$TRACKED"; then
  crit "不应跟踪 public/ 或 node_modules/"
  grep -E '^(public/|node_modules/)' "$TRACKED" | head -20 >&2 || true
fi

# —— 2 可疑密钥文件名 ——
step "2/11 可疑密钥文件名"
scan_bad_name() {
  local f="$1" base bad=0
  [[ -z "$f" ]] && return 0
  base="$(basename "$f")"
  case "$f" in *.pem|*.p12|*.keystore) bad=1 ;; esac
  case "$base" in .env|.env.*|credentials|credentials.*|id_rsa|id_ed25519) bad=1 ;; esac
  if [[ "$f" == *.env || "$f" == */.env || "$f" == */.env.* ]]; then bad=1; fi
  if [[ "$bad" -eq 1 ]]; then
    crit "可疑路径：$f"
  fi
}
while IFS= read -r f; do scan_bad_name "$f"; done <"$TRACKED"
while IFS= read -r f; do
  [[ -z "$f" ]] && continue
  # 仅未跟踪 ??
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

# —— 3 冲突标记 + 空白 ——
step "3/11 冲突标记与空白"
set +e
git grep -nI -e '^<<<<<<< ' -e '^=======$' -e '^>>>>>>> ' -- \
  ':!public' ':!node_modules' \
  >"$SCAN_TMP/conflicts" 2>/dev/null
gr=$?
set -e
if [[ $gr -eq 0 ]]; then
  crit "跟踪文件中发现冲突标记"
  head -30 "$SCAN_TMP/conflicts" >&2 || true
elif [[ $gr -gt 1 ]]; then
  crit "git grep 冲突扫描异常 (exit=$gr)"
fi
# 未跟踪源码也扫冲突（git grep 默认不看 untracked）
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
  crit "未跟踪文件中发现冲突标记"
  head -30 "$SCAN_TMP/conflicts-untracked" >&2 || true
fi

if ! git diff --check >/dev/null 2>&1; then
  crit "git diff --check 失败（工作区）"
  git diff --check >&2 || true
fi
if [[ -s "$STAGED" ]] && ! git diff --cached --check >/dev/null 2>&1; then
  crit "git diff --cached --check 失败（暂存区）"
  git diff --cached --check >&2 || true
fi

# —— 4 密钥内容（跟踪 + 未跟踪源码） ——
step "4/11 密钥/私钥内容扫描"
SECRET_RE='(AKIA[0-9A-Z]{16}|-----BEGIN (RSA |OPENSSH )?PRIVATE KEY-----|api[_-]?key[[:space:]]*[:=][[:space:]]['\''"][^'\''"]{16,})'
set +e
git grep -nIE "$SECRET_RE" -- \
  ':!*.png' ':!*.jpg' ':!*.jpeg' ':!*.gif' ':!*.webp' ':!*.ico' \
  ':!*.woff' ':!*.woff2' ':!*.ttf' ':!*.eot' \
  ':!package-lock.json' ':!**/package-lock.json' \
  ':!public/**' ':!node_modules/**' \
  >"$SCAN_TMP/secrets" 2>/dev/null
sr=$?
set -e
if [[ $sr -eq 0 ]]; then
  crit "跟踪文件中疑似密钥/私钥"
  head -30 "$SCAN_TMP/secrets" >&2 || true
elif [[ $sr -gt 1 ]]; then
  crit "git grep 密钥扫描异常 (exit=$sr)"
fi
set +e
# 仅未跟踪文本；排除二进制扩展名
while IFS= read -r f; do
  [[ -f "$f" ]] || continue
  git ls-files --error-unmatch "$f" >/dev/null 2>&1 && continue
  case "$f" in
    *.png|*.jpg|*.jpeg|*.gif|*.webp|*.ico|*.woff|*.woff2|*.ttf|*.eot|*.pdf) continue ;;
  esac
  if grep -nIE "$SECRET_RE" "$f" >/dev/null 2>&1; then
    grep -nIE "$SECRET_RE" "$f" >>"$SCAN_TMP/secrets-untracked" || true
  fi
done < <(find "$ROOT/content" "$ROOT/data" "$ROOT/layouts" "$ROOT/static" "$ROOT/scripts" \
  -type f 2>/dev/null)
set -e
if [[ -s "$SCAN_TMP/secrets-untracked" ]]; then
  crit "未跟踪文件中疑似密钥/私钥"
  head -30 "$SCAN_TMP/secrets-untracked" >&2 || true
fi

# —— 5 JS 语法 ——
step "5/11 JavaScript / 模块语法（node --check）"
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
    crit "node --check 失败：${f#$ROOT/}"
  fi
done

# —— 6 shellcheck ——
step "6/11 shellcheck（若已安装）"
if command -v shellcheck >/dev/null 2>&1; then
  if ! shellcheck -x \
    "$ROOT/scripts/audit/run.sh" \
    "$ROOT/.githooks/pre-commit" \
    "$ROOT/scripts/git-pre-commit-audit.sh"
  then
    crit "shellcheck 未通过"
  fi
else
  log "Warning: 未安装 shellcheck，跳过（brew install shellcheck）"
fi

# —— 7 Python 深度 ——
step "7/11 结构与内容一致性（Python · 工作区）"
if ! python3 "$AUDIT_HOME/deep.py" --root "$ROOT"; then
  FAIL=1
fi

# —— 8 完整生产构建 ——
step "8/11 完整构建 hugo + glossary-inject + pagefind"
if [[ ! -d "$ROOT/node_modules" ]]; then
  log "npm ci（缺少 node_modules）…"
  npm ci --ignore-scripts
fi
log "清理 public/（避免旧产物污染）…"
rm -rf "$ROOT/public"
set +e
(
  export HUGO_ENVIRONMENT=production
  export HUGO_BASEURL="$PAGES_BASEURL"
  npm run build
) >"$BUILD_LOG" 2>&1
br=$?
set -e
tail -n 40 "$BUILD_LOG" || true
if [[ $br -ne 0 ]]; then
  crit "npm run build 失败"
fi
if grep -Eq '\[glossary\] source file not found|\[glossary\] heading not found|\[glossary\] skip invalid entry|\[glossary\] alias collision|\[glossary\] unexpected no content root' "$BUILD_LOG"; then
  crit "glossary-inject 报告错误"
  grep -E '\[glossary\] (source file not found|heading not found|skip invalid entry|alias collision|unexpected no content root)' "$BUILD_LOG" >&2 || true
fi

# —— 9 HTML 产物审计 ——
step "9/11 构建产物 HTML 审计"
if [[ $br -eq 0 ]]; then
  # 必须显式传 base-path（含空字符串），避免 html.mjs 误用默认 /blog
  if ! node "$AUDIT_HOME/html.mjs" "$ROOT/public" --base-path="$PAGES_BASEPATH"; then
    FAIL=1
  fi
else
  log "跳过 HTML 审计（构建未成功）"
fi

# —— 10 Hugo path warnings（写到临时目录，禁止覆盖已 inject 的 public/） ——
step "10/11 Hugo printPathWarnings（独立 destination）"
if [[ $br -eq 0 ]]; then
  PATHWARN_DEST="$SCAN_TMP/hugo-pathwarn-out"
  mkdir -p "$PATHWARN_DEST"
  set +e
  (
    export HUGO_ENVIRONMENT=production
    export HUGO_BASEURL="$PAGES_BASEURL"
    hugo --gc --minify --printPathWarnings --cleanDestinationDir -d "$PATHWARN_DEST" \
      >"$SCAN_TMP/hugo-pathwarn" 2>&1
  )
  hw=$?
  set -e
  if [[ $hw -ne 0 ]]; then
    crit "hugo --printPathWarnings 失败"
    tail -40 "$SCAN_TMP/hugo-pathwarn" >&2 || true
  fi
  if grep -Eqi 'ERROR|fatal' "$SCAN_TMP/hugo-pathwarn" 2>/dev/null \
    || grep -Eqi 'WARN.*(Ref|ref\.|link|page not found|Path Warning)' "$SCAN_TMP/hugo-pathwarn" 2>/dev/null; then
    crit "Hugo path/link 告警"
    grep -Ei 'ERROR|fatal|WARN.*(Ref|ref\.|link|page not found|Path Warning)' "$SCAN_TMP/hugo-pathwarn" | head -40 >&2 || true
  fi
fi

# —— 11 报告 ——
step "11/11 写报告"
REPORT="$ROOT/.git/last-pre-commit-audit.txt"
{
  echo "time: $(date '+%Y-%m-%d %H:%M:%S')"
  echo "branch: $(git rev-parse --abbrev-ref HEAD)"
  echo "scope: full worktree + npm run build + html audit"
  echo "baseURL: $PAGES_BASEURL"
  echo "basePath: ${PAGES_BASEPATH:-"(root)"}"
  echo "tracked_files: $TRACKED_COUNT"
  echo "staged_paths: $STAGED_COUNT"
  echo "result: $([[ "$FAIL" -eq 0 ]] && echo PASS || echo FAIL)"
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
} >"$REPORT"
cp "$BUILD_LOG" "$ROOT/.git/last-pre-commit-build.log" 2>/dev/null || true
log "报告：$REPORT"
log "构建日志：$ROOT/.git/last-pre-commit-build.log"

if [[ "$FAIL" -ne 0 ]]; then
  echo "$PREFIX ========== 全库审计失败，已中止 commit ==========" >&2
  exit 1
fi

STAT="$(git diff --cached --stat 2>/dev/null || true)"
FILE_LIST="$(head -n 40 "$STAGED")"
if [[ "${STAGED_COUNT:-0}" -gt 40 ]]; then FILE_LIST="${FILE_LIST}"$'\n…'; fi
[[ -s "$STAGED" ]] || { FILE_LIST="（无暂存）"; STAT="（无暂存）"; }

if [[ "$(uname -s)" == "Darwin" ]]; then
  AS_BODY="$(printf '%s\n' "$FILE_LIST" | python3 -c 'import sys; print(sys.stdin.read().replace("\\","\\\\").replace("\"","\\\"")[:1800])')"
  AS_STAT="$(printf '%s\n' "$STAT" | python3 -c 'import sys; print(sys.stdin.read().replace("\\","\\\\").replace("\"","\\\"")[:800])')"
  set +e
  osascript <<APPLESCRIPT
set theFiles to "$AS_BODY"
set theStat to "$AS_STAT"
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
    echo "$PREFIX 已取消提交" >&2
    exit 1
  fi
else
  if [[ "${CONFIRM_COMMIT:-}" != "1" ]]; then
    echo "$PREFIX 非 macOS：设置 CONFIRM_COMMIT=1 以确认" >&2
    exit 1
  fi
fi

log "========== 全库审计通过，继续 commit =========="
exit 0
