+++
title = "名词介绍"
weight = 1
+++

本章专名（对应 General · Design Patterns）。专名以 **英文** 为标题；中文进词库气泡。

### request_id

- **中文**：请求标识
- 请求 message 上的 `string request_id`（不得放在资源上）。提供则必须保证幂等；重复请求应返回先前成功响应。建议 UUID4，并用 `field_info` 标注格式。

### validate_only

- **中文**：仅校验
- 请求上的 `bool validate_only`：校验并预览与真实执行相同的响应，但不实际执行。必须做权限与其它会失败的校验。声明式友好资源的变更方法必须包含此字段。

### Soft delete

- **中文**：软删除
- Delete 只标记删除、不完全移除；应返回更新后的资源。默认 List 不返回（除非 `show_deleted`）；Get 仍返回该资源。应有 `delete_time`、`purge_time`，以及可选 `DELETED` state。

### Undelete

- **中文**：恢复删除
- 软删除资源上的 custom method（`POST` + `:undelete`），返回资源本身。对未删除的资源返回 `ALREADY_EXISTS`。

### Expunge

- **中文**：彻底清除
- 立即永久删除的 custom method（`:expunge`）。须与标准 delete 分开的显式权限。资源不存在返回 `NOT_FOUND`；非 ready/软删除状态返回 `FAILED_PRECONDITION`。

### page_token

- **中文**：分页令牌
- List 请求上的 `page_token` 与响应上的 `next_page_token`。必须不透明、URL-safe、不可被用户解析。空的 `next_page_token` 是传达集合结束的唯一方式。一开始就必须实现分页。

### Normalization Form C

- **中文**：Unicode 规范化形式 C
- Unicode 值应存为 NFC。用作 unique identifier 的字符串在查唯一性之前必须规范化为 NFC，或拒绝非 NFC 输入。ASCII 标识符建议 ``[a-zA-Z][a-zA-Z0-9_-]*``。

### ttl

- **中文**：存活时间
- 相对过期：`oneof expiration` 中 INPUT_ONLY 的 `google.protobuf.Duration ttl`。输出始终填 `expire_time` 并留空 `ttl`。不得用会倒计时更新的输出 ttl 字段。

### unreachable

- **中文**：不可达资源
- List 响应中的 `repeated string unreachable`（UNORDERED_LIST），填 service-relative resource names。跨集合读取部分失败时必须提供。棕地采用须同时加 `return_partial_success`。

### Resource revision

- **中文**：资源修订
- 嵌套集合 `{resource}/revisions/{id}`，message 名为 `{ResourceType}Revision`，含 OUTPUT_ONLY 的 `snapshot`。用 *revision* 不用 *version*。可用 `Rollback` / `alias`。本文仍为 draft。

### Reading across collections

- **中文**：跨集合读取
- List 的 `parent` 用 `-` 通配多个 parents（例如 `publishers/-/books`）。部分失败时须提供 `unreachable`。
