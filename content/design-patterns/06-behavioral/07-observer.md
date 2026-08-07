+++
title = "Observer"
weight = 7
+++

## 意图

定义订阅机制，在对象事件发生时通知多个观察者。

## 问题与解法

- **问题**：一对象状态变化要通知未知数量、动态变化的他者；硬编码列表难扩展。
- **解法**：Publisher（Subject）维护订阅列表并通知；Subscriber 实现更新接口；可推/拉数据。

## 适用

一对多通知且集合动态；对象不应与订阅者具体类耦合。

## 取舍

松耦合通知。代价：通知顺序难控；泄漏订阅；意外循环更新。

## 易混 / 关系

MVC 中视图常观察模型；对比 Mediator、信号槽、现代事件总线。

## Go 示例

发布者维护订阅列表并广播。

```go
package main

import "fmt"

type Observer interface {
	Update(msg string)
}

type Subscriber struct{ name string }
func (s Subscriber) Update(msg string) {
	fmt.Printf("%s got: %s\n", s.name, msg)
}

type Publisher struct {
	subs []Observer
}

func (p *Publisher) Subscribe(o Observer) {
	p.subs = append(p.subs, o)
}
func (p *Publisher) Notify(msg string) {
	for _, s := range p.subs {
		s.Update(msg)
	}
}

func main() {
	p := &Publisher{}
	p.Subscribe(Subscriber{"A"})
	p.Subscribe(Subscriber{"B"})
	p.Notify("price changed")
}
```
