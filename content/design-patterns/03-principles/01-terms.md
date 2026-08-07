+++
title = "名词介绍"
weight = 1
+++

设计原则与模式导论专名。

## 模式

### Design Pattern

- **中文**：设计模式
- 软件设计中反复出现的问题的典型解法；是可定制的蓝图，不是可粘贴的库代码。不同于算法（步骤固定）：同一模式在不同程序中的代码可不同。

### Gang of Four

- **中文**：四人帮（GoF）
- Gamma / Helm / Johnson / Vlissides；1994《Design Patterns》将模式引入 OO 软件，收录 23 个模式（本书覆盖其中 22 个常用者，略有取舍叙述）。

### Creational Patterns

- **中文**：创建型模式
- 提供更灵活、可复用的对象创建机制。

### Structural Patterns

- **中文**：结构型模式
- 组装类与对象成更大结构，并保持灵活高效。

### Behavioral Patterns

- **中文**：行为型模式
- 关注对象间职责分配与有效通信。

## 设计原则

### Encapsulate What Varies

- **中文**：封装变化
- 找出易变点，与稳定部分隔离，把变更冲击限制在小舱室。

### Program to an Interface

- **中文**：面向接口编程
- 依赖抽象（接口/抽象类），而非具体类，便于替换实现。

### Favor Composition Over Inheritance

- **中文**：组合优于继承
- 优先用对象组合获得灵活性；继承耦合更强、层次易僵。

## SOLID

### Single Responsibility Principle

- **中文**：单一职责原则
- **简称**：SRP
- 一个类应只有一个引起它变化的理由。

### Open/Closed Principle

- **中文**：开闭原则
- **简称**：OCP
- 对扩展开放，对修改关闭。

### Liskov Substitution Principle

- **中文**：里氏替换原则
- **简称**：LSP
- 子类对象应能替换父类对象而不破坏客户端。

### Interface Segregation Principle

- **中文**：接口隔离原则
- **简称**：ISP
- 不应强迫客户端依赖它不用的方法；拆胖接口。

### Dependency Inversion Principle

- **中文**：依赖倒置原则
- **简称**：DIP
- 高层与低层都依赖抽象；细节依赖抽象，而非高层依赖细节。
