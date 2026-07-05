---
title: AI 编程环境搭建
summary: 从编辑器、终端 Agent、模型密钥、MCP 到项目规则，搭建一套可验证、可回滚的 AI 编程环境。
category: 工程实践
difficulty: 入门
tags: [开发环境, Codex, Cursor, MCP]
created: 2026-07-05
updated: 2026-07-05
---

## 环境目标

好的 AI 编程环境不是“装很多工具”，而是让 AI 能在受控边界内完成工作：

- 知道项目规范
- 能读取正确上下文
- 能修改文件并生成 diff
- 能运行测试和构建
- 不能随意触碰密钥、生产数据和危险命令
- 出错后容易回滚

## 基础工具栈

| 层级 | 推荐配置 | 作用 |
|------|------|------|
| 编辑器 | VS Code / Cursor / Trae | 日常补全、解释、局部改动 |
| 终端 Agent | Codex / Claude Code | 多文件改动、测试验证、代码审查 |
| 版本控制 | Git | diff、分支、回滚 |
| 运行时 | Node / Python / Go 等 | 跑测试、起服务 |
| 规则文件 | AGENTS.md / CLAUDE.md / .cursorrules | 固化项目约定 |
| MCP | GitHub / DB / 文档 / 内部 API | 扩展工具能力 |

## 第一步：准备 Git 边界

AI 改代码前，先保证工作区可回滚：

```bash
git status
git checkout -b codex/ai-task-demo
```

如果工作区已经有未提交改动，要先确认这些改动是谁的、是否和当前任务相关。不要让 AI 在混乱工作区里大范围改文件。

## 第二步：写项目规则

在项目根目录放 `AGENTS.md`，给终端 Agent 使用：

```markdown
# 项目规范

- 技术栈：Astro + Markdown Content Collections
- 内容放在 src/content
- 站内链接要适配 GitHub Pages base path
- 修改后必须运行 npm run build
- 不要改 dist 里的构建产物
```

规则文件要短、具体、可执行。不要写空泛价值观，要写“该做什么”和“不要做什么”。

## 第三步：配置模型密钥

不要把 API Key 写进 Prompt、Markdown 或代码。使用环境变量：

```bash
export OPENAI_API_KEY="..."
export ANTHROPIC_API_KEY="..."
```

更稳的做法是放在本机 shell 配置、项目 `.env.local` 或密钥管理服务里，并确保 `.gitignore` 已排除。

## 第四步：安装终端 Agent

以 Codex 为例：

```bash
npm install -g @openai/codex
codex --version
codex doctor
```

常用运行方式：

```bash
codex
codex exec "修复 npm run build 报错"
codex review
```

## 第五步：配置 MCP

MCP 用来把外部系统暴露给 Agent，例如 GitHub、数据库、文档、任务系统。

Codex 添加 stdio MCP：

```bash
codex mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem .
```

添加 HTTP MCP：

```bash
codex mcp add my-api --url https://example.com/mcp
```

带 Bearer Token 的 HTTP MCP：

```bash
export MY_MCP_TOKEN="..."
codex mcp add my-api --url https://example.com/mcp --bearer-token-env-var MY_MCP_TOKEN
```

验证：

```bash
codex mcp list
codex mcp get my-api
```

## 第六步：设定权限策略

按任务选择权限：

| 场景 | 建议 |
|------|------|
| 只读分析 | `--sandbox read-only` |
| 普通开发 | `--sandbox workspace-write` |
| 自动化脚本 | 临时分支 + 明确验证命令 |
| 高风险操作 | 人工确认，不交给 Agent 自动执行 |

危险动作包括：

- 删除文件
- 数据库写操作
- 生产部署
- 修改密钥和权限
- 大规模格式化

## 第七步：固定验证命令

每个项目都应该有一条“最小验证命令”：

```bash
npm run build
npm run test
npm run lint
```

把它写进 `AGENTS.md`，让 Agent 每次改完都知道怎么证明结果。

## 常见组合

### 个人开发者

```text
Cursor / Trae + Codex + Git + npm run build
```

适合个人项目、内容站、轻量 Web App。

### 工程团队

```text
GitHub Copilot + Codex/Claude Code + CI + 代码审查规范
```

适合多人协作和标准化研发流程。

### 自托管 Agent

```text
OpenClaw / Hermes + MCP + 低权限 token + 审计日志
```

适合长期任务和自动化中枢，但必须重视权限隔离。

## 相关条目

- [AI 编程工具与助手](../ai-coding-tools)
- [MCP 与 Skill 使用指南](../mcp-skill-guide)
- [AI 编程最佳实践](../ai-coding-best-practices)
