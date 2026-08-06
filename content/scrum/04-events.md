+++
title = "Sprint 事件拆解"
weight = 4
+++

Sprint 是其他事件的容器。节点均写专名；每节表格给出参与人与产出。

## Sprint 内顺序

Sprint 是容器：Planning → 开发（含 Daily）→ **Review（仍在 Sprint 内）** → **Retrospective（结束本 Sprint）**。

```mermaid
flowchart TD
  subgraph Sprint["Sprint"]
    SP["Sprint Planning<br/>Sprint 计划会<br/>时间盒 ≤8h"]
    Work["开发进行中<br/>含 Daily Scrum（每天 15min）"]
    SR["Sprint Review<br/>Sprint 评审<br/>时间盒 ≤4h · 临近结束"]
    Retro["Sprint Retrospective<br/>Sprint 回顾<br/>时间盒 ≤3h · 结束本 Sprint"]
    SP --> Work --> SR --> Retro
  end
  Next["下一 Sprint 的<br/>Sprint Planning"]
  Retro --> Next
```

---

## 1. Sprint Planning

| | |
|--|--|
| **专名** | Sprint Planning |
| **参与** | Scrum Team（可邀请顾问） |
| **输入** | Product Goal、Product Backlog、产能、Definition of Done |
| **产出** | **Sprint Backlog**（含 Sprint Goal） |

```mermaid
flowchart TD
  Q1["议题① 为何有价值？<br/>→ 产出 Sprint Goal"]
  Q2["议题② 能完成什么？<br/>→ 选出 Product Backlog 条目"]
  Q3["议题③ 如何完成？<br/>→ Developers 制定交付计划"]
  SB["Sprint Backlog<br/>Sprint 待办列表<br/>= Sprint Goal + 条目 + 计划"]

  Q1 --> Q2 --> Q3 --> SB
```

---

## 2. Daily Scrum

| | |
|--|--|
| **专名** | Daily Scrum |
| **参与** | Developers（PO/SM 若在做本 Sprint 条目则以 Developers 参加） |
| **输入** | Sprint Goal、Sprint Backlog |
| **产出** | 当日计划；障碍可见 |

```mermaid
flowchart TD
  In["输入：Sprint Goal<br/>+ Sprint Backlog"]
  DS["Daily Scrum<br/>每日站会 · 15min"]
  Plan["产出：当日行动计划"]
  Imp["产出：障碍（常由 Scrum Master 跟进）"]

  In --> DS
  DS --> Plan
  DS --> Imp
```

---

## 3. Sprint Review

| | |
|--|--|
| **专名** | Sprint Review |
| **参与** | Scrum Team + Stakeholders |
| **输入** | Increment（须满足 Definition of Done）、环境变化 |
| **产出** | 下一步共识；可能更新的 Product Backlog |

```mermaid
flowchart TD
  INC["Increment<br/>增量（未 Done 不展示）"]
  SR["Sprint Review<br/>Sprint 评审"]
  Next["下一步做什么"]
  PB["Product Backlog<br/>可能调整"]

  INC --> SR --> Next --> PB
```

Increment 可在 Sprint 结束前交付；Sprint Review **不是**唯一放行关口。

---

## 4. Sprint Retrospective

| | |
|--|--|
| **专名** | Sprint Retrospective |
| **参与** | Scrum Team |
| **输入** | 上个 Sprint 的人、协作、过程、工具、Definition of Done |
| **产出** | 改进项（可写入下一 Sprint Backlog） |

```mermaid
flowchart TD
  Retro["Sprint Retrospective<br/>Sprint 回顾"]
  Inspect["检视：人 / 互动 / 过程 / 工具 / DoD"]
  Improve["产出：高杠杆改进项"]

  Retro --> Inspect --> Improve
```

---

## 事件 × 参与 × 产出

```mermaid
flowchart TD
  SP_who["Sprint Planning<br/>参与：Scrum Team"]
  SP_out["产出：Sprint Goal<br/>+ Sprint Backlog"]
  DS_who["Daily Scrum<br/>参与：Developers"]
  DS_out["产出：当日计划"]
  SR_who["Sprint Review<br/>参与：Team + Stakeholders"]
  SR_out["产出：反馈 · 更新 Backlog"]
  RT_who["Sprint Retrospective<br/>参与：Scrum Team"]
  RT_out["产出：改进项"]

  SP_who --> SP_out --> DS_who --> DS_out --> SR_who --> SR_out --> RT_who --> RT_out
```
