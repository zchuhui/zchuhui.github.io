---
title: 什么是 RAG（检索增强生成）
summary: 让模型在回答前先"查资料"，从而更准确、可溯源、易更新。从原理到工程的完整指南。
category: AI 编程
tags: [RAG, 检索, 向量, 架构]
updated: 2026-07-05
---

## 一句话理解

RAG = 检索（Retrieval）+ 生成（Generation）。在让模型作答前，先从知识库里**检索**相关内容塞进上下文，再让模型基于这些证据**生成**回答。

## 为什么需要 RAG

LLM 自身存在三大局限，RAG 针对性解决：

| 局限 | 表现 | RAG 如何解决 |
|------|------|-------------|
| **知识截止** | 训练数据有截止日期，不知道新事件 | 实时检索最新文档 |
| **幻觉** | 一本正经地编造事实 | 基于检索到的事实生成，可溯源 |
| **领域私有** | 不懂企业内部文档、私有知识 | 把私有知识入库，无需重训模型 |

对比 Fine-tuning：

| 维度 | RAG | Fine-tuning |
|------|-----|-------------|
| 知识更新 | 改库即可，秒级 | 需重新训练，小时-天级 |
| 成本 | 低（仅推理时检索） | 高（训练 + 推理） |
| 可溯源 | ✅ 能给出处 | ❌ 知识内化在权重里 |
| 适合场景 | 事实型问答、文档检索 | 风格定制、领域术语 |

## 核心流程

```text
用户提问
  ↓
[ Query 改写 ]  扩展为多个子查询 / 加入对话上下文
  ↓
[ 检索 ]  向量检索 + 关键词检索（混合检索）
  ↓
[ 重排 ]  Cross-encoder 对 Top-K 精排
  ↓
[ 上下文拼接 ]  把片段塞入 Prompt
  ↓
[ 生成 ]  LLM 基于证据回答 + 引用
```

## 1. 文档处理

### 分块策略

分块决定了检索的精度，过大则噪声多，过小则语义不完整。

| 策略 | 说明 | 适用 |
|------|------|------|
| **固定长度** | 每 N 个字符切一刀 | 简单文档 |
| **按句子/段落** | 在自然边界切分 | 大多数场景 |
| **递归切分** | 先按段落，超长再按句子 | 长文档 |
| **语义切分** | 按语义相似度断句 | 高质量需求 |
| **按结构** | 按 Markdown 标题层级 | 技术文档 |

**经验值**：chunk size 500-1000 token，overlap 50-100 token。

### 元数据

每个 chunk 附带元数据，用于过滤和溯源：

```json
{
  "id": "chunk_001",
  "content": "...",
  "source": "handbook.pdf",
  "page": 12,
  "section": "第三章 薪酬制度",
  "updated_at": "2026-06-01"
}
```

## 2. 向量化与入库

```python
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
store = Chroma.from_documents(chunks, embeddings, persist_directory="./db")
```

选型参考 [向量数据库与嵌入](../vector-database-embeddings)。

## 3. 检索策略

### 纯向量检索

```python
results = store.similarity_search(query, k=4)
```

### 混合检索（推荐）

向量检索抓语义，关键词检索（BM25）抓精确匹配，两者融合效果最好。

```python
# 伪代码
vector_results = vector_store.search(query, k=10)
keyword_results = bm25_store.search(query, k=10)
merged = reciprocal_rank_fusion(vector_results, keyword_results, k=4)
```

### Query 改写

用户提问往往简短模糊，改写能提升召回率：

- **扩展**：把"怎么报销"扩展为"差旅费报销流程 发票要求 审批层级"。
- **多查询**：生成 3-5 个子查询并行检索，合并结果。
- **HyDE**：先让 LLM 假设一个答案，再用答案去检索（适合抽象问题）。

## 4. 重排（Rerank）

向量检索快但粗，Cross-encoder 精但慢。先粗排取 Top-20，再精排取 Top-4。

```python
from cohere import Client
co = Client()
reranked = co.rerank(query=query, documents=candidates, top_n=4)
```

## 5. 生成与引用

### Prompt 模板

```text
你是一名专业的知识助手。请基于以下检索到的资料回答用户问题。

要求：
1. 只使用资料中的信息，不要编造
2. 如果资料不足以回答，明确说明"现有资料无法回答"
3. 在关键论断后标注来源，格式：[来源: 文件名, 页码]

资料：
{retrieved_context}

用户问题：{query}
```

### 引用实现

让模型输出时标注 chunk id，前端按 id 渲染可点击引用：

```json
{
  "answer": "差旅费报销需要提供原始发票[1]，并由直属主管审批[2]。",
  "citations": [
    {"id": 1, "source": "财务制度.pdf", "page": 8},
    {"id": 2, "source": "财务制度.pdf", "page": 9}
  ]
}
```

## 评估指标

| 指标 | 含义 |
|------|------|
| **Recall@K** | Top-K 中是否包含正确文档 |
| **MRR** | 正确文档的排名倒数 |
| **Faithfulness** | 回答是否忠于检索内容（不幻觉） |
| **Answer Relevance** | 回答是否切题 |
| **Context Precision** | 检索内容中有用的比例 |

## 常见问题

### Q: 检索不到相关内容？

- 检查分块大小，可能切得太碎
- 尝试混合检索
- 用 Query 改写扩展查询

### Q: 模型不按资料回答？

- Prompt 中明确"只使用资料中的信息"
- 降低 temperature 到 0
- 检查资料是否真的被检索到

### Q: 检索结果太多噪声？

- 加 Rerank 精排
- 用元数据过滤（按 source、时间、分类）
- 减小 Top-K

## 工程化建议

1. **离线评估先行**：构建 50-100 条评测集，上线前对比基线。
2. **可观测**：记录每次检索的 query、命中片段、最终回答，便于复盘。
3. **增量更新**：文档变更时只重新 embedding 变更部分，避免全量重建。
4. **版本管理**：知识库带版本号，支持回滚。
5. **A/B 测试**：不同分块策略、不同模型对比效果。

## 相关条目

- [向量数据库与嵌入](../vector-database-embeddings)
- [上下文工程](../context-engineering)
- [LLM 评估与可观测性](../llm-evaluation-observability)
- [LLM API 集成实践](../llm-api-integration)
- [AI 编程基础概念](../ai-programming-basics)
