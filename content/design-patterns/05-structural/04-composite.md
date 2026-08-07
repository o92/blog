+++
title = "Composite"
weight = 4
+++

## 意图

把对象组成树结构，并让客户端以统一方式对待单对象与组合对象。

## 问题与解法

- **问题**：部分-整体层次（UI、文件系统、组织架构），若区分叶子与容器则客户端充满类型判断。
- **解法**：Component 声明通用操作；Leaf 实现；Composite 持有子节点并通常把操作委派下去。

## 适用

实现树形对象结构；希望客户端忽略叶子/容器差异。

## 取舍

简化树操作与客户端。代价：难限制组合中的组件类型；为统一接口可能做出过宽 API。

## 易混 / 关系

常与 Builder / Iterator / Visitor 一起遍历或构建树；Decorator 结构相似但意图不同。

## Go 示例

叶子与容器实现同一接口，客户端统一 `Price()`。

```go
package main

import "fmt"

type Component interface {
	Price() int
}

type Product struct{ price int }
func (p Product) Price() int { return p.price }

type Box struct{ kids []Component }

func (b *Box) Add(c Component) { b.kids = append(b.kids, c) }
func (b Box) Price() int {
	sum := 0
	for _, k := range b.kids {
		sum += k.Price()
	}
	return sum
}

func main() {
	inner := &Box{}
	inner.Add(Product{10})
	inner.Add(Product{20})
	root := &Box{}
	root.Add(inner)
	root.Add(Product{5})
	fmt.Println(root.Price()) // 35
}
```
