+++
title = "Facade"
weight = 6
+++

## 意图

为库、框架或复杂子系统提供更简单的接口。

## 问题与解法

- **问题**：子系统类很多、初始化与调用顺序复杂，客户端不想知道内部。
- **解法**：Facade 类暴露少量高层方法，内部编排多个子系统类；子系统仍可被高级用户直连。

## 适用

需要简化接口；想把子系统与外部解耦；分层时作为层间入口。

## 取舍

更易用、降耦合。代价：可能变成与所有类耦合的上帝对象，要控制职责。

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
