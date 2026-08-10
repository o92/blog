+++
title = "Prototype"
weight = 5
+++

## 意图

复制已有对象，而不使代码依赖其具体类。

## 问题与解法

- **问题**：只知道接口却要复制对象，或构造很贵，或配置组合太多不宜为每种建子类。
- **解法**：原型声明 `clone`；具体类实现拷贝（注意深/浅拷贝）；客户端向原型要副本。

## 使用场景

- 只知道对象接口，却需要复制一份，且不应依赖其具体类（插件、第三方类型）。
- 对象初始化昂贵（读配置、连远程、预计算），复制已有实例比从头构造更划算。
- 配置组合极多，不宜为每种组合建子类，可用「预配置原型 + 克隆后微调」。
- 需要在运行时注册一批标准模板（原型注册表），按名称取出克隆。
- 例子：图形编辑器复制形状；游戏中克隆敌兵模板再改血量；工作流节点模板复制；命令对象复制后投入队列。

## 优点

- 克隆代替复杂构造，减少对具体类构造细节的依赖。
- 可减少「为每种配置建子类」带来的类爆炸。
- 运行时动态添加/更换原型，扩展灵活。
- 与注册表结合后，创建入口统一，客户端代码更简单。
- 在需要「先有一个像样默认再改」的场景里，比多次 setter 更自然。

## 缺点

- 深拷贝与浅拷贝选择难：循环引用、共享资源、文件句柄都要明确策略。
- 含私有字段或外部资源时，克隆实现可能很别扭或不得不破坏封装。
- 克隆出的对象若误共享可变内在状态，会出现隐蔽的串改 bug。
- 并非所有类型都适合克隆（涉及唯一身份、事务、连接的对象要小心）。
- 语言若无内建克隆约定，每个类型手写 `Clone` 易不一致、易漏字段。

## 易混 / 关系

可代替 Abstract Factory 的某种配置；常与 Command / Memento 等需复制状态的模式联用。

## Go 示例

图形编辑器里选中红色圆，复制出一份再改成蓝色，避免从零重建。实现 `Clone` 即可；含切片/指针时要按需深拷贝。

```go
package main

import "fmt"

type Shape interface {
	Clone() Shape
	String() string
}

type Circle struct {
	Radius int
	Color  string
}

func (c Circle) Clone() Shape {
	cp := c // 值拷贝；若含引用字段需手动深拷贝
	return cp
}

func (c Circle) String() string {
	return fmt.Sprintf("Circle(r=%d,%s)", c.Radius, c.Color)
}

func main() {
	proto := Circle{Radius: 10, Color: "red"}
	c2 := proto.Clone().(Circle)
	c2.Color = "blue"
	fmt.Println(proto, c2)
}
```
