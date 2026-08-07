+++
title = "Tactical Design"
book_title = "战术设计"
weight = 2
final = true
+++

Tactical Design 关心 *how*：在 Bounded Context 内如何实现业务逻辑、组织代码、可靠地协作。

```mermaid
flowchart TD
  subgraph logic [业务逻辑]
    TS["Transaction Script"]
    AR["Active Record"]
    DM["Domain Model<br/>VO / Aggregate / Domain Event"]
    ES["Event Sourcing"]
  end
  subgraph arch [上下文内架构]
    LA["Layered"]
    PA["Ports & Adapters"]
    CQ["CQRS"]
  end
  subgraph comm [跨组件通信]
    OB["Outbox"]
    SG["Saga"]
    PM["Process Manager"]
  end
  logic --> arch --> comm
```

选型直觉：逻辑简单 → Transaction Script / Active Record；逻辑复杂 → Domain Model（必要时 Event Sourcing）；架构随逻辑复杂度与查询需求升级；跨聚合流程用 Saga / Process Manager，发消息用 Outbox。
