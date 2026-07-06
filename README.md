# AI Builder 个人网站

> 深空科技 / 玻璃拟态风格的个人站点，用于塑造 **AI Builder** 形象，承载自我介绍、项目作品、文章与知识库。基于 **Astro** 静态生成，一键部署到 **GitHub Pages**。

## ✨ 特性

- 🌌 **深空科技视觉**：深色渐变背景 + Canvas 星空粒子（带鼠标视差）+ 毛玻璃卡片 + 渐变光晕
- ⚡ **纯静态**：零运行时框架开销，加载快，直接挂 GitHub Pages
- 📝 **Markdown 内容**：文章 / 知识库 / 项目都用 `.md` 管理，新增内容 = 新建一个文件
- 🎬 **炫酷动效**：标题打字效果、头像呼吸光环、卡片悬浮流光、滚动揭示（均支持 `prefers-reduced-motion` 降级）
- 🔎 **SEO 就绪**：站点地图、博客 RSS、Open Graph 分享卡片

## 🚀 快速开始

```bash
npm install      # 安装依赖（已完成）
npm run dev      # 本地开发，访问 http://localhost:4321
npm run build    # 构建到 dist/
npm run preview  # 预览构建产物
```

## 🎨 如何定制（按需修改）

| 想改什么 | 改哪里 |
|----------|--------|
| 名字 / 标语 / 邮箱 / 头像 / 社交链接 | [`src/consts.ts`](src/consts.ts) |
| 首页轮播角色、技术栈标签 | [`src/consts.ts`](src/consts.ts)（`ROLES` / `TECH`） |
| 配色 / 字体 / 玻璃与光晕效果 | [`src/styles/global.css`](src/styles/global.css)（`@theme` token） |
| 头像 / 分享图 / 站点图标 | 替换 `public/avatar.svg`、`public/og.svg`、`public/favicon.svg` |
| 关于页的经历时间线、技能 | [`src/pages/about.astro`](src/pages/about.astro) 顶部数组 |

### 添加内容

直接在对应目录新建 `.md` 文件并填写 frontmatter：

- **项目**：`src/content/projects/*.md` — `title, description, tech[], tags[], repo?, demo?, cover?, featured, date`
- **文章**：`src/content/posts/*.md` — `title, description, date, tags[], cover?, draft?`
- **知识库**：`src/content/kb/*.md` — `title, summary?, category, tags[], updated`

> 封面图放进 `public/`，frontmatter 里写 `cover: /xxx.png` 即可（不填则用渐变占位）。
> 字段定义见 [`src/content.config.ts`](src/content.config.ts)。

## 📦 部署到 GitHub Pages

当前目标地址是 `https://zchuhui.github.io/`，需要使用 GitHub 用户主页仓库：

1. 在 GitHub 将仓库改名为 `zchuhui.github.io`，或新建 `zchuhui.github.io` 仓库后把本项目代码推过去。
2. 确认 `astro.config.mjs` 顶部保持：
   - `SITE='https://zchuhui.github.io'`
   - `BASE='/'`
3. 仓库 **Settings → Pages → Source** 选 **GitHub Actions**。
4. 把代码推到 `main` 分支。之后每次 `git push` 都会通过 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) 自动构建并发布。

如果仓库仍叫 `myhome`，GitHub Pages 默认地址仍会是 `https://zchuhui.github.io/myhome/`。

## 🗂 目录结构

```
src/
├─ consts.ts          # 站点全局配置（最常改）
├─ content.config.ts  # 内容集合 schema
├─ content/           # 项目 / 文章 / 知识库 的 .md
├─ components/        # Hero、StarField、各类卡片等
├─ layouts/           # BaseLayout（meta/SEO/背景/导航/页脚）
├─ pages/             # 路由页面
└─ styles/global.css  # 主题与设计 token
public/               # 静态资源（头像、og、favicon）
.github/workflows/    # GitHub Pages 自动部署
```

## ✅ 上线前清单

- [ ] 在 `src/consts.ts` 填好名字、标语、社交链接
- [ ] 替换 `public/avatar.svg` 为真实头像（可换成 `.png`，记得同步 `consts.ts` 的 `avatar`）
- [ ] 替换示例项目 / 文章 / 知识库为自己的内容
- [ ] 在 `astro.config.mjs` 设好 `SITE` 与 `BASE`
- [ ] 推送并在 GitHub 启用 Pages（Source 选 GitHub Actions）

---

技术栈：Astro · Tailwind CSS v4 · MDX · TypeScript
