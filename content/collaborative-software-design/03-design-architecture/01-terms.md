+++
title = "名词介绍"
weight = 1
+++

本章专名（对应原书第 3 章）。

### Software Architecture

- **中文**：软件架构
- 书采 Grady Booch 口径：**显著设计决策**所塑造的系统形态；显著性用**变更成本**衡量。编码时改集成名、牵动多系统——也是架构决策。团队应拥有架构，但须先被赋能，而不是「赶走架构师」了事。

### Software Design

- **中文**：软件设计
- 把当前软件系统改成期望形态的各类**设计活动**；产出常含计划与设计决策。Booch：「所有架构都是设计，但并非所有设计都是架构。」不牵动基础结构的改动，不必升格为架构议题。

### Sociotechnical System

- **中文**：社会技术系统
- 社会、技术、认知等多方面相互纠缠的网络。技术决策会改团队动力学与认知负荷，反之亦然；只优化一侧会放大系统复杂度。协作建模要在这一整系统里做决策。

### Implicit Architecture

- **中文**：隐式架构
- 决策未说清、未被理解或无法沟通时形成的「默契架构」。团队靠 workaround 摸黑，复杂度上升。对策：协作建模把设计决策显式化。

### Heuristic

- **中文**：启发式
- 基于经验的**简短规则**，帮助在时间紧、无法深分析时快速做决策并推进。决策须伴随行动。常见三类（见 [dddheuristics.com](https://dddheuristics.com/)）：**Design**、**Guiding**（元启发式）、**Value-based**。

### Competing Heuristics

- **中文**：竞争启发式
- 两条及以上启发式在同一情境都「说得通」，但指向不同行动。冲突本身有信息量：把张力摊开，才选得了更贴语境的那条（或组合）。

### Boundary

- **中文**：设计边界（常指 Bounded Context 等）
- 从问题空间迭代进入解决方案空间时划出的边界（语言、部门、角色等）。边界设计是协作活动：多视角、多迭代；单人难以兼顾业务价值、体验、技术约束等。

### Deployable Unit

- **中文**：可部署单元
- 部署边界；与 Bounded Context（语言边界）不必 1:1。多个上下文可进同一单元（modular monolith）；一个上下文拆多单元一般不建议。

### Domain Message Flow

- **中文**：领域消息流（图）
- Nick Tune 基于 Domain Storytelling、面向 Bounded Context 设计的建模工具：看命令/事件如何在上下文间流动。可与 Context Mapping 等并用，暴露新权衡。

### Pivotal Event

- **中文**：枢纽事件
- EventStorming 时间线上把流程切成几大段的关键事件；常用来拆组深挖或划边界讨论的锚点。
