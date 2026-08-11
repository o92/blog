+++
title = "多数决与 Go fishing"
weight = 4
+++

对应原书 **9.3**：把 Deep Democracy 织进协作建模；多数决后别忘少数；卡住时 Go fishing。

## 忘掉少数派会发生什么（9.3.1）

另一次两日工作坊：EventStorming + domain message flow 迭代出若干 Bounded Context 设计，用绿 / 紫便利贴标 pros / cons（即 Deep Democracy 前三步的自然织入）。改设计时追问「为何要改？谁觉得这是重要需要？还有谁有类似需要但设计里还没有？」——就是在 **spread**。

14 人里 9 人多数选某一设计——兴奋推进；实现阶段却出现大量「这不是我们定的」「保持敏捷改道吧」。

根因：没问 5 名少数派「怎样才肯一起走」——跳过了第 4 步。对少数来说，多数决体感像**专制**，会触发阻力线。

> GUIDING：问未投给多数方案的人——要什么才能一起走。把需要写进决策，再求**一致通过**改进后的方案。

## BigScreen：先让角色流动

设计 EventStorming 后两套 Bounded Context 备选仍卡住（Back-Office Separated vs Payments Separated）。用改编的 Small Group Diverge and Converge：偏好对立的人结对互访，抽出对方设计在解什么问题，写成 **QHE**（Question–Heuristic–Answer，Wirfs-Brock）卡片。

效果：决策变具体；**role fluidity**（听懂对方需要）。两边都冒出「怎么拆团队」——

> GUIDING：先建立对问题 / 需要的共享理解，再谈方案。

对立从「Jack vs Rose 两张图」变成「多条含集体智慧的设计」。

### 走向一致票

讨论中 Jack 说明为何把 Payments 独立：运营 / 财务常因支付失败投诉来找他；很多问题其实是座位分配规则（财务为优化收入改价）改出的 bug。

> DESIGN HEURISTIC：按领域里**不同领域专长**（知识与技能，不是具体某人）对齐 Bounded Context。

Caledon 建议再拆：定价与支付是两个业务问题 → 重命名为 Pricing and Payments。投票：3 人维持原状，15 人赞成再拆。问少数「怎样才肯一起走」——Jack 的点不在「拆本身」，而在「右边改过了，左边 Rose 的设计也该同等探索」。底层需要常在投票后才露头；协作场往往偏爱外向快决策者，分析型人可能在投票时或会后才赶上。

Rose 起初说「不确定需要什么」——安静下来本身可能是 edge behavior。引导用积极倾听（「你有点不确定？」+ 沉默）托出真忧虑：再拆 → 跨边界通信暴增；团队习惯单模型、一致事务、单代码库；没经验写分布式会成项目风险。把阴影照出来，比实现期再炸便宜。用 role theory：问「谁也担心跨边界通信太复杂？」——多数举手 → 下一场先做 domain message flow（暂缓 Example Mapping），两边设计都建模。这里用的是 **Proposal** 级专制边界：纳入已知需要、仍留调整口；专制本身不坏，关键是接上群体智慧与需要。

## 多数仍不够时：Go fishing!（9.3.2）

后续 domain message flow：三组同用例（有票可买时购票）对比设计，抽出竞争启发式（如 **orchestration vs choreography**）。多方案有助于削弱「二选一 → 我们 vs 他们」。

投票可能多轮无绝对多数、再成平局，最后又卡在编排 vs 编舞。Deep Democracy 提示：**Go fishing!**

较简做法（书常用）：

1. 全员（含反对方）先写 / 说清 **一侧的全部好处**  
2. 再换另一侧；可再回到第一侧（新洞见）  
3. 安静反思：什么「说到心坎上（hit home）」  
4. 轮流分享、不打断（像 check-in）  
5. 再投一轮；纳入少数条件（如「有编舞经验后再开辩」）

更深的「throwing arrows」（刺激互批两侧）需专业冲突引导，本书少用。Go fishing 把水位线再压低一点，让脆弱可见——Jack 分享「想追新技术，但『小步学习失败』说到了」——阴影出来，群体才好往前。

## 与极性的交接

编排 vs 编舞这类常是**可解问题**（启发式竞争）。「何时继续建模 / 何时开写」则是**无解的极性**——下一章。
