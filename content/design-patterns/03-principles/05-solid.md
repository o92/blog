+++
title = "SOLID"
weight = 5
+++

### SRP — Single Responsibility Principle

一类一事、一个变化理由。类膨胀后难导航，且改 A 易误伤 B。把报表打印从 `Employee` 挪到独立类是典型拆分。

### OCP — Open/Closed Principle

已稳定、被多方使用的代码：优先**扩展**（新子类 / 新策略），避免直接改核心而砸客户端。修 bug 仍应改原类，不必为修 bug 建子类。用 Strategy 把配送方式从 `Order` 里拆出，即可新增方式而不改 `Order`。

### LSP — Liskov Substitution Principle

子类必须能替父类用。检查清单直觉：

- 参数类型：子类方法参数应更宽（逆变），不能更窄
- 返回类型：应更窄或相同（协变），不能更宽成无关类型
- 不抛客户端未预期的异常类型
- 不加强前置条件、不削弱后置条件；不破坏父类不变量
- 子类不应引入父类方法所禁止的副作用

违反时，看似「继承复用」，客户端一换实例就炸。

### ISP — Interface Segregation Principle

别让客户端实现用不到的方法。胖接口一改，无关实现方也被迫动。拆成细接口；一个类仍可实现多个。别拆过细导致接口爆炸。

### DIP — Dependency Inversion Principle

高层业务不要直接依赖低层磁盘/网络/DB 细节。双方都依赖**面向业务的抽象**（如 `openReport`），低层实现该抽象 → 依赖方向倒置。常与 OCP 同现：可换存储而不改报表逻辑。
