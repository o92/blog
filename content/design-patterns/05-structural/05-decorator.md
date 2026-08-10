+++
title = "Decorator"
weight = 5
+++

## 意图

通过把对象放入包装对象中，动态地为对象附加行为。

## 问题与解法

- **问题**：用继承叠加功能会导致子类爆炸，且行为组合在编译期固定。
- **解法**：装饰者与组件实现同一接口；装饰者持有组件引用，可在委托前后加行为；可多层嵌套。

## 使用场景

- 需要在运行时动态叠加职责（日志、加密、压缩、鉴权），且组合方式多变。
- 用继承扩展会导致子类爆炸，或行为组合在编译期被写死。
- 希望对客户端透明：装饰后仍是同一接口，可继续被装饰。
- 禁止继承或继承代价高时，用组合扩展更合适。
- 例子：Java I/O 流层层包装；HTTP 中间件链；通知渠道叠加（邮件外包短信再包 Slack）；给价格计算叠加优惠/税/运费规则。

## 优点

- 比继承更灵活：运行时组合、可多层嵌套。
- 符合开闭：加新装饰类即可扩展行为，不必改原组件。
- 单一装饰类通常只做一件增强，职责清晰。
- 可与其它结构型模式配合（如装饰 Composite 节点）。
- 客户端面向接口编程，不感知具体包装层数。

## 缺点

- 去掉「中间某一层」装饰往往不方便，顺序也影响结果。
- 对象身份（`==` / 指针比较）易坑：外面是包装，不是原始对象。
- 调试与配置复杂：堆栈过深时难看出实际行为顺序。
- 装饰器与组件接口必须保持一致，接口变更成本高。
- 与 Proxy 易混：若主要目的是访问控制/懒加载，应优先考虑 Proxy。

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
