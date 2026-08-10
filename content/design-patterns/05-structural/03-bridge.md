+++
title = "Bridge"
weight = 3
+++

## 意图

把大类或紧密相关的类拆成抽象与实现两套层次，使之可独立演化。

## 问题与解法

- **问题**：维度交叉导致类爆炸（形状×颜色×平台…），或抽象与实现绑在继承树上。
- **解法**：Abstraction 持有 Implementation 引用并委托；两边各自子类化，运行时组合。

## 使用场景

- 一个类因多个独立变化维度交叉而膨胀（平台 × 功能、设备 × 遥控方式等）。
- 希望抽象与实现各自演进：一边加「高级操作」，一边换「底层实现」，互不影响。
- 需要在运行时切换实现（换渲染后端、换消息通道），而不是编译期绑死。
- 抽象与实现可能由不同团队/模块维护，需要稳定的实现接口作边界。
- 例子：遥控器 Abstraction + 电视/收音机 Implementation；形状绘制与不同图形 API；业务服务与可插拔存储引擎（内存/SQL/对象存储）。

## 优点

- 用组合代替多维继承，避免类爆炸。
- 抽象层与实现层可独立扩展，符合开闭。
- 运行时可替换实现，测试时可注入假实现。
- 隐藏实现细节，客户端主要面对抽象接口。
- 把「变化维度」拆开后，每边层次更单一、更好懂。

## 缺点

- 增加间接层，项目早期需求简单时可能过度设计。
- 需要先想清楚稳定的 Implementation 接口，设计成本高于直接继承。
- 调试时要同时看抽象与实现两边，链路更长。
- 若维度其实不会独立变化，拆 Bridge 收益很小。
- 与 Strategy 形态相近，意图不清时团队容易混用、命名混乱。

## 易混 / 关系

与 Adapter（事后修补接口）不同：Bridge 常在设计之初分离。接近 Strategy 的委托形态，但意图是结构分层。

## Go 示例

同一款遥控器要既能控电视又能控收音机，开关逻辑与具体设备无关。抽象（Remote）与实现（Device）分开，运行时组合即可。

```go
package main

import "fmt"

type Device interface {
	On()
	Off()
}

type TV struct{}
func (TV) On()  { fmt.Println("TV on") }
func (TV) Off() { fmt.Println("TV off") }

type Radio struct{}
func (Radio) On()  { fmt.Println("Radio on") }
func (Radio) Off() { fmt.Println("Radio off") }

type Remote struct{ d Device }

func (r Remote) Toggle(on bool) {
	if on {
		r.d.On()
	} else {
		r.d.Off()
	}
}

func main() {
	Remote{d: TV{}}.Toggle(true)
	Remote{d: Radio{}}.Toggle(false)
}
```
