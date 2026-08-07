+++
title = "Abstract Factory"
weight = 3
+++

## 意图

创建一系列相关产品，而无需指定具体类。

## 问题与解法

- **问题**：要支持多「产品族」（如不同 OS 的 UI 控件），客户端若 `new` 具体类会与族绑死。
- **解法**：抽象工厂声明创建每类产品的方法；具体工厂对应一个产品族；客户端只依赖抽象产品。

## 适用

代码需与多种相关产品族协作且不能依赖具体类；要保证族内产品匹配。

## 取舍

产品族切换集中；符合 OCP。代价：难引入新品类（所有工厂都要加方法）。

## 易混 / 关系

常内部用 Factory Method；可与 Builder 互补（一步步 vs 整族）。

## Go 示例

产品族用一组工厂方法；客户端只依赖抽象接口。

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
