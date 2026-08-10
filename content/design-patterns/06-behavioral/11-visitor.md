+++
title = "Visitor"
weight = 11
+++

## 意图

将算法与其作用的对象结构分离。

## 问题与解法

- **问题**：对象结构稳定，但要经常新增操作；把操作加进每个元素类会弄脏模型。
- **解法**：Visitor 为每种元素声明 `visitConcreteX`；元素实现 `accept(visitor)` 双分派；新操作=新 Visitor。

## 使用场景

- 对象结构相对稳定，但经常要在其上增加新操作（导出、校验、统计、美化打印）。
- 不想把这些操作塞进每个元素类，以免领域模型被「操作」污染。
- 需要对异构结构做类型相关行为，又希望操作集中在一处（双分派）。
- 例子：编译器 AST 上的类型检查/代码生成；文档对象树上的导出 PDF/HTML；购物车条目上的多种计价/税务访问；图形场景的碰撞检测与渲染分离。

## 优点

- 新增操作通常只需新 Visitor，不必改所有元素类（结构稳定时）。
- 相关操作集中，符合单一职责，便于复用同一遍历。
- 可在访问者中累积状态（一次遍历完成统计）。
- 与 Composite 搭配时，递归 accept 很自然。
- 把「算法」从「数据对象」中抽离，模型更干净。

## 缺点

- 每加一种新元素类型，通常要改所有 Visitor，扩展方向与「加操作」相反。
- 为让 Visitor 工作，元素常需暴露较多内部，有破坏封装风险。
- 双分派样板多，Go 等语言更啰嗦，团队接受度不一。
- 循环依赖：元素与 Visitor 接口常互相引用，模块边界要设计好。
- 现代语言的模式匹配/类型 switch 在不少场景可替代，勿为模式而模式。

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
