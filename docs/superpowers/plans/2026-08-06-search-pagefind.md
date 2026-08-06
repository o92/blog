# Pagefind Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ⌘K / 顶栏搜索面板 + Pagefind 全文索引，按 `docs/superpowers/specs/2026-08-06-search-pagefind-design.md`。

**Architecture:** `hugo` → `glossary-inject` → `pagefind`；自定义模态 UI 调 Pagefind JS API；`.post-content` 标 `data-pagefind-body`。

**Tech Stack:** Hugo layouts、Pagefind npm CLI、原生 JS/CSS（站点 CSS 变量）。

---

### Task 1: 构建流水线

- [x] `package.json`：加 `pagefind` 依赖；`build`/`preview` 串 `npx pagefind --site public`
- [x] `.github/workflows/hugo.yaml`：glossary 后跑 pagefind
- [x] 更新 `site-layout` 规则与 IA spec 中的构建顺序（三步）

### Task 2: 索引标记 + UI 壳

- [x] 各布局 `.post-content` 加 `data-pagefind-body`
- [x] `layouts/partials/search.html` + `baseof` 引入；顶栏 `site-header__actions` 包搜索+主题
- [x] `static/css/search.css`

### Task 3: 搜索逻辑

- [x] `static/js/search.js`：开关、快捷键、按需加载 Pagefind、结果与键盘导航
- [x] `npm run build` 验证 `public/pagefind/` 存在且可搜

### Task 4: 收尾

- [x] 规格状态改为「已实现」
- [ ] 按用户要求再 commit（本计划不自动要求推送）
