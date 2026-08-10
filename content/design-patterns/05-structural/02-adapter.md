+++
title = "Adapter"
weight = 2
+++

## 意图

让接口不兼容的对象能够协作。

## 问题与解法

- **问题**：想复用已有类，但其接口与客户端期望不符。
- **解法**：适配器实现客户端期望的接口，内部转换并委托给被适配者（对象适配器用组合；类适配器用多重继承/接口）。

## 使用场景

- 想复用已有类（第三方、遗留），但其接口与客户端期望不一致。
- 需要同时适配多个不同接口来源，对外提供统一接口。
- 不想改被适配类（无源码、不能动公共 API），又必须接入现有体系。
- 类适配（继承）或对象适配（组合）均可；Go/多数现代代码更常用对象适配。
- 例子：把旧短信 SDK 的 `SendSMS` 适配成系统的 `Notifier`；XML 服务适配成 JSON 客户端期望；把第三方支付回调字段映射成内部 `PaymentEvent`。

## 优点

- 不改原类即可接入，符合开闭：新增适配器而非改客户端与被适配者。
- 单一适配类职责清晰，转换逻辑集中、可测。
- 对象适配器可适配被适配者及其子类（视设计而定）。
- 可实现双向适配，让两套接口互相协作。
- 降低「为迁就外部 API 而污染领域模型」的压力。

## 缺点

- 调用链变长，读代码时要多跳一层。
- 适配器过多时，系统里「转换层」变厚，定位问题更难。
- 若被适配 API 频繁破坏性变更，适配器要跟着改。
- 类适配依赖多重继承/接口，语言不支持时只能对象适配。
- 简单字段映射有时用函数即可，硬上 Adapter 类可能过重。

## 易混 / 关系

对比 Bridge（预设分离抽象与实现）、Decorator（同接口增强）、Proxy（同接口控访问）、Facade（简化子系统）。

## Go 示例

业务统一走 `Notifier.Notify`，但遗留短信 SDK 只有 `SendSMS`。用适配器把旧 SDK 包成 Notifier，客户端无需改调用方式。

```go
package main

import "fmt"

// 客户端期望的接口
type Notifier interface {
	Notify(msg string)
}

// 遗留/第三方：方法名不同
type LegacySMS struct{}

func (LegacySMS) SendSMS(text string) { fmt.Println("SMS:", text) }

type SMSAdapter struct{ sms LegacySMS }

func (a SMSAdapter) Notify(msg string) { a.sms.SendSMS(msg) }

func alert(n Notifier) { n.Notify("order paid") }

func main() {
	alert(SMSAdapter{sms: LegacySMS{}})
}
```
