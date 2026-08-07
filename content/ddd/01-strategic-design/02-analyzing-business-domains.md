+++
title = "分析业务域"
weight = 2
+++

Strategic Design 从「公司如何竞争」起，而不是从代码起。

## 为何工程师要懂业务战略

有效方案依赖对问题的理解；问题处于组织战略与价值诉求之中。DDD 用 **Business Domain** / **Subdomain** 分析结构，并区分 **Core / Supporting / Generic**，再据此做设计取舍。

## Business Domain

**Business Domain**：公司主业——向客户提供什么服务。

例：FedEx（快递）、Starbucks（咖啡）、Walmart（零售）。一家公司可有多个域（Amazon 零售 + 云）；域也可随时间迁移（Nokia 的多次转型）。

## Subdomain

**Subdomain**：更细的业务活动。全部子域共同支撑 Business Domain。

例：咖啡连锁不只会做咖啡，还要选址、人事、财务等。单独一块不够「成功」，要协作。

识别时可从部门粗切，再**蒸馏（distill）**到更细：粗看起来像 Generic 的客服里，可能藏着 Core 的智能派单算法。

停手原则：把 Subdomain 看成一组**连贯 Use Case**（相同角色、相关实体、紧耦合数据）。Core 要尽量蒸干净；Supporting / Generic 若再切也无新战略信息，可停。

与软件无关的竞争优势（如珠宝设计）要承认并**聚焦与软件相关**的子域。

## 三类 Subdomain

### Core Subdomain

公司相对对手「做得不一样」的地方：新产品/服务，或把已有流程优化到更低成本。

- 关乎利润与差异化；常含发明、诀窍、IP
- **本身复杂**——太容易抄的「核心」撑不久
- 不必然是技术（珠宝设计是 Core，网店引擎可能是 Generic）
- 应 **in-house**，最强人力与最认真的工程；外包/外购会削弱优势

本书称 **Core Subdomain**（亦有人写 Core Domain）；偏好前者以免与 Business Domain 混淆，也便于描述类型演化（如 Core → Generic）。

### Generic Subdomain

各公司做得**一样**的复杂问题：有成熟方案，不构成差异化。

例：认证授权、加密。珠宝电商品牌的差异在设计，不在是否用同一套网店引擎。

策略：**买或采用**（buy/adopt），别重复发明。

### Supporting Subdomain

支撑运转，但**不**提供竞争优势；逻辑往往简单（CRUD / ETL）。

例：广告公司必须有素材编目，编目方式本身通常不决定利润。

策略：常需自研或外包，但可用 RAD、简单实现；把复杂弹药留给 Core。

## 比较与设计含义

| | Competitive advantage | Complexity | Volatility | Implementation |
|--|--|--|--|--|
| **Core** | 有 | 高 | 高 | 自研 |
| **Generic** | 无 | 高 | 低 | 买/采用 |
| **Supporting** | 无 | 低 | 低 | 自研/外包 |

难分 Core vs Supporting 时：这能力能否单独卖钱？难分 Supporting vs Generic 时：自研是否比集成现成方案更便宜？

对软件相关的 Core：业务规则是否远超 CRUD、是否有复杂不变量与流程编排？

## Domain Expert

**Domain Expert**：业务知识权威——提出业务问题、心智模型的源头。专家范围可覆盖整个域或某个子域。系统分析师/工程师是把心智模型变成需求与代码的人，**不是** Domain Expert 本身。

## 示例（书中虚构）

**Gigmaster**（票务推荐）：Core ≈ 推荐引擎、数据匿名、移动体验；Generic ≈ 加密、账务、清结算、鉴权；Supporting ≈ 流媒体/社交集成、已参加演出登记。

**BusVNext**（公交按需改线）：Core ≈ 路由（类 TSP）、分析、App UX、车队管理；Generic ≈ 路况、账务、计费、授权；Supporting ≈ 促销 CRUD。

## 小结

Strategic Design 第一步：标出 **Business Domain**，拆出三类 **Subdomain**，找到 **Domain Expert**——后续语言、边界与集成都建立在这张图上。
