// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// ⚠️ 部署前请修改下面两项以匹配你的 GitHub 仓库：
//   - 用户主页仓库 <用户名>.github.io  → site: 'https://<用户名>.github.io', base: '/'
//   - 普通项目仓库（如 myhome）       → site: 'https://<用户名>.github.io', base: '/myhome/'
const SITE = 'https://zchuhui.github.io';
const BASE = '/myhome/';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  base: BASE,
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: 'night-owl',
      wrap: true,
    },
  },
});
