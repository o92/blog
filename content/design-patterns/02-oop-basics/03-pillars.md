+++
title = "四大支柱"
weight = 3
+++

### Abstraction

程序里的对象很少 1:1 复制现实。只在**当前上下文**保留有用属性与行为。同一 `Airplane`，在飞行模拟与订票系统中模型完全不同。

### Encapsulation

像汽车只暴露钥匙/踏板：内部状态与复杂步骤藏起来，对外只留窄接口。`private` / `protected` 是手段；语言里的 interface 类型则把「可协作的行为契约」写死，方便替换实现。

### Inheritance

为复用而在已有类上扩展。代价：子类继承父类接口，抽象方法往往必须实现；多数语言只能单继承父类，但可实现多个接口。

### Polymorphism

客户端握着 `Animal`，运行时仍走到 `Cat.makeSound` / `Dog.makeSound`。模式大量依赖：对接口编程 + 运行时替换具体策略 / 状态 / 装饰者。
