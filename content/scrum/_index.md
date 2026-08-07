+++
title = "简介"
book_title = "Scrum 流程笔记"
glossary = ["scrum"]
+++

基于 [2020 Scrum Guide](https://scrumguides.org/scrum-guide.html) 的流程笔记：先认专名，再看谁参与、产出什么。不替代官方全文。

## 一句话

**Scrum Team** 在 **Sprint** 里，把 **Product Backlog** 做成可用的 **Increment**，再检视调整。

## 总览（节点 = 专名）

全部事件都在 **Sprint 内**：Planning 开头，Review 临近结束，**Retrospective 结束本 Sprint**（不是 Sprint 之后再评审）。

```mermaid
flowchart TD
  PB["Product Backlog<br/>产品待办列表"]

  subgraph Sprint["Sprint（冲刺容器）"]
    SP["Sprint Planning<br/>Sprint 计划会"]
    DEV["Developers 开发<br/>+ Daily Scrum"]
    INC["Increment<br/>增量（满足 DoD）"]
    SR["Sprint Review<br/>Sprint 评审"]
    Retro["Sprint Retrospective<br/>Sprint 回顾"]
    SP --> DEV --> INC --> SR --> Retro
  end

  PB --> SP
  SR -.->|调整 Backlog| PB
  Retro -.->|改进实践| SP
```
