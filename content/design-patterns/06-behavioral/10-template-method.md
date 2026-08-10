+++
title = "Template Method"
weight = 10
+++

## 意图

在超类定义算法骨架，允许子类在不改结构的前提下重写若干步骤。

## 问题与解法

- **问题**：多类算法结构相同仅步骤不同，复制粘贴或无法限制「只扩某几步」。
- **解法**：抽象类实现模板方法调用一系列步骤（抽象/钩子）；子类实现差异步骤。

## 使用场景

- 多个类的算法骨架相同，仅个别步骤不同，想消除复制粘贴。
- 希望由框架/基类控制算法结构，子类（或钩子）只填差异步骤。
- 需要强制「某些步骤必须存在、顺序不能乱」，同时允许扩展点。
- 例子：数据导入（打开→读→解析→关闭）；游戏 AI 回合流程；生成报表的固定流水线；测试固件 setup/teardown 骨架。

## 优点

- 复用算法骨架，避免重复的流程代码。
- 扩展点明确（抽象步骤/钩子），控制子类能改什么。
- 符合好莱坞原则：父类调用子类，而不是反过来散落调用。
- 工厂方法常可作为模板中的一步，组合自然。
- 对「流程固定、细节多变」的库/框架很合适。

## 缺点

- 依赖继承：父类骨架一改，所有子类受影响；Go 等需用接口模拟，表达力受限。
- 子类可能违反约定（跳过必要步骤），有 LSP 风险。
- 钩子过多时，基类变成难懂的「隐性框架」。
- 与 Strategy 相比更不灵活：换整段算法不如组合策略干净。
- 层级过深时，要搞清「哪一步在哪一层实现」成本高。

## 易混 / 关系

工厂方法常是模板中的一步；对比 Strategy（组合换算法）vs 模板（继承换步骤）。

## Go 示例

Go 无抽象类继承，用「骨架函数 + 钩子接口」模拟模板方法。

```go
package main

import "fmt"

type GameHooks interface {
	Start()
	TakeTurn()
	End()
}

func Play(h GameHooks, turns int) { // 模板：固定骨架
	h.Start()
	for i := 0; i < turns; i++ {
		h.TakeTurn()
	}
	h.End()
}

type Chess struct{}
func (Chess) Start()        { fmt.Println("chess start") }
func (Chess) TakeTurn()     { fmt.Println("chess turn") }
func (Chess) End()          { fmt.Println("chess end") }

func main() {
	Play(Chess{}, 2)
}
```
