+++
title = "名词介绍"
weight = 1
+++

本章专名（对应 General · Process：AIP-100 / AIP-205）。专名以 **英文** 为标题；中文进词库气泡。

### API design review

- **中文**：API 设计评审
- 为在整个 API 语料中保证简单、直观、一致的 API 体验而做的评审。用户会直接对其写代码（现在或将来）且发布级别为 beta 或 GA 时，通常需要批准。

### Alpha

- **中文**：Alpha
- 发布级别：为尽早收集客户反馈的临时 API，可多次变更。设计评审可选但建议做；未完成评审的 Alpha **不得**把当时的设计决定固化为先例。

### Beta

- **中文**：Beta
- 发布级别：API 趋于稳定。升到 Beta 前必须完成设计评审；可用性与文体问题须处理。标了 beta-blocker 的设计必须在 Beta 前改掉。

### GA

- **中文**：正式发布
- Generally Available。若相对 Beta 有变更，设计评审为 Required；若无变更则为 FYI。

### beta-blocker

- **中文**：阻碍 Beta 的变更
- Alpha 中暂未处理、升 Beta 前必须再审的可用性或标准违反。用内部注释 `aip.dev/beta-blocker` 标明，并写明 Beta 应做何种修改。若例外要带到 Beta 与 GA，见 Precedent。
