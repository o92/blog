+++
title = "Proxy"
weight = 8
+++

## 意图

为另一对象提供替身以控制访问，可在请求前后附加行为。

## 问题与解法

- **问题**：需要懒加载、访问控制、远程、日志、缓存等，又不想污染真实对象。
- **解法**：代理与 Subject 同接口；持有真实服务引用；客户端以为在用真实对象。

## 使用场景

- 需要控制对真实对象的访问：懒加载、权限、限流、只读视图等。
- 真实对象昂贵或位于远程，希望本地用同接口替身（虚拟/远程代理）。
- 想在不改真实类的前提下加日志、缓存、重试、熔断等门槛逻辑。
- 客户端应继续面向 Subject 接口编程，不感知背后是代理还是本体。
- 例子：大图懒加载代理；远程服务的本地 stub；按角色过滤的保护代理；带缓存的仓库访问代理。

## 优点

- 在真实对象之外开门禁，真实类保持干净。
- 对客户端透明：同接口，可替换注入。
- 可延迟昂贵初始化，优化启动与内存。
- 便于统一加横切策略（鉴权、度量）而不侵入业务类。
- 远程代理可隐藏网络与序列化细节。

## 缺点

- 多一层调用，延迟可能上升，调试链路变长。
- 代理与真实对象生命周期、缓存一致性要仔细设计。
- 类数量增加；每种控制策略一个代理时可能散乱。
- 与 Decorator 易混：代理侧重控制访问，装饰侧重叠加职责，叠多层时更难分辨。
- 若真实对象接口不稳定，代理要同步变更。

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
