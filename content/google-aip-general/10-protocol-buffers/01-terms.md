+++
title = "名词介绍"
weight = 1
+++

本章专名（对应 General · Protocol buffers）。专名以 **英文** 为标题；中文进词库气泡。

### HTTP transcoding

- **中文**：HTTP 转码
- 把面向资源的 gRPC RPCs 同时呈现为 REST/JSON。每个 RPC（双向流除外）必须用 `google.api.http` 声明 HTTP 方法与路径。

### google.api.http

- **中文**：HTTP 注解
- 标注 RPC 的 HTTP 动词、URI 模板与 `body`。URI 用 `{foo=bar/*}` 填请求字段；`GET` / `DELETE` 不得有 body。双向流不应带此注解。

### additional_bindings

- **中文**：额外绑定
- `google.api.http` 上的递归字段，让同一 RPC 对应多个 URI。不得嵌套 additional binding；各绑定的 `body` 必须相同。

### common components

- **中文**：公共组件
- 意在被多个 APIs 使用的 proto packages。组织范围的必须以 `.type` 结尾；全局的如 `google.protobuf.*`、`google.type.*`、`google.rpc.*`。APIs 必须自包含，除这些公共组件外。
