# 提交审计（Glossary + 空路径 + 二次确认）

日期：2026-08-07  
状态：已批准，实施中

## 目标

Cursor / `git commit` 时用**纯代码**审计，通过后 macOS 弹窗二次确认。不走 AI。

## 非目标

- 旧审计能力（密钥、冲突标记、shellcheck、deep.py 结构大杂烩、cursor-git 丢 `--no-verify`）
- LLM / AI 审查
- `git.path` 包装器

## 架构

```text
git commit
  → .githooks/pre-commit
  → node scripts/audit/run.mjs --commit
       ├─ glossary-check   词库 YAML + source 文件/锚点
       ├─ links-check      content + nav.yaml 站内空路径
       ├─ build-temp       临时目录 hugo + glossary-inject
       ├─ bubbles-check    HTML 术语 tip DOM
       └─ confirm          macOS 弹窗（仅 --commit）
```

## 检查规则

### 词库（静态）

- `data/glossary/*.yaml` 可解析；必须有 `global.yaml`
- 每条：`summary` 非空字符串
- 有 `source`：`content/` 下文件存在；有 `#标题` 则标题须匹配（与 inject 相同规则）
- 有 `link`：仅允许 `http(s)://`
- 有 `aliases`：字符串数组；同域内不与其它词条/别名撞名

### 站内空路径（静态）

- `data/nav.yaml` 的 `book` / `books` → 存在 `content/<id>/`
- content 内 Markdown 链接（跳过外链、`mailto:`、纯 `#`、代码围栏）解析后目标不存在 → 失败

### 泡泡 DOM（全站临时构建后）

- 不碰本地 `public/`
- 按页合并 `glossary`（含祖先），用与 inject 相同匹配规则
- 每个应命中位置须有 `.glossary-term` 且内含 `.glossary-tip`
- 声明了 `source` 的词条，tip 内「显示更多」`href` 非空

### 二次确认

- 仅 `--commit` 且审计全过：macOS 弹窗列暂存文件；取消 → exit 1

## 删除与替换

删除旧 `scripts/audit/*` 实现及兼容壳（`cursor-git`、`git-pre-commit-audit.sh`、`install-hooks.sh` 等）。  
去掉 `.vscode/settings.json` 的 `git.path`。  
更新 `package.json` scripts 与 `.cursor/rules/pre-commit-audit.mdc`。

## 跳过

`SKIP_COMMIT_AUDIT=1` 跳过全部检查与弹窗。

## 报告

- stdout 分步；stderr Critical
- `.git/last-pre-commit-audit.txt` 汇总
- 任一 Critical 或确认取消 → exit 1
