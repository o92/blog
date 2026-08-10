+++
title = "Command"
weight = 3
+++

## 意图

将请求封装为对象，从而可参数化、排队、记录、撤销。

## 问题与解法

- **问题**：调用者与接收者缠在一起，难实现撤销、宏、异步任务队列。
- **解法**：Command 接口（通常 `execute`/`undo`）；Concrete Command 绑定接收者与参数；Invoker 触发；Client 装配。

## 使用场景

- 需要把请求参数化成对象：菜单项、按钮、任务队列里的可执行单元。
- 要支持撤销/重做、宏命令、事务日志或操作回放。
- 希望调用者（Invoker）与接收者解耦，便于调度、延迟执行、远程投递。
- 例子：编辑器命令（剪切/粘贴）可撤销；GUI 工具栏按钮绑定命令对象；任务队列里的 Job；智能家居「场景」宏命令一次执行多步。

## 优点

- 调用与执行解耦：Invoker 只依赖 Command 接口。
- 易实现撤销、排队、日志、事务边界等横切能力。
- 新增命令通常加类即可，符合开闭。
- 可组合成宏命令（常借 Composite）。
- 便于把用户操作序列化后存储或传输。

## 缺点

- 每个操作一个类时，类数量明显上升。
- 简单「回调一下」的场景用 Command 过重，函数/闭包可能更合适。
- 撤销实现常要保存状态，可能再引入 Memento，复杂度叠加。
- 命令对象若持有过多上下文，易变成隐性上帝参数袋。
- 异步执行时要处理失败、幂等与部分完成，模式本身不解决。

## 易混 / 关系

与 Strategy 形似但意图是请求对象化；常配 Memento 做撤销；宏命令可用 Composite。

## Go 示例

请求变成对象，可交给调用者执行（可扩展 undo/队列）。

```go
package main

import "fmt"

type Command interface {
	Execute()
}

type Light struct{}
func (Light) On()  { fmt.Println("light on") }
func (Light) Off() { fmt.Println("light off") }

type LightOnCommand struct{ light Light }
func (c LightOnCommand) Execute() { c.light.On() }

type LightOffCommand struct{ light Light }
func (c LightOffCommand) Execute() { c.light.Off() }

type Remote struct{ cmd Command }
func (r *Remote) Press() { r.cmd.Execute() }

func main() {
	light := Light{}
	r := &Remote{}
	r.cmd = LightOnCommand{light: light}
	r.Press()
	r.cmd = LightOffCommand{light: light}
	r.Press()
}
```
