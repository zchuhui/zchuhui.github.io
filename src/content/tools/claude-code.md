---
title: Claude Code 使用指南
summary: Anthropic 官方终端 Agent，200K 长上下文 + 强工具调用，复杂任务利器。
category: 终端 Agent
tags: [Claude, Anthropic, 终端, Agent]
vendor: Anthropic
pricing: 订阅制 / API 计费
official: https://www.anthropic.com/claude-code
updated: 2026-07-05
---

## 工具简介

Claude Code 是 Anthropic 官方推出的终端 AI 编程助手，基于 Claude Opus 4 / Sonnet 4 模型。它以 Agent 形式运行在终端，能读写文件、执行命令、调用工具，擅长处理需要长上下文和复杂推理的编程任务。如果你面对的是"跨几十个文件的大重构"或"需要理解整个代码库才能做的事"，Claude Code 是目前最强的选择之一。

## 核心功能

### 1. 超长上下文（200K Token）

能一次塞入整个中型项目的代码，理解跨文件依赖，不会"只见树木不见森林"。

### 2. 强大的 Tool Use

原生支持函数调用，能定义任意工具（读文件、跑命令、调 API），让 Claude 自主决定何时调用。

### 3. 多步推理（ReAct）

面对复杂任务，Claude 会先思考、再行动、观察结果、再调整，循环直到完成。

### 4. 项目记忆（CLAUDE.md）

读取项目根目录的 `CLAUDE.md` 作为持久化指令，理解项目规范、架构、约定。

### 5. MCP 集成

支持 Model Context Protocol，可连接数据库、API、内部工具，扩展能力边界。

## 适用场景

- 大规模重构（跨几十个文件的改动）
- 复杂 bug 定位（需要理解整个调用链）
- 架构设计与方案对比
- 代码库文档生成
- 把需求文档转成可运行代码

## 详细操作步骤

### 第 1 步：安装

```bash
npm install -g @anthropic-ai/claude-code
```

### 第 2 步：登录

```bash
claude
```

首次运行会引导登录 Anthropic 账号（订阅 Claude Pro/Max）或配置 API Key。

### 第 3 步：创建项目记忆

在项目根目录新建 `CLAUDE.md`：

```markdown
# 项目：TalkTrain AI

## 技术栈
- 后端：Go 1.25 + Gin + GORM + PostgreSQL
- 前端：Vue 3 + TypeScript + Tailwind

## 目录结构
- backend/internal/api：HTTP 路由
- backend/internal/service：业务逻辑
- backend/internal/model：数据模型

## 规范
- 错误统一用 pkg/response 返回
- 提交前跑 make test
- 注释用中文
```

### 第 4 步：交互模式

```bash
claude
```

进入交互式对话：

```text
> 分析 backend/internal/api/chat.go 的 SendMessage 函数，
  找出所有可能的并发安全问题，并给出修复方案。
```

Claude 会读取相关文件、分析代码、给出方案，确认后直接修改。

### 第 5 步：非交互模式

```bash
claude -p "修复 make test 报错" --allowedTools "Bash,Edit"
```

适合 CI 自动化。

### 第 6 步：使用 MCP 扩展能力

在 `.claude/mcp.json` 配置外部工具：

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": { "DATABASE_URL": "postgresql://..." }
    }
  }
}
```

配置后 Claude 能直接查询数据库。

## 实用技巧

### 1. 用 `--allowedTools` 控制权限

```bash
claude --allowedTools "Read,Write" "只读分析，不改代码"
```

只允许读和写，不允许执行命令。

### 2. 用 subagent 处理子任务

```text
用 subagent 搜索所有调用 SendMessage 的地方，
  然后告诉我哪些地方传了空 user。
```

Claude 会启动子任务并行搜索，不污染主对话上下文。

### 3. 让 Claude 写 TODO

```text
把以下任务拆成 5 个子任务，写到 TODO.md，
  然后逐个执行，每完成一个就在 TODO.md 打勾。
```

适合管理多步骤任务。

### 4. 用 `--continue` 继续上次对话

```bash
claude --continue
```

恢复上次的上下文，继续未完成的任务。

### 5. 用 /cost 查看消耗

```text
/cost
```

实时查看本次会话的 token 消耗和费用估算。

### 6. 配合 Git Hook

在 `.git/hooks/pre-commit` 里调用 Claude 做代码审查：

```bash
#!/bin/sh
claude -p "审查本次提交的代码，指出问题" --allowedTools "Read,Bash"
```

## 注意事项

- **成本较高**：200K 上下文 + Opus 模型单次任务可能消耗数美元，简单任务用 Sonnet。
- **网络要求**：需稳定访问 Anthropic API，国内需代理。
- **权限边界**：`allowedTools` 务必按需配置，避免误删文件。
- **CLAUDE.md 维护**：项目规范变更后及时更新，否则 Claude 会按旧规范操作。
- **敏感数据**：不要把密钥、客户数据贴进对话。

## 实战案例

### 案例 1：跨 30 个文件的 API 重构

需求：把所有 `ctx.JSON(...)` 的直接返回改成统一的 `response.Success(ctx, data)`。

```bash
claude
> 把 backend/internal/api 下所有 handler 的直接 ctx.JSON 返回，
  改成用 pkg/response.Success / response.Error 包装，
  保持 HTTP 状态码和响应体结构不变。
```

Claude 会扫描所有 handler，列出改动计划，逐文件修改，最后跑测试验证。

### 案例 2：复杂 bug 定位

```text
生产环境偶发 500 报错，日志只有 "nil pointer dereference"。
阅读 backend/internal/service/chat.go 和它调用的所有 model，
找出哪里可能解引用了 nil 指针，给出修复方案。
```

Claude 会顺着调用链分析 5-6 个文件，定位到 `session.User` 可能为 nil 的情况。

### 案例 3：从需求文档生成功能

把 PRD 文档贴进来：

```text
根据 docs/voice-chat-prd.md 实现语音聊天功能，
  后端用 WebSocket，前端用 WebRTC，
  分成 3 个 PR 提交：协议、后端、前端。
```

Claude 会按 PRD 拆解任务，逐个 PR 实现，每个 PR 都跑测试。

## 相关条目

- [Codex CLI 使用指南](/tools/codex)
- [Agent 智能体开发](/kb/agent-development)
- [AI 编程工具与助手](/kb/ai-coding-tools)
