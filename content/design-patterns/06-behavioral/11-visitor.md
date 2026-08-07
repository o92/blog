+++
title = "Visitor"
weight = 11
+++

## 意图

将算法与其作用的对象结构分离。

## 问题与解法

- **问题**：对象结构稳定，但要经常新增操作；把操作加进每个元素类会弄脏模型。
- **解法**：Visitor 为每种元素声明 `visitConcreteX`；元素实现 `accept(visitor)` 双分派；新操作=新 Visitor。

## 适用

需对复杂结构做多种操作且不想污染元素类；结构很少变、操作常变。

## 取舍

操作集中、易加新操作。代价：加新元素类型要改所有 Visitor；破坏封装若需大量 getter。

## 易混 / 关系

常遍历 Composite；现代语言可用模式匹配部分替代双分派。

## Go 示例

双分派在 Go 里偏啰嗦；结构稳定、操作常增时仍可用。现代代码也可用类型 switch 简化。

```go
package main

import "fmt"

type Shape interface {
	Accept(v Visitor)
}

type Visitor interface {
	VisitDot(d Dot)
	VisitCircle(c Circle)
}

type Dot struct{ X, Y int }
func (d Dot) Accept(v Visitor) { v.VisitDot(d) }

type Circle struct{ R int }
func (c Circle) Accept(v Visitor) { v.VisitCircle(c) }

type XMLExport struct{}
func (XMLExport) VisitDot(d Dot) {
	fmt.Printf("<dot x=%d y=%d/>\n", d.X, d.Y)
}
func (XMLExport) VisitCircle(c Circle) {
	fmt.Printf("<circle r=%d/>\n", c.R)
}

func main() {
	shapes := []Shape{Dot{1, 2}, Circle{5}}
	v := XMLExport{}
	for _, s := range shapes {
		s.Accept(v)
	}
}
```
