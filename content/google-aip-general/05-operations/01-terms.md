+++
title = "名词介绍"
weight = 1
+++

本章专名（对应 General · Operations）。专名以 **英文** 为标题；中文进词库气泡。

### Standard collection methods

- **中文**：标准集合方法
- 对资源集合操作：List 或 Create。Declarative client / CLI / UI / SDK 均可自动化。

### Standard resource methods

- **中文**：标准资源方法
- 获取或变更单个资源：Get、Update、Delete。Declarative client 可自动化。

### Batch methods

- **中文**：批量方法
- 按 name 在同一集合中获取或变更多个资源：BatchGet、BatchCreate、BatchUpdate、BatchDelete。可用于优化查询。

### Custom methods

- **中文**：自定义方法
- 无法干净映射到标准方法的功能。使用传统 HTTP 动词（通常 `POST`），在 URI 中定义自定义动词（`:` 后）。Declarative client 通常需手写。

### Long-running operation

- **中文**：长时运行操作
- 无法在典型 RPC 时限内完成的工作。方法返回 `google.longrunning.Operation`；客户端轮询或等待直到 done。常用于 Create/Update/Delete 以及 startPreview 等 custom methods。

### FieldMask

- **中文**：字段掩码
- `google.protobuf.FieldMask`，Update 上名为 `update_mask`。省略时视为已填充字段；特殊值 `*` 表示完整替换。显式列出字段通常比 `*` 更安全。

### etag

- **中文**：实体标签
- 资源上表示内容的不透明、服务器计算值。Update/Delete 若提供 etag，必须与服务器值匹配，否则 `ABORTED`。声明式友好资源的 Delete **must** 提供此字段。

### allow_missing

- **中文**：允许缺失
- Update 上为 true 时，更新不存在的资源会创建它（忽略 `update_mask`）。Delete 上为 true 时，删除不存在的资源是 no-op。调用仍须具备相应权限。

### Cascading delete

- **中文**：级联删除
- 删除 parent 及其 child resources。请求上 **should** 提供 `bool force`；`force` 为 false 或未设置且存在 children 时 **must** `FAILED_PRECONDITION`。仅有 Singleton children 时必须允许删除。

### Partial success

- **中文**：部分成功
- 批量 Create/Update/Delete 中部分条目成功、部分失败。同步 batch **must** 原子；异步 batch **may** 部分成功，用 `failed_requests` map 报告。现有同步 API 不得就地改为部分成功。

### Stateless methods

- **中文**：无状态方法
- 不挂在资源上、对 API 内数据无永久影响的 custom methods（例如翻译文本）。动词与名词都放在 `:` 之后；涉及计费时 **must** 用 `POST`。
