+++
title = "边界：从业务理解到架构"
weight = 4
+++

对应原书 **3.3**：用业务理解迭代划 Bounded Context；为何必须协作；从边界设计到可部署架构。

## 用业务理解驱动设计（3.3.1）

问题空间模型（如 Big Picture EventStorm）是设计活动的**输入**；在解决方案空间里对 Bounded Context 做多轮迭代，模型逐步吃进更多域复杂度。第一轮常靠**直觉** + 入门包启发式（语言 / 部门 / 角色）。

**别一上来空谈「该有几个上下文、对不对」**——先挑边界画出来，再迭代：

> GUIDING HEURISTIC: Pick some boundaries to start with and iterate.

### BigScreen 迭代示例

1. **按语言拆（Split according to the language）**  
   搜片/排期话术 vs 购票话术不同；在「Normal Pricing Selected」之类事件之前，「票」还不存在 → 先拆成 **Movie Scheduling** 与 **Ticket Purchasing**。选一条启发做完第一轮就够；经验足时可一次叠用多条，得到更多边界。

2. **对外系统通信单独成上下文**  
   Payment Details Provided / Payment Completed 发生在支付伙伴系统；要翻译对方统一语言。  
   > DESIGN HEURISTIC: Communication with external systems happens in a separate bounded context.  
   → 抽出 **Payments**。

3. **为未来潜力优化**  
   > DESIGN HEURISTIC: Optimize for future potential.  
   潜力要问领域专家。定价模型（订阅等）、座位分配算法（将来可按偏好）可能今年不做，但值得先留 **Price Calculation**、**Seat Allocations** 等边界；Ticket Purchasing 也可正名为更贴切的 **Ticketing**（重心变成出票/发票）。

4. **对照「纸质世界」**  
   > DESIGN HEURISTIC: Split bounded contexts based on how it would happen in a paper world, without using software.  
   过去现场买票、手算价、预印票根——定价与出票可能同属一块。于是出现**竞争启发式**：拆细（局部简单、全局依赖多）vs 合并（局部复杂、依赖少）。哪边更好取决于团队与业务，**一个人答不了**，要继续协作挖。

## 为何边界要协作设计（3.3.2）

前面例子多盯业务价值；真实还要戴用户体验、技术约束等多顶帽子——**一人做不全**。

实践节奏：

1. 先与直接造系统的人做几轮设计  
2. 再向其他利益相关方校验  
3. 收反馈，继续迭代 → 理解加深，模型变好  

工具不止 EventStorming：

- **Domain Message Flow**：看命令/事件在 Bounded Context 之间流动（Nick Tune，基于 Domain Storytelling，偏上下文设计）
- **Context Mapping**：模型、语言、团队沟通关系  

设计永不「完工」，但仍须择机开建（设计 vs 实现的极性见第 10 章）。

## 从设计到架构（3.3.3）

划 Bounded Context ≠ 做完架构。架构还涉及可部署单元等。

| | Bounded Context | Deployable unit |
|--|--|--|
| 是什么 | **语言**边界 | **部署**边界 |
| 关系 | 不必 1:1 | 可对齐，是不同概念 |

- 一个 Bounded Context 拆多部署单元：逻辑本就相互依赖，常会一起改 → **一般不建议**。  
- 多个 Bounded Context 进一部署单元：可成 **modular monolith**（「单体」曾因落地差被污名化，模块化单体是纠正）；单元过大则损适应与扩展。

相关启发式：

- What changes together, **stays** together.（找 Bounded Context：一起变的业务逻辑放一起）  
- What changes together, **gets deployed** together.（部署）  
- 若两年后仍总是一起部署，可考虑合并成一个。（章末启发式）

BigScreen 现状：多域、**单** Bounded Context（泥球）+ **单**部署单元（单体本身不坏，坏在无清晰边界）。新架构：多 Bounded Context + 多部署——例如 Price Calculation / Payments / Seat Allocations 可一对一部署；UI 与 Ticketing 可同部署；PaS 与 Movie Scheduling 同域却可两部署。复杂度被架构**显式**承载，从而撑起「Anytime, Anywhere」。
