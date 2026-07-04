---
title: TalkTrain AI
description: 基于 ICF MCC 标准的 AI 对话教练，支持文本与语音实时交互，帮助用户自主生成觉察与行动。
tags: [AI教练, 对话系统]
tech: [Go, Vue 3, OpenAI, PostgreSQL, Docker]
cover: /projects/image.png
website: https://www.dolfi.chat
featured: true
date: 2026-05-05
---

## 项目简介

![TalkTrain AI](/projects/image.png)

TalkTrain AI 是一个 AI 对话教练产品，核心角色"海豚教练"参照 ICF MCC（国际教练联盟大师级教练）能力标准设计，不替用户做决策，而是通过高质量提问帮助用户看见自己、澄清方向并自主设计行动。

## 核心能力

- **教练式对话**：基于 MCC 对齐的 Prompt 工程，一次只问一个有力量的问题，深度倾听用户语境。
- **语音实时交互**：对接火山引擎 Doubao Realtime S2S，支持 WebSocket 双向语音流，低延迟对话体验。
- **会话契约**：每轮对话与用户共创焦点与期望，尊重用户节奏与主权。
- **安全边界**：自动识别高风险场景（自伤、绝望等），触发安全引导而非继续教练流程。
- **教练画像**：用户可选择不同教练风格，系统动态调整对话策略。
- **管理后台**：数据分析、用户管理与运营仪表盘。

## 技术亮点

- 后端 Go + Gin，SSE 流式推送实现打字机效果，指数退避 + Key 轮换保障 OpenAI 调用稳定性。
- 前端 Vue 3 + TailwindCSS，场景化入口引导用户选择问题方向，分享卡片与数据埋点支撑运营增长。
- PostgreSQL + Redis 存储对话与用户数据，Docker Compose 一键部署。
