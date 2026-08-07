#!/usr/bin/env bash
# 安装门禁：core.hooksPath + Cursor git.path 包装器
# shellcheck shell=bash
set -euo pipefail

AUDIT_HOME="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$AUDIT_HOME/../.." && pwd)"
cd "$ROOT"

chmod +x \
  "$AUDIT_HOME/run.sh" \
  "$AUDIT_HOME/lib.sh" \
  "$AUDIT_HOME/scan.sh" \
  "$AUDIT_HOME/build.sh" \
  "$AUDIT_HOME/confirm.sh" \
  "$AUDIT_HOME/install.sh" \
  "$AUDIT_HOME/cursor-git" \
  "$ROOT/.githooks/pre-commit" \
  "$ROOT/scripts/git-pre-commit-audit.sh" \
  "$AUDIT_HOME/deep.py"

# 入口始终走仓库内 .githooks（绝对路径，避免 cwd 问题）
git config core.hooksPath "$ROOT/.githooks"

mkdir -p "$ROOT/.git/hooks"
# 文档/排查用副本；真正生效的是 hooksPath
cat >"$ROOT/.git/hooks/pre-commit" <<EOF
#!/usr/bin/env bash
exec bash "$ROOT/.githooks/pre-commit"
EOF
chmod +x "$ROOT/.git/hooks/pre-commit"

# Cursor Source Control 可能静默 --no-verify
mkdir -p "$ROOT/.vscode"
VSCODE_SETTINGS="$ROOT/.vscode/settings.json"
WRAPPER_REL='${workspaceFolder}/scripts/audit/cursor-git'
if [[ -f "$VSCODE_SETTINGS" ]]; then
  python3 - "$VSCODE_SETTINGS" "$WRAPPER_REL" <<'PY'
import json, sys
from pathlib import Path
path, wrapper = Path(sys.argv[1]), sys.argv[2]
data = json.loads(path.read_text() or "{}")
if data.get("git.path") != wrapper:
    data["git.path"] = wrapper
    path.write_text(json.dumps(data, indent=2) + "\n")
    print(f"updated git.path -> {wrapper}")
else:
    print(f"git.path already {wrapper}")
PY
else
  printf '%s\n' "{" "  \"git.path\": \"$WRAPPER_REL\"" "}" >"$VSCODE_SETTINGS"
  echo "wrote $VSCODE_SETTINGS"
fi

# 兼容旧路径：scripts/cursor-git → audit/cursor-git
if [[ -e "$ROOT/scripts/cursor-git" || -L "$ROOT/scripts/cursor-git" ]]; then
  rm -f "$ROOT/scripts/cursor-git"
fi
ln -s audit/cursor-git "$ROOT/scripts/cursor-git"

echo "core.hooksPath=$(git config --get core.hooksPath)"
echo "git.path -> $WRAPPER_REL"
echo "下一步：Command Palette → Developer: Reload Window"
