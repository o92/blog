+++
title = "Strategy"
weight = 9
+++

## 意图

定义一系列算法，分别封装，并使它们可互换。

## 问题与解法

- **问题**：一类里塞多种算法变体，类膨胀、难测、合并冲突。
- **解法**：Context 委托 Strategy 接口；Concrete Strategy 各实现变体；客户端注入/切换策略。

## 使用场景

- 同一上下文需要在运行时切换算法或策略（排序、报价、路由、校验）。
- 一类里塞了多种算法变体，导致膨胀、难测、合并冲突。
- 希望把算法族隔离，客户端可注入/配置选用哪一种。
- 例子：电商运费/促销策略；压缩算法可选；支付渠道路由；A/B 实验下的不同推荐策略。

## 优点

- 算法可互换，Context 稳定，符合开闭。
- 各策略独立实现与测试，消除庞大条件分支。
- 运行时切换策略，适应配置与实验。
- 可隐藏算法内部数据与复杂度。
- 与依赖注入天然契合。

## 缺点

- 客户端必须理解策略差异并正确选择，否则「可配置」变成「易配错」。
- 对象数量增加，简单两分支用 Strategy 可能过重。
- 策略间若共享上下文数据，接口设计不当会造成来回取值。
- 与 State / Bridge / 高阶函数易混，需要团队统一语义。
- 策略爆炸时缺少目录/注册机制会难发现可用实现。

## 易混 / 关系

与 State 形似；与 Bridge 委托相似但意图不同；常落实 OCP / Encapsulate What Varies。

## Go 示例

导航 App 从 A 到 B：开车与步行用不同路线算法，用户可随时切换。算法族抽成接口，`Navigator`（Context）持有并可替换策略。

```go
package main

import "fmt"

type RouteStrategy interface {
	Build(from, to string) string
}

type RoadStrategy struct{}
func (RoadStrategy) Build(from, to string) string {
	return from + " -(road)-> " + to
}

type WalkStrategy struct{}
func (WalkStrategy) Build(from, to string) string {
	return from + " -(walk)-> " + to
}

type Navigator struct{ strategy RouteStrategy }

func (n *Navigator) SetStrategy(s RouteStrategy) { n.strategy = s }
func (n Navigator) Route(from, to string) string {
	return n.strategy.Build(from, to)
}

func main() {
	nav := Navigator{strategy: RoadStrategy{}}
	fmt.Println(nav.Route("A", "B"))
	nav.SetStrategy(WalkStrategy{})
	fmt.Println(nav.Route("A", "B"))
}
```
