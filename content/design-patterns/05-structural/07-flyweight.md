+++
title = "Flyweight"
weight = 7
+++

## 意图

通过共享对象的公共状态，在有限内存中支撑大量细粒度对象。

## 问题与解法

- **问题**：海量相似对象把 RAM 打满，其中大量字段其实可共享。
- **解法**：拆分内在状态（可共享，放享元）与外在状态（上下文传入）；工厂按键复用享元实例。

## 适用

仅当对象极多、内在状态可共享、且愿意把外在状态外置时使用。

## 取舍

大幅省内存。代价：代码复杂；CPU 可能因反复计算外在相关逻辑而上升；线程共享要谨慎。

## 易混 / 关系

常与 Composite 组树；不要与缓存/池化概念完全等同，意图是共享不可变内在状态。

## Go 示例

内在状态（树种）共享；外在状态（坐标）由上下文传入。

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
