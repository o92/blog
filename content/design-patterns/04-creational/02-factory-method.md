+++
title = "Factory Method"
weight = 2
+++

## 意图

在超类中提供创建对象的接口，允许子类决定实例化哪一种产品。

## 问题与解法

- **问题**：创建逻辑与使用方缠在一起，或基类写死了具体产品类型，扩展新产品就要改基类。
- **解法**：把创建抽到工厂方法；子类覆盖该方法返回具体产品。创建者与产品常成对出现平行继承。

## 使用场景

- 事先无法（或不想）写死具体产品类型，创建要推迟到子类或实现方。
- 库/框架提供流程，希望使用方通过覆盖「工厂方法」插入自己的产品，而不改框架核心。
- 创建逻辑与使用逻辑缠在一起，或基类里直接 `new` 了具体类型，扩展就要改基类。
- 产品与创建者成对扩展：每加一种产品，就加一个创建者子类（或实现）。
- 例子：文档编辑器按类型打开文件——`CreateDocument()` 由各编辑器子类返回 Word/Spreadsheet；物流按运输方式创建运输工具；测试里用 Fake 创建者注入替身产品。

## 优点

- 创建与使用解耦：客户端依赖产品接口，不依赖具体类。
- 符合开闭原则：加新产品通常加子类即可，不必改既有创建者基类的使用方。
- 把「如何构造」集中在一处，避免散落的 `new` 与条件分支。
- 便于在框架中提供扩展钩子（模板方法里的一步常是工厂方法）。
- 利于测试：可替换创建者，返回 mock/stub 产品。

## 缺点

- 每增加一种产品，往往要同步增加创建者类型，类数量上升。
- 继承层次变深时，可读性与导航成本变高。
- Go 等无类继承的语言要用接口+组合模拟，样板代码可能多于「直接函数返回接口」。
- 若产品种类极少且稳定，引入工厂方法可能过重，不如简单构造函数或包级工厂函数。
- 与 Abstract Factory 混淆时，容易做成「一个方法一个产品」却假装成产品族。

## 易混 / 关系

常演化为 Abstract Factory、Template Method（工厂方法是特例钩子）、Prototype。

## Go 示例

电商下单时，不同品类由各自 Creator 产出对应 SKU（手机、笔记本）。`placeOrder` 只调工厂方法，不关心具体类型——Go 无类继承，常用「创建者接口 + 具体创建者」表达。

```go
package main

import "fmt"

type SKU interface {
	Name() string
}

type phoneSKU struct{}
func (phoneSKU) Name() string { return "iPhone 15" }

type laptopSKU struct{}
func (laptopSKU) Name() string { return "MacBook Air" }

// Creator：工厂方法由实现方决定 SKU 类型
type Creator interface {
	CreateSKU() SKU
}

type PhoneCreator struct{}
func (PhoneCreator) CreateSKU() SKU { return phoneSKU{} }

type LaptopCreator struct{}
func (LaptopCreator) CreateSKU() SKU { return laptopSKU{} }

func placeOrder(c Creator) {
	sku := c.CreateSKU()
	fmt.Println("ordered:", sku.Name())
}

func main() {
	placeOrder(PhoneCreator{})
	placeOrder(LaptopCreator{})
}
```
