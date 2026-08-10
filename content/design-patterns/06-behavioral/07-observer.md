+++
title = "Observer"
weight = 7
+++

## 意图

定义订阅机制，在对象事件发生时通知多个观察者。

## 问题与解法

- **问题**：一对象状态变化要通知未知数量、动态变化的他者；硬编码列表难扩展。
- **解法**：Publisher（Subject）维护订阅列表并通知；Subscriber 实现更新接口；可推/拉数据。

## 使用场景

- 一个对象状态变化后，要通知数量未知、集合会变的一组依赖者。
- 希望被观察者不依赖具体观察者类型，只依赖抽象订阅接口。
- 事件驱动 UI、领域事件、配置变更广播等「一对多」通知。
- 例子：表格数据变更刷新多个图表；消息中间件的发布订阅；股价变动推送持仓视图；MVC 里视图观察模型。

## 优点

- 松耦合：发布者与订阅者可独立演进。
- 动态订阅/退订，扩展新观察者通常不必改发布者。
- 符合开闭：加订阅方即可响应新需求。
- 支持广播，一次状态变更触达多方。
- 推/拉模型可按数据量与隐私需求选择。

## 缺点

- 通知顺序通常不保证，依赖顺序会埋雷。
- 忘记退订易泄漏；循环更新（A 通知 B，B 又改 A）可导致栈溢出或抖动。
- 调试难：看不到显式调用链，行为「跳来跳去」。
- 高频事件可能造成性能问题，需要合并/节流。
- 发布者若在通知中修改订阅列表，要实现安全遍历约定。

## 易混 / 关系

MVC 中视图常观察模型；对比 Mediator、信号槽、现代事件总线。

## Go 示例

商品改价后，关注该商品的订阅者都要收到通知。发布者维护订阅列表，`Notify` 时广播给所有观察者。

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

type PriceSubject struct { // 商品价格主题
	subs []Observer
}

func (p *PriceSubject) Subscribe(o Observer) {
	p.subs = append(p.subs, o)
}
func (p *PriceSubject) Notify(msg string) {
	for _, s := range p.subs {
		s.Update(msg)
	}
}

func main() {
	p := &PriceSubject{}
	p.Subscribe(Subscriber{"A"})
	p.Subscribe(Subscriber{"B"})
	p.Notify("price changed")
}
```
