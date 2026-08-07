+++
title = "Prototype"
weight = 5
+++

## 意图

复制已有对象，而不使代码依赖其具体类。

## 问题与解法

- **问题**：只知道接口却要复制对象，或构造很贵，或配置组合太多不宜为每种建子类。
- **解法**：原型声明 `clone`；具体类实现拷贝（注意深/浅拷贝）；客户端向原型要副本。

## 适用

代码不应依赖要复制的具体类（如第三方对象）；用原型注册表管理预配置实例。

## 取舍

克隆代替复杂构造；减少子类。代价：循环引用与深拷贝难；私有字段克隆麻烦。

## 易混 / 关系

可代替 Abstract Factory 的某种配置；常与 Command / Memento 等需复制状态的模式联用。

## Go 示例

实现 `Clone`；注意切片/指针要按需深拷贝。

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
