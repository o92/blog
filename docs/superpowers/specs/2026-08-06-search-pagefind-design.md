# 站点搜索（Pagefind + ⌘K 面板）

日期：2026-08-06  
状态：设计中

## 目标

为静态博客提供全文搜索：顶栏入口 + `⌘K` / `Ctrl+K` 打开面板，本地索引、零后端，体验接近 Next.js Docs。

## 非目标

- Algolia / DocSearch 等托管搜索
- 独立 `/search/` 结果页
- 改动三栏布局或主题切换位置
- 让单独 `hugo server` 具备完整搜索（与术语后处理一致）

## 已定决策

| 项 | 选择 |
|----|------|
| 交互 | Next.js 式：按钮 + 快捷键 → 居中模态 |
| 范围 | 全文（标题 + 正文），结果带摘录 |
| 引擎 | Pagefind（构建期索引 `public/`） |
| 入口位置 | 顶栏右上，主题切换**左侧** |

## 架构

```text
content
  ↓
hugo（生成 public/）
  ↓
glossary-inject（术语注入）
  ↓
pagefind（对 public/ 建索引 → public/pagefind/）
  ↓
部署 / npm run preview
```

构建顺序必须是：`hugo` → `glossary-inject` → `pagefind` → 部署。

## 入口与面板

### 入口

- 顶栏搜索图标按钮，位于主题切换左侧：`… 导航 | 🔍 | 主题`
- 快捷键：`⌘K`（macOS）/ `Ctrl+K`（其他）；`Esc` 关闭
- 移动端仅依赖按钮（不依赖快捷键）

### 面板

- 居中模态 + 半透明遮罩；打开时 `body` 锁滚动
- 输入框自动聚焦
- 结果项：标题、所属路径/书、正文摘录（Pagefind 高亮）
- 键盘：`↑` / `↓` 选择、`Enter` 跳转、`Esc` 关闭
- 空查询：不列出全站，仅提示「输入关键词搜索」
- 样式使用站点 CSS 变量（明暗一致），自定义 UI，不直接套 Pagefind 默认皮肤

## 索引范围

- 索引构建产物中的文章 HTML
- 正文区域标记 `data-pagefind-body`（落在 `.post-content` 或其容器），避免索引顶栏、左书目、右 TOC、搜索面板本身
- 标题等元信息按 Pagefind 惯例从 `title` / 页面结构提取
- 中文：启用 Pagefind 对中文分词/多语言的推荐配置

## 文件落点

```text
layouts/
  _default/baseof.html          # 引入 search partial + search.css/js
  partials/
    search.html                 # 顶栏按钮 + 模态壳
static/
  js/search.js                  # 开关、快捷键、Pagefind API、结果渲染
  css/search.css                # 面板样式（跟主题变量）
package.json                    # pagefind 依赖；build/preview 串第三步
.github/workflows/hugo.yaml     # glossary 之后跑 pagefind
.gitignore                      # 忽略 public/pagefind/（若整棵 public 已忽略则顺带）
```

可选：在书页 / 文章布局的 `.post-content` 外层或自身加 `data-pagefind-body`。

## 构建命令

- 本地：`npm run build` = hugo → glossary-inject → pagefind  
- 预览：`npm run preview`（完整构建后静态服务）  
- CI：与本地同一顺序；`npx pagefind --site public`（或 package script）

## 与现有功能关系

- **主题**：搜索面板与按钮使用 `--body-bg` / `--body-fg` / `--border` / `--muted` / `--link` 等变量
- **术语**：索引在 inject **之后**，结果摘录可含已注入的术语 HTML 纯文本；不影响气泡运行时行为
- **布局规则**：更新 `site-layout` 相关说明中的构建顺序为三步

## 验收

1. 顶栏可点开搜索；`⌘K`/`Ctrl+K` 可用；`Esc` 关闭  
2. 输入中文/英文关键词能命中正文，结果有标题与摘录  
3. `Enter` / 点击可跳转到对应页面  
4. 明暗主题下面板可读、无硬编码反色问题  
5. CI 与 `npm run build` 均产出 `public/pagefind/`  
6. 左右 TOC、顶栏文案不会作为「正文结果」主导命中

## 实现备注

- Pagefind 客户端按需动态 `import`/`script` 加载 `pagefind.js`，避免无搜索需求时的多余开销可接受「打开面板时再加载」
- `hugo server` 文档中明确：完整搜索请用 `npm run preview`
