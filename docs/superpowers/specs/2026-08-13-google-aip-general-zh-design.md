# Google AIP（General）中文笔记设计

## 目标

将 [General AIPs](https://google.aip.dev/general)（约 72 篇）以**原样忠实翻译**收入本站笔记；先广后细、分多批。

## 范围

- **仅** `aip/general`（不含 cloud / auth / client-libraries 等其它 scope）
- 许可：原文 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)；笔记根与各章注明出处与署名

## 挂载

`软件工程` / `软件架构` / `Google AIP（General）` → `content/google-aip-general`

## 结构（方案 A）

按官网分类成章（Meta、Process、API Concepts、Resource Design、Operations、Fields、Design Patterns、Compatibility and Versioning、Polish、Protocol buffers）。

| 批次 | 内容 |
|--|--|
| **1（本批）** | 笔记根、nav、各章壳、全表中文标题 + 占位页（链原文、标「待译」） |
| 2+ | 按章逐篇全文原样翻译；词库随细译补 |

## 约定

- 专名：正文保留英文专名；中文释义进 glossary 气泡（与协作软件设计笔记一致）
- 章节：每章 `01-terms.md` 先占位，细译时补词条
- 不改编为「学习笔记体」；结构、编号、表格、示例尽量对齐原文
- 状态草稿（Draft / Reviewing）在目录中保留英文标注

## 非目标

- 不翻译非 General scope
- 第一批不做全文
- 不自动同步上游变更（后续可人工对照 GitHub `aip-dev/google.aip.dev`）
