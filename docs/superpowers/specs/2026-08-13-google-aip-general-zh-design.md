# Google AIP（General）中文笔记设计

## 目标

将 [General AIPs](https://google.aip.dev/general) 收入本站，按**中文讲解笔记**来写：规则对齐原文，行文按中文讲解，不逐句直译。

## 范围

- **仅** `aip/general`（不含 cloud / auth / client-libraries 等其它 scope）
- 许可：原文 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)；各页注明出处与署名

## 挂载

`软件工程` / `软件架构` / `Google AIP（General）` → `content/google-aip-general`

## 结构

按官网分类成章（Meta、Process、API Concepts、Resource Design、Operations、Fields、Design Patterns、Compatibility and Versioning、Polish、Protocol buffers）。

## 约定

- 专名：正文保留英文专名；中文释义进 glossary 气泡
- 章节：每章第一小节 `01-terms.md`（名词介绍）
- **讲解体**：先讲这篇在解决什么，再讲必须怎么做；可拆句、可调小标题；不编造原文没有的硬性规定
- 语气：必须 / 应当 / 可以 / 不得 / 不应当（对应 must / should / may / must not / should not）
- proto / JSON 示例不改；站内交叉引用用「见 AIP-N」，不要把专名包进链接
- 样板篇：`content/google-aip-general/04-resource-design/aip-0121.md`

## 非目标

- 不翻译非 General scope
- 不自动同步上游变更
