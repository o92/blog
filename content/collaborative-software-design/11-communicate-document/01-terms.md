+++
title = "名词介绍"
weight = 1
+++

本章专名（对应原书第 11 章）。

### Pros-Cons-and-Fixes

- **中文**：利弊与修补清单
- 在利弊表上多一列 **Fixes**：写下缺点后立刻想「如何中和 / 修补」。先写 **Pros**（对抗只盯坏处）；不是每个 con 都有 fix；fix 须**可执行**（「查一下是否」不算）。既是决策后果可视化，也可随时嵌进设计流；可扩一列 **Neutral**（语境决定利弊中性）。

### ADR (Architectural Decision Record)

- **中文**：架构决策记录
- Michael Nygard（2011）起流行的决策文档：至少含 **Title / Status / Context / Decision / Consequences**。格式自由（画布 / Markdown…），须易改。Status 常用 Proposed → Accepted → Superseded（被新 ADR 取代并互链，保留历史）。目的是减少「他们当时在想什么？」

### Whirlpool

- **中文**：建模漩涡（Model Exploration Whirlpool）
- Eric Evans 的模型探索图：非线性反馈环——Harvest & Document → 场景 / 模型 → code probe → 再挑战。协作建模应视为多环，而非「发现→战略→写码」直线。写 ADR / Pros-Cons 时，往往是**新一圈的开始**。

### Living Documentation

- **中文**：活文档
- 决策与模型随反馈持续改写；文档不是终点石碑。伴随「偶尔扔掉模型」——因为语境、人、市场、预算都在变。

### Model Fitting

- **中文**：模型硬塞 / 模型拟合
- 因依恋既有模型，扭曲、增删问题域要素硬塞进旧模型，而不是按新信息重设计。常叠 availability / loss aversion / sunk cost。
