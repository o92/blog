+++
title = "名词介绍"
weight = 1
+++

本章专名（对应 General · Resource Design）。专名以 **英文** 为标题；中文进词库气泡。

### Resource

- **中文**：资源
- 面向资源 API 的基本构件：单独命名的名词，以及它们之间的关系与层级。典型 API 暴露大量资源，每个资源上只有少量方法。

### Collection

- **中文**：集合
- 含同一类型资源的节点。例如 publisher 拥有它出版的 books 集合。资源名称中的 collection identifier 必须是该名词的复数形式。

### Resource name

- **中文**：资源名称
- 用户用来引用并应存储为规范名的唯一标识。格式按 URI path schema，但无前导斜杠，例如 `publishers/123/books/les-miserables`。单 API 范围内只需唯一，也称 relative resource name。

### Full resource name

- **中文**：完整资源名称
- 无 scheme 的 URI：拥有方 API 的 service name 加上相对资源名称，例如 `//library.googleapis.com/publishers/123/books/les-miserables`。仅在字段可能指向多个 API、存在歧义时使用。

### Resource type

- **中文**：资源类型
- 全局唯一类型名，模式为 `{Service Name}/{Type}`，例如 `pubsub.googleapis.com/Topic`。Type 须与 Protobuf message 名对齐，单数，PascalCase。

### Standard methods

- **中文**：标准方法
- Get、List、Create、Update、Delete。应优先于 custom methods。资源至少必须支持 Get；除 singleton 外还必须支持 List。

### Singleton resource

- **中文**：单例资源
- 在任意给定 parent 下恰好始终存在一个实例（常见于 config）。没有用户或系统生成的 ID；随 parent 隐式创建/删除，不得定义 Create/Delete。

### reconciling

- **中文**：调和中
- 声明式友好资源上的 `bool reconciling` 字段（output only）：当前状态与用户意图不一致、系统正在调和时为 `true`。GET **must** 返回当前状态而非意图状态。

### effective value

- **中文**：生效值
- 客户端未指定时由服务分配/生成/计算的值。API 须拆成两个字段：用户可设且服务不得改的可变字段，以及名为 `effective_` 前缀的 OUTPUT_ONLY 生效字段。

### Policy experiment

- **中文**：策略实验
- 嵌在 live policy 下、用于 preview 的新配置。类型名须为 *RegularResourceType*`Experiment`。用户用 startPreview 对照生产流量打日志，再用 commit 提升为 live。
