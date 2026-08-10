+++
title = "Memento"
weight = 6
+++

## 意图

在不暴露对象实现细节的前提下保存与恢复其先前状态。

## 问题与解法

- **问题**：需要撤销/快照，但对象封装了字段，外部不能也不该直接读内部。
- **解法**：Originator 创建 Memento（快照）；Caretaker 保存历史但不解读内容；Originator 从备忘录恢复。

## 使用场景

- 需要撤销、回滚、历史版本，但不能把对象内部字段裸露给外部。
- 要在关键点做快照，失败时恢复到先前一致状态。
- 看护者（UI、历史栈）只应保存「不透明」快照，不应解读或修改内部。
- 例子：文本编辑器撤销栈；游戏存档点；配置向导「上一步」；长事务中的补偿前快照。

## 优点

- 在不破坏封装的前提下保存/恢复状态。
- 把历史管理（Caretaker）与状态含义（Originator）分离。
- 可保存多份历史，支持多级撤销。
- 快照可序列化后持久化（若设计允许）。
- 与 Command 搭配时，撤销语义更清晰。

## 缺点

- 频繁或大对象快照会消耗大量内存。
- 语言缺少「友元/嵌套类」时，既要封装又要让 Originator 读写备忘录，实现变扭。
- 增量变更场景下，全量快照效率差，可能要差量/压缩方案。
- Caretaker 生命周期管理不当会造成泄漏。
- 与 Prototype 克隆易混：备忘录强调历史与封装边界，不是一般性复制。

## 易混 / 关系

常与 Command 的撤销联用；对比 Prototype（克隆）——备忘录强调历史与封装边界。

## Go 示例

文本编辑器要支持撤销：打字前存快照，改乱后一键还原。快照对看护者不透明，只有原发器（Editor）能解读字段。

```go
package main

import "fmt"

type memento struct{ text string } // 未导出：外部看不到字段

type Editor struct{ text string }

func (e *Editor) Type(s string)      { e.text += s }
func (e *Editor) Save() memento      { return memento{text: e.text} }
func (e *Editor) Restore(m memento)  { e.text = m.text }
func (e Editor) String() string      { return e.text }

func main() {
	ed := &Editor{}
	ed.Type("hello")
	snap := ed.Save()
	ed.Type(" world")
	fmt.Println(ed) // hello world
	ed.Restore(snap)
	fmt.Println(ed) // hello
}
```
