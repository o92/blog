+++
title = "三条设计原则"
weight = 4
+++

### Encapsulate What Varies

把易变逻辑（税率、渠道规则…）从稳定流程中抽出（方法 → 必要时独立类），变更时只打开「一个水密舱」。大量模式（Strategy、State、Factory…）都是在制度化这件事。

### Program to an Interface, not an Implementation

客户端依赖抽象契约；具体类可替换。配合多态，才能在运行时换算法、换产品族、换装饰，而不改调用方。

### Favor Composition Over Inheritance

继承复用快，但把子类钉死在父类接口与生命周期上，层次一深就脆。用组合把行为委托给协作对象，通常更易在运行时改配置。模式里 Decorator、Strategy、Bridge 等大量用组合。
