+++
title = "Chain of Responsibility"
weight = 2
+++

## 意图

沿处理者链传递请求；每个处理者决定处理或交给下一个。

## 问题与解法

- **问题**：请求种类与处理顺序多变，若用巨型条件或硬编码接收者则僵硬。
- **解法**：Handler 接口；具体处理者做自己的事并可选转发；可动态组链。

## 使用场景

- 多个对象都可能处理同一请求，具体由谁处理要在运行时决定。
- 希望发送方不与具体接收者耦合，只把请求丢进处理链。
- 处理顺序或参与者集合会变，需要可动态组链/插拔。
- 例子：HTTP 中间件（鉴权→限流→业务）；客服工单按级别升级；GUI 事件从控件冒泡到窗口；日志按级别过滤后交给下一处理器。

## 优点

- 发送者与接收者解耦，符合单一职责：每个处理者只关心自己能处理的部分。
- 可运行时调整链的顺序与成员，扩展新处理者通常只需加环。
- 请求可被部分处理、转换后再转发，组合灵活。
- 避免巨大的 if/else 或中央分发器里堆所有条件。
- 与 Composite 结合时，可沿父链自然上传。

## 缺点

- 不保证一定有人处理：可能静默落到链尾（需明确默认策略）。
- 链过长时调试困难，性能也受线性传递影响。
- 处理顺序敏感，配置错误会导致难查的逻辑 bug。
- 运行时动态改链要注意并发安全。
- 简单「固定两三个分支」场景用职责链可能过重。

## 易混 / 关系

常与 Composite 结合（父链）；对比 Decorator（都可嵌套，意图不同）。

## Go 示例

退款审批按金额升级：柜员处理 ≤100，更大额交给经理。每个处理者决定自己处理或 `forward` 给 `next`。

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

type Cashier struct{ base } // 柜员
func (c *Cashier) Handle(amount int) {
	if amount <= 100 {
		fmt.Println("cashier handles", amount)
		return
	}
	c.forward(amount)
}

type Manager struct{ base } // 经理
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
