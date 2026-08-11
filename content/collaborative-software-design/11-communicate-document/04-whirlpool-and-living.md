+++
title = "Whirlpool、活文档与勿迷恋模型"
weight = 4
+++

对应原书 **11.3**：记完不是终点；建模是漩涡；别恋爱模型。

## 决策记完不是终点（11.3）

ADR + 沟通之后，旅程仍是一堆反馈环。在不确定下决策，就要用环拿到新信息。书把建模看成 **Whirlpool**，并依赖 **Living Documentation**——意味着有时要扔掉模型。

## Model Exploration Whirlpool（11.3.1）

Evans：非线性探索（近 BDD：discovery / formalization / automation ↔ scenario / model / code probe）。

典型环：

1. **Harvest & Document** — Big Picture EventStorming、Business Model Canvas、Wardley Mapping 等收当前态  
2. 提出模型与场景  
3. **Code probe** 试验  
4. 新场景再挑战模型 → 再转一圈  

价值在**建模过程**，不在某一版输出。一次 EventStorming 不够；换人、沉淀后再看、拿给泡泡外的人，都会再迭代。填 ADR / Pros-Cons 时，可能是**新一圈的起点**。

BigScreen：Big Picture 冒出 Purchasing / Scheduling 等 → 先拿子集做设计迭代 → 发现 Payment 在外部提供商 → 再回写 Bounded Context 设计。小步环比「一次做对所有边界」管用。工具箱（EventStorming、BMC、Example Mapping、sensemaking…）用来造环；也可参考 DDD Crew 的 Starter Modelling Process。

### 为何反馈环重要

在不确定下决策、用启发式推进——两者都不保证成功。环用来降不确定、检验启发式是否「这一回」管用；上线前永远不完全知情。模型不灵时要调，不要死扛。

### Emerging living documentation

文档也是环的一部分：环里拿到新信息 → 往文档里加。白板过大时按团队 / 架构拆板；ADR 可链回白板。

> GUIDING：线上白板过大时，按团队或架构切片。

注意「一直在原图上改」会丢历史。区分**可复用模型**与**某时刻冻结的不可变模型**：要迭代就复制后再改。

> GUIDING：每写一份 ADR，可冻结当时模型，后续用副本迭代。

## Don’t fall in love with your model（11.3.2）

模型再漂亮也不要恋爱。新信息要求调整或**整页扔掉**时，恋爱会让人只做扩展（**model fitting**），而不是重设计。

相关偏差：availability（偏爱易回想的第一版）、loss aversion、sunk cost——可同时加强。引导者可观察并显式化。

> VALUE-BASED：时不时提醒自己——可以不爱模型；需要时扔掉没问题。多做几版设计，降低「第一版独占感情」。Kill your darlings。
