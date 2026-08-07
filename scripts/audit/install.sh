#!/usr/bin/env bash
# Install git hooks for commit audit (no git.path wrapper).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

chmod +x \
  "$ROOT/scripts/audit/run.mjs" \
  "$ROOT/.githooks/pre-commit" \
  "$ROOT/scripts/audit/install.sh"

# Prefer core.hooksPath（已设置则跳过写 config）
current="$(git -C "$ROOT" config --get core.hooksPath 2>/dev/null || true)"
if [[ "$current" != ".githooks" && "$current" != "$ROOT/.githooks" ]]; then
  git -C "$ROOT" config core.hooksPath .githooks
fi

# Also keep a classic hook in case hooksPath is unset elsewhere
mkdir -p "$ROOT/.git/hooks"
cat >"$ROOT/.git/hooks/pre-commit" <<'EOF'
#!/usr/bin/env bash
ROOT="$(git rev-parse --show-toplevel)"
exec bash "$ROOT/.githooks/pre-commit"
EOF
chmod +x "$ROOT/.git/hooks/pre-commit"

echo "[audit] hooks installed (core.hooksPath=.githooks)"
echo "[audit] try: npm run audit"
