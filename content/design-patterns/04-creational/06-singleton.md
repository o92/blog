+++
title = "Singleton"
weight = 6
+++

## 意图

保证一个类仅有一个实例，并提供全局访问点。

## 问题与解法

- **问题**：某些资源（配置、设备、连接池门面）必须全局唯一，又要控制访问。
- **解法**：私有构造 + 静态获取实例；注意多线程、懒加载、序列化等语言细节。现代实践更常依赖 DI 容器的单例生命周期。

## 适用

确需唯一实例且要全局访问。滥用会变成隐蔽全局状态。

## 取舍

受控唯一实例。代价：违反 SRP（管实例+业务）、难测、隐藏依赖、并发与多类加载器陷阱。

## 易混 / 关系

外观上像全局变量；Facade 有时被做成单例。能用显式注入就少用。

## Go 示例

用 `sync.Once` 保证只初始化一次。能注入依赖时尽量少用全局单例。

```go
package main

import (
	"fmt"
	"sync"
)

type Config struct{ Env string }

var (
	cfg  *Config
	once sync.Once
)

func GetConfig() *Config {
	once.Do(func() {
		cfg = &Config{Env: "prod"}
	})
	return cfg
}

func main() {
	a, b := GetConfig(), GetConfig()
	fmt.Println(a == b, a.Env) // true prod
}
```
