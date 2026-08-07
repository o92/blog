+++
title = "Factory Method"
weight = 2
+++

## 意图

在超类中提供创建对象的接口，允许子类决定实例化哪一种产品。

## 问题与解法

- **问题**：创建逻辑与使用方缠在一起，或基类写死了具体产品类型，扩展新产品就要改基类。
- **解法**：把创建抽到工厂方法；子类覆盖该方法返回具体产品。创建者与产品常成对出现平行继承。

## 适用

事先不知道精确产品类型；希望库/框架的用户通过子类扩展产品；复用已有创建钩子。

## 取舍

解耦创建与使用；符合 OCP。代价：引入许多子类。

## 易混 / 关系

常演化为 Abstract Factory、Template Method（工厂方法是特例钩子）、Prototype。

## Go 示例

Go 无类继承，常用「创建者接口 + 具体创建者」表达 Factory Method。

```go
package main

import "fmt"

type Product interface {
	Name() string
}

type chair struct{}
func (chair) Name() string { return "chair" }

type sofa struct{}
func (sofa) Name() string { return "sofa" }

// Creator：工厂方法由实现方决定产品类型
type Creator interface {
	CreateProduct() Product
}

type ChairCreator struct{}
func (ChairCreator) CreateProduct() Product { return chair{} }

type SofaCreator struct{}
func (SofaCreator) CreateProduct() Product { return sofa{} }

func order(c Creator) {
	p := c.CreateProduct()
	fmt.Println("ordered:", p.Name())
}

func main() {
	order(ChairCreator{})
	order(SofaCreator{})
}
```
