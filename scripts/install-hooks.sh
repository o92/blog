#!/usr/bin/env bash
# 安装 pre-commit：绝对 hooksPath + 同步一份到 .git/hooks（兼容个别 UI 路径）
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

chmod +x \
  "$ROOT/.githooks/pre-commit" \
  "$ROOT/scripts/audit/run.sh" \
  "$ROOT/scripts/git-pre-commit-audit.sh" \
  "$ROOT/scripts/audit/deep.py" \
  "$ROOT/scripts/install-hooks.sh"

# 绝对路径，避免多根工作区 / 异常 cwd 下相对 .githooks 解析失败
git config core.hooksPath "$ROOT/.githooks"

# 双保险：标准位置也放一份（仅当未设置 hooksPath 时 git 才会用到；保留便于排查）
mkdir -p "$ROOT/.git/hooks"
cp "$ROOT/.githooks/pre-commit" "$ROOT/.git/hooks/pre-commit"
chmod +x "$ROOT/.git/hooks/pre-commit"

echo "core.hooksPath=$(git config --get core.hooksPath)"
echo "also: .git/hooks/pre-commit"
