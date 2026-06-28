// ============ 站点全局配置（改这里即可） ============

export const SITE = {
  name: '庄楚辉',
  handle: 'AI Builder',
  title: '庄楚辉 · AI Builder',
  description: '一名 AI Builder —— 构建智能产品、分享思考与知识。',
  // 一句话标语（首页打字效果会用到）
  tagline: '把想法变成会思考的产品。',
  email: '943339564g@gmail.com',
  // 头像与社交分享图（放到 public/ 下，换成你自己的即可；建议 og 用 1200×630 的 .png）
  avatar: '/avatar.jpg',
  ogImage: '/og.svg',
};

// 导航
export const NAV = [
  { label: '首页', href: '/' },
  { label: '关于', href: '/about' },
  { label: '项目', href: '/projects' },
  { label: '文章', href: '/blog' },
  { label: '知识库', href: '/kb' },
];

// 社交链接（替换为你自己的）
export const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com/zchuhui' },
  { label: 'X', href: 'https://x.com/yourname' },
  { label: 'Email', href: 'mailto:943339564g@gmail.com' },
];

// 首页 Hero 轮播标语
export const ROLES = ['AI Builder', 'LLM 应用开发者', 'Agent 设计师', '独立产品创造者'];

// 技术栈展示
export const TECH = [
  'Python', 'TypeScript', 'LLM', 'RAG', 'Agents',
  'LangChain', 'PyTorch', 'React', 'Astro', 'Vector DB',
  'Prompt Eng.', 'MCP',
];
