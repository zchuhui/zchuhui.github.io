---
title: Cursor 使用指南
summary: 基于 VS Code 的 AI 原生编辑器，Composer 多文件改动 + Tab 智能补全，目前最热门的 AI IDE。
category: AI 编辑器
tags: [Cursor, IDE, VS Code]
vendor: Anysphere
pricing: 免费起步 / Pro $20/月
official: https://cursor.com
updated: 2026-07-05
---

## 工具简介

Cursor 是基于 VS Code fork 的 AI 原生编辑器。它不是简单的"VS Code + AI 插件"，而是从底层把 AI 能力深度融入编辑体验——补全、对话、多文件改动、Agent 模式全部一体化。如果你已经熟悉 VS Code，迁移到 Cursor 几乎零成本。

## 核心功能

### 1. Tab 智能补全

不只是补全当前光标，还能根据上下文预测你的下一步操作（跳到下一行、修改另一个文件）。

### 2. Chat（⌘L）

侧边栏对话，可以 @ 文件、@ 函数、@ 代码库、@ 文档。AI 回答时自动引用相关代码位置。

### 3. Composer（⌘I）

多文件改动模式。描述一个需求，Cursor 会同时改动多个文件，并在 diff 视图集中展示。

### 4. Agent 模式

Composer 的高级模式，AI 能执行终端命令、跑测试、根据报错自动修复，适合复杂任务。

### 5. @codebase 全库检索

让 AI 基于整个代码库回答问题，自动构建索引，理解跨文件依赖。

### 6. .cursorrules 项目规则

在项目根目录放 `.cursorrules` 文件，定义代码风格、技术栈、禁止项，所有 AI 操作都会遵循。

## 适用场景

- 日常开发（补全、重构、调试）
- 学习新框架（让 AI 解释代码、写示例）
- 跨文件大改动（提取组件、调整目录结构）
- Code Review（让 AI 先审一遍）
- 写测试、写文档

## 详细操作步骤

### 第 1 步：安装

从 [cursor.com](https://cursor.com) 下载，支持 macOS / Windows / Linux。安装后会自动导入 VS Code 的扩展、设置、快捷键。

### 第 2 步：登录与模型选择

首次启动登录账号。在设置里选择模型：
- **GPT-5 / Claude Opus 4**：复杂任务
- **GPT-5-mini / Claude Haiku**：日常补全，省 quota

### 第 3 步：配置项目规则

在项目根目录创建 `.cursorrules`：

```markdown
你是一名资深 Go 工程师。

代码规范：
- 分层：api → service → model
- 错误统一用 pkg/response.ReturnError
- 数据库操作用 GORM
- 注释用中文

禁止：
- 不要引入新依赖
- 不要修改 internal/middleware 下的鉴权逻辑
```

### 第 4 步：日常使用三件套

| 操作 | 快捷键 | 用途 |
|------|--------|------|
| Chat | ⌘L | 提问、解释、@文件 |
| Composer | ⌘I | 多文件改动 |
| Tab 补全 | Tab | 接受补全 |

### 第 5 步：用 Composer 做复杂改动

按 ⌘I 打开 Composer，输入需求：

```text
把 src/components/UserList.vue 拆成三个文件：
- UserList.vue（容器）
- UserTable.vue（表格）
- UserFilter.vue（筛选器）

保持功能不变，props 和 emit 重新设计。
```

Cursor 会同时改动多个文件，你在 diff 视图逐一审查，点击 Accept 或 Reject。

### 第 6 步：Agent 模式

在 Composer 里切换到 Agent 模式（右上角开关），AI 能：
- 执行 `npm run test`
- 读报错自动修复
- 装缺失的依赖

## 实用技巧

### 1. 精准 @ 上下文

```text
@UserList.vue @user.ts 帮我把这个组件的类型从 any 改成精确类型
```

@ 得越精准，输出越可靠。

### 2. 用 @docs 引用外部文档

```text
@docs(astro) 帮我用 Astro 的 content collection 重写这个博客列表页
```

Cursor 会自动拉取 Astro 官方文档作为上下文。

### 3. 让 AI 先列计划

```text
先列出你的实现步骤，我确认后再开始写代码。
```

避免方向跑偏。

### 4. 用 .cursorrules 控制风格

把团队规范写进去，所有 AI 输出都会遵循，比每次对话重复说一遍高效。

### 5. 善用 Review 功能

选中一段代码，按 ⌘K 输入 `review this code`，AI 会指出潜在问题。

### 6. 用 Tab 跳转

Tab 补全不只是补字符，光标会跳到下一个建议位置，能大幅减少按键次数。

## 注意事项

- **Quota 限制**：免费版每月有高级模型请求次数限制，简单任务用 mini 模型。
- **隐私模式**：企业版可开启 Privacy Mode，代码不会被用于训练。
- **网络**：国内访问需代理，否则高级模型响应慢。
- **不要 Accept All**：多文件改动一定要逐个 diff 审查。
- **依赖管理**：AI 可能引入不必要的包，提交前检查 package.json。

## 实战案例

### 案例 1：把 React 类组件改写成 Hooks

需求：把一个 200 行的类组件 `UserDashboard` 重构成函数组件 + Hooks。

打开 Composer：

```text
@UserDashboard.vue 把这个类组件重构成函数组件，
  state 用 useState，副作用用 useEffect，
  保持所有功能不变，包括表单校验和数据请求。
```

Cursor 会一次性给出 5-6 个文件的改动，你逐个审查。

### 案例 2：让 AI 读懂遗留代码

打开一个 500 行的 `legacyAuth.js`，按 ⌘L：

```text
@legacyAuth.js 这个文件做了什么？画出主要流程，
  并指出哪里可能有 bug 或安全隐患。
```

Cursor 会输出流程图 + 风险点列表，比你自己读快 5 倍。

### 案例 3：一键写测试

选中 `utils/format.ts`，按 ⌘K：

```text
为这个文件的所有导出函数写单元测试，用 vitest，
  覆盖正常路径、边界值、异常输入，用表驱动测试。
```

Cursor 自动生成 `format.test.ts`，运行测试全部通过。

## 相关条目

- [Trae 使用指南](/tools/trae)
- [GitHub Copilot 使用指南](/tools/github-copilot)
- [AI 编程工具与助手](/kb/ai-coding-tools)
