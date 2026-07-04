---
title: LLM API 集成实践
summary: 从零集成 LLM API：流式响应、工具调用、错误处理、重试与降级的工程实践。
category: AI 编程
tags: [LLM, API, 集成, SSE]
updated: 2026-07-05
---

## 集成全景

一个生产级 LLM 应用通常包含以下层：

```text
用户请求
  ↓
[ 应用层 ]  参数校验、限流、鉴权
  ↓
[ 编排层 ]  Prompt 拼接、上下文管理、工具路由
  ↓
[ 调用层 ]  模型 API（OpenAI / Claude / 国产模型）
  ↓
[ 容错层 ]  重试、超时、降级、密钥轮换
  ↓
[ 可观测 ]  日志、Trace、Token 计量、成本统计
```

## 基础调用

### OpenAI 兼容接口

绝大多数国产模型（豆包、通义、DeepSeek、Kimi）都兼容 OpenAI SDK 格式，只需改 `baseURL` 和 `apiKey`。

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL, // 如 https://api.deepseek.com/v1
});

const res = await client.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: '你是一名资深工程师' },
    { role: 'user', content: '用 TypeScript 实现一个防抖函数' },
  ],
});
console.log(res.choices[0].message.content);
```

### Go 调用（官方 SDK）

```go
import openai "github.com/sashabaranov/go-openai"

client := openai.NewClient(os.Getenv("AI_API_KEY"))
resp, err := client.CreateChatMessage(ctx, openai.ChatMessageRequest{
    Model: openai.GPT4oMini,
    Messages: []openai.ChatMessage{
        {Role: openai.ChatMessageRoleSystem, Content: "你是助手"},
        {Role: openai.ChatMessageRoleUser, Content: "解释 RAG"},
    },
})
```

## 流式响应（SSE）

流式输出能显著改善首字延迟体验。前端用 `fetch` + `ReadableStream`，后端透传 SSE。

```typescript
const stream = await client.chat.completions.create({
  model: 'gpt-4o-mini',
  messages,
  stream: true, // 关键
});

for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content || '';
  process.stdout.write(delta); // 逐字输出
}
```

### 后端透传（Node.js Express）

```typescript
app.post('/api/chat/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const stream = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: req.body.messages,
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content || '';
    res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
  }
  res.write('data: [DONE]\n\n');
  res.end();
});
```

## 工具调用（Function Calling）

让模型调用外部函数，是 Agent 的基础能力。

```typescript
const tools = [{
  type: 'function',
  function: {
    name: 'get_weather',
    description: '查询某城市天气',
    parameters: {
      type: 'object',
      properties: {
        city: { type: 'string', description: '城市名' },
      },
      required: ['city'],
    },
  },
}];

const res = await client.chat.completions.create({
  model: 'gpt-4o-mini',
  messages,
  tools,
});

// 模型决定调用工具
if (res.choices[0].finish_reason === 'tool_calls') {
  const call = res.choices[0].message.tool_calls[0];
  const args = JSON.parse(call.function.arguments);
  const result = await getWeather(args.city);

  // 把工具结果回传给模型，让它继续生成
  messages.push(res.choices[0].message);
  messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(result) });
  const final = await client.chat.completions.create({ model, messages, tools });
}
```

## 错误处理与重试

生产环境必须处理的错误类型：

| 错误 | HTTP 状态码 | 处理策略 |
|------|------------|---------|
| 限流 | 429 | 指数退避重试 |
| 服务端错误 | 5xx | 重试 1-2 次 |
| 请求超时 | - | 缩短 prompt 或切换模型 |
| 上下文超限 | 400 | 截断历史或换长上下文模型 |
| 内容审核 | 400 | 提示用户修改输入 |

### 指数退避重试

```typescript
async function callWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (err.status === 429 || err.status >= 500) {
        const delay = Math.min(1000 * 2 ** i, 8000);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Max retries exceeded');
}
```

## 密钥轮换

多 Key 轮换避免单 Key 耗尽额度或被封禁。

```typescript
class KeyPool {
  private keys: string[];
  private idx = 0;
  constructor(keys: string[]) { this.keys = keys; }
  next() {
    const key = this.keys[this.idx % this.keys.length];
    this.idx++;
    return key;
  }
}
```

## 成本控制

### Token 估算

```text
1 token ≈ 4 个英文字符 ≈ 0.75 个英文单词
1 个汉字 ≈ 1-2 token（视模型和分词器）
```

### 优化策略

- **缓存**：相同请求结果缓存（按 prompt hash）。
- **模型分级**：简单任务用 mini，复杂任务用 pro。
- **上下文裁剪**：只送必要的历史轮次。
- **Streaming**：让用户尽早看到输出，减少 perceived latency。
- **批处理**：OpenAI Batch API 半价，适合离线任务。

## 可观测性

### 关键指标

- **延迟**：首字延迟（TTFT）、整体延迟、每 token 延迟。
- **质量**：用户反馈率、重试率、人工修正率。
- **成本**：每次调用 token 数、每日总成本、按功能分摊。
- **错误**：错误率、按错误类型分布。

### 日志规范

```json
{
  "request_id": "uuid",
  "model": "gpt-4o-mini",
  "prompt_tokens": 320,
  "completion_tokens": 180,
  "latency_ms": 1200,
  "status": "success",
  "feature": "chat"
}
```

## 相关条目

- [AI 编程基础概念](/kb/ai-programming-basics)
- [AI 编程最佳实践](/kb/ai-coding-best-practices)
- [Agent 智能体开发](/kb/agent-development)
