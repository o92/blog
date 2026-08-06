+++
title = "术语高亮演示"
date = 2026-08-06T10:00:00+08:00
draft = false
weight = 1
glossary = ["go"]
+++

这篇文章用来验证 **术语** 自动强调。

在 Go 里，你可以启动一个 goroutine，并通过 channel 传递数据。
重复出现也应高亮：goroutine 还会再出现一次。

不要在代码里匹配：

```go
go func() { /* goroutine in code */ }()
```

行内 `channel` 也不应高亮。
