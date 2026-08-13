+++
title = "名词介绍"
weight = 1
+++

本章专名（对应 General · Compatibility and Versioning）。专名以 **英文** 为标题；中文进词库气泡。

### Source compatibility

- **中文**：源码兼容
- 针对先前版本编写的代码必须能对更新版本编译，并成功与更新版本的客户端库运行。

### Wire compatibility

- **中文**：线上兼容
- 针对先前版本编写的代码必须能与更新的服务器正确通信：输入输出兼容，且序列化 / 反序列化期望继续匹配。

### Semantic compatibility

- **中文**：语义兼容
- 针对先前版本编写的代码必须继续收到大多数合理开发者会期望的东西。实践中可能涉及判断。

### Channel-based versioning

- **中文**：基于通道的版本控制
- 推荐策略。每个主版本每个稳定性级别最多一个长寿命 channel（alpha / beta / stable）。stable 用 `v1`，beta / alpha 用 `v1beta` / `v1alpha`，就地接收新功能。alpha 是 beta 的超集，beta 是 stable 的超集。

### Release-based versioning

- **中文**：基于发布的版本控制
- 新服务不常用。alpha / beta 为有限寿命的个别发布（`v1beta1`、`v1alpha5`）；stable 仍就地更新。beta 的破坏性变更应递增发布号。

### Visibility-based versioning

- **中文**：基于可见性的版本控制
- 用 `google.api.visibility` 从一个内部表面暴露多个外部视图。label 为大小写敏感的 allow-list（惯例 UPPER case）；未标注则隐式 `PUBLIC`。Cloud 常用于 Preview 功能。
