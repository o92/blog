+++
title = "Tactical Design"
book_title = "战术设计"
weight = 2
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

1. [名词介绍]({{< ref "ddd/02-tactical-design/01-terms.md" >}})
2. [简单业务逻辑]({{< ref "ddd/02-tactical-design/02-simple-business-logic.md" >}})
3. [复杂业务逻辑 · Domain Model]({{< ref "ddd/02-tactical-design/03-domain-model.md" >}})
4. [时间维度 · Event Sourcing]({{< ref "ddd/02-tactical-design/04-event-sourcing.md" >}})
5. [架构模式]({{< ref "ddd/02-tactical-design/05-architectural-patterns.md" >}})
6. [通信模式]({{< ref "ddd/02-tactical-design/06-communication-patterns.md" >}})
