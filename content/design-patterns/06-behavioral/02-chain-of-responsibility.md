+++
title = "Chain of Responsibility"
weight = 2
+++

## 意图

沿处理者链传递请求；每个处理者决定处理或交给下一个。

## 问题与解法

- **问题**：请求种类与处理顺序多变，若用巨型条件或硬编码接收者则僵硬。
- **解法**：Handler 接口；具体处理者做自己的事并可选转发；可动态组链。

## 适用

多种请求多种处理；发射端不应与具体接收者耦合；集合可在运行时改。

## 取舍

控耦合、可组合。代价：请求可能无人处理；链过长难调试；不保证处理。

## 易混 / 关系

常与 Composite 结合（父链）；对比 Decorator（都可嵌套，意图不同）。

## Go 示例

处理者决定处理或交给 `next`。

```go
package main

import "fmt"

type Handler interface {
	SetNext(Handler) Handler
	Handle(amount int)
}

type base struct{ next Handler }

func (b *base) SetNext(h Handler) Handler {
	b.next = h
	return h
}
func (b *base) forward(amount int) {
	if b.next != nil {
		b.next.Handle(amount)
	}
}

type Cashier struct{ base }
func (c *Cashier) Handle(amount int) {
	if amount <= 100 {
		fmt.Println("cashier handles", amount)
		return
	}
	c.forward(amount)
}

type Manager struct{ base }
func (m *Manager) Handle(amount int) {
	if amount <= 1000 {
		fmt.Println("manager handles", amount)
		return
	}
	m.forward(amount)
}

func main() {
	cashier := &Cashier{}
	manager := &Manager{}
	cashier.SetNext(manager)
	cashier.Handle(50)
	cashier.Handle(500)
}
```
