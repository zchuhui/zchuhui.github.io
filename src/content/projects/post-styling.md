---
title: WeChat Post Styler
description: 微信公众号文章排版工具，将 Markdown 一键转为内联 CSS 的精美 HTML，支持多主题与本地预览。
tags: [排版工具, 微信公众号]
tech: [Python, Markdown, CSS, Codex Skill]
repo: https://github.com/zchuhui/post-styling
featured: true
date: 2026-07-04
---

## 项目简介

WeChat Post Styler 是一个开源的 Codex skill，只需一条命令即可生成适用于微信公众号的精美文章排版。将 Markdown 或纯文本草稿转换为经过美化、移动端友好、内联 CSS 的 HTML，可直接复制到微信公众号编辑器使用。

## 核心能力

- **一键排版**：输入 Markdown 或纯文本，自动生成可直接用于公众号的 HTML 片段。
- **多主题切换**：内置 elegant、business、warm、tech 四种主题，满足不同内容场景。
- **Callout 提示框**：支持 `:::note`、`:::warning`、`:::danger` 等提示块，突出关键信息。
- **本地预览**：生成完整预览页面，浏览器中即可查看最终效果。
- **微信规范兼容**：仅使用内联 CSS，禁用 JavaScript 和外部字体，确保编辑器兼容。
- **纯 Python 标准库**：零外部依赖，开箱即用。

## 技术亮点

- 纯 Python 标准库实现，无需安装任何额外依赖。
- YAML 主题配置 + Jinja2 模板渲染，扩展主题只需添加配置文件。
- 支持 Codex skill 集成，一条指令即可完成排版，也可命令行独立使用。
