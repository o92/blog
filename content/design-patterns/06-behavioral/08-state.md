+++
title = "State"
weight = 8
+++

## 意图

对象在内部状态改变时改变行为，看起来像换了类。

## 问题与解法

- **问题**：状态多、转换多，巨型条件或状态机散落各处。
- **解法**：Context 持有当前 State；各 State 类实现状态下行为并可触发转换；状态对象可共享（享元）或新建。

## 使用场景

- 对象行为随内部状态显著变化，状态多且转换规则复杂。
- 巨型条件（`switch(state)`）散落各处，难维护、易漏改。
- 希望把每个状态下的行为与合法转换局部化到独立类。
- 例子：订单（待支付→已支付→发货→完成/取消）；媒体播放器；TCP 连接状态；游戏角色待机/攻击/死亡。

## 优点

- 状态相关行为集中，消除大段条件分支。
- 符合开闭：加新状态通常加类，少改 Context。
- 转换规则可写在状态类内，状态机意图更清晰。
- 状态对象可共享（若无实例数据）以省内存。
- 利于单测：可单独测某一状态下的行为。

## 缺点

- 状态类数量随状态数上升，简单两三个状态时过重。
- 状态之间互相知晓下一状态时，类间依赖变密。
- 与 Strategy 结构极像，团队需约定命名与职责边界。
- 分布式真实状态（多服务、多副本）不能只靠进程内 State 对象。
- 转换表复杂时，仍需要文档或可视化，否则「类很多」并不等于好懂。

## 易混 / 关系

与 Strategy 结构极像：State 常自知下一状态；Strategy 通常由客户端选择算法。

## Go 示例

行为随当前状态对象切换；状态可推动转换。

```go
package main

import "fmt"

type State interface {
	Publish(c *Document)
}

type Document struct{ state State }

func (d *Document) Publish() { d.state.Publish(d) }

type Draft struct{}
func (Draft) Publish(c *Document) {
	fmt.Println("draft -> moderation")
	c.state = Moderation{}
}

type Moderation struct{}
func (Moderation) Publish(c *Document) {
	fmt.Println("moderation -> published")
	c.state = Published{}
}

type Published struct{}
func (Published) Publish(c *Document) {
	fmt.Println("already published")
}

func main() {
	doc := &Document{state: Draft{}}
	doc.Publish()
	doc.Publish()
	doc.Publish()
}
```
