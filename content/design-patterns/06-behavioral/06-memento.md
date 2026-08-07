+++
title = "Memento"
weight = 6
+++

## 意图

在不暴露对象实现细节的前提下保存与恢复其先前状态。

## 问题与解法

- **问题**：需要撤销/快照，但对象封装了字段，外部不能也不该直接读内部。
- **解法**：Originator 创建 Memento（快照）；Caretaker 保存历史但不解读内容；Originator 从备忘录恢复。

## 适用

需要快照与恢复；直接访问字段会破坏封装。

## 取舍

保封装的撤销。代价：内存；大量频繁快照昂贵；语言若无友元/嵌套类，实现变扭。

## 易混 / 关系

常与 Command 的撤销联用；对比 Prototype（克隆）——备忘录强调历史与封装边界。

## Go 示例

快照对看护者不透明；只有原发器解读。

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
