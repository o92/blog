+++
title = "Facade"
weight = 6
+++

## 意图

为库、框架或复杂子系统提供更简单的接口。

## 问题与解法

- **问题**：子系统类很多、初始化与调用顺序复杂，客户端不想知道内部。
- **解法**：Facade 类暴露少量高层方法，内部编排多个子系统类；子系统仍可被高级用户直连。

## 使用场景

- 子系统类多、初始化与调用顺序复杂，大多数客户端只需要少数高层用例。
- 希望把库/框架的复杂度挡在门后，降低学习与误用成本。
- 分层架构中需要稳定的层间入口（对上简单，对下编排）。
- 想减弱外部代码与子系统内部类的耦合，便于日后替换内部实现。
- 例子：视频转码 Facade 内部编排解码器/码率/封装；下单 Facade 协调库存、支付、积分；ORM Session 对 JDBC 细节的外观。

## 优点

- 大幅简化客户端用法，常见操作一条调用链即可。
- 降低外部与子系统的耦合，内部类可演进而不处处改客户端。
- 可作为模块边界与文档化的「推荐用法」入口。
- 不妨碍高级用户必要时直连子系统（Facade 不是强制闸门）。
- 利于统一处理横切关注（日志、权限、事务边界可放在外观层，但要克制）。

## 缺点

- 易膨胀成上帝对象：什么都经 Facade，最终与所有子系统耦合。
- 外观方法若粒度过粗，灵活场景仍要穿透；过细则又变回复杂 API。
- 多一层间接，极端性能敏感路径可能不想经过它。
- 团队若只经 Facade 编程，可能忽视子系统真实模型，长期设计腐化。
- 与 Mediator / Adapter 边界不清时，职责会重叠、难维护。

## 易混 / 关系

对比 Adapter（一对一接口转换）、Mediator（对象互联中心）、Singleton（有时外观被做成单例）。

## Go 示例

对外一个方法，内部编排多个子系统。

```go
package main

import "fmt"

type VideoFile struct{ Path string }
type Codec struct{ Name string }
type BitrateReader struct{}

func (BitrateReader) Convert(f VideoFile, c Codec) {
	fmt.Printf("convert %s via %s\n", f.Path, c.Name)
}

// Facade
type VideoConverter struct {
	reader BitrateReader
}

func (v VideoConverter) Convert(path, format string) {
	file := VideoFile{Path: path}
	codec := Codec{Name: format}
	v.reader.Convert(file, codec)
}

func main() {
	VideoConverter{}.Convert("movie.mp4", "ogg")
}
```
