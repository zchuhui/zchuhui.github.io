---
title: 向量数据库与嵌入
summary: 从 Embedding 原理到向量数据库选型，构建语义检索的底层基石。
category: AI 编程
tags: [向量, 嵌入, 数据库, 检索]
updated: 2026-07-05
---

## 什么是 Embedding

Embedding（嵌入）是把文本、图片等非结构化数据映射为固定维度的浮点向量，使语义相近的内容在向量空间中距离也相近。

```text
"如何重置密码" → [0.12, -0.34, 0.56, ..., 0.78]  (1536 维)
"忘记密码怎么办" → [0.11, -0.32, 0.55, ..., 0.77]  (语义相近，向量也相近)
"今天的天气" → [-0.45, 0.23, -0.11, ..., 0.02]  (语义不同，向量差异大)
```

## 相似度计算

| 度量 | 公式 | 特点 |
|------|------|------|
| **余弦相似度** | cos(a, b) | 最常用，关注方向 |
| **点积** | a · b | 归一化后等价于余弦 |
| **欧氏距离** | ‖a - b‖ | 关注绝对距离 |
| **L2 归一化点积** | 归一化后点积 | 主流向量库默认 |

## 主流 Embedding 模型

| 模型 | 维度 | 特点 | 适用 |
|------|------|------|------|
| OpenAI text-embedding-3-small | 1536 | 通用、便宜 | 海外项目 |
| OpenAI text-embedding-3-large | 3072 | 精度高 | 高质量需求 |
| BGE-M3 | 1024 | 开源、中英双语 | 国内项目、私有部署 |
| Cohere embed-v3 | 1024 | 多语言 | 海外 |
| Jina embeddings v3 | 1024 | 长文本友好 | 长文档检索 |

### 选型建议

- **国内/私有部署** → BGE-M3（开源、中文好）
- **海外 SaaS** → OpenAI text-embedding-3-small（性价比高）
- **极致质量** → OpenAI text-embedding-3-large 或 Cohere v3

## 向量数据库选型

| 数据库 | 类型 | 特点 | 适用规模 |
|--------|------|------|---------|
| **Chroma** | 嵌入式 | 轻量、零配置 | 原型、小规模 |
| **Qdrant** | 独立服务 | Rust 写、高性能 | 中大规模 |
| **Milvus** | 分布式 | 可水平扩展 | 大规模生产 |
| **pgvector** | PostgreSQL 扩展 | 与业务库共用 | 已有 PG 的项目 |
| **Pinecone** | 托管 SaaS | 全托管、省心 | 不想运维 |
| **Weaviate** | 独立服务 | 内置混合检索 | 多模态 |

### 决策树

```text
数据规模 < 10 万条？
├─ 是 → Chroma 或 pgvector
└─ 否
   ├─ 需要全托管？ → Pinecone
   └─ 自建
      ├─ 已有 PostgreSQL？ → pgvector
      ├─ 需要混合检索？ → Weaviate / Qdrant
      └─ 超大规模（亿级）？ → Milvus
```

## 实战示例

### Python + Chroma

```python
import chromadb

client = chromadb.PersistentClient(path="./vector_db")
collection = client.get_or_create_collection("docs")

# 入库
collection.add(
    ids=["1", "2"],
    documents=["如何重置密码", "忘记密码怎么办"],
    metadatas=[{"source": "faq.md"}, {"source": "faq.md"}],
)

# 检索
results = collection.query(
    query_texts=["密码忘了"],
    n_results=2,
)
```

### TypeScript + Qdrant

```typescript
import { QdrantClient } from '@qdrant/js-client-rest';

const client = new QdrantClient({ url: 'http://localhost:6333' });

await client.createCollection('docs', {
  vectors: { size: 1024, distance: 'Cosine' },
});

// 入库
await client.upsert('docs', {
  points: [
    { id: 1, vector: embedding1, payload: { text: '...', source: 'a.md' } },
  ],
});

// 检索
const results = await client.search('docs', {
  vector: queryEmbedding,
  limit: 5,
  filter: { must: [{ key: 'source', match: { value: 'a.md' } }] },
});
```

## 性能优化

### 索引算法

| 算法 | 原理 | 特点 |
|------|------|------|
| **HNSW** | 分层小世界图 | 查询快、内存高，主流选择 |
| **IVF** | 倒排文件 | 内存省、需训练 |
| **PQ** | 乘积量化 | 压缩向量、精度有损 |
| **HNSW + PQ** | 组合 | 平衡速度与内存 |

### 实战技巧

1. **批量入库**：单次请求 100-1000 条，避免逐条写入。
2. **异步 embedding**：先批量生成向量再入库，避免阻塞。
3. **过滤前置**：用 metadata filter 先缩小范围再向量搜索。
4. **分区集合**：按业务域分 collection，避免跨域噪声。
5. **缓存热点**：高频查询结果缓存。

## 常见问题

### Q: 向量维度怎么选？

维度越高表达力越强，但内存和计算成本也越高。1024 是性价比之选，3072 适合极致质量。

### Q: 为什么我的检索效果差？

- 检查 embedding 模型是否匹配语言（中文用 BGE，英文用 OpenAI）
- 检查分块策略是否合理
- 尝试混合检索（向量 + BM25）
- 加 Rerank

### Q: 数据更新怎么办？

- 增量：新数据直接 upsert
- 修改：按 id 删除旧向量，插入新的
- 删除：按 id 或 filter 删除

## 相关条目

- [什么是 RAG](../what-is-rag)
- [上下文工程](../context-engineering)
- [AI 编程基础概念](../ai-programming-basics)
- [LLM API 集成实践](../llm-api-integration)
