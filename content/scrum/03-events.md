+++
title = "Sprint 事件拆解"
weight = 3
+++

Sprint 是其他事件的容器。下面按事件给出：**目的 → 参与人 → 输入 → 产出**。时间盒以「一个月 Sprint」为上限，更短则会议通常更短。

## Sprint 内顺序

```mermaid
flowchart LR
  P[Sprint Planning<br/>≤8h] --> W[Sprint 进行中]
  W --> D[Daily Scrum<br/>每天 15min]
  W --> R[Sprint Review<br/>≤4h]
  R --> T[Sprint Retrospective<br/>≤3h]
  T --> N[下一 Sprint Planning]
```

---

## 1. Sprint Planning

**目的**：为即将到来的 Sprint 制定计划，并敲定 Sprint Goal。

| | |
|--|--|
| **参与** | 全体 Scrum Team；可邀请顾问 |
| **输入** | Product Goal、排好序的 Product Backlog、团队产能与过往表现、Definition of Done |
| **产出** | **Sprint Backlog** = Sprint Goal + 选中条目 + 交付计划 |

```mermaid
flowchart TD
  subgraph 议题
    Q1["① 为何有价值？<br/>PO 提议 → 全队定义 Sprint Goal"]
    Q2["② 能完成什么？<br/>Developers 选条目（可当场细化）"]
    Q3["③ 如何完成？<br/>Developers 拆到约 1 天或更短的工作"]
  end
  Q1 --> Q2 --> Q3 --> Out["Sprint Backlog"]
```

---

## 2. Daily Scrum

**目的**：检视朝向 Sprint Goal 的进展，必要时调整 Sprint Backlog 与当日计划。

| | |
|--|--|
| **参与** | **Developers**（PO/SM 若在做 Sprint 内条目，则以 Developers 身份参加） |
| **输入** | 当前 Sprint Goal、Sprint Backlog、昨日进展与障碍 |
| **产出** | **当日可执行计划**；障碍被识别（常由 SM 跟进清除） |

```mermaid
flowchart LR
  In[Sprint Goal<br/>+ Backlog] --> Meet[15min<br/>结构自定]
  Meet --> Plan[下一天行动计划]
  Meet --> Imp[障碍清单]
```

要点：不是唯一调整计划的时机；一天中仍可继续同步。

---

## 3. Sprint Review

**目的**：检视 Sprint 成果与环境变化，决定下一步；是**工作会议**，不是单向演示。

| | |
|--|--|
| **参与** | Scrum Team + **关键利益相关者** |
| **输入** | 本 Sprint 的 Increment（们）、Product Goal 进展、环境变化 |
| **产出** | 对「下一步做什么」的共识；**可能更新的 Product Backlog** |

```mermaid
flowchart TD
  Inc[可用 Increment<br/>未 Done 的不展示] --> Review[共同审阅成果与环境]
  Review --> Next[协作决定下一步]
  Next --> PB[(调整 Product Backlog)]
```

Increment 可在 Sprint 结束前就交付；Review **不是**放行价值的唯一关口。

---

## 4. Sprint Retrospective

**目的**：规划如何提高质量与有效性；**结束本 Sprint**。

| | |
|--|--|
| **参与** | **全体 Scrum Team** |
| **输入** | 上个 Sprint 的人、协作、过程、工具、DoD 执行情况 |
| **产出** | **最有帮助的改进项**（影响大的尽快落地，可写入下个 Sprint Backlog） |

```mermaid
flowchart LR
  Inspect[检视人 / 互动 / 过程 / 工具 / DoD] --> Decide[选出高杠杆改进]
  Decide --> Act[尽快实施<br/>可进下一 Sprint Backlog]
```

---

## 事件 × 参与 × 产出（总表）

```mermaid
flowchart TB
  subgraph Planning
    P_who["PO + SM + Developers"]
    P_out["Sprint Goal · Sprint Backlog"]
  end
  subgraph Daily
    D_who["Developers"]
    D_out["当日计划 · 障碍可见"]
  end
  subgraph Review
    R_who["Team + 关键干系人"]
    R_out["反馈 · 可能更新的 Backlog"]
  end
  subgraph Retro
    T_who["Scrum Team"]
    T_out["改进项"]
  end

  P_who --> P_out --> D_who --> D_out --> R_who --> R_out --> T_who --> T_out
```
