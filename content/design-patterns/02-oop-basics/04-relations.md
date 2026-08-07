+++
title = "对象间关系"
weight = 4
+++

从弱到强（均蕴含某种依赖）：

| 关系 | 含义 |
|--|--|
| **Dependency** | A 的代码提到 B，B 变可能牵动 A |
| **Association** | A 长期知道 B（字段或稳定可取回的引用） |
| **Aggregation** | A 包含 B 的集合；B 可独立、可共享 |
| **Composition** | A 由 B 组成且管 B 生命周期 |
| **Implementation** | A 实现接口 B，可当作 B 用 |
| **Inheritance** | A 继承 B 的接口与实现，可当作 B 用 |

图上不必画出所有 Dependency，只标对当前讨论重要的。原则「Favor Composition Over Inheritance」里的 composition，实务上多指**对象组合**（聚合/组合），相对继承树。
