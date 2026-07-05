---
title: AI 编程最佳实践
summary: 从 Prompt 到工程化，系统总结 AI 编程的实战经验、质量保障与团队协作规范。
category: AI 编程
tags: [AI编程, 最佳实践, 工程化, 质量保障]
updated: 2026-07-05
---

## 核心原则

> AI 是协作者，不是替代者。人对最终代码负责。

三条铁律：

1. **理解每一行**：不要 Accept 不理解的代码。
2. **测试即护栏**：让 AI 写测试，用测试约束 AI。
3. **小步快跑**：拆小任务，每步可验证。

## Prompt 实战技巧

### 1. 上下文优先

AI 输出质量 80% 取决于上下文。给 AI 的上下文应该包含：

- **目标**：要解决什么问题
- **约束**：技术栈、风格、禁止项
- **相关代码**：当前文件、依赖模块、接口定义
- **示例**：类似的正确实现

```text
# 目标
为以下 Express 路由添加参数校验

# 约束
- 使用 Zod
- 错误响应统一用 { success: false, error: string }
- 不修改路由路径和 HTTP 方法

# 相关代码
{当前路由代码}
{统一错误处理中间件}
{已有的 Zod schema 示例}
```

### 2. 让 AI 先问问题

```text
任务：实现一个用户注册接口
要求：在开始写代码前，先列出你需要我澄清的问题（最多 5 个）。
```

### 3. 让 AI 解释决策

```text
请实现功能，并在代码后用 3 点说明：
1. 为什么选这个方案
2. 有什么权衡
3. 潜在风险
```

### 4. 分步生成

复杂功能不要一次生成，分步更可控：

```text
第一步：只生成数据模型和接口定义，不要实现。
（我确认后再继续）
第二步：实现核心逻辑，不要写测试。
第三步：基于实现写单元测试。
第四步：补全错误处理和边界情况。
```

## 代码质量保障

### 分层防御

```text
AI 生成代码
   ↓
[ 类型检查 ]  TypeScript / Mypy 拦截类型错误
   ↓
[ Lint ]  ESLint / Ruff 规范风格
   ↓
[ 单测 ]  AI 生成的测试 + 人工补充
   ↓
[ 集成测试 ]  端到端验证功能
   ↓
[ Code Review ]  人工审查逻辑、安全、性能
   ↓
合并
```

### 让 AI 写好测试

```text
为以下函数写单元测试，要求：
1. 覆盖正常路径、边界值、异常输入
2. 每个测试只验证一个行为
3. 测试命名用「should_xxx_when_xxx」格式
4. 用表驱动测试组织多组数据
5. 不要 mock 不存在的东西

{目标函数}
```

### Code Review 检查清单

对 AI 生成的代码，重点检查：

- [ ] 是否引入了不必要的依赖
- [ ] 错误处理是否完整（边界、异常、超时）
- [ ] 是否有硬编码的密钥或路径
- [ ] 是否有性能问题（N+1 查询、 unnecessary re-render）
- [ ] 是否符合项目既有风格
- [ ] 测试是否真的验证了功能（不是只测 happy path）
- [ ] 是否处理了空值、并发、重入
- [ ] 是否有安全漏洞（SQL 注入、XSS、路径穿越）

## 项目工程化

### 1. AI 上下文配置

为 AI 提供项目规范，让所有开发者用 AI 时行为一致。

**Cursor** — `.cursorrules`：
```markdown
- 技术栈：Go 1.25 + Gin + PostgreSQL + Redis
- 分层：api → service → model
- 错误统一用 pkg/response 返回
- 数据库操作用 GORM
- 注释用中文
```

**Claude Code** — `CLAUDE.md`：
```markdown
# 项目规范
- 测试框架：testify
- Lint：golangci-lint
- 提交前必须跑 make test
```

**Trae** — `.trae/documents/` 下放设计文档。

### 2. 模块化与上下文友好

AI 友好的代码也是人类友好的代码：

- **小文件**：单文件 < 300 行，AI 一次能读完
- **清晰接口**：函数签名自解释，少隐性依赖
- **纯函数**：副作用隔离，易于测试
- **目录约定**： predictable 的目录结构，AI 能猜到东西在哪

### 3. CI 集成

把 AI 辅助环节嵌入 CI：

```yaml
# .github/workflows/ai.yml
- name: AI Code Review
  if: github.event_name == 'pull_request'
  run: npx @ai-pr-reviewer review --pr ${{ github.event.number }}

- name: Auto-generate tests
  if: github.event_name == 'pull_request'
  run: npx ai-test-gen --diff ${{ github.event.before }}..${{ github.event.after }}
```

## 团队协作规范

### 可做

- ✅ 用 AI 生成模板代码、CRUD、数据转换
- ✅ 用 AI 写单元测试、文档、注释
- ✅ 用 AI 解释陌生代码、学习新框架
- ✅ 用 AI 做 Code Review 的初筛
- ✅ 把好用的 Prompt 沉淀到团队共享库

### 慎做

- ⚠️ 用 AI 处理涉及密钥、个人数据的代码
- ⚠️ 用 AI 实现核心业务逻辑（需更严格审查）
- ⚠️ 用 AI 改动数据库 schema
- ⚠️ 把整个代码库无过滤地发给云端模型

### 不可做

- ❌ 提交未审查的 AI 代码到主分支
- ❌ 把密钥、token 贴给 AI
- ❌ 把客户数据、隐私信息发给外部模型
- ❌ 在不了解的情况下引入 AI 建议的第三方依赖

## 成本优化

### Token 节省技巧

| 技巧 | 节省幅度 | 说明 |
|------|---------|------|
| 模型分级 | 50-80% | 简单任务用 mini，复杂用 pro |
| 上下文裁剪 | 30-50% | 只送相关片段 |
| 缓存 | 60-90% | 相同请求命中缓存 |
| 流式输出 | 0%（体验优化） | 首字快，可随时中断 |
| 批处理 | 50% | 离线任务用 Batch API |

### 成本监控

```typescript
// 每次调用记录成本
function logCost(model: string, usage: TokenUsage) {
  const price = PRICING[model]; // 元/1K token
  const cost = (usage.prompt_tokens * price.input
              + usage.completion_tokens * price.output) / 1000;
  metrics.increment('ai.cost', cost, { model, feature });
}
```

## 常见问题

### Q: AI 生成的代码总是不对怎么办？

- 检查上下文是否充分（贴相关代码、报错、预期）
- 拆小任务，避免一次要求太多
- 让 AI 先复述需求，确认理解一致
- 换更强的模型或更长的上下文

### Q: AI 代码引入了安全漏洞？

- 始终过 SAST 工具（Semgrep、CodeQL）
- 对外部输入做校验（不要相信 AI 会自觉做）
- 密钥、配置走环境变量，不硬编码

### Q: 团队对 AI 代码有抵触？

- 从非核心模块试点，用数据证明效果
- 建立明确的"AI 代码必须人工审查"规范
- 分享成功案例和踩坑经验
- 让抵触者参与 Review，逐步建立信任

### Q: 如何评估 AI 编程的投入产出？

- 度量 PR 合并速度、Bug 率、测试覆盖率
- 跟踪开发者满意度（NPS）
- 对比试点前后的交付吞吐量
- 计算 token 成本 vs 节省的人力成本

## 相关条目

- [AI 编程基础概念](../ai-programming-basics)
- [AI 编程工具与助手](../ai-coding-tools)
- [AI 编程环境搭建](../ai-dev-environment)
- [Prompt 工程完全指南](../prompt-engineering-basics)
- [LLM 评估与可观测性](../llm-evaluation-observability)
- [LLM API 集成实践](../llm-api-integration)
