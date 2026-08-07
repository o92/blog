# 静态站点质量门禁（site-check）

日期：2026-08-07  
状态：已实现

## 目标

在依赖 `public/` 之前做静态检查；任一项失败 → exit 1，使 `npm run build` / CI 失败。  
`npm run dev` 在 inject 前同样跑；**site-check 或 inject 失败则终止整个 dev 进程**（含 hugo server）。

## 非目标

- 写作约定（章节必须有 `01-terms`、笔记必须挂 nav、orphan 页）
- 构建后 DOM / 术语气泡抽检、Pagefind 产物检查
- pre-commit / macOS 弹窗

## 构建顺序

```text
site-check → hugo → glossary-inject（含 source 严格）→ pagefind
```

## 检查项（全部 fail-closed）

| 项 | 规则 |
|--|--|
| 词库 YAML | 可解析；须有 `global.yaml`；每条 `summary` 非空；同域 term/alias 不撞名；`link` 仅 `http(s)://` |
| 词库 `source` | 文件存在；若有 `#标题` 则标题须在正文中存在（与 inject 一致） |
| `nav.yaml` | 每个 `book` / `books` 对应 `content/<id>/` 存在 |
| content 站内链 | Markdown `[text](path)` 与 `ref`/`relref` 目标存在；跳过外链、`mailto:`、纯 `#`、代码围栏 |

## 落点

- `scripts/site-check.mjs`
- `package.json`：`site-check`；`build` 首位调用
- `scripts/dev.mjs`：inject 前调用

## 与 glossary-inject

inject 仍对 `source` 严格校验（单独跑 inject 时也失败）。site-check 提前拦，反馈更快。
