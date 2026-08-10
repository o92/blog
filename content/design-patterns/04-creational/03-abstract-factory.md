+++
title = "Abstract Factory"
weight = 3
+++

## 意图

创建一系列相关产品，而无需指定具体类。

## 问题与解法

- **问题**：要支持多「产品族」（如不同 OS 的 UI 控件），客户端若 `new` 具体类会与族绑死。
- **解法**：抽象工厂声明创建每类产品的方法；具体工厂对应一个产品族；客户端只依赖抽象产品。

## 使用场景

- 系统要支持多套「相关产品族」，且族内产品必须配套（不能混用）。
- 客户端代码不应依赖具体产品类，只应依赖抽象产品接口。
- 需要在配置/运行时切换整族实现（换皮肤、换平台、换云厂商 SDK 风格等）。
- 希望把「这一族如何拼出来」集中在一个工厂里，避免到处 `new` 具体类并手动保证匹配。
- 例子：跨平台 UI——`WinFactory` / `MacFactory` 分别产出配套的 Button+Checkbox；主题皮肤（亮/暗成套控件）；同一业务在不同支付渠道下的「下单客户端 + 回调验签器」成套创建。

## 优点

- 保证产品族一致性：客户端一次拿到的都是同一具体工厂产出的配套产品。
- 切换产品族时改工厂实例即可，使用方代码不变。
- 客户端与具体产品类解耦，符合依赖倒置。
- 产品创建逻辑集中，便于审查「有没有混用不同族」。
- 内部常复用 Factory Method，结构清晰、可测。

## 缺点

- 要支持新的**产品种类**（工厂接口加方法）时，所有具体工厂都要改，扩展成本高。
- 抽象层多（抽象工厂 + 多抽象产品 + 多具体族），初期可读成本高。
- 产品族很少或不会切换时，容易过度设计。
- 具体工厂与具体产品之间仍存在平行继承，改名/重构时牵涉面大。
- 若「族」划分不当（其实只是无关的一堆创建方法），会变成臃肿的上帝工厂。

## 易混 / 关系

常内部用 Factory Method；可与 Builder 互补（一步步 vs 整族）。

## Go 示例

跨平台桌面应用要按系统生成一整套控件：Windows 出 Win 按钮/复选框，Mac 出 Mac 控件，保证同族风格一致。客户端只拿 `GUIFactory`，用一组工厂方法创建产品族。

```go
package main

import "fmt"

type Button interface{ Paint() }
type Checkbox interface{ Paint() }

type GUIFactory interface {
	CreateButton() Button
	CreateCheckbox() Checkbox
}

type winButton struct{}
func (winButton) Paint() { fmt.Println("Windows button") }
type winCheckbox struct{}
func (winCheckbox) Paint() { fmt.Println("Windows checkbox") }

type WinFactory struct{}
func (WinFactory) CreateButton() Button     { return winButton{} }
func (WinFactory) CreateCheckbox() Checkbox { return winCheckbox{} }

type macButton struct{}
func (macButton) Paint() { fmt.Println("Mac button") }
type macCheckbox struct{}
func (macCheckbox) Paint() { fmt.Println("Mac checkbox") }

type MacFactory struct{}
func (MacFactory) CreateButton() Button     { return macButton{} }
func (MacFactory) CreateCheckbox() Checkbox { return macCheckbox{} }

func renderUI(f GUIFactory) {
	f.CreateButton().Paint()
	f.CreateCheckbox().Paint()
}

func main() {
	renderUI(WinFactory{})
	renderUI(MacFactory{})
}
```
