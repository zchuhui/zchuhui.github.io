---
title: ResumeCraft
description: 面向中文简历场景的 AI 简历排版与优化工具，支持结构化解析、岗位匹配优化与多模板导出。
tags: [AI简历, 工具]
tech: [React, Node.js, TypeScript, OpenAI, Puppeteer]
cover: /projects/resume-1.png
website: https://resume.dolfi.chat
featured: true
date: 2026-04-10
---

## 项目简介

![ResumeCraft 首页](/projects/resume-1.png)

ResumeCraft 是一个 AI 驱动的简历排版与优化工具。用户上传 PDF/Word 简历后，可以一键换用专业模板导出；填写目标岗位 JD 后，AI 还会进行结构化解析、关键词匹配与内容改写，再选择模板生成 PDF 或 Word。

地址：https://resume.dolfi.chat

## 核心能力

- **双模式制作**：不填 JD 只换排版，填写 JD 后按岗位优化内容。
- **文件解析**：支持 PDF、DOC、DOCX 上传，后端提取文本并 AI 结构化。
- **岗位优化**：根据 JD 改写简历内容，生成 ATS 关键词匹配报告。
- **15 套模板**：覆盖通用专业、正式权威、互联网科技、创意作品、学术教育、应届海投等场景。
- **导出能力**：后端 Puppeteer 渲染 PDF，保留可选文本与打印分页；同时支持 Word 导出。
- **SEO 体系**：公开页面独立标题/描述/Canonical/OG/结构化数据，指南页覆盖长尾关键词。
- **隐私友好**：数据不落库，上传文件内存处理后立即释放。

## 技术亮点

- 前端 Vite + React 18 + Zustand + Framer Motion，多页路由支持刷新与分享。
- 后端 Express + TypeScript，SSE 流式优化，Zod 校验 + 限流保障稳定性。
- AI 统一封装 OpenAI SDK 兼容接口，支持多模型切换与分任务配置。
- 静态生成 vite-react-ssg + 自动 sitemap，配合埋点与简易运营后台。
