+++
title = "名词介绍"
weight = 1
+++

本章专名（对应 General · API Concepts：AIP-111）。专名以 **英文** 为标题；中文进词库气泡。

### Plane

- **中文**：平面
- API 上的资源与方法可按其驻留或操作的 *plane* 划分。AIP 只定义接口层面的 Management plane 与 Data plane；系统/网络架构中的 control plane、power plane 等不在本 AIP 定义。

### Management plane

- **中文**：管理平面
- 统一、面向资源的 API，主要用于配置并允许检索资源。管理资源与方法主要为 data plane 所对接的资源做供给、配置与审计（例如虚拟机、虚拟私有网络、虚拟磁盘、blob store 实例、project 或 account）。

### Data plane

- **中文**：数据平面
- 异质 API（最好仍面向资源），读写用户数据；常连接到由 management plane 供给的实体。例如对表读写行、对消息队列推拉、对 blob store 实例上传下载。因高吞吐、低延迟或须遵循既有接口规范（例如 ANSI SQL），在更大 API 表面上 **may** 异质。
