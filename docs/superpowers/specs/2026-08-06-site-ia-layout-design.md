# 站点信息架构与三栏布局（自建主题）

日期：2026-08-06  
状态：已实现

## 目标

自建 Hugo 布局（不绑死第三方文档主题），实现：

- 顶栏多层导航：领域分类（可多层）→ 书名
- 书内阅读页三栏：左 = 本书目录，中 = 正文，右 = 当前章节 TOC
- 书为主 + 少量随笔（`posts`）
- 明暗主题：默认跟随系统；右上角浅/深切换；sessionStorage（关浏览器后恢复系统）

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
- `books` 数组中的 id 对应 `content/<id>/`（无 `content/books/` 中间层）

### 书与章节（content 多层）

```text
content/
  <book-id>/
    _index.md          # 书首页：title、可选 glossary
    01-....md
    02-section/
      _index.md
      01-....md        # 可继续嵌套
```

- 左侧「本书目录」= 当前 book section 下的页面树（章/节/更小节）
- 分类及以上层级**不**出现在左侧目录

### 随笔

- 「随笔」只是 `data/nav.yaml` 里的分类名，可挂 `books: [essays]`
- 内容放在 `content/essays/`（或其它 book id），与技术书同一套三栏布局
- 不再使用 `content/posts/` 或独立随笔排版

### 最终页（合并子文件）

在 section 的 `_index.md` 上标记：

```toml
final = true

[build]
  render = 'always'

[[cascade]]
  [cascade.build]
    list = 'local'
    render = 'never'
```

语义：

- 该页为**最终阅读页**（独立 URL）
- 其下所有子 `.md` / 子 section **不单独成页**，正文合并进最终页
- **左侧书目仍显示**子项，链接为 `最终页URL#part-<文件名>`
- 右侧「本章」也会列出这些 part

非最终页行为不变（一文件一页）。

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

1. **默认**：跟随系统 `prefers-color-scheme`（不写 `data-theme`）
2. **手动**：右上角只显示 **浅 / 深**，点击在两者间切换
3. **持久化**：`sessionStorage`（键 `theme-preference`）；**关闭浏览器后清空**，下次打开重新跟随系统
4. **实现**：有 session 值时设 `html[data-theme="light"|"dark"]`；无值时靠 CSS 媒体查询
5. **防闪烁**：`<head>` 内联脚本读 `sessionStorage`
6. 术语气泡等使用同一套 CSS 变量

不再提供「系统」作为按钮上的第三态。

## 与术语功能的关系

- 正文容器保持 `.post-content`（或更新 `scripts/glossary.config.json` 选择器并同步规则）
- 构建顺序：`hugo` → `glossary-inject` → `pagefind` → 部署
- 单独 `hugo server` 不含术语注入与搜索索引；完整效果用 `npm run preview`
- `glossary.css` 改为依赖主题 CSS 变量

## 布局文件规划（实现时）

```text
layouts/
  _default/baseof.html      # 顶栏、主题脚本、总架
  _default/single.html      # 书内页三栏
  _default/list.html        # 书/_index 与中间层 list
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

## 视觉风格

明暗色板参考 [Next.js Docs](https://nextjs.org/docs)（仍用自建 layouts）：

- 浅色：白底 / `#171717` 正文；描边 `#eaeaea`；链接 `#0070f3`
- 深色：黑底 / `#ededed` 正文；描边 `#333`；链接 `#3291ff`
- 顶栏半透明模糊；正文限宽；侧栏弱化
- 样式入口：`static/css/site.css`、`static/css/glossary.css`

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
| 书/章 | `content/<id>/` 可多层嵌套 |
| 版式 | 顶栏 + 左书目 + 中正文 + 右章节 TOC |
| 明暗 | 默认跟系统；按钮仅浅/深；sessionStorage（关浏览器失效） |
