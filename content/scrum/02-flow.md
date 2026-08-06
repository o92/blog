+++
title = "端到端需求流"
weight = 2
+++

从「有一个产品目标」到「持续交付可用增量」的主链路。需求不是一次性写完，而是在 Sprint 间**涌现、排序、完成、再调整**。

## 主流程

```mermaid
flowchart TD
  A["明确 Product Goal<br/>参与：PO（可咨询干系人）<br/>产出：Product Goal"]
  B["维护 Product Backlog<br/>参与：PO 主导，Developers 估规模<br/>产出：有序、可理解的条目"]
  C["条目细化到可进 Sprint<br/>参与：PO + Developers<br/>产出：可在一个 Sprint 内 Done 的条目"]
  D["Sprint：选中并做成 Increment<br/>见下一章事件拆解"]
  E["向干系人检视成果<br/>参与：Scrum Team + 关键干系人<br/>产出：反馈、可能调整的 Backlog"]
  F["团队改进工作方式<br/>参与：Scrum Team<br/>产出：改进项（可进下个 Sprint Backlog）"]

  A --> B --> C --> D --> E --> F
  F -->|"下一 Sprint"| D
  E -.->|"新机会 / 重排优先级"| B
```

## 谁碰需求、碰出什么

```mermaid
flowchart LR
  subgraph 输入侧
    S[干系人期望]
    U[用户反馈 / 市场变化]
  end

  subgraph PO工作台
    PG[Product Goal]
    PBI[Product Backlog 条目]
  end

  subgraph 团队交付
    SB[Sprint Backlog]
    INC[Increment]
  end

  S --> PO
  U --> PO
  PO --> PG
  PO --> PBI
  PBI -->|"Sprint Planning 选中"| SB
  SB -->|"Sprint 内完成且满足 DoD"| INC
  INC -->|"Sprint Review"| S
  INC -->|"Sprint Review"| U
```

## 时间节奏（经验主义）

| 节奏 | 做什么 | 避免什么 |
|------|--------|----------|
| 每个 Sprint（≤1 月） | 至少一次对 Product Goal 进展的检视与适应 | Sprint 过长导致目标失效、风险堆积 |
| 每个工作日 | Daily Scrum 对齐 Sprint Goal | 用站会替代真正协作 |
| 持续 | Backlog 细化 | 临开会才第一次看条目 |

**取消 Sprint**：仅当 Sprint Goal 过时；只有 PO 有权取消。
