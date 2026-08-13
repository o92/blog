+++
title = "名词介绍"
weight = 1
+++

本章专名（对应 General · Meta：AIP-1 / AIP-2 / AIP-3 / AIP-8 / AIP-9 / AIP-200）。专名以 **英文** 为标题；中文进词库气泡。

### AIP

- **中文**：API 改进提案
- **API Improvement Proposal**：面向 API 开发的高层、简明设计文档；在 Google 作为 API 相关文档的事实来源，也是 API 团队讨论并达成 API 指导共识的方式。以 Markdown 维护于 AIP GitHub 仓库。

### Guidance

- **中文**：指导类 AIP
- 描述 API 设计指导：给 API producer 写简单、直观、一致的 API；API reviewer 据此写评审意见。

### Process

- **中文**：过程类 AIP
- 描述围绕 API 设计的过程；常影响 AIP 过程本身，用来改进 AIP 的处理方式。

### API producer

- **中文**：API 生产者
- 产出 API service 的实体。对 Google APIs 而言，通常是负责该 API service 的 Google 团队。

### AIP Editors

- **中文**：AIP 编辑
- 对 AIP 做决定的人：批准 Pull Request、分配提案编号、管理议程、设置 AIP 状态等；并确保 AIP 可读（拼写、语法、结构、标记）。general scope 下他们是各 AIP 的 approver。编辑资格由现任编辑邀请。

### Technical Lead

- **中文**：技术负责人
- 原文作 TL。AIP 过程的最终决策者与最终升级点。按职责域分为 Infrastructure Technical Lead 与 Design Technical Lead。

### Draft

- **中文**：草稿
- AIP 初始状态：主要由原作者讨论与迭代；编辑此阶段**可以**介入，但非必须。

### Reviewing

- **中文**：评审中
- 讨论大体结束、尚未正式接受：作者已大致达成共识，编辑介入。进入此状态需要作者以外至少一名 AIP approver 正式签字，且不得有其他 approver 的正式反对（GitHub Pull Request 上的 changes requested）。

### Approved

- **中文**：已批准
- 已达成一致，视为当前最佳实践。进入此状态需要作者以外至少两名 AIP approver 正式签字，且不得有其他 approver 的正式反对。API producer 应主要依赖此状态的 AIP。

### Withdrawn

- **中文**：已撤回
- 由作者或 champion 撤回；可由另一 champion 接手。

### Rejected

- **中文**：已拒绝
- 由 AIP editors 拒绝；文档保留，供日后讨论参考。

### Deferred

- **中文**：已延期
- 长时间未推进时，编辑可标为此状态。

### Replaced

- **中文**：已取代
- 被另一篇 AIP 取代；编辑须说明取代与理由（新 AIP 也应说清理由）。

### Precedent

- **中文**：先例
- 已发布 API 若违反现行 AIP，不得被新 API 当作「曾经批准过」而沿用。须用 `aip.dev/not-precedent` 注释标明例外及原因。仅 beta 或 GA 的 API 才视为可立先例。

### API backend

- **中文**：API 后端
- 实现 API service 业务逻辑的一组服务器及相关基础设施。单个 API backend 服务器常称为 API server。

### API consumer

- **中文**：API 消费者
- 消费 API service 的实体。对 Google APIs 而言，通常是拥有客户端应用或服务器资源的 Google project。

### API definition

- **中文**：API 定义
- API 的定义，通常写在 Protocol Buffer service 中。同一 API definition 可由任意数量的 API service 实现。

### API frontend

- **中文**：API 前端
- 为各 API service 提供负载均衡、认证等共性能力的一组服务器及相关基础设施。单个 API frontend 服务器常称为 API proxy。可与 API backend 近置、远置，甚至编译进同一进程。

### API interface

- **中文**：API 接口
- API 规范 IDL 中对 API method 分组的元素，例如 Protocol Buffers 的 `service`。多数编程语言映射为 `class` 或 `interface`。

### API method

- **中文**：API 方法
- API 中的单个操作。Protocol Buffers 中通常是 `rpc`，多数编程语言映射为函数。

### API product

- **中文**：API 产品
- API service 及其服务条款、文档、client libraries、支持等一并作为产品呈现给客户，例如 Google Calendar API。人们有时把 API product 直接叫做 API。

### API service

- **中文**：API 服务
- 一个或多个 API 的已部署实现，暴露在一个或多个网络地址上，例如 Cloud Pub/Sub API。

### Network API

- **中文**：网络 API
- 跨计算机网络运作的 API，使用 HTTP 等网络协议通信；生产方与消费方常常分属不同组织。

### Google API

- **中文**：Google API
- Google 服务暴露的 Network API。多数托管在 `googleapis.com`。不包括 client libraries、Software Development Kit 等其它类型的 API。

### Declarative Clients

- **中文**：声明式客户端
- 亦称 Infrastructure as Code：消费表示 API 资源的标记语言或代码，并执行相应命令式动作，把资源驱动到期望状态。须把客户端设定的字段当只读并认真保留。Terraform 是一例。

### Client

- **中文**：客户端
- 通过调用 API 完成特定任务的程序，或把 API 暴露给用户、或对静态资源数据操作的通用工具（命令行、Software Development Kit、脚本、Declarative Clients、可视化界面等）。

### User

- **中文**：用户
- 直接使用 API 的人（例如用 cURL）。AIP 中用来区分人类 user 与程序化 client。
