+++
title = "Product Delivery"
weight = 5
+++

强产品公司常说：**Reliability is our most important feature。** 云服务时代，故障直接伤用户、收入、品牌与一线同事。客户能容忍偶发问题，但用你**响应是否又快又专业**来评判你。

### Small, Frequent, Uncoupled Releases

至少每两周；强队 CI/CD 一天多次。小变更易测、易回滚。需要测两层：新能力本身；以及是否引入 **regression**。复杂产品上回归成本高，故投资自动化。

**解耦**：团队发布不绑死在巨型火车发布上，才能独立小步。

### Instrumentation

埋点与遥测：功能是否工作、如何被使用——否则谈不上 outcomes。

### Monitoring

主动发现异常， ideally 先于客户。

### Deployment Infrastructure

安全部署、快速回滚、在热修时仍能测过再放——这些是交付能力，不是「有 Jenkins 就行」的勾选。与 Accelerate 等工程效能研究一致：频繁发布与稳定性可兼得。
