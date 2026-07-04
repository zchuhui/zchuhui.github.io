---
title: Codex CLI 使用指南
summary: OpenAI 出品的开源终端 AI 编程助手，基于 GPT-5-codex，擅长多文件改动与自主执行。
category: 终端 Agent
tags: [Codex, OpenAI, 终端, Agent]
vendor: OpenAI
pricing: 免费开源
official: https://github.com/openai/codex
updated: 2026-07-05
---

## 工具简介

Codex CLI 是 OpenAI 在 2025 年开源的终端 AI 编程助手，搭载 `gpt-5-codex` 模型。它直接运行在你的终端里，能读取代码、执行命令、修改文件，以"Agent"的方式自主完成编程任务。你可以把它理解成"住在终端里的程序员"，给它一个目标，它会自己拆解步骤、写代码、跑测试、修 bug。

与 IDE 内嵌的 Copilot 不同，Codex 更像是一个**会动手**的助手——不只会补全代码，还会真的去改文件、跑命令。

## 核心功能

### 1. 自然语言编程

直接用中文/英文描述需求，Codex 自动理解并执行：

```bash
codex "把所有 console.log 替换成 logger.info，并保留原参数"
```

### 2. 多文件改动

Codex 能同时改动多个文件，理解跨文件的依赖关系。比如"把 UserService 类拆成 UserReader 和 UserWriter"，它会自动处理 import、类型引用。

### 3. 自主执行与验证

Codex 可以执行 Shell 命令（需你授权），跑测试、装依赖、起服务，并根据执行结果调整下一步动作。

### 4. 三种审批模式

| 模式 | 行为 | 适用场景 |
|------|------|---------|
| `suggest`（默认） | 只建议，不动手 | 不熟悉的代码库 |
| `auto-edit` | 自动改文件，不执行命令 | 信任代码改动 |
| `full-auto` | 改文件 + 执行命令 | 沙箱环境、CI |

### 5. 上下文感知

Codex 自动读取相关文件、目录结构、`AGENTS.md` 配置，理解项目约定。

## 适用场景

- 批量重构（重命名、提取函数、调整目录结构）
- 写测试用例并跑通
- 修 GitHub Issue（贴报错让它定位）
- 跨语言迁移（Python → TypeScript）
- 起脚手架（新建项目、配 CI、写 Dockerfile）

## 详细操作步骤

### 第 1 步：安装

需要 Node.js 22+。

```bash
npm install -g @openai/codex
```

验证安装：

```bash
codex --version
```

### 第 2 步：配置 API Key

```bash
export OPENAI_API_KEY="sk-..."
```

建议写入 `~/.zshrc` 持久化。也可以用 `codex login` 走 ChatGPT 账号登录（订阅用户）。

### 第 3 步：创建项目配置

在项目根目录新建 `AGENTS.md`，告诉 Codex 项目约定：

```markdown
# 项目规范

- 技术栈：Go 1.25 + Gin + PostgreSQL
- 分层：api → service → model
- 测试：testify
- 提交前必须跑 `make test`
```

### 第 4 步：首次使用

进入项目目录，启动交互模式：

```bash
codex
```

输入需求：

```text
> 给 internal/api/auth.go 添加基于 JWT 的登录接口，
  密码用 bcrypt 校验，Token 过期时间 24 小时，
  并写单元测试覆盖登录成功和密码错误两个场景。
```

Codex 会先列出计划，逐步执行，每一步都让你确认。

### 第 5 步：非交互模式（CI 友好）

```bash
codex --quiet --auto-edit "修复 make test 报错"
```

适合在 CI 里自动修复 Lint 或测试失败。

## 实用技巧

### 1. 用 `--model` 切换模型

```bash
codex --model gpt-5 "复杂任务"
codex --model gpt-5-mini "简单任务，省钱"
```

### 2. 限定工作目录

```bash
codex --cd ./src "重构这个目录下的所有 controller"
```

避免它读到不相关的文件。

### 3. 让它先解释再动手

```text
先列出你的修改计划，我确认后再开始改代码。
```

### 4. 用 `--full-auto` 跑批量任务

```bash
codex --full-auto "给所有 .go 文件加上版权头注释"
```

注意：务必在干净的 Git 工作区运行，方便回滚。

### 5. 配合 Git 使用

Codex 的每次改动都建议立即 `git diff` 检查，确认后 `git commit`。出问题就 `git checkout .` 回滚。

## 注意事项

- **密钥安全**：不要在 Codex 任务里贴 API Key、密码，它会进入模型上下文。
- **沙箱执行**：`full-auto` 模式建议在 Docker 或 VM 中运行，避免误删文件。
- **网络依赖**：需要稳定的网络访问 OpenAI API，国内用户需自备代理。
- **成本控制**：复杂任务可能消耗较多 token，建议用 `gpt-5-mini` 做简单任务。
- **代码审查**：Codex 的改动必须人工 review，不能直接合并到主分支。

## 实战案例

### 案例 1：批量给 Go API 加上请求 ID 中间件

需求：每个 HTTP 请求注入 `X-Request-ID`，日志带上这个 ID。

```bash
codex "新增一个 RequestID 中间件，从 X-Request-ID 头读取，
       没有就生成 UUID，写入 context 和响应头，
       并应用到 internal/api/router.go 的所有路由"
```

Codex 会自动创建 `middleware/request_id.go`、修改 `router.go`、写测试。

### 案例 2：修复一个 TypeError

把浏览器报错粘进来：

```bash
codex "修复这个报错：TypeError: Cannot read properties of undefined (reading 'map')
       at UserList.vue:42"
```

Codex 会读取 `UserList.vue`，定位到第 42 行，发现 `users` 可能为 undefined，加上可选链和默认值。

### 案例 3：把 Python 脚本改写成 Go

```bash
codex "把 scripts/seed_data.py 翻译成 Go，放到 cmd/seed/main.go，
       保持数据生成逻辑一致，用 GORM 写入 PostgreSQL"
```

Codex 会理解 Python 逻辑，生成对应的 Go 实现，并保持数据库表结构一致。

## 相关条目

- [Cursor 使用指南](/tools/cursor)
- [Claude Code 使用指南](/tools/claude-code)
- [AI 编程基础概念](/kb/ai-programming-basics)
