+++
title = "Builder"
weight = 4
+++

## 意图

分步构建复杂对象，并用同一套构建过程得到不同表示。

## 问题与解法

- **问题**：构造函数参数爆炸，或同一构建步骤要产出不同产品，或构建过程要可复用/可暂停。
- **解法**：Builder 接口逐步构建；Concrete Builder 产不同表示；Director（可选）封装构建顺序；产品与构建过程分离。

## 使用场景

- 对象字段多、构造参数爆炸，或存在大量可选配置，构造函数难以表达。
- 同一套构建步骤要产出不同表示（如同一查询可建成 SQL / 内存过滤条件）。
- 构建过程需要分步、可暂停、可复用，或由 Director 封装固定配方。
- 希望把「怎么组装」与「组装结果」分离，避免巨型构造函数里塞业务规则。
- 例子：拼复杂 HTTP 请求或 SQL；游戏角色按职业分步装备；导出报表时同一流程生成 PDF/HTML；领域对象校验通过后才 `Build()`。

## 优点

- 分步构建，可读性通常好于超长参数列表（尤其链式 Builder）。
- 同一构建过程可复用，换 Concrete Builder 得到不同产品表示。
- 可在 `Build()` 时做校验，避免半成品对象流出。
- 复杂构造逻辑从产品类中剥离，产品类更聚焦自身职责。
- 可选步骤清晰：不调用某 setter 即保持默认，比一堆重载构造函数更直观。

## 缺点

- 相对直接构造，类与样板代码更多（Builder、有时还有 Director）。
- Director 若与具体步骤绑死，新增表示仍可能要改 Director。
- 链式 Builder 若可变且被共享，并发或重复 `Build` 易踩坑（应用不可变或每次新建）。
- 字段很多时，Builder 本身也会膨胀，需要再拆分或分组配置。
- 简单 DTO 用 Builder 往往过重；语言若已有 options 模式/函数式选项，要避免重复抽象。

## 易混 / 关系

与 Abstract Factory（整族产品）不同：Builder 关注一步步组装。常与 Composite 搭配构建树。

## Go 示例

点披萨时面饼、酱料、配料可任选组合，顺序不固定。用 Builder 分步设字段，最后 `Build` 出完整对象；链式调用更贴近点单过程。

```go
package main

import "fmt"

type Pizza struct {
	Dough, Sauce, Topping string
}

type PizzaBuilder struct{ p Pizza }

func NewPizzaBuilder() *PizzaBuilder { return &PizzaBuilder{} }

func (b *PizzaBuilder) Dough(d string) *PizzaBuilder  { b.p.Dough = d; return b }
func (b *PizzaBuilder) Sauce(s string) *PizzaBuilder  { b.p.Sauce = s; return b }
func (b *PizzaBuilder) Topping(t string) *PizzaBuilder { b.p.Topping = t; return b }

func (b *PizzaBuilder) Build() Pizza { return b.p }

func main() {
	p := NewPizzaBuilder().
		Dough("thin").
		Sauce("tomato").
		Topping("mozzarella").
		Build()
	fmt.Printf("%+v\n", p)
}
```
