+++
title = "客户需要、策略与景观"
weight = 2
+++

对应原书 **12.1**：先理解语境；把战略、产品与架构连上。

## 先理解语境（12.1）

第 2 章的 Business Model Canvas 不只给管理层：开发一起做，能改价值主张洞见（Fernández「Black Ops Domain-Driven Design」：CEO 与开发分开画再对比）。

### 盯客户需要，别盯现成方案（12.1.1）

协作建模易掉进「先有解」：Business Model Canvas 上直接写成「App 要 chatbot」。应先啃清 **value proposition** 与 **customer segment**；可用 Value Proposition Canvas 加深（先填客户侧再填主张）。

EventStorming / Domain Storytelling 若围着**现有系统**转，会把补丁流程与 Excel 导出当成「业务」。拿掉系统名，讨论才回到客户需要与真问题。

## 策略–产品–架构连不上（12.1.2）

Business Model Canvas 帮对齐目标，却难回答「架构是否还跟得上战略」。口头战略像「没棋盘的下棋」——爱抄微服务 / 云 / Spotify / digital-first，却看不见自家景观。新系统叠在未对齐的旧系统上，只会更缠、更难跟战略变。

### Wardley Mapping

Wardley 策略环（孙武五事 + Boyd **OODA**）：先映射当前景观 → 气候模式 → Doctrine → 带目的的决策。给产品、团队、软件设计更贴语境的动作，而不是通用口号。

- **纵轴**：价值链式 / user needs（用户锚 → 需要 → 能力）——第 10 章已用它找 streamlets  
- **横轴**：演化阶段 Genesis / Custom Build / Product & Rental / Commodity & Utility——协作标定能力所处阶段，影响竞争、风险与管理方式  

BigScreen：把能力摆上演化轴后，立刻有人问「为何自建排片软件？」；IMAX 近市场天花板、4DX 在成熟——这些洞见可回写设计。更多步骤见 learnwardleymapping.com。

### Stressor analysis（韧性）

气候 = 作用在景观上的外力。**Stressor analysis**（O'Reilly residuality）：有序软件活在无序组织/市场里（hyperliminality）；未设计到的未来事件即 stressor。多 stressor 常汇入同一 **attractor**（缓解模式）——分析时**禁谈概率**（低概率事件也可能落到同一吸引子）。

做法：尽量列 stressor → 影响 / 检测 / 缓解（或从一个深挖、再自然冒出更多）。例：人人在家用 VR 看片 → 票房跌 → 媒体与销量监测 → 线上 VR 片库等缓解。缓解模式可回灌架构（韧性 Bounded Context）。列不出多少 → 可能系统并不复杂。

组织若严重竖井、无人有全图：先做 Big Picture EventStorming，再蒸馏业务侧面。
