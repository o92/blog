+++
title = "启发式"
weight = 3
+++

对应原书 **3.2**：什么是启发式、三类、竞争启发式怎么处理、怎么用与 journal；并简介 **Bounded Context Pattern**。

## 什么是 Heuristic（3.2 / 3.2.1）

会话里常卡住：边界画哪、便签算不算重复、话题跑飞……都需要**做决定才能往前**。经验会沉淀成简单规则——**Heuristic**。

定义：帮你（快速）做决策的简单规则。

基于经验：有的跨群体通用，有的只对某群体有效；工具箱要灵活、欢迎补充。像菜谱：第一次可照着做，熟了再加蒜；启发式提供约束与灵感，每场仍要调「配料」。决策必须伴随行动，否则只是意图（第 9 章再谈决策）。

急诊分诊来不及做完完整分析，仍能靠启发式得到合用结果——协作建模时间紧时同理：选 A/B/C 推进，往往不比「先深分析再动」差多少。

## 三类（见 [dddheuristics.com](https://dddheuristics.com/)）

| 类型 | 作用 | 例 |
|--|--|--|
| **Design heuristics** | 怎么设计软件 | 「与领域专家对齐边界」；「按语言拆分」 |
| **Guiding heuristics** | 元启发式：指导如何用其他启发式 | 「先挑边界再迭代」；「分叉话题时 Split and Merge」 |
| **Value-based heuristics** | 态度与工作方式 | （章末与后文会陆续出现） |

设计启发式会随经验增长；书鼓励公开分享。

## Bounded Context Pattern

第 2 章提过；Evans：领域模型被定义并适用的边界（常是子系统或某团队工作范围）。大项目多种领域模型（用户需要不同、团队独立、工具不同）；硬揉在一起易出 bug、沟通乱。Bounded Context 让术语在边界内无歧义，领域模型可独立演化。协作会话大量时间在谈边界：什么进、什么出、谁负责、依赖在哪——这正是在设计 Bounded Context。有用启发：「Find the natural boundaries in the domain。」

## Competing Heuristics（3.2.2）

两条及以上启发式可能同时成立，却推向不同行动。冲突本身有信息量。

**例 1：大图 EventStorm 强制时间线**

- Create different groups between Pivotal Events.（拆组加快进度）
- Add minority wisdom to the group.（全员保全视角）

都对：拆组可能丢少数声音；保全员可能走不完时间线。经验演化后的做法：先拆组推进，约每 30 分钟全员汇合走一遍时间线；汇合时多问「谁能多少对上一点刚才说的？」尽量把少数智慧补回小组。

**例 2：谈边界时冲突起来**

- Discuss conflicts with the entire group.（慢，但可能解开积怨、真推进）
- Split and merge during diverging conversations.（大部队继续建模，冲突方另议再合并）

按语境选或组合——没有永远正确的那一条。

## 怎么用（3.2.3）

- 工具箱是**个人的**：可分享，但受偏好与经验塑造；向他人学规则，更要从自己试错与反思里长出来。
- 会前计划：写下本场想试的一两条他人启发式，逐步内化。
- **Heuristics journal**：每场（参与或引导）后记观察与群体动力学，从中提炼自己的规则；初期常翻 journal，熟了会变第二本能。

**直觉入门包**（找域内自然边界时；直觉常是内化了的启发式）：

1. Split according to the language  
2. Split according to the departments  
3. Split according to the actors  

章末会给一批可抄进 journal 的条目；后文每章续加。
