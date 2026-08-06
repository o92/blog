# 站点信息架构与三栏布局（自建主题）

日期：2026-08-06  
状态：已实现

## 目标

自建 Hugo 布局（不绑死第三方文档主题），实现：

- 顶栏多层导航：领域分类（可多层）→ 书名
- 书内阅读页三栏：左 = 本书目录，中 = 正文，右 = 当前章节 TOC
- 书为主 + 少量随笔（`posts`）
- 明暗主题：默认跟随系统，右上角可手动切换并记住偏好

## 非目标（本期）

- 使用 Docsy / Hugo Book 等现成主题作为主体
- 把分类做成 `content/` 文件夹层级
- 术语气泡视觉大改（另议；实现主题色板时应用 CSS 变量对齐）

## 内容模型

### 分类（独立文件，可多层）

路径：`data/nav.yaml`（名称可在实现时微调，但须单一数据源）。

```yaml
categories:
  - id: tech
    title: 技术
    children:
      - id: go
        title: Go
        books: [go-concurrency]
      - id: distributed
        title: 分布式
        books: [raft-notes]
  - id: essays
    title: 随笔
    # 无 books 时顶栏可链到 /posts/
```

规则：

- 分类**不**出现在 `content/` 目录树里
- 顶栏只读 `data/nav.yaml` 生成多层菜单
- `books` 数组中的 id 对应 `content/books/<id>/`

### 书与章节（content 多层）

```text
content/
  books/
    <book-id>/
      _index.md          # 书首页：title、book_id、可选 glossary
      01-....md
      02-section/
        _index.md
        01-....md        # 可继续嵌套
  posts/
    *.md                 # 随笔
```

- 左侧「本书目录」= 当前 book section 下的页面树（章/节/更小节）
- 分类及以上层级**不**出现在左侧目录

### 随笔

- 使用 `content/posts/`
- 顶栏保留；左右栏可简化（无书目，可仅右 TOC 或双栏收起）

## 版式

### 书内阅读页

```text
[ Logo/站名 ........ 分类菜单（多层） ........ 明暗切换 ]
+------------------+--------------------+------------------+
| 左：本书目录      | 中：正文            | 右：本章 TOC      |
| （多层，当前高亮） | .post-content      | （h2/h3 等）      |
+------------------+--------------------+------------------+
```

### 移动端

- 左/右栏收入抽屉或等价入口；中间保持正文
- 明暗切换仍在顶栏可及处（右上）

## 明暗主题

1. **默认**：`prefers-color-scheme`（跟随设备）
2. **手动**：顶栏右上角切换按钮
3. **持久化**：`localStorage`（如 `theme=light|dark`）；有值则覆盖系统；清除/选「系统」则回到跟随设备（实现时可做成两态切换或三态，**推荐三态**：系统 / 亮 / 暗，默认系统；若两态，则「当前相反色」手动覆盖，并提供恢复系统的方式——实现计划里选定并写清）
4. **实现方式**：`html[data-theme="light"|"dark"]` + CSS 变量；无 `data-theme` 时用媒体查询
5. **防闪烁**：`<head>` 内联极短脚本，在首屏前读取 localStorage 并设置 `data-theme`
6. **术语气泡**等组件使用同一套 CSS 变量，随主题变化

推荐交互：**三态**（系统 / 浅色 / 深色），默认系统；按钮可循环或用小菜单。定稿采用三态。

## 与术语功能的关系

- 正文容器保持 `.post-content`（或更新 `scripts/glossary.config.json` 选择器并同步规则）
- 构建顺序不变：`hugo` → `glossary-inject` → 部署
- `glossary.css` 改为依赖主题 CSS 变量

## 布局文件规划（实现时）

```text
layouts/
  _default/baseof.html      # 顶栏、主题脚本、总架
  _default/single.html      # 随笔等
  books/single.html         # 书内页三栏
  books/list.html           # 书/_index 与中间层 list
  partials/
    nav.html                # 读 data/nav.yaml
    book-toc.html           # 左栏
    page-toc.html           # 右栏（.TableOfContents）
    theme-toggle.html
static/css/
  site.css                  # 变量、布局、明暗
  glossary.css              # 跟变量
data/nav.yaml
```

## 给 AI 的规则落点

- 本文：`docs/superpowers/specs/2026-08-06-site-ia-layout-design.md`
- Cursor：`.cursor/rules/site-layout.mdc`

修改导航数据源、三栏结构或主题策略时，须同步更新上述文件。

## 已定决策摘要

| 项 | 决策 |
|----|------|
| 主题策略 | 方案 2：自建 layouts |
| 站点类型 | 书为主 + 随笔 |
| 分类 | `data/nav.yaml`，可多层，不进 content 树 |
| 书/章 | `content/books/<id>/` 可多层嵌套 |
| 版式 | 顶栏 + 左书目 + 中正文 + 右章节 TOC |
| 明暗 | 默认跟系统；右上角切换；三态；localStorage |
