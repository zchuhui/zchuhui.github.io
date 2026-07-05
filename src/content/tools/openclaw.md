---
title: OpenClaw 使用指南
summary: 本地优先的开源个人 AI 助手，通过消息渠道、技能和工具把 Agent 接到真实工作流里。
category: 自托管 Agent
difficulty: 高级
tags: [OpenClaw, 自托管, Agent, 自动化]
vendor: OpenClaw
pricing: 开源免费 / 模型与部署自理
official: https://openclaw.ai
created: 2026-07-05
updated: 2026-07-05
---

## 工具简介

OpenClaw 是一个本地优先的开源个人 AI 助手。它不是传统 IDE 插件，而是一个长期运行的 Agent Gateway：你把它部署在自己的电脑、服务器或工作机上，再通过 Telegram、Slack、Discord、WhatsApp、微信等消息渠道和它对话，让它调用浏览器、文件、Shell、日历、邮件、自动化脚本等工具。

它适合做“个人工作流中枢”，而不是单纯做代码补全。如果你的目标是让 AI 持续接收消息、定时执行任务、协调多个工具，OpenClaw 比 Cursor、Copilot 这类编辑器工具更贴近需求。

## 核心功能

### 1. Local-first Gateway

OpenClaw 的 Gateway 是控制平面，负责管理会话、渠道、工具、技能和事件。核心数据和权限更多掌握在你自己的设备或服务器上。

### 2. 多渠道入口

支持把同一个助手接入多种消息渠道。常见做法是用 Telegram 或 Slack 做个人命令入口，用 Discord/企业 IM 做团队入口。

### 3. 工具与技能系统

Agent 可以调用浏览器、Canvas、节点、Cron、会话和消息平台动作，也可以通过技能扩展固定工作流。

### 4. 多 Agent 路由

可以把不同渠道、账号或联系人路由到不同 Agent，分别绑定工作区和会话，避免个人任务、团队任务、自动化任务混在一起。

### 5. 常驻运行

通过 daemon 模式让 Gateway 常驻运行，适合做提醒、巡检、收件箱处理、PR 跟进、例行报告生成等任务。

## 适用场景

- 个人 AI 助理：从聊天工具里安排任务、查信息、生成草稿。
- 自动化中枢：把定时任务、脚本、Webhook 和 AI 判断串起来。
- 远程工作流控制：手机上发消息，让家里或服务器上的 Agent 执行操作。
- 多工具编排：把浏览器、文件、消息、日历、邮件和 MCP Server 接在一起。
- 实验性 Agent 平台：研究长期运行 Agent 的权限、记忆、技能和路由设计。

## 详细操作步骤

### 第 1 步：准备运行环境

官方推荐 Node 24，也支持较新的 Node 22 版本。先确认本机环境：

```bash
node --version
npm --version
```

### 第 2 步：安装 OpenClaw

```bash
npm install -g openclaw@latest
```

安装后检查：

```bash
openclaw --version
openclaw doctor
```

### 第 3 步：完成首次引导

```bash
openclaw onboard --install-daemon
```

这个命令会引导你配置 Gateway、工作区、渠道和技能，并把 Gateway 安装成常驻服务。

### 第 4 步：检查 Gateway

```bash
openclaw gateway status
```

如果要临时调试，可以停掉 daemon，改用前台模式：

```bash
openclaw gateway stop
openclaw gateway --port 18789 --verbose
```

### 第 5 步：发送第一条任务

```bash
openclaw agent --message "整理今天未完成的开发任务，按优先级列出下一步"
```

接入消息渠道后，也可以直接从 Telegram、Slack、Discord 等入口发消息。

## 实用技巧

### 1. 先从只读任务开始

第一周不要急着让它改文件、发邮件或执行生产命令。先让它做汇总、提醒、检索、草稿生成，观察输出稳定性。

### 2. 给不同场景拆 Agent

个人助理、代码助理、运营助理、巡检助理最好分开配置。这样权限、工作区、记忆和日志都更清楚。

### 3. 把危险动作放进确认流程

发邮件、删文件、改数据库、执行部署这类动作，都应该要求人工确认。OpenClaw 的价值是编排，不是跳过权限边界。

### 4. 用 Cron 做例行工作

适合做日报、周报、收件箱清理、依赖更新提醒、PR 状态巡检、监控告警汇总。

### 5. 和 MCP 配合

把 GitHub、Postgres、Notion、Todoist、内部 API 做成 MCP Server，再让 OpenClaw 统一调度，比把所有能力塞进一个脚本更可维护。

## 注意事项

- **权限风险**：默认主会话的工具可能直接运行在宿主机上，接入远程渠道前必须重新检查沙箱、白名单和 DM 策略。
- **渠道安全**：聊天消息是非可信输入，尤其是群聊、公开频道和转发消息，不要让它直接触发高权限动作。
- **运维成本**：常驻 Agent 需要日志、备份、升级、密钥轮换和异常恢复。
- **模型成本**：复杂自动化可能频繁调用大模型，要设置预算和使用记录。
- **稳定性预期**：它更适合可回滚、可审计的辅助工作，不适合无人监管地操作关键资产。

## 实战案例

### 案例 1：个人开发日报

每天晚上自动收集 GitHub PR、Issue、日历和本地提交记录，生成一份日报草稿：

```text
每天 20:30 汇总今天的 GitHub 活动、日历会议和 TODO，
按「完成 / 阻塞 / 明天计划」输出到 Slack 私信，不要自动发送到群。
```

### 案例 2：PR 跟进助手

```text
每 2 小时检查我负责的 PR：
- 有 CI 失败就汇总失败 job 和关键日志
- 有 review comment 就按文件分组
- 只发提醒，不自动 push 代码
```

### 案例 3：个人知识库入口

```text
当我在 Telegram 发「记录：」开头的消息时，
整理成一条结构化笔记，打上主题标签，
写入我的 Markdown 知识库，等待我确认后再提交。
```

## 选型建议

如果你主要是在 IDE 里写代码，优先用 Cursor、Copilot 或 Codex。  
如果你想要一个接入聊天渠道、常驻运行、能协调多个工具的个人 Agent，再考虑 OpenClaw。

## 相关条目

- [Hermes Agent 使用指南](../hermes-agent)
- [Codex CLI 使用指南](../codex)
- [Agent 智能体开发](../../kb/agent-development)
