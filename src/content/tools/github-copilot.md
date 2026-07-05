---
title: GitHub Copilot 使用指南
summary: 老牌 AI 编程助手，深度集成 GitHub、VS Code、JetBrains 和 PR 工作流，适合团队标准化使用。
category: IDE 插件
tags: [Copilot, GitHub, IDE 插件]
vendor: GitHub / Microsoft
pricing: 免费起步 / Pro $10/月 / Business $19/月
official: https://github.com/features/copilot
updated: 2026-07-05
---

## 工具简介

GitHub Copilot 是最早大规模商用的 AI 编程助手之一。它以插件形式集成到 VS Code、JetBrains、Neovim 等主流编辑器，提供代码补全、对话、多文件改动、PR 摘要和评审辅助等能力。它最大的优势不是单点模型能力，而是和 GitHub 工作流、企业管理、权限与审计体系结合得深。

## 核心功能

### 1. 代码补全（Ghost Text）

边写边提示，按 Tab 接受。支持整行、整段、甚至整个函数的补全。

### 2. Copilot Chat

侧边栏对话，能 @ 文件、@ 工作区、@ 终端，理解项目上下文。

### 3. Copilot Edits

多文件改动模式（类似 Cursor Composer），描述需求后同时改动多个文件。

### 4. Copilot Agent

Agent 模式，能执行命令、跑测试、自主修复，目前预览中。

### 5. PR 评审

GitHub PR 页面自动生成变更摘要、提出审查意见，减轻 Review 负担。

### 6. Copilot CLI

终端里用 `gh copilot` 解释命令、生成 Shell 脚本。

## 适用场景

- 企业团队（合规、审计、IP 保护）
- 已深度使用 GitHub 生态的团队
- 多编辑器混用的开发者（VS Code + JetBrains）
- Code Review 自动化
- 学习新语言 / 新框架

## 详细操作步骤

### 第 1 步：订阅

访问 [github.com/features/copilot](https://github.com/features/copilot) 查看当前套餐。个人版适合独立开发者，Business / Enterprise 更适合需要组织管理、策略控制和审计的团队。

### 第 2 步：安装插件

**VS Code**：扩展商店搜索 "GitHub Copilot" 安装。

**JetBrains**：Settings → Plugins → 搜索安装。

登录 GitHub 账号授权即可。

### 第 3 步：配置 .github/copilot-instructions.md

在项目根目录创建指令文件，让 Copilot 遵循项目规范：

```markdown
# 项目规范

我们是一个 Go + Vue 3 的全栈项目。

代码风格：
- Go：遵循Effective Go，用 gofmt
- Vue：Composition API，<script setup>
- 注释用中文

禁止：
- 不要引入新依赖
- 不要用 any 类型
```

### 第 4 步：日常使用

| 操作 | 快捷键（VS Code） | 用途 |
|------|-------------------|------|
| 接受补全 | Tab | 接受 Ghost Text |
| 触发 Chat | ⌃⌘I | 侧边栏对话 |
| 触发 Edits | ⌃⌘I → Edits | 多文件改动 |
| 内联聊天 | ⌥⌘I | 选中代码后直接对话 |
| 解释代码 | 右键 → Copilot → Explain | 选中代码解释 |

### 第 5 步：用 Edits 做多文件改动

按 ⌃⌘I 切到 Edits 模式：

```text
把 src/api 下所有 fetch 调用改成 axios，
  统一错误处理，加请求拦截器注入 token。
```

Copilot 列出改动文件，逐个 diff 审查。

### 第 6 步：PR 评审

在 GitHub PR 页面，Copilot 自动生成：
- 变更摘要（改了什么、为什么）
- 风险点提示
- 建议修改

点击 "Apply suggestion" 一键采纳。

## 实用技巧

### 1. 用注释引导补全

```typescript
// 写一个防抖函数，延迟 300ms，支持立即执行选项
function debounce(
```

Copilot 会根据注释生成符合要求的实现。

### 2. 用 @workspace 让 AI 全局思考

```text
@workspace 这个项目的鉴权是怎么实现的？画一下流程。
```

Copilot 会扫描整个工作区给出答案。

### 3. 用 @terminal 解释报错

终端报错后：

```text
@terminal 解释这个错误，并给出修复方案。
```

Copilot 读取终端输出，直接给方案。

### 4. 用 Inline Chat 改选中代码

选中一段代码，按 ⌥⌘I：

```text
把这个循环改成 map + filter 链式调用
```

Copilot 直接替换选中代码。

### 5. 用 copilot-instructions.md 控制风格

把团队规范写进去，所有 AI 操作都会遵循，比每次对话重复说高效。

### 6. 用 gh copilot 在终端提问

```bash
gh copilot explain "awk '{print $2}' file.txt"
gh copilot suggest "找出占用 80 端口的进程"
```

## 注意事项

- **企业合规**：Business 版开启 IP 保障，代码不用于训练，适合企业。
- **配额限制**：Free 版有月度限额，重度使用建议升级 Pro。
- **模型选择**：可用模型会随套餐和地区变化，按任务复杂度切换，不要把具体模型名写进团队规范。
- **补全噪声**：有时会补全不相关代码，按 Esc 拒绝，不要盲目 Tab。
- **隐私**：免费版代码会发送到云端处理，敏感项目用 Business 版。
- **不要 Accept All**：多文件改动一定要 diff 审查。

## 实战案例

### 案例 1：用 Edits 把 Class 组件改 Hooks

需求：把 React 项目里所有类组件重构成函数组件。

```text
@workspace 把 src/components 下所有 class 组件改成函数组件，
  state 用 useState，副作用用 useEffect，
  保持 props 类型不变。
```

Copilot 列出 8 个待改文件，逐个 diff 审查。

### 案例 2：用 PR 评审加速 Code Review

提交 PR 后，Copilot 自动生成摘要：

```text
本次变更：新增用户注册接口
- 新增 auth/register.go
- 修改 router.go，添加 /register 路由
- 新增 register_test.go

风险点：
- register.go:42 密码未做强度校验
- 建议在 ValidatePassword 函数中加长度检查
```

点击 "Apply suggestion" 一键修复，节省 Review 时间。

### 案例 3：用 Inline Chat 学习新框架

打开一个 Astro 文件，选中不懂的部分：

```text
解释这段 Astro 代码，并告诉我 content collection 是什么概念。
```

Copilot 结合官方文档和项目代码给出解释，比单独查文档更高效。

## 相关条目

- [Cursor 使用指南](../cursor)
- [Trae 使用指南](../trae)
- [AI 编程工具与助手](../../kb/ai-coding-tools)
- [AI 编程最佳实践](../../kb/ai-coding-best-practices)
