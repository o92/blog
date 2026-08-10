+++
title = "Iterator"
weight = 4
+++

## 意图

在不暴露集合内部表示的前提下遍历元素。

## 问题与解法

- **问题**：集合结构各异（树、图、列表），遍历逻辑若写进集合或客户端会泄漏细节且难复用。
- **解法**：Iterator 接口（`hasNext`/`next` 等）；具体迭代器知道集合结构；集合工厂方法产出迭代器。

## 使用场景

- 集合内部结构复杂（树、图、跳表），不想把遍历细节暴露给客户端。
- 同一集合需要多种遍历方式（前序/中序、过滤遍历、只读快照遍历）。
- 希望遍历算法可复用，且与集合实现分离，便于替换底层结构。
- 例子：文件系统树遍历；社交图谱邻居迭代；ORM 惰性集合；Go 中自定义类型实现 `iter.Seq` 供 `for range`。

## 优点

- 单一职责：集合管存储，迭代器管遍历。
- 符合开闭：可新增迭代器类型而不改集合客户端用法。
- 可并行持有多个独立迭代器，互不影响位置。
- 统一接口让算法（搜索、折叠）与具体结构解耦。
- 语言级 foreach 多建立在迭代器思想上，迁移成本低。

## 缺点

- 对简单数组/切片，手写迭代器多余，直接索引或 `range` 即可。
- 遍历中修改集合需要明确失效规则，否则易产生诡异行为。
- 每个集合类型一个具体迭代器时，样板代码偏多。
- 某些惰性/远程迭代要处理资源释放与取消。
- 封装良好的迭代器可能限制「随机访问」等特殊需求。

## 易混 / 关系

与 Composite 绝配；语言内置 foreach 往往已是迭代器模式。

## Go 示例

遍历自定义歌曲列表时，客户端只靠 `HasNext`/`Next`，不碰内部切片下标。生产代码也可直接用 `for range` 或 `iter.Seq`（Go 1.23+）。

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
	playlist := []string{"intro", "verse", "outro"}
	it := NewSliceIter(playlist)
	for it.HasNext() {
		fmt.Println(it.Next())
	}
}
```
