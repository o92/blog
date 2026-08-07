+++
title = "Proxy"
weight = 8
+++

## 意图

为另一对象提供替身以控制访问，可在请求前后附加行为。

## 问题与解法

- **问题**：需要懒加载、访问控制、远程、日志、缓存等，又不想污染真实对象。
- **解法**：代理与 Subject 同接口；持有真实服务引用；客户端以为在用真实对象。

## 适用

虚拟代理（懒创建）、保护代理、远程代理、日志/缓存代理等。

## 取舍

在不改真实类的前提下开门禁。代价：响应可能变慢；代码变多。

## 易混 / 关系

对比 Decorator（叠功能且常多层）、Adapter（接口不同）、Facade（简化多类而非替一个）。

## Go 示例

与真实对象同接口；这里做懒加载（虚拟代理）。

```go
package main

import "fmt"

type Image interface {
	Display()
}

type RealImage struct{ path string }

func NewRealImage(path string) *RealImage {
	fmt.Println("load from disk:", path)
	return &RealImage{path: path}
}
func (r *RealImage) Display() { fmt.Println("display:", r.path) }

type ImageProxy struct {
	path string
	real *RealImage
}

func (p *ImageProxy) Display() {
	if p.real == nil {
		p.real = NewRealImage(p.path)
	}
	p.real.Display()
}

func main() {
	img := &ImageProxy{path: "photo.png"}
	img.Display() // 首次加载
	img.Display() // 复用
}
```
