# 术语自动强调 + 悬停气泡（构建后处理）

日期：2026-08-06  
状态：已定稿（待实现）

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
  summary: "Go 里由 runtime 调度的轻量执行单元"
  link: "/posts/go-concurrency/"   # 可选
```

- 必填：`summary`（气泡文案）
- 可选：`link`（点击跳转）

### 文章

```yaml
---
title: "..."
glossary: ["go", "distributed"]   # 可选；加载 global + 列出的领域
---
```

- 缺省或 `[]`：仅 `global`
- `glossary` 表示**术语领域**，与导航用 categories/tags 解耦

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
hugo --gc --minify
node scripts/glossary-inject.mjs
```

建议封装 `npm run build` = 上述两步。

### 输入

- `public/`：Hugo 产物
- `data/glossary/*.yaml`：词库
- 文章 `glossary` 映射（优先构建时导出 JSON；或脚本读 content front matter）
- `scripts/glossary.config.json`：正文选择器、路径 glob、匹配开关

### 输出

- 原地改写相关 `public/**/*.html`
- 术语包裹为带 class / `data-*` 的元素（具体标签在实现计划中定）
- 样式：`static/css/glossary.css`（主题侧负责引入）

### CI

在 `.github/workflows/hugo.yaml` 中，于 Hugo build 与 upload artifact 之间增加 `glossary-inject` 步骤。

### 本地预览

提供明确的 preview 脚本（先 hugo + inject，再对 `public/` 做静态预览，或文档写清流程）。  
禁止假设 `hugo server -D` 已含术语高亮。

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
