---
title: Agent 智能体开发
summary: 从 Tool Calling 到多 Agent 协作，构建能自主感知、决策、执行的 AI 智能体。
category: AI 编程
tags: [Agent, 智能体, Tool Calling, MCP]
updated: 2026-07-05
---

## 什么是 AI Agent

Agent（智能体）是以 LLM 为大脑，具备**感知→规划→行动→反思**循环的系统。它不只是"问答机器人"，而是能自主拆解任务、调用工具、根据反馈调整策略，直到完成目标。

## Agent vs Chatbot

| 维度 | Chatbot | Agent |
|------|---------|-------|
| 交互 | 单轮问答 | 多轮自主执行 |
| 工具 | 无 | 可调用函数、API、Shell |
| 决策 | 用户驱动 | 目标驱动，自主拆解 |
| 反馈 | 无 | 观察结果，调整下一步 |
| 终止 | 用户结束 | 达成目标或判定失败 |

## 核心循环

```text
用户目标
  ↓
[ 感知 ]  接收输入与工具执行结果
  ↓
[ 规划 ]  LLM 决定下一步动作（Thought → Action）
  ↓
[ 行动 ]  调用工具（函数 / API / Shell / 浏览器）
  ↓
[ 观察 ]  获取工具返回结果（Observation）
  ↓
[ 反思 ]  是否达成目标？
  ├─ 是 → 返回最终结果
  └─ 否 → 回到规划
```

这个循环被称为 **ReAct**（Reasoning + Acting）模式，是 Agent 的基础范式。

## 工具调用（Tool Calling）

工具是 Agent 的"手"，决定了它能做什么。

### 定义工具

```typescript
const tools = [
  {
    type: 'function',
    function: {
      name: 'search_docs',
      description: '在文档库中搜索相关内容',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: '搜索关键词' },
          top_k: { type: 'number', description: '返回条数', default: 5 },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'run_code',
      description: '执行 Python 代码并返回输出',
      parameters: {
        type: 'object',
        properties: {
          code: { type: 'string', description: 'Python 代码' },
        },
        required: ['code'],
      },
    },
  },
];
```

### 执行循环

```typescript
async function runAgent(userMessage: string, tools: Tool[]) {
  const messages = [{ role: 'user', content: userMessage }];

  for (let step = 0; step < 10; step++) { // 限制最大步数
    const res = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      tools,
    });

    const msg = res.choices[0].message;
    messages.push(msg);

    // 没有工具调用 → Agent 给出最终答案
    if (!msg.tool_calls?.length) {
      return msg.content;
    }

    // 执行所有工具调用
    for (const call of msg.tool_calls) {
      const args = JSON.parse(call.function.arguments);
      const result = await executeTool(call.function.name, args);
      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }
  }
  throw new Error('超过最大步数');
}
```

## 常用工具集

| 工具类别 | 示例 | 用途 |
|---------|------|------|
| **检索** | 向量检索、Web 搜索 | 获取知识 |
| **代码执行** | Python REPL、Shell | 计算、数据处理 |
| **文件操作** | 读写文件 | 代码编辑、文档处理 |
| **API 调用** | HTTP 请求 | 接入外部服务 |
| **浏览器** | Playwright、Puppeteer | 网页操作、截图 |
| **数据库** | SQL 查询 | 数据分析 |

## MCP（Model Context Protocol）

MCP 是 Anthropic 提出的标准化协议，让 Agent 与外部工具/数据源以统一方式连接，类似"AI 的 USB 接口"。

### 核心概念

- **MCP Server**：暴露工具、资源、Prompt 模板的服务进程。
- **MCP Client**：Agent 侧的连接器，发现并调用 Server 提供的能力。
- **Transport**：通信方式（stdio、SSE、HTTP）。

### 价值

- **解耦**：工具实现与 Agent 逻辑分离。
- **复用**：一个 MCP Server 可被多个 Agent 使用。
- **生态**：社区共享 Server，即插即用。

### 示例

```typescript
// 一个简单的 MCP Server，暴露"读文件"工具
import { Server } from '@modelcontextprotocol/sdk/server';

const server = new Server({
  name: 'file-reader',
  tools: [{
    name: 'read_file',
    description: '读取文件内容',
    inputSchema: {
      type: 'object',
      properties: { path: { type: 'string' } },
      required: ['path'],
    },
    handler: async ({ path }) => {
      const content = await fs.readFile(path, 'utf-8');
      return { content };
    },
  }],
});
```

## 多 Agent 协作

复杂任务单个 Agent 难以胜任，多 Agent 分工协作更高效。

### 常见编排模式

| 模式 | 说明 | 适用 |
|------|------|------|
| **串行流水线** | A → B → C 依次传递 | 内容生产、数据处理 |
| **主管-工人** | 一个 Manager 拆任务，分发给 Worker | 复杂项目 |
| **辩论** | 多 Agent 各持立场，相互质疑 | 决策、方案评估 |
| **并行投票** | 多 Agent 并行解同一题，取多数 | 提升准确率 |

### 示例：主管-工人

```typescript
async function runTeam(goal: string) {
  // 1. Manager 拆解任务
  const plan = await manager.think(`请把以下目标拆成 3 个子任务：${goal}`);
  const subtasks = JSON.parse(plan).subtasks;

  // 2. 并行分发给 Worker
  const results = await Promise.all(
    subtasks.map(task => worker.execute(task))
  );

  // 3. Manager 汇总
  const final = await manager.think(`基于以下子结果给出最终答案：${JSON.stringify(results)}`);
  return final;
}
```

## 框架选型

| 框架 | 语言 | 特点 | 适用 |
|------|------|------|------|
| **LangGraph** | Python | 状态机、可视化 | 复杂工作流 |
| **LlamaIndex** | Python | RAG 友好 | 知识型 Agent |
| **AutoGen** | Python | 多 Agent 对话 | 协作场景 |
| **CrewAI** | Python | 角色扮演 | 任务委派 |
| **Vercel AI SDK** | TypeScript | 前端友好 | Web 应用 |
| **Mastra** | TypeScript | TS 原生、类型安全 | 全栈项目 |

## 工程化要点

### 1. 安全边界

- **权限最小化**：工具只暴露必要能力。
- **沙箱执行**：代码执行用 Docker/WASM 隔离。
- **人工审批**：高风险操作（发邮件、删数据）需人工确认。
- **速率限制**：防止单次任务消耗过多资源。

### 2. 可控性

- **最大步数**：避免无限循环。
- **超时**：单步和整体都要有超时。
- **检查点**：长流程中间状态持久化，可恢复。
- **人工介入**：关键节点支持暂停等待人类确认。

### 3. 可观测性

- **执行轨迹**：记录每一步的 Thought、Action、Observation。
- **Token 消耗**：按 Agent、按工具统计。
- **成功率**：按任务类型统计完成率。
- **失败分析**：失败时回放完整轨迹。

### 4. 评估

| 维度 | 指标 |
|------|------|
| **任务完成率** | 达成目标的比例 |
| **效率** | 平均步数、平均耗时 |
| **工具使用** | 工具调用准确率、冗余调用率 |
| **成本** | 平均 Token 消耗 |

## 常见陷阱

| 陷阱 | 表现 | 应对 |
|------|------|------|
| **循环调用** | 反复调用同一工具 | 检测重复，强制终止 |
| **工具幻觉** | 调用不存在的工具或编造参数 | 严格 schema 校验 |
| **上下文爆炸** | 工具结果太长撑爆上下文 | 结果摘要 + 历史裁剪 |
| **目标漂移** | 越执行越偏离原目标 | 每步对照目标检查 |
| **过度规划** | 一直在规划不行动 | 限制规划步数 |

## 相关条目

- [AI 编程基础概念](../ai-programming-basics)
- [MCP 与 Skill 使用指南](../mcp-skill-guide)
- [上下文工程](../context-engineering)
- [LLM 评估与可观测性](../llm-evaluation-observability)
- [LLM API 集成实践](../llm-api-integration)
- [什么是 RAG](../what-is-rag)
