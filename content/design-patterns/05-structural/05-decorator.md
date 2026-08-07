+++
title = "Decorator"
weight = 5
+++

## 意图

通过把对象放入包装对象中，动态地为对象附加行为。

## 问题与解法

- **问题**：用继承叠加功能会导致子类爆炸，且行为组合在编译期固定。
- **解法**：装饰者与组件实现同一接口；装饰者持有组件引用，可在委托前后加行为；可多层嵌套。

## 适用

需在运行时透明加责；用继承扩展不现实或禁止继承时。

## 取舍

比继承更灵活的扩展。代价：难去掉特定包装；身份比较（==）易坑；配置堆栈复杂。

## 易混 / 关系

对比 Adapter（改接口）、Proxy（控访问）、Composite（树）。Java I/O 流是经典例子。

## Go 示例

同接口包装，可多层嵌套叠加行为。

```go
package main

import "fmt"

type Notifier interface {
	Send(msg string)
}

type EmailNotifier struct{}
func (EmailNotifier) Send(msg string) { fmt.Println("email:", msg) }

type SMSDecorator struct{ wrap Notifier }
func (d SMSDecorator) Send(msg string) {
	d.wrap.Send(msg)
	fmt.Println("sms:", msg)
}

type SlackDecorator struct{ wrap Notifier }
func (d SlackDecorator) Send(msg string) {
	d.wrap.Send(msg)
	fmt.Println("slack:", msg)
}

func main() {
	var n Notifier = EmailNotifier{}
	n = SMSDecorator{wrap: n}
	n = SlackDecorator{wrap: n}
	n.Send("deployed")
}
```
