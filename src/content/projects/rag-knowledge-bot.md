---
title: 知识库问答机器人
description: 基于 RAG 的私有知识库问答系统，支持文档导入、语义检索与带引用的回答。
tags: [RAG, 问答]
tech: [Python, LLM, RAG, Vector DB]
repo: https://github.com/yourname/rag-bot
featured: true
date: 2026-03-12
---

## 项目简介

把任意文档变成一个能"对答如流"的助手。用户上传资料后，系统自动切片、向量化并建立索引，提问时检索最相关片段并生成带出处的答案。

## 工作流程

1. 文档解析与分块（chunking）
2. Embedding 向量化并写入向量库
3. 查询时语义检索 Top-K 片段
4. 拼接上下文，交由 LLM 生成带引用的回答

> 这是一段示例内容，替换为你的真实项目即可。
