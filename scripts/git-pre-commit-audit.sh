#!/usr/bin/env bash
# Cursor SCM Commit / git commit 前：轻量审计 + macOS 二次确认
# 安装：npm run hooks:install
# 跳过（应急）：SKIP_COMMIT_AUDIT=1 git commit ...
# 兼容 macOS /bin/bash 3.2（无 mapfile）
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

if [[ "${SKIP_COMMIT_AUDIT:-}" == "1" ]]; then
  echo "[pre-commit] SKIP_COMMIT_AUDIT=1 — 已跳过审计与确认"
  exit 0
fi

STAGED_FILE="$(mktemp)"
trap 'rm -f "$STAGED_FILE"' EXIT
git diff --cached --name-only >"$STAGED_FILE"
if [[ ! -s "$STAGED_FILE" ]]; then
  exit 0
fi

COUNT="$(wc -l <"$STAGED_FILE" | tr -d ' ')"
echo "[pre-commit] 审计暂存变更（${COUNT} 个路径）…"

# —— 1) 可疑文件名 ——
while IFS= read -r f; do
  [[ -z "$f" ]] && continue
  base="$(basename "$f")"
  case "$f" in
    *.pem|*.p12|*.keystore) echo "[pre-commit] Critical: 拒绝提交可疑路径：$f" >&2; exit 1 ;;
  esac
  case "$base" in
    .env|.env.*|credentials|credentials.*|id_rsa|id_ed25519)
      echo "[pre-commit] Critical: 拒绝提交可疑路径：$f" >&2
      exit 1
      ;;
  esac
  if [[ "$f" == *.env || "$f" == */.env || "$f" == */.env.* ]]; then
    echo "[pre-commit] Critical: 拒绝提交可疑路径：$f" >&2
    exit 1
  fi
done <"$STAGED_FILE"

# —— 2) 冲突标记 / 空白错误 ——
if ! git diff --cached --check; then
  echo "[pre-commit] Critical: git diff --cached --check 未通过" >&2
  exit 1
fi

# —— 3) 暂存区里搜高危字样（仅本次 staged diff） ——
SECRET_RE='(AKIA[0-9A-Z]{16}|-----BEGIN (RSA |OPENSSH )?PRIVATE KEY-----|api[_-]?key[[:space:]]*[:=][[:space:]]*['\''"][^'\''"]{16,})'
if git diff --cached -U0 | grep -Eiq "$SECRET_RE"; then
  echo "[pre-commit] Critical: 暂存 diff 疑似含密钥/私钥" >&2
  git diff --cached -U0 | grep -Ein "$SECRET_RE" | head -20 >&2 || true
  exit 1
fi

# —— 4) glossary source 文件是否存在 ——
if grep -qE '^data/glossary/.*\.ya?ml$' "$STAGED_FILE"; then
  echo "[pre-commit] 检查 glossary source 路径…"
  python3 - <<'PY'
import re, sys
from pathlib import Path
root = Path(".")
missing = []
for p in root.glob("data/glossary/*.yaml"):
    text = p.read_text(encoding="utf-8")
    for m in re.finditer(r'^\s*source:\s*["\']?([^"\'\n#]+)', text, re.M):
        file_part = m.group(1).strip().split("#", 1)[0].strip()
        if not file_part:
            continue
        candidates = [
            root / "content" / file_part,
            root / "content" / (file_part + ".md"),
            root / "content" / (file_part + ".markdown"),
        ]
        if not any(c.is_file() for c in candidates):
            missing.append(f"{p}: {file_part}")
if missing:
    print("[pre-commit] Critical: glossary source 文件不存在:", file=sys.stderr)
    for x in missing:
        print("  -", x, file=sys.stderr)
    sys.exit(1)
PY
fi

# —— 5) 汇总报告 ——
STAT="$(git diff --cached --stat)"
FILE_LIST="$(head -n 40 "$STAGED_FILE")"
if [[ "$COUNT" -gt 40 ]]; then
  FILE_LIST="${FILE_LIST}
…"
fi

REPORT="$ROOT/.git/last-pre-commit-audit.txt"
{
  echo "time: $(date '+%Y-%m-%d %H:%M:%S')"
  echo "branch: $(git rev-parse --abbrev-ref HEAD)"
  echo
  echo "## staged files"
  cat "$STAGED_FILE"
  echo
  echo "## stat"
  git diff --cached --stat
} >"$REPORT"
echo "[pre-commit] 报告已写入 .git/last-pre-commit-audit.txt"

# —— 6) macOS 二次确认 ——
if [[ "$(uname -s)" == "Darwin" ]]; then
  AS_BODY="$(printf '%s\n' "$FILE_LIST" | python3 -c 'import sys; print(sys.stdin.read().replace("\\","\\\\").replace("\"","\\\"")[:1800])')"
  AS_STAT="$(printf '%s\n' "$STAT" | python3 -c 'import sys; print(sys.stdin.read().replace("\\","\\\\").replace("\"","\\\"")[:800])')"
  set +e
  osascript <<APPLESCRIPT
set theFiles to "$AS_BODY"
set theStat to "$AS_STAT"
set msg to "已通过基础审计。确认提交这些变更？" & return & return & theStat & return & return & theFiles & return & return & "完整报告：.git/last-pre-commit-audit.txt"
try
  display dialog msg buttons {"取消", "确认提交"} default button "确认提交" cancel button "取消" with title "Commit 二次确认" with icon caution
on error number -128
  error "user cancelled" number 1
end try
APPLESCRIPT
  rc=$?
  set -e
  if [[ $rc -ne 0 ]]; then
    echo "[pre-commit] 已取消提交（未确认）" >&2
    exit 1
  fi
else
  echo "[pre-commit] 非 macOS：需设置 CONFIRM_COMMIT=1 才能继续" >&2
  if [[ "${CONFIRM_COMMIT:-}" != "1" ]]; then
    exit 1
  fi
fi

echo "[pre-commit] 审计通过，继续 commit"
exit 0
