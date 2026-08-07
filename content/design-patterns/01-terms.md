+++
title = "名词介绍"
weight = 1
+++

设计模式相关专名。悬停看气泡；「显示更多」跳到本页词条。

## 领域逻辑

### Rich Domain Model

- **中文**：充血模型
- 对象同时承载**数据与行为**；业务规则、不变量放在模型内。对应 PoEAA / DDD 中的 **Domain Model** 落地方式。

### Anemic Domain Model

- **中文**：贫血模型
- **反模式**（Martin Fowler）：对象几乎只有字段与访问器，行为堆在外部 Service。看起来像 OO，实质更接近过程式脚本。

### Domain Model

- **中文**：领域模型（模式名）
- Fowler《企业应用架构模式》中的领域逻辑组织方式。实践上对应 **Rich Domain Model**；若做成 **Anemic Domain Model** 则名不副实。与 DDD 战术中的 Domain Model 一脉相承。
