+++
title = "端到端需求流"
weight = 3
+++

从 Product Goal 到持续交付 Increment。节点均标注专名。

## 主流程

每个方框：**专名** + 谁参与 / 产出什么。  
**Sprint Review / Retrospective 都在 Sprint 内**（临近结束），不是 Sprint 结束之后。

```mermaid
flowchart TD
  PG["Product Goal<br/>产品目标<br/>参与：Product Owner<br/>产出：明确的长期目标"]
  PB["Product Backlog<br/>产品待办列表<br/>参与：PO 主导 · Developers 估规模<br/>产出：有序可理解的条目"]
  Ready["可进 Sprint 的条目<br/>参与：PO + Developers<br/>产出：一个 Sprint 内可 Done"]

  subgraph Sprint["Sprint（冲刺容器）"]
    SP["Sprint Planning<br/>Sprint 计划会"]
    Work["开发 + Daily Scrum"]
    INC["Increment<br/>增量"]
    SR["Sprint Review<br/>Sprint 评审<br/>参与：Scrum Team + Stakeholders"]
    Retro["Sprint Retrospective<br/>Sprint 回顾<br/>参与：Scrum Team<br/>结束本 Sprint"]
    SP --> Work --> INC --> SR --> Retro
  end

  PG --> PB --> Ready --> SP
  SR -.->|"新机会 / 重排"| PB
  Retro -->|"下一 Sprint"| SP
```

## 需求如何变成增量

```mermaid
flowchart TD
  SH["Stakeholders<br/>期望 / 反馈"]
  PO["Product Owner"]
  PG["Product Goal<br/>产品目标"]
  PB["Product Backlog<br/>产品待办列表"]
  SP["Sprint Planning<br/>Sprint 计划会"]
  SB["Sprint Backlog<br/>Sprint 待办列表"]
  DoD["Definition of Done<br/>完成的定义"]
  INC["Increment<br/>增量"]
  SR["Sprint Review"]

  SH --> PO
  PO --> PG
  PO --> PB
  PB --> SP
  SP --> SB
  SB --> DoD
  DoD --> INC
  INC --> SR
  SR --> SH
  SR -.-> PB
```

## 时间节奏

| 节奏 | 相关名词 | 避免 |
|------|----------|------|
| 每个 Sprint（≤1 月） | Product Goal 进展的检视与适应 | Sprint 过长 |
| 每个工作日 | Daily Scrum | 用站会替代协作 |
| 持续 | Product Backlog 细化 | 开会才第一次看条目 |

取消 Sprint：仅当 **Sprint Goal** 过时；只有 **Product Owner** 有权取消。
