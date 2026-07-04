import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 项目作品（手动维护的精选卡片）
const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    cover: z.string().optional(),
    tags: z.array(z.string()).default([]),
    tech: z.array(z.string()).default([]),
    repo: z.string().url().optional(),
    demo: z.string().url().optional(),
    featured: z.boolean().default(false),
    date: z.coerce.date(),
  }),
});

// 文章
const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

// 知识库
const kb = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/kb' }),
  schema: z.object({
    title: z.string(),
    summary: z.string().optional(),
    category: z.string().default('未分类'),
    tags: z.array(z.string()).default([]),
    updated: z.coerce.date(),
  }),
});

// 工具指南
const tools = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/tools' }),
  schema: z.object({
    title: z.string(),
    summary: z.string().optional(),
    category: z.string().default('未分类'),
    tags: z.array(z.string()).default([]),
    vendor: z.string().optional(),
    pricing: z.string().optional(),
    official: z.string().url().optional(),
    updated: z.coerce.date(),
  }),
});

export const collections = { projects, posts, kb, tools };
