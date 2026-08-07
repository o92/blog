+++
title = "State"
weight = 8
+++

## 意图

对象在内部状态改变时改变行为，看起来像换了类。

## 问题与解法

- **问题**：状态多、转换多，巨型条件或状态机散落各处。
- **解法**：Context 持有当前 State；各 State 类实现状态下行为并可触发转换；状态对象可共享（享元）或新建。

## 适用

行为随状态大变且状态多、变更勤；想消除状态相关的大段条件。

## 取舍

状态局部化、符合 OCP。代价：状态类数量多；简单状态机可能过重。

## 易混 / 关系

与 Strategy 结构极像：State 常自知下一状态；Strategy 通常由客户端选择算法。

## Go 示例

行为随当前状态对象切换；状态可推动转换。

```go
package main

import "fmt"

type State interface {
	Publish(c *Document)
}

type Document struct{ state State }

func (d *Document) Publish() { d.state.Publish(d) }

type Draft struct{}
func (Draft) Publish(c *Document) {
	fmt.Println("draft -> moderation")
	c.state = Moderation{}
}

type Moderation struct{}
func (Moderation) Publish(c *Document) {
	fmt.Println("moderation -> published")
	c.state = Published{}
}

type Published struct{}
func (Published) Publish(c *Document) {
	fmt.Println("already published")
}

func main() {
	doc := &Document{state: Draft{}}
	doc.Publish()
	doc.Publish()
	doc.Publish()
}
```
