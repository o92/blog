+++
title = "Mediator"
weight = 5
+++

## 意图

减少对象间混乱依赖：不让对象显式互指，而通过中介者协作。

## 问题与解法

- **问题**：UI 控件或组件两两引用，改一处牵一片。
- **解法**：组件只依赖 Mediator 接口；具体中介者知道协作规则并转发；组件发事件而非直呼同伴。

## 适用

组件紧耦合难改；要在一个地方复用交互；跨组件流程集中。

## 取舍

降耦合、集中交互。代价：中介者可能膨胀成上帝对象。

## 易混 / 关系

对比 Facade（单向简化子系统）、Observer（信号分发）、Mediator 强调多方协同规则。

## Go 示例

组件不互调，只通知中介者。

```go
package main

import "fmt"

type Mediator interface {
	Notify(sender, event string)
}

type Button struct {
	name string
	m    Mediator
}
func (b *Button) Click() { b.m.Notify(b.name, "click") }

type Dialog struct {
	ok, cancel *Button
}

func (d *Dialog) Notify(sender, event string) {
	switch {
	case sender == "ok" && event == "click":
		fmt.Println("submit form")
	case sender == "cancel" && event == "click":
		fmt.Println("close dialog")
	}
}

func main() {
	d := &Dialog{}
	d.ok = &Button{name: "ok", m: d}
	d.cancel = &Button{name: "cancel", m: d}
	d.ok.Click()
	d.cancel.Click()
}
```
