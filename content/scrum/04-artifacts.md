+++
title = "工件与承诺"
weight = 4
+++

三个工件各自带一个**承诺**，用来对齐透明与进度度量。

## 对照表

| 工件 | 承诺 | 主要负责人 | 回答的问题 |
|------|------|------------|------------|
| Product Backlog | **Product Goal** | PO | 产品要去向哪里？还缺什么？ |
| Sprint Backlog | **Sprint Goal** | Developers | 本 Sprint 为何有价值？做什么、怎么做？ |
| Increment | **Definition of Done** | Developers（DoD 可为组织最低标准） | 怎样才算真正完成、可交付？ |

## 工件流转

```mermaid
flowchart TD
  PG["Product Goal<br/>长期目标，一次一个"]
  PB["Product Backlog<br/>涌现、有序；工作唯一来源"]
  SG["Sprint Goal<br/>本 Sprint 单一目标"]
  SB["Sprint Backlog<br/>Goal + 条目 + 计划"]
  DoD["Definition of Done"]
  Inc["Increment<br/>可用，可叠加验证"]

  PG --> PB
  PB -->|"Planning 选取"| SB
  SG --> SB
  SB -->|"满足 DoD"| Inc
  DoD --> Inc
  Inc -->|"Review 检视"| PB
```

## 质量闸门：Definition of Done

- 条目不符合 DoD → **不能发布，也不能在 Review 里当完成品展示** → 退回 Product Backlog。
- 多团队做同一产品 → **共用同一 DoD**。
- 组织若已有 DoD 标准 → 团队至少遵守为下限。

## 最小闭环（可打印）

```mermaid
sequenceDiagram
  participant PO as Product Owner
  participant Dev as Developers
  participant SM as Scrum Master
  participant SH as 干系人

  PO->>PO: 维护 Product Goal / Backlog
  Note over PO,Dev: Sprint Planning
  PO->>Dev: 说明价值与优先级
  Dev->>Dev: 选定条目并规划 → Sprint Backlog
  loop 每个工作日
    Dev->>Dev: Daily Scrum → 当日计划
    SM-->>Dev: 协助清障
  end
  Dev->>SH: Sprint Review 展示 Increment
  SH->>PO: 反馈 / 新机会
  PO->>PO: 调整 Backlog
  Note over PO,Dev: Retrospective
  Dev->>Dev: 约定改进项
```

参考原文：[Scrum Guide 2020](https://scrumguides.org/scrum-guide.html)（CC BY-SA 4.0）。
