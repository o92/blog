+++
title = "工件与承诺"
weight = 5
+++

三个工件各带一个承诺。专名对照见[名词介绍]({{< ref "scrum/01-terms.md" >}})。

## 对照表

| 工件（专名） | 承诺（专名） | 负责人 | 回答的问题 |
|--------------|--------------|--------|------------|
| Product Backlog | Product Goal | Product Owner | 产品去向哪里？ |
| Sprint Backlog | Sprint Goal | Developers | 本 Sprint 为何有价值？ |
| Increment | Definition of Done | Developers | 怎样才算完成？ |

## 工件流转

```mermaid
flowchart TD
  PG["Product Goal<br/>产品目标"]
  PB["Product Backlog<br/>产品待办列表"]
  SG["Sprint Goal<br/>Sprint 目标"]
  SB["Sprint Backlog<br/>Sprint 待办列表"]
  DoD["Definition of Done<br/>完成的定义"]
  INC["Increment<br/>增量"]

  PG -->|承诺于| PB
  SG -->|承诺于| SB
  PB -->|"Sprint Planning 选取"| SB
  SB -->|"满足 DoD"| INC
  DoD -->|约束| INC
  INC -->|"Sprint Review"| PB
```

## Definition of Done

- 不符合 → 不能发布，也不能在 Sprint Review 当完成品 → 退回 Product Backlog。
- 多团队同一产品 → 共用同一 Definition of Done。

## 最小闭环

```mermaid
sequenceDiagram
  participant PO as Product Owner
  participant Dev as Developers
  participant SM as Scrum Master
  participant SH as Stakeholders

  PO->>PO: 维护 Product Goal / Product Backlog
  Note over PO,Dev: Sprint Planning
  PO->>Dev: 说明价值与优先级
  Dev->>Dev: 产出 Sprint Backlog（含 Sprint Goal）
  loop 每个工作日
    Dev->>Dev: Daily Scrum → 当日计划
    SM-->>Dev: 协助清除障碍
  end
  Dev->>SH: Sprint Review：展示 Increment
  SH->>PO: 反馈 / 新机会
  PO->>PO: 调整 Product Backlog
  Note over PO,Dev: Sprint Retrospective
  Dev->>Dev: 产出改进项
```
