# 原书 EPUB（仅供本地 / AI，不上站）

本目录存放阅读笔记对应的**原书 EPUB**，供 Cursor / AI 校对术语、章节结构与摘记准确性。

## 不上网站

- **不要**放进 `content/`、`static/`、`assets/`（Hugo 会发布）。
- **不要**在 `data/nav.yaml`、正文、glossary 里链到本目录。
- 构建产物 `public/` 中不应出现任何 `.epub`。

## 目录约定

```text
sources/
  README.md                 ← 本说明
  manifest.yaml             ← 笔记 slug → 文件映射（AI 先读这个）
  <content-slug>/           ← 与 content/<slug>/ 同名
    <Book-Title>.epub       ← 主读本
    <可选补充>.epub
```

| 笔记目录 (`content/…`) | 原书目录 |
|--|--|
| `product-operating-model` | `sources/product-operating-model/` |
| `design-patterns` | `sources/design-patterns/` |
| `ddd` | `sources/ddd/` |
| `scrum` | `sources/scrum/` |

新开笔记时：在 `content/<slug>/` 与 `sources/<slug>/` 同步建目录，并在 `manifest.yaml` 登记。

## 命名

- 目录：与 `content/` 下笔记根目录 **slug 完全一致**（小写、连字符）。
- 文件：`作者或短名-书名.epub`，ASCII 优先，空格改 `-`。  
  例：`Cagan-Transformed.epub`、`Shvets-Dive-Into-Design-Patterns.epub`。

## 公开仓库注意

不上站 **≠** 不上 GitHub。若本仓库是 **public**，提交的 EPUB 仍可被下载，可能涉及版权。

可选：

1. 仓库改为 private；或  
2. `.gitignore` 忽略 `sources/**/*.epub`，只提交 `manifest.yaml` + 本 README，EPUB 仅留本机；或  
3. 私有 submodule / 网盘，本机链到 `sources/`。

## 给 AI 的用法（摘要）

完整规则见 `.cursor/rules/source-epubs.mdc`。写/改某篇笔记前：查 `manifest.yaml` → 打开对应 EPUB → 以原书为准校对，长文勿整章粘进站点。
