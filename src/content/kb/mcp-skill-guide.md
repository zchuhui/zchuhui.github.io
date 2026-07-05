---
title: MCP 与 Skill 使用指南
summary: 理解 MCP、工具调用和 Skill 的边界，学会把外部系统和可复用经验接入 Agent。
category: 应用范式
difficulty: 进阶
tags: [MCP, Skill, Agent, 工具调用]
created: 2026-07-05
updated: 2026-07-05
---

## 一句话区分

MCP 是“接工具和数据”的协议，Skill 是“沉淀做事方法”的说明书。

| 概念 | 解决什么问题 | 例子 |
|------|------|------|
| Tool Calling | 模型调用一个函数 | `search_docs(query)` |
| MCP | 标准化暴露工具、资源、Prompt | GitHub MCP、Postgres MCP |
| Skill | 告诉 Agent 如何完成某类任务 | “如何排版公众号文章” |

## MCP 适合什么

MCP（Model Context Protocol）适合把外部能力接给 Agent：

- 数据库查询
- GitHub Issue / PR
- 文件系统
- 内部业务 API
- 浏览器自动化
- 知识库检索
- 任务系统

它的价值是标准化：不同 Agent 可以用相似方式发现工具、读取资源、调用能力。

## Skill 适合什么

Skill 适合沉淀经验和流程：

- 固定的写作格式
- 某类代码审查清单
- 项目启动流程
- 数据分析步骤
- 文件转换规范
- 业务术语解释

Skill 不一定提供外部工具。它更像“操作手册 + 示例 + 可复用脚本”。

## 什么时候用 MCP，什么时候用 Skill

| 场景 | 选择 |
|------|------|
| 需要查数据库 | MCP |
| 需要调用内部 API | MCP |
| 需要固定写作风格 | Skill |
| 需要复用一套排查流程 | Skill |
| 需要先查数据再按流程写报告 | MCP + Skill |
| 只是一段提示词模板 | Skill 或项目规则 |

## MCP 的基本结构

一个 MCP Server 通常暴露三类能力：

| 类型 | 含义 |
|------|------|
| Tools | 可执行动作，如查询、写入、搜索 |
| Resources | 可读取资源，如文档、文件、数据库记录 |
| Prompts | 可复用提示模板 |

Agent 通过 MCP Client 连接 MCP Server，然后把可用工具暴露给模型。

```text
Agent / IDE / CLI
  ↓ MCP Client
MCP Server
  ├─ tools: search_issue, query_db
  ├─ resources: docs://handbook
  └─ prompts: review_pr
```

## Codex 中添加 MCP

添加 stdio MCP：

```bash
codex mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem .
```

添加 HTTP MCP：

```bash
codex mcp add seller --url https://example.com/mcp
```

HTTP Bearer Token：

```bash
export SELLER_MCP_TOKEN="..."
codex mcp add seller --url https://example.com/mcp --bearer-token-env-var SELLER_MCP_TOKEN
```

查看和删除：

```bash
codex mcp list
codex mcp get seller
codex mcp remove seller
```

如果 MCP 需要 OAuth：

```bash
codex mcp login seller
codex mcp logout seller
```

## MCP 设计原则

### 1. 工具要小而清晰

不要做一个万能工具：

```text
bad: execute_anything(input)
good: search_products(keyword, marketplace, limit)
```

工具越具体，模型越容易选对。

### 2. Schema 要严格

参数类型、必填字段、枚举值都要写清楚。不要把复杂 JSON 塞进一个 `text` 字段。

### 3. 返回要可控

工具结果不要无限长：

- 设置 limit
- 分页
- 摘要
- 只返回必要字段
- 大结果返回资源链接

### 4. 权限要最小化

数据库优先只读账号。GitHub token 只给必要 repo。生产写操作必须人工确认。

## Skill 的基本结构

一个好的 Skill 至少包含：

```text
触发场景：什么时候使用
输入要求：需要用户提供什么
操作步骤：按什么顺序做
质量标准：怎么判断做好了
常见错误：哪些坑要避免
示例输出：最终应该长什么样
```

## 写 Skill 的模板

```markdown
# Skill: PR Review

## 何时使用
当用户要求审查 PR 或 diff。

## 步骤
1. 先阅读变更文件列表
2. 优先找 bug、回归、测试缺口
3. 按严重程度排序
4. 每个问题给文件和行号

## 输出格式
- Findings
- Open Questions
- Test Gaps
```

## 常见错误

- **把 MCP 当数据库代理**：没有权限、审计、限流设计。
- **把 Skill 写成散文**：Agent 不知道何时用、怎么用。
- **工具太宽泛**：模型容易传错参数或做危险动作。
- **没有验证命令**：Agent 完成后无法证明结果。
- **把密钥写进配置示例**：应使用环境变量。

## 相关条目

- [Agent 智能体开发](../agent-development)
- [AI 编程环境搭建](../ai-dev-environment)
- [上下文工程](../context-engineering)
