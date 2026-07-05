---
title: Hermes Agent 使用指南
summary: Nous Research 的自托管 Agent，强调长期记忆、技能沉淀和自我改进，适合持续型任务。
category: 自托管 Agent
difficulty: 高级
tags: [Hermes, Nous Research, 自托管, Agent, 记忆]
vendor: Nous Research
pricing: 开源免费 / 模型与部署自理
official: https://hermes-agent.nousresearch.com/docs/
created: 2026-07-05
updated: 2026-07-05
---

## 工具简介

Hermes Agent 是 Nous Research 推出的自托管 AI Agent。它的核心卖点不是“生成一段代码”，而是把任务执行、长期记忆、技能沉淀和多模型接入组合起来，让 Agent 在持续使用中积累你的偏好、工作流和可复用技能。

它更像一个可以部署在本机、VPS 或容器里的长期工作代理。你可以通过 CLI、桌面端、编辑器 ACP、MCP 和各种模型提供方来使用它。

## 核心功能

### 1. 长期记忆

Hermes 会保存会话、偏好和任务经验，用于后续任务的上下文恢复。适合长期跟进同一类工作，而不是一次性问答。

### 2. 技能学习

它强调从任务中沉淀技能：当某类操作反复出现，可以让 Agent 把步骤、命令和注意事项固化下来。

### 3. 多模型提供方

Hermes 支持通过 `hermes model` 配置不同模型来源，包括 Nous Portal、OpenAI Codex、GitHub Copilot、Anthropic、OpenRouter 以及多种 API Key 提供方。

### 4. MCP 集成

可以通过 MCP 连接 GitHub、数据库、任务系统、知识库和内部服务，让 Agent 访问真实工具，而不是只停留在文本建议。

### 5. 桌面端与 CLI

既可以用命令行运行，也可以安装 Hermes Desktop。对需要长期会话和本地可视化管理的人，桌面端更直观。

## 适用场景

- 持续型个人 Agent：长期记录偏好、任务和工作方式。
- 云端开发助理：部署到 VPS，让它在远程环境里处理任务。
- 多模型工作台：统一切换 Codex、Copilot、Anthropic、OpenRouter 等模型来源。
- 技能沉淀实验：把重复操作固化成可复用技能。
- 带记忆的自动化助手：结合 MCP，把业务系统和个人工作流串起来。

## 详细操作步骤

### 第 1 步：安装

macOS 或 Windows 用户可以优先使用 Hermes Desktop 安装器。只需要 CLI 的用户，可以运行官方安装脚本：

```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
```

Windows 原生命令行可使用 PowerShell：

```powershell
iex (irm https://hermes-agent.nousresearch.com/install.ps1)
```

安装后打开新终端，确认命令可用：

```bash
hermes version
```

### 第 2 步：配置模型

```bash
hermes model
```

这个向导会让你选择模型提供方并完成 OAuth 或 API Key 配置。不要把密钥写进 Prompt；通过 Hermes 的配置向导或环境文件管理。

### 第 3 步：启动会话

```bash
hermes chat
```

在会话里可以直接描述目标：

```text
帮我梳理这个仓库的主要模块，找出最适合接入 MCP 的三个地方。
```

### 第 4 步：配置 MCP

如果使用标准安装脚本，MCP 支持通常已经包含。你可以先列出和测试 MCP：

```bash
hermes mcp list
hermes mcp test github
```

如果是手工安装，按官方文档补装 MCP extra。

### 第 5 步：使用桌面端

```bash
hermes desktop
```

桌面端适合管理长会话、查看任务状态和日常使用。CLI 更适合脚本化和服务器环境。

## 实用技巧

### 1. 让它记住可复用流程

当 Hermes 完成一类重复任务后，明确要求它沉淀步骤：

```text
把这次排查流程总结成一个技能：
触发条件、需要检查的命令、常见错误、最后的验证方式。
```

### 2. 把模型按任务分层

简单整理用便宜模型，复杂推理用强模型，代码落地用你最信任的编程模型。不要所有任务都默认最贵模型。

### 3. 用 Profile 隔离身份

个人任务、客户项目、公司项目最好用不同 profile，避免记忆、密钥和上下文串在一起。

### 4. 给 MCP 工具做最小权限

数据库只给只读账号，GitHub token 只给必要 repo，任务系统只暴露需要的操作。Hermes 的长期记忆和工具调用能力越强，越要控制权限边界。

### 5. 定期清理和备份

长期 Agent 会积累会话、技能、配置和日志。定期备份 `~/.hermes`，也定期清理不再需要的记忆和工具。

## 注意事项

- **不要把它当无人值守员工**：长期记忆不等于稳定判断，高风险动作仍需人工确认。
- **模型来源复杂**：不同 provider 的模型名、上下文长度、计费和限额不同，配置时要记录清楚。
- **MCP 需要单独验证**：工具能发现不代表当前会话一定能使用，关键工具要用 `hermes mcp test` 和真实任务验证。
- **密钥隔离**：不要把个人 Copilot、Anthropic、OpenAI、GitHub token 混用在不可信项目里。
- **升级前备份**：自托管 Agent 迭代快，升级前保存配置和重要会话。

## 实战案例

### 案例 1：把排障流程变成技能

```text
阅读最近一次 CI 失败记录，定位失败原因。
修复前先列出验证命令；修复后把排查步骤沉淀成 skill。
```

### 案例 2：远程开发助理

```text
在这个 VPS 上检查 product-research-ai 的后台任务状态：
- 看服务是否运行
- 看最近 100 行日志
- 不要重启服务，除非我确认
```

### 案例 3：多模型对比

```text
同一个 bug，请分别用当前默认模型和 Copilot provider 分析，
只比较定位路径、风险判断和建议改动，不要直接改文件。
```

## 选型建议

如果你需要的是“在编辑器里快速写代码”，Hermes 不是第一选择。  
如果你需要的是“长期跟随你、记住流程、能沉淀技能、能部署到服务器”的 Agent，Hermes 值得单独评估。

## 相关条目

- [OpenClaw 使用指南](../openclaw)
- [Codex CLI 使用指南](../codex)
- [Agent 智能体开发](../../kb/agent-development)
