+++
title = "多角色、旅程与能力对齐"
weight = 3
+++

对应原书 **12.2**：软件设计只是组织周期的一小段；工具可跨域。

## 不同角色，不同建模需要（12.2.1）

协作建模也服务管需求的 Product Owner / Product Manager、管战略的 Chief Technology Officer、管旅程的 User Experience——作者甚至用 EventStorming 办婚礼。工具可跨域；需要不同。

### Customer Journey vs User Journey

| | Customer Journey | User Journey |
|--|--|--|
| 焦点 | 更广的客户体验与触点 | 与产品交互的步骤与卡点 |
| 典型用途 | 营销 / 全链路体验 | 产品设计与开发 |

共同：从客户/用户视角可视化阶段。Customer journey 适合当多种会话的底板（User Story Mapping / EventStorming / Wardley…）。

### User Story Mapping

把用户故事贴回客户旅程叙事：交付相关角色同场，避免「自说自话式 backlog」。故事从叙事流出，增量与对齐更容易。

### Impact Mapping

四问：

1. **Why** — 真正目标（「做个电影院 App」不够；要早鸟预订 / 满意度 / 广告收入等）  
2. **Who** — 影响目标达成的 Actors（含会阻挡的人）  
3. **How** — 需要的行为变化（Impact）  
4. **What** — 交付物  

利于优先级、假设可视化、在「尚未迷恋方案」时探索路径（对抗 availability 等）。

## Customer Journey + EventStorming（12.2.2）

User Experience 设计独自画好的旅程常躺在共享盘里——EventStorm 现场才发现开发几乎没人见过。应把已有旅程 / 线框带进 Big Picture：校验旅程是否嵌得进架构，并用领域事件标痛点与机会。旅程管「客户要经历什么」；EventStorm 补「系统如何支撑」。

## Capabilities 对齐策略（12.2.3）

语境清楚后，评估现有能力与缺口。

### Team Topologies

最解耦的微服务架构也可能把横切与协作成本堆给团队——**认知负荷**（Sweller）是工程管理议题。与管理一起用 Team Topologies 映射团队与交互，对准独立业务流；随系统变化把高协作关系演进到 as-a-service。结合 Domain-Driven Design + Wardley 见 Kaiser 等延伸阅读。

### Maturity Mapping / Change mapping

现代化时可用 **enabling team** 注入可观测性等新能力。别只靠静态技能矩阵假装「能力齐了」——语境不同，能力需求不同。**Maturity Mapping**（Burgauer & McDermott）：能力当实践，Novel → Emerging → Good → Best；顶锚是业务问题。团队可实验推进实践；经理可对齐个人成长 / 专才招聘 / 多队共用问题是否该建 enabling team。
