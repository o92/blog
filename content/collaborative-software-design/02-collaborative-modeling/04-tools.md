+++
title = "工具：问题空间与解决方案空间"
weight = 4
+++

对应原书 **2.3**：多视角为何需要多工具；Problem / Solution Space；Business Model Canvas、EventStorming、Example Mapping、Domain Storytelling；以及何时用什么。

## 多地图，无银弹（2.3）

复杂业务问题常需多视角；每个协作建模工具是一种抽象——没有银弹。书用去阿姆斯特丹国立博物馆打比方：地铁图能换线，却不告诉你站到馆多远；骑行、驾车又要别的图；组合几张图才谈得上「较优路线」，还可能逼出原问题没说清的价值权衡（时间 vs 钱）。多工具 → 多种领域模型 → 更深洞见与更多可选方案。

| 空间 | 在做什么 |
|--|--|
| **Problem Space** | 探索/定义挑战；这里的领域模型引导后续怎么设计方案 |
| **Solution Space** | 设计输出；可实现/实验多种领域模型，看哪个更有效；方案又可能回流成新问题 |

工具可独立、可组合、可中途切换。书后文重点常是社会动力学；工具细节另有专书（Brandolini、Domain Storytelling、Visual Collaboration Tools 等，见原书 Further reading）。

## Business Model Canvas（问题空间）

许多造系统的团队答不上「公司靠什么赢」。语境对齐了，才更好决策、排序，并**跟公司一起想**怎么成功。战略含商业模式；作者偏爱 Osterwalder 的 **Business Model Canvas**：简单好用。四大块：价值主张（Offerings）、客户、基础设施、财务。

建议先填**价值主张**（顾客为何选我们而不是对手；可从营销策略问：我们提供什么？为何用我们？），再铺开其余格。团队可先自填 → 请领域专家校验；借机捕获领域语言（如「mobile generation」）作为统一语言起点。财务格对日常开发决策帮助常较小，可淡化。业务侧往往熟悉这张画布；开发侧有时要先用过才体会其重要。

## EventStorming（2.3.2）

搞清商业模式后，常用 EventStorming 把「购票」整条价值流可视化（书称 flow：客户旅程 + 业务流程 + 更多）。强项：快速共享理解、边做边学会；结构「刚好够」跨职能协作。

Alberto Brandolini 在 Domain-Driven Design 语境下推广，Leanpub 电子书里写了三类：

| 类型 | 大致用途 | 空间感 |
|--|--|
| **Big Picture** | 企业/业务线/域全景（常 30–40 人）。例：从拿版权 → 排片 → 订票 → 放映日整域 | 偏问题空间 |
| **Process Modeling** | as-is / to-be 旅程与流程；可多团队 | 问题与方案两端 |
| **Software Design** | 按业务场景做实现向设计 | 偏解决方案空间 |

会话里常会**从一类滑到另一类**（全景发现问题段 → 改 Process；as-is 谈着谈着进 to-be）。邀请函里往往**不写死类型**，减少干系人困惑。业界口语里的「EventStorming」有时默认指软件/聚合设计——那是早期用法，类型其实更宽。

**准备**：够大的建模空间 + 橙色便签（事件）。线下更易「混沌发现」；线上要更结构化，并会前预热工具。

**常见骨架**

1. **Chaotic exploration**：人人写能想到的 **Domain Event**（业务相关、通常**过去时**：「票已购买」「座位已预留」）。技术故障（断库、DDoS）一般先不当作利益相关方相关事件，等场景够清楚再谈。新手常把「动作/将来」写成事件——引导者帮他们分清；词不准也先写下，稍后改。
2. **Enforce timeline**：合并、排序；冲突、缺知识、分叉标 **Hotspot**，先走完主路径再回头。
3. 按需加命令、策略、系统、角色等；颜色与命名可本地化，图例里随时加新颜色。

核心常是：**事件时间线 + Hotspot**。一次可多场景，之后用泳道分开。

## Example Mapping（2.3.3）

EventStorming 擅整段时间线；不擅「时间线上某一刻的多种情形」。例如「Reserve Seats」可能走到「座位已预留」或「无座」——背后一堆约束（一座一票、必须连座……）。这时，或讨论卡在一堆 what-if 时，适合切到 **Example Mapping**（Matt Wynne，Behavior-Driven Development 社区）：把某一时刻的例子与规则摊开，发现验收标准；也可吃 EventStorming 里标出的约束。

**独立可用**，不必先做 EventStorming；有一条 user story / use case 即可。起步：黄便签写故事 → 下蓝便签写已知规则 → 绿便签写具体例子（能画图更好）。原则 **You think it, you write it**。线下常用索引卡，好挪。例子爆炸或混进多种选项 → 可能该拆新规则。建议短时 timebox；角色越多元（含测试视角）边角越多。弱项：不画整段流程，容易继续讨论「看不见」的东西。

## Domain Storytelling（2.3.4）

Henning Schwentner / Stefan Hofer：图标 + 箭头 + 序号讲故事。易**边谈边记**、即时校验；图几乎不证自明；擅显示人/群体/系统之间的协作（EventStorming 的事件时间线较难一眼看出协作密度）。通常聚焦**单一场景**；EventStorming 更易多场景泳道。可含遗留系统名，也可**去掉系统名**，把讨论拉回业务目标。图标集可按子域改，会中约定并写入图例。有开源工具 Egon.io 方便线上共享。

结构化可能降低「混沌发现」量；对爱钻细节（Deep vs Wide）的群体，有助于控范围。

## 何时用什么（2.3.5，经验表摘要）

按群体经验、问题/方案空间、要的信息类型选；表可随你经验改。

| 工具 | 何时 | 强 | 弱 | 空间 |
|--|--|--|--|--|
| Big Picture EventStorming | 企业/业务线/域全景 | 好学、混沌出洞见 | 人多、要熟手引导；只靠时间线 | 问题 |
| Process Modeling EventStorming | 故事/流程/时间线 | 同上 | 概念难、像很费时；只靠时间线 | 两端 |
| Software Design EventStorming | 为利益相关方需要做软件设计 | 同上 | 同上 | 方案 |
| Example Mapping | 某一刻的多例子与规则 | 最易上手；可形式化验收 | 不画流程 | 两端 |
| Business Model Canvas | 公司语境与战略 | 业务侧常已熟 | 离代码远，开发侧要先体会价值 | 问题 |
| Domain Storytelling | 单一场景/流程 | 几乎无学习曲线；即时文档 | 结构化可能少发现 | 两端 |

**新手**：先在熟悉环境用简单工具（如对一条 user story 做 Example Mapping，只问「给我一个例子？」），不必一上来就请一屋子干系人。
