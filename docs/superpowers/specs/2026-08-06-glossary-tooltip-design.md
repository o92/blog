# 术语自动强调 + 悬停气泡（构建后处理）

日期：2026-08-06  
状态：已实现

## 目标

在文章正文中自动识别词库里的术语并高亮；鼠标悬停显示解释气泡。  
主题由用户自行选择与配置；本功能不得绑死某一 Hugo 主题。

## 非目标

- 主题安装/美化
- 运行时 JS 扫词匹配（已否决）
- 用 `categories` / `tags` 自动绑定词库（使用独立 `glossary` 字段）

## 架构

```text
content + data/glossary/*.yaml
        ↓
hugo（生成 public/）
        ↓
node scripts/glossary-inject.mjs（扫 HTML，注入术语标记）
        ↓
带高亮 + 气泡的静态页 → 本地预览 / GitHub Pages
```

构建顺序必须是：`hugo` → `glossary-inject` → 部署。  
单独 `hugo server` **不等于**最终效果（server 不会自动跑后处理）。

## 词库与 front matter

### 目录

```text
data/glossary/global.yaml       # 全局词库（始终加载）
data/glossary/<domain>.yaml     # 领域词库，文件名 = 领域 ID
```

### 词条格式

```yaml
goroutine:
  summary: "Go 里由 runtime 调度的轻量执行单元"   # 必填，短说明
  source: "go-concurrency/01-intro.md#阅读方式"  # 可选：按标题摘录 content
  link: "https://go.dev/..."                       # 可选：仅外部链接
```

- 必填：`summary`
- 可选：`source`（`路径.md` 或 `路径.md#标题`）；摘录长度由 `scripts/glossary.config.json` 的 `excerptMaxLength` 限制；自动生成「显示更多」跳到对应页/锚点
- 可选：`link`（仅 `http(s)://` 外链）；站内跳转不要用 `link`，用 `source`
- 气泡展示顺序：领域标签 → summary → 摘录（若有）→「显示更多」/「外部链接」

### 文章

```yaml
---
title: "..."
glossary: ["go", "distributed"]   # 可选；加载 global + 列出的领域
---
```

- 缺省或 `[]`：仅 `global`
- `glossary` 表示**术语领域**，与导航用 categories/tags 解耦
- **继承**：inject 会合并当前页与所有祖先 section（`_index.md`）上的 `glossary`。通常在书根 `_index.md` 声明一次即可覆盖全书（含最终页合并正文）

## 冲突展示

同一术语同时存在于 global 与一个或多个领域时，气泡**同时展示**各来源，例如：

- **通用**：…
- **go**：…
- **distributed**：…

## 匹配规则

1. **作用范围**：仅文章正文 HTML（选择器可配置，如 `.post-content`）
2. **跳过节点**：`pre`、`code`、`kbd`、`samp`、`script`、`style`，以及已包裹的术语标签内部
3. **长短优先**：同一位置多词可匹配时，优先更长的词
4. **重复提示**：同一关键词在文中**每次出现**都高亮并带气泡（不是仅首次）
5. **大小写**：英文默认不敏感匹配，展示保留原文；中文按字面匹配
6. **多领域**：合并 `glossary` 所列领域词库后再匹配

## 脚本与配置

### 命令

```bash
npm run build   # hugo --gc --minify && glossary-inject && pagefind
```

### 输入

- `public/`：Hugo 产物
- `data/glossary/*.yaml`：词库
- content front matter `glossary`（含祖先 section 继承）
- `scripts/glossary.config.json`：正文选择器（默认 `.post-content`）、摘录长度

### 输出

- 原地改写相关 `public/**/*.html`
- 术语包裹为 `.glossary-term` + `.glossary-tip`
- 样式：`static/css/glossary.css`（由 `baseof` 引入；运行时定位见 `static/js/glossary-tip.js`）

### CI

`.github/workflows/hugo.yaml` 执行 `npm run build`（设置 `HUGO_BASEURL`），再 upload artifact。

### 本地预览

`npm run preview`（build + 静态服务）。  
禁止假设 `hugo server -D` 已含术语高亮或搜索索引。

## 主题接入（用户侧）

1. 引入 `/css/glossary.css`（或等价路径）
2. 保证正文容器有稳定 class，并与 `glossary.config.json` 中选择器一致

## 给 AI 的规则落点

- 设计本文：`docs/superpowers/specs/2026-08-06-glossary-tooltip-design.md`
- Cursor 规则：`.cursor/rules/glossary.mdc`

修改匹配语义或构建顺序时，必须同步更新上述两处。

## 已定决策摘要

| 项 | 决策 |
|----|------|
| 实现方式 | 构建后处理 HTML（方案 3） |
| 词库分区 | global + 领域 YAML |
| 文章关联 | front matter `glossary` |
| 冲突 | 气泡同时显示通用 + 领域 |
| 重复出现 | 每次都高亮 |
| 主题 | 用户自配，功能主题无关 |
