+++
title = "名词介绍"
weight = 1
+++

本章专名（对应 General · Fields）。专名以 **英文** 为标题；中文进词库气泡。

### field_behavior

- **中文**：字段行为
- `google.api.field_behavior` annotation，描述 required / optional / output only 等。请求中使用的每个字段都必须标注；无标注为向后兼容视为 `OPTIONAL`，但仍不得省略。

### IDENTIFIER

- **中文**：标识符（字段行为）
- 仅附着在资源 `name` 字段：create 时视为 `OUTPUT_ONLY`，变更（如 Update）时视为 `IMMUTABLE` 并作为输入接受。不得用在对其它资源的引用上。

### IMMUTABLE

- **中文**：不可变
- 资源创建后不能更改的字段。Update 中若值匹配则忽略；若请求变更则 `INVALID_ARGUMENT`。「有条件 immutable」不得标注。

### INPUT_ONLY

- **中文**：仅输入
- 请求中提供、响应中不返回。应只用于资源 message（或其内嵌 message）上的字段，而非 `*Request`。很少见。

### OUTPUT_ONLY

- **中文**：仅输出
- 响应中提供；请求中出现必须清除且不得报错；update mask 中必须忽略。应只用于资源树上的字段，而非 `*Response`。

### UNORDERED_LIST

- **中文**：无序列表
- repeated 字段上表示服务不保证顺序。服务仍可以稳定排序，也可以随机返回。

### FieldInfo

- **中文**：字段信息
- `google.api.FieldInfo` / `google.api.field_info`：在名称与类型之外标注格式（`UUID4`、`IPV4`、`IPV6`、`IPV4_OR_IPV6`）。新格式须有 IETF RFC 或 Google AIP。

### display_name

- **中文**：显示名称
- 人类可读、用户可设、用于 UI；不应要求唯一，建议 ≤ 63 字符。更正式的官方名用 `title`。

### annotations

- **中文**：注解（资源字段）
- `map<string, string>`，供客户端工具存少量任意状态；须遵守 Kubernetes 限制，建议点命名空间键。与可供服务端策略使用的 labels 不同。

### oneof

- **中文**：单选字段组
- 类型联合：只填充其中一个字段。新增选项是兼容变更；把现有字段移入或移出 `oneof` 会破坏 Go stubs。

### State transition methods

- **中文**：状态转换方法
- 把资源 `State` enum 从一个值转到另一个的 custom method（`POST` + `:verb`）。State 不得经 Create/Update 直接写入；不允许的转换返回 `FAILED_PRECONDITION`。术语用 `State` 不用 `Status`。
