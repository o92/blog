+++
title = "何时编码、从建模到代码"
weight = 4
+++

对应原书 **12.3**：Modeling vs Coding 是极性；约束进代码；一致性边界护不变量。

## Collaborative Modeling vs Coding 是极性（12.3.1）

设计要上线才知是否可行；便利贴比重构便宜。——这是第 10 章要管理的极性，不是一劳永逸的阈值。

与群体画极性图：两侧正面可称为 Domain-Oriented Modeling，两侧负面可称为 Shallow Technical Programming（书图口径）。再约定 **signals / actions**，例如：

| 信号（例） | 动作（例） |
|--|--|
| 代码里大量注释才能说清业务 | 回到该场景细建模；问能否引入新统一语言概念 |
| 讨论几乎只剩技术细节 | 把该技术点实现进代码 |

信号与启发式高度语境相关；Deep vs Wide（场内）+ Modeling vs Coding（进出代码）是引入协作建模时的两张常用极性图。可对照第 10 章练习自填的 Modeling vs Coding 图，看效应 / 信号 / 动作差异。

## 从 EventStorm 到实现（12.3.2）

有了 Bounded Context 也不等于能直接开写。再走一遍相关风暴，把「拦实现的问题」显式贴上（取消策略、预留过期释放座位等）。

关键是 **constraints**：最终会变成代码。Hotspot「这时怎么办？」用 **Example Mapping** 带回业务：座位仍有但无法单排相邻时，业务要「多排平衡」——原约束变成**首选尝试**，另备后手约束。「走廊两侧不相邻」等同理，用具体选项逼出偏好。最终常成有序约束链：

1. 先尝试单排相邻  
2. 不行则多排平衡  
3. 再不行则跨走廊平衡  
4. 只剩散座则尽量靠近  

原则：**有容量就应能分座**（除非已满）。

再往下问：一致性边界在哪？命令如何接到事件？哪个 Bounded Context 答客户查询？Price Calculation / Payments 可先留在各自边界，焦点放在 Seat Allocations。

> DESIGN HEURISTIC：设计一致性边界（aggregates），保证业务不变量不被破坏。

例：一票一座——Seat / Row / ScheduledMovieSeating 收进同一聚合，经根修改，避免双票抢同座。书中以 `ScheduledMovie`（Request / Cancel / Confirm tickets 等方法）示意从风暴矩形到代码结构（摘记不抄大段代码）。

**反向也有用**：从一大块业务代码画出 EventStorm（及一致性边界）——见 catalysts。
