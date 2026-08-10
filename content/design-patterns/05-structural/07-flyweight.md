+++
title = "Flyweight"
weight = 7
+++

## 意图

通过共享对象的公共状态，在有限内存中支撑大量细粒度对象。

## 问题与解法

- **问题**：海量相似对象把 RAM 打满，其中大量字段其实可共享。
- **解法**：拆分内在状态（可共享，放享元）与外在状态（上下文传入）；工厂按键复用享元实例。

## 使用场景

- 系统中存在海量细粒度对象，内存成为瓶颈。
- 对象之间大量状态其实相同，可抽成可共享的内在状态（最好不可变）。
- 外在状态（坐标、上下文）可以外置，由客户端在调用时传入。
- 愿意用一定 CPU/复杂度换内存（反复结合外在状态计算）。
- 例子：森林里成千上万棵树共享「树种纹理」；文字编辑器共享字符字形；粒子系统共享粒子原型；棋盘大量相同棋子类型。

## 优点

- 显著降低内存占用（对象数极大时收益明显）。
- 把可共享状态集中管理，缓存命中后创建成本下降。
- 迫使你分清内在/外在状态，模型更清晰。
- 可与 Factory 结合按键复用享元实例。
- 在图形、文本、游戏等场景有成熟先例。

## 缺点

- 代码更绕：每次操作都要传入外在状态，API 变丑。
- 可能增加 CPU（运行时拼状态、查表）。
- 共享对象通常应不可变；一旦可变，并发与串改风险很高。
- 对象不多或状态几乎无法共享时，纯属过度设计。
- 与普通对象池/缓存概念易混：享元强调共享不可变内在状态，不是简单复用生命周期。

## 易混 / 关系

常与 Composite 组树；不要与缓存/池化概念完全等同，意图是共享不可变内在状态。

## Go 示例

渲染一片森林时，上千棵橡树只需共享同一份「树种」数据（名称、颜色），坐标因树而异。内在状态由工厂缓存复用，外在状态（坐标）由上下文传入。

```go
package main

import "fmt"

type TreeType struct {
	Name, Color string // intrinsic
}

func (t TreeType) Draw(x, y int) {
	fmt.Printf("%s/%s at (%d,%d)\n", t.Name, t.Color, x, y)
}

type TreeFactory struct {
	cache map[string]*TreeType
}

func NewTreeFactory() *TreeFactory {
	return &TreeFactory{cache: map[string]*TreeType{}}
}

func (f *TreeFactory) Get(name, color string) *TreeType {
	key := name + ":" + color
	if t, ok := f.cache[key]; ok {
		return t
	}
	t := &TreeType{Name: name, Color: color}
	f.cache[key] = t
	return t
}

type Tree struct {
	X, Y int
	Type *TreeType
}

func main() {
	f := NewTreeFactory()
	trees := []Tree{
		{1, 2, f.Get("oak", "green")},
		{3, 4, f.Get("oak", "green")}, // 复用同一 TreeType
	}
	for _, t := range trees {
		t.Type.Draw(t.X, t.Y)
	}
	fmt.Println("types cached:", len(f.cache))
}
```
