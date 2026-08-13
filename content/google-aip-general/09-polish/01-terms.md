+++
title = "名词介绍"
weight = 1
+++

本章专名（对应 General · Polish）。专名以 **英文** 为标题；中文进词库气泡。

### interface name

- **中文**：接口名
- .proto 中 `service` 定义所用名称（例如 `Library`），区别于实现侧的 Service Name（如 `pubsub.googleapis.com`）。应使用直观名词，避免与语言运行时概念冲突。

### ErrorInfo

- **中文**：错误信息
- `google.rpc.ErrorInfo`：所有错误响应的 `details` 中必须包含。`reason` + `domain` 构成机器可读标识；请求特定信息必须进 `metadata`，不得只靠解析 `Status.message`。

### LocalizedMessage

- **中文**：本地化消息
- `google.rpc.LocalizedMessage`：按用户 locale（IETF BCP 47）提供错误文案。若 `Status.message` 因兼容而不能改，可用它提供更好消息；未指定 locale 时应为 `en-US`。
