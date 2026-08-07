+++
title = "Strategy"
weight = 9
+++

## 意图

定义一系列算法，分别封装，并使它们可互换。

## 问题与解法

- **问题**：一类里塞多种算法变体，类膨胀、难测、合并冲突。
- **解法**：Context 委托 Strategy 接口；Concrete Strategy 各实现变体；客户端注入/切换策略。

## 适用

运行时切换算法；隔离算法变体；隐藏复杂/敏感算法数据。

## 取舍

换算法不改 Context。代价：客户端需知晓策略差异；对象数增加。

## 易混 / 关系

与 State 形似；与 Bridge 委托相似但意图不同；常落实 OCP / Encapsulate What Varies。

## Go 示例

算法族抽成接口，Context 持有并可切换。

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
