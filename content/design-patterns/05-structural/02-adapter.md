+++
title = "Adapter"
weight = 2
+++

## 意图

让接口不兼容的对象能够协作。

## 问题与解法

- **问题**：想复用已有类，但其接口与客户端期望不符。
- **解法**：适配器实现客户端期望的接口，内部转换并委托给被适配者（对象适配器用组合；类适配器用多重继承/接口）。

## 适用

集成第三方或遗留代码；需要若干子类的统一接口时可用双向适配等变体。

## 取舍

单开适配类即可接入。代价：代码整体更绕，调用链变长。

## 易混 / 关系

对比 Bridge（预设分离抽象与实现）、Decorator（同接口增强）、Proxy（同接口控访问）、Facade（简化子系统）。

## Go 示例

第三方类型接口不合用时，包一层适配到客户端期望的接口。

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
