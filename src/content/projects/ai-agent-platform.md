---
title: 智能体协作平台
description: 一个让多个 AI Agent 协同完成复杂任务的平台，支持工具调用、记忆与任务编排。
tags: [Agent, 平台]
tech: [TypeScript, LLM, MCP, React, Vector DB]
repo: https://github.com/yourname/agent-platform
demo: https://example.com
featured: true
date: 2026-05-20
---

## 项目简介

这是一个面向开发者的多智能体（Multi-Agent）协作平台，核心目标是把"一个会思考的助手"扩展成"一支会分工的团队"。

## 核心能力

- **任务编排**：将复杂目标拆解为子任务，分配给不同角色的 Agent。
- **工具调用**：通过 MCP 协议接入外部工具与数据源。
- **长期记忆**：基于向量数据库的检索增强记忆。
- **可观测性**：完整的执行轨迹与 token 成本追踪。

## 技术亮点

```ts
// 简化的 Agent 编排示意
const team = orchestrate([
  agent('planner', { role: '拆解任务' }),
  agent('coder', { tools: [fs, shell] }),
  agent('reviewer', { role: '审查产出' }),
]);

await team.run('实现并测试一个 RSS 解析器');
```

> 这是一段示例内容，替换为你的真实项目即可。
