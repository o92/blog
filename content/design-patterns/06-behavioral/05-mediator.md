+++
title = "Mediator"
weight = 5
+++

## 意图

减少对象间混乱依赖：不让对象显式互指，而通过中介者协作。

## 问题与解法

- **问题**：UI 控件或组件两两引用，改一处牵一片。
- **解法**：组件只依赖 Mediator 接口；具体中介者知道协作规则并转发；组件发事件而非直呼同伴。

## 使用场景

- 一组对象两两依赖、互相调用，改一处牵一片（典型如复杂对话框控件网）。
- 希望把交互规则集中到一处，组件只报告事件、不直呼同伴。
- 同一套组件要在不同交互流程下复用，差异放在中介者。
- 例子：航空管制塔调度飞机；聊天室中介转发消息；向导页各步骤控件联动；微服务里的编排服务（注意别做成全能 ESB）。

## 优点

- 显著减少对象间网状依赖，组件更可独立理解与复用。
- 交互变更集中在中介者，符合开闭（多改中介、少改组件）。
- 便于统一日志、权限、流程审计。
- 组件接口更窄：只依赖 Mediator，不依赖具体同伴类型。
- 复杂 UI/工作流里可读性通常优于散落的互相引用。

## 缺点

- 中介者易膨胀成上帝对象，内部又变回难维护的条件丛林。
- 所有流量经中介，可能成为性能与可用性热点。
- 调试要在「组件 ↔ 中介」之间来回跳。
- 划分不当会与 Facade / 事件总线职责重叠。
- 简单两三个对象协作时，引入中介者过重。

## 易混 / 关系

对比 Facade（单向简化子系统）、Observer（信号分发）、Mediator 强调多方协同规则。

## Go 示例

对话框里 OK / Cancel 互不直连：点按钮只通知中介者，由 Dialog 决定提交表单还是关闭。组件之间不互相调用。

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
