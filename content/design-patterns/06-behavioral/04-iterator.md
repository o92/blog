+++
title = "Iterator"
weight = 4
+++

## 意图

在不暴露集合内部表示的前提下遍历元素。

## 问题与解法

- **问题**：集合结构各异（树、图、列表），遍历逻辑若写进集合或客户端会泄漏细节且难复用。
- **解法**：Iterator 接口（`hasNext`/`next` 等）；具体迭代器知道集合结构；集合工厂方法产出迭代器。

## 适用

复杂结构需统一遍历；希望同一集合多种遍历；隔离算法与结构。

## 取舍

单一遍历职责、开闭。代价：简单集合可能多余；迭代中改集合要约定失效规则。

## 易混 / 关系

与 Composite 绝配；语言内置 foreach 往往已是迭代器模式。

## Go 示例

手写 `HasNext`/`Next`；生产代码也可直接用 `for range` 或 `iter.Seq`（Go 1.23+）。

```go
package main

import "fmt"

type Iterator[T any] interface {
	HasNext() bool
	Next() T
}

type sliceIter[T any] struct {
	data []T
	i    int
}

func NewSliceIter[T any](data []T) *sliceIter[T] {
	return &sliceIter[T]{data: data}
}
func (it *sliceIter[T]) HasNext() bool { return it.i < len(it.data) }
func (it *sliceIter[T]) Next() T {
	v := it.data[it.i]
	it.i++
	return v
}

func main() {
	it := NewSliceIter([]string{"a", "b", "c"})
	for it.HasNext() {
		fmt.Println(it.Next())
	}
}
```
