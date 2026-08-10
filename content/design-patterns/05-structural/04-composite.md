+++
title = "Composite"
weight = 4
+++

## 意图

把对象组成树结构，并让客户端以统一方式对待单对象与组合对象。

## 问题与解法

- **问题**：部分-整体层次（UI、文件系统、组织架构），若区分叶子与容器则客户端充满类型判断。
- **解法**：Component 声明通用操作；Leaf 实现；Composite 持有子节点并通常把操作委派下去。

## 使用场景

- 对象天然是部分-整体树：UI 控件树、文件系统、菜单、组织架构、嵌套订单/包裹。
- 希望客户端用同一套操作处理叶子与容器（如统一 `Draw`/`Price`/`Execute`），少写类型判断。
- 树结构会动态增删节点，需要递归把操作传到子节点。
- 例子：电商「盒子套盒子」算总价；图形编辑器组与图元统一变换；权限树节点统一校验；DOM 式组件树渲染。

## 优点

- 客户端代码简单：不必区分叶子与组合，多态调用即可。
- 增删节点灵活，易表示任意深度层次。
- 符合开闭：可新增 Component 类型（在接口稳定前提下）而不改遍历客户端。
- 与 Iterator / Visitor / Builder 搭配，遍历与构建都自然。
- 把「树操作」局部化在 Composite 里，避免散落的递归工具函数。

## 缺点

- 为统一接口，可能被迫给叶子提供无意义操作（或反过来让容器承担不该有的能力）。
- 难在类型系统里限制「某容器只能装特定子类型」（常靠运行时检查）。
- 过深或过大的树，递归操作有栈/性能风险，需注意。
- 共享子树、缓存、标识相等时语义变复杂。
- 简单列表场景不必上 Composite，直接切片即可。

## 易混 / 关系

常与 Builder / Iterator / Visitor 一起遍历或构建树；Decorator 结构相似但意图不同。

## Go 示例

电商礼盒可再套小礼盒：单品与盒子都算「可计价」，结账时对根礼盒调一次 `Price()` 即可递归求和。叶子与容器实现同一接口。

```go
package main

import "fmt"

type Component interface {
	Price() int
}

type Product struct{ price int } // 单品
func (p Product) Price() int { return p.price }

type Box struct{ kids []Component } // 礼盒（可嵌套）

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
	inner.Add(Product{10}) // 零食
	inner.Add(Product{20}) // 水杯
	root := &Box{}
	root.Add(inner)        // 内层礼盒
	root.Add(Product{5})   // 贺卡
	fmt.Println(root.Price()) // 35
}
```
