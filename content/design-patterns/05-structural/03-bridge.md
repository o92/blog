+++
title = "Bridge"
weight = 3
+++

## 意图

把大类或紧密相关的类拆成抽象与实现两套层次，使之可独立演化。

## 问题与解法

- **问题**：维度交叉导致类爆炸（形状×颜色×平台…），或抽象与实现绑在继承树上。
- **解法**：Abstraction 持有 Implementation 引用并委托；两边各自子类化，运行时组合。

## 适用

想拆分单体类的多种变化维度；要在运行时切换实现；抽象与实现由不同团队演进。

## 取舍

避免类爆炸；独立扩展。代价：增加间接，项目初期可能过度设计。

## 易混 / 关系

与 Adapter（事后修补接口）不同：Bridge 常在设计之初分离。接近 Strategy 的委托形态，但意图是结构分层。

## Go 示例

抽象（远程控制）与实现（设备）分开，运行时组合。

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
